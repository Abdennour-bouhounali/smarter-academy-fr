import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — أحلّ الوضعية (stage: evaluation) : la résolution du مسبح البلدي
 * (extraction › situation › duplicatedIn module 8) en cinq épreuves qui suivent
 * les trois étapes du manuel — la formule 2 traduite 560 + 5x (P2), l'inéquation
 * 560 + 5x < 75x (P2), sa résolution x > 8 (P1), l'égalité à 8 séances, 600 دج (P1),
 * puis la conclusion « ابتداءً من 9 حصص » (P2). Chaque distracteur est FAUX
 * (MISC-WADIYA-TARJAMA, MISC-MUTARAJIHA-QALB-ZAID, MISC-WADIYA-QIMAT-TASAWI…) ;
 * une seule LP primaire par épreuve, les deux couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={SITUATION.source} /></span>;
const O1 = ['$560 + 5x$', '$(560 + 5)x$', '$560x + 5$', '$560 + 75x$'];
const O2 = ['$560 + 5x < 75x$', '$560 + 5x > 75x$', '$560 + 5x = 75x$', '$560x + 5 < 75x$'];
const O3 = ['$x > 8$', '$x < 8$', '$x > \\dfrac{1}{8}$', '$x > 7$'];
const O4 = [
  'تتساوى الصيغتان: $75 \\times 8 = 560 + 5 \\times 8 = 600$ دج',
  'الصيغة الثانية أفضل، لأنّ $560 + 5 \\times 8 = 600$',
  'الصيغة الأولى أفضل بـ 40 دج',
  'تتساوى الصيغتان في 560 دج',
];
const O5 = [
  'ابتداءً من 9 حصص: هو أصغر عدد طبيعي يحقّق $x > 8$',
  'ابتداءً من 8 حصص: هو الحدّ في $x > 8$',
  'ابتداءً من 7 حصص',
  'إذا كان عدد الحصص أقل من 8',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="خمس مراحل نحو الصيغة الأفضل" estimatedTime="6 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={6 * 60} timerLabel="6 دقائق"
      brief={{ tag: 'أدمج تعلّماتي', title: 'أيّ صيغة اشتراك أفضل في المسبح البلدي؟', tone: 'amber', body: <p>{SITUATION.text}</p> }}
      skills={{
        tarjama: { label: 'ترجمة صيغة بعبارة حرفية', module: 7 },
        mutarajiha: { label: 'كتابة المتراجحة وحلها', module: 7 },
        tafsir: { label: 'تفسير النتيجة واختيار الأفضل', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'tarjama', requires: ['tarjama-sigha'], prompt: <Q>المرحلة 1 — نسمّي <MathText>{'$x$'}</MathText> عدد الحصص. تكلفة <MathText>{'$x$'}</MathText> حصة بالصيغة الثانية (بـ دج) هي ...</Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 2,
          explain: <MathText>{'الاشتراك السنوي 560 دج يُدفع مرّة واحدة، و 5 دج في كل حصة: $560 + 5x$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2'] } },
        { id: 'E2', skill: 'mutarajiha', requires: ['mutarajiha-mufadala'], prompt: <Q>المرحلة 2 — «التسعيرة الثانية أفضل» تُترجم بالمتراجحة ...</Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'أفضل يعني أقل تكلفة: تكلفة الثانية $560 + 5x$ أقل من تكلفة الأولى $75x$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2'] } },
        { id: 'E3', skill: 'mutarajiha', requires: ['hall-mutarajiha'], prompt: <Q>المرحلة 3 — حلول المتراجحة <MathText>{'$560 + 5x < 75x$'}</MathText> هي الأعداد <MathText>{'$x$'}</MathText> حيث ...</Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 2,
          explain: <MathText>{'$560 < 75x - 5x$ أي $560 < 70x$ ، والقسمة على 70 (موجب) تحافظ على الاتجاه: $8 < x$ ، أي $x > 8$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P1'] } },
        { id: 'E4', skill: 'tafsir', requires: ['tajrib'], prompt: <Q>المرحلة 3 (تابع) — من أجل 8 حصص بالضبط:</Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 1,
          explain: <MathText>{'$75 \\times 8 = 600$ و $560 + 5 \\times 8 = 560 + 40 = 600$ : التكلفتان متساويتان، فلا صيغة أفضل من الأخرى عند 8 حصص.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P1'] } },
        { id: 'E5', skill: 'tafsir', requires: ['tafsir-natija'], prompt: <Q>تفسير النتائج — ابتداءً من أي عدد للحصص تكون التسعيرة الثانية أفضل؟</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'عدد الحصص عدد طبيعي، و 8 لا يحقّق $x > 8$ (التكلفتان متساويتان عندها). ونتحقق: من أجل 9 حصص $75 \\times 9 = 675$ و $560 + 5 \\times 9 = 605$ ، و $605 < 675$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🏊', label: 'أدمجت تعلّماتي', test: (m) => (m.tarjama ?? 0) + (m.mutarajiha ?? 0) + (m.tafsir ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 4', title: 'المعادلات والمتراجحات', message: 'ابتداءً من 9 حصص تكون الصيغة الثانية أفضل. ترجمت الصيغتين بعبارتين حرفيتين، جرّبت، كتبت المتراجحة وحللتها، ثم فسّرت النتيجة — ما تعلّمته في دروس الوحدة الأربعة.', verbs: ['أترجم', 'أجرّب', 'أحلّ', 'أفسّر'], masterBadgeLabel: 'الوحدة 4' }} />
  );
}
