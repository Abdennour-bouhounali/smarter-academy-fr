import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « النشر والخاصية التوزيعية » et « جداء جذرين وجذر a²b » (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 2, leçon 5,
 * le 2026-11-10). Les neuf énoncés d'avant (p. 19, items 7–9, + six affirmations de la plateforme) restent dans textbook.js comme source.
 * Les `priorKnowledge` mesurés : l'expansion et la distributivité (mutatabiqat), la définition (√a)² = a (jidhr-taarif), le جداء et la قسمة (jidaa-jidhrayn,
 * qismat-jidhrayn) et √(a²b) = a√b (jidhr-a2b). Diagnostic JAMAIS bloquant, aucune `assessment`. `id` et `requires` restent littéraux (audit).
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
        huwiyat: { label: 'النشر والخاصية التوزيعية', emoji: '🧮', lesson: 'nashr-jabri-3am' },
        jidaa: { label: 'جداء جذرين وحاصل قسمتهما', emoji: '✖️', lesson: 'amaliyat-judhur' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بمربّع تبلّطه بيدك.', advice: 'راجع المتطابقات الشهيرة وخاصية الجداء في درس العمليات على الجذور.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الحدّ 2ab في نشر مربع مجموع.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'النشر والحساب على الجذور متحكَّم فيهما.', advice: 'حاول أن تتوقّع قبل أن تحرّك أي شيء.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['jidhr-taarif'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['jidaa-jidhrayn'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['qismat-jidhrayn'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['jidhr-a2b'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['jidhr-a2b'] },
      ]}
    />
  );
}
