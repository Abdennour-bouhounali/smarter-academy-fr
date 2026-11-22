import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PLATFORM_SOURCE } from '../content/textbook';
import { FIG_E4 } from '../content/figures';

/**
 * Module 8 — إختبار أولي (ancien module 5, renuméroté après les trois « مسائل ») (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Le manuel n'assigne aucun item de
 * « أؤكّد تعلّماتي » à ce درس : cinq épreuves de la plateforme, aux nombres neufs (rien du laboratoire, de la طريقة ni
 * des exercices) — les conservations (P1 : E1, E3), prouver par un دوران (P2 : E2, E5), construire une image (P3 : E4).
 * Chaque épreuve évalue UN point ; tous les distracteurs sont faux (figures.test.js recalcule E4).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, figure }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={PLATFORM_SOURCE} /></span>
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
        khawas: { label: 'خواص الدوران', module: 2 },
        ithbat: { label: 'الإثبات بدوران', module: 3 },
        inshaa: { label: 'إنشاء صورة شكل', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'khawas', requires: ['khawas-dawaran'],
          prompt: <Q>{"A′B′C′ صورة المثلث ABC بالدوران الذي مركزه O وزاويته $70^\\circ$ في الاتجاه المباشر، حيث $AB = 5$ و $\\widehat{ABC} = 40^\\circ$ ومساحة ABC تساوي 12. إذن:"}</Q>,
          options: [
            "$A'B' = 5$ و $\\widehat{A'B'C'} = 40^\\circ$ ومساحة A′B′C′ تساوي 12",
            "$A'B' = 5$ و $\\widehat{A'B'C'} = 110^\\circ$ ومساحة A′B′C′ تساوي 12", // + 70°
            "$A'B' = 5$ و $\\widehat{A'B'C'} = 40^\\circ$ ومساحة A′B′C′ لا تُعرف دون قياس", // l'aire est conservée
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'الدوران يحافظ على الأطوال والزوايا والمساحات: لا تتغيّر أي قيمة، مهما كانت زاوية الدوران.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_khawas-dawaran_P1'] },
        },
        {
          id: 'E2', skill: 'ithbat', requires: ['istimal-khawas', 'zawiya-sura'],
          prompt: <Q>{'ABE و ACF مثلثان قائمان في A ومتساويا الساقين، حيث E صورة B و F صورة C بالدوران الذي مركزه A وزاويته $90^\\circ$ في الاتجاه المباشر. أي استنتاج صحيح؟'}</Q>,
          options: [
            '$BC = EF$ و $(BC) \\perp (EF)$',
            '$BC = EF$ و $(BC) \\parallel (EF)$', // MISC-DAWARAN-TAWAZI
            '$EF = 2BC$ و $(BC) \\perp (EF)$', // la longueur doublée
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'[EF] صورة [BC] بالدوران الذي مركزه A وزاويته $90^\\circ$ : الدوران يحافظ على الأطوال فـ $BC = EF$ ، وصورة مستقيم بدوران زاويته $90^\\circ$ تعامده.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_khawas-dawaran_P2'] },
        },
        {
          id: 'E3', skill: 'khawas', requires: ['zawiya-sura'],
          prompt: <Q>{"(d′) صورة المستقيم (d) بالدوران الذي مركزه O وزاويته $180^\\circ$ ، و O لا تنتمي إلى (d). إذن (d′) و (d):"}</Q>,
          options: ['متوازيان', 'متعامدان', 'متقاطعان في O'],
          correct: 0, cols: 3,
          explain: <MathText>{'الدوران الذي زاويته $180^\\circ$ هو التناظر بالنسبة إلى O: صورة مستقيم توازيه (ولا ينطبق عليه لأن O ليست عليه).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_khawas-dawaran_P1'] },
        },
        {
          id: 'E4', skill: 'inshaa', requires: ['surat-zawiya'],
          prompt: <Q figure={FIG_E4}>{'على الورقة المرصوفة، صورة المثلث OAB بالدوران الذي مركزه O وزاويته $90^\\circ$ في الاتجاه غير المباشر هي المثلث OA′B′. النقطة B′ هي:'}</Q>,
          options: ['K', 'L', 'N'],
          correct: 0, cols: 3, keepOrder: true,
          explain: <MathText>{'من B: ثلاثة مربعات يمينا ومربع نحو الأعلى؛ نديرها مع عقارب الساعة حول O: مربع يمينا وثلاثة نحو الأسفل، أي K. (L صورتها في الاتجاه المباشر، و N صورتها بزاوية $180^\\circ$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_khawas-dawaran_P3'] },
        },
        {
          id: 'E5', skill: 'ithbat', requires: ['markaz-dawaran'],
          prompt: <Q>{'A′ و B′ صورتا A و B بدوران مركزه مجهول، ومحورا [AA′] و [BB′] متقاطعان. مركز الدوران هو:'}</Q>,
          options: [
            'نقطة تقاطع محوري [AA′] و [BB′]',
            'منتصف القطعة [AA′]', // seulement équidistant de A et A′
            'نقطة تقاطع المستقيمين (AA′) و (BB′)', // pas équidistant en général
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'المركز على نفس البعد من A و A′ (على محور [AA′]) ومن B و B′ (على محور [BB′]).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_khawas-dawaran_P2'] },
        },
      ]}
      badges={[
        { id: 'khawas', emoji: '🔄', label: 'خواص الدوران', test: (m) => (m.khawas ?? 0) === 0 },
        { id: 'ithbat', emoji: '📐', label: 'الإثبات بدوران', test: (m) => (m.ithbat ?? 0) === 0 },
        { id: 'inshaa', emoji: '🌸', label: 'إنشاء صورة', test: (m) => (m.inshaa ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت خواص الدوران وتوظيفها',
        title: 'انتهى الدرس 2',
        message: 'تعرف الآن أن الدوران يحافظ على الأطوال والاستقامية والزوايا والمساحات، وأن المستقيم وصورته يصنعان زاوية الدوران، فتثبت بدوران تقايس قطعتين وتعامدهما، وتجد مركز دوران بمحورين.',
        verbs: ['أدير', 'أقارن', 'أثبت', 'أنشئ'],
        masterBadgeLabel: 'الدوران',
      }}
    />
  );
}
