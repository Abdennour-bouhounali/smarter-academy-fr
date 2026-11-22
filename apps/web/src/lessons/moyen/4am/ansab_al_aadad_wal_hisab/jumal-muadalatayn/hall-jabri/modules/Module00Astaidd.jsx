import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « نقل حدّ وضرب طرفي مساواة » (à réviser : musawiyat-amaliyat, 3AM) et « تعويض قيمتين في عبارة بحرفين » (à réviser :
 * qimat-ibara-harfiya, 3AM) — règle des pilotes ; rollout de l'unité 5, leçon 2, 2026-11-12. Diagnostic JAMAIS bloquant ; `id` et `requires`
 * restent littéraux (audit). Les huit énoncés d'avant restent dans content/textbook.js (PREP_ITEMS).
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
        naql: { label: 'نقل حدّ وضرب طرفي مساواة', emoji: '↔️', lesson: 'musawiyat-amaliyat' },
        taawid: { label: 'تعويض قيمتين في عبارة بحرفين', emoji: '🔍', lesson: 'qimat-ibara-harfiya' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ ببطاقتين تحرّكهما بيدك.', advice: 'راجع درسي العمليات على طرفي مساواة وقيمة عبارة حرفية.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: عندما نضرب مساواة في عدد، نضرب طرفيها معًا.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'النقل والضرب في الطرفين والتعويض متحكَّم فيها.', advice: 'حاول أن تتوقّع قبل أن تحرّك البطاقتين.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['naql-hudud'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['taawid-qima'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['darb-tarafayn'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['taawid-qima'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['naql-hudud'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['taawid-qima'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['naql-hudud'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['taawid-qima'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['darb-tarafayn'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['taawid-qima'] },
      ]}
    />
  );
}
