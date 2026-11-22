import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Le lien de révision du réseau pour cette leçon : `1am.m1.r04` (ranger des décimaux : items 1–2,
 * leçon `muqaranat-adad-ashriya`, publiée mais plus loin dans le manuel) et `1am.m1.r02` (1/10 = 0,1 et 2 + 4/10 = 2,4 : items 3–6).
 * JAMAIS bloquant ; littéraux (audit).
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
        body: <p><MathText>{'مقارنة أعداد عشرية، والكسر العشري $\\frac{1}{10}$ وكتابته بالفاصلة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تمدّ شريط القياس.'}</MathText></p>,
      }}
      skills={{
        muqarana: { label: 'مقارنة الأعداد العشرية', emoji: '⚖️' },
        ashar: { label: 'الأعشار والكتابة بالفاصلة', emoji: '🔟' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من شريط قياس تمدّه بيدك.', advice: 'راجع مقارنة الأعداد العشرية، ومعنى جزء من عشرة وكتابته 0,1 .', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الفرق بين 0,1 (جزء من عشرة) و 0,01 (جزء من مائة).', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأعشار ومقارنة الأعداد العشرية متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['muqarana-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['muqarana-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['dixieme-ashar-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['dixieme-ashar-1am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['dixieme-ashar-1am'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['dixieme-ashar-1am'] },
      ]}
    />
  );
}
