import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM1, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_QCM1 } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : l'item 1 de « أؤكّد تعلّماتي » (p. 160, extraction › destinations › qcm, duplicatedIn ce درس), sa première
 * ligne CORRIGÉE (« صورة A » n'a aucune bonne réponse → « صورة B », C ; une ligne discrète le dit), et quatre épreuves de la
 * plateforme : le sens d'une horloge (P1), le demi-tour (P1), l'image d'une دائرة (P3), l'image d'une droite (P3). Chaque
 * épreuve évalue UN point ; P1–P3 couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, source, figure, note }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={source} /></span>
    {note && <span className="block text-xs text-slate-500"><MathText>{note}</MathText></span>}
    {figure && <GeoFigure {...figure} inline />}
  </span>
);

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="5 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        dawaran: { label: 'الدوران: مركز وزاوية واتجاه', module: 2 },
        nuqta: { label: 'صورة نقطة بدوران', module: 2 },
        ashkal: { label: 'صور القطعة والمستقيم والدائرة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'nuqta', requires: ['surat-nuqta'],
          prompt: <Q source={QCM1.source} figure={FIG_QCM1} note={QCM1.correction}>{`${QCM1.text}: صورة B هي`}</Q>,
          // C : 60° direct depuis B ; D : la confusion avec l'image de A dans l'autre sens ; B : rien n'a tourné
          options: ['C', 'D', 'B'],
          correct: 0, cols: 3,
          explain: <MathText>{'OB = OC (قطرا المستطيل متقايسان ومتناصفان) و $\\widehat{BOC} = 60^\\circ$ من B نحو C عكس اتجاه عقارب الساعة: صورة B هي C.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-dawaran_P2'] },
        },
        {
          id: 'E2', skill: 'dawaran', requires: ['ittijah'],
          prompt: <Q source={PLATFORM_SOURCE}>{'عقرب الدقائق في ساعة البريد المركزي يدور في 20 دقيقة من الرقم 12 إلى الرقم 4. هذا الدوران حول محور الساعة زاويته:'}</Q>,
          options: [
            '$120^\\circ$ في الاتجاه غير المباشر',
            // le sens inversé (MISC-DAWARAN-ITTIJAH)
            '$120^\\circ$ في الاتجاه المباشر',
            // 20 × 1° au lieu de 20 × 6°
            '$20^\\circ$ في الاتجاه غير المباشر',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'في 60 دقيقة دورة كاملة $360^\\circ$ ، ففي 20 دقيقة $120^\\circ$ ؛ والعقارب تدور في الاتجاه غير المباشر (السالب).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-dawaran_P1'] },
        },
        {
          id: 'E3', skill: 'dawaran', requires: ['nisf-dawra'],
          prompt: <Q source={PLATFORM_SOURCE}>{'النقطة K هي صورة النقطة L بالدوران الذي مركزه S وزاويته $180^\\circ$ . إذن:'}</Q>,
          options: [
            'S منتصف القطعة [LK]',
            // la symétrie axiale (MISC-DAWARAN-TANAZUR)
            'المستقيم المار بـ S محور القطعة [LK]',
            // le centre confondu avec l'image
            'K منتصف القطعة [LS]',
          ],
          correct: 0, cols: 1,
          explain: <MathText>{'الدوران الذي مركزه S وزاويته $180^\\circ$ هو التناظر بالنسبة إلى S: SK = SL والنقط L و S و K في استقامية، فـ S منتصف [LK].'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-dawaran_P1'] },
        },
        {
          id: 'E4', skill: 'ashkal', requires: ['suwar-ashkal'],
          prompt: <Q source={PLATFORM_SOURCE}>{'(𝒞) دائرة مركزها I ونصف قطرها $3\\,\\mathrm{cm}$ . صورتها بالدوران الذي مركزه O وزاويته $50^\\circ$ في الاتجاه المباشر هي:'}</Q>,
          options: [
            'الدائرة التي مركزها I′ صورة I ونصف قطرها $3\\,\\mathrm{cm}$',
            // le même centre (MISC-DAWARAN-DAIRA)
            'الدائرة التي مركزها I ونصف قطرها $3\\,\\mathrm{cm}$',
            // le rayon remplacé par OI (MISC-DAWARAN-DAIRA)
            'الدائرة التي مركزها I′ صورة I ونصف قطرها OI',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'ننشئ صورة المركز I، ونحتفظ بنصف القطر: صورة الدائرة دائرة مركزها I′ ونصف قطرها $3\\,\\mathrm{cm}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-dawaran_P3'] },
        },
        {
          id: 'E5', skill: 'ashkal', requires: ['suwar-ashkal'],
          prompt: <Q source={PLATFORM_SOURCE}>{'(d) مستقيم لا يشمل النقطة O، و E و F نقطتان مختلفتان من (d). لإنشاء صورة (d) بالدوران الذي مركزه O وزاويته $40^\\circ$ في الاتجاه غير المباشر:'}</Q>,
          options: [
            'ننشئ E′ و F′ صورتي E و F، فالصورة هي المستقيم (E′F′)',
            // la parallèle (MISC-DAWARAN-TAWAZI)
            'ننشئ E′ صورة E، فالصورة هي الموازي لـ (d) المار بـ E′',
            // O pris pour un point de l'image (MISC-DAWARAN-MARKAZ)
            'ننشئ E′ صورة E، فالصورة هي المستقيم (OE′)',
          ],
          correct: 0, cols: 1,
          explain: <MathText>{'صورة مستقيم بدوران مستقيم، وتكفي صورتا نقطتين مختلفتين منه. الصورة لا توازي (d) (تصنع معه زاوية $40^\\circ$)، ولا تمر بـ O لأن (d) لا تمر بـ O.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-dawaran_P3'] },
        },
      ]}
      badges={[
        { id: 'dawaran', emoji: '🎡', label: 'الدوران', test: (m) => (m.dawaran ?? 0) === 0 },
        { id: 'nuqta', emoji: '📍', label: 'صورة نقطة', test: (m) => (m.nuqta ?? 0) === 0 },
        { id: 'ashkal', emoji: '⭕', label: 'صور الأشكال', test: (m) => (m.ashkal ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مفهوم الدوران وإنشاء الصور',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن أن الدوران يتميّز بمركز وزاوية واتجاه، وأن صورة نقطة تبقى على نفس البعد من المركز وتدور بالزاوية المطلوبة في الاتجاه المطلوب، وأنك تبني صور القطعة والمستقيم والدائرة من صور نقط قليلة.',
        verbs: ['أدوّر', 'أقيس', 'أنشئ', 'أتحقّق'],
        masterBadgeLabel: 'الدوران',
      }}
    />
  );
}
