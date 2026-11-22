import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : huit affirmations. Cinq viennent de « أستعدّ » (p. 87, items 1, 4, 5 et 6, réécrits) ; trois de la plateforme mesurent les liens « راجع » du réseau
 * (LEARNING_NET.md §4.4) : `2am.m6.r01` (التعرّف على وضعية تناسبية من جدول — leçon 2AM `wadiya-tanasubiya-jadwal`, NON publiée : « قريبًا ») et `2am.m4.r04`
 * (إحداثيا نقطة — leçon 2AM `talim-nuqta-mustawi`, NON publiée). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>جداول تناسبية، ومعامل التناسبية، وإحداثيا نقطة في معلم. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        jadwal: { label: 'جدول التناسبية', emoji: '📋' },
        nuqta: { label: 'إحداثيا نقطة', emoji: '📍' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ برفع دبابيس على لوحة، ويشرح لك بنفسه الإحداثيين.', advice: 'راجع كيف نعرف أنّ جدولًا جدول تناسبية: ناتج قسمة العددين واحد في كلّ عمود.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: الفاصلة أولًا ثم الترتيب عند كتابة إحداثيي نقطة.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الجداول والنقط متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['tanasubiya-jadwal-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-2', requires: ['tanasubiya-jadwal-2am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-3', requires: ['talim-nuqta-2am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-4', requires: ['tanasubiya-jadwal-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-5', requires: ['talim-nuqta-2am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-6', requires: ['tanasubiya-jadwal-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-7', requires: ['tanasubiya-jadwal-2am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-8', requires: ['tanasubiya-jadwal-2am'] },
      ]}
    />
  );
}
