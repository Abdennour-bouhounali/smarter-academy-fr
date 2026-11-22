// Oracle du banc « wadiya-idmajiya-ihsa » au format BEM (unité 8 « الإحصاء », SYNTHÈSE « الوضعية الإدماجية »,
// banque réécrite le 2026-10-08) — chaque réponse non selfCheck RECALCULÉE ici en rationnels exacts (helpers.mjs) à
// partir des nombres de l'ÉNONCÉ, sans lire le contenu ni packages/core/arithmetic/statistics.js.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// `D` = les DONNÉES des énoncés : tableaux, séries, grille de tableur et DIAGRAMMES (objets `statement.figure` complets,
// `kind: 'chart'`). Le script de l'auteur (scratchpad, gen.mjs) IMPORTE `D` pour écrire les feuilles : un diagramme
// dessiné est exactement l'objet que l'oracle lit (`bars` / `values` / `parts` / `points`) — aucune valeur recopiée à
// la main. Le script calcule ses clés avec son propre code ; l'oracle les recalcule ci-dessous avec le sien.
//
// Outils :
//   barV(fig, label) / barsV(fig)    hauteurs d'un مخطط بالأعمدة (lues sur le quadrillage) ; hist(fig) effectifs d'un مدرّج
//   pts(fig) / ptAt(fig, x)          ordonnées d'un مضلّع ;  pieAngle(fig, label)  angle d'un secteur (360°)
//   mean / wmean / median / wmedian / range   indicateurs (médiane d'un effectif pair = demi-somme des deux centrales)
//   cumUp / cumDown                  effectifs cumulés « على الأكثر » (v ≤ t) / « على الأقل » (v ≥ t)
//   centresMean(edges, f)            moyenne par les centres des classes
//   hiddenByMedian(...)              l'UNIQUE entier d'un intervalle qui donne la médiane imposée (cherché pas à pas)
//   pick(flags)                      l'unique option vraie (A, B, C…) d'une question fermée — lève une erreur sinon
import { R, C, q } from './helpers.mjs';

/* ── Les données des énoncés ─────────────────────────────────────────────────────────────────── */
const bar = (ariaLabel, xTitle, yTitle, y, bars) => ({
  kind: 'chart', type: 'bar', ariaLabel, xTitle, yTitle, y,
  bars: bars.map(([label, value]) => (value === null ? { label, missing: true } : { label, value })),
});

export const D = {
  fig: {
    l1_009: bar('مخطط بالأعمدة لعدد التلاميذ حسب عدد حصص الرياضة في الأسبوع: من 0 إلى 4 حصص', 'عدد الحصص في الأسبوع', 'عدد التلاميذ',
      { max: 16, step: 2, minor: 2 }, [['0', 4], ['1', 10], ['2', 14], ['3', 8], ['4', 4]]),
    l2_007: bar('مخطط بالأعمدة لعدد المتسابقين حسب عدد الإجابات الصحيحة في مسابقة ثقافية: من 0 إلى 5', 'عدد الإجابات الصحيحة', 'عدد المتسابقين',
      { max: 10, step: 2, minor: 2 }, [['0', 1], ['1', 3], ['2', 6], ['3', 9], ['4', 7], ['5', 4]]),
    l3_004: { kind: 'chart', type: 'pie', show: 'angle', ariaLabel: 'مخطط دائري للمادة المفضّلة عند تلاميذ السنة الرابعة: الرياضيات، العلوم، اللغة العربية، الإنجليزية، الزوايا مكتوبة على القطاعات',
      parts: [{ label: 'الرياضيات', value: 24 }, { label: 'العلوم', value: 18 }, { label: 'اللغة العربية', value: 12 }, { label: 'الإنجليزية', value: 18 }] },
    l3_009: { kind: 'chart', type: 'histogram', ariaLabel: 'مدرّج تكراري لمدة التنقل إلى المتوسطة لعشرة تلاميذ بثلاث فئات من 0 إلى 30 دقيقة', xTitle: 'مدة التنقل (min)', yTitle: 'عدد التلاميذ',
      edges: [0, 10, 20, 30], values: [2, 5, 3], y: { max: 6, step: 1 } },
    l3_010: bar('مخطط بالأعمدة لعدد التلاميذ حسب عدد الوجبات السريعة في الأسبوع: من 0 إلى 4', 'عدد الوجبات السريعة في الأسبوع', 'عدد التلاميذ',
      { max: 10, step: 2, minor: 2 }, [['0', 3], ['1', 7], ['2', 8], ['3', 5], ['4', 2]]),
    l4_005: { kind: 'chart', type: 'histogram', ariaLabel: 'مدرّج تكراري لأطوال 40 شتلة بأربع فئات من 20 إلى 60 سنتيمترا، مستطيل الفئة الثالثة غير مرسوم', xTitle: 'طول الشتلة (cm)', yTitle: 'عدد الشتلات',
      edges: [20, 30, 40, 50, 60], values: [6, 14, null, 8], missing: [2], y: { max: 16, step: 4, minor: 2 } },
    l4_009: bar('مخطط بالأعمدة لأعمار 40 متسابقا: 13 و 14 و 15 و 16 سنة', 'العمر (سنة)', 'عدد المتسابقين',
      { max: 16, step: 2 }, [['13', 10], ['14', 14], ['15', 10], ['16', 6]]),
    l5_001: { kind: 'chart', type: 'histogram', ariaLabel: 'مدرّج تكراري لسرعات 80 مركبة أمام متوسطة بخمس فئات من 30 إلى 80 كيلومترا في الساعة', xTitle: 'السرعة (km/h)', yTitle: 'عدد المركبات',
      edges: [30, 40, 50, 60, 70, 80], values: [8, 28, 24, 14, 6], y: { max: 30, step: 10, minor: 5 } },
    l5_002: bar('مخطط بالأعمدة لعدد أيام شهر جوان حسب عدد التدخلات اليومية: من 2 إلى 7 تدخلات', 'عدد التدخلات في اليوم', 'عدد الأيام',
      { max: 10, step: 2, minor: 2 }, [['2', 2], ['3', 5], ['4', 9], ['5', 7], ['6', 4], ['7', 3]]),
    l5_003: bar('مخطط بالأعمدة لكتلة الفراولة التي جناها كريم في كل يوم من السبت إلى الخميس', 'اليوم', 'الكتلة (kg)',
      { max: 60, step: 10, minor: 5 }, [['السبت', 30], ['الأحد', 58], ['الإثنين', 40], ['الثلاثاء', 56], ['الأربعاء', 50], ['الخميس', 42]]),
    l5_004: { kind: 'chart', type: 'histogram', ariaLabel: 'مدرّج تكراري لعلامات 40 تلميذا في الامتحان التجريبي بأربع فئات من 0 إلى 20', xTitle: 'العلامة', yTitle: 'عدد التلاميذ',
      edges: [0, 5, 10, 15, 20], values: [4, 12, 16, 8], y: { max: 16, step: 4, minor: 2 } },
    l5_005: { kind: 'chart', type: 'line', ariaLabel: 'مضلّع عدد ركّاب الترامواي في كل يوم من السبت (1) إلى الجمعة (7)', xTitle: 'اليوم', yTitle: 'عدد الركّاب',
      caption: '1: السبت ، 2: الأحد ، 3: الإثنين ، 4: الثلاثاء ، 5: الأربعاء ، 6: الخميس ، 7: الجمعة',
      x: { min: 1, max: 7, step: 1 }, y: { max: 7000, step: 1000, minor: 5 },
      points: [[1, 4200], [2, 5600], [3, 6000], [4, 5800], [5, 5400], [6, 6200], [7, 1800]] },
    l5_006: bar('مخطط بالأعمدة لعدد اللاعبين حسب عدد الرميات الحرة الناجحة من 10: من 4 إلى 9، وعمود القيمة 6 غير مرسوم', 'عدد الرميات الناجحة', 'عدد اللاعبين',
      { max: 6, step: 1 }, [['4', 2], ['5', 3], ['6', null], ['7', 5], ['8', 4], ['9', 2]]),
    l5_007: bar('مخطط بالأعمدة لعدد هواتف العلامة «ب» حسب مدة اشتغال البطارية: 18 و 20 و 22 و 24 ساعة', 'مدة اشتغال البطارية (h)', 'عدد الهواتف',
      { max: 8, step: 2, minor: 2 }, [['18', 6], ['20', 4], ['22', 2], ['24', 8]]),
    l5_008: { kind: 'chart', type: 'pie', show: 'angle', ariaLabel: 'مخطط دائري للكتب المبيعة حسب نوعها: روايات، كتب علمية، قصص الأطفال، وقطاع القواميس بلا زاوية',
      parts: [{ label: 'روايات', value: 126 }, { label: 'كتب علمية', value: 90 }, { label: 'قصص الأطفال', value: 108 }, { label: 'قواميس', value: 36, missing: true }] },
    l5_009: { kind: 'chart', type: 'histogram', ariaLabel: 'مدرّج تكراري لقامات 50 مترشحا بخمس فئات من 150 إلى 175 سنتيمترا', xTitle: 'القامة (cm)', yTitle: 'عدد المترشحين',
      edges: [150, 155, 160, 165, 170, 175], values: [5, 12, 18, 10, 5], y: { max: 20, step: 5, minor: 5 } },
    l5_010: { kind: 'chart', type: 'line', ariaLabel: 'مضلّع درجة الحرارة داخل البيت البلاستيكي كل ساعة من 8h إلى 18h', xTitle: 'الساعة (h)', yTitle: 'درجة الحرارة (°C)',
      x: { min: 8, max: 18, step: 1 }, y: { max: 40, step: 10, minor: 5 },
      points: [[8, 18], [9, 20], [10, 24], [11, 28], [12, 32], [13, 34], [14, 36], [15, 34], [16, 30], [17, 26], [18, 26]] },
  },
  /** Séries et tableaux des énoncés. `null` = la case inconnue de l'énoncé. */
  s: {
    qcm1: { v: [7, 9, 14, 28], f: [6, 10, 3, 1] },
    qcm2: { v: [10, 20, 30, 40], f: [50, 60, 70, 80] },
    qcm3: [8, 20, 40, 60],
    qcm4: ['8.1', '5.7', 3, '2.8'],
    qcm5: { N: 97, N2: 98 },
    qcm6: [13, 1, 4, 10, 12],
    /** أدمج تعلّماتي ص 100 : x entre 2 et 4, y entre 26 et 32 ; médiane 3, moyenne 7 ; 69 % des pays médaillés. */
    medals: { v: [1, 2, null, 4, 5, 6, 7, 11, 13, 14, 16, 26, null, 32], f: [11, 3, 2, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1, 1],
      x: [2, 4], y: [26, 32], median: 3, mean: 7, pct: 69 },
    /** التمرين 20 ص 101 (médiane corrigée 6 → 6,5). */
    ex20: { v: [4, 5, 8, 12], f: [3, null, null, 4], N: 10, median: '6.5' },
    l1_005: { v: [2, 3, 4, 5], f: [3, 4, 2, 1] },
    l1_006: [3, 5, 2, 8, 7],
    l1_007: { v: [38, 39, 40, 41, 42], f: [2, 5, 8, 4, 1] },
    l1_008: { v: [0, 1, 2, 3], f: [4, 6, 3, 2] },
    l1_010: [12, 15, 9, 14],
    l2_004: { v: [1, 2, 3], f: [4, 3, 3] },
    l2_005: { v: [1, 2, 3, 4, 5], f: [3, 6, 7, 4, 5] },
    l2_006: [152, 147, 160, 155, 149, 158, 151],
    l2_008: { known: [12, 15, 9], mean: 12 },
    l2_009: { A: [18, 20, 22, 21, 19, 20, 20], B: [14, 25, 17, 28, 20, 16, 20] },
    l2_010: { v: [12, 15, 20, 30], f: [5, 9, 2, 1] },
    l3_002: { v: [0, 1, 2, 3, null], f: [3, 5, 4, 2, 1], mean: '1.6' },
    l3_003: { v: [10, 12, 14, 16], f: [3, 4, 5, 4] },
    l3_004: { N: 72 },
    l3_005: { A: [14, 15, 15, 16, 15], B: [8, 12, 15, 18, 22] },
    l3_006: { v: [6, 8, 10, 12, 14], f: [2, 5, 6, 4, 3] },
    l3_007: { w: [30000, 32000, 35000, 38000, 40000], newMax: 90000 },
    l3_008: { v: [1, 2, 3, 4], f: [4, null, 6, 5], N: 20 },
    l4_002: { pctRound: 0 },
    l4_004: { v: [1, 2, null, 6, 8, null, 15], f: [2, 3, 4, 2, 2, 1, 1], x: [2, 6], y: [8, 15], median: 4, mean: '5.4' },
    l4_005: { N: 40, price: 150, sold: 40 },
    l4_006: { v: [8, 10, 12, 14, 16], f: [3, 4, 6, 5, 2] },
    l4_007: { n: 24, mean: 11, grade: 16, target: '11.4' },
    l4_008: { v: [6, 10, 14], f: [3, null, 1], mean: 9 },
    l4_010: { row: [62, 75, 58, 81, 70, 66, 79, 69], newMean: 71,
      /** Les formules proposées pour A2 : [signe =, fonction, début, fin] (gen.mjs les écrit ⁦=MOYENNE(A1:H1)⁩). */
      options: [[true, 'MOYENNE', 'A1', 'G1'], [false, 'MOYENNE', 'A1', 'H1'], [true, 'MEDIANE', 'A1', 'H1'], [true, 'MOYENNE', 'A1', 'H1']] },
    l5_001: { limit: 50 },
    l5_002: { meanLimit: 4, atLeast: 5, days: 30, fuel: 1800 },
    l5_003: { ali: [42, 48, 45, 50, 47, 44], price: 50, fee: 20 },
    l5_004: { cut: 10, rule: 35 },
    l5_005: { ticket: 40, tax: 20 },
    l5_006: { N: 20 },
    l5_007: { a: { v: [18, 20, 22, 24], f: [2, 6, 8, 4] }, price: 32000, discount: 15 },
    l5_008: { total: 360, daily: [48, 52, 60, 70, 64, 66], novel: 900 },
    l5_009: { from: 165, jersey: 2400 },
    l5_010: { hot: 30, day2: [16, 18, 22, 26, 30, null, 34, 32, 28, 24, 20], hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], mean2: 26 },
  },
};

/* ── Outils ──────────────────────────────────────────────────────────────────────────────────── */
const cmp = (a, b) => { const d = q(a).sub(q(b)); return d.isZero() ? 0 : (d.n < 0n ? -1 : 1); };
const sum = (a) => a.reduce((s, x) => s.add(q(x)), q(0));
const mean = (a) => sum(a).div(a.length);
const expand = (v, f) => v.flatMap((x, i) => Array(Number(f[i])).fill(x));
const wsum = (v, f) => sum(v.map((x, i) => q(x).mul(q(f[i]))));
const wmean = (v, f) => wsum(v, f).div(sum(f));
function median(a) {
  const s = a.map((x) => q(x)).sort(cmp); const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : s[n / 2 - 1].add(s[n / 2]).div(2);
}
const wmedian = (v, f) => median(expand(v, f));
const range = (a) => { const s = a.map((x) => q(x)).sort(cmp); return s.at(-1).sub(s[0]); };
const cumUp = (v, f, t) => sum(v.map((x, i) => (cmp(x, t) <= 0 ? f[i] : 0)));
const cumDown = (v, f, t) => sum(v.map((x, i) => (cmp(x, t) >= 0 ? f[i] : 0)));
const centres = (e) => e.slice(0, -1).map((a, i) => q(a).add(q(e[i + 1])).div(2));
const centresMean = (e, f) => wmean(centres(e), f);
const pct = (part, whole) => q(part).mul(100).div(q(whole));
const gt = (a, b) => cmp(a, b) > 0;
const LET = ['A', 'B', 'C', 'D'];
function pick(flags) {
  const ok = flags.map((x, i) => (x ? LET[i] : null)).filter(Boolean);
  if (ok.length !== 1) throw new Error(`wadiya-idmajiya-ihsa oracle : ${ok.length} options vraies`);
  return C(ok[0]);
}
/** L'UNIQUE entier de ]lo ; hi[ qui, posé à l'indice idx, donne la médiane `med` — quelle que soit l'AUTRE valeur
 *  cachée (indice j, entier de ]a ; b[) : on les essaie toutes, la réponse doit être la même pour chacune. */
function hiddenByMedian(v, f, idx, [lo, hi], med, other = null) {
  const fills = other ? Array.from({ length: other.b - other.a - 1 }, (_, k) => other.a + 1 + k) : [null];
  const found = new Set();
  for (const y of fills) {
    const ok = [];
    for (let x = lo + 1; x < hi; x += 1) {
      const w = v.slice(); w[idx] = x; if (other) w[other.j] = y;
      if (cmp(wmedian(w, f), med) === 0) ok.push(x);
    }
    if (ok.length !== 1) throw new Error(`oracle : ${ok.length} valeurs cachées pour la médiane ${med}`);
    found.add(ok[0]);
  }
  if (found.size !== 1) throw new Error('oracle : la valeur cachée dépend de l\'autre');
  return q([...found][0]);
}
/** La valeur cachée d'indice idx quand toutes les autres sont connues : (m × N − Σ des autres) ÷ son effectif. */
function hiddenByMean(v, f, idx, m) {
  const others = v.map((x, i) => (i === idx ? 0 : x));
  return q(m).mul(sum(f)).sub(wsum(others, f)).div(q(f[idx]));
}
/** Un effectif inconnu (indice idx) cherché pas à pas : l'unique entier ≥ 0 tel que la moyenne vaille m. */
function freqByMean(v, f, idx, m) {
  const ok = [];
  for (let a = 0; a <= 200; a += 1) { const g = f.slice(); g[idx] = a; if (cmp(wmean(v, g), m) === 0) ok.push(a); }
  if (ok.length !== 1) throw new Error('oracle : effectif non unique');
  return q(ok[0]);
}
/** Le nombre entier le plus proche (demi vers le haut). */
function round0(x) { const v = q(x); let n = v.n / v.d; if (v.sub(q(String(n))).sub(q('1/2')).n >= 0n) n += 1n; return q(String(n)); }

const F = D.fig; const S = D.s;
const barsV = (fig) => fig.bars.map((b) => b.value);
const barLabels = (fig) => fig.bars.map((b) => Number(b.label));
const pts = (fig) => fig.points.map((p) => p[1]);
const ptAt = (fig, x) => q(fig.points.find((p) => p[0] === x)[1]);
const hist = (fig) => fig.values;
const pieAngleOfMissing = (fig) => q(360).sub(sum(fig.parts.filter((p) => !p.missing).map((p) => q(p.value).mul(360).div(sum(fig.parts.map((r) => r.value))))));
const pieAngle = (fig, label) => { const t = sum(fig.parts.map((p) => p.value)); return q(fig.parts.find((p) => p.label === label).value).mul(360).div(t); };
/** Effectif lu sur un secteur dont l'angle est écrit : angle ÷ 360 × N. */
const pieCount = (fig, label, N) => pieAngle(fig, label).div(360).mul(q(N));

/* ── Les calculs propres à chaque situation ─────────────────────────────────────────────────── */
const K = (s) => `ex-4am-wadiya-idmajiya-ihsa-${s}`;
const M = S.medals;
const medX = hiddenByMedian(M.v, M.f, 2, M.x, M.median, { j: 12, a: M.y[0], b: M.y[1] });
const medVis = sum(M.v.map((x, i) => (x === null ? 0 : q(x).mul(M.f[i]))));
const medY = q(M.mean).mul(sum(M.f)).sub(medVis).sub(medX.mul(M.f[2])).div(M.f[12]);
const medN = sum(M.f);
const medWithGold = medN; // les 30 pays du tableau ont au moins une médaille d'or
const medAll = round0(medWithGold.mul(100).div(M.pct));
// ex-20 : a + b = N − 3 − 4 ; le couple (a, b) UNIQUE qui donne la médiane 6,5
function ex20() {
  const s = q(S.ex20.N).sub(S.ex20.f[0]).sub(S.ex20.f[3]); const ok = [];
  for (let a = 0; a <= Number(s.n); a += 1) {
    const f = [S.ex20.f[0], a, Number(s.n) - a, S.ex20.f[3]];
    if (cmp(wmedian(S.ex20.v, f), S.ex20.median) === 0) ok.push(f);
  }
  if (ok.length !== 1) throw new Error('ex-20 : couple non unique');
  return { s, f: ok[0] };
}
const E20 = ex20();
// l4-004 : la médiane donne x, puis la moyenne donne y
const L44 = S.l4_004;
const l44x = hiddenByMedian(L44.v, L44.f, 2, L44.x, L44.median, { j: 5, a: L44.y[0], b: L44.y[1] });
const l44y = hiddenByMean(L44.v.map((t, i) => (i === 2 ? Number(l44x.n) : t ?? 0)), L44.f, 5, L44.mean);
// l3-002 : la valeur cachée par la moyenne
const L32v = S.l3_002.v.map((t) => t ?? 0);
const l32x = hiddenByMean(L32v, S.l3_002.f, 4, S.l3_002.mean);
const l32full = S.l3_002.v.map((t) => t ?? Number(l32x.n));
// l3-008 / l4-008 : l'effectif inconnu
const l38a = q(S.l3_008.N).sub(sum(S.l3_008.f.map((t) => t ?? 0)));
const l38f = S.l3_008.f.map((t) => t ?? Number(l38a.n));
const l48a = freqByMean(S.l4_008.v, S.l4_008.f.map((t) => t ?? 0), 1, S.l4_008.mean);
const l48f = S.l4_008.f.map((t) => t ?? Number(l48a.n));
// l4-005 : la classe manquante par l'effectif total
const l45f = hist(F.l4_005).map((t) => t ?? 0);
const l45miss = q(S.l4_005.N).sub(sum(l45f));
const l45full = hist(F.l4_005).map((t) => t ?? Number(l45miss.n));
// l5-006 : la barre manquante par l'effectif total
const l56v = barLabels(F.l5_006);
const l56miss = q(S.l5_006.N).sub(sum(F.l5_006.bars.map((b) => b.value ?? 0)));
const l56f = F.l5_006.bars.map((b) => (b.missing ? Number(l56miss.n) : b.value));
// l5-010 : la lecture perdue du jour 2 par la moyenne
const L510 = S.l5_010;
const l510miss = q(L510.mean2).mul(L510.day2.length).sub(sum(L510.day2.map((t) => t ?? 0)));

const t510 = pts(F.l5_010);
const l5_02v = barLabels(F.l5_002); const l5_02f = barsV(F.l5_002);
const karim = barsV(F.l5_003); const ali = S.l5_003.ali;
const brandB = { v: barLabels(F.l5_007), f: barsV(F.l5_007) };
const tram = pts(F.l5_005);
const l5_01e = F.l5_001.edges; const l5_01f = hist(F.l5_001);
const l5_01at = (from) => sum(l5_01f.filter((_, i) => l5_01e[i] >= from));
const l5_04e = F.l5_004.edges; const l5_04f = hist(F.l5_004);
const l5_04below = sum(l5_04f.filter((_, i) => l5_04e[i + 1] <= S.l5_004.cut));
const l5_09e = F.l5_009.edges; const l5_09f = hist(F.l5_009);
const l5_09at = sum(l5_09f.filter((_, i) => l5_09e[i] >= S.l5_009.from));
const sheet = S.l4_010.row;
const l410s = q(S.l4_010.newMean).mul(sheet.length + 1).sub(sum(sheet));

export const ORACLE = {
  /* niveau 1 */
  [K('l1-001:q1')]: R(cumUp(S.qcm1.v, S.qcm1.f, 14)),
  [K('l1-001:q2')]: R(wmedian(S.qcm1.v, S.qcm1.f)),
  [K('l1-002:q1')]: R(cumDown(S.qcm2.v, S.qcm2.f, 40)),
  [K('l1-002:q2')]: R(wmedian(S.qcm2.v, S.qcm2.f)),
  [K('l1-003:q1')]: R(median(S.qcm3)),
  [K('l1-003:q2')]: R(mean(S.qcm3)),
  [K('l1-004:q1')]: R(range(S.qcm4)),
  [K('l1-004:q2')]: R(median(S.qcm4)),
  [K('l1-005:q1')]: R(sum(S.l1_005.f)),
  [K('l1-005:q2')]: R(wmean(S.l1_005.v, S.l1_005.f)),
  [K('l1-006:q1')]: R(range(S.l1_006)),
  [K('l1-006:q2')]: R(median(S.l1_006)),
  [K('l1-007:q1')]: R(cumUp(S.l1_007.v, S.l1_007.f, 40)),
  [K('l1-007:q2')]: R(wmedian(S.l1_007.v, S.l1_007.f)),
  [K('l1-008:q1')]: R(sum(S.l1_008.f)),
  [K('l1-008:q2')]: R(wmean(S.l1_008.v, S.l1_008.f)),
  [K('l1-009:q1')]: R(cumDown(barLabels(F.l1_009), barsV(F.l1_009), 2)),
  [K('l1-009:q2')]: R(pct(cumDown(barLabels(F.l1_009), barsV(F.l1_009), 2), sum(barsV(F.l1_009)))),
  [K('l1-010:q1')]: R(mean(S.l1_010)),
  [K('l1-010:q2')]: R(median(S.l1_010)),

  /* niveau 2 */
  [K('l2-001:q1')]: R(q(S.qcm5.N + 1).div(2)),
  [K('l2-001:q2')]: R(q(S.qcm5.N2).div(2)),
  [K('l2-001:q3')]: R(q(S.qcm5.N2).div(2).add(1)),
  [K('l2-002:q1')]: R(mean(S.qcm6)),
  [K('l2-002:q2')]: R(median(S.qcm6)),
  [K('l2-002:q3')]: pick([cmp(mean(S.qcm6), median(S.qcm6)) < 0, false, false]),
  [K('l2-003:q1')]: R(medN),
  [K('l2-003:q2')]: R(medN.div(2)),
  [K('l2-003:q3')]: R(medN.div(2).add(1)),
  [K('l2-004:q1')]: R(wmean(S.l2_004.v, S.l2_004.f)),
  [K('l2-004:q2')]: R(wmedian(S.l2_004.v, S.l2_004.f)),
  [K('l2-005:q1')]: R(cumDown(S.l2_005.v, S.l2_005.f, 3)),
  [K('l2-005:q2')]: R(pct(cumDown(S.l2_005.v, S.l2_005.f, 3), sum(S.l2_005.f))),
  [K('l2-006:q1')]: R(median(S.l2_006)),
  [K('l2-006:q2')]: R(range(S.l2_006)),
  [K('l2-007:q1')]: R(sum(barsV(F.l2_007))),
  [K('l2-007:q2')]: R(wmean(barLabels(F.l2_007), barsV(F.l2_007))),
  [K('l2-007:q3')]: R(wmedian(barLabels(F.l2_007), barsV(F.l2_007))),
  [K('l2-008:q1')]: R(q(S.l2_008.mean).mul(S.l2_008.known.length + 1).sub(sum(S.l2_008.known))),
  [K('l2-008:q2')]: R(median([...S.l2_008.known, q(S.l2_008.mean).mul(S.l2_008.known.length + 1).sub(sum(S.l2_008.known)).toString()])),
  [K('l2-009:q1')]: R(range(S.l2_009.A)),
  [K('l2-009:q2')]: R(range(S.l2_009.B)),
  [K('l2-009:q3')]: pick([false, false, cmp(mean(S.l2_009.A), mean(S.l2_009.B)) === 0 && gt(range(S.l2_009.B), range(S.l2_009.A))]),
  [K('l2-010:q1')]: R(range(S.l2_010.v)),
  [K('l2-010:q2')]: R(wmedian(S.l2_010.v, S.l2_010.f)),

  /* niveau 3 */
  [K('l3-001:q1')]: R(cumUp(M.v.map((t) => t ?? 1000), M.f, 2)),
  [K('l3-001:q2')]: R(medN),
  [K('l3-001:q3')]: R(medX),
  [K('l3-002:q1')]: R(q(S.l3_002.mean).mul(sum(S.l3_002.f))),
  [K('l3-002:q2')]: R(l32x),
  [K('l3-002:q3')]: R(wmedian(l32full, S.l3_002.f)),
  [K('l3-003:q1')]: R(cumUp(S.l3_003.v, S.l3_003.f, 12)),
  [K('l3-003:q2')]: R(wmedian(S.l3_003.v, S.l3_003.f)),
  [K('l3-003:q3')]: R(wmean(S.l3_003.v, S.l3_003.f)),
  [K('l3-004:q1')]: R(pieCount(F.l3_004, 'الرياضيات', S.l3_004.N)),
  [K('l3-004:q2')]: R(pieCount(F.l3_004, 'اللغة العربية', S.l3_004.N)),
  [K('l3-004:q3')]: R(pct(pieCount(F.l3_004, 'العلوم', S.l3_004.N), S.l3_004.N)),
  [K('l3-005:q1')]: R(range(S.l3_005.A)),
  [K('l3-005:q2')]: R(range(S.l3_005.B)),
  [K('l3-005:q3')]: pick([false, cmp(mean(S.l3_005.A), mean(S.l3_005.B)) === 0 && cmp(range(S.l3_005.A), range(S.l3_005.B)) < 0, false]),
  [K('l3-006:q1')]: R(cumUp(S.l3_006.v, S.l3_006.f, 10)),
  [K('l3-006:q2')]: R(pct(cumUp(S.l3_006.v, S.l3_006.f, 10), sum(S.l3_006.f))),
  [K('l3-006:q3')]: R(wmedian(S.l3_006.v, S.l3_006.f)),
  [K('l3-007:q1')]: R(mean(S.l3_007.w)),
  [K('l3-007:q2')]: R(median(S.l3_007.w)),
  [K('l3-007:q3')]: R(mean([...S.l3_007.w.slice(0, -1), S.l3_007.newMax])),
  [K('l3-007:q4')]: R(median([...S.l3_007.w.slice(0, -1), S.l3_007.newMax])),
  [K('l3-007:q5')]: pick([cmp(median([...S.l3_007.w.slice(0, -1), S.l3_007.newMax]), median(S.l3_007.w)) === 0
    && gt(mean([...S.l3_007.w.slice(0, -1), S.l3_007.newMax]), S.l3_007.w.at(-2)), false]),
  [K('l3-008:q1')]: R(l38a),
  [K('l3-008:q2')]: R(wmean(S.l3_008.v, l38f)),
  [K('l3-008:q3')]: R(wmedian(S.l3_008.v, l38f)),
  [K('l3-009:q1')]: R(sum(hist(F.l3_009))),
  [K('l3-009:q2')]: R(centresMean(F.l3_009.edges, hist(F.l3_009))),
  [K('l3-009:q3')]: R(pct(hist(F.l3_009)[2], sum(hist(F.l3_009)))),
  [K('l3-010:q1')]: R(wmedian(barLabels(F.l3_010), barsV(F.l3_010))),
  [K('l3-010:q2')]: R(wmean(barLabels(F.l3_010), barsV(F.l3_010))),
  [K('l3-010:q3')]: R(pct(cumDown(barLabels(F.l3_010), barsV(F.l3_010), 3), sum(barsV(F.l3_010)))),

  /* niveau 4 */
  [K('l4-001:q1')]: R(medVis),
  [K('l4-001:q2')]: R(q(M.mean).mul(medN)),
  [K('l4-001:q3')]: R(medY),
  [K('l4-002:q1')]: R(range([...M.v.filter((t) => t !== null), medX, medY])),
  [K('l4-002:q2')]: R(medAll),
  [K('l4-002:q3')]: R(medAll.sub(medWithGold)),
  [K('l4-003:q1')]: R(E20.s),
  [K('l4-003:q2')]: R(E20.f[1]),
  [K('l4-003:q3')]: R(E20.f[2]),
  [K('l4-003:q4')]: R(wmean(S.ex20.v, E20.f)),
  [K('l4-004:q1')]: R(q(sum(L44.f)).add(1).div(2)),
  [K('l4-004:q2')]: R(l44x),
  [K('l4-004:q3')]: R(l44y),
  [K('l4-005:q1')]: R(l45miss),
  [K('l4-005:q2')]: R(centresMean(F.l4_005.edges, l45full)),
  [K('l4-005:q3')]: R(pct(sum(l45full.slice(2)), S.l4_005.N)),
  [K('l4-005:q4')]: R(sum(l45full.slice(2)).mul(S.l4_005.price)),
  [K('l4-006:q1')]: R(wmedian(S.l4_006.v, S.l4_006.f)),
  [K('l4-006:q2')]: R(cumDown(S.l4_006.v, S.l4_006.f, 12)),
  [K('l4-006:q3')]: R(wmean(S.l4_006.v, S.l4_006.f)),
  [K('l4-007:q1')]: R(q(S.l4_007.n).mul(S.l4_007.mean)),
  [K('l4-007:q2')]: R(q(S.l4_007.n).mul(S.l4_007.mean).add(S.l4_007.grade).div(S.l4_007.n + 1)),
  [K('l4-007:q3')]: R(q(S.l4_007.target).mul(S.l4_007.n + 2).sub(q(S.l4_007.n).mul(S.l4_007.mean).add(S.l4_007.grade))),
  [K('l4-008:q1')]: R(l48a),
  [K('l4-008:q2')]: R(wmedian(S.l4_008.v, l48f)),
  [K('l4-008:q3')]: R(range(S.l4_008.v)),
  [K('l4-009:q1')]: R(sum(barsV(F.l4_009))),
  [K('l4-009:q2')]: R(cumUp(barLabels(F.l4_009), barsV(F.l4_009), 14)),
  [K('l4-009:q3')]: R(pct(cumUp(barLabels(F.l4_009), barsV(F.l4_009), 14), sum(barsV(F.l4_009)))),
  [K('l4-009:q4')]: R(wmedian(barLabels(F.l4_009), barsV(F.l4_009))),
  // la moyenne de la ligne 1 (A1 … dernière colonne) : signe « = », fonction MOYENNE, plage complète
  [K('l4-010:q1')]: pick(S.l4_010.options.map(([eq, fn, a, b]) => eq && fn === 'MOYENNE' && a === 'A1' && b === `${String.fromCharCode(64 + sheet.length)}1`)),
  [K('l4-010:q2')]: R(mean(sheet)),
  [K('l4-010:q3')]: R(median(sheet)),
  [K('l4-010:q4')]: R(l410s),

  /* niveau 5 */
  [K('l5-001:q1')]: R(l5_01at(50)),
  [K('l5-001:q2')]: R(l5_01at(60)),
  [K('l5-001:q3')]: R(pct(l5_01at(S.l5_001.limit), sum(l5_01f))),
  [K('l5-001:q4')]: R(centresMean(l5_01e, l5_01f)),
  [K('l5-001:q5')]: pick([gt(pct(l5_01at(S.l5_001.limit), sum(l5_01f)), 50) || gt(centresMean(l5_01e, l5_01f), S.l5_001.limit), false]),
  [K('l5-002:q1')]: R(cumUp(l5_02v, l5_02f, 3)),
  [K('l5-002:q2')]: R(cumDown(l5_02v, l5_02f, S.l5_002.atLeast)),
  [K('l5-002:q3')]: R(wmedian(l5_02v, l5_02f)),
  [K('l5-002:q4')]: R(wmean(l5_02v, l5_02f)),
  [K('l5-002:q5')]: pick([gt(wmean(l5_02v, l5_02f), S.l5_002.meanLimit) && gt(cumDown(l5_02v, l5_02f, S.l5_002.atLeast), q(S.l5_002.days).div(3)), false]),
  [K('l5-002:q6')]: R(wsum(l5_02v, l5_02f)),
  [K('l5-002:q7')]: R(wsum(l5_02v, l5_02f).mul(S.l5_002.fuel)),
  [K('l5-003:q1')]: R(mean(ali)),
  [K('l5-003:q2')]: R(mean(karim)),
  [K('l5-003:q3')]: R(range(ali)),
  [K('l5-003:q4')]: R(range(karim)),
  [K('l5-003:q5')]: pick([false, cmp(mean(ali), mean(karim)) === 0 && cmp(range(ali), range(karim)) < 0, false]),
  [K('l5-003:q6')]: R(sum(ali)),
  [K('l5-003:q7')]: R(sum(ali).mul(S.l5_003.price).mul(q(100 - S.l5_003.fee).div(100))),
  [K('l5-004:q1')]: R(sum(l5_04f.slice(0, 2))),
  [K('l5-004:q2')]: R(sum(l5_04f.slice(0, 3))),
  [K('l5-004:q3')]: R(pct(l5_04below, sum(l5_04f))),
  [K('l5-004:q4')]: R(centresMean(l5_04e, l5_04f)),
  [K('l5-004:q5')]: pick([gt(pct(l5_04below, sum(l5_04f)), S.l5_004.rule) || cmp(centresMean(l5_04e, l5_04f), 10) < 0, false]),
  [K('l5-005:q1')]: R(ptAt(F.l5_005, 6)),
  [K('l5-005:q2')]: R(range(tram)),
  [K('l5-005:q3')]: R(mean(tram)),
  [K('l5-005:q4')]: R(median(tram)),
  [K('l5-005:q5')]: pick([false, cmp(median(tram), mean(tram)) > 0 && cmp(Math.min(...tram), median(tram)) < 0]),
  [K('l5-005:q6')]: R(sum(tram)),
  [K('l5-005:q7')]: R(sum(tram).mul(S.l5_005.ticket).mul(q(100 - S.l5_005.tax).div(100))),
  [K('l5-006:q1')]: R(l56miss),
  [K('l5-006:q2')]: R(wmean(l56v, l56f)),
  [K('l5-006:q3')]: R(wmedian(l56v, l56f)),
  [K('l5-006:q4')]: R(cumDown(l56v, l56f, wmedian(l56v, l56f))),
  [K('l5-007:q1')]: R(wmean(S.l5_007.a.v, S.l5_007.a.f)),
  [K('l5-007:q2')]: R(wmean(brandB.v, brandB.f)),
  [K('l5-007:q3')]: R(wmedian(S.l5_007.a.v, S.l5_007.a.f)),
  [K('l5-007:q4')]: R(wmedian(brandB.v, brandB.f)),
  [K('l5-007:q5')]: pick([gt(wmean(S.l5_007.a.v, S.l5_007.a.f), wmean(brandB.v, brandB.f)) && gt(wmedian(S.l5_007.a.v, S.l5_007.a.f), wmedian(brandB.v, brandB.f)), false]),
  [K('l5-007:q6')]: R(q(S.l5_007.price).mul(q(100 - S.l5_007.discount).div(100))),
  [K('l5-008:q1')]: R(pieAngleOfMissing(F.l5_008)),
  [K('l5-008:q2')]: R(pieCount(F.l5_008, 'روايات', S.l5_008.total)),
  [K('l5-008:q3')]: R(pct(pieCount(F.l5_008, 'قصص الأطفال', S.l5_008.total), S.l5_008.total)),
  [K('l5-008:q4')]: R(mean(S.l5_008.daily)),
  [K('l5-008:q5')]: R(median(S.l5_008.daily)),
  [K('l5-008:q6')]: R(pieCount(F.l5_008, 'روايات', S.l5_008.total).mul(S.l5_008.novel)),
  [K('l5-009:q1')]: R(l5_09at),
  [K('l5-009:q2')]: R(pct(l5_09at, sum(l5_09f))),
  [K('l5-009:q3')]: R(centresMean(l5_09e, l5_09f)),
  [K('l5-009:q4')]: R(l5_09at.mul(S.l5_009.jersey)),
  [K('l5-010:q1')]: R(ptAt(F.l5_010, 14)),
  [K('l5-010:q2')]: R(t510.filter((v) => gt(v, L510.hot)).length),
  [K('l5-010:q3')]: R(mean(t510)),
  [K('l5-010:q4')]: R(median(t510)),
  [K('l5-010:q5')]: R(range(t510)),
  [K('l5-010:q6')]: R(l510miss),
};
