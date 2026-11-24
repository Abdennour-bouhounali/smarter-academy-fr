/**
 * THE TWO FORGES of lesson `thales-configuration-papillon` « Thalès dans le papillon » — one per key, each of ITS OWN
 * nature (frame: kit/forge.js; screen: kit/RuleForge.jsx; a case of this world and how the mirror draws it:
 * nilePyramids/ruleForge.js › `thalesCase` and nilePyramids/forgeParts.jsx › FORGE_PARTS). No rule is told: every false
 * rule the tiles can write is refuted in front of him by a COMPUTED case, and the rule gets its name only on its tablet
 * (`tablets.js`). Design: docs/reports/UNIT_3E_THALES_DESIGN.md § 2 (K1, K2) — ported from the Algerian lesson
 * `talis-hisab-atwal` (its 🦋 is K1; its 📐 is recast as K2, on butterflies and ONE nested round).
 *
 *   'papillon'                 the experiment `halfturn`, then the tiles « [rapport 1] = [rapport 2] = ER/AF » — 4 × 4 =
 *                              16 rules: a rule says « these three ratios are equal exactly when the two sides are
 *                              parallel ». The parallel round I K L / P Q refutes all fifteen false pairs (the third ratio
 *                              is NAMED when two wrong ratios are equal between themselves); his river comes after it,
 *                              so no refutation ever writes a length he did not measure (SR, SF). The mirror attacks the
 *                              right rule with O U V / W T (k = 2/3), then a crooked pair on the same big triangle. Last
 *                              step: the brevet's sentence (each triple ONE choice) and the three ratios, then OF.
 *   'calcul-depuis-le-sommet'  the experiment `plan` WRITES the rule (`inquiry.writes`): one tile per column; the false
 *                              procedures are refused where he makes them (inquiries.test.js). A case is a length laid
 *                              for an unknown: does it touch? The mirror attacks with the unknown ACROSS the vertex (laid
 *                              right), then with a piece laid at the length from the vertex (it falls short). Last step:
 *                              he CHOOSES the denominator of OA / [ ], cuts OE off AE, computes OF and AB.
 * `forges.test.js` writes every rule the tiles allow, proves exactly one holds, and refutes every other by a computed
 * case. The keys, as LITERALS (the status script finds each id quoted here): 'papillon', 'calcul-depuis-le-sommet'.
 */
import {
  attacksOf,
  choiceBox,
  decimalBox,
  firstWrong,
  givenFraction,
  judge,
  line,
  noPredictions,
  ratioChoice,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { THALES_TEXT, caseId, segName, thalesCase } from '../../../../../../common/gameworld/nilePyramids/ruleForge';
import { chain } from '../../../../../../common/gameworld/nilePyramids/figure';
import { laidOn } from '../../../../../../common/gameworld/nilePyramids/plan';
import {
  isRational,
  lenEqual,
  lenOver,
  lenPlus,
  lenTex,
  lenWrite,
} from '../../../../../../common/gameworld/nilePyramids/surd';
import { HALFTURN_INQUIRY, PLAN_INQUIRY, TURN_RIVER } from './inquiries';
import { K, NUMBERS, compare, equal, frAll, minus, over, plus, read, tex, times, typedNumber, write } from './math';

// ───────────────────────── what both forges share ─────────────────────────

/** A ratio over a real bar, in a MathText sentence. */
const frac = (a, b) => `\\dfrac{${a}}{${b}}`;
/** A number in a MathText sentence (« 22{,}5 », a fraction over a bar). */
const num = (x) => tex(x);
/** A ratio as a fraction in lowest terms, as text: « 4/7 », « 8 ». */
const fr = (x) => {
  const { n, d } = read(x);
  return d === 1n ? String(n) : `${n}/${d}`;
};
/** The same over a real bar, in a formula. */
const rt = (x) => {
  const { n, d } = read(x);
  return d === 1n ? String(n) : `\\dfrac{${n}}{${d}}`;
};
/** A value that may hold a root (the river's SR, SF — `surd.js`): « 1/8 », else the root written exactly. */
const frL = (x) => (isRational(x) ? fr(x) : lenWrite(x));
/** The same in a formula: over a real bar, a root drawn as a root. */
const rtL = (x) => (isRational(x) ? rt(x) : lenTex(x));
/** The triangle of the vertex and two points: « OUV ». */
const tri = (c, a, b) => `${c.names.V}${c.names[a]}${c.names[b]}`;
/** The line under the mirror (`text.eq`, MathText): its formula between dollars, its fractions at text size. */
const eqLine = (t) => `$${t.replace(/\\dfrac/g, '\\tfrac')}$`;
/** A list of formulas in a sentence: « $a$, $b$ et $c$ ». */
const andList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} et ${xs.at(-1)}`);

// ═════════════════════════ 1. 'papillon' — the points on the other side of the vertex ═════════════════════════

/**
 * The tiles are written with the river's letters: S the stake, E and R on this bank, A and F across (S = V, E = M,
 * A = B, R = N, F = C). On a case the lengths ACROSS the stake are EA = SE + SA (VMB) and RF = SR + SF (VNC).
 */
const ONE = [
  { id: 'se_sa', label: 'SE/SA', t: ['VM', 'VB'], v: (c) => lenOver(c.len.VM, c.len.VB) },
  { id: 'se_sf', label: 'SE/SF', t: ['VM', 'VC'], v: (c) => lenOver(c.len.VM, c.len.VC) },
  { id: 'sa_se', label: 'SA/SE', t: ['VB', 'VM'], v: (c) => lenOver(c.len.VB, c.len.VM) },
  { id: 'se_ea', label: 'SE/EA', t: ['VM', 'VMB'], v: (c) => lenOver(c.len.VM, lenPlus(c.len.VM, c.len.VB)) },
];
const TWO = [
  { id: 'sr_sf', label: 'SR/SF', t: ['VN', 'VC'], v: (c) => lenOver(c.len.VN, c.len.VC) },
  { id: 'sr_sa', label: 'SR/SA', t: ['VN', 'VB'], v: (c) => lenOver(c.len.VN, c.len.VB) },
  { id: 'sf_sr', label: 'SF/SR', t: ['VC', 'VN'], v: (c) => lenOver(c.len.VC, c.len.VN) },
  { id: 'sr_rf', label: 'SR/RF', t: ['VN', 'VNC'], v: (c) => lenOver(c.len.VN, lenPlus(c.len.VN, c.len.VC)) },
];
const third1 = (c) => lenOver(c.len.MN, c.len.BC);

const J1 = judge({
  slots: [
    { id: 'one', label: 'Premier rapport :', options: ONE },
    { id: 'two', label: 'Deuxième rapport :', options: TWO },
  ],
  right: { one: 'se_sa', two: 'sr_sf' },
  says: (rule, c, tile) => {
    const [a, b, t] = [tile.one[rule.one].v(c), tile.two[rule.two].v(c), third1(c)];
    return lenEqual(a, b) && lenEqual(b, t);
  },
});
/** The three values of a rule of K1 on a case, as text: his two ratios and the third one, MN/BC. */
export const values1 = (rule, c) => [J1.tile.one[rule.one].v(c), J1.tile.two[rule.two].v(c), third1(c)].map(frL);

/** A pair of triangles round the vertex, as a case of K1: its two triangles name it, the world says if it is parallel. */
export const turnCase = (f) =>
  thalesCase({
    ...f,
    len: { ...f.len },
    of: K.papillon,
    head: f.head ?? `${tri(f, 'M', 'N')} et ${tri(f, 'B', 'C')}`,
    tag: chain(f) ? 'parallèles' : 'de biais',
  });
const asTurn = (names, len) => turnCase({ kind: 'butterfly', names: { ...names }, len: { ...len } });

/**
 * HIS RIVER (dock 3) as a case of K1, whole (`logic.js › riverFigure`: SR = √2785, SF = 8√2785, both lines square to
 * the bank): SE/SA = SR/SF = ER/AF = 1/8. Round 1 of the experiment, and his evidence when the world logs it.
 */
export const RIVER_CASE = turnCase(TURN_RIVER);
/** Is a case his river (the world's row or the experiment's)? */
const isRiver = (r) => r.kind === 'butterfly' && caseId({ ...r, id: undefined }) === caseId(RIVER_CASE);
/** What the world's row of the river carries besides the figure: what he typed for the ferry, the rope's fact. */
const riverExtras = (r) => ({
  ...(r.typed != null ? { typed: r.typed } : {}),
  ...(r.ferry != null ? { ferry: r.ferry } : {}),
  mirror: Boolean(r.mirror),
});

/**
 * THE MIRROR'S FIGURES of K1 (design § 2; numbers in `math.js`, checked pair by pair against the bank by forges.test.js).
 *   O    the attack O U V / W T (k = 2/3: equal)                     a « yes » of the world
 *   OX   crooked on the same big triangle: OU 4, OV 3,9, UV 5,3      8/15, 13/40, 53/135 — a « no »
 * and, for the robot's nudges, the experiment's figures with the roles of the two triangles exchanged (the same numbers,
 * a new case): R2 the parallel one turned round (k = 7/4), X2 its points M and N exchanged (IK 6, IL 4, KL 8 — still
 * exact: cos Î = −1/4, crooked), C3 the crooked one turned round, OP and OXP the attacks turned round.
 */
const PAP = NUMBERS.papillon;
const swapRoles = ({ VM, VB, VN, VC, MN, BC }) => ({ VM: VB, VB: VM, VN: VC, VC: VN, MN: BC, BC: MN });
const swapPoints = ({ VM, VB, VN, VC, MN, BC }) => ({ VM: VN, VB, VN: VM, VC, MN, BC });
export const F1_CASES = {
  O: asTurn(PAP.attacks[0].names, PAP.attacks[0].len),
  OX: asTurn(PAP.attacks[1].names, PAP.attacks[1].len),
  R2: asTurn(PAP.rounds[0].names, swapRoles(PAP.rounds[0].len)),
  X2: asTurn(PAP.rounds[0].names, swapPoints(PAP.rounds[0].len)),
  C3: asTurn(PAP.rounds[1].names, swapRoles(PAP.rounds[1].len)),
  OP: asTurn(PAP.attacks[0].names, swapRoles(PAP.attacks[0].len)),
  OXP: asTurn(PAP.attacks[1].names, swapRoles(PAP.attacks[1].len)),
};
/** The right rule's attacks (design § 2): other letters (k = 2/3) — then a crooked pair on the same big triangle. */
export const F1_HARD = [F1_CASES.O, F1_CASES.OX];
const F1_POOL = Object.values(F1_CASES);

/**
 * His evidence, in the order the mirror reads it: the pairs he turned (rounds 2, 3), then HIS river — whatever the world
 * logged of it (`Game.forgeLog('river')`, his ferry kept) is that same case — then the mirror's cases.
 */
function evidence1(rows) {
  const own = rows
    .filter((r) => r.of === K.papillon || isRiver(r))
    .map((r) => (isRiver(r) ? { ...RIVER_CASE, ...riverExtras(r) } : r));
  const uniq = own.filter((c, i) => own.findIndex((x) => caseId(x) === caseId(c)) === i);
  const his = uniq.filter((c) => !c.mirror);
  return [...his.filter((c) => !isRiver(c)), ...his.filter(isRiver), ...uniq.filter((c) => c.mirror)];
}

const eqWord = (yes) => (yes ? 'égaux' : 'pas égaux');
/** A ratio of K1 on a case, with the case's letters (LaTeX). */
const ratioTex1 = (c, [a, b]) => frac(segName(c, a), segName(c, b));
/** The third ratio of a case, as plain text: « KL/PQ ». */
const thirdPlain = (c) => `${segName(c, 'MN')}/${segName(c, 'BC')}`;

/** The three points of a line through O, as ONE choice (gate A F1): either triple first, its points in any order. */
const TRIPLES = [
  { id: 'AOE', text: 'A, O, E' },
  { id: 'BOF', text: 'B, O, F' },
  { id: 'AOB', text: 'A, O, B' },
  { id: 'EOF', text: 'E, O, F' },
];
const PARALLELS = [
  { id: 'AB_EF', text: '(AB) et (EF)' },
  { id: 'AE_BF', text: '(AE) et (BF)' },
  { id: 'AF_BE', text: '(AF) et (BE)' },
];

const forge1 = {
  key: K.papillon,
  ...J1,
  chip: (s, o) => (s.id === 'two' ? `= ${o.label} = ER/AF` : o.label),
  ruleText: frAll(
    (rule) =>
      `Autour de S, avec (ER) ∥ (AF) : ${J1.tile.one[rule.one].label} = ${J1.tile.two[rule.two].label} = ER/AF.`,
  ),
  explain: frAll((rule, c) => {
    const [a, b, t] = values1(rule, c).map(rtL);
    const yes = J1.says(rule, c);
    const one = J1.tile.one[rule.one];
    const two = J1.tile.two[rule.two];
    return `Ta règle sur cette figure : $${ratioTex1(c, one.t)} = ${a}$ et $${ratioTex1(c, two.t)} = ${b}$, et le troisième rapport $${frac(segName(c, 'MN'), segName(c, 'BC'))} = ${t}$ : elle dit que les trois rapports sont ${eqWord(yes)}.`;
  }),
  caseId,
  evidence: evidence1,
  inquiry: HALFTURN_INQUIRY,
  fromInquiry: (result) => ({
    rows: evidence1(result.rows.map((r) => turnCase(HALFTURN_INQUIRY.rounds[r.round].fig))),
  }),
  predictCases: noPredictions,
  attacks: (rule, rows) => attacksOf({ ...J1, caseId, pool: () => F1_POOL, hard: F1_HARD })(rule, rows),
  // two pairs built in the mirror: parallel on one, crooked on the other — never the hard attacks of the right rule
  nudge(k) {
    const pairs = [
      [F1_CASES.R2, F1_CASES.X2],
      [F1_CASES.R2, F1_CASES.C3],
      [F1_CASES.OP, F1_CASES.OXP],
    ];
    return { kind: 'experiment', cases: pairs[Math.min(3, Math.max(1, k)) - 1] };
  },
  use: {
    make: () => USE1,
    figure: () => USE1_FIG,
    lines: () => [
      line([
        'Les points',
        choiceBox('t1', 'trois points alignés', TRIPLES),
        'sont alignés, ainsi que les points',
        choiceBox('t2', 'trois autres points alignés', TRIPLES),
        '\u202f;',
      ]),
      line(['les droites', choiceBox('par', 'deux droites', PARALLELS), 'sont parallèles. Donc\u00a0:']),
      line([
        { frac: { n: 'OA', d: choiceBox('r1d', 'le dénominateur', ['OE', 'AE', 'OB']) } },
        '=',
        ratioChoice('r2n', 'r2d', ['OB', 'OF', 'BF', 'AB', 'EF']),
        '=',
        ratioChoice('r3n', 'r3d', ['OB', 'OF', 'BF', 'AB', 'EF']),
      ]),
      line(['OF', '=', decimalBox('of', 'OF', 4), 'm']),
    ],
    check(c, v) {
      const pair = [v.t1, v.t2].sort().join('|');
      const r2 = `${v.r2n}/${v.r2d}`;
      const r3 = `${v.r3n}/${v.r3d}`;
      const ratios = [r2, r3].sort().join('|');
      const of = typedNumber(v.of);
      const ofAcross = write(over(times(c.len.VN, plus(c.len.VM, c.len.VB)), c.len.VM));
      return firstWrong([
        ['align', pair === 'AOE|BOF'],
        ['par', v.par === 'AB_EF'],
        [v.r1d === 'AE' ? 'across' : 'first', v.r1d === 'OE'],
        [[v.r2n, v.r2d, v.r3n, v.r3d].includes('BF') ? 'across' : 'ratios', ratios === 'AB/EF|OB/OF'],
        [of != null && equal(of, ofAcross) ? 'ofAcross' : 'of', of != null && equal(of, c.len.VC)],
      ]);
    },
  },
  text: frAll({
    ...THALES_TEXT,
    title: 'La table du Nil',
    log: 'Ce que tu as fait tourner',
    frame: 'Sur la rive :',
    buildLead:
      'Un rapport dans chaque colonne : avec le troisième, trois rapports égaux. Le miroir les calcule sur ce que tu as fait tourner.',
    testing: 'Le miroir calcule tes rapports sur ce que tu as fait tourner, figure par figure…',
    agreed:
      'Ta règle s’accorde avec tout ce que tu as fait tourner. Maintenant, le miroir la met au défi avec d’autres lettres.',
    yes: 'égaux',
    no: 'pas égaux',
    says: (yes) => `Ta règle : ${eqWord(yes)}`,
    refuted: (m) =>
      m.held
        ? `Ta règle dit que tes deux rapports ne valent pas le troisième, ${thirdPlain(m)}. Pourtant les côtés sont parallèles ici : après le demi-tour, les trois repères se sont alignés.`
        : `Ta règle dit que les trois rapports sont égaux dans ${m.head}. Pourtant les côtés ne sont pas parallèles : après le demi-tour, les repères ne se sont pas alignés.`,
    attack: (c) =>
      `Le miroir met ta règle au défi : les triangles $${tri(c, 'M', 'N')}$ et $${tri(c, 'B', 'C')}$ autour de $${c.names.V}$, leurs longueurs sur la figure. Les trois rapports sont-ils égaux ?`,
    survived: 'Ta règle a tenu : les rapports ont fait ce qu’elle disait.',
    broken: (yes) =>
      `Ta règle s’est cassée ici : elle disait « ${eqWord(yes)} », et les rapports sont ${eqWord(!yes)}.`,
    wordsHint: 'Par exemple : autour du point d’intersection…',
    experiment:
      'Regarde bien : deux figures construites par le miroir. Dans laquelle les trois repères sont-ils alignés ?',
    eq: (c) =>
      eqLine(
        `${ratioTex1(c, ['VM', 'VB'])} = ${rtL(lenOver(c.len.VM, c.len.VB))} \\;;\\; ${ratioTex1(c, ['VN', 'VC'])} = ${rtL(lenOver(c.len.VN, c.len.VC))} \\;;\\; ${frac(segName(c, 'MN'), segName(c, 'BC'))} = ${rtL(third1(c))}`,
      ),
    tryKey: (c) =>
      `$(AE)$ et $(BF)$ sécantes en $O$, $(AB) \\parallel (EF)$ : $OA = ${num(c.len.VM)}$ m, $OE = ${num(c.len.VB)}$ m, $OB = ${num(c.len.VN)}$ m, $EF = ${num(c.len.BC)}$ m. Écris la phrase et calcule $OF$.`,
    use: {
      align: 'Les points alignés : deux droites passent par O, chacune porte trois points de la figure.',
      par: 'Les droites parallèles : celles que l’énoncé donne parallèles, les deux côtés qui ne passent pas par O.',
      first: 'Le premier rapport : OA, et la longueur de la même droite, de l’autre côté de O.',
      across: 'AE et BF traversent le point O : ce ne sont pas des longueurs depuis O.',
      ratios: 'Les deux autres rapports : OB avec la longueur de sa droite de l’autre côté de O, puis AB avec EF.',
      ofAcross: 'OF : c’est ce que donne AE, la longueur qui traverse O, et non OE.',
      of: 'OF : le rapport qui contient OF et trois longueurs connues, puis le rapport qui lui est égal.',
    },
    useOk: 'La phrase complète, les trois rapports et la longueur sur l’autre rive : ta clé fonctionne !',
  }),
};

/** The last step (design § 2): (AE), (BF) secant at O, (AB) ∥ (EF) — OA 4,2 m, OE 7 m, OB 5,1 m, EF 9 m → OF = 8,5 m. */
export const USE1 = thalesCase({ kind: 'butterfly', names: { ...PAP.use.names }, len: { ...PAP.use.len } });
/**
 * OA, OE, OB and EF given; OF asked (AB = 5,4 is neither given nor asked). Drawn SCHEMATIC (`figure.js › draw`, the
 * same lengths on the two lines, the angle at O closed to 44°): at its true angle (70°) it stands 256 px tall at its
 * 12 px label floor, over the 250 px beside the lines. Every length written is the case's.
 */
export const USE1_FIG = {
  ...USE1,
  draw: { ...USE1.len, MN: '3,6', BC: '6' },
  show: ['VM', 'VB', 'VN', 'BC', 'VC'],
  ask: ['VC'],
  parallel: true,
};

// ═════════════════════════ 2. 'calcul-depuis-le-sommet' — every length from the vertex ═════════════════════════

/**
 * Per figure kind, the two lines through the vertex as a whole and its two parts (`plan.js`): on a nested figure a side
 * and its pieces; on a butterfly the length ACROSS the vertex and its two lengths from the vertex.
 */
const SIDES = {
  nested: [
    ['VB', 'VM', 'MB'],
    ['VC', 'VN', 'NC'],
  ],
  butterfly: [
    ['VMB', 'VM', 'VB'],
    ['VNC', 'VN', 'VC'],
  ],
};
/** The three ratio cards: every term a length FROM THE VERTEX. */
const RATIOS = [
  ['VM', 'VB'],
  ['VN', 'VC'],
  ['MN', 'BC'],
];
/**
 * THE PROCEDURE of K2, run on what is GIVEN only: join the two pieces of a line (or cut one off), find a ratio whose two
 * terms are known, then the unknown from it. → { value, steps } — or null when the data cannot give it.
 */
export function planValue(c) {
  const known = Object.fromEntries(c.given.map((k) => [k, c.len[k]]));
  const steps = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const [whole, a, b] of SIDES[c.kind]) {
      if (known[whole] == null && known[a] != null && known[b] != null) {
        known[whole] = write(plus(known[a], known[b]));
        steps.push({ op: '+', a, b, out: whole });
        changed = true;
      }
      for (const [x, y] of [
        [a, b],
        [b, a],
      ])
        if (known[y] == null && known[whole] != null && known[x] != null) {
          known[y] = write(minus(known[whole], known[x]));
          steps.push({ op: '-', a: whole, b: x, out: y });
          changed = true;
        }
    }
    if (known[c.unknown] != null) break;
    const full = RATIOS.find(([t, b]) => known[t] != null && known[b] != null);
    const open = full && RATIOS.find(([t, b]) => (known[t] == null) !== (known[b] == null));
    if (open) {
      const k = over(known[full[0]], known[full[1]]);
      const [t, b] = open;
      if (known[t] == null) known[t] = write(times(known[b], k));
      else known[b] = write(over(known[t], k));
      steps.push({ op: 'ratio', with: full, on: open });
      changed = true;
    }
  }
  return known[c.unknown] == null ? null : { value: known[c.unknown], steps };
}

/** The world's word under a laid length: a course on the face, a rope from the vertex (`plan.js › laidOn`). */
const LAID = {
  course: { fits: 'touche', gap: 'un vide', overhang: 'dépasse' },
  line: { fits: 'atteint', gap: 'trop courte', overhang: 'trop longue' },
};
/** A length laid at `typed` for the unknown of a figure, from what is given: does it touch? */
export function courseCase(f, given, unknown, typed, extra = {}) {
  const c = thalesCase({ ...f, len: { ...f.len } });
  const truth = c.len[unknown];
  const cmp = compare(typed, truth);
  return {
    ...c,
    ...extra,
    of: K.calcul,
    id: `plan|${caseId({ ...c, id: undefined })}|${unknown}|${write(typed)}`,
    given: [...given],
    unknown,
    typed: write(typed),
    held: cmp === 0,
    show: [...given],
    parallel: true,
    head: `${segName(c, unknown)} dans ${c.kind === 'butterfly' ? `${tri(c, 'M', 'N')} et ${tri(c, 'B', 'C')}` : tri(c, 'B', 'C')}`,
    tag: LAID[laidOn(c, unknown)][cmp === 0 ? 'fits' : cmp < 0 ? 'gap' : 'overhang'],
  };
}

/**
 * The right rule's attacks (design § 2): (a) the butterfly of round 3, the unknown ACROSS the vertex — BF laid at 38,5
 * (« yes »: OF = 27,5, joined to OB = 11); (b) the nested figure of round 2, the unknown a piece — NC laid at 4,5, the
 * length from the vertex AN (« no »: NC = 9).
 */
const CAL = NUMBERS.calcul;
const attackFig = (a) => ({
  kind: a.kind,
  names: { ...a.names },
  len: { ...a.len, ...(a.across ?? {}), ...(a.pieces ?? {}) },
});
const [ATTACK_A, ATTACK_B] = CAL.attacks;
export const F2_HARD = [
  courseCase(attackFig(ATTACK_A), ['VM', 'VB', 'VN'], ATTACK_A.asked, ATTACK_A.across.VNC),
  courseCase(attackFig(ATTACK_B), ['VB', 'VM', 'VC'], ATTACK_B.asked, ATTACK_B.short),
];

const J2 = judge({
  slots: [
    { id: 'side', label: 'Chaque longueur d’un rapport :', options: [{ id: 'vertex', label: 'part du sommet' }] },
    { id: 'pair', label: 'Puis :', options: [{ id: 'two', label: 'deux rapports avec l’inconnue' }] },
  ],
  right: { side: 'vertex', pair: 'two' },
  says: (rule, c) => {
    const p = planValue(c);
    return p != null && equal(p.value, c.typed);
  },
});
const RULE2 = { side: 'vertex', pair: 'two' };

/** His plan on a case, in words: the joins and cuts, then the ratios — and the length it gives (MathText). */
function planWords(c) {
  const p = planValue(c);
  const n = (k) => segName(c, k);
  const known = { ...c.len };
  const parts = p.steps.map((s) => {
    if (s.op === 'ratio') {
      const [[t1, b1], [t2, b2]] = [s.with, s.on];
      return `$${frac(n(t2), n(b2))} = ${frac(n(t1), n(b1))}$`;
    }
    return `$${n(s.out)} = ${num(known[s.a])} ${s.op === '+' ? '+' : '-'} ${num(known[s.b])} = ${num(known[s.out])}$`;
  });
  return `${andList(parts)}, donc $${n(c.unknown)} = ${num(p.value)}$`;
}
const givenWords = (c) => andList(c.given.map((k) => `$${segName(c, k)} = ${num(c.len[k])}$`));

const forge2 = {
  key: K.calcul,
  ...J2,
  ruleText: frAll(
    () =>
      'Chaque longueur part du sommet : je recolle les morceaux ou j’enlève celui d’en face, puis je garde deux rapports avec l’inconnue.',
  ),
  explain: frAll((rule, c) => `Ton plan : ${planWords(c)}. La longueur posée : $${num(c.typed)}$ m.`),
  caseId,
  // his evidence is what he laid in the experiment (`fromInquiry`) and what the mirror showed; the world's log at the
  // summit (the capstone's cases, no `of`) is not read here
  evidence: (rows) => {
    const own = rows.filter((r) => r.of === K.calcul);
    return own.filter((c, i) => own.findIndex((x) => caseId(x) === caseId(c)) === i);
  },
  inquiry: PLAN_INQUIRY,
  fromInquiry: (result) => {
    const rows = result.rows
      .map((r) => {
        const round = PLAN_INQUIRY.rounds[r.round];
        return courseCase(round.fig, round.given, round.unknown, r.typed);
      })
      .filter((c, i, all) => all.findIndex((x) => caseId(x) === caseId(c)) === i);
    return { rows, rule: { ...RULE2 } };
  },
  predictCases: noPredictions,
  attacks: (rule, rows) => attacksOf({ ...J2, caseId, pool: () => F2_HARD, hard: F2_HARD })(rule, rows),
  nudge: () => ({ kind: 'experiment', cases: [...F2_HARD] }),
  use: {
    make: () => USE2,
    figure: () => USE2_FIG,
    lines: () => [
      line([
        { frac: { n: 'OA', d: choiceBox('den', 'le dénominateur', [...CAL.use.choices]) } },
        '=',
        givenFraction('OB', 'OF'),
      ]),
      line([
        'OE',
        '=',
        decimalBox('ae', 'la longueur AE', 4),
        '−',
        decimalBox('oa', 'la longueur OA', 4),
        '=',
        decimalBox('oe', 'OE', 4),
        'cm',
      ]),
      line(['OF', '=', decimalBox('of', 'OF', 4), 'cm']),
      line(['AB', '=', decimalBox('ab', 'AB', 4), 'cm']),
    ],
    check(c, v) {
      const n = (x) => typedNumber(x);
      const is = (x, want) => n(x) != null && equal(n(x), want);
      return firstWrong([
        [v.den === 'AE' ? 'across' : 'den', v.den === 'OE'],
        ['cut', is(v.ae, c.len.VMB) && is(v.oa, c.len.VM) && is(v.oe, c.len.VB)],
        [is(v.of, CAL.use.errors.OF) ? 'ofAcross' : 'of', is(v.of, c.len.VC)],
        [is(v.ab, CAL.use.errors.AB) ? 'abAcross' : 'ab', is(v.ab, c.len.MN)],
      ]);
    },
  },
  text: frAll({
    ...THALES_TEXT,
    title: 'La table du pyramidion',
    log: 'Les longueurs que tu as posées',
    frame: 'Ton plan :',
    buildLead: 'Ton plan, c’est ce que tu as construit dans l’expérience : le miroir le met maintenant au défi.',
    testing: 'Le miroir repasse tes longueurs posées, une par une…',
    agreed:
      'Ton plan s’accorde avec toutes tes longueurs. Maintenant, le miroir le met au défi avec des figures que tu n’as pas vues.',
    yes: 'elle touche',
    no: 'elle ne touche pas',
    says: (yes) => `Ton plan : ${yes ? 'elle touche' : 'elle ne touche pas'}`,
    refuted: (m) =>
      `Ton plan dit que la longueur posée ${m.says ? 'touche' : 'ne touche pas'} ; pourtant elle ${m.held ? 'a touché' : 'n’a pas touché'} les deux bords.`,
    attack: (c) =>
      `Dans la figure, on connaît ${givenWords(c)}. Les bâtisseurs posent $${segName(c, c.unknown)} = ${num(c.typed)}$ m. Touche-t-elle ? Que dit ton plan ?`,
    survived: 'Ton plan a tenu : la longueur a fait ce qu’il disait.',
    broken: (yes) =>
      `Ton plan s’est cassé ici : il disait « ${yes ? 'elle touche' : 'elle ne touche pas'} », et elle ${yes ? 'n’a pas touché' : 'a touché'}.`,
    wordsHint: 'Par exemple : chaque longueur…',
    experiment: 'Regarde bien : deux longueurs posées par le miroir. Laquelle touche les deux bords ?',
    eq: (c) => eqLine(`${segName(c, c.unknown)} = ${num(c.len[c.unknown])}`),
    tryKey: (c) =>
      `$(AE)$ et $(BF)$ sécantes en $O$, $(AB) \\parallel (EF)$ : $OA = ${num(c.len.VM)}$ cm, $AE = ${num(c.len.VMB)}$ cm, $OB = ${num(c.len.VN)}$ cm, $EF = ${num(c.len.BC)}$ cm. Calcule $OE$, $OF$ et $AB$.`,
    use: {
      across: 'AE traverse le point O : ce n’est pas une longueur depuis O. Laquelle part de O, sur la même droite ?',
      den: 'Le dénominateur : sur la droite de A, la longueur depuis O de l’autre côté.',
      cut: 'OE : la longueur AE, moins le morceau OA.',
      ofAcross: 'OF : c’est ce que donne AE, la longueur qui traverse O, et non OE.',
      of: 'OF : le rapport qui contient OF et trois longueurs connues, puis le rapport qui lui est égal.',
      abAcross: 'AB : c’est ce que donne AE, la longueur qui traverse O, et non OE.',
      ab: 'AB : le rapport qui contient AB et EF, puis le rapport qui lui est égal.',
    },
    useOk: 'Trois longueurs que personne n’a mesurées, écrites exactement : ta clé fonctionne !',
  }),
};

/** The last step (design § 2, renumbered — `math.js`): OA 4, AE 10, OB 5,8, EF 6,9 cm → OE = 6, OF = 8,7, AB = 4,6. */
export const USE2 = thalesCase({
  kind: 'butterfly',
  names: { ...CAL.use.names },
  len: { ...CAL.use.len, ...CAL.use.across },
});
/** OA, AE (across, « AE = 10 » along its line), OB and EF given; OE, OF and AB asked. */
export const USE2_FIG = {
  ...USE2,
  show: ['VM', 'VMB', 'VN', 'BC', 'VB', 'VC', 'MN'],
  ask: ['VB', 'VC', 'MN'],
  parallel: true,
};

/** The forges of the lesson, keyed by its keys in the order of the story. */
export const FORGES = {
  [K.papillon]: forge1,
  [K.calcul]: forge2,
};
