import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la « لوحة الأسعار ». UNE SEULE PISTE
 * (§4quater) : le labo `fourth-gauges` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient le nombre qui
 * MANQUE dans un tableau de prix, trois balances d'égalité penchent sous le doigt.
 *   مبتدئ — 4 kg → 520 DA / 6 kg → ? (780) ; une quantité à trouver ; 8 kg → 400 DA / 12 kg → ? où la balance « الفرق » ment (404) ;
 *   متقدم — balances voilées, décimaux, le trou en b, a, d.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES essais : pourquoi les balances s'équilibrent ensemble (P1), pourquoi on ne garde
 * pas le prix de la balance « الفرق » (P1), ce que disent les produits en croix à l'équilibre (P2). Les noms (briques) viennent APRÈS la
 * réponse. Le نشاط 2 du manuel (l'éprouvette graduée) est posé en application au module 4.
 * Déploiement du prototype (2026-10-28) : ces questions sont posées PAR-DESSUS le labo après chaque tâche (`FourthGauges › chainOf`) ;
 * les étapes en gardent la TRACE (`checkpoint-done` des tâches f0 et f2) puis posent les noms.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const mine = trials.filter((e) => e.kind === 'release' && !e.free);
  // la tâche 1 (4 kg → 520 DA, 6 kg → ?) juste ; la balance « الفرق » allumée seule dans la tâche 3 (8 kg → 400 DA, 12 kg → ?)
  const fair = mine.findLast((e) => e.task === 0 && e.ok);
  const lie = mine.findLast((e) => e.task === 2 && e.decoyHit);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const q1 = answered('f0');
  const q2 = answered('f2');
  const q3 = q1;

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['متى تتوازن الموازين الثلاثة معًا؟', 'لماذا لا نقبل الثمن الذي يضيء له ميزان الفرق؟', 'ماذا يقول ميزان الجداءين عند الثمن العادل؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — لوحة الأسعار"
      moduleSubtitle="بطاقة ناقصة وموازين العدالة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="fourth-gauges" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="fourth-gauges" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ماذا تؤكّد الموازين الثلاثة؟', subtitle: 'الثمن العادل', done: q1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="fair" ok={q1 && !!fair}
                done={<span>أجبتَ في المختبر: ضبطتَ ثمن <Ltr>6</Ltr> kg على <Ltr>{fair?.value}</Ltr> DA فتوازنت الموازين الثلاثة معًا، وثمن الكيلوغرام <Ltr>130</Ltr> DA في العمودين.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الأولى (ثمن 6 kg)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q1 && <KnowledgeBrick id="rabi" lead="ثلاثة أعداد معلومة وعدد واحد يوازنها: ما اسمه؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا لا نقبل ثمن ميزان الفرق؟', subtitle: 'ميزان يكذب', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="lie" ok={q2 && !!lie}
                done={<span>وضعتَ الثمن <Ltr>{lie?.value}</Ltr> DA لـ <Ltr>12</Ltr> kg فأضاء ميزان الفرق وحده، ولم يكن الثمن الصحيح.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الثالثة: اضبط الثمن حتى يتوازن ميزان «الفرق» أوّلًا، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q2 && <KnowledgeBrick id="farq" lead="نزيد الكتلة بـ 4 فهل نزيد الثمن بـ 4 ؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا يقول ميزان الجداءين؟', subtitle: 'الجداءان المتصالبان', done: q3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="cross" ok={q3 && !!fair}
                done={<span>عند <Ltr>{fair?.value}</Ltr> DA توازن ميزان «الجداءان» أيضًا: <Ltr>4 × 780 = 520 × 6</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الأولى (ثمن 6 kg)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q3 && <KnowledgeBrick id="jidaan" lead="جداءا القطرين عند الثمن العادل: ماذا نقول عنهما؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
