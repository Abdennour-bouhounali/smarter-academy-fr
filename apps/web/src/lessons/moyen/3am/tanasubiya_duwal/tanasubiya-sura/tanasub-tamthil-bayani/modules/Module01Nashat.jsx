import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « سكك الدبابيس ». UNE SEULE PISTE (§4quater) : le labo `pin-rails` en haut, sans
 * carte au-dessus — il porte son contexte et SA question ; la main LÈVE des punaises sur leurs rainures et POSE une règle sur deux nœuds. Les questions sur ce que l'élève a FAIT sont
 * posées PAR-DESSUS le labo après chaque tâche (rollout lot 6, `primitives/LabCheckpoint`, `PinRails › chainOf`) : l'écriture d'un point, ce que touche la règle par O, pourquoi une règle
 * qui touche les quatre punaises mais laisse O dehors ne dit pas « تناسبية », pourquoi aucune règle ne touche tout quand le prix change, ce que vaut l'ordonnée de l'abscisse 1. Les étapes
 * ci-dessous en gardent la TRACE (événements `checkpoint`, avec SES essais) puis posent les noms (briques). Le نشاط 1 du manuel est posé en application au module 4.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand SA question l'est (juste, ou la réponse montrée au 3e essai)
  const answered = (q) => trials.some((e) => e.tk === 'checkpoint' && e.q === q && (e.ok || e.revealed));
  const mine = trials.filter((e) => !e.free);
  const pin = mine.findLast((e) => e.kind === 'pin' && e.ok);
  const full = mine.findLast((e) => e.kind === 'rod' && e.full && e.shape === 'prop');
  const aligned = mine.findLast((e) => e.kind === 'rod' && e.pinsHit && !e.throughO);
  const bent = mine.findLast((e) => e.kind === 'rod' && e.shape === 'bent' && !e.full);
  const read = mine.findLast((e) => e.kind === 'read' && e.ok);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف أكتب نقطة عمود من الجدول؟', 'ماذا تمسّ المسطرة في وضعية تناسبية؟', 'ماذا يمنع وضعية من أن تكون تناسبية؟', 'ماذا يقول ترتيب الفاصلة 1؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — سكك الدبابيس"
      moduleSubtitle="أثمان تصير نقطًا في معلم"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="pin-rails" level="beginner" {...LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="pin-rails" level="advanced" {...LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ما إحداثيا نقطة الدبّوس؟', subtitle: 'كتابة النقطة', done: answered('point'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="pin" ok={answered('point') && !!pin}
                done={<span>أجبتَ في المختبر: رفعتَ دبّوس العمود <Ltr>{pin?.x}</Ltr> علب إلى <Ltr>{pin?.y}</Ltr> دج، فهو النقطة <Ltr>({pin?.x} ; {pin?.y})</Ltr> .</span>}
                todo="ارفع الدبابيس إلى أثمان أعمدتها في المحلّ الأول، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('point') && <KnowledgeBrick id="nuqta-jadwal" lead="عمود في جدول: كيف يصير نقطة في معلم، وكيف نكتب إحداثيها؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا تمسّ المسطرة في المحلّ الأول؟', subtitle: 'النقط التي تمسّها', done: answered('touch'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="full" ok={answered('touch') && !!full}
                done={<span>أجبتَ في المختبر: لمست المسطرة <Ltr>{full?.count}{'\u00A0/\u00A0'}{full?.total}</Ltr> نقط، ومنها <Ltr>O</Ltr> .</span>}
                todo="ضع المسطرة على O وعلى دبّوس في المحلّ الأول، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('touch') && <KnowledgeBrick id="khassiya-tanasub" lead="ثمن ثابت للعلبة: أين تقع نقط الأثمان في المعلم؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل تكفي الاستقامة؟', subtitle: 'مستقيم لا يمرّ بـ O', done: answered('prop'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="aligned" ok={answered('prop') && !!aligned}
                done={<span>أجبتَ في المختبر: مسّت المسطرة الدبابيس الأربعة لكنّها تقطع المحور العمودي عند <Ltr>{aligned?.cuts}</Ltr> لا عند <Ltr>0</Ltr> ، فالوضعية ليست تناسبية.</span>}
                todo="في المحلّ الثاني ضع المسطرة على دبّوسين حتى تمسّ الدبابيس الأربعة، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 4, title: 'لماذا لا توجد مسطرة تمسّ الكلّ؟', subtitle: 'نقط ليست على استقامة', done: answered('shape'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="bent" ok={answered('shape') && !!bent}
                done={<span>أجبتَ في المختبر: لم تمسّ المسطرة إلا <Ltr>{bent?.count}{'\u00A0/\u00A0'}{bent?.total}</Ltr> نقط، فالنقط ليست على استقامة.</span>}
                todo="في المحلّ الثالث جرّب أوضاعًا مختلفة للمسطرة، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('shape') && <KnowledgeBrick id="ghayr-tanasubi" lead="نقط على مستقيم لا يمرّ بالمبدأ أو ليست على استقامة: هل هي وضعية تناسبية؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'ماذا يقول ترتيب الفاصلة 1؟', subtitle: 'معامل التناسبية', done: answered('sense'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="read" ok={answered('sense') && !!read}
                done={<span>أجبتَ في المختبر: وقع دبّوس القراءة عند <Ltr>({read?.x} ; {read?.y})</Ltr> وقسمة <Ltr>{read?.y}</Ltr> على <Ltr>{read?.x}</Ltr> تعطي <Ltr>{read?.a}</Ltr> .</span>}
                todo="جرّب المستوى المتقدّم: ضع دبّوس القراءة على المسطرة عند 1، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('sense') && <KnowledgeBrick id="muamil-qiraa" lead="ترتيب النقطة التي فاصلتها 1 على مستقيم تناسبية: ماذا يساوي؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
