import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : sept affirmations. Deux viennent de « أستعدّ » (p. 71, items 7 et 8, réécrits : l'ordre de deux relatifs) ; cinq de la plateforme
 * mesurent les liens « راجع » du réseau (LEARNING_NET.md §4.4) : `2am.m4.r09` (اختبار صحة متباينة بقيمة — ikhtibar-musawat), `3am.m1.r01` (جداء عددين
 * نسبيين — jidaa-nisbi) et la leçon sœur publiée `musawiyat-amaliyat` (une opération sur les deux membres d'une égalité). `muqarana-nisbiya` (2AM) n'a pas de
 * lien du réseau vers cet item. JAMAIS bloquant ; `id` et `requires` littéraux.
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
        tag: 'أستعدّ', title: 'سبع عبارات قبل الانطلاق', tone: 'teal',
        body: <p>اختبار متباينة بتعويض قيمة، وجداء أعداد نسبية، وترتيب عددين سالبين، وعملية على طرفي مساواة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        ikhtibar: { label: 'اختبار متباينة بقيمة', emoji: '✅' },
        jidaa: { label: 'جداء أعداد نسبية', emoji: '✖️' },
        tartib: { label: 'ترتيب عددين نسبيين', emoji: '↔️' },
        musawiya: { label: 'العملية على طرفي مساواة', emoji: '⚖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بخيطين تحرّكهما بيدك.', advice: 'راجع ترتيب العددين السالبين وقاعدة الإشارات في الجداء.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الأعداد السالبة عند التعويض وعند الترتيب.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'التعويض والجداء والترتيب متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['ikhtibar-musawat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['ikhtibar-musawat'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['jidaa-nisbi'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['jidaa-nisbi'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-5', requires: ['muqarana-nisbiya-2am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-6', requires: ['muqarana-nisbiya-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-7', requires: ['musawiyat-amaliyat-3am'] },
      ]}
    />
  );
}
