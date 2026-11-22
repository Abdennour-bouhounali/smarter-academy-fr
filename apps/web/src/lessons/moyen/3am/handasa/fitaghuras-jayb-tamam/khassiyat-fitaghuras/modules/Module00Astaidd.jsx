import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : huit affirmations. Le réseau donne deux liens « راجع » vers cette leçon, tous deux mesurés : 1am.m2.r08 (aire d'un
 * carré, d'un rectangle — items 1, 2, 7) et 3am.m3.r06 (puissance d'un relatif : les carrés, items 3–6) ; l'item 8 nomme le وتر.
 * Les items 3, 4, 6, 7, 8 réécrivent « أستعدّ » p. 167 avec d'autres nombres. JAMAIS bloquant ; littéraux (audit).
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
        tag: 'أستعدّ', title: 'ثماني عبارات قبل الانطلاق', tone: 'teal',
        body: <p>مساحة المربع والمستطيل، مربع عدد، والمثلث القائم. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        masaha: { label: 'مساحة المربع والمستطيل', emoji: '⬛' },
        quwa: { label: 'مربع عدد', emoji: '²' },
        qaim: { label: 'المثلث القائم', emoji: '📐' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من ماء تسكبه بيدك.', advice: 'راجع مساحة المربع وحساب مربع عدد مثل $2{,}6^2$.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: مربع عدد هو جداؤه في نفسه، لا ضعفه.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'المساحات والمربعات والمثلث القائم متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['masahat-murabba-mustatil'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['masahat-murabba-mustatil'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['masahat-murabba-mustatil'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['muthallath-qaim'] },
      ]}
    />
  );
}
