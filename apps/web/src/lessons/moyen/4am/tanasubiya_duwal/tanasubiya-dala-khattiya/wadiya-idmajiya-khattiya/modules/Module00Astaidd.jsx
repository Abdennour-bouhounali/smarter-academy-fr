import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le « أستعدّ » du manuel (p. 65) appartient aux leçons 1, 2 et 4 ; la
 * synthèse pose donc neuf affirmations de la plateforme (« عبارة إضافية من المنصّة ») sur ce que
 * la situation et les six entraînements mobilisent : Pythagore, la vitesse moyenne avec
 * conversion d'unités, la réduction en % comme multiplication, la lecture d'un graphique,
 * l'image, le coefficient, la forme ax et un pourcentage d'un tout. Quatre vraies, cinq fausses ;
 * aucune n'emploie les nombres du téléphérique. Diagnostic JAMAIS bloquant ; `id` et `requires`
 * littéraux (audit).
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
        body: <p>وضعية المصعد الهوائي تعبّئ ما تعلّمته في الوحدة وقبلها: مبرهنة فيثاغورس، السرعة المتوسطة وتحويل الوحدات، التخفيض بنسبة مئوية، القراءة البيانية، صورة عدد ومعامل دالة خطية. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>,
      }}
      skills={{
        fithaghuras: { label: 'مبرهنة فيثاغورس', emoji: '📐' },
        maqadir: { label: 'السرعة المتوسطة والوحدات', emoji: '⏱️' },
        takhfid: { label: 'التخفيض بنسبة مئوية', emoji: '🏷️' },
        qiraa: { label: 'القراءة البيانية', emoji: '📈' },
        sura: { label: 'صورة عدد بدالة خطية', emoji: '🎯' },
        muamil: { label: 'معامل دالة خطية', emoji: '🔢' },
        shakl: { label: 'شكل الدالة الخطية', emoji: '✏️' },
        nisba: { label: 'نسبة جزء من كل', emoji: '🥧' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: تحليل الوضعية يمرّ بثلاث مراحل كما في الكتاب.', advice: 'راجع الدرس 2 (مفهوم وتعيين الدالة الخطية) والدرس 4 (تطبيقات التناسبية: النسب المئوية والمقادير المركبة).', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعية.', advice: 'انتبه: بعد تخفيض نضرب في النسبة المدفوعة، والوتر لا يساوي مجموع الضلعين.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعية متحكَّم فيها.', advice: 'حاول اختيار الاستراتيجية قبل أن تحسب.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['fithaghuras'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['maqadir-murakkaba'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['nisba-takhfid'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['nisba-takhfid'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['qiraa-bayaniya'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['sura-adad'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['tayin-muamil'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['shakl-khatti'] },
        { ...prepQuestion(PREP_ITEMS[8]), id: 'prep-9', requires: ['nisba-mia'] },
      ]}
    />
  );
}
