import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, bâties sur les TROIS
 * leçons de l'unité (la synthèse dans le lecteur de mission, 2026-11-10 — décisions S) : خاصية طالس (à réviser : talis-hisab-atwal), الخاصية
 * العكسية (aksiya-talis), تقسيم قطعة (inshaat-talis), en cycle. Les sept affirmations d'avant restent dans content/textbook.js (PREP_ITEMS).
 * Diagnostic JAMAIS bloquant, aucune `assessment`. `id` et `requires` restent littéraux (audit) : talis-mubashira (1, 3, 4, 6, 7, 9, 10 — le
 * partage d'une قطعة se justifie par Thalès), talis-aksiya (2, 5, 8).
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
        talis: { label: 'خاصية طالس وحساب الأطوال', emoji: '📏', lesson: 'talis-hisab-atwal' },
        aksiya: { label: 'الخاصية العكسية وإثبات التوازي', emoji: '🪜', lesson: 'aksiya-talis' },
        inshaat: { label: 'تقسيم قطعة إلى قطع متقايسة', emoji: '✂️', lesson: 'inshaat-talis' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الوضعيات التدريبية تمرّ بك خطوة خطوة.', advice: 'راجع الدرس الذي تقترحه عليك الصفحة قبل أن تبدأ.', cta: 'أبدأ على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه: في وضعية طالس نقارن ضلعين يبدآن من النقطة المشتركة.', cta: 'أبدأ الوضعيات', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'مفاتيح الوحدة معك.', advice: 'قبل أن تحسب، ابحث عن المثلثين في وضعية طالس.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['talis-mubashira'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['talis-aksiya'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['talis-mubashira'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['talis-mubashira'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['talis-aksiya'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['talis-mubashira'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['talis-mubashira'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['talis-aksiya'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['talis-mubashira'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['talis-mubashira'] },
      ]}
    />
  );
}
