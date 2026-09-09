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
 * qu'elle exige, toutes posées par une brique des modules 1 à 5.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 produit scalaire par les coordonnées ....... e1 (seule), e3, e6
 *   P2 par les normes et l'angle .................. e2 (seule), e4
 *   P3 bilinéarité et symétrie .................... e5 (seule), e8
 *   P4 démontrer l'orthogonalité .................. e7 (seule), e6
 *   P5 vecteur normal à une droite ................ e9 (seule), e10
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/scalaireUtils.test.js) : coordonnées croisées et somme des
 * quatre nombres (e1), cosinus oublié (e2), signe perdu (e3), « le produit est
 * une longueur donc positif » (e4), facteur sorti deux fois (e5), points pris
 * pour des vecteurs (e6), couples proches de l'angle droit sans l'être (e7),
 * u·u confondu avec ‖u‖ (e8), normal confondu avec directeur (e9), signe de c
 * inversé (e10).
 */
const EPREUVES = [
  {
    id: 'ps-e1',
    requires: ['formule-coordonnees-scalaire', 'vocab-produit-scalaire'],
    skill: 'coordonnees',
    title: 'Le calcul de base',
    prompt: 'u(5 ; −2) et v(3 ; 4). Combien vaut u · v ?',
    options: ['7', '14', '23', '10'],
    cols: 4,
    correct: 0,
    explain: '5 × 3 + (−2) × 4 = 15 − 8 = 7. Répondre 14, c’est avoir croisé les coordonnées (5 × 4 + (−2) × 3) ; répondre 23, c’est avoir soustrait au lieu d’additionner ; répondre 10, c’est avoir additionné les quatre nombres.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P1'] },
  },
  {
    id: 'ps-e2',
    requires: ['formule-normes-angle', 'vocab-norme'],
    skill: 'angle',
    title: 'Longueurs et angle',
    prompt: 'Deux vecteurs de longueurs 4 et 3 font entre eux un angle de 60°. Combien vaut leur produit scalaire ? (cos 60° = 0,5)',
    options: ['6', '12', '7', '2'],
    cols: 4,
    correct: 0,
    explain: '4 × 3 × 0,5 = 6. Répondre 12, c’est oublier le cosinus — ce serait le résultat pour un angle nul. Répondre 7, c’est additionner les deux longueurs.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P2'] },
  },
  {
    id: 'ps-e3',
    requires: ['formule-coordonnees-scalaire'],
    skill: 'coordonnees',
    title: 'Le signe compte',
    prompt: 'u(2 ; −5) et v(−4 ; 1). Combien vaut u · v ?',
    options: ['−13', '13', '−3', '3'],
    cols: 4,
    correct: 0,
    explain: '2 × (−4) + (−5) × 1 = −8 − 5 = −13. Un produit scalaire négatif signale un angle obtus : les deux flèches penchent de part et d’autre de l’angle droit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P1'] },
  },
  {
    id: 'ps-e4',
    requires: ['formule-normes-angle', 'ombre-signee'],
    skill: 'angle',
    title: 'Ce que le signe raconte',
    prompt: 'Le produit scalaire de deux vecteurs non nuls vaut −8. Que peut-on en déduire sur l’angle qu’ils forment ?',
    options: [
      'Il est supérieur à 90° : son cosinus est négatif',
      'Il est inférieur à 90°',
      'Il vaut exactement 90°',
      'Rien : un produit scalaire est toujours positif',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les deux longueurs sont positives, donc seul le cosinus peut rendre le résultat négatif — et le cosinus n’est négatif qu’au-delà de 90°. Un produit scalaire n’est pas une longueur : il change bel et bien de signe.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P2'] },
  },
  {
    id: 'ps-e5',
    requires: ['regle-bilinearite', 'regle-symetrie-scalaire'],
    skill: 'algebre',
    title: 'Sortir un facteur',
    prompt: 'On sait que u · v = 11. Combien vaut (2u) · v ?',
    options: ['22', '44', '11', '13'],
    cols: 4,
    correct: 0,
    explain: 'Le facteur sort une seule fois : (2u) · v = 2 × (u · v) = 22. Répondre 44, c’est l’avoir sorti deux fois — ce serait (2u) · (2v), où les DEUX vecteurs sont étirés.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P3'] },
  },
  {
    id: 'ps-e6',
    requires: ['regle-coordonnees', 'formule-coordonnees-scalaire', 'methode-demontrer-orthogonal'],
    skill: 'demonstration',
    title: 'De trois points à deux vecteurs',
    prompt: 'A(2 ; 1), B(5 ; 3), C(0 ; 4). Quel est le premier geste pour savoir si l’angle en A est droit ?',
    options: [
      'Calculer AB = (3 ; 2) et AC = (−2 ; 3), puis leur produit scalaire',
      'Calculer directement le produit des coordonnées de B et de C',
      'Mesurer l’angle sur une figure',
      'Comparer les longueurs AB et AC',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un angle est porté par deux vecteurs, pas par deux points : on fabrique d’abord AB et AC par arrivée − départ. Ici 3 × (−2) + 2 × 3 = −6 + 6 = 0, donc l’angle en A est bien droit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P1', 'premiere_specialite_produit-scalaire-definir-1ere_P4'] },
  },
  {
    id: 'ps-e7',
    requires: ['regle-orthogonalite', 'mem-nul-donc-droit'],
    skill: 'demonstration',
    title: 'Lequel est vraiment droit ?',
    prompt: 'Un seul de ces couples est orthogonal. Lequel ?',
    options: [
      'u(6 ; 4) et v(−2 ; 3)',
      'u(6 ; 4) et v(2 ; 3)',
      'u(6 ; 4) et v(3 ; −2)',
      'u(6 ; 4) et v(4 ; 6)',
    ],
    cols: 1,
    correct: 0,
    explain: '6 × (−2) + 4 × 3 = −12 + 12 = 0 : le premier est orthogonal. Les autres donnent 24, 10 et 48 — non nuls, donc pas d’angle droit, quoi qu’en dise l’allure d’une figure.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P4'] },
  },
  {
    id: 'ps-e8',
    requires: ['regle-carre-scalaire', 'formule-norme', 'regle-bilinearite'],
    skill: 'algebre',
    title: 'Une flèche par elle-même',
    prompt: 'u a pour longueur 5. Combien vaut u · u ?',
    options: ['25', '5', '10', '0'],
    cols: 4,
    correct: 0,
    explain: 'u · u = ‖u‖² = 5² = 25. L’angle entre u et lui-même vaut 0°, donc le cosinus vaut 1 et il reste 5 × 5. Répondre 5, c’est donner la longueur elle-même, pas son carré.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P3'] },
  },
  {
    id: 'ps-e9',
    requires: ['regle-equation-cartesienne', 'mem-abc-normal', 'vocab-vecteur-normal'],
    skill: 'droite',
    title: 'Lire un normal',
    prompt: 'Quel vecteur est normal à la droite d’équation 2x + 5y − 10 = 0 ?',
    options: ['(2 ; 5)', '(−5 ; 2)', '(5 ; 2)', '(2 ; −5)'],
    cols: 4,
    correct: 0,
    explain: 'Les deux premiers coefficients, dans l’ordre : n(2 ; 5). Le vecteur (−5 ; 2) est un vecteur DIRECTEUR — il suit la droite au lieu de la traverser. Contrôle : 2 × (−5) + 5 × 2 = 0, les deux sont bien orthogonaux entre eux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P5'] },
  },
  {
    id: 'ps-e10',
    requires: ['methode-equation-par-le-normal', 'regle-equation-cartesienne'],
    skill: 'droite',
    title: 'Écrire la droite',
    prompt: 'Quelle est l’équation de la droite passant par A(3 ; −1) et de vecteur normal n(4 ; −1) ?',
    options: ['4x − y − 13 = 0', '4x − y + 13 = 0', '4x + y − 13 = 0', 'x − 4y − 13 = 0'],
    cols: 2,
    correct: 0,
    explain: 'Le normal donne 4x − y + c = 0. On y remplace A : 4 × 3 − (−1) + c = 12 + 1 + c = 0, donc c = −13. Vérification : 12 + 1 − 13 = 0 ✔. Avec + 13, on obtiendrait 26 en A : la droite raterait le point.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P5'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  coordonnees: { label: 'Par les coordonnées', module: 2 },
  angle: { label: 'Par les normes et l’angle', module: 2 },
  algebre: { label: 'Symétrie et bilinéarité', module: 3 },
  demonstration: { label: 'Démontrer l’orthogonalité', module: 4 },
  droite: { label: 'Vecteur normal à une droite', module: 5 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Calculateur de coordonnées', test: (m) => !m.coordonnees },
  { id: 'b2', emoji: '🏅', label: 'Maître du cosinus', test: (m) => !m.angle },
  { id: 'b3', emoji: '🏅', label: 'Algébriste des flèches', test: (m) => !m.algebre },
  { id: 'b4', emoji: '🏅', label: 'Démonstrateur d’angles droits', test: (m) => !m.demonstration },
  { id: 'b5', emoji: '🏅', label: 'Lecteur de droites', test: (m) => !m.droite },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de l’angle droit', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLAngleDroit() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’angle droit"
      moduleSubtitle="Dix épreuves : deux formules, une algèbre, un critère, une droite"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de l’angle droit',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : regarder ce que l’énoncé donne avant de
            choisir sa formule — et se souvenir qu’un résultat nul, c’est un angle droit démontré.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🧮', label: 'coordonnées', value: 'x·x′ + y·y′' },
        { id: 'r2', emoji: '📐', label: 'normes et angle', value: '‖u‖ ‖v‖ cos' },
        { id: 'r3', emoji: '⇄', label: 'algèbre', value: 'le facteur sort une fois' },
        { id: 'r4', emoji: '⊥', label: 'angle droit', value: 'u · v = 0' },
        { id: 'r5', emoji: '📏', label: 'droite', value: 'ax + by + c = 0 → n(a ; b)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de l’angle droit !',
        title: 'Mission accomplie',
        message: 'Tu sais calculer un produit scalaire de deux façons, le transformer comme une expression algébrique, démontrer une orthogonalité et écrire une droite à partir d’un vecteur normal.',
        verbs: ['Calculer', 'Transformer', 'Démontrer', 'Écrire'],
        masterBadgeLabel: 'Maître de l’angle droit',
      }}
    />
  );
}
