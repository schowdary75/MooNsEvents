export function normalizeWhatsAppPhone(input: string | null | undefined): string | null {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  const hasCountryPrefix = raw.startsWith('+') || raw.startsWith('00');
  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('00')) digits = digits.slice(2);

  if (!hasCountryPrefix && digits.length === 10) digits = `91${digits}`;
  if (!hasCountryPrefix && digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.slice(1)}`;
  }

  if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
  return digits;
}

export function maskedWhatsAppPhone(input: string | null | undefined): string {
  const phone = normalizeWhatsAppPhone(input);
  if (!phone) return 'Invalid number';
  if (phone.length <= 6) return `+${phone}`;
  return `+${phone.slice(0, 2)} •••• ${phone.slice(-4)}`;
}
