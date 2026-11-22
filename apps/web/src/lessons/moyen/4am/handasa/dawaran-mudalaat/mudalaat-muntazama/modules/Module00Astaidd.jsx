import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';
import { FIG_PREP1 } from '../content/figures';

/**
 * Module 0 — أستعدّ. L'item 1 du manuel (p. 151 : le triangle équilatéral reconnu par ses angles, avec sa figure) et
 * quatre affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : le triangle isocèle (la طريقة
 * de l'angle 108°), l'image d'un point par une rotation (درس 1), l'angle inscrit et l'angle au centre (درس 3), le sinus
 * dans un triangle rectangle (unité 10, le rayon de l'étoile). Diagnostic JAMAIS bloquant ; `id` et `requires`
 * restent littéraux (audit).
 */
const FIG = { prep1: FIG_PREP1 };
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
        tag: 'أستعدّ — الكتاب ص 151', title: 'خمس عبارات قبل الانطلاق', tone: 'teal',
        body: <p>عبارة من الكتاب وأربع من المنصّة عن زوايا المثلث، والمثلث المتساوي الساقين، وصورة نقطة بدوران، والزاوية المحيطية والمركزية، والجيب في المثلث القائم. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        zawaya: { label: 'زوايا المثلث المتقايس الأضلاع', emoji: '🔺' },
        saqayn: { label: 'المثلث المتساوي الساقين', emoji: '📐' },
        dawaran: { label: 'صورة نقطة بدوران', emoji: '🔄' },
        muhitiya: { label: 'الزاوية المحيطية والمركزية', emoji: '⭕' },
        nisab: { label: 'الجيب في المثلث القائم', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بورشة تدير فيها رأسا حول مركز بيدك.', advice: 'راجع: مجموع زوايا المثلث 180 درجة، زاويتا قاعدة المثلث المتساوي الساقين متقايستان، والزاوية المحيطية نصف الزاوية المركزية التي تحصر معها نفس القوس.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: الزاوية المركزية ضعف الزاوية المحيطية، لا نصفها.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الزوايا والدوران والجيب متحكَّم فيها.', advice: 'في المستوى المتقدّم ارسم نجمة العلم بنفسك: الزاوية، ثم نصف القطر، ثم الفروع.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), prompt: withFigure(PREP_ITEMS[0]), id: 'prep-1', requires: ['majmu-zawaya-muthallath'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-p1', requires: ['mutasawi-saqayn'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-p2', requires: ['surat-nuqta-dawaran'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-p3', requires: ['muhitiya-markaziya'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p4', requires: ['nisab-muthallathiya'] },
      ]}
    />
  );
}
