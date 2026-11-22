// Oracle du banc « tatbiq-qaida-harfiya » (تطبيق قاعدة حرفية, 1AM, 2026-10-30) — feuilles d'examen de فصل (« على منوال اختبار الفصل … »).
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec des RATIONNELS exacts en BigInt (n/d, aucun flottant) et un évaluateur d'expressions PROPRE à l'oracle
// (jetons + algorithme « shunting-yard » à priorités ; aucun import de packages/core, du laboratoire ni de la leçon). Chaque question est RETAPÉE ci-dessous (`SPECS`) :
// la règle (écrite avec × explicite : `*` et `/`) et les valeurs des lettres, jamais la réponse.
//  - `E`   un calcul « احسب » : la règle appliquée aux valeurs, une lettre étant remplacée dans CHAQUE position (priorités : parenthèses, × ÷, puis + −) ; `cnt: false` = étape d'une leçon antérieure ;
//  - `M`   QCM : la seule option égale à la valeur de la règle ; chaque autre option est une LECTURE FAUTIVE recalculée ;
//  - `T`   vrai / faux : la valeur affichée est-elle la valeur de la règle ? (une valeur fausse est la lecture fautive nommée) ;
//  - `W`   QCM d'écriture : la seule option qui a la valeur de la cible pour six jeux de valeurs (la multiplication omise rétablie : « 3a » = 3 × a) ; chaque autre option est la lecture fautive (« 3+a », « 54 », « 4a+b ») ;
//  - `Sf`  QCM de formule de tableur (la cellule A2 tient lieu de la lettre ; une formule sans × est refusée) ;
//  - `X`   QCM contre-exemple : la SEULE option où les deux côtés diffèrent ; les autres options vérifient l'égalité (« ONEOK ») ;
//  - `XT`  « un exemple où la règle tient suffit-il à la prouver ? » (les côtés sont égaux : réponse « non ») ; `XN` (les côtés diffèrent : « oui, un seul exemple suffit ») ; `XK` (combien de contre-exemples : un) ;
//  - `F`   le plus petit naturel ≥ from où la règle tombe (recherche exhaustive) ;
//  - `C`   quelle quantité est la plus petite / la plus grande (deux règles, deux jeux de valeurs) ; `G` un montant suffit-il ? ; `CL` « A n'est jamais plus cher que B » réfuté par un témoin.
// Lectures fautives recalculées (jamais lues) : GLUED (2x → 23), ONCE (une lettre répétée n'est remplacée qu'une fois : les autres positions valent 0), NOBR (parenthèses ignorées), LTR (de gauche à droite sans priorités),
// PLUS (3x lu 3+x), SWAP (valeurs de deux lettres échangées), NOCOMMA (la virgule d'un décimal oubliée), NOSIGN (formule de tableur sans ×). Chaque signature est vérifiée DIFFÉRENTE de la clé.
// `audit(bank)` relit les fichiers : clé, QCM (une seule option juste), rendu LaTeX des options, signatures, الكفاءة de chaque question, étapes hors leçon, valeurs lues dans les énoncés.
import { R, C } from './helpers.mjs';

/* ── rationnels exacts ── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const Q = (n, d = 1n) => { if (d === 0n) throw new Error('dénominateur nul'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const mul = (x, y) => Q(x.n * y.n, x.d * y.d);
const div = (x, y) => Q(x.n * y.d, x.d * y.n);
const eq = (x, y) => x.n === y.n && x.d === y.d;
const le = (x, y) => x.n * y.d <= y.n * x.d;
const lt = (x, y) => x.n * y.d < y.n * x.d;
const lit = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/,/g, '.').trim();
  const m = /^(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const f = m[2] ?? '';
  return Q(BigInt(m[1] + f), 10n ** BigInt(f.length));
};
/** décimal exact écrit « 12.5 » (une valeur qui ne s'arrête pas lève une erreur) */
const key = (x) => {
  if (x.n < 0n) throw new Error('négatif');
  let d = x.d; for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
  if (d !== 1n) throw new Error(`ne s'arrête pas : ${x.n}/${x.d}`);
  let k = 0n; while ((10n ** k) % x.d !== 0n) k++;
  const N = x.n * (10n ** k / x.d);
  if (k === 0n) return `${N}`;
  const s = `${N}`.padStart(Number(k) + 1, '0');
  return `${s.slice(0, -Number(k))}.${s.slice(-Number(k))}`;
};
const num$ = (x) => key(x).replace('.', '{,}');

/* ── jetons et évaluateur (shunting-yard) ── */
const tokens = (s) => s.replace(/\s+/g, '').match(/\d+(?:\.\d+)?|[a-z]|[-+*/()]/g);
const isNum = (t) => /^\d/.test(t);
const isVar = (t) => /^[a-z]$/.test(t);
const APPLY = { '+': add, '-': sub, '*': mul, '/': div };
/** valeur d'une liste de jetons ; `prec` donne les priorités (par défaut : × ÷ avant + −) ; `val(letter)` rend la valeur d'une lettre */
const evalTokens = (tk, val, prec = { '+': 1, '-': 1, '*': 2, '/': 2 }) => {
  const out = []; const ops = [];
  const reduce = () => { const op = ops.pop(); const b = out.pop(); const a = out.pop(); out.push(APPLY[op](a, b)); };
  for (const t of tk) {
    if (isNum(t)) out.push(lit(t));
    else if (isVar(t)) out.push(val(t));
    else if (t === '(') ops.push(t);
    else if (t === ')') { while (ops.at(-1) !== '(') reduce(); ops.pop(); }
    else { while (ops.length && ops.at(-1) !== '(' && prec[ops.at(-1)] >= prec[t]) reduce(); ops.push(t); }
  }
  while (ops.length) reduce();
  return out[0];
};
const envVal = (env) => (l) => { if (!(l in env)) throw new Error(`lettre sans valeur : ${l}`); return lit(env[l]); };
const sameLetters = (env, x, y) => ({ ...env, [x]: env[y], [y]: env[x] });

/** la valeur de `expr` pour `env` : sans lecture fautive (kind = null) ou selon la LECTURE FAUTIVE nommée */
const read = (expr, env, kind) => {
  let tk = tokens(expr);
  const [k, arg] = (kind ?? '').split(':');
  if (!kind) return evalTokens(tk, envVal(env));
  if (k === 'GLUED') { // « 2x » avec x = 3 lu 23 : le nombre et la valeur écrits côte à côte
    for (let i = 0; i + 2 < tk.length; i++) {
      if ((isNum(tk[i]) || isVar(tk[i])) && tk[i + 1] === '*' && isVar(tk[i + 2])) {
        const a = isVar(tk[i]) ? env[tk[i]] : tk[i];
        const b = env[tk[i + 2]];
        if (/\./.test(a) || /\./.test(b)) throw new Error('GLUED : entiers seulement');
        tk = [...tk.slice(0, i), a + b, ...tk.slice(i + 3)]; i--;
      }
    }
    return evalTokens(tk, envVal(env));
  }
  if (k === 'PLUS') { // « 3x » lu 3 + x
    const o = [];
    for (let i = 0; i < tk.length; i++) {
      if ((isNum(tk[i]) || isVar(tk[i])) && tk[i + 1] === '*' && isVar(tk[i + 2])) { o.push('(', tk[i], '+', tk[i + 2], ')'); i += 2; } else o.push(tk[i]);
    }
    return evalTokens(o, envVal(env));
  }
  if (k === 'ONCE') { const seen = {}; return evalTokens(tk, (l) => { seen[l] = (seen[l] ?? 0) + 1; return seen[l] > 1 ? Q(0n) : lit(env[l]); }); }
  if (k === 'NOBR') return evalTokens(tk.filter((t) => t !== '(' && t !== ')'), envVal(env));
  if (k === 'LTR') return evalTokens(tk, envVal(env), { '+': 1, '-': 1, '*': 1, '/': 1 });
  if (k === 'SWAP') { const [x, y] = arg.split(','); return evalTokens(tk, envVal(sameLetters(env, x, y))); }
  if (k === 'NOCOMMA') { const e = {}; for (const [l, v] of Object.entries(env)) e[l] = String(v).replace('.', '').replace(/^0+(?=\d)/, ''); return evalTokens(tk, envVal(e)); }
  throw new Error(`lecture inconnue : ${kind}`);
};
const MISC = { GLUED: 'GLUED', ONCE: 'ONCE', NOBR: 'ORDER', LTR: 'ORDER', PLUS: 'PLUS', SWAP: 'SWAP', NOCOMMA: 'DECIMAL', ONEOK: 'ONEOK', MANYNEED: 'MANYNEED', REJECT: 'REJECT', NOSIGN: 'NOSIGN' };
const mid = (kind) => `MISC-TATBIQ-${MISC[kind.split(':')[0]]}`;

/* ── écriture : × et ÷ en LaTeX, nombres décimaux à virgule ── */
const texOf = (expr) => {
  // l'oracle relit lui-même l'écriture LaTeX attendue d'une règle (la multiplication reste explicite dans les énoncés)
  const tk = tokens(expr);
  return tk.map((t) => (t === '*' ? '\\times ' : t === '/' ? '\\div ' : isNum(t) ? t.replace('.', '{,}') : t)).join('');
};
const optTex = (vals) => Object.entries(vals).map(([l, v]) => `$${l}=${v.replace('.', '{,}')}$`).join(' و ');
const wTex = (s) => s.replace(/\*/g, '\\times ').replace(/\//g, '\\div ').replace(/\./g, '{,}');
/** une écriture d'élève (multiplication omise rétablie) rendue en jetons : « 3(x+2) » → 3*(x+2) */
const written = (s) => {
  const tk = tokens(s); const o = [];
  tk.forEach((t, i) => {
    const p = tk[i - 1];
    if (i && (isNum(p) || isVar(p) || p === ')') && (isVar(t) || t === '(')) o.push('*');
    o.push(t);
  });
  return o;
};
const TEST_ENVS = (letters) => [0, 1, 2, 3, 4, 5].map((i) => Object.fromEntries(letters.map((l, j) => [l, String(2 + i + 2 * j + (i % 2 ? 1 : 0))])));
const lettersOf = (expr) => [...new Set(tokens(expr).filter(isVar))];

const YES = 'نعم، يكفي'; const NO = 'لا، لا يكفي';
const ONE = 'مثال مضادّ واحد';
const CLYES = 'نعم، قوله صحيح'; const CLNO = 'لا، قوله غير صحيح';
const LPC = (p) => `1am_tatbiq-qaida-harfiya_${p}`;

/* ── énoncés retapés ── */
const SPECS = {
  "ex-1am-tatbiq-qaida-harfiya-l1-001:q1": {"k":"W","lp":"P1","target":"4*n","opts":[{"text":"4+n","kind":"PLUS"},{"text":"4n","kind":null},{"text":"n+4","kind":"PLUS"}]},
  "ex-1am-tatbiq-qaida-harfiya-l1-001:q2": {"k":"W","lp":"P1","target":"a*b","opts":[{"text":"ab","kind":null},{"text":"a+b","kind":"PLUS"},{"text":"b+a","kind":"PLUS"}]},
  "ex-1am-tatbiq-qaida-harfiya-l1-001:q3": {"k":"W","lp":"P1","target":"5*x","env":{"x":"4"},"opts":[{"text":"54","kind":"GLUED"},{"text":"5+4","kind":"PLUS"},{"text":"5*4","kind":null}]},
  "ex-1am-tatbiq-qaida-harfiya-l1-001:q4": {"k":"E","lp":"P1","expr":"2*x","env":{"x":"6"},"sigs":[["26","GLUED"],["8","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-002:q1": {"k":"E","lp":"P2","expr":"6*n+25","env":{"n":"4"},"sigs":[["89","GLUED"],["35","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-002:q2": {"k":"E","lp":"P2","expr":"6*n+25","env":{"n":"10"},"sigs":[["635","GLUED"],["41","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-002:q3": {"k":"E","lp":"P2","expr":"6*n+25","env":{"n":"0"},"sigs":[["85","GLUED"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-003:q1": {"k":"E","lp":"P2","expr":"3*w+d","env":{"w":"6","d":"3"},"sigs":[["12","PLUS"],["15","SWAP:w,d"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-003:q2": {"k":"E","lp":"P2","expr":"3*w+d","env":{"w":"4","d":"7"},"sigs":[["14","PLUS"],["25","SWAP:w,d"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-003:q3": {"k":"M","lp":"P2","expr":"3*w+d","env":{"w":"9","d":"1"},"opts":[null,"PLUS","SWAP:w,d"]},
  "ex-1am-tatbiq-qaida-harfiya-l1-004:q1": {"k":"W","lp":"P1","target":"7*n","env":{"n":"3"},"opts":[{"text":"7*3","kind":null},{"text":"73","kind":"GLUED"},{"text":"7+3","kind":"PLUS"}]},
  "ex-1am-tatbiq-qaida-harfiya-l1-004:q2": {"k":"W","lp":"P1","target":"9*x","env":{"x":"2"},"opts":[{"text":"92","kind":"GLUED"},{"text":"9+2","kind":"PLUS"},{"text":"9*2","kind":null}]},
  "ex-1am-tatbiq-qaida-harfiya-l1-004:q3": {"k":"E","lp":"P1","expr":"a*b","env":{"a":"6","b":"4"},"sigs":[["64","GLUED"],["10","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-004:q4": {"k":"E","lp":"P1","expr":"3*x","env":{"x":"5"},"sigs":[["35","GLUED"],["8","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-005:q1": {"k":"E","lp":"P2","expr":"2*(a+b)","env":{"a":"12","b":"7"},"sigs":[["31","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-005:q2": {"k":"E","lp":"P2","expr":"2*(a+b)","env":{"a":"9","b":"15"},"sigs":[["33","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-005:q3": {"k":"E","lp":"P2","expr":"2*(a+b)","env":{"a":"20","b":"5"},"sigs":[["45","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-006:q1": {"k":"E","lp":"P2","expr":"d/t","env":{"d":"160","t":"8"},"sigs":[["0.05","SWAP:d,t"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-006:q2": {"k":"E","lp":"P2","expr":"d/t","env":{"d":"75","t":"3"},"sigs":[["0.04","SWAP:d,t"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-006:q3": {"k":"E","lp":"P2","expr":"d/t","env":{"d":"48","t":"6"},"sigs":[["0.125","SWAP:d,t"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-007:q1": {"k":"T","lp":"P2","expr":"2*(x+3)","env":{"x":"4"},"shown":"14","kind":null},
  "ex-1am-tatbiq-qaida-harfiya-l1-007:q2": {"k":"T","lp":"P2","expr":"2*(x+3)","env":{"x":"7"},"shown":"17","kind":"NOBR"},
  "ex-1am-tatbiq-qaida-harfiya-l1-007:q3": {"k":"T","lp":"P2","expr":"3*x+2","env":{"x":"5"},"shown":"10","kind":"PLUS"},
  "ex-1am-tatbiq-qaida-harfiya-l1-008:q1": {"k":"E","lp":"P2","expr":"40*n","env":{"n":"2.5"},"sigs":[["1000","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-008:q2": {"k":"E","lp":"P2","expr":"40*n","env":{"n":"0.5"},"sigs":[["200","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-008:q3": {"k":"E","lp":"P2","expr":"40*n","env":{"n":"1.2"},"sigs":[["480","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l1-009:q1": {"k":"M","lp":"P2","expr":"3*x+4","env":{"x":"5"},"opts":["GLUED",null,"PLUS"]},
  "ex-1am-tatbiq-qaida-harfiya-l1-009:q2": {"k":"M","lp":"P2","expr":"2*a+3*b","env":{"a":"4","b":"5"},"opts":["GLUED","SWAP:a,b","PLUS",null]},
  "ex-1am-tatbiq-qaida-harfiya-l1-009:q3": {"k":"M","lp":"P2","expr":"4*(n+1)","env":{"n":"6"},"opts":[null,"NOBR"]},
  "ex-1am-tatbiq-qaida-harfiya-l1-010:q1": {"k":"W","lp":"P1","target":"4*(a+b)","opts":[{"text":"4a+b","kind":"NOBR"},{"text":"4(a+b)","kind":null}]},
  "ex-1am-tatbiq-qaida-harfiya-l1-010:q2": {"k":"W","lp":"P1","target":"3*x","opts":[{"text":"3x","kind":null},{"text":"3+x","kind":"PLUS"},{"text":"x+3","kind":"PLUS"}]},
  "ex-1am-tatbiq-qaida-harfiya-l1-010:q3": {"k":"E","lp":"P1","expr":"5*(x+2)","env":{"x":"4"},"sigs":[["22","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-001:q1": {"k":"X","lp":"P3","left":"3*n","right":"n*n","opts":[{"n":"0"},{"n":"3"},{"n":"4"}]},
  "ex-1am-tatbiq-qaida-harfiya-l2-001:q2": {"k":"XN","lp":"P3","left":"3*n","right":"n*n","vals":{"n":"5"},"order":"NO,YES"},
  "ex-1am-tatbiq-qaida-harfiya-l2-001:q3": {"k":"XT","lp":"P3","left":"3*n","right":"n*n","vals":{"n":"3"},"order":"NO,YES"},
  "ex-1am-tatbiq-qaida-harfiya-l2-002:q1": {"k":"E","lp":"P2","expr":"5*n+20-n","env":{"n":"10"},"sigs":[["70","ONCE"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-002:q2": {"k":"E","lp":"P2","expr":"3*x+x+8","env":{"x":"6"},"sigs":[["26","ONCE"],["23","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-002:q3": {"k":"E","lp":"P2","expr":"40-2*n+n","env":{"n":"9"},"sigs":[["22","ONCE"],["20","GLUED"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-003:q1": {"k":"E","lp":"P2","expr":"4*a+3*b","env":{"a":"5","b":"2"},"sigs":[["23","SWAP:a,b"],["14","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-003:q2": {"k":"E","lp":"P2","expr":"4*a+3*b","env":{"a":"2","b":"5"},"sigs":[["26","SWAP:a,b"],["14","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-003:q3": {"k":"T","lp":"P2","expr":"4*a+3*b","env":{"a":"3","b":"3"},"shown":"21","kind":null},
  "ex-1am-tatbiq-qaida-harfiya-l2-004:q1": {"k":"E","lp":"P2","expr":"3*x+8-x/2","env":{"x":"4"},"sigs":[["20","ONCE"],["8","LTR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-004:q2": {"k":"E","lp":"P2","expr":"3*x+8-x/2","env":{"x":"0.5"},"sigs":[["9.5","ONCE"],["20.5","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-004:q3": {"k":"E","lp":"P2","expr":"3*x+8-x/2","env":{"x":"0"},"sigs":[]},
  "ex-1am-tatbiq-qaida-harfiya-l2-005:q1": {"k":"XT","lp":"P3","left":"a+b","right":"a*b","vals":{"a":"2","b":"2"},"order":"YES,NO"},
  "ex-1am-tatbiq-qaida-harfiya-l2-005:q2": {"k":"XN","lp":"P3","left":"a+b","right":"a*b","vals":{"a":"3","b":"5"},"order":"YES,NO"},
  "ex-1am-tatbiq-qaida-harfiya-l2-005:q3": {"k":"XK","lp":"P3","left":"a+b","right":"a*b","vals":{"a":"3","b":"5"},"order":"مثالان مضادّان|عدّة أمثلة مضادّة|مثال مضادّ واحد"},
  "ex-1am-tatbiq-qaida-harfiya-l2-006:q1": {"k":"M","lp":"P2","expr":"2*x+y","env":{"x":"6","y":"5"},"opts":["SWAP:x,y",null,"GLUED"]},
  "ex-1am-tatbiq-qaida-harfiya-l2-006:q2": {"k":"T","lp":"P2","expr":"x*y+3","env":{"x":"4","y":"5"},"shown":"48","kind":"GLUED"},
  "ex-1am-tatbiq-qaida-harfiya-l2-006:q3": {"k":"M","lp":"P2","expr":"7*a-2*b","env":{"a":"5","b":"4"},"opts":["SWAP:a,b","LTR",null]},
  "ex-1am-tatbiq-qaida-harfiya-l2-007:q1": {"k":"E","lp":"P2","expr":"(6*x)-(2*y)+5","env":{"x":"3","y":"4"},"sigs":[["23","SWAP:x,y"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-007:q2": {"k":"E","lp":"P2","expr":"(6*x)-(2*y)+5","env":{"x":"5","y":"2"},"sigs":[["7","SWAP:x,y"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-007:q3": {"k":"E","lp":"P2","expr":"(6*x)-(2*y)+5","env":{"x":"2","y":"6"},"sigs":[["37","SWAP:x,y"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-008:q1": {"k":"E","lp":"P3","expr":"x*x","env":{"x":"2"},"sigs":[]},
  "ex-1am-tatbiq-qaida-harfiya-l2-008:q2": {"k":"X","lp":"P3","left":"x*x","right":"x+2","opts":[{"x":"2"},{"x":"5"}]},
  "ex-1am-tatbiq-qaida-harfiya-l2-008:q3": {"k":"F","lp":"P3","left":"x*x","right":"x+2","from":3,"v":"x","sigs":[["2","ONEOK"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-009:q1": {"k":"Sf","lp":"P1","target":"7*x-3","letter":"x","cell":"A2","opts":[{"text":"=7A2-3","kind":"NOSIGN"},{"text":"=7*A2-3","kind":null},{"text":"=7+A2-3","kind":"PLUS"}]},
  "ex-1am-tatbiq-qaida-harfiya-l2-009:q2": {"k":"E","lp":"P2","expr":"7*x-3","env":{"x":"2"},"sigs":[["69","GLUED"],["6","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-009:q3": {"k":"E","lp":"P2","expr":"7*x-3","env":{"x":"6"},"sigs":[["73","GLUED"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-010:q1": {"k":"E","lp":"P2","expr":"2*(x+1.5)+x","env":{"x":"2"},"sigs":[["7.5","NOBR"],["7","ONCE"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-010:q2": {"k":"E","lp":"P2","expr":"2*(x+1.5)+x","env":{"x":"0.5"},"sigs":[["3","NOBR"],["4","ONCE"]]},
  "ex-1am-tatbiq-qaida-harfiya-l2-010:q3": {"k":"E","lp":"P2","expr":"2*(x+1.5)+x","env":{"x":"4.5"},"sigs":[["15","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-001:q1": {"k":"E","lp":"P2","expr":"4*n+30","env":{"n":"20"},"sigs":[["54","PLUS"],["450","GLUED"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-001:q2": {"k":"E","lp":"P2","expr":"6*n","env":{"n":"20"},"sigs":[["620","GLUED"],["26","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-001:q3": {"k":"C","lp":"P2","A":{"expr":"4*n+30","env":{"n":"20"}},"B":{"expr":"6*n","env":{"n":"20"}},"ask":"min","labels":{"A":"المكتبة الأولى","B":"المكتبة الثانية"},"order":["A","B"],"opts":[null,"PLUS"]},
  "ex-1am-tatbiq-qaida-harfiya-l3-001:q4": {"k":"G","lp":"P2","expr":"6*n","env":{"n":"15"},"budget":"100","order":["yes","no"],"opts":[null,"GLUED"]},
  "ex-1am-tatbiq-qaida-harfiya-l3-002:q1": {"k":"E","lp":"P2","expr":"d/t","env":{"d":"120","t":"2.5"},"sigs":[["4.8","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-002:q2": {"k":"E","lp":"P2","expr":"d/t","env":{"d":"90","t":"1.5"},"sigs":[["6","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-002:q3": {"k":"E","lp":"P2","expr":"d/t","env":{"d":"45","t":"0.5"},"sigs":[["9","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-002:q4": {"k":"C","lp":"P2","A":{"expr":"d/t","env":{"d":"120","t":"2.5"}},"B":{"expr":"d/t","env":{"d":"90","t":"1.5"}},"ask":"max","labels":{"A":"الحافلة الأولى","B":"الحافلة الثانية"},"order":["A","B"],"opts":["SWAP:d,t",null]},
  "ex-1am-tatbiq-qaida-harfiya-l3-003:q1": {"k":"E","lp":"P2","expr":"2*(a+b)","env":{"a":"18.5","b":"11.5"},"sigs":[["48.5","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-003:q2": {"k":"E","lp":"P2","expr":"2*(a+b)","env":{"a":"25","b":"7.5"},"sigs":[["57.5","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-003:q3": {"k":"E","lp":"P2","expr":"2*(a+b)","env":{"a":"16","b":"16"},"sigs":[["48","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-003:q4": {"k":"G","lp":"P2","expr":"2*(a+b)","env":{"a":"25","b":"7.5"},"budget":"60","order":["yes","no"],"opts":["NOBR",null]},
  "ex-1am-tatbiq-qaida-harfiya-l3-004:q1": {"k":"Sf","lp":"P2","target":"5*x+2","letter":"x","cell":"A2","opts":[{"text":"=5A2+2","kind":"NOSIGN"},{"text":"=5+A2+2","kind":"PLUS"},{"text":"=5*A2+2","kind":null}]},
  "ex-1am-tatbiq-qaida-harfiya-l3-004:q2": {"k":"E","lp":"P2","expr":"5*x+2","env":{"x":"3"},"sigs":[["55","GLUED"],["10","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-004:q3": {"k":"E","lp":"P2","expr":"5*x+2","env":{"x":"8"},"sigs":[["60","GLUED"],["15","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-004:q4": {"k":"T","lp":"P2","expr":"5*x+2","env":{"x":"10"},"shown":"17","kind":"PLUS"},
  "ex-1am-tatbiq-qaida-harfiya-l3-005:q1": {"k":"E","lp":"P2","expr":"3*w+d","env":{"w":"7","d":"2"},"sigs":[["12","PLUS"],["13","SWAP:w,d"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-005:q2": {"k":"E","lp":"P2","expr":"3*w+d","env":{"w":"6","d":"4"},"sigs":[["13","PLUS"],["18","SWAP:w,d"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-005:q3": {"k":"E","lp":"P2","expr":"3*w+d","env":{"w":"8","d":"0"},"sigs":[["11","PLUS"],["8","SWAP:w,d"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-005:q4": {"k":"C","lp":"P2","A":{"expr":"3*w+d","env":{"w":"7","d":"2"}},"B":{"expr":"3*w+d","env":{"w":"6","d":"4"}},"ask":"max","labels":{"A":"الفجر","B":"الأمل"},"order":["A","B"],"opts":[null,"PLUS"]},
  "ex-1am-tatbiq-qaida-harfiya-l3-006:q1": {"k":"E","lp":"P3","expr":"2*n+4","env":{"n":"2"},"sigs":[]},
  "ex-1am-tatbiq-qaida-harfiya-l3-006:q2": {"k":"E","lp":"P3","expr":"4*n","env":{"n":"2"},"sigs":[["42","GLUED"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-006:q3": {"k":"X","lp":"P3","left":"2*n+4","right":"4*n","opts":[{"n":"2"},{"n":"5"}]},
  "ex-1am-tatbiq-qaida-harfiya-l3-006:q4": {"k":"XT","lp":"P3","left":"2*n+4","right":"4*n","vals":{"n":"2"},"order":"YES,NO"},
  "ex-1am-tatbiq-qaida-harfiya-l3-007:q1": {"k":"W","lp":"P1","target":"6*t+2*m","env":{"t":"3","m":"4"},"opts":[{"text":"6t+2m","kind":null},{"text":"6+t+2+m","kind":"PLUS"},{"text":"6m+2t","kind":"SWAP:t,m"}]},
  "ex-1am-tatbiq-qaida-harfiya-l3-007:q2": {"k":"E","lp":"P2","expr":"6*t+2*m","env":{"t":"3","m":"4"},"sigs":[["87","GLUED"],["30","SWAP:t,m"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-007:q3": {"k":"T","lp":"P2","expr":"6*t+2*m","env":{"t":"5","m":"1"},"shown":"16","kind":"SWAP:t,m"},
  "ex-1am-tatbiq-qaida-harfiya-l3-007:q4": {"k":"XN","lp":"P3","left":"6*t+2*m","right":"8*t*m","vals":{"t":"2","m":"3"},"order":"YES,NO"},
  "ex-1am-tatbiq-qaida-harfiya-l3-008:q1": {"k":"E","lp":"P2","expr":"50+30*k","env":{"k":"4"},"sigs":[["84","PLUS"],["320","LTR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-008:q2": {"k":"E","lp":"P2","expr":"50+30*k","env":{"k":"7.5"},"sigs":[["2300","NOCOMMA"],["600","LTR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-008:q3": {"k":"M","lp":"P2","expr":"50+30*k","env":{"k":"2.5"},"opts":["LTR",null,"NOCOMMA"]},
  "ex-1am-tatbiq-qaida-harfiya-l3-008:q4": {"k":"G","lp":"P2","expr":"50+30*k","env":{"k":"9"},"budget":"300","order":["yes","no"],"opts":["PLUS",null]},
  "ex-1am-tatbiq-qaida-harfiya-l3-009:q1": {"k":"XT","lp":"P3","left":"x+x","right":"x*x","vals":{"x":"2"},"order":"NO,YES"},
  "ex-1am-tatbiq-qaida-harfiya-l3-009:q2": {"k":"X","lp":"P3","left":"x*x","right":"4*x","opts":[{"x":"0"},{"x":"4"},{"x":"6"}]},
  "ex-1am-tatbiq-qaida-harfiya-l3-009:q3": {"k":"F","lp":"P3","left":"n*n","right":"2*n","from":3,"v":"n","sigs":[["2","ONEOK"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-009:q4": {"k":"XK","lp":"P3","left":"n*n","right":"2*n","vals":{"n":"3"},"order":"مثال مضادّ واحد|مثالان مضادّان|عدّة أمثلة مضادّة"},
  "ex-1am-tatbiq-qaida-harfiya-l3-010:q1": {"k":"E","lp":"P2","expr":"3*x+x+x+6+4.5","env":{"x":"2"},"sigs":[["16.5","ONCE"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-010:q2": {"k":"E","lp":"P2","expr":"3*x+x+x+6+4.5","env":{"x":"3.5"},"sigs":[["21","ONCE"],["185.5","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l3-010:q3": {"k":"E","lp":"P2","expr":"20.5*5","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l3-010:q4": {"k":"M","lp":"P2","expr":"3*x+x+x+6+4.5","env":{"x":"1.5"},"opts":["ONCE","NOCOMMA",null]},
  "ex-1am-tatbiq-qaida-harfiya-l4-001:q1": {"k":"E","lp":"P2","expr":"2*(a+b)","env":{"a":"14.5","b":"9.5"},"sigs":[["38.5","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-001:q2": {"k":"E","lp":"P2","expr":"48*250","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l4-001:q3": {"k":"G","lp":"P2","expr":"2*(a+b)*250","env":{"a":"14.5","b":"9.5"},"budget":"11500","order":["yes","no"],"opts":["NOBR",null]},
  "ex-1am-tatbiq-qaida-harfiya-l4-002:q1": {"k":"E","lp":"P2","expr":"24.5*n+12","env":{"n":"3"},"sigs":[["39.5","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-002:q2": {"k":"E","lp":"P2","expr":"24.5*n+12","env":{"n":"1.5"},"sigs":[["379.5","NOCOMMA"],["38","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-002:q3": {"k":"E","lp":"P2","expr":"100-48.75","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l4-003:q1": {"k":"E","lp":"P2","expr":"d/t","env":{"d":"225","t":"2.5"},"sigs":[["9","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-003:q2": {"k":"E","lp":"P2","expr":"d/t","env":{"d":"40","t":"2"},"sigs":[["0.05","SWAP:d,t"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-003:q3": {"k":"E","lp":"P2","expr":"90-20","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l4-004:q1": {"k":"E","lp":"P2","expr":"(x+2.5)*(y-1)","env":{"x":"1.5","y":"4"},"sigs":[["10.5","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-004:q2": {"k":"E","lp":"P2","expr":"(x+2.5)*(y-1)","env":{"x":"0.5","y":"6"},"sigs":[["14.5","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-004:q3": {"k":"E","lp":"P2","expr":"3*5-12/4","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l4-005:q1": {"k":"Sf","lp":"P2","target":"2.5*x+4","letter":"x","cell":"A2","opts":[{"text":"=2.5*A2+4","kind":null},{"text":"=2.5A2+4","kind":"NOSIGN"},{"text":"=2.5+A2+4","kind":"PLUS"}]},
  "ex-1am-tatbiq-qaida-harfiya-l4-005:q2": {"k":"E","lp":"P2","expr":"2.5*x+4","env":{"x":"6"},"sigs":[["12.5","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-005:q3": {"k":"E","lp":"P2","expr":"2.5*x+4","env":{"x":"1.2"},"sigs":[["7.7","PLUS"],["34","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-005:q4": {"k":"E","lp":"P2","expr":"19-7","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l4-006:q1": {"k":"E","lp":"P3","expr":"a+b","env":{"a":"1.5","b":"3"},"sigs":[]},
  "ex-1am-tatbiq-qaida-harfiya-l4-006:q2": {"k":"E","lp":"P3","expr":"a*b","env":{"a":"1.5","b":"3"},"sigs":[["45","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-006:q3": {"k":"X","lp":"P3","left":"a+b","right":"a*b","opts":[{"a":"2","b":"2"},{"a":"1.5","b":"3"},{"a":"2","b":"3"}]},
  "ex-1am-tatbiq-qaida-harfiya-l4-006:q4": {"k":"XN","lp":"P3","left":"a+b","right":"a*b","vals":{"a":"2","b":"3"},"order":"NO,YES"},
  "ex-1am-tatbiq-qaida-harfiya-l4-007:q1": {"k":"E","lp":"P2","expr":"3*x+12/4-y","env":{"x":"5","y":"2"},"sigs":[["4.75","LTR"],["4","SWAP:x,y"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-007:q2": {"k":"E","lp":"P2","expr":"3*x+12/4-y","env":{"x":"2.5","y":"1"},"sigs":[["3.875","LTR"],["77","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-007:q3": {"k":"E","lp":"P2","expr":"36/4+2*3","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l4-008:q1": {"k":"E","lp":"P2","expr":"12.5*n+40","env":{"n":"8"},"sigs":[["60.5","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-008:q2": {"k":"E","lp":"P2","expr":"12.5*n+40","env":{"n":"3.5"},"sigs":[["477.5","NOCOMMA"],["56","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-008:q3": {"k":"E","lp":"P2","expr":"200-140","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l4-008:q4": {"k":"G","lp":"P2","expr":"12.5*n+40","env":{"n":"6"},"budget":"100","order":["yes","no"],"opts":["PLUS",null]},
  "ex-1am-tatbiq-qaida-harfiya-l4-009:q1": {"k":"E","lp":"P2","expr":"70*n+500","env":{"n":"16"},"sigs":[["586","PLUS"],["7516","GLUED"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-009:q2": {"k":"E","lp":"P2","expr":"95*n","env":{"n":"16"},"sigs":[["9516","GLUED"],["111","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-009:q3": {"k":"C","lp":"P2","A":{"expr":"70*n+500","env":{"n":"16"}},"B":{"expr":"95*n","env":{"n":"16"}},"ask":"min","labels":{"A":"الحافلة الأولى","B":"الحافلة الثانية"},"order":["A","B"],"opts":["GLUED",null]},
  "ex-1am-tatbiq-qaida-harfiya-l4-009:q4": {"k":"E","lp":"P2","expr":"1620-1520","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l4-010:q1": {"k":"E","lp":"P2","expr":"(4*x+3)+(x+1)+20+(x+1)+45+(2*x+2)","env":{"x":"25"},"sigs":[["172","ONCE"],["178","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-010:q2": {"k":"E","lp":"P2","expr":"(4*x+3)+(x+1)+20+(x+1)+45+(2*x+2)","env":{"x":"40"},"sigs":[["232","ONCE"],["238","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l4-010:q3": {"k":"E","lp":"P2","expr":"272*300","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l4-010:q4": {"k":"G","lp":"P2","expr":"((4*x+3)+(x+1)+20+(x+1)+45+(2*x+2))*300","env":{"x":"25"},"budget":"80000","order":["yes","no"],"opts":["NOBR",null]},
  "ex-1am-tatbiq-qaida-harfiya-l5-001:q1": {"k":"E","lp":"P2","expr":"2*(a+b)","env":{"a":"13.5","b":"8.5"},"sigs":[["35.5","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-001:q2": {"k":"E","lp":"P2","expr":"44*320","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l5-001:q3": {"k":"E","lp":"P2","expr":"2*(a+b)","env":{"a":"15","b":"10"},"sigs":[["40","NOBR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-001:q4": {"k":"G","lp":"P2","expr":"2*(a+b)*320","env":{"a":"13.5","b":"8.5"},"budget":"14000","order":["yes","no"],"opts":["NOBR",null]},
  "ex-1am-tatbiq-qaida-harfiya-l5-002:q1": {"k":"C","lp":"P2","A":{"expr":"4*n+30","env":{"n":"20"}},"B":{"expr":"6*n","env":{"n":"20"}},"ask":"min","labels":{"A":"المكتبة الأولى","B":"المكتبة الثانية"},"order":["A","B"],"opts":[null,"PLUS"]},
  "ex-1am-tatbiq-qaida-harfiya-l5-002:q2": {"k":"E","lp":"P2","expr":"4*n+30","env":{"n":"5"},"sigs":[["39","PLUS"],["75","GLUED"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-002:q3": {"k":"E","lp":"P2","expr":"6*n","env":{"n":"5"},"sigs":[["65","GLUED"],["11","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-002:q4": {"k":"CL","lp":"P3","A":{"expr":"4*n+30","env":{"n":"5"}},"B":{"expr":"6*n","env":{"n":"5"}},"order":["yes","no"]},
  "ex-1am-tatbiq-qaida-harfiya-l5-003:q1": {"k":"E","lp":"P2","expr":"3*w+d","env":{"w":"8","d":"3"},"sigs":[["14","PLUS"],["17","SWAP:w,d"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-003:q2": {"k":"E","lp":"P2","expr":"3*w+d","env":{"w":"7","d":"5"},"sigs":[["15","PLUS"],["22","SWAP:w,d"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-003:q3": {"k":"C","lp":"P2","A":{"expr":"3*w+d","env":{"w":"8","d":"3"}},"B":{"expr":"3*w+d","env":{"w":"7","d":"5"}},"ask":"max","labels":{"A":"الصقور","B":"النجوم"},"order":["A","B"],"opts":[null,"PLUS"]},
  "ex-1am-tatbiq-qaida-harfiya-l5-003:q4": {"k":"X","lp":"P3","left":"3*w+d","right":"3*(w+d)","opts":[{"w":"2","d":"0"},{"w":"4","d":"0"},{"w":"3","d":"2"}]},
  "ex-1am-tatbiq-qaida-harfiya-l5-004:q1": {"k":"E","lp":"P2","expr":"50+30*k","env":{"k":"6.5"},"sigs":[["2000","NOCOMMA"],["520","LTR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-004:q2": {"k":"E","lp":"P2","expr":"300-245","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l5-004:q3": {"k":"E","lp":"P2","expr":"50+30*k","env":{"k":"12"},"sigs":[["92","PLUS"],["960","LTR"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-004:q4": {"k":"G","lp":"P2","expr":"50+30*k","env":{"k":"12"},"budget":"400","order":["yes","no"],"opts":["PLUS",null]},
  "ex-1am-tatbiq-qaida-harfiya-l5-005:q1": {"k":"C","lp":"P2","A":{"expr":"3*n+16","env":{"n":"10"}},"B":{"expr":"5*n","env":{"n":"10"}},"ask":"min","labels":{"A":"المتجر الأوّل","B":"المتجر الثاني"},"order":["A","B"],"opts":[null,"PLUS"]},
  "ex-1am-tatbiq-qaida-harfiya-l5-005:q2": {"k":"E","lp":"P2","expr":"3*n+16","env":{"n":"4"},"sigs":[["23","PLUS"],["50","GLUED"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-005:q3": {"k":"E","lp":"P2","expr":"5*n","env":{"n":"4"},"sigs":[["54","GLUED"],["9","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-005:q4": {"k":"CL","lp":"P3","A":{"expr":"3*n+16","env":{"n":"4"}},"B":{"expr":"5*n","env":{"n":"4"}},"order":["yes","no"]},
  "ex-1am-tatbiq-qaida-harfiya-l5-006:q1": {"k":"Sf","lp":"P2","target":"3*x+5","letter":"x","cell":"A2","opts":[{"text":"=3A2+5","kind":"NOSIGN"},{"text":"=3*A2+5","kind":null},{"text":"=3+A2+5","kind":"PLUS"}]},
  "ex-1am-tatbiq-qaida-harfiya-l5-006:q2": {"k":"E","lp":"P2","expr":"3*x+5","env":{"x":"9"},"sigs":[["44","GLUED"],["17","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-006:q3": {"k":"E","lp":"P3","expr":"2*x+5","env":{"x":"5"},"sigs":[]},
  "ex-1am-tatbiq-qaida-harfiya-l5-006:q4": {"k":"X","lp":"P3","left":"2*x+5","right":"3*x","opts":[{"x":"5"},{"x":"8"}]},
  "ex-1am-tatbiq-qaida-harfiya-l5-007:q1": {"k":"E","lp":"P3","expr":"a*b","env":{"a":"2","b":"2"},"sigs":[]},
  "ex-1am-tatbiq-qaida-harfiya-l5-007:q2": {"k":"E","lp":"P3","expr":"a*b","env":{"a":"1.5","b":"3"},"sigs":[["45","NOCOMMA"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-007:q3": {"k":"X","lp":"P3","left":"a+b","right":"a*b","opts":[{"a":"2","b":"2"},{"a":"1.5","b":"3"},{"a":"4","b":"5"}]},
  "ex-1am-tatbiq-qaida-harfiya-l5-007:q4": {"k":"XK","lp":"P3","left":"a+b","right":"a*b","vals":{"a":"4","b":"5"},"order":"مثالان مضادّان|مثال مضادّ واحد|عدّة أمثلة مضادّة"},
  "ex-1am-tatbiq-qaida-harfiya-l5-008:q1": {"k":"E","lp":"P2","expr":"12.5*n+40","env":{"n":"8"},"sigs":[["60.5","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-008:q2": {"k":"E","lp":"P2","expr":"200-140","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l5-008:q3": {"k":"C","lp":"P2","A":{"expr":"12.5*n+40","env":{"n":"8"}},"B":{"expr":"18*n","env":{"n":"8"}},"ask":"min","labels":{"A":"الفاتورة الأولى","B":"الفاتورة الثانية"},"order":["A","B"],"opts":[null,"PLUS"]},
  "ex-1am-tatbiq-qaida-harfiya-l5-008:q4": {"k":"CL","lp":"P3","A":{"expr":"12.5*n+40","env":{"n":"2"}},"B":{"expr":"18*n","env":{"n":"2"}},"order":["yes","no"]},
  "ex-1am-tatbiq-qaida-harfiya-l5-009:q1": {"k":"E","lp":"P2","expr":"1500+120*n","env":{"n":"20"},"sigs":[["32400","LTR"],["1640","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-009:q2": {"k":"E","lp":"P2","expr":"3900/20","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l5-009:q3": {"k":"C","lp":"P2","A":{"expr":"1500+120*n","env":{"n":"20"}},"B":{"expr":"180*n","env":{"n":"20"}},"ask":"min","labels":{"A":"الحافلة الأولى","B":"الحافلة الثانية"},"order":["A","B"],"opts":["GLUED",null]},
  "ex-1am-tatbiq-qaida-harfiya-l5-009:q4": {"k":"CL","lp":"P3","A":{"expr":"180*n","env":{"n":"30"}},"B":{"expr":"1500+120*n","env":{"n":"30"}},"order":["yes","no"]},
  "ex-1am-tatbiq-qaida-harfiya-l5-010:q1": {"k":"E","lp":"P2","expr":"150*80/100","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l5-010:q2": {"k":"E","lp":"P2","expr":"60*4/15","env":{},"sigs":[],"cnt":false},
  "ex-1am-tatbiq-qaida-harfiya-l5-010:q3": {"k":"E","lp":"P2","expr":"(2*x+4)+(x+3)+25+(x+3)+50+(3*x+1)","env":{"x":"30"},"sigs":[["146","ONCE"],["211","PLUS"]]},
  "ex-1am-tatbiq-qaida-harfiya-l5-010:q4": {"k":"G","lp":"P2","expr":"(2*x+4)+(x+3)+25+(x+3)+50+(3*x+1)","env":{"x":"30"},"budget":"290","order":["yes","no"],"opts":["PLUS",null]},
};

const holds = (l, r, vals) => eq(read(l, vals, null), read(r, vals, null));
const firstFail = (s) => { let n = s.from; while (holds(s.left, s.right, { [s.v]: String(n) })) { n++; if (n > 5000) throw new Error('aucun contre-exemple'); } return n; };
const pickOf = (s, kind) => {
  const a = read(s.A.expr, s.A.env, kind), b = read(s.B.expr, s.B.env, kind);
  if (eq(a, b)) return 'T';
  return (s.ask === 'min' ? lt(a, b) : lt(b, a)) ? 'A' : 'B';
};
const enough = (s, kind) => le(read(s.expr, s.env, kind), lit(s.budget));
const cellLetter = (f, l) => f.replace(/^=/, '').replace(/[A-Z]\d+/g, l);

/** l'indice de l'UNIQUE bonne option d'un QCM (recalculé depuis le spec) */
const choiceIndex = (id, s) => {
  let hits = [];
  if (s.k === 'M') { const t = read(s.expr, s.env, null); hits = s.opts.map((k, i) => (eq(read(s.expr, s.env, k), t) ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'T') return eq(read(s.expr, s.env, null), lit(s.shown)) ? 0 : 1;
  else if (s.k === 'W') {
    const letters = lettersOf(s.target); const envs = s.env ? [s.env] : TEST_ENVS(letters);
    hits = s.opts.map((o, i) => (envs.every((e) => eq(evalTokens(written(o.text), envVal(e)), read(s.target, e, null))) ? i : -1)).filter((i) => i >= 0);
  } else if (s.k === 'Sf') {
    const e = { [s.letter]: '3' };
    hits = s.opts.map((o, i) => { if (/\d[A-Z]\d/.test(o.text)) return -1; return eq(evalTokens(tokens(cellLetter(o.text, s.letter)), envVal(e)), read(s.target, e, null)) ? i : -1; }).filter((i) => i >= 0);
  } else if (s.k === 'X') hits = s.opts.map((v, i) => (!holds(s.left, s.right, v) ? i : -1)).filter((i) => i >= 0);
  else if (s.k === 'XT') { const texts = s.order.split(',').map((x) => (x === 'YES' ? YES : NO)); hits = holds(s.left, s.right, s.vals) ? texts.map((t, i) => (t === NO ? i : -1)).filter((i) => i >= 0) : []; }
  else if (s.k === 'XN') { const texts = s.order.split(',').map((x) => (x === 'YES' ? YES : NO)); hits = texts.map((t, i) => (!holds(s.left, s.right, s.vals) && t === YES ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'XK') { const texts = s.order.split('|'); hits = texts.map((t, i) => (!holds(s.left, s.right, s.vals) && t === ONE ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'C') { const g = pickOf(s, null); hits = s.order.map((p, i) => (p === g ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'G') { const g = enough(s, null); hits = s.order.map((p, i) => ((p === 'yes') === g ? i : -1)).filter((i) => i >= 0); }
  else if (s.k === 'CL') { const a = read(s.A.expr, s.A.env, null), b = read(s.B.expr, s.B.env, null); hits = s.order.map((p, i) => (lt(b, a) && p === 'no' ? i : -1)).filter((i) => i >= 0); }
  if (hits.length !== 1) throw new Error(`${id} : ${hits.length} options justes`);
  return hits[0];
};
const isChoice = (s) => !['E', 'F'].includes(s.k);
const valueOf = (s) => (s.k === 'F' ? Q(BigInt(firstFail(s))) : read(s.expr, s.env, null));
const answerOf = (id, s) => (isChoice(s) ? C('ABCDEF'[choiceIndex(id, s)]) : R(key(valueOf(s))));

export const ORACLE = Object.fromEntries(Object.entries(SPECS).map(([k, s]) => [k, answerOf(k, s)]));

/** relit les fichiers du banc : clé, QCM, rendu des options, signatures, الكفاءة, étapes hors leçon, valeurs relues dans les énoncés */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  for (const [id, s] of Object.entries(SPECS)) {
    const q = byKey.get(id);
    if (!q) { errs.push(`${id} : question absente`); continue; }
    const lp = q.learningPoints?.[0]?.code;
    if (lp !== LPC(s.lp)) errs.push(`${id} : الكفاءة ${lp} ≠ ${LPC(s.lp)}`);
    if ((q.counted === false) !== (s.cnt === false)) errs.push(`${id} : counted ${q.counted} ≠ ${s.cnt}`);
    try {
      if (!isChoice(s)) {
        if (q.answerType !== 'rational') { errs.push(`${id} : devrait être rational`); continue; }
        const K = valueOf(s);
        if (!eq(lit(String(q.expectedAnswer)), K)) errs.push(`${id} : clé ${q.expectedAnswer} ≠ ${key(K)}`);
        if (key(lit(String(q.expectedAnswer))) !== String(q.expectedAnswer)) errs.push(`${id} : clé ${q.expectedAnswer} pas sous sa forme canonique ${key(K)}`);
        const sigs = q.misconceptionSignatures ?? []; const want = s.sigs ?? [];
        if (sigs.length !== want.length) errs.push(`${id} : ${sigs.length} signatures, ${want.length} retapées`);
        for (const sg of sigs) {
          if (eq(lit(String(sg.value)), K)) errs.push(`${id} : signature ${sg.id} = la bonne réponse`);
          const w = want.find(([v, kd]) => mid(kd) === sg.id && eq(lit(v), lit(String(sg.value))));
          if (!w) { errs.push(`${id} : signature ${sg.id}=${sg.value} non retapée`); continue; }
          if (s.k === 'E') { const rv = read(s.expr, s.env, w[1]); if (!eq(rv, lit(String(sg.value)))) errs.push(`${id} : lecture ${w[1]} donne ${key(rv)}, écrit ${sg.value}`); }
          if (s.k === 'F' && holds(s.left, s.right, { [s.v]: String(sg.value) }) !== true) errs.push(`${id} : ${sg.value} ne vérifie pas la règle (ONEOK)`);
        }
        if (s.k === 'E') {
          for (const l of Object.keys(s.env)) if (!q.statement.includes(`${l}=${s.env[l].replace('.', '{,}')}`)) errs.push(`${id} : « ${l}=${s.env[l]} » absent de l'énoncé`);
        if (s.cnt === false) { const flat = q.statement.replace(/\\[, ]/g, '').replace(/\s/g, ''); for (const t of tokens(s.expr).filter(isNum)) if (!flat.includes(t.replace('.', '{,}'))) errs.push(`${id} : le nombre ${t} de l'étape hors leçon est absent de l'énoncé`); }
        }
        if (s.k === 'F' && !q.statement.includes(`$${s.from - 1}$`)) errs.push(`${id} : borne « أكبر من ${s.from - 1} » absente`);
        continue;
      }
      if (q.answerType !== 'choice') { errs.push(`${id} : devrait être choice`); continue; }
      const good = choiceIndex(id, s);
      let expect; // [{content, misc|null}]
      if (s.k === 'M') {
        const t = read(s.expr, s.env, null);
        expect = s.opts.map((k) => { const v = read(s.expr, s.env, k); if (k && eq(v, t)) errs.push(`${id} : lecture ${k} = la bonne valeur`); return { content: `$${num$(v)}$`, misc: k ? mid(k) : null }; });
        for (const l of Object.keys(s.env)) if (!q.statement.includes(`${l}=${s.env[l].replace('.', '{,}')}`)) errs.push(`${id} : « ${l}=${s.env[l]} » absent de l'énoncé`);
        if (!q.statement.includes(texOf(s.expr)) && !q.statement.includes(s.name ?? '§')) { /* la règle peut être donnée dans l'énoncé de l'exercice */ }
      } else if (s.k === 'T') {
        const t = read(s.expr, s.env, null); const shown = lit(s.shown);
        if (!q.statement.includes(`$${num$(shown)}$`)) errs.push(`${id} : valeur affichée ${s.shown} absente de l'énoncé`);
        if (s.kind) { const rv = read(s.expr, s.env, s.kind); if (!eq(rv, shown) || eq(rv, t)) errs.push(`${id} : lecture ${s.kind} ≠ valeur affichée`); }
        else if (!eq(t, shown)) errs.push(`${id} : valeur affichée fausse sans lecture nommée`);
        expect = s.kind ? [{ content: 'صحيح', misc: mid(s.kind) }, { content: 'خطأ', misc: null }] : [{ content: 'صحيح', misc: null }, { content: 'خطأ', misc: mid('REJECT') }];
        for (const l of Object.keys(s.env)) if (!q.statement.includes(`${l}=${s.env[l].replace('.', '{,}')}`)) errs.push(`${id} : « ${l}=${s.env[l]} » absent de l'énoncé`);
      } else if (s.k === 'W') {
        const letters = lettersOf(s.target); const envs = s.env ? [s.env] : TEST_ENVS(letters);
        expect = s.opts.map((o) => {
          if (o.kind) {
            const same = envs.filter((e) => eq(evalTokens(written(o.text), envVal(e)), read(s.target, e, null))).length;
            const readSame = envs.filter((e) => eq(evalTokens(written(o.text), envVal(e)), read(s.target, e, o.kind))).length;
            if (same === envs.length) errs.push(`${id} : option « ${o.text} » équivaut à la cible`);
            if (readSame !== envs.length) errs.push(`${id} : option « ${o.text} » n'est pas la lecture ${o.kind}`);
          }
          return { content: `$${wTex(o.text)}$`, misc: o.kind ? mid(o.kind) : null };
        });
      } else if (s.k === 'Sf') {
        const e = { [s.letter]: '3' };
        expect = s.opts.map((o) => {
          if (o.kind === 'NOSIGN') { if (!/\d[A-Z]\d/.test(o.text)) errs.push(`${id} : « ${o.text} » a un ×`); }
          else if (o.kind && !eq(evalTokens(tokens(cellLetter(o.text, s.letter)), envVal(e)), read(s.target, e, o.kind))) errs.push(`${id} : « ${o.text} » n'est pas la lecture ${o.kind}`);
          return { content: `$${o.text}$`, misc: o.kind ? mid(o.kind) : null };
        });
        const rightText = '=' + s.target.replace(new RegExp(s.letter, 'g'), s.cell);
        if (!s.opts.some((o) => !o.kind && o.text === rightText)) errs.push(`${id} : la formule juste n'est pas ${rightText}`);
      } else if (s.k === 'X') {
        expect = s.opts.map((v) => ({ content: optTex(v), misc: holds(s.left, s.right, v) ? mid('ONEOK') : null }));
      } else if (s.k === 'XT' || s.k === 'XN') {
        const wrongMisc = s.k === 'XT' ? mid('ONEOK') : mid('MANYNEED');
        expect = s.order.split(',').map((x) => (x === 'YES' ? { content: YES, misc: s.k === 'XT' ? wrongMisc : null } : { content: NO, misc: s.k === 'XT' ? null : wrongMisc }));
        for (const l of Object.keys(s.vals)) if (!q.statement.includes(`${l}=${s.vals[l].replace('.', '{,}')}`)) errs.push(`${id} : « ${l}=${s.vals[l]} » absent de l'énoncé`);
      } else if (s.k === 'XK') {
        expect = s.order.split('|').map((t) => ({ content: t, misc: t === ONE ? null : mid('MANYNEED') }));
      } else if (s.k === 'C') {
        const g = pickOf(s, null);
        expect = s.order.map((p, i) => { if (p !== g) { const rp = pickOf(s, s.opts[i]); if (rp !== p) errs.push(`${id} : la lecture ${s.opts[i]} ne choisit pas ${p}`); } return { content: s.labels[p], misc: p === g ? null : mid(s.opts[i]) }; });
      } else if (s.k === 'G') {
        const g = enough(s, null);
        expect = s.order.map((p, i) => { const yes = p === 'yes'; if (yes !== g && enough(s, s.opts[i]) !== yes) errs.push(`${id} : la lecture ${s.opts[i]} ne renverse pas la décision`); return { content: yes ? 'نعم' : 'لا', misc: yes === g ? null : mid(s.opts[i]) }; });
      } else if (s.k === 'CL') {
        expect = s.order.map((p) => ({ content: p === 'yes' ? CLYES : CLNO, misc: p === 'no' ? null : mid('ONEOK') }));
      }
      if (q.choices.length !== expect.length) errs.push(`${id} : ${q.choices.length} options, ${expect.length} retapées`);
      q.choices.forEach((c, i) => {
        if (c.isCorrect !== (i === good)) errs.push(`${id} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${i === good}`);
        const e = expect[i]; if (!e) return;
        if (c.content !== e.content) errs.push(`${id} : option ${c.id} « ${c.content} » ≠ « ${e.content} »`);
        if ((c.misconceptionId ?? null) !== e.misc) errs.push(`${id} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${e.misc}`);
        if (c.isCorrect && c.misconceptionId) errs.push(`${id} : la bonne option porte une misconception`);
        if (!c.isCorrect && !c.misconceptionId) errs.push(`${id} : option fausse ${c.id} sans misconception`);
      });
    } catch (e) { errs.push(`${id} : ${e.message}`); }
  }
  for (const b of bank) if (b.q.answerType !== 'selfCheck' && !(b.key in SPECS)) errs.push(`${b.key} : sans vérification`);
  return errs;
}
