import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Les deux acquis de l'année qui précèdent la leçon dans le réseau (`1am.m1.r05` : additionner, soustraire et multiplier des décimaux, items 1–3 ;
 * `1am.m5.r01` : l'écriture fractionnaire d'un nombre, d'un quotient, items 4–6). JAMAIS bloquant ; littéraux (audit).
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
        body: <p><MathText>{'جمع الأعداد العشرية وطرحها وضربها، وكتابة حاصل قسمة عدد على آخر في شكل كسر. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن نُرجع الحزام في ورشة التعبئة.'}</MathText></p>,
      }}
      skills={{
        jam: { label: 'الجمع والطرح والضرب على الأعداد العشرية', emoji: '➕' },
        kasr: { label: 'الكتابة الكسرية لحاصل قسمة', emoji: '➗' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من آلة تُرجع حزامها بيدك.', advice: 'راجع الجمع والطرح والضرب على الأعداد العشرية، وكتابة حاصل القسمة في شكل كسر.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ بسط الكسر هو المقسوم ومقامه هو المقسوم عليه.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'حساب الأعداد العشرية وكتابة الكسر متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['jam-tarh-darb-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['jam-tarh-darb-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['jam-tarh-darb-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['kitaba-kasriya-adad-1am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['kitaba-kasriya-adad-1am'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['kitaba-kasriya-adad-1am'] },
      ]}
    />
  );
}
