import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de faire sur la jauge (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) :
 * le besoin d'un nombre sous le zéro (act-1-need), le nombre relatif positif / négatif, le zéro à la fois positif et négatif, les entiers relatifs, la distance au zéro
 * distincte du signe, les nombres opposés, puis une carte d'histoire (les bâtonnets chinois). LP : P1–P3.
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
      objectives={['لماذا نحتاج إلى أعداد سالبة؟', 'ما العدد الموجب والعدد السالب؟ وماذا عن الصفر؟', 'ما المسافة إلى الصفر ومن هما العددان المتعاكسان؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الأعداد النسبية"
      moduleSubtitle="موجب · سالب · الصفر · المسافة · المتعاكسان"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما فعلتَه على الجهاز', tone: 'violet',
        body: <p>ما فعلتَه بالمستوى نكتبه الآن بالأسماء. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'لماذا لا تكفي الأعداد الطبيعية؟', subtitle: 'عدد تحت الصفر', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أيّ عدد يكمل <bdi dir="ltr">6 + … = 4</bdi> ؟</span>}
                options={[M('$-2$'), M('$2$'), M('$10$')]}
                correct={0} cols={3} requires={['sayaqat-salib']}
                explain={<MathText>{'نبدأ من $6$ ونحتاج أن نصل إلى $4$ : لا بدّ من النزول درجتين، أي عدد تحت الصفر هو $-2$ . لا عدد طبيعي يصلح.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="remark" compact text={KNOWLEDGE.need.text} source={KNOWLEDGE.need.source} />}
              {q1 && <TextbookBox kind="remark" compact text={KNOWLEDGE.contexts.text} source={KNOWLEDGE.contexts.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'عدد موجب وعدد سالب', subtitle: 'الإشارة', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>عدد تسبقه الإشارة <bdi dir="ltr">−</bdi> هو:</span>}
                options={[M('سالب، أصغر من الصفر'), M('موجب، أكبر من الصفر'), M('الصفر')]}
                correct={0} cols={1}
                explain={<MathText>{'الإشارة − تعني أنّ العدد يقع تحت الصفر، فهو سالب وأصغر من الصفر.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="adad-nisbi" compact />}
              {q2 && <TextbookBox kind="definition" compact text={KNOWLEDGE.relative.definition} source={KNOWLEDGE.relative.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'والصفر؟', subtitle: 'موجب وسالب معًا', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>العدد <bdi dir="ltr">0</bdi> هو:</span>}
                options={[M('موجب وسالب في آن واحد'), M('موجب فقط'), M('ليس عددًا نسبيًّا')]}
                correct={0} cols={1} requires={['adad-nisbi']}
                explain={<MathText>{'الصفر لا يقع فوق الصفر ولا تحته: يُعدّ موجبًا وسالبًا في آن واحد، وهو معاكس نفسه.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="remark" compact text={KNOWLEDGE.zero.text} source={KNOWLEDGE.zero.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'الإشارة غير المسافة', subtitle: 'والعددان المتعاكسان', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>ما المسافة إلى الصفر للعدد <bdi dir="ltr">−7</bdi> ؟</span>}
                options={[M('$7$'), M('$-7$'), M('$0$')]}
                correct={0} cols={3} requires={['ishara-masafa']}
                explain={<MathText>{'المسافة هي عدد التدريجات بين المستوى والصفر، فلا تكون سالبة: $7$ . أمّا الإشارة − فتقول إنّه تحت الصفر.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <TextbookBox kind="property" compact text={KNOWLEDGE.signDistance.text} source={KNOWLEDGE.signDistance.source} />}
              {q4 && <TextbookBox kind="definition" compact text={KNOWLEDGE.opposites.definition} source={KNOWLEDGE.opposites.source} />}
            </div>
          ),
        },
        {
          num: 5, title: 'الأعداد الصحيحة النسبية', subtitle: 'بلا جزء عشري', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أيّ هذه الأعداد النسبية عدد صحيح نسبي؟</span>}
                options={[M('$-4$'), M('$-0{,}5$'), M('$1{,}2$')]}
                correct={0} cols={3} requires={['adad-nisbi']}
                explain={<MathText>{'العدد الصحيح النسبي لا جزء عشريًّا فيه: $-4$ . أمّا $-0{,}5$ و $1{,}2$ فلكلّ منهما جزء عشري.'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <TextbookBox kind="remark" compact text={KNOWLEDGE.relInt.text} source={KNOWLEDGE.relInt.source} />}
            </div>
          ),
        },
        {
          num: 6, title: 'من تاريخ الأعداد', subtitle: 'العيدان الحمراء والسوداء', done: q6,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>كان الصينيون القدامى يعدّون بعيدان خشبية ويميّزون الموجب من السالب بلونها. لون عيدان العدد الموجب:</span>}
                options={[M('الأحمر'), M('الأسود'), M('الأخضر')]}
                correct={0} cols={3}
                explain={<MathText>{'العيدان الحمراء للعدد الموجب والسوداء للعدد السالب: عرفوا الأعداد السالبة منذ قرون.'}</MathText>}
                onAnswered={() => setQ6(true)}
              />
              {q6 && <TextbookBox kind="remark" compact text={KNOWLEDGE.rods.text} source={KNOWLEDGE.rods.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
