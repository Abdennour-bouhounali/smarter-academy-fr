import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, de la plateforme
 * (autres nombres que ceux des modules ; les distracteurs sont les erreurs nommées de la leçon : le signe, la distance, l'ordre, l'écriture, la priorité).
 * Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par
 * ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
 */
const PLATFORM = addition('final_test_item');
const Q = ({ children }) => <span>{children} <SourceTag source={PLATFORM} /></span>;

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="8 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={8 * 60}
      timerLabel="8 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة، ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        quotient: { label: 'حساب حاصل قسمة', module: 1 },
        missing: { label: 'العامل المجهول', module: 1 },
        writing: { label: 'كتابات الكسر', module: 2 },
        priority: { label: 'أولوية العمليات', module: 3 },
        series: { label: 'سلسلة حسابات', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'quotient', requires: ['ishara-qisma'],
          prompt: <Q><MathText>{'$(-42) \\div (-6)$ يساوي:'}</MathText></Q>,
          options: ['$7$', '$-7$', '$-36$', '$-48$'], correct: 0, cols: 2,
          explain: <MathText>{'العددان سالبان: لهما الإشارة نفسها فالحاصل موجب، و $42 \\div 6 = 7$ . ($-7$ ينسى القاعدة، و $-36$ و $-48$ يطرحان العددين أو يجمعانهما بدل القسمة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qismat-nisbiyayn_P2'] },
        },
        {
          id: 'E2', skill: 'missing', requires: ['qisma-aamil'],
          prompt: <Q><MathText>{'ما العدد الذي يجعل $\\square \\times (-4) = 10$ صحيحة؟'}</MathText></Q>,
          options: ['$-2{,}5$', '$2{,}5$', '$-40$', '$-0{,}4$'], correct: 0, cols: 2,
          explain: <MathText>{'العدد المجهول هو حاصل قسمة $10$ على $-4$ : $10 \\div (-4) = -2{,}5$ ، ونتحقّق $(-2{,}5) \\times (-4) = 10$ . ($-40$ هو الجداء، و $-0{,}4$ هو قسمة بالعكس.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qismat-nisbiyayn_P1'] },
        },
        {
          id: 'E3', skill: 'writing', requires: ['kasr-qisma'],
          prompt: <Q><MathText>{'أيّ هذه الأعداد يساوي $\\frac{-5}{8}$ ؟'}</MathText></Q>,
          options: ['$\\frac{5}{-8}$', '$\\frac{-5}{-8}$', '$\\frac{8}{-5}$', '$\\frac{5}{8}$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{-5}{8} = \\frac{5}{-8} = -\\frac{5}{8}$ . أمّا $\\frac{-5}{-8} = \\frac{5}{8}$ موجب، و $\\frac{8}{-5}$ عدد آخر (قلبنا البسط والمقام).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qismat-nisbiyayn_P3'] },
        },
        {
          id: 'E4', skill: 'priority', requires: ['tariqat-awlawiya'],
          prompt: <Q><MathText>{'$7 - 3 \\times (-2)$ يساوي:'}</MathText></Q>,
          options: ['$13$', '$-8$', '$1$', '$-13$'], correct: 0, cols: 2,
          explain: <MathText>{'الضرب أوّلًا: $3 \\times (-2) = -6$ ، ثم $7 - (-6) = 7 + 6 = 13$ . ($-8$ يطرح $3$ من $7$ أوّلًا، و $1$ يحسب $7 - 6$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qismat-nisbiyayn_P4'] },
        },
        {
          id: 'E5', skill: 'series', requires: ['tariqat-awlawiya'],
          prompt: <Q><MathText>{'$(-12) \\div (1 - 4) + 2$ يساوي:'}</MathText></Q>,
          options: ['$6$', '$-2$', '$-14$', '$4$'], correct: 0, cols: 2,
          explain: <MathText>{'القوس أوّلًا: $1 - 4 = -3$ ، ثم $(-12) \\div (-3) = 4$ ، ثم $4 + 2 = 6$ . ($-2$ يعتبر القسمة سالبة، و $-14$ يقسم على $1$ أوّلًا، و $4$ ينسى $+2$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPoints: [{ code: '3am_qismat-nisbiyayn_P4', role: 'primary' }, { code: '3am_qismat-nisbiyayn_P2', role: 'secondary' }] },
        },
      ]}
      badges={[
        { id: 'quotient', emoji: '🔐', label: 'أحسب حاصل قسمة عددين نسبيين', test: (m) => (m.quotient ?? 0) === 0 && (m.missing ?? 0) === 0 },
        { id: 'series', emoji: '🧮', label: 'أنظّم سلسلة حسابات', test: (m) => (m.priority ?? 0) === 0 && (m.series ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حاصل قسمة عددين نسبيين',
        title: 'انتهى درس حاصل قسمة عددين نسبيين',
        message: 'تعرف الآن أنّ حاصل قسمة a على b هو العامل المجهول q في b × q = a، وتعيّن إشارته وتحسبه، وتكتبه كسرًا حين لا يكون عشريًا، وتنظّم سلسلة حسابات باحترام الأولويات.',
        verbs: ['أقسم', 'أكتب الكسر', 'أنظّم'],
        masterBadgeLabel: 'حاصل قسمة عددين نسبيين',
      }}
    />
  );
}
