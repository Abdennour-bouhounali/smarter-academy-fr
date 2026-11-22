import { LOCALE, TIME_ZONE } from '../../locale';

/**
 * « Le labo des énigmes » — la logique PURE des écrans (aucun React) : la ligne d'état d'un défi,
 * les couleurs des phases, le découpage des îlots mathématiques, l'heure d'ouverture.
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
 * Découpe un texte en morceaux : les îlots mathématiques (nombres, opérateurs, π √ ², une
 * lettre seule qui est une variable…) marqués `math`, rendus d'un bloc (`<bdi>`, en
 * demi-gras) ; le reste est du texte. Les sauts de ligne sont gardés dans le texte (rendu
 * `whitespace-pre-line`).
 *
 * Le texte est du français, écrit en lettres latines comme les variables : un îlot ne peut
 * donc pas être « tout ce qui est latin ». Il se compose de nombres, de symboles, d'opérateurs,
 * de parenthèses et de lettres SEULES (x, n, r, m) ; un mot de deux lettres ou plus, une
 * élision (« l’ », « d’ ») ou une ponctuation de phrase (« . », « : », « ; ») le ferme. Il
 * commence par un nombre, une lettre, un symbole ou « ( » et finit par un nombre, une lettre,
 * un symbole, « ) » ou « % » : « = » seul entre deux mots reste du texte.
 * @returns {{text: string, math: boolean}[]}
 */
const TOKEN = /[A-Za-zÀ-ÖØ-öø-ÿŒœ]+(?:[’'-][A-Za-zÀ-ÖØ-öø-ÿŒœ]+)*[’']?|[0-9]+(?:,[0-9]+)?|\s+|[\s\S]/gu;
const SYMBOLS = new Set([...'π√∫∞°²³⁴⁰¹⁵⁶⁷⁸⁹½¼¾⅓⅔%']);
const OPERATORS = new Set([...'+−×÷*/^=<>≤≥≈|-']);
const INSIDE = new Set([...'…·']);

/** La nature d'un morceau : `num`, `var`, `sym`, `op`, `open`, `close`, `space`, `inner` ou `text`. */
function kindOf(token) {
  if (/^\s+$/.test(token)) return 'space';
  if (/^[0-9]/.test(token)) return 'num';
  if (/^[A-Za-z]$/.test(token)) return 'var';
  if (SYMBOLS.has(token)) return 'sym';
  if (OPERATORS.has(token)) return 'op';
  if (token === '(') return 'open';
  if (token === ')') return 'close';
  if (INSIDE.has(token)) return 'inner';
  return 'text';
}

const CAN_START = new Set(['num', 'var', 'sym', 'open']);
const CAN_END = new Set(['num', 'var', 'sym', 'close']);

/** Un îlot [a, b) des morceaux est-il vraiment des maths ? (« y a » ou « a 12 » restent du texte.) */
function trimIsland(kinds, a, b) {
  while (a < b && !CAN_START.has(kinds[a])) a++;
  while (b > a && !CAN_END.has(kinds[b - 1])) b--;
  // « (au centre » : une parenthèse qui n'ouvre rien de mathématique.
  while (a < b && kinds[a] === 'open' && !kinds.slice(a + 1, b).some((k) => CAN_END.has(k) && k !== 'close')) a++;
  if (a >= b) return null;
  const inner = kinds.slice(a, b);
  const strong = inner.some((k) => k === 'num' || k === 'sym' || k === 'op');
  const vars = inner.filter((k) => k === 'var').length;
  if (!strong && vars > 1) return null; // « il y a » : deux lettres seules, aucun calcul
  // « Lina a 12 billes » : une lettre seule devant un nombre, sans opérateur entre eux, est un mot.
  if (kinds[a] === 'var' && !inner.some((k) => k === 'op' || k === 'sym' || k === 'open')) {
    let i = a + 1;
    while (i < b && kinds[i] === 'space') i++;
    if (i > a + 1 && kinds[i] === 'num') return trimIsland(kinds, i, b);
  }
  return [a, b];
}

export function mathRuns(text) {
  const source = String(text ?? '');
  const tokens = source.match(TOKEN) ?? [];
  const kinds = tokens.map(kindOf);
  const islands = [];
  for (let i = 0; i < tokens.length;) {
    if (kinds[i] === 'text') { i++; continue; }
    let j = i;
    while (j < tokens.length && kinds[j] !== 'text') j++;
    const island = trimIsland(kinds, i, j);
    if (island) islands.push(island);
    i = j;
  }
  const out = [];
  let last = 0;
  const push = (from, to, math) => {
    if (to <= from) return;
    const piece = tokens.slice(from, to).join('');
    const prev = out.at(-1);
    if (prev && prev.math === math && !math) prev.text += piece;
    else out.push({ text: piece, math });
  };
  for (const [a, b] of islands) {
    push(last, a, false);
    push(a, b, true);
    last = b;
  }
  push(last, tokens.length, false);
  return out;
}

const dayKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const NBSP = ' ';

/** « 9 h 40 », « 16 h 05 » — l'heure à la française, dans le fuseau de l'école. */
function hourLabel(d) {
  const parts = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return `${hour}${NBSP}h${NBSP}${minute}`;
}

/**
 * « demain à 9 h 40 » — l'instant d'ouverture dit à l'heure de l'école (TIME_ZONE), comme le
 * serveur le compte ; au-delà de demain, la date en toutes lettres (« le 5 novembre à 9 h 40 »).
 * @param {string} iso
 * @param {Date} now
 */
export function whenLabel(iso, now = new Date()) {
  const at = new Date(iso);
  const today = dayKey(now);
  const tomorrow = dayKey(new Date(now.getTime() + 86400000));
  const day = dayKey(at);
  const time = hourLabel(at);
  if (day === today) return `aujourd’hui à ${time}`;
  if (day === tomorrow) return `demain à ${time}`;
  const date = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, day: 'numeric', month: 'long' }).format(at);
  return `le ${date} à ${time}`;
}

/**
 * La ligne d'état d'un défi, en mots (« Essai 2 sur 3 · La solution s’ouvre demain à 9 h 40 »), sous forme de
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
