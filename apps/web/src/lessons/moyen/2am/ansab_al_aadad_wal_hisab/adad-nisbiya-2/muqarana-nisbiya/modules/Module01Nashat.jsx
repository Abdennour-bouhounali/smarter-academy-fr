import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le « المسبار ». UNE SEULE PISTE
 * (§4quater) : le labo `zero-probe` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient la DISTANCE
 * à zéro d'un capteur au bout d'un câble.
 *   مبتدئ — A = −3 : plus bas (câble plus long), plus haut (plus court) ; A = 4 : plus bas ; A = 2 : aucune longueur ne rend B plus haut ;
 *   متقدم — des décimaux, un côté libre, la zone d'une dixième.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES essais : pourquoi plus de câble rend B plus bas sous le zéro (P1), ce que fait le
 * câble au-dessus du zéro (P2), pourquoi aucune longueur ne suffit quand A est au-dessus (P2). Les noms (briques) viennent APRÈS la réponse.
 * Le نشاط 2 du manuel (six thermomètres) est posé en application au module 4.
 * Déploiement du prototype (2026-10-28) : ces questions sont posées PAR-DESSUS le labo après chaque tâche (`ZeroProbe › chainOf`) ; les
 * étapes en gardent la TRACE (`checkpoint-done` des tâches z0, z2, z3) puis posent les noms.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const mine = trials.filter((e) => e.kind === 'release' && !e.free && e.tk === 'beat');
  // sous le zéro, plus bas que A = −3 (tâche 0) ; au-dessus, plus bas que A = 4 (tâche 2) ; la décision « impossible » (tâche 3)
  const lowerBelow = mine.findLast((e) => e.task === 0 && e.ok);
  const upperAbove = mine.findLast((e) => e.task === 2 && e.ok);
  const refused = trials.find((e) => e.kind === 'none' && e.ok && e.task === 3);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const q1 = answered('z0');
  const q2 = answered('z2');
  const q3 = answered('z3');

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا يهبط المسبار حين يطول السلك تحت الصفر؟', 'ماذا يفعل طول السلك فوق الصفر؟', 'لماذا لا يعلو مسبار تحت الصفر مسبارًا فوقه؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — المسبار"
      moduleSubtitle="سلك يطول فوق الصفر وتحته"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="zero-probe" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="zero-probe" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا يهبط المسبار حين يطول السلك تحت الصفر؟', subtitle: 'عددان سالبان', done: q1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="below" ok={q1 && !!lowerBelow}
                done={<span>بسلك طوله <Ltr>{lowerBelow?.d}</Ltr> تحت الصفر صار المسبار B عند <Ltr>{lowerBelow?.value}</Ltr> ، وهو أخفض من A عند <Ltr>{lowerBelow?.a}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الأولى (أخفض من A تحت الصفر)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q1 && <KnowledgeBrick id="salibayn" lead="عددان سالبان: أيّهما الأصغر؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا يفعل السلك فوق الصفر؟', subtitle: 'عددان موجبان', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="above" ok={q2 && !!upperAbove}
                done={<span>فوق الصفر، بسلك طوله <Ltr>{upperAbove?.d}</Ltr> صار B عند <Ltr>{upperAbove?.value}</Ltr> ، وهو أخفض من A عند <Ltr>{upperAbove?.a}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الثالثة (أخفض من A فوق الصفر)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q2 && <KnowledgeBrick id="mujabayn" lead="عددان موجبان: أيّهما الأصغر؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'لماذا لا يعلو المسبار؟', subtitle: 'إشارتان مختلفتان', done: q3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="none" ok={q3 && !!refused}
                done={<span>قرّرتَ أنّ B تحت الصفر لا يمكن أن يكون أعلى من A عند <Ltr>2</Ltr> مهما كان طول السلك.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الرابعة (A عند 2)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q3 && <KnowledgeBrick id="mukhtalifayn" lead="سالب وموجب، وماذا عن الصفر؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
