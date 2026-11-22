/**
 * Les NOMBRES RELATIFS DÉCIMAUX sous le « المسبار » (2AM, unité 3 « الأعداد النسبية », درس « مقارنة وترتيب أعداد نسبية »,
 * 2026-10-21) — arithmétique EXACTE en BigInt, sans aucune virgule flottante.
 *
 * Un nombre est un BigInt : le nombre de CENTIÈMES (−4,5 → −450n). Le labo `zero-probe` tient la DISTANCE à zéro `d` ≥ 0 d'un
 * capteur ; le côté (« فوق » / « تحت » le zéro) est un autre geste ; le nombre relatif est leur SORTIE :
 * `fromSideDistance('below', 5)` = −5. Deux nombres négatifs : le plus petit est celui dont la distance à zéro est la plus grande ;
 * un négatif est plus petit que le zéro et que tout positif — `cmp` ne fait que comparer des entiers, la règle se VOIT dans le labo.
 *
 * Écriture : la virgule décimale à l'écran (`text`, `tex`), le signe moins ASCII `-` dans les données ; `parse` accepte aussi
 * « − » (U+2212), le point, et les chiffres arabes-indiens ; de 0 à 2 décimales.
 *
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/relative.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */

/** Distance maximale à zéro du câble (en unités). */
export const MAX_D = 10;
/** Le pas d'un niveau, en centièmes : 100n = 1 (مبتدئ), 10n = 0,1 (متقدم). */
export const STEP_UNIT = 100n;
export const STEP_TENTH = 10n;
export const SIDES = Object.freeze(['below', 'above']);

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const abs = (x) => (x < 0n ? -x : x);

/** « -4,5 », « −4.5 », « ٣,٥ », 4.5 (nombre), 450n (centièmes) → centièmes (BigInt). Lève si illisible ou plus de 2 décimales. */
export function parse(x) {
  if (typeof x === 'bigint') return x;
  if (typeof x === 'number') {
    if (!Number.isFinite(x)) throw new Error(`nombre illisible : ${x}`);
    return BigInt(Math.round(x * 100));
  }
  const s = String(x).trim().replace(/−/g, '-').replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c))).replace(/[,٫،]/g, '.').replace(/\s+/g, '');
  const m = /^([+-]?)(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) throw new Error(`nombre illisible : ${x}`);
  const h = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0') || '0');
  return m[1] === '-' ? -h : h;
}

/** Le nombre relatif d'un capteur à `d` du zéro, `side` 'above' (+) ou 'below' (−). `d` ≥ 0 (texte, nombre ou centièmes). */
export function fromSideDistance(side, d) {
  if (!SIDES.includes(side)) throw new Error(`côté inconnu : ${side}`);
  const h = parse(d);
  if (h < 0n) throw new Error('distance négative');
  return side === 'below' ? -h : h;
}

/** −1 | 0 | 1. */
export const cmp = (a, b) => { const p = parse(a); const q = parse(b); return p < q ? -1 : p > q ? 1 : 0; };
/** La distance à zéro (centièmes). */
export const distance = (a) => abs(parse(a));
/** Le côté d'un nombre : 'below' | 'above' | 'zero'. */
export const sideOf = (a) => { const p = parse(a); return p < 0n ? 'below' : p > 0n ? 'above' : 'zero'; };

/** « -4,5 » : virgule décimale, zéros inutiles retirés, signe moins ASCII (l'écran le met en « − » dans un îlot LTR). */
export function text(a) {
  const p = parse(a);
  const h = abs(p);
  const whole = h / 100n;
  const frac = String(h % 100n).padStart(2, '0').replace(/0+$/, '');
  return `${p < 0n ? '-' : ''}${whole}${frac ? `,${frac}` : ''}`;
}
/** LaTeX : « -4{,}5 » (virgule sans espace). */
export const tex = (a) => text(a).replace(',', '{,}');

/** Une tâche normalisée en centièmes ; lève si mal formée. */
function norm(task) {
  if (task.kind === 'beat') {
    if (task.want !== 'lower' && task.want !== 'higher') throw new Error('want inconnu');
    return { ...task, A: parse(task.a) };
  }
  if (task.kind === 'between') {
    const lo = parse(task.lo); const hi = parse(task.hi);
    if (lo >= hi) throw new Error('lo doit être < hi');
    return { ...task, LO: lo, HI: hi };
  }
  throw new Error(`tâche inconnue : ${task.kind}`);
}

/**
 * Le jugement EXACT d'un essai : le capteur B à `d` du zéro du côté `side`.
 * `beat` : B < A (`want` 'lower') ou B > A ('higher') ; `between` : lo < B < hi (strict). Si la tâche IMPOSE un côté (`side`) ou veut
 * les deux (`both`), B doit réellement être de ce côté : un câble de longueur 0 n'est d'aucun côté et ne réussit pas.
 * Retourne { ok, value (centièmes), order (cmp B à A, ou -1/0/1 B à l'intervalle : -1 sous lo, 0 entre, 1 au-dessus de hi), credit }
 * — `credit` : le côté crédité à l'essai ('below' | 'above') ou null (d = 0).
 */
export function judge(task, side, d) {
  const t = norm(task);
  const dh = parse(d);
  const B = fromSideDistance(side, dh);
  const credit = dh > 0n ? side : null;
  const sideOk = t.side ? (dh > 0n && side === t.side) : (t.both ? dh > 0n : true);
  if (t.kind === 'beat') {
    const order = cmp(B, t.A);
    const hit = t.want === 'lower' ? order < 0 : order > 0;
    return { ok: hit && sideOk, value: B, order, credit };
  }
  const order = B <= t.LO ? -1 : B >= t.HI ? 1 : 0;
  return { ok: order === 0 && sideOk, value: B, order, credit };
}

/** Toutes les (côté, distance) qui réussissent, `d` de 0 à MAX_D par `stepH` centièmes. [{ side, d (centièmes), value }] */
export function solutions(task, stepH = STEP_TENTH) {
  const t = norm(task);
  const out = [];
  const sides = t.side ? [t.side] : ['above', 'below'];
  for (const side of sides) {
    for (let d = 0n; d <= BigInt(MAX_D) * 100n; d += BigInt(stepH)) {
      if (d === 0n && side === 'below') continue; // 0 est le même point des deux côtés
      const j = judge(t, side, d);
      if (j.ok) out.push({ side, d, value: j.value });
    }
  }
  return out;
}
export const solutionsBetween = (task, stepH = STEP_TENTH) => { if (task.kind !== 'between') throw new Error('pas une tâche between'); return solutions(task, stepH); };

/** Aucune longueur ne convient ? (le bouton « لا يوجد طول يحقّق ذلك » est alors juste). */
export const isImpossible = (task, stepH = STEP_TENTH) => solutions(task, stepH).length === 0;

/** UNE longueur qui convient (la plus courte, du côté « فوق » à égalité) ; null s'il n'y en a pas. */
export function sample(task, stepH = STEP_TENTH) {
  const all = solutions(task, stepH);
  if (!all.length) return null;
  return all.reduce((best, s) => (s.d < best.d || (s.d === best.d && s.side === 'above' && best.side !== 'above') ? s : best));
}

/** Un nombre saisi dans « جرّب أعدادك » : |A| ≤ 9,9, de 0 à 2 décimales ; renvoie le texte normalisé (« -2,5 ») ou null. */
export function parseFree(raw, limit = 990n) {
  try {
    const h = parse(String(raw));
    return abs(h) <= limit ? text(h) : null;
  } catch { return null; }
}

/* ── `corniche-ruler` (2AM, درس « التعليم على مستقيم مدرّج », 2026-10-29) : origine et valeur d'une graduation ── */

/** Le nombre opposé (centièmes). */
export const opposite = (a) => -parse(a);

/** L'abscisse (centièmes) d'un point de position `pos` : la distance signée à l'origine, dans l'unité du monde. Positions et pas en centièmes. */
export const abscissaOf = (pos, origin) => parse(pos) - parse(origin);
/** Le point de position monde pour l'abscisse `x` quand l'origine est `origin`. */
export const positionOf = (x, origin) => parse(x) + parse(origin);

/**
 * `boardFit(values, step, half = 6)` : la planche a `half` graduations de chaque côté du zéro. `off` : valeurs hors de ±half graduations ;
 * `between` : valeurs qui ne sont pas sur une graduation ; `fits` : aucune hors de la planche.
 */
export function boardFit(values, step, half = 6) {
  const s = parse(step);
  const vs = values.map(parse);
  const off = vs.filter((v) => abs(v) > BigInt(half) * s);
  const between = vs.filter((v) => v % s !== 0n);
  return { fits: off.length === 0, off, between };
}

/** La plus petite valeur de `steps` qui garde toutes les valeurs sur la planche ET sur des graduations ; sinon null. */
export function smallestStep(values, steps, half = 6) {
  const sorted = steps.map(parse).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  for (const s of sorted) {
    const r = boardFit(values, s, half);
    if (r.fits && r.between.length === 0) return s;
  }
  return null;
}

/* ── `balloon-ballast` (2AM, درس « جمع وطرح عددين نسبيين », 2026-10-29) : somme et différence de deux relatifs (E2) ── */

/** La somme exacte de deux relatifs (centièmes). */
export const add = (a, b) => parse(a) + parse(b);
/** La différence : a − b = a + opposé(b). */
export const sub = (a, b) => add(a, opposite(b));
/**
 * Le cas de la règle de la somme a + b : 'zero' (un terme nul), 'opposites' (a = −b ≠ 0), 'same' (même signe) ou 'different'.
 */
export function ruleCase(a, b) {
  const p = parse(a); const q = parse(b);
  if (p === 0n || q === 0n) return 'zero';
  if (p === -q) return 'opposites';
  return (p < 0n) === (q < 0n) ? 'same' : 'different';
}
/** La charge minimale d'une altitude entière a (en mètres) : |a| nacelles de flamme ou |a| sacs. a est un entier (centièmes multiples de 100). */
export function ballastOf(a) {
  const p = parse(a);
  if (p % 100n !== 0n) throw new Error('altitude non entière');
  const n = Number(abs(p) / 100n);
  return p >= 0n ? { tokens: n, bags: 0 } : { tokens: 0, bags: n };
}

/* ── `dig-grid` (2AM, درس « تعليم نقطة في المستوي », 2026-10-29) : points du plan { x, y } en centièmes (E4) ── */

/** Un point { x, y } depuis deux nombres (texte, nombre ou centièmes). */
export const point = (x, y) => ({ x: parse(x), y: parse(y) });
/** « (-1,5 ; 2,5) » : l'abscisse d'abord, séparées par « ; » (signe moins ASCII). */
export const pointText = (p) => `(${text(p.x)} ; ${text(p.y)})`;
/** Le quadrant 1 … 4 (sens trigonométrique), ou 'axisX' (ordonnée nulle), 'axisY' (abscisse nulle), 'origin'. */
export function quadrantOf(p) {
  if (p.x === 0n && p.y === 0n) return 'origin';
  if (p.y === 0n) return 'axisX';
  if (p.x === 0n) return 'axisY';
  if (p.x > 0n) return p.y > 0n ? 1 : 4;
  return p.y > 0n ? 2 : 3;
}
/** Le symétrique par rapport à l'axe des abscisses (l'ordonnée change de signe) — symétrie axiale seulement. */
export const symX = (p) => ({ x: p.x, y: -p.y });
/** Le symétrique par rapport à l'axe des ordonnées (l'abscisse change de signe). */
export const symY = (p) => ({ x: -p.x, y: p.y });
/** Les coordonnées d'un point de position monde `world` quand le piquet (origine) est en `origin`. */
export const coordsOf = (world, origin) => ({ x: world.x - origin.x, y: world.y - origin.y });
/** Le piquet qui donne au point `world` les coordonnées `wanted`. */
export const originFor = (world, wanted) => ({ x: world.x - wanted.x, y: world.y - wanted.y });
/** Un seul piquet pour plusieurs trouvailles `[{ world, wanted }]` : le piquet, ou null si les relevés sont incompatibles. */
export function consistent(pairs) {
  if (!pairs.length) return null;
  const o = originFor(pairs[0].world, pairs[0].wanted);
  return pairs.every((q) => { const r = originFor(q.world, q.wanted); return r.x === o.x && r.y === o.y; }) ? o : null;
}
/** « (-1,5 ; 2,5) », « -1,5 ; 2,5 », « ( ٣ ؛ 4 ) » → { x, y } ; null si illisible. */
export function parsePoint(raw) {
  const parts = String(raw ?? '').replace(/[⁦⁩()]/g, '').split(/[;؛]/).map((s) => s.trim());
  if (parts.length !== 2 || parts.some((s) => s === '')) return null;
  try { return { x: parse(parts[0]), y: parse(parts[1]) }; } catch { return null; }
}

/* ── `tug-rope` (2AM, درس « حساب مجموع جبري », 2026-10-29) : chaînes de additions/soustractions de relatifs (E3) ── */

/**
 * `terms(text)` → arbre de termes `[{ op: '+' | '-', value } | { op, group: [...] }]` : `op` est l'opération qui PRÉCÈDE le terme (le premier : '+').
 * Lit « (−9) − (+2) + (−5) − (−4) », « −9 − 2 − 5 + 4 » et « (+12) − [(−6) − (−2) + (+9)] » : « ( ) » et « [ ] » d'UN nombre sont ses crochets de signe,
 * ceux de plusieurs termes forment un groupe imbriqué. Lève si illisible.
 */
export function terms(raw) {
  const s = String(raw).replace(/[⁦⁩\s]/g, '').replace(/−/g, '-').replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c))).replace(/\[/g, '(').replace(/\]/g, ')');
  let pos = 0;
  const fail = () => { throw new Error(`somme illisible : ${raw}`); };
  function number() {
    const m = /^[+-]?\d+(?:[.,٫]\d{1,2})?/.exec(s.slice(pos));
    if (!m) fail();
    pos += m[0].length;
    return parse(m[0].replace('+', ''));
  }
  /** un opérande : nombre signé, ou « ( expr ) » ; renvoie { value } ou { group }. */
  function operand(signed) {
    if (s[pos] === '(') {
      pos += 1;
      const inner = expr(true);
      if (s[pos] !== ')') fail();
      pos += 1;
      return inner.length === 1 && inner[0].value !== undefined && inner[0].lone ? { value: inner[0].value } : { group: inner.map(({ lone, ...r }) => r) };
    }
    if (!signed && !/[\d]/.test(s[pos] ?? '')) fail();
    return { value: number() };
  }
  function expr(nested) {
    const out = [];
    let first = true;
    while (pos < s.length && s[pos] !== ')') {
      let op = '+';
      if (first) {
        if (s[pos] === '-' && s[pos + 1] === '(') { op = '-'; pos += 1; }
        else if (s[pos] === '+' && s[pos + 1] === '(') pos += 1;
      } else {
        if (s[pos] !== '+' && s[pos] !== '-') fail();
        op = s[pos]; pos += 1;
      }
      const o = operand(first);
      // un nombre sans signe après un opérateur : « 5 − 6 » (écriture simplifiée) ; un nombre signé après un opérateur doit être entre parenthèses
      out.push({ op, ...o, ...(first && nested ? { lone: true } : {}) });
      first = false;
    }
    if (!out.length) fail();
    if (!nested && pos < s.length) fail();
    if (out.length > 1) out.forEach((t) => { delete t.lone; });
    return out;
  }
  const tree = expr(false);
  return tree.map(({ lone, ...t }) => t);
}

/** Les termes signés (addends) de l'arbre ; un groupe vaut son résultat. `-x` devient `+opposé(x)` (le groupe est calculé D'ABORD). */
export function asSum(nodes) {
  return nodes.map((n) => {
    const v = n.group ? algebraicSum(n.group) : n.value;
    return n.op === '-' ? -v : v;
  });
}
/** La somme algébrique, de gauche à droite, les groupes d'abord (centièmes). */
export function algebraicSum(nodes) {
  return nodes.reduce((acc, n) => {
    const v = n.group ? algebraicSum(n.group) : n.value;
    return n.op === '-' ? acc - v : acc + v;
  }, 0n);
}
/** Termes signés → { pos, neg, posSum, negSum, total } (les termes nuls sont ignorés). */
export function groupBySign(addends) {
  const pos = addends.filter((x) => x > 0n);
  const neg = addends.filter((x) => x < 0n);
  const posSum = pos.reduce((a, b) => a + b, 0n);
  const negSum = neg.reduce((a, b) => a + b, 0n);
  return { pos, neg, posSum, negSum, total: posSum + negSum };
}
/** L'écriture simplifiée des termes signés : « -9 - 2 - 5 + 4 » (signe moins ASCII, virgule décimale). */
export function simplifiedText(addends) {
  return addends.map((x, i) => {
    const t = text(x < 0n ? -x : x);
    if (i === 0) return x < 0n ? `-${t}` : t;
    return `${x < 0n ? '-' : '+'} ${t}`;
  }).join(' ');
}
/** L'écriture avec parenthèses : « (-9) - (+2) + (-5) » pour des termes `[{ op, value }]` plats. */
export const bracketText = (nodes) => nodes.map((n, i) => {
  const v = `(${n.value < 0n ? '-' : '+'}${text(n.value < 0n ? -n.value : n.value)})`;
  return i === 0 ? v : `${n.op} ${v}`;
}).join(' ');

/* ── `gap-caliper` (2AM, درس « المسافة بين نقطتين على مستقيم مدرّج », 2026-10-29) : la distance entre deux abscisses (E5) ── */

/** La distance entre deux points d'abscisses a et b : l'abscisse la plus grande moins la plus petite — toujours ≥ 0 et symétrique (AB = BA). */
export const gap = (a, b) => { const p = parse(a); const q = parse(b); return p >= q ? sub(p, q) : sub(q, p); };
/** Les DEUX abscisses à la distance d ≥ 0 d'un point a : [a − d, a + d] (une seule si d = 0). */
export function pointsAt(a, d) {
  const dist = parse(d);
  if (dist < 0n) throw new Error('une distance est positive');
  const lo = sub(a, dist);
  const hi = add(a, dist);
  return lo === hi ? [lo] : [lo, hi];
}
/** L'abscisse du milieu de [AB] = la plus petite + la moitié de la distance ; null si elle exige un troisième chiffre décimal (centièmes impairs). */
export function midpointAbscissa(a, b) {
  const lo = parse(a) <= parse(b) ? parse(a) : parse(b);
  const g = gap(a, b);
  return g % 2n === 0n ? add(lo, g / 2n) : null;
}
