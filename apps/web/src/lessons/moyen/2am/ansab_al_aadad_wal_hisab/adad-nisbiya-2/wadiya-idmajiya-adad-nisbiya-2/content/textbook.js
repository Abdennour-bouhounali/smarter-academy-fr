/**
 * Le contenu de « أدمج تعلّماتي — الأعداد النسبية » (2AM, unité 3) — données pures. Le manuel (p. 38 : تحدّي ; p. 52 : `integration` et `evaluation`) est la RÉFÉRENCE ; chaque texte montré
 * à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : autres nombres, autre mise en scène). La situation finale est un camp d'hiver à Djelfa : cinq minimales et cinq maximales (°C),
 * chaque jour est un point (numéro du jour ; minimale) d'un repère orthonormé. Les clés (−5,5 < −3 < −2 < −0,5 < +1 ; 10 ; +6,5 ; +1 ; (4 ; −0,5)) vivent dans `FINAL` et dans le module 8 ;
 * le module 7 n'en montre aucune. Aucune ligne n'envoie au manuel : `SourceTag` est muet.
 * Frontière 2AM : abscisses, coordonnées, ordre, sommes et différences de deux relatifs, sommes algébriques (parenthèses d'abord), distances sur une droite ; jamais un produit ni un quotient
 * de relatifs (3AM), jamais une équation (unité 4), jamais la symétrie centrale comme propriété (unité 8 du manuel), jamais la preuve de la nature d'un quadrilatère.
 */
import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » — six affirmations de la plateforme qui mesurent UNE الكفاءة clé de chacune des six leçons de l'unité (l'ordre du catalogue : التعليم، المقارنة، المعلم، الجمع، المجموع الجبري، المسافة).
 */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'talim', text: 'على مستقيم تدريجته $5$ ، النقطة الواقعة على التدريجة الرابعة يسار المبدأ فاصلتها $-20$ .', answer: true,
    why: 'كلّ تدريجة تساوي $5$ والنقطة بعد $4$ تدريجات إلى اليسار، فالفاصلة $-(4 \\times 5) = -20$ .' },
  { skill: 'muqarana', text: '$-3{,}5 < -3{,}05$ .', answer: true,
    why: 'العددان سالبان: المسافة إلى الصفر هي $3{,}5$ و $3{,}05$ ، والأكبر مسافة هو الأصغر عددًا. فـ $-3{,}5 < -3{,}05$ .' },
  { skill: 'maalam', text: 'النقطة $(-2\\,;\\,0)$ تقع على محور التراتيب.', answer: false,
    why: 'ترتيبها $0$ ، فهي على محور الفواصل. أمّا النقط التي على محور التراتيب ففاصلتها $0$ .' },
  { skill: 'jam', text: '$(-6)+(+2{,}5)=(-3{,}5)$ .', answer: true,
    why: 'إشارتان مختلفتان: نطرح $2{,}5$ من $6$ فنجد $3{,}5$ ونأخذ إشارة الأبعد عن الصفر، وهو $-6$ .' },
  { skill: 'jabri', text: '$-7+3-5+9=0$ .', answer: true,
    why: 'الموجبة $3+9=12$ والسالبة $-7-5=-12$ ، ومجموعهما $0$ .' },
  { skill: 'masafa', text: 'المسافة بين $A(-3)$ و $B(+4)$ هي $1$ .', answer: false,
    why: 'النقطتان على جهتين من المبدأ: $AB=(+4)-(-3)=4+3=7$ ، فالمسافة $7$ لا $1$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/**
 * La وضعية des modules 7 et 8 — un camp d'hiver à Djelfa. Les données sont dans le texte (le module 8 n'a pas besoin d'autre chose). Les clés vivent dans `FINAL` ;
 * le module 7 n'en montre aucune (la solution est le module 8).
 */
export const SITUATION = {
  source: addition('exam_style_problem'),
  title: 'مخيّم شتوي في الجلفة',
  text: 'خلال مخيّم شتوي في الجلفة سجّل التلاميذ درجات الحرارة بالدرجة المئوية في خمسة أيام. الصغرى: $-3$ ، $-5{,}5$ ، $+1$ ، $-0{,}5$ ، $-2$ . الكبرى: $+6$ ، $+4{,}5$ ، $+9$ ، $+7{,}5$ ، $+5$ . ثم مثّلوا كلّ يوم بنقطة (رقم اليوم ؛ الصغرى) في معلم متعامد ومتجانس.',
  data: [
    { id: 'min', text: 'الصغرى في الأيام الخمسة: ⁦−3⁩ ؛ ⁦−5,5⁩ ؛ ⁦+1⁩ ؛ ⁦−0,5⁩ ؛ ⁦−2⁩', useful: true },
    { id: 'max', text: 'الكبرى في الأيام الخمسة: ⁦+6⁩ ؛ ⁦+4,5⁩ ؛ ⁦+9⁩ ؛ ⁦+7,5⁩ ؛ ⁦+5⁩', useful: true },
    { id: 'days', text: 'الأيام مرقّمة من 1 إلى 5', useful: true },
    { id: 'point', text: 'كلّ يوم نقطة (رقم اليوم ؛ الصغرى) في معلم متعامد ومتجانس', useful: true },
    { id: 'unit', text: 'الدرجات بالدرجة المئوية', useful: true },
    { id: 'camp', text: 'المخيّم في الجلفة في فصل الشتاء', useful: true },
    { id: 'kids', text: 'شارك في المخيّم ثلاثون تلميذًا', useful: false },
    { id: 'bus', text: 'نُقل التلاميذ إلى المخيّم في حافلة', useful: false },
  ],
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'لكلّ يوم قراءتان: صغرى وكبرى، وكلّ قراءة عدد نسبي موجب أو سالب. نريد أن نعرف أيّ ليلة هي الأبرد، وكم يبلغ فارق يوم واحد، وكيف تتغيّر الصغرى من يوم إلى الذي بعده، وماذا يعطي مجموع هذه التغيّرات، وأين تقع نقطة يوم معيّن في المعلم.' },
    { label: 'تحليل التعليمة واختيار إستراتيجية حل مناسبة', text: 'الأبرد تعرفه بترتيب الصغرى تصاعديًا. فارق اليوم الواحد مسافة بين عددين: الأكبر ناقص الأصغر. تغيّر الصغرى هو الجديد ناقص القديم، وإشارته تقول هل ارتفعت أم انخفضت. مجموع التغيّرات مجموع جبري يمكن مراجعته. ونقطة اليوم إحداثياها (رقم اليوم ؛ الصغرى).' },
    { label: 'تنفيذ استراتيجية الحل', text: 'ننجز الطرح بتحويله إلى جمع للمعاكس، ونجمع الموجبة والسالبة، ونراجع الإشارات، ثم نكتب لكلّ سؤال جوابًا واضحًا بوحدته.' },
  ],
};

/** Les contre-vérifications du module 7 (reprises par la carte) avec des nombres GÉNÉRIQUES : aucune valeur de la solution n'y figure. */
export const REMARKS = {
  oldNewWrong: 'نحسب تغيّر درجة من $-4$ إلى $+2$ على أنّه «القديم ناقص الجديد»: $(-4)-(+2)=-6$ .',
  oldNewWhy: 'الدرجة ارتفعت من $-4$ إلى $+2$ ، فالتغيّر يجب أن يكون موجبًا، بينما وجدنا عددًا سالبًا: الحساب معكوس.',
  oldNewRight: 'التغيّر هو الجديد ناقص القديم: $(+2)-(-4)=+6$ ، وهو موجب لأنّ الدرجة ارتفعت.',
  rangeWrong: 'نحسب فارق يوم صغراه $-2$ وكبراه $+3$ على أنّه $3-2=1$ .',
  rangeWhy: 'الدرجتان على جهتين من الصفر: المسافة بينهما تعبر الصفر، فنجمع المسافتين إلى الصفر: $3+2=5$ لا $1$ .',
  rangeRight: 'فارق اليوم مسافة بين عددين: الأكبر ناقص الأصغر، $(+3)-(-2)=5$ .',
  orderWhy: 'الأبرد هو الأصغر عددًا، وبين عددين سالبين الأصغر هو الأبعد عن الصفر: لذلك نرتّب الأعداد النسبية بدل ترتيب مسافاتها.',
  sumCheck: 'مثال للمراجعة بأعداد أخرى: صغرى $-4$ ثمّ $-1$ ثمّ $+2$ تغيّراتها $+3$ و $+3$ ومجموعها $+6$ ، وهو $(+2)-(-4)$ : الأخيرة ناقص الأولى. هذه مراجعة لا قاعدة جديدة.',
  notSolvedHere: 'الحلّ نفسه في «وضعية الاختبار النهائي»: هنا فهمنا الوضعية واختطّينا الاستراتيجية فقط.',
};

/**
 * Les cinq étapes du test (module 8), évaluées. Chaque distracteur est FAUX et porte l'erreur de l'unité qui le produit (vérifié dans content.test.js).
 *   E1 l'ordre croissant des minimales (BDG : les négatifs rangés par distance croissante ; OD : l'ordre décroissant ; une permutation quelconque)
 *   E2 l'écart du jour 2 (SUBDIST : 5,5 − 4,5 ; NEGDIST : −10 ; ORDERSWAP : 4,5 − 5,5)
 *   E3 le changement de la minimale du jour 2 au jour 3 (REVERSED : ancien − nouveau ; SUBNOFLIP : (+1) + (−5,5) ; SUBDIST : 5,5 − 1)
 *   E4 le total des quatre changements (SENS : dernier − premier à l'envers ; ALLNEG : tout négatif ; somme des valeurs absolues)
 *   E5 les coordonnées du point du jour 4 (SWAP ; SIGNAXIS ; SIGNLEFT).
 */
export const FINAL = [
  { id: 'E1', skill: 'order', text: 'المرحلة 1 — رتّب الدرجات الصغرى الخمس ترتيبًا تصاعديًا.',
    options: ['$-5{,}5 < -3 < -2 < -0{,}5 < +1$', '$-0{,}5 < -2 < -3 < -5{,}5 < +1$', '$+1 < -0{,}5 < -2 < -3 < -5{,}5$', '$-2 < -3 < -0{,}5 < -5{,}5 < +1$'], correct: 0,
    explain: 'الأصغر عددًا هو الأبعد عن الصفر بين السالبة: $-5{,}5 < -3 < -2 < -0{,}5$ ثمّ الموجبة $+1$ . الخطأ الأوّل رتّب السالبة بحسب مسافاتها إلى الصفر، والثاني رتّب تنازليًا، والثالث خلط بين الأعداد.' },
  { id: 'E2', skill: 'gap', text: 'المرحلة 2 — ما فارق اليوم 2، أي المسافة بين كبراه وصغراه؟',
    options: ['$4{,}5-(-5{,}5)=10$', '$5{,}5-4{,}5=1$', '$(-5{,}5)-(+4{,}5)=-10$', '$4{,}5-5{,}5=-1$'], correct: 0,
    explain: 'الكبرى $+4{,}5$ والصغرى $-5{,}5$ على جهتين من الصفر: $(+4{,}5)-(-5{,}5)=4{,}5+5{,}5=10$ . الخطأ الأوّل طرح المسافتين إلى الصفر، والثاني طرح الكبرى من الصغرى فوجد مسافة سالبة، والثالث عكس الطرح.' },
  { id: 'E3', skill: 'change', text: 'المرحلة 3 — كيف تغيّرت الصغرى من اليوم 2 إلى اليوم 3؟',
    options: ['$(+1)-(-5{,}5)=+6{,}5$', '$(-5{,}5)-(+1)=-6{,}5$', '$(+1)+(-5{,}5)=-4{,}5$', '$5{,}5-1=+4{,}5$'], correct: 0,
    explain: 'التغيّر هو الجديد ناقص القديم: $(+1)-(-5{,}5)=(+1)+(+5{,}5)=+6{,}5$ ، وهو موجب لأنّ الصغرى ارتفعت. الخطأ الأوّل عكس الطرح، والثاني جمع بدل الطرح، والثالث طرح المسافتين.' },
  { id: 'E4', skill: 'sum', text: 'المرحلة 4 — تغيّرات الصغرى من اليوم 1 إلى اليوم 5 هي $-2{,}5$ ثمّ $+6{,}5$ ثمّ $-1{,}5$ ثمّ $-1{,}5$ . ما مجموعها الجبري؟',
    options: ['$(-2{,}5)+(+6{,}5)+(-1{,}5)+(-1{,}5)=+1$', '$(-2{,}5)+(+6{,}5)+(-1{,}5)+(-1{,}5)=-1$', '$(-2{,}5)+(+6{,}5)+(-1{,}5)+(-1{,}5)=-12$', '$(-2{,}5)+(+6{,}5)+(-1{,}5)+(-1{,}5)=+12$'], correct: 0,
    explain: 'الموجبة $+6{,}5$ والسالبة $-2{,}5-1{,}5-1{,}5=-5{,}5$ ، فالمجموع $6{,}5-5{,}5=+1$ . ونراجع: $(-2)-(-3)=+1$ ، أي الصغرى الأخيرة ناقص الأولى. الأخطاء الثلاثة: المجموع معكوس، وكلّ الحدود سالبة، وكلّ الحدود موجبة.' },
  { id: 'E5', skill: 'point', text: 'المرحلة 5 — ما إحداثيا نقطة اليوم 4، وأين تقع بالنسبة إلى محور الفواصل؟',
    options: ['$(4\\,;\\,-0{,}5)$ ، تحت محور الفواصل', '$(-0{,}5\\,;\\,4)$ ، فوق محور الفواصل', '$(4\\,;\\,0{,}5)$ ، فوق محور الفواصل', '$(-4\\,;\\,-0{,}5)$ ، تحت محور الفواصل'], correct: 0,
    explain: 'النقطة (رقم اليوم ؛ الصغرى) = $(4\\,;\\,-0{,}5)$ : الفاصلة أوّلًا، وترتيبها سالب فهي تحت محور الفواصل. الخطأ الأوّل عكس ترتيب الإحداثيين، والثاني أخطأ في إشارة الترتيب، والثالث أخطأ في إشارة الفاصلة.' },
];
