import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items 4, 5, 6 du manuel (p. 163 : volumes du cube, du pavé, du cylindre — les items 1–2 sont au
 * درس « الكرة والجلة », 3, 7, 8 au درس « التكبير والتصغير ») et quatre affirmations de la plateforme sur les prérequis du
 * propriétaire, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : l'aire latérale du cylindre (p1), les puissances (p2),
 * l'arrondi (p3), la valeur exacte avec π (p4). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux.
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
        tag: 'أستعدّ — الكتاب ص 163', title: 'سبع عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ثلاث عبارات من الكتاب وأربع من المنصّة عن حجوم المجسّمات المألوفة، والمساحة الجانبية للأسطوانة، والقوى، والتدوير، والعدد π. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        mukaab: { label: 'حجم المكعب', emoji: '🧊' },
        mutawazi: { label: 'حجم متوازي المستطيلات', emoji: '📦' },
        ustuwana: { label: 'حجم الأسطوانة', emoji: '🥫' },
        janibiya: { label: 'المساحة الجانبية للأسطوانة', emoji: '🧻' },
        quwa: { label: 'القوى', emoji: '²' },
        tadwir: { label: 'التدوير', emoji: '🎯' },
        madbuta: { label: 'القيمة المضبوطة و π', emoji: '🥧' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ ببرتقالة تقشّرها وتعصرها بيدك.', advice: 'راجع: حجم الأسطوانة هو مساحة القاعدة مضروبة في الارتفاع، ومكعّب عدد هو جداؤه في نفسه ثلاث مرات.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: ندوّر بالنظر إلى الرقم الموالي، ولا نبتر.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الحجوم والقوى والتدوير متحكَّم فيها.', advice: 'في المستوى المتقدّم تختار بنفسك عدد الأرقام بعد الفاصلة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-4', requires: ['hajm-mukaab'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-5', requires: ['hajm-mutawazi-mustatilat'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-6', requires: ['hajm-ustuwana'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-p1', requires: ['misaha-janibiya'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p2', requires: ['quwa'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p3', requires: ['tadwir'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-p4', requires: ['qima-madbuta'] },
      ]}
    />
  );
}
