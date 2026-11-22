import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme « على منوال » les examens du 1er trimestre, avec des nombres jamais vus dans la leçon (déclarées) ; chaque
 * mauvaise option encode une erreur réelle (MISC-MUQKASR : NUMONLY — comparer les seuls numérateurs, BIGDEN — plus de parts = plus grand, REVERSED — ordre inversé, ONEWRONG). Chaque option fausse est FAUSSE
 * (recalculé dans content.test.js). E3 → P1 ; E2 → P2 ; E1, E4 → P3 ; E5 → P4.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={addition('exam_style_problem')} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;

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
        product: { label: 'مقارنة كسرين', module: 1 },
        natural: { label: 'عدد طبيعي في كسر', module: 2 },
        part: { label: 'كسر من كمية ومن الباقي', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'multiple', requires: ['tawhid-li-muqarana'],
          prompt: <Q>قارن <MathText>{'$\\frac{7}{12}$'}</MathText> و <MathText>{'$\\frac{2}{3}$'}</MathText> .</Q>,
          options: [M('$\\frac{7}{12}<\\frac{2}{3}$'), M('$\\frac{7}{12}>\\frac{2}{3}$'), M('$\\frac{7}{12}=\\frac{2}{3}$')],
          correct: 0, cols: 1,
          explain: <MathText>{'$12=3\\times 4$ : $\\frac{2}{3}=\\frac{8}{12}$ و $7<8$ ، إذن $\\frac{7}{12}<\\frac{2}{3}$ . (الخيار الثاني قارن البسطين وحدهما $7>2$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-kasrayn_P3'] },
        },
        {
          id: 'E2', skill: 'numerator', requires: ['nafs-al-bast'],
          prompt: <Q>ما أكبر الكسور: <MathText>{'$\\frac{4}{9}$'}</MathText> ، <MathText>{'$\\frac{4}{7}$'}</MathText> ، <MathText>{'$\\frac{4}{11}$'}</MathText> ؟</Q>,
          options: [M('$\\frac{4}{7}$'), M('$\\frac{4}{11}$'), M('$\\frac{4}{9}$')],
          correct: 0, cols: 3,
          explain: <MathText>{'البسط نفسه $4$ ، والأكبر هو الأصغر مقامًا: $7<9<11$ . ($\\frac{4}{11}$ اختيار من ظنّ أنّ الأكبر مقامًا هو الأكبر.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-kasrayn_P2'] },
        },
        {
          id: 'E3', skill: 'numerator', requires: ['nafs-al-maqam'],
          prompt: <Q>قارن <MathText>{'$\\frac{7{,}1}{6}$'}</MathText> و <MathText>{'$\\frac{7}{6}$'}</MathText> .</Q>,
          options: [M('$\\frac{7{,}1}{6}>\\frac{7}{6}$'), M('$\\frac{7{,}1}{6}<\\frac{7}{6}$'), M('$\\frac{7{,}1}{6}=\\frac{7}{6}$')],
          correct: 0, cols: 1,
          explain: <MathText>{'المقام نفسه $6$ ، فنقارن البسطين: $7{,}1>7$ ، إذن $\\frac{7{,}1}{6}>\\frac{7}{6}$ . (الخيار الثاني ظنّ أنّ البسط العشري أصغر؛ والثالث أهمل الفاصلة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-kasrayn_P1'] },
        },
        {
          id: 'E4', skill: 'multiple', requires: ['tartib-kusur'],
          prompt: <Q>رتّب تصاعديًا: <MathText>{'$\\frac{3}{4}$'}</MathText> ، <MathText>{'$\\frac{5}{8}$'}</MathText> ، <MathText>{'$\\frac{1}{2}$'}</MathText> .</Q>,
          options: [M('$\\frac{1}{2}<\\frac{5}{8}<\\frac{3}{4}$'), M('$\\frac{3}{4}<\\frac{5}{8}<\\frac{1}{2}$'), M('$\\frac{1}{2}<\\frac{3}{4}<\\frac{5}{8}$')],
          correct: 0, cols: 1,
          explain: <MathText>{'بالثمانيات: $\\frac{6}{8}$ ، $\\frac{5}{8}$ ، $\\frac{4}{8}$ ، فنرتّب $4<5<6$ . (الثاني ترتيب تنازلي؛ والثالث رتّب البسوط $1<3<5$ دون توحيد المقامات.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-kasrayn_P3'] },
        },
        {
          id: 'E5', skill: 'one', requires: ['muqarana-bi-1'],
          prompt: <Q>قارن <MathText>{'$\\frac{9}{7}$'}</MathText> و <MathText>{'$\\frac{8}{9}$'}</MathText> .</Q>,
          options: [M('$\\frac{9}{7}>\\frac{8}{9}$'), M('$\\frac{9}{7}<\\frac{8}{9}$'), M('$\\frac{9}{7}=\\frac{8}{9}$')],
          correct: 0, cols: 1,
          explain: <MathText>{'$\\frac{9}{7}>1$ لأنّ $9>7$ ، و $\\frac{8}{9}<1$ لأنّ $8<9$ ، فـ $\\frac{9}{7}>\\frac{8}{9}$ . (الخيار الثاني ظنّ أنّ $9$ مقام أكبر يعني كسرًا أكبر.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-kasrayn_P4'] },
        },
      ]}
      badges={[
        { id: 'multiple', emoji: '🫒', label: 'أوحّد المقامين وأرتّب', test: (m) => (m.multiple ?? 0) === 0 },
        { id: 'one', emoji: '📏', label: 'أقارن بالعدد 1', test: (m) => (m.one ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مقارنة كسرين',
        title: 'انتهى درس مقارنة كسرين',
        message: 'تعرف الآن أن تقارن كسرين وترتّب كسورًا، وتقارن كسرًا بالعدد 1. بعد هذا الدرس تأتي الوضعية الإدماجية للوحدة.',
        verbs: ['أقارن', 'أوحّد', 'أرتّب', 'أحكم'],
        masterBadgeLabel: 'مقارنة كسرين',
      }}
    />
  );
}
