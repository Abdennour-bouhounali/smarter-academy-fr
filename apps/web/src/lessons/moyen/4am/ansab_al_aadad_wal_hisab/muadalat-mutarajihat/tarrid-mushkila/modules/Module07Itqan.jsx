import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Le manuel n'a aucun item de « أؤكّد تعلّماتي » pour ce sujet (extraction → destinations
 * qcm) : cinq épreuves de la PLATEFORME, chacune sur le modèle d'un exemple du manuel
 * (la طريقة p. 49, les exercices 11, 33 et 40) avec d'autres nombres. Chaque épreuve évalue
 * UN point d'apprentissage : P1 (traduire : E1, E2), P2 (résoudre et interpréter : E3–E5).
 * Chaque distracteur est faux.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const SRC = addition('interaction_generation');

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
        tarjama: { label: 'ترجمة نص إلى معادلة أو متراجحة', module: 1 },
        tafsir: { label: 'الحل والتحقق من ملاءمته للواقع', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'tarjama', requires: ['tarrid-namdhaja'],
          prompt: <Q source={SRC}>عمر أمّ 40 سنة، وعمرا ابنتيها 6 و 10 سنوات. نسمّي <MathText>{'$x$'}</MathText> عدد السنوات التي يكون بعدها عمر الأم مساويًا مجموع عمري ابنتيها. المعادلة هي:</Q>,
          options: [M('$40 + x = 6 + 10 + x$'), M('$40 + x = (6 + x) + (10 + x)$'), M('$40 = (6 + x) + (10 + x)$'), M('$40 + x = 2(6 + 10)$')],
          correct: 1, cols: 1,
          explain: <MathText>{'بعد $x$ سنة تكبر الأم والبنتان كلّ بـ $x$ سنة: $40 + x = (6 + x) + (10 + x)$ (ومنه $x = 24$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-mushkila_P1'] },
        },
        {
          id: 'E2', skill: 'tarjama', requires: ['tarrid-mutarajiha', 'muhit-misaha'],
          prompt: <Q source={SRC}>مستطيل عرضه 4cm وطوله <MathText>{'$x$'}</MathText> ، ومربع ضلعه 7cm. المتراجحة التي تترجم «محيط المستطيل أكبر من محيط المربع» هي:</Q>,
          options: [M('$x + 4 > 28$'), M('$2x + 8 > 49$'), M('$2x + 8 > 28$'), M('$4x > 28$')],
          correct: 2, cols: 2,
          explain: <MathText>{'محيط المستطيل $2(x + 4) = 2x + 8$ ، ومحيط المربع $4 \\times 7 = 28$ : $2x + 8 > 28$ . (49 مساحة المربع لا محيطه.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-mushkila_P1'] },
        },
        {
          id: 'E3', skill: 'tafsir', requires: ['tarrid-tariqa'],
          prompt: <Q source={SRC}>عدد إذا ضربته في 5 وطرحت من الناتج 9 ، تحصل على ضعفه مضافًا إليه 12. ما هو هذا العدد؟</Q>,
          options: [M('$21$'), M('$7$'), M('$1$'), M('$3$')],
          correct: 1, cols: 2,
          explain: <MathText>{'$5x - 9 = 2x + 12$ أي $3x = 21$ ومنه $x = 7$ . تحقّق: $5 \\times 7 - 9 = 26 = 2 \\times 7 + 12$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-mushkila_P2'] },
        },
        {
          id: 'E4', skill: 'tafsir', requires: ['tahaqquq-waqi', 'jidaa-maadum'],
          prompt: <Q source={SRC}>مستطيل بعداه <MathText>{'$x + 4$'}</MathText> و <MathText>{'$x - 2$'}</MathText> (بالسنتيمتر) ومساحته <MathText>{'$16cm^2$'}</MathText>. المعادلة <MathText>{'$(x + 4)(x - 2) = 16$'}</MathText> تُكتب <MathText>{'$(x + 6)(x - 4) = 0$'}</MathText>. قيمة <MathText>{'$x$'}</MathText> هي:</Q>,
          options: [M('$x = 4$ فقط'), M('$x = 4$ أو $x = -6$'), M('$x = -6$'), M('$x = 2$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$x = -6$ أو $x = 4$ ، لكن البعد $x - 2$ يجب أن يكون موجبًا: $x = -6$ مرفوض. من أجل $x = 4$ : $8 \\times 2 = 16$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-mushkila_P2'] },
        },
        {
          id: 'E5', skill: 'tafsir', requires: ['tarrid-mutarajiha', 'tahaqquq-waqi'],
          prompt: <Q source={SRC}>مستطيل عرضه 5cm وطوله <MathText>{'$x$'}</MathText> سنتيمترًا (عدد طبيعي). ما أصغر طول يكون من أجله محيط المستطيل أكبر من 37cm؟</Q>,
          options: [M('13,5cm'), M('14cm'), M('13cm'), M('27cm')],
          correct: 1, cols: 2,
          explain: <MathText>{'$2x + 10 > 37$ أي $x > 13{,}5$ . الطول عدد طبيعي أكبر من $13{,}5$ ، وأصغرها 14 : المحيط $38 > 37$ ، أما 13 فيعطي $36$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-mushkila_P2'] },
        },
      ]}
      badges={[
        { id: 'tarjama', emoji: '🧩', label: 'من النص إلى المعادلة', test: (m) => (m.tarjama ?? 0) === 0 },
        { id: 'tafsir', emoji: '🔍', label: 'حلّ يلائم الواقع', test: (m) => (m.tafsir ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت ترييض مشكلة',
        title: 'انتهى الدرس 4',
        message: 'تعرف الآن كيف تسمّي المجهول، وتترجم نص مشكلة إلى معادلة أو متراجحة، وتحلّها، ثم تتأكّد أنّ الحل يلائم الواقع.',
        verbs: ['أسمّي', 'أعبّر', 'أحلّ', 'أتحقّق'],
        masterBadgeLabel: 'ترييض مشكلة',
      }}
    />
  );
}
