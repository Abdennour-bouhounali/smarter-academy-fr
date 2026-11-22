import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { Dustur } from '../components/Figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Cinq épreuves de la
 * plateforme, sur d'autres nombres que ceux des modules (le manuel n'a pas de QCM pour ce درس) : P1 (E1, la
 * plage d'une série), P2 (E2, ce qu'affiche =MEDIANE ; E3, une plage qui oublie une cellule), P3 (E4, le
 * graphique de données en classes ; E5, l'angle d'un secteur). Chaque distracteur est faux et dit pourquoi :
 * médiane sans ranger (13), la moyenne (≈ 13,33), le mode (15) ; un tableur qui « refuserait » une plage
 * courte ; 50° (l'effectif pris pour l'angle).
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const D = (f) => <Dustur key={f}>{f}</Dustur>;
const PLATFORM = addition('interaction_generation');

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
        hajz: { label: 'الحجز في خلايا المجدول', module: 1 },
        dasatir: { label: 'دساتير المؤشّرات', module: 1 },
        tamthil: { label: 'التمثيل البياني المناسب', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'hajz', requires: ['khaliya-majal', 'hajz-hifz'],
          prompt: <Q source={PLATFORM}>حجزت سارة سلسلة من 9 قيم في السطر 1 بدءًا من الخلية A1 ، قيمة في كل خلية. المجال الذي تشغله السلسلة:</Q>,
          options: [D('A1:I1'), D('A1:H1'), D('A1:A9'), D('B1:J1')],
          correct: 0, cols: 2,
          explain: <MathText>{'من A إلى I تسعة أعمدة: A1:I1 . المجال A1:H1 ثماني خلايا، و A1:A9 في العمود A لا في السطر 1، و B1:J1 لا يبدأ من A1 .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majdulat-ihsaiya_P1'] },
        },
        {
          id: 'E2', skill: 'dasatir', requires: ['dasatir-arbaa', 'wasit-silsila'],
          prompt: <Q source={PLATFORM}>في الخلايا من A1 إلى F1 : 12 ، 15 ، 11 ، 15 ، 18 ، 9 . العدد الذي يُظهره الدستور <Dustur>=MEDIANE(A1:F1)</Dustur> :</Q>,
          options: [M('13,5'), M('13'), M('$\\dfrac{40}{3} \\approx 13{,}33$'), M('15')],
          correct: 0, cols: 2,
          explain: <MathText>{'المجدول يرتّب: 9 ، 11 ، 12 ، 15 ، 15 ، 18 . ستّ قيم: الوسيط متوسط القيمتين ذواتي الرتبتين 3 و 4 : $\\dfrac{12 + 15}{2} = 13{,}5$ . العدد 13 يأتي من القيمتين الوسطيين دون ترتيب، و $\\dfrac{80}{6}$ هو المتوسط، و 15 هو المنوال.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majdulat-ihsaiya_P2'] },
        },
        {
          id: 'E3', skill: 'dasatir', requires: ['dustur', 'khaliya-majal'],
          prompt: <Q source={PLATFORM}>سلسلة من سبع قيم محجوزة في A1:G1 . كتب أنس في الخلية B2 الدستور <Dustur>=MOYENNE(A1:F1)</Dustur> ثم ENTER . ماذا يحدث؟</Q>,
          options: [
            M('يكتب المجدول متوسط القيم الستّ من A1 إلى F1 ، دون G1'),
            M('يرفض المجدول الدستور لأنّ المجال ناقص'),
            M('يكتب المجدول متوسط القيم السبع'),
            M('يكتب المجدول متوسط الخليتين A1 و F1 وحدهما'),
          ],
          correct: 0, cols: 1,
          explain: <MathText>{'المجدول يحسب على المجال المكتوب، ولا يعرف ما أراده أنس: ستّ قيم، فنتيجة قد تختلف عن متوسط السلسلة. المجال الصحيح A1:G1 . والنقطتان « ⁦:⁩ » تعنيان «من … إلى»، لا الخليتين وحدهما.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majdulat-ihsaiya_P2'] },
        },
        {
          id: 'E4', skill: 'tamthil', requires: ['tamthil-munasib'],
          prompt: <Q source={PLATFORM}>عدد الرسائل التي أرسلها 40 تلميذًا في يوم، مجمّعة في الفئات من 0 إلى 10 ، من 10 إلى 20 ، من 20 إلى 30 . التمثيل البياني المناسب:</Q>,
          options: [M('مدرّج تكراري'), M('مخطط بالأعمدة'), M('مخطط دائري')],
          correct: 0, cols: 3,
          explain: <MathText>{'سلسلة مجمّعة في فئات متلاصقة: مستطيلات متلاصقة، عرضها طول الفئة وارتفاعها تكرارها. الأعمدة لقيم منفصلة، والدائري لأجزاء من كلّ.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majdulat-ihsaiya_P3'] },
        },
        {
          id: 'E5', skill: 'tamthil', requires: ['tamthil-munasib', 'zawiya-qita'],
          prompt: <Q source={PLATFORM}>مخطط دائري لتوزيع 200 تلميذ حسب الرياضة المفضّلة: 50 تلميذًا يفضّلون كرة اليد. زاوية قطاعهم:</Q>,
          options: [M('$90$ درجة'), M('$50$ درجة'), M('$25$ درجة'), M('$180$ درجة')],
          correct: 0, cols: 2,
          explain: <MathText>{'$\\dfrac{50}{200} \\times 360 = 90$ : ربع الدائرة. العدد 50 تكرار لا زاوية، و 25 هي النسبة المئوية.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majdulat-ihsaiya_P3'] },
        },
      ]}
      badges={[
        { id: 'hajz', emoji: '🗂️', label: 'الخلية والمجال', test: (m) => (m.hajz ?? 0) === 0 },
        { id: 'dasatir', emoji: '🧮', label: 'الدستور الصحيح', test: (m) => (m.dasatir ?? 0) === 0 },
        { id: 'tamthil', emoji: '📊', label: 'التمثيل المناسب', test: (m) => (m.tamthil ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت استعمال المجدول في الإحصاء',
        title: 'انتهى الدرس 3',
        message: 'تعرف الآن كيف تحجز سلسلة في خلايا مجدول وتحفظها، وتكتب دستورًا يبدأ بـ « ⁦=⁩ » على المجال الصحيح لحساب المدى والوسيط والمتوسط والمنوال، وتختار التمثيل البياني المناسب للمعطيات.',
        verbs: ['أحجز', 'أحدّد', 'أحسب', 'أتأكّد', 'أمثّل'],
        masterBadgeLabel: 'المجدول',
      }}
    />
  );
}
