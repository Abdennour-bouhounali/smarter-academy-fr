import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { QCM } from '../content/textbook';
import GraphFigure from '../components/GraphFigure';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : les items 1 et 4 de « أؤكّد تعلّماتي » (p. 74, extraction › qcm › duplicatedIn ›
 * tamthil-bayani-khatti ; l'item 4 avec sa figure dessinée) et trois de la plateforme (P2 : lire un
 * antécédent sur une droite dessinée ; P3 : le sens ; P1 : la seconde point d'un graphe, avec le piège
 * du signe). Chaque épreuve évalue UN point d'apprentissage ; P1–P3 sont couverts.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');

export default function Module07Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        rasm: { label: 'التمثيل البياني لدالة خطية', module: 2 },
        qiraa: { label: 'القراءة البيانية', module: 2 },
        munha: { label: 'منحى المستقيم وإشارة a', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'rasm', requires: ['tamthil-mustaqim', 'tayin-muamil'],
          prompt: <Q source={QCM[1].source}><MathText>{QCM[1].text}</MathText></Q>,
          options: QCM[1].options.map(M),
          correct: 1, cols: 3,
          explain: <MathText>{QCM[1].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-khatti_P1'] },
        },
        {
          id: 'E2', skill: 'qiraa', requires: ['qiraa-bayaniya', 'tamthil-mustaqim'],
          prompt: (
            <Q source={QCM[4].source}>
              <MathText>{QCM[4].text}</MathText>
              <GraphFigure testId="qcm-4" win={{ xMin: 0, xMax: 4, yMin: 0, yMax: 1 }} yStep={0.25} height={200}
                lines={[{ a: 0.25, label: '(D)' }]} caption="الشكل: المستقيم (D) يشمل المبدأ والنقطة (1 ; 0,25)." />
            </Q>
          ),
          options: QCM[4].options.map(M),
          correct: 2, cols: 1,
          explain: <MathText>{QCM[4].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-khatti_P2'] },
        },
        {
          id: 'E3', skill: 'qiraa', requires: ['qiraa-bayaniya'],
          prompt: (
            <Q source={PLATFORM}>
              <MathText>{'المستقيم أدناه هو التمثيل البياني لدالة خطية $f$. بقراءة بيانية، العدد الذي صورته $6$ هو:'}</MathText>
              <GraphFigure testId="e3" win={{ xMin: 0, xMax: 6, yMin: 0, yMax: 9 }} height={220}
                lines={[{ a: 1.5, label: '(D)' }]} caption="الشكل: مستقيم يشمل المبدأ والنقطة (2 ; 3)." />
            </Q>
          ),
          options: [M('$4$'), M('$9$'), M('$3$')],
          correct: 0, cols: 3,
          explain: <MathText>{'من $6$ على محور التراتيب نذهب أفقيًا إلى المستقيم ثم ننزل إلى محور الفواصل: $4$ ، أي $f(4) = 6$. أمّا $9$ فهو صورة $6$ ($f(6) = 9$)، و $3$ صورة $2$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-khatti_P2'] },
        },
        {
          id: 'E4', skill: 'munha', requires: ['munha-mustaqim'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ دالة خطية تمثيلها البياني ينزل من اليسار إلى اليمين؟'}</MathText></Q>,
          options: [M('$x \\longmapsto 0{,}3x$'), M('$x \\longmapsto -1{,}2x$'), M('$x \\longmapsto \\dfrac{5}{4}x$'), M('$x \\longmapsto 2x$')],
          correct: 1, cols: 2,
          explain: <MathText>{'المستقيم ينزل عندما يكون المعامل سالبًا: $-1{,}2 < 0$. المعاملات $0{,}3$ و $\\dfrac{5}{4}$ و $2$ موجبة، فتمثيلاتها تصعد.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-khatti_P3'] },
        },
        {
          id: 'E5', skill: 'rasm', requires: ['rasm-tamthil'],
          prompt: <Q source={PLATFORM}><MathText>{'التمثيل البياني للدالة $f : x \\longmapsto -0{,}75x$ هو المستقيم الذي يشمل:'}</MathText></Q>,
          options: [M('O و $(4 ; -3)$'), M('O و $(4 ; 3)$'), M('$(0 ; -0{,}75)$ و $(1 ; 0)$'), M('O و $(-0{,}75 ; 1)$')],
          correct: 0, cols: 1,
          explain: <MathText>{'التمثيل يشمل O، و $f(4) = -0{,}75 \\times 4 = -3$. أمّا $(4 ; 3)$ فتنسى الإشارة، و $(0 ; -0{,}75)$ لا تقع على مستقيم يشمل O، و $f(-0{,}75) = 0{,}5625 \\neq 1$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tamthil-bayani-khatti_P1'] },
        },
      ]}
      badges={[
        { id: 'rasm', emoji: '📈', label: 'مستقيم يشمل O', test: (m) => (m.rasm ?? 0) === 0 },
        { id: 'qiraa', emoji: '👀', label: 'القراءة البيانية', test: (m) => (m.qiraa ?? 0) === 0 },
        { id: 'munha', emoji: '↗️', label: 'المنحى والإشارة', test: (m) => (m.munha ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التمثيل البياني لدالة خطية',
        title: 'انتهى الدرس 3',
        message: 'تعرف الآن أنّ التمثيل البياني لدالة خطية مستقيم يشمل المبدأ تكفي لرسمه نقطة ثانية، وتقرأ عليه صورة عدد والعدد الذي علمت صورته، وتعرف أنّه يصعد إذا كان المعامل موجبًا وينزل إذا كان سالبًا.',
        verbs: ['أرسم', 'أقرأ', 'أتحقّق', 'أربط'],
        masterBadgeLabel: 'التمثيل البياني لدالة خطية',
      }}
    />
  );
}
