import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM4, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_QCM4 } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : l'item 4 de « أؤكّد تعلّماتي » (p. 160, extraction › destinations › qcm, duplicatedIn ce درس : le
 * pentagone à côtés égaux et angles inégaux, figure reproduite) et quatre épreuves de la plateforme, sur d'autres nombres
 * que la leçon : l'horloge de la Grande Poste (12 → 30°, P2), un octogone (135°, P2), l'hexagone au compas (P3), le
 * pentagone par rotations de 72° (P3). Chaque épreuve évalue UN point ; P1–P3 couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, source, figure }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={source} /></span>
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
        muntazam: { label: 'المضلع المنتظم', module: 2 },
        zawaya: { label: 'الزاوية المركزية وزاوية المضلع', module: 3 },
        insha: { label: 'إنشاء مضلع منتظم', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'muntazam', requires: ['tarif-muntazam'],
          prompt: <Q source={QCM4.source} figure={FIG_QCM4}>{`${QCM4.text} (أضلاعه الخمسة مرمّزة متقايسة):`}</Q>,
          options: ['خماسي غير منتظم', 'خماسي منتظم', 'ليس خماسيا'],
          correct: 0, cols: 3,
          explain: <MathText>{QCM4.why}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mudalaat-muntazama_P1'] },
        },
        {
          id: 'E2', skill: 'zawaya', requires: ['markaziya-360'],
          prompt: <Q source={PLATFORM_SOURCE}>{'على ساعة البريد المركزي بالجزائر العاصمة، الأرقام 12 موزّعة بانتظام على دائرة مركزها O. قيس الزاوية المركزية بين رقمين متتاليين:'}</Q>,
          options: ['$30^\\circ$', '$15^\\circ$', '$150^\\circ$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$\\dfrac{360^\\circ}{12} = 30^\\circ$ . ($15^\\circ$ قسمة $180^\\circ$ ، و $150^\\circ$ زاوية المضلع ذي 12 ضلعا.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mudalaat-muntazama_P2'] },
        },
        {
          id: 'E3', skill: 'zawaya', requires: ['zawiyat-mudalla'],
          prompt: <Q source={PLATFORM_SOURCE}>{'حوض نافورة على شكل ثماني منتظم. قيس الزاوية بين ضلعين متتاليين منه:'}</Q>,
          options: ['$135^\\circ$', '$45^\\circ$', '$120^\\circ$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'الزاوية المركزية $\\dfrac{360^\\circ}{8} = 45^\\circ$ ، وزاوية الثماني $180^\\circ - 45^\\circ = 135^\\circ$ . ($120^\\circ$ زاوية السداسي.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mudalaat-muntazama_P2'] },
        },
        {
          id: 'E4', skill: 'insha', requires: ['dil-mudalla'],
          prompt: <Q source={PLATFORM_SOURCE}>{'لإنشاء سداسي منتظم رؤوسه على دائرة مركزها O ونصف قطرها $4\\,\\mathrm{cm}$ ، انطلاقا من نقطة A عليها:'}</Q>,
          options: [
            'نفتح المدور $4\\,\\mathrm{cm}$ ونقطع به الدائرة ست مرات انطلاقا من A',
            'نفتح المدور $8\\,\\mathrm{cm}$ (القطر) ونقطع به الدائرة ست مرات', // le diamètre : on ne coupe le cercle qu'au point diamétralement opposé
            'نفتح المدور $4\\sqrt{3}\\,\\mathrm{cm}$ ونقطع به الدائرة ست مرات', // r√3 : le côté du triangle équilatéral
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'في السداسي المنتظم الزاوية المركزية $60^\\circ$ ، فالمثلثات الستة متقايسة الأضلاع والضلع يساوي نصف القطر: $4\\,\\mathrm{cm}$ . ($4\\sqrt{3}$ ضلع المثلث المتقايس الأضلاع.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mudalaat-muntazama_P3'] },
        },
        {
          id: 'E5', skill: 'insha', requires: ['ruus-bidawaran'],
          prompt: <Q source={PLATFORM_SOURCE}>{'لإنشاء خماسي منتظم مركزه O انطلاقا من رأس A على دائرة مركزها O:'}</Q>,
          options: [
            'كل رأس صورة الذي قبله بالدوران الذي مركزه O وزاويته $72^\\circ$',
            'كل رأس صورة الذي قبله بالدوران الذي مركزه O وزاويته $108^\\circ$', // l'angle du pentagone, pas l'angle au centre
            'كل رأس صورة الذي قبله بالدوران الذي مركزه O وزاويته $36^\\circ$', // la moitié
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'خمسة دورانات متساوية تملأ الدورة: $5 \\times 72^\\circ = 360^\\circ$ . ($108^\\circ$ زاوية الخماسي، تُستعمل حول رأس لا حول O.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mudalaat-muntazama_P3'] },
        },
      ]}
      badges={[
        { id: 'muntazam', emoji: '⬡', label: 'المضلع المنتظم', test: (m) => (m.muntazam ?? 0) === 0 },
        { id: 'zawaya', emoji: '📐', label: 'الزوايا', test: (m) => (m.zawaya ?? 0) === 0 },
        { id: 'insha', emoji: '⭐', label: 'الإنشاء', test: (m) => (m.insha ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت المضلعات المنتظمة',
        title: 'انتهى الدرس 4',
        message: 'تعرف الآن أن رؤوس المضلع المنتظم ذي n ضلعا صور متتالية لرأس واحد بالدوران الذي زاويته 360 درجة على n، وتحسب زاويته وطول ضلعه، وتنشئه بالمدور أو بالدوران — ونجمة العلم منه.',
        verbs: ['أدوّر', 'أحسب', 'أنشئ', 'أرسم'],
        masterBadgeLabel: 'المضلع المنتظم',
      }}
    />
  );
}
