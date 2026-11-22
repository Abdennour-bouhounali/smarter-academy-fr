import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM6, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_TEST_IMAGE } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : l'item 6 de « أؤكّد تعلّماتي » (p. 136, extraction › destinations › qcm, duplicatedIn ce درس) et
 * quatre épreuves de la plateforme, sur d'autres lettres et d'autres nombres que la leçon. Chaque épreuve évalue UN
 * point d'apprentissage ; P1 (E1, E2), P2 (E3, E4), P3 (E5).
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
        muntasaf: { label: 'المنتصف وتساوي شعاعين', module: 2 },
        mutawazi: { label: 'متوازي الأضلاع بتساوي شعاعين', module: 2 },
        insha: { label: 'صورة نقطة بانسحاب', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'muntasaf', requires: ['muntasaf-shuaa'],
          prompt: <Q source={QCM6.source}>{`${QCM6.text} (الكتاب: اختر الإجابة الصحيحة وبرّر)`}</Q>,
          options: QCM6.options.map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\overrightarrow{CA} = \\overrightarrow{AB}$ : حسب معارف 3، A منتصف [CB]، أي B و C متناظرتان بالنسبة إلى A.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_shuaayn-mutasawiyayn_P1'] },
        },
        {
          id: 'E2', skill: 'muntasaf', requires: ['muntasaf-shuaa'],
          prompt: <Q source={PLATFORM_SOURCE}>{'[RS] قطعة طولها $9\\,\\mathrm{cm}$ و M نقطة حيث $\\overrightarrow{RM} = \\overrightarrow{MS}$ . إذن الطول RM يساوي:'}</Q>,
          options: ['$4{,}5\\,\\mathrm{cm}$', '$9\\,\\mathrm{cm}$', '$18\\,\\mathrm{cm}$'].map(M),
          correct: 0, cols: 3, keepOrder: true,
          explain: <MathText>{'$\\overrightarrow{RM} = \\overrightarrow{MS}$ : M منتصف [RS]، فـ $RM = 9 \\div 2 = 4{,}5\\,\\mathrm{cm}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_shuaayn-mutasawiyayn_P1'] },
        },
        {
          id: 'E3', skill: 'mutawazi', requires: ['mutawazi-shuaa'],
          prompt: <Q source={PLATFORM_SOURCE}>{'KLMN رباعي حيث $\\overrightarrow{KL} = \\overrightarrow{NM}$ ، والنقط K، L، M ليست على استقامة واحدة. إذن:'}</Q>,
          options: [
            'KLMN متوازي أضلاع',
            'KLNM متوازي أضلاع', // l'ordre des sommets
            'للقطعتين [KL] و [NM] نفس المنتصف', // ce sont des côtés, pas les diagonales
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'الضلع [KL] ومقابله [NM] مقروءان في الاتجاه نفسه: $\\overrightarrow{KL} = \\overrightarrow{NM}$ تعني أن KLMN متوازي أضلاع، وقطراه [KM] و [LN] متناصفان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_shuaayn-mutasawiyayn_P2'] },
        },
        {
          id: 'E4', skill: 'mutawazi', requires: ['mutawazi-shuaa'],
          prompt: <Q source={PLATFORM_SOURCE}>{'PQRS مستطيل و PQUV متوازي أضلاع. أيّ استنتاج صحيح؟'}</Q>,
          options: [
            '$\\overrightarrow{SR} = \\overrightarrow{VU}$ ، فالرباعي SRUV متوازي أضلاع',
            '$\\overrightarrow{SR} = \\overrightarrow{UV}$ ، فالرباعي SRUV متوازي أضلاع', // le sens : SR = PQ = VU
            '$\\overrightarrow{PS} = \\overrightarrow{QU}$', // rien ne relie ces deux côtés
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'PQRS مستطيل: $\\overrightarrow{PQ} = \\overrightarrow{SR}$ ؛ PQUV متوازي أضلاع: $\\overrightarrow{PQ} = \\overrightarrow{VU}$ . إذن $\\overrightarrow{SR} = \\overrightarrow{VU}$ : SRUV متوازي أضلاع.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_shuaayn-mutasawiyayn_P2'] },
        },
        {
          id: 'E5', skill: 'insha', requires: ['surat-nuqta'],
          prompt: <Q source={PLATFORM_SOURCE} figure={FIG_TEST_IMAGE}>{'D صورة C بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ (الشكل). أيّ عبارة صحيحة؟'}</Q>,
          options: [
            'ABDC متوازي أضلاع، و D نظيرة A بالنسبة إلى منتصف [BC]',
            'ABCD متوازي أضلاع، و D نظيرة B بالنسبة إلى منتصف [AC]', // c'est le point tel que DC = AB
            'C منتصف [AD]', // C n'est pas sur [AD]
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\overrightarrow{CD} = \\overrightarrow{AB}$ : ABDC متوازي أضلاع قطراه [AD] و [BC]، فـ D نظيرة A بالنسبة إلى منتصف [BC].'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_shuaayn-mutasawiyayn_P3'] },
        },
      ]}
      badges={[
        { id: 'muntasaf', emoji: '🎯', label: 'المنتصف', test: (m) => (m.muntasaf ?? 0) === 0 },
        { id: 'mutawazi', emoji: '▱', label: 'متوازي الأضلاع', test: (m) => (m.mutawazi ?? 0) === 0 },
        { id: 'insha', emoji: '🏟️', label: 'صورة نقطة', test: (m) => (m.insha ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الشعاعين المتساويين ومتوازي الأضلاع',
        title: 'انتهى الدرس 2',
        message: 'تعرف الآن أن I منتصف [AB] يعني تساوي الشعاعين AI و IB، وأن تساوي شعاعين يثبت أن رباعيا متوازي أضلاع، وتنشئ صورة نقطة بانسحاب علم شعاعه بإكمال متوازي أضلاع.',
        verbs: ['أترجم المنتصف', 'أبرهن', 'أنشئ'],
        masterBadgeLabel: 'الأشعة المتساوية',
      }}
    />
  );
}
