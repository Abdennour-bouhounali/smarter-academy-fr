import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import VectorScene, { SCENE_COLORS } from '../components/VectorScene';
import { SCENES, RANGE, add, vec } from '../components/vecteurUtils';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque
 * distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - même arrivée ≠ même vecteur (M1) ; sens contraire pris pour une autre
 *     direction (M2) ; départ − arrivée et coordonnées échangées (M3) ;
 *   - somme « plus longue », signe oublié (M4) ; k négatif « change la
 *     direction », ×k sur une seule coordonnée (M5) ;
 *   - ‖u‖ = x + y, racine oubliée, milieu = différence/2 (M6) ;
 *   - ordre des sommets du parallélogramme (M8).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 14 LPs sont tous couverts.
 */
const EPREUVES = [
  {
    id: 'vec-e1',
    skill: 'egalite',
    title: 'Le même vecteur ?',
    prompt: 'Une flèche va de (−4 ; 1) à (−1 ; 3). Une autre va de (2 ; −2) à (5 ; 0). Représentent-elles le même vecteur ?',
    options: [
      'Oui : les deux valent (3 ; 2)',
      'Non : elles ne partent pas du même point',
      'Non : elles n’arrivent pas au même point',
      'Oui, mais seulement leur direction est commune',
    ],
    cols: 1,
    requires: ['egalite-vecteurs', 'regle-coordonnees'],
    explain: 'Premier : −1 − (−4) = 3 et 3 − 1 = 2. Second : 5 − 2 = 3 et 0 − (−2) = 2. Mêmes coordonnées, donc même vecteur — l’endroit ne compte pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P1'] },
  },
  {
    id: 'vec-e2',
    skill: 'egalite',
    title: 'Le vecteur nul',
    prompt: 'Lequel de ces vecteurs est le vecteur nul ?',
    options: ['AB + BA', 'AB + AB', 'AB − BA', 'AB + BC'],
    cols: 2,
    requires: ['vecteur-nul', 'regle-vecteur-oppose', 'regle-somme', 'vocab-relation-chasles'],
    explain: 'AB + BA = AA : aller puis revenir, on n’a pas bougé — c’est le vecteur nul. AB − BA = 2·AB, et AB + BC = AC (Chasles).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P2', 'seconde_vecteurs-2nde_P4'] },
  },
  {
    id: 'vec-e3',
    skill: 'egalite',
    title: 'Un représentant',
    prompt: 'u a pour coordonnées (2 ; −1). Le représentant de u qui part de C (1 ; 3) arrive en…',
    options: ['(3 ; 2)', '(−1 ; 4)', '(2 ; −1)', '(3 ; 4)'],
    cols: 4,
    requires: ['vocab-representant', 'coordonnees-vecteur'],
    explain: 'On ajoute les coordonnées du vecteur à celles du point : 1 + 2 = 3 et 3 + (−1) = 2. (2 ; −1) est le vecteur lui-même, pas un point d’arrivée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P3'] },
  },
  {
    id: 'vec-e4',
    skill: 'somme',
    title: 'Une somme',
    prompt: 'u (3 ; −1) et v (−5 ; 4). Coordonnées de u + v ?',
    options: ['(−2 ; 3)', '(8 ; −5)', '(−2 ; −5)', '(−15 ; −4)'],
    cols: 4,
    requires: ['regle-somme', 'formule-somme'],
    explain: 'On ajoute coordonnée par coordonnée, avec les signes : 3 + (−5) = −2 et −1 + 4 = 3.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P4', 'seconde_vecteurs-2nde_P9'] },
  },
  {
    id: 'vec-e5',
    skill: 'produit',
    title: 'Un produit par un réel',
    prompt: 'u (1 ; −3). Que vaut −2·u, et que devient la flèche ?',
    options: [
      '(−2 ; 6) : deux fois plus longue, même direction, sens contraire',
      '(−2 ; 6) : deux fois plus longue, autre direction',
      '(−2 ; −3) : seule l’abscisse est multipliée',
      '(2 ; −6) : deux fois plus longue, même sens',
    ],
    cols: 1,
    requires: ['regle-produit-reel'],
    explain: '−2 × 1 = −2 et −2 × (−3) = 6. Un réel négatif retourne le sens mais garde la DIRECTION (la droite suivie), et il multiplie les deux coordonnées.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P5', 'seconde_vecteurs-2nde_P9'] },
  },
  {
    id: 'vec-e6',
    skill: 'produit',
    title: 'Colinéaires ?',
    prompt: 'Quelle paire de vecteurs est colinéaire ?',
    options: ['(2 ; 3) et (−4 ; −6)', '(2 ; 3) et (3 ; 2)', '(2 ; 3) et (4 ; 5)', '(2 ; 3) et (−2 ; 3)'],
    cols: 2,
    requires: ['regle-colineaire', 'regle-produit-reel'],
    explain: '(−4 ; −6) = −2 × (2 ; 3) : l’un est un multiple de l’autre, même direction. Aucune des autres paires n’a un facteur commun aux deux coordonnées.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P6'] },
  },
  {
    id: 'vec-e7',
    skill: 'coordonnees',
    title: 'Dans la base',
    prompt: 'Dans une base orthonormée (i, j), le vecteur 2i − 3j a pour coordonnées…',
    options: ['(2 ; −3)', '(−3 ; 2)', '(2 ; 3)', '(−1 ; 0)'],
    cols: 4,
    requires: ['vocab-base-orthonormee', 'coordonnees-vecteur'],
    explain: 'Le coefficient de i est l’abscisse, celui de j l’ordonnée : 2 vers la droite, 3 vers le bas, soit (2 ; −3).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P7', 'seconde_vecteurs-2nde_P8'] },
  },
  {
    id: 'vec-e8',
    skill: 'norme',
    title: 'Coordonnées et norme de AB',
    prompt: 'A (−1 ; 2) et B (3 ; −1). Coordonnées de AB, puis sa norme ?',
    options: ['AB (4 ; −3), ‖AB‖ = 5', 'AB (−4 ; 3), ‖AB‖ = 5', 'AB (4 ; −3), ‖AB‖ = 1', 'AB (4 ; −3), ‖AB‖ = 25'],
    cols: 1,
    requires: ['regle-coordonnees', 'methode-calcul-norme'],
    explain: 'Arrivée moins départ : 3 − (−1) = 4 et −1 − 2 = −3. Norme : √(4² + (−3)²) = √25 = 5. (−4 ; 3) est BA ; 1 = 4 − 3 et 25 = AB² ne sont pas des longueurs de flèche.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P11', 'seconde_vecteurs-2nde_P10'] },
  },
  {
    id: 'vec-e9',
    skill: 'norme',
    title: 'Distance et milieu',
    prompt: 'C (−3 ; 4) et D (3 ; −4). Distance CD, et milieu de [CD] ?',
    options: ['CD = 10, milieu (0 ; 0)', 'CD = 14, milieu (0 ; 0)', 'CD = 10, milieu (3 ; −4)', 'CD = 100, milieu (−3 ; 4)'],
    cols: 1,
    requires: ['methode-calcul-norme', 'methode-milieu'],
    explain: 'CD (6 ; −8) : √(36 + 64) = √100 = 10. Milieu : ((−3 + 3)/2 ; (4 + (−4))/2) = (0 ; 0). 14 est 6 + 8 (les marches ne s’ajoutent pas), 100 est CD².',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P12', 'seconde_vecteurs-2nde_P13'] },
  },
  {
    id: 'vec-e10',
    skill: 'probleme',
    title: 'Fermer un parallélogramme',
    prompt: 'A (0 ; 0), B (3 ; 1), C (2 ; 4). Où placer D pour que ABCD (dans cet ordre) soit un parallélogramme ?',
    options: ['(−1 ; 3)', '(5 ; 5)', '(1 ; −3)', '(3 ; 1)'],
    cols: 4,
    requires: ['methode-parallelogramme', 'egalite-vecteurs'],
    explain: 'ABCD parallélogramme ⟺ AB = DC. AB = (3 ; 1), donc D = C − AB = (2 − 3 ; 4 − 1) = (−1 ; 3). (5 ; 5) ferme ABDC, pas ABCD : l’ordre des sommets compte.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_vecteurs-2nde_P14', 'seconde_vecteurs-2nde_P1'] },
  },
];

const SKILLS = {
  egalite: { label: 'Vecteurs égaux, nul, représentants', module: 2 },
  coordonnees: { label: 'Base et coordonnées', module: 3 },
  somme: { label: 'Somme', module: 4 },
  produit: { label: 'Produit par un réel, colinéarité', module: 5 },
  norme: { label: 'Norme, distance, milieu', module: 6 },
  probleme: { label: 'Résoudre', module: 7 },
};

const BADGES = [
  { id: 'b-egal', emoji: '🏅', label: 'La flèche voyage', test: (m) => !m.egalite },
  { id: 'b-coord', emoji: '🏅', label: 'Deux nombres suffisent', test: (m) => !m.coordonnees },
  { id: 'b-somme', emoji: '🏅', label: 'Bout à bout', test: (m) => !m.somme },
  { id: 'b-prod', emoji: '🏅', label: 'Maître du facteur k', test: (m) => !m.produit },
  { id: 'b-norme', emoji: '🏅', label: 'Pythagore dans l’escalier', test: (m) => !m.norme },
  { id: 'b-prob', emoji: '🏅', label: 'Constructeur', test: (m) => !m.probleme },
  { id: 'b-parfait', emoji: '💎', label: 'Chef du dépôt', test: (m) => Object.keys(m).length === 0 },
];

/** La synthèse : le dépôt, figé — deux robots, une recette, une somme. */

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le dépôt"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises les vecteurs"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Chef du dépôt',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, demande-toi d’abord : de
            combien se déplace-t-on, horizontalement puis verticalement ?
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '➡️', label: 'Vecteur', value: 'un déplacement' },
        { id: 'r2', emoji: '🔢', label: 'Coordonnées', value: 'arrivée − départ' },
        { id: 'r3', emoji: '➕', label: 'Somme', value: 'bout à bout' },
        { id: 'r4', emoji: '📐', label: 'Norme', value: '√(x² + y²)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Chef du dépôt !',
        title: 'Mission accomplie',
        message: 'Tu sais décrire, calculer, combiner et construire avec des vecteurs.',
        verbs: ['Décrire', 'Calculer', 'Combiner', 'Construire'],
        masterBadgeLabel: 'Chef du dépôt',
      }}
    />
  );
}
