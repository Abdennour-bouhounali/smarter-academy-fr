import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف (le manuel en donne deux : « العبارة الحرفية » avec ses اصطلاحات et « أطبّق قاعدة حرفية », pp. 81) : chaque encadré NOMME ce que l'élève vient de faire sur le cadran (question → encadré → brique), avec les mots
 * de la plateforme (guide §4ter-bis) : la lettre et l'expression littérale, le signe × omis (et JAMAIS entre deux nombres : 2 × 3 ≠ 23), la règle littérale, l'application en tout endroit, le contre-exemple.
 * Le périmètre et l'aire d'un rectangle ne sont qu'un « تذكّر » (taught later by geometry). LP : P1–P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const [q6, setQ6] = useState(false);
  return (
    <ContentModule
      objectives={['ما العبارة الحرفية وكيف نحذف إشارة الضرب؟', 'كيف أطبّق قاعدة حرفية؟', 'متى يكفي مثال واحد؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — العبارة والقاعدة الحرفية"
      moduleSubtitle="العبارة · الاصطلاح · القاعدة · التطبيق · المثال المضادّ"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما فعلتَه بالقرص', tone: 'violet',
        body: <p>ما فعلتَه بالأقراص والبطاقات نكتبه الآن بالأسماء. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'العبارة الحرفية', subtitle: 'الحرف يرمز إلى عدد', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>في « 5 × n + 20 » الحرف n يرمز إلى:</span>}
                options={[M('عدد يمكن تغييره: عدد الورقات'), M('الثمن النهائي'), M('إشارة العملية')]}
                correct={0} cols={1} requires={['qaida-tatbiq']}
                explain={<MathText>{'الحرف يرمز إلى عدد نختاره: إذا وضعنا مكانه عددًا حصلنا على عدد، فـ $5\\times n+20$ عبارة حرفية.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.expr.definition} source={KNOWLEDGE.expr.source} />}
              {q1 && <KnowledgeBrick id="ibara-harfiya" compact />}
            </div>
          ),
        },
        {
          num: 2, title: 'حذف إشارة الضرب', subtitle: 'عدد وحرف، حرفان، قوس', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>نكتب <bdi dir="ltr">2 × x</bdi> بحذف الإشارة هكذا:</span>}
                options={[M('$2x$'), M('$x2$'), M('$2+x$')]}
                correct={0} cols={3} requires={['ibara-harfiya']}
                explain={<MathText>{'نحذف الإشارة بين عدد وحرف ونكتب العدد قبل الحرف: $2\\times x=2x$ ، وكذلك $a\\times b=ab$ و $3\\times(x+2)=3(x+2)$ .'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="property" compact text={KNOWLEDGE.conv.text} source={KNOWLEDGE.conv.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'لا نحذفها بين عددين', subtitle: '2 × 3 ليست 23', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>من أجل x = 3 قيمة <bdi dir="ltr">2x</bdi> هي:</span>}
                options={[M('$6$'), M('$23$'), M('$5$')]}
                correct={0} cols={3} requires={['ibara-harfiya']}
                explain={<MathText>{'$2x$ تعني $2\\times x$ ؛ فنضع $3$ مكان $x$ ونعيد الإشارة: $2\\times 3=6$ ، لا $23$ ولا $2+3$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="remark" compact text={KNOWLEDGE.convNum.text} source={KNOWLEDGE.convNum.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'القاعدة الحرفية', subtitle: 'مساواة نحسب بها مقدارًا', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>القاعدة الحرفية مساواة تسمح بـ:</span>}
                options={[M('حساب مقدار بمعرفة مقادير أخرى'), M('حذف كلّ الأعداد'), M('الجمع دون حساب')]}
                correct={0} cols={1} requires={['ibara-harfiya']}
                explain={<MathText>{'مثل $P=2\\times(a+b)$ : إذا عرفنا $a$ و $b$ حسبنا $P$ .'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <TextbookBox kind="definition" compact text={KNOWLEDGE.rule.definition} source={KNOWLEDGE.rule.source} />}
              {q4 && <TextbookBox kind="remark" compact text={KNOWLEDGE.recall.text} source={KNOWLEDGE.recall.source} />}
            </div>
          ),
        },
        {
          num: 5, title: 'نطبّق القاعدة', subtitle: 'القيمة في كلّ موضع ثمّ نحسب', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>لنطبّق <bdi dir="ltr">5 × n + 20 − n</bdi> من أجل n = 10 نضع 10:</span>}
                options={[M('في موضعي الحرف n معًا'), M('في الموضع الأوّل فقط'), M('بجانب العدد 5 فقط')]}
                correct={0} cols={1} requires={['kull-mawdi']}
                explain={<MathText>{'الحرف $n$ مكتوب في موضعين، فنضع $10$ فيهما: $5\\times 10+20-10=50+20-10=60$ ؛ ونحسب بالأولويات: الضرب ثمّ الجمع والطرح.'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <TextbookBox kind="property" compact text={KNOWLEDGE.apply.text} source={KNOWLEDGE.apply.source} />}
            </div>
          ),
        },
        {
          num: 6, title: 'المثال المضادّ', subtitle: 'مثال واحد يكفي لإسقاطها', done: q6,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>قال زميل: « <bdi dir="ltr">n × n &gt; n</bdi> دائمًا ». أيّ قيمة تُسقط قوله؟</span>}
                options={[M('$n=1$ لأنّ $1\\times 1=1$ وهو ليس أكبر من $1$'), M('$n=5$ لأنّ $25>5$'), M('لا توجد قيمة تُسقطه')]}
                correct={0} cols={1} requires={['mithal-mudad']}
                explain={<MathText>{'من أجل $n=1$ نجد $1\\times 1=1$ و $1$ ليس أكبر من $1$ : مثال مضادّ واحد يكفي، أمّا $n=5$ فتصحّ القاعدة فيها ولا تنقذها.'}</MathText>}
                onAnswered={() => setQ6(true)}
              />
              {q6 && <TextbookBox kind="property" compact text={KNOWLEDGE.counter.text} source={KNOWLEDGE.counter.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
