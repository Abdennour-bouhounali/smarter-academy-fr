import { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseNum } from '../content/exercises';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le mur de billes du نادي العلوم. UNE SEULE PISTE (§4quater) :
 * le labo `marble-run` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main lâche la bille dans le réservoir de la lettre puis ÉCRIT
 * sous le mur la ligne de la substitution (× et parenthèses) et lance. La valeur n'est jamais dite : elle sort du mur.
 *   مبتدئ — 4x + 7 en 3 puis −2, x² − 3x en −2 ;  متقدم — 5 − 2x² en −3, 6x − 1 en −1/2, 3x − 2y (deux réservoirs), valeur prédite.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES lignes : pourquoi le × (P2), pourquoi les parenthèses du négatif sous la copieuse (P2), ce que porte chaque
 * bille (P1), les deux lettres (P1). Les noms (briques) viennent APRÈS la réponse. Le نشاط 4 du manuel est posé en application au module 4.
 * Déploiement du prototype (2026-10-28) : les questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche
 * (`MarbleRun › chainOf`, la règle clôt la dernière) ; les étapes en gardent la TRACE (`checkpoint-done`) puis posent les noms.
 */

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q4, setQ4] = useState(false);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const twoLetters = trials.find((e) => e.kind === 'drop' && e.letter === 'y' && !e.free);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['أعوّض الحرف بعدد في كل مكان منه', 'أُظهر علامة الضرب', 'أضع العدد السالب بين قوسين']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مسار الكريات"
      moduleSubtitle="أُسقط كريةً وأكتب السطر"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="marble-run" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="marble-run" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا لا يكفي أن نكتب العددين متجاورين؟', subtitle: 'علامة الضرب', done: answered('r1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="solved1" ok={answered('r1')}
                done={<MathText>{'أجبتَ في المختبر: أظهرتَ علامة الضرب، $4\\times3+7=19$ ؛ دونها يُقرأ $43$ .'}</MathText>}
                todo="أنهِ المهمة الأولى (4x + 7 من أجل 3)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('r1') && <KnowledgeBrick id="ithar-darb" lead="سطرك كتب 4 ثم 3 متجاورين: ماذا فعلتَ لتصلحه؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا حدث للمربّع؟', subtitle: 'القوسان تحت الناسخة', done: answered('r3'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="solved3" ok={answered('r3')}
                done={<MathText>{'أجبتَ في المختبر: $(-2)^2-3\\times(-2)=4+6=10$ ؛ دون قوسين يُربَّع $2$ وحده.'}</MathText>}
                todo="أنهِ المهمة الثالثة (x² − 3x من أجل −2)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('r3') && <KnowledgeBrick id="aqwas-salib" lead="المسار توقّف عند الناسخة: كيف تكتب العدد السالب؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا حملت الكرتان؟', subtitle: 'العدد نفسه في كل مكان', done: answered('r3'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="drop3" ok={answered('r3')}
                done={<MathText>{'أجبتَ في المختبر: خزّان $x$ أرسل الكرية نفسها $-2$ إلى المكانين.'}</MathText>}
                todo="أنهِ المهمة الثالثة، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('r3') && <KnowledgeBrick id="nafs-al-adad" lead="الحرف نفسه في مكانين: ماذا وضعتَ في كل مكان؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'وإذا كان في العبارة حرفان؟', subtitle: 'خزّانان', done: q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="twoLetters" ok={!!twoLetters}
                done="أسقطتَ كريةً في خزّان y أيضًا."
                todo="في المستوى المتقدّم أنهِ المهمة السادسة (3x − 2y، خزّانان) ثم عُد إلى هذا السؤال." />
              <NumericQuestion
                prompt={<MathText>{String.raw`بالطريقة نفسها: ما قيمة $3x-2y$ من أجل $x=2$ و $y=-1$ ؟`}</MathText>}
                expected={8} display="8" parse={parseNum} requires={['nafs-al-adad']}
                explain={<MathText>{'$3\\times2-2\\times(-1)=6+2=8$.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="harfan" lead="خزّانان لحرفين: هل حملت الكريتان العدد نفسه؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
