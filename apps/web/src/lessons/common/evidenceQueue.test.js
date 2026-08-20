import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory stand-in for the localStorage-backed storage seam — the queue's
// behavior is what's under test, not the browser API.
const memory = new Map();
vi.mock('../../utils/storage', () => ({
  storage: {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  },
}));

const { readQueue, enqueueEvidence, flushEvidenceQueue } = await import('./evidenceQueue');

const entry = (attemptId) => ({
  lessonCode: 'resolution-problemes',
  evidence: {
    questionCode: 'rp-flash-01',
    attemptId,
    isCorrect: true,
    learningPointCodes: ['6e_resolution-problemes_P1'],
    answer: null,
  },
});

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

  it('flushes queued entries through the submitter and empties the queue', async () => {
    enqueueEvidence(entry('a1'));
    enqueueEvidence(entry('a2'));
    const submit = vi.fn().mockResolvedValue({ duplicate: false });

    const result = await flushEvidenceQueue('token-123', submit);

    expect(submit).toHaveBeenCalledTimes(2);
    expect(submit).toHaveBeenCalledWith('token-123', 'resolution-problemes', entry('a1').evidence);
    expect(result).toEqual({ flushed: 2, remaining: 0 });
    expect(readQueue()).toEqual([]);
  });

  it('keeps entries that fail with a retryable error and never throws', async () => {
    enqueueEvidence(entry('a1'));
    const networkError = Object.assign(new Error('offline'), { status: null });
    const submit = vi.fn().mockRejectedValue(networkError);

    const result = await flushEvidenceQueue('token-123', submit);

    expect(result).toEqual({ flushed: 0, remaining: 1 });
    expect(readQueue()).toHaveLength(1);
  });

  it('drops entries the server permanently rejects (422) instead of wedging the queue', async () => {
    enqueueEvidence(entry('a1'));
    const validationError = Object.assign(new Error('invalid'), { status: 422 });
    const submit = vi.fn().mockRejectedValue(validationError);

    const result = await flushEvidenceQueue('token-123', submit);

    expect(result).toEqual({ flushed: 1, remaining: 0 });
    expect(readQueue()).toEqual([]);
  });

  it('does nothing without a token', async () => {
    enqueueEvidence(entry('a1'));
    const submit = vi.fn();

    const result = await flushEvidenceQueue(null, submit);

    expect(submit).not.toHaveBeenCalled();
    expect(result).toEqual({ flushed: 0, remaining: 1 });
  });
});
