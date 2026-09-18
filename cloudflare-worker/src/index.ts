/**
 * Serves the public Bingwa Flash site from Cloudflare Static Assets. Only
 * order/client documents enter this Worker so shared links can receive public
 * agent metadata; all other site files are served directly at the edge.
 */
interface Env {
  // Static Assets is the site source of truth at request time. GitHub is used
  // only to publish deployments and is never contacted by customer requests.
  ASSETS: Fetcher;
  // This is the same browser key used by the public storefront. Firestore
  // Rules restrict it to public data and private profiles stay inaccessible.
  FIREBASE_WEB_API_KEY: string;
}

interface FirestoreStringField {
  stringValue?: string;
}

interface FirestoreDocument {
  fields?: Record<string, FirestoreStringField>;
}

interface PublicBrand {
  businessName: string;
  avatarUrl: string;
}

const PLATFORM_IMAGE = "https://bingwaflash.co.ke/logo.png";
const PLATFORM_FAVICON = "/logo.png";
const SHARE_CACHE_SECONDS = 300;
const SHARE_CACHE_VERSION = "3";
const usernamePattern = /^[a-z0-9][a-z0-9._-]{2,29}$/;
const avatarPattern = /^https:\/\/avatars\.bingwaflash\.co\.ke\/avatars\/[A-Za-z0-9_-]{1,128}\/[0-9a-f-]{36}\.webp$/;

function readableText(value: unknown, maxLength: number): string {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function requestUsername(url: URL): string | null {
  const username = readableText(url.searchParams.get("u"), 30).toLowerCase();
  return usernamePattern.test(username) ? username : null;
}

function isShareDocument(pathname: string): boolean {
  return pathname === "/order" || pathname === "/order/" || pathname === "/order/index.html"
    || pathname === "/clients" || pathname === "/clients/" || pathname === "/clients/index.html";
}

async function publicBrand(username: string, env: Env): Promise<PublicBrand | null> {
  const endpoint = new URL(
    `https://firestore.googleapis.com/v1/projects/bingwa-flash/databases/(default)/documents/publicAgents/${encodeURIComponent(username)}`
  );
  endpoint.searchParams.set("key", env.FIREBASE_WEB_API_KEY);
  const response = await fetch(endpoint, { headers: { accept: "application/json" } });
  if (!response.ok) return null;

  const document = await response.json<FirestoreDocument>();
  const businessName = readableText(document.fields?.businessName?.stringValue, 80);
  if (!businessName) return null;
  const candidateAvatar = readableText(document.fields?.profileImageUrl?.stringValue, 512);
  return {
    businessName,
    avatarUrl: avatarPattern.test(candidateAvatar) ? candidateAvatar : ""
  };
}

function canonicalPublicUrl(request: Request): string {
  const url = new URL(request.url);
  url.search = "";
  const username = requestUsername(new URL(request.url));
  if (username) url.searchParams.set("u", username);
  return url.toString();
}

function cacheKey(request: Request): Request {
  // Ignore tracking parameters so a public share link has one bounded cache
  // entry instead of allowing marketing query strings to fragment the cache.
  const url = new URL(canonicalPublicUrl(request));
  url.searchParams.set("__share_cache", SHARE_CACHE_VERSION);
  return new Request(url, { method: "GET" });
}

function brandedHtml(response: Response, brand: PublicBrand, request: Request): Response {
  const pageKind = new URL(request.url).pathname.startsWith("/clients") ? "Client registration" : "Order offers";
  const title = `${brand.businessName} | Bingwa Flash`;
  const description = `${pageKind} with ${brand.businessName} on Bingwa Flash.`;
  const shareImage = brand.avatarUrl || PLATFORM_IMAGE;

  // Replace platform metadata in place so crawlers see exactly one title,
  // canonical URL, and image without changing the visible static page.
  return new HTMLRewriter()
    .on("title", { element: (element) => element.setInnerContent(title) })
    .on('meta[property="og:title"]', { element: (element) => element.setAttribute("content", title) })
    .on('meta[property="og:description"]', { element: (element) => element.setAttribute("content", description) })
    .on('meta[property="og:url"]', { element: (element) => element.setAttribute("content", canonicalPublicUrl(request)) })
    .on('meta[property="og:image"]', { element: (element) => element.setAttribute("content", shareImage) })
    .on('link[rel="canonical"]', { element: (element) => element.setAttribute("href", canonicalPublicUrl(request)) })
    .on("link#agent-favicon", {
      element: (element) => {
        element.setAttribute("href", brand.avatarUrl || PLATFORM_FAVICON);
        if (brand.avatarUrl) element.removeAttribute("type");
      }
    })
    .transform(response);
}

async function serve(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  // The asset binding resolves directory index pages and 404s using the same
  // routing rules as all normal public pages, with no GitHub API dependency.
  const staticResponse = await env.ASSETS.fetch(request);
  const url = new URL(request.url);
  const username = requestUsername(url);
  if (!staticResponse.ok || request.method === "HEAD" || !username) return staticResponse;

  const key = cacheKey(request);
  const cached = await caches.default.match(key);
  if (cached) return cached;

  try {
    const brand = await publicBrand(username, env);
    if (!brand) return staticResponse;
    const response = brandedHtml(staticResponse, brand, request);
    const headers = new Headers(response.headers);
    headers.set("cache-control", `public, max-age=0, s-maxage=${SHARE_CACHE_SECONDS}`);
    const cacheable = new Response(response.body, { status: response.status, headers });
    ctx.waitUntil(caches.default.put(key, cacheable.clone()));
    return cacheable;
  } catch (error) {
    // A metadata lookup failure must never make ordering or registration fail.
    console.error("Public share metadata lookup failed", error);
    return staticResponse;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }

    if (!isShareDocument(new URL(request.url).pathname)) {
      // Normal pages and their assets do not spend a Worker invocation.
      return env.ASSETS.fetch(request);
    }

    try {
      return await serve(request, env, ctx);
    } catch (error) {
      // Asset serving remains a safe fallback if unexpected Worker logic fails.
      console.error("Public site request failed", error);
      return env.ASSETS.fetch(request);
    }
  }
};
