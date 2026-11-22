import { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le شريط المصعد. UNE SEULE PISTE
 * (§4quater) : le labo `elevator-reel` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient le TEMPS t
 * (et, en متقدم, la vitesse). Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES missions : l'écriture d'une descente (P1), ce que
 * donne un temps négatif pour un ascenseur qui descend (le choc), les signes de son سجلّ (P2). Le nom (brique + encadré) vient APRÈS
 * la réponse. Le puits et l'escalator du manuel sont posés en application au module 4.
 * Déploiement du prototype (2026-10-28) : les questions sur ce que l'élève a FAIT (l'écriture de la descente, « avant le passage », les signes
 * du سجلّ, la règle) sont posées PAR-DESSUS le labo après chaque mission (`ElevatorReel › CHAINS`) ; les étapes 1 à 3 en gardent la TRACE
 * (`checkpoint-done`) puis posent les noms. L'étape 4 (sans labo) reste une question d'étape.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa mission l'est
  const asked = (...ids) => trials.some((e) => e.tk === 'checkpoint-done' && ids.includes(e.id));
  const record = (e) => setTrials((list) => [...list, e]);
  const solvedOf = (id) => trials.findLast((e) => e.kind === 'release' && !e.free && e.taskId === id && e.ok);
  const m1 = solvedOf('m1');
  const m2 = solvedOf('m2');
  const rows = ['m1', 'm2', 'm3', 'm4'].map(solvedOf).filter(Boolean);

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف نكتب نزول المصعد؟', 'أين تكون الكابينة قبل مرورها بالطابق الأرضي؟', 'متى يكون الطابق موجبًا؟', 'أين كان مصعد آخر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — شريط المصعد"
      moduleSubtitle="تسجيل يُعاد إلى الأمام وإلى الخلف"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="elevator-reel" level="beginner" step={LAB.beginner.step} tasks={LAB.beginner.tasks} onTrial={record} />,
            advanced: () => <Manipulation type="elevator-reel" level="advanced" step={LAB.advanced.step} tasks={LAB.advanced.tasks} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كيف نكتب نزول المصعد؟', subtitle: 'ثلاث دقائق من النزول', done: asked('m1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="m1" ok={asked('m1') && !!m1}
                done={<span>أجبتَ في المختبر: بعد <Ltr>{m1?.t}</Ltr> دقائق كان المصعد النازل في الطابق <Ltr>{m1?.floor}</Ltr> ، أي <MathText>{'$(-2) + (-2) + (-2) = (-2) \\times 3 = -6$'}</MathText> .</span>}
                todo="أنجز المهمة الأولى في المختبر أعلاه (الطابق −6)، وأجب عن الأسئلة التي تظهر فوقه." />
              {asked('m1') && <KnowledgeBrick id="jidaa-jamaa" lead="جمع متكرر لحد سالب: كيف نكتبه، وما إشارة الناتج؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'أين كان المصعد النازل قبل مروره؟', subtitle: 'تسجيل يُعاد إلى الخلف', done: asked('m2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="m2" ok={asked('m2') && !!m2}
                done={<span>أجبتَ في المختبر: عند الدقيقة <Ltr>{m2?.t}</Ltr> ، قبل مروره بالطابق الأرضي، كان المصعد النازل في الطابق <Ltr>{m2?.floor}</Ltr> فوق الشارع، و <MathText>{'$(-2) \\times (-2) = 4$'}</MathText> .</span>}
                todo="أنجز المهمة الثالثة في المختبر أعلاه (الطابق 4)، وأجب عن الأسئلة التي تظهر فوقه." />
            </div>
          ),
        },
        {
          num: 3, title: 'متى يكون الطابق موجبًا؟', subtitle: 'أسطر سجلّك', done: asked('m4', 'a4'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="rows" ok={asked('m4', 'a4') && rows.length >= 3}
                done={<span>أجبتَ في المختبر عن أسطر سجلّك — {rows.map((x) => <span key={x.taskId} className="me-2">(<Ltr>{x.r}</Ltr> ; <Ltr>{x.t}</Ltr> ; <Ltr>{x.floor}</Ltr>)</span>)}: الطابق موجب حين يكون للسرعة والزمن الإشارة نفسها.</span>}
                todo="أنجز مهام المختبر حتى الأخيرة، وأجب عن الأسئلة التي تظهر فوقه." />
              {asked('m4', 'a4') && <KnowledgeBrick id="ishara-jidaa" lead="الإشارتان في سجلّك: متى يكون الجداء موجبًا ومتى سالبًا؟" />}
              {asked('m4', 'a4') && <TextbookBox kind="property" compact lines={KNOWLEDGE.signRule.lines} source={KNOWLEDGE.signRule.source} />}
              {asked('m4', 'a4') && <TextbookBox kind="example" compact text={KNOWLEDGE.signRule.examples} source={KNOWLEDGE.signRule.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'أين كان مصعد آخر؟', subtitle: 'بلا مختبر', done: !!q.d,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt="مصعد ينزل 3 طوابق في الدقيقة. أين كان قبل 3 دقائق من مروره بالطابق الأرضي؟ (رقم الطابق)"
                expected={9} requires={['ishara-jidaa']}
                explain={<MathText>{'الزمن $-3$ والسرعة $-3$ لهما الإشارة نفسها: الجداء موجب، $(-3) \\times (-3) = 9$ ، فالكابينة في الطابق 9 فوق الشارع.'}</MathText>}
                onAnswered={answered('d')}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
