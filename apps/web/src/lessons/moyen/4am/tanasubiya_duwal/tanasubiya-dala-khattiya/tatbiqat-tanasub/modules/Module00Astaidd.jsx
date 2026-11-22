import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 6 à 9 du manuel (p. 65 : prendre 2 % de 150 DA, augmenter de 8 %,
 * diminuer de 15 %, une vitesse moyenne), puis quatre affirmations de la plateforme dans la même
 * forme pour les autres acquis supposés : l'image d'un nombre par une fonction linéaire et la
 * forme x ⟼ ax (leçon dala-khattiya), les conversions d'unités (heures et secondes, m³ et litres).
 * Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
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
        tag: 'أستعدّ — الكتاب ص 65', title: 'ثماني عبارات قبل الانطلاق', tone: 'teal',
        body: <p>أربع عبارات من الكتاب عن النسب المئوية والسرعة المتوسطة، وأربع من المنصّة عن صورة عدد بدالة خطية وتحويل الوحدات. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        nisba: { label: 'أخذ نسبة مئوية من مقدار', emoji: '％' },
        ziyada: { label: 'حساب زيادة أو تخفيض بنسبة مئوية', emoji: '🏷️' },
        sura: { label: 'السرعة المتوسطة', emoji: '🚲' },
        dala: { label: 'صورة عدد بدالة خطية', emoji: '📈' },
        wahda: { label: 'تحويل الوحدات', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ ببطاقة سعر تمدّدها بيدك.', advice: 'راجع حساب نسبة مئوية من مقدار (نضرب في t ثم نقسم على 100)، ودرس الدالة الخطية.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الوحدات: الساعة 3600 ثانية، والمتر المكعب 1000 لتر.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'النسب المئوية والسرعة المتوسطة والدالة الخطية والوحدات متحكَّم فيها.', advice: 'في المستوى المتقدّم راهن على التغيّر الكلي للخزان قبل أن تبني التغيّرين.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['akhdh-nisba-miawiya'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['hisab-ziyada-takhfid'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['hisab-ziyada-takhfid'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['sura-mutawassita'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['sura-dala-khattiya'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['sura-dala-khattiya'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['tahwil-wahdat'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['tahwil-wahdat'] },
      ]}
    />
  );
}
