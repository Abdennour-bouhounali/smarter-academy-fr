import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le « أستعدّ » du manuel (p. 163) appartient aux quatre leçons ; la synthèse pose donc onze affirmations de
 * la plateforme (« عبارة إضافية من المنصّة ») sur ce que les six وضعيات d'entraînement, la وضعية du seau et le إختبار mobilisent : la كرة
 * et la جلّة, l'aire de la sphère, le volume de la boule, la section d'une sphère et celle d'un cône, l'effet de k sur un volume,
 * le volume du cône, Thalès, le litre. Cinq vraies, quatre fausses ; aucune n'emploie les nombres de la وضعية, du lab ni du إختبار. Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux (audit), une connaissance par affirmation.
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'إحدى عشرة عبارة قبل الوضعيات', tone: 'teal',
        body: <p>الوضعيات التدريبية الست ووضعية «الدلو» ووضعية الاختبار تعبّئ ما تعلّمته في دروس الوحدة وقبلها: الكرة والجلة، المساحة والحجم، المقاطع المستوية، التكبير والتصغير، حجم المخروط والأسطوانة، خاصية طالس، واللتر. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>,
      }}
      skills={{
        kura: { label: 'الكرة والجلة', emoji: '🔮' },
        misaha: { label: 'مساحة الكرة', emoji: '🌐' },
        hajm: { label: 'حجم الجلة', emoji: '🍊' },
        maqtaKura: { label: 'مقطع كرة بمستو', emoji: '🔪' },
        maqtaMukhrut: { label: 'مقطع مخروط مواز لقاعدته', emoji: '🍦' },
        takbir: { label: 'أثر التكبير على الحجم', emoji: '🧊' },
        mukhrut: { label: 'حجم المخروط', emoji: '📐' },
        talis: { label: 'خاصية طالس', emoji: '📏' },
        litr: { label: 'اللتر والسنتيمتر المكعب', emoji: '🪣' },
        maqtaUstuwana: { label: 'مقطع أسطوانة بمستوٍ موازٍ لمحورها', emoji: '🥫' },
        hajmUstuwana: { label: 'حجم الأسطوانة', emoji: '♻️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: ستحلّ ست وضعيات تدريبية خطوة بخطوة، وكل جزء يعيدك إلى درسه.', advice: 'راجع الدرس 4 (التكبير والتصغير) قبل الوضعيات.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعية.', advice: 'انتبه: في تكبير أو تصغير نسبته k تُضرب الحجوم في k مكعّب.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعية متحكَّم فيها.', advice: 'قبل أن تحسب، ارسم المقطع المحوري للمجسم.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['kura-julla'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['misaha-kura'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['hajm-julla'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['maqta-kura'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['maqta-mukhrut'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['takbir-k3'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['hajm-makhrut'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['talis'] },
        { ...prepQuestion(PREP_ITEMS[8]), id: 'prep-9', requires: ['litr'] },
        { ...prepQuestion(PREP_ITEMS[9]), id: 'prep-10', requires: ['maqta-ustuwana'] },
        { ...prepQuestion(PREP_ITEMS[10]), id: 'prep-11', requires: ['hajm-ustuwana'] },
      ]}
    />
  );
}
