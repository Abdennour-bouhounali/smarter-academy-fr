import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « خلايا الشمع ». UNE SEULE PISTE (§4quater) : le labo `wax-cells` en haut, sans carte au-dessus — il porte son contexte et SA question ;
 * la main tient n, le nombre de cellules du rang, puis écrit la règle avec une lettre. Les questions sur ce que l'élève a FAIT (combien de tiges la deuxième cellule ajoute-t-elle, pourquoi pas 6, ce qui se répète et ce qui reste seul, la valeur
 * pour 40, le plateau, les tiges partagées d'une bande, les deux écritures, les deux lettres) sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`, chaînes `WaxCells › CHAINS`) ; les étapes ci-dessous en gardent la TRACE
 * (événements `checkpoint` du labo) puis posent les noms (briques). Si l'enseignant a coupé les questions pour son compte, une étape se valide dès que la tâche est résolue. LP : P1, P2.
 */
export default function Module01Nashat() {
  const [tb, setTb] = useState([]);
  const [ta, setTa] = useState([]);
  const cpOn = useLabCheckpointSettings('wax-cells').enabled;
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
  const w1 = solved(tb, 0); const w2 = solved(tb, 1); const w3 = solved(tb, 2); const a1 = solved(ta, 0); const a2 = solved(ta, 1); const a3 = solved(ta, 2);

  return (
    <ContentModule
      objectives={['كم عودًا يحتاج صفّ من خلايا الشمع؟', 'كيف نكتب العدد بحرف حين لا نستطيع الرسم؟', 'وماذا تعطي القاعدة من أجل أربعين خلية؟', 'وماذا نفعل بحرفين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — خلايا الشمع"
      moduleSubtitle="ابنِ صفًّا ثم اكتب قاعدة عدد أعواده بحرف"
      estimatedTime="20 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="wax-cells" level="beginner" onTrial={rec(setTb)} />,
            advanced: () => <Manipulation type="wax-cells" level="advanced" onTrial={rec(setTa)} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ما تقوله الخلايا', subtitle: '$6$ ، $11$ ، $16$', done: answered('w1', 'why', w1),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="w1" ok={w1 && answered('w1', 'why', w1)}
                done={m('في المهمة 1 قرأتَ على اللوح $6$ ثم $11$ ثم $16$ عودًا: كلّ خلية جديدة أضافت $5$ أعواد فقط، لأنّها تشترك في عود مع جارتها.')}
                todo="أنجز المهمة 1 (صفّ من خلية ثم خليتين ثم ثلاث) ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 2, title: 'القاعدة بالحرف', subtitle: '$5n+1$', done: answered('w2', 'rule', w2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="w2" ok={w2 && answered('w2', 'rule', w2)}
                done={m('في المهمة 2 كتبتَ $5\\times n+1=5n+1$ : خمسة أعواد لكلّ خلية وعود أوّل وحده، والصفّ يوافقك في كلّ عمود رسمته.')}
                todo="أنجز المهمة 2: ابنِ أربعة صفوف ثم اكتب القاعدة بالحرف n ، وأجب عن الأسئلة فوق المختبر." />
              {answered('w2', 'rule', w2) && (
                <>
                  <KnowledgeBrick id="harf-yaud" lead="ماذا يمثّل الحرف $n$ في القاعدة؟" />
                  <KnowledgeBrick id="qaida-5n1" lead="كيف نكتب عدد أعواد صفّ من $n$ خلية؟" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'قيمة العبارة', subtitle: '$5\\times 40+1$', done: answered('w3', 'tray', w3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="w3" ok={w3 && answered('w3', 'tray', w3)}
                done={m('في المهمة 3 لم يتّسع الإطار لأربعين خلية فحسبتَ بالقاعدة: $5\\times 40+1=201$ عودًا، وهو أكثر من $50$ عودًا في الصينية.')}
                todo="أنجز المهمة 3: اكتب القاعدة ثم احسب بها عدد الأعواد لأربعين خلية، وأجب عن سؤالي الصينية." />
              {answered('w3', 'tray', w3) && <KnowledgeBrick id="qima-40" lead="كيف نحسب قيمة العبارة من أجل $n=40$ ؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'شريط وكتابتان', subtitle: '$8n+3$', done: answered('a2', 'same', a2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a2" ok={a1 && a2 && answered('a2', 'same', a2)}
                done={m('في المستوى المتقدّم وجدتَ $8n+3$ لشريط من صفّين، ثم رأيتَ كتابة رانيا $6+5(n-1)$ وكتابة ياسين $5n+1$ تعطيان الجدول نفسه في كلّ الأعمدة التي رسمتها.')}
                todo="في المستوى المتقدّم: أنجز المهمتين 1 و 2 (الشريط ثم مقارنة الكتابتين) وأجب عن السؤالين فوق المختبر." />
              {answered('a2', 'same', a2) && <KnowledgeBrick id="kitabatan" lead="ماذا نلاحظ حين نكتب العدد نفسه بطريقتين؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'حرفان', subtitle: '$5n+1+8m+3$', done: answered('a3', 'val', a3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a3" ok={a3 && answered('a3', 'val', a3)}
                done={m('في المهمة 3 من المستوى المتقدّم كتبتَ $5n+1+8m+3$ وعوّضتَ $n=6$ و $m=4$ : $31+35=66$ عودًا.')}
                todo="في المستوى المتقدّم: أنجز المهمة 3 (صفّ وشريط) ثم أجب عن السؤالين فوق المختبر." />
              {answered('a3', 'val', a3) && <KnowledgeBrick id="harfan" lead="كيف نكتب عبارة بحرفين؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
