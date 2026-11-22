import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « تساوي كسرين » (à réviser : tasawi-muqaranat-kasrayn, 3AM — la leçon qui enseigne le test ; le catalogue garde amaliyat-natiqa, lien « requires » du réseau) et « خاصية طالس وترتيب النقط » (à réviser : talis-hisab-atwal) — règle des
 * pilotes (propriétaire 2026-11-07) ; rollout de l'unité 9, leçon 2, le 2026-11-10 (conseil du 2026-11-10). Les six énoncés d'avant restent dans
 * content/textbook.js (PREP_ITEMS) comme source. Diagnostic JAMAIS bloquant, aucune `assessment`. `id` et `requires` restent littéraux (audit) :
 * tasawi-kasrayn (1, 3, 5, 7, 9), tartib-nuqat (2, 6), talis-mubashira (4, 8, 10).
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
        kasr: { label: 'تساوي كسرين', emoji: '✖️', lesson: 'tasawi-muqaranat-kasrayn' },
        talis: { label: 'خاصية طالس وترتيب النقط', emoji: '📐', lesson: 'talis-hisab-atwal' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بلوح وميزان ماء تحرّكهما بيدك.', advice: 'راجع مقارنة كسرين بالجداء المتصالب، وخاصية طالس من الدرس السابق.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: نقطة بين نقطتين تعني أنهما في جهتين مختلفتين منها.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكسور والترتيب وخاصية طالس متحكَّم فيها.', advice: 'حاول أن تتوقّع قبل أن تضع الميزان.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['tasawi-kasrayn'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['tartib-nuqat'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['tasawi-kasrayn'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['talis-mubashira'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['tasawi-kasrayn'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['tartib-nuqat'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['tasawi-kasrayn'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['talis-mubashira'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['tasawi-kasrayn'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['talis-mubashira'] },
      ]}
    />
  );
}
