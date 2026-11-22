/**
 * Les exercices du درس « حساب مجموع جبري » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, mêmes compétences).
 * Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ;
 * `src()` sans numéro, jamais montré à l'élève. Les clés sont des LITTÉRAUX, RE-vérifiés par ./content.test.js avec un évaluateur INDÉPENDANT (BigInt) qui contrôle
 * aussi que chaque distracteur est FAUX. Destinations (docs/sources/2am/unit3/extraction.json) : act-6, ex-29, ex-36, ex-37, deep-39, 43, 44, 46, 58 → module 4 ;
 * self-10, self-11 → le إختبار أولي ; deep-47, 49, 50, 59 → la banque d'exercices.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_majmu-jabri_P1',
  P2: '2am_majmu-jabri_P2',
  P3: '2am_majmu-jabri_P3',
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
  // 1. act-6 (réécrit) : écrire la chaîne en additions seules, puis la calculer
  ex('act-6', S('act-6', 41, 'أنشطة'), LP.P1, 'facile', {
    statement: 'حوّل كلّ طرح إلى جمع للمعاكس ثم احسب.',
    interaction: 'batch',
    question: {
      rows: [
        row('$(-7)-(+3)+(-4)-(-6)$ تُكتب جمعًا فقط', '$(-7)+(-3)+(-4)+(+6)$', ['$(-7)+(+3)+(-4)+(-6)$', '$(+7)+(-3)+(+4)+(+6)$'], 0, 'طرح $(+3)$ هو إضافة $(-3)$ ، وطرح $(-6)$ هو إضافة $(+6)$ ، والعددان المضافان يبقيان كما هما.'),
        row('$(-10)-(+5)-(-8)-(+2)$', '$-9$', ['$-11$', '$+9$'], 1, '$(-10)+(-5)+(+8)+(-2)$ : السالبة $-17$ والموجبة $+8$ ، والناتج $-9$ .'),
        row('$(+7)+(-2)-(-5)+(+4)$', '$+14$', ['$+4$', '$-14$'], 2, '$(+7)+(-2)+(+5)+(+4)$ : الموجبة $+16$ والسالبة $-2$ ، والناتج $+14$ .'),
      ],
      explain: 'كلّ طرح يصير جمعًا لمعاكس العدد، ثم نجمع الموجبة معًا والسالبة معًا.',
    },
    commonError: 'ترك العدد المطروح بإشارته أو قلب إشارة كلّ الأعداد.',
  }),
  // 2. ex-29 : sommes de quatre à six termes
  ex('ex-29', S('ex-29', 48), LP.P2, 'facile', {
    statement: 'احسب كلًّا من المجاميع الآتية بتجميع الحدود الموجبة معًا والسالبة معًا.',
    interaction: 'batch',
    question: {
      rows: [
        row('$(-6)+(+9)+(-3)+(+6)+(-9)$', '$-3$', ['$+3$', '$-33$'], 0, 'الموجبة $9+6=15$ والسالبة $-(6+3+9)=-18$ ، والناتج $-3$ .'),
        row('$(+8)+(-11)+(+5)+(-7)$', '$-5$', ['$+5$', '$-31$'], 1, 'الموجبة $13$ والسالبة $-18$ ، والناتج $-5$ .'),
        row('$(-4)+(+15)+(-6)+(+4)+(+6)+(-8)$', '$+7$', ['$-7$', '$+43$'], 2, 'الموجبة $15+4+6=25$ والسالبة $-(4+6+8)=-18$ ، والناتج $+7$ .'),
      ],
      explain: 'نجمع الحدود الموجبة معًا والسالبة معًا ثم نجمع الناتجين بقاعدة جمع عددين.',
    },
    commonError: 'جمع كلّ المسافات دون مراعاة الإشارات.',
  }),
  // 3. ex-36 : trois sommes algébriques
  ex('ex-36', S('ex-36', 48), LP.P2, 'moyen', {
    statement: 'احسب كلًّا من المجاميع الجبرية الآتية.',
    interaction: 'batch',
    question: {
      rows: [
        row('$A=(+7)+(-4)-(+8)-(-2)+(-6)$', '$-9$', ['$+3$', '$+9$'], 1, '$(+7)+(-4)+(-8)+(+2)+(-6)$ : الموجبة $9$ والسالبة $-18$ ، فـ $A=-9$ .'),
        row('$B=(-11)-(-8)-(-6)+(+4)-(+10)$', '$-3$', ['$-11$', '$+3$'], 2, '$(-11)+(+8)+(+6)+(+4)+(-10)$ : الموجبة $18$ والسالبة $-21$ ، فـ $B=-3$ .'),
        row('$C=(-3)+(-12)-(-5)-(+4)+(+13)$', '$-1$', ['$-3$', '$+1$'], 0, '$(-3)+(-12)+(+5)+(-4)+(+13)$ : الموجبة $18$ والسالبة $-19$ ، فـ $C=-1$ .'),
      ],
      explain: 'نحوّل الطرح إلى جمع المعاكس أوّلًا، ثم نجمّع.',
    },
    commonError: 'نسيان تحويل إشارة العدد المطروح.',
  }),
  // 4. ex-37 : un élève annule à tort
  ex('ex-37', S('ex-37', 48), LP.P1, 'moyen', {
    statement: 'لحساب $(+7)-(+4)+(-4)+(-10)$ كتب تلميذ: «$(+4)+(-4)=0$ ، إذن الناتج $(+7)+(-10)=(-3)$».',
    interaction: 'choice',
    question: {
      prompt: 'أين الخطأ؟',
      options: ['المطروح هو $(+4)$ أي أنّ الحدّ هو $(-4)$ ، فليس لدينا $(+4)$ بل $(-4)$ مرّتين، والناتج $-11$', 'الخطأ في جمع $(+7)+(-10)$ ، وناتجه $+3$', 'لا خطأ: الناتج $-3$ صحيح'], correct: 0, cols: 1,
      explain: 'طرح $(+4)$ يعني إضافة $(-4)$ ، فالمجموع $(+7)+(-4)+(-4)+(-10)=7-18=-11$ .',
    },
    commonError: 'الظنّ أنّ العدد بعد إشارة − بقي موجبًا فيُحذف مع معاكسه.',
  }),
  // 5. deep-39 : simplifier l'écriture puis calculer
  ex('deep-39', S('deep-39', 50, 'أتعمّق'), LP.P3, 'moyen', {
    statement: 'اختر الكتابة المبسّطة الصحيحة (بحذف إشارة الجمع والأقواس) ثم قيمتها.',
    interaction: 'batch',
    question: {
      rows: [
        row('$(-5)+(+12)+(-3)+(-7)$', '$-5+12-3-7=-3$', ['$-5-12-3-7=-27$', '$-5+12-3+7=11$'], 0, 'نحذف إشارة الجمع والأقواس ولا نغيّر الإشارات: $-5+12-3-7$ ، والموجبة $12$ والسالبة $-15$ فالناتج $-3$ .'),
        row('$(+8)+(-2)-(+8)-(-9)$', '$8-2-8+9=7$', ['$8-2-8-9=-11$', '$8+2-8+9=11$'], 1, 'الحدّ $-(+8)$ يبقى $-8$ ، والحدّ $-(-9)$ يصير $+9$ : $8-2-8+9=7$ .'),
      ],
      explain: 'نحذف إشارة الجمع وأقواس الأعداد، ونحافظ على إشارة كلّ عدد.',
    },
    commonError: 'حذف إشارة الطرح مع الأقواس.',
  }),
  // 6. deep-43 : placer les signes
  ex('deep-43', S('deep-43', 50, 'أتعمّق'), LP.P1, 'difficile', {
    statement: 'نضع بين الأعداد الأربعة إشارة + أو − لنحصل على $(+4)\\ \\ldots\\ (-6)\\ \\ldots\\ (+3)\\ \\ldots\\ (-2)=(+5)$ .',
    interaction: 'choice',
    question: {
      prompt: 'أيّ الإشارات الثلاث، بالترتيب، تعطي $(+5)$ ؟',
      options: ['$-$ ثم $-$ ثم $+$', '$+$ ثم $-$ ثم $+$', '$-$ ثم $+$ ثم $-$'], correct: 0, cols: 1,
      explain: '$(+4)-(-6)-(+3)+(-2)=4+6-3-2=5$ .',
    },
    commonError: 'تجريب الإشارات دون تحويل الطرح إلى جمع.',
  }),
  // 7. deep-44 : une suite d'écarts de 1
  ex('deep-44', S('deep-44', 50, 'أتعمّق'), LP.P2, 'difficile', {
    statement: 'نحسب $50-49+48-47+\\cdots+2-1$ .',
    interaction: 'choice',
    question: {
      prompt: 'ما قيمة هذا المجموع؟',
      options: ['$25$ : خمس وعشرون زوجًا كلّ زوج يساوي $1$', '$50$ : لأنّ الحدّ الأوّل $50$', '$26$ : لأنّ الأزواج ستّة وعشرون'], correct: 0, cols: 1,
      explain: 'نجمّع الحدود اثنين اثنين: $(50-49)+(48-47)+\\cdots+(2-1)$ وكلّ زوج يساوي $1$ ، وعددها $25$ .',
    },
    commonError: 'حساب الحدود واحدًا واحدًا دون أن نرى الأزواج.',
  }),
  // 8. deep-46 : la plus grande valeur
  ex('deep-46', S('deep-46', 50, 'أتعمّق'), LP.P1, 'difficile', {
    statement: 'نستعمل الأعداد $(-6{,}4)$ و $(-5)$ و $(+2{,}7)$ و $(+12)$ مرّة واحدة لكلّ منها، وقبل كلّ عدد إشارة + أو −.',
    interaction: 'choice',
    question: {
      prompt: 'أيّ العبارات الآتية هي الأكبر قيمة؟',
      options: ['$(+12)+(+2{,}7)-(-6{,}4)-(-5)$', '$(+12)+(+2{,}7)+(-6{,}4)+(-5)$', '$(+12)-(+2{,}7)-(-6{,}4)-(-5)$'], correct: 0, cols: 1,
      explain: 'لنكبّر المجموع نجعل كلّ حدّ موجبًا: طرح العدد السالب يضيف معاكسه الموجب، فنحصل على $12+2{,}7+6{,}4+5=26{,}1$ .',
    },
    commonError: 'الظنّ أنّ الأعداد السالبة تُكتب دائمًا بإشارة +.',
  }),
  // 9. deep-58 : un carré magique de somme nulle
  ex('deep-58', S('deep-58', 51, 'أتعمّق'), LP.P2, 'difficile', {
    statement: 'في مربّع $3\\times 3$ بالأعداد من $-4$ إلى $4$ مجموع كلّ سطر وكلّ عمود وكلّ قطر $0$ . السطر الأوّل: $3$ ، $-4$ ، ؟ ؛ والثاني: $-2$ ، $0$ ، $2$ ؛ والثالث: $-1$ ، $4$ ، ؟',
    interaction: 'batch',
    question: {
      rows: [
        row('الخانة الناقصة في السطر الأوّل', '$+1$', ['$-1$', '$+7$'], 0, '$3+(-4)+x=0$ ، فـ $x=+1$ .'),
        row('الخانة الناقصة في السطر الثالث', '$-3$', ['$+3$', '$-5$'], 1, '$(-1)+4+x=0$ ، فـ $x=-3$ .'),
        row('الخانة الثالثة من العمود الأخير ($+1$ ، $+2$ ، ؟)', '$-3$', ['$+3$', '$-1$'], 2, '$1+2+x=0$ ، فـ $x=-3$ ، وهذا يوافق السطر الثالث.'),
      ],
      explain: 'نجمع الحدود المعروفة ثم نبحث عن العدد الذي يجعل المجموع صفرًا.',
    },
    commonError: 'اختيار عدد يجمع بدل أن يعاكس مجموع الحدّين.',
  }),
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: null, prompt: '$(-8)-(-3)+(+5)$ :', options: ['0', '-6', '-10', '6'], correct: 0, kind: 'chain', chain: '(-8)-(-3)+(+5)' },
  { id: 'E2', source: src('self-10', 49, 'أؤكّد تعلّماتي'), prompt: 'الكتابة المبسّطة لـ $(-4)-(+7)+(+2)-(-1)$ :', options: ['-4-7+2+1', '-4+7+2-1', '4-7+2+1', '-4-7+2-1'], correct: 0, kind: 'simplify', chain: '(-4)-(+7)+(+2)-(-1)' },
  { id: 'E3', source: null, prompt: '$(+15)-[(-6)+(+4)]$ :', options: ['17', '13', '-17', '25'], correct: 0, kind: 'chain', chain: '(+15)-[(-6)+(+4)]' },
  { id: 'E4', source: src('self-11', 49, 'أؤكّد تعلّماتي'), prompt: '$-9+4-6+11$ :', options: ['0', '-30', '30', '-8'], correct: 0, kind: 'chain', chain: '-9+4-6+11' },
  { id: 'E5', source: null, prompt: 'العبارة التي تساوي $(-7)-(-2)$ :', options: ['(-7)+(+2)', '(+7)+(-2)', '(-7)+(-2)', '(-7)-(+2)'], correct: 0, kind: 'equivalent', chain: '(-7)-(-2)' },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
