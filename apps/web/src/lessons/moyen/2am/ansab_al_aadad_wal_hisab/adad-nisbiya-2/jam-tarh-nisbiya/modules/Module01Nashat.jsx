import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « أكياس المنطاد ». UNE SEULE PISTE (§4quater) : le labo `balloon-ballast` en haut, sans carte au-dessus — il porte son
 * contexte et SA question ; la main tient la CHARGE du montgolfière (flammes +1, sacs −1, paires neutres).
 *   مبتدئ — t1 (+6)+(−4), t2 (−3)+(−5), t3 (−9)+(+5), t4 (−6)+(+6) : des SOMMES ;
 *   متقدم — a1 (−7)−(−3), a2 (+5)−(−7), a3 (−2)−(+5), a4 (+6)−(+7) : des DIFFÉRENCES, l'altitude écrite AVANT d'exécuter.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES essais. Les noms (briques) viennent APRÈS la réponse. Le نشاط 3 et le نشاط 4 du manuel sont posés en application au module 4.
 * Prototype (2026-10-28) : les questions sont posées PAR-DESSUS le labo après chaque tâche (`BalloonBallast › CHAINS`) ; les étapes en gardent la TRACE (`checkpoint-done` de t1, t2, t3, t4, a4) puis posent les noms.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const okValue = (task) => trials.findLast((e) => e.kind === 'answer' && e.ok && e.task === task)?.value;
  const q1 = answered('t1');
  const q2 = answered('t2');
  const q3 = answered('t3');
  const q4 = answered('t4');
  const q5 = answered('a4');

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['ماذا يحدث لارتفاع المنطاد حين نربط أكياسًا؟', 'متى تتقابل نفخة وكيس؟', 'ماذا يحدث حين نرمي أكياسًا؟', 'ماذا نفعل حين لا يوجد في السلّة ما نرميه؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — أكياس المنطاد"
      moduleSubtitle="نفخات لهب وأكياس رمل"
      estimatedTime="16 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="balloon-ballast" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="balloon-ballast" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ماذا حدث للأزواج؟', subtitle: 'نفخات وأكياس معًا', done: q1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="pairs" ok={q1}
                done={<span>ربطتَ أربعة أكياس بمنطاد عند <Ltr>+6</Ltr> : انقفلت أربعة أزواج وبقيت نفختان، فاستقرّ المنطاد عند <Ltr>{okValue(0) ?? '2'}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ البطاقة الأولى، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا يحدث حين يتّفق النوعان؟', subtitle: 'أكياس إلى أكياس', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="same" ok={q2}
                done={<span>ربطتَ خمسة أكياس إلى ثلاثة: لم ينقفل أيّ زوج، فتجمّعت المسافتان وبلغ المنطاد <Ltr>{okValue(1) ?? '−8'}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ البطاقة الثانية، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q2 && <KnowledgeBrick id="jam-nafs-ishara" lead="متى نجمع المسافتين؟ وأيّ إشارة نكتب؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'من يحدّد إشارة الناتج؟', subtitle: 'أزواج تتلاشى', done: q3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="different" ok={q3}
                done={<span>ربطتَ خمس نفخات إلى منطاد عند <Ltr>−9</Ltr> : انقفلت خمسة أزواج وبقيت أربعة أكياس، فاستقرّ عند <Ltr>{okValue(2) ?? '−4'}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ البطاقة الثالثة، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q3 && <KnowledgeBrick id="jam-ishara-mukhtalifa" lead="حين تختلف الإشارتان: ماذا نفعل بالمسافتين؟ ومن يحدّد الإشارة؟" requires={['jam-nafs-ishara']} />}
            </div>
          ),
        },
        {
          num: 4, title: 'ماذا بقي في السلّة؟', subtitle: 'عددان متعاكسان', done: q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="zero" ok={q4}
                done={<span>ربطتَ ست نفخات إلى منطاد عند <Ltr>−6</Ltr> : انقفلت ستة أزواج ولم يبق شيء، فعاد المنطاد إلى <Ltr>0</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ البطاقة الرابعة، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q4 && <KnowledgeBrick id="mutaakisan-sifr" lead="ماذا يساوي مجموع عددين متعاكسين؟" requires={['jam-ishara-mukhtalifa']} />}
            </div>
          ),
        },
        {
          num: 5, title: 'كيف رميتَ ما لم يكن في السلّة؟', subtitle: 'الطرح هو جمع المعاكس', done: q5,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="subtract" ok={q5}
                done={<span>رميتَ أكياسًا فارتفع المنطاد، وحين لم يكن في السلّة ما يُرمى ربطتَ أزواجًا محايدة أولًا: رميُ <Ltr>−7</Ltr> أعطى ما يعطيه ربط <Ltr>+7</Ltr> .</span>}
                todo="أنجز في المستوى المتقدّم البطاقات الأربع، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q5 && <KnowledgeBrick id="tarh-bi-muakis" lead="ماذا يساوي طرح عدد نسبي؟" requires={['jam-ishara-mukhtalifa']} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
