/**
 * « Espace jeu » of lesson `decomposer-en-facteurs-premiers` — the CONTENT of its practice ladder (PURE). The ladder
 * itself is the kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the
 * map of its levels. A wave is DATA: { type, key, a, …, gates, good }; the world writes the sentence of the types it
 * knows (`remainder`); the sentences of THIS lesson are written here and carried by the wave itself: `say` and
 * `why: { right, wrong: { [gate]: line } }`.
 *
 * THE GATE DASH IS MENTAL ARITHMETIC: every number printed stays at most 100 (a decomposition is printed as its primes
 * and powers, never as its value); the large numbers belong to the exam format of the trainer, where he has paper.
 * The levels follow the weight of the bank (primary questions P1 65 · P2 44 · P3 23): the procedure and « is it prime »
 * (P1, keys 1 and 3) have two levels each, the powers (P2) two, the tool (P3) one; and from the THIRD level of the ladder
 * on, every level holds the reading of a decomposition as a tool (`divisorOfPow`: does this number divide
 * 2³ × 3² × 5 ? — « What the bank showed », 1).
 */
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { K } from './story';
import { BOSS_A, frAll, isPrime, powTex, powersOf, productTex, smallestPrime, stopOf, valueOfPowers } from './math';

/** The largest prime p with p × p ⩽ n — the last division to try before saying n is prime. */
export const lastPrimeOf = (n) => {
  let last = null;
  for (let p = 2; p * p <= n; p += 1) if (isPrime(p)) last = p;
  return last;
};

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'smallestPrime':
      return n === smallestPrime(w.a);
    case 'missingFactor':
      return isPrime(n) && n * w.known === w.a;
    case 'powerValue':
      return n === w.a;
    case 'exponent':
      return n >= 1 && w.p ** n * w.rest === w.a;
    case 'divisorOfPow':
      return n >= 1 && w.a % n === 0;
    case 'lastPrime':
      return n === lastPrimeOf(w.a);
    case 'primeAmong':
      return isPrime(n);
    case 'modCell':
      return n === w.a % w.b;
    case 'programStop':
      return n === stopOf(w.a);
    default:
      return false;
  }
}

/** « $x = n × q + r$ » — the division of x by n (r ≠ 0: n does not divide x). */
const leaves = (x, n) => `$${x} = ${n} \\times ${Math.floor(x / n)} + ${x % n}$`;
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
/** A wave whose sentences take French typography. */
const fair = (rand, base, right, pool) =>
  wave(rand, { ...base, say: frAll(base.say), why: frAll(base.why) }, right, pool);
const SMALL_PRIMES = [2, 3, 5, 7];
const composite = (n) => n >= 4 && !isPrime(n);

/** A decomposition [{ p, e }] on the primes 2, 3, 5, 7, of value ≤ max, with at least `factors` primes counted. */
function decomposition(rand, { max = 100, min = 12, factors = 3, power = true } = {}) {
  for (let t = 0; t < 200; t += 1) {
    const fs = SMALL_PRIMES.map((p) => ({ p, e: int(rand, 0, p === 2 ? 4 : p === 3 ? 3 : 1) })).filter((f) => f.e > 0);
    const v = valueOfPowers(fs);
    const count = fs.reduce((s, f) => s + f.e, 0);
    if (v < min || v > max || count < factors || fs.length < 2) continue;
    if (power && !fs.some((f) => f.e >= 2)) continue;
    return fs;
  }
  return null;
}

// ── the kinds of question ──
const G = {
  /** « Le plus petit nombre premier qui divise a » — a composite a ≤ 99. */
  smallestPrime(rand, { key }) {
    const a = int(rand, 21, 99);
    if (!composite(a)) return null;
    const sp = smallestPrime(a);
    const pool = [
      ...new Set([...powersOf(a).map((f) => f.p), 2, 3, 5, 7, ...[4, 6, 9].filter((d) => a % d === 0)]),
    ].filter((n) => n !== sp && n < a);
    return fair(
      rand,
      {
        type: 'smallestPrime',
        key,
        a,
        say: `Le plus petit nombre premier qui divise ${a}`,
        why: {
          right: `$${a} = ${sp} \\times ${a / sp}$, et aucun nombre premier plus petit que ${sp} ne divise ${a}.`,
          wrong: linesFor(pool, (n) =>
            a % n !== 0
              ? `${leaves(a, n)} : ${n} ne divise pas ${a}.`
              : isPrime(n)
                ? `${n} divise ${a}, mais ${sp} aussi, et ${sp} est plus petit.`
                : `${n} divise ${a}, mais ${n} n’est pas un nombre premier : $${n} = ${productTex(powersOf(n).flatMap((f) => Array(f.e).fill(f.p)))}$.`,
          ),
        },
      },
      sp,
      pool,
    );
  },
  /** « $a = 2 \times 2 \times \square \times 5$ » — the prime factors written out, one of them missing. */
  missingFactor(rand, { key }) {
    const fs = decomposition(rand, { max: 100, min: 20, factors: 3, power: false });
    if (!fs) return null;
    const a = valueOfPowers(fs);
    const list = fs.flatMap((f) => Array(f.e).fill(f.p));
    const at = int(rand, 0, list.length - 1);
    const right = list[at];
    const known = a / right;
    const shown = list.map((x, i) => (i === at ? '\\square' : String(x))).join(' \\times ');
    const pool = [right * 2, right * right, ...SMALL_PRIMES].filter((n) => n !== right && n <= 100);
    return fair(
      rand,
      {
        type: 'missingFactor',
        key,
        a,
        known,
        say: `$${a} = ${shown}$`,
        why: {
          right: `$${productTex(list)} = ${a}$ : chaque facteur est un nombre premier.`,
          wrong: linesFor(pool, (n) =>
            n * known === a
              ? `${n} n’est pas premier : on le casse encore.`
              : `Avec ${n}, le produit vaut ${n * known}, et non ${a}.`,
          ),
        },
      },
      right,
      pool,
    );
  },
  /** « $2^3 \times 3 = \square$ » — the value of a decomposition written with powers. */
  powerValue(rand, { key }) {
    const fs = decomposition(rand, { max: 100, min: 12, factors: 3 });
    if (!fs) return null;
    const a = valueOfPowers(fs);
    // the misreadings: an exponent read as a factor (2³ read 2 × 3), a power lost
    const misread = valueOfPowers(fs.map((f) => (f.e >= 2 ? { p: f.p * f.e, e: 1 } : f)));
    const lost = valueOfPowers(fs.map((f) => ({ ...f, e: f.e >= 2 ? f.e - 1 : f.e })));
    const pool = [misread, lost, a + fs[0].p, a - fs[0].p].filter((n) => n >= 1 && n <= 100 && n !== a);
    const big = fs.find((f) => f.e >= 2);
    return fair(
      rand,
      {
        type: 'powerValue',
        key,
        a,
        say: `$${powTex(fs)} = \\square$`,
        why: {
          right: `$${powTex(fs)} = ${productTex(fs.flatMap((f) => Array(f.e).fill(f.p)))} = ${a}$.`,
          wrong: linesFor(pool, (n) =>
            n === misread
              ? `$${big.p}^${big.e}$ n’est pas $${big.p} \\times ${big.e}$ : c’est ${big.p} multiplié ${big.e} fois par lui-même.`
              : `Écris chaque puissance en produit : $${powTex(fs)}$ ne vaut pas ${n}.`,
          ),
        },
      },
      a,
      pool,
    );
  },
  /** « $72 = 2^{\square} \times 3^2$ » — the exponent of one prime. */
  exponent(rand, { key }) {
    const fs = decomposition(rand, { max: 100, min: 12, factors: 3 });
    if (!fs) return null;
    const a = valueOfPowers(fs);
    const at = pick(
      rand,
      fs.map((f, i) => (f.e >= 2 ? i : -1)).filter((i) => i >= 0),
    );
    const { p, e } = fs[at];
    const rest = a / p ** e;
    const shown = fs
      .map((f, i) => (i === at ? `${f.p}^{\\square}` : f.e === 1 ? `${f.p}` : `${f.p}^${f.e}`))
      .join(' \\times ');
    const pool = [e - 1, e + 1, e + 2, p].filter((n) => n >= 1 && n !== e);
    return fair(
      rand,
      {
        type: 'exponent',
        key,
        a,
        p,
        rest,
        say: `$${a} = ${shown}$`,
        why: {
          right: `${p} divise ${a} exactement ${e} fois : $${a} = ${powTex(fs)}$.`,
          wrong: linesFor(pool, (n) => `$${p}^{${n}} \\times ${rest} = ${p ** n * rest}$, et non ${a}.`),
        },
      },
      e,
      pool,
    );
  },
  /**
   * « Un diviseur de $2^3 \times 3^2 \times 5$ » — READING a decomposition as a tool: the right gate is a product of some
   * of its factors; the wrong ones use the same primes with an exponent too high, or a prime that is not there (« the
   * same primes are there, so it divides » is the error). The number itself is never printed (it may pass 100). The
   * last bridge's own decomposition is never drawn: it stays the mission's.
   */
  divisorOfPow(rand, { key }) {
    const fs = decomposition(rand, { max: 2000, min: 60, factors: 4 });
    if (!fs) return null;
    const a = valueOfPowers(fs);
    if (a === BOSS_A) return null;
    const sub = fs.map((f) => ({ p: f.p, e: int(rand, 0, f.e) })).filter((f) => f.e > 0);
    const right = valueOfPowers(sub);
    if (right < 4 || right > 100 || right === a) return null;
    const over = fs.map((f) => valueOfPowers([{ p: f.p, e: f.e + 1 }]) * (sub.find((s) => s.p !== f.p)?.p ?? 1));
    const absent = SMALL_PRIMES.filter((p) => !fs.some((f) => f.p === p)).map((p) => p * fs[0].p);
    const pool = [...over, ...absent].filter((n) => n >= 2 && n <= 100 && a % n !== 0);
    return fair(
      rand,
      {
        type: 'divisorOfPow',
        key,
        a,
        say: `Un diviseur de $${powTex(fs)}$`,
        why: {
          right: `$${right} = ${powTex(sub)}$ : chacun de ses facteurs est dans $${powTex(fs)}$, avec un exposant qui ne dépasse pas.`,
          wrong: linesFor(pool, (n) => {
            const ns = powersOf(n);
            const missingP = ns.find((g) => !fs.some((f) => f.p === g.p));
            if (missingP) return `$${n} = ${powTex(ns)}$ : le facteur ${missingP.p} n’est pas dans $${powTex(fs)}$.`;
            const high = ns.find((g) => g.e > fs.find((f) => f.p === g.p).e);
            return `$${n} = ${powTex(ns)}$ : l’exposant de ${high.p} dépasse celui de $${powTex(fs)}$.`;
          }),
        },
      },
      right,
      pool,
    );
  },
  /** « Le dernier nombre premier à essayer pour savoir si a est premier » — a ≤ 100. */
  lastPrime(rand, { key }) {
    const a = int(rand, 30, 99);
    // a number that does not show at once it is not prime (odd, not ending in 5)
    if (a % 2 === 0 || a % 5 === 0) return null;
    const last = lastPrimeOf(a);
    let next = last + 1;
    while (!isPrime(next)) next += 1;
    const pool = [next, stopOf(a), Math.floor(a / 2), Math.floor(a / 3)].filter(
      (n) => n !== last && n >= 2 && n <= 100,
    );
    return fair(
      rand,
      {
        type: 'lastPrime',
        key,
        a,
        say: `Le dernier nombre premier à essayer pour savoir si ${a} est premier`,
        why: {
          right: `$${last} \\times ${last} = ${last * last}$ ne dépasse pas ${a}, et $${next} \\times ${next} = ${next * next}$ le dépasse : on s’arrête à ${last}.`,
          wrong: linesFor(pool, (n) =>
            !isPrime(n)
              ? `${n} n’est pas un nombre premier : on n’essaie que 2, 3, 5, 7…`
              : n * n > a
                ? `$${n} \\times ${n} = ${n * n}$ dépasse ${a} : inutile d’essayer ${n}.`
                : `Après ${n}, il reste ${last} : $${last} \\times ${last} = ${last * last}$ ne dépasse pas ${a}.`,
          ),
        },
      },
      last,
      pool,
    );
  },
  /** « Un nombre premier » — one prime and two composites that look prime (odd, not a multiple of 3 or of 5 by sight). */
  primeAmong(rand, { key }) {
    const right = int(rand, 23, 97);
    if (!isPrime(right)) return null;
    const looks = [49, 77, 91, 51, 57, 87, 93, 69, 39, 63, 81];
    const pool = shuffle(rand, looks).slice(0, 4);
    return fair(
      rand,
      {
        type: 'primeAmong',
        key,
        say: 'Un nombre premier',
        why: {
          right: `${right} : aucun nombre premier dont le carré ne dépasse pas ${right} ne le divise.`,
          wrong: linesFor(pool, (n) => {
            const p = smallestPrime(n);
            return `$${n} = ${p} \\times ${n / p}$ : ${n} n’est pas premier.`;
          }),
        },
      },
      right,
      pool,
    );
  },
  /** « Ce qu’affiche la cellule =MOD(a;p) » — the remainder a spreadsheet writes. */
  modCell(rand, { key }) {
    const b = pick(rand, [3, 7, 11, 13]);
    const a = int(rand, 30, 99);
    const r = a % b;
    const q = Math.floor(a / b);
    const pool = [q, r + 1, r - 1, b - r].filter((n) => n >= 0 && n !== r);
    return fair(
      rand,
      {
        type: 'modCell',
        key,
        a,
        b,
        say: `Ce qu’affiche la cellule $\\texttt{=MOD(${a};${b})}$`,
        why: {
          right: `$${a} = ${b} \\times ${q} + ${r}$ : le reste est ${r}.`,
          wrong: linesFor(pool, (n) =>
            n === q
              ? `${q} est le quotient : la cellule affiche le reste.`
              : `Vérifie : $${b} \\times ${q} + ${n} = ${b * q + n}$, et non ${a}.`,
          ),
        },
      },
      r,
      pool,
    );
  },
  /** « Un programme essaie d = 2, 3, 4… tant que d × d ⩽ a » — the last d it tries, on a prime a. */
  programStop(rand, { key }) {
    const a = int(rand, 30, 99);
    if (!isPrime(a)) return null;
    const d = stopOf(a);
    const pool = [d + 1, d - 1, lastPrimeOf(a), Math.floor(a / 2)].filter((n) => n >= 2 && n !== d && n <= 100);
    return fair(
      rand,
      {
        type: 'programStop',
        key,
        a,
        say: `Un programme essaie $d = 2, 3, 4\\ldots$ tant que $d \\times d \\leqslant ${a}$ : le dernier $d$ essayé`,
        why: {
          right: `$${d} \\times ${d} = ${d * d}$ ne dépasse pas ${a}, et $${d + 1} \\times ${d + 1} = ${(d + 1) * (d + 1)}$ le dépasse.`,
          wrong: linesFor(pool, (n) =>
            n * n > a
              ? `$${n} \\times ${n} = ${n * n}$ dépasse ${a} : le programme s’est arrêté avant.`
              : `$${n + 1} \\times ${n + 1} = ${(n + 1) * (n + 1)}$ ne dépasse pas ${a} : le programme essaie encore ${n + 1}.`,
          ),
        },
      },
      d,
      pool,
    );
  },
};

/** The map: one node per key in the order of the road, then the summary node; levels from the easiest. */
const EXAM = SUMMARY;
const read = (key) => ['divisorOfPow', { key }];
export const PRACTICE_NODES = [
  {
    id: K.ladder,
    levels: [
      { speed: 6.0, mix: [['smallestPrime', { key: K.ladder }]] },
      {
        speed: 6.5,
        mix: [
          ['smallestPrime', { key: K.ladder }],
          ['missingFactor', { key: K.ladder }],
        ],
      },
    ],
  },
  {
    id: K.powers,
    levels: [
      // the third level of the ladder: the reading of a decomposition comes in here, and stays
      {
        speed: 6.0,
        mix: [['powerValue', { key: K.powers }], ['exponent', { key: K.powers }], read(K.powers)],
      },
      {
        speed: 6.5,
        mix: [['exponent', { key: K.powers }], read(K.powers), read(K.powers)],
      },
    ],
  },
  {
    id: K.stop,
    levels: [
      { speed: 6.5, mix: [['lastPrime', { key: K.stop }], ['lastPrime', { key: K.stop }], read(K.powers)] },
      { speed: 7.0, mix: [['lastPrime', { key: K.stop }], ['primeAmong', { key: K.stop }], read(K.powers)] },
    ],
  },
  {
    id: K.tool,
    levels: [{ speed: 7.0, mix: [['modCell', { key: K.tool }], ['programStop', { key: K.tool }], read(K.powers)] }],
  },
  // the summary node: two mixed runs, the second faster — the procedure and « is it prime » most, as in the bank
  {
    id: EXAM,
    levels: [
      {
        speed: 6.5,
        mix: [
          ['smallestPrime', { key: K.ladder }],
          ['missingFactor', { key: K.ladder }],
          ['powerValue', { key: K.powers }],
          ['lastPrime', { key: K.stop }],
          read(K.powers),
        ],
      },
      {
        speed: 7.0,
        mix: [
          ['missingFactor', { key: K.ladder }],
          ['primeAmong', { key: K.stop }],
          ['exponent', { key: K.powers }],
          ['modCell', { key: K.tool }],
          read(K.powers),
        ],
      },
    ],
  },
];
/** The ladder of this lesson: its levels, bound to its nodes and its generators. */
export const ladder = createLadder({ nodes: PRACTICE_NODES, generators: G, isRight });
export const { waveOf } = ladder;

/**
 * The practice hub draws the ladder as the lesson's mind map (percent of the map box; left to right). Its edge labels
 * are shown from the first screen, before any key is forged: they name the story's places, never a rule
 * (`practice.test.js` lists the words they must not hold).
 */
export const PRACTICE_MAP = {
  root: 'Décomposer un nombre',
  positions: {
    root: [50, 8],
    [K.ladder]: [20, 38],
    [K.powers]: [50, 28],
    [K.stop]: [80, 38],
    [K.tool]: [35, 80],
    [EXAM]: [75, 80],
  },
  edges: [
    ['root', K.ladder, 'Les premiers fossés'],
    [K.ladder, K.powers, null],
    [K.powers, K.stop, null],
    [K.stop, K.tool, 'Les grands fossés'],
    [K.tool, EXAM, 'Le dernier pont'],
  ],
};
