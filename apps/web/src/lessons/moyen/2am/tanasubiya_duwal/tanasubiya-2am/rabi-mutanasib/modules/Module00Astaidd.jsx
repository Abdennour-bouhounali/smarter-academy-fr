import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Trois viennent de « أستعدّ » (p. 71, items 1, 3 et 4, réécrits) ; quatre de la plateforme
 * mesurent le lien « راجع » du réseau (LEARNING_NET.md §4.4) : `1am.m6.r04` (إتمام جدول تناسبية بطرائق مختلفة — leçon 1AM non publiée,
 * jamais reconstruite ici : le chemin multiplicatif, le chemin additif, le piège de la différence) et la reconnaissance d'un tableau
 * (leçon sœur `wadiya-tanasubiya-jadwal`, non publiée). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>الكتلة الواحدة، ومعامل التناسبية، وجدول التناسبية، وطريقا الضرب والجمع في جدول. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        wahda: { label: 'الكتلة الواحدة', emoji: '📦' },
        maadala: { label: 'عدد ناقص في جداء', emoji: '✖️' },
        muamil: { label: 'معامل التناسبية', emoji: '🔢' },
        jadwal: { label: 'جدول تناسبية', emoji: '📋' },
        itmam: { label: 'إتمام جدول', emoji: '🧩' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ ببطاقة ناقصة تحرّكها بيدك.', advice: 'راجع معامل التناسبية وإتمام جدول بالضرب أو بالجمع.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: لا نضيف الفرق نفسه إلى الثمن.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الوحدة والمعامل والجدول متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['qisma-wahda'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['qisma-wahda'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['jadwal-tanasubiya'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-4', requires: ['jadwal-tanasubiya'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-5', requires: ['itmam-jadwal'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-6', requires: ['itmam-jadwal'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-7', requires: ['itmam-jadwal'] },
      ]}
    />
  );
}
