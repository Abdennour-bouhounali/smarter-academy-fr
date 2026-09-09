/**
 * Noyau de calcul de la leçon « Probabilités » (5e) — PUR, sans React.
 *
 * Il repose sur `common/stats/randomUtils` (makeRng, randomInt) : le hasard
 * est REPRODUCTIBLE à graine égale, ce qui rend chaque simulation rejouable
 * — par l'élève qui revient, par les tests, par l'e2e. Chaque tirage est
 * réellement calculé ; rien n'est préenregistré.
 *
 * L'ORDRE DE LA LEÇON, qui est aussi celui de ce fichier : une expérience,
 * ses issues, un événement décrit par les issues qui le réalisent, la
 * question de l'équiprobabilité, et seulement alors le quotient.
 *
 * PÉRIMÈTRE 5e (objet officiel `5e_probabilites`) : une seule épreuve, des
 * issues équiprobables, une probabilité comme fraction entre 0 et 1. Sont
 * HORS PROGRAMME et gardés en dur par `assertScope5e` : les probabilités
 * conditionnelles, les arbres à plusieurs niveaux, l'événement contraire
 * formalisé (4e), la loi des grands nombres énoncée (4e).
 */
import { makeRng, randomInt } from '../../../../../common/stats';

/* ── Périmètre exécutable ────────────────────────────────────────── */

const HORS_PROGRAMME_5E = [
  'conditionnelle', 'arbre-multi-niveaux', 'evenement-contraire',
  'loi-des-grands-nombres', 'independance', 'variable-aleatoire',
];

/**
 * Garde de périmètre : une notion de 4e ou de lycée demandée ici est une
 * erreur d'auteur, et elle échoue bruyamment plutôt que d'être enseignée.
 */
export function assertScope5e(notion) {
  if (HORS_PROGRAMME_5E.includes(notion)) {
    throw new Error(
      `[probabilites-5e] « ${notion} » est hors du programme de 5e : ` +
      `l'objet officiel 5e_probabilites s'arrête à l'équiprobabilité sur une épreuve.`,
    );
  }
  return notion;
}

/* ── Les expériences aléatoires ──────────────────────────────────── */

/**
 * Une expérience = un dispositif, la liste de ses ISSUES, et le fait qu'elles
 * soient équiprobables ou non. Les issues sont des objets pour porter leur
 * étiquette d'affichage sans que le module ait à la recalculer.
 *
 * L'urne DÉSÉQUILIBRÉE est là exprès : sans un contre-exemple, « toutes les
 * issues ont la même chance » se mémorise comme une vérité universelle au
 * lieu d'être une CONDITION qu'on vérifie.
 */
export const EXPERIENCES = {
  piece: {
    id: 'piece',
    nom: 'Lancer une pièce',
    emoji: '🪙',
    issues: [
      { id: 'pile', label: 'Pile', emoji: '🪙' },
      { id: 'face', label: 'Face', emoji: '👑' },
    ],
    equiprobable: true,
    // Pourquoi : la pièce est symétrique, rien ne distingue les deux côtés.
    raison: 'La pièce est symétrique : rien ne favorise Pile plutôt que Face.',
  },
  de: {
    id: 'de',
    nom: 'Lancer un dé à 6 faces',
    emoji: '🎲',
    issues: [1, 2, 3, 4, 5, 6].map((n) => ({ id: String(n), label: String(n), valeur: n })),
    equiprobable: true,
    raison: 'Le dé est équilibré : ses six faces sont identiques, sauf le nombre écrit dessus.',
  },
  urne: {
    id: 'urne',
    nom: 'Tirer une bille dans le sac',
    emoji: '🎒',
    // 3 rouges, 2 bleues, 1 verte — 6 billes, mais 3 COULEURS de chances
    // différentes. L'issue « une bille » reste équiprobable ; l'issue
    // « une couleur » ne l'est pas. C'est toute la subtilité du module.
    billes: [
      ...Array(3).fill('rouge'),
      ...Array(2).fill('bleu'),
      ...Array(1).fill('vert'),
    ],
    issues: [
      { id: 'rouge', label: 'Rouge', couleur: '#dc2626' },
      { id: 'bleu', label: 'Bleu', couleur: '#2563eb' },
      { id: 'vert', label: 'Vert', couleur: '#16a34a' },
    ],
    equiprobable: false,
    raison: 'Il y a 3 billes rouges mais 1 seule verte : les couleurs n’ont pas la même chance.',
  },
};

/**
 * Les issues d'une expérience, telles que l'élève les énumère.
 * Pour l'urne, ce sont les BILLES (6 issues équiprobables), pas les couleurs.
 */
export const issuesElementaires = (exp) =>
  exp.id === 'urne' ? exp.billes.map((c, i) => ({ id: `b${i}`, label: c })) : exp.issues;

/** Le nombre d'issues d'une expérience — le dénominateur d'une probabilité. */
export const nombreIssues = (exp) => issuesElementaires(exp).length;

/* ── Événements ──────────────────────────────────────────────────── */

/**
 * Un événement est décrit par la LISTE des issues qui le réalisent — jamais
 * par une formule. C'est le geste du programme de 5e : « décrire un événement
 * par les issues qui le réalisent ».
 */
export const EVENEMENTS_DE = {
  six: { id: 'six', label: 'Obtenir 6', realisent: [6] },
  pair: { id: 'pair', label: 'Obtenir un nombre pair', realisent: [2, 4, 6] },
  plusDe4: { id: 'plusDe4', label: 'Obtenir plus de 4', realisent: [5, 6] },
  moinsDe7: { id: 'moinsDe7', label: 'Obtenir moins de 7', realisent: [1, 2, 3, 4, 5, 6] },
  sept: { id: 'sept', label: 'Obtenir 7', realisent: [] },
};

/**
 * La probabilité d'un événement en situation d'ÉQUIPROBABILITÉ :
 *   nombre d'issues favorables ÷ nombre d'issues possibles.
 *
 * La fonction REFUSE de calculer si les issues ne sont pas équiprobables —
 * c'est la condition d'emploi de la formule, et la faire respecter par le
 * code empêche la leçon de l'oublier.
 */
export function probabilite(favorables, possibles, { equiprobable = true } = {}) {
  if (!equiprobable) {
    throw new Error(
      '[probabilites-5e] le quotient « favorables / possibles » ne vaut ' +
      'QUE si les issues sont équiprobables.',
    );
  }
  if (possibles <= 0) return null;
  return favorables / possibles;
}

/** La probabilité d'un événement du dé, à partir des issues qui le réalisent. */
export const probaEvenementDe = (ev) => probabilite(ev.realisent.length, 6);

/**
 * La probabilité de tirer une couleur donnée dans l'urne. Les BILLES sont
 * équiprobables (6 issues), même si les couleurs ne le sont pas : on compte
 * donc les billes favorables, pas les couleurs.
 */
export function probaCouleur(couleur) {
  const billes = EXPERIENCES.urne.billes;
  return probabilite(billes.filter((b) => b === couleur).length, billes.length);
}

/**
 * L'échelle de 0 à 1, avec les deux bornes nommées. Un événement de
 * probabilité 0 est IMPOSSIBLE, de probabilité 1 est CERTAIN.
 */
export function qualifier(p) {
  if (p === 0) return { mot: 'impossible', couleur: 'rose' };
  if (p === 1) return { mot: 'certain', couleur: 'emerald' };
  if (p < 0.5) return { mot: 'peu probable', couleur: 'amber' };
  if (p > 0.5) return { mot: 'probable', couleur: 'sky' };
  return { mot: 'une chance sur deux', couleur: 'violet' };
}

/* ── Simulation reproductible ────────────────────────────────────── */

/**
 * Lance `n` fois une expérience et renvoie les effectifs par issue.
 * `seed` fixe la série : deux appels de même graine donnent la MÊME série,
 * ce qui rend la simulation explicable (« relance, tu retrouveras ça »).
 *
 * Boucle réelle, pas d'approximation : 10 000 lancers restent instantanés.
 */
export function simuler(exp, n, seed) {
  const issues = issuesElementaires(exp);
  const rng = makeRng(seed);
  const counts = new Map(issues.map((i) => [i.label, 0]));
  for (let k = 0; k < n; k += 1) {
    const tire = issues[randomInt(rng, 0, issues.length - 1)];
    counts.set(tire.label, counts.get(tire.label) + 1);
  }
  return counts;
}

/**
 * Effectifs et fréquences observés pour les issues AFFICHÉES d'une
 * expérience (pour l'urne : les trois couleurs, pas les six billes).
 * → [{ id, label, effectif, frequence, attendue }]
 */
export function observer(exp, n, seed) {
  const counts = simuler(exp, n, seed);
  const total = n;
  return exp.issues.map((issue) => {
    // Pour l'urne, plusieurs billes portent la même couleur : leur label
    // est la couleur, donc le compteur les a déjà regroupées.
    const effectif = counts.get(exp.id === 'urne' ? issue.id : issue.label) ?? 0;
    return {
      id: issue.id,
      label: issue.label,
      couleur: issue.couleur,
      effectif,
      frequence: total === 0 ? 0 : effectif / total,
      attendue: attendue(exp, issue),
    };
  });
}

/** La probabilité THÉORIQUE d'une issue affichée. */
export function attendue(exp, issue) {
  if (exp.id === 'urne') return probaCouleur(issue.id);
  return probabilite(1, exp.issues.length);
}

/**
 * Cumule une nouvelle salve de `n` lancers sur des effectifs existants —
 * c'est ainsi qu'on REPÈTE sans repartir de zéro, et qu'on voit la fréquence
 * bouger de moins en moins.
 *
 * La graine dérive du nombre de lancers déjà faits : la suite est donc
 * différente à chaque salve, et pourtant l'ensemble reste reproductible.
 */
export function cumuler(exp, precedent, n) {
  const dejaFaits = precedent.total;
  const counts = simuler(exp, n, precedent.seed + dejaFaits * 7919);
  const parIssue = { ...precedent.parIssue };
  for (const issue of exp.issues) {
    const cle = exp.id === 'urne' ? issue.id : issue.label;
    parIssue[issue.id] = (parIssue[issue.id] ?? 0) + (counts.get(cle) ?? 0);
  }
  return { seed: precedent.seed, total: dejaFaits + n, parIssue };
}

/** État initial d'une simulation cumulative : rien n'a encore été lancé. */
export const simInit = (exp, seed = 20260908) => ({
  seed,
  total: 0,
  parIssue: Object.fromEntries(exp.issues.map((i) => [i.id, 0])),
});

/**
 * L'écart entre fréquence observée et probabilité attendue, en points de
 * pourcentage. C'est ce nombre qui doit DIMINUER quand on répète — la leçon
 * le fait CONSTATER sans énoncer la loi des grands nombres (4e).
 */
export function ecartMax(exp, sim) {
  if (sim.total === 0) return null;
  return Math.max(
    ...exp.issues.map((issue) =>
      Math.abs((sim.parIssue[issue.id] ?? 0) / sim.total - attendue(exp, issue)) * 100,
    ),
  );
}

/* ── Formatage ───────────────────────────────────────────────────── */

/** Une probabilité écrite en fraction : « 3/6 ». L'écriture de la 5e. */
export const fraction = (num, den) => `${num}/${den}`;

/** Un pourcentage à la française : 0,5 → « 50 % ». */
export const pct = (p, d = 1) =>
  p === null || Number.isNaN(p) ? '—' : `${String(Number((p * 100).toFixed(d))).replace('.', ',')} %`;

/** Un décimal à la française, sans zéro inutile. */
export const fr = (v, d = 2) =>
  v === null || Number.isNaN(v) ? '—' : String(Number(v.toFixed(d))).replace('.', ',');
