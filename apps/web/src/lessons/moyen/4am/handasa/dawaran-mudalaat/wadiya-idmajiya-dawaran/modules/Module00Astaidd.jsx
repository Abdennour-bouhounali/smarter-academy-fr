import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le « أستعدّ » du manuel (p. 151) appartient aux quatre leçons ; la synthèse pose donc neuf affirmations de
 * la plateforme (« عبارة إضافية من المنصّة ») sur ce que la وضعية mobilise : l'image d'un point
 * par un دوران, la conservation des longueurs, l'angle inscrit et l'angle au centre, l'angle au centre d'un polygone régulier et sa
 * définition, les angles et la hauteur d'un triangle isocèle, le sinus, le périmètre du cercle. Cinq vraies, quatre fausses ;
 * aucune n'emploie les nombres de la وضعية, du lab ni du إختبار. Diagnostic JAMAIS bloquant ; `id` et
 * `requires` littéraux (audit), une connaissance par affirmation.
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'تسع عبارات قبل الوضعية الإدماجية', tone: 'teal',
        body: <p>وضعية «أعمدة الإنارة» تعبّئ ما تعلّمته في دروس الوحدة وقبلها: صورة نقطة بدوران وخواصه، الزاوية المحيطية والمركزية، المضلع المنتظم، المثلث المتساوي الساقين، الجيب، ومحيط الدائرة. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>,
      }}
      skills={{
        sura: { label: 'صورة نقطة بدوران', emoji: '↻' },
        khawas: { label: 'الدوران يحافظ على الأطوال', emoji: '📏' },
        muhitiya: { label: 'الزاوية المحيطية والمركزية', emoji: '◔' },
        markaziya: { label: 'الزاوية المركزية لمضلع منتظم', emoji: '✳️' },
        muntazam: { label: 'تعريف المضلع المنتظم', emoji: '⬡' },
        saqayn: { label: 'زوايا المثلث المتساوي الساقين', emoji: '🔺' },
        irtifa: { label: 'ارتفاع المثلث المتساوي الساقين', emoji: '📐' },
        jaib: { label: 'جيب زاوية حادة', emoji: '📈' },
        muhit: { label: 'محيط الدائرة', emoji: '⭕' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: تحليل الوضعية يمرّ بثلاث مراحل كما في الكتاب، وكل جزء يعيدك إلى درسه.', advice: 'راجع الدرس 4 (المضلعات المنتظمة) قبل الوضعية.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعية.', advice: 'انتبه: الزاوية المركزية لمضلع منتظم له n ضلعا هي 360 درجة على n.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعية متحكَّم فيها.', advice: 'قبل أن تحسب، ارسم مخطّطا: الدائرة ومركزها ومواضع الأعمدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['sura-dawaran'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['khawas-dawaran-atwal'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['zawiya-muhitiya-markaziya'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['zawiya-markaziya-muntazam'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['mudalla-muntazam'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['zawaya-mutasawi-saqayn'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['irtifa-mutasawi-saqayn'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['jaib-zawiya'] },
        { ...prepQuestion(PREP_ITEMS[8]), id: 'prep-9', requires: ['muhit-daira'] },
      ]}
    />
  );
}
