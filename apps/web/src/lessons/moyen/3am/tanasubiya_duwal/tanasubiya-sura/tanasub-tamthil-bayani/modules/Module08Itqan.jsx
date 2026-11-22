import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à partir de « أؤكّد تعلّماتي » 1–2
 * (autres nombres) plus trois épreuves de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données,
 * recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
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
        point: { label: 'نقطة العمود', module: 2 },
        bayan: { label: 'وضعية تناسبية في بيان', module: 2 },
        refus: { label: 'تمثيل ليس تناسبيًا', module: 3 },
        qiraa: { label: 'قراءة المعامل وقيمة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'point', requires: ['nuqta-jadwal'],
          prompt: <Q source={PLATFORM}><MathText>{'يربط جدول $7$ علب بـ $14$ دج. النقطة التي تمثّل هذا العمود في المعلم هي:'}</MathText></Q>,
          options: ['$(7\\ ;\\ 14)$', '$(14\\ ;\\ 7)$', '$(21\\ ;\\ 0)$', '$(7\\ ;\\ 7)$'], correct: 0, cols: 2,
          explain: <MathText>{'الفاصلة $7$ ثم الترتيب $14$ : $(7\\ ;\\ 14)$ . ($(14\\ ;\\ 7)$ عكست الإحداثيين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tanasub-tamthil-bayani_P1'] },
        },
        {
          id: 'E2', skill: 'bayan', requires: ['tamthil-tanasub'],
          prompt: <Q source={SELF.E2.source}><MathText>{'مثّلنا في معلم الجدول $3, 6, 9 \\to 12, 24, 36$ . النقط الثلاث هي:'}</MathText></Q>,
          options: ['على استقامة واحدة مع $O$ ', 'على مستقيم لا يمرّ بـ $O$ ', 'ليست على استقامة'], correct: 0, cols: 1,
          explain: <MathText>{'$\\frac{12}{3} = \\frac{24}{6} = \\frac{36}{9} = 4$ : الجدول جدول تناسبية، فالنقط على مستقيم يمرّ بـ $O$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tanasub-tamthil-bayani_P2'] },
        },
        {
          id: 'E3', skill: 'refus', requires: ['ghayr-tanasubi'],
          prompt: <Q source={SELF.E3.source}><MathText>{'رُسمت النقط $(1\\ ;\\ 3)$ و $(2\\ ;\\ 5)$ و $(4\\ ;\\ 9)$ في معلم. هل هي تمثيل لوضعية تناسبية؟'}</MathText></Q>,
          options: ['لا: على استقامة لكنّ المستقيم لا يمرّ بـ $O$ ', 'نعم: هي على استقامة واحدة', 'نعم: الترتيب يزيد مع الفاصلة', 'لا: ليست على استقامة'], correct: 0, cols: 1,
          explain: <MathText>{'الفروق متساوية ($+2$ لكلّ فاصلة) فهي على استقامة، لكنّ ترتيب الفاصلة $1$ هو $3$ لا $2{,}5$ : المستقيم لا يمرّ بـ $O$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tanasub-tamthil-bayani_P3'] },
        },
        {
          id: 'E4', skill: 'qiraa', requires: ['y-ax'],
          prompt: <Q source={PLATFORM}><MathText>{'نقط وضعية تناسبية على مستقيم يمرّ بـ $O$ وبالنقطة $(4\\ ;\\ 10)$ . ترتيب النقطة التي فاصلتها $6$ هو:'}</MathText></Q>,
          options: ['$15$', '$12$', '$16$', '$24$'], correct: 0, cols: 2,
          explain: <MathText>{'المعامل $\\frac{10}{4} = 2{,}5$ ، فـ $y = 2{,}5 \\times 6 = 15$ . ($12$ تُضيف $2$ إلى $10$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tanasub-tamthil-bayani_P4'] },
        },
        {
          id: 'E5', skill: 'qiraa', requires: ['muamil-qiraa'],
          prompt: <Q source={PLATFORM}><MathText>{'قرأنا على بيان وضعية تناسبية أنّ $(5\\ ;\\ 12)$ إحدى نقطه. معامل التناسبية هو:'}</MathText></Q>,
          options: ['$2{,}4$', '$\\frac{5}{12}$', '$60$', '$7$'], correct: 0, cols: 2,
          explain: <MathText>{'$a = \\frac{12}{5} = 2{,}4$ ، أي ترتيب النقطة التي فاصلتها $1$ . ($\\frac{5}{12}$ قلبت القسمة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tanasub-tamthil-bayani_P4'] },
        },
      ]}
      badges={[
        { id: 'bayan', emoji: '📍', label: 'أقرأ بيان التناسبية', test: (m) => (m.bayan ?? 0) === 0 },
        { id: 'refus', emoji: '🧐', label: 'أرفض ما ليس تناسبيًا', test: (m) => (m.refus ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التمثيل البياني للتناسبية',
        title: 'انتهى درس التناسبية والتمثيل البياني',
        message: 'تعرف الآن أنّ وضعية التناسبية تُمثَّل بنقط على مستقيم يمرّ بـ O ، وتحكم على تمثيل بمرور المسطرة بالمبدأ واستقامة النقط، وتقرأ معامل التناسبية وتستخرج قيمًا مجهولة.',
        verbs: ['أمثّل', 'أحكم', 'أقرأ'],
        masterBadgeLabel: 'التناسبية والبيان',
      }}
    />
  );
}
