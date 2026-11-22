import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, AIDS, CHALLENGE, NATURE, LAB } from '../content/textbook';
import FlagStarFigure from '../components/FlagStarFigure';
import { FIG_ACT5, FIG_ACT5_SOL, FIG_CHALLENGE_SOL } from '../content/figures';

/**
 * Module 1 — التحدّي (p. 151, l'ENTRÉE du درس) et نشاط 5 (p. 153), ouvert sur LA FORGE DE POLYGONES (polygon-forge).
 *
 * REAL      l'étoile du drapeau peinte en tifo dans les tribunes (le تحدّ : deux pointes consécutives à 10 cm) et la
 *           نجمة البحر du مدخل الباب (doublon déclaré) ;
 * DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : le تحدّ) : trouver l'angle des cinq pointes, puis le rayon (deux pointes à 10,00 cm), puis
 *          tracer les branches ;
 *   مبتدئ : l'alvéole d'une ruche de Kabylie — l'angle qui referme un hexagone (départ à 50° : la figure ne se ferme pas).
 * UNDERSTAND  la brique « الرؤوس صور بالدوران » sous les tours de l'élève (`onTrial`, `[data-activity-evidence]`) et
 *           une question qui l'applique (40° → 9 sommets) ; le نشاط 5 (MPN : trois زوايا مركزية de 120°, la rotation
 *           P ↦ M) ; le تحدّ résolu (72°, R ≈ 8,51 cm, la branche ≈ 16,18 cm) et sa construction.
 * RÉTROFIT 2026-10-15 (§4ter–§4quinquies) : plus de carte `brief` au-dessus du labo, plus de `title` / `lead` d'atelier ; le labo
 * ouvre le module, la brique `ruus-bidawaran` vient APRÈS la question, le tifo / la نجمة البحر / la lecture du تحدّ sont à l'étape 4.
 * AUCUNE étape n'attend `onFinished`. LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const OUTCOME = {
  closed: 'انغلقت', other: 'انغلقت', flat: 'قطعة', open: 'لا تنغلق', star: 'نجمة بعد دورتين', spiral: 'لا تنغلق',
};

export default function Module01Tahaddi() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const onTrial = (ev) => {
    if (!ev || ev.tk) return;
    setTrials((s) => [...s.filter((x) => !(x.kind === ev.kind && x.alpha === ev.alpha && x.mode === ev.mode && x.verdict === ev.verdict && x.radius === ev.radius)), ev].slice(-10));
  };

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">لم تدوّر بعد أي رأس في الورشة (المستويان «مبتدئ» و«متقدم»).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">محاولاتك في الورشة:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="turns">
            {trials.map((t) => (
              <li key={`${t.mode}-${t.kind}-${t.alpha ?? t.radius}-${t.verdict ?? t.outcome}`}
                className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${(t.outcome === 'closed' || t.outcome === 'other' || t.verdict === 'ok' || t.kind === 'star') ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}
                data-evidence-turn={t.outcome ?? t.verdict ?? t.kind}>
                {t.kind === 'turn' && <MathText>{`$\\alpha = ${t.alpha}^\\circ$ : ${OUTCOME[t.outcome]}${t.n ? ` بعد ${t.n} صور` : ''}`}</MathText>}
                {t.kind === 'radius' && <MathText>{`$R = ${t.radius.replace(',', '{,}')}\\,\\mathrm{cm}$ : $AB \\approx ${t.chord.replace(',', '{,}')}\\,\\mathrm{cm}$`}</MathText>}
                {t.kind === 'star' && <span>رسمت فروع النجمة الخمسة</span>}
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
      moduleTitle="التحدّي ونشاط 5 — نجمة العلم وخلية النحل"
      moduleSubtitle="رؤوس متساوية البعد عن مركز واحد: كيف ننشئها؟"
      estimatedTime="16 دقيقة"
      objectives={["متى تنغلق حلقة الرؤوس المدوَّرة مضلعًا؟", "ما الزاوية المركزية التي تعطي مثلثًا متقايس الأضلاع؟", "كيف أنشئ نجمة العلم؟"]}
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="polygon-forge"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="honeycomb"
                lead="خلية النحل سداسية. كل رأس جديد صورة الذي قبله بالدوران الذي مركزه O، وبنفس الزاوية α في كل مرة."
                onTrial={onTrial}
              />
            ),
            advanced: () => (
              <Manipulation
                type="polygon-forge"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="flag-star"
                lead="نجمة العلم على دائرة مركزها O: رأسان متتاليان على بعد 10 cm، ثلاث مراحل."
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'عند أيّ زاوية تنغلق الحلقة؟', subtitle: 'من محاولاتك في الورشة', done: q1,
          content: (
            <div className="space-y-3">
              {evidence}
              <TapQuestion
                prompt={<MathText>{'في الورشة رأيت الحلقة تنغلق عند بعض الزوايا فقط. لو دوّرت رأسا حول O بالدوران الذي زاويته $40^\\circ$ مرة بعد مرة، فبعد كم صورة تعود الصورة إلى الرأس الأول، أي كم رأسا للمضلع المنتظم؟'}</MathText>}
                options={['$9$', '$8$', '$4{,}5$'].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{`$9 \\times 40^\\circ = 360^\\circ$ : الصورة التاسعة هي الرأس الأول، فالمضلع تساعي منتظم. ($8 \\times 40^\\circ = 320^\\circ$ لا يكمل الدورة، و $4{,}5$ يأتي من قسمة $180^\\circ$ : ${AIDS.why180})`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="ruus-bidawaran" lead="ما رأيته عند كل دوران، بكلمات واضحة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 5: المثلث المتقايس الأضلاع في دائرته', subtitle: 'الأسئلة أ و ب', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.intro} ${ACTIVITY.a} ${ACTIVITY.b}`} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT5} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'الزاوية المحيطية $\\widehat{NMP}$ قيسها $60^\\circ$ (زاوية مثلث متقايس الأضلاع). اختر لكل سطر:'}</MathText></p>}
                rows={[
                  { id: 'nop', label: <MathText>{'الزاوية المركزية $\\widehat{NOP}$ التي تحصر مع $\\widehat{NMP}$ نفس القوس'}</MathText>, options: ['$120^\\circ$', '$60^\\circ$', '$30^\\circ$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.a}</MathText> },
                  { id: 'others', label: <MathText>{'الزاويتان المركزيتان $\\widehat{MON}$ و $\\widehat{POM}$'}</MathText>, options: ['$120^\\circ$ لكل منهما', '$60^\\circ$ لكل منهما', '$90^\\circ$ و $150^\\circ$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.b}</MathText> },
                ]}
                requires={['muhitiya-markaziya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? 'أحسنت: ثلاث زوايا مركزية متقايسة تملأ الدورة: $3 \\times 120^\\circ = 360^\\circ$ .' : 'الزاوية المركزية ضعف الزاوية المحيطية التي تحصر معها نفس القوس: راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط 5: الدوران الذي يحوّل P إلى M', subtitle: 'السؤال جـ', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.c} source={ACTIVITY.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'center', label: 'مركز الدوران', options: ['O', 'M', 'N'], correct: 0, correction: 'OP = OM: نقطتا الدائرة على نفس البعد من مركزها O.' },
                  { id: 'angle', label: 'زاويته واتجاهه', options: ['$120^\\circ$ في الاتجاه المباشر', '$60^\\circ$ في الاتجاه المباشر', '$120^\\circ$ في الاتجاه غير المباشر'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.c}</MathText> },
                  { id: 'imgM', label: 'صورة M بهذا الدوران', options: ['N', 'P', 'M'], correct: 0, correction: <MathText>{'من M نتقدّم $120^\\circ$ في الاتجاه المباشر فنصل إلى N.'}</MathText> },
                  { id: 'imgN', label: 'صورة N بهذا الدوران', options: ['P', 'M', 'N'], correct: 0, correction: 'ومن N نصل إلى P: المثلث صورة نفسه.' },
                ]}
                requires={['surat-nuqta-dawaran']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: كما في الورشة، كل رأس صورة الذي قبله بنفس الدوران.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <GeoFigure {...FIG_ACT5_SOL} />}
              {q3 && <KnowledgeBrick id="muthallath-120" lead="ما وجدته في نشاط 5:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'التحدّي: نجمة العلم', subtitle: 'الزاوية ونصف القطر والفرع', done: q4,
          content: (
            <div className="space-y-3">
              <FlagStarFigure compact />
              <TextbookBox kind="situation" text={CHALLENGE.text} source={CHALLENGE.source} compact />
              <p className="text-sm text-slate-600">{NATURE.text} <SourceTag source={NATURE.source} /></p>
              <p className="text-xs text-slate-500" data-reading><MathText>{CHALLENGE.reading}</MathText></p>
              <p className="text-sm text-slate-700">في المستوى «متقدم» رسمت النجمة بنفسك: أجب من محاولاتك.</p>
              {evidence}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'angle', label: 'زاوية الدوران التي تنقل رأسا من النجمة إلى الرأس الذي يليه', options: ['$72^\\circ$', '$36^\\circ$', '$108^\\circ$'].map(M), correct: 0, correction: <MathText>{'خمسة رؤوس تملأ الدورة: $\\dfrac{360^\\circ}{5} = 72^\\circ$ . ($36^\\circ$ نصفها، و $108^\\circ$ زاوية الخماسي لا الزاوية المركزية.)'}</MathText> },
                  { id: 'radius', label: 'نصف قطر الدائرة', options: ['$R \\approx 8{,}51\\,\\mathrm{cm}$', '$R = 10\\,\\mathrm{cm}$', '$R \\approx 6{,}18\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{`${CHALLENGE.radius} ؛ $R = 10$ يصحّ للسداسي فقط، و $6{,}18$ يأتي من جيب التمام بدل الجيب.`}</MathText> },
                  { id: 'branch', label: 'طول الفرع [AC] من النجمة', options: ['$\\approx 16{,}18\\,\\mathrm{cm}$', '$10\\,\\mathrm{cm}$', '$\\approx 8{,}51\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{CHALLENGE.branch}</MathText> },
                ]}
                requires={['ruus-bidawaran', 'nisab-muthallathiya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: رفعت التحدّي.' : 'راجع التصحيح تحت كل سطر، وعد إلى مراحل النجمة في الورشة.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <div className="space-y-2" data-challenge-solution>
                  <GeoFigure {...FIG_CHALLENGE_SOL} />
                  <ol className="list-decimal space-y-1 ps-5 text-sm text-slate-800">
                    {CHALLENGE.construction.map((l) => <li key={l}><MathText>{l}</MathText></li>)}
                  </ol>
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
