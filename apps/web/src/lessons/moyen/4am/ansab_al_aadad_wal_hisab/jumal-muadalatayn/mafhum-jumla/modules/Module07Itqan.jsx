import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST_ITEMS as T } from '../content/test';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Six épreuves écrites par la PLATEFORME (rollout 2026-11-12, prompt §12.12) : E1–E4 gardent les ids, les compétences et les LP des questions à choix du manuel
 * (content/test.js, vérifiés par content/mission.test.js — une seule bonne réponse chacune), E5 (la ثنائية solution parmi des ثنائيات qui ne
 * vérifient qu'UNE équation ou renversée) et E6 (une jumla sans solution). Chaque épreuve évalue UN point d'apprentissage ; P1–P4 sont couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module07Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="إختبار أولي"
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="7 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        shakl: { label: 'جملة معادلتين بمجهولين', module: 2 },
        hall: { label: 'حل الجملة واختبار ثنائية', module: 2 },
        halat: { label: 'الحالات الخاصة', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'shakl', requires: ['jumla-tarif'],
          prompt: <MathText>{T.E1.text}</MathText>,
          options: T.E1.options.map(M),
          correct: 1, cols: 1, keepOrder: true,
          explain: <MathText>{T.E1.explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-jumla_P1'] },
        },
        {
          id: 'E2', skill: 'hall', requires: ['ikhtibar-thunaiya'],
          prompt: <MathText>{T.E2.text}</MathText>,
          options: T.E2.options.map(M),
          correct: 1, cols: 1,
          explain: <MathText>{T.E2.explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-jumla_P3'] },
        },
        {
          id: 'E3', skill: 'hall', requires: ['ikhtibar-thunaiya'],
          prompt: <MathText>{T.E3.text}</MathText>,
          options: T.E3.options.map(M),
          correct: 0, cols: 1,
          explain: <MathText>{T.E3.explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-jumla_P3'] },
        },
        {
          id: 'E4', skill: 'shakl', requires: ['jumla-tarif'],
          prompt: <MathText>{T.E4.text}</MathText>,
          options: T.E4.options.map(M),
          correct: 2, cols: 1,
          explain: <MathText>{T.E4.explain}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-jumla_P1'] },
        },
        {
          id: 'E5', skill: 'hall', requires: ['hall-jumla', 'tartib-thunaiya'],
          prompt: <MathText>{'حل الجملة $\\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}$ هو الثنائية'}</MathText>,
          options: [M('$(2 ; 3)$'), M('$(3 ; 2)$'), M('$(5 ; 0)$'), M('$(1 ; 0)$')],
          correct: 1, cols: 4,
          explain: <MathText>{'$3 + 2 = 5$ و $3 - 2 = 1$ : المعادلتان معًا. أما $(2 ; 3)$ فتعطي $2 - 3 = -1 \\neq 1$ (الترتيب)، و $(5 ; 0)$ تحقّق الأولى وحدها: $5 - 0 = 5 \\neq 1$ ، و $(1 ; 0)$ الثانية وحدها: $1 + 0 = 1 \\neq 5$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-jumla_P2'] },
        },
        {
          id: 'E6', skill: 'halat', requires: ['halat-khassa'], keepOrder: true,
          prompt: <MathText>{'الجملة $\\begin{cases} x + 2y = 3 \\\\ 2x + 4y = 5 \\end{cases}$ ...'}</MathText>,
          options: [M('لها حل وحيد'), M('ليس لها حلول'), M('لها عدد غير منته من الحلول')],
          correct: 1, cols: 1,
          explain: <MathText>{'نقسم طرفي $2x + 4y = 5$ على 2: $x + 2y = \\dfrac{5}{2}$. لا يمكن أن يساوي $x + 2y$ العدد 3 والعدد $\\dfrac{5}{2}$ في آن واحد: الجملة ليس لها حلول.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-jumla_P4'] },
        },
      ]}
      badges={[
        { id: 'shakl', emoji: '🧩', label: 'جملة معادلتين', test: (m) => (m.shakl ?? 0) === 0 },
        { id: 'hall', emoji: '✌️', label: 'المعادلتان في آن واحد', test: (m) => (m.hall ?? 0) === 0 },
        { id: 'halat', emoji: '🔀', label: 'الحالات الخاصة', test: (m) => (m.halat ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مفهوم جملة معادلتين',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن جملة معادلتين من الدرجة الأولى بمجهولين، وأنّ حلّها ثنائية تحقّق المعادلتين في آن واحد، وأنّ لبعض الجمل حلولًا لا تنتهي أو لا حل لها.',
        verbs: ['أعوّض', 'أتحقّق', 'أرتّب', 'أميّز'],
        masterBadgeLabel: 'مفهوم جملة معادلتين',
      }}
    />
  );
}
