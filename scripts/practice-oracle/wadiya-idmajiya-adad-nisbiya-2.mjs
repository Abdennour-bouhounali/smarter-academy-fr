// Oracle du banc « wadiya-idmajiya-adad-nisbiya-2 » (« أدمج تعلّماتي — الأعداد النسبية », synthèse de l'unité 3 de 2AM, 2026-10-30) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثاني »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, en arithmétique indépendante sur les CENTIÈMES (BigInt, aucun flottant, aucun import de packages/core) :
//  - une somme algébrique retapée de l'énoncé (« (-6)+(+9)-(-5) », « [(-13)+(+25)]-[(-20)-(+35)] », « -7+3-5+9 ») est évaluée par RÉDUCTION des groupes les plus internes
//    (chaque ( ) ou [ ] est remplacé par sa valeur, puis la chaîne plate est additionnée terme à terme) ; le résultat est comparé au corrigé par une seconde voie (formes « somme des
//    positifs + somme des négatifs ») ;
//  - la distance de deux abscisses est « la plus grande moins la plus petite » (jamais négative) ; le milieu est « la plus petite + la moitié de la distance » (refusé s'il exige 3 décimales) ;
//    le changement est « nouveau − ancien » ; la lecture d'une abscisse est « nombre de graduations × valeur de la graduation » signé par la jambe du mètre ; l'opposé est −a ;
//    l'aire d'un rectangle est le produit de ses dimensions et un prix total le produit d'un nombre par un prix (étapes des années antérieures : `counted: false`) ;
//  - un point est (x ; y) : le quatrième sommet d'un rectangle a l'abscisse du premier et l'ordonnée du troisième ; la symétrique par rapport à l'axe des abscisses change l'ordonnée, par rapport à
//    l'axe des ordonnées l'abscisse ; un point de coordonnées (x ; 0) est sur l'axe des abscisses, (0 ; y) sur l'axe des ordonnées ;
//  - chaque QCM n'a qu'UNE option juste : chaque option est retapée en valeur et jugée par le calcul ; chaque distracteur ou signature nommé MISC-* est RECALCULÉ depuis son erreur
//    (voir FORMULA) et est FAUX ; l'ensemble des signatures d'une question est exactement celui retapé ;
//  - audit(bank) relit les fichiers : clé, options, signatures, الكفاءة (toujours P1 de la synthèse), counted, nombres imprimés dans l'énoncé, corrigé, et le texte (aucun renvoi au manuel,
//    aucun terme interdit, aucune lettre latine, aucune unité latine ni aucun nombre signé hors de $…$) ; la provenance (2 term_exam lus, 48 feuilles modelled) est contrôlée par scripts/exam-provenance.test.mjs et validate-exercises.
// Les questions selfCheck (« أثبت ») n'ont pas de clé et ne figurent pas ici.
import { R, C, P as PT } from './helpers.mjs';

const SC = 100n;
const abs = (x) => (x < 0n ? -x : x);
const sgn = (x) => (x < 0n ? -1n : x > 0n ? 1n : 0n);
const D = (v) => {
  let s = String(v).replace('{,}', '.').replace('−', '-').replace(',', '.').trim();
  const neg = s.startsWith('-'); s = s.replace(/^[-+]/, '');
  const [i, f = ''] = s.split('.');
  if (f.length > 2) throw new Error(`plus de 2 décimales : ${v}`);
  const r = BigInt(i) * SC + BigInt((f + '00').slice(0, 2));
  return neg ? -r : r;
};
const txt = (v) => {
  const neg = v < 0n; v = abs(v);
  let s = String(v / SC); const f = v % SC;
  if (f) s += `.${String(f).padStart(2, '0').replace(/0$/, '')}`;
  return (neg ? '-' : '') + s;
};

/* ── l'évaluateur de chaînes : réduction des groupes les plus internes ── */
const normSigns = (str) => { let s = str.replace(/\s+/g, ''); while (/[+-][+-]/.test(s)) s = s.replace(/\+\+/g, '+').replace(/--/g, '+').replace(/\+-/g, '-').replace(/-\+/g, '-'); return s; };
const flat = (str) => {
  const s = normSigns(str);
  const terms = s.match(/[+-]?\d+(?:\.\d+)?/g) ?? [];
  if (terms.join('') !== s.replace(/^\+/, '') && terms.join('') !== s) throw new Error(`chaîne plate illisible : ${str}`);
  return terms.reduce((t, x) => t + D(x), 0n);
};
const evalStr = (str) => {
  let s = String(str).replace(/\s+/g, '');
  const inner = /[([]([^()[\]]*)[)\]]/;
  while (inner.test(s)) s = s.replace(inner, (_, g) => { const v = flat(g); return `+${txt(v)}`.replace('+-', '-'); });
  return flat(s);
};
/** seconde voie : somme des positifs + somme des négatifs, après ajout de l'opposé à chaque retrait */
const twoWay = (str) => {
  let s = String(str).replace(/\s+/g, '');
  const inner = /[([]([^()[\]]*)[)\]]/;
  while (inner.test(s)) s = s.replace(inner, (_, g) => { const v = flat(g); return `+${txt(v)}`.replace('+-', '-'); });
  const terms = (normSigns(s).match(/[+-]?\d+(?:\.\d+)?/g) ?? []).map(D);
  const pos = terms.filter((x) => x > 0n).reduce((a, b) => a + b, 0n); const neg = terms.filter((x) => x < 0n).reduce((a, b) => a + b, 0n);
  return pos + neg;
};
/** les opérandes « tels qu'écrits » d'une chaîne de termes entre parenthèses : [{ op, w }] (op de la tête = '+') */
const bracketTerms = (expr) => {
  const s = expr.replace(/\s+/g, ''); const re = /([+-])?\(([+-]?\d+(?:\.\d+)?)\)/g; const out = []; let m; let used = '';
  while ((m = re.exec(s))) { out.push({ op: m[1] ?? '+', w: D(m[2]) }); used += m[0]; }
  return used === s ? out : null;
};

/* ── énoncés retapés : paramètres de chaque question (clé = id du fichier : q) ── */
const SPECS = [
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-001:q1","kind":"read","n":4,"step":"5","side":-1,"mode":"r","counted":true,"sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-001:q2","kind":"read","n":3,"step":"10","side":1,"mode":"r","counted":true,"sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-001:q3","kind":"read","n":5,"step":"0.5","side":-1,"mode":"r","counted":true,"sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-002:q1","kind":"cmpsym","a":"-3.5","b":"-3.05","mode":"c","counted":true,"opts":[{"v":"<"},{"v":">","misc":"MISC-MUQARANA-NISBIYA-BDG"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-002:q2","kind":"cmpsym","a":"-7","b":"2","mode":"c","counted":true,"opts":[{"v":"<"},{"v":">","misc":"MISC-MUQARANA-NISBIYA-SI"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-002:q3","kind":"cmpsym","a":"-0.8","b":"-0.08","mode":"c","counted":true,"opts":[{"v":"<"},{"v":">","misc":"MISC-MUQARANA-NISBIYA-BDG"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-003:q1","kind":"place","x":"-3","y":"2","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-003:q2","kind":"axis","x":"-2","y":"0","mode":"c","counted":true,"opts":[{"v":"N"},{"v":"Y","misc":"MISC-NUQTA2-ONAXIS"},{"v":"X"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-003:q3","kind":"place","x":"4","y":"-5","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-004:q1","kind":"calc","expr":"(-6)+(+2.5)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-004:q2","kind":"calc","expr":"(+5)-(-7)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SUBNOFLIP","MISC-JAMNISB-FLIPBOTH"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-004:q3","kind":"calc","expr":"(-4.5)+(-3.5)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SIGNLOST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-005:q1","kind":"calc","expr":"(+9)-(+14)+(-3)-(-8)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-005:q2","kind":"calc","expr":"(-12)+(+5)-(+6)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-005:q3","kind":"calc","expr":"-7+3-5+9","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-006:q1","kind":"dist","a":"-6","b":"-1","mode":"r","counted":true,"sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-006:q2","kind":"dist","a":"-3","b":"4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-006:q3","kind":"dist","a":"2.5","b":"-1.5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-007:q1","kind":"ord","vals":["-2.5","-4","0","1.5"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["-4","0","-2.5","1.5"]},{"v":["-4","-2.5","0","1.5"]},{"v":["0","1.5","-2.5","-4"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["1.5","0","-2.5","-4"],"misc":"MISC-MUQARANA-NISBIYA-OD"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-007:q2","kind":"dist","a":"-4","b":"1.5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-007:q3","kind":"calc","expr":"(+8)-(-3)+(-5)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-008:q1","kind":"change","from":"-2","to":"-6","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-008:q2","kind":"change","from":"1.5","to":"-2","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-008:q3","kind":"ord","vals":["-6","-2","3","-5"],"dir":"desc","mode":"c","counted":true,"opts":[{"v":["-6","-5","-2","3"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["3","-2","-5","-6"]},{"v":["-6","-5","3","-2"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["3","-5","-2","-6"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-009:q1","kind":"symx","x":"-3","y":"2","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-009:q2","kind":"symy","x":"4","y":"-1","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-009:q3","kind":"place","x":"-1.5","y":"2.5","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-010:q1","kind":"calc","expr":"(+15)-[(-4)+(+9)]","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-010:q2","kind":"cmpsym","a":"-2.6","b":"-2.06","mode":"c","counted":true,"opts":[{"v":"<"},{"v":">","misc":"MISC-MUQARANA-NISBIYA-BDG"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l1-010:q3","kind":"dist","a":"-2.5","b":"4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-001:q1","kind":"calc","expr":"(-9)+(-14)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SIGNLOST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-001:q2","kind":"calc","expr":"(+16)-(+31)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SUBNOFLIP","MISC-JAMNISB-FLIPBOTH"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-001:q3","kind":"calc","expr":"(-3)-(-26)+(+48)-(+29)+(-19)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-001:q4","kind":"calc","expr":"[(-12)+(+22)]-[(-25)-(+25)]","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-002:q1","kind":"calc","expr":"(-7)+(-18)","mode":"c","counted":true,"sigs":["MISC-JAMNISB-SIGNLOST"],"opts":[{"v":"-24"},{"v":"25","misc":"MISC-JAMNISB-SIGNLOST"},{"v":"-26"},{"v":"-25"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-002:q2","kind":"calc","expr":"(+14)-(+40)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SUBNOFLIP","MISC-JAMNISB-FLIPBOTH"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-002:q3","kind":"calc","expr":"(-5)-(-31)+(+27)-(+13)+(-15)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-002:q4","kind":"calc","expr":"[(-8)+(+20)]-[(-14)-(+16)]","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-003:q1","kind":"calc","expr":"(-6)+(-9)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SIGNLOST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-003:q2","kind":"calc","expr":"(+23)-(+31)","mode":"c","counted":true,"sigs":["MISC-JAMNISB-SUBNOFLIP","MISC-JAMNISB-FLIPBOTH"],"opts":[{"v":"-7"},{"v":"-8"},{"v":"54","misc":"MISC-JAMNISB-SUBNOFLIP"},{"v":"8","misc":"MISC-JAMNISB-FLIPBOTH"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-003:q3","kind":"calc","expr":"(-4)-(-17)+(+28)-(+9)+(-17)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-003:q4","kind":"calc","expr":"[(-13)+(+25)]-[(-20)-(+35)]","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-004:q1","kind":"calc","expr":"(-11)+(-27)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SIGNLOST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-004:q2","kind":"calc","expr":"(+18)-(+26)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SUBNOFLIP","MISC-JAMNISB-FLIPBOTH"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-004:q3","kind":"calc","expr":"(-9)-(-40)+(+35)-(+15)+(-13)","mode":"c","counted":true,"sigs":["MISC-JABRI-NOTURN"],"opts":[{"v":"-12","misc":"MISC-JABRI-NOTURN"},{"v":"39"},{"v":"-38"},{"v":"38"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-004:q4","kind":"calc","expr":"[(-16)+(+31)]-[(-18)-(+12)]","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-005:q1","kind":"calc","expr":"(-4.5)+(-2.5)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SIGNLOST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-005:q2","kind":"calc","expr":"(+6.5)-(+9)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SUBNOFLIP","MISC-JAMNISB-FLIPBOTH"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-005:q3","kind":"calc","expr":"(-1.5)-(-10)+(+2.5)-(+4)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-005:q4","kind":"calc","expr":"[(-3.5)+(+8)]-[(-6)-(+4.5)]","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-006:q1","kind":"mid","a":"-5","b":"3","mode":"r","counted":true,"sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-006:q2","kind":"opp","a":"-5","mode":"r","counted":true,"sigs":["MISC-TALIM2-OPPSAME"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-006:q3","kind":"dist","a":"3","b":"-2","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-006:q4","kind":"dist","a":"-1","b":"5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-007:q1","kind":"mid","a":"-6","b":"4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-007:q2","kind":"opp","a":"-6","mode":"r","counted":true,"sigs":["MISC-TALIM2-OPPSAME"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-007:q3","kind":"dist","a":"4","b":"-1","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-007:q4","kind":"dist","a":"-1","b":"6","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-008:q1","kind":"mid","a":"-4.5","b":"2.5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-008:q2","kind":"dist","a":"-4.5","b":"-1","mode":"r","counted":true,"sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-008:q3","kind":"dist","a":"2.5","b":"-1","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-008:q4","kind":"opp","a":"2.5","mode":"r","counted":true,"sigs":["MISC-TALIM2-OPPSAME"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-009:q1","kind":"mid","a":"-8","b":"6","mode":"r","counted":true,"sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-009:q2","kind":"dist","a":"-8","b":"-3","mode":"r","counted":true,"sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-009:q3","kind":"dist","a":"6","b":"-3","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-009:q4","kind":"cmpsym","a":"-8","b":"-3","mode":"c","counted":true,"opts":[{"v":"<"},{"v":">","misc":"MISC-MUQARANA-NISBIYA-BDG"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-010:q1","kind":"mid","a":"-2.5","b":"3.5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-010:q2","kind":"dist","a":"-2.5","b":"-0.5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-010:q3","kind":"dist","a":"3.5","b":"-0.5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l2-010:q4","kind":"ord","vals":["-2.5","3.5","-0.5","0.5"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["3.5","0.5","-0.5","-2.5"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["-2.5","0.5","-0.5","3.5"]},{"v":["-2.5","-0.5","0.5","3.5"]},{"v":["-0.5","0.5","-2.5","3.5"],"misc":"MISC-MUQARANA-NISBIYA-SBD"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-001:q1","kind":"ord","vals":["-3","1","-4.5","0","-1"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["-4.5","-1","-3","0","1"]},{"v":["-4.5","-3","-1","0","1"]},{"v":["0","-1","1","-3","-4.5"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["1","0","-1","-3","-4.5"],"misc":"MISC-MUQARANA-NISBIYA-OD"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-001:q2","kind":"change","from":"-3","to":"1","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-001:q3","kind":"dist","a":"-4.5","b":"1","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-001:q4","kind":"calc","expr":"(+4)+(-5.5)+(+4.5)+(-1)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-002:q1","kind":"dist","a":"-120","b":"480","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-002:q2","kind":"calc","expr":"(-120)+(+600)-(+250)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-002:q3","kind":"ord","vals":["-120","480","-45","230"],"dir":"desc","mode":"c","counted":true,"opts":[{"v":["480","230","-120","-45"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["-120","-45","230","480"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["480","-45","230","-120"]},{"v":["480","230","-45","-120"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-002:q4","kind":"dist","a":"-120","b":"-45","mode":"r","counted":true,"sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-003:q1","kind":"calc","expr":"9+(+3)-(+1)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-003:q2","kind":"calc","expr":"9+(-5)-(+1)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-003:q3","kind":"ord","vals":["1","3","-5","9","-8"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["1","3","-5","-8","9"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["-8","1","-5","3","9"]},{"v":["9","3","1","-5","-8"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["-8","-5","1","3","9"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-003:q4","kind":"dist","a":"-5","b":"9","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-004:q1","kind":"change","from":"-5.5","to":"2","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-004:q2","kind":"change","from":"2","to":"-1.5","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-004:q3","kind":"calc","expr":"(+7.5)+(-3.5)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-004:q4","kind":"cmpsym","a":"-5.5","b":"-1.5","mode":"c","counted":true,"opts":[{"v":"<"},{"v":">","misc":"MISC-MUQARANA-NISBIYA-BDG"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-005:q1","kind":"change","from":"-35","to":"-12.5","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-005:q2","kind":"dist","a":"-35","b":"4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-005:q3","kind":"ord","vals":["-35","-12.5","0","-20"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["0","-20","-12.5","-35"]},{"v":["0","-12.5","-20","-35"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["-35","-12.5","-20","0"]},{"v":["-35","-20","-12.5","0"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-005:q4","kind":"calc","expr":"(-35)+(+22.5)-(-10)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-006:q1","kind":"calc","expr":"(+4500)-(+1200)+(-2300)-(-800)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-006:q2","kind":"calc","expr":"(-1800)+(+950)+(-700)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-006:q3","kind":"cmpsym","a":"-2250","b":"-2550","mode":"c","counted":true,"opts":[{"v":"<","misc":"MISC-MUQARANA-NISBIYA-BDG"},{"v":">"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-006:q4","kind":"dist","a":"-1550","b":"1800","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-007:q1","kind":"calc","expr":"(-3)+(+10)+(-6)+(+4)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-007:q2","kind":"ord","vals":["-3","7","1","5"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["1","-3","5","7"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["7","5","1","-3"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["-3","5","1","7"]},{"v":["-3","1","5","7"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-007:q3","kind":"dist","a":"-3","b":"7","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-007:q4","kind":"change","from":"7","to":"1","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-008:q1","kind":"change","from":"4","to":"-18","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-008:q2","kind":"dist","a":"-18","b":"4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-008:q3","kind":"ynrel","lhs":"(+4)-(+22)","op":"=","rhs":"-18","mode":"c","counted":true,"opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-008:q4","kind":"ord","vals":["-18","4","-6","-12"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["-18","-6","-12","4"]},{"v":["-18","-12","-6","4"]},{"v":["4","-6","-12","-18"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["4","-12","-6","-18"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-009:q1","kind":"calc","expr":"(+3)+(-2)+(-4)+(+1)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-009:q2","kind":"ord","vals":["3","-2","-4","1","0"],"dir":"desc","mode":"c","counted":true,"opts":[{"v":["-4","-2","0","1","3"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["3","0","1","-2","-4"]},{"v":["3","1","0","-2","-4"]},{"v":["-4","3","-2","1","0"],"misc":"MISC-MUQARANA-NISBIYA-SBD"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-009:q3","kind":"dist","a":"-4","b":"3","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-009:q4","kind":"cmpsym","a":"-4","b":"-2","mode":"c","counted":true,"opts":[{"v":"<"},{"v":">","misc":"MISC-MUQARANA-NISBIYA-BDG"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-010:q1","kind":"change","from":"-15","to":"120","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-010:q2","kind":"calc","expr":"(+120)+(-45)+(+30)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-010:q3","kind":"dist","a":"-15","b":"105","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l3-010:q4","kind":"ord","vals":["-15","120","105","-45"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["120","105","-15","-45"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["-15","-45","105","120"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["-45","-15","105","120"]},{"v":["-45","105","-15","120"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-001:q1","kind":"axis","x":"0","y":"4","mode":"c","counted":true,"opts":[{"v":"X"},{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-001:q2","kind":"axis","x":"-4","y":"0","mode":"c","counted":true,"opts":[{"v":"N"},{"v":"Y","misc":"MISC-NUQTA2-ONAXIS"},{"v":"X"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-001:q3","kind":"symx","x":"0","y":"4","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-001:q4","kind":"symy","x":"-4","y":"0","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-001:q5","kind":"cost","n":32,"price":450,"mode":"r","counted":false,"sigs":["MISC-NUQTA2-COSTADD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-002:q1","kind":"dist","a":"-3","b":"2","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-002:q2","kind":"dist","a":"-5","b":"4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-002:q3","kind":"area","w":"9","h":"5","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-002:q4","kind":"cost","n":45,"price":600,"mode":"r","counted":false,"sigs":["MISC-NUQTA2-COSTADD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-003:q1","kind":"rectpt","E":["-2","3"],"F":["5","3"],"G":["5","-1"],"mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-003:q2","kind":"dist","a":"-2","b":"5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-003:q3","kind":"dist","a":"3","b":"-1","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-003:q4","kind":"area","w":"7","h":"4","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-003:q5","kind":"cost","n":28,"price":350,"mode":"r","counted":false,"sigs":["MISC-NUQTA2-COSTADD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-004:q1","kind":"rectpt","E":["-6","4"],"F":["1","4"],"G":["1","-2"],"mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-004:q2","kind":"dist","a":"-6","b":"1","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-004:q3","kind":"dist","a":"4","b":"-2","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-004:q4","kind":"area","w":"7","h":"6","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-004:q5","kind":"cost","n":42,"price":120,"mode":"r","counted":false,"sigs":["MISC-NUQTA2-COSTADD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-005:q1","kind":"rectpt","E":["-4","3"],"F":["6","3"],"G":["6","-2"],"mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-005:q2","kind":"dist","a":"-4","b":"6","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-005:q3","kind":"dist","a":"3","b":"-2","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-005:q4","kind":"area","w":"10","h":"5","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-005:q5","kind":"symx","x":"-4","y":"3","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-006:q1","kind":"rectpt","E":["-3.5","2"],"F":["2.5","2"],"G":["2.5","-2"],"mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-006:q2","kind":"dist","a":"-3.5","b":"2.5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-006:q3","kind":"dist","a":"2","b":"-2","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-006:q4","kind":"area","w":"6","h":"4","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-006:q5","kind":"cost","n":24,"price":750,"mode":"r","counted":false,"sigs":["MISC-NUQTA2-COSTADD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-007:q1","kind":"rectpt","E":["-7","1"],"F":["2","1"],"G":["2","-4"],"mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-007:q2","kind":"dist","a":"-7","b":"2","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-007:q3","kind":"dist","a":"1","b":"-4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-007:q4","kind":"area","w":"9","h":"5","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-007:q5","kind":"axis","x":"0","y":"-4","mode":"c","counted":true,"opts":[{"v":"N"},{"v":"X"},{"v":"Y"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-008:q1","kind":"rectpt","E":["-8","2"],"F":["4","2"],"G":["4","-3"],"mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-008:q2","kind":"dist","a":"-8","b":"4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-008:q3","kind":"dist","a":"2","b":"-3","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-008:q4","kind":"area","w":"12","h":"5","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-008:q5","kind":"cost","n":60,"price":90,"mode":"r","counted":false,"sigs":["MISC-NUQTA2-COSTADD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-009:q1","kind":"rectpt","E":["-2","1"],"F":["5","1"],"G":["5","-3"],"mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-009:q2","kind":"dist","a":"-2","b":"5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-009:q3","kind":"dist","a":"1","b":"-3","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-009:q4","kind":"area","w":"7","h":"4","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-009:q5","kind":"symy","x":"5","y":"-3","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-010:q1","kind":"rectpt","E":["-9","3"],"F":["1","3"],"G":["1","0"],"mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-010:q2","kind":"dist","a":"-9","b":"1","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-010:q3","kind":"dist","a":"3","b":"0","mode":"r","counted":true,"sigs":["MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-010:q4","kind":"area","w":"10","h":"3","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l4-010:q5","kind":"cost","n":30,"price":260,"mode":"r","counted":false,"sigs":["MISC-NUQTA2-COSTADD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-001:q1","kind":"calc","expr":"(+48000)+(-9500)+(-6200)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-001:q2","kind":"calc","expr":"(-8400)+(-3900)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SIGNLOST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-001:q3","kind":"calc","expr":"(+5200)+(-12100)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-001:q4","kind":"ord","vals":["32300","-12300","-6900"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["-6900","-12300","32300"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["-12300","32300","-6900"]},{"v":["32300","-6900","-12300"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["-12300","-6900","32300"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-001:q5","kind":"calc","expr":"(+32300)+(-12300)+(-6900)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-001:q6","kind":"ynrel","lhs":"(+32300)+(-12300)+(-6900)","op":">","rhs":"0","mode":"c","counted":true,"opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-002:q1","kind":"dist","a":"-6","b":"3.5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-002:q2","kind":"dist","a":"2","b":"17.5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-002:q3","kind":"cmpsym","a":"15.5","b":"9.5","mode":"c","counted":true,"opts":[{"v":"<"},{"v":">"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-002:q4","kind":"change","from":"-6","to":"2","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-002:q5","kind":"ord","vals":["-6","3.5","2","17.5"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["2","3.5","-6","17.5"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["-6","2","3.5","17.5"]},{"v":["17.5","3.5","2","-6"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["-6","3.5","2","17.5"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-003:q1","kind":"dist","a":"-12","b":"800","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-003:q2","kind":"calc","expr":"(-12)-(+45)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-SUBNOFLIP","MISC-JAMNISB-FLIPBOTH"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-003:q3","kind":"ord","vals":["-57","-12","0","800"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["-57","0","-12","800"]},{"v":["0","-12","-57","800"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["800","0","-12","-57"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["-57","-12","0","800"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-003:q4","kind":"dist","a":"-57","b":"800","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-003:q5","kind":"ynrel","lhs":"(-12)-(+45)","op":"<","rhs":"-50","mode":"c","counted":true,"opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-004:q1","kind":"rectpt","E":["-6","4"],"F":["5","4"],"G":["5","-3"],"mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-004:q2","kind":"dist","a":"-6","b":"5","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-004:q3","kind":"dist","a":"4","b":"-3","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-004:q4","kind":"area","w":"11","h":"7","mode":"r","counted":false,"sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-004:q5","kind":"cost","n":77,"price":700,"mode":"r","counted":false,"sigs":["MISC-NUQTA2-COSTADD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-004:q6","kind":"ynrel","lhs":"53900","op":"<","rhs":"60000","mode":"c","counted":true,"opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-005:q1","kind":"calc","expr":"(-4)+(+11)+(-7)+(+5)+(-13)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-005:q2","kind":"calc","expr":"(-4)+(+11)+(-7)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-005:q3","kind":"ord","vals":["-4","7","0","5","-8"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["7","5","0","-4","-8"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["-8","0","-4","5","7"]},{"v":["0","-4","5","7","-8"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["-8","-4","0","5","7"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-005:q4","kind":"dist","a":"-8","b":"7","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-005:q5","kind":"change","from":"-4","to":"-8","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-006:q1","kind":"calc","expr":"10+(+3)-(+1)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-006:q2","kind":"calc","expr":"10+(-5)-(+1)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-006:q3","kind":"dist","a":"-5","b":"4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-006:q4","kind":"ord","vals":["1","3","4","-5"],"dir":"desc","mode":"c","counted":true,"opts":[{"v":["-5","4","3","1"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["4","3","1","-5"]},{"v":["-5","1","3","4"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["4","1","3","-5"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-006:q5","kind":"ynrel","lhs":"(-5)-(+1)","op":"=","rhs":"-6","mode":"c","counted":true,"opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-007:q1","kind":"change","from":"8","to":"2.5","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-007:q2","kind":"change","from":"2.5","to":"-3","mode":"r","counted":true,"sigs":["MISC-JAMNISB-REVERSED","MISC-JAMNISB-ADDINSTEAD"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-007:q3","kind":"calc","expr":"(-5.5)+(-5.5)+(-4.5)+(+5.5)","mode":"r","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-007:q4","kind":"ord","vals":["8","2.5","-3","-7.5","-2"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["-2","2.5","-3","-7.5","8"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["-7.5","-2","-3","2.5","8"]},{"v":["8","2.5","-2","-3","-7.5"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["-7.5","-3","-2","2.5","8"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-007:q5","kind":"dist","a":"-7.5","b":"8","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-008:q1","kind":"calc","expr":"(+15)+(-8)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-008:q2","kind":"calc","expr":"(+12)+(-12)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-008:q3","kind":"cmpsym","a":"7","b":"0","mode":"c","counted":true,"opts":[{"v":"<"},{"v":">"},{"v":"="}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-008:q4","kind":"ord","vals":["7","0","-4","3"],"dir":"desc","mode":"c","counted":true,"opts":[{"v":["7","-4","3","0"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["7","3","0","-4"]},{"v":["-4","0","3","7"],"misc":"MISC-MUQARANA-NISBIYA-OD"},{"v":["7","0","3","-4"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-008:q5","kind":"dist","a":"-4","b":"7","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-009:q1","kind":"calc","expr":"(-18)+(+7)-(+11)+(+9)","mode":"r","counted":true,"sigs":["MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-009:q2","kind":"calc","expr":"(-18)+(+7)","mode":"r","counted":true,"sigs":["MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-009:q3","kind":"dist","a":"-13","b":"3","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-009:q4","kind":"ord","vals":["-18","-11","-13","3"],"dir":"asc","mode":"c","counted":true,"opts":[{"v":["3","-11","-13","-18"],"misc":"MISC-MUQARANA-NISBIYA-SBD"},{"v":["3","-13","-11","-18"]},{"v":["-18","-13","-11","3"]},{"v":["-18","-11","-13","3"]}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-009:q5","kind":"ynrel","lhs":"(-18)+(+7)-(+11)+(+9)","op":"<","rhs":"-13","mode":"c","counted":true,"opts":[{"v":"Y"},{"v":"N"}]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-010:q1","kind":"place","x":"-3","y":"2","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-010:q2","kind":"dist","a":"-3","b":"4","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-010:q3","kind":"dist","a":"2","b":"-3","mode":"r","counted":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-010:q4","kind":"rectpt","E":["-3","2"],"F":["4","2"],"G":["4","-3"],"mode":"p","counted":true,"sigs":[]},
  {"key":"ex-2am-wadiya-idmajiya-adad-nisbiya-2-l5-010:q5","kind":"symx","x":"4","y":"-3","mode":"p","counted":true,"sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"]}
];

const lo2 = (a, b) => (a < b ? a : b);
const hi2 = (a, b) => (a > b ? a : b);

/** la réponse juste d'une question numérique (BigInt centièmes) */
const keyValue = (s) => {
  switch (s.kind) {
    case 'calc': { const v = evalStr(s.expr); if (v !== twoWay(s.expr)) throw new Error('deux voies en désaccord'); return v; }
    case 'dist': return hi2(D(s.a), D(s.b)) - lo2(D(s.a), D(s.b));
    case 'mid': { const t = D(s.a) + D(s.b); if (t % 2n) throw new Error('milieu à 3 décimales'); return t / 2n; }
    case 'change': return D(s.to) - D(s.from);
    case 'opp': return -D(s.a);
    case 'read': return BigInt(s.side) * BigInt(s.n) * D(s.step);
    case 'area': { const p = D(s.w) * D(s.h); if (p % SC) throw new Error('aire à 3 décimales'); return p / SC; }
    case 'cost': return BigInt(s.n) * BigInt(s.price) * SC;
    default: throw new Error(`pas de valeur numérique pour ${s.kind}`);
  }
};
const pointKey = (s) => {
  switch (s.kind) {
    case 'place': return { x: D(s.x), y: D(s.y) };
    case 'symx': return { x: D(s.x), y: -D(s.y) };
    case 'symy': return { x: -D(s.x), y: D(s.y) };
    case 'rectpt': { const E = s.E.map(D); const F = s.F.map(D); const G = s.G.map(D); if (E[1] !== F[1] || F[0] !== G[0]) throw new Error('pas un rectangle'); return { x: E[0], y: G[1] }; }
    default: throw new Error(`pas de point pour ${s.kind}`);
  }
};

/** les erreurs nommées, recalculées */
const FORMULA = {
  'MISC-JAMNISB-SIGNLOST': (s) => { const t = bracketTerms(s.expr); if (!t || t.length !== 2 || t[1].op !== '+' || !(t[0].w < 0n && t[1].w < 0n)) throw new Error('SIGNLOST : deux négatifs ajoutés attendus'); return abs(keyValue(s)); },
  'MISC-JAMNISB-ADDDIST': (s) => { const t = bracketTerms(s.expr); if (!t || t.length !== 2 || t[1].op !== '+' || sgn(t[0].w) * sgn(t[1].w) >= 0n) throw new Error('ADDDIST : signes différents attendus'); const far = abs(t[0].w) > abs(t[1].w) ? t[0].w : t[1].w; return sgn(far) * (abs(t[0].w) + abs(t[1].w)); },
  'MISC-JAMNISB-SUBNOFLIP': (s) => { const t = bracketTerms(s.expr); if (!t || t.length !== 2 || t[1].op !== '-') throw new Error('SUBNOFLIP : un retrait attendu'); return t[0].w + t[1].w; },
  'MISC-JAMNISB-FLIPBOTH': (s) => { const t = bracketTerms(s.expr); if (!t || t.length !== 2 || t[1].op !== '-') throw new Error('FLIPBOTH : un retrait attendu'); return -keyValue(s); },
  'MISC-JABRI-NOTURN': (s) => { const t = bracketTerms(s.expr); if (!t || t.length < 3 || !t.some((x, k) => k > 0 && x.op === '-')) throw new Error('NOTURN : une chaîne avec retrait attendue'); return t.reduce((a, x, k) => a + (k === 0 && x.op === '-' ? -x.w : x.w), 0n); },
  'MISC-MASAFA2-SUBDIST': (s) => { if (sgn(D(s.a)) * sgn(D(s.b)) >= 0n) throw new Error('SUBDIST : points de part et d\'autre'); return abs(abs(D(s.a)) - abs(D(s.b))); },
  'MISC-MASAFA2-ADDSAME': (s) => { if (sgn(D(s.a)) * sgn(D(s.b)) <= 0n) throw new Error('ADDSAME : points du même côté'); return abs(D(s.a)) + abs(D(s.b)); },
  'MISC-MASAFA2-NEGDIST': (s) => -keyValue(s),
  'MISC-MASAFA2-HALFDIST': (s) => abs(D(s.a) - D(s.b)) / 2n,
  'MISC-MASAFA2-SUMNOHALF': (s) => D(s.a) + D(s.b),
  'MISC-JAMNISB-REVERSED': (s) => D(s.from) - D(s.to),
  'MISC-JAMNISB-ADDINSTEAD': (s) => D(s.from) + D(s.to),
  'MISC-TALIM2-OPPSAME': (s) => D(s.a),
  'MISC-TALIM2-UNITIGNORED': (s) => BigInt(s.side) * BigInt(s.n) * SC,
  'MISC-TALIM2-SIGNSIDE': (s) => -keyValue(s),
  'MISC-TALIM2-ADDSTEP': (s) => BigInt(s.side) * (BigInt(s.n) * SC + D(s.step)),
  'MISC-NUQTA2-AREASUM': (s) => D(s.w) + D(s.h),
  'MISC-NUQTA2-AREAPERIM': (s) => 2n * (D(s.w) + D(s.h)),
  'MISC-NUQTA2-COSTADD': (s) => (BigInt(s.n) + BigInt(s.price)) * SC,
};
const POINT_FORMULA = {
  'MISC-NUQTA2-SWAP': (s) => { const k = pointKey(s); return { x: k.y, y: k.x }; },
  'MISC-NUQTA2-SIGNAXIS': (s) => { const k = pointKey(s); if (s.kind !== 'place') throw new Error('SIGNAXIS : un point placé attendu'); return { x: k.x, y: -k.y }; },
  'MISC-NUQTA2-SIGNLEFT': (s) => { const k = pointKey(s); if (s.kind !== 'place') throw new Error('SIGNLEFT : un point placé attendu'); return { x: -k.x, y: k.y }; },
  'MISC-NUQTA2-SYMMIX': (s) => { if (s.kind === 'symx') return { x: -D(s.x), y: D(s.y) }; if (s.kind === 'symy') return { x: D(s.x), y: -D(s.y) }; throw new Error('SYMMIX : une symétrie attendue'); },
  'MISC-NUQTA2-BOTHSIGNS': (s) => { if (s.kind !== 'symx' && s.kind !== 'symy') throw new Error('BOTHSIGNS : une symétrie attendue'); return { x: -D(s.x), y: -D(s.y) }; },
};
const samePt = (a, b) => a.x === b.x && a.y === b.y;

/* ── QCM ── */
const cmpRel = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
const chainHolds = (list, dir) => list.every((x, i) => i === 0 || (dir === 'asc' ? list[i - 1] < x : list[i - 1] > x));
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const isTrue = (s, o) => {
  switch (s.kind) {
    case 'calc': case 'dist': return D(o.v) === keyValue(s);
    case 'cmpsym': return o.v === cmpRel(D(s.a), D(s.b));
    case 'ord': { const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0); const l = o.v.map(D); return chainHolds(l, s.dir) && sameList([...l].sort(cmp), [...s.vals.map(D)].sort(cmp)); }
    case 'ynrel': {
      const l = evalStr(s.lhs); const r = /[()[\]]/.test(s.rhs) ? evalStr(s.rhs) : D(s.rhs);
      const holds = s.op === '=' ? l === r : s.op === '<' ? l < r : l > r;
      return o.v === (holds ? 'Y' : 'N');
    }
    case 'axis': return o.v === (D(s.y) === 0n ? 'X' : 'Y');
    default: throw new Error(`QCM inconnu : ${s.kind}`);
  }
};
const errorMatches = (s, id, o) => {
  if (s.kind === 'cmpsym') {
    const a = D(s.a); const b = D(s.b); const dr = cmpRel(abs(a), abs(b));
    if (id === 'MISC-MUQARANA-NISBIYA-BDG') return a < 0n && b < 0n && o.v === dr && o.v !== cmpRel(a, b);
    if (id === 'MISC-MUQARANA-NISBIYA-SI') return sgn(a) * sgn(b) < 0n && o.v === dr && o.v !== cmpRel(a, b);
    return false;
  }
  if (s.kind === 'ord') {
    const vals = s.vals.map(D); const byDist = [...vals].sort((x, y) => (abs(x) < abs(y) ? -1 : abs(x) > abs(y) ? 1 : x < y ? -1 : x > y ? 1 : 0));
    const key = [...vals].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)); const keyDir = s.dir === 'asc' ? key : [...key].reverse();
    const list = o.v.map(D);
    if (id === 'MISC-MUQARANA-NISBIYA-SBD') return sameList(list, s.dir === 'asc' ? byDist : [...byDist].reverse()) && !sameList(list, keyDir);
    if (id === 'MISC-MUQARANA-NISBIYA-OD') return sameList(list, [...keyDir].reverse());
    return false;
  }
  if (s.kind === 'axis') return id === 'MISC-NUQTA2-ONAXIS' && o.v !== (D(s.y) === 0n ? 'X' : 'Y') && o.v !== 'N';
  const f = FORMULA[id]; if (!f) return false;
  return D(o.v) === f(s);
};

/* ── relecture du texte ── */
const numsOf = (c) => (c.replace(/\{,\}/g, '.').match(/\d+(?:\.\d+)?/g) ?? []);
const stripMath = (t) => t.replace(/\$[^$]*\$/g, ' ');
const optionValue = (s, content) => {
  const c = content.replace(/\$/g, '').trim();
  switch (s.kind) {
    case 'calc': case 'dist': return txt(D(c.replace(/^\+/, '')));
    case 'cmpsym': return c;
    case 'ord': return c.replace(/\{,\}/g, '.').split(/\s[<>]\s/).map((x) => txt(D(x)));
    case 'ynrel': return c === 'نعم' ? 'Y' : c === 'لا' ? 'N' : null;
    case 'axis': return c === 'محور الفواصل' ? 'X' : c === 'محور التراتيب' ? 'Y' : c === 'لا هذا ولا ذاك' ? 'N' : null;
    default: return null;
  }
};
const sameValue = (a, b) => (Array.isArray(a) || Array.isArray(b) ? Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => sameValue(x, b[i])) : a === b);

/** nombres que l'énoncé doit imprimer (valeurs retapées) */
const shown = (s) => {
  switch (s.kind) {
    case 'calc': return s.expr.match(/\d+(?:\.\d+)?/g);
    case 'dist': case 'mid': return [s.a, s.b];
    case 'change': return [s.from, s.to];
    case 'opp': return [s.a];
    case 'read': return [String(s.n), s.step];
    case 'cmpsym': return [s.a, s.b];
    case 'ord': return s.vals;
    case 'ynrel': return [...s.lhs.match(/\d+(?:\.\d+)?/g), ...(s.rhs.match(/\d+(?:\.\d+)?/g) ?? [])];
    case 'axis': case 'place': case 'symx': case 'symy': return [s.x, s.y];
    case 'rectpt': return [...s.E, ...s.F, ...s.G];
    case 'area': return [s.w, s.h];
    case 'cost': return [String(s.n), String(s.price)];
    default: return [];
  }
};
const choiceIndex = (s) => {
  const hits = s.opts.map((o, k) => (isTrue(s, o) ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`${s.key} : ${hits.length} options justes`);
  return hits[0];
};
const answerOf = (s) => {
  if (s.mode === 'c') return C('ABCDEF'[choiceIndex(s)]);
  if (s.mode === 'p') { const k = pointKey(s); return PT(txt(k.x), txt(k.y)); }
  return R(txt(keyValue(s)));
};

export const ORACLE = Object.fromEntries(SPECS.map((s) => [s.key, answerOf(s)]));

const FORBIDDEN = [/الكتاب(?!ة)/, /ص\s*\d/, /خنزير/, /خمر/, /قمار/, /ربا/, /فائدة/, /فوائد/, /يانصيب/, /نرد/, /كازينو/, /ورق اللعب/, /الميلاد/, /قرض/, /نقطة التعلّم/, /نقاط التعلّم/];
const LP = 'P1';
const UNCOUNTED = new Set(['area', 'cost']);

/** relit les fichiers du banc */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  let firstCorrect = 0; let nChoice = 0;
  for (const s of SPECS) {
    try {
      const q = byKey.get(s.key);
      if (!q) { errs.push(`${s.key} : question absente`); continue; }
      const lp = q.learningPoints?.[0]?.code;
      if (lp !== `2am_wadiya-idmajiya-adad-nisbiya-2_${LP}`) errs.push(`${s.key} : الكفاءة ${lp} ≠ ${LP}`);
      const unc = UNCOUNTED.has(s.kind);
      if ((q.counted === false) !== unc) errs.push(`${s.key} : counted=${q.counted} mais ${s.kind} ${unc ? 'est' : "n'est pas"} une étape non comptée`);
      /* nombres imprimés */
      const printed = numsOf(q.statement).map((x) => abs(D(x)));
      for (const v of shown(s)) {
        const i = printed.indexOf(abs(D(v)));
        if (i < 0) errs.push(`${s.key} : l'énoncé n'imprime pas ${v}`); else printed.splice(i, 1);
      }
      if (s.mode === 'r') {
        const key = keyValue(s);
        if (q.answerType !== 'rational') { errs.push(`${s.key} : devrait être rational`); continue; }
        if (D(String(q.expectedAnswer)) !== key) errs.push(`${s.key} : clé ${q.expectedAnswer} ≠ ${txt(key)}`);
        const got = new Set();
        for (const sg of q.misconceptionSignatures ?? []) {
          got.add(sg.id);
          if (D(String(sg.value)) === key) errs.push(`${s.key} : signature ${sg.id} = la bonne réponse`);
          if (!errorMatches(s, sg.id, { v: String(sg.value) })) errs.push(`${s.key} : signature ${sg.id}=${sg.value} ≠ l'erreur nommée`);
        }
        const want = new Set(s.sigs ?? []);
        if (want.size !== got.size || [...want].some((i) => !got.has(i))) errs.push(`${s.key} : signatures [${[...got]}] ≠ retapées [${[...want]}]`);
        /* le corrigé aboutit à la clé */
        const res = q.solution?.result; if (res === undefined || D(String(res)) !== key) errs.push(`${s.key} : solution.result ${res} ≠ ${txt(key)}`);
      } else if (s.mode === 'p') {
        if (q.answerType !== 'point') { errs.push(`${s.key} : devrait être point`); continue; }
        const key = pointKey(s);
        if (D(q.expectedAnswer.x) !== key.x || D(q.expectedAnswer.y) !== key.y) errs.push(`${s.key} : clé (${q.expectedAnswer.x} ; ${q.expectedAnswer.y}) ≠ (${txt(key.x)} ; ${txt(key.y)})`);
        const got = new Set();
        for (const sg of q.misconceptionSignatures ?? []) {
          got.add(sg.id); const v = { x: D(sg.value.x), y: D(sg.value.y) };
          if (samePt(v, key)) errs.push(`${s.key} : signature ${sg.id} = la bonne réponse`);
          const f = POINT_FORMULA[sg.id]; let ok = false; try { ok = !!f && samePt(f(s), v); } catch (e) { errs.push(`${s.key} : ${e.message}`); }
          if (!ok) errs.push(`${s.key} : signature ${sg.id} ≠ l'erreur nommée`);
        }
        const want = new Set(s.sigs ?? []);
        for (const w of want) if (!got.has(w) && (q.misconceptionSignatures ?? []).length < 3) errs.push(`${s.key} : signature ${w} retapée mais absente`);
        for (const g of got) if (!want.has(g)) errs.push(`${s.key} : signature ${g} non retapée`);
      } else {
        if (q.answerType !== 'choice') { errs.push(`${s.key} : devrait être choice`); continue; }
        if (q.choices.length !== s.opts.length) errs.push(`${s.key} : ${q.choices.length} options, ${s.opts.length} retapées`);
        const good = choiceIndex(s);
        nChoice++; if (good === 0) firstCorrect++;
        q.choices.forEach((c, k) => {
          const o = s.opts[k]; if (!o) return;
          const read = optionValue(s, c.content);
          if (!sameValue(read, o.v)) errs.push(`${s.key} : option ${c.id} « ${c.content} » ≠ ${JSON.stringify(o.v)}`);
          if (s.kind === 'ord') { const sym = c.content.includes('<') ? 'asc' : c.content.includes('>') ? 'desc' : null; if (sym !== s.dir) errs.push(`${s.key} : option ${c.id} n'utilise pas le sens ${s.dir}`); }
          if (c.isCorrect !== (k === good)) errs.push(`${s.key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${k === good}`);
          if (c.misconceptionId) {
            if (k === good) errs.push(`${s.key} : la bonne option porte ${c.misconceptionId}`);
            else if (!errorMatches(s, c.misconceptionId, o)) errs.push(`${s.key} : option ${c.id} ≠ erreur ${c.misconceptionId}`);
          }
          if ((o.misc ?? null) !== (c.misconceptionId ?? null)) errs.push(`${s.key} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${o.misc}`);
          if (k !== good && isTrue(s, o)) errs.push(`${s.key} : le distracteur ${c.id} est vrai`);
        });
      }
      /* calc : l'énoncé ne contient pas seulement les nombres — la chaîne retapée y figure ou ses nombres */
    } catch (e) { errs.push(`${s.key} : ${e.message}`); }
  }
  /* texte de toutes les questions du banc : renvois, termes interdits, lettres, unités, nombres signés, provenance */
  for (const b of bank) {
    if (b.q.answerType !== 'selfCheck' && !(b.key in ORACLE)) errs.push(`${b.key} : sans vérification`);
    const strings = [b.q.statement, b.q.feedback?.correct, b.q.feedback?.incorrect, b.q.answerFormat,
      ...(b.q.hints ?? []).map((h) => h.content), ...(b.q.solution?.lines ?? []), ...(b.q.choices ?? []).map((c) => c.content)].filter(Boolean);
    for (const t of strings) {
      for (const re of FORBIDDEN) if (re.test(t)) errs.push(`${b.key} : terme interdit ${re} dans « ${t} »`);
      const plain = stripMath(t);
      if (/[A-Za-z]/.test(plain)) errs.push(`${b.key} : lettres latines hors de $…$ dans « ${t} »`);
      if (/[+\-−]\s?\d/.test(plain)) errs.push(`${b.key} : nombre signé hors de $…$ dans « ${t} »`);
      if (/\$[^$]*\d\s*\$\s*(cm|mm|m|km|kg|g|DA)\b/.test(t)) errs.push(`${b.key} : valeur et unité latine séparées dans « ${t} »`);
      if (/\(\s*a\s*\+\s*b\s*\)\s*\/|\\frac\{\s*a\s*\+\s*b/.test(t)) errs.push(`${b.key} : formule du milieu énoncée dans « ${t} »`);
      if (/\\\\(frac|times|mathrm)/.test(t)) errs.push(`${b.key} : antislash doublé dans « ${t} »`);
    }
    if (/نغيّر إشارات/.test((b.q.solution?.lines ?? []).join(' '))) errs.push(`${b.key} : « نغيّر إشارات » dans le corrigé`);
  }
  if (nChoice > 4 && firstCorrect === nChoice) errs.push('la bonne option est toujours la première');
  return errs;
}
