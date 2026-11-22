import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « حمولة الجسر ». UNE SEULE PISTE (§4quater) : le labo `bridge-load` en haut, sans carte au-dessus — il porte son contexte et SA question ;
 * la main tient x et y, les NOMBRES de sacs posés sur le camion, l'élève charge, passe au pèse-camion, puis donne le verdict AVANT que la barrière ne bouge. Les questions sur ce que l'élève a FAIT (ce que l'écran a écrit, pourquoi 20 sacs ne passent pas,
 * combien d'inconnues, pour quelle charge les masses sont égales, combien de charges réfutent une affirmation, la règle, la différence entre < et ≤) sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`, chaînes
 * `BridgeLoad › CHAINS`) ; les étapes ci-dessous en gardent la TRACE (événements `checkpoint` du labo) puis posent les noms (briques). Si l'enseignant a coupé les questions pour son compte, une étape se valide dès que la tâche est résolue. LP : P1, P2, P3.
 */
export default function Module01Nashat() {
  const [tb, setTb] = useState([]);
  const [ta, setTa] = useState([]);
  const cpOn = useLabCheckpointSettings('bridge-load').enabled;
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
  const b1 = solved(tb, 0); const b2 = solved(tb, 1); const b3 = solved(tb, 2); const a1 = solved(ta, 0); const a2 = solved(ta, 1); const a3 = solved(ta, 2);

  return (
    <ContentModule
      objectives={['كيف أختبر مساواة أو متباينة من أجل قيمة؟', 'ماذا يحدث حين يعطي الطرفان العدد نفسه والرمز « أقلّ تمامًا »؟', 'كيف أتصرّف حين يكون في القاعدة مجهولان؟', 'كم مثالًا يكفي لإبطال ادّعاء؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — حمولة الجسر"
      moduleSubtitle="حمّل الشاحنة ومرّرها على الميزان ثمّ احكم"
      estimatedTime="18 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="bridge-load" level="beginner" onTrial={rec(setTb)} />,
            advanced: () => <Manipulation type="bridge-load" level="advanced" onTrial={rec(setTa)} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ما كتبه الميزان', subtitle: '$4000+50\\times15=4750$', done: answered('b1', 'why20', b1),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="b1" ok={b1 && answered('b1', 'why20', b1)}
                done={m('في المهمة 1 قرأتَ ما كتبه الميزان: عوّض عدد الأكياس في القاعدة وحسب الطرف، ثمّ قارن $4750$ بـ $5000$ ؛ ورأيتَ أنّ $20$ كيسًا تعطي $5000$ تمامًا فلم تعبر الشاحنة.')}
                todo="أنجز المهمة 1 (حمّل 15 كيسًا ثمّ 22، ثمّ الحمولات 18 و 19 و 20 و 21) وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('b1', 'why20', b1) && (
                <>
                  <KnowledgeBrick id="tawid-wa-hisab" lead="ماذا يفعل الميزان قبل أن يحكم؟" />
                  <KnowledgeBrick id="hadd" lead="وماذا عن الحمولة التي تعطي الحدّ نفسه؟" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'عددان مجهولان', subtitle: '$4500+50x+40y<7000$', done: answered('b2', 'unknowns', b2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="b2" ok={b2 && answered('b2', 'unknowns', b2)}
                done={m('في المهمة 2 حمّلتَ إسمنتًا ورملًا معًا: عوّضتَ $x$ و $y$ في القاعدة نفسها، ورأيتَ أنّ الحمولة التي تعطي $7000$ تمامًا لا تعبر.')}
                todo="أنجز المهمة 2 (إسمنت ورمل معًا) وأجب عن السؤال فوق المختبر." />
              {answered('b2', 'unknowns', b2) && <KnowledgeBrick id="majhulan" lead="كيف نعوّض في قاعدة فيها مجهولان؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'شاحنتان وحمولة واحدة', subtitle: '$3000+70x=3600+50x$', done: answered('b3', 'twenty', b3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="b3" ok={b3 && answered('b3', 'twenty', b3)}
                done={m('في المهمة 3 حمّلتَ الشاحنتين بالحمولة نفسها: تساوت كتلتاهما من أجل $x=30$ ($5100$ و $5100$) فقط، وبقيتا مختلفتين من أجل $20$ و $40$ .')}
                todo="أنجز المهمة 3 (شاحنتان وحمولة واحدة) وأجب عن السؤالين فوق المختبر." />
              {answered('b3', 'twenty', b3) && <KnowledgeBrick id="musawat-qima" lead="متى نقول إنّ المساواة صحيحة؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'حمولة واحدة تكفي', subtitle: '$x=31$ : $5170>5150$', done: answered('a2', 'rule', a2) && answered('a1', 'howmany', a1),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a1" ok={a1 && a2 && answered('a2', 'rule', a2) && answered('a1', 'howmany', a1)}
                done={m('في المستوى المتقدّم أبطلتَ ادّعاء « A أخفّ من B دائمًا » بحمولة واحدة، ورأيتَ أنّ عبارتين متساويتين من أجل $x=10$ تختلفان من أجل $x=0$ .')}
                todo="في المستوى المتقدّم: أنجز المهمتين 1 و 2 (اكتب الكتلتين ثمّ ابحث عن حمولة تبطل الادّعاء) وأجب عن السؤالين فوق المختبر." />
              {answered('a2', 'rule', a2) && answered('a1', 'howmany', a1) && <KnowledgeBrick id="mithal-mudad" lead="كم مثالًا يكفي لإبطال ادّعاء؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'اللافتة « أقلّ من أو يساوي »', subtitle: '$\\le7000$', done: answered('a3', 'diff', a3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a3" ok={a3 && answered('a3', 'diff', a3)}
                done={m('في المهمة 3 من المستوى المتقدّم كانت اللافتة $\\le7000$ ، فمرّت الشاحنة التي كتلتها $7000$ تمامًا، وهي ما كان الرمز $<$ يرفضه.')}
                todo="في المستوى المتقدّم: أنجز المهمة 3 (اللافتة « أقلّ من أو يساوي ») وأجب عن السؤال فوق المختبر." />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
