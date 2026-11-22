import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Les items 1 et 2 mesurent le lien « راجع » du réseau `1am.m5.r10` (إتمام مساواة ناقصة, leçon 1AM `bahth-adad-naqisa` PUBLIÉE : le lien « راجع » vient du réseau, jamais reconstruite ici) ; l'item 3 la division
 * par un décimal (`kasr-hasil-qisma`), l'item 4 le lien entre × et ÷, l'item 5 une longueur en x (« أستعدّ » 6 à 9 du manuel, `ibara-harfiya-intaj`) et l'item 6 la valeur d'une expression. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        tag: 'أستعدّ', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>العدد الناقص في مساواة، والقسمة على عدد عشري، والضرب والقسمة، والعبارة بالحرف. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        naqis: { label: 'العدد الناقص في مساواة', emoji: '🧩' },
        qisma: { label: 'القسمة على عدد عشري', emoji: '➗' },
        longueur: { label: 'طول بدلالة x', emoji: '📏' },
        ibara: { label: 'قيمة عبارة حرفية', emoji: '🔤' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بقارورة وخزّان نملؤهما معًا.', advice: 'راجع درس « العدد الناقص في مساواة » من السنة الأولى.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'تذكّر دائمًا: الضرب والقسمة عمليتان عكسيتان.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'العدد الناقص والقسمة على عدد عشري متحكَّم فيهما.', advice: 'جرّب مباشرة ملء القوارير.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['bahth-adad-naqisa-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['bahth-adad-naqisa-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['qisma-ala-ushri-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['darb-qisma-ilaqa'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-5', requires: ['ibara-harfiya-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-6', requires: ['ibara-harfiya-2am'] },
      ]}
    />
  );
}
