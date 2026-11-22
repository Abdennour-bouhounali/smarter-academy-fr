/**
 * الدرس 1 — التناسبية ومعامل التناسبية (unité 6 « الدالة الخطية والتناسبية », 4AM).
 * Entrée de l'unité (« وضعية انطلاق ومدخل للوحدة ») : « أستعدّ » items 4–5 (p. 65), نشاط 1 question 1
 * (p. 66, doublon déclaré, 2% CORRIGÉ en 20 %), exercices 16, 17 (question 2 corrigée), 18 (p. 73).
 * Le manuel n'a pas d'encadré « معارف » de proportionnalité dans l'unité : les connaissances enseignées
 * sont des rappels DÉCLARÉS de la plateforme (`addition('prior_year_reminder')`). Pas de f(x) ni de
 * x ⟼ ax (leçon 2). Source de vérité : docs/sources/4am/unit6/extraction.json.
 * Puis trois « مسائل » de la plateforme (modules 4–6) ; l'إختبار أولي passe au module 7.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la TROTTINETTE du kornich (compteur de trajet) — la main FIXE la durée x, enregistre SA colonne, et c'est son
 *   propre tableau qui se laisse juger : y ÷ x ne bouge pas ; ajout déclaré de la plateforme (`platform_designed_entry`, niveau
 *   مبتدئ), le niveau متقدم (50DA + 10DA la minute) est le contraste. Rejeté : le نشاط 1 du manuel (remise de l'Aïd 50 → 40…)
 *   comme entrée — il se résout par un calcul de pourcentage fait de mémoire, la proportionnalité n'y devient jamais nécessaire
 *   pour la main ; il reste l'APPLICATION après la première réponse (étapes 2–3). Rejeté aussi : ouvrir sur la définition du
 *   tableau de proportionnalité (rien à faire pour la main).
 *   Ordre des idées : (module 1) mes colonnes → POURQUOI y ÷ x ne bouge pas (le prix de x minutes est 15 × x) → brique « جدول
 *   التناسبية » APRÈS la réponse → la remise de l'Aïd, même idée sur le tableau du livre → (module 2) le coefficient sur un tableau
 *   (l'inverse 0,4 expliqué) → les colonnes se somment et se multiplient → le quatrième proportionnel → le montant fixe : « le
 *   prix augmente » ne suffit pas → y = a × x. Module 2 sans labo : la question d'abord, « أتوقّع القاعدة », l'encadré et la
 *   brique APRÈS la réponse.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/tanasub-muamil';

export const LESSON_CONFIG = {
  id: 'tanasub-muamil',
  kind: 'lesson',
  unit: 'tanasubiya-dala-khattiya',
  unitTitle: 'الدالة الخطية والتناسبية',
  sequentialUnlock: true,
  title: 'التناسبية ومعامل التناسبية',
  description: 'وضعية انطلاق ومدخل للوحدة: التعرف على الوضعية التناسبية في جدول وحساب معامل التناسبية $a$ ، إتمام جداول التناسبية بخواص التناسبية أو الرابع المتناسب، التمييز بين وضعية تناسبية ووضعية غير تناسبية، والتعبير عن العلاقة بين سطري جدول تناسبية بالعبارة $y = a \\times x$ .',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🛴',
  estimatedDurationMin: 45,
  textbookRef: { unit: 6, activity: 1, pages: '65, 66, 73' },
  skills: [
    'التعرف على جدول تناسبية وحساب معامل التناسبية',
    'إتمام جدول تناسبية بخواص التناسبية أو بالرابع المتناسب',
    'التمييز بين وضعية تناسبية ووضعية غير تناسبية من حواصل القسمة',
    'كتابة العلاقة بين سطري جدول تناسبية على الشكل y = a × x',
  ],
  teachingScope: {
    include: [
      'رحلات التروتينة على الكورنيش: جدول المدة والسعر وحواصل القسمة y ÷ x (مخبر الدرس)',
      'نشاط 1، السؤال 1: جدول تخفيض العيد (20% بعد تصحيح خطأ مطبعي) ومعامله 0,8',
      'جدول التناسبية ومعامل التناسبية، خواص الجدول، الرابع المتناسب والجداءان المتصالبان (تذكير من المنصّة)',
      'المبلغ الثابت يكسر التناسبية، والعلاقة y = a × x',
      'تمارين الكتاب 16، 17، 18 (التعرف على وضعية تناسبية)',
    ],
    exclude: [
      'الدالة الخطية والترميزان f(x) و x ⟼ ax (الدرس 2)',
      'التمثيل البياني لدالة خطية ومعامل التوجيه (الدرس 3)',
      'النسب المئوية والمقادير المركّبة (الدرس 4)',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : relatifs (×, ÷), fractions, proportionnalité des années
  // précédentes (tableau, quatrième proportionnel), pourcentage.
  priorKnowledge: ['darb-qisma-nisbiya', 'amaliyat-kusur', 'tanasub-sabiq', 'nisba-miawiya'],
  // « مسألة الدرس » (MASAIL_GENERATION_GUIDE.md) : l'énoncé de la مسألة 1, montré au sommaire et à la fin
  // du module 1, résolu au module 4 — le compteur de trajet du niveau متقدم avec d'autres tarifs.
  lessonProblem: {
    module: 4,
    title: 'تروتينات كورنيش جيجل',
    statement: 'على كورنيش جيجل تؤجّر وكالة تروتينات كهربائية، تشترط على زبائنها احترام المارة وقواعد السلامة، بصيغتين: الصيغة (أ) 12 دج لكل دقيقة، والصيغة (ب) 60 دج لفتح القفل ثم 8 دج لكل دقيقة. تملك الوكالة 40 تروتينة، وسرعة التروتينة لا تتجاوز 20 كم في الساعة. سجّل سمير في جدول أسعار رحلات مدتها 5 و 10 و 15 و 20 دقيقة بالصيغتين. نرمز بـ $x$ إلى مدة الرحلة بالدقائق وبـ $y$ إلى سعرها بالدينار.',
    // Le support de la مسألة 1, montré aussi par la carte « مسألة الدرس » (une seule source).
    table: {
      head: ['المدة $x$ (دقيقة)', '5', '10', '15', '20'],
      rows: [
        ['السعر بالصيغة (أ) (دج)', '60', '120', '180', '240'],
        ['السعر بالصيغة (ب) (دج)', '100', '140', '180', '220'],
      ],
    },
  },
  resources: [
    // Le module 1 ouvre sur le COMPTEUR DE TRAJET (ratio-ride), monde `scooter` (plateforme) : la
    // mathématique est celle de نشاط 1 س 1 (un tableau, son coefficient) et de l'exercice 18 (décider
    // laquelle de deux situations est proportionnelle) ; le manuel n'a pas d'activité de découverte de
    // la proportionnalité — le lab est l'entrée de l'unité.
    {
      kind: 'manipulation', code: 'ratio-ride-15x', type: 'ratio-ride', module: 1,
      level: 'beginner',
      title: 'تروتينة 15DA للدقيقة',
      objective: 'جدول تناسبية: حاصل القسمة y ÷ x ثابت، هو معامل التناسبية a ، و y = a × x ؛ مبلغ ثابت يكسر التناسبية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'scooter' },
      learningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P3'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'ratio-ride-15x-10x50', type: 'ratio-ride', module: 1,
      level: 'advanced',
      title: 'صيغتان للكراء: 15DA للدقيقة أو 50DA + 10DA للدقيقة',
      objective: 'جدول تناسبية: حاصل القسمة y ÷ x ثابت، هو معامل التناسبية a ، و y = a × x ؛ مبلغ ثابت يكسر التناسبية',
      autonomy: 'صيغتان جنبًا إلى جنب يزداد فيهما السعر كلاهما: التلميذ يقرّر وحده أيّ الجدولين جدول تناسبية، وسطر حواصل القسمة مخفيّ حتى يطلبه، ثم يكتب العلاقة y = 15 × x بنفسه',
      experience: { type: 'platform_adaptation', reason: 'improved_interactivity_and_age_appropriateness', theme: 'scooter' },
      learningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P2', '4am_tanasub-muamil_P3'],
      sourceElementIds: ['act-1', 'ex-18'],
    },
    // Les trois « مسائل » de la plateforme (content/problems.js), chacune une situation complète.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس: تروتينات كورنيش جيجل',
      learningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P2', '4am_tanasub-muamil_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'كسكسي الجمعة',
      learningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P2', '4am_tanasub-muamil_P3'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'خريطة طرق ولاية بجاية',
      learningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات (اثنتان من الكتاب): ضرب وقسمة الأعداد النسبية، الكسور، جدول التناسبية والنسبة المئوية. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'rihla', path: `${LESSON_BASE_PATH}/rihla`,
      title: 'رحلة بالتروتينة — جدول التناسبية', desc: 'اركب التروتينة وسجّل رحلاتك في جدول، واقرأ حواصل القسمة y ÷ x ، ثم جدول تخفيض العيد (نشاط 1، السؤال 1).',
      stage: 'trigger', teachesLearningPointIds: ['4am_tanasub-muamil_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أركب وأجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المعامل، الخواص والرابع المتناسب', desc: 'حساب معامل التناسبية، خواص الجدول، الرابع المتناسب، المبلغ الثابت الذي يكسر التناسبية، والعلاقة y = a × x.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P2', '4am_tanasub-muamil_P3'],
      color: 'violet', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 16، 17، 18 (التعرف على وضعية تناسبية) وتمرين من المنصّة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P2', '4am_tanasub-muamil_P3'],
      color: 'amber', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أتدرّب' },
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — تروتينات كورنيش جيجل', desc: 'مسألة الدرس: صيغتان للكراء، أيّ الجدولين جدول تناسبية؟ معامله، والعلاقة y = 12 × x ، ثم أيّ صيغة تكفي مصروف سلمى.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P2', '4am_tanasub-muamil_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — كسكسي الجمعة', desc: 'كمية السميد متناسبة مع عدد الأشخاص، ومدة الطهي ليست كذلك؛ ثم كم كيسًا تشتري الطبّاخة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P2', '4am_tanasub-muamil_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — خريطة طرق ولاية بجاية', desc: 'معامل الخريطة، لافتات الطريق التي لا تتناسب معها، وثمن كراء الحافلة لكل منخرط.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tanasub-muamil_P1', '4am_tanasub-muamil_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
