import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 3 — معارف 4 (p. 24) : خاصية 1 et ses trois remarques, خاصية 2 et sa
 * remarque, ملاحظة 3. Les propriétés, établies au module 1 (et la remarque 3
 * au module 2), reviennent en RAPPEL (`variant="rappel"`) ; la seule
 * connaissance NOUVELLE ici est √(a²b) = a√b (remarque 1), posée par sa
 * brique APRÈS la réponse (rétrofit 2026-10-15) ; la remarque 1 (les deux sens) suit la réponse du premier calcul. Chaque question précède l'exemple
 * du manuel qui y répond : l'exemple devient la correction. LP : P1, P2, P3.
 */
const { product, quotient, sum } = KNOWLEDGE;
const m = (tex) => <MathText key={tex}>{tex}</MathText>;

export default function Module03Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="معارف — العمليات على الجذور التربيعية"
      moduleSubtitle="خاصيتان وثلاث ملاحظات"
      estimatedTime="12 دقيقة"
      objectives={['كيف أستعمل ما برهنته في الاتجاهين؟', 'ماذا يحدث إذا كان أحد العاملين مربّعًا؟', 'متى لا تصحّ المساواة؟']}
      brief={{
        tag: 'معارف', title: KNOWLEDGE.title, tone: 'violet',
        body: <p>ما برهنته في النشاط 4 نكتبه في خاصيتين، ومعهما ملاحظات تبيّن كيف نستعملهما — في الاتجاهين — ومتى لا نستطيع.</p>,
      }}
      steps={[
        {
          num: 1, title: 'خاصية 1 — جداء جذرين', done: q1,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="jidaa-jidhrayn" variant="rappel" />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">احسب مستعملًا الخاصية 1:</p>}
                rows={[
                  { id: 'r1', label: m('$\\sqrt{12} \\times \\sqrt{3}$'), options: ['$\\sqrt{15}$', '$6$', '$36$'].map(m), correct: 1 },
                  { id: 'r2', label: m('$\\sqrt{0{,}9} \\times \\sqrt{0{,}4}$'), options: ['$0{,}6$', '$0{,}36$', '$\\sqrt{1{,}3}$'].map(m), correct: 0 },
                ]}
                requires={['jidaa-jidhrayn']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>الأمثلة المحلولة أدناه.</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  <TextbookBox kind="remark" text={product.remarks[0]} source={KNOWLEDGE.source} compact />
                  <TextbookBox kind="example" lines={[product.examples[0], product.examples[2]]} compact />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'خاصية 1 — عددان سالبان', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>العدد <MathText>{'$\\sqrt{(-9) \\times (-4)}$'}</MathText> ...</span>}
                options={['لا معنى له لأن $\\sqrt{-9}$ لا معنى له', 'موجود ويساوي $6$', 'يساوي $-6$'].map(m)}
                correct={1}
                cols={1}
                requires={['jidaa-jidhrayn']}
                explain={<MathText>{product.examples[4]}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="remark" text={product.remarks[2]} compact />}
            </div>
          ),
        },
        {
          num: 3, title: 'خاصية 1 في الاتجاه الآخر — جذر جداء فيه مربّع', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>لدينا <MathText>{'$63 = 9 \\times 7 = 3^2 \\times 7$'}</MathText>. العدد <MathText>{'$\\sqrt{63}$'}</MathText> يُكتب:</span>}
                options={['$9\\sqrt{7}$', '$7\\sqrt{3}$', '$3\\sqrt{7}$', '$\\sqrt{9} + \\sqrt{7}$'].map(m)}
                correct={2}
                cols={2}
                requires={['jidaa-jidhrayn']}
                explain={<MathText>{product.examples[3]}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="jidhr-a2b" lead={<MathText>{'استعملت الخاصية 1 في الاتجاه الآخر، من $\\sqrt{a \\times b}$ إلى $\\sqrt{a} \\times \\sqrt{b}$: إذا كان أحد العاملين مربّعًا، خرج جذره.'}</MathText>} />}
            </div>
          ),
        },
        {
          num: 4, title: 'خاصية 2 — حاصل قسمة جذرين', done: q4,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="qismat-jidhrayn" variant="rappel" />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">احسب مستعملًا الخاصية 2 (والملاحظة في السطر الأخير):</p>}
                rows={[
                  { id: 'k1', label: m('$\\dfrac{\\sqrt{60}}{\\sqrt{15}}$'), options: ['$4$', '$2$', '$\\sqrt{45}$'].map(m), correct: 1 },
                  { id: 'k2', label: m('$\\sqrt{\\dfrac{25}{9}}$'), options: ['$\\dfrac{5}{3}$', '$\\dfrac{25}{3}$', '$\\dfrac{5}{9}$'].map(m), correct: 0 },
                  { id: 'k3', label: m('$\\sqrt{\\dfrac{7}{36}}$'), options: ['$\\dfrac{7}{6}$', '$\\dfrac{\\sqrt{7}}{36}$', '$\\dfrac{\\sqrt{7}}{6}$'].map(m), correct: 2 },
                  { id: 'k4', label: m('$\\sqrt{\\dfrac{-36}{-4}}$'), options: ['لا معنى له', m('$3$'), m('$-3$')], correct: 1 },
                ]}
                requires={['qismat-jidhrayn']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>الأمثلة المحلولة والملاحظة أدناه.</Feedback>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <>
                  <TextbookBox kind="example" lines={quotient.examples} compact />
                  <TextbookBox kind="remark" text={quotient.remark} compact />
                </>
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'ملاحظة 3 — الجمع والطرح', done: q5,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="la-tawzi-jam" variant="rappel" />
              <TapQuestion
                prompt={<span>أي مساواة صحيحة من أجل كل عددين موجبين <MathText>{'$a$'}</MathText> و <MathText>{'$b$'}</MathText>؟</span>}
                options={['$\\sqrt{a} + \\sqrt{b} = \\sqrt{a + b}$', '$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$', '$\\sqrt{a} - \\sqrt{b} = \\sqrt{a - b}$'].map(m)}
                correct={1}
                cols={1}
                requires={['jidaa-jidhrayn', 'la-tawzi-jam']}
                explain={<MathText>{sum.examples[0]}</MathText>}
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
