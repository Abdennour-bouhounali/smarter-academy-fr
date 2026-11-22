import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 1 à 3 du manuel (p. 65 ; 4–5 sont à la leçon tanasub-muamil, 6–9 à
 * tatbiqat-tanasub) et deux affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر
 * إجابتك » : remplacer x par un nombre (1), résoudre une équation du premier degré (2, 3 — le geste de
 * la طريقة am = n), le coefficient de proportionnalité et y = a × x (4, 5 — la leçon 1). Diagnostic
 * JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
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
        tag: 'أستعدّ — الكتاب ص 65', title: 'خمس عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ثلاث عبارات من الكتاب عن تعويض x بعدد وحل معادلة، وعبارتان من المنصّة عن معامل التناسبية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        taawid: { label: 'تعويض x بعدد في عبارة', emoji: '🔢' },
        hal: { label: 'حل معادلة من الدرجة الأولى بمجهول واحد', emoji: '⚖️' },
        tanasub: { label: 'معامل التناسبية و y = a × x', emoji: '📊' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بآلة تحسب أمامك كل صورة.', advice: 'راجع درس التناسبية ومعامل التناسبية، وتدرّب على حل معادلات من الشكل ax = b.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: في جدول تناسبية نضرب في المعامل، ولا نجمعه.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التعويض وحل المعادلة ومعامل التناسبية متحكَّم فيها.', advice: 'في المستوى المتقدّم ميّز وحدك الآلات الثلاث.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['taawid-qima'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['hal-muadala-ula'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['hal-muadala-ula'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['muamil-tanasub'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['muamil-tanasub'] },
      ]}
    />
  );
}
