import MathText from '../../../../../common/components/MathText';
import GeoFigure from '../../../../../common/components/GeoFigure';
import { ACT3, KNOW4, KNOW5, KNOW6, METHOD, REMARKS } from './content/textbook';
import { FIG_KNOW5, FIG_KNOW6 } from './content/figures';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Ce que le درس 3 établit, au mot près du manuel (content/textbook.js), posé au moment où les modules le font vivre :
 *   tarkib-insihabayn  module 1 — deux translations successives = une seule (نشاط 3, la phrase « after » du manuel)
 *   alaqat-shal        module 2 — معارف 4 : AB + BC = AC, la fin du premier est l'origine du second
 *   shuaa-maadum       module 2 — معارف 4 (حالة خاصة) : AA = BB = 0
 *   mutaakisan         module 2 — معارف 5 : AB et BA opposés, BA = −AB
 *   qaidat-mutawazi    module 2 — معارف 6 : AB + AC = AD ⇔ ABDC parallélogramme (D symétrique de A / milieu de [BC])
 *   insha-mumaththil   module 3 — طرائق p. 133 : Chasles OU la règle du parallélogramme pour construire la somme
 * Les réponses du « إختبار أولي » (EG, MP, AE, 5, l'opposé de TR) ne sont dans aucun item.
 */
const Lines = ({ lines }) => (
  <ul className="list-disc ms-5 space-y-1">{lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>
);

/** La partie qui CHANGE dans une fiche de mémoire, en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      { id: 'tarkib-insihabayn', type: 'concepts', title: 'انسحابان متتابعان',
        memo: {
          rule: `\\overrightarrow{AB}+\\overrightarrow{BC}=${R('\\overrightarrow{AC}')}`,
          hook: 'انسحابان متتابعان = انسحاب واحد',
          example: `M\\xrightarrow{\\overrightarrow{AB}}M_1\\xrightarrow{\\overrightarrow{BC}}M_2\\ :\\ \\overrightarrow{MM_2}=${R('\\overrightarrow{AC}')}`,
          trap: 'لا نجمع الطولين: نجمع الشعاعين',
          exam: 'اكتب الشعاع الذي يعطي الانسحاب الواحد',
          chip: `\\overrightarrow{AB}{+}\\overrightarrow{BC}{=}${R('\\overrightarrow{AC}')}`,
          quiz: [
            { q: 'الانسحاب الذي شعاعه $\\overrightarrow{AB}$ متبوعًا بالذي شعاعه $\\overrightarrow{BC}$ هو الانسحاب الذي شعاعه:', options: ['$\\overrightarrow{BA}$', '$\\overrightarrow{AC}$', '$\\overrightarrow{CA}$'], correct: 1 },
            { q: 'إذا كان $\\overrightarrow{MM_1}$ = $\\overrightarrow{AB}$ و $\\overrightarrow{M_1M_2}$ = $\\overrightarrow{BC}$ فإنّ $\\overrightarrow{MM_2}$ =', options: ['$\\overrightarrow{AC}$', '$\\overrightarrow{BC}$', '$\\overrightarrow{CA}$'], correct: 0 },
          ],
        },
        predictPrompt: 'على المرصوفة نقلتَ $M$ إلى $M\'$ بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ ، ثم $M\'$ إلى $M\'\'$ بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ . ماذا يفعل هذان الانسحابان المتتابعان بأيّ نقطة أخرى؟ اكتب القاعدة بكلماتك، واذكر الشعاع الذي يعوّضهما.',
        summary: 'الانسحاب الذي شعاعه AB متبوعا بالانسحاب الذي شعاعه BC هو انسحاب واحد شعاعه AC: صورة نقطة بالأول ثم بالثاني هي صورتها بهذا الانسحاب.',
        body: <Lines lines={[ACT3.after]} /> },
    ],
    2: [
      { id: 'alaqat-shal', type: 'regles', title: 'علاقة شال',
        memo: {
          rule: `\\overrightarrow{AB}+\\overrightarrow{BC}=${R('\\overrightarrow{AC}')}`,
          hook: 'المجموع من البداية إلى النهاية',
          example: `\\overrightarrow{AB}+\\overrightarrow{BC}=${R('\\overrightarrow{AC}')},\\ AC\\leq AB+BC`,
          trap: 'طول المجموع ليس مجموع الطولين عند المنعطف',
          exam: 'اكتب علاقة شال ثم المجموع',
          chip: `\\overrightarrow{AB}{+}\\overrightarrow{BC}{=}${R('\\overrightarrow{AC}')}`,
          quiz: [
            { q: 'في مشوار فيه منعطف، تقارن $AC$ بـ $AB+BC$ :', options: ['$AC>AB+BC$', '$AC=AB+BC$', '$AC<AB+BC$'], correct: 2 },
            { q: '$\\overrightarrow{AB}$ + $\\overrightarrow{BC}$ شعاع مبدؤه ونهايته:', options: ['$A$ و $C$', '$B$ و $C$', '$A$ و $B$'], correct: 0 },
          ],
        }, summary: 'مجموع الشعاعين AB و BC هو الشعاع AC، وتسمى هذه المساواة علاقة شال: نهاية الشعاع الأول هي مبدأ الشعاع الثاني.',
        body: <Lines lines={[KNOW4.sum, REMARKS.chainEnd]} /> },
      { id: 'shuaa-maadum', type: 'concepts', title: 'الشعاع المعدوم',
        memo: {
          rule: `\\overrightarrow{AA}=${R('\\overrightarrow{0}')}`,
          hook: 'لا حركة: شعاع معدوم',
          example: `\\overrightarrow{AB}+\\overrightarrow{BA}=\\overrightarrow{AA}=${R('\\overrightarrow{0}')}`,
          trap: 'الشعاع المعدوم يُكتب بسهم فوق الصفر',
          exam: 'ارسم السهم فوق الصفر',
          chip: `\\overrightarrow{AA}=${R('\\vec{0}')}`,
          quiz: [
            { q: '$\\overrightarrow{BB}$ =', options: ['$\\overrightarrow{BA}$', '$\\overrightarrow{0}$', '$0$'], correct: 1 },
            { q: 'نكتب الشعاع المعدوم:', options: ['$0$', '$\\vec{0}$', '$\\vec{1}$'], correct: 1 },
          ],
        }, summary: 'إذا انطبقت A على B فإن الشعاع AB هو الشعاع المعدوم، ويرمز إليه بصفر فوقه سهم؛ الشعاعان AA و BB معدومان.',
        body: <Lines lines={[KNOW4.zero, REMARKS.zeroNumber]} /> },
      { id: 'mutaakisan', type: 'concepts', title: 'الشعاعان المتعاكسان',
        memo: {
          rule: `\\overrightarrow{BA}=${R('-\\overrightarrow{AB}')}`,
          hook: 'متعاكسان: المجموع معدوم',
          example: `\\overrightarrow{BA}=${R('-\\overrightarrow{AB}')}\\Rightarrow \\overrightarrow{AB}+\\overrightarrow{BA}=\\vec{0}`,
          trap: 'المتعاكسان لهما الطول نفسه واتجاهان مختلفان',
          exam: 'اكتب المعاكس بعلامة ناقص قبل الحذف',
          chip: `\\overrightarrow{BA}=${R('-\\overrightarrow{AB}')}`,
          quiz: [
            { q: 'الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ :', options: ['متعاكسان', 'متساويان', 'متعامدان'], correct: 0 },
            { q: '$\\overrightarrow{AB}$ + $\\overrightarrow{BA}$ =', options: ['$\\overrightarrow{AB}$', '$2\\overrightarrow{AB}$', '$\\overrightarrow{0}$'], correct: 2 },
          ],
        }, summary: 'مجموع AB و BA هو الشعاع المعدوم: الشعاعان متعاكسان، لهما نفس الطول ونفس المنحى واتجاهان متعاكسان، ونكتب BA يساوي ناقص AB.',
        body: (
          <div className="space-y-2">
            <Lines lines={[KNOW5.text, KNOW5.example]} />
            <GeoFigure {...FIG_KNOW5} />
          </div>
        ) },
      { id: 'qaidat-mutawazi', type: 'regles', title: 'قاعدة متوازي الأضلاع',
        memo: {
          rule: `\\overrightarrow{AB}+\\overrightarrow{AC}=${R('\\overrightarrow{AD}')}`,
          hook: 'المبدأ المشترك: القطر',
          example: `\\overrightarrow{AB}+\\overrightarrow{AC}=${R('\\overrightarrow{AD}')}\\iff ABDC`,
          trap: 'القطر هو المجموع لا الضلع',
          exam: 'سمِّ الرباعي بترتيب الدوران',
          chip: `\\overrightarrow{AB}{+}\\overrightarrow{AC}{=}${R('\\overrightarrow{AD}')}`,
          quiz: [
            { q: 'إذا كان لـ $\\overrightarrow{AB}$ و $\\overrightarrow{AC}$ المبدأ نفسه فمجموعهما $\\overrightarrow{AD}$ حيث:', options: ['$ABCD$ متوازي أضلاع', '$ABDC$ متوازي أضلاع', '$ADBC$ متوازي أضلاع'], correct: 1 },
            { q: 'نستعمل قاعدة متوازي الأضلاع حين يكون للشعاعين:', options: ['النهاية نفسها', 'الطول نفسه', 'المبدأ نفسه'], correct: 2 },
          ],
        },
        predictPrompt: 'سرعة السبّاح وسرعة التيار تنطلقان من نفس النقطة $A$ ، مثل $\\overrightarrow{AB}$ و $\\overrightarrow{AD}$ في نشاط 4. إذا كان لشعاعين نفس المبدأ، كيف تنشئ ممثلًا لمجموعهما دون أن تنقل أحدهما؟ اكتب القاعدة: أيّ رباعي تكمل، وأين يقع المجموع؟',
        summary: 'إذا كانت A و B و C ليست على استقامة: مجموع AB و AC هو AD معناه ABDC متوازي أضلاع، أي القطر الصادر من المبدأ المشترك A.',
        body: (
          <div className="space-y-2">
            <Lines lines={[KNOW6.property, KNOW6.remark]} />
            <GeoFigure {...FIG_KNOW6} />
          </div>
        ) },
    ],
    3: [
      { id: 'insha-mumaththil', type: 'methodes', title: METHOD.title,
        memo: {
          rule: `\\overrightarrow{AB}+\\overrightarrow{CD}=\\overrightarrow{AB}+${R('\\overrightarrow{BE}')}`,
          hook: 'انقل الثاني إلى نهاية الأول',
          example: `\\overrightarrow{AB}+\\overrightarrow{CD}=\\overrightarrow{AB}+${R('\\overrightarrow{BE}')}=\\overrightarrow{AE}`,
          trap: 'لا نجمع شعاعين دون التأكد أنهما متتابعان',
          exam: 'ارسم الممثّل الثاني من نهاية الأول',
          chip: `\\overrightarrow{CD}\\to${R('\\overrightarrow{BE}')}`,
          quiz: [
            { q: 'لإنشاء ممثّل $\\overrightarrow{AB}$ + $\\overrightarrow{CD}$ نرسم من $B$ ممثّلًا لـ:', options: ['$\\overrightarrow{CD}$', '$\\overrightarrow{DC}$', '$\\overrightarrow{AB}$'], correct: 0 },
            { q: 'ممثّل المجموع ينتهي في:', options: ['نهاية الممثّل الأول', 'منتصف الممثّلين', 'نهاية الممثّل الأخير'], correct: 2 },
          ],
        },
        predictPrompt: 'في التمرين المحلول نقلتَ $\\overrightarrow{AD}$ إلى النقطة $B$ قبل أن تجمعه مع $\\overrightarrow{AB}$ . لو أعطيناك شعاعين آخرين، متعاقبين أو لهما نفس المبدأ، بأيّ خطوات تنشئ ممثلًا لمجموعهما؟ اكتب الطريقة في الحالتين.',
        summary: 'لإنشاء ممثل لمجموع شعاعين نستعمل علاقة شال (ننقل الثاني إلى نهاية الأول بشعاع يساويه) أو قاعدة متوازي الأضلاع (شعاعان لهما نفس المبدأ).',
        body: <Lines lines={[METHOD.rule, METHOD.solution[2], METHOD.solution[3]]} /> },
    ],
  },
};
