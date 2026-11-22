import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « جداء عدة أعداد نسبية » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف et
 * طرائق réécrits). Le produit de deux relatifs (la leçon précédente), l'addition, la parité d'un entier et le معاكس d'un point ne sont PAS des items
 * ici : ce sont des prérequis (`priorKnowledge`), mesurés par « أستعدّ ».
 */
const { opposite, parity, square, roles, distribute } = KNOWLEDGE;
const P = (s) => <p><MathText>{s}</MathText></p>;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'maakus', type: 'vocabulaire', title: 'الضرب في −1 ومعاكس عدد', predict: false,
        memo: {
          rule: `(-1)\\times a=${R('-a')}`,
          hook: 'المعاكس: البُعد نفسه، الجهة الأخرى',
          example: `(-1)\\times 5=${R('-5')}`,
          trap: 'المعاكس ليس المقلوب: المقلوب جداؤه مع العدد واحد',
          exam: 'المعاكس هو العدد الذي مجموعه مع العدد صفر',
          chip: `(-1)a=${R('-a')}`,
          quiz: [
            { q: '$(-1)\\times(-7)$ يساوي:', options: ['$7$', '$-7$', '$-\\frac{1}{7}$'], correct: 0 },
            { q: 'معاكس $5$ هو:', options: ['$-5$', '$\\frac{1}{5}$', '$-\\frac{1}{5}$'], correct: 0 },
          ],
        },
        summary: 'جداء عدد في −1 هو معاكسه (نظيره) : (−1) × a = −a ، وقد يكون −a موجبًا أو سالبًا.',
        body: <div className="space-y-2">{opposite.lines.map((t) => <React.Fragment key={t}>{P(t)}</React.Fragment>)}<p className="text-sm text-slate-600"><MathText>{opposite.examples}</MathText></p></div>,
      },
      {
        id: 'adad-salib', type: 'regles', title: 'إشارة جداء عدة أعداد',
        memo: {
          rule: `(-)(-)(-)=${R('-')}`,
          hook: 'عُدّ السالبة: فرديّ ← سالب',
          example: `(-2)\\times(-3)\\times 4=${R('+24')}`,
          trap: 'سالب واحد لا يكفي: سالبان يعطيان موجبًا',
          exam: 'عُدّ العوامل السالبة قبل أن تحسب، والترتيب لا يهمّ',
          chip: `(-)(-)=${R('+')}`,
          quiz: [
            { q: 'إشارة $(-1)\\times 2\\times(-3)\\times(-4)$ :', options: ['سالبة', 'موجبة', 'لا يمكن معرفتها'], correct: 0 },
            { q: 'إشارة $(-5)\\times(-2)\\times 7$ :', options: ['موجبة', 'سالبة', 'معدومة'], correct: 0 },
          ],
        },
        predictPrompt: 'في سجلّ الروبوت لاحظتَ برامج توقّف فيها في الجهة السالبة. ماذا تشترك فيه هذه البرامج؟ اكتب القاعدة بكلماتك.',
        summary: 'جداء عدة أعداد غير معدومة سالب إذا كان عدد عوامله السالبة فرديًا، وموجب إذا كان زوجيًا، ولا يتغيّر بتغيير ترتيب العوامل.',
        body: (
          <div className="space-y-2">
            {parity.lines.map((t) => <React.Fragment key={t}>{P(t)}</React.Fragment>)}
            <p className="text-sm text-slate-600"><MathText>{parity.examples}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'murabba', type: 'regles', title: 'مربّع عدد نسبي',
        memo: {
          rule: `(-a)^2=a^2\\ ${R('\\geq 0')}`,
          hook: 'لا مربّع سالب',
          example: `(-3)^2=(-3)\\times(-3)=${R('9')}`,
          trap: 'مربّع العدد السالب موجب، لا سالب',
          exam: 'اكتب المربّع جداءً ثم عيّن إشارته',
          chip: `a^2${R('\\geq 0')}`,
          quiz: [
            { q: '$(-4)^2$ يساوي:', options: ['$16$', '$-16$', '$-8$'], correct: 0 },
            { q: 'هل يوجد عدد نسبي مربّعه $-9$ ؟', options: ['لا', 'نعم: $-3$', 'نعم: $3$'], correct: 0 },
          ],
        },
        predictPrompt: 'وضعتَ البطاقة نفسها مرّتين في برنامج الروبوت. هل وجدتَ عددًا يوقف الروبوت في الجهة السالبة؟ علّل في جملة.',
        summary: 'مربّع عدد نسبي a² = a × a لا يكون سالبًا، و (−a)² = a² .',
        body: P(square.text),
      },
      {
        id: 'adwar', type: 'vocabulaire', title: 'أدوار الإشارة −', predict: false,
        memo: {
          rule: `17${R('-')}9,\\quad ${R('-')}8,\\quad ${R('-')}b`,
          hook: 'طرح، سالب، معاكس',
          example: `a=-6\\Rightarrow ${R('-a')}=6`,
          trap: 'معاكس عدد سالب موجب: لا تحكم على الإشارة من الرمز',
          exam: 'قبل الحساب، سمِّ دور كلّ إشارة −',
          chip: `${R('-')}b`,
          quiz: [
            { q: 'إذا كان $a=-6$ فإنّ $-a$ :', options: ['$6$', '$-6$', '$0$'], correct: 0 },
            { q: 'دور الإشارة في $17-9$ :', options: ['علامة طرح', 'إشارة عدد سالب', 'معاكس عدد'], correct: 0 },
          ],
        },
        summary: 'للإشارة − ثلاثة أدوار: علامة طرح (17 − 9) ، وإشارة عدد سالب (−8) ، ومعاكس عدد (−b).',
        body: P(roles.text),
      },
    ],
    3: [
      {
        id: 'tariqat-iddat', type: 'methodes', title: 'أحسب جداء عدة أعداد',
        memo: {
          rule: `P=${R('\\pm')}\\,|a|\\times|b|\\times|c|`,
          hook: 'الإشارة بالعدّ، ثم المسافات',
          example: `(-4)\\times 0{,}07\\times(-25)=${R('+')}7`,
          trap: 'عامل معدوم واحد يجعل الجداء صفرًا',
          exam: 'رتّب العوامل لتسهيل الحساب: اجمع ما يعطي مئة',
          chip: `${R('\\pm')}\\,|a||b||c|`,
          quiz: [
            { q: '$(-2)\\times(-5)\\times(-3)$ :', options: ['$-30$', '$30$', '$-10$'], correct: 0 },
            { q: '$(-1)\\times 5\\times(-2)\\times 0$ :', options: ['$0$', '$10$', '$-10$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ $A = 2 \\times (-5) \\times (-1{,}5) \\times (-4)$ . ما الخطوات التي اتبعتها بالترتيب؟ اكتبها.',
        summary: 'نعدّ العوامل السالبة لنعيّن الإشارة، ثم نضرب المسافات إلى الصفر، ونغيّر ترتيب العوامل لتسهيل الحساب؛ وإذا وُجد عامل معدوم فالجداء معدوم.',
        body: (
          <div className="space-y-2">
            {P(METHOD.steps.rule)}
            <p className="text-sm text-slate-600"><MathText>{METHOD.reorder.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{METHOD.special.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'tawzi-aadad', type: 'methodes', title: 'توزيع الضرب في الاتجاهين',
        memo: {
          rule: `ka+kb=k(${R('a+b')})`,
          hook: 'أخرج العامل المشترك',
          example: `(-3{,}2)${R('(7+3)')}=-32`,
          trap: 'لا تنسَ إشارة العامل المشترك عند إخراجه',
          exam: 'ابحث عن عامل مشترك أو انشر لتحسب ذهنيًا',
          chip: `k(${R('a+b')})`,
          quiz: [
            { q: '$(-5)\\times 8+(-5)\\times 2$ :', options: ['$-50$', '$50$', '$-42$'], correct: 0 },
            { q: '$(-25)\\times(4-0{,}4)$ :', options: ['$-90$', '$-100{,}4$', '$90$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ $(-3{,}2) \\times 7 + (-3{,}2) \\times 3$ ذهنيًا. ماذا فعلتَ بالعامل $-3{,}2$ ؟',
        summary: 'k × a + k × b = k × (a + b) و k × (a − b) = k × a − k × b على الأعداد : نخرج العامل المشترك أو ننشر الجداء لنحسب ذهنيًا.',
        body: P(distribute.text),
      },
    ],
  },
};
