import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « جداء عددين نسبيين » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف et
 * طرائق réécrits). L'addition et la soustraction de relatifs, la distributivité et la distance à zéro ne sont PAS des items ici : ce
 * sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ », rappelés en معارف.
 */
const { repeated, signRule, justify, table, distance } = KNOWLEDGE;
const L = (s) => <p className="text-center" dir="ltr"><MathText>{s}</MathText></p>;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jidaa-jamaa', type: 'vocabulaire', title: 'جداء عدد سالب في عدد موجب', predict: false,
        memo: {
          rule: `(-a)\\times n=${R('-')}(a\\times n)`,
          hook: 'جمع متكرّر لحدّ سالب',
          example: `(-2)\\times 3=${R('-6')}`,
          trap: 'لا تنسَ الإشارة: جمع حدود سالبة يعطي عددًا سالبًا',
          exam: 'اكتبه جمعًا متكرّرًا، ثم جداءً',
          chip: `(-a)\\times n=${R('-')}an`,
          quiz: [
            { q: 'قيمة $(-4)\\times 3$ :', options: ['$-12$', '$12$', '$-1$'], correct: 0 },
            { q: '$(-5)+(-5)+(-5)$ يساوي:', options: ['$(-5)\\times 3$', '$(-5)+3$', '$5\\times 3$'], correct: 0 },
          ],
        },
        summary: 'ضرب عدد سالب في عدد طبيعي هو جمع متكرر: (−2) × 3 = (−2) + (−2) + (−2) = −6 ، فالجداء سالب.',
        body: <p><MathText>{repeated.text}</MathText></p>,
      },
      {
        id: 'ishara-jidaa', type: 'regles', title: 'قاعدة الإشارات',
        memo: {
          rule: `(-)(-)=${R('+')},\\ \\ (-)(+)=${R('-')}`,
          hook: 'نفس الإشارة: موجب',
          example: `(-2)\\times(-2)=${R('4')}`,
          trap: 'جداء سالبين موجب، لا سالب',
          exam: 'عيّن إشارة الجداء أوّلًا، ثم اضرب المسافتين',
          chip: `(-)(-)=${R('+')}`,
          quiz: [
            { q: 'إشارة $(-7)\\times(-3)$ :', options: ['موجبة', 'سالبة', 'لا يمكن معرفتها'], correct: 0 },
            { q: '$(-6)\\times 2$ يساوي:', options: ['$-12$', '$12$', '$-4$'], correct: 0 },
          ],
        },
        predictPrompt: 'في سجلّ الكاميرا لاحظتَ سطورًا يكون فيها الطابق موجبًا وأخرى سالبًا. متى يكون جداء عددين نسبيين موجبًا؟ ومتى يكون سالبًا؟ اكتب القاعدة بكلماتك.',
        summary: 'جداء عددين نسبيين لهما الإشارة نفسها موجب، وجداء عددين نسبيين لهما إشارتان مختلفتان سالب.',
        body: (
          <div className="space-y-2">
            {signRule.lines.map((t) => <p key={t}><MathText>{t}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{signRule.examples}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tabrir-tawzi', type: 'regles', title: 'لماذا جداء سالبين موجب؟',
        memo: {
          rule: `a\\times b+a\\times(-b)=${R('0')}`,
          hook: 'المعاكس يُكمل إلى الصفر',
          example: `-12+${R('(-3)\\times(-4)')}=0`,
          trap: 'لو كان جداء السالبين سالبًا لما صار المجموع صفرًا',
          exam: 'برّر بالتوزيع: مجموع الجداءين يساوي صفرًا',
          chip: `ab+a(-b)=${R('0')}`,
          quiz: [
            { q: '$(-3)\\times 4+(-3)\\times(-4)$ يساوي:', options: ['$0$', '$-24$', '$24$'], correct: 0 },
            { q: 'بما أنّ $(-3)\\times 4=-12$ ، فإنّ $(-3)\\times(-4)$ :', options: ['$12$', '$-12$', '$-7$'], correct: 0 },
          ],
        },
        predictPrompt: 'أكملتَ $(-3) \\times 4 + (-3) \\times (-4) = (-3) \\times 0 = 0$ . ماذا تستنتج عن $(-3) \\times (-4)$ ؟ اشرح في جملة.',
        summary: 'لأنّ k × b + k × (−b) = k × 0 = 0 : العدد الذي يُضاف إلى k × b ليعطي 0 هو k × (−b) ، فإذا كان k × b = −12 كان k × (−b) = 12.',
        body: <p><MathText>{justify.text}</MathText></p>,
      },
      {
        id: 'jadwal-munakhafid', type: 'regles', title: 'جدول جداءات ينقص عاملها الثاني',
        memo: {
          rule: `a\\times(b-1)=a\\times b${R('-a')}`,
          hook: 'الخطوة نفسها بعد الصفر',
          example: `(-4)\\times(-1)=0${R('+4')}=4`,
          trap: 'الجداء لا يرجع إلى الوراء بعد الصفر',
          exam: 'أكمل الجدول بالخطوة نفسها لتتحقّق من الإشارة',
          chip: `a(b-1)=ab${R('-a')}`,
          quiz: [
            { q: '$(-2)\\times 1=-2$ ، $(-2)\\times 0=0$ ، ثم $(-2)\\times(-1)$ :', options: ['$2$', '$-2$', '$-4$'], correct: 0 },
            { q: 'في جدول $(-5)$ ، كلّما نقص العامل الثاني بـ 1 فإنّ الجداء:', options: ['يزيد بـ 5', 'ينقص بـ 5', 'يزيد بـ 1'], correct: 0 },
          ],
        },
        predictPrompt: 'في الجدول $(-4) \\times 3 = -12$ ثم $-8$ ثم $-4$ ثم $0$ . ماذا تتوقع أن يكون $(-4) \\times (-1)$ ؟ ولماذا؟',
        summary: 'كلّما نقص العامل الثاني بـ 1 زاد الجداء بـ 4 : (−4) × (−1) = 4 ثم (−4) × (−2) = 8.',
        body: (
          <div className="space-y-1">
            {table.rows.map((r) => <React.Fragment key={r}>{L(`$${r}$`)}</React.Fragment>)}
            <p className="text-sm text-slate-600"><MathText>{table.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-jidaa', type: 'methodes', title: 'أحسب جداء عددين نسبيين',
        memo: {
          rule: `a\\times b=${R('\\pm')}\\,(|a|\\times|b|)`,
          hook: 'الإشارة أوّلًا، ثم المسافتان',
          example: `(-1{,}5)\\times(-8)=${R('+')}12`,
          trap: 'لا تضرب قبل أن تعيّن الإشارة',
          exam: 'اكتب الإشارة، ثم جداء المسافتين إلى الصفر',
          chip: `${R('\\pm')}|a||b|`,
          quiz: [
            { q: '$(-6)\\times 7$ :', options: ['$-42$', '$42$', '$1$'], correct: 0 },
            { q: '$(-1{,}5)\\times(-8)$ :', options: ['$12$', '$-12$', '$-9{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ $(-6) \\times 7$ و $(-1{,}5) \\times (-8)$ . ما الخطوتان اللتان اتبعتهما بالترتيب؟ اكتبهما.',
        summary: 'نعيّن إشارة الجداء أوّلًا بقاعدة الإشارات، ثم نضرب المسافتين إلى الصفر.',
        body: (
          <div className="space-y-2">
            <p><MathText>{distance.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD.decimal}</MathText></p>
          </div>
        ),
      },
      {
        id: 'jidaa-sifr', type: 'regles', title: 'جداء عدد في الصفر',
        memo: {
          rule: `a\\times 0=0\\times a=${R('0')}`,
          hook: 'الصفر يُعدم الجداء',
          example: `(-7{,}3)\\times 0=${R('0')}`,
          trap: 'الضرب في الصفر لا يُبقي العدد كما هو',
          exam: 'إذا كان أحد العاملين صفرًا فالجداء صفر',
          chip: `a\\times 0=${R('0')}`,
          quiz: [
            { q: '$(-9)\\times 0$ :', options: ['$0$', '$-9$', '$9$'], correct: 0 },
            { q: '$0\\times(-4)$ :', options: ['$0$', '$-4$', '$4$'], correct: 0 },
          ],
        },
        predictPrompt: 'مصعد سرعته 0 لا يتحرك أبدًا. ماذا يساوي $a \\times 0$ لأيّ عدد $a$ ؟',
        summary: 'من أجل كل عدد نسبي a : a × 0 = 0 و 0 × a = 0.',
        body: (
          <div className="space-y-2">
            <p><MathText>{distance.zero}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.zero}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
