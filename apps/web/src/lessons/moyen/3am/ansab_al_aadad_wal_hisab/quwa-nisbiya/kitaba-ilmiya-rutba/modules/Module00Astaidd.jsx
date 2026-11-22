import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations de la plateforme (le manuel n'a pas d'item pour cette leçon). Elles mesurent les liens « راجع » du réseau — `1am.m1.r06` (رتبة المقدار,
 * leçon `rutbat-miqdar-jam` non publiée : l'idée est dans l'affirmation 1), le مدوّر à l'unité (2AM), `3am.m3.r03` (écrire un décimal avec des puissances de 10, leçon `quwa-adad-ashara`)
 * et `3am.m3.r02` (les règles, leçon `qawaid-quwa-ashara`). JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>رتبة المقدار، والمدوّر إلى الوحدة، وكتابة عدد بقوى العدد 10 ، وجداء قوتين. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        rutba: { label: 'رتبة المقدار (السنة الأولى)', emoji: '🎯' },
        mudawwar: { label: 'المدوّر إلى الوحدة', emoji: '🔢' },
        quwa: { label: 'كتابة عدد بقوى العدد 10', emoji: '🔟' },
        qawaid: { label: 'جداء قوتين للعدد 10', emoji: '✖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بسلّم تعلّق عليه بطاقات بيدك.', advice: 'راجع درسَي «قوى العدد 10» و«قواعد الحساب على قوى العدد 10» ، ومدوّر عدد إلى الوحدة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الأسّ السالب وإلى تدوير العدد الذي رقمه بعد الفاصلة 5 .', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'قوى العدد 10 والتدوير ورتبة المقدار متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['rutbat-miqdar'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['mudawwar'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['mudawwar'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['kitaba-quwa'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['kitaba-quwa'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['kitaba-quwa'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[6]), id: 'prep-7', requires: ['qawaid-ashara'] },
      ]}
    />
  );
}
