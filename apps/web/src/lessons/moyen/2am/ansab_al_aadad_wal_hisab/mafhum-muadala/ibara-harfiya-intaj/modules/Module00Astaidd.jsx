import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme sur ce que la leçon suppose (la leçon n'a AUCUN item du réseau : pas de « راجع قبل أن تنطلق »). Les chaînes d'opérations (items 1 à 3, unité 1 `silsila-bidun-aqwas` et
 * `silsila-bi-aqwas`), la dernière opération (item 4, `wasf-silsila-hisab`), la distributivité (item 5, `tawzi-darb-jam-tarh`) et « مجموع a و b » (item 6, 1AM `intaj-ibara-harfiya`, leçon PRÉVUE : sans lien). Diagnostic JAMAIS bloquant ;
 * `id` et `requires` littéraux.
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
        chain: { label: 'سلسلة عمليات بلا أقواس', emoji: '🔗' },
        brackets: { label: 'سلسلة عمليات بأقواس', emoji: '🧮' },
        last: { label: 'آخر عملية تُنجز', emoji: '✂️' },
        distributive: { label: 'الخاصية التوزيعية', emoji: '🧩' },
        oneLetter: { label: 'مجموع عددين بحرفين', emoji: '🔤' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بخلايا شمع نبنيها ونعدّ أعوادها.', advice: 'راجع درس « سلاسل عمليات بأقواس » من هذه السنة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'تذكّر دائمًا: الضرب قبل الجمع، والقوس أوّلًا.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'أولويات العمليات والخاصية التوزيعية متحكَّم فيهما.', advice: 'جرّب مباشرة بناء الخلايا.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['silsila-bidun-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['silsila-bi-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['silsila-bidun-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['wasf-silsila-hisab-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['tawzi-darb-jam-tarh-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['ibara-harfiya-1am'] },
      ]}
    />
  );
}
