/**
 * Noyau mathématique de « Probabilités » (4e) — PUR, sans React.
 *
 * ─── CE QUE LA 4e AJOUTE À LA 5e ──────────────────────────────────────
 * La 5e (`probabilites-5e`) a installé le vocabulaire : expérience
 * aléatoire, issue, événement décrit PAR LES ISSUES qui le réalisent,
 * équiprobabilité, fréquence observée, probabilité, échelle de 0 à 1.
 * Le programme de 4e (objet officiel `4e_probabilites`, rôle
 * APPROFONDISSEMENT) ajoute exactement quatre choses, et rien d'autre :
 *
 *   1. l'événement CONTRAIRE, et sa probabilité — P(A) + P(Ā) = 1 ;
 *   2. l'INTERSECTION de deux événements, décrite par ses issues ;
 *   3. la RÉUNION de deux événements, décrite par ses issues ;
 *   4. l'événement IMPOSSIBLE et l'événement CERTAIN, reconnus ;
 *   5. la FLUCTUATION des fréquences quand on répète, puis leur
 *      stabilisation autour de la probabilité.
 *
 * ─── LE POINT DÉLICAT : DES ENSEMBLES, PAS UNE FORMULE ────────────────
 * En 4e, l'intersection et la réunion se traitent en LISTANT les issues
 * qui réalisent les deux événements, ou l'un au moins des deux. La formule
 * P(A∪B) = P(A) + P(B) − P(A∩B) est un objet de 3e/lycée : elle n'existe
 * PAS dans ce fichier, et `assertScope4e('formule-union')` lève. Ce noyau
 * calcule donc P(A∪B) en construisant l'ENSEMBLE union puis en sommant les
 * poids de ses issues — c'est le même geste que l'élève, à la main.
 *
 * Conséquence pédagogique voulue : quand A et B se CHEVAUCHENT, compter les
 * issues de A puis celles de B donne un total FAUX (les issues communes sont
 * comptées deux fois). C'est exactement ce que la manipulation doit faire
 * voir — d'où une expérience où le chevauchement est inévitable (voir SAC).
 *
 * ─── EXACTITUDE ───────────────────────────────────────────────────────
 * Une probabilité est un RATIONNEL EXACT (`common/algebra4e/exprCore`).
 * P(A) = 2/5 EST 2/5, jamais « 0,4 » : sinon P(A) + P(Ā) = 1 deviendrait
 * une égalité approchée, et c'est précisément l'égalité que la leçon
 * démontre. Seul l'affichage arrondit.
 *
 * ─── LE HASARD EST INJECTÉ ────────────────────────────────────────────
 * Aucun `Math.random`, jamais dans un rendu. Toute simulation reçoit une
 * GRAINE et passe par `makeRng` (mulberry32) de `common/stats/randomUtils`.
 * À graine égale, la même série ; à graines différentes, des séries
 * différentes — c'est cette différence QUI EST la fluctuation, l'objet même
 * du programme. Une simulation qui rendrait toujours le même premier lancer
 * détruirait l'expérience.
 */
import { rat, ratAdd, ratSub, ratEq, ratToNumber } from '../../../../../common/algebra4e';
import { makeRng } from '../../../../../common/stats';

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE 4e / 3e, EXÉCUTABLE.
 *
 * Un commentaire n'empêche pas une notion hors programme d'atteindre
 * l'écran ; une exception, si. Les quatre sujets ci-dessous appartiennent à
 * la 3e (`probabilites-3e`) ou au lycée, et ce noyau REFUSE de les traiter.
 * Le test vérifie en outre l'ABSENCE des fonctions correspondantes : on ne
 * peut donc pas non plus les contourner en appelant directement une API.
 */
const HORS_PROGRAMME_4E = {
  'arbre-pondere': 'l’arbre pondéré est un objet de 3e',
  'probabilite-conditionnelle': 'la probabilité conditionnelle est un objet de lycée',
  'deux-epreuves': 'une expérience à deux épreuves est un objet de 3e',
  'formule-union':
    'la formule P(A∪B) = P(A) + P(B) − P(A∩B) est un objet de 3e : en 4e, ' +
    'on DÉCRIT la réunion par ses issues et on somme leurs poids',
};

export function assertScope4e(sujet) {
  if (HORS_PROGRAMME_4E[sujet]) {
    throw new Error(`[probabilites-4e] Hors programme de 4e : ${HORS_PROGRAMME_4E[sujet]}.`);
  }
  return true;
}

/* ══ L'expérience aléatoire ═══════════════════════════════════════════ */

/**
 * Une EXPÉRIENCE, c'est un dispositif et la liste de ses ISSUES.
 *
 * Chaque issue porte un `poids` ENTIER (par défaut 1) : trois secteurs de
 * taille 2, 1, 1 sur une roue, ou quatre billes identiques dans un sac. Le
 * poids entier garde la probabilité rationnelle exacte sans arrondi, et il
 * se DESSINE (un secteur deux fois plus large, deux billes au lieu d'une) —
 * l'élève voit la raison du nombre.
 *
 * Une issue peut porter des ATTRIBUTS (couleur, taille…). C'est ce qui rend
 * l'intersection et la réunion non triviales : « rouge » et « grande » sont
 * deux événements dont le chevauchement n'est ni vide ni total.
 */
export function experience({ id, nom, issues, ...meta }) {
  if (!Array.isArray(issues) || issues.length === 0) {
    throw new Error('experience : une expérience aléatoire a au moins une issue');
  }
  const normalisees = issues.map((i) => {
    const poids = i.poids ?? 1;
    if (!Number.isInteger(poids) || poids <= 0) {
      throw new Error(
        `experience « ${id} » : le poids de l’issue « ${i.id} » doit être ` +
        `un entier strictement positif (reçu ${poids})`,
      );
    }
    return { ...i, poids };
  });
  const vus = new Set();
  for (const i of normalisees) {
    if (vus.has(i.id)) throw new Error(`experience « ${id} » : deux issues portent l’id « ${i.id} »`);
    vus.add(i.id);
  }
  return { id, nom, issues: normalisees, ...meta };
}

/** Le poids TOTAL de l'expérience — le dénominateur de toute probabilité. */
export const poidsTotal = (exp) => exp.issues.reduce((s, i) => s + i.poids, 0);

/** Les identifiants de toutes les issues, dans l'ordre d'affichage. */
export const toutesLesIssues = (exp) => exp.issues.map((i) => i.id);

/** L'issue d'identifiant donné, ou `undefined`. */
export const issue = (exp, id) => exp.issues.find((i) => i.id === id);

/**
 * Les issues sont-elles ÉQUIPROBABLES ? (acquis de 5e, rappelé ici)
 * Non pour la roue à secteurs inégaux, oui pour le sac de billes.
 */
export const equiprobable = (exp) => exp.issues.every((i) => i.poids === exp.issues[0].poids);

/* ══ Les événements — des ENSEMBLES d'issues ══════════════════════════ */

/**
 * Un ÉVÉNEMENT est un ENSEMBLE d'issues, jamais une formule ni un nombre.
 * C'est la définition de 5e, poursuivie en 4e : ce sont les OPÉRATIONS sur
 * les ensembles (contraire, intersection, réunion) qui sont nouvelles, pas
 * la nature de l'objet.
 *
 * `issues` est stocké comme un tableau TRIÉ SANS DOUBLON, dans l'ordre
 * d'affichage de l'expérience : deux événements égaux mathématiquement ont
 * alors la même écriture, et l'élève peut les comparer à l'œil.
 */
export function evenement(exp, ids, meta = {}) {
  const connues = new Set(toutesLesIssues(exp));
  for (const id of ids) {
    if (!connues.has(id)) {
      throw new Error(`evenement « ${meta.label ?? '?'} » : l’issue « ${id} » n’existe pas dans « ${exp.id} »`);
    }
  }
  const ensemble = new Set(ids);
  return {
    exp,
    issues: toutesLesIssues(exp).filter((id) => ensemble.has(id)),
    ...meta,
  };
}

/**
 * L'événement décrit par une CONDITION sur les issues — la façon dont on le
 * formule en français (« la bille est rouge », « la bille est grande »).
 * La leçon écrit la condition, le code en DÉDUIT la liste des issues : la
 * description en français et la liste affichée ne peuvent donc pas diverger.
 */
export const evenementSi = (exp, predicat, meta = {}) =>
  evenement(exp, exp.issues.filter(predicat).map((i) => i.id), meta);

/** Deux événements ont-ils exactement les mêmes issues ? */
export const memeEvenement = (a, b) =>
  a.issues.length === b.issues.length && a.issues.every((id, k) => id === b.issues[k]);

/* ── Les trois opérations du programme de 4e ─────────────────────────── */

/**
 * L'événement CONTRAIRE : toutes les issues que A ne contient PAS.
 * Ce n'est pas « l'inverse », ni « le contraire du mot » : c'est le
 * complémentaire dans l'ensemble des issues, et c'est cette lecture
 * ensembliste qui rend P(A) + P(Ā) = 1 évidente plutôt qu'apprise.
 */
export const contraire = (a, meta = {}) =>
  evenement(a.exp, toutesLesIssues(a.exp).filter((id) => !a.issues.includes(id)), {
    label: a.label ? `non « ${a.label} »` : undefined,
    ...meta,
  });

/**
 * L'INTERSECTION A ∩ B : les issues qui réalisent A **et** B.
 * Décrite par ses issues — la 4e ne dispose d'aucune formule pour elle.
 */
export const intersection = (a, b, meta = {}) => {
  if (a.exp !== b.exp) throw new Error('intersection : les deux événements doivent porter sur la MÊME expérience');
  return evenement(a.exp, a.issues.filter((id) => b.issues.includes(id)), {
    label: a.label && b.label ? `« ${a.label} » ET « ${b.label} »` : undefined,
    ...meta,
  });
};

/**
 * La RÉUNION A ∪ B : les issues qui réalisent A **ou** B (ou les deux).
 *
 * ATTENTION, C'EST LE POINT DE LA LEÇON : on construit l'ENSEMBLE, on ne
 * fait PAS la somme des cardinaux. Une issue qui appartient aux deux
 * événements n'apparaît qu'UNE fois dans la réunion — c'est ce que
 * `compteNaifReunion` ci-dessous met en évidence par contraste.
 */
export const reunion = (a, b, meta = {}) => {
  if (a.exp !== b.exp) throw new Error('réunion : les deux événements doivent porter sur la MÊME expérience');
  const dedans = new Set([...a.issues, ...b.issues]);
  return evenement(a.exp, [...dedans], {
    label: a.label && b.label ? `« ${a.label} » OU « ${b.label} »` : undefined,
    ...meta,
  });
};

/**
 * Le comptage NAÏF de la réunion : |A| + |B|, sans retirer les issues
 * communes. Ce n'est PAS une formule enseignée — c'est l'ERREUR VISÉE,
 * exposée pour que la manipulation puisse la mettre côte à côte avec le
 * vrai décompte et laisser l'élève constater l'écart. Elle vaut le bon
 * nombre exactement quand A et B sont INCOMPATIBLES.
 */
export const compteNaifReunion = (a, b) => a.issues.length + b.issues.length;

/** A et B sont-ils INCOMPATIBLES (aucune issue commune) ? */
export const incompatibles = (a, b) => intersection(a, b).issues.length === 0;

/* ══ La probabilité, en RATIONNELS EXACTS ═════════════════════════════ */

/**
 * P(A) = (somme des poids des issues de A) ÷ (poids total).
 *
 * Le résultat est un rationnel `{n, d}` IRRÉDUCTIBLE : sur le sac de 8
 * billes, quatre favorables donnent 1/2 et non 4/8 ni 0,5. C'est l'écriture
 * que l'élève doit produire, et le noyau ne peut donc pas en produire une
 * autre.
 */
export function probabilite(a) {
  const total = poidsTotal(a.exp);
  const favorables = a.issues.reduce((s, id) => s + issue(a.exp, id).poids, 0);
  return rat(favorables, total);
}

/** Le poids cumulé des issues d'un événement — le numérateur, avant réduction. */
export const poidsFavorables = (a) => a.issues.reduce((s, id) => s + issue(a.exp, id).poids, 0);

/**
 * P(Ā) = 1 − P(A), obtenue par SOUSTRACTION exacte.
 *
 * Deux chemins mènent au même nombre : construire le contraire et compter
 * ses issues (`probabilite(contraire(a))`), ou soustraire à 1. Le test
 * vérifie qu'ils COÏNCIDENT sur toutes les parties d'une expérience — c'est
 * la démonstration de P(A) + P(Ā) = 1, exécutée plutôt qu'affirmée.
 */
export const probaContraire = (a) => ratSub(rat(1), probabilite(a));

/** Un événement est IMPOSSIBLE quand aucune issue ne le réalise : P = 0. */
export const estImpossible = (a) => a.issues.length === 0;

/** Un événement est CERTAIN quand TOUTES les issues le réalisent : P = 1. */
export const estCertain = (a) => a.issues.length === a.exp.issues.length;

/**
 * Le mot qui qualifie un événement, avec sa RAISON — jamais un booléen nu.
 * L'impossible et le certain sont ici reconnus par leurs ISSUES (aucune /
 * toutes), pas par un test sur un flottant : « P vaut 0 » est la
 * conséquence, pas la définition.
 */
export function qualifier(a) {
  if (estImpossible(a)) {
    return { mot: 'impossible', p: rat(0), raison: 'aucune issue ne le réalise' };
  }
  if (estCertain(a)) {
    return { mot: 'certain', p: rat(1), raison: 'toutes les issues le réalisent' };
  }
  const p = probabilite(a);
  const demi = rat(1, 2);
  const mot = ratEq(p, demi)
    ? 'une chance sur deux'
    : ratToNumber(p) < 0.5 ? 'peu probable' : 'probable';
  return { mot, p, raison: `${poidsFavorables(a)} issues favorables sur ${poidsTotal(a.exp)}` };
}

/**
 * Un événement et son contraire, prêts à être affichés côte à côte, avec la
 * vérification que leur somme fait EXACTEMENT 1. La vue n'a rien à
 * recalculer, donc rien ne peut y diverger du modèle.
 */
export function couplecontraire(a) {
  const barre = contraire(a);
  const p = probabilite(a);
  const pBarre = probabilite(barre);
  return {
    evenement: a,
    barre,
    p,
    pBarre,
    somme: ratAdd(p, pBarre),
    sommeVautUn: ratEq(ratAdd(p, pBarre), rat(1)),
  };
}

/* ══ Écritures ════════════════════════════════════════════════════════ */

/** Une probabilité en fraction irréductible : « 3/8 ». L'écriture attendue. */
export const fraction = (r) => (r.d === 1 ? String(r.n) : `${r.n}/${r.d}`);

/** Un décimal à la française, sans zéro inutile : 0,375 → « 0,375 ». */
export const fr = (x, d = 3) =>
  Number.isFinite(x) ? String(Number(x.toFixed(d))).replace('.', ',') : '—';

/** Une probabilité en décimal français — pour COMPARER à une fréquence. */
export const decimal = (r, d = 3) => fr(ratToNumber(r), d);

/** Un pourcentage à la française : 3/8 → « 37,5 % ». */
export const pct = (r, d = 1) => `${fr(ratToNumber(r) * 100, d)} %`;

/** Un pourcentage à partir d'un nombre (une fréquence observée). */
export const pctNombre = (x, d = 1) => (Number.isFinite(x) ? `${fr(x * 100, d)} %` : '—');

/* ══ Simulation : la FLUCTUATION, puis la stabilisation ═══════════════ */

/**
 * Un tirage dans l'expérience, selon les poids. `rng` est INJECTÉ : cette
 * fonction ne connaît pas `Math.random` et ne peut donc pas être appelée
 * « par accident » dans un rendu de façon non reproductible.
 */
export function tirer(exp, rng) {
  const total = poidsTotal(exp);
  let r = rng() * total;
  for (const i of exp.issues) {
    r -= i.poids;
    if (r < 0) return i.id;
  }
  return exp.issues[exp.issues.length - 1].id;
}

/**
 * `n` répétitions de l'expérience : effectifs par issue, et l'effectif de
 * l'événement observé. À GRAINE ÉGALE, la même série — c'est ce qui rend une
 * simulation explicable (« relance, tu retrouveras exactement ça ») et
 * testable.
 */
export function simuler(exp, n, graine) {
  const rng = makeRng(graine);
  const effectifs = Object.fromEntries(toutesLesIssues(exp).map((id) => [id, 0]));
  for (let k = 0; k < n; k += 1) effectifs[tirer(exp, rng)] += 1;
  return { total: n, effectifs };
}

/** L'effectif d'un événement dans une simulation : la somme de ses issues. */
export const effectifEvenement = (sim, a) =>
  a.issues.reduce((s, id) => s + (sim.effectifs[id] ?? 0), 0);

/** La fréquence observée d'un événement : effectif ÷ nombre de répétitions. */
export const frequenceObservee = (sim, a) =>
  sim.total === 0 ? null : effectifEvenement(sim, a) / sim.total;

/**
 * La TRAJECTOIRE de la fréquence d'un événement au fil des répétitions.
 *
 * Les points sont espacés LOGARITHMIQUEMENT (10, 20, 50, 100, …) parce que
 * c'est là que la stabilisation se voit : entre 10 et 20 lancers la
 * fréquence saute, entre 1000 et 2000 elle bouge à peine. Un espacement
 * linéaire écraserait tout le début de la courbe, là où la FLUCTUATION est
 * précisément l'objet du programme.
 *
 * Les tirages sont RÉUTILISÉS d'un point au suivant : c'est bien LA MÊME
 * série qu'on regarde se stabiliser, pas une suite d'expériences séparées.
 * (Même contrat que `frequencyTrajectory` de `common/stats/randomUtils`,
 * adapté ici à un événement d'une expérience pondérée plutôt qu'à une
 * épreuve de Bernoulli.)
 */
export function trajectoire(exp, a, n, graine, points = 30) {
  const rng = makeRng(graine);
  const jalons = new Set([n]);
  for (let i = 0; i <= points; i += 1) {
    jalons.add(Math.max(1, Math.round(10 ** (Math.log10(n) * (i / points)))));
  }
  const etapes = [...jalons].sort((x, y) => x - y);
  const dedans = new Set(a.issues);
  const suite = [];
  let succes = 0;
  let prochain = 0;
  for (let k = 1; k <= n; k += 1) {
    if (dedans.has(tirer(exp, rng))) succes += 1;
    while (prochain < etapes.length && etapes[prochain] === k) {
      suite.push({ n: k, effectif: succes, frequence: succes / k });
      prochain += 1;
    }
  }
  return suite;
}

/**
 * PLUSIEURS séries INDÉPENDANTES de `n` répétitions.
 *
 * C'est l'outil de la fluctuation : une seule série ne montre rien, car
 * l'élève ne peut pas savoir si l'écart qu'il voit est « normal ». Trois ou
 * cinq séries côte à côte, toutes différentes et toutes proches de la même
 * valeur, montrent les DEUX faits à la fois — ça fluctue, et ça fluctue
 * AUTOUR de quelque chose.
 *
 * Les graines dérivent de la graine mère par un pas premier (`1e9 + 7`) :
 * les séries sont réellement indépendantes, et l'ensemble reste rejouable.
 */
export const PAS_DE_GRAINE = 1000000007;

/**
 * La graine SUIVANTE — celle du bouton « relance ».
 *
 * PIÈGE MESURÉ, à ne pas refaire : `graine + 1` ne convient PAS. Mulberry32
 * avance son état de 0x6d2b79f5 à chaque appel, si bien que deux graines
 * VOISINES produisent des premières valeurs voisines : sur le sac,
 * les graines 1, 2, 3 et 5 donnent toutes la bille B2 en premier tirage.
 * Un élève qui relance quatre fois verrait quatre fois la même bille et
 * conclurait — à raison, vu ce qu'il observe — que le sac est truqué.
 * Le pas premier écarte les états et rend chaque relance visiblement autre.
 */
export const graineSuivante = (graine, pas = 1) => (graine + pas * PAS_DE_GRAINE) >>> 0;

export function series(exp, a, n, graine, nombreDeSeries = 5) {
  return Array.from({ length: nombreDeSeries }, (_, s) => {
    const g = graineSuivante(graine, s);
    const sim = simuler(exp, n, g);
    const frequence = frequenceObservee(sim, a);
    return {
      index: s,
      graine: g,
      n,
      effectif: effectifEvenement(sim, a),
      frequence,
      ecart: ecartALaProbabilite(frequence, a),
    };
  });
}

/**
 * L'ÉCART entre une fréquence observée et la probabilité théorique, en
 * valeur absolue. C'est LE nombre que la leçon fait diminuer : sans lui, la
 * stabilisation reste une impression sur un dessin ; avec lui, elle se
 * mesure. La probabilité reste exacte jusqu'au dernier moment — la
 * conversion en décimal n'a lieu que pour la comparer à une fréquence, qui
 * est un quotient d'entiers de l'expérience.
 */
export const ecartALaProbabilite = (frequence, a) =>
  frequence == null ? null : Math.abs(frequence - ratToNumber(probabilite(a)));

/**
 * L'AMPLITUDE de la fluctuation entre séries : de la plus petite à la plus
 * grande fréquence observée. Elle doit RÉTRÉCIR quand `n` grandit — c'est la
 * formulation la plus honnête de la stabilisation pour la 4e, parce qu'elle
 * porte sur ce que l'élève VOIT (des séries qui se resserrent) et non sur
 * une limite.
 */
export function amplitude(lesSeries) {
  const f = lesSeries.map((s) => s.frequence).filter((x) => x != null);
  if (f.length === 0) return null;
  return Math.max(...f) - Math.min(...f);
}

/** L'écart MOYEN à la probabilité sur un paquet de séries. */
export function ecartMoyen(lesSeries) {
  const e = lesSeries.map((s) => s.ecart).filter((x) => x != null);
  if (e.length === 0) return null;
  return e.reduce((s, x) => s + x, 0) / e.length;
}

/**
 * Le tableau « fluctuation puis stabilisation » : pour chaque taille de
 * série, plusieurs séries, leur amplitude et leur écart moyen.
 *
 * C'est la donnée que le module 6 affiche telle quelle. Les tests
 * vérifient que l'écart moyen DÉCROÎT effectivement le long de `tailles`,
 * sur plusieurs graines — la leçon ne peut donc pas promettre une
 * stabilisation que la simulation ne produirait pas.
 */
export function tableauDeStabilisation(exp, a, tailles, graine, nombreDeSeries = 5) {
  return tailles.map((n) => {
    const lesSeries = series(exp, a, n, graine + n, nombreDeSeries);
    return {
      n,
      series: lesSeries,
      amplitude: amplitude(lesSeries),
      ecartMoyen: ecartMoyen(lesSeries),
    };
  });
}

/* ══ Les données de la leçon ══════════════════════════════════════════ */

/**
 * LE SAC À DEUX ATTRIBUTS — l'expérience centrale de la leçon.
 *
 * Huit billes, chacune avec une COULEUR et une TAILLE. Deux attributs, et
 * non un seul : c'est la condition pour que « rouge » et « grande » soient
 * deux événements dont l'intersection n'est ni vide ni égale à l'un des
 * deux. Avec un seul attribut, toute intersection serait triviale et la
 * notion n'aurait rien à mordre.
 *
 * La répartition est choisie pour que le CHEVAUCHEMENT soit inévitable :
 *   rouges : R1 R2 R3 R4  (4)          grandes : R1 R2 B1 V1     (4)
 *   rouges ET grandes : R1 R2          (2)  ← l'intersection non vide
 *   rouges OU grandes : R1 R2 R3 R4 B1 V1  (6)  ← et non 4 + 4 = 8
 * Le comptage naïf donnerait 8 issues sur 8, donc une probabilité de 1 :
 * l'élève lirait « je suis certain de tirer une bille rouge ou grande »,
 * ce qui est visiblement faux puisque B2 est bleue et petite. L'erreur se
 * réfute donc À L'ŒIL, sur le sac lui-même — pas par autorité.
 *
 * Les billes sont ÉQUIPROBABLES (poids 1 chacune) : le sac reste dans le
 * cadre installé en 5e, et c'est la ROUE ci-dessous qui apporte le cas non
 * équiprobable.
 */
export const SAC = experience({
  id: 'sac',
  nom: 'Le sac de billes',
  emoji: '🎒',
  issues: [
    { id: 'R1', label: 'R1', couleur: 'rouge', taille: 'grande', hex: '#dc2626' },
    { id: 'R2', label: 'R2', couleur: 'rouge', taille: 'grande', hex: '#dc2626' },
    { id: 'R3', label: 'R3', couleur: 'rouge', taille: 'petite', hex: '#dc2626' },
    { id: 'R4', label: 'R4', couleur: 'rouge', taille: 'petite', hex: '#dc2626' },
    { id: 'B1', label: 'B1', couleur: 'bleue', taille: 'grande', hex: '#2563eb' },
    { id: 'B2', label: 'B2', couleur: 'bleue', taille: 'petite', hex: '#2563eb' },
    { id: 'B3', label: 'B3', couleur: 'bleue', taille: 'petite', hex: '#2563eb' },
    { id: 'V1', label: 'V1', couleur: 'verte', taille: 'grande', hex: '#16a34a' },
  ],
});

/**
 * LA ROUE — l'expérience NON équiprobable.
 *
 * Quatre secteurs de largeurs 3, 2, 2, 1 (huit huitièmes). Elle sert à deux
 * choses : rappeler que « favorables ÷ possibles » suppose des issues
 * équiprobables (acquis de 5e), et donner une probabilité qui n'est PAS une
 * fraction de dé — 3/8 se lit sur le dessin (trois huitièmes de tour) autant
 * que dans le calcul.
 */
export const ROUE = experience({
  id: 'roue',
  nom: 'La roue de la fête',
  emoji: '🎡',
  issues: [
    { id: 'or', label: 'Or', poids: 3, hex: '#f59e0b' },
    { id: 'violet', label: 'Violet', poids: 2, hex: '#7c3aed' },
    { id: 'turquoise', label: 'Turquoise', poids: 2, hex: '#0891b2' },
    { id: 'rose', label: 'Rose', poids: 1, hex: '#db2777' },
  ],
});

/**
 * Les événements nommés du sac, écrits comme des CONDITIONS. Une seule
 * source : ce qui est écrit en français ici est ce qui est calculé.
 */
export const EVENEMENTS_SAC = {
  rouge: evenementSi(SAC, (b) => b.couleur === 'rouge', { id: 'rouge', label: 'la bille est rouge' }),
  bleue: evenementSi(SAC, (b) => b.couleur === 'bleue', { id: 'bleue', label: 'la bille est bleue' }),
  verte: evenementSi(SAC, (b) => b.couleur === 'verte', { id: 'verte', label: 'la bille est verte' }),
  grande: evenementSi(SAC, (b) => b.taille === 'grande', { id: 'grande', label: 'la bille est grande' }),
  petite: evenementSi(SAC, (b) => b.taille === 'petite', { id: 'petite', label: 'la bille est petite' }),
  // Les deux bornes de l'échelle, décrites elles aussi par leurs issues.
  noire: evenementSi(SAC, (b) => b.couleur === 'noire', { id: 'noire', label: 'la bille est noire' }),
  coloree: evenementSi(SAC, () => true, { id: 'coloree', label: 'la bille est colorée' }),
};

/**
 * LE COUPLE QUI SE CHEVAUCHE — « rouge » et « grande ». C'est celui que la
 * manipulation du module 3 met en scène ; il est nommé ici pour que les
 * tests, la vue et le texte parlent du même objet.
 */
export const COUPLE_CHEVAUCHANT = {
  a: EVENEMENTS_SAC.rouge,
  b: EVENEMENTS_SAC.grande,
};

/** Le couple INCOMPATIBLE — « rouge » et « bleue » : rien en commun. */
export const COUPLE_INCOMPATIBLE = {
  a: EVENEMENTS_SAC.rouge,
  b: EVENEMENTS_SAC.bleue,
};

/**
 * Les tailles de séries du module « fluctuation ». Elles montent d'un
 * facteur 10 : c'est le seul rythme auquel l'écart se divise visiblement
 * (par ~√10 ≈ 3), donc le seul auquel la stabilisation se CONSTATE en
 * quelques clics plutôt qu'en cent.
 */
export const TAILLES_DE_SERIE = [10, 100, 1000, 10000];

/** Le nombre de séries affichées côte à côte : assez pour voir varier, assez peu pour lire. */
export const NOMBRE_DE_SERIES = 5;

/** La graine par défaut de la leçon — un littéral, jamais l'horloge dans un test. */
export const GRAINE_LECON = 20260909;
