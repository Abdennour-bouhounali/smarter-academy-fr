import { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le مسار الروبوت. UNE SEULE PISTE (§4quater) :
 * le labo `robot-track` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient les SIGNES et l'ORDRE des cartes.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SON سجلّ : ce que fait la carte (−1) (P1), le nombre de cartes négatives de ses arrêts (P2),
 * « أتوقّع القاعدة » (la brique), un programme sans labo. Le nom (brique + encadré) vient APRÈS la réponse. Le manuel n'a aucune activité pour
 * plusieurs facteurs : l'entrée est celle de la plateforme.
 * Déploiement du prototype (2026-10-28) : ces questions (la carte −1, le nombre de cartes négatives, ce que partagent les programmes du côté
 * négatif) sont posées PAR-DESSUS le labo après chaque mission (`RobotTrack › CHAINS`) ; les étapes 1 à 3 en gardent la TRACE (`checkpoint-done`)
 * puis posent les noms (briques, encadrés). L'étape 4 (sans labo) reste une question d'étape.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa mission l'est
  const asked = (...ids) => trials.some((e) => e.tk === 'checkpoint-done' && ids.includes(e.id));
  const record = (e) => setTrials((list) => [...list, e]);
  const solvedOf = (id) => trials.findLast((e) => e.kind === 'run' && !e.free && e.taskId === id && e.ok);
  const m1 = solvedOf('m1');
  const m3 = solvedOf('m3');
  const m4 = solvedOf('m4');
  const rows = ['m3', 'm4'].map(solvedOf).filter(Boolean);

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );


  return (
    <ContentModule
      objectives={['أكتشف كيف تحدّد البطاقات السالبة جهة توقّف الروبوت مهما كان ترتيبها.', 'ماذا تفعل بطاقة (−1)؟', 'متى يتوقّف الروبوت في الجهة السالبة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مسار الروبوت"
      moduleSubtitle="برنامج من بطاقات، وإشارات تقلبها بيدك"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="robot-track" level="beginner" world={LAB.beginner.world} tasks={LAB.beginner.tasks} onTrial={record} />,
            advanced: () => <Manipulation type="robot-track" level="advanced" world={LAB.advanced.world} tasks={LAB.advanced.tasks} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ماذا تفعل بطاقة (−1)؟', subtitle: 'من 5 إلى −5', done: asked('m1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="m1" ok={asked('m1') && !!m1}
                done={<span>أجبتَ في المختبر: بعد البطاقة <Ltr>−1</Ltr> قفز الروبوت من <Ltr>5</Ltr> إلى <Ltr>{m1?.stop}</Ltr> ، معاكس <Ltr>5</Ltr> .</span>}
                todo="أنجز المهمة الأولى في المختبر أعلاه، وأجب عن الأسئلة التي تظهر فوقه." />
              {asked('m1') && <KnowledgeBrick id="maakus" lead="بطاقة (−1) تقلب الروبوت إلى الجهة الأخرى: ما هذا العدد بالنسبة إلى العدد الأصلي؟" />}
              {asked('m1') && <TextbookBox kind="property" compact lines={KNOWLEDGE.opposite.lines} source={KNOWLEDGE.opposite.source} />}
              {asked('m1') && <TextbookBox kind="example" compact text={KNOWLEDGE.opposite.examples} source={KNOWLEDGE.opposite.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'كم بطاقة سالبة في سجلّك؟', subtitle: 'بلوغ −24 وبلوغ 24', done: asked('m3') && asked('m4'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="rows" ok={asked('m3') && asked('m4') && rows.length === 2}
                done={<span>أجبتَ في المختبر: برنامج انتهى عند <Ltr>{m3?.stop}</Ltr> وفيه <Ltr>{m3?.negatives}</Ltr> من البطاقات السالبة، وبرنامج انتهى عند <Ltr>{m4?.stop}</Ltr> وفيه <Ltr>{m4?.negatives}</Ltr> .</span>}
                todo="أنجز المهمتين الثالثة والرابعة في المختبر أعلاه، وأجب عن الأسئلة التي تظهر فوقه." />
            </div>
          ),
        },
        {
          num: 3, title: 'متى يتوقّف الروبوت في الجهة السالبة؟', subtitle: 'ما تشترك فيه برامجك', done: asked('m4'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="rule" ok={asked('m4') && rows.length === 2}
                done={<span>أجبتَ في المختبر: <Ltr>{m3?.negatives}</Ltr> بطاقة سالبة وتوقّف الروبوت في الجهة السالبة، و <Ltr>{m4?.negatives}</Ltr> بطاقة سالبة وتوقّف في الجهة الموجبة — ما يحسم الجهة هو أن يكون عدد البطاقات السالبة فرديًا.</span>}
                todo="أنجز المهام الأربع في المختبر أعلاه، وأجب عن الأسئلة التي تظهر فوقه بعد المهمة الأخيرة." />
              {asked('m4') && <KnowledgeBrick id="adad-salib" lead="عدد البطاقات السالبة وجهة توقّف الروبوت: ما القاعدة؟ وهل يهمّ الترتيب؟" />}
              {asked('m4') && <TextbookBox kind="property" compact lines={KNOWLEDGE.parity.lines} source={KNOWLEDGE.parity.source} />}
              {asked('m4') && <TextbookBox kind="example" compact text={KNOWLEDGE.parity.examples} source={KNOWLEDGE.parity.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'تسع بطاقات (−1)', subtitle: 'بلا مختبر', done: !!q.d,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'برنامج فيه 9 بطاقات كلّها $-1$ . أين يتوقّف الروبوت إذا انطلق من $1$ ؟ (اكتب العدد)'}</MathText>}
                expected={-1} display="−1" requires={['adad-salib']}
                explain={<MathText>{'تسع بطاقات سالبة (عدد فردي): الروبوت في الجهة السالبة، ومسافته $1 \\times 1 \\times \\ldots \\times 1 = 1$ ، إذن يتوقّف عند $-1$ .'}</MathText>}
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
