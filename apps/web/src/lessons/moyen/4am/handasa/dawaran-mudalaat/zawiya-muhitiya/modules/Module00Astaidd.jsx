import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';
import { FIG_PREP4, FIG_PREP5 } from '../content/figures';

/**
 * Module 0 — أستعدّ. Les items 4 et 5 du manuel (p. 151 ; deux affirmations chacun, jugées séparément, avec la figure du
 * manuel) et quatre affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : le cercle circonscrit (4, 5),
 * la corde et le diamètre (p1), la somme des angles (p2), le triangle isocèle (p3) et le triangle inscrit dans un demi-cercle
 * (p4) — les trois derniers servent la preuve de مزيان au نشاط 4. Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux.
 */
const FIG = { prep4: FIG_PREP4, prep5: FIG_PREP5 };
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
      estimatedTime="6 دقائق"
      brief={{
        tag: 'أستعدّ — الكتاب ص 151', title: 'ثماني عبارات قبل الانطلاق', tone: 'teal',
        body: <p>أربع عبارات من الكتاب وأربع من المنصّة عن الدائرة المحيطة بمثلث، والوتر والقطر، ومجموع زوايا المثلث، والمثلث المتساوي الساقين والمثلث المرسوم في نصف دائرة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        muhita: { label: 'الدائرة المحيطة بمثلث', emoji: '⭕' },
        anasir: { label: 'عناصر الدائرة: الوتر والقطر', emoji: '📏' },
        majmu: { label: 'مجموع زوايا المثلث', emoji: '🔺' },
        saqayn: { label: 'المثلث المتساوي الساقين', emoji: '⟁' },
        qaim: { label: 'المثلث المرسوم في نصف دائرة', emoji: '◓' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بملعب كرة قدم تحرّك فيه الرامي بيدك.', advice: 'راجع: الدائرة المحيطة بمثلث تمر برؤوسه الثلاثة، ومجموع زوايا المثلث 180 درجة، وزاويتا قاعدة المثلث المتساوي الساقين متقايستان.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: المثلث المرسوم في نصف دائرة قائم في الرأس الذي يقابل القطر.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الدائرة والمثلثات متحكَّم فيها.', advice: 'في المستوى المتقدّم أثبت قول مزيان بنفسك: [AD] قطر.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), prompt: withFigure(PREP_ITEMS[0]), id: 'prep-4-1', requires: ['daira-muhita'] },
        { ...prepQuestion(PREP_ITEMS[1]), prompt: withFigure(PREP_ITEMS[1]), id: 'prep-4-2', requires: ['daira-muhita'] },
        { ...prepQuestion(PREP_ITEMS[2]), prompt: withFigure(PREP_ITEMS[2]), id: 'prep-5-1', requires: ['daira-muhita'] },
        { ...prepQuestion(PREP_ITEMS[3]), prompt: withFigure(PREP_ITEMS[3]), id: 'prep-5-2', requires: ['daira-muhita'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p1', requires: ['anasir-daira'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p2', requires: ['majmu-zawaya'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-p3', requires: ['mutasawi-saqayn'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-p4', requires: ['qaim-nisf-daira'] },
      ]}
    />
  );
}
