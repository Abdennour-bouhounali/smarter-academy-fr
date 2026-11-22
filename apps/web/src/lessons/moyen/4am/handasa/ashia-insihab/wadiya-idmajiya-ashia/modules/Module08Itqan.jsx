import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST } from '../content/textbook';
import { TEST_FIGURE } from '../content/figures';

/**
 * Module 8 (ex-4) — وضعية الاختبار النهائي (stage: evaluation) : la وضعية TRANSPOSÉE (extraction › situation › duplicatedIn module 8) —
 * une passerelle au-dessus de l'autoroute à Oran (content/textbook.js › TEST, un carreau = 10 m) ; aucune réponse
 * n'apparaît ailleurs dans la leçon.
 *   E1 (P2)  ce qui ne varie pas : MN = 30 m
 *   E2 (P3)  B′ image de B par la translation de vecteur NM
 *   E3 (P2)  MB′BN متوازي أضلاع (pas un rectangle en général)
 *   E4 (P1)  M sur [AB′]
 *   E5 (P3)  AB′ = √(90² + 60²) = 30√13 ≈ 108,2 m
 *   E6 (P1)  le plus court trajet : AB′ + MN ≈ 138,2 m
 * Chaque distracteur est FAUX (MISC-SHUAA-ITTIJAH-MUAKKAS, MISC-SHUAA-MAMAR-MUBASHIR, MISC-SHUAA-JAM-ATWAL,
 * MISC-SHUAA-TARTIB-RUUS) ; une seule LP primaire par épreuve, les trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['$MN = 30\\,\\mathrm{m}$', 'AM', 'NB', '$AM + NB$'];
const O2 = ['$\\overrightarrow{NM}$', '$\\overrightarrow{MN}$', '$\\overrightarrow{AB}$', '$\\overrightarrow{NB}$'];
const O3 = ['متوازي أضلاع', 'مستطيل', 'مربع', 'رباعي ليس له ضلعان متوازيان'];
const O4 = ["على القطعة $[AB']$", 'على القطعة [AB]', 'أمام A مباشرة', 'في منتصف المسافة الأفقية بين A و B'];
const O5 = ['$30\\sqrt{13} \\approx 108{,}2\\,\\mathrm{m}$', '$90\\sqrt{2} \\approx 127{,}3\\,\\mathrm{m}$', '$150\\,\\mathrm{m}$', '$60\\,\\mathrm{m}$'];
const O6 = ['$138{,}2\\,\\mathrm{m}$', '$108{,}2\\,\\mathrm{m}$', '$157{,}3\\,\\mathrm{m}$', '$180\\,\\mathrm{m}$'];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="وضعية أخرى: الموارد نفسها، أعداد أخرى" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={7 * 60} timerLabel="7 دقائق"
      brief={{
        tag: 'أدمج تعلّماتي — وضعية من المنصّة', title: TEST.title, tone: 'amber',
        body: (
          <div className="space-y-2" data-situation="itqan">
            <p><MathText>{TEST.text}</MathText></p>
            <GeoFigure {...TEST_FIGURE} />
          </div>
        ),
      }}
      skills={{
        qiraa: { label: 'قراءة الوضعية ونمذجتها', module: 7 },
        insihab: { label: 'الانسحاب ومتوازي الأضلاع', module: 7 },
        aqsar: { label: 'أقصر مسلك وحسابه', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'qiraa', requires: ['thabit-mutaghayyir'], prompt: <Q>أيّ طول لا يتغيّر مهما كان موضع الجسر؟</Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 4,
          explain: <MathText>{'الجسر عمودي على حافتي الطريق، فطوله MN هو عرض الطريق $30\\,\\mathrm{m}$ في كل موضع. AM و NB يتغيّران مع موضع الجسر (أحدهما يقصر والآخر يطول)، وكذلك مجموعهما.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ashia_P2'] } },
        { id: 'E2', skill: 'insihab', requires: ['insihab-mamar'], prompt: <Q><MathText>{"نسمّي B′ صورة الملعب B بالانسحاب الذي يجعل $NB = MB'$ . شعاع هذا الانسحاب هو:"}</MathText></Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 4,
          explain: <MathText>{"$\\overrightarrow{BB'} = \\overrightarrow{NM}$ يجعل MB′BN متوازي أضلاع فيكون $NB = MB'$ . بالشعاع $\\overrightarrow{MN}$ تنزل B بدل أن تصعد، و $\\overrightarrow{AB}$ و $\\overrightarrow{NB}$ ليسا شعاع الجسر."}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ashia_P3'] } },
        { id: 'E3', skill: 'insihab', requires: ['insihab-mamar'], prompt: <Q><MathText>{"مع $\\overrightarrow{BB'} = \\overrightarrow{NM}$ ، الرباعي MB′BN في موضع كيفي للجسر هو:"}</MathText></Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 2,
          explain: <MathText>{"$\\overrightarrow{NM} = \\overrightarrow{BB'}$ : الضلعان المتقابلان [NM] و [BB′] متوازيان ولهما نفس الطول، فهو متوازي أضلاع. ليس مستطيلا في موضع كيفي لأنّ [MB′] مائل، ولا مربعا."}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ashia_P2'] } },
        { id: 'E4', skill: 'aqsar', requires: ['aqsar-masar'], prompt: <Q>ليكون المسلك أقصر ما يمكن، يجب أن تكون النقطة M:</Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 2,
          explain: <MathText>{"المسلك يساوي $AM + MB' + 30$ ، و $AM + MB' \\geq AB'$ والمساواة فقط عندما تكون M على $[AB']$ . الجسر عمودي على الحافتين فلا يتبع [AB]؛ وA و B ليسا على نفس البعد من الطريق، فالموضع ليس في منتصف المسافة الأفقية."}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ashia_P1'] } },
        { id: 'E5', skill: 'aqsar', requires: ['aqsar-masar', 'fithaghuris'], prompt: <Q>الطول AB′ هو:</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 2,
          explain: <MathText>{"B′ تحت الحافة السفلى بـ $40 - 30 = 10\\,\\mathrm{m}$ ، فمن A إلى B′: $90\\,\\mathrm{m}$ أفقيا و $20 + 30 + 10 = 60\\,\\mathrm{m}$ شاقوليا، و $AB'^2 = 90^2 + 60^2 = 11700$ ومنه $AB' = 30\\sqrt{13} \\approx 108{,}2\\,\\mathrm{m}$ . $90\\sqrt{2}$ هو AB، و $150\\,\\mathrm{m}$ يأتي من نقل B بالشعاع $\\overrightarrow{MN}$ ."}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ashia_P3'] } },
        { id: 'E6', skill: 'aqsar', requires: ['aqsar-masar'], prompt: <Q>طول أقصر مسلك من المحطة إلى الملعب (مدوّرا إلى 0,1 m) هو:</Q>,
          options: opts(O6), optionLabel: label(O6), correct: 0, cols: 4,
          explain: <MathText>{"$AB' + MN = 30\\sqrt{13} + 30 \\approx 138{,}2\\,\\mathrm{m}$ . $108{,}2$ ينسى طول الجسر، و $157{,}3 = AB + MN$ ليس طول مسلك ممكن، و $180$ يأتي من نقل B بالشعاع $\\overrightarrow{MN}$ ."}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ashia_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🌉', label: 'أدمجت تعلّماتي', test: (m) => (m.qiraa ?? 0) + (m.insihab ?? 0) + (m.aqsar ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 11', title: 'الأشعة والانسحاب', message: 'ممر وجسر للراجلين بين حافتين: الثابت والمتغيّر، الانسحاب الذي ينقل B بشعاع الممر، متوازي الأضلاع الذي ينقل طولا، والخط المستقيم الذي يعطي أقصر مسافة — ما تعلّمته في دروس الوحدة.', verbs: ['أقرأ', 'أنمذج', 'أنقل', 'أبرهن'], masterBadgeLabel: 'الوحدة 11' }} />
  );
}
