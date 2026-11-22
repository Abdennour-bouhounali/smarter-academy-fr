import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « ليزر المستوى ». UNE SEULE PISTE (§4quater) : le labo `level-laser` en haut, sans carte au-dessus — il porte son
 * contexte et SA question ; la main tient la HAUTEUR du laser, lue dans deux graduations. Les questions sur ce que l'élève a FAIT (combien de crans, quel tube est plus haut, à quel cran le laser coupe l'autre tube,
 * quels crans sont plus petits, quand un réservoir dépasse 1) sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`, chaînes `LevelLaser › CHAINS`) ; les étapes ci-dessous en gardent la TRACE
 * (événements `checkpoint` du labo) puis posent les noms (briques). Si l'enseignant a coupé les questions pour son compte, une étape se valide dès que la tâche est résolue. LP : P1, P2, P3, P4.
 */
export default function Module01Nashat() {
  const [tb, setTb] = useState([]);
  const [ta, setTa] = useState([]);
  const cpOn = useLabCheckpointSettings('level-laser').enabled;
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
  const l1 = solved(tb, 0); const l2 = solved(tb, 1); const l3 = solved(tb, 2); const l4 = solved(tb, 3);

  return (
    <ContentModule
      objectives={['كيف أقارن كسرين لهما نفس المقام؟', 'وكيف أقارن كسرين مقام أحدهما مضاعف للآخر؟', 'وماذا إذا كان لهما نفس البسط؟', 'ومتى يكون الكسر أكبر من $1$ ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — ليزر المستوى"
      moduleSubtitle="اقرأ الارتفاع نفسه في أنبوبين ثم قارن"
      estimatedTime="23 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="level-laser" level="beginner" onTrial={rec(setTb)} />,
            advanced: () => <Manipulation type="level-laser" level="advanced" onTrial={rec(setTa)} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'نفس العلامات', subtitle: '$\\frac{5}{8}$ و $\\frac{7}{8}$', done: answered('l1', 'why', l1),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="l1" ok={l1 && answered('l1', 'why', l1)}
                done={m('في المهمة 1 كان في كلّ أنبوب $8$ علامات، وزيت الأيمن $7$ منها وزيت الأيسر $5$ : $\\frac{5}{8}<\\frac{7}{8}$ .')}
                todo="أنجز المهمة 1 (5/8 و7/8) ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('l1', 'why', l1) && <KnowledgeBrick id="nafs-al-maqam" lead="متى نكتفي بمقارنة البسطين؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الارتفاع نفسه في أنبوبين', subtitle: '$\\frac{3}{4}$ و $\\frac{7}{12}$', done: answered('l2', 'small', l2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="l2" ok={l2 && answered('l2', 'small', l2)}
                done={m('في المهمة 2 قطع الليزر عند زيت الأيسر الأنبوب الأيمن عند العلامة $9$ من $12$ : $\\frac{3}{4}=\\frac{9}{12}$ ، و $\\frac{7}{12}<\\frac{9}{12}$ .')}
                todo="أنجز المهمة 2 (3/4 و7/12): حرّك الليزر، اكتب كسر الأيسر بالاثني عشريات، ثم أجب عن الأسئلة." />
              {answered('l2', 'small', l2) && <KnowledgeBrick id="tawhid-li-muqarana" lead="كيف نقارن حين يختلف المقامان؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'نفس عدد العلامات المملوءة', subtitle: '$\\frac{3}{5}$ و $\\frac{3}{8}$', done: answered('l3', 'threeMarks', l3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="l3" ok={l3 && answered('l3', 'threeMarks', l3)}
                done={m('في المهمة 3 كان زيت كلّ خزّان $3$ علامات، لكنّ علامات الأنبوب الأيمن أصغر: $\\frac{3}{8}<\\frac{3}{5}$ .')}
                todo="أنجز المهمة 3 (3/5 و3/8) ثم أجب عن سؤالي العلامات." />
              {answered('l3', 'threeMarks', l3) && <KnowledgeBrick id="nafs-al-bast" lead="ماذا يحدث حين يتساوى البسط؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'خطّ الامتلاء', subtitle: '$\\frac{9}{8}$ و $\\frac{5}{6}$', done: answered('l4', 'rule', l4),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="l4" ok={l4 && answered('l4', 'above1', l4)}
                done={m('في المهمة 4 زاد زيت الأيسر على خطّ الامتلاء: $\\frac{9}{8}>1$ ، وبقي زيت الأيمن تحته: $\\frac{5}{6}<1$ .')}
                todo="أنجز المهمة 4 (9/8 و5/6) وانظر إلى خطّ الامتلاء 1 ، ثم أجب عن الأسئلة." />
              {answered('l4', 'above1', l4) && <KnowledgeBrick id="muqarana-bi-1" lead="متى يكون الكسر أكبر من 1 ؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
