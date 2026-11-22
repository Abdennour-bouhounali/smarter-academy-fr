import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations de la plateforme, UNE ou deux par leçon de l'unité (المساويات والعمليات, المتباينات والعمليات, الحصر والتدوير, المعادلة من الدرجة الأولى).
 * Aucune ne donne les nombres des situations. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        tag: 'أستعدّ — قبل الوضعيات', title: 'سبع عبارات قبل الوضعيات', tone: 'teal',
        body: (
          <div className="space-y-3">
            <p>الوضعيات تجمع ما تعلّمته في الوحدة: العمليات على طرفي مساواة أو متباينة، والتدوير والحصر، وحلّ معادلة من الدرجة الأولى. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>
          </div>
        ),
      }}
      skills={{
        musawiyat: { label: 'المساويات والعمليات', emoji: '⚖️' },
        mutabayinat: { label: 'المتباينات والعمليات', emoji: '↕️' },
        hasr: { label: 'التدوير والحصر', emoji: '🎯' },
        muadalat: { label: 'المعادلة من الدرجة الأولى', emoji: '🧮' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: ستحلّ ست وضعيات تدريبية خطوة بخطوة.', advice: 'راجع الدروس الأربعة: المساويات والعمليات، والمتباينات والعمليات، وحصر عدد عشري موجب، والمعادلة من الدرجة الأولى.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه إلى العملية على الطرفين معًا، وإلى انعكاس الاتجاه عند الضرب في عدد سالب، وإلى الرقم الذي يلي رتبة التدوير.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعيات متحكَّم فيها.', advice: 'حاول حلّ الوضعيات دون مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['musawiyat-amaliyat-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['mutabayinat-amaliyat-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['mutabayinat-amaliyat-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['hasr-adad-ushri-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['hasr-adad-ushri-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['muadalat-darajat-ula-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[6]), id: 'prep-7', requires: ['muadalat-darajat-ula-3am'] },
      ]}
    />
  );
}
