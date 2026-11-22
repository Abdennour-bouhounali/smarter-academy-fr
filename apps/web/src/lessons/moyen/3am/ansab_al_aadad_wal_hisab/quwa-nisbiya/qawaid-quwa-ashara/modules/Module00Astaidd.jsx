import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations de la plateforme (le manuel n'a pas d'item pour cette leçon). Elles mesurent le lien « راجع » du réseau — `3am.m3.r01`
 * (تعيين القوة من الرتبة n للعدد 10, leçon `quwa-adad-ashara`, publiée : sa décimale, 10⁰, 10⁻ⁿ) — plus un produit de puissances de 10 écrit en décimal et les unités
 * de longueur (`wahdat`, 1AM–2AM). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        tag: 'أستعدّ', title: 'سبع عبارات قبل الانطلاق', tone: 'teal',
        body: <p>قوى العدد 10 وكتابتها العشرية، وجداء ألف في مئة، ووحدات الطول. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        quwa: { label: 'قوى العدد 10 وكتابتها العشرية', emoji: '🔟' },
        wahdat: { label: 'الجداء بالأصفار ووحدات الطول', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بمسطرة تمدّ عليها شريطًا بيدك.', advice: 'راجع درس «قوى العدد 10» : الكتابة العشرية، و $10^0$ و $10^{-n}$ .', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الأسّ السالب وإلى عدد الأصفار عند ضرب الألف في المئة.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'قوى العدد 10 والوحدات متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['quwa-ashara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['quwa-ashara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['quwa-ashara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['quwa-ashara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['wahdat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['wahdat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[6]), id: 'prep-7', requires: ['quwa-ashara'] },
      ]}
    />
  );
}
