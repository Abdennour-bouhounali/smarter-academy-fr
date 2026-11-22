/**
 * الدرس — كتابة الأعداد الطبيعية ودلالة الأرقام (1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية »). Le PREMIER درس de
 * 1AM. Manuel 1AM (الجيل الثاني) : نشاط 1 « أكوّن أعدادا » p. 9, معارف 1 p. 11 et 4 (a) p. 13, exercices 1–3 et 12 ① p. 17,
 * أقوّم تعلّماتي 1 p. 19, أتعمّق 1, 2, 3 (①②), 5 p. 20, l'ouverture p. 7 ; « أستعدّ » = استحضر مكتسباتي p. 8 (le réseau n'a
 * aucun lien de révision vers l'item 1am.m1.r02). Généré DANS son entrée du catalogue, cycle moyen phase 3, 2026-10-14.
 * Frontière avec kusur-ashriya-kitaba : docs/sources/1am/unit1/build-extraction.py (en-tête). Source :
 * docs/sources/1am/unit1/extraction.json ; brief des auteurs : docs/sources/1am/unit1/brief-authors.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, refonte du 2026-10-14) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : l'atelier des crayons (on ne peut ÉCRIRE le nombre qu'après avoir lié chaque dizaine) — l'idée
 *   « dix pour un » devient nécessaire sous la main de l'élève. Rejetée : le نشاط 1 du manuel comme entrée (trois
 *   questions — 0 1 3 8, 25 / 52, 999 — auxquelles l'élève répond de mémoire avant toute expérience) ; il est posé en
 *   application au module 4. Ordre des idées : échange dix pour un → valeur de position (les deux 7 de 2577) → le 0 qui
 *   garde la place → lecture par classes (la dictée au labo) → tableau des rangs → مفكوك → رقم / عدد (billets).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/kitabat-adad-tabii';

export const LESSON_CONFIG = {
  id: 'kitabat-adad-tabii',
  kind: 'lesson',
  unit: 'adad-tabiiya-ashriya',
  unitTitle: 'الأعداد الطبيعية والأعداد العشرية',
  sequentialUnlock: true,
  title: 'كتابة الأعداد الطبيعية ودلالة الأرقام',
  description: 'نقرأ عددًا طبيعيًا كبيرًا ونكتبه بالأرقام وبالحروف فئةً فئةً، ونعرف قيمة كل رقم من موقعه: كل عشر وحدات من مرتبة تساوي وحدة من المرتبة التي على يسارها.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔢',
  estimatedDurationMin: 90,
  textbookRef: { unit: 1, activity: 1, pages: '7, 8, 9, 11, 13, 17, 19, 20' },
  skills: [
    'قراءة عدد طبيعي كبير وكتابته بالأرقام وبالحروف بتجزئته إلى فئات من ثلاثة أرقام',
    'تعيين رقم ورتبة كل منزلة (الآحاد، العشرات، المئات، ... الأجزاء من عشرة، من مائة، من ألف) في كتابة عدد، والتمييز بين رقم منزلة وعدد وحداتها (رقم العشرات في 2017 هو 1 وعدد عشراته 201)',
    'كتابة عدد طبيعي على شكل مجموع مفكّك (مفكوكه النموذجي) مثل 6392 = 6×1000 + 3×100 + 9×10 + 2',
  ],
  teachingScope: {
    include: ['الأرقام العشرة وكتابة الأعداد الطبيعية', 'القراءة والكتابة بالحروف فئةً فئةً (ألف، مليون، مليار)', 'جدول المراتب ورقم كل مرتبة (وأسماء مراتب الجزء العشري)', 'رقم المرتبة وعدد وحداتها', 'المفكوك النموذجي لعدد طبيعي', 'أكبر وأصغر عدد بأرقام معطاة'],
    exclude: ['الكسور العشرية والانتقال بين الكتابة الكسرية والكتابة بالفاصلة (الدرس الموالي)', 'المفكوك النموذجي لعدد عشري و«عدد الأعشار» (الدرس الموالي)', 'الضرب والقسمة على 10، 100، 1000 (الدرس الموالي)', 'مقارنة الأعداد العشرية (درس لاحق)'],
  },
  // « مسألة الدرس » : le chèque de l'association, résolu au module 6.
  lessonProblem: {
    module: 6,
    title: 'صكّ جمعية الحيّ',
    statement: 'تلقّت جمعية الحيّ تبرّعًا لترميم مكتبة المدرسة، وعلى أمين المال أن يكتب المبلغ على الصكّ بأمانة: بالأرقام وبالحروف. المبلغ هو مائتان وخمسة وأربعون ألفا وثلاثمائة وثمانون دينارًا.',
    questions: [
      { label: '1)', text: 'اكتب المبلغ بالأرقام، مجزّأً إلى فئات من ثلاثة أرقام.' },
      { label: '2)', text: 'ما رقم الآلاف في هذا المبلغ؟ وما عدد الآلاف فيه؟' },
      { label: '3)', text: 'يسحب أمين المال المبلغ أوراقًا من فئة 1000 دج قدر الإمكان. كم ورقة يأخذ؟ وكم يبقى؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'الصكّ', icon: 'ticket', lines: [{ label: 'المبلغ بالأرقام', value: '؟' }] }, { title: 'السحب', icon: 'coin', lines: [{ label: 'فئة الورقة', value: 1000, unit: 'دج' }] }], ariaLabel: 'صكّ خانة مبلغه بالأرقام فارغة، وسحب بأوراق من فئة 1000 دج' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique (primaire, manuel p. 8 : items 1–4 et 6) : les rangs et la lecture / écriture d'un nombre.
  priorKnowledge: ['maratib-ibtidai', 'kitabat-adad-ibtidai'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `rank-exchange` (l'échange dix pour un) :
    //   مبتدئ — l'atelier d'emballage des crayons (plateforme) : emballer 1 · 13 · 24 · 37, puis ouvrir 2017 en paquets de 10.
    //   متقدم — les jetons de rang : 999 + 1 en cascade, 999 − 1, 1000 − 1.
    // Module 2 — la dictée (7065, 4 908 732) sur les jetons, posée seule en tête de معارف.
    {
      kind: 'manipulation', code: 'rank-exchange-pencils', type: 'rank-exchange', module: 1,
      level: 'beginner',
      title: 'ورشة تعليب الأقلام',
      objective: 'كل 10 وحدات من مرتبة تساوي وحدة واحدة من المرتبة التي على يسارها: رقم المرتبة هو ما يبقى فيها بعد الربط، وعدد وحداتها يشمل ما في المراتب الأعلى',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'packing' },
      learningPointIds: ['1am_kitabat-adad-tabii_P2', '1am_kitabat-adad-tabii_P3'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'rank-exchange-tokens', type: 'rank-exchange', module: 1,
      level: 'advanced',
      title: 'قطع المراتب: العدد الذي يلي 999 والذي يسبق 1000',
      objective: 'كل 10 وحدات من مرتبة تساوي وحدة واحدة من المرتبة التي على يسارها: رقم المرتبة هو ما يبقى فيها بعد الربط، وعدد وحداتها يشمل ما في المراتب الأعلى',
      autonomy: 'يبني التلميذ بنفسه العدد الذي يلي 999 (ثلاث عمليات ربط متتالية) والعدد الذي يسبق 1000 (ثلاث عمليات فتح)',
      experience: { type: 'platform_context', reason: 'platform_designed_entry' },
      learningPointIds: ['1am_kitabat-adad-tabii_P2'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'rank-exchange-dictation', type: 'rank-exchange', module: 2,
      title: 'إملاء: 7065 و 4 908 732 على لوحة المراتب',
      learningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2'],
      sourceElementIds: ['know-1'],
    },
    // Module 3 — l'exercice 2 (1345 DA en billets de 100 DA) dans le MÊME instrument, monde `money`, posé seul.
    {
      kind: 'manipulation', code: 'rank-exchange-money', type: 'rank-exchange', module: 3,
      title: 'تمرين 2: 1345 دج في أوراق من فئة 100 دج',
      learningPointIds: ['1am_kitabat-adad-tabii_P2'],
      sourceElementIds: ['ex-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 6, title: 'مسألة الدرس — صكّ جمعية الحيّ', learningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2'] },
    { kind: 'situation', code: 'masala-2', module: 7, title: 'مسألة — أوراق قاعة الطباعة', learningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2', '1am_kitabat-adad-tabii_P3'] },
    { kind: 'situation', code: 'masala-3', module: 8, title: 'مسألة — عدّاد زوّار معرض الكتاب', learningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2', '1am_kitabat-adad-tabii_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ المراتب وقراءة الأعداد.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — ورشة تحزيم الأقلام', desc: 'اربط أقلام الورشة: متى نستطيع أن نكتب عددها؟',
      stage: 'trigger', teachesLearningPointIds: ['1am_kitabat-adad-tabii_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — كتابة الأعداد الطبيعية', desc: 'الفئات، جدول المراتب، والمفكوك النموذجي.',
      stage: 'discovery', teachesLearningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2', '1am_kitabat-adad-tabii_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — رقم المرتبة وعدد وحداتها', desc: '1345 دج في أوراق من 100 دج: كم ورقة؟',
      stage: 'formalization', teachesLearningPointIds: ['1am_kitabat-adad-tabii_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'نشاط الكتاب ص 9، تمارين الكتاب 1 ، 2 ، 3 ، 12 وأقوّم تعلّماتي 1.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2', '1am_kitabat-adad-tabii_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'aadad-kabira', path: `${LESSON_BASE_PATH}/aadad-kabira`,
      title: 'أعداد كبيرة', desc: 'المليون والمليار، بُعد الكواكب، والأرقام الرومانية.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أتعمّق' },
    { id: '06', number: 6, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — صكّ جمعية الحيّ', desc: 'مسألة الدرس: مبلغ بالحروف وبالأرقام، وأوراق من 1000 دج.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — أوراق قاعة الطباعة', desc: 'صناديق ورزم وأوراق: كم ورقة في المخزن؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2', '1am_kitabat-adad-tabii_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — عدّاد زوّار معرض الكتاب', desc: 'زائر جديد: كيف يتغيّر العدد 1 099 999؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_kitabat-adad-tabii_P1', '1am_kitabat-adad-tabii_P2', '1am_kitabat-adad-tabii_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '09', number: 9, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
