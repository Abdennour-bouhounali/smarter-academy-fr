import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis (clé 'seconde_loi_des_grands_nombres') : probabilité
 * d'un événement, fréquence.
 *
 * Un diagnostic MESURE des prérequis : les `requires` ci-dessous ne citent
 * que des ids de `priorKnowledge` (lesson.config.js), jamais la matière de la
 * leçon — ni fluctuation, ni loi des grands nombres, ni simulation.
 */
const SKILLS = {
  probabilite: { label: 'Probabilité', emoji: '🎲' },
  frequence: { label: 'Fréquence', emoji: '📊' },
};
const QUESTIONS = [
  { id: 'lgn-d1', skill: 'probabilite', points: 2, requires: ['probabilite', 'equiprobable', 'issue-evenement', 'face-solide'], prompt: 'On lance un dé équilibré à 6 faces. Quelle est la probabilité d’obtenir un 6 ?', options: ['1/6', '1/2', '6'], cols: 3, correct: 0, explain: 'Six issues équiprobables, une seule favorable : 1/6.' },
  { id: 'lgn-d2', skill: 'probabilite', points: 2, requires: ['probabilite', 'pourcentage'], prompt: 'Une probabilité est toujours un nombre…', options: ['entre 0 et 1', 'entre 0 et 100', 'plus grand que 1'], cols: 3, correct: 0, explain: 'Une probabilité est comprise entre 0 (impossible) et 1 (certain). En pourcentage, entre 0 % et 100 %.' },
  { id: 'lgn-d3', skill: 'probabilite', points: 2, requires: ['probabilite', 'equiprobable', 'issue-evenement', 'face-solide'], prompt: 'On lance un dé équilibré. Probabilité d’obtenir un nombre pair ?', options: ['1/2', '1/3', '1/6'], cols: 3, correct: 0, explain: 'Trois faces paires (2, 4, 6) sur six : 3/6 = 1/2.' },
  { id: 'lgn-d4', skill: 'frequence', points: 2, requires: ['frequence', 'effectif', 'quotient', 'pourcentage'], prompt: 'Sur 200 lancers, on obtient 34 fois un 6. Quelle est la fréquence observée ?', options: ['17 %', '34 %', '6 %'], cols: 3, correct: 0, explain: '34 ÷ 200 = 0,17 = 17 %. Une fréquence se calcule sur les répétitions RÉELLEMENT faites.' },
  { id: 'lgn-d5', skill: 'frequence', points: 2, requires: ['frequence', 'quotient', 'effectif'], prompt: 'Une fréquence observée se calcule…', options: ['succès ÷ nombre de répétitions', 'nombre de répétitions ÷ succès', 'succès × répétitions'], cols: 1, correct: 0, explain: 'C’est une proportion : la partie (les succès) divisée par le tout (les répétitions).' },
  { id: 'lgn-d6', skill: 'frequence', points: 2, requires: ['arrondi', 'quotient'], prompt: '1 702 ÷ 10 000 = 0,1702. Arrondi au dixième (en pourcentage), cela donne…', options: ['17,0 %', '17,02 %', '17 %'], cols: 3, correct: 0, explain: '0,1702 = 17,02 % ; arrondi au dixième, 17,0 %.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions avant de lancer les dés" estimatedTime="4 min"
      brief={{ body: <p>Avant de simuler : une probabilité, une fréquence, et la différence entre les deux. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
