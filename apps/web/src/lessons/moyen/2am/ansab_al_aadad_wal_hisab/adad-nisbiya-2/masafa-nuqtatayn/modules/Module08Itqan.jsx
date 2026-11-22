import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune : trois distances (de part et d'autre du zéro, du même côté, deux positifs) dont la
 * première est réécrite à partir de « أؤكّد تعلّماتي » 9 (autres nombres), puis les deux points à distance 3 de M(−1) et le milieu d'un segment. Les épreuves restent LITTÉRALES ici (l'audit les lit) ;
 * `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
 */
const PLATFORM = addition('final_test_item');
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;

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
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة، ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        cross: { label: 'مسافة عبر الصفر', module: 1 },
        same: { label: 'مسافة في جهة واحدة', module: 1 },
        pos: { label: 'مسافة بين موجبين', module: 1 },
        points: { label: 'نقطتان على بعد معلوم', module: 1 },
        mid: { label: 'منتصف قطعة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'cross', requires: ['masafa-abr-sifr'],
          prompt: <Q source={SELF.E1.source}><MathText>{'النقطتان $A(-4)$ و $B(+9)$ . المسافة $AB$ :'}</MathText></Q>,
          options: ['$13$', '$5$', '$-13$', '$9$'], correct: 0, cols: 2,
          explain: <MathText>{'الفاصلة الكبرى $+9$ : $(+9)-(-4)=(+9)+(+4)=13$ ؛ لو كتبنا $9-4$ لنسينا أنّ الخرزتين على جانبي الصفر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_masafa-nuqtatayn_P1'] },
        },
        {
          id: 'E2', skill: 'same', requires: ['masafa-nafs-jiha'],
          prompt: <Q source={PLATFORM}><MathText>{'النقطتان $C(-7)$ و $D(-2)$ . المسافة $CD$ :'}</MathText></Q>,
          options: ['$5$', '$9$', '$-5$', '$-9$'], correct: 0, cols: 2,
          explain: <MathText>{'الفاصلة الكبرى $-2$ : $(-2)-(-7)=(-2)+(+7)=5$ ؛ والمسافة لا تكون سالبة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_masafa-nuqtatayn_P1'] },
        },
        {
          id: 'E3', skill: 'pos', requires: ['qaidat-masafa'],
          prompt: <Q source={PLATFORM}><MathText>{'النقطتان $E(+2{,}5)$ و $F(+11)$ . المسافة $EF$ :'}</MathText></Q>,
          options: ['$8{,}5$', '$13{,}5$', '$-8{,}5$', '$9$'], correct: 0, cols: 2,
          explain: <MathText>{'الفاصلة الكبرى $+11$ : $11-2{,}5=8{,}5$ ؛ والجمع $13{,}5$ يعطي عددًا لا علاقة له بالمسافة بينهما.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_masafa-nuqtatayn_P1'] },
        },
        {
          id: 'E4', skill: 'points', requires: ['nuqtatan'],
          prompt: <Q source={PLATFORM}><MathText>{'فاصلتا النقطتين اللتين تبعدان $3$ عن $M(-1)$ :'}</MathText></Q>,
          options: ['$-4$ و $+2$', '$+2$ فقط', '$-4$ فقط', '$-2$ و $+4$'], correct: 0, cols: 2,
          explain: <MathText>{'$-1-3=-4$ و $-1+3=+2$ : نقطتان، واحدة من كلّ جهة من $M$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_masafa-nuqtatayn_P2'] },
        },
        {
          id: 'E5', skill: 'mid', requires: ['tariqa-masafa'],
          prompt: <Q source={PLATFORM}><MathText>{'فاصلة منتصف $[AB]$ حيث $A(-6)$ و $B(+2)$ :'}</MathText></Q>,
          options: ['$-2$', '$4$', '$-4$', '$0$'], correct: 0, cols: 2,
          explain: <MathText>{'$AB=8$ ونصفها $4$ : $-6+4=-2$ ؛ المنتصف يبعد عن الطرفين بـ $4$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_masafa-nuqtatayn_P2'] },
        },
      ]}
      badges={[
        { id: 'cross', emoji: '🌡️', label: 'أحسب المسافة', test: (m) => (m.cross ?? 0) === 0 },
        { id: 'points', emoji: '📍', label: 'أجد النقطتين', test: (m) => (m.points ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت المسافة بين نقطتين',
        title: 'انتهى درس المسافة بين نقطتين على مستقيم مدرّج',
        message: 'تعرف الآن أنّ المسافة بين نقطتين هي الفاصلة الكبرى ناقص الفاصلة الصغرى، وأنّها موجبة دائمًا ولا تتغيّر إذا بدّلنا النقطتين، وأنّ لكلّ نقطة نقطتين تبعدان عنها بمسافة معلومة.',
        verbs: ['أحسب', 'أبرّر', 'أجد'],
        masterBadgeLabel: 'المسافة بين نقطتين',
      }}
    />
  );
}
