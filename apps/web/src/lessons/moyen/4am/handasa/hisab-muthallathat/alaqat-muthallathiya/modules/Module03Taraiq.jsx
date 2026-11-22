import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, METHOD_REL, METHOD_CONSTRUCT, NOW, POSSIBLE, LINES } from '../content/textbook';
import TrialsEvidence from '../components/TrialsEvidence';

/**
 * Rétrofit 2026-10-15 : le labo (دوري الآن 2, cos 3/4) EN TÊTE, sans carte ni titre ; ses questions (sur les essais de l'élève) ouvrent les
 * étapes ; la طريقة de construction du livre (figures et solutions) n'est révélée qu'APRÈS la question « pourquoi le compas ici et pas là »,
 * puis la brique insha-zawiya. Ordre actuel : 1 le labo (cos 3/4) → 2 cos 0,6 → 3 دوري الآن 1 → 4 « إن أمكن » → 5 la construction nommée.
 * Module 3 — طرائق (p. 121), stage `formalization` : TOUCH → AUTOMATIZE. Chaque méthode est approchée par une
 * question, puis révélée ligne à ligne (MethodSteps), puis nommée par une brique :
 *   1. « استعمال العلاقات المثلثية » : cos x = 0,6 → sin² x = 0,64 (le distracteur 0,4 : MISC-MUTH-JADHR-NASI) → hisab-nisba ;
 *   2. دوري الآن 1 : sin x = 0,4 → cos x = √21/5 ≈ 0,92, tan x ≈ 0,44 ;
 *   3. « إن أمكن » (FORMULÉ, déclaré) : cos x = 7/6 n'existe pas → shart-imkan ;
 *   4. « إنشاء هندسي لزاوية حادة… » : sin 2/5 (compas) et tan 7/3 (règle) → insha-zawiya ;
 *   5. دوري الآن 2 : cos x = 3/4 FAIT au laboratoire posé seul (`levels={false}`), questions sur les essais de l'élève.
 * « أتوقّع القاعدة » : la solution du manuel (MethodSteps, étape 1) et les deux constructions résolues (étape 4) écrivent
 * la méthode avant sa brique : elles sont enveloppées dans <PredictRule id="hisab-nisba"> et <PredictRule id="insha-zawiya">.
 * shart-imkan est `rappel` : les bornes 0 < sin, cos < 1 sont la règle « hudud » du درس 1 (prérequis hasr-nisab).
 * LP : P2 (1–3), P3 (4–5).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [nowTrials, setNowTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  return (
    <ContentModule
      objectives={['كيف نصل إلى نسبة مجهولة من نسبة معلومة دون قيس الزاوية؟', 'متى يكون الحساب غير ممكن؟', 'أين نضع الأعداد لنرسم الزاوية بالكوس والمدور؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleTitle="طرائق — نسبة من نسبة، وزاوية بالمدور"
      moduleNumber={3}
      moduleSubtitle="نحسب دون قيس الزاوية، وننشئ دون منقلة"
      estimatedTime="13 دقيقة"
      intro={
        <Manipulation type="angle-compass" levels={false} targets={LAB.m3.targets} theme={LAB.m3.theme}
          onTrial={(t) => { if (!t.tk) setNowTrials((x) => [...x, t].slice(-8)); }} />
      }
      steps={[
        {
          num: 1, title: 'ما فعلته في المختبر', subtitle: 'دوري الآن (2)', done: q5,
          content: (
            <div className="space-y-3">
              <TrialsEvidence trials={nowTrials} empty="أنشئ الزاوية في المختبر أعلاه: الكوس، ثم طول على ضلع، ثم المدور." />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'الزاوية x حيث $\\cos x = \\dfrac{3}{4}$ :'}</MathText></p>}
                rows={[
                  { id: 'vertex', label: 'بعد نقل 3 على ضلع ورسم دائرة نصف قطرها 4 مركزها طرف القطعة، رأس الزاوية x هو', options: ['مركز الدائرة', 'النقطة التي قطعتها الدائرة', 'رأس الزاوية القائمة'], correct: 0, correction: <MathText>{'عند مركز الدائرة القطعة 3 مجاورة والقطعة 4 وتر: $\\cos x = \\dfrac{3}{4}$ . (عند نقطة التقاطع 3 مقابل: هناك الجيب هو $\\dfrac{3}{4}$ .)'}</MathText> },
                  { id: 'third', label: 'الضلع الثالث (خاصية فيثاغورس)', options: ['$\\sqrt{7}$', '$5$', '$1$'].map(M), correct: 0, correction: <MathText>{'$4^2 - 3^2 = 7$ : الضلع الثالث $\\sqrt{7}$ و $\\sin x = \\dfrac{\\sqrt{7}}{4}$ . (5 لو كان 3 و 4 ضلعين، و $1 = 4 - 3$ .)'}</MathText> },
                  { id: 'calc', label: <MathText>{'بالحاسبة $\\cos^{-1}\\left(\\dfrac{3}{4}\\right) \\approx$'}</MathText>, options: ['$41{,}4^{\\circ}$', '$48{,}6^{\\circ}$', '$36{,}9^{\\circ}$'].map(M), correct: 0, correction: <MathText>{'$41{,}4^{\\circ}$ وبالمنقلة نحو $41^{\\circ}$ . ($48{,}6^{\\circ}$ هي الزاوية الحادة الأخرى، جيبها $\\dfrac{3}{4}$ .)'}</MathText> },
                ]}
                requires={['fithaghuris']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الإنشاء صحيح، والحاسبة والمنقلة تؤكّدانه.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <TextbookBox kind="exercise" text={NOW.item2} source={NOW.source} compact />}
            </div>
          ),
        },
        {
          num: 2, title: 'من جيب التمام إلى الجيب والظل', subtitle: 'طرائق ص 121', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$\\cos x = 0{,}6$ . قبل أن تقرأ الحل: $\\sin^2 x = 1 - \\cos^2 x =$'}</MathText>}
                options={['$0{,}64$', '$0{,}4$', '$0{,}36$'].map(M)}
                correct={0}
                cols={3}
                requires={['alaqatan']}
                explain={<MathText>{`${LINES.rootRight} ($0{,}4 = 1 - 0{,}6$ نسي المربعين: ${LINES.rootWhy} و $0{,}36$ هو $\\cos^2 x$ .)`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <PredictRule id="hisab-nisba">
                  <MethodSteps method={{ source: METHOD_REL.source, exercise: METHOD_REL.exercise, solution: METHOD_REL.solution }} />
                </PredictRule>
              )}
              {q1 && <KnowledgeBrick id="hisab-nisba" lead="الطريقة كما يكتبها الكتاب:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'دوري الآن (1)', subtitle: 'جيبها 0,4', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW.item1} source={NOW.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">القيمة المضبوطة:</p>}
                rows={[
                  { id: 'c2', label: <MathText>{'$\\cos^2 x = 1 - 0{,}4^2 =$'}</MathText>, options: ['$0{,}84$', '$0{,}6$', '$0{,}16$'].map(M), correct: 0, correction: <MathText>{'$1 - 0{,}16 = 0{,}84$ . ($0{,}6 = 1 - 0{,}4$ دون تربيع، و $0{,}16$ هو $\\sin^2 x$ .)'}</MathText> },
                  { id: 'c', label: <MathText>{'$\\cos x = \\sqrt{0{,}84} = \\sqrt{\\dfrac{21}{25}} =$'}</MathText>, options: ['$\\dfrac{\\sqrt{21}}{5}$', '$\\dfrac{21}{25}$', '$\\dfrac{\\sqrt{21}}{25}$'].map(M), correct: 0, correction: <MathText>{'$\\sqrt{25} = 5$ : $\\cos x = \\dfrac{\\sqrt{21}}{5}$ . ($\\dfrac{21}{25}$ نسي الجذر، و $\\dfrac{\\sqrt{21}}{25}$ لم يأخذ جذر المقام.)'}</MathText> },
                ]}
                requires={['hisab-nisba', 'tabsit-jadhr']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: القيمة المضبوطة دون حاسبة.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2a(true)}
              />
              {q2a && (
                <NumericQuestion
                  prompt={<MathText>{'المدوّر إلى الجزء من 100 للعدد $\\cos x = \\dfrac{\\sqrt{21}}{5}$ :'}</MathText>}
                  expected={0.92} display="0,92" parse={parseDec}
                  requires={['hisab-nisba']}
                  explain={<MathText>{'$\\dfrac{\\sqrt{21}}{5} \\approx 0{,}9165$ ، والمدوّر إلى الجزء من 100 هو $0{,}92$ .'}</MathText>}
                  onAnswered={() => setQ2b(true)}
                />
              )}
              {q2b && (
                <NumericQuestion
                  prompt={<MathText>{'استنتج المدوّر إلى الجزء من 100 للعدد $\\tan x = \\dfrac{\\sin x}{\\cos x}$ (استعمل القيمة المضبوطة، لا 0,92):'}</MathText>}
                  expected={0.44} display="0,44" parse={parseDec}
                  requires={['alaqatan', 'hisab-nisba']}
                  explain={<MathText>{'$\\tan x = 0{,}4 \\div \\dfrac{\\sqrt{21}}{5} = \\dfrac{2}{\\sqrt{21}} \\approx 0{,}4364$ ، والمدوّر $0{,}44$ . ندوّر في النهاية فقط.'}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'إن أمكن', subtitle: 'قبل أي حساب', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'x زاوية حادة. سمير كتب: « $\\cos x = \\dfrac{7}{6}$ ، إذن $\\sin^2 x = 1 - \\dfrac{49}{36}$ ». ما رأيك؟'}</MathText>}
                options={[
                  'لا توجد زاوية حادة جيب تمامها أكبر من 1: الوتر أطول أضلاع المثلث القائم',
                  <MathText key="b">{'الحساب صحيح، و $\\sin x = \\sqrt{\\dfrac{13}{36}}$'}</MathText>,
                  'ممكن إذا كان المثلث كبيرًا بما يكفي',
                ]}
                correct={0}
                cols={1}
                requires={['hasr-nisab', 'hisab-nisba']}
                explain={<MathText>{'$\\dfrac{7}{6} > 1$ و $1 - \\dfrac{49}{36} = -\\dfrac{13}{36} < 0$ : لا جذر ولا زاوية. (و $\\dfrac{13}{36}$ خطأ في الإشارة؛ والنسبة لا تتغيّر مع حجم المثلث.)'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="shart-imkan" variant="rappel" lead="سؤال نطرحه قبل الحساب:" />}
              {q3 && <p className="text-xs text-slate-500"><SourceTag source={POSSIBLE.source} /></p>}
            </div>
          ),
        },
        {
          num: 5, title: 'أين نضع الأعداد لنرسم الزاوية؟', subtitle: 'طرائق ص 121', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في إنشائك لزاوية $\\cos x = \\dfrac{3}{4}$ فتحتَ المدور بالعدد 4 . فلماذا نفتح المدور بمقام الجيب $\\sin x = \\dfrac{2}{5}$ ، ولا نفتحه في إنشاء $\\tan x = \\dfrac{7}{3}$ ؟'}</MathText>}
                options={[
                  <MathText key="a">{'لأن مقام الجيب (وجيب التمام) هو الوتر، يُنقل بالمدور؛ أما في الظل فالعددان ضلعا الزاوية القائمة'}</MathText>,
                  'لأن 5 أكبر من 7',
                  'لأن الدائرة تعطي زاوية أكبر من الأخرى',
                ]}
                correct={0}
                cols={1}
                requires={['taarif-nisab']}
                explain={<MathText>{`${LINES.construct} ${LINES.legsWhy}`}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <PredictRule id="insha-zawiya">
                  <div className="grid gap-3 grid-cols-2">
                    <div className="space-y-2">
                      <GeoFigure {...METHOD_CONSTRUCT.ex1.figure} />
                      <MethodSteps method={{ source: METHOD_CONSTRUCT.source, exercise: METHOD_CONSTRUCT.ex1.exercise, solution: METHOD_CONSTRUCT.ex1.solution }} />
                    </div>
                    <div className="space-y-2">
                      <GeoFigure {...METHOD_CONSTRUCT.ex2.figure} />
                      <MethodSteps method={{ source: METHOD_CONSTRUCT.source, exercise: METHOD_CONSTRUCT.ex2.exercise, solution: METHOD_CONSTRUCT.ex2.solution }} />
                    </div>
                  </div>
                </PredictRule>
              )}
              {q4 && <KnowledgeBrick id="insha-zawiya" lead="الطريقة، كما فعلتها يداك في النشاط 5:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
