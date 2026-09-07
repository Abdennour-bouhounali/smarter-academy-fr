/**
 * Données de la leçon « Loi des grands nombres ».
 *
 * Rien ici n'est un résultat préenregistré : ce fichier décrit les
 * EXPÉRIENCES (leurs issues et leur modèle théorique), les tirages étant
 * calculés à la demande par common/stats/randomUtils. Deux visites du même
 * module avec la même graine redonnent la même série ; un nouveau lancer
 * donne une série différente.
 *
 * Vérifié par data.test.js : les probabilités de chaque expérience somment
 * à 1, et le dé pipé du module 4 est effectivement détectable — son écart
 * au modèle équilibré doit être trop grand pour 3 000 lancers, et trop
 * petit pour 30.
 */

/**
 * Les expériences du laboratoire d'ouverture. `p` est la probabilité de
 * l'ÉVÉNEMENT SUIVI (celui dont on trace la fréquence), pas d'une issue
 * quelconque : c'est ce nombre que la courbe compare à la fréquence.
 */
export const EXPERIMENTS = [
  {
    id: 'piece',
    label: 'Pièce',
    emoji: '🪙',
    event: 'Pile',
    eventLabel: 'obtenir Pile',
    p: 1 / 2,
    pLabel: '1/2',
    outcomes: ['Pile', 'Face'],
    why: 'Deux issues que rien ne distingue : on les suppose équiprobables.',
  },
  {
    id: 'de-six',
    label: 'Dé — le 6',
    emoji: '🎲',
    event: '6',
    eventLabel: 'obtenir un 6',
    p: 1 / 6,
    pLabel: '1/6',
    outcomes: ['1', '2', '3', '4', '5', '6'],
    why: 'Six faces supposées équilibrées : chacune a une chance sur six.',
  },
  {
    id: 'de-pair',
    label: 'Dé — un nombre pair',
    emoji: '🎲',
    event: 'pair',
    eventLabel: 'obtenir un nombre pair',
    p: 1 / 2,
    pLabel: '1/2',
    outcomes: ['2', '4', '6'],
    why: 'Trois faces paires sur six : la moitié des issues.',
  },
  {
    id: 'urne',
    label: 'Urne — boule rouge',
    emoji: '🔴',
    event: 'rouge',
    eventLabel: 'tirer une boule rouge',
    p: 0.3,
    pLabel: '3/10',
    outcomes: ['3 rouges', '7 bleues'],
    why: 'Trois boules rouges sur dix, tirage avec remise.',
  },
];

export const experimentById = (id) => EXPERIMENTS.find((e) => e.id === id) ?? EXPERIMENTS[0];

/** Les paliers proposés à l'élève. Le saut ×10 rend la stabilisation lisible. */
export const TRIAL_STEPS = [10, 100, 1000, 10000];

/**
 * Module 4 — trois dés dont un seul est pipé. Les distributions sont
 * données face par face (indices 0→5 pour les faces 1→6).
 *
 * Le dé pipé favorise le 6 (0,25 au lieu de 0,1667) : un écart invisible sur
 * 30 lancers, flagrant sur 3 000. C'est exactement le propos du module —
 * ce n'est pas l'œil qui tranche, c'est la taille de la série.
 */
const FAIR = [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6];
export const DICE_CANDIDATES = [
  { id: 'de-a', label: 'Dé A', weights: FAIR, rigged: false },
  { id: 'de-b', label: 'Dé B', weights: [0.15, 0.15, 0.15, 0.15, 0.15, 0.25], rigged: true },
  { id: 'de-c', label: 'Dé C', weights: FAIR, rigged: false },
];

/** Le script lu (jamais exécuté) au module 5. */
export const PYTHON_SCRIPT = `from random import randint

n = 10000
succes = 0
for i in range(n):
    de = randint(1, 6)
    if de == 6:
        succes = succes + 1

print(succes / n)`;

/** La formule tableur équivalente, citée à côté du script. */
export const SPREADSHEET_FORMULA = '=NB.SI(A1:A10000 ; 6) / 10000';
