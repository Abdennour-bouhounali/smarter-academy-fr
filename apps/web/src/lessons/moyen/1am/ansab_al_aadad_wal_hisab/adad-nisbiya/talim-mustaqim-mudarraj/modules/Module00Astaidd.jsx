import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Les deux acquis de l'année les plus proches de la leçon (`1am.m5.r04` : lire une abscisse décimale sur une demi-droite graduée,
 * items 1–3 ; `1am.m5.r05` : le relatif négatif, sa distance à zéro, son opposé, items 4–6) — les deux prérequis de l'item dans le réseau. JAMAIS bloquant ; littéraux (audit).
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
        body: <p><MathText>{'قراءة فاصلة نقطة على نصف مستقيم مدرّج، والعدد السالب ومسافته إلى الصفر ومعاكسه. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن نمشي على طريق القرية.'}</MathText></p>,
      }}
      skills={{
        khat: { label: 'قراءة فاصلة على نصف مستقيم مدرّج', emoji: '📏' },
        nisbi: { label: 'العدد السالب ومسافته ومعاكسه', emoji: '🌡️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ من طريق لا يُكتب عليها إلا الصفر.', advice: 'راجع قراءة فاصلة على نصف مستقيم مدرّج، ثمّ العدد السالب ومعاكسه.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى أنّ المسافة لا تكون سالبة وأنّ الإشارة تقول الجهة.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'قراءة الفاصلة والعدد السالب متحكَّم فيهما.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['faasila-nisf-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['faasila-nisf-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['faasila-nisf-mustaqim-1am'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['adad-nisbi-1am'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['adad-nisbi-1am'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['adad-nisbi-1am'] },
      ]}
    />
  );
}
