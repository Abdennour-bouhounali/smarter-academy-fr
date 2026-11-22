import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
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
import { M2_ROUNDS } from '../content/squares';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 2 — جداء مجموع حدين وفرقهما.
 *
 * LE RÉEL : un entraîneur transforme un terrain carré de 20 m en rectangle, +5 m de long, −5 m de large, et croit l'aire inchangée. Tranché au
 * dernier pas : il perd 5² = 25 m².
 *
 * LA PAGE (enseignant, mode classe) — LABORATOIRE À DEUX NIVEAUX (`pitch-expansion`, kind sum-diff) : مبتدئ (x + 3)(x − 3), متقدم (2x + 5)(2x − 5) ;
 * ses lignes de trace viennent de content/textbook.js › PAGE_LABS.
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 2 ; conseil du 2026-11-11, verdict L2.4/L2.5) : les MANCHES (content/squares.js ›
 * M2_ROUNDS, labId `lab-sumdiff` : (x + 4)(x − 4) → défi ⭐ (3x + 4)(3x − 4) → la ورشة libre) ; la réunion de +4x et −4x laisse une pastille « 0 »
 * (la coupe). L'étape 1 attend la manche : sa trace vient de la manche GAGNÉE.
 *
 * INDÉPENDANCE DU MANUEL (SHARED-deliberate) : la figure et les questions du manuel ne sont plus montrées (content/textbook.js › PLATFORM) ; les
 * nombres sont ceux de la plateforme ((x − 5)(x + 5), (3x − 2)(3x + 2), 102 × 98, 96² − 4²). DERNIÈRE ÉTAPE : « ورقة طارق » (`PeerSheet`,
 * content/peerSheet.js — conseil L2.2 : le 2ab oublié d'un carré de somme), sur la page aussi. LP enseignés : P3, P4.
 */
const m = (tex) => <MathText key={tex}>{tex}</MathText>;

export default function Module02NashatJidaa() {
  const [beginnerTrials, setBeginnerTrials] = useState([]);
  const [advancedTrials, setAdvancedTrials] = useState([]);
  const [d, setD] = useState({});
  const done = (k) => () => setD((s) => ({ ...s, [k]: true }));
  const { side, change } = HOOK.rectangle;
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de son terrain l'est
  const [cps, setCps] = useState([]);
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const sawAdvanced = answered(LABS.sumDiffAdvanced);
  // lecteur : la manche gagnée (étoiles gardées, annoncées par LabRounds au montage) ouvre l'étape 1 et remplit sa trace
  const [won, setWon] = useState({});
  const Evidence = ({ ok, done: line, todo }) => (
    <p data-evidence="checkpoint" data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? line : todo}
    </p>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["ماذا يبقى من ملعب طوله مجموع حدّين وعرضه فرقهما؟", "أيّ منطقتين تتعادمان؟", "كيف نحسب $102 \\times 98$ ذهنيًا؟"]}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="جداء مجموع حدين وفرقهما"
      moduleSubtitle="ملعب يطول بقدر ما يضيق"
      estimatedTime="10 دقائق"
      intro={
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-sumdiff" rounds={M2_ROUNDS} icon="⚽" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="pitch-expansion"
                level="beginner"
                expr={LABS.sumDiffBeginner}
                title="ملعب يطول بقدر ما يضيق"
                lead="ملعب يطول بقدر ما يضيق: شريط يُضاف في الطول وشريط يُقتطع من العرض."
                onTrial={(t) => setBeginnerTrials((list) => upsertTrial(list, t))}
                onCheckpoint={(e) => setCps((l) => [...l, e])}
              />
            ),
            advanced: () => (
              <Manipulation
                type="pitch-expansion"
                level="advanced"
                expr={LABS.sumDiffAdvanced}
                title="ملعب يطول بقدر ما يضيق: معامل في الحدّين"
                lead="الفكرة نفسها بأعداد أكبر: ملعب يطول بقدر ما يضيق."
                onTrial={(t) => setAdvancedTrials((list) => upsertTrial(list, t))}
                onCheckpoint={(e) => setCps((l) => [...l, e])}
              />
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'm2', label: 'ملعب يطول بقدر ما يضيق', icon: '⚽', won: Boolean(won.m2) },
          num: 1, title: 'لماذا اختفى الحدّ في x؟', subtitle: 'من ملعبك', done: answered(LABS.sumDiffBeginner) || sawAdvanced || Boolean(won.m2),
          content: (
            <PlayerSwitch
              player={(
                <p className={`rounded-xl border-2 px-3 py-2 text-sm ${won.m2 ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}
                  data-activity-evidence="m2" data-tried={won.m2 ? 'true' : 'false'}>
                  {won.m2
                    ? <><span aria-hidden="true">✓ </span><MathText>{'في ملعبك $(x + 4)(x - 4)$ وضعتَ المنطقة $4x$ على المنطقة $-4x$ فبقي $0$ : المنطقتان متساويتان وإشارتاهما متعاكستان، فتتعادمان ولا يبقى في الجواب حدّ فيه $x$ .'}</MathText></>
                    : <MathText>{'لم تتحقّق بعد من الملعب الذي يطول بقدر ما يضيق.'}</MathText>}
                </p>
              )}
              page={(
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">ما تحقّقت منه في المختبر:</p>
                  <TrialEvidence trials={advancedTrials} line={PAGE_LABS.sdAdvancedLine} empty="المستوى المتقدم: لم تتحقّق بعد." />
                  <TrialEvidence trials={beginnerTrials} line={PAGE_LABS.sdLine} empty="المستوى المبتدئ: لم تتحقّق بعد." />
                  <Evidence ok={answered(LABS.sumDiffBeginner) || sawAdvanced}
                    done={<span>أجبتَ في المختبر: المنطقتان المضافة والمقتطعة متساويتان وإشارتاهما متعاكستان، فتتعادمان ولا يبقى في الجواب حدّ في <MathText>{'$x$'}</MathText> .</span>}
                    todo="أتمّ ملعبًا من المستويين (احمل المناطق، اجمع، وتحقّق من قيمتين)، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
                </div>
              )}
            />
          ),
        },
        {
          num: 2, title: 'مساحة المستطيل بطريقتين', subtitle: 'مربّع يُقسَم إلى مستطيلين', done: !!d.a,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="الشكل" text={PLATFORM.figureSumDiff} compact />
              <TapQuestion
                prompt={<MathText>{PLATFORM.rectTwoWays}</MathText>}
                options={[
                  '$(a + b)(a - b) = (a + b)^2 - 2b(a + b) = a^2 - 2ab + b^2$',
                  '$(a + b)(a - b) = (a + b)^2 - 2b(a + b) = a^2 - b^2$',
                  '$(a + b)(a - b) = (a + b)^2 - b^2 = a^2 + 2ab$',
                ].map(m)}
                correct={1}
                cols={1}
                requires={['murabba-majmu', 'nashr-qawsayn']}
                explain={<span>المستطيل الأول هو المربّع ناقص المستطيل الثاني: <MathText>{'$(a + b)^2 - 2b(a + b) = a^2 + 2ab + b^2 - 2ab - 2b^2 = a^2 - b^2$'}</MathText> — كما في ملعبك: الحدّان المتعاكسان تعادما.</span>}
                onAnswered={done('a')}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'البرهان: انقل وأكمل', subtitle: 'من أجل كل عددين', done: !!d.b,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{PLATFORM.chain}</MathText></p>}
                rows={[
                  { id: 'p1', label: m('$(a + b)(a - b) = \\ldots - \\ldots + \\ldots - \\ldots$'), options: ['$a^2 - ab - ba + b^2$', '$a^2 - ab + ba - b^2$', '$a^2 + ab + ba - b^2$'].map(m), correct: 1, correction: m('$a \\times a - a \\times b + b \\times a - b \\times b$') },
                  { id: 'p2', label: m('$= \\ldots - \\ldots$'), options: ['$a^2 - b^2$', '$a^2 - 2b^2$', '$a^2 - 2ab$'].map(m), correct: 0, correction: m('$-ab + ba = 0$ : الحدّان يتعادمان.') },
                ]}
                requires={['nashr-qawsayn', 'tabsit-hudud']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{'$(a + b)(a - b) = a^2 - ab + ba - b^2 = a^2 - b^2$'}</MathText>
                  </Feedback>
                )}
                onAnswered={done('b')}
              />
              {d.b && <KnowledgeBrick id="jidaa-majmu-farq" lead="برهنت ما رأيته على الملعب، من أجل كل عددين: جداء مجموع حدين وفرقهما." />}
            </div>
          ),
        },
        {
          num: 4, title: 'انشر', done: !!d.c,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm font-semibold text-slate-700"><MathText>{PLATFORM.expand}</MathText></p>}
              rows={[
                { id: 'n1', label: m('$(x - 5)(x + 5) =$'), options: ['$x^2 + 25$', '$x^2 - 10x - 25$', '$x^2 - 25$'].map(m), correct: 2, correction: m('$x^2 - 5^2 = x^2 - 25$') },
                { id: 'n2', label: m('$(3x - 2)(3x + 2) =$'), options: ['$9x^2 - 4$', '$3x^2 - 4$', '$9x^2 + 4$'].map(m), correct: 0, correction: m('$(3x)^2 - 2^2 = 9x^2 - 4$') },
              ]}
              requires={['jidaa-majmu-farq', 'murabba-adad']}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{'ترتيب العاملين لا يهمّ: $(x - 5)(x + 5) = (x + 5)(x - 5)$.'}</MathText></Feedback>}
              onAnswered={done('c')}
            />
          ),
        },
        {
          num: 5, title: 'احسب ذهنيًا', subtitle: 'دون وضع العملية', done: !!d.dh,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hisab-mutamaan" variant="rappel" compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{PLATFORM.mental}</MathText></p>}
                rows={[
                  { id: 'h1', label: m('$102 \\times 98 =$'), options: ['$10\\,004$', '$9996$', '$9960$'].map(m), correct: 1, correction: m('$(100 + 2)(100 - 2) = 10\\,000 - 4 = 9996$') },
                  { id: 'h2', label: m('$96^2 - 4^2 =$'), options: ['$8464$', '$10\\,000$', '$9200$'].map(m), correct: 2, correction: m('$(96 + 4)(96 - 4) = 100 \\times 92 = 9200$') },
                ]}
                requires={['jidaa-majmu-farq', 'hisab-mutamaan']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{'نقرأ المتطابقة في الاتجاهين: $102 \\times 98$ جداء مجموع وفرق، و $96^2 - 4^2$ فرق مربّعين.'}</MathText></Feedback>}
                onAnswered={done('dh')}
              />
            </div>
          ),
        },
        {
          num: 6, title: 'عودة إلى الملعب', subtitle: 'هل المدرّب على حق؟', done: !!d.h,
          content: (
            <div className="space-y-3">
            <p className="text-sm text-slate-700">
              مدرّب يتطوّع لتدريب أطفال الحيّ يحوّل ملعبًا مربّعًا ضلعه <MathText>{`$${side}\\,m$`}</MathText> إلى ملعب مستطيل: يزيد طوله <MathText>{`$${change}\\,m$`}</MathText> ويُنقص عرضه <MathText>{`$${change}\\,m$`}</MathText>.
              {' '}يقول: «أضفت ما أنقصت، فالمساحة لم تتغيّر». <SourceTag source={HOOK.source} />
            </p>
            <TapQuestion
              prompt={<span>الملعب صار طوله <MathText>{`$${side + change}\\,m$`}</MathText> وعرضه <MathText>{`$${side - change}\\,m$`}</MathText>. ماذا تقول للمدرّب؟</span>}
              options={[
                `المساحة لم تتغيّر: $${side * side}\\,m^2$`,
                `نقصت المساحة $${change * change}\\,m^2$ لأنّ $${side + change} \\times ${side - change} = ${side}^2 - ${change}^2 = ${(side + change) * (side - change)}$`,
                `زادت المساحة $${change * change}\\,m^2$`,
              ].map(m)}
              correct={1}
              cols={1}
              requires={['jidaa-majmu-farq']}
              explain={<MathText>{`$(${side} + ${change})(${side} - ${change}) = ${side}^2 - ${change}^2$ : المنطقتان المضافة والمقتطعة متساويتان، لكن الركن $${change}^2 = ${change * change}$ يضيع.`}</MathText>}
              onAnswered={done('h')}
            />
            </div>
          ),
        },
        {
          num: 7, title: 'ورقة زميل', subtitle: `أين أخطأ ${PEER_KID.name}؟`, done: !!d.peer,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={done('peer')} />,
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
