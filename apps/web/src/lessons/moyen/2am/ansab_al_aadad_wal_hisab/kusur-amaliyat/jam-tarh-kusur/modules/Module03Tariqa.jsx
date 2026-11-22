import { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (idée de method-3) : trois pas. (1) un exemple résolu en quatre lignes (7/15 + 2/5, 11/6 − 2/3, 2 + 3/8, puis trois termes 4/9 + 5/18 + 1/6 : 18 est multiple de 9 ET de 6) ; (2) « quel est le plus
 * grand dénominateur, est-il multiple des autres ? » ; (3) l'étape finale : on réduit (16/18 = 8/9). LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['كيف أختار المقام الموحّد؟', 'كيف أحوّل الكسور الأخرى إليه؟', 'لماذا أختزل في النهاية؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أوحّد ثم أجمع ثم أختزل"
      moduleSubtitle="حتى ثلاثة كسور مقام أكبرها مضاعف للباقي"
      estimatedTime="10 دقائق"
      brief={{ tone: 'sky', tag: 'طريقة', title: 'ثلاثة كسور؟ لا مشكلة',
        body: <p>على المسلك حوّلنا الأعمدة الحمراء إلى بيضاء. نفعل الشيء نفسه مع أيّ عدد من الكسور إذا كان أكبر مقام مضاعفًا لكلّ المقامات الأخرى.</p> }}
      steps={[
        { num: 1, title: 'أمثلة محلولة', subtitle: 'اكشف سطرًا سطرًا', done: read && q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.solution }} onAllRevealed={() => setRead(true)} />
              {read && (
                <NumericQuestion prompt={<MathText>{'في $\\frac{7}{15}+\\frac{2}{5}$ نكتب $\\frac{2}{5}=\\frac{\\ldots}{15}$ . البسط:'}</MathText>} expected={6}
                  requires={['tawhid-mudaaf']} explain={<MathText>{'$15=5\\times 3$ : $\\frac{2}{5}=\\frac{6}{15}$ ثم $\\frac{7}{15}+\\frac{6}{15}=\\frac{13}{15}$ .'}</MathText>}
                  onAnswered={() => setQ1(true)} />
              )}
              {q1 && <KnowledgeBrick id="tariqa-tawhid" />}
            </div>
          ) },
        { num: 2, title: 'أيّ مقام نختار؟', subtitle: '$9$ و $18$ و $6$', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'نجمع كسورًا مقاماتها $9$ و $18$ و $6$ . نختار المقام:'}</MathText>}
                options={[M('$18$'), M('$9$'), M('$6$')]}
                correct={0} cols={3} requires={['qaida-jam-tarh']}
                explain={<MathText>{'$18$ مضاعف لـ $9$ ولـ $6$ معًا ($18=9\\times 2=6\\times 3$) ؛ أمّا $9$ فليس مضاعفًا لـ $6$ ، و $6$ ليس مضاعفًا لـ $9$ .'}</MathText>}
                onAnswered={() => setQ2(true)} />
            </div>
          ) },
        { num: 3, title: 'الاختزال في النهاية', subtitle: '$\\frac{16}{18}$', done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'اختزل $\\frac{16}{18}=\\frac{8}{\\ldots}$ . المقام:'}</MathText>} expected={9}
                requires={['tariqa-tawhid']} explain={<MathText>{'نقسم الحدّين على $2$ : $\\frac{16}{18}=\\frac{8}{9}$ ، وهو الكتابة المختزلة.'}</MathText>}
                onAnswered={() => setQ3(true)} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
