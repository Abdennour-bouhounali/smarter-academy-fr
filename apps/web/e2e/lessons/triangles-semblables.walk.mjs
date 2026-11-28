// The walks of the French lesson `triangles-semblables` (3e, « Reconnaître des triangles semblables », world
// `nile-pyramids`: three docks — the masons' workshop, the summit, the plateau, `story.stages`) — a DESCRIPTOR for
// lib/lessonWalk (README there): only what the lesson's files cannot say — the walk's own arithmetic of every verdict
// (exact fractions, lib/lessonWalk/worlds/exact.mjs — never the lesson's `math.js`, `forges.js`, `run.js` or
// `trainer.js`), the words no screen may show before their tablet, the mission's wrong card, and the launch kit's tools.
// The model: `thales-configuration-papillon.walk.mjs` (same world).
//
// The world's handlers it relies on: `worlds/nilePyramids.mjs` (the story on the route of `story.stages`; the mission
// card whose lines open one by one, the flight read from the world's log), `worlds/nilePyramidsExperiments.mjs` (the
// experiments `pair` 📏 — SIM, RED, ONE, DIFF linked by the walk from the world's first link, TURN laid with the mason's
// links by the names, then relinked by size — and `angles` 📐), `gateRun.mjs` (the felucca's legs, the practice levels),
// the board's `ask` with a figure, the trainer's fraction boxes and button choices, the launch kit.
// Run: E2E_BASE=http://localhost:<port> E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs triangles-semblables [story|hub|trainer|board|launch|sitting] [outDir]
import { getItem } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { cmp, eq, mul, q, sub, write } from '../lib/lessonWalk/worlds/exact.mjs';

const inv = (b) => ({ n: q(b).d, d: q(b).n });
const div = (a, b) => mul(a, inv(b));
const add = (a, b) => sub(a, mul(b, '-1'));
const sum = (xs) => xs.reduce((a, b) => add(a, b), q('0'));
/** White space as one space (the no-break ones too). */
const norm = (t) =>
  String(t)
    .replace(/[\s  ]+/g, ' ')
    .trim();
/** « 45{,}5 » → « 45,5 ». */
const unbrace = (t) => String(t).replace(/\{,\}/g, ',').replace(/\\,/g, '');
/** Exact values, ascending. */
const ascending = (xs) => [...xs].map((x) => q(x)).sort(cmp);
/** The same letters, whatever their order: « ZX » ~ « XZ ». */
const sameLetters = (a, b) => [...a].sort().join('') === [...b].sort().join('');
/** The sides of a triangle named PQR: [PQ, QR, RP]. */
const sidesOf = (n) => [n[0] + n[1], n[1] + n[2], n[2] + n[0]];
/** A fraction written in two whole boxes, reduced. */
const fracBoxes = (x, n = 'n', d = 'd') => ({ [n]: Number(q(x).n), [d]: Number(q(x).d) });

/**
 * THE SIDES' VERDICT: two triangles have the same shape when their sides, each ranked from the shortest to the longest,
 * give three equal quotients — the k from the first to the second, or null.
 */
function rankedK(first, second) {
  const [a, b] = [ascending(first), ascending(second)];
  const k = div(b[0], a[0]);
  return eq(div(b[1], a[1]), k) && eq(div(b[2], a[2]), k) ? k : null;
}
/** THE ANGLES' VERDICT: two triangles, each closing (its angles sum to 180), with the same three angles. */
function sameAngles(xs, ys) {
  if (xs.length !== 3 || ys.length !== 3) return false;
  if (!eq(sum(xs), '180') || !eq(sum(ys), '180')) return false;
  const [a, b] = [ascending(xs), ascending(ys)];
  return a.every((x, i) => eq(x, b[i]));
}
/** Two angles of a triangle and the third the sum of its angles gives (180°). */
const third = (x, y) => sub(sub('180', x), y);

/**
 * The vertex map of two triangles by their equal angles (« \widehat{A} = \widehat{E} » twice): the third vertex goes
 * with the third; then a side of the first maps to the side joining the images of its ends.
 */
function vertexMap(n1, n2, pairs) {
  const map = Object.fromEntries(pairs);
  const left = [...n1].find((v) => !(v in map));
  const right = [...n2].find((v) => !Object.values(map).includes(v));
  if (left && right) map[left] = right;
  return map;
}
const mapSide = (map, side) => [...side].map((v) => map[v]).join('');
/** Every « \widehat{X} = \widehat{Y} » of a formula or a sentence. */
const hatPairs = (t) =>
  [...String(t).matchAll(/\\widehat\{([A-Z])\}\s*=\s*\\widehat\{([A-Z])\}/g)].map((m) => [m[1], m[2]]);
/** Every « XY = v » of a sentence (its formulas, a decimal comma or `{,}`). */
const lengthsIn = (t) =>
  Object.fromEntries([...unbrace(t).matchAll(/\b([A-Z]{2})\s*=\s*(\d+(?:,\d+)?)/g)].map((m) => [m[1], m[2]]));
/** The length of a side written either way. */
const lengthOf = (L, side) => L[side] ?? L[[...side].reverse().join('')];

// ───────────────────────────── the forges' cases ─────────────────────────────

/** The labels of a scene's segments, triangle by triangle (`figures.js › sceneOf`: the first three, then the next three). */
function sceneSides(scene) {
  const seg = scene.segments.map((s) => ({ key: s.from + s.to, label: s.label == null ? null : String(s.label) }));
  return [seg.slice(0, 3), seg.slice(3, 6)];
}
/** The angles a scene writes, vertex → degrees (« 27° » → '27'; an arc alone is left out). */
const sceneAngles = (scene) =>
  Object.fromEntries(
    (scene.angles ?? [])
      .filter((a) => a.label && /\d/.test(a.label))
      .map((a) => [a.at, unbrace(a.label).replace(/[°\s]/g, '')]),
  );

/** 📏 a tracé laid on the template: it covers it exactly when the ranked quotients are equal (from what the case draws). */
function sidesTruth(c) {
  const [tpl, stone] = sceneSides(c.scene).map((t) => t.map((s) => s.label));
  if (tpl.some((x) => x == null) || stone.some((x) => x == null))
    throw new Error(`the walk cannot read the case ${c.id}: a length is not written`);
  return rankedK(tpl, stone) != null;
}
/**
 * 📐 two triangles slid one onto the other: from what the case WRITES — three angles each (both closing, the same three),
 * or two sides around one angle each (the same angle, the sides × the same number, in their order from the vertex).
 */
function anglesTruth(c) {
  if (c.kind === 'sides') {
    const [[a], [b]] = c.angles;
    const [[p, r], [p2, r2]] = c.sides;
    return eq(a, b) && eq(mul(r, p2), mul(r2, p));
  }
  const [xs, ys] = c.angles;
  return sameAngles(xs, ys);
}

/** 📏 the last step: [MN] = 12 marked « moyen »: its partner the template's middle side, k, the short and long sides. */
function useSides(u) {
  const [tpl, stone] = sceneSides(u.scene);
  const RANK = { court: 0, moyen: 1, long: 2 };
  const ranked = [...tpl].sort((x, y) => cmp(x.label, y.label));
  const given = stone.find((s) => s.label && /\d/.test(s.label));
  const [value, word] = given.label.split('·').map((x) => x.trim());
  const partner = ranked[RANK[word]];
  const k = div(value, partner.label);
  const out = {
    // the template side of the same rank, written as the step's choices write it (« [AC] » → its letters, any order)
    pair: (opts) => opts.find((o) => sameLetters(o.id, partner.key)).id,
    kn: Number(value),
    kd: Number(partner.label),
    k: write(k),
  };
  for (const s of stone.filter((x) => x !== given)) {
    const r = RANK[String(s.label).split(' ')[0]];
    out[s.key.toLowerCase()] = write(mul(ranked[r].label, k));
  }
  return out;
}
/** 📐 the last step: each vertex of ABC to the vertex of XYZ with its angle, then the side homologous to [AB]. */
function useAngles(u) {
  const ang = sceneAngles(u.scene);
  const [n1, n2] = u.names.map((n) => [...n]);
  const full = (n) => {
    const known = n.filter((v) => ang[v] != null);
    if (known.length === 2) ang[n.find((v) => ang[v] == null)] = write(third(ang[known[0]], ang[known[1]]));
  };
  full(n1);
  full(n2);
  const map = Object.fromEntries(n1.map((v) => [v, n2.find((w) => eq(ang[w], ang[v]))]));
  const ab = mapSide(map, n1[0] + n1[1]);
  return {
    vA: map[n1[0]],
    vB: map[n1[1]],
    vC: map[n1[2]],
    side: (opts) => opts.find((o) => sameLetters(o.id, ab)).id,
  };
}

// ───────────────────────────── a buoy, a trainer's tap ─────────────────────────────

/** A gate as the rail or the trainer writes it: « 13,5 », « 1{,}5 », 7 — as the formula's writing. */
const gateTex = (g) => unbrace(String(g)).trim().replace(',', '{,}');
/**
 * Is `gate` the right buoy (the felucca's legs, the practice levels, a tap of « Entraîne-toi »)? Every buoy is ONE bare
 * calculation (run.js, owner 2026-11-27), judged HERE from the order's own formula: « Calcule » — the calculation
 * (« 9 \div 6 », « 6 \times 1{,}5 », « 180 - 65 - 48 ») is worth the gate; « Complète » — the box `\square` filled with
 * the gate, the two sides of « \dfrac{6}{9} = \dfrac{10}{\square} » or « 65 + 48 + \square = 180 » are equal.
 */
function buoy(ask, tex, gate) {
  const say = norm(ask);
  const t = String(tex ?? '')
    .replace(/\\displaystyle\s*/g, '')
    .trim();
  if (/^Calcule\b/.test(say)) {
    const v = texValue(t);
    if (v == null) throw new Error(`the walk cannot compute the buoy « ${t} »`);
    return eq(v, q(unbrace(String(gate)).trim()));
  }
  if (/^Complète\b/.test(say) && t.includes('\\square')) {
    const sides = t.replace('\\square', gateTex(gate)).split('=').map(texValue);
    if (sides.length !== 2 || sides.some((v) => v == null)) throw new Error(`the walk cannot read the buoy « ${t} »`);
    return eq(sides[0], sides[1]);
  }
  throw new Error(`the walk cannot read what the buoy « ${say} » « ${t} » asks`);
}

// ───────────────────────────── « Vrai ou faux ? » ─────────────────────────────

/** The value of a formula of numbers only (« \dfrac{7{,}5}{5} », « 180 - 49 - 58 », « 73^\circ ») — exact, or null. */
function texValue(f) {
  let s = unbrace(f)
    .replace(/\^\\circ|°/g, '')
    .replace(/\\displaystyle\s*/g, '')
    .replace(/[−–]/g, '-')
    .trim();
  if (/[A-Za-z]/.test(s.replace(/\\d?frac|\\times|\\div/g, ''))) return null;
  for (let n = 0; n < 6 && /\\d?frac/.test(s); n += 1) s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '[$1]/[$2]');
  const value = (e) => {
    e = e.trim();
    const parts = e.split(/(?<!\[[^\]]*)\s([+-])\s/);
    if (parts.length > 1) {
      let acc = value(parts[0]);
      for (let i = 1; i < parts.length; i += 2)
        acc = parts[i] === '+' ? add(acc, value(parts[i + 1])) : sub(acc, value(parts[i + 1]));
      return acc;
    }
    const fr = /^\[([^\]]*)\]\/\[([^\]]*)\]$/.exec(e);
    if (fr) return div(value(fr[1]), value(fr[2]));
    if (/\\times|\\div/.test(e)) {
      const parts = e.split(/(\\times|\\div)/);
      let acc = value(parts[0]);
      for (let i = 1; i < parts.length; i += 2)
        acc = parts[i] === '\\times' ? mul(acc, value(parts[i + 1])) : div(acc, value(parts[i + 1]));
      return acc;
    }
    return q(e);
  };
  try {
    return value(s);
  } catch {
    return null;
  }
}
/**
 * A reason proves the statement when it WRITES its facts and every one is true: each formula a chain of « = » and « ≠ »
 * whose links hold, at least two sides of numbers; « $x$ ne vaut pas $y$ » a link « ≠ » between two formulas. A sentence
 * that writes no formula proves nothing.
 */
function reasonTrue(text) {
  const t = String(text);
  const fs = [...t.matchAll(/\$([^$]+)\$/g)];
  if (!fs.length) return false;
  for (const [i, m] of fs.entries()) {
    const links = m[1].split(/(=|\\neq)/);
    if (links.length < 3) {
      // a lone formula: the first term of « … ne vaut pas … » (judged with the next one), else it proves nothing
      const next = fs[i + 1];
      const between = next ? t.slice(m.index + m[0].length, next.index) : '';
      if (!/ne vaut pas/.test(between)) {
        const before = i > 0 ? t.slice(fs[i - 1].index + fs[i - 1][0].length, m.index) : '';
        if (/ne vaut pas/.test(before)) continue;
        return false;
      }
      const [a, b] = [texValue(m[1]), texValue(next[1])];
      if (a == null || b == null || eq(a, b)) return false;
      continue;
    }
    for (let j = 1; j < links.length; j += 2) {
      const [a, b] = [texValue(links[j - 1]), texValue(links[j + 1])];
      if (a == null || b == null) return false;
      if ((links[j] === '=') !== eq(a, b)) return false;
    }
  }
  return true;
}
/**
 * « Vrai ou faux ? » — « Dans ABC : AB = 6, BC = 4 et CA = 5. Dans DEF : … Les deux triangles sont semblables. », or the
 * same with two angles each (« 49^\circ et 58^\circ »): computed here from what the statement gives.
 */
function statementTrue(plain) {
  const t = unbrace(norm(plain));
  const blocks = [...t.matchAll(/Dans ([A-Z]{3}) : (.*?)\.(?= Dans| Les)/g)].map((m) => m[2]);
  if (blocks.length !== 2 || !/sont semblables/.test(t)) return null;
  const angles = blocks.map((b) => [...b.matchAll(/(\d+(?:,\d+)?)\s*(?:\^\\circ|°)/g)].map((m) => m[1]));
  if (angles.every((a) => a.length === 2)) return sameAngles(...angles.map(([x, y]) => [x, y, third(x, y)]));
  const sides = blocks.map((b) => [...b.matchAll(/[A-Z]{2} = (\d+(?:,\d+)?)/g)].map((m) => m[1]));
  if (sides.every((s) => s.length === 3)) return rankedK(...sides) != null;
  return null;
}

// ───────────────────────────── the trainer's forms ─────────────────────────────

/** The side of the second triangle homologous to `mine`, by the equal angles the prompt writes. */
function homologous(x) {
  const map = vertexMap(x.n1.join(''), x.n2.join(''), hatPairs(x.prompt));
  return mapSide(map, x.mine);
}

// ───────────────────────────── the board ─────────────────────────────

/** A board figure's two triangles: ABC, then the other three points in their order. */
const boardTriangles = (st) => {
  const pts = Object.keys(st.figure.points);
  return ['ABC', pts.filter((p) => !'ABC'.includes(p)).join('')];
};
/** The lengths a station's figure writes (« ? » left out), both orders. */
const boardLabels = (st) => {
  const out = {};
  for (const x of st.figure.segments) {
    if (Array.isArray(x) || x.label == null || x.label === '?') continue;
    out[x.from + x.to] = String(x.label);
    out[x.to + x.from] = String(x.label);
  }
  return out;
};
/** The side a station marks « ? ». */
const boardAsked = (st) => {
  const s = st.figure.segments.find((x) => !Array.isArray(x) && x.label === '?');
  return s ? s.from + s.to : null;
};
/** The drawn length of a side (the drawing to scale: for its RANK only, never for a number). */
const drawn = (st, side) => {
  const [a, b] = [st.figure.points[side[0]], st.figure.points[side[1]]];
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
};
/** The homologous sides of two triangles drawn to scale: the same rank in each. */
function rankMap(st) {
  const [n1, n2] = boardTriangles(st);
  const rank = (n) => sidesOf(n).sort((x, y) => drawn(st, x) - drawn(st, y));
  const [r1, r2] = [rank(n1), rank(n2)];
  return Object.fromEntries(r1.map((s, i) => [s, r2[i]]));
}
/** k from the pairs whose two lengths the figure writes — all of them must agree. */
function boardK(st, pairs) {
  const L = boardLabels(st);
  const ks = Object.entries(pairs)
    .filter(([a, b]) => L[a] && L[b])
    .map(([a, b]) => div(L[b], L[a]));
  if (!ks.length || !ks.every((k) => eq(k, ks[0])))
    throw new Error(`the board's figure ${st.id}: no k, or two different ones (${ks.map(write).join(', ')})`);
  return ks[0];
}
/** How many angles of the second triangle are angles of the first (each found once), the third of each computed. */
function commonAngles(st) {
  const [n1, n2] = boardTriangles(st);
  const ang = Object.fromEntries(st.figure.angles.map((a) => [a.at, a.label.replace(/[°\s]/g, '')]));
  const all = (n) => {
    const known = [...n].filter((v) => ang[v] != null).map((v) => ang[v]);
    return known.length === 2 ? [...known, write(third(...known))] : known;
  };
  const rest = all(n2);
  let n = 0;
  for (const a of all(n1)) {
    const i = rest.findIndex((b) => b != null && eq(a, b));
    if (i >= 0) {
      n += 1;
      rest[i] = null;
    }
  }
  return q(String(n));
}

// ───────────────────────────── the mission ─────────────────────────────

/** The first number after `re` in a sentence. */
const numAfter = (text, re) => {
  const m = new RegExp(`${re.source}[^\\d]*?(\\d+(?:,\\d+)?)`).exec(unbrace(norm(text)));
  if (!m) throw new Error(`the walk finds no number after ${re} in « ${text.slice(0, 80)} »`);
  return m[1];
};
/** The walk's palm, once read from the card: its height, and the card's right values. */
let MISSION = null;

/**
 * The palm's card (two triangles APART: the stick M N A, right-angled at M; the palm P C S, right-angled at P): the two
 * angles known in both — the right angle (both stand vertical on flat ground) and the sun's (the same moment) —; the
 * pairing read from the card's figure (the vertical leg at the right angle with the vertical one, the leg on the ground
 * with the one on the ground); k = the palm's shadow ÷ the stick's; h = the stick × k.
 */
function mission(lead, card) {
  const stick = numAfter(lead, /bâton vertical de/);
  const stickShadow = numAfter(lead, /porte une ombre de/);
  const palmShadow = numAfter(lead, /palmier mesure/);
  const P = card.figure.points;
  const vertical = (s) => Math.abs(P[s.from][0] - P[s.to][0]) < 1e-9;
  // the right angle of each triangle (its vertex the middle letter), and its two legs
  const [[, m], [, p]] = card.figure.rightAngles;
  const legs = (v) => card.figure.segments.filter((s) => s.from === v || s.to === v);
  const [stickV, stickG] = [legs(m).find(vertical), legs(m).find((s) => !vertical(s))];
  const [palmV, palmG] = [legs(p).find(vertical), legs(p).find((s) => !vertical(s))];
  // a figure label carries its unit (« 1,6 m »): the number is read before it
  const num = (l) => String(l).replace(/\s*m$/, '').trim();
  if (!(num(stickV.label) === stick && num(stickG.label) === stickShadow && num(palmG.label) === palmShadow))
    throw new Error('the walk reads the mission card: its figure does not write the lead’s lengths');
  const k = div(palmShadow, stickShadow);
  const h = mul(stick, k);
  MISSION = {
    c1: palmV.from + palmV.to,
    c2: palmG.from + palmG.to,
    h,
    // the pairing inverted: [MN] with the palm's shadow, [MA] with its height — the height × (the shadow ÷ the stick)
    inverted: div(mul(stickShadow, palmShadow), stick),
  };
  return {
    g1: 'droit',
    g2: 'soleil',
    c1: MISSION.c1,
    c2: MISSION.c2,
    kn: palmShadow,
    kd: stickShadow,
    k: write(k),
    m1: stick,
    m2: write(k),
    h: write(h),
  };
}
/** Zero rises to the h the card gives: the right one (the palm's top), or the inverted pairing's (above it). */
function missionRise(v) {
  if (!MISSION) return null;
  const inverted = v.c1 === MISSION.c2 && v.c2 === MISSION.c1;
  const h = inverted ? MISSION.inverted : q(v.h);
  const c = cmp(h, MISSION.h);
  return {
    h,
    fact: c === 0 ? 'apex' : c < 0 ? 'below' : 'above',
    ...(inverted ? { says: new RegExp(write(h).replace(',', '[,.]')) } : {}),
  };
}

export default {
  id: 'triangles-semblables',
  uid: 9340,
  // the words of each key's name that no screen shows before its tablet (its tablet's title is always added; the
  // lesson's title « Reconnaître des triangles semblables » stands on the title screen and is excepted by the library)
  forbidden: {
    'cotes-proportionnels': ['semblable', 'Semblable', 'homologue', 'Homologue', 'proportionnel', 'Proportionnel'],
    // K2's rule (its tiles say « deux paires d’angles égaux d’un triangle à l’autre »: the rule's own sentence, the third angle and the sum)
    'angles-egaux': ['égaux à deux angles', 'troisième angle', 'somme des angles'],
  },
  // the story's wrong first try at 📏: the quotients taken in the order of the names — TURN (linked by the names, its
  // quotients unequal, yet the world lays it on the template) refutes it on his own evidence
  falseTiles: { 'cotes-proportionnels': ['pair:noms', 'test:trois'] },
  truth: {
    'cotes-proportionnels': sidesTruth,
    'angles-egaux': anglesTruth,
  },
  use: {
    'cotes-proportionnels': useSides,
    'angles-egaux': useAngles,
  },
  // the trainer's forms, each answered from what its prompt GIVES
  solve: {
    // « Calcule k »: the sides of each ranked, the quotient of the shortest
    coef: (x) => {
      const k = rankedK(Object.values(x.one), Object.values(x.two));
      if (!k) throw new Error('coef: the two triangles do not have the same shape');
      return fracBoxes(k);
    },
    // « Calcule le côté »: the side given with its rank, its partner of the same rank in the first triangle
    longueur: (x) => {
      const a = ascending(Object.values(x.one));
      return { x: write(mul(a[x.ra], div(x.two[x.given], a[x.rg]))) };
    },
    troisieme: (x) => ({ x: write(third(x.angles[2], x.angles[3])) }),
    // « Calcule k » by the equal angles: the side of the second facing the angle equal to the one `mine` faces
    homologue: (x) => {
      const L = lengthsIn(x.prompt);
      return fracBoxes(div(lengthOf(L, homologous(x)), lengthOf(L, x.mine)));
    },
    apparier: (x) => {
      const h = homologous(x);
      return { h: sidesOf(x.n2).find((s) => sameLetters(s, h)) };
    },
  },
  statement: statementTrue,
  reasonTrue,
  // the board: what each figure station asks, from the lengths and angles its figure writes (lib/lessonWalk/board.mjs)
  board: {
    // the tracé turned: its sides by rank, the asked side the template's of its rank × k
    gabarit: (st) => {
      const map = rankMap(st);
      const asked = boardAsked(st);
      const tpl = Object.keys(map).find((s) => sameLetters(map[s], asked));
      return mul(boardLabels(st)[tpl], boardK(st, map));
    },
    // the contour of the tracé: the template's contour × k
    contour: (st) => {
      const L = boardLabels(st);
      return mul(sum(sidesOf('ABC').map((s) => L[s])), boardK(st, rankMap(st)));
    },
    // from the tracé back to the template: the tracé's side ÷ k (k written in the station's sentence)
    retour: (st) => {
      const m = /\\dfrac\{(\d+)\}\{(\d+)\}/.exec(st.text);
      const k = q(`${m[1]}/${m[2]}`);
      const map = rankMap(st);
      const asked = boardAsked(st);
      const tpl = Object.keys(map).find((s) => sameLetters(s, asked));
      return div(boardLabels(st)[map[tpl]], k);
    },
    'angles-1': commonAngles,
    'angles-2': commonAngles,
    // the side homologous to [AB]: the side of DEF of the same rank (by the lengths written)
    appariement: (st) => {
      const L = boardLabels(st);
      const [n1, n2] = boardTriangles(st);
      const rank = (n) => sidesOf(n).sort((x, y) => cmp(L[x], L[y]));
      const [r1, r2] = [rank(n1), rank(n2)];
      return q(L[r2[r1.findIndex((s) => sameLetters(s, 'AB'))]]);
    },
    // two right triangles with the same angle α at the foot: the vertices by their angles, k from a pair given
    rampes: (st) => {
      const [n1, n2] = boardTriangles(st);
      const right = st.figure.rightAngles.map((r) => r[1]);
      const alpha = st.figure.angles.map((a) => a.at);
      const map = vertexMap(n1, n2, [
        [right.find((v) => n1.includes(v)), right.find((v) => n2.includes(v))],
        [alpha.find((v) => n1.includes(v)), alpha.find((v) => n2.includes(v))],
      ]);
      const pairs = Object.fromEntries(sidesOf(n1).map((s) => [s, mapSide(map, s)]));
      const asked = boardAsked(st);
      const tpl = Object.keys(pairs).find((s) => sameLetters(pairs[s], asked));
      return mul(boardLabels(st)[tpl], boardK(st, pairs));
    },
  },
  // a tap of « Entraîne-toi » is a buoy of the same waves: judged by the same arithmetic, from its order and its formula
  gate: Object.fromEntries(
    ['quatrieme', 'coefficient', 'cote', 'troisieme', 'complement'].map((t) => [
      t,
      (x, n) => buoy(x.say, x.tex, String(n)),
    ]),
  ),
  run: buoy,
  mission,
  // the mission's distractor first (design, gate A 4th, note 1): the pairing inverted — Zero rises above the palm
  missionWrong: (v) => ({ ...v, c1: v.c2, c2: v.c1 }),
  missionRise,
  // the learning net gives this lesson TWO core tools, in this order: the fourth proportional (4e.m2.r07, the family
  // this lesson adds) and a figure enlarged or reduced (4e.m2.r09) — no French lesson of 4e yet: « Revois d’abord »
  // names each item itself
  launch: {
    scenario: 'pair',
    tools: [
      {
        item: '4e.m2.r07',
        name: 'La quatrième proportionnelle',
        year: 'vu en 4e',
        home: getItem('4e.m2.r07').text,
        memo: 4,
        second: 'write',
        firstOk: (x) =>
          x.calc?.op === 'fourth' &&
          [x.calc.a, x.calc.b, x.calc.c].every((n) => n < 10) &&
          Number.isInteger((x.calc.b * x.calc.c) / x.calc.a),
      },
      {
        item: '4e.m2.r09',
        name: 'Agrandir et réduire une figure',
        year: 'vu en 4e',
        home: getItem('4e.m2.r09').text,
        memo: 4,
        second: 'write',
        firstOk: (x) => x.calc?.op === 'fourth' && x.calc.b <= 8 && Number.isInteger((x.calc.b * x.calc.c) / x.calc.a),
      },
    ],
  },
};

// the walk's own arithmetic is checked once at load: the design's rounds and its last steps, a buoy of each kind, the
// reasons and statements of the trainer, the mission
{
  const T = ['2', '3', '3,8'];
  const bad = [];
  const ok = (cond, what) => cond || bad.push(what);
  ok(rankedK(T, ['4,5', '5,7', '3']) && eq(rankedK(T, ['4,5', '5,7', '3']), '3/2'), 'SIM');
  ok(rankedK(T, ['1,5', '1', '1,9']) && eq(rankedK(T, ['1,5', '1', '1,9']), '1/2'), 'RED');
  ok(rankedK(T, ['3', '4,5', '5,1']) == null && rankedK(T, ['3', '4', '4,8']) == null, 'ONE, DIFF');
  ok(sameAngles(['27', '41', '112'], ['41', '27', '112']), 'K2 R1');
  ok(!sameAngles(['27', '41', '112'], ['27', '55', '98']), 'K2 R2');
  ok(!sameAngles(['27', '41', '112'], ['33,75', '51,25', '140']), 'K2 R3');
  ok(
    !anglesTruth({
      kind: 'sides',
      angles: [['27'], ['41']],
      sides: [
        ['4', '6'],
        ['6', '9'],
      ],
    }),
    'K2 R4',
  );
  ok(
    anglesTruth({
      kind: 'sides',
      angles: [['27'], ['27']],
      sides: [
        ['4', '6'],
        ['6', '9'],
      ],
    }),
    'SAS',
  );
  ok(buoy('Complète', '\\dfrac{6}{9} = \\dfrac{10}{\\square}', '15'), 'quatrieme');
  ok(!buoy('Complète', '\\dfrac{6}{9} = \\dfrac{10}{\\square}', '13'), 'quatrieme, the difference added');
  ok(buoy('Calcule', '9 \\div 6', '1,5') && !buoy('Calcule', '9 \\div 6', '3'), 'coefficient');
  ok(buoy('Calcule', '6 \\times 1{,}5', '9') && !buoy('Calcule', '6 \\times 1{,}5', '7,5'), 'cote');
  ok(buoy('Calcule', '180 - 65 - 48', '67') && !buoy('Calcule', '180 - 65 - 48', '113'), 'troisieme');
  ok(
    buoy('Complète', '65 + 48 + \\square = 180', '67') && !buoy('Complète', '65 + 48 + \\square = 180', '77'),
    'complement',
  );
  ok(reasonTrue('car $\\dfrac{6}{4} = \\dfrac{7{,}5}{5} = \\dfrac{9}{6} = \\dfrac{3}{2}$'), 'reason =');
  ok(reasonTrue('car $\\dfrac{6}{4} = \\dfrac{3}{2}$ mais $\\dfrac{8}{6}$ ne vaut pas $\\dfrac{3}{2}$'), 'reason ≠');
  ok(
    !reasonTrue('car $\\dfrac{6}{4} = \\dfrac{3}{2}$ mais $\\dfrac{9}{6}$ ne vaut pas $\\dfrac{3}{2}$'),
    'reason false ≠',
  );
  ok(reasonTrue('car $180 - 49 - 58 = 73$ et $180 - 49 - 58 = 73$ : les angles sont les mêmes'), 'reason angles');
  ok(!reasonTrue('car les deux triangles ont un angle égal'), 'a foil');
  ok(
    statementTrue(
      'Dans ABC : AB = 6, BC = 4 et CA = 5. Dans DEF : DE = 7{,}5, EF = 9 et FD = 6. Les deux triangles sont semblables.',
    ) === true,
    'tf sides',
  );
  ok(
    statementTrue(
      'Dans ABC : 25^\\circ et 53^\\circ. Dans DEF : 25^\\circ et 74^\\circ. Les deux triangles sont semblables.',
    ) === false,
    'tf angles',
  );
  const card = {
    figure: {
      points: { N: [0, 1.9], M: [0, 0], A: [2.4, 0], C: [5, 7.2], P: [5, 0], S: [14, 0] },
      segments: [
        { from: 'M', to: 'N', label: '1,6' },
        { from: 'M', to: 'A', label: '2' },
        { from: 'N', to: 'A' },
        { from: 'P', to: 'C', label: 'h' },
        { from: 'P', to: 'S', label: '21' },
        { from: 'C', to: 'S' },
      ],
      rightAngles: [
        ['N', 'M', 'A'],
        ['C', 'P', 'S'],
      ],
    },
  };
  const m = mission(
    'Un bâton vertical de 1,6 m porte une ombre de 2 m. Au même moment, l’ombre du palmier mesure 21 m. Quelle est sa hauteur ?',
    card,
  );
  ok(m.c1 === 'PC' && m.c2 === 'PS' && m.k === '10,5' && m.h === '16,8', 'mission');
  const inv2 = missionRise({ ...m, c1: m.c2, c2: m.c1 });
  ok(eq(inv2.h, '26,25') && inv2.fact === 'above' && missionRise(m).fact === 'apex', 'mission inverted');
  MISSION = null;
  if (bad.length) throw new Error(`triangles-semblables.walk: arithmetic (${bad.join(', ')})`);
}
