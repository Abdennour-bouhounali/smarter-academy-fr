import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';
import { FIG_PREP3, FIG_PREP4 } from '../content/figures';

/**
 * Module 0 — أستعدّ. Les items 3, 4 et 7 (deux affirmations) du manuel (p. 127) et deux affirmations de la plateforme
 * sur le درس 1, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : la symétrie centrale (3, 7-2), le milieu sur une droite
 * (4), les diagonales du متوازي أضلاع (7-1), l'égalité de deux vecteurs (p1) et AB = DC ⇔ متوازي أضلاع (p2).
 * Les items 3 et 4 montrent la figure du manuel. Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux.
 */
const FIG = { prep3: FIG_PREP3, prep4: FIG_PREP4 };
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
        tag: 'أستعدّ — الكتاب ص 127', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>أربع عبارات من الكتاب واثنتان من المنصّة عن التناظر المركزي، ومنتصف قطعة، وقطري متوازي الأضلاع، وتساوي شعاعين الذي تعلّمته في الدرس السابق. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        tanazur: { label: 'التناظر المركزي', emoji: '🔄' },
        muntasaf: { label: 'منتصف قطعة على مستقيم', emoji: '📏' },
        qutr: { label: 'قطرا متوازي الأضلاع', emoji: '▱' },
        tasawi: { label: 'تساوي شعاعين', emoji: '➡️' },
        mutawazi: { label: 'متوازي الأضلاع وتساوي شعاعين', emoji: '🧩' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بوشاح وراية تحرّكهما بيدك.', advice: 'راجع: قطرا متوازي الأضلاع متناصفان، وشعاعان متساويان لهما نفس المنحى ونفس الاتجاه ونفس الطول.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: تساوي الطولين وحده لا يجعل شعاعين متساويين، وترتيب الحروف مهم.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'المنتصف والتناظر المركزي وتساوي شعاعين متحكَّم فيها.', advice: 'في المستوى المتقدّم ضع ركن الراية بنفسك دون سهم جاهز.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), prompt: withFigure(PREP_ITEMS[0]), id: 'prep-3', requires: ['tanazur-markazi'] },
        { ...prepQuestion(PREP_ITEMS[1]), prompt: withFigure(PREP_ITEMS[1]), id: 'prep-4', requires: ['muntasaf-qita'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-7-1', requires: ['qutr-mutawazi'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-7-2', requires: ['tanazur-markazi'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p1', requires: ['tasawi-shuaayn'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p2', requires: ['shuaa-mutawazi'] },
      ]}
    />
  );
}
