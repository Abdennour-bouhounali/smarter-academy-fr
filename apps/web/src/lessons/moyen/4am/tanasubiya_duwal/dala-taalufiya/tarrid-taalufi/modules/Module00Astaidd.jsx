import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le manuel n'a aucun item « أستعدّ » pour ce sujet (ses items vont aux leçons 1 et
 * 2) : huit affirmations de la PLATEFORME, deux par prérequis du propriétaire — résoudre une équation et
 * une inéquation du premier degré (unité 4), image et antécédent par une fonction affine (leçon 1), lire
 * le graphique d'une fonction affine (leçon 2). Diagnostic JAMAIS bloquant ; `id` et `requires` restent
 * littéraux (audit).
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'ثماني عبارات قبل الانطلاق', tone: 'teal',
        body: <p>للمفاضلة بين صيغتين بالدالة التآلفية نحتاج إلى حل معادلة ومتراجحة من الدرجة الأولى، وإلى حساب صورة عدد والعدد الذي صورته معلومة، وإلى قراءة تمثيل بياني. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        muadala: { label: 'حل معادلة من الدرجة الأولى', emoji: '⚖️' },
        mutarajiha: { label: 'حل متراجحة من الدرجة الأولى', emoji: '↔️' },
        sura: { label: 'صورة عدد والعدد الذي صورته معلومة', emoji: '🎛️' },
        bayan: { label: 'قراءة التمثيل البياني لدالة تآلفية', emoji: '📈' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بفاتورة تبنيها بيدك.', advice: 'راجع درسَي «حل معادلة من الدرجة الأولى» و«مفهوم وتعيين دالة تآلفية».', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: عند القسمة على عدد سالب يتغيّر اتجاه المتراجحة.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'تحلّ المعادلات والمتراجحات وتعرف الدالة التآلفية: بقي أن تنمذج بها وتقارن.', advice: 'في المستوى المتقدّم قارن ثلاث صيغ معًا.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['hall-muadala'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['hall-muadala'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['hall-mutarajiha'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['hall-mutarajiha'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['sura-taalufiya'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['sura-taalufiya'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['qiraa-bayaniya-taalufiya'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['notation-fx'] },
      ]}
    />
  );
}
