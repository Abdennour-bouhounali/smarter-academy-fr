import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, PLATFORM_NOTES } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « نشر وتبسيط عبارة جبرية » — SOURCE UNIQUE,
 * construite à partir du manuel (content/textbook.js, معارف 1 p. 34). Une
 * <KnowledgeBrick id> dans un module et la carte rendent le même objet.
 *
 *   module 1 (نشاط 1)  nashr-taarif — la définition, posée après « جداء أم
 *                      مجموع ؟ » (question 2) et avant « انشر » (question 3) ;
 *                      nashr-qawsayn — (a + b)(c + d), posée quand l'élève a
 *                      vérifié son terrain (3x − 1)(3 + x).
 *   module 2 (معارف 1) tawziiya-nashr — k(a ± b) ; tabsit — réduire.
 *
 * « أتوقّع القاعدة » (2026-10-06) : nashr-taarif, nashr-qawsayn et tabsit ont
 * leur `predictPrompt` ; la brique tawziiya-nashr du module 2 est un RAPPEL
 * (k(a ± b) est l'acquis 3AM `khassiya-tawziiya`, et le module 1 l'a déjà
 * nommée « الخاصية المعتمدة » à la question 3).
 */
const [propSum, propDiff, propDouble] = KNOWLEDGE.properties;
// Les exemples des cartes sont ceux de la PLATEFORME (indépendance du manuel, rollout 2026-11-11) : ni l'exemple k(a ± b) ni l'exemple de
// deux parenthèses du livre ; termes croisés de même signe (réduire deux termes croisés opposés est la méthode de la مسألة).
const exSimple = '$6(x - 2) = 6 \\times x - 6 \\times 2 = 6x - 12$';
const exDouble = '$(2x + 1)(x + 3) = 2x^2 + 6x + x + 3 = 2x^2 + 7x + 3$';

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'nashr-taarif', type: 'concepts', title: 'نشر عبارة جداء',
        memo: {
          rule: `k(a+b)\\ \\to\\ ${R('ka+kb')}`,
          hook: 'من جداء إلى مجموع',
          example: `3(x+5)=${R('3x+15')}`,
          trap: 'الخلط بين عبارة مجموع وعبارة جداء قبل النشر',
          exam: 'أميّز الجداء أولًا ثم أنشره وأبسّط الناتج',
          chip: `k(a+b)\\to ka+kb`,
          quiz: [
            { q: 'أيّ العبارات التالية جداء؟', options: ['$x+(4-3x)$', '$x(2x+5)$', '$x(x+2)-1+(x+2)$'], correct: 1 },
            { q: 'نشر العبارة $3(x+5)$ يعطي:', options: ['$3x+5$', '$3x+15$', '$x+15$'], correct: 1 },
          ],
        },
        predictPrompt: 'كتبت $3 \\times (9 + 5)$ على الشكل $3 \\times 9 + 3 \\times 5$ ، وفي الملعب حسبت المساحة منطقةً منطقة، ثم ميّزت بين نوعين من العبارات. يُسمّى هذا التحويل «نشرًا»: من أيّ نوع من العبارات ننطلق، وإلى أيّ نوع نصل؟ اكتب التعريف بكلماتك.',
        summary: 'نشر عبارة جداء يعني كتابة هذه العبارة على شكل مجموع (أو فرق).',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.definition}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{PLATFORM_NOTES.classify}</MathText></p>
          </div>
        ),
      },
      {
        id: 'nashr-qawsayn', type: 'regles', title: 'نشر جداء قوسين',
        memo: {
          rule: `\\begin{array}{c}(a+b)(c+d)=\\\\ac+ad+${R('bc+bd')}\\end{array}`,
          hook: 'كل حدّ في كل حدّ',
          example: `(x+2)(x+3)=x^2+${R('5x')}+6`,
          trap: 'نسيان أحد الجداءات الأربعة أو إهمال إشارة الناقص',
          exam: 'أكتب الجداءات الأربعة ثم أجمع الحدود المتشابهة',
          chip: `(a+b)(c+d)`,
          quiz: [
            { q: '$(x+2)(x+3)=$', options: ['$x^2+6$', '$x^2+5x+6$', '$x^2+5x+5$'], correct: 1 },
            { q: '$(2x+1)(x+3)=$', options: ['$2x^2+3$', '$2x^2+6x+3$', '$2x^2+7x+3$'], correct: 2 },
          ],
        },
        predictPrompt: 'في الملعب $(3x - 1)(3 + x)$ حسبت كل المناطق، منها اثنتان مقتطعتان، فساوى مجموعها مساحة الملعب من أجل كل قيمة جرّبتها لـ $x$. لو كان بعدا الملعب $a + b$ و $c + d$: كم جداءً تكتب، وكيف تختار عاملَي كل جداء؟ اكتب القاعدة بكلماتك.',
        summary: 'نضرب كل حد من القوس الأول في كل حد من القوس الثاني: أربعة جداءات نجمعها.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.propertiesIntro}</MathText></p>
            <p><MathText>{propDouble}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tawziiya-nashr', type: 'regles', title: 'ضرب عدد في مجموع أو فرق',
        memo: {
          rule: `k(a-b)=ka-${R('kb')}`,
          hook: 'العدد يضرب كل حدّ',
          example: `6(x-2)=6x-${R('12')}`,
          trap: 'ضرب الحدّ الأول وحده وترك الثاني',
          exam: 'أضرب العدد في كل حدّ مع حفظ الإشارة',
          chip: `k(a\\pm b)`,
          quiz: [
            { q: '$-2(x-5)=$', options: ['$-2x-10$', '$-2x+10$', '$-2x-5$'], correct: 1 },
            { q: '$4(2x+5)=$', options: ['$8x+5$', '$8x+20$', '$2x+20$'], correct: 1 },
          ],
        },
        summary: 'نضرب العدد k في كل حد من حدّي المجموع أو الفرق، مع الإشارة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.propertiesIntro}</MathText></p>
            <p><MathText>{`${propSum} ، ${propDiff}`}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{exSimple}</MathText></p>
          </div>
        ),
      },
      {
        id: 'tabsit', type: 'methodes', title: 'تبسيط عبارة',
        memo: {
          rule: `-(a-b)=-a+${R('b')}`,
          hook: 'ناقص قبل القوس يعكس الإشارات',
          example: `3x-(x-5)=3x-x+${R('5')}=2x+5`,
          trap: 'تغيير إشارة الحدّ الأول فقط داخل القوس',
          exam: 'أحذف الأقواس ثم أجمع الحدود التي لها قوة الحرف نفسها',
          chip: `-(a-b)`,
          quiz: [
            { q: '$5-(x-2)=$', options: ['$3-x$', '$7-x$', '$7+x$'], correct: 1 },
            { q: 'تبسيط $3x^2+5x+2x-6$ يعطي:', options: ['$10x^2-6$', '$3x^2+7x-6$', '$3x^2+3x-6$'], correct: 1 },
          ],
        },
        predictPrompt: 'في الملعب جمعتَ حدّين متشابهين فصار المجموع أقصر. لو أعطيناك عبارة طويلة فيها قوسان مسبوقان بإشارة $-$، وحدود فيها $x^2$ وحدود فيها $x$ وأعداد: بأيّ خطوات تبسّطها، وأيّ الحدود يحقّ لك أن تجمعها معًا؟ اكتب الطريقة.',
        summary: 'نبسّط عبارة بحذف الأقواس (قوسان مسبوقان بإشارة ناقص تتغيّر إشارة كل حد بداخلهما)، ثم بجمع الحدود المتشابهة، أي التي لها نفس قوة x.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600"><MathText>{exDouble}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{PLATFORM_NOTES.unlike}</MathText></p>
          </div>
        ),
      },
    ],
  },
};
