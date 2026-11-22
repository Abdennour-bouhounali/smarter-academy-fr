import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, PairQuestion } from '../../../../../../common/textbook';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY } from '../content/textbook';
import { M1_ROUNDS } from '../content/cards';

/**
 * Module 1 — « بطاقتان ومجهول يختفي » : résoudre une jumla en faisant DISPARAÎTRE une inconnue, ouvert sur deux CARTES (elimination-cards).
 *
 * LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 2 ; conseil du 2026-11-11, verdict L2) : le labo se joue en MANCHES (content/cards.js ›
 * M1_ROUNDS : une devinette d'إكرام à une méthode → la même paire de cartes de إسحاق par les DEUX méthodes, la règle → une carte « عنيدة » à multiplier,
 * le choix → défi ⭐ → les cartes libres) ; quatre étapes, chacune après SA manche : (1) une carte ne suffit pas (après r1) ; (2) ce que font إكرام et
 * إسحاق sur la même jumla (après r2) → brique takhallus-majhul ; (3) on ne s'arrête pas à x (après r2) → brique hall-thunaiya ; (4) les deux méthodes
 * sur une autre jumla (après r3). Chaque question montre SUR SON ÉCRAN la jumla dont elle parle (jamais d'aller-retour). « Dans le lecteur ? » est
 * décidé AU NIVEAU DU MODULE (`useModulePlayer`). L'énigme du kiosque a quitté ce module : elle répète la مسألة, elle vient après elle (module 5, L2.1).
 * Hors lecteur : la page, ses deux niveaux (x + y = 10 | x − y = 2 ; la jumla de l'activité) et ses cinq étapes. Aucun moins devant une parenthèse (règle P).
 */
const BEGINNER = 'x+y=10|x-y=2';
const ADVANCED = ACTIVITY.systems.main;
const M = (s) => <MathText key={s}>{s}</MathText>;
const YN = ['نعم', 'لا'];
const SYSTEM_TEX = '$\\begin{cases} x + 2y = 15 \\\\ 3x - y = 3 \\end{cases}$';
const SECOND_TEX = '$\\begin{cases} x + 2y = 7 \\\\ 3x + 4y = 11 \\end{cases}$';

export default function Module01Nashat() {
  const player = useModulePlayer(MODULE_CTX);
  const [trial, setTrial] = useState({ [BEGINNER]: null, [ADVANCED]: null });
  const [won, setWon] = useState({});
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5a, setQ5a] = useState(false);
  const [q5, setQ5] = useState(false);
  const onTrial = (sys) => (summary) => setTrial((t) => ({ ...t, [sys]: summary }));
  // la page : les questions posées PAR-DESSUS le labo (LabCheckpoint) ; une étape est faite quand la suite d'une méthode terminée l'est
  const [cps, setCps] = useState([]);
  const onCheckpoint = (sys) => (e) => setCps((l) => [...l, { ...e, sys }]);
  const answeredPair = cps.some((e) => e.tk === 'checkpoint-done');
  const mine = trial[ADVANCED];
  const first = trial[BEGINNER];

  const wonLine = (id, yes, no) => (
    <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won[id] ? 'font-bold text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      {won[id] ? <><span aria-hidden="true">✓ </span><MathText>{yes}</MathText></> : <MathText>{no}</MathText>}
    </p>
  );

  /* ── les blocs partagés par la page et le lecteur ── */
  const sheets = (
    <div className="grid grid-cols-2 gap-2" data-paging-keep>
      <TextbookBox kind="example" title={ACTIVITY.names[1]} lines={ACTIVITY.students[1]} source={ACTIVITY.source} compact />
      <TextbookBox kind="example" title={ACTIVITY.names[2]} lines={ACTIVITY.students[2]} source={ACTIVITY.source} compact />
    </div>
  );
  const explainSheets = (
    <BatchChoiceQuestion
      intro={<p className="text-sm font-semibold text-slate-700"><MathText>{`${ACTIVITY.questions[3]} الجملة: ${SYSTEM_TEX}`}</MathText></p>}
      rows={[
        { id: 's1', label: M('كتبت إكرام $x + 2(3x - 3) = 15$ لأنها'),
          options: [M('عبّرت عن $y$ بدلالة $x$ من المعادلة (2): $y = 3x - 3$ ، ثم عوّضت $y$ في المعادلة (1)'), M('ضربت طرفي المعادلة (1) في 2'), M('عوّضت $y$ بالعبارة $3x - 3$ في المعادلة (2) نفسها')],
          correct: 0,
          correction: M('من $3x - y = 3$ ينتج $y = 3x - 3$ ، وكل $y$ في $x + 2y = 15$ يصير $(3x - 3)$ . أمّا في المعادلة (2) نفسها فيختفي $x$ أيضًا ويبقى $3 = 3$ : لا نتعلّم شيئًا.') },
        { id: 's2', label: 'ضرب إسحاق المعادلة (2) في العدد 2 لأنّ',
          options: [M('معاملي $y$ يصيران $-2y$ و $2y$ ، متعاكسين، فيختفي $y$ بالجمع طرفًا لطرف'), M('معاملي $x$ يصيران متساويين'), M('يكفي أن نضرب الطرف الأول $3x - y$ وحده')],
          correct: 0,
          correction: M('$6x - 2y = 6$ و $x + 2y = 15$ : بالجمع يختفي $y$ ويبقى $7x = 21$ . ويُضرب الطرفان معًا: $3 \\times 2 = 6$ .') },
      ]}
      requires={['naql-hudud', 'darb-tarafayn']}
      feedback={({ allRight }) => (
        <Feedback tone={allRight ? 'ok' : 'ko'}>
          <MathText>{allRight ? 'صحيح: هذا ما كتبه كل منهما.' : 'أعد قراءة السطرين: ماذا صار $y$ عند كل منهما؟'}</MathText>
        </Feedback>
      )}
      onAnswered={() => setQ3(true)}
    />
  );
  const onlyFirst = (
    <div className="space-y-3" data-paging-keep>
      <TextbookBox kind="exercise" text={ACTIVITY.text} source={ACTIVITY.source} compact />
      <BatchChoiceQuestion
        intro={<p className="text-sm font-semibold text-slate-700"><MathText>{ACTIVITY.questions[0]}</MathText></p>}
        rows={[
          { id: 'a1', label: M('$(9 ; 3)$ حل للمعادلة (1) $x + 2y = 15$ ؟'), options: YN, correct: 0, correction: M('$9 + 2 \\times 3 = 15$ : المعادلة (1) محققة.') },
          { id: 'a2', label: 'هل هي حل لجملة المعادلتين؟', options: YN, correct: 1, correction: M('$3 \\times 9 - 3 = 24$ و $24 \\neq 3$ : المعادلة (2) غير محققة، فليست حلا للجملة.') },
        ]}
        requires={['taawid-qima']}
        feedback={({ allRight }) => (
          <Feedback tone={allRight ? 'ok' : 'ko'}>
            <MathText>{'حل الجملة ثنائية تحقق المعادلتين في آن واحد: $(9 ; 3)$ تحقق (1) وحدها.'}</MathText>
          </Feedback>
        )}
        onAnswered={() => setQ1(true)}
      />
    </div>
  );
  const anotherPair = (
    <div className="space-y-3" data-paging-keep>
      <TapQuestion
        prompt={<MathText>{`أيّ ثنائية مما يلي حل للمعادلة (1) $x + 2y = 15$ ؟`}</MathText>}
        options={[M('$(5 ; 5)$'), M('$(5 ; 10)$'), M('$(15 ; 1)$')]}
        correct={0}
        cols={3}
        requires={['taawid-qima']}
        explain={<MathText>{'$5 + 2 \\times 5 = 15$ : $(5 ; 5)$ حل للمعادلة (1). لكنّ $3 \\times 5 - 5 = 10$ و $10 \\neq 3$ : ليست حلا للجملة. أمّا $(5 ; 10)$ فتعطي $25$ ، و $(15 ; 1)$ تعطي $17$ .'}</MathText>}
        onAnswered={() => setQ2(true)}
      />
      {q2 && (
        <p className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
          <MathText>{'للمعادلة (1) وحدها ثنائيات كثيرة: $(15 ; 0)$ ، $(9 ; 3)$ ، $(5 ; 5)$ … وتجريبها واحدة واحدة لا ينتهي. لهذا لا نجرّب: نجعل أحد المجهولين يختفي.'}</MathText>
        </p>
      )}
    </div>
  );
  const twoMethods = (
    <div className="space-y-3">
      <BatchChoiceQuestion
        intro={<p className="text-sm font-semibold text-slate-700"><MathText>{`السطر الأول في كل طريقة، للجملة ${SECOND_TEX}`}</MathText></p>}
        rows={[
          { id: 'c1', label: 'بطريقة التعويض، من المعادلة الأولى:', options: [M('$x = 7 - 2y$'), M('$x = 7 + 2y$'), M('$y = 7 - x$')], correct: 0,
            correction: M('نطرح $2y$ من طرفي $x + 2y = 7$ : $x = 7 - 2y$ . ثم $3(7 - 2y) + 4y = 11$ أي $21 - 2y = 11$ .') },
          { id: 'c2', label: M('بطريقة الجمع، لنتخلّص من $x$ نضرب المعادلة الأولى في'), options: [M('$-3$'), M('$3$'), M('$2$')], correct: 0,
            correction: M('$-3x - 6y = -21$ ، وبالجمع مع $3x + 4y = 11$ : $-2y = -10$ . بالعدد 3 يصير المعاملان $3x$ و $3x$ : متساويين، لا متعاكسين.') },
        ]}
        requires={['takhallus-majhul']}
        feedback={({ allRight }) => (
          <Feedback tone={allRight ? 'ok' : 'ko'}>
            <MathText>{allRight ? 'الطريقتان تعطيان $y = 5$ .' : 'في التعويض ننقل الحدّ بتغيير إشارته؛ وفي الجمع نريد معاملين متعاكسين.'}</MathText>
          </Feedback>
        )}
        onAnswered={() => setQ5a(true)}
      />
      {q5a && (
        <PairQuestion
          prompt={<MathText>{`حل الجملة ${SECOND_TEX} :`}</MathText>}
          expected={{ x: '-3', y: '5' }}
          requires={['takhallus-majhul', 'hall-thunaiya']}
          explain={'$y = 5$ ، ثم $x = 7 - 2 \\times 5 = -3$ . للتحقق: $-3 + 2 \\times 5 = 7$ و $3 \\times (-3) + 4 \\times 5 = 11$ . الحل $(-3 ; 5)$ .'}
          onAnswered={() => setQ5(true)}
        />
      )}
    </div>
  );

  const playerSteps = [
    {
      needsRound: { id: 'r1', label: 'الجولة 1', icon: '🃏', won: Boolean(won.r1) },
      num: 1, title: 'هل تكفي بطاقة واحدة؟', subtitle: 'من بطاقتيك في الجولة 1', done: q1 && q2,
      content: (
        <div className="space-y-3">
          {wonLine('r1', 'الجولة 1: وجدتَ العددين $(5 ; 3)$ اللذين يجعلان البطاقتين صحيحتين معًا.', 'الجولة 1: لم تجد العددين بعد.')}
          {onlyFirst}
          {q1 && anotherPair}
        </div>
      ),
    },
    {
      needsRound: { id: 'r2', label: 'الجولة 2', icon: '🃏', won: Boolean(won.r2) },
      num: 2, title: 'إكرام وإسحاق', subtitle: 'طريقتان على الجملة نفسها', done: q3,
      content: (
        <div className="space-y-3">
          {wonLine('r2', 'الجولة 2: وصلتَ إلى العددين نفسيهما بطريقتين.', 'الجولة 2: لم تجرّب الطريقتين بعد.')}
          {sheets}
          {explainSheets}
          {q3 && <KnowledgeBrick id="takhallus-majhul" lead="ما فعلته إكرام وما فعله إسحاق، وما فعلته بالبطاقتين:" />}
        </div>
      ),
    },
    {
      needsRound: { id: 'r2', label: 'الجولة 2', icon: '🃏', won: Boolean(won.r2) },
      num: 3, title: 'لماذا لا نتوقّف عند المجهول الأوّل؟', subtitle: 'الحل ثنائية', done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<MathText>{`وجدت إكرام $x = 3$ في الجملة ${SYSTEM_TEX} . ماذا بقي؟`}</MathText>}
            options={[M('نعوّض $x = 3$ في إحدى المعادلتين لنجد $y$ : الحل ثنائية'), M('لا شيء: $x = 3$ هو حل الجملة'), M('نعيد الحساب بالطريقة الأخرى لنجد $x$ مرّة ثانية')]}
            correct={0}
            cols={1}
            requires={['taawid-qima']}
            explain={<MathText>{'$3 + 2y = 15$ أي $y = 6$ : حل الجملة الثنائية $(3 ; 6)$ ، ونتحقّق منها في المعادلتين: $3 + 12 = 15$ و $9 - 6 = 3$ .'}</MathText>}
            onAnswered={() => setQ4(true)}
          />
          {q4 && <KnowledgeBrick id="hall-thunaiya" lead="لا نتوقّف عند المجهول الأوّل:" />}
        </div>
      ),
    },
    {
      needsRound: { id: 'r3', label: 'الجولة 3', icon: '🃏', won: Boolean(won.r3) },
      num: 4, title: 'الطريقتان على جملة أخرى', subtitle: 'من بطاقتيك في الجولة 3', done: q5,
      content: (
        <div className="space-y-3">
          {wonLine('r3', 'الجولة 3: ضربتَ بطاقة في عدد حتى اختفى مجهول.', 'الجولة 3: لم تلعبها بعد.')}
          {twoMethods}
        </div>
      ),
    },
  ];

  const pageSteps = [
    {
      num: 1, title: 'لماذا كتب كل منهما سطره؟', subtitle: 'بعد أن جرّبت البطاقتين', done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800"><MathText>{`${ACTIVITY.questions[2]} ${SYSTEM_TEX}`}</MathText></p>
          {sheets}
          {/* CE QUE L'ÉLÈVE A ÉCRIT dans les cartes (niveau متقدم), et rien d'autre. */}
          <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={mine ? 'true' : 'false'}>
            {mine && mine.attempts.length > 0 ? (
              <ul className="space-y-2" data-evidence="attempts">
                {mine.attempts.map((a, i) => (
                  <li key={i} data-evidence-method={a.method}>
                    <p className="font-bold text-slate-700">{a.method === 'sub' ? 'بالتعويض (مثل إكرام)' : 'بالجمع (مثل إسحاق)'}</p>
                  </li>
                ))}
                <li className="space-y-0.5 border-t border-slate-100 pt-1">
                  <p className="text-xs text-slate-500">آخر ما كتبته:</p>
                  {mine.lines.map((l, i) => <p key={i} dir="ltr" className="text-start"><MathText>{`$${l}$`}</MathText></p>)}
                </li>
              </ul>
            ) : first ? (
              <p className="text-slate-600">حللتَ بطاقتَي المستوى المبتدئ{first.pairTex ? <> وبلغتَ <MathText>{`$${first.pairTex}$`}</MathText></> : null}. افتح المستوى المتقدّم لتجرّب الطريقتين على جملة إكرام وإسحاق.</p>
            ) : (
              <p className="text-slate-500">لم تحلّ البطاقتين بعد: جرّبهما في المناولة أعلاه.</p>
            )}
          </div>
          {explainSheets}
          {q3 && <KnowledgeBrick id="takhallus-majhul" lead="ما فعلته إكرام وما فعله إسحاق، وما فعلته بالبطاقتين:" />}
        </div>
      ),
    },
    {
      num: 2, title: 'لماذا لا نتوقّف عند المجهول الأوّل؟', subtitle: 'ونستنتج حل الجملة', done: answeredPair,
      content: (
        <div className="space-y-3">
          <p data-evidence="checkpoint" data-tried={answeredPair ? 'true' : 'false'}
            className={`rounded-xl border-2 px-3 py-2 text-sm ${answeredPair ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
            {answeredPair
              ? <span>أجبتَ في المختبر: بعد إيجاد مجهول واحد عوّضتَه في إحدى البطاقتين لتجد الآخر{(mine ?? first)?.pairTex ? <>، فكان الحل ثنائية <MathText>{`$${(mine ?? first).pairTex}$`}</MathText></> : null} تحقق البطاقتين معًا، لا قيمة واحدة.</span>
              : 'أنهِ إحدى الطريقتين في المختبر (ثنائية الحل)، ثم أجب عن الأسئلة التي تظهر فوقه.'}
          </p>
          {answeredPair && <KnowledgeBrick id="hall-thunaiya" lead="لا نتوقّف عند المجهول الأوّل:" />}
        </div>
      ),
    },
    { num: 3, title: 'هل تكفي معادلة واحدة؟', subtitle: 'ثنائية تحقق (1)', done: q1, content: onlyFirst },
    { num: 4, title: 'ثنائية أخرى للمعادلة (1)', done: q2, content: anotherPair },
    { num: 5, title: 'الطريقتان على جملة أخرى', done: q5, content: twoMethods },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="بطاقتان ومجهول يختفي"
      moduleSubtitle="نجعل مجهولًا يختفي"
      objectives={['كيف نجد عددين مجهولين من بطاقتين فقط؟', 'ماذا يفعل كل من إكرام وإسحاق ليصل إلى مجهول واحد؟', 'هل تكفي معادلة واحدة لمعرفة العددين؟']}
      estimatedTime="16 دقيقة"
      intro={
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-cards-m1" rounds={M1_ROUNDS} icon="🃏" freeIcon="🗂️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            // LE LABO OUVRE LE MODULE (§4quater) : ni titre ni carte au-dessus ; le contexte tient dans le `lead` de chaque niveau.
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => (
                  <Manipulation
                    type="elimination-cards"
                    level="beginner"
                    system={BEGINNER}
                    lead="بطاقتان على الطاولة عن عددين مخفيّين: مجموعهما 10 وفرقهما 2."
                    onTrial={onTrial(BEGINNER)}
                    onCheckpoint={onCheckpoint(BEGINNER)}
                  />
                ),
                advanced: () => (
                  <Manipulation
                    type="elimination-cards"
                    level="advanced"
                    system={ADVANCED}
                    lead="بطاقتا إكرام وإسحاق: كل بطاقة وحدها تقبل أعدادًا كثيرة، والبطاقتان معًا تحدّدان العددين."
                    onTrial={onTrial(ADVANCED)}
                    onCheckpoint={onCheckpoint(ADVANCED)}
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
