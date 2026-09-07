import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION. Distracteurs : addition au lieu du produit le long
 * d'un chemin (e5), moyenne non pondérée des deux branches (e7), poids du
 * second niveau pris pour une probabilité globale (e3), un seul chemin
 * compté au lieu de deux (e6), somme des branches ≠ 1 non détectée (e4).
 * Les 10 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'ar-e1', skill: 'structure', title: 'La structure de l’arbre', prompt: 'Une expérience se déroule en deux étapes, avec 2 issues possibles à chaque étape. Combien l’arbre a-t-il de chemins ?', options: ['4', '2', '3', '8'], cols: 4, explain: '2 issues à la première étape × 2 à la seconde = 4 chemins. Un chemin par issue complète de l’expérience.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P1'] } },
  { id: 'ar-e2', skill: 'structure', title: 'De la situation à l’arbre', prompt: 'On tire un sac puis une bille dedans. Que place-t-on au premier niveau ?', options: ['Le choix du sac', 'La couleur de la bille', 'Le nombre total de billes', 'Peu importe'], cols: 2, explain: 'L’arbre suit la chronologie : la couleur dépend du sac choisi, donc le sac vient d’abord.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P9'] } },
  { id: 'ar-e3', skill: 'poids', title: 'Lire un poids', prompt: 'Sur la branche partant du sac A, le poids de « rouge » vaut 0,5. Cela signifie…', options: ['parmi les tirages passant par A, la moitié donnent une rouge', 'la moitié de tous les tirages donnent une rouge', 'la moitié des rouges sont dans A', 'A est choisi une fois sur deux'], cols: 1, explain: 'C’est une probabilité conditionnelle P_A(rouge) : elle ne concerne que les tirages ayant déjà emprunté la branche A.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P3', 'seconde_arbres-probabilites-2nde_P4'] } },
  { id: 'ar-e4', skill: 'poids', title: 'Un arbre correct', prompt: 'Depuis un même nœud partent deux branches de poids 0,7 et 0,2. Que conclure ?', options: ['L’arbre est faux : la somme doit valoir 1', 'C’est normal', 'Il faut multiplier les deux', 'Il faut les inverser'], cols: 2, explain: 'Les branches issues d’un nœud couvrent toutes les suites possibles : leur somme vaut 1. Ici 0,9 ≠ 1, donc un poids est faux ou une issue manque.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P2'] } },
  { id: 'ar-e5', skill: 'chemin', title: 'Probabilité d’un chemin', prompt: 'Un chemin porte les poids 0,4 puis 0,25. Quelle est sa probabilité ?', options: ['0,1', '0,65', '0,15', '1,6'], cols: 4, explain: '0,4 × 0,25 = 0,10. Le long d’un chemin on multiplie : la seconde étape ne se joue que parmi les tirages ayant pris la première. Additionner donnerait 0,65, ce qui n’a pas de sens ici.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P5', 'seconde_arbres-probabilites-2nde_P6'] } },
  { id: 'ar-e6', skill: 'chemin', title: 'Pourquoi un produit', prompt: 'Sur 1 000 tirages, 600 passent par A et la moitié d’entre eux donnent une rouge. Combien de tirages donnent « A puis rouge » ?', options: ['300', '600', '500', '1 100'], cols: 4, explain: 'La moitié de 600 = 300, soit 300/1 000 = 0,30 — exactement 0,6 × 0,5. Le produit n’est pas une convention : c’est un comptage.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P6'] } },
  { id: 'ar-e7', skill: 'evenement', title: 'Probabilité d’un événement', prompt: 'Deux chemins mènent à « rouge » : 0,30 et 0,10. Quelle est la probabilité d’obtenir une rouge ?', options: ['0,40', '0,375', '0,30', '0,03'], cols: 4, explain: '0,30 + 0,10 = 0,40. Faire la moyenne des compositions des deux sacs donnerait 0,375 : ce serait oublier que les sacs ne sont pas choisis aussi souvent.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P7', 'seconde_arbres-probabilites-2nde_P8'] } },
  { id: 'ar-e8', skill: 'evenement', title: 'Multiplier ou additionner', prompt: 'Dans un arbre, on additionne des probabilités quand…', options: ['plusieurs chemins distincts réalisent le même événement', 'on avance le long d’un chemin', 'les étapes sont indépendantes', 'jamais'], cols: 1, explain: 'On multiplie en avançant sur un chemin, on additionne en rassemblant des chemins différents qui aboutissent au même résultat.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P8'] } },
  { id: 'ar-e9', skill: 'traduire', title: 'Une situation réelle', prompt: 'Il pleut 30 % des matins ; le bus est en retard 4 fois sur 10 les matins de pluie, 1 fois sur 10 sinon. Probabilité de retard un matin quelconque ?', options: ['19 %', '40 %', '25 %', '12 %'], cols: 4, explain: '0,30 × 0,40 = 0,12 et 0,70 × 0,10 = 0,07, soit 0,19 = 19 %. Les 12 % ne comptent que les matins pluvieux ; 25 % serait la moyenne non pondérée.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P7', 'seconde_arbres-probabilites-2nde_P9'] } },
  { id: 'ar-e10', skill: 'traduire', title: 'De l’arbre à la phrase', prompt: 'Dans un arbre, le chemin « chaîne 2 → défectueuse » vaut 0,020. Comment le dire ?', options: ['2 % des pièces produites viennent de la chaîne 2 ET sont défectueuses', '2 % des pièces de la chaîne 2 sont défectueuses', '2 % des pièces défectueuses viennent de la chaîne 2', 'la chaîne 2 produit 2 % des pièces'], cols: 1, explain: 'Un chemin décrit une issue COMPLÈTE de l’expérience : il donne la probabilité de l’intersection des deux étapes, rapportée à l’ensemble de la production.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arbres-probabilites-2nde_P10'] } },
];
const SKILLS = {
  structure: { label: 'Construire l’arbre', module: 1 },
  poids: { label: 'Lire les poids', module: 2 },
  chemin: { label: 'Probabilité d’un chemin', module: 3 },
  evenement: { label: 'Probabilité d’un événement', module: 4 },
  traduire: { label: 'Traduire', module: 5 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Bon branchement', test: (m) => !m.structure },
  { id: 'b2', emoji: '🏅', label: 'Poids compris', test: (m) => !m.poids },
  { id: 'b3', emoji: '🏅', label: 'Produit maîtrisé', test: (m) => !m.chemin },
  { id: 'b4', emoji: '🏅', label: 'Somme maîtrisée', test: (m) => !m.evenement },
  { id: 'b5', emoji: '🏅', label: 'Traducteur', test: (m) => !m.traduire },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de l’arbre', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLArbre() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’arbre" moduleSubtitle="Dix épreuves sur les arbres pondérés"
      estimatedTime="10 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Multiplier ou additionner ?', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : le long d’un chemin on multiplie, entre plusieurs chemins on additionne.</p> }}
      registre={[
        { id: 'r1', emoji: '🌳', label: 'niveau', value: 'une étape' },
        { id: 'r2', emoji: '⚖️', label: '2ᵉ niveau', value: 'conditionnelle' },
        { id: 'r3', emoji: '✖️', label: 'chemin', value: 'produit' },
        { id: 'r4', emoji: '➕', label: 'événement', value: 'somme des chemins' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître de l’arbre !', title: 'Mission accomplie', message: 'Tu construis un arbre à partir d’une situation, tu lis ses poids comme des conditionnelles, tu multiplies le long des chemins et tu additionnes ceux qui mènent au même résultat.', verbs: ['Construire', 'Lire', 'Multiplier', 'Additionner'], masterBadgeLabel: 'Maître de l’arbre' }} />
  );
}
