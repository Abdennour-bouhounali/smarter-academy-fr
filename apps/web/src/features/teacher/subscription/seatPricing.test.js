import { describe, it, expect } from 'vitest';
import { applicableTier, quoteSeats, maxCoveredSeats, firstRequestableSeats, formatDzd, tierLabel } from './seatPricing';

const tiers = [
  { minStudents: 1, maxStudents: 5, pricePerStudentCents: 0, currency: 'DZD', isActive: true },
  { minStudents: 6, maxStudents: 20, pricePerStudentCents: 100000, currency: 'DZD', isActive: true },
  { minStudents: 21, maxStudents: 30, pricePerStudentCents: 80000, currency: 'DZD', isActive: true },
  { minStudents: 31, maxStudents: null, pricePerStudentCents: 70000, currency: 'DZD', isActive: true },
];

describe('seatPricing (aperçu client, jamais l’autorité)', () => {
  it('le palier vient du nombre, aux bornes exactes', () => {
    expect(applicableTier(tiers, 5).pricePerStudentCents).toBe(0);
    expect(applicableTier(tiers, 6).pricePerStudentCents).toBe(100000);
    expect(applicableTier(tiers, 20).pricePerStudentCents).toBe(100000);
    expect(applicableTier(tiers, 21).pricePerStudentCents).toBe(80000);
    expect(applicableTier(tiers, 30).pricePerStudentCents).toBe(80000);
    expect(applicableTier(tiers, 31).pricePerStudentCents).toBe(70000);
    expect(applicableTier(tiers, 0)).toBeNull();
    expect(applicableTier(tiers, 'abc')).toBeNull();
  });

  it('le total est le produit : 20 × 1000 = 20 000, 25 × 800 = 20 000', () => {
    expect(quoteSeats(tiers, 20)).toMatchObject({ unitPriceCents: 100000, totalCents: 2000000, free: false });
    expect(quoteSeats(tiers, 25)).toMatchObject({ unitPriceCents: 80000, totalCents: 2000000 });
    expect(quoteSeats(tiers, 21).totalCents).toBe(1680000);
    expect(quoteSeats(tiers, 5)).toMatchObject({ totalCents: 0, free: true });
  });

  it('un palier inactif ne compte pas ; un nombre hors grille ne se chiffre pas', () => {
    const bounded = tiers.slice(0, 3).concat([{ ...tiers[3], isActive: false }]);
    expect(quoteSeats(bounded, 31)).toBeNull();
    expect(maxCoveredSeats(bounded)).toBe(30);
    expect(maxCoveredSeats(tiers)).toBeNull();
    expect(maxCoveredSeats([])).toBe(0);
  });

  it('le premier nombre demandable dépasse le gratuit', () => {
    expect(firstRequestableSeats(tiers, 5)).toBe(6);
    expect(firstRequestableSeats(tiers, null)).toBe(1);
    expect(firstRequestableSeats(tiers.slice(1), 5)).toBe(6);
    expect(firstRequestableSeats(tiers.slice(2), 5)).toBe(21);
  });

  it('formate en dinars entiers et nomme les paliers', () => {
    expect(formatDzd(2000000).replace(/ | /g, ' ')).toBe('20 000');
    expect(tierLabel(tiers[1])).toBe('6–20');
    expect(tierLabel(tiers[3])).toBe('31+');
    expect(tierLabel({ label: '6–20' })).toBe('6–20');
  });
});
