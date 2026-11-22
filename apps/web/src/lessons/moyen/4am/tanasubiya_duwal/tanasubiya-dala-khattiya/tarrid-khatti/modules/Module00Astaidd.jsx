import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le manuel n'a aucun item « أستعدّ » pour ce sujet (items 1–9 p. 65 → leçons
 * 1, 2 et 4) : neuf affirmations de la PLATEFORME, deux par prérequis du propriétaire — déterminer
 * une fonction linéaire (leçon 2), le graphique et la lecture graphique (leçon 3), les pourcentages
 * et la vitesse moyenne (leçon 4), les étapes du ترييض (unité 4). Diagnostic JAMAIS bloquant ; `id` et `requires`
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'تسع عبارات قبل الانطلاق', tone: 'teal',
        body: <p>لترييض وضعية بدالة خطية نحتاج إلى تعيين دالة خطية وقراءة تمثيلها البياني، وإلى النسب المئوية والسرعة المتوسطة وخطوات ترييض مشكلة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        tayin: { label: 'تعيين دالة خطية وصورة عدد', emoji: '🎛️' },
        bayan: { label: 'التمثيل البياني والقراءة البيانية', emoji: '📈' },
        nisba: { label: 'النسب المئوية والسرعة المتوسطة', emoji: '🏷️' },
        tarrid: { label: 'خطوات ترييض مشكلة', emoji: '🧩' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بمستقيم تديره بيدك.', advice: 'راجع الدرسين «مفهوم وتعيين الدالة الخطية» و«التمثيل البياني لدالة خطية».', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: صورة عدد تُقرأ على محور التراتيب.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'تعرف الدالة الخطية وتمثيلها: بقي أن تنمذج بها وضعيات وتفسّر نتائجها.', advice: 'في المستوى المتقدّم اضبط مستقيم النابض دون عقدة على الشبكة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['tayin-dala-khattiya'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['tayin-dala-khattiya'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['qiraa-bayaniya'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['qiraa-bayaniya'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['nisba-mia'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['nisba-mia'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['sura-mutawassita'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['tarrid-khutuwat'] },
        { ...prepQuestion(PREP_ITEMS[8]), id: 'prep-9', requires: ['tarrid-khutuwat'] },
      ]}
    />
  );
}
