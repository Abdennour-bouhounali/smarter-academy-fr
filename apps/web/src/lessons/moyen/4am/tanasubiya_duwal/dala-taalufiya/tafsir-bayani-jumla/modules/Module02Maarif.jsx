import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag, PairQuestion } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, EXAMPLE } from '../content/textbook';
import LinesFigure from '../components/LinesFigure';

/**
 * Module 2 — معارف. Le manuel fourni n'en a pas pour cette leçon : la formalisation est celle de la plateforme
 * (content/textbook.js › KNOWLEDGE, `knowledge_formalization`), chaque encadré porte son étiquette d'ajout.
 *   1. l'équation et sa droite (brique muadala-mustaqim) — écrire y = ax + b, un point sur la droite ;
 *   2. le حل = l'intersection (brique hall-taqatu) — lecture sur une figure dessinée ;
 *   3. la méthode graphique et la vérification par le calcul (brique hall-bayani), la lecture approchée
 *      (brique qiraa-taqribiya) ;
 *   4. les trois cas sur le lab TENU (line-crossing, startWith="cases", x + y = 3 et 2x − y = 0), puis la brique
 *      halat-thalath et un classement de trois جمل.
 * Les questions utilisent d'AUTRES nombres que les encadrés (la réponse n'est jamais au-dessus).
 * « أتوقّع القاعدة » : chaque encadré qui ÉNONCE la règle juste avant sa brique est enveloppé
 * (PredictRule par id, prompt = item.predictPrompt de knowledge.jsx) — une seule prédiction, puis encadré et brique.
 * RÉTROFIT 2026-10-15 (une piste) : chaque étape s'OUVRE sur sa question (écrire y = ax + b ; lire le حل sur la figure ; vérifier la
 * lecture d'Amine ; la lecture approchée de Sara) ; l'encadré et la brique viennent APRÈS la réponse (les `requires` des questions
 * ne citent plus la brique qui les suit). Le lab des trois cas ouvre l'étape 4 avec sa question. LP : P1, P2, P3.
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;
const CASES = ['حلّ وحيد', 'لا حلّ', 'عدد لا نهائي من الحلول'];

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — مستقيمان ونقطة"
      moduleSubtitle="المعادلة والمستقيم، الحل ونقطة التقاطع، الحالات الثلاث"
      estimatedTime="13 دقيقة"
      objectives={[
        'ماذا ترسم معادلة من الدرجة الأولى بمجهولين؟',
        'أين نقرأ حلّ الجملة على الرسم؟',
        'كيف نتأكّد من قراءتنا؟',
        'كم حلًّا للجملة حين يتحرّك أحد المستقيمين؟',
      ]}
      brief={{
        tag: 'معارف — من المنصّة', title: 'التفسير البياني لحل جملة معادلتين', tone: 'violet',
        body: <p><MathText>{'في صندوق القسم صار كل شرط مستقيمًا. ماذا نقول الآن عن أيّ جملة؟ وماذا يحدث لحلّها حين لا يتقاطع المستقيمان؟'}</MathText></p>,
      }}
      steps={[
        {
          num: 1, title: 'ماذا ترسم معادلة؟', subtitle: 'المعادلة والمستقيم', done: q1a && q1b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'المعادلة $3x + 2y = 8$ تُكتب على الشكل $y = ax + b$ :'}</MathText>}
                options={['$y = -\\dfrac{3}{2}x + 4$', '$y = \\dfrac{3}{2}x + 4$', '$y = -3x + 8$', '$y = -\\dfrac{3}{2}x + 8$'].map(Opt)}
                correct={0}
                cols={2}
                requires={['azl-y']}
                explain={<MathText>{'$2y = -3x + 8$ ، ثم نقسم كل الحدود على 2: $y = -\\dfrac{3}{2}x + 4$ . أمّا $\\dfrac{3}{2}x$ فتنسى تغيير الإشارة، و $-3x + 8$ تنسى القسمة على 2، و $+ 8$ تقسم حدًّا واحدًا فقط.'}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'هل النقطة على مستقيم المعادلة $3x + 2y = 8$ ؟'}</MathText></p>}
                rows={[
                  { id: 'p21', label: <MathText>{'$(2 ; 1)$'}</MathText>, options: ['نعم', 'لا'], correct: 0, correction: <MathText>{'$3 \\times 2 + 2 \\times 1 = 8$ : تحقّق المعادلة، فهي على المستقيم.'}</MathText> },
                  { id: 'p12', label: <MathText>{'$(1 ; 2)$'}</MathText>, options: ['نعم', 'لا'], correct: 1, correction: <MathText>{'$3 \\times 1 + 2 \\times 2 = 7 \\neq 8$ : قلبنا إحداثيي النقطة الأولى فقط.'}</MathText> },
                  { id: 'p04', label: <MathText>{'$(0 ; 4)$'}</MathText>, options: ['نعم', 'لا'], correct: 0, correction: <MathText>{'$3 \\times 0 + 2 \\times 4 = 8$ : هي النقطة $(0 ; b)$ مع $b = 4$.'}</MathText> },
                ]}
                requires={['tamthil-taalufi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'نقطة على المستقيم ⇔ إحداثياها يحقّقان المعادلة.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1b(true)}
              />
              {q1a && q1b && (
                <>
                  <PredictRule id="muadala-mustaqim"><TextbookBox kind="property" title={KNOWLEDGE.equationLine.title} lines={[KNOWLEDGE.equationLine.text, KNOWLEDGE.equationLine.example]} source={KNOWLEDGE.equationLine.source} compact /></PredictRule>
                  <KnowledgeBrick id="muadala-mustaqim" lead="ما فعلته بالبطاقات في النشاط، لكل معادلة:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'أين نقرأ حلّ الجملة؟', subtitle: 'الحل على الرسم', done: q2,
          content: (
            <div className="space-y-3">
              <LinesFigure testId="maarif-2" win={{ xMin: -1, xMax: 6, yMin: -2, yMax: 6 }}
                lines={[{ a: 1, b: -1, label: '(d₁)' }, { a: -1, b: 5, label: '(d₂)' }]}
                caption="الشكل: المستقيمان (d₁) و (d₂) اللذان يمثّلان معادلتي الجملة، في معلم وحدته مربّع واحد." />
              <PairQuestion
                prompt={<MathText>{'اقرأ على الشكل حلّ الجملة $\\begin{cases} x - y = 1 \\\\ x + y = 5 \\end{cases}$ : $(x ; y)$ ='}</MathText>}
                expected={{ x: '3', y: '2' }}
                requires={['tamthil-taalufi', 'thunaiya-hall']}
                explain={<MathText>{'المستقيمان يتقاطعان في النقطة التي فاصلتها 3 وترتيبها 2، و $3 - 2 = 1$ و $3 + 2 = 5$ : الحل $(3 ; 2)$ — الفاصلة أولًا.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <PredictRule id="hall-taqatu"><TextbookBox kind="property" title={KNOWLEDGE.solutionPoint.title} text={KNOWLEDGE.solutionPoint.text} source={KNOWLEDGE.solutionPoint.source} compact /></PredictRule>
                  <KnowledgeBrick id="hall-taqatu" lead="ما رأيته بالمصباحين، لكل جملة:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف نحلّ جملة بيانيًا؟', subtitle: 'ثم كيف نتأكّد من القراءة؟', done: q3a && q3b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'قرأ أمين على الشكل أنّ نقطة تقاطع مستقيمي الجملة $\\begin{cases} x + 2y = 7 \\\\ 2x - y = 4 \\end{cases}$ هي $(3 ; 2)$ . نتحقّق:'}</MathText>}
                options={[
                  '$3 + 2 \\times 2 = 7$ و $2 \\times 3 - 2 = 4$ : قراءته صحيحة',
                  '$3 + 2 \\times 2 = 7$ يكفي: قراءته صحيحة دون الحاجة إلى المعادلة الثانية',
                  '$2 + 2 \\times 3 = 8 \\neq 7$ : قراءته خاطئة',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['thunaiya-hall']}
                explain={<MathText>{'نعوّض $x$ بالفاصلة 3 و $y$ بالترتيب 2 في المعادلتين معًا: $3 + 4 = 7$ و $6 - 2 = 4$. والاقتراح الثالث يعوّض بالعكس ($x = 2$ ، $y = 3$).'}</MathText>}
                onAnswered={() => setQ3a(true)}
              />
              {q3a && (
                <>
                  <PredictRule id="hall-bayani"><TextbookBox kind="method" title={KNOWLEDGE.method.title} lines={KNOWLEDGE.method.steps} source={KNOWLEDGE.method.source} compact /></PredictRule>
                  <KnowledgeBrick id="hall-bayani" lead="الطريقة، خطوةً خطوة:" />
                </>
              )}
              <TapQuestion
                prompt={<MathText>{'قرأت سارة على الشكل أنّ مستقيمي الجملة $\\begin{cases} y = 2x \\\\ y = -x + 4 \\end{cases}$ يتقاطعان في $(1 ; 3)$ تقريبًا. ماذا نقول؟'}</MathText>}
                options={[
                  'قراءة تقريبية: $(1 ; 3)$ لا تحقّق $y = 2x$ ، والحل المضبوط يعطيه الحساب: $\\left(\\dfrac{4}{3} ; \\dfrac{8}{3}\\right)$',
                  '$(1 ; 3)$ هو الحل المضبوط لأنّه مقروء على الشكل',
                  'الجملة لا تقبل حلًّا لأنّ نقطة التقاطع لا تُقرأ بدقة',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['hall-jabri']}
                explain={<MathText>{'$2 \\times 1 = 2 \\neq 3$ : القراءة تقريبية. بالتعويض: $2x = -x + 4$ ومنه $x = \\dfrac{4}{3}$ ثم $y = \\dfrac{8}{3}$ ؛ ونتحقّق: $-\\dfrac{4}{3} + 4 = \\dfrac{8}{3}$. والمستقيمان متقاطعان فعلًا: للجملة حلّ.'}</MathText>}
                onAnswered={() => setQ3b(true)}
              />
              {q3b && (
                <>
                  <PredictRule id="qiraa-taqribiya"><TextbookBox kind="remark" title={KNOWLEDGE.approx.title} text={KNOWLEDGE.approx.text} source={KNOWLEDGE.approx.source} compact /></PredictRule>
                  <KnowledgeBrick id="qiraa-taqribiya" lead="لماذا نتحقّق دائمًا بالحساب:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'حين يتحرّك المستقيم (2)', subtitle: 'كم حلًّا للجملة؟', done: q4,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700"><MathText>{EXAMPLE.lines[0]}</MathText> <SourceTag source={EXAMPLE.source} /></p>
              <Manipulation
                type="line-crossing"
                system={EXAMPLE.system}
                startWith="cases"
                theme="laser"
                levels={false}
                title="المستقيم (2) بيدك"
                lead={<MathText>{'المستقيم (1) هو $y = -x + 3$ ولا يتحرّك. حرّك b و a للمستقيم (2): اجعله يقطع (1)، ثم يوازيه، ثم ينطبق عليه — وحرّك P في كل حالة.'}</MathText>}
              />
              <PredictRule id="halat-thalath" prompt={"حرّكت المستقيم (2) فجعلته يقطع (1)، ثم يوازيه، ثم ينطبق عليه. كم حلًّا للجملة في كل حالة؟ وكيف نعرف الحالة بمقارنة $a$ و $b$ للمستقيمين؟"}><TextbookBox kind="property" title={KNOWLEDGE.cases.title} lines={[...KNOWLEDGE.cases.items, KNOWLEDGE.cases.link]} source={KNOWLEDGE.cases.source} compact /></PredictRule>
              <KnowledgeBrick id="halat-thalath" lead="ما صنعته بالمستقيم (2)، بالكلمات:" />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">عدد حلول الجملة:</p>}
                rows={[
                  { id: 'h1', label: <MathText>{'$\\begin{cases} y = -2x + 1 \\\\ y = -2x + 4 \\end{cases}$'}</MathText>, options: CASES, correct: 1, correction: <MathText>{'معامل التوجيه نفسه $-2$ وترتيبان مختلفان: متوازيان، لا حلّ.'}</MathText> },
                  { id: 'h2', label: <MathText>{'$\\begin{cases} y = x + 3 \\\\ 2y = 2x + 6 \\end{cases}$'}</MathText>, options: CASES, correct: 2, correction: <MathText>{'$2y = 2x + 6$ تُكتب $y = x + 3$ : منطبقان، عدد لا نهائي من الحلول.'}</MathText> },
                  { id: 'h3', label: <MathText>{'$\\begin{cases} y = 4x \\\\ y = x + 3 \\end{cases}$'}</MathText>, options: CASES, correct: 0, correction: <MathText>{'معاملا التوجيه $4$ و $1$ مختلفان: متقاطعان، حلّ وحيد هو $(1 ; 4)$.'}</MathText> },
                ]}
                requires={['halat-thalath']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'معامل التوجيه أولًا، ثم الترتيب عند المبدأ.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
