import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, de la plateforme (aucune n'est un exercice du manuel retapé). Les épreuves
 * restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce
 * module contient chaque option. Le test du chiffre des unités n'y figure jamais (outil de طريقة, pas une الكفاءة).
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
        tasawi: { label: 'تساوي كسرين', module: 2 },
        muqarana: { label: 'مقارنة كسرين', module: 3 },
        tartib: { label: 'ترتيب كسور بمقام مشترك', module: 2 },
        majhul: { label: 'حدّ مجهول', module: 4 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'tasawi', requires: ['jidaa-property'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ كسر يساوي $\\frac{12}{18}$ ؟'}</MathText></Q>,
          options: ['$\\frac{2}{3}$', '$\\frac{14}{20}$', '$\\frac{6}{12}$', '$\\frac{3}{2}$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{12}{18}=\\frac{12\\div6}{18\\div6}=\\frac{2}{3}$ . ($\\frac{14}{20}$ أضاف $2$ إلى البسط والمقام؛ $\\frac{6}{12}$ جداءاه المتصالبان مع $\\frac{2}{3}$ مختلفان: $6\\times3=18$ و $12\\times2=24$ ؛ $\\frac{3}{2}$ قلب الكسر.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1'] },
        },
        {
          id: 'E2', skill: 'muqarana', requires: ['ikhtiyar-tariqa'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\frac{5}{7}\\;\\square\\;\\frac{7}{10}$'}</MathText></Q>,
          options: ['$>$', '$<$', '$=$'], correct: 0, cols: 3,
          explain: <MathText>{'$5\\times10=50$ و $7\\times7=49$ ، و $50>49$ ، فـ $\\frac{5}{7}>\\frac{7}{10}$ . (بالمقام $70$ : $\\frac{50}{70}>\\frac{49}{70}$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P3'] },
        },
        {
          id: 'E3', skill: 'tasawi', requires: ['jidaa-property'],
          prompt: <Q source={PLATFORM}><MathText>{'هل $\\frac{21}{35}=\\frac{33}{55}$ ؟'}</MathText></Q>,
          options: ['نعم لأنّ $21\\times55=35\\times33=1155$', 'لا لأنّ $21\\neq33$', 'لا لأنّ $55-35\\neq33-21$', 'نعم لأنّ $35-21=14$'], correct: 0, cols: 1,
          explain: <MathText>{'الجداءان المتصالبان متساويان ($1155$) فالكسران متساويان. (المقارنة بين الفرق أو بين البسطين فقط لا تثبت شيئًا.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1'] },
        },
        {
          id: 'E4', skill: 'tartib', requires: ['qaida-tawhid'],
          prompt: <Q source={PLATFORM}><MathText>{'الترتيب التصاعدي للكسور $\\frac{2}{3}$ و $\\frac{5}{8}$ و $\\frac{7}{12}$ هو:'}</MathText></Q>,
          options: ['$\\frac{7}{12}<\\frac{5}{8}<\\frac{2}{3}$', '$\\frac{2}{3}<\\frac{5}{8}<\\frac{7}{12}$', '$\\frac{5}{8}<\\frac{2}{3}<\\frac{7}{12}$'], correct: 0, cols: 1,
          explain: <MathText>{'بالمقام $24$ : $\\frac{16}{24}$ و $\\frac{15}{24}$ و $\\frac{14}{24}$ ، فالترتيب $\\frac{7}{12}<\\frac{5}{8}<\\frac{2}{3}$ . (الخيار الثاني رتّب بحسب المقامات.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P2'] },
        },
        {
          id: 'E5', skill: 'majhul', requires: ['jidaa-property'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\frac{x}{15}=\\frac{4}{6}$ ، إذن $x=$'}</MathText></Q>,
          options: ['$10$', '$13$', '$22{,}5$', '$\\frac{8}{3}$'], correct: 0, cols: 2,
          explain: <MathText>{'$x\\times6=15\\times4=60$ ، فـ $x=10$ . ($13$ أضاف الفرق؛ $22{,}5$ ضرب قطرًا واحدًا خطأً: $\\frac{6\\times15}{4}$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1'] },
        },
      ]}
      badges={[
        { id: 'tasawi', emoji: '🎨', label: 'أتحقّق من التساوي', test: (m) => (m.tasawi ?? 0) === 0 },
        { id: 'muqarana', emoji: '⚖️', label: 'أقارن كسرين', test: (m) => (m.muqarana ?? 0) === 0 && (m.tartib ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت تساوي الكسور ومقارنتها',
        title: 'انتهى درس تساوي كسرين ومقارنتهما',
        message: 'تعرف الآن أنّ كسرين يتساويان إذا تساوى جداءاهما المتصالبان، وتقارن كسرين بتوحيد المقامين أو بالجداءين المتصالبين، وتختار الطريقة الأنسب.',
        verbs: ['أتحقّق', 'أقارن', 'أرتّب'],
        masterBadgeLabel: 'تساوي كسرين ومقارنتهما',
      }}
    />
  );
}
