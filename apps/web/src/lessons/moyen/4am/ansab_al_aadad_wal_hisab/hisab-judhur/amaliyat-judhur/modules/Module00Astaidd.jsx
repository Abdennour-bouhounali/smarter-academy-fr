import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « مربّع جداء ومربّع حاصل قسمة » et « الجذر التربيعي » (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 2, leçon 4,
 * le 2026-11-10). Les six énoncés d'avant (p. 19, items 5 et 6, + quatre affirmations de la plateforme) restent dans textbook.js comme source.
 * Les trois `priorKnowledge` sont mesurés : (ab)² et (a/b)² (quwa-jidaa-kasr), la définition de √a (jidhr-taarif) et (√a)² = a (murabba-jidhr).
 * Diagnostic JAMAIS bloquant, aucune `assessment`. `id` et `requires` restent littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="8 دقائق"
      brief={{
        tag: 'أستعدّ', title: 'عشر عبارات قبل الانطلاق', tone: 'teal',
        body: <p>من السهل جدًّا إلى الأصعب. ليست اختبارًا: الغاية أن تعرف أنت ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        // `lesson` : la leçon à réviser quand cette كفاءة est fragile (carte « راجع » prioritaire de la revue)
        quwa: { label: 'مربّع جداء ومربّع حاصل قسمة', emoji: '²', lesson: 'quwat-adad-nisbi' },
        jidhr: { label: 'الجذر التربيعي', emoji: '√', lesson: 'jidhr-tarbii' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بتبليط مربّع، وكل عدد فيه يُحسب أمامك.', advice: 'راجع أن الجذر التربيعي لعدد موجب هو العدد الموجب الذي مربعه هذا العدد.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: مربع حاصل قسمة هو حاصل قسمة المربعين، البسط والمقام معًا.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'تعرف مربع جداء ومربع حاصل قسمة، وتعرف الجذر التربيعي.', advice: 'حاول أن تتوقّع قبل أن تحرّك أي شيء.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['quwa-jidaa-kasr'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['jidhr-taarif'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['quwa-jidaa-kasr'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['jidhr-taarif'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['quwa-jidaa-kasr'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['murabba-jidhr'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['quwa-jidaa-kasr'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['jidhr-taarif'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['quwa-jidaa-kasr'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['jidhr-taarif'] },
      ]}
    />
  );
}
