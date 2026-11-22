import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { src } from '../../_unit/unitMeta';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la
 * leçon. Cinq épreuves : les QCM 1, 2 et 3 de « أؤكّد تعلّماتي » (p. 40 —
 * extraction → destinations.qcm.duplicatedIn « nashr-tabsit » items 1–3),
 * une épreuve sur la définition (معارف 1, p. 34) et une sur la réduction
 * avec parenthèses précédées de − (le modèle de l'exercice 6, p. 37).
 * Chacune porte UN point d'apprentissage ; P1, P2, P3 et P4 sont tous couverts.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (tex) => <MathText key={tex}>{tex}</MathText>;

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
        taarif: { label: 'كتابة جداء على شكل مجموع', module: 1 },
        tawziiya: { label: 'ضرب عدد في مجموع أو فرق', module: 2 },
        qawsayn: { label: 'نشر جداء قوسين', module: 1 },
        tabsit: { label: 'التبسيط وحذف الأقواس', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'taarif', requires: ['nashr-taarif'],
          prompt: <Q source={src('know-1', 34, 'معارف', 1)}>العبارة <MathText>{'$A = x(x - 4)$'}</MathText> جداء. أيّ كتابة هي العبارة A على شكل مجموع (أو فرق)؟</Q>,
          options: [M('$x(x - 4)$'), M('$x^2 - 4x$'), M('$x^2 - 4$')],
          optionLabel: (i) => ['x(x − 4)', 'x² − 4x', 'x² − 4'][i],
          correct: 1, cols: 3,
          explain: <MathText>{'نشر A يعني كتابتها على شكل فرق: $x \\times x - x \\times 4 = x^2 - 4x$. أمّا $x(x - 4)$ فهي الجداء نفسه، و $x^2 - 4$ تنسى ضرب $x$ في 4.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nashr-tabsit_P1'] },
        },
        {
          id: 'E2', skill: 'tawziiya', requires: ['tawziiya-nashr'],
          prompt: <Q source={src('qcm', 40, 'أؤكّد تعلّماتي', 1)}>نشر الجداء <MathText>{'$2x(x + 2)$'}</MathText> هو ........</Q>,
          options: [M('$2x^2 + 2x$'), M('$2x^2 + 4x$'), M('$2x + 4x$')],
          optionLabel: (i) => ['2x² + 2x', '2x² + 4x', '2x + 4x'][i],
          correct: 1, cols: 3,
          explain: <MathText>{'$2x \\times x + 2x \\times 2 = 2x^2 + 4x$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nashr-tabsit_P2'] },
        },
        {
          id: 'E3', skill: 'tawziiya', requires: ['tawziiya-nashr'],
          prompt: <Q source={src('qcm', 40, 'أؤكّد تعلّماتي', 2)}>نشر الجداء <MathText>{'$(1 - x)(-x)$'}</MathText> هو ........</Q>,
          options: [M('$x^2 - x$'), M('$x + x^2$'), M('$1 - x^2$')],
          optionLabel: (i) => ['x² − x', 'x + x²', '1 − x²'][i],
          correct: 0, cols: 3,
          explain: <MathText>{'$1 \\times (-x) - x \\times (-x) = -x + x^2 = x^2 - x$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nashr-tabsit_P2'] },
        },
        {
          id: 'E4', skill: 'qawsayn', requires: ['nashr-qawsayn', 'tabsit'],
          prompt: <Q source={src('qcm', 40, 'أؤكّد تعلّماتي', 3)}>نشر الجداء <MathText>{'$(4 + x)(1 - x)$'}</MathText> هو ........</Q>,
          options: [M('$4 - x^2$'), M('$4 - 3x - x^2$'), M('$5 - x^2$')],
          optionLabel: (i) => ['4 − x²', '4 − 3x − x²', '5 − x²'][i],
          correct: 1, cols: 3,
          explain: <MathText>{'$4 - 4x + x - x^2 = 4 - 3x - x^2$: أربعة جداءات، ثم $-4x + x = -3x$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nashr-tabsit_P3'] },
        },
        {
          id: 'E5', skill: 'tabsit', requires: ['tabsit', 'nashr-qawsayn', 'hadhf-aqwas'],
          prompt: <Q source={src('ex-6', 37, 'أوظّف تعلّماتي', 6)}>بسّط العبارة <MathText>{'$B = 3(x - 1) - (x - 2)(x + 1)$'}</MathText>:</Q>,
          options: [M('$-x^2 + 2x - 5$'), M('$x^2 + 4x - 1$'), M('$-x^2 + 4x - 1$')],
          optionLabel: (i) => ['−x² + 2x − 5', 'x² + 4x − 1', '−x² + 4x − 1'][i],
          correct: 2, cols: 3,
          explain: <MathText>{'$(x - 2)(x + 1) = x^2 - x - 2$ ، ثم $3x - 3 - (x^2 - x - 2) = 3x - 3 - x^2 + x + 2 = -x^2 + 4x - 1$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nashr-tabsit_P4'] },
        },
      ]}
      badges={[
        { id: 'tawziiya', emoji: '✖️', label: 'أنشر جداء عدد في مجموع', test: (m) => (m.tawziiya ?? 0) === 0 },
        { id: 'tabsit', emoji: '🧹', label: 'أبسّط دون خطأ في الإشارات', test: (m) => (m.tabsit ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت نشر وتبسيط عبارة جبرية',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن كيف تكتب جداءً على شكل مجموع، وكيف تبسّطه. الدرس 2 ينشر جداءات شهيرة: مربّع مجموع، مربّع فرق، وجداء مجموع وفرق.',
        verbs: ['أميّز', 'أنشر', 'أبسّط', 'أتحقّق'],
        masterBadgeLabel: 'النشر والتبسيط',
      }}
    />
  );
}
