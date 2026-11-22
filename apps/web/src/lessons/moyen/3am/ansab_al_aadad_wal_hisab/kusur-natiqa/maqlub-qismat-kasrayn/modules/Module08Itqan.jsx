import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à partir de « أستعدّ » 1, « أؤكّد
 * تعلّماتي » 1, 7 et 11 (autres nombres) plus deux épreuves de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte
 * les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
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
        maqlub: { label: 'مقلوب عدد', module: 2 },
        qismaKasr: { label: 'قسمة كسرين', module: 1 },
        qismaAdad: { label: 'القسمة ضرب في المقلوب', module: 3 },
        masala: { label: 'كم مرّة يدخل كسر في عدد', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'maqlub', requires: ['maqlub'],
          prompt: <Q source={SELF.E1.source}><MathText>{'مقلوب $\\frac{3}{8}$ هو:'}</MathText></Q>,
          options: ['$\\frac{8}{3}$', '$-\\frac{3}{8}$', '$\\frac{1}{8}$', '$0{,}38$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{3}{8} \\times \\frac{8}{3} = 1$ . ($-\\frac{3}{8}$ هو المعاكس؛ $\\frac{1}{8}$ قلب البسط وحده؛ $0{,}38$ ليس مقلوبًا.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_maqlub-qismat-kasrayn_P1'] },
        },
        {
          id: 'E2', skill: 'qismaKasr', requires: ['qismat-kasrayn'],
          prompt: <Q source={SELF.E2.source}><MathText>{'$\\frac{5}{6} \\div \\frac{10}{9}$ يساوي:'}</MathText></Q>,
          options: ['$\\frac{3}{4}$', '$\\frac{25}{27}$', '$\\frac{4}{3}$', '$\\frac{27}{25}$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{5}{6} \\times \\frac{9}{10} = \\frac{45}{60} = \\frac{3}{4}$ . ($\\frac{25}{27}$ ضرب كسرين دون قلب؛ $\\frac{4}{3}$ قلب الأول؛ $\\frac{27}{25}$ قلب الاثنين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_maqlub-qismat-kasrayn_P3'] },
        },
        {
          id: 'E3', skill: 'qismaAdad', requires: ['qisma-darb'],
          prompt: <Q source={PLATFORM}><MathText>{'$12 \\div \\frac{4}{5}$ يساوي:'}</MathText></Q>,
          options: ['$15$', '$\\frac{48}{5}$', '$\\frac{1}{15}$', '$\\frac{3}{5}$'], correct: 0, cols: 2,
          explain: <MathText>{'$12 \\times \\frac{5}{4} = 15$ ، وهو أكبر من $12$ لأنّ المقسوم عليه أصغر من $1$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_maqlub-qismat-kasrayn_P2'] },
        },
        {
          id: 'E4', skill: 'qismaAdad', requires: ['qisma-darb'],
          prompt: <Q source={SELF.E4.source}><MathText>{'$\\frac{7}{9} \\div 14$ يساوي:'}</MathText></Q>,
          options: ['$\\frac{1}{18}$', '$\\frac{98}{9}$', '$18$', '$\\frac{1}{2}$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{7}{9} \\times \\frac{1}{14} = \\frac{1}{18}$ . ($\\frac{98}{9}$ ضرب في $14$ ؛ $18$ قسّم $14$ على $\\frac{7}{9}$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_maqlub-qismat-kasrayn_P2'] },
        },
        {
          id: 'E5', skill: 'masala', requires: ['qismat-kasrayn'],
          prompt: <Q source={PLATFORM}><MathText>{'كم قارورة سعتها $\\frac{3}{4}\\ \\mathrm{L}$ نملأ من $6\\ \\mathrm{L}$ من العصير؟'}</MathText></Q>,
          options: ['$8$', '$\\frac{9}{2}$', '$\\frac{1}{8}$', '$\\frac{15}{2}$'], correct: 0, cols: 2,
          explain: <MathText>{'عدد القوارير هو كم مرّة تدخل $\\frac{3}{4}$ في $6$ : $6 \\div \\frac{3}{4} = 6 \\times \\frac{4}{3} = 8$ ، وهو أكبر من $6$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_maqlub-qismat-kasrayn_P3'] },
        },
      ]}
      badges={[
        { id: 'maqlub', emoji: '🔁', label: 'أعيّن المقلوب', test: (m) => (m.maqlub ?? 0) === 0 },
        { id: 'qisma', emoji: '🚲', label: 'أقسم كسرين', test: (m) => (m.qismaKasr ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت المقلوب وقسمة الكسور',
        title: 'انتهى درس مقلوب عدد وقسمة كسرين',
        message: 'تعرف الآن أنّ مقلوب a/b هو b/a وأنّ جداءهما 1، وأنّ القسمة على عدد هي الضرب في مقلوبه، فتقسم كسرًا على كسر بالضرب في مقلوب الثاني بعد الاختزال.',
        verbs: ['أعيّن', 'أقسم', 'أختزل'],
        masterBadgeLabel: 'المقلوب وقسمة الكسور',
      }}
    />
  );
}
