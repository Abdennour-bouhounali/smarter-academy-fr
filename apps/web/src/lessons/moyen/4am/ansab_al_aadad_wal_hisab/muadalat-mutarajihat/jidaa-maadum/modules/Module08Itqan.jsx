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
 * Cinq épreuves : les items 3 et 4 de « أؤكّد تعلّماتي » (destinations ›
 * qcm › duplicatedIn), RÉÉCRITS en nombres de la plateforme (verdict X1 : `id`, skill et learningPointIds inchangés) et trois énoncés de la plateforme, un par point non couvert :
 * reconnaître une معادلة جداء معدوم (P1), le facteur constant (P2), x² = 3x (P3).
 * Chaque épreuve évalue UN point d'apprentissage ; P1, P2, P3 sont couverts. Chaque
 * distracteur est faux.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
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
        taarif: { label: 'التعرّف على معادلة جداء معدوم', module: 2 },
        khassiya: { label: 'خاصية الجداء المعدوم', module: 1 },
        tahlil: { label: 'التحليل ثم الحل', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'taarif', requires: ['taarif-muadala-jidaa'],
          prompt: <Q source={addition('interaction_generation')}>أيّ معادلة مما يلي هي معادلة جداء معدوم؟</Q>,
          options: [M('$(2x - 1) + (x + 4) = 0$'), M('$(2x - 1)(x + 4) = 3$'), M('$(2x - 1)(x + 4) = 0$')],
          correct: 2, cols: 1,
          explain: <MathText>{'معادلة جداء معدوم: جداء عاملين من الدرجة الأولى يساوي 0. الأولى مجموع، والثانية طرفها الثاني 3.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_jidaa-maadum_P1'] },
        },
        {
          id: 'E2', skill: 'khassiya', requires: ['hulul-muadala-jidaa'],
          prompt: <Q source={QCM[3].source}><MathText>{QCM[3].text}</MathText></Q>,
          options: [M('حلًّا واحدًا هو $5$'), M('حلًّا واحدًا هو $-2$'), M('حلّين هما $5$ و $-2$')],
          correct: 2, cols: 1,
          explain: <MathText>{QCM[3].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_jidaa-maadum_P2'] },
        },
        {
          id: 'E3', skill: 'khassiya', requires: ['hulul-muadala-jidaa'],
          prompt: <Q source={addition('interaction_generation')}>حلول المعادلة <MathText>{'$-5(x + 4) = 0$'}</MathText> هي ........</Q>,
          options: [M('$-4$'), M('$4$'), M('$-5$ و $-4$'), M('$0$')],
          correct: 0, cols: 2,
          explain: <MathText>{'بما أنّ $-5 \\neq 0$ فإنّ $x + 4 = 0$ ، أي $x = -4$ : حلّ واحد. العامل الثابت $-5$ لا ينعدم.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_jidaa-maadum_P2'] },
        },
        {
          id: 'E4', skill: 'tahlil', requires: ['tariqat-jidaa-maadum'],
          prompt: <Q source={QCM[4].source}><MathText>{QCM[4].text}</MathText></Q>,
          options: [M('حلّين هما $\\dfrac{5}{2}$ و $-\\dfrac{5}{2}$'), M('حلًّا واحدًا هو $\\dfrac{5}{2}$'), M('حلّين هما $\\dfrac{5}{4}$ و $-\\dfrac{5}{4}$')],
          correct: 0, cols: 1,
          explain: <MathText>{QCM[4].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_jidaa-maadum_P3'] },
        },
        {
          id: 'E5', skill: 'tahlil', requires: ['tariqat-jidaa-maadum'],
          prompt: <Q source={addition('interaction_generation')}>حلول المعادلة <MathText>{'$x^2 = 3x$'}</MathText> هي ........</Q>,
          options: [M('$3$ فقط'), M('$0$ و $3$'), M('$-3$ و $3$'), M('$0$ فقط')],
          correct: 1, cols: 2,
          explain: <MathText>{'$x^2 = 3x$ يعني $x^2 - 3x = 0$ أي $x(x - 3) = 0$ ، إذن $x = 0$ أو $x = 3$ . القسمة على $x$ تُضيّع الحل 0.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_jidaa-maadum_P3'] },
        },
      ]}
      badges={[
        { id: 'khassiya', emoji: '⚽', label: 'الملعب الذي يختفي', test: (m) => (m.khassiya ?? 0) === 0 },
        { id: 'tahlil', emoji: '🧩', label: 'نحلّل ثم نحلّ', test: (m) => (m.tahlil ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت معادلات الجداء المعدوم',
        title: 'انتهى الدرس 2',
        message: 'تعرف الآن كيف تحلّ معادلة جداء معدوم بخاصية الجداء المعدوم، وكيف تصل إليها بالتحليل.',
        verbs: ['أتعرّف', 'أطبّق', 'أحلّل', 'أحلّ'],
        masterBadgeLabel: 'معادلات جداء معدوم',
      }}
    />
  );
}
