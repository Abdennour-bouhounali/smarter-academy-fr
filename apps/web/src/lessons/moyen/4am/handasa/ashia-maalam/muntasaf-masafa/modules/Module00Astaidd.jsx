import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. L'item 5 du manuel (p. 139 ; les autres sont aux دروس « قراءة مركبتي شعاع » et « حساب مركبتي
 * شعاع ») et cinq affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : le milieu par les
 * vecteurs (5), les composantes d'un vecteur (p1), Pythagore (p2), la simplification d'une racine (p3), le carré d'un
 * relatif (p4), un point sur un axe (p5). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
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
        tag: 'أستعدّ — الكتاب ص 139', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>عبارة من الكتاب وخمس من المنصّة عن المنتصف والأشعة، ومركبتي شعاع، وخاصية فيثاغورس، والجذور، والأعداد النسبية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        muntasaf: { label: 'المنتصف وتساوي شعاعين', emoji: '🎯' },
        murakkibat: { label: 'مركبتا شعاع', emoji: '↗️' },
        fithaghuras: { label: 'خاصية فيثاغورس', emoji: '📐' },
        judhur: { label: 'تبسيط جذر تربيعي', emoji: '√' },
        nisbiya: { label: 'مربع عدد نسبي', emoji: '➖' },
        ihdathiyat: { label: 'نقطة في معلم', emoji: '📍' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بموعد بين صديقين تحرّكه بيدك على الخريطة.', advice: 'راجع: مركبتا الشعاع AB هما فرق الفاصلتين وفرق الترتيبين (النهاية ناقص المبدأ)، وفي مثلث قائم مربع الوتر يساوي مجموع مربعي الضلعين الآخرين.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: مربع عدد سالب موجب، والوتر ليس مجموع الضلعين.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأشعة وفيثاغورس والجذور متحكَّم فيها.', advice: 'في المستوى «متقدم» توقّع موضع J وزاوية الدرج M قبل أن تثبّتهما: لا قراءة قبل التثبيت.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-5', requires: ['muntasaf-shuaa'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-p1', requires: ['murakkibat-hisab'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-p2', requires: ['fithaghuras'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-p3', requires: ['judhur-tabsit'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p4', requires: ['murabba-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p5', requires: ['ihdathiyat-qiraa'] },
      ]}
    />
  );
}
