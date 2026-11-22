import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, LAB } from '../content/textbook';

/**
 * Module 1 — نشاط 4 « تناسب التغيّرات » (p. 79), ouvert sur L'ESCALIER DES ACCROISSEMENTS (slope-stairs).
 *
 * REAL       la carte : le stade de la ville, l'abonnement annuel des supporters (le manuel).
 * MANIPULATE le lab à deux niveaux, UN instrument, même objectif — متقدم PAR DÉFAUT (c'est l'activité du
 *            manuel : f(x) = 200x + 2000 et son escalier 0→1→4→6→10→12→15, deux marches imprimées) ;
 *            مبتدئ : l'abonnement des cadets (100 DA + 50 DA par match), deux marches.
 * DISCOVER   questions 1 et 2 du manuel (7 matchs, 4800 DA, f(x), images, l'antécédent de 2000) ;
 * UNDERSTAND question 3 : les trois quotients du manuel, à côté des marches de l'ÉLÈVE (`onTrial`,
 *            `[data-activity-evidence]`) — la brique tanasub-taghayyurat NOMME ce qu'elles montrent (l'élève
 *            la PRÉDIT d'abord : l'explication de « ماذا تلاحظ؟ » n'énonce donc pas la règle générale,
 *            ACTIVITY_LINES.observe, mais seulement les quotients) ;
 * TOUCH      question 4 : compléter les « … » de la figure — l'élève les a construites dans le lab.
 * Fin de l'étape 4 : la « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire), résolue au module 4.
 * Aucune étape n'attend `onFinished` (non bloquant). LP : P1.
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;
const near = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;
const tex = (s) => String(s).replace(',', '{,}');

/** La TRACE d'une suite de questions posée par-dessus le labo (LabCheckpoint) : l'étape est faite quand la suite l'est. */
function Trace({ id, done, children, idle }) {
  return (
    <p data-checkpoint-trace={id} data-tried={done ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${done ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {done ? children : idle}
    </p>
  );
}

export default function Module01Mudarrajat() {
  const [trials, setTrials] = useState({ beginner: [], advanced: [] });
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q2c, setQ2c] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);
  const [q4, setQ4] = useState(false);
  const [cps, setCps] = useState([]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : « ماذا تلاحظ؟ » y est posée ; coupées par l'enseignant, la question d'origine revient
  const cpOn = useLabCheckpointSettings('slope-stairs').enabled;
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const noticed = cpOn ? answered('contrast') : q3b;
  const onTrial = (lv) => (tr) => {
    if (tr.tk || tr.kind !== 'stair') return;   // un événement `checkpoint…` n'est pas un essai
    setTrials((t) => ({ ...t, [lv]: [...t[lv].filter((c) => !(c.x1 === tr.x1 && c.x2 === tr.x2)), tr].slice(-8) }));
  };
  const mine = trials.advanced.length ? trials.advanced : trials.beginner;
  const ghostsDone = [...new Set(trials.advanced.filter((tr) => tr.ghost >= 2).map((tr) => tr.ghost))];

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={mine.length ? 'true' : 'false'}>
      {mine.length === 0 ? (
        <p className="text-slate-500">لم تبنِ أي درجة بعد: حرّك العددين في المخبر أعلاه ثم اتركهما، وابنِ درجتين أو ثلاثًا بعروض مختلفة.</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">درجاتك في المخبر:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="stairs">
            {mine.map((tr) => (
              <li key={`${tr.x1}-${tr.x2}`} className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-slate-800" data-evidence-stair={`${tr.x1}:${tr.x2}`}>
                <MathText>{`$x_1 = ${tex(tr.x1)} ,\\ x_2 = ${tex(tr.x2)} :\\ ${tr.short}$`}</MathText>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 4 — اشتراك المناصرين: تناسب التغيّرات"
      moduleSubtitle="درجة بين عددين: كم يزيد المبلغ، وعلى كم مقابلة؟"
      estimatedTime="14 دقيقة"
      objectives={[
        'كم يدفع المناصر؟ وكم مقابلة تابع؟',
        'ماذا نلاحظ في حاصل قسمة تغيّر المبلغ على تغيّر عدد المقابلات؟',
        'كم يزيد المبلغ في كل درجة من الشكل؟',
      ]}
      intro={
        // LE LABO OUVRE LE MODULE (§4quater) : ni carte du manuel, ni titre / `lead` de workspace ; le contexte est le `lead` du labo.
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation type="slope-stairs" level="beginner" {...LAB.m1.beginner}
                lead="نادي المدينة يعرض على أشباله اشتراكًا: 100DA مرّة واحدة يضاف إليها 50DA عن كل مقابلة." onTrial={onTrial('beginner')} onCheckpoint={onCheckpoint} />
            ),
            advanced: () => (
              <Manipulation type="slope-stairs" level="advanced" {...LAB.m1.advanced}
                lead="نشاط الكتاب: اشتراك سنوي لمناصر 2000DA يضاف إليه 200DA عند كل دخول لمقابلة." onTrial={onTrial('advanced')} onCheckpoint={onCheckpoint} />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ماذا تلاحظ في درجاتك؟', subtitle: 'حاصل قسمة الارتفاع على الامتداد', done: noticed,
          content: (
            <div className="space-y-3">
              {evidence}
              {cpOn ? (
                <Trace id="contrast" done={noticed} idle="ابنِ درجات بعروض مختلفة في المخبر، وأجب عن الأسئلة التي تظهر فوقه.">
                  <MathText>{'أجبتَ في المخبر: حاصل قسمة تغيّر المبلغ على تغيّر عدد المقابلات هو نفسه في كل درجة، ويساوي المعامل $a$ .'}</MathText>
                </Trace>
              ) : (
                <TapQuestion
                  prompt="في كل درجة بنيتها، قسمتَ ما زاد في المبلغ على ما زاد في عدد المقابلات. ماذا تلاحظ في الحواصل من درجة إلى أخرى؟"
                  options={[
                    'الحاصل يكبر كلما اتّسعت الدرجة (كلما ابتعد العددان)',
                    'الحاصل هو نفسه في كل درجة مهما كان العددان، ويساوي ثمن المقابلة الواحدة',
                    'الحاصل يساوي فرق الصورتين',
                  ].map(Opt)}
                  correct={1}
                  cols={1}
                  requires={['hisab-farq-nisbi']}
                  explain={<MathText>{'في كل درجة بنيتها الحاصل هو العدد نفسه: ما يدفعه المناصر عن مقابلة واحدة، أي المعامل $a$ في $f(x) = ax + b$ . الاشتراك الثابت لا يدخل في الفرق بين صورتين.'}</MathText>}
                  onAnswered={() => setQ3b(true)}
                />
              )}
              {noticed && <KnowledgeBrick id="tanasub-taghayyurat" lead="ما تقوله كل درجاتك، باسمه:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الاشتراك السنوي', subtitle: 'نشاط 4 — السؤال 1', done: q1a && q1b,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" title={`نشاط 4 — ${ACTIVITY.title}`} lines={[ACTIVITY.situation, ...ACTIVITY.q1]} source={ACTIVITY.source} compact />
              <NumericQuestion
                prompt="المبلغ الإجمالي لمناصر تابع 7 مقابلات (بالدينار):"
                expected={near(ACTIVITY.answer.seven)}
                display="3400"
                parse={parseDec}
                requires={['surat-adad-taalufiya']}
                explain={<MathText>{ACTIVITY_LINES.seven}</MathText>}
                explainFor={(n) => (near(1400)(n) ? <MathText>{'$7 \\times 200 = 1400$ هو ثمن الدخول وحده: نضيف الاشتراك السنوي 2000DA .'}</MathText> : null)}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <NumericQuestion
                  prompt="عدد المقابلات التي تابعها مناصر دفع 4800DA :"
                  expected={near(ACTIVITY.answer.matches4800)}
                  display="14"
                  parse={parseDec}
                  requires={['muadala-ax-b']}
                  explain={<MathText>{ACTIVITY_LINES.matches}</MathText>}
                  explainFor={(n) => (near(24)(n) ? <MathText>{ACTIVITY_LINES.matchesWrong}</MathText> : null)}
                  onAnswered={() => setQ1b(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'الدالة f', subtitle: 'نشاط 4 — السؤال 2', done: q2a && q2b && q2c,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" lines={[ACTIVITY.q2intro, ...ACTIVITY.q2]} source={ACTIVITY.source} compact />
              <TapQuestion
                prompt={<MathText>{'لماذا $f(x) = 200x + 2000$ ؟'}</MathText>}
                options={[
                  'لأنّ المناصر يدفع 2000DA مرّة واحدة، و 200DA عن كل مقابلة من المقابلات $x$',
                  'لأنّ المبلغ متناسب مع عدد المقابلات: $200 \\times 10 = 2000$',
                  'لأنّ المناصر يدفع 2000DA عن كل مقابلة و 200DA مرّة واحدة',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['surat-adad-taalufiya']}
                explain={<MathText>{ACTIVITY_LINES.show}</MathText>}
                onAnswered={() => setQ2a(true)}
              />
              {q2a && (
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700">الصور:</p>}
                  rows={[
                    { id: 'f1', label: <MathText>{'$f(1)$'}</MathText>, options: ['$2200$', '$200$', '$2001$'].map(Opt), correct: 0, correction: <MathText>{'$200 \\times 1 + 2000 = 2200$'}</MathText> },
                    { id: 'f4', label: <MathText>{'$f(4)$'}</MathText>, options: ['$800$', '$2800$', '$8800$'].map(Opt), correct: 1, correction: <MathText>{'$200 \\times 4 + 2000 = 2800$'}</MathText> },
                    { id: 'f6', label: <MathText>{'$f(6)$'}</MathText>, options: ['$3200$', '$1200$', '$13200$'].map(Opt), correct: 0, correction: <MathText>{'$200 \\times 6 + 2000 = 3200$'}</MathText> },
                    { id: 'f9', label: <MathText>{'$f(9)$'}</MathText>, options: ['$1800$', '$18200$', '$3800$'].map(Opt), correct: 2, correction: <MathText>{'$200 \\times 9 + 2000 = 3800$'}</MathText> },
                    { id: 'f11', label: <MathText>{'$f(11)$'}</MathText>, options: ['$4200$', '$2200$', '$24200$'].map(Opt), correct: 0, correction: <MathText>{'$200 \\times 11 + 2000 = 4200$'}</MathText> },
                    { id: 'f15', label: <MathText>{'$f(15)$'}</MathText>, options: ['$3000$', '$5000$', '$30200$'].map(Opt), correct: 1, correction: <MathText>{'$200 \\times 15 + 2000 = 5000$'}</MathText> },
                  ]}
                  requires={['surat-adad-taalufiya']}
                  feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? `أحسنت: ${ACTIVITY_LINES.images} ، ${ACTIVITY_LINES.f11}.` : 'نضرب عدد المقابلات في 200 ثم نضيف 2000: راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                  onAnswered={() => setQ2b(true)}
                />
              )}
              {q2b && (
                <NumericQuestion
                  prompt="العدد الذي صورته 2000:"
                  expected={near(ACTIVITY.answer.pre2000)}
                  display="0"
                  parse={parseDec}
                  requires={['muadala-ax-b']}
                  explain={<MathText>{ACTIVITY_LINES.pre2000}</MathText>}
                  explainFor={(n) => (near(10)(n) ? <MathText>{'$\\dfrac{2000}{200} = 10$ ينسى الحدّ الثابت: نحلّ $200x + 2000 = 2000$ .'}</MathText> : null)}
                  onAnswered={() => setQ2c(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'حواصل الكتاب', subtitle: 'نشاط 4 — ثلاثة حواصل', done: q3a,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" lines={[ACTIVITY.q3]} source={ACTIVITY.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">احسب الحواصل الثلاثة:</p>}
                rows={[
                  { id: 'r41', label: <MathText>{'$\\dfrac{f(4) - f(1)}{4 - 1}$'}</MathText>, options: ['$200$', '$600$', '$3$'].map(Opt), correct: 0, correction: <MathText>{'$\\dfrac{2800 - 2200}{3} = \\dfrac{600}{3} = 200$'}</MathText> },
                  { id: 'r10', label: <MathText>{'$\\dfrac{f(1) - f(0)}{1 - 0}$'}</MathText>, options: ['$2200$', '$200$', '$2000$'].map(Opt), correct: 1, correction: <MathText>{'$\\dfrac{2200 - 2000}{1} = 200$'}</MathText> },
                  { id: 'r64', label: <MathText>{'$\\dfrac{f(6) - f(4)}{6 - 4}$'}</MathText>, options: ['$400$', '$1600$', '$200$'].map(Opt), correct: 2, correction: <MathText>{'$\\dfrac{3200 - 2800}{2} = \\dfrac{400}{2} = 200$'}</MathText> },
                ]}
                requires={['tanasub-taghayyurat', 'surat-adad-taalufiya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? ACTIVITY_LINES.ratios : 'نقسم فرق الصورتين على فرق العددين: راجع التصحيح تحت كل حاصل.'}</MathText></Feedback>}
                onAnswered={() => setQ3a(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'أكمل الشكل', subtitle: 'نشاط 4 — درجات السلّم', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" lines={[ACTIVITY.q4]} source={ACTIVITY.source} compact />
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600" data-fill-evidence={ghostsDone.length}>
                <MathText>{ghostsDone.length
                  ? `أكملتَ في المخبر (المستوى المتقدّم) ${ghostsDone.length} من درجات الشكل الأربع المنقّطة. في كل درجة: الامتداد الأفقي (عدد المقابلات) والارتفاع (ما يزيده المبلغ).`
                  : 'في المخبر (المستوى المتقدّم) ضع العددين على علامتين متتاليتين، مثلا 4 و 6 ، لترى درجة من الشكل تكتمل. في كل درجة: الامتداد الأفقي (عدد المقابلات) والارتفاع (ما يزيده المبلغ).'}</MathText>
              </p>
              <KnowledgeBrick id="tanasub-taghayyurat" variant="rappel" compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">الامتداد الأفقي والارتفاع لكل درجة منقّطة:</p>}
                rows={[
                  { id: 's46', label: 'من 4 إلى 6', options: ['$2$ و $400$', '$2$ و $200$', '$6$ و $3200$'].map(Opt), correct: 0, correction: <MathText>{'$6 - 4 = 2$ و $3200 - 2800 = 400$'}</MathText> },
                  { id: 's610', label: 'من 6 إلى 10', options: ['$4$ و $1000$', '$4$ و $800$', '$10$ و $4000$'].map(Opt), correct: 1, correction: <MathText>{'$10 - 6 = 4$ و $4 \\times 200 = 800$'}</MathText> },
                  { id: 's1012', label: 'من 10 إلى 12', options: ['$2$ و $4400$', '$12$ و $400$', '$2$ و $400$'].map(Opt), correct: 2, correction: <MathText>{'$12 - 10 = 2$ و $4400 - 4000 = 400$'}</MathText> },
                  { id: 's1215', label: 'من 12 إلى 15', options: ['$3$ و $600$', '$3$ و $4800$', '$3$ و $200$'].map(Opt), correct: 0, correction: <MathText>{'$15 - 12 = 3$ و $3 \\times 200 = 600$'}</MathText> },
                ]}
                requires={['tanasub-taghayyurat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? ACTIVITY_LINES.fill : 'الارتفاع = الامتداد × 200 في كل درجة: راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
                  <MathText>{'ما العلاقة بين الارتفاع والامتداد في كل درجة أكملتها؟ المحور التالي يسأل: لماذا؟ وهل تكفي عددان وصورتاهما لمعرفة دالة تآلفية؟ مثال ذلك الدرجة سلسيوس والفهرنهايت.'}</MathText>
                </p>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
