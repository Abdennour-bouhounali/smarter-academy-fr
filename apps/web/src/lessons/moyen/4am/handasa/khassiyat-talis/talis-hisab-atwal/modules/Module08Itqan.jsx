import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_QCM1, FIG_QCM2, FIG_E3, FIG_E4 } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Six épreuves : les items 1 et 2 de « أؤكّد تعلّماتي » (p. 112, extraction › destinations › qcm, duplicatedIn
 * ce درس, items 1–2 — une cellule par épreuve : x de l'item 1, y de l'item 2) et quatre de la plateforme
 * (P1 : la bonne égalité sur deux figures nouvelles, dont la فراشة ; P3 : k d'une réduction, une longueur
 * agrandie). Chaque épreuve évalue UN point d'apprentissage ; P1–P3 sont couverts. Aucun nombre des modules.
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
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        nisab: { label: 'وضعية طالس والنسب المتساوية', module: 2 },
        hisab: { label: 'حساب أطوال', module: 3 },
        muamil: { label: 'معامل التكبير والتصغير', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'hisab', requires: ['hisab-atwal'],
          prompt: <Q source={QCM[1].source} figure={FIG_QCM1}>{`${QCM[1].text} — قيمة $x = IJ$ هي:`}</Q>,
          options: ['$6$', '$1{,}5$', '$\\dfrac{3}{2}$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$AB = 3 + 2 = 5$ و $\\dfrac{AI}{AB} = \\dfrac{IJ}{BC}$ أي $\\dfrac{3}{5} = \\dfrac{x}{10}$ ومنه $x = 6$ . ($1{,}5 = \\dfrac{3}{2}$ يأتي من $\\dfrac{AI}{IB}$ : قطعة بدل ضلع، وقلب للنسبة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_talis-hisab-atwal_P2'] },
        },
        {
          id: 'E2', skill: 'hisab', requires: ['hisab-atwal'],
          prompt: <Q source={QCM[2].source} figure={FIG_QCM2}>{`${QCM[2].text} — قيمة $y = AC$ هي:`}</Q>,
          options: ['$6$', '$24$', '$3$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'المثلثان ALM و ABC في وضعية طالس (وضعية الفراشة): $\\dfrac{AM}{AC} = \\dfrac{LM}{BC}$ أي $\\dfrac{3}{y} = \\dfrac{2}{4}$ ومنه $y = 6$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_talis-hisab-atwal_P2'] },
        },
        {
          id: 'E3', skill: 'nisab', requires: ['khassiyat-talis'],
          prompt: <Q source={PLATFORM_SOURCE} figure={FIG_E3}>{'المستقيمان $(SU)$ و $(TV)$ متقاطعان في R، و $(ST) \\parallel (UV)$ . حسب خاصية طالس:'}</Q>,
          options: ['$\\dfrac{RS}{RU} = \\dfrac{RT}{RV} = \\dfrac{ST}{UV}$', '$\\dfrac{RS}{SU} = \\dfrac{RT}{TV} = \\dfrac{ST}{UV}$', '$\\dfrac{RS}{RV} = \\dfrac{RT}{RU} = \\dfrac{ST}{UV}$'].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'المثلثان RST و RUV: S يقابل U و T يقابل V. ($SU$ و $TV$ قطعتان وليستا ضلعين، و $\\dfrac{RS}{RV}$ يقرن S بـ V.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_talis-hisab-atwal_P1'] },
        },
        {
          id: 'E4', skill: 'nisab', requires: ['khassiyat-talis'],
          prompt: <Q source={PLATFORM_SOURCE} figure={FIG_E4}>{'المستقيمان $(KP)$ و $(LQ)$ متقاطعان في O، و $(KL) \\parallel (PQ)$ . ينتج:'}</Q>,
          options: ['$\\dfrac{OK}{OP} = \\dfrac{OL}{OQ} = \\dfrac{KL}{PQ}$', '$\\dfrac{OK}{OQ} = \\dfrac{OL}{OP} = \\dfrac{KL}{PQ}$', 'لا تُطبَّق خاصية طالس لأن النقط من جهتين مختلفتين للنقطة O'].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'خاصية طالس صحيحة أيضا في وضعية الفراشة: K يقابل P و L يقابل Q، فـ $\\dfrac{OK}{OP} = \\dfrac{OL}{OQ} = \\dfrac{KL}{PQ}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_talis-hisab-atwal_P1'] },
        },
        {
          id: 'E5', skill: 'muamil', requires: ['muamil-tanasub'],
          prompt: <Q source={PLATFORM_SOURCE}>{'المثلثان AMN و ABC في وضعية طالس، حيث $AM = 4$ و $AB = 10$ . المثلث AMN هو:'}</Q>,
          options: ['تصغير للمثلث ABC بمعامل $\\dfrac{2}{5}$', 'تكبير للمثلث ABC بمعامل $\\dfrac{5}{2}$', 'تصغير للمثلث ABC بمعامل $6$'].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$k = \\dfrac{AM}{AB} = \\dfrac{4}{10} = \\dfrac{2}{5} < 1$ : تصغير. ($\\dfrac{5}{2}$ معامل تكبير ABC انطلاقا من AMN، و 6 هو الفرق $10 - 4$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_talis-hisab-atwal_P3'] },
        },
        {
          id: 'E6', skill: 'muamil', requires: ['muamil-tanasub'],
          prompt: <Q source={PLATFORM_SOURCE}>{"المثلث AB′C′ تكبير للمثلث ABC بمعامل $k = \\dfrac{3}{2}$ ، و $BC = 4$ . إذن $B'C'$ يساوي:"}</Q>,
          options: ['$6$', '$5{,}5$', '$\\dfrac{8}{3}$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{"$B'C' = k \\times BC = \\dfrac{3}{2} \\times 4 = 6$ . ($5{,}5$ يضيف 1,5 ولا يضرب، و $\\dfrac{8}{3}$ يقسم على k: ذلك تصغير.)"}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_talis-hisab-atwal_P3'] },
        },
      ]}
      badges={[
        { id: 'nisab', emoji: '📐', label: 'وضعية طالس', test: (m) => (m.nisab ?? 0) === 0 },
        { id: 'hisab', emoji: '📏', label: 'حساب الأطوال', test: (m) => (m.hisab ?? 0) === 0 },
        { id: 'muamil', emoji: '🔍', label: 'التكبير والتصغير', test: (m) => (m.muamil ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت خاصية طالس وحساب الأطوال',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن وضعية طالس والنسب الثلاث المتساوية، وتحسب بها أطوالا مجهولة، وتقرأ أحد المثلثين تكبيرا أو تصغيرا للآخر بمعامل k.',
        verbs: ['أتعرّف', 'أكتب النسب', 'أحسب', 'أكبّر وأصغّر'],
        masterBadgeLabel: 'خاصية طالس',
      }}
    />
  );
}
