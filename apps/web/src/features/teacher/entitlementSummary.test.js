import { describe, it, expect } from 'vitest';
import { describeMeter, activeFeatures } from './entitlementSummary';

describe('describeMeter', () => {
  it('lit une jauge bornée', () => {
    expect(describeMeter({ current: 3, maximum: 5 })).toMatchObject({ current: 3, maximum: 5, unlimited: false, overLimit: false, atLimit: false, text: '3\u00A0/\u00A05' });
  });
  it('dit « à la limite » et « au-delà » sans les confondre', () => {
    expect(describeMeter({ current: 5, maximum: 5 })).toMatchObject({ atLimit: true, overLimit: false, ratio: 1 });
    expect(describeMeter({ current: 7, maximum: 5 })).toMatchObject({ atLimit: true, overLimit: true, ratio: 1 });
  });
  it('null = illimité, jamais zéro', () => {
    expect(describeMeter({ current: 2, maximum: null })).toMatchObject({ unlimited: true, overLimit: false, text: '2\u00A0/\u00A0∞' });
  });
  it('une jauge absente vaut zéro sur zéro, sans lever', () => {
    expect(describeMeter(undefined)).toMatchObject({ current: 0, maximum: null, unlimited: true });
  });
});

describe('activeFeatures', () => {
  it('ne garde que les fonctionnalités vraies', () => {
    expect(activeFeatures({ 'progress.class': true, 'analytics.advanced': false })).toEqual(['progress.class']);
  });
});
