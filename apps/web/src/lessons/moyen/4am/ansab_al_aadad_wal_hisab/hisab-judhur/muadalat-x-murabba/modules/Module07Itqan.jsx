import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { src } from '../../_unit/unitMeta';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la
 * leçon. Les cinq épreuves sont les items 4, 5, 6, 10 et 11 du QCM
 * « أؤكّد تعلّماتي » (p. 28) que l'extraction attribue à cette leçon, avec
 * leurs options au mot près (une seule bonne réponse chacune).
 *   P1 (nombre de solutions selon le signe de a) : items 4, 5, 6 ;
 *   P2 (équations qui se ramènent à x² = a)       : items 10, 11.
 */
const Q = ({ children, n }) => <span>{children} <SourceTag source={src('qcm', 28, 'أؤكّد تعلّماتي', n)} /></span>;
const O4 = ['تقبل حلين هما $-0{,}5$ و $0{,}5$', 'تقبل حلين هما $-5$ و 5', 'لا تقبل أي حل'];
const O5 = ['تقبل حلين هما $-1$ و 1', 'تقبل حلا واحدا هو 1', 'لا تقبل أي حل'];
const O6 = ['تقبل حلين هما $-3$ و 3', 'تقبل حلا واحدا هو 3', 'لا تقبل أي حل'];
const O10 = ['تقبل حلا واحدا هو $\\dfrac{7}{2}$', 'تقبل حلين هما $\\sqrt{7}$ و $-\\sqrt{7}$', 'تقبل حلا واحدا هو 14'];
const O11 = ['تقبل حلا واحدا هو 4', 'تقبل حلين هما $-4$ و 4', 'لا تقبل أي حل'];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;

export default function Module07Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة من «أؤكّد تعلّماتي»"
      estimatedTime="7 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        adad: { label: 'عدد الحلول حسب إشارة a', module: 2 },
        tawil: { label: 'معادلات تؤول إلى الشكل x² = a', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'adad', requires: ['hulul-x2-a'],
          prompt: <Q n={4}>المعادلة <MathText>{'$x^2 = 0{,}25$'}</MathText> ...</Q>,
          options: ['تقبل حلين هما $-0{,}5$ و $0{,}5$', 'تقبل حلين هما $-5$ و 5', 'لا تقبل أي حل'].map((o) => <MathText key={o}>{o}</MathText>),
          optionLabel: label(O4),
          correct: 0, cols: 1,
          explain: <span><MathText>{'$0{,}25 > 0$'}</MathText> و <MathText>{'$0{,}5^2 = (-0{,}5)^2 = 0{,}25$'}</MathText>؛ أما <MathText>{'$5^2 = 25$'}</MathText>.</span>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muadalat-x-murabba_P1'] },
        },
        {
          id: 'E2', skill: 'adad', requires: ['murabba-mutaakisayn', 'hulul-x2-a'],
          prompt: <Q n={5}>المعادلة <MathText>{'$x^2 = (-1)^2$'}</MathText> ...</Q>,
          options: ['تقبل حلين هما $-1$ و 1', 'تقبل حلا واحدا هو 1', 'لا تقبل أي حل'].map((o) => <MathText key={o}>{o}</MathText>),
          optionLabel: label(O5),
          correct: 0, cols: 1,
          explain: <span><MathText>{'$(-1)^2 = 1$'}</MathText>، فالمعادلة هي <MathText>{'$x^2 = 1$'}</MathText>: حلّان متعاكسان 1 و <MathText>{'$-1$'}</MathText>.</span>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muadalat-x-murabba_P1'] },
        },
        {
          id: 'E3', skill: 'adad', requires: ['murabba-mutaakisayn', 'hulul-x2-a'],
          prompt: <Q n={6}>المعادلة <MathText>{'$x^2 = -\\sqrt{3}$'}</MathText> ...</Q>,
          options: ['تقبل حلين هما $-3$ و 3', 'تقبل حلا واحدا هو 3', 'لا تقبل أي حل'].map((o) => <MathText key={o}>{o}</MathText>),
          optionLabel: label(O6),
          correct: 2, cols: 1,
          explain: <span><MathText>{'$-\\sqrt{3} < 0$'}</MathText>، ومربع أي عدد هو دائما عدد موجب.</span>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muadalat-x-murabba_P1'] },
        },
        {
          id: 'E4', skill: 'tawil', requires: ['tariqat-hall-x2'],
          prompt: <Q n={10}>المعادلة <MathText>{'$x^2 - 7 = 0$'}</MathText> ...</Q>,
          options: ['تقبل حلا واحدا هو $\\dfrac{7}{2}$', 'تقبل حلين هما $\\sqrt{7}$ و $-\\sqrt{7}$', 'تقبل حلا واحدا هو 14'].map((o) => <MathText key={o}>{o}</MathText>),
          optionLabel: label(O10),
          correct: 1, cols: 1,
          explain: <span><MathText>{'$x^2 - 7 = 0$'}</MathText> يعني <MathText>{'$x^2 = 7$'}</MathText>، و <MathText>{'$7 > 0$'}</MathText>.</span>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muadalat-x-murabba_P2'] },
        },
        {
          id: 'E5', skill: 'tawil', requires: ['tariqat-hall-x2'],
          prompt: <Q n={11}>المعادلة <MathText>{'$-x^2 - 16 = 0$'}</MathText> ...</Q>,
          options: ['تقبل حلا واحدا هو 4', 'تقبل حلين هما $-4$ و 4', 'لا تقبل أي حل'].map((o) => <MathText key={o}>{o}</MathText>),
          optionLabel: label(O11),
          correct: 2, cols: 1,
          explain: <span><MathText>{'$-x^2 - 16 = 0$'}</MathText> يعني <MathText>{'$x^2 = -16$'}</MathText>، و <MathText>{'$-16 < 0$'}</MathText>.</span>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muadalat-x-murabba_P2'] },
        },
      ]}
      badges={[
        { id: 'ishara', emoji: '±', label: 'إشارة a تقرّر', test: (m) => (m.adad ?? 0) === 0 },
        { id: 'tawil', emoji: '⚖️', label: 'أعزل x² ثم أحل', test: (m) => (m.tawil ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حل المعادلة من الشكل x² = a',
        title: 'انتهى الدرس 3',
        message: 'تعرف الآن كم حلا للمعادلة x² = a حسب إشارة a، وكيف تحل معادلة تؤول إليها. الدرس 4 يحسب جداء جذرين وحاصل قسمتهما.',
        verbs: ['أربط', 'أحدّد', 'أحلّ', 'أوظّف'],
        masterBadgeLabel: 'المعادلة x² = a',
      }}
    />
  );
}
