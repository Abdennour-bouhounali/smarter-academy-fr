import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme sur les items du réseau que la leçon suppose (LEARNING_NET.md §4.4) : `1am.m5.r01` (items 1 et 2 : le quotient — 1AM `hasil-qisma-kasr`, publiée),
 * `1am.m5.r02` (items 3 et 4 : écritures égales et réduction — 1AM `ikhtizal-kitaba-kasriya`, publiée), la mise sur même dénominateur (item 5, `jam-tarh-kusur` publiée) et la lecture d'une droite graduée (item 6).
 * Chaque item de révision est MESURÉ. Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux.
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
        quotient: { label: 'الكسر حاصل قسمة', emoji: '➗' },
        reduce: { label: 'الكتابات الكسرية المتساوية', emoji: '🟰' },
        sum: { label: 'توحيد المقامات', emoji: '➕' },
        line: { label: 'قراءة مستقيم مدرّج', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بليزر نحرّكه على أنبوبين مدرّجين.', advice: 'راجع درس « اختزال كتابة كسرية » من السنة الأولى أسفله.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'تذكّر دائمًا: ضرب حدّي الكسر في العدد نفسه لا يغيّر قيمته.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكتابات الكسرية المتساوية والاختزال متحكَّم فيهما.', advice: 'جرّب مباشرة ليزر المعصرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['hasil-qisma-kasr-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['hasil-qisma-kasr-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['ikhtizal-kitaba-kasriya-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['ikhtizal-kitaba-kasriya-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['jam-tarh-kusur-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['mustaqim-mudarraj'] },
      ]}
    />
  );
}
