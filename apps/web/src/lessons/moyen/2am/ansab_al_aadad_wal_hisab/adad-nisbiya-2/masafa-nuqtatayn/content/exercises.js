/**
 * Les exercices du درس « المسافة بين نقطتين على مستقيم مدرّج » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, mêmes compétences). Chaque exercice porte en `source`
 * l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève.
 * Les clés sont des LITTÉRAUX, RE-vérifiés par ./content.test.js avec un code indépendant (BigInt).
 * Destinations (docs/sources/2am/unit3/extraction.json) : act-5, ex-35, ict-1, deep-40, deep-41, deep-42 → module 4 ; self-9 → le إختبار أولي.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_masafa-nuqtatayn_P1',
  P2: '2am_masafa-nuqtatayn_P2',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const ex = (id, source, learningPointId, difficulty, extra) => ({ id, source, learningPointId, difficulty, ...extra });
/** Une ligne à choix : la bonne réponse à la position `at` parmi les autres. */
const row = (label, right, wrongs, at, correction) => {
  const options = [...wrongs];
  options.splice(at % (wrongs.length + 1), 0, right);
  return { label, options, correct: at % (wrongs.length + 1), correction };
};

export const EXERCISES = [
  // 1. act-5 (réécrit) : trois distances puis AC = AB + BC
  ex('act-5', S('act-5', 41, 'أنشطة'), LP.P1, 'facile', {
    statement: 'على مستقيم مدرّج النقط $A(+4)$ و $B(-2)$ و $C(-7)$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('المسافة $AB$', '$6$', ['$2$', '$-6$'], 0, 'الفاصلة الكبرى $+4$ : $(+4)-(-2)=(+4)+(+2)=6$ .'),
        row('المسافة $AC$', '$11$', ['$3$', '$-11$'], 1, '$(+4)-(-7)=(+4)+(+7)=11$ .'),
        row('المسافة $BC$', '$5$', ['$9$', '$-5$'], 2, 'الفاصلة الكبرى $-2$ : $(-2)-(-7)=(-2)+(+7)=5$ .'),
        row('هل $AC=AB+BC$ ؟', 'نعم، لأنّ $B$ بين $A$ و $C$', ['لا، $AC$ أكبر من مجموعهما', 'لا، $AC$ أصغر من مجموعهما'], 0, '$6+5=11$ : النقطة $B$ تقع بين $A$ و $C$ فتتجمّع المسافتان.'),
      ],
      explain: 'المسافة هي الفاصلة الكبرى ناقص الصغرى: عدد موجب دائمًا.',
    },
    commonError: 'طرح الفاصلة الكبرى من الصغرى فنجد مسافة سالبة.',
  }),
  // 2. ex-35 : six distances
  ex('ex-35', S('ex-35', 48), LP.P1, 'moyen', {
    statement: 'احسب المسافتين $AB$ و $CD$ في كلّ حالة: أ) $A(-1{,}8)$ ، $B(+0{,}7)$ ، $C(-0{,}3)$ ، $D(+1{,}2)$ ؛ ب) $A(-6)$ ، $B(-13)$ ، $C(+2{,}5)$ ، $D(-9)$ ؛ ج) $A(-120)$ ، $B(+80)$ ، $C(+150)$ ، $D(-17{,}5)$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('أ) $AB$', '$2{,}5$', ['$1{,}1$', '$-2{,}5$'], 0, '$(+0{,}7)-(-1{,}8)=(+0{,}7)+(+1{,}8)=2{,}5$ .'),
        row('أ) $CD$', '$1{,}5$', ['$0{,}9$', '$-1{,}5$'], 1, '$(+1{,}2)-(-0{,}3)=1{,}5$ .'),
        row('ب) $AB$', '$7$', ['$19$', '$-7$'], 2, 'الفاصلة الكبرى $-6$ : $(-6)-(-13)=(-6)+(+13)=7$ .'),
        row('ب) $CD$', '$11{,}5$', ['$6{,}5$', '$-11{,}5$'], 0, '$(+2{,}5)-(-9)=(+2{,}5)+(+9)=11{,}5$ .'),
        row('ج) $AB$', '$200$', ['$40$', '$-200$'], 1, '$(+80)-(-120)=(+80)+(+120)=200$ .'),
        row('ج) $CD$', '$167{,}5$', ['$132{,}5$', '$-167{,}5$'], 2, '$(+150)-(-17{,}5)=(+150)+(+17{,}5)=167{,}5$ .'),
      ],
      explain: 'في كلّ حالة: الفاصلة الكبرى ناقص الفاصلة الصغرى.',
    },
    commonError: 'طرح مسافتي النقطتين إلى الصفر حتى حين تكونان على جانبي الصفر.',
  }),
  // 3. ict-1 (adapté, sans logiciel) : d'autres positions avec AB = 7
  ex('ict-1', S('ict-1', 53, 'أنشطة'), LP.P2, 'moyen', {
    statement: 'نبحث عن أزواج نقط $(A\\,;B)$ على مستقيم مدرّج بحيث $AB=7$ ، ثم نحسب مسافة جديدة.',
    interaction: 'batch',
    question: {
      rows: [
        row('زوج يحقّق $AB=7$', '$A(-5)$ و $B(2)$', ['$A(-5)$ و $B(7)$', '$A(-5)$ و $B(-2)$'], 0, '$(+2)-(-5)=7$ ؛ أمّا الزوجان الآخران فمسافتاهما $12$ و $3$ .'),
        row('زوج آخر يحقّق $AB=7$', '$A(0)$ و $B(7)$', ['$A(0)$ و $B(14)$', '$A(0)$ و $B(-3)$'], 1, 'المسافة بين $0$ و $7$ هي $7$ .'),
        row('زوج ثالث يحقّق $AB=7$', '$A(-10)$ و $B(-3)$', ['$A(-10)$ و $B(3)$', '$A(-10)$ و $B(-7)$'], 2, '$(-3)-(-10)=7$ ؛ أمّا الآخران فمسافتاهما $13$ و $3$ .'),
        row('المسافة بين $A(-36{,}5)$ و $B(-29{,}5)$', '$7$', ['$66$', '$-7$'], 0, 'الفاصلة الكبرى $-29{,}5$ : $(-29{,}5)-(-36{,}5)=7$ ؛ فنفس المسافة $7$ تتكرّر مهما انتقلنا بالنقطتين معًا.'),
      ],
      explain: 'إذا انتقلت النقطتان معًا بالمقدار نفسه بقيت المسافة بينهما كما هي.',
    },
    commonError: 'الظنّ أنّ المسافة تتغيّر إذا انتقلت النقطتان معًا.',
  }),
  // 4. deep-40 : milieux (application — la moitié de la distance)
  ex('deep-40', S('deep-40', 50, 'أعمّق'), LP.P2, 'difficile', {
    statement: 'عيّن فاصلة منتصف $[AB]$ في كلّ حالة: $A(-24)$ و $B(+10)$ ؛ $A(-61)$ و $B(-29)$ ؛ $A(-4{,}6)$ و $B(+1{,}8)$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('$A(-24)$ و $B(+10)$', '$-7$', ['$17$', '$-14$'], 0, '$AB=34$ ونصفها $17$ : $-24+17=-7$ .'),
        row('$A(-61)$ و $B(-29)$', '$-45$', ['$16$', '$-90$'], 1, '$AB=32$ ونصفها $16$ : $-61+16=-45$ .'),
        row('$A(-4{,}6)$ و $B(+1{,}8)$', '$-1{,}4$', ['$3{,}2$', '$-2{,}8$'], 2, '$AB=6{,}4$ ونصفها $3{,}2$ : $-4{,}6+3{,}2=-1{,}4$ .'),
      ],
      explain: 'المنتصف يبعد عن كلّ طرف نصف المسافة: فاصلته الصغرى زائد نصف $AB$ .',
    },
    commonError: 'الظنّ أنّ فاصلة المنتصف هي نصف المسافة، أو مجموع الفاصلتين دون قسمة.',
  }),
  // 5. deep-41 : deux points à distance donnée
  ex('deep-41', S('deep-41', 50, 'أعمّق'), LP.P2, 'moyen', {
    statement: 'النقطة $M(+1{,}5)$ على مستقيم مدرّج والنقطة $N$ تحقّق $MN=4$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('فاصلة $N$ الممكنة', '$+5{,}5$ أو $-2{,}5$', ['$+5{,}5$ فقط', '$-5{,}5$ أو $+2{,}5$'], 1, '$1{,}5+4=5{,}5$ و $1{,}5-4=-2{,}5$ .'),
        row('عدد النقط $N$ الممكنة', 'نقطتان', ['نقطة واحدة', 'أربع نقط'], 2, 'نقطة من كلّ جهة من $M$ .'),
      ],
      explain: 'نضيف المسافة إلى الفاصلة ونطرحها منها: نقطتان.',
    },
    commonError: 'الاكتفاء بنقطة واحدة.',
  }),
  // 6. deep-42 : deux configurations
  ex('deep-42', S('deep-42', 50, 'أعمّق'), LP.P2, 'difficile', {
    statement: 'على مستقيم مدرّج $A(-1{,}5)$ ، و $AB=1{,}2$ ، و $AC=4$ ، و $BC=2{,}8$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('إذا كانت $B(-0{,}3)$ فإنّ $C$ هي', '$+2{,}5$', ['$-5{,}5$', '$+4$'], 0, '$C$ على بعد $4$ من $A$ : $+2{,}5$ أو $-5{,}5$ ؛ ومع $B(-0{,}3)$ لا تبعد $-5{,}5$ عن $B$ بـ $2{,}8$ بل بـ $5{,}2$ .'),
        row('إذا كانت $B(-2{,}7)$ فإنّ $C$ هي', '$-5{,}5$', ['$+2{,}5$', '$-4$'], 1, 'المسافة بين $-2{,}7$ و $-5{,}5$ هي $2{,}8$ ؛ أمّا $+2{,}5$ فتبعد عنها $5{,}2$ .'),
      ],
      explain: 'يوجد وضعان: $B$ و $C$ في الجهة نفسها من $A$ أو في جهتين مختلفتين.',
    },
    commonError: 'الاكتفاء بوضع واحد للنقطتين.',
  }),
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: src('self-9', 49, 'أؤكّد تعلّماتي'), prompt: 'النقطتان $A(-4)$ و $B(+9)$ . المسافة $AB$ :', options: ['$13$', '$5$', '$-13$', '$9$'], correct: 0, kind: 'gap', truth: { a: '-4', b: '9' } },
  { id: 'E2', source: null, prompt: 'النقطتان $C(-7)$ و $D(-2)$ . المسافة $CD$ :', options: ['$5$', '$9$', '$-5$', '$-9$'], correct: 0, kind: 'gap', truth: { a: '-7', b: '-2' } },
  { id: 'E3', source: null, prompt: 'النقطتان $E(+2{,}5)$ و $F(+11)$ . المسافة $EF$ :', options: ['$8{,}5$', '$13{,}5$', '$-8{,}5$', '$9$'], correct: 0, kind: 'gap', truth: { a: '2.5', b: '11' } },
  { id: 'E4', source: null, prompt: 'فاصلتا النقطتين اللتين تبعدان $3$ عن $M(-1)$ :', options: ['$-4$ و $+2$', '$+2$ فقط', '$-4$ فقط', '$-2$ و $+4$'], correct: 0, kind: 'points', truth: { a: '-1', d: '3' } },
  { id: 'E5', source: null, prompt: 'فاصلة منتصف $[AB]$ حيث $A(-6)$ و $B(+2)$ :', options: ['$-2$', '$4$', '$-4$', '$0$'], correct: 0, kind: 'mid', truth: { a: '-6', b: '2' } },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
