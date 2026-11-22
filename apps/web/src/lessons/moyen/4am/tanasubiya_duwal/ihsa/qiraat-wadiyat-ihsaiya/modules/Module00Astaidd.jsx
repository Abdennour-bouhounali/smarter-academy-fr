import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le manuel n'a aucun item « أستعدّ » pour ce درس (ses quatre items vont aux leçons
 * 1–3) : six affirmations de la PLATEFORME, une par acquis des leçons 1 et 2 — moyenne, moyenne par les
 * effectifs, médiane, étendue, تواتر, lecture d'un مخطط بالأعمدة. Diagnostic JAMAIS bloquant ; `id` et
 * `requires` restent littéraux (audit).
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>لقراءة وضعيات إحصائية وتفسيرها نحتاج إلى مؤشرات الدرسين السابقين: المتوسط (بالتكرارات أيضا)، الوسيط، المدى، التواتر، وقراءة مخطط بالأعمدة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        mutawassit: { label: 'متوسط سلسلة', emoji: '➗' },
        mutawazin: { label: 'المتوسط بالتكرارات', emoji: '⚖️' },
        wasit: { label: 'الوسيط', emoji: '↕️' },
        mada: { label: 'المدى', emoji: '↔️' },
        tawatur: { label: 'التواتر', emoji: '🥧' },
        qiraa: { label: 'قراءة مخطط بالأعمدة', emoji: '📊' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بخزانات ماء تجرّبها بيدك.', advice: 'راجع درس «مدى ووسيط ومتوسط سلسلة إحصائية».', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: نرتّب القيم قبل قراءة الوسيط، ونضرب في التكرارات قبل القسمة.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'تعرف المؤشرات: بقي أن تقرأ بها وضعيات حقيقية وتقرّر.', advice: 'في المستوى المتقدّم راهن على معدّل القسمين بدقّة عُشر.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['mutawassit-silsila'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['mutawassit-mutawazin'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['wasit-silsila'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['mada-silsila'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['tawatur'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['qiraat-mukhattat-aamida'] },
      ]}
    />
  );
}
