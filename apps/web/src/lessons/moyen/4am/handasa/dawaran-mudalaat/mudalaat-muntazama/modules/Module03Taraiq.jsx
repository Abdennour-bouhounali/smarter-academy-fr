import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_ANGLE, METHOD_CONSTRUCT, METHOD_SIDE, NOW157, AIDS, FORMAL_SOURCE } from '../content/textbook';
import { FIG_METHOD_ANGLE, FIG_METHOD_ANGLE_SOL, FIG_METHOD_CONSTRUCT, FIG_METHOD_SIDE, FIG_NOW157 } from '../content/figures';

/**
 * Module 3 — طرائق (p. 157) et دوري الآن.
 * TOUCH THE MATH puis FORMALIZE, chaque fois la question AVANT la solution du manuel :
 *   1) « حساب قيس زاوية » : l'élève calcule \widehat{BAE}, puis la solution s'affiche avec la correction de la coquille
 *      (« 180° » → 108°) et la brique zawiyat-mudalla (la formule générale, déclarée) ;
 *   2) « إنشاء مضلع » : la construction lue ligne à ligne (MethodSteps), un seul nom pour les médiatrices — (Δ1), (Δ2) ;
 *   3) « حساب طول ضلع » : AB à partir de R = √3, puis la solution et la brique dil-mudalla ;
 *   4) دوري الآن : l'heptagone (360°/7 exact, ≈ 51° ; 900°/7 ≈ 129°), figure de la plateforme.
 * LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Lines = ({ lines }) => (
  <ol className="list-decimal space-y-1 ps-5 text-slate-800 text-base">
    {lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}
  </ol>
);

export default function Module03Taraiq() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [read2, setRead2] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — زاوية المضلع وإنشاؤه وطول ضلعه"
      moduleSubtitle="ثلاث طرائق من الكتاب، كل واحدة تبدأ بسؤال لك"
      estimatedTime="12 دقيقة"
      objectives={["كيف أحسب زاوية مضلع منتظم؟", "كيف أنشئ مضلعًا منتظمًا عُلم طول ضلعه؟", "كيف أحسب طول ضلعه من نصف قطر دائرته؟"]}
      brief={{
        tag: 'طرائق — الكتاب ص 157', title: 'نحسب ونُنشئ', tone: 'emerald',
        body: <p>في الورشة قرأت زاوية المضلع وطول ضلعه. هنا نحسبهما كما يحسبهما الكتاب، وننشئ خماسيا منتظما علم ضلعه.</p>,
      }}
      steps={[
        {
          num: 1, title: 'حساب قيس زاوية مضلع منتظم', subtitle: 'الخماسي المنتظم', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={METHOD_ANGLE.exercise} source={METHOD_ANGLE.source} compact />
              <GeoFigure {...FIG_METHOD_ANGLE} />
              <NumericQuestion
                prompt={<MathText>{'احسب قيس الزاوية $\\widehat{BAE}$ (بالدرجات) في الخماسي المنتظم $ABCDE$ الذي مركزه $O$ .'}</MathText>}
                expected={108}
                display="108"
                requires={['markaziya-360', 'mutasawi-saqayn']}
                explain={<MathText>{METHOD_ANGLE.solution[2]}</MathText>}
                explainFor={(n) => (n === 72 ? <MathText>{'هذه الزاوية المركزية $\\widehat{AOE}$ ، لا زاوية الخماسي.'}</MathText>
                  : n === 54 ? <MathText>{'هذه $\\widehat{OAE}$ وحدها: (OA) ينصّف $\\widehat{BAE}$ ، فنضاعف.'}</MathText>
                    : n === 180 ? <MathText>{'هذا ما طُبع في الكتاب خطأً: $2 \\times 54^\\circ$ لا يساوي $180^\\circ$ .'}</MathText> : null)}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <div className="space-y-2" data-method-solution="angle">
                  {/* « أتوقّع القاعدة » : la solution du manuel énonce la méthode — l'élève l'écrit avant (prompt : knowledge.jsx). */}
                  <PredictRule id="zawiyat-mudalla">
                    <Lines lines={METHOD_ANGLE.solution} />
                    <p className="text-xs text-slate-500" data-correction><MathText>{METHOD_ANGLE.correction}</MathText></p>
                    <p className="text-sm text-slate-700"><MathText>{METHOD_ANGLE.bisector}</MathText> <SourceTag source={FORMAL_SOURCE} /></p>
                    <GeoFigure {...FIG_METHOD_ANGLE_SOL} />
                  </PredictRule>
                  <KnowledgeBrick id="zawiyat-mudalla" lead="الطريقة، وما تعطيه لكل مضلع منتظم:" />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'إنشاء مضلع منتظم عُلم طول ضلعه', subtitle: 'خماسي منتظم ضلعه 3 cm', done: q2,
          content: (
            <div className="space-y-3">
              {/* « أتوقّع القاعدة » : la طريقة du manuel énonce la construction — l'élève l'écrit avant (prompt : knowledge.jsx). */}
              <PredictRule id="insha-mudalla"><MethodSteps method={{ exercise: METHOD_CONSTRUCT.exercise, source: METHOD_CONSTRUCT.source, solution: METHOD_CONSTRUCT.solution }} onAllRevealed={() => setRead2(true)} /></PredictRule>
              <GeoFigure {...FIG_METHOD_CONSTRUCT} />
              <p className="text-xs text-slate-500" data-correction><MathText>{METHOD_CONSTRUCT.naming}</MathText></p>
              {!read2 && <p className="text-sm text-slate-600">اقرأ الحلّ سطرا بعد سطر، ثم أجب.</p>}
              {read2 && <KnowledgeBrick id="insha-mudalla" lead="الدوران أداة إنشاء:" />}
              {read2 && <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">في هذا الإنشاء، اختر لكل سطر:</p>}
                rows={[
                  { id: 'center', label: 'E صورة B بالدوران الذي مركزه', options: ['A', 'O', 'B'], correct: 0, correction: 'الرأس A مشترك بين [AB] و [AE]: AB = AE، فهو مركز الدوران الذي يحوّل B إلى E.' },
                  { id: 'angle', label: 'وزاويته', options: ['$108^\\circ$', '$72^\\circ$', '$54^\\circ$'].map(M), correct: 0, correction: <MathText>{'$108^\\circ$ زاوية الخماسي $\\widehat{BAE}$ (الطريقة السابقة)؛ $72^\\circ$ هي الزاوية المركزية، وهي زاوية الدوران حول O لا حول A.'}</MathText> },
                  { id: 'O', label: 'المركز O هو', options: ['نقطة تقاطع $(\\Delta_1)$ محور [AB] و $(\\Delta_2)$ محور [AE]', 'منتصف [BE]', 'منتصف [AB]'].map(M), correct: 0, correction: 'O على بعد واحد من A و B و E: هو مركز الدائرة المحيطة بالمثلث ABE.' },
                ]}
                requires={['insha-mudalla']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: دوران حول رأس، ثم محوران، ثم المدور.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />}
            </div>
          ),
        },
        {
          num: 3, title: 'حساب طول ضلع مضلع منتظم', subtitle: 'من نصف قطر الدائرة المحيطة', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={METHOD_SIDE.exercise} source={METHOD_SIDE.source} compact />
              <GeoFigure {...FIG_METHOD_SIDE} />
              <NumericQuestion
                prompt={<MathText>{'احسب AB (بالسنتيمتر). استعمل المثلث OAH القائم في H حيث $\\widehat{AOH} = 60^\\circ$ .'}</MathText>}
                expected={3}
                display="3"
                parse={parseDec}
                requires={['markaziya-360', 'nisab-muthallathiya']}
                explain={<MathText>{METHOD_SIDE.solution[3]}</MathText>}
                explainFor={(n) => (Math.abs(n - 1.73) < 0.01 ? <MathText>{`${AIDS.whyDil} ${AIDS.rightDil}`}</MathText>
                  : n === 1.5 ? <MathText>{'هذا AH، نصف الضلع: $AB = 2 \\times AH$ .'}</MathText> : null)}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <div className="space-y-2" data-method-solution="side">
                  {/* « أتوقّع القاعدة » : la solution du manuel énonce la méthode — l'élève l'écrit avant (prompt : knowledge.jsx). */}
                  <PredictRule id="dil-mudalla"><Lines lines={METHOD_SIDE.solution} /></PredictRule>
                  <KnowledgeBrick id="dil-mudalla" lead="الطريقة، وما تعطيه للمضلعات الشهيرة:" />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'دوري الآن: السباعي المنتظم', subtitle: 'القيمة المضبوطة والمدوّر', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW157.text} source={NOW157.source} compact />
              <GeoFigure {...FIG_NOW157} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'exact', label: <MathText>{'القيمة المضبوطة لـ $\\widehat{AOB}$'}</MathText>, options: ['$\\dfrac{360^\\circ}{7}$', '$\\dfrac{180^\\circ}{7}$', '$\\dfrac{900^\\circ}{7}$'].map(M), correct: 0, correction: <MathText>{`${AIDS.why180} ($\\dfrac{900^\\circ}{7}$ هي زاوية السباعي.)`}</MathText> },
                  { id: 'aob', label: <MathText>{'المدوّر إلى الوحدة لـ $\\widehat{AOB}$'}</MathText>, options: ['$51^\\circ$', '$52^\\circ$', '$26^\\circ$'].map(M), correct: 0, correction: <MathText>{'$360 \\div 7 \\approx 51{,}43$ ، فالمدوّر إلى الوحدة $51^\\circ$ .'}</MathText> },
                  { id: 'abc', label: <MathText>{'المدوّر إلى الوحدة لـ $\\widehat{ABC}$'}</MathText>, options: ['$129^\\circ$', '$128^\\circ$', '$51^\\circ$'].map(M), correct: 0, correction: <MathText>{'$\\widehat{ABC} = 180^\\circ - \\dfrac{360^\\circ}{7} = \\dfrac{900^\\circ}{7} \\approx 128{,}57^\\circ$ ، فالمدوّر $129^\\circ$ (لا نقطع الأرقام).'}</MathText> },
                ]}
                requires={['zawiyat-mudalla']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? NOW157.answer : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
