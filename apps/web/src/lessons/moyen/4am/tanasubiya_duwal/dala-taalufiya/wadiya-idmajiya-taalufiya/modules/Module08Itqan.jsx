import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST } from '../content/textbook';
import { ParticipantsFigure } from '../components/TripFigures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : une AUTRE sortie (شاطئ الصابلات, content/textbook.js ›
 * TEST), mêmes cinq ressources, autres nombres — la situation du module 7 a été résolue pas à pas,
 * l'évaluation est sa transposition. Six épreuves qui suivent l'« تنفيذ » :
 *   E1 (P1)  les participants : x + y = 40, 250x + 500y = 11000 → (36 ; 4)               درس 4
 *   E2 (P1)  « الموج » par deux devis (20 ; 7600), (30 ; 9400) → k(x) = 180x + 4000        درس 3
 *   E3 (P1)  « الفجر » h(x) = 120x + 6400 : h(36) = 10720                                 درس 1
 *   E4 (P2)  le choix pour 36 élèves : « الموج » (10480 < 10720 ; égalité à 40 élèves)     درس 2 et 5
 *   E5 (P2)  pédalos 200x, 100x + 300, 800 pour 6 heures → جـ (800 DA)                      درس 5
 *   E6 (P2)  le plus grand nombre d'élèves pour 11000 DA avec « الموج » : 38 (arrondi vers le bas)
 * Chaque distracteur est FAUX (MISC-JUMLA-BAYANI-MAQLUB, MISC-TAGHAYYUR-BIDUN-QISMA,
 * MISC-TAGHAYYUR-B-NISBA, MISC-TAALUFI-KHATTIYA-KHALT, MISC-TAALUFI-NISYAN-B, MISC-TARRID-AFDAL-DAIMAN,
 * MISC-TARRID-JUZ-THABIT, MISC-TAALUFI-SABIQ-QISMA) ; une seule LP primaire par épreuve, les deux couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = [
  '36 تلميذا و 4 مرافقين: $(36 ; 4)$',
  '4 تلاميذ و 36 مرافقا: $(4 ; 36)$',
  '20 تلميذا و 20 مرافقا: $(20 ; 20)$',
  '40 تلميذا دون مرافقين: $(40 ; 0)$',
];
const O2 = [
  '$k(x) = 180x + 4000$',
  '$k(x) = 1800x + 4000$',
  '$k(x) = 380x$',
  '$k(x) = 180x + 7600$',
];
const O3 = [
  '$10720\\,\\mathrm{DA}$',
  '$4320\\,\\mathrm{DA}$',
  '$10480\\,\\mathrm{DA}$',
  '$234720\\,\\mathrm{DA}$',
];
const O4 = [
  '«الموج»: يتساوى الثمنان عند 40 تلميذا، وقبل ذلك «الموج» أرخص ($10480 < 10720$)',
  '«الفجر»: ثمن التلميذ عنده أقل، فهو الأرخص دائما',
  '«الفجر»: لأنّ $36 < 40$',
  'أيّا منهما: الثمن نفسه من أجل 36 تلميذا',
];
const O5 = [
  'الصيغة جـ: 800 DA',
  'الصيغة ب: $100 \\times 6 + 300 = 900\\,\\mathrm{DA}$',
  'الصيغة أ: لا رسم ثابت فيها',
  'الصيغة ب: $(100 + 300) \\times 6 = 2400\\,\\mathrm{DA}$',
];
const O6 = [
  '38 تلميذا',
  '39 تلميذا',
  '61 تلميذا',
  '$38{,}9$ تلميذا',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="إختبار أولي" moduleSubtitle="رحلة أخرى إلى شاطئ الصابلات: الموارد نفسها، أعداد أخرى" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={7 * 60} timerLabel="7 دقائق"
      brief={{
        tag: 'أدمج تعلّماتي — وضعية من المنصّة', title: TEST.title, tone: 'amber',
        body: (
          <div className="space-y-2" data-situation="sablettes">
            <p><MathText>{TEST.intro}</MathText></p>
            <p><MathText>{TEST.part1}</MathText></p>
            <ParticipantsFigure persons={40} intercept={22} xMax={44} yMax={44} step={4} />
            <p><MathText>{TEST.part2}</MathText></p>
            <p><MathText>{TEST.part3}</MathText></p>
          </div>
        ),
      }}
      skills={{
        tajnid: { label: 'تجنيد الموارد: الجملة، الدستور، الصورة', module: 7 },
        tafsir: { label: 'الاختيار وتفسير النتيجة', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'tajnid', requires: ['jumla-bayaniya'], prompt: <Q><MathText>{'عدد التلاميذ $x$ وعدد المرافقين $y$ (المستقيمان على الشكل: $y = -x + 40$ و $y = -\\dfrac{1}{2}x + 22$):'}</MathText></Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 1,
          explain: <MathText>{'$x + y = 40$ و $250x + 500y = 11000$ ، أي $y = -x + 40$ و $y = -\\dfrac{1}{2}x + 22$ : يتقاطعان في $(36 ; 4)$. تحقق: $36 + 4 = 40$ و $250 \\times 36 + 500 \\times 4 = 9000 + 2000 = 11000$. الثنائية $(4 ; 36)$ مقلوبة، و $(20 ; 20)$ و $(40 ; 0)$ تحقق معادلة واحدة فقط.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1'] } },
        { id: 'E2', skill: 'tajnid', requires: ['min-thunaiyatayn'], prompt: <Q><MathText>{'دستور ثمن «الموج» $k(x)$ بدلالة عدد التلاميذ $x$ :'}</MathText></Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'$a = \\dfrac{9400 - 7600}{30 - 20} = \\dfrac{1800}{10} = 180$ ، ثم $b = 7600 - 180 \\times 20 = 4000$. الفرق 1800 ثمن 10 تلاميذ، و $k(x) = 380x$ تحقق العرض الأول وحده ($380 \\times 30 = 11400 \\neq 9400$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1'] } },
        { id: 'E3', skill: 'tajnid', requires: ['taklifa-taalufiya'], prompt: <Q>ثمن «الفجر» (6400 DA ثابتة و 120 DA عن كل تلميذ) من أجل 36 تلميذا:</Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 2,
          explain: <MathText>{'$120 \\times 36 + 6400 = 4320 + 6400 = 10720$. العدد 4320 ينسى المبلغ الثابت، و 10480 ثمن «الموج» ($180 \\times 36 + 4000$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1'] } },
        { id: 'E4', skill: 'tafsir', requires: ['ikhtiyar-sigha'], prompt: <Q>للقسم (36 تلميذا) يختار:</Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 1,
          explain: <MathText>{'$120x + 6400 = 180x + 4000$ تعطي $2400 = 60x$ ، أي $x = 40$. قبل 40 تلميذا مستقيم «الموج» تحت مستقيم «الفجر»: $k(36) = 10480 < h(36) = 10720$. ثمن التلميذ الأقل لا يكفي: المبلغ الثابت لـ «الفجر» أكبر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P2'] } },
        { id: 'E5', skill: 'tafsir', requires: ['thalath-sigh'], prompt: <Q>كراء قارب بدوّاسات لمدة 6 ساعات: الصيغة الأرخص هي:</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'لـ 6 ساعات: أ $200 \\times 6 = 1200$ ، ب $100 \\times 6 + 300 = 900$ ، جـ $800$. الصيغة جـ هي الأرخص بعد 5 ساعات ($100 \\times 5 + 300 = 800$). الرسم الثابت يُدفع مرّة واحدة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P2'] } },
        { id: 'E6', skill: 'tafsir', requires: ['tafsir-natija', 'taklifa-taalufiya'], prompt: <Q>بالمبلغ المجموع (11000 DA) وحده، أكبر عدد من التلاميذ يمكن أن ينقله «الموج»:</Q>,
          options: opts(O6), optionLabel: label(O6), correct: 0, cols: 2,
          explain: <MathText>{'$180x + 4000 \\leq 11000$ تعطي $x \\leq \\dfrac{7000}{180} \\approx 38{,}9$. عدد التلاميذ عدد طبيعي: 38 ($180 \\times 38 + 4000 = 10840$) ، أمّا 39 فثمنها $11020 > 11000$. والعدد 61 ينسى المبلغ الثابت ($\\dfrac{11000}{180} \\approx 61{,}1$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P2'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🏖️', label: 'أدمجت تعلّماتي', test: (m) => (m.tajnid ?? 0) + (m.tafsir ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 7', title: 'الدالة التآلفية', message: 'ما الذي جمعته في هذه الرحلات؟ جملة مستقيمين تعطي عددين، ناقل يُختار بنقطة تقاطع، صيغة كراء تتغيّر بحسب عدد الساعات، وعدد تلاميذ لا يتجاوز المبلغ المتاح. فكّر في الدرس الذي حلّ كل جزء منها.', verbs: ['أنمذج', 'أقرأ', 'أقارن', 'أفسّر'], masterBadgeLabel: 'الوحدة 7' }} />
  );
}
