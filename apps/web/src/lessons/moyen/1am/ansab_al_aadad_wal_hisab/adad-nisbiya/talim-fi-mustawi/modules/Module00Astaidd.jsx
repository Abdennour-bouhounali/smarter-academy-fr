import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. L'acquis de l'année le plus proche de la leçon (`1am.m5.r06` : lire une abscisse, placer un relatif sur une droite graduée, le symétrique par rapport à l'origine), l'unique
 * prérequis de l'item dans le réseau (`1am.m5.r06 → 1am.m5.r07`). Les six items mesurent cet item (items 1–3 : lire une abscisse, items 4–6 : en placer et en comparer). JAMAIS bloquant ; littéraux (audit).
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
        body: <p><MathText>{'قراءة فاصلة نقطة على مستقيم مدرّج وتعليمها، ونظيرتها بالنسبة إلى المبدإ. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تقود المسيّرة فوق ساحة المدرسة.'}</MathText></p>,
      }}
      skills={{
        abscissa: { label: 'قراءة فاصلة على مستقيم مدرّج', emoji: '📏' },
        mark: { label: 'تعليم نقطة ونظيرتها', emoji: '📍' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من الصفر على خطّين مطليّين.', advice: 'راجع قراءة فاصلة نقطة على مستقيم مدرّج، وأنّ الجهة اليسرى سالبة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ المسافة نفسها لا تعني الفاصلة نفسها.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'قراءة الفاصلة وتعليم النقطة متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['abscissa-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['abscissa-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['abscissa-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['abscissa-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['abscissa-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['abscissa-mustaqim-1am'] },
      ]}
    />
  );
}
