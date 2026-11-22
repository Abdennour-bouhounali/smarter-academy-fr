import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';
import { FIG_PREP3 } from '../content/figures';

/**
 * Module 0 — أستعدّ. L'item 3 du manuel (p. 151 ; les items 1–2 et 4–5 sont aux دروس « المضلعات المنتظمة » et « الزاوية
 * المحيطية ») et cinq affirmations de la plateforme sur les prérequis du propriétaire, dans la forme « أصحيح أم خاطئ؟ برّر
 * إجابتك » : les angles supplémentaires (3, avec la figure du manuel), la symétrie axiale (p1), la symétrie centrale (p2),
 * la translation (p3), le compas (p4), la منقلة (p5). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux.
 */
const FIG = { prep3: FIG_PREP3 };
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
        tag: 'أستعدّ — الكتاب ص 151', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>عبارة من الكتاب وخمس من المنصّة عن الزوايا، والتحويلات التي تعرفها (التناظران والانسحاب)، والمدور والمنقلة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        zawaya: { label: 'الزاويتان المتكاملتان', emoji: '📐' },
        mihwari: { label: 'التناظر المحوري', emoji: '🪞' },
        markazi: { label: 'التناظر المركزي', emoji: '🔄' },
        insihab: { label: 'الانسحاب', emoji: '➡️' },
        mudawwar: { label: 'المدور والدائرة', emoji: '⭕' },
        minqala: { label: 'المنقلة', emoji: '📏' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بعجلة دوّارة تحرّكها بيدك.', advice: 'راجع: الدائرة نقط على نفس البعد من مركزها، ونقيس الزاوية بوضع مركز المنقلة على رأسها.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: في التناظر المركزي، المركز هو منتصف القطعة بين النقطة وصورتها.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الزوايا والتحويلات والأدوات متحكَّم فيها.', advice: 'في المستوى المتقدّم ستبني الصور بالمدور والمنقلة دون مؤشرات.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), prompt: withFigure(PREP_ITEMS[0]), id: 'prep-3', requires: ['zawaya-mutakamila'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-p1', requires: ['tanazur-mihwari'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-p2', requires: ['tanazur-markazi'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-p3', requires: ['insihab'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p4', requires: ['mudawwar'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p5', requires: ['minqala'] },
      ]}
    />
  );
}
