import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à partir de
 * « أؤكّد تعلّماتي » 1 et 3 (autres nombres ; l'item 2, imprimé « 10 ⁴ », est lu 10⁻² : le piège −100 / 0,001) plus trois épreuves de la plateforme
 * (10⁰, l'écriture en puissance de 0,000001, le مفكوك). Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte
 * les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
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
        pos: { label: 'قوة العدد 10 وكتابتها العشرية', module: 1 },
        neg: { label: 'الأس السالب', module: 1 },
        back: { label: 'من الكتابة العشرية إلى القوة', module: 3 },
        expand: { label: 'مفكوك عدد عشري', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'pos', requires: ['ashara-taarif'],
          prompt: <Q source={SELF.E1.source}><MathText>{'$10^{4}$ يساوي:'}</MathText></Q>,
          options: ['$10\\,000$', '$40$', '$1\\,000$', '$100\\,000$'], correct: 0, cols: 2,
          explain: <MathText>{'أربعة عوامل كلّها 10 : الرقم 1 متبوعًا بأربعة أصفار، $10^4 = 10\\,000$ . ($40 = 10 \\times 4$ ، و $1\\,000$ ثلاثة أصفار، و $100\\,000$ خمسة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwa-adad-ashara_P1'] },
        },
        {
          id: 'E2', skill: 'neg', requires: ['ashara-salib'],
          prompt: <Q source={SELF.E2.source}><MathText>{'$10^{-2}$ يساوي:'}</MathText></Q>,
          options: ['$0{,}01$', '$-100$', '$0{,}001$', '$-20$'], correct: 0, cols: 2,
          explain: <MathText>{'$10^{-2}$ مقلوب $10^2$ : $\\frac{1}{100} = 0{,}01$ ، والرقم 1 في الرتبة الثانية بعد الفاصلة. الأس السالب لا يجعل العدد سالبًا ($-100$ و $-20$ خطأ)، و $0{,}001$ هو $10^{-3}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwa-adad-ashara_P2'] },
        },
        {
          id: 'E3', skill: 'pos', requires: ['ashara-sifr'],
          prompt: <Q source={PLATFORM}><MathText>{'$10^{0}$ يساوي:'}</MathText></Q>,
          options: ['$1$', '$0$', '$10$'], correct: 0, cols: 3,
          explain: <MathText>{'بلا أيّ عامل يبقى العدد 1 : $10^0 = 1$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwa-adad-ashara_P2'] },
        },
        {
          id: 'E4', skill: 'back', requires: ['ashara-adad'],
          prompt: <Q source={PLATFORM}><MathText>{'$0{,}000001 =$'}</MathText></Q>,
          options: ['$10^{-6}$', '$10^{-5}$', '$10^{6}$', '$10^{-7}$'], correct: 0, cols: 2,
          explain: <MathText>{'الرقم 1 في الرتبة السادسة بعد الفاصلة، إذن $10^{-6}$ . ($10^{-5}$ يعدّ الأصفار بعد الفاصلة، و $10^{6}$ موجب فيعني مليونًا.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwa-adad-ashara_P3'] },
        },
        {
          id: 'E5', skill: 'expand', requires: ['ashara-mafkuk'],
          prompt: <Q source={PLATFORM}><MathText>{'$3\\,000\\,400 =$'}</MathText></Q>,
          options: ['$3 \\times 10^{6} + 4 \\times 10^{2}$', '$3 \\times 10^{6} + 4 \\times 10^{3}$', '$3 \\times 10^{7} + 4 \\times 10^{2}$', '$3 \\times 10^{5} + 4 \\times 10^{2}$'], correct: 0, cols: 1,
          explain: <MathText>{'الرقم 3 في رتبة الملايين $(10^6)$ والرقم 4 في رتبة المئات $(10^2)$ ؛ والأصفار لا تظهر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwa-adad-ashara_P4'] },
        },
      ]}
      badges={[
        { id: 'pos', emoji: '🔭', label: 'أقرأ قوى العدد 10', test: (m) => (m.pos ?? 0) === 0 && (m.neg ?? 0) === 0 },
        { id: 'back', emoji: '🔟', label: 'أكتب بقوى 10', test: (m) => (m.back ?? 0) === 0 && (m.expand ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت قوى العدد 10',
        title: 'انتهى درس قوى العدد 10',
        message: 'تعرف الآن أنّ $10^n$ هو الرقم 1 متبوعًا بـ $n$ صفرًا، وأنّ $10^0 = 1$ ، وأنّ $10^{-n} = \\frac{1}{10^n}$ رقم 1 فيه في الرتبة $n$ بعد الفاصلة، وتكتب عددًا عشريًا بقوى العدد 10.',
        verbs: ['أقرأ', 'أكتب', 'أفكّك'],
        masterBadgeLabel: 'قوى العدد 10',
      }}
    />
  );
}
