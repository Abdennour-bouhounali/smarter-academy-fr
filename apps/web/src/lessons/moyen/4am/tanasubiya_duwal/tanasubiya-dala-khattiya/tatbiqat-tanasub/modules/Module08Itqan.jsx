import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { QCM } from '../content/textbook';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : les items 7 et 8 de « أؤكّد تعلّماتي » (p. 74, extraction › qcm › duplicatedIn ›
 * tatbiqat-tanasub) et trois questions de la plateforme. L'item 7 a TROIS réponses justes dans le
 * livre : il devient un choix parmi des combinaisons (« (1) و (2) و (3) »), chaque autre
 * combinaison étant fausse (convention du banc, EXERCISE_CONTRACT unité 4). Chaque épreuve évalue
 * UN point d'apprentissage : P1 (E1, E3), P2 (E2, E5), P3 (E4). Chaque distracteur est faux
 * (« x − 10 », le taux pris seul, des pourcentages additionnés, ×3,6 au lieu de ÷3,6, d = t/v).
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        nisab: { label: 'النسب المئوية والدالة الخطية المرفقة', module: 1 },
        maqadir: { label: 'المقادير المركّبة ووحداتها', module: 2 },
        bidalala: { label: 'مقدار بدلالة مقدار آخر', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'nisab', requires: ['takhfid-darb', 'dala-murfaqa'],
          prompt: <Q source={QCM[8].source}><MathText>{QCM[8].text}</MathText></Q>,
          options: [M(QCM[8].options[0]), M(QCM[8].options[1]), M(QCM[8].options[2])],
          correct: 0, cols: 1,
          explain: <MathText>{QCM[8].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tatbiqat-tanasub_P1'] },
        },
        {
          id: 'E2', skill: 'maqadir', requires: ['miqdar-qisma', 'tahwil-murakkab'],
          prompt: (
            <Q source={QCM[7].source}>
              <MathText>{QCM[7].text}</MathText>{' '}
              <MathText>{`(1) ${QCM[7].options[0]} ، (2) ${QCM[7].options[1]} ، (3) ${QCM[7].options[2]}`}</MathText>
            </Q>
          ),
          options: [M('(3) فقط'), M('(1) و (3) فقط'), M('(2) و (3) فقط'), M('(1) و (2) و (3)')],
          correct: 3, cols: 2, keepOrder: true,
          explain: <MathText>{QCM[7].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tatbiqat-tanasub_P2'] },
        },
        {
          id: 'E3', skill: 'nisab', requires: ['tatabu-darb'],
          prompt: <Q source={PLATFORM}><MathText>{'سعر هاتف $20\\,000\\mathrm{DA}$ . ارتفع سعره بـ 10% ثم انخفض السعر الجديد بـ 10%. سعره الآن:'}</MathText></Q>,
          options: [M('$19\\,800\\mathrm{DA}$'), M('$20\\,000\\mathrm{DA}$'), M('$20\\,200\\mathrm{DA}$'), M('$18\\,000\\mathrm{DA}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$20\\,000 \\times 1{,}1 \\times 0{,}9 = 20\\,000 \\times 0{,}99 = 19\\,800$ : المضاعفان يُضربان ( $1{,}1 \\times 0{,}9 = 0{,}99$ )، فالنسبتان لا تُلغي إحداهما الأخرى. الانخفاض 10% يُحسب من $22\\,000$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tatbiqat-tanasub_P1'] },
        },
        {
          id: 'E4', skill: 'bidalala', requires: ['miqdar-bidalala'],
          prompt: <Q source={PLATFORM}><MathText>{'يسير قطار بسرعة متوسطة ثابتة $120km/h$ . المسافة $d$ (بالكيلومتر) بدلالة المدة $t$ (بالساعة)، والمسافة المقطوعة في $2{,}5h$ :'}</MathText></Q>,
          options: [M('$d = 120t$ ، و $300km$'), M('$d = \\dfrac{t}{120}$ ، و $\\dfrac{1}{48}km$'), M('$d = 120 + t$ ، و $122{,}5km$'), M('$d = 120t$ ، و $48km$')],
          correct: 0, cols: 1,
          explain: <MathText>{'من $v = \\dfrac{d}{t}$ ينتج $d = v \\times t = 120t$ ، دالة خطية للمدة؛ و $d = 120 \\times 2{,}5 = 300km$ . العدد $48$ هو $\\dfrac{120}{2{,}5}$ : قسمة في غير موضعها.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tatbiqat-tanasub_P3'] },
        },
        {
          id: 'E5', skill: 'maqadir', requires: ['miqdar-qisma', 'tahwil-murakkab'],
          prompt: <Q source={PLATFORM}><MathText>{'سرعة دراجة نارية $72km/h$ . سرعتها بالمتر في الثانية:'}</MathText></Q>,
          options: [M('$20m/s$'), M('$259{,}2m/s$'), M('$1{,}2m/s$'), M('$72\\,000m/s$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$72km = 72\\,000m$ في $1h = 3600s$ : $\\dfrac{72\\,000}{3600} = 20m/s$ . الضرب في 3,6 ( $259{,}2$ ) يحوّل في الاتجاه المعاكس، والقسمة على 60 ( $1{,}2$ ) تحوّل الساعة إلى دقائق فقط، و $72\\,000$ لم يُحوَّل مقامه.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tatbiqat-tanasub_P2'] },
        },
      ]}
      badges={[
        { id: 'nisab', emoji: '🏷️', label: 'نضرب ولا نضيف', test: (m) => (m.nisab ?? 0) === 0 },
        { id: 'maqadir', emoji: '⚖️', label: 'الوحدة في البسط والمقام', test: (m) => (m.maqadir ?? 0) === 0 },
        { id: 'bidalala', emoji: '🚆', label: 'مقدار بدلالة آخر', test: (m) => (m.bidalala ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت تطبيقات التناسبية',
        title: 'انتهى الدرس 4',
        message: 'تعرف الآن أنّ الزيادة والتخفيض بنسبة مئوية ضرب في مضاعف — دالة خطية — وأنّ التغيّرات المتتابعة تُضرب مضاعفاتها، وتحسب المقادير المركّبة (جداء أو حاصل قسمة) وتحوّل وحداتها، وتعبّر عن مقدار بدلالة مقدار آخر.',
        verbs: ['أضرب', 'أحوّل', 'أقسم', 'أعبّر', 'أتحقّق'],
        masterBadgeLabel: 'تطبيقات التناسبية',
      }}
    />
  );
}
