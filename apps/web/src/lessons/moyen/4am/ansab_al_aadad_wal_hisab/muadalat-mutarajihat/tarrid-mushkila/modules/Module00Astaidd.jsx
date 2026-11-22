import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « حلّ معادلة من الدرجة الأولى » (à réviser : muadala-ula) et « ترجمة جملة إلى عبارة حرفية » (à réviser : muadalat-darajat-ula, 3AM) —
 * règle des pilotes (propriétaire 2026-11-07) ; rollout de l'unité 4, leçon 4, le 2026-11-11 (conseil du 2026-11-11). Les items d'avant
 * (content/textbook.js › PREP_ITEMS) restent comme source. Diagnostic JAMAIS bloquant. `id` et `requires` restent littéraux (audit).
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
        hall: { label: 'حلّ معادلة من الدرجة الأولى', emoji: '⚖️', lesson: 'muadala-ula' },
        tarjama: { label: 'ترجمة جملة إلى عبارة حرفية', emoji: '✍️', lesson: 'muadalat-darajat-ula' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بقصة عائلة تبني معادلتها بيدك.', advice: 'راجع حل المعادلات وكتابة العبارات الحرفية في الدرسين السابقين.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: «ضعف» و«ثلاثة أمثال» تعنيان الضرب لا الجمع.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'تعرف كيف تحلّ: بقي أن تتعلّم كيف تترجم نصًّا إلى معادلة.', advice: 'حاول أن تتوقّع قبل أن تتحقّق.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['hal-muadala'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['hal-muadala'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['hal-muadala'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['hal-muadala'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['hal-muadala'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['taklifa-nisba'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['hal-muadala'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['muhit-misaha'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['hal-muadala'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['muhit-misaha'] },
      ]}
    />
  );
}
