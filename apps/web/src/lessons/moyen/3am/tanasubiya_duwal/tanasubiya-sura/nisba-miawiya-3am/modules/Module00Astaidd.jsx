import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Trois viennent de « أستعدّ » (p. 87, items 7, 8 et 9, réécrits) ; quatre de la plateforme mesurent le lien « راجع »
 * du réseau (LEARNING_NET.md §4.4) : `2am.m6.r04` (حساب نسبة مئوية وتوظيفها — leçon 2AM `nisba-miawiya`, NON publiée : « قريبًا »). JAMAIS bloquant ;
 * `id` et `requires` littéraux.
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
        body: <p>نسبة مئوية من عدد، ونسبة جزء من كلّ، وعدد مجهول في قسمة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        hisab: { label: 'نسبة مئوية من عدد', emoji: '💯' },
        nisba: { label: 'نسبة جزء من كلّ', emoji: '🧮' },
        qisma: { label: 'عدد مجهول في قسمة', emoji: '➗' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بصينية مقسومة إلى مئة خانة ترسمها بيدك.', advice: 'راجع أنّ $25\\%$ تعني $25$ من كلّ $100$ ، وكيف نحسب نسبة جزء من كلّ.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ النسبة المئوية تُحسب من الكلّ لا من الجزء.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'النسبة المئوية متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['nisba-miawiya-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['nisba-miawiya-2am'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-3', requires: ['nisba-miawiya-2am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-4', requires: ['nisba-miawiya-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-5', requires: ['nisba-miawiya-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-6', requires: ['nisba-miawiya-2am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-7', requires: ['nisba-miawiya-2am'] },
      ]}
    />
  );
}
