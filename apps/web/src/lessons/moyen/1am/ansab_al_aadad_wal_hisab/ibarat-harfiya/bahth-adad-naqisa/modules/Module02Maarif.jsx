import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف (ajout de la plateforme : le manuel n'a pas de معارف pour cette leçon) : chaque encadré NOMME ce que l'élève vient de faire sur le tapis (question → encadré → brique),
 * avec les mots de la plateforme (guide §4ter-bis) : le nombre manquant □, le nombre manquant d'une somme (l'opération inverse est la soustraction), d'une différence (deux places pour □), d'un
 * produit (la division, qui peut donner une fraction), la contre-épreuve par substitution, puis une carte d'histoire (al-Khwarizmi). LP : P1–P3.
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
      objectives={['ما العدد الناقص □ في مساواة؟', 'كيف أجده في مجموع وفي فرق وفي جداء؟', 'لماذا أتحقّق دائمًا بالتعويض؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — العدد الناقص"
      moduleSubtitle="المساواة · العملية العكسية · التحقّق"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما فعلتَه على الحزام', tone: 'violet',
        body: <p>ما فعلتَه بالبطاقات والصناديق نكتبه الآن بالأسماء. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'ما العدد الناقص؟', subtitle: 'المربع □', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>العدد الناقص في المساواة <bdi dir="ltr">□ + 9 = 54</bdi> هو:</span>}
                options={[M('$45$'), M('$63$'), M('$54$')]}
                correct={0} cols={3} requires={['naqis-majmu']}
                explain={<MathText>{'نبحث عن العدد الذي إذا وضعناه مكان المربع صارت المساواة صحيحة: $45+9=54$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.hole.definition} source={KNOWLEDGE.hole.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'في مجموع', subtitle: 'الطرح يُرجع الجمع', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>العملية العكسية للجمع هي:</span>}
                options={[M('الطرح'), M('الضرب'), M('القسمة')]}
                correct={0} cols={3} requires={['naqis-majmu']}
                explain={<MathText>{'الجمع والطرح يُلغي كلّ منهما الآخر: من $45+9=54$ نرجع بـ $54-9=45$ .'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="musawat-naqisa" compact />}
              {q2 && <TextbookBox kind="property" compact text={KNOWLEDGE.sum.text} source={KNOWLEDGE.sum.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'في فرق', subtitle: 'مكان □ يغيّر العملية', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>لإيجاد العدد الناقص في <bdi dir="ltr">50 − □ = 18</bdi> نحسب:</span>}
                options={[M('$50-18$'), M('$50+18$'), M('$18-50$')]}
                correct={0} cols={3} requires={['naqis-farq']}
                explain={<MathText>{'المطروح هو المجهول: ما أُخذ من $50$ فبقي $18$ هو الفرق $50-18=32$ ؛ لا نجمع ولا نطرح $50$ من $18$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="property" compact text={KNOWLEDGE.diff.first} source={KNOWLEDGE.diff.source} />}
              {q3 && <TextbookBox kind="property" compact text={KNOWLEDGE.diff.second} source={KNOWLEDGE.diff.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'في جداء', subtitle: 'القسمة تُرجع الضرب', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>لإيجاد العدد الناقص في <bdi dir="ltr">6 × □ = 54</bdi> :</span>}
                options={[M('نقسم 54 على 6'), M('نضرب 54 في 6'), M('نطرح 6 من 54')]}
                correct={0} cols={1} requires={['naqis-judaa']}
                explain={<MathText>{'القسمة تُلغي الضرب: $54\\div 6=9$ ، ونتحقّق: $6\\times 9=54$ . وإن لم تتوقّف القسمة كتبنا الناتج كسرًا.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <TextbookBox kind="property" compact text={KNOWLEDGE.product.text} source={KNOWLEDGE.product.source} />}
            </div>
          ),
        },
        {
          num: 5, title: 'التحقّق بالتعويض', subtitle: 'ندفع الصندوق إلى الأمام', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>لنتحقّق من أنّ <bdi dir="ltr">45</bdi> هو العدد الناقص في <bdi dir="ltr">□ + 9 = 54</bdi> نحسب:</span>}
                options={[M('$45+9$ ونقارنه بـ $54$'), M('$54+9$ ونقارنه بـ $45$'), M('$54-45$ ونقارنه بـ $9$ فقط')]}
                correct={0} cols={1} requires={['tahaqquq']}
                explain={<MathText>{'نضع العدد في الآلة الأصلية: $45+9=54$ وهو الناتج المعلوم، فالعدد صحيح.'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <TextbookBox kind="remark" compact text={KNOWLEDGE.check.text} source={KNOWLEDGE.check.source} />}
            </div>
          ),
        },
        {
          num: 6, title: 'من تاريخ الرياضيات', subtitle: 'الخوارزمي والجبر', done: q6,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>كلمة « الجبر » جاءت من اسم كتاب ألّفه الخوارزمي. اسم الكتاب:</span>}
                options={[M('الجبر والمقابلة'), M('الأعداد الناقصة'), M('حساب الأقلام')]}
                correct={0} cols={3}
                explain={<MathText>{'ألّف الخوارزمي كتاب « الجبر والمقابلة » ووضع فيه طرقًا لحلّ المعادلات، ومنه جاء اسم علم الجبر.'}</MathText>}
                onAnswered={() => setQ6(true)}
              />
              {q6 && <TextbookBox kind="remark" compact text={KNOWLEDGE.history.text} source={KNOWLEDGE.history.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
