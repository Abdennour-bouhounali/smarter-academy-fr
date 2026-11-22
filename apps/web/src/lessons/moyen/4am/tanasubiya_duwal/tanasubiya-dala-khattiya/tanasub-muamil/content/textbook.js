/**
 * Le contenu du درس 1 « التناسبية ومعامل التناسبية » (unité 6, manuel pp. 65–76) — données pures
 * (aucun JSX). Chaque bloc cite sa source : un élément de docs/sources/4am/unit6/extraction.json
 * (`src(…)`) ou un ajout DÉCLARÉ de la plateforme (`addition(…)`).
 *
 * Le manuel n'a, dans cette unité, AUCUN encadré « معارف » sur la proportionnalité : il la suppose
 * acquise (années précédentes) et passe à la fonction linéaire. Ce que la leçon enseigne (جدول تناسبية,
 * معامل التناسبية, خواص, الرابع المتناسب, le montant fixe, y = a × x) est donc un RAPPEL de la plateforme
 * (`addition('prior_year_reminder')`, « تذكير من المنصّة ») — jamais présenté comme les mots du livre.
 * Les situations du livre utilisées ici : « أستعدّ » 4 et 5 (p. 65), نشاط 1 question 1 seulement
 * (p. 66, doublon déclaré — la leçon dala-khattiya en fait le reste), تمارين 16, 17, 18 (p. 73).
 * Pas de notation f(x) ni x ⟼ ax : c'est la leçon 2.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const REMINDER = addition('prior_year_reminder');

/* ── « أستعدّ » ─────────────────────────────────────────────────────────────────────────────── */
/**
 * Items 4 et 5 du manuel (p. 65 ; 1–3 → dala-khattiya, 6–9 → tatbiqat-tanasub) + cinq affirmations
 * de la plateforme, même forme. Quatre acquis supposés, chacun diagnostiqué : multiplier / diviser des
 * nombres relatifs (nisbiya), calculer avec des fractions (kusur), la proportionnalité des années
 * précédentes — tableau, quatrième proportionnel (rabi), le pourcentage (nisba). Aucun n'utilise les
 * nombres du module 1 (15DA la minute, 50 → 40, 0,8).
 */
const PREP = (n) => src('prep', 65, 'أستعدّ', n);
const DIAG = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: 4, skill: 'rabi', text: 'العدد الناقص في جدول التناسبية المقابل هو $-9$ . (السطر الأول: $-2$ ، $3$ ؛ السطر الثاني: $6$ ، $\\ldots$)', answer: true, why: 'معامل التناسبية $\\dfrac{6}{-2} = -3$ ، و $3 \\times (-3) = -9$', source: PREP(4) },
  { n: 5, skill: 'nisba', text: 'في متوسطة 260 تلميذا نصف داخلي وهو مايمثّل 65%. إذن العدد الإجمالي لتلاميذ المتوسطة هو 400.', answer: true, why: '$65\\%$ من 400 هو $400 \\times 0{,}65 = 260$', source: PREP(5) },
  { skill: 'nisbiya', text: '$(-24) \\div (-6) = -4$', answer: false, why: 'حاصل قسمة عددين لهما الإشارة نفسها موجب: $(-24) \\div (-6) = 4$', source: DIAG },
  { skill: 'nisbiya', text: '$-1{,}5 \\times 4 = -6$', answer: true, why: '$1{,}5 \\times 4 = 6$ ، والعددان مختلفا الإشارة فالجداء سالب.', source: DIAG },
  { skill: 'kusur', text: '$\\dfrac{3}{4} \\times 12 = 9$', answer: true, why: '$\\dfrac{3}{4} \\times 12 = \\dfrac{36}{4} = 9$', source: DIAG },
  { skill: 'kusur', text: '$\\dfrac{2}{3} \\div \\dfrac{4}{9} = \\dfrac{8}{27}$', answer: false, why: 'القسمة على كسر هي الضرب في مقلوبه: $\\dfrac{2}{3} \\times \\dfrac{9}{4} = \\dfrac{18}{12} = \\dfrac{3}{2}$', source: DIAG },
  { skill: 'rabi', text: 'إذا كان ثمن 5 كراريس من نوع واحد هو 175DA ، فإنّ ثمن 7 كراريس من النوع نفسه هو 195DA.', answer: false, why: 'ثمن الكراس الواحد $175 \\div 5 = 35$ DA ، إذن ثمن 7 كراريس $7 \\times 35 = 245$ DA ؛ أمّا 195 فهو إضافة 20DA ، وليس ضربًا.', source: DIAG },
];

/* ── Module 1 : le lab, puis نشاط 1 س 1 (transfert) ──────────────────────────────────────────── */

/** L'accroche du module 1 (plateforme) : le kornich et ses trottinettes. */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'تروتينة على كورنيش الصابلات!',
  text: 'في عطلة الصيف تؤجّر تروتينات كهربائية بالدقيقة على كورنيش الصابلات، ويحرص الشباب على إعادتها في وقتها: 15DA لكل دقيقة. اركب، سجّل كل رحلة (مدتها x بالدقائق وسعرها y بالدينار) في جدولك، ثم انظر ماذا يجمع أعمدة جدولك. وعلى الكورنيش صيغة ثانية: 50DA لفتح القفل ثم 10DA للدقيقة — هل تتصرّف مثل الأولى؟',
};

/**
 * نشاط 1 (p. 66), question 1 SEULEMENT — doublon déclaré (extraction › destinations › act-1 ›
 * duplicatedIn › tanasub-muamil). Le manuel imprime « 2% » ; la plateforme CORRIGE en 20 %
 * (correction du propriétaire, 2026-10-02) et le dit en une ligne.
 */
export const ACTIVITY = {
  source: src('act-1', 66, 'أنشطة', 1),
  title: 'تخفيض العيد: جدول تناسبية',
  text: 'قرر تاجر كريم تخفيض ثمن سلعه بـ 20% بمناسبة عيد الفطر، ليتمكّن الجميع من شراء كسوة العيد.',
  correction: 'صحّحت المنصّة خطأً مطبعيًا: في الكتاب «بـ 2%»، والصحيح 20% (به تستقيم أسئلة النشاط).',
  rows: ['السعر قبل التخفيض (DA)', 'السعر بعد التخفيض (DA)'],
  table: { before: [50, 100, 150, 200], after: [40, 80, 120, 160] },
  questions: ['1) انقل الجدول المقابل وأتممه: بيّن أنّ هذا الجدول هو جدول تناسبية، وعيّن معامل التناسبية.'],
  // la ligne d'écriture du tableau complété
  closing: 'حواصل القسمة متساوية: $\\dfrac{40}{50} = \\dfrac{80}{100} = \\dfrac{120}{150} = \\dfrac{160}{200} = 0{,}8$ : الجدول جدول تناسبية، ومعامل التناسبية $0{,}8$.',
  answer: { after: [40, 80, 120, 160], a: '0,8' },
};

/** Les calculs de la question 1 écrits par la plateforme (le livre les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: addition('interaction_generation'),
  first: 'التخفيض $20\\%$ من 50DA هو $50 \\times \\dfrac{20}{100} = 10$ DA ، إذن السعر بعد التخفيض $50 - 10 = 40$ DA.',
  others: 'بالطريقة نفسها: $100 - 20 = 80$ ، $150 - 30 = 120$ ، $200 - 40 = 160$.',
  why: 'نقارن حواصل القسمة: $\\dfrac{40}{50} = 0{,}8$ ، $\\dfrac{80}{100} = 0{,}8$ ، $\\dfrac{120}{150} = 0{,}8$ ، $\\dfrac{160}{200} = 0{,}8$ : هي نفسها في كل الأعمدة.',
  diff: 'أمّا الفروق $50 - 40 = 10$ و $200 - 160 = 40$ فهي مختلفة: الفرق ليس ما يجمع الأعمدة.',
  inverse: '$\\dfrac{50}{40} = 1{,}25$ هو حاصل قسمة السطر الأول على الثاني: معامل التناسبية يُحسب بقسمة السطر الثاني على الأول، $\\dfrac{40}{50} = 0{,}8$.',
};

/* ── Les connaissances (rappels de la plateforme) ───────────────────────────────────────────── */
export const KNOWLEDGE = {
  jadwal: {
    source: REMINDER,
    title: 'جدول التناسبية',
    definition: 'نقول إنّ جدولا من سطرين جدول تناسبية إذا حصلنا على كل عدد من السطر الثاني بضرب العدد المقابل له من السطر الأول في العدد نفسه $a$ . هذا العدد هو معامل التناسبية.',
    example: 'في جدول رحلات التروتينة (15DA للدقيقة): $\\dfrac{30}{2} = \\dfrac{75}{5} = \\dfrac{150}{10} = 15$ : جدول تناسبية معامله 15.',
  },
  muamil: {
    source: REMINDER,
    title: 'حساب معامل التناسبية',
    rule: 'لنعرف هل جدول جدول تناسبية، نحسب في كل عمود حاصل قسمة عدد السطر الثاني على العدد المقابل له في السطر الأول ($\\dfrac{y}{x}$ مع $x \\neq 0$): إذا تساوت كل الحواصل فهو جدول تناسبية، والحاصل المشترك هو معامل التناسبية $a$ .',
    example: 'في تخفيض العيد: $\\dfrac{40}{50} = \\dfrac{80}{100} = \\dfrac{120}{150} = \\dfrac{160}{200} = 0{,}8$ : المعامل $0{,}8$.',
  },
  khawass: {
    source: REMINDER,
    title: 'خواص جدول التناسبية',
    lines: [
      '• مجموع عمودين من جدول تناسبية عمود من الجدول: إذا قابل $x_1$ العدد $y_1$ وقابل $x_2$ العدد $y_2$ فإنّ $x_1 + x_2$ يقابله $y_1 + y_2$ .',
      '• ضرب عمود في عدد $k$ يعطي عمودا من الجدول: $k \\times x_1$ يقابله $k \\times y_1$ .',
    ],
    example: 'رحلات التروتينة: دقيقتان بـ 30DA و 5 دقائق بـ 75DA ، إذن 7 دقائق بـ $30 + 75 = 105$ DA ، و 10 دقائق بـ $2 \\times 75 = 150$ DA.',
  },
  rabi: {
    source: REMINDER,
    title: 'الرابع المتناسب',
    rule: 'لإكمال عمود ناقص في جدول تناسبية نضرب في معامل التناسبية، أو نستعمل الجداءين المتصالبين: إذا كان $\\dfrac{y_1}{x_1} = \\dfrac{y_2}{x_2}$ فإنّ $x_1 \\times y_2 = x_2 \\times y_1$ ، ومنه $y_2 = \\dfrac{y_1 \\times x_2}{x_1}$ .',
    example: 'رحلة مدتها 12 دقيقة: $12 \\times 15 = 180$ DA ، أو بالجداءين المتصالبين $y = \\dfrac{30 \\times 12}{2} = 180$ DA.',
  },
  mablagh: {
    source: REMINDER,
    title: 'مبلغ ثابت يكسر التناسبية',
    rule: 'إذا كان في السعر مبلغ ثابت يُدفع مهما كانت الكمية، فالوضعية ليست تناسبية: من أجل $x = 0$ لا يكون $y = 0$ ، وحواصل القسمة $\\dfrac{y}{x}$ تتغيّر — حتى لو كان $y$ يزداد كلما ازداد $x$ .',
    example: 'الصيغة ب للتروتينة (50DA لفتح القفل + 10DA للدقيقة): $x = 0$ يعطي $y = 50$ ، و $\\dfrac{60}{1} = 60$ لكن $\\dfrac{100}{5} = 20$ : ليس جدول تناسبية.',
    table: {
      x: [0, 1, 2, 5],
      a: [0, 15, 30, 75],
      b: [50, 60, 70, 100],
      ratiosA: ['—', '15', '15', '15'],
      ratiosB: ['—', '60', '35', '20'],
    },
  },
  yax: {
    source: REMINDER,
    title: 'العلاقة بين السطرين',
    rule: 'في جدول تناسبية معامله $a$ ، كل عمود $(x ; y)$ يحقّق $y = a \\times x$ : نحصل على عدد السطر الثاني بضرب عدد السطر الأول في $a$ .',
    example: 'رحلات التروتينة: $y = 15 \\times x$ ؛ تخفيض العيد: السعر بعد التخفيض يساوي $0{,}8 \\times$ السعر قبل التخفيض.',
  },
};

/**
 * Deux erreurs que la leçon EXPLIQUE (module 2), reprises telles quelles par la carte des connaissances.
 */
export const MISTAKES = {
  maqlub: {
    wrong: 'حساب المعامل بقسمة السطر الأول على الثاني: $\\dfrac{4}{10} = 0{,}4$ .',
    why: 'معامل التناسبية هو ما نضرب فيه $x$ لنحصل على $y$ : $y = a \\times x$ ، إذن $a = \\dfrac{y}{x}$ .',
    right: '$\\dfrac{10}{4} = \\dfrac{15}{6} = \\dfrac{25}{10} = 2{,}5$ : المعامل $2{,}5$ ، وفعلا $4 \\times 2{,}5 = 10$ .',
  },
  jama: {
    wrong: 'إكمال العمود الناقص بإضافة الفرق: من 6 إلى 14 نضيف 8 ، فنكتب $9 + 8 = 17$ .',
    why: 'في جدول تناسبية نضرب في المعامل ولا نضيف عددا: $\\dfrac{17}{14} \\neq \\dfrac{9}{6}$ .',
    right: 'المعامل $\\dfrac{9}{6} = 1{,}5$ ، إذن $14 \\times 1{,}5 = 21$ ، أو $6 \\times y = 14 \\times 9$ ومنه $y = 21$ .',
  },
};

/** La conclusion de la leçon (la خلاصة de la carte). */
export const TAKEAWAY = {
  source: REMINDER,
  text: 'جدول تناسبية: حاصل قسمة السطر الثاني على السطر الأول ثابت، هو معامل التناسبية $a$ ، و $y = a \\times x$ . مبلغ ثابت يُضاف يكسر التناسبية.',
};
