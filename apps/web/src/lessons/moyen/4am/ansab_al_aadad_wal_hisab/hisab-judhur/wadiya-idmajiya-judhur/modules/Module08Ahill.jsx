import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — أحلّ الوضعية (stage: evaluation) : la résolution de la زربية en
 * cinq épreuves qui suivent les trois étapes du manuel — ce qui est cherché et
 * la donnée parasite, l'équation 2ℓ² = 24 ⇔ ℓ² = 12, la largeur exacte
 * ℓ = √12 = 2√3, la longueur L = 4√3, puis l'arrondi au cm (346 cm et 693 cm ;
 * 692 = 2 × 346 est l'arrondi prématuré, MISC-WADIYA-TADWIR-MUBAKKIR).
 * Chaque distracteur est FAUX. LP : P1 (unique).
 */
const Q = ({ children }) => <span>{children} <SourceTag source={SITUATION.source} /></span>;
const O1 = ['بُعدا الزربية؛ والثمن 12000 دج معطى مشوِّش', 'بُعدا الزربية؛ والمساحة $24m^2$ معطى مشوِّش', 'ثمن المتر المربع من الزربية؛ ولا يوجد معطى مشوِّش', 'محيط الزربية؛ و«الطول ضعف العرض» معطى مشوِّش'];
const O2 = ['$2\\ell^2 = 24$ ، أي $\\ell^2 = 12$', '$3\\ell = 24$ ، أي $\\ell = 8$', '$4\\ell^2 = 24$ ، أي $\\ell^2 = 6$', '$2\\ell^2 = 24$ ، أي $\\ell = 6$'];
const O3 = ['$2\\sqrt{3}$', '$4\\sqrt{3}$', '6', '3,46'];
const O4 = ['$4\\sqrt{3}$', '$2\\sqrt{6}$', '$8\\sqrt{3}$', '12'];
const O5 = [
  'العرض $\\ell \\approx 346\\,cm$ والطول $L \\approx 693\\,cm$',
  'العرض $\\ell \\approx 346\\,cm$ والطول $L \\approx 692\\,cm$',
  'العرض $\\ell \\approx 347\\,cm$ والطول $L \\approx 693\\,cm$',
  'العرض $\\ell \\approx 600\\,cm$ والطول $L \\approx 1200\\,cm$',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="خمس مراحل نحو بُعدي الزربية" estimatedTime="12 دقيقة" lessonConfig={LESSON_CONFIG} timerSeconds={6 * 60} timerLabel="6 دقائق"
      brief={{ tag: 'أدمج تعلّماتي', title: 'ما طول الزربية وما عرضها؟', tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p> }}
      skills={{
        fahm: { label: 'قراءة الوضعية وفهمها', module: 7 },
        istratijiya: { label: 'اختيار الاستراتيجية', module: 7 },
        tanfidh: { label: 'تنفيذ الحل بالقيم المضبوطة', module: 7 },
        tadwir: { label: 'التدوير في النهاية', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'fahm', requires: ['masahat-mustatil'], prompt: <Q>المرحلة 1 — المطلوب هو ...، والمعطى الذي لا يدخل في الحساب هو ...</Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 1,
          explain: <span>المطلوب طول الزربية وعرضها. السعر لا علاقة له بالبعدين؛ أمّا المساحة و«الطول ضعف العرض» فبهما نكتب المعادلة.</span>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-judhur_P1'] } },
        { id: 'E2', skill: 'istratijiya', requires: ['masahat-mustatil'], prompt: <Q>المرحلة 2 — ليكن <MathText>{'$\\ell$'}</MathText> العرض و <MathText>{'$L = 2\\ell$'}</MathText> الطول (بالمتر). المعادلة التي تترجم المساحة هي ...</Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 1,
          explain: <MathText>{'$L \\times \\ell = 2\\ell \\times \\ell = 2\\ell^2 = 24$، ونقسم على 2: $\\ell^2 = 12$. القسمة على 2 مرّة ثانية لا تحل المعادلة: $6^2 = 36$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-judhur_P1'] } },
        { id: 'E3', skill: 'tanfidh', requires: ['tadhkir-x2-a', 'kitaba-a-jidhr-b'], prompt: <Q>المرحلة 3 — القيمة المضبوطة لعرض الزربية <MathText>{'$\\ell$'}</MathText> (بالمتر) هي ...</Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 2,
          explain: <MathText>{'العرض موجب: $\\ell = \\sqrt{12} = \\sqrt{4 \\times 3} = 2\\sqrt{3}$. أما 3,46 فقيمة مقرّبة: $3{,}46^2 = 11{,}9716$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-judhur_P1'] } },
        { id: 'E4', skill: 'tanfidh', requires: ['kitaba-a-jidhr-b'], prompt: <Q>المرحلة 3 (تابع) — القيمة المضبوطة لطول الزربية <MathText>{'$L$'}</MathText> (بالمتر) هي ...</Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 2,
          explain: <MathText>{'$L = 2\\ell = 2 \\times 2\\sqrt{3} = 4\\sqrt{3}$. نتحقق: $4\\sqrt{3} \\times 2\\sqrt{3} = 8 \\times 3 = 24$. أما $2\\sqrt{6} = \\sqrt{24}$ فضلع مربع مساحته 24.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-judhur_P1'] } },
        { id: 'E5', skill: 'tadwir', requires: ['tariqat-wadiya'], prompt: <Q>المرحلة 4 — بالتدوير إلى 1cm، بُعدا الزربية هما ...</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'$\\ell = 2\\sqrt{3} \\approx 3{,}4641\\,m$ أي $346\\,cm$، و $L = 4\\sqrt{3} \\approx 6{,}9282\\,m$ أي $693\\,cm$. أما $2 \\times 346 = 692$ فتدوير مبكر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-judhur_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🧶', label: 'أدمجت تعلّماتي', test: (m) => (m.fahm ?? 0) + (m.istratijiya ?? 0) + (m.tanfidh ?? 0) + (m.tadwir ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 2', title: 'الحساب على الجذور', message: 'ما بُعدا الزربية بعد التدوير إلى 1cm؟ وأيّ أدوات من الدروس الخمسة استعملتها لتجدهما: الجذر التربيعي، حلّ معادلة مربّعها يساوي عددًا، أبسط كتابة لجذر، ثم التدوير في النهاية؟', verbs: ['أقرأ', 'أحلّل', 'أنفّذ', 'أدوّر'], masterBadgeLabel: 'الوحدة 2' }} />
  );
}
