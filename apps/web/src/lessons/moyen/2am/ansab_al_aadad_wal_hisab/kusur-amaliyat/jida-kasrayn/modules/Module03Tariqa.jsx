import { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (idée de method-4) : trois pas. (1) un exemple résolu en trois lignes (3/8 de 48 par deux ordres de calcul, 2/3 de 3/8, 5/7 × 2,8) ; (2) « quel procédé est le plus simple ici ? » ; (3) l'étape
 * finale : on réduit (6/24 = 1/4). Le commentaire « on divise d'abord » (48 ÷ 8 × 3) n'est MONTRÉ qu'une fois, comme un calcul (la règle « simplifier avant de multiplier » est 3AM `maqlub`). LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['كيف أترجم «كسر من ...» إلى ضرب؟', 'ما الطريقة الأسهل لحساب كسر من عدد؟', 'كيف أضرب عددًا عشريًا في كسر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أترجم «من» إلى ضرب"
      moduleSubtitle="كسر من عدد، كسر من كسر، وعدد عشري في كسر"
      estimatedTime="10 دقائق"
      brief={{ tone: 'sky', tag: 'طريقة', title: 'من كسرين إلى ثلاثة أنواع من الأسئلة',
        body: <p>على النافذة رأينا أنّ الجزء من الجزء ضرب. كلمة «من» بعد كسر تعني دائمًا الضرب، سواء كان ما بعدها عددًا أو كسرًا.</p> }}
      steps={[
        { num: 1, title: 'أمثلة محلولة', subtitle: 'اكشف سطرًا سطرًا', done: read && q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.solution }} onAllRevealed={() => setRead(true)} />
              {read && (
                <NumericQuestion prompt={<MathText>{'احسب $\\frac{3}{8}$ من $48$ : $48\\times\\frac{3}{8}=$'}</MathText>} expected={18}
                  requires={['adad-fi-kasr']} explain={<MathText>{'$\\frac{48\\times 3}{8}=\\frac{144}{8}=18$ ، أو $48\\div 8=6$ ثم $6\\times 3=18$ .'}</MathText>}
                  onAnswered={() => setQ1(true)} />
              )}
              {q1 && <KnowledgeBrick id="kasr-min-adad" />}
            </div>
          ) },
        { num: 2, title: 'أيّ طريقة أسهل هنا؟', subtitle: '$\\frac{5}{12}$ من $60$', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لحساب $\\frac{5}{12}$ من $60$ ، أيّ طريقة صحيحة وأسهل؟'}</MathText>}
                options={[M('أقسم $60$ على $12$ ثم أضرب في $5$'), M('أضرب $60$ في $12$ ثم أقسم على $5$'), M('أقسم $60$ على $5$ ثم أضرب في $12$')]}
                correct={0} cols={1} requires={['kasr-min-adad']}
                explain={<MathText>{'$12$ يقسم $60$ ، فنقسم أوّلًا: $60\\div 12=5$ ثم $5\\times 5=25$ . (ويمكن أيضًا $\\frac{60\\times 5}{12}=\\frac{300}{12}=25$ .) أمّا الطريقتان الأخريان فتعطيان $144$ ، لأنّهما تقلبان البسط والمقام.'}</MathText>}
                onAnswered={() => setQ2(true)} />
            </div>
          ) },
        { num: 3, title: 'الاختزال في النهاية', subtitle: '$\\frac{6}{24}$', done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'اختزل $\\frac{6}{24}=\\frac{1}{\\ldots}$ . المقام:'}</MathText>} expected={4}
                requires={['juz-min-juz']} explain={<MathText>{'نقسم الحدّين على $6$ : $\\frac{6}{24}=\\frac{1}{4}$ ، وهو الكتابة المختزلة.'}</MathText>}
                onAnswered={() => setQ3(true)} />
              {q3 && <KnowledgeBrick id="kasr-min-baqi" />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
