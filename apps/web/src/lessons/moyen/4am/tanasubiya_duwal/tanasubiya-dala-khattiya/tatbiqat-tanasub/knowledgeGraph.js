/**
 * La carte PROGRESSIVE du درس 4 « تطبيقات التناسبية (النسب المئوية والمقادير المركبة) » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — نشاط 5 et ses réponses
 * (content/textbook.js › ACT5_ANSWERS), نشاط 6 (ACTIVITY_6), معارف et طرائق pp. 70–71 (KNOW,
 * METHOD_PERCENT), les phrases déclarées de la plateforme (TAHWIL, BIDALALA), et les `commonError`
 * / explications des exercices (content/exercises.js). Chaque nœud est gardé par l'item de
 * knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي (QCM 7 et 8) n'y est.
 *
 *                        [أخذ نسبة مئوية]                          m1
 *                  تخفيض ┌───────┴───────┐ زيادة
 *                   [التخفيض]           [الزيادة]
 *                      │ خطأ شائع          │ انتبه إلى
 *                 ⛔[طرح العدد t]     ⚠[أخذ أم زيادة؟]
 *                                         │ نستنتج (par le flanc)
 *                    [الدالة الخطية المرفقة]
 *                              │ ثم
 *                      [مقدار حاصل القسمة]                         m2
 *                    مثال ┌────┴────┐ نحوّل وحداته
 *              [السرعة القصوى]   [تحويل الوحدة] ─خطأ شائع→ ⛔[البسط وحده]
 *                                     │ ثم
 *                         [تغيّرات متتابعة]                         m3
 *                    مثال ┌────┴────┐ ثم
 *                 [خزان الماء]    [مقدار جداء]
 *                      │ خطأ شائع      │ نقرأ
 *            ⛔[جمع النسب المتتابعة]  [مقدار بدلالة آخر] ─نستخلص→ 🎯 [خلاصة]
 */
import { KNOW, ACT5_ANSWERS, ACTIVITY_6, METHOD_PERCENT, TAHWIL, BIDALALA } from './content/textbook';
import { EX } from './content/exercises';

export const KNOWLEDGE_GRAPH = {
  root: 'akhdh',
  nodes: [
    {
      id: 'akhdh', kind: 'concept', lane: 'center', requires: 'nisba-akhdh', notebook: true,
      title: 'أخذ نسبة مئوية', subtitle: '$x \\longmapsto \\dfrac{t}{100}x$',
      reveals: ['takhfid', 'ziyada'],
    },
    {
      id: 'takhfid', kind: 'relationship', lane: 'start', requires: 'takhfid-darb', notebook: true,
      title: 'التخفيض بنسبة مئوية', subtitle: '$1 - \\dfrac{t}{100}$',
      reveals: ['khata-tarh'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 20 (560 − 6), expliqué par l'exercice 3.
      id: 'khata-tarh', kind: 'common_mistake', lane: 'start', requires: 'takhfid-darb',
      title: 'طرح العدد t', subtitle: '$560 - 6$',
      context: {
        parts: [
          { role: 'wrong', text: EX['ex-20'].commonError },
          { role: 'why', text: EX['ex-3-1'].commonError },
          { role: 'right', text: EX['ex-20'].question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'ziyada', kind: 'relationship', lane: 'end', requires: 'ziyada-darb', notebook: true,
      title: 'الزيادة بنسبة مئوية', subtitle: '$1 + \\dfrac{t}{100}$',
      reveals: ['tanbih-akhdh', 'murfaqa'],
    },
    {
      // ⚠ انتبه — l'exercice 22 : prendre 5 % n'est pas augmenter de 5 %.
      id: 'tanbih-akhdh', kind: 'warning', lane: 'end', requires: 'ziyada-darb',
      title: 'أخذ أم زيادة؟', subtitle: '$0{,}05x \\neq 1{,}05x$',
      context: { text: EX['ex-22-1'].question.explain, note: KNOW.percentExamples[0] },
      reveals: [],
    },
    {
      id: 'murfaqa', kind: 'concept', lane: 'center', requires: 'dala-murfaqa', notebook: true,
      title: 'الدالة الخطية المرفقة', subtitle: '$y = 1{,}05x$',
      reveals: ['qisma'],
    },
    {
      id: 'qisma', kind: 'concept', lane: 'center', requires: 'miqdar-qisma', notebook: true,
      title: 'مقدار حاصل القسمة', subtitle: '$v = \\dfrac{d}{t}$',
      reveals: ['mithal-sura', 'tahwil'],
    },
    {
      id: 'mithal-sura', kind: 'example', lane: 'start', requires: 'miqdar-qisma',
      title: 'السرعة القصوى', subtitle: '$90km/h$',
      context: { text: ACTIVITY_6.questions[0], note: ACTIVITY_6.answers.speed },
      reveals: [],
    },
    {
      id: 'tahwil', kind: 'method', lane: 'end', requires: 'tahwil-murakkab', notebook: true,
      title: 'تحويل وحدة مقدار مركّب',
      reveals: ['khata-wahda', 'tatabu'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 27 (convertir le numérateur seul).
      id: 'khata-wahda', kind: 'common_mistake', lane: 'end', requires: 'tahwil-murakkab',
      title: 'تحويل البسط وحده', subtitle: '$m^3/s$',
      context: {
        parts: [
          { role: 'wrong', text: EX['ex-27'].commonError },
          { role: 'why', text: TAHWIL.text },
          { role: 'right', text: EX['ex-27'].question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'tatabu', kind: 'method', lane: 'center', requires: 'tatabu-darb', notebook: true,
      title: 'تغيّرات متتابعة', subtitle: '$0{,}7 \\times 1{,}15$',
      reveals: ['khazzan', 'jida'],
    },
    {
      id: 'khazzan', kind: 'example', lane: 'start', requires: 'tatabu-darb',
      title: 'خزان الماء', subtitle: '$24{,}15m^3$',
      context: { text: METHOD_PERCENT.exercise, note: METHOD_PERCENT.solution[2] },
      reveals: ['khata-jam'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 24 (3 % + 4 % = 7 %).
      id: 'khata-jam', kind: 'common_mistake', lane: 'start', requires: 'tatabu-darb',
      title: 'جمع النسب المتتابعة', subtitle: '$3\\% + 4\\%$',
      context: {
        parts: [
          { role: 'wrong', text: EX['ex-24-2'].commonError },
          { role: 'why', text: METHOD_PERCENT.method },
          { role: 'right', text: EX['ex-24-2'].question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'jida', kind: 'concept', lane: 'end', requires: 'miqdar-jida', notebook: true,
      title: 'مقدار جداء', subtitle: '$E = P \\times t$',
      reveals: ['bidalala'],
    },
    {
      id: 'bidalala', kind: 'retain', lane: 'center', requires: 'miqdar-bidalala', notebook: true,
      title: 'مقدار بدلالة مقدار آخر', subtitle: '$d = v \\times t$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — le tableau des معارف (p. 70) et la phrase de la grandeur quotient.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'miqdar-bidalala',
      title: 'خلاصة', subtitle: 'نضرب ولا نجمع',
      context: { text: ACT5_ANSWERS.fn, list: [KNOW.percentTable[1].means, KNOW.percentTable[2].means, KNOW.productQuantity, KNOW.quotientQuantity], note: BIDALALA.example },
      reveals: [],
    },
  ],
  edges: [
    { from: 'akhdh', to: 'takhfid', label: 'تخفيض' },
    { from: 'akhdh', to: 'ziyada', label: 'زيادة' },
    { from: 'takhfid', to: 'khata-tarh', label: 'خطأ شائع' },
    { from: 'ziyada', to: 'tanbih-akhdh', label: 'انتبه إلى' },
    { from: 'ziyada', to: 'murfaqa', label: 'نستنتج' },
    { from: 'murfaqa', to: 'qisma', label: 'ثم' },
    { from: 'qisma', to: 'mithal-sura', label: 'مثال' },
    { from: 'qisma', to: 'tahwil', label: 'نحوّل وحداته' },
    { from: 'tahwil', to: 'khata-wahda', label: 'خطأ شائع' },
    { from: 'tahwil', to: 'tatabu', label: 'ثم' },
    { from: 'tatabu', to: 'khazzan', label: 'مثال' },
    { from: 'khazzan', to: 'khata-jam', label: 'خطأ شائع' },
    { from: 'tatabu', to: 'jida', label: 'ثم' },
    { from: 'jida', to: 'bidalala', label: 'نقرأ' },
    { from: 'bidalala', to: 'khulasa', label: 'نستخلص' },
  ],
};
