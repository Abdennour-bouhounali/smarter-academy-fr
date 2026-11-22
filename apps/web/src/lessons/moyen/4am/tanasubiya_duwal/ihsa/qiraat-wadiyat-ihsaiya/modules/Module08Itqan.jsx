import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Cinq épreuves de la
 * PLATEFORME, chacune sur le modèle d'un moment de la leçon, avec d'autres nombres ; chacune évalue UN
 * point : P1 (E1, E2), P2 (E3), P3 (E4, E5). Chaque distracteur est faux.
 *   E1  graduation de 25 en 25, barre au 6ᵉ trait → 150
 *   E2  barre « رياضة و موسيقى » 600, barre « موسيقى » 250 → رياضة 350
 *   E3  même moyenne 12, étendues 4 et 14 → la première est la plus régulière
 *   E4  20 élèves à 14 et 30 à 9 → (280 + 270) ÷ 50 = 11
 *   E5  25 valeurs de moyenne 10, on retire 34 → (250 − 34) ÷ 24 = 9
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const SRC = addition('interactive_example');

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="5 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        qiraa: { label: 'قراءة مخطط وترجمته', module: 2 },
        muqarana: { label: 'المقارنة بمؤشرين', module: 3 },
        namdhaja: { label: 'نمذجة وضعية بالمؤشرات', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'qiraa', requires: ['qiraat-mukhattat'],
          prompt: <Q source={SRC}>محور مخطط بالأعمدة مدرّج من 25 إلى 25 (0 ، 25 ، 50 …). عمود يصل إلى التدريجة السادسة فوق 0 يمثّل التكرار:</Q>,
          options: ['150', '6', '125', '175'],
          correct: 0, cols: 2,
          explain: <MathText>{'كل تدريجة تساوي 25: $6 \\times 25 = 150$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P1'] },
        },
        {
          id: 'E2', skill: 'qiraa', requires: ['tarjama-jadwal'],
          prompt: <Q source={SRC}>في مخطط لهوايات تلاميذ: عمود «الرياضة والموسيقى» يصل إلى 600، وعمود «الموسيقى» وحده يصل إلى 250. كم تلميذا هوايته الرياضة؟</Q>,
          options: ['350', '600', '850', '250'],
          correct: 0, cols: 2,
          explain: <MathText>{'العمود الأول يجمع الهوايتين: $600 - 250 = 350$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P1'] },
        },
        {
          id: 'E3', skill: 'muqarana', requires: ['mawqi-tashattut'],
          prompt: <Q source={SRC}>لسلسلتي علامات تلميذين المتوسط نفسه 12؛ مدى علامات سارة 4 ومدى علامات يانيس 14. ماذا نستنتج؟</Q>,
          options: ['علامات سارة أكثر انتظاما', 'علامات يانيس أكثر انتظاما', 'التلميذان متماثلان تماما', 'يانيس أفضل لأن مداه أكبر'],
          correct: 0, cols: 1,
          explain: 'المتوسط نفسه يقول إن موقعَي السلسلتين متماثلان؛ المدى الأصغر (4) يعني علامات أقل تشتتا: سارة أكثر انتظاما.',
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P2'] },
        },
        {
          id: 'E4', skill: 'namdhaja', requires: ['mutawassit-majmuat'],
          prompt: <Q source={SRC}>في متوسطة: 20 تلميذا من القسم الأول معدّلهم 14، و 30 تلميذا من القسم الثاني معدّلهم 9. معدّل التلاميذ الخمسين هو:</Q>,
          options: [M('$11$'), M('$11{,}5$'), M('$12$'), M('$10$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$\\dfrac{20 \\times 14 + 30 \\times 9}{50} = \\dfrac{280 + 270}{50} = \\dfrac{550}{50} = 11$ ، وليس متوسط المعدّلين $11{,}5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P3'] },
        },
        {
          id: 'E5', skill: 'namdhaja', requires: ['hadhf-qiyam'],
          prompt: <Q source={SRC}>متوسط 25 قيمة هو 10. نحذف قيمة واحدة تساوي 34. متوسط القيم الباقية هو:</Q>,
          options: [M('$9$'), M('$10$'), M('$8{,}64$'), M('$11$')],
          correct: 0, cols: 2,
          explain: <MathText>{'المجموع $10 \\times 25 = 250$ ، وبعد الحذف $\\dfrac{250 - 34}{24} = \\dfrac{216}{24} = 9$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P3'] },
        },
      ]}
      badges={[
        { id: 'qiraa', emoji: '📊', label: 'قارئ المخططات', test: (m) => (m.qiraa ?? 0) === 0 },
        { id: 'namdhaja', emoji: '🚰', label: 'المتوسط المتوازن', test: (m) => (m.namdhaja ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت قراءة الوضعيات الإحصائية وتفسير المؤشرات',
        title: 'انتهى الدرس 4',
        message: 'تعرف الآن كيف تقرأ مخططا وتترجمه إلى جدول، وكيف تحسب متوسط مجموعات مجتمعة، وكيف تقارن سلسلتين بمؤشر موقع ومؤشر تشتت ثم تقرّر وتبرّر.',
        verbs: ['أقرأ', 'أحسب', 'أقارن', 'أقرّر'],
        masterBadgeLabel: 'قراءة الوضعيات الإحصائية',
      }}
    />
  );
}
