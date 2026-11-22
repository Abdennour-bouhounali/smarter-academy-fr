/**
 * Le contenu de RÉFÉRENCE du درس 3 « حل مشكلات بتوظيف جمل معادلتين من الدرجة الأولى بمجهولين » — données pures (aucun JSX).
 * Rollout 2026-11-12 (unité 5 ; design L3 §7, verdict L3) : le manuel reste la référence des كفاءات (`source` cite son élément de
 * docs/sources/4am/unit5/extraction.json), mais l'élève ne lit que des énoncés, des nombres et des mots de la PLATEFORME. L'activité de la page
 * (l'ancien musée, 140 visiteurs) est remplacée par la manche 1 du labo (« نادي الرسم ») : le musée est le monde de la مسألة du module 4.
 */
import { src, addition } from '../../_unit/unitMeta.js';
import { ABU_KAMIL as ABU_KAMIL_FACTS } from '../../_unit/abuKamil.js';
import { R1, STAR } from './stories.js';

const OWN = 'بأعداد المنصّة';
const ACT = { ...src('act-3', 57, 'أنشطة', 3), part: OWN };

/** L'activité de la leçon (module 1) : la manche 1 du labo, « نادي الرسم ». */
export const ACTIVITY = {
  source: ACT,
  title: 'حل مشكلات بتوظيف جمل معادلتين من الدرجة الأولى بمجهولين',
  text: R1.story,
  tableColumns: ['المرحلة', 'ما نفعله', 'في قصة نادي الرسم'],
  // ce que la مذكرة du professeur lit comme questions de la phase de déclenchement
  questions: [
    'ما المجهولان في هذه القصة؟',
    'ما الجملة التي تترجم معلومتي القصة؟',
    'حلّ الجملة بطريقة مناسبة.',
    'تحقّق من النتيجة في القصة نفسها.',
    'أجب عن سؤال القصة بجملة.',
  ],
  closing: 'اشترى النادي 4 أقلام تلوين و 8 أقلام رصاص.',
  numbers: { pencils: 12, colour: 70, graphite: 20, paid: 440, colours: 4, graphites: 8 },
};

/** Les réponses de l'activité, telles que la leçon les écrit. */
export const ACTIVITY_SOLUTION = {
  source: ACT,
  unknowns: 'نسمّي $x$ عدد أقلام التلوين و $y$ عدد أقلام الرصاص.',
  count: '«اشترى النادي 12 قلمًا»: $x + y = 12$',
  money: '«دفع النادي 440 دج»: $70x + 20y = 440$',
  system: '$\\begin{cases} x + y = 12 \\\\ 70x + 20y = 440 \\end{cases}$',
  solve: 'من المعادلة الأولى $y = 12 - x$ ، نعوّض: $70x + 20(12 - x) = 440$ أي $50x = 200$ ومنه $x = 4$ ، ثم $y = 12 - 4 = 8$ .',
  check: '$4 + 8 = 12$ و $70 \\times 4 + 20 \\times 8 = 280 + 160 = 440$',
  answer: 'اشترى النادي 4 أقلام تلوين و 8 أقلام رصاص.',
};

/**
 * Le labo `story-modeller` de la PAGE (enseignant, mode classe) aux deux niveaux — les histoires de la plateforme (verdict L3.10) :
 *   مبتدئ : la manche 1 (« نادي الرسم », à la main) ; متقدم : le défi ⭐ (« معرض الكتب »), l'élève nomme lui-même les inconnues.
 * Les préréglages de levels.js gardent les nombres du manuel (le test partagé de levels.js l'exige) : la page passe ici les nôtres.
 */
export const LAB = {
  source: addition('interaction_generation'),
  beginner: { ...R1, named: true },
  advanced: { ...STAR, named: false },
};

/** Les CINQ étapes de la méthode : ce que la brique « khutuwat-hall » pose et ce que la carte relie. */
export const STEPS = {
  source: ACT,
  choose: '1) اختيار المجهولين: نسمّي $x$ و $y$ ما يسأل عنه السؤال.',
  translate: '2) ترجمة المشكلة بجملة معادلتين: كل معلومة من النص تعطي معادلة.',
  solve: '3) حل الجملة باختيار طريقة مناسبة (التعويض أو الجمع).',
  check: '4) تحقّق: نعوّض العددين في معطيات النص نفسه.',
  answer: '5) الإجابة: نترجم النتيجة ونجيب عن السؤال بجملة.',
};

/** Le tableau des cinq étapes (module 1, après la brique « khutuwat-hall ») : chaque étape et ce qu'elle a donné dans « نادي الرسم ». */
export const STEPS_TABLE = [
  { stage: STEPS.choose, task: 'ما المجهولان؟', done: ACTIVITY_SOLUTION.unknowns },
  { stage: STEPS.translate, task: 'معادلة لكل معلومة', done: ACTIVITY_SOLUTION.system },
  { stage: STEPS.solve, task: 'التعويض أو الجمع', done: '$50x = 200$ ومنه $x = 4$ ، ثم $y = 8$' },
  { stage: STEPS.check, task: 'المعلومتان معًا', done: ACTIVITY_SOLUTION.check },
  { stage: STEPS.answer, task: 'جملة تجيب عن السؤال', done: ACTIVITY_SOLUTION.answer },
];

/** Ce que le labo a rendu physique : chaque information, une équation, une seule unité. */
export const TRANSLATION_RULE = {
  source: ACT,
  text: 'نترجم كل معلومة من النص بمعادلة، وفي المعادلة الواحدة وحدة واحدة: «اشترى النادي 12 قلمًا» تعدّ أقلامًا، فكل قلم يُعدّ مرة واحدة: $x + y = 12$ ؛ و«دفع النادي 440 دج» تجمع دنانير، فكل قلم تلوين يُحسب بـ 70 وكل قلم رصاص بـ 20: $70x + 20y = 440$ .',
};

/** L'erreur que le labo refuse (MISC-JUMLA-TARJAMA) : un prix compté comme un objet. */
export const MISTAKE_TARJAMA = {
  source: ACT,
  wrong: 'ترجمة «اشترى النادي 12 قلمًا» بالمعادلة $70x + 20y = 12$ .',
  why: '$70x + 20y$ مبلغ بالدينار، و 12 عدد أقلام: لا نساوي مالًا بعدد أشياء.',
  right: 'كل قلم يُعدّ مرة واحدة: $x + y = 12$ ، والأثمان تدخل في معلومة المبلغ: $70x + 20y = 440$ .',
};

/** La règle de l'étape 4 (MISC-JUMLA-TAHAQQUQ-NAS) : on vérifie dans le TEXTE, et la réponse a un sens. */
export const CHECK_RULE = {
  source: ACT,
  text: 'نتحقق من النتيجة في معطيات النص نفسه، لا في الجملة فقط: $4 + 8 = 12$ قلمًا و $70 \\times 4 + 20 \\times 8 = 440$ دج. وعدد أشياء تُعدّ يكون عددًا طبيعيًا، ثم نكتب جملة تجيب عن السؤال.',
};

/** L'erreur que la résolution du labo refuse (MISC-JUMLA-NISF-HALL). */
export const MISTAKE_HALF = {
  source: ACT,
  wrong: 'التوقف عند $x = 4$ والإجابة: «اشترى النادي 4 أقلام».',
  why: 'السؤال يطلب عدد أقلام التلوين وعدد أقلام الرصاص: حلّ الجملة ثنائية، و $x$ وحده نصف الجواب.',
  right: 'نعوّض $x = 4$ لنجد $y = 8$ ، ونجيب: اشترى النادي 4 أقلام تلوين و 8 أقلام رصاص.',
};

/** La حصّالة du groupe, grandie (module 2 ; verdict X2) — la plateforme réécrit le تحدّ du manuel. */
export const CHALLENGE = {
  source: { ...src('challenge', 55, 'تحدّ'), part: OWN },
  text: 'كبرت «حصّالة القسم»: فيها الآن 29 قطعة نقدية من فئتي 20 دج و 5 دج، ومبلغها 385 دج. كم قطعة من كل فئة؟',
};

/** أبو كامل — la ligne d'histoire VÉRIFIÉE de l'unité (verdict X9, `_unit/abuKamil.js`), et le problème de la plateforme « على طريقة أبي كامل ». */
export const ABU_KAMIL = {
  source: addition('interaction_generation'),
  intro: ABU_KAMIL_FACTS.line,
};

/** La lecture du problème « على طريقة أبي كامل » (après l'exercice qui fait choisir la jumla). */
export const ABU_KAMIL_READING = {
  source: addition('interaction_generation'),
  text: 'نسمّي $x$ عدد أيام العمل و $y$ عدد أيام الغياب: $x + y = 30$ ، وما أخذه يساوي ما دفعه: $7x = 3y$ .',
};

/** Le test final, E1 — RÉÉCRIT par la plateforme (verdict L3, design §7) : deux angles complémentaires, l'un dépasse l'autre de 24°. */
export const QCM7 = {
  source: { ...src('qcm', 62, 'أؤكّد تعلّماتي', 7), part: OWN },
  text: '$x$ و $y$ قيسا زاويتين متتامتين بالدرجات، و $x$ يزيد عن $y$ بـ $24°$ . لإيجاد $x$ و $y$ ، نحلّ الجملة:',
  options: [
    '$\\begin{cases} x + y = 90 \\\\ x - y = 24 \\end{cases}$',
    '$\\begin{cases} x + y = 90 \\\\ y - x = 24 \\end{cases}$',
    '$\\begin{cases} x - y = 90 \\\\ x + y = 24 \\end{cases}$',
  ],
  correct: 0,
};

/**
 * Les anciennes affirmations « أستعدّ » de la plateforme — remplacées dans le lecteur par l'échelle de content/prep.js (PREP_LADDER) ; gardées
 * comme source (règle du rollout). Aucune n'utilise les nombres de la مسألة.
 */
export const PREP_ITEMS = [
  { skill: 'tarjama', text: '«ضعف عدد مضافًا إليه 5» يُكتب $2x + 5$ حيث $x$ هو العدد.', answer: true, why: 'ضعف العدد $2x$ ، ثم نضيف 5: $2x + 5$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'tarjama', text: '«مجموع عددين $a$ و $b$ هو 50» يُكتب $ab = 50$ .', answer: false, why: 'المجموع ناتج الجمع: $a + b = 50$ ؛ أما $ab$ فهو جداؤهما.', source: addition('prerequisite_diagnostic') },
  { skill: 'hisab', text: 'محيط مستطيل بعداه $L$ و $l$ هو $L + l$ .', answer: false, why: 'المحيط مجموع الأضلاع الأربعة: $2(L + l) = 2L + 2l$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'hisab', text: 'مساحة مستطيل بعداه $L - 2$ و $l + 2$ هي $Ll + 2L - 2l - 4$ .', answer: true, why: '$(L - 2)(l + 2) = Ll + 2L - 2l - 4$ بالنشر.', source: addition('prerequisite_diagnostic') },
  { skill: 'nisba', text: '20% من 450 هو 90.', answer: true, why: '$0{,}2 \\times 450 = 90$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'nisba', text: 'بعد تخفيض 25% يصبح ثمن سلعة سعرها 600 دج هو 575 دج.', answer: false, why: 'التخفيض $0{,}25 \\times 600 = 150$ ، فالثمن الجديد $600 - 150 = 450$ دج ، أي $0{,}75 \\times 600$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'jumla', text: 'الثنائية $(3 ; 5)$ حل للجملة $\\begin{cases} x + y = 8 \\\\ 2x - y = 1 \\end{cases}$ .', answer: true, why: '$3 + 5 = 8$ و $2 \\times 3 - 5 = 1$ : المعادلتان محققتان معا.', source: addition('prerequisite_diagnostic') },
  { skill: 'jumla', text: 'الثنائية $(5 ; 3)$ حل للجملة نفسها $\\begin{cases} x + y = 8 \\\\ 2x - y = 1 \\end{cases}$ .', answer: false, why: '$5 + 3 = 8$ لكن $2 \\times 5 - 3 = 7 \\neq 1$ : الترتيب مهم.', source: addition('prerequisite_diagnostic') },
  { skill: 'jumla', text: 'حل الجملة $\\begin{cases} x + y = 12 \\\\ x - y = 4 \\end{cases}$ هو الثنائية $(8 ; 4)$ .', answer: true, why: 'بالجمع طرفا لطرف: $2x = 16$ أي $x = 8$ ، ثم $y = 12 - 8 = 4$ .', source: addition('prerequisite_diagnostic') },
];
