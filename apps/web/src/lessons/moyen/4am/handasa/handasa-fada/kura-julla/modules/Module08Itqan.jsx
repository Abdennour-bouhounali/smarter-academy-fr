import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PLATFORM_SOURCE } from '../content/textbook';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Le scan n'a ni QCM ni exercice : cinq
 * épreuves de la plateforme, chacune évaluant UN point, aucune ne reprenant un nombre du lab, des modules ou de أوظّف :
 * E1 la جلّة d'un point intérieur (P1), E2 le قطر (P2), E3 la section par un plan passant par O (P2), E4 l'arrière d'une
 * دائرة كبرى en pointillés (P3), E5 un point du repère comparé à R (P4). P1–P4 couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, source }) => (
  <span className="block"><MathText>{children}</MathText> <SourceTag source={source} /></span>
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
        julla: { label: 'الكرة والجلة', module: 2 },
        anasir: { label: 'عناصر الكرة', module: 2 },
        tamthil: { label: 'التمثيل وموقع نقطة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'julla', requires: ['tarif-julla'],
          prompt: <Q source={PLATFORM_SOURCE}>{'$(\\delta)$ كرة مركزها O ونصف قطرها $5\\,\\mathrm{cm}$ ، و $(\\beta)$ الجلة المعيّنة بها. النقطة T تحقّق $OT = 3\\,\\mathrm{cm}$ . إذن:'}</Q>,
          options: [
            'T تنتمي إلى $(\\beta)$ ولا تنتمي إلى $(\\delta)$',
            // l'intérieur pris pour la كرة (MISC-KURA-JULLA)
            'T تنتمي إلى $(\\delta)$ و إلى $(\\beta)$',
            // la جلة réduite à sa surface
            'T لا تنتمي إلى $(\\delta)$ ولا إلى $(\\beta)$',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$OT = 3 < 5$ : T ليست على الكرة (نقطها تحقّق $OM = 5$)، لكنها تحقّق $OT \\le 5$ فهي من الجلة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_kura-julla_P1'] },
        },
        {
          id: 'E2', skill: 'anasir', requires: ['aqtar'],
          prompt: <Q source={PLATFORM_SOURCE}>{'قبّة مسجد على شكل نصف كرة مركزها O ونصف قطرها $3{,}5\\,\\mathrm{m}$ . طول قطر هذه الكرة هو:'}</Q>,
          options: [
            '$7\\,\\mathrm{m}$',
            // le rayon pris pour le diamètre (MISC-KURA-QUTR)
            '$3{,}5\\,\\mathrm{m}$',
            // la moitié du rayon
            '$1{,}75\\,\\mathrm{m}$',
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'القطر يمر بالمركز وطوله $2R = 2 \\times 3{,}5 = 7\\,\\mathrm{m}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_kura-julla_P2'] },
        },
        {
          id: 'E3', skill: 'anasir', requires: ['dawair'],
          prompt: <Q source={PLATFORM_SOURCE}>{'مستو يشمل مركز كرة O نصف قطرها $6\\,\\mathrm{cm}$ يقطعها وفق دائرة. هذه الدائرة:'}</Q>,
          options: [
            'دائرة كبرى مركزها O ونصف قطرها $6\\,\\mathrm{cm}$',
            // la دائرة صغرى (MISC-KURA-DAIRA-KUBRA)
            'دائرة صغرى مركزها O ونصف قطرها $3\\,\\mathrm{cm}$',
            // le diamètre pris pour le rayon (MISC-KURA-QUTR)
            'دائرة كبرى مركزها O ونصف قطرها $12\\,\\mathrm{cm}$',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'الدائرة التي مركزها مركز الكرة ونصف قطرها نصف قطر الكرة دائرة كبرى: مركزها O ونصف قطرها $6\\,\\mathrm{cm}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_kura-julla_P2'] },
        },
        {
          id: 'E4', skill: 'tamthil', requires: ['tamthil-kura'],
          prompt: <Q source={PLATFORM_SOURCE}>{'لتمثيل كرة نرسم دائرة مركزها O، ثم دائرة كبرى أخرى بيضوية الشكل. في هذا الشكل البيضوي:'}</Q>,
          options: [
            'الجزء الأمامي بخط مستمر، والجزء الخلفي بخط متقطّع',
            // la convention inversée
            'الجزء الأمامي بخط متقطّع، والجزء الخلفي بخط مستمر',
            // pas de partie cachée
            'الجزءان بخط مستمر',
          ],
          correct: 0, cols: 1,
          explain: 'ما يُرى بخط مستمر وما يختفي خلف الكرة بخط متقطّع: الجزء الأمامي للشكل البيضوي مستمر والخلفي متقطّع.',
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_kura-julla_P3'] },
        },
        {
          id: 'E5', skill: 'tamthil', requires: ['masafa-maalam'],
          prompt: <Q source={PLATFORM_SOURCE}>{'في معلم متعامد ومتجانس للفضاء مبدؤه O، كرة مركزها O ونصف قطرها $9$ ، والنقطة $W(1\\,;\\,4\\,;\\,8)$ . النقطة W:'}</Q>,
          options: [
            'على الكرة',
            // les coordonnées toutes < 9 (MISC-KURA-MASAFA)
            'داخل الجلة وليست على الكرة',
            // la somme des coordonnées : 1 + 4 + 8 = 13 > 9
            'خارج الجلة',
          ],
          correct: 0, cols: 3,
          explain: <MathText>{'نحسب مربع البعد: $OW^2 = 1^2 + 4^2 + 8^2 = 81$ ، و $R^2 = 81$ : $OW = R$ ، إذن W على الكرة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_kura-julla_P4'] },
        },
      ]}
      badges={[
        { id: 'julla', emoji: '🔮', label: 'الكرة والجلة', test: (m) => (m.julla ?? 0) === 0 },
        { id: 'anasir', emoji: '🌐', label: 'عناصر الكرة', test: (m) => (m.anasir ?? 0) === 0 },
        { id: 'tamthil', emoji: '✏️', label: 'التمثيل والموقع', test: (m) => (m.tamthil ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الكرة والجلة وتمثيلهما',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن أن الكرة سطح أجوف (OM = R) وأن الجلة مجسم مملوء (OM ≤ R)، وتعرف أقطار الكرة ودوائرها الكبرى والصغرى، وتمثّل كرة ونقطة منها أو من جلتها، وتحدّد موقع نقطة في معلم للفضاء.',
        verbs: ['أميّز', 'أقيس', 'أمثّل', 'أحسب'],
        masterBadgeLabel: 'الكرة والجلة',
      }}
    />
  );
}
