import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Deux viennent de « أستعدّ » (p. 23, items 3 et 5, réécrits) ; cinq de la plateforme mesurent le lien « راجع » du réseau (LEARNING_NET.md §4.4) :
 * `2am.m1.r08` (comparer deux fractions de même dénominateur, de même numérateur, ou dont un dénominateur est multiple de l'autre — leçon 2AM `muqarana-kasrayn`, publiée 2026-10-29 : « راجع » porte son lien).
 * JAMAIS bloquant ; `id` et `requires` littéraux. L'item 4 du manuel (des figures) est repris par la banque d'exercices.
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
        body: <p>مقارنة كسرين لهما نفس المقام أو نفس البسط أو مقام أحدهما مضاعف للآخر، وكسور متساوية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        muqarana: { label: 'مقارنة كسرين', emoji: '⚖️' },
        tawhid: { label: 'كسور متساوية ومقام مشترك', emoji: '🔗' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بآلة تمزج الألوان تُدير ذراعها بيدك.', advice: 'راجع مقارنة كسرين بنفس المقام أو بنفس البسط، وكتابة كسر على مقام آخر بضرب البسط والمقام في العدد نفسه.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ المقام الأصغر يعطي الكسر الأكبر إذا تساوى البسطان.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'مقارنة الكسور البسيطة والكسور المتساوية متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['muqarana-kasrayn-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['muqarana-kasrayn-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['muqarana-kasrayn-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['muqarana-kasrayn-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['muqarana-kasrayn-2am'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-6', requires: ['kasr-mutasawi-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-7', requires: ['muqarana-kasrayn-2am'] },
      ]}
    />
  );
}
