import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Aucun item du « أستعدّ » du manuel n'est destiné à cette leçon (1–5 → L1, 6–7 → L2) :
 * huit affirmations de la plateforme dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » (« عبارة إضافية من
 * المنصّة »), les deux valeurs de vérité présentes. Quatre acquis : l'image par une fonction affine (sura),
 * l'équation ax + b = m (muadala), la جملة معادلتين (jumla), le calcul d'un quotient de différences sur les
 * relatifs et les décimaux (hisab). Jamais bloquant ; `id` et `requires` littéraux.
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'ثماني عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ثماني عبارات عن صورة عدد بدالة تآلفية، وحلّ معادلة من الدرجة الأولى، وجملة معادلتين، وحاصل قسمة فرقين — كلها مما تعلّمته من قبل. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        sura: { label: 'صورة عدد بدالة تآلفية', emoji: '🎯' },
        muadala: { label: 'حلّ معادلة من الدرجة الأولى', emoji: '⚖️' },
        jumla: { label: 'حلّ جملة معادلتين', emoji: '🧩' },
        hisab: { label: 'حاصل قسمة فرقين', emoji: '➗' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: في الدرس سلّم تحرّك درجاته بيدك، وكل حاصل قسمة يُكتب أمامك.', advice: 'راجع حساب صورة عدد بدالة تآلفية: نضرب في a ثم نضيف b ، وقاعدة إشارة الجداء وحاصل القسمة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه للإشارات: حاصل قسمة عددين سالبين موجب.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الصور والمعادلات والجمل وحواصل القسمة متحكَّم فيها.', advice: 'في المستوى المتقدّم أكمل سلّم الكتاب بستّ درجاته.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['notation-fx'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['surat-adad-taalufiya'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['muadala-ax-b'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['muadala-ax-b'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['hall-jumla'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['hall-jumla'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['hisab-farq-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['hisab-farq-nisbi'] },
      ]}
    />
  );
}
