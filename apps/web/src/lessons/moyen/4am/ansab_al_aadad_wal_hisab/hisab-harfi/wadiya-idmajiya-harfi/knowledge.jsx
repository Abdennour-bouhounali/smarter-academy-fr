import MathText from '../../../../../common/components/MathText';
import { REMARKS, METHOD_LETTERS } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Une synthèse n'introduit aucune notion nouvelle (LESSON_CONTRACT) : ce sont
 * la DÉMARCHE de modélisation et les moments de choix d'une forme.
 *   namdhaja          module 7 — nommer l'inconnue, exprimer chaque longueur en fonction de x
 *   masaha-tariqatan  module 7 — l'aire du ممرّ de deux façons
 *   musaada-jadaa     module 7 — la forme factorisée DONNÉE : un produit dont un facteur est nul est nul
 *   tariqat-wadiya    module 7 — la démarche complète
 * La synthèse dans le lecteur de mission (2026-11-12) : les cartes sont ouvertes dès le premier écran — EN LETTRES (une نافورة de côté a, un
 * ممرّ de largeur x) et sur des nombres NEUFS (a = 13 ; (x − 2)(x + 15)), jamais le bassin, le ruban ni leurs nombres (content/forbidden.js).
 */
/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    7: [
      { id: 'namdhaja', type: 'methodes', title: 'نمذجة وضعية بدلالة x', summary: 'نسمّي المجهول x، ونعبّر عن كل طول بدلالته انطلاقًا من الشكل، ثم عن المساحة.',
      memo: {
        rule: `\\ell=a+${R('2x')}`,
        hook: 'سمِّ المجهول ثم عبّر بدلالته',
        example: `\\ell=13+${R('2x')}`,
        trap: 'نسيان أنّ الممرّ على جهتين فيُضاف مرّتين',
        exam: 'أكتب ليكن المجهول ثم أعبّر عن كل طول بدلالته',
        chip: `x\\to 13+2x`,
        quiz: [
          { q: 'نافورة مربّعة ضلعها $13$ يحيط بها ممرّ عرضه $x$. ضلع المربّع الخارجي:', options: ['$13+x$', '$13+2x$', '$13x$'], correct: 1 },
          { q: 'عند $x=3$ ضلع المربّع الخارجي يساوي:', options: ['$16$', '$39$', '$19$'], correct: 2 },
        ],
      },
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            <li>نسمّي المجهول <MathText>{'$x$'}</MathText> (هنا عرض الممرّ).</li>
            <li>نقرأ الشكل: كل طول نعبّر عنه بدلالة <MathText>{'$x$'}</MathText> (ضلع المربّع الخارجي مثلًا).</li>
            <li>نطبّق قاعدة المساحة على هذه الأطوال، ثم ننشر ونبسّط.</li>
          </ol>
        ) },
      { id: 'masaha-tariqatan', type: 'regles', title: 'مساحة الممرّ: طريقتان', summary: 'مساحة الممرّ هي مساحة المربّع الخارجي ناقص مساحة النافورة، أو مجموع أربعة مستطيلات وأربعة أركان مربّعة.',
      memo: {
        rule: `S=(a+2x)^2-${R('a^2')}`,
        hook: 'المربّع الخارجي ناقص النافورة',
        example: `S=(13+2x)^2-${R('169')}=52x+4x^2`,
        trap: 'نسيان طرح مساحة النافورة',
        exam: 'أحسب المساحة بطريقتين وأتأكّد أنّهما تعطيان النشر نفسه',
        chip: `(13+2x)^2-13^2`,
        quiz: [
          { q: 'عند $x=1$ مساحة الممرّ حول نافورة ضلعها $13$:', options: ['$225$', '$56$', '$4$'], correct: 1 },
          { q: 'عند $x=2$ مساحة الممرّ نفسه:', options: ['$120$', '$289$', '$104$'], correct: 0 },
        ],
      },
        body: (
          <div className="space-y-1">
            <p><MathText>{REMARKS.twoWays}</MathText></p>
            <p><MathText>{'$(a + 2x)^2 - a^2$ أو $4 \\times ax + 4 \\times x^2$'}</MathText> — والعبارتان لهما النشر المبسّط نفسه.</p>
          </div>
        ) },
      { id: 'musaada-jadaa', type: 'regles', title: 'الشكل المحلّل المعطى',
      memo: {
        rule: `\\begin{array}{c}AB=0\\iff\\\\A=${R('0')}\\lor B=${R('0')}\\end{array}`,
        hook: 'جداء معدوم: عامل معدوم',
        example: `(x-2)(x+15)=0\\Rightarrow x=${R('2')}`,
        trap: 'إهمال التحقّق من كل قيمة في الوضعية',
        exam: 'أحلّ كلًّا من العاملين ثم أتحقّق من كل قيمة بالتعويض',
        chip: `A\\times B=0`,
        quiz: [
          { q: 'حلّ $(x-2)(x+15)=0$:', options: ['$x=2$ أو $x=15$', '$x=2$ أو $x=-15$', '$x=-2$ أو $x=15$'], correct: 1 },
          { q: 'إذا كان $A\\times B=0$ فإنّ:', options: ['$A+B=0$', '$A=0$ و $B=0$ معًا', '$A=0$ أو $B=0$'], correct: 2 },
        ],
      },
        predictPrompt: 'وصلت إلى $x^2 + 13x - 30 = 0$ ، وأُعطيت الشكل المحلّل $x^2 + 13x - 30 = (x - 2)(x + 15)$. كيف يساعدك هذا الشكل على إيجاد قيمة لـ $x$ تجعل العبارة تساوي 0؟ اكتب القاعدة التي تستعملها، وماذا تفعل بكل قيمة تجدها.',
        summary: 'إذا كان أحد عاملي جداء معدومًا فإنّ الجداء معدوم؛ نتحقّق من كل قيمة بالتعويض.',
        body: (
          <div className="space-y-1">
            <p><MathText>{'مثال: $x^2 + 13x - 30 = (x - 2)(x + 15)$'}</MathText></p>
            <p><MathText>{REMARKS.help}</MathText></p>
            <p><MathText>{REMARKS.check}</MathText></p>
          </div>
        ) },
      { id: 'tariqat-wadiya', type: 'methodes', title: 'طريقة: من الشكل إلى المعادلة', summary: 'نقرأ الوضعية، نعبّر عن المقدار المطلوب بدلالة x، نكتب المساواة، نستعمل الشكل المحلّل، ثم نحتفظ بالقيمة المقبولة ونتحقّق منها.',
      memo: {
        rule: `\\begin{aligned}4x^2+4ax&=S\\\\x^2+ax&=${R('\\tfrac{S}{4}')}\\end{aligned}`,
        hook: 'عبّر، ساوِ، حلّل، تحقّق',
        example: `4x^2+52x=120\\to x=${R('2')}`,
        trap: 'قبول قيمة سالبة لعرض الممرّ',
        exam: 'أعبّر عن المقدار ثم أكتب المساواة وأحلّلها وأحتفظ بالقيمة المقبولة',
        chip: `4x^2+4ax=S`,
        quiz: [
          { q: 'نقسم $4x^2+52x=120$ على $4$ فنحصل على:', options: ['$x^2+13x=120$', '$x^2+13x=30$', '$x^2+52x=30$'], correct: 1 },
          { q: 'بعد حلّ $(x-2)(x+15)=0$ القيمة المقبولة لعرض الممرّ:', options: ['$x=-15$', '$x=0$', '$x=2$'], correct: 2 },
        ],
      },
        body: (
          <ol className="list-decimal ms-5 space-y-1">
            <li><strong>{METHOD_LETTERS.steps[0]}</strong>: <MathText>{METHOD_LETTERS.read}</MathText></li>
            <li><strong>{METHOD_LETTERS.steps[1]}</strong>: <MathText>{METHOD_LETTERS.strategy}</MathText></li>
            <li><strong>{METHOD_LETTERS.steps[2]}</strong>: <MathText>{METHOD_LETTERS.execute}</MathText></li>
            <li><MathText>{REMARKS.check}</MathText></li>
          </ol>
        ) },
    ],
  },
};
