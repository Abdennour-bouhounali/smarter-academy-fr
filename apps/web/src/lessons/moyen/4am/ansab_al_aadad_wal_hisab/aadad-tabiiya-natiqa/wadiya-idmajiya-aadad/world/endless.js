/**
 * « سباق الأعداد » — THE ENDLESS GAME of unit 1, reached from the home of « أدمج تعلّماتي » (owner, 2026-11-20: the robot
 * runs away from the camera as in the gate run of lesson 1 and the student steers it LEFT and RIGHT toward the right
 * number — he first asked up and down, then: « i did not like the up/down system »; « the endless game will begin very very easy using
 * the lessons from grade 1AM », then it climbs to the unit's own lessons). CONTENT ONLY, pure: the world
 * (`gameworld/missionIsle`) runs it. A game — never evidence.
 *
 * A ROUND = an order on the sign, three gates, ONE right:
 *   { ask, tex?, options: [{ t } | { tex }], right, why: [null | string × 3] }
 * `why[i]` is what a wrong gate answers: the fact that refutes it, in one line of numbers — never « خطأ ».
 * `LEVELS` go from the easiest (parity, the table of 5 and 10) to the unit's last lesson (the irreducible fraction).
 */
const ltr = (s) => `⁦${s}⁩`;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const pick = (rand, xs) => xs[Math.floor(rand() * xs.length)];
const int = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const division = (a, b) => ltr(`${a} = ${b} × ${Math.floor(a / b)} + ${a % b}`);

/** One right value and two wrong ones, laid on the three gates in an order drawn by `rand`. */
function round(rand, ask, good, bad, { tex = null, show = (x) => ({ t: String(x) }) } = {}) {
  const right = int(rand, 0, 2);
  const options = [];
  const why = [];
  let k = 0;
  for (let i = 0; i < 3; i += 1) {
    if (i === right) {
      options.push(show(good));
      why.push(null);
    } else {
      options.push(show(bad[k].v));
      why.push(bad[k].why);
      k += 1;
    }
  }
  return { ask, ...(tex ? { tex } : {}), options, right, why };
}
/** Two different values of `make()` that pass `ok`, none equal to `not`. */
function two(rand, make, ok, not = []) {
  const out = [];
  for (let guard = 0; out.length < 2 && guard < 400; guard += 1) {
    const v = make();
    if (ok(v) && !out.includes(v) && !not.includes(v)) out.push(v);
  }
  return out;
}

/** « مضاعف للعدد k » — 1AM: the tables, then any number. */
const multipleOf = (ks, top) => (rand) => {
  const k = pick(rand, ks);
  const good = k * int(rand, 2, Math.floor(top / k));
  const bad = two(
    rand,
    () => int(rand, k + 1, top),
    (v) => v % k !== 0,
    [good],
  );
  return round(
    rand,
    `مضاعف للعدد ${k}`,
    good,
    bad.map((v) => ({ v, why: `${division(v, k)}: يبقى ${v % k}.` })),
  );
};
/** « عدد زوجي » / « عدد فردي » — the very first rounds. */
const parity = (rand) => {
  const even = rand() < 0.5;
  const make = () => int(rand, 11, 98);
  const [good] = two(rand, make, (v) => (v % 2 === 0) === even);
  const bad = two(rand, make, (v) => (v % 2 === 0) !== even, [good]);
  return round(
    rand,
    even ? 'عدد زوجي' : 'عدد فردي',
    good,
    bad.map((v) => ({ v, why: `${division(v, 2)}: ${v} عدد ${v % 2 ? 'فردي' : 'زوجي'}.` })),
  );
};
/** « a × b » — a product of the tables. */
const product = (rand) => {
  const a = int(rand, 3, 9);
  const b = int(rand, 3, 9);
  const bad = two(
    rand,
    () => a * b + pick(rand, [-a, a, -b, b, 1, -1, 10]),
    (v) => v > 0 && v !== a * b,
  );
  return round(
    rand,
    'حاصل الجداء',
    a * b,
    bad.map((v) => ({ v, why: `${ltr(`${a} × ${b} = ${a * b}`)}، وليس ${v}.` })),
    { tex: `${a} \\times ${b}` },
  );
};
/** « قاسم للعدد n » — lessons 1 and 2 of the unit. */
const divisorOf = (rand) => {
  const n = pick(rand, [24, 30, 36, 40, 42, 48, 54, 56, 60, 72, 84, 90, 96]);
  const [good] = two(
    rand,
    () => int(rand, 2, n / 2),
    (v) => n % v === 0,
  );
  const bad = two(
    rand,
    () => int(rand, 4, n / 2 + 4),
    (v) => n % v !== 0,
    [good],
  );
  return round(
    rand,
    `قاسم للعدد ${n}`,
    good,
    bad.map((v) => ({ v, why: `${division(n, v)}: يبقى ${n % v}.` })),
  );
};
/** « قاسم مشترك للعددين a و b » — lesson 4. */
const commonDivisor = (rand) => {
  const g = pick(rand, [4, 6, 8, 9, 10, 12, 14, 15]);
  const [p, q] = pick(rand, [
    [2, 3],
    [3, 4],
    [3, 5],
    [2, 5],
    [4, 5],
    [5, 7],
  ]);
  const a = g * q;
  const b = g * p;
  const [good] = two(
    rand,
    () => int(rand, 2, g),
    (v) => g % v === 0,
  );
  const bad = two(
    rand,
    () => int(rand, 2, g + 6),
    (v) => g % v !== 0 && (a % v !== 0 || b % v !== 0),
    [good],
  );
  return round(
    rand,
    `قاسم مشترك للعددين ${a} و ${b}`,
    good,
    bad.map((v) => ({ v, why: `${division(a % v ? a : b, v)}: ${v} لا يقسم ${a % v ? a : b}.` })),
  );
};
/** « PGCD(a ; b) » — lessons 4 to 6: a smaller common divisor is on a gate too. */
const greatest = (rand) => {
  const g = pick(rand, [6, 8, 9, 10, 12, 14, 15, 16, 18, 20]);
  const [p, q] = pick(rand, [
    [2, 3],
    [3, 4],
    [3, 5],
    [2, 5],
    [4, 5],
    [5, 7],
    [3, 7],
  ]);
  const a = g * q;
  const b = g * p;
  const small = pick(
    rand,
    [2, 3, 4, 5, 6, 7, 8, 9, 10].filter((d) => d < g && g % d === 0),
  );
  const [other] = two(
    rand,
    () => int(rand, 3, g + 8),
    (v) => a % v !== 0 || b % v !== 0,
    [g, small],
  );
  return round(
    rand,
    'القاسم المشترك الأكبر',
    g,
    [
      { v: small, why: `${small} يقسم ${a} و ${b}، لكنّ ${g} يقسمهما أيضًا، وهو أكبر.` },
      { v: other, why: `${division(a % other ? a : b, other)}: ${other} لا يقسم ${a % other ? a : b}.` },
    ],
    { tex: `\\mathrm{PGCD}(${a} ; ${b})` },
  );
};
/** « عدد أوّلي مع n » — lesson 7. */
const coprimeWith = (rand) => {
  const n = pick(rand, [8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 25]);
  const make = () => int(rand, 4, 40);
  const [good] = two(rand, make, (v) => gcd(n, v) === 1);
  const bad = two(rand, make, (v) => gcd(n, v) > 1 && v !== n, [good]);
  return round(
    rand,
    `عدد أوّلي مع ${n}`,
    good,
    bad.map((v) => ({ v, why: `${gcd(n, v)} يقسم ${n} و ${v}: ${ltr(`PGCD(${n} ; ${v}) = ${gcd(n, v)}`)}.` })),
  );
};
/** « the irreducible form of a/b » — lesson 8: the three gates are fractions. */
const irreducible = (rand) => {
  const [p, q] = pick(rand, [
    [2, 3],
    [3, 4],
    [3, 5],
    [2, 5],
    [4, 5],
    [5, 7],
    [3, 7],
    [5, 6],
    [4, 7],
  ]);
  const k = pick(rand, [4, 6, 8, 9, 10, 12]);
  const d = pick(
    rand,
    [2, 3].filter((x) => k % x === 0),
  );
  const frac = ([n, m]) => ({ tex: `\\dfrac{${n}}{${m}}` });
  const half = [(p * k) / d, (q * k) / d];
  const off = [p, q + 1];
  return round(
    rand,
    'الشكل غير القابل للاختزال للكسر',
    [p, q],
    [
      { v: half, why: `${ltr(`${half[0]}\u00a0/\u00a0${half[1]}`)} ما زال يُختزل: ${k / d} يقسم ${half[0]} و ${half[1]}.` },
      {
        v: off,
        why: `${ltr(`${p * k} × ${off[1]} = ${p * k * off[1]}`)} و ${ltr(`${q * k} × ${off[0]} = ${q * k * off[0]}`)}: الكسران غير متساويين.`,
      },
    ],
    { tex: `\\dfrac{${p * k}}{${q * k}}`, show: frac },
  );
};

/** From the easiest to the unit's last lesson. `gates`: the right gates that open the next level. */
export const LEVELS = [
  { name: 'زوجي أم فردي', from: '1 متوسط', make: [parity, multipleOf([2, 5, 10], 60)] },
  { name: 'جداول الضرب', from: '1 متوسط', make: [product, multipleOf([3, 4, 6], 60)] },
  { name: 'المضاعفات', from: '1 متوسط', make: [multipleOf([7, 8, 9, 11, 12], 120)] },
  { name: 'قواسم عدد', from: 'الدرسان 1 و 2', make: [divisorOf] },
  { name: 'قاسم مشترك', from: 'الدرس 4', make: [commonDivisor] },
  { name: 'القاسم المشترك الأكبر', from: 'الدروس 4 إلى 6', make: [greatest] },
  { name: 'أوّليان فيما بينهما', from: 'الدرس 7', make: [coprimeWith] },
  { name: 'كسر غير قابل للاختزال', from: 'الدرس 8', make: [irreducible, greatest, coprimeWith] },
];

export const endless = {
  title: 'سباق الأعداد',
  say: 'الروبوت يجري. اللافتة تطلب عددًا، وثلاثة أبواب تقترب: وجّه الروبوت نحو الباب الصحيح بالسهمين ← و →.',
  levels: LEVELS.map(({ name, from }) => ({ name, from })),
  /** Right gates needed to leave a level. */
  gates: 5,
  /** A round of level `level` (1-based; past the last one, the last one). */
  round(level, rand = Math.random) {
    const L = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];
    return pick(rand, L.make)(rand);
  },
};
