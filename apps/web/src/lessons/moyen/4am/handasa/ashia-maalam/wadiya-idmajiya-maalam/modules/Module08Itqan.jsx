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
 * Module 8 — إختبار أولي (« وضعية الاختبار النهائي ») (stage: evaluation) : la وضعية TRANSPOSÉE (extraction › situation › duplicatedIn module 8) — deux
 * pistes de VTT à جبل الوحش, Constantine (content/textbook.js › TEST, 1 cm ↔ 1 km) ; aucune réponse n'apparaît ailleurs.
 *   E1 (P2)  le centre du premier demi-cercle : le milieu de [CK], (−1 ; 0)
 *   E2 (P3)  la piste (1) : deux demi-cercles de rayon 2, 4π ≈ 12,57 km
 *   E3 (P3)  EF = √(3² + (−4)²) = 5
 *   E4 (P1)  la piste (2) : 5 + 3√2 + 2√2 = 5 + 5√2
 *   E5 (P1)  la plus courte : (2), 12,07 < 12,57 — cette fois la ligne brisée gagne
 * Chaque distracteur est FAUX (MISC-MAALAM-MUNTASAF-TARH, -NISF, TABDIL-X-Y, NISF-DAIRA-MUHIT, MASAFA-JADHR-JAM, -NASI,
 * MISC-JIDHR-JAMA, MUQARANA-AYN) ; une seule LP primaire par épreuve, les trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['$(-1\\,;\\,0)$', '$(2\\,;\\,0)$', '$(-2\\,;\\,0)$', '$(0\\,;\\,-1)$'];
const O2 = ['$4\\pi \\approx 12{,}57\\,\\mathrm{km}$', '$8\\pi \\approx 25{,}13\\,\\mathrm{km}$', '$2\\pi \\approx 6{,}28\\,\\mathrm{km}$', '$8\\,\\mathrm{km}$'];
const O3 = ['$5$', '$7$', '$25$', '$\\sqrt{7}$'];
const O4 = ['$5 + 5\\sqrt{2}$', '$5 + \\sqrt{26}$', '$10\\sqrt{2}$', '$17$'];
const O5 = ['المسلك (2)، لأنّ $5 + 5\\sqrt{2} \\approx 12{,}07 < 4\\pi \\approx 12{,}57$', 'المسلك (1)، لأنّ المسلك المصنوع من أنصاف دوائر هو الأقصر دائما', 'المسلك (1)، لأنّ $2\\pi \\approx 6{,}28 < 12{,}07$', 'المسلكان متساويان في الطول'];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="إختبار أولي" moduleSubtitle="وضعية أخرى: الموارد نفسها، أعداد أخرى" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={6 * 60} timerLabel="6 دقائق"
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
        qiraa: { label: 'قراءة الوضعية والمراكز', module: 7 },
        hisab: { label: 'حساب أطوال الأجزاء', module: 7 },
        muqarana: { label: 'الجمع والمقارنة', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'qiraa', requires: ['nisf-daira-markaz'], prompt: <Q><MathText>{'مركز نصف الدائرة التي قطرها $[CK]$ هو:'}</MathText></Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 4,
          explain: <MathText>{'مركز نصف الدائرة منتصف قطرها $[CK]$ : $\\left(\\dfrac{-3 + 1}{2}\\,;\\,\\dfrac{0 + 0}{2}\\right) = (-1\\,;\\,0)$ . نصف الفرق $\\dfrac{1 - (-3)}{2}$ يعطي $(2\\,;\\,0)$ ، والمجموع دون قسمة يعطي $(-2\\,;\\,0)$ ، و $(0\\,;\\,-1)$ يبدّل الإحداثيتين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-maalam_P2'] } },
        { id: 'E2', skill: 'hisab', requires: ['nisf-daira-markaz'], prompt: <Q>طول المسلك (1) هو:</Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'$CK = KD = 4$ فنصف قطر كل نصف دائرة $r = 2$ وطوله $\\pi \\times 2 = 2\\pi$ ؛ المسلك (1): $2\\pi + 2\\pi = 4\\pi \\approx 12{,}57\\,\\mathrm{km}$ . $8\\pi$ محيط دائرتين كاملتين، و $2\\pi$ نصف دائرة واحدة، و $8\\,\\mathrm{km}$ طول القطعة $[CD]$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-maalam_P3'] } },
        { id: 'E3', skill: 'hisab', requires: ['tul-khatt-munkasir'], prompt: <Q>طول القطعة [EF] (بالكيلومتر) هو:</Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 4,
          explain: <MathText>{'$\\overrightarrow{EF}\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$ ، $EF = \\sqrt{3^2 + (-4)^2} = \\sqrt{25} = 5$ . 7 هو $3 + 4$ (جمع الفرقين)، و 25 هو $EF^2$ (نسيان الجذر).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-maalam_P3'] } },
        { id: 'E4', skill: 'muqarana', requires: ['tul-khatt-munkasir'], prompt: <Q>طول المسلك (2) بالقيمة المضبوطة هو:</Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 2,
          explain: <MathText>{'$EF = 5$ ، $FG = \\sqrt{3^2 + 3^2} = \\sqrt{18} = 3\\sqrt{2}$ ، $GH = \\sqrt{2^2 + (-2)^2} = \\sqrt{8} = 2\\sqrt{2}$ ، فالمجموع $5 + 3\\sqrt{2} + 2\\sqrt{2} = 5 + 5\\sqrt{2}$ . $\\sqrt{18} + \\sqrt{8} \\neq \\sqrt{26}$ ، و $5 + 5\\sqrt{2} \\neq 10\\sqrt{2}$ (لا نجمع عددا وجذرا)، و 17 مجموع الفروق دون جذور.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-maalam_P1'] } },
        { id: 'E5', skill: 'muqarana', requires: ['muqaranat-masarayn'], prompt: <Q>أقصر المسلكين هو:</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'$5 + 5\\sqrt{2} \\approx 12{,}07$ و $4\\pi \\approx 12{,}57$ : المسلك (2) أقصر بحوالي $0{,}5\\,\\mathrm{km}$ . لا قاعدة «أنصاف الدوائر أقصر دائما» (هنا العكس)، و $2\\pi$ نصف دائرة واحدة فقط.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-maalam_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🏃', label: 'أدمجت تعلّماتي', test: (m) => (m.qiraa ?? 0) + (m.hisab ?? 0) + (m.muqarana ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 12', title: 'الأشعة في معلم', message: 'مساران في معلم: نقرأ الإحداثيات، نجد مراكز أنصاف الدوائر بالمنتصف، نحسب الأطوال بالمسافة بين نقطتين، ثم نقارن بالقيم المضبوطة والمقرّبة — ما تعلّمته في دروس الوحدة.', verbs: ['أقرأ', 'أحسب', 'أقارن', 'أبرهن'], masterBadgeLabel: 'الوحدة 12' }} />
  );
}
