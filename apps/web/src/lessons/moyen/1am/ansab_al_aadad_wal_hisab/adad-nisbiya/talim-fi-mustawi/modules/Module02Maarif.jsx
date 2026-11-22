import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de faire dans la cour (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) :
 * le معلم متعامد (deux droites graduées perpendiculaires de même origine), محور الفواصل (l'horizontale) et محور التراتيب (la verticale), إحداثيا نقطة, la فاصلة d'abord puis le ترتيب, les points d'un axe. LP : P1–P3.
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
      objectives={['مم يتشكّل المعلم المتعامد وما اسم محوريه؟', 'ما إحداثيا نقطة وأيّ عدد يُكتب أوّلًا؟', 'ما إحداثيا نقطة على أحد المحورين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المعلم المتعامد"
      moduleSubtitle="المحوران · الفاصلة · الترتيب"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما فعلتَه في الساحة', tone: 'violet',
        body: <p>ما فعلتَه بالمسيّرة والخطّين المطليّين نكتبه الآن بالأسماء. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'المعلم المتعامد', subtitle: 'مستقيمان متعامدان', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>الخطّان المطليّان على أرض الساحة يمثّلان معلمًا متعامدًا، فهو يتشكّل من:</span>}
                options={[M('مستقيمين مدرّجين متعامدين لهما المبدأ نفسه'), M('مستقيمين مدرّجين متوازيين'), M('مستقيم مدرّج واحد')]}
                correct={0} cols={1} requires={['tartib-adadayn']}
                explain={<MathText>{'الخطّان متعامدان ويتقاطعان عند سارية العلم، وهما مدرّجان: لكلّ منهما عدد عند كلّ علامة.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.frame.definition} source={KNOWLEDGE.frame.source} />}
              {q1 && <KnowledgeBrick id="mu-allam-mutaamid" compact />}
            </div>
          ),
        },
        {
          num: 2, title: 'محور الفواصل', subtitle: 'الخط الأفقي', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>الخط الأفقي في المعلم يسمّى:</span>}
                options={[M('محور الفواصل'), M('محور التراتيب'), M('المبدأ')]}
                correct={0} cols={3} requires={['ihdathiyyan']}
                explain={<MathText>{'نقرأ عليه الفاصلة، أي العدد الأول من الإحداثيين، فسمّي محور الفواصل.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="property" compact text={KNOWLEDGE.frame.definition} source={KNOWLEDGE.frame.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'محور التراتيب', subtitle: 'الخط الشاقولي', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>الخط الشاقولي في المعلم يسمّى:</span>}
                options={[M('محور التراتيب'), M('محور الفواصل'), M('المبدأ')]}
                correct={0} cols={3} requires={['ihdathiyyan']}
                explain={<MathText>{'نقرأ عليه الترتيب، أي العدد الثاني من الإحداثيين، فسمّي محور التراتيب.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'إحداثيا نقطة', subtitle: 'الفاصلة ثمّ الترتيب', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $M(-3\\,;\\,5)$ العدد $-3$ هو:'}</MathText>}
                options={[M('الفاصلة، وتُقرأ على محور الفواصل'), M('الترتيب، ويُقرأ على محور التراتيب'), M('المبدأ')]}
                correct={0} cols={1} requires={['ihdathiyyan']}
                explain={<MathText>{'العدد الأول هو الفاصلة ويُقرأ على محور الفواصل، والعدد الثاني $5$ هو الترتيب ويُقرأ على محور التراتيب.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <TextbookBox kind="definition" compact text={KNOWLEDGE.coordinates.definition} source={KNOWLEDGE.coordinates.source} />}
            </div>
          ),
        },
        {
          num: 5, title: 'الترتيب مهمّ', subtitle: 'نقطتان مختلفتان', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'النقطتان $(3\\,;\\,-2)$ و $(-2\\,;\\,3)$ :'}</MathText>}
                options={[M('مختلفتان'), M('هما النقطة نفسها'), M('متناظرتان بالنسبة إلى المبدإ')]}
                correct={0} cols={3} requires={['tartib-adadayn']}
                explain={<MathText>{'الأولى فاصلتها $3$ وترتيبها $-2$ ، والثانية فاصلتها $-2$ وترتيبها $3$ : العددان نفسهما لكنّ الترتيب غيّر المكان.'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <TextbookBox kind="remark" compact text={KNOWLEDGE.order.text} source={KNOWLEDGE.order.source} />}
            </div>
          ),
        },
        {
          num: 6, title: 'نقطة على محور', subtitle: 'إحداثي معدوم', done: q6,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>نقطة على محور الفواصل. ترتيبها:</span>}
                options={[M('معدوم'), M('موجب دائمًا'), M('يساوي فاصلتها')]}
                correct={0} cols={3} requires={['nuqta-ala-muhwar']}
                explain={<MathText>{'على محور الفواصل لا نصعد ولا ننزل: الترتيب $0$ . وفي المقابل نقطة محور التراتيب فاصلتها $0$ .'}</MathText>}
                onAnswered={() => setQ6(true)}
              />
              {q6 && <TextbookBox kind="remark" compact text={KNOWLEDGE.onAxis.text} source={KNOWLEDGE.onAxis.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
