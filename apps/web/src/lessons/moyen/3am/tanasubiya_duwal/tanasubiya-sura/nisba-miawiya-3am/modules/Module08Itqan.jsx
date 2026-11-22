import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à partir de « أؤكّد
 * تعلّماتي » 3–6 (autres nombres) plus une épreuve de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js)
 * porte les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
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
        hisab: { label: 'نسبة مئوية من عدد', module: 2 },
        nisba: { label: 'النسبة من جزء وكلّ', module: 2 },
        change: { label: 'زيادة أو تخفيض', module: 3 },
        chain: { label: 'تغيّران متتاليان', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'hisab', requires: ['hissa-t'],
          prompt: <Q source={PLATFORM}><MathText>{'$35\\%$ من $80$ هي:'}</MathText></Q>,
          options: ['$28$', '$45$', '$2800$', '$2{,}8$'], correct: 0, cols: 2,
          explain: <MathText>{'$80 \\times \\frac{35}{100} = 28$ . ($45$ تطرح $35$ ؛ $2800$ تنسى القسمة على $100$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nisba-miawiya-3am_P1'] },
        },
        {
          id: 'E2', skill: 'nisba', requires: ['nisba-jadwal'],
          prompt: <Q source={SELF.E2.source}><MathText>{'في قسم $25$ تلميذًا، $40\\%$ منهم بنات، وفي قسم آخر $15$ تلميذًا، $80\\%$ منهم بنات. النسبة المئوية للبنات في القسمين معًا:'}</MathText></Q>,
          options: ['$55\\%$', '$60\\%$', '$120\\%$', '$22\\%$'], correct: 0, cols: 2,
          explain: <MathText>{'البنات $10 + 12 = 22$ من $40$ تلميذًا: $\\frac{22}{40} = 0{,}55$ ، أي $55\\%$ . ($60\\%$ هي متوسط النسبتين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nisba-miawiya-3am_P2'] },
        },
        {
          id: 'E3', skill: 'change', requires: ['ziyada-nuqsan'],
          prompt: <Q source={SELF.E3.source}><MathText>{'لباس ثمنه $12000$ دج بيع بعد تخفيض بـ $20\\%$ . ثمن البيع بالدينار:'}</MathText></Q>,
          options: ['$9600$', '$2400$', '$11980$', '$14400$'], correct: 0, cols: 2,
          explain: <MathText>{'$12000 \\times 0{,}8 = 9600$ . ($2400$ هو مبلغ التخفيض لا ثمن البيع.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nisba-miawiya-3am_P3'] },
        },
        {
          id: 'E4', skill: 'chain', requires: ['tatabu'],
          prompt: <Q source={SELF.E4.source}><MathText>{'غرض ثمنه $300$ دج انخفض بـ $10\\%$ ثم ارتفع بـ $10\\%$ . ثمنه الجديد بالدينار:'}</MathText></Q>,
          options: ['$297$', '$300$', '$330$', '$270$'], correct: 0, cols: 2,
          explain: <MathText>{'$300 \\times 0{,}9 = 270$ ثم $270 \\times 1{,}1 = 297$ : لا يعود إلى $300$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nisba-miawiya-3am_P3'] },
        },
        {
          id: 'E5', skill: 'nisba', requires: ['tariqat-hisab'],
          prompt: <Q source={SELF.E5.source}><MathText>{'قطع أيوب $72\\ \\mathrm{km}$ أي $40\\%$ من مسافة رحلته. مسافة الرحلة بالكيلومتر:'}</MathText></Q>,
          options: ['$180$', '$28{,}8$', '$112$', '$288$'], correct: 0, cols: 2,
          explain: <MathText>{'الجزء $72$ يقابل $40$ والكلّ يقابل $100$ : $\\frac{72 \\times 100}{40} = 180$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nisba-miawiya-3am_P2'] },
        },
      ]}
      badges={[
        { id: 'change', emoji: '💯', label: 'أحسب زيادة وتخفيضًا', test: (m) => (m.change ?? 0) === 0 },
        { id: 'nisba', emoji: '🧮', label: 'أجد النسبة', test: (m) => (m.nisba ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت النسبة المئوية',
        title: 'انتهى درس النسبة المئوية',
        message: 'تعرف الآن أنّ t % من عدد هي ذلك العدد مضروبًا في t/100، وتحسب نسبة جزء من كلّ بجدول تناسبية، وتحسب زيادة أو تخفيضًا بالضرب في 1 + t/100 أو 1 − t/100.',
        verbs: ['أحسب', 'أجد', 'أزيد وأخفّض'],
        masterBadgeLabel: 'النسبة المئوية',
      }}
    />
  );
}
