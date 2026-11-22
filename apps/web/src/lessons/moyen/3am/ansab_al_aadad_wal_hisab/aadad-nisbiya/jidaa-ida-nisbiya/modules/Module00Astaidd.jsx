import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Deux viennent de « أستعدّ » (p. 7, items 6 et 9, réécrits) ; cinq de la plateforme mesurent le
 * lien « راجع » du réseau (`2am.m4.r05`, جمع وطرح الأعداد النسبية — jam-tarh-nisbi), le produit de deux relatifs (la leçon précédente de l'unité,
 * publiée — jidaa-adadayn), le معاكس d'un nombre (`2am.m4.r01` — maakus-adad) et la parité d'un entier (zawjiya). Les leçons 2AM ne sont pas
 * publiées : le panneau « راجع قبل أن تنطلق » les montre « قريبًا ». JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>جداء عددين نسبيين، ومعاكس عدد، والأعداد الفردية والزوجية، وجمع الأعداد النسبية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        jidaa: { label: 'جداء عددين نسبيين', emoji: '✖️' },
        maakus: { label: 'معاكس عدد والتناظر', emoji: '🪞' },
        tartib: { label: 'ترتيب الأعداد النسبية', emoji: '📏' },
        zawji: { label: 'الأعداد الزوجية والفردية', emoji: '🔢' },
        jam: { label: 'جمع الأعداد النسبية', emoji: '➕' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بروبوت تبرمجه بيدك.', advice: 'راجع جداء عددين نسبيين ومعنى معاكس العدد.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة جداء عددين مختلفي الإشارة.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الجداء والمعاكس والأعداد الفردية متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['maakus-adad'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['maakus-adad'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-3', requires: ['jidaa-adadayn'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-4', requires: ['jidaa-adadayn'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-5', requires: ['maakus-adad'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-6', requires: ['zawjiya'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-7', requires: ['jam-tarh-nisbi'] },
      ]}
    />
  );
}
