import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Un diagnostic MESURE ; il n'enseigne rien. Chaque question porte un
 * `requires` dont les ids sont exactement ceux du `priorKnowledge` de la leçon
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md) — jamais la matière de Seconde
 * que la leçon va poser elle-même (ensemble de définition, courbe
 * représentative, registres, réunion d'intervalles, modélisation).
 *
 * Quatre familles de prérequis, quatre compétences :
 *   — les fonctions du collège (3e) : image, antécédent, f(x), tableau ;
 *   — le repérage dans le plan (6e) : abscisse, ordonnée, origine ;
 *   — le calcul littéral (4e/3e) : valeur d'une expression, développement,
 *     distributivité, équation du premier degré ;
 *   — les intervalles (Seconde, chapitre « Ensembles et intervalles », déjà
 *     traité) et les grandeurs de base (périmètre, aire — 6e).
 * Aucune question ne porte de métadonnée `assessment` : un diagnostic ne
 * produit aucune preuve d'apprentissage.
 */
const SKILLS = {
  fonctions: { label: 'Fonctions du collège', emoji: 'ƒ' },
  repere: { label: 'Repérage', emoji: '🗺️' },
  litteral: { label: 'Calcul littéral', emoji: '🔤' },
  intervalles: { label: 'Intervalles et grandeurs', emoji: '📏' },
};

const QUESTIONS = [
  { id: 'fo-d1-image', skill: 'fonctions', points: 2, requires: ['fonction', 'notation-fx', 'image', 'calcul-litteral'], prompt: 'f(x) = 2x + 1. Que vaut f(3) ?', options: ['7', '6', '231'], cols: 3, correct: 0, explain: 'On remplace x par 3 : 2 × 3 + 1 = 7.' },
  { id: 'fo-d2-tableau', skill: 'fonctions', points: 2, requires: ['fonction', 'image', 'tableau-de-valeurs'], prompt: 'Un tableau donne : x = 4 → 10 ; x = 5 → 13 ; x = 6 → 16. Quelle est l’image de 5 ?', options: ['13', '5', '16'], cols: 3, correct: 0, explain: 'La ligne x = 5 donne 13 : c’est l’image de 5.' },
  { id: 'fo-d2bis-antecedent', skill: 'fonctions', points: 2, requires: ['fonction', 'antecedent', 'tableau-de-valeurs'], prompt: 'Même tableau (x = 4 → 10 ; x = 5 → 13 ; x = 6 → 16). Quel est l’antécédent de 16 ?', options: ['6', '16', '13'], cols: 3, correct: 0, explain: 'On part de 16 et on remonte à sa colonne : x = 6. L’antécédent va dans l’autre sens que l’image.' },
  { id: 'fo-d3-point', skill: 'repere', points: 2, requires: ['coordonnees', 'abscisse', 'ordonnee', 'origine-repere'], prompt: 'Le point M(2 ; −1) est situé…', options: ['2 à droite de l’origine, 1 en dessous', '2 en dessous, 1 à gauche', '1 à droite, 2 au-dessus'], cols: 1, correct: 0, explain: 'Le premier nombre est l’abscisse (horizontale), le second l’ordonnée (verticale).' },
  { id: 'fo-d3bis-courbe', skill: 'repere', points: 2, requires: ['representation-graphique', 'abscisse', 'ordonnee'], prompt: 'Sur une représentation graphique, un point est placé à l’aide de…', options: ['son abscisse en horizontal, son ordonnée en vertical', 'son ordonnée en horizontal, son abscisse en vertical', 'sa distance à l’origine seulement'], cols: 1, correct: 0, explain: 'Toujours l’abscisse d’abord, en horizontal ; l’ordonnée ensuite, en vertical.' },
  { id: 'fo-d4-valeur', skill: 'litteral', points: 2, requires: ['calcul-litteral', 'carre-nombre'], prompt: 'Que vaut 3x² − 1 pour x = 2 ?', options: ['11', '35', '5'], cols: 3, correct: 0, explain: '3 × 2² − 1 = 3 × 4 − 1 = 11. Le carré porte sur x, pas sur 3x.' },
  { id: 'fo-d5-developper', skill: 'litteral', points: 2, requires: ['developper', 'distributivite'], prompt: 'Développe 2(x + 5).', options: ['2x + 10', '2x + 5', '7x'], cols: 3, correct: 0, explain: 'On multiplie chaque terme : 2 × x + 2 × 5 = 2x + 10. C’est la distributivité.' },
  { id: 'fo-d6-equation', skill: 'litteral', points: 2, requires: ['equation-premier-degre'], prompt: 'Résous 2x + 3 = 11.', options: ['x = 4', 'x = 7', 'x = 5,5'], cols: 3, correct: 0, explain: 'On retire 3 des deux côtés (2x = 8), puis on divise par 2 : x = 4.' },
  { id: 'fo-d7-intervalle', skill: 'intervalles', points: 2, requires: ['intervalle', 'intervalle-crochets', 'encadrer-nombre'], prompt: 'Quel intervalle décrit « tous les nombres strictement compris entre 0 et 10 » ?', options: [']0 ; 10[', '[0 ; 10]', '[0 ; 10['], cols: 3, correct: 0, explain: '« Strictement » exclut les deux bornes : les crochets se tournent vers l’extérieur, ]0 ; 10[.' },
  { id: 'fo-d8-appartient', skill: 'intervalles', points: 2, requires: ['appartient', 'intervalle', 'ensemble-reels'], prompt: 'Parmi ces affirmations, laquelle est vraie ?', options: ['12 ∈ [8 ; 20]', '12 ∈ ]12 ; 14[', '12 ∈ ℝ est faux'], cols: 1, correct: 0, explain: '12 est bien entre 8 et 20, bornes comprises. Dans ]12 ; 14[ la borne 12 est exclue ; et tout nombre décimal appartient à ℝ.' },
  { id: 'fo-d9-grandeurs', skill: 'intervalles', points: 2, requires: ['perimetre', 'aire'], prompt: 'Un rectangle mesure 3 cm sur 5 cm. Son périmètre et son aire valent…', options: ['périmètre 16 cm, aire 15 cm²', 'périmètre 15 cm, aire 16 cm²', 'périmètre 8 cm, aire 15 cm²'], cols: 1, correct: 0, explain: 'Le périmètre fait le tour : 3 + 5 + 3 + 5 = 16 cm. L’aire est le produit des côtés : 3 × 5 = 15 cm².' },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Dix questions pour savoir par où commencer" estimatedTime="6 min"
      brief={{ body: <p>Avant de fabriquer des boîtes, un tour de tes outils : les fonctions du collège, le repérage, le calcul littéral, et les intervalles du début de l’année. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS}
    />
  );
}
