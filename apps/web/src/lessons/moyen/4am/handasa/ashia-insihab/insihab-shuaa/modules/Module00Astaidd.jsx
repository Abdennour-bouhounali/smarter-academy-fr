import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 1, 2, 5 et 6 du manuel (p. 127 ; 3, 4 et 7 sont au درس « الشعاعان المتساويان … ») et
 * deux affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : les diagonales du parallélogramme
 * (1), sa définition (2), la translation de 3AM (5, p2), la conservation des longueurs (6), le parallélisme (p1, le
 * « نفس المنحى » de معارف 1). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="5 دقائق"
      brief={{
        tag: 'أستعدّ — الكتاب ص 127', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>أربع عبارات من الكتاب واثنتان من المنصّة عن متوازي الأضلاع، والانسحاب الذي عرفته في السنة الثالثة، والمستقيمات المتوازية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        qutr: { label: 'قطرا متوازي الأضلاع', emoji: '✖️' },
        tarif: { label: 'تعريف متوازي الأضلاع', emoji: '▱' },
        insihab: { label: 'الانسحاب (السنة الثالثة)', emoji: '➡️' },
        atwal: { label: 'الانسحاب يحافظ على الأطوال', emoji: '📏' },
        tawazi: { label: 'المستقيمات المتوازية', emoji: '〰️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بعرض مسيّرات تحرّكها بيدك.', advice: 'راجع: متوازي الأضلاع قطراه متناصفان وكل ضلعين متقابلين فيه متوازيان؛ والانسحاب يحرّك كل النقط بنفس الحركة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: الانسحاب الذي يحوّل E إلى F ليس هو الذي يحوّل F إلى E — الجهة مهمّة.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'متوازي الأضلاع والانسحاب متحكَّم فيهما.', advice: 'في المستوى المتقدّم أعد بناء الانسحابات الأربعة للكتاب دون أضواء مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['tanasuf-qutrayn'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['tarif-mutawazi'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-5', requires: ['insihab-3am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-6', requires: ['insihab-atwal'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p1', requires: ['tawazi-mustaqimat'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p2', requires: ['insihab-3am'] },
      ]}
    />
  );
}
