import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : « استحضر مكتسباتي » (p. 52), items 5 (la division décimale de 2 par 3), 6 et 7 (la fraction d'une figure à parts
 * ÉGALES), et trois affirmations de la plateforme : `1am.m1.r02` (écriture décimale ↔ fraction décimale, deux énoncés) et la division
 * réciproque de la multiplication. JAMAIS bloquant ; littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="8 دقائق"
      brief={{
        tag: 'أستعدّ', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ست عبارات تسبق الدرس. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        juz: { label: 'الكسر جزء من الوحدة', emoji: '🍰' },
        ashri: { label: 'الكتابة العشرية والكسر العشري', emoji: '🔢' },
        qisma: { label: 'القسمة', emoji: '➗' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من كعكات على طاولة.', advice: 'راجع الكسر جزءًا من الوحدة (أجزاء متقايسة) والأعشار والأجزاء من المئة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'تذكّر: الأجزاء لا تُعدّ كسرًا إلّا إذا كانت متقايسة.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكسور والقسمة والكتابة العشرية متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['qisma-ashriya-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['kasr-juz-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['kasr-juz-ibtidai'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-4', requires: ['kitaba-ashriya-kasriya'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-5', requires: ['kitaba-ashriya-kasriya'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-6', requires: ['qisma-ashriya-ibtidai'] },
      ]}
    />
  );
}
