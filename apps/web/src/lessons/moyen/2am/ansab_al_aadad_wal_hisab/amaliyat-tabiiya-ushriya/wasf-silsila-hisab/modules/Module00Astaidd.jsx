import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Deux viennent de « أستعدّ » (p. 7, items 1 et 2, réécrits : un mot de vocabulaire et les facteurs) ; quatre de la plateforme mesurent le lien « راجع »
 * du réseau (LEARNING_NET.md §4.4) : `1am.m1.r05` (le vocabulaire مجموع / فرق / حدّا — leçon 1AM `mana-jam-tarh`, PUBLIÉE : le panneau « راجع قبل أن تنطلق » y renvoie), le mot « مقسوم » (la
 * division 1AM), l'ordre des opérations (`silsila-bidun-aqwas`, PUBLIÉE) et les parenthèses (`silsila-bi-aqwas`, PUBLIÉE). Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux.
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="7 دقائق"
      brief={{
        tag: 'أستعدّ', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>أسماء العمليات وحدودها (مجموع، فرق، جداء، مقسوم)، وأولوية العمليات، والأقواس. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        mufradat: { label: 'مجموع وفرق وحدّان', emoji: '➕' },
        awamil: { label: 'الجداء وعاملاه', emoji: '✖️' },
        maqsum: { label: 'المقسوم والقاسم', emoji: '➗' },
        priorite: { label: 'أولوية العمليات', emoji: '🥇' },
        aqwas: { label: 'الأقواس', emoji: '🧮' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بقصّ شريط بسيط على سبّورة القسم.', advice: 'راجع أسماء العمليات (مجموع، فرق، جداء، حاصل قسمة) وأولوية العمليات والأقواس.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى معاني الحدّ والعامل والمقسوم والقاسم.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'المفردات وأولوية العمليات والأقواس متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['mana-jam-tarh-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['darb-ashari-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-3', requires: ['mana-jam-tarh-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-4', requires: ['qisma-ashriya-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-5', requires: ['silsila-bidun-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-6', requires: ['silsila-bi-aqwas-2am'] },
      ]}
    />
  );
}
