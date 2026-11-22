import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme sur les items du réseau que la leçon suppose (LEARNING_NET.md §4.4) : `1am.m5.r03` (items 1 et 2 : le produit de fractions décimales — leçon PUBLIÉE
 * `kusur-ashriya-kitaba`, le panneau « راجع قبل أن تنطلق » la lie), le quotient (item 3, 1AM `hasil-qisma-kasr` publiée), l'aire d'un rectangle (item 4), « كسر من عدد » (item 5, leçon PRÉVUE de 1AM : sans lien)
 * et « الباقي » (item 6, `jam-tarh-kusur` publiée). Chaque item de révision est MESURÉ. Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>ست عبارات. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        decimal: { label: 'ضرب الكسور العشرية', emoji: '✖️' },
        quotient: { label: 'الكسر حاصل قسمة', emoji: '➗' },
        area: { label: 'مساحة المستطيل', emoji: '📐' },
        ofNumber: { label: 'كسر من عدد', emoji: '🔢' },
        rest: { label: 'الباقي من الكلّ', emoji: '🧩' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بستارتين على نافذة نسحبهما ونعدّ مربّعاتهما.', advice: 'راجع درس « كتابة الكسور العشرية » من السنة الأولى أسفله.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'تذكّر دائمًا: مساحة المستطيل هي الطول × العرض.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'ضرب الكسور العشرية ومساحة المستطيل متحكَّم فيهما.', advice: 'جرّب مباشرة نافذة القسم.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['kusur-ashriya-darb-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['kusur-ashriya-darb-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['kasr-hasil-qisma-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['misahat-mustatil'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['akhdh-kasr-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['jam-tarh-kusur-2am'] },
      ]}
    />
  );
}
