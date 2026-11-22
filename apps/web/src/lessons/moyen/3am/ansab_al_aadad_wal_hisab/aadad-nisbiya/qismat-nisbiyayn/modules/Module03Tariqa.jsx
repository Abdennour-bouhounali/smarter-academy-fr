import { useState } from 'react';
import { parseDec, getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { Link } from 'react-router-dom';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, KNOWLEDGE, RECALL_PRIORITY } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : calculer un quotient en deux gestes — l'ÉCRITURE du signe, puis la division des distances
 * (S1, quatre quotients dont deux décalages de virgule) ; le signe d'un quotient de PRODUITS en comptant les facteurs négatifs en haut et en bas (S2, l'activité 4 ③ redessinée) ;
 * puis une série de calculs avec les priorités (S3, S4). La méthode et les briques viennent APRÈS la réponse. La « تذكّر — السنة الثانية » des priorités est dans l'en-tête
 * (leçon 2AM non publiée : sans lien). LP : P2, P3, P4.
 */
const Q_TEX = '$Q = \\frac{(-2) \\times (-5) \\times 3 \\times (-1)}{(-1) \\times 4 \\times 5 \\times (-6)}$';

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [s1, setS1] = useState({});
  const [s2, setS2] = useState({});
  const [s3, setS3] = useState({});
  const done = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const priorPath = getLessonPath(RECALL_PRIORITY.lesson);
  return (
    <ContentModule
      objectives={['كيف أحسب حاصل قسمة عددين نسبيين؟', 'كيف أعيّن إشارة حاصل قسمة جداءين؟', 'كيف أنظّم سلسلة حسابات؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحسب حاصل قسمة وأنظّم سلسلة حسابات"
      moduleSubtitle="الإشارة · المسافتان · الأولويات"
      estimatedTime="12 دقيقة"
      brief={{
        tag: 'طريقة', title: 'قبل أن تحسب', tone: 'emerald',
        body: (
          <TextbookBox kind="remark" title={RECALL_PRIORITY.title} text={RECALL_PRIORITY.text} source={RECALL_PRIORITY.source} compact>
            {priorPath && <Link to={priorPath} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « أولوية العمليات » — السنة الثانية متوسط</Link>}
          </TextbookBox>
        ),
      }}
      steps={[
        {
          num: 1, title: 'أحسب حاصل قسمة', subtitle: 'الإشارة ثم المسافتان', done: !!q.a,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'احسب: $(-63) \\div 7$'}</MathText>}
                expected={-9} display="−9" parse={parseDec} requires={['ishara-qisma']}
                explain={<MathText>{'مختلفا الإشارة: سالب، و $63 \\div 7 = 9$ ، إذن $-9$ . نتحقّق: $7 \\times (-9) = -63$ .'}</MathText>}
                onAnswered={() => setS1((s) => ({ ...s, a: true }))}
              />
              {s1.a && (
                <NumericQuestion
                  prompt={<MathText>{'احسب: $(-54) \\div (-6)$'}</MathText>}
                  expected={9} parse={parseDec} requires={['ishara-qisma']}
                  explain={<MathText>{'سالبان: موجب، و $54 \\div 6 = 9$ . نتحقّق: $(-6) \\times 9 = -54$ .'}</MathText>}
                  onAnswered={() => setS1((s) => ({ ...s, b: true }))}
                />
              )}
              {s1.b && (
                <NumericQuestion
                  prompt={<MathText>{'احسب: $0{,}36 \\div (-0{,}001)$'}</MathText>}
                  expected={-360} display="−360" parse={parseDec} requires={['ishara-qisma']}
                  explain={<MathText>{'مختلفا الإشارة: سالب. القسمة على $0{,}001$ تزيح الفاصلة ثلاث منازل إلى اليمين: $0{,}36 \\to 360$ ، إذن $-360$ .'}</MathText>}
                  onAnswered={() => setS1((s) => ({ ...s, c: true }))}
                />
              )}
              {s1.c && (
                <NumericQuestion
                  prompt={<MathText>{'احسب: $-4{,}5 \\div 100$'}</MathText>}
                  expected={-0.045} display="−0,045" parse={parseDec} requires={['ishara-qisma']}
                  explain={<MathText>{'مختلفا الإشارة: سالب. القسمة على $100$ تزيح الفاصلة منزلتين إلى اليسار: $4{,}5 \\to 0{,}045$ ، إذن $-0{,}045$ .'}</MathText>}
                  onAnswered={done('a')}
                />
              )}
              {q.a && <MethodSteps method={METHOD.compute} />}
              {q.a && <KnowledgeBrick id="tariqat-qisma" lead="حاصل قسمة عددين: ما الخطوات؟ وماذا عن الفاصلة؟" />}
              {q.a && <TextbookBox kind="remark" compact text={METHOD.sign.text} source={METHOD.sign.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'إشارة حاصل قسمة جداءين', subtitle: 'نعدّ السالبة في البسط وفي المقام', done: !!q.b,
          content: (
            <div className="space-y-3">
              <p className="text-center text-base" dir="ltr"><MathText>{Q_TEX}</MathText></p>
              <TapQuestion
                prompt="ما إشارة بسط Q ؟"
                options={['سالبة', 'موجبة']} correct={0} cols={2} requires={['tariqat-qisma']}
                explain={<MathText>{'في البسط ثلاثة عوامل سالبة ($-2$ و $-5$ و $-1$): عدد فردي، فالبسط سالب ($-30$).'}</MathText>}
                onAnswered={() => setS2((s) => ({ ...s, a: true }))}
              />
              {s2.a && (
                <TapQuestion
                  prompt="وما إشارة مقام Q ؟"
                  options={['سالبة', 'موجبة']} correct={1} cols={2} requires={['tariqat-qisma']}
                  explain={<MathText>{'في المقام عاملان سالبان ($-1$ و $-6$): عدد زوجي، فالمقام موجب ($120$).'}</MathText>}
                  onAnswered={() => setS2((s) => ({ ...s, b: true }))}
                />
              )}
              {s2.b && (
                <NumericQuestion
                  prompt={<MathText>{'احسب $Q = \\dfrac{-30}{120}$ (اكتب العدد كتابةً عشرية)'}</MathText>}
                  expected={-0.25} display="−0,25" parse={parseDec} requires={['tariqat-qisma']}
                  explain={<MathText>{'بسط سالب ومقام موجب: الحاصل سالب، و $30 \\div 120 = 0{,}25$ ، إذن $Q = -\\frac{30}{120} = -\\frac{1}{4} = -0{,}25$ .'}</MathText>}
                  onAnswered={done('b')}
                />
              )}
              {q.b && <TextbookBox kind="example" compact text={METHOD.products.text} source={METHOD.products.source} />}
              {q.b && <KnowledgeBrick id="ishara-jadaa" lead="في حاصل قسمة جداءين: كيف نعرف الإشارة دون أن نحسب؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ما العملية الأولى؟', subtitle: 'سلسلة حسابات', done: !!q.c,
          content: (
            <div className="space-y-3">
              <p className="text-center text-base" dir="ltr"><MathText>{'$A = 5 - (3 \\times (-4) + 7)$'}</MathText></p>
              <TapQuestion
                prompt="في حساب A ما العملية التي ننجزها أوّلًا؟"
                options={[<MathText key="a">{'$3 \\times (-4)$'}</MathText>, <MathText key="b">{'$-4 + 7$'}</MathText>, <MathText key="c">{'$5 - 3$'}</MathText>, <MathText key="d">{'$7 - (\\ldots)$'}</MathText>]}
                correct={0} cols={2} requires={['awlawiya-amaliyat']}
                explain={<MathText>{'ما بين القوسين أوّلًا، وداخلهما الضرب قبل الجمع: $3 \\times (-4) = -12$ . (ننجز $-4 + 7$ أو $5 - 3$ قبل الضرب فنخالف الأولوية.)'}</MathText>}
                onAnswered={() => setS3((s) => ({ ...s, a: true }))}
              />
              {s3.a && (
                <NumericQuestion
                  prompt={<MathText>{'أكمل الحساب: $A = 5 - (-12 + 7) = 5 - (-5) =$'}</MathText>}
                  expected={10} parse={parseDec} requires={['awlawiya-amaliyat']}
                  explain={<MathText>{'$-12 + 7 = -5$ ثم $5 - (-5) = 5 + 5 = 10$ . (طرح عدد سالب هو جمع معاكسه: $5 - (-5)$ ليس $0$ .)'}</MathText>}
                  onAnswered={done('c')}
                />
              )}
              {q.c && <TextbookBox kind="property" compact lines={KNOWLEDGE.priorities.lines} source={KNOWLEDGE.priorities.source} />}
              {q.c && <TextbookBox kind="example" compact text={KNOWLEDGE.priorities.examples} source={KNOWLEDGE.priorities.source} />}
              {q.c && <KnowledgeBrick id="tariqat-awlawiya" lead="في سلسلة حسابات: بأيّ ترتيب نحسب؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'سلسلة بقسمة وأقواس', subtitle: 'الأولويات كلّها معًا', done: !!q.d,
          content: (
            <div className="space-y-3">
              <p className="text-center text-base" dir="ltr"><MathText>{'$B = (-18) \\div (2 - 5) + 4 \\times (-0{,}5)$'}</MathText></p>
              <NumericQuestion
                prompt={<MathText>{'احسب $B$ . (اكتب العدد)'}</MathText>}
                expected={4} parse={parseDec} requires={['tariqat-awlawiya']}
                explain={<MathText>{'القوس أوّلًا: $2 - 5 = -3$ . ثم القسمة والضرب: $(-18) \\div (-3) = 6$ و $4 \\times (-0{,}5) = -2$ . ثم الجمع: $6 + (-2) = 4$ . (الحساب من اليسار إلى اليمين بلا أولوية يقسم $-18$ على $2$ أوّلًا فيخطئ.)'}</MathText>}
                onAnswered={done('d')}
              />
              {q.d && <MethodSteps method={METHOD.series} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
