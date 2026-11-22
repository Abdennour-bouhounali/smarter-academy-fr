import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { QCM6 } from '../content/textbook';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : l'item 6 de « أؤكّد تعلّماتي » (p. 124) et quatre de la plateforme, sur d'AUTRES nombres que les
 * modules (√5/3 et 2/3 ; 8/17 ; 1/3 ; 2/7). Chaque épreuve évalue UN point d'apprentissage ; P1, P2 et P3 sont couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');
const Q = ({ children, source }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={source} /></span>
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
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        alaqat: { label: 'العلاقتان المثلثيتان', module: 2 },
        hisab: { label: 'نسبة من نسبة أخرى', module: 3 },
        insha: { label: 'إنشاء زاوية دون منقلة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'alaqat', requires: ['alaqatan'],
          prompt: <Q source={QCM6.source}>{QCM6.text}</Q>,
          options: QCM6.options.map(M),
          correct: 1, cols: 1,
          explain: <MathText>{'من $\\cos^2 x + \\sin^2 x = 1$ نطرح $\\sin^2 x$ من الطرفين: $\\cos^2 x = 1 - \\sin^2 x$ . (الأولى إشارتها معكوسة وتعطي عددًا سالبًا، والثالثة تنسى المربعين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_alaqat-muthallathiya_P1'] },
        },
        {
          id: 'E2', skill: 'alaqat', requires: ['alaqatan'],
          prompt: <Q source={PLATFORM}>{'x زاوية حادة حيث $\\sin x = \\dfrac{\\sqrt{5}}{3}$ و $\\cos x = \\dfrac{2}{3}$ . إذن $\\tan x$ يساوي:'}</Q>,
          options: ['$\\dfrac{\\sqrt{5}}{2}$', '$\\dfrac{2}{\\sqrt{5}}$', '$\\dfrac{2\\sqrt{5}}{9}$', '$\\dfrac{\\sqrt{5}}{3}$'].map(M),
          correct: 0, cols: 2,
          explain: <MathText>{'$\\tan x = \\dfrac{\\sin x}{\\cos x} = \\dfrac{\\sqrt{5}}{3} \\times \\dfrac{3}{2} = \\dfrac{\\sqrt{5}}{2}$ . ($\\dfrac{2}{\\sqrt{5}}$ مقلوبة، و $\\dfrac{2\\sqrt{5}}{9}$ ضرب بدل القسمة، و $\\dfrac{\\sqrt{5}}{3}$ هو الجيب نفسه.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_alaqat-muthallathiya_P1'] },
        },
        {
          id: 'E3', skill: 'hisab', requires: ['hisab-nisba'],
          prompt: <Q source={PLATFORM}>{'x زاوية حادة حيث $\\cos x = \\dfrac{8}{17}$ . القيمة المضبوطة للعدد $\\sin x$ هي:'}</Q>,
          options: ['$\\dfrac{15}{17}$', '$\\dfrac{9}{17}$', '$\\dfrac{225}{289}$', '$\\dfrac{17}{15}$'].map(M),
          correct: 0, cols: 4,
          explain: <MathText>{'$\\sin^2 x = 1 - \\dfrac{64}{289} = \\dfrac{225}{289}$ و $\\sin x = \\dfrac{15}{17}$ . ($\\dfrac{9}{17} = 1 - \\dfrac{8}{17}$ دون مربعات، و $\\dfrac{225}{289}$ نسي الجذر، و $\\dfrac{17}{15} > 1$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_alaqat-muthallathiya_P2'] },
        },
        {
          id: 'E4', skill: 'hisab', requires: ['hisab-nisba'],
          prompt: <Q source={PLATFORM}>{'x زاوية حادة حيث $\\cos x = \\dfrac{1}{3}$ . القيمة المضبوطة للعدد $\\tan x$ هي:'}</Q>,
          options: ['$2\\sqrt{2}$', '$\\dfrac{\\sqrt{2}}{4}$', '$2$', '$8$'].map(M),
          correct: 0, cols: 4,
          explain: <MathText>{'$\\sin^2 x = 1 - \\dfrac{1}{9} = \\dfrac{8}{9}$ فـ $\\sin x = \\dfrac{2\\sqrt{2}}{3}$ ، و $\\tan x = \\dfrac{2\\sqrt{2}}{3} \\div \\dfrac{1}{3} = 2\\sqrt{2}$ . ($\\dfrac{\\sqrt{2}}{4}$ مقلوبة، و 2 نسي الجذر، و 8 هو $\\tan^2 x$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_alaqat-muthallathiya_P2'] },
        },
        {
          id: 'E5', skill: 'insha', requires: ['insha-zawiya'],
          prompt: <Q source={PLATFORM}>{'لإنشاء زاوية حادة x حيث $\\cos x = \\dfrac{2}{7}$ دون منقلة، نرسم زاوية قائمة رأسها O ونعيّن على أحد ضلعيها النقطة A حيث $OA = 2$ ، ثم:'}</Q>,
          options: [
            <MathText key="a">{'نرسم الدائرة التي مركزها A ونصف قطرها 7 فتقطع الضلع الثاني في B ، و $x = \\widehat{OAB}$'}</MathText>,
            <MathText key="b">{'نرسم الدائرة التي مركزها A ونصف قطرها 7 فتقطع الضلع الثاني في B ، و $x = \\widehat{OBA}$'}</MathText>,
            <MathText key="c">{'نعيّن على الضلع الثاني النقطة B حيث $OB = 7$ ، و $x = \\widehat{OAB}$'}</MathText>,
            <MathText key="d">{'نرسم الدائرة التي مركزها A ونصف قطرها 1 فتقطع الضلع الثاني في B ، و $x = \\widehat{OAB}$'}</MathText>,
          ],
          correct: 0, cols: 1,
          explain: <MathText>{'عند A الضلع OA مجاور و AB وتر: $\\cos\\widehat{OAB} = \\dfrac{OA}{AB} = \\dfrac{2}{7}$ . (عند B يكون $\\dfrac{2}{7}$ هو الجيب؛ و OB = 7 على الضلع يعطي ظلا $\\dfrac{7}{2}$ ؛ ودائرة نصف قطرها 1 أقصر من OA فلا تقطع الضلع الثاني.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_alaqat-muthallathiya_P3'] },
        },
      ]}
      badges={[
        { id: 'alaqat', emoji: '🔗', label: 'العلاقتان', test: (m) => (m.alaqat ?? 0) === 0 },
        { id: 'hisab', emoji: '🧮', label: 'نسبة من نسبة', test: (m) => (m.hisab ?? 0) === 0 },
        { id: 'insha', emoji: '🪁', label: 'الإنشاء دون منقلة', test: (m) => (m.insha ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت العلاقات المثلثية والإنشاءات',
        title: 'انتهى الدرس 3',
        message: 'تعرف الآن العلاقتين بين النسب المثلثية لزاوية حادة وتبرهنهما، وتحسب نسبة من أخرى دون قيس الزاوية، وتنشئ زاوية علمت إحدى نسبها بالكوس والمسطرة والمدور.',
        verbs: ['أبرهن', 'أحسب', 'أنشئ', 'أتحقّق'],
        masterBadgeLabel: 'العلاقات المثلثية',
      }}
    />
  );
}
