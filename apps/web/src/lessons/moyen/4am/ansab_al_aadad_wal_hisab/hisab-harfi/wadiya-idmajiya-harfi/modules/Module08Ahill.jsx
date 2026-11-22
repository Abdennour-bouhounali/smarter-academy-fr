import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — أحلّ الوضعية (stage: evaluation) : la résolution du bassin et du
 * ruban en cinq épreuves qui suivent les trois étapes du manuel — le côté du
 * grand carré 10 + 2x (P2), l'aire du ruban 4x² + 40x (P2), l'égalité ramenée
 * à x² + 10x − 11 = 0 (P1), la forme factorisée de l'« مساعدة » et ses deux
 * valeurs annulantes (P3), puis x = 1 retenu et vérifié, −11 rejeté (P1).
 * Chaque distracteur est FAUX ; une seule LP primaire par épreuve, les trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={SITUATION.source} /></span>;
const O1 = ['$10 + 2x$', '$10 + x$', '$10x$', '$2(10 + 2x)$'];
const O2 = ['$4x^2 + 40x$', '$4x^2 + 20x$', '$4x^2$', '$4x^2 + 40x + 100$'];
const O3 = ['$x^2 + 10x - 11 = 0$', '$x^2 + 10x - 44 = 0$', '$x^2 + 10x + 11 = 0$', '$4x^2 + 40x + 56 = 0$'];
const O4 = ['$x = 1$ أو $x = -11$', '$x = -1$ أو $x = 11$', '$x = 1$ أو $x = 11$', '$x = 0$'];
const O5 = [
  '$x = 1\\,m$ ، لأنّ العرض موجب، و $4 \\times 1^2 + 40 \\times 1 = 44$',
  '$x = -11\\,m$ ، لأنّ $4 \\times (-11)^2 + 40 \\times (-11) = 44$',
  '$x = 1\\,m$ أو $x = -11\\,m$ : للشريط عرضان',
  '$x = 11\\,m$ ، لأنّ 11 يظهر في المساعدة',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module10Ahill() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="أحلّ الوضعية" moduleSubtitle="خمس مراحل نحو عرض الشريط" estimatedTime="6 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={6 * 60} timerLabel="6 دقائق"
      brief={{ tag: 'أدمج تعلّماتي', title: 'ما عرض الشريط حول الحوض؟', tone: 'amber', body: <div className="space-y-1"><p><MathText>{SITUATION.text}</MathText></p><p className="text-sm"><MathText>{SITUATION.help}</MathText></p></div> }}
      skills={{
        namdhaja: { label: 'نمذجة الوضعية بدلالة x', module: 7 },
        musawat: { label: 'كتابة المساواة وتبسيطها', module: 7 },
        shakl: { label: 'توظيف الشكل المحلّل', module: 7 },
        tahaqquq: { label: 'اختيار الحل والتحقق منه', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'namdhaja', requires: ['namdhaja'], prompt: <Q>المرحلة 1 — الحوض مع الشريط مربع كبير. طول ضلعه بدلالة <MathText>{'$x$'}</MathText> (بالمتر) هو ...</Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 2,
          explain: <MathText>{'على كل ضلع: شريط، ثم الحوض، ثم شريط: $x + 10 + x = 10 + 2x$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-harfi_P2'] } },
        { id: 'E2', skill: 'namdhaja', requires: ['masaha-tariqatan', 'mutatabiqat'], prompt: <Q>المرحلة 2 — مساحة الشريط بدلالة <MathText>{'$x$'}</MathText> (نشر مبسّط) هي ...</Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'$(10 + 2x)^2 - 10^2 = 100 + 40x + 4x^2 - 100 = 4x^2 + 40x$ ، أو $4 \\times 10x + 4 \\times x^2$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-harfi_P2'] } },
        { id: 'E3', skill: 'musawat', requires: ['masaha-tariqatan'], prompt: <Q>المرحلة 3 — المساواة «مساحة الشريط 44» تكافئ ...</Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 1,
          explain: <MathText>{'$4x^2 + 40x = 44$ يعني $4x^2 + 40x - 44 = 0$ ، وبقسمة كل الحدود على 4: $x^2 + 10x - 11 = 0$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-harfi_P1'] } },
        { id: 'E4', skill: 'shakl', requires: ['musaada-jadaa'], prompt: <Q>المرحلة 3 (تابع) — حسب المساعدة، <MathText>{'$x^2 + 10x - 11 = (x - 1)(x + 11)$'}</MathText>. هذا الجداء معدوم إذا كان أحد عامليه معدومًا، أي من أجل ...</Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 2,
          explain: <MathText>{'$x - 1 = 0$ من أجل $x = 1$ ، و $x + 11 = 0$ من أجل $x = -11$. الشكل المحلّل هو الذي يُظهر هاتين القيمتين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-harfi_P3'] } },
        { id: 'E5', skill: 'tahaqquq', requires: ['tariqat-wadiya'], prompt: <Q>الخلاصة — عرض الشريط هو ...</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'العرض طول موجب، فنرفض $-11$. نتحقق: من أجل $x = 1$ ضلع المربع الخارجي 12، و $144 - 100 = 44$. ومن أجل $x = -11$ : $4 \\times 121 - 440 = 44$ أيضًا، لكنه ليس طولًا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-harfi_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🏊', label: 'أدمجت تعلّماتي', test: (m) => (m.namdhaja ?? 0) + (m.musawat ?? 0) + (m.shakl ?? 0) + (m.tahaqquq ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 3', title: 'الحساب الحرفي', message: 'عرض الشريط متر واحد. نمذجت الوضعية بدلالة x، نشرت بمتطابقة شهيرة، كتبت المساواة، وظّفت الشكل المحلّل وتحقّقت من الحل — ما تعلّمته في الدروس الثلاثة.', verbs: ['أنمذج', 'أنشر', 'أحلّل', 'أتحقّق'], masterBadgeLabel: 'الوحدة 3' }} />
  );
}
