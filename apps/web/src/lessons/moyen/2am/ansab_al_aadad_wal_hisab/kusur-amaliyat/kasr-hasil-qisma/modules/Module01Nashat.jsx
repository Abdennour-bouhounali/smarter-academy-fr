import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « حبال المرسى ». UNE SEULE PISTE (§4quater) : le labo `mooring-lines` en haut, sans carte au-dessus — il porte
 * son contexte et SA question ; la main tient le QUOTIENT candidat (une longueur de corde à مبتدئ, un nombre de cordes à متقدم) et pose les morceaux bout à bout. Les questions sur ce que l'élève a FAIT
 * (le reste après chaque rang, pourquoi la division finit sur 2,25, la nature de 3,16, pourquoi le nombre de cordes ne change pas avec l'unité) sont posées PAR-DESSUS le labo après chaque tâche
 * (`primitives/LabCheckpoint`, chaînes `MooringLines › CHAINS`) ; les étapes ci-dessous en gardent la TRACE (événements `checkpoint` du labo) puis posent les noms (briques). Si l'enseignant a coupé les
 * questions pour son compte, une étape se valide dès que l'essai existe. LP : P2, P4 (P3 au niveau متقدم).
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module01Nashat() {
  const [tb, setTb] = useState([]);
  const [ta, setTa] = useState([]);
  const cpOn = useLabCheckpointSettings('mooring-lines').enabled;
  const rec = (set) => (e) => set((list) => [...list, e]);
  const all = [...tb, ...ta];
  const brk = (list, task, rank) => list.findLast((e) => e.kind === 'bracket' && !e.free && e.task === task && e.rank === rank);
  const b1 = brk(tb, 0, 1); const b2 = brk(tb, 0, 2); const ex = tb.findLast((e) => e.kind === 'lay' && !e.free && e.task === 1 && e.verdict === 'exact');
  const r3 = brk(tb, 2, 2); const a1 = brk(ta, 0, 2);
  // une étape est faite quand SA question est répondue (ou, questions coupées par l'enseignant, quand l'essai existe)
  const answered = (taskId, qid, evidence) => all.some((e) => e.tk === 'checkpoint' && e.id === taskId && e.q === qid && (e.ok || e.revealed)) || (!cpOn && !!evidence);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );
  const m = (s) => <MathText>{s}</MathText>;

  return (
    <ContentModule
      objectives={['لماذا لا تنتهي بعض القسمات؟', 'كيف أحصر حاصل القسمة بدقّة أكبر فأكبر؟', 'متى يكون الحاصل عدديًا عشريًا؟', 'ماذا يتغيّر وماذا يبقى حين نغيّر الوحدة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — حبال المرسى"
      moduleSubtitle="هل يكفي الحبل؟ ثم دقّق الرتبة"
      estimatedTime="16 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="mooring-lines" level="beginner" onTrial={rec(setTb)} />,
            advanced: () => <Manipulation type="mooring-lines" level="advanced" onTrial={rec(setTa)} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا لم يبلغ الباقي 0؟', subtitle: 'الحبل الأوّل', done: answered('r1', 'never', b2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="r1" ok={!!b2 && answered('r1', 'never', b2)}
                done={m(`وجدتَ في المهمة 1 أنّ $${b1?.lo?.replace(',', '{,}')}$ تكفي و $${b1?.hi?.replace(',', '{,}')}$ لا تكفي، ثم $${b2?.lo?.replace(',', '{,}')}$ و $${b2?.hi?.replace(',', '{,}')}$ : الباقي يصغر ولا ينعدم.`)}
                todo="أنجز المهمة 1 (8 m في 3 قطع) حتى السنتيمتر، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('r1', 'never', b2) && <KnowledgeBrick id="qima-madbuta" lead="إن لم تنتهِ القسمة، فما العدد الذي يساوي حاصلها بالضبط؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ولماذا انتهت القسمة هنا؟', subtitle: 'الحبل الثاني', done: answered('r2', 'whyEnd', ex),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="r2" ok={!!ex && answered('r2', 'whyEnd', ex)}
                done={<span>في المهمة 2 وقعت آخر قطعة على طرف الحبل عند <Ltr>{ex?.q}</Ltr> m، وأجبتَ في المختبر عن السبب.</span>}
                todo="أنجز المهمة 2 (9 m في 4 قطع)، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('r2', 'whyEnd', ex) && <KnowledgeBrick id="ashri-am-la" lead="متى يكون حاصل القسمة عددًا عشريًا؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا نسمّي الطولين؟', subtitle: 'يكفي ولا يكفي', done: answered('r3', 'rule', r3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="r3" ok={!!r3 && answered('r3', 'rule', r3)}
                done={m(`في المهمة 3 وجدتَ $${r3?.lo?.replace(',', '{,}')}$ تكفي و $${r3?.hi?.replace(',', '{,}')}$ لا تكفي، وأجبتَ في المختبر عمّا تعنيه كلّ منهما.`)}
                todo="أنجز المهمة 3 (9,5 m في 3 قطع) حتى السنتيمتر، ثم أجب عن الأسئلة فوق المختبر، وآخرها عن القاعدة." />
              {answered('r3', 'rule', r3) && <KnowledgeBrick id="qiyam-muqarraba-ushr" lead="كيف نسمّي الطولين اللذين يحصران الحاصل؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'غيّرنا الوحدة فبقي العدد', subtitle: '4,6 و 0,7', done: answered('a1', 'sameCount', a1),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a1" ok={!!a1 && answered('a1', 'sameCount', a1)}
                done={m(`في المستوى المتقدّم غيّرتَ الوحدة فصار الحبل $46$ والحبل الواحد $7$ ، وبقي عدد الحبال: $${a1?.lo?.replace(',', '{,}')} < \\frac{46}{7} < ${a1?.hi?.replace(',', '{,}')}$ .`)}
                todo="في المستوى المتقدّم: اختر وحدة الشريط، وأنجز المهمة 1 (حبال من 0,7 m في حبل 4,6 m)، ثم أجب عن الأسئلة فوق المختبر." />
              {answered('a1', 'sameCount', a1) && <KnowledgeBrick id="tahwil-qasim" lead="ماذا فعلنا بالطولين حين غيّرنا الوحدة؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
