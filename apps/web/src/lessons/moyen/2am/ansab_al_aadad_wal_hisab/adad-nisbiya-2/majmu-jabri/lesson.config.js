/**
 * الدرس — حساب مجموع جبري (2AM, unité 3 « الأعداد النسبية ») — DANS son entrée du catalogue (item 2am.m4.r06), cycle moyen phase 3, 2AM مقطع 2am.m4, paire 3 (2026-10-29).
 * Manuel 2AM (الجيل الثاني, منشورات الشهاب, scan), RÉFÉRENCE des الكفاءات : نشاط 6 p. 41, معارف 2 (d, e) p. 44, طريقة 5 p. 45, تمارين 29, 36, 37 p. 48, أؤكّد 10 et 11 p. 49, أتعمّق 39, 43, 44, 46, 58 pp. 50–51.
 * Source : docs/sources/2am/unit3/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis). Plan : docs/sources/2am/unit3/plan/majmu-jabri.md.
 * Le réseau : `2am.m4.r05 → 2am.m4.r06` (requires) et `2am.m1.r02 → 2am.m4.r06` (requires), leçons PUBLIÉES : « أستعدّ » mesure leurs idées et « تذكّر » (module 2) MÈNE à `jam-tarh-nisbiya`.
 * Edges LP : P1 ← `2am_jam-tarh-nisbiya_P3` (soustraire = ajouter l'opposé) ; P2 ← `2am_jam-tarh-nisbiya_P1`, `_P2` (les deux règles d'addition) et `2am_silsila-bi-aqwas_P1`, `_P2` (l'intérieur d'abord, [ ] à l'extérieur) ;
 * internes P2 ← P1, P3 ← P1. `noRebuildForLesson` vide (r06 n'a ni extends ni consolidates).
 * Changement des الكفاءات (README, question 5) : P1 gagne l'exemple $(-9)-(+2)+(-5)-(-4)=(-9)+(-2)+(-5)+(+4)$ ; P2 gagne « les parenthèses d'abord » (le lien du réseau `2am.m1.r02`) ; P3 gagne le calcul d'une écriture déjà simplifiée.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « شدّ الحبل » (labo `tug-rope`, monde `tugfield`). Une somme algébrique est une FILE d'enfants à dossards (un relatif chacun) : les positifs tirent vers le drapeau vert, les négatifs vers l'orange ;
 *   l'enfant précédé de « − » (« ينسحب لصالح الفريق الآخر ») se RETOURNE et sa dossard devient l'opposé ; le ruban avance du total de droite moins le total de gauche. La main tient l'ÉQUIPE de chaque terme.
 *   Former les équipes, c'est grouper les positifs d'un côté et les négatifs de l'autre ; deux dossards opposés se compensent ; l'ordre d'arrivée ne change rien ; un crochet est un petit équipage réglé d'abord.
 *   Rejetées : (a) le نشاط 6 du manuel (la transformation est donnée à remplir) ; (b) l'ascenseur ou le thermomètre (modèles d'un calcul de gauche à droite : grouper n'y a pas de sens, et ces mondes sont déjà pris) ;
 *   (c) `merge-board` (3AM : l'ordre des fusions compte ici que tout ordre est permis).
 *   Ordre des idées : une chaîne d'additions (trier, comparer les totaux) → une chaîne avec soustractions (retourner d'abord) → les opposés se compensent → l'ordre ne change rien → décimaux, crochet → l'écriture simplifiée
 *   → معارف → طريقة → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/majmu-jabri';
export const LESSON_CONFIG = {
  id: 'majmu-jabri',
  kind: 'lesson',
  unit: 'adad-nisbiya-2',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'حساب مجموع جبري',
  description: 'ساحة يوم الرياضة: بتدوير الأطفال الذين تسبقهم إشارة − وتوزيعهم على فريقين نحوّل الطرح إلى جمع المعاكس ونحسب مجموعًا جبريًا بتجميع الموجبة والسالبة، ثم نبسّط كتابته.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🪢',
  estimatedDurationMin: 88,
  textbookRef: { unit: 3, activity: 6, pages: '41, 44, 45, 48, 49, 50, 51' },
  skills: [
    'تحويل كلّ طرح في مجموع جبري إلى جمع للعدد المعاكس، مثل $(-9)-(+2)+(-5)-(-4)=(-9)+(-2)+(-5)+(+4)$',
    'حساب مجموع جبري بتجميع الحدود الموجبة فيما بينها والحدود السالبة فيما بينها (يمكن نقل الحدود وحذف المتعاكسين)، وبحساب ما بين الأقواس أوّلًا عند وجودها، مثل $(+12)-[(-6)-(-2)+(+9)]=(+7)$',
    'تبسيط كتابة مجموع جبري بحذف إشارة الجمع وأقواس الأعداد، مثل $(+5)-(+6)+(-8)=5-6-8$ ، وحساب مجموع مكتوب في شكله المبسّط مثل $-15+4+8+3$',
  ],
  teachingScope: {
    include: ['سلسلة من ثلاثة جمع وطرح أو أكثر لأعداد نسبية عشرية', 'تحويل كلّ طرح إلى جمع المعاكس، ونقل الحدود وتجميعها، وحذف المتعاكسين', 'حساب ما بين الأقواس ( ) و [ ] أوّلًا', 'الكتابة المبسّطة بحذف إشارة الجمع وأقواس العدد الواحد وحساب مجموع مكتوب بها'],
    exclude: ['جمع وطرح عددين فقط (درس سابق: نتذكّره بوصلة)', 'حذف قوس تسبقه إشارة − يضمّ عدّة حدود بتغيير إشارات ما بداخله (السنة الثالثة)', 'الحروف والعبارات الحرفية (السنة الثالثة)', 'جداء الأعداد النسبية والكسور بإشارة (السنة الثالثة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — غطسات الغوّاص.
  lessonProblem: {
    module: 5,
    title: 'غطسات الغوّاص',
    statement: 'غوّاص عند $-3\\,\\mathrm{m}$ . نزل $5\\,\\mathrm{m}$ ، ثم صعد $2\\,\\mathrm{m}$ ، ثم نزل $7\\,\\mathrm{m}$ ، ثم صعد $9\\,\\mathrm{m}$ .',
    table: { caption: 'تنقّلات الغوّاص بالأمتار', head: ['البداية', 'نزول', 'صعود', 'نزول', 'صعود'], rows: [['-3', '-5', '+2', '-7', '+9']] },
    questions: [
      { label: '1)', text: 'اكتب المجموع الجبري الذي يعطي موضع الغوّاص الأخير.' },
      { label: '2)', text: 'احسب موضعه الأخير بتجميع الحدود.' },
      { label: '3)', text: 'ما أعمق موضع بلغه الغوّاص؟' },
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les liens « راجع » du réseau (2am.m4.r05 : جمع وطرح عددين ; 2am.m1.r02 : الأقواس).
  priorKnowledge: ['jam-nafs-ishara', 'jam-ishara-mukhtalifa', 'mutaakisan-sifr', 'tarh-bi-muakis', 'aqwas-awwalan', 'aqwas-mutadakhila'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `tug-rope` (la main tient l'ÉQUIPE de chaque terme), monde `tugfield` :
    //   مبتدئ — t1 (+7)+(−3)+(+5)+(−6), t2 (−8)−(+3)+(−6)−(−5), t3 (+5)+(−7)+(−5)+(+7)+(−3) ; متقدم — a1 une longue chaîne décimale, a2 un crochet réglé d'abord, a3 la forme simplifiée −15+4+8+3 (la position écrite AVANT de siffler).
    {
      kind: 'manipulation', code: 'tug-rope-beginner', type: 'tug-rope', module: 1,
      level: 'beginner',
      title: 'شدّ الحبل: الطرح والتجميع',
      objective: 'حساب مجموع جبري هو توزيع حدوده على فريقين: نحوّل كلّ طرح إلى جمع المعاكس، ثم نجمع الموجبة معًا والسالبة معًا',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'tugfield' },
      learningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2'],
      sourceElementIds: ['act-6', 'know-2d'],
    },
    {
      kind: 'manipulation', code: 'tug-rope-advanced', type: 'tug-rope', module: 1,
      level: 'advanced',
      title: 'شدّ الحبل: أعداد عشرية وأقواس',
      objective: 'حساب مجموع جبري هو توزيع حدوده على فريقين: نحوّل كلّ طرح إلى جمع المعاكس، ثم نجمع الموجبة معًا والسالبة معًا',
      autonomy: 'الموضع يُكتب قبل صفّارة الحكم، وما بين القوسين يتجاذب أفراده أوّلًا، والكتابة المبسّطة تُقرأ حدًّا حدًّا',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'tugfield' },
      learningPointIds: ['2am_majmu-jabri_P2', '2am_majmu-jabri_P3'],
      sourceElementIds: ['method-5', 'know-2e'],
    },
    // Module 2 — le MÊME labo, posé seul (`levels={false}`) : une chaîne de quatre termes dont deux sont précédés de « − ».
    {
      kind: 'manipulation', code: 'tug-rope-maarif', type: 'tug-rope', module: 2,
      title: 'شدّ الحبل بسلسلة جديدة',
      learningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2', '2am_majmu-jabri_P3'],
      sourceElementIds: ['know-2d', 'know-2e'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — غطسات الغوّاص', learningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2', '2am_majmu-jabri_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — يوم شتوي في سطيف', learningPointIds: ['2am_majmu-jabri_P2', '2am_majmu-jabri_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حصيلة جولتين', learningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ جمع وطرح عددين نسبيين والأقواس.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — شدّ الحبل', desc: 'ساحة يوم الرياضة: نوزّع الأطفال على فريقين، ونستدير بمن تسبقه إشارة −، فنكتشف كيف نحسب مجموعًا جبريًا.',
      stage: 'trigger', teachesLearningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2', '2am_majmu-jabri_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المجموع الجبري', desc: 'نجرّب سلسلة جديدة، ثم نسمّي المجموع الجبري وطريقة حسابه وكتابته المبسّطة.',
      stage: 'discovery', teachesLearningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2', '2am_majmu-jabri_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحسب مجموعًا جبريًا', desc: 'أحسب مجموعًا جبريًا خطوة خطوة، بأقواس أو بدونها.',
      stage: 'formalization', teachesLearningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2', '2am_majmu-jabri_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'أحوّل الطرح إلى جمع، أجمّع، أبسّط الكتابة، أضع الإشارات، وأبحث عن أكبر قيمة.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2', '2am_majmu-jabri_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — غطسات الغوّاص', desc: 'مسألة الدرس: مجموع جبري لتنقّلات غوّاص، وموضعه الأخير وأعمق موضع بلغه.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2', '2am_majmu-jabri_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — يوم شتوي في سطيف', desc: 'الكتابة المبسّطة لتغيّرات الحرارة وحساب حرارة آخر اليوم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_majmu-jabri_P2', '2am_majmu-jabri_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حصيلة جولتين', desc: 'مجاميع بأقواس لثلاثة أطراف، والتحقّق من أنّ حصيلتين متعاكستين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_majmu-jabri_P1', '2am_majmu-jabri_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
