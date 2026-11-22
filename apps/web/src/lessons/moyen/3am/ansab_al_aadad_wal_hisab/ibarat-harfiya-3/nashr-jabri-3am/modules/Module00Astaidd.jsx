import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations qui mesurent les DEUX liens « راجع » du réseau (`reviewLinksForLesson`) : le produit de deux nombres
 * rationnels (items 1–2, `jidaa-adadayn-nisbiyayn`, item 3am.m1.r01 — leçon non publiée) et la simplification (items 3–4, `tabsit-hadhf-aqwas`,
 * item 3am.m5.r01 — leçon publiée), plus l'aire et le périmètre écrits (items 5–6, « أستعدّ » 11 et 10 du manuel réécrits). Le panneau
 * « راجع قبل أن تنطلق » (automatique) les nomme. JAMAIS bloquant ; littéraux (audit).
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
        body: <p>جداء عددين نسبيين، وتبسيط عبارة، ومساحة مستطيل ومحيطه. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        jidaa: { label: 'جداء عددين نسبيين', emoji: '✖️' },
        tabsit: { label: 'تبسيط عبارة جبرية', emoji: '🧮' },
        maseha: { label: 'مساحة مستطيل ومحيطه', emoji: '📐' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من قطعة أرض نقطعها بأيدينا.', advice: 'راجع إشارة جداء عددين نسبيين، وجمع الحدود المتشابهة، وأنّ مساحة المستطيل جداء بعديه.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى جداء عددين سالبين: هو موجب.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'إشارة الجداء والتبسيط والمساحة متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['jidaa-adadayn-nisbiyayn'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['jidaa-adadayn-nisbiyayn'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['tabsit-hadhf-aqwas'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['tabsit-hadhf-aqwas'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['tabir-harfi'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['tabir-harfi'] },
      ]}
    />
  );
}
