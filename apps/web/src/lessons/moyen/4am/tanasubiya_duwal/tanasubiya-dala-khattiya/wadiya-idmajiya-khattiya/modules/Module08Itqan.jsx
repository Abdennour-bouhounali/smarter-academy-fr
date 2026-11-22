import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';
import { CableCarFigure } from '../components/CableCarFigure';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la résolution du مصعد هوائي du manuel
 * (extraction › situation › duplicatedIn module 8) en six épreuves qui suivent l'« تنفيذ
 * استراتيجية الحل » : AB = 500√26 ≈ 2549,51 m (P3), la durée ≈ 463,55 s ≈ 7 min 43,55 s (P1),
 * C(x) = 3,8x (P2), son graphique par O et (500 ; 1900) (P2), le plus grand prix 526 DA —
 * 10000/19 ≈ 526,32 arrondi VERS LE BAS puisque 3,8 × 527 = 2002,6 > 2000 (P3), et la lecture
 * d'une valeur dans le contexte (P1). Chaque distracteur est FAUX (MISC-JIDHR-JAMA,
 * MISC-MAQADIR-QISMA-MAQLUBA, MISC-MAQADIR-WIHDA, MISC-TAKHFID-NISBA, MISC-NISBA-JAM,
 * MISC-BAYANI-BIDUN-O, MISC-BAYANI-FASILA-TARTIB, MISC-TARRID-TAFSIR) ; une seule LP primaire
 * par épreuve, les trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={SITUATION.source} /></span>;
const O1 = [
  '$AB = \\sqrt{2500^2 + 500^2} = 500\\sqrt{26} \\approx 2549{,}51\\,\\mathrm{m}$',
  '$AB = 2500 + 500 = 3000\\,\\mathrm{m}$',
  '$AB = \\sqrt{2500^2 + 1400^2} \\approx 2865{,}31\\,\\mathrm{m}$',
  '$AB = \\sqrt{2500^2 - 500^2} \\approx 2449{,}49\\,\\mathrm{m}$',
];
const O2 = [
  'حوالي $463{,}55\\,\\mathrm{s}$ ، أي 7 دقائق و $43{,}55$ ثانية تقريبا',
  'حوالي $14\\,022\\,\\mathrm{s}$ ، لأنّ $2549{,}51 \\times 5{,}5 \\approx 14\\,022$',
  'حوالي $463{,}55\\,\\mathrm{s}$ ، أي 4 دقائق و $63{,}55$ ثانية',
  'حوالي $463{,}55\\,\\mathrm{s}$ ، أي 7 دقائق و 73 ثانية',
];
const O3 = [
  '$C(x) = 2x + 3 \\times 0{,}6x = 3{,}8x$',
  '$C(x) = 2x + 3 \\times 0{,}4x = 3{,}2x$',
  '$C(x) = 5x$',
  '$C(x) = 2x + 3(x - 40) = 5x - 120$',
];
const O4 = [
  'مستقيم يشمل المبدأ $O$ والنقطة $(500 ; 1900)$',
  'مستقيم يشمل المبدأ $O$ والنقطة $(500 ; 2000)$',
  'مستقيم يشمل النقطتين $(0 ; 2000)$ و $(500 ; 1900)$',
  'مستقيم يشمل المبدأ $O$ والنقطة $(1900 ; 500)$',
];
const O5 = [
  '526 DA: $3{,}8x \\leq 2000$ يعطي $x \\leq \\dfrac{10000}{19} \\approx 526{,}32$ ، فندوّر نحو الأسفل',
  '527 DA: نقرّب $526{,}32$ إلى أقرب عدد طبيعي أكبر منه',
  '400 DA، لأنّ $2000 \\div 5 = 400$',
  '625 DA، لأنّ $2000 \\div 3{,}2 = 625$',
];
const O6 = [
  'تدفع العائلة $3{,}8 \\times 500 = 1900$ DA، ويبقى لها 100 DA من ميزانيتها',
  'تدفع العائلة $5 \\times 500 = 2500$ DA، فتتجاوز ميزانيتها',
  'تدفع العائلة $3{,}2 \\times 500 = 1600$ DA، ويبقى لها 400 DA',
  'تدفع العائلة 1900 DA، فتتجاوز ميزانيتها بـ 100 DA',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="وضعية المصعد الهوائي كاملة: من طول الحبل إلى أكبر سعر للتذكرة" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={7 * 60} timerLabel="7 دقائق"
      brief={{
        tag: 'أدمج تعلّماتي', title: 'كم يدوم الصعود، وما أكبر سعر للتذكرة يسمح به مبلغ 2000 DA؟', tone: 'amber',
        body: (
          <div className="space-y-2">
            <p><MathText>{SITUATION.text}</MathText></p>
            <CableCarFigure />
          </div>
        ),
      }}
      skills={{
        hisab: { label: 'طول الحبل ومدة الصعود', module: 7 },
        namdhaja: { label: 'التكلفة دالة خطية وتمثيلها', module: 7 },
        tafsir: { label: 'حد الميزانية وتفسير النتيجة', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'hisab', requires: ['masafa-fithaghuras'], prompt: <Q><MathText>{'طول الحبل $AB$ (الشكل: $AH = 2500\\,\\mathrm{m}$ ، والارتفاعان 900m و 1400m):'}</MathText></Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 1,
          explain: <MathText>{'$BH = 1400 - 900 = 500$ ، والمثلث $AHB$ قائم في $H$ : $AB^2 = 2500^2 + 500^2 = 6\\,500\\,000$ ، أي $AB = \\sqrt{6\\,500\\,000} = 500\\sqrt{26} \\approx 2549{,}51\\,\\mathrm{m}$. الوتر ليس مجموع الضلعين، و 1400m ارتفاع لا ضلع.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P3'] } },
        { id: 'E2', skill: 'hisab', requires: ['mudda-sura'], prompt: <Q><MathText>{'مدة صعود واحد بسرعة $5{,}5\\,\\mathrm{m/s}$ :'}</MathText></Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 1,
          explain: <MathText>{'$t = \\dfrac{AB}{v} = \\dfrac{500\\sqrt{26}}{5{,}5} = \\dfrac{1000\\sqrt{26}}{11} \\approx 463{,}55\\,\\mathrm{s}$ ، و $463{,}55 = 7 \\times 60 + 43{,}55$ : 7 دقائق و $43{,}55$ ثانية تقريبا. الدقيقة 60 ثانية: $7{,}73$ دقيقة ليست 7 دقائق و 73 ثانية.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P1'] } },
        { id: 'E3', skill: 'namdhaja', requires: ['taklifa-khattiya'], prompt: <Q><MathText>{'تكلفة رحلة العائلة (بالغان و 3 أطفال، تخفيض 40% لكل طفل) بدلالة $x$ :'}</MathText></Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 1,
          explain: <MathText>{'بعد تخفيض 40% يدفع الطفل $100\\% - 40\\% = 60\\%$ من $x$ ، أي $0{,}6x$ : $C(x) = 2x + 3 \\times 0{,}6x = 2x + 1{,}8x = 3{,}8x$. العدد $0{,}4x$ هو مقدار التخفيض، لا ما يدفعه الطفل.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P2'] } },
        { id: 'E4', skill: 'namdhaja', requires: ['taklifa-khattiya', 'qiraa-bayaniya'], prompt: <Q><MathText>{'التمثيل البياني للدالة $C : x \\longmapsto 3{,}8x$ هو:'}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 1,
          explain: <MathText>{'$C$ دالة خطية: تمثيلها مستقيم يشمل المبدأ، و $C(500) = 3{,}8 \\times 500 = 1900$ : النقطة $(500 ; 1900)$ ، فاصلتها السعر وترتيبها التكلفة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P2'] } },
        { id: 'E5', skill: 'tafsir', requires: ['hadd-mizaniya'], prompt: <Q>أكبر سعر للتذكرة (بعدد طبيعي من الدنانير) يسمح للعائلة بالدفع في حدود 2000 DA:</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'$x \\leq \\dfrac{2000}{3{,}8} = \\dfrac{10000}{19} \\approx 526{,}32$. ندوّر نحو الأسفل: $3{,}8 \\times 526 = 1998{,}8$ لا يتجاوز 2000، أمّا $3{,}8 \\times 527 = 2002{,}6$ فيتجاوزه. بيانيا: فاصلة نقطة تقاطع مستقيم التكلفة مع خط الميزانية.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P3'] } },
        { id: 'E6', skill: 'tafsir', requires: ['taklifa-khattiya', 'sura-adad'], prompt: <Q>إذا كان سعر تذكرة البالغ 500 DA، فإنّ:</Q>,
          options: opts(O6), optionLabel: label(O6), correct: 0, cols: 1,
          explain: <MathText>{'$C(500) = 3{,}8 \\times 500 = 1900$ ، و $2000 - 1900 = 100$ : تدفع العائلة 1900 DA ويبقى لها 100 DA، فهي في حدود ميزانيتها.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🚡', label: 'أدمجت تعلّماتي', test: (m) => (m.hisab ?? 0) + (m.namdhaja ?? 0) + (m.tafsir ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 6', title: 'الدالة الخطية والتناسبية', message: 'كم بلغ طول الحبل، وكم دام الصعود، وما أكبر سعر للتذكرة يُبقي تكلفة العائلة في حدود 2000 DA؟ بمبرهنة فيثاغورس والسرعة المتوسطة والدالة الخطية وتمثيلها البياني أجبتَ عن ذلك كله — ما تعلّمته في دروس الوحدة.', verbs: ['أحسب', 'أنمذج', 'أقرأ', 'أفسّر'], masterBadgeLabel: 'الوحدة 6' }} />
  );
}
