import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune : deux réécrites à partir de
 * « أؤكّد تعلّماتي » 3–4 (autres nombres), trois de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js)
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
        addsub: { label: 'الجمع والطرح على المتباينة', module: 1 },
        mulpos: { label: 'الضرب في عدد موجب', module: 1 },
        mulneg: { label: 'الضرب في عدد سالب', module: 1 },
        deduce: { label: 'استنتاج متباينة طرفها الأول x', module: 3 },
        bracket: { label: 'حصر عبارة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'addsub', requires: ['jam-mutabayina'],
          prompt: <Q source={PLATFORM}><MathText>{'$a<b$ . أيّ عبارة صحيحة دائمًا؟'}</MathText></Q>,
          options: ['$a-4<b-4$', '$a-4>b-4$', '$a+4<b-4$', '$a-4=b-4$'], correct: 0, cols: 2,
          explain: <MathText>{'نطرح $4$ من طرفي $a<b$ : $a-4<b-4$ . الطرح لا يغيّر الاتجاه، ولا يحقّ أن نضيف عددين مختلفين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_mutabayinat-amaliyat_P1'] },
        },
        {
          id: 'E2', skill: 'mulpos', requires: ['darb-mujab'],
          prompt: <Q source={PLATFORM}><MathText>{'$x<6$ ، إذن:'}</MathText></Q>,
          options: ['$3x<18$', '$3x>18$', '$3x<6$', '$3x<2$'], correct: 0, cols: 2,
          explain: <MathText>{'نضرب طرفي $x<6$ في $3$ وهو موجب: $3x<18$ . الضرب في موجب لا يغيّر الاتجاه ويشمل الطرفين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_mutabayinat-amaliyat_P2'] },
        },
        {
          id: 'E3', skill: 'mulneg', requires: ['darb-salib'],
          prompt: <Q source={SELF.E3.source}><MathText>{'$y\\geq -2$ ، إذن:'}</MathText></Q>,
          options: ['$-5y\\leq 10$', '$-5y\\geq 10$', '$-5y\\geq -10$', '$-5y\\leq -10$'], correct: 0, cols: 2,
          explain: <MathText>{'نضرب طرفي $y\\geq -2$ في $-5$ وهو سالب فينعكس الاتجاه: $-5y\\leq 10$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_mutabayinat-amaliyat_P3'] },
        },
        {
          id: 'E4', skill: 'deduce', requires: ['istintaj'],
          prompt: <Q source={SELF.E4.source}><MathText>{'$-4x>12$ ، ومتباينة طرفها الأول $x$ هي:'}</MathText></Q>,
          options: ['$x<-3$', '$x>-3$', '$x>3$', '$x<-12$'], correct: 0, cols: 2,
          explain: <MathText>{'نقسم طرفي $-4x>12$ على $-4$ وهو سالب فينعكس الاتجاه: $x<-3$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_mutabayinat-amaliyat_P4'] },
        },
        {
          id: 'E5', skill: 'bracket', requires: ['hasr-ab'],
          prompt: <Q source={PLATFORM}><MathText>{'$2\\leq t\\leq 4$ ، وحصر $5-2t$ هو:'}</MathText></Q>,
          options: ['$-3\\leq 5-2t\\leq 1$', '$1\\leq 5-2t\\leq 3$', '$9\\leq 5-2t\\leq 13$', '$-8\\leq 5-2t\\leq -4$'], correct: 0, cols: 1,
          explain: <MathText>{'نضرب في $-2$ : $-8\\leq -2t\\leq -4$ ، ثم نضيف $5$ : $-3\\leq 5-2t\\leq 1$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_mutabayinat-amaliyat_P4'] },
        },
      ]}
      badges={[
        { id: 'keep', emoji: '🧶', label: 'أحافظ على الاتجاه', test: (m) => (m.addsub ?? 0) === 0 && (m.mulpos ?? 0) === 0 },
        { id: 'flip', emoji: '🔄', label: 'أعكس الاتجاه في وقته', test: (m) => (m.mulneg ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت المتباينات والعمليات',
        title: 'انتهى درس المتباينات والعمليات',
        message: 'تعرف الآن أنّ الجمع والطرح والضرب في عدد موجب تحفظ اتجاه المتباينة، وأنّ الضرب أو القسمة في عدد سالب تعكسه، وتستنتج متباينة من أخرى وتحصر عبارة.',
        verbs: ['أجمع', 'أضرب', 'أحصر'],
        masterBadgeLabel: 'المتباينات والعمليات',
      }}
    />
  );
}
