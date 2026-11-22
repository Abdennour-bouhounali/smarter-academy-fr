// Oracle du banc « masahat-muhit-sath » (مساحة سطح مستو ومحيطه, 1AM, 2026-10-15) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, et jamais tirée de packages/core/arithmetic/surfaces.js
// (le laboratoire) :
//  - les aires et périmètres des figures quadrillées viennent des DONNÉES DE LA FIGURE (`statement.figure`) : chaque case
//    (carreau entier ou demi-carreau) est un polygone de sommets entiers ; l'aire est la somme des formules du lacet (shoelace,
//    en demi-unités, donc exacte), le périmètre est la somme des longueurs des arêtes portées par UN SEUL polygone (les arêtes
//    partagées s'annulent) — un bord en diagonale rend le périmètre irrationnel et l'oracle refuse de le donner ;
//  - les segments gras de chaque figure sont comparés à ce bord calculé (la figure dessine bien la clôture qu'on compte) ;
//  - les longueurs écrites sur une figure d'un terrain (étiquettes des côtés) sont sommées en centièmes exacts (BigInt) ;
//  - les nombres de l'énoncé (prix, lignes × colonnes, largeur d'une entrée…) sont recopiés ici en dur, puis combinés avec la
//    même arithmétique exacte ; un QCM n'a qu'un seul choix juste, trouvé en confrontant les options (retapées ici) au calcul.
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { readFileSync } from 'node:fs';
import { R, C } from './helpers.mjs';

const ROOT = new URL('../../content/practice/1am/masahat-muhit-sath/', import.meta.url);
const exFile = (L, n) => new URL(`level-${L}/ex-1am-masahat-muhit-sath-l${L}-${String(n).padStart(3, '0')}.json`, ROOT);
const figOf = (L, n) => JSON.parse(readFileSync(exFile(L, n), 'utf8')).statement.figure;

/* ── géométrie de la figure : polygones à sommets entiers ─────────────────── */
const edgeKey = (a, b) => [a, b].sort((p, q) => p[0] - q[0] || p[1] - q[1]).map((p) => p.join(',')).join('|');
function surface(fig, tones) {
  const polys = fig.polygons.filter((p) => tones.includes(p.tone));
  if (!polys.length) throw new Error(`aucune case de ton ${tones}`);
  let twice = 0; let whole = 0; let half = 0;
  const edges = new Map();
  for (const p of polys) {
    const v = p.points.map((n) => fig.points[n]);
    if (v.some((q) => !Number.isInteger(q[0]) || !Number.isInteger(q[1]))) throw new Error('sommet non entier');
    let s = 0;
    for (let i = 0; i < v.length; i++) { const a = v[i]; const b = v[(i + 1) % v.length]; s += a[0] * b[1] - b[0] * a[1]; edges.set(edgeKey(a, b), [...(edges.get(edgeKey(a, b)) ?? []), 1]); }
    twice += Math.abs(s); // 2 × aire du polygone ; un carreau → 2, un demi-carreau → 1
    if (v.length === 4) whole++; else if (v.length === 3) half++; else throw new Error('case ni carreau ni demi-carreau');
  }
  const bord = [...edges.entries()].filter(([, l]) => l.length === 1).map(([k]) => k);
  let per = 0; let irrational = false;
  for (const k of bord) {
    const [a, b] = k.split('|').map((t) => t.split(',').map(Number));
    if (a[0] === b[0]) per += Math.abs(a[1] - b[1]); else if (a[1] === b[1]) per += Math.abs(a[0] - b[0]); else irrational = true;
  }
  // la clôture dessinée (segments gras de ces tons) EST ce bord
  const bold = new Set((fig.segments ?? []).filter((s) => !Array.isArray(s) && s.bold && tones.includes(s.tone)).map((s) => edgeKey(fig.points[s.from], fig.points[s.to])));
  if (tones.length === 1 && (bold.size !== bord.length || bord.some((k) => !bold.has(k)))) throw new Error('la clôture dessinée n\'est pas le bord des cases');
  return { twice, whole, half, per: irrational ? null : per };
}
const half2 = (twice) => (twice % 2 === 0 ? `${twice / 2}` : `${(twice - 1) / 2},5`);
const area = (L, n, t) => half2(surface(figOf(L, n), t).twice);
const areaN = (L, n, t) => { const s = surface(figOf(L, n), t); if (s.twice % 2) throw new Error('aire non entière'); return s.twice / 2; };
const per = (L, n, t) => { const s = surface(figOf(L, n), t); if (s.per === null) throw new Error('périmètre irrationnel'); return s.per; };
const whole = (L, n, t) => surface(figOf(L, n), t).whole;
const halves = (L, n, t) => surface(figOf(L, n), t).half;

/* ── décimaux exacts en centièmes (BigInt) ─────────────────────────────────── */
const h100 = (s) => { const [i, f = ''] = String(s).replace(',', '.').split('.'); return BigInt(i + f.padEnd(2, '0').slice(0, 2)); };
const outH = (v) => {
  const neg = v < 0n; const a = neg ? -v : v;
  const i = a / 100n; const f = a % 100n;
  const fs = f === 0n ? '' : f % 10n === 0n ? `,${f / 10n}` : `,${String(f).padStart(2, '0')}`;
  return `${neg ? '-' : ''}${i}${fs}`;
};
const sumH = (list) => list.reduce((t, x) => t + h100(x), 0n);
const labelsOf = (L, n) => figOf(L, n).segments.map((s) => s.label);

/* ── QCM ─────────────────────────────────────────────────────────────────── */
const letter = (i) => C('ABCDEF'[i]);
const cmp = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
const symLetter = (truth) => letter(['<', '=', '>'].indexOf(truth));
/** l'unique option vraie parmi des booléens calculés */
const pick = (flags) => { const hits = flags.map((f, i) => (f ? i : -1)).filter((i) => i >= 0); if (hits.length !== 1) throw new Error(`QCM : ${hits.length} options justes`); return letter(hits[0]); };
/** A : même aire et même périmètre ; B : même aire seulement ; C : même périmètre seulement */
const relLetter = (s, t) => pick([s.twice === t.twice && s.per === t.per, s.twice === t.twice && s.per !== t.per, s.twice !== t.twice && s.per === t.per]);
const SP = (L, n, tone) => surface(figOf(L, n), [tone]);

const L = 'ex-1am-masahat-muhit-sath';
const K = (lvl, n, q) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${q}`;
const rows = (a, b) => a * b;
const rectPer = (a, b) => 2 * (a + b); // les quatre côtés additionnés (a, b, a, b) : jamais une règle apprise ici, un total de 4 longueurs
const IN = ['indigo']; const AM = ['amber']; const EM = ['emerald']; const RO = ['rose']; const SK = ['sky']; const VI = ['violet']; const SL = ['slate'];

export const ORACLE = {
  /* ── Niveau 1 ── */
  [K(1, 1, 'q1')]: R(area(1, 1, IN)),
  [K(1, 1, 'q2')]: R(per(1, 1, IN)),
  [K(1, 1, 'q3')]: letter(1), // les « bâtons de clôture » suivent le bord : c'est le périmètre (réponse conceptuelle)
  [K(1, 2, 'q1')]: letter(2), // nombre de carreaux qui couvrent un sol → aire
  [K(1, 2, 'q2')]: letter(1), // longueur de ruban autour d'un panneau → périmètre
  [K(1, 2, 'q3')]: letter(2), // longueur de clôture → périmètre
  [K(1, 2, 'q4')]: letter(0), // nombre de carrés qui couvrent un dessus de table → aire
  [K(1, 3, 'q1')]: R(area(1, 3, EM)),
  [K(1, 3, 'q2')]: R(per(1, 3, EM)),
  [K(1, 3, 'q3')]: R(rows(5, 6)), // 5 rangées de 6 carreaux
  [K(1, 4, 'q1')]: R(whole(1, 4, AM)),
  [K(1, 4, 'q2')]: R(halves(1, 4, AM)),
  [K(1, 4, 'q3')]: R(area(1, 4, AM)),
  [K(1, 5, 'q1')]: R(area(1, 5, IN)),
  [K(1, 5, 'q2')]: R(half2(surface(figOf(1, 5), IN).twice / 2)), // l'unité ② vaut deux carreaux : deux fois moins d'unités
  [K(1, 5, 'q3')]: (() => { const a1 = areaN(1, 5, IN); const a2 = a1 / 2; return pick([a2 === a1 * 2, a2 === a1, a2 < a1]); })(),
  [K(1, 6, 'q1')]: symLetter(cmp(SP(1, 6, 'indigo').twice, SP(1, 6, 'amber').twice)),
  [K(1, 6, 'q2')]: symLetter(cmp(SP(1, 6, 'indigo').per, SP(1, 6, 'amber').per)),
  [K(1, 6, 'q3')]: relLetter(SP(1, 6, 'indigo'), SP(1, 6, 'amber')),
  [K(1, 7, 'q1')]: R(per(1, 7, EM)),
  [K(1, 7, 'q2')]: R(per(1, 7, EM) * 2), // un côté de carreau = 2 m
  [K(1, 7, 'q3')]: R(per(1, 7, EM) * 2 * 150),
  [K(1, 8, 'q1')]: symLetter(cmp(SP(1, 8, 'indigo').per, SP(1, 8, 'amber').per)),
  [K(1, 8, 'q2')]: symLetter(cmp(SP(1, 8, 'indigo').twice, SP(1, 8, 'amber').twice)),
  [K(1, 8, 'q3')]: R(areaN(1, 8, IN) - areaN(1, 8, AM)),
  [K(1, 9, 'q1')]: R(area(1, 9, RO)),
  [K(1, 9, 'q2')]: R(12 - areaN(1, 9, RO)),
  [K(1, 9, 'q3')]: R(areaN(1, 9, RO) - 2),
  [K(1, 10, 'q1')]: R(outH(sumH(['12,5', '8,25', '9', '6,75', '10']))),
  [K(1, 10, 'q2')]: R(outH(sumH(['12,5', '8,25', '9', '6,75', '10']) - h100('3,5'))),
  [K(1, 10, 'q3')]: letter(1), // un périmètre est une longueur : unité de longueur

  /* ── Niveau 2 ── */
  [K(2, 1, 'q1')]: R(area(2, 1, AM)),
  [K(2, 1, 'q2')]: R(per(2, 1, IN)),
  [K(2, 1, 'q3')]: R(per(2, 1, AM)),
  [K(2, 2, 'q1')]: R(per(2, 2, IN)),
  [K(2, 2, 'q2')]: R(per(2, 2, AM)),
  [K(2, 2, 'q3')]: R(areaN(2, 2, AM) - areaN(2, 2, IN)),
  [K(2, 3, 'q1')]: R(outH(sumH(['14', '9,5', '14', '9,5']))),
  [K(2, 3, 'q2')]: R(outH(sumH(['14', '9,5', '14', '9,5']) - h100('2,5'))),
  [K(2, 3, 'q3')]: R(outH((sumH(['14', '9,5', '14', '9,5']) - h100('2,5')) * 120n)),
  [K(2, 4, 'q1')]: R(whole(2, 4, SK)),
  [K(2, 4, 'q2')]: R(halves(2, 4, SK)),
  [K(2, 4, 'q3')]: R(area(2, 4, SK)),
  [K(2, 5, 'q1')]: R(area(2, 5, VI)),
  [K(2, 5, 'q2')]: R(half2(surface(figOf(2, 5), VI).twice / 2)),
  [K(2, 5, 'q3')]: (() => { const a = areaN(2, 5, VI); const opts = ['13,5', '27', '54']; const want = String(a * 2); return pick(opts.map((o) => o === want)); })(),
  [K(2, 6, 'q1')]: symLetter(cmp(SP(2, 6, 'indigo').twice, SP(2, 6, 'amber').twice)),
  [K(2, 6, 'q2')]: symLetter(cmp(SP(2, 6, 'indigo').per, SP(2, 6, 'amber').per)),
  [K(2, 6, 'q3')]: R(SP(2, 6, 'amber').per - SP(2, 6, 'indigo').per),
  [K(2, 7, 'q1')]: symLetter(cmp(SP(2, 7, 'indigo').per, SP(2, 7, 'amber').per)),
  [K(2, 7, 'q2')]: symLetter(cmp(SP(2, 7, 'indigo').twice, SP(2, 7, 'amber').twice)),
  // « le plus long pourtour borde le plus grand domaine » : faux dès que le pourtour le plus long borde le plus petit
  [K(2, 7, 'q3')]: (() => { const a = SP(2, 7, 'indigo'); const b = SP(2, 7, 'amber'); const refuted = a.per > b.per && a.twice < b.twice; return pick([!refuted, false, refuted]); })(),
  [K(2, 8, 'q1')]: R(area(2, 8, EM)),
  [K(2, 8, 'q2')]: R(per(2, 8, EM)),
  // 10 est le pourtour du rectangle englobant : on oublie la brèche
  [K(2, 8, 'q3')]: (() => { const s = surface(figOf(2, 8), EM); return pick([false, s.per !== 10, false]); })(),
  [K(2, 9, 'q1')]: symLetter(cmp(SP(2, 9, 'indigo').twice, SP(2, 9, 'amber').twice)),
  [K(2, 9, 'q2')]: R(SP(2, 9, 'amber').per - SP(2, 9, 'indigo').per),
  [K(2, 9, 'q3')]: (() => { const a = SP(2, 9, 'indigo').per; const b = SP(2, 9, 'amber').per; return pick([a > b, b > a, a === b]); })(),
  [K(2, 9, 'q4')]: R((SP(2, 9, 'amber').per - SP(2, 9, 'indigo').per) * 80),
  [K(2, 10, 'q1')]: R(rows(6, 9)),
  [K(2, 10, 'q2')]: R(9 + 6 + 9 + 6),
  [K(2, 10, 'q3')]: R(rows(7, 9)),

  /* ── Niveau 3 ── */
  [K(3, 1, 'q1')]: R(area(3, 1, IN)),
  [K(3, 1, 'q2')]: R(per(3, 1, AM)),
  // options : A et C / A et B / B et C — même aire sans même périmètre
  [K(3, 1, 'q3')]: (() => { const t = { A: SP(3, 1, 'indigo'), B: SP(3, 1, 'amber'), C: SP(3, 1, 'emerald') }; const f = (x, y) => t[x].twice === t[y].twice && t[x].per !== t[y].per; return pick([f('A', 'C'), f('A', 'B'), f('B', 'C')]); })(),
  // options : A et B / B et C / A et C — même périmètre sans même aire
  [K(3, 1, 'q4')]: (() => { const t = { A: SP(3, 1, 'indigo'), B: SP(3, 1, 'amber'), C: SP(3, 1, 'emerald') }; const f = (x, y) => t[x].per === t[y].per && t[x].twice !== t[y].twice; return pick([f('A', 'B'), f('B', 'C'), f('A', 'C')]); })(),
  [K(3, 2, 'q1')]: R(outH(sumH(labelsOf(3, 2)))),
  [K(3, 2, 'q2')]: R(outH(sumH(labelsOf(3, 2)) - h100('3,5'))),
  [K(3, 2, 'q3')]: R(outH((sumH(labelsOf(3, 2)) - h100('3,5')) * 120n)),
  [K(3, 3, 'q1')]: R(whole(3, 3, SK)),
  [K(3, 3, 'q2')]: R(halves(3, 3, SK)),
  [K(3, 3, 'q3')]: R(area(3, 3, SK)),
  // on achète les bâtons entiers + une dalle entière pour deux moitiés
  [K(3, 3, 'q4')]: R(whole(3, 3, SK) + halves(3, 3, SK) / 2),
  [K(3, 4, 'q1')]: R(area(3, 4, VI)),
  [K(3, 4, 'q2')]: R(half2(surface(figOf(3, 4), VI).twice / 2)),
  [K(3, 4, 'q3')]: R(areaN(3, 4, VI) * 2),
  [K(3, 4, 'q4')]: letter(1), // plus l'unité est grande, moins il en faut (le nombre : 46 > 23 > 11,5)
  [K(3, 5, 'q1')]: R(area(3, 5, EM)),
  // options : A le plus long / D le plus court / périmètres égaux
  [K(3, 5, 'q2')]: (() => { const p = { A: SP(3, 5, 'indigo').per, B: SP(3, 5, 'amber').per, C: SP(3, 5, 'emerald').per, D: SP(3, 5, 'rose').per }; const v = Object.values(p); const allEq = v.every((x) => x === v[0]); return pick([p.A > Math.max(p.B, p.C, p.D), p.D < Math.min(p.A, p.B, p.C), allEq]); })(),
  // options : D / A / B  — le plus grand domaine
  [K(3, 5, 'q3')]: (() => { const t = { A: SP(3, 5, 'indigo').twice, B: SP(3, 5, 'amber').twice, D: SP(3, 5, 'rose').twice }; const best = Math.max(...Object.values(t)); return pick([t.D === best, t.A === best, t.B === best]); })(),
  [K(3, 5, 'q4')]: R(areaN(3, 5, IN) - areaN(3, 5, RO)),
  [K(3, 6, 'q1')]: R(area(3, 6, EM)),
  [K(3, 6, 'q2')]: R(per(3, 6, EM)),
  [K(3, 6, 'q3')]: R(per(3, 6, EM) * 5),
  [K(3, 6, 'q4')]: R(per(3, 6, EM) * 5 - 4),
  [K(3, 6, 'q5')]: R((per(3, 6, EM) * 5 - 4) * 85),
  // options : B puis C puis A / A puis C puis B / A puis B puis C — rangés du plus petit pourtour au plus grand
  [K(3, 7, 'q1')]: (() => { const a = { A: SP(3, 7, 'indigo').twice, B: SP(3, 7, 'amber').twice, C: SP(3, 7, 'emerald').twice }; return pick([a.B > Math.max(a.A, a.C), a.A === a.B && a.B === a.C, a.A > Math.max(a.B, a.C)]); })(),
  [K(3, 7, 'q2')]: (() => {
    const p = { A: SP(3, 7, 'indigo').per, B: SP(3, 7, 'amber').per, C: SP(3, 7, 'emerald').per };
    const asc = (s) => [...s].every((c, i) => i === 0 || p[s[i - 1]] < p[c]);
    return pick([asc('BCA'), asc('ACB'), asc('ABC')]);
  })(),
  [K(3, 7, 'q3')]: R(SP(3, 7, 'amber').per - SP(3, 7, 'indigo').per),
  [K(3, 8, 'q1')]: R(rows(5, 8)),
  [K(3, 8, 'q2')]: R(46 - rows(5, 8)),
  [K(3, 8, 'q3')]: R(5 + 8 + 5 + 8),
  [K(3, 8, 'q4')]: R(rows(8, 8) - 46),
  [K(3, 9, 'q1')]: R(areaN(3, 9, ['emerald', 'slate'])),
  [K(3, 9, 'q2')]: R(area(3, 9, EM)),
  [K(3, 9, 'q3')]: R(area(3, 9, SL)),
  [K(3, 9, 'q4')]: R(areaN(3, 9, SL) * 40),
  [K(3, 9, 'q5')]: R(per(3, 9, ['emerald', 'slate'])),
  [K(3, 10, 'q1')]: R(area(3, 10, IN)),
  [K(3, 10, 'q2')]: R(area(3, 10, AM)),
  [K(3, 10, 'q3')]: R(areaN(3, 10, IN) - areaN(3, 10, AM)),
  [K(3, 10, 'q4')]: (() => { const a = SP(3, 10, 'indigo'); const b = SP(3, 10, 'amber'); return pick([false, a.per === b.per && a.twice !== b.twice, false]); })(),

  /* ── Niveau 4 ── */
  [K(4, 1, 'q1')]: R(area(4, 1, IN)),
  [K(4, 1, 'q2')]: R(per(4, 1, IN)),
  [K(4, 1, 'q3')]: R(per(4, 1, AM)),
  [K(4, 1, 'q4')]: (() => { const a = SP(4, 1, 'indigo'); const b = SP(4, 1, 'amber'); return relLetter(a, b); })(),
  [K(4, 1, 'q5')]: R(outH((BigInt(per(4, 1, IN) - per(4, 1, AM)) * 50n))), // × 0,5 m
  [K(4, 2, 'q1')]: R(rows(7, 12)),
  [K(4, 2, 'q2')]: R(12 + 7 + 12 + 7),
  [K(4, 2, 'q3')]: R(rows(7, 12) / (6 + 6)),
  [K(4, 2, 'q4')]: R((rows(7, 12) / (6 + 6)) * 450 * 2),
  [K(4, 2, 'q5')]: R((12 + 7 + 12 + 7) * 2),
  [K(4, 2, 'q6')]: R((12 + 7 + 12 + 7) * 2 * 110),
  [K(4, 3, 'q1')]: R(whole(4, 3, VI)),
  [K(4, 3, 'q2')]: R(halves(4, 3, VI)),
  [K(4, 3, 'q3')]: R(area(4, 3, VI)),
  [K(4, 3, 'q4')]: R(areaN(4, 3, VI) * 180),
  [K(4, 3, 'q5')]: R(2500 - areaN(4, 3, VI) * 180),
  [K(4, 4, 'q1')]: R(area(4, 4, EM)),
  [K(4, 4, 'q2')]: R(areaN(4, 4, EM) / 2),
  [K(4, 4, 'q3')]: R(per(4, 4, EM)),
  [K(4, 4, 'q4')]: R(outH(BigInt(per(4, 4, EM) * 5) * 100n - h100('2,5'))),
  [K(4, 4, 'q5')]: R(outH((BigInt(per(4, 4, EM) * 5) * 100n - h100('2,5')) * 80n)),
  [K(4, 5, 'q1')]: R(area(4, 5, RO)),
  // options : 3 rangées de 5 / 2 rangées de 8 / 4 rangées de 5
  [K(4, 5, 'q2')]: pick([rows(3, 5), rows(2, 8), rows(4, 5)].map((a) => a === areaN(4, 5, RO))),
  // options : côté 3 / 4 / 5
  [K(4, 5, 'q3')]: pick([3, 4, 5].map((c) => c * c === areaN(4, 5, RO))),
  // périmètres en m (côté 0,75 m) : surface, rectangle 2 × 8, carré 4 × 4 ; options rangées croissant ?
  [K(4, 5, 'q4')]: (() => {
    const pS = BigInt(per(4, 5, RO)) * 75n; const pR = BigInt(rectPer(2, 8)) * 75n; const pQ = BigInt(rectPer(4, 4)) * 75n;
    const asc = (x, y, z) => x < y && y < z;
    // A : carré < surface < rectangle ; B : rectangle < surface < carré ; C : surface < carré < rectangle
    return pick([asc(pQ, pS, pR), asc(pR, pS, pQ), asc(pS, pQ, pR)]);
  })(),
  [K(4, 6, 'q1')]: R(outH(sumH(['24,5', '18,75', '24,5', '18,75']))),
  [K(4, 6, 'q2')]: R(outH(sumH(['30', '12,6', '30', '12,6']))),
  [K(4, 6, 'q3')]: symLetter(cmp(sumH(['24,5', '18,75', '24,5', '18,75']), sumH(['30', '12,6', '30', '12,6']))),
  [K(4, 6, 'q4')]: R(outH(sumH(['30', '12,6', '30', '12,6']) * 200n)),
  [K(4, 6, 'q5')]: letter(1), // on ne déduit rien de l'aire à partir du seul pourtour
  [K(4, 7, 'q1')]: R(half2(surface(figOf(4, 7), IN).twice / 2)),
  [K(4, 7, 'q2')]: R(9 * 2),
  // options : T1 (17 > 9) / T2 / égales — comparées dans la même unité ①
  [K(4, 7, 'q3')]: (() => { const t1 = areaN(4, 7, IN); const t2 = 9 * 2; return pick([t1 > t2, t2 > t1, t1 === t2]); })(),
  [K(4, 7, 'q4')]: symLetter(cmp(BigInt(areaN(4, 7, IN)) * 50n, 900n)), // 8,5 contre 9 (centièmes)
  [K(4, 7, 'q5')]: R(9 * 2 - areaN(4, 7, IN)),
  [K(4, 8, 'q1')]: R(areaN(4, 8, ['emerald', 'slate'])),
  [K(4, 8, 'q2')]: R(area(4, 8, EM)),
  [K(4, 8, 'q3')]: R(areaN(4, 8, SL)),
  [K(4, 8, 'q4')]: R(per(4, 8, EM)),
  [K(4, 8, 'q5')]: R(per(4, 8, EM) * 2),
  [K(4, 8, 'q6')]: R(per(4, 8, EM) * 2 * 60),
  // options : A puis C puis B / B puis C puis A / C puis B puis A — aires croissantes
  [K(4, 9, 'q1')]: (() => {
    const a = { A: SP(4, 9, 'indigo').twice, B: SP(4, 9, 'amber').twice, C: SP(4, 9, 'emerald').twice };
    const asc = (s) => [...s].every((c, i) => i === 0 || a[s[i - 1]] < a[c]);
    return pick([asc('ACB'), asc('BCA'), asc('CBA')]);
  })(),
  // options : A et B / A et C / B et C — même pourtour
  [K(4, 9, 'q2')]: (() => { const p = { A: SP(4, 9, 'indigo').per, B: SP(4, 9, 'amber').per, C: SP(4, 9, 'emerald').per }; return pick([p.A === p.B, p.A === p.C, p.B === p.C]); })(),
  [K(4, 9, 'q3')]: R(outH(BigInt(SP(4, 9, 'emerald').per) * 75n)),
  [K(4, 9, 'q4')]: (() => {
    const a = { A: SP(4, 9, 'indigo'), B: SP(4, 9, 'amber'), C: SP(4, 9, 'emerald') };
    const bLongest = a.B.per > a.A.per && a.B.per > a.C.per;
    return pick([bLongest && a.B.twice > a.A.twice && a.B.twice > a.C.twice, bLongest && a.B.twice < a.A.twice && a.B.twice < a.C.twice, a.A.twice === a.B.twice && a.B.twice === a.C.twice]);
  })(),
  [K(4, 10, 'q1')]: R(area(4, 10, AM)),
  [K(4, 10, 'q2')]: R(areaN(4, 10, AM) * 25000),
  [K(4, 10, 'q3')]: R(per(4, 10, AM)),
  [K(4, 10, 'q4')]: R(per(4, 10, AM) * 10 - 4),
  [K(4, 10, 'q5')]: R((per(4, 10, AM) * 10 - 4) * 70),
  [K(4, 10, 'q6')]: R(300000 - areaN(4, 10, AM) * 25000 - (per(4, 10, AM) * 10 - 4) * 70),

  /* ── Niveau 5 ── */
  [K(5, 1, 'q1')]: R(outH(sumH(labelsOf(5, 1)))),
  [K(5, 1, 'q2')]: R(outH(sumH(labelsOf(5, 1)) - h100('4,25'))),
  [K(5, 1, 'q3')]: R(outH((sumH(labelsOf(5, 1)) - h100('4,25')) * 220n)),
  [K(5, 1, 'q4')]: R(3 * 4),
  [K(5, 1, 'q5')]: R(3 * 4 * 1800),
  // options : « nous restent 16970 » / « il manque 5565 » / « il manque 4630 » — dépense totale contre 80000
  [K(5, 1, 'q6')]: (() => {
    const fence = (sumH(labelsOf(5, 1)) - h100('4,25')) * 220n / 100n; const total = fence + BigInt(3 * 4 * 1800); const miss = total - 80000n;
    return pick([total <= 80000n && 80000n - total === 16970n, total > 80000n && miss === 5565n, total > 80000n && miss === 4630n]);
  })(),
  [K(5, 2, 'q1')]: R(area(5, 2, IN)),
  [K(5, 2, 'q2')]: R(area(5, 2, AM)),
  [K(5, 2, 'q3')]: R(per(5, 2, IN)),
  [K(5, 2, 'q4')]: R(per(5, 2, AM)),
  [K(5, 2, 'q5')]: R((per(5, 2, IN) * 10 - 4) * 60),
  [K(5, 2, 'q6')]: R((per(5, 2, AM) * 10 - 4) * 60),
  // options : B / A / égalité — même aire, on prend le plus court pourtour
  [K(5, 2, 'q7')]: (() => { const a = SP(5, 2, 'indigo'); const b = SP(5, 2, 'amber'); return pick([b.twice === a.twice && b.per < a.per, a.twice === b.twice && a.per < b.per, a.per === b.per]); })(),
  [K(5, 3, 'q1')]: R(rows(9, 14)),
  [K(5, 3, 'q2')]: R(9 + 14 + 9 + 14),
  [K(5, 3, 'q3')]: R((9 + 14 + 9 + 14) * 2),
  [K(5, 3, 'q4')]: R(rows(9, 14) * 35),
  [K(5, 3, 'q5')]: R(3 * 1500),
  // options : le second / le premier (économie de 90) / sans différence
  [K(5, 3, 'q6')]: (() => { const x = rows(9, 14) * 35; const y = 3 * 1500; return pick([y < x, x < y && y - x === 90, x === y]); })(),
  [K(5, 4, 'q1')]: R(areaN(5, 4, ['emerald', 'slate'])),
  [K(5, 4, 'q2')]: R(area(5, 4, EM)),
  [K(5, 4, 'q3')]: R(areaN(5, 4, SL)),
  [K(5, 4, 'q4')]: R(per(5, 4, ['emerald', 'slate'])),
  [K(5, 4, 'q5')]: R(per(5, 4, ['emerald', 'slate']) * 6 - 5),
  [K(5, 4, 'q6')]: R((per(5, 4, ['emerald', 'slate']) * 6 - 5) * 90),
  // options : « il reste 200 » / « il manque 800 » / « il manque 350 » — coût contre 10000
  [K(5, 4, 'q7')]: (() => { const cost = (per(5, 4, ['emerald', 'slate']) * 6 - 5) * 90; const miss = cost - 10000; return pick([miss < 0 && -miss === 200, miss > 0 && miss === 800, miss > 0 && miss === 350]); })(),
  [K(5, 5, 'q1')]: R(areaN(5, 5, ['emerald', 'slate'])),
  [K(5, 5, 'q2')]: R(area(5, 5, EM)),
  [K(5, 5, 'q3')]: R(areaN(5, 5, SL)),
  [K(5, 5, 'q4')]: R(areaN(5, 5, SL) * 25),
  [K(5, 5, 'q5')]: R(per(5, 5, ['emerald', 'slate'])),
  // options : suffit (2 de reste) / manque 8 carreaux / manque 2 carreaux — peinture pour 28 carreaux
  [K(5, 5, 'q6')]: (() => { const need = areaN(5, 5, SL); const miss = need - 28; return pick([miss < 0 && -miss === 2, miss === 8, miss === 2]); })(),
  [K(5, 6, 'q1')]: R(per(5, 6, IN)),
  [K(5, 6, 'q2')]: R(area(5, 6, ['emerald'])),
  [K(5, 6, 'q3')]: R(area(5, 6, ['rose'])),
  [K(5, 6, 'q4')]: R(areaN(5, 6, IN) * 20000),
  [K(5, 6, 'q5')]: R(areaN(5, 6, ['emerald']) * 20000),
  // options : U / X / W / V — la plus grande aire dont le prix ne dépasse pas 450000 (le pourtour est le même partout)
  [K(5, 6, 'q6')]: (() => {
    const t = { U: 'indigo', V: 'amber', W: 'emerald', X: 'rose' };
    const info = Object.fromEntries(Object.entries(t).map(([k, tone]) => [k, SP(5, 6, tone)]));
    const sameFence = Object.values(info).every((s) => s.per === info.U.per);
    const ok = Object.entries(info).filter(([, s]) => sameFence && (s.twice / 2) * 20000 <= 450000);
    const best = ok.sort((a, b) => b[1].twice - a[1].twice)[0][0];
    return pick(['U', 'X', 'W', 'V'].map((k) => k === best));
  })(),
  [K(5, 7, 'q1')]: R(area(5, 7, RO)),
  [K(5, 7, 'q2')]: R(per(5, 7, RO)),
  // options : côté 5 / 6 / 9
  [K(5, 7, 'q3')]: pick([5, 6, 9].map((c) => c * c === areaN(5, 7, RO))),
  [K(5, 7, 'q4')]: (() => { const a = areaN(5, 7, RO); let c = 0; while (c * c < a) c++; if (c * c !== a) throw new Error('pas un carré'); return R(4 * c); })(),
  // options : 5 × 8 / 3 × 11 / 4 × 9
  [K(5, 7, 'q5')]: pick([rows(5, 8), rows(3, 11), rows(4, 9)].map((a) => a === areaN(5, 7, RO))),
  // options : l'originale / le carré / le rectangle 4 × 9 — le plus petit pourtour
  [K(5, 7, 'q6')]: (() => { const o = per(5, 7, RO); const q = rectPer(6, 6); const r = rectPer(4, 9); const m = Math.min(o, q, r); return pick([o === m, q === m, r === m]); })(),
  [K(5, 8, 'q1')]: R(whole(5, 8, SK)),
  [K(5, 8, 'q2')]: R(halves(5, 8, SK)),
  [K(5, 8, 'q3')]: R(area(5, 8, SK)),
  [K(5, 8, 'q4')]: R(halves(5, 8, SK) / 2),
  [K(5, 8, 'q5')]: R(whole(5, 8, SK) + halves(5, 8, SK) / 2),
  [K(5, 8, 'q6')]: R(whole(5, 8, SK) + halves(5, 8, SK) / 2 - 22),
  // options : suffit / manque 2 / suffit avec reste
  [K(5, 8, 'q7')]: (() => { const need = whole(5, 8, SK) + halves(5, 8, SK) / 2; return pick([need <= 22, need - 22 === 2, need < 22]); })(),
  [K(5, 9, 'q1')]: R(area(5, 9, IN)),
  [K(5, 9, 'q2')]: R(area(5, 9, AM)),
  [K(5, 9, 'q3')]: R(per(5, 9, IN)),
  [K(5, 9, 'q4')]: R(per(5, 9, AM)),
  [K(5, 9, 'q5')]: R(per(5, 9, AM) - per(5, 9, IN)),
  [K(5, 9, 'q6')]: R((BigInt(per(5, 9, AM) - per(5, 9, IN)) * 3n * 90n) / 2n), // bâtons × 1,5 m × 90 DA
  // options : on déplace (B plus long) / on déplace (B plus grand) / on ne déplace pas
  [K(5, 9, 'q7')]: (() => { const a = SP(5, 9, 'indigo'); const b = SP(5, 9, 'amber'); return pick([b.per > a.per && b.twice > a.twice, b.twice > a.twice, a.twice === b.twice && b.per > a.per]); })(),
  [K(5, 10, 'q1')]: R(rows(5, 7)),
  [K(5, 10, 'q2')]: R(half2(rows(5, 7))), // 35 unités ① → 35 / 2 unités ② (en demi-unités : 35 → 17,5)
  [K(5, 10, 'q3')]: R(Math.ceil(rows(5, 7) / 2)), // on n'achète pas une demi-dalle : 17 entières + une coupée
  [K(5, 10, 'q4')]: R(rectPer(5, 7)),
  [K(5, 10, 'q5')]: R(outH(BigInt(rectPer(5, 7)) * 50n - h100('0,9'))),
  [K(5, 10, 'q6')]: R(outH((BigInt(rectPer(5, 7)) * 50n - h100('0,9')) * 150n)),
  // options : la petite (35 × 160) / la double (18 × 300) / sans écart
  [K(5, 10, 'q7')]: (() => { const small = rows(5, 7) * 160; const dbl = Math.ceil(rows(5, 7) / 2) * 300; return pick([small < dbl, dbl < small, small === dbl]); })(),
};
