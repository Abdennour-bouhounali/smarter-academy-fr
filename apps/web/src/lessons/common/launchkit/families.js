/**
 * « L’échauffement » — the question FAMILIES, one per earlier savoir-faire (programme item of the learning net), PURE.
 *
 * A family GENERATES its questions (a retake never shows the same numbers) on two levels — 1 very easy, 2 harder — and in
 * several FORMS, each answered by one of the three gestures of the game:
 *   write  the student writes the value in its own shape (« 47 = 6 × ▢ + ▢ »);
 *   sort   three cards, each sent to one of two boxes;
 *   place  a flag dragged on a number line.
 * A question is plain data; `grade(question, answer)` says right or not and, when it is not, NAMES the mistake when the
 * answer shows one (`MISTAKES`): a wrong answer is information, not just « false ». The quick workshop opens on that mistake.
 * A family also carries its repair (`example`: a worked example in steps) and its revision card (`memo`).
 *
 * Adding a family = one entry in FAMILIES keyed by the item id of the net, with tests in launchkit.test.js (every generated
 * question is re-computed there). A question that carries its operation (`calc`: { op, x, y, z }) is graded by
 * re-computing its value — never a stored answer.
 */
/** The named mistakes: what the workshop says first when an answer showed one. Never shown during a station. */
export const MISTAKES = {
  'rest-too-big': 'Attention : le reste est toujours plus petit que le diviseur.',
  'rest-negative': 'Attention : dans la division euclidienne, on ajoute le reste, on ne le soustrait pas.',
  'equality-false': 'Attention : vérifie l’égalité — calcule le produit, puis ajoute le reste.',
  swapped: 'Attention : ne confonds pas le quotient et le reste.',
  overshoot: 'Attention : le multiple cherché ne dépasse pas le nombre.',
  'not-greatest': 'Attention : on cherche le plus grand multiple qui ne dépasse pas le nombre.',
  'not-multiple': 'Attention : le drapeau s’arrête sur un multiple — un nombre de sa table de multiplication.',
  'digit-anywhere': 'Attention : la règle ne regarde que le dernier chiffre.',
  'last-digit': 'Attention : pour 3 et 9, on additionne les chiffres, on ne regarde pas le dernier chiffre.',
  'three-for-nine': 'Attention : la somme des chiffres doit être dans la table de 9, pas seulement dans celle de 3.',
  'even-for-four':
    'Attention : un nombre pair n’est pas toujours divisible par 4 — regarde le nombre formé par ses deux derniers chiffres.',
  'product-false': 'Attention : vérifie l’égalité — calcule le produit.',
  'rest-not-zero':
    'Attention : un nombre est un diviseur quand le reste de la division est 0 — vérifie par la division.',
  'multiple-for-divisor':
    'Attention : ne confonds pas diviseur et multiple — un diviseur d’un nombre ne le dépasse pas.',
  'sentence-reversed':
    'Attention : l’ordre des deux nombres compte — on dit « 6 est un diviseur de 42 » et « 42 est un multiple de 6 ».',
  'one-and-itself': 'Attention : 1 et le nombre lui-même sont toujours des diviseurs.',
  'partner-forgot':
    'Attention : chaque division exacte donne deux diviseurs à la fois — le nombre essayé et son partenaire.',
  'stop-early': 'Attention : essaie chaque nombre dont le carré ne dépasse pas le nombre, ne t’arrête pas avant.',
  'quotient-zero':
    'Attention : si le nombre est plus petit que le diviseur, le quotient est 0 et le reste est le nombre lui-même.',
  'table-slip': 'Attention : revois la table de multiplication — ta réponse est le produit d’un nombre voisin.',
  'borrow-forgot':
    'Attention : si le chiffre des unités est plus petit, on emprunte une dizaine — on ne soustrait pas le petit chiffre du grand.',
  'order-ops': 'Attention : on calcule d’abord le produit, puis on ajoute.',
  'add-for-sub': 'Attention : une soustraction fait diminuer le nombre — le drapeau recule vers 0.',
  'common-not-greatest':
    'Attention : on cherche le plus grand des diviseurs communs, pas n’importe quel diviseur commun.',
  'divisor-of-one': 'Attention : un diviseur commun divise les deux nombres — vérifie en divisant chacun des deux.',
  'smaller-not-divisor':
    'Attention : le plus petit nombre n’est pas un diviseur commun s’il laisse un reste quand on divise le plus grand par lui.',
  'subtract-not-divide':
    'Attention : on divise le numérateur et le dénominateur par le même nombre — on ne leur soustrait pas un même nombre.',
  'one-term-only': 'Attention : on divise le numérateur ET le dénominateur par le même nombre, pas un seul des deux.',
  'power-times':
    'Attention : l’exposant dit combien de fois on multiplie le nombre par lui-même — on ne multiplie pas le nombre par l’exposant.',
  'square-sign':
    'Attention : le produit de deux nombres négatifs est positif, donc le carré d’un nombre négatif est positif.',
  'odd-sign': 'Attention : le produit de trois nombres négatifs est négatif — un exposant impair garde le signe.',
  'decimal-places':
    'Attention : dans le produit de deux nombres décimaux, le nombre de chiffres après la virgule est la somme de ceux des deux facteurs.',
  'fraction-one-term':
    'Attention : pour élever une fraction au carré, on élève au carré le numérateur ET le dénominateur.',
  'one-not-prime':
    'Attention : 1 n’est pas un nombre premier — un nombre premier a exactement deux diviseurs, 1 et lui-même.',
  'odd-not-prime':
    'Attention : un nombre impair n’est pas forcément premier — cherche un diviseur autre que 1 et lui-même.',
  'two-is-prime': 'Attention : 2 est un nombre premier — ses seuls diviseurs sont 1 et 2.',
  'not-all-prime': 'Attention : chaque nombre du produit doit être premier — un 6 s’écrit encore 2 × 3.',
  'add-not-times':
    'Attention : les longueurs sont proportionnelles — on les multiplie par un même nombre, on ne leur ajoute pas une même différence.',
  'ratio-flipped':
    'Attention : écris les deux fractions dans le même ordre, puis fais le produit en croix — n’en retourne pas une.',
};

const gcdOf = (x, y) => (y === 0 ? x : gcdOf(y, x % y));

const CALC = {
  times: (c) => c.x * c.y,
  minus: (c) => c.x - c.y,
  timesPlus: (c) => c.x * c.y + c.z,
  pgcd: (c) => gcdOf(c.x, c.y), // PGCD(x ; y) = ▢
  // n/d = m/▢ (side 'bottom') or n/d = ▢/m (side 'top') — the term that keeps the value
  frac: (c) => (c.side === 'bottom' ? (c.d * c.m) / c.n : (c.n * c.m) / c.d),
  // xᵉ = ▢ for a whole base (a fraction base is judged by `gradePower`, term by term)
  pow: (c) => c.x ** c.e,
  // n = (the known primes) × ▢ — the missing number of a product (`4e.m1.r06`)
  factor: (c) => c.n / c.known.reduce((p, x) => p * x, 1),
  // a/b = c/▢ — the fourth proportional, the term v with a × v = b × c (`4e.m4.r04`)
  fourth: (c) => (c.b * c.c) / c.a,
};

const calcValue = (c) => CALC[c.op](c);

/** The difference written digit by digit, the small digit taken from the big one (the borrow forgotten). */
const borrowless = (x, y) => {
  const [a, b] = [String(x), String(y).padStart(String(x).length, '0')];
  return Number([...a].map((d, i) => Math.abs(Number(d) - Number(b[i]))).join(''));
};

/** Right or not for a question that carries its operation (`calc`): the value is re-computed, the slip named. */
function gradeCalc(q, answer) {
  if (q.gesture === 'place') {
    const x = Number(answer?.x);
    if (x === q.target) return { correct: true, mistake: null };
    return { correct: false, mistake: x === q.calc.x + q.calc.y ? 'add-for-sub' : null };
  }
  const c = q.calc;
  if (c.op === 'pow') return gradePower(c, answer);
  const v = num(answer?.v);
  if (v === calcValue(c)) return { correct: true, mistake: null };
  if (!Number.isFinite(v)) return { correct: false, mistake: null };
  if (c.op === 'pgcd') return { correct: false, mistake: pgcdSlip(c.x, c.y, v) };
  if (c.op === 'frac') return { correct: false, mistake: fracSlip(c, v) };
  if (c.op === 'factor') return { correct: false, mistake: 'product-false' };
  if (c.op === 'fourth') return { correct: false, mistake: fourthSlip(c, v) };
  const p = c.x * c.y;
  const slip = (w) => [c.x * (c.y - 1), c.x * (c.y + 1), (c.x - 1) * c.y, (c.x + 1) * c.y].includes(w) && w !== p;
  if (c.op === 'times') return { correct: false, mistake: slip(v) ? 'table-slip' : null };
  if (c.op === 'timesPlus')
    return { correct: false, mistake: v === c.x * (c.y + c.z) ? 'order-ops' : slip(v - c.z) ? 'table-slip' : null };
  return {
    correct: false,
    mistake: v === borrowless(c.x, c.y) ? 'borrow-forgot' : v === c.x + c.y ? 'add-for-sub' : null,
  };
}

/** The slip an answer v to « PGCD(x ; y) = ▢ » shows (v is not the PGCD). */
function pgcdSlip(x, y, v) {
  if (!(v > 0)) return null;
  const [lo, hi] = [Math.min(x, y), Math.max(x, y)];
  if (v === lo && hi % lo !== 0) return 'smaller-not-divisor';
  if (x % v === 0 && y % v === 0) return 'common-not-greatest';
  if (x % v === 0 || y % v === 0) return 'divisor-of-one';
  return null;
}

/** The slip an answer v to « n/d = m/▢ » (or « ▢/m ») shows: the same number subtracted, or one term left as it was. */
function fracSlip(c, v) {
  const [given, other] = c.side === 'bottom' ? [c.d, c.n] : [c.n, c.d];
  if (v === given - (other - c.m)) return 'subtract-not-divide';
  if (v === given) return 'one-term-only';
  return null;
}

const ratEq = (a, b) => a.n * b.d === b.n * a.d;

const ratPow = (r, e) => ({ n: r.n ** e, d: r.d ** e });

/** Right or not for « xᵉ = ▢ » or « (p/q)² = ▢/▢ »: re-computed exactly; an equal fraction is accepted; the slip named. */
function gradePower(c, answer) {
  if (c.n != null) {
    const [N, D] = [num(answer?.n), num(answer?.d)];
    const want = ratPow({ n: c.n, d: c.d }, c.e);
    if (Number.isFinite(N) && D > 0 && ratEq({ n: N, d: D }, want)) return { correct: true, mistake: null };
    if (N === want.n && D === c.d) return { correct: false, mistake: 'fraction-one-term' };
    if (N === c.n * c.e && D === c.d * c.e) return { correct: false, mistake: 'power-times' };
    return { correct: false, mistake: null };
  }
  const v = num(answer?.v);
  if (v === calcValue(c)) return { correct: true, mistake: null };
  return { correct: false, mistake: v === Math.abs(c.x) * c.e ? 'power-times' : null };
}

// ───────────────────────── 4e.m1.r06 — décomposer un petit nombre (4e) ─────────────────────────
// What a 3e student brings from 4e to « décomposer en facteurs premiers » (the net gives this lesson ONE tool, this item):
// recognising a prime under 30, the divisibility by 2, 3 and 5, a small product of primes (12, 18, 30…), the value of
// 2³. It MEASURES them; it never teaches the 3e procedure (which number to try first, how often, when to stop): a worked
// example splits from the LARGEST prime, never the smallest; it never writes a product with exponents; no word of the
// lesson's keys (« puissance », « s’arrêter », « tableur », « plus petit nombre premier »).

const int = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const shuffle = (rand, list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const S = (slot, label, w) => ({ slot, label, w });
/** A small exponent written in a plain title: « 2³ ». */
const SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵' };
const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
};
/** The prime factors of n, increasing, each as often as it divides (12 → [2, 2, 3]). */
const primesOf = (n) => {
  const out = [];
  let m = n;
  for (let d = 2; m > 1; d += 1)
    while (m % d === 0) {
      out.push(d);
      m /= d;
    }
  return out;
};
const productOf = (xs) => xs.reduce((p, x) => p * x, 1);
const timesTex = (xs) => xs.join(' \\times ');
/** « 2, 3 et 5 » (a list said in French). */
const andList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} et ${xs.at(-1)}`);

/** The small numbers of the family: three primes (level 1), four primes (level 2). None is a number of the lesson. */
const DECOMP = { first: [12], 1: [12, 18, 20, 28, 30, 42, 45, 50], 2: [84, 88, 90, 100, 132, 150, 154, 198] };
const PRIMES_30 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
const ODD_COMPOSITES = [9, 15, 21, 25, 27];
const EVEN_COMPOSITES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
/** « 2³ = ▢ »: never a power where the slip (2 × 3) and the value agree — 2² = 2 × 2 is left out (defects.md C17). */
const POWERS = [
  [2, 3],
  [3, 2],
  [2, 4],
  [5, 2],
  [3, 3],
  [2, 5],
];

/** « 30 = 2 × ▢ × 5 »: one prime of the product to write, the others given in increasing order. */
function decompWrite(rand, level, first) {
  const n = pick(rand, first ? DECOMP.first : DECOMP[level]);
  const factors = primesOf(n);
  const at = first ? factors.length - 1 : int(rand, 0, factors.length - 1);
  const known = factors.filter((_, i) => i !== at);
  const tokens = [String(n), '='];
  factors.forEach((f, i) => {
    if (i > 0) tokens.push('×');
    tokens.push(i === at ? S('v', 'nombre premier', 2) : String(f));
  });
  return {
    gesture: 'write',
    calc: { op: 'factor', n, known },
    prompt: 'Complète ce produit de nombres premiers :',
    tokens,
  };
}

/** Three numbers under 30, each to send to « premier » or « pas premier »: 1 and an odd number that is not prime are the traps. */
function primesSort(rand) {
  const shape = pick(rand, [
    ['prime', 'odd', 'even'],
    ['prime', 'one', 'odd'],
    ['prime', 'prime', 'odd'],
    ['two', 'odd', 'one'],
    ['prime', 'odd', 'odd'],
  ]);
  const used = new Set();
  const draw = (kind) => {
    const from = { prime: PRIMES_30.slice(1), two: [2], one: [1], odd: ODD_COMPOSITES, even: EVEN_COMPOSITES }[kind];
    let n = pick(rand, from);
    for (let i = 0; i < 30 && used.has(n); i += 1) n = pick(rand, from);
    used.add(n);
    return n;
  };
  const cards = shuffle(rand, shape).map((kind, i) => {
    const n = draw(kind);
    const trap = n === 1 ? 'one-not-prime' : n % 2 === 1 && !isPrime(n) ? 'odd-not-prime' : null;
    return {
      id: `c${i + 1}`,
      text: String(n),
      n,
      bin: isPrime(n) ? 'yes' : 'no',
      trap,
      miss: n === 2 ? 'two-is-prime' : null,
    };
  });
  return {
    gesture: 'sort',
    prompt: 'Ce nombre est-il premier ? Envoie chaque carte dans sa boîte.',
    bins: [
      { id: 'yes', label: 'Premier' },
      { id: 'no', label: 'Pas premier' },
    ],
    cards,
  };
}

/** « 2³ = ▢ » — the value of a small power, typed. */
function powerWrite(rand, level, first) {
  const [x, e] = first ? POWERS[1] : pick(rand, level === 1 ? POWERS.slice(0, 4) : POWERS);
  return {
    gesture: 'write',
    calc: { op: 'pow', x, e },
    prompt: 'Calcule :',
    tokens: [{ pow: [String(x), String(e)] }, '=', S('v', 'valeur', String(x ** e).length)],
  };
}

/**
 * Three equalities « n = a × b × … »: one writes n as a product of primes; a trap keeps a number that is not prime
 * (« 12 = 2 × 6 », `not-all-prime`), another is a product that is not n (« 30 = 2 × 3 × 7 », `product-false`).
 */
function decompCard(rand, kind, id, avoid) {
  let n = pick(rand, [...DECOMP[1], ...DECOMP[2]]);
  for (let i = 0; i < 40 && avoid.has(n); i += 1) n = pick(rand, [...DECOMP[1], ...DECOMP[2]]);
  avoid.add(n);
  const f = primesOf(n);
  let factors = f;
  let trap = null;
  if (kind === 'composite') {
    // two primes of the product merged into one number that is not prime: the product is still n
    const i = int(rand, 0, f.length - 2);
    factors = [...f.slice(0, i), f[i] * f[i + 1], ...f.slice(i + 2)];
    trap = 'not-all-prime';
  } else if (kind === 'wrong') {
    // one prime replaced by the next prime: the product is no longer n
    const i = int(rand, 0, f.length - 1);
    const next = PRIMES_30.find((p) => p > f[i]);
    factors = [...f.slice(0, i), next, ...f.slice(i + 1)].sort((a, b) => a - b);
    trap = 'product-false';
  }
  const ok = productOf(factors) === n && factors.every(isPrime);
  return { id, text: `$${n} = ${timesTex(factors)}$`, n, factors, bin: ok ? 'yes' : 'no', trap: ok ? null : trap };
}
function decompSort(rand) {
  const shape = pick(rand, [
    ['right', 'composite', 'wrong'],
    ['right', 'right', 'composite'],
    ['right', 'composite', 'composite'],
    ['right', 'wrong', 'right'],
  ]);
  const avoid = new Set();
  return {
    gesture: 'sort',
    prompt: 'Chaque égalité écrit-elle le nombre comme un produit de nombres premiers ?',
    bins: [
      { id: 'yes', label: 'Oui' },
      { id: 'no', label: 'Non' },
    ],
    cards: shuffle(rand, shape).map((kind, i) => decompCard(rand, kind, `c${i + 1}`, avoid)),
  };
}

/** The divisibility by 2, 3 or 5 read on the digits: the traps are a digit read in the wrong place, or the last digit for 3. */
const RULE_TRAPS = {
  2: (n) => (n % 2 !== 0 && /[02468]/.test(String(n).slice(0, -1)) ? 'digit-anywhere' : null),
  5: (n) => (n % 5 !== 0 && /[05]/.test(String(n).slice(0, -1)) ? 'digit-anywhere' : null),
  3: (n) => (n % 3 !== 0 && [3, 6, 9].includes(n % 10) ? 'last-digit' : null),
};
/** What a « yes » number must look like so that the WRONG rule would refuse it (a rule is tested on both sides). */
const HARD_YES = { 2: () => true, 5: () => true, 3: (n) => ![3, 6, 9].includes(n % 10) };
function divisibleSort(rand) {
  const k = pick(rand, [2, 3, 5]);
  const find = (test) => {
    for (let i = 0; i < 400; i += 1) {
      const n = int(rand, 100, 999);
      if (test(n)) return n;
    }
    return null;
  };
  const yes = () => find((n) => n % k === 0 && HARD_YES[k](n)) ?? k * int(rand, 34, 99);
  const trap = () => find((n) => RULE_TRAPS[k](n) !== null);
  const no = () => find((n) => n % k !== 0 && RULE_TRAPS[k](n) === null) ?? k * int(rand, 34, 99) + 1;
  const shape = pick(rand, [
    ['yes', 'trap', 'no'],
    ['yes', 'trap', 'yes'],
    ['yes', 'trap', 'trap'],
  ]);
  const used = new Set();
  const cards = [];
  for (const kind of shuffle(rand, shape)) {
    let n = null;
    for (let i = 0; i < 30 && (n === null || used.has(n)); i += 1)
      n = kind === 'yes' ? yes() : kind === 'trap' ? (trap() ?? no()) : no();
    used.add(n);
    cards.push({
      id: `c${cards.length + 1}`,
      text: String(n),
      n,
      bin: n % k === 0 ? 'yes' : 'no',
      trap: RULE_TRAPS[k](n),
    });
  }
  return {
    gesture: 'sort',
    k,
    prompt: `Chaque nombre est-il divisible par ${k} ? Envoie-le dans sa boîte.`,
    bins: [
      { id: 'yes', label: `Divisible par ${k}` },
      { id: 'no', label: `Pas divisible par ${k}` },
    ],
    cards,
  };
}

/** The worked example: it answers the mistake shown — a prime, a value of 2³, a rule of divisibility, or a small product. */
function decompExample(rand, level, { k, mistake = null } = {}) {
  if (['one-not-prime', 'odd-not-prime', 'two-is-prime'].includes(mistake)) {
    const c = pick(rand, ODD_COMPOSITES);
    const p = primesOf(c)[0];
    return {
      title: `Le nombre ${c} est-il premier ?`,
      steps: [
        'Un nombre premier a exactement deux diviseurs : 1 et lui-même.',
        `$${c} = ${p} \\times ${c / p}$ : ${p} divise ${c}, et ${p} n’est ni 1 ni ${c}.`,
        `Donc ${c} n’est pas premier, même s’il est impair.`,
        '1 n’a qu’un seul diviseur : il n’est pas premier. 2 a deux diviseurs, 1 et 2 : il est premier.',
      ],
    };
  }
  if (mistake === 'power-times') {
    const [x, e] = pick(rand, POWERS.slice(0, 4));
    const parts = Array(e).fill(x);
    return {
      title: `Combien vaut ${x}${SUP[e]} ?`,
      steps: [
        `$${x}^${e} = ${timesTex(parts)}$ : ${e} fois le nombre ${x}, multipliés entre eux.`,
        `$${timesTex(parts)} = ${x ** e}$.`,
        `Donc $${x}^${e} = ${x ** e}$, et non $${x} \\times ${e} = ${x * e}$.`,
      ],
    };
  }
  if (mistake === 'digit-anywhere' || mistake === 'last-digit' || (k && [2, 3, 5].includes(k))) {
    const d = k ?? (mistake === 'last-digit' ? 3 : pick(rand, [2, 5]));
    let n = int(rand, 100, 999);
    for (let i = 0; i < 400 && RULE_TRAPS[d](n) === null; i += 1) n = int(rand, 100, 999);
    const ok = n % d === 0;
    const verdict = `Donc ${n} ${ok ? 'est' : 'n’est pas'} divisible par ${d}.`;
    if (d === 3) {
      const digits = String(n).split('').map(Number);
      const s = digits.reduce((a, b) => a + b, 0);
      return {
        title: `${n} est-il divisible par 3 ?`,
        steps: [
          `On additionne les chiffres : $${digits.join(' + ')} = ${s}$.`,
          `${s} ${s % 3 === 0 ? 'est' : 'n’est pas'} un multiple de 3 — le dernier chiffre seul ne dit rien.`,
          verdict,
        ],
      };
    }
    return {
      title: `${n} est-il divisible par ${d} ?`,
      steps: [
        `On regarde le chiffre des unités, et lui seul : c’est ${n % 10}.`,
        d === 2
          ? 'Divisible par 2 : le chiffre des unités est 0, 2, 4, 6 ou 8.'
          : 'Divisible par 5 : le chiffre des unités est 0 ou 5.',
        verdict,
      ],
    };
  }
  // a small product, split from its LARGEST prime (never the order of the 3e procedure)
  const n = pick(rand, DECOMP[level === 2 ? 2 : 1]);
  const f = primesOf(n);
  const p = f.at(-1);
  const m = n / p;
  return {
    title: `Écrire ${n} comme un produit de nombres premiers`,
    steps: [
      `$${n} = ${m} \\times ${p}$, et ${p} est premier.`,
      `${m} n’est pas premier : $${m} = ${timesTex(primesOf(m))}$.`,
      `Donc $${n} = ${timesTex(f)}$ : ${andList([...new Set(f)])} sont premiers.`,
    ],
  };
}

const DECOMPOSITION = {
  item: '4e.m1.r06',
  // the name of the gesture, never the title of a lesson (the lesson is read from the net: it has none in 4e yet)
  name: 'Nombres premiers et produits',
  icon: '🧩',
  // NO instrument: the lab opened before this 3e lesson (`earlierOnly`) holds the instruments of EARLIER lessons, and no
  // French lesson before it has one yet — the capsule skips its lab step (launchkit.test.js)
  labTool: null,
  mistakes: [
    'one-not-prime',
    'odd-not-prime',
    'not-all-prime',
    'product-false',
    'power-times',
    'digit-anywhere',
    'last-digit',
  ],
  forms: { 1: ['write', 'primes', 'power'], 2: ['sort', 'divisible', 'write'] },
  make: (rand, level, form, { first = false } = {}) =>
    form === 'primes'
      ? primesSort(rand)
      : form === 'power'
        ? powerWrite(rand, level, first)
        : form === 'sort'
          ? decompSort(rand)
          : form === 'divisible'
            ? divisibleSort(rand)
            : decompWrite(rand, level, first),
  example: decompExample,
  // the rules a teacher revises with his class before the lesson, one per screen (CLASS_SESSION.md §5bis)
  rules: [
    {
      id: 'prime',
      title: 'Un nombre premier',
      text: 'Un nombre premier a exactement deux diviseurs : 1 et lui-même. 1 n’est pas premier ; 2 est le seul nombre premier pair.',
      example: `Les nombres premiers inférieurs à 30 : ${andList(PRIMES_30)}.`,
      check: { below: 30, primes: PRIMES_30 },
    },
    {
      id: 'divisible',
      title: 'Divisible par 2, par 3, par 5',
      text: 'Par 2 : le chiffre des unités est 0, 2, 4, 6 ou 8. Par 5 : il est 0 ou 5. Par 3 : la somme des chiffres est un multiple de 3.',
      example: '$1 + 3 + 5 = 9$ : 135 est divisible par 3 et par 5, mais pas par 2.',
      check: { n: 135, yes: [3, 5], no: [2], sum: 9 },
    },
    {
      id: 'product',
      title: 'Un produit de nombres premiers',
      text: 'Dans un produit de nombres premiers, chaque nombre du produit est premier : un 6 s’écrit encore $2 \\times 3$.',
      example: '$30 = 5 \\times 6 = 2 \\times 3 \\times 5$.',
      check: { n: 30, factors: [2, 3, 5] },
    },
    {
      id: 'value',
      title: 'Ce que vaut 2³',
      text: '$2^3$ est le produit de trois nombres égaux à 2 : $2^3 = 2 \\times 2 \\times 2$.',
      example: '$2^3 = 8$ et $3^2 = 9$ ; $2^3$ ne vaut pas $2 \\times 3 = 6$.',
      check: { x: 2, e: 3, v: 8 },
    },
  ],
  memo: [
    'Un nombre premier a exactement deux diviseurs, 1 et lui-même : 2, 3, 5, 7, 11, 13… (1 n’est pas premier).',
    'Par 2 : unités 0, 2, 4, 6 ou 8. Par 5 : unités 0 ou 5. Par 3 : somme des chiffres multiple de 3.',
    'Un produit de nombres premiers : $30 = 2 \\times 3 \\times 5$, et non $5 \\times 6$ (6 n’est pas premier).',
    '$2^3 = 2 \\times 2 \\times 2 = 8$, et non $2 \\times 3 = 6$.',
  ],
};

// ───────────────────────── 3e.m1.r05 — décomposer un nombre entier (3e, lesson 1) ─────────────────────────
// What « Trouver le PGCD » stands on from the first 3e lesson: writing a whole number (up to a few hundred) as a product
// of primes, and checking that a written product IS one. It MEASURES that; it never writes two numbers side by side, a
// factor « in both », an exponent compared with another, a remainder chained to a division — no word of the PGCD
// lesson's keys (« commun », « PGCD », « exposant », « lots », « Euclide »: tested). Its products are written factor after
// factor, as the cards of `4e.m1.r06` (the launch reads them so); the lesson itself writes the powers.

/** Numbers of the 3e decomposition: four or five primes, none a number of the PGCD lesson (its road, forges, dash). */
const BIG = {
  first: [24],
  1: [24, 40, 63, 66, 98, 99, 70],
  2: [132, 154, 165, 168, 220, 231, 252, 264, 300],
};

/** « 252 = 2 × 2 × 3 × 3 × ▢ »: the largest prime of the product to write (the first question: the last factor of 24). */
function bigWrite(rand, level, first) {
  const n = pick(rand, first ? BIG.first : BIG[level]);
  const factors = primesOf(n);
  const at = first || level === 1 ? factors.length - 1 : int(rand, 0, factors.length - 1);
  const known = factors.filter((_, i) => i !== at);
  const tokens = [String(n), '='];
  factors.forEach((f, i) => {
    if (i > 0) tokens.push('×');
    tokens.push(i === at ? S('v', 'nombre premier', 2) : String(f));
  });
  return {
    gesture: 'write',
    calc: { op: 'factor', n, known },
    prompt: 'Complète ce produit de nombres premiers :',
    tokens,
  };
}

/** Three equalities « n = a × b × … » of the 3e numbers: a product of primes, or a trap (`decompCard`'s kinds). */
function bigCard(rand, kind, id, avoid, level) {
  const from = BIG[level];
  let n = pick(rand, from);
  for (let i = 0; i < 40 && avoid.has(n); i += 1) n = pick(rand, from);
  avoid.add(n);
  const f = primesOf(n);
  let factors = f;
  let trap = null;
  if (kind === 'composite') {
    const i = int(rand, 0, f.length - 2);
    factors = [...f.slice(0, i), f[i] * f[i + 1], ...f.slice(i + 2)];
    trap = 'not-all-prime';
  } else if (kind === 'wrong') {
    const i = int(rand, 0, f.length - 1);
    const next = PRIMES_30.find((p) => p > f[i]);
    factors = [...f.slice(0, i), next, ...f.slice(i + 1)].sort((a, b) => a - b);
    trap = 'product-false';
  }
  const ok = productOf(factors) === n && factors.every(isPrime);
  return { id, text: `$${n} = ${timesTex(factors)}$`, n, factors, bin: ok ? 'yes' : 'no', trap: ok ? null : trap };
}
function bigSort(rand, level) {
  const shape = pick(rand, [
    ['right', 'composite', 'wrong'],
    ['right', 'right', 'composite'],
    ['right', 'wrong', 'wrong'],
    ['composite', 'right', 'wrong'],
  ]);
  const avoid = new Set();
  return {
    gesture: 'sort',
    prompt: 'Chaque égalité écrit-elle le nombre comme un produit de nombres premiers ?',
    bins: [
      { id: 'yes', label: 'Oui' },
      { id: 'no', label: 'Non' },
    ],
    cards: shuffle(rand, shape).map((kind, i) => bigCard(rand, kind, `c${i + 1}`, avoid, level)),
  };
}

/** The worked example: a number written as a product of primes, ONE prime at a time, checked at the end. */
function bigExample(rand, level, { mistake = null } = {}) {
  const n = pick(rand, BIG[level === 2 ? 2 : 1]);
  const f = primesOf(n);
  const steps = [];
  let m = n;
  for (const p of f.slice(0, -1)) {
    steps.push(`$${m} = ${p} \\times ${m / p}$, et ${p} est premier.`);
    m /= p;
  }
  const head =
    mistake === 'not-all-prime'
      ? 'Chaque nombre du produit doit être premier : on continue tant qu’un nombre se divise encore.'
      : 'On vérifie à la fin : le produit redonne le nombre, et chaque nombre du produit est premier.';
  return {
    title: `Écrire ${n} comme un produit de nombres premiers`,
    steps: [head, ...steps.slice(0, 3), `Donc $${n} = ${timesTex(f)}$.`],
  };
}

const BIG_DECOMPOSITION = {
  item: '3e.m1.r05',
  // the name of the gesture, never the title of its home lesson (that title is read from the net)
  name: 'Produits de nombres premiers',
  icon: '🪜',
  // the instrument of its home lesson (« L’échelle des facteurs »), in the lab opened BEFORE « Trouver le PGCD »
  labTool: 'factor',
  mistakes: ['not-all-prime', 'product-false', 'one-not-prime'],
  forms: { 1: ['write', 'sort'], 2: ['sort', 'write'] },
  make: (rand, level, form, { first = false } = {}) =>
    form === 'sort' ? bigSort(rand, level) : bigWrite(rand, level, first),
  example: bigExample,
  rules: [
    {
      id: 'product',
      title: 'Un produit de nombres premiers',
      text: 'Écrire un nombre comme un produit de nombres premiers : chaque nombre du produit est premier, et le produit redonne le nombre.',
      example: '$154 = 2 \\times 7 \\times 11$ : 2, 7 et 11 sont premiers.',
      check: { n: 154, factors: [2, 7, 11] },
    },
    {
      id: 'again',
      title: 'Un nombre qui se divise encore',
      text: 'Tant qu’un nombre du produit n’est pas premier, il s’écrit encore comme un produit.',
      example: '$60 = 6 \\times 10 = 2 \\times 3 \\times 2 \\times 5$.',
      check: { n: 60, factors: [2, 3, 2, 5] },
    },
  ],
  memo: [
    'Chaque nombre du produit est premier : 2, 3, 5, 7, 11, 13…',
    'Le produit redonne le nombre : on le vérifie en multipliant.',
    'Un 6 ou un 10 dans le produit s’écrit encore : $6 = 2 \\times 3$, $10 = 2 \\times 5$.',
    'Exemple : $252 = 2 \\times 2 \\times 3 \\times 3 \\times 7$.',
  ],
};

// ───────────────────────── 4e.m1.r08 — divisibilité (4e) : les diviseurs d’un nombre ─────────────────────────
// What the PGCD lesson stands on from 4e (ported from the Algerian family `4am.m1.r02`, the listing of divisors, which the
// Algerian PGCD lessons used): the WHOLE list of a number's divisors, found by pairs (« a = d × k » gives d and its
// partner k), trying d while d × d does not pass a. Its mistakes are those of an incomplete list: a partner forgotten,
// the search stopped too early, 1 or the number itself left out, a number that leaves a remainder let in. It writes ONE
// number at a time: never two lists side by side, never « commun », « PGCD », « le plus grand » (tested).

const divisorList = (n) => {
  const out = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
};
/**
 * The numbers whose list stands on a card: six to eight divisors, never a square (every divisor has a partner of its
 * own), none a number of the PGCD lesson's road, forges or dash (18, 22, 28, 30, 33, 35, 42, 45, 54, 56, 75, 88, 90…),
 * nor of the first 3e lesson's (60, 72, 36, 48), and none whose list holds one of them.
 */
const LISTS_FROM = {
  1: [12, 20, 32, 50, 52, 68],
  2: [40, 63, 76, 78, 92, 98],
};
/** Products a × b of the « write » form that never land on a number of the PGCD lesson. */
const LIST_AVOID = new Set([18, 21, 22, 27, 28, 30, 33, 35, 42, 45, 54, 56, 57, 60, 72, 75, 88, 90]);
/** The divisors d of n with d × d ≤ n: the numbers tried, one per pair. */
const tried = (n) => divisorList(n).filter((d) => d * d <= n);

/** « a = b × ▢ »: b is a divisor of a, the student writes its PARTNER — the other half of the pair. */
function listWrite(rand, level, first) {
  let b;
  let q;
  for (let i = 0; i < 60; i += 1) {
    [b, q] =
      level === 1
        ? first
          ? [int(rand, 2, 4), int(rand, 5, 7)]
          : [int(rand, 2, 6), int(rand, 6, 9)]
        : [int(rand, 11, 19), int(rand, 3, 9)];
    if (!LIST_AVOID.has(b * q)) break;
  }
  const a = b * q;
  return {
    gesture: 'write',
    a,
    b,
    prompt:
      level === 1
        ? `On écrit les diviseurs de ${a} par paires. Complète la paire qui commence par ${b}.`
        : `${b} est un diviseur de ${a}. Complète l’égalité : son partenaire est un diviseur aussi.`,
    tokens: [String(a), '=', String(b), '×', S('q', 'partenaire', String(q).length)],
  };
}

/** One card: the list of n — whole, or with the slip `kind` makes (its trap). */
function listCard(rand, kind, n, id) {
  const all = divisorList(n);
  const pairs = tried(n).filter((d) => d > 1);
  let list = all;
  let trap = null;
  if (kind === 'partner') {
    const d = pick(rand, pairs);
    list = all.filter((x) => x !== n / d);
    trap = 'partner-forgot';
  } else if (kind === 'edge') {
    const gone = pick(rand, [1, n]);
    list = all.filter((x) => x !== gone);
    trap = 'one-and-itself';
  } else if (kind === 'early') {
    // stopped one number too early: the last pair tried is missing, both halves
    const d = pairs.at(-1);
    list = all.filter((x) => x !== d && x !== n / d);
    trap = 'stop-early';
  } else if (kind === 'intruder') {
    const outs = [];
    for (let k = 2; k < n / 2; k += 1) if (n % k !== 0) outs.push(k);
    list = [...all, pick(rand, outs)].sort((x, y) => x - y);
    trap = 'rest-not-zero';
  }
  return {
    id,
    text: `Diviseurs de ${n} : ${andList(list)}`,
    say: true,
    n,
    list,
    bin: kind === 'full' ? 'yes' : 'no',
    trap,
  };
}

/** Three lists, each of its own number: whole, or with a partner missing, 1 or the number left out, an intruder, the search stopped early. */
function listSort(rand, level) {
  const kinds = shuffle(
    rand,
    pick(
      rand,
      level === 1
        ? [
            ['full', 'partner', 'edge'],
            ['full', 'partner', 'intruder'],
            ['full', 'full', 'partner'],
            ['partner', 'edge', 'full'],
          ]
        : [
            ['full', 'early', 'partner'],
            ['early', 'edge', 'full'],
            ['full', 'early', 'intruder'],
            ['early', 'partner', 'full'],
          ],
    ),
  );
  const ns = shuffle(rand, LISTS_FROM[level]).slice(0, 3);
  return {
    gesture: 'sort',
    prompt: 'Chaque liste donne-t-elle TOUS les diviseurs du nombre, sans oubli ni intrus ? Envoie-la dans sa boîte.',
    bins: [
      { id: 'yes', label: 'Liste complète' },
      { id: 'no', label: 'Un oubli ou un intrus' },
    ],
    cards: kinds.map((k, i) => listCard(rand, k, ns[i], `c${i + 1}`)),
  };
}

/**
 * The worked example: the divisors of a number found by pairs. Its first step answers the mistake shown — 1 and the
 * number itself, a number that leaves a remainder, or where the search stops (and why each division gives TWO divisors).
 */
function listExample(rand, level, { mistake = null } = {}) {
  const n = pick(rand, LISTS_FROM[level === 2 ? 2 : 1]);
  const s = Math.floor(Math.sqrt(n));
  let first;
  if (mistake === 'one-and-itself')
    first = `On commence toujours par la paire $${n} = 1 \\times ${n}$ : 1 et ${n} sont des diviseurs.`;
  else if (mistake === 'rest-not-zero') {
    const outs = [];
    for (let k = 2; k < n / 2; k += 1) if (n % k !== 0) outs.push(k);
    const k = pick(rand, outs);
    first = `${k} n’est pas un diviseur : $${n} = ${k} \\times ${Math.floor(n / k)} + ${n % k}$, le reste n’est pas 0.`;
  } else if (mistake === 'partner-forgot')
    first = `Chaque division exacte donne deux diviseurs : le nombre essayé et son partenaire. On essaie de 1 à ${s}, car $${s} \\times ${s} = ${s * s}$ ne dépasse pas ${n}.`;
  else
    first = `On essaie de 1 à ${s} : $${s} \\times ${s} = ${s * s}$ ne dépasse pas ${n}, et $${s + 1} \\times ${s + 1} = ${(s + 1) * (s + 1)}$ le dépasse.`;
  return {
    title: `Les diviseurs de ${n}`,
    steps: [
      first,
      `Les paires : ${andList(tried(n).map((d) => `$${n} = ${d} \\times ${n / d}$`))}.`,
      `Diviseurs de ${n} : ${andList(divisorList(n))}.`,
    ],
  };
}

const DIVISOR_LISTS = {
  item: '4e.m1.r08',
  // the name of the gesture (the item has no French lesson yet: « Revois d’abord » names the item itself)
  name: 'Les diviseurs d’un nombre',
  icon: '📋',
  // no French lesson of 4e is written: no instrument belongs to this item yet (the capsule skips its lab step)
  labTool: null,
  mistakes: ['partner-forgot', 'stop-early', 'one-and-itself', 'rest-not-zero'],
  forms: { 1: ['write', 'sort'], 2: ['sort', 'write'] },
  make: (rand, level, form, { first = false } = {}) =>
    form === 'sort' ? listSort(rand, level) : listWrite(rand, level, first),
  example: listExample,
  rules: [
    {
      id: 'pairs',
      title: 'Les diviseurs vont par paires',
      text: 'Chaque égalité $a = b \\times k$ donne deux diviseurs de $a$ : $b$ et son partenaire $k$.',
      example: '$65 = 5 \\times 13$ : 5 et 13 sont des diviseurs de 65.',
      check: { a: 65, b: 5, q: 13, r: 0 },
    },
    {
      id: 'square',
      title: 'Jusqu’où essayer',
      text: 'Pour trouver les diviseurs de $a$, on essaie les nombres dont le carré ne dépasse pas $a$, et on écrit avec chacun son partenaire.',
      example: '$7 \\times 7 = 49$ ne dépasse pas 50, et $8 \\times 8 = 64$ le dépasse : pour 50, on essaie de 1 à 7.',
      check: { a: 50, b: 5, q: 10, r: 0 },
    },
    {
      id: 'whole',
      title: 'La liste complète',
      text: 'La liste des diviseurs de $a$ commence par 1 et finit par $a$ ; un nombre qui laisse un reste n’y entre pas.',
      example: `Diviseurs de 20 : ${andList([1, 2, 4, 5, 10, 20])} ; $20 = 3 \\times 6 + 2$ : 3 n’en fait pas partie.`,
      check: { a: 20, b: 3, q: 6, r: 2 },
    },
  ],
  memo: [
    'Chaque égalité $a = b \\times k$ donne deux diviseurs : $b$ et son partenaire $k$.',
    'On essaie les nombres à partir de 1, tant que leur carré ne dépasse pas $a$.',
    '1 et $a$ lui-même sont toujours dans la liste.',
    `Exemple : $76 = 1 \\times 76 = 2 \\times 38 = 4 \\times 19$, donc les diviseurs de 76 sont ${andList([1, 2, 4, 19, 38, 76])}.`,
  ],
};

// ───────────────────────── 4e.m4.r04 — une parallèle dans un triangle (4e), et la quatrième proportionnelle ─────────────────────────
// What the 3e lesson of the butterfly stands on from 4e (ported from the Algerian family `3am.m2.r03`, the ratios in a
// triangle; the French net item is `4e.m4.r04`, Thalès in the NESTED triangles, which holds the fourth proportional of
// `4e.m2.r09` as its tool of calculation): in a triangle ABC cut by (MN) ∥ (BC), M on [AB] and N on [AC] — the nested
// position only —, the lengths of AMN are proportional to those of ABC; and the fourth proportional found by the cross
// product. Every length is a whole number of centimetres: the triangles are similar by p/q (p < q, nothing shared),
// AM = p·s, AB = q·s, AN = p·t, AC = q·t, MN = p·w, BC = q·w. Nothing here names the lesson's keys (a butterfly, a point
// beyond the vertex, a half-turn, a length from the vertex), nor the theorem's name, nor a word of its world.
/**
 * The figures of the world « Les pyramides » as the lesson of the butterfly plays it (its story's numbers, its practice
 * figures and its board's stations — UNIT_3E_THALES_DESIGN.md § 3 — and the items of its class test), their whole
 * lengths from 10 up, one figure a line: a triangle of the kit never shows TWO numbers that stand together in one of them
 * — a figure met first in the lesson is not one the kit has just shown. `launchkit.test.js` reads the lesson's files and
 * checks every pair.
 */
const TRI_AVOID = [
  '72 52 416 81 468',
  '104 115 219 146 177 292 230 73 133 584',
  '26 32 56 24 42 88',
  '30 40 21 28 26 70 49',
  '17 19 15',
  '23 29 24 36',
  '19 24 60 23 36',
  '31 29 18 27',
  '13 16 40 21 24',
  '32 40',
  '28 13',
  '24 44 68 33',
  '29 35 50 85 64',
  '28 26',
  '10 16',
  '34 51',
].map((line) => line.split(' ').map(Number));
const triPairKey = (x, y) => (x < y ? `${x};${y}` : `${y};${x}`);
const TRI_PAIRS = new Set(TRI_AVOID.flatMap((g) => g.flatMap((x, i) => g.slice(i + 1).map((y) => triPairKey(x, y)))));
/** Do the numbers shown hold no pair of a figure of the world (numbers below 10 stand in every sheet: never a pair)? */
const triFree = (xs) => {
  const big = [...new Set(xs.filter((x) => x >= 10))];
  return big.every((x, i) => big.slice(i + 1).every((y) => !TRI_PAIRS.has(triPairKey(x, y))));
};
/** Where a level draws its triangle: the ratio's denominator q, the multipliers s, t, w and the longest side. */
const TRI_FROM = {
  first: { q: [2, 2], m: [1, 4], top: 8 },
  1: { q: [2, 5], m: [1, 4], top: 30 },
  2: { q: [2, 6], m: [2, 9], top: 60 },
};
const TRI_CACHE = {};
/** Every triangle a level may show, filtered once: s ≠ t ≠ w (the additive slip never equals the truth), a true triangle. */
function triPool(level) {
  if (TRI_CACHE[level]) return TRI_CACHE[level];
  const R = TRI_FROM[level];
  const list = [];
  for (let q = R.q[0]; q <= R.q[1]; q += 1)
    for (let p = 1; p < q; p += 1) {
      if (gcdOf(p, q) !== 1) continue;
      for (let s = R.m[0]; s <= R.m[1]; s += 1)
        for (let t = R.m[0]; t <= R.m[1]; t += 1)
          for (let w = R.m[0]; w <= R.m[1]; w += 1) {
            if (s === t || s === w || t === w || s + t <= w || s + w <= t || t + w <= s) continue;
            const T = { AM: p * s, AB: q * s, AN: p * t, AC: q * t, MN: p * w, BC: q * w };
            if (Math.max(T.AB, T.AC, T.BC) > R.top) continue;
            // level 2 writes two-digit lengths; the additive slips stay positive and apart from the truth
            if (level === 2 && Math.max(T.AB, T.AC, T.BC) < 13) continue;
            if (T.BC - (T.AB - T.AM) <= 0) continue;
            // every number a question of the level may show: the six lengths and, at level 2, the slips of the sort
            const slips = level === 2 ? [T.AN + (T.AB - T.AM), T.BC - (T.AB - T.AM), (T.AB * T.BC) / T.AM] : [];
            if (!triFree([...Object.values(T), ...slips])) continue;
            list.push(T);
          }
    }
  TRI_CACHE[level] = list;
  return list;
}
const triangleOf = (rand, level, first = false) => pick(rand, triPool(first ? 'first' : level));
const triData = (T, keys) => andList(keys.map((k) => `$${k} = ${T[k]}$`));
const TRI_INTRO =
  'Dans le triangle $ABC$, le point $M$ est sur $[AB]$, le point $N$ est sur $[AC]$, et $(MN) \\parallel (BC)$. Les longueurs sont en centimètres\u00a0:';
/** The slip an answer v to « a/b = c/▢ » shows: the difference added (additive), or one fraction turned upside down. */
function fourthSlip(c, v) {
  if (v === c.c + (c.b - c.a)) return 'add-not-times';
  if (v * c.b === c.a * c.c) return 'ratio-flipped';
  return null;
}
const cmBox = (v) => S('v', 'longueur', String(v).length);

/** « a/b = c/▢ » (level 1): the fourth proportional, two real fraction bars. */
function fourthWrite(rand, level, first) {
  const T = triangleOf(rand, 1, first);
  const c = { op: 'fourth', a: T.AM, b: T.AB, c: T.AN };
  return {
    gesture: 'write',
    calc: c,
    prompt: 'Complète pour que l’égalité soit vraie.',
    tokens: [
      { frac: [String(c.a), String(c.b)] },
      '=',
      { frac: [String(c.c), S('v', 'dénominateur', String(T.AC).length)] },
    ],
  };
}

/** A length of the triangle from three others: AC (level 1, from AM, AB, AN) or MN (level 2, from AM, AB, BC). */
function triWrite(rand, level, first) {
  const T = triangleOf(rand, level, first);
  const ask = level === 1 ? 'AC' : 'MN';
  // AM/AB = AN/AC → AM × AC = AB × AN; AB/AM = BC/MN → AB × MN = AM × BC
  const c = ask === 'AC' ? { op: 'fourth', a: T.AM, b: T.AB, c: T.AN } : { op: 'fourth', a: T.AB, b: T.AM, c: T.BC };
  return {
    gesture: 'write',
    calc: c,
    prompt: `${TRI_INTRO} ${triData(T, ask === 'AC' ? ['AM', 'AB', 'AN'] : ['AM', 'AB', 'BC'])}. Calcule $${ask}$.`,
    tokens: [ask, '=', cmBox(T[ask]), 'cm'],
  };
}

/** Three claims « AC = v », « MN = v » about one triangle: the length, the difference added, a fraction turned upside down. */
function triSort(rand) {
  const T = triangleOf(rand, 2);
  const flipMN = (T.AB * T.BC) % T.AM === 0 ? (T.AB * T.BC) / T.AM : null;
  const CARDS = {
    ac: ['AC', T.AC, null],
    acAdd: ['AC', T.AN + (T.AB - T.AM), 'add-not-times'],
    mn: ['MN', T.MN, null],
    mnAdd: ['MN', T.BC - (T.AB - T.AM), 'add-not-times'],
    mnFlip: ['MN', flipMN, 'ratio-flipped'],
  };
  const shapes = [
    ['ac', 'mnAdd', 'mn'],
    ['acAdd', 'mn', 'ac'],
    ['ac', 'mnFlip', 'acAdd'],
    ['mn', 'acAdd', 'mnFlip'],
    ['mnAdd', 'ac', 'mnFlip'],
  ].filter((k) => flipMN != null || !k.includes('mnFlip'));
  const kinds = shuffle(rand, pick(rand, shapes));
  return {
    gesture: 'sort',
    tri: T,
    prompt: `${TRI_INTRO} ${triData(T, ['AM', 'AB', 'AN', 'BC'])}. Chaque longueur convient-elle\u202f? Envoie-la dans sa boîte.`,
    bins: [
      { id: 'yes', label: 'Elle convient' },
      { id: 'no', label: 'Elle ne convient pas' },
    ],
    cards: kinds.map((kind, i) => {
      const [ask, v, trap] = CARDS[kind];
      return { id: `c${i + 1}`, text: `$${ask} = ${v}$`, ask, v, bin: trap ? 'no' : 'yes', trap };
    }),
  };
}

/** The worked example: the two equal fractions of the triangle, the cross product, the length. Its first step answers the mistake shown. */
function triExample(rand, level, { mistake = null } = {}) {
  const T = triangleOf(rand, level === 2 ? 2 : 1);
  let first;
  if (mistake === 'add-not-times')
    first = `Ajouter à $AN$ la différence $${T.AB - T.AM}$ entre $AB$ et $AM$ donnerait $${T.AN + (T.AB - T.AM)}$\u00a0: les longueurs des deux triangles sont proportionnelles, on multiplie, on n’ajoute pas.`;
  else if (mistake === 'ratio-flipped')
    first =
      'On écrit les deux fractions dans le même ordre\u00a0: une longueur du petit triangle sur la longueur qui lui correspond dans le grand, dans les deux fractions.';
  else
    first =
      'La droite $(MN)$ est parallèle à $(BC)$\u00a0: les longueurs du triangle $AMN$ sont proportionnelles à celles du triangle $ABC$.';
  return {
    title: 'Calculer une longueur dans un triangle',
    steps: [
      first,
      `$\\frac{AM}{AB} = \\frac{AN}{AC}$, soit $\\frac{${T.AM}}{${T.AB}} = \\frac{${T.AN}}{AC}$.`,
      `Produit en croix\u00a0: $${T.AM} \\times AC = ${T.AB} \\times ${T.AN} = ${T.AB * T.AN}$.`,
      `Donc $AC = ${T.AB * T.AN} \\div ${T.AM} = ${T.AC}$\u00a0cm.`,
    ],
  };
}

const PARALLEL_IN_TRIANGLE = {
  item: '4e.m4.r04',
  // the name of the gesture (the item has no French lesson yet: « Revois d’abord » names the item itself)
  name: 'Une parallèle dans un triangle',
  icon: '🔺',
  // no French lesson of 4e is written: no instrument belongs to this item yet (the capsule skips its lab step); the
  // rope of « Mon labo » is the 3e lesson's own instrument, never shown before it (`earlierOnly`, LESSON_LAB.md §2)
  labTool: null,
  mistakes: ['add-not-times', 'ratio-flipped'],
  forms: { 1: ['fourth', 'triangle'], 2: ['sort', 'side'] },
  make: (rand, level, form, { first = false } = {}) =>
    form === 'fourth'
      ? fourthWrite(rand, level, first)
      : form === 'sort'
        ? triSort(rand)
        : triWrite(rand, level, first),
  example: triExample,
  rules: [
    {
      id: 'fourth',
      title: 'La quatrième proportionnelle',
      text: 'Si $\\frac{a}{b} = \\frac{c}{d}$, alors $a \\times d = b \\times c$\u00a0: on trouve le quatrième nombre par le produit en croix.',
      example: '$\\frac{2}{6} = \\frac{3}{d}$\u00a0: $2 \\times d = 6 \\times 3 = 18$, donc $d = 9$.',
      check: { m: 2, w: 6, t: 3, v: 9 },
    },
    {
      id: 'triangle',
      title: 'Des longueurs proportionnelles',
      text: 'Dans le triangle $ABC$, si $M$ est sur $[AB]$, $N$ sur $[AC]$ et $(MN) \\parallel (BC)$, alors les longueurs du triangle $AMN$ sont proportionnelles à celles du triangle $ABC$.',
      example: '$AM = 2$, $AB = 6$ et $AN = 3$\u00a0: $\\frac{2}{6} = \\frac{3}{AC}$, donc $AC = 9$.',
      check: { m: 2, w: 6, t: 3, v: 9 },
    },
  ],
  memo: [
    'Dans le triangle $ABC$, avec $M$ sur $[AB]$, $N$ sur $[AC]$ et $(MN) \\parallel (BC)$, les longueurs de $AMN$ sont proportionnelles à celles de $ABC$.',
    'On écrit deux fractions égales dans le même ordre, puis le produit en croix\u00a0: $\\frac{a}{b} = \\frac{c}{d}$ donne $a \\times d = b \\times c$.',
    'On multiplie, on n’ajoute pas\u00a0: la différence entre deux longueurs ne reste pas la même dans l’autre triangle.',
    'Exemple\u00a0: $\\frac{2}{6} = \\frac{3}{AC}$, donc $2 \\times AC = 18$ et $AC = 9$.',
  ],
};

// Keyed by the item id of the learning net (`toolsForLesson` of `packages/core/curriculum/fr/net/learningNet.js`). Four
// families today: `4e.m1.r06`, the one tool the net gives the first 3e lesson; `3e.m1.r05` and `4e.m1.r08`, the two
// tools of the second (the PGCD lesson); `4e.m4.r04`, the tool of the butterfly lesson of the Thalès unit (its other
// core item, `4e.m2.r09`, the fourth proportional, is measured INSIDE this family: no family of its own). The Algerian families (their question generators, rules and memos) are in
// git, `git show 049380e:apps/web/src/lessons/common/launchkit/families.js`: a French family PORTS what fits and is keyed
// by a French item.
export const FAMILIES = {
  '4e.m1.r06': DECOMPOSITION,
  '3e.m1.r05': BIG_DECOMPOSITION,
  '4e.m1.r08': DIVISOR_LISTS,
  '4e.m4.r04': PARALLEL_IN_TRIANGLE,
};

export const familyFor = (item) => FAMILIES[item] ?? null;

/** A question of a family: its level and form, the very first of a launch being a near-certain win. */
export function makeQuestion(rand, item, level, form, opts = {}) {
  const f = FAMILIES[item];
  const q = f.make(rand, level, form, opts);
  return { ...q, item, level, form };
}

/**
 * The forms of a level in the order a launch asks them. At level 2 a family's `sort` comes FIRST (2026-11-18): the
 * level-2 question of a tool is asked ONCE per station, the workshop repeats the form that was missed and the capsule
 * asks level 1 only — so a level-2 form listed second was never asked in a launch, and the sort is where a family keeps
 * its traps and the cards to ACCEPT (« $9 = 14 \times 0 + 9$ », `quotient-zero`). A family with no level-2 `sort` keeps
 * its own order.
 */
const formsOf = (item, level) => {
  const forms = FAMILIES[item].forms[level];
  return level === 2 && forms.includes('sort') ? ['sort', ...forms.filter((f) => f !== 'sort')] : forms;
};

/**
 * The form of the next question of a level: one not used yet in this launch when the family has another; when every form
 * was used, the one used LEAST (the first of them in the family's order). 2026-11-23: a launch that misses everything asks
 * the easy forms write, primes (the station), primes twice (the workshop), then the capsule's two — power, then write:
 * the old fallback (`used.length % n`) asked power twice and a form could be met by nobody.
 */
export function pickForm(item, level, used = []) {
  const forms = formsOf(item, level);
  const times = (f) => used.filter((u) => u === `${level}:${f}`).length;
  return forms.reduce((best, f) => (times(f) < times(best) ? f : best), forms[0]);
}

/**
 * The form of the question `step` (`nextStep`) asks, given the answers so far and the forms `used` in this launch: a
 * workshop question repeats the form of the tool's last station miss when that form exists at the workshop's level (two
 * questions LIKE the one he missed); otherwise `pickForm`.
 */
export function nextForm(step, answers, used = []) {
  const missed = [...answers]
    .reverse()
    .find((a) => a.item === step.item && a.phase === 'station' && !(a.correct && !a.unsure));
  if (step.phase === 'workshop' && missed && FAMILIES[step.item].forms[step.level].includes(missed.form))
    return missed.form;
  return pickForm(step.item, step.level, used);
}

const num = (x) => (x === '' || x == null ? NaN : Number(x));

/**
 * The boxes of a « write » question, in reading order: a token is a string (drawn as it is), a box (`S`), a fraction
 * `{ frac: [top, bottom] }` whose terms are each a string or a box, or a power `{ pow: [base, exponent] }` (drawn with a
 * real superscript; its base is a string or a fraction of two strings, and it holds no box).
 */
export const slotsOf = (tokens) =>
  tokens.flatMap((t) =>
    typeof t !== 'object' || t.pow ? [] : t.frac ? t.frac.filter((x) => typeof x === 'object') : [t],
  );

/** Is the answer complete enough to be handed in? (every box written, every card sent, the flag moved) */
export function complete(q, answer) {
  if (!answer) return false;
  if (q.gesture === 'write') return slotsOf(q.tokens).every((t) => answer[t.slot] !== '' && answer[t.slot] != null);
  if (q.gesture === 'sort') return q.cards.every((c) => answer[c.id] === 'yes' || answer[c.id] === 'no');
  return Number.isFinite(answer.x) && answer.moved === true;
}

/** Right or not — and the NAME of the mistake when the answer shows one. */
export function grade(q, answer) {
  if (q.calc) return gradeCalc(q, answer);
  if (q.gesture === 'write') {
    const tq = Math.floor(q.a / q.b);
    const tr = q.a % q.b;
    const aq = num(answer?.q);
    // an equality with no box for the remainder (« a = b × ▢ »): only the factor is judged
    if (q.tokens && !q.tokens.some((t) => t.slot === 'r'))
      return aq === tq && tr === 0
        ? { correct: true, mistake: null }
        : { correct: false, mistake: Number.isFinite(aq) ? 'product-false' : null };
    const ar = num(answer?.r);
    if (aq === tq && ar === tr) return { correct: true, mistake: null };
    if (aq === tr && ar === tq && tq !== tr) return { correct: false, mistake: 'swapped' };
    if (q.b * aq + ar === q.a && ar >= q.b) return { correct: false, mistake: 'rest-too-big' };
    return { correct: false, mistake: Number.isFinite(aq) && Number.isFinite(ar) ? 'equality-false' : null };
  }
  if (q.gesture === 'sort') {
    const wrong = q.cards.filter((c) => answer?.[c.id] !== c.bin);
    if (wrong.length === 0) return { correct: true, mistake: null };
    return {
      correct: false,
      mistake:
        wrong.find((c) => c.trap && c.bin === 'no')?.trap ??
        wrong.find((c) => c.miss)?.miss ??
        (q.k === 3 || q.k === 9 ? (wrong.some((c) => c.bin === 'yes') ? 'last-digit' : null) : null),
    };
  }
  const x = Number(answer?.x);
  if (x === q.target) return { correct: true, mistake: null };
  if (x > q.a) return { correct: false, mistake: 'overshoot' };
  return { correct: false, mistake: x % q.b === 0 ? 'not-greatest' : 'not-multiple' };
}
