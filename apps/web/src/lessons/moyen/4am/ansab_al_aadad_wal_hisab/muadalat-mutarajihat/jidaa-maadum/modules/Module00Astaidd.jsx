import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « حل معادلة من الدرجة الأولى » (à réviser : muadala-ula) et « تحليل عبارة جبرية » (à réviser : tahlil-ibara) — rollout de l'unité 4,
 * leçon 2, le 2026-11-11 (verdict L2.9). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
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
        body: <p>من السهل جدًّا إلى الأصعب: حل معادلة من الدرجة الأولى وتحليل عبارة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        // `lesson` : la leçon à réviser quand cette كفاءة est fragile
        muadala: { label: 'حل معادلة من الدرجة الأولى', emoji: '⚖️', lesson: 'muadala-ula' },
        tahlil: { label: 'تحليل عبارة جبرية', emoji: '🧩', lesson: 'tahlil-ibara' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بملعب تحرّك ضلعيه بيدك.', advice: 'راجع درس معادلة من الدرجة الأولى ودرس تحليل عبارة جبرية.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة الحل عند حل معادلة من الدرجة الأولى، وإلى إشارة العامل السالب عند النشر.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'النشر والتحليل وحل معادلة من الدرجة الأولى متحكَّم فيها.', advice: 'ابحث وحدك عن كل القيم التي يختفي عندها الملعب.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['hal-muadala-ula'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['tahlil-amil'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['hal-muadala-ula'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['tahlil-amil'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['hal-muadala-ula'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['tahlil-huwiya'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['hal-muadala-ula'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['tahlil-amil'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['hal-muadala-ula'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['tahlil-amil'] },
      ]}
    />
  );
}
