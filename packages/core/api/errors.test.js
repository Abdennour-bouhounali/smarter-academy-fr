import { describe, it, expect } from 'vitest';
import { ApiError, classifyStatus } from './errors';

describe('ApiError', () => {
  it('carries message, type, and status', () => {
    const err = new ApiError('Not found', 'NOT_FOUND', 404);
    expect(err.message).toBe('Not found');
    expect(err.type).toBe('NOT_FOUND');
    expect(err.status).toBe(404);
    expect(err.name).toBe('ApiError');
  });

  it('defaults status to null (e.g. for a network error)', () => {
    const err = new ApiError('Offline', 'NETWORK_ERROR');
    expect(err.status).toBeNull();
  });
});

describe('classifyStatus', () => {
  it.each([
    [401, 'AUTHENTICATION_ERROR'],
    [403, 'AUTHORIZATION_ERROR'],
    [404, 'NOT_FOUND'],
    [422, 'VALIDATION_ERROR'],
    // « Trop d'essais » est une conduite à tenir, pas une erreur inattendue :
    // sans son propre type, l'élève limité en débit lisait « une erreur est
    // survenue » et retapait aussitôt, rallongeant sa propre punition.
    [429, 'RATE_LIMITED'],
    [500, 'SERVER_ERROR'],
    [503, 'SERVER_ERROR'],
    [418, 'UNEXPECTED_ERROR'],
  ])('classifies %i as %s', (status, expected) => {
    expect(classifyStatus(status)).toBe(expected);
  });
});
