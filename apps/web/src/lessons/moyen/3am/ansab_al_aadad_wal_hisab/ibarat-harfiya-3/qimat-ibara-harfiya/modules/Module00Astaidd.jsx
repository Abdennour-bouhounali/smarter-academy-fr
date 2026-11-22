import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations qui mesurent les DEUX liens « راجع » du réseau (`reviewLinksForLesson`) : les opérations sur les rationnels
 * (items 1–2, `amaliyat-natiqa`, item 3am.m1.r08 — leçon non publiée) et la règle littérale (item 3, `tatbiq-qaida-harfiya`, item 1am.m5.r08 — leçon 1AM non
 * publiée), plus la puissance d'un négatif (item 4, `quwat-adad-nisbi`, publiée, hors réseau) et la priorité des opérations (items 5–6, « أستعدّ » 1 et 4 du
 * manuel réécrits ; 2 et 3 citées par l'item 5). Le panneau « راجع قبل أن تنطلق » (automatique) les nomme. JAMAIS bloquant ; littéraux (audit).
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
        body: <p>عمليات على الكسور، وتطبيق قاعدة حرفية، وقوة عدد سالب، وأولوية العمليات. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        natiq: { label: 'العمليات على الأعداد الناطقة', emoji: '➗' },
        qaida: { label: 'تطبيق قاعدة حرفية', emoji: '📏' },
        quwa: { label: 'قوة عدد سالب', emoji: '²' },
        awlawiya: { label: 'أولوية العمليات', emoji: '🔢' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بمسار كريات تحسب بدلًا عنك.', advice: 'راجع العمليات على الكسور، وأنّ $(-3)^2=9$ ، وأنّ الضرب قبل الجمع والطرح.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى القوس حول العدد السالب قبل التربيع.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكسور والقوى والأولوية متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['amaliyat-natiqa-3am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['amaliyat-natiqa-3am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['tatbiq-qaida-harfiya-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['quwat-adad-nisbi-3am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['awlawiya-amaliyat'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['awlawiya-amaliyat'] },
      ]}
    />
  );
}
