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
import * as G from '../../../../../../common/manipulations/logic/growthRace';
import { poolOf } from '../../../../../../common/manipulations/logic/growthRacePlayer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { M7_SITUATION, REMARKS } from '../content/textbook';
import { M7_ROUNDS, R1, R2, LAB, LEAD } from '../content/rounds';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';
import { PoolScene } from '../components/MuadalatFigures';

/**
 * Module 7 — « وضعية الوحدة » : la وضعية du مسبح (le défi 🏆 du module 8), ANALYSÉE dans les trois phases (قراءة · تحليل واختيار استراتيجية ·
 * تنفيذ) — et jamais résolue : sa solution (70x, x > 8, 9 séances, 600 دج à l'égalité, 675 / 605) n'apparaît sur aucun écran avant le 🏆, ce
 * module compris (content/forbidden.js › ANSWER_TEXT, content/mission.test.js).
 *
 * LA PAGE (l'enseignant, le mode classe) : les deux tarifs FRÈRES des manches, deux niveaux d'un ManipulationWorkspace (props : content/rounds.js
 * › LAB, figées par lab.render.test.jsx) ; aucune manche.
 *
 * LE LECTEUR DE MISSION (la synthèse de l'unité 4, 2026-11-12 — recette PROVISOIRE de la synthèse, point 5 ; l'élève ne voit JAMAIS l'ancienne
 * vue) : UN `LabRounds` (content/rounds.js) — r1 « قاعة الرياضة » (bâtir l'inéquation, l'égalité, la première séance meilleure), r2 « نادي
 * الرماية » (la première séance meilleure, la construction NUMÉRIQUE « 30 × 5 = 150 ») — puis les étapes. L'étape 2 attend r1, l'étape 3
 * attend r2 (`needsRound`, module-level : `useModulePlayer`). Les panneaux de trace sont REBÂTIS depuis les tarifs des manches (logique du labo) :
 * un rechargement ne vide rien (les étoiles sont gardées).
 *
 * Étapes (les deux vues) : 1 lire et trier les données · 2 ce que « ابتداءً من » demande (après r1) · 3 la stratégie (après r2) · 4 « بالقلم »
 * (l'écran du cahier : « اكتب في 3 أسطر ») · 5 le MODÈLE « 560 + 5x < 75x » (première étape au crayon ; les données RAPPELÉES sur l'écran —
 * aucun aller-retour) · 6 la démarche en lettres (a, b, f) · 7 « ورقة زكريا » (un PLAN faux : la borne prise pour la réponse). Le pied de page
 * ajoute, dans le lecteur, une ligne de pause avant le 🏆. Plus de « الكتاب » ni de SourceTag.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TRUE_FALSE = ['صحيح', 'خاطئ'];
const sw = (player, page) => <PlayerSwitch player={player} page={page} />;
const plain = (s) => s.replace(/\$/g, '').replace(/\s+/g, ' ').replace(/ ([؛،.])/g, '$1');

/* ── ce que les manches ont montré, REBÂTI depuis leurs tarifs par la logique du labo ── */
const race = (p) => {
  const model = G.parseModel(p.left, p.right);
  const { a, b, f } = poolOf(model);
  const n = G.toNumber(G.solution(model).x);
  return { a, b, f, n, eq: a * n, nx: n + 1 };
};
const T1 = race(R1);
const T2 = race(R2);
const R1_LINES = [
  `${T1.a} \\times ${T1.n} = ${T1.f} + ${T1.b} \\times ${T1.n} = ${T1.eq}`,
  `${T1.f} + ${T1.b} \\times ${T1.nx} = ${T1.f + T1.b * T1.nx} < ${T1.a * T1.nx} = ${T1.a} \\times ${T1.nx}`,
];
const R2_LINES = [
  `(${T2.a} - ${T2.b}) \\times ${T2.n} = ${T2.f}`,
  `${T2.f} + ${T2.b} \\times ${T2.nx} = ${T2.f + T2.b * T2.nx} < ${T2.a * T2.nx} = ${T2.a} \\times ${T2.nx}`,
];

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
  const round = (id, label) => (inPlayer ? { needsRound: { id, label, icon: '🎟️', won: Boolean(won[id]) } } : {});

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="الوضعية وتحليلها"
      moduleSubtitle="ثم التحدّي 🏆 — أيّ صيغة اشتراك أفضل؟" estimatedTime="≈ 28 دقيقة"
      objectives={['ما الذي تطلبه «ابتداءً من أيّ عدد للحصص»، ولماذا لا يكفي عدد التساوي؟', 'كيف أترجم كل صيغة بعبارة بدلالة عدد الحصص؟', 'أيّ متراجحة تقارن بين الصيغتين، وكيف أختار الجواب من حلولها؟']}
      intro={(
        // LE LABO OUVRE LE MODULE. Lecteur : les MANCHES (content/rounds.js) ; la page garde deux niveaux sur les mêmes tarifs frères.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m7-wadiya" rounds={M7_ROUNDS} icon="🎟️" freeIcon="🏷️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => <Manipulation type="growth-race" level="beginner" {...LAB.beginner} title="قاعة الرياضة" lead={plain(LEAD.r1)} />,
                advanced: () => <Manipulation type="growth-race" level="advanced" {...LAB.advanced} title="نادي الرماية" lead={plain(LEAD.r2)} />,
              }}
            />
          )}
        />
      )}
      steps={[
        { num: 1, title: 'قراءة الوضعية وفهمها', subtitle: 'ما المعطيات المفيدة؟', done: !!q[1],
          content: (
            <div className="space-y-3" data-paging-keep>
              <div className="space-y-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800" data-situation>
                <div className="mx-auto h-20 w-36"><PoolScene /></div>
                <p><MathText>{M7_SITUATION.text}</MathText></p>
              </div>
              <p className="text-sm font-semibold text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لمعرفة الصيغة الأفضل.</p>
              <InfoSorter items={M7_SITUATION.data} formative onSolved={mark(1)} />
            </div>
          ) },
        { ...round('r1', 'قاعة الرياضة'),
          num: 2, title: 'ما المطلوب بالضبط؟', subtitle: 'التساوي أم «ابتداءً من»؟', done: !!q[2],
          content: (
            <div className="space-y-3">
              {/* ce que la manche a montré et la question sur UN écran (aucun aller-retour) */}
              <div className="space-y-3" data-paging-keep>
                {sw(
                  <WonPanel id="first" won={won.r1} title="في قاعة الرياضة، كما وجدتَ على المسطرة:" lines={R1_LINES}
                    empty="جولة قاعة الرياضة: لم تبحث بعد عن الحصّة التي تصبح فيها الصيغة الثانية أفضل." />,
                  null,
                )}
                <TapQuestion
                  prompt="السؤال: «ابتداءً من أيّ عدد للحصص تكون الصيغة الثانية أفضل؟». عمّ نبحث؟"
                  options={['عن أصغر عدد طبيعي للحصص تكون عنده تكلفة الثانية أقلّ تمامًا من تكلفة الأولى', 'عن عدد الحصص الذي تتساوى عنده التكلفتان', 'عن الصيغة الأرخص إذا سبحنا حصّة واحدة', 'عن ثمن حصّة واحدة في كل صيغة']}
                  correct={0} cols={1} requires={['tarrid-tarjama']}
                  explain={<span>كما في قاعة الرياضة: عند <MathText>{`$${T1.n}$`}</MathText> حصص تتساوى التكلفتان فلا تكون أيّ صيغة أفضل، وابتداءً من <MathText>{`$${T1.nx}$`}</MathText> حصص تصبح الثانية أرخص. «أفضل» تعني أرخص تمامًا، و«ابتداءً من» تطلب أوّل عدد بعد التساوي.</span>}
                  onAnswered={mark(2)} />
              </div>
              {q[2] && <KnowledgeBrick id="tafsir-natija" variant="rappel" compact />}
            </div>
          ) },
        { ...round('r2', 'نادي الرماية'),
          num: 3, title: 'اختيار الاستراتيجية', subtitle: 'من الترجمة إلى المتراجحة', done: !!q[3],
          content: (
            <div className="space-y-3">
              {/* la construction de la manche et la question sur UN écran (aucun aller-retour) */}
              <div className="space-y-3" data-paging-keep>
                {sw(
                  <WonPanel id="saving" won={won.r2} title="في نادي الرماية، كما بنيتَ:" lines={R2_LINES}
                    empty="جولة نادي الرماية: لم تبنِ بعد ما توفّره الصيغة الثانية." />,
                  null,
                )}
                <TapQuestion prompt="ما الاستراتيجية المناسبة لمعرفة ابتداءً من كم حصّة تكون الصيغة الثانية أفضل؟"
                  options={[
                    'أترجم كل صيغة بعبارة بدلالة x، أكتب المتراجحة «تكلفة الثانية أقلّ من تكلفة الأولى» وأحلّها، ثم أختار أصغر عدد طبيعي يحقّقها',
                    'أكتب معادلة التساوي بين الصيغتين وأعطي حلّها جوابًا',
                    'أجرّب عددًا واحدًا من الحصص؛ إن كانت الثانية أغلى فهي أغلى دائمًا',
                    'أقارن ثمن حصّة واحدة فقط: الأرخص للحصّة هي الأفضل دائمًا',
                  ]}
                  correct={0} cols={1} requires={['tarrid-tarjama', 'hall-mutarajiha']}
                  explain={<span>في نادي الرماية: كل حصّة توفّر <MathText>{`$${T2.a} - ${T2.b} = ${T2.a - T2.b}$`}</MathText> دج، فيُسترجع الاشتراك بعد <MathText>{`$${T2.n}$`}</MathText> حصص، ثم تصبح الثانية أفضل. التجريب يرشد، والمتراجحة تعطي كل الأعداد، ثم نختار أصغرها الطبيعي. معادلة التساوي وحدها لا تكفي، وعدد واحد لا يكفي للحكم، وثمن الحصّة وحده ينسى الاشتراك.</span>}
                  onAnswered={mark(3)} />
              </div>
              {q[3] && (
                <>
                  <KnowledgeBrick id="tajrib" variant="rappel" compact />
                  <KnowledgeBrick id="mutarajiha-mufadala" variant="rappel" />
                </>
              )}
            </div>
          ) },
        // L'ÉCRAN DU CAHIER (recette de la synthèse, point 5) : un vrai essai au crayon AVANT la correction pas à pas ; les étapes 5 et 6 sont la comparaison.
        { num: 4, title: 'بالقلم: خطّتك أنت', subtitle: 'اكتب في كرّاسك ثم قارن', done: !!q[4],
          content: (
            <div className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-4" data-notebook-screen>
              <p className="text-xl font-black text-indigo-950"><span aria-hidden="true">📓 </span>اكتب في كرّاسك ثم قارن.</p>
              <p className="text-lg font-bold text-slate-800">اكتب في 3 أسطر: عبارة كل صيغة بدلالة x، المتراجحة التي تترجم «الثانية أفضل»، وكيف تختار الجواب.</p>
              <ol className="ms-6 list-decimal space-y-1 text-base text-slate-700">
                <li>تكلفة كل صيغة من أجل <MathText>{'$x$'}</MathText> حصّة: ماذا تكتب؟</li>
                <li>«الصيغة الثانية أفضل»: أيّ متراجحة تكتب؟</li>
                <li>من حلول المتراجحة، أيّ عدد للحصص تختار، ولماذا ليس عدد التساوي؟</li>
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
        // LE MODÈLE, première étape au crayon : « 560 + 5x < 75x » — les données sur le même écran.
        { num: 5, title: 'ترييض الوضعية', subtitle: 'المتراجحة بدلالة x', done: !!q[5],
          content: (
            <div className="space-y-3">
              <div className="space-y-3" data-paging-keep>
                <Facts />
                <TapQuestion
                  prompt={<span>ليكن <MathText>{'$x$'}</MathText> عدد الحصص. أيّ متراجحة تترجم: «الصيغة الثانية أفضل»؟</span>}
                  options={['$560 + 5x < 75x$', '$560 + 5x > 75x$', '$560 + 5x = 75x$', '$(560 + 5)x < 75x$'].map(M)}
                  correct={0} cols={2} requires={['tarrid-tarjama', 'hall-mutarajiha']}
                  explain={<span>تكلفة الأولى <MathText>{'$75x$'}</MathText> ، وتكلفة الثانية <MathText>{'$560 + 5x$'}</MathText> لأنّ الاشتراك يُدفع مرّة واحدة؛ و«أفضل» تعني أقلّ تكلفة. المساواة تصف لحظة التساوي فقط، و <MathText>{'$(560 + 5)x$'}</MathText> يدفع الاشتراك في كل حصّة.</span>}
                  onAnswered={mark(5)} />
              </div>
              {q[5] && <KnowledgeBrick id="tarjama-sigha" variant="rappel" compact />}
            </div>
          ) },
        { num: 6, title: 'تنفيذ الاستراتيجية', subtitle: 'بالحروف a و b و f قبل الحساب', done: !!q[6],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'نسمّي $a$ ثمن الحصّة في الصيغة الأولى، و $f$ الاشتراك و $b$ ثمن الحصّة في الثانية، حيث $a > b$ . احكم على كل عبارة.'}</MathText>}
                rows={[
                  { id: 'p1', label: <MathText>{'المتراجحة $f + bx < ax$ تكافئ $f < (a - b)x$ .'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{'نطرح $bx$ من الطرفين: $f < ax - bx$ ، أي $f < (a - b)x$ .'}</MathText> },
                  { id: 'p2', label: <MathText>{'نقسم الطرفين على $a - b$ ، وهو عدد موجب، فلا يتغيّر اتجاه المتراجحة.'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{'بما أنّ $a > b$ فإنّ $a - b > 0$ : القسمة على عدد موجب تحافظ على الاتجاه، فنجد $x > \\dfrac{f}{a - b}$ .'}</MathText> },
                  { id: 'p3', label: <MathText>{'عند $x = \\dfrac{f}{a - b}$ تصبح الصيغة الثانية أفضل لأوّل مرّة.'}</MathText>, options: TRUE_FALSE, correct: 1, correction: <MathText>{`${REMARKS.istirjaa} عنده تتساوى التكلفتان فقط.`}</MathText> },
                  { id: 'p4', label: <MathText>{'إذا كان $\\dfrac{f}{a - b}$ عددًا طبيعيًا، فالجواب هو العدد الطبيعي الذي يليه.'}</MathText>, options: TRUE_FALSE, correct: 0, correction: <MathText>{REMARKS.tasawiRight}</MathText> },
                ]}
                requires={['tarjama-sigha', 'mutarajiha-mufadala', 'tafsir-natija']}
                feedback={({ allRight }) => <span>{allRight ? 'أحسنت: نترجم، نكتب المتراجحة، نقسم على عدد موجب، ثم نختار أصغر عدد طبيعي بعد عدد التساوي.' : 'عند عدد التساوي تتساوى التكلفتان فقط؛ الجواب أصغر عدد طبيعي يحقّق المتراجحة القطعية.'}</span>}
                onAnswered={mark(6)} />
              {q[6] && (
                <>
                  <KnowledgeBrick id="tariqat-wadiya" variant="rappel" />
                  <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />
                </>
              )}
            </div>
          ) },
        // « ورقة زكريا » (recette de la synthèse, point 5) : la DERNIÈRE étape — un PLAN faux d'un camarade, une erreur de JUSTIFICATION.
        { num: 7, title: 'ورقة زكريا', subtitle: 'أين أخطأ زكريا في خطّته؟', done: !!q[7],
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
