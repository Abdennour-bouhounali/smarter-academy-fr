// Oracle du banc « qiraat-wadiyat-ihsaiya » au format BEM (unité 8 « الإحصاء », leçon 4 « ترييض وقراءة وضعيات إحصائية
// وتفسير المؤشرات », banque réécrite le 2026-10-08) — chaque réponse non selfCheck RECALCULÉE ici en rationnels exacts
// (helpers.mjs) à partir des nombres de l'ÉNONCÉ, sans lire le contenu ni packages/core/arithmetic/statistics.js.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// `D` = les DONNÉES des énoncés : tableaux, séries et DIAGRAMMES (objets `statement.figure` complets, `kind: 'chart'`).
// Le script de l'auteur (scratchpad, gen.mjs) IMPORTE `D` pour écrire les feuilles : un diagramme dessiné est donc
// exactement l'objet que l'oracle lit (`bars` / `values` / `parts` / `points`) — aucune valeur recopiée à la main.
// Le script calcule ses clés avec son propre code ; l'oracle les recalcule ci-dessous avec le sien.
//
// Outils :
//   barV(fig, label)       la hauteur d'une barre d'un مخطط بالأعمدة (lue sur le quadrillage)
//   barsV(fig)             toutes les hauteurs ;  pts(fig)  les ordonnées d'un مضلّع ;  hist(fig)  les effectifs d'un مدرّج
//   pieShare(fig, label)   la part d'un secteur (valeur ÷ total) ; pieAngle(fig, label) son angle (360° ou 180° si half)
//   mean / wmean / median / wmedian / range   indicateurs (médiane d'un effectif pair = demi-somme des deux centrales)
//   centresMean(edges, f)  moyenne par les centres des classes ;  rnd(x, k)  arrondi au plus proche à 10^-k
//   pick(flags)            l'unique option vraie (A, B, C) d'une question fermée — lève une erreur sinon
import { R, C, q } from './helpers.mjs';

/* ── Les données des énoncés ─────────────────────────────────────────────────────────────────── */
const bar = (ariaLabel, xTitle, yTitle, y, bars) => ({ kind: 'chart', type: 'bar', ariaLabel, xTitle, yTitle, y, bars: bars.map(([label, value]) => ({ label, value })) });

const EX19 = bar('مخطط بالأعمدة لعدد الأشخاص حسب القنوات: القناتان A و B، القناتان B و D، القناة C، القناة D، القناة E', 'القناة', 'عدد الأشخاص',
  { max: 1400, step: 200, minor: 4 },
  [['القناتان A و B', 950], ['القناتان B و D', 1250], ['القناة C', 350], ['القناة D', 700], ['القناة E', 450]]);
const CARS = bar('مخطط بالأعمدة لعدد السيارات التي مرّت أمام المدرسة في كل ساعة من الصبيحة', 'الفترة', 'عدد السيارات',
  { max: 700, step: 100, minor: 2 },
  [['7h–8h', 450], ['8h–9h', 600], ['9h–10h', 250], ['10h–11h', 200], ['11h–12h', 300]]);

export const D = {
  /** تحدّ ص 91 : [عدد، معدّل] للذكور ثم للإناث. */
  ch: { A: { boys: [15, '10'], girls: [18, '13'] }, B: { boys: [14, '12.5'], girls: [19, '11'] } },
  /** التمرين 14 ص 99 : من جانفي إلى ديسمبر. */
  ex14: { A: [-3, -7, -2, 10, 10, 20, 24, 28, 21, 11, 5, -3], B: [6, 8, 10, 14, 16, 19, 20, 22, 17, 14, 8, 5] },
  /** التمرين 22 ص 101. */
  ex22: { mean: '11.5', median: 11, low: 4, high: 19, after: '11.25' },
  fig: {
    ex19: EX19,
    cars: CARS,
    l1_003: bar('مخطط بالأعمدة لعدد الكتب المستعارة في أكتوبر ونوفمبر وديسمبر وجانفي', 'الشهر', 'عدد الكتب',
      { max: 600, step: 100, minor: 2 }, [['أكتوبر', 450], ['نوفمبر', 300], ['ديسمبر', 550], ['جانفي', 250]]),
    l1_004: bar('مخطط بالأعمدة لعدد أكياس النفايات حسب نوعها: بلاستيك، ورق، علب معدنية، زجاج', 'نوع النفايات', 'عدد الأكياس',
      { max: 12, step: 2, minor: 2 }, [['بلاستيك', 10], ['ورق', 5], ['علب معدنية', 6], ['زجاج', 3]]),
    l1_006: bar('مخطط بالأعمدة لعدد أزواج الأحذية المبيعة حسب المقاس 38 و 40 و 42', 'المقاس', 'عدد الأزواج',
      { max: 6, step: 1 }, [['38', 3], ['40', 5], ['42', 2]]),
    l2_004: bar('مخطط بالأعمدة لعدد التلاميذ حسب عدد الكتب المقروءة في العطلة: من 0 إلى 4 كتب', 'عدد الكتب المقروءة', 'عدد التلاميذ',
      { max: 10, step: 2, minor: 2 }, [['0', 4], ['1', 8], ['2', 10], ['3', 6], ['4', 2]]),
    l2_007: { kind: 'chart', type: 'pie', show: 'percent', ariaLabel: 'مخطط دائري لوجهات المسافرين: الجزائر، قسنطينة، بسكرة، وقطاع سطيف بلا نسبة',
      parts: [{ label: 'الجزائر', value: 140 }, { label: 'قسنطينة', value: 100 }, { label: 'بسكرة', value: 120 }, { label: 'سطيف', value: 40, missing: true }] },
    l3_005: { kind: 'chart', type: 'pie', half: true, show: 'angle', ariaLabel: 'مخطط نصف دائري لمدة المطالعة الأسبوعية بأربع فئات، الزوايا مكتوبة على القطاعات',
      parts: [{ label: '$0 \\le t < 1$', value: 80 }, { label: '$1 \\le t < 2$', value: 100 }, { label: '$2 \\le t < 3$', value: 40 }, { label: '$t \\ge 3$', value: 20 }] },
    l3_008: bar('مخطط بالأعمدة لعدد التذاكر المبيعة في كل يوم من أيام الأسبوع', 'اليوم', 'عدد التذاكر',
      { max: 500, step: 100, minor: 4 },
      [['السبت', 175], ['الأحد', 250], ['الإثنين', 325], ['الثلاثاء', 150], ['الأربعاء', 400], ['الخميس', 475], ['الجمعة', 325]]),
    l3_010: { kind: 'chart', type: 'line', ariaLabel: 'مضلّع التكرارات لعلامات قسم: العلامات 8 و 10 و 12 و 14 و 16 و 18', xTitle: 'العلامة', yTitle: 'عدد التلاميذ',
      x: { min: 8, max: 18, step: 2 }, y: { max: 10, step: 2, minor: 2 }, points: [[8, 3], [10, 6], [12, 9], [14, 7], [16, 4], [18, 1]] },
    l4_004: { kind: 'chart', type: 'pie', show: 'angle', ariaLabel: 'مخطط دائري لتوزيع المساحة المزروعة: قمح، شعير، بطاطا، خضر، الزوايا مكتوبة على القطاعات',
      parts: [{ label: 'قمح', value: 50 }, { label: 'شعير', value: 30 }, { label: 'بطاطا', value: 25 }, { label: 'خضر', value: 15 }] },
    l4_005: bar('مخطط بالأعمدة لهوايات التلاميذ: الرياضة والموسيقى، الموسيقى والرسم، الرسم', 'الهواية', 'عدد التلاميذ',
      { max: 700, step: 100, minor: 2 }, [['الرياضة والموسيقى', 600], ['الموسيقى والرسم', 500], ['الرسم', 150]]),
    l4_006: bar('مخطط بالأعمدة لعدد التلاميذ حسب عدد ساعات استعمال الحاسوب في الأسبوع: 2 و 3 و 4 و 5 و 20 ساعة', 'عدد الساعات في الأسبوع', 'عدد التلاميذ',
      { max: 8, step: 2, minor: 2 }, [['2', 6], ['3', 7], ['4', 4], ['5', 2], ['20', 1]]),
    l4_009: bar('مخطط بالأعمدة لعدد قطع النفايات المجمّعة على الشاطئ: بلاستيك، علب معدنية، زجاج', 'نوع النفايات', 'عدد القطع',
      { max: 250, step: 50, minor: 5 }, [['بلاستيك', 240], ['علب معدنية', 90], ['زجاج', 70]]),
    l5_001: bar('مخطط بالأعمدة لمؤشر تلوث الهواء في حيّ باب الزوار من السبت إلى الجمعة', 'اليوم', 'مؤشر تلوث الهواء',
      { max: 180, step: 20, minor: 2 },
      [['السبت', 80], ['الأحد', 120], ['الإثنين', 150], ['الثلاثاء', 90], ['الأربعاء', 110], ['الخميس', 160], ['الجمعة', 130]]),
    l5_002: { kind: 'chart', type: 'line', ariaLabel: 'مضلّع الطاقة المنتجة يوميا بالألواح الشمسية خلال عشرة أيام', xTitle: 'اليوم', yTitle: 'الطاقة المنتجة (kWh)',
      x: { min: 1, max: 10, step: 1 }, y: { max: 30, step: 10, minor: 5 },
      points: [[1, 22], [2, 24], [3, 18], [4, 26], [5, 28], [6, 12], [7, 20], [8, 24], [9, 26], [10, 20]] },
    l5_003: bar('مخطط بالأعمدة لاستهلاك الإنترنت الشهري لعائلة من جانفي إلى ديسمبر', 'الشهر', 'الاستهلاك (Go)',
      { max: 100, step: 20, minor: 4 },
      [['جانفي', 30], ['فيفري', 25], ['مارس', 35], ['أفريل', 40], ['ماي', 45], ['جوان', 60], ['جويلية', 90], ['أوت', 95], ['سبتمبر', 50], ['أكتوبر', 35], ['نوفمبر', 40], ['ديسمبر', 55]]),
    l5_004: { kind: 'chart', type: 'histogram', ariaLabel: 'مدرّج تكراري لمدة توصيل طلبيات الشركة «السريع» بأربع فئات من 20 إلى 60 دقيقة', xTitle: 'مدة التوصيل (min)', yTitle: 'عدد الطلبيات',
      edges: [20, 30, 40, 50, 60], values: [8, 20, 14, 8], y: { max: 20, step: 4, minor: 2 } },
    l5_005: { kind: 'chart', type: 'line', ariaLabel: 'مضلّع عدد زوار الحظيرة في كل شهر من جانفي (1) إلى ديسمبر (12)', xTitle: 'الشهر', yTitle: 'عدد الزوار',
      x: { min: 1, max: 12, step: 1 }, y: { max: 3500, step: 500, minor: 5 },
      points: [[1, 1800], [2, 2200], [3, 2600], [4, 2000], [5, 800], [6, 400], [7, 200], [8, 200], [9, 600], [10, 1600], [11, 2400], [12, 3200]] },
    l5_006: { kind: 'chart', type: 'pie', half: true, show: 'angle', ariaLabel: 'مخطط نصف دائري لكتلة الورق المجمّعة حسب المستوى، وزاوية قطاع السنة الثالثة غير مكتوبة',
      parts: [{ label: 'السنة الأولى', value: 120 }, { label: 'السنة الثانية', value: 160 }, { label: 'السنة الثالثة', value: 80, missing: true }, { label: 'السنة الرابعة', value: 120 }] },
    l5_007: { kind: 'chart', type: 'histogram', ariaLabel: 'مدرّج تكراري لعدد الخطوات اليومية للأب خلال 30 يوما بخمس فئات من 2000 إلى 12000', xTitle: 'عدد الخطوات في اليوم', yTitle: 'عدد الأيام',
      edges: [2000, 4000, 6000, 8000, 10000, 12000], values: [3, 6, 9, 8, 4], y: { max: 10, step: 2, minor: 2 } },
    l5_008: bar('مخطط بالأعمدة لعدد لاعبي النادي حسب مقاس القميص: S و M و L و XL و XXL', 'المقاس', 'عدد اللاعبين',
      { max: 14, step: 2, minor: 2 }, [['S', 4], ['M', 9], ['L', 12], ['XL', 7], ['XXL', 3]]),
    l5_009: { kind: 'chart', type: 'histogram', ariaLabel: 'مدرّج تكراري لكتلة البرتقال المجنية من كل شجرة في البستان (أ) بأربع فئات من 40 إلى 120 كيلوغراما', xTitle: 'كتلة البرتقال لكل شجرة (kg)', yTitle: 'عدد الأشجار',
      edges: [40, 60, 80, 100, 120], values: [10, 25, 35, 10], y: { max: 40, step: 10, minor: 2 } },
    l5_010: { kind: 'chart', type: 'line', ariaLabel: 'مضلّع نقاط الرامي سليم في ثماني جولات', xTitle: 'الجولة', yTitle: 'النقاط',
      x: { min: 1, max: 8, step: 1 }, y: { max: 50, step: 10, minor: 5 },
      points: [[1, 42], [2, 38], [3, 46], [4, 30], [5, 48], [6, 44], [7, 26], [8, 46]] },
  },
  /** Séries et tableaux des énoncés (dans l'ordre des tableaux). */
  s: {
    l1_005: { amin: [49, 51, 50, 52, 48], samir: [44, 56, 50, 58, 42] },
    l1_007: { g1: [10, 12], g2: [10, 16] },
    l1_008: { g1: [4, 12], g2: [6, 7] },
    beach: [120, 150, 90, 600, 140],
    l2_004: { price1: [120, 400], price2: [80, 650] },
    l2_006: { rim: [3, 2, 5, 4, 6], murad: [1, 2, 2, 9, 1] },
    l2_007ch: { boys: [12, 11], girls: [18, 14] },
    l2_010: { n: 24, mean: '12.5', from: 8, to: 14 },
    l3_006: { yacine: [5, 6, 5, 6, 5], walid: [2, 9, 3, 8, 5] },
    l3_007: { n: 20, mean: 12, wrong: 31, right: 13 },
    l3_009: { groups: [[10, 8], [15, 12], [5, 20]], extra: [6, 6] },
    l4_003: { boys: [18, '10'], girls: [15, '13'], newGirl: '13', target: 12 },
    l4_007: { boys: [10, 9], girlsMean: 14, classMean: 12 },
    l4_008: { days: 9, mean: 32, day10: 52, target: 35 },
    l4_010: { m1: 10, m2: 14, n1: 20, n2: 30, n1b: 30, target: 11 },
    l5_001bk: [100, 110, 105, 115, 120, 110, 110],
    l5_002: { need: 20, price: 5 },
    l5_003: { base: 1500, quota: 50, extra: 40, unlimited: 2200 },
    l5_004b: [2, 30, 16, 2],
    l5_006: { total: 480, price: 15, fee: '0.2' },
    l5_007son: [0, 2, 6, 12, 10],
    l5_008: { small: 1800, large: 2200 },
    l5_009b: [20, 15, 20, 25],
    l5_009: { price: 60 },
    l5_010b: [40, 42, 38, 40, 41, 39, 40, 40],
    l5_010: { dist: 70, time: '0.5' },
  },
};

/* ── Outils ──────────────────────────────────────────────────────────────────────────────────── */
const cmp = (a, b) => { const d = q(a).sub(q(b)); return d.isZero() ? 0 : (d.n < 0n ? -1 : 1); };
const sum = (a) => a.reduce((s, x) => s.add(q(x)), q(0));
const mean = (a) => sum(a).div(a.length);
const expand = (v, f) => v.flatMap((x, i) => Array(Number(f[i])).fill(x));
const wmean = (v, f) => sum(v.map((x, i) => q(x).mul(q(f[i])))).div(sum(f));
function median(a) {
  const s = a.map((x) => q(x)).sort(cmp); const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : s[n / 2 - 1].add(s[n / 2]).div(2);
}
const wmedian = (v, f) => median(expand(v, f));
const range = (a) => { const s = a.map((x) => q(x)).sort(cmp); return s.at(-1).sub(s[0]); };
const centres = (e) => e.slice(0, -1).map((a, i) => q(a).add(q(e[i + 1])).div(2));
const centresMean = (e, f) => wmean(centres(e), f);
function rnd(x, k) {
  const p = q(String(10n ** BigInt(k))); const v = q(x).mul(p);
  let n = v.n / v.d; if (v.sub(q(String(n))).sub(q('1/2')).n >= 0n) n += 1n;
  return q(String(n)).div(p);
}
const gt = (a, b) => cmp(a, b) > 0;
const LET = ['A', 'B', 'C', 'D'];
function pick(flags) {
  const ok = flags.map((x, i) => (x ? LET[i] : null)).filter(Boolean);
  if (ok.length !== 1) throw new Error(`qiraat-wadiyat-ihsaiya oracle : ${ok.length} options vraies`);
  return C(ok[0]);
}

const F = D.fig;
const barV = (fig, label) => { const b = fig.bars.find((x) => x.label === label); if (!b) throw new Error(`barre « ${label} » absente`); return q(b.value); };
const barsV = (fig) => fig.bars.map((b) => b.value);
const pts = (fig) => fig.points.map((p) => p[1]);
const ptAt = (fig, x) => q(fig.points.find((p) => p[0] === x)[1]);
const hist = (fig) => fig.values;
const pieTotal = (fig) => sum(fig.parts.map((p) => p.value));
const pieShare = (fig, label) => q(fig.parts.find((p) => p.label === label).value).div(pieTotal(fig));
const pieAngle = (fig, label) => pieShare(fig, label).mul(fig.half ? 180 : 360);
/** Lecture d'un secteur dont l'angle est écrit : l'effectif = angle ÷ (360 ou 180) × total connu. */
const pieCount = (fig, label, total) => pieAngle(fig, label).div(fig.half ? 180 : 360).mul(q(total));

/** ex-19 : les cinq chaînes retrouvées à partir des barres cumulées. */
const ex19 = () => {
  const Dd = barV(F.ex19, 'القناة D'); const Bb = barV(F.ex19, 'القناتان B و D').sub(Dd); const Aa = barV(F.ex19, 'القناتان A و B').sub(Bb);
  const Cc = barV(F.ex19, 'القناة C'); const Ee = barV(F.ex19, 'القناة E');
  return { A: Aa, B: Bb, C: Cc, D: Dd, E: Ee, N: sum([Aa, Bb, Cc, Dd, Ee]) };
};
const groupSum = (...g) => sum(g.map(([n, m]) => q(n).mul(q(m))));
const groupN = (...g) => sum(g.map(([n]) => n));
const CH = D.ch; const S = D.s; const E14 = D.ex14; const E22 = D.ex22;

// ex-22 a) : pour TOUT effectif N, (11,5N − 4 − 19) ÷ (N − 2) ; vérifié sur plusieurs N — il ne dépend pas de N.
function ex22aMean() {
  const vals = [10, 20, 31, 40].map((N) => q(E22.mean).mul(N).sub(E22.low).sub(E22.high).div(N - 2));
  if (!vals.every((v) => cmp(v, vals[0]) === 0)) throw new Error('ex-22 a) : la moyenne dépend de N');
  return vals[0];
}
// ex-22 b) : 11,5N − 19 = 11,25(N − 1)  ⇔  N = (19 − 11,25) ÷ (11,5 − 11,25)
const ex22N = () => q(E22.high).sub(q(E22.after)).div(q(E22.mean).sub(q(E22.after)));

/* ── Les clés ────────────────────────────────────────────────────────────────────────────────── */
const K = (s) => `ex-4am-qiraat-wadiyat-ihsaiya-${s}`;
const x19 = ex19();
const sumA = groupSum(CH.A.boys, CH.A.girls); const sumB = groupSum(CH.B.boys, CH.B.girls);
const nA = groupN(CH.A.boys, CH.A.girls); const nB = groupN(CH.B.boys, CH.B.girls);
const l1b = { a: range(S.l1_005.amin), s: range(S.l1_005.samir) };
const l2_6 = { r: range(S.l2_006.rim), m: range(S.l2_006.murad) };
const l3_6 = { y: range(S.l3_006.yacine), w: range(S.l3_006.walid) };
const tickets = barsV(F.l3_008);
const pc = F.l3_010.points; const pcV = pc.map((p) => p[0]); const pcF = pc.map((p) => p[1]);
const hrs = F.l4_006.bars; const hrsV = hrs.map((b) => Number(b.label)); const hrsF = hrs.map((b) => b.value);
const hob = { mus: barV(F.l4_005, 'الموسيقى والرسم').sub(barV(F.l4_005, 'الرسم')) };
hob.sport = barV(F.l4_005, 'الرياضة والموسيقى').sub(hob.mus);
hob.N = hob.sport.add(hob.mus).add(barV(F.l4_005, 'الرسم'));
const air = barsV(F.l5_001); const airBK = S.l5_001bk;
const sun = pts(F.l5_002);
const net = barsV(F.l5_003); const netExcess = sum(net.map((v) => (gt(v, S.l5_003.quota) ? q(v).sub(S.l5_003.quota) : q(0))));
const del = { a: hist(F.l5_004), b: S.l5_004b, e: F.l5_004.edges };
const lt40 = (f) => sum(f.slice(0, 2)).div(sum(f)).mul(100);
const vis = pts(F.l5_005); const visMean = mean(vis); const peak = vis.filter((v) => gt(v, visMean));
const steps = { f: hist(F.l5_007), son: S.l5_007son, e: F.l5_007.edges };
const atLeast8000 = (f) => sum(f.slice(3));
const shirts = F.l5_008.bars;
const big = sum(shirts.filter((b) => ['L', 'XL', 'XXL'].includes(b.label)).map((b) => b.value));
const small = sum(shirts.filter((b) => ['S', 'M'].includes(b.label)).map((b) => b.value));
const orA = hist(F.l5_009); const orE = F.l5_009.edges;
const archA = pts(F.l5_010); const archB = S.l5_010b;

export const ORACLE = {
  /* niveau 1 */
  [K('l1-001:q1')]: R(sumB),
  [K('l1-001:q2')]: R(rnd(sumB.div(nB), 2)),
  [K('l1-002:q1')]: R(x19.D),
  [K('l1-002:q2')]: R(x19.B),
  [K('l1-003:q1')]: R(barV(F.l1_003, 'أكتوبر')),
  [K('l1-003:q2')]: R(sum(barsV(F.l1_003))),
  [K('l1-004:q1')]: R(sum(barsV(F.l1_004))),
  [K('l1-004:q2')]: R(barV(F.l1_004, 'علب معدنية').div(sum(barsV(F.l1_004)))),
  [K('l1-005:q1')]: R(l1b.a),
  [K('l1-005:q2')]: R(l1b.s),
  [K('l1-005:q3')]: pick([cmp(l1b.a, l1b.s) < 0 && cmp(mean(S.l1_005.amin), mean(S.l1_005.samir)) === 0, false, false]),
  [K('l1-006:q1')]: R(sum(barsV(F.l1_006))),
  [K('l1-006:q2')]: R(wmean(F.l1_006.bars.map((b) => b.label), barsV(F.l1_006))),
  [K('l1-007:q1')]: R(groupSum(S.l1_007.g1, S.l1_007.g2)),
  [K('l1-007:q2')]: R(groupSum(S.l1_007.g1, S.l1_007.g2).div(groupN(S.l1_007.g1, S.l1_007.g2))),
  [K('l1-008:q1')]: R(groupSum(S.l1_008.g1, S.l1_008.g2)),
  [K('l1-008:q2')]: R(groupSum(S.l1_008.g1, S.l1_008.g2).div(groupN(S.l1_008.g1, S.l1_008.g2))),
  [K('l1-009:q1')]: R(barV(F.cars, '9h–10h')),
  [K('l1-009:q2')]: R(sum(barsV(F.cars))),
  [K('l1-010:q1')]: R(range(S.beach)),
  [K('l1-010:q2')]: R(mean(S.beach)),

  /* niveau 2 */
  [K('l2-001:q1')]: R(mean(E14.A)),
  [K('l2-001:q2')]: R(range(E14.A)),
  [K('l2-002:q1')]: R(median(E14.B)),
  [K('l2-002:q2')]: R(mean(E14.B)),
  [K('l2-003:q1')]: R(x19.A),
  [K('l2-003:q2')]: R(x19.N),
  [K('l2-004:q1')]: R(sum(barsV(F.l2_004))),
  [K('l2-004:q2')]: R(sum(barsV(F.l2_004).slice(2))),
  [K('l2-004:q3')]: R(wmean(F.l2_004.bars.map((b) => b.label), barsV(F.l2_004))),
  [K('l2-005:q1')]: R(x19.D.div(x19.N)),
  [K('l2-005:q2')]: R(x19.B.div(x19.N)),
  [K('l2-006:q1')]: R(mean(S.l2_006.rim)),
  [K('l2-006:q2')]: R(mean(S.l2_006.murad)),
  [K('l2-006:q3')]: R(l2_6.r),
  [K('l2-006:q4')]: R(l2_6.m),
  [K('l2-006:q5')]: pick([false, gt(l2_6.m, l2_6.r), false]),
  [K('l2-007:q1')]: R(pieShare(F.l2_007, 'سطيف').mul(100)),
  [K('l2-007:q2')]: R(pieShare(F.l2_007, 'بسكرة').mul(pieTotal(F.l2_007))),
  [K('l2-007:q3')]: R(pieShare(F.l2_007, 'سطيف').mul(pieTotal(F.l2_007))),
  [K('l2-008:q1')]: R(barV(F.cars, '7h–8h')),
  [K('l2-008:q2')]: R(sum(barsV(F.cars))),
  [K('l2-008:q3')]: R(barV(F.cars, '7h–8h').div(sum(barsV(F.cars))).mul(100)),
  [K('l2-009:q1')]: R(median(S.beach)),
  [K('l2-009:q2')]: pick([cmp(median(S.beach), mean(S.beach)) < 0, false]),
  [K('l2-010:q1')]: R(q(S.l2_010.mean).mul(S.l2_010.n)),
  [K('l2-010:q2')]: R(q(S.l2_010.mean).mul(S.l2_010.n).add(S.l2_010.to - S.l2_010.from).div(S.l2_010.n)),

  /* niveau 3 */
  [K('l3-001:q1')]: R(range(E14.A)),
  [K('l3-001:q2')]: R(range(E14.B)),
  [K('l3-001:q3')]: R(median(E14.A)),
  [K('l3-001:q4')]: R(median(E14.B)),
  [K('l3-001:q5')]: pick([false, gt(range(E14.A), range(E14.B)) && gt(median(E14.B), median(E14.A)), false]),
  [K('l3-002:q1')]: R(x19.A),
  [K('l3-002:q2')]: R(x19.B),
  [K('l3-002:q3')]: R(x19.C),
  [K('l3-002:q4')]: R(x19.D),
  [K('l3-002:q5')]: R(x19.E),
  [K('l3-002:q6')]: R(x19.N),
  [K('l3-002:q7')]: R(x19.A.add(x19.B).add(x19.C).div(x19.N)),
  [K('l3-003:q1')]: R(ex22aMean()),
  [K('l3-003:q2')]: R(q(E22.median)),
  [K('l3-004:q1')]: R(sumA.div(nA)),
  [K('l3-004:q2')]: R(sumB.div(nB)),
  [K('l3-004:q3')]: pick([false, false, cmp(sumA.div(nA), sumB.div(nB)) === 0]),
  [K('l3-005:q1')]: R(pieCount(F.l3_005, '$0 \\le t < 1$', 240)),
  [K('l3-005:q2')]: R(pieCount(F.l3_005, '$t \\ge 3$', 240)),
  [K('l3-005:q3')]: R(pieShare(F.l3_005, '$2 \\le t < 3$').add(pieShare(F.l3_005, '$t \\ge 3$'))),
  [K('l3-006:q1')]: R(mean(S.l3_006.yacine)),
  [K('l3-006:q2')]: R(mean(S.l3_006.walid)),
  [K('l3-006:q3')]: R(l3_6.y),
  [K('l3-006:q4')]: R(l3_6.w),
  [K('l3-006:q5')]: pick([false, false, cmp(l3_6.y, l3_6.w) < 0 && cmp(mean(S.l3_006.yacine), mean(S.l3_006.walid)) === 0]),
  [K('l3-007:q1')]: R(q(S.l3_007.mean).mul(S.l3_007.n)),
  [K('l3-007:q2')]: R(q(S.l3_007.mean).mul(S.l3_007.n).sub(S.l3_007.wrong).div(S.l3_007.n - 1)),
  [K('l3-007:q3')]: R(q(S.l3_007.mean).mul(S.l3_007.n).sub(S.l3_007.wrong).add(S.l3_007.right).div(S.l3_007.n)),
  [K('l3-008:q1')]: R(barV(F.l3_008, 'الخميس')),
  [K('l3-008:q2')]: R(mean(tickets)),
  [K('l3-008:q3')]: R(median(tickets)),
  [K('l3-009:q1')]: R(groupSum(...S.l3_009.groups)),
  [K('l3-009:q2')]: R(groupSum(...S.l3_009.groups).div(groupN(...S.l3_009.groups))),
  [K('l3-009:q3')]: R(groupSum(...S.l3_009.groups, S.l3_009.extra).div(groupN(...S.l3_009.groups, S.l3_009.extra))),
  [K('l3-010:q1')]: R(ptAt(F.l3_010, 14)),
  [K('l3-010:q2')]: R(sum(pcF)),
  [K('l3-010:q3')]: R(wmean(pcV, pcF)),
  [K('l3-010:q4')]: R(wmedian(pcV, pcF)),

  /* niveau 4 */
  [K('l4-001:q2')]: R(ex22N()),
  [K('l4-001:q3')]: R(q(E22.after).mul(ex22N().sub(1))),
  [K('l4-002:q1')]: R(mean(E14.A)),
  [K('l4-002:q2')]: R(mean(E14.B)),
  [K('l4-002:q3')]: R(mean(E14.B).sub(mean(E14.A))),
  [K('l4-002:q4')]: R(range(E14.A)),
  [K('l4-002:q5')]: R(range(E14.B)),
  [K('l4-002:q6')]: pick([false, gt(mean(E14.B), mean(E14.A)) && gt(range(E14.A), range(E14.B)), false]),
  [K('l4-003:q1')]: R(groupSum(S.l4_003.boys, S.l4_003.girls)),
  [K('l4-003:q2')]: R(rnd(groupSum(S.l4_003.boys, S.l4_003.girls).div(groupN(S.l4_003.boys, S.l4_003.girls)), 2)),
  // (384 + 13x) ÷ (33 + x) = 12  ⇔  x = (12 × 33 − 384) ÷ (13 − 12) — le قسم (أ) du manuel
  [K('l4-003:q3')]: R(q(S.l4_003.target).mul(nA).sub(sumA).div(q(S.l4_003.newGirl).sub(S.l4_003.target))),
  [K('l4-004:q1')]: R(pieCount(F.l4_004, 'قمح', 120)),
  [K('l4-004:q2')]: R(pieCount(F.l4_004, 'بطاطا', 120)),
  [K('l4-004:q3')]: R(pieShare(F.l4_004, 'شعير')),
  [K('l4-004:q4')]: R(pieCount(F.l4_004, 'بطاطا', 120).mul(300)),
  [K('l4-005:q1')]: R(hob.mus),
  [K('l4-005:q2')]: R(hob.sport),
  [K('l4-005:q3')]: R(hob.N),
  [K('l4-005:q4')]: R(barV(F.l4_005, 'الرسم').div(hob.N)),
  [K('l4-006:q1')]: R(wmean(hrsV, hrsF)),
  [K('l4-006:q2')]: R(wmedian(hrsV, hrsF)),
  [K('l4-006:q3')]: pick([false, cmp(wmedian(hrsV, hrsF), wmean(hrsV, hrsF)) < 0]),
  [K('l4-007:q1')]: R(q(S.l4_007.boys[0]).mul(S.l4_007.boys[1])),
  // 90 + 14x = 12(10 + x)  ⇔  x = (12 × 10 − 90) ÷ (14 − 12)
  [K('l4-007:q3')]: R(q(S.l4_007.classMean).mul(S.l4_007.boys[0]).sub(q(S.l4_007.boys[0]).mul(S.l4_007.boys[1])).div(S.l4_007.girlsMean - S.l4_007.classMean)),
  [K('l4-008:q1')]: R(q(S.l4_008.days).mul(S.l4_008.mean)),
  [K('l4-008:q2')]: R(q(S.l4_008.days).mul(S.l4_008.mean).add(S.l4_008.day10).div(S.l4_008.days + 1)),
  [K('l4-008:q3')]: R(q(S.l4_008.target).mul(S.l4_008.days + 2).sub(q(S.l4_008.days).mul(S.l4_008.mean).add(S.l4_008.day10))),
  [K('l4-009:q1')]: R(sum(barsV(F.l4_009))),
  [K('l4-009:q2')]: R(barV(F.l4_009, 'بلاستيك').div(sum(barsV(F.l4_009))).mul(100)),
  [K('l4-009:q3')]: R(barV(F.l4_009, 'بلاستيك').div(sum(barsV(F.l4_009))).mul(360)),
  [K('l4-010:q1')]: R(groupSum([S.l4_010.n1, S.l4_010.m1], [S.l4_010.n2, S.l4_010.m2]).div(S.l4_010.n1 + S.l4_010.n2)),
  // (30 × 10 + 14y) ÷ (30 + y) = 11  ⇔  y = 30 × (11 − 10) ÷ (14 − 11)
  [K('l4-010:q3')]: R(q(S.l4_010.n1b).mul(S.l4_010.target - S.l4_010.m1).div(S.l4_010.m2 - S.l4_010.target)),

  /* niveau 5 */
  [K('l5-001:q1')]: R(barV(F.l5_001, 'الخميس')),
  [K('l5-001:q2')]: R(mean(air)),
  [K('l5-001:q3')]: R(mean(airBK)),
  [K('l5-001:q4')]: R(range(air)),
  [K('l5-001:q5')]: R(range(airBK)),
  [K('l5-001:q6')]: pick([false, false, cmp(mean(airBK), mean(air)) < 0 && cmp(range(airBK), range(air)) < 0]),
  [K('l5-001:q7')]: R(air.filter((v) => gt(v, 140)).length),
  [K('l5-002:q1')]: R(ptAt(F.l5_002, 6)),
  [K('l5-002:q2')]: R(F.l5_002.points.reduce((b, p) => (p[1] > b[1] ? p : b))[0]),
  [K('l5-002:q3')]: R(mean(sun)),
  [K('l5-002:q4')]: R(median(sun)),
  [K('l5-002:q5')]: R(sun.filter((v) => cmp(v, S.l5_002.need) >= 0).length),
  [K('l5-002:q6')]: R(sum(sun.map((v) => (gt(v, S.l5_002.need) ? q(v).sub(S.l5_002.need) : q(0)))).mul(S.l5_002.price)),
  [K('l5-003:q1')]: R(barV(F.l5_003, 'أوت')),
  [K('l5-003:q2')]: R(mean(net)),
  [K('l5-003:q3')]: R(median(net)),
  [K('l5-003:q4')]: pick([cmp(median(net), mean(net)) < 0, false]),
  [K('l5-003:q5')]: R(netExcess),
  [K('l5-003:q6')]: R(q(S.l5_003.base).mul(12).add(netExcess.mul(S.l5_003.extra))),
  [K('l5-004:q1')]: R(q(del.a[1])),
  [K('l5-004:q2')]: R(sum(del.a)),
  [K('l5-004:q3')]: R(centresMean(del.e, del.a)),
  [K('l5-004:q4')]: R(centresMean(del.e, del.b)),
  [K('l5-004:q5')]: R(lt40(del.a)),
  [K('l5-004:q6')]: R(lt40(del.b)),
  [K('l5-004:q7')]: pick([false, gt(lt40(del.b), lt40(del.a)) && cmp(centresMean(del.e, del.b), centresMean(del.e, del.a)) < 0]),
  [K('l5-005:q1')]: R(ptAt(F.l5_005, 12)),
  [K('l5-005:q2')]: R(range(vis)),
  [K('l5-005:q3')]: R(visMean),
  [K('l5-005:q4')]: R(median(vis)),
  [K('l5-005:q5')]: R(peak.length),
  [K('l5-005:q6')]: R(rnd(sum(peak).div(sum(vis)).mul(100), 0)),
  [K('l5-006:q1')]: R(pieAngle(F.l5_006, 'السنة الثالثة')),
  [K('l5-006:q2')]: R(pieAngle(F.l5_006, 'السنة الثانية').div(180).mul(S.l5_006.total)),
  [K('l5-006:q3')]: R(pieAngle(F.l5_006, 'السنة الثالثة').div(180).mul(S.l5_006.total)),
  [K('l5-006:q4')]: R(q(S.l5_006.total).mul(S.l5_006.price).mul(q(1).sub(q(S.l5_006.fee)))),
  [K('l5-007:q1')]: R(q(steps.f[2])),
  [K('l5-007:q2')]: R(atLeast8000(steps.f)),
  [K('l5-007:q3')]: R(rnd(centresMean(steps.e, steps.f), 0)),
  [K('l5-007:q4')]: R(centresMean(steps.e, steps.son)),
  [K('l5-007:q5')]: R(atLeast8000(steps.son)),
  [K('l5-007:q6')]: pick([gt(centresMean(steps.e, steps.son), centresMean(steps.e, steps.f)) && gt(atLeast8000(steps.son), atLeast8000(steps.f)), false]),
  [K('l5-008:q1')]: R(sum(barsV(F.l5_008))),
  [K('l5-008:q2')]: R(barV(F.l5_008, 'M').div(sum(barsV(F.l5_008)))),
  [K('l5-008:q3')]: R(big),
  [K('l5-008:q4')]: R(small.mul(S.l5_008.small).add(big.mul(S.l5_008.large))),
  [K('l5-009:q1')]: R(sum(orA)),
  [K('l5-009:q2')]: R(q(orA[2])),
  [K('l5-009:q3')]: R(centresMean(orE, orA)),
  [K('l5-009:q4')]: R(centresMean(orE, S.l5_009b)),
  [K('l5-009:q6')]: R(sum(centres(orE).map((c, i) => c.mul(orA[i] + S.l5_009b[i]))).mul(S.l5_009.price)),
  [K('l5-010:q1')]: R(ptAt(F.l5_010, 7)),
  [K('l5-010:q2')]: R(mean(archA)),
  [K('l5-010:q3')]: R(mean(archB)),
  [K('l5-010:q4')]: R(range(archA)),
  [K('l5-010:q5')]: R(range(archB)),
  [K('l5-010:q6')]: pick([false, cmp(mean(archA), mean(archB)) === 0 && cmp(range(archB), range(archA)) < 0, false]),
  [K('l5-010:q7')]: R(q(S.l5_010.dist).div(q(S.l5_010.time)).mul(36).div(10)),
};
