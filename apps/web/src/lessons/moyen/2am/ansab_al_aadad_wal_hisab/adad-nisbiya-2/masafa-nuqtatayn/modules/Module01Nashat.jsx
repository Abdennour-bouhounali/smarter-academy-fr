import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le « مسماك الفرق ». UNE SEULE PISTE (§4quater) : le labo `gap-caliper` en haut, sans carte au-dessus —
 * il porte son contexte et SA question ; la main tient l'OUVERTURE d'un compas serré sur une graine d'un thermomètre géant.
 *   مبتدئ — g1 −4 et +9 (le compas traverse le zéro : 13), g2 −7 et −2 (5), g3 +3 et +11 (8), g4 −6 et 0 (6, la règle) ;
 *   متقدم — a1 écrire l'ouverture AVANT la vis (8,5), a2 une ouverture fixe balancée vers le haut puis vers le bas (deux points), a3 le compas serré sur la graine du HAUT (AB = BA).
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES nombres. Les noms (briques) viennent APRÈS la réponse. Le نشاط 5 du manuel (mesurer quatre segments puis conjecturer) est posé en
 * application au module 4. Prototype (2026-10-28) : les questions sont posées PAR-DESSUS le labo après chaque tâche (`GapCaliper › CHAINS`) ; les étapes en gardent la TRACE (`checkpoint-done`).
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const said = (task) => trials.findLast((e) => e.kind === 'say' && e.ok === true && e.task === task);
  const pred = (task) => trials.findLast((e) => e.kind === 'predict' && e.ok === true && e.task === task);
  const found = (dir) => trials.findLast((e) => e.kind === 'found' && e.ok === true && e.dir === dir);
  const q = Object.fromEntries(['g1', 'g2', 'g3', 'g4', 'a1', 'a2', 'a3'].map((id) => [id, answered(id)]));

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كم تكون المسافة بين خرزتين على جانبي الصفر؟', 'وكم إذا كانتا في جهة واحدة من الصفر؟', 'ما العملية التي تعطي المسافة دائمًا؟', 'هل تكون المسافة سالبة؟ وكم نقطة تبعد مسافة معلومة عن نقطة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مسماك الفرق"
      moduleSubtitle="فتحة المسماك هي المسافة"
      estimatedTime="18 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="gap-caliper" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="gap-caliper" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا فتحة المسماك أكبر من الفرق بين الرقمين؟', subtitle: 'خرزتان على جانبي الصفر', done: q.g1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="cross" ok={q.g1 && !!said(0)}
                done={<span>من <Ltr>−4</Ltr> إلى <Ltr>+9</Ltr> عبر المسماك الصفر، فكانت الفتحة <Ltr>{said(0)?.value}</Ltr> : <Ltr>4</Ltr> تحت الصفر و <Ltr>9</Ltr> فوقه.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الأولى (الجلفة)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.g1 && <KnowledgeBrick id="masafa-abr-sifr" lead="كم تكون المسافة بين نقطتين على جانبي الصفر؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وإذا كانت الخرزتان سالبتين؟', subtitle: 'جهة واحدة من الصفر', done: q.g2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="same" ok={q.g2 && !!said(1)}
                done={<span>بين <Ltr>−7</Ltr> و <Ltr>−2</Ltr> كانت الفتحة <Ltr>{said(1)?.value}</Ltr> : الخرزتان تحت الصفر، فنقصت الصغرى من الكبرى.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الثانية (سطيف وباتنة)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.g2 && <KnowledgeBrick id="masafa-nafs-jiha" lead="كم تكون المسافة بين نقطتين في جهة واحدة من الصفر؟" requires={['masafa-abr-sifr']} />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل الحساب نفسه إذا كانت الخرزتان موجبتين؟', subtitle: 'مسافة بين عددين موجبين', done: q.g3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="pos" ok={q.g3 && !!said(2)}
                done={<span>بين <Ltr>+3</Ltr> و <Ltr>+11</Ltr> كانت الفتحة <Ltr>{said(2)?.value}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الثالثة (وهران وتمنراست)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 4, title: 'أيّ عملية تعطي المسافة في الحالات الأربع؟', subtitle: 'الحالات الأربع', done: q.g4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="rule" ok={q.g4 && !!said(3)}
                done={<span>في الحالات الأربع (<Ltr>13</Ltr> ، <Ltr>5</Ltr> ، <Ltr>8</Ltr> ، <Ltr>{said(3)?.value}</Ltr>) كانت الفتحة الفاصلة الكبرى ناقص الفاصلة الصغرى.</span>}
                todo="أنجز في المستوى المبتدئ المهمّة الرابعة (الجلفة والعاصمة)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.g4 && <KnowledgeBrick id="qaidat-masafa" lead="كيف نحسب المسافة بين نقطتين من فاصلتيهما؟" requires={['masafa-abr-sifr', 'masafa-nafs-jiha']} />}
            </div>
          ),
        },
        {
          num: 5, title: 'هل أصبتَ الفتحة قبل أن تدير البرغي؟', subtitle: 'أكتب ثم أتحقّق', done: q.a1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="predict" ok={q.a1 && !!pred(0)}
                done={<span>كتبتَ <Ltr>{pred(0)?.value}</Ltr> قبل أن تدير البرغي فلمس المسماك الخرزة: الفاصلة الكبرى ناقص الصغرى تكفي.</span>}
                todo="أنجز في المستوى المتقدّم المهمّة الأولى (اكتب الفتحة ثم افتح)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 6, title: 'كم نقطة على بعد معلوم من نقطة؟', subtitle: 'فتحة ثابتة وجهتان', done: q.a2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="two" ok={q.a2 && !!found('up') && !!found('down')}
                done={<span>بفتحة ثابتة <Ltr>4</Ltr> حول <Ltr>+1,5</Ltr> وجدتَ نقطتين: <Ltr>{found('up')?.value}</Ltr> إلى الأعلى و <Ltr>{found('down')?.value}</Ltr> إلى الأسفل.</span>}
                todo="أنجز في المستوى المتقدّم المهمّة الثانية (فتحة ثابتة)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.a2 && <KnowledgeBrick id="nuqtatan" lead="كم نقطة تبعد مسافة معلومة عن نقطة معلومة، وما فاصلتاهما؟" requires={['qaidat-masafa']} />}
            </div>
          ),
        },
        {
          num: 7, title: 'هل تغيّرت المسافة حين شددنا المسماك على الخرزة الأخرى؟', subtitle: 'AB = BA', done: q.a3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="swap" ok={q.a3 && !!pred(2)}
                done={<span>من الخرزة العليا إلى السفلى كتبتَ <Ltr>{pred(2)?.value}</Ltr> وهي الفتحة نفسها من السفلى إلى العليا.</span>}
                todo="أنجز في المستوى المتقدّم المهمّة الثالثة (المسماك على الخرزة العليا)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q.a3 && <KnowledgeBrick id="masafa-mujaba" lead="هل تكون المسافة سالبة؟ وهل تتغيّر إذا بدّلنا النقطتين؟" requires={['qaidat-masafa']} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
