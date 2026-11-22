import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, REMINDER } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `dig-grid`, posé seul `levels={false}`) : le piquet est en (4 ; 2) et l'élève écrit les coordonnées de la jarre, du
 * qandil et de l'assiette. Chaque encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : d'abord
 * « تذكّر — السنة الأولى » (SANS lien : la leçon 1AM n'est pas générée), puis le repère orthonormé, l'abscisse et l'ordonnée, les deux axes, les quatre régions. LP : P1, P2.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const typed = (find) => trials.findLast((e) => e.kind === 'typed' && e.ok && e.find === find);
  const jar = typed('jar');
  const lamp = typed('lamp');
  const plate = typed('plate');
  const inLab = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'm1');
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['ما المعلم المتعامد والمتجانس؟', 'ماذا نسمّي العددين اللذين يحدّدان موضع نقطة؟', 'ما إحداثيا نقطة على أحد المحورين؟', 'كيف نعرف منطقة نقطة من إشارة إحداثيتيها؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المعلم والإحداثيان"
      moduleSubtitle="وتد جديد وأسماء جديدة"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="dig-grid" tasks={LAB.maarif.tasks} levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'ماذا يسمّى هذا المعلم؟', subtitle: 'المعلم المتعامد والمتجانس', done: inLab,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="read" ok={inLab && !!jar && !!lamp && !!plate}
                done={<span>الوتد في مكان جديد: الجرّة <Ltr>{jar?.value}</Ltr> ، قنديل الزيت <Ltr>{lamp?.value}</Ltr> ، الشقفة <Ltr>{plate?.value}</Ltr> .</span>}
                todo="أنجز المهمة في المختبر أعلاه (اكتب إحداثيات ثلاث لقى)، وأجب عن الأسئلة التي تظهر فوقه." />
              {inLab && <TextbookBox kind="remark" title="تذكّر — السنة الأولى" compact text={REMINDER.text} source={REMINDER.source} />}
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.frame.text} source={KNOWLEDGE.frame.source} />}
              {inLab && <KnowledgeBrick id="maalam-mutajanis" lead="لماذا نريد المتر نفسه على الحبلين؟ وماذا نسمّي هذا المعلم؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا نسمّي العددين؟', subtitle: 'الفاصلة والترتيب', done: inLab,
          content: (
            <div className="space-y-3">
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.coordinates.text} source={KNOWLEDGE.coordinates.source} />}
              {inLab && <TextbookBox kind="example" compact text={KNOWLEDGE.coordinates.example} source={KNOWLEDGE.coordinates.source} />}
              {inLab && <KnowledgeBrick id="ihdathiyan-nuqta" lead="ماذا نسمّي العدد الأول والعدد الثاني؟ وكيف نكتب نقطة مع إحداثيتيها؟" requires={['maalam-mutajanis']} />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا نسمّي الحبلين؟', subtitle: 'المحوران', done: inLab,
          content: (
            <div className="space-y-3">
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.axes.text} source={KNOWLEDGE.axes.source} />}
              {inLab && <KnowledgeBrick id="mihwarayn" lead="ما محور الفواصل وما محور التراتيب؟ وماذا عن نقطة عليهما؟" requires={['ihdathiyan-nuqta']} />}
            </div>
          ),
        },
        {
          num: 4, title: 'أين تقع النقطة؟', subtitle: 'المناطق الأربع', done: inLab,
          content: (
            <div className="space-y-3">
              {inLab && <TextbookBox kind="remark" compact text={KNOWLEDGE.regions.text} source={KNOWLEDGE.regions.source} />}
              {inLab && <KnowledgeBrick id="manatiq" lead="كيف نعرف جهة نقطة من إشارة إحداثيتيها؟" requires={['mihwarayn']} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
