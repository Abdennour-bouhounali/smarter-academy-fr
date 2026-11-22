import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : l'item 8 de « أستعدّ » (p. 23, réécrit avec ses nombres) et cinq affirmations de la plateforme sur les items du réseau que la leçon suppose (LEARNING_NET.md §4.4) :
 * `1am.m5.r03` (jouée par les items 2 et 3 : somme et différence de fractions décimales — leçon PUBLIÉE `kusur-ashriya-kitaba`, le panneau « راجع قبل أن تنطلق » la lie) et `2am.m1.r08` (la comparaison
 * de deux fractions de même dénominateur — leçon SUIVANTE de l'unité, « قريبًا » sans lien : items 5 et 6). Chaque item de révision est MESURÉ. Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>ست عبارات. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        natural: { label: 'عدد طبيعي وكسر', emoji: '🔢' },
        decimal: { label: 'جمع الكسور العشرية وطرحها', emoji: '➕' },
        equal: { label: 'الكتابات الكسرية المتساوية', emoji: '🟰' },
        compare: { label: 'كسران لهما نفس المقام', emoji: '⚖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بفوج يمشي على مسلك وتعدّ أعمدته.', advice: 'راجع درس « جمع وطرح الكسور العشرية » من السنة الأولى أسفله.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'تذكّر دائمًا: نضرب الحدّين في العدد نفسه فلا يتغيّر الكسر.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكسور العشرية والكتابات المتساوية متحكَّم فيهما.', advice: 'جرّب مباشرة مسلك الأرز.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['kasr-mutasawi-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-2', requires: ['kusur-ashriya-jam-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-3', requires: ['kusur-ashriya-jam-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-4', requires: ['kasr-mutasawi-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-5', requires: ['muqarana-nafs-maqam'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-6', requires: ['muqarana-nafs-maqam'] },
      ]}
    />
  );
}
