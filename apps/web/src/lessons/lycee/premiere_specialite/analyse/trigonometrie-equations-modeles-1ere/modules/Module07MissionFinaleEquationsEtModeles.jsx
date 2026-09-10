import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation, options
 * et distracteurs compris — et chaque épreuve déclare les connaissances
 * qu'elle exige, toutes posées par une brique des modules 2 à 6 ou par les
 * `priorKnowledge` de la Seconde et de la partie 1 de ce chapitre.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 résoudre cos x = k ..................... e1 (seule), e2, e3
 *   P2 résoudre sin x = k ..................... e4 (seule), e5
 *   P3 inéquation ............................. e6 (seule), e7
 *   P4 formules d'addition .................... e8 (seule)
 *   P5 formules de duplication ................ e9 (seule), e8
 *   P6 modéliser .............................. e10 (seule)
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/trigEqUtils.test.js) : le « + 2kπ » oublié (e1), une seule
 * branche (e2), un pas de kπ au lieu de 2kπ (e3), la règle du cosinus
 * appliquée au sinus (e4, e5), l'arc pris pour deux points (e6), le côté
 * inversé (e7), les produits non croisés (e8), « cos 2a = 2 cos a » (e9), et
 * le maximum pris pour l'amplitude (e10).
 *
 * PÉRIMÈTRE : aucune épreuve ne demande de dériver une fonction
 * trigonométrique ni de linéariser — c'est la Terminale.
 */
const EPREUVES = [
  {
    id: 'te-e1',
    requires: ['solutions-sur-r', 'methode-cos-sur-r', 'mem-plus-deux-k-pi', 'valeurs-remarquables'],
    skill: 'cos',
    title: 'Toutes les solutions',
    prompt: 'On résout cos x = 1/2 sur ℝ. Sachant que cos(π/3) = 1/2, l’ensemble des solutions s’écrit…',
    options: [
      'x = π/3 + 2kπ ou x = −π/3 + 2kπ, avec k entier',
      'x = π/3 ou x = −π/3',
      'x = π/3 + 2kπ seulement',
      'x = π/3 uniquement',
    ],
    cols: 1,
    correct: 0,
    explain: 'Il faut les DEUX branches (le cercle donne deux points) ET le « + 2kπ » sur chacune. Sans lui, on n’écrit que deux solutions sur une infinité.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P1'] },
  },
  {
    id: 'te-e2',
    requires: ['solutions-sur-r', 'regle-hors-bornes', 'regle-borne-un'],
    skill: 'cos',
    title: 'Hors d’atteinte',
    prompt: 'Combien de réels x vérifient cos x = 1,3 ?',
    options: ['Aucun', 'Deux', 'Une infinité', 'Un seul'],
    cols: 4,
    correct: 0,
    explain: 'Le cosinus ne dépasse jamais 1 : la barre de hauteur 1,3 passe entièrement au-dessus de la courbe, et ne la rencontre jamais. Aucune solution, ni sur un tour ni sur ℝ.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P1'] },
  },
  {
    id: 'te-e3',
    requires: ['solutions-sur-r', 'methode-cos-sur-r', 'periodicite'],
    skill: 'cos',
    title: 'Le bon écart',
    prompt: 'Dans l’écriture d’une famille de solutions, pourquoi écrit-on « + 2kπ » et non « + kπ » ?',
    options: [
      'Parce qu’il faut un TOUR complet pour revenir au même point du cercle : un demi-tour amène ailleurs',
      'Parce que c’est plus simple à écrire',
      'Parce qu’il y a deux branches',
      'Parce que k doit être pair',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un demi-tour (π) amène au point diamétralement opposé, dont l’abscisse est l’opposée : cos(x + π) = −cos x. Il faut bien un tour entier, 2π, pour retrouver la même valeur. Le nombre de branches, lui, est une question différente.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P1'] },
  },
  {
    id: 'te-e4',
    requires: ['methode-sin-sur-r', 'regle-deux-familles-differentes', 'mem-cos-moins-a-sin-pi-moins-a', 'valeurs-remarquables'],
    skill: 'sin',
    title: 'L’autre symétrie',
    prompt: 'On résout sin x = 1/2 sur ℝ. Sachant que sin(π/6) = 1/2, l’ensemble des solutions s’écrit…',
    options: [
      'x = π/6 + 2kπ ou x = 5π/6 + 2kπ',
      'x = π/6 + 2kπ ou x = −π/6 + 2kπ',
      'x = π/6 + 2kπ seulement',
      'x = π/6 + kπ ou x = 5π/6 + kπ',
    ],
    cols: 1,
    correct: 0,
    explain: 'Pour le sinus, la deuxième branche est π − a, et non −a : π − π/6 = 5π/6. Répondre −π/6 revient à appliquer la règle du COSINUS — et sin(−π/6) vaut −1/2, pas 1/2.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P2'] },
  },
  {
    id: 'te-e5',
    requires: ['regle-deux-familles-differentes', 'mem-cos-moins-a-sin-pi-moins-a', 'methode-sin-sur-r'],
    skill: 'sin',
    title: 'Le contrôle par la somme',
    prompt: 'Deux réels d’un même tour sont solutions de sin x = 0,8. Combien vaut leur somme ?',
    options: ['π', '2π', '0', '0,8'],
    cols: 4,
    correct: 0,
    explain: 'Pour le sinus, les deux solutions d’un tour sont a et π − a : leur somme vaut donc π, toujours. La somme 2π est le contrôle du cosinus, dont les deux solutions sont a et 2π − a.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P2'] },
  },
  {
    id: 'te-e6',
    requires: ['inequation-arc', 'methode-inequation-trigo', 'inequation-infinite'],
    skill: 'inequation',
    title: 'Points ou morceau ?',
    prompt: 'Quelle est la différence entre l’ensemble solution de cos x = 1/2 et celui de cos x ⩾ 1/2, sur un tour ?',
    options: [
      'Le premier est fait de deux points isolés, le second d’un morceau de cercle qui contient une infinité de réels',
      'Il n’y a aucune différence',
      'Le premier contient plus de réels que le second',
      'Le second est fait de deux points, le premier d’un morceau de cercle',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un signe = ne retient que les réels où la courbe TOUCHE la barre : deux par tour. Un signe ⩾ retient tous ceux où elle est au-dessus, c’est-à-dire tout un morceau — un arc. Les deux points de l’égalité en sont les bornes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P3'] },
  },
  {
    id: 'te-e7',
    requires: ['methode-inequation-trigo', 'inequation-arc', 'regle-arc-se-repete'],
    skill: 'inequation',
    title: 'De quel côté ?',
    prompt: 'Sur [0 ; 2π[, on résout cos x ⩽ 1/2. Les bornes sont π/3 et 5π/3. Quel est l’ensemble solution ?',
    options: [
      '[π/3 ; 5π/3] — l’arc qui entoure π',
      '[0 ; π/3] ∪ [5π/3 ; 2π[ — l’arc qui entoure 0',
      'Les deux réels π/3 et 5π/3',
      'Tout l’intervalle [0 ; 2π[',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le cosinus est PETIT (proche de −1) autour de π, et grand autour de 0. Un signe ⩽ retient donc l’arc du milieu, [π/3 ; 5π/3]. L’arc qui entoure 0 est la réponse à l’inégalité de sens contraire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P3'] },
  },
  {
    id: 'te-e8',
    requires: ['formules-addition', 'formules-duplication'],
    skill: 'formules',
    title: 'Les produits croisés',
    prompt: 'Pour tous réels a et b, sin(a + b) est égal à…',
    options: [
      'sin a cos b + cos a sin b',
      'sin a cos b − cos a sin b',
      'sin a sin b + cos a cos b',
      'sin a + sin b',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le sinus additionne les deux produits CROISÉS. Le signe moins et les produits non croisés appartiennent à la formule du cosinus. Et sin(a + b) n’est jamais sin a + sin b.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P4'] },
  },
  {
    id: 'te-e9',
    requires: ['formules-duplication', 'methode-poser-b-egale-a', 'regle-cos-2a-nest-pas-2cos-a', 'mem-poser-b-egale-a'],
    skill: 'duplication',
    title: 'Doubler le réel',
    prompt: 'On sait que cos a = 0,6 et sin a = 0,8. Que vaut cos 2a ?',
    options: ['−0,28', '1,2', '0,48', '1,4'],
    cols: 4,
    correct: 0,
    explain: 'cos 2a = cos²a − sin²a = 0,36 − 0,64 = −0,28. Répondre 1,2, c’est écrire « 2 cos a », ce qui est faux. Et 0,48 serait 2 sin a cos a, c’est-à-dire sin 2a.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P5'] },
  },
  {
    id: 'te-e10',
    requires: ['modele-periodique', 'methode-lire-amplitude-periode', 'regle-amplitude-et-periode-independantes'],
    skill: 'modeliser',
    title: 'Lire un cycle',
    prompt: 'La hauteur d’eau d’un port monte à 7 m et descend à 3 m, et le cycle dure 12 h. Quelle est l’amplitude ?',
    options: ['2 m', '7 m', '4 m', '12 m'],
    cols: 4,
    correct: 0,
    explain: 'L’amplitude est la MOITIÉ de l’écart entre le maximum et le minimum : (7 − 3) / 2 = 2 m. Le niveau moyen vaut 5 m, et l’eau s’en écarte de 2 m dans chaque sens. Répondre 7, c’est donner le maximum ; répondre 4, l’écart entier ; répondre 12, la durée du cycle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P6'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  cos: { label: 'Résoudre cos x = k', module: 2 },
  sin: { label: 'Résoudre sin x = k', module: 3 },
  inequation: { label: 'Inéquations', module: 4 },
  formules: { label: 'Formules d’addition', module: 5 },
  duplication: { label: 'Duplication', module: 5 },
  modeliser: { label: 'Modéliser un cycle', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Chasseur de familles', test: (m) => !m.cos },
  { id: 'b2', emoji: '🏅', label: 'Maître des deux symétries', test: (m) => !m.sin },
  { id: 'b3', emoji: '🏅', label: 'Coloriste d’arcs', test: (m) => !m.inequation },
  { id: 'b4', emoji: '🏅', label: 'Duplicateur d’angles', test: (m) => !m.formules && !m.duplication },
  { id: 'b5', emoji: '🏅', label: 'Lecteur de cycles', test: (m) => !m.modeliser },
  { id: 'b-parfait', emoji: '💎', label: 'Équations et modèles', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleEquationsEtModeles() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : équations et modèles"
      moduleSubtitle="Dix épreuves : décrire, colorier, dupliquer, régler"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Équations et modèles',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Trois réflexes : ne jamais oublier le{' '}
            <strong>+ 2kπ</strong>, se rappeler que le sinus prend <strong>π − a</strong> et
            non −a, et lire une amplitude <strong>depuis le niveau moyen</strong>.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🔁', label: 'cos x = k', value: '±a + 2kπ' },
        { id: 'r2', emoji: '🪞', label: 'sin x = k', value: 'a et π − a, + 2kπ' },
        { id: 'r3', emoji: '🌈', label: 'inégalité', value: 'un arc, pas des points' },
        { id: 'r4', emoji: '✖️', label: 'cos 2a', value: 'cos²a − sin²a' },
        { id: 'r5', emoji: '🌊', label: 'amplitude', value: '(max − min) / 2' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Équations et modèles !',
        title: 'Mission accomplie',
        message: 'Tu sais décrire une famille infinie de solutions, lire l’arc d’une inéquation, retrouver les formules de duplication et décrire un phénomène qui se répète.',
        verbs: ['Décrire', 'Colorier', 'Dupliquer', 'Régler'],
        masterBadgeLabel: 'Équations et modèles',
      }}
    />
  );
}
