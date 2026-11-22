/**
 * Le contenu du MANUEL pour le درس « خواص الدوران وتوظيفها في الأشكال الهندسية » (unité 13) — données pures (aucun JSX),
 * au mot près ; chaque bloc cite son élément de docs/sources/4am/unit13/extraction.json : أستعدّ 2 (p. 151, module 0),
 * معارف 3 (p. 154, module 2), طرائق « استعمال خواص الدوران في الإنشاءات » et دوري الآن (p. 155, module 3). Les exercices
 * 4, 6, 8, 17, 18 sont dans content/exercises.js (module 4).
 *
 * CE QUE LA PLATEFORME AJOUTE, DÉCLARÉ (`addition(…)`) :
 *   • la leçon n'a PAS d'activité du manuel : son entrée est le laboratoire shape-turn (le papier calque sur un zellige
 *     de Tlemcen, `interaction_generation`) ;
 *   • « صورة مستقيم بدوران زاويته α تصنع معه الزاوية α — 90° : تعامده، 180° : توازيه » (`knowledge_formalization`) :
 *     la طريقة p. 155 conclut (BD) ⊥ (AC) « من خواص الدوران » alors que la propriété de la p. 154 (longueurs,
 *     استقامية، زوايا، مساحات) ne le contient pas (extraction › discrepancies, method-properties) ;
 *   • « مركز دوران = نقطة تقاطع محوري [AA′] و [BB′] » (`knowledge_formalization`) : l'exercice 18 le demande sans que
 *     la page معارف ne le dise ;
 *   • l'énoncé de la طريقة dit « قائم ومتساوي الساقين » sans « في O » ni le sens : la figure seule les donne ; la leçon
 *     les ÉCRIT (une ligne le signale) ;
 *   • six affirmations « أستعدّ » (`prerequisite_diagnostic`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

export const PLATFORM_SOURCE = addition('interaction_generation');
export const FORMAL_SOURCE = addition('knowledge_formalization');

/**
 * L'ENTRÉE du درس (plateforme) : la situation du laboratoire, lue par la مذكرة du professeur (`ACTIVITY`).
 */
export const ACTIVITY = {
  source: PLATFORM_SOURCE,
  title: 'ورقة شفافة على زليج تلمسان',
  situation: 'معلّم الزليج المتقن لحرفته في تلمسان يرسم بتلة واحدة على ورقة شفافة، يثبّتها بدبوس في مركز الوردة، ثم يديرها ويطبع البتلة من جديد. هل تتغيّر البتلة حين تدور الورقة؟ وماذا لو مُطّطت الورقة؟',
  questions: [
    'أدر الورقة واطبع نسخ البتلة: ما الذي يبقى على حاله في كل نسخة (الطول، الزاوية، المساحة، الاستقامية)، وما الذي يتغيّر؟',
    'مطّط الورقة: لماذا لا تكون النسخة الممطّطة صورة البتلة بدوران؟',
    'أدر الورقة $90^\\circ$ ثم $180^\\circ$ : ما وضع المستقيم (A′B′) بالنسبة إلى (AB)؟',
  ],
  closing: 'الدوران لا يغيّر شكل البتلة ولا قياساتها: يغيّر موضعها ومنحى مستقيماتها فقط.',
};

/** معارف 3 (p. 154) — « خواص الدّوران ». */
export const KNOW3 = {
  source: src('know-3', 154, 'معارف', 3),
  title: 'خواص الدّوران',
  property: 'خاصية: الدّوران يحافظ على :',
  items: ['الأطوال', 'استقامية النقط', 'الزوايا', 'المساحات'],
  // l'exemple, au mot près ; les égalités en îlots (une égalité nue après de l'arabe se lit à l'envers)
  example: 'مثال: A′، B′، C′ هي، على الترتيب، صور النقط A، B، C بالدوران الذي مركزه O و زاويته $20^\\circ$ في الاتجاه المباشر. إذا كان $AB = 2\\,\\mathrm{cm}$ فإن $A\'B\' = 2\\,\\mathrm{cm}$ . A، B، C على استقامية واحدة إذن A′، B′، C′ على استقامية.',
};

/** Ajout DÉCLARÉ (معارف من المنصّة) : une droite et son image. */
export const PERP = {
  source: FORMAL_SOURCE,
  title: 'المستقيم وصورته بدوران',
  text: 'صورة مستقيم (d) بالدوران الذي زاويته $\\alpha$ هي مستقيم (d′) يصنع مع (d) زاوية قيسها $\\alpha$ (أو $180^\\circ - \\alpha$ إذا كانت $\\alpha$ منفرجة).',
  cases: [
    'إذا كانت زاوية الدوران $90^\\circ$ فإن $(d\') \\perp (d)$ : صورة مستقيم بدوران زاويته $90^\\circ$ تعامده.',
    'إذا كانت زاوية الدوران $180^\\circ$ فإن $(d\') \\parallel (d)$ : صورة مستقيم بدوران زاويته $180^\\circ$ توازيه.',
  ],
};

/** طرائق p. 155 — « استعمال خواص الدّوران في الإنشاءات ». */
export const METHOD = {
  source: src('method-properties', 155, 'طرائق'),
  title: 'استعمال خواص الدّوران في الإنشاءات',
  // le texte du manuel (les puces « • » remplacées par 1) 2) : entre deux couples de lettres latines elles brouillent l'ordre)
  printed: 'تمرين: OAB و OCD مثلثان كل منهما قائم ومتساوي الساقين. 1) بيّن أن [BD] هي صورة [AC] بدوران يُطلب تعيين مركزه وزاويته. 2) استنتج أنّ $AC = BD$ و $(BD) \\perp (AC)$ .',
  // ce que la figure seule disait, écrit (extraction › discrepancies › method-properties)
  exercise: 'تمرين: OAB و OCD مثلثان كل منهما قائم في O ومتساوي الساقين، و B و D في الاتجاه المباشر من A و C (كما في الشكل). 1) بيّن أن [BD] هي صورة [AC] بدوران يُطلب تعيين مركزه وزاويته. 2) استنتج أنّ $AC = BD$ و $(BD) \\perp (AC)$ .',
  stated: 'دقّقت المنصّة نصّ التمرين: الكتاب لا يقول «قائم في O» ولا يذكر اتجاه الدوران، والشكل وحده يبيّنهما — كتبناهما في النص.',
  solution: [
    'بما أن OAB قائم في O ومتساوي الساقين، فإنّ B هي صورة A بالدوران الذي مركزه O وزاويته $90^\\circ$ (في الاتجاه المباشر).',
    'وكذلك فإنّ D هي صورة C بنفس الدوران.',
    'ومنه فإنّ [BD] هي صورة [AC] بالدوران الذي مركزه O وزاويته $90^\\circ$ .',
    'ومن خواص الدوران نستنتج أنّ $AC = BD$ وكذلك $(BD) \\perp (AC)$ .',
  ],
  remark: 'التساوي $AC = BD$ يأتي من الحفاظ على الأطوال، والتعامد من الخاصية التي أضافتها المنصّة في المعارف: صورة مستقيم بدوران زاويته $90^\\circ$ تعامده.',
};

/** دوري الآن p. 155. */
export const NOW155 = {
  source: src('now-155', 155, 'دوري الآن'),
  text: '$\\widehat{AOB}$ زاوية قيسها $45^\\circ$ . أنشئ صورة هذه الزاوية بالدوران الذي مركزه K و زاويته $60^\\circ$ في الاتجاه المباشر.',
  answer: 'ننشئ O′ و A′ و B′ صور O و A و B بهذا الدوران، ثم نصفي المستقيمين [O′A′) و [O′B′): صورة الزاوية $\\widehat{AOB}$ هي $\\widehat{A\'O\'B\'}$ ، و $\\widehat{A\'O\'B\'} = 45^\\circ$ لأن الدوران يحافظ على الزوايا.',
};

/** Ajout DÉCLARÉ (معارف من المنصّة) : retrouver le centre d'un دوران (l'exercice 18 le demande). */
export const CENTER = {
  source: FORMAL_SOURCE,
  title: 'إيجاد مركز دوران',
  lines: [
    'إذا كانت A′ صورة A بدوران مركزه O فإن $OA = OA\'$ : المركز O على محور القطعة [AA′].',
    'وإذا كانت B′ صورة B بنفس الدوران فإن O على محور [BB′] أيضا.',
    'إذن مركز الدوران هو نقطة تقاطع محوري [AA′] و [BB′]. ثم نقيس $\\widehat{AOA\'}$ لنعرف زاوية الدوران واتجاهه.',
  ],
  warning: 'انتبه: إذا انطبق المحوران (كمحوري [MM′] و [NN′] في التمرين 18) فهما لا يعيّنان نقطة: نأخذ زوجا آخر من نقطة وصورتها.',
};

/**
 * « أستعدّ » — l'item 2 du manuel (p. 151 ; 1 → المضلعات المنتظمة, 3 → مفهوم الدوران, 4–5 → الزاوية المحيطية) et six
 * affirmations de la plateforme sur les acquis que la leçon suppose : l'image d'un point et d'un segment par un دوران et
 * le sens direct (le درس précédent), la médiatrice, le rectangle par ses diagonales, le milieu dans un repère (unité 12).
 * Une affirmation par question, une compétence par affirmation ; aucune n'utilise les nombres du laboratoire.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: '2', skill: 'muthallath', figure: 'prep2', text: 'المثلث ABC المقابل متقايس الأضلاع.', answer: false,
    why: 'المثلث قائم في A (رمز الزاوية القائمة) ومتساوي الساقين ($AB = AC$ ، علامتا الترميز): $BC = AB\\sqrt{2} \\neq AB$ .', source: src('prep', 151, 'أستعدّ', 2) },
  { n: 'p1', skill: 'suratNuqta', text: 'M′ صورة M بالدوران الذي مركزه O وزاويته $50^\\circ$ في الاتجاه المباشر. إذن $OM\' = OM$ و $\\widehat{MOM\'} = 50^\\circ$ .', answer: true,
    why: 'هذا تعريف صورة نقطة بدوران (الدرس السابق): نفس البعد عن المركز، والزاوية بين النقطة وصورتها هي زاوية الدوران.', source: PREP_ADD },
  { n: 'p2', skill: 'ittijah', text: 'الاتجاه المباشر (الموجب) هو اتجاه حركة عقارب الساعة.', answer: false,
    why: 'الاتجاه المباشر (الموجب) هو عكس اتجاه حركة عقارب الساعة؛ اتجاه عقارب الساعة هو الاتجاه غير المباشر (السالب).', source: PREP_ADD },
  { n: 'p3', skill: 'suratQita', text: 'لإنشاء صورة قطعة [EF] بدوران، يكفي إنشاء صورتي طرفيها E و F ورسم القطعة التي طرفاها هاتان الصورتان.', answer: true,
    why: 'هذه طريقة الدرس السابق: صورة قطعة مستقيم بدوران قطعة مستقيم، طرفاها صورتا الطرفين.', source: PREP_ADD },
  { n: 'p4', skill: 'mihwar', text: 'كل نقطة من محور القطعة [EF] تبعد بنفس البعد عن E و عن F.', answer: true,
    why: 'محور قطعة هو مجموعة النقط المتساوية البعد عن طرفيها.', source: PREP_ADD },
  { n: 'p5', skill: 'mustatil', text: 'كل رباعي قطراه متقايسان هو مستطيل.', answer: false,
    why: 'يجب أولا أن يكون متوازي أضلاع (قطراه متناصفان)؛ متوازي أضلاع قطراه متقايسان هو المستطيل.', source: PREP_ADD },
  { n: 'p6', skill: 'muntasaf', text: 'في معلم، منتصف القطعة [EF] حيث $E(2\\,;\\,-1)$ و $F(4\\,;\\,5)$ هو النقطة $(3\\,;\\,2)$ .', answer: true,
    why: '$\\left(\\dfrac{2 + 4}{2}\\,;\\,\\dfrac{-1 + 5}{2}\\right) = (3\\,;\\,2)$ .', source: PREP_ADD },
];

/**
 * Les deux mondes du lab (levels.js › 'shape-turn', recopiés ici pour la leçon) : مبتدئ = la rosace de zellige
 * (plateforme) ; متقدم = la طريقة p. 155 puis le centre de l'exercice 18.
 */
export const LAB = {
  beginner: { source: PLATFORM_SOURCE, numbers: { mode: 'rosette', center: [0, 0], alpha: 60, direction: 'direct', shape: { A: [1, 0], B: [4, 0], C: [2, 2] } } },
  advanced: {
    source: METHOD.source,
    numbers: {
      mode: 'prove', center: [0, 0], alpha: 90, direction: 'direct', points: { A: [4, -2], B: [2, 4], C: [-1, 2], D: [-2, -1] },
      centerTask: { M: [1, 3], N: [0, 2], P: [2, 2], "M'": [3, 3], "N'": [4, 2], "P'": [4, 4], grid: 5, start: [0, 0] },
    },
  },
};

/**
 * Les erreurs que la leçon corrige (distracteurs des modules, reprises par la carte — knowledgeGraph.js) : une droite
 * crue parallèle à son image (MISC-DAWARAN-TAWAZI), la feuille étirée prise pour un دوران (MISC-DAWARAN-KHAWAS).
 */
export const MISTAKES = {
  tawazi: {
    wrong: 'صورة مستقيم بدوران توازيه دائما',
    right: 'لا توازيه إلا إذا كانت زاوية الدوران $180^\\circ$ ؛ وبزاوية $90^\\circ$ تعامده.',
  },
  tamtit: {
    wrong: 'يكفي أن تبقى الورقة مثبّتة في O لتكون النسخة صورة بدوران',
    why: 'الورقة الممطّطة مثبّتة في O أيضا، لكن الطول تغيّر: الدوران يحافظ على الأطوال.',
  },
};
