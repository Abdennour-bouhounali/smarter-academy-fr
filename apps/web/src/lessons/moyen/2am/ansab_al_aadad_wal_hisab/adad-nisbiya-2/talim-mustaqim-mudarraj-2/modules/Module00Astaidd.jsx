import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Quatre viennent de « أستعدّ » (p. 39, items 1 à 4, réécrits) ; deux de la plateforme mesurent les
 * liens « راجع » du réseau (LEARNING_NET.md §4.4) : `1am.m5.r06` (lire / placer une abscisse — leçon 1AM non publiée, jamais reconstruite ici) et
 * `1am.m5.r04` (graduation décimale). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>العدد السالب، فاصلة نقطة على مستقيم مدرّج، والعددان المتعاكسان. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        siyaq: { label: 'الأعداد السالبة في الحياة', emoji: '🌡️' },
        faasila: { label: 'فاصلة نقطة', emoji: '📍' },
        mutaakis: { label: 'العددان المتعاكسان', emoji: '🔄' },
        nisf: { label: 'التدريجة العشرية', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بدبّوس تحرّكه بيدك.', advice: 'راجع معنى العدد النسبي وفاصلة نقطة على مستقيم مدرّج.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة الفاصلة وإلى معاكس العدد.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الفاصلة والمعاكس والتدريجة العشرية متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['adad-nisbiya-siyaq-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-2', requires: ['faasila-nuqta'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-3', requires: ['adad-mutaakis'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-4', requires: ['adad-mutaakis'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-5', requires: ['nisf-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-6', requires: ['adad-nisbiya-siyaq-1am'] },
      ]}
    />
  );
}
