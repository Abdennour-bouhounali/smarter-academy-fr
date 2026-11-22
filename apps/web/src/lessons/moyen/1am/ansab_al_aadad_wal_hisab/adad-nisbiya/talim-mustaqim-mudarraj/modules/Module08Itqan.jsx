import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';
import { FINAL } from '../content/exercises';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (« أقوّم تعلّماتي » 5 et 6 réécrits, autres nombres) : une الكفاءة principale
 * par épreuve. Toutes les clés sont recalculées en arithmétique décimale exacte dans ../content/content.test.js ; chaque distracteur y est vérifié FAUX.
 */
const PLATFORM = addition('final_test_item');
const Q = ({ children, source }) => <span>{children} <SourceTag source={source ?? PLATFORM} /></span>;

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
        unit: { label: 'الوحدة في الجهتين', module: 1 },
        read: { label: 'قراءة فاصلة', module: 1 },
        bounds: { label: 'الحصر بين علامتين', module: 2 },
        side: { label: 'جهة الفاصلة', module: 2 },
        sym: { label: 'النظير', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'unit', requires: ['tadrij-jihatayn'],
          prompt: <Q><MathText>{'لتدريج مستقيم من جهتي المبدإ ننقل وحدة الطول:'}</MathText></Q>,
          options: ['نفسها في الجهتين', 'أطول في الجهة اليسرى', 'أقصر في الجهة اليمنى', 'مرّة في جهة واحدة فقط'], correct: 0, cols: 2,
          explain: <MathText>{'الوحدة واحدة في الجهتين: بذلك تدلّ كلّ علامة على بعدها عن المبدإ.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-mustaqim-mudarraj_P1'] },
        },
        {
          id: 'E2', skill: 'read', requires: ['fasila-nuqta'],
          prompt: <Q source={FINAL[1].source}><MathText>{'على مستقيم مدرّج كُتب الصفر والعدد $20$ ، وبينهما أربع تباعدات متساوية. فاصلة النقطة التي على يسار المبدإ بتباعدين:'}</MathText></Q>,
          options: ['$-10$', '$10$', '$-2$', '$-40$'], correct: 0, cols: 2,
          explain: <MathText>{'كلّ تباعد يمثّل $20\\div 4=5$ ، وتباعدان يساري المبدإ يعطيان $2\\times 5=10$ بإشارة −: $-10$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-mustaqim-mudarraj_P2'] },
        },
        {
          id: 'E3', skill: 'bounds', requires: ['hasr-fasila'],
          prompt: <Q><MathText>{'النقطة التي فاصلتها $-3{,}4$ تقع بين العلامتين:'}</MathText></Q>,
          options: ['$-4$ و $-3$', '$-3$ و $-2$', '$3$ و $4$', '$-5$ و $-4$'], correct: 0, cols: 2,
          explain: <MathText>{'نعدّ من الصفر نحو الغرب: $-4<-3{,}4<-3$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-mustaqim-mudarraj_P2'] },
        },
        {
          id: 'E4', skill: 'side', requires: ['fasila-nuqta'],
          prompt: <Q source={FINAL[3].source}><MathText>{'لتعليم النقطة $B(-5)$ نضعها على بعد 5 وحدات من المبدإ:'}</MathText></Q>,
          options: ['في الجهة المقابلة لاتجاه الأعداد الموجبة', 'في جهة اتجاه الأعداد الموجبة', 'على المبدإ نفسه', 'على بعد 4 وحدات في الجهة المقابلة'], correct: 0, cols: 1,
          explain: <MathText>{'الإشارة − تعني الجهة المقابلة لاتجاه الأعداد الموجبة، والعدد $5$ يعطي البعد.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-mustaqim-mudarraj_P3'] },
        },
        {
          id: 'E5', skill: 'sym', requires: ['nuqtatan-mutanazirtan'],
          prompt: <Q><MathText>{'النقطة التي فاصلتها $4{,}5$ نظيرتها بالنسبة إلى المبدإ فاصلتها:'}</MathText></Q>,
          options: ['$-4{,}5$', '$4{,}5$', '$-5{,}5$', '$0$'], correct: 0, cols: 2,
          explain: <MathText>{'لها المسافة نفسها إلى المبدإ على الجهة الأخرى: $-4{,}5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-mustaqim-mudarraj_P3'] },
        },
      ]}
      badges={[
        { id: 'tadrij', emoji: '🛣️', label: 'أدرّج من جهتي المبدإ', test: (m) => (m.unit ?? 0) === 0 && (m.side ?? 0) === 0 },
        { id: 'fasila', emoji: '📍', label: 'أقرأ الفاصلة وأحصرها', test: (m) => (m.read ?? 0) === 0 && (m.bounds ?? 0) === 0 && (m.sym ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التعليم على مستقيم مدرّج',
        title: 'انتهى درس التعليم على مستقيم مدرّج',
        message: 'تعرف الآن أنّ المستقيم يُدرَّج بنقل الوحدة نفسها من جهتي المبدإ، وأنّ فاصلة النقطة هي بعدها عن المبدإ مع إشارة جهتها، وأنّ النقطتين المتناظرتين فاصلتاهما متعاكستان، وأنّ ما يقع بين علامتين نحصره بينهما.',
        verbs: ['أدرّج', 'أقرأ', 'أعلّم'],
        masterBadgeLabel: 'المستقيم المدرّج',
      }}
    />
  );
}
