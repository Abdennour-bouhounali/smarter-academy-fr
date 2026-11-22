import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { TextbookBox } from '../../../../../../common/textbook';
import MathText from '../../../../../../common/components/MathText';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS, DID_YOU_KNOW } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme, UNE par leçon de l'unité (مقلوب وقسمة كسرين, تساوي ومقارنة, جمع وطرح, العدد الناطق, العمليات على الأعداد الناطقة) ;
 * les items 1 et 6 réécrivent أؤكّد 8 et 12 avec d'autres nombres. Aucune ne donne les nombres des situations. JAMAIS bloquant ; `id` et `requires` littéraux.
 * Le cadre « هل تعلم » (l'ouverture historique de l'unité, réécrite) clôt la présentation.
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
        tag: 'أستعدّ — قبل الوضعيات', title: 'ست عبارات قبل الوضعيات', tone: 'teal',
        body: (
          <div className="space-y-3">
            <p>الوضعيات تجمع ما تعلّمته في الوحدة: المقلوب وقسمة الكسور، والمقارنة، والجمع والطرح، والأعداد الناطقة وسلاسل الحساب. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>
            <TextbookBox kind="remark" title="هل تعلم؟" compact><MathText>{DID_YOU_KNOW.text}</MathText></TextbookBox>
          </div>
        ),
      }}
      skills={{
        maqlub: { label: 'المقلوب وقسمة الكسور', emoji: '🔁' },
        tasawi: { label: 'مقارنة كسرين', emoji: '⚖️' },
        jamTarh: { label: 'جمع كسرين وطرحهما', emoji: '➕' },
        natiq: { label: 'العدد الناطق', emoji: '🔢' },
        amaliyat: { label: 'العمليات على الأعداد الناطقة', emoji: '🧮' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: ستحلّ ست وضعيات تدريبية خطوة بخطوة.', advice: 'راجع الدروس الخمسة: المقلوب وقسمة كسرين، وتساوي كسرين ومقارنتهما، وجمع وطرح كسرين، والعدد الناطق، والعمليات على الأعداد الناطقة.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه إلى المقام المشترك وإلى مقلوب القاسم وإلى إشارة الناتج.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعيات متحكَّم فيها.', advice: 'حاول حلّ الوضعيات دون مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['maqlub-qismat-kasrayn-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['tasawi-muqaranat-kasrayn-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['jam-tarh-kasrayn-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['adad-natiq-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['amaliyat-natiqa-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['maqlub-qismat-kasrayn-3am'] },
      ]}
    />
  );
}
