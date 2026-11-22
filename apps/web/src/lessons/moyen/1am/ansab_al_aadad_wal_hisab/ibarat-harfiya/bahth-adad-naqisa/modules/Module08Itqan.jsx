import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { FINAL } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (« أقوّم تعلّماتي » 5 réécrit en E5, autres nombres) : une الكفاءة principale par épreuve.
 * Toutes les clés sont recalculées en arithmétique exacte dans ../content/content.test.js ; chaque distracteur y est vérifié FAUX.
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
        translate: { label: 'ترجمة وضعية بمساواة', module: 1 },
        sum: { label: 'العدد الناقص في مجموع', module: 1 },
        diff: { label: 'العدد الناقص في فرق', module: 1 },
        prod: { label: 'العدد الناقص في جداء', module: 1 },
        check: { label: 'التحقّق بالتعويض', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'translate', requires: ['musawat-naqisa'],
          prompt: <Q source={PLATFORM}><MathText>{'اشترى سمير أقلامًا ثمّ أضاف إليها 8 أقلام فصار عنده 35 قلمًا. المساواة التي تترجم الوضعية (□ هو عدد الأقلام الأولى) هي:'}</MathText></Q>,
          options: ['$\\square+8=35$', '$\\square-8=35$', '$8\\times\\square=35$', '$8+35=\\square$'], correct: 0, cols: 2,
          explain: <MathText>{'العدد الأوّل □ زاد عليه 8 فصار 35 : $\\square+8=35$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_bahth-adad-naqisa_P1'] },
        },
        {
          id: 'E2', skill: 'sum', requires: ['naqis-majmu'],
          prompt: <Q source={PLATFORM}><MathText>{'العدد الناقص في $67+\\square=150$ هو:'}</MathText></Q>,
          options: ['$83$', '$217$', '$73$', '$150$'], correct: 0, cols: 2,
          explain: <MathText>{'في مجموع نطرح المعلوم من الناتج: $150-67=83$ ، ونتحقّق: $67+83=150$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_bahth-adad-naqisa_P2'] },
        },
        {
          id: 'E3', skill: 'diff', requires: ['naqis-farq'],
          prompt: <Q source={PLATFORM}><MathText>{'العدد الناقص □ في $120-\\square=45$ هو:'}</MathText></Q>,
          options: ['$75$', '$165$', '$45$', '$85$'], correct: 0, cols: 2,
          explain: <MathText>{'المطروح هو المجهول: $\\square=120-45=75$ ، ونتحقّق: $120-75=45$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_bahth-adad-naqisa_P2'] },
        },
        {
          id: 'E4', skill: 'prod', requires: ['naqis-judaa'],
          prompt: <Q source={PLATFORM}><MathText>{'العدد الناقص في $8\\times\\square=30$ هو:'}</MathText></Q>,
          options: ['$3{,}75$', '$240$', '$22$', '$\\frac{8}{30}$'], correct: 0, cols: 2,
          explain: <MathText>{'في جداء نقسم الناتج على المعلوم: $30\\div 8=3{,}75$ ، ونتحقّق: $8\\times 3{,}75=30$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_bahth-adad-naqisa_P3'] },
        },
        {
          id: 'E5', skill: 'check', requires: ['tahaqquq'],
          prompt: <Q source={FINAL[4].source}><MathText>{'جمعتُ عددًا وضعفه وثلاثة أمثاله فوجدتُ $102$ . العدد الذي بدأتُ به هو:'}</MathText></Q>,
          options: ['$17$', '$34$', '$71$', '$7$'], correct: 0, cols: 2,
          explain: <MathText>{'العدد وضعفه وثلاثة أمثاله هي ستة أمثال العدد: $6\\times\\square=102$ فـ $\\square=17$ ؛ نتحقّق: $17+34+51=102$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_bahth-adad-naqisa_P3'] },
        },
      ]}
      badges={[
        { id: 'murjia', emoji: '⏪', label: 'أُرجع الحزام', test: (m) => (m.translate ?? 0) === 0 && (m.sum ?? 0) === 0 && (m.diff ?? 0) === 0 },
        { id: 'mutahaqqiq', emoji: '✅', label: 'أتحقّق من النتيجة', test: (m) => (m.prod ?? 0) === 0 && (m.check ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت البحث عن الأعداد الناقصة',
        title: 'انتهى درس البحث عن أعداد ناقصة',
        message: 'تعرف الآن أنّ العدد الناقص □ يُوجَد بالعملية العكسية: الطرح للجمع، والجمع للطرح (وفي « a − □ » نطرح الناتج من a)، والقسمة للضرب، وأنّ التحقّق بالتعويض هو الذي يؤكّد النتيجة.',
        verbs: ['أترجم', 'أُرجع', 'أتحقّق'],
        masterBadgeLabel: 'الأعداد الناقصة',
      }}
    />
  );
}
