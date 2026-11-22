import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { src } from '../../_unit/unitMeta';

/**
 * Module 9 — إختبار أولي (module 6 avant les « مسائل », 2026-10-06) (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la
 * leçon. Cinq épreuves tirées du manuel : QCM 7 de « أؤكّد تعلّماتي » (p. 28),
 * exercices 18, 26 et 22 (p. 27), طريقة « نسبة مقامها عدد غير ناطق » (p. 25).
 * Chaque épreuve évalue UN point d'apprentissage ; P1, P2, P3 sont couverts.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module09Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="7 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        asghar: { label: 'أبسط كتابة لجذر', module: 1 },
        tawzii: { label: 'تبسيط مجموع جذور', module: 2 },
        nisba: { label: 'نسبة مقامها عدد ناطق', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'asghar', requires: ['kitaba-a-jidhr-b'],
          prompt: <Q source={src('qcm', 28, 'أؤكّد تعلّماتي', 7)}>العدد <MathText>{'$\\sqrt{3^2 \\times 7}$'}</MathText> يكتب على الشكل .....</Q>,
          options: [M('$3 \\times 7$'), M('$3\\sqrt{7}$'), M('$3^2 \\times 7^2$')],
          correct: 1, cols: 1,
          explain: <MathText>{'$\\sqrt{3^2 \\times 7} = \\sqrt{3^2} \\times \\sqrt{7} = 3\\sqrt{7}$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tawzif-khawass-judhur_P1'] },
        },
        {
          id: 'E2', skill: 'asghar', requires: ['kitaba-a-jidhr-b'],
          prompt: <Q source={src('ex-18', 27, 'أوظّف تعلّماتي', 18)}>اكتب <MathText>{'$\\sqrt{75}$'}</MathText> على الشكل <MathText>{'$a\\sqrt{b}$'}</MathText> حيث <MathText>{'$b$'}</MathText> أصغر ما يمكن.</Q>,
          options: [M('$25\\sqrt{3}$'), M('$3\\sqrt{5}$'), M('$5\\sqrt{3}$'), M('$15\\sqrt{5}$')],
          correct: 2, cols: 2,
          explain: <MathText>{'أكبر مربع يقسم 75 هو 25: $\\sqrt{75} = \\sqrt{5^2 \\times 3} = 5\\sqrt{3}$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tawzif-khawass-judhur_P1'] },
        },
        {
          id: 'E3', skill: 'tawzii', requires: ['kitaba-a-jidhr-b', 'tabsit-tawzii'],
          prompt: <Q source={src('ex-26', 27, 'أوظّف تعلّماتي', 26)}>كتابة مبسطة للعدد <MathText>{'$A = 2\\sqrt{12} - 4\\sqrt{3} + \\sqrt{75} - \\sqrt{147}$'}</MathText> هي:</Q>,
          options: [M('$-2\\sqrt{3}$'), M('$2\\sqrt{3}$'), M('$-4\\sqrt{3}$'), M('$-6\\sqrt{3}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$A = 4\\sqrt{3} - 4\\sqrt{3} + 5\\sqrt{3} - 7\\sqrt{3} = (4 - 4 + 5 - 7)\\sqrt{3} = -2\\sqrt{3}$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tawzif-khawass-judhur_P2'] },
        },
        {
          id: 'E4', skill: 'nisba', requires: ['naqt-maqam'],
          prompt: <Q source={src('ex-22', 27, 'أوظّف تعلّماتي', 22)}>اكتب <MathText>{'$\\dfrac{2}{\\sqrt{3}}$'}</MathText> على شكل نسبة مقامها عدد ناطق.</Q>,
          options: [M('$\\dfrac{2}{3}$'), M('$\\dfrac{2\\sqrt{3}}{9}$'), M('$2\\sqrt{3}$'), M('$\\dfrac{2\\sqrt{3}}{3}$')],
          correct: 3, cols: 2,
          explain: <MathText>{'$\\dfrac{2}{\\sqrt{3}} = \\dfrac{2 \\times \\sqrt{3}}{\\sqrt{3} \\times \\sqrt{3}} = \\dfrac{2\\sqrt{3}}{3}$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tawzif-khawass-judhur_P3'] },
        },
        {
          id: 'E5', skill: 'nisba', requires: ['naqt-maqam'],
          prompt: <Q source={src('method-rationalize', 25, 'طرائق')}>اكتب <MathText>{'$\\dfrac{\\sqrt{7}}{2\\sqrt{5}}$'}</MathText> على شكل نسبة مقامها عدد ناطق.</Q>,
          options: [M('$\\dfrac{\\sqrt{35}}{5}$'), M('$\\dfrac{\\sqrt{35}}{10}$'), M('$\\dfrac{\\sqrt{7}}{10}$'), M('$\\dfrac{\\sqrt{35}}{20}$')],
          correct: 1, cols: 2,
          explain: <MathText>{'$\\dfrac{\\sqrt{7} \\times \\sqrt{5}}{2\\sqrt{5} \\times \\sqrt{5}} = \\dfrac{\\sqrt{35}}{2 \\times 5} = \\dfrac{\\sqrt{35}}{10}$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tawzif-khawass-judhur_P3'] },
        },
      ]}
      badges={[
        { id: 'asghar', emoji: '🧱', label: 'أكبر مربّع يقسم العدد', test: (m) => (m.asghar ?? 0) === 0 },
        { id: 'nisba', emoji: '➗', label: 'مقام ناطق', test: (m) => (m.nisba ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت توظيف خواص الجذور التربيعية',
        title: 'انتهى الدرس 5',
        message: 'تعرف الآن كيف تكتب جذرًا في أبسط شكل، وكيف تجمع جذورًا متشابهة، وكيف تجعل مقام نسبة عددًا ناطقًا.',
        verbs: ['أكتب', 'أبسّط', 'أحوّل', 'أنشر'],
        masterBadgeLabel: 'توظيف خواص الجذور',
      }}
    />
  );
}
