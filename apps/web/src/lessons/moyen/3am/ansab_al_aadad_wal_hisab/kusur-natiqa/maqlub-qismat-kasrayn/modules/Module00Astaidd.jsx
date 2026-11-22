import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Une vient de « أستعدّ » (p. 23, item 2, réécrit) ; cinq de la plateforme mesurent les liens « راجع » du réseau
 * (LEARNING_NET.md §4.4) : `2am.m1.r07` (ضرب كسرين — leçon 2AM `jida-kasrayn`, NON publiée : « قريبًا ») et `3am.m1.r02` (حساب حاصل قسمة عددين نسبيين — leçon
 * `qismat-nisbiyayn`, NON publiée). JAMAIS bloquant ; `id` et `requires` littéraux. L'item 1 du manuel (le مقلوب de 0,8) EST la leçon : il passe au test final.
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
        body: <p>ضرب كسرين، وربط القسمة بالضرب في أعداد نسبية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        darb: { label: 'ضرب كسرين', emoji: '✖️' },
        qisma: { label: 'القسمة والضرب', emoji: '➗' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بدوّاسة درّاجة تدير عجلتها بيدك.', advice: 'راجع ضرب كسرين: بسط في بسط ومقام في مقام، وأنّ القسمة تُختبر بالضرب.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ العدد الطبيعي يضرب البسط وحده.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'ضرب الكسور وربط القسمة بالضرب متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['jida-kasrayn-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['jida-kasrayn-2am'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-3', requires: ['jida-kasrayn-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-4', requires: ['qisma-darb-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-5', requires: ['qisma-darb-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-6', requires: ['qisma-darb-3am'] },
      ]}
    />
  );
}
