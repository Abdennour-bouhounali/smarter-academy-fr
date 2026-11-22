import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot, useLessonKnowledge } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks, useStudentPlayer } from '../moduleContext';
import { ACTIVITY, HISTORY, HISTORY_NOTE } from '../content/textbook';
import { M1_ROUNDS } from '../content/balances';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 1 — « أوازن الميزان » : « المعادلات من الدرجة الأولى بمجهول واحد », ouvert sur la BALANCE du vestiaire (equation-balance).
 *
 * LABORATOIRE, UN INSTRUMENT — la même opération sur les deux plateaux, jusqu'à ax = b, puis x = b/a. Les nombres sont ceux de la PLATEFORME
 * (rollout 2026-11-11, verdict X1/X2 : plus aucun nombre ni mot du manuel) : 2x + 3 = 11 (مبتدئ), 4x + 3 = −9 (متقدم : poser une baudruche EST ôter 1 ;
 * le sac contient des baudruches). Le programme de calcul est celui de la plateforme : (2x + 5) × 2 − 7 = 4x + 3 — la balance de la manche 2 en est
 * le plateau gauche ; خديجة a obtenu −9, نسيم « 6 fois » son nombre (4x + 3 = 6x : la balance du module 2).
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 1 ; conseil du 2026-11-11, verdict L1) : le labo se joue en MANCHES (content/balances.js ›
 * M1_ROUNDS : 2x + 3 = 11 à la main → 4x + 3 = −9 → 3x − 2 = 10 → défi ⭐ → la balance libre) ; cinq étapes : (1) ce qui arrive si l'on ôte d'UN SEUL côté
 * (après la manche 1) ; (2) d'où vient une équation — le programme, posé À CÔTÉ de chaque question ; (3) le nombre de خديجة (après la manche 2) ; (4) la
 * règle : « أتوقّع القاعدة » + la brique, après la manche 3 ; (5) le nombre de نسيم, qui mène à la balance du module 2. Les lignes « ✓ » viennent des manches
 * GAGNÉES (étoiles gardées, annoncées par LabRounds au montage) : un rechargement ne bloque jamais une étape. Hors lecteur : la page, ses deux niveaux et
 * ses quatre étapes (la liste des étapes écrites sur la balance au-dessus de la question, puis la brique).
 */
const BEGINNER = '2x+3=11';
const ADVANCED = '4x+3=-9';
const { start, end, khadija, khadijaChoice } = ACTIVITY.numbers;
const M = (t) => <MathText key={t}>{t}</MathText>;

export default function Module01Nashat() {
  const player = useStudentPlayer();
  const { learnedItems } = useLessonKnowledge();
  const knowsRule = Boolean((learnedItems ?? [])?.some((i) => i.id === 'muadala-tarafayn'));
  const [trial, setTrial] = useState({ [BEGINNER]: null, [ADVANCED]: null });
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions d'un niveau terminée l'est
  const [cps, setCps] = useState([]);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const answered = cps.some((e) => e.tk === 'checkpoint-done');
  const [won, setWon] = useState({});
  const [p1, setP1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const onTrial = (eq) => (summary) => setTrial((t) => ({ ...t, [eq]: summary }));

  const wonLine = (id, yes, no) => (
    <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won[id] ? 'font-bold text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      {won[id] ? <><span aria-hidden="true">✓ </span><MathText>{yes}</MathText></> : <MathText>{no}</MathText>}
    </p>
  );
  /** Les étapes écrites par l'élève sur la balance (les deux niveaux de la page), et rien d'autre. */
  const evidence = (eqs) => (
    <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
      {eqs.map((eq) => {
        const tr = trial[eq];
        return (
          <li key={eq} data-evidence={eq} data-tried={tr && tr.steps.length ? 'true' : 'false'} className={tr && tr.steps.length ? 'text-slate-800' : 'text-slate-500'}>
            {!tr || tr.steps.length === 0 ? (
              <span>{`لم تكتب أي خطوة على ميزان ${eq === BEGINNER ? 'المستوى المبتدئ' : 'المستوى المتقدّم'} بعد.`}</span>
            ) : (
              <ol className="space-y-1" data-evidence="steps">
                <li className="font-bold"><MathText>{`$${tr.equation}$`}</MathText></li>
                {tr.steps.map((st, i) => (
                  <li key={i} data-evidence-step={i}><MathText>{`أي $${st.result}$`}</MathText></li>
                ))}
                {tr.solved && <li className="font-bold text-emerald-800"><MathText>{tr.verified ? 'تحقّقت بفتح الأكياس.' : 'بقي كيس واحد وحده في كفّة.'}</MathText></li>}
              </ol>
            )}
          </li>
        );
      })}
    </ul>
  );
  /** Le programme de calcul, posé À CÔTÉ de la question qui le lit (lecteur : un seul écran, jamais d'aller-retour). */
  const programme = <TextbookBox kind="example" title={ACTIVITY.text} lines={ACTIVITY.program} source={ACTIVITY.source} compact />;
  const withProgramme = (question) => (player ? <div data-paging-keep className="space-y-3">{programme}{question}</div> : question);

  const q2numeric = (
    <NumericQuestion
      prompt={<MathText>{`اخترنا العدد $${start}$ في البداية. ما نتيجة البرنامج؟`}</MathText>}
      expected={end}
      parse={parseDec}
      requires={['taawid-musawat']}
      explain={<MathText>{`$${start} \\times 2 = 16$ ، ثم $16 + 5 = 21$ ، ثم $21 \\times 2 = 42$ ، ثم $42 - 7 = ${end}$.`}</MathText>}
      onAnswered={() => setQ2a(true)}
    />
  );
  const q2tap = (
    <TapQuestion
      prompt={<MathText>{'اخترنا $x$ في البداية. ما العبارة التي نتحصّل عليها في نهاية البرنامج؟'}</MathText>}
      options={[M('$4x - 4$'), M('$4x + 3$'), M('$4x + 10$'), M('$4x - 2$')]}
      correct={1}
      cols={2}
      requires={['nashr-tabsit']}
      explain={<MathText>{'$(2x + 5) \\times 2 - 7 = 4x + 10 - 7 = 4x + 3$ : العدد 2 الأخير يُضرب في الحدّين معًا. ومن أجل $x = 8$ نجد $4 \\times 8 + 3 = 35$ ، كما في السؤال السابق.'}</MathText>}
      onAnswered={() => setQ2(true)}
    />
  );
  const q3numeric = (
    <NumericQuestion
      prompt={<MathText>{`خديجة اختارت $${khadijaChoice}$ . طبّق عليها برنامج الحساب: ما النتيجة؟`}</MathText>}
      expected={khadija}
      parse={parseDec}
      requires={['muadala-tarafayn']}
      explain={<MathText>{`$(${khadijaChoice}) \\times 2 = -6$ ، ثم $-6 + 5 = -1$ ، ثم $-1 \\times 2 = -2$ ، ثم $-2 - 7 = ${khadija}$ : هي النتيجة التي حصلت عليها خديجة.`}</MathText>}
      onAnswered={() => setQ3(true)}
    />
  );
  const q5tap = (
    <TapQuestion
      prompt={<MathText>{'نسيم حصل على 6 مرّات العدد الذي اختاره. إذا سمّينا $x$ العدد الذي اختاره، فأيّ معادلة يحقّقها؟'}</MathText>}
      options={[M('$4x + 3 = 6$'), M('$4x + 3 = x + 6$'), M('$4x + 3 = 6x$'), M('$6(4x + 3) = x$')]}
      correct={2}
      cols={2}
      requires={['muadala-tarafayn']}
      explain={<MathText>{'نتيجة البرنامج $4x + 3$ ، و 6 مرّات العدد المختار $6x$ : المعادلة $4x + 3 = 6x$. هنا المجهول في الطرفين.'}</MathText>}
      onAnswered={() => setQ4(true)}
    />
  );

  const playerSteps = [
    {
      needsRound: { id: 'r1', label: 'الجولة 1', icon: '⚖️', won: Boolean(won.r1) },
      num: 1, title: 'ماذا لو غيّرتَ كفّة واحدة؟', subtitle: 'من ميزانك في الجولة 1', done: p1,
      content: (
        <div className="space-y-3">
          {wonLine('r1', 'الجولة 1: من $2x + 3 = 11$ وصلتَ إلى $2x = 8$ ثم إلى $x = 4$ .', 'الجولة 1: لم تعرف بعد ما في الكيس الواحد.')}
          <TapQuestion
            prompt={<MathText>{'ماذا يحدث لو أخذتَ الكرات الثلاث من الكفّة اليسرى وحدها؟'}</MathText>}
            options={[M('الكفّة اليمنى تصير أثقل والميزان يميل'), M('يبقى الميزان متوازنًا'), M('الكفّة اليسرى تصير أثقل')]}
            correct={0}
            cols={1}
            requires={['amaliyat-tarafayn']}
            explain={<MathText>{'أخذتَ ثلاث كرات من الكفّة اليسرى فصارت أخفّ، فمالت الكفّة اليمنى. لكي يعود التوازن يجب أن يتغيّر شيء في الكفّة الأخرى.'}</MathText>}
            onAnswered={() => setP1(true)}
          />
        </div>
      ),
    },
    {
      num: 2, title: 'من أين تأتي معادلة؟', subtitle: 'برنامج الحساب', done: q2,
      content: (
        <div className="space-y-3">
          {withProgramme(q2numeric)}
          {q2a && withProgramme(q2tap)}
        </div>
      ),
    },
    {
      needsRound: { id: 'r2', label: 'الجولة 2', icon: '⚖️', won: Boolean(won.r2) },
      num: 3, title: 'عدد خديجة', subtitle: 'من ميزانك في الجولة 2', done: q3,
      content: (
        <div className="space-y-3">
          {wonLine('r2', 'الجولة 2: من $4x + 3 = -9$ وصلتَ إلى $4x = -12$ ثم إلى $x = -3$ .', 'الجولة 2: لم تعرف بعد ما في الكيس الواحد.')}
          <p className="text-sm text-slate-700"><MathText>{`خديجة حصلت على $${khadija}$ : المعادلة $4x + 3 = ${khadija}$ هي ميزان الجولة 2.`}</MathText></p>
          {withProgramme(q3numeric)}
        </div>
      ),
    },
    {
      needsRound: { id: 'r3', label: 'الجولة 3', icon: '⚖️', won: Boolean(won.r3) },
      num: 4, title: 'القاعدة', subtitle: 'من جولاتك الثلاث', done: knowsRule,
      content: (
        <div className="space-y-3">
          {wonLine('r1', 'الجولة 1: أخذتَ كرات من الكفّتين.', 'الجولة 1: لم تلعبها بعد.')}
          {wonLine('r2', 'الجولة 2: وضعتَ بالونات في الكفّتين.', 'الجولة 2: لم تلعبها بعد.')}
          {wonLine('r3', 'الجولة 3: أضفتَ كرات إلى الكفّتين.', 'الجولة 3: لم تلعبها بعد.')}
          <KnowledgeBrick id="muadala-tarafayn" lead="ما فعلته في الجولات الثلاث، مكتوبًا:" />
          {knowsRule && (
            <>
              <TextbookBox kind="remark" title={HISTORY.caption} text={HISTORY.text} source={HISTORY.source} compact />
              <p className="text-xs text-slate-600"><MathText>{HISTORY_NOTE.text}</MathText> <SourceTag source={HISTORY_NOTE.source} /></p>
            </>
          )}
        </div>
      ),
    },
    {
      num: 5, title: 'عدد نسيم', subtitle: 'المجهول في الطرفين', done: q4,
      content: (
        <div className="space-y-3">
          {withProgramme(q5tap)}
          {q4 && (
            <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
              <MathText>{'أكياس في الكفّتين! هذا ميزان المحور التالي.'}</MathText>
            </p>
          )}
        </div>
      ),
    },
  ];

  const pageSteps = [
    {
      num: 1, title: 'لماذا نفعل الشيء نفسه بالكفّتين؟', subtitle: 'من خطواتك على الميزان', done: answered,
      content: (
        <div className="space-y-3">
          {evidence([BEGINNER, ADVANCED])}
          <p data-evidence="checkpoint" data-tried={answered ? 'true' : 'false'}
            className={`rounded-xl border-2 px-3 py-2 text-sm ${answered ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
            {answered
              ? 'أجبتَ على الميزان: ما غيّرتَه في كفّة غيّرتَه في الأخرى بالمقدار نفسه، فبقي الميزان متوازنًا وبقي ما في الكيس كما هو.'
              : 'أنهِ حلّ إحدى المعادلتين على الميزان حتى تقرأ ما في الكيس وتتحقّق منه، ثم أجب عن الأسئلة التي تظهر فوقه.'}
          </p>
          {answered && <KnowledgeBrick id="muadala-tarafayn" lead="ما فعلته بالميزان، مكتوبًا:" />}
        </div>
      ),
    },
    {
      num: 2, title: 'من أين جاءت المعادلة؟', subtitle: 'برنامج الحساب', done: q2,
      content: (
        <div className="space-y-3">
          {programme}
          {q2numeric}
          {q2a && q2tap}
        </div>
      ),
    },
    {
      num: 3, title: 'عدد خديجة', subtitle: 'على الميزان المتقدّم', done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600"><MathText>{`خديجة حصلت على $${khadija}$ : هي المعادلة $4x + 3 = ${khadija}$ ، وهي الميزان الذي في المستوى المتقدّم.`}</MathText></p>
          {evidence([ADVANCED])}
          <TapQuestion
            prompt={<MathText>{'لا توجد كرة في الكفّة اليمنى لتأخذها. ما الذي يعادل «طرح 3 من الطرفين» على هذا الميزان؟'}</MathText>}
            options={[
              M('وضع 3 بالونات في الكفّة اليمنى: البالون يزن $-1$ ، فوضعه يطرح $1$'),
              M('أخذ كيس من كل كفّة'),
              M('وضع 3 كرات في الكفّة اليمنى: الكرة تضيف $1$'),
            ]}
            correct={0}
            cols={1}
            requires={['amaliyat-tarafayn']}
            explain={<MathText>{'طرح 3 يعني إضافة $-3$ ، أي 3 بالونات: $4x + 3 + (-3) = -9 + (-3)$ أي $4x = -12$. أمّا وضع كرات فيضيف إلى الطرفين.'}</MathText>}
            onAnswered={() => setQ3a(true)}
          />
          {q3a && q3numeric}
          {q3 && (
            <>
              <TextbookBox kind="remark" title={HISTORY.caption} text={HISTORY.text} source={HISTORY.source} compact />
              <p className="text-xs text-slate-600"><MathText>{HISTORY_NOTE.text}</MathText> <SourceTag source={HISTORY_NOTE.source} /></p>
            </>
          )}
        </div>
      ),
    },
    {
      num: 4, title: 'عدد نسيم', subtitle: 'المجهول في الطرفين', done: q4,
      content: (
        <div className="space-y-3">
          {q5tap}
          {q4 && (
            <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
              <MathText>{'أكياس في الكفّتين! المحور التالي يعطي هذا الشكل اسمه وحلّه.'}</MathText>
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      objectives={["ماذا نفعل بكفّتي الميزان لنعرف ما في كيس واحد؟", "ما العدد الذي اختارته خديجة؟ وما العدد الذي اختاره نسيم؟", "متى يصعب علينا حلّ المعادلة على الميزان؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="أوازن الميزان"
      moduleSubtitle="المعادلة ميزان متوازن"
      estimatedTime="14 دقيقة"
      intro={
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-balance-m1" rounds={M1_ROUNDS} icon="⚖️" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => (
                  <Manipulation
                    type="equation-balance"
                    level="beginner"
                    eq={BEGINNER}
                    lead="ميزان غرفة ملابس الفريق: كيسان وثلاث كرات في كفّة، و11 كرة في الكفّة الأخرى."
                    onTrial={onTrial(BEGINNER)}
                    onCheckpoint={onCheckpoint}
                  />
                ),
                advanced: () => (
                  <Manipulation
                    type="equation-balance"
                    level="advanced"
                    eq={ADVANCED}
                    title={'ميزان: ⁦4x + 3 = −9⁩'}
                    lead="الكرة تزن 1، والبالون المنفوخ يشدّ الكفّة إلى الأعلى فيزن −1: أربعة أكياس وثلاث كرات في كفّة، و9 بالونات في الكفّة الأخرى."
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
