import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { Manipulation } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { M7_SITUATION, REMARKS } from '../content/textbook';
import { M7_ROUNDS, R1, FOUNTAIN } from '../content/rounds';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 7 — « وضعية الوحدة » : la وضعية du bassin et du ruban (le défi 🏆 du module 8), ANALYSÉE dans les trois phases (قراءة · تحليل واختيار
 * استراتيجية · تنفيذ) — et jamais résolue : sa solution (4x² + 40x, x² + 10x − 11, (x − 1)(x + 11), x = 1 m, 144) n'apparaît sur aucun écran
 * avant le 🏆, ce module compris (content/forbidden.js › ANSWER_TEXT, content/mission.test.js). L'« مساعدة » du manuel (sa forme développée est
 * une réponse du défi) n'est montrée qu'au module 8.
 *
 * LA PAGE (l'enseignant, le mode classe) : le terrain FRÈRE « x+7+x » (la نافورة de côté 7 et son ممرّ), un seul niveau ; aucune manche.
 *
 * LE LECTEUR DE MISSION (la synthèse de l'unité 3, 2026-11-12 — recette PROVISOIRE de la synthèse, point 5 ; l'élève ne voit JAMAIS l'ancienne
 * vue) : UN `LabRounds` (content/rounds.js) — r1 « ممرّ النافورة » en aires, à la main (la construction NUMÉRIQUE « terrain − نافورة = 4 × شريط +
 * 4 × ركن » à son x), r2 « الممرّ بالحرف x » en termes (la construction « (2x + 7)² − 7² = 4x² + 28x ») — puis les étapes. L'étape 2 attend r1,
 * l'étape 3 attend r2 (`needsRound`, module-level : `useModulePlayer`). Les panneaux de trace sont REBÂTIS depuis les nombres du frère (x = 2 pour
 * la mesure) : un rechargement ne vide rien (les étoiles sont gardées).
 *
 * Étapes (les deux vues) : 1 lire et trier les données · 2 comment mesurer le ruban (après r1) · 3 la stratégie (après r2) · 4 « بالقلم » (l'écran
 * du cahier : « اكتب في 3 أسطر ») · 5 le MODÈLE « (10 + 2x)² − 10² = 44 » (première étape au crayon ; les données RAPPELÉES sur l'écran — aucun
 * aller-retour) · 6 la démarche en lettres (a, S) · 7 « ورقة مالك » (un PLAN faux : l'aire du ruban = périmètre du bassin × largeur). Le pied de
 * page ajoute, dans le lecteur, une ligne de pause avant le 🏆. Plus de « الكتاب » ni de SourceTag ; le تحدّ du triangle quitte le module.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];
const sw = (player, page) => <PlayerSwitch player={player} page={page} />;

/* ── ce que les manches ont montré, REBÂTI depuis les nombres du frère (la mesure à x = 2) ── */
const A = FOUNTAIN;
const X = 2;
const OUT = (A + 2 * X) ** 2;
const R1_LINES = [`${OUT} - ${A * A} = ${OUT - A * A}`, `4 \\times ${A * X} + 4 \\times ${X * X} = ${OUT - A * A}`];
const R2_LINES = [`(2x + ${A})^2 - ${A}^2 = 4x^2 + ${4 * A}x`];

/** Une ligne de trace dans le lecteur : ✓ caché aux lecteurs d'écran (« تمّ » le dit une fois, dans le titre). */
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
    {M7_SITUATION.data.filter((d) => d.useful).map((d) => <li key={d.id}>{d.text}</li>)}
  </ul>
);

export default function Module07AlWadiya() {
  const inPlayer = useModulePlayer(MODULE_CTX);
  const [q, setQ] = useState({});
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage)
  const [won, setWon] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const round = (id, label) => (inPlayer ? { needsRound: { id, label, icon: '⛲', won: Boolean(won[id]) } } : {});

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="الوضعية وتحليلها"
      moduleSubtitle="ثم التحدّي 🏆 — الحوض والشريط: ما عرض الشريط؟" estimatedTime="≈ 28 دقيقة"
      objectives={['ما المعطيات التي يحتاجها حساب عرض الشريط، وما الذي لا نحتاجه؟', 'كيف نعبّر عن مساحة الشريط بدلالة x؟', 'أيّ مساواة تترجم الوضعية، وأيّ قيمة نحتفظ بها؟']}
      intro={(
        // LE LABO OUVRE LE MODULE. Lecteur : les MANCHES (content/rounds.js) ; la page garde le terrain frère, un seul niveau.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m7-wadiya" rounds={M7_ROUNDS} icon="⛲" freeIcon="🧮"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <Manipulation type="pitch-expansion" expr={R1.expr} levels={false}
              lead={`ساحة مربّعة: المنطقة الوسطى نافورة مربّعة ضلعها ${FOUNTAIN}، والمناطق الثماني حولها ممرّ عرضه x من كل الجهات.`}
              mission="احمل المناطق التسع ثم تحقّق: كم مساحة الممرّ حول النافورة؟" />
          )}
        />
      )}
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'ما المعطيات المفيدة؟', done: !!q[1],
          content: (
            <div className="space-y-3" data-paging-keep>
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800" data-situation>
                <p><MathText>{M7_SITUATION.text}</MathText></p>
              </div>
              <p className="text-sm font-semibold text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لإيجاد عرض الشريط.</p>
              <InfoSorter items={M7_SITUATION.data} formative onSolved={mark(1)} />
            </div>
          ) },
        { ...round('r1', 'ممرّ النافورة'),
          num: 2, title: 'تحليل الوضعية: مساحة الشريط', subtitle: 'طريقتان', done: !!q[2],
          content: (
            <div className="space-y-3">
              {/* ce que la manche a montré et la question sur UN écran (aucun aller-retour) */}
              <div className="space-y-3" data-paging-keep>
                {sw(
                  <WonPanel id="ring" won={won.r1} title={<>مثال من ممرّ النافورة، من أجل <MathText>{`$x = ${X}$`}</MathText> — مساحته بطريقتين:</>} lines={R1_LINES}
                    empty="جولة ممرّ النافورة: لم تقس بعد مساحة الممرّ." />,
                  null,
                )}
                <TapQuestion
                  prompt="الشريط يحيط بالحوض كما يحيط الممرّ بالنافورة. كيف نحسب مساحة الشريط؟"
                  options={['مساحة المربّع الكبير (الحوض مع الشريط) ناقص مساحة الحوض', 'مساحة المربّع الكبير وحدها', 'مساحة الحوض ناقص مساحة المربّع الكبير', 'أربعة أشرطة على أضلاع الحوض فقط، دون الأركان']}
                  correct={0} cols={1} requires={['masahat-ashkal']}
                  explain={<span><MathText>{REMARKS.twoWays}</MathText> في ممرّ النافورة: <MathText>{`$${R1_LINES[0]}$`}</MathText> و <MathText>{`$${R1_LINES[1]}$`}</MathText> .</span>}
                  onAnswered={mark(2)} />
              </div>
              {q[2] && <KnowledgeBrick id="masaha-tariqatan" variant="rappel" compact />}
            </div>
          ) },
        { ...round('r2', 'الممرّ بالحرف x'),
          num: 3, title: 'اختيار الاستراتيجية', subtitle: 'من الشكل إلى المساواة', done: !!q[3],
          content: (
            <div className="space-y-3">
              {/* la construction de la manche et la question sur UN écran (aucun aller-retour) */}
              <div className="space-y-3" data-paging-keep>
                {sw(
                  <WonPanel id="ringExpr" won={won.r2} title="مساحة ممرّ النافورة بدلالة x، كما بنيتها:" lines={R2_LINES}
                    empty="جولة الممرّ بالحرف x: لم تبنِ بعد مساحة الممرّ بدلالة x." />,
                  null,
                )}
                <TapQuestion prompt="ما الاستراتيجية المناسبة لإيجاد عرض الشريط؟"
                  options={[
                    'أعبّر عن ضلع المربّع الكبير بدلالة x، ثم عن مساحة الشريط، ثم أكتب المساواة مع المساحة المعطاة وأحلّها',
                    'أكتب مباشرة أنّ مربّع عرض الشريط يساوي المساحة المعطاة',
                    'أجرّب قيمة واحدة لـ x؛ فإن لم تعطِ المساحة المعطاة فلا حلّ للوضعية',
                    'أطرح مساحة الحوض من المساحة المعطاة، فيكون الناتج عرض الشريط',
                  ]}
                  correct={0} cols={1} requires={['nashr-jadaa', 'mutatabiqat']}
                  explain={<span>كما في ممرّ النافورة: الضلع بدلالة <MathText>{'$x$'}</MathText> ، ثم المساحة (المربّع الكبير ناقص الحوض)، ثم المساواة. مربّع العرض وحده لا يمثّل الشريط، وقيمة واحدة لا تكفي للحكم، وطرح مساحتين يعطي مساحة لا طولًا.</span>}
                  onAnswered={mark(3)} />
              </div>
              {q[3] && <KnowledgeBrick id="namdhaja" variant="rappel" />}
            </div>
          ) },
        // L'ÉCRAN DU CAHIER (recette de la synthèse, point 5) : un vrai essai au crayon AVANT la correction pas à pas ; les étapes 5 et 6 sont la comparaison.
        { num: 4, title: 'بالقلم: خطّتك أنت', subtitle: 'اكتب في كرّاسك ثم قارن', done: !!q[4],
          content: (
            <div className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-4" data-notebook-screen>
              <p className="text-xl font-black text-indigo-950"><span aria-hidden="true">📓 </span>اكتب في كرّاسك ثم قارن.</p>
              <p className="text-lg font-bold text-slate-800">اكتب في 3 أسطر: ضلع المربّع الكبير، مساحة الشريط، والمساواة التي تترجم الوضعية.</p>
              <ol className="ms-6 list-decimal space-y-1 text-base text-slate-700">
                <li>ضلع المربّع الكبير بدلالة <MathText>{'$x$'}</MathText> : ماذا تكتب؟</li>
                <li>مساحة الشريط: أيّ مساحتين تطرح؟</li>
                <li>أيّ مساواة تكتب، وماذا تفعل بقيمتي <MathText>{'$x$'}</MathText> اللتين تجدهما؟</li>
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
        // LE MODÈLE, première étape au crayon : « (10 + 2x)² − 10² = 44 » — les données sur le même écran.
        { num: 5, title: 'ترييض الوضعية', subtitle: 'المساواة بدلالة x', done: !!q[5],
          content: (
            <div className="space-y-3" data-paging-keep>
              <Facts />
              <TapQuestion
                prompt={<span>ليكن <MathText>{'$x$'}</MathText> عرض الشريط بالمتر. أيّ مساواة تترجم: «مساحة الشريط 44 مترًا مربّعًا»؟</span>}
                options={['$(10 + 2x)^2 - 10^2 = 44$', '$(10 + x)^2 - 10^2 = 44$', '$(10 + 2x)^2 = 44$', '$4 \\times 10x = 44$'].map(M)}
                correct={0} cols={2} requires={['namdhaja', 'masaha-tariqatan']}
                explain={<span>على كل ضلع: شريط، ثم الحوض، ثم شريط، أي <MathText>{'$x + 10 + x = 10 + 2x$'}</MathText> ؛ ومساحة الشريط هي المربّع الكبير ناقص الحوض. <MathText>{'$10 + x$'}</MathText> يضع الشريط على جهة واحدة، و <MathText>{'$(10 + 2x)^2$'}</MathText> وحده يضمّ الحوض، و <MathText>{'$4 \\times 10x$'}</MathText> ينسى الأركان الأربعة.</span>}
                onAnswered={mark(5)} />
            </div>
          ) },
        { num: 6, title: 'تنفيذ الاستراتيجية', subtitle: 'بالحرفين a و S قبل الحساب', done: !!q[6],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'نسمّي $a$ ضلع الحوض و $S$ مساحة الشريط المعطاة. احكم على كل عبارة.'}</MathText>}
                rows={[
                  { id: 'p1', label: <MathText>{'ننشر $(a + 2x)^2 - a^2$ فنحصل على $4x^2 + 4ax$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{'$(a + 2x)^2 = a^2 + 4ax + 4x^2$ ، ثم نطرح $a^2$ : تبقى الأركان $4x^2$ والأشرطة $4ax$ .'}</MathText> },
                  { id: 'p2', label: <MathText>{'المساواة $4x^2 + 4ax = S$ تكافئ $x^2 + ax = \\dfrac{S}{4}$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.divide}</MathText> },
                  { id: 'p3', label: 'إذا أُعطي الشكل المحلّل، يكون الجداء معدومًا إذا كان أحد عامليه معدومًا.', options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.help}</MathText> },
                  { id: 'p4', label: 'القيمتان اللتان تعدمان الجداء هما عرضان ممكنان للشريط.', options: TRUE_FALSE, correct: 1, correction: <MathText>{REMARKS.mujab}</MathText> },
                ]}
                requires={['masaha-tariqatan', 'mutatabiqat']}
                feedback={({ allRight }) => <span>{allRight ? 'أحسنت: ننشر ونطرح الحوض، نقسم على 4، نستعمل الشكل المحلّل المعطى، ثم نحتفظ بالقيمة الموجبة ونتحقّق منها.' : 'مساحة الشريط: المربّع الكبير ناقص الحوض؛ نقسم على 4، ومن القيمتين اللتين تعدمان الجداء نحتفظ بالموجبة وحدها.'}</span>}
                onAnswered={mark(6)} />
              {q[6] && (
                <>
                  <KnowledgeBrick id="musaada-jadaa" variant="rappel" compact />
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                  <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />
                </>
              )}
            </div>
          ) },
        // « ورقة مالك » (recette de la synthèse, point 5) : la DERNIÈRE étape — un PLAN faux d'un camarade, une erreur de JUSTIFICATION.
        { num: 7, title: 'ورقة مالك', subtitle: 'أين أخطأ مالك في خطّته؟', done: !!q[7],
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
