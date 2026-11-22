import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le « أستعدّ » du manuel (p. 91) appartient aux leçons 1, 2 et 3 ; la synthèse
 * pose donc huit affirmations de la plateforme (« عبارة إضافية من المنصّة ») sur ce que la situation des
 * médailles mobilise : l'effectif total, les effectifs cumulés
 * croissant et décroissant, l'étendue, le rang de la médiane, la moyenne pondérée, le tout à partir
 * d'un pourcentage et une équation. Trois vraies, cinq fausses ; aucune n'emploie les nombres des
 * médailles. Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux (audit).
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
        body: <p>وضعية الميداليات تعبّئ ما تعلّمته في دروس الوحدة وقبلها: التكرار الكلي والتكرار المجمع، المدى، الوسيط، المتوسط، النسبة المئوية وحل معادلة. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>,
      }}
      skills={{
        takrar: { label: 'التكرار الكلي', emoji: '🔢' },
        mujamma: { label: 'التكرار المجمع الصاعد والنازل', emoji: '📶' },
        mada: { label: 'مدى سلسلة', emoji: '↔️' },
        wasit: { label: 'رتبة الوسيط', emoji: '🎯' },
        mutawassit: { label: 'المتوسط المتوازن', emoji: '⚖️' },
        nisba: { label: 'أخذ نسبة من عدد', emoji: '💯' },
        muadala: { label: 'حل معادلة', emoji: '✏️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: تحليل الوضعية يمرّ بثلاث مراحل كما في الكتاب.', advice: 'راجع الدرس 1 (التكرار المجمع) والدرس 2 (مدى ووسيط ومتوسط سلسلة إحصائية).', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعية.', advice: 'انتبه: المتوسط يُحسب بالتكرارات، والوسيط يُعيَّن برتبته.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعية متحكَّم فيها.', advice: 'حاول اختيار المؤشر المناسب قبل أن تحسب.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['takrar-kulli'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['takrar-mujamma'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['takrar-mujamma'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['mada'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['wasit-rutba'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['mutawassit-murajjah'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['nisba-min-adad'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['muadala-ula'] },
      ]}
    />
  );
}
