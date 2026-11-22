// Oracle du banc « talim-nuqta-mustawi » (تعليم نقطة في المستوي, 2AM, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, en arithmétique indépendante sur les DÉCIMAUX :
//  - un nombre relatif écrit « -2.5 » devient un BigInt à l'échelle 10^6 (aucun flottant, aucun import de packages/core) ;
//  - un point est une paire de BigInt (abscisse d'abord) ; chaque réponse construite est recalculée depuis les paramètres retapés :
//    lecture d'un point ou d'une coordonnée sur la figure (relue dans le fichier et comparée aux points retapés), région par les
//    signes, nature d'un point (sur un axe, dans le repère), symétrique par rapport à UN axe (l'abscisse ou l'ordonnée change de
//    signe), par rapport à l'origine ou à un point (2c − p, étapes `counted: false`), 4e sommet d'un rectangle de côtés parallèles
//    aux axes (X + Z − Y, parallélisme vérifié), sommet d'un triangle rectangle à abscisse positive, sommets d'un carré
//    (côté compté en unités), longueur d'un segment d'une ligne de grille (|Δ| × valeur de l'unité, COMPTÉE), aire d'un rectangle,
//    coût (aire × prix, `counted: false`), distance à un axe, changement d'origine (p − o), nombre de graduations (x ÷ pas),
//    choix d'une unité de repère (toutes les coordonnées sur une graduation ET au plus `half` graduations), nature d'un repère
//    (perpendiculaire ET même unité), ordre des abscisses / des ordonnées, nature d'un quadrilatère (côtés, diagonales) ;
//  - chaque QCM n'a qu'une option juste : chaque option est retapée en valeur (ordre = ordre des choix du fichier) et jugée
//    par le calcul ; chaque distracteur nommé MISC-NUQTA2-* est RECALCULÉ à partir de son erreur (voir sigValue / errorMatches)
//    et est faux ; chaque signature d'une réponse construite aussi ;
//  - audit(bank) relit les fichiers : clé égale au calcul, option juste unique, valeur de chaque option égale à celle retapée ici,
//    signature / distracteur égaux à l'erreur nommée, points de la figure d'énoncé = points retapés, coordonnées imprimées dans
//    l'énoncé = coordonnées retapées (et jamais la réponse d'une question de lecture), الكفاءة de chaque question et
//    `counted: false` recalculés (une seule étape non comptée par feuille).
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, P } from './helpers.mjs';

/* ── énoncés retapés : paramètres de chaque question et options (dans l'ordre des choix) ── */
const SPECS = [
  {"kind":"axiscls","p":["-5","0"],"opts":[{"v":"onY","misc":"MISC-NUQTA2-ONAXIS"},{"v":"onX","misc":null},{"v":"O","misc":null},{"v":"out","misc":null}],"shown":[["-5","0"]],"key":"ex-2am-talim-nuqta-mustawi-l1-001:q1"},
  {"kind":"seglen","a":["0","2"],"b":["0","-4"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["0","2"],["0","-4"]],"key":"ex-2am-talim-nuqta-mustawi-l1-001:q2"},
  {"kind":"symOyesno","E":["5","2"],"L":["-5","0"],"opts":[{"v":"Y","misc":null},{"v":"N","misc":null}],"shown":[["5","2"],["-5","0"]],"key":"ex-2am-talim-nuqta-mustawi-l1-001:q3"},
  {"kind":"seglen","a":["3","-1"],"b":["3","2"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["3","-1"],["3","2"]],"key":"ex-2am-talim-nuqta-mustawi-l1-002:q1"},
  {"kind":"seglen","a":["3","-1"],"b":["-2","-1"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["3","-1"],["-2","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l1-002:q2"},
  {"kind":"region","p":["-2","-1"],"opts":[{"v":"++","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"--","misc":null},{"v":"+-","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"-+","misc":"MISC-NUQTA2-SIGNAXIS"}],"shown":[["-2","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l1-002:q3"},
  {"kind":"readpt","pts":{"A":["2","3"],"B":["-3","1"],"C":["-1","-2"],"D":["4","-3"]},"ask":"A","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l1-003:q1"},
  {"kind":"readpt","pts":{"A":["2","3"],"B":["-3","1"],"C":["-1","-2"],"D":["4","-3"]},"ask":"B","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l1-003:q2"},
  {"kind":"readpt","pts":{"A":["2","3"],"B":["-3","1"],"C":["-1","-2"],"D":["4","-3"]},"ask":"D","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l1-003:q3"},
  {"kind":"readcoord","pts":{"P":["3","2"],"Q":["-2","-3"],"R":["0","4"],"S":["-4","0"]},"ask":"P","coord":"x","mode":"r","sigs":["MISC-NUQTA2-SIGNLEFT","MISC-NUQTA2-SWAP"],"key":"ex-2am-talim-nuqta-mustawi-l1-004:q1"},
  {"kind":"readcoord","pts":{"P":["3","2"],"Q":["-2","-3"],"R":["0","4"],"S":["-4","0"]},"ask":"Q","coord":"y","mode":"r","sigs":["MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SWAP"],"key":"ex-2am-talim-nuqta-mustawi-l1-004:q2"},
  {"kind":"readcoord","pts":{"P":["3","2"],"Q":["-2","-3"],"R":["0","4"],"S":["-4","0"]},"ask":"R","coord":"x","mode":"r","sigs":["MISC-NUQTA2-SWAP"],"key":"ex-2am-talim-nuqta-mustawi-l1-004:q3"},
  {"kind":"whichpt","pts":{"M":["3","2"],"N":["2","3"],"P":["-3","2"],"Q":["3","-2"],"R":["-2","-3"],"S":["2","-3"],"U":["-2","3"]},"target":["3","2"],"opts":[{"v":"Q","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"M","misc":null},{"v":"N","misc":"MISC-NUQTA2-SWAP"},{"v":"P","misc":"MISC-NUQTA2-SIGNLEFT"}],"shown":[["3","2"]],"key":"ex-2am-talim-nuqta-mustawi-l1-005:q1"},
  {"kind":"whichpt","pts":{"M":["3","2"],"N":["2","3"],"P":["-3","2"],"Q":["3","-2"],"R":["-2","-3"],"S":["2","-3"],"U":["-2","3"]},"target":["-2","-3"],"opts":[{"v":"S","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"N","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"R","misc":null},{"v":"U","misc":"MISC-NUQTA2-SIGNAXIS"}],"shown":[["-2","-3"]],"key":"ex-2am-talim-nuqta-mustawi-l1-005:q2"},
  {"kind":"whichpt","pts":{"M":["3","2"],"N":["2","3"],"P":["-3","2"],"Q":["3","-2"],"R":["-2","-3"],"S":["2","-3"],"U":["-2","3"]},"target":["2","-3"],"opts":[{"v":"N","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"P","misc":"MISC-NUQTA2-SWAP"},{"v":"R","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"S","misc":null}],"shown":[["2","-3"]],"key":"ex-2am-talim-nuqta-mustawi-l1-005:q3"},
  {"kind":"figaxis","pts":{"A":["0","3"],"B":["-2","0"],"C":["4","2"],"D":["3","-1"]},"axis":"y","opts":[{"v":"B","misc":"MISC-NUQTA2-ONAXIS"},{"v":"A","misc":null},{"v":"C","misc":null},{"v":"D","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l1-006:q1"},
  {"kind":"figaxis","pts":{"A":["0","3"],"B":["-2","0"],"C":["4","2"],"D":["3","-1"]},"axis":"x","opts":[{"v":"D","misc":null},{"v":"C","misc":null},{"v":"B","misc":null},{"v":"A","misc":"MISC-NUQTA2-ONAXIS"}],"key":"ex-2am-talim-nuqta-mustawi-l1-006:q2"},
  {"kind":"countwhere","pts":{"A":["0","3"],"B":["-2","0"],"C":["4","2"],"D":["3","-1"]},"cond":"onaxis","sigs":[],"key":"ex-2am-talim-nuqta-mustawi-l1-006:q3"},
  {"kind":"distaxis","p":["-4","3"],"axis":"y","sigs":["MISC-NUQTA2-NEGDIST","MISC-NUQTA2-SWAP"],"shown":[["-4","3"]],"key":"ex-2am-talim-nuqta-mustawi-l1-007:q1"},
  {"kind":"distaxis","p":["2","-5"],"axis":"x","sigs":["MISC-NUQTA2-NEGDIST","MISC-NUQTA2-SWAP"],"shown":[["2","-5"]],"key":"ex-2am-talim-nuqta-mustawi-l1-007:q2"},
  {"kind":"distaxis","p":["0","4"],"axis":"y","sigs":["MISC-NUQTA2-SWAP"],"shown":[["0","4"]],"key":"ex-2am-talim-nuqta-mustawi-l1-007:q3"},
  {"kind":"region","p":["2.5","-1.5"],"opts":[{"v":"+-","misc":null},{"v":"++","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"--","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"-+","misc":"MISC-NUQTA2-BOTHSIGNS"}],"shown":[["2.5","-1.5"]],"key":"ex-2am-talim-nuqta-mustawi-l1-008:q1"},
  {"kind":"region","p":["-3.5","0.5"],"opts":[{"v":"--","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"-+","misc":null},{"v":"+-","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"++","misc":"MISC-NUQTA2-SIGNLEFT"}],"shown":[["-3.5","0.5"]],"key":"ex-2am-talim-nuqta-mustawi-l1-008:q2"},
  {"kind":"region","p":["-1.5","-2.5"],"opts":[{"v":"++","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"+-","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"-+","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"--","misc":null}],"shown":[["-1.5","-2.5"]],"key":"ex-2am-talim-nuqta-mustawi-l1-008:q3"},
  {"kind":"readpt","pts":{"A":["3","2"],"B":["-4","1"],"C":["-2","-3"],"D":["0","-1.5"],"E":["2.5","0"]},"ask":"B","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l1-009:q1"},
  {"kind":"readpt","pts":{"A":["3","2"],"B":["-4","1"],"C":["-2","-3"],"D":["0","-1.5"],"E":["2.5","0"]},"ask":"D","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS"],"key":"ex-2am-talim-nuqta-mustawi-l1-009:q2"},
  {"kind":"readpt","pts":{"A":["3","2"],"B":["-4","1"],"C":["-2","-3"],"D":["0","-1.5"],"E":["2.5","0"]},"ask":"E","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l1-009:q3"},
  {"kind":"readpt","pts":{"A":["-3","2"],"B":["3","1"],"C":["2","-2"]},"ask":"A","mode":"c","opts":[{"v":["2","-3"],"misc":"MISC-NUQTA2-SWAP"},{"v":["-3","2"],"misc":null},{"v":["-3","-2"],"misc":"MISC-NUQTA2-SIGNAXIS"},{"v":["3","2"],"misc":"MISC-NUQTA2-SIGNLEFT"}],"key":"ex-2am-talim-nuqta-mustawi-l1-010:q1"},
  {"kind":"readcoord","pts":{"A":["-3","2"],"B":["3","1"],"C":["2","-2"]},"ask":"B","coord":"x","mode":"c","opts":[{"v":"-3","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"1","misc":"MISC-NUQTA2-SWAP"},{"v":"3","misc":null},{"v":"4","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l1-010:q2"},
  {"kind":"readcoord","pts":{"A":["-3","2"],"B":["3","1"],"C":["2","-2"]},"ask":"C","coord":"y","mode":"c","opts":[{"v":"-2","misc":null},{"v":"2","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"-1","misc":null},{"v":"-3","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l1-010:q3"},
  {"kind":"axiscls","p":["0","2"],"opts":[{"v":"onX","misc":"MISC-NUQTA2-ONAXIS"},{"v":"out","misc":null},{"v":"onY","misc":null},{"v":"O","misc":null}],"shown":[["0","2"]],"key":"ex-2am-talim-nuqta-mustawi-l2-001:q1"},
  {"kind":"sym","p":["5","2"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["5","2"]],"key":"ex-2am-talim-nuqta-mustawi-l2-001:q2"},
  {"kind":"symo","p":["0","2"],"sigs":["MISC-NUQTA2-SIGNLEFT","MISC-NUQTA2-SWAP"],"shown":[["0","2"]],"key":"ex-2am-talim-nuqta-mustawi-l2-001:q3"},
  {"kind":"sym","p":["3","-1"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["3","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l2-002:q1"},
  {"kind":"sym","p":["-2","4"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["-2","4"]],"key":"ex-2am-talim-nuqta-mustawi-l2-002:q2"},
  {"kind":"sym","p":["-5","3"],"axis":"x","mode":"c","opts":[{"v":["5","3"],"misc":"MISC-NUQTA2-SYMMIX"},{"v":["5","-3"],"misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":["-5","-3"],"misc":null},{"v":["-3","-5"],"misc":"MISC-NUQTA2-SWAP"}],"shown":[["-5","3"]],"key":"ex-2am-talim-nuqta-mustawi-l2-002:q3"},
  {"kind":"sym","p":["2","5"],"axis":"y","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["2","5"]],"key":"ex-2am-talim-nuqta-mustawi-l2-003:q1"},
  {"kind":"sym","p":["-4","1"],"axis":"y","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["-4","1"]],"key":"ex-2am-talim-nuqta-mustawi-l2-003:q2"},
  {"kind":"sym","p":["2.5","1.5"],"axis":"y","mode":"c","opts":[{"v":["-2.5","1.5"],"misc":null},{"v":["2.5","-1.5"],"misc":"MISC-NUQTA2-SYMMIX"},{"v":["-2.5","-1.5"],"misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":["1.5","-2.5"],"misc":"MISC-NUQTA2-SWAP"}],"shown":[["2.5","1.5"]],"key":"ex-2am-talim-nuqta-mustawi-l2-003:q3"},
  {"kind":"sym","p":["3","-2"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["3","-2"]],"key":"ex-2am-talim-nuqta-mustawi-l2-004:q1"},
  {"kind":"sym","p":["3","-2"],"axis":"y","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["3","-2"]],"key":"ex-2am-talim-nuqta-mustawi-l2-004:q2"},
  {"kind":"whichregion","pts":{"A":["3","2"],"B":["-2","3"],"C":["-3","-2"],"D":["2","-3"],"E":["0","-1.5"]},"cond":"+-","opts":[{"v":"A","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"B","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"C","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"D","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l2-005:q1"},
  {"kind":"whichregion","pts":{"A":["3","2"],"B":["-2","3"],"C":["-3","-2"],"D":["2","-3"],"E":["0","-1.5"]},"cond":"--","opts":[{"v":"D","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"C","misc":null},{"v":"B","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"A","misc":"MISC-NUQTA2-BOTHSIGNS"}],"key":"ex-2am-talim-nuqta-mustawi-l2-005:q2"},
  {"kind":"countwhere","pts":{"A":["3","2"],"B":["-2","3"],"C":["-3","-2"],"D":["2","-3"],"E":["0","-1.5"]},"cond":"ypos","sigs":[],"key":"ex-2am-talim-nuqta-mustawi-l2-005:q3"},
  {"kind":"sym","p":["-4","3"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["-4","3"]],"key":"ex-2am-talim-nuqta-mustawi-l2-006:q1"},
  {"kind":"sym","p":["-4","3"],"axis":"y","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["-4","3"]],"key":"ex-2am-talim-nuqta-mustawi-l2-006:q2"},
  {"kind":"symo","p":["-4","3"],"sigs":["MISC-NUQTA2-SIGNLEFT","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SWAP"],"shown":[["-4","3"]],"key":"ex-2am-talim-nuqta-mustawi-l2-006:q3"},
  {"kind":"sym","p":["4","3"],"axis":"y","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["4","3"]],"key":"ex-2am-talim-nuqta-mustawi-l2-007:q1"},
  {"kind":"seglen","a":["4","3"],"b":["-4","3"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["4","3"]],"key":"ex-2am-talim-nuqta-mustawi-l2-007:q2"},
  {"kind":"quadtype","pts":[["4","3"],["0","6"],["-4","3"],["0","0"]],"opts":[{"v":"sq","misc":null},{"v":"rh","misc":null},{"v":"re","misc":null},{"v":"pa","misc":null}],"shown":[["4","3"],["0","6"],["0","0"]],"key":"ex-2am-talim-nuqta-mustawi-l2-007:q3"},
  {"kind":"sym","p":["2.5","-1.5"],"axis":"x","mode":"c","opts":[{"v":["-2.5","-1.5"],"misc":"MISC-NUQTA2-SYMMIX"},{"v":["2.5","1.5"],"misc":null},{"v":["-2.5","1.5"],"misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":["1.5","2.5"],"misc":"MISC-NUQTA2-SWAP"}],"shown":[["2.5","-1.5"]],"key":"ex-2am-talim-nuqta-mustawi-l2-008:q1"},
  {"kind":"sym","p":["-3.5","2"],"axis":"y","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["-3.5","2"]],"key":"ex-2am-talim-nuqta-mustawi-l2-008:q2"},
  {"kind":"sym","p":["1.5","0.5"],"axis":"x","mode":"c","opts":[{"v":["-1.5","0.5"],"misc":"MISC-NUQTA2-SYMMIX"},{"v":["-1.5","-0.5"],"misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":["1.5","-0.5"],"misc":null},{"v":["-0.5","1.5"],"misc":"MISC-NUQTA2-SWAP"}],"shown":[["1.5","0.5"]],"key":"ex-2am-talim-nuqta-mustawi-l2-008:q3"},
  {"kind":"region","p":["-2.5","1.5"],"opts":[{"v":"-+","misc":null},{"v":"++","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"--","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"+-","misc":"MISC-NUQTA2-BOTHSIGNS"}],"shown":[["-2.5","1.5"]],"key":"ex-2am-talim-nuqta-mustawi-l2-009:q1"},
  {"kind":"region","p":["-2.5","-1.5"],"opts":[{"v":"--","misc":null},{"v":"-+","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"+-","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"++","misc":"MISC-NUQTA2-BOTHSIGNS"}],"shown":[["-2.5","-1.5"]],"key":"ex-2am-talim-nuqta-mustawi-l2-009:q2"},
  {"kind":"sym","p":["0","3"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-SWAP"],"shown":[["0","3"]],"key":"ex-2am-talim-nuqta-mustawi-l2-010:q1"},
  {"kind":"sym","p":["4","0"],"axis":"y","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-SWAP"],"shown":[["4","0"]],"key":"ex-2am-talim-nuqta-mustawi-l2-010:q2"},
  {"kind":"sym","p":["-3","0"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-SWAP"],"shown":[["-3","0"]],"key":"ex-2am-talim-nuqta-mustawi-l2-010:q3"},
  {"kind":"symc","p":["-2","-3"],"c":["1.5","0"],"sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-BOTHSIGNS"],"shown":[["-2","-3"],["1.5","0"]],"key":"ex-2am-talim-nuqta-mustawi-l3-001:q1"},
  {"kind":"fourth","X":["5","3"],"Y":["-2","3"],"Z":["-2","-3"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-2","3"],["-2","-3"]],"key":"ex-2am-talim-nuqta-mustawi-l3-001:q2"},
  {"kind":"seglen","a":["-2","3"],"b":["5","3"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["-2","3"]],"key":"ex-2am-talim-nuqta-mustawi-l3-001:q3"},
  {"kind":"fourth","X":["-3","3"],"Y":["-3","-1"],"Z":["4","-1"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-3","3"],["-3","-1"],["4","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l3-002:q1"},
  {"kind":"center","A":["-3","3"],"C":["4","-1"],"sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-3","3"],["4","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l3-002:q2"},
  {"kind":"rectarea","A":["-3","3"],"B":["-3","-1"],"C":["4","-1"],"scale":"1","sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"],"shown":[["-3","3"],["-3","-1"],["4","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l3-002:q3"},
  {"kind":"apex","A":["-2","-3"],"B":["-2","2"],"L":"5","sigs":["MISC-NUQTA2-WRONGSIDE","MISC-NUQTA2-SWAP"],"shown":[["-2","-3"],["-2","2"]],"key":"ex-2am-talim-nuqta-mustawi-l3-003:q1"},
  {"kind":"fourth","X":["3","-3"],"Y":["-2","-3"],"Z":["-2","2"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-2","-3"],["-2","2"]],"key":"ex-2am-talim-nuqta-mustawi-l3-003:q2"},
  {"kind":"rectarea","A":["3","-3"],"B":["-2","-3"],"C":["-2","2"],"scale":"1","sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"],"shown":[["-2","-3"],["-2","2"]],"key":"ex-2am-talim-nuqta-mustawi-l3-003:q3"},
  {"kind":"seglen","a":["5","0"],"b":["-3","0"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["5","0"],["-3","0"]],"key":"ex-2am-talim-nuqta-mustawi-l3-004:q1"},
  {"kind":"seglen","a":["0","4"],"b":["0","-5"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["0","4"],["0","-5"]],"key":"ex-2am-talim-nuqta-mustawi-l3-004:q2"},
  {"kind":"symo","p":["3","-2"],"sigs":["MISC-NUQTA2-SIGNLEFT","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SWAP"],"shown":[["3","-2"]],"key":"ex-2am-talim-nuqta-mustawi-l3-004:q3"},
  {"kind":"oppcoord","pts":{"Q":["3","-1"],"R":["4","0"],"S":["-4","3"],"T":["1","-3"]},"ref":["-3","2"],"coord":"x","opts":[{"v":"Q","misc":null},{"v":"R","misc":null},{"v":"S","misc":null},{"v":"T","misc":null}],"shown":[["3","-1"],["4","0"],["-4","3"],["1","-3"],["-3","2"]],"key":"ex-2am-talim-nuqta-mustawi-l3-005:q1"},
  {"kind":"oppcoord","pts":{"P":["-3","2"],"Q":["3","-1"],"R":["4","0"],"S":["-4","3"]},"ref":["1","-3"],"coord":"y","opts":[{"v":"P","misc":null},{"v":"Q","misc":null},{"v":"R","misc":null},{"v":"S","misc":null}],"shown":[["-3","2"],["3","-1"],["4","0"],["-4","3"],["1","-3"]],"key":"ex-2am-talim-nuqta-mustawi-l3-005:q2"},
  {"kind":"sym","p":["-3","2"],"axis":"y","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["-3","2"]],"key":"ex-2am-talim-nuqta-mustawi-l3-005:q3"},
  {"kind":"squarepts","A":["-3","1"],"B":["1","1"],"dir":"down","which":"C","sigs":["MISC-NUQTA2-WRONGSIDE","MISC-NUQTA2-SWAP"],"shown":[["-3","1"],["1","1"]],"key":"ex-2am-talim-nuqta-mustawi-l3-006:q1"},
  {"kind":"squarepts","A":["-3","1"],"B":["1","1"],"dir":"down","which":"D","sigs":["MISC-NUQTA2-WRONGSIDE"],"shown":[["-3","1"],["1","1"]],"key":"ex-2am-talim-nuqta-mustawi-l3-006:q2"},
  {"kind":"rectarea","A":["-3","1"],"B":["1","1"],"C":["1","-3"],"scale":"1","sigs":["MISC-NUQTA2-AREASUM"],"shown":[["-3","1"],["1","1"]],"key":"ex-2am-talim-nuqta-mustawi-l3-006:q3"},
  {"kind":"fourth","X":["-5","2"],"Y":["4","2"],"Z":["4","-3"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-5","2"],["4","2"],["4","-3"]],"key":"ex-2am-talim-nuqta-mustawi-l3-007:q1"},
  {"kind":"seglen","a":["-5","2"],"b":["4","2"],"scale":"5","sigs":["MISC-NUQTA2-SCALEMISS"],"shown":[["-5","2"],["4","2"]],"key":"ex-2am-talim-nuqta-mustawi-l3-007:q2"},
  {"kind":"seglen","a":["4","2"],"b":["4","-3"],"scale":"5","sigs":["MISC-NUQTA2-SCALEMISS"],"shown":[["4","2"],["4","-3"]],"key":"ex-2am-talim-nuqta-mustawi-l3-007:q3"},
  {"kind":"fourth","X":["-2.5","3"],"Y":["-2.5","-1"],"Z":["1.5","-1"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-2.5","3"],["-2.5","-1"],["1.5","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l3-008:q1"},
  {"kind":"seglen","a":["-2.5","3"],"b":["-2.5","-1"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["-2.5","3"],["-2.5","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l3-008:q2"},
  {"kind":"seglen","a":["-2.5","-1"],"b":["1.5","-1"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["-2.5","-1"],["1.5","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l3-008:q3"},
  {"kind":"seglen","a":["-4","1"],"b":["-4","-4"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[["-4","1"],["-4","-4"]],"key":"ex-2am-talim-nuqta-mustawi-l3-009:q1"},
  {"kind":"apex","A":["-4","1"],"B":["-4","-4"],"L":"5","sigs":["MISC-NUQTA2-WRONGSIDE"],"shown":[["-4","1"],["-4","-4"]],"key":"ex-2am-talim-nuqta-mustawi-l3-009:q2"},
  {"kind":"fourth","X":["1","1"],"Y":["-4","1"],"Z":["-4","-4"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-4","1"],["-4","-4"]],"key":"ex-2am-talim-nuqta-mustawi-l3-009:q3"},
  {"kind":"fourth","X":["-4","-1"],"Y":["-4","3"],"Z":["2","3"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-4","-1"],["-4","3"],["2","3"]],"key":"ex-2am-talim-nuqta-mustawi-l3-010:q1"},
  {"kind":"rectarea","A":["-4","-1"],"B":["-4","3"],"C":["2","3"],"scale":"1","sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"],"shown":[["-4","-1"],["-4","3"],["2","3"]],"key":"ex-2am-talim-nuqta-mustawi-l3-010:q2"},
  {"kind":"readpt","pts":{"A":["-2","3"],"B":["4","3"],"C":["-2","-3"],"M":["1","0"]},"ask":"M","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l4-001:q1"},
  {"kind":"symc","p":["-2","3"],"c":["1","0"],"sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-BOTHSIGNS"],"shown":[["-2","3"],["1","0"]],"key":"ex-2am-talim-nuqta-mustawi-l4-001:q2"},
  {"kind":"seglen","a":["-2","3"],"b":["4","3"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[],"key":"ex-2am-talim-nuqta-mustawi-l4-001:q3"},
  {"kind":"readpt","pts":{"P":["-3","2"],"Q":["1","-1"],"R":["4","3"],"S":["-1","-3"]},"ask":"S","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l4-002:q1"},
  {"kind":"order","pts":{"P":["-3","2"],"Q":["1","-1"],"R":["4","3"],"S":["-1","-3"]},"coord":"x","names":["P","Q","R","S"],"opts":[{"v":["4","1","-1","-3"],"misc":"MISC-NUQTA2-ORDERDEC"},{"v":["-3","-1","1","4"],"misc":null},{"v":["1","-1","-3","4"],"misc":"MISC-NUQTA2-ORDERABS"},{"v":["-1","-3","1","4"],"misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l4-002:q2"},
  {"kind":"extreme","pts":{"P":["-3","2"],"Q":["1","-1"],"R":["4","3"],"S":["-1","-3"]},"coord":"y","which":"min","opts":[{"v":"P","misc":null},{"v":"Q","misc":"MISC-NUQTA2-ORDERABS"},{"v":"R","misc":null},{"v":"S","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l4-002:q3"},
  {"kind":"readpt","pts":{"A":["2.5","-1"],"B":["-1.5","2"],"C":["0","-2.5"],"D":["3","1.5"],"E":["-3","-0.5"]},"ask":"D","mode":"c","opts":[{"v":["1.5","3"],"misc":"MISC-NUQTA2-SWAP"},{"v":["3","-1.5"],"misc":"MISC-NUQTA2-SIGNAXIS"},{"v":["3","1.5"],"misc":null},{"v":["-3","1.5"],"misc":"MISC-NUQTA2-SIGNLEFT"}],"key":"ex-2am-talim-nuqta-mustawi-l4-003:q1"},
  {"kind":"order","pts":{"A":["2.5","-1"],"B":["-1.5","2"],"C":["0","-2.5"],"D":["3","1.5"],"E":["-3","-0.5"]},"coord":"y","names":["A","B","C","D"],"opts":[{"v":["2","1.5","-1","-2.5"],"misc":"MISC-NUQTA2-ORDERDEC"},{"v":["-1","1.5","2","-2.5"],"misc":"MISC-NUQTA2-ORDERABS"},{"v":["-1","-2.5","1.5","2"],"misc":null},{"v":["-2.5","-1","1.5","2"],"misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l4-003:q2"},
  {"kind":"extreme","pts":{"A":["2.5","-1"],"B":["-1.5","2"],"C":["0","-2.5"],"D":["3","1.5"],"E":["-3","-0.5"]},"coord":"x","which":"max","opts":[{"v":"A","misc":null},{"v":"B","misc":null},{"v":"C","misc":null},{"v":"D","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l4-003:q3"},
  {"kind":"fit","values":["-20","60","-10","30"],"half":6,"opts":[{"v":"5","misc":"MISC-NUQTA2-FRAMESMALL"},{"v":"10","misc":null},{"v":"15","misc":"MISC-NUQTA2-FRAMEBIG"},{"v":"20","misc":"MISC-NUQTA2-FRAMEBIG"}],"key":"ex-2am-talim-nuqta-mustawi-l4-004:q1"},
  {"kind":"placecount","x":"-20","step":"10","sigs":["MISC-NUQTA2-NOSCALE","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l4-004:q2"},
  {"kind":"placecount","x":"60","step":"10","sigs":["MISC-NUQTA2-NOSCALE","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l4-004:q3"},
  {"kind":"fit","values":["-3","1.5","4.5","-1.5"],"half":6,"opts":[{"v":"0.5","misc":"MISC-NUQTA2-FRAMESMALL"},{"v":"1","misc":"MISC-NUQTA2-FRAMEBIG"},{"v":"1.5","misc":null},{"v":"2","misc":"MISC-NUQTA2-FRAMEBIG"}],"key":"ex-2am-talim-nuqta-mustawi-l4-005:q1"},
  {"kind":"placecount","x":"4.5","step":"1.5","sigs":["MISC-NUQTA2-NOSCALE","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l4-005:q2"},
  {"kind":"placecount","x":"-1.5","step":"0.5","sigs":["MISC-NUQTA2-NOSCALE","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l4-005:q3"},
  {"kind":"frametype","perp":true,"u1":2,"u2":1,"opts":[{"v":"ON","misc":"MISC-NUQTA2-UNITIGNORED"},{"v":"OH","misc":null},{"v":"OB","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l4-006:q1"},
  {"kind":"frametype","perp":true,"u1":1,"u2":1,"opts":[{"v":"OH","misc":null},{"v":"OB","misc":null},{"v":"ON","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l4-006:q2"},
  {"kind":"frametype","perp":false,"u1":1,"u2":1,"opts":[{"v":"OB","misc":null},{"v":"ON","misc":null},{"v":"OH","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l4-006:q3"},
  {"kind":"neworigin","p":["3","-2"],"o":["1","1"],"sigs":["MISC-NUQTA2-ORIGINFIXED2","MISC-NUQTA2-ADDORIGIN","MISC-NUQTA2-SWAP"],"shown":[["3","-2"],["1","1"]],"key":"ex-2am-talim-nuqta-mustawi-l4-007:q1"},
  {"kind":"neworigin","p":["-2","4"],"o":["-2","1"],"sigs":["MISC-NUQTA2-ORIGINFIXED2","MISC-NUQTA2-ADDORIGIN","MISC-NUQTA2-SWAP"],"shown":[["-2","4"],["-2","1"]],"key":"ex-2am-talim-nuqta-mustawi-l4-007:q2"},
  {"kind":"neworigin","p":["5","2.5"],"o":["1.5","0.5"],"sigs":["MISC-NUQTA2-ORIGINFIXED2","MISC-NUQTA2-ADDORIGIN","MISC-NUQTA2-SWAP"],"shown":[["5","2.5"],["1.5","0.5"]],"key":"ex-2am-talim-nuqta-mustawi-l4-007:q3"},
  {"kind":"readcoord","pts":{"A":["2","3"],"B":["-3","1"],"C":["-1","-2"],"D":["4","-3"]},"ask":"D","coord":"x","mode":"r","sigs":["MISC-NUQTA2-SIGNLEFT","MISC-NUQTA2-SWAP"],"key":"ex-2am-talim-nuqta-mustawi-l4-008:q1"},
  {"kind":"whichregion","pts":{"A":["2","3"],"B":["-3","1"],"C":["-1","-2"],"D":["4","-3"]},"cond":"--","opts":[{"v":"A","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"B","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"C","misc":null},{"v":"D","misc":"MISC-NUQTA2-SIGNLEFT"}],"key":"ex-2am-talim-nuqta-mustawi-l4-008:q2"},
  {"kind":"order","pts":{"A":["2","3"],"B":["-3","1"],"C":["-1","-2"],"D":["4","-3"]},"coord":"x","names":["A","B","C","D"],"opts":[{"v":["-3","-1","2","4"],"misc":null},{"v":["4","2","-1","-3"],"misc":"MISC-NUQTA2-ORDERDEC"},{"v":["-1","2","-3","4"],"misc":"MISC-NUQTA2-ORDERABS"},{"v":["-1","-3","2","4"],"misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l4-008:q3"},
  {"kind":"fit","values":["-20","60"],"half":6,"opts":[{"v":"5","misc":"MISC-NUQTA2-FRAMESMALL"},{"v":"10","misc":null},{"v":"15","misc":"MISC-NUQTA2-FRAMEBIG"},{"v":"30","misc":"MISC-NUQTA2-FRAMEBIG"}],"key":"ex-2am-talim-nuqta-mustawi-l4-009:q1"},
  {"kind":"fit","values":["-2","-3"],"half":6,"opts":[{"v":"0.25","misc":"MISC-NUQTA2-FRAMESMALL"},{"v":"2","misc":"MISC-NUQTA2-FRAMEBIG"},{"v":"1","misc":null},{"v":"5","misc":"MISC-NUQTA2-FRAMEBIG"}],"key":"ex-2am-talim-nuqta-mustawi-l4-009:q2"},
  {"kind":"placecount","x":"60","step":"10","sigs":["MISC-NUQTA2-NOSCALE","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l4-009:q3"},
  {"kind":"readpt","pts":{"A":["-3","2"],"B":["4","2"],"C":["4","-2"],"D":["-3","-2"]},"ask":"C","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l4-010:q1"},
  {"kind":"seglen","a":["-3","2"],"b":["4","2"],"scale":"1","sigs":["MISC-NUQTA2-LENSUM","MISC-NUQTA2-LENOFF","MISC-NUQTA2-LENMAX"],"shown":[],"key":"ex-2am-talim-nuqta-mustawi-l4-010:q2"},
  {"kind":"rectarea","A":["-3","2"],"B":["4","2"],"C":["4","-2"],"scale":"1","sigs":["MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"],"shown":[],"key":"ex-2am-talim-nuqta-mustawi-l4-010:q3"},
  {"kind":"fourth","X":["-4","3"],"Y":["5","3"],"Z":["5","-2"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-4","3"],["5","3"],["5","-2"]],"key":"ex-2am-talim-nuqta-mustawi-l5-001:q1"},
  {"kind":"seglen","a":["-4","3"],"b":["5","3"],"scale":"5","sigs":["MISC-NUQTA2-SCALEMISS"],"shown":[["-4","3"],["5","3"]],"key":"ex-2am-talim-nuqta-mustawi-l5-001:q2"},
  {"kind":"rectarea","A":["-4","3"],"B":["5","3"],"C":["5","-2"],"scale":"5","sigs":["MISC-NUQTA2-SCALEMISS","MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"],"shown":[["-4","3"],["5","3"],["5","-2"]],"key":"ex-2am-talim-nuqta-mustawi-l5-001:q3"},
  {"kind":"cost","area":"1125","price":"40","sigs":["MISC-NUQTA2-COSTADD"],"key":"ex-2am-talim-nuqta-mustawi-l5-001:q4"},
  {"kind":"fourth","X":["-4","-3"],"Y":["4","-3"],"Z":["4","2"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-4","-3"],["4","-3"],["4","2"]],"key":"ex-2am-talim-nuqta-mustawi-l5-002:q1"},
  {"kind":"seglen","a":["-4","-3"],"b":["4","-3"],"scale":"0.5","sigs":["MISC-NUQTA2-SCALEMISS"],"shown":[["-4","-3"],["4","-3"]],"key":"ex-2am-talim-nuqta-mustawi-l5-002:q2"},
  {"kind":"rectarea","A":["-4","-3"],"B":["4","-3"],"C":["4","2"],"scale":"0.5","sigs":["MISC-NUQTA2-SCALEMISS","MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"],"shown":[["-4","-3"],["4","-3"],["4","2"]],"key":"ex-2am-talim-nuqta-mustawi-l5-002:q3"},
  {"kind":"cost","area":"10","price":"1200","sigs":["MISC-NUQTA2-COSTADD"],"key":"ex-2am-talim-nuqta-mustawi-l5-002:q4"},
  {"kind":"axiscls","p":["-3","0"],"opts":[{"v":"onY","misc":"MISC-NUQTA2-ONAXIS"},{"v":"onX","misc":null},{"v":"O","misc":null},{"v":"out","misc":null}],"shown":[["-3","0"]],"key":"ex-2am-talim-nuqta-mustawi-l5-003:q1"},
  {"kind":"axiscls","p":["0","2.5"],"opts":[{"v":"onX","misc":"MISC-NUQTA2-ONAXIS"},{"v":"out","misc":null},{"v":"onY","misc":null},{"v":"O","misc":null}],"shown":[["0","2.5"]],"key":"ex-2am-talim-nuqta-mustawi-l5-003:q2"},
  {"kind":"sym","p":["3","-2"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["3","-2"]],"key":"ex-2am-talim-nuqta-mustawi-l5-003:q3"},
  {"kind":"seglen","a":["-3","0"],"b":["4","0"],"scale":"100","sigs":["MISC-NUQTA2-SCALEMISS"],"shown":[["-3","0"],["4","0"]],"key":"ex-2am-talim-nuqta-mustawi-l5-003:q4"},
  {"kind":"readpt","pts":{"J":["2","1"],"L":["-3","2"],"D":["0","-2"],"C":["3","-1"]},"ask":"L","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l5-004:q1"},
  {"kind":"figaxis","pts":{"J":["2","1"],"L":["-3","2"],"D":["0","-2"],"C":["3","-1"]},"axis":"y","opts":[{"v":"J","misc":null},{"v":"L","misc":null},{"v":"D","misc":null},{"v":"C","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l5-004:q2"},
  {"kind":"sym","p":["3","-1"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["3","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l5-004:q3"},
  {"kind":"region","p":["2","1"],"opts":[{"v":"--","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"++","misc":null},{"v":"-+","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"+-","misc":"MISC-NUQTA2-SIGNAXIS"}],"shown":[["2","1"]],"key":"ex-2am-talim-nuqta-mustawi-l5-004:q4"},
  {"kind":"fourth","X":["-3","4"],"Y":["2","4"],"Z":["2","1"],"mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"shown":[["-3","4"],["2","4"],["2","1"]],"key":"ex-2am-talim-nuqta-mustawi-l5-005:q1"},
  {"kind":"seglen","a":["-3","4"],"b":["2","4"],"scale":"2","sigs":["MISC-NUQTA2-SCALEMISS"],"shown":[["-3","4"],["2","4"]],"key":"ex-2am-talim-nuqta-mustawi-l5-005:q2"},
  {"kind":"rectarea","A":["-3","4"],"B":["2","4"],"C":["2","1"],"scale":"2","sigs":["MISC-NUQTA2-SCALEMISS","MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"],"shown":[["-3","4"],["2","4"],["2","1"]],"key":"ex-2am-talim-nuqta-mustawi-l5-005:q3"},
  {"kind":"cost","area":"60","price":"350","sigs":["MISC-NUQTA2-COSTADD"],"key":"ex-2am-talim-nuqta-mustawi-l5-005:q4"},
  {"kind":"neworigin","p":["2","3"],"o":["-1","1"],"sigs":["MISC-NUQTA2-ORIGINFIXED2","MISC-NUQTA2-ADDORIGIN"],"shown":[["2","3"],["-1","1"]],"key":"ex-2am-talim-nuqta-mustawi-l5-006:q1"},
  {"kind":"neworigin","p":["-2","-2"],"o":["-1","1"],"sigs":["MISC-NUQTA2-ORIGINFIXED2","MISC-NUQTA2-ADDORIGIN"],"shown":[["-2","-2"],["-1","1"]],"key":"ex-2am-talim-nuqta-mustawi-l5-006:q2"},
  {"kind":"region","p":["-1","-3"],"opts":[{"v":"++","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"--","misc":null},{"v":"+-","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"-+","misc":"MISC-NUQTA2-SIGNAXIS"}],"shown":[["-1","-3"]],"key":"ex-2am-talim-nuqta-mustawi-l5-006:q3"},
  {"kind":"readpt","pts":{"A":["-4","2"],"B":["1","3"],"C":["3","-2"],"D":["-2","-3"]},"ask":"B","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l5-007:q1"},
  {"kind":"order","pts":{"A":["-4","2"],"B":["1","3"],"C":["3","-2"],"D":["-2","-3"]},"coord":"x","names":["A","B","C","D"],"opts":[{"v":["3","1","-2","-4"],"misc":"MISC-NUQTA2-ORDERDEC"},{"v":["1","-2","3","-4"],"misc":"MISC-NUQTA2-ORDERABS"},{"v":["-4","-2","1","3"],"misc":null},{"v":["-2","-4","1","3"],"misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l5-007:q2"},
  {"kind":"extreme","pts":{"A":["-4","2"],"B":["1","3"],"C":["3","-2"],"D":["-2","-3"]},"coord":"y","which":"max","opts":[{"v":"A","misc":null},{"v":"B","misc":null},{"v":"C","misc":null},{"v":"D","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l5-007:q3"},
  {"kind":"whichregion","pts":{"A":["-4","2"],"B":["1","3"],"C":["3","-2"],"D":["-2","-3"]},"cond":"-+","opts":[{"v":"A","misc":null},{"v":"B","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"C","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"D","misc":"MISC-NUQTA2-SIGNAXIS"}],"key":"ex-2am-talim-nuqta-mustawi-l5-007:q4"},
  {"kind":"squarepts","A":["-2","-1"],"B":["3","-1"],"dir":"up","which":"C","sigs":["MISC-NUQTA2-WRONGSIDE","MISC-NUQTA2-SWAP"],"shown":[["-2","-1"],["3","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l5-008:q1"},
  {"kind":"squarepts","A":["-2","-1"],"B":["3","-1"],"dir":"up","which":"D","sigs":["MISC-NUQTA2-WRONGSIDE","MISC-NUQTA2-SWAP"],"shown":[["-2","-1"],["3","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l5-008:q2"},
  {"kind":"rectarea","A":["-2","-1"],"B":["3","-1"],"C":["3","4"],"scale":"3","sigs":["MISC-NUQTA2-SCALEMISS","MISC-NUQTA2-AREASUM","MISC-NUQTA2-AREAPERIM"],"shown":[["-2","-1"],["3","-1"]],"key":"ex-2am-talim-nuqta-mustawi-l5-008:q3"},
  {"kind":"cost","area":"225","price":"80","sigs":["MISC-NUQTA2-COSTADD"],"key":"ex-2am-talim-nuqta-mustawi-l5-008:q4"},
  {"kind":"fit","values":["-30","45","60","-15"],"half":6,"opts":[{"v":"5","misc":"MISC-NUQTA2-FRAMESMALL"},{"v":"10","misc":"MISC-NUQTA2-FRAMEBIG"},{"v":"15","misc":null},{"v":"30","misc":"MISC-NUQTA2-FRAMEBIG"}],"key":"ex-2am-talim-nuqta-mustawi-l5-009:q1"},
  {"kind":"placecount","x":"45","step":"15","sigs":["MISC-NUQTA2-NOSCALE","MISC-NUQTA2-SIGNLEFT"],"key":"ex-2am-talim-nuqta-mustawi-l5-009:q2"},
  {"kind":"region","p":["45","-15"],"opts":[{"v":"-+","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"+-","misc":null},{"v":"++","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"--","misc":"MISC-NUQTA2-SIGNLEFT"}],"shown":[["45","-15"]],"key":"ex-2am-talim-nuqta-mustawi-l5-009:q3"},
  {"kind":"frametype","perp":true,"u1":3,"u2":1,"opts":[{"v":"ON","misc":"MISC-NUQTA2-UNITIGNORED"},{"v":"OH","misc":null},{"v":"OB","misc":null}],"key":"ex-2am-talim-nuqta-mustawi-l5-009:q4"},
  {"kind":"readpt","pts":{"S":["-3","2"],"T":["3","2"],"U":["3","-2"],"W":["0","4"]},"ask":"W","mode":"r","sigs":["MISC-NUQTA2-SWAP","MISC-NUQTA2-SIGNAXIS"],"key":"ex-2am-talim-nuqta-mustawi-l5-010:q1"},
  {"kind":"seglen","a":["-3","2"],"b":["3","2"],"scale":"2","sigs":["MISC-NUQTA2-SCALEMISS"],"shown":[],"key":"ex-2am-talim-nuqta-mustawi-l5-010:q2"},
  {"kind":"sym","p":["3","-2"],"axis":"x","mode":"r","sigs":["MISC-NUQTA2-SYMMIX","MISC-NUQTA2-BOTHSIGNS","MISC-NUQTA2-SWAP"],"shown":[["3","-2"]],"key":"ex-2am-talim-nuqta-mustawi-l5-010:q3"},
  {"kind":"region","p":["3","-2"],"opts":[{"v":"-+","misc":"MISC-NUQTA2-BOTHSIGNS"},{"v":"++","misc":"MISC-NUQTA2-SIGNAXIS"},{"v":"--","misc":"MISC-NUQTA2-SIGNLEFT"},{"v":"+-","misc":null}],"shown":[["3","-2"]],"key":"ex-2am-talim-nuqta-mustawi-l5-010:q4"},
];

const SC = 10n ** 6n;
const D = (s) => {
  const m = /^(-)?(\d+)(?:\.(\d{1,6}))?$/.exec(String(s).trim());
  if (!m) throw new Error(`nombre illisible « ${s} »`);
  const v = BigInt(m[2]) * SC + BigInt((m[3] ?? '').padEnd(6, '0') || '0');
  return m[1] ? -v : v;
};
const txt = (v) => {
  const neg = v < 0n; const a = neg ? -v : v;
  const i = a / SC; const f = String(a % SC).padStart(6, '0').replace(/0+$/, '');
  return `${neg ? '-' : ''}${i}${f ? `.${f}` : ''}`;
};
const abs = (v) => (v < 0n ? -v : v);
const B = (n) => BigInt(n);
const mul = (a, b) => (a * b) / SC; // produit de deux valeurs à l'échelle SC
/** quotient exact a / b (valeurs à l'échelle SC) -> à l'échelle SC ; refusé s'il n'est pas entier */
const quo = (a, b) => { if (a % b !== 0n) throw new Error(`${a} non divisible par ${b}`); return (a / b) * SC; };
const PT = (a) => [D(a[0]), D(a[1])];
const swapP = (p) => [p[1], p[0]];
const eqP = (a, b) => a[0] === b[0] && a[1] === b[1];
const figPts = (s) => Object.fromEntries(Object.entries(s.pts).map(([k, v]) => [k, PT(v)]));

const CHOICE_KINDS = new Set(['whichpt', 'region', 'axiscls', 'figaxis', 'fit', 'frametype', 'extreme', 'order', 'oppcoord', 'whichregion', 'quadtype', 'symOyesno']);
const isChoice = (s) => CHOICE_KINDS.has(s.kind) || s.mode === 'c';
const isPointKind = (s) => ['readpt', 'sym', 'symo', 'fourth', 'apex', 'squarepts', 'neworigin', 'symc', 'center', 'translate'].includes(s.kind);

/* ── régions et classes ── */
const rcode = (p) => `${p[0] > 0n ? '+' : '-'}${p[1] > 0n ? '+' : '-'}`; // seulement pour des points hors axes
const REGION_OF_WORDS = (c) => `${c.includes('يمين') ? '+' : '-'}${c.includes('فوق') ? '+' : '-'}`;
const flip = (code, i) => { const a = code.split(''); a[i] = a[i] === '+' ? '-' : '+'; return a.join(''); };
const clsOf = (p) => (p[0] === 0n && p[1] === 0n ? 'O' : p[1] === 0n ? 'onX' : p[0] === 0n ? 'onY' : 'out');
const frameClass = (s) => (s.perp && s.u1 === s.u2 ? 'ON' : s.perp ? 'OH' : 'OB');

/* ── quadrilatère ── */
const d2 = (a, b) => (a[0] - b[0]) ** 2n + (a[1] - b[1]) ** 2n;
const quadClass = (Pp) => {
  const s = [0, 1, 2, 3].map((i) => d2(Pp[i], Pp[(i + 1) % 4]));
  const mid = (Pp[0][0] + Pp[2][0] === Pp[1][0] + Pp[3][0]) && (Pp[0][1] + Pp[2][1] === Pp[1][1] + Pp[3][1]);
  if (!mid) return 'ge';
  const eqd = d2(Pp[0], Pp[2]) === d2(Pp[1], Pp[3]);
  if (s.every((v) => v === s[0])) return eqd ? 'sq' : 'rh';
  return eqd ? 're' : 'pa';
};

/** rectangle X-Y-Z consécutifs, côtés parallèles aux axes ? */
const axisParallel = (X, Y, Z) => (X[0] === Y[0] && Y[1] === Z[1]) || (X[1] === Y[1] && Y[0] === Z[0]);
const len1 = (a, b) => { if (a[0] !== b[0] && a[1] !== b[1]) throw new Error('segment hors grille'); return abs(a[0] - b[0]) + abs(a[1] - b[1]); };

/* ── réponse construite : valeur BigInt (nombre) ou paire (point) ── */
const pointKey = (s) => {
  switch (s.kind) {
    case 'readpt': return PT(s.pts[s.ask]);
    case 'sym': { const p = PT(s.p); return s.axis === 'x' ? [p[0], -p[1]] : [-p[0], p[1]]; }
    case 'symo': { const p = PT(s.p); return [-p[0], -p[1]]; }
    case 'symc': { const p = PT(s.p); const c = PT(s.c); return [2n * c[0] - p[0], 2n * c[1] - p[1]]; }
    case 'fourth': {
      const [X, Y, Z] = [PT(s.X), PT(s.Y), PT(s.Z)];
      if (!axisParallel(X, Y, Z)) throw new Error(`${s.key} : rectangle non parallèle aux axes`);
      return [X[0] + Z[0] - Y[0], X[1] + Z[1] - Y[1]];
    }
    case 'apex': {
      const [A, Bp] = [PT(s.A), PT(s.B)]; const L = D(s.L);
      if (A[0] !== Bp[0]) throw new Error('AB doit être vertical');
      const cands = [A[0] + L, A[0] - L].filter((x) => x > 0n);
      if (cands.length !== 1) throw new Error(`${s.key} : « abscisse positive » ne désigne pas un seul point`);
      return [cands[0], A[1]];
    }
    case 'squarepts': {
      const [A, Bp] = [PT(s.A), PT(s.B)];
      const n = len1(A, Bp);
      const v = { up: [0n, n], down: [0n, -n], left: [-n, 0n], right: [n, 0n] }[s.dir];
      if ((s.dir === 'up' || s.dir === 'down') !== (A[1] === Bp[1])) throw new Error('direction du carré incohérente');
      const base = s.which === 'C' ? Bp : A;
      return [base[0] + v[0], base[1] + v[1]];
    }
    case 'neworigin': { const p = PT(s.p); const o = PT(s.o); return [p[0] - o[0], p[1] - o[1]]; }
    case 'center': { const [A, Cp] = [PT(s.A), PT(s.C)]; return [(A[0] + Cp[0]) / 2n, (A[1] + Cp[1]) / 2n]; }
    case 'translate': { const p = PT(s.p); return [p[0] + D(s.a), p[1] - D(s.b)]; }
    default: throw new Error(`pas de point pour ${s.kind}`);
  }
};
const numKey = (s) => {
  switch (s.kind) {
    case 'readcoord': { const p = PT(s.pts[s.ask]); return s.coord === 'x' ? p[0] : p[1]; }
    case 'distaxis': { const p = PT(s.p); return abs(s.axis === 'x' ? p[1] : p[0]); }
    case 'seglen': return mul(len1(PT(s.a), PT(s.b)), D(s.scale));
    case 'rectarea': {
      const [A, Bp, Cp] = [PT(s.A), PT(s.B), PT(s.C)];
      if (!axisParallel(A, Bp, Cp)) throw new Error('rectangle non parallèle aux axes');
      const sc = D(s.scale);
      return mul(mul(len1(A, Bp), sc), mul(len1(Bp, Cp), sc));
    }
    case 'cost': return mul(D(s.area), D(s.price));
    case 'placecount': return quo(D(s.x), D(s.step));
    case 'countwhere': {
      const f = { onaxis: (p) => p[0] === 0n || p[1] === 0n, xpos: (p) => p[0] > 0n, xneg: (p) => p[0] < 0n, ypos: (p) => p[1] > 0n, yneg: (p) => p[1] < 0n }[s.cond];
      return B(Object.values(figPts(s)).filter(f).length) * SC;
    }
    default: throw new Error(`pas de nombre pour ${s.kind}`);
  }
};
// len1 renvoie des unités à l'échelle SC (différence de valeurs SC) : l'aire se calcule sur des valeurs SC, mul recadre.
const keyValue = (s) => (isPointKind(s) ? pointKey(s) : numKey(s));

/* ── l'erreur nommée, recalculée ── */
/** base d'une erreur de signe / d'échange : le point SOURCE pour les symétries, sinon la clé */
const baseOf = (s, key) => (['sym', 'symo', 'symc'].includes(s.kind) ? PT(s.p) : key);
const sigValue = (misc, s, key) => {
  const NAME = misc.replace('MISC-NUQTA2-', '');
  if (s.kind === 'readcoord') {
    const p = PT(s.pts[s.ask]);
    if (NAME === 'SWAP') return s.coord === 'x' ? p[1] : p[0];
    if (NAME === 'SIGNLEFT' || NAME === 'SIGNAXIS') return -key;
  }
  if (s.kind === 'distaxis') {
    const p = PT(s.p);
    if (NAME === 'SWAP') return abs(s.axis === 'x' ? p[0] : p[1]);
    if (NAME === 'NEGDIST') return -key;
  }
  if (s.kind === 'placecount') {
    if (NAME === 'NOSCALE') return D(s.x);
    if (NAME === 'SIGNLEFT') return -key;
  }
  if (s.kind === 'seglen') {
    const a = PT(s.a); const b = PT(s.b); const [u1, u2] = a[0] === b[0] ? [a[1], b[1]] : [a[0], b[0]];
    const sc = D(s.scale); const n = abs(u1 - u2);
    if (NAME === 'LENSUM') return mul(u1 + u2, sc);
    if (NAME === 'LENOFF') return mul(n + SC, sc);
    if (NAME === 'LENMAX') return mul(abs(u1) > abs(u2) ? abs(u1) : abs(u2), sc);
    if (NAME === 'SCALEMISS') return n;
  }
  if (s.kind === 'rectarea') {
    const [A, Bp, Cp] = [PT(s.A), PT(s.B), PT(s.C)]; const a = len1(A, Bp); const b = len1(Bp, Cp); const sc = D(s.scale);
    if (NAME === 'AREASUM') return mul(a + b, sc);
    if (NAME === 'AREAPERIM') return mul(2n * (a + b), sc);
    if (NAME === 'SCALEMISS') return mul(a, b);
  }
  if (s.kind === 'cost' && NAME === 'COSTADD') return D(s.area) + D(s.price);
  if (isPointKind(s)) {
    const b = baseOf(s, key);
    switch (NAME) {
      case 'SWAP': return swapP(key);
      case 'SIGNAXIS': return [b[0], -b[1]];
      case 'SIGNLEFT': return [-b[0], b[1]];
      case 'BOTHSIGNS': return [-b[0], -b[1]];
      case 'SYMMIX': { const p = PT(s.p); return s.axis === 'x' ? [-p[0], p[1]] : [p[0], -p[1]]; }
      case 'WRONGSIDE': {
        if (s.kind === 'apex') { const A = PT(s.A); return [A[0] - D(s.L), A[1]]; }
        const [A, Bp] = [PT(s.A), PT(s.B)]; const n = len1(A, Bp);
        const v = { up: [0n, n], down: [0n, -n], left: [-n, 0n], right: [n, 0n] }[s.dir]; const base = s.which === 'C' ? Bp : A;
        return [base[0] - v[0], base[1] - v[1]];
      }
      case 'ORIGINFIXED2': return PT(s.p);
      case 'ADDORIGIN': { const p = PT(s.p); const o = PT(s.o); return [p[0] + o[0], p[1] + o[1]]; }
      default: break;
    }
    if (misc === 'MISC-JAMNISB-SUBNOFLIP' && s.kind === 'translate') { const p = PT(s.p); return [p[0] + D(s.a), p[1] + D(s.b)]; }
  }
  throw new Error(`erreur nommée inconnue ${misc} pour ${s.kind}`);
};
const sameSig = (a, b) => (Array.isArray(a) ? Array.isArray(b) && eqP(a, b) : a === b);

/* ── jugement d'une option (QCM) ── */
const fitState = (vals, s, half) => {
  if (vals.some((v) => v % s !== 0n)) return 'between';
  if (vals.some((v) => abs(v / s) > B(half))) return 'off';
  return 'fits';
};
/** lettres correctes d'une question « figure » : la valeur retapée de chaque lettre est jugée */
const letterFits = (s, L) => {
  const p = PT(s.pts[L]);
  switch (s.kind) {
    case 'whichpt': return eqP(p, PT(s.target));
    case 'figaxis': return s.axis === 'y' ? (p[0] === 0n && p[1] !== 0n) : (p[1] === 0n && p[0] !== 0n);
    case 'oppcoord': { const r = PT(s.ref); return s.coord === 'x' ? p[0] === -r[0] : p[1] === -r[1]; }
    case 'whichregion': return p[0] !== 0n && p[1] !== 0n && rcode(p) === s.cond;
    default: throw new Error(s.kind);
  }
};
const extremeLetter = (s, by) => {
  const i = s.coord === 'x' ? 0 : 1; const pts = figPts(s); const names = s.opts.map((o) => o.v);
  const val = (L) => by(pts[L][i]);
  const pickMin = s.which === 'min';
  return names.reduce((a, b) => (pickMin ? (val(b) < val(a) ? b : a) : (val(b) > val(a) ? b : a)));
};
const orderValues = (s) => { const i = s.coord === 'x' ? 0 : 1; const pts = figPts(s); return s.names.map((L) => pts[L][i]); };
const asc = (xs) => [...xs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

const isTrue = (s, o) => {
  switch (s.kind) {
    case 'whichpt': case 'figaxis': case 'oppcoord': case 'whichregion': return letterFits(s, o.v);
    case 'region': return o.v === rcode(PT(s.p));
    case 'axiscls': return o.v === clsOf(PT(s.p));
    case 'fit': return fitState(s.values.map(D), D(o.v), s.half) === 'fits';
    case 'frametype': return o.v === frameClass(s);
    case 'extreme': return o.v === extremeLetter(s, (v) => v);
    case 'order': { const want = asc(orderValues(s)); return o.v.length === want.length && o.v.every((v, i) => D(v) === want[i]); }
    case 'quadtype': return o.v === quadClass(s.pts.map(PT));
    case 'symOyesno': { const E = PT(s.E); const L = PT(s.L); return (o.v === 'Y') === (L[0] === -E[0] && L[1] === -E[1]); }
    default: { // mode 'c' d'une réponse construite
      const key = keyValue(s);
      return isPointKind(s) ? eqP(PT(o.v), key) : D(o.v) === key;
    }
  }
};

/** valeur (point / nombre / code) que donnerait l'élève avec l'erreur nommée, comparée à l'option */
const errorMatches = (s, misc, o) => {
  const NAME = misc.replace('MISC-NUQTA2-', '');
  switch (s.kind) {
    case 'whichpt': case 'whichregion': {
      const t = s.kind === 'whichpt' ? PT(s.target) : null; const p = PT(s.pts[o.v]);
      if (s.kind === 'whichpt') {
        const f = { SWAP: swapP(t), SIGNAXIS: [t[0], -t[1]], SIGNLEFT: [-t[0], t[1]], BOTHSIGNS: [-t[0], -t[1]] }[NAME];
        return !!f && eqP(f, p);
      }
      const c = s.cond; const g = { SIGNAXIS: flip(c, 1), SIGNLEFT: flip(c, 0), BOTHSIGNS: flip(flip(c, 0), 1), SWAP: c[1] + c[0] }[NAME];
      return !!g && p[0] !== 0n && p[1] !== 0n && rcode(p) === g;
    }
    case 'region': {
      const c = rcode(PT(s.p)); const g = { SIGNAXIS: flip(c, 1), SIGNLEFT: flip(c, 0), BOTHSIGNS: flip(flip(c, 0), 1), SWAP: c[1] + c[0] }[NAME];
      return o.v === g;
    }
    case 'axiscls': { const p = PT(s.p); return NAME === 'ONAXIS' && ['onX', 'onY'].includes(clsOf(p)) && o.v === clsOf(swapP(p)); }
    case 'figaxis': {
      if (NAME !== 'ONAXIS') return false; const p = PT(s.pts[o.v]);
      return s.axis === 'y' ? (p[1] === 0n && p[0] !== 0n) : (p[0] === 0n && p[1] !== 0n);
    }
    case 'fit': {
      const st = fitState(s.values.map(D), D(o.v), s.half);
      if (NAME === 'FRAMESMALL') return st === 'off';
      if (NAME === 'FRAMEBIG') return st === 'between';
      return false;
    }
    case 'frametype': return NAME === 'UNITIGNORED' && o.v === 'ON' && frameClass(s) === 'OH';
    case 'extreme': return NAME === 'ORDERABS' && o.v === extremeLetter(s, abs) && o.v !== extremeLetter(s, (v) => v);
    case 'order': {
      const vals = orderValues(s); const want = asc(vals);
      const g = NAME === 'ORDERDEC' ? [...want].reverse() : NAME === 'ORDERABS' ? [...vals].sort((a, b) => (abs(a) < abs(b) ? -1 : abs(a) > abs(b) ? 1 : 0)) : null;
      return !!g && o.v.length === g.length && o.v.every((v, i) => D(v) === g[i]);
    }
    default: {
      const key = keyValue(s); const f = sigValue(misc, s, key);
      return isPointKind(s) ? eqP(PT(o.v), f) : D(o.v) === f;
    }
  }
};

/* ── relecture des valeurs d'une option du fichier (contenu LaTeX) ── */
const clean = (c) => c.replace(/\{,\}/g, '.').replace(/\\,/g, '');
const numsOf = (c) => (clean(c).match(/-?\d+(?:\.\d+)?/g) ?? []);
const pairsOf = (c) => [...clean(c).matchAll(/\(\s*(-?\d+(?:\.\d+)?)\s*;\s*(-?\d+(?:\.\d+)?)\s*\)/g)].map((m) => [m[1], m[2]]);
const optionValue = (s, content) => {
  switch (s.kind) {
    case 'whichpt': case 'figaxis': case 'extreme': case 'whichregion': return /\$([A-Z])\$/.exec(content)?.[1];
    case 'oppcoord': return /\$([A-Z])\(/.exec(content)?.[1];
    case 'region': return REGION_OF_WORDS(content);
    case 'axiscls': return content.includes('المبدأ') ? 'O' : content.includes('خارج') ? 'out' : content.includes('الفواصل') ? 'onX' : 'onY';
    case 'frametype': return content.includes('وغير متجانس') ? 'OH' : content.includes('غير متعامد') ? 'OB' : 'ON';
    case 'quadtype': return content.includes('مربّع') ? 'sq' : content.includes('معيّن') ? 'rh' : content.includes('مستطيل') ? 're' : content.includes('متوازي') ? 'pa' : 'ge';
    case 'symOyesno': return content.trim() === 'نعم' ? 'Y' : 'N';
    case 'order': return numsOf(content);
    default: return isPointKind(s) ? pairsOf(content)[0] : numsOf(content)[0];
  }
};
const sameValue = (a, b) => {
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => sameValue(x, b[i]));
  return /^-?\d/.test(String(a)) ? D(a) === D(b) : a === b;
};

const choiceIndex = (s) => {
  const hits = s.opts.map((o, k) => (isTrue(s, o) ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`${s.key} : ${hits.length} options justes`);
  return hits[0];
};
const answerOf = (s) => {
  if (isChoice(s)) return C('ABCDEF'[choiceIndex(s)]);
  const k = keyValue(s);
  return isPointKind(s) ? P(txt(k[0]), txt(k[1])) : R(txt(k));
};

export const ORACLE = Object.fromEntries(SPECS.map((s) => [s.key, answerOf(s)]));

/* ── الكفاءة et étape non comptée attendues, par genre de question ── */
const LP_OF = {
  fit: 1, frametype: 1,
  readpt: 2, readcoord: 2, whichpt: 2, region: 2, extreme: 2, order: 2, countwhere: 2, neworigin: 2, oppcoord: 2, whichregion: 2,
  axiscls: 3, figaxis: 3, distaxis: 3, sym: 3, symo: 3, fourth: 3, apex: 3, squarepts: 3, seglen: 3, rectarea: 3, cost: 3, placecount: 3,
  symc: 3, center: 3, translate: 3, quadtype: 3, symOyesno: 3,
};
// étapes d'une leçon antérieure ou d'un autre sujet : symétrie centrale (2am.m2), nature d'un quadrilatère, coût, opérations signées.
const UNCOUNTED = new Set(['symc', 'center', 'translate', 'quadtype', 'symo', 'symOyesno', 'cost']);
const LP_CODE = (n) => `2am_talim-nuqta-mustawi_P${n}`;
const NEEDS_FIGURE = new Set(['readpt', 'readcoord', 'whichpt', 'figaxis', 'extreme', 'order', 'countwhere', 'whichregion']);

const here = dirname(fileURLToPath(import.meta.url));
const SHEETS_DIR = join(here, '..', '..', 'content', 'practice', '2am', 'talim-nuqta-mustawi');
const loadSheets = () => {
  const out = new Map();
  for (const lvl of readdirSync(SHEETS_DIR)) for (const f of readdirSync(join(SHEETS_DIR, lvl))) {
    const ex = JSON.parse(readFileSync(join(SHEETS_DIR, lvl, f), 'utf8')); out.set(ex.id, ex);
  }
  return out;
};

/** relit les fichiers du banc : clé, QCM, signatures et distracteurs nommés, figures, énoncés, الكفاءات */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q])); const sheets = loadSheets();
  const uncounted = new Map();
  for (const s of SPECS) {
    const q = byKey.get(s.key);
    if (!q) { errs.push(`${s.key} : question absente`); continue; }
    const exId = s.key.split(':')[0]; const ex = sheets.get(exId);
    if (!ex) { errs.push(`${s.key} : feuille absente`); continue; }
    try {
      /* الكفاءة + counted */
      const lp = q.learningPoints?.find((l) => l.role === 'primary')?.code;
      if (lp !== LP_CODE(LP_OF[s.kind])) errs.push(`${s.key} : الكفاءة ${lp} ≠ ${LP_CODE(LP_OF[s.kind])} (${s.kind})`);
      if ((q.counted === false) !== UNCOUNTED.has(s.kind)) errs.push(`${s.key} : counted=${q.counted} mais ${s.kind} ${UNCOUNTED.has(s.kind) ? 'est' : "n'est pas"} une étape non comptée`);
      if (q.counted === false) uncounted.set(exId, (uncounted.get(exId) ?? 0) + 1);
      /* figure d'énoncé = points retapés ; énoncé = coordonnées retapées */
      const fig = ex.statement.figure;
      const text = `${ex.statement.content} ${q.statement}`; const printed = pairsOf(text);
      if (NEEDS_FIGURE.has(s.kind)) {
        if (!fig) errs.push(`${s.key} : ${s.kind} sans statement.figure`);
        else {
          const fp = Object.fromEntries(Object.entries(fig.points).filter(([k]) => k !== 'O').map(([k, v]) => [k, v.map(String)]));
          const sp = s.pts;
          for (const [k, v] of Object.entries(sp)) {
            if (!fp[k]) errs.push(`${s.key} : point ${k} absent de la figure`);
            else if (D(v[0]) !== D(fp[k][0]) || D(v[1]) !== D(fp[k][1])) errs.push(`${s.key} : point ${k} de la figure ${fp[k]} ≠ ${v}`);
          }
          for (const k of Object.keys(fp)) if (!sp[k]) errs.push(`${s.key} : point ${k} de la figure inconnu de l'oracle`);
          if (fig.points.O?.[0] !== 0 || fig.points.O?.[1] !== 0) errs.push(`${s.key} : O de la figure n'est pas l'origine`);
          if (fig.grid !== true || fig.axes !== true) errs.push(`${s.key} : la figure doit porter grid et axes`);
        }
        if (['readpt', 'order', 'extreme', 'figaxis', 'countwhere', 'readcoord'].includes(s.kind) && printed.length) {
          for (const [x, y] of printed) for (const p of Object.values(figPts(s))) if (D(x) === p[0] && D(y) === p[1]) errs.push(`${s.key} : l'énoncé imprime ${x} ; ${y} alors qu'il faut le lire`);
        }
      }
      for (const sh of s.shown ?? []) {
        if (!printed.some(([x, y]) => D(x) === D(sh[0]) && D(y) === D(sh[1]))) errs.push(`${s.key} : (${sh[0]} ; ${sh[1]}) absent de l'énoncé`);
      }
      if (s.kind === 'readpt') {
        for (const [x, y] of printed) { const a = PT(s.pts[s.ask]); if (D(x) === a[0] && D(y) === a[1]) errs.push(`${s.key} : la réponse est imprimée`); }
      }

      /* clé / QCM */
      if (!isChoice(s)) {
        const key = keyValue(s);
        const isPt = isPointKind(s);
        if (isPt) {
          if (q.answerType !== 'point') { errs.push(`${s.key} : devrait être point`); continue; }
          if (D(String(q.expectedAnswer.x)) !== key[0] || D(String(q.expectedAnswer.y)) !== key[1]) errs.push(`${s.key} : clé (${q.expectedAnswer.x} ; ${q.expectedAnswer.y}) ≠ (${txt(key[0])} ; ${txt(key[1])})`);
        } else {
          if (q.answerType !== 'rational') { errs.push(`${s.key} : devrait être rational`); continue; }
          if (D(String(q.expectedAnswer)) !== key) errs.push(`${s.key} : clé ${q.expectedAnswer} ≠ ${txt(key)}`);
        }
        const wantIds = new Set(s.sigs ?? []); const gotIds = new Set();
        for (const sg of q.misconceptionSignatures ?? []) {
          gotIds.add(sg.id);
          const f = sigValue(sg.id, s, key);
          const got = isPt ? PT([sg.value.x, sg.value.y]) : D(String(sg.value));
          if (!sameSig(got, f)) errs.push(`${s.key} : signature ${sg.id}=${JSON.stringify(sg.value)} ≠ l'erreur nommée`);
          if (sameSig(got, key)) errs.push(`${s.key} : signature ${sg.id} = la bonne réponse`);
        }
        if (wantIds.size !== gotIds.size || [...wantIds].some((i) => !gotIds.has(i))) errs.push(`${s.key} : signatures [${[...gotIds]}] ≠ retapées [${[...wantIds]}]`);
      } else {
        if (q.answerType !== 'choice') { errs.push(`${s.key} : devrait être choice`); continue; }
        if (q.choices.length !== s.opts.length) errs.push(`${s.key} : ${q.choices.length} options, ${s.opts.length} retapées`);
        const good = choiceIndex(s);
        q.choices.forEach((c, k) => {
          const o = s.opts[k]; if (!o) return;
          const read = optionValue(s, c.content);
          const want = o.v;
          if (!sameValue(read, want)) errs.push(`${s.key} : option ${c.id} « ${c.content} » ≠ ${JSON.stringify(want)}`);
          if (c.isCorrect !== (k === good)) errs.push(`${s.key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${k === good}`);
          if (c.misconceptionId) {
            if (k === good) errs.push(`${s.key} : la bonne option porte ${c.misconceptionId}`);
            else if (!errorMatches(s, c.misconceptionId, o)) errs.push(`${s.key} : option ${c.id} ≠ erreur ${c.misconceptionId}`);
          }
          if ((o.misc ?? null) !== (c.misconceptionId ?? null)) errs.push(`${s.key} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${o.misc}`);
          if (!c.isCorrect && k !== good && isTrue(s, o)) errs.push(`${s.key} : le distracteur ${c.id} est vrai`);
        });
      }
    } catch (e) { errs.push(`${s.key} : ${e.message}`); }
  }
  for (const [id, n] of uncounted) if (n > 1) errs.push(`${id} : ${n} étapes non comptées (au plus une par feuille)`);
  for (const b of bank) {
    if (b.q.answerType !== 'selfCheck' && !(b.key in ORACLE)) errs.push(`${b.key} : sans vérification`);
  }
  return errs;
}
