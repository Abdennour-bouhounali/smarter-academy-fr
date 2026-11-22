import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : « استحضر مكتسباتي » (p. 52), items 1, 2 (écriture décimale ↔ fraction décimale) et 9 (fraction
 * partie d'un tout), et trois affirmations de la plateforme sur les items du réseau `1am.m1.r02` et `1am.m3.r02` (قواعد
 * قابلية القسمة, la leçon publiée de l'unité 3). JAMAIS bloquant ; littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="8 دقائق"
      brief={{
        tag: 'استحضر مكتسباتي — الكتاب ص 52', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ثلاث عبارات من الكتاب وثلاث من المنصّة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        ashri: { label: 'الكتابة العشرية والكسر العشري', emoji: '🔢' },
        juz: { label: 'الكسر جزء من الوحدة', emoji: '🍰' },
        qabiliya: { label: 'قواعد قابلية القسمة', emoji: '🔎' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من صينية مقطّعة إلى 5 قطع.', advice: 'راجع الأعشار والأجزاء من المئة، وقواعد قابلية القسمة على 3 و 9.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'تذكّر: رقمان بعد الفاصلة يعني أجزاء من المئة.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الكسور والكتابة العشرية وقواعد قابلية القسمة متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم (مستطيلات الكتاب وهديّة الجدّ) مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['kitaba-ashriya-kasriya'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['kitaba-ashriya-kasriya'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['kasr-juz-ibtidai'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-4', requires: ['kitaba-ashriya-kasriya'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-5', requires: ['qawaid-qabiliyat-qisma'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-6', requires: ['qawaid-qabiliyat-qisma'] },
      ]}
    />
  );
}
