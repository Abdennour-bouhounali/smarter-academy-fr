import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Le lien de révision du réseau pour cette leçon : `1am.m1.r02` (les rangs d'une écriture
 * décimale et le zéro inutile : items 3–6) ; puis la comparaison des entiers du primaire (items 1–2, l'item 5 de « استحضر مكتسباتي »
 * réécrit). JAMAIS bloquant ; littéraux (audit).
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
        tag: 'أستعدّ', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>مقارنة الأعداد الطبيعية، ومراتب العدد العشري، والصفر الأخير بعد الفاصلة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        tabii: { label: 'مقارنة الأعداد الطبيعية', emoji: '⚖️' },
        maratib: { label: 'مراتب العدد العشري', emoji: '🔢' },
        asfar: { label: 'الصفر الأخير بعد الفاصلة', emoji: '0️⃣' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من قفزتين تُقاسان بمسطرة.', advice: 'راجع مقارنة الأعداد الطبيعية، ومراتب العدد العشري، ومعنى الصفر الأخير.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الفرق بين 0,05 و 0,5.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'مقارنة الأعداد الطبيعية ومراتب العدد العشري متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['muqarana-tabii-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['muqarana-tabii-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['maratib-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['maratib-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['asfar-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['asfar-ibtidai'] },
      ]}
    />
  );
}
