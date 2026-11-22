import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « النشر بالخاصية التوزيعية » (à réviser : nashr-tabsit, la leçon 1 de l'unité) et « المتطابقات الشهيرة » (à réviser :
 * mutatabiqat-shahira, la leçon 2) — règle des pilotes (propriétaire 2026-11-07) ; rollout de l'unité 3, leçon 3, le 2026-11-11 (conseil du
 * 2026-11-11, verdict L3.5). Les huit énoncés d'avant restent dans content/textbook.js (PREP_ITEMS) comme source. Diagnostic JAMAIS bloquant,
 * aucune `assessment`. `id` et `requires` restent littéraux (audit) : nashr-tawzii (1, 3, 5, 7, 9), mutatabiqat (2, 4, 6, 8, 10).
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
        nashr: { label: 'النشر بالخاصية التوزيعية', emoji: '🧮', lesson: 'nashr-tabsit' },
        huwiyat: { label: 'المتطابقات الشهيرة', emoji: '²', lesson: 'mutatabiqat-shahira' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بقطع عشب تفرشها بيدك.', advice: 'راجع درسي نشر وتبسيط عبارة جبرية والمتطابقات الشهيرة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الحد المضاعف 2ab وإلى إشارة العامل السالب عند النشر.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'النشر والمتطابقات الشهيرة متحكَّم فيهما.', advice: 'حاول أن تتوقّع قبل أن تفرش العشب.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['nashr-tawzii'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['nashr-tawzii'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['nashr-tawzii'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['nashr-tawzii'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['mutatabiqat'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['nashr-tawzii'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['mutatabiqat'] },
      ]}
    />
  );
}
