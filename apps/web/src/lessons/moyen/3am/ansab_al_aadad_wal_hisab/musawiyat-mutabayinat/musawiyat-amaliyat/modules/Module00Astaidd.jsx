import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Quatre viennent de « أستعدّ » (p. 71, items 1, 3, 4 et 9, réécrits) ; trois de la plateforme
 * mesurent les liens « راجع » du réseau (LEARNING_NET.md §4.4) : `2am.m4.r09` (اختبار صحة مساواة بقيمة معلومة — ikhtibar-musawat) et `3am.m1.r01`
 * (جداء عددين نسبيين — jidaa-nisbi). Aucune de ces leçons n'est publiée : le panneau « راجع قبل أن تنطلق » les montre « قريبًا ».
 * JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>عدد مجهول في مساواة، اختبار حلّ بالتعويض، وجداء أعداد نسبية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        majhul: { label: 'العدد المجهول', emoji: '❓' },
        qima: { label: 'قيمة عبارة', emoji: '🔢' },
        ikhtibar: { label: 'اختبار حلّ مساواة', emoji: '✅' },
        jidaa: { label: 'جداء أعداد نسبية', emoji: '✖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بمتسابقين تحرّكهما بيدك.', advice: 'راجع اختبار حلّ مساواة بالتعويض وقاعدة الإشارات في الجداء.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه عند التعويض إلى إشارة العدد.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التعويض والجداء متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['ikhtibar-musawat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['ikhtibar-musawat'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-3', requires: ['ikhtibar-musawat'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-4', requires: ['ikhtibar-musawat'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-5', requires: ['jidaa-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-6', requires: ['ikhtibar-musawat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-7', requires: ['jidaa-nisbi'] },
      ]}
    />
  );
}
