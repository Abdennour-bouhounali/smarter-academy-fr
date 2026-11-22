import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS } from '../content/textbook';
import { M7_ROUNDS, BED } from '../content/rounds';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 7 — « وضعية الوحدة » : la وضعية de la زربية (le défi 🏆 du module 8), ANALYSÉE dans les trois phases (قراءة · تحليل واختيار استراتيجية
 * · تنفيذ) — et jamais résolue : sa solution (ℓ² = 12, 2√3, 4√3, 346 / 693 cm) n'apparaît sur aucun écran avant le 🏆, ce module compris
 * (content/forbidden.js › ANSWER_TEXT, content/mission.test.js).
 *
 * LA PAGE (l'enseignant, le mode classe) : le workspace à deux niveaux — مبتدئ la DROITE QUI SE PLIE (`square-fold`, x² = 40), متقدم le CARRÉ
 * DALLÉ (`square-tiling` simplest, 40) ; aucune manche.
 *
 * LE LECTEUR DE MISSION (la synthèse de l'unité 2, 2026-11-12 — recette PROVISOIRE de la synthèse, point 5 ; l'élève ne voit JAMAIS l'ancienne
 * vue) : UN `LabRounds` (content/rounds.js) — r1 « حوض الأزهار » à la main (x² = 40 : la marque exacte √40, deux solutions opposées, la construction
 * x² = 40 ⇔ x = √40 أو x = −√40), r2 « بلاط الحوض » avec prédictions (√40 = 2 × √10, construction NUMÉRIQUE puis la règle) — puis les étapes.
 * L'étape 2 attend r1, l'étape 3 attend r2 (`needsRound`, module-level : `useModulePlayer`). Les panneaux de trace sont REBÂTIS depuis les nombres
 * des manches gagnées (étoiles gardées : un rechargement ne vide rien).
 *
 * Étapes (les deux vues) : 1 lire et trier les données · 2 quel solution garder (après r1) · 3 forme exacte puis arrondi à la fin (après r2 ; le
 * piège de l'arrondi trop tôt montré sur le FRÈRE : 2 × 632 ≠ 1265) · 4 « بالقلم » (l'écran du cahier : « اكتب في 3 أسطر ») · 5 le MODÈLE
 * 2ℓ² = 24 (première étape au crayon ; les données RAPPELÉES sur l'écran — aucun aller-retour) · 6 la démarche en lettres (S) · 7 « ورقة رقيّة »
 * (un PLAN faux : doubler la largeur ARRONDIE). Le pied de page ajoute, dans le lecteur, une ligne de pause avant le 🏆. Plus de « الكتاب » ni de
 * SourceTag : l'énoncé est celui de la plateforme. LP : P1.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];
const sw = (player, page) => <PlayerSwitch player={player} page={page} />;

/* ── ce que les manches ont montré, REBÂTI depuis leurs nombres (une manche gagnée l'a vu ; rien n'est perdu au rechargement) ── */
const R1_LINES = [`x = \\sqrt{${BED.a}}`, `x = -\\sqrt{${BED.a}}`];
const R2_LINES = [`\\sqrt{${BED.a}} = \\sqrt{4 \\times ${BED.a / 4}} = 2\\sqrt{${BED.a / 4}}`];
// le piège de l'arrondi, sur le FRÈRE (jamais sur la زربية) : 2√10 ≈ 6,3246 m, 4√10 ≈ 12,6491 m
const W_CM = Math.round(Math.sqrt(BED.a) * 100);
const L_CM = Math.round(2 * Math.sqrt(BED.a) * 100);

/** Une ligne de trace dans le lecteur : ✓ caché aux lecteurs d'écran (un mot le dit), jamais dans une chaîne. */
function WonPanel({ id, won, lines, title, empty }) {
  return (
    <div className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won ? 'text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won ? 'true' : 'false'}>
      {won ? (
        <>
          <p className="font-bold"><span className="sr-only">تمّ — </span>{title}</p>
          <ul className="ms-4 list-disc">
            {lines.map((s, i) => <li key={i}><MathText>{`$${s}$`}</MathText> <span aria-hidden="true">✓</span></li>)}
          </ul>
        </>
      ) : <p>{empty}</p>}
    </div>
  );
}

/** Les données utiles de la وضعية, RAPPELÉES sur l'écran de la question qui s'en sert (aucun aller-retour). */
const Facts = () => (
  <ul aria-label="معطيات الوضعية" className="ms-4 list-disc space-y-1 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800" data-situation-facts>
    {SITUATION.data.filter((d) => d.useful).map((d) => <li key={d.id}>{d.text}</li>)}
  </ul>
);

export default function Module07AlWadiya() {
  const inPlayer = useModulePlayer(MODULE_CTX);
  const [q, setQ] = useState({});
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage)
  const [won, setWon] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const round = (id, label) => (inPlayer ? { needsRound: { id, label, icon: '🌷', won: Boolean(won[id]) } } : {});

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار"
      moduleSubtitle="ثم التحدّي 🏆 — الزربية: ما طولها وما عرضها؟" estimatedTime="≈ 28 دقيقة"
      objectives={['ما المعطيات التي يحتاجها حساب بُعدي الزربية، وما المعطى الذي لا نحتاجه؟', 'أيّ حلّ للمعادلة نحتفظ به للعرض؟', 'متى ندوّر، ولماذا لا نضاعف قيمة مدوّرة؟']}
      intro={(
        // LE LABO OUVRE LE MODULE. Lecteur : les MANCHES (content/rounds.js) ; la page garde un workspace à deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m7-wadiya" rounds={M7_ROUNDS} icon="🌷" freeIcon="🧱"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => (
                  <Manipulation type="square-fold" level="beginner" targets={[BED.a]} scale={2} lead={M7_ROUNDS[0].props.lead} />
                ),
                advanced: () => (
                  <Manipulation type="square-tiling" level="advanced" n={BED.a} mode="simplest" lead={M7_ROUNDS[1].props.lead} />
                ),
              }}
            />
          )}
        />
      )}
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'ما المعطيات المفيدة؟', done: !!q[1],
          content: (
            <div className="space-y-3" data-paging-keep>
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800" data-situation>
                <p><MathText>{SITUATION.text}</MathText></p>
              </div>
              <p className="text-sm font-semibold text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لإيجاد بُعدي الزربية.</p>
              <InfoSorter items={SITUATION.data} formative onSolved={mark(1)} />
            </div>
          ) },
        { ...round('r1', 'حوض الأزهار'),
          num: 2, title: 'تحليل الوضعية: أيّ حلّ؟', subtitle: 'العرض طول', done: !!q[2],
          content: (
            <div className="space-y-3">
              {/* ce que la manche a montré et la question sur UN écran (aucun aller-retour) */}
              <div className="space-y-3" data-paging-keep>
                {sw(
                  <WonPanel id="fold" won={won.r1} title={`حلّا المعادلة التي ثبّتّهما في حوض الأزهار (مربّع العرض يساوي ${BED.a}):`} lines={R1_LINES}
                    empty="جولة حوض الأزهار: لم تثبّت بعد الحلّين." />,
                  null,
                )}
                <TapQuestion
                  prompt={<span>في الزربية أيضًا يصير مربّع العرض <MathText>{'$\\ell$'}</MathText> عددًا موجبًا ليس مربّعًا تامًّا. أيّ قيمة نأخذ للعرض؟</span>}
                  options={['الحلّ الموجب وحده، لأنّ العرض طول', 'الحلّين معًا: للزربية عرضان', 'الحلّ السالب، لأنّه الأصغر', 'لا شيء: المعادلة لا تقبل أيّ حلّ لأنّ العدد ليس مربّعًا تامًّا']}
                  correct={0} cols={1} requires={['hulul-x2-a', 'jidhr-taarif']}
                  explain={<span>{REMARKS.mujab} وعدد موجب ليس مربّعًا تامًّا له جذر تربيعي أيضًا، لكنّه عدد غير ناطق — كما في حوض الأزهار، حيث لا تقع أيّ تدريجة على الحلّ.</span>}
                  onAnswered={mark(2)} />
              </div>
              {q[2] && <KnowledgeBrick id="tadhkir-x2-a" variant="rappel" compact />}
            </div>
          ) },
        { ...round('r2', 'بلاط الحوض'),
          num: 3, title: 'اختيار الاستراتيجية', subtitle: 'القيمة المضبوطة ثم التدوير', done: !!q[3],
          content: (
            <div className="space-y-3">
              {/* la chaîne de la manche et la question sur UN écran (aucun aller-retour) */}
              <div className="space-y-3" data-paging-keep>
                {sw(
                  <WonPanel id="tiles" won={won.r2} title="أبسط كتابة لعرض الحوض، كما بنيتها في بلاط الحوض:" lines={R2_LINES}
                    empty="جولة بلاط الحوض: لم تبنِ بعد أبسط كتابة للعرض." />,
                  null,
                )}
                <TapQuestion prompt="الوضعية تطلب البعدين مدوّرين إلى 1cm. ما الترتيب الصحيح؟"
                  options={[REMARKS.tadwirRight, REMARKS.tadwirWrong, 'لا ندوّر: ما تعرضه الحاسبة هو القيمة المضبوطة للعرض.', 'ندوّر المساحة إلى أقرب مربّع تامّ قبل حلّ المعادلة.']}
                  correct={0} cols={1} requires={['kitaba-a-jidhr-b', 'qima-muqarraba']}
                  explain={<span>{REMARKS.tadwirWhy} في حوض الأزهار مثلًا: العرض المضبوط مدوّرًا {W_CM} سم، والطول المضبوط مدوّرًا {L_CM} سم — أمّا ضعف العرض المدوّر فيعطي {2 * W_CM} سم.</span>}
                  onAnswered={mark(3)} />
              </div>
              {q[3] && <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />}
            </div>
          ) },
        // L'ÉCRAN DU CAHIER (recette de la synthèse, point 5) : un vrai essai au crayon AVANT la correction pas à pas ; les étapes 5 et 6 sont la comparaison.
        { num: 4, title: 'بالقلم: خطّتك أنت', subtitle: 'اكتب في كرّاسك ثم قارن', done: !!q[4],
          content: (
            <div className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-4" data-notebook-screen>
              <p className="text-xl font-black text-indigo-950"><span aria-hidden="true">📓 </span>اكتب في كرّاسك ثم قارن.</p>
              <p className="text-lg font-bold text-slate-800">اكتب في 3 أسطر: أيّ معادلة تترجم المساحة، أيّ حلّ تحتفظ به، ومتى تدوّر.</p>
              <ol className="ms-6 list-decimal space-y-1 text-base text-slate-700">
                <li>المساحة بدلالة العرض: أيّ معادلة؟</li>
                <li>أيّ حلّ لهذه المعادلة هو العرض، وكيف تكتبه؟</li>
                <li>كيف تجد الطول، ومتى تدوّر البعدين؟</li>
              </ol>
              <p className="text-sm text-slate-600">الخطوات التالية تصحّح أسطرك سطرًا سطرًا. الحساب نفسه ينتظرك في التحدّي <span aria-hidden="true">🏆</span>.</p>
              {/* le bouton RESTE (aria-disabled après l'appui : le focus ne tombe pas sur la page) ; la région vivante est toujours montée */}
              <button type="button" onClick={() => { if (!q[4]) mark(4)(); }} aria-disabled={q[4] || undefined} data-notebook-done
                className={`min-h-[52px] rounded-2xl px-6 text-lg font-black focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${q[4] ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300' : 'bg-indigo-700 text-white shadow-[0_3px_0_0_#3730A3] hover:bg-indigo-800'}`}>
                {q[4] ? <><span aria-hidden="true">✓ </span>كتبتُ أسطري</> : 'كتبتُ أسطري — أقارن الآن'}
              </button>
              <p className="font-bold text-emerald-800" role="status">{q[4] ? 'قارن الآن أسطرك بالخطوات التالية.' : ''}</p>
            </div>
          ) },
        // LE MODÈLE, première étape au crayon : « 2ℓ² = 24 » — les données sur le même écran.
        { num: 5, title: 'ترييض الوضعية', subtitle: 'المساحة بدلالة العرض', done: !!q[5],
          content: (
            <div className="space-y-3" data-paging-keep>
              <Facts />
              <KnowledgeBrick id="masahat-mustatil" variant="rappel" compact />
              <TapQuestion
                prompt={<span>ليكن <MathText>{'$\\ell$'}</MathText> عرض الزربية و <MathText>{'$L = 2\\ell$'}</MathText> طولها (بالمتر). أيّ معادلة تترجم مساحة الزربية؟</span>}
                options={['$2\\ell^2 = 24$', '$3\\ell = 24$', '$4\\ell^2 = 24$', '$2\\ell^2 = 12000$'].map(M)}
                correct={0} cols={2} requires={['masahat-mustatil']}
                explain={<span><MathText>{REMARKS.masaha}</MathText> <MathText>{'$3\\ell = L + \\ell$'}</MathText> مجموع لا جداء، و <MathText>{'$4\\ell^2 = 2\\ell \\times 2\\ell$'}</MathText> مساحة مربّع ضلعه الطول. {REMARKS.sirWhy}</span>}
                onAnswered={mark(5)} />
            </div>
          ) },
        { num: 6, title: 'تنفيذ الاستراتيجية', subtitle: 'بالحرف S قبل الحساب', done: !!q[6],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'نسمّي $S$ مساحة مستطيل طوله ضعف عرضه $\\ell$ ، فتكون المعادلة $2\\ell^2 = S$ . احكم على كل عبارة.'}</MathText>}
                rows={[
                  { id: 'p1', label: <MathText>{'نقسم طرفي المعادلة على 2 فنحصل على $\\ell^2 = \\dfrac{S}{2}$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{'$2\\ell^2 = S$ تعني $\\ell^2 = \\dfrac{S}{2}$ : معادلة من الشكل $x^2 = a$ حيث $a > 0$ .'}</MathText> },
                  { id: 'p2', label: <MathText>{'للمعادلة $\\ell^2 = \\dfrac{S}{2}$ حلّان، فللمستطيل عرضان.'}</MathText>, options: TRUE_FALSE, correct: 1, correction: 'للمعادلة حلّان متعاكسان، لكنّ العرض طول موجب: نحتفظ بالحلّ الموجب وحده.' },
                  { id: 'p3', label: <MathText>{'العرض المضبوط هو $\\sqrt{\\dfrac{S}{2}}$ ، ونكتبه على الشكل $a\\sqrt{b}$ حيث $b$ أصغر ما يمكن.'}</MathText>, options: TRUE_FALSE, correct: 0, correction: 'نكتب الجذر على أبسط شكل بأكبر مربّع تامّ يقسم العدد تحت الجذر — كما في بلاط الحوض.' },
                  { id: 'p4', label: 'ندوّر العرض أوّلًا، ثم نضاعف القيمة المدوّرة لنجد الطول.', options: TRUE_FALSE, correct: 1, correction: 'نضاعف القيمة المضبوطة للعرض لنجد الطول المضبوط، ثم ندوّر كلّ بُعد في النهاية فقط.' },
                ]}
                requires={['tadhkir-x2-a', 'tariqat-wadiya']}
                feedback={({ allRight }) => <span>{allRight ? 'أحسنت: نقسم على 2، نحتفظ بالحلّ الموجب ونكتبه على أبسط شكل، ونضاعفه للطول، ثم ندوّر البعدين في النهاية.' : 'المعادلة تصير من الشكل «مربّع يساوي عددًا موجبًا»: العرض هو الحلّ الموجب، والطول ضعفه بالقيمة المضبوطة، والتدوير في النهاية.'}</span>}
                onAnswered={mark(6)} />
              {q[6] && <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />}
            </div>
          ) },
        // « ورقة رقيّة » (recette de la synthèse, point 5) : la DERNIÈRE étape — un PLAN faux d'une camarade, une erreur de JUSTIFICATION.
        { num: 7, title: 'ورقة رقيّة', subtitle: 'أين أخطأت رقيّة في خطّتها؟', done: !!q[7],
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
