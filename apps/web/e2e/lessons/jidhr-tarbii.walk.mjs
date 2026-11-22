// The walks of lesson `jidhr-tarbii` « الجذر التربيعي لعدد موجب », the first lesson of the world « قصر الساحات » — a
// DESCRIPTOR for lib/lessonWalk (README there): only what the lesson's files cannot say — the walk's own arithmetic of
// every verdict (exact fractions, lib/lessonWalk/worlds/exact.mjs — never the lesson's `logic.js`), and the words no
// screen may show before their tablet. The world's story player: lib/lessonWalk/worlds/rootCourts.mjs.
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs jidhr-tarbii [story|hub|trainer|board|launch|sitting|all] [outDir]
import { cmp, display, eq, isqrt, platform, q, rootOf, sq, write, absq } from '../lib/lessonWalk/worlds/exact.mjs';

const rides = (c) => platform(c.s, c.a).kind === 'ride';
const nums = (s) =>
  (
    String(s)
      .replace(/[⁦⁩]/g, '')
      .match(/\d+(?:,\d+)?/g) ?? []
  ).map((x) => x);
/** A number as the rail or a sheet shows it: « 0,7 », « −9 », « \dfrac{3}{5} », 12. */
const read = (x) =>
  q(
    String(x)
      .replace(/\\[dt]?frac\{([^}]*)\}\{([^}]*)\}/, '$1/$2')
      .replace(/[{}]/g, '')
      .trim(),
  );
const isWhole = (x) => q(x).d === 1n;
/** The rod of two decimals that still leaves a band on a court of area a: its side cut to 0,01. */
const cut2 = (a) => {
  const c = isqrt((q(a).n * 10000n) / q(a).d);
  return { i: Number(c / 100n), d: String(c % 100n).padStart(2, '0') };
};
/** A LaTeX formula of the rail, evaluated exactly (null when the walk cannot read it). */
function evalTex(tex) {
  const t = String(tex)
    .replace(/\\displaystyle|\\textstyle|\\left|\\right|\\,|\\;/g, '')
    .replace(/\{,\}/g, ',')
    .replace(/\\[dt]?frac\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)')
    .replace(/\s+/g, ' ')
    .trim();
  const strip = (x) => x.replace(/^\((.*)\)$/, '$1').replace(/^\((.*)\)$/, '$1');
  let m = /^\(\\sqrt\{(.+)\}\)\^2$/.exec(t);
  if (m) return q(strip(m[1])); // the court built on the side of the court of a
  m = /^\\sqrt\{(.+)\^2\}$/.exec(t);
  if (m) return absq(q(strip(m[1]))); // the side of the court built on a rod: a length
  m = /^\\sqrt\{(.+)\}$/.exec(t);
  if (m) return rootOf(strip(m[1]));
  if (/^[\d ,]+(\\times [\d ,]+)+$/.test(t))
    return t
      .split('\\times')
      .map((x) => q(x.trim()))
      .reduce((p, x) => ({ n: p.n * x.n, d: p.d * x.d }), q('1')); // a product the course asks: 3 × 3 × 3
  return null;
}

/**
 * Is `gate` the right gate of a wave of the rail, from what the rail SHOWS: its order `ask` (words), its formula `tex`
 * (its source), the gate's number? The course of the third terrace and every practice wave (`world/practice.js`).
 */
function run(ask, tex, gate) {
  const g = read(gate);
  const a = String(ask);
  if (/أكبر عدد طبيعي أصغر من/.test(a)) return isWhole(g) && eq(g, String(isqrt(nums(tex)[0])));
  if (/أصغر عدد طبيعي أكبر من/.test(a)) return isWhole(g) && eq(g, String(isqrt(nums(tex)[0]) + 1n));
  if (/لا تركبها منصّة/.test(a)) return cmp(g, '0') >= 0 && rootOf(g) === null;
  if (/تركبها منصّة/.test(a)) return cmp(g, '0') >= 0 && rootOf(g) !== null;
  if (/الحاسبة عرضت/.test(a)) return isWhole(g) && cmp(g, '0') > 0 && eq(display(g), nums(a)[0]);
  if (/ضلع ساحة مساحتها/.test(a)) return cmp(g, '0') >= 0 && eq(sq(g), nums(a)[0]);
  if (/المخفيّ/.test(a)) {
    const k = /= (.+)$/.exec(String(tex).replace(/\{,\}/g, ','))[1];
    return eq(g, sq(k));
  }
  const v = evalTex(tex);
  if (v == null) throw new Error(`the walk cannot read the gate « ${ask} » ${tex}`);
  return cmp(g, '0') >= 0 && eq(g, v);
}

/** A sentence of « صحيح أم خطأ؟ », judged from its own numbers. */
function statement(t) {
  const s = t.replace(/\{,\}/g, ',').replace(/\s+/g, ' ').trim();
  let m = /^-?\\sqrt\{(.+?)\} = (-?[\d,]+)$/.exec(s);
  if (m) return cmp(m[2], '0') >= 0 && eq(sq(m[2]), m[1]);
  m = /^العدد (-?[\d,]+) هو الجذر التربيعي للعدد ([\d,]+)$/.exec(s);
  if (m) return cmp(m[1], '0') >= 0 && eq(sq(m[1]), m[2]);
  m = /^([\d,]+) < \\sqrt\{([\d,]+)\} < ([\d,]+)$/.exec(s);
  if (m) return cmp(sq(m[1]), m[2]) < 0 && cmp(m[2], sq(m[3])) < 0;
  m = /^\(\\sqrt\{([\d,]+)\}\)\^2 = (-?[\d,]+)$/.exec(s);
  if (m) return eq(m[1], m[2]);
  m = /^\\sqrt\{\((-?[\d,]+)\)\^2\} = (-?[\d,]+)$/.exec(s);
  if (m) return eq(absq(m[1]), m[2]);
  throw new Error(`the walk cannot read the statement « ${t} »`);
}

/** The false general facts a reason may state (what a student of this lesson knows to be false). */
const FALSE_FACTS = [
  /هو نصفه/,
  /هو ربعه/,
  /تعرض الطول كاملًا/,
  /لكلّ جذر تربيعي كتابة عشريّة/,
  /يحفظان إشارة/,
  /مربّع عدد هو ضعفه/,
];
/** A reason of « علّل »: every product and every bracket it writes holds, and it states no false general fact. */
function reasonTrue(text) {
  const t = text
    .replace(/\$/g, '')
    .replace(/\\times/g, '×')
    .replace(/\{,\}/g, ',')
    .replace(/[⁦⁩]/g, '');
  if (FALSE_FACTS.some((re) => re.test(t))) return false;
  for (const m of t.matchAll(/\(?(-?[\d,]+)\)? × \(?(-?[\d,]+)\)? = (-?[\d,]+)/g))
    if (!eq({ n: q(m[1]).n * q(m[2]).n, d: q(m[1]).d * q(m[2]).d }, m[3])) return false;
  for (const m of t.matchAll(/([\d,]+) < ([\d,]+) < ([\d,]+)/g))
    if (!(cmp(m[1], m[2]) < 0 && cmp(m[2], m[3]) < 0)) return false;
  return true;
}
const dec = (x) => {
  const [i, d = '0'] = write(x).split(',');
  return { i: Number(i), d };
};
const bumpDigits = (d) => String(Number(d) + 1).padStart(d.length, '0');

export default {
  id: 'jidhr-tarbii',
  uid: 9300,
  // the words of each key that no screen shows before its tablet (its title is always added)
  forbidden: {
    'dil-as-saha': ['√', 'جذر'],
    'qima-madbuta': ['مضبوط', 'مقرّب', 'تقريب'],
    'dhahab-wa-iyab': ['ذهاب', 'إياب'],
  },
  /** Before the first tablet, no screen of the story shows the sign nor the word (the lesson's own promise). */
  beforeFirst: /√|جذر/,
  // what the world does with a case of each forge: its platform rides when the rod's square is the court's area
  truth: { 'dil-as-saha': rides, 'qima-madbuta': rides, 'dhahab-wa-iyab': rides },
  use: {
    // a square courtyard of three digits: the rod whose square is its area, written twice, and the side
    'dil-as-saha': (u) => {
      const s = Number(isqrt(u.area));
      if (s * s !== u.area) throw new Error(`${u.area} is not a square`);
      return { x: s, y: s, side: s };
    },
    // each display of the calculator with ITS court (the court whose ten digits are that display), then the rod of
    // two decimals that still leaves a band on the first court
    'qima-madbuta': (u) => {
      const box = {};
      u.shows.forEach((shown, k) => {
        const a = u.areas.filter((x) => eq(display(String(x)), shown));
        if (a.length !== 1) throw new Error(`the display ${shown} belongs to ${a.length} courts`);
        box[`a${k}`] = a[0];
      });
      const c = cut2(String(u.areas[0]));
      return { ...box, i: c.i, d: c.d };
    },
    // the court built on the side of the court of w is w; the side of the court built on a rod r is r; a walk of k
    // steps to the left builds a court whose side is k (a length has no sign); a fraction comes back as it went
    'dhahab-wa-iyab': (u) => ({ p: u.wall, s: u.rod, w: Math.abs(u.walk), n: u.frac[0], d: u.frac[1] }),
  },
  /** The longest rod of two decimals that still leaves a band on the court of area a (« 5,47 » for 30). */
  nearest: (a) => {
    const c = cut2(a);
    return `${c.i},${c.d}`;
  },
  /** The final mission: a feast court whose side is whole, a garden between two whole sides, the square of its side. */
  mission: (lead) => {
    const [feast, garden] = nums(lead).map(Number);
    const side = Number(isqrt(feast));
    if (side * side !== feast) throw new Error(`the feast court ${feast} has no whole side`);
    const low = Number(isqrt(garden));
    return { side, low, high: low + 1, sq: garden };
  },
  run,
  // the trainer's taps: the same arithmetic on the wave's own numbers
  gate: {
    side: (x, n) => cmp(read(n), '0') >= 0 && eq(sq(read(n)), x.a),
    sqrt: (x, n) => cmp(read(n), '0') >= 0 && eq(sq(read(n)), x.a),
    of: (x, n) => eq(read(n), sq(x.k)),
    before: (x, n) => eq(read(n), String(isqrt(x.a))),
    after: (x, n) => eq(read(n), String(isqrt(x.a) + 1n)),
    noRide: (x, n) => rootOf(read(n)) === null,
    ride: (x, n) => rootOf(read(n)) !== null,
    display: (x, n) => isWhole(read(n)) && eq(display(read(n)), x.shows),
    sqSqrt: (x, n) => eq(read(n), x.a),
    sqrtSq: (x, n) => cmp(read(n), '0') >= 0 && eq(sq(read(n)), sq(x.x)),
  },
  solve: {
    bila: (x) => {
      const r = rootOf(x.a);
      if (x.shape === 'whole') return { r: Number(r.n) };
      if (x.shape === 'dec') return dec(r);
      return { n: Number(r.n), d: Number(r.d) };
    },
    of: (x) => ({ a: Number(q(x.k).n) ** 2 }),
    dil: (x) => ({ s: Number(isqrt(x.a)) }),
    hasr: (x) => ({ lo: Number(isqrt(x.a)), hi: Number(isqrt(x.a)) + 1 }),
    muqarraba: (x) => {
      const lo = isqrt(BigInt(x.a) * 10000n);
      const a = dec(q(`${lo}/100`));
      const b = dec(q(`${lo + 1n}/100`));
      return { i1: a.i, d1: a.d.padEnd(2, '0'), i2: b.i, d2: b.d.padEnd(2, '0') };
    },
    ihsib: (x) => ({ A: x.a, B: Math.abs(x.b) }),
    ihsibFrac: (x) => {
      const A = dec(x.x);
      const B = q(x.f);
      return { i: A.i, d: A.d, n: Number(B.n), dn: Number(B.d) };
    },
  },
  wrong: {
    bila: (x, v) =>
      x.shape === 'dec' ? { ...v, d: bumpDigits(v.d) } : { ...v, [Object.keys(v).at(-1)]: Object.values(v).at(-1) + 1 },
    muqarraba: (x, v) => ({ ...v, d2: bumpDigits(v.d2) }),
  },
  statement,
  reasonTrue,
  launch: {
    scenario: 'one',
    tool: {
      item: '3am.m3.r06',
      name: 'حساب قوّة عدد نسبي',
      year: 'من السنة الثالثة متوسط',
      home: 'قوة عدد نسبي',
      memo: 4,
      second: 'sort',
      // the very first question (`families.js › powerWrite`, first): the square of 2 or 8
      firstOk: (x) => x.calc?.op === 'pow' && x.calc.e === 2 && [2, 8].includes(x.calc.x),
    },
  },
};
