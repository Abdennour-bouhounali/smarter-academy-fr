import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';
import { FIG_PREP2 } from '../content/figures';

/**
 * Module 0 — أستعدّ. L'item 2 du manuel (p. 151, avec sa figure ; les items 1, 3, 4, 5 sont aux autres دروس de l'unité) et
 * six affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : le triangle rectangle isocèle (2),
 * l'image d'un point (p1) et d'un segment (p3) par un دوران et le sens direct (p2) — le درس précédent —, la médiatrice
 * (p4, pour le centre d'un دوران), le rectangle par ses diagonales (p5) et le milieu dans un repère (p6, l'exercice 17).
 * Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
 */
const FIG = { prep2: FIG_PREP2 };
const withFigure = (item) => (
  <span className="block space-y-1">
    <MathText>{item.text}</MathText>
    <SourceTag source={item.source} className="ms-2" />
    {item.figure && <GeoFigure {...FIG[item.figure]} inline />}
  </span>
);

export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="5 دقائق"
      brief={{
        tag: 'أستعدّ — الكتاب ص 151', title: 'سبع عبارات قبل الانطلاق', tone: 'teal',
        body: <p>عبارة من الكتاب وست من المنصّة عن المثلث القائم ومتساوي الساقين، وصورة نقطة وقطعة بدوران كما تعلّمتها في الدرس السابق، ومحور قطعة، والمستطيل، والمنتصف في معلم. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        muthallath: { label: 'المثلث القائم ومتساوي الساقين', emoji: '📐' },
        suratNuqta: { label: 'صورة نقطة بدوران', emoji: '🔄' },
        ittijah: { label: 'اتجاه الدوران', emoji: '🕒' },
        suratQita: { label: 'صورة قطعة بدوران', emoji: '📏' },
        mihwar: { label: 'محور قطعة', emoji: '⟂' },
        mustatil: { label: 'المستطيل وقطراه', emoji: '▭' },
        muntasaf: { label: 'المنتصف في معلم', emoji: '📍' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بورقة شفافة تديرها بيدك.', advice: 'راجع: صورة نقطة M بدوران مركزه O هي M′ حيث OM′ = OM والزاوية بينهما زاوية الدوران، والاتجاه المباشر عكس عقارب الساعة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: محور قطعة هو مجموعة النقط المتساوية البعد عن طرفيها — ستحتاجه لإيجاد مركز دوران.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'صورة نقطة وقطعة بدوران متحكَّم فيها.', advice: 'في المستوى المتقدّم أنزل نسخة [AC] على [BD] بنفسك، ثم ابحث عن مركز دوران مجهول.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), prompt: withFigure(PREP_ITEMS[0]), id: 'prep-2', requires: ['muthallath-qaim-mutasawi'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-p1', requires: ['surat-nuqta-dawaran'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-p2', requires: ['ittijah-dawaran'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-p3', requires: ['surat-qita-dawaran'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p4', requires: ['mihwar-qita'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p5', requires: ['mustatil-qutran'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-p6', requires: ['muntasaf-maalam'] },
      ]}
    />
  );
}
