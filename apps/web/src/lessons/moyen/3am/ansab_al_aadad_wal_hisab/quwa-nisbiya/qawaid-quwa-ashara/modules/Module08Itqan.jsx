import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune : le produit (inspiré de « أؤكّد » 5, le piège des
 * exposants multipliés : −28), le quotient avec un exposant négatif (plateforme), la puissance de puissance (« أؤكّد » 6), une chaîne à réduire (plateforme) et un produit
 * k × 10ᵖ non normalisé (plateforme). Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt
 * par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
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
        prod: { label: 'جداء قوتين للعدد 10', module: 1 },
        quot: { label: 'حاصل قسمة قوتين للعدد 10', module: 1 },
        pow: { label: 'قوة قوة للعدد 10', module: 1 },
        chain: { label: 'اختصار عبارة إلى قوة واحدة', module: 3 },
        sci: { label: 'جداء أعداد من الشكل k × 10ᵖ', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'prod', requires: ['jidaa-quwa-ashara'],
          prompt: <Q source={SELF.E1.source}><MathText>{'$10^{4} \\times 10^{-7}$ يساوي:'}</MathText></Q>,
          options: ['$10^{-3}$', '$10^{-28}$', '$10^{11}$', '$100^{-3}$'], correct: 0, cols: 2,
          explain: <MathText>{'في الجداء نجمع الأسّين: $4 + (-7) = -3$ . ($10^{-28}$ يضرب الأسّين، و $10^{11}$ يتجاهل الإشارة، و $100^{-3}$ يضرب الأساسين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qawaid-quwa-ashara_P1'] },
        },
        {
          id: 'E2', skill: 'quot', requires: ['hasil-quwa-ashara'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\frac{10^{5}}{10^{-3}}$ يساوي:'}</MathText></Q>,
          options: ['$10^{8}$', '$10^{2}$', '$10^{-15}$', '$1^{8}$'], correct: 0, cols: 2,
          explain: <MathText>{'ننقص أسّ المقام: $5 - (-3) = 8$ . ($10^{2}$ يتجاهل إشارة الأسّ السالب، و $10^{-15}$ يضرب الأسّين، و $1^{8}$ يقسم الأساسين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qawaid-quwa-ashara_P2'] },
        },
        {
          id: 'E3', skill: 'pow', requires: ['quwat-quwa-ashara'],
          prompt: <Q source={SELF.E3.source}><MathText>{'$(10^{-2})^{4}$ يساوي:'}</MathText></Q>,
          options: ['$10^{-8}$', '$10^{2}$', '$10^{-6}$', '$10^{16}$'], correct: 0, cols: 2,
          explain: <MathText>{'في قوة القوة نضرب الأسّين: $(-2) \\times 4 = -8$ . ($10^{2}$ يجمع $-2 + 4$ ، و $10^{-6}$ يجمع $-2 - 4$ ، و $10^{16}$ يرفع $4$ إلى القوة $2$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qawaid-quwa-ashara_P3'] },
        },
        {
          id: 'E4', skill: 'chain', requires: ['tabsit-ashara'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\frac{(10^{3})^{2} \\times 10^{-1}}{10^{4}}$ يساوي:'}</MathText></Q>,
          options: ['$10^{1}$', '$10^{0}$', '$10^{9}$', '$10^{-1}$'], correct: 0, cols: 2,
          explain: <MathText>{'في البسط $10^{6} \\times 10^{-1} = 10^{5}$ ، ثم $\\frac{10^{5}}{10^{4}} = 10^{1}$ . (الباقي ينسى قوة القوة أو يجمع بدل أن ينقص.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qawaid-quwa-ashara_P4'] },
        },
        {
          id: 'E5', skill: 'sci', requires: ['adad-fi-quwa'],
          prompt: <Q source={PLATFORM}><MathText>{'$4 \\times 10^{3} \\times 2 \\times 10^{-5}$ يساوي:'}</MathText></Q>,
          options: ['$8 \\times 10^{-2}$', '$8 \\times 10^{-15}$', '$6 \\times 10^{-2}$', '$8 \\times 10^{8}$'], correct: 0, cols: 1,
          explain: <MathText>{'$4 \\times 2 = 8$ و $10^{3} \\times 10^{-5} = 10^{-2}$ . ($6 \\times 10^{-2}$ يجمع العددين، و $8 \\times 10^{-15}$ يضرب الأسّين، و $8 \\times 10^{8}$ ينسى الإشارة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qawaid-quwa-ashara_P4'] },
        },
      ]}
      badges={[
        { id: 'rules', emoji: '📏', label: 'أطبّق قواعد قوى 10', test: (m) => (m.prod ?? 0) === 0 && (m.quot ?? 0) === 0 && (m.pow ?? 0) === 0 },
        { id: 'chain', emoji: '🔟', label: 'أختصر إلى قوة واحدة', test: (m) => (m.chain ?? 0) === 0 && (m.sci ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت قواعد قوى العدد 10',
        title: 'انتهى درس قواعد الحساب على قوى العدد 10',
        message: 'تعرف الآن أنّ $10^m \\times 10^n = 10^{m+n}$ و $\\frac{10^m}{10^n} = 10^{m-n}$ و $(10^m)^n = 10^{m \\times n}$ ، وتختصر عبارة إلى قوة واحدة وتحسب جداء أعداد من الشكل $k \\times 10^p$ .',
        verbs: ['أجمع', 'أنقص', 'أضرب'],
        masterBadgeLabel: 'قواعد قوى العدد 10',
      }}
    />
  );
}
