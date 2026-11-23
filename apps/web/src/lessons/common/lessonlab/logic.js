/**
 * « Mon labo » — PURE mathematics of the instruments and their « Essaie » quests. No DOM here: every drawing READS these values.
 */
export const divide = (a, b) => ({ q: Math.floor(a / b), r: a % b });
export const divisorsOf = (a) => {
  const out = [];
  for (let d = 1; d <= a; d += 1) if (a % d === 0) out.push(d);
  return out;
};
/** The divisors of a as partner pairs [d, a / d], d ≤ a / d (a perfect square pairs its root with itself). */
export const divisorPairs = (a) =>
  divisorsOf(a)
    .filter((d) => d * d <= a)
    .map((d) => [d, a / d]);
export const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/**
 * « L’établi des deux listes »: the divisors of a and of b written by PAIRS, after the numbers 1, 2, … `tried` were tried on both.
 * The list of n stops once a number whose square passes n was reached (`last` = its biggest number to try): it is then
 * complete. For each list: `smalls` (the divisors tried, d × d ≤ n), `partners` (n / d, the pair's other end, never the
 * divisor itself again), `done`. Once BOTH lists are complete: `common` (in both) and `g`, the greatest of them.
 * `step` = what the last try said on each number (null for a number whose list was already complete).
 */
export function twoLists(a, b, tried) {
  const one = (n) => {
    const last = Math.floor(Math.sqrt(n));
    const upTo = Math.min(tried, last);
    const smalls = [];
    for (let d = 1; d <= upTo; d += 1) if (n % d === 0) smalls.push(d);
    const partners = smalls.map((d) => n / d).filter((p, i) => p !== smalls[i]);
    return { n, last, smalls, partners, done: tried >= last, all: [...smalls, ...[...partners].reverse()] };
  };
  const A = one(a);
  const B = one(b);
  const steps = Math.max(A.last, B.last);
  const done = A.done && B.done;
  const common = done ? A.all.filter((d) => b % d === 0).sort((x, y) => x - y) : [];
  const at = (L, d) => (d > L.last ? null : { d, ...divide(L.n, d) });
  return {
    A,
    B,
    steps,
    done,
    common,
    g: done ? common.at(-1) : null,
    step: tried > 0 && tried <= steps ? { d: tried, a: at(A, tried), b: at(B, tried) } : null,
  };
}

/** Les rangées de la division: where each of the a counters sits (column, row) in rows of b; the counters of the incomplete row are `rest`. */
export function rowsLayout(a, b) {
  const { q, r } = divide(a, b);
  return {
    q,
    r,
    rows: q + (r ? 1 : 0),
    cells: Array.from({ length: a }, (_, i) => ({ i, col: i % b, row: Math.floor(i / b), rest: i >= q * b })),
  };
}

/** Les sauts des multiples: the landings of jumps of b starting at 0, up to the flag a (and one past it when the flag is missed). */
export function jumpsOf(a, b) {
  const { q, r } = divide(a, b);
  return {
    q,
    r,
    landings: Array.from({ length: q }, (_, i) => (i + 1) * b),
    hit: r === 0,
    over: r === 0 ? null : (q + 1) * b,
  };
}

/** La machine aux quatre phrases: the four sentences about (a, b) — b « divides » a — true together or false together. */
export function sentences(a, b) {
  const ok = b !== 0 && a % b === 0;
  const { q, r } = divide(a, b);
  return {
    ok,
    q,
    r,
    list: [
      `${b} est un diviseur de ${a}`,
      `${a} est un multiple de ${b}`,
      `${a} est divisible par ${b}`,
      `${b} divise ${a}`,
    ],
    proof: ok
      ? `$${a} = ${b} \\times ${q}$`
      : a < b
        ? `$${a} < ${b}$ : un diviseur n’est jamais plus grand que le nombre.`
        : `$${a} = ${b} \\times ${q} + ${r}$ : le reste ${r} n’est pas nul.`,
  };
}

/** Le détecteur de divisibilité: for each rule, the verdict, the digits it looks at (indexes from the left) and what it reads. */
export function digitRules(n) {
  const s = String(n);
  const d = s.split('').map(Number);
  const last = d.length - 1;
  const sum = d.reduce((t, x) => t + x, 0);
  const all = d.map((_, i) => i);
  const two = d.length > 1 ? [last - 1, last] : [last];
  const tail = n % 100;
  return [
    {
      by: 2,
      ok: n % 2 === 0,
      digits: [last],
      reads: `Dernier chiffre ${d[last]} : ${d[last] % 2 === 0 ? 'pair' : 'impair'}`,
    },
    {
      by: 3,
      ok: n % 3 === 0,
      digits: all,
      reads: `Somme des chiffres ${sum} : ${sum % 3 === 0 ? 'un multiple de 3' : 'pas un multiple de 3'}`,
    },
    {
      by: 4,
      ok: n % 4 === 0,
      digits: two,
      reads: `Deux derniers chiffres ${tail} : ${tail % 4 === 0 ? 'un multiple de 4' : 'pas un multiple de 4'}`,
    },
    {
      by: 5,
      ok: n % 5 === 0,
      digits: [last],
      reads: `Dernier chiffre ${d[last]} : ${d[last] === 0 || d[last] === 5 ? 'c’est 0 ou 5' : 'ni 0 ni 5'}`,
    },
    {
      by: 9,
      ok: n % 9 === 0,
      digits: all,
      reads: `Somme des chiffres ${sum} : ${sum % 9 === 0 ? 'un multiple de 9' : 'pas un multiple de 9'}`,
    },
    {
      by: 10,
      ok: n % 10 === 0,
      digits: [last],
      reads: `Dernier chiffre ${d[last]} : ${d[last] === 0 ? 'c’est 0' : 'ce n’est pas 0'}`,
    },
  ];
}
/** Rolls the digit at `index` (from the left) of n by ±1, as on a padlock (9 → 0, 0 → 9). `width` keeps leading zeros apart. */
export function rollDigit(n, index, step, width) {
  const d = String(n).padStart(width, '0').split('').map(Number);
  d[index] = (d[index] + step + 10) % 10;
  return Number(d.join(''));
}

/** Les carrés d’Euclide: the squares cut from an a × b rectangle, biggest first — [{ x, y, side, step }] — and the side of the last. */
export function euclidSquares(a, b) {
  const out = [];
  let x = 0;
  let y = 0;
  let w = a;
  let h = b;
  let step = 0;
  while (w > 0 && h > 0 && out.length < 400) {
    if (w >= h) {
      const n = Math.floor(w / h);
      for (let i = 0; i < n; i += 1) out.push({ x: x + i * h, y, side: h, step });
      x += n * h;
      w -= n * h;
    } else {
      const n = Math.floor(h / w);
      for (let i = 0; i < n; i += 1) out.push({ x, y: y + i * w, side: w, step });
      y += n * w;
      h -= n * w;
    }
    step += 1;
  }
  return { squares: out, steps: step, pgcd: out.length ? out.at(-1).side : 0 };
}
/** The divisions Euclid's cutting writes: a = b × q + r, then b = r × q' + r' … down to remainder 0. */
export function euclidLines(a, b) {
  const lines = [];
  let x = Math.max(a, b);
  let y = Math.min(a, b);
  while (y > 0) {
    const { q, r } = divide(x, y);
    lines.push({ a: x, b: y, q, r });
    x = y;
    y = r;
  }
  return lines;
}

/**
 * « Le microscope à deux nombres » — what the instrument reads about two numbers, never a conclusion:
 *   `lists`  the divisors of a and of b, and those in both (`common`, smallest first);
 *   `probe`  one number d tried on both: the two divisions and which of the two it divides (`both`, `a`, `b` or `none`).
 * The divisions one after another are `euclidLines`.
 */
export function pairLists(a, b) {
  const A = divisorsOf(a);
  const B = divisorsOf(b);
  return { A, B, common: A.filter((d) => b % d === 0) };
}
export function probeOf(a, b, d) {
  const x = divide(a, d);
  const y = divide(b, d);
  const verdict = x.r === 0 && y.r === 0 ? 'both' : x.r === 0 ? 'a' : y.r === 0 ? 'b' : 'none';
  return { d, a: x, b: y, verdict };
}

/** The greatest whole number whose square does not pass n (n ≥ 0), in integers only — never a rounded float. */
const isqrt = (n) => {
  let x = Math.floor(Math.sqrt(n));
  while (x * x > n) x -= 1;
  while ((x + 1) * (x + 1) <= n) x += 1;
  return x;
};
/** n / 10^k written with a decimal comma, trailing zeros dropped: (299209, 4) → « 29,9209 », (302500, 4) → « 30,25 ». */
export function decText(n, k) {
  const s = String(n).padStart(k + 1, '0');
  const dec = s.slice(-k).replace(/0+$/, '');
  return dec ? `${s.slice(0, -k)},${dec}` : s.slice(0, -k);
}
/** A number of hundredths as it is written to 0,01 — the two decimals kept: 547 → « 5,47 », 550 → « 5,50 ». */
export const hundredths = (h) => `${Math.floor(h / 100)},${String(h % 100).padStart(2, '0')}`;

/**
 * « La salle du nombre » — a court of `a` whole tiles laid, from its corner, into a square of side `s` the hand chooses: row by
 * row, `inside` tiles in the square, `out` tiles that do not fit in it, `holes` places of the square left empty.
 * `verdict`: 'fits' (s × s = a), 'out' (s × s < a) or 'holes' (s × s > a). And what the court is, computed EXACTLY in
 * integers: `k` the side of the greatest whole square that fits (k × k ≤ a < (k + 1) × (k + 1)), `left` = a − k × k,
 * `perfect` (a = k × k), and the side to 0,01 from below and from above in hundredths (`lo`, `hi`: lo × lo ≤ a × 10000 <
 * hi × hi; equal to 100k for a perfect square).
 */
export function courtOf(a, s) {
  const k = isqrt(a);
  const lo = isqrt(a * 10000);
  const perfect = k * k === a;
  const sq = s * s;
  return {
    a,
    s,
    k,
    left: a - k * k,
    perfect,
    lo,
    hi: lo * lo === a * 10000 ? lo : lo + 1,
    inside: Math.min(a, sq),
    out: Math.max(0, a - sq),
    holes: Math.max(0, sq - a),
    verdict: sq === a ? 'fits' : sq < a ? 'out' : 'holes',
  };
}
/** Has the hand tried the sides that settle the court: k (and k + 1 when a is not a perfect square)? */
export const courtSettled = (a, tried = []) => {
  const { k, perfect } = courtOf(a, 1);
  return tried.includes(k) && (perfect || tried.includes(k + 1));
};

/**
 * « La plateforme de la fraction » — a court of `a` whole tiles, each tile cut into q × q small pieces (pieces of side 1/q), and the square
 * platform built on a rod of p/q laid from the court's corner: it holds p × p pieces, the court a × q × q. Integers
 * only, never a root: `plat`, `court`, `diff` (plat − court), `far` (its size), `verdict` 'fits' (equal), 'band' (the
 * platform is smaller: `far` pieces of the court stay uncovered) or 'jam' (it is larger by `far` pieces). `pMax`: the
 * longest rod the ruler offers — one tile beyond the court's side.
 */
export function pieceOf(a, q, p) {
  const court = a * q * q;
  const plat = p * p;
  const diff = plat - court;
  return {
    a,
    q,
    p,
    court,
    plat,
    diff,
    far: Math.abs(diff),
    verdict: diff === 0 ? 'fits' : diff < 0 ? 'band' : 'jam',
    pMax: isqrt(court) + q + 1,
  };
}
/**
 * Is the rod x (`{ q, far }`) nearer its court than `best`? The difference in TILES is far ÷ (q × q): compared by
 * multiplying across, never by a division — the record the hand keeps.
 */
export const closerPiece = (x, best) => !best || x.far * best.q * best.q < best.far * x.q * x.q;

/**
 * « La bande de la fraction » — a strip of b cells with its first a cells lit (the fraction a/b), and a piece of length k laid along it
 * from 0. What the drawing reads, never a conclusion: the two divisions (the lit part by k, the whole strip by k), where
 * the light ends — on a joint between two pieces or INSIDE a piece (`cut`: the start and end of that piece) —, what is
 * left at the end of the strip, and, only when k divides both, the fraction written in pieces: (a ÷ k)/(b ÷ k).
 * `verdict` is `probeOf`'s: `both`, `a` (the lit part only), `b` (the whole strip only) or `none`.
 */
export function stripOf(a, b, k) {
  const P = probeOf(a, b, k);
  const lit = P.a;
  return {
    k,
    lit: P.a,
    whole: P.b,
    verdict: P.verdict,
    cut: lit.r === 0 ? null : { from: lit.q * k, to: (lit.q + 1) * k },
    left: P.b.r,
    pieces: Math.ceil(Math.max(a, b) / k),
    rewrite: P.verdict === 'both' ? [a / k, b / k] : null,
  };
}

/**
 * La planche commune: the lengths a plank of d is laid along — the two numbers, their sum, their difference, the remainder of
 * the greater by the smaller, three times the first — each with its planks and what is left. `fits` is computed per row,
 * never stated: the drawing shows which lengths the plank fills.
 */
export function plankRows(a, b, d) {
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  const { q, r } = divide(big, small);
  const row = (id, n, label) => ({ id, n, label, planks: Math.floor(n / d), left: n % d, fits: n % d === 0 });
  return [
    row('a', a, `${a}`),
    row('b', b, `${b}`),
    row('sum', a + b, `${a} + ${b} = ${a + b}`),
    row('diff', big - small, `${big} − ${small} = ${big - small}`),
    row('rest', r, `${big} = ${small} × ${q} + ${r}`),
    row('triple', 3 * a, `3 × ${a} = ${3 * a}`),
  ];
}

/**
 * L’encadrement par planches: n planks of length b laid from 0 along a length a. What the drawing reads — never a rule: how long the n
 * planks are, what is left of a (`left`, when they do not pass a) or how far they pass it (`over`), and the two counts that
 * frame a ÷ b: the full planks `q` (the most that do not pass a) and the planks NEEDED `need` (the fewest that cover a — q
 * itself when a remainder 0 makes them one). `top` is the most planks the hand may lay: one past the full ones, never more.
 */
export function bracketOf(a, b, n) {
  const { q, r } = divide(a, b);
  const top = q + 1;
  const k = Math.max(0, Math.min(top, Math.round(Number(n) || 0)));
  const laid = k * b;
  return {
    q,
    r,
    n: k,
    top,
    laid,
    left: laid <= a ? a - laid : null,
    over: laid > a ? laid - a : 0,
    exact: laid === a,
    need: r === 0 ? q : q + 1,
  };
}

/**
 * « Essaie »: the small missions of each instrument. `seen` is the instrument's memory of what the student has already made
 * (a Set of facts written by `observe`); a quest is done when its fact is in it. Nothing here states a rule: a quest only
 * names something to MAKE; the instrument shows what happens.
 */
export const QUESTS = {
  rows: [
    { id: 'zero', text: 'Obtiens un reste de 0 (avec plus d’un jeton par rangée).' },
    { id: 'two', text: 'Pour un même nombre de jetons, trouve deux rangées différentes qui donnent un reste de 0.' },
    { id: 'max', text: 'Rends le reste le plus grand possible.' },
  ],
  jumps: [
    { id: 'hit', text: 'Tombe pile sur le drapeau avec un saut plus long que 1.' },
    { id: 'miss1', text: 'Fais que le dernier saut s’arrête juste un pas avant le drapeau.' },
    { id: 'three', text: 'Atteins le même drapeau avec trois longueurs de saut différentes.' },
  ],
  sentences: [
    { id: 'true', text: 'Rends les quatre phrases vraies.' },
    { id: 'swap', text: 'Échange les deux nombres : quand les phrases restent-elles vraies ? Trouve un exemple.' },
    { id: 'big', text: 'Rends-les vraies avec deux nombres plus grands que 20.' },
  ],
  divisors: [
    { id: 'all', text: 'Découvre tous les diviseurs d’un nombre plus grand que 20.' },
    { id: 'odd', text: 'Trouve un nombre qui a un nombre impair de diviseurs.' },
    { id: 'two', text: 'Trouve un nombre plus grand que 10 qui n’a que deux diviseurs.' },
  ],
  planks: [
    {
      id: 'both',
      text: 'Trouve une planche plus longue que 1 qui remplit les deux premières longueurs (deux longueurs différentes).',
    },
    { id: 'sum', text: 'Trouve une planche qui remplit la somme sans remplir aucune des deux premières longueurs.' },
    {
      id: 'rest',
      text: 'Obtiens un reste non nul, puis remplis les deux premières longueurs avec une planche plus longue que 1.',
    },
  ],
  common: [
    // never « leur seul diviseur commun est 1 »: those are the words of lesson 7's first tablet, and this instrument is the one its
    // launch kit opens BEFORE that lesson
    { id: 'one', text: 'Pose la couronne sur le nombre 1 avec deux nombres plus grands que 1.' },
    { id: 'self', text: 'Fais que le plus grand diviseur commun soit l’un des deux nombres.' },
    { id: 'six', text: 'Trouve deux nombres différents dont le plus grand diviseur commun est 6.' },
  ],
  lists: [
    { id: 'full', text: 'Complète les deux listes pour deux nombres plus grands que 50.' },
    {
      id: 'inside',
      text: 'Trouve deux nombres différents dont les listes ont en commun toute la liste du plus petit.',
    },
    { id: 'six', text: 'Complète les deux listes pour deux nombres qui ont au moins 6 nombres en commun.' },
  ],
  euclid: [
    { id: 'one', text: 'Découpe un rectangle jusqu’au bout.' },
    { id: 'unit', text: 'Trouve un rectangle dont le dernier carré a un côté de 1.' },
    { id: 'three', text: 'Trouve un rectangle qui demande au moins trois étapes de découpe.' },
  ],
  paper: [
    { id: 'end', text: 'Mène une division jusqu’à la dernière étape.' },
    { id: 'zero', text: 'Trouve une division dont le quotient contient le chiffre 0.' },
    { id: 'exact', text: 'Termine une division de reste 0 dont le dividende est plus grand que 500.' },
  ],
  bracket: [
    { id: 'over', text: 'Fais que seule la dernière planche dépasse la longueur.' },
    { id: 'exact', text: 'Remplis la longueur exactement avec plus de 10 planches.' },
    {
      id: 'big',
      text: 'Trouve les planches entières et les planches nécessaires pour une longueur à quatre chiffres et une planche à deux chiffres.',
    },
  ],
  duo: [
    {
      id: 'lists',
      text: 'Affiche les listes de deux nombres plus grands que 100 qui ont au moins 4 nombres en commun.',
    },
    { id: 'chain', text: 'Écris les divisions jusqu’au reste 0 pour deux nombres qui en demandent au moins 5.' },
    { id: 'probe', text: 'Essaie un nombre plus grand que 10 qui divise les deux nombres.' },
  ],
  strip: [
    { id: 'both', text: 'Trouve un morceau plus long que 10 qui divise le numérateur et le dénominateur.' },
    {
      id: 'big',
      text: 'Écris une fraction de dénominateur plus grand que 500 avec des morceaux qui rendent son dénominateur plus petit que 50.',
    },
    {
      id: 'split',
      text: 'Trouve un morceau qui divise le dénominateur mais pas le numérateur, avec un dénominateur plus grand que 100.',
    },
  ],
  court: [
    { id: 'exact', text: 'Trouve une salle de plus de 100 dalles qu’un carré entier remplit sans reste.' },
    {
      id: 'bracket',
      text: 'Encadre le côté d’une salle de plus de 150 dalles entre les côtés de deux carrés que tu as essayés.',
    },
    { id: 'most', text: 'Fais qu’il reste au moins 20 dalles hors du plus grand carré entier.' },
  ],
  piece: [
    {
      id: 'exact',
      text: 'Avec une toise de dénominateur plus grand que 1, fais qu’une plateforme couvre exactement une salle de plus de 10 dalles.',
    },
    {
      id: 'one',
      text: 'Fais que l’écart entre la plateforme et la salle soit de 1 morceau seulement, avec un dénominateur plus grand que 4.',
    },
    {
      id: 'close',
      text: 'Approche une plateforme de sa salle jusqu’à un écart plus petit qu’un centième de dalle, sans l’égaler.',
    },
  ],
  factor: [
    { id: 'end', text: 'Mène un nombre plus grand que 100 jusqu’à un fossé de 1 case.' },
    { id: 'long', text: 'Construis une échelle d’au moins 6 planches qui finit sur un fossé de 1 case.' },
    { id: 'big', text: 'Mène un nombre à quatre chiffres jusqu’à un fossé de 1 case.' },
  ],
  rules: [
    { id: 'three', text: 'Allume trois lampes à la fois.' },
    { id: 'nine', text: 'Allume la lampe du 9 avec un nombre à trois chiffres.' },
    { id: 'all', text: 'Allume les six lampes.' },
  ],
};

/** What the state of an instrument proves the student has made: facts added to `seen` (returns the new facts only). */
export function observe(tool, st, seen) {
  const add = [];
  const put = (f) => {
    if (!seen.has(f)) {
      seen.add(f);
      add.push(f);
    }
  };
  const { a, b } = st;
  if (tool === 'rows') {
    const { r } = divide(a, b);
    if (r === 0 && b > 1 && b < a) {
      put('zero');
      seen.add(`z:${a}:${b}`);
      if ([...seen].filter((f) => f.startsWith(`z:${a}:`)).length >= 2) put('two');
    }
    if (b >= 3 && r === b - 1) put('max');
  } else if (tool === 'jumps') {
    const { r } = divide(a, b);
    if (r === 0 && b > 1 && b < a) {
      put('hit');
      seen.add(`h:${a}:${b}`);
      if ([...seen].filter((f) => f.startsWith(`h:${a}:`)).length >= 3) put('three');
    }
    if (b > 2 && r === 1 && a > b) put('miss1');
  } else if (tool === 'sentences') {
    if (a % b === 0 && a !== b && b !== 1) put('true');
    if (a % b === 0 && b % a === 0 && st.swapped) put('swap');
    if (a % b === 0 && a > 20 && b > 20 && a !== b) put('big');
  } else if (tool === 'divisors') {
    const all = divisorsOf(a);
    const found = st.found ?? [];
    if (all.every((d) => found.includes(d))) {
      if (a > 20) put('all');
      if (all.length % 2 === 1 && a > 1) put('odd');
      if (all.length === 2 && a > 10) put('two');
    }
  } else if (tool === 'planks') {
    const { d } = st;
    if (Number.isInteger(d) && d > 1) {
      const both = a % d === 0 && b % d === 0;
      if (both && a !== b) put('both');
      if (a % d !== 0 && b % d !== 0 && (a + b) % d === 0) put('sum');
      if (both && Math.max(a, b) % Math.min(a, b) !== 0) put('rest');
    }
  } else if (tool === 'common') {
    const g = gcd(a, b);
    if (a > 1 && b > 1 && g === 1) put('one');
    if (a !== b && (g === a || g === b) && g > 1) put('self');
    if (a !== b && g === 6) put('six');
  } else if (tool === 'lists') {
    // reported by the instrument once BOTH lists were written to their end for these numbers
    if (st.done) {
      if (a > 50 && b > 50) put('full');
      const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
      if (a !== b && lo > 1 && hi % lo === 0) put('inside');
      if (divisorsOf(lo).filter((d) => hi % d === 0).length >= 6) put('six');
    }
  } else if (tool === 'euclid') {
    const e = euclidSquares(a, b);
    if (st.cut >= e.squares.length && a !== b) {
      put('one');
      if (e.pgcd === 1) put('unit');
      if (e.steps >= 3) put('three');
    }
  } else if (tool === 'paper') {
    if (st.done) {
      put('end');
      if (String(Math.floor(a / b)).includes('0')) put('zero');
      if (a % b === 0 && a > 500) put('exact');
    }
  } else if (tool === 'bracket') {
    // reported only once the hand has laid planks: `n` the planks laid, `lo` / `hi` whether the full count and the next one
    // were both laid for these numbers
    if (Number.isInteger(st.n) && b > 0) {
      const x = bracketOf(a, b, st.n);
      if (x.r > 0 && x.n === x.q + 1) put('over');
      if (x.exact && x.n > 10) put('exact');
      if (a >= 1000 && b >= 10 && b <= 99 && x.r > 0 && st.lo && st.hi) put('big');
    }
  } else if (tool === 'duo') {
    // reported only after a gesture on the instrument (a face picked, a divisor tapped, a division written, d moved)
    if (st.face === 'lists' && st.looked) {
      if (a > 100 && b > 100 && pairLists(a, b).common.length >= 4) put('lists');
    } else if (st.face === 'divisions' && st.done) {
      if (euclidLines(a, b).length >= 5) put('chain');
    } else if (st.face === 'probe' && st.moved && Number.isInteger(st.d)) {
      if (st.d > 10 && a % st.d === 0 && b % st.d === 0) put('probe');
    }
  } else if (tool === 'strip') {
    // reported only after the hand moved the piece (`moved`), with the length `k` it holds
    if (st.moved && Number.isInteger(st.k) && st.k > 1) {
      const S = stripOf(a, b, st.k);
      if (S.verdict === 'both' && st.k > 10) put('both');
      if (S.verdict === 'both' && b > 500 && b / st.k < 50) put('big');
      if (S.verdict === 'b' && b > 100) put('split');
    }
  } else if (tool === 'court') {
    // reported only after the hand moved the side (`moved`), with the sides it tried on this court (`tried`)
    if (st.moved && Number.isInteger(st.s)) {
      const C = courtOf(a, st.s);
      const tried = st.tried ?? [];
      if (C.perfect && st.s === C.k && a > 100) put('exact');
      if (!C.perfect && a > 150 && courtSettled(a, tried)) put('bracket');
      if (C.left >= 20 && tried.includes(C.k)) put('most');
    }
  } else if (tool === 'piece') {
    // reported only after the hand moved the rod (`moved`), with the numerator `p` it holds; b is the denominator
    if (st.moved && Number.isInteger(st.p) && st.p > 0) {
      const P = pieceOf(a, b, st.p);
      if (P.verdict === 'fits' && b > 1 && a > 10) put('exact');
      if (P.far === 1 && b > 4) put('one');
      // the difference in tiles, far ÷ (b × b), under one hundredth — and not zero
      if (P.far > 0 && P.far * 100 < b * b) put('close');
    }
  } else if (tool === 'factor') {
    // reported by the instrument after each plank that filled (`planks`, in order) with the gap left (`left`)
    const planks = st.planks ?? [];
    if (planks.length && st.left === 1 && planks.reduce((p, d) => p * d, 1) === a) {
      if (a > 100) put('end');
      if (planks.length >= 6) put('long');
      if (a >= 1000) put('big');
    }
  } else if (tool === 'rules') {
    const lit = digitRules(a).filter((x) => x.ok).length;
    if (a > 0 && lit >= 3) put('three');
    if (a >= 100 && a <= 999 && a % 9 === 0) put('nine');
    if (a > 0 && lit === 6) put('all');
  }
  return add.filter((f) => (QUESTS[tool] ?? []).some((q) => q.id === f));
}

/** A friendly pair for the dice: numbers that make something happen in the instrument. */
export function luckyPair(tool, rand = Math.random) {
  const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  const [al, ah] = tool.range.a;
  const [bl, bh] = tool.range.b;
  if (tool.id === 'paper') return { a: int(120, 999), b: int(6, 39) };
  if (tool.id === 'bracket') return { a: int(150, 2999), b: int(11, 60) };
  if (tool.id === 'rules') return { a: int(10, 999) * (rand() < 0.5 ? 3 : 1), b: 1 };
  if (tool.id === 'factor') {
    // a product of small primes, from 60 to 9 999: a ladder of several planks
    let a = 1;
    while (a < 60) a *= [2, 3, 5, 7, 11, 13][int(0, 5)];
    return { a: a > ah ? 2 * 3 * 5 * 7 : a, b: 1 };
  }
  if (tool.id === 'euclid') return { a: int(12, 48), b: int(5, 30) };
  if (tool.id === 'planks') {
    // two lengths that share a plank longer than 1: something happens as soon as the plank is moved
    const g = int(2, 9);
    return { a: g * int(2, 6), b: g * int(1, 6) };
  }
  if (tool.id === 'duo') {
    // half the time two numbers that share a divisor bigger than 1, half the time two drawn apart
    const g = rand() < 0.5 ? 1 : int(2, 12);
    return { a: g * int(5, 40), b: g * int(5, 40) };
  }
  if (tool.id === 'strip') {
    // a fraction (the lit part not longer than the strip) whose two terms share a divisor bigger than 1, or not, half and half
    const g = rand() < 0.5 ? 1 : int(2, 12);
    const d = int(6, 60);
    return { a: g * int(1, d - 1), b: g * d };
  }
  if (tool.id === 'court') {
    // a court of more than one row, a perfect square once in four draws
    if (rand() < 0.25) {
      const k = int(4, 20);
      return { a: k * k, b: 1 };
    }
    return { a: int(12, ah), b: 1 };
  }
  if (tool.id === 'piece') {
    // a court of more than one tile — a perfect square once in four draws — and a denominator from 2
    const k = int(2, 7);
    return { a: rand() < 0.25 ? k * k : int(2, ah), b: int(2, bh) };
  }
  if (tool.id === 'lists') {
    // two numbers that share a divisor bigger than 1: the two lists meet in more than 1
    const g = int(2, 12);
    return { a: g * int(2, 9), b: g * int(1, 9) };
  }
  if (tool.id === 'divisors' || tool.id === 'common')
    return { a: Math.min(ah, int(12, 72)), b: Math.min(bh, int(8, 60)) };
  const b = int(Math.max(bl, 2), Math.min(bh, 12));
  const q = int(2, 9);
  const r = rand() < 0.5 ? 0 : int(1, b - 1);
  return { a: Math.max(al, Math.min(ah, b * q + r)), b };
}
