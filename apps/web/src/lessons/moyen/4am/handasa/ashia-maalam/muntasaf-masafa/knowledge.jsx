import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, ACTIVITY_LINES, KNOW_MID, KNOW_DIST, KNOW_LINES } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين في معلم » — SOURCE UNIQUE.
 *
 *   module 1 (تحدّ ونشاط 3 و 4)  muntasaf-murakkibat — J milieu de [KL] ⇔ KJ = JL : les deux vecteurs ont les mêmes
 *                                composantes (le نشاط 3 1) répondu sous le rendez-vous de l'élève) ;
 *   module 3 (معارف د و هـ)      ihdathiyata-muntasaf (la propriété du milieu et son exemple), masafa (la distance et son
 *                                exemple).
 * Le module 2 (الحالة العامة) DÉRIVE les deux formules par des questions ; il n'établit rien que le module 3 ne dise au mot près.
 */
/** `memo` — la FICHE DE MÉMOIRE de chaque connaissance (MemoCard) : ce qui CHANGE dans la règle est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'muntasaf-murakkibat', type: 'concepts', title: 'المنتصف وتساوي شعاعين',
        memo: {
          rule: `J\\in[KL],\\ \\overrightarrow{KJ}=${R('\\overrightarrow{JL}')}`,
          hook: 'المنتصف: المركبتان نفسهما من الطرفين',
          example: `\\overrightarrow{AI}\\begin{pmatrix} 1{,}5 \\\\ 2 \\end{pmatrix}=\\overrightarrow{IB}\\begin{pmatrix} 1{,}5 \\\\ 2 \\end{pmatrix}`,
          trap: 'منتصف القطعة ليس مجموع الإحداثيات بل تساوي شعاعين',
          exam: 'اكتب تساوي الشعاعين ثم ساوِ المركبات',
          chip: `\\overrightarrow{AI}=${R('\\overrightarrow{IB}')}`,
          quiz: [
      { q: 'إذا كانت $I$ منتصف $[AB]$ فإن:', options: ['$\\overrightarrow{AI}=\\overrightarrow{IB}$', '$\\overrightarrow{AI}=\\overrightarrow{BI}$', '$AI=2IB$'], correct: 0 },
      { q: 'مع $\\overrightarrow{AI}(1{,}5\\,;\\,2)$ و $I$ منتصف $[AB]$ فمركبتا $\\overrightarrow{IB}$:', options: ['$(1{,}5\\,;\\,2)$', '$(-1{,}5\\,;\\,-2)$', '$(3\\,;\\,4)$'], correct: 0 },
          ],
        },
        summary: 'J منتصف القطعة [KL] يعني أن الشعاع KJ يساوي الشعاع JL، فلهما نفس المركبتين: نفس الحركة الأفقية ونفس الحركة العمودية من K إلى J ومن J إلى L.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{ACTIVITY_LINES.kj}</MathText></p>
            <p><MathText>{ACTIVITY_LINES.conclusion}</MathText></p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'ihdathiyata-muntasaf', type: 'regles', title: 'إحداثيتا منتصف قطعة',
        memo: {
          rule: `I\\left(${R('\\dfrac{x_A+x_B}{2}')}\\,;\\,${R('\\dfrac{y_A+y_B}{2}')}\\right)`,
          hook: 'اجمع ثم اقسم على اثنين',
          example: `I\\left(\\dfrac{1+4}{2}\\,;\\,\\dfrac{-1+3}{2}\\right)=(2{,}5\\,;\\,1)`,
          trap: 'نسيان القسمة على اثنين',
          exam: 'اكتب الصيغة بالأعداد ثم الناتج',
          chip: `\\tfrac{x_A+x_B}{2}`,
          quiz: [
      { q: 'منتصف $[AB]$ مع $A(1\\,;\\,-1)$ و $B(4\\,;\\,3)$ هو:', options: ['$(2{,}5\\,;\\,1)$', '$(5\\,;\\,2)$', '$(1{,}5\\,;\\,2)$'], correct: 0 },
      { q: 'منتصف $[KL]$ مع $K(5\\,;\\,3)$ و $L(-3\\,;\\,1)$ هو:', options: ['$(1\\,;\\,2)$', '$(2\\,;\\,4)$', '$(-4\\,;\\,-1)$'], correct: 0 },
          ],
        },
        predictPrompt: 'في النشاط 3 كان دبّوس اللقاء بين $K(5\\,;\\,3)$ و $L(-3\\,;\\,1)$ هو $J(1\\,;\\,2)$ . لو أعطيناك طرفي أيّ قطعة $[AB]$ ، كيف تحسب فاصلة منتصفها وترتيبه من إحداثيتي $A$ و $B$ ؟ اكتب القاعدة بكلماتك.',
        summary: 'إذا كانت I منتصف القطعة [AB] فإن فاصلة I نصف مجموع فاصلتي A و B، وترتيب I نصف مجموع ترتيبي A و B.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW_MID.property}</MathText></p>
            <p className="text-slate-700"><MathText>{KNOW_MID.example}</MathText></p>
            <SourceTag source={KNOW_MID.source} />
          </div>
        ),
      },
      {
        id: 'masafa', type: 'regles', title: 'المسافة بين نقطتين',
        memo: {
          rule: `AB=\\sqrt{${R('\\Delta x^2+\\Delta y^2')}}`,
          hook: 'وتر مثلث قائم: جذر مجموع المربعين',
          example: `AB=\\sqrt{3^2+4^2}=\\sqrt{25}=5`,
          trap: 'جمع الفرقين دون تربيع أو ترك الجذر',
          exam: 'اكتب الجذر بالأعداد ثم الناتج',
          chip: `\\sqrt{\\Delta x^2+\\Delta y^2}`,
          quiz: [
      { q: 'المسافة بين $A(1\\,;\\,-1)$ و $B(4\\,;\\,3)$ :', options: ['$5$', '$7$', '$25$'], correct: 0 },
      { q: 'المسافة بين $O(0\\,;\\,0)$ و $M(2\\,;\\,2)$ :', options: ['$2\\sqrt{2}$', '$4$', '$8$'], correct: 0 },
          ],
        },
        predictPrompt: 'في النشاط 4 بنيت درج الشوارع من $L(1\\,;\\,-2)$ إلى $K(5\\,;\\,1)$ : ضلعاه 4 و 3، والمسافة في خط مستقيم $KL = 5$ . كيف تحسب المسافة $AB$ بين أيّ نقطتين في معلم متعامد ومتجانس انطلاقًا من إحداثياتهما؟ اكتب القاعدة.',
        summary: 'في معلم متعامد ومتجانس، المسافة AB هي الجذر التربيعي لمجموع مربعي فرقي الإحداثيات: فرق الفاصلتين وفرق الترتيبين، وهي وتر مثلث قائم.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW_DIST.intro}</MathText> <MathText>{KNOW_DIST.property}</MathText></p>
            <p className="text-slate-700"><MathText>{KNOW_DIST.example}</MathText></p>
            <p className="text-slate-700"><MathText>{KNOW_LINES.exact}</MathText></p>
            <SourceTag source={KNOW_DIST.source} />
          </div>
        ),
      },
    ],
  },
};
