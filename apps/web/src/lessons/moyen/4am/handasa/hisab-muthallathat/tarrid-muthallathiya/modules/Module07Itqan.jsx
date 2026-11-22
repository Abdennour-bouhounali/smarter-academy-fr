import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST } from '../content/textbook';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : quatre situations de la plateforme (content/textbook.js › TEST), des nombres
 * qui n'apparaissent nulle part ailleurs dans la leçon ni dans le banc.
 *   E1 (P1)  منارة جامع الجزائر vue de 118 m sous 66° : la modélisation tan 66° = h ÷ 118
 *   E2 (P1)  h = 118 × tan 66° ≈ 265 m (la hauteur réelle de la منارة)
 *   E3 (P2)  le téléphérique de Constantine : 40 m de dénivelé à 20° → sin, ÷ : L ≈ 117 m
 *   E4 (P2)  la dune : 6 m de descente sur 18 m → sin x = 1/3, x ≈ 19°
 *   E5 (P3)  ABC rectangle en A, AB = 8, AC = 6 : BC = 10, B̂ ≈ 37°, Ĉ ≈ 53°
 *   E6 (P3)  l'arrondi précoce de Sara : DE = 10 cos 25° ≈ 9,1 (et non 9,0)
 * Chaque distracteur est FAUX et porte une erreur nommée (MISC-MUTH-NISBA-GHAYR-MUNASIBA, -DARB-BADAL-QISMA,
 * -MUQABIL-MUJAWIR, -NISBA-MAQLUBA, -TADWIR-MUBAKKIR) ; une seule LP primaire par épreuve, les trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['$\\tan 66^{\\circ} = \\dfrac{h}{118}$', '$\\sin 66^{\\circ} = \\dfrac{h}{118}$', '$\\tan 66^{\\circ} = \\dfrac{118}{h}$', '$\\cos 66^{\\circ} = \\dfrac{h}{118}$'];
const O2 = ['$265\\,\\mathrm{m}$', '$53\\,\\mathrm{m}$', '$108\\,\\mathrm{m}$', '$290\\,\\mathrm{m}$'];
const O3 = ['$117\\,\\mathrm{m}$', '$14\\,\\mathrm{m}$', '$43\\,\\mathrm{m}$', '$110\\,\\mathrm{m}$'];
const O4 = ['$19^{\\circ}$', '$18^{\\circ}$', '$71^{\\circ}$', '$72^{\\circ}$'];
const O5 = [
  '$BC = 10\\,\\mathrm{cm}$ ، $\\widehat{B} \\approx 37^{\\circ}$ ، $\\widehat{C} \\approx 53^{\\circ}$',
  '$BC = 14\\,\\mathrm{cm}$ ، $\\widehat{B} \\approx 37^{\\circ}$ ، $\\widehat{C} \\approx 53^{\\circ}$',
  '$BC = 10\\,\\mathrm{cm}$ ، $\\widehat{B} \\approx 53^{\\circ}$ ، $\\widehat{C} \\approx 37^{\\circ}$',
  '$BC = 10\\,\\mathrm{cm}$ ، $\\widehat{B} \\approx 37^{\\circ}$ ، $\\widehat{C} \\approx 63^{\\circ}$',
];
const O6 = ['$DE \\approx 9{,}1\\,\\mathrm{cm}$', '$DE \\approx 9{,}0\\,\\mathrm{cm}$', '$DE \\approx 4{,}2\\,\\mathrm{cm}$', '$DE \\approx 11{,}0\\,\\mathrm{cm}$'];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module07Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="إختبار أولي" moduleSubtitle="وضعيات جديدة: الطريقة نفسها، أعداد أخرى" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={7 * 60} timerLabel="7 دقائق"
      brief={{
        tag: 'إختبار أولي — وضعيات من المنصّة', title: TEST.title, tone: 'slate',
        body: (
          <div className="space-y-1" data-situation="itqan">
            <p>ارسم في كل سؤال المثلث القائم على مسودّتك، وسمِّ أضلاعه بالنسبة إلى الزاوية المعلومة قبل أن تختار.</p>
          </div>
        ),
      }}
      skills={{
        tarid: { label: 'ترييض وضعية بمثلث قائم', module: 1 },
        nisba: { label: 'اختيار النسبة المناسبة', module: 1 },
        hall: { label: 'حل المثلث القائم والتدوير', module: 2 },
      }}
      epreuves={[
        { id: 'E1', skill: 'tarid', requires: ['tarid-muthallath', 'ikhtiyar-nisba'], prompt: <Q><MathText>{`${TEST.minaret} نسمّي h ارتفاع المنارة. المساواة التي تترجم الوضعية هي:`}</MathText></Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 2,
          explain: <MathText>{'المنارة شاقولية: المثلث قائم عند قاعدتها. بالنسبة إلى الزاوية $66^{\\circ}$ ، المسافة 118 مجاورة والارتفاع h مقابل، فالظل: $\\tan 66^{\\circ} = \\dfrac{h}{118}$ . الجيب وجيب التمام يحتاجان خط النظر (الوتر)، والنسبة المقلوبة تجعل 118 مقابلا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-muthallathiya_P1'] } },
        { id: 'E2', skill: 'tarid', requires: ['zawiyat-nazar', 'majhul-maqam'], prompt: <Q><MathText>{'ارتفاع المنارة مدوّرا إلى المتر:'}</MathText></Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 4,
          explain: <MathText>{'$h = 118 \\times \\tan 66^{\\circ} \\approx 265\\,\\mathrm{m}$ — ارتفاع منارة جامع الجزائر فعلا. 53 تقسم على الظل، و 108 تضرب في الجيب، و 290 تقسم على جيب التمام.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-muthallathiya_P1'] } },
        { id: 'E3', skill: 'nisba', requires: ['ikhtiyar-nisba', 'majhul-maqam'], prompt: <Q><MathText>{`${TEST.cable} طول الكابل الذي تقطعه العربة، مدوّرا إلى المتر:`}</MathText></Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 4,
          explain: <MathText>{'الارتفاع 40 مقابل للزاوية $20^{\\circ}$ والكابل وتر: $\\sin 20^{\\circ} = \\dfrac{40}{L}$ ومنه $L = \\dfrac{40}{\\sin 20^{\\circ}} \\approx 117\\,\\mathrm{m}$ . 14 تضرب بدل أن تقسم (أقصر من الارتفاع!)، و 43 تقسم على جيب التمام، و 110 هي المسافة الأفقية ( $\\dfrac{40}{\\tan 20^{\\circ}}$ ).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-muthallathiya_P2'] } },
        { id: 'E4', skill: 'nisba', requires: ['zawiya-min-dilain', 'ikhtiyar-nisba'], prompt: <Q><MathText>{`${TEST.dune} قيس زاوية المنحدر مع الأفق، مدوّرا إلى الدرجة:`}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 4,
          explain: <MathText>{'المنحدر وتر (18) والنزول مقابل (6): $\\sin x = \\dfrac{6}{18} = \\dfrac{1}{3}$ ، ثم باللمسة العكسية $x \\approx 19{,}47^{\\circ}$ أي $19^{\\circ}$ . 18 تجعل المنحدر مجاورا (الظل)، و 71 هي الزاوية الأخرى ( $\\cos x = \\dfrac{1}{3}$ )، و 72 هي $90^{\\circ} - 18^{\\circ}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-muthallathiya_P2'] } },
        { id: 'E5', skill: 'hall', requires: ['hall-muthallath', 'fithaghuris'], prompt: <Q><MathText>{`${TEST.triangle} عناصر المثلث المجهولة (الزاويتان مدوّرتان إلى الدرجة):`}</MathText></Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'خاصية فيثاغورس: $BC = \\sqrt{64 + 36} = 10$ . بالنسبة إلى B : AC مقابل و AB مجاور، $\\tan\\widehat{B} = \\dfrac{6}{8}$ فـ $\\widehat{B} \\approx 37^{\\circ}$ ، و $\\widehat{C} = 90^{\\circ} - 37^{\\circ} = 53^{\\circ}$ . 14 تجمع الطولين، وتبديل الزاويتين يقلب المقابل والمجاور، والزاويتان الحادتان مجموعهما $90^{\\circ}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-muthallathiya_P3'] } },
        { id: 'E6', skill: 'hall', requires: ['tadwir-akhir', 'hall-muthallath'], prompt: <Q><MathText>{`${TEST.early} القيمة الصحيحة لـ DE مدوّرة إلى الجزء من 10 هي:`}</MathText></Q>,
          options: opts(O6), optionLabel: label(O6), correct: 0, cols: 2,
          explain: <MathText>{'بالقيمة المضبوطة: $DE = 10 \\times \\cos 25^{\\circ} \\approx 9{,}06$ أي $9{,}1$ . سارة دوّرت DF قبل النهاية: $\\dfrac{4{,}2}{\\tan 25^{\\circ}} \\approx 9{,}01$ يعطي $9{,}0$ . و $4{,}2$ هو DF ، و $11{,}0 = \\dfrac{10}{\\cos 25^{\\circ}}$ أطول من الوتر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-muthallathiya_P3'] } },
      ]}
      badges={[{ id: 'tarid', emoji: '📱', label: 'أترجم وأختار', test: (m) => (m.tarid ?? 0) + (m.nisba ?? 0) + (m.hall ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أتقنت ترييض الوضعيات', title: 'حل مشكلات بالنسب المثلثية', message: 'منارة، تلفريك، كثيب رملي ومثلث كامل: ترجمت كل وضعية إلى مثلث قائم، سمّيت أضلاعه بالنسبة إلى الزاوية، اخترت النسبة المناسبة ودوّرت في النهاية فقط.', verbs: ['أرسم', 'أسمّي', 'أختار', 'أحسب'], masterBadgeLabel: 'الدرس 4' }} />
  );
}
