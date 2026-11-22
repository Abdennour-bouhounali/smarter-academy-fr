import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, de la plateforme (aucune n'est un exercice du manuel retapé). Les épreuves
 * restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce
 * module contient chaque option. Chaque distracteur est une erreur nommée (jamtarh : on additionne les haut et les bas, on ne change pas les numérateurs, le plus grand dénominateur, la somme, le produit seul, n − a/b).
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
        jam: { label: 'جمع كسرين', module: 2 },
        mushtarak: { label: 'المقام المشترك', module: 3 },
        tarh: { label: 'طرح كسرين', module: 2 },
        natural: { label: 'عدد طبيعي وكسر', module: 3 },
        baqi: { label: 'الجزء الباقي', module: 4 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'jam', requires: ['qaida-jam-tarh'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\frac{2}{3}+\\frac{1}{4}$'}</MathText></Q>,
          options: ['$\\frac{11}{12}$', '$\\frac{3}{7}$', '$\\frac{3}{12}$', '$\\frac{11}{7}$'], correct: 0, cols: 2,
          explain: <MathText>{'المقام المشترك $12$ : $\\frac{8}{12}+\\frac{3}{12}=\\frac{11}{12}$ . ($\\frac{3}{7}$ جمع البسطين والمقامين؛ $\\frac{3}{12}$ لم يغيّر البسطين؛ $\\frac{11}{7}$ جمع المقامين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jam-tarh-kasrayn_P2'] },
        },
        {
          id: 'E2', skill: 'mushtarak', requires: ['asghar-mudaaf'],
          prompt: <Q source={PLATFORM}><MathText>{'أصغر مقام مشترك لـ $\\frac{3}{10}$ و $\\frac{5}{8}$'}</MathText></Q>,
          options: ['$40$', '$80$', '$18$', '$10$'], correct: 0, cols: 4,
          explain: <MathText>{'مضاعفات $10$ : $10$ ، $20$ ، $30$ ، $40$ ، ويقبل $40$ القسمة على $8$ . ($80$ مقام مشترك لكنّه ليس الأصغر؛ $18$ مجموع المقامين؛ $10$ لا يقبل القسمة على $8$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jam-tarh-kasrayn_P3'] },
        },
        {
          id: 'E3', skill: 'tarh', requires: ['tawhid-qabl-jam'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\frac{5}{6}-\\frac{3}{4}$'}</MathText></Q>,
          options: ['$\\frac{1}{12}$', '$\\frac{2}{2}$', '$\\frac{2}{12}$', '$\\frac{1}{24}$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{10}{12}-\\frac{9}{12}=\\frac{1}{12}$ . ($\\frac{2}{2}$ طرح البسطين والمقامين؛ $\\frac{2}{12}$ لم يغيّر البسطين؛ $\\frac{1}{24}$ ضرب المقامين دون تغيير البسطين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jam-tarh-kasrayn_P1'] },
        },
        {
          id: 'E4', skill: 'natural', requires: ['qaida-jam-tarh'],
          prompt: <Q source={PLATFORM}><MathText>{'$3-\\frac{5}{8}$'}</MathText></Q>,
          options: ['$\\frac{19}{8}$', '$-\\frac{2}{8}$', '$\\frac{2}{5}$', '$\\frac{19}{5}$'], correct: 0, cols: 2,
          explain: <MathText>{'$3=\\frac{24}{8}$ ، و $\\frac{24}{8}-\\frac{5}{8}=\\frac{19}{8}$ . ($-\\frac{2}{8}$ طرح البسط $5$ من العدد $3$ وأبقى المقام؛ البقيّة أخطاء في المقام.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jam-tarh-kasrayn_P2'] },
        },
        {
          id: 'E5', skill: 'baqi', requires: ['qaida-jam-tarh'],
          prompt: <Q source={PLATFORM}><MathText>{'زُرع $\\frac{1}{3}$ حقل قمحًا و $\\frac{2}{9}$ منه شعيرًا. ما الجزء غير المزروع؟'}</MathText></Q>,
          options: ['$\\frac{4}{9}$', '$\\frac{3}{4}$', '$\\frac{5}{9}$', '$\\frac{1}{3}$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{1}{3}=\\frac{3}{9}$ ، فالمزروع $\\frac{3}{9}+\\frac{2}{9}=\\frac{5}{9}$ ، والباقي $1-\\frac{5}{9}=\\frac{4}{9}$ . ($\\frac{5}{9}$ هو المزروع لا الباقي؛ $\\frac{3}{4}$ جمع البسطين والمقامين ثمّ طرح من $1$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jam-tarh-kasrayn_P2'] },
        },
      ]}
      badges={[
        { id: 'jam', emoji: '🌱', label: 'أجمع كسرين', test: (m) => (m.jam ?? 0) === 0 && (m.natural ?? 0) === 0 },
        { id: 'mushtarak', emoji: '🔗', label: 'أختار المقام المشترك', test: (m) => (m.mushtarak ?? 0) === 0 && (m.tarh ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت جمع الكسور وطرحها',
        title: 'انتهى درس جمع وطرح كسرين',
        message: 'تعرف الآن أنّنا لا نجمع إلا أجزاءً من النوع نفسه، فنكتب الكسرين بمقام مشترك، ويفضّل أصغر مضاعف مشترك، ثمّ نجمع أو نطرح البسطين ونختزل.',
        verbs: ['أوحّد', 'أجمع', 'أطرح'],
        masterBadgeLabel: 'جمع وطرح كسرين',
      }}
    />
  );
}
