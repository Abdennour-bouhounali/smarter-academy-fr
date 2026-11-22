import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, trois réécrites à partir de « أؤكّد تعلّماتي » 1 à 3
 * (autres nombres) plus deux épreuves de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées
 * en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
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
        read: { label: 'قراءة إحداثيي نقطة', module: 1 },
        axis: { label: 'النقطة على محور', module: 1 },
        sym: { label: 'نظيرة بالنسبة إلى محور', module: 1 },
        region: { label: 'منطقة النقطة', module: 2 },
        frame: { label: 'المعلم المتعامد والمتجانس', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'read', requires: ['ihdathiyan'],
          prompt: <Q source={SELF.E1.source}><MathText>{'نقطة على بعد $3$ وحدات يمين المبدأ ووحدتين تحت محور الفواصل. إحداثياها:'}</MathText></Q>,
          options: ['$(3\\,;-2)$', '$(-2\\,;3)$', '$(3\\,;2)$', '$(-3\\,;-2)$'], correct: 0, cols: 2,
          explain: <MathText>{'الفاصلة أولًا: $3$ لأنّها يمين المبدأ، ثم الترتيب $-2$ لأنّها تحت المحور الأفقي: $(3\\,;-2)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-nuqta-mustawi_P2'] },
        },
        {
          id: 'E2', skill: 'axis', requires: ['nuqta-ala-mihwar'],
          prompt: <Q source={SELF.E2.source}><MathText>{'النقطة $(0\\,;-4)$ تقع:'}</MathText></Q>,
          options: ['على محور التراتيب', 'على محور الفواصل', 'في المبدأ', 'تحت محور الفواصل وعلى يمين محور التراتيب'], correct: 0, cols: 1,
          explain: <MathText>{'فاصلتها $0$ فهي على محور التراتيب، وترتيبها $-4$ : تحت المبدأ، وليست على محور الفواصل.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-nuqta-mustawi_P3'] },
        },
        {
          id: 'E3', skill: 'sym', requires: ['nadhira-mihwar'],
          prompt: <Q source={SELF.E3.source}><MathText>{'نظيرة النقطة $(-5\\,;2)$ بالنسبة إلى محور الفواصل:'}</MathText></Q>,
          options: ['$(-5\\,;-2)$', '$(5\\,;2)$', '$(5\\,;-2)$', '$(2\\,;-5)$'], correct: 0, cols: 2,
          explain: <MathText>{'الفاصلة تبقى $-5$ والترتيب يصير معاكسه $-2$ : $(-5\\,;-2)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-nuqta-mustawi_P3'] },
        },
        {
          id: 'E4', skill: 'region', requires: ['manatiq'],
          prompt: <Q source={PLATFORM}><MathText>{'موضع النقطة $(-2{,}5\\,;1{,}5)$ :'}</MathText></Q>,
          options: ['فوق محور الفواصل وعلى يسار محور التراتيب', 'فوق محور الفواصل وعلى يمين محور التراتيب', 'تحت محور الفواصل وعلى يسار محور التراتيب', 'تحت محور الفواصل وعلى يمين محور التراتيب'], correct: 0, cols: 1,
          explain: <MathText>{'الفاصلة $-2{,}5$ سالبة فهي يسار محور التراتيب، والترتيب $1{,}5$ موجب فهي فوق محور الفواصل.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-nuqta-mustawi_P2'] },
        },
        {
          id: 'E5', skill: 'frame', requires: ['maalam-mutajanis'],
          prompt: <Q source={PLATFORM}><MathText>{'معلم وحدته على المحور الأفقي مربّعان وعلى المحور العمودي مربّع واحد، ومحوراه متعامدان. هذا المعلم:'}</MathText></Q>,
          options: ['متعامد وغير متجانس', 'متعامد ومتجانس', 'غير متعامد', 'لا يمكن القراءة فيه'], correct: 0, cols: 1,
          explain: <MathText>{'المحوران متعامدان لكنّ الوحدتين مختلفتان، فالمعلم غير متجانس: القراءة فيه ممكنة لكنّ الأشكال تتشوّه.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-nuqta-mustawi_P1'] },
        },
      ]}
      badges={[
        { id: 'read', emoji: '📍', label: 'أقرأ الإحداثيات', test: (m) => (m.read ?? 0) === 0 },
        { id: 'sym', emoji: '🪞', label: 'أجد النظيرة', test: (m) => (m.sym ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت تعليم نقطة في المستوي',
        title: 'انتهى درس تعليم نقطة في المستوي',
        message: 'تعرف الآن أنّ موضع نقطة في معلم متعامد ومتجانس يحدّده عددان: الفاصلة ثم الترتيب، وأنّ إحداثيات نقطة على محور إحداها معدومة، وأنّ نظيرة نقطة بالنسبة إلى محور تحتفظ بالإحداثية التي عليه وتعاكس الأخرى.',
        verbs: ['أقرأ', 'أضع', 'أجد'],
        masterBadgeLabel: 'تعليم نقطة في المستوي',
      }}
    />
  );
}
