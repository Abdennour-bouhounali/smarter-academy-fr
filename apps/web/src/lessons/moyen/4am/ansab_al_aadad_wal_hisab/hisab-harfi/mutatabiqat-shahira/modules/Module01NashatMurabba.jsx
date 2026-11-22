import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TrialEvidence, { upsertTrial } from '../components/TrialEvidence';
import { HOOK, LABS, PAGE_LABS, PLATFORM } from '../content/textbook';
import { M1_ROUNDS } from '../content/squares';
import DescartesTable from '../components/DescartesTable';

/**
 * Module 1 — مربّع مجموع ومربّع فرق, et le tableau de Descartes.
 *
 * LE RÉEL : un ملعب جواري carré de 20 m que la commune agrandit de 2 m ; un ouvrier croit qu'il suffit d'ajouter le petit carré 2 × 2 (404 m²).
 * La question revient au dernier pas, tranchée par l'identité (484 m²).
 *
 * LA PAGE (enseignant, mode classe) — LABORATOIRE À DEUX NIVEAUX, UN INSTRUMENT (`pitch-expansion`, terrain carré) : مبتدئ (x + 3)², متقدم
 * (x − 2)² ; ses lignes de trace viennent de content/textbook.js › PAGE_LABS.
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 2 ; conseil du 2026-11-11, verdict L2) : le labo se joue en MANCHES (content/squares.js ›
 * M1_ROUNDS, labId `lab-square` : (x + 4)² en aires → (x − 5)² → (2x − 1)² requise → défi ⭐ → la ورشة libre) au lieu de مبتدئ / متقدم ; un
 * essai est un appui sur « تحقّق ». Les étapes 1 et 3 attendent la manche 1, les étapes 8 et 10 la manche 2 : ce que leur ligne de trace dit vient
 * des manches GAGNÉES (étoiles gardées, annoncées par LabRounds au montage) — un rechargement ne bloque ni ne vide jamais une étape.
 *
 * INDÉPENDANCE DU MANUEL (rollout 2026-11-11, SHARED-deliberate — la page de l'enseignant y gagne aussi) : les questions, la figure et le paragraphe
 * de Descartes du manuel ne sont plus montrés (content/textbook.js › PLATFORM) ; les nombres des étapes sont ceux de la plateforme, et aucun ne
 * rejoue la مسألة (ni b = 3, ni un carré mental ancré sur 30 — content/mission.test.js). LP enseignés : P1, P2, P4.
 */
const m = (tex) => <MathText key={tex}>{tex}</MathText>;

/** Lecteur : la ligne de trace d'une étape vient de la manche GAGNÉE (étoiles gardées), jamais d'un essai qu'un rechargement aurait effacé. */
function RoundEvidence({ won, round, yes, no }) {
  return (
    <p className={`rounded-xl border-2 px-3 py-2 text-sm ${won ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}
      data-activity-evidence={round} data-tried={won ? 'true' : 'false'}>
      {won ? <><span aria-hidden="true">✓ </span><MathText>{yes}</MathText></> : <MathText>{no}</MathText>}
    </p>
  );
}

export default function Module01NashatMurabba() {
  const [sumTrials, setSumTrials] = useState([]);
  const [diffTrials, setDiffTrials] = useState([]);
  const [d, setD] = useState({});
  const done = (k) => () => setD((s) => ({ ...s, [k]: true }));
  const { side, extra, workersClaim } = HOOK.square;
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de son terrain l'est
  const [cps, setCps] = useState([]);
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage) ouvrent les étapes et remplissent leur trace
  const [won, setWon] = useState({});
  const mine = sumTrials.find((t) => t.ok);
  const Evidence = ({ ok, done: line, todo }) => (
    <p data-evidence="checkpoint" data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? line : todo}
    </p>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["ماذا يحدث لمساحة ملعب مربّع حين نمدّد ضلعه أو نقتطع منه شريطين؟", "كم منطقة في الملعب، وما مساحة كل منها؟", "كيف نحسب $41^2$ و $49^2$ ذهنيًا دون وضع العملية؟"]}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="مربّع مجموع ومربّع فرق"
      moduleSubtitle="ملعب مربّع يكبر، ثم ملعب تُقتطع منه أشرطة"
      estimatedTime="13 دقيقة"
      intro={
        // LE LABO OUVRE LE MODULE (§4quater). Lecteur : les MANCHES (content/squares.js) ; la page garde ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-square" rounds={M1_ROUNDS} icon="⚽" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <div className="space-y-2">
                <Manipulation
                  type="pitch-expansion"
                  level="beginner"
                  expr={LABS.squareSum}
                  title="ملعب مربّع يكبر"
                  lead="ملعب جواري مربّع تمدّد البلدية ضلعه كلما كبر x."
                  onTrial={(t) => setSumTrials((list) => upsertTrial(list, t))}
                  onCheckpoint={(e) => setCps((l) => [...l, e])}
                />
                <SourceTag source={LABS.source} />
              </div>
            ),
            advanced: () => (
              <div className="space-y-2">
                <Manipulation
                  type="pitch-expansion"
                  level="advanced"
                  expr={LABS.squareDiff}
                  title="ملعب مربّع يُقتطع منه شريطان"
                  lead="تُقتطع من الملعب أشرطة: المناطق المخطّطة مقتطعة."
                  onTrial={(t) => setDiffTrials((list) => upsertTrial(list, t))}
                  onCheckpoint={(e) => setCps((l) => [...l, e])}
                />
                <SourceTag source={LABS.source} />
              </div>
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '⚽', won: Boolean(won.r1) },
          num: 1, title: 'لماذا لا يكفي مربّعان؟', subtitle: 'من ملعبك', done: answered(LABS.squareSum) || Boolean(won.r1),
          content: (
            <PlayerSwitch
              player={<RoundEvidence won={won.r1} round="r1"
                yes={'الجولة 1: حين حملتَ المربّعين وحدهما أضاءت منطقتان، شريطان متقايسان مساحة كل منهما $4x$ . مساحة الملعب $(x + 4)^2$ هي مجموع مناطقه الأربع: المربّعان والشريطان.'}
                no="الجولة 1: لم تتحقّق بعد من الملعب المربّع." />}
              page={(
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">ملعبك <MathText>{`$${PAGE_LABS.squareSum}$`}</MathText> — ما تحقّقت منه:</p>
                  <TrialEvidence trials={sumTrials} line={PAGE_LABS.sumLine}
                    empty="لم تتحقّق بعد: اسحب مناطق الملعب في المستوى المبتدئ، ثم اضغط «تحقّق»." />
                  <Evidence ok={answered(LABS.squareSum) && !!mine}
                    done={<span>أجبتَ في المختبر: عند <MathText>{`$x = ${mine?.x}$`}</MathText> مساحة ملعبك <MathText>{`$${mine?.product}$`}</MathText> ، أمّا المربّعان وحدهما فمجموعهما <MathText>{PAGE_LABS.twoSquares(mine?.x ?? 0)}</MathText> فقط: يغيب الشريطان <MathText>{`$${PAGE_LABS.strip}$`}</MathText> و <MathText>{`$${PAGE_LABS.strip}$`}</MathText> .</span>}
                    todo="أتمّ ملعب المستوى المبتدئ (احمل المناطق، اجمع، وتحقّق من قيمتين)، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
                </div>
              )}
            />
          ),
        },
        {
          num: 2, title: 'مربّع مجموع بطريقتين', done: !!d.a1,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm font-semibold text-slate-700"><MathText>{PLATFORM.twoWays}</MathText></p>}
              rows={[
                { id: 'w1', label: m('$(6 + 4)^2 = 10^2 =$'), options: ['$100$', '$52$', '$20$'].map(m), correct: 0 },
                { id: 'w2', label: m('$(6 + 4)(6 + 4) = 6 \\times 6 + 6 \\times 4 + 4 \\times 6 + 4 \\times 4 =$'), options: ['$52$', '$76$', '$100$'].map(m), correct: 2, correction: m('$36 + 24 + 24 + 16 = 100$') },
                { id: 'w3', label: m('$(2 + 0{,}5)^2 = 2{,}5^2 =$'), options: ['$4{,}25$', '$6{,}25$', '$5$'].map(m), correct: 1 },
                { id: 'w4', label: m('$(2 + 0{,}5)(2 + 0{,}5) = 4 + 1 + 1 + 0{,}25 =$'), options: ['$6{,}25$', '$5{,}25$', '$4{,}25$'].map(m), correct: 0 },
              ]}
              requires={['nashr-qawsayn', 'murabba-adad']}
              feedback={({ allRight }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  <MathText>{'الطريقتان تعطيان العدد نفسه. لاحظ: $6^2 + 4^2 = 52$ لا يكفي، ينقص $24 + 24$.'}</MathText>
                </Feedback>
              )}
              onAnswered={done('a1')}
            />
          ),
        },
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '⚽', won: Boolean(won.r1) },
          num: 3, title: 'مساحة المربّع بطريقتين', subtitle: 'من ملعبك', done: answered(LABS.squareSum) || Boolean(won.r1),
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="الشكل" text={PLATFORM.figureSum} compact />
              <PlayerSwitch
                player={<RoundEvidence won={won.r1} round="r1-rule"
                  yes={'بنيتَ في الجولة 1 القاعدة بالحرفين: المربّع أربع مناطق، مربّعان مساحتاهما $a^2$ و $b^2$ ومستطيلان مساحة كل منهما $ab$ ، فيكون $(a + b)^2 = a^2 + ab + ab + b^2$ .'}
                  no="أتمّ الجولة 1 حتى القاعدة." />}
                page={(
                  <Evidence ok={answered(LABS.squareSum)}
                    done={<span>استخلصتَ في المختبر من ملعبك <MathText>{`$${PAGE_LABS.squareSum}$`}</MathText> : المربع أربع مناطق، مربّعان مساحتاهما <MathText>{'$a^2$'}</MathText> و <MathText>{'$b^2$'}</MathText> ومستطيلان مساحة كل منهما <MathText>{'$ab$'}</MathText> ، فيكون <MathText>{'$(a + b)^2 = a^2 + ab + ab + b^2$'}</MathText> .</span>}
                    todo="أجب عن أسئلة المختبر في المستوى المبتدئ حتى القاعدة." />
                )}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'مربّع مجموع: انقل وأكمل', subtitle: 'من أجل كل عددين', done: !!d.c1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{PLATFORM.chain}</MathText></p>}
                rows={[
                  { id: 'c1', label: m('$(a + b)^2 = (a + b) \\times (\\ldots)$'), options: ['$a \\times b$', '$a + b$', '$a^2 + b^2$'].map(m), correct: 1, correction: m('مربع عدد هو جداؤه في نفسه.') },
                  { id: 'c2', label: m('$= \\ldots + \\ldots + \\ldots + \\ldots$'), options: ['$a^2 + ab + ba + b^2$', '$a^2 + b^2 + a + b$', '$a^2 + ab + b^2 + 1$'].map(m), correct: 0, correction: m('كل حد من القوس الأول في كل حد من القوس الثاني.') },
                  { id: 'c3', label: m('$= \\ldots + \\ldots + \\ldots$'), options: ['$a^2 + ab + b^2$', '$2a + 2ab + 2b$', '$a^2 + 2ab + b^2$'].map(m), correct: 2, correction: m('$ab + ba = 2ab$ : حدّان متشابهان.') },
                ]}
                requires={['nashr-qawsayn', 'tabsit-hudud']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{'$(a + b)^2 = (a + b)(a + b) = a^2 + ab + ba + b^2 = a^2 + 2ab + b^2$'}</MathText>
                  </Feedback>
                )}
                onAnswered={done('c1')}
              />
              {d.c1 && <KnowledgeBrick id="murabba-majmu" lead="هذا ما رأيته على ملعبك وأكملته في السلسلة، من أجل كل عددين: مربع مجموع." />}
            </div>
          ),
        },
        {
          num: 5, title: 'مربّع مجموع: انشر', done: !!d.d1,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm font-semibold text-slate-700"><MathText>{PLATFORM.expand}</MathText></p>}
              rows={[
                { id: 'd1', label: m('$(x + 2)^2 =$'), options: ['$x^2 + 4$', '$x^2 + 4x + 4$', '$x^2 + 2x + 4$'].map(m), correct: 1, correction: m('$x^2 + 2 \\times x \\times 2 + 2^2 = x^2 + 4x + 4$') },
                { id: 'd2', label: m('$(2x + 7)^2 =$'), options: ['$2x^2 + 28x + 49$', '$4x^2 + 14x + 49$', '$4x^2 + 28x + 49$'].map(m), correct: 2, correction: m('$(2x)^2 + 2 \\times 2x \\times 7 + 7^2 = 4x^2 + 28x + 49$') },
              ]}
              requires={['murabba-majmu', 'murabba-adad']}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{'الحد الأول في $(2x + 7)^2$ هو $2x$ ، ومربعه $(2x)^2 = 4x^2$.'}</MathText></Feedback>}
              onAnswered={done('d1')}
            />
          ),
        },
        {
          num: 6, title: 'جدول ديكارت', subtitle: 'الجدول تحت ملعبك', done: !!d.dk,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                الجدول الذي تحت ملعبك في المختبر له اسم: <strong>جدول ديكارت</strong>. في رأسه حدود الضلع، وفي كل خانة مساحة منطقة.
                {' '}هذا جدول ديكارت للعدد <MathText>{'$(2x + 2)^2$'}</MathText>: ضلع المربع <MathText>{'$x + x + 2$'}</MathText>.
              </p>
              <DescartesTable head={PLATFORM.descartes.head} cells={PLATFORM.descartes.cells} caption="جدول ديكارت" />
              <TapQuestion
                prompt={<span>اجمع الأعداد المسجلة في الخانات التسع: <MathText>{'$(2x + 2)^2 = \\ldots$'}</MathText></span>}
                options={['$2x^2 + 4x + 4$', '$4x^2 + 4$', '$4x^2 + 8x + 4$', '$4x^2 + 4x + 4$'].map(m)}
                correct={2}
                cols={2}
                requires={['murabba-majmu', 'tabsit-hudud']}
                explain={<MathText>{'أربع خانات $x^2$ وأربع خانات $2x$ وخانة $4$ : $4x^2 + 8x + 4$ ، وهو أيضًا $(2x)^2 + 2 \\times 2x \\times 2 + 2^2$.'}</MathText>}
                onAnswered={done('dk')}
              />
              {d.dk && <TextbookBox kind="remark" title="روني ديكارت" text={PLATFORM.descartes.text} compact />}
            </div>
          ),
        },
        {
          num: 7, title: 'احسب ذهنيًا', subtitle: 'دون وضع العملية', done: !!d.e1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{PLATFORM.mental}</MathText></p>}
                rows={[
                  { id: 'e1', label: m('$41^2 =$'), options: ['$1601$', '$1681$', '$1641$'].map(m), correct: 1, correction: m('$(40 + 1)^2 = 1600 + 80 + 1 = 1681$') },
                  { id: 'e2', label: m('$62^2 =$'), options: ['$3604$', '$3724$', '$3844$'].map(m), correct: 2, correction: m('$(60 + 2)^2 = 3600 + 240 + 4 = 3844$') },
                ]}
                requires={['murabba-majmu', 'quwa-ashara']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{'$41 = 40 + 1$ : مربع مجموع، والحد المضاعف $2 \\times 40 \\times 1 = 80$ لا يُنسى.'}</MathText></Feedback>}
                onAnswered={done('e1')}
              />
              {d.e1 && <KnowledgeBrick id="hisab-mutamaan" lead="ما فعلته الآن طريقة للحساب الذهني:" />}
            </div>
          ),
        },
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '⚽', won: Boolean(won.r2) },
          num: 8, title: 'لماذا إشارة الركن موجبة؟', subtitle: 'من ملعبك', done: !!d.w2,
          content: (
            <PlayerSwitch
              player={(
                <div className="space-y-3">
                  <RoundEvidence won={won.r2} round="r2"
                    yes={'الجولة 2: حملتَ مناطق الملعب $(x - 5)^2$ كلّها: $x^2$ ، الشريطان $-5x$ و $-5x$ ، والركن $+25$ ، وتحقّقت من قيمتين لـ $x$ .'}
                    no="الجولة 2: لم تتحقّق بعد من الملعب ذي الشريطين المقتطعين." />
                  <TapQuestion
                    prompt={<span>في ملعبك <MathText>{'$(x - 5)^2$'}</MathText> طرحتَ الشريطين <MathText>{'$5x$'}</MathText> و <MathText>{'$5x$'}</MathText> من <MathText>{'$x^2$'}</MathText> ، وظهر الركن <MathText>{'$+25$'}</MathText> في «المجموع». لماذا إشارته موجبة؟</span>}
                    options={[
                      'لأنّ الشريطين المقتطعين يمرّان كلاهما فوقه: $(-5) \\times (-5) = +25$',
                      'لأنّ مساحة كل منطقة موجبة، فتُضاف دائمًا',
                      'لأنّ الركن ليس جزءًا من الملعب',
                    ].map(m)}
                    correct={0}
                    cols={1}
                    requires={['nashr-qawsayn']}
                    explain={<MathText>{'كل شريط عرضه $5$ يمرّ فوق الركن $5 \\times 5 = 25$ ، وحين نطرح الشريطين يُطرح الركن مع كل منهما؛ لذلك يظهر في النشر $(-5) \\times (-5) = +25$ .'}</MathText>}
                    onAnswered={done('w2')}
                  />
                </div>
              )}
              page={(
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">ملعبك <MathText>{`$${PAGE_LABS.squareDiff}$`}</MathText> — ما تحقّقت منه:</p>
                  <TrialEvidence trials={diffTrials} line={PAGE_LABS.diffLine}
                    empty="لم تتحقّق بعد: افتح المستوى المتقدم، اسحب كل المناطق — المقتطعة أيضًا — ثم اضغط «تحقّق»." />
                  <TapQuestion
                    prompt={<span>في ملعبك <MathText>{`$${PAGE_LABS.squareDiff}$`}</MathText> طرحتَ الشريطين <MathText>{`$${PAGE_LABS.diffStrip}$`}</MathText> و <MathText>{`$${PAGE_LABS.diffStrip}$`}</MathText> من <MathText>{'$x^2$'}</MathText>، ثم أضفتَ الركن <MathText>{`$+${PAGE_LABS.corner}$`}</MathText>. لماذا يُضاف الركن؟</span>}
                    options={[
                      'لأنّه اقتُطع مرّتين، مرّة داخل كل شريط، فنُعيده مرّة واحدة',
                      'لأنّ مساحة الركن موجبة، فتُضاف دائمًا',
                      'لأنّ الركن ليس جزءًا من الملعب',
                    ]}
                    correct={0}
                    cols={1}
                    requires={['nashr-qawsayn']}
                    explain={<MathText>{`كل شريط عرضه $2$ يشمل الركن $2 \\times 2 = ${PAGE_LABS.corner}$، فاقتطعنا الركن مرّتين: نطرح $${PAGE_LABS.diffStrip} + ${PAGE_LABS.diffStrip}$ ثم نعيد $${PAGE_LABS.corner}$ مرّة واحدة.`}</MathText>}
                    onAnswered={done('w2')}
                  />
                </div>
              )}
            />
          ),
        },
        {
          num: 9, title: 'مربّع فرق بطريقتين', done: !!d.a2,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm font-semibold text-slate-700"><MathText>{PLATFORM.twoWays}</MathText></p>}
              rows={[
                { id: 'v1', label: m('$(11 - 4)^2 = 7^2 =$'), options: ['$105$', '$49$', '$137$'].map(m), correct: 1 },
                { id: 'v2', label: m('$(11 - 4)(11 - 4) = 121 - 44 - 44 + 16 =$'), options: ['$49$', '$17$', '$105$'].map(m), correct: 0 },
                { id: 'v3', label: m('$(2{,}4 - 4)^2 = (-1{,}6)^2 =$'), options: ['$-2{,}56$', '$16$', '$2{,}56$'].map(m), correct: 2, correction: m('مربع عدد سالب موجب: $(-1{,}6)^2 = 2{,}56$') },
                { id: 'v4', label: m('$(2{,}4 - 4)(2{,}4 - 4) = 5{,}76 - 9{,}6 - 9{,}6 + 16 =$'), options: ['$2{,}56$', '$-13{,}44$', '$-29{,}44$'].map(m), correct: 0 },
              ]}
              requires={['nashr-qawsayn', 'murabba-adad']}
              feedback={({ allRight }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  <MathText>{'الطريقتان تعطيان العدد نفسه. لاحظ: $121 - 16 = 105$ ليس $(11 - 4)^2$ ، ينقص $-44 - 44$ ويبقى $+16$.'}</MathText>
                </Feedback>
              )}
              onAnswered={done('a2')}
            />
          ),
        },
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '⚽', won: Boolean(won.r2) },
          num: 10, title: 'مربّع تُقتطع منه أشرطة', subtitle: 'من ملعبك', done: !!d.b2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="الشكل" text={PLATFORM.figureDiff} compact />
              <PlayerSwitch
                player={<RoundEvidence won={won.r2} round="r2-rule"
                  yes={'بنيتَ في الجولة 2 القاعدة بالحرفين: $(a - b)^2 = a^2 - 2ab + b^2$ .'}
                  no="أتمّ الجولة 2 حتى القاعدة." />}
                page={(
                  <>
                    <p className="text-sm font-semibold text-slate-700">ملعبك <MathText>{`$${PAGE_LABS.squareDiff}$`}</MathText> — ما تحقّقت منه في المستوى المتقدم:</p>
                    <TrialEvidence trials={diffTrials} line={PAGE_LABS.diffLine}
                      empty="لم تتحقّق بعد: افتح المستوى المتقدم، اسحب كل المناطق — المقتطعة أيضًا — ثم اضغط «تحقّق»." />
                  </>
                )}
              />
              <TapQuestion
                prompt={<MathText>{PLATFORM.areaTwoWays}</MathText>}
                options={[
                  '$(a - b)^2 = a^2 - b^2$',
                  '$(a - b)^2 = a^2 - 2(a - b)b - b^2$',
                  '$(a - b)^2 = a^2 - 2ab - b^2$',
                ].map(m)}
                correct={1}
                cols={1}
                requires={['nashr-qawsayn']}
                explain={<span>نطرح من المربّع الكبير الشريطين دون الركن (مساحة كل منهما <MathText>{'$(a - b)b$'}</MathText>) والركن (مساحته <MathText>{'$b^2$'}</MathText>). وبالنشر: <MathText>{'$a^2 - 2ab + 2b^2 - b^2 = a^2 - 2ab + b^2$'}</MathText> .</span>}
                onAnswered={done('b2')}
              />
            </div>
          ),
        },
        {
          num: 11, title: 'مربّع فرق: انقل وأكمل', subtitle: 'من أجل كل عددين', done: !!d.c2,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{PLATFORM.chain}</MathText></p>}
                rows={[
                  { id: 'f1', label: m('$(a - b)^2 = (a - b) \\times (\\ldots)$'), options: ['$a - b$', '$a + b$', '$b - a$'].map(m), correct: 0 },
                  { id: 'f2', label: m('$= \\ldots - \\ldots - \\ldots + \\ldots$'), options: ['$a^2 - ab - ba - b^2$', '$a^2 - ab - ba + b^2$', '$a^2 - b^2$'].map(m), correct: 1, correction: m('$(-b) \\times (-b) = +b^2$') },
                  { id: 'f3', label: m('$= \\ldots - \\ldots + \\ldots$'), options: ['$a^2 - 2ab - b^2$', '$a^2 + 2ab + b^2$', '$a^2 - 2ab + b^2$'].map(m), correct: 2, correction: m('$-ab - ba = -2ab$') },
                ]}
                requires={['nashr-qawsayn', 'tabsit-hudud']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{'$(a - b)^2 = (a - b)(a - b) = a^2 - ab - ba + b^2 = a^2 - 2ab + b^2$'}</MathText>
                  </Feedback>
                )}
                onAnswered={done('c2')}
              />
              {d.c2 && <KnowledgeBrick id="murabba-farq" lead="الشريطان المقتطعان والركن، من أجل كل عددين: مربع فرق." />}
            </div>
          ),
        },
        {
          num: 12, title: 'مربّع فرق: انشر واحسب ذهنيًا', done: !!d.d2,
          content: (
            <BatchChoiceQuestion
              intro={(
                <div className="space-y-1 text-sm font-semibold text-slate-700">
                  <p><MathText>{PLATFORM.expand}</MathText></p>
                  <p><MathText>{PLATFORM.mental}</MathText></p>
                </div>
              )}
              rows={[
                { id: 'g1', label: m('$(x - 7)^2 =$'), options: ['$x^2 - 49$', '$x^2 - 14x + 49$', '$x^2 - 14x - 49$'].map(m), correct: 1, correction: m('$x^2 - 2 \\times x \\times 7 + 7^2 = x^2 - 14x + 49$') },
                { id: 'g2', label: m('$(4 - 3x)^2 =$'), options: ['$16 - 24x + 9x^2$', '$16 - 9x^2$', '$16 - 12x + 9x^2$'].map(m), correct: 0, correction: m('$4^2 - 2 \\times 4 \\times 3x + (3x)^2 = 16 - 24x + 9x^2$') },
                { id: 'g3', label: m('$49^2 =$'), options: ['$2499$', '$2399$', '$2401$'].map(m), correct: 2, correction: m('$(50 - 1)^2 = 2500 - 100 + 1 = 2401$') },
                { id: 'g4', label: m('$38^2 =$'), options: ['$1444$', '$1436$', '$1596$'].map(m), correct: 0, correction: m('$(40 - 2)^2 = 1600 - 160 + 4 = 1444$') },
              ]}
              requires={['murabba-farq', 'hisab-mutamaan']}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{'في مربع فرق الحد الأخير موجب: $49^2 = 2500 - 100 + 1$ ، لا $2500 - 100 - 1$.'}</MathText></Feedback>}
              onAnswered={done('d2')}
            />
          ),
        },
        {
          num: 13, title: 'عودة إلى الملعب الجواري', subtitle: 'هل العامل على حق؟', done: !!d.h,
          content: (
            <div className="space-y-3">
            <p className="text-sm text-slate-700">
              ملعب جواري مربّع ضلعه <MathText>{`$${side}\\,m$`}</MathText>، وتزيد البلدية ضلعه <MathText>{`$${extra}\\,m$`}</MathText> في الطول وفي العرض.
              {' '}يقول أحد العمّال: «نضيف مربّعًا صغيرًا مساحته <MathText>{`$${extra} \\times ${extra}$`}</MathText>، فتصبح المساحة <MathText>{`$${workersClaim}\\,m^2$`}</MathText>». <SourceTag source={HOOK.source} />
            </p>
            <TapQuestion
              prompt={<span>ضلع الملعب صار <MathText>{`$${side} + ${extra} = ${side + extra}\\,m$`}</MathText>. هل العامل على حق؟ ما مساحته الجديدة؟</span>}
              options={[`$${workersClaim}\\,m^2$`, `$${(side + extra) ** 2}\\,m^2$`, `$${side * side + 2 * side * extra}\\,m^2$`, `$${side * side + side * extra + extra * extra}\\,m^2$`].map(m)}
              correct={1}
              cols={2}
              requires={['murabba-majmu', 'hisab-mutamaan']}
              explain={<MathText>{`$(${side} + ${extra})^2 = ${side * side} + ${2 * side * extra} + ${extra * extra} = ${(side + extra) ** 2}$ : العامل نسي الشريطين، مساحة كل منهما $${side} \\times ${extra} = ${side * extra}\\,m^2$.`}</MathText>}
              onAnswered={done('h')}
            />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
