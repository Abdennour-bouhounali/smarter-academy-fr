import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Deux viennent de « أستعدّ » (p. 71, items 13 et 15, réécrits : arrondir le quotient lu sur la calculatrice) ; cinq de la
 * plateforme mesurent le lien « راجع » du réseau (LEARNING_NET.md §4.4) : `1am.m3.r05` (تدوير عدد عشري إلى الوحدة — hasr-qiyam-muqarraba, 1AM), l'encadrement entre
 * deux naturels (1AM/2AM) et la leçon sœur publiée `mutabayinat-amaliyat` (× positif). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>تدوير إلى الوحدة، وحصر عدد عشري بين عددين طبيعيين، وقراءة شاشة الآلة الحاسبة، وضرب متباينة في عدد موجب. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        tadwir: { label: 'التدوير إلى الوحدة', emoji: '🔄' },
        hasr: { label: 'الحصر بين عددين طبيعيين', emoji: '↔️' },
        qisma: { label: 'قسمة الآلة الحاسبة وتدويرها', emoji: '🧮' },
        mutabayina: { label: 'الضرب في عدد موجب', emoji: '✖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بميزان تصبّ فيه بيدك.', advice: 'راجع التدوير إلى الوحدة وقراءة أرقام الآلة الحاسبة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الرقم الذي يلي الرتبة عند التدوير.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التدوير والحصر وقراءة الآلة متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['tadwir-wahda'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['tadwir-wahda'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['qiyam-muqarraba'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['qiyam-muqarraba'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-5', requires: ['qisma-ashriya-2am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-6', requires: ['qisma-ashriya-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-7', requires: ['mutabayinat-amaliyat-3am'] },
      ]}
    />
  );
}
