/**
 * Le contenu du MANUEL pour le درس 5 « حل مشكلات وترييض وضعيات بتوظيف الدالة الخطية والتناسبية » —
 * données pures (aucun JSX), au mot près ; chaque bloc cite son élément de
 * docs/sources/4am/unit6/extraction.json.
 *
 *   act-4          نشاط 4 p. 67 — trois graphiques : les pommes de terre (proportionnel, a = 50 DA/kg),
 *                  le périmètre du rectangle EFGH (droite qui ne passe pas par O), l'aire du carré (courbe)
 *   method-spring  طرائق p. 71 — le ressort : tableau 2/3/4/5 → 0,6/0,9/1,2/1,5, y = 0,3x, 10 g → 3 cm,
 *                  2,1 cm → 7 g ; « لحساب مقدار بدلالة مقدار آخر يمكن الاستعانة بجدول تناسبية »
 *   challenge      تحدّ p. 65 (doublon déclaré, extraction → destinations) — les véhicules A et B
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 4 (p. 67) — les trois représentations graphiques (redessinées : components/Graphs.jsx). */
export const ACT_4 = {
  source: src('act-4', 67, 'أنشطة', 4),
  title: 'تمثيل وضعيات يعطى فيها مقدار بدلالة مقدار آخر وقراءتها وترجمتها',
  text: 'من بين التمثيلات البيانية التالية، ما هو التمثيل الذي يعبّر عن وضعية تناسبية؟ عيّن عندئذ معامل التناسبية $a$ . أعط تفسيرا هندسيا للعدد $a$ .',
  graphs: [
    { n: 1, y: 'السعر (DA)', x: 'كتلة البطاطا (kg)' },
    { n: 2, y: 'محيط المستطيل EFGH (m)', x: 'عرض مستطيل EFGH طوله ثابت (m)' },
    { n: 3, y: 'مساحة المربع ABCD (m²)', x: 'طول ضلع المربع ABCD (m)' },
  ],
  // Lecture du quadrillage (extraction → act-4.reading) : 0,5 kg et 25 DA par carreau.
  potatoes: [['0,5', '25'], ['1,5', '75'], ['2,5', '125'], ['3', '150'], ['3,5', '175']],
  numbers: { a: 50 },
  meaning: '$a = 50$ هو سعر 1kg من البطاطا (DA/kg) ؛ هندسيا: معامل توجيه المستقيم الذي يشمل المبدأ والنقط.',
  others: {
    perimeter: 'المحيط $2L + 2\\ell$ : مستقيم لا يشمل المبدأ — ليست وضعية تناسبية.',
    area: 'المساحة $c^2$ : النقط ليست على مستقيم — ليست وضعية تناسبية.',
  },
};

/** طرائق p. 71 — le ressort. `exercise`, `solution`, `rule` : la forme que lit <MethodSteps>. */
export const METHOD_SPRING = {
  source: src('method-spring', 71, 'طرائق'),
  title: 'تمثيل وقراءة وترجمة وضعية يتدخل فيها مقدار يعطى بدلالة مقدار آخر',
  exercise: 'في حصّة علمية يتعاون التلاميذ على تجريب نابض يستطيل بشكل متناسب مع الكتلة المعلّقة به. نعلق جسما كتلته $x$ (بالغرام) ونسجّل في كل مرة الاستطالة $y$ (بالسنتيمتر). 1) انقل وأتمم الجدول المقابل ومثّله بيانيا ثم عبّر عن $y$ بدلالة $x$ . 2) أ) عيّن استطالة النابض من أجل كتلة قدرها 10g. ب) ما هي الكتلة التي يمكن تعليقها للحصول على استطالة قدرها 2,1cm ؟',
  // Le tableau du manuel, cases vides « … » comprises.
  table: { x: ['2', '…', '4', '…'], y: ['0,6', '0,9', '…', '1,5'] },
  completed: { x: ['2', '3', '4', '5'], y: ['0,6', '0,9', '1,2', '1,5'] },
  solution: [
    '1) الجدول المعطى جدول تناسبية نعيّن قيم السطر الثاني من جدول التناسبية بضرب قيم السطر الأول في معامل التناسبية 0,3.',
    'نمثل بيانيا هذا الجدول في معلم بالنقط الآتية: $A(2 ; 0{,}6)$ ، $B(3 ; 0{,}9)$ ، $C(4 ; 1{,}2)$ ، $D(5 ; 1{,}5)$ . نستنتج أن $y = 0{,}3x$ .',
    '2) أ) من أجل $x = 10$ نجد $y = 0{,}3 \\times 10$ أي عندما نعلق جسما كتلته 10g نتحصل على استطالة النابض قدرها 3cm.',
    'ب) لدينا $2{,}1 = 0{,}3 \\times 7$ . إذن نتحصل على استطالة قدرها 2,1cm عندما نعلق كتلة قدرها 7g.',
  ],
  rule: 'لحساب مقدار بدلالة مقدار آخر يمكن الاستعانة بجدول تناسبية.',
  numbers: { a: '0,3', y10: 3, x21: 7 },
};

/** Ce que la مذكرة du professeur lit comme « وضعية الانطلاق » : نشاط 4. */
export const ACTIVITY = {
  source: ACT_4.source,
  title: ACT_4.title,
  text: ACT_4.text,
  questions: [
    'ما هو التمثيل الذي يعبّر عن وضعية تناسبية؟',
    'عيّن معامل التناسبية $a$ .',
    'أعط تفسيرا هندسيا للعدد $a$ .',
  ],
  closing: ACT_4.meaning,
  numbers: ACT_4.numbers,
};

/**
 * تحدّ (p. 65) — les deux véhicules. Valeurs LUES sur le quadrillage (extraction → challenge.reading) :
 * B passe par (1 ; 75), (2 ; 150), (4 ; 300) ; A s'arrête entre 1 h et 1,5 h (115 km) et arrive à
 * 300 km en 4,5 h. Figure redessinée : components/Graphs.jsx › ChallengeGraph.
 */
export const CHALLENGE = {
  source: src('challenge', 65, 'تحدّ'),
  text: 'تنقل مركبتان A و B مساعدات تضامنية إلى قرية معزولة، وسُجلت في التمثيل البياني المقابل المسافات التي قطعتها كل نصف ساعة من لحظة انطلاقهما. احسب السرعة المتوسطة لكل مركبة خلال السفر. ثم صف حركة كل منهما. اشرح.',
  A: [[0, 0], [0.5, 55], [1, 115], [1.5, 115], [2, 180], [2.5, 240], [3, 255], [3.5, 270], [4, 285], [4.5, 300]],
  B: [[0, 0], [0.5, 37.5], [1, 75], [1.5, 112.5], [2, 150], [2.5, 187.5], [3, 225], [3.5, 262.5], [4, 300]],
  reading: 'قرأت المنصّة القيم على شبكة الكتاب: B تمرّ بـ $(1 ; 75)$ و $(2 ; 150)$ و $(4 ; 300)$ ، و A تقطع 300km في 4,5h.',
};

/**
 * LE LABORATOIRE (origin-line, écrit par la leçon 3, réutilisé ici par ses props seules — brief §6), mode
 * `fit` : les points sont posés, l'élève fait pivoter la droite autour de O jusqu'à ce qu'elle passe par
 * tous ; le laboratoire écrit alors y = a·x (ou dit qu'aucune droite par O ne convient).
 *   مبتدئ — le téléphérique de قسنطينة : le câble, ancré à la station O, doit passer par le sommet de trois
 *           pylônes (2 ; 1), (4 ; 2), (6 ; 3) → a = 0,5. Contexte de la PLATEFORME (déclaré) : les points
 *           des pommes de terre de نشاط 4 (kg × DA) ne tiennent pas dans un repère orthonormé, et aucun
 *           monde du lab ne porte les mots « كتلة البطاطا / السعر » (thèmes cablecar | spring | budget) ;
 *           نشاط 4 lui-même est travaillé sur ses trois graphiques redessinés (components/Graphs.jsx).
 *   متقدم — le ressort de la طريقة p. 71 : les quatre points du manuel (a = 0,3, hors des nœuds), puis les
 *           deux lectures du manuel (image de 10, nombre dont l'image est 2,1).
 * Le test lab.render.test.jsx monte le workspace avec EXACTEMENT ces objets.
 */
export const LAB = {
  beginner: {
    a: '0,5', mode: 'fit', points: '2:1|4:2|6:3',
    xMin: '0', xMax: '7', yMin: '0', yMax: '4', theme: 'cablecar',
    title: 'التلفريك: الحبل يمرّ برؤوس الأعمدة',
  },
  advanced: {
    a: '0,3', mode: 'fit', points: '2:0,6|3:0,9|4:1,2|5:1,5', reads: 'x:10|y:2,1',
    xMin: '0', xMax: '12', yMin: '0', yMax: '4', theme: 'spring',
    title: 'النابض: الاستطالة بدلالة الكتلة المعلّقة',
  },
};

/** La règle que le laboratoire rend physique (نشاط 4, réponse du manuel). */
export const PROPORTIONAL_GRAPH = {
  source: src('act-4', 67, 'أنشطة', 4),
  text: 'تكون الوضعية تناسبية عندما تقع نقط تمثيلها البياني على مستقيم يشمل المبدأ $O$ . معامل التناسبية $a$ هو معامل توجيه هذا المستقيم، والنقطة $(1 ; a)$ تقع عليه: في سعر البطاطا $a = 50$ ، أي سعر 1kg هو 50DA.',
};

/** Le contraste de نشاط 4 : les graphiques (2) et (3). */
export const NOT_PROPORTIONAL = {
  source: src('act-4', 67, 'أنشطة', 4),
  text: 'نقط على مستقيم لا يشمل المبدأ (محيط المستطيل $2L + 2\\ell$ ) أو نقط على منحنى (مساحة المربع $c^2$ ): ليست وضعية تناسبية، ولا نمذجها بدالة خطية.',
};

/**
 * Le pont des trois représentations, tel que la طريقة p. 71 l'enchaîne : le TABLEAU (on multiplie
 * par 0,3), la FORMULE ($y = 0{,}3x$), le GRAPHIQUE (A, B, C, D sur une droite qui passe par O).
 */
export const BRIDGE = {
  source: src('method-spring', 71, 'طرائق'),
  text: 'العدد $a$ نفسه في الأشكال الثلاثة: في الجدول نضرب كل قيمة من السطر الأول في $a$ ، والدستور $f(x) = ax$ ، والتمثيل البياني مستقيم يشمل المبدأ والنقطة $(1 ; a)$ . في النابض $a = 0{,}3$ : الجدول $\\times 0{,}3$ ، و $y = 0{,}3x$ ، و $A(2 ; 0{,}6)$ على المستقيم.',
  rows: [
    { form: 'الجدول', reads: 'حاصل قسمة $y$ على $x$ ثابت: $\\dfrac{0{,}6}{2} = \\dfrac{0{,}9}{3} = 0{,}3$' },
    { form: 'الدستور', reads: '$y = 0{,}3x$' },
    { form: 'التمثيل البياني', reads: 'مستقيم يشمل $O$ و $A(2 ; 0{,}6)$' },
  ],
};

/**
 * « صياغة … وتفسير النتائج في سياق الوضعية » (الكفاءة 3) : le manuel répond en phrase et avec
 * l'unité (« عندما نعلق جسما كتلته 10g نتحصل على استطالة النابض قدرها 3cm ») ; la plausibilité
 * (une masse n'est pas négative, un nombre de personnes est entier) vient de la leçon 4 de l'unité 4.
 */
export const INTERPRET = {
  source: src('method-spring', 71, 'طرائق'),
  text: 'نفسّر النتيجة في سياق الوضعية: نكتبها بجملة وبوحدتها («كتلة 10g تعطي استطالة 3cm»)، ونتحقّق أنها معقولة: الكتلة والطول والمدة لا تكون سالبة، وعدد الأشخاص عدد طبيعي.',
};

/** Le تحدّ : la ligne de lecture de la figure, dite une fois. */
export const CHALLENGE_NOTE = {
  source: addition('interactive_example'),
  text: CHALLENGE.reading,
};

/** Exercice 34 : la lecture retenue de « 10DA لكل شراء قدره 1000DA » (extraction → discrepancies). */
export const EX34_NOTE = {
  source: addition('interactive_example'),
  text: 'نقرأ العرض هكذا: تخفيض 10DA عن كل 1000DA كاملة من مبلغ المشتريات.',
};

/**
 * « أستعدّ » — le manuel n'a AUCUN item pour cette leçon (ses items 1–9 p. 65 vont aux leçons 1, 2
 * et 4) : neuf affirmations de la PLATEFORME dans la forme du manuel, deux par prérequis du
 * propriétaire (déterminer a, lire un graphique, pourcentages, étapes du ترييض) et une sur la vitesse
 * moyenne (leçon 4, grandeurs composées), les deux réponses
 * présentes. Aucune n'utilise les nombres de نشاط 4 ni du ressort (50, 25, 0,3, 10, 2,1).
 */
export const PREP_ITEMS = [
  { skill: 'tayin', text: 'الدالة الخطية $f$ التي تحقّق $f(4) = 10$ معاملها $a = 2{,}5$ .', answer: true, why: '$a = \\dfrac{10}{4} = 2{,}5$ . تحقّق: $2{,}5 \\times 4 = 10$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'tayin', text: 'إذا كان $f(x) = -2x$ فإنّ صورة العدد 6 بالدالة $f$ هي $-3$ .', answer: false, why: '$f(6) = -2 \\times 6 = -12$ . العدد $-3$ هو العدد الذي صورته 6: $f(-3) = 6$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'bayan', text: 'التمثيل البياني للدالة $x \\longmapsto 1{,}5x$ مستقيم يشمل المبدأ $O$ والنقطة $(2 ; 3)$ .', answer: true, why: 'دالة خطية: مستقيم يشمل المبدأ، و $1{,}5 \\times 2 = 3$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'bayan', text: 'على التمثيل البياني لدالة خطية، صورة عدد هي فاصلة النقطة التي ترتيبها هذا العدد.', answer: false, why: 'العكس: صورة عدد هي ترتيب النقطة التي فاصلتها هذا العدد.', source: addition('prerequisite_diagnostic') },
  { skill: 'nisba', text: 'زيادة سعر بنسبة 12% تعني ضربه في $1{,}12$ .', answer: true, why: '$x + \\dfrac{12}{100}x = \\left(1 + \\dfrac{12}{100}\\right)x = 1{,}12x$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'nisba', text: '30% من 240 هو 80.', answer: false, why: '$240 \\times \\dfrac{30}{100} = 72$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'nisba', text: 'قطعت حافلة 180km في 2h ، إذن سرعتها المتوسطة 90km/h .', answer: true, why: 'السرعة المتوسطة هي المسافة على المدة: $\\dfrac{180}{2} = 90$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'tarrid', text: 'لترييض مشكلة نسمّي المجهول $x$ ، ثم نعبّر عن الوضعية بمعادلة بدلالته، نحلّها، ونتحقّق من الحل في نص المشكلة.', answer: true, why: 'هي خطوات طريقة «ترييض مشكلة» (الوحدة 4): نسمّي، نعبّر، نحلّ، نتحقّق.', source: addition('prerequisite_diagnostic') },
  { skill: 'tarrid', text: 'إذا وجدنا لمشكلة عن عدد التلاميذ الحلّ $x = 12{,}5$ ، فالجواب: في القسم 12,5 تلميذا.', answer: false, why: 'عدد التلاميذ عدد طبيعي: حلّ لا يلائم الواقع، فنراجع النموذج أو نجيب بأن المشكلة لا حلّ لها.', source: addition('prerequisite_diagnostic') },
];

/** L'erreur que le contraste de نشاط 4 corrige (MISC-TARRID-NAMUDHAJ) — reprise par la carte. */
export const MISTAKE_NOT_O = {
  source: src('act-4', 67, 'أنشطة', 4),
  wrong: 'اعتبار وضعية محيط المستطيل وضعية تناسبية لأن نقطها على استقامة واحدة.',
  why: 'المستقيم لا يشمل المبدأ: عرض معدوم يعطي محيطًا $2L$ غير معدوم، وحاصل قسمة المحيط على العرض غير ثابت.',
  right: 'الوضعية تناسبية عندما تكون النقط على مستقيم يشمل المبدأ $O$ .',
};
