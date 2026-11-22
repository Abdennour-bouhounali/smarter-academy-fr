/**
 * الدرس — توزيع الضرب على الجمع والطرح (2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية ») — générée DANS son entrée du catalogue (item 2am.m1.r03), cycle moyen phase 3
 * (2026-10-29), quatrième et dernière leçon de l'unité avant sa synthèse (après `silsila-bidun-aqwas`, `silsila-bi-aqwas` et `wasf-silsila-hisab`, PUBLIÉES). Manuel 2AM (الجيل الثاني, منشورات الشهاب),
 * RÉFÉRENCE des الكفاءات : أستعدّ p. 7 (items 9 et 11), نشاط 6 p. 9, معارف 4 p. 12, طرائق 3 et 4 p. 13, تمارين 21–28 et 31–36, أؤكّد 7–10, أتعمّق 42 ; pas d'entrée du manuel conservée.
 * Source : docs/sources/2am/unit1/extraction.json (plan : docs/sources/2am/unit1/plan/tawzi-darb-jam-tarh.md). Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : `2am.m1.r02 → 2am.m1.r03` (requires, `silsila-bi-aqwas`, 2AM PUBLIÉE) : « أستعدّ » mesure les parenthèses (« راجع ») et la leçon les rappelle AVEC lien (« تذكّر — الأقواس », module 2).
 * `pointPrerequisites` : P2 ← P1, P3 ← P1 et P2, P4 ← P3, P1 ← `2am_silsila-bi-aqwas_P1` (aucune arête d'une autre année : aucun item 1AM n'est lié à `2am.m1.r03`).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : (d) « ورشة الحقائب التضامنية » (labo `kit-packer`, thème `solidarity`). Le نادي التضامن prépare 6 cartables identiques (3 cahiers + 2 stylos). Fatima les remplit cartable par cartable
 *   (6 × (3 + 2) = 30 objets sortent du magasin) ; Ali travaille « صنفًا بصنف » : il règle le distributeur de cahiers puis celui de stylos et le tapis DISTRIBUE chaque chargement aux 6 cartables, un par cartable.
 *   Avec 3 cahiers et 2 stylos seuls trois cartables reçoivent un cahier : il faut sortir 6 × 3 = 18 cahiers et 6 × 2 = 12 stylos, et le compteur du magasin affiche 18 + 12 = 30, ce que Fatima a utilisé :
 *   multiplier une somme par 6, c'est multiplier CHAQUE terme (le produit est « distribué » comme les objets). Une différence (paquets de 10 moins 2 abîmés) puis la lecture à l'envers (distributeurs
 *   verrouillés : le nombre de cartables sort comme facteur commun), puis le calcul mental (9 × 48 = 9 × 50 − 9 × 2) et des rubans en mètres. L'ARBITRE est le cartable, jamais un corrigé : deux compteurs égaux
 *   ne suffisent pas (n = 20, m = 10 donne 30 = 30 et des cartables faux).
 *   Rejetées : (a) le نشاط 6 du manuel (deux rectangles aux expressions déjà données, l'élève interprète et justifie) : rien à faire de la main — devient une APPLICATION (أتمرّن 1, l'aire reste un contexte de P1) ;
 *   (b) une AIRE coupée en deux par le déplacement d'un côté : c'est l'expérience de `area-split` (3AM) et de `turf-factoring` (4AM), même geste, même image ; (c) un ticket de caisse lu de deux façons (par client / par
 *   article) : honnête mais les deux totaux sont simplement affichés, aucune résistance — gardé comme مسألة 1.
 *   Ordre des idées : deux façons de remplir les cartables (k1, k2) → une différence (k3) → lecture à l'envers : le facteur commun (k4) → calcul mental et décimaux (a1, a2) → la commande d'un camarade à corriger (a3)
 *   → معارف (نشر / تحليل) → طريقة (calcul mental, la lettre) → أتمرّن, trois مسائل, le test.
 *   Hors périmètre : deux parenthèses (a + b)(c + d) et les carrés (3AM `nashr-jabri-3am`), les nombres négatifs (2AM unité 3), la réduction de termes semblables au-delà de « (4 + 3)x » lu comme une mise en facteur
 *   (3AM `tabsit-hadhf-aqwas`), les parenthèses précédées de − ; produire des expressions à partir de situations, 1 × a, 0 × a (2AM `ibara-harfiya-intaj`) ; toute valeur montrée est ≥ 0.
 *   Changements d'الكفاءات (ordre gardé) : P1 « عدد أشياء أو ثمن أو مساحة » (le labo compte des cartables, act-6 garde l'aire) ; P2 « حيث a ≥ b » explicite ; P3 « أو فرق » et la lettre (4x) ;
 *   P4 exemples propres (25 × 4,3 + 25 × 5,7 et 99 × 7) au lieu de celui du manuel.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/tawzi-darb-jam-tarh';

export const LESSON_CONFIG = {
  id: 'tawzi-darb-jam-tarh',
  kind: 'lesson',
  unit: 'amaliyat-tabiiya-ushriya',
  unitTitle: 'العمليات على الأعداد الطبيعية والأعداد العشرية',
  sequentialUnlock: true,
  title: 'توزيع الضرب على الجمع والطرح',
  description: 'في ورشة نادي التضامن يملأ التلميذ حقائب مدرسية متماثلة بطريقتين: حقيبة بحقيبة، أو صنفًا بصنف بموزّعين، فيكتشف أنّ ضرب عدد في مجموع أو فرق هو ضربه في كلّ حدّ، ثم ينشر ويحلّل ويحسب ذهنيًا ويتعامل مع عبارة فيها حرف.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎒',
  estimatedDurationMin: 90,
  textbookRef: { unit: 1, activity: 6, pages: '7, 9, 12, 13, 15, 16, 17, 18' },
  skills: [
    'التعبير عن عدد أشياء أو ثمن أو مساحة بطريقتين للوصول إلى المساواة $k \\times (a + b) = k \\times a + k \\times b$',
    'تطبيق خاصية توزيع الضرب على الطرح: $k \\times (a - b) = k \\times a - k \\times b$ (حيث $a \\ge b$)',
    'نشر جداء (من جداء إلى مجموع أو فرق) وتحليل مجموع أو فرق (من مجموع إلى جداء) بالخاصية التوزيعية، ومنها عبارة فيها حرف مثل $4 \\times (x - 3) = 4x - 12$',
    'توظيف الخاصية التوزيعية في الحساب الذهني، مثل $25 \\times 4{,}3 + 25 \\times 5{,}7$ و $99 \\times 7$',
  ],
  teachingScope: {
    include: ['ضرب عدد في مجموع أو في فرق (على الأعداد الطبيعية والعشرية، مع a ≥ b) وقراءة المساواة في الاتجاهين: النشر والتحليل', 'العامل المشترك الظاهر في جداءين مجموعين أو مطروحين', 'الحساب الذهني: ×11 و ×9 و ×99 و ×101 و (50 − 2) × 7', 'حرف واحد في k × (x ± b) والكتابة 3 × x = 3x، وتحقّق من النشر بقيمة للحرف'],
    exclude: ['ضرب قوسين (a + b)(c + d) والمربّعات (درس لاحق في السنة الثالثة)', 'الأعداد النسبية السالبة (وحدة لاحقة)', 'تبسيط مجاميع الحدود المتشابهة (السنة الثالثة)', 'حذف الأقواس المسبوقة بإشارة −', 'كلّ نتيجة وسيطة سالبة'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'حقائب النادي',
    statement: 'يحضّر النادي 35 حقيبة؛ في كلّ حقيبة 4 كراريس ثمن الواحد منها $45 \\mathrm{DA}$ و 3 أقلام ثمن الواحد منها $25 \\mathrm{DA}$ .',
    questions: [
      { label: '1)', text: 'احسب ثمن مشتريات حقيبة واحدة.' },
      { label: '2)', text: 'احسب ثمن مشتريات الحقائب كلّها بطريقتين.' },
      { label: '3)', text: 'لدى النادي $9\\,000 \\mathrm{DA}$ : هل يكفي؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'في كلّ حقيبة', lines: [{ label: '4 كراريس', value: '⁦45 DA⁩' }, { label: '3 أقلام', value: '⁦25 DA⁩' }] }, { title: 'عدد الحقائب', lines: [{ label: 'حقيبة', value: '35' }, { label: 'رصيد النادي', value: '⁦9 000 DA⁩' }] }], ariaLabel: 'بطاقتان: محتوى الحقيبة وثمنه، وعدد الحقائب ورصيد النادي' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (2am.m1.r02, les parenthèses), l'aire du rectangle (1AM) et la lettre comme nombre.
  priorKnowledge: ['silsila-bi-aqwas-2am', 'masahat-muhit-sath-1am', 'harf-adad-1am', 'wasf-silsila-hisab-2am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `kit-packer` (la main règle ce que chaque distributeur sort), thème `solidarity`.
    {
      kind: 'manipulation', code: 'kit-packer-simple', type: 'kit-packer', module: 1,
      level: 'beginner',
      title: 'ورشة الحقائب التضامنية: حقيبة بحقيبة أو صنفًا بصنف',
      objective: 'أكتشف كيف يتوزّع الضرب على حدّي المجموع أو الفرق',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'solidarity' },
      learningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P2', '2am_tawzi-darb-jam-tarh_P3'],
      sourceElementIds: ['act-6', 'know-4'],
    },
    {
      kind: 'manipulation', code: 'kit-packer-predict', type: 'kit-packer', module: 1,
      level: 'advanced',
      title: 'ورشة الحقائب التضامنية: أتوقّع ثم أوزّع',
      objective: 'أكتشف كيف يتوزّع الضرب على حدّي المجموع أو الفرق',
      autonomy: 'يكتب التلميذ توقّعه للعدد الكلّي قبل «وزّع»، ويكتب 48 على شكل 50 − 2، ويصحّح طلب زميل نسي ضرب الحدّ الثاني',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'solidarity' },
      learningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P3', '2am_tawzi-darb-jam-tarh_P4'],
      sourceElementIds: ['method-3', 'self-8', 'ex-23'],
    },
    // Module 2 — le MÊME type, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'kit-packer-alone', type: 'kit-packer', module: 2,
      title: 'ما الذي أخرجه كلّ ممرّ؟',
      learningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P3'],
      sourceElementIds: ['know-4'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — حقائب النادي', learningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P3'], sourceElementIds: ['ex-27'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — ورشة الخياطة', learningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P4'], sourceElementIds: ['ex-26'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — آلة لا تتّسع', learningPointIds: ['2am_tawzi-darb-jam-tarh_P2', '2am_tawzi-darb-jam-tarh_P4'], sourceElementIds: ['ex-28', 'deep-42'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ الأقواس ومساحة المستطيل وكتابة الجداء بحرف.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 7, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — ورشة الحقائب التضامنية', desc: 'يملأ التلميذ حقائب متماثلة بطريقتين: يضبط موزّعين يخرجان الكراريس والأقلام ويقارن عدّاده بعدّاد فاطمة، ثم مع فرق وبحثًا عن العامل المشترك.',
      stage: 'trigger', teachesLearningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P2', '2am_tawzi-darb-jam-tarh_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 15, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — توزيع الضرب والنشر والتحليل', desc: 'نسمّي ما فعلناه: خاصية التوزيع على الجمع وعلى الطرح، والنشر والتحليل.',
      stage: 'discovery', teachesLearningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P2', '2am_tawzi-darb-jam-tarh_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — الحساب الذهني والحرف', desc: 'نحسب ذهنيًا بإخراج عامل مشترك أو بكتابة عدد قريب من عدد مدوّر، وننشر عبارة فيها حرف.',
      stage: 'formalization', teachesLearningPointIds: ['2am_tawzi-darb-jam-tarh_P3', '2am_tawzi-darb-jam-tarh_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'مساحة مستطيلين بطريقتين، أخطاء زميل، النشر والتحليل، الحساب بطريقتين، الحساب الذهني، وعبارة فيها حرف.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P2', '2am_tawzi-darb-jam-tarh_P3', '2am_tawzi-darb-jam-tarh_P4'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حقائب النادي', desc: 'مسألة الدرس: ثمن 35 حقيبة بطريقتين، وهل يكفي رصيد النادي؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — ورشة الخياطة', desc: 'قماش 12 ستارة بأعداد عشرية: حساب ذهني بإخراج عامل مشترك.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_tawzi-darb-jam-tarh_P1', '2am_tawzi-darb-jam-tarh_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — آلة لا تتّسع', desc: 'آلة حاسبة لا تعرض أكثر من 8 أرقام: نكتب 99 = 100 − 1 وننشر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_tawzi-darb-jam-tarh_P2', '2am_tawzi-darb-jam-tarh_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
