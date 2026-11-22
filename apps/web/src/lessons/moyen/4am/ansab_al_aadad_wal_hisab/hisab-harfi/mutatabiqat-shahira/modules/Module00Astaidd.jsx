import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « نشر جداء قوسين وتبسيطه » (à réviser : nashr-tabsit, la leçon 1 de l'unité, qui l'enseigne) et « مربّع عدد نسبي أو جداء » (à
 * réviser : quwat-adad-nisbi, 3AM) — règle des pilotes (propriétaire 2026-11-07) ; rollout de l'unité 3, leçon 2, le 2026-11-11 (conseil du
 * 2026-11-11). Les huit items d'avant (content/textbook.js › PREP_ITEMS) restent comme source. Diagnostic JAMAIS bloquant.
 * `id` et `requires` restent littéraux (audit) : nashr-qawsayn (1, 5, 7, 9), tabsit-hudud (3), murabba-adad (2, 4, 6, 8), quwa-ashara (10).
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
        tag: 'أستعدّ', title: 'عشر عبارات قبل الانطلاق', tone: 'teal',
        body: <p>من السهل جدًّا إلى الأصعب. ليست اختبارًا: الغاية أن تعرف أنت ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        // `lesson` : la leçon à réviser quand cette كفاءة est fragile (carte « راجع » prioritaire de la revue)
        nashr: { label: 'نشر جداء قوسين وتبسيطه', emoji: '🧮', lesson: 'nashr-tabsit' },
        murabba: { label: 'مربّع عدد نسبي أو جداء', emoji: '🟩', lesson: 'quwat-adad-nisbi' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بملعب تُحسب كل منطقة فيه أمامك.', advice: 'راجع نشر جداء قوسين: كل حد من القوس الأول يُضرب في كل حد من القوس الثاني.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: مربع جداء يُربّع فيه المعامل أيضًا، ومربع عدد سالب موجب.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'تنشر جداء قوسين وتجمع الحدود المتشابهة وتحسب المربعات.', advice: 'حاول أن تجد المتطابقة بنفسك على الملعب قبل أن تقرأها.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['nashr-qawsayn'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['tabsit-hudud'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['nashr-qawsayn'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['nashr-qawsayn'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['nashr-qawsayn'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['quwa-ashara'] },
      ]}
    />
  );
}
