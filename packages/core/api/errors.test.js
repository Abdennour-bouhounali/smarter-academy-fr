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
    [500, 'SERVER_ERROR'],
    [503, 'SERVER_ERROR'],
    [418, 'UNEXPECTED_ERROR'],
  ])('classifies %i as %s', (status, expected) => {
    expect(classifyStatus(status)).toBe(expected);
  });
});
