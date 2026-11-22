import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Quatre viennent de « أستعدّ » (p. 7, items 14, 11, 7 et 10, réécrits) ; trois de la
 * plateforme mesurent le lien « راجع » du réseau (`2am.m4.r05`, جمع وطرح الأعداد النسبية — jam-tarh-nisbi) et deux prérequis hors réseau
 * (`2am.m1.r03`, توزيع الضرب — tawzi-darb ; la distance à zéro — masafa-sifr). Aucune de ces leçons n'est publiée : le panneau
 * « راجع قبل أن تنطلق » les montre « قريبًا ». JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>جمع الأعداد النسبية وطرحها، وتوزيع الضرب على الجمع، والمسافة إلى الصفر. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        jam: { label: 'جمع الأعداد النسبية وطرحها', emoji: '➕' },
        tawzi: { label: 'توزيع الضرب على الجمع', emoji: '🧮' },
        masafa: { label: 'المسافة إلى الصفر', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بمصعد تحرّك تسجيله بيدك.', advice: 'راجع جمع الأعداد النسبية وطرحها ومعنى المسافة إلى الصفر.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة ناتج الجمع حين تختلف إشارتا العددين.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الجمع والطرح والتوزيع والمسافة إلى الصفر متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['jam-tarh-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['jam-tarh-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['jam-tarh-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['jam-tarh-nisbi'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-5', requires: ['jam-tarh-nisbi'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-6', requires: ['tawzi-darb'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-7', requires: ['masafa-sifr'] },
      ]}
    />
  );
}
