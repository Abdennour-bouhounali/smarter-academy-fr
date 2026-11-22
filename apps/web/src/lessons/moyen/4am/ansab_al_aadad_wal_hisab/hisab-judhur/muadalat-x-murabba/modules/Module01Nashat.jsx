import { useEffect, useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY } from '../content/textbook';
import { M1_ROUNDS } from '../content/folds';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useSavedAnswer } from '../../../../../../common/answers/useSavedAnswer';

/**
 * Module 1 — نشاط 3 (p. 20) : « المعادلات من الشكل x² = a » (rétrofit 2026-10-15 : le labo en tête SANS carte, SANS titre ni
 * lead d'atelier ; les étapes interrogent ce que l'élève a FAIT ; la brique APRÈS la réponse).
 *
 * L'ENTRÉE est le débat du manuel lui-même, mais posé À LA MAIN : مراد dit que x² = 9 a pour solution 3 ; عمر dit qu'il en a oublié
 * une. Personne ne tranche à l'écran : la flèche de x et celle de −x arrivent au même point, l'élève le VOIT avant qu'on le lui
 * demande. Le tableau des carrés (question 1 أ) n'ouvre plus le module : il TESTE ensuite l'idée sur des fractions.
 *
 * LABORATOIRE À DEUX NIVEAUX — la droite qui se plie (`square-fold`) :
 *   مبتدئ  x² = 9 (l'équation de مراد), x² = 0, x² = −9 ; graduation 1/2 ; le TABLEAU de la question 1 (−3/2, −1, 0, 1, 3/2, 2) se
 *          remplit avec les positions que l'élève essaie — il ne le lit pas, il le produit.
 *   متقدم  les cinq équations de la question 2 ب — 25, 3, 0, 0,04, −9 — graduation 1/10, sans tableau ; √3 ne tombe sur aucune
 *          graduation.
 * Les deux niveaux portent les nombres du manuel : rien n'est adapté.
 *
 * ORDRE DES IDÉES (étapes) : 1. pourquoi DEUX flèches arrivent à 9 (la preuve : l'élève a fini le labo — `onFinished`, le labo n'a pas
 * d'`onTrial`) → 2. le tableau, pour tester l'idée sur −3/2, −1… → 3. la conjecture (carrés de deux opposés) → 4. sa preuve par la
 * lettre b → 5. pourquoi aucune flèche n'atteint −9 → 6. de deux solutions à l'équation (7 et −7…) → 7. la relation entre les
 * solutions et a, PUIS la brique `murabba-mutaakisayn`. Le « حل، إن أمكن » de la question 2 ب (cinq équations) est joué par le niveau
 * متقدم du labo (chaque épingle est jugée) : l'étape qui le re-posait est retirée. La خاصية 2 reste au module 2.
 * LP enseigné : P1.
 *
 * LECTEUR DE MISSION (rollout 2026-11-10, unité 2 leçon 3 ; conseil du 2026-11-10) : le labo se joue en MANCHES (content/folds.js › M1_ROUNDS :
 * 4, 0, −4 à la main avec le tableau → −9, 0,04, 1,44, 0 avec deux prédictions → 3 et 2,25 (√3 épinglé exact) → défi ⭐ → droite libre) au lieu
 * de مبتدئ / متقدم ; l'étape 1 attend la manche 1, l'étape 5 la manche 2 (la carte −9). Ce que le labo a fait (ses questions finies, la manche
 * gagnée) est GARDÉ (answers/useSavedAnswer + étoiles) : un rechargement ne bloque jamais une étape. Hors lecteur : inchangé.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Nashat() {
  const [q, setQ] = useState({});
  const done = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  // Le labo : sa fin (le verdict de la découverte) et ses questions posées PAR-DESSUS (LabCheckpoint, 2026-10-28) dont la TRACE est `checkpoint-done`.
  const [finished, setFinished] = useState(false);
  const onFinished = () => setFinished(true);
  const [cpDone, setCpDone] = useState({});
  const onTrial = (e) => { if (e?.tk === 'checkpoint-done') setCpDone((d) => ({ ...d, [e.id]: true })); };
  // Dans le lecteur : les manches gagnées (étoiles gardées) ouvrent les étapes ; les questions finies du labo sont GARDÉES (revue ECC des
  // leçons 1–2 : une étape ne doit jamais attendre des questions qu'un rechargement a effacées).
  const [won, setWon] = useState({});
  const memory = useSavedAnswer([], { key: 'lab-folds', lessonId: MODULE_CTX.lessonId, moduleNumber: 1 });
  const kept = memory.saved?.v ?? {};
  const { save } = memory;
  useEffect(() => {
    // jamais avant que la copie du serveur soit arrivée (`ready`) : une fusion partielle, plus récente, l'écraserait (revue ECC 2026-11-10)
    if (!memory.on || !memory.ready || (!Object.keys(cpDone).length && !finished)) return;
    save({ cp: { ...(kept.cp ?? {}), ...cpDone }, finished: !!(kept.finished || finished) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpDone, finished, memory.ready]);
  const cpSeen = { ...(kept.cp ?? {}), ...cpDone };
  const labDone = finished || !!kept.finished || !!won.r1;
  const mirrorDone = !!cpSeen.c0 || !!cpSeen.rule || !!won.r1 || !!q.m;
  const { table, equations } = ACTIVITY.numbers;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 3 — مراد وعمر"
      moduleSubtitle="كم حلا للمعادلة؟"
      estimatedTime="14 دقيقة"
      objectives={['هل للمعادلة $x^2 = 9$ حلّ واحد أم أكثر؟', 'ماذا نلاحظ على مربّعي عددين متعاكسين؟', 'كم حلّا للمعادلة $x^2 = a$ حين تتغيّر إشارة $a$؟']}
      intro={
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m1-folds" rounds={M1_ROUNDS} icon="📐" freeIcon="🎏"
              onTrial={onTrial} onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="square-fold"
                level="beginner"
                targets={[9, 0, -9]}
                scale={2}
                table={table}
                lead={<MathText>{'قال مراد إنّ حلّ المعادلة $x^2 = 9$ هو 3 لأنّ $3^2 = 9$، وقال عمر إنّه نسي حلًّا آخر. ابدأ بمعادلة مراد، ثم مرّ على قيم الجدول الستّ: مربّع كل قيمة تزورها يُكتب تحت المستقيم.'}</MathText>}
                onFinished={onFinished}
                onTrial={onTrial}
              />
            ),
            advanced: () => (
              <Manipulation
                type="square-fold"
                level="advanced"
                targets={equations}
                scale={10}
                lead="خمس معادلات بلا جدول: ثبّت كل حل تجده، أو صرّح بأن المعادلة لا تقبل أي حل."
                onFinished={onFinished}
                onTrial={onTrial}
              />
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '📐', won: Boolean(won.r1) },
          num: 1, title: 'لماذا يصل سهم عدد وسهم معاكسه إلى النقطة نفسها؟', subtitle: 'من تجربتك في المختبر', done: mirrorDone,
          content: (
            <div className="space-y-3">
              <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
                <li className={labDone ? 'font-bold text-slate-800' : 'text-slate-500'} data-evidence="finished" data-tried={labDone ? 'true' : 'false'}>
                  {labDone
                    ? 'أنهيتَ المختبر: ثبّتَّ الحلول وأجبتَ عن سؤال الاستنتاج.'
                    : 'لم تُنهِ المختبر بعد: ارجع إلى الأعلى وثبّت حلول البطاقات ليظهر سؤال الاستنتاج.'}
                </li>
              </ul>
              <p className={`rounded-xl border-2 px-3 py-2 text-sm ${mirrorDone ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`} data-activity-evidence data-tried={mirrorDone ? 'true' : 'false'}>
                {mirrorDone
                  ? <span>أجبتَ في المختبر: الحلّان اللذان ثبّتّهما عددان متعاكسان ولهما المربّع نفسه، فيصل سهماهما إلى الدائرة <MathText>{'$a$'}</MathText> نفسها.</span>
                  : 'ثبّت حلّي معادلة موجبة في المختبر، ثم أجب عن الأسئلة التي تظهر فوقه.'}
              </p>
            </div>
          ),
        },
        {
          num: 2, title: 'هل يصحّ ذلك على أعداد الجدول؟ أتمم الجدول', subtitle: 'زُر كل قيمة من الجدول بالعدد x في المختبر', done: !!q.t,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700"><MathText>{ACTIVITY.questions[0]}</MathText></p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختبر فكرتك على أعداد الجدول: ما مربّع كل عدد؟ الجدول تحت المستقيم يمتلئ بما جرّبته.</p>}
                rows={[
                  { id: 'a', label: M('$x = -\\dfrac{3}{2}$'), options: ['$\\dfrac{9}{4}$', '$-\\dfrac{9}{4}$', '$-3$'].map(M), correct: 0, correction: M('$\\left(-\\dfrac{3}{2}\\right)^2 = \\left(-\\dfrac{3}{2}\\right) \\times \\left(-\\dfrac{3}{2}\\right) = \\dfrac{9}{4}$') },
                  { id: 'b', label: M('$x = -1$'), options: ['$-1$', '$1$', '$-2$'].map(M), correct: 1, correction: M('$(-1)^2 = (-1) \\times (-1) = 1$') },
                  { id: 'c', label: M('$x = 0$'), options: ['$2$', '$0$', '$1$'].map(M), correct: 1, correction: M('$0^2 = 0 \\times 0 = 0$') },
                  { id: 'd', label: M('$x = 1$'), options: ['$2$', '$1$', '$-1$'].map(M), correct: 1, correction: M('$1^2 = 1 \\times 1 = 1$') },
                  { id: 'e', label: M('$x = \\dfrac{3}{2}$'), options: ['$3$', '$\\dfrac{9}{4}$', '$\\dfrac{3}{4}$'].map(M), correct: 1, correction: M('$\\left(\\dfrac{3}{2}\\right)^2 = \\dfrac{3}{2} \\times \\dfrac{3}{2} = \\dfrac{9}{4}$') },
                  { id: 'f', label: M('$x = 2$'), options: ['$4$', '$2$', '$-4$'].map(M), correct: 0, correction: M('$2^2 = 2 \\times 2 = 4$') },
                ]}
                requires={['murabba-adad']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'الجدول كامل. ' : 'انظر إلى التصحيحات. '}قارن عمودي <MathText>{'$-\\dfrac{3}{2}$'}</MathText> و <MathText>{'$\\dfrac{3}{2}$'}</MathText>، ثم عمودي <MathText>{'$-1$'}</MathText> و <MathText>{'$1$'}</MathText>.
                  </Feedback>
                )}
                onAnswered={done('t')}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'ب) ضع تخمينا', subtitle: ACTIVITY.questions[1], done: !!q.k,
          content: (
            <TapQuestion
              prompt={<span>ماذا تلاحظ على مربعي عددين متعاكسين، مثل <MathText>{'$-\\dfrac{3}{2}$'}</MathText> و <MathText>{'$\\dfrac{3}{2}$'}</MathText>؟</span>}
              options={['مربعاهما متساويان', 'مربعاهما متعاكسان', 'مربع العدد السالب سالب', 'مربع العدد السالب أكبر دائمًا']}
              correct={0}
              cols={2}
              requires={['murabba-adad']}
              explain={<span>في الجدول: <MathText>{'$\\left(-\\dfrac{3}{2}\\right)^2 = \\left(\\dfrac{3}{2}\\right)^2 = \\dfrac{9}{4}$'}</MathText> و <MathText>{'$(-1)^2 = 1^2 = 1$'}</MathText>. وعلى المستقيم: سهم x وسهم معاكسه يصلان إلى النقطة نفسها.</span>}
              onAnswered={done('k')}
            />
          ),
        },
        {
          num: 4, title: 'جـ) أثبت التخمين', subtitle: 'بالحرف b، لا بمثال', done: !!q.b,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700"><MathText>{ACTIVITY.questions[2]}</MathText></p>
              <TapQuestion
                prompt={<span>أي كتابة تثبت التخمين من أجل <strong>كل</strong> عدد <MathText>{'$b$'}</MathText>؟</span>}
                options={[
                  '$(-b)^2 = (-b) \\times (-b) = b \\times b = b^2$',
                  '$(-b)^2 = -(b \\times b) = -b^2$',
                  '$(-b)^2 = -2b$',
                  '$\\left(-\\dfrac{3}{2}\\right)^2 = \\left(\\dfrac{3}{2}\\right)^2$، إذن يكفي هذا المثال',
                ].map(M)}
                correct={0}
                cols={1}
                requires={['murabba-adad']}
                explain={<span>جداء عددين سالبين موجب: <MathText>{'$(-b) \\times (-b) = b \\times b$'}</MathText>. مثال واحد لا يثبت خاصية لكل الأعداد؛ الحساب بالحرف <MathText>{'$b$'}</MathText> يثبتها.</span>}
                onAnswered={done('b')}
              />
            </div>
          ),
        },
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '📐', won: Boolean(won.r2) },
          num: 5, title: <MathText>{'لماذا لا يصل أي سهم إلى $-9$؟'}</MathText>, subtitle: 'من تجربتك مع البطاقة x² = −9', done: !!q.h,
          content: (
            <TapQuestion
              prompt={<span>في المختبر حرّكتَ <MathText>{'$x$'}</MathText> في كل اتجاه ولم يدخل أي سهم الجزء المخطّط حيث يقع <MathText>{'$-9$'}</MathText> على مستقيم المربّعات. لماذا؟</span>}
              options={[
                'لأنّ مربّع أي عدد، موجبًا كان أو سالبًا، لا يكون سالبًا',
                'لأنّ المستقيم السفلي ينتهي عند $-9$',
                'لأنّ $x = -9$ هو الوحيد الذي لم نجرّبه',
                'لأنّ $-9$ أصغر من $-3$',
              ].map(M)}
              correct={0}
              cols={1}
              requires={['murabba-adad']}
              explain={<span>المربّعات <MathText>{'$3^2 = 9$'}</MathText> و <MathText>{'$(-3)^2 = 9$'}</MathText> و <MathText>{'$0^2 = 0$'}</MathText> كلها موجبة أو معدومة؛ و <MathText>{'$(-9)^2 = 81$'}</MathText> وليس <MathText>{'$-9$'}</MathText>. لذلك لا تقبل <MathText>{'$x^2 = -9$'}</MathText> أي حل.</span>}
              onAnswered={done('h')}
            />
          ),
        },
        {
          num: 6, title: '3) أكتب معادلة من حلّيها', subtitle: 'من الحلّين إلى العدد a', done: !!q.w,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700"><MathText>{ACTIVITY.questions[5]}</MathText></p>
              <BatchChoiceQuestion
                rows={[
                  { id: 'w1', label: M('أ) $7$ و $-7$'), options: ['$x^2 = 14$', '$x^2 = 49$', '$x^2 = -49$'].map(M), correct: 1, correction: M('$7^2 = (-7)^2 = 49$.') },
                  { id: 'w2', label: M('ب) $\\dfrac{2}{3}$ و $-\\dfrac{2}{3}$'), options: ['$x^2 = \\dfrac{4}{9}$', '$x^2 = \\dfrac{4}{6}$', '$x^2 = -\\dfrac{4}{9}$'].map(M), correct: 0, correction: M('$\\left(\\dfrac{2}{3}\\right)^2 = \\left(-\\dfrac{2}{3}\\right)^2 = \\dfrac{4}{9}$.') },
                  { id: 'w3', label: M('جـ) $0{,}5$ و $-0{,}5$'), options: ['$x^2 = 1$', '$x^2 = 2{,}5$', '$x^2 = 0{,}25$'].map(M), correct: 2, correction: M('$0{,}5^2 = (-0{,}5)^2 = 0{,}25$.') },
                ]}
                requires={['murabba-adad']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'تمامًا: ' : 'انظر إلى التصحيحات: '}قارن كل حلّين بالعدد الذي يظهر في الطرف الثاني من المعادلة.
                  </Feedback>
                )}
                onAnswered={done('w')}
              />
            </div>
          ),
        },
        {
          num: 7, title: 'ماذا تستنتج؟', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>في الحالات الثلاث، ما العلاقة بين الحلّين والعدد <MathText>{'$a$'}</MathText>؟</span>}
                options={[
                  'الحلّان عددان متعاكسان، و $a$ هو مربع كل منهما',
                  'الحلّان هما $a$ و $-a$',
                  'مجموع الحلّين يساوي $a$',
                  'جداء الحلّين يساوي $a$',
                ].map(M)}
                correct={0}
                cols={1}
                requires={['murabba-adad', 'jidhr-taarif']}
                explain={<span>مثلا <MathText>{'$7$'}</MathText> و <MathText>{'$-7$'}</MathText> متعاكسان ومربع كل منهما 49؛ مجموعهما 0 وجداؤهما <MathText>{'$-49$'}</MathText>.</span>}
                onAnswered={done('c')}
              />
              {q.c && (
                <KnowledgeBrick
                  id="murabba-mutaakisayn"
                  lead="ما رأيته بالسهمين وأثبتّه بالحرف b، نكتبه هكذا:"
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
