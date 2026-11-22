import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « حلّ جملة والتحقّق من ثنائية » (à réviser : hall-jabri) et « ترجمة جملة إلى عبارة أو معادلة » (à réviser : tarrid-mushkila) —
 * règle des pilotes (propriétaire 2026-11-07) ; rollout de l'unité 5, leçon 3, le 2026-11-12. Les items d'avant (content/textbook.js ›
 * PREP_ITEMS) restent comme source. Diagnostic JAMAIS bloquant. `id` et `requires` restent littéraux (audit).
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
        hall: { label: 'حلّ جملة والتحقّق من ثنائية', emoji: '🔀', lesson: 'hall-jabri' },
        tarjama: { label: 'ترجمة جملة إلى عبارة أو معادلة', emoji: '✍️', lesson: 'tarrid-mushkila' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بقصة تترجمها بيدك خطوة خطوة.', advice: 'راجع حلّ جملة معادلتين، وترجمة جملة إلى عبارة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: الثنائية حلّ للجملة إذا حقّقت المعادلتين معًا.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'تعرف كيف تحلّ جملة: بقي أن تتعلّم كيف تترجم قصة إلى جملة.', advice: 'حاول أن تتوقّع قبل أن تتحقّق.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['tahaqquq-thunaiya'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['tarjama-ibara'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['tahaqquq-thunaiya'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['tarjama-ibara'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['tahaqquq-thunaiya'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['tarjama-ibara'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['hall-jumla'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['tarjama-ibara'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['hall-jumla'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['tarjama-ibara'] },
      ]}
    />
  );
}
