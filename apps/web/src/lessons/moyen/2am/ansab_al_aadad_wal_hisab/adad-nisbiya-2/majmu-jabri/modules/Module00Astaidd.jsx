import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la PLATEFORME qui mesurent les liens « راجع » du réseau (LEARNING_NET.md §4.4) : `2am.m4.r05` (جمع وطرح عددين نسبيين — leçon publiée `jam-tarh-nisbiya`, jamais
 * reconstruite ici : items 1, 2, 3 et 6) et `2am.m1.r02` (الأقواس — leçon publiée `silsila-bi-aqwas` : items 4 et 5). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>جمع وطرح عددين نسبيين والأقواس. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        same: { label: 'جمع عددين من الإشارة نفسها', emoji: '➕' },
        sub: { label: 'طرح عدد نسبي', emoji: '➖' },
        opp: { label: 'العددان المتعاكسان', emoji: '🔄' },
        brk: { label: 'الأقواس أوّلًا', emoji: '🔢' },
        nest: { label: 'الأقواس المتداخلة', emoji: '🧮' },
        conv: { label: 'الطرح جمعٌ للمعاكس', emoji: '🔁' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بحبل وفريقين تنظّمهما بيدك.', advice: 'راجع جمع وطرح عددين نسبيين والأقواس.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى طرح العدد السالب وإلى ما بين الأقواس.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الجمع والطرح والأقواس متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['jam-nafs-ishara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['tarh-bi-muakis'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['mutaakisan-sifr'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['aqwas-awwalan'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['aqwas-mutadakhila'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['tarh-bi-muakis'] },
      ]}
    />
  );
}
