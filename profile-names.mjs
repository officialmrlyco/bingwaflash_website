// Mirror the app/server policy at display time so old profiles and registration
// snapshots are readable immediately, without rewriting username document IDs.
export function cleanDisplayName(value, maxLength) {
  const clean = String(value || '').normalize('NFC')
    .replace(/[\uFE0E\uFE0F\u20E3]/gu, '')
    .replace(/[^\p{L}\p{M}\p{N} .,'&()\-]/gu, '')
    .replace(/ +/g, ' ').trim();
  return Array.from(clean).slice(0, maxLength).join('').trim();
}

export function cleanAgentProfile(profile) {
  const agentName = cleanDisplayName(profile.agentName, 10)
    || cleanDisplayName(profile.username, 10) || 'Agent';
  return { ...profile, agentName,
    businessName: cleanDisplayName(profile.businessName, 20) || agentName };
}
