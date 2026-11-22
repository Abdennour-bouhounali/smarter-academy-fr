import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Quatre viennent de « أستعدّ » (p. 7, items 3 à 6, réécrits) ; trois de la plateforme mesurent le lien « راجع » du réseau
 * (LEARNING_NET.md §4.4) : `1am.m1.r05` (جمع، طرح وضرب أعداد عشرية في وضعية — leçon 1AM `mana-jam-tarh`, PUBLIÉE : le panneau « راجع قبل أن تنطلق » y renvoie), la
 * multiplication décimale (`darb-adad-ashriya`, 1AM, en préparation) et la curiosité qui ouvre la leçon (« 20 − 6 + 4 »). Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux.
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="7 دقائق"
      brief={{
        tag: 'أستعدّ', title: 'سبع عبارات قبل الانطلاق', tone: 'teal',
        body: <p>جمع الأعداد العشرية وطرحها وضربها في وضعية، ومعنى الجمع والطرح. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه من السنة الأولى قبل أن تبدأ.</p>,
      }}
      skills={{
        jam: { label: 'جمع الأعداد العشرية', emoji: '➕' },
        tarh: { label: 'طرح الأعداد العشرية', emoji: '➖' },
        tarjama: { label: 'اختيار العملية في وضعية', emoji: '📏' },
        darb: { label: 'ضرب عدد عشري', emoji: '✖️' },
        mana: { label: 'معنى الجمع والطرح', emoji: '🚌' },
        jadid: { label: 'سلسلة من عمليتين', emoji: '🚋' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ برحلة بالترامواي تحسب فيها ركّابًا يصعدون وينزلون.', advice: 'راجع معنى «نزل» و«صعد» في الجمع والطرح (درس معنى الجمع والطرح في السنة الأولى).', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ القطعة كلّها مجموع قطعتيها.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'العمليات الأربع على الأعداد العشرية وربطها بالوضعية متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['jam-tarh-ashari-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['jam-tarh-ashari-1am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['jam-tarh-ashari-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['jam-tarh-ashari-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-5', requires: ['darb-ashari-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-6', requires: ['mana-jam-tarh-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-7', requires: ['mana-jam-tarh-1am'] },
      ]}
    />
  );
}
