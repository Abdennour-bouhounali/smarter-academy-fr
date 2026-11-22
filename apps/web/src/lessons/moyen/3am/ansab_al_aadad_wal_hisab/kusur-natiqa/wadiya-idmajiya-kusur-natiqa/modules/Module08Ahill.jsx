import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la résolution de la tirelire de Meriem en cinq épreuves qui suivent les trois étapes. Les épreuves restent LITTÉRALES ici
 * (l'audit les lit) ; `FINAL` (content/textbook.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js, qui vérifie que ce fichier contient chaque option.
 * Chaque distracteur est FAUX et porte une erreur de l'unité (addition des numérateurs et des dénominateurs, produit pour somme, fraction « du tout » au lieu « du reste », base fausse,
 * division lue comme produit, fractions de touts différents comparées). LP : P1.
 */
const Q = ({ children }) => <span>{typeof children === 'string' ? <MathText>{children}</MathText> : children} <SourceTag source={SITUATION.source} /></span>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="خمس مراحل: المُنفَق والباقي والهدية وما بقي في النهاية والمبلغ" estimatedTime="12 دقيقة"
      lessonConfig={LESSON_CONFIG} timerSeconds={12 * 60} timerLabel="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي', title: 'ما المبلغ الذي ادّخرته مريم؟', tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p> }}
      skills={{
        jam: { label: 'جمع كسرين', module: 4 },
        rest: { label: 'الباقي بعد كسر', module: 4 },
        gift: { label: 'كسر من الباقي', module: 1 },
        left: { label: 'ما بقي في النهاية', module: 2 },
        total: { label: 'الكلّ من جزئه', module: 3 },
      }}
      epreuves={[
        { id: 'E1', skill: 'jam', requires: ['jam-tarh-kasrayn-3am'], prompt: <Q>المرحلة 1 — الكسر الذي يمثّل ما أنفقته مريم على الحقيبة والكتب هو ...</Q>,
          options: opts(['$\\frac{1}{3} + \\frac{1}{4} = \\frac{7}{12}$', '$\\frac{1 + 1}{3 + 4} = \\frac{2}{7}$', '$\\frac{1}{3} \\times \\frac{1}{4} = \\frac{1}{12}$', '$1 - \\frac{7}{12} = \\frac{5}{12}$']), correct: 0, cols: 1,
          explain: <MathText>{'ما أنفقته أجزاء من المبلغ نفسه، فنجمعها بمقام مشترك: $\\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}$ . الخطأ الأوّل جمع البسطين والمقامين، والثاني ضرب بدل الجمع، والثالث هو الباقي لا المُنفَق.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'] } },
        { id: 'E2', skill: 'rest', requires: ['jam-tarh-kasrayn-3am'], prompt: <Q>المرحلة 2 — الكسر الذي يمثّل الباقي بعد الحقيبة والكتب هو ...</Q>,
          options: opts(['$1 - \\frac{7}{12} = \\frac{5}{12}$', '$\\frac{7}{12}$', '$1 - \\frac{2}{7} = \\frac{5}{7}$', '$1 - \\frac{1}{12} = \\frac{11}{12}$']), correct: 0, cols: 1,
          explain: <MathText>{'الباقي هو الكلّ ناقص المُنفَق: $\\frac{12}{12} - \\frac{7}{12} = \\frac{5}{12}$ . الخطأ الأوّل أخذ المُنفَق على أنّه الباقي، والآخران طرحا من الكلّ مجموعًا خاطئًا.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'] } },
        { id: 'E3', skill: 'gift', requires: ['jida-kasrayn-2am'], prompt: <Q>المرحلة 3 — الكسر الذي تمثّله الهدية من المبلغ كلّه هو ...</Q>,
          options: opts(['$\\frac{3}{5} \\times \\frac{5}{12} = \\frac{1}{4}$', '$\\frac{3}{5}$', '$\\frac{3}{5} \\times \\frac{7}{12} = \\frac{7}{20}$', '$\\frac{3}{12} + \\frac{5}{12} = \\frac{2}{3}$']), correct: 0, cols: 1,
          explain: <MathText>{'الثلاثة أخماس هي من الباقي $\\frac{5}{12}$ : $\\frac{3}{5} \\times \\frac{5}{12} = \\frac{15}{60} = \\frac{1}{4}$ . الخطأ الأوّل جعلها من المبلغ كلّه، والثاني أخذها من المُنفَق، والثالث جمع كسرين بلا معنى في الوضعية.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'] } },
        { id: 'E4', skill: 'left', requires: ['jam-tarh-kasrayn-3am', 'adad-natiq-3am'], prompt: <Q>المرحلة 4 — الكسر الذي يمثّل ما بقي لمريم في النهاية هو ...</Q>,
          options: opts(['$\\frac{5}{12} - \\frac{1}{4} = \\frac{1}{6}$', '$1 - \\frac{1}{3} - \\frac{1}{4} - \\frac{3}{5} = -\\frac{11}{60}$', '$\\frac{1}{4}$', '$\\frac{7}{12} - \\frac{1}{4} = \\frac{1}{3}$']), correct: 0, cols: 1,
          explain: <MathText>{'نطرح الهدية من الباقي: $\\frac{5}{12} - \\frac{3}{12} = \\frac{2}{12} = \\frac{1}{6}$ . الخطأ الأوّل عدّ $\\frac{3}{5}$ من الكلّ فخرج عدد سالب، والثاني هو الهدية لا الباقي، والثالث طرحها من المُنفَق.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'] } },
        { id: 'E5', skill: 'total', requires: ['maqlub-qismat-kasrayn-3am'], prompt: <Q>المرحلة 5 — بقي في النهاية $1500$ DA . ما المبلغ الذي ادّخرته مريم؟ وما أكبر إنفاق لها؟</Q>,
          options: opts(['$9000$ DA ؛ أكبر إنفاق هو الحقيبة ($3000$ DA)', '$250$ DA ؛ أكبر إنفاق هو الحقيبة', '$9000$ DA ؛ أكبر إنفاق هو الهدية لأنّ $\\frac{3}{5} > \\frac{1}{3}$', '$6000$ DA ؛ أكبر إنفاق هو الحقيبة ($2000$ DA)']), correct: 0, cols: 1,
          explain: <MathText>{'$1500 \\div \\frac{1}{6} = 1500 \\times 6 = 9000$ DA . الحقيبة $\\frac{1}{3} \\times 9000 = 3000$ ، والكتب $\\frac{1}{4} \\times 9000 = 2250$ ، والهدية $\\frac{1}{4} \\times 9000 = 2250$ . لا نقارن $\\frac{3}{5}$ بـ $\\frac{1}{3}$ لأنّهما كسران من شيئين مختلفين.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '💰', label: 'أدمجت تعلّماتي', test: (m) => (m.jam ?? 0) + (m.rest ?? 0) + (m.gift ?? 0) + (m.left ?? 0) + (m.total ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أنهيت الوحدة 2', title: 'العمليات على الكسور والأعداد الناطقة',
        message: 'أنفقت مريم $\\frac{7}{12}$ وأهدت $\\frac{1}{4}$ وبقي لها $\\frac{1}{6}$ ، أي $1500$ DA من $9000$ DA . وظّفت الجمع والطرح والمقلوب والقسمة وكسر الباقي في وضعية واحدة.',
        verbs: ['أقرأ', 'أحلّل', 'أحسب', 'أتحقّق'], masterBadgeLabel: 'الوحدة 2',
      }}
    />
  );
}
