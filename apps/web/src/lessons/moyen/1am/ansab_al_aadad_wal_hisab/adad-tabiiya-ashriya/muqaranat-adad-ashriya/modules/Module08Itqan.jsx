import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (réécrites à partir de
 * « أقوّم تعلّماتي » 8 et 9, autres nombres) : une الكفاءة principale par épreuve. Toutes les clés sont recalculées en arithmétique
 * décimale exacte dans ../content/content.test.js ; chaque distracteur y est vérifié FAUX.
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
        compare: { label: 'مقارنة عددين', module: 1 },
        zeros: { label: 'إتمام الأصفار', module: 1 },
        order: { label: 'الترتيب', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'compare', requires: ['taqarun-rutab'],
          prompt: <Q source={SELF[8].source}><MathText>{'أيّ هذه المقارنات صحيحة؟'}</MathText></Q>,
          options: ['$7{,}09<7{,}5$', '$7{,}09>7{,}5$', '$7{,}5<7{,}09$', '$7{,}50<7{,}5$'], correct: 0, cols: 2,
          explain: <MathText>{'الجزآن الصحيحان متساويان، ورقم الأعشار 0 أقل من 5، إذن $7{,}09<7{,}5$ . أمّا $7{,}50$ فيساوي $7{,}5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_muqaranat-adad-ashriya_P1'] },
        },
        {
          id: 'E2', skill: 'zeros', requires: ['itmam-asfar'],
          prompt: <Q source={SELF[8].source}><MathText>{'أيّ هذه المقارنات صحيحة؟'}</MathText></Q>,
          options: ['$2{,}40=2{,}4$', '$2{,}40>2{,}4$', '$2{,}04=2{,}4$', '$2{,}04>2{,}4$'], correct: 0, cols: 2,
          explain: <MathText>{'الصفر الأخير بعد الفاصلة لا يغيّر العدد: $2{,}40=2{,}4$ . أمّا $2{,}04$ فرقم أعشاره 0، وهو أصغر من $2{,}4$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_muqaranat-adad-ashriya_P2'] },
        },
        {
          id: 'E3', skill: 'zeros', requires: ['itmam-asfar'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ العددين أكبر: $0{,}7$ أم $0{,}25$ ؟'}</MathText></Q>,
          options: ['$0{,}7$', '$0{,}25$', 'العددان متساويان'], correct: 0, cols: 3,
          explain: <MathText>{'$0{,}7=0{,}70$ ، و 70 جزءًا من مائة أكثر من 25 جزءًا. لا ننظر إلى 25 و 7 كأنّهما عددان طبيعيان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_muqaranat-adad-ashriya_P2'] },
        },
        {
          id: 'E4', skill: 'order', requires: ['tartib-silsila'],
          prompt: <Q source={SELF[9].source}><MathText>{'أيّ السلاسل الآتية مرتّبة ترتيبًا تصاعديًا؟'}</MathText></Q>,
          options: ['$3{,}99<4{,}03<4{,}13<4{,}3$', '$4{,}03<3{,}99<4{,}13<4{,}3$', '$3{,}99<4{,}13<4{,}03<4{,}3$', '$4{,}3<4{,}13<4{,}03<3{,}99$'], correct: 0, cols: 1,
          explain: <MathText>{'أصغر جزء صحيح 3 فالعدد $3{,}99$ أوّلًا؛ ثم أعشار 4,03 و 4,13 و 4,3: 0 و 1 و 3.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_muqaranat-adad-ashriya_P3'] },
        },
        {
          id: 'E5', skill: 'order', requires: ['tartib-silsila'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ هذه الأعداد هو الأكبر: $12{,}09$ ، $12{,}9$ ، $12{,}085$ ، $11{,}99$ ؟'}</MathText></Q>,
          options: ['$12{,}9$', '$12{,}09$', '$12{,}085$', '$11{,}99$'], correct: 0, cols: 2,
          explain: <MathText>{'$11{,}99$ جزؤه الصحيح 11 فهو أصغر؛ والبقية جزؤها الصحيح 12: أعشارها 9 و 0 و 0 ، فالأكبر هو $12{,}9$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_muqaranat-adad-ashriya_P3'] },
        },
      ]}
      badges={[
        { id: 'compare', emoji: '⚖️', label: 'أقارن بدقّة', test: (m) => (m.compare ?? 0) === 0 },
        { id: 'order', emoji: '📏', label: 'أرتّب أعدادًا عشرية', test: (m) => (m.order ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مقارنة الأعداد العشرية وترتيبها',
        title: 'انتهى درس مقارنة الأعداد العشرية وترتيبها',
        message: 'تعرف الآن أنّ الجزء الصحيح يحسم أوّلًا، وأنّ الأرقام بعد الفاصلة تُقارن رتبةً برتبة أو بعد إتمامها بأصفار، وأنّ العدد الأطول ليس الأكبر.',
        verbs: ['أقارن', 'أتمّ', 'أرتّب'],
        masterBadgeLabel: 'مقارنة الأعداد العشرية',
      }}
    />
  );
}
