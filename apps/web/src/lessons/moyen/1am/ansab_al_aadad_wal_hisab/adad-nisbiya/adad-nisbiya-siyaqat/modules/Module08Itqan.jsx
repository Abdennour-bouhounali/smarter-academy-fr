import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (« أقوّم تعلّماتي » 1 réécrit
 * en E2, autres nombres) : une الكفاءة principale par épreuve. Toutes les clés sont recalculées en arithmétique décimale exacte dans
 * ../content/content.test.js ; chaque distracteur y est vérifié FAUX.
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
        situation: { label: 'وضعية بعدد نسبي', module: 1 },
        count: { label: 'العدد السالب', module: 2 },
        dist: { label: 'المسافة إلى الصفر', module: 1 },
        opp: { label: 'العدد المعاكس', module: 1 },
        cold: { label: 'الأبرد هو الأصغر', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'situation', requires: ['sayaqat-salib'],
          prompt: <Q source={PLATFORM}><MathText>{'غوّاص عمقه 15 م تحت سطح البحر. نكتب ارتفاعه بالنسبة إلى سطح البحر بالعدد:'}</MathText></Q>,
          options: ['$-15$', '$15$', '$0{,}15$', '$-1{,}5$'], correct: 0, cols: 2,
          explain: <MathText>{'تحت سطح البحر هو تحت الصفر، فالعدد سالب: $-15$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-nisbiya-siyaqat_P1'] },
        },
        {
          id: 'E2', skill: 'count', requires: ['adad-nisbi'],
          prompt: <Q source={SELF[1].source}><MathText>{'في قائمة الأعداد النسبية $-6$ ؛ $2$ ؛ $-0{,}5$ ؛ $7$ ؛ $-1$ ، عدد الأعداد السالبة هو:'}</MathText></Q>,
          options: ['3', '2', '5', '1'], correct: 0, cols: 2,
          explain: <MathText>{'الأعداد التي تسبقها الإشارة − هي $-6$ و $-0{,}5$ و $-1$ : ثلاثة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-nisbiya-siyaqat_P2'] },
        },
        {
          id: 'E3', skill: 'dist', requires: ['ishara-masafa'],
          prompt: <Q source={PLATFORM}><MathText>{'المسافة إلى الصفر للعدد $-9$ هي:'}</MathText></Q>,
          options: ['$9$', '$-9$', '$0$', '$-1$'], correct: 0, cols: 2,
          explain: <MathText>{'المسافة لا تكون سالبة: هي العدد دون إشارته، $9$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-nisbiya-siyaqat_P2'] },
        },
        {
          id: 'E4', skill: 'opp', requires: ['adad-mutaakisan'],
          prompt: <Q source={PLATFORM}><MathText>{'معاكس العدد $-8$ هو:'}</MathText></Q>,
          options: ['$8$', '$-8$', '$-7$', '$0$'], correct: 0, cols: 2,
          explain: <MathText>{'له المسافة نفسها إلى الصفر على الجهة الأخرى: $8$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-nisbiya-siyaqat_P3'] },
        },
        {
          id: 'E5', skill: 'cold', requires: ['sayaqat-salib'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ القراءات الآتية هي الأبرد: $2$ ؛ $-1$ ؛ $-4$ ؛ $0$ ؟'}</MathText></Q>,
          options: ['$-4$', '$-1$', '$2$', '$0$'], correct: 0, cols: 2,
          explain: <MathText>{'الأبرد هو الأصغر: $-4<-1<0<2$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_adad-nisbiya-siyaqat_P2'] },
        },
      ]}
      badges={[
        { id: 'salib', emoji: '🌡️', label: 'أقرأ الأعداد السالبة', test: (m) => (m.situation ?? 0) === 0 && (m.count ?? 0) === 0 && (m.cold ?? 0) === 0 },
        { id: 'moakis', emoji: '🪞', label: 'أميّز المسافة والمعاكس', test: (m) => (m.dist ?? 0) === 0 && (m.opp ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الأعداد النسبية الأولى',
        title: 'انتهى درس الأعداد النسبية وسياقات استعمالها',
        message: 'تعرف الآن أنّ العدد النسبي موجب أو سالب، وأنّ لكلّ عدد إشارة ومسافة إلى الصفر مختلفتين، وأنّ العددين المتعاكسين لهما المسافة نفسها إلى الصفر وإشارتان متعاكستان.',
        verbs: ['أقرأ', 'أميّز', 'أعاكس'],
        masterBadgeLabel: 'الأعداد النسبية',
      }}
    />
  );
}
