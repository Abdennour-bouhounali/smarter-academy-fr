import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TRUCKS } from '../content/textbook';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : les deux camions (l'`evaluation` du manuel redessinée : 12 caisses de dattes + 40 kg d'oranges contre 8 caisses + 140 kg), en cinq épreuves
 * — la traduction, la résolution, la vérification (la charge commune), une borne entière (combien de caisses de plus) et l'encadrement d'une charge à partir d'une lecture arrondie. Les épreuves
 * restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/textbook.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js, qui vérifie que ce fichier contient chaque
 * option. Chaque distracteur est FAUX et porte une erreur de l'unité (équation mal traduite, signe gardé, oranges oubliées, arrondi vers le haut d'une borne entière, troncature, borne haute incluse).
 * E1–E3 : P2 (modéliser, résoudre, vérifier) ; E4–E5 : P1 (propriétés des inégalités et encadrement). Une seule épreuve par الكفاءة principale.
 */
const Q = ({ children }) => <span>{typeof children === 'string' ? <MathText>{children}</MathText> : children} <SourceTag source={TRUCKS.source} /></span>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="شاحنتان: المعادلة والحلّ والتحقّق، ثم المتباينة والحصر" estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG} timerSeconds={6 * 60} timerLabel="6 دقائق"
      brief={{ tag: 'أدمج تعلّماتي', title: 'ما كتلة الصندوق الواحد؟', tone: 'amber', body: <p><MathText>{TRUCKS.text}</MathText></p> }}
      skills={{
        translate: { label: 'ترجمة وضعية بمعادلة', module: 1 },
        solve: { label: 'حلّ المعادلة', module: 2 },
        check: { label: 'التحقّق من الحلّ', module: 6 },
        bound: { label: 'عدد الصناديق الممكن بمتباينة', module: 4 },
        round: { label: 'حصر من قراءة مدوَّرة', module: 3 },
      }}
      epreuves={[
        { id: 'E1', skill: 'translate', requires: ['muadalat-darajat-ula-3am'], prompt: <Q>{'المرحلة 1 — المعادلة التي تترجم أنّ الشاحنتين تحملان الكتلة نفسها هي ...'}</Q>,
          options: opts(['$12x + 40 = 8x + 140$', '$12x + 8x = 40 + 140$', '$12x + 140 = 8x + 40$', '$12 + 40x = 8 + 140x$']), correct: 0, cols: 1,
          explain: <MathText>{'كتلة الأولى $12x + 40$ وكتلة الثانية $8x + 140$ ، والمعادلة تساوي بينهما. الخطأ الأوّل جمع الشاحنتين بدل المساواة بينهما، والثاني بدّل الأوزان 40 و 140 بين الشاحنتين، والثالث جعل الصناديق أعدادًا والأوزان معاملات.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'] } },
        { id: 'E2', skill: 'solve', requires: ['muadalat-darajat-ula-3am'], prompt: <Q>{'المرحلة 2 — حلّ المعادلة $12x + 40 = 8x + 140$ هو ...'}</Q>,
          options: opts(['$x = 25$', '$x = 45$', '$x = 22{,}5$', '$x = -25$']), correct: 0, cols: 1,
          explain: <MathText>{'نطرح $8x$ و $40$ من الطرفين: $4x = 100$ ، ثم نقسم على $4$ : $x = 25$ . الخطأ الأوّل أضاف $40$ بدل أن يطرحها فوجد $4x = 180$ ، والثاني قسم $180$ على $8$ ، والثالث فقد إشارة الحلّ.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'] } },
        { id: 'E3', skill: 'check', requires: ['muadalat-darajat-ula-3am'], prompt: <Q>{'المرحلة 3 — كتلة حمولة كل شاحنة بالكيلوغرام هي ...'}</Q>,
          options: opts(['$340$', '$300$', '$380$', '$440$']), correct: 0, cols: 1,
          explain: <MathText>{'نعوّض: $12 \\times 25 + 40 = 340$ و $8 \\times 25 + 140 = 340$ . الخطأ الأوّل نسي البرتقال، والثاني عدّه مرّتين، والثالث أضاف برتقال الشاحنة الأخرى.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'] } },
        { id: 'E4', skill: 'bound', requires: ['mutabayinat-amaliyat-3am'], prompt: <Q>{'المرحلة 4 — تحمل الشاحنة الثانية $500\\ \\mathrm{kg}$ على الأكثر. أكبر عدد من الصناديق يمكن إضافته إليها هو ...'}</Q>,
          options: opts(['$6$', '$7$', '$6{,}4$', '$20$']), correct: 0, cols: 1,
          explain: <MathText>{'الشرط $340 + 25k \\le 500$ يعطي $25k \\le 160$ ، أي $k \\le 6{,}4$ ، والعدد عدد صحيح من الصناديق: $6$ . الخطأ الأوّل رفع $6{,}4$ إلى $7$ فتتجاوز الحمولة $500\\ \\mathrm{kg}$ ، والثاني ترك القيمة غير صحيحة، والثالث قسم $500$ على $25$ دون خصم الحمولة الحالية.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1'] } },
        { id: 'E5', skill: 'round', requires: ['hasr-adad-ushri-3am', 'mutabayinat-amaliyat-3am'], prompt: <Q>{'المرحلة 5 — قاس عامل كتلة الصندوق بميزان يدوّر إلى $0{,}1\\ \\mathrm{kg}$ فقرأ $25{,}0$ . حصر $L$ ، حمولة الشاحنة الأولى، هو ...'}</Q>,
          options: opts(['$339{,}4 \\le L < 340{,}6$', '$340 \\le L < 341{,}2$', '$339{,}4 \\le L \\le 340{,}6$', '$299{,}4 \\le L < 300{,}6$']), correct: 0, cols: 1,
          explain: <MathText>{'القراءة $25{,}0$ تعني $24{,}95 \\le x < 25{,}05$ ، فـ $12x + 40$ محصورة بين $12 \\times 24{,}95 + 40 = 339{,}4$ و $12 \\times 25{,}05 + 40 = 340{,}6$ (الحدّ الأعلى مستبعد). الخطأ الأوّل عدّ التدوير حذفًا للأرقام، والثاني أدخل الحدّ الأعلى، والثالث نسي الـ $40\\ \\mathrm{kg}$ .'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🚛', label: 'أدمجت تعلّماتي', test: (m) => (m.translate ?? 0) + (m.solve ?? 0) + (m.check ?? 0) + (m.bound ?? 0) + (m.round ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أنهيت الوحدة 5', title: 'المساويات – المتباينات – المعادلات',
        message: 'كتلة الصندوق $25\\ \\mathrm{kg}$ وحمولة كل شاحنة $340\\ \\mathrm{kg}$ ؛ ويمكن إضافة $6$ صناديق إلى الشاحنة الثانية، وحمولة الأولى بين $339{,}4$ و $340{,}6\\ \\mathrm{kg}$ عند القراءة المدوَّرة. وظّفت المعادلة والمتباينة والحصر في وضعية واحدة.',
        verbs: ['أقرأ', 'أترجم', 'أحلّ', 'أتحقّق'], masterBadgeLabel: 'الوحدة 5',
      }}
    />
  );
}
