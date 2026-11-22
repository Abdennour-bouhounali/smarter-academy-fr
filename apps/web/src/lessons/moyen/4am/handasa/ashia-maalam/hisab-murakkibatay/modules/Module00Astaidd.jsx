import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 3, 4 et 6 du manuel (p. 139 : le متوازي أضلاع et l'égalité de deux vecteurs, la
 * translation — الوحدة 11) et trois affirmations de la plateforme sur les acquis déclarés du catalogue : lire les
 * composantes (un pas vers le bas est NÉGATIF) et soustraire des relatifs (deux affirmations, une vraie, une fausse).
 * Forme « أصحيح أم خاطئ؟ برّر إجابتك ». Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux.
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
        tag: 'أستعدّ — الكتاب ص 139', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ثلاث عبارات من الكتاب عن متوازي الأضلاع وتساوي شعاعين، وثلاث من المنصّة عن قراءة مركبتي شعاع وطرح الأعداد النسبية — الحساب الذي سيفتح بوابات الدرس. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        mutawazi: { label: 'متوازي الأضلاع وتساوي شعاعين', emoji: '▱' },
        insihab: { label: 'الانسحاب', emoji: '➡️' },
        qiraa: { label: 'قراءة مركبتي شعاع', emoji: '🧭' },
        tarh: { label: 'طرح الأعداد النسبية', emoji: '➖' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ ببوابات تكتب رموزها بيدك وترى البطل يقفز.', advice: 'راجع: نحو اليسار أو نحو الأسفل تكون المركبة سالبة، وطرح عدد سالب يعني جمع معاكسه.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الإشارات عند الطرح: طرح عدد سالب يعني جمع معاكسه، ونحو الأسفل تكون المركبة سالبة.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'قراءة المركبتين وطرح الأعداد النسبية ومتوازي الأضلاع متحكَّم فيها.', advice: 'في المستوى المتقدّم احسب رمز كل بوابة قبل القفزة، دون عدّ.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-3', requires: ['mutawazi-tasawi'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-4', requires: ['insihab-mutawazi'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-6', requires: ['mutawazi-tasawi'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-p1', requires: ['qiraat-murakkibatayn'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p2', requires: ['tarh-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p3', requires: ['tarh-nisbi'] },
      ]}
    />
  );
}
