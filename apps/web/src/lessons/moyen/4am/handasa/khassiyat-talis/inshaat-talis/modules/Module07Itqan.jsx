import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { QCM4 } from '../content/textbook';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : l'item 4 de « أؤكّد تعلّماتي » (p. 112 — trois réponses justes : une combinaison, ordre gardé)
 * et quatre de la plateforme, sur d'AUTRES nombres que les modules (5 parts, 4/3, 15/4, √5).
 * Chaque épreuve évalue UN point d'apprentissage ; P1 et P2 sont couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');
const Q = ({ children, source, figure }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={source} /></span>
    {figure && <GeoFigure {...figure} inline />}
  </span>
);

export default function Module07Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        taqsim: { label: 'تقسيم قطعة إلى قطع متقايسة', module: 1 },
        nisba: { label: 'نقطة تقسم قطعة بنسبة معلومة', module: 2 },
        tul: { label: 'إنشاء قطعة طولها معلوم', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'taqsim', requires: ['tabrir-taqsim'], keepOrder: true,
          prompt: (
            <Q source={QCM4.source} figure={QCM4.figure}>
              {`${QCM4.text} (1) ${QCM4.options[0]} ، (2) ${QCM4.options[1]} ، (3) ${QCM4.options[2]} . الصحيح:`}
            </Q>
          ),
          options: ['(1) فقط', '(1) و (2) فقط', '(1) و (3) فقط', '(1) و (2) و (3)'],
          correct: 3, cols: 2,
          explain: <MathText>{'التدريج منتظم: $\\dfrac{AM}{AB} = \\dfrac{3}{5}$ ، و (MN) // (BC) : حسب خاصية طالس $\\dfrac{AN}{AC} = \\dfrac{AM}{AB} = \\dfrac{NM}{CB} = \\dfrac{3}{5}$ ، والجداء المتصالب يعطي $5 \\times NM = 3 \\times CB$ . الثلاث صحيحة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_inshaat-talis_P1'] },
        },
        {
          id: 'E2', skill: 'taqsim', requires: ['taqsim-qitaa'],
          prompt: <Q source={PLATFORM}>لتقسيم قطعة [AB] إلى 5 قطع متقايسة، نعيّن على نصف مستقيم [Ax) خمس قطع متقايسة، ثم نصل بالنقطة B :</Q>,
          options: ['العلامة الخامسة', 'العلامة الرابعة', 'العلامة الأولى', 'أي علامة'],
          correct: 0, cols: 2,
          explain: 'نصل العلامة الخامسة بـ B ونرسم الموازيات المارّة بالعلامات الأربع الأخرى: رتبة العلامة الموصولة هي عدد القطع (الرابعة تعطي أربع قطع، والأولى لا تقسم شيئًا).',
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_inshaat-talis_P1'] },
        },
        {
          id: 'E3', skill: 'nisba', requires: ['nuqta-nisba'],
          prompt: <Q source={PLATFORM}>{'M نقطة من [AB] حيث $\\dfrac{MA}{MB} = \\dfrac{4}{3}$ . إذن $\\dfrac{AM}{AB}$ يساوي:'}</Q>,
          options: ['$\\dfrac{4}{7}$', '$\\dfrac{4}{3}$', '$\\dfrac{3}{7}$', '$\\dfrac{1}{4}$'].map(M),
          correct: 0, cols: 4,
          explain: <MathText>{'$AB = MA + MB$ : سبعة أجزاء و AM أربعة منها، $\\dfrac{AM}{AB} = \\dfrac{4}{7}$ . ($\\dfrac{4}{3}$ نسبة الجزأين، و $\\dfrac{3}{7}$ هي $\\dfrac{MB}{AB}$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_inshaat-talis_P1'] },
        },
        {
          id: 'E4', skill: 'tul', requires: ['insha-tul'],
          prompt: <Q source={PLATFORM}>{'نعيّن على نصف مستقيم [Ax) نقطتين C و D حيث $AC = 4$ و $AD = 5$ ، وعلى [Ay) نقطة E حيث $AE = 3$ ، ثم نرسم الموازي لـ (CE) المارّ بـ D فيقطع [Ay) في B. إذن AB يساوي:'}</Q>,
          options: ['$\\dfrac{15}{4}$', '$\\dfrac{12}{5}$', '$\\dfrac{20}{3}$', '$4$'].map(M),
          correct: 0, cols: 4,
          explain: <MathText>{'$\\dfrac{AC}{AD} = \\dfrac{AE}{AB}$ أي $\\dfrac{4}{5} = \\dfrac{3}{AB}$ ، فـ $4 \\times AB = 15$ و $AB = \\dfrac{15}{4}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_inshaat-talis_P2'] },
        },
        {
          id: 'E5', skill: 'tul', requires: ['tul-ghayr-natiq'],
          prompt: <Q source={PLATFORM}>{'[BC] وتر مثلث قائم ضلعا زاويته القائمة 1 و 2 ، فـ $BC = \\sqrt{5}$ . قسّمنا [BC] إلى 4 قطع متقايسة بالمسطرة غير المدرّجة والمدور وأخذنا 3 منها. طول القطعة الناتجة:'}</Q>,
          options: ['$\\dfrac{3\\sqrt{5}}{4}$', '$\\dfrac{3 \\times 5}{4}$', '$\\dfrac{4\\sqrt{5}}{3}$', '$\\dfrac{3}{4}$'].map(M),
          correct: 0, cols: 2,
          explain: <MathText>{'ثلاث قطع من أربع: $\\dfrac{3}{4} \\times \\sqrt{5} = \\dfrac{3\\sqrt{5}}{4}$ . (الثانية نسيت الجذر، والثالثة نسبة مقلوبة، والرابعة نسيت الطول.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_inshaat-talis_P2'] },
        },
      ]}
      badges={[
        { id: 'taqsim', emoji: '🧭', label: 'التقسيم المتقايس', test: (m) => (m.taqsim ?? 0) === 0 },
        { id: 'nisba', emoji: '⚖️', label: 'النسبة المعلومة', test: (m) => (m.nisba ?? 0) === 0 },
        { id: 'tul', emoji: '📏', label: 'الطول المعلوم', test: (m) => (m.tul ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الإنشاءات بخاصية طالس',
        title: 'انتهى الدرس 3',
        message: 'تقسم الآن قطعة مستقيم إلى قطع متقايسة أو بنسبة معلومة بالمسطرة غير المدرّجة والمدور، وتنشئ قطعة طولها معلوم، وتبرّر كل إنشاء بخاصية طالس.',
        verbs: ['أنقل', 'أصل', 'أوازي', 'أبرّر'],
        masterBadgeLabel: 'إنشاءات طالس',
      }}
    />
  );
}
