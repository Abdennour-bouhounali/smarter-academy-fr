import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Le réseau n'a aucun lien « راجع » vers cette leçon (aucun item du programme ne la précède) :
 * la diagnose porte sur les acquis du primaire — mesurer une longueur en reportant une unité et ajouter des longueurs (items 1–2),
 * le polygone et ses côtés (3–4), le mot « محيط » (5, l'item 1 de « استحضر مكتسباتي » réécrit) et compter par rangées (6).
 * JAMAIS bloquant ; littéraux (audit).
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
        body: <p>قياس الأطوال، والمضلّعات، وكلمة المحيط، والعدّ بالصفوف. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        qiyas: { label: 'قياس الأطوال والمحيط', emoji: '📏' },
        mudalaa: { label: 'المضلّع وأضلاعه', emoji: '⬠' },
        adad: { label: 'العدّ بالصفوف', emoji: '🔢' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من بلاطات تنقلها بيدك.', advice: 'راجع قياس طول بوحدة، وأضلاع المضلّع، وطول خط مكسور.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ طول خط مكسور هو مجموع أطوال قطعه.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'قياس الأطوال والمضلّعات والعدّ بالصفوف متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['qiyas-atwal-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['qiyas-atwal-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['mudalaat-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['mudalaat-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['qiyas-atwal-ibtidai'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['safoof-ibtidai'] },
      ]}
    />
  );
}
