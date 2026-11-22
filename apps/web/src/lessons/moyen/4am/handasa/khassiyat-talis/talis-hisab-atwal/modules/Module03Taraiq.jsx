import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, METHOD_RULE, NOW } from '../content/textbook';
import { FIG_METHOD, FIG_NOW107 } from '../content/figures';

/**
 * Module 3 — طرائق (p. 107) « حساب أطوال » : l'exercice résolu du parallélogramme révélé ligne à ligne
 * (MethodSteps), la ligne 2/1 CORRIGÉE (une ligne discrète), les quatre gestes nommés (plateforme, déclaré —
 * brique hisab-atwal), puis دوري الآن (EW = 3,15). LP : P2. L'encadré des quatre gestes ÉNONCE la méthode juste
 * avant sa brique : il est enveloppé dans PredictRule « hisab-atwal » (l'élève écrit d'abord sa méthode).
 * Aucun texte destiné à l'élève ne renvoie au manuel (rollout mission 2026-11-10).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [seen, setSeen] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — حساب أطوال"
      moduleSubtitle="وضعية طالس، النسب، المساواة المناسبة، الجداء المتصالب"
      objectives={['كيف أحسب طولًا مجهولًا في وضعية طالس؟', 'أيّ مساواة أختار من بين النسب الثلاث؟', 'ما خطواتي بالترتيب؟']}
      estimatedTime="7 دقائق"
      brief={{
        tag: 'طرائق', title: METHOD.title, tone: 'emerald',
        body: <p>تمرين محلول: اقرأ كل سطر وحاول أن تتوقّع السطر التالي قبل أن تكشفه.</p>,
      }}
      steps={[
        {
          num: 1, title: 'متوازي الأضلاع ABCD', subtitle: 'حساب DN', done: q1,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="khassiyat-talis" variant="rappel" compact />
              <GeoFigure {...FIG_METHOD} />
              <MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.solution }} onAllRevealed={() => setSeen(true)} />
              {seen && <p className="text-xs text-slate-500" data-correction><MathText>{METHOD.correction}</MathText></p>}
              <PredictRule id="hisab-atwal"><TextbookBox kind="method" lines={METHOD_RULE.lines} source={METHOD_RULE.source} compact /></PredictRule>
              <TapQuestion
                prompt={<MathText>{'لماذا نحتفظ بالمساواة $\\dfrac{MA}{MD} = \\dfrac{AB}{DN}$ دون $\\dfrac{MB}{MN}$ ؟'}</MathText>}
                options={[
                  'لأنها تحوي الطول المطلوب DN وثلاثة أطوال معلومة',
                  'لأن $\\dfrac{MB}{MN}$ لا تساوي النسبتين الأخريين',
                  'لأنها أول نسبتين في الكتابة',
                ].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{'MB و MN مجهولان: $\\dfrac{MB}{MN}$ تساوي النسبتين الأخريين لكنها لا تفيد في حساب DN. نختار المساواة التي فيها DN و $MA = 2$ و $MD = 1$ و $AB = 5$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="hisab-atwal" lead="الأسطر الثلاثة، مسمّاة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'دوري الآن', subtitle: 'احسب EW', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW.text} source={NOW.source} compact />
              <GeoFigure {...FIG_NOW107} />
              <NumericQuestion
                prompt={<MathText>{'$EW =$'}</MathText>}
                expected={(x) => Math.abs(x - NOW.answer) < 1e-9}
                parse={parseDec}
                display="3,15"
                requires={['hisab-atwal']}
                explain={<MathText>{NOW.explain}</MathText>}
                explainFor={(n) => <MathText>{Math.abs(n - 2.25 * 3.75 / 5.25) < 0.01 ? `النسبة مقلوبة: $\\dfrac{2{,}25 \\times 3{,}75}{5{,}25} \\approx 1{,}61$ . ${NOW.explain}` : NOW.explain}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
