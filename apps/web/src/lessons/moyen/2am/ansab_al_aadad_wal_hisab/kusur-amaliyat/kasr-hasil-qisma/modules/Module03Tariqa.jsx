import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (idée de method-1, method-2) : trois pas. (1) un exemple résolu, 12,5 ÷ 0,35 : le diviseur a deux décimales → ×100 → 1250 ÷ 35 = 35,714… → les deux encadrements (0,1 puis 0,01) ;
 * (2) « décimal ou non ? » : 7/8 = 0,875 finit, 5/6 = 0,833… non, d'où 0,83 < 5/6 < 0,84 ; (3) une NOTE sur la nature d'une proportion : 18 élèves de 45, 18/45 = 2/5 = 0,4 (exact). LP : P2, P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['في أيّ عدد أضرب الحدّين؟', 'كيف أحصر حاصل القسمة إلى $0{,}01$ ؟', 'متى يكون الحاصل المضبوط عشريًا؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أقسم على عدد عشري وأحصر الحاصل"
      moduleSubtitle="قاسم طبيعي، ثم قسمة بعد الفاصلة"
      estimatedTime="10 دقائق"
      brief={{ tag: 'طريقة', title: 'قاسم عشري؟ لا مشكلة', tone: 'sky',
        body: <p>في المختبر ضربنا الطولين في 10 فصار الحبل الواحد طبيعيًا. نفعل الشيء نفسه مع أيّ قسمة على عدد عشري.</p> }}
      steps={[
        { num: 1, title: 'مثال محلول: 12,5 على 0,35', subtitle: 'اكشف سطرًا سطرًا', done: read && q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.solution }} onAllRevealed={() => setRead(true)} />
              {read && (
                <NumericQuestion prompt={<MathText>{'في أيّ عدد ضربنا الحدّين؟'}</MathText>} expected={100} parse={parseDec}
                  requires={['qisma-ashari']} explain={<MathText>{'في $0{,}35$ رقمان بعد الفاصلة: ضربنا في $100$ فصار $\\frac{12{,}5}{0{,}35} = \\frac{1250}{35}$ .'}</MathText>}
                  onAnswered={() => setQ1(true)} />
              )}
              {q1 && <KnowledgeBrick id="hasr-ushri-tariqa" />}
            </div>
          ) },
        { num: 2, title: 'عشري أم لا؟ ثم الحصر', subtitle: '$\\frac{7}{8}$ و $\\frac{5}{6}$', done: q2 && q2b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'أيّ الكسرين قيمته المضبوطة عدد عشري؟'}</MathText>}
                options={[M('$\\frac{7}{8}$'), M('$\\frac{5}{6}$')]}
                correct={0} cols={2} requires={['ashri-am-la']}
                explain={<MathText>{'$7 \\div 8 = 0{,}875$ تنتهي القسمة. أمّا $5 \\div 6 = 0{,}833\\ldots$ فلا تنتهي.'}</MathText>}
                onAnswered={() => setQ2(true)} />
              {q2 && (
                <NumericQuestion prompt={<MathText>{'القيمة المقرّبة إلى $0{,}01$ بالنقصان لـ $\\frac{5}{6}$ :'}</MathText>} expected={0.83} parse={parseDec}
                  requires={['hasr-ushri-tariqa']} explain={<MathText>{'$6 \\times 0{,}83 = 4{,}98 < 5 < 5{,}04 = 6 \\times 0{,}84$ : $0{,}83 < \\frac{5}{6} < 0{,}84$ .'}</MathText>}
                  onAnswered={() => setQ2b(true)} />
              )}
            </div>
          ) },
        { num: 3, title: 'نسبة تنتهي', subtitle: '$\\frac{18}{45}$', done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'في مكتبة المدرسة $18$ تلميذًا من بين $45$ ينجزون واجبهم قبل المساء. نسبتهم $\\frac{18}{45} = \\frac{2}{5}$ ؛ اكتبها عددًا عشريًا:'}</MathText>} expected={0.4} parse={parseDec}
                requires={['ashri-am-la']} explain={<MathText>{'$2 \\div 5 = 0{,}4$ لأنّ $5 \\times 0{,}4 = 2$ : القسمة تنتهي، فهذه النسبة عشرية.'}</MathText>}
                onAnswered={() => setQ3(true)} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
