import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations qui mesurent le lien « راجع » du réseau (`reviewLinksForLesson` : 3am.m1.r05, la comparaison de deux fractions, leçon `tasawi-muqaranat-kasrayn`, items 1–2),
 * la différence de deux fractions (items 3–4, `jam-tarh-kasrayn`), l'ordre de deux relatifs (item 5, `muqarana-nisbiya`, 2AM) et la réduction d'une expression (item 6, `tabsit-hadhf-aqwas`).
 * Le panneau « راجع قبل أن تنطلق » (automatique) les nomme. JAMAIS bloquant ; littéraux (audit).
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
        body: <p>مقارنة كسرين، وفرق كسرين، وترتيب عددين سالبين، وتبسيط عبارة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        qarn: { label: 'مقارنة كسرين', emoji: '⚖️' },
        tarh: { label: 'فرق كسرين', emoji: '➖' },
        nisbi: { label: 'ترتيب عددين سالبين', emoji: '🔢' },
        ibara: { label: 'تبسيط عبارة', emoji: '🧮' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بمقياس يقرأ الفرق بدلًا عنك.', advice: 'راجع مقارنة الكسور، وطرح كسرين بمقام مشترك، وأنّ $-7<-2$.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة كل حدّ حين تحذف قوسين مسبوقين بإشارة طرح.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكسور والفروق والترتيب متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['tasawi-muqaranat-kasrayn-3am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['tasawi-muqaranat-kasrayn-3am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['jam-tarh-kasrayn-3am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['jam-tarh-kasrayn-3am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['muqarana-nisbiya-2am'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['tabsit-hadhf-aqwas-3am'] },
      ]}
    />
  );
}
