import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune : une réécrite à partir de
 * « أؤكّد تعلّماتي » 5 (autres nombres), quatre de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js)
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
        between: { label: 'الحصر بين عددين طبيعيين', module: 2 },
        excess: { label: 'القيمة المقرّبة بالزيادة', module: 2 },
        round: { label: 'تعيين المدوّر', module: 2 },
        fromround: { label: 'الحصر من المدوّر', module: 1 },
        quotient: { label: 'حصر حاصل قسمة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'between', requires: ['hasr-rutba'],
          prompt: <Q source={SELF.E1.source}><MathText>{'حصر $17{,}08$ بين عددين طبيعيين متتاليين هو:'}</MathText></Q>,
          options: ['$17<17{,}08<18$', '$16<17{,}08<17$', '$17{,}1<17{,}08<18$', '$18<17{,}08<19$'], correct: 0, cols: 1,
          explain: <MathText>{'$17{,}08$ بين $17$ و $18$ ، وهما عددان طبيعيان متتاليان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_hasr-adad-ushri_P1'] },
        },
        {
          id: 'E2', skill: 'excess', requires: ['hasr-rutba'],
          prompt: <Q source={PLATFORM}><MathText>{'القيمة المقرّبة بالزيادة إلى $0{,}01$ للعدد $4{,}2531$ هي:'}</MathText></Q>,
          options: ['$4{,}26$', '$4{,}25$', '$4{,}3$', '$4{,}253$'], correct: 0, cols: 2,
          explain: <MathText>{'$4{,}25\\le 4{,}2531<4{,}26$ : بالزيادة تعني العلامة العليا $4{,}26$ ، و $4{,}25$ هي القيمة بالنقصان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_hasr-adad-ushri_P2'] },
        },
        {
          id: 'E3', skill: 'round', requires: ['tadwir'],
          prompt: <Q source={PLATFORM}><MathText>{'مدوّر $9{,}8462$ إلى $0{,}1$ هو:'}</MathText></Q>,
          options: ['$9{,}8$', '$9{,}9$', '$9{,}84$', '$10$'], correct: 0, cols: 2,
          explain: <MathText>{'الرقم الذي يلي الجزء من عشرة هو $4$ فلا نرفع: $9{,}8$ . ولا ندوّر على مراحل ($9{,}85$ ثم $9{,}9$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_hasr-adad-ushri_P3'] },
        },
        {
          id: 'E4', skill: 'fromround', requires: ['hasr-min-mudawwar'],
          prompt: <Q source={PLATFORM}><MathText>{'مدوّر $x$ إلى $0{,}1$ هو $3{,}6$ . الحصر الصحيح هو:'}</MathText></Q>,
          options: ['$3{,}55\\leq x<3{,}65$', '$3{,}6\\leq x<3{,}7$', '$3{,}55\\leq x\\leq 3{,}65$', '$3{,}5<x<3{,}7$'], correct: 0, cols: 1,
          explain: <MathText>{'نطرح نصف الرتبة $0{,}05$ من $3{,}6$ ونضيفه إليه: $3{,}55\\le x<3{,}65$ ، والطرف الأيمن غير مشمول.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_hasr-adad-ushri_P3'] },
        },
        {
          id: 'E5', skill: 'quotient', requires: ['hasr-rutba'],
          prompt: <Q source={PLATFORM}><MathText>{'تُظهر الآلة $250\\div7=35.71428571$ . حصر الحاصل إلى $0{,}01$ هو:'}</MathText></Q>,
          options: ['$35{,}71<\\frac{250}{7}<35{,}72$', '$35{,}72<\\frac{250}{7}<35{,}73$', '$35{,}7<\\frac{250}{7}<35{,}71$', '$35{,}6<\\frac{250}{7}<35{,}7$'], correct: 0, cols: 1,
          explain: <MathText>{'نقرأ رقمين بعد الفاصلة: $35{,}71$ ثم نضيف $0{,}01$ ، فالحاصل بين $35{,}71$ و $35{,}72$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_hasr-adad-ushri_P4'] },
        },
      ]}
      badges={[
        { id: 'between', emoji: '⚖️', label: 'أحصر بين علامتين', test: (m) => (m.between ?? 0) === 0 && (m.excess ?? 0) === 0 },
        { id: 'round', emoji: '🔄', label: 'أدوّر وأحصر من المدوّر', test: (m) => (m.round ?? 0) === 0 && (m.fromround ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حصر عدد عشري موجب',
        title: 'انتهى درس حصر عدد عشري موجب',
        message: 'تعرف الآن أنّ كل عدد عشري موجب يقع بين علامتين متتاليتين من أيّ رتبة، وتعيّن مدوّره، وتحصر عددًا علمت مدوّره، وتحصر حاصل قسمة تقرؤه على الآلة الحاسبة.',
        verbs: ['أحصر', 'أدوّر', 'أقرأ'],
        masterBadgeLabel: 'حصر عدد عشري موجب',
      }}
    />
  );
}
