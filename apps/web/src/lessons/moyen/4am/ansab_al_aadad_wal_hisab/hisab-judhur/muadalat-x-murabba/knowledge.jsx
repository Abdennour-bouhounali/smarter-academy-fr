import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** `R(x)` : ce qui CHANGE dans la règle d'une fiche `memo`, en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس 3 (unité 2) — SOURCE UNIQUE, construite à partir
 * du manuel (content/textbook.js). Une <KnowledgeBrick id="…"> et la carte
 * rendent le même objet. Le `summary` est du TEXTE BRUT (la brique et la carte
 * le rendent sans MathText) : pas de `$…$` ici.
 *
 *   محور 1  murabba-mutaakisayn — la خاصية 1, NOMMÉE après le geste : l'élève
 *           vient de voir deux flèches arriver au même carré et de prouver
 *           (−b)² = b² (نشاط 3, question 1 جـ).
 *   محور 2  hulul-x2-a — la خاصية 2 (trois cas selon le signe de a).
 *   محور 3  tariqat-hall-x2 — la طريقة p. 23.
 */
const { prop1, prop2 } = KNOWLEDGE;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'murabba-mutaakisayn', type: 'regles', title: 'عددان متعاكسان، مربع واحد',
        memo: {
          rule: `(-x)^2=${R('x^2')}\\geq 0`,
          hook: 'العدد ومعاكسه مربّع واحد',
          example: `(-4)^2=${R('4^2')}=16`,
          trap: 'الظنّ أنّ مربّع العدد السالب سالب',
          exam: 'اذكر أنّ مربّع أي عدد موجب أو معدوم',
          chip: `(-x)^2=${R('x^2')}`,
          quiz: [
            { q: '$(-6)^2=$', options: ['$36$', '$-36$', '$-12$'], correct: 0 },
            { q: 'أيّ عدد مربّعه $49$ ؟', options: ['$7$ و $-7$', '$7$ فقط', '$24{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'على المستقيم وصل سهما $-\\dfrac{3}{2}$ و $\\dfrac{3}{2}$ إلى النقطة نفسها، وللمعادلة $x^2 = 3$ ثبّتّ حلّين لا يقع أيّ منهما على تدريجة، ولم يدخل أي سهم الجزء المخطّط. اكتب القاعدة بكلماتك: إذا كان $a$ عددا موجبا، ما العددان اللذان مربع كل منهما $a$؟ وماذا تقول عن مربع أي عدد؟',
        summary: 'لعددين متعاكسين نفس المربع: الجذر التربيعي للعدد الموجب a ومعاكسه مربع كل منهما يساوي a. ومربع أي عدد هو دائما عدد موجب.',
        body: (
          <div className="space-y-2">
            <p><MathText>{prop1.text}</MathText></p>
            <ul className="list-disc ms-5 text-sm text-slate-700">
              {prop1.aside.map((line) => <li key={line}><MathText>{line}</MathText></li>)}
            </ul>
            <p className="text-sm font-semibold text-slate-800"><MathText>{prop1.note}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'hulul-x2-a', type: 'regles', title: 'عدد الحلول حسب إشارة a',
        memo: {
          rule: `x^2=a\\ (a>0):\\ x_1=${R('\\sqrt{a}')}\\ ,\\ x_2=${R('-\\sqrt{a}')}`,
          hook: 'الإشارة تحدّد عدد الحلول',
          example: `x^2=${R('9')}\\iff x=3\\ ,\\ x=-3`,
          trap: 'الاكتفاء بالحلّ الموجب',
          exam: 'ابدأ بإشارة العدد قبل البحث عن الحلول',
          chip: `x^2=${R('9')}\\to\\pm 3`,
          quiz: [
            { q: 'حلّا المعادلة $x^2=16$ :', options: ['$4$ و $-4$', '$4$ فقط', '$8$ و $-8$'], correct: 0 },
            { q: 'عدد حلول المعادلة $x^2=-4$ :', options: ['لا حلّ', 'حلّان', 'حلّ واحد'], correct: 0 },
          ],
        },
        predictPrompt: 'على المستقيم حللت $x^2 = 9$ و $x^2 = 5$ و $x^2 = -1$، وفي النشاط $x^2 = 0$: لم يكن عدد الحلول نفسه في كل مرة. اكتب القاعدة بكلماتك: كيف تعرف، قبل أن تحل المعادلة $x^2 = a$، كم حلا لها وما هي؟',
        summary: 'عدد الحلول يتعلّق بإشارة a: حلان متعاكسان إذا كان a موجبا تماما، حل واحد هو 0 إذا كان a معدوما، ولا حل إذا كان a سالبا تماما.',
        body: (
          <div className="space-y-2">
            <p><MathText>{prop2.text}</MathText></p>
            <ul className="list-disc ms-5 space-y-1">
              {prop2.cases.map((c) => <li key={c}><MathText>{c}</MathText></li>)}
            </ul>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-hall-x2', type: 'methodes', title: 'طريقة حل المعادلة',
        memo: {
          rule: `x^2=a\\ \\to\\ x=${R('\\pm\\sqrt{a}')}`,
          hook: 'حدّد الإشارة ثم اكتب الحلّين',
          example: `x^2=${R('7')}\\iff x=\\sqrt{7}\\ ,\\ x=-\\sqrt{7}`,
          trap: 'قسمة العدد على اثنين بدل أخذ الجذر',
          exam: 'اكتب القيمتين المضبوطتين بالجذر ولا تقرّب إلا بطلب',
          chip: `x^2=a\\to${R('\\pm\\sqrt{a}')}`,
          quiz: [
            { q: 'حلّا المعادلة $x^2=10$ :', options: ['$\\sqrt{10}$ و $-\\sqrt{10}$', '$5$ و $-5$', '$\\sqrt{10}$ فقط'], correct: 0 },
            { q: 'حلّا المعادلة $2x^2=50$ :', options: ['$5$ و $-5$', '$25$ و $-25$', '$\\sqrt{50}$ و $-\\sqrt{50}$'], correct: 0 },
          ],
        },
        predictPrompt: 'الحلول الثلاثة التي كشفتها ($x^2 = 5$ ، $x^2 = \\dfrac{1}{4}$ ، $x^2 = -9$) سارت بالخطوات نفسها. لو أعطيناك معادلة أخرى $x^2 = a$: بماذا تبدأ؟ وماذا تكتب بعد ذلك لتصل إلى الحلّين؟ اكتب الطريقة.',
        summary: 'نحدد إشارة العدد a؛ إذا كان a موجبا تماما نكتب a على شكل مربع جذره التربيعي، ثم نعيّن الحلين المتعاكسين.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.rule}</MathText></p>
            <p className="text-sm text-slate-700"><MathText>{METHOD.solution[0]}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
