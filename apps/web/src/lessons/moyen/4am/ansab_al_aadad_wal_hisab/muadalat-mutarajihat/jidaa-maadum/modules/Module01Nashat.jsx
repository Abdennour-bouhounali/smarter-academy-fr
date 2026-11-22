import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_A, NOTEBOOKS } from '../content/textbook';
import { M1_ROUNDS } from '../content/pitch';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';

/**
 * Module 1 — « خاصية الجداء المعدوم », ouvert sur le monde de l'unité 3 : le terrain de football dont les deux CÔTÉS sont les deux FACTEURS
 * (vanishing-pitch). Nombres de la plateforme (rollout 2026-11-11, verdict L2) : 2(x − 3) (un côté constant), (x − 1)(x + 4), puis — lecteur —
 * 2x(x + 2).
 *
 * LABORATOIRE À DEUX NIVEAUX, UN INSTRUMENT (page) — même objectif : A × B = 0 ⇔ A = 0 أو B = 0.
 *   مبتدئ : 2(x − 3) — le côté 2 ne s'écrase JAMAIS, une solution ; متقدم : (x − 1)(x + 4), deux côtés qui bougent, deux solutions.
 * AUCUNE étape n'attend `onFinished` : `onTrial` liste, au-dessus des questions, les épingles et les refus de l'élève (`[data-activity-evidence]`).
 *
 * Étapes : (1) ce que les valeurs épinglées ont en commun, puis la brique khassiya-jidaa-maadum ; (2) le produit en nombres ; (3) les cahiers de
 * حاتم et بسّام ; (4) -1,5(2x + 5) = 0 des deux façons ; (5) (x − 1)(x + 4) = 0 : le نشر échoue, la propriété réussit ; (6) LECTEUR seulement :
 * pourquoi 0 est solution de 2x(x + 2) = 0 alors que 2 ne s'annule pas.
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 2 ; conseil du 2026-11-11, verdict L2) : le labo se joue en MANCHES (content/pitch.js ›
 * M1_ROUNDS : 2(x − 3) → (x − 1)(x + 4) → 2x(x + 2) → la ورشة libre) au lieu de مبتدئ / متقدم. L'étape 1 attend la manche 2, l'étape 6 la manche 3.
 * Ce que la ligne de trace dit vient des manches GAGNÉES (étoiles gardées) : un rechargement ne bloque ni ne vide jamais une étape.
 * Hors lecteur : la page inchangée.
 */
const { beginner: BEGINNER, advanced: ADVANCED } = ACTIVITY.numbers;
const LABEL = { [BEGINNER]: '2(x - 3)', [ADVANCED]: '(x - 1)(x + 4)' };
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Nashat() {
  const player = useModulePlayer(MODULE_CTX);
  const [trials, setTrials] = useState({ [BEGINNER]: [], [ADVANCED]: [] });
  const [won, setWon] = useState({});
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions d'un niveau terminée l'est
  const [cps, setCps] = useState([]);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const answered = cps.some((e) => e.tk === 'checkpoint-done');
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5a, setQ5a] = useState(false);
  const [q5, setQ5] = useState(false);
  const [q6, setQ6] = useState(false);

  const onTrial = (expr) => (tr) => { if (tr?.xTex) setTrials((all) => ({ ...all, [expr]: [...all[expr].filter((u) => u.x !== tr.x), tr] })); };
  const wonLine = (id, yes, no) => (
    <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won[id] ? 'font-bold text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      {won[id] ? <><span aria-hidden="true">✓ </span><MathText>{yes}</MathText></> : <MathText>{no}</MathText>}
    </p>
  );

  const evidence = (exprs) => (
    <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
      {exprs.map((expr) => (
        <li key={expr} data-evidence={expr} data-tried={trials[expr].length ? 'true' : 'false'} className={trials[expr].length ? 'text-slate-800' : 'text-slate-500'}>
          <MathText>{`الملعب $${LABEL[expr]}$ :`}</MathText>{' '}
          {trials[expr].length === 0
            ? 'لم تثبّت أي قيمة بعد.'
            : (
              <span className="inline-flex flex-wrap gap-1.5" dir="ltr">
                {trials[expr].map((tr) => (
                  <span key={tr.x} data-trial-ok={tr.ok ? 'true' : 'false'} className={`rounded-lg px-2 py-0.5 text-xs font-bold ${tr.ok ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                    <MathText>{`$x = ${tr.xTex}$ : $${tr.areaTex}$ ${tr.ok ? '✓' : '✗'}`}</MathText>
                  </span>
                ))}
              </span>
            )}
        </li>
      ))}
    </ul>
  );

  return (
    <ContentModule
      objectives={["متى تنعدم مساحة ملعب ضلعاه x − 1 و x + 4؟", "هل ينفعنا نشر الجداء عندما يتغيّر الضلعان معًا؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="أكتشف — خاصية الجداء المعدوم"
      moduleSubtitle="متى ينعدم جداء عاملين؟"
      estimatedTime="13 دقيقة"
      intro={
        // Lecteur : les MANCHES (content/pitch.js) ; la page garde ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-vanish-m1" rounds={M1_ROUNDS} icon="⚽" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => (
                  <Manipulation
                    type="vanishing-pitch"
                    level="beginner"
                    expr={BEGINNER}
                    title={'ملعب ضلعاه ⁦2⁩ و ⁦x − 3⁩'}
                    lead={<MathText>{'يرسم مدرّب الحيّ ملعب تدريب ضلعه A طوله $2$ دائمًا وضلعه B طوله $x - 3$ ، ومساحته جداء الضلعين.'}</MathText>}
                    onTrial={onTrial(BEGINNER)}
                    onCheckpoint={onCheckpoint}
                  />
                ),
                advanced: () => (
                  <Manipulation
                    type="vanishing-pitch"
                    level="advanced"
                    expr={ADVANCED}
                    title={'ملعب ضلعاه ⁦x − 1⁩ و ⁦x + 4⁩'}
                    lead="ملعب آخر في الحيّ: الضلعان يتغيّران معًا مع x، ومساحته جداؤهما."
                    onTrial={onTrial(ADVANCED)}
                    onCheckpoint={onCheckpoint}
                  />
                ),
              }}
            />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '⚽', won: Boolean(won.r2) },
          num: 1, title: 'ما الذي يجمع بين القيم التي ثبّتّها؟', subtitle: player ? 'من ملعبيك في الجولتين 1 و 2' : 'من تجربتك', done: player ? Boolean(won.r2) : answered,
          content: player ? (
            <div className="space-y-3">
              {wonLine('r1', 'الجولة 1: الملعب $2(x - 3)$ اختفى عند قيمة واحدة، وضلعه $2$ لم يتغيّر.', 'الجولة 1: لم تثبّت بعد قيمة الملعب $2(x - 3)$ .')}
              {wonLine('r2', 'الجولة 2: الملعب $(x - 1)(x + 4)$ اختفى عند قيمتين، كلّما انعدم أحد ضلعيه ولو بقي الآخر غير معدوم.', 'الجولة 2: لم تثبّت بعد قيم الملعب $(x - 1)(x + 4)$ .')}
              {won.r2 && <KnowledgeBrick id="khassiya-jidaa-maadum" lead="ما رأيته في الملعب نسمّيه:" />}
            </div>
          ) : (
            <div className="space-y-3">
              {/* LES ESSAIS DE L'ÉLÈVE, et rien d'autre. */}
              {evidence([BEGINNER, ADVANCED])}
              <p data-evidence="checkpoint" data-tried={answered ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered
                  ? 'أجبتَ في المختبر: الملعب يختفي كلّما انعدم أحد ضلعيه، ولو بقي الآخر غير معدوم — في كل القيم التي ثبّتّها.'
                  : 'ثبّت قيم x التي يختفي عندها الملعب، وجرّب قيمة ترفضها المساحة، ثم أجب عن الأسئلة التي تظهر فوق المختبر.'}
              </p>
              {answered && <KnowledgeBrick id="khassiya-jidaa-maadum" lead="ما رأيته في الملعب نسمّيه:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الجداء المعدوم في الأعداد', subtitle: 'انقل وأكمل', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">الجداء المعدوم: أكمل كلًّا مما يلي ليصير الجداء $0$ ، ثم أجب عن السؤال الذي يليه.</p>}
                rows={ACTIVITY_A.products.map(({ shown, missing, wrong }, i) => {
                  const label = missing === 'right' ? `$${shown} \\times \\ldots = 0$` : `$\\ldots \\times ${shown} = 0$`;
                  return {
                    id: `p${i}`, label: M(label),
                    options: [M('$1$'), M('$0$'), M(`$${wrong}$`)],
                    correct: 1,
                    correction: M(missing === 'right' ? `$${shown} \\times 0 = 0$ : العدد $${shown}$ ليس معدومًا، فالعامل الآخر هو الذي ينعدم.` : `$0 \\times ${shown} = 0$ : العدد $${shown}$ ليس معدومًا، فالعامل الآخر هو الذي ينعدم.`),
                  };
                })}
                requires={['darb-nisbiya']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'في كل مرّة أحد العاملين معلوم وغير معدوم: الجداء لا ينعدم إلا إذا كان العامل الآخر $0$.'
                      : 'جداء عدد غير معدوم في $1$ أو في عدده المعاكس ليس $0$ : جرّب كل اقتراح بالحساب.'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <TapQuestion
                  prompt={<MathText>{'عددان $a$ و $b$ جداؤهما $a \\times b = 0$ . إذن:'}</MathText>}
                  options={[M('$a = 0$ و $b = 0$ معًا'), M('$a = 0$ أو $b = 0$'), M('$a = 1$ أو $b = 1$')]}
                  correct={1}
                  cols={1}
                  requires={['darb-nisbiya']}
                  explain={<MathText>{'يكفي أن يكون أحد العددين معدومًا: $0 \\times 5 = 0$ و $5 \\neq 0$. إذن $a = 0$ أو $b = 0$ ، وقد يكونان معدومين معًا.'}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'كرّاسا حاتم وبسّام', subtitle: 'المعادلة $2(x - 3) = 0$', done: q3,
          content: (
            <div className="space-y-3">
              <div className="grid gap-2 grid-cols-2">
                <TextbookBox kind="example" title="كرّاس حاتم" lines={ACTIVITY.hatim} source={ACTIVITY.source} compact />
                <TextbookBox kind="example" title="كرّاس بسّام" lines={ACTIVITY.bassam} source={ACTIVITY.source} compact />
              </div>
              <TapQuestion
                prompt={<MathText>{'لحلّ المعادلة $2(x - 3) = 0$ : أيّهما استعمل خاصية الجداء المعدوم؟'}</MathText>}
                options={['حاتم', 'بسّام', 'كلاهما']}
                correct={1}
                cols={3}
                requires={['khassiya-jidaa-maadum']}
                explain={<MathText>{`${NOTEBOOKS.bassamMethod} ${NOTEBOOKS.hatimMethod}`}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'بالطريقتين', subtitle: 'المعادلة $-1{,}5(2x + 5) = 0$', done: q4,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'حل المعادلة $-1{,}5(2x + 5) = 0$ بطريقة حاتم ثم بطريقة بسّام.'}</MathText></p>}
              rows={[
                { id: 'e', label: 'بطريقة حاتم، ننشر:', options: [M('$-3x + 7{,}5 = 0$'), M('$-3x - 7{,}5 = 0$'), M('$3x - 7{,}5 = 0$')], correct: 1,
                  correction: M('$-1{,}5 \\times 2x = -3x$ و $-1{,}5 \\times 5 = -7{,}5$ ، ثم $-3x = 7{,}5$ أي $x = \\dfrac{7{,}5}{-3} = -2{,}5$ .') },
                { id: 'a', label: 'بطريقة بسّام:', options: [M('$2x + 5 = 0$ لأنّ $-1{,}5 \\neq 0$'), M('$2x = 5$'), M('$x = -1{,}5$')], correct: 0,
                  correction: M('بما أنّ $-1{,}5 \\neq 0$ فإنّ $2x + 5 = 0$ ، أي $2x = -5$ و $x = -2{,}5$ .') },
                { id: 's', label: 'الحل في الطريقتين:', options: [M('$2{,}5$'), M('$-1{,}5$'), M('$-2{,}5$')], correct: 2,
                  correction: M('التحقّق: $2 \\times (-2{,}5) + 5 = 0$ ، إذن $-1{,}5 \\times 0 = 0$ .') },
              ]}
              requires={['khassiya-jidaa-maadum', 'hal-muadala-ula']}
              feedback={({ allRight }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  <MathText>{allRight
                    ? 'الطريقتان تعطيان $-2{,}5$ ، وطريقة بسّام أقصر: العامل $-1{,}5$ لا ينعدم.'
                    : 'العامل $-1{,}5$ ثابت غير معدوم: العامل الآخر $2x + 5$ هو الذي ينعدم.'}</MathText>
                </Feedback>
              )}
              onAnswered={() => setQ4(true)}
            />
          ),
        },
        {
          num: 5, title: 'معادلة بعاملين يتغيّران', subtitle: 'المعادلة $(x - 1)(x + 4) = 0$', done: q5,
          content: (
            <div className="space-y-3">
              {player ? wonLine('r2', 'الجولة 2: ثبّتَّ قيمتي الملعب $(x - 1)(x + 4)$ .', 'الجولة 2: لم تثبّت بعد قيم الملعب $(x - 1)(x + 4)$ .') : evidence([ADVANCED])}
              <TapQuestion
                prompt={<MathText>{'بطريقة حاتم ننشر: $(x - 1)(x + 4) = x^2 + 3x - 4$. هل نصل إلى معادلة من الدرجة الأولى؟'}</MathText>}
                options={[
                  M('نعم: ننقل $-4$ إلى الطرف الآخر ثم نقسم على 3'),
                  M('لا: في المعادلة $x^2 + 3x - 4 = 0$ حدّ $x^2$ ، فليست من الدرجة الأولى'),
                  M('نعم، لأنّ $x^2 + 3x = 4$ معادلة من الدرجة الأولى'),
                ]}
                correct={1}
                cols={1}
                requires={['khassiya-jidaa-maadum', 'nashr-jidaa']}
                explain={<MathText>{ACTIVITY.q3note}</MathText>}
                onAnswered={() => setQ5a(true)}
              />
              {q5a && (
                <TapQuestion
                  prompt={<MathText>{'حل المعادلة $(x - 1)(x + 4) = 0$ . حلولها:'}</MathText>}
                  options={[M('$-1$ و $4$'), M('$1$ فقط'), M('$1$ و $-4$'), M('$-4$')]}
                  correct={2}
                  cols={2}
                  requires={['khassiya-jidaa-maadum']}
                  explain={<MathText>{NOTEBOOKS.expandFails}</MathText>}
                  onAnswered={() => setQ5(true)}
                />
              )}
            </div>
          ),
        },
        ...(player ? [{
          needsRound: { id: 'r3', label: 'الجولة 3', icon: '⚽', won: Boolean(won.r3) },
          num: 6, title: 'لماذا $0$ حلّ؟', subtitle: 'من ملعبك في الجولة 3', done: q6,
          content: (
            <div className="space-y-3">
              {wonLine('r3', 'الجولة 3: الملعب $2x(x + 2)$ اختفى عند $0$ وعند $-2$ .', 'الجولة 3: لم تثبّت بعد قيمتي الملعب $2x(x + 2)$ .')}
              <TapQuestion
                prompt={<MathText>{'في الملعب $2x(x + 2)$ ثبّتَّ القيمة $0$ . لماذا $0$ حلّ، مع أنّ العدد 2 لا ينعدم؟'}</MathText>}
                options={[
                  M('لأنّ العامل $2x$ يساوي $0$ عندما $x = 0$'),
                  M('لأنّ $0$ حلّ لكل معادلة جداء معدوم'),
                  M('لأنّ $x + 2$ يساوي $0$ عندما $x = 0$'),
                ]}
                correct={0}
                cols={1}
                requires={['khassiya-jidaa-maadum']}
                explain={<MathText>{'العامل $2x$ يتغيّر مع $x$ وينعدم عند $0$ ؛ أمّا $x + 2$ فيساوي $2$ عندما $x = 0$ . وفي الملعب $(x - 1)(x + 4)$ لم يكن $0$ حلًّا: $(-1) \\times 4 = -4$ .'}</MathText>}
                onAnswered={() => setQ6(true)}
              />
            </div>
          ),
        }] : []),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
