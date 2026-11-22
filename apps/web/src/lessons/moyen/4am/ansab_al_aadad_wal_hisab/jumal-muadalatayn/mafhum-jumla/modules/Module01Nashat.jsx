import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, PairQuestion } from '../../../../../../common/textbook';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { MODULE_CTX, getNavLinks, useStudentPlayer } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, COINS } from '../content/textbook';
import { M1_ROUNDS, SYS } from '../content/pairs';

/**
 * Module 1 — « لوحة الشرطين » : ouvert sur le TABLEAU DES DEUX CONDITIONS (pair-scoreboard).
 *
 * LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 1 ; conseil du 2026-11-11, verdict L1) : le labo se joue en MANCHES (content/pairs.js ›
 * M1_ROUNDS : la carte de saison à la main → la cagnotte de la classe → la jauge (2) couverte → défi ⭐ → le tableau libre) ; trois étapes, chacune
 * après sa manche (`needsRound`) et avec ce qu'elle interroge SUR son écran : (1) ce que (5 ; 2) dit de la saison, à côté d'une carte de la saison ;
 * (2) la jumla de la cagnotte (une île KaTeX) et deux ثنائيات à juger — (4 ; 5) et (6 ; 3), pas de renversée (L1.10) — puis la brique jumla-nashat ;
 * (3) la manche couverte, et le module suivant. Les lignes « ✓ » viennent des manches GAGNÉES (étoiles gardées, annoncées par LabRounds au montage) :
 * un rechargement ne bloque jamais une étape.
 * PAGE (enseignant, mode classe) — réécrite sur les nombres de la PLATEFORME (SHARED-deliberate, prompt §12.12) : مبتدئ = la saison
 * x + y = 7 ∣ 3x + y = 17 ; متقدم = le service « après » x + y = 29 ∣ 2(x − 3) = y − 2 (content/textbook.js › ACTIVITY) ; les quatre questions sur ce
 * service ; puis le transfert, la cagnotte de la classe (9 pièces, 300 دج) sur le même tableau.
 */
const BEGINNER = SYS.r1;
const ADVANCED = ACTIVITY.system;

const Opt = (s) => <MathText key={s}>{s}</MathText>;

/** La carte de la saison (r1), posée À CÔTÉ de la question qui la lit (lecteur : jamais d'aller-retour). */
function SeasonCard() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 px-4 py-2 text-sm font-bold text-emerald-950" data-season-card>
      <span aria-hidden="true">⚽</span>
      <span>بطاقة موسم فريق الحيّ</span>
      <span className="rounded-lg bg-white px-2 py-0.5">المباريات: 7، دون أيّ هزيمة</span>
      <span className="rounded-lg bg-white px-2 py-0.5">النقاط: 17</span>
      <span className="text-xs font-semibold text-emerald-800">الانتصار بـ 3 نقاط، والتعادل بنقطة</span>
    </div>
  );
}

export default function Module01Nashat() {
  const player = useStudentPlayer();
  const [trials, setTrials] = useState({ [BEGINNER]: [], [ADVANCED]: [] });
  const [cps, setCps] = useState([]);
  const [won, setWon] = useState({});
  const [p1, setP1] = useState(false);
  const [p2, setP2] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const onTrial = (sys) => (tr) => setTrials((t) => ({ ...t, [sys]: [...t[sys].filter((p) => p.pair !== tr.pair), tr] }));
  const onCheckpoint = (ev) => setCps((l) => [...l, ev]);
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const q1 = answered('half');
  const mine = trials[ADVANCED];
  const first = trials[BEGINNER];

  const wonLine = (id, yes, no) => (
    <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won[id] ? 'font-bold text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      {won[id] ? <><span aria-hidden="true">✓ </span><MathText>{yes}</MathText></> : <MathText>{no}</MathText>}
    </p>
  );

  const coinsSystem = (
    <p className="text-center text-base font-bold text-slate-900" data-coins-system>
      <MathText>{'حصّالة القسم: $\\begin{cases} x + y = 9 \\\\ 50x + 20y = 300 \\end{cases}$'}</MathText>
    </p>
  );

  const playerSteps = [
    {
      needsRound: { id: 'r1', label: 'الجولة 1', icon: '⚽', won: Boolean(won.r1) },
      num: 1, title: 'ماذا يقول العددان؟', subtitle: 'من بطاقة الموسم', done: p1,
      content: (
        <div className="space-y-3" data-paging-keep>
          {wonLine('r1', 'الجولة 1: قبلت اللوحتان عدديك $(5 ; 2)$ معًا.', 'الجولة 1: لم تقبل اللوحتان عدديك بعد.')}
          <SeasonCard />
          <TapQuestion
            prompt={<MathText>{'أضاءت اللوحتان معًا مع $(5 ; 2)$ . ماذا يقول هذان العددان عن الموسم؟'}</MathText>}
            options={['5 انتصارات وتعادلان', '5 انتصارات وهزيمتان', '7 انتصارات'].map(Opt)}
            correct={0}
            cols={1}
            requires={['taawid-majhulayn']}
            explain={<MathText>{'العدد الأول عدد الانتصارات والثاني عدد التعادلات: $5 + 2 = 7$ مباريات، و $3 \\times 5 + 2 = 17$ نقطة. ولا هزيمة في هذا الموسم.'}</MathText>}
            onAnswered={() => setP1(true)}
          />
        </div>
      ),
    },
    {
      needsRound: { id: 'r2', label: 'الجولة 2', icon: '🪙', won: Boolean(won.r2) },
      num: 2, title: 'معادلتان معًا', subtitle: 'من حصّالة القسم', done: p2,
      content: (
        <div className="space-y-3">
          {wonLine('r2', 'الجولة 2: وجدتَ عدّة ثنائيات تعطي 9 قطع، وواحدة فقط تقبلها اللوحتان.', 'الجولة 2: لم تكملها بعد.')}
          <div className="space-y-2" data-paging-keep>
            {coinsSystem}
            <BatchChoiceQuestion
              intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'هل تحقّق الثنائية المعادلتين معًا؟'}</MathText></p>}
              rows={[
                { id: 'p45', label: <MathText>{'$(4 ; 5)$'}</MathText>, options: ['تحقّقهما معًا', 'لا تحقّقهما معًا'], correct: 0, correction: <MathText>{COINS.checkRight}</MathText> },
                { id: 'p63', label: <MathText>{'$(6 ; 3)$'}</MathText>, options: ['تحقّقهما معًا', 'لا تحقّقهما معًا'], correct: 1, correction: <MathText>{COINS.checkHalf}</MathText> },
              ]}
              requires={['taawid-majhulayn']}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'هذا ما قرأته على اللوحتين.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
              onAnswered={() => setP2(true)}
            />
          </div>
          {p2 && <KnowledgeBrick id="jumla-nashat" lead="ما قبلته اللوحتان معًا، مكتوبًا:" />}
        </div>
      ),
    },
    {
      needsRound: { id: 'r3', label: 'الجولة 3', icon: '⚽', won: Boolean(won.r3) },
      num: 3, title: 'اللوحة المغطّاة', subtitle: 'عوّضتَ قبل أن تحكم اللوحة', done: Boolean(won.r3),
      content: (
        <div className="space-y-3">
          {wonLine('r3', 'الجولة 3: عوّضتَ في الشرط الثاني قبل أن تكشفه اللوحة، فوجدتَ $(8 ; 5)$ .', 'الجولة 3: اللوحة (2) لا تزال مغطّاة.')}
          {won.r3 && (
            <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
              <MathText>{'في كل جولة معادلتان بمجهولين، وثنائية واحدة تحقّقهما معًا. المحور التالي يعطي هذا الشكل اسمه، ويقول متى تكون ثنائية حلًّا — ومتى لا يكون للجملة حلّ وحيد.'}</MathText>
            </p>
          )}
        </div>
      ),
    },
  ];

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={mine.length ? 'true' : 'false'}>
      {mine.length === 0 && first.length > 0 ? (
        <p className="text-slate-600">جرّبتَ ثنائيات على بطاقة الموسم. افتح المستوى المتقدّم لتجرّب لوحة المصلحة.</p>
      ) : mine.length === 0 ? (
        <p className="text-slate-500">لم تجرّب أي ثنائية بعد على لوحة الشرطين (المستوى المتقدّم).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">ثنائياتك على لوحة المصلحة:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="trials">
            {mine.slice(-10).map((tr) => (
              <li key={tr.pair} data-evidence-trial={tr.pair} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-800">
                <bdi dir="ltr" className="font-mono">{tr.pair}</bdi>{' '}
                (1) <span aria-hidden="true" className={tr.ok1 ? 'text-emerald-700' : 'text-rose-700'}>{tr.ok1 ? '✓' : '✗'}</span><span className="sr-only">{tr.ok1 ? 'محقّقة' : 'غير محقّقة'}</span>{' '}
                (2) <span aria-hidden="true" className={tr.ok2 ? 'text-emerald-700' : 'text-rose-700'}>{tr.ok2 ? '✓' : '✗'}</span><span className="sr-only">{tr.ok2 ? 'محقّقة' : 'غير محقّقة'}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const pageSteps = [
    {
      num: 1, title: 'ثنائية تضيء لوحة واحدة', subtitle: 'عشرون رجلًا وتسع نساء؟', done: q1,
      content: (
        <div className="space-y-3">
          <TextbookBox kind="exercise" text={`${ACTIVITY.text} هل يمكن أن يكون عدد الرجال 20 وعدد النساء 9؟ اشرح.`} source={ACTIVITY.source} compact />
          {evidence}
          <p className="rounded-xl border-2 px-3 py-2 text-sm border-slate-200 bg-white text-slate-600" data-activity-evidence="half" data-tried={q1 ? 'true' : 'false'}>
            {q1
              ? <MathText>{`أجبتَ في المختبر عن ثنائيتك التي أضاءت لوحة واحدة: ثنائية مثل $(20 ; 9)$ تحقّق المعادلة (1) ولا تحقّق (2)، فليست حلًّا — ${ACTIVITY_LINES.a}`}</MathText>
              : 'جرّب في المختبر ثنائية تضيء لوحة واحدة فقط، ثم أجب عن الأسئلة التي تظهر فوقه.'}
          </p>
        </div>
      ),
    },
    {
      num: 2, title: 'الترجمة بمعادلتين', subtitle: 'من النصّ إلى المعادلتين', done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-800"><MathText>{'نرمز بـ $x$ إلى عدد الرجال وبـ $y$ إلى عدد النساء قبل الانتقال. عدد الموظّفين: $x + y = 29$ ، وهي المعادلة (1).'}</MathText></p>
          <TapQuestion
            prompt="«فأصبح عدد النساء الباقيات ضعف عدد الرجال الباقين»: أي معادلة تترجم هذه الجملة؟"
            options={['$2(x - 3) = y - 2$', '$2x - 3 = y - 2$', '$x - 3 = 2(y - 2)$', '$2(x - 2) = y - 3$'].map(Opt)}
            correct={0}
            cols={2}
            requires={['hal-muadala-ula']}
            explain={<MathText>{`${ACTIVITY_LINES.b} أمّا $2x - 3$ فتطرح 3 من ضعف عدد الرجال، و $x - 3 = 2(y - 2)$ تجعل الرجال ضعف النساء.`}</MathText>}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3, title: 'بسّط ثم تحقّق', subtitle: 'ثنائيتان على المعادلتين', done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<MathText>{'المعادلة (2) $2(x - 3) = y - 2$ تُبسَّط إلى:'}</MathText>}
            options={['$2x - y = 4$', '$2x - y = 8$', '$2x + y = 4$', '$2x - y = -4$'].map(Opt)}
            correct={0}
            cols={2}
            requires={['hal-muadala-ula']}
            explain={<MathText>{ACTIVITY_LINES.c}</MathText>}
            onAnswered={() => setQ3a(true)}
          />
          {q3a && (
            <BatchChoiceQuestion
              intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'المعادلتان $x + y = 29$ و $2x - y = 4$ من أجل الثنائيتين — قارن بما قرأته على اللوحتين:'}</MathText></p>}
              rows={[
                { id: 'p11', label: <MathText>{'$x = 11$ و $y = 18$'}</MathText>, options: ['محقّقتان معًا', 'غير محقّقتين معًا'], correct: 0, correction: <MathText>{ACTIVITY_LINES.checkRight}</MathText> },
                { id: 'p20', label: <MathText>{'$x = 20$ و $y = 9$'}</MathText>, options: ['محقّقتان معًا', 'غير محقّقتين معًا'], correct: 1, correction: <MathText>{ACTIVITY_LINES.checkHalf}</MathText> },
              ]}
              requires={['taawid-majhulayn']}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'هذا ما قرأته على اللوحتين.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
              onAnswered={() => setQ3(true)}
            />
          )}
          {q3 && <KnowledgeBrick id="jumla-nashat" lead="ما قبلته اللوحتان معًا، مكتوبًا:" />}
        </div>
      ),
    },
    {
      num: 4, title: 'ماذا تقول الثنائية عن المصلحة؟', subtitle: 'قبل الانتقال أم بعده؟', done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<MathText>{'أضاءت اللوحتان معًا مع الثنائية $(11 ; 18)$ . ماذا تقول هذه الثنائية عن المصلحة؟'}</MathText>}
            options={[
              'قبل الانتقال: 11 رجلًا و 18 امرأة',
              'بعد الانتقال: 11 رجلًا و 18 امرأة',
              'قبل الانتقال: 18 رجلًا و 11 امرأة',
            ]}
            correct={0}
            cols={1}
            requires={['jumla-nashat']}
            explain={<MathText>{ACTIVITY_LINES.d}</MathText>}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5, title: 'حصّالة القسم', subtitle: 'الشرطان نفساهما، بالقطع النقدية', done: q5,
      content: (
        <div className="space-y-3">
          <TextbookBox kind="situation" title="حصّالة القسم" text={COINS.text} source={COINS.source} compact />
          <p className="text-sm text-slate-700"><MathText>{COINS.unknowns}</MathText></p>
          <Manipulation
            type="pair-scoreboard"
            system={COINS.system}
            theme="coins"
            levels={false}
          />
          <PairQuestion
            prompt={<MathText>{'عدد قطع 50 دج ثم عدد قطع 20 دج: الثنائية $(x ; y)$ ='}</MathText>}
            expected={COINS.answer}
            requires={['jumla-nashat']}
            explain="$4 + 5 = 9$ قطع، و $50 \times 4 + 20 \times 5 = 200 + 100 = 300$ دج : الشرطان محقّقان في آن واحد."
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
              <MathText>{'في المصلحة وفي الحصّالة معادلتان بمجهولين، وثنائية واحدة تحقّقهما معًا. المحور التالي يعطي هذا الشكل اسمه، ويقول متى تكون ثنائية حلًّا — ومتى لا يكون للجملة حلّ وحيد.'}</MathText>
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="لوحة الشرطين"
      moduleSubtitle="عددان، وشرطان معًا"
      objectives={['متى تقبل اللوحتان عددين معًا؟', 'كم ثنائية تحقّق شرطًا واحدًا؟ وكم تحقّق الشرطين؟', 'هل يهمّ ترتيب العددين؟']}
      estimatedTime="17 دقيقة"
      intro={
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-pair-m1" rounds={M1_ROUNDS} icon="⚽" freeIcon="🧮"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => (
                  <Manipulation
                    type="pair-scoreboard"
                    level="beginner"
                    system={BEGINNER}
                    theme="football"
                    onTrial={onTrial(BEGINNER)}
                    onCheckpoint={onCheckpoint}
                  />
                ),
                advanced: () => (
                  <Manipulation
                    type="pair-scoreboard"
                    level="advanced"
                    system={ADVANCED}
                    theme="staff"
                    lead={ACTIVITY.lead}
                    onTrial={onTrial(ADVANCED)}
                    onCheckpoint={onCheckpoint}
                  />
                ),
              }}
            />
          )}
        />
      }
      steps={player ? playerSteps : pageSteps}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
