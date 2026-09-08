/**
 * Noyau numérique de la leçon « Opérations » (5e).
 *
 * Tout ce qui est vrai mathématiquement vit ici et nulle part ailleurs : les
 * modules affichent, ce fichier calcule. Une affirmation de la leçon devient
 * ainsi vérifiable par un test plutôt que par relecture — c'est ce qui a
 * attrapé six erreurs de données dans les leçons précédentes.
 *
 * PÉRIMÈTRE 5e (objet officiel `operations`, BO n°10 du 5 mars 2026) : calcul
 * mental et en ligne sur les décimaux, division par un décimal, priorités
 * opératoires avec parenthèses, enchaînements, multiples et diviseurs.
 * HORS PÉRIMÈTRE, et jamais produit par ce fichier : les nombres relatifs dans
 * les enchaînements, et les fractions dans les priorités opératoires.
 */

/* ── Arithmétique décimale exacte ──────────────────────────────────────── */

/**
 * Nombre de décimales d'un nombre écrit en base 10.
 * Sert à faire tous les calculs sur des ENTIERS : 0,1 + 0,2 vaut 0.30000000000000004
 * en flottant, ce qu'un élève de 5e ne doit jamais lire à l'écran.
 */
export const decimals = (x) => {
  const s = String(x);
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
};

/** Puissance de dix qui rend `x` entier. */
const scaleOf = (x) => 10 ** decimals(x);

/** Somme exacte de deux décimaux. */
export const add = (a, b) => {
  const s = Math.max(scaleOf(a), scaleOf(b));
  return (Math.round(a * s) + Math.round(b * s)) / s;
};

/** Différence exacte de deux décimaux. */
export const sub = (a, b) => {
  const s = Math.max(scaleOf(a), scaleOf(b));
  return (Math.round(a * s) - Math.round(b * s)) / s;
};

/** Produit exact de deux décimaux. */
export const mul = (a, b) => {
  const sa = scaleOf(a);
  const sb = scaleOf(b);
  return (Math.round(a * sa) * Math.round(b * sb)) / (sa * sb);
};

/**
 * Quotient exact de deux décimaux.
 *
 * C'est l'implémentation de l'idée centrale du module « diviser par un
 * décimal » : on multiplie le dividende ET le diviseur par la même puissance
 * de dix, et le quotient ne change pas. Le code fait donc exactement ce que
 * la leçon fait découvrir, au lieu de déléguer à une division flottante.
 */
export const div = (a, b) => {
  if (b === 0) return NaN;
  const s = Math.max(scaleOf(a), scaleOf(b));
  return Math.round(a * s) / Math.round(b * s);
};

/** Écriture française d'un nombre : virgule décimale, pas de bruit flottant. */
export const fr = (x) => {
  if (!Number.isFinite(x)) return '—';
  // 12 chiffres significatifs : au-delà, c'est du bruit de représentation.
  const clean = Number(x.toPrecision(12));
  return String(clean).replace('.', ',');
};

/* ── Le facteur d'échelle d'une division ───────────────────────────────── */

/**
 * Facteur par lequel multiplier dividende et diviseur pour que le DIVISEUR
 * devienne entier. C'est le geste du module 5 : 7,2 ÷ 0,4 devient 72 ÷ 4.
 */
export const entierFactor = (diviseur) => 10 ** decimals(diviseur);

/** La division équivalente à diviseur entier, sous forme lisible. */
export const equivalentDivision = (a, b) => {
  const f = entierFactor(b);
  return { a: mul(a, f), b: mul(b, f), facteur: f };
};

/* ── Structure d'une expression : le cœur des priorités ────────────────── */

/**
 * Une expression est une LISTE PLATE de termes et d'opérateurs, plus une
 * éventuelle parenthèse posée par l'élève. On ne construit pas un arbre
 * générique : la 5e ne manipule qu'un seul niveau de parenthèses, et une
 * structure minimale se teste entièrement.
 *
 * Forme : { nums: [n0, n1, …], ops: ['+', '×', …] } avec ops.length = nums.length − 1.
 * Une parenthèse est un intervalle d'indices de termes : { from, to }, inclus.
 */

export const OPS = ['+', '−', '×', '÷'];

/** Priorité conventionnelle : × et ÷ passent avant + et −. */
export const priority = (op) => (op === '×' || op === '÷' ? 2 : 1);

const applyOp = (a, op, b) => {
  if (op === '+') return add(a, b);
  if (op === '−') return sub(a, b);
  if (op === '×') return mul(a, b);
  if (op === '÷') return div(a, b);
  return NaN;
};

/**
 * Évalue une suite plate en respectant les priorités : une passe pour × et ÷
 * (de gauche à droite), puis une passe pour + et −. C'est littéralement la
 * règle que le module 2 fait découvrir, écrite une fois.
 */
export const evalFlat = ({ nums, ops }) => {
  if (nums.length === 0) return NaN;
  if (ops.length !== nums.length - 1) return NaN;

  // Passe 1 — les produits et quotients se contractent en un seul terme.
  const n = [nums[0]];
  const o = [];
  for (let i = 0; i < ops.length; i += 1) {
    if (priority(ops[i]) === 2) {
      n[n.length - 1] = applyOp(n[n.length - 1], ops[i], nums[i + 1]);
    } else {
      o.push(ops[i]);
      n.push(nums[i + 1]);
    }
  }

  // Passe 2 — les sommes et différences, de gauche à droite.
  let acc = n[0];
  for (let i = 0; i < o.length; i += 1) acc = applyOp(acc, o[i], n[i + 1]);
  return acc;
};

/**
 * Évalue une expression avec UNE parenthèse posée sur l'intervalle de termes
 * [from, to]. Le contenu de la parenthèse est évalué d'abord — en respectant
 * lui aussi les priorités — puis remplace l'intervalle par sa valeur.
 *
 * `paren` à null : aucune parenthèse, l'évaluation est celle des priorités.
 */
export const evalExpr = ({ nums, ops }, paren = null) => {
  if (!paren) return evalFlat({ nums, ops });
  const { from, to } = paren;
  if (!(from >= 0 && to < nums.length && to > from)) return evalFlat({ nums, ops });

  const inner = evalFlat({ nums: nums.slice(from, to + 1), ops: ops.slice(from, to) });
  const outNums = [...nums.slice(0, from), inner, ...nums.slice(to + 1)];
  const outOps = [...ops.slice(0, from), ...ops.slice(to)];
  return evalFlat({ nums: outNums, ops: outOps });
};

/**
 * Lecture NAÏVE, de gauche à droite, sans priorité — l'erreur que la leçon
 * vise. On ne l'expose pas comme une méthode : on l'expose pour pouvoir la
 * MONTRER à côté du bon résultat, et prouver qu'elles diffèrent.
 */
export const evalGaucheADroite = ({ nums, ops }) => {
  let acc = nums[0];
  for (let i = 0; i < ops.length; i += 1) acc = applyOp(acc, ops[i], nums[i + 1]);
  return acc;
};

/** Écriture d'une expression, avec la parenthèse posée s'il y en a une. */
export const writeExpr = ({ nums, ops }, paren = null) => {
  const parts = [];
  for (let i = 0; i < nums.length; i += 1) {
    if (paren && i === paren.from) parts.push('(');
    parts.push(fr(nums[i]));
    if (paren && i === paren.to) parts.push(')');
    if (i < ops.length) parts.push(ops[i]);
  }
  return parts.join(' ').replace(/\(\s/g, '(').replace(/\s\)/g, ')');
};

/**
 * Toutes les parenthèses posables sur une expression : chaque intervalle d'au
 * moins deux termes. Sert au balayage exhaustif des tests (et donc à garantir
 * que la manipulation n'a aucun état invalide).
 */
export const allParens = ({ nums }) => {
  const out = [];
  for (let from = 0; from < nums.length - 1; from += 1) {
    for (let to = from + 1; to < nums.length; to += 1) out.push({ from, to });
  }
  return out;
};

/**
 * L'ordre dans lequel les opérations d'une expression sont EFFECTUÉES.
 * Rend visible ce que le module 3 fait constater étape par étape : à chaque
 * fois, l'opération choisie est celle de plus forte priorité la plus à gauche.
 * Retourne la liste des étapes : { op, a, b, res, expr } où `expr` est
 * l'expression telle qu'elle se lit APRÈS l'étape.
 */
export const traceEval = ({ nums, ops }, paren = null) => {
  const steps = [];

  const runFlat = (ns, os, offset = 0) => {
    let n = [...ns];
    let o = [...os];
    for (const wanted of [2, 1]) {
      let i = 0;
      while (i < o.length) {
        if (priority(o[i]) === wanted) {
          const res = applyOp(n[i], o[i], n[i + 1]);
          steps.push({ op: o[i], a: n[i], b: n[i + 1], res, at: i + offset });
          n = [...n.slice(0, i), res, ...n.slice(i + 2)];
          o = [...o.slice(0, i), ...o.slice(i + 1)];
        } else {
          i += 1;
        }
      }
    }
    return n[0];
  };

  if (paren && paren.to > paren.from) {
    const { from, to } = paren;
    const inner = runFlat(nums.slice(from, to + 1), ops.slice(from, to), from);
    const outNums = [...nums.slice(0, from), inner, ...nums.slice(to + 1)];
    const outOps = [...ops.slice(0, from), ...ops.slice(to)];
    runFlat(outNums, outOps);
  } else {
    runFlat(nums, ops);
  }
  return steps;
};

/* ── Multiples et diviseurs ────────────────────────────────────────────── */

/** `d` divise `n` : la division tombe juste. */
export const divise = (d, n) => d !== 0 && Number.isInteger(n / d);

/** Tous les diviseurs de `n`, dans l'ordre croissant. */
export const diviseurs = (n) => {
  const out = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
};

/**
 * Les décompositions de `n` en un produit de deux facteurs — autrement dit
 * tous les rectangles d'aire `n` à côtés entiers. C'est la manipulation du
 * module 6 : un diviseur, c'est un côté possible.
 */
export const rectangles = (n) => diviseurs(n).map((d) => ({ largeur: d, hauteur: n / d }));

/** Les `k` premiers multiples de `n`, à partir de n × 1. */
export const multiples = (n, k) => Array.from({ length: k }, (_, i) => n * (i + 1));

/**
 * Critères de divisibilité au programme de 5e. Chacun porte SA raison, pour
 * que le feedback explique au lieu de constater.
 */
export const CRITERES = [
  { d: 2, label: 'par 2', regle: 'le chiffre des unités est 0, 2, 4, 6 ou 8', test: (n) => n % 2 === 0 },
  { d: 3, label: 'par 3', regle: 'la somme des chiffres est un multiple de 3', test: (n) => n % 3 === 0 },
  { d: 5, label: 'par 5', regle: 'le chiffre des unités est 0 ou 5', test: (n) => n % 5 === 0 },
  { d: 9, label: 'par 9', regle: 'la somme des chiffres est un multiple de 9', test: (n) => n % 9 === 0 },
  { d: 10, label: 'par 10', regle: 'le chiffre des unités est 0', test: (n) => n % 10 === 0 },
];

/** Somme des chiffres — l'outil des critères de 3 et de 9. */
export const sommeChiffres = (n) =>
  String(Math.abs(n)).split('').reduce((s, c) => s + Number(c), 0);

/* ── Calcul malin : décomposer pour calculer en ligne ──────────────────── */

/**
 * Découpe `b` en deux morceaux et montre que a × b = a × b1 + a × b2.
 * C'est le « rectangle qu'on coupe en deux » du module 4 — la propriété est
 * NUMÉRIQUE, jamais écrite avec des lettres (le calcul littéral est un autre
 * objet officiel, et la forme algébrique est un objet de 4e).
 */
export const decoupeProduit = (a, b, b1) => {
  const b2 = sub(b, b1);
  return { a, b, b1, b2, gauche: mul(a, b), droite: add(mul(a, b1), mul(a, b2)) };
};

/** Vérifie qu'un découpage donne bien le même produit — l'invariant du module. */
export const decoupeValide = (a, b, b1) => {
  const d = decoupeProduit(a, b, b1);
  return d.gauche === d.droite;
};

/* ── Ordre de grandeur et contrôle de vraisemblance ────────────────────── */

/**
 * Arrondit à un seul chiffre significatif : l'outil du contrôle mental.
 * 3,84 → 4 ; 187 → 200 ; 0,062 → 0,06.
 */
export const ordreDeGrandeur = (x) => {
  if (x === 0) return 0;
  const e = Math.floor(Math.log10(Math.abs(x)));
  const p = 10 ** e;
  return Number((Math.round(x / p) * p).toPrecision(12));
};

/**
 * Un résultat est-il vraisemblable ? On compare à l'estimation faite sur les
 * ordres de grandeur : un résultat qui en est éloigné d'un facteur 2 signale
 * presque toujours une virgule ou un zéro de trop.
 */
export const vraisemblable = (estime, propose) => {
  if (estime === 0) return propose === 0;
  const r = propose / estime;
  return r >= 0.5 && r <= 2;
};

/* ── Données des modules — vérifiées par les tests ─────────────────────── */

/** Module 1 : le ticket des deux caisses. Le calcul qui se lit de deux façons. */
export const TICKET = { nums: [2, 3, 4], ops: ['+', '×'] };

/** Module 7 : la commande du traiteur. Quantités et prix unitaires. */
export const TRAITEUR = [
  { article: 'Parts de quiche', quantite: 12, prixUnitaire: 2.5 },
  { article: 'Salades', quantite: 8, prixUnitaire: 3.2 },
  { article: 'Bouteilles de jus', quantite: 6, prixUnitaire: 1.75 },
];

/** Total d'une commande : une somme de produits — la structure du module 2. */
export const totalCommande = (lignes = TRAITEUR) =>
  lignes.reduce((s, l) => add(s, mul(l.quantite, l.prixUnitaire)), 0);

/**
 * Lecture d'une saisie élève représentant un DÉCIMAL positif.
 * Le `parseFr` du kit est entier seulement ; cette leçon vit sur les décimaux,
 * et l'élève écrit avec une virgule. On accepte la virgule et le point, et on
 * tolère les espaces (y compris l'espace fine insécable des milliers).
 */
export const parseDecimalFr = (str) => {
  if (typeof str === 'number') return str;
  if (typeof str !== 'string') return NaN;
  const cleaned = str.replace(/[\s  ]/g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return NaN;
  return Number(cleaned);
};

/* ── La machine à états de la pose de parenthèse ───────────────────────── */

/**
 * L'état d'ExpressionLab, et la seule fonction qui le fait évoluer.
 *
 * POURQUOI CE FICHIER, et pas le composant. La pose de parenthèse est une
 * transformation d'état pur : (état, geste) → état. La mettre ici la rend
 * testable au balayage exhaustif, exactement comme `evalExpr` — le composant
 * n'a plus qu'à peindre l'état qu'on lui donne.
 *
 * L'ÉTAT A DEUX CHAMPS SÉPARÉS, et c'est tout le correctif :
 *
 *   anchor : number | null   le premier terme touché d'une pose EN COURS
 *   paren  : {from,to} | null le bloc COMMIS, celui que l'élève a obtenu
 *
 * Le bug corrigé venait de les avoir confondus dans un seul champ
 * `{from, to:null}` : un troisième tap écrasait alors le bloc commis par une
 * ouverture pendante, et la découverte de l'élève disparaissait sans qu'il
 * l'ait demandé. Séparés, un tap qui démarre une nouvelle sélection ne touche
 * PAS `paren` — le bloc reste affiché, et n'est remplacé qu'au moment où la
 * nouvelle sélection est réellement fermée. L'élève ne perd jamais un
 * résultat sans en obtenir un autre à la place.
 *
 * TRANSITIONS (`labReduce`) :
 *
 *   IDLE            —tap i→        SELECTING(anchor=i)         paren inchangé
 *   SELECTING(i)    —tap i→        IDLE                        paren inchangé
 *   SELECTING(i)    —tap j≠i→      COMMITTED(paren={i..j})     nouveau bloc
 *   COMMITTED(p)    —tap i∈p→      IDLE, paren=null            on retire le bloc
 *   COMMITTED(p)    —tap i∉p→      SELECTING(i), paren=p       le bloc RESTE
 *   n'importe quel  —reset→        IDLE, paren=null
 *
 * La règle « tap dans le bloc = l'enlever » garde le geste réversible sans
 * bouton ; « Recommencer » existe quand même, parce qu'un geste de secours
 * doit être VISIBLE (§7 de la commande, §17bis « discoverable »).
 */

/** L'état initial du laboratoire. `paren` peut être pré-posée par le module. */
export const labInit = (paren = null) => ({ anchor: null, paren });

/** Les trois phases lisibles de l'état — ce que l'interface doit raconter. */
export const labPhase = ({ anchor, paren }) => {
  if (anchor !== null) return 'selecting';
  if (paren) return 'committed';
  return 'idle';
};

/**
 * Le seul réducteur de la manipulation.
 * @param {{anchor:number|null, paren:{from:number,to:number}|null}} state
 * @param {{type:'tap', index:number}|{type:'reset'}} action
 */
export const labReduce = (state, action) => {
  if (action.type === 'reset') return { anchor: null, paren: null };
  if (action.type !== 'tap') return state;

  const i = action.index;
  const { anchor, paren } = state;

  // Une sélection est en cours : ce tap la ferme, ou l'annule.
  if (anchor !== null) {
    if (i === anchor) return { anchor: null, paren };            // annule, garde le bloc
    return {
      anchor: null,
      paren: { from: Math.min(anchor, i), to: Math.max(anchor, i) },
    };
  }

  // Un bloc est commis, et l'élève touche l'un de ses termes : il le retire.
  if (paren && i >= paren.from && i <= paren.to) return { anchor: null, paren: null };

  // Sinon : on démarre une sélection SANS détruire le bloc commis.
  return { anchor: i, paren };
};

/** La consigne à afficher — une seule à la fois, dérivée de l'état (§8). */
export const labHint = (state, { nums }) => {
  const phase = labPhase(state);
  if (phase === 'selecting') {
    const n = fr(nums[state.anchor]);
    return `Bien. Touche maintenant le nombre où ton bloc s’arrête — le ${n} en fait déjà partie.`;
  }
  if (phase === 'committed') {
    return 'Touche un nombre du bloc pour l’ouvrir, ou un nombre en dehors pour essayer un autre regroupement.';
  }
  return 'Touche un nombre pour commencer ton bloc.';
};

/**
 * La CASCADE de réécriture : le calcul, ligne à ligne, jusqu'au total.
 *
 * `traceEval` dit quelles opérations sont effectuées et dans quel ordre ;
 * cette fonction en fait ce que l'élève doit LIRE — l'expression entière
 * réécrite après chaque étape :
 *
 *     (2 + 3) × 4   →   5 × 4   →   20
 *
 * C'est l'exigence pédagogique centrale de la manipulation : montrer que
 * l'élève n'a changé ni les nombres ni les signes, seulement le morceau qui se
 * calcule en premier. Un total seul (« 20 ») ne le montrerait pas.
 *
 * La parenthèse se referme d'elle-même dès que son contenu est réduit à un
 * seul terme : on n'écrit jamais « (5) », qui n'apprend rien.
 */
export const rewriteSteps = (expr, paren = null) => {
  const lignes = [writeExpr(expr, paren)];
  let n = [...expr.nums];
  let o = [...expr.ops];
  let p = paren;

  for (const etape of traceEval(expr, paren)) {
    n = [...n.slice(0, etape.at), etape.res, ...n.slice(etape.at + 2)];
    o = [...o.slice(0, etape.at), ...o.slice(etape.at + 1)];
    // Une parenthèse dont le contenu ne fait plus qu'un terme n'a plus d'objet.
    if (p) p = p.to - 1 > p.from ? { from: p.from, to: p.to - 1 } : null;
    lignes.push(writeExpr({ nums: n, ops: o }, p));
  }
  // Deux lignes identiques d'affilée n'apprennent rien : on n'en garde qu'une.
  return lignes.filter((l, i) => i === 0 || l !== lignes[i - 1]);
};
