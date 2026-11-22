/**
 * Les exercices du درس « قوى العدد 10 » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en
 * `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans
 * numéro, jamais montré à l'élève. Chaque ligne porte ses `data` (ce que la ligne affirme, sans LaTeX) : ./content.test.js les RECALCULE avec un code
 * INDÉPENDANT de `tenPowers.js` (BigInt) et contrôle que la bonne option est vraie et chaque distracteur FAUX.
 * Destinations (docs/sources/3am/unit3/extraction.json) : ex-1 … ex-12, act-1, act-3, self-11 → module 4 ; self-1, self-2, self-3 → le إختبار أولي (module 8).
 * Aucun produit ni quotient de puissances de 10 ici (frontière de l'unité) : une conversion qui en demanderait un est donnée en DÉCIMAL.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_quwa-adad-ashara_P1',
  P2: '3am_quwa-adad-ashara_P2',
  P3: '3am_quwa-adad-ashara_P3',
  P4: '3am_quwa-adad-ashara_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction, data) => ({ label, ...place(right, wrongs, at), correction, data });
const pw = (n) => T(`10^{${n}}`);

/* ── 1. الكتابة العشرية (ex-1, ex-3) ─────────────────────────────────────────────────────────────────────────────── */
const DEC = [
  { n: 4, right: '10\\,000', wrongs: ['40', '1\\,000'], why: '$10^4$ : الرقم 1 متبوعًا بأربعة أصفار، أي $10\\,000$ . ($40 = 10 \\times 4$ ، و $1\\,000$ فيه ثلاثة أصفار فقط.)' },
  { n: 9, right: '1\\,000\\,000\\,000', wrongs: ['90', '100\\,000\\,000'], why: '$10^9$ : الرقم 1 متبوعًا بتسعة أصفار. ($100\\,000\\,000$ فيه ثمانية أصفار فقط.)' },
  { n: -2, right: '0{,}01', wrongs: ['-100', '0{,}001'], why: '$10^{-2} = \\frac{1}{100} = 0{,}01$ : الرقم 1 في الرتبة الثانية بعد الفاصلة.' },
  { n: -7, right: '0{,}0000001', wrongs: ['-10\\,000\\,000', '0{,}00000001'], why: '$10^{-7}$ : الرقم 1 في الرتبة السابعة بعد الفاصلة، وقبله ستة أصفار بعد الفاصلة.' },
  { n: 0, right: '1', wrongs: ['0', '10'], why: '$10^0 = 1$ : لا عامل في الجداء.' },
  { n: 1, right: '10', wrongs: ['1', '100'], why: '$10^1 = 10$ : عامل واحد.' },
];

/* ── 2. على شكل قوة (ex-5, ex-6) ─────────────────────────────────────────────────────────────────────────────────── */
const FORM = [
  { value: '100\\,000', n: 5, wrongs: [6, -5], why: '$100\\,000$ : الرقم 1 متبوعًا بخمسة أصفار، إذن $10^5$ . (ستة أرقام لا ستة أصفار.)' },
  { value: '0{,}000001', n: -6, wrongs: [6, -5], why: '$0{,}000001$ : الرقم 1 في الرتبة السادسة بعد الفاصلة، إذن $10^{-6}$ .' },
  { value: '\\frac{1}{10^{4}}', n: -4, wrongs: [4, -5], why: '$\\frac{1}{10^4}$ مقلوب $10^4$ ، إذن هو $10^{-4}$ ($= 0{,}0001$).' },
  { value: '\\frac{1}{10^{-3}}', n: 3, wrongs: [-3, -4], why: '$10^{-3}$ مقلوب $10^3$ ، فمقلوب $10^{-3}$ هو $10^3$ ($= 1\\,000$).' },
];

/* ── 3. الأسماء (ex-2, ex-4, ex-7) ───────────────────────────────────────────────────────────────────────────────── */
const NAMES = [
  { name: 'مئة ألف', n: 5, wrongs: [6, 3], why: 'مئة ألف $= 100\\,000$ : الرقم 1 متبوعًا بخمسة أصفار.' },
  { name: 'مئة مليار', n: 11, wrongs: [8, 9], why: 'مئة مليار $= 100\\,000\\,000\\,000$ : الرقم 1 متبوعًا بأحد عشر صفرًا.' },
  { name: 'جزء من مليون', n: -6, wrongs: [6, -5], why: 'جزء من مليون $= 0{,}000001$ : الرقم 1 في الرتبة السادسة بعد الفاصلة.' },
  { name: 'ألف مليار', n: 12, wrongs: [13, 9], why: 'ألف مليار $= 1\\,000\\,000\\,000\\,000$ : الرقم 1 متبوعًا باثني عشر صفرًا.' },
];

/* ── 4. الوحدات (ex-10, ex-11, ex-12, act-1) — chaque قيمة est donnée en décimal ───────────────────────────────────── */
const UNITS = [
  { label: '1\\ \\mathrm{km} = 10^{?}\\ \\mathrm{m}', factor: '1000', n: 3, wrongs: [-3, 2], why: '$1\\ \\mathrm{km} = 1000\\ \\mathrm{m}$ : كيلو بادئة للأضعاف، $1000 = 10^3$ .' },
  { label: '1\\ \\mathrm{g} = 10^{?}\\ \\mathrm{mg}', factor: '1000', n: 3, wrongs: [-3, 2], why: '$1\\ \\mathrm{g} = 1000\\ \\mathrm{mg}$ ، و $1000 = 10^3$ .' },
  { label: '1\\ \\mathrm{mm} = 10^{?}\\ \\mathrm{m}', factor: '0.001', n: -3, wrongs: [3, -2], why: '$1\\ \\mathrm{mm} = 0{,}001\\ \\mathrm{m}$ : ميلي بادئة للأجزاء، $0{,}001 = 10^{-3}$ .' },
  { label: '1\\ \\mathrm{To} = 1\\,000\\,000\\,000\\,000\\ \\text{octets} = 10^{?}\\ \\text{octets}', factor: '1000000000000', n: 12, wrongs: [13, 11], why: 'الرقم 1 متبوعًا باثني عشر صفرًا هو $10^{12}$ .' },
  { label: '1\\ \\mathrm{m^2} = 100 \\times 100 = 10\\,000\\ \\mathrm{cm^2} = 10^{?}\\ \\mathrm{cm^2}', factor: '10000', n: 4, wrongs: [2, 5], why: '$10\\,000$ : الرقم 1 متبوعًا بأربعة أصفار، إذن $10^4$ . (مربّع ضلعه 100 cm .)' },
  { label: '1\\ \\mathrm{L} = 1\\ \\mathrm{dm^3} = 1\\,000\\ \\mathrm{cm^3} = 10^{?}\\ \\mathrm{cm^3}', factor: '1000', n: 3, wrongs: [-3, 2], why: '$1\\,000 = 10^3$ . (مكعّب حرفه 10 cm .)' },
];

/* ── 5. صحيح أم خاطئ؟ (ex-8, ex-9) ────────────────────────────────────────────────────────────────────────────────── */
const TF = [
  { label: '10^6 = 6\\,000\\,000', claim: '10^{6}=6000000', truth: false, why: '$10^6 = 1\\,000\\,000$ : الأس يعدّ الأصفار ولا يضرب فيها.' },
  { label: '10^6 = 10 \\times 10 \\times 10 \\times 10 \\times 10 \\times 10', claim: '10^{6}=10*10*10*10*10*10', truth: true, why: 'ستة عوامل كلّها 10 .' },
  { label: '10^{-3} = -1\\,000', claim: '10^{-3}=-1000', truth: false, why: 'الأس السالب لا يجعل العدد سالبًا : $10^{-3} = 0{,}001$ .' },
  { label: '10^{-3} = 0{,}001', claim: '10^{-3}=0.001', truth: true, why: 'الرقم 1 في الرتبة الثالثة بعد الفاصلة.' },
  { plain: 'جزء من مليار $= 10^{-9}$', claim: '10^{-9}=0.000000001', truth: true, why: 'جزء من مليار $= 0{,}000000001$ : الرقم 1 في الرتبة التاسعة.' },
];

/* ── 6. k × 10ⁿ (self-11) ─────────────────────────────────────────────────────────────────────────────────────────── */
const KN = [
  { label: '4\\,000 = 4 \\times 10^{?}', k: '4', value: '4000', n: 3, wrongs: [4, 2], why: '$4\\,000 = 4 \\times 1\\,000 = 4 \\times 10^3$ .' },
  { label: '250\\,000 = 25 \\times 10^{?}', k: '25', value: '250000', n: 4, wrongs: [5, 6], why: '$250\\,000 = 25 \\times 10\\,000 = 25 \\times 10^4$ .' },
  { label: '0{,}0003 = 3 \\times 10^{?}', k: '3', value: '0.0003', n: -4, wrongs: [4, -3], why: '$0{,}0003 = 3 \\times 0{,}0001 = 3 \\times 10^{-4}$ .' },
  { plain: '36 مليونًا $= 36 \\times 10^{?}$', k: '36', value: '36000000', n: 6, wrongs: [7, 3], why: 'مليون $= 10^6$ ، إذن $36 \\text{ مليونًا} = 36 \\times 10^6 = 36\\,000\\,000$ .' },
];

export const EXERCISES = [
  {
    id: 'ex-1', source: S('ex-1', 46), cites: [S('ex-3', 46)],
    learningPointId: LP.P3, difficulty: 'facile',
    statement: 'اختر الكتابة العشرية لكل قوة.',
    interaction: 'batch',
    question: { rows: DEC.map((d, i) => row(pw(d.n), T(d.right), d.wrongs.map(T), i + 1, d.why, { kind: 'dec', n: d.n })), explain: 'للأس الموجب نعدّ الأصفار بعد الرقم 1 ، وللأس السالب نعدّ رتبة الرقم 1 بعد الفاصلة.' },
    commonError: 'ضرب العدد 10 في الأس ($10^4 = 40$).',
  },
  {
    id: 'ex-6', source: S('ex-6', 46), cites: [S('ex-5', 46)],
    learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'اكتب كل عدد على شكل قوة للعدد 10 ، أي اختر الأس.',
    interaction: 'batch',
    question: { rows: FORM.map((f, i) => row(T(f.value), pw(f.n), f.wrongs.map(pw), i, f.why, { kind: 'form', value: f.value, n: f.n })), explain: 'نعدّ الأصفار أو رتبة الرقم 1 ، والمقلوب يغيّر إشارة الأس.' },
    commonError: 'عدّ الأرقام بدل الأصفار ($100\\,000 = 10^6$).',
  },
  {
    id: 'ex-2', source: S('ex-2', 46), cites: [S('ex-4', 46), S('ex-7', 46)],
    learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'اختر القوة المناسبة لكل اسم.',
    interaction: 'batch',
    question: { rows: NAMES.map((m, i) => row(m.name, pw(m.n), m.wrongs.map(pw), i + 2, m.why, { kind: 'name', name: m.name, n: m.n })), explain: 'نكتب العدد بالأرقام ثم نعدّ الأصفار أو رتبة الرقم 1 .' },
    commonError: 'قراءة «مئة مليار» كأنها «مئة مليون» ($10^8$).',
  },
  {
    id: 'ex-10', source: S('ex-10', 46), cites: [S('ex-11', 46), S('ex-12', 46), S('act-1', 40, 'أنشطة')],
    learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'أكمل كل مساواة بالأس المناسب.',
    interaction: 'batch',
    question: { rows: UNITS.map((u, i) => row(T(u.label), pw(u.n), u.wrongs.map(pw), i, u.why, { kind: 'unit', factor: u.factor, n: u.n })), explain: 'نكتب العدد بالأرقام ثم نعدّ الأصفار أو الرتبة.' },
    commonError: 'قراءة بادئة الجزء كأنها بادئة المضاعف ($1\\ \\mathrm{mm} = 10^3\\ \\mathrm{m}$).',
  },
  {
    id: 'ex-8', source: S('ex-8', 46), cites: [S('ex-9', 46)],
    learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'أصحيحة كل مساواة أم خاطئة؟',
    interaction: 'batch',
    question: { rows: TF.map((t) => ({ label: t.plain ?? T(t.label), options: ['صحيحة', 'خاطئة'], correct: t.truth ? 0 : 1, correction: t.why, data: { kind: 'tf', claim: t.claim, truth: t.truth } })), explain: 'نحوّل كل قوة إلى كتابتها العشرية ثم نقارن.' },
    commonError: 'قراءة $10^6$ كأنها $6\\,000\\,000$.',
  },
  {
    id: 'act-3', source: S('act-3', 40, 'أنشطة'),
    learningPointId: LP.P3, difficulty: 'facile',
    statement: 'كم صفرًا في الكتابة العشرية لـ $10^{15}$ ؟',
    interaction: 'numeric',
    question: { prompt: 'عدد الأصفار:', expected: 15, explain: '$10^{15}$ هو الرقم 1 متبوعًا بـ 15 صفرًا.' },
    commonError: 'عدّ 16 (الأرقام) بدل 15.',
  },
  {
    id: 'act-3-rank', source: S('act-3', 40, 'أنشطة'),
    learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'في الكتابة العشرية لـ $10^{-14}$ ، ما رتبة الرقم 1 بعد الفاصلة؟',
    interaction: 'numeric',
    question: { prompt: 'الرتبة:', expected: 14, explain: '$10^{-14}$ : الرقم 1 في الرتبة 14 بعد الفاصلة، وقبله 13 صفرًا بعد الفاصلة.' },
    commonError: 'عدّ 13 (الأصفار بعد الفاصلة) بدل الرتبة.',
  },
  {
    id: 'self-11', source: S('self-11', 49, 'أؤكّد تعلّماتي'),
    learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'اختر الأس الذي يجعل المساواة صحيحة.',
    interaction: 'batch',
    question: { rows: KN.map((x, i) => row(x.plain ?? T(x.label), pw(x.n), x.wrongs.map(pw), i + 1, x.why, { kind: 'kn', k: x.k, value: x.value, n: x.n })), explain: 'نقسم العدد على $k$ ثم نعدّ الأصفار أو الرتبة.' },
    commonError: 'ترك $k$ في العدد وعدّ كل الأصفار ($250\\,000 = 25 \\times 10^5$).',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: src('self-1', 49, 'أؤكّد تعلّماتي'), tex: '10^{4}', options: ['10\\,000', '40', '1\\,000', '100\\,000'], correct: 0 },
  { id: 'E2', source: src('self-3', 49, 'أؤكّد تعلّماتي'), cites: [src('self-2', 49, 'أؤكّد تعلّماتي')], tex: '10^{-2}', options: ['0{,}01', '-100', '0{,}001', '-20'], correct: 0 },
  { id: 'E3', source: null, tex: '10^{0}', options: ['1', '0', '10'], correct: 0 },
  { id: 'E4', source: null, tex: '0{,}000001', options: ['10^{-6}', '10^{-5}', '10^{6}', '10^{-7}'], correct: 0 },
  { id: 'E5', source: null, tex: '3\\,000\\,400', options: ['3 \\times 10^{6} + 4 \\times 10^{2}', '3 \\times 10^{6} + 4 \\times 10^{3}', '3 \\times 10^{7} + 4 \\times 10^{2}', '3 \\times 10^{5} + 4 \\times 10^{2}'], correct: 0 },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
