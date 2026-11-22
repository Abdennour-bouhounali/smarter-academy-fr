import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import LinesFigure from '../components/LinesFigure';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Le manuel fourni n'a
 * pas de « أؤكّد تعلّماتي » : six épreuves de la plateforme, chacune sur UN point d'apprentissage (P1 : E1,
 * E6 ; P2 : E2, E3 ; P3 : E4, E5). Aucune n'utilise les nombres du نشاط 5 ni ceux des exercices.
 * Tous les distracteurs sont faux (le calcul est dans l'explication).
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');

export default function Module07Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="إختبار أولي"
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        mustaqim: { label: 'المعادلة والمستقيم', module: 2 },
        taqatu: { label: 'الحل ونقطة التقاطع', module: 2 },
        halat: { label: 'الحالات الثلاث', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'mustaqim', requires: ['muadala-mustaqim'],
          prompt: <Q source={PLATFORM}><MathText>{'المعادلة $4x + 2y = 6$ تُكتب على الشكل $y = ax + b$ :'}</MathText></Q>,
          options: [M('$y = -2x + 3$'), M('$y = 2x + 3$'), M('$y = -4x + 6$'), M('$y = -2x + 6$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$2y = -4x + 6$ ثم نقسم كل الحدود على 2: $y = -2x + 3$. أمّا $2x + 3$ فتنسى الإشارة، و $-4x + 6$ تنسى القسمة، و $-2x + 6$ تقسم حدًّا واحدًا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tafsir-bayani-jumla_P1'] },
        },
        {
          id: 'E2', skill: 'taqatu', requires: ['hall-taqatu'],
          prompt: (
            <Q source={PLATFORM}>
              <MathText>{'المستقيمان (d₁) و (d₂) أدناه يمثّلان معادلتي جملة. حلّ هذه الجملة هو:'}</MathText>
              <LinesFigure testId="e2" win={{ xMin: -1, xMax: 6, yMin: -1, yMax: 11 }} height={220}
                lines={[{ a: 1, b: 1, label: '(d₁)' }, { a: -2, b: 10, label: '(d₂)' }]}
                caption="الشكل: المستقيم (d₁) يصعد ويقطع محور التراتيب في 1، والمستقيم (d₂) ينزل ويقطعه في 10." />
            </Q>
          ),
          options: [M('$(3 ; 4)$'), M('$(4 ; 3)$'), M('$(0 ; 1)$'), M('$(5 ; 0)$')],
          correct: 0, cols: 4,
          explain: <MathText>{'المستقيمان يتقاطعان في النقطة التي فاصلتها 3 وترتيبها 4: $3 + 1 = 4$ و $-2 \\times 3 + 10 = 4$. أمّا $(4 ; 3)$ فقلبٌ للإحداثيين، و $(0 ; 1)$ على (d₁) وحده، و $(5 ; 0)$ على (d₂) وحده.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tafsir-bayani-jumla_P2'] },
        },
        {
          id: 'E3', skill: 'taqatu', requires: ['hall-taqatu', 'thunaiya-hall'],
          prompt: <Q source={PLATFORM}><MathText>{'النقطة $A(2 ; -1)$ هي نقطة تقاطع مستقيمي الجملة:'}</MathText></Q>,
          options: [
            M('$\\begin{cases} x + y = 1 \\\\ x - y = 3 \\end{cases}$'),
            M('$\\begin{cases} x - y = 1 \\\\ x + y = 3 \\end{cases}$'),
            M('$\\begin{cases} 2x + y = 5 \\\\ x - y = 3 \\end{cases}$'),
            M('$\\begin{cases} x + y = 1 \\\\ x + y = 3 \\end{cases}$'),
          ],
          correct: 0, cols: 2,
          explain: <MathText>{'$2 + (-1) = 1$ و $2 - (-1) = 3$ : A على المستقيمين معًا. وفي الثانية $2 - (-1) = 3 \\neq 1$ ، وفي الثالثة $2 \\times 2 - 1 = 3 \\neq 5$ ، والرابعة مستقيماها متوازيان لا يتقاطعان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tafsir-bayani-jumla_P2'] },
        },
        {
          id: 'E4', skill: 'halat', requires: ['halat-thalath'],
          prompt: <Q source={PLATFORM}><MathText>{'الجملة $\\begin{cases} y = 3x - 2 \\\\ y = 3x + 5 \\end{cases}$ :'}</MathText></Q>,
          options: [M('لا تقبل حلًّا: المستقيمان متوازيان'), M('لها حلّ وحيد: المستقيمان متقاطعان'), M('لها عدد لا نهائي من الحلول: المستقيمان منطبقان')],
          correct: 0, cols: 1,
          explain: <MathText>{'معامل التوجيه نفسه $3$ وترتيبان مختلفان عند المبدأ ($-2$ و $5$): المستقيمان متوازيان لا نقطة مشتركة لهما.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tafsir-bayani-jumla_P3'] },
        },
        {
          id: 'E5', skill: 'halat', requires: ['halat-thalath', 'muadala-mustaqim'],
          prompt: <Q source={PLATFORM}><MathText>{'الجملة $\\begin{cases} x + y = 2 \\\\ 3x + 3y = 6 \\end{cases}$ :'}</MathText></Q>,
          options: [M('لها عدد لا نهائي من الحلول: المستقيمان منطبقان'), M('لا تقبل حلًّا: المستقيمان متوازيان'), M('لها حلّ وحيد هو $(1 ; 1)$')],
          correct: 0, cols: 1,
          explain: <MathText>{'المعادلتان تُكتبان $y = -x + 2$ : المستقيم نفسه. $(1 ; 1)$ حلّ، لكنّه ليس الوحيد: $(0 ; 2)$ و $(2 ; 0)$ حلّان أيضًا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tafsir-bayani-jumla_P3'] },
        },
        {
          id: 'E6', skill: 'mustaqim', requires: ['muadala-mustaqim'],
          prompt: <Q source={PLATFORM}><MathText>{'مستقيم المعادلة $x - 2y = 4$ يقطع محور التراتيب في النقطة:'}</MathText></Q>,
          options: [M('$(0 ; -2)$'), M('$(0 ; 4)$'), M('$(0 ; 2)$'), M('$(4 ; 0)$')],
          correct: 0, cols: 4,
          explain: <MathText>{'$x - 2y = 4$ تُكتب $y = \\dfrac{1}{2}x - 2$ : يقطع محور التراتيب في $(0 ; -2)$. والنقطة $(4 ; 0)$ على المستقيم لكنها على محور الفواصل.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tafsir-bayani-jumla_P1'] },
        },
      ]}
      badges={[
        { id: 'mustaqim', emoji: '📏', label: 'كل معادلة مستقيم', test: (m) => (m.mustaqim ?? 0) === 0 },
        { id: 'taqatu', emoji: '🎯', label: 'الحل نقطة التقاطع', test: (m) => (m.taqatu ?? 0) === 0 },
        { id: 'halat', emoji: '🔀', label: 'الحالات الثلاث', test: (m) => (m.halat ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التفسير البياني لحل جملة معادلتين',
        title: 'انتهى الدرس 4',
        message: 'تعرف الآن أنّ كل معادلة من الجملة تُكتب على شكل دالة تآلفية ويمثّلها مستقيم، وأنّ حلّ الجملة إحداثيتا نقطة تقاطع المستقيمين نتحقّق منه بالحساب، وأنّ المستقيمين المتوازيين لا يعطيان حلًّا والمنطبقين يعطيان عددًا لا نهائيًا من الحلول.',
        verbs: ['أكتب', 'أرسم', 'أقرأ', 'أتحقّق'],
        masterBadgeLabel: 'التفسير البياني لحل جملة',
      }}
    />
  );
}
