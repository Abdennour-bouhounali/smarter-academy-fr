import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACT3, ACT3_LINES, MEAN_REMINDER, LAB } from '../content/textbook';
import BarChart from '../components/BarChart';
import FreqTable from '../components/FreqTable';

/**
 * Module 1 — نشاط 3 (p. 93) « المدى والمتوسط لسلسلة إحصائية », ouvert sur LA BALANCE DES VALEURS (stat-balance).
 *
 * REAL        la carte : les salaires d'une petite entreprise, la chaleur de novembre dans deux villes.
 * MANIPULATE  le lab à deux niveaux, mode range|mean : le كلّاب serré au centre s'ouvre jusqu'aux deux extrêmes
 *             (المدى s'écrit), puis l'appui glisse jusqu'à l'équilibre (les deux sommes de distances égales).
 *             مبتدئ = cinq scores d'un mini-tournoi (2, 3, 3, 4, 8 : m = 4) ; متقدم = les dix jours d'El Oued (act-4 :
 *             l'étendue 14, la moyenne 39,3 au dixième près).
 * UNDERSTAND  س 1 (l'étendue des salaires 45000, nommée « مدى ») ; la question « où la poutre s'équilibre-t-elle ? »
 *             se décide sur les essais de l'élève (`onTrial` → `[data-activity-evidence]`) — puis le rappel déclaré du
 *             المتوسط المتوازن ; س 2 أ (étendues 5 et 10), س 2 ب (482/30 pour les deux villes, la moyenne SANS
 *             pondération 17,25 réfutée), et la question honnête : même moyenne, (ب) plus dispersée.
 * AUCUNE étape n'attend `onFinished`. LP : P1 (étendue), P2 (moyenne pondérée).
 * Rétrofit 2026-10-15 (§4quater) : le labo OUVRE le module — plus de carte `brief`, ni `title` / `lead` de workspace ; l'accroche
 * (salaires, deux villes) n'est plus l'entrée mais l'APPLICATION de ce que la main vient de faire : la 1re étape rappelle le
 * calibre posé par l'élève (`[data-activity-evidence]`) avant la question des salaires.
 * Les labs vivent dans l'`intro` (deux niveaux) : « مسألة الدرس » (la chaleur de juillet à El Oued, module 5) est
 * rappelée à la fin de la DERNIÈRE étape. Le المتوسط المتوازن est un acquis des années précédentes : sa brique est
 * un rappel (`variant="rappel"`), sans « أتوقّع القاعدة ».
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;
const TILT = { left: 'تميل يسارًا', right: 'تميل يمينًا', level: 'متوازنة ✓' };

export default function Module01Nashat3() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const onTrial = (tr) => setTrials((t) => [...t, tr].slice(-30));
  const means = trials.filter((t) => t.stage === 'mean');
  const ranges = trials.filter((t) => t.stage === 'range' && t.ok);

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={means.length ? 'true' : 'false'}>
      {means.length === 0 ? (
        <p className="text-slate-500">لم تحرّك نقطة الارتكاز بعد (المرحلة 2 من الميزان، في المستوى الذي تختاره).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">مواضع نقطة الارتكاز التي جرّبتها:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="fulcrum">
            {means.slice(-8).map((tr, i) => (
              <li key={`${tr.p}${i}`} data-evidence-tilt={tr.tilt} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tr.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                <MathText>{`$p = ${tr.p.replace(',', '{,}')}$`}</MathText> · {TILT[tr.tilt]}
                {' '}<span className="font-normal text-slate-600"><MathText>{`($${tr.left.replace(',', '{,}')}$ | $${tr.right.replace(',', '{,}')}$)`}</MathText></span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const rangeEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence="range" data-tried={ranges.length ? 'true' : 'false'}>
      {ranges.length === 0 ? (
        <p className="text-slate-500">لم تضبط الكلّاب على القيمتين الطرفيتين بعد (المرحلة 1 من الميزان، في المستوى الذي تختاره).</p>
      ) : (
        <p><MathText>{`أمسك الكلّاب في ميزانك كل القيم: المدى $${ranges[ranges.length - 1].width.replace(',', '{,}')}$ .`}</MathText></p>
      )}
    </div>
  );

  const cityTable = (c) => (
    <FreqTable testId={c === ACT3.cityA ? 'city-a' : 'city-b'} caption={c.name}
      rows={[{ head: 'درجة الحرارة', cells: c.values.map(String) }, { head: 'عدد الأيام', cells: c.freqs.map(String) }]} />
  );

  return (
    <ContentModule
      objectives={["كم يبعد أكبر راتب عن أصغر راتب؟", "أين تتوازن القيم على العارضة؟", "هل يكفي المتوسط وحده لمقارنة مدينتين؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 3 — المدى والمتوسط"
      moduleSubtitle="المدى والمتوسط لسلسلة إحصائية"
      estimatedTime="13 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation type="stat-balance" level="beginner" series={LAB.esport.series} mode="range|mean" theme="esport"
                lead="خمسة أصدقاء في دورة ألعاب: نقاط كل لاعب بطاقة على العارضة."
                onTrial={onTrial} />
            ),
            advanced: () => (
              <Manipulation type="stat-balance" level="advanced" series={LAB.oasis.series} mode="range|mean" theme="heatwave"
                lead="درجات الحرارة القصوى بمدينة الوادي في الأيام العشرة الأولى من جوان (نشاط 4)."
                onTrial={onTrial} />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كم يبعد أكبر راتب عن أصغر راتب؟', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              {rangeEvidence}
              <p className="text-sm text-slate-800"><MathText>{ACT3.q1}</MathText></p>
              <p className="text-xs text-slate-500"><SourceTag source={ACT3.source} /></p>
              <BarChart testId="salaries" values={ACT3.chart.values} freqs={ACT3.chart.freqs} xLabel="الرواتب (DA)" yLabel="عدد العمال" yMax={6}
                caption="المخطط بالأعمدة: 4 عمال براتب 30000 ، 3 بـ 35000 ، 6 بـ 40000 ، 5 بـ 45000 ، 4 بـ 50000 ، 3 بـ 60000 ، وعامل واحد بـ 75000." />
              <NumericQuestion
                prompt={<MathText>{'الفرق بين أكبر راتب وأصغر راتب (بالدينار) هو:'}</MathText>}
                expected={45000}
                display="45000"
                requires={['tartib-adad']}
                explain={<MathText>{`${ACT3_LINES.salary} لا نقرأ أطول عمود: $6$ عمال هو تكرار، وليس راتبًا.`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="mada-nashat" lead="الكتاب يسمّي هذا الفرق:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'أين تتوازن العارضة؟', subtitle: 'على الميزان', done: q2,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800">في المرحلة 2 من الميزان حرّكت نقطة الارتكاز. اقرأ مواضعك ومجموعي المسافات (يسارًا | يمينًا):</p>
              {evidence}
              <TapQuestion
                prompt="تتوازن العارضة عند النقطة التي:"
                options={[
                  'يتساوى عندها مجموع المسافات إلى القيم الأصغر منها ومجموع المسافات إلى القيم الأكبر منها.',
                  'تقع في منتصف المسافة بين أصغر قيمة وأكبر قيمة.',
                  'يتساوى عندها عدد القيم على يسارها وعدد القيم على يمينها.',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['mutawassit-basit']}
                explain={<MathText>{'في الوادي: منتصف $34$ و $48$ هو $41$ ، وعنده تميل العارضة يسارًا. عند $38{,}5$ خمس قيم في كل جهة، ومع ذلك تميل يمينًا. تتوازن عند $39{,}3$ فقط، حيث مجموع المسافات $18{,}5$ في كل جهة — وهذا هو المتوسط $\\dfrac{393}{10}$.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <KnowledgeBrick id="mutawassit-mutawazin" variant="rappel" lead="ما وجدته على الميزان هو المتوسط:" />
                  <p className="text-xs text-slate-500"><SourceTag source={MEAN_REMINDER.source} /></p>
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'مدى كل مدينة', subtitle: 'السؤال 2 أ', done: q3,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{`${ACT3.q2} ${ACT3.q2a}`}</MathText></p>
              <div className="flex flex-wrap gap-3">{cityTable(ACT3.cityA)}{cityTable(ACT3.cityB)}</div>
              <BatchChoiceQuestion
                rows={[
                  // 18 − 15 = 3 (première et deuxième valeurs écrites) ; 20 = la plus grande valeur
                  { id: 'ra', label: 'مدى المدينة (أ)', options: ['$5$', '$3$', '$20$'].map(Opt), correct: 0, correction: <MathText>{'$20 - 15 = 5$ : أكبر قيمة ناقص أصغر قيمة، لا أكبر قيمة وحدها.'}</MathText> },
                  // 18 − 10 = 8 ; 16 = l'effectif le plus grand
                  { id: 'rb', label: 'مدى المدينة (ب)', options: ['$8$', '$10$', '$16$'].map(Opt), correct: 1, correction: <MathText>{'$20 - 10 = 10$ . العدد $16$ تكرار (عدد أيام)، وليس درجة حرارة.'}</MathText> },
                  { id: 'rc', label: 'درجات الحرارة أكثر تشتّتًا في', options: ['المدينة (أ)', 'المدينة (ب)'], correct: 1, correction: <MathText>{ACT3_LINES.ranges}</MathText> },
                ]}
                requires={['mada-nashat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'المدى يقيس تباعد القيم.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'متوسط كل مدينة', subtitle: 'السؤال 2 ب', done: q4,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACT3.q2b}</MathText></p>
              <BatchChoiceQuestion
                rows={[
                  // 17,25 = (18 + 15 + 16 + 20)/4 sans effectifs ; 69/30 = somme des quatre valeurs ÷ 30
                  { id: 'ma', label: 'متوسط المدينة (أ)', options: ['$17{,}25$', '$\\dfrac{482}{30} \\approx 16{,}07$', '$2{,}3$'].map(Opt), correct: 1, correction: <MathText>{`${ACT3_LINES.meanA} . أمّا $17{,}25$ فمتوسط القيم الأربع دون أعداد الأيام.`}</MathText> },
                  // 15,75 = (10 + 18 + 15 + 20)/4 ; 16 ≠ 482/30
                  { id: 'mb', label: 'متوسط المدينة (ب)', options: ['$\\dfrac{482}{30} \\approx 16{,}07$', '$15{,}75$', '$16$'].map(Opt), correct: 0, correction: <MathText>{ACT3_LINES.meanB}</MathText> },
                ]}
                requires={['mutawassit-mutawazin']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'كل درجة حرارة تُحسب بعدد أيامها.' : 'كل درجة حرارة تُضرب في عدد أيامها: راجع التصحيح.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'أيّ المدينتين أكثر حرًّا؟', subtitle: 'السؤال 2 ب', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="للمدينتين المتوسط نفسه. ماذا نقول؟"
                options={[
                  'لا تُعدّ إحداهما أكثر حرًّا في المتوسط؛ لكنّ درجات الحرارة في (ب) أكثر تشتّتًا (مداها 10 مقابل 5).',
                  'المدينة (ب) أكثر حرًّا لأنّ مداها أكبر.',
                  'المدينة (ب) أكثر حرًّا لأنّ فيها 7 أيام بلغت 20 درجة.',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['mutawassit-mutawazin', 'mada-nashat']}
                explain={<MathText>{`${ACT3_LINES.hotter} في (ب) سبعة أيام بـ $20\\,^{\\circ}\\mathrm{C}$ لكن أيضًا ثلاثة أيام بـ $10\\,^{\\circ}\\mathrm{C}$ ؛ والمدى يقيس التباعد لا الحرارة.`}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && (
                <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
                  المتوسط وحده لا يصف السلسلة: سلسلتان لهما المتوسط نفسه قد تختلفان في تباعد قيمهما. هل يكفي المتوسط والمدى لوصف سلسلة؟ وهل من قيمة أخرى تلخّص السلسلة؟
                </p>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
