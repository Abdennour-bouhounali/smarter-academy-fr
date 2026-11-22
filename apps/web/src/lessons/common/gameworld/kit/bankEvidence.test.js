// A handed-in copy goes to the practice engine (bankEvidence.js): what is sent, what is queued, what is dropped — and the
// queue keeps a copy handed in WHILE a flush is waiting on the network.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { store, api } = vi.hoisted(() => {
  const fn = () => vi.fn(async () => ({}));
  return {
    store: new Map(),
    api: {
      startPracticeSession: fn(),
      openQuestion: fn(),
      submitAnswer: fn(),
      completeExercise: fn(),
      completeSession: fn(),
    },
  };
});
vi.mock('../../../../utils/storage', () => ({
  scopedStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
}));
vi.mock('../../../../services/practiceService', () => api);

const { sendSitting, flushSittings, refusedSittings, uuid } = await import('./bankEvidence');

const QUEUE = 'smarter_world_sitting_queue';
const queued = () => JSON.parse(store.get(QUEUE) ?? '[]').map((e) => e.sheet.sessionId);
const sheet = (sessionId) => ({
  lesson: 'toy',
  level: 1,
  sessionId,
  exercises: ['ex-a'],
  items: [
    { exerciseId: 'ex-a', questionId: 'q1', attemptUuid: `${sessionId}-1`, answer: { value: '3' }, outcome: 'correct' },
  ],
});
const fail = (status) => Object.assign(new Error('nope'), { status });

beforeEach(() => {
  store.clear();
  for (const f of Object.values(api)) f.mockReset().mockResolvedValue({});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('kit/bankEvidence — a copy of « الامتحان الأبيض » to the practice engine', () => {
  it('sends a copy: one session, each step opened then answered, the exercise and the session completed', async () => {
    expect(await sendSitting('tok', sheet('s1'))).toBe('sent');
    expect(api.startPracticeSession).toHaveBeenCalledWith('tok', 'toy', 's1', 1);
    expect(api.openQuestion).toHaveBeenCalledWith('tok', 's1', 'ex-a', 'q1', 's1-1');
    expect(api.submitAnswer).toHaveBeenCalledWith('tok', 's1', {
      attemptUuid: 's1-1',
      answer: { value: '3' },
      outcome: 'correct',
    });
    expect(api.completeExercise).toHaveBeenCalledWith('tok', 's1', 'ex-a');
    expect(api.completeSession).toHaveBeenCalledWith('tok', 's1');
    expect(queued()).toEqual([]);
  });

  it('sends nothing without a token or without a step', async () => {
    expect(await sendSitting(null, sheet('s1'))).toBe('skipped');
    expect(await sendSitting('tok', { ...sheet('s1'), items: [] })).toBe('skipped');
    expect(api.startPracticeSession).not.toHaveBeenCalled();
  });

  it('queues a copy the network lost, and sends it at the next flush', async () => {
    api.startPracticeSession.mockRejectedValueOnce(fail(503));
    expect(await sendSitting('tok', sheet('s1'))).toBe('later');
    expect(queued()).toEqual(['s1']);
    expect(await flushSittings('tok')).toBe(1);
    expect(queued()).toEqual([]);
  });

  it('drops a copy the server refuses — with a trace (a counter, a warning in development), never silently', async () => {
    api.startPracticeSession.mockRejectedValueOnce(fail(422));
    expect(await sendSitting('tok', sheet('s1'))).toBe('refused');
    expect(queued()).toEqual([]);
    expect(refusedSittings()).toBe(1);
    expect(console.warn).toHaveBeenCalled();
    // one refused STEP does not cost the others, and is counted too
    api.openQuestion.mockRejectedValueOnce(fail(404));
    expect(await sendSitting('tok', sheet('s2'))).toBe('sent');
    expect(refusedSittings()).toBe(2);
    expect(api.completeSession).toHaveBeenCalledWith('tok', 's2');
  });

  it('keeps a copy handed in WHILE a flush waits on the network (the race of write(keep))', async () => {
    api.startPracticeSession.mockRejectedValueOnce(fail(503));
    await sendSitting('tok', sheet('old'));
    let release;
    api.startPracticeSession.mockImplementationOnce(() => new Promise((r) => (release = r)));
    const flush = flushSittings('tok');
    await vi.waitFor(() => expect(release).toBeTypeOf('function'));
    // a new copy fails to go while the old one is on its way: it joins the queue
    api.startPracticeSession.mockRejectedValueOnce(fail(503));
    expect(await sendSitting('tok', sheet('new'))).toBe('later');
    release({});
    expect(await flush).toBe(1);
    expect(queued()).toEqual(['new']);
  });

  it('runs one flush at a time: a second call joins the running one', async () => {
    api.startPracticeSession.mockRejectedValueOnce(fail(503));
    await sendSitting('tok', sheet('s1'));
    const [a, b] = await Promise.all([flushSittings('tok'), flushSittings('tok')]);
    expect([a, b]).toEqual([1, 1]);
    expect(api.startPracticeSession).toHaveBeenCalledTimes(2); // the failed send, then ONE flush
  });

  it('makes v4 uuids', () => {
    expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
