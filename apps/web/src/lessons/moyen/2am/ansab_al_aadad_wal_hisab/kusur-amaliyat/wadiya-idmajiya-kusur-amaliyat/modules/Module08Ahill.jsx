import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la résolution de la terre de la coopérative en cinq épreuves qui suivent les trois étapes. Les épreuves restent LITTÉRALES ici
 * (l'audit les lit) ; `FINAL` (content/textbook.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js, qui vérifie que ce fichier contient chaque option.
 * Chaque distracteur est FAUX et porte une erreur de l'unité (addition des numérateurs et des dénominateurs, 1/4 lu 1/8, fraction « de la terre » au lieu « du verger », produit croisé,
 * périmètre pour aire, encadrement arrondi, quotient retourné, mauvaise aire). LP : P1.
 */
const Q = ({ children }) => <span>{typeof children === 'string' ? <MathText>{children}</MathText> : children} <SourceTag source={SITUATION.source} /></span>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="خمس مراحل: المزروع والبستان والتفّاح والمساحات ومردود القمح" estimatedTime="12 دقيقة"
      lessonConfig={LESSON_CONFIG} timerSeconds={12 * 60} timerLabel="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي', title: 'ما مساحة التفّاح؟ وكم يُنتَج من القمح؟', tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p> }}
      skills={{
        jam: { label: 'جمع كسور', module: 3 },
        rest: { label: 'الباقي والمقارنة', module: 5 },
        apple: { label: 'كسر من كسر', module: 2 },
        area: { label: 'المساحات', module: 1 },
        yield: { label: 'حصر حاصل قسمة', module: 4 },
      }}
      epreuves={[
        { id: 'E1', skill: 'jam', requires: ['jam-tarh-kusur-2am'], prompt: <Q>المرحلة 1 — الكسر الذي يمثّله ما زُرع قمحًا وبطاطا وزيتونًا من الأرض هو ...</Q>,
          options: opts(['$\\frac{3}{8} + \\frac{1}{4} + \\frac{1}{8} = \\frac{3}{8} + \\frac{2}{8} + \\frac{1}{8} = \\frac{3}{4}$', '$\\frac{3 + 1 + 1}{8 + 4 + 8} = \\frac{5}{20}$', '$\\frac{3}{8} + \\frac{1}{8} + \\frac{1}{8} = \\frac{5}{8}$', '$\\frac{3 + 2 + 1}{8 + 8 + 8} = \\frac{6}{24}$']), correct: 0, cols: 1,
          explain: <MathText>{'الأجزاء من الأرض نفسها، فنجمعها بمقام مشترك هو $8$ : $\\frac{3}{8} + \\frac{2}{8} + \\frac{1}{8} = \\frac{6}{8} = \\frac{3}{4}$ . الخطأ الأوّل جمع البسوط والمقامات، والثاني كتب $\\frac{1}{4}$ على أنّه $\\frac{1}{8}$ ، والثالث كتب البسوط صحيحة لكنّه جمع المقامات.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'] } },
        { id: 'E2', skill: 'rest', requires: ['jam-tarh-kusur-2am', 'muqarana-kasrayn-2am'], prompt: <Q>المرحلة 2 — الكسر الذي يمثّله البستان من الأرض، وأكبر الأجزاء المزروعة.</Q>,
          options: opts(['البستان $1 - \\frac{3}{4} = \\frac{1}{4}$ ؛ الأكبر القمح ($\\frac{3}{8} > \\frac{1}{4} > \\frac{1}{8}$)', 'البستان $\\frac{3}{4}$ ؛ الأكبر القمح', 'البستان $\\frac{1}{4}$ ؛ الأكبر الزيتون لأنّ مقامه $8$ هو الأكبر', 'البستان $1 - \\frac{3}{8} = \\frac{5}{8}$ ؛ الأكبر القمح']), correct: 0, cols: 1,
          explain: <MathText>{'ما بقي هو الكلّ ناقص المزروع: $\\frac{4}{4} - \\frac{3}{4} = \\frac{1}{4}$ . وبالمقام $8$ : $\\frac{3}{8} > \\frac{2}{8} > \\frac{1}{8}$ فالقمح أكبر. الخطأ الأوّل أخذ المزروع على أنّه البستان، والثاني ظنّ أنّ المقام الأكبر يعطي الكسر الأكبر، والثالث نسي البطاطا والزيتون.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'] } },
        { id: 'E3', skill: 'apple', requires: ['jida-kasrayn-2am'], prompt: <Q>المرحلة 3 — الكسر الذي يمثّله التفّاح من الأرض كلّها هو ...</Q>,
          options: opts(['$\\frac{2}{3} \\times \\frac{1}{4} = \\frac{2}{12} = \\frac{1}{6}$', '$\\frac{2}{3}$ من الأرض', '$\\frac{2}{3} + \\frac{1}{4} = \\frac{11}{12}$', '$\\frac{2 \\times 4}{3 \\times 1} = \\frac{8}{3}$']), correct: 0, cols: 1,
          explain: <MathText>{'الثلثان هما من البستان $\\frac{1}{4}$ لا من الأرض: $\\frac{2}{3} \\times \\frac{1}{4} = \\frac{2}{12} = \\frac{1}{6}$ . الخطأ الأوّل جعلهما من الأرض كلّها، والثاني جمع بدل الضرب، والثالث ضرب بالتصالب.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'] } },
        { id: 'E4', skill: 'area', requires: ['jida-kasrayn-2am'], prompt: <Q>المرحلة 4 — ما مساحة الأرض كلّها؟ وما مساحة التفّاح؟</Q>,
          options: opts(['$120 \\times 80 = 9600\\,\\text{m}^2$ ؛ التفّاح $\\frac{1}{6} \\times 9600 = 1600\\,\\text{m}^2$', '$2 \\times (120 + 80) = 400\\,\\text{m}^2$ ؛ التفّاح $\\frac{1}{6} \\times 400 = \\frac{200}{3}\\,\\text{m}^2$', '$9600\\,\\text{m}^2$ ؛ التفّاح $\\frac{2}{3} \\times 9600 = 6400\\,\\text{m}^2$', '$9600\\,\\text{m}^2$ ؛ التفّاح $\\frac{1}{4} \\times 9600 = 2400\\,\\text{m}^2$']), correct: 0, cols: 1,
          explain: <MathText>{'مساحة المستطيل جداء بعديه: $9600$ ، وربعها بستان وسدسها تفّاح: $\\frac{1}{6} \\times 9600 = 1600$ . الخطأ الأوّل حسب المحيط ($400$) بدل المساحة، والثاني أخذ $\\frac{2}{3}$ من الأرض كلّها، والثالث عدّ البستان كلّه تفّاحًا.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'] } },
        { id: 'E5', skill: 'yield', requires: ['kasr-hasil-qisma-2am'], prompt: <Q>{'المرحلة 5 — احصر مردود القمح في المتر المربّع الواحد إلى $0{,}01$ (بالنقصان وبالزيادة).'}</Q>,
          options: opts(['$0{,}48 < \\frac{1750}{3600} < 0{,}49$ kg', '$0{,}49 < \\frac{1750}{3600} < 0{,}50$ kg', '$2{,}05 < \\frac{3600}{1750} < 2{,}06$ kg', '$0{,}72 < \\frac{1750}{2400} < 0{,}73$ kg']), correct: 0, cols: 1,
          explain: <MathText>{'حقل القمح $\\frac{3}{8} \\times 9600 = 3600\\,\\text{m}^2$ ، و $\\frac{1750}{3600} = 0{,}4861\\ldots$ فهو بين $0{,}48$ و $0{,}49$ ( $3600 \\times 0{,}48 = 1728 \\le 1750 < 1764 = 3600 \\times 0{,}49$ ). الخطأ الأوّل جعل $0{,}49$ حدًّا أدنى، والثاني قلب القسمة، والثالث قسم على مساحة حقل البطاطا.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🧩', label: 'أدمجت تعلّماتي', test: (m) => (m.jam ?? 0) + (m.rest ?? 0) + (m.apple ?? 0) + (m.area ?? 0) + (m.yield ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أنهيت الوحدة 2', title: 'الكسور والعمليات عليها',
        message: 'زُرع $\\frac{3}{4}$ من الأرض وبقي بستان هو $\\frac{1}{4}$ ، منه تفّاح $\\frac{1}{6}$ من الأرض أي $1600\\,\\text{m}^2$ ، وحقل القمح $3600\\,\\text{m}^2$ يعطي بين $0{,}48$ و $0{,}49$ كيلوغرام في المتر المربّع. وظّفت القسمة والحصر والجمع والجداء والمقارنة في وضعية واحدة.',
        verbs: ['أقرأ', 'أحلّل', 'أحسب', 'أتحقّق'], masterBadgeLabel: 'الوحدة 2',
      }}
    />
  );
}
