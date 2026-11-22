import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la PLATEFORME qui mesurent les liens « راجع » du réseau (LEARNING_NET.md §4.4) : `1am.m5.r08` (تطبيق قاعدة حرفية — leçon 1AM `tatbiq-qaida-harfiya` PUBLIÉE : texte seul, jamais reconstruite ici ; items 1 et 2)
 * et `2am.m4.r06` (حساب مجموع جبري — leçon publiée `majmu-jabri` : items 3 et 4) ; l'item 5 compare deux décimaux et l'item 6 deux relatifs. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        tag: 'أستعدّ', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>قيمة عبارة حرفية، والمجموع الجبري، ومقارنة الأعداد. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        qima: { label: 'قيمة عبارة حرفية', emoji: '🔤' },
        jabri: { label: 'المجموع الجبري', emoji: '➕' },
        ushri: { label: 'مقارنة الأعداد العشرية', emoji: '⚖️' },
        nisbi: { label: 'مقارنة الأعداد النسبية', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بشاحنة تحمّلها بيدك وميزان يحسب لك الطرفين.', advice: 'راجع حساب قيمة عبارة حرفية والمجموع الجبري.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى ترتيب العمليات حين تعوّض الحرف بقيمته.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التعويض والحساب والمقارنة متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['qimat-ibara-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['qimat-ibara-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['majmu-jabri-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['majmu-jabri-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['muqarana-ushriya'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['muqarana-nisbiya-2am'] },
      ]}
    />
  );
}
