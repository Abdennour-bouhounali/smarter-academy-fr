import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Les acquis qui précèdent la leçon : le calcul décimal (`1am.m1.r05`, items 1–2), l'ordre des opérations (items 3–4) et le périmètre et l'aire d'un rectangle
 * (`1am.m2.r08`, acquis du primaire, items 5–6 : la leçon qui les enseigne en 1AM vient plus tard). JAMAIS bloquant ; littéraux (audit).
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
        body: <p><MathText>{'حساب الأعداد العشرية، وأيّ عملية نحسبها أوّلًا في سلسلة عمليات، ومحيط مستطيل ومساحته. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن ندير قرص الحروف في مكتبة التصوير.'}</MathText></p>,
      }}
      skills={{
        jam: { label: 'الجمع والطرح والضرب على الأعداد العشرية', emoji: '➕' },
        awla: { label: 'أولوية العمليات والأقواس', emoji: '🔢' },
        mustatil: { label: 'محيط المستطيل ومساحته', emoji: '▭' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من قرص تديره بيدك.', advice: 'راجع الجمع والطرح والضرب على الأعداد العشرية، وأنّ الضرب قبل الجمع، وأنّ ما بين القوسين يُحسب أوّلًا.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الفرق بين المحيط (مجموع الأضلاع) والمساحة (جداء البعدين).', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الحساب العشري وأولوية العمليات والمستطيل متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['jam-tarh-darb-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['jam-tarh-darb-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['awlawiyat-amaliyat-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['awlawiyat-amaliyat-1am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['muhit-masaha-mustatil-1am'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['muhit-masaha-mustatil-1am'] },
      ]}
    />
  );
}
