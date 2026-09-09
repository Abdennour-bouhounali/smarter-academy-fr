import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les valeurs des
 * modules (ni les affiches, ni le vélo à 40 €, ni les chaussures à 48 €), et
 * chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — « alignés donc proportionnels », sans regarder l'origine (M1, M5) ;
 *   — appliquer la croix à un tableau qui n'est pas proportionnel (M2) ;
 *   — confondre le pourcentage et l'unité (« −20 € » pour « −20 % ») (M3) ;
 *   — donner la HAUSSE au lieu du prix d'arrivée (M3) ;
 *   — croire que −t annule +t (M4) ;
 *   — multiplier au lieu de diviser pour remonter (M4).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 * `badges[].test` est une FONCTION `(misses) => bool`.
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 */
const SKILLS = {
  croix: { label: 'Produit en croix', module: 2, emoji: '✖️' },
  evolution: { label: 'Évolutions en %', module: 3, emoji: '📈' },
  retour: { label: 'Valeur initiale', module: 4, emoji: '↩️' },
  decider: { label: 'Reconnaître', module: 5, emoji: '🔍' },
};

const BADGES = [
  { id: 'b-croix', emoji: '✖️', label: 'Maître de la croix', test: (m) => !m.croix },
  { id: 'b-evo', emoji: '📈', label: 'Coefficient sûr', test: (m) => !m.evolution },
  { id: 'b-ret', emoji: '↩️', label: 'Remonte le temps', test: (m) => !m.retour },
  { id: 'b-dec', emoji: '🔍', label: 'Œil du contrôleur', test: (m) => !m.decider },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de la proportionnalité', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'p4-e1',
    skill: 'decider',
    title: 'Proportionnel ou pas ?',
    prompt: 'Un plombier facture 35 € de déplacement, puis 40 € par heure. Le prix payé est-il proportionnel à la durée ?',
    options: [
      'Non : pour 0 heure, on paie déjà 35 €',
      'Oui : le prix augmente régulièrement',
      'Oui : 40 € est le coefficient',
      'On ne peut pas savoir sans plus de valeurs',
    ],
    correct: 0,
    cols: 1,
    requires: ['cinq-lectures', 'critere-graphique'],
    explain: 'Le prix monte régulièrement, mais il ne part pas de zéro : le déplacement se paie même pour une durée nulle. Le prix par heure change donc à chaque durée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P6'] },
  },
  {
    id: 'p4-e2',
    skill: 'decider',
    title: 'Le graphique',
    prompt: 'Sur un graphique, les points d’une situation sont alignés sur une droite qui coupe l’axe vertical à 5. Que conclure ?',
    options: [
      'C’est proportionnel, puisque c’est aligné',
      'Ce n’est pas proportionnel : la droite ne passe pas par l’origine',
      'C’est proportionnel si la droite monte',
      'Il faut connaître le coefficient pour conclure',
    ],
    correct: 1,
    cols: 1,
    requires: ['critere-graphique'],
    explain: 'L’alignement ne suffit jamais. Couper l’axe vertical à 5, c’est facturer 5 pour une quantité nulle : la droite rate l’origine.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P6'] },
  },
  {
    id: 'p4-e3',
    skill: 'croix',
    title: 'La quatrième valeur',
    prompt: '4 kg de pommes coûtent 7 €. Combien coûtent 10 kg ?',
    options: ['13 €', '17,50 €', '2,80 €', '28 €'],
    correct: 1,
    cols: 4,
    requires: ['produit-en-croix'],
    explain: '7 × 10 = 70, puis 70 ÷ 4 = 17,50 €. (13 € viendrait d’une addition : +6 kg donc +6 €, ce qui n’est pas une proportionnalité.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P1'] },
  },
  {
    id: 'p4-e4',
    skill: 'croix',
    title: 'Un tableau à vérifier',
    prompt: 'Ce tableau est-il proportionnel ? 3 → 8 et 7 → 19',
    options: [
      'Oui : 3 × 19 = 7 × 8',
      'Non : 3 × 19 = 57 et 7 × 8 = 56',
      'Oui : les deux lignes augmentent',
      'On ne peut pas le savoir avec deux colonnes',
    ],
    correct: 1,
    cols: 1,
    requires: ['produit-en-croix'],
    explain: '57 et 56 : les produits en croix diffèrent d’une unité, donc ce n’est pas proportionnel. À l’œil, le tableau en avait pourtant l’air.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P1'] },
  },
  {
    id: 'p4-e5',
    skill: 'evolution',
    title: 'Une hausse',
    prompt: 'Un loyer de 450 € augmente de 4 %. Quel est le nouveau loyer ?',
    options: ['454 €', '468 €', '18 €', '472,50 €'],
    correct: 1,
    cols: 4,
    requires: ['coefficient-multiplicateur'],
    explain: '450 × 1,04 = 468 €. (454 € reviendrait à ajouter 4 €, pas 4 % ; 18 € est la hausse seule, pas le nouveau loyer.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P2'] },
  },
  {
    id: 'p4-e6',
    skill: 'evolution',
    title: 'Une baisse',
    prompt: 'Par quel nombre faut-il multiplier pour diminuer une quantité de 45 % ?',
    options: ['0,45', '1,45', '0,55', '−0,45'],
    correct: 2,
    cols: 4,
    requires: ['coefficient-multiplicateur'],
    explain: 'On garde 55 % de la quantité : 1 − 0,45 = 0,55. (0,45 est ce qu’on enlève ; un coefficient n’est jamais négatif.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P3'] },
  },
  {
    id: 'p4-e7',
    skill: 'evolution',
    title: 'Lire un coefficient',
    prompt: 'Une population est multipliée par 0,92 en un an. Que s’est-il passé ?',
    options: [
      'Elle a baissé de 8 %',
      'Elle a baissé de 92 %',
      'Elle a augmenté de 92 %',
      'Elle a baissé de 0,92 %',
    ],
    correct: 0,
    cols: 1,
    requires: ['coefficient-multiplicateur'],
    explain: 'Il en reste 92 %, donc il en manque 8 % : 1 − 0,92 = 0,08.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P4'] },
  },
  {
    id: 'p4-e8',
    skill: 'retour',
    title: 'Deux évolutions',
    prompt: 'Un prix augmente de 10 %, puis baisse de 10 %. Au total ?',
    options: [
      'Il revient à son prix de départ',
      'Il est plus bas de 1 % environ',
      'Il est plus haut de 1 % environ',
      'Il est plus bas de 20 %',
    ],
    correct: 1,
    cols: 1,
    requires: ['evolutions-successives'],
    explain: '1,1 × 0,9 = 0,99 : il reste 99 % du prix de départ, soit 1 % de moins. La baisse porte sur un prix déjà augmenté.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P4'] },
  },
  {
    id: 'p4-e9',
    skill: 'retour',
    title: 'Le prix d’avant',
    prompt: 'Après une remise de 25 %, un article coûte 36 €. Quel était son prix initial ?',
    options: ['45 €', '48 €', '27 €', '61 €'],
    correct: 1,
    cols: 4,
    requires: ['valeur-initiale'],
    explain: '36 ÷ 0,75 = 48 €. Vérification : 48 × 0,75 = 36. (45 € viendrait d’ajouter 25 % à 36, mais les 25 % portaient sur le prix d’avant, plus élevé.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P5'] },
  },
  {
    id: 'p4-e10',
    skill: 'retour',
    title: 'Le problème complet',
    prompt: 'Un club comptait 200 membres. Il en perd 15 %, puis en regagne 20 % l’année suivante. Combien en compte-t-il ?',
    options: ['210 membres', '204 membres', '200 membres', '170 membres'],
    correct: 1,
    cols: 4,
    requires: ['evolutions-successives', 'coefficient-multiplicateur'],
    explain: '200 × 0,85 = 170, puis 170 × 1,2 = 204. Le club a regagné plus qu’il n’avait perdu (+20 % contre −15 %), mais les 20 % portaient sur un nombre de membres plus petit : d’où 204 et non 210.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_proportionnalite-4e_P6', '4e_proportionnalite-4e_P4'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : la boutique"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="9 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'La boutique',
        tone: 'amber',
        body: (
          <>
            Dix situations de commerce et de mesure. Réponds à tout, puis soumets :
            aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Proportionnalité maîtrisée',
        title: 'Mission accomplie',
        message: 'Tu sais reconnaître une situation proportionnelle, trouver la valeur manquante et faire évoluer une grandeur dans les deux sens.',
        verbs: ['Reconnaître', 'Calculer', 'Faire évoluer', 'Remonter'],
        masterBadgeLabel: 'Maître de la proportionnalité',
      }}
    />
  );
}
