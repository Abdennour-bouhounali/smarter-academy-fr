import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation, options
 * et distracteurs compris — et chaque épreuve déclare les connaissances
 * qu'elle exige, toutes posées par une brique des modules 1 à 5 ou par les
 * `priorKnowledge`.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 calculer un angle ......................... e1 (seule), e2, e3
 *   P2 calculer une distance ..................... e4 (seule), e5, e7
 *   P3 équation sous forme normale ............... e6 (seule), e7
 *   P4 démontrer alignement / orthogonalité ...... e8 (seule), e9
 *   P5 nature d'un triangle ...................... e10 (seule), e9
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/theodoliteUtils.test.js, bloc « LE BOSS ») : le produit scalaire
 * pris pour un cosinus (e1), l'angle complémentaire (e2), le signe du cosinus
 * perdu (e3), le carré confondu avec la somme des coordonnées (e4), Pythagore
 * appliqué à un triangle non rectangle (e5), le signe de c inversé et le
 * normal pris pour le directeur (e6), la division par ‖n‖ oubliée (e7), le
 * produit scalaire employé pour un alignement (e8), les deux critères
 * confondus (e9), l'isocélie décidée sur des racines arrondies (e10).
 */
const EPREUVES = [
  {
    id: 'psm-e1',
    requires: ['formule-cosinus-angle', 'mem-cosinus-angle', 'formule-coordonnees-scalaire'],
    skill: 'angle',
    title: 'Le cosinus, pas le produit',
    prompt: 'u(3 ; 4) et v(5 ; 0). Combien vaut le cosinus de l’angle entre ces deux vecteurs ?',
    options: ['0,6', '15', '3', '0,8'],
    cols: 4,
    correct: 0,
    explain: 'u · v = 3 × 5 + 4 × 0 = 15, puis ‖u‖ = 5 et ‖v‖ = 5, donc ‖u‖ × ‖v‖ = 25. Le cosinus vaut 15 ÷ 25 = 0,6. Répondre 15, c’est s’arrêter au produit scalaire ; répondre 3, c’est n’avoir divisé que par une seule norme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P1'] },
  },
  {
    id: 'psm-e2',
    requires: ['formule-cosinus-angle', 'methode-calculer-un-angle'],
    skill: 'angle',
    title: 'Du cosinus à l’angle',
    prompt: 'Le cosinus de l’angle entre deux vecteurs vaut 0,5. Combien mesure cet angle ?',
    options: ['60°', '30°', '45°', '120°'],
    cols: 4,
    correct: 0,
    explain: 'L’angle dont le cosinus vaut 0,5 mesure 60°. Répondre 30°, c’est avoir confondu avec le SINUS ; répondre 120°, c’est l’angle dont le cosinus vaut −0,5.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P1'] },
  },
  {
    id: 'psm-e3',
    requires: ['regle-signe-cosinus', 'formule-coordonnees-scalaire'],
    skill: 'angle',
    title: 'Ce que le signe raconte',
    prompt: 'u(−2 ; 6) et v(4 ; 1). Que peut-on dire de l’angle entre ces deux vecteurs, sans calculatrice ?',
    options: [
      'Il dépasse 90° : le produit scalaire vaut −2, donc le cosinus est négatif',
      'Il est inférieur à 90° : le produit scalaire est petit',
      'Il vaut exactement 90° : le produit scalaire est presque nul',
      'On ne peut rien dire sans calculer les deux normes',
    ],
    cols: 1,
    correct: 0,
    explain: '(−2) × 4 + 6 × 1 = −8 + 6 = −2. Les deux normes étant positives, seul le cosinus peut rendre ce résultat négatif — et un cosinus négatif signifie plus de 90°. « Presque nul » n’est pas nul : −2 et 0 sont deux nombres différents.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P1'] },
  },
  {
    id: 'psm-e4',
    requires: ['formule-carre-scalaire-longueur', 'mem-carre-scalaire', 'regle-coordonnees'],
    skill: 'longueur',
    title: 'Le carré d’un côté',
    prompt: 'A(−2 ; 1) et B(3 ; −5). Combien vaut AB² ?',
    options: ['61', '11', '1', '30'],
    cols: 4,
    correct: 0,
    explain: 'AB = (3 − (−2) ; −5 − 1) = (5 ; −6), donc AB² = 5² + (−6)² = 25 + 36 = 61. Répondre 1, c’est avoir additionné 5 et −6 ; répondre 30, c’est avoir multiplié 5 par 6 ; répondre 11, c’est avoir additionné 5 et 6.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P2'] },
  },
  {
    id: 'psm-e5',
    requires: ['regle-al-kashi', 'formule-carre-scalaire-longueur'],
    skill: 'longueur',
    title: 'Sans coordonnées',
    prompt: 'Dans un triangle ABC : AB = 8, AC = 3, et l’angle en A mesure 60° (son cosinus vaut 0,5). Combien mesure BC ?',
    options: ['7', '73', '49', '11'],
    cols: 4,
    correct: 0,
    explain: 'BC² = 64 + 9 − 2 × 8 × 3 × 0,5 = 73 − 24 = 49, donc BC = 7. Répondre 73, c’est avoir appliqué Pythagore à un triangle qui n’est pas rectangle ; répondre 49, c’est s’être arrêté au carré ; répondre 11, c’est avoir additionné les deux côtés.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P2'] },
  },
  {
    id: 'psm-e6',
    requires: ['regle-forme-normale', 'methode-ecrire-forme-normale', 'mem-forme-normale'],
    skill: 'droite',
    title: 'Écrire la droite',
    prompt: 'Quelle est l’équation de la droite passant par P(2 ; −1) et de vecteur normal n(5 ; −3) ?',
    options: ['5x − 3y − 13 = 0', '5x − 3y + 13 = 0', '−3x − 5y − 13 = 0', '5x + 3y − 13 = 0'],
    cols: 2,
    correct: 0,
    explain: '5(x − 2) − 3(y + 1) = 0, soit 5x − 10 − 3y − 3 = 0, donc 5x − 3y − 13 = 0. Contrôle en P : 10 + 3 − 13 = 0 ✔ Avec + 13 on trouverait 26 : la droite raterait le point. Et −3x − 5y a échangé les deux coordonnées du normal.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P3'] },
  },
  {
    id: 'psm-e7',
    requires: ['formule-distance-point-droite', 'regle-forme-normale', 'formule-norme'],
    skill: 'droite',
    title: 'À quelle distance ?',
    prompt: 'Quelle est la distance du point M(1 ; 1) à la droite d’équation 3x + 4y − 2 = 0 ?',
    options: ['1', '5', '−1', '25'],
    cols: 4,
    correct: 0,
    explain: 'Le numérateur vaut |3 + 4 − 2| = 5, et √(3² + 4²) = 5. La distance vaut donc 5 ÷ 5 = 1. Répondre 5, c’est avoir oublié de diviser ; répondre −1, c’est avoir oublié la valeur absolue — une distance n’est jamais négative.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P2', 'premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P3'] },
  },
  {
    id: 'psm-e8',
    requires: ['regle-deux-criteres', 'regle-colineaire'],
    skill: 'demonstration',
    title: 'Le bon critère',
    prompt: 'R(−2 ; −3), S(1 ; 1), T(4 ; 5). Quel calcul démontre que ces trois points sont alignés ?',
    options: [
      'Montrer que RS(3 ; 4) et RT(6 ; 8) sont colinéaires : RT = 2 × RS',
      'Montrer que RS · RT = 0',
      'Montrer que RS et RT ont la même longueur',
      'Montrer que RS · RT = 50',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’alignement est une affaire de DIRECTION : les deux flèches doivent être colinéaires, et ici RT vaut exactement 2 × RS. Le produit scalaire ne répond pas à cette question — il vaut d’ailleurs 50, un nombre qui ne prouve rien du tout ici.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P4'] },
  },
  {
    id: 'psm-e9',
    requires: ['methode-demontrer-perpendiculaire', 'methode-nature-triangle', 'regle-orthogonalite'],
    skill: 'demonstration',
    title: 'Deux choses à prouver',
    prompt: 'On veut démontrer que la droite (PH) est la hauteur issue de P dans le triangle PQR. Que faut-il établir ?',
    options: [
      'Que PH · QR = 0, ET que H appartient bien à la droite (QR)',
      'Que PH · QR = 0, cela suffit',
      'Que PH et QR ont la même longueur',
      'Que PH et QR sont colinéaires',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un produit scalaire nul parle de DIRECTIONS, pas de positions : il resterait nul en déplaçant H loin de (QR). Une hauteur doit en plus rencontrer le côté opposé, ce que l’on démontre en montrant que QH et QR sont colinéaires. Deux affirmations, deux calculs.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P4', 'premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P5'] },
  },
  {
    id: 'psm-e10',
    requires: ['methode-nature-triangle', 'regle-carres-entiers', 'mem-le-calcul-tranche'],
    skill: 'nature',
    title: 'Le verdict',
    prompt: 'U(0 ; 0), V(6 ; 2), W(2 ; 6). Quelle est la nature du triangle UVW ?',
    options: [
      'Isocèle, non rectangle : UV² = UW² = 40, et aucun produit scalaire n’est nul',
      'Rectangle en U : les deux côtés issus de U sont en travers',
      'Rectangle et isocèle en U',
      'Quelconque : les trois côtés ont des longueurs différentes',
    ],
    cols: 1,
    correct: 0,
    explain: 'UV² = 36 + 4 = 40 et UW² = 4 + 36 = 40 : deux carrés égaux, donc isocèle. Mais UV · UW = 6 × 2 + 2 × 6 = 24, non nul : l’angle en U n’est pas droit. Les six calculs sont nécessaires — trois carrés et trois produits.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-mesurer-demontrer-1ere_P5'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  angle: { label: 'Mesurer un angle', module: 2 },
  longueur: { label: 'Mesurer une distance', module: 3 },
  droite: { label: 'Écrire une droite par son normal', module: 4 },
  demonstration: { label: 'Démontrer', module: 5 },
  nature: { label: 'Trancher la nature d’une figure', module: 5 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Rapporteur de poche', test: (m) => !m.angle },
  { id: 'b2', emoji: '🏅', label: 'Règle invisible', test: (m) => !m.longueur },
  { id: 'b3', emoji: '🏅', label: 'Traceur de droites', test: (m) => !m.droite },
  { id: 'b4', emoji: '🏅', label: 'Démonstrateur', test: (m) => !m.demonstration },
  { id: 'b5', emoji: '🏅', label: 'Juge des figures', test: (m) => !m.nature },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de l’instrument', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLInstrument() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’instrument"
      moduleSubtitle="Dix épreuves : un angle, une distance, une droite, deux démonstrations"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de l’instrument',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : identifier ce que l’énoncé demande —
            un angle, une longueur, une droite, une preuve — avant de choisir son calcul. Et ne
            jamais conclure d’après l’allure d’une figure.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📐', label: 'angle', value: 'cos θ = (u · v) ÷ (‖u‖ ‖v‖)' },
        { id: 'r2', emoji: '📏', label: 'longueur', value: 'AB · AB = AB²' },
        { id: 'r3', emoji: '🔺', label: 'Al-Kashi', value: 'BC² = AB² + AC² − 2 AB·AC cos Â' },
        { id: 'r4', emoji: '⊥', label: 'droite', value: 'a(x − x₀) + b(y − y₀) = 0' },
        { id: 'r5', emoji: '⚖️', label: 'preuve', value: '0 exact, jamais « presque »' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de l’instrument !',
        title: 'Mission accomplie',
        message: 'Tu sais mesurer un angle et une distance sans instrument, écrire une droite à partir d’un point et d’un vecteur normal, calculer la distance d’un point à cette droite, et démontrer la nature d’une figure au lieu de la deviner.',
        verbs: ['Mesurer', 'Écrire', 'Démontrer', 'Trancher'],
        masterBadgeLabel: 'Maître de l’instrument',
      }}
    />
  );
}
