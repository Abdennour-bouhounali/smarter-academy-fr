import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Deux viennent de « أستعدّ » (p. 7, items 12 et 13, réécrits : la somme algébrique) ; cinq de la plateforme mesurent le
 * lien « راجع » du réseau (`3am.m1.r01`, جداء عددين نسبيين : les deux leçons publiées de l'unité) et les priorités (`2am.m1.r01`, leçon 2AM non publiée : le panneau
 * « راجع قبل أن تنطلق » la montre « قريبًا »). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>جداء الأعداد النسبية، وأولوية العمليات، وجمع الأعداد النسبية وطرحها. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        jidaa: { label: 'جداء عددين نسبيين', emoji: '✖️' },
        jidaaIda: { label: 'جداء عدة أعداد نسبية', emoji: '🔢' },
        awlawiya: { label: 'أولوية العمليات والأقواس', emoji: '🧮' },
        jam: { label: 'جمع الأعداد النسبية وطرحها', emoji: '➕' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بخزائن تفتحها بيدك.', advice: 'راجع جداء عددين نسبيين وأولوية العمليات.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة الجداء وإلى ترتيب العمليات.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الجداء والأولويات متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['majmu-jabri'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['majmu-jabri'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-3', requires: ['jidaa-nisbi'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-4', requires: ['jidaa-ida'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-5', requires: ['jidaa-nisbi'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-6', requires: ['awlawiya-amaliyat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-7', requires: ['awlawiya-amaliyat'] },
      ]}
    />
  );
}
