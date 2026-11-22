import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune : deux sommes (réécrites à partir de « أؤكّد تعلّماتي » 7 et 8, autres nombres), deux
 * différences et un « de combien a-t-elle monté ? » de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par
 * ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
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
        same: { label: 'جمع عددين من الإشارة نفسها', module: 1 },
        different: { label: 'جمع عددين من إشارتين مختلفتين', module: 1 },
        subtract: { label: 'طرح عدد نسبي', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'same', requires: ['jam-nafs-ishara'],
          prompt: <Q source={SELF.E1.source}><MathText>{'$(-7)+(-9)$ :'}</MathText></Q>,
          options: ['$-16$', '$16$', '$-2$', '$2$'], correct: 0, cols: 2,
          explain: <MathText>{'الإشارتان متّفقتان: $7+9=16$ ونحتفظ بالإشارة $-$ : $-16$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-nisbiya_P1'] },
        },
        {
          id: 'E2', skill: 'different', requires: ['jam-ishara-mukhtalifa'],
          prompt: <Q source={SELF.E2.source}><MathText>{'$(-13)+(+8)$ :'}</MathText></Q>,
          options: ['$-5$', '$5$', '$-21$', '$21$'], correct: 0, cols: 2,
          explain: <MathText>{'الإشارتان مختلفتان: $13-8=5$ والأبعد عن الصفر $-13$ : $-5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-nisbiya_P2'] },
        },
        {
          id: 'E3', skill: 'subtract', requires: ['tarh-bi-muakis'],
          prompt: <Q source={PLATFORM}><MathText>{'$(+6)-(-4)$ :'}</MathText></Q>,
          options: ['$10$', '$2$', '$-10$', '$-2$'], correct: 0, cols: 2,
          explain: <MathText>{'$(+6)-(-4)=(+6)+(+4)=(+10)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-nisbiya_P3'] },
        },
        {
          id: 'E4', skill: 'subtract', requires: ['tarh-bi-muakis'],
          prompt: <Q source={PLATFORM}><MathText>{'$(-3{,}5)-(+1{,}5)$ :'}</MathText></Q>,
          options: ['$-5$', '$-2$', '$5$', '$2$'], correct: 0, cols: 2,
          explain: <MathText>{'$(-3{,}5)-(+1{,}5)=(-3{,}5)+(-1{,}5)=(-5)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-nisbiya_P3'] },
        },
        {
          id: 'E5', skill: 'subtract', requires: ['tarh-bi-muakis'],
          prompt: <Q source={PLATFORM}><MathText>{'ارتفعت الحرارة من $-4\\,{}^{\\circ}\\mathrm{C}$ إلى $+3\\,{}^{\\circ}\\mathrm{C}$ . بكم ارتفعت؟'}</MathText></Q>,
          options: ['$7$', '$-1$', '$1$', '$-7$'], correct: 0, cols: 2,
          explain: <MathText>{'الارتفاع هو الفرق: $(+3)-(-4)=(+3)+(+4)=(+7)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-nisbiya_P3'] },
        },
      ]}
      badges={[
        { id: 'same', emoji: '🎈', label: 'أجمع عددين', test: (m) => (m.same ?? 0) === 0 && (m.different ?? 0) === 0 },
        { id: 'subtract', emoji: '🪂', label: 'أطرح بجمع المعاكس', test: (m) => (m.subtract ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت جمع وطرح عددين نسبيين',
        title: 'انتهى درس جمع وطرح عددين نسبيين',
        message: 'تعرف الآن أن تجمع عددين نسبيين حسب إشارتيهما وأنّ مجموع المتعاكسين معدوم، وأنّ طرح عدد هو جمع معاكسه.',
        verbs: ['أجمع', 'أطرح', 'أحسب'],
        masterBadgeLabel: 'جمع وطرح عددين نسبيين',
      }}
    />
  );
}
