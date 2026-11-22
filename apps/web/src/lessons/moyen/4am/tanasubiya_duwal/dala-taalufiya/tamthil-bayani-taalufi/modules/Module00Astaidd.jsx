import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_FIGURE } from '../content/textbook';
import AffineFigure from '../components/AffineFigure';

/**
 * Module 0 — أستعدّ. Les items 6, 7 أ et 7 ب du manuel (p. 77, « أصحيح أم خاطئ؟ برّر إجابتك ») — l'item 7 avec
 * sa figure dessinée — puis trois affirmations de la plateforme (coordonnées d'un point ; image par une fonction
 * affine, leçon 1). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
 */
const figure = (
  <AffineFigure testId="prep-7" win={PREP_FIGURE.win} lines={PREP_FIGURE.lines} height={180} width={200}
    caption={PREP_FIGURE.caption} ariaLabel="معلم فيه مستقيمان يشملان المبدأ: (d) يصعد و (d′) ينزل" />
);
/** L'énoncé de l'item 7 (celui de prepQuestion) suivi de sa figure. */
const withFigure = (item) => <span className="block space-y-2">{prepQuestion(item).prompt}{figure}</span>;

export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="5 دقائق"
      brief={{
        tag: 'أستعدّ — الكتاب ص 77 وعبارات من المنصّة', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ثلاث عبارات من الكتاب عن تمثيل دالة خطية وقراءته، وثلاث من المنصّة عن إحداثيات نقطة وصورة عدد بدالة تآلفية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        khatti: { label: 'تمثيل دالة خطية بيانيا', emoji: '📈' },
        qiraa: { label: 'قراءة دالة خطية على تمثيلها', emoji: '👀' },
        talim: { label: 'إحداثيات نقطة في معلم', emoji: '📍' },
        sura: { label: 'صورة عدد بدالة تآلفية', emoji: '🧮' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: في الدرس منحدر ترفعه بيدك ويكتب لك كل حساب.', advice: 'راجع تمثيل دالة خطية (مستقيم يشمل المبدأ)، وتذكّر أنّ الفاصلة تُكتب أولًا ثم الترتيب، وأنّ صورة عدد بدالة تآلفية نحسبها بضربه في المعامل ثم إضافة الحدّ الثابت.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة المعامل عندما تقرأ دالة خطية على تمثيلها، وإلى الحدّ الثابت عند حساب صورة عدد.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التمثيل والقراءة والصور متحكَّم فيها.', advice: 'في المستوى المتقدّم من النشاط افتح المختبر الثاني واقرأ بنفسك عبارة منحدر مخفي.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['tamthil-khatti'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['qiraa-khatti'], prompt: withFigure(PREP_ITEMS[1]) },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['qiraa-khatti'], prompt: withFigure(PREP_ITEMS[2]) },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['talim-nuqta'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['notation-fx'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['notation-fx'] },
      ]}
    />
  );
}
