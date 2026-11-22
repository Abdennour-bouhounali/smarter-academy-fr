import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme (celles de « استحضر مكتسباتي » 6–8 sont réécrites). Les liens de révision du
 * réseau pour cette leçon : `1am.m5.r01` (une figure à parts égales, un kasr plus grand que 1 : items 1–2) et `1am.m1.r05`
 * (additionner / soustraire des décimaux : items 3–4) ; puis les rangs et « عدد العشرات » du primaire (items 5–6, la leçon
 * précédente de l'unité). JAMAIS bloquant ; littéraux (audit).
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
        body: <p>الكسور، وجمع العشريين وطرحهما، والمراتب. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        kasr: { label: 'الكسر جزء من الوحدة', emoji: '🍰' },
        jam: { label: 'جمع الأعداد العشرية وطرحها', emoji: '➕' },
        maratib: { label: 'المراتب', emoji: '🔢' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من لوحات زليج وبلاطات.', advice: 'راجع الكسر جزءًا من الوحدة، وجمع الأعداد العشرية، ومراتب العدد.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه للفرق بين رقم المرتبة وعدد وحداتها.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكسور والمراتب وجمع العشريين متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['kasr-juz-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['kasr-juz-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['jam-tarh-ashriya'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['jam-tarh-ashriya'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['maratib-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['maratib-ibtidai'] },
      ]}
    />
  );
}
