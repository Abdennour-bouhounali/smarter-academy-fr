import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION. Distracteurs : sensibilité prise pour la VPP (e6,
 * e8), division par le nombre de malades au lieu du nombre de positifs (e7),
 * test jugé « mauvais » alors que c'est la prévalence qui joue (e9), faux
 * négatif confondu avec faux positif (e4). Les 11 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'td-e1', skill: 'modeliser', requires: ['quatre-groupes', 'effectif'], title: 'Modéliser le test', prompt: 'Un test appliqué à une population partage celle-ci en combien de catégories ?', options: ['4', '2', '3', '6'], cols: 4, explain: 'Deux états de santé (atteint / sain) × deux résultats (positif / négatif) = quatre catégories : VP, FP, VN, FN.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P1', 'seconde_tests-diagnostiques-probabilites-2nde_P3'] } },
  { id: 'td-e2', skill: 'modeliser', requires: ['quatre-groupes', 'pourcentage', 'quotient'], title: 'La prévalence', prompt: 'Sur 10 000 personnes testées, 100 sont atteintes. La prévalence vaut…', options: ['1 %', '10 %', '0,1 %', '100 %'], cols: 4, explain: '100 ÷ 10 000 = 0,01 = 1 %. La prévalence est la proportion de personnes atteintes dans la population testée.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P2'] } },
  { id: 'td-e3', skill: 'cases', requires: ['vocabulaire-cases'], title: 'Un faux positif', prompt: 'Une personne saine dont le test est positif est…', options: ['un faux positif', 'un vrai positif', 'un faux négatif', 'un vrai négatif'], cols: 2, explain: 'Le test affiche « positif » et se trompe : faux positif. Le nom dit le résultat, l’adjectif dit la justesse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P4'] } },
  { id: 'td-e4', skill: 'cases', requires: ['vocabulaire-cases'], title: 'Un faux négatif', prompt: 'Une personne atteinte que le test déclare négative est…', options: ['un faux négatif', 'un faux positif', 'un vrai négatif', 'un vrai positif'], cols: 2, explain: 'Le test affiche « négatif » alors que la personne est atteinte : faux négatif. C’est le cas où personne n’est alerté.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P5'] } },
  { id: 'td-e5', skill: 'qualite', requires: ['sensibilite-specificite', 'quotient'], title: 'La sensibilité', prompt: 'Un test détecte 99 des 100 personnes atteintes. Sa sensibilité vaut…', options: ['99 %', '95 %', '1 %', '17 %'], cols: 4, explain: '99 ÷ 100 = 0,99. La sensibilité se calcule PARMI LES PERSONNES ATTEINTES : c’est P_atteint(test +).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P6'] } },
  { id: 'td-e6', skill: 'qualite', requires: ['sensibilite-specificite', 'quotient'], title: 'La spécificité', prompt: 'Sur 9 900 personnes saines, le test en déclare 9 405 négatives. Sa spécificité vaut…', options: ['95 %', '5 %', '99 %', '17 %'], cols: 4, explain: '9 405 ÷ 9 900 = 0,95. Les 5 % restants (495 personnes) sont les faux positifs.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P7'] } },
  { id: 'td-e7', skill: 'vpp', requires: ['valeur-predictive', 'sensibilite-specificite'], title: 'La valeur prédictive positive', prompt: 'Il y a 99 vrais positifs et 495 faux positifs. Le test est positif : quelle est la probabilité d’être réellement atteint ?', options: ['≈ 17 %', '99 %', '95 %', '1 %'], cols: 4, explain: '99 ÷ (99 + 495) = 99/594 ≈ 0,167. On divise par le nombre TOTAL de tests positifs — la condition est « le test est positif ».', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P8'] } },
  { id: 'td-e8', skill: 'vpp', requires: ['mem-inversion-test', 'valeur-predictive', 'sensibilite-specificite'], title: 'Ne pas inverser', prompt: '« Le test est fiable à 99 %, donc un positif est atteint à 99 %. » Cette phrase…', options: ['inverse le conditionnement', 'est correcte', 'confond sensibilité et prévalence', 'oublie les faux négatifs'], cols: 2, explain: 'Les 99 % sont P(test + | atteint), calculés parmi les malades. La question porte sur P(atteint | test +), calculée parmi les positifs : ici ≈ 17 %.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P10'] } },
  { id: 'td-e9', skill: 'interpreter', requires: ['methode-affirmation-test', 'sensibilite-specificite', 'valeur-predictive'], title: 'Un test mal conçu ?', prompt: 'Il y a cinq fois plus de faux positifs que de vrais positifs. Que faut-il en conclure ?', options: ['Que la maladie est rare dans cette population', 'Que le test est mauvais', 'Que la sensibilité est faible', 'Qu’il y a une erreur de calcul'], cols: 1, explain: 'Le test détecte 99 % des malades et disculpe 95 % des sains : il est bon. Mais 5 % de 9 900 personnes saines dépassent forcément 99 % de 100 malades. C’est la prévalence qui domine.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P11'] } },
  { id: 'td-e10', skill: 'interpreter', requires: ['methode-affirmation-test', 'valeur-predictive'], title: 'Changer de population', prompt: 'Le MÊME test est appliqué à un groupe à risque où 40 % des personnes sont atteintes. La valeur prédictive positive…', options: ['augmente fortement (environ 93 %)', 'reste identique', 'diminue', 'devient impossible à calculer'], cols: 1, explain: 'Avec 3 960 vrais positifs contre 300 faux positifs, un test positif correspond à une personne atteinte dans 93 % des cas. Le test n’a pas changé : la population testée, si.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P9', 'seconde_tests-diagnostiques-probabilites-2nde_P11'] } },
];
const SKILLS = {
  modeliser: { label: 'Modéliser', module: 1 },
  cases: { label: 'Les quatre cases', module: 2 },
  qualite: { label: 'Sensibilité / spécificité', module: 3 },
  vpp: { label: 'Valeur prédictive', module: 4 },
  interpreter: { label: 'Interpréter', module: 5 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Bonne modélisation', test: (m) => !m.modeliser },
  { id: 'b2', emoji: '🏅', label: 'Quatre cases', test: (m) => !m.cases },
  { id: 'b3', emoji: '🏅', label: 'Qualité du test', test: (m) => !m.qualite },
  { id: 'b4', emoji: '🏅', label: 'Sans inversion', test: (m) => !m.vpp },
  { id: 'b5', emoji: '🏅', label: 'Esprit critique', test: (m) => !m.interpreter },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du diagnostic', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLeTest() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le test" moduleSubtitle="Dix épreuves sur les tests diagnostiques"
      estimatedTime="10 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Sur quelle population divise-t-on ?', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : sensibilité et spécificité se calculent sur les colonnes (l’état de santé), la valeur prédictive sur la ligne (le résultat du test).</p> }}
      registre={[
        { id: 'r1', emoji: '🧪', label: 'sensibilité', value: 'VP / atteints' },
        { id: 'r2', emoji: '🛡️', label: 'spécificité', value: 'VN / sains' },
        { id: 'r3', emoji: '❓', label: 'VPP', value: 'VP / positifs' },
        { id: 'r4', emoji: '📉', label: 'prévalence', value: 'change tout' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître du diagnostic !', title: 'Mission accomplie', message: 'Tu modélises un test par quatre effectifs, tu calcules sensibilité, spécificité et valeur prédictive, et tu ne confonds plus jamais « le test détecte 99 % des malades » avec « un positif est malade à 99 % ».', verbs: ['Modéliser', 'Compter', 'Calculer', 'Interpréter'], masterBadgeLabel: 'Maître du diagnostic' }} />
  );
}
