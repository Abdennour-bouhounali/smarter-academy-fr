import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOW1, KNOW2 } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « مفهوم الانسحاب والشعاع وتساوي شعاعين » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 1)        insihab-shuaa — la translation définie par un point et son image ; les couples (point ;
 *                            image) définissent UN vecteur, chacun en est un représentant (le texte du نشاط 1) ;
 *   module 2 (معارف 1)       manha-ittijah (المنحى والاتجاه), shuaa (le vecteur : منحى، اتجاه، طول ; notation, مُمثّل),
 *                            tasawi-shuaayn (deux vecteurs égaux) ;
 *   module 3 (نشاط 2 أ ومعارف 2)  mutawazi-adlaa (AB = DC ⇔ ABCD متوازي أضلاع), mulahazat (les milieux, AD = BC, le cas
 *                            aligné).
 */
/** La partie qui CHANGE dans une fiche de mémoire, en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'insihab-shuaa', type: 'concepts', title: 'الانسحاب يعرّف شعاعا',
        memo: {
          rule: `A\\mapsto${R('A^{\\prime}')}\\Rightarrow \\overrightarrow{AA^{\\prime}}=\\overrightarrow{BB^{\\prime}}`,
          hook: 'نقطة وصورتها = انسحاب',
          example: `A\\mapsto A^{\\prime}\\Rightarrow \\overrightarrow{AA^{\\prime}}=\\overrightarrow{BB^{\\prime}}=\\overrightarrow{CC^{\\prime}}=${R('\\vec{u}')}`,
          trap: 'لكل مسيّرة ممثّلها، لكنّ الشعاع واحد',
          exam: 'اكتب الانسحاب بنقطة وصورتها',
          chip: `A\\mapsto A^{\\prime}\\to${R('\\vec{u}')}`,
          quiz: [
            { q: 'يتعيّن الانسحاب بـ:', options: ['المنحى وحده', 'الطول وحده', 'نقطة وصورتها'], correct: 2 },
            { q: 'السهمان $\\overrightarrow{AA^{\\prime}}$ و $\\overrightarrow{BB^{\\prime}}$ في انسحاب واحد هما:', options: ['شعاعان مختلفان', 'ممثّلان لشعاع واحد', 'متعامدان'], correct: 1 },
          ],
        },
        predictPrompt: 'في اللوحة الرابعة حوّل الانسحاب نفسه $A$ إلى $A\'$ و $C$ إلى $D$ و $K$ إلى $H$. ماذا تشترك فيه الثنائيات $(A\\,;\\,A\')$ و $(C\\,;\\,D)$ و $(K\\,;\\,H)$؟ اكتب بكلماتك ما تعرّفه كل ثنائية من نقطة وصورتها، وما العلاقة بين هذه الثنائيات.',
        summary: 'الانسحاب يتعيّن بنقطة وصورتها؛ وكل ثنائية من نقطة وصورتها بهذا الانسحاب تعرّف نفس الشعاع u، وكل منها ممثّل لهذا الشعاع.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{ACTIVITY.closing}</MathText></p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'manha-ittijah', type: 'concepts', title: 'المنحى والاتجاه',
        memo: {
          rule: `${R('A\\to B\\neq B\\to A')}`,
          hook: 'المنحى للمستقيم والاتجاه للسهم',
          example: `A\\to B\\neq${R('B\\to A')}`,
          trap: 'التوازي يعطي المنحى لا الاتجاه',
          exam: 'اذكر الاتجاه بالحرفين مرتّبين',
          chip: `A\\to B${R('\\neq')}B\\to A`,
          quiz: [
            { q: 'مستقيمان متوازيان لهما:', options: ['المنحى نفسه', 'الاتجاه نفسه دائمًا', 'الطول نفسه'], correct: 0 },
            { q: 'للمستقيم $(AB)$ :', options: ['اتجاه واحد فقط', 'لا اتجاه له', 'اتجاهان: من $A$ نحو $B$ ومن $B$ نحو $A$'], correct: 2 },
          ],
        },
        // Pas de prédiction : deux NOMS du manuel (« نقول إنّ لهما نفس المنحى » est déjà dans le texte du نشاط 1 ب, lu et
        // utilisé au module 1, étape 2) — un nom ne se devine pas.
        predict: false,
        summary: 'مستقيمان متوازيان لهما نفس المنحى؛ والنقطتان المتمايزتان A و B تعيّنان على المستقيم (AB) اتجاهين: من A نحو B، ومن B نحو A.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW1.manha}</MathText></p>
            <SourceTag source={KNOW1.source} />
          </div>
        ),
      },
      {
        id: 'shuaa', type: 'concepts', title: 'الشعاع: منحى واتجاه وطول',
        memo: {
          rule: `\\overrightarrow{AB}:(AB),\\ A\\to B,\\ ${R('AB')}`,
          hook: 'منحى · اتجاه · طول',
          example: `\\overrightarrow{AB}:(AB),\\ A\\to B,\\ ${R('AB=3')}`,
          trap: 'المبدأ A والنهاية B: لا نعكسهما',
          exam: 'عرّف الشعاع بمنحاه واتجاهه وطوله',
          chip: `\\overrightarrow{AB}:(AB),A\\!\\to\\!B,${R('AB')}`,
          quiz: [
            { q: 'طويلة الشعاع $\\overrightarrow{AB}$ هي طول:', options: ['القطعة $[AB]$', 'المستقيم $(AB)$', 'نصف المستقيم $[AB)$'], correct: 0 },
            { q: 'مبدأ الشعاع $\\overrightarrow{AB}$ هو:', options: ['$B$', '$(AB)$', '$A$'], correct: 2 },
          ],
        },
        predictPrompt: 'على الشكل أربعة أسهم من نفس الانسحاب: من $A$ إلى $B$، ومن $E$ إلى $F$، ومن $C$ إلى $D$، ومن $M$ إلى $N$. ماذا يتغيّر من سهم إلى آخر، وماذا يبقى نفسه؟ اكتب الأشياء الثلاثة التي تكفي لوصف هذه الحركة المشتركة، ودور النقطتين $A$ و $B$ في السهم الأوّل.',
        summary: 'الشعاع AB الذي يعرّفه الانسحاب الذي يحوّل A إلى B منحاه منحى المستقيم (AB)، واتجاهه من A نحو B، وطويلته طول القطعة [AB]؛ مبدؤه A ونهايته B، وكل ثنائية أخرى من نقطة وصورتها ممثّل له.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW1.shuaa}</MathText></p>
            <ul className="list-disc space-y-0.5 ps-5">{KNOW1.shuaaItems.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>
            <p><MathText>{KNOW1.shuaaNotation}</MathText></p>
            <SourceTag source={KNOW1.source} />
          </div>
        ),
      },
      {
        id: 'tasawi-shuaayn', type: 'concepts', title: 'تساوي شعاعين',
        memo: {
          rule: `\\overrightarrow{AB}=\\overrightarrow{CD}\\Rightarrow${R('AB=CD')}`,
          hook: 'المنحى والاتجاه والطول معًا',
          example: `A\\mapsto G\\Rightarrow C\\mapsto${R('E')}\\ :\\ \\overrightarrow{AG}=\\overrightarrow{CE}`,
          trap: 'الطول المتساوي وحده لا يكفي',
          exam: 'اذكر العناصر الثلاثة عند الاستدلال',
          chip: `\\overrightarrow{AB}{=}\\overrightarrow{CD}`,
          quiz: [
            { q: 'يتساوى شعاعان إذا كان لهما:', options: ['الطول نفسه فقط', 'المنحى نفسه فقط', 'المنحى والاتجاه والطول نفسها'], correct: 2 },
            { q: 'الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ :', options: ['متساويان', 'لهما الطول نفسه واتجاهان متعاكسان', 'لهما اتجاه واحد'], correct: 1 },
          ],
        },
        predictPrompt: 'على الشكل السهمان من $A$ إلى $B$ ومن $C$ إلى $D$. في العرض رُفضت صورة كل مسيّرة اختلف سهمها عن سهم القائدة في شيء واحد فقط. متى نكتب $\\overrightarrow{AB} = \\overrightarrow{CD}$؟ اكتب كل الشروط، وما يعنيه ذلك للانسحاب الذي يحوّل $A$ إلى $B$.',
        summary: 'شعاعان متساويان يعني أن لهما نفس المنحى ونفس الاتجاه ونفس الطول؛ و AB = CD يعني أن الانسحاب الذي يحوّل A إلى B يحوّل أيضا C إلى D.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW1.tasawi}</MathText></p>
            <p><MathText>{KNOW1.tasawiExample}</MathText></p>
            <SourceTag source={KNOW1.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'mutawazi-adlaa', type: 'regles', title: 'شعاعان متساويان ومتوازي أضلاع',
        memo: {
          rule: `\\overrightarrow{AB}=${R('\\overrightarrow{DC}')}\\iff ABCD`,
          hook: 'المبدأ والنهاية بالترتيب نفسه',
          example: `\\overrightarrow{AB}=${R('\\overrightarrow{DC}')}\\iff ABCD`,
          trap: 'لا نكتب الأضلاع بترتيب مغاير عند تسمية الرباعي',
          exam: 'ثلاث نقط ليست على استقامة قبل أيّ استنتاج',
          chip: `\\overrightarrow{AB}=\\overrightarrow{DC}\\iff ABCD`,
          quiz: [
            { q: 'الشعاع $\\overrightarrow{AB}$ = $\\overrightarrow{DC}$ يعني أنّ متوازي الأضلاع هو:', options: ['$ABDC$', '$ABCD$', '$ACBD$'], correct: 1 },
            { q: 'نشترط لهذا الاستنتاج أن:', options: ['تكون النقط الأربع على استقامة', 'تكون كل ثلاث منها ليست على استقامة', 'يكون $AB=1$'], correct: 1 },
          ],
        },
        predictPrompt: 'في الرباعي الذي أنشأته وجدت $\\overrightarrow{AB} = \\overrightarrow{DC}$. لو أعطيناك أربع نقط $A$ و $B$ و $C$ و $D$، كل ثلاث منها ليست في استقامية، بحيث $\\overrightarrow{AB} = \\overrightarrow{DC}$: ماذا تقول عن الرباعي $ABCD$؟ اكتب القاعدة في الاتجاهين، وانتبه إلى ترتيب الحروف.',
        summary: 'إذا كانت A و B و C و D أربع نقط كل ثلاث منها ليست في استقامية، فإن الشعاع AB يساوي الشعاع DC يعني أن الرباعي ABCD متوازي أضلاع (انتبه إلى ترتيب الحروف).',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW2.property}</MathText></p>
            <SourceTag source={KNOW2.source} />
          </div>
        ),
      },
      {
        id: 'mulahazat', type: 'regles', title: 'المنتصف والحالة الخاصة',
        memo: {
          rule: `${R('M_{[AC]}=M_{[BD]}')}`,
          hook: 'لهما نفس المنتصف',
          example: `\\overrightarrow{AB}=\\overrightarrow{DC}\\Rightarrow${R('M_{[AC]}=M_{[BD]}')}`,
          trap: 'إذا كانت النقط على استقامة لا يتكوّن رباعي',
          exam: 'اذكر المنتصف المشترك ثم المساواة الثانية',
          chip: `M_{[AC]}=M_{[BD]}`,
          quiz: [
            { q: 'إذا كان $\\overrightarrow{AB}$ = $\\overrightarrow{DC}$ فللقطعتين $[AC]$ و $[BD]$ :', options: ['منتصفان مختلفان', 'المنتصف نفسه', 'الطول نفسه فقط'], correct: 1 },
            { q: 'ومنه $\\overrightarrow{AD}$ =', options: ['$\\overrightarrow{BC}$', '$\\overrightarrow{CB}$', '$\\overrightarrow{DC}$'], correct: 0 },
          ],
        },
        predictPrompt: 'على الشكل $\\overrightarrow{AB} = \\overrightarrow{DC}$ والقطعتان $[AC]$ و $[BD]$ مرسومتان بخطّ متقطّع. ماذا تلاحظ عنهما؟ وأيّ شعاعين آخرين متساويان؟ ثم ماذا يبقى صحيحًا في رأيك لو كانت النقط الأربع على مستقيم واحد؟',
        summary: 'من أجل كل أربع نقط: الشعاع AB يساوي الشعاع DC يعني أن للقطعتين [AC] و [BD] نفس المنتصف، وعندها الشعاع AD يساوي الشعاع BC؛ وإذا كانت النقط في استقامية فلا يتكوّن رباعي.',
        body: (
          <div className="space-y-1.5">
            <p>{KNOW2.remarksIntro}</p>
            <ul className="list-disc space-y-0.5 ps-5">{KNOW2.remarks.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>
            <p><MathText>{KNOW2.special}</MathText> <MathText>{KNOW2.specialLine}</MathText></p>
            <SourceTag source={KNOW2.source} />
          </div>
        ),
      },
    ],
  },
};
