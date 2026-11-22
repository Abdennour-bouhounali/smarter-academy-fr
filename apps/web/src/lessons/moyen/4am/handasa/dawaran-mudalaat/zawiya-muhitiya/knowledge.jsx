import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, ACTIVITY_LINES, KNOW4, METHOD } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE dans la règle s'écrit en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس « الزاوية المحيطية والزاوية المركزية والعلاقة بينهما » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 4)   tasmiya — la زاوية مركزية et la زاوية محيطية qui « تحصران نفس القوس » (les mots du نشاط 4) ;
 *                       alaqa-nashat — AOB = 2 ADB : prouvé pour un diamètre (مزيان), vrai pour deux cordes quelconques (هوارية) ;
 *   module 2 (معارف 4)  tarif (les deux définitions), khassiya-nisf (خاصية 1), khassiya-tasawi (خاصية 2) ;
 *   module 3 (طريقة)    tariqa-qaws (trouver un angle par l'arc — plateforme, déclaré), qutr-qaima (le cas du diamètre).
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tasmiya', type: 'concepts', title: 'زاوية مركزية وزاوية محيطية',
        memo: {
          rule: `\\widehat{A${R('O')}B}\\ ;\\ \\widehat{A${R('D')}B}`,
          hook: 'الرأس يحدّد النوع',
          example: `\\widehat{A${R('O')}B}=100^{\\circ}`,
          trap: 'تسمية زاوية رأسها داخل الدائرة محيطية',
          exam: 'اذكر رأس الزاوية ثم القوس الذي تحصره',
          chip: `\\widehat{AOB}\\ ;\\ \\widehat{ADB}`,
          quiz: [
            { q: 'زاوية رأسها مركز الدائرة تسمى:', options: ['مركزية', 'محيطية', 'مستقيمة'], correct: 0 },
            { q: 'الزاوية المحيطية رأسها:', options: ['نقطة من الدائرة', 'مركز الدائرة', 'نقطة داخل الدائرة'], correct: 0 },
          ],
        },
        // Deux NOMS (« زاوية مركزية », « زاوية محيطية », « تحصران نفس القوس ») : un nom ne se devine pas, et la boîte du نشاط 4
        // juste au-dessus de la brique les donne déjà (« تسمى زاوية مركزية »).
        predict: false,
        summary: 'الزاوية AOB رأسها مركز الدائرة: زاوية مركزية. الزاوية ADB رأسها D من الدائرة وضلعاها وتران: زاوية محيطية. نقول إنهما تحصران نفس القوس AB.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{ACTIVITY.naming}</MathText></p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
      {
        id: 'alaqa-nashat', type: 'regles', title: 'المركزية ضعف المحيطية',
        memo: {
          rule: `\\widehat{AOB}=${R('2')}\\,\\widehat{ADB}`,
          hook: 'المركزية ضعف المحيطية',
          example: `\\widehat{AOB}=${R('2')}\\times 50^{\\circ}=100^{\\circ}`,
          trap: 'ظنّ أن العلاقة تخصّ القطر وحده',
          exam: 'اكتب أن للزاويتين القوس نفسه ثم العلاقة بينهما',
          chip: `\\widehat{AOB}=2\\widehat{ADB}`,
          quiz: [
            { q: 'زاوية محيطية $35^\\circ$. المركزية التي تحصر القوس نفسه:', options: ['$70^\\circ$', '$35^\\circ$', '$17{,}5^\\circ$'], correct: 0 },
            { q: 'تبقى العلاقة صحيحة إذا غيّرنا موضع $D$ على:', options: ['القوس الكبير', 'أيّ نقطة داخل الدائرة', 'المستقيم $(AB)$'], correct: 0 },
          ],
        },
        predictPrompt: 'في اللوحة كانت $\\widehat{AOB} = 100^\\circ$ ، ووضعت D طرفًا للقطر ثم في مواضع أخرى من القوس الكبير وقست $\\widehat{ADB}$ في كل مرة. هل تبقى علاقة مزيان صحيحة عندما لا يكون [AD] قطرًا؟ اكتب بكلماتك القاعدة التي تربط $\\widehat{AOB}$ بـ $\\widehat{ADB}$ .',
        summary: 'قول مزيان صحيح: إذا كان [AD] قطرا فإن AOB ضعف ADB؛ وهوارية على صواب: تبقى العلاقة صحيحة مهما كان موضع D على الدائرة خارج القوس الملونة.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{ACTIVITY_LINES.deduce}</MathText></p>
            <p><MathText>{ACTIVITY.closing}</MathText></p>
            <SourceTag source={ACTIVITY_LINES.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tarif', type: 'concepts', title: 'تعريف الزاويتين',
        memo: {
          rule: `\\widehat{A${R('O')}B}\\ ,\\ \\widehat{A${R('D')}B}\\ ,\\ D\\in(\\mathcal{C})`,
          hook: 'مركزية رأسها المركز',
          example: `D\\in(\\mathcal{C})\\Rightarrow\\widehat{A${R('D')}B}`,
          trap: 'الخلط بين رأس المركزية ورأس المحيطية',
          exam: 'اكتب رأس الزاوية ثم اسمها',
          chip: `D\\in(\\mathcal{C})`,
          quiz: [
            { q: 'ضلعا الزاوية المحيطية:', options: ['وتران في الدائرة', 'نصفا قطرين', 'مماسان'], correct: 0 },
            { q: 'رأس الزاوية المركزية:', options: ['مركز الدائرة', 'نقطة من الدائرة', 'نقطة خارجها'], correct: 0 },
          ],
        },
        summary: 'الزاوية المركزية في دائرة رأسها المركز O؛ والزاوية المحيطية رأسها ينتمي إلى الدائرة وضلعاها يقطعان الدائرة.',
        body: (
          <div className="space-y-1.5">
            <p>{KNOW4.definitionIntro}</p>
            <ul className="list-disc space-y-0.5 ps-5">
              <li>{KNOW4.central}</li>
              <li>{KNOW4.inscribed}</li>
            </ul>
            <SourceTag source={KNOW4.source} />
          </div>
        ),
      },
      {
        id: 'khassiya-nisf', type: 'regles', title: 'المحيطية نصف المركزية',
        memo: {
          rule: `\\widehat{ADB}=\\dfrac{\\widehat{AOB}}{${R('2')}}`,
          hook: 'المحيطية نصف المركزية',
          example: `\\widehat{ADB}=\\dfrac{80^{\\circ}}{${R('2')}}=40^{\\circ}`,
          trap: 'مضاعفة الزاوية المركزية بدل تنصيفها',
          exam: 'اكتب أن الزاويتين تحصران القوس نفسه',
          chip: `\\tfrac{\\widehat{AOB}}{2}`,
          quiz: [
            { q: 'زاوية مركزية $120^\\circ$. المحيطية التي تحصر القوس نفسه:', options: ['$60^\\circ$', '$240^\\circ$', '$120^\\circ$'], correct: 0 },
            { q: 'زاوية محيطية $25^\\circ$. المركزية التي تحصر القوس نفسه:', options: ['$50^\\circ$', '$12{,}5^\\circ$', '$25^\\circ$'], correct: 0 },
          ],
        },
        summary: 'قيس الزاوية المحيطية في دائرة هو نصف قيس الزاوية المركزية التي تحصر معها نفس القوس.',
        body: (
          <div className="space-y-1.5">
            <p>{KNOW4.property1}</p>
            <p><MathText>{KNOW4.example2}</MathText></p>
            <SourceTag source={KNOW4.source} />
          </div>
        ),
      },
      {
        id: 'khassiya-tasawi', type: 'regles', title: 'محيطيتان تحصران نفس القوس',
        memo: {
          rule: `\\widehat{ADB}=\\widehat{AEB}`,
          hook: 'القوس نفسه القيس نفسه',
          example: `\\widehat{ADB}=\\widehat{AEB}=${R('40^{\\circ}')}`,
          trap: 'ظنّ أن الأقرب من القوس أكبر',
          exam: 'اكتب أن الزاويتين محيطيتان وتحصران القوس نفسه',
          chip: `\\widehat{ADB}=\\widehat{AEB}`,
          quiz: [
            { q: 'محيطيتان تحصران القوس نفسه، إحداهما $50^\\circ$. الأخرى:', options: ['$50^\\circ$', '$100^\\circ$', '$25^\\circ$'], correct: 0 },
            { q: 'نقل الرأس على القوس الكبير يجعل زاوية التسديد:', options: ['ثابتة', 'أكبر', 'أصغر'], correct: 0 },
          ],
        },
        predictPrompt: 'في اللوحة حرّكت D على القوس الكبير وقست $\\widehat{ADB}$ في عدّة مواضع، وفي السؤال السابق وجدت $\\widehat{AMB} = 40^\\circ$ . لو أخذنا نقطة أخرى N من نفس القوس، ماذا تتوقّع لقيس $\\widehat{ANB}$ ؟ اكتب القاعدة بكلماتك لزاويتين محيطيتين تحصران نفس القوس.',
        summary: 'إذا كانت زاويتان محيطيتان في دائرة تحصران القوس نفسه فهما متقايستان.',
        body: (
          <div className="space-y-1.5">
            <p>{KNOW4.property2}</p>
            <p><MathText>{KNOW4.example3}</MathText></p>
            <SourceTag source={KNOW4.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqa-qaws', type: 'methodes', title: 'من القوس إلى الزاوية',
        memo: {
          rule: `\\widehat{AOB}=2\\times ${R('\\widehat{ADB}')}`,
          hook: 'القوس يربط الزاويتين',
          example: `\\widehat{AOB}=100^{\\circ}\\Rightarrow\\widehat{ADB}=${R('50^{\\circ}')}`,
          trap: 'استعمال زاوية لا تحصر القوس نفسه',
          exam: 'اكتب القوس المحصور ثم الزاوية المعلومة ثم الخاصية',
          chip: `\\tfrac{\\widehat{AOB}}{2}`,
          quiz: [
            { q: 'أول خطوة لحساب زاوية في دائرة:', options: ['تحديد القوس الذي تحصره', 'قسمة $180$ على $2$', 'قياسها بالمنقلة'], correct: 0 },
            { q: 'المركزية $90^\\circ$ والمحيطية تحصر القوس نفسه، قيسها:', options: ['$45^\\circ$', '$180^\\circ$', '$90^\\circ$'], correct: 0 },
          ],
        },
        predictPrompt: 'في مثال العجلة وجدت $\\widehat{PCQ}$ ثم $\\widehat{PKQ}$ انطلاقًا من $\\widehat{POQ} = 130^\\circ$ . لو أعطيناك زاوية أخرى في دائرة، بأيّ خطوات تبدأ لتجد قيسها؟ اكتب الطريقة مرتّبة.',
        summary: 'أحدد رأس الزاوية (مركزية أو محيطية أو غير ذلك)، ثم القوس الذي تحصره، ثم زاوية معلومة تحصر نفس القوس: المحيطية نصف المركزية، والمحيطيتان متقايستان.',
        body: (
          <div className="space-y-1.5">
            <ol className="list-decimal space-y-0.5 ps-5">{METHOD.steps.map((l) => <li key={l}>{l}</li>)}</ol>
            <SourceTag source={METHOD.source} />
          </div>
        ),
      },
      {
        id: 'qutr-qaima', type: 'regles', title: 'حالة القطر',
        memo: {
          rule: `\\widehat{BAC}=${R('90^{\\circ}')}`,
          hook: 'القطر يحصر زاوية قائمة',
          example: `\\widehat{BOC}=180^{\\circ}\\Rightarrow\\widehat{BAC}=${R('90^{\\circ}')}`,
          trap: 'ظنّ أن الزاوية على القطر $180^\\circ$',
          exam: 'اكتب أن القطعة قطر ثم أن المثلث قائم',
          chip: `\\tfrac{180^{\\circ}}{2}=90^{\\circ}`,
          quiz: [
            { q: '$[BC]$ قطر و $A$ نقطة من الدائرة. المثلث $ABC$:', options: ['قائم في $A$', 'متقايس الأضلاع', 'قائم في $B$'], correct: 0 },
            { q: 'كل زاوية محيطية تحصر نصف دائرة قيسها:', options: ['$90^\\circ$', '$180^\\circ$', '$45^\\circ$'], correct: 0 },
          ],
        },
        predictPrompt: 'على الشكل [BC] قطر و A نقطة من الدائرة. ما الزاوية التي رأسها المركز O وضلعاها [OB] و [OC]؟ وماذا تستنتج عن قيس $\\widehat{BAC}$ ؟ اكتب القاعدة بكلماتك.',
        summary: 'إذا كان [BC] قطرا فالزاوية BOC مستقيمة قيسها 180 درجة، وكل زاوية محيطية BAC تحصر نصف الدائرة قيسها 90 درجة.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD.diameter}</MathText></p>
            <SourceTag source={METHOD.source} />
          </div>
        ),
      },
    ],
  },
};
