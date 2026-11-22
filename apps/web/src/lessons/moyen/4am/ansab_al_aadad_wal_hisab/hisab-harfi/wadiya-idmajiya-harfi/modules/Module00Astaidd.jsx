import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, bâties sur les leçons
 * de l'unité (la synthèse dans le lecteur de mission, 2026-11-12 — recette de la synthèse, point 3) : النشر (à réviser : nashr-tabsit),
 * المتطابقات الشهيرة (mutatabiqat-shahira), التحليل (tahlil-ibara), en cycle. Les sept affirmations d'avant restent dans content/textbook.js
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
        body: <p>من السهل جدًّا إلى الأصعب، على دروس الوحدة. ليست اختبارًا: الغاية أن تعرف أنت ما ينبغي أن تراجعه قبل الوضعيات.</p>,
      }}
      skills={{
        // `lesson` : la leçon à réviser quand cette كفاءة est fragile (carte « راجع » prioritaire de la revue)
        nashr: { label: 'نشر جداء وتبسيطه', emoji: '📐', lesson: 'nashr-tabsit' },
        mutatabiqa: { label: 'المتطابقات الشهيرة', emoji: '²', lesson: 'mutatabiqat-shahira' },
        tahlil: { label: 'تحليل عبارة جبرية', emoji: '🧩', lesson: 'tahlil-ibara' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الوضعيات التدريبية تمرّ بك خطوة خطوة.', advice: 'راجع الدرس الذي تقترحه عليك الصفحة قبل أن تبدأ.', cta: 'أبدأ على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه: مربّع مجموع فيه حدّ مضاعف، والتحليل كتابة على شكل جداء.', cta: 'أبدأ الوضعيات', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'مفاتيح الوحدة معك.', advice: 'قبل أن تحسب، اسأل: أيّ شكل للعبارة — منشور أم محلّل — يخدم سؤالي؟', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['nashr-jadaa'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['tahlil-ibara'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['nashr-jadaa'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['tahlil-ibara'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['nashr-jadaa'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['tahlil-ibara'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['nashr-jadaa'] },
      ]}
    />
  );
}
