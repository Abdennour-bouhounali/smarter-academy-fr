import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la résolution de l'atelier de nichoirs en cinq épreuves qui suivent les trois étapes (quotients par matière, nombre de nichoirs,
 * reste du stock, gain en une chaîne, décision d'achat). Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/textbook.js) porte les mêmes données, recalculées en BigInt par
 * ../content/content.test.js, qui vérifie que ce fichier contient chaque option. Chaque distracteur est FAUX et porte une erreur de l'unité. Pas de bonus. LP : P1 (les cinq épreuves).
 */
const Q = ({ children }) => <span>{typeof children === 'string' ? <MathText>{children}</MathText> : children} <SourceTag source={SITUATION.source} /></span>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="خمس مراحل: الحواصل والعدد والباقي والربح والقرار" estimatedTime="12 دقيقة"
      lessonConfig={LESSON_CONFIG} timerSeconds={12 * 60} timerLabel="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي', title: 'كم بيتًا يصنع نادي البيئة وبكم يربح؟', tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p> }}
      skills={{
        qisma: { label: 'القسمة لكلّ مادّة', module: 1 },
        aqall: { label: 'اختيار الأصغر', module: 2 },
        baqi: { label: 'حساب الباقي', module: 4 },
        ribh: { label: 'الربح بسلسلة واحدة', module: 2 },
        qarar: { label: 'اتخاذ القرار', module: 3 },
      }}
      epreuves={[
        { id: 'E1', skill: 'qisma', requires: ['silsila-bidun-aqwas-2am'], prompt: <Q>{'المرحلة 1 — بقسمة المخزون على حاجة البيت الواحد وأخذ الجزء الصحيح، تكفي الألواح لـ ... بيتًا والزوايا لـ ... والبراغي لـ ...'}</Q>,
          options: opts(['$7$ ؛ $6$ ؛ $7$', '$8$ ؛ $7$ ؛ $8$', '$7{,}5$ ؛ $6{,}5$ ؛ $7{,}5$', '$39$ ؛ $22$ ؛ $104$']), correct: 0, cols: 1,
          explain: <MathText>{'$45 \\div 6 = 7{,}5$ و $26 \\div 4 = 6{,}5$ و $120 \\div 16 = 7{,}5$ ؛ البيت الناقص لا يُباع فنأخذ الجزء الصحيح: $7$ و $6$ و $7$ . الخيار الثاني قرّب إلى الأعلى، والثالث أبقى الجزء العشري، والرابع طرح بدل أن يقسم.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'] } },
        { id: 'E2', skill: 'aqall', requires: ['silsila-bidun-aqwas-2am'], prompt: <Q>{'المرحلة 2 — عدد البيوت التي يمكن صنعها كاملة هو ...'}</Q>,
          options: opts(['$6$', '$7$', '$13$', '$20$']), correct: 0, cols: 1,
          explain: <MathText>{'كلّ بيت يحتاج إلى المواد الثلاث معًا، فالأصغر بين $7$ و $6$ و $7$ هو الذي يحدّ العدد: $6$ بيوت. الخيار الثاني أخذ الأكبر، والثالث جمع $7$ و $6$ ، والرابع جمع الأعداد الثلاثة.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'] } },
        { id: 'E3', skill: 'baqi', requires: ['silsila-bidun-aqwas-2am'], prompt: <Q>{'المرحلة 3 — بعد صنع هذه البيوت يبقى في المخزن ...'}</Q>,
          options: opts(['$9$ ألواح ، وزاويتان ، و $24$ برغيًا', '$3$ ألواح ، ولا زاوية ، و $8$ براغٍ', 'لا شيء يبقى', '$36$ لوحًا ، و $24$ زاوية ، و $96$ برغيًا']), correct: 0, cols: 1,
          explain: <MathText>{'مع $6$ بيوت: $45 - 6 \\times 6 = 9$ و $26 - 6 \\times 4 = 2$ و $120 - 6 \\times 16 = 24$ . الخيار الثاني حُسب لسبعة بيوت، والثالث ظنّ أنّ المخزن يفرغ، والرابع ذكر المستهلَك لا الباقي.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'] } },
        { id: 'E4', skill: 'ribh', requires: ['silsila-bi-aqwas-2am'], prompt: <Q>{'المرحلة 4 — سلسلة واحدة تعطي ربح النادي وقيمتها هي ...'}</Q>,
          options: opts(['$6 \\times 450 - (6 \\times 85 + 120) = 2070$', '$6 \\times 450 - 6 \\times 85 + 120 = 2310$', '$6 \\times (450 - 85 + 120) = 2910$', '$6 \\times 450 - 85 + 120 = 2735$']), correct: 0, cols: 1,
          explain: <MathText>{'المبيعات $6 \\times 450 = 2700$ ، والتكلفة طلاء $6$ بيوت وعلبة غراء واحدة: $6 \\times 85 + 120 = 630$ ، فالربح $2700 - 630 = 2070$ . القوسان يطرحان التكلفة كلّها. الخيار الثاني أضاف الغراء، والثالث ضرب الغراء في عدد البيوت، والرابع طرح طلاء بيت واحد.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'] } },
        { id: 'E5', skill: 'qarar', requires: ['silsila-bidun-aqwas-2am'], prompt: <Q>{'المرحلة 5 — لصنع $7$ بيوت يجب أن يشتري النادي من الزوايا ...'}</Q>,
          options: opts(['زاويتين', '4 زوايا', 'زاوية واحدة', '28 زاوية']), correct: 0, cols: 1,
          explain: <MathText>{'$7$ بيوت تحتاج إلى $4 \\times 7 = 28$ زاوية وفي المخزن $26$ ، فينقص $28 - 26 = 2$ . الخيار الثاني أخذ حاجة بيت واحد، والثالث نقص بزاوية، والرابع أخذ الحاجة كلّها دون خصم المخزون.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🧮', label: 'أدمجت تعلّماتي', test: (m) => (m.qisma ?? 0) + (m.aqall ?? 0) + (m.baqi ?? 0) + (m.ribh ?? 0) + (m.qarar ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أنهيت الوحدة 1', title: 'العمليات على الأعداد الطبيعية والأعداد العشرية',
        message: 'قسمت مخزون كلّ مادّة على حاجة البيت الواحد، وحدّدت أنّ الأصغر يحدّ العدد فيصنع النادي ست بيوت، وحسبت ما بقي في المخزن، وكتبت الربح بسلسلة واحدة بين قوسين فوجدته $2070\\,\\mathrm{DA}$ . وظّفت الأولوية والأقواس ووصف السلسلة وتوزيع الضرب في وضعية واحدة.',
        verbs: ['أقسم', 'أقارن', 'أكتب', 'أقرّر'], masterBadgeLabel: 'الوحدة 1',
      }}
    />
  );
}
