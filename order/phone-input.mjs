// Autofill may supply spaces, brackets, dashes or +254. Normalize only recognized
// Kenyan mobile numbers; never salvage letters or an overlong/foreign number.
export function localPhone(value) {
  const text = String(value || '').trim();
  if (!/^\+?[\d\s()-]+$/.test(text)) return '';
  const compact = text.replace(/[\s()-]/g, '');
  const local = compact.replace(/^\+?254/, '0');
  return /^0[17]\d{8}$/.test(local) ? local : '';
}
