import MathText from '../../../../../common/components/MathText';
import { REMARKS, SITUATION } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont la DÉMARCHE du
 * manuel (قراءة → تحليل واختيار استراتيجية → تنفيذ) appliquée au téléphérique.
 *   masafa-fithaghuras  module 7 — le câble, hypoténuse du triangle AHB (Pythagore)
 *   mudda-sura          module 7 — durée = distance ÷ vitesse, puis minutes et secondes
 *   taklifa-khattiya    module 7 — le coût de la famille, fonction LINÉAIRE du prix adulte
 *   hadd-mizaniya       module 7 — le plus grand prix permis : intersection avec la ligne du budget, arrondi vers le bas
 *   tariqat-wadiya      module 7 — la démarche complète en trois étapes (les mots du manuel)
 * Les exemples chiffrés sont ceux de la PLATEFORME (autre téléphérique, autre famille) ; les
 * réponses du manuel (500√26 m, ≈ 7 min 43,55 s, 3,8x, 526 DA) ne sont dans aucun item : ce sont
 * celles de l'évaluation.
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'masafa-fithaghuras', type: 'methodes', title: 'طول الحبل بمبرهنة فيثاغورس', summary: 'الحبل وتر مثلث قائم ضلعاه المسافة الأفقية والفرق بين الارتفاعين، فمربّع طوله يساوي مجموع مربّعي الضلعين.',
      memo: {
        rule: `AB^2=AH^2+${R('BH^2')}`,
        hook: 'الحبل وتر والضلعان أفقي وفرق ارتفاعين',
        example: `AB^2=1200^2+${R('500^2')}=1690000`,
        trap: 'الضلعان والوتر لا تُجمع أطوالها',
        exam: 'سمِّ المثلث القائم ثم اكتب مبرهنة فيثاغورس',
        chip: `AB^2=AH^2+BH^2`,
        quiz: [
          { q: 'مثلث قائم ضلعاه $3$ و $4$. وتره:', options: ['$5$', '$7$', '$25$'], correct: 0 },
          { q: '$AH=1200$ و $BH=500$. طول الحبل $AB$:', options: ['$1300$', '$1700$', '$1690000$'], correct: 0 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.hatab}</MathText></li>
            <li><MathText>{REMARKS.pythagore}</MathText></li>
          </ul>
        ) },
      { id: 'mudda-sura', type: 'methodes', title: 'المدة من المسافة والسرعة', summary: 'المدة تساوي المسافة مقسومة على السرعة بوحدات متوافقة، ثم نكتب الثواني دقائق وثواني.',
      memo: {
        rule: `t=\\dfrac{${R('d')}}{${R('v')}}`,
        hook: 'اقسم المسافة على السرعة ثم حوّل',
        example: `\\dfrac{1300}{5}=${R('260')}\\,\\mathrm{s}`,
        trap: 'الدقيقة ستون ثانية لا مئة',
        exam: 'وحّد الوحدات ثم اكتب المدة بالدقائق والثواني',
        chip: `t=\\tfrac{d}{v}`,
        quiz: [
          { q: 'حبل طوله $1300\\,\\mathrm{m}$ وسرعة $5\\,\\mathrm{m/s}$. المدة:', options: ['$260\\,\\mathrm{s}$', '$6500\\,\\mathrm{s}$', '$0{,}004\\,\\mathrm{s}$'], correct: 0 },
          { q: '$260\\,\\mathrm{s}$ تساوي:', options: ['4 دقائق و 20 ثانية', '2 دقيقة و 60 ثانية', '2,6 دقيقة'], correct: 0 },
        ],
      },
        body: <p><MathText>{REMARKS.mudda}</MathText></p> },
      { id: 'taklifa-khattiya', type: 'regles', title: 'التكلفة دالة خطية للسعر', summary: 'كل بالغ يدفع السعر وكل طفل يدفع جزءا ثابتا منه، فالتكلفة الكلية عدد ثابت مضروب في السعر: دالة خطية.',
      memo: {
        rule: `C(x)=${R('3')}x`,
        hook: 'كل ما يدفعه الأفراد مضروب في السعر',
        example: `2x+2\\times0{,}5x=${R('3')}x`,
        trap: 'التخفيض هو ما يُطرح لا ما يدفعه الطفل',
        exam: 'اجمع ما يدفعه كل فرد ثم اختزل العبارة',
        chip: `C(x)=${R('a')}x`,
        quiz: [
          { q: 'طفل بتخفيض $50\\%$ على سعر $x$ يدفع:', options: ['$0{,}5x$', '$x-50$', '$0{,}5$'], correct: 0 },
          { q: 'بالغان وطفلان بنصف السعر: التكلفة بدلالة $x$:', options: ['$3x$', '$4x$', '$2x$'], correct: 0 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.tifl}</MathText></li>
            <li><MathText>{REMARKS.taklifa}</MathText></li>
          </ul>
        ) },
      { id: 'hadd-mizaniya', type: 'methodes', title: 'أكبر سعر في حدود الميزانية', summary: 'نقرأ فاصلة نقطة تقاطع مستقيم التكلفة مع خط الميزانية أو نقسم الميزانية على المعامل، ثم ندوّر نحو الأسفل حتى لا نتجاوزها.',
      memo: {
        rule: `x\\leq\\dfrac{${R('B')}}{${R('a')}}`,
        hook: 'اقسم الميزانية على المعامل وقرّب نحو الأسفل',
        example: `\\dfrac{1600}{3}\\approx533{,}3\\Rightarrow${R('533')}`,
        trap: 'التقريب نحو الأعلى يتجاوز الميزانية',
        exam: 'اكتب الشرط ثم القسمة ثم التدوير نحو الأسفل بعبارة',
        chip: `x\\leq\\tfrac{B}{a}`,
        quiz: [
          { q: '$C(x)=3x$ وميزانية $1500$. أكبر سعر:', options: ['$500$', '$450$', '$4500$'], correct: 0 },
          { q: '$C(x)=3x$ وميزانية $1600$. أكبر سعر صحيح:', options: ['$533$', '$534$', '$4800$'], correct: 0 },
        ],
      },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li><MathText>{REMARKS.mizaniya}</MathText></li>
            <li><MathText>{REMARKS.tadwirRight}</MathText></li>
          </ul>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من النص إلى الجواب', summary: 'نقرأ الوضعية ونحدد المهام والمتغير، نختار الموارد المناسبة لكل جزء، ثم ننفّذ ونفسّر النتيجة بوحدتها.',
      memo: {
        rule: `x\\to C(x)\\to${R('x_{\\max}')}`,
        hook: 'افهم · اختر · نفّذ · فسّر',
        example: `x\\to3x\\to${R('533')}`,
        trap: 'الجواب بلا وحدة أو بلا تفسير ناقص',
        exam: 'اكتب المتغير ثم الأدوات ثم الجواب بجملة ووحدته',
        chip: `x\\to C(x)\\to x_{\\max}`,
        quiz: [
          { q: 'أول خطوة في حل وضعية:', options: ['قراءة المطلوب وتحديد المتغير', 'الحساب مباشرة', 'كتابة الجواب'], correct: 0 },
          { q: 'نختم الحل بـ:', options: ['جملة جواب بوحدتها', 'عدد وحده', 'رسم فقط'], correct: 0 },
        ],
      },
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {SITUATION.analysis.map((a) => <li key={a.label}><strong>{a.label}</strong>: <MathText>{a.text}</MathText></li>)}
          </ol>
        ) },
    ],
  },
};
