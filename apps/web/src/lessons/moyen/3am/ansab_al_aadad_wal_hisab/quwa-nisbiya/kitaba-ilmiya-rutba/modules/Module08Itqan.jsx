import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune : l'écriture scientifique d'un décimal (inspirée de « أؤكّد » 12),
 * celle d'un k × 10ᵖ (« أؤكّد » 14), l'encadrement (« أؤكّد » 20), le rang de grandeur (« أؤكّد » 19) et un classement (« أؤكّد » 21). Les épreuves restent LITTÉRALES ici (l'audit les lit) ;
 * `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
 */
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
        sci: { label: 'الكتابة العلمية لعدد', module: 1 },
        hasr: { label: 'الحصر بين قوتين متتاليتين للعدد 10', module: 1 },
        rutba: { label: 'رتبة القدر', module: 1 },
        muqarana: { label: 'ترتيب أعداد بكتابتها العلمية', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'sci', requires: ['tariqa-ilmiya'],
          prompt: <Q source={SELF.E1.source}><MathText>{'الكتابة العلمية للعدد $6\\,040\\,000$ هي:'}</MathText></Q>,
          options: ['$6{,}04\\times10^{6}$', '$604\\times10^{4}$', '$6{,}04\\times10^{5}$', '$6{,}04\\times10^{7}$'], correct: 0, cols: 2,
          explain: <MathText>{'نزيح الفاصلة ست رتب نحو اليسار: $6{,}04 \\times 10^{6}$ . ($604 \\times 10^{4}$ تساويه لكنّ $604$ ليس من 1 إلى أقل من 10 ، والباقي يخطئ في عدد الرتب.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_kitaba-ilmiya-rutba_P1'] },
        },
        {
          id: 'E2', skill: 'sci', requires: ['tariqa-ilmiya'],
          prompt: <Q source={SELF.E2.source}><MathText>{'الكتابة العلمية للعدد $0{,}035\\times10^{-2}$ هي:'}</MathText></Q>,
          options: ['$3{,}5\\times10^{-4}$', '$3{,}5\\times10^{0}$', '$35\\times10^{-5}$', '$3{,}5\\times10^{-3}$'], correct: 0, cols: 2,
          explain: <MathText>{'$0{,}035 = 3{,}5 \\times 10^{-2}$ ، ثم $10^{-2} \\times 10^{-2} = 10^{-4}$ : $3{,}5 \\times 10^{-4}$ . ($35 \\times 10^{-5}$ تساويه لكنّها ليست علمية.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_kitaba-ilmiya-rutba_P1'] },
        },
        {
          id: 'E3', skill: 'hasr', requires: ['hasr-quwatayn'],
          prompt: <Q source={SELF.E3.source}><MathText>{'أيّ هذه الأعداد محصور بين $10^{-3}$ و $10^{-2}$ ؟'}</MathText></Q>,
          options: ['$0{,}0042$', '$0{,}042$', '$4{,}2\\times10^{-4}$', '$42\\times10^{-2}$'], correct: 0, cols: 2,
          explain: <MathText>{'$0{,}0042 = 4{,}2 \\times 10^{-3}$ ، فهو بين $10^{-3}$ و $10^{-2}$ . ($0{,}042$ أكبر من $10^{-2}$ ، و $4{,}2 \\times 10^{-4}$ أصغر من $10^{-3}$ ، و $42 \\times 10^{-2} = 0{,}42$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_kitaba-ilmiya-rutba_P2'] },
        },
        {
          id: 'E4', skill: 'rutba', requires: ['rutbat-qadr'],
          prompt: <Q source={SELF.E4.source}><MathText>{'رتبة قدر $0{,}000786$ هي:'}</MathText></Q>,
          options: ['$8\\times10^{-4}$', '$7\\times10^{-4}$', '$8\\times10^{-3}$', '$1\\times10^{-3}$'], correct: 0, cols: 2,
          explain: <MathText>{'$0{,}000786 = 7{,}86 \\times 10^{-4}$ ، ومدوّر $7{,}86$ إلى الوحدة هو 8 : $8 \\times 10^{-4}$ . ($7 \\times 10^{-4}$ يحذف ما بعد الفاصلة، و $1 \\times 10^{-3}$ هي القوة التالية.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_kitaba-ilmiya-rutba_P3'] },
        },
        {
          id: 'E5', skill: 'muqarana', requires: ['muqarana-ilmiya'],
          prompt: <Q source={SELF.E5.source}><MathText>{'نعتبر $A=5{,}1\\times10^{-6}$ و $B=48\\times10^{-7}$ و $C=0{,}6\\times10^{-5}$ . الترتيب التصاعدي هو:'}</MathText></Q>,
          options: ['$B<A<C$', '$A<B<C$', '$C<A<B$', '$B<C<A$'], correct: 0, cols: 2,
          explain: <MathText>{'نكتبها كتابة علمية: $A = 5{,}1 \\times 10^{-6}$ ، $B = 4{,}8 \\times 10^{-6}$ ، $C = 6 \\times 10^{-6}$ ؛ الأسّ واحد فنقارن العددين $a$ : $4{,}8 < 5{,}1 < 6$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_kitaba-ilmiya-rutba_P3'] },
        },
      ]}
      badges={[
        { id: 'sci', emoji: '🪜', label: 'أكتب كتابة علمية', test: (m) => (m.sci ?? 0) === 0 },
        { id: 'rank', emoji: '🎯', label: 'أحصر وأعطي رتبة القدر', test: (m) => (m.hasr ?? 0) === 0 && (m.rutba ?? 0) === 0 && (m.muqarana ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الكتابة العلمية ورتبة القدر',
        title: 'انتهى درس الكتابة العلمية ورتبة القدر',
        message: 'تعرف الآن أنّ الكتابة العلمية هي $a \\times 10^n$ حيث $1 \\le a < 10$ ، وأنّ $10^n \\le A < 10^{n+1}$ ، وأنّ رتبة القدر هي $a\' \\times 10^n$ حيث $a\'$ مدوّر $a$ إلى الوحدة، وتقارن مقادير كبيرة وصغيرة جدًا بكتابتها العلمية.',
        verbs: ['أُزيح', 'أحصر', 'أدوّر'],
        masterBadgeLabel: 'الكتابة العلمية ورتبة القدر',
      }}
    />
  );
}
