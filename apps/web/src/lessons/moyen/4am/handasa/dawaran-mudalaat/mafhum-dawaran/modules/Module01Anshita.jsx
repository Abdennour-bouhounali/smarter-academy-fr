import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, ACTIVITY_2, ACTIVITY_3, ACTIVITY_3_LINES, LAB } from '../content/textbook';
import {
  FIG_ACT1, FIG_ACT2_STEPS, FIG_ACT3_SEG, FIG_ACT3_SEG_SOL, FIG_ACT3_LINE1, FIG_ACT3_LINE1_SOL, FIG_ACT3_LINE2, FIG_ACT3_LINE2_SOL,
  FIG_ACT3_RAY, FIG_ACT3_RAY_SOL, FIG_ACT3_CIRCLE, FIG_ACT3_CIRCLE_SOL,
} from '../content/figures';

/**
 * Module 1 — أنشطة 1, 2, 3 (pp. 152–153), ouvert sur LA GRANDE ROUE DE BEN AKNOUN (rotation-dial).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : les نشاطان 2 et 3) : la feuille, le compas et la منقلة ; un point par 70°, puis une قطعة et
 *          une دائرة par 72° — aucun voyant pendant le geste ;
 *   مبتدئ : la roue à six nacelles ; chaque rotation (60°, 120°) est demandée dans LES DEUX sens (le jumeau horaire est le
 *          contraste), l'image posée sur un nœud exact, refusée en nommant la condition qui manque.
 * UNDERSTAND  نشاط 1 (le papier calque, deux symétries puis le « tour ») ; la brique « نقطة وصورتها » ; نشاط 2 (les
 *           étapes du شريط, l'image de B) sous les essais de l'élève (`onTrial`, `[data-activity-evidence]`) ; نشاط 3 (قطعة،
 *           مستقيم dans ses deux cas — figures rattachées à leur cas —, نصف مستقيم، دائرة), la figure solution après la réponse.
 * RÉTROFIT 2026-10-15 (§4quater) : plus de `brief` (la carte « العجلة الدوّارة » + l'énoncé de ACTIVITY) ni de `title`/`lead` sur le workspace ;
 * le labo (la roue) ouvre la page, son contexte (le parc de Ben Aknoun) est la `lead` de la roue. Le نشاط 1 du manuel (trois
 * formes, papier calque) n'est plus l'entrée mais l'APPLICATION qui suit la roue (étape 1 : évidence `onFinished` de la roue,
 * jamais bloquante). Les briques / figures-solutions étaient déjà après leur réponse.
 * PROTOTYPE DU LABO (2026-10-28, lot 3) : `rotation-dial` pose ses questions PAR-DESSUS le labo après chaque tâche (roue) ou mission (feuille) — `RotationDial › chainOf` ;
 * la dernière suite finit par la règle (ce qui déclenche `onFinished`) ; les événements `checkpoint` (qui portent aussi `ok`) sont écartés de la liste des images.
 * AUCUNE étape n'attend `onFinished`. LP : P1 (le دوران), P2 (l'image d'un point), P3 (les images de figures).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const PRIME = (s) => String(s ?? '').replace(/'/g, '′');
const SENSE = { direct: '↺', indirect: '↻' };

export default function Module01Anshita() {
  const [trials, setTrials] = useState([]);
  const [wheelDone, setWheelDone] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const [q6, setQ6] = useState(false);

  const onTrial = (ev) => { if (ev && ev.ok && !ev.tk) setTrials((s) => [...s, ev].slice(-10)); };

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">لم تبنِ بعد أي صورة على الورقة (المستوى «متقدم»).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">صورك المقبولة:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="images">
            {trials.map((t) => (
              <li key={t.n} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900" data-evidence-image={t.name}>
                <bdi dir="ltr" className="font-mono">{`${t.from} ↦ ${PRIME(t.name)} : ${t.alpha}° ${SENSE[t.direction] ?? ''}`}</bdi>
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
      moduleTitle="أنشطة 1 و 2 و 3 — العجلة الدوّارة"
      moduleSubtitle="كل مقصورة تدور حول نفس المحور، بنفس الزاوية: ما هذه الحركة؟"
      estimatedTime="20 دقيقة"
      objectives={["ما الذي يجب أن أعرفه لأحدّد مكان وصول مقصورة بعد دوران؟", "كيف أنشئ صورة نقطة بالمدور والمنقلة؟", "ماذا تصبح قطعة ومستقيم ونصف مستقيم ودائرة بعد الدوران؟"]}
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="rotation-dial"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="ferris-wheel"
                title="العجلة الدوّارة: أين تصل المقصورة؟"
                lead={<MathText>{'في حديقة التسلية ببن عكنون تدور العجلة الكبيرة حول محورها، وكل مقصورة ترسم دائرة. ست مقصورات من A إلى F، بين كل مقصورتين متجاورتين $60^\\circ$ . كل دوران يُطلب في الاتجاهين.'}</MathText>}
                onFinished={() => setWheelDone(true)}
              />
            ),
            advanced: () => (
              <Manipulation
                type="rotation-dial"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="ferris-wheel"
                title="نشاطان 2 و 3: بالمدور والمنقلة، 70 و 72 درجة"
                lead={<MathText>{'نقطة بزاوية $70^\\circ$ (نشاط 2)، ثم قطعة ودائرة بزاوية $72^\\circ$ (نشاط 3)، كلها في الاتجاه المباشر حول $O$ .'}</MathText>}
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'نشاط 1: هل يكفي تناظران أو انسحاب؟', subtitle: 'من العجلة إلى الورقة', done: q1,
          content: (
            <div className="space-y-3">
              <p className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence="wheel" data-tried={wheelDone ? 'true' : 'false'}>
                {wheelDone
                  ? <span className="font-bold text-slate-800">أنهيت مهام العجلة وأجبت عن أسئلتها: وضعت صورة كل مقصورة في الاتجاهين.</span>
                  : <span className="text-slate-500">لم تنهِ العجلة بعد (المستوى «مبتدئ»): ضع الصورة التي تصل إليها كل مقصورة، في الاتجاهين، قبل أن تنتقل إلى الورقة.</span>}
              </p>
              <TextbookBox kind="situation" text={`${ACTIVITY.intro} ${ACTIVITY.part1}`} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT1} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  // une translation garde l'orientation (le cornet n'est pas retourné) ; une symétrie centrale le mettrait tête en bas
                  { id: 'a', label: <MathText>{'أ) من (F) إلى $(F_1)$'}</MathText>, options: ['تناظر محوري (المستقيم الشاقولي المار بـ O)', 'انسحاب', 'تناظر مركزي بالنسبة إلى O'], correct: 0, correction: <MathText>{ACTIVITY_LINES.f1}</MathText> },
                  { id: 'b', label: <MathText>{'ب) من $(F_1)$ إلى (F′)'}</MathText>, options: ['تناظر محوري (المستقيم المائل المار بـ O)', 'انسحاب', 'تناظر محوري (المستقيم الأفقي المار بـ O)'], correct: 0, correction: <MathText>{ACTIVITY_LINES.f2}</MathText> },
                  { id: 'c', label: 'جـ) من (F) إلى (F′) مباشرة', options: ['لا بتناظر محوري واحد ولا بانسحاب: يلزم «تدوير» حول O', 'نعم، بانسحاب واحد', 'نعم، بتناظر محوري واحد'], correct: 0, correction: ACTIVITY_LINES.f3 },
                ]}
                requires={['tanazur-mihwari']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: تناظران متتاليان حول O يعطيان حركة جديدة.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 1: الورق الشفاف', subtitle: 'السؤال 2', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.part2} ${ACTIVITY.naming} ${ACTIVITY.part2b}`} source={ACTIVITY.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">بعد تدوير الورق الشفاف حول O في اتجاه حركة عقارب الساعة:</p>}
                rows={[
                  { id: 'pt', label: 'النقطة A تنطبق على', options: ["A′", "B′", "C′"], correct: 0, correction: ACTIVITY_LINES.points },
                  // OA′ ≠ OA : la distance au centre ne change pas (le calque tourne autour d'une aiguille)
                  { id: 'len', label: 'الطولان OA و OA′', options: ['متساويان', 'OA′ أطول', 'OA′ أقصر'], correct: 0, correction: <MathText>{ACTIVITY_LINES.lengths}</MathText> },
                  { id: 'ang', label: <MathText>{"$\\widehat{AOA'}$ و $\\widehat{BOB'}$ و $\\widehat{COC'}$"}</MathText>, options: ['متساوية، قيس كل منها $90^\\circ$', 'مختلفة: الأبعد عن O يدور أكثر', 'متساوية، قيس كل منها $180^\\circ$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.angles}</MathText> },
                  { id: 'end', label: 'نتحصّل على (F′) انطلاقا من (F) بـ', options: ['الدوران الذي مركزه O وزاويته $90^\\circ$ في اتجاه حركة عقارب الساعة', 'التناظر الذي مركزه O', 'الدوران الذي مركزه O وزاويته $90^\\circ$ عكس اتجاه عقارب الساعة'].map(M), correct: 0, correction: <MathText>{ACTIVITY.closing}</MathText> },
                ]}
                requires={['mudawwar']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: كل النقط دارت حول O بنفس الزاوية، وبقيت على نفس البعد منه.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="dawaran-tajribi" lead="ما وجدته بالورق الشفاف، بكلمات الكتاب:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط 2: إنشاء صورة نقطة', subtitle: 'الأسئلة 1 و 2 و 3', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY_2.intro} ${ACTIVITY_2.part1} ${ACTIVITY_2.part3}`} source={ACTIVITY_2.source} compact />
              <div className="grid grid-cols-2 gap-2" data-act2-strip>
                {FIG_ACT2_STEPS.map((f, i) => (
                  <div key={f.ariaLabel} className="rounded-xl border border-slate-200 bg-white p-1 text-center">
                    <GeoFigure {...f} />
                    <span className="text-xs font-bold text-slate-600"><bdi dir="ltr">{`(${i + 1})`}</bdi></span>
                  </div>
                ))}
              </div>
              {evidence}
              <TapQuestion
                prompt="1) ترتيب مراحل الإنشاء التي يعرضها الشريط:"
                options={[
                  'الدائرة التي مركزها O وتشمل A ← المنقلة على O وصفرها على [OA) ← نصف المستقيم بزاوية $70^\\circ$ ← نقطة التقاطع A′',
                  // la دائرة de centre A : le centre confondu avec le point (MISC-DAWARAN-MARKAZ)
                  'الدائرة التي مركزها A وتشمل O ← المنقلة على A ← نصف المستقيم بزاوية $70^\\circ$ ← نقطة التقاطع A′',
                  // la منقلة posée en A : l'angle mesuré ailleurs qu'au centre (MISC-DAWARAN-RAS-ZAWIYA)
                  'المنقلة على A وصفرها على [AO) ← نصف المستقيم بزاوية $70^\\circ$ ← A′ على بعد OA من A',
                ].map(M)}
                correct={0}
                cols={1}
                requires={['dawaran-tajribi']}
                explain={<MathText>{ACTIVITY_2.steps.join(' ')}</MathText>}
                onAnswered={() => {}}
              />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">3) صورة نقطة أخرى B بنفس الدوران (كما بنيتها على الورقة):</p>}
                rows={[
                  { id: 'r', label: 'البعد', options: ["$OB' = OB$", "$OB' = OA$", "$BB' = OB$"].map(M), correct: 0, correction: 'B′ على الدائرة التي مركزها O وتشمل B.' },
                  { id: 'a', label: 'الزاوية', options: ["$\\widehat{BOB'} = 70^\\circ$ في نفس الاتجاه", "$\\widehat{BOB'} = 70^\\circ$ في الاتجاه المعاكس", "$\\widehat{OBB'} = 70^\\circ$"].map(M), correct: 0, correction: <MathText>{ACTIVITY_2.answer3}</MathText> },
                ]}
                requires={['dawaran-tajribi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نفس البرنامج لكل نقطة — دائرة مركزها O، ثم الزاوية في الاتجاه المطلوب.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'نشاط 3 أ: صورة قطعة', subtitle: 'زاوية 72 درجة في الاتجاه المباشر', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY_3.intro} ${ACTIVITY_3.segment}`} source={ACTIVITY_3.source} compact />
              <GeoFigure {...FIG_ACT3_SEG} />
              <TapQuestion
                prompt="صورة القطعة [AB] بهذا الدوران:"
                options={[
                  "القطعة [A′B′] حيث A′ و B′ صورتا A و B، و $A'B' = AB$",
                  // la parallèle : la rotation ne garde pas la direction (MISC-DAWARAN-TAWAZI)
                  'قطعة توازي [AB] تمر بالنقطة A′',
                  // la longueur change avec la distance à O (MISC-DAWARAN-KHAWAS)
                  "القطعة [A′B′] لكن $A'B' > AB$ لأنها أبعد عن O",
                ].map(M)}
                correct={0}
                cols={1}
                requires={['dawaran-tajribi']}
                explain={<MathText>{ACTIVITY_3_LINES.segment}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <GeoFigure {...FIG_ACT3_SEG_SOL} />}
            </div>
          ),
        },
        {
          num: 5, title: 'نشاط 3 ب: صورة مستقيم', subtitle: 'الحالتان، وقول غنيمة', done: q5,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY_3.line1} source={ACTIVITY_3.source} compact />
              <GeoFigure {...FIG_ACT3_LINE1} />
              <TextbookBox kind="situation" text={ACTIVITY_3.line2} source={ACTIVITY_3.source} compact />
              <GeoFigure {...FIG_ACT3_LINE2} />
              <p className="text-xs text-slate-500" data-correction>{ACTIVITY_3.reattached}</p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'o', label: 'الحالة الأولى: صورة O', options: ['O نفسها', 'نقطة أخرى على (d)', 'نقطة على بعد OA من O'], correct: 0, correction: 'O مركز الدوران: صورته O نفسها.' },
                  { id: 'd1', label: 'الحالة الأولى: صورة (d)', options: ["المستقيم (OA′)، يصنع مع (d) زاوية $72^\\circ$", 'المستقيم (d) نفسه', 'مستقيم يوازي (d) ويمر بـ A′'].map(M), correct: 0, correction: <MathText>{ACTIVITY_3_LINES.line1}</MathText> },
                  { id: 'g', label: 'الحالة الثانية: هل توافق غنيمة؟', options: ['نعم: صورتا نقطتين مختلفتين من (d) تكفيان، والصورة المستقيم (A′B′)', 'لا: يلزم إنشاء صور كل نقط (d)', 'لا: صورة (d) توازي (d)، تكفي نقطة واحدة'], correct: 0, correction: <MathText>{ACTIVITY_3_LINES.line2}</MathText> },
                ]}
                requires={['dawaran-tajribi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: صورة مستقيم مستقيم، ونقطتان تعيّنانه.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && (
                <div className="grid gap-2 grid-cols-2">
                  <GeoFigure {...FIG_ACT3_LINE1_SOL} />
                  <GeoFigure {...FIG_ACT3_LINE2_SOL} />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 6, title: 'نشاط 3 جـ و د: نصف مستقيم ودائرة', subtitle: 'نفس الدوران', done: q6,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY_3.ray} ${ACTIVITY_3.circle}`} source={ACTIVITY_3.source} compact />
              <div className="grid gap-2 grid-cols-2">
                <GeoFigure {...FIG_ACT3_RAY} />
                <GeoFigure {...FIG_ACT3_CIRCLE} />
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر (تذكّر دائرتك في المستوى «متقدم»):</p>}
                rows={[
                  // [B′A′) : l'origine n'est plus l'image de l'origine ; (A′B′) : une droite entière
                  { id: 'ray', label: 'صورة نصف المستقيم [Ax)', options: ['نصف المستقيم [A′B′)', 'نصف المستقيم [B′A′)', 'المستقيم (A′B′)'], correct: 0, correction: ACTIVITY_3_LINES.ray },
                  // le même centre W ; un autre rayon (MISC-DAWARAN-DAIRA)
                  { id: 'circle', label: 'صورة الدائرة (𝒞)', options: ['الدائرة التي مركزها W′ ونصف قطرها WA', 'الدائرة التي مركزها W ونصف قطرها W′A′', 'الدائرة التي مركزها W′ ونصف قطرها OW'], correct: 0, correction: ACTIVITY_3_LINES.circle },
                ]}
                requires={['dawaran-tajribi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نبني صور نقط قليلة جيدة الاختيار — المبدأ، المركز — ثم نرسم.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ6(true)}
              />
              {q6 && (
                <div className="grid gap-2 grid-cols-2">
                  <GeoFigure {...FIG_ACT3_RAY_SOL} />
                  <GeoFigure {...FIG_ACT3_CIRCLE_SOL} />
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
