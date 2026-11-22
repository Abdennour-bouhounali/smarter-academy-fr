import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS, LAB, LESSON_TITLES, analysisText } from '../content/textbook';
import { MODEL } from '../content/figures';
import { BASE } from '../../_unit/unitMeta';

/**
 * Module 7 (ex-1) — la وضعية « ممر الراجلين » (p. 136) lue dans les TROIS étapes du « تحليل الوضعية » du manuel (قراءة
 * الوضعية وفهمها · تحليل الوضعية واختيار استراتيجية حل · تنفيذ استراتيجية الحل المختارة), chaque partie renvoyée au درس
 * qui l'enseigne (la translation et l'égalité de deux vecteurs = درس 1 ; le متوازي أضلاع = درس 2 ; la démarche de
 * preuve = درس 4), comme les synthèses des unités 2 à 10.
 *
 * LE WORKSPACE (un type, deux niveaux — `bridge-path`, écrit pour cette leçon ; props dans content/textbook.js › LAB) :
 *   متقدم  la وضعية du manuel avec l'exemple chiffré de la plateforme (déclaré) : l'élève déplace le passage, lit la
 *          longueur, pose B′ par la translation de vecteur NM, puis aligne A, M, B′ (minimum √85 + 2) ;
 *   مبتدئ  une passerelle sur la gorge du Rhummel (Constantine), l'optimum hors du milieu, un fantôme de NM attaché à B.
 * Ouvert sur متقدم (ouvert sur مبتدئ par défaut depuis 2026-10-09) : c'est la وضعية du module. Les essais de l'élève (`onTrial`) sont listés
 * au-dessus des questions d'exécution (`[data-activity-evidence]`). Aucune étape n'attend le lab (`onFinished`).
 * RÉTROFIT 2026-10-15 (§4quater, synthèse : édition minimale) : plus de carte au-dessus du labo ni de titre / `lead` de workspace ;
 * l'énoncé et son modèle (`[data-situation]`) sont lus à l'étape 1 ; les briques restaient déjà après leurs réponses.
 * LP : P2 (lire, fixe / variable, modéliser), P3 (B′, le متوازي أضلاع, M et N), P1 (tout mobiliser, le minimum chiffré).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];
const FIXED = ['ثابت', 'متغيّر'];

/** Un essai du lab (`onTrial`, logic/bridgePath.js › evidenceOf), en une ligne LTR. */
function trialLine(e) {
  if (!e || typeof e !== 'object') return null;
  if (e.stage === 'cross' || e.stage === 'straight') return `d = ${e.d} : L ≈ ${e.total}${e.stage === 'straight' && e.optimal ? ' ✓' : ''}`;
  if (e.stage === 'pin') return e.kind === 'equal' ? "BB' = NM ✓" : "BB' ≠ NM ✗";
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
  // les questions posées PAR-DESSUS le labo (LabCheckpoint, rubriques explore · translate · straight) : leur trace (`checkpoint-done`) fait avancer les étapes 4, 5 et 7
  const [cpDone, setCpDone] = useState({});
  const keep = (e) => {
    if (!e) return;
    if (e.tk) { if (e.tk === 'checkpoint-done') setCpDone((d) => ({ ...d, [e.id]: true })); return; }
    setTrials((list) => [...list, e]);
  };

  return (
    <ContentModule objectives={["أين نضع الممر ليكون المسلك أقصر ما يمكن؟", "ما الذي يتغيّر في المسلك وما الذي يبقى ثابتًا؟", "كيف أستبدل المسلك بمسلك له الطول نفسه؟"]} ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="الوضعية وتحليلها" moduleSubtitle="ممر الراجلين أمام المدرسة: أين نضعه؟" estimatedTime="22 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation type="bridge-path" level="beginner" {...LAB.beginner} lead="جسر للراجلين فوق وادي الرمال بقسنطينة." onTrial={keep} />
            ),
            advanced: () => (
              <Manipulation type="bridge-path" level="advanced" {...LAB.advanced} lead="وضعية الكتاب: ممر للراجلين بين الحي والمدرسة." onTrial={keep} />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'المرحلة 1 من الكتاب: ما الثابت وما المتغيّر؟', done: !!q[1],
          content: (
            <div className="space-y-3">
              {/* La وضعية (ex-carte du haut) : le lab ouvre le module, l'énoncé et son modèle sont lus ici, à l'étape « قراءة الوضعية ». */}
              <div className="space-y-2" data-situation="mamar-rajilin">
                <p className="font-bold">{SITUATION.title}</p>
                <p><MathText>{SITUATION.text}</MathText></p>
                <GeoFigure {...MODEL} />
                <p className="text-xs text-slate-500" data-example-note><MathText>{REMARKS.example}</MathText> <SourceTag source={SITUATION.example} /></p>
              </div>
              <Phase i={0} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">عندما نحرّك الممر على الطريق (المختبر أعلاه)، احكم على كل عنصر.</p>}
                rows={[
                  { id: 'A', label: 'النقطة A (الحي)', options: FIXED, correct: 0, correction: 'الحي لا يتحرّك.' },
                  { id: 'B', label: 'النقطة B (المدرسة)', options: FIXED, correct: 0, correction: 'المدرسة لا تتحرّك.' },
                  { id: 'M', label: 'النقطتان M و N', options: FIXED, correct: 1, correction: 'M و N طرفا الممر: تتحرّكان معه.' },
                  { id: 'MN', label: 'الطول MN', options: FIXED, correct: 0, correction: <MathText>{REMARKS.bud}</MathText> },
                  { id: 'AM', label: 'الطولان AM و NB', options: FIXED, correct: 1, correction: 'كلما اقترب الممر من A قصر AM وطال NB.' },
                ]}
                requires={['bud-mutawaziyayn']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.thabit}` : REMARKS.thabit}</MathText>}
                onAnswered={mark(1)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : le retour de la question ci-dessus (REMARKS.thabit) et la correction de MN (REMARKS.bud, prérequis
                  `bud-mutawaziyayn`) viennent de dire ce qui est fixe et ce qui varie. */}
              {q[1] && <KnowledgeBrick id="thabit-mutaghayyir" variant="rappel" />}
            </div>
          ) },
        { num: 2, title: 'تحليل الوضعية: أقصر مسافة', subtitle: 'المرحلة 2 من الكتاب: ما الأداة؟', done: !!q[2],
          content: (
            <div className="space-y-3">
              <Phase i={1} />
              <TapQuestion
                prompt={<MathText>{"A و B′ نقطتان متمايزتان. ما هو الشرط الذي تحقّقه النقطة M حتى يكون $AM + MB'$ أقصر ما يمكن؟"}</MathText>}
                options={[
                  "M نقطة من القطعة $[AB']$",
                  "M منتصف القطعة $[AB']$ فقط",
                  "$AM = MB'$",
                  "M على محور القطعة $[AB']$",
                ].map(M)}
                correct={0} cols={2} requires={['mutabayina-muthallathiya']}
                explain={<MathText>{`${REMARKS.mutabayina} كل نقطة من $[AB']$ تعطي الطول نفسه $AB'$ ، لا المنتصف وحده؛ و $AM = MB'$ صحيحة لكل نقطة من المحور، وأغلبها خارج $[AB']$ .`}</MathText>}
                onAnswered={mark(2)} />
            </div>
          ) },
        { num: 3, title: 'تحليل الوضعية: مسلك له نفس الطول', subtitle: 'نستبدل المسلك المطلوب', done: !!q[3],
          content: (
            <div className="space-y-3">
              <Evidence id="mamar" trials={trials} title="محاولاتك في المختبر:"
                empty="لم تحرّك الممر بعد: في المختبر اسحبه على الطريق، ثم انقل المدرسة B بشعاع الممر." />
              <p className="text-sm text-slate-700">المسلك من A إلى M ثم N ثم B ينكسر مرتين. فكرة الكتاب: نستبدله بمسلك له نفس الطول.</p>
              <TapQuestion
                prompt={<MathText>{'B′ صورة B بالانسحاب الذي شعاعه $\\overrightarrow{NM}$ . المساواة الصحيحة هي:'}</MathText>}
                options={[
                  "$\\overrightarrow{BB'} = \\overrightarrow{NM}$",
                  "$\\overrightarrow{B'B} = \\overrightarrow{NM}$",
                  "$\\overrightarrow{BB'} = \\overrightarrow{MN}$",
                  "$\\overrightarrow{NB'} = \\overrightarrow{MB}$",
                ].map(M)}
                correct={0} cols={2} requires={['sura-insihab']}
                explain={<MathText>{`${REMARKS.istibdal} الشعاع يبدأ من النقطة B وينتهي عند صورتها B′، ولا يُكتب من الصورة إلى النقطة. ${REMARKS.ittijahWhy}`}</MathText>}
                onAnswered={mark(3)} />
              <BackLink lesson="insihab-shuaa" what="صورة نقطة بانسحاب وتساوي شعاعين" />
              {q[3] && <p className="text-xs text-slate-600" data-misconception-note="ittijah"><MathText>{`خطأ شائع: ${REMARKS.ittijahWrong} ${REMARKS.ittijahWhy}`}</MathText></p>}
            </div>
          ) },
        { num: 4, title: 'تنفيذ: دراسة الرباعي MB′BN', subtitle: 'المرحلة 3 من الكتاب', done: !!cpDone.translate,
          content: (
            <div className="space-y-3">
              <Phase i={2} />
              {!cpDone.translate && (
                <p className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-500" data-evidence="translate-todo">
                  <MathText>{"جرّب مرّتين في المختبر، ثم افتح النقل وضع B′ حيث $\\overrightarrow{BB'} = \\overrightarrow{NM}$ ، وأجب عن أسئلته فوق المختبر."}</MathText>
                </p>
              )}
              {cpDone.translate && <p className="text-sm font-bold text-emerald-900" data-evidence="translate-answered"><MathText>{REMARKS.masar}</MathText></p>}
              <BackLink lesson="shuaayn-mutasawiyayn" what="الشعاعان المتساويان ومتوازي الأضلاع" />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : image par translation et égalité de vecteurs (`sura-insihab`), parallélogramme (`mutawazi-tartib`,
                  درس shuaayn-mutasawiyayn) ; l’étape 3 et les corrections p1–p4 (REMARKS.mutawazi / masar) viennent de le dire. */}
              {cpDone.translate && <KnowledgeBrick id="insihab-mamar" variant="rappel" />}
            </div>
          ) },
        { num: 5, title: 'تنفيذ: موقع M', subtitle: 'متى يكون AM + MB′ أقصر ما يمكن؟', done: !!cpDone.straight,
          content: (
            <div className="space-y-3">
              {!cpDone.straight && (
                <p className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-500" data-evidence="straight-todo">
                  حرّك الممر في المختبر حتى تستقيم A و M و B′ ، وأجب عن أسئلة هذا الوضع فوق المختبر.
                </p>
              )}
              {cpDone.straight && <p className="text-xs text-slate-600" data-misconception-note="mubashir"><MathText>{`خطأ شائع: ${REMARKS.mubashirWrong} ${REMARKS.mubashirWhy}`}</MathText></p>}
            </div>
          ) },
        { num: 6, title: 'تنفيذ: موقع N', subtitle: 'آخر سؤال من الكتاب', done: !!q[6],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="وما هو موقع النقطة N؟"
                options={[
                  'صورة M بالانسحاب الذي شعاعه $\\overrightarrow{MN}$ : المسقط العمودي لـ M على الحافة السفلى',
                  "نقطة تقاطع القطعة $[AB']$ مع الحافة السفلى",
                  'صورة B بالانسحاب الذي شعاعه $\\overrightarrow{NM}$',
                  'منتصف القطعة [MB]',
                ].map(M)}
                correct={0} cols={1} requires={['insihab-mamar']}
                explain={<MathText>{`${REMARKS.N} النقطة التي تقطع فيها $[AB']$ الحافة السفلى ليست تحت M، والممر [MN] عمودي على الحافتين؛ وصورة B هي B′ لا N.`}</MathText>}
                onAnswered={mark(6)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : l’inégalité triangulaire (`mutabayina-muthallathiya`, étape 2 : REMARKS.mutabayina) ; les explications
                  des étapes 5 et 6 (REMARKS.M / N) viennent de placer M et N. */}
              {q[6] && <KnowledgeBrick id="aqsar-masar" variant="rappel" />}
              <BackLink lesson="barahin-ashia" what="حل مشكلات بتوظيف الأشعة والانسحاب" />
            </div>
          ) },
        { num: 7, title: 'تنفيذ بالأعداد', subtitle: 'مثال المنصّة على ورقة مرصوفة', done: !!cpDone.straight,
          content: (
            <div className="space-y-3">
              <Evidence id="mamar-min" trials={trials} title="محاولاتك في المختبر:"
                empty="جرّب في المختبر: بعد نقل B إلى B′، حرّك الممر حتى يستقيم المسلك A ثم M ثم B′." />
              <p className="text-sm"><MathText>{REMARKS.Bp}</MathText></p>
              {cpDone.straight && <p className="text-sm font-bold text-emerald-900" data-evidence="minimum-answered"><MathText>{`${REMARKS.ABp} ${REMARKS.Lmin}`}</MathText></p>}
            </div>
          ) },
        { num: 8, title: 'التحقّق وتحرير الحل', subtitle: 'آخر المرحلة 3: هل النتيجة ملائمة؟', done: !!q[8],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">قبل أن نكتب الجواب، احكم على كل عبارة.</p>}
                rows={[
                  { id: 'v1', label: <MathText>{'الطول $\\sqrt{113} \\approx 10{,}63$ أقصر من $11{,}22$ ، فالمسلك على [AB] أفضل.'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.AB}</MathText> },
                  { id: 'v2', label: 'في المثال، A و M و B′ على استقامة واحدة.', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.M}</MathText> },
                  { id: 'v3', label: <MathText>{'في المثال، $AM = NB$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.sym}</MathText> },
                  { id: 'v4', label: 'الممر في منتصف المسافة الأفقية بين A و B مهما كان بعد A و B عن الطريق.', options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.sym}</MathText> },
                ]}
                requires={['aqsar-masar']}
                feedback={({ allRight }) => <MathText>{allRight ? `أحسنت. ${REMARKS.Lmin}` : REMARKS.M}</MathText>}
                onAnswered={mark(8)} />
              {q[8] && (
                <>
                  <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900"><MathText>{SITUATION.closing}</MathText></p>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la démarche remet en ordre les trois étapes du « تحليل الوضعية » que l’élève vient de lire
                      (encadrés des étapes 1, 2 et 4). */}
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                </>
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
