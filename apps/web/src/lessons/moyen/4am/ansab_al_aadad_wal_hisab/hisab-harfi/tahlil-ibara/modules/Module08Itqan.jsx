import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { src, addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la
 * leçon. Six épreuves : cinq items de « أؤكّد تعلّماتي » (p. 40 : 4, 6, 10, 11,
 * 12 — les items 5 et 9 sont formatifs au module 4) et une expression de la
 * plateforme sur le modèle de دوري الآن p. 35 (P1 : deux facteurs du premier
 * degré). Chaque épreuve évalue UN point d'apprentissage ; P1, P2, P3 sont
 * couverts. Les options sont celles du manuel ; chaque distracteur est faux.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="7 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        jidaa: { label: 'جداء عاملين من الدرجة الأولى', module: 3 },
        amil: { label: 'استخراج عامل مشترك', module: 2 },
        mutatabiqa: { label: 'التحليل بالمتطابقات الشهيرة', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'amil', requires: ['khassiya-tawziiya'],
          prompt: <Q source={src('qcm', 40, 'أؤكّد تعلّماتي', 4)}>تحليل العبارة <MathText>{'$ab + b$'}</MathText> هو ........</Q>,
          options: [M('$ab^2$'), M('$(a + 1)b$'), M('$2ab$')],
          correct: 1, cols: 3,
          explain: <MathText>{'$b$ عامل مشترك بين $ab$ و $b = b \\times 1$ : $ab + b = (a + 1)b$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tahlil-ibara_P2'] },
        },
        {
          id: 'E2', skill: 'amil', requires: ['khassiya-tawziiya'],
          prompt: <Q source={src('qcm', 40, 'أؤكّد تعلّماتي', 6)}>تحليل العبارة <MathText>{'$a - ab$'}</MathText> هو ........</Q>,
          options: [M('$a(1 - b)$'), M('$b(a - 1)$'), M('$-a^2b$')],
          correct: 0, cols: 3,
          explain: <MathText>{'$a$ عامل مشترك بين $a = a \\times 1$ و $ab$ : $a - ab = a(1 - b)$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tahlil-ibara_P2'] },
        },
        {
          id: 'E3', skill: 'jidaa', requires: ['tariqat-amil-mushtarak'],
          prompt: <Q source={addition('interaction_generation')}>اكتب العبارة <MathText>{'$(x + 4)(2x - 1) - (x + 4)(x - 3)$'}</MathText> على شكل جداء عاملين من الدرجة الأولى.</Q>,
          options: [M('$(x + 4)(x - 4)$'), M('$(x + 4)(3x - 4)$'), M('$(x + 4)(x + 2)$'), M('$(x + 4)(x - 2)$')],
          correct: 2, cols: 2,
          explain: <MathText>{'العامل المشترك $(x + 4)$ : $(x + 4)[(2x - 1) - (x - 3)] = (x + 4)(2x - 1 - x + 3) = (x + 4)(x + 2)$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tahlil-ibara_P1'] },
        },
        {
          id: 'E4', skill: 'mutatabiqa', requires: ['tahlil-mutatabiqat'],
          prompt: <Q source={src('qcm', 40, 'أؤكّد تعلّماتي', 10)}>العبارة <MathText>{'$x^2 + 10x + 25$'}</MathText> تحلل على الشكل</Q>,
          options: [M('$(x + 5)^2$'), M('$x^2 + 5^2$'), 'لا تقبل تحليلا'],
          correct: 0, cols: 3,
          explain: <MathText>{'$x^2 + 10x + 25 = x^2 + 2 \\times x \\times 5 + 5^2 = (x + 5)^2$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tahlil-ibara_P3'] },
        },
        {
          id: 'E5', skill: 'mutatabiqa', requires: ['tahlil-mutatabiqat'],
          prompt: <Q source={src('qcm', 40, 'أؤكّد تعلّماتي', 11)}>العبارة <MathText>{'$x^2 - 25$'}</MathText> تحلل على الشكل</Q>,
          options: [M('$(x - 5)^2$'), M('$(x - 5)(x + 5)$'), 'لا تقبل تحليلا'],
          correct: 1, cols: 3,
          explain: <MathText>{'$x^2 - 25 = x^2 - 5^2 = (x - 5)(x + 5)$ ، أما $(x - 5)^2 = x^2 - 10x + 25$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tahlil-ibara_P3'] },
        },
        {
          id: 'E6', skill: 'mutatabiqa', requires: ['tahlil-mutatabiqat'],
          prompt: <Q source={src('qcm', 40, 'أؤكّد تعلّماتي', 12)}>العبارة <MathText>{'$x^2 - 10x + 25$'}</MathText> تحلل على الشكل</Q>,
          options: [M('$(x - 5)(x + 5)$'), M('$(x - 5)^2$'), 'لا تقبل تحليلا'],
          correct: 1, cols: 3,
          explain: <MathText>{'$x^2 - 10x + 25 = x^2 - 2 \\times x \\times 5 + 5^2 = (x - 5)^2$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tahlil-ibara_P3'] },
        },
      ]}
      badges={[
        { id: 'amil', emoji: '🧩', label: 'العامل المشترك كاملًا', test: (m) => (m.amil ?? 0) === 0 },
        { id: 'mutatabiqa', emoji: '⚽', label: 'الملعب المربّع', test: (m) => (m.mutatabiqa ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت تحليل عبارة جبرية',
        title: 'انتهى الدرس 3',
        message: 'تعرف الآن كيف تكتب مجموعًا على شكل جداء: باستخراج عامل مشترك، أو بالتعرّف على متطابقة شهيرة.',
        verbs: ['أحلّل', 'أستخرج', 'أتعرّف', 'أتحقّق'],
        masterBadgeLabel: 'تحليل عبارة جبرية',
      }}
    />
  );
}
