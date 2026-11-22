import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : « استحضر مكتسباتي » (p. 24), items 1, 2 et 8 du manuel (le sens du جمع / طرح vu au primaire),
 * plus deux affirmations de la plateforme sur l'item du réseau `1am.m1.r03` (×/÷ par 10, 100 — leçon « الكسور العشرية
 * والكتابة العشرية »), que la leçon suppose (LEARNING_NET.md §4.4). Diagnostic JAMAIS bloquant ; `id` et `requires`
 * littéraux (audit). Le panneau « راجع قبل أن تنطلق » sous le résultat vient du réseau, sans code ici.
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
        tag: 'استحضر مكتسباتي — الكتاب ص 24', title: 'خمس عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ثلاث عبارات من الكتاب واثنتان من المنصّة. ليست اختبارًا: الغاية أن تعرف أنت ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        jamtarh: { label: 'معنى الجمع والطرح (التعليم الابتدائي)', emoji: '➕' },
        ashri: { label: 'الضرب والقسمة على 10 و 100', emoji: '🔟' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط الأول يبدأ من تلاميذ أمام مقياس القامة، ولا يفترض شيئًا.', advice: 'راجع: «أقلّ بـ» و«أكثر بـ» في وضعيات بسيطة، وانتقال الفاصلة عند الضرب في 10 و 100.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'قبل أن تحسب، اسأل نفسك: ما العدد الأكبر في الوضعية؟', cta: 'أبدأ النشاط 1', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'معنى الجمع والطرح والكتابة العشرية متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم في النشاط 1 مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['jam-tarh-tabii'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['jam-tarh-tabii'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['jam-tarh-tabii'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-4', requires: ['darb-qisma-ashara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-5', requires: ['darb-qisma-ashara'] },
      ]}
    />
  );
}
