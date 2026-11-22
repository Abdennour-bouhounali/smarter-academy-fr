import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de faire sur la route (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) :
 * la droite graduée (origine, sens, unité), les deux côtés de l'origine, l'abscisse d'un point, les points symétriques, l'encadrement entre deux ticks, l'origine retrouvée. LP : P1–P3.
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
      objectives={['ماذا نختار لندرّج مستقيمًا؟', 'ما فاصلة نقطة وما النقطتان المتناظرتان؟', 'كيف نقرأ فاصلة نقطة بين علامتين وكيف نجد المبدأ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المستقيم المدرّج"
      moduleSubtitle="المبدأ · الاتجاه · الوحدة · الفاصلة"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما فعلتَه على الطريق', tone: 'violet',
        body: <p>ما فعلتَه بالعصا والبيوت نكتبه الآن بالأسماء. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'ماذا نختار؟', subtitle: 'المبدأ والاتجاه والوحدة', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>لندرّج مستقيمًا نختار عليه:</span>}
                options={[M('نقطة المبدإ، واتجاهًا، ووحدة لقياس الأطوال'), M('نقطة المبدإ فقط'), M('وحدة الطول فقط')]}
                correct={0} cols={1} requires={['tadrij-jihatayn']}
                explain={<MathText>{'المبدأ يقول من أين نبدأ، والاتجاه يقول أيّ جهة تأخذ الأعداد الموجبة، والوحدة تقول كم تساوي الخطوة.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.line.definition} source={KNOWLEDGE.line.source} />}
              {q1 && <KnowledgeBrick id="mustaqim-mudarraj" compact />}
            </div>
          ),
        },
        {
          num: 2, title: 'من جهتي المبدإ', subtitle: 'موجب وسالب', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>في الجهة المقابلة لاتجاه الأعداد الموجبة تظهر أعداد:</span>}
                options={[M('سالبة، تسبقها الإشارة −'), M('موجبة بلا إشارة'), M('لا تظهر فيها أعداد')]}
                correct={0} cols={1} requires={['tadrij-jihatayn']}
                explain={<MathText>{'ننقل الوحدة نفسها إلى الجهتين: في جهة الاتجاه أعداد موجبة وفي الجهة الأخرى أعداد سالبة.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="property" compact text={KNOWLEDGE.bothSides.text} source={KNOWLEDGE.bothSides.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'فاصلة نقطة', subtitle: 'البعد وإشارة الجهة', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'نقطة تقع في الجهة السالبة وتبعد عن المبدإ $3{,}5$ وحدات. فاصلتها:'}</MathText>}
                options={[M('$-3{,}5$'), M('$3{,}5$'), M('$-3$')]}
                correct={0} cols={3} requires={['fasila-nuqta']}
                explain={<MathText>{'الفاصلة هي البعد عن المبدإ مسبوقًا بإشارة الجهة: البعد $3{,}5$ والإشارة − ، أي $-3{,}5$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="definition" compact text={KNOWLEDGE.abscissa.definition} source={KNOWLEDGE.abscissa.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'نقطتان متناظرتان', subtitle: 'فاصلتان متعاكستان', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'فاصلة نقطة $-5$ . نظيرتها بالنسبة إلى المبدإ فاصلتها:'}</MathText>}
                options={[M('$5$'), M('$-5$'), M('$0$')]}
                correct={0} cols={3} requires={['nuqtatan-mutanazirtan']}
                explain={<MathText>{'النظيرة على الجهة الأخرى من المبدإ وبالبعد نفسه: فاصلتها العدد المعاكس $5$ .'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <TextbookBox kind="property" compact text={KNOWLEDGE.symmetric.text} source={KNOWLEDGE.symmetric.source} />}
            </div>
          ),
        },
        {
          num: 5, title: 'بين علامتين', subtitle: 'الحصر', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'نقطة تقع بين العلامتين $-3$ و $-2$ . فاصلتها $x$ تحقّق:'}</MathText>}
                options={[M('$-3<x<-2$'), M('$2<x<3$'), M('$-2<x<-1$')]}
                correct={0} cols={3} requires={['hasr-fasila']}
                explain={<MathText>{'العلامة الأصغر على اليسار (الأبعد عن المبدإ في الجهة السالبة): $-3<x<-2$ .'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <TextbookBox kind="remark" compact text={KNOWLEDGE.bounds.text} source={KNOWLEDGE.bounds.source} />}
            </div>
          ),
        },
        {
          num: 6, title: 'حين يُمحى المبدأ', subtitle: 'علامتان مكتوبتان', done: q6,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'علامتان مكتوبتان $-6$ و $-2$ وبينهما أربع تباعدات متساوية. قيمة التباعد الواحد:'}</MathText>}
                options={[M('$1$'), M('$4$'), M('$2$')]}
                correct={0} cols={3} requires={['fasila-nuqta']}
                explain={<MathText>{'الفرق بين العلامتين $4$ موزّع على أربع تباعدات: كلّ تباعد $4\\div 4=1$ ، ثمّ نعدّ التباعدات حتى الصفر.'}</MathText>}
                onAnswered={() => setQ6(true)}
              />
              {q6 && <TextbookBox kind="remark" compact text={KNOWLEDGE.origin.text} source={KNOWLEDGE.origin.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
