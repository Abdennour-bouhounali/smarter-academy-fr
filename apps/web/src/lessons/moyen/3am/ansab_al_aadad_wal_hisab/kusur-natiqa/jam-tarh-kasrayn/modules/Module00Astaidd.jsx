import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Deux viennent de « أستعدّ » (p. 23, items 6 et 7, réécrits) ; cinq de la plateforme mesurent le lien « راجع » du réseau (LEARNING_NET.md §4.4) :
 * `2am.m1.r09` (additionner ou soustraire deux fractions de même dénominateur ou dont un dénominateur est multiple de l'autre — leçon 2AM `jam-tarh-kusur`, NON publiée : « قريبًا »), et
 * le dénominateur commun de `tasawi-muqaranat-kasrayn` (publiée). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        tag: 'أستعدّ', title: 'سبع عبارات قبل الانطلاق', tone: 'teal',
        body: <p>جمع كسرين وطرحهما حين يكون المقامان متساويين أو أحدهما مضاعفًا للآخر، وكتابة كسرين بمقام واحد. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        jam: { label: 'جمع كسرين وطرحهما', emoji: '➕' },
        tawhid: { label: 'كتابة كسرين بمقام واحد', emoji: '🔗' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بمشط تمدّه بيدك على حوض صغير.', advice: 'راجع جمع كسرين لهما نفس المقام، وكتابة عدد طبيعي كسرًا مقامه ما تريد.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: لا نجمع المقامين، ونوحّد المقام قبل أن نجمع البسطين.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الحالات البسيطة وكتابة الكسر بمقام آخر متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['jam-tarh-kusur-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['jam-tarh-kusur-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['jam-tarh-kusur-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['jam-tarh-kusur-2am'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-5', requires: ['jam-tarh-kusur-2am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-6', requires: ['jam-tarh-kusur-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-7', requires: ['tawhid-maqamat-3am'] },
      ]}
    />
  );
}
