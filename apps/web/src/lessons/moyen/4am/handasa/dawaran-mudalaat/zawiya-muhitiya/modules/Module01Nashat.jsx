import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, LAB } from '../content/textbook';
import { FIG_ACT4, FIG_ACT4_MEZIAN } from '../content/figures';
import ShootingVignette from '../components/ShootingVignette';

/**
 * Module 1 — نشاط 4 (p. 153), ouvert sur L'ANGLE DE TIR (inscribed-angle).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : le نشاط 4) : D sur le grand arc ; مزيان (D au bout du diamètre, les deux égalités du manuel avec
 *          les nombres de l'élève, la relation CHOISIE), هوارية (trois D, O dans l'angle et hors de l'angle), le D intérieur
 *          de l'exercice 12 (l'angle qui n'est pas inscrit) ;
 *   مبتدئ : le tireur dans la surface de réparation, un PARI sur l'angle de tir à partir de l'angle au centre 120°, puis le même
 *          angle (60°) depuis tout le grand arc, refusé dedans / dehors.
 * UNDERSTAND  les questions du نشاط 4 sous les essais de l'élève (`onTrial`, `[data-activity-evidence]`) ; les briques
 *           « تسمية » (le texte du نشاط 4) et « المركزية ضعف المحيطية » (sa conclusion).
 * RÉTROFIT 2026-10-15 (§4ter–§4quinquies) : plus de carte `brief` ni de `title` / `lead` d'atelier au-dessus du labo (la vignette du tireur et
 * la situation du livre passent à l'étape 1) ; la brique `alaqa-nashat` vient APRÈS « هل هوارية على صواب؟ ».
 * AUCUNE étape n'attend `onFinished`. LP : P1 (central / inscrit), P2 (la moitié).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const onTrial = (ev) => {
    if (!ev || ev.tk) return;
    if (['major', 'diameter', 'interior'].includes(ev.kind) || (ev.kind === 'relation' && ev.ok)) setTrials((s) => [...s, ev].slice(-10));
  };
  const mezian = trials.find((t) => t.kind === 'diameter');
  const relation = trials.some((t) => t.kind === 'relation');
  const houaria = trials.filter((t) => t.kind === 'major' && t.stage === 'houaria');
  const inner = trials.find((t) => t.kind === 'interior');

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">لم تضع بعد النقطة D في المستوى «متقدم» (نشاط 4).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">قياساتك في نشاط 4:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="act4">
            {mezian && <li className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900" data-evidence-item="mezian"><MathText>{`[AD] قطر: $\\widehat{ADB} = ${mezian.angle.replace(',', '{,}')}^\\circ$ ، $\\widehat{AOB} = ${mezian.central}^\\circ$`}</MathText></li>}
            {relation && <li className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900" data-evidence-item="relation"><MathText>{'اخترت: $\\widehat{AOB} = 2\\widehat{ADB}$'}</MathText></li>}
            {houaria.map((t, i) => (
              <li key={`h${i}`} className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-900" data-evidence-item="houaria">
                <MathText>{`D عند $${t.t}^\\circ$ : $\\widehat{ADB} = ${t.angle.replace(',', '{,}')}^\\circ$`}</MathText>
              </li>
            ))}
            {inner && <li className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-900" data-evidence-item="interior"><MathText>{`D داخل الدائرة: $\\approx ${inner.angle.replace(',', '{,}')}^\\circ$`}</MathText></li>}
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
      moduleTitle="نشاط 4 — زاوية التسديد"
      moduleSubtitle="الرامي يتحرّك على الدائرة: هل تتغيّر زاوية التسديد؟"
      estimatedTime="17 دقيقة"
      objectives={["هل تتغيّر زاوية التسديد حين يتحرّك الرامي على الدائرة؟", "ما العلاقة بين زاويتين رأساهما المركز ونقطة من الدائرة؟", "ماذا يحدث إن خرج الرامي عن الدائرة أو دخل فيها؟"]}
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="inscribed-angle"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="football"
                lead="القائمان A و B على دائرة مركزها O مرسومة على العشب. اللوحة تعطيك الزاوية المركزية فقط."
              />
            ),
            advanced: () => (
              <Manipulation
                type="inscribed-angle"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="football"
                lead={<MathText>{'(𝒞) دائرة مركزها O، و A و B نقطتان منها. D نقطة من (𝒞) خارج القوس الملونة $\\overset{\\frown}{AB}$ .'}</MathText>}
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'نشاط 4: رأسا الزاويتين', subtitle: 'الزاوية المركزية والزاوية المحيطية', done: q1,
          content: (
            <div className="space-y-3">
              <ShootingVignette />
              <p className="text-sm font-semibold text-slate-800">{ACTIVITY.situation} <SourceTag source={ACTIVITY_LINES.source} /></p>
              <TextbookBox kind="situation" text={ACTIVITY.intro} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT4} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">ماذا تلاحظ؟</p>}
                rows={[
                  { id: 'O', label: <MathText>{'رأس الزاوية $\\widehat{AOB}$'}</MathText>, options: ['مركز الدائرة O', 'نقطة من الدائرة', 'نقطة خارج الدائرة'], correct: 0, correction: <MathText>{ACTIVITY_LINES.vertexO}</MathText> },
                  { id: 'D', label: <MathText>{'رأس الزاوية $\\widehat{ADB}$'}</MathText>, options: ['نقطة من الدائرة، وضلعاها وتران', 'مركز الدائرة', 'نقطة داخل الدائرة'], correct: 0, correction: <MathText>{ACTIVITY_LINES.vertexD}</MathText> },
                ]}
                requires={['anasir-daira']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: رأس الأولى المركز، ورأس الثانية على الدائرة.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tasmiya" lead="هذا ما يسمّيه الكتاب:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 4: قول مزيان', subtitle: 'السؤال 1 أ، ب', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part1} source={ACTIVITY.source} compact />
              {evidence}
              <GeoFigure {...FIG_ACT4_MEZIAN} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">[AD] قطر في (𝒞):</p>}
                rows={[
                  {
                    id: 'iso', label: <MathText>{'لماذا $2\\widehat{BAD} + \\widehat{AOB} = 180^\\circ$ ؟'}</MathText>,
                    options: [
                      'المثلث AOB متساوي الساقين ($OA = OB$) و $\\widehat{OAB} = \\widehat{BAD}$',
                      'المثلث AOB قائم في O', // l'angle AOB vaut 100° sur la figure, pas 90°
                      'لأن $\\widehat{AOB} = 90^\\circ$', // faux : 100°
                    ].map(M),
                    correct: 0, correction: <MathText>{ACTIVITY_LINES.isosceles}</MathText>,
                  },
                  {
                    id: 'right', label: <MathText>{'لماذا $\\widehat{ADB} + \\widehat{BAD} = 90^\\circ$ ؟'}</MathText>,
                    options: [
                      'المثلث ABD قائم في B لأن [AD] قطر',
                      'المثلث ABD متساوي الساقين', // AB ≠ BD sur la figure (40° ≠ 50°)
                      'لأن $\\widehat{AOB} = 180^\\circ$', // AOB = 100°
                    ].map(M),
                    correct: 0, correction: <MathText>{ACTIVITY_LINES.right}</MathText>,
                  },
                  {
                    id: 'deduce', label: 'ب) استنتج',
                    options: [
                      '$\\widehat{AOB} = 2\\widehat{ADB}$',
                      '$\\widehat{AOB} = \\dfrac{1}{2}\\widehat{ADB}$', // le sens inversé (MISC-MUHITIYA-DIF)
                      '$\\widehat{AOB} = \\widehat{ADB} + 90^\\circ$', // 50 + 90 = 140 ≠ 100
                    ].map(M),
                    correct: 0, correction: <MathText>{`${ACTIVITY_LINES.deduce} ${ACTIVITY_LINES.example}`}</MathText>,
                  },
                ]}
                requires={['mutasawi-saqayn', 'qaim-nisf-daira', 'tasmiya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: قول مزيان صحيح، كما وجدت في المرحلة الأولى من اللوحة.' : 'راجع التصحيح تحت كل سطر، وقارن بالمساواتين في اللوحة.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط 4: قول هوارية', subtitle: 'السؤال 2', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part2} source={ACTIVITY.source} compact />
              {evidence}
              {/* Rétrofit 2026-10-15 : la question d'abord (ses mesures suffisent), la brique « ما وجدته » après la réponse. */}
              <TapQuestion
                prompt="هل هوارية على صواب؟"
                options={[
                  'نعم: قياساتي في مواضع مختلفة على القوس الكبير تؤيّد قولها',
                  'لا: العلاقة صحيحة فقط إذا كان [AD] قطرا', // réfuté par les D de هوارية
                  'لا: قيس $\\widehat{ADB}$ يتغيّر مع موضع D', // réfuté : 50° partout
                ].map(M)}
                correct={0}
                cols={1}
                requires={['tasmiya']}
                explain={<MathText>{ACTIVITY_LINES.houaria}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="alaqa-nashat" lead="ما وجدته في النشاط:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
