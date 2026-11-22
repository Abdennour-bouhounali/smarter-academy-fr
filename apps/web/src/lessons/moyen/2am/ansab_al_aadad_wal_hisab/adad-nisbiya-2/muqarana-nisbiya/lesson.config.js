/**
 * الدرس — مقارنة وترتيب أعداد نسبية (2AM, unité 3 « الأعداد النسبية ») — la PREMIÈRE leçon générée de l'unité, DANS son entrée du
 * catalogue (items 2am.m4.r02 et 2am.m4.r03), cycle moyen phase 3, Phase A de la file (2026-10-21, #7) : elle sert la leçon 4AM
 * « المتراجحة » (`mutarajiha-ula`). Manuel 2AM (الجيل الثاني, منشورات الشهاب, scan), RÉFÉRENCE des الكفاءات : نشاط 2 p. 40, معارف 1
 * p. 42 (trois خاصيّات), طرائق p. 43, دوري الآن ① p. 43, exercices 12–20 pp. 46–47, أؤكّد 5–6 p. 49, أستعدّ 5–7 p. 39, تمهيد p. 38.
 * Source : docs/sources/2am/unit3/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : son seul lien « راجع » — 2am.m4.r01 (lire / placer une abscisse), leçon `talim-mustaqim-mudarraj-2` NON publiée — est mesuré
 * par « أستعدّ » (abscisse, opposé, distance à zéro), jamais reconstruit ; `noRebuildForLesson` est vide ; `pointPrerequisites` : arêtes
 * internes seulement.
 * 2026-10-29 : `talim-mustaqim-mudarraj-2` est publiée (marche `2am.m4`) — arête LP P1 ← 2am_talim-mustaqim-mudarraj-2_P1 (lien du réseau
 * 2am.m4.r01 → 2am.m4.r02) ; le panneau « راجع » vers r01 devient un lien tout seul.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le « المسبار » (labo `zero-probe`, monde `sea`, thème `researchBoat`). Un capteur A est fixé à −3 m ; la main tient la
 *   LONGUEUR d du câble qui descend du zéro (la surface) jusqu'à un second capteur B — le nombre relatif de B est la SORTIE de (côté, d).
 *   Pourquoi la comparaison des négatifs devient NÉCESSAIRE sous la main : pour que B soit plus bas que A il faut ALLONGER le câble, et
 *   pour qu'il soit plus haut il faut le RACCOURCIR — l'inverse de ce que la main sait des naturels ; au-dessus du zéro c'est l'inverse
 *   de l'inverse ; et quand B est sous le zéro et A au-dessus, aucune longueur ne suffit (le bouton « لا يوجد طول »). مبتدئ : A = −3
 *   (plus bas, puis plus haut), A = 4 (plus bas, au-dessus), A = 2 (impossible sous le zéro) ; متقدم : la zone d'une seule dixième
 *   −4,5 < B < −4,3, « plus bas que 1,2 » des DEUX côtés, −0,4 < B < −0,2.
 *   Rejetées : (a) le نشاط 2 du manuel comme entrée (six thermomètres à lire, des paires à comparer au regard : une comparaison à
 *   l'œil que l'élève réussit sans la règle, donc sans besoin) — il devient une APPLICATION en أتمرّن ; (b) la droite graduée avec deux
 *   curseurs de position (`solution-ray` en 4AM, la position EST le nombre : la main tient déjà le résultat) ; (c) `ruler-compare`
 *   (1AM : la main tient la graduation d'une règle, des décimaux positifs) — aucun négatif, aucune distance à zéro.
 *   Ordre des idées : deux négatifs, le plus long câble est le plus bas (P1) → deux positifs, le plus long câble est le plus haut (P2)
 *   → un sous le zéro, un au-dessus : le négatif est plus petit, et que dit le zéro ? (P2) → معارف : insérer un nombre entre deux autres
 *   avec le MÊME labo (côté libre), le rangement, < et >, le mot « تصاعدي / تنازلي » (P3) → طريقة : ranger six nombres de signes
 *   mêlés, comparer deux décimaux négatifs, nombre entre deux (P3) → أتمرّن (act-2 et ex-12 … ex-20 réécrits, l'ouverture p. 38) → trois
 *   مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/muqarana-nisbiya';

export const LESSON_CONFIG = {
  id: 'muqarana-nisbiya',
  kind: 'lesson',
  unit: 'adad-nisbiya-2',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'مقارنة وترتيب أعداد نسبية',
  description: 'مسبار معلّق بسلك من سطح البحر: بتغيير طول السلك فوق الصفر وتحته نكتشف كيف نقارن عددين نسبيين، ونكتب النتيجة بالرمزين $<$ و $>$ ، ثم نرتّب أعدادًا نسبية تصاعديًا أو تنازليًا ونجد عددًا بين عددين.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🌊',
  estimatedDurationMin: 84,
  textbookRef: { unit: 3, activity: 2, pages: '38, 39, 40, 42, 43, 46, 47, 49' },
  skills: [
    'مقارنة عددين نسبيين سالبين: الأصغر هو الذي له أكبر مسافة إلى الصفر، مثل $-1{,}9$ و $-1{,}91$',
    'مقارنة عددين نسبيين موجبين أو من إشارتين مختلفتين: السالب أصغر من الصفر ومن كل عدد موجب',
    'ترتيب أعداد نسبية تصاعديًا أو تنازليًا باستعمال الرمزين $<$ و $>$ وإيجاد عدد محصور بين عددين',
  ],
  teachingScope: {
    include: ['مقارنة عددين نسبيين (سالبين، موجبين، من إشارتين مختلفتين) بالمسافة إلى الصفر وبالإشارة', 'الصفر وموضعه بين السالبة والموجبة', 'الترتيب التصاعدي والتنازلي بالرمزين $<$ و $>$ وإيجاد عدد بين عددين (متباينة صارمة)'],
    exclude: ['قراءة فاصلة نقطة ووضعها على مستقيم مدرّج (درس سابق: نتذكّرها فقط)', 'تعليم نقطة في المستوي (درس لاحق)', 'جمع وطرح عددين نسبيين والمسافة بين نقطتين (دروس لاحقة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — le registre des températures (act-2 et l'ouverture).
  lessonProblem: {
    module: 5,
    title: 'درجات الحرارة في أسبوع',
    statement: 'في نادي الأرصاد الجوية بالمتوسطة، سجّل التلاميذ بأمانة ودقّة درجة الحرارة الصباحية (°C) كل يوم من أسبوع بارد، وهذا ما كتبوه في الجدول.',
    questions: [
      { label: '1)', text: 'عيّن أبرد يوم وأدفأ يوم في الأسبوع.' },
      { label: '2)', text: 'رتّب تصاعديًا الدرجات السالبة.' },
      { label: '3)', text: 'كم يومًا كانت درجة حرارته أصغر من $-1$ ؟' },
    ],
    table: {
      caption: 'درجة الحرارة الصباحية',
      head: ['اليوم', 'السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
      rows: [['الدرجة (°C)', '-4,5', '-1,2', '0', '-0,8', '2,5', '-3', '1,6']],
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le seul lien « راجع » du réseau (2am.m4.r01), éclaté en trois idées de vocabulaire.
  priorKnowledge: ['faasila-nuqta', 'masafa-ila-sifr', 'adad-mutaakis'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `zero-probe` (la main tient la DISTANCE à zéro), monde `sea`, thème `researchBoat` :
    //   مبتدئ — A = −3, A = 4, A = 2 (pas 1, côté imposé) ; متقدم — décimaux au pas 0,1, côté libre, zone d'une dixième.
    {
      kind: 'manipulation', code: 'zero-probe-beginner', type: 'zero-probe', module: 1,
      level: 'beginner',
      title: 'المسبار: طول السلك فوق الصفر وتحته',
      objective: 'عند مقارنة عددين نسبيين تحت الصفر الأصغر هو الأبعد عن الصفر وعند مقارنة عددين فوق الصفر الأصغر هو الأقرب إلى الصفر والسالب أصغر من الموجب',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'researchBoat' },
      learningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P2'],
      sourceElementIds: ['know-1b'],
    },
    {
      kind: 'manipulation', code: 'zero-probe-advanced', type: 'zero-probe', module: 1,
      level: 'advanced',
      title: 'المسبار: أعداد عشرية وجهتان للسلك',
      objective: 'عند مقارنة عددين نسبيين تحت الصفر الأصغر هو الأبعد عن الصفر وعند مقارنة عددين فوق الصفر الأصغر هو الأقرب إلى الصفر والسالب أصغر من الموجب',
      autonomy: 'أعداد عشرية بخطوة عُشر، ولا جهة مفروضة: يختار التلميذ جهة المسبار وطول السلك ليحصره بين عددين، ويجد حلولًا من الجهتين',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'researchBoat' },
      learningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P2', '2am_muqarana-nisbiya_P3'],
      sourceElementIds: ['know-1b'],
    },
    // Module 2 — le MÊME labo, posé seul (`levels={false}`) : insérer un nombre entre deux autres, côté libre.
    {
      kind: 'manipulation', code: 'zero-probe-insert', type: 'zero-probe', module: 2,
      title: 'المسبار بين عددين',
      learningPointIds: ['2am_muqarana-nisbiya_P3'],
      sourceElementIds: ['know-1b'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — درجات الحرارة في أسبوع', learningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P2', '2am_muqarana-nisbiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — فوق البحر وتحته', learningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حسابات الجمعية', learningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P2', '2am_muqarana-nisbiya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ المسافة إلى الصفر، فاصلة نقطة، والعددان المتعاكسان.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — المسبار', desc: 'مسبار معلّق بسلك: متى يصير أخفض من مسبار ثابت؟ وماذا يفعل طول السلك فوق الصفر وتحته؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الترتيب وعدد بين عددين', desc: 'نضع المسبار بين عددين، ثم نكتب الترتيب التصاعدي والتنازلي بالرمزين $<$ و $>$ .',
      stage: 'discovery', teachesLearningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P2', '2am_muqarana-nisbiya_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أقارن وأرتّب', desc: 'ست أعداد بإشارات مختلفة نرتّبها، وعدد عشري سالب نقارنه، ثم نختار عددًا بين عددين.',
      stage: 'formalization', teachesLearningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'مقارنات، تصحيح إجابة تلميذ، أكبر وأصغر وأقرب إلى الصفر، ترتيب، عدد بين عددين، ودرجات الأرض القصوى.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P2', '2am_muqarana-nisbiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — درجات الحرارة في أسبوع', desc: 'مسألة الدرس: أبرد يوم وأدفأ يوم، ترتيب الدرجات السالبة، وعدد الأيام الأصغر من $-1$ .',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P2', '2am_muqarana-nisbiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — فوق البحر وتحته', desc: 'نورس وسمكة وغوّاص وغواصة: الأخفض، الأقرب إلى السطح، والترتيب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حسابات الجمعية', desc: 'ديون ورصيد: الأكثر مديونية، الترتيب، وكم عضوًا رصيده أكبر من $-2500$ .',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_muqarana-nisbiya_P1', '2am_muqarana-nisbiya_P2', '2am_muqarana-nisbiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
