/**
 * « mode papier » — PURE logic of the paper mode: what a student WRITES and THINKS on an exam sheet.
 *
 * `longDivision(a, b)` poses the Euclidean division as it is drawn on paper (dividend on the left, divisor top right,
 * quotient under it) and returns its steps one by one: the part of the dividend looked at, the digit of the quotient, the
 * product subtracted, what is left, the digit brought down. `thinking` says each step aloud, the way a student should
 * reason; `conclusion` gives the check and the sentence to write. `twin` builds ANOTHER division of the same nature
 * (fits / does not fit) with different numbers: the model the student may read BEFORE answering never shows his own answer.
 */
export function longDivision(a, b) {
  const digits = String(a).split('').map(Number);
  const steps = [];
  let cur = 0;
  let started = false;
  digits.forEach((d, i) => {
    cur = cur * 10 + d;
    if (!started && cur < b && i < digits.length - 1) return; // still gathering digits: « 7 < 36, I take 75 »
    started = true;
    const digit = Math.floor(cur / b);
    const product = digit * b;
    const rest = cur - product;
    steps.push({ part: cur, digit, product, rest, col: i, next: i < digits.length - 1 ? digits[i + 1] : null });
    cur = rest;
  });
  return { a, b, q: Math.floor(a / b), r: a % b, steps, width: digits.length };
}

/** A division of the same nature with other numbers (a close divisor, another quotient, remainder 0 or not). */
export function twin(a, b) {
  const q = Math.floor(a / b);
  const r = a % b;
  const b2 = b >= 9 ? b - 2 : b + 2;
  const q2 = q >= 12 ? q - 3 : q + 3;
  const r2 = r === 0 ? 0 : Math.max(1, Math.min(b2 - 1, r));
  return { a: b2 * q2 + r2, b: b2 };
}

/** The rows written under the dividend once `shown` steps are done: [{ kind: 'minus' | 'rest', text, end (column of the last digit) }]. */
export function paperRows(d, shown) {
  const rows = [];
  for (let k = 0; k < Math.min(shown, d.steps.length); k += 1) {
    const s = d.steps[k];
    const brought = k + 1 < shown && k + 1 < d.steps.length;
    rows.push({ kind: 'minus', text: String(s.product), end: s.col });
    rows.push({
      kind: 'rest',
      text: brought ? `${s.rest}${s.next}` : String(s.rest),
      end: brought ? s.col + 1 : s.col,
      last: k === d.steps.length - 1,
    });
  }
  return rows;
}
export const quotientSoFar = (d, shown) =>
  d.steps
    .slice(0, shown)
    .map((s) => s.digit)
    .join('');

/** What the student says to himself at step i (0-based) — short sentences, `$…$` is maths. */
const NB = '\u00a0'; // the no-break space French puts before « : »
const NNB = '\u202f'; // the narrow one, before « ? »

export function thinking(d, i) {
  const s = d.steps[i];
  const { b } = d;
  const lines = [];
  if (i === 0 && s.col > 0)
    lines.push(`${String(d.a).slice(0, s.col)} est plus petit que ${b}${NB}: je prends ${s.part}.`);
  if (s.digit === 0) lines.push(`${s.part} est plus petit que ${b}${NB}: ${b} n’y va pas. J’écris 0 au quotient.`);
  else {
    lines.push(`Dans ${s.part}, combien de fois ${b}${NNB}?`);
    lines.push(
      `$${b} \\times ${s.digit} = ${s.product}$ et $${b} \\times ${s.digit + 1} = ${b * (s.digit + 1)}$ dépasse ${s.part}${NB}: j’écris ${s.digit}.`,
    );
    lines.push(`Je soustrais${NB}: $${s.part} - ${s.product} = ${s.rest}$.`);
  }
  if (s.next != null) lines.push(`J’abaisse le chiffre ${s.next}${NB}: j’obtiens ${s.rest * 10 + s.next}.`);
  else lines.push(`Il n’y a plus de chiffre à abaisser${NB}: le quotient est ${d.q} et le reste est ${d.r}.`);
  return lines;
}

/** After the division: the check every sheet should carry, and the sentence that answers the question. */
export function conclusion(d) {
  return {
    check: `Je vérifie${NB}: $${d.b} \\times ${d.q} + ${d.r} = ${d.b * d.q + d.r}$, et le reste ${d.r} est plus petit que ${d.b}.`,
    equality: `$${d.a} = ${d.b} \\times ${d.q}${d.r ? ` + ${d.r}` : ''}$`,
    sentence:
      d.r === 0
        ? `Le reste est 0, donc ${d.b} est un diviseur de ${d.a}.`
        : `Le reste ${d.r} n’est pas nul, donc ${d.b} n’est pas un diviseur de ${d.a}.`,
  };
}

/** The six gestures of an exam answer — shown as a strip in paper mode; the model lights the one it is doing. */
export const METHOD = [
  { id: 'read', text: 'Je lis et je souligne les données' },
  { id: 'ask', text: 'Je repère ce qu’on demande' },
  { id: 'tool', text: 'Je choisis la règle' },
  { id: 'compute', text: 'Je calcule sur ma feuille' },
  { id: 'verify', text: 'Je vérifie' },
  { id: 'write', text: 'Je rédige la réponse par une phrase' },
];
