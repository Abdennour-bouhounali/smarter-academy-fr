import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Cinq de la plateforme mesurent les الكفاءات clés des trois leçons de l'unité (produit de deux et de plusieurs relatifs, carré,
 * quotient, priorités) ; une vient de « أستعدّ » (le repère). Aucune ne donne les nombres des situations. JAMAIS bloquant ; `id` et `requires` littéraux.
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="6 دقائق"
      brief={{
        tag: 'أستعدّ — قبل الوضعيات', title: 'ست عبارات قبل الوضعيات', tone: 'teal',
        body: <p>الوضعيات تجمع ما تعلّمته في الوحدة: ضرب الأعداد النسبية وقسمتها وسلاسل الحسابات. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>,
      }}
      skills={{
        jidaa: { label: 'جداء عددين نسبيين', emoji: '✖️' },
        jidaaIda: { label: 'جداء عدة أعداد نسبية', emoji: '🔢' },
        qisma: { label: 'حاصل قسمة عددين نسبيين', emoji: '➗' },
        awlawiya: { label: 'أولوية العمليات', emoji: '🧮' },
        ihdathiyat: { label: 'إحداثيات نقطة', emoji: '📍' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: ستحلّ ست وضعيات تدريبية خطوة بخطوة.', advice: 'راجع الدروس الثلاثة: جداء عددين نسبيين، وجداء عدة أعداد نسبية، وحاصل قسمة عددين نسبيين.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه إلى إشارة الجداء وإلى ترتيب العمليات.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعيات متحكَّم فيها.', advice: 'حاول حلّ الوضعيات دون مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['jidaa-nisbi'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['jidaa-ida'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['jidaa-ida'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['qisma-nisbi'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['awlawiya-amaliyat'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-6', requires: ['ihdathiyat'] },
      ]}
    />
  );
}
