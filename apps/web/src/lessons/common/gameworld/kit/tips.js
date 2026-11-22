/**
 * « Astuce » — calculation shortcuts shown AFTER an answer (owner, 2026-11-15), PURE.
 * A tip is given only when a clean one exists for the numbers at hand, and never before the student has answered (it would
 * give the result away). When no shortcut is clearly simpler than the plain computation, the function returns null: a tip
 * that confuses is worse than no tip. Every equality written in a tip is true — the tests re-compute each of them.
 */
const digitSum = (a) =>
  String(a)
    .split('')
    .reduce((s, d) => s + Number(d), 0);
const sumText = (a) => String(a).split('').join(' + ');
/** The no-break space French puts before « : ». */
const NB = '\u00a0';

/** A quick test of divisibility (the rules of the earlier years), when the divisor has one. Decides « divisor or not », not q. */
export function ruleTip(a, b) {
  if (a < 20) return null;
  const last = a % 10;
  if (b === 2)
    return `Le dernier chiffre de ${a} est ${last}${NB}: ${last % 2 ? `il est impair, donc ${a} n’est pas divisible` : `il est pair, donc ${a} est divisible`} par 2.`;
  if (b === 5)
    return `Le dernier chiffre de ${a} est ${last}${NB}: ${last === 0 || last === 5 ? `c’est 0 ou 5, donc ${a} est divisible` : `ce n’est ni 0 ni 5, donc ${a} n’est pas divisible`} par 5.`;
  if (b === 10)
    return `Le dernier chiffre de ${a} est ${last}${NB}: ${last === 0 ? `c’est 0, donc ${a} est divisible` : `ce n’est pas 0, donc ${a} n’est pas divisible`} par 10.`;
  if (b === 3 || b === 9) {
    const s = digitSum(a);
    return `La somme des chiffres de ${a}${NB}: $${sumText(a)} = ${s}$, et ${s} ${s % b === 0 ? 'est' : 'n’est pas'} un multiple de ${b}${NB}: donc ${a} ${a % b === 0 ? 'est' : 'n’est pas'} divisible par ${b}.`;
  }
  return null;
}

/**
 * The shortcut of a Euclidean division a ÷ b: lean on a multiple of b that costs nothing (b × 10, b × 20, and so on), then
 * walk to a. Example, 180 ÷ 19: « 19 × 10 = 190, puis 190 − 19 = 171 ; de 171 à 180, il reste 9 : le reste est 9 ».
 * Returned only when the quotient is big enough for the shortcut to help (q ≥ 8) and the walk is short.
 */
export function divisionTip(a, b) {
  if (b < 2 || a < b) return null;
  const q = Math.floor(a / b);
  const r = a % b;
  if (q < 8) return ruleTip(a, b);
  const tail = (reached) =>
    r === 0
      ? `On tombe juste sur ${a}${NB}: le reste est 0.`
      : `De ${reached} à ${a}, il reste ${r}${NB}: le reste est ${r}.`;
  const units = q % 10;
  const tens = q - units;
  // just under a round quotient (units 8 or 9): start from the round product and take b away
  if (units >= 8) {
    const m = tens + 10;
    const down = m - q;
    let cur = b * m;
    const steps = [];
    for (let i = 0; i < down; i += 1) {
      steps.push(`$${cur} - ${b} = ${cur - b}$`);
      cur -= b;
    }
    return `$${b} \\times ${m} = ${b * m}$ dépasse ${a}, puis ${steps.join(', puis ')} (c’est $${b} \\times ${q}$). ${tail(cur)}`;
  }
  if (tens === 0) return ruleTip(a, b);
  // a round part first, then what is left: 360 ÷ 24 gives 24 × 10 = 240, there remain 120 = 24 × 5
  const base = b * tens;
  const left = a - base;
  if (units === 0) return `$${b} \\times ${tens} = ${base}$. ${tail(base)}`;
  if (units <= 2) {
    let cur = base;
    const steps = [];
    for (let i = 0; i < units; i += 1) {
      steps.push(`$${cur} + ${b} = ${cur + b}$`);
      cur += b;
    }
    return `$${b} \\times ${tens} = ${base}$, puis ${steps.join(', puis ')} (c’est $${b} \\times ${q}$). ${tail(cur)}`;
  }
  return `Je commence par une partie facile${NB}: $${b} \\times ${tens} = ${base}$. Il reste $${a} - ${base} = ${left}$, qui contient $${b} \\times ${units} = ${b * units}$${NB}: le quotient est $${tens} + ${units} = ${q}$${r === 0 ? ' et le reste est 0.' : ` et le reste est $${left} - ${b * units} = ${r}$.`}`;
}

/** The shortcut of a product x × y (a count times a price): split the count in tens and units, or lean on the next ten. */
export function productTip(x, y) {
  if (x < 11 || x > 99) return null;
  const u = x % 10;
  const t = x - u;
  if (u === 0) return null;
  if (u >= 8) {
    const m = t + 10;
    const k = m - x;
    return `$${x} \\times ${y} = ${m} \\times ${y} - ${k} \\times ${y} = ${m * y} - ${k * y} = ${x * y}$.`;
  }
  return `Je décompose ${x} en ${t} + ${u}${NB}: $${t} \\times ${y} + ${u} \\times ${y} = ${t * y} + ${u * y} = ${x * y}$.`;
}
