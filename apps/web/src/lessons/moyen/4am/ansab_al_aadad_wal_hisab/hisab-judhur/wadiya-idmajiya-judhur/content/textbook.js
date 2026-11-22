import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — aucun item du « أستعدّ » du manuel (p. 19) n'est
 * attribué à la synthèse : ces affirmations sont des AJOUTS DE LA PLATEFORME
 * (SourceTag « عبارة إضافية من المنصّة »), dans la forme du manuel, deux par
 * acquis de `priorKnowledge` (√a — leçon 1, x² = a — leçon 3, a√b — leçon 5),
 * jamais les nombres de la situation (24, 12, 2√3…).
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'jidhr', text: '$\\sqrt{0{,}09} = 0{,}3$ لأنّ 0,3 عدد موجب و $0{,}3^2 = 0{,}09$.', answer: true, why: 'الجذر التربيعي للعدد 0,09 هو العدد الموجب الذي مربعه 0,09، وهو 0,3.' },
  { n: 2, skill: 'jidhr', text: 'الجذر التربيعي للعدد 49 هو $-7$، لأنّ $(-7)^2 = 49$.', answer: false, why: 'الجذر التربيعي عدد موجب: $\\sqrt{49} = 7$. العدد $-7$ مربعه 49 لكنه سالب.' },
  { n: 3, skill: 'muadala', text: 'المعادلة $x^2 = 81$ تقبل حلين هما 9 و $-9$.', answer: true, why: '$81 > 0$، و $9^2 = (-9)^2 = 81$.' },
  { n: 4, skill: 'muadala', text: 'المعادلة $x^2 = -4$ تقبل حلين هما 2 و $-2$.', answer: false, why: '$2^2 = (-2)^2 = 4$ وليس $-4$: مربع أي عدد موجب، فالمعادلة لا تقبل أي حل.' },
  { n: 5, skill: 'kitaba', text: '$\\sqrt{50} = 5\\sqrt{2}$، لأنّ $50 = 25 \\times 2$ و 25 مربع تام.', answer: true, why: '$\\sqrt{50} = \\sqrt{25 \\times 2} = \\sqrt{25} \\times \\sqrt{2} = 5\\sqrt{2}$.' },
  { n: 6, skill: 'kitaba', text: 'الكتابة $2\\sqrt{18}$ هي أبسط كتابة للعدد $\\sqrt{72}$.', answer: false, why: '18 يقبل التبسيط ($18 = 9 \\times 2$): أكبر مربع يقسم 72 هو 36، فـ $\\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}$.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/**
 * « أدمج تعلّماتي » (p. 28) — la وضعية (le mot près du manuel reste dans extraction.json ; la mise en scène
 * porte, depuis le 2026-10-13, un trait de valeur : الكرم والاعتزاز بالتراث — nombres et données inchangés). L'analyse du manuel en
 * trois étapes ; la DEUXIÈME est affichée dans sa version corrigée
 * (`correction.analysis1` de l'extraction, décision du propriétaire du
 * 2026-09-30) : le manuel imprime « استبعاد المعطيات المُشوّشة 24m² », or
 * l'aire est nécessaire au calcul — la donnée parasite est le prix.
 */
export const SITUATION = {
  source: src('situation', 28, 'أدمج تعلّماتي'),
  title: 'وضعية',
  text: 'أرادت أم كريمة تعتزّ بتراث بلدها أن تشتري زربية مستطيلة الشكل لتضعها على أرضية غرفة الاستقبال التي تُكرم فيها ضيوفها. عندما طلبت من البائع سعر الزربية وبعديها أجاب التاجر بالعبارات التالية: سعر الزربية هو 12000 دج ومساحتها $24m^2$ وطولها ضعف عرضها. ساعد هذه الأم على معرفة طول هذه الزربية وعرضها. (تدوّر النتائج إلى cm)',
  caption: 'زربية وادي سوف',
  data: [
    { id: 'shakl', text: 'الزربية مستطيلة الشكل', useful: true },
    { id: 'masaha', text: 'مساحة الزربية 24 مترًا مربّعًا', useful: true },
    { id: 'diaf', text: 'طول الزربية ضعف عرضها', useful: true },
    { id: 'sir', text: 'سعر الزربية هو 12000 دج', useful: false },
    { id: 'ghurfa', text: 'الزربية توضع على أرضية غرفة الاستقبال', useful: false },
    { id: 'bai', text: 'التاجر هو الذي أجاب الأم', useful: false },
  ],
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'المطلوب البحث عن بُعدي الزربية علما أنّ: الزربية مستطيلة الشكل، طولها ضعف عرضها، مساحتها $24m^2$، ثمنها 12000 دج.' },
    { label: 'تحليل التعليمة واختيار إستراتيجية حل مناسبة', text: 'إذا كان L طول الزربية و $\\ell$ عرضها فإنّ $L = 2\\ell$، العلاقة الموجودة بين المساحة والبعدين. استبعاد المعطيات المُشوّشة: 12000 دج.' },
    { label: 'تنفيذ استراتيجية الحل', text: 'كتابة عبارة المساحة بدلالة $\\ell$ ، القيام بالعمليات المناسبة ( التبسيط، حل معادلة ، ...)' },
  ],
};

/**
 * Les corrections des questions du module 7 — importées aussi par la carte
 * (knowledgeGraph.js) : une aide de la carte cite la leçon mot pour mot.
 */
export const REMARKS = {
  masaha: 'مساحة المستطيل هي جداء طوله في عرضه، والطول هنا ضعف العرض: $L \\times \\ell = 2\\ell \\times \\ell = 2\\ell^2$.',
  sirWrong: 'نستعمل الثمن بالدينار في المعادلة التي تترجم المساحة.',
  sirWhy: 'الثمن بالدينار لا علاقة له بالمساحة ولا بالبعدين: إنه معطى مشوِّش.',
  sirRight: 'المساحة والعلاقة بين الطول والعرض تكفيان لإيجاد البعدين.',
  mujab: 'العرض طول، والطول عدد موجب: من حلّي المعادلة نحتفظ بالحل الموجب وحده.',
  tadwirWrong: 'ندوّر العرض إلى 1cm أولًا، ثم نضرب هذه القيمة المدوّرة في 2 لنحصل على الطول.',
  tadwirWhy: 'الطول ضعف العرض، فضربُ قيمة مدوّرة في 2 يضاعف خطأ التدوير، وقد يتغيّر الرقم الأخير من الطول.',
  tadwirRight: 'نحسب القيمتين المضبوطتين للعرض والطول، ثم ندوّر كلًّا منهما في النهاية فقط.',
  notSolvedHere: 'الحلّ نفسه في «وضعية الاختبار النهائي»: هنا فهمنا واختطّينا الاستراتيجية فقط.',
};

/**
 * LA CARTE DES معارف EN LETTRES (la synthèse dans le lecteur de mission, 2026-11-12) : la carte est ouverte dès le premier écran
 * (`knowledgeMapOpen`), donc AVANT le module 7 — elle ne montre ni la زربية ni ses nombres (content/forbidden.js › SITUATION_TEXT), seulement la
 * DÉMARCHE en lettres : un rectangle d'aire S dont la longueur est le double de la largeur ℓ. Lue par knowledgeGraph.js (une aide de la carte
 * cite la leçon mot pour mot).
 */
export const METHOD_LETTERS = {
  question: 'مستطيل معلومة مساحته $S$ وطوله ضعف عرضه: ما بُعداه؟',
  useful: ['مساحة المستطيل $S$', 'طوله ضعف عرضه: $L = 2\\ell$', 'الثمن بالدينار لا يدخل في حساب البعدين'],
  read: 'المطلوب بُعدا المستطيل: نعرف مساحته، ونعرف أنّ طوله ضعف عرضه. أمّا الثمن فلا يدخل في الحساب.',
  strategy: 'نسمّي العرض $\\ell$ فيكون الطول $2\\ell$، ونكتب المساحة بدلالة $\\ell$ : $2\\ell^2 = S$، ثم نقسم الطرفين على 2.',
  execute: 'نحلّ المعادلة $\\ell^2 = \\dfrac{S}{2}$ ونحتفظ بالحلّ الموجب، ونكتبه على أبسط شكل، ثم ندوّر في النهاية فقط.',
};
