import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { stepTemplate } from '../../../../../../common/problems/guidedProblem';
import * as SM from '../../../../../../common/manipulations/logic/shadowMeet';
import * as CC from '../../../../../../common/manipulations/logic/coneCylinder';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CHALLENGE, INTRO_THALES, SITUATION, REMARKS, LAB, LESSON_TITLES, analysisText } from '../content/textbook';
import { M7_ROUNDS, ZILL, CONE_R1, CONE_R2, R2_REQUIRED } from '../content/rounds';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';
import { BASE } from '../../_unit/unitMeta';
import { SECTION } from '../content/figures';
import MinaretFigure from '../components/MinaretFigure';
import ConeFigure from '../components/ConeFigure';

/**
 * Module 7 — « وضعية الوحدة » : le تحدّ de la page d'unité (la minaret, DOUBLON DÉCLARÉ) puis la وضعية (le cylindre dans le cône), lue dans les
 * trois phases de l'analyse (قراءة الوضعية وفهمها · تحليل الوضعية واختيار استراتيجية · تنفيذ الاستراتيجية).
 *
 * LA PAGE (l'enseignant, le mode classe) : le workspace d'avant — مبتدئ `shadow-world` (le تحدّ dans « ساحة الحيّ ») et متقدم `cone-cylinder`
 * (cône 18 / 6) ; les essais de l'élève (`onTrial`) sont listés au-dessus des questions (`[data-activity-evidence]`).
 *
 * LE LECTEUR DE MISSION (la synthèse de l'unité 9, 2026-11-10 — décisions S et verdict C ; l'élève ne voit JAMAIS l'ancienne vue) : UN
 * `LabRounds` (content/rounds.js) — la minaret à 15:00 (`shadow-meet`, la rencontre seule, sans la hauteur), deux cônes (25 / 15 à la main,
 * 25 / 10 avec deux prédictions et une égalité NUMÉRIQUE), ⭐ 21 / 14 (r fixé) et le terrain libre — puis les étapes. Les étapes 1–2 attendent
 * la manche `zill`, l'étape 7 attend `r2` et s'OUVRE sur l'égalité EN LETTRES « TC/SK = □/□ » (le labo n'en montre aucune), puis la substitution
 * 18 / 6. Les panneaux de trace sont REBÂTIS depuis les manches gagnées (étoiles gardées : un rechargement ne vide rien), jamais de volume ; un
 * cylindre refusé dans la séance appuie l'étape 10. Les liens qui quittent le lecteur (vers les leçons) n'y sont pas.
 *
 * Étapes (les deux vues) : 1 le تحدّ · 2 sa hauteur · 3 lire · 4 la coupe · 5 la stratégie · 6 « بالقلم » (l'écran du cahier : « اكتب في 3
 * أسطر ») · 7 l'égalité (lettres puis 18 / 6) · 8 h = r · 9 le volume · 10 la vérification · 11 « ورقة هاجر » (un PLAN faux : Thalès sans
 * justifier (TC) ∥ (SK)). Les deux réponses tapées s'écrivent dans leur forme (`stepTemplate`) : « [ ] m », « [ ] cm ».
 * LP : P1 (le تحدّ), P2 (coupe, équation, volume), P3 (stratégie, vérification).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];
const close = (target) => (n) => Number.isFinite(n) && Math.abs(n - target) < 1e-9;
const sw = (player, page) => <PlayerSwitch player={player} page={page} />;
// une étape `numeric` qui DÉCLARE sa forme (guidedProblem.js › stepTemplate, EXERCISE_CONTRACT « Typed steps ») : « [ ] m », « [ ] cm »
const T_M = stepTemplate({ kind: 'numeric', shape: 'quantity', unit: 'm' });
const T_CM = stepTemplate({ kind: 'numeric', shape: 'quantity', unit: 'cm' });

/** Un geste jugé dans « ساحة الحيّ » (`onTrial` de shadow-world, la page), en une ligne LTR. */
const OBJ = { minaret: 'المئذنة', stick: 'العصا', palm: 'النخلة', flag: 'السارية', lamp: 'العمود', farid: 'فريد' };
function stickLine(e) {
  if (!e) return null;
  if (e.stage === 'measure') return `${e.hour} · ${OBJ[e.obj]}: ${e.shadow} m`;
  if (e.stage === 'predict') return `${e.hour} · ${OBJ[e.obj]}: 🚩 ${e.p} m → ${e.truth} m ${e.kind === 'right' ? '✓' : '✗'}`;
  if (e.stage === 'rule') return `${e.hour} · s = h ${e.op} ${e.num} ${e.allFit ? '✓' : '✗'}`;
  if (e.stage === 'meet') return `${e.hour} · AB = ${e.d} m → O = ${e.O} m ✓`;
  if (e.stage === 'answer') return `AM = ${e.h} m ${e.kind === 'right' ? '✓' : '✗'}`;
  return null;
}
/** Un essai du cylindre (`onTrial` de cone-cylinder, la page). */
function coneLine(e) {
  if (!e) return null;
  if (e.pierce) return `h = ${e.h} ، r = ${e.r} ✗`;
  return `h = ${e.h} ، r = ${e.r} ${e.inscribed ? '✓' : '…'} V = ${e.vop}π`;
}

function Evidence({ trials, line, title, empty, id }) {
  const shown = trials.map(line).filter(Boolean).slice(-6);
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

/** Le renvoi d'une partie de la وضعية vers le درس qui l'enseigne — la PAGE seulement (le lecteur ne se quitte pas par un lien). */
const BackLink = ({ lesson, what }) => (
  <p className="text-xs text-slate-500" data-back-link={lesson}>{what} — <Link to={`${BASE}/${lesson}`} className="text-blue-700 underline">{LESSON_TITLES[lesson]}</Link></p>
);

/** Une phase du « تحليل الوضعية ». */
const Phase = ({ i }) => (
  <TextbookBox kind="remark" title={SITUATION.analysis[i].label} text={analysisText(SITUATION.analysis[i])} source={SITUATION.source} compact />
);

/* ── ce que les manches ont montré, REBÂTI depuis leur contenu (une manche gagnée l'a vu ; rien n'est perdu au rechargement) ── */
const ZILL_STEP = SM.stepOf({ ...ZILL, task: 'meet' });
const ZILL_MEET = SM.meetOf(ZILL_STEP);
const cylinders = (cone, idxs) => {
  const lab = CC.initPlayer(cone);
  return idxs.map((i) => `h = ${CC.dec(CC.hOf(lab, i))} ، r = ${CC.dec(CC.rMaxAt(lab, i))}`);
};
const R2_LINES = cylinders(CONE_R2, R2_REQUIRED);
const cone = (c) => `H = ${c.H} ، R = ${c.R}`;

/** Une ligne de trace dans le lecteur : ✓ caché aux lecteurs d'écran (un mot le dit), jamais dans une chaîne. */
function WonPanel({ id, won, lines, title, empty }) {
  return (
    <div className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won ? 'text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won ? 'true' : 'false'}>
      {won ? (
        <>
          <p className="font-bold">{title}</p>
          <ul className="ms-4 list-disc">
            {lines.map((s) => <li key={s}><bdi dir="ltr" className="font-mono">{s}</bdi> <span aria-hidden="true">✓</span><span className="sr-only"> تمّ.</span></li>)}
          </ul>
        </>
      ) : <p>{empty}</p>}
    </div>
  );
}

export default function Module07AlWadiya() {
  const [stickTrials, setStickTrials] = useState([]);
  const [coneTrials, setConeTrials] = useState([]);
  const [q, setQ] = useState({});
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage) et les cylindres essayés dans la séance
  const [won, setWon] = useState({});
  const [pressed, setPressed] = useState([]);
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const keepStick = (e) => { if (!e?.tk) setStickTrials((list) => [...list, e]); };   // pas les événements `checkpoint` des questions du labo
  const keepCone = (e) => { if (!e?.tk) setConeTrials((list) => [...list, e]); };
  const keepPress = (e) => { if (e?.stage === 'press') setPressed((list) => [...list, e].slice(-40)); };
  const refused = pressed.filter((e) => e.verdict === 'pierce').at(-1);
  const r1Lines = pressed.filter((e) => e.verdict === 'inscribed' && e.H === String(CONE_R1.H) && e.R === String(CONE_R1.R)).map((e) => `h = ${e.h} ، r = ${e.r}`);

  return (
    <ContentModule objectives={["كيف نعرف ارتفاع مئذنة دون أن نصعدها؟", "أيّ شكل مستوٍ يختصر أسطوانة داخل مخروط؟", "كيف نجد r ثم الحجم ونتحقّق من ملاءمة النتيجة؟"]}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار"
      moduleSubtitle="ثم التحدّي 🏆 — ارتفاع المئذنة بالظل، ثم أسطوانة داخل مخروط" estimatedTime="≈ 30 دقيقة"
      intro={
        // LE LABO OUVRE LE MODULE. Lecteur : les MANCHES (content/rounds.js) ; la page garde le workspace et ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m7-wadiya" rounds={M7_ROUNDS} icon="🍦" freeIcon="🧪"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} onTrial={keepPress} />
          )}
          page={(
            <ManipulationWorkspace
              levels={{
                beginner: () => (
                  <Manipulation type="shadow-world" level="beginner" {...LAB.beginner} onTrial={keepStick} />
                ),
                advanced: () => (
                  <Manipulation type="cone-cylinder" level="advanced" {...LAB.advanced} onTrial={keepCone} />
                ),
              }}
            />
          )}
        />
      }
      steps={[
        { needsRound: { id: 'zill', label: 'جولة المئذنة', icon: '🕌', won: Boolean(won.zill) },
          num: 1, title: 'تحدّ الوحدة: اشرح الطريقة', subtitle: 'كيف قاس فريد ومقران ارتفاع المئذنة؟', done: !!q[1],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="تحدّ" text={CHALLENGE.text} source={CHALLENGE.source} compact>
                <MinaretFigure {...CHALLENGE.numbers} />
              </TextbookBox>
              {sw(
                <WonPanel id="zill" won={won.zill} title="ما فعلته في ساحة الحيّ:"
                  lines={[`${SM.HOURS[ZILL_STEP.hour]} · AB = ${SM.m(ZILL_MEET.BA)} m · OA = ${SM.m(ZILL_MEET.OA)} m`]}
                  empty="جولة المئذنة: لم تجعل بعد الظلّين ينتهيان معًا." />,
                <Evidence id="beginner" trials={stickTrials} line={stickLine} title="ما فعلته في ساحة الحيّ:"
                  empty="لم تبدأ بعد: في المستوى المبتدئ حرّك الشمس وقِس الظلال، ثم اغرس العصا وراقب أين ينتهي ظلّها." />,
              )}
              <TapQuestion
                prompt="لماذا غرس مقران العصا في هذا المكان بالذات؟"
                options={[
                  'لينتهي ظلّ العصا حيث ينتهي ظلّ المئذنة: العصا والمئذنة متوازيتان، فالمثلثان اللذان رأسهما O في وضعية طالس.',
                  'لأنّ ظلّ العصا يساوي طولها في ذلك المكان.',
                  'لأنّ العصا هناك في منتصف المسافة بين المئذنة ونهاية ظلّها.',
                  'لا يهمّ المكان: كل الأماكن تعطي النتيجة نفسها.',
                ].map(M)}
                correct={0} cols={1} requires={['talis-mubashira']}
                explain={<MathText>{`${REMARKS.zillMethod} ${REMARKS.zillWhy} ظلّ العصا $1{,}6\\,\\mathrm{m}$ لا يساوي طولها، والعصا على $10\\,\\mathrm{m}$ وليست في منتصف $11{,}6\\,\\mathrm{m}$ .`}</MathText>}
                onAnswered={mark(1)} />
              {q[1] && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la méthode de l’ombre vient d’être énoncée par la question ci-dessus. */}
                  <KnowledgeBrick id="tariqat-zill" variant="rappel" />
                  <p className="text-xs text-slate-600" data-misconception-note="zill"><MathText>{`خطأ شائع: ${REMARKS.zillWrong} ${REMARKS.zillWrongWhy}`}</MathText></p>
                </>
              )}
            </div>
          ) },
        { needsRound: { id: 'zill', label: 'جولة المئذنة', icon: '🕌', won: Boolean(won.zill) },
          num: 2, title: 'تحدّ الوحدة: ارتفاع المئذنة', subtitle: 'بالقياسات الثلاث على الأرض', done: !!q[2],
          content: (
            <div className="space-y-3">
              {sw(
                null,
                <Evidence id="beginner-pole" trials={stickTrials} line={stickLine} title="ما فعلته في ساحة الحيّ:"
                  empty="جرّب على المستوى المبتدئ: قِس ظلّ المئذنة وظلّ العصا في الساعة نفسها." />,
              )}
              <NumericQuestion
                prompt="ما ارتفاع المئذنة (بالمتر)؟"
                template={T_M}
                expected={close(7.25)} display="7,25 m" parse={parseDec}
                requires={['tariqat-zill', 'rabi-mutanasib']}
                explain={<MathText>{`${REMARKS.zillOB} ${REMARKS.zillEq}`}</MathText>}
                explainFor={(n) => <MathText>{close(11.6)(n) ? `ارتفاع المئذنة ليس طول ظلّها. ${REMARKS.zillEq}` : close(10)(n) ? `10 هي المسافة بين المئذنة والعصا (AB) لا الارتفاع. ${REMARKS.zillOB} ${REMARKS.zillEq}` : `${REMARKS.zillOB} ${REMARKS.zillEq}`}</MathText>}
                onAnswered={mark(2)} />
              {sw(null, <BackLink lesson="talis-hisab-atwal" what="خاصية طالس وحساب طول مجهول" />)}
              {q[2] && <TextbookBox kind="remark" title={INTRO_THALES.title} text={INTRO_THALES.text} source={INTRO_THALES.source} compact />}
            </div>
          ) },
        { num: 3, title: 'قراءة الوضعية وفهمها', subtitle: 'المرحلة 1: ما المطلوب؟', done: !!q[3],
          content: (
            <div className="space-y-3">
              <div className="space-y-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm" data-situation="ustuwana-makhrut">
                <p className="font-bold">{SITUATION.title}</p>
                <p><MathText>{SITUATION.text}</MathText></p>
                <ConeFigure H="18" R="6" />
                <p className="text-xs text-slate-500"><SourceTag source={SITUATION.source} /></p>
              </div>
              <Phase i={0} />
              <TapQuestion
                prompt="ما المطلوب في نص الوضعية؟"
                options={[
                  'حجم الأسطوانة عندما يتساوى ارتفاعها ونصف قطر قاعدتها',
                  'حجم المخروط',
                  'ارتفاع المخروط',
                  'نصف قطر قاعدة المخروط',
                ].map(M)}
                correct={0} cols={1} requires={['hajm-ustuwana']}
                explain={<MathText>{'المطلوب: «احسب حجم هذه الأسطوانة في الحالة $h = r$ ». ارتفاع المخروط ونصف قطر قاعدته معطيان ( $18\\,\\mathrm{cm}$ و $6\\,\\mathrm{cm}$ )، وحجم المخروط غير مطلوب.'}</MathText>}
                onAnswered={mark(3)} />
            </div>
          ) },
        { num: 4, title: 'أيّ شكل مستوٍ؟', subtitle: 'من المجسّم إلى المقطع', done: !!q[4],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="أيّ شكل هندسي مستوٍ نربطه بالصورة لحساب r؟"
                options={[
                  'المقطع المحوري: مثلث قائم ضلعاه القائمان ارتفاع المخروط ونصف قطر قاعدته، وفيه مستطيل الأسطوانة (h و r)',
                  'دائرة قاعدة المخروط وحدها',
                  'مستطيل وحده بُعداه 18 و 6',
                  'مثلث متقايس الأضلاع',
                ].map(M)}
                correct={0} cols={1} requires={['maqta-mihwari']}
                explain={<MathText>{`${REMARKS.maqta} الدائرة لا تُظهر h، والمستطيل وحده لا يُظهر المخروط، والمقطع ليس متقايس الأضلاع ( $6 \\neq 18$ ).`}</MathText>}
                onAnswered={mark(4)} />
              {q[4] && (
                <>
                  <GeoFigure {...SECTION} />
                  <p className="text-sm"><MathText>{REMARKS.maqta}</MathText></p>
                </>
              )}
            </div>
          ) },
        { num: 5, title: 'تحليل الوضعية واختيار استراتيجية', subtitle: 'المرحلة 2: أيّ خاصية؟', done: !!q[5],
          content: (
            <div className="space-y-3">
              <Phase i={1} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">في نصف المقطع المحوري (المثلث OSK وفيه المستطيل SDCT)، احكم على كل عبارة.</p>}
                rows={[
                  { id: 's1', label: '(TC) و (SK) متوازيان لأنّهما عموديان كلاهما على المحور (SO).', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.tawazi}</MathText> },
                  { id: 's2', label: 'النقط O و T و S على استقامة، والنقط O و C و K على استقامة.', options: TRUE_FALSE, correct: 0, correction: 'T و S على المحور، و C على المولّد [OK].' },
                  { id: 's3', label: <MathText>{'$OT = h$'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{`${REMARKS.otWhy} إذن $OT = 18 - h$ .`}</MathText> },
                  { id: 's4', label: 'نحسب r بخاصية فيثاغورس في المثلث OSK وحده.', options: TRUE_FALSE, correct: 1, correction: 'خاصية فيثاغورس في OSK تعطي طول المولّد OK ولا تذكر r: نحتاج المثلثين OTC و OSK معًا، أي خاصية طالس.' },
                ]}
                requires={['talis-mubashira', 'maqta-mihwari']}
                feedback={({ allRight }) => <MathText>{allRight ? 'أحسنت: مستقيمان متوازيان يقطعان مستقيمين متقاطعين في O — وضعية طالس.' : 'المستقيمان (TC) و (SK) متوازيان، والضلع الذي رأسه O في المثلث الصغير هو $18 - h$ .'}</MathText>}
                onAnswered={mark(5)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la coupe axiale et la situation de Thalès viennent d’être dites par la question ci-dessus. */}
              {q[5] && <KnowledgeBrick id="maqta-mihwari-talis" variant="rappel" />}
            </div>
          ) },
        // L'ÉCRAN DU CAHIER (décision du propriétaire et conseil C, 2026-11-10) : un vrai essai au crayon AVANT la correction pas à pas ;
        // les étapes 7 à 10 sont la comparaison.
        { num: 6, title: 'بالقلم: حلّك أنت', subtitle: 'اكتب الحلّ في كرّاسك ثم قارن', done: !!q[6],
          content: (
            <div className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-4" data-notebook-screen>
              <p className="text-xl font-black text-indigo-950"><span aria-hidden="true">📓 </span>اكتب الحلّ في كرّاسك ثم قارن.</p>
              <p className="text-lg font-bold text-slate-800">اكتب في 3 أسطر: المثلثان، المساواة، المعادلة.</p>
              <ol className="ms-6 list-decimal space-y-1 text-base text-slate-700">
                <li>أيّ مثلثين في وضعية طالس، ولماذا؟</li>
                <li>أيّ مساواة تكتب بينهما؟</li>
                <li>أيّ معادلة في r تحصل عليها حين يكون <bdi dir="ltr">h = r</bdi> ؟</li>
              </ol>
              <p className="text-sm text-slate-600">الخطوات التالية تصحّح حلّك سطرًا سطرًا.</p>
              {/* le bouton RESTE (aria-disabled après l'appui : le focus ne tombe pas sur la page) ; la région vivante est toujours montée */}
              <button type="button" onClick={() => { if (!q[6]) mark(6)(); }} aria-disabled={q[6] || undefined} data-notebook-done
                className={`min-h-[52px] rounded-2xl px-6 text-lg font-black focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${q[6] ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300' : 'bg-indigo-700 text-white shadow-[0_3px_0_0_#3730A3] hover:bg-indigo-800'}`}>
                {q[6] ? <><span aria-hidden="true">✓ </span>كتبتُ حلّي</> : 'كتبتُ حلّي — أقارن الآن'}
              </button>
              <p className="font-bold text-emerald-800" role="status">{q[6] ? 'قارن الآن حلّك بالخطوات التالية.' : ''}</p>
            </div>
          ) },
        { needsRound: { id: 'r2', label: 'جولة المخروط الثاني', icon: '🍦', won: Boolean(won.r2) },
          num: 7, title: 'تنفيذ: مساواة طالس', subtitle: 'المرحلة 3 — بالحروف أوّلًا، ثم بأطوال الوضعية', done: !!q[7],
          content: (
            <div className="space-y-3">
              <Phase i={2} />
              {sw(
                <WonPanel id="cones" won={won.r2} title="أسطواناتك التي لمست جدار المخروط:"
                  lines={[
                    // r1 : les cylindres de la séance (après un rechargement, r2 suffit — ses trois cylindres sont rebâtis de la manche)
                    ...(won.r1 ? r1Lines.slice(-2).map((s) => `${cone(CONE_R1)} : ${s}`) : []),
                    ...(won.r2 ? R2_LINES.map((s) => `${cone(CONE_R2)} : ${s}`) : []),
                  ]}
                  empty="جولة المخروط الثاني: لم تجد بعد الأسطوانات الثلاث." />,
                <Evidence id="advanced" trials={coneTrials} line={coneLine} title="أسطواناتك على المخروط (المستوى المتقدّم):"
                  empty="لم تجرّب أسطوانة بعد: في المستوى المتقدّم كبّر r (↕) حتى تلمس الأسطوانة المخروط، ثم غيّر h." />,
              )}
              <TapQuestion
                prompt={<MathText>{'في المثلثين $OTC$ و $OSK$ : أكمل $\\dfrac{TC}{SK} = \\dfrac{\\ldots}{\\ldots}$ بضلعين من الأضلاع $OT$ و $OS$ و $ST$ .'}</MathText>}
                options={['$\\dfrac{TC}{SK} = \\dfrac{OT}{OS}$', '$\\dfrac{TC}{SK} = \\dfrac{ST}{OS}$', '$\\dfrac{TC}{SK} = \\dfrac{OS}{OT}$'].map(M)}
                correct={0} cols={3} requires={['talis-mubashira']}
                explain={<MathText>{'في كل نسبة: ضلع من المثلث الصغير $OTC$ على الضلع الموافق له في المثلث الكبير $OSK$ ، والضلعان على المحور يبدآن من الرأس $O$ : $OT$ و $OS$ . أمّا $ST$ فيبدأ من القاعدة، فليس ضلعًا رأسه $O$ .'}</MathText>}
                onAnswered={mark('7a')} />
              {q['7a'] && (
                <TapQuestion
                  prompt={<MathText>{'عوّض بأطوال الوضعية ( $OS = 18$ و $SK = 6$ و $TC = r$ ): المساواة تصبح'}</MathText>}
                  options={[
                    REMARKS.otRight,
                    '$\\dfrac{r}{6} = \\dfrac{h}{18}$',
                    '$\\dfrac{6}{r} = \\dfrac{18 - h}{18}$',
                    '$r + h = 18$',
                  ].map(M)}
                  correct={0} cols={2} requires={['maqta-mihwari-talis']}
                  explain={<MathText>{`${REMARKS.talisSection} ${REMARKS.otWhy} وقلب نسبة واحدة يعطي مساواة خاطئة، و $r + h$ ليس ثابتا.`}</MathText>}
                  onAnswered={mark(7)} />
              )}
              {sw(null, <BackLink lesson="talis-hisab-atwal" what="كتابة النسب المتساوية في وضعية طالس" />)}
              {q[7] && <p className="text-xs text-slate-600" data-misconception-note="ot"><MathText>{`خطأ شائع: ${REMARKS.otWrong} ${REMARKS.otWhy}`}</MathText></p>}
            </div>
          ) },
        { num: 8, title: 'تنفيذ: الحالة h = r', subtitle: 'معادلة من الدرجة الأولى في r', done: !!q[8],
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'في الحالة $h = r$ ، ما قيمة r (بالسنتيمتر)؟'}</MathText>}
                template={T_CM}
                expected={close(4.5)} display="4,5 cm" parse={parseDec}
                requires={['maqta-mihwari-talis', 'muadala-ula']}
                explain={<MathText>{`${REMARKS.muadala} ${REMARKS.halR}`}</MathText>}
                explainFor={(n) => <MathText>{close(6)(n) ? `نصف قطر 6 هو نصف قطر قاعدة المخروط: أسطوانة به تخرق المخروط. ${REMARKS.muadala} ${REMARKS.halR}` : close(13.5)(n) ? `$13{,}5 = 18 - 4{,}5$ هو OT لا r. ${REMARKS.halR}` : `${REMARKS.muadala} ${REMARKS.halR}`}</MathText>}
                onAnswered={mark(8)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : l’explication de la question ci-dessus vient de faire l’équation. */}
              {q[8] && <KnowledgeBrick id="muadala-bud" variant="rappel" />}
            </div>
          ) },
        { num: 9, title: 'تنفيذ: حجم الأسطوانة', subtitle: 'القيمة المضبوطة ثم المقرّبة', done: !!q[9],
          content: (
            <TapQuestion
              prompt={<MathText>{'حجم الأسطوانة في الحالة $h = r$ :'}</MathText>}
              options={[
                '$V = 91{,}125\\pi \\approx 286{,}28\\,\\mathrm{cm}^3$',
                '$V = 4{,}5^2 \\times 4{,}5 = 91{,}125\\,\\mathrm{cm}^3$',
                '$V = \\pi \\times 9^2 \\times 4{,}5 \\approx 1145{,}11\\,\\mathrm{cm}^3$',
                '$V = \\pi \\times 4{,}5 \\times 4{,}5 \\approx 63{,}62\\,\\mathrm{cm}^3$',
              ].map(M)}
              correct={0} cols={1} requires={['hajm-ustuwana', 'muadala-bud']}
              explain={<MathText>{`${REMARKS.hajm} بدون π نحسب حجم شيء آخر، والقطر 9 يضاعف الحجم أربع مرات، و $\\pi \\times r \\times h$ ينسى تربيع r.`}</MathText>}
              onAnswered={mark(9)} />
          ) },
        { num: 10, title: 'التحقّق وتحرير الحل', subtitle: 'المرحلة 3، آخرها: هل النتيجة ملائمة للواقع؟', done: !!q[10],
          content: (
            <div className="space-y-3">
              {sw(
                <p className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" data-activity-evidence data-evidence="refused">
                  {refused
                    ? <>في المختبر رفض المخروط أسطوانتك <bdi dir="ltr" className="font-mono">{`h = ${refused.h} ، r = ${refused.r}`}</bdi> : كانت أعرض مما يسمح به جداره عند هذا الطول.</>
                    : 'في المختبر رفض المخروط كلّ أسطوانة أعرض مما يسمح به جداره عند طولها.'}
                </p>,
                null,
              )}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">قبل أن نكتب الجواب، احكم على كل عبارة.</p>}
                rows={[
                  { id: 'v1', label: <MathText>{'$r = 4{,}5 < 6$ : الأسطوانة لا تخرج من المخروط.'}</MathText>, options: TRUE_FALSE, correct: 0, correction: 'نصف قطر الأسطوانة أصغر من نصف قطر قاعدة المخروط.' },
                  { id: 'v2', label: <MathText>{'$\\dfrac{4{,}5}{6} = \\dfrac{18 - 4{,}5}{18}$'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{'النسبتان تساويان $0{,}75$ : الحافة فعلا على المولّد.'}</MathText> },
                  { id: 'v3', label: <MathText>{'لو وجدنا $r = 7{,}2$ لقبلنا النتيجة.'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{'$7{,}2 > 6$ : أسطوانة كهذه تخرق المخروط؛ النتيجة غير ملائمة ونبحث عن الخطأ.'}</MathText> },
                ]}
                requires={['muadala-bud', 'hajm-ustuwana']}
                feedback={({ allRight }) => <MathText>{allRight ? REMARKS.jumla : REMARKS.mulaama}</MathText>}
                onAnswered={mark(10)} />
              {q[10] && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : la vérification vient d’être faite ligne par ligne ci-dessus. */}
                  <KnowledgeBrick id="mulaamat-natija" variant="rappel" />
                  <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900"><MathText>{REMARKS.jumla}</MathText></p>
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                </>
              )}
            </div>
          ) },
        // « ورقة هاجر » (conseil C, décision 5) : la DERNIÈRE étape — un PLAN faux d'une camarade : Thalès sans justifier (TC) ∥ (SK).
        { num: 11, title: 'ورقة هاجر', subtitle: 'أين أخطأت هاجر في خطّتها؟', done: !!q[11],
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={mark(11)} /> },
      ]}
      footer={(
        <>
          <KnowledgeSnapshot moduleNumber={7} variant="memo" />
          {sw(
            <p className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center text-base font-black text-amber-900" data-mission-pause>
              <span aria-hidden="true">⏸️ </span>استرح قليلًا: التحدّي هو المحطّة التالية <span aria-hidden="true">🏆</span>
            </p>,
            null,
          )}
        </>
      )} />
  );
}
