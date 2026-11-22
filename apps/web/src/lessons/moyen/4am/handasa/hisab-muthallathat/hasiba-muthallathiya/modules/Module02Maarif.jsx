import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW3, ROUNDING_RULE, PLATFORM_SOURCE, key } from '../content/textbook';
import KeySequence from '../components/KeySequence';

/**
 * Rétrofit 2026-10-15 : dans chaque étape la QUESTION vient d'abord (R de la calculatrice, B depuis cos 0,8, l'arrondi de A) ; l'encadré / l'exemple
 * du manuel et la brique (barmaja-daraja, hasiba-zawiya, tadwir-dalaqa) viennent APRÈS la réponse. Le brief ne dit aucun fait.
 * Module 2 — معارف 3 (p. 120) « استعمال حاسبة في حساب نسب مثلثية ».
 *   1. UNDERSTAND : la programmation en degrés (la phrase du manuel), l'exemple 1 (sin, cos, tan 54°) avec ses
 *      touches en code LTR, la brique barmaja-daraja ; TOUCH THE MATH : une calculatrice en mode R (cos 60 = −0,952),
 *      puis un calcul nouveau (sin 37°) ;
 *   2. l'exemple 2 (A ≈ 24°, B ≈ 17°) — l'écran de B CORRIGÉ en une ligne (16,69924453 → 16,69924423) —, puis un angle
 *      dont on connaît le cosinus (les distracteurs : sin⁻¹, et cos sans 2nd) ;
 *   3. FORMALIZE : la règle d'arrondi (plateforme, déclarée), brique tadwir-dalaqa, l'écran de A arrondi à trois précisions.
 * Les questions utilisent d'AUTRES nombres que les encadrés, sauf l'arrondi de l'étape 3 (l'écran même du manuel).
 * « أتوقّع القاعدة » (2026-10-06) : la phrase du manuel (la programmation en degrés) et la règle d'arrondi sont deux
 * TextbookBox posés juste AVANT leur brique : ils sont enveloppés dans PredictRule (id de la brique ; prompt :
 * knowledge.jsx › predictPrompt) ; le titre de l'étape 1 et le brief ne disent plus la règle.
 * LP : P1 (1), P2 (2), P3 (3).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const near = (target, tol = 1e-9) => (x) => Number.isFinite(x) && Math.abs(x - target) <= tol;

function Steps({ steps }) {
  return (
    <div className="space-y-2">
      {steps.map((s) => (
        <div key={s.screen} className="rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-slate-800">
          <p><MathText>{s.label}</MathText></p>
          <p className="my-1"><KeySequence keys={s.keys} /></p>
          <p>يظهر على الشاشة <MathText>{`$${s.screen}$`}</MathText></p>
          <p className="font-semibold"><MathText>{s.result}</MathText></p>
        </div>
      ))}
    </div>
  );
}

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      objectives={['ماذا نتحقّق منه قبل أن نضغط أي لمسة؟', 'كيف نجد قيس زاوية من نسبتها؟', 'متى نُبقي الرقم الأخير ومتى نغيّره؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الحاسبة بالدرجة والتدوير"
      moduleSubtitle="برمجة الحاسبة، اللمسات المباشرة والعكسية، والتدوير"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 120', title: KNOW3.title, tone: 'violet',
        body: <p>حاسبة الدرون أعطتك النسب من الزوايا والزوايا من النسب. الكتاب يكتب ذلك في مثالين: ماذا يفعل كل مثال، وما الذي نتأكّد منه قبل الضغط على أيّ لمسة؟</p>,
      }}
      steps={[
        {
          num: 1, title: 'قبل أيّ حساب', subtitle: 'مثال 1', done: q1,
          content: (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800"><MathText>{`حاسبة يظهر في أعلى شاشتها الحرف ${key('R')}. تلميذ ضغط ${key('ON cos 60 =')} فظهر $-0{,}9524129804$ .`}</MathText> <SourceTag source={PLATFORM_SOURCE} /></p>
              <TapQuestion
                prompt="ماذا يفعل؟"
                options={[
                  `يبرمج الحاسبة بالدرجة ( ${key('D')} ) ثم يعيد الحساب، فيجد $\\cos 60^{\\circ} = 0{,}5$`,
                  'يدوّر النتيجة: $\\cos 60^{\\circ} \\approx -1$',
                  `يضغط ${key('2nd')} قبل ${key('cos')}`,
                ].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{`في وضع ${key('R')} تحسب الحاسبة جيب تمام 60 راديانًا. جيب تمام زاوية حادة موجب وأصغر من 1، فـ $-0{,}95$ مستحيل. و ${key('2nd')} ${key('cos')} يعطي زاوية لا نسبة.`}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <>
                <KnowledgeBrick id="hasiba-nisba" variant="rappel" compact />
                <PredictRule id="barmaja-daraja"><TextbookBox kind="property" title={KNOW3.title} text={KNOW3.intro} source={KNOW3.source} compact /></PredictRule>
                <TextbookBox kind="example" text={KNOW3.example1.text} source={KNOW3.source} compact>
                  <Steps steps={KNOW3.example1.steps} />
                </TextbookBox>
                <KnowledgeBrick id="barmaja-daraja" lead="الحرف R الذي رأيته على الشاشة في النشاط له معنى:" />
                </>
              )}
              {q1a && (
                <NumericQuestion
                  prompt={<MathText>{'بحاسبة مبرمجة بالدرجة: $\\sin 37^{\\circ}$ المدوّر إلى الجزء من 100:'}</MathText>}
                  expected={near(0.6)}
                  parse={parseDec}
                  display="0,60"
                  requires={['barmaja-daraja']}
                  explain={<MathText>{`${key('ON sin 37 =')} يعطي $0{,}6018150232$ ؛ الرقم الموالي 1 أصغر من 5: $\\sin 37^{\\circ} \\approx 0{,}60$ .`}</MathText>}
                  explainFor={(n) => <MathText>{near(0.8)(n) ? 'هذا $\\cos 37^{\\circ} \\approx 0{,}80$ : المطلوب الجيب، $\\sin 37^{\\circ} \\approx 0{,}60$ .' : near(-0.64)(n) ? `هذا $\\sin 37$ بالراديان: برمج الحاسبة بالدرجة، $\\sin 37^{\\circ} \\approx 0{,}60$ .` : `${key('ON sin 37 =')} يعطي $0{,}6018150232$ ، إذن $\\sin 37^{\\circ} \\approx 0{,}60$ .`}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'قيس زاوية من نسبتها', subtitle: 'مثال 2', done: q2,
          content: (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800"><MathText>{'B زاوية حادة حيث $\\cos\\widehat{B} = 0{,}8$ .'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></p>
              <TapQuestion
                prompt="المدوّر إلى الوحدة لقيس الزاوية B (بالدرجة):"
                options={['$37^{\\circ}$', '$53^{\\circ}$', '$1^{\\circ}$'].map(M)}
                correct={0}
                cols={3}
                requires={['hasiba-zawiya']}
                explain={<MathText>{`${key('ON 2nd cos⁻¹ 0,8 =')} يعطي $36{,}86989765$ ، إذن $\\widehat{B} \\approx 37^{\\circ}$ . ( $53^{\\circ}$ هي الزاوية التي جيبها $0{,}8$ : ${key('sin⁻¹')} بدل ${key('cos⁻¹')} ؛ و $1$ هو $\\cos 0{,}8^{\\circ} \\approx 0{,}9999$ : نسيان ${key('2nd')}.)`}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                <KnowledgeBrick id="hasiba-zawiya" variant="rappel" compact />
                <TextbookBox kind="example" text={KNOW3.example2.text} source={KNOW3.source} compact>
                  <Steps steps={KNOW3.example2.steps} />
                </TextbookBox>
                <p className="text-xs text-slate-500" data-correction><MathText>{KNOW3.correction}</MathText></p>
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'تدوير نتيجة الحاسبة', subtitle: 'الدقة المطلوبة', done: q3,
          content: (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800"><MathText>{'شاشة المثال 2: $\\widehat{A} = 23{,}57817848^{\\circ}$ .'}</MathText></p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">دوّر هذه النتيجة:</p>}
                rows={[
                  // 23 : la troncature ; 23,5 : la troncature au dixième ; 23,57 : la troncature au centième
                  { id: 'u', label: 'إلى الوحدة', options: ['$24$', '$23$', '$23{,}5$'].map(M), correct: 0, correction: <MathText>{'الرقم الموالي 5: نضيف 1، $\\widehat{A} \\approx 24^{\\circ}$'}</MathText> },
                  { id: 't', label: 'إلى الجزء من 10', options: ['$23{,}5$', '$23{,}6$', '$24$'].map(M), correct: 1, correction: <MathText>{'الرقم الموالي 7: نضيف 1، $\\widehat{A} \\approx 23{,}6^{\\circ}$'}</MathText> },
                  { id: 'h', label: 'إلى الجزء من 100', options: ['$23{,}58$', '$23{,}57$', '$23{,}6$'].map(M), correct: 0, correction: <MathText>{'الرقم الموالي 8: نضيف 1، $\\widehat{A} \\approx 23{,}58^{\\circ}$'}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الشاشة نفسها تعطي ثلاث قيم مدوّرة حسب الدقة المطلوبة.' : 'راجع التصحيح تحت كل سطر: هل نظرت إلى الرقم الموالي؟'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                <PredictRule id="tadwir-dalaqa"><TextbookBox kind="method" title={ROUNDING_RULE.title} lines={ROUNDING_RULE.lines} source={ROUNDING_RULE.source} compact /></PredictRule>
                <KnowledgeBrick id="tadwir-dalaqa" lead="ما فعلته بخط القطع ✂ على الشاشة، بالكلمات:" />
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
