import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la PLATEFORME qui mesurent les liens « راجع » du réseau (LEARNING_NET.md §4.4) : `2am.m4.r01` (distance à zéro, opposé, droite graduée — leçon
 * publiée, jamais reconstruite ici), la comparaison de `muqarana-nisbiya` et les décimaux de 1AM. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>المسافة إلى الصفر والعددان المتعاكسان وجمع العشريات. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        masafa: { label: 'المسافة إلى الصفر', emoji: '📏' },
        mutaakis: { label: 'العددان المتعاكسان', emoji: '🔄' },
        compare: { label: 'مقارنة الأعداد النسبية', emoji: '⚖️' },
        ashri: { label: 'جمع وطرح العشريات', emoji: '🔢' },
        siyaq: { label: 'التغيّر في الحياة', emoji: '🌡️' },
        line: { label: 'المستقيم المدرّج', emoji: '📍' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بمنطاد تحمّله بيدك.', advice: 'راجع المسافة إلى الصفر ومعاكس العدد.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أيّ عددين أبعد عن الصفر.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'المسافة والمعاكس والعشريات متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['masafa-ila-sifr'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['adad-mutaakis'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['muqarana-nisbiya-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['jam-tarh-ashri'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['jam-tarh-ashri'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['faasila-nuqta'] },
      ]}
    />
  );
}
