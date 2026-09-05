/**
 * Les situations de la leçon — données littérales, jamais calculées à la main
 * dans les modules ; les tests vérifient que chaque jeu de données obéit bien
 * au modèle qu'il prétend suivre.
 */
import { proportional, affine, square, none, evaluate } from './modelUtils';

/** Fil rouge : la trottinette en libre-service. */
export const TROTTINETTE = {
  id: 'trottinette',
  title: 'La trottinette en libre-service',
  variable: 't',
  xLabel: 'durée', xUnit: 'min', yLabel: 'prix', yUnit: '€',
  model: affine(0.15, 1),
  cap: 8,                                   // plafond : 8 € par heure de location
  capFrom: 60,
  /** Les informations de l'application : utiles ou non pour le prix d'un trajet. */
  infos: [
    { id: 'debloc', text: 'Déblocage : 1 €', useful: true },
    { id: 'minute', text: '0,15 € par minute', useful: true },
    { id: 'couleur', text: 'Trottinette verte, modèle X2', useful: false },
    { id: 'autonomie', text: 'Autonomie : 25 km', useful: false },
    { id: 'heure', text: 'Départ à 17 h 42', useful: false },
    { id: 'poids', text: 'Poids : 17 kg', useful: false },
    { id: 'duree', text: 'Durée du trajet, en minutes', useful: true },
  ],
  /** Trois tickets réellement payés — les données à modéliser. */
  tickets: [
    { id: 'a', x: 5, y: 1.75, label: 'Mardi · 5 min · 1,75 €' },
    { id: 'b', x: 10, y: 2.5, label: 'Jeudi · 10 min · 2,50 €' },
    { id: 'c', x: 20, y: 4, label: 'Samedi · 20 min · 4,00 €' },
  ],
  /** Les quatre modèles candidats du laboratoire. */
  candidates: [
    { id: 'prop', label: 'prix = 0,15 × durée', model: proportional(0.15) },
    { id: 'plus1', label: 'prix = durée + 1', model: affine(1, 1) },
    { id: 'aff', label: 'prix = 0,15 × durée + 1', model: affine(0.15, 1) },
    { id: 'x115', label: 'prix = 1,15 × durée', model: proportional(1.15) },
  ],
  /** Les grandeurs possibles, dont deux pertinentes. */
  quantities: [
    { id: 'duree', label: 'la durée du trajet', relevant: true },
    { id: 'prix', label: 'le prix payé', relevant: true },
    { id: 'poids', label: 'le poids de la trottinette', relevant: false },
    { id: 'autonomie', label: 'l’autonomie', relevant: false },
  ],
  predictX: 35,
  realPaid: 6.25,
};

/** Module 2 : trois situations, une grandeur qui dépend d'une autre. */
export const SITUATIONS = [
  {
    id: 'piscine', title: 'La piscine qui se remplit',
    text: 'Un tuyau verse 12 litres par minute dans une piscine vide de 30 000 litres. Le jardin fait 400 m².',
    quantities: ['la durée de remplissage', 'le volume d’eau dans la piscine', 'la surface du jardin', 'la couleur du tuyau'],
    depends: 1, on: 0, useless: [2, 3],
    model: proportional(12), variable: 't', xLabel: 'min', yLabel: 'L',
    question: 'Au bout de combien de temps la piscine est-elle pleine ?', bestRepr: 'expression',
  },
  {
    id: 'streaming', title: 'L’abonnement de streaming',
    text: 'Le service coûte 6 € par mois, plus 3 € par film loué. Le catalogue compte 4 000 films.',
    quantities: ['le nombre de films loués dans le mois', 'la facture du mois', 'la taille du catalogue', 'le nom du service'],
    depends: 1, on: 0, useless: [2, 3],
    model: affine(3, 6), variable: 'n', xLabel: 'films', yLabel: '€',
    question: 'Quelle est la facture pour 0, 1, 2, 3, 4 films ?', bestRepr: 'tableau',
  },
  {
    id: 'jardin', title: 'Le jardin carré',
    text: 'Un jardin carré a un côté c, en mètres. La clôture coûte 20 € le mètre.',
    quantities: ['le côté du jardin', 'l’aire du jardin', 'le prix de la clôture', 'la marque de la clôture'],
    depends: 1, on: 0, useless: [3],
    model: square(1), variable: 'c', xLabel: 'm', yLabel: 'm²',
    question: 'Comment l’aire évolue-t-elle quand le côté grandit ?', bestRepr: 'graphique',
  },
];

/** Module 3 : le modèle à tabuler puis à tracer. */
export const RESERVOIR = {
  id: 'reservoir', title: 'Le réservoir qui se vide',
  text: 'Un réservoir contient 60 L et se vide de 5 L par minute.',
  model: affine(-5, 60), variable: 't', xs: [0, 2, 4, 6, 8, 10, 12], xLabel: 'min', yLabel: 'L',
};

/** Module 4 : quatre jeux de données, quatre verdicts. */
export const DATASETS = [
  { id: 'forfait', title: 'Le forfait téléphone', xLabel: 'Go', yLabel: '€', variable: 'x',
    points: [{ x: 0, y: 5 }, { x: 2, y: 9 }, { x: 5, y: 15 }, { x: 8, y: 21 }], truth: affine(2, 5) },
  { id: 'essence', title: 'Le plein d’essence', xLabel: 'L', yLabel: '€', variable: 'x',
    points: [{ x: 10, y: 18 }, { x: 20, y: 36 }, { x: 35, y: 63 }, { x: 40, y: 72 }], truth: proportional(1.8) },
  { id: 'carre', title: 'L’aire du carré', xLabel: 'm', yLabel: 'm²', variable: 'c',
    points: [{ x: 1, y: 1 }, { x: 2, y: 4 }, { x: 3, y: 9 }, { x: 4, y: 16 }], truth: square(1) },
  { id: 'temperature', title: 'La température de la journée', xLabel: 'h', yLabel: '°C', variable: 'h',
    points: [{ x: 6, y: 8 }, { x: 10, y: 14 }, { x: 14, y: 21 }, { x: 18, y: 16 }], truth: none() },
];

/** Module 7 : la fête de fin d'année — deux devis. */
export const FETE = {
  salle: { id: 'salle', label: 'Salle + buffet maison', model: affine(6, 240), desc: '240 € de location, puis 6 € par personne' },
  traiteur: { id: 'traiteur', label: 'Traiteur tout compris', model: proportional(14), desc: '14 € par personne, rien d’autre' },
  infos: [
    { id: 'loc', text: 'Location de la salle : 240 €', useful: true },
    { id: 'buffet', text: 'Buffet maison : 6 € par personne', useful: true },
    { id: 'trait', text: 'Traiteur : 14 € par personne, tout compris', useful: true },
    { id: 'date', text: 'La fête a lieu le 27 juin', useful: false },
    { id: 'musique', text: 'La sono est prêtée par le collège', useful: false },
    { id: 'eleves', text: 'Le collège compte 620 élèves', useful: false },
  ],
  attendance: 45,
};

export const valueOf = (situation, x) => evaluate(situation.model, x);
