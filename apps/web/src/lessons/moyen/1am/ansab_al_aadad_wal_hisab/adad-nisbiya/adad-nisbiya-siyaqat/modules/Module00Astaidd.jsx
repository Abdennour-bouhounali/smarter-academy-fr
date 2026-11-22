import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Les deux acquis de l'année les plus proches de la leçon (`1am.m5.r04` : lire une abscisse décimale sur une demi-droite graduée,
 * items 3–6 ; `1am.m1.r04` : comparer des décimaux, items 1–2). L'item `1am.m5.r05` n'a aucun prérequis dans le réseau : « راجع » ne montre rien de plus.
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
        body: <p><MathText>{'مقارنة أعداد عشرية، وقراءة فاصلة نقطة على نصف مستقيم مدرّج. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن نقرأ المحرار.'}</MathText></p>,
      }}
      skills={{
        muqarana: { label: 'مقارنة الأعداد العشرية', emoji: '⚖️' },
        khat: { label: 'قراءة فاصلة على نصف مستقيم مدرّج', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من جهاز قياس تحرّكه بيدك.', advice: 'راجع مقارنة الأعداد العشرية، وقراءة فاصلة على نصف مستقيم مدرّج.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ الوحدات تُقرأ قبل الفاصلة والتدريجات الصغيرة بعدها.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'مقارنة الأعداد العشرية وقراءة الفاصلة متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['muqarana-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['muqarana-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['faasila-nisf-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['faasila-nisf-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['faasila-nisf-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['faasila-nisf-mustaqim-1am'] },
      ]}
    />
  );
}
