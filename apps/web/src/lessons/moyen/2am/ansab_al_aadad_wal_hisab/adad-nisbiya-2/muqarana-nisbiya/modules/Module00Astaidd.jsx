import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Trois viennent de « أستعدّ » (p. 39, items 5, 6 et 7, réécrits) ; trois de la plateforme
 * mesurent le lien « راجع » du réseau (LEARNING_NET.md §4.4) : `2am.m4.r01` (قراءة فاصلة نقطة أو وضعها على مستقيم مدرّج — leçon non
 * publiée, jamais reconstruite ici) : l'abscisse, la distance à zéro, l'opposé. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>المسافة إلى الصفر، فاصلة نقطة على مستقيم مدرّج، والعددان المتعاكسان. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        masafa: { label: 'المسافة إلى الصفر', emoji: '📏' },
        faasila: { label: 'فاصلة نقطة', emoji: '📍' },
        mutaakis: { label: 'العددان المتعاكسان', emoji: '🔄' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بسلك تطيله بيدك.', advice: 'راجع معنى العدد النسبي وفاصلة نقطة والمسافة إلى الصفر.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ المسافة إلى الصفر لا تكون سالبة.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الفاصلة والمسافة والمعاكس متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['masafa-ila-sifr'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['faasila-nuqta'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['masafa-ila-sifr'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-4', requires: ['adad-mutaakis'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-5', requires: ['faasila-nuqta'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-6', requires: ['adad-mutaakis'] },
      ]}
    />
  );
}
