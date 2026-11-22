/**
 * الدرس — الأعداد العشرية ونصف المستقيم المدرّج (1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية »). Le TROISIÈME درس de l'unité par ordre du
 * manuel, généré DANS son entrée du catalogue (item 1am.m5.r04), cycle moyen phase 3, 1AM paire 1 A, 2026-10-30 — APRÈS `kitabat-adad-tabii`
 * (les rangs d'une écriture), `kusur-ashriya-kitaba` (la virgule, 1/10 = 0,1) et `muqaranat-adad-ashriya` (l'ordre des décimaux, lien du réseau
 * 1am.m1.r04 → 1am.m5.r04, un « renvoi en avant » du manuel mesuré dans « أستعدّ »). Manuel 1AM (الجيل الثاني) : نشاط 4 p. 10, معارف 5 p. 13,
 * exercices 15 et 16 p. 18, أقوّم تعلّماتي 7 p. 19. Pas de طريقة dans le manuel : le module 3 est un ajout de la plateforme.
 * Source : docs/sources/1am/unit1/extraction.json ; brief des auteurs : docs/sources/1am/unit1/brief-authors.md (« Lesson 3 »).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre
 * (§4ter-bis) : tout est réécrit, autres contextes, autres nombres.
 *   Entrée retenue : la journée sportive du collège (labo `jump-tape`, thème `sportsday`). Un ruban de mesure part de la planche d'appel
 *   (le métré O) et ne montre RIEN d'autre. La main tient d'abord l'UNITÉ DE LONGUEUR : elle étire la marque « 1 » jusqu'à ce que le plus
 *   long saut (3,1 m) tienne dans la fosse et que les petites graduations restent distinctes — le ruban dessine alors DIX graduations par
 *   unité, chacune à 1/10 = 0,1 ; puis elle plante un drapeau par saut (le métré lit « A(2,4) » à la volée). متقدم : les drapeaux sont déjà
 *   plantés, la main promène un curseur de lecture (graduation exacte ou encadrement entre deux graduations), sur un ruban sans origine
 *   (9 … 12) puis gradué en centièmes.
 *   Rejetées : (a) le نشاط 4 du manuel comme entrée (une demi-droite DÉJÀ graduée où l'on lit B et C : l'unité est donnée, la main ne tient
 *   rien) — il devient une APPLICATION en أتمرّن ; (b) le zoom sur une graduation (c'est le terrain de `hasr-qiyam-muqarraba`, labo
 *   `bus-stations`) ; (c) l'origine mobile et la graduation à gauche de O (leçon 2AM `talim-mustaqim-mudarraj-2`) ; (d) deux unités sur la même
 *   droite (le labo `stride-stamp` de `talim-mustaqim-mudarraj` timbrera la baguette unité des DEUX côtés de O : ici l'unité est ÉTIRÉE et la
 *   demi-droite n'a qu'un côté).
 *   Ordre des idées : l'unité et ses dix graduations (P1) → le drapeau planté, la fenêtre qui lit l'abscisse (P3) → l'écriture somme 2 + 6/10 et
 *   l'entier 3 (P3) → le drapeau déjà planté lu exactement ou encadré (P2) → l'origine qui n'est plus visible, les centièmes (P2) → معارف (les
 *   noms : demi-droite graduée, origine, unité, abscisse, O(0), A(2,4), « في حالات معيّنة لا يظهر المبدأ ») → طريقة (placer, lire, encadrer) → أتمرّن
 *   (les suites à pas constant, la lecture des flèches de quatre demi-droites, la lecture d'une unité) → trois مسائل → إختبار أولي.
 *   « أستعدّ » mesure `1am.m1.r04` (le lien du réseau : ranger des décimaux) et `1am.m1.r02` (1/10 = 0,1 et 2 + 4/10 = 2,4).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/adad-ashri-mustaqim-mudarraj';

export const LESSON_CONFIG = {
  id: 'adad-ashri-mustaqim-mudarraj',
  kind: 'lesson',
  unit: 'adad-tabiiya-ashriya',
  unitTitle: 'الأعداد الطبيعية والأعداد العشرية',
  sequentialUnlock: true,
  title: 'الأعداد العشرية ونصف المستقيم المدرّج',
  description: 'في يوم رياضي نمدّ شريط قياس من لوح الانطلاق: نختار وحدة الطول ونقسّمها إلى عشرة أجزاء، ثم نغرس أعلامًا عند قفزات معلومة ونقرأ فاصلة علم مغروس، مضبوطة أو بحصر بين تدريجتين، حتى حين لا يظهر المبدأ.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧩',
  estimatedDurationMin: 82,
  textbookRef: { unit: 1, activity: 4, pages: '10, 13, 18, 19' },
  skills: [
    'تدريج نصف مستقيم باختيار مبدإ ووحدة طول مناسبة وتقسيم الوحدة إلى عشرة أجزاء متساوية، فيكون التباعد بين تدريجتين صغيرتين متتاليتين $\\frac{1}{10}=0{,}1$ وحدة',
    'قراءة فاصلة نقطة من نصف مستقيم مدرّج مضبوطة إن وقعت على تدريجة، أو بحصر بين تدريجتين متتاليتين إن وقعت بينهما، حتى حين لا يظهر مبدأ نصف المستقيم',
    'تعليم نقطة معلومة الفاصلة (مكتوبة $2{,}4$ أو $2+\\frac{4}{10}$) على نصف مستقيم مدرّج وكتابة فاصلتها بالرمز $A(2{,}4)$',
  ],
  teachingScope: {
    include: ['اختيار الوحدة وتقسيمها إلى عشرة أجزاء متساوية', 'فاصلة نقطة، $O(0)$ و $A(2{,}4)$', 'قراءة فاصلة نقطة مضبوطة أو بحصر', 'تعليم نقطة معلومة الفاصلة', 'نصف مستقيم لا يظهر مبدؤه', 'متتاليات أعداد بخطوة ثابتة على نصف مستقيم'],
    exclude: ['الحصر والقيم المقرّبة (درس «حصر عدد عشري وقيمه المقرّبة»)', 'الأعداد النسبية والتعليم على مستقيم مدرّج بجهتين (السنة الثانية)', 'تعليم كسر على نصف مستقيم (درس «حاصل القسمة على نصف مستقيم مدرّج»)', 'مقارنة الأعداد العشرية (درس سابق ورد في «أستعدّ»)'],
  },
  // « مسألة الدرس » : l'unité d'un ruban, les abscisses écrites de trois façons, puis l'ordre des repères, dans la même histoire (module 5).
  lessonProblem: {
    module: 5,
    title: 'شريط الخيّاط',
    statement: 'علّم خيّاط شريط قياس طوله 3 أمتار، فجعل طرفه O هو الصفر وقسّم كلّ متر إلى عشر تدريجات صغيرة متساوية. تنتهي القطعة الأولى عند العلامة 0,8 م، وتنتهي الثانية بعد المتر الثاني بأربع تدريجات صغيرة، وتنتهي الثالثة عند $1+\\frac{7}{10}$ م. اشترى الخيّاط 5 أزرار لتزيين الثوب.',
    questions: [
      { label: '1)', text: 'كم تدريجة صغيرة في المتر الواحد؟ وكم يساوي التباعد بين تدريجتين متتاليتين؟' },
      { label: '2)', text: 'اكتب بالفاصلة فاصلة نهاية القطعة الثانية ونهاية القطعة الثالثة.' },
      { label: '3)', text: 'رتّب نهايات القطع الثلاث من الأقرب إلى الأبعد عن O.' },
    ],
    illustration: { kind: 'tags', cards: [
      { title: 'القطعة الأولى', icon: 'shirt', lines: [{ label: 'تنتهي عند', value: '0,8', unit: 'م' }] },
      { title: 'القطعة الثانية', icon: 'shirt', lines: [{ label: 'بعد المتر الثاني بـ', value: 'أربع تدريجات', unit: '' }] },
      { title: 'القطعة الثالثة', icon: 'shirt', lines: [{ label: 'تنتهي عند', value: '1 + 7/10', unit: 'م' }] },
    ], ariaLabel: 'ثلاث قطع قماش تنتهي عند 0,8 م وبعد المتر الثاني بأربع تدريجات صغيرة وعند واحد زائد سبعة أعشار من المتر' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien du réseau `1am.m1.r04` (ranger / comparer des décimaux, leçon muqaranat-adad-ashriya, PUBLIÉE, mais
  // plus loin dans le manuel : un « renvoi en avant ») et `1am.m1.r02` (1/10 = 0,1 et 2 + 4/10 = 2,4).
  priorKnowledge: ['muqarana-ashriya-1am', 'dixieme-ashar-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `jump-tape` (la main tient l'UNITÉ étirée, puis le DRAPEAU ; متقدم : le CURSEUR de lecture), monde `sportsday` :
    //   مبتدئ — b1 2,4 · 3,1 · 1,8 (l'unité libre) ; b2 0,7 · 2,9 · 3 (une autre plage d'unité ; l'entier 3) ; b3 0,8 · 2 + 6/10 · 3,3 (l'écriture somme, unité donnée).
    //   متقدم — a1 0,6 · 1,9 · 2,35 (un drapeau entre deux graduations) ; a2 une fenêtre sans origine 9 … 12 ; a3 un ruban gradué en centièmes 4 … 4,3.
    {
      kind: 'manipulation', code: 'jump-tape-plant', type: 'jump-tape', module: 1,
      level: 'beginner',
      title: 'يوم رياضي: أعلام القفزات',
      objective: 'نختار وحدة الطول ونقسّمها إلى عشرة أجزاء متساوية، ثم نغرس علمًا عند كلّ قفزة معلومة ونقرأ فاصلة علم مغروس مضبوطة أو بحصر بين تدريجتين، حتى حين لا يظهر مبدأ الشريط',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'sportsday' },
      learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1', '1am_adad-ashri-mustaqim-mudarraj_P3'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'jump-tape-read', type: 'jump-tape', module: 1,
      level: 'advanced',
      title: 'يوم رياضي: قراءة الأعلام',
      objective: 'نختار وحدة الطول ونقسّمها إلى عشرة أجزاء متساوية، ثم نغرس علمًا عند كلّ قفزة معلومة ونقرأ فاصلة علم مغروس مضبوطة أو بحصر بين تدريجتين، حتى حين لا يظهر مبدأ الشريط',
      autonomy: 'يحرّك التلميذ مؤشّر القراءة بنفسه فيحكم هل العلم على تدريجة أم بين تدريجتين، في شريط لا يظهر مبدؤه ثم في شريط مدرّج بالأجزاء من مائة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'sportsday' },
      learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P2'],
      sourceElementIds: ['act-4', 'know-5'],
    },
    // Module 3 — le MÊME instrument posé seul (`levels={false}`) : une tâche de plantation à unité donnée, avec les trois gestes de la méthode.
    {
      kind: 'manipulation', code: 'jump-tape-method', type: 'jump-tape', module: 3,
      title: 'أعلّم ثلاث نقط وأقرأ فاصلاتها',
      learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P2', '1am_adad-ashri-mustaqim-mudarraj_P3'],
      sourceElementIds: ['know-5'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — شريط الخيّاط', learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1', '1am_adad-ashri-mustaqim-mudarraj_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — لوحات الكيلومترات', learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — ورقة الرسم', learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1', '1am_adad-ashri-mustaqim-mudarraj_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ مقارنة أعداد عشرية، والجزء من عشرة وكتابته بالفاصلة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — أعلام القفزات', desc: 'شريط لا يظهر منه إلا المبدأ: أمدّ الوحدة، ثم أغرس الأعلام وأقرأ فاصلاتها.',
      stage: 'trigger', teachesLearningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1', '1am_adad-ashri-mustaqim-mudarraj_P2', '1am_adad-ashri-mustaqim-mudarraj_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — نصف مستقيم مدرّج', desc: 'المبدأ والوحدة والتدريجات، فاصلة نقطة، الحصر، والمبدأ الذي لا يظهر.',
      stage: 'discovery', teachesLearningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1', '1am_adad-ashri-mustaqim-mudarraj_P2', '1am_adad-ashri-mustaqim-mudarraj_P3'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أعلّم وأقرأ', desc: 'تعليم نقطتين وقراءة ثالثة وحصر رابعة بين تدريجتين: ثلاثة أفعال.',
      stage: 'formalization', teachesLearningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P2', '1am_adad-ashri-mustaqim-mudarraj_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'قراءة وتعليم، متتاليات بخطوة ثابتة، وقراءة أسهم أربعة أنصاف مستقيمات مدرّجة.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1', '1am_adad-ashri-mustaqim-mudarraj_P2', '1am_adad-ashri-mustaqim-mudarraj_P3'],
      color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — شريط الخيّاط', desc: 'مسألة الدرس: التدريجات، الفاصلات، وترتيب العلامات.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1', '1am_adad-ashri-mustaqim-mudarraj_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — لوحات الكيلومترات', desc: 'طريق لا يظهر مبدؤه: فاصلات وحصر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — ورقة الرسم', desc: 'أيّ وحدة تتّسع لها الصفحة؟ ثم عدّ التدريجات.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1', '1am_adad-ashri-mustaqim-mudarraj_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
