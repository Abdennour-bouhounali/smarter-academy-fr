import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la machine aux trois bassins carrés d'un
 * معرض العلوم. UNE SEULE PISTE (§4quater) : le labo `pythagoras-tanks` en haut, sans carte au-dessus — il porte son contexte et SA question.
 *   مبتدئ — bras 3 et 4 : la main tient l'ANGLE en A ; plein juste à 90° seulement ; un angle plus petit déborde, un plus grand laisse un vide ;
 *   متقدم — 5 et 12 : la main tient la LONGUEUR BC ; il faut prévoir 13 ; puis 2 et 3 : la touche √ (√13).
 * Les questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche (rollout lot 6, `primitives/LabCheckpoint`, chaînes
 * `PythagorasTanks › CHAINS` : fill · compare · thirteen · surd) et retiennent la tâche suivante ; les étapes ci-dessous en gardent la TRACE (événements
 * `checkpoint-done`, avec SES versements) puis posent les noms (briques). Le نشاط 1 du manuel (Perigal) est posé en application au module 4 ; la touche √ est nommée au module 3.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  // Les essais de « جرّب أعدادك » (free: true) ne comptent pas ici.
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const pours = trials.filter((e) => e.kind === 'pour');
  const exact = pours.find((e) => e.mode === 'angle' && e.verdict === 'exact');
  const over = pours.find((e) => e.mode === 'angle' && e.verdict === 'over');
  const gap = pours.find((e) => e.mode === 'angle' && e.verdict === 'gap');
  const thirteen = pours.find((e) => e.mode === 'length' && e.task === 'thirteen' && e.verdict === 'exact');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا لم يمتلئ الحوض الكبير تمامًا إلا عند زاوية واحدة؟', 'ماذا نقول عن مثلث لا تتحقّق فيه المساواة؟', 'كيف نتنبّأ بطول الضلع الثالث دون أن نجرّب؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — آلة الأحواض المربعة"
      moduleSubtitle="ماء ومربعات"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="pythagoras-tanks" level="beginner" mode={LAB.beginner.mode} b={LAB.beginner.b} c={LAB.beginner.c} onTrial={record} />,
            advanced: () => <Manipulation type="pythagoras-tanks" level="advanced" mode={LAB.advanced.mode} b={LAB.advanced.b} c={LAB.advanced.c} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا امتلأ الحوض الكبير تمامًا عند زاوية واحدة فقط؟', subtitle: 'سكبتَ الماء', done: answered('fill'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="fill" ok={answered('fill') && !!exact}
                done={<span>أجبتَ في المختبر: امتلأ الحوض الكبير تمامًا عند <Ltr>{exact?.angle}°</Ltr> بـ <Ltr>{exact?.water} cm²</Ltr> من الماء{over ? <>، وفاض الماء عند <Ltr>{over.angle}°</Ltr></> : null}.</span>}
                todo="في المستوى المبتدئ حرّك النقطة C حتى يمتلئ الحوض الكبير تمامًا، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('fill') && <KnowledgeBrick id="fitaghuras" lead="25 = 16 + 9 عند الزاوية القائمة فقط: ماذا يساوي مربع الضلع المقابل لها؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا يقول لنا ماء يفيض أو فراغ يبقى؟', subtitle: 'زاوية أصغر وزاوية أكبر', done: answered('compare'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="contrast" ok={answered('compare') && !!over && !!gap}
                done={<span>أجبتَ في المختبر: عند <Ltr>{over?.angle}°</Ltr> فاض الماء، وعند <Ltr>{gap?.angle}°</Ltr> بقي فراغ، وعند الزاوية القائمة امتلأ الحوض تمامًا.</span>}
                todo="في المهمّة الثانية من المستوى المبتدئ اسكب مرّة بزاوية أصغر ومرّة بزاوية أكبر، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('compare') && <KnowledgeBrick id="ghayr-qaim" lead="فيضان أو فراغ: المساواة لم تتحقّق. ماذا تقول عن المثلث؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف كنتَ ستعرف 13 دون أن تجرّب؟', subtitle: 'الآلة 5 و 12', done: answered('thirteen'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="thirteen" ok={answered('thirteen') && !!thirteen}
                done={<span>أجبتَ في المختبر: مع <Ltr>5</Ltr> و <Ltr>12</Ltr> امتلأ الحوض الكبير تمامًا عند <Ltr>BC = {thirteen?.bc} cm</Ltr>، لأنّ <Ltr>{thirteen?.bc}² = {thirteen?.water}</Ltr>.</span>}
                todo="في المستوى المتقدّم اضبط طول [BC] حتى يمتلئ الحوض الكبير تمامًا، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('thirteen') && <KnowledgeBrick id="hisab-watar" lead="من 5 و 12 إلى 13: كيف نحسب الضلع المقابل للزاوية القائمة؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
