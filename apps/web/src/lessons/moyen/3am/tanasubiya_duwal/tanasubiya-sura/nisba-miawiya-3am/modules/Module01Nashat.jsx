import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la صينية المئة. UNE SEULE PISTE (§4quater) : le labo
 * `hundred-grid` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main PEINT t cases d'un plateau de 100. Les questions sur ce que
 * l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche (rollout lot 6, `primitives/LabCheckpoint`, `HundredGrid › chainOf`) : la valeur d'une case,
 * le panier, la relation part/tout, le multiplicateur d'une hausse, le pourquoi de +t % puis −t %. Les étapes ci-dessous en gardent la TRACE (événements
 * `checkpoint`, avec SES essais) puis posent les noms (briques). Le نشاط 2 du manuel est posé en application au module 4.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand SA question l'est (juste, ou la réponse montrée au 3e essai)
  const answered = (q) => trials.some((e) => e.tk === 'checkpoint' && e.q === q && (e.ok || e.revealed));
  const mine = trials.filter((e) => !e.free && e.kind === 'go' && e.ok);
  const cell = mine.findLast((e) => e.tk === 'of') ?? mine.findLast((e) => e.tk === 'rate');
  const rate = mine.findLast((e) => e.tk === 'rate');
  const up = mine.findLast((e) => e.tk === 'change' && e.dir === 'up');
  const chain = mine.findLast((e) => e.tk === 'change' && e.dir === 'down' && e.x === '240');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['ماذا تساوي الخانة الواحدة؟', 'كيف تُحسب حصّة من المخزون؟', 'كيف نجد النسبة من جزء وكلّ؟', 'ماذا تفعل الزيادة بالمئة خانة؟', 'لماذا لا تعيدنا زيادة ثم نقصان إلى البداية؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — الصينية المئة"
      moduleSubtitle="مخزن مقسوم إلى مئة خانة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="hundred-grid" level="beginner" {...LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="hundred-grid" level="advanced" {...LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ماذا تساوي الخانة الواحدة؟', subtitle: 'قيمة الخانة', done: answered('cell'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="cell" ok={answered('cell') && !!cell}
                done={<span>أجبتَ في المختبر: مخزون <Ltr>{cell?.x}</Ltr> كيسًا مقسوم إلى مئة خانة متساوية، فالخانة الواحدة <Ltr>{cell?.packet}</Ltr> كيسًا.</span>}
                todo="أنجز مهمة في الصينية تنقل فيها خانات إلى السلّة، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('cell') && <KnowledgeBrick id="khana-qima" lead="مخزون مقسوم إلى مئة جزء متساوٍ: ماذا يساوي الجزء الواحد؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف نحسب ما تحمله السلّة؟', subtitle: 't خانة', done: answered('basket'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="cell2" ok={answered('basket') && !!cell}
                done={<span>أجبتَ في المختبر: رسمتَ <Ltr>{cell?.painted}</Ltr> خانة فصار في السلّة <Ltr>{cell?.expected}</Ltr> كيسًا، وكلّ خانة <Ltr>{cell?.packet}</Ltr> .</span>}
                todo="أنجز مهمة في الصينية تنقل فيها خانات إلى السلّة، ثم أجب عن سؤال حساب السلّة فوق المختبر." />
              {answered('basket') && <KnowledgeBrick id="hissa-t" lead="t خانة من مئة: كم تحمل السلّة من المخزون؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف نجد النسبة من جزء وكلّ؟', subtitle: 'جزء من كلّ', done: answered('ratio'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="rate" ok={answered('ratio') && !!rate}
                done={<span>أجبتَ في المختبر: ملأتَ سلّة بـ <Ltr>{rate?.expected}</Ltr> كيسًا من مخزون <Ltr>{rate?.x}</Ltr> برسم <Ltr>{rate?.painted}</Ltr> خانة، فالنسبة <Ltr>{rate?.painted}%</Ltr> .</span>}
                todo="أنجز مهمة «املأ السلّة بالضبط» في الصينية، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 4, title: 'ماذا تفعل الزيادة بالمئة خانة؟', subtitle: 'زيادة بنسبة مئوية', done: answered('factor'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="up" ok={answered('factor') && !!up}
                done={<span>أجبتَ في المختبر: زاد مخزون <Ltr>{up?.x}</Ltr> بـ <Ltr>{up?.t}%</Ltr> فصار <Ltr>{up?.expected}</Ltr> كيسًا.</span>}
                todo="أنجز مهمة الزيادة بنسبة مئوية في الصينية، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('factor') && <KnowledgeBrick id="ziyada-nuqsan" lead="مخزون يزيد أو ينقص بنسبة مئوية: بأيّ عدد نضربه؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'لماذا لا نعود إلى البداية؟', subtitle: 'زيادة ثم نقصان', done: answered('back'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="chain" ok={answered('back') && !!chain}
                done={<span>أجبتَ في المختبر: بعد زيادة بـ 20% صار المخزون <Ltr>{chain?.x}</Ltr> ثم نقص بـ <Ltr>{chain?.t}%</Ltr> فصار <Ltr>{chain?.expected}</Ltr> لا 200 .</span>}
                todo="جرّب المستوى المتقدّم لترى زيادة بـ 20% ثم تخفيضها بـ 20% ، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
