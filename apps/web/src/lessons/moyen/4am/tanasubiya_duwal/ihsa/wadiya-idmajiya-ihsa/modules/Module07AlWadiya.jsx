import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS, LAB, analysisText } from '../content/textbook';
import StatTable, { MedalVignette } from '../components/StatTable';

/**
 * Module 7 — la وضعية (p. 100) : les médailles d'or olympiques, lues dans les TROIS étapes du
 * « تحليل الوضعية » du manuel (قراءة الوضعية وفهمها · تحليل الوضعية واختيار استراتيجية حل مناسبة · تنفيذ
 * استراتيجية الحل المختارة), comme les synthèses des unités 2 à 7.
 *
 * LE LABORATOIRE (stat-balance, RÉUTILISÉ de « مدى ووسيط ومتوسط سلسلة إحصائية », mode `hidden`, monde
 * `medals` — props dans content/textbook.js › LAB, deux niveaux dans un ManipulationWorkspace,
 * ouvert sur مبتدئ par défaut depuis 2026-10-09 : c'est le tableau du manuel) :
 *   متقدم  les 30 pays du manuel : la main pose le premier jeton caché (entre 2 et 4) jusqu'à ce que le
 *          rideau du وسيط se verrouille sur 3, puis le second (entre 26 et 32) jusqu'à l'équilibre sur 7.
 *   مبتدئ  les jeux scolaires (plateforme) : une seule valeur cachée, la plus grande — le rideau reste sur
 *          2 quoi qu'on fasse, seule la balance (3) la trouve.
 * Les essais de l'élève (`onTrial`) sont listés au-dessus des questions d'exécution (`[data-activity-evidence]`).
 * Aucune étape n'attend le laboratoire (`onFinished`) : chaque étape se termine sur une RÉPONSE.
 * Rétrofit 2026-10-15 : le labo ouvre le module ; l'énoncé du manuel (ancienne carte) passe en tête de l'étape 1 (lecture de la situation).
 * LP : P2 (lire, ranger, choisir), P3 (exécuter et rédiger).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];
const N_TOTAL = SITUATION.numbers.counts.reduce((s, c) => s + c, 0);

/** Une valeur du lab (« 7 », « 6,5 » ou une fraction « 104/15 ») écrite en décimal à virgule, arrondie au centième. */
function shown(v) {
  if (v == null) return '?';
  const s = String(v);
  if (!s.includes('/')) return s.replace('.', ',');
  const [n, d] = s.split('/').map(Number);
  return `≈ ${(Math.round((n / d) * 100) / 100).toString().replace('.', ',')}`;
}

/** Un essai rapporté par le laboratoire (`onTrial`, mode hidden : { h, v, refused, mean, median, ok }). */
function trialText(t) {
  if (!t || t.stage !== 'hidden' || t.v == null) return null;
  const v = String(t.v).replace('.', ',');
  if (t.refused) return `${v} ✗`;
  const med = shown(t.median);
  const mean = shown(t.mean);
  return `${t.h === 0 ? '⬡1' : '⬡2'} = ${v} → Med = ${med} ، m = ${mean}${t.ok ? ' ✓' : ''}`;
}

function Evidence({ trials, empty }) {
  const shown = trials.map(trialText).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence="advanced">
      {shown.length === 0 && <p className="text-slate-500" data-tried="false">{empty}</p>}
      {shown.length > 0 && (
        <div data-tried="true">
          <p>محاولاتك على ميزان الميداليات:</p>
          <ul className="ms-4 list-disc">{shown.map((s, i) => <li key={i}><bdi dir="ltr" className="font-mono">{s}</bdi></li>)}</ul>
        </div>
      )}
    </div>
  );
}

/** Une étape du « تحليل الوضعية » du manuel, au mot près. */
const Phase = ({ i }) => (
  <TextbookBox kind="remark" title={SITUATION.analysis[i].label} text={analysisText(SITUATION.analysis[i])} source={SITUATION.source} compact />
);

export default function Module07AlWadiya() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const keep = (trial) => setTrials((list) => [...list, trial]);
  const { values, counts } = SITUATION.numbers;

  return (
    <ContentModule objectives={["أيّ معطى يكشف القيمة المخفية الأولى، وأيّ معطى يكشف الثانية؟", "كيف أعرف عدد الدول التي لم تفز بالذهب انطلاقًا من نسبة؟", "كيف أحرّر الحلّ بجمل واضحة؟"]} ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="الوضعية وتحليلها" moduleSubtitle="الميداليات الذهبية الأولمبية: قيمتان مخفيتان، وعدد الدول دون ذهب" estimatedTime="18 دقيقة"
      intro={
        // LE LABO OUVRE LE MODULE (§4quater, rétrofit 2026-10-15) : ni `brief`, ni titre / `lead` d'atelier ; l'énoncé du manuel
        // (tableau, données, questions) est lu à l'étape 1. `lead` des labos = le contexte seul.
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation type="stat-balance" level="beginner" {...LAB.beginner} lead="في الألعاب المدرسية سُجّلت ميداليات عشرة متوسطات، وبقيت قيمة واحدة مخفية في الجدول." />
            ),
            advanced: () => (
              <Manipulation type="stat-balance" level="advanced" {...LAB.advanced} lead="جدول الميداليات الذهبية لثلاثين دولة في دورة أولمبية، وقيمتان فيه مخفيتان." onTrial={keep} />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'المرحلة 1 من الكتاب: عمّ يتحدث النص؟', done: !!q[1],
          content: (
            <div className="space-y-3">
              <div className="space-y-2" data-situation="midaliyat">
                <MedalVignette />
                <p>{SITUATION.intro}</p>
                <StatTable id="situation" valueLabel={SITUATION.valueLabel} countLabel={SITUATION.countLabel} values={values} counts={counts} />
                <p className="text-xs text-slate-500">{SITUATION.figure}</p>
                <p>{SITUATION.data}</p>
                <p>{SITUATION.q1}</p>
                <p>{SITUATION.q2}</p>
                <SourceTag source={SITUATION.source} />
              </div>
              <Phase i={0} />
              <TapQuestion
                prompt="في الجدول، ماذا يعني العدد 11 المكتوب تحت القيمة 1؟"
                options={[
                  REMARKS.readRight,
                  'دولة واحدة فازت بـ 11 ميدالية ذهبية.',
                  'مجموع الميداليات الذهبية لكل الدول 11.',
                  'الدولة الأولى في الترتيب فازت بـ 11 ميدالية.',
                ].map(M)}
                correct={0} cols={1} requires={['takrar-kulli']}
                explain={<MathText>{`${REMARKS.jadwal} ${REMARKS.readWhy}`}</MathText>}
                onAnswered={mark(1)} />
              {q[1] && <p className="text-xs text-slate-600" data-misconception-note="read"><MathText>{`خطأ شائع: ${REMARKS.readWrong}`}</MathText></p>}
            </div>
          ) },
        { num: 2, title: 'رتّب المعطيات', subtitle: 'كم دولة في الجدول؟', done: !!q[2],
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt="كم دولة فازت بميدالية ذهبية واحدة على الأقل في هذه الدورة؟"
                expected={N_TOTAL} display={String(N_TOTAL)}
                requires={['takrar-kulli']}
                explain={<MathText>{REMARKS.takrarKulli}</MathText>}
                explainFor={(n) => <MathText>{n === 14 ? `العدد 14 عدد أعمدة الجدول (القيم المختلفة) لا عدد الدول. ${REMARKS.takrarKulli}` : n === 27 ? `لا ننسى تكراري العمودين المخفيين (2 و 1). ${REMARKS.takrarKulli}` : REMARKS.takrarKulli}</MathText>}
                onAnswered={mark(2)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : valeur / effectif / effectif total est un prérequis (takrar-kulli, 3AM) ; les
                  explications des étapes 1 et 2 (REMARKS.jadwal, REMARKS.takrarKulli) viennent de le dire. */}
              {q[2] && <KnowledgeBrick id="qiraat-jadwal" variant="rappel" />}
            </div>
          ) },
        { num: 3, title: 'تحليل الوضعية واختيار استراتيجية', subtitle: 'المرحلة 2 من الكتاب: أيّ معطى يكشف أيّ قيمة؟', done: !!q[3],
          content: (
            <div className="space-y-3">
              <Phase i={1} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">احكم على كل عبارة.</p>}
                rows={[
                  { id: 's1', label: 'التكرار الكلي 30 زوجي، فالوسيط نصف مجموع القيمتين اللتين رتبتاهما 15 و 16.', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.rutab}</MathText> },
                  { id: 's2', label: <MathText>{REMARKS.wasitWrong}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.wasitWhy}</MathText> },
                  { id: 's3', label: 'الوسيط 3 يساعد على إيجاد القيمة المخفية الأولى (بين 2 و 4).', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.mujamma}</MathText> },
                  { id: 's4', label: 'المتوسط 7 يعطي معادلة نجد منها القيمة المخفية الثانية.', options: TRUE_FALSE, correct: 0, correction: 'مجموع الميداليات يساوي المتوسط مضروبا في التكرار الكلي، وفيه القيمتان المخفيتان.' },
                  { id: 's5', label: 'نجد القيمتين المخفيتين بحساب متوسط القيم الظاهرة وحدها.', options: TRUE_FALSE, correct: 1, correction: 'متوسط القيم الظاهرة لا يذكر القيمتين المخفيتين: نحتاج الوسيط ثم المتوسط المعطيين.' },
                ]}
                requires={['wasit-rutba', 'mutawassit-murajjah']}
                feedback={({ allRight }) => <MathText>{allRight ? 'أحسنت: الوسيط أولا (برتبتيه)، ثم المتوسط (بمعادلة).' : 'الوسيط يُعيَّن برتبتيه 15 و 16 ، والمتوسط يعطي معادلة في القيمة الثانية.'}</MathText>}
                onAnswered={mark(3)} />
            </div>
          ) },
        { num: 4, title: 'تنفيذ: القيمة المخفية الأولى', subtitle: 'المرحلة 3 — على الميزان، ثم بالحساب', done: !!q[4],
          content: (
            <div className="space-y-3">
              <Evidence trials={trials} empty="لم تحرّك بعد قيمة مخفية: في المستوى المتقدّم اسحب القيمة المخفية الأولى (الشكل السداسي) وراقب الوسيط." />
              <NumericQuestion
                prompt="ما القيمة المخفية الأولى (بين 2 و 4)؟"
                expected={SITUATION.numbers.median} display={String(SITUATION.numbers.median)}
                requires={['wasit-rutba', 'takrar-mujamma']}
                explain={<MathText>{`${REMARKS.mujamma} ${REMARKS.wasitX}`}</MathText>}
                onAnswered={mark(4)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : rangs de la médiane et effectifs cumulés sont wasit-rutba / takrar-mujamma (درسان 1 و 2) ;
                  les corrections s1 et s3 de l’étape 3 et l’explication ci-dessus (REMARKS.mujamma, wasitX) viennent de dire la méthode. */}
              {q[4] && <KnowledgeBrick id="qima-makhfiya-wasit" variant="rappel" />}
            </div>
          ) },
        { num: 5, title: 'تنفيذ: القيمة المخفية الثانية', subtitle: 'ماذا يعطينا المتوسط 7؟', done: !!q[5],
          content: (
            <div className="space-y-3">
              <p className="text-sm"><MathText>{REMARKS.maloum}</MathText></p>
              <TapQuestion
                prompt={<MathText>{'نسمّي $y$ القيمة المخفية الثانية. المعادلة التي يعطيها المتوسط 7 هي:'}</MathText>}
                options={[
                  '$176 + 2 \\times 3 + y = 7 \\times 30$',
                  '$176 + 3 + y = 7 \\times 30$',
                  '$\\dfrac{176 + 2 \\times 3 + y}{14} = 7$',
                  '$176 + 2 \\times 3 + y = 7$',
                ].map(M)}
                correct={0} cols={1} requires={['mutawassit-murajjah', 'qima-makhfiya-wasit']}
                explain={<MathText>{`${REMARKS.muadala} ${REMARKS.tarjihWhy} نقسم على التكرار الكلي 30 لا على عدد الأعمدة 14.`}</MathText>}
                onAnswered={mark(5)} />
            </div>
          ) },
        { num: 6, title: 'تنفيذ: حلّ المعادلة والتحقّق', subtitle: 'ثم نعيد الحساب', done: !!q[6],
          content: (
            <div className="space-y-3">
              <Evidence trials={trials} empty="جرّب على الميزان: اسحب القيمة المخفية الثانية حتى يتوازن الميزان على 7." />
              <NumericQuestion
                prompt="ما القيمة المخفية الثانية (بين 26 و 32)؟"
                expected={28} display="28"
                requires={['muadala-ula', 'mutawassit-murajjah']}
                explain={<MathText>{`${REMARKS.halY} ${REMARKS.tahqiq}`}</MathText>}
                explainFor={(n) => <MathText>{n === 31 ? `${REMARKS.tarjihWhy} ${REMARKS.halY}` : `${REMARKS.halY} ${REMARKS.tahqiq}`}</MathText>}
                onAnswered={mark(6)} />
              {q[6] && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : moyenne pondérée (mutawassit-murajjah, درس 2) + équation du 1er degré (muadala-ula) ;
                      l’encadré REMARKS.maloum, l’explication de l’étape 5 (muadala) et celle ci-dessus (halY, tahqiq) viennent de la dérouler. */}
                  <KnowledgeBrick id="qima-makhfiya-mutawassit" variant="rappel" />
                  <p className="text-xs text-slate-600"><MathText>{`خطأ شائع: ${REMARKS.tarjihWrong} ${REMARKS.tarjihWhy}`}</MathText></p>
                </>
              )}
            </div>
          ) },
        { num: 7, title: 'الجزء 2: كم دولة فازت بميداليات؟', subtitle: 'نسبة معلومة وعدد مجهول', done: !!q[7],
          content: (
            <TapQuestion
              prompt={<MathText>{'نسمّي $T$ عدد الدول الفائزة بميداليات (ذهبية أو فضية أو برونزية). الـ 30 دولة الفائزة بالذهب هي 69% منها، إذن:'}</MathText>}
              options={[
                '$0{,}69 \\times T = 30$',
                '$T = 0{,}69 \\times 30 = 20{,}7$',
                '$T = 30 + 69 = 99$',
                '$T = \\dfrac{69}{30} = 2{,}3$',
              ].map(M)}
              correct={0} cols={1} requires={['nisba-min-adad']}
              explain={<MathText>{`${REMARKS.nisbaEq} ${REMARKS.nisbaWhy}`}</MathText>}
              onAnswered={mark(7)} />
          ) },
        { num: 8, title: 'تنفيذ: عدد الدول دون ذهب', subtitle: 'قيمة مقرّبة إلى الوحدة', done: !!q[8],
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt="ما عدد الدول التي تحصّلت فقط على ميداليات فضية أو برونزية؟"
                expected={13} display="13"
                requires={['nisba-min-adad', 'muadala-ula']}
                explain={<MathText>{`${REMARKS.nisbaT} ${REMARKS.nisbaFaqat}`}</MathText>}
                explainFor={(n) => <MathText>{n === 43 ? `43 هو عدد كل الدول الفائزة بميداليات؛ نطرح منها الـ 30 الفائزة بالذهب. ${REMARKS.nisbaFaqat}` : `${REMARKS.nisbaT} ${REMARKS.nisbaFaqat}`}</MathText>}
                onAnswered={mark(8)} />
              {q[8] && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : « أخذ نسبة من عدد » est un prérequis (nisba-min-adad) ; les explications des étapes 7
                      (REMARKS.nisbaEq) et 8 (nisbaT, nisbaFaqat) viennent d’écrire l’équation, de la résoudre et d’arrondir. */}
                  <KnowledgeBrick id="kull-min-nisba" variant="rappel" />
                  <p className="text-xs text-slate-600"><MathText>{`خطأ شائع: ${REMARKS.nisbaWrong} ${REMARKS.nisbaWhy} ${REMARKS.nisbaRight}`}</MathText></p>
                </>
              )}
            </div>
          ) },
        { num: 9, title: 'تحرير الحل بجمل واضحة', subtitle: 'المرحلة 3 من الكتاب، آخرها', done: !!q[9],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="أيّ جملة تجيب عن سؤالي الوضعية إجابة واضحة وصحيحة؟"
                options={[
                  REMARKS.jumla,
                  'القيمتان المخفيتان 3 و 28 ، وعدد الدول التي تحصّلت فقط على ميداليات فضية أو برونزية 43 دولة.',
                  'القيمتان المخفيتان 3 و 31 ، وعدد الدول التي تحصّلت فقط على ميداليات فضية أو برونزية 13 دولة تقريبا.',
                  'الوسيط 3 والمتوسط 7 ، و 69% من الدول فازت بالذهب.',
                ].map(M)}
                correct={0} cols={1} requires={['qima-makhfiya-mutawassit', 'kull-min-nisba']}
                explain={<MathText>{`${REMARKS.jumla} الجملة الأخيرة تعيد المعطيات ولا تجيب، و 43 عدد كل الدول الفائزة، و 31 تنسى أنّ القيمة الأولى تكرارها 2.`}</MathText>}
                onAnswered={mark(9)} />
              {q[9] && (
                <>
                  <Phase i={2} />
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la démarche ne fait que remettre en ordre les trois phases « تحليل الوضعية »
                      que l’élève vient de lire (Phase 0, 1 et celle juste au-dessus). */}
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                </>
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
