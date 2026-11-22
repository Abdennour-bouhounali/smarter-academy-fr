import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « المساويات والعمليات » (3AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف 1
 * p. 74 et طرائق p. 75, réécrits). Le test d'une égalité par une valeur et le produit de nombres relatifs sont des prérequis
 * (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici.
 */
const { add, times, both, zero } = KNOWLEDGE;

/** `memo` : la fiche de « 🔑 للتذكّر » — ce qui CHANGE en `R(…)` (rouge). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'musawat-jam', type: 'regles', title: 'المساواة والجمع والطرح',
        memo: {
          rule: `a=b\\Rightarrow a${R('+c')}=b${R('+c')}\\ ,\\ a${R('-c')}=b${R('-c')}`,
          hook: 'أضف أو اطرح من الطرفين',
          example: `10=4x-2\\Rightarrow 10${R('-2')}=4x-2${R('-2')}`,
          trap: 'نضيف العدد إلى طرف واحد فقط',
          exam: 'اكتب العملية نفسها بجانب كلّ طرف',
          chip: `a=b\\Rightarrow a\\pm c=b\\pm c`,
          quiz: [
            { q: 'إذا كان $a=b$ فإنّ $a+7=$', options: ['$b-7$', '$7b$', '$b+7$'], correct: 2 },
            { q: 'من $10=4x-2$ بطرح $2$ من الطرفين نجد:', options: ['$8=4x-4$', '$8=4x-2$', '$12=4x$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المضمار بقي المتسابقان معًا عندما أضفتَ العدد نفسه إلى الطرفين. إذا كان $a = b$ فماذا يمكنك أن تقول عن $a + c$ و $b + c$ ؟ وعن $a - c$ و $b - c$ ؟ اكتب القاعدة بكلماتك.',
        summary: 'إذا كان a = b فإنّ a + c = b + c و a − c = b − c : لا تتغيّر مساواة عندما نضيف إلى طرفيها العدد نفسه أو نطرحه منهما.',
        body: (
          <div className="space-y-2">
            <p><MathText>{add.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{add.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'tarafayn', type: 'regles', title: 'العملية على الطرفين معًا',
        memo: {
          rule: `L${R('\\ \\mathrm{op}\\ c')}=R${R('\\ \\mathrm{op}\\ c')}`,
          hook: 'الطرفان معًا دائمًا',
          example: `10${R('+2')}=4x-2${R('+2')}\\Rightarrow12=4x`,
          trap: 'عملية على طرف واحد تفرّق المتسابقين',
          exam: 'اكتب العملية على الطرفين ثم الناتج',
          chip: `L=R\\Rightarrow L\\ \\mathrm{op}\\ c=R\\ \\mathrm{op}\\ c`,
          quiz: [
            { q: 'لنضيف $4$ إلى المساواة $a=b$ نكتب:', options: ['$a+4=b$', '$a=b+4$', '$a+4=b+4$'], correct: 2 },
            { q: 'عند $x=3$ ، المساواة $10+2=4x-2$ (إضافة في طرف واحد) تعطي:', options: ['$12=10$', '$12=12$', '$10=10$'], correct: 0 },
          ],
        },
        predictPrompt: 'حين تلقّى متسابق واحد العملية افترق المتسابقان. على أيّ جزء من المساواة يجب أن نُجري العملية حتى تبقى صحيحة؟',
        summary: 'العملية تُجرى على الطرفين معًا: إذا أُجريت على طرف واحد فلا تبقى المساواة صحيحة.',
        body: <p><MathText>{both.text}</MathText></p>,
      },
    ],
    2: [
      {
        id: 'musawat-darb', type: 'regles', title: 'المساواة والضرب والقسمة',
        memo: {
          rule: `a=b\\Rightarrow ac=bc\\ ,\\ \\dfrac{a}{${R('c')}}=\\dfrac{b}{${R('c')}}\\ (c\\neq0)`,
          hook: 'اضرب أو اقسم الطرفين على غير الصفر',
          example: `12=4x\\Rightarrow\\dfrac{12}{${R('4')}}=\\dfrac{4x}{${R('4')}}\\Rightarrow3=x`,
          trap: 'لا قسمة على الصفر أبدًا',
          exam: 'اذكر أنّ المقسوم عليه غير معدوم',
          chip: `\\tfrac{a}{c}=\\tfrac{b}{c}\\ (${R('c\\neq0')})`,
          quiz: [
            { q: 'من $a=b$ و $c\\neq0$ نستنتج:', options: ['$a+c=bc$', '$\\frac{a}{c}=\\frac{b}{c}$', '$a=bc$'], correct: 1 },
            { q: 'من $12=4x$ نقسم الطرفين على $4$ فنجد:', options: ['$8=x$', '$48=x$', '$3=x$'], correct: 2 },
          ],
        },
        predictPrompt: 'ضربتَ الطرفين في العدد نفسه (موجبًا أو سالبًا) أو قسمتهما عليه فبقيا معًا. إذا كان $a = b$ فماذا تعطي $a \\times c$ و $\\frac{a}{c}$ ؟ وما الشرط على $c$ في القسمة؟',
        summary: 'إذا كان a = b فإنّ ac = bc ، وإذا كان c ≠ 0 فإنّ a/c = b/c.',
        body: (
          <div className="space-y-2">
            <p><MathText>{times.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{times.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'sifr', type: 'regles', title: 'القسمة على صفر والضرب في صفر',
        memo: {
          rule: `a=b\\Rightarrow a\\times${R('0')}=b\\times${R('0')}\\ (0=0)`,
          hook: 'الصفر يمحو المعلومة',
          example: `10\\times0=(4x-2)\\times0\\Rightarrow0=0`,
          trap: 'القسمة على الصفر مرفوضة والضرب فيه لا يفيد',
          exam: 'تجنّب الضرب في الصفر والقسمة عليه',
          chip: `c\\neq${R('0')}`,
          quiz: [
            { q: 'أيّ عملية ممنوعة على طرفي مساواة؟', options: ['الجمع بعدد سالب', 'القسمة على $0$', 'الضرب في $2$'], correct: 1 },
            { q: 'الضرب في $0$ يعطي:', options: ['$0=0$ صحيحة لكنها لا تفيد', '$a=b$ تبقى مفيدة', 'مساواة خاطئة'], correct: 0 },
          ],
        },
        predictPrompt: 'رفض المضمار القسمة على $0$ ، وأفرغ الضرب في $0$ المساواة من معناها. ماذا تقول عن $0$ ؟',
        summary: 'لا قسمة على 0 ؛ والضرب في 0 يعطي 0 = 0 : صحيحة لكنها لا تفيد.',
        body: <p><MathText>{zero.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'tahwil', type: 'methodes', title: 'أحوّل مساواة معطاة',
        memo: {
          rule: `A=B\\xrightarrow{${R('op')}}A'=B'`,
          hook: 'عملية أو عمليتان على الطرفين',
          example: `10=4x-2\\xrightarrow{+2}12=4x\\xrightarrow{\\div4}3=x`,
          trap: 'ننسى كتابة العملية فلا يُعرف كيف وصلنا',
          exam: 'اكتب العملية بجانب كلّ سطر',
          chip: `A=B\\Rightarrow A'=B'`,
          quiz: [
            { q: 'من $10=4x-2$ نصل إلى $12=4x$ بـ:', options: ['طرح $2$ من الطرفين', 'إضافة $2$ إلى الطرفين', 'ضرب الطرفين في $2$'], correct: 1 },
            { q: 'من $12=4x$ نصل إلى $3=x$ بـ:', options: ['قسمة الطرفين على $4$', 'طرح $4$ من الطرفين', 'ضرب الطرفين في $4$'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تتحقّق من صحة مساواة جديدة انطلاقًا من مساواة معطاة دون أن تبحث عن $x$ ؟ اكتب طريقتك.',
        summary: 'نحوّل المساواة المعطاة بعملية أو عمليتين على الطرفين؛ فإذا وصلنا إلى المساواة المطلوبة فهي صحيحة.',
        body: <p><MathText>{METHOD.transform.rule}</MathText></p>,
      },
      {
        id: 'hukm', type: 'regles', title: 'الضرب يشمل كل الحدود',
        memo: {
          rule: `c(ax+b)=cax+${R('cb')}`,
          hook: 'اضرب كلّ الحدود لا حدًّا واحدًا',
          example: `2(2x+3)=4x+${R('6')}`,
          trap: 'نضرب الحدّ الأوّل وننسى الثاني',
          exam: 'ضع الطرف بين قوسين قبل الضرب',
          chip: `c(ax+b)=cax+${R('cb')}`,
          quiz: [
            { q: 'ضربنا طرفي $2x+3=7$ في $2$ فنجد:', options: ['$4x+3=14$', '$2x+6=14$', '$4x+6=14$'], correct: 2 },
            { q: '$3(x-4)=$', options: ['$3x-12$', '$3x-4$', '$x-12$'], correct: 0 },
          ],
        },
        predictPrompt: 'في $2x + 3 = 7$ ضربتَ الطرفين في $2$ . ماذا يحدث للحدّ $3$ ؟ اكتب ما يجب فعله بكل حدود الطرف.',
        summary: 'الضرب أو القسمة يشملان كل حدود الطرف؛ ويكفي حدّ واحد منسيّ ليفسد النتيجة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.scale.rule}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.allTerms.right}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
