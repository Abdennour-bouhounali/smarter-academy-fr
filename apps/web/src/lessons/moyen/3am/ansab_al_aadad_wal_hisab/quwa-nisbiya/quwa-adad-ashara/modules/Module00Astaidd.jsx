import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Six viennent de « أستعدّ » (p. 39, items 4, 7, 6, 15, 18, 22, réécrits) ; une de la plateforme (la division
 * par 1000). Elles mesurent le lien « راجع » du réseau — `1am.m1.r03` (ضرب وقسمة عدد عشري على 10، 100، 1000 : `darb-ashara`, leçon 1AM
 * `kusur-ashriya-kitaba`) — plus le مقلوب (`maqlub`) et les unités de longueur (`wahdat`), ajouts de la plateforme. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>الضرب والقسمة على 10 و100 و1000 و0,1 و0,01، ومقلوب عدد، والوحدات. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        darb: { label: 'الضرب والقسمة على 10 و100 و1000', emoji: '✖️' },
        maqlub: { label: 'مقلوب عدد', emoji: '🔁' },
        wahdat: { label: 'وحدات الطول', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بعدسة تدير حلقتها بيدك.', advice: 'راجع إزاحة الفاصلة عند الضرب والقسمة على 10 و100 و1000.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى اتجاه إزاحة الفاصلة عند القسمة وعند الضرب في 0,01.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الإزاحة والمقلوب والوحدات متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['darb-ashara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-2', requires: ['darb-ashara'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-3', requires: ['darb-ashara'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-4', requires: ['darb-ashara'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-5', requires: ['maqlub'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-6', requires: ['darb-ashara'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-7', requires: ['wahdat'] },
      ]}
    />
  );
}
