import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le « أستعدّ » du manuel (p. 139) appartient aux leçons 1 à 3 ; la synthèse pose donc huit affirmations
 * de la plateforme (« عبارة إضافية من المنصّة ») sur ce que les وضعيات d'entraînement, la وضعية finale et son analyse mobilisent : lire un
 * point, les composantes d'un vecteur, le milieu, la distance, la longueur d'un demi-cercle, la réciproque de Pythagore, la
 * valeur approchée d'une racine, l'ordre des sommets d'un متوازي أضلاع. Quatre vraies, quatre fausses ; aucune n'emploie les
 * nombres de la وضعية ou du lab. Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux (audit),
 * une connaissance par affirmation.
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'ثماني عبارات قبل الوضعية الإدماجية', tone: 'teal',
        body: <p>الوضعيات التدريبية ووضعية «العدّاءين» تعبّئ ما تعلّمته في دروس الوحدة وقبلها: قراءة نقطة، المركبتان، المنتصف، المسافة، طول نصف دائرة، وعكس خاصية فيثاغورس. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>,
      }}
      skills={{
        nuqta: { label: 'قراءة نقطة في معلم', emoji: '📍' },
        murakkibat: { label: 'مركبتا شعاع', emoji: '↗️' },
        muntasaf: { label: 'منتصف قطعة', emoji: '⚖️' },
        masafa: { label: 'المسافة بين نقطتين', emoji: '📏' },
        nisfDaira: { label: 'طول نصف دائرة', emoji: '◠' },
        tabia: { label: 'عكس خاصية فيثاغورس', emoji: '📐' },
        muqarraba: { label: 'القيمة المقرّبة', emoji: '≈' },
        tartib: { label: 'ترتيب رؤوس متوازي الأضلاع', emoji: '▱' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: تحليل الوضعية يمرّ بثلاث مراحل كما في الكتاب.', advice: 'راجع الدرس 3 (المنتصف والمسافة) قبل الوضعية.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعية.', advice: 'انتبه: المسافة جذر مجموع مربعين، لا مجموع الفرقين.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعية متحكَّم فيها.', advice: 'قبل أن تحسب، اقرأ إحداثيات كل نقطة على الشكل.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['ihdathiyat-nuqta'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['hisab-murakkibat'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['muntasaf-qita'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['masafa-nuqtatayn'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['tul-nisf-daira'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['aks-fithaghuris'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['qima-muqarraba'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['mutawazi-tartib'] },
      ]}
    />
  );
}
