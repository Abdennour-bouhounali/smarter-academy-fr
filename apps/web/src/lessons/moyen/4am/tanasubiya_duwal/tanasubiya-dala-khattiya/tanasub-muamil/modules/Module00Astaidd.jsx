import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 4 et 5 du manuel (p. 65 ; 1–3 et 6–9 vont aux leçons dala-khattiya et
 * tatbiqat-tanasub) et cinq affirmations de la plateforme dans la même forme « أصحيح أم خاطئ؟ برّر
 * إجابتك » (« عبارة إضافية من المنصّة »). Quatre acquis : multiplier / diviser des relatifs (nisbiya),
 * les fractions (kusur), la proportionnalité des années précédentes — tableau et quatrième
 * proportionnel (rabi), le pourcentage (nisba). Jamais bloquant ; `id` et `requires` littéraux.
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
        tag: 'أستعدّ — الكتاب ص 65', title: 'سبع عبارات قبل الانطلاق', tone: 'teal',
        body: <p>عبارتان من الكتاب وخمس من المنصّة عن ضرب وقسمة الأعداد النسبية، والكسور، وجدول التناسبية، والنسبة المئوية — كلها مما تعلّمته في السنوات السابقة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        nisbiya: { label: 'ضرب وقسمة الأعداد النسبية', emoji: '±' },
        kusur: { label: 'الحساب على الكسور', emoji: '➗' },
        rabi: { label: 'جدول التناسبية والرابع المتناسب', emoji: '📊' },
        nisba: { label: 'النسبة المئوية', emoji: '%' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ برحلات تروتينة تسجّلها بنفسك، وكل حاصل قسمة يُحسب أمامك.', advice: 'راجع قاعدة إشارة الجداء وحاصل القسمة، والضرب في كسر.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: في جدول تناسبية نضرب في العدد نفسه، ولا نضيف عددا.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأعداد النسبية والكسور والتناسبية متحكَّم فيها.', advice: 'في المستوى المتقدّم قرّر وحدك أيّ صيغتي الكراء تناسبية.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['tanasub-sabiq'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['nisba-miawiya'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['darb-qisma-nisbiya'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['darb-qisma-nisbiya'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['amaliyat-kusur'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['amaliyat-kusur'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['tanasub-sabiq'] },
      ]}
    />
  );
}
