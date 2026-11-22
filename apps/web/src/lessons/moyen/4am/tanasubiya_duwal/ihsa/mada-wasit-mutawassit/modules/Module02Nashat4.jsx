import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACT4, ACT4_LINES, KNOW3, KNOW4, KNOW4_CORRECTIONS, LAB } from '../content/textbook';
import FreqTable from '../components/FreqTable';

/**
 * Module 2 — نشاط 4 (p. 93) « وسيط سلسلة إحصائية » et معارف 3–4 (p. 96).
 *
 * DISCOVER    le lab en mode median : le RIDEAU ne se verrouille que si autant de valeurs de chaque côté —
 *             مبتدئ (2, 3, 3, 4, 8 : N impair, le rideau SUR la 3e carte), متقدم (El Oued : N pair, ENTRE 37 et 40) —
 *             puis la valeur extrême tirée : la moyenne court, la médiane reste (contraste).
 * TOUCH       les 11 salaires (ranger, la valeur qui partage : 42000 — nommée Med, brique wasit), El Oued (étendue
 *             14, moyenne 39,3, médiane 38,5 sur les essais de rideau de l'élève), les 41 poids en classes (مراكز
 *             الفئات, 1816/41 ≈ 44,29, la classe médiane par les effectifs cumulés).
 * FORMALIZE   معارف 4 (définition, quatre ملاحظات, les deux exemples CORRIGÉS en une ligne chacun) et معارف 3.
 * AUCUNE étape n'attend `onFinished`. LP : P3, P1, P2.
 * Rétrofit 2026-10-15 (§4quater) : le labo (le rideau) OUVRE le module — plus de carte `brief`, ni `title` / `lead` de workspace.
 * Ordre des étapes = ce que la main a fait : 1) POURQUOI le rideau ne se verrouille qu'à un endroit (essais de l'élève) puis la
 * définition de Med APRÈS la réponse ; 2) la valeur tirée (contraste) puis les ملاحظات / مثال 1 APRÈS la réponse ; 3–4) les
 * 11 salaires et El Oued du livre deviennent des APPLICATIONS ; 5) المدى (معارف 3) : question puis boîte et brique ; 6) les 41 poids.
 * « أتوقّع القاعدة » : la question des 41 poids est enveloppée (<PredictRule id="markaz-fia">) — ses corrections
 * énoncent la méthode des مراكز الفئات juste avant la brique ; la brique `mada` est un rappel (posée au module 1).
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Nashat4() {
  const [trials, setTrials] = useState([]);
  const [q0, setQ0] = useState(false);
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const onTrial = (tr) => setTrials((t) => [...t, tr].slice(-30));
  const curtains = trials.filter((t) => t.stage === 'median');
  const pulls = trials.filter((t) => t.stage === 'contrast');
  const fmt = (s) => String(s).replace(',', '{,}');

  const curtainEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={curtains.length ? 'true' : 'false'}>
      {curtains.length === 0 ? (
        <p className="text-slate-500">لم تحرّك الستارة بعد (المرحلة 1 من الميزان).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">مواضع الستارة التي جرّبتها (يسارًا | يمينًا):</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="curtain">
            {curtains.slice(-8).map((tr, i) => (
              <li key={`${tr.c}${i}`} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tr.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
                <bdi dir="ltr">{tr.left} | {tr.right}</bdi>{tr.ok && <> ✓ <MathText>{`$${fmt(tr.value)}$`}</MathText></>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
  const pullEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={pulls.length ? 'true' : 'false'}>
      {pulls.length === 0 ? (
        <p className="text-slate-500">لم تسحب أكبر قيمة بعد (المرحلة 2 من الميزان، بعد تثبيت الستارة).</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5" data-evidence="pull">
          {pulls.slice(-6).map((tr, i) => (
            <li key={`${tr.v}${i}`} className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-900">
              <MathText>{`أكبر قيمة $${fmt(tr.v)}$ : المتوسط $${fmt(tr.mean)}$ ، الوسيط $${fmt(tr.median)}$`}</MathText>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <ContentModule
      objectives={["أين نضع ستارة تفصل القيم المرتّبة؟", "ماذا يحدث للمتوسط وللوسيط حين نبعد أكبر قيمة؟", "كيف نجد الفئة التي تشمل الوسيط في جدول بفئات؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="نشاط 4 ومعارف — الوسيط"
      moduleSubtitle="وسيط سلسلة إحصائية، المدى، الفئة الوسيطية"
      estimatedTime="13 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation type="stat-balance" level="beginner" series={LAB.esport.series} mode="median" theme="esport"
                onTrial={onTrial} />
            ),
            advanced: () => (
              <Manipulation type="stat-balance" level="advanced" series={LAB.oasis.series} mode="median" theme="heatwave"
                onTrial={onTrial} />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا تقف الستارة في هذا الموضع؟', subtitle: 'على الميزان', done: q0,
          content: (
            <div className="space-y-3">
              {curtainEvidence}
              <TapQuestion
                prompt="في ميزانك لم تثبت الستارة عند منتصف المسافة بين أصغر قيمة وأكبر قيمة. لماذا؟"
                options={[
                  'لأنّ موضعها تحدّده أعداد القيم في الجهتين، لا المسافات بين القيم.',
                  'لأنّ الميزان لا يقبل إلا مواضع محدّدة سلفًا.',
                  'لأنّ منتصف المسافة يقع دائمًا خارج السلسلة.',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['tartib-adad']}
                explain={<MathText>{'في $2$ ، $3$ ، $3$ ، $4$ ، $8$ تقف الستارة على البطاقة الثالثة: قيمتان قبلها وقيمتان بعدها. منتصف المسافة بين $2$ و $8$ هو $5$ ، وهو ليس موضع الستارة؛ والمسافات لا تحدّد موضعها: يحدّده عدد القيم في كل جهة.'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
              {q0 && (
                <>
                  <PredictRule id="wasit" prompt={"قسمت الستارة القيم المرتّبة إلى جهتين لهما العدد نفسه من القيم. بكلماتك: كيف نعرّف القيمة التي تقف عندها؟ وكيف نجدها في سلسلة مرتّبة؟"}><TextbookBox kind="definition" title={KNOW4.title} text={KNOW4.definition} source={KNOW4.source} compact /></PredictRule>
                  <KnowledgeBrick id="wasit" lead="القيمة التي تقف عندها الستارة هي وسيط السلسلة:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا تغيّر حين تبعد أكبر قيمة؟', subtitle: 'على الميزان', done: q3,
          content: (
            <div className="space-y-3">
              {pullEvidence}
              <TapQuestion
                prompt="عندما سحبتَ أكبر قيمة بعيدًا على الميزان:"
                options={[
                  'تغيّر المتوسط وبقي الوسيط كما هو.',
                  'تغيّر المتوسط والوسيط معًا.',
                  'بقي المتوسط كما هو وتغيّر الوسيط.',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['wasit', 'mutawassit-mutawazin']}
                explain={<MathText>{'المتوسط يجمع كل القيم، فيتبع القيمة البعيدة: في $2$ ، $3$ ، $3$ ، $4$ ، $8$ يصير $6{,}4$ إذا صارت $8$ عشرين. أمّا الوسيط فيتعلّق بالرتب: أكبر قيمة تبقى الأخيرة، والقيمة الوسطى لا تتغيّر ($3$).'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <TextbookBox kind="remark" title="ملاحظات" lines={KNOW4.notes} source={KNOW4.source} compact />
                  <TextbookBox kind="example" title="مثال 1" text={KNOW4.example1} source={KNOW4.source} compact />
                  <p className="text-xs text-slate-500" data-correction="know-4-1"><MathText>{KNOW4_CORRECTIONS.example1}</MathText></p>
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'رواتب 11 عاملًا', subtitle: 'نشاط 4 — الجزء الأول', done: q1a && q1b,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACT4.salariesText}</MathText></p>
              <p className="text-xs text-slate-500"><SourceTag source={ACT4.source} /></p>
              <p className="text-sm font-semibold text-slate-800" dir="ltr"><MathText>{ACT4.salaries.map((v) => `$${v}$`).join(' ، ')}</MathText></p>
              <TapQuestion
                prompt="الترتيب التصاعدي لهذه الرواتب هو:"
                options={[
                  // la bonne : 11 valeurs, chaque répétition gardée
                  '$35000$ ، $35000$ ، $35000$ ، $42000$ ، $42000$ ، $42000$ ، $50000$ ، $50000$ ، $55000$ ، $60000$ ، $65000$',
                  // les répétitions perdues : 6 valeurs seulement
                  '$35000$ ، $42000$ ، $50000$ ، $55000$ ، $60000$ ، $65000$',
                  // l'ordre décroissant
                  '$65000$ ، $60000$ ، $55000$ ، $50000$ ، $50000$ ، $42000$ ، $42000$ ، $42000$ ، $35000$ ، $35000$ ، $35000$',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['tartib-adad']}
                explain={<MathText>{'نرتّب القيم الإحدى عشرة من الأصغر إلى الأكبر ونحتفظ بكل تكرار: الراتب $35000$ ثلاث مرّات، و $42000$ ثلاث مرّات. الترتيب الثالث تنازلي.'}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              <NumericQuestion
                prompt={<MathText>{'الراتب الذي يجزئ هذه السلسلة إلى سلسلتين لهما نفس التكرار (بالدينار):'}</MathText>}
                expected={42000}
                display="42000"
                requires={['tartib-adad', 'wasit']}
                explain={<MathText>{`${ACT4_LINES.sorted} . ${ACT4_LINES.salaryMed}`}</MathText>}
                onAnswered={() => setQ1b(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'حرارة الوادي', subtitle: 'نشاط 4 — الجزء الثاني', done: q2a && q2b,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACT4.oasisText}</MathText></p>
              <p className="text-sm font-semibold text-slate-800" dir="ltr"><MathText>{ACT4.oasis.map((v) => `$${v}$`).join(' ، ')}</MathText></p>
              <BatchChoiceQuestion
                rows={[
                  // 48 = la plus grande valeur ; 10 = le nombre de jours
                  { id: 'r', label: 'مدى السلسلة', options: ['$48$', '$14$', '$10$'].map(Opt), correct: 1, correction: <MathText>{ACT4_LINES.oasisRange}</MathText> },
                  // 41 = milieu de l'étendue (34 + 48)/2 ; 39 ≠ 39,3
                  { id: 'm', label: 'متوسط السلسلة', options: ['$41$', '$39$', '$39{,}3$'].map(Opt), correct: 2, correction: <MathText>{`${ACT4_LINES.oasisMean} . العدد $41$ منتصف أصغر قيمة وأكبر قيمة، وليس المتوسط.`}</MathText> },
                ]}
                requires={['mada-nashat', 'mutawassit-mutawazin']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'المدى والمتوسط مؤشّران مختلفان.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2a(true)}
              />
              {curtainEvidence}
              <NumericQuestion
                prompt={<MathText>{'رتّب السلسلة ترتيبًا تنازليًا، ثم أعط وسيطها (بالدرجة):'}</MathText>}
                expected={38.5}
                parse={parseDec}
                display="38,5"
                requires={['wasit']}
                explain={<MathText>{`${ACT4_LINES.oasisSorted} . ${ACT4_LINES.oasisMed} لا يكفي أخذ قيمة واحدة: عدد القيم زوجي.`}</MathText>}
                onAnswered={() => setQ2b(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'مدى سلسلة إحصائية', subtitle: 'معارف 3', done: q4,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'مدى السلسلة $-3$ ، $7$ ، $2$ ، $-8$ ، $5$ هو:'}</MathText>}
                expected={15}
                parse={parseDec}
                display="15"
                requires={['mada-nashat']}
                explain={<MathText>{'أكبر قيمة $7$ وأصغر قيمة $-8$ : $7 - (-8) = 15$ . (ليس $7 - 2$ ولا $7 - (-3)$ : أصغر قيمة هي $-8$.)'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <>
                  <TextbookBox kind="definition" title={KNOW3.title} text={KNOW3.definition} source={KNOW3.source} compact />
                  <TextbookBox kind="remark" text={KNOW3.note} source={KNOW3.source} compact />
                  <TextbookBox kind="example" text={KNOW3.example} source={KNOW3.source} compact />
                  <KnowledgeBrick id="mada" variant="rappel" lead="ما سمّيناه في نشاط 3، لكل سلسلة:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 6, title: 'أوزان 41 تلميذًا', subtitle: 'نشاط 4 — الجزء الثالث', done: q5,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACT4.weightsText}</MathText></p>
              <FreqTable testId="weights" rows={[{ head: 'الوزن P (kg)', cells: ACT4.classes }, { head: 'عدد التلاميذ', cells: ACT4.classFreqs.map(String) }]} />
              <PredictRule id="markaz-fia">
                <BatchChoiceQuestion
                  rows={[
                    // 4 = l'amplitude ; 34 = la borne inférieure
                    { id: 'c', label: <MathText>{'مركز الفئة $34 \\le P < 38$'}</MathText>, options: ['$34$', '$4$', '$36$'].map(Opt), correct: 2, correction: <MathText>{ACT4_LINES.centers}</MathText> },
                    // 44 = moyenne des cinq centres sans effectifs ; 1816/5 divise par le nombre de classes
                    { id: 'm', label: 'الوزن المتوسط (تقدير)', options: ['$\\dfrac{1816}{41} \\approx 44{,}29$', '$44$', '$\\dfrac{1816}{5} = 363{,}2$'].map(Opt), correct: 0, correction: <MathText>{`${ACT4_LINES.weightsMean} . العدد $44$ متوسط المراكز الخمسة دون أعداد التلاميذ.`}</MathText> },
                    // 38–42 : le cumul 14 < 21 ; 46–50 : 35 dépasse déjà
                    { id: 'f', label: 'الفئة الوسيطية', options: ['$38 \\le P < 42$', '$42 \\le P < 46$', '$46 \\le P < 50$'].map(Opt), correct: 1, correction: <MathText>{ACT4_LINES.medianClass}</MathText> },
                  ]}
                  requires={['mutawassit-mutawazin', 'takrar-mujamma-said']}
                  feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'كل فئة يمثّلها مركزها، بقدر تكرارها.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                  onAnswered={() => setQ5(true)}
                />
              </PredictRule>
              {q5 && (
                <>
                  <KnowledgeBrick id="markaz-fia" lead="في سلسلة مجمّعة في فئات:" />
                  <TextbookBox kind="example" title="مثال 2" text={KNOW4.example2} source={KNOW4.source} compact />
                  <FreqTable testId="heights" rows={[{ head: 'القامة t (cm)', cells: KNOW4.example2Table.classes }, { head: 'التكرار', cells: KNOW4.example2Table.freqs.map(String) }, { head: 'التكرار المجمع الصاعد', cells: KNOW4.example2Table.up.map(String) }]} />
                  <p className="text-xs text-slate-500" data-correction="know-4-2"><MathText>{KNOW4_CORRECTIONS.example2}</MathText> <SourceTag source={KNOW4_CORRECTIONS.source} /></p>
                  <KnowledgeBrick id="fia-wasitiya" lead="والوسيط في فئات:" />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
