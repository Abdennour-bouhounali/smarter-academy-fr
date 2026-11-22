import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme, une الكفاءة principale chacune (P1 deux fois : calcul et paire inutile). Les épreuves
 * restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de
 * ce module contient chaque option et que chaque distracteur reproduit son erreur nommée.
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
        aqwas: { label: 'الأقواس أوّلًا', module: 1 },
        mutadakhila: { label: 'الأقواس المتداخلة', module: 2 },
        khatt: { label: 'خطّ الكسر', module: 3 },
        alat: { label: 'الأزرار على الآلة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'aqwas', requires: ['aqwas-awwalan'],
          prompt: <Q source={PLATFORM}><MathText>{'$5 \\times (14 - 8)$ يساوي:'}</MathText></Q>,
          options: ['$30$', '$62$', '$6$', '$70$'], correct: 0, cols: 2,
          explain: <MathText>{'ما بين القوسين أوّلًا: $14 - 8 = 6$ ثم $5 \\times 6 = 30$ . ($62$ تجاهل القوسين: $5 \\times 14 - 8$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bi-aqwas_P1'] },
        },
        {
          id: 'E2', skill: 'mutadakhila', requires: ['aqwas-mutadakhila'],
          prompt: <Q source={PLATFORM}><MathText>{'$40 - [15 - (2 + 4)]$ يساوي:'}</MathText></Q>,
          options: ['$31$', '$19$', '$27$', '$23$'], correct: 0, cols: 2,
          explain: <MathText>{'الداخلي أوّلًا: $2 + 4 = 6$ ثم $15 - 6 = 9$ ثم $40 - 9 = 31$ . ($19$ أهمل القوس الخارجي؛ $27$ أهمل الأقواس؛ $23$ أهمل القوس الداخلي.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bi-aqwas_P2'] },
        },
        {
          id: 'E3', skill: 'khatt', requires: ['khatt-kasr'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\dfrac{25 + 11}{10 - 6}$ يساوي:'}</MathText></Q>,
          options: ['$9$', '$20{,}1$', '$3{,}6$', '$30$'], correct: 0, cols: 2,
          explain: <MathText>{'البسط $25 + 11 = 36$ والمقام $10 - 6 = 4$ ، و $36 \\div 4 = 9$ . ($20{,}1$ و $3{,}6$ قسما جزءًا من البسط أو المقام فقط.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bi-aqwas_P3'] },
        },
        {
          id: 'E4', skill: 'alat', requires: ['tariqa-khatt-kasr-alat'],
          prompt: <Q source={PLATFORM}><MathText>{'لحساب $\\dfrac{60}{4 + 8}$ نضغط:'}</MathText></Q>,
          options: ['$60 \\div ( 4 + 8 ) =$', '$60 \\div 4 + 8 =$', '$( 60 \\div 4 ) + 8 =$', '$60 \\div 4 \\times 8 =$'], correct: 0, cols: 1,
          explain: <MathText>{'المقام $4 + 8$ يجب أن يكون بين قوسين: $60 \\div 12 = 5$ . ($60 \\div 4 + 8$ تعطي $23$ فتقسم 60 على 4 وحدها.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bi-aqwas_P4'] },
        },
        {
          id: 'E5', skill: 'aqwas', requires: ['aqwas-ghayr-daruriya'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ القوسين التاليين غير ضروريين؟'}</MathText></Q>,
          options: ['$7 + (3 \\times 5)$', '$(7 + 3) \\times 5$', '$7 \\times (3 + 5)$', '$(7 - 3) \\div 2$'], correct: 0, cols: 1,
          explain: <MathText>{'الضرب يُحسب أوّلًا دون قوسين في $7 + (3 \\times 5) = 22$ ؛ أمّا في الأخريات فحذف القوسين يغيّر الناتج.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_silsila-bi-aqwas_P1'] },
        },
      ]}
      badges={[
        { id: 'aqwas', emoji: '🧮', label: 'أضع الأقواس', test: (m) => (m.aqwas ?? 0) === 0 },
        { id: 'khatt', emoji: '➗', label: 'أكتب الكسر على الآلة', test: (m) => (m.khatt ?? 0) === 0 && (m.alat ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الأقواس',
        title: 'انتهى درس سلسلة العمليات التي تتضمّن أقواسا',
        message: 'تعرف الآن أنّ الأقواس تفرض ما يُحسب أوّلًا، وأنّ الأقواس المتداخلة تُحسب من الداخل، وأنّ خطّ الكسر قوسان للبسط والمقام، فتكتب حسابك على الآلة دون خطأ.',
        verbs: ['أضع', 'أحسب', 'أكتب'],
        masterBadgeLabel: 'الأقواس',
      }}
    />
  );
}
