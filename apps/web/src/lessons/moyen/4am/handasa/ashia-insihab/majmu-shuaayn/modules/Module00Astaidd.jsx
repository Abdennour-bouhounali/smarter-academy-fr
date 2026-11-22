import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items « أستعدّ » du manuel (p. 127) vont aux leçons 1 et 2 : six affirmations de la plateforme,
 * dans la forme « أصحيح أم خاطئ؟ برّر إجابتك », une par acquis déclaré (`priorKnowledge`) — l'image par une translation
 * (MM′ et non M′M), منحى / اتجاه / طول, vecteurs égaux ⇔ parallélogramme (l'ordre des lettres), le milieu et le symétrique,
 * Pythagore (la longueur d'une diagonale), le sinus de l'unité 10 (le تحدّ). Aucun nombre de ce qui suit (4 ; 2 km/h, le
 * quadrillage de نشاط 3). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="5 دقائق"
      brief={{
        tag: 'أستعدّ', title: 'ست عبارات قبل أن نجمع شعاعين', tone: 'teal',
        body: <p>عبارات من المنصّة عن الانسحاب والشعاع ومتوازي الأضلاع والمثلث القائم. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        sura: { label: 'صورة نقطة بانسحاب', emoji: '➡️' },
        anasir: { label: 'المنحى والاتجاه والطول', emoji: '🧭' },
        tasawi: { label: 'تساوي شعاعين ومتوازي الأضلاع', emoji: '▱' },
        muntasaf: { label: 'المنتصف والنظيرة', emoji: '⚖️' },
        fithaghuras: { label: 'خاصية فيثاغورس', emoji: '📐' },
        jayb: { label: 'جيب زاوية حادة', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بمختبر تحرّكه بيدك.', advice: 'راجع الدرسين 1 و 2 من الوحدة: صورة نقطة بانسحاب، وتساوي شعاعين ومتوازي الأضلاع.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى ترتيب الحروف: الشعاع يذهب من مبدئه إلى نهايته.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الانسحاب ومتوازي الأضلاع متحكَّم فيهما.', advice: 'في المستوى المتقدّم لا شيء مقترح: أنت من يدير سرعة السبّاح.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['surat-insihab'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['anasir-shuaa'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['tasawi-mutawazi'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['muntasaf-nazira'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['fithaghuras'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['jayb'] },
      ]}
    />
  );
}
