import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 9 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (nombres jamais
 * posés ailleurs dans la leçon), dans le registre des اختبارات الفصل الأول : lire, écrire, le rang d'un chiffre, عدد
 * العشرات, le مفكوك. Une الكفاءة principale par épreuve ; toutes les clés sont recalculées dans ../content/content.test.js.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module09Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة، ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        qiraa: { label: 'القراءة والكتابة فئةً فئةً', module: 2 },
        maratib: { label: 'المراتب: الرقم والعدد', module: 3 },
        mafkuk: { label: 'المفكوك النموذجي', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'qiraa', requires: ['fiaat'],
          prompt: <span>العدد <MathText>{'$30\\,405\\,012$'}</MathText> يُقرأ:</span>,
          options: ['ثلاثون مليونا وأربعمائة وخمسة آلاف واثنا عشر', 'ثلاثة ملايين وأربعمائة وخمسون ألفا واثنا عشر', 'ثلاثون مليونا وأربعمائة وخمسون ألفا ومائة واثنا عشر'], correct: 0, cols: 1,
          explain: <MathText>{'ثلاث فئات: 30 (ملايين) ، 405 (آلاف) ، 012 أي 12.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kitabat-adad-tabii_P1'] },
        },
        {
          id: 'E2', skill: 'qiraa', requires: ['fiaat'],
          prompt: <span>العدد «ستة ملايين وثمانية آلاف وأربعون» يُكتب بالأرقام:</span>,
          options: [M('$6\\,008\\,040$'), M('$6\\,800\\,040$'), M('$6\\,008\\,400$')], correct: 0, cols: 3,
          explain: <MathText>{'فئة الآلاف 008 وفئة الوحدات 040: الأصفار تحفظ المراتب الفارغة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kitabat-adad-tabii_P1'] },
        },
        {
          id: 'E3', skill: 'maratib', requires: ['jadwal-maratib'],
          prompt: <span>في العدد <MathText>{'$52\\,318{,}47$'}</MathText> ، رقم الأجزاء من مائة هو:</span>,
          options: ['7', '4', '1'], correct: 0, cols: 3,
          explain: <span>الرقم الثاني بعد الفاصلة: 7 (الرقم 4 هو رقم الأعشار، و 1 رقم العشرات).</span>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kitabat-adad-tabii_P2'] },
        },
        {
          id: 'E4', skill: 'maratib', requires: ['raqm-adad'],
          prompt: <span>عدد العشرات في العدد <MathText>{'$52\\,318$'}</MathText> هو:</span>,
          options: ['5231', '1', '52318'], correct: 0, cols: 3,
          explain: <MathText>{'نحذف رقم الآحاد: $52\\,318 = 5231 \\times 10 + 8$ ؛ أمّا 1 فهو رقم العشرات.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kitabat-adad-tabii_P2'] },
        },
        {
          id: 'E5', skill: 'mafkuk', requires: ['mafkuk'],
          prompt: <span>العدد الذي مفكوكه <MathText>{'$7 \\times 10\\,000 + 4 \\times 100 + 9$'}</MathText> هو:</span>,
          options: [M('$70\\,409$'), M('$7\\,409$'), M('$740\\,900$')], correct: 0, cols: 3,
          explain: <MathText>{'7 عشرات آلاف، 0 آلاف، 4 مئات، 0 عشرات، 9 آحاد: $70\\,409$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kitabat-adad-tabii_P3'] },
        },
      ]}
      badges={[
        { id: 'qiraa', emoji: '📖', label: 'أقرأ فئةً فئةً', test: (m) => (m.qiraa ?? 0) === 0 },
        { id: 'maratib', emoji: '🔢', label: 'أميّز الرقم من العدد', test: (m) => (m.maratib ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت كتابة الأعداد الطبيعية',
        title: 'انتهى درس كتابة الأعداد الطبيعية ودلالة الأرقام',
        message: 'تقرأ الآن الأعداد الكبيرة وتكتبها فئةً فئةً، وتعرف قيمة كل رقم من موقعه. الدرس التالي يواصل المراتب بعد الفاصلة: الكسور العشرية.',
        verbs: ['أقرأ', 'أكتب', 'أفكّك'],
        masterBadgeLabel: 'كتابة الأعداد الطبيعية',
      }}
    />
  );
}
