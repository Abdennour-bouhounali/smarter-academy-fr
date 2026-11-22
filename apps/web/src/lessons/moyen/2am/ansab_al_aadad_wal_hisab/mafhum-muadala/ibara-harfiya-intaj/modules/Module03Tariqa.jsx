import { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (idées de method-1 et method-2) : trois pas. (1) un exemple résolu en quatre lignes (en fonction de x : des billes, des boîtes de crayons, un triangle ; le contour d'un bassin de n × n dalles compté de deux façons ; un
 * programme ; la factorisation de 2a + 5a − 3a) ; (2) « traduire un programme » ; (3) « simplifier ». Le contour est TOUJOURS un bassin de n × n dalles entouré d'un cadre (le livre écrit n dalles sur le côté : README du plan, écart 3). LP : P1, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['كيف أكتب عبارة بدلالة $x$ ؟', 'كيف أعدّ عناصر إطار بطريقتين؟', 'كيف أبسّط $2a+5a-3a$ ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أكتب وأبسّط"
      moduleSubtitle="من الكلمات إلى الحرف، وتعميم نمط، وبرنامج، وتبسيط"
      estimatedTime="10 دقائق"
      brief={{ tone: 'sky', tag: 'طريقة', title: 'من الوضعية إلى العبارة',
        body: <p>رأينا كيف يعدّ حرف صفًّا لا نستطيع رسمه. للكتابة طريقة: نسمّي المتغيّر بحرف، ونكتب الحساب كما لو كان الحرف عددًا، ثم نبسّط.</p> }}
      steps={[
        { num: 1, title: 'أمثلة محلولة', subtitle: 'اكشف سطرًا سطرًا', done: read && q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.solution }} onAllRevealed={() => setRead(true)} />
              {read && (
                <NumericQuestion prompt={<MathText>{'حوض من $7\\times 7$ بلاطة يحيط به إطار: عدد بلاطات الإطار $4\\times 7+4=$'}</MathText>} expected={32}
                  explain={<MathText>{'$4\\times 7=28$ ثم $28+4=32$ ؛ وبالطريقة الثانية $4\\times(7+1)=32$ .'}</MathText>}
                  onAnswered={() => setQ1(true)} />
              )}
              {q1 && <KnowledgeBrick id="taamim-hadd" />}
            </div>
          ) },
        { num: 2, title: 'ترجم البرنامج', subtitle: '$3x+5$', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'«اختر عددًا، أضف إليه $2$ ، ثم اضرب النتيجة في $5$» : أيّ عبارة تترجمه؟'}</MathText>}
                options={[M('$5(x+2)$'), M('$x+2\\times 5$'), M('$5x+2$')]}
                correct={0} cols={3}
                explain={<MathText>{'نجمع أوّلًا ثم نضرب المجموع كلّه: القوس يلزم. ($x+2\\times 5$ يضرب الـ $2$ وحده؛ و $5x+2$ يضرب $x$ وحده.)'}</MathText>}
                onAnswered={() => setQ2(true)} />
              {q2 && <KnowledgeBrick id="barnamij" />}
            </div>
          ) },
        { num: 3, title: 'بسّط الكتابة', subtitle: '$4a+3a-2a$', done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'$4a+3a-2a=(4+3-2)a=\\ldots a$ . المعامل:'}</MathText>} expected={5}
                explain={<MathText>{'$4+3-2=5$ ، فالنتيجة $5a$ : نجمع المعاملات ونحتفظ بالحرف.'}</MathText>}
                onAnswered={() => setQ3(true)} />
              {q3 && <KnowledgeBrick id="tajmi" />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
