import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { desc } from '../content/exercises';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le « مقصّ السلسلة ». UNE SEULE PISTE (§4quater) : le labo `chain-cutter` en haut, sans carte
 * au-dessus — il porte son contexte (la سبّورة فلّين, Yasmine au téléphone) et SA question ; la main CHOISIT où couper le ruban, l'agrafe (et la valeur du ruban) juge. Les questions sur ce que
 * l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`, chaînes `ChainCutter › cp`) et retiennent la tâche suivante ; les étapes ci-dessous en gardent la
 * TRACE (événements `checkpoint-done`) puis posent les noms (briques) : c1 → `akhir-amaliya`, c4 → `hudud-awamil`, c5 → `wasf-jumla`, c6 → pas de brique (le contraste « même valeur »). Le
 * نشاط 5 du manuel (souligner la dernière opération puis coller des étiquettes) est posé en application au module 4.
 * Événements lus : `{ tk: 'refused', task, reason }` et `{ tk: 'checkpoint-done', id }` ; les essais libres (`free`) ne comptent pas.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const first = (id, tk) => trials.find((e) => !e.free && e.tk === tk && e.task === id);
  const c1Refused = first('c1', 'refused');
  const c4Refused = first('c4', 'refused');
  const c6Refused = first('c6', 'refused');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['أكتشف كيف أسمّي سلسلة عمليات', 'ماذا أسمّي كلّ قطعة من السلسلة؟', 'كيف أصف سلسلة بجملة كاملة؟', 'لماذا لا يكفي أن تكون القيمة نفسها؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مقصّ السلسلة"
      moduleSubtitle="قصّ الشريط حيث تُحسب القطعتان وحدهما ثم سمِّه"
      estimatedTime="15 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="chain-cutter" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="chain-cutter" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'شريط على سبّورة القسم', subtitle: 'عند أيّ عملية ينجح القصّ؟', done: answered('c1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="c1" ok={answered('c1')}
                done={c1Refused
                  ? <span>القصّ عند الضرب أعطى <Ltr>11 × 5 = 55</Ltr> لا <Ltr>27</Ltr> لأنّ <Ltr>4 × 5</Ltr> أُنجز أوّلًا؛ ونجح القصّ عند الجمع: <Ltr>7 + 20 = 27</Ltr> .</span>
                  : <span>قصصتَ عند الجمع من المحاولة الأولى: <Ltr>7</Ltr> و <Ltr>4 × 5</Ltr> تعطيان <Ltr>27</Ltr> ، قيمة الشريط.</span>}
                todo="أنجز المهمة الأولى في مقصّ السلسلة، وأجب عن الأسئلة التي تظهر فوق المختبر بعد القصّ." />
              {answered('c1') && <KnowledgeBrick id="akhir-amaliya" lead="ما العملية التي تسمّي السلسلة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'قطعتان بجيبين', subtitle: 'ماذا نسمّي كلّ قطعة؟', done: answered('c4'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="c4" ok={answered('c4')}
                done={c4Refused
                  ? <span>القصّ عند الجمع في <Ltr>(18 + 6) ÷ 3</Ltr> رُفض (وجدتَ <Ltr>20</Ltr> لا <Ltr>8</Ltr>)؛ وعند القسمة نجح: <Ltr>18 + 6</Ltr> هي المقسوم و <Ltr>3</Ltr> هي القاسم.</span>
                  : <span>قصصتَ عند القسمة: <Ltr>18 + 6</Ltr> هي المقسوم و <Ltr>3</Ltr> هي القاسم، وحاصل القسمة <Ltr>8</Ltr> .</span>}
                todo="أنجز المهمة الرابعة (الشريط (18 + 6) ÷ 3)، وأجب عن أسئلتها فوق المختبر." />
              {answered('c4') && <KnowledgeBrick id="hudud-awamil" lead="ماذا نسمّي قطعتي السلسلة؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'نقصّ القطعة أيضًا', subtitle: 'حتى نصل إلى الأعداد', done: answered('c5'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="c5" ok={answered('c5')}
                done={<span>بقصّ القطع حتى الأعداد كتبتَ الجملة كاملة: {desc('6 × (9 − 2) + 5')} .</span>}
                todo="أنجز المهمة الخامسة (ثلاث قصّات)، وأجب عن أسئلتها فوق المختبر." />
              {answered('c5') && <KnowledgeBrick id="wasf-jumla" lead="كيف نصف السلسلة بجملة كاملة؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'قيمة واحدة وقصّتان', subtitle: 'هل تكفي القيمة نفسها؟', done: answered('c6'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="c6" ok={answered('c6')}
                done={c6Refused
                  ? <span>في <Ltr>20 + 5 − 3</Ltr> رُفض القصّ عند الجمع مع أنّ <Ltr>20 + (5 − 3)</Ltr> تساوي <Ltr>22</Ltr> أيضًا: <Ltr>20 + 5</Ltr> حُسبت أوّلًا، فآخر عملية هي الطرح.</span>
                  : <span>قصصتَ عند الطرح من المحاولة الأولى: <Ltr>20 + 5</Ltr> حُسبت أوّلًا وآخر عملية هي الطرح.</span>}
                todo="أنجز المهمة السادسة (20 + 5 − 3)، وأجب عن أسئلتها فوق المختبر." />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
