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

// Keyed by the item id of the learning net. EMPTY until the French net exists (2026-11-22): the Algerian families (their
// question generators, rules and memos) are in git, `git show 049380e:apps/web/src/lessons/common/launchkit/families.js`.
export const FAMILIES = {};

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

/** The form of the next question of a level: one not used yet in this launch when the family has another. */
export function pickForm(item, level, used = []) {
  const forms = formsOf(item, level);
  return forms.find((f) => !used.includes(`${level}:${f}`)) ?? forms[used.length % forms.length];
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
