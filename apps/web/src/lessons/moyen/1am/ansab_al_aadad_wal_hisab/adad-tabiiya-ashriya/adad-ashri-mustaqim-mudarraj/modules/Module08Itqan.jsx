import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (« أقوّم تعلّماتي » 7 réécrit
 * en E3, autres nombres) : une الكفاءة principale par épreuve. Toutes les clés sont recalculées en arithmétique décimale exacte dans
 * ../content/content.test.js ; chaque distracteur y est vérifié FAUX.
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
        build: { label: 'تدريج نصف مستقيم', module: 1 },
        tenth: { label: 'التدريجة الصغيرة', module: 1 },
        read: { label: 'قراءة فاصلة', module: 1 },
        plant: { label: 'تعليم نقطة', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'build', requires: ['tadrij-nisf-mustaqim'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ جملة تصف تدريج نصف مستقيم تدريجًا صحيحًا؟'}</MathText></Q>,
          options: [
            'نختار المبدأ $O$ ووحدة طول، وننقل الوحدة ابتداءً من $O$ ، ثم نقسّم كلّ وحدة إلى عشرة أجزاء متساوية',
            'نختار المبدأ $O$ ونقسّم نصف المستقيم كلّه إلى عشرة أجزاء متساوية دون اختيار وحدة',
            'ننقل الوحدة ابتداءً من $O$ ونضع عشر تدريجات على نصف المستقيم كلّه',
            'نختار وحدة طول ونقسّمها إلى عشرة أجزاء دون أن نختار مبدأً',
          ], correct: 0, cols: 1,
          explain: <MathText>{'التدريج يحتاج إلى مبدأ ووحدة تُنقل من المبدأ، وكلّ وحدة تُقسَّم إلى عشرة أجزاء متساوية.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1'] },
        },
        {
          id: 'E2', skill: 'tenth', requires: ['tadrij-nisf-mustaqim'],
          prompt: <Q source={PLATFORM}><MathText>{'وحدة نصف مستقيم مدرّج مقسّمة إلى عشرة أجزاء متساوية. التباعد بين تدريجتين صغيرتين متتاليتين هو:'}</MathText></Q>,
          options: ['$0{,}1$', '$0{,}01$', '$1$', '$10$'], correct: 0, cols: 2,
          explain: <MathText>{'عشرة أجزاء متساوية في الوحدة: كلّ جزء $\\frac{1}{10}=0{,}1$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P1'] },
        },
        {
          id: 'E3', skill: 'read', requires: ['faasila-nuqta'],
          prompt: <Q source={SELF[7].source}><MathText>{'على نصف مستقيم مدرّج وحدته مقسّمة إلى عشرة أجزاء متساوية، فاصلة النقطة $A$ هي $2{,}4$ ، وتقع النقطة $B$ على بعد تدريجتين صغيرتين على يمين $A$ . فاصلة $B$ هي:'}</MathText></Q>,
          options: ['$2{,}6$', '$2{,}2$', '$2{,}42$', '$4{,}4$'], correct: 0, cols: 2,
          explain: <MathText>{'تدريجتان صغيرتان تزيدان $0{,}2$ : $2{,}4+0{,}2=2{,}6$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P2'] },
        },
        {
          id: 'E4', skill: 'plant', requires: ['tariqat-taalim'],
          prompt: <Q source={PLATFORM}><MathText>{'لتعليم النقطة التي فاصلتها $5{,}2$ على نصف مستقيم مدرّج وحدته مقسّمة إلى عشرة أجزاء، نبدأ من $O$ ونعدّ:'}</MathText></Q>,
          options: ['5 وحدات ثم تدريجتين صغيرتين', 'وحدتين ثم 5 تدريجات صغيرة', '52 وحدة', '5 وحدات ثم 20 تدريجة صغيرة'], correct: 0, cols: 1,
          explain: <MathText>{'$5{,}2=5+\\frac{2}{10}$ : خمس وحدات كاملة ثم تدريجتان صغيرتان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P3'] },
        },
        {
          id: 'E5', skill: 'read', requires: ['hasr-faasila'],
          prompt: <Q source={PLATFORM}><MathText>{'يقع علم بين التدريجتين $6{,}4$ و $6{,}5$ المتتاليتين. أيّ كتابة تحصر فاصلته $x$ حصرًا صحيحًا؟'}</MathText></Q>,
          options: ['$6{,}4<x<6{,}5$', '$x=6{,}4$', '$6{,}5<x<6{,}6$', '$4<x<5$'], correct: 0, cols: 2,
          explain: <MathText>{'بين تدريجتين لا نقرأ فاصلة مضبوطة بل نحصرها بين العددين: $6{,}4<x<6{,}5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-ashri-mustaqim-mudarraj_P2'] },
        },
      ]}
      badges={[
        { id: 'tadrij', emoji: '📏', label: 'أدرّج نصف مستقيم', test: (m) => (m.build ?? 0) === 0 && (m.tenth ?? 0) === 0 },
        { id: 'faasila', emoji: '🚩', label: 'أقرأ الفاصلة وأعلّمها', test: (m) => (m.read ?? 0) === 0 && (m.plant ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التدريج على نصف مستقيم',
        title: 'انتهى درس الأعداد العشرية ونصف المستقيم المدرّج',
        message: 'تعرف الآن أنّ نصف المستقيم يُدرَّج بمبدأ ووحدة مقسّمة إلى عشرة أجزاء، وأنّ فاصلة نقطة عددٌ يعيّنها، وأنّ النقطة الواقعة بين تدريجتين تُقرأ بحصر.',
        verbs: ['أدرّج', 'أقرأ', 'أعلّم'],
        masterBadgeLabel: 'نصف المستقيم المدرّج',
      }}
    />
  );
}
