import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';
import { texTable } from '../components/FreqTable';
import { PieChart } from '../components/Charts';

/**
 * Module 0 — أستعدّ. L'item 4 du manuel (p. 91 : le مخطط دائري et son tableau, REDESSINÉS) et quatre
 * affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : le تكرار d'une valeur (1),
 * le تواتر = التكرار ÷ التكرار الكلي (2, 3), « على الأكثر » (4), le ترتيب تصاعدي (5). Diagnostic JAMAIS
 * bloquant ; `id` et `requires` restent littéraux (audit).
 */
const item4 = PREP_ITEMS[2];
const prompt4 = (
  <span className="block space-y-2">
    <MathText>{item4.text}</MathText> <SourceTag source={item4.source} className="ms-2" />
    <span className="block text-xs text-slate-600"><MathText>{"(السطر الأول: القيمة $a$ ، السطر الثاني: التكرار النسبي)"}</MathText></span>
    <span className="block"><MathText>{texTable([item4.table.classes, item4.table.rel])}</MathText></span>
    <PieChart parts={item4.pie} label="مخطط دائري بثلاثة قطاعات: 40 و 10 و 30" size={130} />
  </span>
);

export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="5 دقائق"
      brief={{
        tag: 'أستعدّ — الكتاب ص 91', title: 'خمس عبارات قبل الانطلاق', tone: 'teal',
        body: <p>عبارة من الكتاب عن مخطط دائري، وأربع عبارات من المنصّة عن التكرار والتواتر و«على الأكثر» والترتيب. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        takrar: { label: 'تكرار قيمة في سلسلة', emoji: '🔢' },
        tawatur: { label: 'التواتر (التكرار النسبي)', emoji: '📊' },
        shart: { label: '«على الأكثر» و«على الأقل»', emoji: '📏' },
        tartib: { label: 'الترتيب التصاعدي', emoji: '↗️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بطابور تراه يُضاء أمامك.', advice: 'راجع حساب التكرار والتواتر (التكرار ÷ التكرار الكلي) ومعنى «على الأكثر» (أصغر من أو يساوي).', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: «على الأقل 15» تشمل 15 نفسها.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التكرار والتواتر والترتيب متحكَّم فيها.', advice: 'في المستوى المتقدّم رتّب العشرين تلميذا بنفسك قبل أن تعدّ.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['takrar-qima'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['tawatur-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[2]), prompt: prompt4, id: 'prep-3', requires: ['tawatur-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['ala-aqal-akthar'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['tartib-tasaudi'] },
      ]}
    />
  );
}
