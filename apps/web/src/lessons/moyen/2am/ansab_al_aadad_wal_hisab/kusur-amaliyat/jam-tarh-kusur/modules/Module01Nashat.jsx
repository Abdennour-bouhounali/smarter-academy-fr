import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « عدّاد المسلك ». UNE SEULE PISTE (§4quater) : le labo `trail-odometer` en haut, sans carte au-dessus — il porte
 * son contexte et SA question ; la main tient la DISTANCE marchée (en poteaux blancs) et écrit où est le groupe. Les questions sur ce que l'élève a FAIT (combien de blancs, quelle fraction, combien reste-t-il,
 * pourquoi 6/16 est impossible, comment on soustrait, pourquoi 1 + 5/6 n'est pas 6/6) sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`, chaînes `TrailOdometer › CHAINS`) ; les étapes
 * ci-dessous en gardent la TRACE (événements `checkpoint` du labo) puis posent les noms (briques). Si l'enseignant a coupé les questions pour son compte, une étape se valide dès que l'essai existe. LP : P1, P2, P3.
 */
export default function Module01Nashat() {
  const [tb, setTb] = useState([]);
  const [ta, setTa] = useState([]);
  const cpOn = useLabCheckpointSettings('trail-odometer').enabled;
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
  const g1 = solved(tb, 0); const g2 = solved(tb, 1); const g3 = solved(tb, 2); const a4 = solved(ta, 3);

  return (
    <ContentModule
      objectives={['كيف أجمع أجزاءً من الحجم نفسه؟', 'ماذا أفعل حين تُكتب المرحلة بأعمدة حمراء؟', 'كيف أحسب ما بقي إلى العين؟', 'كيف أطرح، وكيف أضيف دورة كاملة إلى كسر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — عدّاد المسلك"
      moduleSubtitle="امشِ بالفوج ثم اكتب أين وصل"
      estimatedTime="20 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="trail-odometer" level="beginner" onTrial={rec(setTb)} />,
            advanced: () => <Manipulation type="trail-odometer" level="advanced" onTrial={rec(setTa)} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'جمع أجزاء من الحجم نفسه', subtitle: 'الأعمدة البيضاء', done: answered('g1', 'rest', g1),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="g1" ok={g1 && answered('g1', 'rest', g1)}
                done={m('في المهمة 1 مشى الفوج $5$ أعمدة بيضاء ثم $4$ أعمدة: أجزاء من الحجم نفسه، فبقي المقام $12$ وجمعنا البسطين.')}
                todo="أنجز المهمة 1 (5/12 ثم 4/12) واكتب أين وصل الفوج، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('g1', 'rest', g1) && <KnowledgeBrick id="nafs-al-maqam" lead="ماذا نفعل بالمقام حين نجمع أجزاء من الحجم نفسه؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'المرحلة الحمراء بأعمدة بيضاء', subtitle: '$\\frac{1}{4}=\\frac{3}{12}$', done: answered('g2', 'whyNo', g2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="g2" ok={g2 && answered('g2', 'whyNo', g2)}
                done={m('في المهمة 2 كانت المرحلة الثانية ربع المسلك: وجدتَ أنّها $3$ أعمدة بيضاء، ثم رفضتَ $\\frac{6}{16}$ لأنّ رايتها تقع قبل الفوج.')}
                todo="أنجز المهمة 2 (5/12 ثم ربع المسلك) واكتب أين وصل الفوج، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('g2', 'whyNo', g2) && <KnowledgeBrick id="tawhid-mudaaf" lead="كيف نكتب ربع المسلك بالأعمدة البيضاء؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كم بقي إلى العين؟', subtitle: 'الباقي من الكلّ', done: answered('g1', 'rest', g1) && answered('g2', 'whyNo', g2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="baqi" ok={g1 && answered('g1', 'rest', g1)}
                done={m('في المهمة 1 بقي $3$ أعمدة بيضاء من $12$ بعد أن مشى الفوج $9$ : $\\frac{12}{12}-\\frac{9}{12}=\\frac{3}{12}$ .')}
                todo="أجب عن سؤال «كم بقي إلى العين؟» فوق المختبر بعد المهمة 1." />
              {answered('g1', 'rest', g1) && <KnowledgeBrick id="al-baqi" lead="كيف نجد ما بقي من الكلّ؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'العودة تطرح', subtitle: '$\\frac{3}{4}-\\frac{5}{12}$', done: answered('g3', 'rule', g3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="g3" ok={g3 && answered('g3', 'rule', g3)}
                done={m('في المهمة 3 كان الفوج عند $9$ أعمدة بيضاء ($\\frac{3}{4}$) ثم عاد $5$ أعمدة: بقيت $4$ أعمدة، أي $\\frac{4}{12}=\\frac{1}{3}$ .')}
                todo="أنجز المهمة 3 (الرجوع من 3/4 بمقدار 5/12) ثم أجب عن السؤال الأخير عن القاعدة." />
              {answered('g3', 'rule', g3) && <KnowledgeBrick id="tarh-kajam" lead="كيف نطرح كسرين مقام أحدهما مضاعف لمقام الآخر؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'دورة كاملة وجزء من دورة', subtitle: '$1+\\frac{5}{6}$', done: answered('a4', 'ruleMulti', a4),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a4" ok={a4 && answered('a4', 'ruleMulti', a4)}
                done={m('في المستوى المتقدّم دار الفوج دورة كاملة ثم $5$ أعمدة: العدّاد قرأ $11$ عمودًا أبيض، أي $\\frac{11}{6}$ لا $\\frac{6}{6}$ .')}
                todo="في المستوى المتقدّم: أنجز المهمة 4 (دورة كاملة ثم 5/6 من دورة ثانية) ثم أجب عن الأسئلة فوق المختبر." />
              {answered('a4', 'ruleMulti', a4) && <KnowledgeBrick id="adad-tabii-kasr" lead="كيف نكتب عددًا طبيعيًا مع كسر؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
