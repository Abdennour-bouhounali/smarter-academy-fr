import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST } from '../content/textbook';
import StatTable from '../components/StatTable';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : la situation TRANSPOSÉE (extraction › situation ›
 * duplicatedIn module 8) — une autre compétition (البطولة الإفريقية لألعاب القوى, content/textbook.js ›
 * TEST), mêmes ressources, autres nombres ; aucune réponse n'apparaît ailleurs dans la leçon.
 *   E1 (P2)  le nombre de pays : N = 20 (pas 10 colonnes, pas 16 sans les colonnes cachées)
 *   E2 (P2)  les rangs de la médiane : 10 et 11 (pas les colonnes du milieu)
 *   E3 (P1)  la première valeur cachée : cumulés 6, 8, 11 → rangs 10 et 11 dans sa colonne → 4
 *   E4 (P3)  l'équation de la moyenne : 97 + 3 × 4 + y = 6,2 × 20
 *   E5 (P1)  la seconde valeur cachée : y = 15
 *   E6 (P3)  64 % : T = 20 ÷ 0,64 = 31,25 ≈ 31 → 11 pays seulement argent ou bronze
 * Chaque distracteur est FAUX (MISC-IHSA-WASIT-QIMA-WUSTA-JADWAL, MISC-IHSA-MUTAWASSIT-BILA-TARJIH,
 * MISC-IHSA-MUTAWASSIT-QISMA-QIYAM, MISC-IHSA-NISBA-MIN-ADAD) ; une seule LP primaire par épreuve, les
 * trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['20 دولة', '10 دول', '16 دولة', '21 دولة'];
const O2 = ['10 و 11', '5 و 6', '20 و 21', '$10{,}5$ فقط'];
const O3 = ['4', '3', '5', '$3{,}5$'];
const O4 = [
  '$97 + 3 \\times 4 + y = 6{,}2 \\times 20$',
  '$97 + 4 + y = 6{,}2 \\times 20$',
  '$\\dfrac{97 + 3 \\times 4 + y}{10} = 6{,}2$',
  '$97 + 3 \\times 4 + y = 6{,}2$',
];
const O5 = ['15', '23', '18', '27'];
const O6 = ['11 دولة', '13 دولة', '7 دول', '12 دولة'];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  const { values, counts } = TEST.numbers;
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="إختبار أولي" moduleSubtitle="وضعية أخرى: الموارد نفسها، أعداد أخرى" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={7 * 60} timerLabel="7 دقائق"
      brief={{
        tag: 'أدمج تعلّماتي — وضعية من المنصّة', title: TEST.title, tone: 'amber',
        body: (
          <div className="space-y-2" data-situation="athletisme">
            <p>{TEST.intro}</p>
            <StatTable id="test" valueLabel="عدد الميداليات الذهبية" countLabel="التكرار" values={values} counts={counts} />
            <p><MathText>{TEST.data}</MathText></p>
            <p>{TEST.q2}</p>
          </div>
        ),
      }}
      skills={{
        tahlil: { label: 'قراءة الجدول وترتيب المعطيات', module: 7 },
        tajnid: { label: 'الوسيط والمتوسط يكشفان القيم المخفية', module: 7 },
        tanfidh: { label: 'المعادلة والنسبة المئوية وتحرير النتيجة', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'tahlil', requires: ['qiraat-jadwal'], prompt: <Q>عدد الدول التي فازت بميدالية ذهبية واحدة على الأقل في هذه البطولة:</Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 2,
          explain: <MathText>{'التكرار الكلي مجموع التكرارات، بما فيها تكرارا العمودين المخفيين: $6 + 2 + 3 + 2 + 1 + 1 + 1 + 1 + 1 + 2 = 20$. العدد 10 عدد الأعمدة، و 16 ينسى العمودين المخفيين، و 21 أكبر قيمة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P2'] } },
        { id: 'E2', skill: 'tahlil', requires: ['qima-makhfiya-wasit'], prompt: <Q>الوسيط هو نصف مجموع القيمتين اللتين رتبتاهما:</Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'$N = 20$ زوجي: الرتبتان $\\dfrac{20}{2} = 10$ و $11$. أمّا 5 و 6 فهما العمودان الأوسطان في سطر الجدول، والرتبة $10{,}5$ ليست رتبة دولة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P2'] } },
        { id: 'E3', skill: 'tajnid', requires: ['qima-makhfiya-wasit'], prompt: <Q>القيمة المخفية الأولى (بين 2 و 5):</Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 4,
          explain: <MathText>{'التكرارات المجمعة الصاعدة: 6 ، $6 + 2 = 8$ ، $8 + 3 = 11$ : الرتب من 9 إلى 11 في عمود القيمة المخفية الأولى، فالرتبتان 10 و 11 فيه والوسيط يساويها: 4.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P1'] } },
        { id: 'E4', skill: 'tanfidh', requires: ['qima-makhfiya-mutawassit'], prompt: <Q><MathText>{'مجموع جداءات القيم الظاهرة في تكراراتها 97. نسمّي $y$ القيمة المخفية الثانية. المعادلة التي يعطيها المتوسط:'}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 1,
          explain: <MathText>{'مجموع الميداليات $6{,}2 \\times 20 = 124$ ، والقيمة الأولى 4 تكرارها 3: $97 + 3 \\times 4 + y = 124$. نقسم على التكرار الكلي 20 لا على عدد الأعمدة 10.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P3'] } },
        { id: 'E5', skill: 'tajnid', requires: ['qima-makhfiya-mutawassit', 'muadala-ula'], prompt: <Q>القيمة المخفية الثانية (بين 12 و 21):</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 4,
          explain: <MathText>{'$109 + y = 124$ ، إذن $y = 15$. تحقق: $\\dfrac{97 + 12 + 15}{20} = \\dfrac{124}{20} = 6{,}2$. العدد 23 ينسى التكرار 3 ، و 18 يأخذ القيمة الأولى 3 ، و 27 ينسى القيمة الأولى كلها.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P1'] } },
        { id: 'E6', skill: 'tanfidh', requires: ['kull-min-nisba'], prompt: <Q>عدد الدول التي تحصّلت فقط على ميداليات فضية أو برونزية (قيمة مقرّبة إلى الوحدة):</Q>,
          options: opts(O6), optionLabel: label(O6), correct: 0, cols: 2,
          explain: <MathText>{'$0{,}64 \\times T = 20$ ، إذن $T = \\dfrac{20}{0{,}64} = 31{,}25$ ، أي 31 دولة، و $31 - 20 = 11$. العدد 13 يأتي من $0{,}64 \\times 20 = 12{,}8$ (أخذ 64% من 20 بدل إيجاد الكل)، و 12 من تدوير $31{,}25$ إلى 32.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P3'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🏅', label: 'أدمجت تعلّماتي', test: (m) => (m.tahlil ?? 0) + (m.tajnid ?? 0) + (m.tanfidh ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 8', title: 'الإحصاء', message: 'ماذا كشف الوسيط، وماذا كشف المتوسط، وكيف عرفت عدد الدول التي لم تفز بالذهب؟ جمعت في هذه الوضعية ما تعلّمته في دروس الوحدة.', verbs: ['أقرأ', 'أرتّب', 'أحسب', 'أحرّر'], masterBadgeLabel: 'الوحدة 8' }} />
  );
}
