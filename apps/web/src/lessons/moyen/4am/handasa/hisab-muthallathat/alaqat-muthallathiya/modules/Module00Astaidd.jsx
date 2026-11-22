import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le manuel n'a aucun item « أستعدّ » pour cette leçon (les items 1–6 vont aux درسين 1 et 2) :
 * six affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك », une par acquis déclaré
 * (`priorKnowledge`, les « المكتسبات القبلية » du propriétaire : النسب المثلثية وخاصية فيثاغورس، الحساب على الكسور
 * والجذور). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
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
        tag: 'أستعدّ', title: 'ست عبارات قبل العلاقات', tone: 'teal',
        body: <p>عبارات من المنصّة عن خاصية فيثاغورس، ومربعات الكسور والجذور، وتعريف النسب المثلثية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        fithaghuris: { label: 'خاصية فيثاغورس', emoji: '📐' },
        murabba: { label: 'مربع كسر', emoji: '²' },
        jadhr: { label: 'مربع جذر', emoji: '√' },
        tabsit: { label: 'جذر كسر', emoji: '➗' },
        taarif: { label: 'تعريف النسب المثلثية', emoji: '📏' },
        hasr: { label: 'حدود الجيب وجيب التمام', emoji: '🎚️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بمثلث تبنيه بيدك.', advice: 'راجع خاصية فيثاغورس وتعريف الجيب وجيب التمام والظل (الدرس 1)، وكيف نربّع كسرًا.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: مربع كسر هو مربع البسط على مربع المقام، والجذر لا يختفي من البسط.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'خاصية فيثاغورس والنسب المثلثية متحكَّم فيهما.', advice: 'في المستوى المتقدّم قرّر بنفسك أيّ العددين وتر.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['fithaghuris'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['murabba-kasr'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['murabba-jadhr'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['tabsit-jadhr'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['taarif-nisab'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['hasr-nisab'] },
      ]}
    />
  );
}
