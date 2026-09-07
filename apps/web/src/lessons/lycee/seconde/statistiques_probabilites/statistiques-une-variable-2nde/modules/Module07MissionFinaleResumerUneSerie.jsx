import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION. Distracteurs : moyenne des valeurs distinctes sans
 * pondérer (e2), médiane prise comme valeur centrale d'un effectif pair sans
 * demi-somme (e3), quartile confondu avec un effectif (e4), variance rendue
 * au lieu de l'écart type (e7), dispersion supposée changée par une
 * translation (e9), conclusion tirée de la seule moyenne (e10).
 * Les 12 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'st-e1', skill: 'lire', requires: ['serie-statistique', 'vocab-effectif-frequence', 'effectif'], title: 'Lire une série', prompt: 'Un tableau donne : 4 élèves à 10 min, 6 élèves à 20 min, 2 élèves à 35 min. Quel est l’effectif total ?', options: ['12', '3', '65', '24'], cols: 4, explain: '4 + 6 + 2 = 12 élèves. 3 est le nombre de valeurs distinctes, pas l’effectif.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P1'] } },
  { id: 'st-e2', skill: 'moyenne', requires: ['moyenne', 'moyenne-ponderee', 'effectif'], title: 'Moyenne pondérée', prompt: 'Avec ce même tableau (4 × 10 min, 6 × 20 min, 2 × 35 min), quelle est la moyenne ?', options: ['19,17 min', '21,67 min', '65 min', '20 min'], cols: 4, explain: '(4×10 + 6×20 + 2×35) ÷ 12 = 230 ÷ 12 ≈ 19,17 min. Faire (10 + 20 + 35) ÷ 3 = 21,67 revient à oublier les effectifs.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P2'] } },
  { id: 'st-e3', skill: 'mediane', requires: ['mediane', 'mediane-stat', 'ordre-nombres'], title: 'Médiane, effectif pair', prompt: 'Série rangée : 3, 7, 8, 12, 15, 20. Quelle est la médiane ?', options: ['10', '8', '12', '10,83'], cols: 4, explain: 'n = 6 est pair : on prend la demi-somme des 3ᵉ et 4ᵉ valeurs, (8 + 12) ÷ 2 = 10. La médiane n’appartient pas forcément à la série.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P4'] } },
  { id: 'st-e4', skill: 'quartiles', requires: ['quartiles'], title: 'Le rang de Q1', prompt: 'Une série compte 24 valeurs rangées. Q1 est la…', options: ['6ᵉ valeur', '4ᵉ valeur', '12ᵉ valeur', '18ᵉ valeur'], cols: 4, explain: 'rang(Q1) = ⌈24/4⌉ = 6. La 12ᵉ valeur concerne la médiane, la 18ᵉ concerne Q3 (⌈3×24/4⌉ = 18).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P5'] } },
  { id: 'st-e5', skill: 'quartiles', requires: ['quartiles'], title: 'Interpréter Q3', prompt: 'Pour une série de notes, Q3 = 14. Cela signifie que…', options: ['au moins 75 % des élèves ont 14 ou moins', 'exactement 75 % des élèves ont 14', '75 % des élèves ont plus de 14', 'la note moyenne est 14'], cols: 1, explain: 'Q3 est le seuil en dessous duquel se trouvent au moins les trois quarts de l’effectif. Le quart restant a 14 ou plus.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P6', 'seconde_statistiques-une-variable-2nde_P5'] } },
  { id: 'st-e6', skill: 'dispersion', requires: ['etendue-interquartile', 'etendue'], title: 'Écart interquartile', prompt: 'Q1 = 11, médiane = 16, Q3 = 23, min = 4, max = 41. Quel est l’écart interquartile ?', options: ['12', '37', '7', '5'], cols: 4, explain: 'Q3 − Q1 = 23 − 11 = 12. L’étendue vaut 41 − 4 = 37 : ce n’est pas la même mesure.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P9'] } },
  { id: 'st-e7', skill: 'ecart-type', requires: ['ecart-type', 'racine-carree'], title: 'Écart type', prompt: 'Une série a pour moyenne 5 et la moyenne des carrés des écarts vaut 9. Quel est son écart type ?', options: ['3', '9', '81', '4,5'], cols: 4, explain: 'La moyenne des carrés des écarts est la VARIANCE (9) ; l’écart type en est la racine carrée : 3.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P8', 'seconde_statistiques-une-variable-2nde_P7'] } },
  { id: 'st-e8', skill: 'ecart-type', requires: ['ecart-type', 'mem-deux-nombres'], title: 'Comparer deux capteurs', prompt: 'Deux capteurs mesurent 20 °C en moyenne ; X a un écart type de 0,3 °C, Y de 2,5 °C. Lequel est le plus régulier ?', options: ['X, car ses mesures s’écartent moins de la moyenne', 'Y, car son écart type est plus grand', 'Ils sont équivalents : même moyenne', 'Impossible à dire sans la médiane'], cols: 2, explain: 'Un petit écart type signifie des mesures resserrées autour de la moyenne, donc reproductibles.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P7', 'seconde_statistiques-une-variable-2nde_P9'] } },
  { id: 'st-e9', skill: 'perturber', requires: ['linearite-moyenne', 'robustesse'], title: 'Ajouter, retirer, décaler', prompt: 'À une série de 30 temps, on ajoute 3 minutes à CHAQUE valeur. Que deviennent moyenne et écart type ?', options: ['La moyenne augmente de 3, l’écart type ne change pas', 'Les deux augmentent de 3', 'La moyenne ne change pas, l’écart type augmente de 3', 'Les deux sont multipliés par 3'], cols: 1, explain: 'Une translation déplace la série sans la déformer : la position suit (+3), la dispersion est inchangée. Multiplier chaque valeur par 3, en revanche, tripleraiT les deux.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P3', 'seconde_statistiques-une-variable-2nde_P10'] } },
  { id: 'st-e10', skill: 'comparer', requires: ['methode-comparer', 'robustesse'], title: 'Comparer deux séries', prompt: 'Un salarié très bien payé quitte une entreprise. Que deviennent le salaire moyen et le salaire médian des restants ?', options: [
      'Le moyen baisse nettement, le médian très peu',
      'Les deux baissent d’autant',
      'Le médian baisse nettement, le moyen très peu',
      'Aucun des deux ne change',
    ], cols: 1, explain: 'La moyenne utilise la valeur du salaire parti, donc elle chute ; la médiane ne fait que décaler d’un rang dans l’effectif — c’est la robustesse vue au module 5.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_statistiques-une-variable-2nde_P11', 'seconde_statistiques-une-variable-2nde_P12'] } },
];
const SKILLS = {
  lire: { label: 'Lire une série', module: 1 },
  moyenne: { label: 'La moyenne', module: 2 },
  mediane: { label: 'La médiane', module: 2 },
  quartiles: { label: 'Les quartiles', module: 3 },
  dispersion: { label: 'La dispersion', module: 3 },
  'ecart-type': { label: 'L’écart type', module: 4 },
  perturber: { label: 'Ajouter ou retirer', module: 5 },
  comparer: { label: 'Comparer deux séries', module: 6 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Position', test: (m) => !m.moyenne && !m.mediane },
  { id: 'b2', emoji: '🏅', label: 'Quartiles', test: (m) => !m.quartiles },
  { id: 'b3', emoji: '🏅', label: 'Dispersion', test: (m) => !m.dispersion && !m['ecart-type'] },
  { id: 'b4', emoji: '🏅', label: 'Robustesse', test: (m) => !m.perturber },
  { id: 'b5', emoji: '🏅', label: 'Comparaison honnête', test: (m) => !m.comparer },
  { id: 'b-parfait', emoji: '💎', label: 'Statisticien', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleResumerUneSerie() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : résumer une série" moduleSubtitle="Dix épreuves sur les indicateurs"
      estimatedTime="10 min" timerSeconds={720} timerLabel="12 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Position ET dispersion', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : un seul nombre ne résume pas une série — il faut dire où elle se situe et comment elle s’étale.</p> }}
      registre={[
        { id: 'r1', emoji: '➗', label: 'moyenne', value: 'somme ÷ effectif' },
        { id: 'r2', emoji: '✂️', label: 'médiane', value: 'coupe l’effectif en 2' },
        { id: 'r3', emoji: '📐', label: 'Q3 − Q1', value: 'la moitié centrale' },
        { id: 'r4', emoji: '📏', label: 'écart type', value: 'distance à la moyenne' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Statisticien !', title: 'Mission accomplie', message: 'Tu choisis l’indicateur adapté, tu sais lequel résiste à un cas extrême, et tu compares deux séries honnêtement.', verbs: ['Lire', 'Calculer', 'Mesurer', 'Comparer'], masterBadgeLabel: 'Statisticien' }} />
  );
}
