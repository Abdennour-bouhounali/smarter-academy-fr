import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la résolution de la feuille d'or de Nour en cinq épreuves qui suivent les trois étapes. Les épreuves restent LITTÉRALES ici
 * (l'audit les lit) ; `FINAL` (content/textbook.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js, qui vérifie que ce fichier contient chaque option.
 * Chaque distracteur est FAUX et porte une erreur de l'unité (exposants additionnés dans un quotient, préfixe non converti, facteur 0,1 oublié, quotient inversé, ordre de grandeur arrondi par excès,
 * encadrement décalé). LP : P1.
 */
const Q = ({ children }) => <span>{typeof children === 'string' ? <MathText>{children}</MathText> : children} <SourceTag source={SITUATION.source} /></span>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="خمس مراحل: قطر الذرّة وسُمك الرقيقة وعدد الطبقات ورتبة القدر والحصر" estimatedTime="12 دقيقة"
      lessonConfig={LESSON_CONFIG} timerSeconds={12 * 60} timerLabel="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي', title: 'كم طبقة من الذرّات في رقاقة الذهب؟', tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p> }}
      skills={{
        atom: { label: 'قطر الذرّة بالمتر', module: 4 },
        thick: { label: 'سُمك الرقيقة بالمتر', module: 2 },
        layers: { label: 'عدد الطبقات', module: 2 },
        order: { label: 'رتبة القدر', module: 6 },
        row: { label: 'الحصر', module: 6 },
      }}
      epreuves={[
        { id: 'E1', skill: 'atom', requires: ['ashara-salib', 'kitaba-ilmiya'], prompt: <Q>{'المرحلة 1 — قطر ذرّة الذهب بالمتر (كتابة علمية) هو ...'}</Q>,
          options: opts(['$2{,}88 \\times 10^{-10}\\ \\mathrm{m}$', '$2{,}88 \\times 10^{-12}\\ \\mathrm{m}$', '$288 \\times 10^{-10}\\ \\mathrm{m}$', '$2{,}88 \\times 10^{-9}\\ \\mathrm{m}$']), correct: 0, cols: 1,
          explain: <MathText>{'$288\\ \\mathrm{pm} = 288 \\times 10^{-12}\\ \\mathrm{m} = 2{,}88 \\times 10^{2} \\times 10^{-12} = 2{,}88 \\times 10^{-10}\\ \\mathrm{m}$ . الخطأ الأوّل أبقى الأسّ $-12$ دون إزاحة الفاصلة، والثاني كتب $288 \\times 10^{-10}$ وهو ليس القطر ($2{,}88 \\times 10^{-8}$)، والثالث أخذ الأسّ $-9$ فكأنّه حوّل من $\\mathrm{nm}$ لا من $\\mathrm{pm}$ .'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'] } },
        { id: 'E2', skill: 'thick', requires: ['ashara-salib', 'hasil-quwa-ashara'], prompt: <Q>{'المرحلة 2 — سُمك الرقيقة بالمتر هو ...'}</Q>,
          options: opts(['$10^{-7}\\ \\mathrm{m}$', '$10^{-5}\\ \\mathrm{m}$', '$10^{-6}\\ \\mathrm{m}$', '$10^{-8}\\ \\mathrm{m}$']), correct: 0, cols: 1,
          explain: <MathText>{'$0{,}1\\ \\mu\\mathrm{m} = 0{,}1 \\times 10^{-6}\\ \\mathrm{m} = 10^{-1} \\times 10^{-6} = 10^{-7}\\ \\mathrm{m}$ . الخطأ الأوّل عدّ $0{,}1$ كأنّه $10$ ، والثاني أهمل العامل $0{,}1$ فأبقى $10^{-6}$ ، والثالث أزاح الفاصلة مرّتين بدل مرّة.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'] } },
        { id: 'E3', skill: 'layers', requires: ['hasil-quwa-ashara', 'kitaba-ilmiya'], prompt: <Q>{'المرحلة 3 — عدد طبقات الذرّات في الرقيقة (كتابة علمية، بالتقريب) هو ...'}</Q>,
          options: opts(['$3{,}47 \\times 10^{2}$', '$3{,}47 \\times 10^{-17}$', '$3{,}47 \\times 10^{3}$', '$2{,}88 \\times 10^{-3}$']), correct: 0, cols: 1,
          explain: <MathText>{'$\\frac{10^{-7}}{2{,}88 \\times 10^{-10}} = \\frac{1}{2{,}88} \\times 10^{-7+10} \\approx 0{,}347 \\times 10^{3} = 3{,}47 \\times 10^{2}$ . الخطأ الأوّل جمع الأسّين ($-7 + (-10)$) بدل طرحهما، والثاني نسي إزاحة الفاصلة فأبقى $10^{3}$ ، والثالث قسم قطر الذرّة على السُّمك.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'] } },
        { id: 'E4', skill: 'order', requires: ['rutbat-qadr'], prompt: <Q>{'المرحلة 4 — رتبة قدر عدد الطبقات هي ...'}</Q>,
          options: opts(['$3 \\times 10^{2}$', '$4 \\times 10^{2}$', '$1 \\times 10^{2}$', '$3 \\times 10^{3}$']), correct: 0, cols: 1,
          explain: <MathText>{'عدد الطبقات $3{,}47 \\times 10^{2}$ ، ونُدوّر $3{,}47$ إلى الوحدة فنجد $3$ ، فرتبة القدر $3 \\times 10^{2}$ . الخطأ الأوّل دوّر إلى $4$ ، والثاني أخذ $1$ ، والثالث غيّر الأسّ.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'] } },
        { id: 'E5', skill: 'row', requires: ['kitaba-ilmiya', 'rutbat-qadr'], prompt: <Q>{'المرحلة 5 — عدد الذرّات المتجاورة على طول $1\\ \\mathrm{mm}$ محصور بين ...'}</Q>,
          options: opts(['$10^{6}$ و $10^{7}$', '$10^{5}$ و $10^{6}$', '$10^{7}$ و $10^{8}$', '$10^{-7}$ و $10^{-6}$']), correct: 0, cols: 1,
          explain: <MathText>{'$\\frac{10^{-3}}{2{,}88 \\times 10^{-10}} \\approx 0{,}347 \\times 10^{7} = 3{,}47 \\times 10^{6}$ ، و $10^{6} \\le 3{,}47 \\times 10^{6} < 10^{7}$ . الحصران الثاني والثالث يتجاوران الصحيح بدرجة، والرابع أسّاه سالبان.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🧩', label: 'أدمجت تعلّماتي', test: (m) => (m.atom ?? 0) + (m.thick ?? 0) + (m.layers ?? 0) + (m.order ?? 0) + (m.row ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أنهيت الوحدة 3', title: 'القوى ذات أسس نسبية صحيحة',
        message: 'قطر الذرّة $2{,}88 \\times 10^{-10}\\ \\mathrm{m}$ وسُمك الرقيقة $10^{-7}\\ \\mathrm{m}$ ، فتحوي حوالي $3{,}47 \\times 10^{2}$ طبقة من الذرّات. وظّفت قوى العدد 10 وقواعدها والكتابة العلمية ورتبة القدر في وضعية واحدة.',
        verbs: ['أقرأ', 'أحلّل', 'أحسب', 'أتحقّق'], masterBadgeLabel: 'الوحدة 3',
      }}
    />
  );
}
