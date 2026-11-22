import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le manuel n'a aucun item « أستعدّ » pour cette leçon (extraction › destinationRationale › prep) : six
 * affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك », sur les المكتسبات القبلية du propriétaire et la
 * leçon « الكرة والجلة » : Pythagore (p1, le calcul de tout rayon de section), le pavé droit (p2), le cylindre de révolution
 * (p3), la diagonale d'un carré (p4, EG = 3√2 du نشاط 5), la sphère OM = R (p5), Thalès (p6, la réduction de la pyramide).
 * Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux.
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>عن خاصية فيثاغورس، والبلاطة القائمة، وأسطوانة الدوران، وقطر المربع، والكرة، وخاصية طالس: كل ما ستحتاجه لتقطع المجسمات بمستو. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        fithaghuras: { label: 'خاصية فيثاغورس', emoji: '📐' },
        balata: { label: 'البلاطة القائمة', emoji: '🧱' },
        ustuwana: { label: 'أسطوانة الدوران', emoji: '🥫' },
        qutr: { label: 'قطر المربع', emoji: '◇' },
        kura: { label: 'الكرة', emoji: '⚽' },
        talis: { label: 'خاصية طالس', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بطابعة تطبع الطبقات أمامك.', advice: 'راجع خاصية فيثاغورس: في مثلث قائم مربع الوتر يساوي مجموع مربعي الضلعين الآخرين، فنطرح لنجد ضلعا.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: نقط الكرة تبعد عن مركزها بنصف القطر تماما، وقطر مربع ضلعه a هو a√2.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'فيثاغورس والمجسمات المألوفة وطالس متحكَّم فيها.', advice: 'في المستوى المتقدّم ستتوقّع مقاطع بأنصاف أقطار جذرية دون علامات مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-p1', requires: ['fithaghuras'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-p2', requires: ['balata-qaima'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-p3', requires: ['ustuwana-dawaran'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-p4', requires: ['qutr-murabba'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p5', requires: ['kura-markaz'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p6', requires: ['talis-nisab'] },
      ]}
    />
  );
}
