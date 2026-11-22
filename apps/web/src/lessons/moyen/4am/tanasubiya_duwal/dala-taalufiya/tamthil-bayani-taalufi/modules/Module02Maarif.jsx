import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, METHOD_DRAW, COMMON_ERRORS } from '../content/textbook';
import AffineFigure from '../components/AffineFigure';

/**
 * Module 2 — معارف, ÉCRITES PAR LA PLATEFORME (le manuel fourni n'a pas de معارف pour cette unité ; déclaré
 * `addition('knowledge_formalization')`, affiché comme tel par SourceTag) :
 *   1. la propriété : une droite par (0 ; b), parallèle à celle de x ⟼ ax ; le cas b = 0 (brique tamthil-taalufi) ;
 *   2. les deux noms et la marche : a = معامل التوجيه, le sens ; b = الترتيب عند المبدأ (brique muamil-tawjih) ;
 *   3. طريقة : deux points suffisent — d'abord la main (le lab en tracé, O refusé), puis la méthode écrite (h = −2x + 4)
 *      révélée ligne à ligne (brique rasm-taalufi).
 * Les questions utilisent d'AUTRES nombres que les encadrés. LP : P1, P2.
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;
const DIR = ['يصعد', 'ينزل', 'يوازي محور الفواصل'];

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المستقيم الذي يمثّل دالة تآلفية"
      moduleSubtitle="التمثيل البياني، معامل التوجيه، الرسم بنقطتين"
      estimatedTime="11 دقيقة"
      objectives={[
        'أين يقطع تمثيل دالة تآلفية محور التراتيب؟',
        'متى يصعد المستقيم ومتى ينزل؟',
        'كم نقطة تكفي لرسم المستقيم؟',
      ]}
      brief={{
        tag: 'معارف — صياغة من المنصّة', title: KNOWLEDGE.title, tone: 'violet',
        body: <p><MathText>{'في النشاط 3 رفعت المستقيم $(d)$ بـ $1$ فصار $(d\')$ ، ورأيته يقطع محور التراتيب في $(0 ; 1)$ . الكتاب لا يكتب هنا معارف لهذه الوحدة: هذه صياغة المنصّة لما رأيته، لكل دالة تآلفية.'}</MathText></p>,
      }}
      steps={[
        {
          num: 1, title: 'أين يقطع المستقيم محور التراتيب؟', subtitle: 'الخاصية', done: q1a && q1b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'التمثيل البياني للدالة $k : x \\longmapsto 0{,}5x - 4$ يقطع محور التراتيب في النقطة:'}</MathText>}
                options={['$(0 ; -4)$', '$(-4 ; 0)$', '$(0 ; 0{,}5)$', 'O'].map(Opt)}
                correct={0}
                cols={2}
                requires={['tartib-mabda']}
                explain={<MathText>{'$k(0) = 0{,}5 \\times 0 - 4 = -4$ : النقطة $(0 ; -4)$ . أمّا $(-4 ; 0)$ فقلبٌ للإحداثيين، و $0{,}5$ معامل $x$ لا الحدّ الثابت، و O ليست من التمثيل لأنّ $k(0) \\neq 0$ .'}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && <KnowledgeBrick id="tartib-mabda" variant="rappel" compact />}
              {q1a && (
              <PredictRule id="tamthil-taalufi">
                <TextbookBox kind="property" text={KNOWLEDGE.property} source={KNOWLEDGE.source} compact />
                <TextbookBox kind="remark" text={KNOWLEDGE.special} source={KNOWLEDGE.source} compact />
              </PredictRule>
              )}
              {q1a && <KnowledgeBrick id="tamthil-taalufi" lead="ما رأيته في النشاط 3، لكل دالة تآلفية:" />}
              {q1a && (
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'هل النقطة من المستقيم $y = 0{,}5x - 4$ ؟'}</MathText></p>}
                rows={[
                  { id: 'p8', label: <MathText>{'$(8 ; 0)$'}</MathText>, options: ['نعم', 'لا'], correct: 0, correction: <MathText>{'$0{,}5 \\times 8 - 4 = 0$ .'}</MathText> },
                  { id: 'o', label: <MathText>{'$O(0 ; 0)$'}</MathText>, options: ['نعم', 'لا'], correct: 1, correction: <MathText>{'$k(0) = -4 \\neq 0$ : المستقيم لا يشمل المبدأ.'}</MathText> },
                  { id: 'p2', label: <MathText>{'$(2 ; 1)$'}</MathText>, options: ['نعم', 'لا'], correct: 1, correction: <MathText>{'$0{,}5 \\times 2 - 4 = -3 \\neq 1$ : $(2 ; 1)$ من تمثيل $0{,}5x$ لا من تمثيل $0{,}5x - 4$ .'}</MathText> },
                ]}
                requires={['tamthil-taalufi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نقطة من المستقيم ترتيبها صورة فاصلتها.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1b(true)}
              />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'معامل التوجيه', subtitle: 'ماذا يحدث لكل وحدة نتقدّمها؟', done: q2a && q2b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'المستقيمان اللذان يمثّلان الدالتين $x \\longmapsto 2x + 1$ و $x \\longmapsto 2x - 3$ :'}</MathText>}
                options={[
                  'متوازيان: لهما المعامل $2$ نفسه في عبارتيهما، ويقطعان محور التراتيب في نقطتين مختلفتين.',
                  'يتقاطعان في النقطة $(0 ; 2)$ .',
                  'منطبقان لأنّ لهما المعامل $2$ نفسه.',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['tamthil-taalufi']}
                explain={<MathText>{'كلاهما تمثيل $x \\longmapsto 2x$ مرفوعًا: الأول بـ $1$ والثاني بـ $-3$ ، فهما متوازيان ويقطعان محور التراتيب في $(0 ; 1)$ و $(0 ; -3)$ . لا يتقاطعان، ولا ينطبقان لأنّ $1 \\neq -3$ .'}</MathText>}
                onAnswered={() => setQ2b(true)}
              />
              {q2b && (
              <>
              <TextbookBox kind="definition" text={KNOWLEDGE.names} source={KNOWLEDGE.source} compact />
              <PredictRule id="muamil-tawjih" prompt={"على المستقيمات $y = ax + b$ التي رأيتها: عندما نتقدّم وحدة واحدة إلى اليمين، بكم يتغيّر الترتيب؟ ومتى «يصعد» المستقيم، ومتى «ينزل»، ومتى يوازي محور الفواصل؟"}><TextbookBox kind="property" text={KNOWLEDGE.slope} source={KNOWLEDGE.source} compact /></PredictRule>
              <TextbookBox kind="example" text={KNOWLEDGE.example} source={KNOWLEDGE.source} compact />
              <AffineFigure testId="know-example" win={{ xMin: -1, xMax: 3, yMin: -4, yMax: 3 }} height={220} width={200}
                lines={[{ a: 2, b: -3, label: '(Δ)', color: '#7C2D12' }]}
                points={[{ x: 0, y: -3 }, { x: 1, y: -1 }, { x: 2, y: 1 }]}
                caption="الشكل: المستقيم يقطع محور التراتيب في $(0 ; -3)$ ويصعد $2$ لكل وحدة إلى اليمين."
                ariaLabel="مستقيم يقطع محور التراتيب في النقطة (0 ; −3) ويصعد" />
              <KnowledgeBrick id="muamil-tawjih" lead="الاسمان، والدرجة:" />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">من اليسار إلى اليمين، التمثيل البياني للدالة:</p>}
                rows={[
                  { id: 'm1', label: <MathText>{'$x \\longmapsto -3x + 5$'}</MathText>, options: DIR, correct: 1, correction: <MathText>{'معامل التوجيه $-3 < 0$ : ينزل (الحدّ $5$ لا يغيّر المنحى).'}</MathText> },
                  { id: 'm2', label: <MathText>{'$x \\longmapsto 0{,}5x - 2$'}</MathText>, options: DIR, correct: 0, correction: <MathText>{'معامل التوجيه $0{,}5 > 0$ : يصعد، رغم أنّ $-2 < 0$ .'}</MathText> },
                  { id: 'm3', label: <MathText>{'$x \\longmapsto 4$'}</MathText>, options: DIR, correct: 2, correction: <MathText>{'$a = 0$ : دالة ثابتة، مستقيمها يوازي محور الفواصل ويقطع محور التراتيب في $(0 ; 4)$ .'}</MathText> },
                ]}
                requires={['muamil-tawjih']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'إشارة معامل التوجيه وحدها تعيّن المنحى.' : 'راجع التصحيح: انظر إلى معامل x لا إلى الحدّ الثابت.'}</Feedback>}
                onAnswered={() => setQ2a(true)}
              />
              </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'كم نقطة نحتاج لرسم المستقيم؟', subtitle: 'طريقة', done: q3,
          content: (
            <div className="space-y-3">
              <Manipulation
                type="affine-line"
                a="2"
                b="-3"
                mode="draw"
                xMin="-1" xMax="3" yMin="-5" yMax="3"
                theme="ramp"
                levels={false}
                title="نرسم تمثيل الدالة f(x) = 2x − 3"
                lead={<MathText>{'ضع نقطتين من تمثيل $f(x) = 2x - 3$ . جرّب أيضًا المبدأ O: هل يقبله المعلم؟'}</MathText>}
              />
              <TapQuestion
                prompt={<MathText>{'لرسم التمثيل البياني للدالة $f : x \\longmapsto 3x - 1$ نرسم المستقيم الذي يشمل النقطتين:'}</MathText>}
                options={[
                  COMMON_ERRORS.mabda.right,
                  COMMON_ERRORS.mabda.wrong,
                  '$(0 ; 3)$ و $(1 ; 2)$',
                  '$(-1 ; 0)$ و $(0 ; 3)$ .',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['tamthil-taalufi']}
                explain={<MathText>{`${COMMON_ERRORS.mabda.why} الصحيح: ${COMMON_ERRORS.mabda.right} أمّا $(0 ; 3)$ فتخلط بين المعاملين ($f(0) = -1$)، و $f(-1) = -4 \\neq 0$ .`}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
              <>
              {/* La طريقة vient APRÈS la réponse (nommer après avoir fait) ; elle révèle sa règle : prédiction d'abord. */}
              <PredictRule id="rasm-taalufi"><MethodSteps method={METHOD_DRAW} /></PredictRule>
              <KnowledgeBrick id="rasm-taalufi" lead="الطريقة:" />
              </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
