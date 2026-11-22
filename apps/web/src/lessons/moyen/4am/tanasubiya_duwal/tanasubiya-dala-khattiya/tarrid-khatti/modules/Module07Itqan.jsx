import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Aucun item
 * de « أؤكّد تعلّماتي » n'est destiné à cette leçon (extraction → destinations qcm) : cinq épreuves
 * de la PLATEFORME, chacune sur le modèle d'un exemple du manuel (نشاط 4, la طريقة du ressort,
 * le تحدّ) avec d'autres nombres. Chaque épreuve évalue UN point : P1 (E1, E2), P2 (E3, E4), P3 (E5).
 * Chaque distracteur est faux.
 *   E1  1950 / 3 = 3250 / 5 = 650
 *   E3  6 / 4 = 15 / 10 = 1,5 → (1 ; 1,5)
 *   E4  a = 2 / 5 = 0,4 ; 0,4 × 20 = 8
 *   E5  980 / 40 = 24,5 → 24 personnes (960 DA, il reste 20 DA)
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const SRC = addition('interactive_example');

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
        namdhaja: { label: 'نمذجة وضعية بدالة خطية', module: 1 },
        ashkal: { label: 'الانتقال بين الجدول والدستور والتمثيل', module: 2 },
        tafsir: { label: 'تفسير النتيجة في سياق الوضعية', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'namdhaja', requires: ['tanasub-bayan', 'tariqat-jadwal'],
          prompt: <Q source={SRC}>في متجر: 3L من زيت الزيتون بـ 1950DA و 5L بـ 3250DA. نسمّي <MathText>{'$x$'}</MathText> عدد اللترات. الدالة التي تعطي الثمن بالدينار هي:</Q>,
          options: [M('$f(x) = 650x$'), M('$f(x) = x + 650$'), M('$f(x) = 1950x$'), 'ليست وضعية تناسبية: لا توجد دالة خطية'],
          correct: 0, cols: 2,
          explain: <MathText>{'$\\dfrac{1950}{3} = \\dfrac{3250}{5} = 650$ : الثمن متناسب مع عدد اللترات، $f(x) = 650x$ ، و 650DA سعر اللتر الواحد.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-khatti_P1'] },
        },
        {
          id: 'E2', skill: 'namdhaja', requires: ['laysat-tanasub'],
          prompt: <Q source={SRC}>أيّ وضعية من الوضعيات التالية لا نمذجها بدالة خطية؟</Q>,
          options: [
            'ثمن x كيلوغرام من التفاح بسعر 120DA للكيلوغرام',
            'محيط مربع طول ضلعه x',
            'مساحة مربع طول ضلعه x',
            'المسافة التي يقطعها قطار بسرعة ثابتة 80km/h في x ساعة',
          ],
          correct: 2, cols: 1,
          explain: <MathText>{'المساحة $x^2$ : نقط تمثيلها على منحنى. أما $120x$ و $4x$ و $80x$ فدوال خطية.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-khatti_P1'] },
        },
        {
          id: 'E3', skill: 'ashkal', requires: ['tamthilat-thalath'],
          prompt: <Q source={SRC}>جدول تناسبية: من أجل <MathText>{'$x = 4$'}</MathText> نجد <MathText>{'$y = 6$'}</MathText> ، ومن أجل <MathText>{'$x = 10$'}</MathText> نجد <MathText>{'$y = 15$'}</MathText> . التمثيل البياني لهذه الوضعية مستقيم يشمل المبدأ والنقطة:</Q>,
          options: [M('$(1 ; 1{,}5)$'), M('$(1{,}5 ; 1)$'), M('$(0 ; 1{,}5)$'), M('$(6 ; 4)$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$\\dfrac{6}{4} = \\dfrac{15}{10} = 1{,}5$ : الدستور $y = 1{,}5x$ ، والنقطة التي فاصلتها 1 ترتيبها $1{,}5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-khatti_P2'] },
        },
        {
          id: 'E4', skill: 'ashkal', requires: ['tamthilat-thalath', 'qiraa-bayaniya'],
          prompt: <Q source={SRC}>التمثيل البياني لدالة خطية <MathText>{'$f$'}</MathText> يشمل النقطة <MathText>{'$(5 ; 2)$'}</MathText> . صورة العدد 20 بالدالة <MathText>{'$f$'}</MathText> هي:</Q>,
          options: [M('$8$'), M('$50$'), M('$17$'), M('$4$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$a = \\dfrac{2}{5} = 0{,}4$ ، إذن $f(20) = 0{,}4 \\times 20 = 8$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-khatti_P2'] },
        },
        {
          id: 'E5', skill: 'tafsir', requires: ['tafsir-siyaq'],
          prompt: <Q source={SRC}>تذكرة المصعد الهوائي بـ 40DA للشخص. لفوج ميزانية 980DA ، والمعادلة <MathText>{'$40x = 980$'}</MathText> تعطي <MathText>{'$x = 24{,}5$'}</MathText> . ما الجواب في سياق الوضعية؟</Q>,
          options: [
            'يمكن لـ 24,5 شخصًا أن يركبوا',
            'يمكن لـ 24 شخصًا أن يركبوا، ويبقى 20DA',
            'يمكن لـ 25 شخصًا أن يركبوا',
            'لا يمكن لأحد أن يركب',
          ],
          correct: 1, cols: 1,
          explain: <MathText>{'عدد الأشخاص عدد طبيعي: $40 \\times 24 = 960$ و $980 - 960 = 20$ ، أما 25 شخصًا فيكلّفون $40 \\times 25 = 1000$ DA.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-khatti_P3'] },
        },
      ]}
      badges={[
        { id: 'namdhaja', emoji: '🧩', label: 'من الوضعية إلى الدالة', test: (m) => (m.namdhaja ?? 0) === 0 },
        { id: 'tafsir', emoji: '🔍', label: 'نتيجة لها معنى', test: (m) => (m.tafsir ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت ترييض وضعيات بالدالة الخطية',
        title: 'انتهى الدرس 5',
        message: 'تعرف الآن كيف تتعرّف على وضعية تناسبية، وتنمذجها بدالة خطية، وتنتقل بين الجدول والدستور والتمثيل البياني، ثم تفسّر النتيجة في سياق الوضعية.',
        verbs: ['أنمذج', 'أنتقل', 'أحسب', 'أفسّر'],
        masterBadgeLabel: 'ترييض بالدالة الخطية',
      }}
    />
  );
}
