import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme, une الكفاءة principale chacune (P1 deux fois : deux noms ; P2 : la phrase ; P3 deux
 * fois : écrire, puis écrire et calculer). Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par
 * ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option et que chaque distracteur reproduit son erreur nommée.
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
        tasmiya: { label: 'تسمية السلسلة', module: 1 },
        wasf: { label: 'وصف السلسلة بجملة', module: 2 },
        kitaba: { label: 'كتابة السلسلة من جملة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'tasmiya', requires: ['akhir-amaliya'],
          prompt: <Q source={PLATFORM}><MathText>{'$12 + 6 \\times 3$ عبارة عن:'}</MathText></Q>,
          options: ['مجموع', 'جداء', 'فرق', 'حاصل قسمة'], correct: 0, cols: 2,
          explain: <MathText>{'الضرب أوّلًا: $6 \\times 3 = 18$ ثم $12 + 18 = 30$ ، فآخر عملية هي الجمع والسلسلة مجموع. (جداء سمّاها بأوّل عملية أُنجزت.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wasf-silsila-hisab_P1'] },
        },
        {
          id: 'E2', skill: 'tasmiya', requires: ['akhir-amaliya'],
          prompt: <Q source={PLATFORM}><MathText>{'$(12 + 6) \\times 3$ عبارة عن:'}</MathText></Q>,
          options: ['جداء', 'مجموع', 'فرق', 'حاصل قسمة'], correct: 0, cols: 2,
          explain: <MathText>{'القوسان يفرضان الجمع أوّلًا: $12 + 6 = 18$ ثم $18 \\times 3 = 54$ ، فآخر عملية هي الضرب والسلسلة جداء. (مجموع سمّاها بأوّل عملية مكتوبة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wasf-silsila-hisab_P1'] },
        },
        {
          id: 'E3', skill: 'wasf', requires: ['wasf-jumla'],
          prompt: <Q source={PLATFORM}><MathText>{'تُوصف السلسلة $45 - (10 + 5)$ بالجملة:'}</MathText></Q>,
          options: ['فرق العدد 45 ومجموع العددين 10 و 5', 'مجموع العدد 45 ومجموع العددين 10 و 5', 'فرق فرق العددين 45 و 10 والعدد 5', 'مجموع فرق العددين 45 و 10 والعدد 5'], correct: 0, cols: 1,
          explain: <MathText>{'القوسان يجعلان الجمع أوّلًا فآخر عملية هي الطرح: حدّها الأول 45 وحدّها الثاني مجموع العددين 10 و 5. (الثانية والرابعة سمّتاها مجموعًا؛ والثالثة قطّعت الأعداد تقطيعًا آخر.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wasf-silsila-hisab_P2'] },
        },
        {
          id: 'E4', skill: 'kitaba', requires: ['tariqa-kitaba'],
          prompt: <Q source={PLATFORM}><MathText>{'السلسلة «حاصل قسمة مجموع العددين 20 و 8 على 7» تُكتب:'}</MathText></Q>,
          options: ['$(20 + 8) \\div 7$', '$20 + 8 \\div 7$', '$7 \\div (20 + 8)$', '$20 \\div 7 + 8$'], correct: 0, cols: 2,
          explain: <MathText>{'آخر عملية هي القسمة ومقسومها المجموع كلّه، فالمجموع بين قوسين: $(20 + 8) \\div 7 = 4$ . (الثانية دون قوسين؛ والثالثة قلبت الترتيب؛ والرابعة قطّعت الأعداد تقطيعًا آخر.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wasf-silsila-hisab_P3'] },
        },
        {
          id: 'E5', skill: 'kitaba', requires: ['tariqa-kitaba'],
          prompt: <Q source={PLATFORM}><MathText>{'السلسلة «جداء العدد 5 وفرق العددين 11 و 4» تساوي:'}</MathText></Q>,
          options: ['$35$', '$51$', '$75$', '$7$'], correct: 0, cols: 2,
          explain: <MathText>{'نكتبها $5 \\times (11 - 4) = 5 \\times 7 = 35$ . ($51$ نسي القوسين؛ و $75$ جمع بدل أن يطرح؛ و $7$ توقّف عند أوّل عملية أنجزها وهي الطرح.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wasf-silsila-hisab_P3'] },
        },
      ]}
      badges={[
        { id: 'tasmiya', emoji: '✂️', label: 'أسمّي السلسلة', test: (m) => (m.tasmiya ?? 0) === 0 },
        { id: 'kitaba', emoji: '✍️', label: 'أكتب السلسلة من جملتها', test: (m) => (m.wasf ?? 0) === 0 && (m.kitaba ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت وصف السلاسل',
        title: 'انتهى درس وصف سلسلة حسابات',
        message: 'تعرف الآن أنّ آخر عملية تُنجز هي التي تسمّي السلسلة، فتصفها بجملة كاملة وتكتبها من جملتها بالأقواس اللازمة.',
        verbs: ['أسمّي', 'أصف', 'أكتب'],
        masterBadgeLabel: 'وصف السلاسل',
      }}
    />
  );
}
