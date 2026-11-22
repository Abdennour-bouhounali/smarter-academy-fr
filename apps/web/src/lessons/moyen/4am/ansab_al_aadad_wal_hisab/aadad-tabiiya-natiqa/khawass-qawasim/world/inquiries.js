/**
 * THE FOUR INVESTIGATIONS of lesson « خواص قواسم عدد طبيعي » — its numbers and its words (the screens and their logic
 * are the world's: `divisorIsles/InquiryCombine.jsx`, `InquiryProof.jsx`, `inquiry.js`; the contract: GAME_WORLD.md
 * « استكشف », « spec shapes »). Each key is FOUND by an experiment of its own nature, never by the same mirror:
 *
 *   JOIN     two gaps the plank 7 fills (21 and 35), glued then cut; then gaps it fills only one of, and two gaps it
 *            fills neither of whose glued gap it fills anyway (22 + 20 = 42). He says BEFORE the planks are laid again.
 *   STACK    the gap 18 and the plank 6, repeated 2, 3, 10 and 100 times; then a gap the plank does NOT fill (21 with
 *            14) where two copies are filled anyway.
 *   PEEL     the island's long gap 735 and its bridges of 280: two fit, a piece of 175 is left. For each plank of the
 *            table he says whether it fills the piece; then he BUILDS his claim from the columns (`writes`).
 *   LETTERS  the stone: « d divides a and b — does it divide a + b, for EVERY number? » — numbers first, then the
 *            numbers change and one is hidden; then a proof assembled from cards (`writes`). Its two letters are k and
 *            k′ (a = d × k, b = d × k′): the SAME pair on the tablet he then receives, in the trainer and in the memo.
 * No sentence here states a rule: each one says what the strips, the table or the numbers have just done.
 * Arabic: a count is agreed with what it counts (one, two, 3–10, 11 and more) by the helpers below — never « 2 ألواح ».
 */
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';
import { NUMBERS } from './story';

const math = (s) => `$${s.replaceAll('×', '\\times')}$`;
/** The cells left, as the SUBJECT of « بقيت »: « خانة واحدة », « خانتان », « 5 خانات », « 12 خانة ». */
const left = (r) => (r === 1 ? 'خانة واحدة' : r === 2 ? 'خانتان' : r <= 10 ? `${r} خانات` : `${r} خانة`);
/** The cells cut off, as the OBJECT of « نقصّ »: « خانتين », « 5 خانات », « 21 خانة ». */
const cut = (n) => (n === 1 ? 'خانة واحدة' : n === 2 ? 'خانتين' : n <= 10 ? `${n} خانات` : `${n} خانة`);
/** The copies he glues, as the OBJECT of « نلصق »: « نسختين », « 3 نسخ », « 100 نسخة ». */
const copies = (k) => (k === 1 ? 'نسخة واحدة' : k === 2 ? 'نسختين' : k <= 10 ? `${k} نسخ` : `${k} نسخة`);
const fill = (yes) => (yes ? 'يملأ' : 'لا يملأ');
/** « n ألواح طولها d », agreed with the count: one plank, two planks, more. */
const planksOf = (n, d) => (n === 1 ? `لوح واحد طوله ${d}` : n === 2 ? `لوحان طولهما ${d}` : `${planks(n)} طولها ${d}`);
/** What the planks did on a gap: laid with nothing left, laid with cells left, or too long to be laid. */
const laid = (f) =>
  f.holds
    ? `${planksOf(f.planks, f.d)}، ولا خانة باقية.`
    : f.planks === 0
      ? `اللوح ${f.d} أطول من الهوّة.`
      : `${planksOf(f.planks, f.d)}، وبقيت ${left(f.rest)}.`;
/** The planks his claim takes in that do NOT fill the piece, as the subject of the sentence. */
const intrudersSay = (n) =>
  n === 1
    ? 'لوح أخذته جملتك لا يملأ القطعة الباقية'
    : n === 2
      ? 'لوحان أخذتهما جملتك لا يملآن القطعة الباقية'
      : `${planks(n)} أخذتها جملتك لا تملأ القطعة الباقية`;
/** The planks his claim takes in, when every one of them fills the piece. */
const takenSay = (n) =>
  n === 1
    ? 'لوح واحد أخذته جملتك، وهو يملأ القطعة الباقية.'
    : n === 2
      ? 'لوحان أخذتهما جملتك، وكلاهما يملأ القطعة الباقية.'
      : `${planks(n)} أخذتها جملتك، وكلّها يملأ القطعة الباقية.`;
/** What a plank did on a gap, under its strip (plain: it is SVG text). */
const label = (n, d, { planks: p, rest }) =>
  p === 0 ? `${n} — اللوح أطول` : rest ? `${n} — ${planks(p)}، وبقيت ${left(rest)}` : `${n} — ${planks(p)}`;
const after = (guess, holds) => (guess == null ? '' : guess === holds ? ' كما توقّعت!' : ' لم يكن هذا توقّعك.');

const { join: J, stack: K, peel: P } = NUMBERS;
const [J1, J2] = J.gaps;
const [F1, F2] = J.foil;

// ───────────────────────── JOIN — « المجموع والفرق » ─────────────────────────
export const JOIN_INQUIRY = {
  kind: 'join',
  d: J.plank,
  rounds: [
    // the two gaps he has just crossed with the plank 7: glued, then the shorter cut off the longer
    { op: 'sum', a: J1, b: J2 },
    { op: 'diff', a: J2, b: J1 },
    // the plank fills one of the two gaps only
    { op: 'sum', a: J1, b: 30 },
    { op: 'diff', a: 40, b: J1 },
    // it fills neither — and the glued gap is filled anyway: shown, never hidden
    { op: 'sum', a: F1, b: F2 },
    // another plank, another pair it fills
    { op: 'sum', a: 18, b: 12, d: 6 },
  ],
  text: {
    lead: (d) => `اللوح ${d} أمامك على هوّتين. نصنع من الهوّتين هوّة واحدة: ماذا يفعل اللوح ${d} فيها؟`,
    goal: (d) => `الهدف: أن تعرف قبل البناء هل يملأ اللوح ${d} الهوّة الجديدة.`,
    label,
    ask: ({ op, a, b, d }) =>
      op === 'sum'
        ? `نلصق الهوّة ${b} بعد الهوّة ${a}. هل يملأ اللوح ${d} الهوّة الجديدة، دون أن تبقى خانة؟`
        : `نقصّ ${cut(b)} من الهوّة ${a}. هل يملأ اللوح ${d} الهوّة الباقية، دون أن تبقى خانة؟`,
    seen: (f, guess) =>
      `${math(`${f.a} ${f.op === 'sum' ? '+' : '-'} ${f.b} = ${f.value}`)}: ${laid(f)}${after(guess, f.holds)}`,
    foundLine: (f) =>
      `${math(`${f.a} ${f.op === 'sum' ? '+' : '-'} ${f.b} = ${f.value}`)} — اللوح ${f.d}: ${fill(f.fillsA)} ${f.a}، ${fill(f.fillsB)} ${f.b}، ${fill(f.holds)} ${f.value}`,
    yes: 'نعم، يملؤها',
    no: 'لا، تبقى خانات',
    next: 'هوّتان أخريان',
    done: 'أكتب قاعدتي',
  },
};

// ───────────────────────── STACK — « المضاعفات » ─────────────────────────
export const STACK_INQUIRY = {
  kind: 'stack',
  d: K.plank,
  base: K.bridge,
  times: [2, 3, 10, K.copies],
  // a gap the plank does NOT fill: some copies are filled anyway — a fact, never a verdict
  free: { d: 14, base: 21, times: [2, 3] },
  text: {
    lead: (d, base) => `الهوّة ${base} واللوح ${d}. نلصق نسخًا من الهوّة واحدة بعد الأخرى: هوّة واحدة طويلة.`,
    goal: (d) => `الهدف: أن تعرف قبل اللصق هل يملأ اللوح ${d} النسخ الملصوقة.`,
    label,
    ask: ({ d, base, k }) =>
      `نلصق ${copies(k)} من الهوّة ${base}. هل يملأ اللوح ${d} الهوّة الطويلة، دون أن تبقى خانة؟`,
    seen: (f, guess) => `${math(`${f.k} × ${f.base} = ${f.total}`)}: ${laid(f)}${after(guess, f.holds)}`,
    foundLine: (f) =>
      `${math(`${f.k} × ${f.base} = ${f.total}`)} — اللوح ${f.d} ${fill(f.fillsBase)} ${f.base}، و${fill(f.holds)} ${f.total}`,
    yes: 'نعم، يملؤها',
    no: 'لا، تبقى خانات',
    next: 'نسخ أخرى',
    done: 'أكتب قاعدتي',
  },
};

// ───────────────────────── PEEL — « باقي القسمة » ─────────────────────────
/**
 * The island's gap, then one of the platform's own. Each round holds a plank that fills the gap only (21, 5), one that
 * fills the bridge only (10, 14, 3) and one that fills both (5, 7, 35, 2): of the five claims the table allows, exactly
 * one takes in no plank that leaves the piece unfilled (`inquiries.test.js`).
 */
export const PEEL_INQUIRY = {
  kind: 'peel',
  writes: true,
  rounds: [
    { a: P.long, b: P.short, candidates: [5, 10, 21, 7, 14, P.plank] },
    { a: 100, b: 42, candidates: [2, 5, 3] },
  ],
  text: {
    lead: (a, b, ri) =>
      ri === 0
        ? `الهوّة الطويلة ${a} خانة، وكلّ جسر ${b} خانة. نضع الجسور عليها واحدًا بعد الآخر، حتى لا تتّسع لجسر آخر.`
        : `هوّة أخرى: ${a} خانة، وكلّ جسر ${b} خانة. نضع الجسور عليها حتى لا تتّسع لجسر آخر.`,
    goal: 'الهدف: أن تعرف أيّ الألواح يملأ القطعة الباقية، قبل أن يوضع عليها.',
    peelBtn: (b) => `ضع الجسور ${b}`,
    peeling: (a, b) => `الجسور ${b} توضع على الهوّة ${a}…`,
    piece: (r) => `القطعة الباقية: ${r}`,
    ask: ({ a, b, d, r, fitsA, fitsB }) =>
      `اللوح ${d} ${fill(fitsA)} ${a}، و${fill(fitsB)} ${b}. هل يملأ القطعة الباقية ${r}، دون أن تبقى خانة؟`,
    shown: (row, guess) =>
      `${
        row.fitsR
          ? `${math(`${row.r} = ${row.d} × ${row.r / row.d}`)}: اللوح ${row.d} يملأ القطعة.`
          : row.d > row.r
            ? `اللوح ${row.d} أطول من القطعة ${row.r}.`
            : `${math(`${row.r} = ${row.d} × ${Math.floor(row.r / row.d)} + ${row.r % row.d}`)}: بقيت ${left(row.r % row.d)}.`
      }${after(guess, row.fitsR)}`,
    cols: { plank: 'اللوح', a: 'يملأ الهوّة', b: 'يملأ الجسر', r: 'يملأ القطعة' },
    yes: 'نعم، يملؤها',
    no: 'لا يملؤها',
    next: 'لوح آخر',
    nextRound: 'هوّة أخرى',
    toClaim: 'ماذا وجدت؟',
    claimLead: 'ابنِ جملتك من أعمدة الجدول: أيّ لوح يملأ القطعة الباقية؟',
    claimIf: 'إذا كان اللوح',
    claimThen: 'فإنّه يملأ القطعة الباقية.',
    colLabel: { a: 'يملأ الهوّة', b: 'يملأ الجسر' },
    link: { and: 'و', or: 'أو' },
    claimAsk: 'اضغط عمودًا أو عمودين من الجدول.',
    claimFact: (judge) =>
      judge.intruders.length
        ? `${intrudersSay(judge.intruders.length)}: ${judge.intruders.map((f) => f.d).join(' و ')} (برتقالي في الجدول).`
        : 'جملتك لا تأخذ أيّ لوح من الجدول.',
    claimOk: (judge) => takenSay(judge.taken.length),
    seal: 'هذه قاعدتي',
  },
};

// ───────────────────────── LETTERS — « البرهان » ─────────────────────────
const kOf = (s) => s.a / s.d;
const k2Of = (s) => s.b / s.d;
const nums = (s) => `مع $d = ${s.d}$ و $a = ${s.a}$ و $b = ${s.b}$`;
/** How a line of the proof names what it uses (the tokens of `needs` / `gives`). */
const TOKEN = { k: '$k$', "k'": "$k'$", 'dk+dk': "$d \\times k + d \\times k'$", 'd(k+k)': "$d \\times (k + k')$" };

export const LETTERS_INQUIRY = {
  kind: 'letters',
  writes: true,
  statement: { given: ['$d$ يقسم $a$', '$d$ يقسم $b$'], goal: '$d$ يقسم $a + b$', gives: ['d|a', 'd|b'] },
  numbers: { value: (v) => v.a + v.b, by: (v) => v.d, max: 20 },
  samples: [
    { d: J.plank, a: J1, b: J2 },
    { d: 6, a: 18, b: 54 },
    { d: 4, a: 28, b: 12, hide: 'b' },
  ],
  show: ['d', 'a', 'b'],
  cards: [
    {
      id: 'ka',
      tex: '$d$ يقسم $a$: يوجد عدد طبيعي $k$ حيث $a = d \\times k$',
      ok: true,
      needs: ['d|a'],
      gives: ['k'],
      holdsOn: (s) => s.a === s.d * kOf(s) && Number.isInteger(kOf(s)),
    },
    {
      id: 'kb',
      tex: "$d$ يقسم $b$: يوجد عدد طبيعي $k'$ حيث $b = d \\times k'$",
      ok: true,
      needs: ['d|b'],
      gives: ["k'"],
      holdsOn: (s) => s.b === s.d * k2Of(s) && Number.isInteger(k2Of(s)),
    },
    {
      id: 'sum',
      tex: "$a + b = d \\times k + d \\times k'$",
      ok: true,
      needs: ['k', "k'"],
      gives: ['dk+dk'],
      holdsOn: (s) => s.a + s.b === s.d * kOf(s) + s.d * k2Of(s),
    },
    {
      id: 'fact',
      tex: "$a + b = d \\times (k + k')$",
      ok: true,
      needs: ['dk+dk'],
      gives: ['d(k+k)'],
      holdsOn: (s) => s.a + s.b === s.d * (kOf(s) + k2Of(s)),
    },
    {
      id: 'end',
      tex: "$k + k'$ عدد طبيعي، إذن $d$ يقسم $a + b$",
      ok: true,
      needs: ['d(k+k)'],
      holdsOn: (s) => Number.isInteger(kOf(s) + k2Of(s)) && (s.a + s.b) % s.d === 0,
    },
    // decoys — the lines students really write: the same letter twice, a product, a sum, one example
    {
      id: 'samek',
      tex: '$b = d \\times k$',
      ok: false,
      holdsOn: (s) => s.b === s.d * kOf(s),
      why: (s) => `${nums(s)}: $d \\times k = ${s.d} \\times ${kOf(s)} = ${s.a}$، لكنّ $b = ${s.b}$.`,
    },
    {
      id: 'times',
      tex: "$a + b = d \\times k \\times k'$",
      ok: false,
      holdsOn: (s) => s.a + s.b === s.d * kOf(s) * k2Of(s),
      why: (s) =>
        `${nums(s)}: $d \\times k \\times k' = ${s.d} \\times ${kOf(s)} \\times ${k2Of(s)} = ${s.d * kOf(s) * k2Of(s)}$، لكنّ $a + b = ${s.a + s.b}$.`,
    },
    {
      id: 'plus',
      tex: "$a + b = d + k + k'$",
      ok: false,
      holdsOn: (s) => s.a + s.b === s.d + kOf(s) + k2Of(s),
      why: (s) =>
        `${nums(s)}: $d + k + k' = ${s.d} + ${kOf(s)} + ${k2Of(s)} = ${s.d + kOf(s) + k2Of(s)}$، لكنّ $a + b = ${s.a + s.b}$.`,
    },
    {
      id: 'one',
      tex: `$${J1} + ${J2} = ${J1 + J2} = ${J.plank} \\times ${(J1 + J2) / J.plank}$، إذن $d$ يقسم $a + b$`,
      ok: false,
      holdsOn: (s) => s.a + s.b === J1 + J2,
      why: (s) => `${nums(s)}: $a + b = ${s.a + s.b}$، لا ${J1 + J2}. هذا السطر يتكلّم عن عددين فقط.`,
    },
  ],
  order: ['ka', 'kb', 'sum', 'fact', 'end'],
  text: {
    lead: 'حجر الجزيرة يسأل: إذا كان $d$ يقسم $a$ و $b$، هل يقسم $a + b$ مهما كانت الأعداد؟',
    goal: 'الهدف: أن تتأكّد لكلّ الأعداد، لا لأعداد هذا الحجر فقط.',
    numbersAsk: (v) => `$${v.a} + ${v.b} = ${v.d} \\times \\square$ — اضغط العدد الذي يأخذ مكان $\\square$.`,
    numbersOk: (v, q) => `$${v.a} + ${v.b} = ${v.a + v.b} = ${v.d} \\times ${q}$: المساواة تتحقّق.`,
    numbersMiss: (v, q) => `$${v.d} \\times ${q} = ${v.d * q}$، و $${v.a} + ${v.b} = ${v.a + v.b}$.`,
    carry: (v, before, q) =>
      `أعداد جديدة. سطرك السابق $${before.d} \\times ${q} = ${before.d * q}$، لكنّ $a + b$ الآن $${v.a + v.b}$.`,
    hidden: (v, before, q) =>
      `العدد $${v.hide}$ مخفيّ: تعرف فقط أنّ $${v.d}$ يقسمه.${
        before ? ` سطرك السابق ($${before.d} \\times ${q}$) لا يُحسب هنا.` : ''
      } لا شيء تحسبه.`,
    line: (v, q) => `$${v.a} + ${v.b} = ${v.d} \\times ${q}$`,
    nextSample: 'أعداد أخرى',
    toCards: 'إلى البطاقات',
    cardsLead: 'رتّب البطاقات في الورقة، سطرًا بعد سطر: كلّ سطر يستعمل ما كُتب فوقه فقط. بين البطاقات أسطر خاطئة.',
    cardsAsk: 'اختر بطاقة للسطر التالي.',
    givenLabel: 'المعطى',
    goalLabel: 'المطلوب',
    needs: (card, missing) =>
      `هذا السطر يستعمل ${missing.map((t) => TOKEN[t] ?? t).join(' و ')}، ولم يُكتب ذلك في سطر فوقه.`,
    proved: 'ورقتك كاملة: كلّ سطر جاء ممّا فوقه، حتى المطلوب.',
    done: 'إلى المرآة',
  },
};
