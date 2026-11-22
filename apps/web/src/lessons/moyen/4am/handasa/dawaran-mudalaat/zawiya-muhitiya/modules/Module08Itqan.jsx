import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_QCM2, FIG_QCM3, FIG_TEST_SAME } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : les items 2 et 3 de « أؤكّد تعلّماتي » (p. 160, extraction › destinations › qcm, duplicatedIn ce درس) — l'item
 * 3 dit en une parenthèse que l'angle plat BOC (180°) compte comme angle au centre (extraction › discrepancies) — et trois
 * épreuves de la plateforme : l'angle au centre à partir de l'inscrit (P2), deux inscrits sur le même arc (P3), un sommet à
 * l'intérieur du cercle (P1). Chaque épreuve évalue UN point ; P1–P3 couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, source, figure }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={source} /></span>
    {figure && <GeoFigure {...figure} inline />}
  </span>
);

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="5 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        tarif: { label: 'الزاوية المركزية والزاوية المحيطية', module: 2 },
        nisf: { label: 'المحيطية نصف المركزية', module: 2 },
        tasawi: { label: 'محيطيتان تحصران نفس القوس', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'tarif', requires: ['tarif'],
          prompt: <Q source={QCM[2].source} figure={FIG_QCM2}>{`${QCM[2].text}:`}</Q>,
          options: QCM[2].options.map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'A على الدائرة وضلعا $\\widehat{BAC}$ يقطعانها، و O مركزها: $\\widehat{BOC}$ مركزية تحصر نفس القوس BC. أما D فخارج الدائرة (فـ $\\widehat{BDC}$ ليست محيطية) و E ليست المركز.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_zawiya-muhitiya_P1'] },
        },
        {
          id: 'E2', skill: 'nisf', requires: ['khassiya-nisf', 'qutr-qaima'],
          prompt: <Q source={QCM[3].source} figure={FIG_QCM3}>{`${QCM[3].text} (${QCM[3].reading}):`}</Q>,
          options: QCM[3].options.map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\widehat{BOC} = 180^\\circ$ و $\\widehat{BAC} = 90^\\circ = \\dfrac{1}{2}\\widehat{BOC}$ . والخيار الثالث خاطئ: A ليست منتصف القوس BC (على الشكل $AB < AC$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_zawiya-muhitiya_P2'] },
        },
        {
          id: 'E3', skill: 'nisf', requires: ['khassiya-nisf'],
          prompt: <Q source={PLATFORM_SOURCE}>{'في دائرة مركزها O، الزاوية المحيطية $\\widehat{AMB}$ قيسها $35^\\circ$ . الزاوية المركزية $\\widehat{AOB}$ التي تحصر معها نفس القوس قيسها:'}</Q>,
          options: [
            '$70^\\circ$',
            '$17{,}5^\\circ$', // la moitié au lieu du double (MISC-MUHITIYA-DIF à l'envers)
            '$35^\\circ$', // les deux angles crus égaux
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'المحيطية نصف المركزية، فالمركزية ضعف المحيطية: $\\widehat{AOB} = 2 \\times 35^\\circ = 70^\\circ$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_zawiya-muhitiya_P2'] },
        },
        {
          id: 'E4', skill: 'tasawi', requires: ['khassiya-tasawi'],
          prompt: <Q source={PLATFORM_SOURCE} figure={FIG_TEST_SAME}>{'C و D نقطتان من الدائرة على نفس القوس، و $\\widehat{ACB} = 48^\\circ$ . إذن $\\widehat{ADB}$ يساوي:'}</Q>,
          options: [
            '$48^\\circ$',
            '$96^\\circ$', // l'angle au centre
            '$24^\\circ$', // la moitié de l'inscrit
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$\\widehat{ACB}$ و $\\widehat{ADB}$ زاويتان محيطيتان تحصران نفس القوس AB: متقايستان، $48^\\circ$ . ($96^\\circ$ هي الزاوية المركزية $\\widehat{AOB}$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_zawiya-muhitiya_P3'] },
        },
        {
          id: 'E5', skill: 'tarif', requires: ['tarif'],
          prompt: <Q source={PLATFORM_SOURCE}>{'M نقطة داخل دائرة مركزها O وتختلف عن O، و A و B نقطتان من الدائرة. الزاوية $\\widehat{AMB}$ :'}</Q>,
          options: [
            'ليست محيطية ولا مركزية: رأسها ليس على الدائرة ولا في المركز',
            'محيطية، لأن A و B على الدائرة', // les extrémités ne suffisent pas : le sommet
            'مركزية، لأن رأسها داخل الدائرة', // seul le centre O
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'الزاوية المركزية رأسها المركز O بالذات، والمحيطية رأسها على الدائرة. رأس $\\widehat{AMB}$ داخل الدائرة ويختلف عن O: ليست هذه ولا تلك (التمرين 12).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_zawiya-muhitiya_P1'] },
        },
      ]}
      badges={[
        { id: 'tarif', emoji: '⭕', label: 'مركزية ومحيطية', test: (m) => (m.tarif ?? 0) === 0 },
        { id: 'nisf', emoji: '½', label: 'نصف المركزية', test: (m) => (m.nisf ?? 0) === 0 },
        { id: 'tasawi', emoji: '⚽', label: 'نفس القوس', test: (m) => (m.tasawi ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الزاوية المحيطية والزاوية المركزية',
        title: 'انتهى الدرس 3',
        message: 'تعرف الآن أن الزاوية المحيطية قيسها نصف قيس الزاوية المركزية التي تحصر معها نفس القوس، وأن الزوايا المحيطية التي تحصر نفس القوس متقايسة — من أي موضع يسدّد الرامي على الدائرة.',
        verbs: ['أميّز', 'أنصّف', 'أقارن', 'أبرهن'],
        masterBadgeLabel: 'زاوية التسديد',
      }}
    />
  );
}
