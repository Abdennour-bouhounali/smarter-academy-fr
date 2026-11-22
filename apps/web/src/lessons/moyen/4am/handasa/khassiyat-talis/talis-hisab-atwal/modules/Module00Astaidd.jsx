import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « تساوي كسرين والجداء المتصالب » (à réviser : tasawi-muqaranat-kasrayn, 3AM) et « التناسبية والرابع المتناسب » (à réviser :
 * rabi-mutanasib, 2AM) : deux leçons PUBLIÉES qui ENSEIGNENT ces acquis ; aucune affirmation n'a besoin de Thalès (acquis antérieurs seulement) —
 * règle des pilotes (propriétaire 2026-11-07) ; rollout de l'unité 9, leçon 1, le 2026-11-10 (conseil du 2026-11-10). Les six énoncés d'avant
 * (dont la droite des milieux, dont la leçon de 3AM n'est pas encore publiée) restent dans content/textbook.js (PREP_ITEMS) comme source.
 * Diagnostic JAMAIS bloquant, aucune `assessment`. `id` et `requires` restent littéraux (audit) : rabi-mutanasib (1, 3, 5, 7, 9),
 * jadwal-tanasub (2, 4, 6, 8, 10).
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
        kasr: { label: 'تساوي كسرين والجداء المتصالب', emoji: '✖️', lesson: 'tasawi-muqaranat-kasrayn' },
        tanasub: { label: 'التناسبية والرابع المتناسب', emoji: '📊', lesson: 'rabi-mutanasib' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بساحة تحرّك فيها عصا بيدك.', advice: 'راجع الجداء المتصالب لكسرين متساويين، وحساب الرابع المتناسب في وضعية تناسبية.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: في جدول تناسبية نضرب في العدد نفسه، ولا نضيف العدد نفسه.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الجداء المتصالب والتناسبية متحكَّم فيهما.', advice: 'في الساحة حاول أن تتوقّع قبل أن تحرّك العصا.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['rabi-mutanasib'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['jadwal-tanasub'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['rabi-mutanasib'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['jadwal-tanasub'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['rabi-mutanasib'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['jadwal-tanasub'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['rabi-mutanasib'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['jadwal-tanasub'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['rabi-mutanasib'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['jadwal-tanasub'] },
      ]}
    />
  );
}
