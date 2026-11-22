/**
 * « Le palais des dalles » — the rule forge IN THIS WORLD (PURE; the frame is kit/forge.js, the screen kit/RuleForge.jsx,
 * the drawing of a case forgeParts.jsx). It names no lesson: a lesson's `world/forges.js` builds its forges on these cases.
 *
 * A CASE is a court and a rod: `{ a: '30', s: { q: '5,47' }, held, kind, …extras }`
 *   a      the court's area, as TEXT (« 30 », « 0,25 », « 49/64 ») — written on its gate as it is given
 *   s      the rod: `{ q: '5,47' }` (a number) or `{ root: '30' }` (the court's own wall) — logic.js
 *   held   what the case is TRUE of: by default « the platform rides » (logic.js › outcome). A forge that asks another
 *          question of the same platform passes its own `held` in the extras; the drawing still shows what the world did
 *   kind   what the world did: 'ride' | 'band' | 'jam' (always computed, never given)
 *   extras what a lesson adds — `tag` (a short word shown in the line of evidence), `head` (the case's own name in that
 *          line, when « salle 36 · toise 6 » is not what it is about), `id` (an identity of its own), `zoom` (a forced
 *          magnifier factor for the mirror).
 * Every number is exact (logic.js): a rod of 5,477225575 does not ride the court of 30, and the forge knows it.
 */
import { read, write, rod as rodOfNumber, wall, isWall, outcome, rodText, rodTex, tex } from './logic';
import { TILES as TILE_FORMS, tiles as tilesOfText, tileWord as tileWordOfText } from './strings';

// ───────────────────────────── the words: a number of tiles, agreed ─────────────────────────────

/** Tiles, [singular, plural] (strings.js › TILES): « 0 dalle », « 1 dalle », « 2 dalles ». */
export const TILES = TILE_FORMS;
const isWhole = (x) => read(x).d === 1n;
const asText = (x) => (typeof x === 'string' ? x.trim() : write(x));
/** A whole number as the world writes it (« 030 » is « 30 »); anything else as it was given. */
const written = (t) => (isWhole(t) ? String(read(t).n) : t);

/**
 * A number of tiles with its noun (defects.md B11), joined by a no-break space: below 2 the singular, from 2 the plural
 * (« 1 dalle », « 0,0791 dalle », « 30 dalles »); a fraction is a part of a tile (« 49/64 de dalle »). The number is
 * written as it was given (a fraction stays a fraction).
 */
export function tiles(x) {
  return tilesOfText(written(asText(x)));
}
/** The noun alone, for a number already written above it (a gate's plaque): « dalle », « dalles », « de dalle ». */
export function tileWord(x) {
  return tileWordOfText(written(asText(x)));
}
/**
 * A number in the writing of its court: a court given as a fraction (« 49/64 ») has its band and its platform written as
 * fractions too (« 33/64 », never « 0,515625 » beside « 49/64 »); any other court as logic.js writes them.
 */
export function inCourtWriting(x, area) {
  if (!String(area).includes('/')) return asText(x);
  const { n, d } = read(x);
  return d === 1n ? String(n) : `${n}/${d}`;
}
/** « de » and a number of tiles — how much sticks out: « de 1 dalle », « de 6 dalles », « de 0,0304 dalle ». */
export function byTiles(x) {
  return `de ${tiles(x)}`;
}

// ───────────────────────────── a court and a rod as a case ─────────────────────────────

/**
 * The rod of a case, written once and for all: a rod object (`{ q }` or `{ root }`, its number rewritten — « 5.470 » is
 * « 5,47 »), a number or its text (`'5,47'`, `6`), or the word `'wall'` — the wall of the case's own court.
 */
export function rodFor(area, s) {
  if (s === 'wall') return wall(area);
  if (s && typeof s === 'object') return isWall(s) ? wall(s.root) : rodOfNumber(s.q);
  return rodOfNumber(s);
}

/** A case of this world: the court `a` (its area), the rod `s`, and what the world does with them. */
export function caseOf(a, s, extra = {}) {
  const area = String(a).trim();
  const r = rodFor(area, s);
  const { kind } = outcome(r, area);
  return { ...extra, a: area, s: r, kind, held: 'held' in extra ? extra.held : kind === 'ride' };
}

/** The identity of a case: its court and its rod, both rewritten (« 49/64 » and « 0,765625 » are one court). */
export const caseId = (c) => c.id ?? `${write(c.a)}|${rodText(rodFor(c.a, c.s))}`;

/** What the world does with the case: `{ kind, covers, diff }` (logic.js › outcome — exact, as text). */
export const runCase = (c) => outcome(rodFor(c.a, c.s), c.a);

/**
 * The lines of evidence from the world's log — rows `{ a, s, mirror?, …extras }` — one per identity, oldest first; when a
 * case comes again, its NEWEST row is kept, at its newest place. A case he made himself stays his own (`mirror: false`)
 * even when the mirror shows it again (the kit marks what the mirror built with `mirror: true`). `max` keeps the last ones.
 */
export function evidenceOf(log = [], { max } = {}) {
  const out = [];
  for (const row of log) {
    const { a, s, mirror, ...rest } = row;
    const c = caseOf(a, s, rest);
    const id = caseId(c);
    const i = out.findIndex((x) => caseId(x) === id);
    const was = i >= 0 ? out.splice(i, 1)[0] : null;
    out.push({ ...c, mirror: Boolean(mirror) && (was ? was.mirror : true) });
  }
  return max ? out.slice(-max) : out;
}

/**
 * A pool of cases for the predictions and the attacks: every court of `areas` with every rod of `rods` (an array, or a
 * function of the area — `(a) => ['5', '6', 'wall']`), one per identity. `extra(a, s)` gives a case its extras.
 */
export function courtPool({ areas, rods, extra }) {
  const out = [];
  for (const a of areas)
    for (const s of typeof rods === 'function' ? rods(String(a)) : rods) {
      const c = caseOf(a, s, extra?.(String(a), s) ?? {});
      if (!out.some((x) => caseId(x) === caseId(c))) out.push(c);
    }
  return out;
}

// ───────────────────────────── the wording of a case ─────────────────────────────

/** A rod inside a sentence: its writing (« √30 », « -9 », « 5,47 »). */
const rodIn = (s) => rodText(s);
/** A number written in LaTeX as it was given: a fraction keeps its bar, a decimal its comma. */
const texOf = (t) => {
  const [n, d] = String(t).split('/');
  return d == null ? tex(t) : `\\dfrac{${tex(n)}}{${tex(d)}}`;
};
const KIND_COLOUR = { ride: '#34d399', band: '#fbbf24', jam: '#c4b5fd' };
const KIND_SIGN = { ride: '=', band: '<', jam: '>' };

/**
 * What the world did, as ONE fact (never « wrong »): « La plateforme monte… », « Il reste une bande de … »,
 * « Elle coince sur le rebord : elle dépasse la salle de … ». A MathText sentence: a difference that is a fraction is
 * written over a real bar (« $\\dfrac{33}{64}$ de dalle »), never « 33/64 » as text.
 */
export function courtFact(c) {
  const o = runCase(c);
  const diff = inCourtWriting(o.diff, c.a);
  if (o.kind === 'ride') return 'La plateforme monte : elle couvre la salle exactement.';
  const frac = diff.includes('/') ? `$${texOf(diff)}$ de dalle` : null;
  if (o.kind === 'band') return `Il reste une bande de ${frac ?? tiles(diff)}.`;
  return `Elle coince sur le rebord : elle dépasse la salle ${frac ? `de ${frac}` : byTiles(diff)}.`;
}
/** The case in words: « une salle de 30 dalles et une toise de 5,47 ». */
const courtCase = (c) => `une salle de ${tiles(c.a)} et une toise de ${rodIn(c.s)}`;
const rides = (yes) => (yes ? 'elle monte' : 'elle ne monte pas');
/** A sentence's first letter in capital. */
const cap = (t) => t[0].toUpperCase() + t.slice(1);

/**
 * The wording of a court as a case — shared by the forges of this world; a lesson's forge overrides what its rule
 * changes (`frame`, `buildLead`, `tryKey`, `use`…). Every sentence about a case is a FACT the world showed.
 * `eq` writes the platform's tiles beside the court's (`5 × 5 = 25 < 30`); a WALL has none (its product would state a
 * rule of the unit) — a forge that must not show the product (its tiles are about it) sets `eq: () => null`.
 */
export const COURT_TEXT = {
  title: 'La salle des miroirs',
  sub: 'Forge ta clé : une règle qui tient face au miroir.',
  log: 'Tes plateformes',
  ask: (c) => `${cap(courtCase(c))}. La plateforme monte-t-elle ?`,
  yes: 'Elle monte',
  no: 'Elle ne monte pas',
  fact: (c) => courtFact(c),
  eq: (c) => {
    if (isWall(c.s)) return null;
    const o = runCase(c);
    const q = c.s.q.startsWith('-') ? `(${tex(c.s.q)})` : rodTex(c.s);
    return `$${q} \\times ${q} = ${texOf(inCourtWriting(o.covers, c.a))} \\; \\textcolor{${KIND_COLOUR[o.kind]}}{${KIND_SIGN[o.kind]}} \\; ${texOf(c.a)}$`;
  },
  next: 'Une autre plateforme',
  frame: 'La plateforme monte quand :',
  buildLead: 'Choisis deux cartes. Le miroir ne croit personne : il essaie ta règle sur tes plateformes.',
  testing: 'Le miroir passe sur tes plateformes, une par une…',
  says: (yes) => `Ta règle : ${rides(yes)}`,
  refuted: (m) =>
    `Avec la toise de ${rodIn(m.s)} dans la salle de ${tiles(m.a)}, ta règle dit « ${rides(m.says)} » — mais tu as vu : ${rides(m.held)}.`,
  agreed:
    'Ta règle est d’accord avec toutes les plateformes que tu as vues. Le miroir la met au défi avec une nouvelle salle.',
  attack: (c) => `Le miroir met ta règle au défi : ${courtCase(c)}. Que dit ta règle ?`,
  fire: 'Abaisse la plateforme',
  survived: 'Ta règle a tenu : la plateforme a fait ce qu’elle disait.',
  broken: (yes) =>
    `Ta règle casse ici : elle disait « ${rides(yes)} », et la plateforme ${yes ? 'n’est pas montée' : 'est montée'}.`,
  wordsHint: 'Par exemple : la plateforme monte quand…',
  compare: (cases) => `Compare ces deux plateformes dans la même salle (${tiles(cases[0].a)}). Qu’a fait chacune ?`,
  experiment: 'Regarde bien : la même salle, une toise puis une toise plus longue. Qu’a fait chaque plateforme ?',
  useOk: 'Ta clé marche même là où tu ne vois pas la salle !',
};
