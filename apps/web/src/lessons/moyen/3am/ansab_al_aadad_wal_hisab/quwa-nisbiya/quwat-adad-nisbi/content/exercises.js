/**
 * Les exercices du درس « قوة عدد نسبي » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque
 * exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité
 * de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève. Chaque clé est CALCULÉE ici avec
 * `packages/core/arithmetic/powers.js` et RE-vérifiée par ./content.test.js avec un autre code (BigInt), qui contrôle aussi que
 * chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit3/extraction.json) : act-6 (application), ex-34 … ex-49, ex-51, ex-53 → module 4 ;
 * self-22 … self-25 → le إختبار أولي (module 8).
 */
import * as P from '@smarter-academy/core/arithmetic/powers.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_quwat-adad-nisbi_P1',
  P2: '3am_quwat-adad-nisbi_P2',
  P3: '3am_quwat-adad-nisbi_P3',
  P4: '3am_quwat-adad-nisbi_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });
/** Une puissance écrite « 5^{6} » d'un exposant — clé et distracteurs se lisent comme des exposants. */
const pw = (b, e) => T(`${b}^{${e}}`);
/** Une valeur exacte écrite en LaTeX (« -8 », « \frac{1}{9} »). */
const val = (x) => T(P.ratTex(x));

/* ── 1. نشاط الكتاب (act-6), réécrit : écrire sous la forme aⁿ — les règles appliquées ───────────────────────────── */
const FORMS = [
  { label: '5^2 \\times 5^4', b: 5, e: 6, wrongs: [8, 2], why: 'جداء قوتين لهما الأساس نفسه: $5^{2+4} = 5^6$ .' },
  { label: '7^3 \\times 7^{-5}', b: 7, e: -2, wrongs: [-15, 8], why: '$7^{3+(-5)} = 7^{-2}$ .' },
  { label: '\\frac{4^9}{4^3}', b: 4, e: 6, wrongs: [3, 12], why: 'حاصل قسمة: $4^{9-3} = 4^6$ .' },
  { label: '\\frac{6^2}{6^{-3}}', b: 6, e: 5, wrongs: [-1, -6], why: '$6^{2-(-3)} = 6^{5}$ .' },
  { label: '(9^2)^3', b: 9, e: 6, wrongs: [5, 8], why: 'قوة قوة: $9^{2 \\times 3} = 9^6$ .' },
  { label: '(2^{-3})^4', b: 2, e: -12, wrongs: [1, -7], why: '$2^{(-3) \\times 4} = 2^{-12}$ .' },
  { label: '3^{-4} \\times 3^{-2}', b: 3, e: -6, wrongs: [8, -2], why: '$3^{(-4)+(-2)} = 3^{-6}$ .' },
];

/* ── 2. حساب ذهني (ex-34), réécrit : le signe, le zéro, l'exposant négatif ───────────────────────────────────────── */
const MENTAL = [
  { label: '(-2)^3', v: P.pow(-2, 3), wrongs: ['8', '-6'], why: 'ثلاثة عوامل سالبة: الجداء سالب، $(-2)^3 = -8$ .' },
  { label: '-2^4', v: P.neg(P.pow(2, 4)), wrongs: ['16', '-8'], why: 'الأس يخصّ 2 وحده: $-2^4 = -(2^4) = -16$ .' },
  { label: '(-2)^4', v: P.pow(-2, 4), wrongs: ['-16', '8'], why: 'أربعة عوامل سالبة: الجداء موجب، $(-2)^4 = 16$ .' },
  { label: '3^{-2}', v: P.pow(3, -2), wrongs: ['-9', '-6'], why: 'مقلوب $3^2$ : $3^{-2} = \\frac{1}{9}$ .' },
  { label: '(-5)^0', v: P.pow(-5, 0), wrongs: ['0', '-5'], why: 'كل عدد غير معدوم أسّه 0 يساوي 1 .' },
  { label: '\\left(\\frac{2}{3}\\right)^3', v: P.pow(P.rat(2, 3), 3), wrongs: ['2/9', '6/9'], why: '$\\frac{2^3}{3^3} = \\frac{8}{27}$ .' },
];

/* ── 3. جداء قوتين لهما الأس نفسه (ex-35), réécrit : (ab)ⁿ = aⁿbⁿ lu à l'envers ─────────────────────────────────────── */
const SAME_EXP = [
  { label: '2{,}5^2 \\times 4^2', v: P.mul(P.pow(P.rat(5, 2), 2), P.pow(4, 2)), wrongs: ['10', '1000'], why: '$(2{,}5 \\times 4)^2 = 10^2 = 100$ .' },
  { label: '0{,}2^3 \\times 5^3', v: P.mul(P.pow(P.rat(1, 5), 3), P.pow(5, 3)), wrongs: ['10', '3'], why: '$(0{,}2 \\times 5)^3 = 1^3 = 1$ .' },
  { label: '25^2 \\times 4^2', v: P.mul(P.pow(25, 2), P.pow(4, 2)), wrongs: ['100', '1000'], why: '$(25 \\times 4)^2 = 100^2 = 10000$ .' },
  { label: '0{,}5^4 \\times 6^4', v: P.mul(P.pow(P.rat(1, 2), 4), P.pow(6, 4)), wrongs: ['3', '12'], why: '$(0{,}5 \\times 6)^4 = 3^4 = 81$ .' },
];

/* ── 4. الأولوية (ex-44 … ex-46), réécrit : les mêmes nombres, des parenthèses ailleurs ─────────────────────────── */
const PRIORITY = [
  { label: '(9 - 2 \\times 3)^2', v: P.pow(P.sub(9, 6), 2), wrongs: ['441', '3'], why: 'ما بين القوسين أوّلًا: $9 - 6 = 3$ ثم $3^2 = 9$ .' },
  { label: '9 - 2 \\times 3^2', v: P.sub(9, P.mul(2, P.pow(3, 2))), wrongs: ['63', '-27'], why: 'القوة أوّلًا ثم الضرب: $9 - 2 \\times 9 = 9 - 18 = -9$ .' },
  { label: '(9 - 2) \\times 3^2', v: P.mul(P.sub(9, 2), P.pow(3, 2)), wrongs: ['-9', '441'], why: '$7 \\times 9 = 63$ .' },
  { label: '9 - (2 \\times 3)^2', v: P.sub(9, P.pow(6, 2)), wrongs: ['-9', '9'], why: '$9 - 6^2 = 9 - 36 = -27$ .' },
];

const asRat = (t) => P.parseRat(t);
const valOrText = (w) => val(asRat(w));

export const EXERCISES = [
  {
    id: 'act-6', source: src('act-6', 41, 'أنشطة'), cites: [S('ex-36', 48), S('ex-37', 48), S('ex-41', 48), S('ex-42', 48), S('ex-43', 48), S('ex-48', 50, 'أتعمّق'), S('ex-53', 50, 'أتعمّق')],
    learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'اكتب كل عدد على الشكل $a^n$ .',
    interaction: 'batch',
    question: { rows: FORMS.map((f, i) => row(T(f.label), pw(f.b, f.e), f.wrongs.map((w) => pw(f.b, w)), i, f.why)), explain: 'نجمع الأسس في الجداء، نطرحها في حاصل القسمة، ونضربها في قوة القوة.' },
    commonError: 'ضرب الأسين في جداء قوتين ($5^2 \\times 5^4 = 5^8$).',
  },
  {
    id: 'ex-34', source: S('ex-34', 48), cites: [S('ex-38', 48)],
    learningPointId: LP.P1, difficulty: 'facile',
    statement: 'احسب ذهنيًا.',
    interaction: 'batch',
    question: { rows: MENTAL.map((m, i) => row(T(m.label), val(m.v), m.wrongs.map(valOrText), i + 1, m.why)), explain: 'الإشارة أوّلًا (عدد العوامل السالبة)، ثم القيمة.' },
    commonError: 'قراءة $-2^4$ كأنها $(-2)^4$ .',
  },
  {
    id: 'ex-35', source: S('ex-35', 48), cites: [S('ex-49', 50, 'أتعمّق')],
    learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب دون آلة حاسبة، بتجميع العاملين اللذين لهما الأس نفسه.',
    interaction: 'batch',
    question: { rows: SAME_EXP.map((m, i) => row(T(m.label), val(m.v), m.wrongs.map(valOrText), i + 2, m.why)), explain: '$a^n \\times b^n = (a \\times b)^n$ .' },
  },
  {
    id: 'ex-44', source: S('ex-44', 48), cites: [S('ex-45', 48), S('ex-46', 48)],
    learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'الأعداد نفسها والأقواس في أماكن مختلفة: احسب كل عبارة.',
    interaction: 'batch',
    question: { rows: PRIORITY.map((m, i) => row(T(m.label), val(m.v), m.wrongs.map(valOrText), i, m.why)), explain: 'الأقواس، ثم القوى، ثم الضرب، ثم الجمع والطرح.' },
    commonError: 'حساب $9 - 2$ قبل الضرب والقوة.',
  },
  {
    id: 'ex-39', source: S('ex-39', 48),
    learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'أكمل بعدد طبيعي: $6^2 + 8^2 = \\ldots^2$',
    interaction: 'numeric',
    question: { prompt: 'العدد الناقص:', expected: 10, explain: '$36 + 64 = 100 = 10^2$ .' },
  },
  {
    id: 'ex-40', source: S('ex-40', 48),
    learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'احسب $\\left(-\\frac{1}{2}\\right)^{-3}$ .',
    interaction: 'numeric',
    question: { prompt: 'القيمة:', expected: Number(P.ratText(P.pow(P.rat(-1, 2), -3))), explain: '$\\left(-\\frac{1}{2}\\right)^{-3} = \\frac{1}{\\left(-\\frac{1}{2}\\right)^3} = \\frac{1}{-\\frac{1}{8}} = -8$ .' },
    commonError: 'نسيان الإشارة: ثلاثة عوامل سالبة.',
  },
  {
    id: 'ex-47', source: S('ex-47', 48),
    learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'حديقة مربّعة الشكل مساحتها $7^{10}\\,\\mathrm{m}^2$ .',
    interaction: 'choice',
    question: { prompt: 'طول ضلعها بالمتر:', options: [pw(7, 5), pw(7, 8), pw(7, 20), pw(5, 7)], correct: 0, cols: 2, explain: '$(7^5)^2 = 7^{5 \\times 2} = 7^{10}$ : الضلع $7^5$ .' },
    commonError: 'قسمة الأس على 2 بطرح 2 ($7^8$).',
  },
  {
    id: 'ex-51', source: S('ex-51', 50, 'أتعمّق'),
    learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'العبارة $3^{20} + 3^{20} + 3^{20}$ تساوي:',
    interaction: 'choice',
    question: { options: [pw(3, 21), pw(9, 20), pw(3, 60), pw(9, 60)], correct: 0, cols: 2, explain: '$3^{20} + 3^{20} + 3^{20} = 3 \\times 3^{20} = 3^{21}$ .' },
    commonError: 'جمع الأسس في مجموع ($3^{60}$).',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: src('self-22', 49, 'أؤكّد تعلّماتي'), tex: '(-2)^5', options: ['-32', '32', '-10', '10'], correct: 0 },
  { id: 'E2', source: src('self-23', 49, 'أؤكّد تعلّماتي'), tex: '(5^3)^4', powers: true, options: ['5^{12}', '5^{7}', '5^{81}', '20^{3}'], correct: 0 },
  { id: 'E3', source: null, tex: '4^{-2}', options: ['1/16', '-16', '-8', '16'], correct: 0 },
  { id: 'E4', source: src('self-25', 49, 'أؤكّد تعلّماتي'), tex: '\\frac{2^{10}}{2}', powers: true, options: ['2^{9}', '1^{10}', '2^{5}', '2^{8}'], correct: 0 },
  { id: 'E5', source: src('self-24', 49, 'أؤكّد تعلّماتي'), tex: '-3 \\times 4^2', options: ['-48', '144', '-144', '48'], correct: 0 },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
