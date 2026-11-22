import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { QCM } from '../content/textbook';

/**
 * Module 8 — إختبار أولي (module 5 avant les trois « مسائل », renuméroté le 2026-10-06) (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : les items 3, 4, 5 et 6 de « أؤكّد تعلّماتي » (p. 100, extraction › qcm › duplicatedIn ›
 * mada-wasit-mutawassit) et une moyenne pondérée de la plateforme (P2 : la moyenne SANS effectifs réfutée).
 * Chaque épreuve évalue UN point d'apprentissage principal ; P1–P3 sont couverts.
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
        mada: { label: 'المدى', module: 2 },
        mutawassit: { label: 'المتوسط المتوازن', module: 1 },
        wasit: { label: 'الوسيط', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'wasit', requires: ['wasit-rutba'],
          prompt: <Q source={QCM[3].source}><MathText>{QCM[3].text}</MathText></Q>,
          options: QCM[3].options.map(M),
          correct: 0, cols: 3,
          explain: <MathText>{QCM[3].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mada-wasit-mutawassit_P3'] },
        },
        {
          id: 'E2', skill: 'mada', requires: ['mada'],
          prompt: <Q source={QCM[4].source}><MathText>{QCM[4].text}</MathText></Q>,
          options: QCM[4].options.map(M),
          correct: 2, cols: 3,
          explain: <MathText>{QCM[4].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mada-wasit-mutawassit_P1'] },
        },
        {
          id: 'E3', skill: 'wasit', requires: ['wasit-rutba'],
          prompt: <Q source={QCM[5].source}><MathText>{QCM[5].text}</MathText></Q>,
          options: QCM[5].options.map(M),
          correct: 0, cols: 3, keepOrder: true,
          explain: <MathText>{QCM[5].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mada-wasit-mutawassit_P3'] },
        },
        {
          id: 'E4', skill: 'mutawassit', requires: ['mutawassit-mutawazin', 'wasit-rutba'],
          prompt: <Q source={QCM[6].source}><MathText>{QCM[6].text}</MathText></Q>,
          options: QCM[6].options.map(M),
          correct: 0, cols: 1,
          explain: <MathText>{QCM[6].explain}</MathText>,
          assessment: {
            enabled: true, type: 'assessment',
            learningPoints: [{ code: '4am_mada-wasit-mutawassit_P2', role: 'primary' }, { code: '4am_mada-wasit-mutawassit_P3', role: 'secondary' }],
          },
        },
        {
          id: 'E5', skill: 'mutawassit', requires: ['mutawassit-mutawazin'],
          prompt: (
            <Q source={PLATFORM}>
              <MathText>{'علامات 10 تلاميذ في فرض: العلامة $8$ (تلميذان)، $10$ (5 تلاميذ)، $12$ (تلميذان)، $15$ (تلميذ واحد). متوسط هذه العلامات هو:'}</MathText>
            </Q>
          ),
          // 11,25 = (8 + 10 + 12 + 15)/4 sans effectifs ; 26,25 = 105 ÷ 4 (le nombre de valeurs distinctes)
          options: [M('$11{,}25$'), M('$10{,}5$'), M('$26{,}25$')],
          correct: 1, cols: 3,
          explain: <MathText>{'$\\dfrac{8 \\times 2 + 10 \\times 5 + 12 \\times 2 + 15 \\times 1}{10} = \\dfrac{105}{10} = 10{,}5$. العدد $11{,}25$ متوسط العلامات الأربع دون أعداد التلاميذ، و $26{,}25$ قسمة على $4$ بدل التكرار الكلّي $10$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mada-wasit-mutawassit_P2'] },
        },
      ]}
      badges={[
        { id: 'mada', emoji: '↔️', label: 'المدى', test: (m) => (m.mada ?? 0) === 0 },
        { id: 'mutawassit', emoji: '⚖️', label: 'المتوسط المتوازن', test: (m) => (m.mutawassit ?? 0) === 0 },
        { id: 'wasit', emoji: '🎭', label: 'الوسيط', test: (m) => (m.wasit ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مؤشّرات السلسلة الإحصائية',
        title: 'انتهى الدرس 2',
        message: 'تعرف الآن أنّ المدى هو الفرق بين أكبر قيمة وأصغر قيمة، وأنّ المتوسط المتوازن نقطة توازن القيم تُحسب بالتكرارات أو بمراكز الفئات، وأنّ الوسيط يقسم السلسلة المرتّبة نصفين لا تحرّكه قيمة بعيدة.',
        verbs: ['أرتّب', 'أحسب', 'أقارن', 'أفسّر'],
        masterBadgeLabel: 'المدى والمتوسط والوسيط',
      }}
    />
  );
}
