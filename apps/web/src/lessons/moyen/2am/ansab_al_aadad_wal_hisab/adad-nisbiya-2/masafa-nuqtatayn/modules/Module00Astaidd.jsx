import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la PLATEFORME qui mesurent les liens « راجع » du réseau (LEARNING_NET.md §4.4) : la soustraction de deux relatifs (`2am.m4.r05`, publiée — items 1, 2 et 6),
 * la comparaison (`muqarana-nisbiya`, item 3), la graduation d'une droite (`2am.m4.r01`, item 4) et la distance à zéro (item 5). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>طرح الأعداد النسبية، مقارنتها، التدريجة على مستقيم، والمسافة إلى الصفر. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        sub: { label: 'طرح عددين نسبيين', emoji: '➖' },
        cmp: { label: 'مقارنة عددين نسبيين', emoji: '⚖️' },
        grad: { label: 'التدريجة على مستقيم', emoji: '📏' },
        zero: { label: 'المسافة إلى الصفر', emoji: '🎯' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: المسماك سيريك المسافة بيدك.', advice: 'راجع طرح الأعداد النسبية والمسافة إلى الصفر.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى طرح عدد سالب وإلى مقارنة السالبين.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الطرح والمقارنة والمسافة إلى الصفر متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['tarh-bi-muakis'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['tarh-bi-muakis'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['muqarana-nisbiya-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['faasila-nuqta'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['masafa-ila-sifr'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['tarh-bi-muakis'] },
      ]}
    />
  );
}
