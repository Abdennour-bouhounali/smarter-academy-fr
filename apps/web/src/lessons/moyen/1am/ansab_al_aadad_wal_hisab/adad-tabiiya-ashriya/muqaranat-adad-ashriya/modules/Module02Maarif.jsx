import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de trouver sur la piste (question → encadré → brique), avec les mots de la
 * plateforme (guide §4ter-bis) : la partie entière qui décide (P1), les chiffres rang par rang (P1), les zéros qu'on ajoute pour comparer deux
 * entiers (P2), les symboles < et > (P3), croissant et décroissant (P3). LP : P1–P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  return (
    <ContentModule
      objectives={['متى يحسم الجزء الصحيح؟', 'كيف نقارن رتبةً برتبة؟', 'كيف نكتب النتيجة ونرتّب سلسلة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المقارنة والترتيب"
      moduleSubtitle="الجزء الصحيح · رتبةً برتبة · الأصفار · الرمزان · الترتيب"
      estimatedTime="9 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما وجدته على المسطرة', tone: 'violet',
        body: <p>ما فعلتَه بالقفزات نكتبه الآن بالأسماء. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'متى يحسم الجزء الصحيح؟', subtitle: '9,99 و 10,01', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أيّ العددين أكبر: <bdi dir="ltr">9,99</bdi> أم <bdi dir="ltr">10,01</bdi> ؟</span>}
                options={[M('$10{,}01$'), M('$9{,}99$'), M('متساويان')]}
                correct={0} cols={3} requires={['taqarun-rutab']}
                explain={<MathText>{'$9<10$ : وكل ما بعد الفاصلة أقل من وحدة واحدة، فلا يستطيع أن يعوّض الفرق بين الجزأين الصحيحين.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="property" compact text={KNOWLEDGE.wholeParts.text} source={KNOWLEDGE.wholeParts.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'وإذا تساوى الجزآن الصحيحان؟', subtitle: '18,47 و 18,5', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>قارن بين <bdi dir="ltr">18,47</bdi> و <bdi dir="ltr">18,5</bdi> :</span>}
                options={[M('$18{,}47<18{,}5$'), M('$18{,}47>18{,}5$'), M('$18{,}47=18{,}5$')]}
                correct={0} cols={1} requires={['taqarun-rutab']}
                explain={<MathText>{'الجزآن الصحيحان متساويان (18)؛ رقم الأعشار 4 أقل من 5، فيحسم: $18{,}47<18{,}5$ . ولا ننظر إلى 47 و 5 كأنّهما عددان طبيعيان.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="property" compact text={KNOWLEDGE.rankByRank.text} source={KNOWLEDGE.rankByRank.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف نتمّ بالأصفار؟', subtitle: '5,37 و 5,359', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>لنقارن <bdi dir="ltr">5,37</bdi> و <bdi dir="ltr">5,359</bdi> بالقطع نفسها (ثلاثة أرقام بعد الفاصلة)، أيّ كتابة تتمّ <bdi dir="ltr">5,37</bdi> دون أن يتغيّر؟</span>}
                options={[M('$5{,}370$'), M('$5{,}037$'), M('$5{,}307$')]}
                correct={0} cols={3} requires={['itmam-asfar']}
                explain={<MathText>{'نضيف الصفر في آخر الجزء العشري فقط: $5{,}37=5{,}370$ ، ثم 370 جزءًا من ألف أكثر من 359 جزءًا: $5{,}37>5{,}359$ . أمّا $5{,}037$ و $5{,}307$ فعددان آخران.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="property" compact text={KNOWLEDGE.zeros.text} source={KNOWLEDGE.zeros.source} />}
              {q3 && <TextbookBox kind="remark" compact text={KNOWLEDGE.trap.text} source={KNOWLEDGE.trap.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'كيف نكتب النتيجة؟', subtitle: 'الرمزان < و >', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أيّ كتابة صحيحة؟</span>}
                options={[M('$3{,}05<3{,}5$'), M('$3{,}05>3{,}5$'), M('$3{,}05=3{,}5$')]}
                correct={0} cols={1} requires={['itmam-asfar']}
                explain={<MathText>{'رقم أعشار $3{,}05$ هو 0 وأعشار $3{,}5$ هو 5، فالأول أصغر. الرمز $<$ يفتح نحو العدد الأكبر.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="ramz-muqarana" compact />}
              {q4 && <TextbookBox kind="definition" compact text={KNOWLEDGE.symbols.definition} source={KNOWLEDGE.symbols.source} />}
            </div>
          ),
        },
        {
          num: 5, title: 'تصاعدي أم تنازلي؟', subtitle: '2,4 و 2,04 و 2,45', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>رتّب تصاعديًا (من الأصغر إلى الأكبر): <bdi dir="ltr">2,4</bdi> ، <bdi dir="ltr">2,04</bdi> ، <bdi dir="ltr">2,45</bdi> .</span>}
                options={[M('$2{,}04<2{,}4<2{,}45$'), M('$2{,}45<2{,}4<2{,}04$'), M('$2{,}4<2{,}04<2{,}45$')]}
                correct={0} cols={1} requires={['ramz-muqarana', 'tartib-silsila']}
                explain={<MathText>{'الأعشار 0 و 4 و 4 ، فالأصغر $2{,}04$ ؛ ويفصل بين $2{,}4=2{,}40$ و $2{,}45$ رقم الأجزاء من مائة: $0<5$ . والترتيب التنازلي يعكس هذا.'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <TextbookBox kind="definition" compact lines={[KNOWLEDGE.order.text, KNOWLEDGE.order.how]} source={KNOWLEDGE.order.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
