import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 2 et 3 du manuel (p. 115) et quatre affirmations de la plateforme, dans la forme
 * « أصحيح أم خاطئ؟ برّر إجابتك » : l'arrondi d'un décimal (1, 2, 3), l'arrondi et la valeur approchée par défaut (4),
 * les rapports trigonométriques de la leçon 1 (5, 6). Diagnostic JAMAIS bloquant ; `id` et `requires` restent
 * littéraux (audit). Aucun nombre du نشاط 4.
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
        tag: 'أستعدّ — الكتاب ص 115', title: 'ست عبارات قبل تشغيل الحاسبة', tone: 'teal',
        body: <p>عبارتان من الكتاب وأربع من المنصّة عن تدوير عدد عشري، والفرق بين المدوّر والقيمة المقربة بالنقصان، والنسب المثلثية في مثلث قائم. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        tadwir: { label: 'تدوير عدد عشري', emoji: '🎯' },
        muqarraba: { label: 'المدوّر والقيمة المقربة بالنقصان', emoji: '✂️' },
        nisba: { label: 'النسب المثلثية في مثلث قائم', emoji: '📐' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بحاسبة تضغط لمساتها بيدك.', advice: 'راجع تدوير عدد عشري: ننظر إلى الرقم الموالي للرقم الذي نحتفظ به. وراجع تعريف الجيب وجيب التمام والظل (الدرس 1).', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: البتر يعطي قيمة مقربة بالنقصان، وليس دائما المدوّر.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التدوير والنسب المثلثية متحكَّم فيهما.', advice: 'في المستوى المتقدّم أتمم جدول الكتاب كاملا، ثم جد الزوايا من نسبها.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['tadwir-adad'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['tadwir-adad'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['tadwir-adad'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['qima-muqarraba'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['nisba-muthallathiya'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['nisba-muthallathiya'] },
      ]}
    />
  );
}
