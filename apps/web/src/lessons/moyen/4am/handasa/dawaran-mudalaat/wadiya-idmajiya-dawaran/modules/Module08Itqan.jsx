import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST } from '../content/textbook';
import { TEST_FIGURE } from '../content/figures';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la وضعية TRANSPOSÉE (extraction › situation › duplicatedIn module 8) — huit
 * lampadaires autour d'un rond-point d'Oran de rayon 5 m (content/textbook.js › TEST) ; aucune réponse n'apparaît ailleurs.
 *   E1 (P2)  la modélisation : un octogone régulier inscrit dans le cercle de 5 m (pas de côté 5 m, pas sept arcs)
 *   E2 (P1)  le دوران qui porte chaque lampadaire sur le suivant : centre O, 45°
 *   E3 (P3)  le triangle rectangle OHP₁ : sin 22,5° = P₁H / 5
 *   E4 (P3)  la distance arrondie au centième : 10 sin 22,5° ≈ 3,83 m
 *   E5 (P1)  le câble du tour : 8 × d ≈ 30,61 m (arrondir d d'abord donne 30,64)
 * Chaque distracteur est FAUX (MISC-MUNTAZAM-DIL, -AMDA, -180, -MARKAZIYA, MISC-MUHITIYA-DIF, l'arc, l'angle entier, l'arrondi
 * trop tôt) ; une seule LP primaire par épreuve, les trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['رؤوس ثماني منتظم محاط بدائرة الدوّار (نصف قطرها $5\\,\\mathrm{m}$ )', 'رؤوس ثماني منتظم طول ضلعه $5\\,\\mathrm{m}$', 'رؤوس ثماني منتظم محاط بدائرة نصف قطرها $2{,}5\\,\\mathrm{m}$', 'ثماني نقط كيفية على حافة الدوّار'];
const O2 = ['الدوران الذي مركزه O وزاويته $45^\\circ$', 'الدوران الذي مركزه O وزاويته $22{,}5^\\circ$', 'الدوران الذي مركزه O وزاويته $135^\\circ$', 'الدوران الذي مركزه $P_1$ وزاويته $45^\\circ$'];
const O3 = ['$\\sin 22{,}5^\\circ = \\dfrac{P_1H}{5}$', '$\\sin 45^\\circ = \\dfrac{P_1H}{5}$', '$\\cos 22{,}5^\\circ = \\dfrac{P_1H}{5}$', '$\\sin 22{,}5^\\circ = \\dfrac{5}{P_1H}$'];
const O4 = ['$3{,}83\\,\\mathrm{m}$', '$5\\,\\mathrm{m}$', '$3{,}93\\,\\mathrm{m}$', '$7{,}07\\,\\mathrm{m}$'];
const O5 = ['$30{,}61\\,\\mathrm{m}$', '$30{,}64\\,\\mathrm{m}$', '$31{,}42\\,\\mathrm{m}$', '$40\\,\\mathrm{m}$'];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="وضعية أخرى: الموارد نفسها، أعداد أخرى" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={6 * 60} timerLabel="6 دقائق"
      brief={{
        tag: 'أدمج تعلّماتي — وضعية من المنصّة', title: TEST.title, tone: 'amber',
        body: (
          <div className="space-y-2" data-situation="itqan">
            <p><MathText>{TEST.text}</MathText></p>
            <GeoFigure {...TEST_FIGURE} />
          </div>
        ),
      }}
      skills={{
        qiraa: { label: 'نمذجة الوضعية', module: 7 },
        dawaran: { label: 'الدوران والزاوية المركزية', module: 7 },
        hisab: { label: 'المسافة في المثلث القائم', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'qiraa', requires: ['tawzi-dawaran'], prompt: <Q>مواضع الأعمدة الثمانية هي:</Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 1,
          explain: <MathText>{'ثماني نقط متباعدة بنفس المسافة على دائرة هي رؤوس ثماني منتظم مركزه مركز الدائرة، ونصف قطر دائرته المحيطة نصف قطر الدوّار $5\\,\\mathrm{m}$ . الضلع لا يساوي نصف القطر (هذا في السداسي فقط)، و $2{,}5\\,\\mathrm{m}$ نصف نصف القطر، والنقط الكيفية لا تكون متساوية التباعد.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P2'] } },
        { id: 'E2', skill: 'dawaran', requires: ['tawzi-dawaran'], prompt: <Q>الدوران الذي يحوّل كل عمود إلى العمود الموالي هو:</Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 1,
          explain: <MathText>{'ثمانية أقواس متقايسة تملأ الدورة: $\\dfrac{360^\\circ}{8} = 45^\\circ$ ، والمركز مركز الدوّار. $22{,}5^\\circ$ هي نصف الزاوية (في المثلث القائم)، و $135^\\circ$ زاوية الثماني الداخلية، والدوران حول عمود لا يُبقي الأعمدة على الدائرة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P1'] } },
        { id: 'E3', skill: 'hisab', requires: ['qanun-masafa'], prompt: <Q><MathText>{'في المثلث $OHP_1$ القائم في H، العلاقة الصحيحة هي:'}</MathText></Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 2,
          explain: <MathText>{'الارتفاع $[OH]$ ينصّف الزاوية المركزية: $\\widehat{P_1OH} = 22{,}5^\\circ$ ، والضلع المقابل لها $[P_1H]$ والوتر $[OP_1]$ طوله $5$ : $\\sin 22{,}5^\\circ = \\dfrac{P_1H}{5}$ . $45^\\circ$ هي الزاوية كاملة، وجيب التمام يعطي $OH$ ، والكسر الأخير مقلوب.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P3'] } },
        { id: 'E4', skill: 'hisab', requires: ['qanun-masafa'], prompt: <Q><MathText>{'المسافة بين عمودين متتاليين مدوّرة إلى $0{,}01$ هي:'}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 4,
          explain: <MathText>{'$P_1P_2 = 2 \\times 5 \\times \\sin 22{,}5^\\circ \\approx 3{,}83\\,\\mathrm{m}$ . $5\\,\\mathrm{m}$ نصف القطر (صحيح للسداسي فقط)، و $3{,}93\\,\\mathrm{m}$ طول القوس $\\dfrac{2\\pi \\times 5}{8}$ على حافة الدوّار، و $7{,}07\\,\\mathrm{m}$ من $2 \\times 5 \\times \\sin 45^\\circ$ (الزاوية كاملة بدل نصفها).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P3'] } },
        { id: 'E5', skill: 'dawaran', requires: ['qanun-masafa'], prompt: <Q><MathText>{'طول الكابل الذي يربط الأعمدة الثمانية على التوالي (محيط الثماني) مدوّرا إلى $0{,}01$ هو:'}</MathText></Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 4,
          explain: <MathText>{'الأضلاع الثمانية متقايسة (كل ضلع صورة السابق بالدوران): $8 \\times 10\\sin 22{,}5^\\circ \\approx 30{,}61\\,\\mathrm{m}$ . $8 \\times 3{,}83 = 30{,}64$ لأنّ التدوير جاء قبل الضرب، و $31{,}42\\,\\mathrm{m}$ محيط الدائرة $10\\pi$ ، و $40\\,\\mathrm{m}$ من ضلع يساوي نصف القطر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🌸', label: 'أدمجت تعلّماتي', test: (m) => (m.qiraa ?? 0) + (m.dawaran ?? 0) + (m.hisab ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 13', title: 'الدوران - الزوايا - المضلّعات المنتظمة', message: 'ماذا يربط بين المضلع المنتظم والدوران والزاوية المركزية؟ وكيف نحسب المسافة بين رأسين متتاليين؟ هذا ما جمعته من دروس الوحدة.', verbs: ['أقرأ', 'أنمذج', 'أدوّر', 'أحسب'], masterBadgeLabel: 'الوحدة 13' }} />
  );
}
