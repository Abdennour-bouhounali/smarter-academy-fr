import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme « على منوال » les examens du 2e trimestre, avec des nombres jamais vus dans la leçon (déclarées) ; chaque mauvaise option encode
 * une erreur réelle (MULTDIV : multiplier les deux nombres ; SUBFORM : les soustraire ; FLIP : diviser dans l'autre sens ; DIVDIVIDEND : diviser pour trouver un dividende ; ADDFORM : additionner ; RANK : la virgule déplacée ; SWAP et ROLE : les
 * rôles des deux nombres). Chaque option fausse est FAUSSE (recalculé dans content.test.js). Une الكفاءة principale par épreuve : E1, E2, E3 → P3 ; E4 → P2 ; E5 → P1.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={addition('exam_style_problem')} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;

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
        translate: { label: 'ترجمة وضعية بمعادلة', module: 3 },
        verify: { label: 'التحقّق من حلّ', module: 2 },
        solve: { label: 'حلّ معادلة', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'solve', requires: ['qasim-naqis'],
          prompt: <Q>حلّ المعادلة <MathText>{'$\\frac{56}{x}=7$'}</MathText> :</Q>,
          options: [M('$8$'), M('$392$'), M('$49$'), M('$0{,}125$')],
          correct: 0, cols: 2,
          explain: <MathText>{'القاسم الناقص: $x=56\\div7=8$ . ($392$ يضرب العددين؛ و $49$ يطرحهما؛ و $0{,}125$ يقسم في الاتجاه المعاكس: $7\\div56$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_hall-mushkil-muadala_P3'] },
        },
        {
          id: 'E2', skill: 'solve', requires: ['thalath-ashkal'],
          prompt: <Q>حلّ المعادلة <MathText>{'$2{,}5\\times x=10$'}</MathText> :</Q>,
          options: [M('$4$'), M('$25$'), M('$7{,}5$'), M('$0{,}25$')],
          correct: 0, cols: 2,
          explain: <MathText>{'العامل الناقص: $x=10\\div2{,}5=4$ . ($25$ يضرب العددين؛ و $7{,}5$ يطرحهما؛ و $0{,}25$ نقل الفاصلة في الناتج.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_hall-mushkil-muadala_P3'] },
        },
        {
          id: 'E3', skill: 'solve', requires: ['maqsum-naqis'],
          prompt: <Q>حلّ المعادلة <MathText>{'$\\frac{x}{0{,}4}=15$'}</MathText> :</Q>,
          options: [M('$6$'), M('$37{,}5$'), M('$15{,}4$'), M('$0{,}6$')],
          correct: 0, cols: 2,
          explain: <MathText>{'المقسوم الناقص: $x=0{,}4\\times15=6$ . ($37{,}5$ يقسم $15$ على $0{,}4$ ؛ و $15{,}4$ يجمع العددين؛ و $0{,}6$ نقل الفاصلة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_hall-mushkil-muadala_P3'] },
        },
        {
          id: 'E4', skill: 'verify', requires: ['ta3rif-muadala'],
          prompt: <Q>أيّ عدد حلّ للمعادلة <MathText>{'$\\frac{4{,}8}{x}=1{,}6$'}</MathText> ؟</Q>,
          options: [M('$3$'), M('$7{,}68$'), M('$0{,}3$'), M('$3{,}2$')],
          correct: 0, cols: 2,
          explain: <MathText>{'نُنجز العملية: $4{,}8\\div3=1{,}6$ ، فالعدد $3$ حلّ. ($7{,}68=4{,}8\\times1{,}6$ ؛ و $0{,}3$ نقل الفاصلة؛ و $3{,}2=4{,}8-1{,}6$ ، لكنّ $4{,}8\\div3{,}2=1{,}5$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_hall-mushkil-muadala_P2'] },
        },
        {
          id: 'E5', skill: 'translate', requires: ['tarjama-mushkil'],
          prompt: <Q>«<MathText>{'$24$'}</MathText> علبة متماثلة كتلتها الكلّية <MathText>{'$18\\,\\mathrm{kg}$'}</MathText> »: أيّ معادلة تترجم الوضعية إذا كانت كتلة العلبة <MathText>{'$x$'}</MathText> ؟</Q>,
          options: [M('$24\\times x=18$'), M('$18\\times x=24$'), M('$\\frac{x}{24}=18$'), M('$24+x=18$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$24$ علبة كتلة كلّ منها $x$ تزن $24\\times x$ ، وهي $18$ . ($18\\times x=24$ يبدّل العددين؛ و $\\frac{x}{24}=18$ يجعل الكتلة الكلّية حاصل قسمة؛ و $24+x=18$ يجمع.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_hall-mushkil-muadala_P1'] },
        },
      ]}
      badges={[
        { id: 'solve', emoji: '🧃', label: 'أحلّ معادلة', test: (m) => (m.solve ?? 0) === 0 },
        { id: 'translate', emoji: '✍️', label: 'أترجم وضعية', test: (m) => (m.translate ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حلّ المعادلات',
        title: 'انتهى درس حلّ مشكل باستعمال معادلة',
        message: 'تعرف الآن أن تترجم وضعية بمعادلة، وأن تجد العدد الناقص بالعملية العكسية، وأن تتحقّق من الحلّ. الدرس التالي: وضعية إدماجية في مفهوم المعادلة.',
        verbs: ['أترجم', 'أحلّ', 'أعكس', 'أتحقّق'],
        masterBadgeLabel: 'معادلة',
      }}
    />
  );
}
