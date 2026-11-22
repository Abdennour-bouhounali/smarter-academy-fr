import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations qui mesurent les DEUX liens « راجع » du réseau (`reviewLinksForLesson`) : la distributivité de 2AM
 * (items 1–2, `tawzi-darb-jam-tarh`, item 2am.m1.r03) et le calcul rationnel de 3AM (items 3–4, `amaliyat-natiqa`, item 3am.m1.r08), plus
 * l'écriture littérale (items 5–6, « أستعدّ » 5 et 8 du manuel réécrits). Ces deux leçons ne sont pas encore publiées : le panneau
 * « راجع قبل أن تنطلق » (automatique) les nomme. JAMAIS bloquant ; littéraux (audit).
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
        body: <p>توزيع الضرب على الجمع، والحساب على الأعداد النسبية، والكتابة بالحروف. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        tawzi: { label: 'توزيع الضرب على الجمع', emoji: '✖️' },
        natiqa: { label: 'الحساب على الأعداد النسبية', emoji: '➖' },
        harf: { label: 'الكتابة بالحروف', emoji: '🔤' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من قطع خشبية ترتّبها بيدك.', advice: 'راجع توزيع الضرب على الجمع، وقاعدة إشارة الجداء، وأنّ جمع الحرف نفسه ثلاث مرّات يعطي ثلاثة أمثاله.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى طرح عدد سالب: هو جمع لمعاكسه.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التوزيع والحساب النسبي والكتابة بالحروف متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['tawzi-darb-jam-tarh'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['tawzi-darb-jam-tarh'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['amaliyat-natiqa'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['amaliyat-natiqa'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['tabir-harfi'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['tabir-harfi'] },
      ]}
    />
  );
}
