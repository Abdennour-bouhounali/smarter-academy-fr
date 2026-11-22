import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_SIMPLIFY, METHOD_PRODUCT } from '../content/textbook';
import { EX } from '../content/exercises';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 2 — طرائق p. 25 : « توظيف خواص الجذور التربيعية ».
 *   1. la solution du تمرين 1, ligne à ligne (la question 1 a été faite au
 *      module 1 ; la ligne 2 simplifie A) ;
 *   2. la seconde طريقة (KnowledgeBrick « tabsit-tawzii ») et pourquoi tout
 *      écrire avec √2 ;
 *   3. تمرين 2 : A = √(50/3) × √2 × √12 = 20 ;
 *   4. دوري الآن 1 : B = √250 − √490 + 2√81.
 * Les deux encadrés « طريقة » du manuel sont les briques kitaba-a-jidhr-b
 * (rappel, posée au module 1) et tabsit-tawzii. LP : P1, P2.
 */
// La solution du manuel, SANS l'encadré « طريقة » : il est posé par les briques.
const SOLUTION_1 = { source: METHOD_SIMPLIFY.source, exercise: METHOD_SIMPLIFY.exercise, solution: METHOD_SIMPLIFY.solution };

export default function Module02Tabsit() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  // « ورقة رياض » (`PeerSheet`, content/peerSheet.js) — rollout mission 2026-11-10 : s'arrêter à 2√24 parce que 24 n'est pas un carré
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="طرائق — تبسيط عبارة تتضمن جذورًا"
      moduleSubtitle="كيف نختصر عبارة فيها عدّة جذور؟"
      estimatedTime="12 دقيقة"
      objectives={['كيف أبسّط عبارة فيها جذور مختلفة؟', 'لماذا نكتب الجذور أولًا بدلالة الجذر نفسه؟', 'كيف أحسب جداء عدّة جذور دفعة واحدة؟']}
      brief={{
        tag: 'طريقة', title: METHOD_SIMPLIFY.title, tone: 'violet',
        body: <p>في المحور السابق كتبتَ ثلاثة جذور بدلالة الجذر نفسه. نستعمل ذلك الآن لتبسيط عبارة كاملة، ثم لحساب جداء جذور.</p>,
      }}
      steps={[
        {
          num: 1, title: 'مثال محلول — سطرًا سطرًا', subtitle: 'اقرأ السطر، وحاول توقّع التالي قبل أن تكشفه', done: read,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="kitaba-a-jidhr-b" variant="rappel" compact />
              <MethodSteps method={SOLUTION_1} onAllRevealed={() => setRead(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'الخاصية التوزيعية', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لماذا كتبنا أولًا $\\sqrt{8}$ ، $\\sqrt{18}$ و $\\sqrt{50}$ على الشكل $a\\sqrt{2}$؟'}</MathText>}
                options={[
                  <MathText key="a">{'لأن $\\sqrt{8} + \\sqrt{50} = \\sqrt{58}$'}</MathText>,
                  <MathText key="b">{'لأن A عدد طبيعي'}</MathText>,
                  <MathText key="c">{'لتظهر كل الحدود بنفس الجذر $\\sqrt{2}$ فنطبّق الخاصية التوزيعية'}</MathText>,
                ]}
                correct={2}
                cols={1}
                requires={['kitaba-a-jidhr-b']}
                explain={<MathText>{'الخاصية التوزيعية تجمع حدودًا لها نفس الجذر: $x\\sqrt{b} + y\\sqrt{b} = (x + y)\\sqrt{b}$. أما $\\sqrt{8} + \\sqrt{50}$ فلا يساوي $\\sqrt{58}$: $2\\sqrt{2} + 5\\sqrt{2} = 7\\sqrt{2} = \\sqrt{98}$. و $A = -4\\sqrt{2}$ ليس عددًا طبيعيًا.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {/* La طريقة est nommée APRÈS la réponse (rétrofit 2026-10-15). */}
              {q1 && <KnowledgeBrick id="tabsit-tawzii" lead="الحدود الأربعة صارت كلها مضاعفات للجذر نفسه، فنجمع معاملاتها:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'جداء جذور', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={METHOD_PRODUCT.exercise} source={METHOD_PRODUCT.source} />
              <TapQuestion
                prompt={<MathText>{'$A = \\sqrt{\\dfrac{50}{3}} \\times \\sqrt{2} \\times \\sqrt{12} = $'}</MathText>}
                options={[
                  <MathText key="a">{'$20\\sqrt{3}$'}</MathText>,
                  <MathText key="b">{'$\\dfrac{20}{3}$'}</MathText>,
                  <MathText key="c">{'$20$'}</MathText>,
                  <MathText key="d">{'$10$'}</MathText>,
                ]}
                correct={2}
                cols={2}
                requires={['jidaa-jidhrayn', 'qismat-jidhrayn', 'kitaba-a-jidhr-b']}
                explain={<span className="block space-y-1">{METHOD_PRODUCT.solution.map((l) => <MathText key={l}>{l}</MathText>)}</span>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'دوري الآن 1', done: q3,
          content: <TextbookExercise exercise={EX['now-25-1']} requires={['kitaba-a-jidhr-b', 'tabsit-tawzii']} onAnswered={() => setQ3(true)} />,
        },
        { num: 5, title: 'ورقة زميل: أين الخطأ؟', subtitle: 'جد السطر الخاطئ وصحّحه', done: q4,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ4(true)} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
