import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la « مسطرة الكورنيش ». UNE SEULE PISTE
 * (§4quater) : le labo `corniche-ruler` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient l'ORIGINE (le drapeau « 0 »)
 * à مبتدئ et la VALEUR D'UNE GRADUATION (le levier) à متقدم.
 *   مبتدئ — b1 lire +30 et −20 ; b2 amener le « 0 » sous le banc : le kiosque change de nombre ; b3 deux repères d'abscisses opposées ; b4 un arrêt entre deux graduations ;
 *   متقدم — a1–a3 : choisir la graduation (25, 0,1, 100) puis toucher.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES essais. Les noms (briques) viennent APRÈS la réponse. Le نشاط 1 du manuel (frise de monuments) est posé en
 * application au module 4. Prototype (2026-10-28) : les questions sont posées PAR-DESSUS le labo après chaque tâche (`CornicheRuler › CHAINS`) ; les étapes en gardent
 * la TRACE (`checkpoint-done` des tâches b1, b2, b3, b4, a3) puis posent les noms.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const readOk = (task, landmark) => trials.findLast((e) => e.kind === 'read' && e.ok && e.task === task && (!landmark || e.landmark === landmark));
  const r1 = readOk(0, 'kiosk');
  const r2 = readOk(1, 'kiosk');
  const opp = trials.findLast((e) => e.kind === 'pin' && e.ok === true);
  const stepOk = trials.findLast((e) => e.kind === 'step' && e.ok);
  const q1 = answered('b1');
  const q2 = answered('b2');
  const q3 = answered('b3');
  const q4 = answered('b4');
  const q5 = answered('a3');

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف نقرأ فاصلة معلم على اللوحة؟', 'ماذا يحدث لفاصلة معلم إذا نقلنا دبّوس الصفر؟', 'متى تكون فاصلتان متعاكستين؟', 'كيف نختار قيمة التدريجة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مسطرة الكورنيش"
      moduleSubtitle="دبّوس الصفر وقيمة التدريجة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="corniche-ruler" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="corniche-ruler" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كيف قرأتَ فاصلة الكشك؟', subtitle: 'عدّ التدريجات', done: q1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="read" ok={q1 && !!r1}
                done={<span>فاصلة كشك المثلّجات كانت <Ltr>{r1?.value}</Ltr> : عدد التدريجات من الدبّوس مضروبًا في قيمة التدريجة.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الأولى (اكتب فاصلتين)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q1 && <KnowledgeBrick id="faasila" lead="كيف نعرف فاصلة معلم على اللوحة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا تغيّرت الفاصلة؟', subtitle: 'نقل المبدأ', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="move" ok={q2 && !!r2}
                done={<span>بعد نقل الدبّوس صارت فاصلة الكشك <Ltr>{r2?.value}</Ltr> بدل <Ltr>30</Ltr> مع أنّه لم يتحرّك.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الثانية (انقل الصفر إلى المقعد)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q2 && <KnowledgeBrick id="faasila-tataghayyar" lead="ماذا تفعل فاصلة معلم إذا انتقل المبدأ؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'متى تكون فاصلتان متعاكستين؟', subtitle: 'المسافة نفسها من جهتين', done: q3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="opp" ok={q3 && !!opp}
                done={<span>وضعتَ الصفر حيث صارت فاصلتا عمود الإنارة والنخلة <Ltr>{opp?.a}</Ltr> و <Ltr>{opp?.b}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الثالثة (فاصلتان متعاكستان)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q3 && <KnowledgeBrick id="mutaakisan" lead="متى تكون لمعلمين فاصلتان متعاكستان؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'أين وقع موقف الحافلة؟', subtitle: 'بين تدريجتين', done: q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="between" ok={q4}
                done={<span>موقف الحافلة لا يقع على تدريجة: قرأتَ فاصلته من منتصف الفاصل بين تدريجتين.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الرابعة (موقف بين تدريجتين)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 5, title: 'كيف اخترتَ قيمة التدريجة؟', subtitle: 'اللوحة والنقط', done: q5,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="step" ok={q5 && !!stepOk}
                done={<span>قيمة التدريجة <Ltr>{stepOk?.step} m</Ltr> أبقت كل النقط داخل اللوحة وعلى تدريجات.</span>}
                todo="أنجز في المستوى المتقدّم المهام الثلاث (اختر قيمة التدريجة ثم المس تدريجات النقط)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q5 && <KnowledgeBrick id="ikhtiyar-tadrij" lead="كيف نختار قيمة التدريجة التي تناسب نقطًا معلومة؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
