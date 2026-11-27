/**
 * THE TWO FORGES of lesson `triangles-semblables` « Reconnaître des triangles semblables » — one per key, each of ITS OWN
 * nature (frame: kit/forge.js; screen: kit/RuleForge.jsx; how the world draws a case that is not a Thalès figure:
 * nilePyramids/forgeParts.jsx › `c.scene`, a GeoFigure spec of two triangles apart, `figures.js › sceneOf`). No rule is
 * told: every false rule the tiles can write is refuted in front of him by a COMPUTED case, and the rule gets its name only
 * on its tablet (`tablets.js`). Design: docs/reports/UNIT_3E_THALES_DESIGN.md, « Lesson 1 » v4 (K1, K2) and gate A's
 * fourth notes (3: one round per screen — the evidence lines carry a round's NAME and the world's verdict, never its
 * numbers; 6: the key ids are never a title before the seal).
 *
 *   'cotes-proportionnels'  the experiment `pair`, then the tiles « les côtés associés [du plus petit au plus grand ·
 *                           dans l'ordre des noms] — [les trois quotients égaux · deux quotients égaux sur trois · la même
 *                           différence partout] » — 2 × 3 = 6 rules (the design's four and their two crossings). The mirror
 *                           reads his tracés in the order ONE, DIFF, TURN, SIM, RED (`tests`): « deux sur trois » falls on
 *                           ONE, « la même différence » on DIFF, « l'ordre des noms » on TURN — as the design says. Last
 *                           step: [MN] = 12 m marked « moyen » → [BC], k = 12/3 = 4, NP = 8, PM = 15,2.
 *   'angles-egaux'          the experiment `angles`, then the tiles « [deux angles · un angle · deux côtés] de chacun —
 *                           [égaux · × un même nombre autre que 1] » — 3 × 2 = 6 rules. A rule is read only on the cases
 *                           that WRITE what it compares (two angles of each, or two sides of each: `readable`), in the
 *                           order R2, R3, R4, R1: « un angle » falls on R2, « × un même nombre » on R3, « deux côtés
 *                           proportionnels » on R4. Last step: each vertex of ABC to its homologue in XYZ, then the side
 *                           homologous to [AB].
 * The mirror's cases re-use the NUMBERS of a round's screen (each screen run CLEAR by the design's `ts-pairs.py`), under
 * other names and another lie: no new number reaches a forge before its last step. `forges.test.js` writes every rule the
 * tiles allow, proves exactly one holds, and refutes every other by a computed case.
 * The keys, as LITERALS (the status script finds each id quoted here): 'cotes-proportionnels', 'angles-egaux'.
 */
import {
  attacksOf,
  choiceBox,
  decimalBox,
  firstWrong,
  fractionBox,
  judge,
  line,
  noPredictions,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { ranks, sameShape } from '../../../../../../common/gameworld/nilePyramids/pair';
import { homologues, slideOf, triOf } from '../../../../../../common/gameworld/nilePyramids/angles';
import { THALES_TEXT } from '../../../../../../common/gameworld/nilePyramids/ruleForge';
import { flipped, fromSides, sceneOf, sidesOf, turned } from './figures';
import { ANGLES_INQUIRY, PAIR_INQUIRY } from './inquiries';
import { K, NUMBERS, equal, frAll, minus, over, times, tx, typedNumber, typedWhole, write } from './math';

// ───────────────────────── what both forges share ─────────────────────────

const num = (t) => Number(String(t).replace(',', '.'));
/** A triangle as it lies on the table: flipped (a mirror image), then turned — drawing only. */
const lie = (t, { turn = 0, flip = false } = {}) => turned(flip ? flipped(t) : t, turn);
/** The thumbnail of a scene: its lines and arcs, no number (a line of evidence never writes a round's numbers). */
const bare = (spec) => ({
  ...spec,
  segments: spec.segments.map(({ label, ...s }) => s),
  angles: spec.angles.map(({ label, ...a }) => a),
});
/** The mark between two values, in a formula. */
const mark = (yes) => (yes ? '=' : '\\neq');
/**
 * Terms compared neighbour to neighbour, as formulas: « $a = b = c$ », « $a = b$ et $b \neq c$ », « $a \neq b$ et
 * $b \neq c$ » — a « ≠ » is never chained (« a ≠ b ≠ c » reads as if a ≠ c too: gate B, 2026-11-27).
 */
const chainOf = (terms, values) => {
  const parts = [];
  let run = [terms[0]];
  for (let i = 1; i < terms.length; i += 1) {
    if (equal(values[i - 1], values[i])) run.push(terms[i]);
    else {
      if (run.length > 1) parts.push(run.join(' = '));
      parts.push(`${terms[i - 1]} ${mark(false)} ${terms[i]}`);
      run = [terms[i]];
    }
  }
  if (run.length > 1) parts.push(run.join(' = '));
  return parts.map((x) => `$${x}$`).join(' et ');
};
const same = (yes) => (yes ? 'a la forme' : 'n’a pas la forme');
const sameAll = (yes) => (yes ? 'même forme' : 'pas la même forme');

// ═════════════════════════ 1. 'cotes-proportionnels' — the sides ═════════════════════════

const TEMPLATE = PAIR_INQUIRY.template;
const TEMPLATE_LABELS = Object.fromEntries(sidesOf([...TEMPLATE.names]).map((s, i) => [s, TEMPLATE.sides[i]]));

/**
 * A traced triangle beside the template, as a case of K1: `held` is the world's own verdict (`pair.js › sameShape`: it
 * covers the template exactly, scaled, turned or flipped). `round`: the experiment's round it is (none: the mirror's).
 */
export function stoneCase(stone, extra = {}) {
  const held = sameShape(TEMPLATE.sides, stone.sides);
  const two = (labels) => ({
    ...lie(fromSides(stone.sides, [...stone.names]), stone),
    labels: labels ? Object.fromEntries(sidesOf([...stone.names]).map((s, i) => [s, stone.sides[i]])) : {},
  });
  const scene = sceneOf({
    one: { ...fromSides(TEMPLATE.sides, [...TEMPLATE.names]), labels: TEMPLATE_LABELS },
    two: two(true),
    aria: `Le gabarit ${TEMPLATE.names} et le tracé ${stone.names}, dessinés à part, leurs longueurs en mètres`,
  });
  return {
    of: K.cotes,
    id: `cotes|${stone.names}:${stone.sides.join(';')}|${stone.turn ?? 0}:${stone.flip ? 1 : 0}`,
    stone: { names: stone.names, sides: [...stone.sides], turn: stone.turn ?? 0, flip: Boolean(stone.flip) },
    held,
    head: `Le tracé $${stone.names}$`,
    tag: held ? 'a la forme' : 'pas la forme',
    scene,
    thumb: bare(scene),
    ...extra,
  };
}

/** The stone side each template side is associated with, by a rule's first column. */
function pairing(how, c) {
  if (how === 'noms') return [0, 1, 2];
  const rt = ranks(TEMPLATE.sides);
  const rs = ranks(c.stone.sides);
  const out = [];
  rt.forEach((t, n) => {
    out[t] = rs[n];
  });
  return out;
}
const PAIRS = [
  { id: 'rang', label: 'du plus petit au plus grand', phrase: 'leurs côtés associés du plus petit au plus grand' },
  { id: 'noms', label: 'dans l’ordre des noms', phrase: 'leurs côtés associés dans l’ordre des noms' },
];
/** What a rule's second column compares, on the associated sides: quotients « stone ÷ template », or differences. */
const quotientsOf = (p, c) => p.map((s, t) => over(c.stone.sides[s], TEMPLATE.sides[t]));
const differencesOf = (p, c) => p.map((s, t) => minus(c.stone.sides[s], TEMPLATE.sides[t]));
const allSame = (xs) => equal(xs[0], xs[1]) && equal(xs[1], xs[2]);
const twoSame = (xs) => equal(xs[0], xs[1]) || equal(xs[1], xs[2]) || equal(xs[0], xs[2]);
const TESTS = [
  {
    id: 'trois',
    label: 'les trois quotients égaux',
    phrase: 'les trois quotients sont égaux',
    v: (p, c) => allSame(quotientsOf(p, c)),
  },
  {
    id: 'deux',
    label: 'deux quotients égaux sur trois',
    phrase: 'deux des trois quotients sont égaux',
    v: (p, c) => twoSame(quotientsOf(p, c)),
  },
  {
    id: 'diff',
    label: 'la même différence partout',
    phrase: 'les trois différences sont égales',
    v: (p, c) => allSame(differencesOf(p, c)),
  },
];

const J1 = judge({
  slots: [
    { id: 'pair', label: 'Les côtés associés :', options: PAIRS },
    { id: 'test', label: 'Alors :', options: TESTS },
  ],
  right: { pair: 'rang', test: 'trois' },
  says: (rule, c, tile) => tile.test[rule.test].v(pairing(rule.pair, c), c),
});

/** His rule on a case, in formulas: the associated sides, « 4,5 ÷ 3 = … » or « 4 − 3 = … », never evaluated. */
function chain1(rule, c) {
  const p = pairing(rule.pair, c);
  const diff = rule.test === 'diff';
  const op = diff ? '-' : '\\div';
  const terms = p.map((s, t) => `${tx(c.stone.sides[s])} ${op} ${tx(TEMPLATE.sides[t])}`);
  return chainOf(terms, diff ? differencesOf(p, c) : quotientsOf(p, c));
}

/** The order the mirror reads his tracés in: the world's « no » first, then the mason's links, then the others. */
const ORDER1 = ['one', 'diff', 'turn', 'sim', 'red'];
const byOrder = (order) => (rows) => {
  const his = rows.filter((r) => !r.mirror);
  const at = (r) => (order.includes(r.round) ? order.indexOf(r.round) : order.length);
  return [...[...his].sort((x, y) => at(x) - at(y)), ...rows.filter((r) => r.mirror)];
};

/** His evidence: one case per tracé he laid (oldest first), then the mirror's. */
function evidenceOf(key) {
  return (rows) => {
    const own = rows.filter((r) => r.of === key);
    const uniq = own.filter((c, i) => own.findIndex((x) => x.id === c.id) === i);
    return [...uniq.filter((c) => !c.mirror), ...uniq.filter((c) => c.mirror)];
  };
}

/** A tracé of the experiment's round, as his case. */
const roundCase1 = (i, row = {}) => {
  const r = PAIR_INQUIRY.rounds[i];
  return stoneCase(r.stone, { round: r.id, said: row.said ?? null });
};
export const PAIR_CASES = PAIR_INQUIRY.rounds.map((_, i) => roundCase1(i));

/**
 * THE MIRROR'S TRACÉS of K1 — a round's numbers under other names, lying otherwise (each screen CLEAR, `ts-pairs.py`):
 *   YES  XYZ 1,9 ; 1,5 ; 1 (RED's sides)   the shape       NO  PQR 4,8 ; 3 ; 4 (DIFF's)   not the shape
 * and, for the robot's nudges, three more pairs of a « yes » and a « no » (SIM's, RED's sides; ONE's, DIFF's).
 */
const S = (names, sides, turn = 0, flip = false) => stoneCase({ names, sides, turn, flip });
export const F1_HARD = [S('XYZ', ['1,9', '1,5', '1'], 210), S('PQR', ['4,8', '3', '4'], 300)];
const F1_NUDGES = [
  [S('KLM', ['3', '4,5', '5,7'], 60, true), S('UVW', ['5,1', '3', '4,5'], 140)],
  [S('EFG', ['1', '1,9', '1,5'], 100, true), S('RSW', ['4', '4,8', '3'], 20)],
  [S('HJK', ['5,7', '3', '4,5'], 330), S('DGN', ['4,5', '5,1', '3'], 250, true)],
];
const F1_POOL = [...F1_HARD, ...F1_NUDGES.flat()];

/** The last step (design): MNP, turned, its sides marked « court · moyen · long », only [MN] = 12 m written. */
const U1 = NUMBERS.cotes.use;
export const USE1 = (() => {
  const stone = { names: 'MNP', sides: [U1.given, U1.short, U1.long], turn: 160, flip: false };
  // drawn SMALLER than its true size (× 1,6 the template, not × 4): at × 4 the template's labels crowded a sliver; every
  // length written is the case's
  const drawn = stone.sides.map((x) => (num(x) * 1.6) / 4);
  const scene = sceneOf({
    one: { ...fromSides(TEMPLATE.sides, [...TEMPLATE.names]), labels: TEMPLATE_LABELS },
    two: {
      ...lie(fromSides(drawn, [...stone.names]), stone),
      labels: { MN: `${U1.given} · ${U1.marked}`, NP: 'court ?', PM: 'long ?' },
    },
    aria: 'Le gabarit ABC et le tracé MNP, dessinés à part : MN mesure 12 mètres, côté moyen',
  });
  return { ...stoneCase(stone), id: 'cotes|use|MNP', scene, thumb: bare(scene) };
})();
const TEMPLATE_SIDES = [
  { id: 'AB', text: '[AB]' },
  { id: 'BC', text: '[BC]' },
  { id: 'AC', text: '[AC]' },
];

const forge1 = {
  key: K.cotes,
  ...J1,
  // the two chips read as ONE sentence after the frame « Deux triangles ont la même forme quand : » (gate B, note 9)
  chip: (s, o) => (s.id === 'pair' ? `on associe les côtés ${o.label}` : `et ${J1.tile.test[o.id].phrase}`),
  ruleText: frAll(
    (rule) =>
      `Deux triangles ont la même forme quand, ${J1.tile.pair[rule.pair].phrase}, ${J1.tile.test[rule.test].phrase}.`,
  ),
  explain: frAll(
    (rule, c) =>
      `Ta règle sur le tracé $${c.stone.names}$ : ${chain1(rule, c)}. Elle dit qu'il ${same(J1.says(rule, c))} du gabarit.`,
  ),
  caseId: (c) => c.id,
  evidence: evidenceOf(K.cotes),
  tests: (rule, rows) => byOrder(ORDER1)(rows),
  inquiry: PAIR_INQUIRY,
  fromInquiry: (result) => ({ rows: evidenceOf(K.cotes)(result.rows.map((r) => roundCase1(r.round, r))) }),
  predictCases: noPredictions,
  attacks: (rule, rows) => attacksOf({ ...J1, caseId: (c) => c.id, pool: () => F1_POOL, hard: F1_HARD })(rule, rows),
  nudge: (k) => ({ kind: 'experiment', cases: F1_NUDGES[Math.min(3, Math.max(1, k)) - 1] }),
  use: {
    make: () => USE1,
    figure: () => USE1,
    column: true,
    lines: () => [
      line(['[MN] est associé à', choiceBox('pair', 'le côté du gabarit', TEMPLATE_SIDES)]),
      line(['$k$ =', fractionBox('kn', 'kd', { w: 2 }), '=', decimalBox('k', 'k', 4)]),
      line(['$NP$ =', decimalBox('np', 'NP', 4), 'm', ' ;', '$PM$ =', decimalBox('pm', 'PM', 5), 'm']),
    ],
    check(c, v) {
      const [n, d] = [typedWhole(v.kn), typedWhole(v.kd)];
      const frac = n != null && d ? over(String(n), String(d)) : null;
      const k = U1.k;
      const is = (x, want) => typedNumber(x) != null && equal(typedNumber(x), want);
      return firstWrong([
        [v.pair === 'AB' ? 'short' : 'pair', v.pair === 'BC'],
        [frac && n && equal(over('1', frac), k) ? 'inverse' : 'frac', frac != null && equal(frac, k)],
        ['k', is(v.k, k)],
        ['np', is(v.np, U1.short)],
        ['pm', is(v.pm, U1.long)],
      ]);
    },
  },
  text: frAll({
    sub: THALES_TEXT.sub,
    next: THALES_TEXT.next,
    fire: THALES_TEXT.fire,
    title: 'La table des maçons',
    log: 'Les tracés posés sur le gabarit',
    frame: 'Deux triangles ont la même forme quand :',
    buildLead:
      'Une tuile par colonne : comment associer les côtés, puis ce qui doit être vrai. Le miroir l’essaie sur tes tracés.',
    testing: 'Le miroir essaie ta règle sur tes tracés, un par un…',
    agreed:
      'Ta règle s’accorde avec tous tes tracés. Maintenant, le miroir la met au défi avec des tracés que tu n’as pas vus.',
    survived: 'Ta règle a tenu : le tracé a fait ce qu’elle disait.',
    yes: 'a la forme',
    no: 'pas la forme',
    says: (yes) => `Ta règle : ${sameAll(yes)}`,
    refuted: (m) =>
      m.says
        ? `Ta règle dit que le tracé ${m.stone.names} a la forme du gabarit. Pourtant, posé sur le gabarit, il ne le recouvre pas.`
        : `Ta règle dit que le tracé ${m.stone.names} n’a pas la forme du gabarit. Pourtant, posé sur le gabarit, il le recouvre exactement.`,
    attack: (c) =>
      `Le miroir trace $${c.stone.names}$ à côté du gabarit $${TEMPLATE.names}$, ses longueurs en mètres sur la figure. Ce tracé a-t-il la forme du gabarit ?`,
    broken: (yes) =>
      `Ta règle s’est cassée ici : elle disait « ${sameAll(yes)} », et le tracé ${yes ? 'ne recouvre pas' : 'recouvre'} le gabarit.`,
    wordsHint: 'Par exemple : on associe les côtés…',
    experiment: 'Regarde bien : deux tracés du miroir. Lequel recouvre le gabarit, une fois posé dessus ?',
    tryKey: () => `$MNP$ a la forme du gabarit $ABC$ ; son côté moyen $MN = 12$ m. Calcule $k$, $NP$ et $PM$.`,
    use: {
      short: '[MN] est le côté moyen : pas le plus court du gabarit.',
      pair: '[MN] est le côté moyen : associe-le au côté moyen.',
      inverse: 'À l’envers : le tracé en haut, le gabarit en bas.',
      frac: 'Le quotient : [MN], puis son côté associé du gabarit.',
      k: 'k : la valeur de ce quotient.',
      np: 'NP : le côté court du gabarit, multiplié par k.',
      pm: 'PM : le côté long du gabarit, multiplié par k.',
    },
    useOk: 'Deux longueurs que personne n’a mesurées, et le nombre k : ta clé fonctionne !',
  }),
};

// ═════════════════════════ 2. 'angles-egaux' — the angles ═════════════════════════

const rad = (d) => (d * Math.PI) / 180;
const deg = (x) => `${write(x)}°`;

/** One triangle of a round as `figures.js` draws it (its written numbers as labels when `labels`), or null (open). */
function drawTri(round, which, labels = true) {
  const t = round[which];
  const T = triOf(round, which);
  const [P, Q, R] = T.names;
  if (T.between) {
    const [p, q] = T.between.sides.map(num);
    const a = rad(num(T.between.angle));
    const tri = {
      names: [...T.names],
      coords: [
        [0, 0],
        [p, 0],
        [q * Math.cos(a), q * Math.sin(a)],
      ],
    };
    return {
      ...lie(tri, t),
      labels: labels ? { [P + Q]: T.between.sides[0], [R + P]: T.between.sides[1] } : {},
      angles: { [P]: labels ? deg(T.between.angle) : '' },
    };
  }
  if (!T.closes) return null;
  // the sides are as the sines of the angles they face (drawing only); the written side at its length, else 5
  const sin = T.angles.map((x) => Math.sin(rad(num(x))));
  const unit = (T.side != null ? num(T.side) : 5) / sin[T.opp];
  // [PQ, QR, RP] face R, P and Q
  const tri = fromSides([sin[2] * unit, sin[0] * unit, sin[1] * unit], [...T.names]);
  const facing = [Q + R, R + P, P + Q];
  return {
    ...lie(tri, t),
    labels: labels && T.side != null ? { [facing[T.opp]]: T.side } : {},
    // each measure inside its own angle: `figures.js › fitAngleLabels`
    angles: Object.fromEntries(T.names.map((n, i) => [n, labels ? deg(T.angles[i]) : ''])),
  };
}
const nameOf = (round, which) => round[which].names;
function sceneOfRound(round, labels = true, { gap, layout } = {}) {
  const two = drawTri(round, 'b', labels);
  return sceneOf({
    one: drawTri(round, 'a', labels),
    two,
    gap,
    layout,
    aria: two
      ? `Les triangles ${nameOf(round, 'a')} et ${nameOf(round, 'b')}, posés à part`
      : `Le triangle ${nameOf(round, 'a')}, les angles du bloc ${nameOf(round, 'b')} ne ferment pas`,
  });
}

const sortedEq = (xs, ys) => {
  const s = (l) => [...l].sort((p, q) => num(p) - num(q));
  const [p, q] = [s(xs), s(ys)];
  return p.length === q.length && p.every((x, i) => equal(x, q[i]));
};

/**
 * Two triangles of a round, as a case of K2: what each WRITES (`angles` — all three in a round of angles, the one between
 * the two sides in a round of sides; `sides` — the two sides of a round of sides), and `held`: the world's own verdict —
 * the same three angles (both closing), or two sides proportional around the same angle (`angles.js › slideOf`).
 */
export function anglesCase(round, extra = {}) {
  const A = triOf(round, 'a');
  const B = triOf(round, 'b');
  const sides = Boolean(A.between);
  const open = !A.closes || !B.closes;
  const held = sides ? slideOf(round).fact === 'covers' : !open && sortedEq(A.angles, B.angles);
  const scene = sceneOfRound(round);
  const [a, b] = [A.names.join(''), B.names.join('')];
  const desc = (T) => (T.between ? `${T.between.sides.join(';')}@${T.between.angle}` : T.angles.join(';'));
  return {
    of: K.angles,
    id: `angles|${a}:${desc(A)}|${b}:${desc(B)}|${round.b.turn ?? 0}:${round.b.flip ? 1 : 0}`,
    round: round.id ?? null,
    kind: sides ? 'sides' : 'angles',
    names: [a, b],
    angles: sides ? [[A.between.angle], [B.between.angle]] : [A.angles, B.angles],
    sides: sides ? [A.between.sides, B.between.sides] : null,
    open,
    held,
    head: `$${a}$ et $${b}$`,
    tag: open ? 'ne ferme pas' : held ? 'même forme' : 'autre forme',
    scene,
    thumb: bare(scene),
    ...extra,
  };
}

/** Equal angles of the two triangles, matched one to one: [x of a, the same of b]. */
function matched(xs, ys) {
  const free = [...ys];
  const out = [];
  for (const x of xs) {
    const j = free.findIndex((y) => y != null && equal(x, y));
    if (j >= 0) {
      out.push(x);
      free[j] = null;
    }
  }
  return out;
}
/** Two angles of a (i ≠ j) and two of b (m ≠ n) with a = b × the same number other than 1: [i, j, m, n] or null. */
function twoTimes(xs, ys) {
  for (let i = 0; i < xs.length; i += 1)
    for (let j = 0; j < xs.length; j += 1)
      for (let m = 0; m < ys.length; m += 1)
        for (let n = 0; n < ys.length; n += 1)
          if (i !== j && m !== n && !equal(xs[i], ys[m]) && equal(times(xs[i], ys[n]), times(xs[j], ys[m])))
            return [i, j, m, n];
  return null;
}
/** One angle of a and one of b that differ (b = a × a number other than 1): [i, m] or null. */
function oneTimes(xs, ys) {
  for (let i = 0; i < xs.length; i += 1) for (let m = 0; m < ys.length; m += 1) if (!equal(xs[i], ys[m])) return [i, m];
  return null;
}
const sidesEqual = ([p, q], [r, s]) => sortedEq([p, q], [r, s]);
/** The two sides of b are those of a × the same number other than 1: [b's side over a's, the other] or null. */
function sidesTimes([p, q], [r, s]) {
  for (const [x, y] of [
    [r, s],
    [s, r],
  ])
    if (equal(times(x, q), times(y, p)) && !equal(x, p)) return [x, y];
  return null;
}

const WHAT = [
  { id: 'deux', label: 'deux paires d’angles', reads: 'angles' },
  { id: 'un', label: 'une paire d’angles', reads: 'any' },
  { id: 'cotes', label: 'deux paires de côtés', reads: 'sides' },
];
const HOW = [
  { id: 'egaux', label: 'égaux d’un triangle à l’autre' },
  { id: 'fois', label: '× un même nombre autre que 1' },
];
/** The design's sentences, one per rule. */
const RULE2 = {
  'deux:egaux': 'deux angles de l’un sont égaux à deux angles de l’autre',
  'un:egaux': 'un angle de l’un est égal à un angle de l’autre',
  'cotes:egaux': 'deux côtés de l’un sont égaux à deux côtés de l’autre',
  'deux:fois': 'deux angles de l’un sont ceux de l’autre multipliés par un même nombre autre que 1',
  'un:fois': 'un angle de l’un est un angle de l’autre multiplié par un nombre autre que 1',
  'cotes:fois': 'deux côtés de l’un sont proportionnels à deux côtés de l’autre',
};
/** Can the rule be read on the case: does the case write two angles (or two sides) of each triangle? */
export const readable = (rule, c) => {
  const r = WHAT.find((w) => w.id === rule.what).reads;
  return r === 'any' || (r === 'angles' ? c.kind === 'angles' : c.kind === 'sides');
};
function says2(rule, c) {
  if (!readable(rule, c)) return false;
  const [xs, ys] = c.angles;
  const egaux = rule.how === 'egaux';
  if (rule.what === 'deux') return egaux ? matched(xs, ys).length >= 2 : twoTimes(xs, ys) != null;
  if (rule.what === 'un') return egaux ? matched(xs, ys).length >= 1 : oneTimes(xs, ys) != null;
  return egaux ? sidesEqual(...c.sides) : sidesTimes(...c.sides) != null;
}
const J2 = judge({
  slots: [
    { id: 'what', label: 'Ce qu’on compare :', options: WHAT },
    { id: 'how', label: 'D’un triangle à l’autre :', options: HOW },
  ],
  right: { what: 'deux', how: 'egaux' },
  says: (rule, c) => says2(rule, c),
});

const dg = (x) => `${tx(x)}^\\circ`;
/** What his rule reads on a case, as a formula (MathText) — or why it cannot read it. */
function reading2(rule, c) {
  const [a, b] = c.names;
  if (!readable(rule, c))
    return rule.what === 'cotes'
      ? `un seul côté de chaque triangle est écrit, ta règle n’en voit pas deux`
      : `un seul angle de chaque triangle est écrit, ta règle n’en voit pas deux`;
  const [xs, ys] = c.angles;
  if (rule.what === 'cotes') {
    const [[p, q], [r, s]] = c.sides;
    if (rule.how === 'egaux')
      return `les côtés de $${a}$ : $${tx(p)}$ et $${tx(q)}$, ceux de $${b}$ : $${tx(r)}$ et $${tx(s)}$`;
    const t = sidesTimes([p, q], [r, s]);
    return t
      ? `$${tx(t[0])} \\div ${tx(p)} = ${tx(t[1])} \\div ${tx(q)}$`
      : `$${tx(r)} \\div ${tx(p)} \\neq ${tx(s)} \\div ${tx(q)}$ et $${tx(s)} \\div ${tx(p)} \\neq ${tx(r)} \\div ${tx(q)}$`;
  }
  const list = (ns) => ns.map(dg).join(' ; ');
  const head = `les angles de $${a}$ : $${list(xs)}$ ; ceux de $${b}$ : $${list(ys)}$`;
  if (rule.how === 'egaux') {
    const m = matched(xs, ys);
    return `${head} — ${m.length === 0 ? 'aucun n’est égal' : `égaux : $${m.map(dg).join(' ; ')}$`}`;
  }
  const f = rule.what === 'deux' ? twoTimes(xs, ys) : oneTimes(xs, ys);
  if (!f) return `${head} — aucun nombre ne convient`;
  if (rule.what === 'un') {
    const [i, m] = f;
    return `${head} — $${dg(ys[m])} = ${dg(xs[i])} \\times ${tx(over(ys[m], xs[i]))}$`;
  }
  const [i, j, m, n] = f;
  const k = over(ys[m], xs[i]);
  return `${head} — $${dg(ys[m])} = ${dg(xs[i])} \\times ${tx(k)}$ et $${dg(ys[n])} = ${dg(xs[j])} \\times ${tx(k)}$`;
}

/** The order the mirror reads his rounds in: the slides that failed first, then the one that covered. */
const ORDER2 = ['r2', 'r3', 'r4', 'r1'];
const roundCase2 = (i, row = {}) => anglesCase(ANGLES_INQUIRY.rounds[i], { said: row.said ?? null });
export const ANGLES_CASES = ANGLES_INQUIRY.rounds.map((_, i) => roundCase2(i));

/**
 * THE MIRROR'S PAIRS of K2 — a round's numbers under other names and lies (each screen CLEAR):
 *   YES  KLM 41° ; 112° (27°), side 6 facing 112° — QRS 27° ; 112° (41°), side 8 facing 112°   (R1's numbers)
 *   NO   TUV 41° ; 27° (112°), side 6 facing 27° — XYZ 55° ; 27° (98°), side 8 facing 27°      (R2's numbers)
 *   SIDE DEF 4 ; 6 at 27° — GHI 4 ; 6 at 41°: two sides equal, another shape                    (R4's numbers)
 * Every one of them is read by the right rule as it is (none is a round of sides with the same shape: the right rule
 * cannot read a round of sides, and says « no » there).
 */
const angPair = (a, b, turn, flip = false) => anglesCase({ a: { ...a }, b: { ...b, turn, flip } });
const yesPair = (n, m, turn, flip) =>
  angPair(
    { names: n, angles: ['41', '112'], side: '6', opp: 1 },
    { names: m, angles: ['27', '112'], side: '8', opp: 1 },
    turn,
    flip,
  );
const noPair = (n, m, turn, flip) =>
  angPair(
    { names: n, angles: ['41', '27'], side: '6', opp: 1 },
    { names: m, angles: ['55', '27'], side: '8', opp: 1 },
    turn,
    flip,
  );
const sidePair = (n, m, turn, flip) =>
  angPair(
    { names: n, between: { sides: ['4', '6'], angle: '27' } },
    { names: m, between: { sides: ['4', '6'], angle: '41' } },
    turn,
    flip,
  );
export const F2_HARD = [yesPair('KLM', 'QRS', 60), noPair('TUV', 'XYZ', 160)];
export const F2_SIDE = sidePair('DEF', 'GHI', 200, true);
const F2_NUDGES = [
  [yesPair('EFG', 'HJK', 120, true), noPair('LMN', 'PQR', 40)],
  [yesPair('RST', 'UVW', 280), sidePair('ABC', 'XYZ', 100)],
  [yesPair('DGH', 'JKM', 210, true), noPair('NPQ', 'STU', 300, true)],
];
const F2_POOL = [...F2_HARD, F2_SIDE, ...F2_NUDGES.flat()];

/**
 * The last step (design): equal angles 27°, 41°, 112°, apart and flipped; sides named by letters only. Both drawn the SAME
 * size (`opp`: the side facing 112° is 5 units in each — the walk of 2026-11-27 drew ABC 80 px wide beside a big XYZ,
 * its labels piled under C), one below the other, half a width apart (`diag`), so each angle's label stands inside its own angle.
 */
const USE2_ROUND = {
  a: { names: 'ABC', angles: [...NUMBERS.angles.use.angles], opp: 2 },
  b: { names: 'XYZ', angles: ['41', '112', '27'], turn: 221, flip: true, opp: 1 },
};
const USE2_LAYOUT = { layout: 'diag', gap: 0.12 };
export const USE2 = (() => {
  const h = homologues(USE2_ROUND);
  const scene = sceneOfRound(USE2_ROUND, true, USE2_LAYOUT);
  return {
    ...anglesCase(USE2_ROUND),
    id: 'angles|use|ABC-XYZ',
    vertex: h.vertex,
    side: h.side,
    scene,
    thumb: bare(scene),
  };
})();
const VERTICES = ['X', 'Y', 'Z'];
const XYZ_SIDES = [
  { id: 'XY', text: '[XY]' },
  { id: 'YZ', text: '[YZ]' },
  { id: 'XZ', text: '[XZ]' },
];
/** A side's id whichever way it is written: « ZX » → « XZ ». */
const sideId = (s) => [...s].sort().join('');

const forge2 = {
  key: K.angles,
  ...J2,
  chip: (s, o) =>
    // the chips read « deux paires d’angles | égaux d’un triangle à l’autre » (« égaux » agrees with « angles »: gate B, 2026-11-27)
    s.id === 'how' ? (o.id === 'egaux' ? o.label : 'multipliés par un même nombre autre que 1') : o.label,
  ruleText: frAll((rule) => `Deux triangles sont semblables quand ${RULE2[`${rule.what}:${rule.how}`]}.`),
  explain: frAll((rule, c) => `Ta règle lit ${reading2(rule, c)}. Elle dit « ${sameAll(J2.says(rule, c))} ».`),
  caseId: (c) => c.id,
  evidence: evidenceOf(K.angles),
  tests: (rule, rows) => byOrder(ORDER2)(rows).filter((c) => readable(rule, c)),
  inquiry: ANGLES_INQUIRY,
  fromInquiry: (result) => ({ rows: evidenceOf(K.angles)(result.rows.map((r) => roundCase2(r.round, r))) }),
  predictCases: noPredictions,
  attacks: (rule, rows) => attacksOf({ ...J2, caseId: (c) => c.id, pool: () => F2_POOL, hard: F2_HARD })(rule, rows),
  nudge: (k) => ({ kind: 'experiment', cases: F2_NUDGES[Math.min(3, Math.max(1, k)) - 1] }),
  use: {
    make: () => USE2,
    figure: () => USE2,
    column: true,
    lines: () => [
      // one pairing a line: three on one line wrapped « A / ↔ » under each other (the walk of 2026-11-27)
      line(['$A$ va avec', choiceBox('vA', 'le sommet associé à A', VERTICES)]),
      line(['$B$ va avec', choiceBox('vB', 'le sommet associé à B', VERTICES)]),
      line(['$C$ va avec', choiceBox('vC', 'le sommet associé à C', VERTICES)]),
      line(['Le côté homologue de [AB] :', choiceBox('side', 'le côté homologue de [AB]', XYZ_SIDES)]),
    ],
    check(c, v) {
      const byName = { A: 'X', B: 'Y', C: 'Z' };
      const vertex = (n) => [v[`v${n}`] === byName[n] ? 'byNames' : 'vertex', v[`v${n}`] === c.vertex[n]];
      return firstWrong([vertex('A'), vertex('B'), vertex('C'), ['side', v.side === sideId(c.side.AB)]]);
    },
  },
  text: frAll({
    sub: THALES_TEXT.sub,
    next: THALES_TEXT.next,
    fire: THALES_TEXT.fire,
    title: 'La table du pyramidion',
    log: 'Les triangles que tu as fait glisser',
    frame: 'Deux triangles sont semblables quand :',
    buildLead:
      'Une tuile par colonne : ce que tu compares dans les deux triangles, puis comment. Le miroir l’essaie sur tes triangles.',
    testing: 'Le miroir essaie ta règle sur tes triangles, un par un…',
    agreed:
      'Ta règle s’accorde avec tous tes triangles. Maintenant, le miroir la met au défi avec des triangles que tu n’as pas vus.',
    survived: 'Ta règle a tenu : les triangles ont fait ce qu’elle disait.',
    yes: 'même forme',
    no: 'pas la même forme',
    says: (yes) => `Ta règle : ${sameAll(yes)}`,
    refuted: (m) => {
      const [a, b] = m.names;
      if (m.says)
        return m.open
          ? `Ta règle dit que ${a} et ${b} ont la même forme. Pourtant les angles de ${b} ne ferment pas de triangle.`
          : `Ta règle dit que ${a} et ${b} ont la même forme. Pourtant, glissé sur ${b}, ${a} ne le recouvre pas.`;
      return `Ta règle dit que ${a} et ${b} n’ont pas la même forme. Pourtant, glissé sur ${b}, ${a} le recouvre exactement.`;
    },
    attack: (c) =>
      c.kind === 'sides'
        ? `Le miroir pose $${c.names[0]}$ et $${c.names[1]}$ : deux côtés de chacun et l’angle entre eux sont sur la figure. Ont-ils la même forme ?`
        : `Le miroir pose $${c.names[0]}$ et $${c.names[1]}$, leurs angles et un côté de chacun sur la figure. Ont-ils la même forme ?`,
    broken: (yes) =>
      `Ta règle s’est cassée ici : elle disait « ${sameAll(yes)} », et l’un ${yes ? 'ne recouvre pas' : 'recouvre'} l’autre.`,
    wordsHint: 'Par exemple : si deux angles…',
    experiment: 'Regarde bien : deux paires de triangles du miroir. Dans laquelle l’un recouvre-t-il l’autre ?',
    tryKey: () => '$ABC$ et $XYZ$ ont les mêmes angles. Associe chaque sommet, puis trouve le côté homologue de [AB].',
    use: {
      byNames: 'Pas dans l’ordre des noms : un sommet va avec celui qui a le même angle.',
      vertex: 'Un sommet va avec le sommet de l’autre triangle qui a le même angle.',
      side: 'Le côté homologue de [AB] : celui qui joint les deux sommets associés à A et à B.',
    },
    useOk: 'Chaque sommet avec son homologue, et le côté qui leur répond : ta clé fonctionne !',
  }),
};

/** The forges of the lesson, keyed by its keys in the order of the story. */
export const FORGES = {
  [K.cotes]: forge1,
  [K.angles]: forge2,
};
