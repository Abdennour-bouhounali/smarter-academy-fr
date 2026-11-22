import { call, get, send } from './teacher/teacherClient';

/**
 * Transport du « مختبر التفكير » côté élève (docs/architecture/THINKING_LAB.md).
 *
 * Le client n'envoie JAMAIS une justesse, un compte ou un temps : une réponse brute et un
 * brouillon. Le serveur juge, compte, ouvre les clés et la porte ; il ne sert ni la réponse,
 * ni une clé fermée, ni la relecture avant la porte. Les refus portent un `reason` clos
 * (`locked`, `too_many_open`, `gate_closed`, `key_locked`, `closed`…) que la page traduit.
 */
const KEY = 'thinkingLab';
const id = (challengeId) => encodeURIComponent(challengeId);

export const fetchLadder = (token) => call('/thinking-lab', get(token), KEY);

export const resolveNumber = (token, number) => call(`/thinking-lab/n/${encodeURIComponent(number)}`, get(token), KEY);

export const fetchChallenge = (token, challengeId) => call(`/thinking-lab/challenges/${id(challengeId)}`, get(token), KEY);

export const submitAttempt = (token, challengeId, answer, draft) =>
  call(`/thinking-lab/challenges/${id(challengeId)}/attempts`, send('POST', token, { answer, draft }), KEY);

export const openKey = (token, challengeId, k) => call(`/thinking-lab/challenges/${id(challengeId)}/keys/${k}`, send('POST', token), KEY);

export const postponeChallenge = (token, challengeId) => call(`/thinking-lab/challenges/${id(challengeId)}/postpone`, send('POST', token), KEY);

export const fetchReplay = (token, challengeId) => call(`/thinking-lab/challenges/${id(challengeId)}/replay`, get(token), KEY);

/** « ارفع السقف » (kind = 'ceiling') ou une suite de sommet (kind = 'part', index). */
export const checkExtra = (token, challengeId, kind, answer, index = 0) =>
  call(`/thinking-lab/challenges/${id(challengeId)}/extra`, send('POST', token, { kind, index, answer }), KEY);
