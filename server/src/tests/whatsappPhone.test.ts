import { describe, expect, it } from 'vitest';
import { maskedWhatsAppPhone, normalizeWhatsAppPhone } from '../services/whatsappPhone.js';

describe('normalizeWhatsAppPhone', () => {
  it.each([
    ['98765 43210', '919876543210'],
    ['09876543210', '919876543210'],
    ['+91 98765-43210', '919876543210'],
    ['0091 98765 43210', '919876543210'],
    ['+44 7700 900123', '447700900123'],
    ['919876543210', '919876543210'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeWhatsAppPhone(input)).toBe(expected);
  });

  it.each(['', '1234', '+0 12345678', 'not-a-phone', '1234567890123456'])(
    'rejects invalid recipient %s',
    (input) => {
      expect(normalizeWhatsAppPhone(input)).toBeNull();
    },
  );

  it('masks valid numbers without leaking the full value', () => {
    expect(maskedWhatsAppPhone('9876543210')).toBe('+91 •••• 3210');
    expect(maskedWhatsAppPhone('bad')).toBe('Invalid number');
  });
});
