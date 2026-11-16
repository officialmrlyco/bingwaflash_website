// Autofill may supply spaces, brackets, dashes, invisible bidi marks, or +254 / +2540.
// Normalize only recognized Kenyan mobile numbers; never salvage letters or a foreign number.
export function localPhone(value) {
  const text = String(value || '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .trim();
  if (!/^\+?[\d\s()-]+$/.test(text)) return '';
  const compact = text.replace(/[\s()-]/g, '');
  const local = compact.replace(/^\+?2540?([17]\d{8})$/, '0$1');
  return /^0[17]\d{8}$/.test(local) ? local : '';
}
