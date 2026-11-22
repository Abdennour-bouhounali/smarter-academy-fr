import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import WordFraction from '../../../../../../common/components/WordFraction';
import { SourceTag } from '../../../../../../common/textbook';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';
import { FIG_PREP4, FIG_PREP6 } from '../content/figures';

/**
 * Module 0 — أستعدّ. Les items 1, 4 (trois affirmations), 5 et 6 (deux affirmations) du manuel (p. 115) et trois
 * affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك » : la somme des angles (1, 6-1),
 * l'hypoténuse (4-1), opposé / adjacent (4-2, 4-3), le cosinus de 3AM (5, 6-2), Pythagore (p1, p2), Thalès (p3 : la
 * preuve du نشاط 2). Les items 4 et 6 montrent la figure du manuel ; l'item 5 sa fraction en mots (WordFraction).
 * Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
 */
const FIG = { prep4: FIG_PREP4, prep6: FIG_PREP6 };
const withFigure = (item) => (
  <span className="block space-y-1">
    {item.wordFraction ? (
      <span className="block">في مثلث قائم، جيب تمام زاوية حادة يساوي: <WordFraction num={item.wordFraction.num} den={item.wordFraction.den} /></span>
    ) : <MathText>{item.text}</MathText>}
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
        tag: 'أستعدّ — الكتاب ص 115', title: 'عشر عبارات قبل الانطلاق', tone: 'teal',
        body: <p>سبع عبارات من الكتاب وثلاث من المنصّة عن زوايا المثلث، والوتر والضلعين المقابل والمجاور، وجيب التمام الذي عرفته في السنة الثالثة، وخاصيتي فيثاغورس وطالس. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        zawaya: { label: 'مجموع أقياس زوايا مثلث', emoji: '📐' },
        watar: { label: 'وتر المثلث القائم', emoji: '📏' },
        adlaa: { label: 'الضلعان المقابل والمجاور لزاوية حادة', emoji: '↔️' },
        cos: { label: 'جيب تمام زاوية حادة', emoji: '🧭' },
        fithaghuras: { label: 'خاصية فيثاغورس', emoji: '🔺' },
        talis: { label: 'خاصية طالس', emoji: '🔦' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بمنحدر تسمّي أضلاعه بيدك.', advice: 'راجع: الوتر يقابل الزاوية القائمة، والمجاور لزاوية حادة يمرّ برأسها، والمقابل لا يمرّ به.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: جيب التمام هو المجاور على الوتر، والمقابل والمجاور يتبادلان بين الزاويتين الحادتين.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الوتر والمقابل والمجاور وجيب التمام متحكَّم فيها.', advice: 'في المستوى المتقدّم ابنِ بنفسك منحدرات الزاوية 40° واحكم قبل أن تقرأ.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['majmu-zawaya'] },
        { ...prepQuestion(PREP_ITEMS[1]), prompt: withFigure(PREP_ITEMS[1]), id: 'prep-4-1', requires: ['watar'] },
        { ...prepQuestion(PREP_ITEMS[2]), prompt: withFigure(PREP_ITEMS[2]), id: 'prep-4-2', requires: ['muqabil-mujawir'] },
        { ...prepQuestion(PREP_ITEMS[3]), prompt: withFigure(PREP_ITEMS[3]), id: 'prep-4-3', requires: ['muqabil-mujawir'] },
        { ...prepQuestion(PREP_ITEMS[4]), prompt: withFigure(PREP_ITEMS[4]), id: 'prep-5', requires: ['jayb-tamam-3am'] },
        { ...prepQuestion(PREP_ITEMS[5]), prompt: withFigure(PREP_ITEMS[5]), id: 'prep-6-1', requires: ['majmu-zawaya'] },
        { ...prepQuestion(PREP_ITEMS[6]), prompt: withFigure(PREP_ITEMS[6]), id: 'prep-6-2', requires: ['jayb-tamam-3am'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-p1', requires: ['fithaghuras'] },
        { ...prepQuestion(PREP_ITEMS[8]), id: 'prep-p2', requires: ['fithaghuras'] },
        { ...prepQuestion(PREP_ITEMS[9]), id: 'prep-p3', requires: ['talis-wahda-9'] },
      ]}
    />
  );
}
