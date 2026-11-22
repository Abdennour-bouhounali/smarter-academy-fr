import MathText from '../../../../../common/components/MathText';
import SpaceFigure from '../../../../../common/components/SpaceFigure';
import { SourceTag } from '../../../../../common/textbook';
import { ARCHIMEDES, ARCH_LINES, KNOW2, QIMA, METHOD, METHOD_INVERSE } from './content/textbook';
import { FIG_KNOW2 } from './content/figures';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « مساحة الكرة وحجم الجلة » — SOURCE UNIQUE.
 *
 *   module 1 (أرخميدس)  arkhimidis-misaha — la peau couvre 4 grands disques = l'aire latérale du cylindre ;
 *                       arkhimidis-hajm — le jus remplit les 2/3 du cylindre de hauteur 2R ;
 *   module 2 (معارف 2)   misahat-kura (𝒜 = 4πR²), hajm-julla (𝒱 = 4/3·πR³), qima-muqarraba (valeur exacte en π, arrondi au
 *                       mm² / mm³ — la règle que l'exemple applique, déclarée `knowledge_formalization`) ;
 *   module 3 (طرائق)     tariqa-hisab (du diamètre à la valeur arrondie), tariqa-aksiya (de l'aire au rayon) — déclarées.
 */
const Body = ({ lines, source, children }) => (
  <div className="space-y-1.5">
    {lines.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
    {children}
    <SourceTag source={source} />
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'arkhimidis-misaha', type: 'concepts', title: 'القشرة: أربعة أقراص كبرى',
        memo: {
          rule: '\\mathcal{A}=\\textcolor{#e11d48}{4}\\times\\pi R^2',
          hook: 'القشرة أربعة أقراص',
          example: 'R=3:\\ 4\\times9\\pi=36\\pi',
          trap: 'القشرة ليست قرصين ولا ثلاثة بل أربعة',
          exam: 'قارن مساحة القشرة بمساحة القرص الكبير',
          chip: '4\\times\\pi R^2',
          quiz: [
            { q: 'قشرة كرة تغطي تماما عدد الأقراص الكبرى التالي:', options: ['$4$', '$2$', '$3$'], correct: 0 },
            { q: 'قرص كبير نصف قطره $3$ مساحته:', options: ['$9\\pi$', '$6\\pi$', '$3\\pi$'], correct: 0 },
          ],
        },
        predictPrompt: 'قشّرت البرتقالة بأنصاف أقطار مختلفة، وفردت قشرتها في أقراص نصف قطر كل منها $R$ ، ثم حسبت المساحة الجانبية للكأس $2\\pi R \\times 2R$ . ماذا يبقى ثابتا مهما كان $R$؟ اكتب بكلماتك مساحة قشرة كرة نصف قطرها $R$ بدلالة مساحة قرص نصف قطره $R$ ، وقارنها بالمساحة الجانبية للكأس.',
        summary: 'قشرة كرة نصف قطرها R تغطي تماما أربعة أقراص نصف قطر كل منها R: مساحة الكرة تساوي المساحة الجانبية للأسطوانة التي تحيط بها.',
        body: <Body lines={[ARCH_LINES.lateral, ARCH_LINES.areaEqual]} source={ARCHIMEDES.source} />,
      },
      {
        id: 'arkhimidis-hajm', type: 'concepts', title: 'العصير: ثلثا الأسطوانة',
        memo: {
          rule: '\\mathcal{V}=\\dfrac{2}{3}\\times\\textcolor{#e11d48}{2\\pi R^3}',
          hook: 'العصير ثلثا الكأس',
          example: 'R=3:\\ \\dfrac{2}{3}\\times54\\pi=36\\pi',
          trap: 'ثلاثة أرباع ليس ثلثين',
          exam: 'قارن الجلة بالأسطوانة التي تحيط بها',
          chip: '\\tfrac{2}{3}V_{cyl}',
          quiz: [
            { q: 'حجم الجلة بالنسبة إلى الأسطوانة التي تحيط بها:', options: ['ثلثاها', 'نصفها', 'ثلاثة أرباعها'], correct: 0 },
            { q: 'أسطوانة نصف قطرها $3$ وارتفاعها $6$ حجمها:', options: ['$54\\pi$', '$18\\pi$', '$36\\pi$'], correct: 0 },
          ],
        },
        predictPrompt: 'عصرت البرتقالة في الكأس التي نصف قطرها $R$ وارتفاعها $2R$ ، ووضعت علامة حيث يتوقّف العصير، وحجم هذه الكأس $2\\pi R^3$ . أيّ جزء من الكأس يملؤه عصير الجلة مهما كان $R$؟ اكتب بكلماتك العلاقة بين حجم الجلة وحجم الكأس، ثم حجم الجلة بدلالة $R$ .',
        summary: 'عصير جلة نصف قطرها R يملأ ثلثي الأسطوانة التي نصف قطرها R وارتفاعها ضعف R: حجم الجلة ثلثا حجم هذه الأسطوانة.',
        body: <Body lines={[ARCH_LINES.volume, ARCH_LINES.volumeTwoThirds]} source={ARCHIMEDES.source} />,
      },
    ],
    2: [
      {
        id: 'misahat-kura', type: 'concepts', title: 'مساحة الكرة',
        memo: {
          rule: '\\mathcal{A}=4\\pi\\textcolor{#e11d48}{R^2}',
          hook: 'أربعة باي مربع',
          example: 'R=3:\\ \\mathcal{A}=36\\pi',
          trap: 'ضرب R في أربعة دون تربيعه',
          exam: 'اكتب القيمة المضبوطة ثم المدورة',
          chip: '4\\pi R^2',
          quiz: [
            { q: 'مساحة كرة نصف قطرها $5$ :', options: ['$100\\pi$', '$20\\pi$', '$25\\pi$'], correct: 0 },
            { q: 'إذا ضوعف نصف القطر فالمساحة تُضرب في:', options: ['$4$', '$2$', '$8$'], correct: 0 },
          ],
        },
        summary: 'مساحة الكرة التي مركزها O ونصف قطرها R هي جداء العدد 4 والعدد π ومربع نصف القطر.',
        body: <Body lines={[KNOW2.area]} source={KNOW2.source}><SpaceFigure {...FIG_KNOW2} /></Body>,
      },
      {
        id: 'hajm-julla', type: 'concepts', title: 'حجم الجلة',
        memo: {
          rule: '\\mathcal{V}=\\dfrac{4}{3}\\pi\\textcolor{#e11d48}{R^3}',
          hook: 'أربعة أثلاث باي مكعب',
          example: 'R=3:\\ \\dfrac{4}{3}\\pi\\times27=36\\pi',
          trap: 'الخلط بين مربع نصف القطر ومكعبه',
          exam: 'اكتب الوحدة: السنتيمتر المكعب',
          chip: '\\tfrac{4}{3}\\pi R^3',
          quiz: [
            { q: 'حجم جلة نصف قطرها $3$ :', options: ['$36\\pi$', '$12\\pi$', '$108\\pi$'], correct: 0 },
            { q: 'إذا ضوعف نصف القطر فالحجم يُضرب في:', options: ['$8$', '$2$', '$4$'], correct: 0 },
          ],
        },
        summary: 'حجم الجلة التي مركزها O ونصف قطرها R هو جداء أربعة أثلاث والعدد π ومكعب نصف القطر.',
        body: <Body lines={[KNOW2.volume]} source={KNOW2.source} />,
      },
      {
        id: 'qima-muqarraba', type: 'regles', title: 'القيمة المضبوطة والمدوّرة',
        memo: {
          rule: '\\mathcal{A}=\\textcolor{#e11d48}{7{,}84\\pi}\\approx24{,}63',
          hook: 'المضبوطة بباي والتدوير في الأخير',
          example: '4\\pi(1{,}4)^2=7{,}84\\pi\\approx24{,}63',
          trap: 'التدوير في وسط الحساب',
          exam: 'اكتب القيمة المضبوطة ثم قيمتها المدورة',
          chip: '7{,}84\\pi\\approx24{,}63',
          quiz: [
            { q: 'التدوير إلى المليمتر المربع يعني كم رقما بعد الفاصلة بالسنتيمتر المربع؟', options: ['رقمان', 'رقم واحد', 'ثلاثة أرقام'], correct: 0 },
            { q: 'متى ندوّر العدد؟', options: ['في آخر الحساب', 'في كل خطوة', 'قبل التعويض'], correct: 0 },
          ],
        },
        predictPrompt: 'في مثال الكتاب كُتبت المساحة $7{,}84\\pi$ ثم $24{,}63\\,\\mathrm{cm}^2$ «بالتدوير إلى $1\\,\\mathrm{mm}^2$»، والحجم $11{,}494\\,\\mathrm{cm}^3$ «بالتدوير إلى $1\\,\\mathrm{mm}^3$». متى نُبقي $\\pi$ ومتى نعوّضه بقيمة مقرّبة؟ وكم رقما نترك بعد الفاصلة في كل حالة، ولماذا؟ اكتب القاعدة.',
        summary: 'القيمة المضبوطة تُكتب بدلالة π، وندوّر في آخر الحساب: إلى المليمتر المربع رقمان بعد الفاصلة بالسنتيمتر المربع، وإلى المليمتر المكعب ثلاثة أرقام بالسنتيمتر المكعب.',
        body: <Body lines={[QIMA.exact, QIMA.rounding]} source={QIMA.source} />,
      },
    ],
    3: [
      {
        id: 'tariqa-hisab', type: 'methodes', title: 'من القطر إلى المساحة والحجم',
        memo: {
          rule: 'R=\\dfrac{d}{2}\\ \\Rightarrow\\ 4\\pi\\textcolor{#e11d48}{R^2}',
          hook: 'القطر على اثنين أولا',
          example: 'd=6\\Rightarrow R=3\\Rightarrow36\\pi',
          trap: 'وضع القطر في القانون مباشرة',
          exam: 'اكتب نصف القطر قبل التعويض',
          chip: 'R=\\tfrac{d}{2}',
          quiz: [
            { q: 'قطر كرة $10$ ، مساحتها:', options: ['$100\\pi$', '$400\\pi$', '$25\\pi$'], correct: 0 },
            { q: 'أول خطوة حين يُعطى القطر:', options: ['قسمته على $2$', 'تربيعه', 'ضربه في $\\pi$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المثال انطلقت من كرة قطرها $8\\,\\mathrm{cm}$ ووصلت إلى $64\\pi$ ثم إلى $201{,}1$ . لو أعطيناك كرة أخرى لا تعرف إلا قطرها، بأيّ خطوات تحسب مساحتها وحجم جلتها، وفي أيّ لحظة تدوّر؟ اكتب الطريقة.',
        summary: 'نقسم القطر على 2 لنحصل على نصف القطر، نعوّض في القانون ونكتب القيمة المضبوطة بدلالة π، ثم ندوّر في آخر الحساب إن طُلبت قيمة مقرّبة.',
        body: <Body lines={[METHOD.rule]} source={METHOD.source} />,
      },
      {
        id: 'tariqa-aksiya', type: 'methodes', title: 'من المساحة إلى نصف القطر',
        memo: {
          rule: 'R^2=\\dfrac{k}{4}\\ \\Rightarrow\\ R=\\sqrt{\\dfrac{k}{4}}',
          hook: 'ربع k ثم الجذر',
          example: '\\mathcal{A}=36\\pi\\Rightarrow R^2=9\\Rightarrow R=3',
          trap: 'الجذر قبل القسمة على أربعة',
          exam: 'اذكر أن نصف القطر عدد موجب',
          chip: 'R^2=\\tfrac{k}{4}',
          quiz: [
            { q: 'مساحة كرة $64\\pi$ ، قيمة $R^2$ :', options: ['$16$', '$64$', '$256$'], correct: 0 },
            { q: 'مساحة كرة $100\\pi$ ، نصف قطرها:', options: ['$5$', '$25$', '$10$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المثال كانت مساحة الكرة $100\\pi\\,\\mathrm{cm}^2$ ووجدت نصف قطرها. لو أعطيناك مساحة كرة أخرى مكتوبة $k\\pi$ ، بأيّ خطوات تجد نصف قطرها؟ اكتب الطريقة.',
        summary: 'إذا كانت مساحة الكرة العدد k مضروبا في π فإن مربع نصف القطر هو ربع k، ونصف القطر هو جذره التربيعي الموجب.',
        body: <Body lines={[METHOD_INVERSE.rule]} source={METHOD_INVERSE.source} />,
      },
    ],
  },
};
