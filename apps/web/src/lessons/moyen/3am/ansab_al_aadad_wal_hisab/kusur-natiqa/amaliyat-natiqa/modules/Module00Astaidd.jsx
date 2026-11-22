import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : huit affirmations. Trois viennent de « أستعدّ » (p. 23, items 9, 10 et 11, réécrits : sommes de relatifs, 2AM) ; cinq de la plateforme mesurent les liens « راجع » du réseau
 * (LEARNING_NET.md §4.4) : `3am.m1.r01` (le produit de deux relatifs — leçon `jidaa-adadayn-nisbiyayn`), `3am.m1.r04` (la division de deux fractions — `maqlub-qismat-kasrayn`), `3am.m1.r06` (la somme
 * de deux fractions — `jam-tarh-kasrayn`) et `3am.m1.r07` (le nombre ناطق — `adad-natiq`), toutes PUBLIÉES. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>جداء عددين نسبيين، وقسمة كسرين، وجمع كسرين، والعدد الناطق، وجمع الأعداد النسبية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        jida: { label: 'جداء عددين نسبيين', emoji: '✖️' },
        qisma: { label: 'قسمة كسرين', emoji: '➗' },
        jam: { label: 'جمع كسرين', emoji: '➕' },
        natiq: { label: 'العدد الناطق', emoji: '🔢' },
        nisbi: { label: 'جمع الأعداد النسبية', emoji: '±' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بلوحة ألغاز تدمج فيها بلاطات.', advice: 'راجع إشارة جداء عددين نسبيين، وجمع الكسور بتوحيد المقامات، وقسمة كسرين.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّنا لا نجمع المقامين عند جمع كسرين.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الإشارات والكسور متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['jidaa-adadayn-nisbiyayn-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['jidaa-adadayn-nisbiyayn-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['maqlub-qismat-kasrayn-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['jam-tarh-kasrayn-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['adad-natiq-3am'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-6', requires: ['jam-tarh-nisbiya-2am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-7', requires: ['jam-tarh-nisbiya-2am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-8', requires: ['jam-tarh-nisbiya-2am'] },
      ]}
    />
  );
}
