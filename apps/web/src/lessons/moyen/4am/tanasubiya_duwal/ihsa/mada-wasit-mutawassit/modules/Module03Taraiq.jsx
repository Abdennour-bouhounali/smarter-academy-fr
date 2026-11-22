import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { MethodSteps, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_1, METHOD_1B, METHOD_2, NOW97 } from '../content/textbook';
import FreqTable from '../components/FreqTable';

/**
 * Module 3 — طرائق (p. 97) « تعيين وتفسير متوسط ووسيط ومدى سلسلة إحصائية » et دوري الآن.
 *   1. l'exercice résolu 1, partie 1, révélé ligne à ligne (m = 6, Med = 5, المدى 8) ; puis la partie 2 est
 *      d'abord DEMANDÉE (on ajoute 3 et 43 : m 8, Med 5, المدى 40), ensuite révélée — brique qiyam-mutatarrifa ;
 *   2. l'exercice résolu 2 (N = 57 → rang 29 ; M = 60 → rangs 30 et 31 : 55,5) et la méthode — brique wasit-rutba —,
 *      puis la méthode sur d'AUTRES nombres (N = 35, N = 48) ;
 *   3. دوري الآن : diviseurs de 225, la série unique 3, 5, 9, 15, 45.
 * LP : P2, P3, P1.
 * « أتوقّع القاعدة » : l'exercice résolu 2 se termine sur la boîte de la méthode (METHOD_2.rule) juste avant la
 * brique wasit-rutba : il est enveloppé (<PredictRule id="wasit-rutba">) — l'élève écrit la méthode des rangs AVANT.
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;

const NOW_EXERCISE = {
  id: 'now-97', source: NOW97.source, difficulty: 'difficile',
  statement: NOW97.text,
  interaction: 'integerSet',
  question: {
    prompt: 'اكتب قيم السلسلة (الخمس):',
    expected: [3, 5, 9, 15, 45],
    explain: 'قواسم 225 الأصغر من 46: $1$ ، $3$ ، $5$ ، $9$ ، $15$ ، $25$ ، $45$. المدى $42$ بقيم أصغر من 46: $45 - 3 = 42$ ، فأصغر قيمة $3$ وأكبرها $45$. الوسيط $9$ هو القيمة الثالثة. المتوسط $15{,}4$ يعني أنّ المجموع $5 \\times 15{,}4 = 77$ ، فالقيمتان الباقيتان مجموعهما $77 - 3 - 9 - 45 = 20$ : واحدة بين $3$ و $9$ (هي $5$) وواحدة بين $9$ و $45$ (هي $15$).',
  },
};

export default function Module03Taraiq() {
  const [r1, setR1] = useState(false);
  const [q1, setQ1] = useState(false);
  const [r1b, setR1b] = useState(false);
  const [r2, setR2] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      objectives={["ماذا يحدث للمتوسط والوسيط والمدى حين نضيف قيمتين متباعدتين؟", "كيف نعيّن وسيط جدول كبير دون كتابة كل قيمه؟", "هل أجد سلسلة تحقّق شروطًا معطاة؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — الوسيط بالرتب والقيم المتطرّفة"
      moduleSubtitle="تعيين وتفسير متوسط ووسيط ومدى سلسلة إحصائية"
      estimatedTime="8 دقائق"
      brief={{
        tag: 'طرائق — الكتاب ص 97', title: METHOD_1.title, tone: 'emerald',
        body: <p><MathText>{'على الميزان سحبتَ قيمة بعيدة ولاحظتَ أثرها على المؤشّرين. الكتاب يختبر ذلك على سلسلة من 15 قيمة، ثم يعلّمنا تعيين الوسيط بالرتب دون كتابة كل القيم.'}</MathText></p>,
      }}
      steps={[
        {
          num: 1, title: 'المتوسط والوسيط والمدى', subtitle: 'طرائق — التمرين 1', done: r1 && q1 && r1b,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_1} onAllRevealed={() => setR1(true)} />
              {r1 && (
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'قبل قراءة الحلّ: نضيف القيمتين $3$ و $43$ إلى السلسلة (17 قيمة). عيّن:'}</MathText></p>}
                  rows={[
                    // 136/15 : nouvelle somme ÷ ANCIEN effectif ; 6 : l'ancienne moyenne
                    { id: 'm', label: 'المتوسط الجديد', options: ['$6$', '$\\dfrac{136}{15}$', '$8$'].map(Opt), correct: 2, correction: <MathText>{'$\\dfrac{90 + 3 + 43}{17} = \\dfrac{136}{17} = 8$ : نقسم على العدد الجديد للقيم $17$.'}</MathText> },
                    // 6 = 9e valeur de l'ancienne série rangée ; 43 = la valeur ajoutée
                    { id: 'med', label: 'الوسيط الجديد', options: ['$5$', '$6$', '$43$'].map(Opt), correct: 0, correction: <MathText>{'17 قيمة: الوسيط القيمة ذات الرتبة $9$ ، وهي $5$ (أضفنا قيمة صغيرة وقيمة كبيرة: الوسط لم يتحرّك).'}</MathText> },
                    // 43 = la plus grande valeur ; 8 = l'ancienne étendue
                    { id: 'r', label: 'المدى الجديد', options: ['$43$', '$40$', '$8$'].map(Opt), correct: 1, correction: <MathText>{'$43 - 3 = 40$'}</MathText> },
                  ]}
                  requires={['mutawassit-mutawazin', 'wasit', 'mada']}
                  feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'قارن بحلّ الكتاب أدناه.' : 'راجع التصحيح، ثم اقرأ حلّ الكتاب أدناه.'}</Feedback>}
                  onAnswered={() => setQ1(true)}
                />
              )}
              {q1 && <MethodSteps method={METHOD_1B} onAllRevealed={() => setR1b(true)} />}
              {r1b && <KnowledgeBrick id="qiyam-mutatarrifa" lead="ماذا نلاحظ؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الوسيط بالرتب', subtitle: 'طرائق — التمرين 2', done: r2 && q2a && q2b,
          content: (
            <div className="space-y-3">
              <PredictRule id="wasit-rutba"><MethodSteps method={METHOD_2} onAllRevealed={() => setR2(true)} /></PredictRule>
              {r2 && (
                <>
                  <KnowledgeBrick id="wasit-rutba" lead="الطريقة، كما تعلّمها الكتاب:" />
                  <FreqTable testId="ranks" rows={[{ head: 'العلامة', cells: ['10', '11', '12', '13'] }, { head: 'التكرار', cells: ['9', '8', '10', '8'] }]} />
                  <NumericQuestion
                    prompt={<MathText>{'وسيط هذه السلسلة (التكرار الكلّي $35$) هو:'}</MathText>}
                    expected={12}
                    display="12"
                    requires={['wasit-rutba']}
                    explain={<MathText>{'$N = 35$ فردي: رتبة الوسيط $\\dfrac{35 + 1}{2} = 18$. التكرارات المجمعة الصاعدة $9$ ، $17$ ، $27$ : الرتبة $18$ في العلامة $12$.'}</MathText>}
                    onAnswered={() => setQ2a(true)}
                  />
                  <TapQuestion
                    prompt={<MathText>{'سلسلة مرتّبة تكرارها الكلّي $48$. وسيطها هو:'}</MathText>}
                    options={[
                      'القيمة ذات الرتبة $24$',
                      'منتصف القيمتين ذواتي الرتبتين $24$ و $25$',
                      'القيمة ذات الرتبة $24{,}5$',
                    ].map(Opt)}
                    correct={1}
                    cols={1}
                    requires={['wasit-rutba']}
                    explain={<MathText>{'$48$ زوجي: الرتبتان $\\dfrac{48}{2} = 24$ و $25$ ، والوسيط منتصف القيمتين اللتين تحملانهما. لا توجد رتبة $24{,}5$ : $24{,}5$ يقع بين رتبتين.'}</MathText>}
                    onAnswered={() => setQ2b(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'دوري الآن', subtitle: 'قواسم 225', done: q3,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="wasit-rutba" variant="rappel" compact />
              <TextbookExercise exercise={NOW_EXERCISE} requires={['wasit-rutba', 'mada', 'mutawassit-mutawazin']} onAnswered={() => setQ3(true)} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
