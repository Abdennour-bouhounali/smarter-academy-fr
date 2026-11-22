import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Quatre viennent de « أستعدّ » (p. 39, items 8 à 12, réécrits) ; deux de la plateforme mesurent les liens « راجع » du
 * réseau (LEARNING_NET.md §4.4) : le symétrique axial (1AM) et la graduation décimale d'une droite (`2am.m4.r01`, publiée). `1am.m5.r07` (leçon 1AM non publiée) n'est jamais
 * reconstruite ici : items 1 à 3. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>ترتيب الإحداثيين، النقطة على أحد المحورين، التناظر بالنسبة إلى محور، والتدريجة العشرية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        tartib: { label: 'ترتيب الإحداثيين', emoji: '🔢' },
        mihwar: { label: 'النقطة على محور', emoji: '📍' },
        istiqama: { label: 'النقط على استقامة', emoji: '📐' },
        nazir: { label: 'التناظر المحوري', emoji: '🪞' },
        faasila: { label: 'التدريجة العشرية', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بوتد تحرّكه بيدك.', advice: 'راجع الفاصلة والترتيب والنقاط على المحورين.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى ترتيب الإحداثيين وإلى الإحداثية المعدومة.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الإحداثيان والمحوران والتناظر متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['ihdathiyat-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['ihdathiyat-1am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['ihdathiyat-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-4', requires: ['tanazur-mihwari-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-5', requires: ['faasila-2am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-6', requires: ['ihdathiyat-1am'] },
      ]}
    />
  );
}
