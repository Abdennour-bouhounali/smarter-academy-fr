import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import WordFraction from '../../../../../../common/components/WordFraction';
import { TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHODS, METHOD_RULE, NOW } from '../content/textbook';
import { FIG_METHOD_SIN, FIG_METHOD_COS, FIG_METHOD_TAN } from '../content/figures';
import KeySequence from '../components/KeySequence';

/**
 * Module 3 — طرائق (p. 119) : les trois exercices résolus du manuel (BC = 2,5 / sin 25° ≈ 5,92 ; RS = 3,5 × cos 37° ≈
 * 2,8 ; FG = 4,5 × tan 53° ≈ 5,97) révélés ligne à ligne (MethodSteps) — la ligne « clavier » est montrée en CODE LTR
 * (KeySequence), jamais en KaTeX ni nue dans la phrase ; une question après chacune (diviser ou multiplier, quel
 * rapport) ; les gestes nommés (plateforme, déclaré — brique hisab-tul) ; دوري الآن : LM = 3√2 ≈ 4,2 par Pythagore ET
 * par cos 45°, PQ ≈ 0,9. LP : P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const near = (target, tol = 0.0001) => (x) => Number.isFinite(x) && Math.abs(x - target) <= tol;
const lines = (method) => ({
  ...method,
  solution: method.solution.map((l) => (typeof l === 'string' ? l : <KeySequence key={l.keys.join(' ')} keys={l.keys} screen={l.screen} />)),
});

export default function Module03Taraiq() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  return (
    <ContentModule
      objectives={['أيّ نسبة نختار لحساب طول ضلع؟', 'متى نضرب ومتى نقسم؟', 'هل توجد طريقة ثانية للتحقّق من الطول؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — حساب طول ضلع"
      moduleSubtitle="بالجيب، بجيب التمام، بالظل: نختار النسبة التي تربط المعلوم بالمطلوب"
      estimatedTime="9 دقائق"
      brief={{
        tag: 'طرائق — الكتاب ص 119', title: 'حساب طول ضلع مثلث قائم', tone: 'emerald',
        body: <p>ثلاثة تمارين محلولة من الكتاب: اقرأ كل سطر وحاول أن تتوقّع السطر التالي قبل أن تكشفه. برنامج الحاسبة يُقرأ من اليسار إلى اليمين.</p>,
      }}
      steps={[
        {
          num: 1, title: 'باستعمال الجيب', subtitle: 'احسب BC', done: q1,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="jayb" variant="rappel" compact />
              <GeoFigure {...FIG_METHOD_SIN} />
              <MethodSteps method={lines(METHODS.sin)} />
              <TapQuestion
                prompt={<MathText>{'من $\\sin 25^{\\circ} = \\dfrac{2{,}5}{BC}$ نستنتج:'}</MathText>}
                options={['$BC = \\dfrac{2{,}5}{\\sin 25^{\\circ}}$', '$BC = 2{,}5 \\times \\sin 25^{\\circ}$', '$BC = \\dfrac{\\sin 25^{\\circ}}{2{,}5}$'].map(M)}
                correct={0}
                cols={1}
                requires={['jayb']}
                explain={<MathText>{'المجهول BC في المقام: $BC \\times \\sin 25^{\\circ} = 2{,}5$ ومنه $BC = \\dfrac{2{,}5}{\\sin 25^{\\circ}} \\approx 5{,}92$ . ($2{,}5 \\times \\sin 25^{\\circ} \\approx 1{,}06$ أصغر من المقابل 2,5: لا يكون وترا.)'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'باستعمال جيب التمام', subtitle: 'احسب RS', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_METHOD_COS} />
              <MethodSteps method={lines(METHODS.cos)} />
              <TapQuestion
                prompt="لماذا جيب التمام في هذا التمرين؟"
                options={[
                  'الوتر [RT] معلوم و [RS] المطلوب مجاور للزاوية R: النسبة التي تجمعهما هي جيب التمام',
                  'لأن قيس الزاوية $37^{\\circ}$ أصغر من $45^{\\circ}$', // l'angle ne choisit pas le rapport
                  'لأن [RS] مقابل للزاوية R', // faux : RS passe par R
                ].map(M)}
                correct={0}
                cols={1}
                requires={['jayb']}
                explain={<MathText>{'نختار النسبة بحسب الضلعين: المعلوم [RT] (وتر) والمطلوب [RS] (مجاور، يمرّ بالرأس R) — المجاور على الوتر هو جيب التمام.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'باستعمال الظل', subtitle: 'احسب FG', done: q3,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_METHOD_TAN} />
              <MethodSteps method={lines(METHODS.tan)} />
              {/* La boîte ÉNONCE la méthode juste avant sa brique : l'élève l'écrit d'abord (item hisab-tul). */}
              <PredictRule id="hisab-tul"><TextbookBox kind="method" lines={METHOD_RULE.lines} source={METHOD_RULE.source} compact /></PredictRule>
              <KnowledgeBrick id="hisab-tul" lead="الطرائق الثلاث، بالخطوات نفسها:" />
              <TapQuestion
                prompt="مثلث قائم فيه المجاور للزاوية المعلومة معلوم، والمطلوب الوتر. نكتب:"
                options={[
                  <span key="a">الوتر = <WordFraction num="المجاور" den="جيب تمام الزاوية" /></span>,
                  <span key="b">الوتر = المجاور × جيب تمام الزاوية</span>, // le produit donnerait moins que l'adjacent
                  <span key="c">الوتر = <WordFraction num="المجاور" den="ظل الزاوية" /></span>, // le ظل ne contient pas le وتر
                ]}
                correct={0}
                cols={1}
                requires={['hisab-tul']}
                explain={<MathText>{'المجاور والوتر يربطهما جيب التمام، والوتر في المقام: نقسم المجاور على جيب تمام الزاوية.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'دوري الآن 1', subtitle: 'LM بطريقتين', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW.item1} source={NOW.source} compact />
              <NumericQuestion
                prompt={<MathText>{'بخاصية فيثاغورس: المدوّر إلى الجزء من 10 للطول LM (بالسنتيمتر):'}</MathText>}
                expected={near(4.2)}
                parse={parseDec}
                display="4,2"
                requires={['fithaghuras']}
                explain={<MathText>{NOW.item1Pyth}</MathText>}
                explainFor={(n) => <MathText>{near(3)(n) ? `هذا نصف الوتر: $3^2 + 3^2 = 18 \\neq 36$ . ${NOW.item1Pyth}` : NOW.item1Pyth}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && (
                <TapQuestion
                  prompt="الطريقة الثانية، بنسبة مثلثية:"
                  options={['$LM = 6 \\times \\cos 45^{\\circ}$', '$LM = \\dfrac{6}{\\cos 45^{\\circ}}$', '$LM = 6 \\times \\tan 45^{\\circ}$'].map(M)}
                  correct={0}
                  cols={1}
                  requires={['hisab-tul']}
                  explain={<MathText>{`${NOW.item1Cos} ($\\dfrac{6}{\\cos 45^{\\circ}} \\approx 8{,}5$ أطول من الوتر، و $6 \\times \\tan 45^{\\circ} = 6$ يساوي الوتر.)`}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'دوري الآن 2', subtitle: 'احسب PQ', done: q5,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW.item2} source={NOW.source} compact />
              <NumericQuestion
                prompt={<MathText>{'المدوّر إلى الجزء من 10 للطول PQ (بالسنتيمتر):'}</MathText>}
                expected={near(0.9)}
                parse={parseDec}
                display="0,9"
                requires={['hisab-tul']}
                explain={<MathText>{NOW.item2Line}</MathText>}
                explainFor={(n) => <MathText>{near(8.6, 0.05)(n) ? `هذا $2{,}8 \\times \\tan 72^{\\circ}$ : PQ في المقام فنقسم. ${NOW.item2Line}` : NOW.item2Line}</MathText>}
                onAnswered={() => setQ5(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
