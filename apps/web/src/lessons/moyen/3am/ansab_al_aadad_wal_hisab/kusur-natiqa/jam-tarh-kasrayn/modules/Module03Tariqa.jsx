import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). La méthode du livre : on écrit les multiples du PLUS GRAND dénominateur jusqu'au premier qui est divisible par
 * l'autre. Trois exemples, chacun avec SA question avant la solution révélée ligne à ligne : 7/18 + 5/12 (36), 13/20 − 4/15 (60) et une somme à trois termes avec un naturel
 * (2 + 1/6 − 3/4). La méthode et la brique viennent APRÈS la réponse. LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['أيّ مضاعف مشترك أبدأ به؟', 'كيف أطرح؟', 'كيف أحسب بثلاثة حدود وعدد طبيعي؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أصغر مضاعف مشترك"
      moduleSubtitle="مضاعفات المقام الأكبر"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'جمع كسرين', subtitle: '7/18 + 5/12', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'لجمع $\\frac{7}{18}$ و $\\frac{5}{12}$ نكتب مضاعفات $18$ : $18$ ، $36$ ، … ما أوّل مضاعف لـ $18$ يقبل القسمة على $12$ ؟'}</MathText>}
                expected={36} display="36" parse={parseDec} requires={['asghar-mudaaf']}
                explain={<MathText>{'$18$ لا يقبل القسمة على $12$ ؛ $36=12\\times3$ : أصغر مضاعف مشترك هو $36$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.smallest} onAllRevealed={revealed('a')} />}
            </div>
          ),
        },
        {
          num: 2, title: 'طرح كسرين', subtitle: '13/20 − 4/15', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لطرح $\\frac{4}{15}$ من $\\frac{13}{20}$ : مضاعفات $20$ هي $20$ ، $40$ ، $60$ ، … أيّها نختار مقامًا مشتركًا؟'}</MathText>}
                options={[M('$60$ : أوّل مضاعف لـ $20$ يقبل القسمة على $15$'), M('$40$ لأنّه المضاعف الثاني'), M('$35$ لأنّه مجموع $20$ و $15$')]}
                correct={0} cols={1} requires={['asghar-mudaaf']}
                explain={<MathText>{'$60\\div15=4$ ، أمّا $40$ فلا يقبل القسمة على $15$ ، و $35$ ليس مضاعفًا لـ $20$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.difference} onAllRevealed={revealed('b')} />}
            </div>
          ),
        },
        {
          num: 3, title: 'ثلاثة حدود وعدد طبيعي', subtitle: '2 + 1/6 − 3/4', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'في $2+\\frac{1}{6}-\\frac{3}{4}$ المقام المشترك $12$ . اكتب $2$ كسرًا مقامه $12$ : البسط:'}</MathText>}
                expected={24} display="24" parse={parseDec} requires={['qaida-jam-tarh']}
                explain={<MathText>{'$2=\\frac{2\\times12}{12}=\\frac{24}{12}$ .'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.natural} onAllRevealed={revealed('c')} />}
              {q.c && r.c && <KnowledgeBrick id="tariqa-multiples" lead="كيف نصل بسرعة إلى أصغر مضاعف مشترك لمقامين؟" />}
              {q.c && r.c && <TextbookBox kind="method" compact lines={[METHOD.choose.rule]} source={METHOD.choose.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
