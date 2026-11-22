import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : huit affirmations. Deux viennent de « أستعدّ » (p. 71, items 6 et 10, réécrits) ; six de la plateforme mesurent les liens
 * « راجع » du réseau (LEARNING_NET.md §4.4) : `2am.m4.r08` (a ÷ … = b — hall-qisma), `3am.m5.r01` (تبسيط عبارة جبرية — tabsit-ibara) et `3am.m5.r05`
 * (خواص المساويات — khawass-musawiyat, leçon PUBLIÉE). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        tag: 'أستعدّ', title: 'ثماني عبارات قبل الانطلاق', tone: 'teal',
        body: <p>العدد المجهول في قسمة، تبسيط عبارة، وخواص المساويات. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        qisma: { label: 'العدد المجهول في قسمة', emoji: '➗' },
        ibara: { label: 'تبسيط عبارة', emoji: '🔢' },
        khassa: { label: 'خواص المساويات', emoji: '⚖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بعبّارة تنقل فيها الصناديق بيدك.', advice: 'راجع تبسيط العبارات وأنّ العملية تُجرى على الطرفين.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة الحدود عند الجمع والطرح.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التبسيط وخواص المساويات متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['hall-qisma'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['hall-qisma'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-3', requires: ['hall-qisma'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-4', requires: ['tabsit-ibara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-5', requires: ['tabsit-ibara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-6', requires: ['tabsit-ibara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-7', requires: ['khawass-musawiyat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-8', requires: ['khawass-musawiyat'] },
      ]}
    />
  );
}
