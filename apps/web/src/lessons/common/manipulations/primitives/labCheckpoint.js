/**
 * labCheckpoint — la LOGIQUE PURE des questions posées PENDANT un labo (2026-10-28, PROTOTYPE sur `gear-crank`, propriétaire :
 * « l'élève doit comprendre l'idée de CHAQUE étape ; les questions viennent par-dessus le labo, bloquent l'étape suivante
 * jusqu'à la réponse, il peut refaire la même étape, il est guidé et on ne lui jette pas la réponse au premier essai »).
 *
 * Une QUESTION : `{ id, kind: 'choice' | 'number' | 'fill' | 'build', options?: [{ text, correct?, why? }], expected?: 'p/q' | 'n', hints: [h1, h2?] }`
 * (pilote 2026-11-07, conseil sur les questions du labo — lecteur de mission) :
 *  - `fill`  : plusieurs CASES remplies d'un toucher sur des pastilles de nombres, `fields: [{ label, expected, options: [n…] }]` —
 *    la réponse est le tableau des choix, juste quand TOUTES les cases le sont (« في كل فريق ▢ · على المقاعد ▢ ») ;
 *  - `build` : des TUILES de nombres posées dans des emplacements nommés, `slots: [label…]`, `tiles: [n…]`, `expected: [n…]`, `ops?: [signe…]`
 *    (les signes entre emplacements, défaut ['=', '×', '+']), `accept?: [[n…]…]` (d'autres remplissages justes — l'égalité dans l'autre sens),
 *    `preset?: [n | null…]` (des tuiles DÉJÀ posées au départ, que l'élève peut reprendre) —
 *    `render?: (tuile) => nœud` (2026-11-10, shadow-meet : une tuile dessinée dans sa forme — « BC/BE » en vraie fraction ; la comparaison lit toujours la tuile) —
 *    `wrap?: [avant, après]` (2026-11-11, turf-factoring : un signe avant le premier emplacement et après le dernier, « ▢(▢ + ▢) », « (▢ + ▢)² ») —
 *    l'élève BÂTIT l'égalité (« اللاعبون = الفرق × في كل فريق + خارج الفرق ») au lieu de la choisir.
 * (les textes sont des nœuds React, la logique ne les lit pas). Un ARRÊT (checkpoint) est une suite de questions qui mène à l'idée.
 *
 * La progression d'un arrêt : `{ qi, tries, wrong: [valeurs], status: 'ask' | 'wrong' | 'right' | 'revealed', done, log }`.
 *  - juste → 'right' (l'explication s'affiche, « التالي » avance) ;
 *  - faux, essai 1 → 'wrong' + l'indice de l'option (`why`) ou le 1er indice ; essai 2 → le 2e indice (plus précis) ;
 *  - faux à l'essai MAX_TRIES → 'revealed' : la réponse ET son explication — jamais avant (on ne reste pas bloqué non plus).
 * `log` garde, par question, { id, tries, ok } : `ok` est faux quand la réponse a dû être montrée.
 */
import { rat, eq, parseRat } from '@smarter-academy/core/arithmetic/powers.js';

export const MAX_TRIES = 3;

export const fresh = () => ({ qi: 0, tries: 0, wrong: [], status: 'ask', done: false, log: [] });

/** Chiffres arabes → latins, « ÷ » → « / », espaces retirés. */
function latinAnswer(text) {
  return String(text ?? '')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[÷⁄∕]/g, '/').replace('٫', ',').replace(/\s+/g, '');
}

/** Un nombre écrit (« 8 », « 4/3 », « 1,5 », « ٨ ») → rationnel, ou null s'il est illisible. */
export function readNumber(text) {
  const s = latinAnswer(text);
  if (!/^\d+(?:[.,]\d+)?(?:\/\d+)?$/.test(s)) return null;
  try {
    const r = parseRat(s);
    return r.d === 0n ? null : r;
  } catch { return null; }
}

/** La réponse est-elle juste ? `choice` : l'indice d'une option `correct` ; `number` : égalité EXACTE de rationnels (8/6 = 4/3). */
const filled = (value, n) => Array.isArray(value) && value.length === n && value.every((x) => x != null && x !== '');
const sameList = (value, expected) => filled(value, expected.length) && value.every((x, i) => String(x) === String(expected[i]));

export function isCorrect(q, value) {
  if (q.kind === 'choice') return !!q.options?.[value]?.correct;
  if (q.kind === 'fill') return sameList(value, q.fields.map((f) => f.expected));
  // `accept` (2026-11-10, unit 9 lesson 2 — council L2.3) : d'autres remplissages TOUS justes, p. ex. l'égalité écrite dans l'autre sens
  // (« AC′/AC = AB′/AB » pour « AB′/AB = AC′/AC ») ; chacun a la longueur de `expected`
  if (q.kind === 'build') return sameList(value, q.expected) || (q.accept ?? []).some((alt) => sameList(value, alt));
  const r = readNumber(value);
  return r != null && eq(r, readNumber(q.expected) ?? rat(0));
}

/** Une réponse de l'élève. Sans effet si la question attend « التالي », si l'arrêt est fini ou si la saisie est illisible. */
export function submit(p, q, value) {
  if (p.done || p.status === 'right' || p.status === 'revealed') return p;
  if (q.kind === 'number' && readNumber(value) == null) return p;
  if (q.kind === 'choice' && p.wrong.includes(value)) return p;
  // une réponse à cases n'est jugée que COMPLÈTE
  if (q.kind === 'fill' && !filled(value, q.fields.length)) return p;
  if (q.kind === 'build' && !filled(value, q.expected.length)) return p;
  const tries = p.tries + 1;
  if (isCorrect(q, value)) return { ...p, tries, status: 'right', log: [...p.log, { id: q.id, tries, ok: true }] };
  const revealed = tries >= MAX_TRIES;
  return {
    ...p, tries, wrong: [...p.wrong, value], status: revealed ? 'revealed' : 'wrong',
    log: revealed ? [...p.log, { id: q.id, tries, ok: false }] : p.log,
  };
}

/** « التالي » : la question suivante, ou l'arrêt fini après la dernière. */
export function advance(p, count) {
  if (p.status !== 'right' && p.status !== 'revealed') return p;
  const qi = p.qi + 1;
  if (qi >= count) return { ...p, status: 'ask', done: true };
  return { ...p, qi, tries: 0, wrong: [], status: 'ask' };
}

/**
 * Ce que dit la carte après une réponse fausse : `{ kind: 'hint', node }` (essai 1 : le `why` de l'option choisie, sinon
 * l'indice 1 ; essai 2 : l'indice 2, sinon l'indice 1) ou `{ kind: 'reveal' }`. `null` hors erreur.
 */
export function feedbackOf(p, q) {
  if (p.status === 'revealed') return { kind: 'reveal' };
  if (p.status !== 'wrong') return null;
  const hints = q.hints ?? [];
  if (p.tries === 1) {
    const last = p.wrong[p.wrong.length - 1];
    const why = q.kind === 'choice' ? q.options?.[last]?.why : null;
    return { kind: 'hint', node: why ?? hints[0] ?? null };
  }
  return { kind: 'hint', node: hints[1] ?? hints[0] ?? null };
}
