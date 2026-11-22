import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';
import { FIG_PREP3 } from '../content/figures';

/**
 * Module 0 — أستعدّ. Les items 3, 7 et 8 du manuel (p. 163 ; 1–2 sont au درس « الكرة والجلة », 4–6 au درس « مساحة الكرة وحجم
 * الجلة ») et trois affirmations de la plateforme sur les prérequis du propriétaire, dans la forme « أصحيح أم خاطئ؟ برّر
 * إجابتك » : Thalès (3, avec la figure du manuel), le cône (7), la pyramide (8), l'aire totale d'un pavé (p1), le rapport d'un
 * triangle agrandi (p2), la section d'une pyramide (p3). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux.
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
        tag: 'أستعدّ — الكتاب ص 163', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ثلاث عبارات من الكتاب وثلاث من المنصّة عن خاصية طالس، وحجم المخروط والهرم، والمساحة الكلية لمتوازي مستطيلات، ونسبة التكبير في المستوي، ومقطع الهرم. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        talis: { label: 'خاصية طالس', emoji: '📐' },
        makhrut: { label: 'حجم المخروط', emoji: '🍦' },
        haram: { label: 'حجم الهرم', emoji: '🔺' },
        masaha: { label: 'المساحة الكلية لمتوازي مستطيلات', emoji: '📦' },
        nisba: { label: 'نسبة التكبير في المستوي', emoji: '🔍' },
        maqta: { label: 'مقطع الهرم', emoji: '✂️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بمكعبات تبنيها بيدك في لعبة.', advice: 'راجع: حجم متوازي المستطيلات جداء أبعاده الثلاثة، ومساحة أوجهه الكلية ضعف مجموع مساحات ثلاثة أوجه مختلفة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه: في وضعية طالس النسب الثلاث متساوية، وفي التكبير كل الأطوال تُضرب في نفس العدد.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'طالس والحجوم والمساحات متحكَّم فيها.', advice: 'في المستوى المتقدّم ستتوقّع حجما عشريا قبل أن ترى المكعبات.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), prompt: withFigure(PREP_ITEMS[0]), id: 'prep-3', requires: ['talis-nisab'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-7', requires: ['hajm-makhrut'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-8', requires: ['hajm-haram'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-p1', requires: ['masaha-kulliya'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-p2', requires: ['nisbat-takbir-mustawi'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p3', requires: ['maqta-haram'] },
      ]}
    />
  );
}
