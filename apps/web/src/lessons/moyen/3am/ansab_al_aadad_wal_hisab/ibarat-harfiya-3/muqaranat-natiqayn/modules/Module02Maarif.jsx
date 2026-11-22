import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, FractionQuestion } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RECALL_FRACTIONS } from '../content/textbook';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de faire au galvanomètre, avec les mots de la plateforme (guide §4ter-bis). Aucun labo : la première question est l'action — des
 * fonctions de la différence DONNÉE (a − b = 2/7, puis b − a = −4 : la soustraction inversée), puis « أتوقّع القاعدة » (la brique gardée), la règle et son exemple ; puis deux calculs de différence
 * de fractions (7/4 − 5/3, −11/8 − (−4/3)) avec la conclusion écrite. Une « تذكّر » dans le `brief` : la comparaison de deux fractions (unité 2), avec son lien — jamais reconstruite. LP : P1, P2.
 */
export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (key) => () => setQ((s) => ({ ...s, [key]: true }));
  const link = (code, label) => { const to = getLessonPath(code); return to && <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{label}</Link>; };
  return (
    <ContentModule
      objectives={['أكتب العلاقة بين الترتيب وإشارة الفرق في حالاتها الثلاث', 'أستعملها لأقارن عددين']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الفرق يرتّب"
      moduleSubtitle="ثلاث حالات · الاستنتاج المكتوب"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما قرأتَه على المقياس', tone: 'violet',
        body: (
          <div className="space-y-3">
            <p>أجب أوّلًا، ثم اقرأ الخلاصة التي تحت الأسئلة.</p>
            <TextbookBox kind="remark" title={RECALL_FRACTIONS.title} text={RECALL_FRACTIONS.text} source={RECALL_FRACTIONS.source} compact>
              {link(RECALL_FRACTIONS.lesson, 'درس « تساوي كسرين ومقارنتهما » — السنة الثالثة متوسط')}
            </TextbookBox>
          </div>
        ),
      }}
      steps={[
        {
          num: 1, title: 'من الفرق إلى الترتيب', subtitle: 'فرق معطى', done: !!q.a && !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{String.raw`أكمل: إذا كان $a-b=\frac27$ فإنّ …`}</MathText>}
                options={[<MathText key="1">{'$a>b$'}</MathText>, <MathText key="2">{'$a<b$'}</MathText>, <MathText key="3">{'$a=b$'}</MathText>]}
                correct={0} cols={3} requires={['farq-wahdahu']}
                explain={<MathText>{'الفرق $a-b$ موجب، إذن $a>b$.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && (
                <TapQuestion
                  prompt={<MathText>{String.raw`وإذا كان $b-a=-4$ فإنّ …`}</MathText>}
                  options={[<MathText key="1">{'$a>b$'}</MathText>, <MathText key="2">{'$a<b$'}</MathText>, <MathText key="3">{'$a=b$'}</MathText>]}
                  correct={0} cols={3} requires={['farq-wahdahu']}
                  explain={<MathText>{'الفرق $b-a$ سالب، فـ $b<a$ أي $a>b$ : هنا عدد المجسّ الأحمر هو $b$.'}</MathText>}
                  onAnswered={answered('b')}
                />
              )}
              {q.b && <KnowledgeBrick id="maana-farq" lead="قرأتَ الترتيب من الفرق في الحالتين: اكتب العلاقة بين الترتيب وإشارة الفرق." />}
              {q.b && <TextbookBox kind="definition" compact text={KNOWLEDGE.rule.text} source={KNOWLEDGE.rule.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'أحسب الفرق ثم أكتب الاستنتاج', subtitle: 'كسران موجبان', done: !!q.c && !!q.d,
          content: (
            <div className="space-y-3">
              <FractionQuestion
                prompt={<MathText>{String.raw`احسب $\frac74-\frac53$ . (اكتب كسرًا)`}</MathText>}
                expected="1/12" requires={['maana-farq']}
                explain={<MathText>{'$\\frac{21}{12}-\\frac{20}{12}=\\frac{1}{12}$.'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && (
                <TapQuestion
                  prompt={<MathText>{String.raw`فنكتب الاستنتاج:`}</MathText>}
                  options={[<MathText key="1">{'بما أنّ $\\frac74-\\frac53>0$ فإنّ $\\frac74>\\frac53$'}</MathText>, <MathText key="2">{'بما أنّ $\\frac74-\\frac53>0$ فإنّ $\\frac74<\\frac53$'}</MathText>]}
                  correct={0} cols={1} requires={['maana-farq']}
                  explain={<MathText>{'الفرق موجب، إذن العدد المطروح منه هو الأكبر: $\\frac74>\\frac53$.'}</MathText>}
                  onAnswered={answered('d')}
                />
              )}
              {q.d && <TextbookBox kind="example" compact text={KNOWLEDGE.example1.text} source={KNOWLEDGE.example1.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'عدد سالب في الفرق', subtitle: 'نكتب الاستنتاج أيضًا', done: !!q.e && !!q.f,
          content: (
            <div className="space-y-3">
              <FractionQuestion
                prompt={<MathText>{String.raw`احسب $-\frac{11}8-\left(-\frac43\right)$ . (اكتب كسرًا)`}</MathText>}
                expected="-1/24" requires={['maana-farq']}
                explain={<MathText>{'$-\\frac{33}{24}+\\frac{32}{24}=-\\frac{1}{24}$.'}</MathText>}
                onAnswered={answered('e')}
              />
              {q.e && (
                <TapQuestion
                  prompt={<MathText>{String.raw`فالاستنتاج الصحيح:`}</MathText>}
                  options={[<MathText key="1">{'$-\\frac{11}8<-\\frac43$ لأنّ الفرق سالب'}</MathText>, <MathText key="2">{'$-\\frac{11}8>-\\frac43$ لأنّ $\\frac{11}{8}>\\frac43$'}</MathText>]}
                  correct={0} cols={1} requires={['maana-farq']}
                  explain={<MathText>{'الفرق $-\\frac1{24}$ سالب، إذن $-\\frac{11}8<-\\frac43$ ؛ مع العدد السالب الأبعد عن الصفر هو الأصغر.'}</MathText>}
                  onAnswered={answered('f')}
                />
              )}
              {q.f && <KnowledgeBrick id="hisab-farq" lead="حسبتَ فرقين ثم كتبتَ الاستنتاج: ما الخطوات؟" />}
              {q.f && <TextbookBox kind="example" compact text={KNOWLEDGE.example2.text} source={KNOWLEDGE.example2.source} />}
              {q.f && <TextbookBox kind="remark" compact text={KNOWLEDGE.pi.text} source={KNOWLEDGE.pi.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
