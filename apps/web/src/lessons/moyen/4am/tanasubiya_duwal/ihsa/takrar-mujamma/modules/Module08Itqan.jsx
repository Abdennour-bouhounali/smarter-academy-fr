import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { QCM } from '../content/textbook';
import { texTable } from '../components/FreqTable';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Six épreuves : les items 1 et 2 de « أؤكّد تعلّماتي » (p. 100, extraction › destinations › qcm, items 1–2)
 * et quatre de la plateforme (P2 : un التواتر المجمع pour une valeur et pour une فئة ; P3 : lire un tableau
 * cumulé, interpréter un نازل). Chaque épreuve évalue UN point d'apprentissage ; P1–P3 sont couverts. Aucun
 * nombre n'est repris des modules.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');
const Q = ({ children, source, table, rows }) => (
  <span className="block space-y-2">
    <span>{children} <SourceTag source={source} /></span>
    {table && <span className="block text-xs text-slate-600">{rows}</span>}
    {table && <span className="block"><MathText>{table}</MathText></span>}
  </span>
);

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        takrar: { label: 'التكرار المجمع', module: 2 },
        tawatur: { label: 'التواتر المجمع', module: 3 },
        jadwal: { label: 'قراءة جدول مجمع وتفسيره', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'takrar', requires: ['hisab-mujamma'],
          prompt: <Q source={QCM[1].source} rows="(السطر الأول: القيمة، السطر الثاني: التكرار)" table={texTable([QCM[1].values, QCM[1].freqs])}><MathText>{QCM[1].text}</MathText></Q>,
          options: QCM[1].options.map(M),
          correct: 1, cols: 3,
          explain: <MathText>{QCM[1].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takrar-mujamma_P1'] },
        },
        {
          id: 'E2', skill: 'takrar', requires: ['hisab-mujamma'],
          prompt: <Q source={QCM[2].source} rows="(السطر الأول: القيمة، السطر الثاني: التكرار)" table={texTable([QCM[2].values, QCM[2].freqs])}><MathText>{QCM[2].text}</MathText></Q>,
          options: QCM[2].options.map(M),
          correct: 1, cols: 3,
          explain: <MathText>{QCM[2].explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takrar-mujamma_P1'] },
        },
        {
          id: 'E3', skill: 'tawatur', requires: ['tawatur-mujamma'],
          prompt: <Q source={PLATFORM} rows="(السطر الأول: القيمة، السطر الثاني: التكرار)" table={texTable([['2', '4', '6', '8'], ['5', '10', '6', '4']])}>التواتر المجمع الصاعد للقيمة 4 في هذه السلسلة هو:</Q>,
          options: ['$0{,}6$', '$0{,}4$', '$0{,}8$', '$15$'].map(M),
          correct: 0, cols: 4,
          explain: <MathText>{'التكرار الكلي $25$ : $\\dfrac{5 + 10}{25} = \\dfrac{15}{25} = 0{,}6$ . ($0{,}4$ تواتر 4 وحده، $0{,}8$ هو النازل، و $15$ لم يُقسم على 25.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takrar-mujamma_P2'] },
        },
        {
          id: 'E4', skill: 'tawatur', requires: ['tawatur-fiat'],
          prompt: <Q source={PLATFORM} rows="(السطر الأول: الفئة، السطر الثاني: التكرار)" table={texTable([['$0 \\le x < 10$', '$10 \\le x < 20$', '$20 \\le x \\le 30$'], ['8', '20', '12']])}><MathText>{'التواتر المجمع النازل للفئة $10 \\le x < 20$ هو:'}</MathText></Q>,
          options: ['$0{,}8$', '$0{,}7$', '$0{,}5$', '$32$'].map(M),
          correct: 0, cols: 4,
          explain: <MathText>{'التكرار الكلي $40$ : $\\dfrac{20 + 12}{40} = 0{,}8$ . ($0{,}7$ هو الصاعد، $0{,}5$ تواتر الفئة وحدها، و $32$ لم يُقسم على 40.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takrar-mujamma_P2'] },
        },
        {
          id: 'E5', skill: 'jadwal', requires: ['khasiyat-mujamma'],
          prompt: <Q source={PLATFORM} rows="(السطر الأول: العمر (سنة)، السطر الثاني: التكرار المجمع الصاعد)" table={texTable([['12', '13', '14', '15'], ['6', '15', '27', '30']])}>أعمار رواد نادٍ رياضي. عدد الرواد الذين عمرهم 14 سنة على الأقل هو:</Q>,
          options: ['$15$', '$27$', '$12$', '$3$'].map(M),
          correct: 0, cols: 4,
          explain: <MathText>{'الذين عمرهم 13 سنة على الأكثر: $15$ ، فالباقون $30 - 15 = 15$ عمرهم 14 أو 15. ($27$ هو الصاعد للعمر 14، $12$ تكرار 14 وحده، و $3$ تكرار 15 وحده.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takrar-mujamma_P3'] },
        },
        {
          id: 'E6', skill: 'jadwal', requires: ['takrar-mujamma'],
          prompt: <Q source={PLATFORM}>في قسم من 30 تلميذا، التكرار المجمع النازل للعلامة 10 هو 18. معنى ذلك:</Q>,
          options: ['18 تلميذا علاماتهم 10 أو أكثر', '18 تلميذا علاماتهم أكثر من 10 تماما', '18 تلميذا علاماتهم 10 أو أقل', '12 تلميذا علاماتهم 10 أو أكثر'],
          correct: 0, cols: 1,
          explain: 'النازل للقيمة 10 يجمع تكرار 10 وتكرارات القيم الأكبر منها: 18 تلميذا علاماتهم 10 على الأقل (والقيمة 10 نفسها محسوبة).',
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takrar-mujamma_P3'] },
        },
      ]}
      badges={[
        { id: 'takrar', emoji: '📶', label: 'التكرار المجمع', test: (m) => (m.takrar ?? 0) === 0 },
        { id: 'tawatur', emoji: '➗', label: 'التواتر المجمع', test: (m) => (m.tawatur ?? 0) === 0 },
        { id: 'jadwal', emoji: '📋', label: 'قراءة الجدول', test: (m) => (m.jadwal ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التكرار والتواتر المجمعين',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن التكرار المجمع الصاعد والنازل لقيمة أو لفئة، والتواتر المجمع، وتقرأ جدول تكرارات مجمعة وتفسّره.',
        verbs: ['أرتّب', 'أجمع', 'أقسم', 'أفسّر'],
        masterBadgeLabel: 'التكرار المجمع',
      }}
    />
  );
}
