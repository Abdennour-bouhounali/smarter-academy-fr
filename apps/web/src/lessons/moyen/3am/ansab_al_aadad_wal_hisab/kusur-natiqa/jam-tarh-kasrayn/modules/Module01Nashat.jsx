import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le râteau du jardin. UNE SEULE PISTE (§4quater) : le labo `seed-rake` en haut, sans carte
 * au-dessus — il porte son contexte et SA question ; la main ÉTIRE le râteau, l'espacement 1/N m est la variable. PROTOTYPE 2026-10-28 (déploiement lot 5) : les questions sur ce que l'élève a
 * FAIT (pourquoi l'espacement refusé l'a été, combien de plants et quelle longueur, la MÊME longueur pour un second espacement, l'espacement le plus large) sont posées PAR-DESSUS le labo après
 * la tâche 1 (`primitives/LabCheckpoint`, chaîne `SeedRake › CHAINS.g1`) ; les étapes ci-dessous en gardent la TRACE (événements `checkpoint` du labo) puis posent les noms (briques).
 * Si l'enseignant a coupé les questions pour son compte, une étape se valide dès que l'élève a produit l'essai correspondant. Le نشاط 4 du manuel est posé en application (أتمرّن).
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;
const WIDEST = 12;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const cpOn = useLabCheckpointSettings('seed-rake').enabled;
  const record = (e) => setTrials((list) => [...list, e]);
  const mine = trials.filter((e) => !e.free && e.mission === 'g1');
  const bad = mine.findLast((e) => e.kind === 'refused');
  const oks = mine.filter((e) => e.kind === 'plant' && e.ok);
  const first = oks[0];
  const second = first ? oks.find((e) => e.N !== first.N) : undefined;
  const widest = oks.find((e) => e.N === WIDEST);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand SA question est répondue (ou, questions coupées par l'enseignant, quand l'essai existe)
  const answered = (qid, evidence) => trials.some((e) => e.tk === 'checkpoint' && e.id === 'g1' && e.q === qid && (e.ok || e.revealed)) || (!cpOn && !!evidence);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا لا نجمع كسرين كما هما؟', 'متى تمتلئ الأجزاء بشتلات كاملة؟', 'هل يتغيّر الطول إن تغيّرت المسافة؟', 'أيّ مسافة أفضل؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مشط الشتلات"
      moduleSubtitle="املأ كلّ جزء بشتلات كاملة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="seed-rake" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="seed-rake" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا رُفضت المسافة؟', subtitle: 'شتلة على الحدّ', done: answered('whyRefused', bad),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="g1-refused" ok={!!bad && answered('whyRefused', bad)}
                done={<span>في المهمة 1 رفض الحوض المسافة <Ltr>{`1/${bad?.N}`}</Ltr> م، وأجبتَ في المختبر عن السبب: شتلة وقعت على الحدّ بين جزأين.</span>}
                todo="جرّب في المهمة 1 مسافة لا تنجح (لتريَ الحوض شتلة على الحدّ)، ثم أجب عن الأسئلة التي تظهر فوق المختبر بعد المهمة." />
            </div>
          ),
        },
        {
          num: 2, title: 'وإذا نجحت المسافة؟', subtitle: 'شتلات وطول', done: answered('plantsTotal', first),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="g1-plant" ok={!!first && answered('plantsTotal', first)}
                done={<span>نجحت المسافة <Ltr>{`1/${first?.N}`}</Ltr> م في المهمة 1 وزرعتَ <Ltr>{first?.signed}</Ltr> شتلة في المجموع، وطول الجزء المزروع <MathText>{`$\\frac{${first?.total?.split('/')[0]}}{${first?.total?.split('/')[1]}}$`}</MathText> م.</span>}
                todo="أنجز في المهمة 1 مسافة تنجح (يمتلئ فيها الجزءان بشتلات كاملة)، ثم أجب عن الأسئلة فوق المختبر." />
              {answered('plantsTotal', first) && <KnowledgeBrick id="tawhid-qabl-jam" lead="لماذا كتبنا الكسرين بالمقام نفسه قبل أن نجمع؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'مسافة أخرى تنجح', subtitle: 'الطول نفسه', done: answered('sameLength', second),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="g1-second" ok={!!second && answered('sameLength', second)}
                done={<span>نجحت أيضًا المسافة <Ltr>{`1/${second?.N}`}</Ltr> م وزرعتَ <Ltr>{second?.signed}</Ltr> شتلة، وبقي الطول نفسه.</span>}
                todo="جرّب في المهمة 1 مسافة ثانية تنجح (تختلف عن الأولى)، ثم أجب عن الأسئلة فوق المختبر." />
              {answered('sameLength', second) && <KnowledgeBrick id="mudaaf-mushtarak" lead="أيّ عدد يصلح مقامًا مشتركًا للكسرين؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'أوسع مسافة', subtitle: 'مكان للشتلات', done: answered('widest', widest),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="g1-widest" ok={!!widest && answered('widest', widest)}
                done={<span>وجدتَ المسافة <Ltr>{`1/${WIDEST}`}</Ltr> م.</span>}
                todo="جرّب في المهمة 1 أوسع مسافة تنجح (تظهر النجمة بعد نجاحين)، ثم أجب عن الأسئلة فوق المختبر." />
              {answered('widest', widest) && <KnowledgeBrick id="asghar-mudaaf" lead="ما أوسع مسافة تنجح، وكيف نصل إليها بسرعة؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
