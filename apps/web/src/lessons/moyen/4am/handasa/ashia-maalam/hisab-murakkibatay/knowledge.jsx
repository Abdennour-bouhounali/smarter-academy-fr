import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOW3B, KNOW_EQUAL, METHOD_EQUAL, METHOD_UNKNOWN, MISTAKES } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « حساب مركبتي شعاع وتساوي شعاعين في معلم » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 2)  farq-ihdathiyat — le code du portail = fin moins début (la découverte du نشاط 2) ;
 *   module 2 (معارف)   qanun-murakkibatayn (معارف 3 ب : AB(x_B − x_A ; y_B − y_A)) ; tasawi-murakkibat (معارف جـ :
 *                      AB = CD ⇔ mêmes composantes) ;
 *   module 3 (طرائق)   tahaqquq-tasawi (la طريقة p. 143, conclusion corrigée AB = DC) ; nuqta-majhula (calculer les
 *                      coordonnées d'un point inconnu — formalisation de la plateforme, déclarée).
 */
/** `memo` — la FICHE DE MÉMOIRE de chaque connaissance (MemoCard) : ce qui CHANGE dans la règle est en rouge (`R`). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'farq-ihdathiyat', type: 'regles', title: 'رمز القفزة: النهاية ناقص المبدأ',
        memo: {
          rule: `\\overrightarrow{AB}\\begin{pmatrix} ${R('x_B-x_A')} \\\\ ${R('y_B-y_A')} \\end{pmatrix}`,
          hook: 'النهاية ناقص المبدأ، لكل مركبة',
          example: `A(1\\,;\\,2),\\ B(4\\,;\\,3):\\quad \\overrightarrow{AB}\\begin{pmatrix} 4-1 \\\\ 3-2 \\end{pmatrix}=\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}`,
          trap: 'طرح المبدأ من النهاية معكوسًا فتنعكس القفزة',
          exam: 'اكتب سطر الطرح لكل مركبة ثم ضعهما في عمود',
          chip: `\\overrightarrow{AB}(${R('x_B-x_A')}\\,;\\,${R('y_B-y_A')})`,
          quiz: [
      { q: 'مركبتا $\\overrightarrow{AB}$ مع $A(1\\,;\\,2)$ و $B(4\\,;\\,3)$ هما:', options: ['$(3\\,;\\,1)$', '$(-3\\,;\\,-1)$', '$(4\\,;\\,3)$'], correct: 0 },
      { q: 'مركبتا $\\overrightarrow{CD}$ مع $C(3\\,;\\,1)$ و $D(2\\,;\\,-5)$ هما:', options: ['$(-1\\,;\\,-6)$', '$(1\\,;\\,6)$', '$(2\\,;\\,-5)$'], correct: 0 },
          ],
        },
        // « أتوقّع القاعدة » : posée par PredictRule autour de la question نشاط 2 ب 1 (module 1, étape 4), dont la bonne option EST la règle.
        predictPrompt: 'على الخريطة فتحتَ البوابة AB بالرمز $\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}$ مع $A(1\\,;\\,2)$ و $B(4\\,;\\,3)$ ، ثم وضعتَ D حتى يفتح الرمز نفسه بوابة ثانية. كيف تحسب رمز بوابة تنقل البطل من $A(x_A\\,;\\,y_A)$ إلى $B(x_B\\,;\\,y_B)$ دون أن تعدّ المربعات؟ اكتب القاعدة بكلماتك، لكل مركبة.',
        summary: 'مركبتا الشعاع AB نحصل عليهما دون عدّ: فاصلة B ناقص فاصلة A، وترتيب B ناقص ترتيب A. وشعاعان لهما نفس المركبتين متساويان.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{ACTIVITY.closing}</MathText></p>
            <SourceTag source={ACTIVITY.source} />
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'qanun-murakkibatayn', type: 'regles', title: 'حساب مركبتي شعاع',
        memo: {
          rule: `\\overrightarrow{AB}(${R('x_B-x_A')}\\,;\\,${R('y_B-y_A')})`,
          hook: 'فرق الفاصلتين ثم فرق الترتيبين',
          example: `C(3\\,;\\,1),\\ D(2\\,;\\,-5):\\quad \\overrightarrow{CD}(2-3\\,;\\,-5-1)=(-1\\,;\\,-6)`,
          trap: 'نسيان الإشارة عند الطرح من عدد سالب',
          exam: 'اكتب الفرقين بالأعداد ثم ضعهما بين قوسين',
          chip: `(${R('x_B-x_A')}\\,;\\,${R('y_B-y_A')})`,
          quiz: [
      { q: 'مركبتا $\\overrightarrow{EF}$ مع $E(-2\\,;\\,4)$ و $F(3\\,;\\,-1)$ هما:', options: ['$(5\\,;\\,-5)$', '$(1\\,;\\,3)$', '$(-5\\,;\\,5)$'], correct: 0 },
      { q: 'إذا كان $\\overrightarrow{AB}(3\\,;\\,-2)$ فمركبتا $\\overrightarrow{BA}$ هما:', options: ['$(-3\\,;\\,2)$', '$(3\\,;\\,-2)$', '$(2\\,;\\,-3)$'], correct: 0 },
          ],
        },
        // « أتوقّع القاعدة » : non — معارف 3 ب re-pose farq-ihdathiyat (module 1) : brique variant="rappel" (Module02Maarif).
        summary: 'إذا كانت إحداثيتا A هما xA و yA وإحداثيتا B هما xB و yB فإن مركبتي الشعاع AB هما xB − xA و yB − yA.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW3B.property}</MathText></p>
            <p className="text-center text-lg"><MathText>{KNOW3B.formula}</MathText></p>
            <p><MathText>{KNOW3B.example}</MathText></p>
            <SourceTag source={KNOW3B.source} />
          </div>
        ),
      },
      {
        id: 'tasawi-murakkibat', type: 'regles', title: 'الشعاعان المتساويان في معلم',
        memo: {
          rule: `\\overrightarrow{u}=\\overrightarrow{v}\\iff\\begin{cases} ${R("a=a'")} \\\\ ${R("b=b'")} \\end{cases}`,
          hook: 'مركبة بمركبة: الأولى مع الأولى',
          example: `\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}=\\overrightarrow{DC}\\begin{pmatrix} 5-2 \\\\ 5-4 \\end{pmatrix}`,
          trap: 'الظنّ أن المبدأ نفسه شرط للتساوي، والشرط هو المركبتان',
          exam: 'احسب مركبتي الشعاعين كلًّا على حدة ثم قارنهما',
          chip: `\\overrightarrow{u}=\\overrightarrow{v}\\iff ${R("a=a'")}\\quad ${R("b=b'")}`,
          quiz: [
      { q: 'أي الشعاعين يساوي $\\overrightarrow{AB}(3\\,;\\,-1)$ ؟', options: ['$\\overrightarrow{CD}(3\\,;\\,-1)$', '$\\overrightarrow{CD}(-1\\,;\\,3)$', '$\\overrightarrow{CD}(-3\\,;\\,1)$'], correct: 0 },
      { q: 'إذا كان $\\overrightarrow{AB}(2\\,;\\,5) = \\overrightarrow{CD}(x\\,;\\,y)$ فإن:', options: ['$x=2$ و $y=5$', '$x=5$ و $y=2$', '$x=-2$ و $y=-5$'], correct: 0 },
          ],
        },
        // « أتوقّع القاعدة » : non — « شعاعان لهما نفس المركبتين متساويان » est déjà posé par farq-ihdathiyat (module 1, DE = CF) :
        // brique variant="rappel" (Module02Maarif).
        summary: 'يتساوى شعاعان إذا وفقط إذا تساوت مركبتاهما: المركبة الأولى مع الأولى والثانية مع الثانية.',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{KNOW_EQUAL.property}</MathText></p>
            <SourceTag source={KNOW_EQUAL.source} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tahaqquq-tasawi', type: 'methodes', title: 'التحقق من تساوي شعاعين',
        memo: {
          rule: `\\overrightarrow{AB}=\\overrightarrow{DC}\\iff ${R('B-A=C-D')}`,
          hook: 'مركبتان لكل شعاع، ثم قارِن',
          example: `\\begin{pmatrix} 0-1 \\\\ 3-0 \\end{pmatrix}=\\begin{pmatrix} -3+2 \\\\ 0+3 \\end{pmatrix}=\\begin{pmatrix} -1 \\\\ 3 \\end{pmatrix}`,
          trap: 'الانتباه لترتيب حروف الشعاع',
          exam: 'احسب المركبتين ثم اكتب: إذن الشعاعان متساويان',
          chip: `${R('B-A')}=${R('C-D')}`,
          quiz: [
      { q: 'للتحقق من $\\overrightarrow{AB}=\\overrightarrow{DC}$ نقارن:', options: ['مركبتي $\\overrightarrow{AB}$ بمركبتي $\\overrightarrow{DC}$', 'مركبتي $\\overrightarrow{AB}$ بمركبتي $\\overrightarrow{CD}$', 'إحداثيتي $B$ بإحداثيتي $C$'], correct: 0 },
      { q: 'مع $A(0\\,;\\,0)$ و $B(2\\,;\\,1)$ و $C(5\\,;\\,4)$ و $D(3\\,;\\,3)$ : هل $\\overrightarrow{AB}=\\overrightarrow{DC}$ ؟', options: ['نعم: مركبتا الشعاعين $(2\\,;\\,1)$', 'لا: المركبتان مختلفتان', 'نعم لأن $A$ هي $O$'], correct: 0 },
          ],
        },
        predictPrompt: 'في حلّ الكتاب، مع $A(1\\,;\\,0)$ و $B(0\\,;\\,3)$ و $C(-3\\,;\\,0)$ و $D(-2\\,;\\,-3)$ ، وصلنا إلى $\\overrightarrow{AB} = \\overrightarrow{DC}$. لو أعطيناك شعاعين آخرين في معلم، بأيّ خطوات تتحقّق من تساويهما؟ وإلامَ تنتبه حين تكتب كل شعاع؟ اكتب الطريقة.',
        summary: 'للتحقق من تساوي شعاعين نحسب مركبتي كل منهما ونقارنهما، مع احترام ترتيب الحروف (المبدأ ثم النهاية).',
        body: (
          <div className="space-y-1.5">
            <p><MathText>{METHOD_EQUAL.rule}</MathText></p>
            <p><MathText>{METHOD_EQUAL.solution[4]}</MathText></p>
            <SourceTag source={METHOD_EQUAL.source} />
          </div>
        ),
      },
      {
        id: 'nuqta-majhula', type: 'methodes', title: 'حساب إحداثيتي نقطة مجهولة',
        memo: {
          rule: `\\overrightarrow{DC}(a\\,;\\,b)\\Rightarrow\\begin{cases} x_D=${R('x_C-a')} \\\\ y_D=${R('y_C-b')} \\end{cases}`,
          hook: 'اكتب المعادلتين ثم حلّ كلًّا منهما',
          example: `\\begin{cases} x_D=5-3=2 \\\\ y_D=5-1=4 \\end{cases}`,
          trap: 'قلب ترتيب حروف الشعاع يعطي نقطة مختلفة',
          exam: 'اكتب تساوي الشعاعين بالترتيب الصحيح ثم ساوِ المركبتين',
          chip: `x_D=${R('x_C-a')}`,
          quiz: [
      { q: 'مع $A(1\\,;\\,2)$ و $B(4\\,;\\,3)$ و $C(5\\,;\\,5)$ ، إحداثيتا $D$ حتى يكون $\\overrightarrow{DC}=\\overrightarrow{AB}$ :', options: ['$(2\\,;\\,4)$', '$(8\\,;\\,6)$', '$(4\\,;\\,2)$'], correct: 0 },
      { q: 'حتى يكون ABCD متوازي أضلاع نكتب:', options: ['$\\overrightarrow{AB}=\\overrightarrow{DC}$', '$\\overrightarrow{AB}=\\overrightarrow{CD}$', '$\\overrightarrow{AB}=\\overrightarrow{AC}$'], correct: 0 },
          ],
        },
        // « أتوقّع القاعدة » : posée par PredictRule autour de la طريقة de la plateforme (module 3, étape 2), qui l'écrit ligne à ligne.
        predictPrompt: 'نريد النقطة D حتى يكون ABCD متوازي أضلاع، مع $A(1\\,;\\,2)$ و $B(4\\,;\\,3)$ و $C(5\\,;\\,5)$ (وفي المختبر، النقطة E التي مركبتا $\\overrightarrow{DE}$ فيها 3 و 4). لو لم يكن معك المختبر ولا الشبكة، بأيّ خطوات تحسب إحداثيتي النقطة المجهولة؟ اكتب الطريقة.',
        summary: 'لحساب إحداثيتي نقطة مجهولة نكتب تساوي شعاعين بترتيب الحروف الصحيح، ثم نساوي المركبتين فنحصل على معادلتين نحلّهما.',
        body: (
          <div className="space-y-1.5">
            <ol className="list-decimal space-y-0.5 ps-5">
              {METHOD_UNKNOWN.solution.slice(0, 4).map((l) => <li key={l}><MathText>{l}</MathText></li>)}
            </ol>
            <p><MathText>{MISTAKES.order.text}</MathText></p>
            <SourceTag source={METHOD_UNKNOWN.source} />
          </div>
        ),
      },
    ],
  },
};
