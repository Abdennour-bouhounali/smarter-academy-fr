import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à partir de « أؤكّد
 * تعلّماتي » 6–13 (autres nombres) plus deux épreuves de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/
 * exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient
 * chaque option.
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
        notion: { label: 'المعادلة من الدرجة الأولى', module: 2 },
        check: { label: 'التحقق بالتعويض', module: 2 },
        solve: { label: 'حلّ معادلة', module: 3 },
        model: { label: 'ترييض مشكلة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'notion', requires: ['muadala-taarif'],
          prompt: <Q source={PLATFORM}><MathText>{'المعادلة $2x + 3 = 5x - 1$ :'}</MathText></Q>,
          options: ['معادلة من الدرجة الأولى بمجهول واحد', 'معادلة بمجهولين', 'مساواة لا مجهول فيها', 'مساواة صحيحة دائمًا'], correct: 0, cols: 1,
          explain: <MathText>{'هي من الشكل $ax + b = cx + d$ بمجهول واحد $x$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muadalat-darajat-ula_P1'] },
        },
        {
          id: 'E2', skill: 'check', requires: ['tahqqaq-taawid'],
          prompt: <Q source={SELF.E2.source}><MathText>{'العدد $4$ حلّ للمعادلة:'}</MathText></Q>,
          options: ['$3x - 5 = x + 3$', '$2x + 1 = 3x$', '$x - 4 = 2x$', '$5x = 4x + 5$'], correct: 0, cols: 2,
          explain: <MathText>{'من أجل $x = 4$ : $3 \\times 4 - 5 = 7$ و $4 + 3 = 7$ . في الأخرى الطرفان مختلفان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muadalat-darajat-ula_P2'] },
        },
        {
          id: 'E3', skill: 'solve', requires: ['tariqat-hall'],
          prompt: <Q source={SELF.E3.source}><MathText>{'حلّ المعادلة $5x - 4 = 2x + 8$ هو:'}</MathText></Q>,
          options: ['$4$', '$\\frac{4}{7}$', '$-4$', '$\\frac{12}{7}$'], correct: 0, cols: 2,
          explain: <MathText>{'نضيف $-2x$ و $4$ إلى الطرفين: $3x = 12$ ، ثم نقسم على $3$ : $x = 4$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muadalat-darajat-ula_P3'] },
        },
        {
          id: 'E4', skill: 'solve', requires: ['qisma-muamil'],
          prompt: <Q source={PLATFORM}><MathText>{'حلّ المعادلة $-3x + 7 = x - 5$ هو:'}</MathText></Q>,
          options: ['$3$', '$-3$', '$\\frac{1}{2}$', '$12$'], correct: 0, cols: 2,
          explain: <MathText>{'نضيف $-x$ و $-7$ إلى الطرفين: $-4x = -12$ ، ثم نقسم على $-4$ : $x = 3$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muadalat-darajat-ula_P3'] },
        },
        {
          id: 'E5', skill: 'model', requires: ['tarhiq-mushkila'],
          prompt: <Q source={SELF.E5.source}><MathText>{'مع أمين مبلغ: إذا اشترى $3$ كتب بقي معه $25$ دج، وإذا اشترى $5$ كتب نقصه $35$ دج. ثمن الكتاب بالدينار هو:'}</MathText></Q>,
          options: ['$30$', '$10$', '$60$', '$20$'], correct: 0, cols: 2,
          explain: <MathText>{'$3x + 25 = 5x - 35$ أي $60 = 2x$ ، $x = 30$ . نتحقق: $3 \\times 30 + 25 = 115$ و $5 \\times 30 - 35 = 115$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muadalat-darajat-ula_P4'] },
        },
      ]}
      badges={[
        { id: 'solve', emoji: '⛵', label: 'أحلّ معادلة', test: (m) => (m.solve ?? 0) === 0 },
        { id: 'model', emoji: '🧩', label: 'أرييض مشكلة', test: (m) => (m.model ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت المعادلات من الدرجة الأولى',
        title: 'انتهى درس المعادلات من الدرجة الأولى بمجهول واحد',
        message: 'تعرف الآن أنّ الحدّ يغيّر إشارته حين ينتقل إلى الطرف الآخر، وأنّنا نقسم على معامل x ثم نتحقق بالتعويض، وترييض المشكلة بمعادلة وحلّها والتحقق منها في السياق.',
        verbs: ['أحلّ', 'أتحقّق', 'أرييض'],
        masterBadgeLabel: 'المعادلات من الدرجة الأولى',
      }}
    />
  );
}
