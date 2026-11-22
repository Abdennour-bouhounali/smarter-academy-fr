import { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { stepTemplate } from '../../../../../../common/problems/guidedProblem';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_MODELLING, RACE, MISTAKE_ONE_X, FAMILY, AFTER } from '../content/textbook';
import { M1_ROUNDS } from '../content/race';

/**
 * Module 1 — l'entrée dans la طريقة « ترييض مشكلة » par la course des âges (labo `growth-race`).
 *
 * Le labo est une expérience de la PLATEFORME (déclarée `platform_adaptation`) : sa mathématique est la طريقة. LA PAGE (enseignant, mode classe) :
 *   مبتدئ  — un père de 26 ans et son fils de 2 ans, « أربعة أضعاف » : deux cartes, un groupe « 4 × » ; la rencontre à 6 ans.
 *   متقدم  — le père de 52 ans et ses QUATRE enfants (7, 8, 10, 12) : quatre cartes « + x » à poser, un enfant oublié est refusé par « تحقّق ».
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 4 ; conseil du 2026-11-11) : le labo se joue en MANCHES (content/race.js › M1_ROUNDS :
 * quatre enfants, quatre fois l'âge, un nombre qui ne vieillit pas, le défi ⭐, la ورشة libre). L'étape 1 attend la manche 1, l'étape 2 la manche 2 ;
 * ce que dit leur ligne de trace vient des manches GAGNÉES (étoiles gardées, annoncées par LabRounds au montage) : un rechargement ne vide jamais
 * une étape. Aucune clé de réponse gardée en plus. Les nombres de l'étape 3 sont ceux de la manche 1 (la famille ne change pas d'écran).
 * UNE PISTE : labo en tête, puis (1) POURQUOI chaque enfant porte son « + x » ; (2) جـ) la solution, PUIS la brique `tarrid-namdhaja` ; (3) التحقق.
 * LP : P1, P2.
 */
const { father, children, years } = FAMILY;

export default function Module01Sibaq() {
  const [model, setModel] = useState(null);
  const [trials, setTrials] = useState([]);
  const [cps, setCps] = useState([]);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const answeredBuild = cps.some((e) => e.tk === 'checkpoint-done' && e.id === 'build');
  const [q2, setQ2] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3, setQ3] = useState(false);
  // lecteur : les manches gagnées ouvrent les étapes
  const [won, setWon] = useState({});
  const addTrial = (tr) => setTrials((ts) => (ts.some((u) => u.x === tr.x) ? ts : [...ts, tr]));

  const evidence = (
    <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
      <li className={model ? 'font-bold text-slate-800' : 'text-slate-500'} data-evidence="model" data-tried={model ? 'true' : 'false'}>
        {model ? <MathText>{`نموذجك (المستوى المتقدّم): $${model}$`}</MathText> : 'لم تتحقّق بعد من نموذج الأبناء الأربعة (المستوى المتقدّم).'}
      </li>
      <li className={trials.length ? 'text-slate-800' : 'text-slate-500'} data-evidence="trials" data-tried={trials.length ? 'true' : 'false'}>
        {trials.length
          ? <span>محاولاتك في السباق: <span dir="ltr" className="font-mono">{trials.map((tr) => `x = ${tr.x} : ${tr.leftText} ${tr.rel} ${tr.rightText}`).join(' ؛ ')}</span></span>
          : 'لم تسجّل بعد أي محاولة في السباق.'}
      </li>
    </ul>
  );
  const wonLine = (ok, text, empty) => (
    <p className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}
      data-evidence="checkpoint" data-tried={ok ? 'true' : 'false'}>
      {ok ? <><span aria-hidden="true">✓ </span><MathText>{text}</MathText></> : empty}
    </p>
  );
  const AFTER_TEXT = `الأب $${father}$ سنة والأبناء $${children.join('$ و $')}$ . بعد ${years} سنوات:`;

  return (
    <ContentModule
      objectives={["من يكبر مع الزمن في هذه العائلة؟ وماذا يحمل كل واحد منهم؟", "متى يتساوى عمر الأب مع مجموع أعمار أبنائه؟", "هل يلائم العدد الذي وجدناه نصّ المشكلة؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="سباق الأعمار — من النص إلى المعادلة"
      moduleSubtitle="من يحمل x؟"
      estimatedTime="13 دقيقة"
      intro={(
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-race-m1" rounds={M1_ROUNDS} icon="🧒" freeIcon="🏁"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => (
                  <Manipulation
                    type="growth-race"
                    level="beginner"
                    theme="ages"
                    left={RACE.beginner.left}
                    right={RACE.beginner.right}
                    goal="equal"
                    title="أب عمره 26 سنة وابنه سنتان"
                    mission="بعد كم سنة يكون عمر الأب أربعة أضعاف عمر الابن؟ ضع البطاقة «+ x» على كل من يكبر، ثم تحقّق من النموذج."
                  />
                ),
                advanced: () => (
                  <Manipulation
                    type="growth-race"
                    theme="ages"
                    left={RACE.advanced.left}
                    right={RACE.advanced.right}
                    goal="equal"
                    title={`أب عمره ${father} سنة وأبناؤه ${children.join(' و ')}`}
                    lead={`عمر الأب ${father} سنة وأعمار أبنائه الأربعة ${children.join(' و ')}: ضع البطاقة «+ x» على كل من يكبر، ثم تحقّق من نموذجك.`}
                    onModel={({ tex }) => setModel(tex)}
                    onTrial={addTrial}
                    onCheckpoint={onCheckpoint}
                  />
                ),
              }}
            />
          )}
        />
      )}
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '🧒', won: Boolean(won.r1) },
          num: 1, title: 'لماذا يحمل كل ابن «+ x» وحده؟', subtitle: 'ابنِ النموذج، ثم أجب', done: PlayerSwitchDone(won.r1, answeredBuild),
          content: (
            <div className="space-y-3">
              <PlayerSwitch
                player={wonLine(Boolean(won.r1), `سباقك: $${father} + x = ${AFTER.kids}x + ${AFTER.constant}$ ، والتقى الطرفان عند $x = ${years}$ .`, 'اربح الجولة 1 لتظهر هنا نتيجة سباقك.')}
                page={(
                  <>
                    {evidence}
                    {wonLine(answeredBuild, 'أجبتَ في المختبر: كل ابن يكبر بنفسه، لذلك يحمل كل ابن «+ x» وحده ويزيد مجموع أعمار الأبناء أربع مرّات x.', 'تحقّق من نموذج الأبناء الأربعة في المستوى المتقدّم، ثم أجب عن الأسئلة التي تظهر فوق المختبر.')}
                  </>
                )}
              />
              {(won.r1 || answeredBuild) && <span className="block space-y-1 text-sm"><MathText>{MISTAKE_ONE_X.why}</MathText><MathText>{MISTAKE_ONE_X.right}</MathText></span>}
            </div>
          ),
        },
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '🧒', won: Boolean(won.r2) },
          num: 2, title: 'جـ) بعد كم سنة؟', subtitle: 'السباق يعطيك الجواب: تحقّق منه بالحساب', done: q2b || q2,
          content: (
            <div className="space-y-3">
              <PlayerSwitch
                player={(
                  <>
                    {wonLine(Boolean(won.r2), 'سباقك: $26 + x = 4x + 8$ ، وأوقفك السباق عند $x = 6$ .', 'اربح الجولة 2 لتظهر هنا نتيجة سباقك.')}
                    <NumericQuestion
                      prompt={<span>المعادلة <MathText>{'$26 + x = 4x + 8$'}</MathText> . انقل حدود $x$ إلى طرف والأعداد إلى الآخر:</span>}
                      template={stepTemplate({ shape: 'gap', subject: '3x =' })}
                      expected={18}
                      requires={['hal-muadala']}
                      explain={<MathText>{'$26 - 8 = 4x - x$ أي $3x = 18$ .'}</MathText>}
                      onAnswered={() => setQ2(true)}
                    />
                    {q2 && (
                      <NumericQuestion
                        prompt={<span>من <MathText>{'$3x = 18$'}</MathText> :</span>}
                        template={stepTemplate({ shape: 'gap', subject: 'x =' })}
                        expected={6}
                        requires={['hal-muadala']}
                        explain={<MathText>{'$x = 18 \\div 3 = 6$ : بعد 6 سنوات.'}</MathText>}
                        onAnswered={() => setQ2b(true)}
                      />
                    )}
                  </>
                )}
                page={(
                  <>
                    {evidence}
                    <NumericQuestion
                      prompt={<span>المعادلة تُكتب <MathText>{`$${father} + x = ${AFTER.kids}x + ${AFTER.constant}$`}</MathText>. بعد كم سنة يكون عمر الأب مساويًا مجموع أعمار أبنائه؟</span>}
                      expected={years}
                      requires={['hal-muadala']}
                      explain={<MathText>{`$${father} - ${AFTER.constant} = ${AFTER.kids}x - x$ أي $${AFTER.kids - 1}x = ${father - AFTER.constant}$ ومنه $x = ${years}$ : بعد ${years} سنوات.`}</MathText>}
                      onAnswered={() => { setQ2(true); setQ2b(true); }}
                    />
                  </>
                )}
              />
              {q2b && <KnowledgeBrick id="tarrid-namdhaja" lead="ما فعلته بالبطاقات هو الخطوة «ب)» من طريقة ترييض مشكلة:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'التحقق: هل يلائم الحلّ نصّ المشكلة؟', subtitle: 'نعوّض الحل في نص المشكلة', done: q3,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{AFTER_TEXT}</MathText></p>}
                rows={[
                  { id: 'father', label: 'عمر الأب', options: [`${AFTER.father} سنة`, `${father} سنة`, `${AFTER.father + 5} سنة`], correct: 0, correction: <MathText>{`$${father} + ${years} = ${AFTER.father}$`}</MathText> },
                  { id: 'kids', label: 'أعمار الأبناء', options: [AFTER.children.join(' و '), `${children.slice(0, 3).join(' و ')} و ${AFTER.children[3]}`, `${AFTER.children.slice(0, 2).join(' و ')} و ${children.slice(2).join(' و ')}`], correct: 0, correction: `كل ابن يكبر بـ ${years} سنوات.` },
                  { id: 'sum', label: 'مجموع أعمار الأبناء', options: [<MathText key="a">{`$${AFTER.children.join(' + ')} = ${AFTER.sum}$`}</MathText>, <MathText key="b">{`$${children.join(' + ')} + ${years} = ${AFTER.constant + years}$`}</MathText>, <MathText key="c">{`$${AFTER.children.join(' + ')} = ${AFTER.sum + 5}$`}</MathText>], correct: 0, correction: <MathText>{METHOD_MODELLING.solution[3]}</MathText> },
                ]}
                requires={['tarrid-namdhaja']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? `تمامًا: $${AFTER.father} = ${AFTER.children.join(' + ')}$ ، فالعدد ${years} يحقّق نص المشكلة نفسه، لا المعادلة فقط.`
                      : `بعد ${years} سنوات يكبر كل واحد بـ ${years} سنوات: الأب ${AFTER.father}، والأبناء ${AFTER.children.join(' و ')}.`}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}

/** L'étape 1 est faite quand la manche 1 est gagnée (lecteur) ou que la suite « build » de la page est finie. */
function PlayerSwitchDone(roundWon, pageDone) {
  return Boolean(roundWon || pageDone);
}
