// The walks of the French lesson `thales-configuration-papillon` (3e, « Thalès dans le papillon », world `nile-pyramids`:
// three docks — the river, the summit, the plateau, `story.stages`) — a DESCRIPTOR for lib/lessonWalk (README there):
// only what the lesson's files cannot say — the walk's own arithmetic of every verdict (exact fractions,
// lib/lessonWalk/worlds/exact.mjs — never the lesson's `math.js`, `forges.js`, `run.js` or `trainer.js`), the words no
// screen may show before their tablet, and the launch kit's two tools. The model: the Algerian walk of the same world
// (`smarter-academy-dz/apps/web/e2e/lessons/talis-hisab-atwal.walk.mjs`), read and rewritten for the French sentences.
//
// The world's handlers it relies on: `worlds/nilePyramids.mjs` (the story on the route of `story.stages`),
// `worlds/nilePyramidsExperiments.mjs` (the experiments `halfturn` 🦋 and `plan` 📐 — the plan on a butterfly too:
// `VM+VB`, `VMB-VM`, `data-iq-laid-on`), `gateRun.mjs` (the felucca's legs, the practice levels), the board's `ask` with a
// figure, the trainer's decimal boxes and button choices, the launch kit's fourth proportional.
// Run: E2E_BASE=http://localhost:<port> E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs thales-configuration-papillon [story|hub|trainer|board|launch|sitting] [outDir]
import { getItem } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { eq, mul, q, sub, write } from '../lib/lessonWalk/worlds/exact.mjs';
import { chainHolds } from '../lib/lessonWalk/worlds/thales.mjs';

const inv = (b) => ({ n: q(b).d, d: q(b).n });
const div = (a, b) => mul(a, inv(b));
const add = (a, b) => sub(a, mul(b, '-1'));
/** The partner of a length in the other triangle (small VMN ↔ big VBC). */
const PARTNER = { VM: 'VB', VB: 'VM', VN: 'VC', VC: 'VN', MN: 'BC', BC: 'MN' };
const SMALL = new Set(['VM', 'VN', 'MN']);
/** A line through the vertex: [the whole, its two parts] — a nested side and its pieces, a butterfly's length across. */
const LINES = {
  nested: [
    ['VB', 'VM', 'MB'],
    ['VC', 'VN', 'NC'],
  ],
  butterfly: [
    ['VMB', 'VM', 'VB'],
    ['VNC', 'VN', 'VC'],
  ],
};

/**
 * A length of the figure computed from the lengths KNOWN only (`known`: { VM, MB, VMB, … }): first every part of a line
 * through the vertex from the two others (a nested side = its two pieces; a butterfly's length across = its two lengths
 * from the vertex), then a pair small/big wholly known gives k = small/big, the asked length is its partner × k (or ÷ k);
 * a piece or a length across asked is computed from its parts.
 */
function lengthFrom(known, asked, kind = 'nested') {
  const L = Object.fromEntries(Object.entries(known).filter(([, v]) => v != null));
  const lines = LINES[kind];
  for (let n = 0; n < 2; n += 1)
    for (const [whole, a, b] of lines) {
      if (kind === 'nested') {
        // VB = VM + MB
        if (L[whole] == null && L[a] != null && L[b] != null) L[whole] = add(L[a], L[b]);
        if (L[a] == null && L[whole] != null && L[b] != null) L[a] = sub(L[whole], L[b]);
        if (L[b] == null && L[whole] != null && L[a] != null) L[b] = sub(L[whole], L[a]);
      } else {
        // VMB = VM + VB
        if (L[whole] == null && L[a] != null && L[b] != null) L[whole] = add(L[a], L[b]);
        if (L[a] == null && L[whole] != null && L[b] != null) L[a] = sub(L[whole], L[b]);
        if (L[b] == null && L[whole] != null && L[a] != null) L[b] = sub(L[whole], L[a]);
      }
    }
  if (L[asked] != null) return q(L[asked]);
  // a nested piece (MB = VB − VM) or a butterfly's length across (VMB = VM + VB): from its lengths from the vertex
  const line = lines.find((l) => (kind === 'nested' ? l[2] : l[0]) === asked);
  if (line) {
    const [whole, a, b] = line;
    return kind === 'nested'
      ? sub(lengthFrom(L, whole, kind), lengthFrom(L, a, kind))
      : add(lengthFrom(L, a, kind), lengthFrom(L, b, kind));
  }
  const pair = ['VM', 'VN', 'MN'].find((s) => L[s] != null && L[PARTNER[s]] != null);
  if (!pair) throw new Error(`the walk finds no ratio wholly given (${JSON.stringify(known)})`);
  const k = div(L[pair], L[PARTNER[pair]]);
  const partner = L[PARTNER[asked]];
  if (partner == null) throw new Error(`the walk cannot reach ${asked} from ${JSON.stringify(known)}`);
  return SMALL.has(asked) ? mul(partner, k) : div(partner, k);
}
const given = (f, keys) => Object.fromEntries(keys.map((k) => [k, f[k]]));
/** A segment named with a figure's letters: « VB » with V = O, B = E → « OE »; the across « VMB » is « MB ». */
const seg = (names, key) =>
  (key === 'VMB' ? 'MB' : key === 'VNC' ? 'NC' : key)
    .split('')
    .map((ch) => names[ch] ?? ch)
    .join('');
/**
 * The key of a segment written with a figure's letters (either order): « OE » → 'VB'; on a butterfly « AE » is the
 * length across the vertex 'VMB', on a nested figure « MB » a piece; null for none.
 */
function keyOf(names, name, kind = 'butterfly') {
  const across = kind === 'butterfly' ? ['VMB', 'VNC'] : ['MB', 'NC'];
  for (const k of ['VM', 'VB', 'VN', 'VC', 'MN', 'BC', ...across]) {
    const s = seg(names, k);
    if (s === name || [...s].reverse().join('') === name) return k;
  }
  return null;
}
/** White space as one space (the no-break ones too), the thin no-break before « : ; ! ? » included. */
const norm = (t) =>
  String(t)
    .replace(/[\s\u00a0\u202f]+/g, ' ')
    .trim();
/** « 45{,}5 » → « 45,5 ». */
const unbrace = (t) => String(t).replace(/\{,\}/g, ',').replace(/\\,/g, '');

/**
 * The value of a formula of numbers only: « \dfrac{45{,}5 \times 32}{26} », « 26 + 45{,}5 », « \dfrac{4}{7} » — exact
 * (`exact.mjs`); null when it holds a letter.
 */
function texValue(t) {
  let s = unbrace(t)
    .replace(/\\displaystyle\s*/g, '')
    .replace(/[−–]/g, '-')
    .trim();
  if (/[A-Za-z]/.test(s.replace(/\\d?frac|\\times|\\div/g, ''))) return null;
  // the fractions, innermost first, become « (a)/(b) » — then a sum / product of terms, evaluated exactly
  for (let n = 0; n < 6 && /\\d?frac/.test(s); n += 1) s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '[$1]/[$2]');
  const value = (e) => {
    e = e.trim();
    const sum = e.split(/(?<!\[[^\]]*)\s[+-]\s/);
    if (sum.length > 1) {
      const signs = [...e.matchAll(/(?<!\[[^\]]*)\s([+-])\s/g)].map((m) => m[1]);
      return sum
        .slice(1)
        .reduce((acc, x, i) => (signs[i] === '+' ? add(acc, value(x)) : sub(acc, value(x))), value(sum[0]));
    }
    const fr = /^\[([^\]]*)\]\/\[([^\]]*)\]$/.exec(e);
    if (fr) return div(value(fr[1]), value(fr[2]));
    if (e.includes('\\times'))
      return e
        .split('\\times')
        .map(value)
        .reduce((x, y) => mul(x, y));
    if (e.includes('\\div'))
      return e
        .split('\\div')
        .map(value)
        .reduce((x, y) => div(x, y));
    return q(e);
  };
  try {
    return value(s);
  } catch {
    return null;
  }
}

/** Every formula of a sentence (between « $ »). */
const formulas = (t) => [...String(t).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);

/**
 * A reason of « Vrai ou faux ? Justifie » proves the statement when it WRITES its facts and every one is true: in each
 * formula, every side that is a number (the segment names left out) equals the others, at least two of them. A sentence
 * that writes no formula proves nothing.
 */
function reasonTrue(text) {
  const fs = formulas(text);
  if (!fs.length) return false;
  for (const f of fs) {
    const vals = f
      .split('=')
      .map(texValue)
      .filter((v) => v != null);
    if (vals.length < 2 || !vals.every((v) => eq(v, vals[0]))) return false;
  }
  return true;
}

/**
 * « Vrai ou faux ? » of a butterfly (the trainer's statements): the figure's letters from its sentence (« les droites
 * (AE) et (BF) se coupent en O, et (AB) ∥ (EF) »), the lengths given, then the claim — two ratios equal, or a length —
 * computed here from the lengths given only.
 */
function statementTrue(plain) {
  const t = unbrace(norm(plain));
  const fig = /les droites \(([A-Z])([A-Z])\) et \(([A-Z])([A-Z])\) se coupent en ([A-Z])/.exec(t);
  if (!fig) return null;
  const names = { M: fig[1], B: fig[2], N: fig[3], C: fig[4], V: fig[5] };
  const data = /On donne (.*?)\. Alors (.*)\.$/.exec(t);
  if (!data) return null;
  const known = {};
  for (const m of data[1].matchAll(/([A-Z]{2}) = (\d+(?:,\d+)?)/g)) known[keyOf(names, m[1])] = m[2];
  const len = (name) => lengthFrom(known, keyOf(names, name), 'butterfly');
  const claim = data[2].trim();
  const ratios = /^\\dfrac\{([A-Z]{2})\}\{([A-Z]{2})\} = \\dfrac\{([A-Z]{2})\}\{([A-Z]{2})\}$/.exec(claim);
  if (ratios) return eq(div(len(ratios[1]), len(ratios[2])), div(len(ratios[3]), len(ratios[4])));
  const length = /^([A-Z]{2}) = (\d+(?:,\d+)?)$/.exec(claim);
  if (length) return eq(len(length[1]), length[2]);
  return null;
}

/**
 * A buoy of a felucca's leg or of a practice level is right? — the order read (`ask`, `tex`), the walk's own arithmetic.
 * The letters are the rail's: a butterfly O, A, E, B, F ((AE) and (BF) through O, (AB) ∥ (EF)); a nested figure A, M, B,
 * N, C (M on [AB], N on [AC], (MN) ∥ (BC)).
 */
function buoy(ask, tex, gate) {
  const say = norm(ask);
  const t = unbrace(String(tex ?? ''))
    .replace(/\\displaystyle\s*/g, '')
    .trim();
  const g = q(String(gate).trim());
  const asked = /calcule ([A-Z]{2})/.exec(say)?.[1];
  if (!asked) throw new Error(`the walk cannot read the buoy « ${say} » ${t}`);
  const nested = /M sur \[AB\]/.test(say);
  const names = nested ? { V: 'A', M: 'M', B: 'B', N: 'N', C: 'C' } : { V: 'O', M: 'A', B: 'E', N: 'B', C: 'F' };
  const kind = nested ? 'nested' : 'butterfly';
  const known = {};
  for (const part of t.split('\\quad').map((x) => x.trim())) {
    const ratio = /^\\dfrac\{([A-Z]{2})\}\{([A-Z]{2})\} = \\dfrac\{(\d+)\}\{(\d+)\}$/.exec(part);
    if (ratio) {
      // a ratio given: OA / OE = p / q (the two lengths of one line are then p·s and q·s for some s — only their ratio counts)
      known[`${keyOf(names, ratio[1], kind)}/${keyOf(names, ratio[2], kind)}`] = div(ratio[3], ratio[4]);
      continue;
    }
    const m = /^([A-Z]{2}) = (\d+(?:,\d+)?)$/.exec(part);
    if (!m) throw new Error(`the walk cannot read « ${part} » in the buoy « ${say} »`);
    known[keyOf(names, m[1], kind)] = m[2];
  }
  const want = keyOf(names, asked, kind);
  const k = known['VM/VB'];
  if (k) {
    // OA / OE = OB / OF: a length of one ratio from its partner × k
    const partner = known[PARTNER[want]];
    return eq(g, SMALL.has(want) ? mul(partner, k) : div(partner, k));
  }
  return eq(g, lengthFrom(known, want, kind));
}

/** The first number after `re` in a sentence (« $AM = 3$ », « $0{,}5$ »). */
const numAfter = (text, re) => {
  const m = new RegExp(`${re.source}[^\\d]*?(\\d+(?:,\\d+)?)`).exec(unbrace(norm(text)));
  if (!m) throw new Error(`the walk finds no number after ${re} in « ${text.slice(0, 80)} »`);
  return m[1];
};

/** The lengths a board station's figure writes on its segments: « AB » → '24' (both orders; « ? » left out). */
const labelsOf = (step) => {
  const out = {};
  for (const x of step.figure.segments) {
    if (Array.isArray(x) || x.label == null || x.label === '?') continue;
    out[x.from + x.to] = String(x.label);
    out[x.to + x.from] = String(x.label);
  }
  return out;
};
/** The letters of the board's crossings: (AC) and (BD) through O, (AB) ∥ (CD). */
const CROSSING = { V: 'O', M: 'A', B: 'C', N: 'B', C: 'D' };
/** The lengths of a crossing's figure as the keys of a butterfly. */
const crossingKnown = (st) =>
  Object.fromEntries(
    Object.entries(labelsOf(st))
      .map(([name, v]) => [keyOf(CROSSING, name), v])
      .filter(([k]) => k),
  );

/** A fraction written in two whole boxes, reduced. */
const fracBoxes = (x, n = 'n', d = 'd') => ({ [n]: Number(q(x).n), [d]: Number(q(x).d) });

/** The final mission, from its card's lead: AB = AH + HB (HB half the base), MN ∥ BC both vertical, AM / AB = MN / h. */
function mission(lead) {
  const stick = numAfter(lead, /bâton \$\[MN\]\$ mesure/);
  const am = numAfter(lead, /AM =/);
  const ah = numAfter(lead, /AH =/);
  const hb = write(div(numAfter(lead, /côté de la base mesure/), '2'));
  const ab = add(ah, hb);
  return {
    ah: Number(ah),
    hb: Number(hb),
    ab: Number(write(ab)),
    why: 'vertical',
    rn: Number(am),
    rd: Number(write(ab)),
    mn: Number(stick),
    h: write(div(mul(ab, stick), am)),
  };
}

export default {
  id: 'thales-configuration-papillon',
  uid: 9320,
  // the words of each key's name that no screen shows before its tablet (its tablet's title is always added; the
  // lesson's title « Thalès dans le papillon » stands on the title screen and is excepted by the library)
  forbidden: {
    papillon: ['papillon', 'autre côté du sommet', 'théorème de Thalès'],
    'calcul-depuis-le-sommet': ['part du sommet', 'depuis le sommet', 'recoll', 'celui d’en face'],
  },
  // what the world does with a case of each forge, computed here
  truth: {
    // 🦋 two triangles across the vertex after the half-turn: the three ratios equal — or not (the river's roots by
    // their coefficients, lib/lessonWalk/worlds/thales.mjs)
    papillon: (c) => {
      const h = chainHolds(c.len);
      if (h == null) throw new Error(`the walk cannot judge the case ${JSON.stringify(c.len)}`);
      return h;
    },
    // 📐 a length laid at `typed` for the unknown, from what is GIVEN: it touches exactly when typed IS that length
    'calcul-depuis-le-sommet': (c) =>
      eq(c.typed, lengthFrom(given(c.len, c.given), c.unknown, c.kind === 'butterfly' ? 'butterfly' : 'nested')),
  },
  use: {
    // 🦋 (AE) and (BF) through O, (AB) ∥ (EF): the two lines' points, the parallels, the three ratios from O, then OF
    // from OA, OE, OB (EF given is not needed)
    papillon: (u) => ({
      t1: `${u.names.M}${u.names.V}${u.names.B}`,
      t2: `${u.names.N}${u.names.V}${u.names.C}`,
      par: `${seg(u.names, 'MN')}_${seg(u.names, 'BC')}`,
      r1d: seg(u.names, 'VB'),
      r2n: seg(u.names, 'VN'),
      r2d: seg(u.names, 'VC'),
      r3n: seg(u.names, 'MN'),
      r3d: seg(u.names, 'BC'),
      of: write(lengthFrom(given(u.len, ['VM', 'VB', 'VN']), 'VC', 'butterfly')),
    }),
    // 📐 OA, AE (across O), OB and EF given: the denominator OE, OE = AE − OA, then OF and AB
    'calcul-depuis-le-sommet': (u) => {
      const known = given(u.len, ['VM', 'VMB', 'VN', 'BC']);
      return {
        den: seg(u.names, 'VB'),
        ae: u.len.VMB,
        oa: u.len.VM,
        oe: write(sub(u.len.VMB, u.len.VM)),
        of: write(lengthFrom(known, 'VC', 'butterfly')),
        ab: write(lengthFrom(known, 'MN', 'butterfly')),
      };
    },
  },
  // the trainer's forms, each answered from what its prompt GIVES
  solve: {
    // a ratio of the chain from the two lengths of the line given (from the vertex, or across it: VB = VMB − VM)
    rapport: (x) => fracBoxes(div(x.f.VM, x.across ? sub(x.f.VMB, x.f.VM) : x.f.VB)),
    rapportTravers: (x) => fracBoxes(div(x.f.VM, sub(x.f.VMB, x.f.VM))),
    rapports: (x) => ({
      r1n: seg(x.names, 'VM'),
      r1d: seg(x.names, 'VB'),
      r2n: seg(x.names, 'VN'),
      r2d: seg(x.names, 'VC'),
      r3n: seg(x.names, 'MN'),
      r3d: seg(x.names, 'BC'),
    }),
    longueur: (x) => ({ x: write(lengthFrom(given(x.f, [x.sol.P, x.sol.Q, x.sol.D]), x.sol.U, 'butterfly')) }),
    travers: (x) => {
      const known = given(x.f, [x.part, x.whole, x.other]);
      return {
        w: write(lengthFrom(known, x.side, 'butterfly')),
        x: write(lengthFrom(known, x.sol.U, 'butterfly')),
      };
    },
    emboite: (x) => {
      const known = given(x.f, [x.part, x.piece, x.other]);
      return { w: write(lengthFrom(known, x.side)), x: write(lengthFrom(known, x.sol.U)) };
    },
  },
  statement: statementTrue,
  reasonTrue,
  // the board: the length each figure station asks, from the lengths its figure writes (lib/lessonWalk/board.mjs)
  board: {
    // two streets crossing at O, (AB) ∥ (CD): OD from OA, OC, OB
    rues: (st) => lengthFrom(crossingKnown(st), 'VC', 'butterfly'),
    // the scissors: AB from OA, OC and CD
    ciseaux: (st) => lengthFrom(crossingKnown(st), 'MN', 'butterfly'),
    // the roof: E on [AB] from the ridge A, (EF) ∥ (BC): BC from AE, EB, EF (AB = AE + EB first)
    ferme: (st) => {
      const l = labelsOf(st);
      return lengthFrom({ VM: l.AE, MB: l.EB, MN: l.EF }, 'BC');
    },
    // the garden: AC given ACROSS O — CD from OA, AC, AB (OC = AC − OA first)
    jardin: (st) => lengthFrom(crossingKnown(st), 'BC', 'butterfly'),
    // the footpaths: the whole path BD = OB + OD
    sentiers: (st) => lengthFrom(crossingKnown(st), 'VNC', 'butterfly'),
  },
  // a tap of « Entraîne-toi » is a buoy of the same waves: judged by the same arithmetic, from its order and its formula
  gate: Object.fromEntries(
    ['rapport', 'longueur', 'travers', 'traversInconnu', 'emboite'].map((t) => [
      t,
      (x, n) => buoy(x.say, x.tex, String(n)),
    ]),
  ),
  // a buoy of the felucca's legs and of the practice levels (lib/lessonWalk/gateRun.mjs)
  run: buoy,
  mission,
  // the box at noon: OH = from the hole to the base edge + half the base (the mission's), the sheet S′H′ = OH′ × SH ÷ OH
  box: (lead, missionLead) => {
    const o1 = numAfter(lead, /posée à/);
    const depth = numAfter(lead, /trou \$O\$ est à/);
    const m = mission(missionLead);
    const o2 = String(m.hb);
    const oh = add(o1, o2);
    return {
      p1: 'H',
      p2: 'H′',
      why: 'vertical',
      r1n: 'OH′',
      r1d: 'OH',
      r2n: 'S′H′',
      r2d: 'SH',
      o1: Number(o1),
      o2: Number(o2),
      oh: Number(write(oh)),
      a: depth,
      b: Number(m.h),
      c: Number(write(oh)),
      img: write(div(mul(depth, m.h), oh)),
    };
  },
  // the learning net gives this lesson TWO core tools, in this order: a figure enlarged or reduced (4e.m2.r09) and a
  // parallel in a triangle (4e.m4.r04) — no French lesson of 4e yet: « Revois d’abord » names each item itself
  launch: {
    scenario: 'pair',
    tools: [
      {
        item: '4e.m2.r09',
        name: 'Agrandir et réduire une figure',
        year: 'vu en 4e',
        home: getItem('4e.m2.r09').text,
        memo: 4,
        second: 'write',
        firstOk: (x) => x.calc?.op === 'fourth' && x.calc.b <= 8 && Number.isInteger((x.calc.b * x.calc.c) / x.calc.a),
      },
      {
        item: '4e.m4.r04',
        name: 'Une parallèle dans un triangle',
        year: 'vu en 4e',
        home: getItem('4e.m4.r04').text,
        memo: 4,
        second: 'write',
        firstOk: (x) => x.calc?.op === 'fourth' && x.calc.b <= 8 && Number.isInteger((x.calc.b * x.calc.c) / x.calc.a),
      },
    ],
  },
};

// the walk's own arithmetic is checked once at load: the river (SE 9, AS 72, ER 52 → AF 416), a cut across the vertex,
// a nested side in two pieces, a buoy, a reason
if (
  !eq(lengthFrom({ VM: '9', VB: '72', MN: '52' }, 'BC', 'butterfly'), '416') ||
  !eq(lengthFrom({ VM: '9', VMB: '31,5', MN: '5' }, 'BC', 'butterfly'), '12,5') ||
  !eq(lengthFrom({ VM: '2', MB: '4', BC: '16,5' }, 'MN'), '5,5') ||
  !eq(lengthFrom({ VM: '9', VB: '22,5', VN: '11' }, 'VNC', 'butterfly'), '38,5') ||
  !buoy('(AB) ∥ (EF), O est sur [AE] : calcule OF', 'OA = 4 \\quad AE = 10 \\quad OB = 6', '9') ||
  !reasonTrue('car $\\dfrac{26}{45{,}5} = \\dfrac{4}{7}$ et $AE = 26 + 45{,}5 = 71{,}5$') ||
  reasonTrue('car chaque longueur va avec celle qui lui fait face')
)
  throw new Error('thales-configuration-papillon.walk: arithmetic');
