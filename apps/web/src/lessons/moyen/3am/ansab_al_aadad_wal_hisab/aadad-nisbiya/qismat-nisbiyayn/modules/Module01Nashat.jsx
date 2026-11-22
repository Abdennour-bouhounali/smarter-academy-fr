import { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : les خزائن الأمانات. UNE SEULE PISTE (§4quater) :
 * le labo `code-lockers` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main roule les molettes du CODE (un signe, des chiffres).
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SON سجلّ : le code de la première خزانة est le quotient (P1) ; les خزائن au code positif (P2) ; un calcul sans labo.
 * Le nom (brique + encadré) vient APRÈS la réponse. Le manuel n'a pour cette notion qu'une activité à trous (devenue E1) : l'entrée est celle de la plateforme.
 * Déploiement du prototype (2026-10-28) : « quel quotient ? » (la phrase de division de SON casier) et « que partagent les casiers au code
 * positif ? » sont posées PAR-DESSUS le labo (`CodeLockers › CHAINS`) ; les étapes 1 et 2 en gardent la TRACE (`checkpoint-done`) puis
 * posent les noms. L'étape 3 (sans labo) reste une question d'étape.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de son casier l'est
  const asked = (...ids) => trials.some((e) => e.tk === 'checkpoint-done' && ids.includes(e.id));
  const openedOf = (id) => trials.findLast((e) => e.kind === 'pull' && !e.free && e.taskId === id && e.ok);
  const m1 = openedOf('m1');
  const four = ['m1', 'm2', 'm3', 'm4'].map(openedOf);
  const all = four.every(Boolean);
  const positive = four.map((e, i) => (e && !e.code.startsWith('−') ? i + 1 : null)).filter(Boolean);

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['أكتشف أنّ حاصل قسمة a على b هو العدد الذي إذا ضُرب في b أعطى a، وأكتشف إشارته.', 'ما الرمز الذي يفتح قفلًا مكتوبًا عليه (−6) × ؟ = 48؟', 'متى يكون الرمز موجبًا؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — خزائن الأمانات"
      moduleSubtitle="رمز لكل قفل، وعجلات تديرها بيدك"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="code-lockers" level="beginner" world={LAB.beginner.world} tasks={LAB.beginner.tasks} onTrial={record} />,
            advanced: () => <Manipulation type="code-lockers" level="advanced" world={LAB.advanced.world} tasks={LAB.advanced.tasks} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ما العدد الذي فتح الخزانة الأولى؟', subtitle: 'القسمة والضرب', done: asked('m1', 'a1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="m1" ok={asked('m1', 'a1') && !!m1}
                done={<span>أجبتَ في المختبر: فتحتَ الخزانة الأولى بالرمز <Ltr>{m1?.code}</Ltr> ، وقاعدتها <Ltr>{'(−6) × ? = 48'}</Ltr> ، إذن <Ltr>{`48 ÷ (−6) = ${m1?.code ?? ''}`}</Ltr> .</span>}
                todo="افتح الخزانة الأولى في المختبر أعلاه، وأجب عن الأسئلة التي تظهر فوقه." />
              {asked('m1', 'a1') && <KnowledgeBrick id="qisma-aamil" lead="الرمز الذي يفتح القفل هو العدد الذي يعطي النتيجة المطلوبة حين نضربه في العدد المكتوب على الباب: ماذا نسمّيه؟" />}
              {asked('m1', 'a1') && <TextbookBox kind="definition" compact lines={KNOWLEDGE.definition.lines} source={KNOWLEDGE.definition.source} />}
              {asked('m1', 'a1') && <TextbookBox kind="example" compact text={KNOWLEDGE.definition.examples} source={KNOWLEDGE.definition.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'في أيّ الخزائن كان الرمز موجبًا؟', subtitle: 'ما تشترك فيه أبوابها', done: asked('m4', 'a4'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="rule" ok={asked('m4', 'a4') && all}
                done={<span>أجبتَ في المختبر: الرمز كان موجبًا في الخزانتين <Ltr>{positive.join(' و ')}</Ltr> ، وفي كلّ منهما للعددين المكتوبين على الباب الإشارة نفسها؛ وفي الخزانتين الأخريين إشارتاهما مختلفتان والرمز سالب.</span>}
                todo="افتح الخزائن الأربع في المختبر أعلاه، وأجب عن الأسئلة التي تظهر فوقه بعد الخزانة الأخيرة." />
              {asked('m4', 'a4') && <KnowledgeBrick id="ishara-qisma" lead="الرمز موجب حين يكون للعددين المكتوبين على الباب الإشارة نفسها: كيف نكتب القاعدة؟" />}
              {asked('m4', 'a4') && <TextbookBox kind="property" compact lines={KNOWLEDGE.signs.lines} source={KNOWLEDGE.signs.source} />}
              {asked('m4', 'a4') && <TextbookBox kind="example" compact text={KNOWLEDGE.signs.examples} source={KNOWLEDGE.signs.source} />}
              {asked('m4', 'a4') && <TextbookBox kind="remark" compact text={KNOWLEDGE.signs.remark} source={KNOWLEDGE.signs.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'احسب بلا مختبر', subtitle: 'حاصلا قسمة', done: !!(q.c1 && q.c2),
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'احسب: $(-72) \\div (-9)$'}</MathText>}
                expected={8} requires={['ishara-qisma']}
                explain={<MathText>{'العددان سالبان: لهما الإشارة نفسها فالحاصل موجب، و $72 \\div 9 = 8$ . نتحقّق: $(-9) \\times 8 = -72$ .'}</MathText>}
                onAnswered={answered('c1')}
              />
              <NumericQuestion
                prompt={<MathText>{'احسب: $56 \\div (-7)$'}</MathText>}
                expected={-8} display="−8" requires={['ishara-qisma']}
                explain={<MathText>{'مختلفا الإشارة: الحاصل سالب، و $56 \\div 7 = 8$ ، إذن $-8$ . نتحقّق: $(-7) \\times (-8) = 56$ .'}</MathText>}
                onAnswered={answered('c2')}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
