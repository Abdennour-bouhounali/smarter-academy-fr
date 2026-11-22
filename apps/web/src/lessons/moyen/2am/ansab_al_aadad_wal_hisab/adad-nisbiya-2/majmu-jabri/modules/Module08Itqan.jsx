import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves : deux sommes avec parenthèses, deux écritures simplifiées (réécrites à partir de « أؤكّد تعلّماتي » 10 et 11, autres nombres)
 * et une égalité de soustraction. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js
 * qui vérifie aussi que le source de ce module contient chaque option.
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
        turn: { label: 'تحويل الطرح إلى جمع المعاكس', module: 1 },
        group: { label: 'تجميع الحدود وحساب الأقواس', module: 3 },
        simple: { label: 'الكتابة المبسّطة', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'turn', requires: ['tarh-ila-jam'],
          prompt: <Q source={PLATFORM}><MathText>{'$(-8)-(-3)+(+5)$ :'}</MathText></Q>,
          options: ['$0$', '$-6$', '$-10$', '$6$'], correct: 0, cols: 2,
          explain: <MathText>{'$(-8)+(+3)+(+5)$ : الموجبة $8$ والسالبة $-8$ ، فالناتج $0$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPoints: [{ code: '2am_majmu-jabri_P1', role: 'primary' }, { code: '2am_majmu-jabri_P2', role: 'secondary' }] },
        },
        {
          id: 'E2', skill: 'simple', requires: ['kitaba-mubassata'],
          prompt: <Q source={SELF.E2.source}><MathText>{'الكتابة المبسّطة لـ $(-4)-(+7)+(+2)-(-1)$ :'}</MathText></Q>,
          options: ['$-4-7+2+1$', '$-4+7+2-1$', '$4-7+2+1$', '$-4-7+2-1$'], correct: 0, cols: 1,
          explain: <MathText>{'$(-4)+(-7)+(+2)+(+1)$ ثم نحذف إشارة الجمع والأقواس: $-4-7+2+1$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_majmu-jabri_P3'] },
        },
        {
          id: 'E3', skill: 'group', requires: ['tariqat-aqwas-awwalan'],
          prompt: <Q source={PLATFORM}><MathText>{'$(+15)-[(-6)+(+4)]$ :'}</MathText></Q>,
          options: ['$17$', '$13$', '$-17$', '$25$'], correct: 0, cols: 2,
          explain: <MathText>{'ما بين القوسين أوّلًا: $(-6)+(+4)=(-2)$ ، ثم $(+15)-(-2)=(+17)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_majmu-jabri_P2'] },
        },
        {
          id: 'E4', skill: 'group', requires: ['tariqat-majmu-jabri'],
          prompt: <Q source={SELF.E4.source}><MathText>{'$-9+4-6+11$ :'}</MathText></Q>,
          options: ['$0$', '$-30$', '$30$', '$-8$'], correct: 0, cols: 2,
          explain: <MathText>{'الموجبة $4+11=15$ والسالبة $-9-6=-15$ ، فالناتج $0$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPoints: [{ code: '2am_majmu-jabri_P2', role: 'primary' }, { code: '2am_majmu-jabri_P3', role: 'secondary' }] },
        },
        {
          id: 'E5', skill: 'turn', requires: ['tarh-ila-jam'],
          prompt: <Q source={PLATFORM}><MathText>{'العبارة التي تساوي $(-7)-(-2)$ :'}</MathText></Q>,
          options: ['$(-7)+(+2)$', '$(+7)+(-2)$', '$(-7)+(-2)$', '$(-7)-(+2)$'], correct: 0, cols: 1,
          explain: <MathText>{'طرح $(-2)$ هو إضافة معاكسه: $(-7)-(-2)=(-7)+(+2)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_majmu-jabri_P1'] },
        },
      ]}
      badges={[
        { id: 'turn', emoji: '🔄', label: 'أحوّل الطرح إلى جمع', test: (m) => (m.turn ?? 0) === 0 },
        { id: 'group', emoji: '🪢', label: 'أجمّع وأبسّط', test: (m) => (m.group ?? 0) === 0 && (m.simple ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حساب المجموع الجبري',
        title: 'انتهى درس حساب مجموع جبري',
        message: 'تعرف الآن أن تحوّل كلّ طرح إلى جمع للمعاكس، وأن تجمّع الحدود الموجبة والسالبة وتحسب ما بين الأقواس أوّلًا، وأن تبسّط كتابة المجموع الجبري.',
        verbs: ['أحوّل', 'أجمّع', 'أبسّط'],
        masterBadgeLabel: 'حساب مجموع جبري',
      }}
    />
  );
}
