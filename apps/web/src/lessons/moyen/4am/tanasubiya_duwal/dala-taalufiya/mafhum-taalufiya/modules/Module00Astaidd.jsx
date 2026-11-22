import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 1 à 5 du manuel (p. 77 ; 6–7 vont à la leçon tamthil-bayani-taalufi) et
 * une affirmation de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : remplacer x par un
 * nombre (1), image et antécédent par une fonction linéaire (2, 3, 5 — la leçon dala-khattiya),
 * reconnaître une fonction linéaire (4), résoudre ax + b = c (6 — la leçon muadala-ula, le geste de
 * l'antécédent). Items 3 et 4 FAUX par construction. Diagnostic JAMAIS bloquant ; `id` et `requires`
 * restent littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="5 دقائق"
      brief={{
        tag: 'أستعدّ — الكتاب ص 77', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>خمس عبارات من الكتاب عن تعويض x بعدد والدالة الخطية، وعبارة من المنصّة عن حل معادلة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        taawid: { label: 'تعويض x بعدد في عبارة', emoji: '🔢' },
        khattiya: { label: 'صورة عدد والعدد الذي صورته بدالة خطية', emoji: '🎛️' },
        mafhum: { label: 'تمييز الدالة الخطية', emoji: '🔍' },
        hal: { label: 'حل معادلة من الشكل ax + b = c', emoji: '⚖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بعدّاد يحسب أمامك كل أجرة.', advice: 'راجع درس الدالة الخطية (الصورة والعدد الذي صورته)، وتدرّب على حل معادلات من الشكل ax + b = c.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: لحل ax + b = c نطرح b أولا ثم نقسم على a.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التعويض والدالة الخطية وحل المعادلة متحكَّم فيها.', advice: 'في المستوى المتقدّم ابحث وحدك عن عدد الساعات الذي يعطي أجرة معلومة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['taawid-qima'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['sura-khattiya'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['sura-khattiya'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['mafhum-khattiya'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['sura-khattiya'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['hal-muadala-ula'] },
      ]}
    />
  );
}
