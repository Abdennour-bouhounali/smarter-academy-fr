import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { MethodSteps, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_MODELLING, RACE, FAMILY, AFTER } from '../content/textbook';
import { EX } from '../content/exercises';
import { M2_ROUNDS } from '../content/race';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';
import { HexSquareFigure } from '../components/Figures';

/**
 * Module 2 — طرائق : « ترييض مشكلة », écrite avec les nombres de la plateforme (la famille de la manche 1).
 *   1. la solution, ligne à ligne (أ ب جـ التحقق) ; 2. la brique `tarrid-tariqa` ; 3. une métrajiha (le hexagone et le carré, figure redessinée),
 *   puis `tarrid-mutarajiha` ; 4. la course dont la solution est NÉGATIVE (deux frères : 2x + 24 = 18 ⇔ x = −3) — le lecteur joue la manche
 *   `p1` (la question « ماذا نستنتج؟ » est la suite de la manche) ; 5. la brique `tahaqquq-waqi`, puis une solution à refuser (longueur négative) ;
 *   6. « ورقة شيماء » (`PeerSheet`) : une solution gardée alors que la situation la refuse. LP : P1, P2.
 * Aucune clé de réponse gardée en plus : la ورقة (`peer:m2-shaymaa`) et les étoiles de `lab-race-m2` portent la trace.
 */
const STEP_OPTIONS = ['أ) نسمّي', 'ب) نعبّر', 'جـ) نحلّ', 'التحقق'];
const { father, children, years } = FAMILY;

export default function Module02Tarayiq() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const [won, setWon] = useState({});

  return (
    <ContentModule
      objectives={["كيف نكتب ما فعلناه في السباق بأربع خطوات؟", "متى تترجم المشكلةَ متراجحةٌ لا معادلة؟", "هل يصلح كل حلّ جوابًا عن المشكلة؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="طرائق — ترييض مشكلة"
      moduleSubtitle="نسمّي، نعبّر، نحلّ، نتحقّق"
      estimatedTime="13 دقيقة"
      brief={{
        tag: 'طرائق', title: METHOD_MODELLING.title, tone: 'violet',
        body: <p>في المحور السابق بنيتَ المعادلة بيدك ووجدتَ الحل في السباق. هنا نكتب ذلك في أربع خطوات، ثم نطبّقها على متراجحة.</p>,
      }}
      intro={(
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-race-m2" rounds={M2_ROUNDS} icon="🧒" freeIcon="🏁"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={null}
        />
      )}
      steps={[
        {
          num: 1, title: 'الحلّ سطرًا سطرًا', subtitle: 'اقرأ السطر، وحاول توقّع التالي قبل أن تكشفه', done: read,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tarrid-namdhaja" variant="rappel" compact />
              <MethodSteps method={METHOD_MODELLING} onAllRevealed={() => setRead(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'الطريقة: أربع خطوات', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">إلى أيّ خطوة ينتمي كل سطر؟</p>}
                rows={[
                  { id: 'eq', label: <MathText>{`$${father} + x = ${children.map((c) => `(${c} + x)`).join(' + ')}$`}</MathText>, options: STEP_OPTIONS, correct: 1, correction: <MathText>{'نعبّر عن الوضعية بمعادلة بدلالة $x$ .'}</MathText> },
                  { id: 'sol', label: <MathText>{`$${AFTER.kids - 1}x = ${father - AFTER.constant}$ أي $x = ${years}$`}</MathText>, options: STEP_OPTIONS, correct: 2, correction: 'نحلّ المعادلة التي وجدناها.' },
                  { id: 'chk', label: <MathText>{`$${AFTER.children.join(' + ')} = ${AFTER.sum}$`}</MathText>, options: STEP_OPTIONS, correct: 3, correction: `نعوّض الحل في نص المشكلة: الأعمار بعد ${years} سنوات.` },
                  { id: 'nm', label: 'عدد السنوات التي يكون بعدها عمر الأب هو مجموع أعمار أبنائه', options: STEP_OPTIONS, correct: 0, correction: <MathText>{'نسمّي المجهول: نقول بالكلمات ماذا يمثّل $x$ .'}</MathText> },
                ]}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'تمامًا: نسمّي، نعبّر، نحلّ، ثم نتحقّق في النص نفسه.' : 'لكل سطر ما يميّزه: كلمات تسمّي المجهول، معادلة، حلّ، ثم تعويض في النص.'}
                  </Feedback>
                )}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tarrid-tariqa" lead="الأسطر الأربعة هي خطوات كل ترييض:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'مشكلة تترجمها متراجحة', done: q2,
          content: (
            <div className="space-y-3">
              <HexSquareFigure />
              <TextbookExercise exercise={EX['now-49-2']} requires={['tarrid-tariqa', 'hal-mutarajiha']} onAnswered={() => setQ2(true)} />
              {q2 && <KnowledgeBrick id="tarrid-mutarajiha" lead="ما فعلته في هذا التمرين:" />}
            </div>
          ),
        },
        {
          needsRound: { id: 'p1', label: 'سباق بلا لقاء', icon: '🧒', won: Boolean(won.p1) },
          num: 4, title: 'سباق جديد: هل يلتقي الطرفان؟', subtitle: 'ابنِ النموذج، ثم مدّد x وراقب', done: PlayerDone(won.p1, q3),
          content: (
            <div className="space-y-3">
              <PlayerSwitch
                player={(
                  <p data-evidence="checkpoint" data-tried={won.p1 ? 'true' : 'false'}
                    className={`rounded-xl border-2 px-3 py-2 text-sm ${won.p1 ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                    {won.p1
                      ? <MathText>{'سباقك: $11 + x + 13 + x = 18$ أي $2x + 24 = 18$ و $x = -3$ : كان ذلك منذ 3 سنوات ($8 + 10 = 18$) ولن يحدث بعد اليوم.'}</MathText>
                      : 'اربح جولة «سباق بلا لقاء» لتظهر هنا نتيجة سباقك.'}
                  </p>
                )}
                page={(
                  <>
                    <Manipulation
                      type="growth-race"
                      levels={false}
                      theme="ages"
                      left={RACE.past.left}
                      right={RACE.past.right}
                      goal="equal"
                      title="أخوان عمراهما 11 و 13 سنة: بعد كم سنة يصير مجموع عمريهما 18؟"
                    />
                    <TapQuestion
                      prompt={<span>المعادلة <MathText>{'$11 + x + 13 + x = 18$'}</MathText> حلّها <MathText>{'$x = -3$'}</MathText>. ماذا نستنتج؟</span>}
                      options={[
                        'يكون ذلك بعد 3 سنوات.',
                        'لن يحدث ذلك بعد اليوم: كان مجموع عمريهما 18 منذ 3 سنوات.',
                        'المعادلة خاطئة، لأن الحل لا يكون سالبًا أبدًا.',
                      ]}
                      correct={1}
                      cols={1}
                      requires={['tarrid-tariqa']}
                      explain={<MathText>{'منذ 3 سنوات كان عمراهما 8 و 10: $8 + 10 = 18$ . أما «بعد $x$ سنة» فيتطلّب $x \\geq 0$ : ليس للسؤال حلّ في المستقبل.'}</MathText>}
                      onAnswered={() => setQ3(true)}
                    />
                  </>
                )}
              />
              {PlayerDone(won.p1, q3) && <KnowledgeBrick id="tahaqquq-waqi" lead="قبل أن نكتب الجواب، نسأل: هل يلائم هذا الحل الوضعية؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'هل كل حلّ يصلح جوابًا؟', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>مستطيل طوله <MathText>{'$x + 2$'}</MathText> وعرضه <MathText>{'$x$'}</MathText> (بالسنتيمتر) ومساحته <MathText>{'$15cm^2$'}</MathText>. المعادلة <MathText>{'$x(x + 2) = 15$'}</MathText> تُكتب <MathText>{'$(x + 5)(x - 3) = 0$'}</MathText>. ما عرض المستطيل؟</span>}
                options={[
                  <MathText key="a">{'$x = 3$ أو $x = -5$'}</MathText>,
                  <MathText key="b">{'$x = 3$ فقط'}</MathText>,
                  <MathText key="c">{'$x = -5$'}</MathText>,
                  <MathText key="d">{'$x = 5$'}</MathText>,
                ]}
                correct={1}
                cols={2}
                requires={['jidaa-maadum']}
                explain={<MathText>{'الجداء معدوم: $x = -5$ أو $x = 3$ ، لكن $x$ عرض، فهو موجب: العرض 3cm والطول 5cm ، و $3 \\times 5 = 15$ .'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
        {
          num: 6, title: 'ورقة شيماء', subtitle: 'ابحث عن الخطأ في ورقة زميلة وأصلحه', done: q5,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ5(true)} />,
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}

/** Le lecteur ouvre l'étape par la manche gagnée ; la page, par la réponse de la question. */
function PlayerDone(roundWon, answered) {
  return Boolean(roundWon || answered);
}
