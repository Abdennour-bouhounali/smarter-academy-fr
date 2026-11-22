/**
 * Le contenu de la leçon 4 « ترييض مشكلة » — données pures (aucun JSX). Le manuel (طرائق p. 49) fixe les الكفاءات, pas le texte : depuis le
 * rollout du 2026-11-11 (unité 4, conseil du 2026-11-11, verdict L4.7 / X1) la طريقة est écrite avec les nombres de la PLATEFORME — le père de
 * 52 ans et ses quatre enfants de 7, 8, 10 et 12 ans, la manche 1 du lecteur (content/race.js) —, partout (élève ET enseignant). Chaque bloc
 * garde son `src(...)` (la couverture des éléments du manuel) avec `part: 'بأعداد المنصّة'` : le professeur voit que le texte est réécrit.
 *
 * Aucun nombre de la مسألة (content/forbidden.js, _unit/signatures/tarrid-mushkila.js) n'est écrit ici.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const OWN = 'بأعداد المنصّة';
const own = (id, page, section, number) => ({ ...src(id, page, section, number), part: OWN });

/** La famille de la manche 1 : tout ce qui suit en est calculé. */
export const FAMILY = { father: 52, children: [7, 8, 10, 12], years: 5 };
const after = FAMILY.children.map((c) => c + FAMILY.years);                    // 12, 13, 15, 17
const sumAfter = after.reduce((a, b) => a + b, 0);                              // 57
const constant = FAMILY.children.reduce((a, b) => a + b, 0);                    // 37
const kids = FAMILY.children.length;                                            // 4
const kidsEq = FAMILY.children.map((c) => `(${c} + x)`).join(' + ');

/** طرائق — « ترييض مشكلة » : l'exercice et sa solution (أ ب جـ التحقق), sur les nombres de la plateforme. */
export const METHOD_MODELLING = {
  source: own('method-modelling', 49, 'طرائق'),
  title: 'ترييض مشكلة',
  exercise: `أب عمره ${FAMILY.father} سنة، وأعمار أبنائه الأربعة بالسنوات هي ${FAMILY.children.join(' ، ')}. بعد كم سنة يكون عمر الأب مساويًا مجموع أعمار أبنائه الأربعة؟`,
  solution: [
    'أ) نسمي $x$ عدد السنوات التي يكون بعدها عمر الأب هو مجموع أعمار أبنائه الأربعة.',
    `ب) نُعبّر عن هذه الوضعية بالمعادلة $${FAMILY.father} + x = ${kidsEq}$ .`,
    `جـ) نحل المعادلة التي وجدناها والتي تكتب على الشكل $${FAMILY.father} + x = ${kids}x + ${constant}$ ومنه $${kids - 1}x = ${FAMILY.father - constant}$ أي $x = ${FAMILY.years}$ . بالتالي يكون عمر الأب مساويا مجموعَ أعمار أبنائه بعد ${FAMILY.years} سنوات.`,
    `التحقق: بعد ${FAMILY.years} سنوات يكون عمر الأب هو ${FAMILY.father + FAMILY.years} سنة وأعمار الأبناء هي ${after.join(' ، ')} ولدينا $${after.join(' + ')} = ${sumAfter}$ .`,
  ],
};

/** Ce que la مذكرة lit comme « وضعية الانطلاق » : la طريقة elle-même. */
export const ACTIVITY = {
  source: METHOD_MODELLING.source,
  title: 'ترييض مشكلة',
  text: METHOD_MODELLING.exercise,
  questions: ['بعد كم سنة يكون عمر الأب يساوي مجموع أعمار أبنائه الأربعة؟'],
  closing: METHOD_MODELLING.solution[3],
  numbers: { father: FAMILY.father, children: FAMILY.children, years: FAMILY.years },
};

/**
 * LA COURSE DES ÂGES — l'expérience de la PLATEFORME. Page de l'enseignant : deux niveaux sur les nombres de la leçon (مبتدئ : deux personnes ;
 * متقدم : le père et ses quatre enfants) ; module 2 : le passé (deux frères, solution négative). Le lecteur joue les MANCHES (content/race.js).
 */
export const RACE = {
  source: addition('interaction_generation'),
  beginner: { left: '26+x', right: '4(2+x)', solution: 6 },
  advanced: { left: `${FAMILY.father}+x`, right: FAMILY.children.map((c) => `${c}+x`).join('+'), solution: FAMILY.years },
  past: { left: '11+x+13+x', right: '18', solution: -3 },
};

/** Les ÉTAPES de la طريقة (أ ب جـ التحقق). */
export const STEPS = {
  source: own('method-modelling', 49, 'طرائق'),
  name: 'أ) نسمي $x$ المجهول المناسب (هنا: عدد السنوات).',
  express: 'ب) نُعبّر عن الوضعية بمعادلة (أو متراجحة) بدلالة $x$ : كل كمية تتغيّر مع $x$ تُكتب بدلالة $x$.',
  solve: 'جـ) نحل المعادلة (أو المتراجحة) التي وجدناها.',
  check: 'التحقق: نعوّض الحل في نص المشكلة، ونتأكّد أنه يلائم الواقع.',
};

/** La règle que le laboratoire a rendue physique : chaque personne vieillit de x. */
export const MODEL_RULE = {
  source: own('method-modelling', 49, 'طرائق'),
  text: `بعد $x$ سنة يكبر كل شخص بـ $x$ سنة: عمر الأب $${FAMILY.father} + x$ ، وعمر كل ابن يزيد بـ $x$ ، فمجموع أعمار الأبناء الأربعة $${kidsEq} = ${kids}x + ${constant}$ .`,
};

/**
 * Une ترييض qui donne une MÉTRAJIHA : le hexagone régulier et le carré (figure : components/Figures.jsx › HexSquareFigure). Côté du hexagone x,
 * côté du carré x + 5 (cm) : 6x ≥ 4(x + 5) ⇔ x ≥ 10 ; à 10 les deux périmètres valent 60.
 */
export const NOW_49_2 = {
  source: own('now-49-2', 49, 'دوري الآن', 2),
  text: '1) حل المتراجحة $6x \\geq 4x + 20$ . 2) ما هو أقصر ضلع للمسدّس بحيث يكون محيطه أكبر من أو يساوي محيط المربع؟',
  figure: 'مسدّس منتظم ضلعه $x$ ومربّع ضلعه $x + 5$ (بالسنتيمتر).',
};

/** Ce que l'exercice d'inéquation ajoute : « أقصر », « أكبر من أو يساوي » → une métrajiha, puis le plus petit ضلع parmi ses حلول. */
export const INEQUALITY_RULE = {
  source: own('now-49-2', 49, 'دوري الآن', 2),
  text: 'عندما يطلب النص «أكبر من أو يساوي» أو «أقصر» نعبّر عن الوضعية بمتراجحة: محيط المسدّس $6x$ ومحيط المربع $4(x + 5)$ ، فالمتراجحة $6x \\geq 4(x + 5)$ أي $2x \\geq 20$ ثم $x \\geq 10$ ، وأقصر ضلع هو 10cm.',
};

/** « التأكد من ملاءمتها للواقع » : une longueur est positive, un nombre d'années « بعد » aussi, un nombre d'objets est naturel. */
export const REALITY_RULE = {
  source: own('ex-40', 53, 'أتعمّق', 40),
  text: 'نتحقّق من أنّ الحل يلائم الواقع: طول ضلع أو عدد سنوات أو عدد حصص لا يكون سالبًا، وعدد أشياء يكون عددًا طبيعيًا. حلّ مثل $x = -3$ لسؤال «بعد كم سنة؟» يعني أنّ ذلك حدث منذ 3 سنوات، فلا جواب في المستقبل.',
};

/** « أستعدّ » : les affirmations d'avant (la liste que lit le lecteur est content/prep.js › PREP_LADDER). */
export const PREP_ITEMS = [
  { skill: 'muadala', text: 'حل المعادلة $5x - 7 = 3x + 9$ هو $x = 8$ .', answer: true, why: '$5x - 3x = 9 + 7$ أي $2x = 16$ ومنه $x = 8$ . تحقّق: $5 \\times 8 - 7 = 33$ و $3 \\times 8 + 9 = 33$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'muadala', text: 'حل المعادلة $4x + 6 = 2$ هو $x = 2$ .', answer: false, why: '$4x = 2 - 6 = -4$ ومنه $x = -1$ . (العدد 2 يعطي $4 \\times 2 + 6 = 14$ .)', source: addition('prerequisite_diagnostic') },
  { skill: 'muadala', text: 'للمعادلة $(x - 4)(2x + 6) = 0$ حلّان هما 4 و $-3$ .', answer: true, why: 'جداء معدوم: $x - 4 = 0$ أو $2x + 6 = 0$ ، أي $x = 4$ أو $x = -3$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'mutarajiha', text: 'حلول المتراجحة $-2x \\geq 10$ هي الأعداد $x \\geq -5$ .', answer: false, why: 'نقسم على $-2$ وهو سالب فنغيّر الاتجاه: $x \\leq -5$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'mutarajiha', text: 'العدد 3 حلّ للمتراجحة $2x + 1 < 7$ .', answer: false, why: 'من أجل $x = 3$ : $2 \\times 3 + 1 = 7$ و $7 < 7$ خاطئة. حلولها $x < 3$ ، و 3 ليس منها.', source: addition('prerequisite_diagnostic') },
  { skill: 'hisab', text: 'محيط مستطيل طوله $x$ وعرضه 5 هو $2x + 10$ .', answer: true, why: 'محيط المستطيل هو ضعف مجموع طوله وعرضه: $2(x + 5) = 2x + 10$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'hisab', text: 'مساحة مثلث قائم طولا ضلعي قائمته 6cm و 4cm هي $24cm^2$ .', answer: false, why: 'مساحة المثلث القائم نصف جداء ضلعي القائمة: $\\dfrac{6 \\times 4}{2} = 12$ ، أي $12cm^2$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'taklifa', text: 'ثمن 7 دفاتر سعر الواحد منها 40 دينارًا ومحفظة ثمنها 150 دينارًا هو 430 دينارًا.', answer: true, why: '$7 \\times 40 + 150 = 280 + 150 = 430$ : ثمن الدفاتر يتضاعف مع عددها، وثمن المحفظة يُدفع مرة واحدة.', source: addition('prerequisite_diagnostic') },
  { skill: 'taklifa', text: '75% من 80 هو 60.', answer: true, why: '$0{,}75 \\times 80 = 60$ .', source: addition('prerequisite_diagnostic') },
];

/** L'erreur que le laboratoire a rendue physique (MISC-TARRID-MAJHUL-WAHID) : « + x » posé une seule fois pour plusieurs enfants. */
export const MISTAKE_ONE_X = {
  source: own('method-modelling', 49, 'طرائق'),
  wrong: `كتابة $${FAMILY.father} + x = ${FAMILY.children.join(' + ')} + x$ : إضافة $x$ مرة واحدة لمجموع أعمار الأبناء.`,
  why: `بعد $x$ سنة لا يكبر «المجموع» بل يكبر كل ابن بـ $x$ سنة: أربعة أبناء، أربع مرات $x$ .`,
  right: `مجموع أعمار الأبناء بعد $x$ سنة هو $${kidsEq} = ${kids}x + ${constant}$ .`,
};

/** Le montage du module 1, étape 3 : les nombres du père et des enfants après FAMILY.years. */
export const AFTER = { father: FAMILY.father + FAMILY.years, children: after, sum: sumAfter, constant, kids };
