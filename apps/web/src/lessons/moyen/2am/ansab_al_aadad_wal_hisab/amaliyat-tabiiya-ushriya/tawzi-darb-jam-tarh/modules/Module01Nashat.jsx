import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la « ورشة الحقائب التضامنية ». UNE SEULE PISTE (§4quater) : le labo `kit-packer` en haut, sans carte
 * au-dessus — il porte son contexte (l'atelier du نادي التضامن, Fatima et Ali) et SA question ; la main RÈGLE ce que chaque distributeur sort, le cartable (et les deux compteurs) juge. Les questions sur ce que
 * l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`, chaînes `KitPacker › cp`) et retiennent la tâche suivante ; les étapes ci-dessous en gardent la TRACE
 * (événements `checkpoint-done`) puis posent les noms (briques) : k2 → `tawzi-jam` (après « أتوقّع القاعدة »), k3 → `tawzi-tarh`, k4 → `tahlil`, k1 → pas de brique (les deux compteurs d'abord). Le نشاط 6 du
 * manuel (deux rectangles aux expressions données) est posé en application au module 4.
 * Événements lus : `{ tk: 'refused', task, reason }` et `{ tk: 'checkpoint-done', id }` ; les essais libres (`free`) ne comptent pas.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const first = (id, tk) => trials.find((e) => !e.free && e.tk === tk && e.task === id);
  const k1Refused = first('k1', 'refused');
  const k3Refused = first('k3', 'refused');
  const k4Refused = first('k4', 'refused');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['أكتشف لماذا ضرب عدد في مجموع يساوي مجموع جداءين', 'ماذا يحدث في الفرق؟', 'كيف أحوّل مجموع جداءين إلى جداء واحد؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — ورشة الحقائب التضامنية"
      moduleSubtitle="اضبط الموزّعين حتى تجهز الحقائب كلّها"
      estimatedTime="15 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="kit-packer" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="kit-packer" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'حقيبة بحقيبة وصنفًا بصنف', subtitle: 'ما الذي يجب أن يخرج من كلّ موزّع؟', done: answered('k1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="k1" ok={answered('k1')}
                done={k1Refused
                  ? <span>لم تجهز الحقائب بما أخرجتَه أوّلًا، ثم أخرجتَ <Ltr>6 × 3 = 18</Ltr> كرّاسًا و <Ltr>6 × 2 = 12</Ltr> قلمًا: العدّادان معًا <Ltr>30</Ltr> .</span>
                  : <span>أخرجتَ <Ltr>6 × 3 = 18</Ltr> كرّاسًا و <Ltr>6 × 2 = 12</Ltr> قلمًا من المحاولة الأولى: العدّادان معًا <Ltr>30</Ltr> .</span>}
                todo="أنجز المهمة الأولى في الورشة، وأجب عن الأسئلة التي تظهر فوق المختبر بعد التوزيع." />
            </div>
          ),
        },
        {
          num: 2, title: 'حقائب أخرى', subtitle: 'هل تتكرّر القاعدة؟', done: answered('k2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="k2" ok={answered('k2')}
                done={<span>للحقائب الثماني: <Ltr>8 × 4 = 32</Ltr> كرّاسًا و <Ltr>8 × 5 = 40</Ltr> قلمًا، والمجموع <Ltr>72 = 8 × (4 + 5)</Ltr> .</span>}
                todo="أنجز المهمة الثانية (8 حقائب)، وأجب عن أسئلتها فوق المختبر." />
              {answered('k2') && <KnowledgeBrick id="tawzi-jam" lead="كيف نضرب عددًا في مجموع؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كراريس تالفة', subtitle: 'وماذا عن الفرق؟', done: answered('k3'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="k3" ok={answered('k3')}
                done={k3Refused
                  ? <span>رمي كرّاسين فقط لم يجهّز الحقائب؛ ثم رميتَ <Ltr>7 × 2 = 14</Ltr> تالفًا: <Ltr>70 − 14 = 56 = 7 × (10 − 2)</Ltr> .</span>
                  : <span>من الحزم السبع <Ltr>7 × 10 = 70</Ltr> رميتَ <Ltr>7 × 2 = 14</Ltr> تالفًا: <Ltr>70 − 14 = 56 = 7 × (10 − 2)</Ltr> .</span>}
                todo="أنجز المهمة الثالثة (7 حقائب وكراريس تالفة)، وأجب عن أسئلتها فوق المختبر." />
              {answered('k3') && <KnowledgeBrick id="tawzi-tarh" lead="وإذا كان بين القوسين فرق؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'الموزّعان مقفلان', subtitle: 'كم حقيبة؟', done: answered('k4'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="k4" ok={answered('k4')}
                done={k4Refused
                  ? <span>بعدد آخر من الحقائب لم تتساوَ الأنصبة؛ وبـ <Ltr>12</Ltr> حقيبة: <Ltr>12 × 5 + 12 × 3 = 12 × (5 + 3) = 96</Ltr> .</span>
                  : <span>اخترتَ <Ltr>12</Ltr> حقيبة من المحاولة الأولى: <Ltr>12 × 5 + 12 × 3 = 12 × (5 + 3) = 96</Ltr> .</span>}
                todo="أنجز المهمة الرابعة (موزّعان مقفلان)، وأجب عن أسئلتها فوق المختبر." />
              {answered('k4') && <KnowledgeBrick id="tahlil" lead="وإذا قرأنا المساواة بالعكس؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
