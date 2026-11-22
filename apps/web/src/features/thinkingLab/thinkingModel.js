/**
 * « مختبر التفكير » — la logique PURE des écrans (aucun React) : la ligne d'état d'un défi,
 * les couleurs des phases, le découpage des îlots mathématiques LTR, l'heure d'ouverture.
 * Le serveur décide de tout ; ce module ne fait que dire en mots ce qu'il a décidé.
 */

/** Les phases SMART + 👁 + ↩, leur couleur (jamais de rouge) et leur signe. */
const PHASES = Object.freeze({
  S: { sign: 'S', tone: 'bg-sky-50 text-sky-800 ring-sky-200', dot: 'bg-sky-500' },
  M: { sign: 'M', tone: 'bg-violet-50 text-violet-800 ring-violet-200', dot: 'bg-violet-500' },
  A: { sign: 'A', tone: 'bg-nav-accent-soft text-nav-accent ring-indigo-200', dot: 'bg-indigo-500' },
  R: { sign: 'R', tone: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500' },
  T: { sign: 'T', tone: 'bg-teal-50 text-teal-800 ring-teal-200', dot: 'bg-teal-500' },
  O: { sign: '👁', tone: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  B: { sign: '↩', tone: 'bg-slate-100 text-slate-700 ring-slate-300', dot: 'bg-slate-400' },
});

export const phaseOf = (code) => PHASES[code] ?? PHASES.S;

/** Les refus clos du serveur → la clé du message (`errors.*`). */
const KNOWN_ERRORS = new Set(['locked', 'too_many_open', 'gate_closed', 'key_locked', 'closed', 'not_found']);
export const errorKey = (reason) => (KNOWN_ERRORS.has(reason) ? reason : 'generic');

/**
 * Découpe un texte arabe en morceaux, les îlots mathématiques (lettres latines, chiffres,
 * opérateurs, π √ ² …) marqués `math` pour être rendus LTR (ARABIC_RTL_CONTRACT.md).
 * Les sauts de ligne sont gardés dans le texte (rendu `whitespace-pre-line`).
 * @returns {{text: string, math: boolean}[]}
 */
// Un îlot commence par un caractère mathématique ; « ( » ou « | » seulement si la formule suit
// (une parenthèse arabe « (في وسط المربّع) » reste du texte).
const MATH_RUN = /(?:[(|](?=[A-Za-z0-9π√∫−½-]))?[A-Za-z0-9π√∫∞°²³⁴⁰¹⁵-⁹½¼¾⅓⅔](?:[A-Za-z0-9π√∫∞°²³⁴⁰¹⁵-⁹½¼¾⅓⅔ ()+\-−×÷*/^=.,|<>≤≥≈%'·…]*[A-Za-z0-9π∞°²³⁴⁰¹⁵-⁹½¼¾⅓⅔)|%'])?/g;

export function mathRuns(text) {
  const source = String(text ?? '');
  const out = [];
  let last = 0;
  for (const m of source.matchAll(MATH_RUN)) {
    if (m.index > last) out.push({ text: source.slice(last, m.index), math: false });
    out.push({ text: m[0], math: true });
    last = m.index + m[0].length;
  }
  if (last < source.length) out.push({ text: source.slice(last), math: false });
  return out;
}

const TZ = 'Africa/Algiers';
const dayKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const hhmm = (d) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);

/**
 * « غدًا 09:40 » — l'instant d'ouverture dit à l'heure d'Alger, comme le serveur le compte.
 * @param {string} iso
 * @param {Date} now
 */
export function whenLabel(iso, now = new Date()) {
  const at = new Date(iso);
  const today = dayKey(now);
  const tomorrow = dayKey(new Date(now.getTime() + 86400000));
  const day = dayKey(at);
  const time = hhmm(at);
  if (day === today) return `اليوم ${time}`;
  if (day === tomorrow) return `غدًا ${time}`;
  return `${day.split('-').reverse().join('/')} ${time}`;
}

/**
 * La ligne d'état d'un défi, en mots (« محاولتان من 3 · الحلّ يُفتح غدًا 09:40 »), sous forme de
 * clés i18n à traduire : [{key, params}].
 */
export function stateLines(state, now = new Date()) {
  if (!state) return [];
  if (state.status === 'solved') {
    return [{ key: state.outcome === 'alone' ? 'state.solvedAlone' : state.outcome === 'keys' ? 'state.solvedKeys' : 'state.solved' }];
  }
  if (state.status === 'learned') return [{ key: state.outcome === 'twin' ? 'state.twin' : 'state.learned' }];
  const lines = [];
  if (state.attemptsCounted === 0) lines.push({ key: 'state.attempts_zero', params: { total: state.attemptsToUnlock } });
  else lines.push({ key: 'state.attempts', params: { count: Math.min(state.attemptsCounted, state.attemptsToUnlock), total: state.attemptsToUnlock } });
  if (state.canReplay) lines.push({ key: 'state.opensNow' });
  else if (state.unlockAt) lines.push({ key: 'state.opensAt', params: { when: whenLabel(state.unlockAt, now) } });
  else lines.push({ key: state.thinkHours > 0 ? 'state.thinkDay' : 'state.noWait' });
  if (state.status === 'postponed') lines.push({ key: 'state.postponed' });
  return lines;
}

/** Le brouillon est-il assez long pour qu'une tentative fausse compte ? (le serveur décide ; ceci guide). */
export const draftReady = (state, draft) => (state?.minDraftChars ?? 0) <= String(draft ?? '').trim().length;
