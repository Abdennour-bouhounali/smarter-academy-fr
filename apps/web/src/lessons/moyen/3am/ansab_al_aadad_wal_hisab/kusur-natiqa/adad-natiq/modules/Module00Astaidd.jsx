import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Deux viennent de « أستعدّ » (p. 23, items 12 et 8, réécrits) ; cinq de la plateforme mesurent les liens « راجع » du réseau (LEARNING_NET.md §4.4) :
 * `1am.m5.r01` (les écritures fractionnaires d'un quotient — leçon 1AM `hasil-qisma-kasr`, publiée) et `3am.m1.r02` (le quotient de deux relatifs — leçon `qismat-nisbiyayn`, publiée).
 * JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>الكتابة الكسرية لحاصل قسمة، وحاصل قسمة عددين نسبيين، وترتيب الأعداد النسبية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        kasr: { label: 'الكتابة الكسرية لحاصل قسمة', emoji: '➗' },
        qisma: { label: 'حاصل قسمة عددين نسبيين', emoji: '±' },
        tartib: { label: 'ترتيب الأعداد النسبية', emoji: '↔️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بحبل تعلّق عليه بطاقات.', advice: 'راجع الكتابة الكسرية لحاصل قسمة، وإشارة حاصل قسمة عددين نسبيين.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة الحاصل وإلى أنّ 2,33 ليس إلا قيمة مقرّبة.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكتابة الكسرية وحاصل القسمة والترتيب متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['hasil-qisma-kasr-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['hasil-qisma-kasr-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['hasil-qisma-kasr-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['qismat-nisbiyayn-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['qismat-nisbiyayn-3am'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-6', requires: ['qismat-nisbiyayn-3am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-7', requires: ['muqarana-nisbiya-2am'] },
      ]}
    />
  );
}
