import MathText from '../../../../../common/components/MathText';
import { REMARKS } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** `R(x)` : ce qui CHANGE dans la règle d'une fiche `memo`, en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Rappels et démarche seulement : une synthèse n'introduit rien (LESSON_CONTRACT :
 * le test final ne doit rien introduire de neuf). Tout est posé au module 7 (les six وضعيات d'entraînement, modules 1 à 6, n'introduisent rien).
 *   masahat-mustatil  rappel — l'aire du rectangle (avant « المساحة بدلالة ℓ »)
 *   tadhkir-x2-a      rappel — les deux solutions de x² = a (leçon 3), avant « أيّ حل؟ »
 *   tariqat-wadiya    la démarche de la situation, posée APRÈS la dernière question du module 7
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'masahat-mustatil', type: 'regles', title: 'تذكير: مساحة المستطيل',
        memo: {
    rule: `S=${R('L')}\\times${R('\\ell')}`,
    hook: 'المساحة جداء الطول في العرض',
    example: `S=${R('7')}\\times${R('3')}=21`,
    trap: 'جمع الطول والعرض بدل ضربهما',
    exam: 'اكتب القانون ثم عوّض ثم احسب',
    chip: `S=L\\times\\ell`,
    quiz: [
      { q: 'مساحة مستطيل طوله $9$ وعرضه $4$ :', options: ['$36$', '$13$', '$26$'], correct: 0 },
      { q: 'مستطيل مساحته $30$ وعرضه $5$ ، فطوله:', options: ['$6$', '$25$', '$150$'], correct: 0 },
    ],
  }, summary: 'مساحة المستطيل هي جداء طوله في عرضه.',
        body: <p>مساحة مستطيل طوله <MathText>{'$L$'}</MathText> وعرضه <MathText>{'$\\ell$'}</MathText> هي <MathText>{'$L \\times \\ell$'}</MathText>.</p> },
      { id: 'tadhkir-x2-a', type: 'regles', title: 'تذكير: حلّان متعاكسان',
        memo: {
    rule: `x^2=a\\ (a>0):\\ x_1=${R('\\sqrt{a}')}\\ ,\\ x_2=${R('-\\sqrt{a}')}`,
    hook: 'عدد موجب يعطي حلّين متعاكسين',
    example: `x^2=28\\iff x=${R('\\pm 2\\sqrt{7}')}`,
    trap: 'الاحتفاظ بالحلّين دون التساؤل هل الطول يقبل السالب',
    exam: 'احذف الحلّ السالب لأنّ الطول موجب',
    chip: `x^2=a\\to${R('\\pm\\sqrt{a}')}`,
    quiz: [
      { q: 'حلّا المعادلة $x^2=20$ :', options: ['$\\sqrt{20}$ و $-\\sqrt{20}$', '$10$ و $-10$', '$\\sqrt{20}$ فقط'], correct: 0 },
      { q: 'عدد حلول المعادلة $x^2=0$ :', options: ['حلّ واحد', 'حلّان', 'لا حلّ'], correct: 0 },
    ],
  }, summary: 'إذا كان العدد a موجبا تماما، فللمعادلة حلّان متعاكسان: جذره التربيعي ومعاكسه (الدرس 3).',
        body: <p>إذا كان <MathText>{'$a > 0$'}</MathText> فإنّ المعادلة <MathText>{'$x^2 = a$'}</MathText> تقبل حلين متعاكسين هما <MathText>{'$\\sqrt{a}$'}</MathText> و <MathText>{'$-\\sqrt{a}$'}</MathText> (الدرس 3).</p> },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من المساحة إلى البعدين',
        memo: {
    rule: `x^2=a\\ \\to\\ x=${R('\\sqrt{a}')}\\ (x>0)`,
    hook: 'عبّر حلّ احتفظ دوّر',
    example: `x\\times 2x=18\\iff x^2=9\\iff x=${R('3')}`,
    trap: 'التدوير في وسط الحل فتتراكم الأخطاء',
    exam: 'دوّر في النهاية فقط واكتب الوحدة',
    chip: `x^2=a\\to x=${R('\\sqrt{a}')}`,
    quiz: [
      { q: 'مستطيل عرضه $x$ وطوله $2x$ ومساحته $50$ ، قيمة $x$ هي:', options: ['$5$', '$25$', '$\\sqrt{50}$'], correct: 0 },
      { q: 'مربّع مساحته $52$ ، ضلعه على أبسط شكل:', options: ['$2\\sqrt{13}$', '$4\\sqrt{13}$', '$26$'], correct: 0 },
    ],
  }, summary: 'نعبّر عن المساحة بدلالة العرض، نحل المعادلة ونحتفظ بالحل الموجب، نكتب الجذر على أبسط شكل، ثم ندوّر في النهاية فقط.',
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            <li><MathText>{REMARKS.masaha}</MathText></li>
            <li><MathText>{REMARKS.mujab}</MathText></li>
            <li>نكتب القيمة المضبوطة على الشكل <MathText>{'$a\\sqrt{b}$'}</MathText> حيث <MathText>{'$b$'}</MathText> أصغر ما يمكن (الدرس 5).</li>
            <li><MathText>{REMARKS.tadwirRight}</MathText></li>
          </ol>
        ) },
    ],
  },
};
