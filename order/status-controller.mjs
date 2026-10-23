// / Keep the public order receipt listener and its fallback reads scoped to one
// / checkout attempt so late callbacks cannot replace a newer customer result.
const TERMINAL_ORDER_STATUSES = new Set(["completed", "failed", "cancelled", "expired"]);
const FALLBACK_DELAYS_MS = [10_000, 20_000, 30_000, 60_000];
const FALLBACK_MAX_ATTEMPTS = 12;
const STATUS_TOKEN_PATTERN = /^[0-9a-f]{64}$/;

export function createOrderStatusToken(cryptoApi = globalThis.crypto) {
  if (!cryptoApi?.getRandomValues) {
    throw new Error("Secure payment status is unavailable in this browser. Please use an updated browser.");
  }
  const bytes = new Uint8Array(32);
  cryptoApi.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isTerminalOrderStatus(status) {
  return TERMINAL_ORDER_STATUSES.has(String(status || "").toLowerCase());
}

/**
 * One active attempt owns its Firestore listener and serialized recovery reads.
 * Firestore handles ordinary reconnects; REST checks begin only after a listener
 * error and use one recursive timeout, never an overlapping interval.
 */
export function createOrderStatusController({
  subscribe,
  fetchStatus,
  onStatus,
  onFallbackError = () => {},
  onFallbackStopped = () => {},
  schedule = setTimeout,
  cancelSchedule = clearTimeout,
}) {
  let active = null;
  let generation = 0;

  function isCurrent(attempt) {
    return active === attempt && attempt.generation === generation;
  }

  function stopResources(attempt) {
    if (attempt.unsubscribe) {
      attempt.unsubscribe();
      attempt.unsubscribe = null;
    }
    if (attempt.fallbackTimer !== null) {
      cancelSchedule(attempt.fallbackTimer);
      attempt.fallbackTimer = null;
    }
    if (attempt.expiryTimer !== null) {
      cancelSchedule(attempt.expiryTimer);
      attempt.expiryTimer = null;
    }
  }

  function armExpiryFallback(attempt) {
    if (!isCurrent(attempt) || attempt.terminal || attempt.suspended || attempt.hasSnapshot ||
        attempt.streamFailed || !attempt.txId || !attempt.statusExpiresAtMs || attempt.expiryTimer !== null) return;
    const delayMs = Math.max(0, attempt.statusExpiresAtMs - Date.now());
    attempt.expiryTimer = schedule(() => {
      attempt.expiryTimer = null;
      if (!isCurrent(attempt) || attempt.terminal || attempt.suspended || attempt.hasSnapshot) return;
      attempt.streamFailed = true;
      if (attempt.unsubscribe) {
        attempt.unsubscribe();
        attempt.unsubscribe = null;
      }
      scheduleFallback(attempt, 0);
    }, delayMs);
  }

  function deliver(attempt, data, source) {
    if (!isCurrent(attempt) || attempt.terminal || !data) return false;
    if (source === "start" && attempt.hasSnapshot) return false;
    const status = String(data.status || "").toLowerCase();
    if (source === "snapshot") attempt.hasSnapshot = true;
    onStatus(data, attempt, source);
    if (source === "snapshot" && attempt.expiryTimer !== null) {
      cancelSchedule(attempt.expiryTimer);
      attempt.expiryTimer = null;
    }
    if (isTerminalOrderStatus(status)) {
      attempt.terminal = true;
      attempt.suspended = false;
      stopResources(attempt);
    }
    return true;
  }

  function scheduleFallback(attempt, delayMs) {
    if (!isCurrent(attempt) || attempt.terminal || attempt.suspended || !attempt.txId ||
        !attempt.streamFailed || attempt.fallbackStopped || attempt.fallbackTimer !== null || attempt.fallbackInFlight) return;
    attempt.fallbackTimer = schedule(async () => {
      attempt.fallbackTimer = null;
      if (!isCurrent(attempt) || attempt.terminal || attempt.suspended || attempt.fallbackInFlight) return;
      attempt.fallbackInFlight = true;
      attempt.fallbackReads += 1;
      try {
        // / Send the bearer status ticket with legacy recovery reads so the backend can keep private orders closed.
        const data = await fetchStatus(attempt.txId, attempt.statusToken);
        deliver(attempt, data, "fallback");
      } catch (error) {
        if (isCurrent(attempt) && !attempt.terminal) {
          onFallbackError(error, attempt);
          if (Number(error?.httpStatus) === 410) stopFallback(attempt, "expired");
        }
      } finally {
        attempt.fallbackInFlight = false;
        if (isCurrent(attempt) && !attempt.terminal && attempt.streamFailed && !attempt.fallbackStopped) {
          if (attempt.fallbackReads >= FALLBACK_MAX_ATTEMPTS) {
            stopFallback(attempt, "exhausted");
            return;
          }
          const delayIndex = Math.min(attempt.fallbackAttempt++, FALLBACK_DELAYS_MS.length - 1);
          scheduleFallback(attempt, FALLBACK_DELAYS_MS[delayIndex]);
        }
      }
    }, delayMs);
  }

  function stopFallback(attempt, reason) {
    if (!isCurrent(attempt) || attempt.terminal || attempt.fallbackStopped) return;
    attempt.fallbackStopped = true;
    attempt.fallbackStopReason = reason;
    onFallbackStopped(attempt, reason);
  }

  function connect(attempt) {
    if (!isCurrent(attempt) || attempt.terminal || attempt.suspended ||
        !STATUS_TOKEN_PATTERN.test(attempt.statusToken) || attempt.unsubscribe) return;
    try {
      attempt.unsubscribe = subscribe(attempt.statusToken, (snapshot) => {
        if (!isCurrent(attempt) || attempt.terminal) return;
        if (!snapshot?.exists) {
          // / If a previously visible projection expires, recover through the
          // / private status endpoint while the receipt token is still active.
          if (attempt.hasSnapshot) {
            attempt.streamFailed = true;
            if (attempt.unsubscribe) {
              attempt.unsubscribe();
              attempt.unsubscribe = null;
            }
            scheduleFallback(attempt, 0);
          }
          return;
        }
        deliver(attempt, snapshot.data, "snapshot");
      }, (error) => {
        if (!isCurrent(attempt) || attempt.terminal) return;
        attempt.streamFailed = true;
        if (attempt.expiryTimer !== null) {
          cancelSchedule(attempt.expiryTimer);
          attempt.expiryTimer = null;
        }
        if (attempt.unsubscribe) {
          attempt.unsubscribe();
          attempt.unsubscribe = null;
        }
        onFallbackError(error, attempt);
        scheduleFallback(attempt, 0);
      });
    } catch (error) {
      attempt.streamFailed = true;
      if (attempt.expiryTimer !== null) {
        cancelSchedule(attempt.expiryTimer);
        attempt.expiryTimer = null;
      }
      onFallbackError(error, attempt);
      scheduleFallback(attempt, 0);
    }
  }

  function beginAttempt(statusToken) {
    generation += 1;
    if (active) stopResources(active);
    active = {
      generation,
      statusToken,
      txId: "",
      statusExpiresAtMs: 0,
      hasSnapshot: false,
      terminal: false,
      suspended: false,
      streamFailed: false,
      fallbackTimer: null,
      fallbackInFlight: false,
      fallbackAttempt: 0,
      fallbackReads: 0,
      fallbackStopped: false,
      fallbackStopReason: "",
      unsubscribe: null,
      expiryTimer: null,
    };
    return active;
  }

  function attach(attempt) {
    connect(attempt);
  }

  function applyStartResponse(attempt, response) {
    if (!isCurrent(attempt) || attempt.terminal) return false;
    const responseToken = String(response?.statusToken || "");
    if (responseToken && responseToken !== attempt.statusToken) {
      stopResources(attempt);
      if (STATUS_TOKEN_PATTERN.test(responseToken)) {
        attempt.statusToken = responseToken;
        attempt.streamFailed = false;
        connect(attempt);
      } else {
        attempt.streamFailed = true;
      }
    }
    attempt.txId = String(response?.txId || attempt.txId);
    attempt.statusExpiresAtMs = Number(response?.statusExpiresAtMs || attempt.statusExpiresAtMs) || 0;
    if (response?.status) deliver(attempt, response, "start");
    if (attempt.streamFailed) scheduleFallback(attempt, 0);
    else armExpiryFallback(attempt);
    return true;
  }

  function abandon(attempt = active) {
    if (!attempt || !isCurrent(attempt)) return false;
    stopResources(attempt);
    generation += 1;
    active = null;
    return true;
  }

  function suspend() {
    if (!active || active.terminal || active.suspended) return;
    active.suspended = true;
    stopResources(active);
  }

  function resume() {
    if (!active || active.terminal || !active.suspended) return;
    active.suspended = false;
    if (active.streamFailed) scheduleFallback(active, 0);
    else {
      connect(active);
      armExpiryFallback(active);
    }
  }

  return { beginAttempt, attach, applyStartResponse, abandon, suspend, resume, isCurrent };
}
