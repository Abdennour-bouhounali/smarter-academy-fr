import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « ستائر النافذة ». UNE SEULE PISTE (§4quater) : le labo `window-blinds` en haut, sans carte au-dessus — il porte
 * son contexte et SA question ; la main tient les DEUX facteurs (deux tirages perpendiculaires) et écrit la fraction de fenêtre doublement ombrée. Les questions sur ce que l'élève a FAIT (combien de petits carrés,
 * combien sont sombres, d'où viennent 10 et 3, pourquoi 17/12 est impossible, comment on calcule, pourquoi le produit dépasse 1) sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`,
 * chaînes `WindowBlinds › CHAINS`) ; les étapes ci-dessous en gardent la TRACE (événements `checkpoint` du labo) puis posent les noms (briques). Si l'enseignant a coupé les questions pour son compte, une étape
 * se valide dès que l'essai existe. LP : P1, P2, P3.
 */
export default function Module01Nashat() {
  const [tb, setTb] = useState([]);
  const [ta, setTa] = useState([]);
  const cpOn = useLabCheckpointSettings('window-blinds').enabled;
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
  const w1 = solved(tb, 0); const w2 = solved(tb, 1); const w3 = solved(tb, 2); const a3 = solved(ta, 2); const a4 = solved(ta, 3);

  return (
    <ContentModule
      objectives={['ما الجزء المظلم مرّتين حين تغطّي ستارتان نافذة؟', 'كيف نحسب جزءًا من جزء؟', 'ماذا يحدث إذا كان العاملان أكبر من $1$ ؟', 'وماذا إذا غطّت الستارة نافذتين كاملتين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — ستائر النافذة"
      moduleSubtitle="اسحب الستارتين ثم اكتب الجزء المظلم مرّتين"
      estimatedTime="20 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="window-blinds" level="beginner" onTrial={rec(setTb)} />,
            advanced: () => <Manipulation type="window-blinds" level="advanced" onTrial={rec(setTa)} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'الجزء المظلم مرّتين', subtitle: '$\\frac{2}{3}$ و $\\frac{3}{4}$', done: answered('w1', 'half', w1),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="w1" ok={w1 && answered('w1', 'half', w1)}
                done={m('في المهمة 1 قسّم الظلاّن النافذة إلى $3\\times 4=12$ مربّعًا صغيرًا، وكان $2\\times 3=6$ منها مظلمة مرّتين: $\\frac{6}{12}=\\frac{1}{2}$ .')}
                todo="أنجز المهمة 1 (2/3 من العرض و3/4 من الارتفاع) واكتب الجزء المظلم، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('w1', 'half', w1) && <KnowledgeBrick id="juz-min-juz" lead="ما الذي يمثّله الركن الذي تغطّيه الستارتان معًا؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'من أين جاء المقام والبسط؟', subtitle: '$\\frac{1}{2}\\times\\frac{3}{5}$', done: answered('w2', 'num3', w2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="w2" ok={w2 && answered('w2', 'num3', w2)}
                done={m('في المهمة 2 كان المقام $10=2\\times 5$ والبسط $3=1\\times 3$ : $\\frac{1}{2}\\times\\frac{3}{5}=\\frac{3}{10}$ .')}
                todo="أنجز المهمة 2 (1/2 و3/5) واكتب الجزء المظلم، ثم أجب عن سؤالي المقام والبسط." />
            </div>
          ),
        },
        {
          num: 3, title: 'القاعدة', subtitle: '$\\frac{4}{5}\\times\\frac{2}{3}$', done: answered('w3', 'rule', w3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="w3" ok={w3 && answered('w3', 'rule', w3)}
                done={m('في المهمة 3 كانت $5\\times 3=15$ مربّعًا صغيرًا وكان $4\\times 2=8$ منها مظلمة: $\\frac{4}{5}\\times\\frac{2}{3}=\\frac{8}{15}$ .')}
                todo="أنجز المهمة 3 (4/5 و2/3) ثم أجب عن السؤال الأخير عن القاعدة." />
              {answered('w3', 'rule', w3) && <KnowledgeBrick id="qaida-jida" lead="كيف نحسب جداء كسرين؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'جداء أكبر من نافذة', subtitle: '$\\frac{7}{4}\\times\\frac{4}{3}$', done: answered('a3', 'whyBig', a3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a3" ok={a3 && answered('a3', 'whyBig', a3)}
                done={m('في المستوى المتقدّم تغطّي الستارتان $\\frac{7}{4}$ و $\\frac{4}{3}$ نافذة: الركن المظلم $\\frac{28}{12}=\\frac{7}{3}$ نافذة، أكبر من $1$ .')}
                todo="في المستوى المتقدّم: أنجز المهمة 3 (7/4 و4/3 على واجهة الأربع نوافذ) ثم أجب عن السؤال فوق المختبر." />
              {answered('a3', 'whyBig', a3) && <KnowledgeBrick id="jida-akbar-min-wahid" lead="هل يكون الجداء أكبر من $1$ دائمًا؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'نافذتان كاملتان', subtitle: '$2\\times\\frac{3}{5}$', done: answered('a4', 'natural', a4),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a4" ok={a4 && answered('a4', 'natural', a4)}
                done={m('في المهمة 4 غطّت الستارة نافذتين كاملتين: الجداء $2\\times\\frac{3}{5}=\\frac{6}{5}$ ، وليس $\\frac{6}{10}$ .')}
                todo="في المستوى المتقدّم: أنجز المهمة 4 (نافذتان كاملتان و3/5) ثم أجب عن السؤال فوق المختبر." />
              {answered('a4', 'natural', a4) && <KnowledgeBrick id="adad-fi-kasr" lead="كيف نضرب عددًا طبيعيًا في كسر؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
