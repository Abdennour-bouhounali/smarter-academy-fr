import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS, LAB, LESSON_TITLES, analysisText } from '../content/textbook';
import { MODEL } from '../content/figures';
import { BASE } from '../../_unit/unitMeta';
import SightLineFigure from '../components/SightLineFigure';

/**
 * Module 7 — la وضعية « مقام الشهيد » (p. 124) lue dans les TROIS étapes du « تحليل الوضعية » du manuel (قراءة
 * الوضعية وفهمها · تحليل الوضعية واختيار استراتيجية حل مناسبة · تنفيذ استراتيجية الحل), chaque partie renvoyée au درس
 * qui l'enseigne (Thalès = unité 9 ; la tangente = درس 1 ; la touche inverse et l'arrondi = درس 2 ; la modélisation =
 * درس 4), comme les synthèses des unités 2 à 9.
 *
 * LE WORKSPACE (un type, deux niveaux — `clinometer` de la leçon 4 réutilisé SANS modification, mode `align`, monde
 * `maqam` ; props dans content/textbook.js › LAB) :
 *   متقدم  la وضعية du manuel : poteau de 2,30 m à 95,65 m ; l'élève glisse أريس au sol jusqu'à ce que le sommet du
 *          poteau cache celui du مقام (2,45 m), puis le lab montre les deux triangles et l'angle x ;
 *   مبتدئ  un réverbère de 3 m à 89 m : le même مقام, l'alignement à 3 m (tan x = 1, x = 45°).
 * Ouvert sur متقدم (ouvert sur مبتدئ par défaut depuis 2026-10-09) : c'est la وضعية du module. Les essais de l'élève (`onTrial`) sont
 * listés au-dessus des questions d'exécution (`[data-activity-evidence]`). Aucune étape n'attend le lab (`onFinished`).
 * Rétrofit 2026-10-15 : plus de carte `brief` au-dessus du labo (le labo ouvre le module, contexte dans son `lead`) ; le texte de la وضعية et sa
 * figure sont lus à l'étape 1, avec la phase « قراءة الوضعية » ; briques déjà APRÈS la réponse.
 * LP : P2 (lire, modéliser), P1 (mobiliser Thalès, la tangente, la calculatrice), P3 (écrire, calculer, arrondir, vérifier).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];
const close = (target) => (n) => Number.isFinite(n) && Math.abs(n - target) < 1e-9;

/**
 * Un essai du clinomètre (`onTrial`, logic/clinometer.js › evidenceOf), en une ligne LTR : la place d'أريس derrière le
 * poteau (✓ alignés, ↑ le sommet du poteau passe au-dessus du sommet du مقام, ↓ en dessous), puis le rapport choisi.
 */
const ALIGN_MARK = { aligned: '✓', over: '↑', under: '↓' };
function trialLine(e) {
  if (!e || typeof e !== 'object') return null;
  if (e.stage === 'align') return `d = ${e.d} m ${ALIGN_MARK[e.kind] ?? ''}`;
  if (e.stage === 'angle') return `tan x → x ≈ ${e.x}° ; h ≈ ${e.H} m`;
  if (e.stage === 'refusal' && e.ratio) return `${e.ratio} x ✗`;
  return null;
}

function Evidence({ trials, title, empty, id }) {
  const shown = trials.map(trialLine).filter(Boolean).slice(-6);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={id}>
      {shown.length === 0 && <p className="text-slate-500" data-tried="false">{empty}</p>}
      {shown.length > 0 && (
        <div data-tried="true">
          <p>{title}</p>
          <ul className="ms-4 list-disc">{shown.map((s, i) => <li key={i}><bdi dir="ltr" className="font-mono">{s}</bdi></li>)}</ul>
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
  const [cps, setCps] = useState({});
  // les événements `checkpoint-done` du labo (questions posées par-dessus le labo) ne sont pas des essais : ils marquent les étapes faites
  const keep = (e) => {
    if (e?.tk) { if (e.tk === 'checkpoint-done') setCps((c) => ({ ...c, [e.id]: true })); return; }
    setTrials((list) => [...list, e]);
  };
  const Trace = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule objectives={["كيف نقيس ارتفاع معلم لا نصعده؟", "أيّ معرفة تناسب الشكل: طالس أم النسب المثلثية؟", "كيف نعيّن قيس الزاوية x ثم نتحقّق من ملاءمة النتيجة؟"]}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="الوضعية وتحليلها" moduleSubtitle="ارتفاع «مقام الشهيد» بعمود كهربائي وخط نظر" estimatedTime="20 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation type="clinometer" level="beginner" {...LAB.beginner} lead="أريس يريد قياس ارتفاع «مقام الشهيد»: عمود إنارة طوله 3 أمتار على بعد 89 مترا منه." onTrial={keep} />
            ),
            advanced: () => (
              <Manipulation type="clinometer" level="advanced" {...LAB.advanced} lead="وضعية الكتاب: عمود كهربائي طوله 2,30 مترا على بعد 95,65 مترا من «مقام الشهيد»." onTrial={keep} />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'المرحلة 1 من الكتاب: ما المطلوب؟', done: !!q[1],
          content: (
            <div className="space-y-3" data-situation="maqam-echahid">
              <p className="font-bold">{SITUATION.title}</p>
              <p><MathText>{SITUATION.text}</MathText></p>
              <SightLineFigure {...SITUATION.figure} landmark="maqam" />
              <p className="text-xs text-slate-500" data-reading-note="95,65"><MathText>{REMARKS.reading}</MathText></p>
              <SourceTag source={SITUATION.source} />
              <Phase i={0} />
              <TapQuestion
                prompt="ما المطلوب في نص الوضعية؟"
                options={[
                  'ارتفاع «مقام الشهيد»، وقيس الزاوية x بين الأرض وخط النظر عند أريس',
                  'طول العمود الكهربائي',
                  'المسافة بين أريس وقاعدة المقام فقط',
                  'ارتفاع المقام فقط',
                ].map(M)}
                correct={0} cols={1} requires={['talis-nazar']}
                explain={<MathText>{'النص يطلب أمرين: «ساعد أريس على إيجاد ارتفاع هذا المقام» و «عيّن قيس الزاوية x». طول العمود $2{,}30\\,\\mathrm{m}$ معطى، والمسافتان على الشكل معطاتان.'}</MathText>}
                onAnswered={mark(1)} />
            </div>
          ) },
        { num: 2, title: 'تحليل الوضعية واختيار استراتيجية', subtitle: 'المرحلة 2 من الكتاب: أيّ معرفة؟', done: !!q[2],
          content: (
            <div className="space-y-3">
              <Phase i={1} />
              <p className="text-sm"><MathText>{REMARKS.names}</MathText></p>
              <GeoFigure {...MODEL} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">في نموذج الوضعية (الشكل أعلاه)، احكم على كل عبارة.</p>}
                rows={[
                  { id: 's1', label: 'العمود [PQ] والمقام [MS] عموديان على الأرض فهما متوازيان.', options: TRUE_FALSE, correct: 0, correction: 'مستقيمان عموديان على مستقيم واحد (الأرض) متوازيان.' },
                  { id: 's2', label: 'النقط A و Q و S على استقامة (خط النظر)، والنقط A و P و M على استقامة (الأرض).', options: TRUE_FALSE, correct: 0, correction: 'أريس يرى القمتين على خط واحد، والقاعدتان وموضعه على الأرض.' },
                  { id: 's3', label: 'نحسب h بخاصية فيثاغورس في المثلث APQ وحده.', options: TRUE_FALSE, correct: 1, correction: 'فيثاغورس في APQ يعطي الطول AQ ولا يذكر h: نحتاج المثلثين APQ و AMS معًا، أي خاصية طالس.' },
                  { id: 's4', label: 'الزاوية x زاوية في المثلثين APQ و AMS معًا.', options: TRUE_FALSE, correct: 0, correction: 'رأس الزاوية x هو A، الرأس المشترك للمثلثين، وضلعاها الأرض وخط النظر.' },
                ]}
                requires={['talis-nazar', 'nisab-tarif']}
                feedback={({ allRight }) => <MathText>{allRight ? 'أحسنت: مستقيمان متوازيان يقطعان مستقيمين متقاطعين في A — وضعية طالس، والمثلث APQ قائم في P.' : REMARKS.nazar}</MathText>}
                onAnswered={mark(2)} />
              <BackLink lesson="tarrid-muthallathiya" what="ترجمة وضعية إلى مثلث قائم" />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : Thalès est un prérequis (`talis-nazar`, unité 9) ; les corrections s1–s4 et le retour de la question
                  ci-dessus (REMARKS.nazar) viennent de le dire pour cette ligne de visée. */}
              {q[2] && <KnowledgeBrick id="talis-khatt-nazar" variant="rappel" />}
            </div>
          ) },
        { num: 3, title: 'تنفيذ: المساواة اللازمة', subtitle: 'المرحلة 3 — على الأرض، ثم بالقلم', done: !!q[3],
          content: (
            <div className="space-y-3">
              <Phase i={2} />
              <Evidence id="maqam" trials={trials} title="مواضعك أمام المقام (المختبر):"
                empty="لم تحرّك أريس بعد: في المختبر اسحبه على الأرض حتى تختفي قمة المقام خلف قمة العمود." />
              <TapQuestion
                prompt="المساواة التي تعطيها خاصية طالس في المثلثين APQ و AMS:"
                options={[
                  '$\\dfrac{h}{2{,}30} = \\dfrac{98{,}1}{2{,}45}$',
                  '$\\dfrac{h}{2{,}30} = \\dfrac{95{,}65}{2{,}45}$',
                  '$\\dfrac{2{,}30}{h} = \\dfrac{98{,}1}{2{,}45}$',
                  '$h = 2{,}30 + 95{,}65$',
                ].map(M)}
                correct={0} cols={2} requires={['talis-khatt-nazar']}
                explain={<MathText>{`${REMARKS.AM} ثم ${REMARKS.talisEq} . ${REMARKS.nazarWhy} وقلب نسبة واحدة يعطي مساواة خاطئة، والأطوال لا تُجمع.`}</MathText>}
                onAnswered={mark(3)} />
              <BackLink lesson="talis-hisab-atwal" what="كتابة النسب المتساوية في وضعية طالس" />
              {q[3] && <p className="text-xs text-slate-600" data-misconception-note="nazar"><MathText>{`خطأ شائع: ${REMARKS.nazarWrong} ${REMARKS.nazarWhy}`}</MathText></p>}
            </div>
          ) },
        { num: 4, title: 'تنفيذ: ارتفاع المقام', subtitle: 'نحسب ثم ندوّر', done: !!q[4],
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt="ما ارتفاع المقام h مدوّرا إلى الجزء من 100 (بالمتر)؟"
                expected={close(92.09)} display="92,09" parse={parseDec}
                requires={['talis-khatt-nazar', 'tadwir']}
                explain={<MathText>{REMARKS.hCalc}</MathText>}
                explainFor={(n) => <MathText>{close(89.79)(n) ? `استعملت المسافة 95,65 بين العمود والمقام. ${REMARKS.nazarWhy} ${REMARKS.hCalc}` : close(92)(n) || close(92.1)(n) ? `المطلوب التدوير إلى الجزء من 100. ${REMARKS.hCalc}` : REMARKS.hCalc}</MathText>}
                onAnswered={mark(4)} />
              {q[4] && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900" data-real-height="92"><MathText>{REMARKS.real}</MathText></p>}
            </div>
          ) },
        { num: 5, title: 'تنفيذ: الزاوية x', subtitle: 'أيّ نسبة في المثلث الصغير؟', done: !!cps.a2,
          content: (
            <div className="space-y-3">
              <Trace id="a2-ratio" ok={!!cps.a2}
                done={<MathText>{`أجبتَ في المختبر: ${REMARKS.tanX} الجيب يحتاج الوتر AQ وهو غير معطى.`}</MathText>}
                todo="أوقف أريس حيث تختفي قمة المقام خلف قمة العمود، ثم اختر النسبة وأجب عن الأسئلة التي تظهر فوق المختبر." />
              <BackLink lesson="nisab-muthallathiya" what="الظل: الضلع المقابل على الضلع المجاور" />
            </div>
          ) },
        { num: 6, title: 'تنفيذ: قيس الزاوية x', subtitle: 'الحاسبة ثم التدوير إلى الدرجة', done: !!cps.a2,
          content: (
            <div className="space-y-3">
              <Evidence id="maqam-angle" trials={trials} title="مواضعك أمام المقام (المختبر):"
                empty="جرّب في المختبر: عندما تختفي قمة المقام خلف قمة العمود اختر النسبة التي تعطي الزاوية x." />
              <Trace id="a2-angle" ok={!!cps.a2}
                done={<MathText>{`حسبتَ x في المختبر وقرّبتَه إلى الدرجة: ${REMARKS.xCalc}`}</MathText>}
                todo="احسب x في المختبر بالحاسبة (tan⁻¹) وقرّبه إلى الدرجة." />
              <BackLink lesson="hasiba-muthallathiya" what="تعيين قيس زاوية بالحاسبة وتدويره" />
              {cps.a2 && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la tangente (`nisab-tarif`, درس nisab-muthallathiya) et la touche inverse (`hasiba-aks`,
                      درس hasiba-muthallathiya) ; les explications des étapes 5 et 6 (REMARKS.tanX / xCalc) viennent de l’énoncer. */}
                  <KnowledgeBrick id="zawiya-bi-zill" variant="rappel" />
                  <p className="text-xs text-slate-600" data-misconception-note="qays"><MathText>{`خطأ شائع: ${REMARKS.qaysWrong} ${REMARKS.qaysWhy}`}</MathText></p>
                </>
              )}
            </div>
          ) },
        { num: 7, title: 'التحقّق وتحرير الحل', subtitle: 'آخر المرحلة 3: هل النتيجة ملائمة للواقع؟', done: !!q[7],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">قبل أن نكتب الجواب، احكم على كل عبارة.</p>}
                rows={[
                  { id: 'v1', label: <MathText>{'في المثلث الكبير، $\\tan x = \\dfrac{h}{98{,}1}$ يعطي القيس نفسه.'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.check}</MathText> },
                  { id: 'v2', label: <MathText>{'يمكن تدوير $\\tan x$ إلى $0{,}9$ قبل اللمسة العكسية دون أن يتغيّر المدوّر إلى الدرجة.'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.tadwirMubakkir}</MathText> },
                  { id: 'v3', label: 'الزاوية بين خط النظر والمقام في القمة S ليست x بل متمّمتها.', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.mutammima}</MathText> },
                  { id: 'v4', label: <MathText>{'لو وجدنا $h \\approx 2{,}35\\,\\mathrm{m}$ لقبلنا النتيجة.'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{'المقام أعلى بكثير من العمود ( $2{,}30\\,\\mathrm{m}$ ): نتيجة كهذه غير ملائمة للواقع، فنبحث عن الخطأ في المساواة.'}</MathText> },
                ]}
                requires={['zawiya-bi-zill', 'talis-khatt-nazar']}
                feedback={({ allRight }) => <MathText>{allRight ? REMARKS.jumla : REMARKS.check}</MathText>}
                onAnswered={mark(7)} />
              {q[7] && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : arrondir en fin de calcul est `tadwir` (prérequis) ; les corrections v1–v4 de la question ci-dessus
                      (REMARKS.check / tadwirMubakkir) et REMARKS.real (étape 4) viennent de le dire. */}
                  <KnowledgeBrick id="mulaamat-natija" variant="rappel" />
                  <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900"><MathText>{REMARKS.jumla}</MathText></p>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la démarche remet en ordre les trois étapes du « تحليل الوضعية » que l’élève vient de lire
                      (encadrés des étapes 1, 2 et 3). */}
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                  {/* Rappel (2026-10-13) : le triangle rectangle DANS un solide (`muthallath-fada`), exigé par les épreuves E5–E6 du test final
                      (le conteneur) ; il DIT la méthode (chercher le triangle rectangle, Pythagore deux fois), jamais une réponse. */}
                  <KnowledgeBrick id="muthallath-fada" variant="rappel" />
                </>
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
