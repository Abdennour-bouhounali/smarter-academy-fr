// The walks of lesson `natiqa-ghayr-natiqa` « الأعداد الناطقة والأعداد غير الناطقة », the second lesson of the world
// « قصر الساحات » — a DESCRIPTOR for lib/lessonWalk (README there): only what the lesson's files cannot say — the walk's own
// arithmetic of every verdict (exact fractions, lib/lessonWalk/worlds/exact.mjs — never the lesson's `math.js`), the
// words no screen may show before their tablet, the false rule each forge refutes first, and the guesses of the story.
// The world's story player for terraces of several courts: lib/lessonWalk/worlds/rootCourtsTerraces.mjs.
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs natiqa-ghayr-natiqa [story|hub|trainer|board|launch|sitting|all] [outDir]
import { slashFractions } from '../lib/lessonWalk/worlds/rootCourtsTerraces.mjs';
import { cmp, eq, isqrt, mul, platform, q, rootOf, sq, write } from '../lib/lessonWalk/worlds/exact.mjs';

/** A number as the rail or a sheet shows it: « 1,4 », « \dfrac{3}{7} », « 3/7 ». */
const read = (x) =>
  q(
    String(x)
      .replace(/[⁦⁩]/g, '')
      .replace(/\\displaystyle|\\textstyle/g, '')
      .replace(/\\[dt]?frac\{([^}]*)\}\{([^}]*)\}/, '$1/$2')
      .replace(/\{,\}/g, ',')
      .replace(/[{}\s]/g, ''),
  );
const ten = (k) => 10n ** BigInt(k);
/** ⌊√a × 10^k⌋ — the marks of 10^-k below the end of the wall of a court of area a (exact). */
const below = (a, k) => {
  const A = q(a);
  return isqrt((A.n * ten(2 * k)) / A.d);
};
/** The value by default (cut), by excess (above), the middle mark and the nearer (rounded) of √a to 10^-k. */
const cut = (a, k) => write(`${below(a, k)}/${ten(k)}`);
const above = (a, k) => write(`${below(a, k) + 1n}/${ten(k)}`);
const middle = (a, k) => write(`${below(a, k) * 10n + 5n}/${ten(k + 1)}`);
// a middle mark whose platform does not jam (a band, or riding exactly) puts the end of the wall nearer the upper mark
const rounded = (a, k) => (cmp(sq(middle(a, k)), a) <= 0 ? above(a, k) : cut(a, k));
const decimals = (x) => (write(x).split(',')[1] ?? '').length;
/** A decimal as its two boxes: the whole part, the decimals (« 0,13 » → 0 and « 13 »). */
const boxes = (x, i = 'i', d = 'd') => {
  const [a, b = '0'] = write(x).split(',');
  return { [i]: Number(a), [d]: b };
};
/** The radicand of a formula « \sqrt{2{,}56} », « \sqrt{\dfrac{18}{50}} ». */
const radicand = (tex) => {
  const m = /\\sqrt\{(.+)\}\s*$/.exec(String(tex).trim());
  return m ? read(m[1]) : null;
};

/** Is `gate` the right gate of a wave of the practice rail, from what the rail SHOWS (`world/practice.js`)? */
function run(ask, tex, gate) {
  const g = read(gate);
  const a = String(ask).replace(/[⁦⁩]/g, '');
  const area = /لضلع الساحة ([\d,]+)/.exec(a)?.[1];
  const step = /(?:علامات|إلى) ([\d,]+)/.exec(a)?.[1];
  if (/لا يكتب ضلعها أيّ كسر/.test(a)) return rootOf(g) === null;
  if (/يكتب ضلعها عدد عشريّ أو كسر/.test(a)) return rootOf(g) !== null;
  if (/العلامة الأقرب/.test(a)) return eq(g, rounded(area, decimals(step)));
  if (/بالنقصان/.test(a)) return eq(g, cut(area, decimals(step)));
  if (/بالزيادة/.test(a)) return eq(g, above(area, decimals(step)));
  if (/الحاسبة عرضت/.test(a)) {
    const x = /^([\d{},]+)\^2$/.exec(String(tex).trim())?.[1];
    if (!x) throw new Error(`the walk cannot read the square « ${tex} »`);
    return eq(g, sq(read(x)));
  }
  const r = radicand(tex);
  if (r == null) throw new Error(`the walk cannot read the gate « ${a} » ${tex}`);
  return cmp(g, '0') >= 0 && eq(sq(g), r);
}

/** A sentence of « صحيح أم خطأ؟ », judged from its own numbers. */
function statement(t) {
  const s = t.replace(/\{,\}/g, ',').replace(/\s+/g, ' ').trim();
  let m = /^\\sqrt\{(.+)\} = (.+)$/.exec(s);
  if (m) return cmp(read(m[2]), '0') >= 0 && eq(sq(read(m[2])), read(m[1]));
  m = /^العدد \\sqrt\{(.+)\} عدد ناطق$/.exec(s);
  if (m) return rootOf(read(m[1])) !== null;
  m = /^مدو.?.?ر \\sqrt\{([\d,]+)\} إلى ([\d,]+) هو ([\d,]+)$/.exec(s);
  if (m) return eq(m[3], rounded(m[1], decimals(m[2])));
  throw new Error(`the walk cannot read the statement « ${t} »`);
}

/** The false general facts a reason may state (what a student of this lesson knows to be false). */
const FALSE_FACTS = [/هو نصفه/, /جذر بسطه وحده/, /تعرض أرقامًا كثيرة/, /كلّ عدد عشريّ مربّع/, /دائمًا القيمة المقرّبة/];
/** A reason of « علّل »: every product it writes holds, and it states no false general fact. */
function reasonTrue(text) {
  const t = text
    .replace(/\$/g, '')
    .replace(/\\times/g, '×')
    .replace(/\{,\}/g, ',')
    .replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2')
    .replace(/[⁦⁩]/g, '');
  if (FALSE_FACTS.some((re) => re.test(t))) return false;
  for (const m of t.matchAll(/([\d,/]+) × ([\d,/]+) = ([\d,/]+)/g)) if (!eq(mul(m[1], m[2]), m[3])) return false;
  return true;
}
const bump = (d) => String(Number(d) + 1).padStart(String(d).length, '0');

export default {
  id: 'natiqa-ghayr-natiqa',
  uid: 9400,
  // the words of each key that no screen shows before its tablet (its title is always added); « مدوَّر » in its spellings
  forbidden: {
    'murabba-natiq': ['ناطق'],
    'la-kasr-yarkab': ['غير ناطق', 'غير الناطق'],
    'al-mudawwar': ['مدوَّر', 'مدوّر', 'مدوّر', 'مدور', 'المدوّر'],
  },
  // every fraction of every screen over a real bar: no text node « p/q » (the stars of the top bar are a score)
  textRules: [{ on: slashFractions, what: 'every fraction over a real bar — no text « p/q »' }],
  story: {
    // « سطح الفرز »: the way out ridden SECOND — its platform must wait until the other four are done
    order: { farz: ['sortA', 'sortOut', 'sortB', 'sortC', 'sortD'] },
    // the yes/no card: as he would (the walk's arithmetic) — and the other way once: 1,6 « is 16 over 10, 16 is a square »
    guess: { sortB: 'yes' },
    reloadAfter: 'murabba-natiq',
  },
  // the false rule each forge plays first, refuted on his own evidence (the forges' agent's notes, checked on the run)
  falseTiles: {
    'murabba-natiq': ['form:asis', 'cond:top'],
    'la-kasr-yarkab': ['num:close', 'calc:near', 'wall:rides'],
    'al-mudawwar': ['pick:lo', 'when:always'],
  },
  // what the world does with a case of each forge, computed here
  truth: {
    // a rod whose length is a number rides the court exactly when its area is the square of a number
    'murabba-natiq': (c) => rootOf(c.a) !== null,
    // the platform of the rod (a fraction, the calculator's digits, or the wall) rides — exactly
    'la-kasr-yarkab': (c) => platform(c.s.root != null ? { root: c.s.root } : { q: c.s.q }, c.a).kind === 'ride',
    // « of the two neighbouring marks, the claimed one is the nearer »: the middle mark decides
    'al-mudawwar': (c) => c.claim === (eq(rounded(c.a, c.k), above(c.a, c.k)) ? 'hi' : 'lo'),
  },
  use: {
    // the sides of a decimal court and of two fractions (the second reduces), and whether a number rides the fourth
    'murabba-natiq': (u) => {
      const side = (x) => {
        const r = rootOf(x);
        if (!r) throw new Error(`${x} has no side among the numbers`);
        return r;
      };
      const f1 = side(`${u.frac[0]}/${u.frac[1]}`);
      const f2 = side(`${u.red[0]}/${u.red[1]}`);
      return {
        ...boxes(side(u.dec)),
        n1: Number(f1.n),
        d1: Number(f1.d),
        n2: Number(f2.n),
        d2: Number(f2.d),
        verdict: rootOf(u.fourth) !== null ? 'yes' : 'no',
      };
    },
    // the square of the display cut to 0,01, by hand; and whether some fraction rides the court
    'la-kasr-yarkab': (u) => ({ ...boxes(sq(u.t)), verdict: rootOf(u.a) !== null ? 'yes' : 'no' }),
    // the two marks of 10^-k the wall ends between, and the nearer
    'al-mudawwar': (u) => ({
      ...boxes(cut(u.a, u.k), 'i1', 'd1'),
      ...boxes(above(u.a, u.k), 'i2', 'd2'),
      ...boxes(rounded(u.a, u.k), 'i3', 'd3'),
    }),
  },
  /** The final mission, from its lead's formulas (the three areas first): two exact sides, a cut and a rounded value. */
  mission: (tex) => {
    const [exact, frac, none] = tex.slice(0, 3).map(read);
    const A = rootOf(exact);
    const F = rootOf(frac);
    if (!A || !F || rootOf(none))
      throw new Error(`the mission's courts are not what the walk expects (${tex.join(' | ')})`);
    const [a1, a2] = write(A).split(',');
    const [b1, b2] = cut(none, 2).split(',');
    const [c1, c2] = rounded(none, 2).split(',');
    return { a1, a2, n: Number(F.n), d: Number(F.d), b1, b2, c1, c2 };
  },
  /** One near miss first: the third line one mark short (a mark nearer the end of the wall exists). */
  missionMiss: (sol) => {
    const shorter = write(`${Number(`${sol.b1}${sol.b2}`) - 1}/100`);
    const [b1, b2] = shorter.split(',');
    return {
      what: `${shorter} for the third side`,
      values: { ...sol, b1, b2 },
      fact: (f) => /الثالث/.test(f) && f.includes(write(`${sol.b1},${sol.b2}`)),
    };
  },
  run,
  // the trainer's taps: the same arithmetic on the wave's own numbers
  gate: {
    sqrtDec: (x, n) => cmp(read(n), '0') >= 0 && eq(sq(read(n)), x.a),
    sqrtFrac: (x, n) => cmp(read(n), '0') >= 0 && eq(sq(read(n)), x.a),
    writable: (x, n) => rootOf(read(n)) !== null,
    notWritable: (x, n) => rootOf(read(n)) === null,
    calcSquare: (x, n) => eq(read(n), sq(x.x)),
    byDefault: (x, n) => eq(read(n), cut(x.a, x.k)),
    byExcess: (x, n) => eq(read(n), above(x.a, x.k)),
    round: (x, n) => eq(read(n), rounded(x.a, x.k)),
  },
  solve: {
    jidhr: (x) => {
      const r = rootOf(x.shown ? `${x.shown[0]}/${x.shown[1]}` : x.a);
      return x.shape === 'dec' ? boxes(r) : { n: Number(r.n), d: Number(r.d) };
    },
    dil: (x) => boxes(rootOf(x.a)),
    murabbaQima: (x) => boxes(sq(x.x)),
    tadwir: (x) => ({ ...boxes(cut(x.a, 1), 'i1', 'd1'), ...boxes(rounded(x.a, 1), 'i2', 'd2') }),
    qiyam: (x) => ({
      ...boxes(cut(x.a, 2), 'i1', 'd1'),
      ...boxes(above(x.a, 2), 'i2', 'd2'),
      ...boxes(rounded(x.a, 2), 'i3', 'd3'),
    }),
  },
  wrong: {
    jidhr: (x, v) => (x.shape === 'dec' ? { ...v, d: bump(v.d) } : { ...v, d: v.d + 1 }),
    dil: (x, v) => ({ ...v, d: bump(v.d) }),
    murabbaQima: (x, v) => ({ ...v, d: bump(v.d) }),
    tadwir: (x, v) => ({ ...v, d2: bump(v.d2) }),
    qiyam: (x, v) => ({ ...v, d3: bump(v.d3) }),
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
      firstOk: (x) => x.calc?.op === 'pow' && x.calc.e === 2 && [2, 8].includes(x.calc.x),
    },
  },
};
