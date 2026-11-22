import { describe, it, expect } from 'vitest';
import { deriveSubscriptionState, informationalPrice } from './subscriptionState';

const freePlan = { slug: 'teacher-free', source: 'default', subscriptionId: null };
const proPlan = { slug: 'teacher-pro', source: 'subscription', subscriptionId: 9 };

describe('deriveSubscriptionState', () => {
  it('gratuit par défaut, sans rien', () => {
    expect(deriveSubscriptionState({ entitlements: { plan: freePlan, request: null } })).toMatchObject({ base: 'free', pending: null, canRequest: true });
  });
  it('une demande en attente n’active rien : l’offre reste celle du serveur', () => {
    const state = deriveSubscriptionState({ entitlements: { plan: freePlan, request: { id: 1, status: 'pending', planName: 'Pro' } } });
    expect(state.base).toBe('free');
    expect(state.pending?.planName).toBe('Pro');
    expect(state.canRequest).toBe(false);
  });
  it('un abonnement qui court rend « active »', () => {
    expect(deriveSubscriptionState({ entitlements: { plan: proPlan, request: null } }).base).toBe('active');
  });
  it('suspendu : retombé sur le gratuit, et on le dit', () => {
    const state = deriveSubscriptionState({ entitlements: { plan: freePlan, request: null }, subscriptions: [{ id: 9, status: 'suspended' }] });
    expect(state.base).toBe('suspended');
  });
  it('le dernier refus se voit tant qu’aucune nouvelle demande n’est faite', () => {
    const state = deriveSubscriptionState({ entitlements: { plan: freePlan, request: null }, requests: [{ id: 3, status: 'rejected', rejectionReason: 'x' }] });
    expect(state.rejected?.id).toBe(3);
  });
});

describe('informationalPrice', () => {
  it('convertit les centimes en dinars, ou rien pour le gratuit', () => {
    expect(informationalPrice({ amountCents: 600000, currency: 'DZD', billingInterval: 'year' })).toEqual({ amount: 6000, currency: 'DZD', interval: 'year' });
    expect(informationalPrice({ amountCents: 0 })).toBeNull();
    expect(informationalPrice(null)).toBeNull();
  });
});
