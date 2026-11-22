import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, FUNPARK } from '../content/textbook';
import FreqTable from '../components/FreqTable';
import { BarChart } from '../components/Charts';

/**
 * Module 1 — نشاط 1 (p. 92) « التكرار المجمع », ouvert sur LA TOISE DU MANÈGE (cumul-gate).
 *
 * Rétrofit 2026-10-15 (§4quater) : le labo en tête (ni `brief` ni titres de labo / d'atelier), la question 2 renvoie aux annonces de
 * l'élève, le rappel de l'étape 4 retiré avant sa question (la brique est nommée à l'étape 3). Modules 2–3 : voir lesson.config.js.
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : le نشاط 1) : les 20 élèves dans l'ordre du manuel, le tableau des questions 4–5
 *          (cases imprimées données) que remplissent les comptes acceptés de l'élève ;
 *   مبتدئ : la file d'un manège, 8 enfants, « يجب أن تكون قامتك 130cm على الأقل ».
 * UNDERSTAND  س 1–5 se décident sur la toise : les annonces de l'élève (`onTrial`) sont listées au-dessus
 *           des questions (`[data-activity-evidence]`) ; le مخطط des âges est la même idée sans personnes.
 * FORMALIZE  la brique mujamma-nashat : les deux phrases du manuel qui NOMMENT (sous les tableaux 4 et 5).
 * AUCUNE étape n'attend `onFinished`. LP : P1 (س 2–5, les âges), P3 (le tableau).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const SIDE = { up: 'على الأكثر', down: 'على الأقل' };

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);

  const onTrial = (tr) => setTrials((t) => [...t, tr].slice(-12));
  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">لم تُعلن بعد أي عدد عند البوابة (المستوى المتقدم: قامات 20 تلميذا).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">إعلاناتك عند البوابة:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="trials">
            {trials.map((tr, i) => (
              <li key={i} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tr.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-800'}`} data-evidence-trial={`${tr.side}:${tr.t}`}>
                {tr.ok ? '✓' : '✗'} {SIDE[tr.side]} <bdi dir="ltr" className="font-mono">{tr.t}cm → {tr.n}</bdi>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  return (
    <ContentModule
      objectives={["كم تلميذًا قامته 159cm على الأقل؟ وكم قامته 160cm على الأكثر؟", "كيف نملأ الجدولين انطلاقًا من العدّ نفسه؟", "هل نصل إلى العدد نفسه انطلاقًا من مخطط بالأعمدة؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 1 — بوابة القامة"
      moduleSubtitle="كم تلميذا قامته t على الأكثر؟ على الأقل؟"
      estimatedTime="12 دقيقة"
      intro={
        // LE LABO OUVRE LE MODULE (§4quater) : ni carte du manuel, ni titre / `lead` d'atelier ; le `lead` du labo = le contexte seul.
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="cumul-gate"
                level="beginner"
                series={FUNPARK.series}
                mode="up|down"
                theme="funpark"
                lead="ثمانية أطفال ينتظرون دورهم في طابور إحدى ألعاب حديقة التسلية."
              />
            ),
            advanced: () => (
              <Manipulation
                type="cumul-gate"
                level="advanced"
                series={ACTIVITY.series.join('|')}
                mode="up|down|table"
                given={ACTIVITY.given}
                theme="school"
                lead="قامات 20 تلميذا من قسم واحد، كما سُجّلت (غير مرتّبة). كل عدد تُعلنه صحيحا يملأ خانة في الجدول."
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كيف يبدو الطابور بعد أن ترتّبه؟', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="الترتيب التصاعدي لقامات العشرين تلميذا هو:"
                options={[
                  'ثلاث مرات 154، ثم أربع مرات 157، ثم خمس مرات 159، ثم خمس مرات 160، ثم ثلاث مرات 165',
                  'ثلاث مرات 165، ثم خمس مرات 160، ثم خمس مرات 159، ثم أربع مرات 157، ثم ثلاث مرات 154',
                  'ثلاث مرات 154، ثم خمس مرات 157، ثم أربع مرات 159، ثم خمس مرات 160، ثم ثلاث مرات 165',
                ]}
                correct={0}
                cols={1}
                requires={['tartib-tasaudi']}
                explain={<MathText>{`${ACTIVITY_LINES.sorted} (الاقتراح الثاني تنازلي، والثالث بدّل تكراري 157 و 159.)`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا قبلت البوابة عند 159؟', subtitle: 'السؤالان 2 و 3', done: q2,
          content: (
            <div className="space-y-3">
              {evidence}
              <NumericQuestion
                prompt={<MathText>{'أعلنتَ عند البوابة أعدادًا لقيم من اختيارك. جرّب الآن القيمة 159 بالذات: ما عدد التلاميذ الذين أطوال قاماتهم 159cm على الأقل؟'}</MathText>}
                expected={ACTIVITY.answer.atLeast159}
                display={String(ACTIVITY.answer.atLeast159)}
                requires={['ala-aqal-akthar']}
                explain={<MathText>{ACTIVITY_LINES.atLeast159}</MathText>}
                explainFor={(n) => (n === 8 ? <MathText>{`8 هو عدد الذين قامتهم «تفوق» 159. ${ACTIVITY_LINES.atLeast159}`}</MathText> : <MathText>{ACTIVITY_LINES.atLeast159}</MathText>)}
                onAnswered={() => setQ2a(true)}
              />
              {q2a && (
                <NumericQuestion
                  prompt={<MathText>{ACTIVITY.questions[2]}</MathText>}
                  expected={ACTIVITY.answer.atMost160}
                  display={String(ACTIVITY.answer.atMost160)}
                  requires={['ala-aqal-akthar']}
                  explain={<MathText>{ACTIVITY_LINES.atMost160}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'الجدولان', subtitle: 'السؤالان 4 و 5', done: q3,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[3]}</MathText></p>
              <FreqTable head="القامة $t$" values={ACTIVITY.values} rows={[
                { label: 'التكرار', cells: ['3', '4', '…', '…', '…'] },
                { label: 'عدد التلاميذ الذين قاماتهم أصغر من أو تساوي $t$', cells: ACTIVITY.tableUp },
              ]} />
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[4]}</MathText></p>
              <FreqTable head="القامة $t$" values={ACTIVITY.values} rows={[
                { label: 'التكرار', cells: ACTIVITY.freqs },
                { label: 'عدد التلاميذ الذين قاماتهم أكبر من أو تساوي $t$', cells: ACTIVITY.tableDown },
              ]} />
              {evidence}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أتمم الخانات «…» (جدولك في المستوى المتقدم يملؤها بإعلاناتك):</p>}
                rows={[
                  { id: 'u159', label: <MathText>{'أصغر من أو تساوي $159$'}</MathText>, options: ['$12$', '$5$', '$13$'].map(M), correct: 0, correction: <MathText>{'$3 + 4 + 5 = 12$ (و 5 هو تكرار 159 وحده، و 13 هو النازل).'}</MathText> },
                  { id: 'u160', label: <MathText>{'أصغر من أو تساوي $160$'}</MathText>, options: ['$12$', '$17$', '$8$'].map(M), correct: 1, correction: <MathText>{'$12 + 5 = 17$'}</MathText> },
                  { id: 'd157', label: <MathText>{'أكبر من أو تساوي $157$'}</MathText>, options: ['$13$', '$7$', '$17$'].map(M), correct: 2, correction: <MathText>{'$4 + 5 + 5 + 3 = 17$ (و 13 نسي تكرار 157 نفسه).'}</MathText> },
                  { id: 'd159', label: <MathText>{'أكبر من أو تساوي $159$'}</MathText>, options: ['$13$', '$8$', '$12$'].map(M), correct: 0, correction: <MathText>{'$5 + 5 + 3 = 13$'}</MathText> },
                ]}
                requires={['ala-aqal-akthar']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: السطر الأول 3 ، 7 ، 12 ، 17 ، 20 والسطر الثاني 20 ، 17 ، 13 ، 8 ، 3.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <SourceTag source={ACTIVITY.source} />}
              {q3 && <KnowledgeBrick id="mujamma-nashat" lead="الكتاب يسمّي ما عددته عند البوابة:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'مخطط الأعمار', subtitle: 'المخطط بالأعمدة', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.chartText} source={ACTIVITY.source} compact />
              <BarChart labels={ACTIVITY.chart.values.map((v) => `${v}`)} freqs={ACTIVITY.chart.freqs} yMax={ACTIVITY.chart.yMax} yStep={ACTIVITY.chart.yStep}
                xLabel="الأعمار (بالسنة)" yLabel={ACTIVITY.chart.yLabel} label="مخطط بالأعمدة: 11 سنة 40 تلميذا، 12 سنة 50، 13 سنة 80، 14 سنة 30" />
              <NumericQuestion
                prompt="التكرار المجمع الصاعد الموافق للقيمة 12:"
                expected={ACTIVITY.chartAnswer.up12}
                display={String(ACTIVITY.chartAnswer.up12)}
                explain={<MathText>{ACTIVITY_LINES.up12}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && (
                <NumericQuestion
                  prompt="التكرار المجمع النازل الموافق للقيمة 13:"
                  expected={ACTIVITY.chartAnswer.down13}
                  display={String(ACTIVITY.chartAnswer.down13)}
                  requires={['mujamma-nashat']}
                  explain={<MathText>{ACTIVITY_LINES.down13}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
