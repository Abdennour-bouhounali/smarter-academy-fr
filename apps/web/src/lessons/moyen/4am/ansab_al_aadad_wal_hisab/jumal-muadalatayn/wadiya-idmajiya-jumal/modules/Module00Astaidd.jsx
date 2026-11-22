import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, bâties sur les TROIS
 * leçons de l'unité (la synthèse dans le lecteur de mission, 2026-11-12 — recette de la synthèse, point 3) : مفهوم الجملة (à réviser :
 * mafhum-jumla), الحل الجبري (hall-jabri), حل مشكلات (mushkilat-jumla), en cycle. Les sept affirmations d'avant restent dans content/textbook.js
 * (PREP_ITEMS) comme source. Diagnostic JAMAIS bloquant, aucune `assessment`. `id` et `requires` restent littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من المتابعة."
      estimatedTime="6 دقائق"
      brief={{
        tag: 'أستعدّ', title: 'عشر عبارات من دروس الوحدة', tone: 'teal',
        body: <p>من السهل جدًّا إلى الأصعب، على دروس الوحدة الثلاثة. ليست اختبارًا: الغاية أن تعرف أنت ما ينبغي أن تراجعه قبل الوضعيات.</p>,
      }}
      skills={{
        // `lesson` : la leçon à réviser quand cette كفاءة est fragile (carte « راجع » prioritaire de la revue)
        mafhum: { label: 'جملة معادلتين وحلّها', emoji: '✌️', lesson: 'mafhum-jumla' },
        hall: { label: 'الحلّ الجبري: التعويض والجمع', emoji: '🔁', lesson: 'hall-jabri' },
        mushkila: { label: 'ترجمة مشكلة والتحقّق', emoji: '🧩', lesson: 'mushkilat-jumla' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الوضعيات التدريبية تمرّ بك خطوة خطوة.', advice: 'راجع الدرس الذي تقترحه عليك الصفحة قبل أن تبدأ.', cta: 'أبدأ على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه: حلّ الجملة يحقّق المعادلتين معًا، وكل عدد يُضرب في سعر الشيء الذي يعدّه.', cta: 'أبدأ الوضعيات', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'مفاتيح الوحدة معك.', advice: 'قبل أن تحسب، سمِّ المجهولين وترجم كل معلومة بمعادلة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['hall-jumla'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['tawid'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['tarjama-jumla'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['hall-jumla'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['tawid'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['tarjama-jumla'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['hall-jumla'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['jam'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['tahaqquq-wadiya'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['mafhum-jumla'] },
      ]}
    />
  );
}
