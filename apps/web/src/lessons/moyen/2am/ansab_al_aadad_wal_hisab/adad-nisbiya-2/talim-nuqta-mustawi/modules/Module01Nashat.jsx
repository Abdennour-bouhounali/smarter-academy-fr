import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la « شبكة الحفرية ». UNE SEULE PISTE (§4quater) : le labo `dig-grid` en haut,
 * sans carte au-dessus — il porte son contexte et SA question ; la main tient le PIQUET d'origine à مبتدئ (un glissement 2D), puis un POINT écrit ou touché à متقدم.
 *   مبتدئ — d1 la jarre à (2 ; 1) ; d2 le qandil à (−3 ; 2) ; d3 deux relevés, un seul piquet ; d4 un carnet impossible (nombres échangés) ;
 *   متقدم — p1 prédire trois relevés (une perle sur la corde verte), p2 poser une bague et une pointe entre deux ficelles, p3 la place miroir de la pièce.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES essais. Les noms (briques) viennent APRÈS la réponse. Le نشاط 1 (c) du manuel (lire des points sur un repère donné) est
 * posé en application au module 4. Prototype (2026-10-28) : les questions sont posées PAR-DESSUS le labo après chaque tâche (`DigGrid › CHAINS`) ; les étapes en gardent la TRACE
 * (`checkpoint-done` des tâches d1 … p3) puis posent les noms.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const solvedStake = (task) => trials.findLast((e) => e.kind === 'stake' && e.ok === true && e.task === task);
  const swap = trials.findLast((e) => e.kind === 'stake' && e.model === 'swap');
  const none = trials.findLast((e) => e.kind === 'none' && e.ok === true);
  const bead = trials.findLast((e) => e.kind === 'typed' && e.ok && e.find === 'bead');
  const tap = trials.findLast((e) => e.kind === 'tap' && e.ok && e.target === 'ring');
  const mirror = trials.findLast((e) => e.kind === 'typed' && e.ok && e.find === 'coin' && e.task === 2);
  const q = Object.fromEntries(['d1', 'd2', 'd3', 'd4', 'p1', 'p2', 'p3'].map((id) => [id, answered(id)]));

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف نسجّل موضع لقية بعددين؟', 'ماذا يحدث لإحداثيي لقية إذا نقلنا الوتد؟', 'هل يهمّ ترتيب العددين؟', 'ما إحداثيا نقطة على أحد المحورين، وما نظيرة نقطة بالنسبة إلى محور؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — شبكة الحفرية"
      moduleSubtitle="وتد المبدأ وإحداثيا لقية"
      estimatedTime="16 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="dig-grid" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="dig-grid" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كيف سجّلنا موضع الجرّة؟', subtitle: 'عددان: الأزرق ثم الأخضر', done: q.d1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="read" ok={q.d1 && !!solvedStake(0)}
                done={<span>وضعتَ الوتد فصارت الجرّة عند <Ltr>(2 ; 1)</Ltr> : مترين شرقًا على الحبل الأزرق ثم متر شمالًا على الأخضر.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الأولى (اسحب الوتد)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.d1 && <KnowledgeBrick id="ihdathiyan" lead="كيف نكتب موضع لقية بعددين؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا تغيّر ما في الدفتر؟', subtitle: 'نقل الوتد', done: q.d2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="move" ok={q.d2 && !!solvedStake(1)}
                done={<span>قنديل الزيت لم يتحرّك، لكنّ إحداثيّيه صارا <Ltr>(−3 ; 2)</Ltr> لمّا غُرس الوتد في موضع آخر.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الثانية (قنديل الزيت)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.d2 && <KnowledgeBrick id="ihdathiyat-mabda" lead="ماذا تفعل إحداثيات لقية إذا انتقل الوتد؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل يوجد وتد آخر؟', subtitle: 'سجلّان ووتد واحد', done: q.d3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="two" ok={q.d3 && !!solvedStake(2)}
                done={<span>وتد واحد جعل الجرّة عند <Ltr>(2 ; 1)</Ltr> والشقفة عند <Ltr>(−1 ; −2)</Ltr> معًا.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الثالثة (سجلّان معًا)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 4, title: 'هل يهمّ الترتيب؟', subtitle: 'عددان مبدّلان', done: q.d4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="order" ok={q.d4 && (!!none || !!swap)}
                done={<span>لم تجد وتدًا يحقّق السجلّين، وضغطتَ «لا يوجد موضع» ؛ لأنّ <Ltr>(2 ; 1)</Ltr> و <Ltr>(1 ; 2)</Ltr> ليسا المكان نفسه.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الرابعة (سجلّ مستحيل)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.d4 && <KnowledgeBrick id="tartib-ihdathiyayn" lead="هل يمكن أن نبدّل العددين؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'أين الخرزة؟', subtitle: 'نقطة على الحبل الأخضر', done: q.p1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="axis" ok={q.p1 && !!bead}
                done={<span>كتبتَ إحداثيي الخرزة <Ltr>{bead?.value}</Ltr> : هي على الحبل الأخضر، فلا بُعد أفقي عن الوتد.</span>}
                todo="أنجز في المستوى المتقدّم المهمّة الأولى (توقّع الإحداثيات)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.p1 && <KnowledgeBrick id="nuqta-ala-mihwar" lead="ما إحداثيا لقية على أحد الحبلين؟" />}
            </div>
          ),
        },
        {
          num: 6, title: 'لقية بين خيطين', subtitle: 'نصف المتر', done: q.p2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="half" ok={q.p2 && !!tap}
                done={<span>وضعتَ الخاتم عند <Ltr>(2,5 ; −1,5)</Ltr> بين الخيطين: نصف متر شرق الخيط الثاني ونصف متر جنوب الأول.</span>}
                todo="أنجز في المستوى المتقدّم المهمّة الثانية (المس موضع الخاتم)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 7, title: 'ما المكان المقابل؟', subtitle: 'عبر الحبل الأزرق', done: q.p3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="mirror" ok={q.p3 && !!mirror}
                done={<span>مكان القطعة المقابل عبر الحبل الأزرق هو <Ltr>{mirror?.value}</Ltr> : الفاصلة نفسها وترتيب معاكس.</span>}
                todo="أنجز في المستوى المتقدّم المهمّة الثالثة (المكان المقابل)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.p3 && <KnowledgeBrick id="nadhira-mihwar" lead="ماذا يتغيّر في إحداثيي نقطة ومكانها المقابل عبر محور؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
