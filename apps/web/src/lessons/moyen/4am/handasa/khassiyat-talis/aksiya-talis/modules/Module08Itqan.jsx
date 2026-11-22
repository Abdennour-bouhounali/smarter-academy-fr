import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { QCM3 } from '../content/textbook';
import { FIG_QCM3 } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : l'item 3 de « أؤكّد تعلّماتي » (p. 112, extraction › destinations › qcm, item 3, sa figure
 * redessinée) et quatre de la plateforme — P1 : prouver le parallélisme (produit en croix), le non-parallélisme (deux
 * valeurs approchées « presque » égales ne prouvent rien) ; P2 : des rapports égaux dans un ordre différent, quelle
 * disposition est « le même ordre ». Chaque épreuve évalue UN point d'apprentissage ; aucun nombre n'est repris des
 * modules.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');
const Q = ({ children, source, figure }) => (
  <span className="block space-y-2">
    <span>{children} <SourceTag source={source} /></span>
    {figure && <GeoFigure {...figure} inline />}
  </span>
);

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
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        tawazi: { label: 'إثبات التوازي أو عدمه', module: 3 },
        tartib: { label: 'الاستقامية ونفس الترتيب', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'tawazi', requires: ['nisbatan-mukhtalifatan'],
          prompt: <Q source={QCM3.source} figure={FIG_QCM3}><MathText>{QCM3.text}</MathText></Q>,
          options: QCM3.options.map(M),
          correct: 0, cols: 1,
          explain: <MathText>{QCM3.explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_aksiya-talis_P1'] },
        },
        {
          id: 'E2', skill: 'tartib', requires: ['shart-tartib'],
          prompt: <Q source={PLATFORM}><MathText>{"(d) و (d′) متقاطعان في A. B و B′ من (d)، C و C′ من (d′): $AB = 6$ ، $AB' = 4$ ، $AC = 9$ ، $AC' = 6$ . B′ بين A و B، بينما A بين C و C′. ماذا ينتج؟"}</MathText></Q>,
          options: [
            'المستقيمان (BC) و (B′C′) غير متوازيين، لأن النقط ليست مرتبة بنفس الترتيب',
            "$(B'C') \\parallel (BC)$ لأن النسبتين متساويتان",
            'المستقيمان (BC) و (B′C′) غير متوازيين، لأن النسبتين مختلفتان',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{"$\\dfrac{4}{6} = \\dfrac{6}{9} = \\dfrac{2}{3}$ : النسبتان متساويتان، لكن B′ في جهة B من A و C′ في الجهة الأخرى: الترتيب مختلف، فالمستقيمان غير متوازيين."}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_aksiya-talis_P2'] },
        },
        {
          id: 'E3', skill: 'tawazi', requires: ['tariqa-tawazi'],
          prompt: <Q source={PLATFORM}><MathText>{'النقط I و K و L على استقامة، والنقط J و K و N على استقامة، و K بين النقطتين في كل مرة. $KI = 4{,}5$ ، $KL = 7{,}5$ ، $KJ = 3$ ، $KN = 5$ . هل (IJ) و (LN) متوازيان؟'}</MathText></Q>,
          options: ["نعم: $\\dfrac{KI}{KL} = \\dfrac{KJ}{KN}$ ونفس الترتيب", "لا: $\\dfrac{KI}{KL} \\neq \\dfrac{KJ}{KN}$", 'لا يمكن الحكم دون رسم الشكل'].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$4{,}5 \\times 5 = 22{,}5$ و $7{,}5 \\times 3 = 22{,}5$ : النسبتان متساويتان ($0{,}6$)، و K بين النقطتين في كل مرة: حسب الخاصية العكسية لخاصية طالس $(IJ) \\parallel (LN)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_aksiya-talis_P1'] },
        },
        {
          id: 'E4', skill: 'tartib', requires: ['aksiya-nashat'],
          prompt: <Q source={PLATFORM}><MathText>{'على مستقيمين متقاطعين في A، متى تكون النقط A، B، B′ مرتبة بنفس ترتيب النقط A، C، C′؟'}</MathText></Q>,
          options: ['B′ بين A و B، و C′ بين A و C', 'B′ بين A و B، و A بين C و C′', 'A بين B و B′، و C′ بين A و C', 'B بين A و B′، و C′ بين A و C'],
          correct: 0, cols: 1,
          explain: <MathText>{'موقع B′ بالنسبة إلى A و B يجب أن يماثل موقع C′ بالنسبة إلى A و C: B′ بين A و B تقابلها C′ بين A و C. في الاقتراحات الأخرى موقعا النقطتين مختلفان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_aksiya-talis_P2'] },
        },
        {
          id: 'E5', skill: 'tawazi', requires: ['tariqa-adam-tawazi'],
          prompt: <Q source={PLATFORM}><MathText>{'ABC مثلث، M من [AB] و N من [AC]: $AM = 3$ ، $AB = 7$ ، $AN = 4$ ، $AC = 9$ . هل (MN) و (BC) متوازيان؟'}</MathText></Q>,
          options: [
            'لا: $3 \\times 9 = 27$ و $7 \\times 4 = 28$ ، فالنسبتان مختلفتان',
            'نعم: $\\dfrac{3}{7} \\approx 0{,}4$ و $\\dfrac{4}{9} \\approx 0{,}4$',
            'نعم: M و N بين الرأس والقاعدة، فالترتيب نفسه يكفي',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\dfrac{3}{7} \\neq \\dfrac{4}{9}$ (الجداءان 27 و 28)؛ لو كانا متوازيين لتساوت النسبتان حسب خاصية طالس. قيمتان مقرّبتان متساويتان لا تثبتان شيئا، والترتيب وحده لا يكفي.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_aksiya-talis_P1'] },
        },
      ]}
      badges={[
        { id: 'tawazi', emoji: '🪜', label: 'إثبات التوازي', test: (m) => (m.tawazi ?? 0) === 0 },
        { id: 'tartib', emoji: '↔️', label: 'نفس الترتيب', test: (m) => (m.tartib ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الخاصية العكسية لخاصية طالس',
        title: 'انتهى الدرس 2',
        message: 'تعرف الآن كيف تثبت توازي مستقيمين بنسبتين متساويتين ونفس الترتيب، وكيف تثبت عدم توازيهما بنسبتين مختلفتين.',
        verbs: ['أتحقّق من الترتيب', 'أقارن', 'أستنتج', 'أبرهن'],
        masterBadgeLabel: 'الخاصية العكسية',
      }}
    />
  );
}
