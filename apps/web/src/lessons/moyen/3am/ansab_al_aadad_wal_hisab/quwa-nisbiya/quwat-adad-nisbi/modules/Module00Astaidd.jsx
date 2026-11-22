import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Deux viennent de « أستعدّ » (p. 39, items 16 et 17, réécrits) ; cinq de la plateforme
 * mesurent les liens « راجع » du réseau (LEARNING_NET.md §4.4) : `3am.m1.r01` (جداء عددين نسبيين — jidaa-nisbi), `2am.m1.r01`
 * (سلسلة عمليات — id de connaissance `silsila-amaliyat`, leçon 2AM `silsila-bidun-aqwas`), `3am.m3.r02` (قواعد قوى العدد 10 —
 * qawaid-quwa-ashara). Le panneau « راجع قبل أن تنطلق » montre les leçons non publiées « قريبًا » et, depuis le 2026-10-29, la leçon
 * 2AM `silsila-bidun-aqwas` (publiée) avec son lien. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>جداء أعداد نسبية، سلسلة عمليات، وقوى العدد 10. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        jidaa: { label: 'جداء أعداد نسبية', emoji: '✖️' },
        silsila: { label: 'سلسلة عمليات', emoji: '🔢' },
        ashara: { label: 'قوى العدد 10', emoji: '🔟' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بقطار تضيف إليه العربات بيدك.', advice: 'راجع قاعدة الإشارات في جداء الأعداد النسبية وأولوية العمليات.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة جداء عددين سالبين.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الجداء والأولويات وقوى العدد 10 متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['jidaa-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['jidaa-nisbi'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-3', requires: ['jidaa-nisbi'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-4', requires: ['silsila-amaliyat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-5', requires: ['silsila-amaliyat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-6', requires: ['qawaid-quwa-ashara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-7', requires: ['qawaid-quwa-ashara'] },
      ]}
    />
  );
}
