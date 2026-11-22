import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le manuel n'a aucun item « أستعدّ » pour cette leçon (les items 1–6 vont aux leçons 1 et 2) :
 * sept affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك », une par acquis déclaré
 * (`priorKnowledge`) — les deux équations a/x = b et x/a = b (où l'inconnue se trouve après le choix du rapport), les
 * angles aigus complémentaires, vertical ⟂ horizontal, une définition de la leçon 1, la calculatrice (leçon 2) et
 * Pythagore. Aucun nombre de l'activité qui suit (1,60 ; 59° ; 24 m). Diagnostic JAMAIS bloquant ; `id` et
 * `requires` restent littéraux (audit).
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
        tag: 'أستعدّ', title: 'سبع عبارات قبل أن نحمل الهاتف', tone: 'teal',
        body: <p>عبارات من المنصّة عن المعادلات البسيطة والمثلث القائم والنسب المثلثية والحاسبة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        maqam: { label: 'معادلة مجهولها في المقام', emoji: '➗' },
        bast: { label: 'معادلة مجهولها في البسط', emoji: '✖️' },
        hadatan: { label: 'الزاويتان الحادتان في مثلث قائم', emoji: '📐' },
        shaquli: { label: 'الشاقولي والأفقي', emoji: '🧱' },
        nisab: { label: 'النسب المثلثية في مثلث قائم', emoji: '📏' },
        hasiba: { label: 'الحاسبة وقيس زاوية', emoji: '🧮' },
        fithaghuris: { label: 'خاصية فيثاغورس', emoji: '🔺' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بمختبر تحرّكه بيدك.', advice: 'راجع تعريف الجيب وجيب التمام والظل (الدرس 1)، وكيف نحلّ معادلة مجهولها في المقام.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: المقابل والمجاور يُسمَّيان بالنسبة إلى الزاوية المعلومة، والوتر يقابل الزاوية القائمة.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'النسب المثلثية والمعادلات متحكَّم فيها.', advice: 'في المستوى المتقدّم لا تُكتب أسماء الأضلاع على الشكل: سمّها بنفسك.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['muadala-majhul-maqam'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['muadala-majhul-bast'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['zawiyatan-hadatan'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['shaquli-ufuqi'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['tarif-nisab'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['hasiba'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['fithaghuris'] },
      ]}
    />
  );
}
