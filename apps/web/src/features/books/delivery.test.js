import { describe, expect, it } from 'vitest';
import { DELIVERY_MODES, deliveryFeeFor, orderTotal } from './delivery';

const alger = { id: 16, fr: 'Alger', ar: 'الجزائر', label: 'الجزائر - Alger', delivery: { home: 500, desk: 300 } };
const noTariff = { id: 50, fr: 'Bordj Badji Mokhtar', ar: 'برج باجي مختار', label: 'x', delivery: null };
const oldCached = { id: 16, fr: 'Alger', ar: 'الجزائر', label: 'الجزائر - Alger' };

describe('deliveryFeeFor', () => {
  it('gives the fee of each mode', () => {
    expect(DELIVERY_MODES).toEqual(['home', 'desk']);
    expect(deliveryFeeFor(alger, 'home')).toBe(500);
    expect(deliveryFeeFor(alger, 'desk')).toBe(300);
  });

  it('is null with no wilaya, no tariff, an old cached wilaya or an unknown mode', () => {
    expect(deliveryFeeFor(null, 'home')).toBeNull();
    expect(deliveryFeeFor(undefined, 'desk')).toBeNull();
    expect(deliveryFeeFor(noTariff, 'home')).toBeNull();
    expect(deliveryFeeFor(oldCached, 'home')).toBeNull();
    expect(deliveryFeeFor(alger, 'post')).toBeNull();
    expect(deliveryFeeFor(alger, undefined)).toBeNull();
  });

  it('keeps a free delivery (0) as a known fee', () => {
    expect(deliveryFeeFor({ ...alger, delivery: { home: 0, desk: 0 } }, 'desk')).toBe(0);
  });
});

describe('orderTotal', () => {
  it('adds ONE fee per order, whatever the number of copies', () => {
    expect(orderTotal(1200, 1, 500)).toBe(1700);
    expect(orderTotal(1200, 3, 500)).toBe(4100);
  });

  it('is the subtotal when the fee is unknown', () => {
    expect(orderTotal(1200, 2, null)).toBe(2400);
    expect(orderTotal(1200, 2, undefined)).toBe(2400);
  });

  it('counts one copy while the quantity is being typed', () => {
    expect(orderTotal(1200, '', 300)).toBe(1500);
    expect(orderTotal(1200, '4', 300)).toBe(5100);
  });
});
