import { useState } from 'react';
import * as linearSystem from '@smarter-academy/core/arithmetic/linearSystem.js';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';
import * as SL from '../../../../../../common/manipulations/logic/storyModeller';
import * as SP from '../../../../../../common/manipulations/logic/storyModellerPlayer';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS, LAB } from '../content/textbook';
import { M7_ROUNDS, TRIP, PARTY } from '../content/rounds';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 7 — « وضعية الوحدة » : la وضعية du حفل البلدية, ANALYSÉE dans les trois phases (قراءة · تحليل واختيار استراتيجية · تنفيذ) — et
 * jamais résolue : la résoudre est le défi 🏆 (module 8, jamais retouché ; sa solution n'apparaît sur aucun écran avant lui, ce module compris :
 * content/forbidden.js › ANSWER_TEXT, content/mission.test.js).
 *
 * LA PAGE (l'enseignant, le mode classe) : le workspace d'avant, `story-modeller` à deux niveaux (مبتدئ « رحلة القسم » du manuel transposée,
 * متقدم le حفل) ; ce que l'élève construit (`onModel`) est montré au-dessus de la question de traduction (`[data-activity-evidence]`).
 *
 * LE LECTEUR DE MISSION (la synthèse de l'unité 5, 2026-11-12 — recette PROVISOIRE de la synthèse, point 5 ; l'élève ne voit JAMAIS l'ancienne
 * vue) : UN `LabRounds` (content/rounds.js) — r1 « رحلة القسم » à la main (10 + 10 pour 550 دج), r2 « حفل المدرسة » (120 + 120 pour 8400 دج,
 * les inconnues à nommer) qui finit sur la construction NUMÉRIQUE « 120 × (40 + 30) = 8400 » — puis les étapes. L'étape 1 attend r1, les étapes
 * 2 et 4 attendent r2 (`needsRound`, module-level : `useModulePlayer`). Les panneaux de trace sont REBÂTIS depuis le contenu des manches gagnées
 * (étoiles gardées : un rechargement ne vide rien).
 *
 * Étapes (les deux vues) : 1 lire et choisir les inconnues · 2 la stratégie (les quantités égales : diviser) · 3 « بالقلم » (l'écran du cahier :
 * « اكتب في 3 أسطر ») · 4 la JUMLA du حفل (le modèle, première étape au crayon ; les deux informations RAPPELÉES sur l'écran — aucun aller-retour)
 * · 5 la simplification et la méthode · 6 la vérification, en mots · 7 « ورقة عائشة » (un PLAN faux : la vérification sur la seule équation
 * simplifiée). Le pied de page ajoute, dans le lecteur, une ligne de pause avant le 🏆. LP : P2 (inconnues, jumla, méthode), P1 (vérification).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const FITS = ['يترجمها', 'لا يترجمها'];
const TRUE_FALSE = ['صحيح', 'خاطئ'];
const sw = (player, page) => <PlayerSwitch player={player} page={page} />;

/* ── ce que les manches ont montré, REBÂTI depuis leur contenu (une manche gagnée l'a vu ; rien n'est perdu au rechargement) ── */
const modelOf = (p) => SL.parseModel({ system: p.system, unknowns: p.unknowns, facts: p.facts, chips: p.chips });
const PARTY_MODEL = modelOf(PARTY);
const PARTY_SUM = SP.sumBuild(PARTY_MODEL, { x: PARTY_MODEL.sol.x, y: PARTY_MODEL.sol.y });
const PARTY_SUM_TEX = `${PARTY_SUM.k} \\times (${PARTY_SUM.expected[0]} + ${PARTY_SUM.expected[1]}) = ${PARTY_SUM.expected[2]}`;
const TRIP_MODEL = modelOf(TRIP);

/** La جملة rendue par le laboratoire de la PAGE (`onModel`), quelle que soit sa forme. */
function modelTex(sys) {
  if (!sys) return null;
  if (typeof sys === 'string') return sys;
  if (typeof sys.tex === 'string') return sys.tex;
  if (typeof sys.latex === 'string') return sys.latex;
  const eqs = Array.isArray(sys) ? sys : sys.system;
  if (Array.isArray(eqs) && eqs.length === 2 && eqs.every((e) => e && 'a' in e && 'b' in e && 'c' in e)) return linearSystem.systemLatex(eqs);
  return null;
}

/** La page : la جملة que l'élève a vérifiée sur la table du حفل (niveau متقدم). */
function Evidence({ model, empty }) {
  const tex = modelTex(model);
  return (
    <div className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence="advanced">
      {tex ? <p data-tried="true">الجملة التي بنيتها: <MathText>{`$${tex}$`}</MathText></p> : <p className="text-slate-500" data-tried="false">{empty}</p>}
    </div>
  );
}

/** Une ligne de trace dans le lecteur : ✓ caché aux lecteurs d'écran (un mot le dit), jamais dans une chaîne. */
function WonPanel({ id, won, lines, title, empty }) {
  return (
    <div className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won ? 'text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won ? 'true' : 'false'}>
      {won ? (
        <>
          <p className="font-bold">{title}</p>
          <ul className="ms-4 list-disc">
            {lines.map((s) => <li key={s}><MathText>{`$${s}$`}</MathText> <span aria-hidden="true">✓</span><span className="sr-only"> تمّ.</span></li>)}
          </ul>
        </>
      ) : <p>{empty}</p>}
    </div>
  );
}

/**
 * Une phrase de la وضعية telle que le module 7 l'affiche : les prix en « دج » (jamais « DA ») et les milliers SANS espace — « 11 250 » au milieu
 * d'une phrase arabe se lit « 250 11 » (bidi). Le module 8 (jamais retouché) garde son texte.
 */
const said = (s) => s.replace(/(\d+) (\d{3})(?!\d)/g, '$1$2').replace(/\s?DA\b/g, ' دج');
/** Les deux informations du حفل, RAPPELÉES sur l'écran de la question qui les traduit (aucun aller-retour). */
const Facts = () => (
  <ul className="ms-4 list-disc space-y-1 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800" data-situation-facts>
    <li>{said(SITUATION.fact1)}</li>
    <li>{said(SITUATION.fact2)}</li>
  </ul>
);

export default function Module07AlWadiya() {
  const inPlayer = useModulePlayer(MODULE_CTX);
  const [big, setBig] = useState({ model: null });
  const [q, setQ] = useState({});
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage)
  const [won, setWon] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const round = (id, label) => (inPlayer ? { needsRound: { id, label, icon: '🧃', won: Boolean(won[id]) } } : {});

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="الوضعية وتحليلها"
      moduleSubtitle="ثم التحدّي 🏆 — حفل البلدية: ما سعر علبة العصير وسعر قطعة الحلوى؟" estimatedTime="≈ 28 دقيقة"
      objectives={['ما المجهولان في وضعية حفل البلدية؟ وكيف نختارهما؟', 'ماذا نفعل حين يتساوى عددان في معلومة واحدة؟', 'كيف نترجم كل معلومة بمعادلة، ونتحقّق قبل أن نجيب؟']}
      intro={(
        // LE LABO OUVRE LE MODULE. Lecteur : les MANCHES (content/rounds.js) ; la page garde le workspace et ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m7-wadiya" rounds={M7_ROUNDS} icon="🧃" freeIcon="🍰"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => <Manipulation type="story-modeller" level="beginner" {...LAB.beginner} />,
                advanced: () => (
                  <Manipulation type="story-modeller" level="advanced" {...LAB.advanced}
                    onModel={(sys) => setBig({ model: sys })} />
                ),
              }}
            />
          )}
        />
      )}
      steps={[
        { ...round('r1', 'رحلة القسم'),
          num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'المعطيات والمطلوب', done: !!q[1],
          content: (
            <div className="space-y-3">
              {/* la situation et la question sur UN écran (aucun aller-retour) : un seul bloc pour la pagination du lecteur */}
              <div className="space-y-3" data-paging-keep>
              <div className="space-y-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800" data-situation>
                <p>{SITUATION.intro}</p>
                <ul className="ms-4 list-disc space-y-1">
                  <li>{said(SITUATION.fact1)}</li>
                  <li>{said(SITUATION.fact2)}</li>
                </ul>
                <p className="font-semibold">{SITUATION.question}</p>
                <SourceTag source={SITUATION.source} />
              </div>
              <TapQuestion
                prompt="ما المطلوب في الوضعية، وماذا نسمّي المجهولين؟"
                options={[
                  'سعر علبة عصير وسعر قطعة حلوى: نسمّيهما $x$ و $y$',
                  'عدد علب العصير وعدد قطع الحلوى: نسمّيهما $x$ و $y$',
                  'المبلغ الذي دفعته البلدية وثمن ما بقي: نسمّيهما $x$ و $y$',
                ].map(M)}
                correct={0} cols={1} requires={['tarjama-jumla']}
                explain={<span>السؤال «ما هو سعر علبة عصير وسعر قطعة حلوى؟» يطلب سعرين نجهلهما. أمّا أعداد العلب والقطع والمبلغان فمعطيات معلومة في النص.</span>}
                onAnswered={mark(1)} />
              </div>
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : choisir les inconnues vient d'être dit par l'explication ci-dessus. */}
              {q[1] && <KnowledgeBrick id="tahdid-majahil" variant="rappel" />}
            </div>
          ) },
        { ...round('r2', 'حفل المدرسة'),
          num: 2, title: 'تحليل الوضعية واختيار استراتيجية', subtitle: 'عددان متساويان في معلومة واحدة', done: !!q[2],
          content: (
            <div className="space-y-3">
              {sw(
                <WonPanel id="party" won={won.r2} title="السطر الذي بنيته في حفل المدرسة:" lines={[PARTY_SUM_TEX]}
                  empty="جولة حفل المدرسة: لم تبنِ بعد سطر المعلومة الأولى." />,
                null,
              )}
              <TapQuestion
                prompt="في المعلومة الأولى للحفل اشترت البلدية العدد نفسه من علب العصير ومن قطع الحلوى. ماذا يسمح لنا ذلك قبل الحل؟"
                options={[
                  'نقسم طرفي معادلتها على هذا العدد، فنجد مجموع السعرين',
                  'نجمع المعادلتين طرفًا بطرف مباشرة، فيختفي مجهول',
                  'لا شيء: العددان المتساويان لا يغيّران الحساب',
                ].map(M)}
                correct={0} cols={1} requires={['tarjama-jumla', 'tawid']}
                explain={<MathText>{`حين يتساوى العددان يكون المبلغ هذا العدد مرّةً مجموعَ السعرين — في حفل المدرسة: $${PARTY_SUM_TEX}$ . نقسم على العدد فنجد مجموع السعرين، فتصير المعادلة بمعاملين يساويان 1 ونعوّض بسهولة. أمّا الجمع المباشر فلا يحذف مجهولًا هنا: المعاملات ليست متعاكسة.`}</MathText>}
                onAnswered={mark(2)} />
            </div>
          ) },
        // L'ÉCRAN DU CAHIER (recette de la synthèse, point 5) : un vrai essai au crayon AVANT la correction pas à pas ; les étapes 4 à 6 sont la comparaison.
        { num: 3, title: 'بالقلم: حلّك أنت', subtitle: 'اكتب في كرّاسك ثم قارن', done: !!q[3],
          content: (
            <div className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-4" data-notebook-screen>
              <p className="text-xl font-black text-indigo-950"><span aria-hidden="true">📓 </span>اكتب في كرّاسك ثم قارن.</p>
              <p className="text-lg font-bold text-slate-800">اكتب في 3 أسطر: المجهولان، الجملة، الجملة بعد التبسيط.</p>
              <ol className="ms-6 list-decimal space-y-1 text-base text-slate-700">
                <li>ماذا يمثّل كل من الحرفين؟</li>
                <li>أيّ معادلتين تترجمان معلومتي الحفل؟</li>
                <li>أيّ معادلة تبسّطها، وبماذا تقسمها؟</li>
              </ol>
              <p className="text-sm text-slate-600">الخطوات التالية تصحّح أسطرك سطرًا سطرًا. حلّ الجملة ينتظرك في التحدّي <span aria-hidden="true">🏆</span>.</p>
              {/* le bouton RESTE (aria-disabled après l'appui : le focus ne tombe pas sur la page) ; la région vivante est toujours montée */}
              <button type="button" onClick={() => { if (!q[3]) mark(3)(); }} aria-disabled={q[3] || undefined} data-notebook-done
                className={`min-h-[52px] rounded-2xl px-6 text-lg font-black focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${q[3] ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300' : 'bg-indigo-700 text-white shadow-[0_3px_0_0_#3730A3] hover:bg-indigo-800'}`}>
                {q[3] ? <><span aria-hidden="true">✓ </span>كتبتُ أسطري</> : 'كتبتُ أسطري — أقارن الآن'}
              </button>
              <p className="font-bold text-emerald-800" role="status">{q[3] ? 'قارن الآن أسطرك بالخطوات التالية.' : ''}</p>
            </div>
          ) },
        { ...round('r2', 'حفل المدرسة'),
          num: 4, title: 'ترييض الوضعية: الجملة', subtitle: 'كل معلومة عن مبلغ معادلة', done: !!q[4],
          content: (
            <div className="space-y-3">
              {sw(null, <Evidence model={big.model} empty="لم تتحقّق بعد من جملة على طاولة الحفل: سمِّ المجهولين، ضع الأعداد في خانات المعادلتين ثم اضغط «تحقّق»." />)}
              {/* les deux informations et la question qui les juge sur UN écran (aucun aller-retour) */}
              <div className="space-y-3" data-paging-keep>
              <Facts />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">هل تترجم كل معادلة المعلومة المذكورة؟</p>}
                rows={[
                  { id: 'm1a', label: <span>المعلومة الأولى: <MathText>{'$150x + 150y = 11250$'}</MathText></span>, options: FITS, correct: 0, correction: <MathText>{'150 علبة ثمنها $150x$ و 150 قطعة ثمنها $150y$ ، والمجموع 11250 دج.'}</MathText> },
                  { id: 'm1b', label: <span>المعلومة الأولى: <MathText>{'$x + y = 11250$'}</MathText></span>, options: FITS, correct: 1, correction: <MathText>{'المبلغ ثمن 150 علبة و 150 قطعة، لا ثمن علبة واحدة وقطعة واحدة.'}</MathText> },
                  { id: 'm2a', label: <span>المعلومة الثانية: <MathText>{'$24x + 30y = 2100$'}</MathText></span>, options: FITS, correct: 0, correction: <MathText>{'24 علبة ثمنها $24x$ و 30 قطعة ثمنها $30y$ ، ومعًا 2100 دج.'}</MathText> },
                  { id: 'm2b', label: <span>المعلومة الثانية: <MathText>{'$30x + 24y = 2100$'}</MathText></span>, options: FITS, correct: 1, correction: <MathText>{'العدد 24 يعدّ علب العصير: يُضرب في سعر العلبة $x$ ، لا في سعر القطعة.'}</MathText> },
                ]}
                requires={['tahdid-majahil', 'tarjama-jumla']}
                feedback={({ allRight }) => <MathText>{allRight ? 'أحسنت: كل معلومة عن مبلغ تعطي معادلة، وكل عدد يُضرب في سعر الشيء الذي يعدّه.' : 'كل عدد يُضرب في سعر الشيء الذي يعدّه، والمبلغ هو المذكور في المعلومة نفسها.'}</MathText>}
                onAnswered={mark(4)} />
              </div>
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : une information → une équation vient d'être dit par le retour ci-dessus. */}
              {q[4] && <KnowledgeBrick id="tarjamat-maalumat" variant="rappel" />}
            </div>
          ) },
        { num: 5, title: 'التبسيط والطريقة', subtitle: 'قبل الحل', done: !!q[5],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>لحل الجملة <MathText>{'$\\begin{cases} 150x + 150y = 11250 \\\\ 24x + 30y = 2100 \\end{cases}$'}</MathText> ، أيّ اقتراح يوصل إلى الحل بأقل حساب؟</span>}
                options={[
                  'نقسم طرفي المعادلة الأولى على 150 فنحصل على $x + y = 75$ ، ثم نعوّض $y = 75 - x$ في المعادلة الثانية',
                  'نجمع المعادلتين طرفا بطرف مباشرة فيختفي $y$',
                  'نقسم المعادلة الأولى على 150 فنحصل على $x + y = 11250$',
                ].map(M)}
                correct={0} cols={1} requires={['tarjamat-maalumat', 'tawid', 'jam']}
                explain={<MathText>{'$11250 \\div 150 = 75$ : المعادلة الأولى تكافئ $x + y = 75$ ، ومعامل $y$ فيها 1 فالتعويض سهل. الجمع المباشر يعطي $174x + 180y = 13350$ ولا يختفي شيء؛ والقسمة تشمل الطرفين معًا.'}</MathText>}
                onAnswered={mark(5)} />
              {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : simplifier puis choisir la substitution vient d'être dit par l'explication ci-dessus. */}
              {q[5] && <KnowledgeBrick id="ikhtiyar-tariqa" variant="rappel" />}
            </div>
          ) },
        { num: 6, title: 'التحقق وتحرير الإجابة', subtitle: 'نعود إلى النص', done: !!q[6],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">قبل أن نكتب الجواب، احكم على كل عبارة.</p>}
                rows={[
                  { id: 'v1', label: 'نتحقّق من الثنائية في المعلومتين معًا، في نص الوضعية نفسه.', options: TRUE_FALSE, correct: 0, correction: 'حلّ الجملة يحقّق المعلومتين في آن واحد.' },
                  { id: 'v2', label: <MathText>{'ثنائية تحقّق $x + y = 75$ وحدها هي حلّ الجملة.'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{'ثنائيات كثيرة مجموعها 75 : حلّ الجملة يحقّق المعادلة الثانية أيضًا.'}</MathText> },
                  { id: 'v3', label: 'حين يتساوى العددان في المعلومة الأولى، تحقّقها الثنائية المبدّلة أيضًا: المعلومة الثانية هي التي تفصل بينهما.', options: TRUE_FALSE, correct: 0, correction: <MathText>{`في رحلة القسم: $(${SL.fracText(TRIP_MODEL.sol.y)} ; ${SL.fracText(TRIP_MODEL.sol.x)})$ تحقّق المعلومة الأولى وترفضها الثانية.`}</MathText> },
                ]}
                requires={['ikhtiyar-tariqa', 'tahaqquq-wadiya']}
                feedback={({ allRight }) => <MathText>{allRight ? 'أحسنت: نتحقّق في المعلومتين معًا، ثم نكتب الجواب بجملة تذكر السعرين ووحدتهما.' : REMARKS.nisfWhy}</MathText>}
                onAnswered={mark(6)} />
              {q[6] && (
                <>
                  {/* Rappel (2026-10-06, « أتوقّع القاعدة ») : vérifier dans le texte vient d'être jugé ligne par ligne ci-dessus. */}
                  <KnowledgeBrick id="tahaqquq-tafsir" variant="rappel" />
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                  <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />
                </>
              )}
            </div>
          ) },
        // « ورقة عائشة » (recette de la synthèse, point 5) : la DERNIÈRE étape — un PLAN faux d'une camarade, une erreur de JUSTIFICATION.
        { num: 7, title: 'ورقة عائشة', subtitle: 'أين أخطأت عائشة في خطّتها؟', done: !!q[7],
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={mark(7)} /> },
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
