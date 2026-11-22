import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Deux viennent de « أستعدّ » (p. 7, items 8 et 10, réécrits) ; quatre de la plateforme mesurent le lien « راجع » du réseau (LEARNING_NET.md §4.4) :
 * `1am.m1.r05` (جمع، طرح وضرب أعداد عشرية في وضعية — leçon 1AM `mana-jam-tarh`, PUBLIÉE : le panneau « راجع قبل أن تنطلق » y renvoie) et l'ordre des opérations de la leçon précédente de l'unité
 * (`silsila-bidun-aqwas`, PUBLIÉE), puis la curiosité qui ouvre la leçon. Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux.
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
        body: <p>أولوية العمليات في سلسلة، والقسمة والكسر، وضرب الأعداد العشرية في وضعية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        qisma: { label: 'قسمة قطعة إلى قطع متقايسة', emoji: '📏' },
        kasr: { label: 'الكسر قسمة', emoji: '➗' },
        priorite: { label: 'أولوية العمليات', emoji: '🥇' },
        darb: { label: 'ضرب عدد عشري', emoji: '✖️' },
        jadid: { label: 'تغيير ترتيب الحساب', emoji: '🧮' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ عند منضدة التعاونية بحساب بسيط على الآلة.', advice: 'راجع درس سلسلة العمليات دون أقواس: الضرب والقسمة قبل الجمع والطرح.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ الكسر قسمة بسطه على مقامه.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'أولوية العمليات والقسمة متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['silsila-bidun-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['silsila-bidun-aqwas-2am'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-3', requires: ['mana-jam-tarh-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-4', requires: ['darb-ashari-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-5', requires: ['mana-jam-tarh-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-6', requires: ['silsila-bidun-aqwas-2am'] },
      ]}
    />
  );
}
