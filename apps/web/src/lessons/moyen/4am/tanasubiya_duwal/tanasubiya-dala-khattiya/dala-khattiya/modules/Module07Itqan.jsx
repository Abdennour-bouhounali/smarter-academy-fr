import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { QCM } from '../content/textbook';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Six épreuves : les items 2, 3, 5, 6 de « أؤكّد تعلّماتي » (p. 74, extraction › qcm › duplicatedIn ›
 * dala-khattiya) et deux de la plateforme (P1 : reconnaître une fonction linéaire ; P2 : une image
 * de signe négatif). Chaque épreuve évalue UN point d'apprentissage ; P1–P3 sont couverts.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');

export default function Module07Itqan() {
  const q6 = QCM[6];
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="إختبار أولي"
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="7 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        mafhum: { label: 'الدالة الخطية وجدول قيمها', module: 2 },
        sura: { label: 'صورة عدد', module: 2 },
        tayin: { label: 'تعيين المعامل من عدد وصورته', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'sura', requires: ['hisab-sura'],
          prompt: <Q source={QCM[2].source}><MathText>{QCM[2].text}</MathText></Q>,
          options: QCM[2].options.map(M),
          correct: 1, cols: 1,
          explain: <MathText>{QCM[2].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_dala-khattiya_P2'] },
        },
        {
          id: 'E2', skill: 'tayin', requires: ['tayin-dala'],
          prompt: <Q source={QCM[3].source}><MathText>{QCM[3].text}</MathText></Q>,
          options: QCM[3].options.map(M),
          correct: 0, cols: 1,
          explain: <MathText>{QCM[3].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_dala-khattiya_P3'] },
        },
        {
          id: 'E3', skill: 'tayin', requires: ['tayin-dala'],
          prompt: <Q source={QCM[5].source}><MathText>{QCM[5].text}</MathText></Q>,
          options: QCM[5].options.map(M),
          correct: 0, cols: 3,
          explain: <MathText>{QCM[5].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_dala-khattiya_P3'] },
        },
        {
          id: 'E4', skill: 'mafhum', requires: ['jadwal-khattiya'],
          prompt: (
            <Q source={q6.source}>
              <MathText>{`${q6.text} ($x$ : $${q6.table.x.join('$ ، $')}$ ؛ $f(x)$ : $${q6.table.y.join('$ ، $')}$)`}</MathText>
            </Q>
          ),
          options: q6.options.map(M),
          correct: 1, cols: 3,
          explain: <MathText>{q6.explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_dala-khattiya_P1'] },
        },
        {
          id: 'E5', skill: 'mafhum', requires: ['dala-khattiya'],
          prompt: <Q source={PLATFORM}><MathText>{'الدالة الخطية من بين الدوال الآتية هي:'}</MathText></Q>,
          options: [M('$x \\longmapsto x - 4$'), M('$x \\longmapsto -4x$'), M('$x \\longmapsto 4x^2$'), M('$x \\longmapsto 4x + 1$')],
          correct: 1, cols: 2,
          explain: <MathText>{'$x \\longmapsto -4x$ من الشكل $x \\longmapsto ax$ مع $a = -4$. أما $x - 4$ و $4x + 1$ فصورة 0 بهما $-4$ و $1$ وليست 0، و $4x^2$ جداء $x$ في $4x$ وليس في عدد ثابت.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_dala-khattiya_P1'] },
        },
        {
          id: 'E6', skill: 'sura', requires: ['hisab-sura'],
          prompt: <Q source={PLATFORM}><MathText>{'$f$ الدالة الخطية $f(x) = -0{,}5x$ . صورة العدد $-8$ هي:'}</MathText></Q>,
          options: [M('$4$'), M('$-4$'), M('$16$'), M('$-8{,}5$')],
          correct: 0, cols: 4,
          explain: <MathText>{'$f(-8) = -0{,}5 \\times (-8) = 4$ (ناقص في ناقص يعطي موجبًا). أما $16$ فهو العدد الذي صورته $-8$ ، و $-8{,}5$ مجموع لا جداء.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_dala-khattiya_P2'] },
        },
      ]}
      badges={[
        { id: 'mafhum', emoji: '🎛️', label: 'الدالة الخطية', test: (m) => (m.mafhum ?? 0) === 0 },
        { id: 'sura', emoji: '🏷️', label: 'صورة عدد', test: (m) => (m.sura ?? 0) === 0 },
        { id: 'tayin', emoji: '🔑', label: 'تعيين المعامل', test: (m) => (m.tayin ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مفهوم الدالة الخطية وتعيينها',
        title: 'انتهى الدرس 2',
        message: 'تعرف الآن الدالة الخطية x ⟼ ax وصورة عدد f(x) = ax، وأنّ جدول قيمها جدول تناسبية، وتعيّن معاملها من عدد غير معدوم وصورته.',
        verbs: ['أميّز', 'أحسب الصورة', 'أعيّن المعامل', 'أتحقّق'],
        masterBadgeLabel: 'الدالة الخطية',
      }}
    />
  );
}
