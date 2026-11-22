import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à partir de « أؤكّد تعلّماتي » 1 et de
 * l'exercice 4 (autres nombres) plus deux épreuves de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes
 * données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
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
        yasar: { label: 'الحساب من اليسار', module: 1 },
        awlawiya: { label: 'أسبقية الضرب والقسمة', module: 2 },
        tarjama: { label: 'ترجمة وضعية بسلسلة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'yasar', requires: ['yasar-yamin-jam'],
          prompt: <Q source={SELF.E1.source}><MathText>{'$28 - 10 + 6$ يساوي:'}</MathText></Q>,
          options: ['$24$', '$12$', '$44$', '$22$'], correct: 0, cols: 2,
          explain: <MathText>{'من اليسار: $28 - 10 = 18$ ثم $18 + 6 = 24$ . ($12$ جمع $10 + 6$ أوّلًا: $28 - 16$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bidun-aqwas_P1'] },
        },
        {
          id: 'E2', skill: 'awlawiya', requires: ['awlawiya'],
          prompt: <Q source={SELF.E2.source}><MathText>{'$7 + 5 \\times 4$ يساوي:'}</MathText></Q>,
          options: ['$27$', '$48$', '$35$', '$20$'], correct: 0, cols: 2,
          explain: <MathText>{'الضرب أوّلًا: $5 \\times 4 = 20$ ثم $7 + 20 = 27$ . ($48$ جمع $7 + 5$ أوّلًا ثم ضرب في 4.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bidun-aqwas_P2'] },
        },
        {
          id: 'E3', skill: 'yasar', requires: ['yasar-yamin-darb'],
          prompt: <Q source={SELF.E3.source}><MathText>{'$72 \\div 6 \\times 2$ يساوي:'}</MathText></Q>,
          options: ['$24$', '$6$', '$144$', '$12$'], correct: 0, cols: 2,
          explain: <MathText>{'من اليسار: $72 \\div 6 = 12$ ثم $12 \\times 2 = 24$ . ($6$ ضرب $6 \\times 2$ أوّلًا ثم قسم: $72 \\div 12$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bidun-aqwas_P1'] },
        },
        {
          id: 'E4', skill: 'awlawiya', requires: ['awlawiya'],
          prompt: <Q source={PLATFORM}><MathText>{'$3{,}5 + 2 \\times 1{,}5 - 6 \\div 3$ يساوي:'}</MathText></Q>,
          options: ['$4{,}5$', '$6{,}25$', '$6{,}5$', '$2{,}5$'], correct: 0, cols: 2,
          explain: <MathText>{'الضرب والقسمة أوّلًا: $2 \\times 1{,}5 = 3$ و $6 \\div 3 = 2$ ، ثم $3{,}5 + 3 = 6{,}5$ ثم $6{,}5 - 2 = 4{,}5$ . ($6{,}25$ جمع $3{,}5 + 2$ أوّلًا.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bidun-aqwas_P2'] },
        },
        {
          id: 'E5', skill: 'tarjama', requires: ['tarjama-silsila'],
          prompt: <Q source={PLATFORM}><MathText>{'اشترت ليلى 5 أقلام بـ $35$ DA للقلم وكرّاسًا بـ $60$ DA ، ودفعت $500$ DA . أيّ سلسلة تعطي الباقي؟'}</MathText></Q>,
          options: ['$500 - 5 \\times 35 - 60$', '$500 - 5 \\times 35 + 60$', '$500 - 5 + 35 - 60$', '$5 \\times 35 + 60 - 500$'], correct: 0, cols: 1,
          explain: <MathText>{'ما دفعته ليلى يُطرح من $500$ : $5 \\times 35$ للأقلام ثم $60$ للكرّاس، والباقي $265$ DA . (الثانية أضافت ثمن الكرّاس؛ والرابعة عكست الترتيب.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bidun-aqwas_P3'] },
        },
      ]}
      badges={[
        { id: 'yasar', emoji: '🚋', label: 'أحسب من اليسار', test: (m) => (m.yasar ?? 0) === 0 },
        { id: 'awlawiya', emoji: '🥇', label: 'أطبّق الأسبقية', test: (m) => (m.awlawiya ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت ترتيب العمليات',
        title: 'انتهى درس سلسلة العمليات دون أقواس',
        message: 'تعرف الآن أنّ سلسلة الجمع والطرح (أو الضرب والقسمة) تُحسب من اليسار نحو اليمين، وأنّ الضرب والقسمة يسبقان الجمع والطرح، فتحسب وتترجم وضعية بسلسلة.',
        verbs: ['أحسب', 'أطبّق', 'أترجم'],
        masterBadgeLabel: 'ترتيب العمليات',
      }}
    />
  );
}
