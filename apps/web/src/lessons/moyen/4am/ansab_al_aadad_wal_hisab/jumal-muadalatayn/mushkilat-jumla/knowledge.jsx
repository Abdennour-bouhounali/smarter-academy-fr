import MathText from '../../../../../common/components/MathText';
import { STEPS, TRANSLATION_RULE, CHECK_RULE, ACTIVITY_SOLUTION } from './content/textbook';

// La carte de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** `R(x)` : ce qui CHANGE dans la règle d'une fiche `memo`, en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس 3 « حل مشكلات بتوظيف جمل معادلتين » — SOURCE UNIQUE, construite à partir de la manche 1 du labo (« نادي الرسم »),
 * du dossier de la coopérative et de la حصّالة (content/textbook.js, content/exercises.js ; rollout 2026-11-12 : nombres de la PLATEFORME).
 * Une <KnowledgeBrick id="…"> dans un module et la carte rendent le même objet. La carte est OUVERTE dès le départ : aucun nombre de la مسألة.
 *
 *   module 1  jumla-tarjama   ce que le laboratoire a fait : une information → une équation, une seule unité par équation (des objets, des dinars)
 *             khutuwat-hall   les cinq étapes de la méthode
 *   module 2  tahaqquq-nas    on vérifie dans l'HISTOIRE (pas seulement dans la jumla), la réponse a un sens (ce qui se compte est naturel), et on
 *                             répond par une phrase
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jumla-tarjama', type: 'concepts', title: 'ترجمة مشكلة بجملة معادلتين',
        memo: {
          rule: `\\begin{cases}${R('1')}x+${R('1')}y=N\\\\${R('p')}x+${R('q')}y=S\\end{cases}`,
          hook: 'وحدة واحدة في المعادلة',
          example: '\\begin{cases}x+y=12\\\\70x+20y=440\\end{cases}',
          trap: 'مساواة مبلغ بعدد أشياء',
          exam: 'اكتب المجهولين ثم معادلة لكل معلومة',
          chip: `x+y=N\\ ,\\ ${R('p')}x+${R('q')}y=S`,
          quiz: [
            { q: 'في المعادلة التي تعدّ الأقلام نكتب:', options: ['$x + y = 12$', '$70x + 20y = 12$', '$x + y = 440$'], correct: 0 },
            { q: 'المعادلة $70x + 20y = 440$ تجمع:', options: ['مبالغ بالدينار', 'أقلامًا', 'أقلامًا ومبالغ معًا'], correct: 0 },
          ],
        },
        predictPrompt: 'في المختبر رفضت القصة أن تضع 70 أو 20 في معادلة «12 قلمًا»، وقبلتهما في معادلة «440 دج». كيف تترجم قصة فيها مجهولان إلى جملة معادلتين؟ اكتب القاعدة بكلماتك: من أين تأتي كل معادلة، وأيّ الأعداد تجتمع في المعادلة الواحدة؟',
        summary: 'نسمّي المجهولين x و y، ونترجم كل معلومة من النص بمعادلة بدلالتهما، بوحدة واحدة في المعادلة الواحدة: عدد مع عدد، ودنانير مع دنانير.',
        body: (
          <div className="space-y-2">
            <p><MathText>{TRANSLATION_RULE.text}</MathText></p>
            <p className="text-sm text-slate-600" dir="ltr"><MathText>{ACTIVITY_SOLUTION.system}</MathText></p>
          </div>
        ),
      },
      {
        id: 'khutuwat-hall', type: 'methodes', title: 'مراحل حل مشكلة بجملة معادلتين',
        memo: {
          rule: 'x,y\\to E_1,E_2\\to(x_0\\,;\\,y_0)',
          hook: 'اختر · ترجم · حلّ · تحقّق · أجب',
          example: 'x+y=12\\to(4\\,;\\,8)',
          trap: 'نسيان التحقق أو ترك العددين دون جملة',
          exam: 'رتّب المراحل الخمس بعناوينها على الورقة',
          chip: `${R('1')}\\to${R('2')}\\to${R('3')}\\to${R('4')}\\to${R('5')}`,
          quiz: [
            { q: 'أولى مراحل حل مشكلة بجملة معادلتين:', options: ['اختيار المجهولين', 'حل الجملة', 'التحقق'], correct: 0 },
            { q: 'المرحلة التي تأتي بعد حل الجملة:', options: ['التحقق من النتيجة في النص', 'اختيار المجهولين', 'ترجمة المعلومات'], correct: 0 },
          ],
        },
        // Les cinq étapes SONT les étapes du labo (le compteur « المرحلة n من 5 ») et les titres des étapes 1 → 4 du module les nomment : une
        // prédiction ne ferait que les recopier. La règle prédictible du module 1 est jumla-tarjama.
        predict: false,
        summary: 'خمس مراحل: نختار المجهولين، نترجم المشكلة بجملة معادلتين، نحل الجملة بطريقة مناسبة، نتحقق من النتيجة، ثم نجيب عن السؤال.',
        body: (
          <ol className="space-y-1">
            {[STEPS.choose, STEPS.translate, STEPS.solve, STEPS.check, STEPS.answer].map((s) => <li key={s}><MathText>{s}</MathText></li>)}
          </ol>
        ),
      },
    ],
    2: [
      {
        id: 'tahaqquq-nas', type: 'regles', title: 'نتحقق في نص المشكلة ونجيب بجملة',
        memo: {
          rule: `x,y\\in${R('\\mathbb{N}')}\\ ,\\ x+y=N`,
          hook: 'تحقّق في النص ثم أجب بجملة',
          example: '16+13=29\\ ,\\ 20\\times16+5\\times13=385',
          trap: 'الاكتفاء بالثنائية دون جملة جواب',
          exam: 'اكتب جملة تذكر كل عدد مع ما يمثّله',
          chip: `x\\in${R('\\mathbb{N}')}`,
          quiz: [
            { q: 'وجدنا $y = -3$ في مسألة تعدّ قمصانًا مبيعة. نحكم:', options: ['الجواب مرفوض: عدد القمصان عدد طبيعي', 'الجواب مقبول لأنه يحقّق الجملة', 'نغيّر طريقة الحل'], correct: 0 },
            { q: 'الثنائية $(16 ; 13)$ في مسألة 29 قطعة و 385 دج : نتحقق من:', options: ['$16 + 13 = 29$ و $20 \\times 16 + 5 \\times 13 = 385$', '$16 + 13 = 385$', '$16 \\times 13 = 29$'], correct: 0 },
          ],
        },
        predictPrompt: 'في دفتر التعاونية وجدتَ حلًّا للجملة، ومع ذلك رفضته القصة. أين تعوّض العددين لتتحقّق من النتيجة؟ وما الذي يجب أن يتحقّق فيهما ليكونا جوابًا عن القصة، وكيف تكتب هذا الجواب؟ اكتب القاعدة بكلماتك.',
        summary: 'نعوّض العددين في معطيات النص نفسه، ونتأكد أن الجواب يلائم القصة (عدد أشياء تُعدّ يكون عددًا طبيعيًا)، ثم نجيب عن السؤال بجملة تذكر العددين.',
        body: <p><MathText>{CHECK_RULE.text}</MathText></p>,
      },
    ],
  },
};
