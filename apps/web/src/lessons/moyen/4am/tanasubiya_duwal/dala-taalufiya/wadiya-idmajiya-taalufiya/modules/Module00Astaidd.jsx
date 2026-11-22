import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le « أستعدّ » du manuel (p. 77) appartient aux leçons 1 et 2 ; la synthèse pose
 * donc huit affirmations de la plateforme (« عبارة إضافية من المنصّة »), une par ressource des cinq دروس
 * que la situation mobilise : image, antécédent, famille تآلفية / ثابتة (درس 1), ترتيب عند المبدأ et
 * معامل التوجيه (درس 2), تناسب التغيّرات (درس 3), solution d'une جملة = intersection (درس 4), comparer deux
 * tarifs (درس 5). Quatre vraies, quatre fausses ; aucune n'emploie les nombres de la sortie à la plage.
 * Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux (audit).
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
        body: <p>رحلة القسم إلى الشاطئ تعبّئ ما تعلّمته في دروس الوحدة الخمسة: صورة عدد والعدد الذي صورته، الترتيب عند المبدأ ومعامل التوجيه، تناسب التغيّرات، التفسير البياني لجملة، والمقارنة بين صيغتين. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>,
      }}
      skills={{
        sura: { label: 'صورة عدد بدالة تآلفية', emoji: '🎯' },
        sabiq: { label: 'العدد الذي صورته معلومة', emoji: '↩️' },
        naw: { label: 'تآلفية، خطية أم ثابتة', emoji: '🏷️' },
        tartib: { label: 'الترتيب عند المبدأ', emoji: '📍' },
        tawjih: { label: 'معامل التوجيه', emoji: '📈' },
        taghayyur: { label: 'تناسب التغيّرات', emoji: '🪜' },
        jumla: { label: 'الجملة بيانيا', emoji: '✖️' },
        mufadala: { label: 'المقارنة بين صيغتين', emoji: '⚖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: كل جزء من الوضعية يعيدك إلى درسه، وتحليلها يمرّ بثلاث مراحل.', advice: 'راجع الدرس 1 (مفهوم وتعيين دالة تآلفية) والدرس 4 (التفسير البياني لحل جملة معادلتين).', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعية.', advice: 'انتبه: المعامل فرق الصورتين مقسوما على فرق العددين، والثنائية حلّ الجملة تُكتب الفاصلة أولا.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعية متحكَّم فيها.', advice: 'حاول أن تربط كل جزء من الوضعية بدرسه قبل أن تحسب.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['sura-taalufiya'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['adad-sura'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['naw-dala'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['tartib-mabda'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['muamil-tawjih'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['tanasub-taghayyurat'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['taqatu-jumla'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['mufadala'] },
      ]}
    />
  );
}
