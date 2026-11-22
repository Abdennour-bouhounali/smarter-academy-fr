import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { FINAL_FIGURES } from '../content/figures';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (réécrites à partir de
 * « أقوّم تعلّماتي » 1, autres surfaces) : une الكفاءة principale par épreuve. Les clés sont recalculées à partir des cellules dans
 * ../content/content.test.js ; chaque distracteur y est vérifié FAUX. Les figures sont posées dans l'énoncé (`inline`).
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
        distinguish: { label: 'المساحة والمحيط', module: 1 },
        tiling: { label: 'تعيين مساحة برصف', module: 3 },
        units: { label: 'الوحدتان', module: 3 },
        compare: { label: 'مقارنة سطحين', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'distinguish', requires: ['mahit-hadd'],
          prompt: <Q source={SELF[1].source}><MathText>{'أيّ هذه الأسئلة يُجاب عنه بمحيط السطح؟'}</MathText></Q>,
          options: ['كم مترًا من الشريط يلزم لإحاطة المسبح مرّة واحدة؟', 'كم بلاطة تغطّي أرض المسبح؟', 'كم بلاطة في كل صفّ من أرض المسبح؟', 'كم صفًّا من البلاطات تغطّي الأرض؟'], correct: 0, cols: 1,
          explain: <MathText>{'الشريط يمرّ على حدّ المسبح: طوله هو المحيط. والأسئلة الأخرى تعدّ بلاطات تغطّي الأرض، أي تخصّ المساحة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_masahat-muhit-sath_P1'] },
        },
        {
          id: 'E2', skill: 'tiling', requires: ['tariqat-rasf'],
          prompt: <Q source={SELF[1].source}><MathText>{'ما مساحة السطح المرسوم، بوحدة المساحة وهي الخانة؟'}</MathText><GeoFigure inline {...FINAL_FIGURES.E2} /></Q>,
          options: ['$6{,}5$', '$7$', '$6$', '$8$'], correct: 0, cols: 2,
          explain: <MathText>{'بلاطات كاملة: 2 في الصفّ الأعلى و 4 في الصفّ الأسفل، أي 6، ونصف بلاطة واحد: $6+\\frac{1}{2}=6{,}5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_masahat-muhit-sath_P2'] },
        },
        {
          id: 'E3', skill: 'units', requires: ['wahdatan-adad'],
          prompt: <Q source={PLATFORM}><MathText>{'مساحة سطح 18 وحدة ①، والوحدة ② ضعف الوحدة ①. كم وحدة ② مساحة هذا السطح؟'}</MathText></Q>,
          options: ['$9$', '$36$', '$18$', '$4{,}5$'], correct: 0, cols: 2,
          explain: <MathText>{'الوحدة ② تغطّي ما تغطّيه وحدتان ①: نحتاج إلى نصف العدد: $18\\div2=9$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_masahat-muhit-sath_P2'] },
        },
        {
          id: 'E4', skill: 'compare', requires: ['thalath-hallat'],
          prompt: <Q source={PLATFORM}><MathText>{'ماذا تقول عن مساحتي الحوشين (أ) و (ب) وعن محيطيهما؟'}</MathText>{FINAL_FIGURES.E4.map((f) => <GeoFigure key={f.caption} inline {...f} />)}</Q>,
          options: ['المساحتان متساويتان والمحيطان مختلفان', 'المساحتان والمحيطان متساويان', 'المحيطان متساويان والمساحتان مختلفتان', 'المساحتان مختلفتان والمحيطان مختلفان'], correct: 0, cols: 1,
          explain: <MathText>{'في كلٍّ منهما ثماني بلاطات. وسياج (أ) اثنتا عشرة عصا وسياج (ب) أربع عشرة عصا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_masahat-muhit-sath_P3'] },
        },
        {
          id: 'E5', skill: 'compare', requires: ['thalath-hallat'],
          prompt: <Q source={PLATFORM}><MathText>{'حوش مربّع من تسع بلاطات سياجه اثنتا عشرة عصا. أيّ العبارات صحيحة؟'}</MathText></Q>,
          options: ['يمكن أن يكون لحوش آخر سياجه اثنتا عشرة عصا وفيه ثماني بلاطات فقط', 'كل حوش سياجه اثنتا عشرة عصا فيه تسع بلاطات', 'كل حوش فيه تسع بلاطات سياجه اثنتا عشرة عصا', 'لا يمكن أن يكون لحوشين المحيط نفسه ومساحتان مختلفتان'], correct: 0, cols: 1,
          explain: <MathText>{'حوش من صفّين في كل صفّ أربع بلاطات فيه ثماني بلاطات وسياجه اثنتا عشرة عصا أيضًا. أمّا تسع بلاطات في صفّ واحد فسياجها عشرون عصا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_masahat-muhit-sath_P3'] },
        },
      ]}
      badges={[
        { id: 'distinguish', emoji: '📐', label: 'أميّز المساحة من المحيط', test: (m) => (m.distinguish ?? 0) === 0 },
        { id: 'compare', emoji: '⚖️', label: 'أقارن السطوح', test: (m) => (m.compare ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مساحة السطح ومحيطه',
        title: 'انتهى درس مساحة سطح مستو ومحيطه',
        message: 'تعرف الآن أنّ المساحة عدد وحدات المساحة التي تغطّي السطح وأنّ المحيط طول حدّه، وأنّ نقل البلاطات يبقي المساحة ويغيّر المحيط، وأنّ العدد الذي يقيس المساحة يتبع الوحدة.',
        verbs: ['أميّز', 'أعيّن', 'أقارن'],
        masterBadgeLabel: 'مساحة سطح ومحيطه',
      }}
    />
  );
}
