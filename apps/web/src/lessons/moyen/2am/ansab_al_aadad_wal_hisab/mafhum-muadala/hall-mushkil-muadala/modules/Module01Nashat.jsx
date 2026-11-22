import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « خطّ العصير ». UNE SEULE PISTE (§4quater) : le labo `juice-line` en haut, sans carte au-dessus — il porte son contexte et SA question ;
 * la main tient l'INCONNUE x (la capacité du moule à مبتدئ, le contenu du réservoir à متقدم), l'élève remplit (deux essais seulement), écrit l'opération puis choisit toutes les bonnes équations. Les questions sur ce que l'élève a FAIT (ce qu'a
 * dit le premier remplissage, ce que vaut le jus de 12 bouteilles, quelle opération donne le diviseur manquant, la règle, le dividende manquant, la dernière opération) sont posées PAR-DESSUS le labo après chaque tâche
 * (`primitives/LabCheckpoint`, chaînes `JuiceLine › CHAINS`) ; les étapes ci-dessous en gardent la TRACE (événements `checkpoint` du labo) puis posent les noms (briques). Si l'enseignant a coupé les questions pour son compte,
 * une étape se valide dès que la tâche est résolue. LP : P1, P3.
 */
export default function Module01Nashat() {
  const [tb, setTb] = useState([]);
  const [ta, setTa] = useState([]);
  const cpOn = useLabCheckpointSettings('juice-line').enabled;
  const rec = (set) => (e) => set((list) => [...list, e]);
  const all = [...tb, ...ta];
  const solved = (list, task) => list.some((e) => e.kind === 'solved' && !e.free && e.task === task);
  // une étape est faite quand SA question est répondue (ou, questions coupées par l'enseignant, quand la tâche est résolue)
  const answered = (taskId, qid, evidence) => all.some((e) => e.tk === 'checkpoint' && e.id === taskId && e.q === qid && (e.ok || e.revealed)) || (!cpOn && !!evidence);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );
  const m = (s) => <MathText>{s}</MathText>;
  const t1 = solved(tb, 0); const t2 = solved(tb, 1); const t3 = solved(tb, 2); const a1 = solved(ta, 0); const a2 = solved(ta, 1); const a3 = solved(ta, 2);

  return (
    <ContentModule
      objectives={['كيف أجد عددًا مجهولًا دون تجريب أعمى؟', 'ما العملية التي تعطي القاسم الناقص؟', 'وما العملية التي تعطي المقسوم الناقص؟', 'وماذا أفعل حين تكون في المعادلة عمليتان؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — خطّ العصير"
      moduleSubtitle="املأ القوارير ثمّ اكتب العملية التي تعطي العدد المجهول"
      estimatedTime="18 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="juice-line" level="beginner" onTrial={rec(setTb)} />,
            advanced: () => <Manipulation type="juice-line" level="advanced" onTrial={rec(setTa)} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ما قاله الملء', subtitle: '$12\\times x=18$', done: answered('t1', 'twelve', t1),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="t1" ok={t1 && answered('t1', 'twelve', t1)}
                done={m('في المهمة 1 قرأتَ ما قاله الملء: قوارير تامّة وجزء بقي في الخزّان، ثمّ كتبتَ $12\\times x=18$ و $\\frac{18}{x}=12$ لأنّ القوارير تحمل معًا ما في الخزّان.')}
                todo="أنجز المهمة 1 (جرّب مرّتين ثمّ اكتب العملية واختر المعادلتين) وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('t1', 'twelve', t1) && (
                <>
                  <KnowledgeBrick id="ma-qal-al-mil" lead="ماذا قال الملء عن سعة القارورة؟" />
                  <KnowledgeBrick id="muadala-kitabatan" lead="كيف نكتب الوضعية نفسها بمعادلتين؟" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'القاسم الناقص', subtitle: '$x=a\\div b$', done: answered('t3', 'rule', t3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="t3" ok={t2 && t3 && answered('t3', 'rule', t3)}
                done={m('في المهمتين 2 و 3 وجدتَ السعة بقسمة المقسوم على حاصل القسمة: $30\\div40=0{,}75$ و $9\\div36=0{,}25$ ، دون أن تحتاج إلى تجارب كثيرة.')}
                todo="أنجز المهمتين 2 و 3 وأجب عن الأسئلة فوق المختبر." />
              {answered('t3', 'rule', t3) && <KnowledgeBrick id="qasim-naqis" lead="كيف نجد القاسم الناقص؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'المقسوم الناقص', subtitle: '$x=a\\times b$', done: answered('a2', 'dividend2', a2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a2" ok={a1 && a2 && answered('a2', 'dividend2', a2)}
                done={m('في المستوى المتقدّم صار المجهول كمية الخزّان نفسها: وجدتَ $24\\times0{,}25=6$ لترات و $15\\times1{,}5=22{,}5$ لترًا بالضرب.')}
                todo="في المستوى المتقدّم: أنجز المهمتين 1 و 2 (اكتب العملية أوّلًا ثمّ اضبط الخزّان) وأجب عن السؤالين فوق المختبر." />
              {answered('a2', 'dividend2', a2) && <KnowledgeBrick id="maqsum-naqis" lead="ومتى نضرب لنجد العدد الناقص؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'عمليتان في معادلة', subtitle: '$\\frac{4+x}{0{,}25}=40$', done: answered('a3', 'last', a3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a3" ok={a3 && answered('a3', 'last', a3)}
                done={m('في المهمة 3 من المستوى المتقدّم كان في الخزّان $4$ لترات: ألغيتَ القسمة أوّلًا فوجدتَ $4+x=10$ ثمّ $x=6$ .')}
                todo="في المستوى المتقدّم: أنجز المهمة 3 (خزّان فيه أربعة لترات) ثمّ أجب عن السؤال فوق المختبر." />
              {answered('a3', 'last', a3) && <KnowledgeBrick id="akhir-amaliya" lead="بماذا نبدأ حين تكون في المعادلة عمليتان؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
