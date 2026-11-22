/**
 * « عُدّة الانطلاق » — the question FAMILIES, one per earlier الكفاءة (programme item of the learning net), PURE.
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
 * question is re-computed there). Phase 1 (2026-11-17): the two prerequisites of « التعرّف على قاسم لعدد طبيعي », then
 * « التعرّف على قاسم » itself, which the next lesson stands on; 2026-11-18: the 2AM Euclidean division (any divisor), the
 * second core tool of « قواسم عدد طبيعي » and « خواص قواسم » and a core tool of the PGCD lessons; 2026-11-19: the divisor
 * lists of `4am.m1.r02`, the other core tool of the PGCD lessons.
 * 2026-11-20: the PGCD of `4am.m1.r03`, the one core tool of « العددان الأوّليّان فيما بينهما » (never a pair whose PGCD is 1).
 * A sort card is a number or an equality (`text`), or a SENTENCE in Arabic (`say: true`, drawn right-to-left, smaller).
 * A card the student must ACCEPT may name the mistake of refusing it (`miss`), as a `trap` names the mistake of accepting.
 */
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
const digitSum = (n) =>
  String(n)
    .split('')
    .reduce((s, d) => s + Number(d), 0);
const sumText = (n) => String(n).split('').join(' + ');
const S = (slot, label, w) => ({ slot, label, w });

/** The named mistakes: what the workshop says first when an answer showed one. Never shown during a station. */
export const MISTAKES = {
  'rest-too-big': 'انتبه: الباقي دائمًا أصغر من المقسوم عليه.',
  'rest-negative': 'انتبه: في القسمة الإقليدية نضيف الباقي، ولا نطرح.',
  'equality-false': 'انتبه: تحقّق من المساواة — احسب الجداء ثمّ أضف الباقي.',
  swapped: 'انتبه: لا تخلط بين حاصل القسمة والباقي.',
  overshoot: 'انتبه: المضاعف الذي نبحث عنه لا يتجاوز العدد.',
  'not-greatest': 'انتبه: نبحث عن أكبر مضاعف لا يتجاوز العدد.',
  'not-multiple': 'انتبه: الراية تقف على مضاعف — عدد من جدول الضرب.',
  'digit-anywhere': 'انتبه: القاعدة تنظر إلى آخر رقم فقط.',
  'last-digit': 'انتبه: في قاعدتي 3 و 9 نجمع الأرقام، ولا ننظر إلى آخر رقم.',
  'three-for-nine': 'انتبه: مجموع الأرقام يجب أن يكون في جدول 9، لا في جدول 3 فقط.',
  'even-for-four': 'انتبه: العدد الزوجي لا يقبل دائمًا القسمة على 4 — انظر إلى العدد المكوَّن من آخر رقمين.',
  'product-false': 'انتبه: تحقّق من المساواة — احسب الجداء.',
  'rest-not-zero': 'انتبه: العدد قاسم عندما يكون باقي القسمة 0 — تحقّق بالقسمة.',
  'multiple-for-divisor': 'انتبه: لا تخلط بين القاسم والمضاعف — قاسم العدد لا يتجاوزه.',
  'sentence-reversed': 'انتبه: ترتيب العددين مهمّ — نقول « 6 قاسم للعدد 42 » و « 42 مضاعف للعدد 6 ».',
  'one-and-itself': 'انتبه: العدد 1 والعدد نفسه قاسمان دائمًا.',
  'partner-forgot': 'انتبه: كلّ قسمة تامّة تعطي قاسمين معًا — العدد المجرَّب وشريكه.',
  'stop-early': 'انتبه: نجرّب كلّ عدد مربّعه لا يتجاوز العدد، ولا نتوقّف قبله.',
  'quotient-zero': 'انتبه: إذا كان العدد أصغر من المقسوم عليه، فالحاصل 0 والباقي هو العدد نفسه.',
  'table-slip': 'انتبه: راجع جدول الضرب — جوابك جداء عدد مجاور.',
  'borrow-forgot': 'انتبه: إذا كان رقم الآحاد أصغر، نستلف عشرة — لا نطرح الرقم الصغير من الكبير.',
  'order-ops': 'انتبه: نحسب الجداء أوّلًا، ثمّ نضيف.',
  'add-for-sub': 'انتبه: الطرح يُنقص العدد — الراية ترجع نحو 0.',
  'common-not-greatest': 'انتبه: نبحث عن أكبر القواسم المشتركة، لا عن أيّ قاسم مشترك.',
  'divisor-of-one': 'انتبه: القاسم المشترك يقسم العددين معًا — تحقّق بالقسمة على كلّ واحد منهما.',
  'smaller-not-divisor': 'انتبه: العدد الأصغر ليس قاسمًا مشتركًا إذا ترك باقيًا في قسمة الأكبر عليه.',
  'subtract-not-divide': 'انتبه: نقسم البسط والمقام على العدد نفسه — لا نطرح منهما العدد نفسه.',
  'one-term-only': 'انتبه: نقسم البسط والمقام معًا على العدد نفسه، لا أحدهما فقط.',
  'power-times': 'انتبه: الأُسّ يقول كم مرّة نضرب العدد في نفسه — لا نضرب العدد في الأُسّ.',
  'square-sign': 'انتبه: جداء عددين سالبين موجب، فمربّع عدد سالب موجب.',
  'odd-sign': 'انتبه: جداء ثلاثة أعداد سالبة سالب — الأُسّ الفردي يُبقي الإشارة.',
  'decimal-places': 'انتبه: في جداء عددين عشريين، عدد الأرقام بعد الفاصلة هو مجموع أرقامهما بعد الفاصلة.',
  'fraction-one-term': 'انتبه: في مربّع كسر نضرب البسط في نفسه والمقام في نفسه — كليهما.',
};

// ───────────────────────── 1am.m1.r01 — الجمع والطرح والضرب ─────────────────────────
// What the Euclidean division of 1AM stands on (the net's `requires`): a product of the table, a difference « what is left »,
// and the recomposition « b × q + r » computed in the right order. A question of this family carries its operation in
// `calc` ({ op, x, y, z }): `grade` re-computes the value from it — never a stored answer.
const gcdOf = (x, y) => (y === 0 ? x : gcdOf(y, x % y));
const CALC = {
  times: (c) => c.x * c.y,
  minus: (c) => c.x - c.y,
  timesPlus: (c) => c.x * c.y + c.z,
  pgcd: (c) => gcdOf(c.x, c.y), // « 4am.m1.r03 »: PGCD(x ; y) = ▢
  // « 1am.m5.r02 »: n/d = m/▢ (side 'bottom') or n/d = ▢/m (side 'top') — the term that keeps the value
  frac: (c) => (c.side === 'bottom' ? (c.d * c.m) / c.n : (c.n * c.m) / c.d),
  // « 3am.m3.r06 »: xᵉ = ▢ for a whole base (a fraction base is judged by `gradePower`, term by term)
  pow: (c) => c.x ** c.e,
};
const calcValue = (c) => CALC[c.op](c);
/** The difference written digit by digit, the small digit taken from the big one (the borrow forgotten). */
const borrowless = (x, y) => {
  const [a, b] = [String(x), String(y).padStart(String(x).length, '0')];
  return Number([...a].map((d, i) => Math.abs(Number(d) - Number(b[i]))).join(''));
};
const calcText = (c) =>
  c.op === 'minus' ? `${c.x} - ${c.y}` : c.op === 'times' ? `${c.x} \\times ${c.y}` : `${c.x} \\times ${c.y} + ${c.z}`;
const calcTokens = (c) => {
  const w = String(calcValue(c)).length;
  const head =
    c.op === 'minus'
      ? [String(c.x), '−', String(c.y)]
      : c.op === 'times'
        ? [String(c.x), '×', String(c.y)]
        : [String(c.x), '×', String(c.y), '+', String(c.z)];
  return [...head, '=', S('v', 'الناتج', w)];
};
/** A two-digit subtraction that needs a borrow: the units digit of x is smaller than that of y. */
const borrowPair = (rand, lo, hi) => {
  for (let i = 0; i < 200; i += 1) {
    const x = int(rand, lo, hi);
    const y = int(rand, 13, x - 10);
    if (x % 10 < y % 10) return { x, y };
  }
  return { x: 72, y: 47 };
};

function calcWrite(rand, level, first) {
  const op = first
    ? 'times'
    : level === 1
      ? pick(rand, ['times', 'minus'])
      : pick(rand, ['times', 'minus', 'timesPlus']);
  let c;
  if (op === 'times')
    c =
      level === 1
        ? first
          ? { op, x: int(rand, 3, 5), y: int(rand, 3, 5) }
          : { op, x: int(rand, 3, 9), y: int(rand, 3, 9) }
        : { op, x: int(rand, 12, 29), y: int(rand, 3, 9) };
  else if (op === 'minus')
    c =
      level === 1
        ? {
            op,
            ...(() => {
              const x = int(rand, 30, 69);
              return { x, y: int(rand, 11, x - 3) };
            })(),
          }
        : { op, ...borrowPair(rand, 120, 199) };
  else {
    const x = int(rand, 6, 9);
    c = { op, x, y: int(rand, 6, 12), z: int(rand, 1, x - 1) };
  }
  const prompt =
    c.op === 'times'
      ? `في كلّ علبة ${c.y} أقلام، وعدد العلب ${c.x}. كم قلمًا في المجموع؟`
      : c.op === 'minus'
        ? `مع سارة ${c.x} دج، اشترت كرّاسًا بـ ${c.y} دج. كم بقي معها؟`
        : `في كلّ صفيحة ${c.x} بيضات، وعدد الصفائح ${c.y}، وخارج الصفائح ${c.z} من البيض. كم بيضة في المجموع؟`;
  return { gesture: 'write', calc: c, prompt, tokens: calcTokens(c) };
}

/** The flag on « a − d »: the number a is pinned on the 0–60 line, the student counts back d. */
function calcPlace(rand) {
  const a = int(rand, 25, 58);
  const d = int(rand, 3, 9);
  return {
    gesture: 'place',
    a,
    max: 60,
    target: a - d,
    calc: { op: 'minus', x: a, y: d },
    prompt: `العدد ${a} مثبَّت على المستقيم. اسحب الراية إلى ناتج $${a} - ${d}$.`,
  };
}

/** Three equalities: true, or false the way a student slips — a neighbour of the table, the sum before the product, the borrow. */
function calcSort(rand) {
  const make = (kind, id) => {
    const card = (c, shown, trap = null) => ({
      id,
      text: `$${calcText(c)} = ${shown}$`,
      bin: shown === calcValue(c) ? 'yes' : 'no',
      trap,
    });
    if (kind === 'times' || kind === 'slip') {
      const c = { op: 'times', x: int(rand, 6, 9), y: int(rand, 6, 9) };
      return kind === 'times' ? card(c, calcValue(c)) : card(c, c.x * (c.y + pick(rand, [-1, 1])), 'table-slip');
    }
    if (kind === 'tp' || kind === 'order') {
      const x = int(rand, 4, 9);
      const c = { op: 'timesPlus', x, y: int(rand, 4, 9), z: int(rand, 2, x - 1) };
      return kind === 'tp' ? card(c, calcValue(c)) : card(c, c.x * (c.y + c.z), 'order-ops');
    }
    const c = { op: 'minus', ...borrowPair(rand, 52, 98) };
    return kind === 'minus' ? card(c, calcValue(c)) : card(c, borrowless(c.x, c.y), 'borrow-forgot');
  };
  const kinds = shuffle(
    rand,
    pick(rand, [
      ['tp', 'order', 'borrow'],
      ['times', 'order', 'minus'],
      ['minus', 'borrow', 'slip'],
      ['tp', 'slip', 'times'],
      ['order', 'tp', 'borrow'],
    ]),
  );
  const cards = [];
  for (const kind of kinds) {
    let c = make(kind, `c${cards.length + 1}`);
    for (let i = 0; i < 20 && cards.some((o) => o.text === c.text); i += 1) c = make(kind, c.id);
    cards.push(c);
  }
  return {
    gesture: 'sort',
    prompt: 'هل كلّ مساواة صحيحة؟ أرسلها إلى صندوقها.',
    bins: [
      { id: 'yes', label: 'صحيحة' },
      { id: 'no', label: 'خاطئة' },
    ],
    cards,
  };
}

/** The worked example answers the mistake shown: the order (product first), the borrow, or the product of the table. */
function calcExample(rand, level, { mistake = null } = {}) {
  if (mistake === 'order-ops') {
    const x = int(rand, 6, 9);
    const [y, z] = [int(rand, 4, 9), int(rand, 1, x - 1)];
    return {
      title: 'نضرب أوّلًا، ثمّ نضيف',
      steps: [
        `أحسب الجداء أوّلًا: $${x} \\times ${y} = ${x * y}$.`,
        `ثمّ أضيف: $${x * y} + ${z} = ${x * y + z}$.`,
        `أكتب: $${x} \\times ${y} + ${z} = ${x * y + z}$.`,
      ],
    };
  }
  if (mistake === 'borrow-forgot' || mistake === 'add-for-sub') {
    const { x, y } = borrowPair(rand, 52, 98);
    const [xt, xu, yt, yu] = [Math.floor(x / 10), x % 10, Math.floor(y / 10), y % 10];
    return {
      title: 'الطرح مع الاستلاف',
      steps: [
        `في الآحاد ${xu} أصغر من ${yu}: أستلف عشرة، $${xu + 10} - ${yu} = ${xu + 10 - yu}$.`,
        `في العشرات بقي ${xt - 1}: $${xt - 1} - ${yt} = ${xt - 1 - yt}$.`,
        `أكتب: $${x} - ${y} = ${x - y}$.`,
        `أتحقّق بالجمع: $${x - y} + ${y} = ${x}$.`,
      ],
    };
  }
  if (level === 1) {
    const [x, y] = [int(rand, 4, 9), int(rand, 3, 9)];
    return {
      title: `جداء من جدول ${y}`,
      steps: [
        `أنطلق من جداء أعرفه: $${x - 1} \\times ${y} = ${(x - 1) * y}$.`,
        `أضيف ${y} مرّة أخرى: $${(x - 1) * y} + ${y} = ${x * y}$.`,
        `أكتب: $${x} \\times ${y} = ${x * y}$.`,
      ],
    };
  }
  const [x, y] = [int(rand, 12, 29), int(rand, 3, 9)];
  const [t, u] = [Math.floor(x / 10) * 10, x % 10];
  return {
    title: 'جداء عدد من رقمين في عدد من رقم واحد',
    steps: [
      `أفكّك ${x} إلى عشرات وآحاد: $${x} = ${t} + ${u}$.`,
      `$${t} \\times ${y} = ${t * y}$ و $${u} \\times ${y} = ${u * y}$.`,
      `أجمع: $${t * y} + ${u * y} = ${x * y}$.`,
      `أكتب: $${x} \\times ${y} = ${x * y}$.`,
    ],
  };
}

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

// ───────────────────────── 1am.m3.r01 — القسمة الإقليدية ─────────────────────────
const divisionTokens = (a, b) => [
  String(a),
  '=',
  String(b),
  '×',
  S('q', 'حاصل القسمة', String(Math.floor(a / b)).length),
  '+',
  S('r', 'الباقي', String(b - 1).length),
];

function divisionWrite(rand, level, first) {
  const [b, q] =
    level === 1
      ? first
        ? [int(rand, 2, 5), int(rand, 2, 5)]
        : [int(rand, 3, 9), int(rand, 3, 9)]
      : [int(rand, 11, 19), int(rand, 6, 12)];
  const r = int(rand, 1, b - 1);
  const a = b * q + r;
  return { gesture: 'write', a, b, prompt: `أكمل القسمة الإقليدية للعدد ${a} على ${b}.`, tokens: divisionTokens(a, b) };
}

function divisionPlace(rand) {
  const b = int(rand, 4, 9);
  const q = int(rand, 3, Math.min(9, Math.floor(57 / b)));
  const r = int(rand, 1, b - 1);
  const a = b * q + r;
  return {
    gesture: 'place',
    a,
    b,
    max: 60,
    target: b * q,
    prompt: `العدد ${a} مثبَّت على المستقيم. اسحب الراية إلى أكبر مضاعف للعدد ${b} لا يتجاوز ${a}.`,
  };
}

/** Three equalities, each its own division: is it THE Euclidean division of the number by the first factor? */
function divisionSort(rand) {
  const make = (kind, id) => {
    const b = int(rand, 6, 9);
    const q = int(rand, 4, 9);
    const r = int(rand, 2, b - 2);
    const a = b * q + r;
    if (kind === 'ok') return { id, text: `$${a} = ${b} \\times ${q} + ${r}$`, bin: 'yes', trap: null, a, b };
    if (kind === 'big')
      return { id, text: `$${a} = ${b} \\times ${q - 1} + ${r + b}$`, bin: 'no', trap: 'rest-too-big', a, b };
    if (kind === 'neg')
      return { id, text: `$${a} = ${b} \\times ${q + 1} - ${b - r}$`, bin: 'no', trap: 'rest-negative', a, b };
    return { id, text: `$${a} = ${b} \\times ${q} + ${r + 1}$`, bin: 'no', trap: 'equality-false', a, b };
  };
  const kinds = shuffle(
    rand,
    pick(rand, [
      ['ok', 'big', 'neg'],
      ['ok', 'big', 'false'],
      ['ok', 'ok', 'big'],
      ['ok', 'neg', 'big'],
    ]),
  );
  return {
    gesture: 'sort',
    prompt: 'في كلّ مساواة، العدد الأوّل في الجداء هو المقسوم عليه. أرسل كلّ مساواة إلى صندوقها.',
    bins: [
      { id: 'yes', label: 'قسمة إقليدية' },
      { id: 'no', label: 'ليست قسمة إقليدية' },
    ],
    cards: kinds.map((k, i) => make(k, `c${i + 1}`)),
  };
}

function divisionExample(rand, level) {
  const b = level === 1 ? int(rand, 4, 8) : int(rand, 12, 16);
  const q = level === 1 ? int(rand, 4, 8) : int(rand, 6, 9);
  const r = int(rand, 1, b - 1);
  const a = b * q + r;
  return {
    title: `القسمة الإقليدية للعدد ${a} على ${b}`,
    steps: [
      `أبحث في مضاعفات ${b} عن أكبر مضاعف لا يتجاوز ${a}: $${b} \\times ${q} = ${b * q}$ (و $${b} \\times ${q + 1} = ${b * (q + 1)}$ أكبر من ${a}).`,
      `أحسب ما يبقى: $${a} - ${b * q} = ${r}$.`,
      `أتحقّق: الباقي ${r} أصغر من المقسوم عليه ${b}.`,
      `أكتب: $${a} = ${b} \\times ${q} + ${r}$.`,
    ],
  };
}

// ───────────────────────── 1am.m3.r02 — قواعد قابلية القسمة ─────────────────────────
const RULE_TRAPS = {
  2: (n) => (n % 2 !== 0 && /[02468]/.test(String(n).slice(0, -1)) ? 'digit-anywhere' : null),
  5: (n) => (n % 5 !== 0 && /[05]/.test(String(n).slice(0, -1)) ? 'digit-anywhere' : null),
  3: (n) => (n % 3 !== 0 && [3, 6, 9].includes(n % 10) ? 'last-digit' : null),
  9: (n) => (n % 9 !== 0 && n % 3 === 0 ? 'three-for-nine' : n % 9 !== 0 && n % 10 === 9 ? 'last-digit' : null),
  4: (n) => (n % 4 !== 0 && n % 2 === 0 ? 'even-for-four' : null),
};
/** What a « yes » number must look like so that the WRONG rule would refuse it (a rule is tested on both sides). */
const HARD_YES = {
  2: () => true,
  5: () => true,
  3: (n) => ![3, 6, 9].includes(n % 10),
  9: (n) => n % 10 !== 9,
  4: () => true,
};

function rulesSort(rand, k, first) {
  const lo = first ? 20 : 100;
  const hi = first ? 99 : 999;
  const find = (test) => {
    for (let i = 0; i < 400; i += 1) {
      const n = int(rand, lo, hi);
      if (test(n)) return n;
    }
    return null;
  };
  const yes = () => find((n) => n % k === 0 && HARD_YES[k](n)) ?? k * int(rand, 12, 30);
  const trap = () => find((n) => RULE_TRAPS[k](n) !== null);
  const no = () => find((n) => n % k !== 0 && RULE_TRAPS[k](n) === null) ?? k * int(rand, 12, 30) + 1;
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
    prompt: `هل يقبل كلّ عدد القسمة على ${k}؟ أرسله إلى صندوقه.`,
    bins: [
      { id: 'yes', label: `يقبل القسمة على ${k}` },
      { id: 'no', label: `لا يقبل القسمة على ${k}` },
    ],
    cards,
  };
}

function rulesExample(rand, level, { k: asked } = {}) {
  const k = asked ?? (level === 1 ? pick(rand, [2, 5]) : pick(rand, [3, 9, 4]));
  const n = (() => {
    for (let i = 0; i < 400; i += 1) {
      const x = int(rand, 100, 999);
      if (RULE_TRAPS[k](x) !== null) return x;
    }
    return 100 * k + 1;
  })();
  const ok = n % k === 0;
  const verdict = `إذن ${n} ${ok ? 'يقبل' : 'لا يقبل'} القسمة على ${k}.`;
  const last = n % 10;
  const two = n % 100;
  if (k === 2 || k === 5)
    return {
      title: `هل يقبل ${n} القسمة على ${k}؟`,
      steps: [
        `أنظر إلى آخر رقم فقط: آخر رقم في ${n} هو ${last}.`,
        k === 2
          ? `العدد يقبل القسمة على 2 عندما يكون آخر رقمه 0 أو 2 أو 4 أو 6 أو 8.`
          : 'العدد يقبل القسمة على 5 عندما يكون آخر رقمه 0 أو 5.',
        verdict,
      ],
    };
  if (k === 4)
    return {
      title: `هل يقبل ${n} القسمة على 4؟`,
      steps: [
        `أنظر إلى العدد المكوَّن من آخر رقمين: ${two}.`,
        `هل ${two} من مضاعفات 4؟ $${two} = 4 \\times ${Math.floor(two / 4)}${two % 4 ? ` + ${two % 4}` : ''}$: ${two % 4 === 0 ? 'نعم' : 'لا'}.`,
        verdict,
      ],
    };
  const s = digitSum(n);
  return {
    title: `هل يقبل ${n} القسمة على ${k}؟`,
    steps: [
      `أجمع أرقام ${n}: $${sumText(n)} = ${s}$.`,
      `هل ${s} من مضاعفات ${k}؟ ${s % k === 0 ? 'نعم' : 'لا'}.`,
      verdict,
    ],
  };
}

// ───────────────────────── 2am.m1.r04 — القسمة الإقليدية على أيّ عدد غير معدوم ─────────────────────────
// What 2AM adds to the 1AM division (the net's `extends`): the divisor is ANY number — two digits here, a quotient of two
// digits at level 2 — and the remainder keeps 0 ≤ r < b, a number smaller than the divisor included (quotient 0).
function anyWrite(rand, level, first) {
  const [b, q, r] = (() => {
    if (level === 2) {
      const d = int(rand, 12, 25);
      return [d, int(rand, 10, 25), int(rand, 0, d - 1)];
    }
    if (first) return [int(rand, 10, 12), 2, int(rand, 1, 5)];
    const d = int(rand, 11, 19);
    return [d, int(rand, 2, 5), int(rand, 1, d - 1)];
  })();
  const a = b * q + r;
  return { gesture: 'write', a, b, prompt: `أكمل القسمة الإقليدية للعدد ${a} على ${b}.`, tokens: divisionTokens(a, b) };
}

/** The flag on the greatest multiple of a two-digit divisor — the line stays the 0–60 one, so the quotient is small. */
function anyPlace(rand) {
  const b = int(rand, 11, 15);
  const q = int(rand, 2, Math.floor(57 / b));
  const r = int(rand, 1, Math.min(b - 1, 59 - b * q));
  const a = b * q + r;
  return {
    gesture: 'place',
    a,
    b,
    max: 60,
    target: b * q,
    prompt: `العدد ${a} مثبَّت على المستقيم. اسحب الراية إلى أكبر مضاعف للعدد ${b} لا يتجاوز ${a}.`,
  };
}

/** Three equalities with a two-digit divisor; a number SMALLER than the divisor (quotient 0) must be accepted. */
function anySort(rand) {
  const make = (kind, id) => {
    const b = int(rand, 12, 25);
    const q = int(rand, 3, 9);
    const r = int(rand, 2, b - 2);
    const a = b * q + r;
    const card = (text, bin, trap = null, miss = null) => ({ id, text, bin, trap, miss });
    if (kind === 'small') {
      const s = int(rand, 2, b - 1);
      return card(`$${s} = ${b} \\times 0 + ${s}$`, 'yes', null, 'quotient-zero');
    }
    if (kind === 'exact') return card(`$${b * q} = ${b} \\times ${q} + 0$`, 'yes');
    if (kind === 'ok') return card(`$${a} = ${b} \\times ${q} + ${r}$`, 'yes');
    if (kind === 'big') return card(`$${a} = ${b} \\times ${q - 1} + ${r + b}$`, 'no', 'rest-too-big');
    if (kind === 'neg') return card(`$${a} = ${b} \\times ${q + 1} - ${b - r}$`, 'no', 'rest-negative');
    return card(`$${a} = ${b} \\times ${q} + ${r + 1}$`, 'no', 'equality-false');
  };
  const kinds = shuffle(
    rand,
    pick(rand, [
      ['ok', 'big', 'small'],
      ['small', 'neg', 'false'],
      ['ok', 'big', 'neg'],
      ['exact', 'big', 'small'],
      ['small', 'big', 'ok'],
    ]),
  );
  const cards = [];
  for (const kind of kinds) {
    let c = make(kind, `c${cards.length + 1}`);
    for (let i = 0; i < 20 && cards.some((o) => o.text === c.text); i += 1) c = make(kind, c.id);
    cards.push(c);
  }
  return {
    gesture: 'sort',
    prompt: 'في كلّ مساواة، العدد الأوّل في الجداء هو المقسوم عليه. أرسل كلّ مساواة إلى صندوقها.',
    bins: [
      { id: 'yes', label: 'قسمة إقليدية' },
      { id: 'no', label: 'ليست قسمة إقليدية' },
    ],
    cards,
  };
}

/** The worked example: the quotient estimated by tens (level 2), then the greatest multiple; or the quotient 0 when that was missed. */
function anyExample(rand, level, { mistake = null } = {}) {
  if (mistake === 'quotient-zero') {
    const b = int(rand, 12, 25);
    const a = int(rand, 2, b - 1);
    return {
      title: `القسمة الإقليدية للعدد ${a} على ${b}`,
      steps: [
        `العدد ${a} أصغر من المقسوم عليه ${b}: لا يحتوي ${a} على ${b} ولا مرّة واحدة.`,
        `إذن الحاصل 0، والباقي هو ${a} نفسه، وهو أصغر من ${b}.`,
        `أكتب: $${a} = ${b} \\times 0 + ${a}$.`,
      ],
    };
  }
  const b = level === 1 ? int(rand, 11, 19) : int(rand, 12, 25);
  const q = level === 1 ? int(rand, 2, 6) : int(rand, 11, 29);
  const r = int(rand, 1, b - 1);
  const a = b * q + r;
  const t = Math.floor(q / 10) * 10;
  return {
    title: `القسمة الإقليدية للعدد ${a} على ${b}`,
    steps: [
      ...(level === 2
        ? [
            `أقدّر الحاصل بالعشرات: $${b} \\times ${t} = ${b * t}$ و $${b} \\times ${t + 10} = ${b * (t + 10)}$، إذن الحاصل بين ${t} و ${t + 10}.`,
          ]
        : []),
      `أبحث عن أكبر مضاعف للعدد ${b} لا يتجاوز ${a}: $${b} \\times ${q} = ${b * q}$ (و $${b} \\times ${q + 1} = ${b * (q + 1)}$ أكبر من ${a}).`,
      `أحسب ما يبقى: $${a} - ${b * q} = ${r}$، و ${r} أصغر من ${b}.`,
      `أكتب: $${a} = ${b} \\times ${q} + ${r}$.`,
    ],
  };
}

// ───────────────────────── 4am.m1.r01 — التعرّف على قاسم لعدد طبيعي ─────────────────────────
/** « a = b × ▢ »: the equality that SHOWS b is a divisor of a (no remainder to write: the box of the remainder is gone). */
function divisorWrite(rand, level, first) {
  const [b, q] =
    level === 1
      ? first
        ? [int(rand, 2, 5), int(rand, 3, 5)]
        : [int(rand, 3, 9), int(rand, 3, 9)]
      : [int(rand, 11, 19), int(rand, 4, 9)];
  const a = b * q;
  return {
    gesture: 'write',
    a,
    b,
    prompt: `العدد ${b} قاسم للعدد ${a}. أكمل المساواة التي تبيّن ذلك.`,
    tokens: [String(a), '=', String(b), '×', S('q', 'حاصل القسمة', String(q).length)],
  };
}

const PICK_FROM = { first: [12, 18, 20, 24], 1: [24, 28, 30, 36, 40, 42, 48], 2: [54, 56, 60, 63, 72, 84, 90, 96] };
const PICK_SHAPES = {
  1: [
    ['yes', 'near', 'multiple'],
    ['yes', 'near', 'yes'],
    ['yes', 'near', 'near'],
  ],
  // level 2 always shows 1 or the number itself: the two divisors a student forgets
  2: [
    ['yes', 'near', 'edge'],
    ['edge', 'multiple', 'near'],
    ['yes', 'multiple', 'edge'],
  ],
};

/** Three numbers: is each one a divisor of `of`? A multiple of it (the usual confusion) is one of the traps. */
function divisorPick(rand, level, first) {
  const of = pick(rand, PICK_FROM[level === 1 && first ? 'first' : level]);
  const top = level === 1 ? 9 : 16;
  const range = [];
  for (let n = 2; n <= top; n += 1) range.push(n);
  const draw = {
    yes: () =>
      pick(
        rand,
        range.filter((n) => of % n === 0),
      ),
    near: () =>
      pick(
        rand,
        range.filter((n) => of % n !== 0),
      ),
    multiple: () => of * pick(rand, [2, 3]),
    edge: () => pick(rand, [1, of]),
  };
  const used = new Set();
  const cards = [];
  for (const kind of shuffle(rand, pick(rand, PICK_SHAPES[level]))) {
    let n = null;
    for (let i = 0; i < 40 && (n === null || used.has(n)); i += 1) n = draw[kind]();
    used.add(n);
    const yes = of % n === 0;
    cards.push({
      id: `c${cards.length + 1}`,
      text: String(n),
      n,
      bin: yes ? 'yes' : 'no',
      trap: yes ? null : n > of ? 'multiple-for-divisor' : 'rest-not-zero',
      miss: yes && (n === 1 || n === of) ? 'one-and-itself' : null,
    });
  }
  return {
    gesture: 'sort',
    of,
    prompt: `هل كلّ عدد قاسم للعدد ${of}؟ أرسله إلى صندوقه.`,
    bins: [
      { id: 'yes', label: `قاسم للعدد ${of}` },
      { id: 'no', label: `ليس قاسمًا للعدد ${of}` },
    ],
    cards,
  };
}

/** The three ways of saying it; a card is { x, y, verb } and is TRUE when `SENTENCES[verb].holds(x, y)`. */
const SENTENCES = {
  divisor: { say: (x, y) => `${x} قاسم للعدد ${y}`, holds: (x, y) => y % x === 0 },
  multiple: { say: (x, y) => `${x} مضاعف للعدد ${y}`, holds: (x, y) => x % y === 0 },
  divisible: { say: (x, y) => `${x} يقبل القسمة على ${y}`, holds: (x, y) => x % y === 0 },
};
const VERBS = Object.keys(SENTENCES);

/** Three sentences, each on its own two numbers: true, turned round (the two numbers swapped), or with a remainder. */
function divisorSentences(rand) {
  const make = (kind, id) => {
    const b = int(rand, 6, 12);
    const a = b * int(rand, 4, 9);
    const big = kind === 'rest' ? a + int(rand, 1, b - 1) : a;
    const verb = pick(rand, VERBS);
    // said the right way round, the small number comes first only with « قاسم »
    const straight = verb === 'divisor' ? [b, big] : [big, b];
    const [x, y] = kind === 'reversed' ? [straight[1], straight[0]] : straight;
    return {
      id,
      text: SENTENCES[verb].say(x, y),
      say: true,
      x,
      y,
      verb,
      bin: kind === 'true' ? 'yes' : 'no',
      trap: kind === 'reversed' ? 'sentence-reversed' : kind === 'rest' ? 'rest-not-zero' : null,
    };
  };
  const kinds = shuffle(
    rand,
    pick(rand, [
      ['true', 'reversed', 'rest'],
      ['true', 'reversed', 'true'],
      ['true', 'rest', 'reversed'],
    ]),
  );
  const cards = [];
  for (const kind of kinds) {
    let c = make(kind, `c${cards.length + 1}`);
    for (let i = 0; i < 20 && cards.some((o) => o.text === c.text); i += 1) c = make(kind, c.id);
    cards.push(c);
  }
  return {
    gesture: 'sort',
    prompt: 'هل كلّ جملة صحيحة؟ أرسلها إلى صندوقها.',
    bins: [
      { id: 'yes', label: 'صحيحة' },
      { id: 'no', label: 'خاطئة' },
    ],
    cards,
  };
}

/**
 * The worked example answers the mistake the student showed: the order of the two numbers or a multiple taken for a
 * divisor, 1 and the number itself refused, or — by default — the division and its remainder.
 */
function divisorExample(rand, level, { mistake = null } = {}) {
  const b = level === 1 ? int(rand, 4, 9) : int(rand, 11, 15);
  const q = int(rand, 4, 9);
  if (mistake === 'sentence-reversed' || mistake === 'multiple-for-divisor') {
    const a = b * q;
    return {
      title: `هل ${a} قاسم للعدد ${b}؟`,
      steps: [
        `أكتب المساواة: $${a} = ${b} \\times ${q}$.`,
        `العدد ${b} هو الذي يقسم ${a}: إذن ${b} قاسم للعدد ${a}، و ${a} مضاعف للعدد ${b}.`,
        `العدد ${a} أكبر من ${b}: إذن ${a} ليس قاسمًا للعدد ${b}.`,
      ],
    };
  }
  if (mistake === 'one-and-itself') {
    const a = b * q;
    return {
      title: `هل 1 و ${a} قاسمان للعدد ${a}؟`,
      steps: [
        `أكتب المساواة: $${a} = 1 \\times ${a}$.`,
        `الباقي 0 في قسمة ${a} على 1، وفي قسمة ${a} على ${a}.`,
        `إذن 1 و ${a} قاسمان للعدد ${a}: لكلّ عدد غير معدوم هذان القاسمان.`,
      ],
    };
  }
  const r = rand() < 0.5 ? 0 : int(rand, 1, b - 1);
  const a = b * q + r;
  return {
    title: `هل ${b} قاسم للعدد ${a}؟`,
    steps: [
      `أقسم ${a} على ${b}: $${a} = ${b} \\times ${q}${r ? ` + ${r}` : ''}$.`,
      r ? `الباقي ${r}، وهو ليس 0.` : 'الباقي 0.',
      r ? `إذن ${b} ليس قاسمًا للعدد ${a}.` : `إذن ${b} قاسم للعدد ${a}، و ${a} مضاعف للعدد ${b}.`,
    ],
  };
}

// ───────────────────────── 4am.m1.r02 — تعيين مجموعة قواسم عدد طبيعي ─────────────────────────
// What the PGCD lessons stand on: the WHOLE list of a number's divisors, found by pairs (« a = d × k » gives d and its
// partner k), trying d while d × d does not pass a. Its mistakes are those of an incomplete list: a partner forgotten,
// the search stopped one number too early, 1 or the number itself left out, a number that leaves a remainder let in.
const divisorList = (n) => {
  const out = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
};
/**
 * « 1 ، 2 ، 3 »: a NO-BREAK space before each comma and an ordinary one after it — a line of a list breaks only AFTER a
 * comma, never starts with one (seen on the launch card at 1366 × 768, 2026-11-19).
 */
export const LIST_SEP = '\u00a0، ';
const listText = (xs) => xs.join(LIST_SEP);
/** The numbers whose list stands on a card: 6 to 8 divisors, never a square (every divisor has a partner of its own). */
const LISTS_FROM = {
  1: [12, 18, 20, 28, 30, 32],
  2: [40, 42, 44, 45, 50, 52, 54, 56, 63, 66, 70, 75, 78, 88, 98, 99],
};
/** The divisors d of n with d × d ≤ n: the numbers tried, one per pair. */
const tried = (n) => divisorList(n).filter((d) => d * d <= n);

/** « a = b × ▢ »: b is a divisor of a, the student writes its PARTNER — the other half of the pair. */
function listWrite(rand, level, first) {
  const [b, q] =
    level === 1
      ? first
        ? [int(rand, 2, 4), int(rand, 5, 7)]
        : [int(rand, 2, 6), int(rand, 6, 9)]
      : [int(rand, 11, 19), int(rand, 3, 9)];
  const a = b * q;
  return {
    gesture: 'write',
    a,
    b,
    prompt:
      level === 1
        ? `نكتب قواسم ${a} أزواجًا. أكمل الزوج الذي يبدأ بالعدد ${b}.`
        : `العدد ${b} قاسم للعدد ${a}. أكمل المساواة: شريكه قاسم أيضًا.`,
    tokens: [String(a), '=', String(b), '×', S('q', 'الشريك', String(q).length)],
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
  return { id, text: `قواسم ${n}: ${listText(list)}`, say: true, n, list, bin: kind === 'full' ? 'yes' : 'no', trap };
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
    prompt: 'هل كلّ قائمة هي قواسم العدد كلّها، دون نقص ولا زيادة؟ أرسلها إلى صندوقها.',
    bins: [
      { id: 'yes', label: 'قائمة كاملة' },
      { id: 'no', label: 'ناقصة أو فيها دخيل' },
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
  if (mistake === 'one-and-itself') first = `أبدأ دائمًا بالزوج $${n} = 1 \\times ${n}$: العددان 1 و ${n} قاسمان.`;
  else if (mistake === 'rest-not-zero') {
    const outs = [];
    for (let k = 2; k < n / 2; k += 1) if (n % k !== 0) outs.push(k);
    const k = pick(rand, outs);
    first = `العدد ${k} ليس قاسمًا: $${n} = ${k} \\times ${Math.floor(n / k)} + ${n % k}$، والباقي ليس 0.`;
  } else if (mistake === 'partner-forgot')
    first = `كلّ قسمة تامّة تعطي قاسمين: العدد المجرَّب وشريكه. أجرّب من 1 إلى ${s}، لأنّ $${s} \\times ${s} = ${s * s}$ لا يتجاوز ${n}.`;
  else
    first = `أجرّب من 1 إلى ${s}: $${s} \\times ${s} = ${s * s}$ لا يتجاوز ${n}، و $${s + 1} \\times ${s + 1} = ${(s + 1) * (s + 1)}$ يتجاوزه.`;
  return {
    title: `قواسم العدد ${n}`,
    steps: [
      first,
      `الأزواج: ${tried(n)
        .map((d) => `$${n} = ${d} \\times ${n / d}$`)
        .join('، ')}.`,
      `قواسم ${n}: ${listText(divisorList(n))}.`,
    ],
  };
}

// ───────────────────────── 4am.m1.r03 — تعيين القاسم المشترك الأكبر لعددين ─────────────────────────
// What « العددان الأوّليّان فيما بينهما » and the reduction of a fraction stand on: the common divisors of two numbers and the
// GREATEST of them. Its slips: a common divisor that is not the greatest, a divisor of only one of the two numbers, the
// smaller number taken when it does not divide the greater. Its pairs are the platform's own: never a pair the exercise
// banks of the lessons that use it name (`launchkit.test.js` reads the banks), and NEVER two numbers whose PGCD is 1 — this
// kit is played just before the lesson that makes the student discover what such a pair is.
/** Pairs ≤ 99 named by the banks of the lessons that use this family, and by the road of the one that opens it (`launchkit.test.js` reads them). */
const PGCD_AVOID = new Set(
  '5;8 7;9 8;30 9;14 10;13 10;16 12;18 13;39 14;15 14;20 15;22 15;48 16;44 17;18 18;30 18;48 22;35 23;31 25;27 26;39 27;36 28;42 28;91 36;48 36;84 40;64 41;70 42;70 43;70 44;45 44;70 45;70 45;75 46;70 46;75 47;48 47;70 48;70 48;80 48;84 49;70 50;75 50;77 52;78 53;69 54;90 55;77 55;78 56;65 56;84 56;96 63;81 64;96 65;78 66;88 69;80 70;98 84;87'.split(
    ' ',
  ),
);
const pairKey = (x, y) => (x < y ? `${x};${y}` : `${y};${x}`);
const divisorsBoth = (x, y) => divisorList(Math.min(x, y)).filter((d) => x % d === 0 && y % d === 0);
/** Where the two numbers of a level are drawn: x = g × m, y = g × n, m ≠ n both ≥ 2 and sharing nothing — so g IS the PGCD, never 1, and neither number divides the other. */
const PGCD_FROM = {
  first: { g: [2, 5], k: [2, 3], top: 15, low: 4 },
  1: { g: [2, 9], k: [2, 5], top: 45, low: 4 },
  2: { g: [4, 19], k: [2, 7], top: 99, low: 30 },
};
function pgcdPair(rand, level, { first = false, gs = null } = {}) {
  const R = PGCD_FROM[first ? 'first' : level];
  for (let i = 0; i < 500; i += 1) {
    const g = gs ? pick(rand, gs) : int(rand, R.g[0], R.g[1]);
    const [m, n] = [int(rand, R.k[0], R.k[1]), int(rand, R.k[0], R.k[1])];
    const [x, y] = [g * m, g * n];
    if (m === n || gcdOf(m, n) !== 1 || Math.max(x, y) > R.top || Math.min(x, y) < R.low) continue;
    if (PGCD_AVOID.has(pairKey(x, y))) continue;
    return { x, y, g };
  }
  return level === 2 ? { x: 76, y: 95, g: 19 } : { x: 21, y: 35, g: 7 };
}
const pgcdTex = (x, y) => `\\mathrm{PGCD}(${x} ; ${y})`;
/** The slip an answer v to « PGCD(x ; y) = ▢ » shows (v is not the PGCD). */
function pgcdSlip(x, y, v) {
  if (!(v > 0)) return null;
  const [lo, hi] = [Math.min(x, y), Math.max(x, y)];
  if (v === lo && hi % lo !== 0) return 'smaller-not-divisor';
  if (x % v === 0 && y % v === 0) return 'common-not-greatest';
  if (x % v === 0 || y % v === 0) return 'divisor-of-one';
  return null;
}

/** « PGCD(x ; y) = ▢ »: the student writes the greatest common divisor. */
function pgcdWrite(rand, level, first) {
  const { x, y } = pgcdPair(rand, level, { first: first && level === 1 });
  const c = { op: 'pgcd', x, y };
  return {
    gesture: 'write',
    calc: c,
    prompt: `ما أكبر عدد يقسم ${x} و ${y} معًا؟ أكمل.`,
    tokens: ['PGCD(', String(x), ';', String(y), ')', '=', S('v', 'الناتج', String(calcValue(c)).length)],
  };
}

/** Three numbers: is each one a common divisor of x and y? A divisor of only one of them is the trap. */
function pgcdCommon(rand) {
  const { x, y } = pgcdPair(rand, 1, { gs: [4, 6, 8, 9, 10] });
  const both = divisorsBoth(x, y).filter((d) => d > 1);
  const only = (n, o) => divisorList(n).filter((d) => d > 1 && o % d !== 0);
  const draw = {
    common: () => pick(rand, both),
    onlyX: () => pick(rand, only(x, y)),
    onlyY: () => pick(rand, only(y, x)),
  };
  const shape = shuffle(
    rand,
    pick(rand, [
      ['common', 'onlyX', 'onlyY'],
      ['common', 'common', 'onlyX'],
      ['onlyY', 'common', 'common'],
      ['common', 'onlyX', 'common'],
    ]),
  );
  const used = new Set();
  const cards = [];
  for (const kind of shape) {
    let n = null;
    for (let i = 0; i < 40 && (n === null || used.has(n)); i += 1) n = draw[kind]();
    if (used.has(n)) n = draw[kind === 'common' ? 'onlyX' : 'common']();
    used.add(n);
    const yes = x % n === 0 && y % n === 0;
    cards.push({
      id: `c${cards.length + 1}`,
      text: String(n),
      n,
      bin: yes ? 'yes' : 'no',
      trap: yes ? null : 'divisor-of-one',
    });
  }
  return {
    gesture: 'sort',
    pair: [x, y],
    prompt: `هل كلّ عدد قاسم مشترك للعددين ${x} و ${y}؟ أرسله إلى صندوقه.`,
    bins: [
      { id: 'yes', label: 'قاسم مشترك' },
      { id: 'no', label: 'ليس قاسمًا مشتركًا' },
    ],
    cards,
  };
}

/** Three equalities « PGCD(x ; y) = v », each on its own pair: true, a smaller common divisor, or the smaller number. */
function pgcdSort(rand) {
  const make = (kind, id) => {
    const { x, y, g } = pgcdPair(rand, 2, { gs: [6, 8, 9, 10, 12, 14, 15] });
    const v =
      kind === 'true'
        ? g
        : kind === 'smaller'
          ? pick(
              rand,
              divisorsBoth(x, y).filter((d) => d > 1 && d < g),
            )
          : Math.min(x, y);
    const trap = kind === 'smaller' ? 'common-not-greatest' : kind === 'min' ? 'smaller-not-divisor' : null;
    return { id, text: `$${pgcdTex(x, y)} = ${v}$`, x, y, v, bin: v === g ? 'yes' : 'no', trap };
  };
  const kinds = shuffle(
    rand,
    pick(rand, [
      ['true', 'smaller', 'min'],
      ['true', 'true', 'smaller'],
      ['smaller', 'min', 'true'],
      ['true', 'min', 'true'],
    ]),
  );
  const cards = [];
  for (const kind of kinds) {
    let c = make(kind, `c${cards.length + 1}`);
    for (let i = 0; i < 30 && cards.some((o) => pairKey(o.x, o.y) === pairKey(c.x, c.y)); i += 1) c = make(kind, c.id);
    cards.push(c);
  }
  return {
    gesture: 'sort',
    prompt: 'هل كلّ مساواة صحيحة؟ أرسلها إلى صندوقها.',
    bins: [
      { id: 'yes', label: 'صحيحة' },
      { id: 'no', label: 'خاطئة' },
    ],
    cards,
  };
}

/** The worked example: the two lists, what is in both, the greatest. Its first step answers the mistake shown. */
function pgcdExample(rand, level, { mistake = null } = {}) {
  const { x, y, g } = pgcdPair(rand, level === 2 ? 2 : 1, { gs: level === 2 ? [6, 8, 10, 12] : [4, 6, 8, 9] });
  const both = divisorsBoth(x, y);
  const [lo, hi] = [Math.min(x, y), Math.max(x, y)];
  let first;
  if (mistake === 'smaller-not-divisor')
    first = `$${hi} = ${lo} \\times ${Math.floor(hi / lo)} + ${hi % lo}$: الباقي ليس 0، إذن ${lo} ليس قاسمًا للعدد ${hi}.`;
  else if (mistake === 'divisor-of-one') {
    const d = pick(
      rand,
      divisorList(x).filter((k) => k > 1 && y % k !== 0),
    );
    first = `العدد ${d} يقسم ${x}، لكنّ $${y} = ${d} \\times ${Math.floor(y / d)} + ${y % d}$: إذن ${d} ليس قاسمًا مشتركًا.`;
  } else if (mistake === 'common-not-greatest')
    first = `العدد ${both.at(-2)} قاسم مشترك للعددين، لكنّنا نبحث عن أكبرها: نكتب القائمتين كاملتين.`;
  else first = 'نكتب قواسم كلّ عدد، ثمّ نختار من القائمتين أكبر عدد فيهما معًا.';
  return {
    title: `القاسم المشترك الأكبر للعددين ${x} و ${y}`,
    steps: [
      first,
      `قواسم ${x}: ${listText(divisorList(x))}.`,
      `قواسم ${y}: ${listText(divisorList(y))}.`,
      `القواسم المشتركة: ${listText(both)}، أكبرها ${g}: $${pgcdTex(x, y)} = ${g}$.`,
    ],
  };
}

// ───────────────────────── 1am.m5.r02 — اختزال كتابة كسرية (كسر) ─────────────────────────
// What the reduction of a fraction (4AM) stands on, from 1AM: two fractions are EQUAL when both terms are divided (or
// multiplied) by the same number. Its slips: the same number SUBTRACTED from both terms, one term divided and not the
// other. A fraction is written with a real bar: a token `{ frac: [top, bottom] }`, one of the two a box (`S`). The given
// fractions are the platform's own: never a fraction the banks of the lessons that use this family write
// (`launchkit.test.js` reads them). The kit is played just before « اختزال كسر »: nothing here names one of its keys —
// no stages, no fraction that « cannot » be rewritten, no greatest divisor; ONE number divides both terms.
/** The fractions (numerator < denominator, denominator ≤ 180) the two banks write (`launchkit.test.js` re-reads them). */
const FRAC_AVOID = new Set(
  '2/3 3/4 2/5 3/5 4/5 3/6 4/6 5/6 2/7 3/7 4/7 5/7 6/7 2/8 3/8 5/8 6/8 7/8 2/9 4/9 5/9 6/9 7/9 3/10 4/10 5/10 6/10 7/10 8/10 9/10 7/11 2/12 3/12 5/12 7/12 8/12 9/12 10/12 11/12 6/13 9/13 6/14 7/14 11/14 2/15 4/15 9/15 10/15 11/15 5/16 6/16 8/16 9/16 12/16 12/17 13/17 2/18 12/18 11/19 17/19 2/20 3/20 6/20 7/20 8/20 12/20 13/20 14/20 15/20 16/20 8/21 9/21 12/21 14/21 15/21 14/22 15/22 5/24 6/24 9/24 14/24 15/24 18/24 20/24 3/25 5/25 12/25 15/25 12/27 18/27 16/28 24/28 2/30 8/30 18/30 20/30 21/30 27/30 29/30 18/32 22/33 15/35 21/35 27/35 6/36 24/36 27/36 10/40 12/40 13/40 15/40 21/40 24/40 37/40 6/42 18/42 28/42 30/42 35/42 25/43 30/43 10/45 25/45 27/45 30/45 35/45 35/48 6/49 8/49 14/49 30/50 42/54 22/55 24/56 32/56 10/60 20/60 28/63 42/63 24/64 52/65 51/68 35/70 48/72 45/75 54/81 36/84 17/86 60/86 63/99 7/100 12/100 20/100 25/100 35/100 45/100 60/100 70/100 75/100 63/110 87/116 91/119 88/120 100/120 111/120 50/125 116/125 84/126 99/135 24/147 117/156 66/165 119/170 133/171'.split(
    ' ',
  ),
);
/** Where a level draws its fraction n/d = (k × p)/(k × q), 1 ≤ p < q: k the number that divides both terms. */
const FRAC_FROM = {
  first: { k: [2, 2], q: [3, 5], low: 0 },
  1: { k: [2, 5], q: [3, 9], low: 0 },
  2: { k: [3, 12], q: [4, 15], low: 30 },
};
function fracPair(rand, level, { first = false } = {}) {
  const R = FRAC_FROM[first ? 'first' : level];
  for (let i = 0; i < 500; i += 1) {
    const k = int(rand, R.k[0], R.k[1]);
    const q = int(rand, R.q[0], R.q[1]);
    const p = int(rand, 1, q - 1);
    const [n, d] = [k * p, k * q];
    if (d < R.low || FRAC_AVOID.has(`${n}/${d}`)) continue;
    return { n, d, k, p, q };
  }
  return level === 2 ? { n: 52, d: 91, k: 13, p: 4, q: 7 } : { n: 10, d: 16, k: 2, p: 5, q: 8 };
}
const fracTex = (n, d) => `\\frac{${n}}{${d}}`;
/** The slip an answer v to « n/d = m/▢ » (or « ▢/m ») shows: the same number subtracted, or one term left as it was. */
function fracSlip(c, v) {
  const [given, other] = c.side === 'bottom' ? [c.d, c.n] : [c.n, c.d];
  if (v === given - (other - c.m)) return 'subtract-not-divide';
  if (v === given) return 'one-term-only';
  return null;
}

/** « n/d = p/▢ » or « n/d = ▢/q », written with two fraction bars: the student writes the missing term. */
function fracWrite(rand, level, first) {
  const { n, d, p, q } = fracPair(rand, level, { first: first && level === 1 });
  const side = first || rand() < 0.5 ? 'bottom' : 'top';
  const c = { op: 'frac', n, d, m: side === 'bottom' ? p : q, side };
  const w = String(calcValue(c)).length;
  return {
    gesture: 'write',
    calc: c,
    prompt: 'أكمل لتحصل على كسر يساوي الكسر الأوّل.',
    tokens: [
      { frac: [String(n), String(d)] },
      '=',
      { frac: side === 'bottom' ? [String(p), S('v', 'المقام', w)] : [S('v', 'البسط', w), String(q)] },
    ],
  };
}

/** Three equalities « n/d = x/y », each on its own fraction: divided, multiplied, a number subtracted, one term divided. */
function fracSort(rand, level) {
  const make = (kind, id) => {
    const { n, d, k, p, q } = fracPair(rand, level);
    const j = k === 2 ? 3 : 2;
    const [x, y] =
      kind === 'divide' ? [p, q] : kind === 'times' ? [p * j, q * j] : kind === 'subtract' ? [p, d - (n - p)] : [p, d];
    const trap = kind === 'subtract' ? 'subtract-not-divide' : kind === 'one' ? 'one-term-only' : null;
    return { id, text: `$${fracTex(n, d)} = ${fracTex(x, y)}$`, n, d, x, y, bin: n * y === d * x ? 'yes' : 'no', trap };
  };
  const kinds = shuffle(
    rand,
    pick(rand, [
      ['divide', 'subtract', 'one'],
      ['divide', 'times', 'subtract'],
      ['one', 'divide', 'times'],
      ['subtract', 'divide', 'one'],
    ]),
  );
  const cards = [];
  for (const kind of kinds) {
    let c = make(kind, `c${cards.length + 1}`);
    for (let i = 0; i < 30 && cards.some((o) => o.text === c.text || (o.n === c.n && o.d === c.d)); i += 1)
      c = make(kind, c.id);
    cards.push(c);
  }
  return {
    gesture: 'sort',
    prompt: 'هل كلّ مساواة صحيحة؟ أرسلها إلى صندوقها.',
    bins: [
      { id: 'yes', label: 'صحيحة' },
      { id: 'no', label: 'خاطئة' },
    ],
    cards,
  };
}

/** The worked example: a number that divides both terms, the two divisions, the equal fraction. Its first step answers the mistake shown. */
function fracExample(rand, level, { mistake = null } = {}) {
  const { n, d, k, p, q } = fracPair(rand, level === 2 ? 2 : 1);
  let first;
  if (mistake === 'subtract-not-divide')
    first = `نطرح ${n - p} من البسط والمقام فنحصل على $${fracTex(p, d - (n - p))}$، وهو لا يساوي $${fracTex(n, d)}$: نقسم ولا نطرح.`;
  else if (mistake === 'one-term-only')
    first = `نقسم البسط وحده فنحصل على $${fracTex(p, d)}$، وهو لا يساوي $${fracTex(n, d)}$: نقسم البسط والمقام معًا.`;
  else first = 'نبحث عن عدد يقسم البسط والمقام معًا.';
  return {
    title: `كسر يساوي الكسر ${n} على ${d}`,
    steps: [
      first,
      `العدد ${k} يقسم ${n} و ${d}: $${n} = ${k} \\times ${p}$ و $${d} = ${k} \\times ${q}$.`,
      `نقسم البسط والمقام على ${k}: $${fracTex(n, d)} = ${fracTex(`${n} \\div ${k}`, `${d} \\div ${k}`)} = ${fracTex(p, q)}$.`,
      `الكسران $${fracTex(n, d)}$ و $${fracTex(p, q)}$ متساويان.`,
    ],
  };
}

// ───────────────────────── 3am.m3.r06 — حساب قوة عدد نسبي ─────────────────────────
// What the square roots of 4AM stand on: the SQUARE of a number — whole, negative, decimal, a fraction — with a few cubes
// and powers of ten at level 2. Nothing here writes the sign of a root or names one: the kit is played BEFORE that lesson.
// Every value is EXACT (a number is a fraction n/d of integers, d > 0): a decimal is tenths, never a float.
/**
 * The whole bases whose square the kit writes. The squares the lesson's world builds (9, 16, 25, 36, 49, 81, 100, 196:
 * bases 3, 4, 5, 6, 7, 9, 10, 14) are left out, so a number met first in the lesson is not one the kit has just shown —
 * `launchkit.test.js` checks the list against the lesson's story. A decimal or a fraction is free.
 */
const SQ_BASES = { first: [8], 1: [8, 11, 12], sort: [8, 11, 12, 13] };
const ratEq = (a, b) => a.n * b.d === b.n * a.d;
const ratPow = (r, e) => ({ n: r.n ** e, d: r.d ** e });
/** n / 10^k written with a decimal comma (LaTeX `{,}`), exactly: 9 / 100 → « 0{,}09 ». */
const decTex = (n, k) => {
  const s = String(Math.abs(n)).padStart(k + 1, '0');
  return `${n < 0 ? '-' : ''}${s.slice(0, -k)}{,}${s.slice(-k)}`;
};
const POW_FRAC = (p, q) => `\\left(\\frac{${p}}{${q}}\\right)`;
/** The base of a power, as the student reads it: « 8 », « (−8) » (a negative base is always in brackets). */
const baseText = (x) => (x < 0 ? `(−${-x})` : String(x));

/** « 8² = ▢ », « (−11)² = ▢ » (level 1); « 3³ = ▢ » or « (2/3)² = ▢/▢ » (level 2). A typed value is never negative. */
function powerWrite(rand, level, first) {
  if (level === 1) {
    const b = pick(rand, first ? SQ_BASES.first : SQ_BASES[1]);
    const x = first || rand() < 0.5 ? b : -b;
    const c = { op: 'pow', x, e: 2 };
    return {
      gesture: 'write',
      calc: c,
      prompt: 'احسب قيمة هذه القوّة.',
      tokens: [{ pow: [baseText(x), '2'] }, '=', S('v', 'الناتج', String(calcValue(c)).length)],
    };
  }
  if (rand() < 0.5) {
    const c = { op: 'pow', x: int(rand, 2, 5), e: 3 };
    return {
      gesture: 'write',
      calc: c,
      prompt: 'احسب قيمة هذه القوّة.',
      tokens: [{ pow: [String(c.x), '3'] }, '=', S('v', 'الناتج', String(calcValue(c)).length)],
    };
  }
  let p;
  let q;
  do {
    q = int(rand, 3, 9);
    p = int(rand, 1, q - 1);
  } while (gcdOf(p, q) !== 1);
  const c = { op: 'pow', n: p, d: q, e: 2 };
  return {
    gesture: 'write',
    calc: c,
    prompt: 'احسب مربّع الكسر، واكتب الناتج كسرًا.',
    tokens: [
      { pow: [{ frac: [String(p), String(q)] }, '2'] },
      '=',
      { frac: [S('n', 'البسط', String(p * p).length), S('d', 'المقام', String(q * q).length)] },
    ],
  };
}

/**
 * One card of a sort of powers: `kind` says what it shows — true (`sq`, `neg`, `dec`, `frac`, `cube`, `ten`) or a slip
 * (`times` the base times the exponent, `sign` a square of a negative written negative, `decSlip` one decimal place only,
 * `fracTop` the numerator alone squared, `cubeSign` a negative cube written positive, `tenTimes` 10 × the exponent).
 * It carries its base (`base`, a fraction n/d), its exponent and the value shown (`shown`), and is judged from them.
 */
function powerCard(rand, kind, id) {
  const B = (x) => ({ n: x, d: 1 });
  let base;
  let e = 2;
  let shown;
  let tex;
  let trap = null;
  if (kind === 'sq' || kind === 'times') {
    const x = pick(rand, kind === 'times' ? SQ_BASES.sort : [2, ...SQ_BASES.sort]);
    base = B(x);
    shown = kind === 'sq' ? B(x * x) : B(2 * x);
    tex = `${x}^{2} = ${shown.n}`;
    if (kind === 'times') trap = 'power-times';
  } else if (kind === 'neg' || kind === 'sign') {
    const x = pick(rand, [2, ...SQ_BASES.sort]);
    base = B(-x);
    shown = B(kind === 'neg' ? x * x : -x * x);
    tex = `(-${x})^{2} = ${shown.n}`;
    if (kind === 'sign') trap = 'square-sign';
  } else if (kind === 'dec' || kind === 'decSlip') {
    const t = kind === 'dec' ? pick(rand, [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13]) : int(rand, 2, 9);
    base = { n: t, d: 10 };
    shown = kind === 'dec' ? { n: t * t, d: 100 } : { n: t * t, d: 10 };
    tex = `(${decTex(t, 1)})^{2} = ${kind === 'dec' ? decTex(t * t, 2) : decTex(t * t, 1)}`;
    if (kind === 'decSlip') trap = 'decimal-places';
  } else if (kind === 'frac' || kind === 'fracTop') {
    let p;
    let q;
    do {
      q = int(rand, 3, 9);
      p = int(rand, 2, q - 1);
    } while (gcdOf(p, q) !== 1);
    base = { n: p, d: q };
    shown = kind === 'frac' ? { n: p * p, d: q * q } : { n: p * p, d: q };
    tex = `${POW_FRAC(p, q)}^{2} = \\frac{${shown.n}}{${shown.d}}`;
    if (kind === 'fracTop') trap = 'fraction-one-term';
  } else if (kind === 'cube' || kind === 'cubeSign') {
    const x = int(rand, 2, 4);
    base = B(-x);
    e = 3;
    shown = B(kind === 'cube' ? -(x ** 3) : x ** 3);
    tex = `(-${x})^{3} = ${shown.n}`;
    if (kind === 'cubeSign') trap = 'odd-sign';
  } else {
    e = int(rand, 3, 5);
    base = B(10);
    shown = B(kind === 'ten' ? 10 ** e : 10 * e);
    tex = `10^{${e}} = ${shown.n}`;
    if (kind === 'tenTimes') trap = 'power-times';
  }
  return { id, text: `$${tex}$`, base, e, shown, bin: ratEq(ratPow(base, e), shown) ? 'yes' : 'no', trap };
}

/** Three equalities of powers: squares of whole and negative numbers (level 1); decimals, fractions, cubes, powers of ten (2). */
function powerSort(rand, level) {
  const shapes =
    level === 1
      ? [
          ['sq', 'neg', 'times'],
          ['neg', 'sign', 'sq'],
          ['sq', 'sign', 'times'],
          ['neg', 'times', 'sign'],
          ['sign', 'sq', 'neg'],
        ]
      : [
          ['decSlip', 'frac', 'cube'],
          ['dec', 'fracTop', 'ten'],
          ['cubeSign', 'dec', 'frac'],
          ['tenTimes', 'cube', 'dec'],
          ['frac', 'cubeSign', 'decSlip'],
          ['fracTop', 'ten', 'cube'],
        ];
  const kinds = shuffle(rand, pick(rand, shapes));
  const cards = [];
  for (const kind of kinds) {
    let c = powerCard(rand, kind, `c${cards.length + 1}`);
    // three different bases: never the same number twice on the table
    for (let i = 0; i < 40 && cards.some((o) => o.text === c.text || Math.abs(o.base.n) === Math.abs(c.base.n)); i += 1)
      c = powerCard(rand, kind, c.id);
    cards.push(c);
  }
  return {
    gesture: 'sort',
    prompt: 'هل كلّ مساواة صحيحة؟ أرسلها إلى صندوقها.',
    bins: [
      { id: 'yes', label: 'صحيحة' },
      { id: 'no', label: 'خاطئة' },
    ],
    cards,
  };
}

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

/** The worked example: the power as a product of equal factors, step by step; its first step answers the mistake shown. */
function powerExample(rand, level, { mistake = null } = {}) {
  if (mistake === 'odd-sign') {
    const x = int(rand, 2, 4);
    return {
      title: `مكعّب العدد ${-x}`,
      steps: [
        `الأُسّ 3 يعني ثلاثة عوامل: $(-${x})^{3} = (-${x}) \\times (-${x}) \\times (-${x})$.`,
        `العاملان الأوّلان: $(-${x}) \\times (-${x}) = ${x * x}$ — جداء عددين سالبين موجب.`,
        `ثمّ العامل الثالث: $${x * x} \\times (-${x}) = -${x ** 3}$.`,
        `أكتب: $(-${x})^{3} = -${x ** 3}$.`,
      ],
    };
  }
  if (mistake === 'decimal-places') {
    const t = int(rand, 2, 9);
    return {
      title: `مربّع العدد العشري ${decTex(t, 1).replace('{,}', ',')}`,
      steps: [
        `$(${decTex(t, 1)})^{2} = ${decTex(t, 1)} \\times ${decTex(t, 1)}$.`,
        `أضرب دون الفاصلة: $${t} \\times ${t} = ${t * t}$.`,
        'في كلّ عامل رقم واحد بعد الفاصلة، ففي الجداء رقمان بعدها.',
        `أكتب: $(${decTex(t, 1)})^{2} = ${decTex(t * t, 2)}$.`,
      ],
    };
  }
  if (mistake === 'fraction-one-term' || (level === 2 && mistake !== 'power-times' && mistake !== 'square-sign')) {
    let p;
    let q;
    do {
      q = int(rand, 3, 9);
      p = int(rand, 2, q - 1);
    } while (gcdOf(p, q) !== 1);
    return {
      title: `مربّع الكسر ${p} على ${q}`,
      steps: [
        `$${POW_FRAC(p, q)}^{2} = \\frac{${p}}{${q}} \\times \\frac{${p}}{${q}}$.`,
        `نضرب البسط في البسط والمقام في المقام: $\\frac{${p} \\times ${p}}{${q} \\times ${q}}$.`,
        `أكتب: $${POW_FRAC(p, q)}^{2} = \\frac{${p * p}}{${q * q}}$ — البسط والمقام كلاهما مربّع.`,
      ],
    };
  }
  const x = pick(rand, SQ_BASES[1]);
  const first =
    mistake === 'power-times'
      ? `$${x}^{2}$ ليس $${x} \\times 2$: الأُسّ 2 يعني عاملين متساويين، $${x}^{2} = ${x} \\times ${x}$.`
      : mistake === 'square-sign'
        ? `$(-${x})^{2} = (-${x}) \\times (-${x})$: جداء عددين سالبين موجب.`
        : `المربّع جداء العدد في نفسه: $${x}^{2} = ${x} \\times ${x}$.`;
  return {
    title: `مربّع العدد ${x}`,
    steps: [
      first,
      `$${x} \\times ${x} = ${x * x}$، إذن $${x}^{2} = ${x * x}$.`,
      `ولعدد سالب: $(-${x})^{2} = (-${x}) \\times (-${x}) = ${x * x}$.`,
    ],
  };
}

export const FAMILIES = {
  '1am.m1.r01': {
    item: '1am.m1.r01',
    name: 'الجمع والطرح والضرب',
    icon: '✖️',
    // NO instrument: this kit is shown BEFORE « القسمة الإقليدية », and the only tool that writes products and subtractions
    // (« القسمة على الورقة ») is the one that lesson itself introduces — a family's instrument belongs to a lesson the student
    // has already studied (launchkit.test.js). The capsule skips its lab step, the result shows no « مختبري » button.
    labTool: null,
    mistakes: ['table-slip', 'borrow-forgot', 'order-ops', 'add-for-sub'],
    forms: { 1: ['write', 'place'], 2: ['write', 'sort'] },
    make: (rand, level, form, { first = false } = {}) =>
      form === 'place' ? calcPlace(rand) : form === 'sort' ? calcSort(rand) : calcWrite(rand, level, first),
    example: calcExample,
    rules: [
      {
        id: 'product',
        title: 'الضرب جمع متكرّر',
        text: 'الجداء $a \\times b$ هو مجموع $b$ مكرّرًا $a$ مرّة: $4 \\times 6 = 6 + 6 + 6 + 6$',
        example: '$7 \\times 8 = 56$: في 7 علب، في كلّ واحدة 8 أقلام، 56 قلمًا.',
        check: { a: 56, b: 7, q: 8, r: 0 },
      },
      {
        id: 'order',
        title: 'نضرب قبل أن نجمع',
        text: 'في $a \\times b + c$ نحسب الجداء $a \\times b$ أوّلًا، ثمّ نضيف $c$.',
        example: '$6 \\times 9 + 5 = 54 + 5 = 59$.',
        check: { a: 59, b: 6, q: 9, r: 5 },
      },
      {
        id: 'difference',
        title: 'الطرح والتحقّق بالجمع',
        text: 'إذا كان $a - b = d$ فإنّ $d + b = a$: نتحقّق من الطرح بالجمع.',
        example: '$72 - 47 = 25$، و $25 + 47 = 72$.',
        check: { x: 72, y: 47, diff: 25 },
      },
    ],
    memo: [
      'الجداء $a \\times b$: نضيف $b$ إلى نفسه $a$ مرّة — $7 \\times 8 = 56$.',
      'في $6 \\times 9 + 5$ نضرب أوّلًا ثمّ نضيف: $54 + 5 = 59$.',
      'في الطرح نستلف عشرة إذا كان رقم الآحاد أصغر: $72 - 47 = 25$.',
      'نتحقّق من الطرح بالجمع: $25 + 47 = 72$.',
    ],
  },
  '4am.m1.r01': {
    item: '4am.m1.r01',
    // no `lesson` here: the home lesson of a tool is read from the learning net (`toolsForLesson`), and shared code names
    // no lesson that has a pack (lessonPack.test.js)
    name: 'قاسم عدد طبيعي',
    icon: '🔑',
    labTool: 'rows',
    mistakes: ['rest-not-zero', 'multiple-for-divisor', 'sentence-reversed'],
    forms: { 1: ['write', 'pick'], 2: ['sentences', 'pick'] },
    make: (rand, level, form, { first = false } = {}) =>
      form === 'pick'
        ? divisorPick(rand, level, first)
        : form === 'sentences'
          ? divisorSentences(rand)
          : divisorWrite(rand, level, first),
    example: divisorExample,
    rules: [
      {
        id: 'divisor',
        title: 'قاسم عدد طبيعي',
        text: 'العدد $b$ قاسم للعدد $a$ عندما يكون باقي القسمة الإقليدية للعدد $a$ على $b$ معدومًا: $a = b \\times k$',
        example: '$42 = 6 \\times 7$: العدد 6 قاسم للعدد 42.',
        check: { a: 42, b: 6, q: 7, r: 0 },
      },
      {
        id: 'sentences',
        title: 'جمل مختلفة، معنى واحد',
        text: '« $b$ قاسم للعدد $a$ » و « $a$ مضاعف للعدد $b$ » و « $a$ يقبل القسمة على $b$ » تعني الشيء نفسه.',
        example: '6 قاسم للعدد 54، و 54 مضاعف للعدد 6، و 54 يقبل القسمة على 6.',
        check: { a: 54, b: 6, q: 9, r: 0 },
      },
      {
        id: 'always',
        title: '1 والعدد نفسه',
        text: 'العدد 1 قاسم لكلّ عدد طبيعي، وكلّ عدد طبيعي غير معدوم قاسم لنفسه: $a = 1 \\times a$',
        example: '$17 = 1 \\times 17$: العددان 1 و 17 قاسمان للعدد 17.',
        check: { a: 17, b: 1, q: 17, r: 0 },
      },
    ],
    memo: [
      'العدد $b$ قاسم للعدد $a$ عندما يكون باقي قسمة $a$ على $b$ هو 0: $a = b \\times k$.',
      '« $b$ قاسم للعدد $a$ » و « $a$ مضاعف للعدد $b$ » و « $a$ يقبل القسمة على $b$ »: المعنى نفسه.',
      'العدد 1 والعدد نفسه قاسمان دائمًا.',
      'مثال: $42 = 6 \\times 7$، إذن 6 قاسم للعدد 42؛ و $44 = 6 \\times 7 + 2$، إذن 6 ليس قاسمًا للعدد 44.',
    ],
  },
  '4am.m1.r02': {
    item: '4am.m1.r02',
    // the name of the gesture, never the title of its home lesson (a lesson's title is foreign on another lesson's screen)
    name: 'تعيين قواسم عدد',
    icon: '📋',
    labTool: 'divisors',
    mistakes: ['partner-forgot', 'stop-early', 'one-and-itself', 'rest-not-zero'],
    forms: { 1: ['write', 'sort'], 2: ['sort', 'write'] },
    make: (rand, level, form, { first = false } = {}) =>
      form === 'sort' ? listSort(rand, level) : listWrite(rand, level, first),
    example: listExample,
    rules: [
      {
        id: 'pairs',
        title: 'القواسم أزواج',
        text: 'كلّ كتابة $a = b \\times k$ تعطي قاسمين للعدد $a$: العدد $b$ وشريكه $k$.',
        example: '$45 = 5 \\times 9$: العددان 5 و 9 قاسمان للعدد 45.',
        check: { a: 45, b: 5, q: 9, r: 0 },
      },
      {
        id: 'square',
        title: 'نجرّب حتّى المربّع',
        text: 'لتعيين قواسم $a$ نجرّب الأعداد التي مربّعها لا يتجاوز $a$، ونكتب مع كلّ قاسم شريكه.',
        example: '$7 \\times 7 = 49$ لا يتجاوز 50، و $8 \\times 8 = 64$ يتجاوزه: لقواسم 50 نجرّب من 1 إلى 7.',
        check: { a: 50, b: 5, q: 10, r: 0 },
      },
      {
        id: 'whole',
        title: 'القائمة كاملة',
        text: 'قائمة قواسم $a$ تبدأ بالعدد 1 وتنتهي بالعدد $a$ نفسه، ولا يدخلها عدد يترك باقيًا.',
        example: `قواسم 18: ${listText([1, 2, 3, 6, 9, 18])}، و $18 = 4 \\times 4 + 2$: العدد 4 ليس منها.`,
        check: { a: 18, b: 4, q: 4, r: 2 },
      },
    ],
    memo: [
      'كلّ كتابة $a = b \\times k$ تعطي قاسمين: $b$ وشريكه $k$.',
      'نجرّب الأعداد من 1 إلى أكبر عدد مربّعه لا يتجاوز $a$.',
      'العدد 1 والعدد $a$ نفسه في القائمة دائمًا.',
      `مثال: $45 = 1 \\times 45 = 3 \\times 15 = 5 \\times 9$، إذن قواسم 45 هي ${listText([1, 3, 5, 9, 15, 45])}.`,
    ],
  },
  '4am.m1.r03': {
    item: '4am.m1.r03',
    // the name of the gesture; its home lesson (« القاسم المشترك الأكبر لعددين طبيعيين ») is read from the net
    name: 'القاسم المشترك الأكبر لعددين',
    icon: '👑',
    // the instrument of its home lesson: « القواسم المشتركة » (three trays, the crown on the greatest)
    labTool: 'common',
    mistakes: ['common-not-greatest', 'divisor-of-one', 'smaller-not-divisor'],
    forms: { 1: ['write', 'common'], 2: ['sort', 'write'] },
    make: (rand, level, form, { first = false } = {}) =>
      form === 'common' ? pgcdCommon(rand) : form === 'sort' ? pgcdSort(rand) : pgcdWrite(rand, level, first),
    example: pgcdExample,
    rules: [
      {
        id: 'common',
        title: 'القاسم المشترك لعددين',
        text: 'القاسم المشترك للعددين $a$ و $b$ عدد يقسم $a$ ويقسم $b$ معًا.',
        example: '$36 = 4 \\times 9$ و $44 = 4 \\times 11$: العدد 4 قاسم مشترك للعددين 36 و 44.',
        check: { a: 36, b: 4, q: 9, r: 0 },
      },
      {
        id: 'greatest',
        title: 'القاسم المشترك الأكبر',
        text: 'نكتب قواسم كلّ عدد، ونأخذ أكبر عدد في القائمتين معًا: هو $\\mathrm{PGCD}(a ; b)$.',
        example: `قواسم 30: ${listText([1, 2, 3, 5, 6, 10, 15, 30])}، وقواسم 45: ${listText([1, 3, 5, 9, 15, 45])}؛ أكبرها في القائمتين 15: $\\mathrm{PGCD}(30 ; 45) = 15$.`,
        check: { a: 45, b: 15, q: 3, r: 0 },
      },
    ],
    memo: [
      'القاسم المشترك للعددين $a$ و $b$ يقسم $a$ ويقسم $b$ معًا.',
      'نكتب قواسم كلّ عدد، ثمّ الأعداد التي في القائمتين.',
      'أكبر عدد في القائمتين هو القاسم المشترك الأكبر $\\mathrm{PGCD}(a ; b)$.',
      `مثال: قواسم 30: ${listText([1, 2, 3, 5, 6, 10, 15, 30])}، وقواسم 45: ${listText([1, 3, 5, 9, 15, 45])}، إذن $\\mathrm{PGCD}(30 ; 45) = 15$.`,
    ],
  },
  '1am.m5.r02': {
    item: '1am.m5.r02',
    // the name of the gesture (two fractions that are equal); its home lesson is read from the net
    name: 'الكسور المتساوية',
    icon: '🍰',
    // an instrument of a lesson before its home lesson: « كاشف قابلية القسمة » finds a number that divides both terms
    labTool: 'rules',
    mistakes: ['subtract-not-divide', 'one-term-only'],
    forms: { 1: ['write', 'equal'], 2: ['sort', 'write'] },
    make: (rand, level, form, { first = false } = {}) =>
      form === 'write' ? fracWrite(rand, level, first) : fracSort(rand, form === 'equal' ? 1 : 2),
    example: fracExample,
    rules: [
      {
        id: 'equal',
        title: 'كسران متساويان',
        text: 'إذا قسمنا بسط كسر ومقامه على العدد نفسه، أو ضربناهما في العدد نفسه، نحصل على كسر يساويه.',
        example:
          '$\\frac{12}{20} = \\frac{12 \\div 4}{20 \\div 4} = \\frac{3}{5}$ و $\\frac{3}{5} = \\frac{3 \\times 7}{5 \\times 7} = \\frac{21}{35}$.',
        check: { a: 12, b: 4, q: 3, r: 0 },
      },
      {
        id: 'divide',
        title: 'نقسم البسط والمقام معًا',
        text: 'لنكتب كسرًا بعددين أصغر نقسم بسطه ومقامه معًا على عدد يقسمهما، ولا نطرح منهما العدد نفسه.',
        example:
          'العدد 3 يقسم 9 و 15: $\\frac{9}{15} = \\frac{3}{5}$؛ أمّا إذا طرحنا 6 فنحصل على $\\frac{3}{9}$، وهو لا يساويه.',
        check: { a: 15, b: 3, q: 5, r: 0 },
      },
    ],
    memo: [
      'نقسم بسط كسر ومقامه على العدد نفسه، أو نضربهما في العدد نفسه: نحصل على كسر يساويه.',
      'لنكتب كسرًا بعددين أصغر نقسم بسطه ومقامه على عدد يقسمهما معًا.',
      'لا نطرح العدد نفسه من البسط والمقام، ولا نقسم أحدهما وحده.',
      'مثال: $\\frac{12}{20} = \\frac{3}{5}$، بقسمة البسط والمقام على 4.',
    ],
  },
  '1am.m3.r01': {
    item: '1am.m3.r01',
    name: 'القسمة الإقليدية',
    icon: '➗',
    labTool: 'paper',
    mistakes: ['rest-too-big', 'swapped', 'rest-negative'],
    forms: { 1: ['write', 'place'], 2: ['write', 'sort'] },
    make: (rand, level, form, { first = false } = {}) =>
      form === 'place' ? divisionPlace(rand) : form === 'sort' ? divisionSort(rand) : divisionWrite(rand, level, first),
    example: divisionExample,
    // the rules a teacher revises with his class before the lesson, one per screen (« حصّة القسم », CLASS_SESSION.md §5bis)
    rules: [
      {
        id: 'division',
        title: 'القسمة الإقليدية',
        text: 'قسمة عدد طبيعي $a$ على عدد طبيعي غير معدوم $b$ تعطي حاصلًا $q$ وباقيًا $r$، حيث: $a = b \\times q + r$',
        example: '$47 = 6 \\times 7 + 5$: الحاصل 7 والباقي 5.',
        check: { a: 47, b: 6, q: 7, r: 5 },
      },
      {
        id: 'rest',
        title: 'الباقي أصغر من المقسوم عليه',
        text: 'في القسمة الإقليدية، الباقي $r$ دائمًا أصغر من المقسوم عليه $b$: $r < b$',
        example: 'في $38 = 5 \\times 7 + 3$: الباقي 3 أصغر من 5.',
        check: { a: 38, b: 5, q: 7, r: 3 },
      },
    ],
    memo: [
      'القسمة الإقليدية للعدد $a$ على $b$ تعطي حاصلًا $q$ وباقيًا $r$: $a = b \\times q + r$.',
      'الباقي $r$ دائمًا أصغر من المقسوم عليه $b$.',
      'مثال: $47 = 6 \\times 7 + 5$، و $5 < 6$.',
    ],
  },
  '2am.m1.r04': {
    item: '2am.m1.r04',
    name: 'القسمة الإقليدية على أيّ عدد',
    icon: '🧮',
    labTool: 'paper',
    mistakes: ['rest-too-big', 'quotient-zero', 'swapped'],
    forms: { 1: ['write', 'place'], 2: ['write', 'sort'] },
    make: (rand, level, form, { first = false } = {}) =>
      form === 'place' ? anyPlace(rand) : form === 'sort' ? anySort(rand) : anyWrite(rand, level, first),
    example: anyExample,
    rules: [
      {
        id: 'any-divisor',
        title: 'القسمة على أيّ عدد غير معدوم',
        text: 'لكلّ عدد طبيعي $a$ وعدد طبيعي غير معدوم $b$، مهما كان عدد أرقامه، حاصل $q$ وباقٍ $r$: $a = b \\times q + r$ مع $0 \\le r < b$',
        example: '$347 = 23 \\times 15 + 2$: الحاصل 15 والباقي 2، و $2 < 23$.',
        check: { a: 347, b: 23, q: 15, r: 2 },
      },
      {
        id: 'smaller',
        title: 'عدد أصغر من المقسوم عليه',
        text: 'إذا كان $a < b$ فإنّ $a = b \\times 0 + a$: الحاصل 0 والباقي $a$ نفسه.',
        example: '$9 = 14 \\times 0 + 9$: الحاصل 0 والباقي 9.',
        check: { a: 9, b: 14, q: 0, r: 9 },
      },
    ],
    memo: [
      'قسمة $a$ على أيّ عدد غير معدوم $b$: $a = b \\times q + r$ مع $0 \\le r < b$.',
      'أقدّر الحاصل بالعشرات أوّلًا: $23 \\times 10 = 230$ و $23 \\times 20 = 460$، إذن حاصل قسمة 347 على 23 بين 10 و 20.',
      'إذا كان $a < b$: الحاصل 0 والباقي $a$.',
      'مثال: $347 = 23 \\times 15 + 2$، و $2 < 23$.',
    ],
  },
  '1am.m3.r02': {
    item: '1am.m3.r02',
    name: 'قواعد قابلية القسمة',
    icon: '💡',
    labTool: 'rules',
    mistakes: ['last-digit', 'three-for-nine', 'even-for-four'],
    forms: { 1: ['two', 'five'], 2: ['three', 'nine', 'four'] },
    make: (rand, level, form, { first = false } = {}) =>
      rulesSort(rand, { two: 2, five: 5, three: 3, nine: 9, four: 4 }[form], first),
    example: rulesExample,
    rules: [
      {
        id: 'two-five',
        title: 'قابلية القسمة على 2 وعلى 5',
        text: 'يقبل عدد القسمة على 2 إذا كان آخر رقمه 0 أو 2 أو 4 أو 6 أو 8، ويقبل القسمة على 5 إذا كان آخر رقمه 0 أو 5.',
        example: 'العدد 135 يقبل القسمة على 5، ولا يقبل القسمة على 2.',
        check: { n: 135, yes: [5], no: [2] },
      },
      {
        id: 'three-nine',
        title: 'قابلية القسمة على 3 وعلى 9',
        text: 'يقبل عدد القسمة على 3 (أو على 9) إذا كان مجموع أرقامه من مضاعفات 3 (أو من مضاعفات 9).',
        example: '$1 + 3 + 8 = 12$: العدد 138 يقبل القسمة على 3، ولا يقبل القسمة على 9.',
        check: { n: 138, yes: [3], no: [9], sum: 12 },
      },
      {
        id: 'four',
        title: 'قابلية القسمة على 4',
        text: 'يقبل عدد القسمة على 4 إذا كان العدد المكوَّن من رقميه الأخيرين من مضاعفات 4.',
        example: 'العدد 316 يقبل القسمة على 4، لأنّ $16 = 4 \\times 4$.',
        check: { n: 316, yes: [4], no: [] },
      },
    ],
    memo: [
      'على 2: آخر رقم 0 أو 2 أو 4 أو 6 أو 8. على 5: آخر رقم 0 أو 5.',
      'على 3 (أو 9): مجموع الأرقام من مضاعفات 3 (أو 9).',
      'على 4: العدد المكوَّن من آخر رقمين من مضاعفات 4.',
      'مثال: $138$ → $1 + 3 + 8 = 12$، و 12 من مضاعفات 3: إذن 138 يقبل القسمة على 3.',
    ],
  },
  '3am.m3.r06': {
    item: '3am.m3.r06',
    // the name of the gesture; its home lesson (« قوة عدد نسبي », 3AM) is read from the net
    name: 'حساب قوّة عدد نسبي',
    icon: '🔢',
    // NO instrument: no lesson of 3AM has one in « مختبري » yet (the capsule skips its lab step)
    labTool: null,
    mistakes: ['power-times', 'square-sign', 'odd-sign', 'decimal-places', 'fraction-one-term'],
    forms: { 1: ['write', 'squares'], 2: ['sort', 'write'] },
    make: (rand, level, form, { first = false } = {}) =>
      form === 'write' ? powerWrite(rand, level, first) : powerSort(rand, form === 'squares' ? 1 : 2),
    example: powerExample,
    rules: [
      {
        id: 'square',
        title: 'مربّع عدد',
        text: 'مربّع العدد $a$ هو جداؤه في نفسه: $a^{2} = a \\times a$؛ والأُسّ يقول كم عاملًا متساويًا نضرب.',
        example: '$8^{2} = 8 \\times 8 = 64$، و $(-8)^{2} = (-8) \\times (-8) = 64$.',
        check: { x: 8, e: 2, v: 64 },
      },
      {
        id: 'sign',
        title: 'إشارة قوّة عدد سالب',
        text: 'قوّة عدد سالب موجبة إذا كان الأُسّ زوجيًّا، وسالبة إذا كان الأُسّ فرديًّا.',
        example: '$(-2)^{4} = 16$ و $(-2)^{3} = -8$.',
        check: { x: -2, e: 3, v: -8 },
      },
      {
        id: 'fraction-decimal',
        title: 'مربّع كسر ومربّع عدد عشري',
        text: 'في مربّع كسر نرفع البسط والمقام كليهما: $\\left(\\frac{p}{q}\\right)^{2} = \\frac{p^{2}}{q^{2}}$؛ وفي مربّع عدد عشري يتضاعف عدد الأرقام بعد الفاصلة.',
        example: '$\\left(\\frac{2}{3}\\right)^{2} = \\frac{4}{9}$ و $(0{,}3)^{2} = 0{,}09$.',
        check: { x: 0.3, e: 2, v: 0.09 },
      },
    ],
    memo: [
      'مربّع العدد: $a^{2} = a \\times a$ — مثال: $12^{2} = 144$.',
      'جداء عددين سالبين موجب: $(-11)^{2} = 121$؛ وجداء ثلاثة أعداد سالبة سالب: $(-2)^{3} = -8$.',
      'مربّع كسر: $\\left(\\frac{3}{5}\\right)^{2} = \\frac{9}{25}$؛ ومربّع عدد عشري: $(0{,}4)^{2} = 0{,}16$.',
      'قوى العدد 10: $10^{3} = 1000$ و $10^{5} = 100000$.',
    ],
  },
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
