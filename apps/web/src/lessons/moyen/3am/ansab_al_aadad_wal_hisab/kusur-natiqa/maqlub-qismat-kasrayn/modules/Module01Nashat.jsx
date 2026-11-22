import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la دوّاسة. UNE SEULE PISTE (§4quater) : le labo `gear-crank` en haut, sans
 * carte au-dessus — il porte son contexte et SA question ; la main TOURNE la manivelle, le nombre de tours de pédale est la variable. PROTOTYPE 2026-10-28 : les
 * questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`, chaînes `GearCrank › CHAINS`) et retiennent la
 * tâche suivante ; les étapes ci-dessous en gardent la TRACE (événements `checkpoint-done`) puis posent les noms (briques). Seule la cible fractionnaire (متقدم)
 * reste une question d'étape. Le نشاط 1 du manuel est posé en application au module 4.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const markAnswered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const mine = trials.filter((e) => !e.free && e.tk === 'release' && e.ok);
  const m2 = mine.findLast((e) => e.id === 'm2');
  const m3 = mine.findLast((e) => e.id === 'm3');
  const a1 = mine.findLast((e) => e.id === 'a1');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كم دورة للدوّاسة لعدد من دورات العجلة؟', 'لماذا تلزم دورات أكثر من دورات العجلة؟', 'ما مقلوب عدد؟', 'كيف نقسم كسرًا على كسر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — دوّاسة الدرّاجة"
      moduleSubtitle="تدوير الدوّاسة حتى تصل العجلة إلى العلم"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="gear-crank" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="gear-crank" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كم دورة للدوّاسة تلزم؟', subtitle: 'أكثر من دورات العجلة', done: answered('m2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="m2" ok={answered('m2') && !!m2}
                done={<span>أجبتَ في المختبر: <Ltr>{m2?.wheel}</Ltr> دورات للعجلة احتاجت <Ltr>{m2?.pedal}</Ltr> دورات للدوّاسة، لأنّ الصحن أصغر من الترس فلا تُدير دورة الدوّاسة إلّا <MathText>{'$\\frac{3}{4}$'}</MathText> دورة للعجلة.</span>}
                todo="أنجز المهمتين 1 و 2 في الدوّاسة، وأجب عن الأسئلة التي تظهر فوق المختبر بعد كلّ مهمة." />
            </div>
          ),
        },
        {
          num: 2, title: 'وللعجلة دورة واحدة؟', subtitle: 'المقلوب، والقسمة ضرب', done: answered('m3'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="m3" ok={answered('m3') && !!m3}
                done={<span>أجبتَ في المختبر: دورة واحدة للعجلة احتاجت <Ltr>{m3?.pedal}</Ltr> دورة للدوّاسة، و <MathText>{'$\\frac{3}{4} \\times \\frac{4}{3} = 1$'}</MathText> .</span>}
                todo="أنجز المهمة 3 في الدوّاسة (دورة واحدة للعجلة)، وأجب عن أسئلتها فوق المختبر." />
              {answered('m3') && <KnowledgeBrick id="maqlub" lead="عددان جداؤهما 1: كيف نسمّي كلًّا منهما بالنسبة إلى الآخر؟" />}
              {answered('m3') && <KnowledgeBrick id="qisma-darb" lead="6 ÷ 3/4 = 6 × 4/3 : ما الذي فعلناه بالقسمة على عدد؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'وإذا كان الهدف كسرًا؟', subtitle: 'كسر على كسر', done: !!q.d,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a1" ok={!!a1}
                done={<span>في المستوى المتقدّم كان الهدف <Ltr>{a1?.target}</Ltr> دورة للعجلة، فاحتاجت الدوّاسة <Ltr>{a1?.pedal}</Ltr> دورات.</span>}
                todo="هدف كسري مثل 9/2 دورة للعجلة والدوّاسة تُدير العجلة 3/4 دورة في الدورة: جرّب المستوى المتقدّم، ثم عُد إلى هذا السؤال." />
              <NumericQuestion
                prompt={<MathText>{'احسب $\\frac{9}{2} \\div \\frac{3}{4}$ :'}</MathText>}
                expected={6} display="6" parse={parseDec} requires={['qisma-darb']}
                explain={<MathText>{'$\\frac{9}{2} \\times \\frac{4}{3} = \\frac{36}{6} = 6$ .'}</MathText>}
                onAnswered={markAnswered('d')}
              />
              {q.d && <KnowledgeBrick id="qismat-kasrayn" lead="قسمة كسر على كسر: ماذا نفعل بالكسر الثاني؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
