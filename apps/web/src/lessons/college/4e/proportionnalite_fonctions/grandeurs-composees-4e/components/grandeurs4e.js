/**
 * Noyau mathématique de « Grandeurs composées » (4e).
 *
 * ─── POURQUOI CETTE LEÇON EXISTE, ET OÙ ELLE SE RATTACHE ──────────────
 * Le référentiel 2026 ne porte AUCUN objet « grandeurs et mesures » au cycle 4
 * (il n'en existe qu'en 6e). Les grandeurs composées y vivent dans la
 * PROPORTIONNALITÉ : la 5e y installe la vitesse moyenne
 * (brique `vitesse-moyenne`), la 3e y ajoute les « grandeurs quotient »
 * (brique `grandeurs-quotient` de `proportionnalite-3e`). Cette leçon est donc
 * la part 2 de l'objet officiel `proportionnalite`, et non un objet inventé.
 *
 * ─── CE QU'ELLE AJOUTE À LA VITESSE DE 5e ─────────────────────────────
 * La 5e calcule une vitesse moyenne. La 4e comprend ce qu'est cette vitesse :
 *   1. une grandeur QUOTIENT — deux grandeurs divisées, avec une unité
 *      composée qui se lit « par » (km/h, L/min, g/cm³) ;
 *   2. distincte d'une grandeur PRODUIT (le kWh, la personne-jour), qui se lit
 *      « fois » ;
 *   3. et dont on change l'unité en raisonnant sur ce que l'unité SIGNIFIE,
 *      jamais par une recette (km/h → m/s n'est pas « ÷ 3,6 » à retenir, c'est
 *      « 1000 m en 3600 s »).
 *
 * ─── UNE SEULE RELATION, TROIS LECTURES ───────────────────────────────
 * `relation(d, t, v)` traite les trois grandeurs symétriquement : on en donne
 * deux, elle calcule la troisième. C'est la source de vérité unique du tableau
 * de bord — les trois cadrans ne peuvent donc pas se contredire.
 *
 * ─── PÉRIMÈTRE, EN CODE ───────────────────────────────────────────────
 * Ni k², ni k³, ni fonction affine, ni fonction linéaire : objets de 3e.
 */
/* ══ Écritures ════════════════════════════════════════════════════════ */

/* On ne PARTAGE pas ces deux fonctions avec la leçon sœur : la règle du dépôt
   (§6ter.6) est qu'un dossier de leçon n'importe jamais d'un autre. Ce qui est
   commun à plusieurs leçons monte dans `common/` ; ce qui tient en trois
   lignes se recopie, adapté. */

/** Arrondi « mesure » : deux décimales, sans bruit binaire. */
export const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

/** Format français : virgule décimale. */
export const fr = (x, d = 2) =>
  Number.isFinite(x) ? x.toLocaleString('fr-FR', { maximumFractionDigits: d }) : '—';

/* ══ Les unités composées ═════════════════════════════════════════════ */

/**
 * Une GRANDEUR QUOTIENT : deux grandeurs divisées l'une par l'autre.
 * Son unité se lit « par » et se note avec une barre.
 */
export const quotient = ({ id, nom, numerateur, denominateur, symbole, exemple }) => ({
  kind: 'quotient',
  id, nom, numerateur, denominateur, symbole, exemple,
  lecture: `des ${numerateur.pluriel} par ${denominateur.singulier}`,
});

/**
 * Une GRANDEUR PRODUIT : deux grandeurs multipliées.
 * Son unité se lit « fois » et se note par un point ou un accolement.
 */
export const produit = ({ id, nom, facteurA, facteurB, symbole, exemple }) => ({
  kind: 'produit',
  id, nom, facteurA, facteurB, symbole, exemple,
  lecture: `des ${facteurA.pluriel} fois des ${facteurB.pluriel}`,
});

/* ══ La relation entre trois grandeurs ════════════════════════════════ */

/**
 * LA RELATION, dans ses trois lectures.
 *
 * On donne DEUX des trois valeurs, la troisième se calcule. Les trois cadrans
 * du tableau de bord lisent tous cet objet : ils ne peuvent donc pas se
 * contredire, quelle que soit la grandeur que l'élève choisit de fixer.
 *
 * `manquante` dit laquelle a été calculée — c'est ce que l'interface met en
 * évidence.
 *
 * @param {{distance?:number, duree?:number, vitesse?:number}} donnees
 */
export function relation({ distance, duree, vitesse }) {
  const connues = [distance, duree, vitesse].filter((x) => x != null && Number.isFinite(x)).length;
  if (connues < 2) throw new Error('relation : il faut connaître au moins DEUX des trois grandeurs');

  if (distance == null) {
    verifier({ duree, vitesse });
    return { distance: round2(vitesse * duree), duree, vitesse, manquante: 'distance' };
  }
  if (duree == null) {
    verifier({ distance, vitesse });
    if (vitesse === 0) throw new Error('relation : une vitesse nulle ne permet aucun trajet');
    return { distance, duree: round2(distance / vitesse), vitesse, manquante: 'duree' };
  }
  if (vitesse == null) {
    verifier({ distance, duree });
    if (duree === 0) throw new Error('relation : une durée nulle ne définit aucune vitesse');
    return { distance, duree, vitesse: round2(distance / duree), manquante: 'vitesse' };
  }
  // Les trois sont données : on ne calcule rien, on VÉRIFIE la cohérence.
  return {
    distance, duree, vitesse,
    manquante: null,
    coherent: Math.abs(vitesse * duree - distance) < 0.005,
  };
}

function verifier(valeurs) {
  for (const [nom, v] of Object.entries(valeurs)) {
    if (v < 0) throw new Error(`relation : ${nom} ne peut pas être négatif`);
  }
}

/**
 * Ce qui arrive à la troisième grandeur quand on en double une, l'autre étant
 * FIXÉE. C'est la question du module 1, et la réponse dépend de laquelle on
 * fixe — d'où une fonction, plutôt qu'une phrase.
 */
export function siOnDouble({ grandeur, fixee, etat }) {
  const base = relation(etat);
  if (grandeur === fixee) throw new Error('siOnDouble : on ne peut pas doubler la grandeur qu’on fixe');
  const suivant = { [grandeur]: base[grandeur] * 2, [fixee]: base[fixee] };
  const apres = relation(suivant);
  const troisieme = ['distance', 'duree', 'vitesse'].find((g) => g !== grandeur && g !== fixee);
  return {
    avant: base[troisieme],
    apres: apres[troisieme],
    facteur: base[troisieme] === 0 ? null : round2(apres[troisieme] / base[troisieme]),
    troisieme,
  };
}

/* ══ Le débit ═════════════════════════════════════════════════════════ */

/**
 * Le DÉBIT : un volume par unité de temps. Même structure que la vitesse —
 * c'est le but pédagogique : montrer que ce n'est pas une notion de plus,
 * mais la MÊME, sur d'autres grandeurs.
 */
export function debitRelation({ volume, duree, debit }) {
  const r = relation({
    distance: volume,
    duree,
    vitesse: debit,
  });
  return { volume: r.distance, duree: r.duree, debit: r.vitesse, manquante: r.manquante === 'distance' ? 'volume' : r.manquante === 'vitesse' ? 'debit' : r.manquante };
}

/** Le temps de remplissage d'un réservoir, à débit constant. */
export const tempsDeRemplissage = (volume, debit) => debitRelation({ volume, debit }).duree;

/* ══ La masse volumique ═══════════════════════════════════════════════ */

/** Une masse par unité de volume : encore la même structure. */
export function masseVolumiqueRelation({ masse, volume, masseVolumique }) {
  const r = relation({ distance: masse, duree: volume, vitesse: masseVolumique });
  return {
    masse: r.distance,
    volume: r.duree,
    masseVolumique: r.vitesse,
    manquante: r.manquante === 'distance' ? 'masse' : r.manquante === 'duree' ? 'volume' : r.manquante === 'vitesse' ? 'masseVolumique' : null,
  };
}

/* ══ Les changements d'unité ══════════════════════════════════════════ */

/**
 * km/h → m/s, PAR LE SENS, jamais par une recette.
 *
 * 1 km/h, c'est 1000 mètres parcourus en 3600 secondes : on multiplie donc la
 * distance par 1000 et on divise la durée par 3600. Le fameux « ÷ 3,6 » est la
 * CONSÉQUENCE de ce raisonnement, pas son point de départ — et la fonction
 * l'expose comme telle (`etapes`), pour que la leçon puisse le montrer.
 */
export function kmhVersMs(v) {
  if (v < 0) throw new Error('kmhVersMs : une vitesse ne peut pas être négative');
  return {
    valeur: round2((v * 1000) / 3600),
    etapes: {
      metres: v * 1000,
      secondes: 3600,
      quotient: round2((v * 1000) / 3600),
      raccourci: round2(v / 3.6),
    },
  };
}

/** m/s → km/h, le chemin inverse : × 3600 mètres, ÷ 1000. */
export function msVersKmh(v) {
  if (v < 0) throw new Error('msVersKmh : une vitesse ne peut pas être négative');
  return {
    valeur: round2((v * 3600) / 1000),
    etapes: { metres: v * 3600, kilometres: round2((v * 3600) / 1000), raccourci: round2(v * 3.6) },
  };
}

/** Une durée décimale en heures → heures et minutes (2,25 h = 2 h 15 min). */
export function enHeuresMinutes(heures) {
  if (heures < 0) throw new Error('enHeuresMinutes : durée négative');
  const h = Math.floor(heures);
  const min = Math.round((heures - h) * 60);
  // 59,7 min s'arrondit à 60 : on reporte, sinon on afficherait « 2 h 60 ».
  return min === 60 ? { h: h + 1, min: 0 } : { h, min };
}

/** L'écriture d'une durée : « 2 h 15 min », « 45 min », « 3 h ». */
export function texteDuree(heures) {
  const { h, min } = enHeuresMinutes(heures);
  if (h === 0) return `${min} min`;
  if (min === 0) return `${h} h`;
  return `${h} h ${String(min).padStart(2, '0')} min`;
}

/* ══ Le périmètre, en code ════════════════════════════════════════════ */

/**
 * FRONTIÈRE 4e / 3e, EXÉCUTABLE. Ce noyau ne connaît ni l'effet d'un
 * agrandissement sur les aires et les volumes (k², k³), ni les fonctions
 * linéaires et affines : objets de 3e.
 */
export function assertScope4e(sujet) {
  const interdits = {
    'aire-agrandie': 'l’effet d’un agrandissement sur les AIRES (k²) est un objet de 3e',
    'volume-agrandi': 'l’effet d’un agrandissement sur les VOLUMES (k³) est un objet de 3e',
    'fonction-lineaire': 'la fonction linéaire est un objet de 3e',
    'fonction-affine': 'la fonction affine est un objet de 3e',
  };
  if (interdits[sujet]) throw new Error(`Hors programme de 4e : ${interdits[sujet]}`);
  return true;
}

/* ══ Les données de la leçon ══════════════════════════════════════════ */

export const GRANDEURS = {
  vitesse: quotient({
    id: 'vitesse',
    nom: 'la vitesse',
    numerateur: { singulier: 'kilomètre', pluriel: 'kilomètres' },
    denominateur: { singulier: 'heure', pluriel: 'heures' },
    symbole: 'km/h',
    exemple: 'un cycliste à 24 km/h',
  }),
  debit: quotient({
    id: 'debit',
    nom: 'le débit',
    numerateur: { singulier: 'litre', pluriel: 'litres' },
    denominateur: { singulier: 'minute', pluriel: 'minutes' },
    symbole: 'L/min',
    exemple: 'un robinet à 12 L/min',
  }),
  masseVolumique: quotient({
    id: 'masse-volumique',
    nom: 'la masse volumique',
    numerateur: { singulier: 'gramme', pluriel: 'grammes' },
    denominateur: { singulier: 'centimètre cube', pluriel: 'centimètres cubes' },
    symbole: 'g/cm³',
    exemple: 'le fer à 7,8 g/cm³',
  }),
  energie: produit({
    id: 'energie',
    nom: 'l’énergie consommée',
    facteurA: { singulier: 'kilowatt', pluriel: 'kilowatts' },
    facteurB: { singulier: 'heure', pluriel: 'heures' },
    symbole: 'kWh',
    exemple: 'un four de 2 kW pendant 3 h consomme 6 kWh',
  }),
  travail: produit({
    id: 'travail',
    nom: 'le travail fourni',
    facteurA: { singulier: 'ouvrier', pluriel: 'ouvriers' },
    facteurB: { singulier: 'jour', pluriel: 'jours' },
    symbole: 'ouvriers·jours',
    exemple: '4 ouvriers pendant 5 jours, c’est 20 ouvriers·jours',
  }),
};

/** L'état de départ du tableau de bord : un cycliste. */
export const CYCLISTE = { distance: 36, duree: 1.5, vitesse: 24 };

/** Les bornes atteignables des trois cadrans. */
export const BORNES = {
  distance: { min: 5, max: 120, pas: 1, unite: 'km' },
  duree: { min: 0.25, max: 6, pas: 0.25, unite: 'h' },
  vitesse: { min: 5, max: 60, pas: 1, unite: 'km/h' },
};
