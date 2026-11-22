import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import AffineFigure from '../components/AffineFigure';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Le manuel fourni n'a pas de
 * « أؤكّد تعلّماتي » : cinq épreuves de la plateforme, chacune sur UN point d'apprentissage — P1 (deux points d'un
 * graphe, le piège de O et des coefficients), P2 (b puis a lus sur des droites dessinées), P3 (une image, un
 * antécédent lus). Nombres et droites différents de ceux des modules.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={PLATFORM} /></span>;
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
        rasm: { label: 'التمثيل البياني لدالة تآلفية', module: 2 },
        muamilat: { label: 'قراءة a و b على التمثيل', module: 3 },
        qiraa: { label: 'قراءة صورة عدد وعدد صورته معلومة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'rasm', requires: ['rasm-taalufi', 'tamthil-taalufi'],
          prompt: <Q><MathText>{'التمثيل البياني للدالة $f : x \\longmapsto -2x + 1$ هو المستقيم الذي يشمل النقطتين:'}</MathText></Q>,
          options: [M('$(0 ; 1)$ و $(1 ; -1)$'), M('$(0 ; -2)$ و $(1 ; -1)$'), M('O و $(1 ; -2)$'), M('$(0 ; 1)$ و $(1 ; 3)$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$f(0) = 1$ و $f(1) = -2 + 1 = -1$ . أمّا $(0 ; -2)$ فتخلط بين المعاملين، و O ليست من التمثيل لأنّ $f(0) = 1$ ، و $(1 ; 3)$ تنسى إشارة $a$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-taalufi_P1'] },
        },
        {
          id: 'E2', skill: 'muamilat', requires: ['qiraa-ab'],
          prompt: (
            <Q>
              <MathText>{'المستقيم أدناه هو التمثيل البياني لدالة تآلفية. الترتيب عند المبدأ لهذه الدالة هو:'}</MathText>
              <AffineFigure testId="e2" win={{ xMin: -1, xMax: 3, yMin: -4, yMax: 2 }} height={210} width={200}
                lines={[{ a: 1.5, b: -3, label: '(D)' }]} points={[{ x: 0, y: -3 }, { x: 2, y: 0 }]}
                caption="الشكل: المستقيم $(D)$ يشمل النقطتين $(0 ; -3)$ و $(2 ; 0)$ ."
                ariaLabel="مستقيم (D) يصعد ويشمل النقطتين (0 ; −3) و (2 ; 0)" />
            </Q>
          ),
          options: [M('$-3$'), M('$2$'), M('$3$'), M('$\\dfrac{3}{2}$')],
          correct: 0, cols: 4,
          explain: <MathText>{'$(D)$ يقطع محور التراتيب في $(0 ; -3)$ : $b = -3$ . أمّا $2$ ففاصلة نقطة تقاطعه مع محور الفواصل، و $3$ تنسى الإشارة، و $\\dfrac{3}{2}$ معامل التوجيه.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-taalufi_P2'] },
        },
        {
          id: 'E3', skill: 'muamilat', requires: ['qiraa-ab', 'muamil-tawjih'],
          prompt: (
            <Q>
              <MathText>{'المستقيم أدناه هو التمثيل البياني لدالة تآلفية. معامل توجيهه هو:'}</MathText>
              <AffineFigure testId="e3" win={{ xMin: -1, xMax: 3, yMin: -2, yMax: 3 }} height={200} width={200}
                lines={[{ a: -3, b: 2, label: '(Δ)' }]} points={[{ x: 0, y: 2 }, { x: 1, y: -1 }]}
                caption="الشكل: المستقيم $(\\Delta)$ يشمل النقطتين $(0 ; 2)$ و $(1 ; -1)$ ."
                ariaLabel="مستقيم ينزل ويشمل النقطتين (0 ; 2) و (1 ; −1)" />
            </Q>
          ),
          options: [M('$-3$'), M('$3$'), M('$-\\dfrac{1}{3}$'), M('$2$')],
          correct: 0, cols: 4,
          explain: <MathText>{'من $(0 ; 2)$ إلى $(1 ; -1)$ : تقدّمنا وحدة واحدة إلى اليمين فنزل المستقيم $3$ ، إذن $a = -3$ . أمّا $3$ فلمستقيم يصعد، و $-\\dfrac{1}{3}$ مقلوب الدرجة، و $2$ هو الترتيب عند المبدأ.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-taalufi_P2'] },
        },
        {
          id: 'E4', skill: 'qiraa', requires: ['qiraa-sura-taalufi'],
          prompt: (
            <Q>
              <MathText>{'المستقيم أدناه هو التمثيل البياني لدالة تآلفية $f$ . بقراءة بيانية، صورة العدد $4$ هي:'}</MathText>
              <AffineFigure testId="e4" win={{ xMin: -1, xMax: 6, yMin: -1, yMax: 4 }} height={190} width={260}
                lines={[{ a: 0.5, b: 1, label: '(d)' }]} points={[{ x: 0, y: 1 }, { x: 2, y: 2 }]}
                caption="الشكل: المستقيم $(d)$ يشمل النقطتين $(0 ; 1)$ و $(2 ; 2)$ ."
                ariaLabel="مستقيم (d) يصعد ويشمل النقطتين (0 ; 1) و (2 ; 2)" />
            </Q>
          ),
          options: [M('$3$'), M('$6$'), M('$1$'), M('$4$')],
          correct: 0, cols: 4,
          explain: <MathText>{'من $4$ على محور الفواصل نصعد إلى $(d)$ ثم نقرأ الترتيب: $3$ ، أي $f(4) = 3$ . أمّا $6$ فهو العدد الذي صورته $4$ ، و $1$ الترتيب عند المبدأ.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-taalufi_P3'] },
        },
        {
          id: 'E5', skill: 'qiraa', requires: ['qiraa-sura-taalufi'],
          prompt: (
            <Q>
              <MathText>{'المستقيم أدناه هو التمثيل البياني لدالة تآلفية $g$ . بقراءة بيانية، العدد الذي صورته $3$ هو:'}</MathText>
              <AffineFigure testId="e5" win={{ xMin: -1, xMax: 3, yMin: -2, yMax: 6 }} height={220} width={180}
                lines={[{ a: 2, b: -1, label: '(c)' }]} points={[{ x: 0, y: -1 }, { x: 1, y: 1 }]}
                caption="الشكل: المستقيم $(c)$ يشمل النقطتين $(0 ; -1)$ و $(1 ; 1)$ ."
                ariaLabel="مستقيم (c) يصعد ويشمل النقطتين (0 ; −1) و (1 ; 1)" />
            </Q>
          ),
          options: [M('$2$'), M('$5$'), M('$-1$'), M('$1$')],
          correct: 0, cols: 4,
          explain: <MathText>{'من $3$ على محور التراتيب نذهب أفقيًا إلى $(c)$ ثم نقرأ الفاصلة: $2$ ، أي $g(2) = 3$ . أمّا $5$ فهو صورة $3$ ($g(3) = 5$)، و $-1$ الترتيب عند المبدأ، و $g(1) = 1$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-taalufi_P3'] },
        },
      ]}
      badges={[
        { id: 'rasm', emoji: '📈', label: 'مستقيم بنقطتين', test: (m) => (m.rasm ?? 0) === 0 },
        { id: 'muamilat', emoji: '🛹', label: 'a و b على البيان', test: (m) => (m.muamilat ?? 0) === 0 },
        { id: 'qiraa', emoji: '👀', label: 'القراءة البيانية', test: (m) => (m.qiraa ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التمثيل البياني لدالة تآلفية',
        title: 'انتهى الدرس 2',
        message: 'تعرف الآن أنّ التمثيل البياني لدالة تآلفية مستقيم يقطع محور التراتيب في النقطة التي ترتيبها b ويوازي تمثيل الدالة الخطية ذات المعامل a، وترسمه بنقطتين، وتقرأ عليه b و a ، وصورة عدد والعدد الذي علمت صورته.',
        verbs: ['أرسم', 'أقرأ', 'أكتب', 'أتحقّق'],
        masterBadgeLabel: 'التمثيل البياني لدالة تآلفية',
      }}
    />
  );
}
