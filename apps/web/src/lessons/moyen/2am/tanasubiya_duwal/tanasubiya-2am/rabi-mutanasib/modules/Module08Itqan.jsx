import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à
 * partir de « أؤكّد تعلّماتي » 2 et 3 (autres nombres) plus trois épreuves de la plateforme. Les épreuves restent LITTÉRALES ici
 * (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en fractions BigInt par ../content/content.test.js
 * qui vérifie aussi que le source de ce module contient chaque option.
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
        fourth: { label: 'حساب الرابع المتناسب', module: 1 },
        cross: { label: 'الجداءان المتصالبان', module: 2 },
        route: { label: 'اختيار الطريق', module: 3 },
        additive: { label: 'الخاصية الجمعية', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'fourth', requires: ['rabi'],
          prompt: <Q source={PLATFORM}><MathText>{'ثمن $6$ kg من التمر هو $900$ DA . ثمن $10$ kg هو:'}</MathText></Q>,
          options: ['$1500$', '$904$', '$540$', '$5400$'], correct: 0, cols: 2,
          explain: <MathText>{'ثمن الكيلوغرام $900 \\div 6 = 150$ DA ، إذن $10$ kg بـ $1500$ DA . ($904$ إضافة للفرق نفسه، و $540$ و $5400$ حسابان خاطئان.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_rabi-mutanasib_P1'] },
        },
        {
          id: 'E2', skill: 'cross', requires: ['jidaan'],
          prompt: <Q source={SELF.E2.source}><MathText>{'في جدول التناسبية $\\begin{array}{|c|c|}\\hline 3 & 9 \\\\\\hline 8 & x \\\\\\hline\\end{array}$ ، مساواة الجداءين المتصالبين هي:'}</MathText></Q>,
          options: ['$3 \\times x = 8 \\times 9$', '$3 \\times 9 = 8 \\times x$', '$3 \\times 8 = 9 \\times x$', '$3 + x = 8 + 9$'], correct: 0, cols: 1,
          explain: <MathText>{'جداء القطر الأوّل $3 \\times x$ وجداء القطر الثاني $8 \\times 9$ ، ومنه $x = 24$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_rabi-mutanasib_P2'] },
        },
        {
          id: 'E3', skill: 'route', requires: ['ikhtiyar'],
          prompt: <Q source={PLATFORM}><MathText>{'ثمن $3$ kg هو $50$ DA . لحساب ثمن $12$ kg دون التعامل مع عدد غير منتهٍ نستعمل:'}</MathText></Q>,
          options: ['المرور بالوحدة: $50 \\div 3$', 'الخاصية الضربية: $12 = 3 \\times 4$', 'معامل التناسبية $50 \\div 3$'], correct: 1, cols: 1,
          explain: <MathText>{'$50 \\div 3$ لا يُكتب عشريًا، أمّا $12 = 3 \\times 4$ فتعطي $50 \\times 4 = 200$ DA .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_rabi-mutanasib_P3'] },
        },
        {
          id: 'E4', skill: 'additive', requires: ['turuq'],
          prompt: <Q source={SELF.E4.source}><MathText>{'ثمن $2$ kg هو $280$ DA وثمن $5$ kg هو $700$ DA . ثمن $7$ kg هو:'}</MathText></Q>,
          options: ['$980$', '$702$', '$1400$', '$840$'], correct: 0, cols: 2,
          explain: <MathText>{'$7 = 2 + 5$ : نجمع الثمنين، $280 + 700 = 980$ DA .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_rabi-mutanasib_P1'] },
        },
        {
          id: 'E5', skill: 'cross', requires: ['hisab-jidaan'],
          prompt: <Q source={PLATFORM}><MathText>{'ثمن $4$ kg هو $600$ DA . عدد الكيلوغرامات التي ثمنها $1800$ DA هو:'}</MathText></Q>,
          options: ['$12$', '$450$', '$2400$', '$1204$'], correct: 0, cols: 2,
          explain: <MathText>{'$4 \\times 1800 = 600 \\times c$ ، إذن $c = 7200 \\div 600 = 12$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_rabi-mutanasib_P2'] },
        },
      ]}
      badges={[
        { id: 'fourth', emoji: '⚖️', label: 'أحسب الرابع المتناسب', test: (m) => (m.fourth ?? 0) === 0 },
        { id: 'cross', emoji: '✖️', label: 'أستعمل الجداءين', test: (m) => (m.cross ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حساب الرابع المتناسب',
        title: 'انتهى درس حساب الرابع المتناسب',
        message: 'تعرف الآن أنّ ثلاثة أعداد في جدول تناسبية تعيّن رابعًا واحدًا، وتحسبه بالوحدة أو بالخاصيتين أو بمساواة الجداءين المتصالبين، وتختار الطريق الأنسب للأعداد.',
        verbs: ['أحسب', 'أقارن', 'أختار'],
        masterBadgeLabel: 'الرابع المتناسب',
      }}
    />
  );
}
