import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_QCM1, FIG_QCM3 } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : les items 1 à 3 de « أؤكّد تعلّماتي » (p. 136, extraction › destinations › qcm, duplicatedIn ce درس) —
 * les items 1 et 2 ont DEUX bonnes réponses (une combinaison), l'item 3 dit en une parenthèse ce que « متعاكسان » veut
 * dire (le mot est formalisé au درس « مجموع شعاعين ») — et deux épreuves de la plateforme : les trois éléments d'un
 * vecteur (P2) et l'ordre des lettres du parallélogramme (P3). Chaque épreuve évalue UN point ; P1–P3 couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, source, figure }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={source} /></span>
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
      estimatedTime="5 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        insihab: { label: 'الانسحاب والشعاع', module: 1 },
        anasir: { label: 'منحى الشعاع واتجاهه وطوله', module: 2 },
        tasawi: { label: 'تساوي شعاعين ومتوازي الأضلاع', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'tasawi', requires: ['tasawi-shuaayn'],
          prompt: <Q source={QCM[1].source} figure={FIG_QCM1}>{`${QCM[1].text} (الكتاب: اختر الإجابة أو الإجابات الصحيحة)`}</Q>,
          options: [
            '$\\overrightarrow{AC}$ و $\\overrightarrow{GH}$ ، وكذلك $\\overrightarrow{GH}$ و $\\overrightarrow{EF}$',
            '$\\overrightarrow{MN}$ و $\\overrightarrow{GH}$ فقط', // MN est de sens contraire
            '$\\overrightarrow{AC}$ و $\\overrightarrow{AD}$ فقط', // même origine, منحى différent
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'الأسهم $\\overrightarrow{AC}$ و $\\overrightarrow{GH}$ و $\\overrightarrow{EF}$ أفقية نحو اليمين وبطول 4 مربعات: متساوية. $\\overrightarrow{MN}$ بنفس الطول والمنحى لكن نحو اليسار، و $\\overrightarrow{AD}$ مائل.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_insihab-shuaa_P3'] },
        },
        {
          id: 'E2', skill: 'insihab', requires: ['insihab-shuaa'],
          prompt: <Q source={QCM[2].source}>{`${QCM[2].text} (الكتاب: اختر الإجابة أو الإجابات الصحيحة)`}</Q>,
          options: [
            '$\\overrightarrow{ST} = \\overrightarrow{AB}$ و $\\overrightarrow{TS} = \\overrightarrow{BA}$',
            '$\\overrightarrow{TS} = \\overrightarrow{AB}$ فقط', // le point et son image inversés
            '$\\overrightarrow{ST} = \\overrightarrow{BA}$ فقط',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'T صورة S بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ يعني $\\overrightarrow{ST} = \\overrightarrow{AB}$ (من النقطة نحو صورتها)، وبقلب الاتجاهين معا $\\overrightarrow{TS} = \\overrightarrow{BA}$ : الكتابتان صحيحتان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_insihab-shuaa_P1'] },
        },
        {
          id: 'E3', skill: 'anasir', requires: ['shuaa'],
          prompt: <Q source={QCM[3].source} figure={FIG_QCM3}>{`${QCM[3].text} (شعاعان متعاكسان: لهما نفس المنحى ونفس الطول واتجاهان متعاكسان)`}</Q>,
          options: [
            'الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ متعاكسان',
            'الشعاعان $\\overrightarrow{AB}$ و $\\overrightarrow{GH}$ متعاكسان', // طولان مختلفان
            'الشعاعان $\\overrightarrow{GH}$ و $\\overrightarrow{EH}$ متعاكسان', // منحيان مختلفان
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ أفقيان بطول 6 مربعات، الأول نحو اليسار والثاني نحو اليمين. $\\overrightarrow{GH}$ أقصر (4 مربعات)، و $\\overrightarrow{EH}$ شاقولي.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_insihab-shuaa_P2'] },
        },
        {
          id: 'E4', skill: 'anasir', requires: ['shuaa'],
          prompt: <Q source={PLATFORM_SOURCE}>{'E و F نقطتان متمايزتان. الشعاع $\\overrightarrow{EF}$ :'}</Q>,
          options: [
            'منحاه منحى المستقيم (EF)، اتجاهه من E نحو F، وطويلته الطول EF',
            'منحاه منحى المستقيم (EF)، اتجاهه من F نحو E، وطويلته الطول EF', // اتجاه inversé
            'منحاه العمودي على (EF)، اتجاهه من E نحو F، وطويلته الطول EF', // منحى faux
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'الشعاع $\\overrightarrow{EF}$ مبدؤه E ونهايته F: منحاه (EF)، اتجاهه من E نحو F، وطويلته طول القطعة [EF].'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_insihab-shuaa_P2'] },
        },
        {
          id: 'E5', skill: 'tasawi', requires: ['mutawazi-adlaa'],
          prompt: <Q source={PLATFORM_SOURCE}>{'K و L و M و N أربع نقط كل ثلاث منها ليست في استقامية، و $\\overrightarrow{KL} = \\overrightarrow{MN}$ . إذن الرباعي التالي متوازي أضلاع:'}</Q>,
          options: ['KLNM', 'KLMN', 'KMLN'],
          correct: 0, cols: 3,
          explain: <MathText>{'$\\overrightarrow{KL} = \\overrightarrow{MN}$ يعني أن KLNM متوازي أضلاع (K ثم L ثم نهاية الشعاع الثاني N ثم مبدؤه M). KLMN يتطلب $\\overrightarrow{KL} = \\overrightarrow{NM}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_insihab-shuaa_P3'] },
        },
      ]}
      badges={[
        { id: 'insihab', emoji: '🚁', label: 'الانسحاب', test: (m) => (m.insihab ?? 0) === 0 },
        { id: 'anasir', emoji: '🧭', label: 'منحى واتجاه وطول', test: (m) => (m.anasir ?? 0) === 0 },
        { id: 'tasawi', emoji: '▱', label: 'شعاعان متساويان', test: (m) => (m.tasawi ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مفهوم الشعاع وتساوي شعاعين',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن أن الانسحاب يحرّك كل النقط بشعاع واحد له منحى واتجاه وطول، وأن شعاعين متساويين لهما العناصر الثلاثة نفسها، وأن تساويهما يرسم متوازي أضلاع — بترتيب الحروف الصحيح.',
        verbs: ['أنسحب', 'أصف', 'أقارن', 'أبرهن'],
        masterBadgeLabel: 'الشعاع',
      }}
    />
  );
}
