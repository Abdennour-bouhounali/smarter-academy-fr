import { describe, expect, it } from 'vitest';
import { isValidPhone, normalizePhone, validateOrder } from './orderValidation';

describe('normalizePhone', () => {
  it('accepts the ways an Algerian mobile number is written', () => {
    expect(normalizePhone('05 55 12 34 56')).toBe('0555123456');
    expect(normalizePhone('0555-12.34.56')).toBe('0555123456');
    expect(normalizePhone('+213 555 12 34 56')).toBe('0555123456');
    expect(normalizePhone('00213555123456')).toBe('0555123456');
    expect(normalizePhone('٠٦٦٠ ١٢ ٣٤ ٥٦')).toBe('0660123456');
    expect(normalizePhone('555123456')).toBe('0555123456');
  });
});

describe('isValidPhone — same rule as the server', () => {
  it.each(['0555123456', '0661 23 45 67', '07 70 12 34 56', '+213770123456'])('accepts %s', (n) => {
    expect(isValidPhone(n)).toBe(true);
  });
  it.each(['', '021 23 45 67', '0855123456', '055512345', '05551234567', 'xx xx xx xx xx'])('refuses %s', (n) => {
    expect(isValidPhone(n)).toBe(false);
  });
});

describe('validateOrder', () => {
  const ok = { customerName: 'سمير بن علي', phone: '0555123456', wilaya: 'الجزائر - Alger', commune: 'باب الزوار' };

  it('is empty when the four required fields are good', () => {
    expect(validateOrder(ok)).toEqual({});
  });

  it('names every missing field, and tells an empty phone from a wrong one', () => {
    expect(validateOrder({})).toEqual({ customerName: 'name', phone: 'phoneEmpty', wilaya: 'wilaya', commune: 'commune' });
    expect(validateOrder({ ...ok, phone: '0123' })).toEqual({ phone: 'phone' });
  });
});
