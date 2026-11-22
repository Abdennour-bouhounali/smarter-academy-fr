import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 1 et 2 du manuel (p. 163 ; les items 3–8 sont aux دروس « مساحة الكرة وحجم الجلة » et « التكبير
 * والتصغير ») et quatre affirmations de la plateforme sur les prérequis du propriétaire, dans la forme « أصحيح أم خاطئ؟ برّر
 * إجابتك » : le périmètre du cercle (1), l'aire du disque (2), le diamètre (p1), cercle ou disque (p2), la perspective (p3),
 * Pythagore (p4). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux.
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
        tag: 'أستعدّ — الكتاب ص 163', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>عبارتان من الكتاب وأربع من المنصّة عن الدائرة والقرص، والتمثيل بالمنظور، وخاصية فيثاغورس. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن ننتقل من المستوي إلى الفضاء.</p>,
      }}
      skills={{
        muhit: { label: 'محيط الدائرة', emoji: '⭕' },
        misaha: { label: 'مساحة القرص', emoji: '🟠' },
        qutr: { label: 'قطر الدائرة', emoji: '📏' },
        qurs: { label: 'الدائرة والقرص', emoji: '🎯' },
        manzur: { label: 'التمثيل بالمنظور', emoji: '🧊' },
        fithaghuras: { label: 'خاصية فيثاغورس', emoji: '📐' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بكرة حقيقية تديرها بإصبعك.', advice: 'راجع: نقط الدائرة تبعد عن مركزها بنصف القطر تماما، ونقط القرص بمسافة أصغر من أو تساوي نصف القطر.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: في المثلث القائم مربع الوتر يساوي مجموع مربعي الضلعين الآخرين، لا نجمع الأطوال.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الدائرة والقرص والتمثيل وخاصية فيثاغورس متحكَّم فيها.', advice: 'في المستوى المتقدّم ستضع النقط في الفضاء دون أن يُكتب لك بعدها عن المركز.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['muhit-daira'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['misahat-qurs'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-p1', requires: ['qutr-daira'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-p2', requires: ['daira-qurs'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p3', requires: ['manzur'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p4', requires: ['fithaghuras'] },
      ]}
    />
  );
}
