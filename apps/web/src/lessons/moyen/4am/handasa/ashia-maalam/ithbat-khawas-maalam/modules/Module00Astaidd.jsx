import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items « أستعدّ » du manuel (p. 139) vont aux leçons 1 à 3 (extraction › destinations › prep) :
 * sept affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك », une par acquis déclaré
 * (`priorKnowledge`) — la distance, les composantes (l'ordre de la soustraction), le milieu, la réciproque de Pythagore,
 * le parallélogramme par deux vecteurs égaux, les quadrilatères usuels, le cercle (rayon et diamètre). Aucun point du
 * laboratoire qui suit (A, B, C du ملعب ; la طريقة p. 145). Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux (audit).
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
        tag: 'أستعدّ', title: 'سبع عبارات قبل أن ندخل الملعب', tone: 'teal',
        body: <p>عبارات من المنصّة عن المسافة والمركبات والمنتصف وعكس خاصية فيثاغورس والرباعيات والدائرة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        masafa: { label: 'المسافة بين نقطتين', emoji: '📏' },
        murakkibat: { label: 'مركبتا شعاع', emoji: '↗️' },
        muntasaf: { label: 'إحداثيتا المنتصف', emoji: '📍' },
        fithaghuras: { label: 'الخاصية العكسية لخاصية فيثاغورس', emoji: '📐' },
        mutawazi: { label: 'شعاعان متساويان ومتوازي الأضلاع', emoji: '▱' },
        rubaiyat: { label: 'خواص الرباعيات الشهيرة', emoji: '🔷' },
        daira: { label: 'الدائرة: نصف القطر والقطر', emoji: '⭕' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بمختبر يحسب فيه الفار أمامك.', advice: 'راجع قانون المسافة وإحداثيتي المنتصف (الدرس 3)، وحساب مركبتي شعاع (الدرس 2).', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أطول ضلع في عكس خاصية فيثاغورس، وإلى الفرق بين القطر ونصف القطر.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'المسافات والرباعيات متحكَّم فيها.', advice: 'في المستوى المتقدّم يطلب الفار أدلة كافية: متوازي الأضلاع وحده لا يصنع مربّعا.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['masafa-maalam'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['murakkibat-shuaa'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['muntasaf-maalam'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['aks-fithaghuras'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['tasawi-mutawazi'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['khawass-rubaiyat'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['daira-nisf-qutr'] },
      ]}
    />
  );
}
