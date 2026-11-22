import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOW3, KNOW2_REMINDER, PROOF_STEPS, METHOD_IMAGE, METHOD_EQUAL, MISTAKES } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 2 ب)  muntasaf-mushtarak — deux segments de même milieu : AB = CD, même sur une droite ;
 *   module 2 (معارف)     muntasaf-shuaa (معارف 3 : I milieu ⇔ AI = IB) ; mutawazi-shuaa (AB = DC ⇔ ABCD متوازي أضلاع
 *                        ⇔ diagonales de même milieu — rappel du درس 1 — et les étapes de la preuve, plateforme) ;
 *   module 3 (طرائق)     surat-nuqta (l'image d'un point par un انسحاب : compléter le متوازي أضلاع) ; ithbat-tasawi
 *                        (prouver l'égalité de deux vecteurs : un متوازي أضلاع ou un انسحاب).
 */
/** La partie qui CHANGE dans une fiche de mémoire, en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'muntasaf-mushtarak', type: 'regles', title: 'منتصف مشترك وشعاعان متساويان',
        memo: {
          rule: `M_{[AD]}=M_{[BC]}\\Rightarrow \\overrightarrow{AB}=${R('\\overrightarrow{CD}')}`,
          hook: 'منتصف مشترك: شعاعان متساويان',
          example: `M_{[AD]}=M_{[BC]}\\Rightarrow \\overrightarrow{AB}=${R('\\overrightarrow{CD}')}`,
          trap: 'الاستنتاج يصحّ حتى لو كانت النقط على استقامة',
          exam: 'اذكر المنتصف المشترك أولًا',
          chip: `M_{[AD]}=M_{[BC]}\\to${R('\\overrightarrow{AB}=\\overrightarrow{CD}')}`,
          quiz: [
            { q: 'إذا كان للقطعتين $[AD]$ و $[BC]$ المنتصف نفسه فإنّ:', options: ['$\\overrightarrow{AB}$ = $\\overrightarrow{DC}$', '$\\overrightarrow{AB}$ = $\\overrightarrow{CD}$', '$\\overrightarrow{AD}$ = $\\overrightarrow{BC}$'], correct: 1 },
            { q: 'هل يبقى هذا الاستنتاج صحيحًا إذا كانت النقط الأربع على استقامة واحدة؟', options: ['لا أبدًا', 'فقط إذا تساوى الطولان', 'نعم'], correct: 2 },
          ],
        },
        predictPrompt: 'في النشاط كان للقطعتين $[AD]$ و $[BC]$ نفس المنتصف $O$، ووجدت $\\overrightarrow{AB} = \\overrightarrow{CD}$ رغم أنّ النقط على مستقيم واحد. ماذا تستنتج دائمًا إذا كان لقطعتين نفس المنتصف؟ اكتب القاعدة بكلماتك.',
        summary: 'إذا كان للقطعتين [AD] و [BC] نفس المنتصف فإن الشعاعين AB و CD متساويان، حتى لو كانت النقط الأربع على استقامة واحدة (متوازي أضلاع مسطّح).',
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
        id: 'muntasaf-shuaa', type: 'regles', title: 'المنتصف وتساوي شعاعين',
        memo: {
          rule: `I=M_{[AB]}\\iff${R('\\overrightarrow{AI}=\\overrightarrow{IB}')}`,
          hook: 'المنتصف يعني شعاعين متساويين',
          example: `\\overrightarrow{AI}=\\overrightarrow{IB}\\iff I=M_{[AB]}`,
          trap: 'تساوي الطولين دون الاتجاه لا يعني أنّ I منتصف',
          exam: 'اكتب المساواة الشعاعية ثم اذكر المنتصف',
          chip: `I=M_{[AB]}\\iff${R('\\overrightarrow{AI}=\\overrightarrow{IB}')}`,
          quiz: [
            { q: '$I$ منتصف $[AB]$ يعني أنّ:', options: ['$\\overrightarrow{AI}$ = $\\overrightarrow{BI}$', '$\\overrightarrow{AI}$ = $\\overrightarrow{IB}$', '$\\overrightarrow{IA}$ = $\\overrightarrow{IB}$'], correct: 1 },
            { q: 'إذا كان $\\overrightarrow{AI}$ = $\\overrightarrow{IB}$ فإنّ:', options: ['$I$ منتصف $[AB]$', '$A$ منتصف $[IB]$', '$B$ منتصف $[AI]$'], correct: 0 },
          ],
        },
        predictPrompt: 'على الوشاح المقسّم إلى 8 أقسام لم يتساوَ الشعاعان $\\overrightarrow{AI}$ و $\\overrightarrow{IB}$ إلا عندما وقف القائد $I$ عند القسم 4. اكتب القاعدة في الاتجاهين: متى يكون $\\overrightarrow{AI} = \\overrightarrow{IB}$؟ وماذا تكتب بالأشعة إذا علمت أنّ $I$ في هذا الموضع من $[AB]$؟',
        summary: 'I منتصف القطعة [AB] يعني أن الشعاعين AI و IB متساويان، وتساوي الشعاعين AI و IB يعني أن I منتصف [AB].',
        body: (
          <div className="space-y-1.5">
            {KNOW3.property.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p><MathText>{KNOW3.example}</MathText></p>
            <SourceTag source={KNOW3.source} />
          </div>
        ),
      },
      {
        id: 'mutawazi-shuaa', type: 'regles', title: 'متوازي الأضلاع بتساوي شعاعين',
        memo: {
          rule: `ABCD\\Rightarrow \\overrightarrow{AB}=${R('\\overrightarrow{DC}')}`,
          hook: 'ضلعان متقابلان في الاتجاه نفسه',
          example: `ABCD\\Rightarrow \\overrightarrow{AB}=${R('\\overrightarrow{DC}')},\\ \\overrightarrow{AD}=\\overrightarrow{BC}`,
          trap: 'اتجاه القراءة واحد في الضلعين المتقابلين',
          exam: 'لإثبات متوازي أضلاع أثبت تساوي شعاعين متقابلين',
          chip: `ABCD\\to${R('\\overrightarrow{AB}=\\overrightarrow{DC}')}`,
          quiz: [
            { q: 'إذا كان $ABCD$ متوازي أضلاع فإنّ:', options: ['$\\overrightarrow{AB}$ = $\\overrightarrow{CD}$', '$\\overrightarrow{AB}$ = $\\overrightarrow{DC}$', '$\\overrightarrow{AB}$ = $\\overrightarrow{BC}$'], correct: 1 },
            { q: 'لإثبات أنّ $ABCD$ متوازي أضلاع يكفي إثبات:', options: ['$AB=DC$ طولًا فقط', '$(AB)\\parallel(CD)$ فقط', '$\\overrightarrow{AD}$ = $\\overrightarrow{BC}$'], correct: 2 },
          ],
        },
        summary: 'تساوي الشعاعين AB و DC يعني أن الرباعي ABCD متوازي أضلاع وأن قطريه [AC] و [BD] لهما نفس المنتصف؛ لإثبات أن رباعيا متوازي أضلاع نثبت تساوي شعاعين على ضلعين متقابلين مقروءين في الاتجاه نفسه.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW2_REMINDER.property}</MathText></p>
            <p><MathText>{KNOW2_REMINDER.remark}</MathText></p>
            <p><MathText>{MISTAKES.order.text}</MathText></p>
            <ol className="list-decimal space-y-0.5 ps-5">
              {PROOF_STEPS.lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}
            </ol>
            <SourceTag source={KNOW2_REMINDER.source} /> <SourceTag source={PROOF_STEPS.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'surat-nuqta', type: 'methodes', title: 'صورة نقطة بانسحاب علم شعاعه',
        memo: {
          rule: `C\\xrightarrow{\\overrightarrow{AB}}${R('D')}`,
          hook: 'صورة C: أكمل متوازي الأضلاع',
          example: `D=t_{\\overrightarrow{AB}}(C)\\Rightarrow \\overrightarrow{CD}=${R('\\overrightarrow{AB}')}`,
          trap: 'السهم ينطلق من النقطة وينتهي في صورتها',
          exam: 'ابدأ بالمساواة الشعاعية ثم أكمل الرباعي',
          chip: `C\\xrightarrow{\\overrightarrow{AB}}${R('D')}`,
          quiz: [
            { q: 'إذا كانت $D$ صورة $C$ بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ فإنّ:', options: ['$\\overrightarrow{DC}$ = $\\overrightarrow{AB}$', '$\\overrightarrow{CD}$ = $\\overrightarrow{AB}$', '$\\overrightarrow{CD}$ = $\\overrightarrow{BA}$'], correct: 1 },
            { q: 'الرباعي المتوازي الأضلاع الناتج هو:', options: ['$ABCD$', '$ACBD$', '$ABDC$'], correct: 2 },
          ],
        },
        predictPrompt: 'على شبكة المدرّج وضعت الركن $D$ بنفسك: عددت المربعات من $A$ إلى $B$ ثم أعدت الحركة من $C$. لو أعطيناك ثلاث نقط $A$ و $B$ و $C$ على ورقة بيضاء دون شبكة، كيف تنشئ صورة $C$ بالانسحاب الذي شعاعه $\\overrightarrow{AB}$؟ اكتب الطريقة: أيّ شكل تكمله، وأيّ نقطة تستعملها؟',
        summary: 'D صورة C بالانسحاب الذي شعاعه AB يعني أن الشعاعين CD و AB متساويان: نكمل متوازي الأضلاع ABDC، أي D نظيرة A بالنسبة إلى منتصف [BC].',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_IMAGE.solution[1]}</MathText></p>
            <p><MathText>{METHOD_IMAGE.solution[3]}</MathText></p>
            <SourceTag source={METHOD_IMAGE.source} />
          </div>
        ),
      },
      {
        id: 'ithbat-tasawi', type: 'methodes', title: 'إثبات تساوي شعاعين',
        memo: {
          rule: `ABDC\\Rightarrow${R('\\overrightarrow{AB}=\\overrightarrow{CD}')}`,
          hook: 'ابحث عن متوازي أضلاع',
          example: `M_{[AD]}=M_{[BC]}\\Rightarrow ABDC\\Rightarrow${R('\\overrightarrow{AB}=\\overrightarrow{CD}')}`,
          trap: 'لا نثبت التساوي بقياس الأطوال',
          exam: 'اذكر الخاصية التي بنيتَ عليها: قطران متناصفان',
          chip: `ABDC\\to${R('\\overrightarrow{AB}=\\overrightarrow{CD}')}`,
          quiz: [
            { q: 'لإثبات $\\overrightarrow{AB}$ = $\\overrightarrow{CD}$ نثبت أنّ:', options: ['$AB=CD$ طولًا فقط', '$ABDC$ متوازي أضلاع', '$A$ و $C$ متقابلتان'], correct: 1 },
            { q: 'قطرا متوازي الأضلاع:', options: ['متعامدان دائمًا', 'متساويان دائمًا', 'متناصفان'], correct: 2 },
          ],
        },
        predictPrompt: 'في التمرين برهنّا $\\overrightarrow{OD} = \\overrightarrow{BC}$ دون أن نقيس أيّ طول ولا أيّ منحى، انطلاقًا من منتصفين فقط. لو طُلب منك أن تبرهن تساوي شعاعين آخرين، على ماذا تعتمد؟ اكتب الطريقة بكلماتك.',
        summary: 'لإثبات تساوي شعاعين نعتمد على متوازي أضلاع (قطراه متناصفان، أو ضلعان متقابلان) أو على الانسحاب الذي يحوّل مبدأ كل منهما إلى نهايته.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_EQUAL.rule}</MathText></p>
            {METHOD_EQUAL.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <SourceTag source={METHOD_EQUAL.source} />
          </div>
        ),
      },
    ],
  },
};
