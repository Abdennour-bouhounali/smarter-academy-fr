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
 * partir de « أؤكّد تعلّماتي » 5 et 6 (autres nombres) plus trois épreuves de la plateforme. Les épreuves restent LITTÉRALES ici
 * (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js
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
        negatives: { label: 'مقارنة عددين سالبين', module: 1 },
        signs: { label: 'مقارنة إشارتين مختلفتين', module: 1 },
        order: { label: 'ترتيب أعداد نسبية', module: 2 },
        between: { label: 'عدد بين عددين', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'negatives', requires: ['salibayn'],
          prompt: <Q source={PLATFORM}><MathText>{'أصغر العددين $-2{,}6$ و $-2{,}06$ هو:'}</MathText></Q>,
          options: ['$-2{,}6$', '$-2{,}06$', '$2{,}06$', '$2{,}6$'], correct: 0, cols: 2,
          explain: <MathText>{'سالبان: الأبعد عن الصفر هو الأصغر، و $2{,}60 > 2{,}06$ ، إذن $-2{,}6 < -2{,}06$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-nisbiya_P1'] },
        },
        {
          id: 'E2', skill: 'signs', requires: ['mukhtalifayn'],
          prompt: <Q source={SELF.E2.source}><MathText>{'أكبر الأعداد في القائمة $-0{,}5$ ؛ $0$ ؛ $-3{,}2$ ؛ $0{,}25$ ؛ $-15$ هو:'}</MathText></Q>,
          options: ['$0{,}25$', '$0$', '$-15$', '$-0{,}5$'], correct: 0, cols: 2,
          explain: <MathText>{'العدد الموجب الوحيد $0{,}25$ أكبر من الصفر ومن كل عدد سالب.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-nisbiya_P2'] },
        },
        {
          id: 'E3', skill: 'order', requires: ['tartib'],
          prompt: <Q source={PLATFORM}><MathText>{'الترتيب التصاعدي للأعداد $-1{,}5$ ؛ $0$ ؛ $-3{,}2$ ؛ $0{,}5$ ؛ $-15$ هو:'}</MathText></Q>,
          options: ['$-15 < -3{,}2 < -1{,}5 < 0 < 0{,}5$', '$0{,}5 < 0 < -1{,}5 < -3{,}2 < -15$', '$-1{,}5 < -3{,}2 < -15 < 0 < 0{,}5$', '$0 < 0{,}5 < -1{,}5 < -3{,}2 < -15$'], correct: 0, cols: 1,
          explain: <MathText>{'السالبة أوّلًا بالأبعد عن الصفر فالأقرب: $-15 < -3{,}2 < -1{,}5$ ، ثم الصفر، ثم $0{,}5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-nisbiya_P3'] },
        },
        {
          id: 'E4', skill: 'negatives', requires: ['salibayn'],
          prompt: <Q source={SELF.E4.source}><MathText>{'العدد $x$ محصور بين $-6$ و $-2$ (متباينة صارمة) إذا كان:'}</MathText></Q>,
          options: ['$x = -4$', '$x = -7$', '$x = 0$', '$x = -2$'], correct: 0, cols: 2,
          explain: <MathText>{'$-6 < -4 < -2$ . ($-7$ أبعد من $-6$ ، و $0$ أكبر من $-2$ ، و $-2$ أحد الحدّين نفسه.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-nisbiya_P1'] },
        },
        {
          id: 'E5', skill: 'between', requires: ['hasr'],
          prompt: <Q source={PLATFORM}><MathText>{'عدد محصور بين $-3{,}5$ و $-3{,}4$ (متباينة صارمة) هو:'}</MathText></Q>,
          options: ['$-3{,}45$', '$-3{,}6$', '$-3{,}3$', '$-3{,}5$'], correct: 0, cols: 2,
          explain: <MathText>{'$-3{,}50 < -3{,}45 < -3{,}40$ . ($-3{,}5$ هو أحد الحدّين نفسه.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_muqarana-nisbiya_P3'] },
        },
      ]}
      badges={[
        { id: 'negatives', emoji: '➖', label: 'أقارن سالبين', test: (m) => (m.negatives ?? 0) === 0 },
        { id: 'order', emoji: '📶', label: 'أرتّب الأعداد', test: (m) => (m.order ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مقارنة الأعداد النسبية',
        title: 'انتهى درس مقارنة وترتيب أعداد نسبية',
        message: 'تعرف الآن أنّ السالب أصغر من الصفر ومن كل موجب، وأنّ الأصغر بين سالبين هو الأبعد عن الصفر، وأنّ الأصغر بين موجبين هو الأقرب إليه، وترتّب الأعداد بالرمزين $<$ و $>$ .',
        verbs: ['أقارن', 'أرتّب', 'أحصر'],
        masterBadgeLabel: 'مقارنة الأعداد النسبية',
      }}
    />
  );
}
