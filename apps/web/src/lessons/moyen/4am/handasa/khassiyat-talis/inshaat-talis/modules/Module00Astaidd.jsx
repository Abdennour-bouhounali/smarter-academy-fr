import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « خاصية طالس » (à réviser : talis-hisab-atwal, la leçon 1 de l'unité) et « التناسب والرابع المتناسب » (à réviser :
 * tasawi-muqaranat-kasrayn, 3AM — la leçon qui enseigne le test d'égalité de deux fractions ; le catalogue garde amaliyat-natiqa, lien « requires »
 * du réseau) — règle des pilotes (propriétaire 2026-11-07) ; rollout de l'unité 9, leçon 3, le 2026-11-10 (conseil du 2026-11-10). Les sept énoncés
 * d'avant restent dans content/textbook.js (PREP_ITEMS) comme source. Diagnostic JAMAIS bloquant, aucune `assessment`. `id` et `requires` restent
 * littéraux (audit) : talis-nisab (1, 3, 5, 7, 9), kitabat-tanasub (2, 4, 6, 8, 10).
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
        talis: { label: 'خاصية طالس', emoji: '📏', lesson: 'talis-hisab-atwal' },
        kasr: { label: 'التناسب والرابع المتناسب', emoji: '➗', lesson: 'tasawi-muqaranat-kasrayn' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بأدوات تحرّكها بيدك.', advice: 'راجع خاصية طالس في المثلث، وحساب الرابع المتناسب بالجداء المتصالب.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: في خاصية طالس نقارن الجزء بالقطعة كلها، لا بالجزء الباقي.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'خاصية طالس والتناسب متحكَّم فيهما.', advice: 'حاول أن تتوقّع قبل أن ترسم.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['talis-nisab'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['kitabat-tanasub'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['talis-nisab'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['kitabat-tanasub'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['talis-nisab'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['kitabat-tanasub'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['talis-nisab'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['kitabat-tanasub'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['talis-nisab'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['kitabat-tanasub'] },
      ]}
    />
  );
}
