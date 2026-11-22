import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : « استحضر مكتسباتي » (p. 8), items 1, 2, 3, 4 et 6 (les rangs et la lecture / écriture d'un nombre,
 * acquis du primaire), et une affirmation de la plateforme (lire un nombre à zéro intercalé). Le réseau n'a aucun lien de
 * révision vers l'item 1am.m1.r02 : c'est le premier درس de 1AM. JAMAIS bloquant ; littéraux (audit).
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
        tag: 'استحضر مكتسباتي — الكتاب ص 8', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ما تعلّمته في الابتدائي عن المراتب وقراءة الأعداد. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        maratib: { label: 'المراتب', emoji: '🔢' },
        kitaba: { label: 'قراءة الأعداد وكتابتها', emoji: '✍️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من أقلام نربطها حزمًا.', advice: 'راجع أسماء المراتب: الآحاد، العشرات، المئات، الآلاف.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه للفرق بين رقم العشرات وعدد العشرات.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'المراتب وقراءة الأعداد متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم (أعداد الكتاب) مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['maratib-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['maratib-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['kitabat-adad-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['kitabat-adad-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['maratib-ibtidai'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-6', requires: ['kitabat-adad-ibtidai'] },
      ]}
    />
  );
}
