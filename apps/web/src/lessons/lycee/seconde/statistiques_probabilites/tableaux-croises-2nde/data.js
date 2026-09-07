import { makeRng } from '../../../../common/stats';

/**
 * Données de la leçon « Tableaux croisés ».
 *
 * 60 élèves du club, chacun décrit par deux caractères qualitatifs :
 *  · sa CLASSE (2de A, 2de B, 2de C) — variable nominale ;
 *  · son ACTIVITÉ (judo, danse, escalade, théâtre) — nominale aussi ;
 *  · son NIVEAU (débutant, intermédiaire, confirmé) — variable ORDINALE,
 *    utilisée au module 2 pour opposer nominal et ordinal sur les mêmes
 *    individus.
 *
 * Les fiches sont engendrées avec une graine figée : la population est
 * toujours la même (pour l'élève, pour les corrections, pour les tests), tout
 * en étant assez irrégulière pour ne pas ressembler à un exercice truqué.
 * data.test.js verrouille les effectifs cités dans les modules.
 */
export const CLASSES = ['2de A', '2de B', '2de C'];
export const ACTIVITES = ['judo', 'danse', 'escalade', 'théâtre'];
export const NIVEAUX = ['débutant', 'intermédiaire', 'confirmé'];

const PRENOMS = [
  'Ana', 'Bilal', 'Chloé', 'Diego', 'Eva', 'Farid', 'Gaby', 'Hugo', 'Inès', 'Jonas',
  'Kenza', 'Léo', 'Maya', 'Nils', 'Olga', 'Paul', 'Quentin', 'Rania', 'Sacha', 'Tom',
  'Uma', 'Victor', 'Wassim', 'Xavier', 'Yara', 'Zoé', 'Amir', 'Bérénice', 'Camille', 'Dylan',
  'Elias', 'Fanny', 'Gabin', 'Hana', 'Ismaël', 'Julie', 'Karim', 'Lola', 'Malo', 'Nora',
  'Oscar', 'Perrine', 'Rayan', 'Salma', 'Théo', 'Ugo', 'Vera', 'Willy', 'Yanis', 'Zack',
  'Alix', 'Basile', 'Cléa', 'Dorian', 'Elsa', 'Félix', 'Gina', 'Hakim', 'Iris', 'Jules',
];

function buildEleves() {
  const rng = makeRng(20260907);
  // Poids volontairement inégaux : les effectifs marginaux ne doivent pas
  // tomber ronds, sinon le tableau ressemble à un exercice fabriqué.
  const pick = (list, weights) => {
    const u = rng();
    let acc = 0;
    for (let i = 0; i < list.length; i += 1) {
      acc += weights[i];
      if (u < acc) return list[i];
    }
    return list[list.length - 1];
  };
  return PRENOMS.map((prenom, i) => ({
    id: i + 1,
    prenom,
    classe: pick(CLASSES, [0.38, 0.34, 0.28]),
    activite: pick(ACTIVITES, [0.3, 0.27, 0.23, 0.2]),
    niveau: pick(NIVEAUX, [0.45, 0.35, 0.2]),
  }));
}

/** Les 60 fiches d'élèves du club. */
export const ELEVES = buildEleves();
