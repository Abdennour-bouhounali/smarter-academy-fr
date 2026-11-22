import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 1 et 2 du manuel (p. 91, tous deux FAUX : 0,5 et non 1 ; 35/13 et non 4,5, la
 * moyenne sans les effectifs), puis quatre affirmations de la plateforme dans la forme du livre : une moyenne
 * simple VRAIE, un rangement VRAI, l'effectif total (FAUX : le plus grand effectif n'est pas le total), l'effectif
 * cumulé croissant (VRAI, leçon 1). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="5 دقائق"
      brief={{
        tag: 'أستعدّ — الكتاب ص 91 وعبارات من المنصّة', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>عبارتان من الكتاب عن المتوسط، وأربع من المنصّة عن الترتيب وجدول التكرارات. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        mutawassit: { label: 'حساب متوسط سلسلة', emoji: '⚖️' },
        tarjih: { label: 'المتوسط مع التكرارات', emoji: '🧮' },
        tartib: { label: 'ترتيب الأعداد', emoji: '📶' },
        takrar: { label: 'قراءة جدول التكرارات', emoji: '📋' },
        mujamma: { label: 'التكرار المجمع الصاعد', emoji: '📈' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: في الدرس ميزان تضع عليه القيم بيدك، ويكتب لك كل مجموع.', advice: 'راجع حساب المتوسط: نجمع كل القيم (كل قيمة بقدر تكرارها) ثم نقسم على عددها.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى التكرارات: القيمة التي تكرّرت 18 مرّة تُحسب 18 مرّة في المتوسط.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'المتوسط والترتيب والتكرارات متحكَّم فيها.', advice: 'في المستوى المتقدّم من الميزان ستبحث عن متوسط عشري بتدريجة العُشر.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['mutawassit-basit'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['mutawassit-tarjih'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['mutawassit-basit'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['tartib-adad'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['jadwal-takrarat'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['takrar-mujamma-said'] },
      ]}
    />
  );
}
