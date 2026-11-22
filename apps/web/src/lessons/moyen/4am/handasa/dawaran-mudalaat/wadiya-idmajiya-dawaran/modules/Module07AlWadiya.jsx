import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS, LAB, LESSON_TITLES, analysisText } from '../content/textbook';
import { PLAN } from '../content/figures';
import { BASE } from '../../_unit/unitMeta';

/**
 * Module 7 — la وضعية du jardin public (p. 160) lue dans les TROIS étapes du « تحليل الوضعية » du manuel (قراءة الوضعية وفهمها ·
 * تحليل الوضعية واختيار استراتيجية حل مناسبة · تنفيذ استراتيجية الحل المختارة), chaque partie renvoyée au درس qui l'enseigne
 * (l'image par un دوران = درس 1 ; les longueurs gardées = درس 2 ; le polygone régulier, l'angle au centre et le côté = درس 4),
 * comme les synthèses des unités 2 à 12.
 *
 * LE WORKSPACE (un type, deux niveaux — `lamp-ring`, écrit pour cette leçon ; props dans content/textbook.js › LAB) :
 *   متقدم  la وضعية : six poteaux à la main (refusés tant que les écarts diffèrent), puis le دوران par le seul deuxième poteau
 *          (60° referme le tour), puis la distance choisie et calculée — 3 m ; en extra, 12 poteaux ;
 *   مبتدئ  un petit massif de 2 m et quatre poteaux (un carré : 90°, 2√2 ≈ 2,83 m).
 * RÉTROFIT 2026-10-15 : le labo ouvre le module (plus de carte `brief` ni de `title` / `lead` d'atelier) ; la وضعية du livre est lue à l'étape 1. Les briques étaient déjà APRÈS leur réponse.
 * Ouvert sur متقدم (ouvert sur مبتدئ par défaut depuis 2026-10-09) : c'est la وضعية du module. Les gestes jugés de l'élève (`onTrial`) sont listés
 * au-dessus de la question sur l'angle (`[data-activity-evidence]`). Aucune étape n'attend le lab (`onFinished`).
 * Déclarés : les noms P₁ … P₆ et H (la plateforme), la longueur le long du bord (π ≈ 3,14 m, ajout de l'extraction), le plan.
 * LP : P2 (lire, modéliser : la forme, le nombre, le rayon), P3 (l'angle, la distance par le triangle), P1 (tout mobiliser).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];
const d2 = (x) => (typeof x === 'number' ? TR.roundTo(x, 2) : '');

/** Un geste jugé du lab (`onTrial`, logic/lampRing.js › evidenceOf), en une ligne : arabe et îlots LTR. */
function trialLine(e) {
  if (!e || typeof e !== 'object') return null;
  const N = ({ children }) => <bdi dir="ltr" className="font-mono">{children}</bdi>;
  switch (e.kind) {
    case 'handUnequal': return <>باليد ({e.n} أعمدة): المسافات من <N>{d2(e.min)} m</N> إلى <N>{d2(e.max)} m</N> — غير متساوية ✗</>;
    case 'handOk': return <>باليد ({e.n} أعمدة): مسافات متساوية <N>≈ {d2(e.d)} m</N> ✓</>;
    case 'overshoot': return <>بالدوران <N>{e.alpha}°</N>: العمود {e.k} يتجاوز الأول ✗</>;
    case 'ringOpen': return <>بالدوران <N>{e.alpha}°</N>: الحلقة لا تنغلق (القوس الأخير <N>{e.closing}°</N>) ✗</>;
    case 'ringOk': return <>بالدوران <N>{e.alpha}°</N>: الحلقة تنغلق والأعمدة مضاءة ✓</>;
    case 'formulaKo': return <>حساب المسافة: طريقة تعطي <N>≈ {d2(e.value)} m</N> ✗</>;
    case 'formulaOk': return <>حساب المسافة: <N>≈ {d2(e.value)} m</N> ✓</>;
    default: return null;
  }
}

function Evidence({ trials, title, empty, id }) {
  const shown = trials.map(trialLine).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={id}>
      {shown.length === 0 && <p className="text-slate-500" data-tried="false">{empty}</p>}
      {shown.length > 0 && (
        <div data-tried="true">
          <p>{title}</p>
          <ul className="ms-4 list-disc">{shown.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

/** Le renvoi d'une partie de la وضعية vers le درس qui l'enseigne. */
const BackLink = ({ lesson, what }) => (
  <p className="text-xs text-slate-500" data-back-link={lesson}>{what} — <Link to={`${BASE}/${lesson}`} className="text-blue-700 underline">{LESSON_TITLES[lesson]}</Link></p>
);

/** Une étape du « تحليل الوضعية » du manuel, au mot près. */
const Phase = ({ i }) => (
  <TextbookBox kind="remark" title={SITUATION.analysis[i].label} text={analysisText(SITUATION.analysis[i])} source={SITUATION.source} compact />
);

export default function Module07AlWadiya() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const keep = (e) => { if (!e || e.tk) return; setTrials((list) => [...list, e]); };

  return (
    <ContentModule objectives={['كيف نضع ستة أعمدة متباعدة بنفس المسافة على محيط حوض دائري؟', 'بأيّ دوران ينتقل كل عمود إلى الذي يليه؟', 'كيف نحسب المسافة بين عمودين متتاليين؟']} ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="الوضعية وتحليلها" moduleSubtitle="ستة أعمدة إنارة حول حوض الأزهار: أين نضعها وكم تبعد عن بعضها؟" estimatedTime="22 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation type="lamp-ring" level="beginner" {...LAB.beginner} onTrial={keep} />
            ),
            advanced: () => (
              <Manipulation type="lamp-ring" level="advanced" {...LAB.advanced} onTrial={keep} />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'المرحلة 1 من الكتاب: ما الشكل؟ وكيف توضع الأعمدة؟', done: !!q[1],
          content: (
            <div className="space-y-3">
              <div className="space-y-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm" data-situation="hadiqa">
                <p className="font-bold">{SITUATION.title}</p>
                <p><MathText>{SITUATION.text}</MathText></p>
                <p className="text-xs text-slate-500" data-names-note>الكتاب لا يرسم الوضعية ولا يسمّي الأعمدة: سمّتها المنصّة <bdi dir="ltr">P₁</bdi> إلى <bdi dir="ltr">P₆</bdi>، ومركز الحيّز O. <SourceTag source={SITUATION.edge} /></p>
                <SourceTag source={SITUATION.source} />
              </div>
              <Phase i={0} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">رتّب المعطيات: احكم على كل عبارة.</p>}
                rows={[
                  { id: 'r1', label: <MathText>{'الحيّز المخصّص لغرس الأزهار دائرة نصف قطرها $3\\,\\mathrm{m}$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.hayyiz}</MathText> },
                  { id: 'r2', label: 'الأعمدة توضع داخل الحيّز بين الأزهار.', options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.hayyiz}</MathText> },
                  { id: 'r3', label: 'المسافات بين كل عمودين متتاليين متساوية.', options: TRUE_FALSE, correct: 0, correction: 'هذا معنى «متباعدة بنفس المسافة» في النص.' },
                  { id: 'r4', label: 'المطلوب في الوضعية هو حساب عدد الأعمدة.', options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.mutlub}</MathText> },
                ]}
                requires={['muhit-daira']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.mutlub}` : REMARKS.hayyiz}</MathText>}
                onAnswered={mark(1)} />
            </div>
          ) },
        { num: 2, title: 'تحليل الوضعية: ما الشكل الذي ترسمه الأعمدة؟', subtitle: 'المرحلة 2 من الكتاب: ما المهمة؟ كيف ننجزها؟', done: !!q[2],
          content: (
            <div className="space-y-3">
              <Phase i={1} />
              <TapQuestion
                prompt="الأعمدة الستة المتباعدة بنفس المسافة على محيط الحيّز هي رؤوس:"
                options={['سداسي منتظم مركزه مركز الحيّز', 'ست نقط كيفية: يكفي أن تكون على الدائرة', 'خماسي منتظم، لأنّ بين ستة أعمدة خمس مسافات']}
                correct={0} cols={1} requires={['mudalla-muntazam']}
                explain={<MathText>{`${REMARKS.muntazam} نقط كيفية على الدائرة لا تكون متساوية التباعد، والدائرة مغلقة: بين ستة أعمدة ستة أقواس لا خمسة.`}</MathText>}
                onAnswered={mark(2)} />
              <BackLink lesson="mudalaat-muntazama" what="المضلع المنتظم ودائرته المحيطة" />
            </div>
          ) },
        { num: 3, title: 'تحليل الوضعية: ماذا يلزم لاختيار موقع الأعمدة؟', subtitle: 'زاوية الدوران من عمود إلى الموالي', done: !!q[3],
          content: (
            <div className="space-y-3">
              <Evidence id="dawaran" trials={trials} title="محاولاتك في المختبر:"
                empty="لم تجرّب بعد: في المختبر ضع الأعمدة باليد واضغط «أشعل»، ثم جرّب الدوران بالعمود الثاني." />
              <TapQuestion
                prompt={<MathText>{'كل عمود صورة الذي قبله بالدوران الذي مركزه O مركز الحيّز. زاوية هذا الدوران هي:'}</MathText>}
                options={['$60^\\circ$', '$72^\\circ$', '$30^\\circ$', '$120^\\circ$'].map(M)}
                correct={0} cols={4} requires={['zawiya-markaziya-muntazam', 'sura-dawaran']}
                explain={<MathText>{`${REMARKS.zawiya} $72^\\circ$ تقسم الدورة على 5 (نسيان أنّ الدائرة مغلقة)، و $30^\\circ$ تقسم $180^\\circ$ على 6 (نصف الحوض فقط)، و $120^\\circ$ هي زاوية السداسي الداخلية لا الزاوية المركزية.`}</MathText>}
                onAnswered={mark(3)} />
              {q[3] && (
                <>
                  <p className="text-xs text-slate-600" data-misconception-note="amda"><MathText>{`خطأ شائع: ${REMARKS.amdaWrong} ${REMARKS.amdaWhy}`}</MathText></p>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : sommets = images par rotation et angle 360°/n sont ruus-bidawaran et markaziya-360 (درس المضلعات المنتظمة) ; l’explication de la question ci-dessus (REMARKS.zawiya) vient de le dire. */}
                  <KnowledgeBrick id="tawzi-dawaran" variant="rappel" />
                </>
              )}
              <BackLink lesson="mafhum-dawaran" what="صورة نقطة بدوران" />
            </div>
          ) },
        { num: 4, title: 'لماذا تكون المسافات متساوية؟', subtitle: 'ما الذي يضمن هذا التساوي؟', done: !!q[4],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">الأعمدة موضوعة بالدوران الذي مركزه O وزاويته 60 درجة: احكم على كل عبارة.</p>}
                rows={[
                  { id: 'k1', label: <MathText>{'الدوران يحافظ على الأطوال، فـ $P_2P_3 = P_1P_2$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.tasawi}</MathText> },
                  { id: 'k2', label: <MathText>{'كل الأعمدة على بعد $3\\,\\mathrm{m}$ من المركز O.'}</MathText>, options: TRUE_FALSE, correct: 0, correction: 'صورة نقطة بدوران مركزه O على نفس البعد من O: كل عمود على الدائرة التي مركزها O.' },
                  { id: 'k3', label: 'يكفي أن تكون الأعمدة على الدائرة لتكون المسافات بينها متساوية.', options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.daira}</MathText> },
                ]}
                requires={['khawas-dawaran-atwal', 'tawzi-dawaran']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.tasawi}` : REMARKS.daira}</MathText>}
                onAnswered={mark(4)} />
              <BackLink lesson="khawas-dawaran" what="الدوران يحافظ على الأطوال" />
            </div>
          ) },
        { num: 5, title: 'تحليل الوضعية: المسافة بين عمودين متتاليين', subtitle: 'المثلث الذي رأسه المركز', done: !!q[5],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'المثلث $OP_1P_2$ (رأساه عمودان متتاليان ورأسه الثالث المركز O):'}</MathText>}
                options={['متقايس الأضلاع: متساوي الساقين وزاويته الرئيسية $60^\\circ$', 'قائم في O', 'متساوي الساقين فقط، وزاويتا قاعدته $30^\\circ$'].map(M)}
                correct={0} cols={1} requires={['zawaya-mutasawi-saqayn', 'tawzi-dawaran']}
                explain={<MathText>{`${REMARKS.mutaqayis} الزاوية في O قيسها $60^\\circ$ لا $90^\\circ$ ، وزاويتا القاعدة $60^\\circ$ لا $30^\\circ$ .`}</MathText>}
                onAnswered={mark('5a')} />
              <NumericQuestion
                prompt="المسافة بين عمودين متتاليين (بالمتر):"
                expected={3} display="3" requires={['zawaya-mutasawi-saqayn', 'tawzi-dawaran']}
                explain={<MathText>{REMARKS.mutaqayis}</MathText>}
                onAnswered={mark(5)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : côté de l’hexagone = rayon est dans dil-mudalla (درس المضلعات المنتظمة) ; l’explication des deux questions ci-dessus (REMARKS.mutaqayis) vient de le démontrer. */}
              {q[5] && <KnowledgeBrick id="masafa-amudayn" variant="rappel" />}
            </div>
          ) },
        { num: 6, title: 'كيف نحسب المسافة؟', subtitle: 'ماذا يرسم الارتفاع النازل من المركز؟', done: !!q[6],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'H منتصف $[P_1P_2]$ و $[OH]$ الارتفاع النازل من O في المثلث $OP_1P_2$ . اختر الجواب في كل سطر.'}</MathText></p>}
                rows={[
                  { id: 't1', label: <MathText>{'قيس الزاوية $\\widehat{P_1OH}$'}</MathText>, options: ['$30^\\circ$', '$60^\\circ$', '$15^\\circ$'].map(M), correct: 0, correction: <MathText>{'الارتفاع في المثلث المتساوي الساقين ينصّف الزاوية الرئيسية: $\\dfrac{60^\\circ}{2} = 30^\\circ$ .'}</MathText> },
                  { id: 't2', label: <MathText>{'الطول $P_1H$ (بالمتر)'}</MathText>, options: ['$3\\sin 30^\\circ = 1{,}5$', '$3\\cos 30^\\circ \\approx 2{,}6$', '$3\\sin 60^\\circ \\approx 2{,}6$'].map(M), correct: 0, correction: <MathText>{'في المثلث $OHP_1$ القائم في H: الضلع المقابل للزاوية $\\widehat{P_1OH}$ هو $[P_1H]$ والوتر $[OP_1]$ ، فـ $\\sin 30^\\circ = \\dfrac{P_1H}{3}$ . الجيب لا جيب التمام، والزاوية $30^\\circ$ لا $60^\\circ$ .'}</MathText> },
                  { id: 't3', label: <MathText>{'المسافة $P_1P_2$ (بالمتر)'}</MathText>, options: ['$2 \\times 1{,}5 = 3$', '$1{,}5$', '$6$'].map(M), correct: 0, correction: <MathText>{'H منتصف $[P_1P_2]$ : $P_1P_2 = 2 \\times P_1H$ . $1{,}5$ نصف المسافة فقط، و $6$ قطر الحوض.'}</MathText> },
                ]}
                requires={['jaib-zawiya', 'irtifa-mutasawi-saqayn', 'masafa-amudayn']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.jaib}` : REMARKS.jaib}</MathText>}
                onAnswered={mark(6)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : d = 2r·sin(180°/n) est le cas général de dil-mudalla (METHOD_SIDE.general, درس المضلعات المنتظمة) ; le retour de la question ci-dessus (REMARKS.jaib) vient de faire le calcul. */}
              {q[6] && <KnowledgeBrick id="qanun-masafa" variant="rappel" />}
              <BackLink lesson="mudalaat-muntazama" what="حساب طول ضلع مضلع منتظم من نصف قطر دائرته" />
            </div>
          ) },
        { num: 7, title: 'تنفيذ: المخطط بمقياس مناسب', subtitle: 'المرحلة 3 من الكتاب', done: !!q[7],
          content: (
            <div className="space-y-3">
              <Phase i={2} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'نختار المقياس: $1\\,\\mathrm{cm}$ على المخطط لكل $1\\,\\mathrm{m}$ في الحديقة. احكم على كل عبارة.'}</MathText></p>}
                rows={[
                  { id: 'p1', label: <MathText>{'نرسم دائرة نصف قطرها $3\\,\\mathrm{cm}$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: 'نصف القطر الحقيقي 3 أمتار، والمتر يُمثَّل بسنتيمتر واحد.' },
                  { id: 'p2', label: <MathText>{'نحمل على الدائرة بالمدوّر، بفتحة $6\\,\\mathrm{cm}$ ، ست نقط متتالية.'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{`${REMARKS.sullam} الفتحة $6\\,\\mathrm{cm}$ هي القطر.`}</MathText> },
                  { id: 'p3', label: 'بعد الحملة السادسة بالمدوّر نعود إلى النقطة الأولى.', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.dawaran}</MathText> },
                ]}
                requires={['masafa-amudayn', 'tawzi-dawaran']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.sullam}` : REMARKS.sullam}</MathText>}
                onAnswered={mark(7)} />
              {q[7] && <GeoFigure {...PLAN} />}
              <BackLink lesson="mudalaat-muntazama" what="إنشاء مضلع منتظم" />
            </div>
          ) },
        { num: 8, title: 'التحقّق وتفسير النتيجة', subtitle: 'آخر المرحلة 3: هل النتيجة ملائمة؟', done: !!q[8],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">قبل أن نكتب الجواب، احكم على كل عبارة.</p>}
                rows={[
                  { id: 'v1', label: <MathText>{'على طول حافة الحوض، المسافة بين عمودين متتاليين $\\approx 3{,}14\\,\\mathrm{m}$ ، أطول من $3\\,\\mathrm{m}$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{`${REMARKS.qawsWhy} ${REMARKS.qawsRight}`}</MathText> },
                  { id: 'v2', label: <MathText>{'لو وضعنا أربعة أعمدة فقط على نفس الحوض، لبقيت المسافة بين عمودين متتاليين $3\\,\\mathrm{m}$ .'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{`${REMARKS.dilWhy} ${REMARKS.dilRight}`}</MathText> },
                  { id: 'v3', label: <MathText>{'طول الكابل الذي يربط الأعمدة الستة على التوالي $18\\,\\mathrm{m}$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.kabl}</MathText> },
                ]}
                requires={['qanun-masafa', 'muhit-daira']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.qanun}` : REMARKS.dilWhy}</MathText>}
                onAnswered={mark(8)} />
              {q[8] && (
                <>
                  <p className="text-xs text-slate-600" data-misconception-note="qaws"><MathText>{`خطأ شائع: ${REMARKS.qawsWrong} ${REMARKS.qawsWhy}`}</MathText></p>
                  <p className="text-xs text-slate-600" data-misconception-note="dil"><MathText>{`خطأ شائع: ${REMARKS.dilWrong} ${REMARKS.dilWhy}`}</MathText></p>
                  <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900"><MathText>{SITUATION.closing}</MathText></p>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la démarche remet en ordre les trois étapes du « تحليل الوضعية » que l’élève vient de lire (encadrés des étapes 1, 2 et 7) et le plan à l’échelle (REMARKS.sullam, étape 7). */}
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                </>
              )}
              <BackLink lesson="mudalaat-muntazama" what="المضلعات المنتظمة وتطبيقاتها" />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
