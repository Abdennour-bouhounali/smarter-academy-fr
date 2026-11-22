import MathText from '../../../../../common/components/MathText';
import { REMARKS, METHOD_LETTERS } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont
 * la DÉMARCHE du manuel (ترجمة → تجريب → متراجحة → تفسير), toute au module 7.
 *   tarjama-sigha        module 7 — traduire une formule de prix : par séance × x, fixe une fois
 *   tajrib               module 7 — l'essai : coûter les deux formules pour plusieurs x
 *   mutarajiha-mufadala  module 7 — « meilleure » = « coûte moins » : l'inéquation qui départage
 *   tafsir-natija        module 7 — interpréter : x naturel, la valeur d'égalité n'est pas la réponse
 *   tariqat-wadiya       module 7 — la démarche complète en trois étapes
 * La وضعية du défi n'est dans aucun item, ni ses nombres (la synthèse dans le lecteur de mission, 2026-11-12 : la carte et les cartes de mémoire
 * sont ouvertes dès le premier écran) — elles parlent EN LETTRES (a, b, f) et sur des nombres frais (content/forbidden.js, content/mission.test.js).
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'tarjama-sigha', type: 'methodes', title: 'ترجمة صيغة تسعير بعبارة حرفية', summary: 'نسمّي x عدد الحصص: المبلغ الذي يُدفع في كل حصة يُضرب في x، والمبلغ الذي يُدفع مرّة واحدة يُضاف كما هو.',
        memo: {
          rule: `p\\times x\\ +\\ ${R('f')}`,
          hook: 'ما يتكرّر نضربه والثابت نضيفه',
          example: `120+8x`,
          trap: 'ضرب الاشتراك في عدد الحصص',
          exam: 'أسمّي x عدد الحصص ثم أترجم كل صيغة',
          chip: `px+f`,
          quiz: [
            { q: 'ترجمة «240 دج مرّة واحدة و 6 دج في كل حصة»:', options: ['$240x+6$', '$240+6x$', '$(240+6)x$'], correct: 1 },
            { q: 'ثمن $x$ حصة بـ 35 دج للحصة:', options: ['$35+x$', '$35x$', '$\\dfrac{x}{35}$'], correct: 1 },
          ],
        },
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            <li>نسمّي المجهول: <MathText>{'$x$'}</MathText> عدد الحصص (عدد طبيعي).</li>
            <li>المبلغ الذي يُدفع <strong>في كل حصة</strong> يتكرّر: نضربه في <MathText>{'$x$'}</MathText>.</li>
            <li>المبلغ الذي يُدفع <strong>مرّة واحدة</strong> (اشتراك) لا يتغيّر مع <MathText>{'$x$'}</MathText> : نضيفه كما هو.</li>
            <li><MathText>{REMARKS.tarjamaRight}</MathText></li>
          </ol>
        ) },
      { id: 'tajrib', type: 'methodes', title: 'التجريب', summary: 'نحسب تكلفة كل صيغة من أجل عدة أعداد للحصص، فنرى متى تصبح إحداهما أقل تكلفة ومتى تتساويان.',
        memo: {
          rule: `\\begin{aligned}x&=1,2,3,\\ldots\\\\A(x)&\\ ?\\ B(x)\\end{aligned}`,
          hook: 'جرّب عدة أعداد ثم قارن',
          example: `35\\times10=350`,
          trap: 'التجريب بعدد واحد فقط',
          exam: 'أنظّم جدولًا لقيم x وتكلفتي الصيغتين',
          chip: `A(x)\\ ?\\ B(x)`,
          quiz: [
            { q: 'من أجل $x=10$ الصيغة $240+6x$ تساوي:', options: ['$246$', '$300$', '$2460$'], correct: 1 },
            { q: 'من أجل $x=10$ الصيغة $35x$ تساوي:', options: ['$45$', '$350$', '$3{,}5$'], correct: 1 },
          ],
        },
        body: <p><MathText>{REMARKS.tajrib}</MathText></p> },
      { id: 'mutarajiha-mufadala', type: 'regles', title: 'متراجحة للمفاضلة', summary: 'الخيار الأفضل هو الأقل تكلفة: نكتب «تكلفة الخيار المقصود < تكلفة الخيار الآخر» ثم نحلّها.',
        memo: {
          rule: `A(x)\\ ${R('<')}\\ B(x)`,
          hook: 'الأفضل هو الأقل تكلفة',
          example: `200+10x<50x`,
          trap: 'كتابة معادلة بدل متراجحة',
          exam: 'أترجم أفضل بمتراجحة ثم أحلّها',
          chip: `A(x)<B(x)`,
          quiz: [
            { q: '«الصيغة (ب) أفضل» حيث (ب) هي $200+10x$ والأخرى $50x$ تُترجم:', options: ['$200+10x<50x$', '$200+10x>50x$', '$200+10x=50x$'], correct: 0 },
            { q: 'حلّ $200+10x<50x$ هو:', options: ['$x<5$', '$x>5$', '$x=5$'], correct: 1 },
          ],
        },
        body: (
          <div className="space-y-1">
            <p>«الصيغة أفضل» تعني «تكلفتها أقل»: نترجمها بمتراجحة بين العبارتين، ثم نحلّها كما في الدرس 3.</p>
            <p><MathText>{REMARKS.mufadala}</MathText></p>
          </div>
        ) },
      { id: 'tafsir-natija', type: 'methodes', title: 'تفسير النتائج', summary: 'عدد الحصص عدد طبيعي: «ابتداءً من» يعني أصغر عدد طبيعي يحقّق المتراجحة؛ قيمة التساوي ليست الجواب.',
        memo: {
          rule: `x>5,\\ x\\in\\mathbb{N}\\Rightarrow x=${R('6')}`,
          hook: 'أصغر عدد طبيعي يحقّق المتراجحة',
          example: `x>5\\to x=6`,
          trap: 'اعتماد قيمة التساوي جوابًا',
          exam: 'أحتفظ بالأعداد الطبيعية وأذكر أصغرها',
          chip: `x>5\\to6`,
          quiz: [
            { q: 'إذا كان حلّ المتراجحة $x>5$ وعدد الحصص طبيعي فأصغر عدد للحصص هو:', options: ['$5$', '$6$', '$5{,}5$'], correct: 1 },
            { q: 'عند قيمة التساوي تكون الصيغتان:', options: ['إحداهما أفضل', 'متساويتين في التكلفة', 'غير قابلتين للمقارنة'], correct: 1 },
          ],
        },
        body: (
          <ul className="list-disc ms-5 space-y-1">
            <li>حلول المتراجحة أعداد؛ لكن عدد الحصص عدد طبيعي: نحتفظ بالأعداد الطبيعية فقط.</li>
            <li>عند قيمة التساوي تكون التكلفتان متساويتين: لا تكون أيّ صيغة أفضل.</li>
            <li><MathText>{REMARKS.tasawiRight}</MathText></li>
          </ul>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من النص إلى الخيار الأفضل', summary: 'نقرأ الوضعية ونترجم كل خيار بعبارة حرفية، نجرّب ثم نكتب متراجحة مناسبة، نحلّها ونفسّر النتيجة.',
        memo: {
          rule: `\\begin{aligned}x&\\to A(x),B(x)\\\\&\\to A(x)<B(x)\\\\&\\to x\\in\\mathbb{N}\\end{aligned}`,
          hook: 'ترجم جرّب قارن ثم فسّر',
          example: `200+10x<50x`,
          trap: 'الإجابة بقيمة التساوي دون تفسير',
          exam: 'أذكر مراحل الحل الأربع وأفسّر النتيجة',
          chip: `x\\to A<B\\to\\mathbb{N}`,
          quiz: [
            { q: 'أول مرحلة في معالجة الوضعية:', options: ['حلّ المتراجحة', 'فهم المطلوب وتسمية المجهول', 'التحقق'], correct: 1 },
            { q: 'بعد حلّ المتراجحة نفسّر النتيجة بـ:', options: ['إبقاء الأعداد الطبيعية فقط', 'حذف المتراجحة', 'اعتماد قيمة التساوي'], correct: 0 },
          ],
        },
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            {[METHOD_LETTERS.read, METHOD_LETTERS.strategy, METHOD_LETTERS.execute].map((text, i) => <li key={METHOD_LETTERS.steps[i]}><strong>{METHOD_LETTERS.steps[i]}</strong>: <MathText>{text}</MathText></li>)}
          </ol>
        ) },
    ],
  },
};
