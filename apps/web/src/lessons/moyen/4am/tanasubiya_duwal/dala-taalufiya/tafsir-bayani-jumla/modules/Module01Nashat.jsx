import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { SourceTag, PairQuestion } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, ACT_FIGURE, HOOK, UNKNOWNS } from '../content/textbook';
import ClassFundVignette from '../components/ClassFundVignette';
import LinesFigure from '../components/LinesFigure';

/**
 * Module 1 — l'ENTRÉE : DEUX DROITES, UN POINT (line-crossing), UNE PISTE (rétrofit 2026-10-15).
 *
 * Le lab est EN TÊTE, sans carte, sans titre ni consigne de workspace (deux niveaux, UN instrument) :
 *   مبتدئ (par défaut) : deux faisceaux laser, 2x − y = 1 et x + y = 5 (plateforme) ;
 *   متقدم : la caisse de la classe, x + y = 43 et 100x + 200y = 5000 à écrire y = … (cartes refusées par un témoin), P promené
 *          jusqu'aux deux lampes, puis (bouton) les trois cas. Les essais (`onTrial`, deux niveaux) sont listés (`[data-activity-evidence]`).
 * ÉTAPES : 1 POURQUOI une seule lampe s'allume sur une droite ; 2 existe-t-il un point qui allume les deux, et lequel
 *   (2 جـ du livre), puis la brique tafsir-nashat APRÈS la réponse ; 3 le livre en APPLICATION : la carte de la caisse (43 pièces,
 *   5000DA) et sa traduction en système (س 1) ; 4 la nature de f et g, l'écriture de (2) (س 2 أ) ; 5 quelle droite pour quelle
 *   fonction (س 2 ب, la figure redessinée) ; 6 le sens dans la caisse (س 2 د).
 * AUCUNE étape n'attend `onFinished`. LP : P1 (s4), P2 (s2, s6), P3 (le lab, bouton « الحالات الثلاث »).
 * Les labs vivent dans l'`intro` (deux niveaux) : le rappel de « مسألة الدرس » ne vit qu'au sommaire (la مسألة se résout au module 4).
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Nashat() {
  const [forms, setForms] = useState([]);
  const [points, setPoints] = useState([]);
  const [cps, setCps] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de son étape l'est
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);

  const onTrial = (tr) => {
    if (tr.tk) return;   // un événement `checkpoint…` n'est pas un essai
    if (tr.kind === 'form') setForms((f) => [...f.filter((x) => x.tex !== tr.tex), tr]);
    if (tr.kind === 'point' && tr.stage !== 'cases') setPoints((p) => [...p.filter((x) => x.pair !== tr.pair), tr]);
  };

  const formsEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={forms.length ? 'true' : 'false'}>
      {forms.length === 0 ? (
        <p className="text-slate-500">لم تختر بعد أي كتابة على لوحة صندوق القسم (المستوى المتقدّم).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">الكتابات التي اخترتها:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="forms">
            {forms.slice(-8).map((tr) => (
              <li key={tr.tex} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tr.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
                ({tr.i}) <MathText>{`$${tr.tex}$`}</MathText> {tr.ok ? '✓' : '✗'}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const pointsEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={points.length ? 'true' : 'false'}>
      {points.length === 0 ? (
        <p className="text-slate-500">لم تضع النقطة P بعد على اللوحة: حرّكها أعلاه وراقب المصباحين.</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">النقط التي جرّبتها والمصابيح التي أضاءت:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="points">
            {points.slice(-10).map((tr) => (
              <li key={tr.pair} data-evidence-point={tr.pair} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-800">
                <bdi dir="ltr" className="font-mono">{tr.pair}</bdi>{' '}
                (1) <span className={tr.ok1 ? 'text-emerald-700' : 'text-slate-400'}>{tr.ok1 ? '●' : '○'}</span>{' '}
                (2) <span className={tr.ok2 ? 'text-emerald-700' : 'text-slate-400'}>{tr.ok2 ? '●' : '○'}</span>
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
      moduleTitle="نشاط 5 — صندوق القسم"
      moduleSubtitle="التفسير البياني لحل جملة معادلتين"
      estimatedTime="16 دقيقة"
      objectives={[
        'كيف نترجم شرطي الصندوق إلى معادلتين؟',
        'أيّ مستقيم يمثّل أيّ معادلة؟',
        'هل توجد نقطة تحقّق المعادلتين معًا؟',
        'ماذا تعني هذه النقطة في صندوق القسم؟',
      ]}
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="line-crossing"
                level="beginner"
                system="2x-y=1|x+y=5"
                theme="laser"
                title="شعاعا ليزر: جملة بأعداد صغيرة"
                onTrial={onTrial}
                onCheckpoint={onCheckpoint}
              />
            ),
            advanced: () => (
              <Manipulation
                type="line-crossing"
                level="advanced"
                system={ACTIVITY.system}
                cases="true"
                theme="coins"
                title="نشاط 5: 43 قطعة و 5000DA"
                lead={<MathText>{'اكتب الشرطين على الشكل $y = ax + b$ ، ثم ابحث عن نقطة تُضيء المصباحين معًا. جرّب أيضًا نقطًا على مستقيم واحد.'}</MathText>}
                onTrial={onTrial}
                onCheckpoint={onCheckpoint}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا يضيء مصباح واحد فقط؟', subtitle: 'ما رأيته على اللوحة', done: answered('probe'),
          content: (
            <div className="space-y-3">
              {pointsEvidence}
              <p data-checkpoint-trace="probe" data-tried={answered('probe') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('probe') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('probe')
                  ? 'أجبتَ في المختبر: مصباح واحد يضيء حين تحقّق إحداثيتا P معادلة مستقيم واحد، فتكون P على هذا المستقيم وحده.'
                  : 'أنجز مرحلة تحريك P على اللوحة (نقطة بمصباح واحد ثم نقطة بالمصباحين)، وأجب عن الأسئلة التي تظهر فوقها.'}
              </p>
            </div>
          ),
        },
        {
          num: 2, title: 'هل من نقطة تُضيء المصباحين؟', subtitle: 'وكم نقطة؟', done: q4,
          content: (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">على المنصّة، لوحة صندوق القسم (المستوى المتقدّم) هي الرسم على الورق المليمتري: كل عقدة من الشبكة نقطة إحداثياها عددان طبيعيان.</p>
              {pointsEvidence}
              <p data-checkpoint-trace="pair" data-tried={answered('probe') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('probe') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('probe')
                  ? <MathText>{'أجبتَ في المختبر: النقطة التي تُضيء المصباحين معًا هي نقطة تقاطع المستقيمين، وإحداثياها يحقّقان المعادلتين.'}</MathText>
                  : 'ابحث على اللوحة عن النقطة التي تُضيء المصباحين معًا، وأجب عن أسئلتها.'}
              </p>
              {answered('probe') && (
                <PairQuestion
                  prompt={<MathText>{'إحداثيتا نقطة تقاطع المستقيمين: $(x ; y)$ ='}</MathText>}
                  expected={ACTIVITY.answer}
                  requires={['tamthil-taalufi', 'thunaiya-hall']}
                  explain={<MathText>{'النقطة $(36 ; 7)$ على المستقيمين معًا: إذا وضعت $x = 36$ في المعادلة (1) وجدت $y = 43 - 36 = 7$ ، وفي المعادلة (2) وجدت $y = 25 - 18 = 7$ .'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
              {q4 && <KnowledgeBrick id="tafsir-nashat" lead="ما أضاءه المصباحان معًا، بالكلمات:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط الكتاب: شرطا الصندوق', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <div className="space-y-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-3" data-book-activity>
                <ClassFundVignette />
                <p className="text-sm text-slate-600"><MathText>{HOOK.text}</MathText></p>
                <p className="font-semibold text-slate-800"><MathText>{ACTIVITY.situation}</MathText></p>
                <p className="text-xs text-slate-600" data-platform-note="unknowns"><MathText>{UNKNOWNS.text}</MathText></p>
                <div className="flex flex-wrap gap-2"><SourceTag source={ACTIVITY.source} /><SourceTag source={HOOK.source} /></div>
              </div>
              <TapQuestion
                prompt="عدد القطع والمبلغ يُترجمان بالجملة:"
                options={[
                  '$\\begin{cases} x + y = 43 \\\\ 100x + 200y = 5000 \\end{cases}$',
                  '$\\begin{cases} x + y = 5000 \\\\ 100x + 200y = 43 \\end{cases}$',
                  '$\\begin{cases} x + y = 43 \\\\ 200x + 100y = 5000 \\end{cases}$',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['tarjama-jumla']}
                explain={<MathText>{`${ACTIVITY_LINES.model} أمّا $200x + 100y$ فيجعل لقطع 100DA ثمن 200DA؛ و $x + y = 5000$ يخلط بين عدد القطع والمبلغ.`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'ما طبيعة الدالتين؟', subtitle: 'السؤال 2 أ', done: q2,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[0]}</MathText></p>
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[1]}</MathText></p>
              <p className="text-xs text-slate-600"><MathText>{'نكتب أيضًا $f(x) = 43 - x$ و $g(x) = 25 - \\dfrac{1}{2}x$ : صورة العدد $x$ بكل دالة.'}</MathText></p>
              {formsEvidence}
              <BatchChoiceQuestion
                rows={[
                  { id: 'f', label: <MathText>{'$f : x \\longmapsto 43 - x$'}</MathText>, options: ['تآلفية وليست خطية', 'خطية', 'ليست تآلفية'], correct: 0, correction: <MathText>{'$f(x) = -x + 43$ : من الشكل $ax + b$ مع $b = 43 \\neq 0$.'}</MathText> },
                  { id: 'g', label: <MathText>{'$g : x \\longmapsto 25 - \\dfrac{1}{2}x$'}</MathText>, options: ['تآلفية وليست خطية', 'خطية', 'ليست تآلفية'], correct: 0, correction: <MathText>{'$g(x) = -\\dfrac{1}{2}x + 25$ : من الشكل $ax + b$ مع $b = 25 \\neq 0$.'}</MathText> },
                  { id: 'e2', label: <MathText>{'$100x + 200y = 5000$ تُكتب'}</MathText>, options: ['$y = 25 - \\dfrac{1}{2}x$', '$y = 5000 - 100x$', '$y = 25 + \\dfrac{1}{2}x$'].map(Opt), correct: 0, correction: <MathText>{ACTIVITY_LINES.eq2}</MathText> },
                ]}
                requires={['dala-taalufiya', 'azl-y']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'هذان هما مستقيما اللوحة: كل شرط صار دالة تآلفية.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'أيّ مستقيم لأيّ دالة؟', subtitle: 'السؤال 2 ب', done: q3,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[2]}</MathText></p>
              <LinesFigure testId="act-5" win={ACT_FIGURE.win} step={ACT_FIGURE.step} every={ACT_FIGURE.every} lines={ACT_FIGURE.lines} caption={ACT_FIGURE.caption} />
              <BatchChoiceQuestion
                rows={[
                  { id: 'd1', label: 'المستقيم (d₁) الذي يقطع محور التراتيب في 43', options: [<MathText key="f">{'$f$'}</MathText>, <MathText key="g">{'$g$'}</MathText>], correct: 0, correction: <MathText>{'$f(0) = 43$ : مستقيم $f$ يقطع محور التراتيب في $(0 ; 43)$.'}</MathText> },
                  { id: 'd2', label: 'المستقيم (d₂) الذي يقطع محور التراتيب في 25', options: [<MathText key="f">{'$f$'}</MathText>, <MathText key="g">{'$g$'}</MathText>], correct: 1, correction: <MathText>{'$g(0) = 25$ : مستقيم $g$ يقطع محور التراتيب في $(0 ; 25)$.'}</MathText> },
                ]}
                requires={['tamthil-taalufi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? <MathText>{ACTIVITY_LINES.match}</MathText> : 'راجع التصحيح تحت كل سطر: انظر أين يقطع كل مستقيم محور التراتيب.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 6, title: 'في صندوق القسم', subtitle: 'السؤالان 2 د و 1', done: q5,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[4]}</MathText></p>
              <TapQuestion
                prompt="إذن جمع التلاميذ:"
                options={[
                  '36 قطعة من 100DA و 7 قطع من 200DA',
                  '7 قطع من 100DA و 36 قطعة من 200DA',
                  '43 قطعة من 100DA و 25 قطعة من 200DA',
                ]}
                correct={0}
                cols={1}
                requires={['tafsir-nashat']}
                explain={<MathText>{`${ACTIVITY_LINES.meaning} ${ACTIVITY_LINES.check} أمّا 7 قطع من 100DA و 36 من 200DA فتعطي $700 + 7200 = 7900 \\neq 5000$ ، و 43 و 25 هما الترتيبان عند المبدأ لا حلّ.`}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && (
                <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
                  <MathText>{'ماذا حدث لكل شرط حين كتبته على الشكل $y = ax + b$ ؟ وأين وجدت الحل؟ وفي المستوى المتقدّم، هل جرّبت «الحالات الثلاث»؟ المحور التالي يسأل: هل لكل جملة حلّ؟ وكم حلًّا يمكن أن يكون لها؟'}</MathText>
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
