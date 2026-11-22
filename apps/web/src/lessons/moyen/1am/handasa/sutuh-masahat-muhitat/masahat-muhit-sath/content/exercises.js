/**
 * Les exercices du درس « مساحة سطح مستو ومحيطه » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres surfaces, autres nombres, la même
 * compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace
 * (traçabilité de `check:textbook`) ; jamais montré à l'élève (`SourceTag` est muet, `src()` sans `number`). Les surfaces sont celles de
 * ./figures.js (cellules) ; chaque clé est CALCULÉE ici à partir des cellules (`area`, `perimeter`) et RE-vérifiée, avec un autre code, par
 * ./content.test.js, qui contrôle aussi que chaque distracteur est FAUX.
 * Destinations (docs/sources/1am/unit11/extraction.json) : act-1 (application), ex-1 … ex-6, self-2 → module 4 ; deep-2 → مسألة 2 ;
 * أقوّم تعلّماتي 1 → le إختبار أولي (module 8).
 */
import { src } from '../../_unit/unitMeta.js';
import { SHAPES } from './figures.js';

export const LP = {
  P1: '1am_masahat-muhit-sath_P1',
  P2: '1am_masahat-muhit-sath_P2',
  P3: '1am_masahat-muhit-sath_P3',
};

/* ── Outils de rédaction : l'aire et le périmètre d'une forme de carreaux entiers, calculés d'ici (le test les recalcule autrement) ──── */
const cells = (id) => SHAPES[id].flatMap((row, r) => [...row].map((ch, c) => (ch === '#' ? [r, c] : null)).filter(Boolean));
export const area = (id) => cells(id).length;
export const perimeter = (id) => {
  const set = new Set(cells(id).map(([r, c]) => `${r},${c}`));
  let sides = 0;
  for (const [r, c] of cells(id)) for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!set.has(`${r + dr},${c + dc}`)) sides += 1;
  return sides;
};
const T = (s) => `$${s}$`;
const num = (n) => T(String(n).replace('.', '{,}'));
/** Les options d'une ligne : la bonne à la position `at`, les autres après elle dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; opts.splice(at % (wrongs.length + 1), 0, right); return { options: opts, correct: at % (wrongs.length + 1) }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });

const NAMES = { W: '①', X: '②', Y: '③', Z: '④' };
const TABLE = ['W', 'X', 'Y', 'Z'].flatMap((id, i) => [
  row(`مساحة السطح ${NAMES[id]} (بالبلاطات)`, num(area(id)), [num(perimeter(id)), num(area(id) - 1)], i, `نعدّ البلاطات التي تغطّي السطح ${NAMES[id]}: ${area(id)} (أمّا ${perimeter(id)} فعدد العصي حول الحدّ).`),
  row(`محيط السطح ${NAMES[id]} (بالعصي)`, num(perimeter(id)), [num(area(id)), num(perimeter(id) + 2)], i + 1, `نعدّ أضلاع البلاطات الواقعة على الحدّ كلّه: ${perimeter(id)} (أمّا ${area(id)} فعدد البلاطات).`),
]);

const SAME = ['نفس المساحة فقط', 'نفس المحيط فقط', 'نفس المساحة ونفس المحيط', 'لا نفس المساحة ولا نفس المحيط'];
const verdict = (a, b) => {
  const sa = area(a) === area(b); const sp = perimeter(a) === perimeter(b);
  return sa && sp ? 2 : sa ? 0 : sp ? 1 : 3;
};
const PAIRS = [['W', 'X'], ['W', 'Y'], ['X', 'Z'], ['Y', 'Z']];
const PAIR_ROWS = PAIRS.map(([a, b]) => ({
  label: `السطحان ${NAMES[a]} و ${NAMES[b]}`, options: SAME, correct: verdict(a, b),
  correction: `${NAMES[a]}: ${area(a)} بلاطات و ${perimeter(a)} عصا ؛ ${NAMES[b]}: ${area(b)} بلاطات و ${perimeter(b)} عصا.`,
}));

export const EXERCISES = [
  {
    id: 'act-1', source: src('act-1', 149, 'اكتشف'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'أربعة أسطح مرسومة على ورقة مرصوفة: كل خانة بلاطة، وضلع الخانة عصا من السياج. عيّن مساحة كلّ سطح (عدد بلاطاته) ومحيطه (عدد العصي التي تحيط به).',
    interaction: 'batch',
    question: { rows: TABLE, explain: 'المساحة نعدّها بالبلاطات، والمحيط نعدّه بالعصي على الحدّ: عددان مختلفان للسطح نفسه.' },
    commonError: 'الخلط بين عدد البلاطات وعدد العصي، أو عدّ البلاطات حول الحدّ فقط.',
  },
  {
    id: 'act-1-compare', source: src('act-1', 149, 'اكتشف'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'قارن بين السطوح الأربعة السابقة مثنى مثنى: ماذا يتساوى في كل زوج؟',
    interaction: 'batch',
    question: { rows: PAIR_ROWS, explain: 'نقارن عدد البلاطات ثم عدد العصي، كلًّا على حدة.' },
    commonError: 'الظنّ أنّ تساوي المساحة يعني تساوي المحيط أو العكس.',
  },
  {
    id: 'ex-1', source: src('ex-1', 155, 'أتمرّن'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'قصّ نجّار خيطًا ليحيط بالسطح المرسوم مرّة واحدة، دون زيادة ولا نقص. ضلع الخانة وحدة طول.',
    interaction: 'choice',
    question: {
      prompt: 'كم وحدة طول طول الخيط؟',
      options: [num(area('T')), num(perimeter('T')), num(perimeter('T') - 2)],
      correct: 1, cols: 3,
      explain: `الخيط يمرّ على حدّ السطح كله: نعدّ أضلاع الخانات الواقعة على الحدّ فنجد ${perimeter('T')}. العدد ${area('T')} هو عدد البلاطات، أي المساحة لا المحيط.`,
    },
    commonError: 'عدّ البلاطات بدل أضلاعها على الحدّ.',
  },
  {
    id: 'ex-2', source: src('ex-2', 155, 'أتمرّن'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'في الحوش (أ) و (ب) نُزعت بلاطة من مستطيل: في (أ) من زاويته، وفي (ب) من وسط ضلعه الأعلى.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'ماذا تقول عن مساحتي (أ) و (ب)؟', options: ['متساويتان', 'مساحة (أ) أكبر', 'مساحة (ب) أكبر'], correct: 0, correction: `في كلٍّ منهما ${area('N1')} بلاطة: نُزعت بلاطة واحدة من المستطيل نفسه.` },
        { label: 'أيّ الحوشين سياجه أطول؟', options: ['السياجان متساويان', '(أ)', '(ب)'], correct: 2, correction: `سياج (أ) ${perimeter('N1')} عصا وسياج (ب) ${perimeter('N2')} عصا: النزع من الوسط يُدخل السياج في الحوش.` },
        { label: 'كم عصا يوفّرها سياج (أ) بالنسبة إلى سياج (ب)؟', options: [num(perimeter('N2') - perimeter('N1')), num(0), num(4)], correct: 0, correction: `$${perimeter('N2')}-${perimeter('N1')}=${perimeter('N2') - perimeter('N1')}$ .` },
      ],
      explain: 'نزع بلاطة من الزاوية لا يغيّر المحيط، ونزعها من وسط ضلع يزيده بعصوين.',
    },
    commonError: 'الظنّ أنّ نقصان بلاطة ينقص المحيط دائمًا.',
  },
  {
    id: 'ex-3', source: src('ex-3', 155, 'أتمرّن'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'ثلاثة أسطح مرسومة على ورقة مرصوفة، وبعض خاناتها مقطوع بقطر إلى نصفين. عيّن مساحة كلّ سطح بوحدة البلاطة الكاملة.',
    interaction: 'batch',
    question: {
      rows: [
        row('مساحة السطح ①', num(7), [num(6), num(8)], 0, 'ست بلاطات كاملة ونصفان: نصفان بلاطة، إذن $6+1=7$ .'),
        row('مساحة السطح ②', num(11.5), [num(11), num(12)], 1, 'إحدى عشرة بلاطة كاملة ونصف واحد: $11+\\frac{1}{2}=11{,}5$ .'),
        row('مساحة السطح ③', num(11), [num(10), num(12)], 2, 'عشر بلاطات كاملة ونصفان: $10+1=11$ .'),
        { label: 'أيّ السطوح الثلاثة أكبر مساحة؟', options: ['①', '②', '③'], correct: 1, correction: '11,5 أكبر من 11 ومن 7.' },
      ],
      explain: 'نعدّ البلاطات الكاملة ثم نضمّ كل نصفين في بلاطة.',
    },
    commonError: 'إهمال الأنصاف أو عدّها بلاطات كاملة.',
  },
  {
    id: 'ex-4', source: src('ex-4', 155, 'أتمرّن'), cites: [src('ex-5', 155, 'أتمرّن'), src('ex-6', 155, 'أتمرّن')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'ستة أحواش مرسومة، كل حوش من بلاطات متماثلة، وزوج منها لكل سؤال. اختر في كل سؤال الزوج المناسب.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'زوج المحيط نفسه ومساحتان مختلفتان', options: ['(أ) و (ب)', '(ج) و (د)', '(هـ) و (و)'], correct: 0, correction: `(أ): ${area('P1a')} بلاطات وسياج ${perimeter('P1a')} ؛ (ب): ${area('P1b')} بلاطات وسياج ${perimeter('P1b')}.` },
        { label: 'زوج المساحة نفسها ومحيطان مختلفان', options: ['(هـ) و (و)', '(أ) و (ب)', '(ج) و (د)'], correct: 2, correction: `(ج): ${area('P2a')} بلاطات وسياج ${perimeter('P2a')} ؛ (د): ${area('P2b')} بلاطات وسياج ${perimeter('P2b')}.` },
        { label: 'زوج المساحة نفسها والمحيط نفسه مع شكلين مختلفين', options: ['(ج) و (د)', '(أ) و (ب)', '(هـ) و (و)'], correct: 2, correction: `(هـ): ${area('P3a')} بلاطات وسياج ${perimeter('P3a')} ؛ (و): ${area('P3b')} بلاطات وسياج ${perimeter('P3b')}.` },
      ],
      explain: 'نعدّ بلاطات كل حوش ثم عصي سياجه، ونقارن كلّ عدد على حدة.',
    },
    commonError: 'الاكتفاء بمقارنة الشكلين بالنظر.',
  },
  {
    id: 'self-2', source: src('self-2', 157, 'أقوّم تعلّماتي'), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'السطح المرسوم مساحته ست عشرة بلاطة. نبحث له عن مستطيل ومربّع لهما المساحة نفسها (بلاطات مرصوصة في صفوف).',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'مستطيل (عدد الصفوف × عدد البلاطات في الصفّ) له المساحة نفسها', options: [T('3\\times6'), T('2\\times8'), T('4\\times5')], correct: 1, correction: '$2\\times8=16$ ، أمّا $3\\times6=18$ و $4\\times5=20$ .' },
        { label: 'مربّع له المساحة نفسها', options: [T('3\\times3'), T('5\\times5'), T('4\\times4')], correct: 2, correction: '$4\\times4=16$ ، أمّا $3\\times3=9$ و $5\\times5=25$ .' },
        { label: 'هل لكلٍّ من المستطيل والمربّع المختارين محيط السطح المرسوم نفسه؟', options: ['نعم، كلاهما', 'لا، محيط كلٍّ منهما يخالف محيط السطح', 'المستطيل فقط'], correct: 1, correction: `محيط السطح ${perimeter('Q')} عصا، ومحيط المستطيل $2\\times8$ هو 20 عصا ومحيط المربّع $4\\times4$ هو 16 عصا.` },
      ],
      explain: 'لسطحٍ مساحته 16 مستطيلات ومربّعات تغطّي المساحة نفسها بمحيطات مختلفة.',
    },
    commonError: 'الظنّ أنّ المستطيل أو المربّع بالمساحة نفسها له المحيط نفسه.',
  },
];

/** « أقوّم تعلّماتي » 1 (p. 157) — repris dans le إختبار أولي (module 8). */
export const SELF = { 1: { source: src('self-1', 157, 'أقوّم تعلّماتي', 1) } };

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé et vérifie chaque distracteur
 * FAUX. `kind` dit ce que le test recalcule : `perimeterQuestion` (la seule question qui parle du bord), `areaOf` (l'aire de `shape` avec des
 * demi-carreaux), `unitCount` (n unités ① → n/2 unités ②), `pairVerdict` (le verdict sur le couple `pair`), `possible` (une affirmation vraie).
 */
export const FINAL = [
  { id: 'E1', skill: 'distinguish', lp: LP.P1, source: SELF[1].source, kind: 'perimeterQuestion',
    stem: 'أيّ هذه الأسئلة يُجاب عنه بمحيط السطح؟',
    options: ['كم مترًا من الشريط يلزم لإحاطة المسبح مرّة واحدة؟', 'كم بلاطة تغطّي أرض المسبح؟', 'كم بلاطة في كل صفّ من أرض المسبح؟', 'كم صفًّا من البلاطات تغطّي الأرض؟'], correct: 0, cols: 1,
    explain: 'الشريط يمرّ على حدّ المسبح: طوله هو المحيط. والأسئلة الأخرى تعدّ بلاطات تغطّي الأرض، أي تخصّ المساحة.' },
  { id: 'E2', skill: 'tiling', lp: LP.P2, source: SELF[1].source, kind: 'areaOf', shape: 'FS', area: '6,5',
    stem: 'ما مساحة السطح المرسوم، بوحدة المساحة وهي الخانة؟',
    options: ['$6{,}5$', '$7$', '$6$', '$8$'], correct: 0, cols: 2,
    explain: 'بلاطات كاملة: 2 في الصفّ الأعلى و 4 في الصفّ الأسفل، أي 6، ونصف بلاطة واحد: $6+\\frac{1}{2}=6{,}5$ .' },
  { id: 'E3', skill: 'units', lp: LP.P2, source: null, kind: 'unitCount', ones: 18, twos: '9',
    stem: 'مساحة سطح 18 وحدة ①، والوحدة ② ضعف الوحدة ①. كم وحدة ② مساحة هذا السطح؟',
    options: ['$9$', '$36$', '$18$', '$4{,}5$'], correct: 0, cols: 2,
    explain: 'الوحدة ② تغطّي ما تغطّيه وحدتان ①: نحتاج إلى نصف العدد: $18\\div2=9$ .' },
  { id: 'E4', skill: 'compare', lp: LP.P3, source: null, kind: 'pairVerdict', pair: ['Ga', 'Gb'], verdict: 'sameAreaOnly',
    stem: 'ماذا تقول عن مساحتي الحوشين (أ) و (ب) وعن محيطيهما؟',
    options: ['المساحتان متساويتان والمحيطان مختلفان', 'المساحتان والمحيطان متساويان', 'المحيطان متساويان والمساحتان مختلفتان', 'المساحتان مختلفتان والمحيطان مختلفان'], correct: 0, cols: 1,
    explain: 'في كلٍّ منهما ثماني بلاطات. وسياج (أ) اثنتا عشرة عصا وسياج (ب) أربع عشرة عصا.' },
  { id: 'E5', skill: 'compare', lp: LP.P3, source: null, kind: 'possible',
    stem: 'حوش مربّع من تسع بلاطات سياجه اثنتا عشرة عصا. أيّ العبارات صحيحة؟',
    options: ['يمكن أن يكون لحوش آخر سياجه اثنتا عشرة عصا وفيه ثماني بلاطات فقط', 'كل حوش سياجه اثنتا عشرة عصا فيه تسع بلاطات', 'كل حوش فيه تسع بلاطات سياجه اثنتا عشرة عصا', 'لا يمكن أن يكون لحوشين المحيط نفسه ومساحتان مختلفتان'], correct: 0, cols: 1,
    explain: 'حوش من صفّين في كل صفّ أربع بلاطات فيه ثماني بلاطات وسياجه اثنتا عشرة عصا أيضًا. أمّا تسع بلاطات في صفّ واحد فسياجها عشرون عصا.' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
