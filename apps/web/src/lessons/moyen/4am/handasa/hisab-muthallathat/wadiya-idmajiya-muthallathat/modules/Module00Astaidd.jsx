import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le « أستعدّ » du manuel (p. 115) appartient aux leçons 1 et 2 ; la synthèse pose donc sept
 * affirmations de la plateforme (« عبارة إضافية من المنصّة ») sur ce que la وضعية, et le test final
 * mobilisent : Thalès dans une ligne de visée, la définition de la tangente, l'inconnue au dénominateur, la touche
 * inverse, Pythagore dans un pavé, l'arrondi à l'unité, cos² + sin² = 1. Quatre vraies, trois fausses ; aucune
 * n'emploie les nombres du مقام, du pavé ou de la pyramide. Diagnostic JAMAIS bloquant ; `id` et `requires`
 * littéraux (audit), une connaissance par affirmation.
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'سبع عبارات قبل الوضعية الإدماجية', tone: 'teal',
        body: <p>وضعية «مقام الشهيد» ووضعية الاختبار النهائي تعبّئ ما تعلّمته في دروس الوحدة وقبلها: خاصية طالس، النسب المثلثية والحاسبة، خاصية فيثاغورس والتدوير. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>,
      }}
      skills={{
        nazar: { label: 'خاصية طالس في خط النظر', emoji: '👁️' },
        tarif: { label: 'تعريف النسب المثلثية', emoji: '📐' },
        maqam: { label: 'مجهول في المقام', emoji: '➗' },
        hasiba: { label: 'قيس زاوية بالحاسبة', emoji: '🧮' },
        fada: { label: 'خاصية فيثاغورس في مجسّم', emoji: '📦' },
        tadwir: { label: 'التدوير', emoji: '🎯' },
        alaqa: { label: 'العلاقة بين الجيب وجيب التمام', emoji: '🔗' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: تحليل الوضعية يمرّ بثلاث مراحل كما في الكتاب.', advice: 'راجع الدرس 1 (النسب المثلثية) والدرس 2 (الحاسبة)، وخاصية طالس من الوحدة 9.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعية.', advice: 'انتبه: الظل نسبة لا قيس زاوية، والقيس يُعيَّن باللمسة العكسية؛ وندوّر في آخر الحساب.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعية متحكَّم فيها.', advice: 'حاول أن ترى المثلث القائم (أو المثلثين في وضعية طالس) قبل أن تحسب.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['talis-nazar'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['nisab-tarif'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['majhul-maqam'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['hasiba-aks'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['fithaghuris-fada'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['tadwir'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['alaqa-asasiya'] },
      ]}
    />
  );
}
