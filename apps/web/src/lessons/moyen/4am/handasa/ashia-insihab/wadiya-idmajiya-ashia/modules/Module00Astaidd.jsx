import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le « أستعدّ » du manuel (p. 128) appartient aux leçons 1 et 2 ; la synthèse pose donc huit
 * affirmations de la plateforme (« عبارة إضافية من المنصّة ») sur ce que la وضعية et la وضعية finale
 * mobilisent : deux vecteurs égaux, l'image par une translation, l'ordre des sommets d'un متوازي أضلاع, Chasles, la
 * distance entre deux parallèles, l'inégalité triangulaire, Pythagore, la droite des milieux. Quatre vraies, quatre
 * fausses ; aucune n'emploie les nombres de la وضعية, du QCM ou des exercices. Diagnostic JAMAIS bloquant ; `id` et
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'ثماني عبارات قبل الوضعية الإدماجية', tone: 'teal',
        body: <p>وضعية «ممر الراجلين» ووضعية الاختبار النهائي تعبّئان ما تعلّمته في دروس الوحدة وقبلها: تساوي شعاعين، الانسحاب، متوازي الأضلاع، علاقة شال، وأقصر مسافة. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>,
      }}
      skills={{
        tasawi: { label: 'تساوي شعاعين', emoji: '↔️' },
        sura: { label: 'صورة نقطة بانسحاب', emoji: '➡️' },
        tartib: { label: 'متوازي الأضلاع وترتيب رؤوسه', emoji: '▱' },
        shal: { label: 'علاقة شال', emoji: '🔗' },
        bud: { label: 'المسافة بين مستقيمين متوازيين', emoji: '🛣️' },
        mutabayina: { label: 'أقصر طريق بين نقطتين', emoji: '📏' },
        fithaghuris: { label: 'خاصية فيثاغورس', emoji: '📐' },
        muntasafayn: { label: 'مستقيم المنتصفين', emoji: '🔺' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: تحليل الوضعية يمرّ بثلاث مراحل كما في الكتاب.', advice: 'راجع الدرس 1 (تساوي شعاعين والانسحاب) والدرس 2 (متوازي الأضلاع).', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعية.', advice: 'انتبه: الشعاع يبدأ من النقطة وينتهي عند صورتها، وترتيب رؤوس متوازي الأضلاع مهمّ.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعية متحكَّم فيها.', advice: 'ابحث في الشكل عن الشعاعين المتساويين قبل أن تحسب.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['tasawi-shuaayn'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['sura-insihab'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['mutawazi-tartib'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['alaqat-shal'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['bud-mutawaziyayn'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['mutabayina-muthallathiya'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['fithaghuris'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['mustaqim-muntasafayn'] },
      ]}
    />
  );
}
