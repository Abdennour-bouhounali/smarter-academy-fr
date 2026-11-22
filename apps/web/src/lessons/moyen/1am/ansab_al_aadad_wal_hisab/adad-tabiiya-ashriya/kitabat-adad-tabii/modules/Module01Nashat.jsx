import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, WORKSHOP } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter, règle du propriétaire
 * 2026-10-14 : le manuel est la référence des الكفاءات, pas le script). UNE SEULE PISTE (§4quater) :
 *   1. le labo `rank-exchange` en haut, sans carte au-dessus — il porte lui-même son contexte et SA question ;
 *        مبتدئ — l'atelier des crayons : 1 carton, 13 boîtes, 24 paquets, 37 crayons à lier avant de pouvoir écrire le
 *                 nombre (2577) ; puis 2017 crayons ouverts en paquets ;
 *        متقدم — les jetons de rang : 999 + 1 en cascade, 999 − 1, 1000 − 1 ;
 *   2. des questions sur CE QUE L'ÉLÈVE A FAIT : les deux 7 de SON 2577, le crayon ajouté à 999, le 0 de 2017 ;
 *   3. les noms (briques), APRÈS la réponse — une brique visible avant la réponse la donnerait.
 * Le نشاط 1 du manuel (0 1 3 8 ; 25 / 52 ; 999) est posé en application au module 4. LP : P2.
 * Déploiement du prototype (2026-10-28) : les questions sur ce que l'élève a FAIT (ce qui reste, les deux 7, le 0 de 2017, la règle) sont
 * posées PAR-DESSUS le labo après chaque tâche (`RankExchange › CHAINS`) ; les étapes 1 et 3 en gardent la TRACE (`checkpoint-done`) puis
 * posent les noms. La cascade 999 + 1 (المستوى المتقدّم) reste une question d'étape.
 */
export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q2, setQ2] = useState(false);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (task) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === task);
  const did = (task) => answered(task) || trials.some((e) => e.task === task && e.ok && task === 'next');

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ task, done, todo }) => (
    <p data-evidence={task} data-tried={did(task) ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${did(task) ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {did(task) ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['متى نستطيع أن نكتب عدد الأقلام؟', 'هل للرقم نفس القيمة في كل عمود؟', 'ماذا يحدث عندما نضيف قلمًا إلى 999 قلمًا؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — ورشة تحزيم الأقلام"
      moduleSubtitle="أقلام، حزم، علب، صناديق"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation type="rank-exchange" level="beginner" world="pencils" tasks={['pack', 'unpack']}
                start={LAB.pack} n={LAB.unpack.n} rank={LAB.unpack.rank} onTrial={record} />
            ),
            advanced: () => (
              <Manipulation type="rank-exchange" level="advanced" world="tokens" tasks={['next', 'previous', 'borrow']}
                next={LAB.next} borrow={LAB.borrow} onTrial={record} />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'هل يعدّ الرقمان 7 نفس العدد من الأقلام؟', subtitle: 'في لوحتك', done: answered('pack'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence task="pack" done={<span>أجبتَ في المختبر: ربطتَ كل عشرة حتى صار العدد مكتوبًا <bdi dir="ltr">{LAB.packValue}</bdi>، والرقم 7 في عمود الحزم يعدّ 70 قلمًا لا 7.</span>}
                todo="اربط أقلام الورشة (المهمة 1 في المستوى المبتدئ)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('pack') && <KnowledgeBrick id="tabadul" lead="عمود فيه 10: ماذا فعلتَ قبل أن تستطيع كتابة العدد؟" />}
              {answered('pack') && <KnowledgeBrick id="qima-mawdi" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا يحدث إذا وصل قلم واحد؟', subtitle: 'إلى 999 قلمًا', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence task="next" done={<span>أضفتَ 1 إلى <bdi dir="ltr">999</bdi> وربطتَ حتى صار العدد مكتوبًا.</span>}
                todo="جرّب المهمة « العدد الموالي » في المستوى المتقدّم، أو أجب ثم تحقّق هناك." />
              <TapQuestion
                prompt={<span>في ورشة أخرى 9 علب و 9 حزم و 9 أقلام، أي <bdi dir="ltr">999</bdi> قلمًا. وصل قلم واحد. بعد أن نربط كل عشرة، ماذا يبقى في الورشة؟</span>}
                options={['صندوق واحد فقط: 1000', '9 علب و 9 حزم و 10 أقلام: 99910', '9 علب و 10 حزم: 9910']}
                correct={0} cols={1} requires={['maratib-ibtidai', 'kitabat-adad-ibtidai']}
                explain={<MathText>{WORKSHOP.cascade}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'لماذا نكتب 0 في عمود فارغ؟', subtitle: 'طلبية المدرسة الجبلية', done: answered('unpack'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence task="unpack" done={<span>أجبتَ في المختبر: فتحتَ صندوقَي المخزن فوجدتَ <bdi dir="ltr">{LAB.unpack.count}</bdi> حزمة، مع أنّ رقم العشرات في <bdi dir="ltr">{LAB.unpack.n}</bdi> هو 1؛ وبدون الصفر نقرأ <bdi dir="ltr">217</bdi>.</span>}
                todo="افتح صناديق المخزن (المهمة 2 في المستوى المبتدئ)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
