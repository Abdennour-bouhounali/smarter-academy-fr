// Oracle du banc « masafa-nuqtatayn » (المسافة بين نقطتين على مستقيم مدرّج, 2AM, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, en arithmétique indépendante sur les CENTIÈMES :
//  - un nombre relatif écrit « -4.5 » devient un BigInt (×100) : aucun flottant, aucun import de packages/core ;
//  - la distance de deux abscisses est « la plus grande moins la plus petite » (jamais négative) ; deux points à la distance d d'un
//    point M sont M + d et M − d ; le milieu est « la plus petite abscisse + la moitié de la distance » et n'est accepté que s'il
//    s'écrit avec au plus 2 décimales (jamais de formule (a+b)/2 dans le texte : on le refuse) ;
//  - un trajet est la somme des distances de ses tronçons, un nombre de graduations est le quotient EXACT distance ÷ valeur de la
//    graduation, un déplacement commun des deux points ne change pas la distance ;
//  - chaque QCM n'a qu'une option juste : chaque option est retapée en valeur (ordre = ordre des choix du fichier) et jugée par le
//    calcul ; chaque distracteur ou signature nommé MISC-MASAFA2-* est RECALCULÉ depuis son erreur (voir FORMULA) et est FAUX :
//    SUBDIST (distances au zéro soustraites alors que les points sont de part et d'autre), ADDSAME (distances au zéro additionnées
//    alors que les points sont du même côté), NEGDIST / ORDERSWAP (la plus petite moins la plus grande, ou « BA = −AB »), ONEANSWER
//    (une seule des deux positions), SIGNSWAP (−(M ± d)), HALFDIST (la moitié de la distance seule), SUMNOHALF (la somme sans la
//    moitié) ;
//  - audit(bank) relit les fichiers : clé, options, signatures, الكفاءة, counted, nombres imprimés dans l'énoncé, et le texte
//    (aucun renvoi au manuel, aucun terme interdit, aucune unité latine hors de $…$, aucun nombre signé hors de $…$).
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.

const SC = 100n;
const abs = (x) => (x < 0n ? -x : x);
const sgn = (x) => (x < 0n ? -1 : x > 0n ? 1 : 0);
const lo2 = (a, b) => (a < b ? a : b);
const hi2 = (a, b) => (a > b ? a : b);
const D = (v) => {
  let s = String(v).replace('{,}', '.').replace('−', '-').replace(',', '.');
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
const R = (v) => ({ value: String(v) });
const C = (id) => ({ choiceId: id });

/* ── énoncés retapés : paramètres de chaque question et options (dans l'ordre des choix) ── */
const SPECS = [
  {"key":"ex-2am-masafa-nuqtatayn-l1-001:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-4","b":"-9","n1":"K","n2":"L","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-001:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-12","b":"-5.5","n1":"C","n2":"D","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-001:q3","kind":"dist","mode":"c","lp":1,"cf":false,"a":"-8","b":"-2.5","n1":"E","n2":"F","opts":[{"v":"5.5"},{"v":"10.5","misc":"MISC-MASAFA2-ADDSAME"},{"v":"-5.5","misc":"MISC-MASAFA2-NEGDIST"},{"v":"8"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-002:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-4","b":"-24","n1":"E","n2":"G","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-002:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"16","b":"-4","n1":"F","n2":"E","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-002:q3","kind":"ismid","mode":"c","lp":2,"cf":false,"e":"-4","g":"-24","f":"16","opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-003:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-3","b":"8","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-003:q2","kind":"dist","mode":"c","lp":1,"cf":false,"a":"-7","b":"4","opts":[{"v":"3","misc":"MISC-MASAFA2-SUBDIST"},{"v":"-11","misc":"MISC-MASAFA2-NEGDIST"},{"v":"11"},{"v":"7"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-003:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"2.5","b":"-4","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-004:q1","kind":"dist","mode":"c","lp":1,"cf":false,"a":"3","b":"11","opts":[{"v":"14","misc":"MISC-MASAFA2-ADDSAME"},{"v":"-8","misc":"MISC-MASAFA2-NEGDIST"},{"v":"11"},{"v":"8"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-004:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"1.5","b":"9","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-004:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"12.5","b":"6","n1":"C","n2":"D","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-005:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"0","b":"-6","n1":"O","n2":"A","sigs":["MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-005:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"0","b":"9.5","n1":"O","n2":"B","sigs":["MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-005:q3","kind":"dist","mode":"c","lp":1,"cf":false,"a":"-7.5","b":"0","n1":"C","n2":"O","opts":[{"v":"-7.5","misc":"MISC-MASAFA2-NEGDIST"},{"v":"7.5"},{"v":"8.5"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-006:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-1.8","b":"2.7","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-006:q2","kind":"dist","mode":"c","lp":1,"cf":false,"a":"-4.6","b":"-1.3","n1":"C","n2":"D","opts":[{"v":"5.9","misc":"MISC-MASAFA2-ADDSAME"},{"v":"3.3"},{"v":"-3.3","misc":"MISC-MASAFA2-NEGDIST"},{"v":"4.6"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-006:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"0.7","b":"3.25","n1":"E","n2":"F","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-007:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-3","b":"2.5","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-007:q2","kind":"gradgap","mode":"r","lp":1,"cf":false,"a":"-3","b":"2.5","step":"0.5","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-007:q3","kind":"gradgap","mode":"r","lp":1,"cf":false,"a":"-1.5","b":"0.75","step":"0.25","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-008:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"6","b":"-9","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-008:q2","kind":"dist","mode":"r","lp":2,"cf":false,"a":"-9","b":"6","n1":"B","n2":"A","rev":true,"sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-ORDERSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-008:q3","kind":"ynsym","mode":"c","lp":2,"cf":false,"a":"6","b":"-9","opts":[{"v":"Y"},{"v":"N","misc":"MISC-MASAFA2-ORDERSWAP"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-009:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-4.2","b":"0.9","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-009:q2","kind":"dist","mode":"c","lp":1,"cf":false,"a":"-6","b":"-14","n1":"C","n2":"D","opts":[{"v":"20","misc":"MISC-MASAFA2-ADDSAME"},{"v":"-8","misc":"MISC-MASAFA2-NEGDIST"},{"v":"14"},{"v":"8"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-009:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-150","b":"65","n1":"E","n2":"F","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-010:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-6","b":"2.5","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-010:q2","kind":"dist","mode":"c","lp":1,"cf":false,"a":"-2","b":"-9","n1":"C","n2":"D","opts":[{"v":"7"},{"v":"11","misc":"MISC-MASAFA2-ADDSAME"},{"v":"-7","misc":"MISC-MASAFA2-NEGDIST"},{"v":"9"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l1-010:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"1","b":"8","n1":"E","n2":"F","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-001:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-5","b":"7","n1":"E","n2":"F","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-001:q2","kind":"mid","mode":"r","lp":2,"cf":false,"a":"7","b":"-5","n1":"F","n2":"E","I":"G","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-002:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-4.5","b":"3","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-002:q3","kind":"at","mode":"r","lp":2,"cf":false,"m":"-4.5","d":"3","side":1,"nn":"N","sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-003:q1","kind":"at","mode":"r","lp":2,"cf":false,"m":"-1.5","d":"3","side":1,"sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-003:q2","kind":"at","mode":"r","lp":2,"cf":false,"m":"-1.5","d":"3","side":-1,"sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-003:q3","kind":"atcount","mode":"c","lp":2,"cf":false,"m":"-1.5","d":"3","opts":[{"v":1,"misc":"MISC-MASAFA2-ONEANSWER"},{"v":2},{"v":0},{"v":3}]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-004:q1","kind":"atpair","mode":"c","lp":2,"cf":false,"m":"-1","d":"3","opts":[{"v":["-2","4"],"misc":"MISC-MASAFA2-SIGNSWAP"},{"v":["2"],"misc":"MISC-MASAFA2-ONEANSWER"},{"v":["-4","2"]},{"v":["-4"],"misc":"MISC-MASAFA2-ONEANSWER"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-004:q2","kind":"at","mode":"r","lp":2,"cf":false,"m":"2","d":"5","side":-1,"sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-005:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-8","b":"-3.5","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-005:q2","kind":"ynneg","mode":"c","lp":2,"cf":false,"a":"-8","b":"-3.5","opts":[{"v":"Y","misc":"MISC-MASAFA2-NEGDIST"},{"v":"N"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-005:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"7","b":"-2","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-006:q1","kind":"at","mode":"r","lp":2,"cf":false,"m":"1.25","d":"2.5","side":-1,"sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-006:q2","kind":"at","mode":"r","lp":2,"cf":false,"m":"1.25","d":"2.5","side":1,"sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-006:q3","kind":"atpair","mode":"c","lp":2,"cf":false,"m":"-2.5","d":"1.5","opts":[{"v":["-4","-1"]},{"v":["1","4"],"misc":"MISC-MASAFA2-SIGNSWAP"},{"v":["-1"],"misc":"MISC-MASAFA2-ONEANSWER"},{"v":["-4"],"misc":"MISC-MASAFA2-ONEANSWER"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-007:q1","kind":"atpair","mode":"c","lp":2,"cf":false,"m":"3","d":"5","opts":[{"v":["-8","2"],"misc":"MISC-MASAFA2-SIGNSWAP"},{"v":["-2","8"]},{"v":["8"],"misc":"MISC-MASAFA2-ONEANSWER"},{"v":["-2"],"misc":"MISC-MASAFA2-ONEANSWER"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-007:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-2","b":"8","n1":"U","n2":"V","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-008:q1","kind":"atcount","mode":"c","lp":2,"cf":false,"m":"5","d":"4","opts":[{"v":1,"misc":"MISC-MASAFA2-ONEANSWER"},{"v":0},{"v":2},{"v":3}]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-008:q2","kind":"atcount","mode":"c","lp":2,"cf":false,"m":"-2","d":"0","opts":[{"v":0},{"v":2},{"v":3},{"v":1}]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-008:q3","kind":"at","mode":"r","lp":2,"cf":false,"m":"-6","d":"2.5","side":-1,"sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-009:q1","kind":"atpair","mode":"c","lp":2,"cf":false,"m":"2.5","d":"4","opts":[{"v":["-1.5","6.5"]},{"v":["-6.5","1.5"],"misc":"MISC-MASAFA2-SIGNSWAP"},{"v":["6.5"],"misc":"MISC-MASAFA2-ONEANSWER"},{"v":["-1.5"],"misc":"MISC-MASAFA2-ONEANSWER"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-009:q2","kind":"at","mode":"r","lp":2,"cf":false,"m":"2.5","d":"4","side":1,"sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-009:q3","kind":"at","mode":"r","lp":2,"cf":false,"m":"2.5","d":"4","side":-1,"sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-010:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-2","b":"5","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-010:q2","kind":"shift","mode":"c","lp":1,"cf":false,"a":"-2","b":"5","t":"3","opts":[{"v":"4"},{"v":"7"},{"v":"9"},{"v":"10"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l2-010:q3","kind":"shift","mode":"r","lp":1,"cf":false,"a":"-2","b":"5","t":"-4.5","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-001:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-1","b":"-4","n1":"C","n2":"B","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-001:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-1","b":"6.5","n1":"C","n2":"A","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-001:q3","kind":"deduce","mode":"r","lp":1,"cf":false,"a":"6.5","b":"-4","c":"-1","names":["A","B","C"],"sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-001:q4","kind":"endpoint","mode":"r","lp":2,"cf":false,"b":"-4","c":"-1","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-002:q1","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-6","b":"4","n1":"A","n2":"B","I":"M","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-002:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"4","b":"-3","n1":"B","n2":"C","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-002:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-1","b":"5","n1":"M","n2":"L","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-003:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-9","b":"-5","n1":"A","n2":"B","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-003:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-5","b":"4","n1":"B","n2":"C","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-003:q3","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-9","b":"4","n1":"A","n2":"C","I":"E","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-004:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-5","b":"2","n1":"A","n2":"B","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-004:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"2","b":"7","n1":"B","n2":"C","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-004:q3","kind":"deduce","mode":"r","lp":1,"cf":false,"a":"-5","b":"7","c":"2","names":["A","C","B"],"sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-005:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-5.5","b":"3","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-005:q2","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-5.5","b":"3","n1":"A","n2":"B","I":"I","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-005:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-1.25","b":"3","n1":"I","n2":"B","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-006:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-1.5","b":"2","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-006:q2","kind":"gradgap","mode":"r","lp":1,"cf":false,"a":"-1.5","b":"2","step":"0.25","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-006:q3","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-1.5","b":"2","n1":"A","n2":"B","I":"I","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-007:q1","kind":"at","mode":"r","lp":2,"cf":false,"m":"-2","d":"6.5","side":1,"sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-007:q2","kind":"at","mode":"r","lp":2,"cf":false,"m":"-2","d":"6.5","side":-1,"nn":"P","sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-007:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"4.5","b":"-8.5","n1":"N","n2":"P","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-008:q1","kind":"ptsext","mode":"c","lp":1,"cf":true,"pts":[{"n":"A","v":"-3.5"},{"n":"B","v":"2"},{"n":"C","v":"-6"},{"n":"D","v":"0.5"}],"ask":"max","opts":[{"v":"A"},{"v":"C"},{"v":"B"},{"v":"D"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-008:q2","kind":"range","mode":"r","lp":1,"cf":false,"pts":[{"n":"A","v":"-3.5"},{"n":"B","v":"2"},{"n":"C","v":"-6"},{"n":"D","v":"0.5"}],"sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-008:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-3.5","b":"0.5","n1":"A","n2":"D","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-009:q1","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-18","b":"6","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-009:q2","kind":"mid","mode":"c","lp":2,"cf":false,"a":"-53","b":"-29","opts":[{"v":"12","misc":"MISC-MASAFA2-HALFDIST"},{"v":"-82","misc":"MISC-MASAFA2-SUMNOHALF"},{"v":"24"},{"v":"-41"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-009:q3","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-3.6","b":"1.2","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-010:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-6","b":"2.5","n1":"A","n2":"B","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-010:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"2.5","b":"7.5","n1":"B","n2":"C","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l3-010:q3","kind":"ismid","mode":"c","lp":2,"cf":false,"e":"2.5","g":"-6","f":"7.5","names":["B","A","C"],"opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-001:q1","kind":"ptsext","mode":"c","lp":1,"cf":true,"pts":[{"n":"A","v":"2.4"},{"n":"B","v":"-3.5"},{"n":"C","v":"-5"},{"n":"D","v":"-0.6"}],"ask":"min","opts":[{"v":"A"},{"v":"C"},{"v":"B"},{"v":"D"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-001:q2","kind":"diffsum","mode":"r","lp":1,"cf":true,"a":"2.4","b":"-0.6","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-001:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"2.4","b":"-3.5","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-002:q1","kind":"ptsext","mode":"c","lp":1,"cf":true,"pts":[{"n":"A","v":"-4.5"},{"n":"B","v":"3"},{"n":"C","v":"-1"},{"n":"D","v":"-7"}],"ask":"min","opts":[{"v":"A"},{"v":"B"},{"v":"D"},{"v":"C"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-002:q2","kind":"range","mode":"r","lp":1,"cf":false,"pts":[{"n":"A","v":"-4.5"},{"n":"B","v":"3"},{"n":"C","v":"-1"},{"n":"D","v":"-7"}],"sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-002:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-4.5","b":"-1","n1":"A","n2":"C","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-003:q1","kind":"diffsum","mode":"r","lp":1,"cf":true,"a":"-3","b":"4","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-003:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-7","b":"8","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-003:q3","kind":"diffsum","mode":"r","lp":1,"cf":true,"a":"2","b":"-6","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-004:q1","kind":"opp","mode":"r","lp":1,"cf":true,"a":"-5.5","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-004:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-5.5","b":"5.5","n1":"A","n2":"A'","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-004:q3","kind":"oppdist","mode":"c","lp":1,"cf":false,"a":"12.5","n":"B","opts":[{"v":"12.5"},{"v":"0"},{"v":"26"},{"v":"25"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-005:q1","kind":"far","mode":"c","lp":1,"cf":false,"ask":"max","pairs":[{"n1":"A","a":"-4","n2":"B","b":"1"},{"n1":"C","a":"-7","n2":"D","b":"-3"},{"n1":"E","a":"2","n2":"F","b":"9"}],"opts":[{"v":"EF"},{"v":"AB"},{"v":"CD"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-005:q2","kind":"far","mode":"c","lp":1,"cf":false,"ask":"min","pairs":[{"n1":"A","a":"-4","n2":"B","b":"1"},{"n1":"C","a":"-7","n2":"D","b":"-3"},{"n1":"E","a":"2","n2":"F","b":"9"}],"opts":[{"v":"AB"},{"v":"CD"},{"v":"EF"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-005:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"2","b":"9","n1":"E","n2":"F","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-006:q1","kind":"near","mode":"c","lp":1,"cf":false,"k":"-2","pts":[{"n":"A","v":"-6"},{"n":"B","v":"1"},{"n":"C","v":"-0.5"}],"ask":"min","opts":[{"v":"A"},{"v":"B"},{"v":"C"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-006:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-2","b":"-0.5","n1":"K","n2":"C","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-006:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-6","b":"1","n1":"A","n2":"B","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-007:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-4","b":"3","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-007:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"3","b":"-1","n1":"B","n2":"C","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-007:q3","kind":"route","mode":"r","lp":1,"cf":false,"pts":[{"n":"A","v":"-4"},{"n":"B","v":"3"},{"n":"C","v":"-1"}],"sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-008:q1","kind":"diffsum","mode":"r","lp":1,"cf":true,"a":"4","b":"-6","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-008:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-6","b":"4","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-008:q3","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-6","b":"4","n1":"A","n2":"B","I":"I","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-009:q1","kind":"opp","mode":"r","lp":1,"cf":true,"a":"-2.5","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-009:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"2.5","b":"4","n1":"A'","n2":"B","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-009:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-2.5","b":"4","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-010:q1","kind":"at","mode":"r","lp":2,"cf":false,"m":"-1.5","d":"1.2","side":1,"nn":"B","mn":"A","sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-010:q2","kind":"at","mode":"r","lp":2,"cf":false,"m":"-1.5","d":"4","side":1,"nn":"C","mn":"A","sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-010:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-0.3","b":"2.5","n1":"B","n2":"C","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l4-010:q4","kind":"at","mode":"r","lp":2,"cf":false,"m":"-1.5","d":"4","side":-1,"nn":"C","mn":"A","sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-001:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-4.5","b":"1.5","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-001:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-4.5","b":"7","n1":"A","n2":"C","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-001:q3","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-4.5","b":"7","n1":"A","n2":"C","I":"K","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-001:q4","kind":"near","mode":"c","lp":1,"cf":false,"k":"1.25","pts":[{"n":"A","v":"-4.5"},{"n":"B","v":"1.5"},{"n":"C","v":"7"}],"ask":"min","opts":[{"v":"B"},{"v":"A"},{"v":"C"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-002:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-6","b":"7","n1":"S","n2":"T","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-002:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"3","b":"21","n1":"S","n2":"T","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-002:q3","kind":"far","mode":"c","lp":1,"cf":false,"ask":"max","intro":"الفارق بين الصغرى والكبرى في كلّ مدينة","pairs":[{"lab":"الجلفة","desc":"الجلفة ($-6$ و $+7$)","a":"-6","b":"7"},{"lab":"تمنراست","desc":"تمنراست ($+3$ و $+21$)","a":"3","b":"21"},{"lab":"سطيف","desc":"سطيف ($-2$ و $+9$)","a":"-2","b":"9"}],"qMax":"أيّ مدينة فارقها أكبر ؟","opts":[{"v":"الجلفة"},{"v":"تمنراست"},{"v":"سطيف"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-002:q4","kind":"at","mode":"r","lp":2,"cf":false,"m":"-6","d":"7","side":1,"nn":"N","mn":"M","sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-003:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-6","b":"24","n1":"G","n2":"S","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-003:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-6","b":"9","n1":"G","n2":"T","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-003:q3","kind":"gradgap","mode":"r","lp":1,"cf":false,"a":"-6","b":"24","step":"3","n1":"G","n2":"S","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-003:q4","kind":"ynsym","mode":"c","lp":2,"cf":false,"a":"-6","b":"24","n1":"G","n2":"S","opts":[{"v":"N","misc":"MISC-MASAFA2-ORDERSWAP"},{"v":"Y"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-004:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-3.4","b":"5.2","n1":"S","n2":"L","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-004:q2","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-3.4","b":"5.2","n1":"S","n2":"L","I":"R","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-004:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-3.4","b":"0.9","n1":"S","n2":"R","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-004:q4","kind":"ismid","mode":"c","lp":2,"cf":false,"e":"1","g":"-3.4","f":"5.2","names":["R","S","L"],"opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-005:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-18.5","b":"42.5","n1":"B","n2":"T","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-005:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-18.5","b":"10","n1":"B","n2":"M","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-005:q3","kind":"dist","mode":"r","lp":1,"cf":false,"a":"10","b":"42.5","n1":"M","n2":"T","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-005:q4","kind":"route","mode":"r","lp":1,"cf":false,"pts":[{"n":"B","v":"-18.5"},{"n":"M","v":"10"},{"n":"T","v":"42.5"}],"sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-006:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-3000","b":"1500","n1":"L","n2":"W","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-006:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"1500","b":"4500","n1":"W","n2":"V","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-006:q3","kind":"route","mode":"r","lp":1,"cf":false,"pts":[{"n":"L","v":"-3000"},{"n":"W","v":"1500"},{"n":"V","v":"4500"}],"sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-006:q4","kind":"ismid","mode":"c","lp":2,"cf":false,"e":"1500","g":"-3000","f":"4500","names":["W","L","V"],"opts":[{"v":"Y"},{"v":"N"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-007:q1","kind":"gradgap","mode":"r","lp":1,"cf":false,"a":"-6","b":"12","step":"3","n1":"D","n2":"U","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-007:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-6","b":"12","n1":"D","n2":"U","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-007:q3","kind":"at","mode":"r","lp":2,"cf":false,"m":"12","d":"15","side":-1,"nn":"N","mn":"U","sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-007:q4","kind":"atpair","mode":"c","lp":2,"cf":false,"m":"12","d":"15","opts":[{"v":["-3","27"]},{"v":["-27","3"],"misc":"MISC-MASAFA2-SIGNSWAP"},{"v":["27"],"misc":"MISC-MASAFA2-ONEANSWER"},{"v":["-3"],"misc":"MISC-MASAFA2-ONEANSWER"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-008:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-3","b":"6","n1":"S","n2":"T","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-008:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"5","b":"11","n1":"S","n2":"T","sigs":["MISC-MASAFA2-ADDSAME","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-008:q3","kind":"far","mode":"c","lp":1,"cf":false,"ask":"min","intro":"الفارق بين درجتي الحرارة في كلّ مدينة","pairs":[{"lab":"قسنطينة","desc":"قسنطينة ($-3$ و $+6$)","a":"-3","b":"6"},{"lab":"وهران","desc":"وهران ($+5$ و $+11$)","a":"5","b":"11"},{"lab":"باتنة","desc":"باتنة ($-7$ و $+4$)","a":"-7","b":"4"}],"qMin":"أيّ مدينة فارقها أصغر ؟","opts":[{"v":"وهران"},{"v":"قسنطينة"},{"v":"باتنة"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-008:q4","kind":"mid","mode":"r","lp":2,"cf":false,"a":"-7","b":"4","n1":"S","n2":"T","I":"I","sigs":["MISC-MASAFA2-HALFDIST","MISC-MASAFA2-SUMNOHALF"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-009:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-45","b":"30","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-009:q2","kind":"dist","mode":"r","lp":1,"cf":false,"a":"30","b":"-10","n1":"B","n2":"C","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-009:q3","kind":"route","mode":"r","lp":1,"cf":false,"pts":[{"n":"A","v":"-45"},{"n":"B","v":"30"},{"n":"C","v":"-10"}],"sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-009:q4","kind":"cost","mode":"r","lp":1,"cf":true,"a":"-45","b":"30","rate":"1.5","n1":"A","n2":"B","sigs":[]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-010:q1","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-22","b":"35","n1":"S","n2":"P","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-010:q2","kind":"at","mode":"r","lp":2,"cf":false,"m":"-22","d":"14","side":1,"nn":"N","mn":"S","sigs":["MISC-MASAFA2-SIGNSWAP"]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-010:q3","kind":"atpair","mode":"c","lp":2,"cf":false,"m":"-22","d":"14","opts":[{"v":["8","36"],"misc":"MISC-MASAFA2-SIGNSWAP"},{"v":["-8"],"misc":"MISC-MASAFA2-ONEANSWER"},{"v":["-36","-8"]},{"v":["-36"],"misc":"MISC-MASAFA2-ONEANSWER"}]},
  {"key":"ex-2am-masafa-nuqtatayn-l5-010:q4","kind":"dist","mode":"r","lp":1,"cf":false,"a":"-8","b":"35","n1":"N","n2":"P","sigs":["MISC-MASAFA2-SUBDIST","MISC-MASAFA2-NEGDIST"]}
];

const UNCOUNTED = new Set(['ptsext', 'diffsum', 'opp', 'cost']);
const P2 = new Set(['at', 'atpair', 'atcount', 'mid', 'endpoint', 'ynsym', 'ynneg', 'ismid']);
const lpOf = (s) => (P2.has(s.kind) || (s.kind === 'dist' && s.rev) ? 2 : 1);
const KIND_MISC = {
  dist: s => (s.rev ? ['SUBDIST', 'ADDSAME', 'ORDERSWAP'] : ['SUBDIST', 'ADDSAME', 'NEGDIST']),
  at: () => ['SIGNSWAP'], atpair: () => ['SIGNSWAP', 'ONEANSWER'], atcount: () => ['ONEANSWER'],
  mid: () => ['HALFDIST', 'SUMNOHALF'], ynsym: () => ['ORDERSWAP'], ynneg: () => ['NEGDIST'],
};

const set2 = (x, y) => [x, y].sort((p, q) => (p < q ? -1 : p > q ? 1 : 0));
const pts = (s) => s.pts.map((p) => D(p.v));

/** la réponse juste (BigInt ×100) d'une question numérique */
const keyValue = (s) => {
  switch (s.kind) {
    case 'dist': return hi2(D(s.a), D(s.b)) - lo2(D(s.a), D(s.b));
    case 'at': return D(s.m) + BigInt(s.side) * D(s.d);
    case 'mid': { const t = D(s.a) + D(s.b); if (t % 2n) throw new Error('milieu à 3 décimales'); return t / 2n; }
    case 'endpoint': return 2n * D(s.c) - D(s.b);
    case 'deduce': {
      const a = D(s.a), b = D(s.b), c = D(s.c);
      const between = c > lo2(a, b) && c < hi2(a, b);
      const x = abs(a - c), y = abs(c - b);
      const key = between ? x + y : abs(x - y);
      if (key !== abs(a - b)) throw new Error('déduction incohérente');
      return key;
    }
    case 'diffsum': return D(s.a) - D(s.b);
    case 'opp': return -D(s.a);
    case 'oppdist': return hi2(D(s.a), -D(s.a)) - lo2(D(s.a), -D(s.a));
    case 'cost': { const p = abs(D(s.a) - D(s.b)) * D(s.rate); if (p % SC) throw new Error('coût à 3 décimales'); return p / SC; }
    case 'gradgap': { const q = abs(D(s.a) - D(s.b)) * SC; if (q % D(s.step)) throw new Error('quotient non exact'); const r = q / D(s.step); if (r % SC) throw new Error('nombre de graduations non entier'); return r; }
    case 'range': return pts(s).reduce(hi2) - pts(s).reduce(lo2);
    case 'route': { const v = pts(s); let t = 0n; for (let i = 1; i < v.length; i++) t += abs(v[i] - v[i - 1]); return t; }
    case 'shift': {
      const a = D(s.a), b = D(s.b), t = D(s.t);
      return hi2(a + t, b + t) - lo2(a + t, b + t);
    }
    default: throw new Error(`pas de valeur numérique pour ${s.kind}`);
  }
};

const pairDist = (p) => abs(D(p.a) - D(p.b));
const pairName = (p) => p.lab ?? `${p.n1}${p.n2}`;

const isTrue = (s, o) => {
  switch (s.kind) {
    case 'atpair': { const m = D(s.m), d = D(s.d); const want = set2(m - d, m + d); return o.v.length === 2 && o.v.map(D).every((x, i) => x === want[i]); }
    case 'atcount': return o.v === (D(s.d) === 0n ? 1 : 2);
    case 'ynsym': return o.v === 'Y' && abs(D(s.a) - D(s.b)) === abs(D(s.b) - D(s.a));
    case 'ynneg': { if (!(D(s.a) < D(s.b))) throw new Error('ynneg : a < b attendu'); return o.v === 'N'; }
    case 'ismid': { const yes = 2n * D(s.e) === D(s.g) + D(s.f) && D(s.g) !== D(s.f); return o.v === (yes ? 'Y' : 'N'); }
    case 'far': {
      const ds = s.pairs.map(pairDist); const t = s.ask === 'max' ? ds.reduce(hi2) : ds.reduce(lo2);
      if (ds.filter((x) => x === t).length !== 1) throw new Error('égalité de distances');
      return o.v === pairName(s.pairs[ds.indexOf(t)]);
    }
    case 'near': {
      const k = D(s.k); const ds = s.pts.map((p) => abs(D(p.v) - k)); const t = s.ask === 'min' ? ds.reduce(lo2) : ds.reduce(hi2);
      if (ds.filter((x) => x === t).length !== 1) throw new Error('égalité de distances');
      return o.v === s.pts[ds.indexOf(t)].n;
    }
    case 'ptsext': {
      const v = pts(s); const t = s.ask === 'min' ? v.reduce(lo2) : v.reduce(hi2);
      if (v.filter((x) => x === t).length !== 1) throw new Error('égalité de abscisses');
      return o.v === s.pts[v.indexOf(t)].n;
    }
    default: return D(o.v) === keyValue(s);
  }
};

/** l'erreur nommée, recalculée */
const FORMULA = {
  SUBDIST: (s) => { if (sgn(D(s.a)) * sgn(D(s.b)) >= 0) throw new Error('SUBDIST : points du même côté'); return abs(abs(D(s.a)) - abs(D(s.b))); },
  ADDSAME: (s) => { if (sgn(D(s.a)) * sgn(D(s.b)) <= 0) throw new Error('ADDSAME : points de part et d\'autre'); return abs(D(s.a)) + abs(D(s.b)); },
  NEGDIST: (s) => -keyValue(s),
  ORDERSWAP: (s) => -keyValue(s),
  SIGNSWAP: (s) => -keyValue(s),
  HALFDIST: (s) => abs(D(s.a) - D(s.b)) / 2n,
  SUMNOHALF: (s) => D(s.a) + D(s.b),
};
const errorMatches = (s, id, o) => {
  const name = id.replace('MISC-MASAFA2-', '');
  if (!(KIND_MISC[s.kind]?.(s) ?? []).includes(name)) return false;
  if (s.kind === 'atpair') {
    const m = D(s.m), d = D(s.d);
    if (name === 'SIGNSWAP') { const want = set2(-(m - d), -(m + d)); return o.v.length === 2 && o.v.map(D).every((x, i) => x === want[i]) && !isTrue(s, o); }
    if (name === 'ONEANSWER') return o.v.length === 1 && (D(o.v[0]) === m + d || D(o.v[0]) === m - d);
    return false;
  }
  if (s.kind === 'atcount') return name === 'ONEANSWER' && o.v === 1 && D(s.d) > 0n;
  if (s.kind === 'ynsym') return name === 'ORDERSWAP' && o.v === 'N';
  if (s.kind === 'ynneg') return name === 'NEGDIST' && o.v === 'Y' && D(s.a) - D(s.b) < 0n;
  const f = FORMULA[name]; if (!f) return false;
  return D(o.v) === f(s);
};

/* ── relecture du texte ── */
const numsOf = (c) => (c.replace(/\{,\}/g, '.').match(/-?\d+(?:\.\d+)?/g) ?? []);
const stripMath = (t) => t.replace(/\$[^$]*\$/g, ' ');
const WORDS = [['لا توجد', 0], ['واحدة', 1], ['نقطتان', 2], ['ثلاث', 3]];
const optionValue = (s, content) => {
  switch (s.kind) {
    case 'atpair': return numsOf(content);
    case 'atcount': { const w = WORDS.find(([k]) => content.includes(k)); return w ? w[1] : null; }
    case 'ynsym': case 'ynneg': case 'ismid': return content.trim() === 'نعم' ? 'Y' : content.trim() === 'لا' ? 'N' : null;
    case 'far': return content.replace(/\$/g, '').trim();
    case 'near': case 'ptsext': return content.replace(/\$/g, '').trim();
    default: return numsOf(content)[0];
  }
};
const sameValue = (a, b) => (Array.isArray(a) || Array.isArray(b)
  ? Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => sameValue(x, b[i]))
  : (/^-?\d/.test(String(a)) && /^-?\d/.test(String(b)) ? D(a) === D(b) : a === b));

/** nombres que l'énoncé doit imprimer (valeurs retapées) */
const shown = (s) => {
  switch (s.kind) {
    case 'dist': case 'diffsum': case 'ynsym': case 'ynneg': case 'mid': return [s.a, s.b];
    case 'at': return [s.m, s.d];
    case 'atpair': case 'atcount': return [s.m ?? '0', s.d].filter((x) => x !== undefined);
    case 'endpoint': return [s.b, s.c];
    case 'deduce': return [s.a, s.b, s.c, txt(abs(D(s.a) - D(s.c))), txt(abs(D(s.c) - D(s.b)))];
    case 'ismid': return [s.e, s.g, s.f];
    case 'far': return s.pairs.flatMap((p) => [p.a, p.b]);
    case 'near': return [s.k, ...s.pts.map((p) => p.v)];
    case 'ptsext': case 'range': case 'route': return s.pts.map((p) => p.v);
    case 'opp': case 'oppdist': return [s.a];
    case 'cost': return [s.a, s.b, s.rate];
    case 'gradgap': return [s.a, s.b, s.step];
    case 'shift': return [s.a, s.b, s.t];
    default: return [];
  }
};

const choiceIndex = (s) => {
  const hits = s.opts.map((o, k) => (isTrue(s, o) ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`${s.key} : ${hits.length} options justes`);
  return hits[0];
};
const answerOf = (s) => (s.mode === 'c' ? C('ABCDEF'[choiceIndex(s)]) : R(txt(keyValue(s))));

export const ORACLE = Object.fromEntries(SPECS.map((s) => [s.key, answerOf(s)]));

const FORBIDDEN = [/الكتاب(?!ة)/, /ص\s*\d/, /خنزير/, /خمر/, /قمار/, /ربا/, /فائدة/, /فوائد/, /يانصيب/, /نرد/, /كازينو/, /ورق اللعب/, /الميلاد/, /نقطة التعلّم/, /نقاط التعلّم/];

/** relit les fichiers du banc */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  let firstCorrect = 0; let nChoice = 0;
  for (const s of SPECS) {
    try {
      const q = byKey.get(s.key);
      if (!q) { errs.push(`${s.key} : question absente`); continue; }
      /* الكفاءة + counted */
      const lp = q.learningPoints?.[0]?.code;
      if (lp !== `2am_masafa-nuqtatayn_P${lpOf(s)}`) errs.push(`${s.key} : الكفاءة ${lp} ≠ P${lpOf(s)}`);
      if ((q.counted === false) !== UNCOUNTED.has(s.kind)) errs.push(`${s.key} : counted=${q.counted} mais ${s.kind} ${UNCOUNTED.has(s.kind) ? 'est' : "n'est pas"} une étape non comptée`);
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
        const want = new Set((s.sigs ?? []));
        if (want.size !== got.size || [...want].some((i) => !got.has(i))) errs.push(`${s.key} : signatures [${[...got]}] ≠ retapées [${[...want]}]`);
      } else {
        if (q.answerType !== 'choice') { errs.push(`${s.key} : devrait être choice`); continue; }
        if (q.choices.length !== s.opts.length) errs.push(`${s.key} : ${q.choices.length} options, ${s.opts.length} retapées`);
        const good = choiceIndex(s);
        nChoice++; if (good === 0) firstCorrect++;
        q.choices.forEach((c, k) => {
          const o = s.opts[k]; if (!o) return;
          const read = optionValue(s, c.content);
          if (!sameValue(read, o.v)) errs.push(`${s.key} : option ${c.id} « ${c.content} » ≠ ${JSON.stringify(o.v)}`);
          if (c.isCorrect !== (k === good)) errs.push(`${s.key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${k === good}`);
          if (c.misconceptionId) {
            if (k === good) errs.push(`${s.key} : la bonne option porte ${c.misconceptionId}`);
            else if (!errorMatches(s, c.misconceptionId, o)) errs.push(`${s.key} : option ${c.id} ≠ erreur ${c.misconceptionId}`);
          }
          if ((o.misc ?? null) !== (c.misconceptionId ?? null)) errs.push(`${s.key} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${o.misc}`);
          if (k !== good && isTrue(s, o)) errs.push(`${s.key} : le distracteur ${c.id} est vrai`);
        });
      }
    } catch (e) { errs.push(`${s.key} : ${e.message}`); }
  }
  /* texte de toutes les questions du banc : renvois, termes interdits, unités, nombres signés */
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
    }
  }
  if (nChoice > 4 && firstCorrect === nChoice) errs.push('la bonne option est toujours la première');
  return errs;
}
