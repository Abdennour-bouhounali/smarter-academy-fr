import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST } from '../content/textbook';
import { TEST_FIGURE } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : la وضعية TRANSPOSÉE (`synthesis_generation`, content/textbook.js › TEST) — un verre
 * de frappé à Oran, tronc de cône Ø 8 cm au fond, Ø 12 cm en haut, 12 cm de haut, boisson sur 9 cm ; aucune réponse n'apparaît
 * ailleurs (recalculées par lab.render.test.jsx avec space.bucketWater) :
 *   E1 (P2)  la modélisation : un tronc de cône de petite base le fond (r = 4) et de hauteur 9
 *   E2 (P3)  le sommet : SO/(SO + 12) = 4/6 ⇒ SO = 24 cm
 *   E3 (P3)  le rayon de la surface : 4 × 33/24 = 5,5 cm
 *   E4 (P1)  la réduction : k = 24/33 = 8/11, V₂ = (8/11)³·V₁
 *   E5 (P1)  le volume : V = 819π/4 ≈ 643,24 cm³
 * Chaque distracteur est FAUX (le rayon moyen MISC-MABTUR-TALIS, k au lieu de k³ MISC-MABTUR-FARQ, H pris pour SO, k inversé,
 * V₁ seul) ; une seule LP primaire par épreuve, les trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['مخروطا مبتورا قاعدته الصغرى قاع الكأس (نصف قطرها $4\\,\\mathrm{cm}$ ) وارتفاعه $9\\,\\mathrm{cm}$', 'أسطوانة نصف قطرها $6\\,\\mathrm{cm}$ وارتفاعها $9\\,\\mathrm{cm}$', 'مخروطا مبتورا ارتفاعه $12\\,\\mathrm{cm}$', 'مخروطا رأسه مركز القاع O وارتفاعه $9\\,\\mathrm{cm}$'];
const O2 = ['$SO = 24\\,\\mathrm{cm}$', '$SO = 12\\,\\mathrm{cm}$', '$SO = 36\\,\\mathrm{cm}$', '$SO = 8\\,\\mathrm{cm}$'];
const O3 = ['$5{,}5\\,\\mathrm{cm}$', '$5\\,\\mathrm{cm}$', '$6\\,\\mathrm{cm}$', '$4{,}5\\,\\mathrm{cm}$'];
const O4 = ['$V_2 = \\left(\\dfrac{8}{11}\\right)^3 V_1$', '$V_2 = \\dfrac{8}{11} V_1$', '$V_2 = \\left(\\dfrac{8}{11}\\right)^2 V_1$', '$V_2 = \\left(\\dfrac{11}{8}\\right)^3 V_1$'];
const O5 = ['$643{,}24\\,\\mathrm{cm}^3$', '$706{,}86\\,\\mathrm{cm}^3$', '$285{,}10\\,\\mathrm{cm}^3$', '$1045{,}36\\,\\mathrm{cm}^3$'];
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
            <SpaceFigure {...TEST_FIGURE} />
          </div>
        ),
      }}
      skills={{
        qiraa: { label: 'نمذجة الوضعية', module: 7 },
        talis: { label: 'إكمال المخروط بخاصية طالس', module: 7 },
        hajm: { label: 'التصغير وحجم المخروط المبتور', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'qiraa', requires: ['mukhrut-mukammal'], prompt: <Q>المشروب في الكأس يشغل:</Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 1,
          explain: <MathText>{'سطح المشروب مستو مواز للقاع: المشروب مخروط مبتور قاعدته الصغرى قاع الكأس (نصف قطره $4\\,\\mathrm{cm}$ ) وقاعدته الكبرى سطح المشروب، وارتفاعه عمق المشروب $9\\,\\mathrm{cm}$ . الجدار مائل فليس أسطوانة، و $12\\,\\mathrm{cm}$ ارتفاع الكأس لا المشروب، والقاع قرص لا نقطة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-fada_P2'] } },
        { id: 'E2', skill: 'talis', requires: ['mukhrut-mukammal'], prompt: <Q><MathText>{'بخاصية طالس في المقطع المحوري، بعد الرأس S عن مركز القاع O هو:'}</MathText></Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'$\\dfrac{SO}{SO + 12} = \\dfrac{4}{6}$ ومنه $6 \\times SO = 4 \\times SO + 48$ و $SO = 24\\,\\mathrm{cm}$ . $12$ ارتفاع الكأس، و $36$ بعد S عن الفتحة، و $8$ من النسبة المقلوبة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-fada_P3'] } },
        { id: 'E3', skill: 'talis', requires: ['mukhrut-mukammal'], prompt: <Q><MathText>{'نصف قطر سطح المشروب $WM$ :'}</MathText></Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 4,
          explain: <MathText>{'$SW = 24 + 9 = 33$ و $\\dfrac{WM}{4} = \\dfrac{33}{24}$ ، ومنه $WM = 5{,}5\\,\\mathrm{cm}$ . $5$ متوسط نصفي القطرين (المشروب ليس في منتصف الكأس)، و $6$ نصف قطر الفتحة، و $4{,}5$ من $6 \\times \\dfrac{9}{12}$ دون القاع.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-fada_P3'] } },
        { id: 'E4', skill: 'hajm', requires: ['hajm-mabtur'], prompt: <Q><MathText>{'$V_1$ حجم المخروط الكبير (من S إلى سطح المشروب) و $V_2$ حجم المخروط الصغير (من S إلى القاع). لدينا:'}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 2,
          explain: <MathText>{'المخروط الصغير تصغير للكبير نسبته $k = \\dfrac{SO}{SW} = \\dfrac{24}{33} = \\dfrac{8}{11}$ ، والحجوم تُضرب في $k^3$ . $k$ وحده للأطوال و $k^2$ للمساحات، و $\\dfrac{11}{8} > 1$ تكبير.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-fada_P1'] } },
        { id: 'E5', skill: 'hajm', requires: ['hajm-mabtur'], prompt: <Q><MathText>{'حجم المشروب مدوّرا إلى $0{,}01\\,\\mathrm{cm}^3$ :'}</MathText></Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 2,
          explain: <MathText>{'$V_1 = \\dfrac{1}{3}\\pi \\times 5{,}5^2 \\times 33 = \\dfrac{1331}{4}\\pi$ و $V_2 = \\dfrac{1}{3}\\pi \\times 4^2 \\times 24 = 128\\pi$ ، ومنه $V = V_1 - V_2 = \\dfrac{819}{4}\\pi \\approx 643{,}24\\,\\mathrm{cm}^3$ . $706{,}86$ أسطوانة نصف قطرها المتوسط $5$ ، و $285{,}10$ من $V_1(1 - k)$ ، و $1045{,}36$ هو $V_1$ وحده.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-fada_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🪣', label: 'أدمجت تعلّماتي', test: (m) => (m.qiraa ?? 0) + (m.talis ?? 0) + (m.hajm ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 14', title: 'الهندسة في الفضاء', message: 'ماء في دلو أو مشروب في كأس: نكمل المخروط بخاصية طالس، والمخروط الصغير تصغير للكبير، فحجم المخروط المبتور هو حجم الكبير مضروبا في (1 − k³) — ما تعلّمته في دروس الوحدة.', verbs: ['أقرأ', 'أكمل', 'أصغّر', 'أحسب'], masterBadgeLabel: 'الوحدة 14' }} />
  );
}
