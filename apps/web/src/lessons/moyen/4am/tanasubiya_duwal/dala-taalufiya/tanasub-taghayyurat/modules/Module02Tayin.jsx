import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { TextbookBox, SourceTag, MethodSteps, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CHALLENGE, CHALLENGE_READ, KNOWLEDGE, METHOD, MISTAKES, LAB, BEGINNER_M2 } from '../content/textbook';
import { addition } from '../../_unit/unitMeta';
import ChallengeGraph from '../components/ChallengeGraph';

/**
 * Module 2 — تعيين دالة تآلفية من عددين وصورتيهما (UNDERSTAND → TOUCH → FORMALIZE). Le manuel n'a ni معارف
 * ni طرائق : tout ce qui est enseigné ici est une formalisation DÉCLARÉE (`knowledge_formalization`).
 *
 * Le laboratoire revient en mode « deux couples » (f INCONNUE) : متقدم par défaut = le تحدّ de la page
 * d'ouverture (doublon déclaré, (10 ; 50) et (30 ; 86), monde thermo) ; مبتدئ = un abonnement de la
 * plateforme (4 ; 1300) et (10 ; 2500). Puis :
 *   1. POURQUOI le quotient vaut a : f(x₁) − f(x₂) = a(x₁ − x₂), et la condition x₁ ≠ x₂ (le lab l'a refusée) ;
 *   2. le تحدّ : f(10) lu, a = 1,8 (l'erreur a = 36 expliquée), b = 32 (l'erreur b = 50 ÷ 10 expliquée), f(x) ;
 *   3. la méthode ligne à ligne, puis la SECONDE méthode : la جملة معادلتين en a et b (unité 5) ;
 *   4. vérifier : une fonction à coefficient négatif, chaque distracteur trahi par un des deux couples.
 * LP : P1 (1, 2), P2 (2, 3, 4).
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;
const near = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;

const SYSTEM_EXERCISE = {
  id: 'm2-jumla', source: addition('interaction_generation'), learningPointId: '4am_tanasub-taghayyurat_P2', difficulty: 'moyen',
  statement: '$f$ دالة تآلفية حيث $f(2) = 7$ و $f(6) = 19$ . اكتب الجملة $\\begin{cases} 2a + b = 7 \\\\ 6a + b = 19 \\end{cases}$ وحلّها.',
  interaction: 'pair',
  question: {
    prompt: 'حلّ الجملة:',
    expected: { x: '3', y: '1' },
    names: ['a', 'b'],
    explain: 'بطرح المعادلة الأولى من الثانية: $4a = 12$ ، أي $a = 3$ ، ثم $b = 7 - 2 \\times 3 = 1$ : $f(x) = 3x + 1$ . وبتناسب التغيّرات: $a = \\dfrac{19 - 7}{6 - 2} = \\dfrac{12}{4} = 3$ — النتيجة نفسها.',
  },
};

/** La TRACE d'une suite de questions posée par-dessus le labo (LabCheckpoint) : l'étape est faite quand la suite l'est. */
function Trace({ id, done, children, idle }) {
  return (
    <p data-checkpoint-trace={id} data-tried={done ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${done ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {done ? children : idle}
    </p>
  );
}

export default function Module02Tayin() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q2c, setQ2c] = useState(false);
  const [q2d, setQ2d] = useState(false);
  const [read, setRead] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [cps, setCps] = useState([]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : a (étape « find ») puis b (étape « b ») y sont posées ; coupées par l'enseignant, les questions d'origine reviennent
  const cpOn = useLabCheckpointSettings('slope-stairs').enabled;
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const doneA = cpOn ? answered('find') : q2b;
  const doneB = cpOn ? answered('b') : q2c;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="تعيين دالة تآلفية من عددين وصورتيهما"
      moduleSubtitle="لماذا يساوي الحاصل a ، ثم من 10 و 30 درجة سلسيوس إلى الفهرنهايت"
      estimatedTime="12 دقيقة"
      objectives={[
        'لماذا يبقى حاصل القسمة نفسه مهما كان العددان؟',
        'كيف نجد عبارة دالة لا نعرف منها إلا عددين وصورتيهما؟',
        'هل توجد طريقة ثانية؟',
        'كيف نتحقّق من عبارتنا؟',
      ]}
      intro={
        // LE LABO OUVRE LE MODULE (§4quater) : ni carte du manuel (le تحدّ devient le `lead` du niveau متقدم), ni titre / `lead` de workspace.
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation type="slope-stairs" level="beginner" {...LAB.m2.beginner}
                lead={<MathText>{BEGINNER_M2.text}</MathText>} onCheckpoint={onCheckpoint} />
            ),
            advanced: () => (
              <Manipulation type="slope-stairs" level="advanced" {...LAB.m2.advanced}
                lead={<MathText>{`محرار بتدريجتين: $x$ درجة الحرارة بالسلسيوس و $f(x)$ بالفهرنهايت. لا نعرف عبارة $f(x)$ ، لكن نعرف صورتي عددين.`}</MathText>} onCheckpoint={onCheckpoint} />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا يبقى الحاصل نفسه؟', subtitle: 'ماذا يحدث للحدّ الثابت b؟', done: q1a && q1b,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'أكمل البرهان من أجل $f(x) = 5x - 2$ :'}</MathText></p>}
                rows={[
                  { id: 'p1', label: <MathText>{'$f(x_1) - f(x_2) = (5x_1 - 2) - (5x_2 - 2) =$'}</MathText>, options: ['$5x_1 - 5x_2 - 4$', '$5x_1 - 5x_2$', '$5x_1 + 5x_2$'].map(Opt), correct: 1,
                    correction: <MathText>{'$-2 - (-2) = 0$ : الحدّ الثابت يختفي، فيبقى $5x_1 - 5x_2$ .'}</MathText> },
                  { id: 'p2', label: <MathText>{'$5x_1 - 5x_2 =$'}</MathText>, options: ['$5(x_1 - x_2)$', '$5 - (x_1 - x_2)$', '$x_1 - 5x_2$'].map(Opt), correct: 0,
                    correction: <MathText>{'نخرج العامل المشترك 5 : $5x_1 - 5x_2 = 5(x_1 - x_2)$ ، ومنه $\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2} = 5$ .'}</MathText> },
                ]}
                requires={['tanasub-taghayyurat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? 'أحسنت: $f(x_1) - f(x_2) = 5(x_1 - x_2)$ ، والحاصل $5$ مهما كان العددان.' : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <TapQuestion
                  prompt={<MathText>{'لماذا نشترط أن يكون العددان $x_1$ و $x_2$ متمايزين؟'}</MathText>}
                  options={[
                    'لأنّ الحاصل يصير سالبًا إذا تساوى العددان',
                    'لأنّ $x_1 - x_2$ مقام الحاصل، والقسمة على 0 مستحيلة',
                    'لأنّ لعددين متساويين صورتين مختلفتين',
                  ].map(Opt)}
                  correct={1}
                  cols={1}
                  requires={['tanasub-taghayyurat']}
                  explain={<MathText>{KNOWLEDGE.burhan.warning}</MathText>}
                  onAnswered={() => setQ1b(true)}
                />
              )}
              {q1b && (
                <>
              {/* La preuve ÉNONCE la règle burhan-taghayyurat : elle vient APRÈS les deux réponses, et l'élève la prédit d'abord. */}
              <PredictRule id="burhan-taghayyurat">
                <TextbookBox kind="property" title={KNOWLEDGE.burhan.title} lines={[...KNOWLEDGE.burhan.lines, KNOWLEDGE.burhan.remark]} source={KNOWLEDGE.burhan.source} compact />
              </PredictRule>
              <KnowledgeBrick id="burhan-taghayyurat" lead="ما رأيته في كل درجاتك، مبرهنًا:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'التحدّي', subtitle: 'من الدرجة سلسيوس إلى الفهرنهايت', done: q2a && doneA && doneB && q2d,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" title={CHALLENGE.title} lines={[CHALLENGE.text, ...CHALLENGE.questions]} source={CHALLENGE.source} compact />
              <ChallengeGraph />
              <p className="text-sm text-slate-700"><MathText>{CHALLENGE_READ.text}</MathText> <SourceTag source={CHALLENGE_READ.source} /></p>
              <NumericQuestion
                prompt="1) الدرجة بالفهرنهايت المقابلة لـ 10 درجات سلسيوس:"
                expected={near(CHALLENGE.answer.f10)}
                display="50"
                parse={parseDec}
                requires={['surat-adad-taalufiya']}
                explain={<MathText>{'النقطة التي فاصلتها 10 ترتيبها 50 : $f(10) = 50$ ، أي 50 درجة فهرنهايت.'}</MathText>}
                onAnswered={() => setQ2a(true)}
              />
              {q2a && (cpOn ? (
                <Trace id="find" done={doneA} idle="ابنِ في المخبر الدرجة بين الصورتين المعلومتين، وأجب عن الأسئلة التي تظهر فوقه.">
                  <MathText>{'أجبتَ في المخبر: $a$ هو حاصل قسمة فرق الصورتين على فرق العددين.'}</MathText>
                </Trace>
              ) : (
                <>
                  <NumericQuestion
                    prompt="المعامل $a$ :"
                    expected={near(1.8)}
                    display="1,8"
                    parse={parseDec}
                    requires={['tanasub-taghayyurat']}
                    explain={<MathText>{KNOWLEDGE.hisabA.example}</MathText>}
                    explainFor={(n) => (near(36)(n) ? <MathText>{`خطأ شائع: ${MISTAKES.bidunQisma.wrong} ${MISTAKES.bidunQisma.why}`}</MathText> : near(-1.8)(n) ? <MathText>{`${MISTAKES.tartib.wrong} ${MISTAKES.tartib.why}`}</MathText> : null)}
                    onAnswered={() => setQ2b(true)}
                  />
                </>
              ))}
              {doneA && (
                <>
                  <KnowledgeBrick id="hisab-muamil-a" lead="الدرجة بين 10 و 30 ، حسابًا:" />
                  {cpOn ? (
                    <Trace id="b" done={doneB} idle="انزل في المخبر إلى العدد 0 لتقرأ ترتيب نقطته، وأجب عن الأسئلة التي تظهر فوقه.">
                      <MathText>{'أجبتَ في المخبر: $b$ هو ترتيب النقطة التي فاصلتها 0 ، أي $b = f(x_1) - a x_1$ .'}</MathText>
                    </Trace>
                  ) : (
                    <NumericQuestion
                      prompt="العدد $b$ :"
                      expected={near(CHALLENGE.answer.b)}
                      display="32"
                      parse={parseDec}
                      requires={['hisab-muamil-a']}
                      explain={<MathText>{KNOWLEDGE.hisabB.example}</MathText>}
                      explainFor={(n) => (near(5)(n) ? <MathText>{`خطأ شائع: ${MISTAKES.bNisba.wrong} ${MISTAKES.bNisba.why}`}</MathText> : null)}
                      onAnswered={() => setQ2c(true)}
                    />
                  )}
                </>
              )}
              {doneB && (
                <>
                  <KnowledgeBrick id="hisab-b" lead="بعد a ، العدد b من عدد واحد وصورته:" />
                <TapQuestion
                  prompt="2) عبارة $f(x)$ بدلالة $x$ :"
                  options={['$f(x) = 36x + 50$', '$f(x) = 1{,}8x + 5$', '$f(x) = 1{,}8x + 32$', '$f(x) = 32x + 1{,}8$'].map(Opt)}
                  correct={2}
                  cols={2}
                  requires={['hisab-muamil-a', 'hisab-b']}
                  explain={<MathText>{'$f(x) = 1{,}8x + 32$ ؛ تحقّق: $f(10) = 18 + 32 = 50$ و $f(30) = 54 + 32 = 86$ . أمّا $36x + 50$ فتعطي $f(10) = 410$ ، و $1{,}8x + 5$ تعطي $f(10) = 23$ ، و $32x + 1{,}8$ تعطي $f(10) = 321{,}8$ .'}</MathText>}
                  onAnswered={() => setQ2d(true)}
                />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'طريقتان', subtitle: 'a ثم b ، أو جملة معادلتين', done: read && q3,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD} onAllRevealed={() => setRead(true)} />
              {read && (
                <>
                  {/* La boîte ÉNONCE la méthode tariqat-jumla-ab : l'élève la prédit d'abord. */}
                  <PredictRule id="tariqat-jumla-ab">
                    <TextbookBox kind="method" title={KNOWLEDGE.jumla.title} lines={[KNOWLEDGE.jumla.rule, KNOWLEDGE.jumla.example]} source={KNOWLEDGE.jumla.source} compact />
                  </PredictRule>
                  <KnowledgeBrick id="tariqat-jumla-ab" lead="الطريقة التي تعلّمتها في جمل المعادلتين، بمجهولين a و b :" />
                  <TextbookExercise exercise={SYSTEM_EXERCISE} requires={['tariqat-jumla-ab', 'hall-jumla']} onAnswered={() => setQ3(true)} />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'أتحقّق', subtitle: 'معامل سالب', done: q4,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hisab-b" variant="rappel" compact />
              <TapQuestion
                prompt={<MathText>{'أيّ دالة تآلفية تحقّق $f(-2) = -1$ و $f(2) = 7$ ؟'}</MathText>}
                options={['$f(x) = 8x + 7$', '$f(x) = 2x + 3$', '$f(x) = 2x + 7$', '$f(x) = -2x + 3$'].map(Opt)}
                correct={1}
                cols={2}
                requires={['hisab-muamil-a', 'hisab-b']}
                explain={<MathText>{'$a = \\dfrac{7 - (-1)}{2 - (-2)} = \\dfrac{8}{4} = 2$ ، $b = 7 - 2 \\times 2 = 3$ . تحقّق بالعدد الآخر: $f(-2) = -4 + 3 = -1$ . كل خيار آخر يخطئ صورة $-2$ : $8 \\times (-2) + 7 = -9$ ، $2 \\times (-2) + 7 = 3$ ، $-2 \\times (-2) + 3 = 7$ .'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
                  <MathText>{'كم عددًا وصورة تحتاج لتعيين دالة تآلفية؟ وبأيّ طريقتين؟ وبماذا تتحقّق دائمًا؟ في المحور التالي تتدرّب على جداول ومستقيمات ووضعيات.'}</MathText>
                </p>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
