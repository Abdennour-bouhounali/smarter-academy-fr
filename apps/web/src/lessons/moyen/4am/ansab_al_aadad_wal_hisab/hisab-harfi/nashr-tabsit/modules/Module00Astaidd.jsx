import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « النشر بالخاصية التوزيعية » (à réviser : nashr-jabri-3am, 3AM, la leçon qui l'enseigne) et « تبسيط عبارة وحذف الأقواس » (à
 * réviser : tabsit-hadhf-aqwas, 3AM) — règle des pilotes (propriétaire 2026-11-07) ; rollout de l'unité 3, leçon 1, le 2026-11-11 (conseil du
 * 2026-11-11). Les items d'avant (content/textbook.js › PREP_ITEMS, PREP_PLATFORM_ITEMS) restent comme source. Diagnostic JAMAIS bloquant.
 * `id` et `requires` restent littéraux (audit) : khassiya-tawziiya (1, 3, 5, 9), awlawiyat-hisab (7), jidaa-x-fi-x (2, 4, 10), hadhf-aqwas (6, 8).
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
        nashr: { label: 'النشر بالخاصية التوزيعية', emoji: '✖️', lesson: 'nashr-jabri-3am' },
        tabsit: { label: 'تبسيط عبارة وحذف الأقواس', emoji: '🧹', lesson: 'tabsit-hadhf-aqwas' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بملعب تحسب مساحته منطقةً منطقة.', advice: 'راجع أن العدد الذي أمام القوسين يُضرب في كل حد بداخلهما، مع إشارته.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: إشارة ناقص أمام قوسين تغيّر إشارة كل حد بداخلهما.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الخاصية التوزيعية والحساب على الحدود متحكَّم فيهما.', advice: 'حاول أن تتوقّع قبل أن تتحقّق.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['khassiya-tawziiya'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['jidaa-x-fi-x'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['khassiya-tawziiya'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['jidaa-x-fi-x'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['khassiya-tawziiya'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['hadhf-aqwas'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['awlawiyat-hisab'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['hadhf-aqwas'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['khassiya-tawziiya'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['jidaa-x-fi-x'] },
      ]}
    />
  );
}
