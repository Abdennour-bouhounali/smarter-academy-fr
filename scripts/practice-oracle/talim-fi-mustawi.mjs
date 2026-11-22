// Oracle du banc « talim-fi-mustawi » (التعليم في المستوي, 1AM, 2026-10-30) — feuilles d'examen de فصل (« على منوال اختبار الفصل الثالث »).
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique ENTIÈRE exacte en DIXIÈMES (BigInt ; aucun flottant, aucun import de packages/core ni du laboratoire
// `courtyard-drone`). Un point est une paire de BigInt (abscisse d'abord, l'ordre compte) ; chaque question est RETAPÉE ci-dessous (`SPECS`) à partir des nombres de l'énoncé et de la figure :
//  - `readpt` / `readcoord`  le couple ou la coordonnée d'un point de la figure (la figure est relue dans le fichier et comparée aux points retapés ; la réponse n'est jamais imprimée dans l'énoncé) ;
//  - `whichpt`  le point de la figure aux coordonnées dites ;      - `sameline`  l'unique point qui partage l'abscisse (ou l'ordonnée) d'un autre ;
//  - `region`   les signes (+ ; −) du point ;                      - `axiscls`   sur l'axe des abscisses (ordonnée nulle), sur l'axe des ordonnées, l'origine, ou hors des axes ;
//  - `swapq`    deux couples échangés sont le même point si et seulement si les deux nombres sont égaux ;      - `tf`  une affirmation jugée vraie ou fausse par le calcul ;
//  - `sym`      le symétrique par rapport à l'axe des abscisses (l'ordonnée change de signe), à l'axe des ordonnées (l'abscisse change de signe) ou à l'origine (les deux) ;
//  - `distaxis` |ordonnée| (axe des abscisses) ou |abscisse| (axe des ordonnées) ;   - `scalecm`  |coordonnée| ÷ valeur du centimètre, exacte (refusée si elle n'est pas décimale) ;
//  - `hiddencount` |coordonnée| (nombre de carreaux jusqu'au repère caché) ;   - `shiftpt`  b + d (le point décalé de d carreaux) ;
//  - `fourth`   A + C − B (rectangle de côtés parallèles aux axes, parallélisme vérifié) ;   - `crossing`  (abscisse de la verticale ; ordonnée de l'horizontale), l'intersection est vérifiée dans les deux segments ;
//  - `quadsame` l'unique point de mêmes signes ;   - `natrect`  les deux côtés d'un rectangle d'axes parallèles : carré s'ils sont égaux ;   - `countaxis`  le nombre de couples dont une coordonnée est nulle.
// Chaque QCM n'a qu'une option juste : chaque option est relue dans le fichier et jugée par le calcul ; chaque distracteur nommé MISC-MUSTAWI-* est RECALCULÉ à partir de son erreur et est faux ;
// chaque signature d'une réponse construite aussi (SWAP : les deux nombres échangés ; SIGNX / SIGNY : une seule coordonnée de signe changé ; SYMMIX : la mauvaise coordonnée changée ; SYMBOTH : les deux ;
// NEGDIST : la distance changée de signe ; DISTSWAP : l'autre coordonnée ; SCALEIGN : la valeur sans la division ; HIDDENOFFSET : l'écart au lieu du point).
// `audit(bank)` relit les fichiers : clé égale au calcul, option juste unique, valeur de chaque option égale à celle retapée, signatures et distracteurs égaux à l'erreur nommée, points de la figure d'énoncé
// = points retapés, coordonnées imprimées dans l'énoncé = coordonnées retapées (jamais la réponse d'une question de lecture), الكفاءة de chaque question.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, P } from './helpers.mjs';

/* ── énoncés retapés ── */
const SPECS = [
  {"k":"readpt","pts":{"A":["2","3"],"B":["-3","1"],"C":["-1","-2"],"D":["4","-3"]},"ask":"A","key":"ex-1am-talim-fi-mustawi-l1-001:q1"},
  {"k":"readpt","pts":{"A":["2","3"],"B":["-3","1"],"C":["-1","-2"],"D":["4","-3"]},"ask":"B","key":"ex-1am-talim-fi-mustawi-l1-001:q2"},
  {"k":"readpt","pts":{"A":["2","3"],"B":["-3","1"],"C":["-1","-2"],"D":["4","-3"]},"ask":"D","key":"ex-1am-talim-fi-mustawi-l1-001:q3"},
  {"k":"readcoord","pts":{"P":["3","2"],"Q":["-2","-3"],"R":["0","4"],"S":["-4","0"]},"ask":"P","coord":"x","key":"ex-1am-talim-fi-mustawi-l1-002:q1"},
  {"k":"readcoord","pts":{"P":["3","2"],"Q":["-2","-3"],"R":["0","4"],"S":["-4","0"]},"ask":"Q","coord":"y","key":"ex-1am-talim-fi-mustawi-l1-002:q2"},
  {"k":"readcoord","pts":{"P":["3","2"],"Q":["-2","-3"],"R":["0","4"],"S":["-4","0"]},"ask":"R","coord":"x","key":"ex-1am-talim-fi-mustawi-l1-002:q3"},
  {"k":"readcoord","pts":{"P":["3","2"],"Q":["-2","-3"],"R":["0","4"],"S":["-4","0"]},"ask":"S","coord":"y","key":"ex-1am-talim-fi-mustawi-l1-002:q4"},
  {"k":"axiscls","p":["0","3"],"order":["onX","onY","O","out"],"key":"ex-1am-talim-fi-mustawi-l1-003:q1"},
  {"k":"axiscls","p":["-2","0"],"order":["onY","O","out","onX"],"key":"ex-1am-talim-fi-mustawi-l1-003:q2"},
  {"k":"axiscls","p":["4","-1"],"order":["O","out","onX","onY"],"key":"ex-1am-talim-fi-mustawi-l1-003:q3"},
  {"k":"tf","claim":{"t":"onx","p":["1.5","0"]},"order":[true,false],"key":"ex-1am-talim-fi-mustawi-l1-003:q4"},
  {"k":"swapq","a":"3","b":"-2","order":[true,false],"key":"ex-1am-talim-fi-mustawi-l1-004:q1"},
  {"k":"swapq","a":"4","b":"4","order":[false,true],"key":"ex-1am-talim-fi-mustawi-l1-004:q2"},
  {"k":"swapq","a":"-5","b":"1","order":[true,false],"key":"ex-1am-talim-fi-mustawi-l1-004:q3"},
  {"k":"sameline","pts":{"R":["-2","3"],"S":["-2","-1"],"T":["3","-1"],"U":["1","3"]},"ask":"R","coord":"x","order":["S","T","U"],"key":"ex-1am-talim-fi-mustawi-l1-005:q1"},
  {"k":"sameline","pts":{"R":["-2","3"],"S":["-2","-1"],"T":["3","-1"],"U":["1","3"]},"ask":"R","coord":"y","order":["T","U","S"],"key":"ex-1am-talim-fi-mustawi-l1-005:q2"},
  {"k":"sameline","pts":{"R":["-2","3"],"S":["-2","-1"],"T":["3","-1"],"U":["1","3"]},"ask":"T","coord":"y","order":["U","R","S"],"key":"ex-1am-talim-fi-mustawi-l1-005:q3"},
  {"k":"readpt","pts":{"R":["-2","3"],"S":["-2","-1"],"T":["3","-1"],"U":["1","3"]},"ask":"T","key":"ex-1am-talim-fi-mustawi-l1-005:q4"},
  {"k":"region","p":["2","-1"],"order":["+-","--","++","-+"],"key":"ex-1am-talim-fi-mustawi-l1-006:q1"},
  {"k":"region","p":["-3","1"],"order":["++","--","+-","-+"],"key":"ex-1am-talim-fi-mustawi-l1-006:q2"},
  {"k":"region","p":["-1","-2"],"order":["-+","++","--","+-"],"key":"ex-1am-talim-fi-mustawi-l1-006:q3"},
  {"k":"distaxis","p":["-4","3"],"axis":"y","key":"ex-1am-talim-fi-mustawi-l1-007:q1"},
  {"k":"distaxis","p":["2","-5"],"axis":"x","key":"ex-1am-talim-fi-mustawi-l1-007:q2"},
  {"k":"distaxis","p":["0","4"],"axis":"y","key":"ex-1am-talim-fi-mustawi-l1-007:q3"},
  {"k":"whichpt","pts":{"M":["3","1"],"N":["1","3"],"P":["-3","1"],"Q":["3","-1"]},"target":["3","1"],"order":["M","N","P","Q"],"key":"ex-1am-talim-fi-mustawi-l1-008:q1"},
  {"k":"whichpt","pts":{"M":["3","1"],"N":["1","3"],"P":["-3","1"],"Q":["3","-1"]},"target":["1","3"],"order":["N","P","Q","M"],"key":"ex-1am-talim-fi-mustawi-l1-008:q2"},
  {"k":"whichpt","pts":{"M":["3","1"],"N":["1","3"],"P":["-3","1"],"Q":["3","-1"]},"target":["3","-1"],"order":["P","Q","M","N"],"key":"ex-1am-talim-fi-mustawi-l1-008:q3"},
  {"k":"tf","claim":{"t":"onx","p":["4","0"]},"order":[true,false],"key":"ex-1am-talim-fi-mustawi-l1-009:q1"},
  {"k":"tf","claim":{"t":"ony","p":["4","0"]},"order":[false,true],"key":"ex-1am-talim-fi-mustawi-l1-009:q2"},
  {"k":"tf","claim":{"t":"sameabs","p":["-3","2"],"q":["-3","-1"]},"order":[true,false],"key":"ex-1am-talim-fi-mustawi-l1-009:q3"},
  {"k":"tf","claim":{"t":"first","p":["2","5"]},"order":[false,true],"key":"ex-1am-talim-fi-mustawi-l1-009:q4"},
  {"k":"readpt","pts":{"A":["-4","2"],"B":["1","-3"],"C":["0","3"],"D":["-2","0"]},"ask":"A","key":"ex-1am-talim-fi-mustawi-l1-010:q1"},
  {"k":"readpt","pts":{"A":["-4","2"],"B":["1","-3"],"C":["0","3"],"D":["-2","0"]},"ask":"C","key":"ex-1am-talim-fi-mustawi-l1-010:q2"},
  {"k":"readpt","pts":{"A":["-4","2"],"B":["1","-3"],"C":["0","3"],"D":["-2","0"]},"ask":"D","key":"ex-1am-talim-fi-mustawi-l1-010:q3"},
  {"k":"axiscls","p":["-4","0"],"order":["onX","onY","O","out"],"key":"ex-1am-talim-fi-mustawi-l2-001:q1"},
  {"k":"region","p":["-3","-3"],"order":["+-","-+","++","--"],"key":"ex-1am-talim-fi-mustawi-l2-001:q2"},
  {"k":"tf","claim":{"t":"sameabs","p":["-3","3"],"q":["-3","-3"]},"order":[true,false],"key":"ex-1am-talim-fi-mustawi-l2-001:q3"},
  {"k":"countaxis","pts":[["-4","0"],["3","0"],["-3","-3"],["-3","3"]],"key":"ex-1am-talim-fi-mustawi-l2-001:q4"},
  {"k":"sym","p":["4","-3"],"axis":"x","name":"M'","key":"ex-1am-talim-fi-mustawi-l2-002:q1"},
  {"k":"sym","p":["-2","5"],"axis":"y","name":"M'","key":"ex-1am-talim-fi-mustawi-l2-002:q2"},
  {"k":"sym","p":["3","-1"],"axis":"o","name":"M'","key":"ex-1am-talim-fi-mustawi-l2-002:q3"},
  {"k":"region","p":["-3","5"],"order":["-+","++","--","+-"],"key":"ex-1am-talim-fi-mustawi-l2-003:q1"},
  {"k":"region","p":["4","3"],"order":["-+","+-","--","++"],"key":"ex-1am-talim-fi-mustawi-l2-003:q2"},
  {"k":"region","p":["-2","-3"],"order":["-+","++","--","+-"],"key":"ex-1am-talim-fi-mustawi-l2-003:q3"},
  {"k":"scalecm","p":["-6","4"],"axis":"y","unit":"2","key":"ex-1am-talim-fi-mustawi-l2-004:q1"},
  {"k":"scalecm","p":["-6","4"],"axis":"x","unit":"2","key":"ex-1am-talim-fi-mustawi-l2-004:q2"},
  {"k":"scalecm","p":["5","-3"],"axis":"x","unit":"2","key":"ex-1am-talim-fi-mustawi-l2-004:q3"},
  {"k":"hiddencount","b":["-2","-3"],"coord":"x","key":"ex-1am-talim-fi-mustawi-l2-005:q1"},
  {"k":"hiddencount","b":["-2","-3"],"coord":"y","key":"ex-1am-talim-fi-mustawi-l2-005:q2"},
  {"k":"shiftpt","b":["-2","-3"],"d":["4","1"],"key":"ex-1am-talim-fi-mustawi-l2-005:q3"},
  {"k":"fourth","A":["-3","2"],"B":["4","2"],"C":["4","-2"],"key":"ex-1am-talim-fi-mustawi-l2-006:q1"},
  {"k":"fourth","A":["-4","-3"],"B":["4","-3"],"C":["4","2"],"key":"ex-1am-talim-fi-mustawi-l2-006:q2"},
  {"k":"sameline","pts":{"A":["-4","3"],"B":["-1","3"],"C":["2","3"],"D":["-1","-2"]},"ask":"D","coord":"x","order":["A","B","C"],"key":"ex-1am-talim-fi-mustawi-l2-007:q1"},
  {"k":"tf","claim":{"t":"sameord","p":["-4","3"],"q":["2","3"]},"order":[false,true],"key":"ex-1am-talim-fi-mustawi-l2-007:q2"},
  {"k":"readpt","pts":{"A":["-4","3"],"B":["-1","3"],"C":["2","3"],"D":["-1","-2"]},"ask":"D","key":"ex-1am-talim-fi-mustawi-l2-007:q3"},
  {"k":"quadsame","p":["-3","-2"],"cands":[["-1","-4"],["2","-2"],["-5","1"],["3","4"]],"key":"ex-1am-talim-fi-mustawi-l2-008:q1"},
  {"k":"quadsame","p":["2","5"],"cands":[["-2","3"],["3","-1"],["-4","-2"],["1","1"]],"key":"ex-1am-talim-fi-mustawi-l2-008:q2"},
  {"k":"countaxis","pts":[["0","3"],["-2","0"],["4","-1"],["0","0"]],"key":"ex-1am-talim-fi-mustawi-l2-009:q1"},
  {"k":"axiscls","p":["0","0"],"order":["out","onX","onY","O"],"key":"ex-1am-talim-fi-mustawi-l2-009:q2"},
  {"k":"tf","claim":{"t":"origin","p":["0","5"]},"order":[true,false],"key":"ex-1am-talim-fi-mustawi-l2-009:q3"},
  {"k":"region","p":["1.5","-3"],"order":["-+","+-","--","++"],"key":"ex-1am-talim-fi-mustawi-l2-010:q1"},
  {"k":"axiscls","p":["-3","0"],"order":["onY","O","out","onX"],"key":"ex-1am-talim-fi-mustawi-l2-010:q2"},
  {"k":"region","p":["2.5","-1.5"],"order":["+-","--","++","-+"],"key":"ex-1am-talim-fi-mustawi-l2-010:q3"},
  {"k":"sym","p":["-3.5","2"],"axis":"x","name":"M'","key":"ex-1am-talim-fi-mustawi-l3-001:q1"},
  {"k":"sym","p":["1","3"],"axis":"x","name":"M'","key":"ex-1am-talim-fi-mustawi-l3-001:q2"},
  {"k":"distaxis","p":["-3.5","2"],"axis":"x","key":"ex-1am-talim-fi-mustawi-l3-001:q3"},
  {"k":"readpt","pts":{"A":["1.5","2.5"],"B":["-2.5","1"],"C":["3","-1.5"],"D":["-1","-2.5"]},"ask":"A","key":"ex-1am-talim-fi-mustawi-l3-002:q1"},
  {"k":"readpt","pts":{"A":["1.5","2.5"],"B":["-2.5","1"],"C":["3","-1.5"],"D":["-1","-2.5"]},"ask":"B","key":"ex-1am-talim-fi-mustawi-l3-002:q2"},
  {"k":"readpt","pts":{"A":["1.5","2.5"],"B":["-2.5","1"],"C":["3","-1.5"],"D":["-1","-2.5"]},"ask":"C","key":"ex-1am-talim-fi-mustawi-l3-002:q3"},
  {"k":"readcoord","pts":{"P":["2.5","-1.5"],"Q":["-3.5","0.5"],"R":["0","-2.5"]},"ask":"P","coord":"x","key":"ex-1am-talim-fi-mustawi-l3-003:q1"},
  {"k":"readcoord","pts":{"P":["2.5","-1.5"],"Q":["-3.5","0.5"],"R":["0","-2.5"]},"ask":"Q","coord":"y","key":"ex-1am-talim-fi-mustawi-l3-003:q2"},
  {"k":"readcoord","pts":{"P":["2.5","-1.5"],"Q":["-3.5","0.5"],"R":["0","-2.5"]},"ask":"R","coord":"y","key":"ex-1am-talim-fi-mustawi-l3-003:q3"},
  {"k":"sym","p":["3.5","-2"],"axis":"y","name":"M'","key":"ex-1am-talim-fi-mustawi-l3-004:q1"},
  {"k":"sym","p":["-1.5","2.5"],"axis":"x","name":"M'","key":"ex-1am-talim-fi-mustawi-l3-004:q2"},
  {"k":"sym","p":["2","-4.5"],"axis":"o","name":"M'","key":"ex-1am-talim-fi-mustawi-l3-004:q3"},
  {"k":"distaxis","p":["-4.5","2"],"axis":"y","key":"ex-1am-talim-fi-mustawi-l3-005:q1"},
  {"k":"distaxis","p":["3","-1.5"],"axis":"x","key":"ex-1am-talim-fi-mustawi-l3-005:q2"},
  {"k":"distaxis","p":["2.5","3.5"],"axis":"y","key":"ex-1am-talim-fi-mustawi-l3-005:q3"},
  {"k":"scalecm","p":["3","-1.5"],"axis":"y","unit":"0.5","key":"ex-1am-talim-fi-mustawi-l3-006:q1"},
  {"k":"scalecm","p":["3","-1.5"],"axis":"x","unit":"0.5","key":"ex-1am-talim-fi-mustawi-l3-006:q2"},
  {"k":"scalecm","p":["-2.5","4"],"axis":"y","unit":"0.5","key":"ex-1am-talim-fi-mustawi-l3-006:q3"},
  {"k":"scalecm","p":["-100","50"],"axis":"y","unit":"25","key":"ex-1am-talim-fi-mustawi-l3-007:q1"},
  {"k":"scalecm","p":["-100","50"],"axis":"x","unit":"25","key":"ex-1am-talim-fi-mustawi-l3-007:q2"},
  {"k":"scalecm","p":["75","-25"],"axis":"y","unit":"25","key":"ex-1am-talim-fi-mustawi-l3-007:q3"},
  {"k":"whichpt","pts":{"M":["1.5","2.5"],"N":["2.5","1.5"],"P":["-1.5","2.5"],"Q":["1.5","-2.5"]},"target":["1.5","2.5"],"order":["M","N","P","Q"],"key":"ex-1am-talim-fi-mustawi-l3-008:q1"},
  {"k":"whichpt","pts":{"M":["1.5","2.5"],"N":["2.5","1.5"],"P":["-1.5","2.5"],"Q":["1.5","-2.5"]},"target":["-1.5","2.5"],"order":["N","P","Q","M"],"key":"ex-1am-talim-fi-mustawi-l3-008:q2"},
  {"k":"whichpt","pts":{"M":["1.5","2.5"],"N":["2.5","1.5"],"P":["-1.5","2.5"],"Q":["1.5","-2.5"]},"target":["2.5","1.5"],"order":["P","Q","M","N"],"key":"ex-1am-talim-fi-mustawi-l3-008:q3"},
  {"k":"region","p":["-2.5","3.5"],"order":["--","+-","-+","++"],"key":"ex-1am-talim-fi-mustawi-l3-009:q1"},
  {"k":"region","p":["0.5","-4"],"order":["+-","--","++","-+"],"key":"ex-1am-talim-fi-mustawi-l3-009:q2"},
  {"k":"tf","claim":{"t":"quad","p":["2.5","3"],"q":["0.5","4.5"]},"order":[false,true],"key":"ex-1am-talim-fi-mustawi-l3-009:q3"},
  {"k":"swapq","a":"2.5","b":"-1.5","order":[true,false],"key":"ex-1am-talim-fi-mustawi-l3-010:q1"},
  {"k":"swapq","a":"3.5","b":"3.5","order":[false,true],"key":"ex-1am-talim-fi-mustawi-l3-010:q2"},
  {"k":"swapq","a":"-0.5","b":"4","order":[true,false],"key":"ex-1am-talim-fi-mustawi-l3-010:q3"},
  {"k":"sym","p":["3","-1"],"axis":"x","name":"M'","key":"ex-1am-talim-fi-mustawi-l4-001:q1"},
  {"k":"sym","p":["3","1"],"axis":"y","name":"M'","key":"ex-1am-talim-fi-mustawi-l4-001:q2"},
  {"k":"sym","p":["0","2"],"axis":"y","name":"M'","key":"ex-1am-talim-fi-mustawi-l4-001:q3"},
  {"k":"shiftpt","b":["-3","2"],"d":["5","-1"],"key":"ex-1am-talim-fi-mustawi-l4-002:q1"},
  {"k":"shiftpt","b":["-3","2"],"d":["-2","-4"],"key":"ex-1am-talim-fi-mustawi-l4-002:q2"},
  {"k":"hiddencount","b":["-3","2"],"coord":"y","key":"ex-1am-talim-fi-mustawi-l4-002:q3"},
  {"k":"hiddencount","b":["-1","-2"],"coord":"x","key":"ex-1am-talim-fi-mustawi-l4-003:q1"},
  {"k":"hiddencount","b":["-1","-2"],"coord":"y","key":"ex-1am-talim-fi-mustawi-l4-003:q2"},
  {"k":"shiftpt","b":["-1","-2"],"d":["-2","4"],"key":"ex-1am-talim-fi-mustawi-l4-003:q3"},
  {"k":"fourth","A":["-2","-1"],"B":["3","-1"],"C":["3","4"],"key":"ex-1am-talim-fi-mustawi-l4-004:q1"},
  {"k":"fourth","A":["-5","3"],"B":["1","3"],"C":["1","-2"],"key":"ex-1am-talim-fi-mustawi-l4-004:q2"},
  {"k":"fourth","A":["2.5","1"],"B":["-1.5","1"],"C":["-1.5","-3"],"key":"ex-1am-talim-fi-mustawi-l4-004:q3"},
  {"k":"crossing","v":["2","-3","4"],"h":["1","-2","6"],"key":"ex-1am-talim-fi-mustawi-l4-005:q1"},
  {"k":"crossing","v":["-1","3","-2"],"h":["1","-4","3"],"key":"ex-1am-talim-fi-mustawi-l4-005:q2"},
  {"k":"natrect","A":["-3","-2"],"B":["3","-2"],"C":["3","2"],"order":["sq","re","rh","tr"],"key":"ex-1am-talim-fi-mustawi-l4-006:q1"},
  {"k":"natrect","A":["-2","1"],"B":["2","1"],"C":["2","-3"],"order":["re","rh","tr","sq"],"key":"ex-1am-talim-fi-mustawi-l4-006:q2"},
  {"k":"sym","p":["-2","-1"],"axis":"x","name":"M'","key":"ex-1am-talim-fi-mustawi-l4-007:q1"},
  {"k":"sym","p":["-2","-1"],"axis":"y","name":"M'","key":"ex-1am-talim-fi-mustawi-l4-007:q2"},
  {"k":"sym","p":["-2","-1"],"axis":"o","name":"M'","key":"ex-1am-talim-fi-mustawi-l4-007:q3"},
  {"k":"quadsame","p":["-1.5","2.5"],"cands":[["-3","1"],["2","4"],["-2","-3.5"],["0.5","-1"]],"key":"ex-1am-talim-fi-mustawi-l4-008:q1"},
  {"k":"quadsame","p":["3.5","-0.5"],"cands":[["5","-4"],["-3","3"],["1","2"],["-2","-1"]],"key":"ex-1am-talim-fi-mustawi-l4-008:q2"},
  {"k":"readpt","pts":{"A":["-3","2"],"B":["4","3"],"C":["2","-2"],"D":["-2","-4"]},"ask":"B","key":"ex-1am-talim-fi-mustawi-l4-009:q1"},
  {"k":"readcoord","pts":{"A":["-3","2"],"B":["4","3"],"C":["2","-2"],"D":["-2","-4"]},"ask":"D","coord":"y","key":"ex-1am-talim-fi-mustawi-l4-009:q2"},
  {"k":"region","p":["2","-2"],"order":["--","++","-+","+-"],"key":"ex-1am-talim-fi-mustawi-l4-009:q3"},
  {"k":"whichpt","pts":{"A":["-3","2"],"B":["4","3"],"C":["2","-2"],"D":["-2","-4"]},"target":["-3","2"],"order":["C","D","A","B"],"key":"ex-1am-talim-fi-mustawi-l4-009:q4"},
  {"k":"quadsame","p":["6","2"],"cands":[["-3","-2"],["3","2"],["3","-2"],["-6","2"]],"key":"ex-1am-talim-fi-mustawi-l4-010:q1"},
  {"k":"tf","claim":{"t":"sameabs","p":["3","2"],"q":["3","-2"]},"order":[true,false],"key":"ex-1am-talim-fi-mustawi-l4-010:q2"},
  {"k":"tf","claim":{"t":"sameord","p":["6","2"],"q":["3","2"]},"order":[false,true],"key":"ex-1am-talim-fi-mustawi-l4-010:q3"},
  {"k":"readpt","pts":{"A":["1","3"],"B":["4","1"],"C":["1","-1"],"D":["-2","1"]},"ask":"B","key":"ex-1am-talim-fi-mustawi-l5-001:q1"},
  {"k":"readcoord","pts":{"A":["1","3"],"B":["4","1"],"C":["1","-1"],"D":["-2","1"]},"ask":"C","coord":"y","key":"ex-1am-talim-fi-mustawi-l5-001:q2"},
  {"k":"crossing","v":["1","3","-1"],"h":["1","4","-2"],"key":"ex-1am-talim-fi-mustawi-l5-001:q3"},
  {"k":"readpt","pts":{"K":["4","2"],"G":["-3","0"],"L":["-1","-3"],"T":["0","3"]},"ask":"L","key":"ex-1am-talim-fi-mustawi-l5-002:q1"},
  {"k":"axiscls","p":["-3","0"],"order":["onY","O","out","onX"],"key":"ex-1am-talim-fi-mustawi-l5-002:q2"},
  {"k":"sym","p":["4","2"],"axis":"x","name":"M'","key":"ex-1am-talim-fi-mustawi-l5-002:q3"},
  {"k":"countaxis","pts":[["4","2"],["-3","0"],["-1","-3"],["0","3"]],"key":"ex-1am-talim-fi-mustawi-l5-002:q4"},
  {"k":"sym","p":["-2","-1"],"axis":"x","name":"M'","key":"ex-1am-talim-fi-mustawi-l5-003:q1"},
  {"k":"sym","p":["-2","-1"],"axis":"y","name":"M'","key":"ex-1am-talim-fi-mustawi-l5-003:q2"},
  {"k":"quadsame","p":["-2","-1"],"cands":[["3","-1"],["-1","2"],["2","3"],["-3","-4"]],"key":"ex-1am-talim-fi-mustawi-l5-003:q3"},
  {"k":"distaxis","p":["-2","-1"],"axis":"y","key":"ex-1am-talim-fi-mustawi-l5-003:q4"},
  {"k":"fourth","A":["-4","3"],"B":["2","3"],"C":["2","-1"],"key":"ex-1am-talim-fi-mustawi-l5-004:q1"},
  {"k":"natrect","A":["-4","3"],"B":["2","3"],"C":["2","-1"],"order":["sq","re","rh","tr"],"key":"ex-1am-talim-fi-mustawi-l5-004:q2"},
  {"k":"crossing","v":["-1","3","-1"],"h":["1","-4","2"],"key":"ex-1am-talim-fi-mustawi-l5-004:q3"},
  {"k":"scalecm","p":["-4","3"],"axis":"y","unit":"2","key":"ex-1am-talim-fi-mustawi-l5-004:q4"},
  {"k":"readpt","pts":{"A":["-3","2"],"B":["2","4"],"C":["3","-2"],"D":["-2","-3"],"E":["2","-3"]},"ask":"C","key":"ex-1am-talim-fi-mustawi-l5-005:q1"},
  {"k":"sameline","pts":{"A":["-3","2"],"B":["2","4"],"C":["3","-2"],"D":["-2","-3"],"E":["2","-3"]},"ask":"D","coord":"y","order":["A","B","C","E"],"key":"ex-1am-talim-fi-mustawi-l5-005:q2"},
  {"k":"region","p":["-2","-3"],"order":["++","--","+-","-+"],"key":"ex-1am-talim-fi-mustawi-l5-005:q3"},
  {"k":"readcoord","pts":{"A":["-3","2"],"B":["2","4"],"C":["3","-2"],"D":["-2","-3"],"E":["2","-3"]},"ask":"B","coord":"y","key":"ex-1am-talim-fi-mustawi-l5-005:q4"},
  {"k":"hiddencount","b":["-2","-3"],"coord":"x","key":"ex-1am-talim-fi-mustawi-l5-006:q1"},
  {"k":"shiftpt","b":["-2","-3"],"d":["4","1"],"key":"ex-1am-talim-fi-mustawi-l5-006:q2"},
  {"k":"shiftpt","b":["-2","-3"],"d":["-1","5"],"key":"ex-1am-talim-fi-mustawi-l5-006:q3"},
  {"k":"hiddencount","b":["-2","-3"],"coord":"y","key":"ex-1am-talim-fi-mustawi-l5-006:q4"},
  {"k":"scalecm","p":["-60","40"],"axis":"y","unit":"20","key":"ex-1am-talim-fi-mustawi-l5-007:q1"},
  {"k":"scalecm","p":["-60","40"],"axis":"x","unit":"20","key":"ex-1am-talim-fi-mustawi-l5-007:q2"},
  {"k":"scalecm","p":["30","-80"],"axis":"x","unit":"20","key":"ex-1am-talim-fi-mustawi-l5-007:q3"},
  {"k":"region","p":["30","-80"],"order":["++","-+","+-","--"],"key":"ex-1am-talim-fi-mustawi-l5-007:q4"},
  {"k":"swapq","a":"-2","b":"3","order":[true,false],"key":"ex-1am-talim-fi-mustawi-l5-008:q1"},
  {"k":"tf","claim":{"t":"ony","p":["0","-4"]},"order":[false,true],"key":"ex-1am-talim-fi-mustawi-l5-008:q2"},
  {"k":"axiscls","p":["5","0"],"order":["O","out","onX","onY"],"key":"ex-1am-talim-fi-mustawi-l5-008:q3"},
  {"k":"sym","p":["5","0"],"axis":"x","name":"M'","key":"ex-1am-talim-fi-mustawi-l5-008:q4"},
  {"k":"readpt","pts":{"A":["-4","1"],"B":["-1","4"],"C":["3","2"],"D":["2","-3"]},"ask":"A","key":"ex-1am-talim-fi-mustawi-l5-009:q1"},
  {"k":"readpt","pts":{"A":["-4","1"],"B":["-1","4"],"C":["3","2"],"D":["2","-3"]},"ask":"D","key":"ex-1am-talim-fi-mustawi-l5-009:q2"},
  {"k":"sym","p":["-4","1"],"axis":"y","name":"M'","key":"ex-1am-talim-fi-mustawi-l5-009:q3"},
  {"k":"quadsame","p":["2","-3"],"cands":[["3","3"],["-2","2"],["1","-1"],["-1","-2"]],"key":"ex-1am-talim-fi-mustawi-l5-009:q4"},
  {"k":"swapq","a":"3","b":"-2","order":[false,true],"key":"ex-1am-talim-fi-mustawi-l5-010:q1"},
  {"k":"region","p":["-4","1"],"order":["-+","++","--","+-"],"key":"ex-1am-talim-fi-mustawi-l5-010:q2"},
  {"k":"axiscls","p":["4","0"],"order":["onX","onY","O","out"],"key":"ex-1am-talim-fi-mustawi-l5-010:q3"},
  {"k":"distaxis","p":["3","-2"],"axis":"x","key":"ex-1am-talim-fi-mustawi-l5-010:q4"}
];

const B = (n) => BigInt(n);
/** « -1.5 » → -15n (dixièmes) ; refuse plus d'un chiffre après la virgule. */
const D = (s) => {
  const m = /^(-)?(\d+)(?:\.(\d))?$/.exec(String(s).trim());
  if (!m) throw new Error(`nombre illisible « ${s} »`);
  const v = B(m[2]) * 10n + B(m[3] ?? '0');
  return m[1] ? -v : v;
};
const txt = (v) => {
  const neg = v < 0n; const a = neg ? -v : v;
  return `${neg ? '-' : ''}${a / 10n}${a % 10n ? `.${a % 10n}` : ''}`;
};
const abs = (v) => (v < 0n ? -v : v);
const neg = (v) => (v === 0n ? 0n : -v);
const PT = (a) => [D(a[0]), D(a[1])];
const eqP = (a, b) => a[0] === b[0] && a[1] === b[1];
const swapP = (p) => [p[1], p[0]];
const sg = (v) => (v > 0n ? 1 : v < 0n ? -1 : 0);
const figPts = (s) => Object.fromEntries(Object.entries(s.pts).map(([k, v]) => [k, PT(v)]));
const CHOICE = new Set(['whichpt', 'sameline', 'region', 'axiscls', 'swapq', 'tf', 'quadsame', 'natrect']);
const isChoice = (s) => CHOICE.has(s.k);
const POINT = new Set(['readpt', 'sym', 'shiftpt', 'fourth', 'crossing']);
const isPoint = (s) => POINT.has(s.k);
const cls = (p) => (p[0] === 0n && p[1] === 0n ? 'O' : p[1] === 0n ? 'onX' : p[0] === 0n ? 'onY' : 'out');

/* ── clé d'une réponse construite ── */
const pointKey = (s) => {
  switch (s.k) {
    case 'readpt': return PT(s.pts[s.ask]);
    case 'sym': { const p = PT(s.p); return s.axis === 'x' ? [p[0], neg(p[1])] : s.axis === 'y' ? [neg(p[0]), p[1]] : [neg(p[0]), neg(p[1])]; }
    case 'shiftpt': { const b = PT(s.b); const d = PT(s.d); return [b[0] + d[0], b[1] + d[1]]; }
    case 'fourth': {
      const [A, Bp, Cp] = [PT(s.A), PT(s.B), PT(s.C)];
      if (!((A[1] === Bp[1] && Bp[0] === Cp[0]) || (A[0] === Bp[0] && Bp[1] === Cp[1]))) throw new Error(`${s.key} : rectangle non parallèle aux axes`);
      return [A[0] + Cp[0] - Bp[0], A[1] + Cp[1] - Bp[1]];
    }
    case 'crossing': {
      const v = s.v.map(D); const h = s.h.map(D);
      const [x, y] = [v[0], h[0]];
      const inV = y >= (v[1] < v[2] ? v[1] : v[2]) && y <= (v[1] < v[2] ? v[2] : v[1]);
      const inH = x >= (h[1] < h[2] ? h[1] : h[2]) && x <= (h[1] < h[2] ? h[2] : h[1]);
      if (!inV || !inH) throw new Error(`${s.key} : l'intersection sort d'un segment`);
      return [x, y];
    }
    default: throw new Error(`pas de point pour ${s.k}`);
  }
};
const numKey = (s) => {
  switch (s.k) {
    case 'readcoord': { const p = PT(s.pts[s.ask]); return s.coord === 'x' ? p[0] : p[1]; }
    case 'distaxis': { const p = PT(s.p); return abs(s.axis === 'x' ? p[1] : p[0]); }
    case 'scalecm': {
      const p = PT(s.p); const c = abs(s.axis === 'x' ? p[1] : p[0]); const u = D(s.unit);
      if ((c * 10n) % u !== 0n) throw new Error(`${s.key} : quotient non décimal`);
      return (c * 10n) / u;
    }
    case 'hiddencount': { const b = PT(s.b); return abs(s.coord === 'x' ? b[0] : b[1]); }
    case 'countaxis': return B(s.pts.map(PT).filter((p) => p[0] === 0n || p[1] === 0n).length) * 10n;
    default: throw new Error(`pas de nombre pour ${s.k}`);
  }
};
const keyValue = (s) => (isPoint(s) ? pointKey(s) : numKey(s));

/* ── les options d'un QCM : valeur retapée, vérité calculée, erreur nommée calculée ── */
const claimTruth = (c) => {
  const p = c.p && PT(c.p); const q = c.q && PT(c.q);
  switch (c.t) {
    case 'onx': return p[1] === 0n;
    case 'ony': return p[0] === 0n;
    case 'sameabs': return p[0] === q[0];
    case 'sameord': return p[1] === q[1];
    case 'quad': return p[0] !== 0n && p[1] !== 0n && sg(p[0]) === sg(q[0]) && sg(p[1]) === sg(q[1]);
    case 'order': return false;     // l'énoncé fausse : le premier nombre est l'abscisse, pas l'ordonnée
    case 'first': return true;
    case 'origin': return p[0] === 0n && p[1] === 0n;
    default: throw new Error(`affirmation inconnue ${c.t}`);
  }
};
const CLAIM_MISC = { onx: 'AXISSWAP', ony: 'AXISSWAP', origin: 'AXISSWAP', sameabs: 'SAMEMIX', sameord: 'SAMEMIX', quad: 'SIGNBOTH', order: 'SWAP', first: 'SWAP' };
const rectSides = (s) => { const [A, Bp, Cp] = [PT(s.A), PT(s.B), PT(s.C)]; if (!((A[1] === Bp[1] && Bp[0] === Cp[0]) || (A[0] === Bp[0] && Bp[1] === Cp[1]))) throw new Error('rectangle non parallèle aux axes'); return [abs(A[0] - Bp[0]) + abs(A[1] - Bp[1]), abs(Bp[0] - Cp[0]) + abs(Bp[1] - Cp[1])]; };

/** liste des valeurs d'options (dans l'ordre du fichier) et indice de l'option juste */
const optionsOf = (s) => {
  switch (s.k) {
    case 'whichpt': return s.order.map((n) => ({ v: n, ok: eqP(PT(s.pts[n]), PT(s.target)), misc: (() => {
      const p = PT(s.pts[n]); const t = PT(s.target);
      if (eqP(p, t)) return null;
      if (t[0] !== t[1] && eqP(p, swapP(t))) return 'SWAP';
      if (p[0] === t[0] && p[1] === neg(t[1])) return 'SIGNY';
      if (p[0] === neg(t[0]) && p[1] === t[1]) return 'SIGNX';
      return null; })() }));
    case 'sameline': {
      const i = s.coord === 'x' ? 0 : 1; const p = PT(s.pts[s.ask]);
      return s.order.map((n) => { const q = PT(s.pts[n]); return { v: n, ok: q[i] === p[i], misc: q[i] !== p[i] && q[1 - i] === p[1 - i] ? 'SAMEMIX' : null }; });
    }
    case 'region': { const p = PT(s.p); const want = `${sg(p[0]) > 0 ? '+' : '-'}${sg(p[1]) > 0 ? '+' : '-'}`;
      return s.order.map((c) => ({ v: c, ok: c === want, misc: c === want ? null : c[0] !== want[0] && c[1] === want[1] ? 'SIGNX' : c[0] === want[0] ? 'SIGNY' : 'SIGNBOTH' })); }
    case 'axiscls': { const want = cls(PT(s.p));
      return s.order.map((c) => ({ v: c, ok: c === want, misc: c !== want && ((want === 'onX' && c === 'onY') || (want === 'onY' && c === 'onX')) ? 'AXISSWAP' : null })); }
    case 'swapq': { const same = D(s.a) === D(s.b);
      return s.order.map((o) => ({ v: o ? 'Y' : 'N', ok: o === same, misc: o && !same ? 'SWAPSAME' : null })); }
    case 'tf': { const truth = claimTruth(s.claim);
      return s.order.map((o) => ({ v: o ? 'T' : 'F', ok: o === truth, misc: o !== truth ? CLAIM_MISC[s.claim.t] : null })); }
    case 'quadsame': { const p = PT(s.p);
      return s.cands.map((q) => { const c = PT(q); const same = c[0] !== 0n && c[1] !== 0n && sg(c[0]) === sg(p[0]) && sg(c[1]) === sg(p[1]);
        return { v: q, ok: same, misc: same ? null : sg(c[0]) !== sg(p[0]) && sg(c[1]) === sg(p[1]) ? 'SIGNX' : sg(c[0]) === sg(p[0]) ? 'SIGNY' : 'SIGNBOTH' }; }); }
    case 'natrect': { const [a, b] = rectSides(s); const want = a === b ? 'sq' : 're';
      return s.order.map((c) => ({ v: c, ok: c === want, misc: c === 'sq' && want === 're' ? 'NATSQUARE' : null })); }
    default: throw new Error(`pas de QCM pour ${s.k}`);
  }
};
const choiceIndex = (s) => {
  const hits = optionsOf(s).map((o, i) => (o.ok ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`${s.key} : ${hits.length} options justes`);
  return hits[0];
};

/* ── les signatures d'une réponse construite (liste ordonnée, dédoublonnée comme l'auteur le fait) ── */
const sigList = (s, key) => {
  const raw = (() => {
    switch (s.k) {
      case 'readpt': return [['SWAP', swapP(key)], ['SIGNY', [key[0], neg(key[1])]], ['SIGNX', [neg(key[0]), key[1]]]];
      case 'readcoord': { const p = PT(s.pts[s.ask]); const other = s.coord === 'x' ? p[1] : p[0]; return [['SWAP', other], [s.coord === 'x' ? 'SIGNX' : 'SIGNY', neg(key)]]; }
      case 'sym': { const p = PT(s.p);
        if (s.axis === 'x') return [['SYMMIX', [neg(p[0]), p[1]]], ['SYMBOTH', [neg(p[0]), neg(p[1])]]];
        if (s.axis === 'y') return [['SYMMIX', [p[0], neg(p[1])]], ['SYMBOTH', [neg(p[0]), neg(p[1])]]];
        return [['SYMMIX', [neg(p[0]), p[1]]], ['SYMMIX2', [p[0], neg(p[1])]]]; }
      case 'distaxis': { const p = PT(s.p); return [['DISTSWAP', abs(s.axis === 'x' ? p[0] : p[1])], ['NEGDIST', -key]]; }
      case 'scalecm': { const p = PT(s.p); const c = abs(s.axis === 'x' ? p[1] : p[0]); return [['SCALEIGN', c], ['NEGDIST', -key]]; }
      case 'hiddencount': return [['NEGDIST', -key]];
      case 'shiftpt': return [['HIDDENOFFSET', PT(s.d)], ['SWAP', swapP(key)]];
      case 'fourth': return [['SWAP', swapP(key)], ['SIGNY', [key[0], neg(key[1])]]];
      case 'crossing': return [['SWAP', swapP(key)]];
      case 'countaxis': return [];
      default: return [];
    }
  })();
  const out = []; const seen = [];
  for (const [id, v] of raw) {
    const same = (a, b) => (Array.isArray(a) ? Array.isArray(b) && eqP(a, b) : a === b);
    if (same(v, key) || seen.some((x) => same(x, v))) continue;
    seen.push(v); out.push([id, v]);
  }
  return out;
};

const answerOf = (s) => {
  if (isChoice(s)) return C('ABCDEF'[choiceIndex(s)]);
  const k = keyValue(s);
  return isPoint(s) ? P(txt(k[0]), txt(k[1])) : R(txt(k));
};
export const ORACLE = Object.fromEntries(SPECS.map((s) => [s.key, answerOf(s)]));

/* ── الكفاءة attendue par genre ── */
const LP_OF = { readpt: 2, readcoord: 2, whichpt: 2, sameline: 2, region: 2, axiscls: 1, swapq: 2, tf: 2, distaxis: 2, countaxis: 2, sym: 3, scalecm: 3, fourth: 3, crossing: 3, quadsame: 3, natrect: 3, hiddencount: 1, shiftpt: 1 };
const LP_CODE = (n) => `1am_talim-fi-mustawi_P${n}`;
const NEEDS_FIGURE = new Set(['readpt', 'readcoord', 'whichpt', 'sameline']);

/* ── relecture d'une option du fichier ── */
const clean = (c) => c.replace(/\{,\}/g, '.').replace(/\\,/g, '');
const pairsOf = (c) => [...clean(c).matchAll(/\(\s*(-?\d+(?:\.\d+)?)\s*;\s*(-?\d+(?:\.\d+)?)\s*\)/g)].map((m) => [m[1], m[2]]);
const optionValue = (s, content) => {
  switch (s.k) {
    case 'whichpt': case 'sameline': return /\$([A-Z])\$/.exec(content)?.[1];
    case 'region': return `${content.includes('يمين') ? '+' : '-'}${content.includes('فوق') ? '+' : '-'}`;
    case 'axiscls': return content.includes('المبدأ') ? 'O' : content.includes('ليست') ? 'out' : content.includes('الفواصل') ? 'onX' : 'onY';
    case 'swapq': return content.trim() === 'نعم' ? 'Y' : 'N';
    case 'tf': return content.trim() === 'صحيح' ? 'T' : 'F';
    case 'quadsame': return pairsOf(content)[0];
    case 'natrect': return content.includes('وليس مربّعًا') && content.includes('مستطيل') ? 're' : content.includes('مربّع') && !content.includes('وليس') ? 'sq' : content.includes('معيّن') ? 'rh' : 'tr';
    default: return null;
  }
};
const sameValue = (a, b) => (Array.isArray(a) ? Array.isArray(b) && a.length === b.length && a.every((x, i) => D(x) === D(b[i])) : a === b);

const here = dirname(fileURLToPath(import.meta.url));
const SHEETS_DIR = join(here, '..', '..', 'content', 'practice', '1am', 'talim-fi-mustawi');
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
  for (const s of SPECS) {
    const q = byKey.get(s.key);
    if (!q) { errs.push(`${s.key} : question absente`); continue; }
    const exId = s.key.split(':')[0]; const ex = sheets.get(exId);
    if (!ex) { errs.push(`${s.key} : feuille absente`); continue; }
    try {
      const lp = q.learningPoints?.find((l) => l.role === 'primary')?.code;
      if (lp !== LP_CODE(LP_OF[s.k])) errs.push(`${s.key} : الكفاءة ${lp} ≠ ${LP_CODE(LP_OF[s.k])} (${s.k})`);
      const fig = ex.statement.figure;
      const text = `${ex.statement.content} ${q.statement}`; const printed = pairsOf(text);
      const has = (p) => printed.some(([x, y]) => D(x) === p[0] && D(y) === p[1]);
      if (NEEDS_FIGURE.has(s.k)) {
        if (!fig) errs.push(`${s.key} : ${s.k} sans statement.figure`);
        else {
          const fp = Object.fromEntries(Object.entries(fig.points).filter(([k]) => !k.startsWith('c')).map(([k, v]) => [k, v.map(String)]));
          for (const [k, v] of Object.entries(s.pts)) {
            if (!fp[k]) errs.push(`${s.key} : point ${k} absent de la figure`);
            else if (D(v[0]) !== D(fp[k][0]) || D(v[1]) !== D(fp[k][1])) errs.push(`${s.key} : point ${k} de la figure ${fp[k]} ≠ ${v}`);
          }
          for (const k of Object.keys(fp)) if (!s.pts[k]) errs.push(`${s.key} : point ${k} de la figure inconnu de l'oracle`);
          if (fig.grid !== true || fig.axes !== true) errs.push(`${s.key} : la figure doit porter grid et axes`);
        }
        if (s.k === 'readpt' || s.k === 'readcoord') for (const p of Object.values(figPts(s))) if (has(p)) errs.push(`${s.key} : l'énoncé imprime un point de la figure alors qu'il faut le lire`);
        if (s.k === 'whichpt' && !has(PT(s.target))) errs.push(`${s.key} : le couple cherché est absent de l'énoncé`);
      } else {
        // les nombres retapés doivent être ceux de l'énoncé (couples imprimés)
        const want = [];
        if (s.p) want.push(PT(s.p));
        if (Array.isArray(s.b) && s.k !== 'fourth' && s.k !== 'natrect') want.push(PT(s.b));
        if (s.k === 'fourth') want.push(PT(s.A), PT(s.B), PT(s.C));
        if (s.k === 'natrect') want.push(PT(s.A), PT(s.B), PT(s.C));
        if (s.k === 'crossing') { want.push([D(s.v[0]), D(s.v[1])], [D(s.v[0]), D(s.v[2])], [D(s.h[1]), D(s.h[0])], [D(s.h[2]), D(s.h[0])]); }
        if (s.k === 'countaxis') s.pts.forEach((p) => want.push(PT(p)));
        if (s.k === 'swapq') want.push([D(s.a), D(s.b)], [D(s.b), D(s.a)]);
        if (s.k === 'tf') { if (s.claim.p) want.push(PT(s.claim.p)); if (s.claim.q) want.push(PT(s.claim.q)); }
        if (s.k === 'quadsame') s.cands.forEach(() => {});
        for (const p of want) if (!has(p)) errs.push(`${s.key} : (${txt(p[0])} ; ${txt(p[1])}) absent de l'énoncé`);
        if (s.k === 'sym' || s.k === 'shiftpt' || s.k === 'fourth' || s.k === 'crossing') {
          const k = keyValue(s);
          // le symétrique d'un point d'un axe par rapport à cet axe est ce point même : alors le couple imprimé est la réponse, par nature
          const own = s.k === 'sym' && eqP(PT(s.p), k);
          const stmt = q.statement; if (!own && pairsOf(stmt).some(([x, y]) => D(x) === k[0] && D(y) === k[1])) errs.push(`${s.key} : la réponse est imprimée dans la question`);
        }
      }

      if (!isChoice(s)) {
        const key = keyValue(s);
        const pt = isPoint(s);
        if (pt) {
          if (q.answerType !== 'point') { errs.push(`${s.key} : devrait être point`); continue; }
          if (D(String(q.expectedAnswer.x)) !== key[0] || D(String(q.expectedAnswer.y)) !== key[1]) errs.push(`${s.key} : clé (${q.expectedAnswer.x} ; ${q.expectedAnswer.y}) ≠ (${txt(key[0])} ; ${txt(key[1])})`);
        } else {
          if (q.answerType !== 'rational') { errs.push(`${s.key} : devrait être rational`); continue; }
          if (D(String(q.expectedAnswer)) !== key) errs.push(`${s.key} : clé ${q.expectedAnswer} ≠ ${txt(key)}`);
        }
        const want = sigList(s, key); const got = q.misconceptionSignatures ?? [];
        const idOf = (id) => `MISC-MUSTAWI-${id}`;
        if (want.length !== got.length) errs.push(`${s.key} : ${got.length} signatures, l'oracle en attend ${want.length} [${want.map((w) => w[0])}]`);
        for (const [id, v] of want) {
          const sig = got.find((g) => g.id === idOf(id));
          if (!sig) { errs.push(`${s.key} : signature ${idOf(id)} absente`); continue; }
          const val = pt ? [D(String(sig.value.x)), D(String(sig.value.y))] : D(String(sig.value));
          if (pt ? !eqP(val, v) : val !== v) errs.push(`${s.key} : signature ${idOf(id)} ≠ l'erreur nommée`);
          if (pt ? eqP(val, key) : val === key) errs.push(`${s.key} : signature ${idOf(id)} = la bonne réponse`);
        }
      } else {
        if (q.answerType !== 'choice') { errs.push(`${s.key} : devrait être choice`); continue; }
        const opts = optionsOf(s); const good = choiceIndex(s);
        if (q.choices.length !== opts.length) errs.push(`${s.key} : ${q.choices.length} options, ${opts.length} retapées`);
        q.choices.forEach((c, i) => {
          const o = opts[i]; if (!o) return;
          const read = optionValue(s, c.content);
          if (!sameValue(read, o.v)) errs.push(`${s.key} : option ${c.id} « ${c.content} » ≠ ${JSON.stringify(o.v)}`);
          if (c.isCorrect !== (i === good)) errs.push(`${s.key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${i === good}`);
          const wantMisc = o.misc ? `MISC-MUSTAWI-${o.misc}` : null;
          if ((c.misconceptionId ?? null) !== wantMisc) errs.push(`${s.key} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${wantMisc}`);
          if (!c.isCorrect && o.ok) errs.push(`${s.key} : le distracteur ${c.id} est vrai`);
        });
      }
    } catch (e) { errs.push(`${s.key} : ${e.message}`); }
  }
  for (const b of bank) if (b.q.answerType !== 'selfCheck' && !(b.key in ORACLE)) errs.push(`${b.key} : sans vérification`);
  return errs;
}
