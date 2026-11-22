import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST } from '../content/textbook';
import { CONTAINER } from '../content/figures';
import SightLineFigure from '../components/SightLineFigure';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : la وضعية TRANSPOSÉE (extraction › situation › duplicatedIn module 8) —
 * la minaret de جامع الجزائر (265 m) visée par-dessus un réverbère de 4 m planté à 195,75 m, ليندة à 3 m du réverbère,
 * et un conteneur 12 × 2,4 × 2,4 m (content/textbook.js › TEST) ; aucune réponse n'apparaît ailleurs dans la leçon.
 *   E1 (P2)  la distance totale AM = 195,75 + 3 = 198,75
 *   E2 (P3)  l'égalité de Thalès h ÷ 4 = 198,75 ÷ 3
 *   E3 (P1)  h = 4 × 198,75 ÷ 3 = 265 m
 *   E4 (P3)  tan x = 4 ÷ 3 ⇒ x ≈ 53,13° ≈ 53°
 *   E5 (P1)  la diagonale du conteneur √155,52 ≈ 12,47 m
 *   E6 (P2)  l'angle de [AD] avec le sol : DAC (dans le triangle ACD rectangle en C)
 * Chaque distracteur est FAUX (MISC-MUTH-TALIS-NAZAR, MISC-MUTH-NISBA-MAQLUBA, MISC-MUTH-DARB-BADAL-QISMA,
 * MISC-MUTH-NISBA-BADAL-QAYS, MISC-MUTH-ZAWIYA-KHATI, MISC-MUTH-JADHR-NASI) ; une seule LP primaire par épreuve, les
 * trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['$198{,}75\\,\\mathrm{m}$', '$195{,}75\\,\\mathrm{m}$', '$192{,}75\\,\\mathrm{m}$', '$3\\,\\mathrm{m}$'];
const O2 = ['$\\dfrac{h}{4} = \\dfrac{198{,}75}{3}$', '$\\dfrac{h}{4} = \\dfrac{195{,}75}{3}$', '$\\dfrac{4}{h} = \\dfrac{198{,}75}{3}$', '$h = 4 + 195{,}75$'];
const O3 = ['$265\\,\\mathrm{m}$', '$261\\,\\mathrm{m}$', '$795\\,\\mathrm{m}$', '$0{,}06\\,\\mathrm{m}$'];
const O4 = ['$53^{\\circ}$', '$37^{\\circ}$', '$1{,}33^{\\circ}$', '$45^{\\circ}$'];
const O5 = ['$12{,}47\\,\\mathrm{m}$', '$12{,}24\\,\\mathrm{m}$', '$16{,}8\\,\\mathrm{m}$', '$155{,}52\\,\\mathrm{m}$'];
const O6 = ['$\\widehat{DAC}$', '$\\widehat{DAB}$', '$\\widehat{ADC}$', '$\\widehat{DAF}$'];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="إختبار أولي" moduleSubtitle="وضعية أخرى: الموارد نفسها، أعداد أخرى" estimatedTime="8 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={7 * 60} timerLabel="7 دقائق"
      brief={{
        tag: 'أدمج تعلّماتي — وضعية من المنصّة', title: TEST.title, tone: 'amber',
        body: (
          <div className="space-y-2" data-situation="itqan">
            <p><MathText>{TEST.minaret.text}</MathText></p>
            <SightLineFigure pole={TEST.minaret.pole} poleAt={TEST.minaret.poleAt} d={TEST.minaret.d} landmark="minaret"
              label="مئذنة جامع الجزائر ارتفاعها مجهول، وعمود إنارة شاقولي طوله 4 m على بعد 195,75 m من قاعدتها، وليندة على بعد 3 m من العمود؛ خط النظر يمرّ بقمة العمود ويصل قمة المئذنة؛ x الزاوية بين الأرض وخط النظر" />
            <p><MathText>{TEST.container.text}</MathText></p>
            <GeoFigure {...CONTAINER} />
          </div>
        ),
      }}
      skills={{
        nazar: { label: 'خاصية طالس في خط النظر', module: 7 },
        zawiya: { label: 'زاوية النظر والتدوير', module: 7 },
        fada: { label: 'مثلث قائم داخل مجسّم', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'nazar', requires: ['talis-khatt-nazar'], prompt: <Q><MathText>{'نسمّي A موضع ليندة و M قاعدة المئذنة. المسافة AM هي:'}</MathText></Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 4,
          explain: <MathText>{'$AM = 3 + 195{,}75 = 198{,}75\\,\\mathrm{m}$ : من ليندة إلى العمود ثم من العمود إلى المئذنة. $195{,}75$ هي المسافة بين العمود والمئذنة وحدها، والطرح لا معنى له هنا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P2'] } },
        { id: 'E2', skill: 'nazar', requires: ['talis-khatt-nazar'], prompt: <Q>المساواة التي تعطيها خاصية طالس للارتفاع h :</Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'العمود والمئذنة متوازيان وقمّتاهما على خط النظر من A: $\\dfrac{h}{4} = \\dfrac{AM}{3} = \\dfrac{198{,}75}{3}$ . المسافة $195{,}75$ ليست ضلعا رأسه A، وقلب نسبة واحدة يعطي مساواة خاطئة، والأطوال لا تُجمع.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P3'] } },
        { id: 'E3', skill: 'nazar', requires: ['talis-khatt-nazar'], prompt: <Q>ارتفاع المئذنة h هو:</Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 4,
          explain: <MathText>{'$h = \\dfrac{4 \\times 198{,}75}{3} = 265\\,\\mathrm{m}$ — وهو فعلا ارتفاع مئذنة جامع الجزائر. 261 يستعمل $195{,}75$ ، و 795 ينسى القسمة على 3، و $0{,}06$ يقلب النسبة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1'] } },
        { id: 'E4', skill: 'zawiya', requires: ['zawiya-bi-zill'], prompt: <Q>المدوّر إلى الدرجة لقيس الزاوية x هو:</Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 4,
          explain: <MathText>{'في المثلث الصغير: المقابل للزاوية x هو العمود 4 والمجاور 3، إذن $\\tan x = \\dfrac{4}{3}$ واللمسة العكسية تعطي $x \\approx 53{,}13^{\\circ}$ ، أي $53^{\\circ}$ . $37^{\\circ}$ هي الزاوية الأخرى ( $\\tan = \\dfrac{3}{4}$ )، و $1{,}33$ هو الظل لا القيس، و $45^{\\circ}$ تعني تساوي الضلعين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P3'] } },
        { id: 'E5', skill: 'fada', requires: ['muthallath-fada'], prompt: <Q>المدوّر إلى الجزء من 100 لطول قطر الحاوية AD هو:</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 2,
          explain: <MathText>{'$AC^2 = 12^2 + 2{,}4^2 = 149{,}76$ ثم $AD^2 = 149{,}76 + 2{,}4^2 = 155{,}52$ ومنه $AD \\approx 12{,}47\\,\\mathrm{m}$ . $12{,}24$ هو قطر الأرضية AC، و $16{,}8$ مجموع الأبعاد، و $155{,}52$ مربع AD دون جذر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1'] } },
        { id: 'E6', skill: 'fada', requires: ['muthallath-fada'], prompt: <Q>الزاوية التي يصنعها القطر [AD] مع أرضية الحاوية ABCH هي:</Q>,
          options: opts(O6), optionLabel: label(O6), correct: 0, cols: 4,
          explain: <MathText>{'[AC] مسقط [AD] على الأرضية لأنّ الحرف [CD] عمودي عليها: الزاوية المطلوبة $\\widehat{DAC}$ في المثلث ACD القائم في C. $\\widehat{DAB}$ زاويته مع الحرف [AB] وحده، و $\\widehat{ADC}$ رأسها D، و $\\widehat{DAF}$ زاويته مع الحرف الشاقولي.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P2'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🏛️', label: 'أدمجت تعلّماتي', test: (m) => (m.nazar ?? 0) + (m.zawiya ?? 0) + (m.fada ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 10', title: 'حساب المثلثات في المثلث القائم', message: 'معلم بعمود وخط نظر، ومجسّمات بمثلثاتها القائمة: خاصية طالس، النسب المثلثية، الحاسبة والتدوير في آخر الحساب، ثم التحقّق من ملاءمة النتيجة — ما تعلّمته في دروس الوحدة.', verbs: ['أقرأ', 'أنمذج', 'أحسب', 'أتحقّق'], masterBadgeLabel: 'الوحدة 10' }} />
  );
}
