import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { FINAL } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme : une الكفاءة principale par épreuve (P1 : l'écriture sans ×, P2 : trois substitutions dont
 * deux lettres et un décimal, P3 : le contre-exemple de « n × n = 2 × n »). Toutes les clés sont recalculées en arithmétique exacte dans ../content/content.test.js ; chaque distracteur y est vérifié FAUX.
 */
const PLATFORM = addition('final_test_item');
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;

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
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة، ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        write: { label: 'حذف إشارة الضرب', module: 2 },
        subst: { label: 'تعويض حرف في قاعدة بأقواس', module: 1 },
        two: { label: 'تعويض حرفين', module: 1 },
        decimal: { label: 'تعويض بقيمة عشرية', module: 1 },
        counter: { label: 'المثال المضادّ', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'write', requires: ['ibara-harfiya'],
          prompt: <Q source={PLATFORM}><MathText>{'نحذف إشارة الضرب في $6\\times t$ فنكتب:'}</MathText></Q>,
          options: ['$6t$', '$t6$', '$6+t$', '$t+6$'], correct: 0, cols: 2,
          explain: <MathText>{'نحذف الإشارة بين عدد وحرف ونكتب العدد قبل الحرف : $6\\times t=6t$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_tatbiq-qaida-harfiya_P1'] },
        },
        {
          id: 'E2', skill: 'subst', requires: ['awlawiya-qaida'],
          prompt: <Q source={PLATFORM}><MathText>{'قيمة العبارة $4\\times(a+3)$ من أجل $a=5$ هي:'}</MathText></Q>,
          options: ['$32$', '$23$', '$12$', '$20$'], correct: 0, cols: 2,
          explain: <MathText>{'ما بين القوسين أوّلًا : $4\\times(5+3)=4\\times 8=32$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_tatbiq-qaida-harfiya_P2'] },
        },
        {
          id: 'E3', skill: 'two', requires: ['qaida-tatbiq'],
          prompt: <Q source={PLATFORM}><MathText>{'قيمة العبارة $3x+2y$ من أجل $x=4$ و $y=5$ هي:'}</MathText></Q>,
          options: ['$22$', '$14$', '$59$', '$32$'], correct: 0, cols: 2,
          explain: <MathText>{'$3x+2y=3\\times 4+2\\times 5=12+10=22$ ؛ أمّا $59$ فيأتي من وضع العددين متجاورين : $34+25$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_tatbiq-qaida-harfiya_P2'] },
        },
        {
          id: 'E4', skill: 'decimal', requires: ['kull-mawdi'],
          prompt: <Q source={PLATFORM}><MathText>{'قيمة العبارة $2\\times(x+0{,}5)$ من أجل $x=3$ هي:'}</MathText></Q>,
          options: ['$7$', '$6{,}5$', '$3{,}5$', '$5$'], correct: 0, cols: 2,
          explain: <MathText>{'$2\\times(3+0{,}5)=2\\times 3{,}5=7$ ؛ أمّا $6{,}5$ فيأتي من ضرب $x$ وحده في $2$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_tatbiq-qaida-harfiya_P2'] },
        },
        {
          id: 'E5', skill: 'counter', requires: ['mithal-mudad'],
          prompt: <Q source={FINAL[4].source}><MathText>{'قال زميل : « $n\\times n=2\\times n$ دائمًا ». أيّ قيمة لـ $n$ تُثبت أنّه مخطئ؟'}</MathText></Q>,
          options: ['$n=3$', '$n=0$', '$n=2$', '$n=0$ أو $n=2$'], correct: 0, cols: 2,
          explain: <MathText>{'$3\\times 3=9$ بينما $2\\times 3=6$ : الجهتان مختلفتان ؛ أمّا من أجل $0$ و $2$ فتصحّ القاعدة ولا تثبت شيئًا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_tatbiq-qaida-harfiya_P3'] },
        },
      ]}
      badges={[
        { id: 'mubaddil', emoji: '🎛️', label: 'أضع القيمة في كلّ موضع', test: (m) => (m.subst ?? 0) === 0 && (m.two ?? 0) === 0 && (m.decimal ?? 0) === 0 },
        { id: 'mudad', emoji: '🔎', label: 'أجد المثال المضادّ', test: (m) => (m.write ?? 0) === 0 && (m.counter ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت تطبيق قاعدة حرفية',
        title: 'انتهى درس تطبيق قاعدة حرفية',
        message: 'تعرف الآن أنّ تطبيق قاعدة حرفية يعني وضع قيمة كلّ حرف في كلّ موضع يظهر فيه ثمّ الحساب بالأولويات، وأنّ الضرب المخفيّ يبقى ضربًا (⁦2x⁩ من أجل ⁦x = 3⁩ هي ⁦2 × 3 = 6⁩ وليست 23)، وأنّ مثالًا مضادًّا واحدًا يكفي لإسقاط قاعدة تدّعي أنّها صحيحة دائمًا.',
        verbs: ['أضع', 'أحسب', 'أختبر'],
        masterBadgeLabel: 'قاعدة حرفية',
      }}
    />
  );
}
