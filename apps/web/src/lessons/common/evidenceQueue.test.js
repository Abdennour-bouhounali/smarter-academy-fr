import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory stand-in for the localStorage-backed storage seam — the queue's
// behavior is what's under test, not the browser API.
const memory = new Map();
/**
 * Le module testé importe `scopedStorage` (clés préfixées par utilisateur),
 * pas `storage`. Le mock doit donc exposer les DEUX exports : n'en fournir
 * qu'un faisait échouer les cinq tests avec « No "scopedStorage" export is
 * defined on the mock ».
 *
 * Le faux `scopedStorage` reproduit le vrai : mêmes trois méthodes, appliquées
 * à une clé préfixée. Le préfixe est celui de l'utilisateur anonyme, le seul
 * cas que cette suite exerce.
 */
const fakeStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};

vi.mock('../../utils/storage', () => ({
  storage: fakeStorage,
  scopedStorage: {
    getItem: (key) => fakeStorage.getItem(`u_anon_${key}`),
    setItem: (key, value) => fakeStorage.setItem(`u_anon_${key}`, value),
    removeItem: (key) => fakeStorage.removeItem(`u_anon_${key}`),
  },
}));

const {
  readQueue, enqueueEvidence, flushEvidenceQueue, pendingEvidenceCount, MAX_AGE_DAYS,
} = await import('./evidenceQueue');

// La charge utile V2 : ni isCorrect, ni learningPointCodes — le serveur juge.
const entry = (attemptId) => ({
  lessonCode: 'resolution-problemes',
  evidence: {
    questionCode: 'rp-flash-01',
    attemptId,
    answer: { picked: 2 },
  },
});

const NOW = new Date('2026-09-24T10:00:00.000Z');
const daysAgo = (days) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

describe('evidenceQueue', () => {
  beforeEach(() => memory.clear());

  it('starts empty and survives corrupt storage content', () => {
    expect(readQueue()).toEqual([]);
    memory.set('smarter_evidence_queue', 'not-json{');
    expect(readQueue()).toEqual([]);
  });

  it('enqueues and reads back entries in order', () => {
    enqueueEvidence(entry('a1'));
    enqueueEvidence(entry('a2'));

    expect(readQueue().map((e) => e.evidence.attemptId)).toEqual(['a1', 'a2']);
  });

  it('stamps each entry with queuedAt (ISO), retries: 0 and no error', () => {
    enqueueEvidence(entry('a1'), NOW);

    const [queued] = readQueue();
    expect(queued.queuedAt).toBe(NOW.toISOString());
    expect(queued.retries).toBe(0);
    expect(queued.lastError).toBeNull();
    expect(pendingEvidenceCount()).toBe(1);
  });

  it('flushes queued entries through the submitter and empties the queue', async () => {
    enqueueEvidence(entry('a1'));
    enqueueEvidence(entry('a2'));
    const submit = vi.fn().mockResolvedValue({ duplicate: false });

    const result = await flushEvidenceQueue('token-123', submit);

    expect(submit).toHaveBeenCalledTimes(2);
    expect(submit).toHaveBeenCalledWith('token-123', 'resolution-problemes', entry('a1').evidence);
    expect(result).toEqual({ flushed: 2, remaining: 0, expired: 0 });
    expect(readQueue()).toEqual([]);
    expect(pendingEvidenceCount()).toBe(0);
  });

  it('keeps entries that fail with a retryable error and never throws', async () => {
    enqueueEvidence(entry('a1'));
    const networkError = Object.assign(new Error('offline'), { status: null });
    const submit = vi.fn().mockRejectedValue(networkError);

    const result = await flushEvidenceQueue('token-123', submit);

    expect(result).toEqual({ flushed: 0, remaining: 1, expired: 0 });
    expect(readQueue()).toHaveLength(1);
  });

  it('KEEPS an entry the server rejects with 422, annotated with the error (Mastery V2)', async () => {
    enqueueEvidence(entry('a1'), NOW);
    const validationError = Object.assign(new Error('item inconnu du registre'), { status: 422 });
    const submit = vi.fn().mockRejectedValue(validationError);

    const result = await flushEvidenceQueue('token-123', submit, NOW);

    expect(result).toEqual({ flushed: 0, remaining: 1, expired: 0 });
    const [kept] = readQueue();
    expect(kept.evidence.attemptId).toBe('a1');
    expect(kept.lastError).toEqual({ status: 422, message: 'item inconnu du registre' });
    expect(kept.retries).toBe(1);
    expect(kept.queuedAt).toBe(NOW.toISOString());
  });

  it('counts each failed flush in `retries` and records the latest error', async () => {
    enqueueEvidence(entry('a1'), NOW);
    const submit = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('offline'), { status: null }))
      .mockRejectedValueOnce(Object.assign(new Error('serveur'), { status: 500 }))
      .mockResolvedValueOnce({ duplicate: false });

    await flushEvidenceQueue('token-123', submit, NOW);
    await flushEvidenceQueue('token-123', submit, NOW);
    expect(readQueue()[0].retries).toBe(2);
    expect(readQueue()[0].lastError).toEqual({ status: 500, message: 'serveur' });

    const result = await flushEvidenceQueue('token-123', submit, NOW);
    expect(result).toEqual({ flushed: 1, remaining: 0, expired: 0 });
  });

  it(`drops only entries queued more than ${MAX_AGE_DAYS} days ago`, async () => {
    enqueueEvidence(entry('old'), daysAgo(MAX_AGE_DAYS + 1));
    enqueueEvidence(entry('recent'), daysAgo(MAX_AGE_DAYS - 1));
    const submit = vi.fn().mockRejectedValue(Object.assign(new Error('offline'), { status: null }));

    const result = await flushEvidenceQueue('token-123', submit, NOW);

    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith('token-123', 'resolution-problemes', entry('recent').evidence);
    expect(result).toEqual({ flushed: 0, remaining: 1, expired: 1 });
    expect(readQueue().map((e) => e.evidence.attemptId)).toEqual(['recent']);
  });

  it('expires stale entries even without a token, and keeps the rest', async () => {
    enqueueEvidence(entry('old'), daysAgo(MAX_AGE_DAYS + 5));
    enqueueEvidence(entry('recent'), NOW);

    const result = await flushEvidenceQueue(null, vi.fn(), NOW);

    expect(result).toEqual({ flushed: 0, remaining: 1, expired: 1 });
    expect(readQueue().map((e) => e.evidence.attemptId)).toEqual(['recent']);
  });

  it('caps the queue at 200 entries, keeping the most recent', () => {
    for (let i = 0; i < 205; i += 1) enqueueEvidence(entry(`a${i}`));

    const ids = readQueue().map((e) => e.evidence.attemptId);
    expect(ids).toHaveLength(200);
    expect(ids[0]).toBe('a5');
    expect(ids[199]).toBe('a204');
  });

  it('does nothing without a token', async () => {
    enqueueEvidence(entry('a1'));
    const submit = vi.fn();

    const result = await flushEvidenceQueue(null, submit);

    expect(submit).not.toHaveBeenCalled();
    expect(result).toEqual({ flushed: 0, remaining: 1, expired: 0 });
  });
});

describe('flush concurrent (audit 2026-09-29)', () => {
  beforeEach(() => memory.clear());

  it('garde une réponse parquée PENDANT le flush', async () => {
    enqueueEvidence(entry('a-1'));
    const submit = vi.fn(async () => {
      // Pendant l'envoi de a-1, le défi final parque a-2.
      enqueueEvidence(entry('a-2'));
    });
    await flushEvidenceQueue('tok', submit);
    expect(readQueue().map((e) => e.evidence.attemptId)).toEqual(['a-2']);
  });
});
