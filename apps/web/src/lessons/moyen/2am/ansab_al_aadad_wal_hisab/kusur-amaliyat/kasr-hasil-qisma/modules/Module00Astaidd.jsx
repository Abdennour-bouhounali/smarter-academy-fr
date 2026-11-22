import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : cinq affirmations de « أستعدّ » (p. 23, items 1, 2, 3, 4, 7 — réécrites avec leurs nombres) et deux de la plateforme sur les items du réseau que la leçon suppose (LEARNING_NET.md §4.4) :
 * `1am.m3.r04` (la valeur approchée à l'unité — leçon planifiée, le panneau « راجع قبل أن تنطلق » la montre « قريبًا » sans lien) et `1am.m3.r03` (la division décimale par un naturel). Chaque item de révision est
 * MESURÉ : r04 par les items 5 et 6 ci-dessous (les deux affirmations de la plateforme). Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux.
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="7 دقائق"
      brief={{
        tag: 'أستعدّ', title: 'سبع عبارات قبل الانطلاق', tone: 'teal',
        body: <p>سبع عبارات. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه من السنة الأولى قبل أن تبدأ.</p>,
      }}
      skills={{
        kasr: { label: 'الكسر حاصل قسمة', emoji: '🍰' },
        ikhtizal: { label: 'الكتابات الكسرية المتساوية', emoji: '🟰' },
        qisma: { label: 'القسمة العشرية', emoji: '➗' },
        taqrib: { label: 'القيمة المقرّبة إلى الوحدة', emoji: '🎯' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بحبل تقطعه وتراه.', advice: 'راجع درس « حاصل القسمة كسر » من السنة الأولى أسفله.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'تذكّر دائمًا أنّ حاصل قسمة a على b هو a/b.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكسر حاصل قسمة، والقيمة المقرّبة إلى الوحدة متحكَّم فيهما.', advice: 'جرّب مباشرة حبل الـ 8 أمتار.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['kasr-hasil-qisma-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['kasr-hasil-qisma-1am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['kasr-hasil-qisma-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['kasr-mutasawi-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-5', requires: ['qima-muqarraba-wahda'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-6', requires: ['qisma-ashriya-1am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-7', requires: ['qisma-ashriya-1am'] },
      ]}
    />
  );
}
