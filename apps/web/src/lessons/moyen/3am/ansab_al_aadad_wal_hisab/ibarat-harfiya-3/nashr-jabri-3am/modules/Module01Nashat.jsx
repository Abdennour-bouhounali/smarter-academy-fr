import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le jardin de l'école vu d'en haut. UNE SEULE
 * PISTE (§4quater) : le labo `area-split` (monde `plot`) en haut, sans carte au-dessus — il porte son contexte et SA question ; la main fait
 * glisser la COUPURE d'un côté du terrain puis décide ce que chaque parcelle compte (une aire qui s'ajoute, une allée qui s'ôte, le coin
 * que deux allées ôtent deux fois et qui se rend).
 *   مبتدئ — 3(x + 4) puis 2(x − 3) ;  متقدم — (x + 3)(x + 2) puis (x − 2)(x − 3).
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES parcelles : pourquoi les deux compteurs d'aire restent égaux (P3), pourquoi l'allée
 * se soustrait (P1), pourquoi le coin se rend (P2). Les noms (briques) viennent APRÈS la réponse. Le نشاط 3 du manuel est posé en
 * application au module 4.
 * Déploiement du prototype (2026-10-28) : les questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche
 * (`AreaSplit › chainOf`, la règle clôt la dernière) ; les étapes en gardent la TRACE (`checkpoint-done`) puis posent les noms.
 */

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا يتساوى العدّادان؟', 'لماذا يُطرح الممرّ؟', 'لماذا يُردّ ركن الممرّين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — أرض الحديقة"
      moduleSubtitle="قطع وممرّات"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="area-split" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="area-split" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا تساوى العدّادان؟', subtitle: 'مساحة بطريقتين', done: answered('p1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="decided" ok={answered('p1')}
                done={<MathText>{'أجبتَ في المختبر: قطعتَ الأرض وقرّرتَ ما تحسبه كل قطعة، فتساوى العدّادان مهما غيّرتَ $x$ : $3(x+4)=3x+12$ .'}</MathText>}
                todo="اقطع الأرض الأولى وقرّر ما تحسبه كل قطعة، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('p1') && <KnowledgeBrick id="masaha-tariqatayn" lead="مرّةً بجداء البعدين ومرّةً بمجموع الأجزاء: ماذا لاحظتَ؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا قرّرتَ أن يُطرح الممرّ؟', subtitle: 'ما بقي بعد الممرّ', done: answered('p2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="taken" ok={answered('p2')}
                done={<MathText>{'أجبتَ في المختبر: طرحتَ مساحة الممرّ من الأرض كلّها، فصار $2(x-3)=2x-6$ .'}</MathText>}
                todo="في المستوى المبتدئ أنهِ الأرض الثانية (فيها ممرّ مبلّط)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('p2') && <KnowledgeBrick id="hadd-matruh" lead="الممرّ المبلّط: ماذا فعلتَ بمساحته؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'لماذا عاد الركن؟', subtitle: 'ممرّان متقاطعان', done: answered('p4'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="corner" ok={answered('p4')}
                done={<MathText>{'أجبتَ في المختبر: الركن طُرح مع كل ممرّ فرددتَه مرّة، $(-2)\\times(-3)=+6$ ، و $(x-2)(x-3)=x^2-5x+6$ .'}</MathText>}
                todo="في المستوى المتقدّم أنهِ الأرض الثانية (فيها ممرّان متقاطعان)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('p4') && <KnowledgeBrick id="rukn-yuad" lead="الركن الذي طُرح مرّتين: كيف عاد إلى المساحة؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
