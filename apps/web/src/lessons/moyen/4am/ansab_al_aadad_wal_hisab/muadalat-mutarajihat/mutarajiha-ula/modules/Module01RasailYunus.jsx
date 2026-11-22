import { useState } from 'react';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY } from '../content/textbook';
import { M1_ROUNDS } from '../content/rays';

/**
 * Module 1 — « أيّ الأعداد تصلح؟ » : المتراجحة وحلولها, sur le budget de هدى (6 دج le stylo, 20 دج la boîte, 80 دج) — nombres et personnage de la
 * plateforme (rollout 2026-11-11, conseil du 2026-11-11, verdict X1 : le livre ne paraît plus).
 *
 * PAGE : le labo solution-ray (sans crochet, x entier) posé UNE fois ; l'élève étire x, la kalfa et le رصيد se comparent sous son doigt, chaque
 * essai laisse une trace rouge ou grise. AUCUNE étape n'attend `onFinished` : `onTrial` liste ses essais (`[data-activity-evidence]`). Le vocabulaire
 * « متراجحة » et « حل » n'arrive qu'avec les briques (mutarajiha, hal-mutarajiha).
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 4 leçon 3 ; verdict L3) : le labo se joue en MANCHES (content/rays.js › M1_ROUNDS : le budget des
 * stylos → le défi de lecture → ⭐ en nombres relatifs → la droite libre) ; AUCUN téléphone avant la مسألة. Chaque étape attend sa manche et relit ce
 * que l'élève A FAIT (étoiles gardées, annoncées par LabRounds au montage) : r1 → ses deux valeurs ; r2 → le nom « متراجحة » puis le test de
 * 2, 5, 7 (ses points rouges à côté) puis le nom « حل ». NO BACK-AND-FORTH : l'inéquation que chaque question lit est répétée dans son énoncé.
 * LP : P1.
 */
const COST = Lin.linear('6x+20');
const CREDIT = ACTIVITY.numbers.credit;
const cost = (n) => Lin.linAt(COST, Lin.frac(n));
const fits = (n) => Lin.compareWith(cost(n), '<=', Lin.frac(CREDIT));
const FITS_WISH = ['يوافق', 'لا يوافق'];
// r2 (le défi de lecture) : 15x + 25 > 100
const READ = Lin.linear('15x+25');
const isSolR = (n) => Lin.compareWith(Lin.linAt(READ, Lin.frac(n)), '>', Lin.frac(100));
const SOL = ['حلّ', 'ليس حلًّا'];

export default function Module01RasailYunus() {
  const player = useModulePlayer(MODULE_CTX);
  const [won, setWon] = useState({});
  const [tried, setTried] = useState([]);
  const [cps, setCps] = useState([]);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const answered = cps.some((e) => e.tk === 'checkpoint-done');
  const [q1b, setQ1b] = useState(false);
  const [q1c, setQ1c] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const onTrial = (e) => {
    if (e.kind !== 'trace') return;
    setTried((t) => [...t.filter((u) => u.k !== e.k), { k: e.k, ok: e.ok }].sort((a, b) => a.k - b.k));
  };

  const evidence = (
    <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
      {tried.length === 0
        ? <li className="text-slate-500" data-evidence="none" data-tried="false">لم تجرّب بعد: اسحب عدد الأقلام في المختبر أعلاه.</li>
        : tried.map(({ k, ok }) => (
          <li key={k} data-evidence={k} data-tried="true" className={ok ? 'text-red-900' : 'text-slate-600'}>
            <MathText>{`$x = ${k}$ : $6 \\times ${k} + 20 = ${Lin.fracText(cost(k))}$ ، ${ok ? `ولا يتجاوز ${CREDIT} دج ●` : `أي أكثر من ${CREDIT} دج ○`}`}</MathText>
          </li>
        ))}
    </ul>
  );
  const wonLine = (id, yes, no) => (
    <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won[id] ? 'font-bold text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      {won[id] ? <><span aria-hidden="true">✓ </span><MathText>{yes}</MathText></> : <MathText>{no}</MathText>}
    </p>
  );
  const valueQs = (restate) => (
    <>
      <NumericQuestion
        prompt={<MathText>{`${restate}قيمة لـ $x$ (عدد أقلام كامل) توافق رغبة هدى في $6x + 20 \\leq 80$ :`}</MathText>}
        expected={(n) => Number.isInteger(n) && n >= 0 && fits(n)}
        display="عدد طبيعي من 0 إلى 10"
        requires={['muqarana-adad']}
        explainFor={(n) => (Number.isInteger(n) && n >= 0
          ? <MathText>{`$6 \\times ${n} + 20 = ${Lin.fracText(cost(n))}$ : ${fits(n) ? 'لا يتجاوز 80، القيمة توافق.' : 'يتجاوز 80، القيمة لا توافق.'}`}</MathText>
          : <span>عدد الأقلام عدد طبيعي: 0، 1، 2، …</span>)}
        onAnswered={() => setQ1b(true)}
      />
      <NumericQuestion
        prompt={<MathText>{'وقيمة أخرى لـ $x$ لا توافقها في $6x + 20 \\leq 80$ :'}</MathText>}
        expected={(n) => Number.isInteger(n) && n >= 0 && !fits(n)}
        display="عدد طبيعي أكبر من 10"
        requires={['muqarana-adad']}
        explainFor={(n) => (Number.isInteger(n) && n >= 0
          ? <MathText>{`$6 \\times ${n} + 20 = ${Lin.fracText(cost(n))}$ : ${fits(n) ? 'لا يتجاوز 80، فهذه القيمة توافق.' : 'يتجاوز 80، القيمة لا توافق.'}`}</MathText>
          : <span>عدد الأقلام عدد طبيعي: 0، 1، 2، …</span>)}
        onAnswered={() => setQ1c(true)}
      />
    </>
  );

  const playerSteps = [
    {
      needsRound: { id: 'r1', label: 'الجولة 1', icon: '🖍️', won: Boolean(won.r1) },
      num: 1, title: 'ماذا لاحظت على مستقيمك؟', subtitle: 'من ميزانية الأقلام في الجولة 1', done: q1b && q1c,
      content: (
        <div className="space-y-3">
          {wonLine('r1', 'الجولة 1: بنيتَ المتباينة $6x + 20 \\leq 80$ ولوّنتَ بالأحمر الأعداد التي توافقها.', 'الجولة 1: لم تجد بعد آخر عدد من الأقلام تبقى كلفته في حدود الرصيد.')}
          {valueQs('في الجولة 1: ')}
        </div>
      ),
    },
    {
      needsRound: { id: 'r2', label: 'الجولة 2', icon: '🖍️', won: Boolean(won.r2) },
      num: 2, title: 'ما نوع هذه الكتابة؟', subtitle: 'من تحدّي القراءة في الجولة 2', done: q3,
      content: (
        <div className="space-y-3">
          {wonLine('r2', 'الجولة 2: بنيتَ المتباينة $15x + 25 > 100$ ولوّنتَ بالأحمر الأيام التي يتجاوز فيها الهدف.', 'الجولة 2: لم تجد بعد أوّل يوم يتجاوز فيه الهدف.')}
          <TapQuestion
            prompt={<MathText>{'من أجل $x = 9$ في $15x + 25 > 100$ نكتب $15 \\times 9 + 25 > 100$ . ما نوع هذه الكتابة؟'}</MathText>}
            options={[
              <MathText key="a">{'كتابة فيها المجهول $x$ نفسه، تتغيّر صحّتها بتغيّر قيمته'}</MathText>,
              <MathText key="b">{'متباينة عددية صحيحة: لا مجهول فيها'}</MathText>,
              <MathText key="c">{'متباينة عددية خاطئة'}</MathText>,
            ]}
            correct={1}
            cols={1}
            explain={<MathText>{'بعد التعويض لم يبقَ مجهول: $15 \\times 9 + 25 = 160$ و $160 > 100$ متباينة صحيحة. أمّا $15x + 25 > 100$ فقد تكون صحيحة أو خاطئة حسب قيمة $x$ .'}</MathText>}
            onAnswered={() => setQ3(true)}
          />
          {q3 && <KnowledgeBrick id="mutarajiha" lead="المتباينتان اللتان بنيتَهما في الجولتين فيهما المجهول x — لهما اسم:" />}
        </div>
      ),
    },
    {
      needsRound: { id: 'r2', label: 'الجولة 2', icon: '🖍️', won: Boolean(won.r2) },
      num: 3, title: 'هل العدد حلّ؟', subtitle: 'اختبر بالتعويض', done: q4,
      content: (
        <div className="space-y-3">
          {wonLine('r2', 'الجولة 2: نقاطك الحمراء هي الأيام التي يتجاوز فيها الهدف 100 صفحة، ونقاطك الرمادية الأيام التي لا يتجاوزه فيها.', 'الجولة 2: لم تجد بعد نقاطك الحمراء والرمادية.')}
          <BatchChoiceQuestion
            intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'اختبر بالتعويض في $15x + 25 > 100$ : هل كل عدد حلّ؟'}</MathText></p>}
            rows={[2, 5, 7].map((n) => ({
              id: `s${n}`, label: <MathText>{`العدد ${n}`}</MathText>, options: SOL, correct: isSolR(n) ? 0 : 1,
              correction: <MathText>{`$15 \\times ${n} + 25 = ${Lin.fracText(Lin.linAt(READ, Lin.frac(n)))}$ و $${Lin.fracText(Lin.linAt(READ, Lin.frac(n)))} > 100$ ${isSolR(n) ? 'متباينة صحيحة: العدد حلّ.' : 'متباينة خاطئة: العدد ليس حلًّا.'}`}</MathText>,
            }))}
            feedback={({ allRight }) => (
              <Feedback tone={allRight ? 'ok' : 'ko'}>
                <MathText>{allRight
                  ? 'نعوّض $x$ بالعدد، فإن كانت المتباينة الناتجة صحيحة فالعدد حلّ — والحدّ نفسه قد لا يكون حلًّا.'
                  : 'عوّض $x$ بالعدد واحسب: هل المتباينة العددية الناتجة صحيحة؟ انتبه إلى العدد 5 : $100 > 100$ .'}</MathText>
              </Feedback>
            )}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <>
              <KnowledgeBrick id="hal-mutarajiha" lead="ونقاطك الحمراء لها اسم أيضًا:" />
              <TextbookBox kind="definition" lines={ACTIVITY.box} source={ACTIVITY.source} compact />
            </>
          )}
        </div>
      ),
    },
  ];

  const pageSteps = [
    {
      num: 1, title: 'لماذا 10 أقلام تكفي و 11 لا؟', subtitle: 'جرّب في المختبر، ثم أجب', done: answered,
      content: (
        <div className="space-y-3">
          {evidence}
          <p data-evidence="checkpoint" data-tried={answered ? 'true' : 'false'}
            className={`rounded-xl border-2 px-3 py-2 text-sm ${answered ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
            {answered
              ? 'أجبتَ في المختبر: عند 10 أقلام تبلغ الكلفة الرصيد تمامًا فهي كافية، وعند 11 تتجاوزه — ولذلك تنتهي النقاط الحمراء عند 10.'
              : 'جرّب أعدادًا من الأقلام في المختبر حتى تظهر نقاط حمراء ورمادية، ثم أجب عن الأسئلة التي تظهر فوقه.'}
          </p>
        </div>
      ),
    },
    {
      num: 2, title: 'أيّ متباينة توافق رغبة هدى؟', subtitle: 'اختر ثم جرّب قيمتين', done: q2a && q1b && q1c,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<MathText>{'تملك هدى 80 دج: علبة بـ 20 دج و 6 دج للقلم، وعدد الأقلام $x$ . أيّ متباينة توافق رغبتها في ألّا تتجاوز الكلفة ما معها؟'}</MathText>}
            options={ACTIVITY.numbers.candidates.map((c) => <MathText key={c}>{`$${c.replace('<=', ' \\leq ')}$`}</MathText>)}
            correct={2}
            cols={1}
            requires={['muqarana-adad']}
            explain={<MathText>{'الكلفة $6x + 20$ يجب ألّا تتجاوز الرصيد 80: $6x + 20 \\leq 80$. في المتباينتين الأخريين بُدّل دور الأعداد.'}</MathText>}
            onAnswered={() => setQ2a(true)}
          />
          {q2a && (<>{evidence}{valueQs('')}</>)}
        </div>
      ),
    },
    {
      num: 3, title: 'متباينة بمجهول', subtitle: 'ما اسم هذه الكتابة؟', done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<MathText>{'والكتابة $6 \\times 10 + 20 \\leq 80$ (حين عوّضت $x$ بالعدد 10)؟'}</MathText>}
            options={[
              <MathText key="a">{'كتابة فيها المجهول $x$ نفسه، تتغيّر صحّتها بتغيّر قيمته'}</MathText>,
              <MathText key="b">{'متباينة عددية صحيحة: لا مجهول فيها'}</MathText>,
              <MathText key="c">{'متباينة عددية خاطئة'}</MathText>,
            ]}
            correct={1}
            cols={1}
            explain={<MathText>{'بعد التعويض لم يبقَ مجهول: $6 \\times 10 + 20 = 80$ و $80 \\leq 80$ متباينة صحيحة. أمّا $6x + 20 \\leq 80$ فقد تكون صحيحة أو خاطئة حسب قيمة $x$ .'}</MathText>}
            onAnswered={() => setQ3(true)}
          />
          {q3 && <KnowledgeBrick id="mutarajiha" lead="المتباينات الثلاث المعروضة فيها المجهول x — لها اسم:" />}
        </div>
      ),
    },
    {
      num: 4, title: 'هل يوافق العدد رغبة هدى؟', subtitle: 'اختبار العددين 2 و 11', done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'نقاطك الحمراء في المختبر هي الأعداد التي توافق رغبة هدى. اختبر بالتعويض في $6x + 20 \\leq 80$ :'}</MathText></p>}
            rows={ACTIVITY.numbers.tests.map((n) => ({
              id: `s${n}`, label: <MathText>{`العدد ${n}`}</MathText>, options: FITS_WISH, correct: fits(n) ? 0 : 1,
              correction: <MathText>{`$6 \\times ${n} + 20 = ${Lin.fracText(cost(n))}$ و $${Lin.fracText(cost(n))} \\leq 80$ ${fits(n) ? 'متباينة صحيحة: العدد يوافق.' : 'متباينة خاطئة: العدد لا يوافق.'}`}</MathText>,
            }))}
            feedback={({ allRight }) => (
              <Feedback tone={allRight ? 'ok' : 'ko'}>
                <MathText>{allRight
                  ? 'نعوّض $x$ بالعدد، فإن كانت المتباينة الناتجة صحيحة فالعدد يوافق.'
                  : 'عوّض $x$ بالعدد واحسب: هل المتباينة العددية الناتجة صحيحة؟'}</MathText>
              </Feedback>
            )}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <>
              <KnowledgeBrick id="hal-mutarajiha" lead="ونقاطك الحمراء لها اسم أيضًا:" />
              <TextbookBox kind="definition" lines={ACTIVITY.box} source={ACTIVITY.source} compact />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      objectives={['هل تستطيع هدى شراء 11 قلمًا؟ و 10؟ و 6؟', 'ماذا نسمّي كتابة فيها مجهول وإشارة ≤ ؟', 'متى نقول إنّ عددًا حلّ لها؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — أيّ الأعداد تصلح؟"
      moduleSubtitle="المتراجحة وحلولها"
      estimatedTime="9 دقائق"
      intro={(
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-ray-m1" rounds={M1_ROUNDS} icon="🖍️" freeIcon="📏"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <Manipulation
              type="solution-ray"
              ineq={ACTIVITY.ineq}
              whole
              sides={{ left: 'الكلفة', right: 'الرصيد' }}
              bracket={false}
              levels={false}
              marks={ACTIVITY.numbers.asked}
              lead="كل قلم يزيد الكلفة 6 دج فوق ثمن العلبة: جرّب أعدادًا من الأقلام الكاملة، منها 6 و 10 و 11."
              onTrial={onTrial}
              onCheckpoint={onCheckpoint}
            />
          )}
        />
      )}
      steps={player ? playerSteps : pageSteps}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
