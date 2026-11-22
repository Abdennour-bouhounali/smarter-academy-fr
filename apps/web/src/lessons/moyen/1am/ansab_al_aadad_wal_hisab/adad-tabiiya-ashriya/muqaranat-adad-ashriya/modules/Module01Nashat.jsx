import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la piste de saut en longueur. UNE SEULE
 * PISTE (§4quater) : le labo `ruler-compare` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient la
 * GRADUATION de la règle.
 *   مبتدئ — quatre comparaisons de sauts : 4,6 / 4,35 (le piège « 35 > 6 »), 8,05 / 8,5, 12,70 / 12,7, 9,87 / 10,2 ;
 *   متقدم — ranger deux suites sur le podium.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES nombres : pourquoi « 35 > 6 » ne tient pas (P1/P2), ce qui a décidé entre 8,05
 * et 8,5 (P1), 12,70 et 12,7 (P2), quelle règle a suffi pour 9,87 et 10,2 (P1), le premier de la suite (P3). Les noms (briques) viennent
 * APRÈS la réponse. Le نشاط 5 du manuel est posé en application au module 4.
 * Déploiement du prototype (2026-10-28) : les questions des quatre comparaisons (lecture, graduation, le 0 final, la règle) sont posées
 * PAR-DESSUS le labo après chaque tâche (`RulerCompare › chainOf`) ; les étapes 1–4 en gardent la TRACE (`checkpoint-done`) puis posent
 * les noms. La question du podium (متقدم) reste posable ici pour qui n'a pas fait ce niveau.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;
const GRAD = ['المتر', 'الديسيمتر', 'السنتيمتر', 'الميليمتر'];

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q5, setQ5] = useState(false);
  // La demande libre (« جرّب أعدادك ») n'est jamais une preuve.
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const verdictFor = (a, b) => trials.find((e) => e.event === 'verdict' && e.ok && ((e.a === a && e.b === b) || (e.a === b && e.b === a)));
  const orderDone = trials.some((e) => e.kind === 'order' && e.ok && e.event === 'check');
  const where = (v) => (v && Number.isInteger(v.g) ? <span>على مسطرة {GRAD[v.g]}</span> : null);

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  const v1 = verdictFor('4,6', '4,35');
  const v2 = verdictFor('8,05', '8,5');
  const v3 = verdictFor('12,70', '12,7');
  const v4 = verdictFor('9,87', '10,2');
  // les questions posées PAR-DESSUS le labo : une suite est finie (`checkpoint-done`) juste après la réussite de SA tâche
  const answeredAfter = (test) => trials.some((e, j) => e.tk === 'checkpoint-done' && test(trials.slice(0, j).findLast((x) => !x.tk && x.ok && (x.event === 'verdict' || x.event === 'check'))));
  const pair = (a, b) => (x) => !!x && ((x.a === a && x.b === b) || (x.a === b && x.b === a));
  const q1 = answeredAfter(pair('4,6', '4,35'));
  const q2 = answeredAfter(pair('8,05', '8,5'));
  const q3 = answeredAfter(pair('12,70', '12,7'));
  const q4 = answeredAfter(pair('9,87', '10,2'));
  const inLabOrder = answeredAfter((x) => !!x && x.event === 'check');

  return (
    <ContentModule
      objectives={['لماذا لا يكون 4,35 أبعد من 4,6؟', 'كيف نقارن 8,05 و 8,5؟', 'متى يكفي الجزء الصحيح للحكم؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — القفز الطويل"
      moduleSubtitle="قفزتان تفصل بينهما المسطرة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="ruler-compare" level="beginner" world="jump" tasks={LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="ruler-compare" level="advanced" world="jump" tasks={LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا لم يكن 4,35 أبعد؟', subtitle: 'قفزتان: 4,6 م و 4,35 م', done: q1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="first-jump" ok={!!v1}
                done={<span>حكمتَ بين <Ltr>4,6</Ltr> و <Ltr>4,35</Ltr> {where(v1)}.</span>}
                todo="احكم بين القفزتين الأوليين في المستوى المبتدئ (4,6 و 4,35) وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q1 && <KnowledgeBrick id="taqarun-rutab" lead="في 4,6 و 4,35: بأيّ رتبة بدأتَ المقارنة، وما الذي حسم؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما الذي حسم بين 8,05 و 8,5؟', subtitle: 'رقم أكثر ومع ذلك أصغر', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="second-jump" ok={!!v2}
                done={<span>حكمتَ بين <Ltr>8,05</Ltr> و <Ltr>8,5</Ltr> {where(v2)}.</span>}
                todo="احكم بين القفزتين الثانيتين في المستوى المبتدئ (8,05 و 8,5) وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 3, title: 'هل فصلت المسطرة بين 12,70 و 12,7؟', subtitle: 'كتابتان لقفزة واحدة', done: q3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="third-jump" ok={!!v3}
                done={<span>حكمتَ بين <Ltr>12,70</Ltr> و <Ltr>12,7</Ltr> {where(v3)}.</span>}
                todo="احكم بين القفزتين الثالثتين في المستوى المبتدئ (12,70 و 12,7) وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q3 && <KnowledgeBrick id="itmam-asfar" lead="12,70 و 12,7 يُقرآن بالعدد نفسه: كيف نستعمل ذلك لنقارن 4,6 و 4,35؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'أيّ مسطرة تكفي بين 9,87 و 10,2؟', subtitle: 'الجزء الصحيح', done: q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="fourth-jump" ok={!!v4}
                done={<span>حكمتَ بين <Ltr>9,87</Ltr> و <Ltr>10,2</Ltr> {where(v4)}.</span>}
                todo="احكم بين القفزتين الرابعتين في المستوى المبتدئ (9,87 و 10,2) وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 5, title: 'من يتصدّر المنصّة؟', subtitle: 'ترتيب خمس قفزات', done: q5 || inLabOrder,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="podium" ok={orderDone}
                done={<span>رتّبتَ قفزات المنصّة ترتيبًا صحيحًا.</span>}
                todo="جرّب المستوى المتقدّم: ضع القفزات الخمس على المنصّة وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {!inLabOrder && (
              <TapQuestion
                prompt={<span>في السلسلة <Ltr>7,4</Ltr> ؛ <Ltr>7,04</Ltr> ؛ <Ltr>7,45</Ltr> ؛ <Ltr>6,98</Ltr> ؛ <Ltr>7,405</Ltr> : أيّ قفزة تأتي أولًا في الترتيب من الأقصر إلى الأبعد؟</span>}
                options={[M('6,98 لأنّ جزأها الصحيح أصغر'), M('7,04 لأنّ رقم أعشارها 0'), M('7,4 لأنّها أقصر كتابةً')]}
                correct={0} cols={1} requires={['itmam-asfar']}
                explain={<MathText>{'$6<7$ ، فالقفزة $6{,}98$ أقصر من كل قفزة جزؤها الصحيح 7؛ وبين الأربع الباقية نفصل بالأعشار ثم بالأجزاء من مائة.'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              )}
              {(q5 || inLabOrder) && <KnowledgeBrick id="tartib-silsila" lead="خمس قفزات على المنصّة: كيف تقرّر أيّ قفزتين تتجاوران؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
