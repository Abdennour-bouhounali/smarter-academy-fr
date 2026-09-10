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
 * et distracteurs compris — et chaque épreuve déclare les connaissances qu'elle
 * exige, toutes posées par une brique des modules 1 à 5 ou par le
 * `priorKnowledge` de la leçon.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 calculer une conditionnelle ....... e1 (seule), e2
 *   P2 interpréter une conditionnelle .... e3 (seule), e2, e4
 *   P3 construire un arbre ............... e5 (seule), e6
 *   P4 exploiter un arbre ................ e7 (seule), e6, e8
 *   P5 probabilités totales .............. e9 (seule), e8, e10
 *
 * DISTRACTEURS, tous CALCULÉS et vérifiés distincts — en fraction exacte ET
 * après mise en forme en pourcentage (data.js `BOSS_NUMBERS`,
 * components/condUtils.test.js). Chacun est une erreur que la leçon a nommée :
 *   e1  prendre la population entière pour dénominateur
 *   e2  inverser le conditionnement (99 % au lieu de 33,3 %)
 *   e3  une phrase qui change de population de référence
 *   e4  attribuer le renversement à un défaut du test
 *   e5  reconnaître un poids à sa valeur au lieu de sa place
 *   e6  contrôler un arbre par autre chose que la somme des branches
 *   e7  additionner le long d'un chemin au lieu de multiplier
 *   e8  ne retenir qu'un seul des chemins
 *   e9  moyenner les taux au lieu de les pondérer
 *   e10 appliquer la formule sur des cas qui se chevauchent
 */
const EPREUVES = [
  {
    id: 'pc-e1',
    requires: ['conditionnelle-sur-effectifs', 'univers-restreint', 'denominateur'],
    skill: 'calculer',
    title: 'Le bon dénominateur',
    prompt: 'Dans une entreprise de 800 salariés, 240 travaillent à distance et 60 de ceux-là habitent une autre région. On choisit un salarié travaillant à distance : quelle est la probabilité qu’il habite une autre région ?',
    options: ['25 %', '7,5 %', '30 %', '75 %'],
    cols: 4,
    correct: 0,
    explain: 'On ne choisit que parmi les 240 salariés à distance : 60 ÷ 240 = 0,25, soit 25 %. Répondre 7,5 %, c’est avoir divisé par les 800 salariés — une autre question.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P1'] },
  },
  {
    id: 'pc-e2',
    requires: ['conditionnelle-sur-effectifs', 'paradoxe-depistage', 'inversion'],
    skill: 'calculer',
    title: 'Le test positif',
    prompt: 'Sur 100 000 personnes testées, 990 sont malades avec un test positif et 1 980 sont en bonne santé avec un test positif. Une personne a un test positif : quelle est la probabilité qu’elle soit malade ?',
    options: ['33,3 %', '99 %', '1 %', '66,7 %'],
    cols: 4,
    correct: 0,
    explain: 'Le groupe de référence est celui des tests positifs : 990 + 1 980 = 2 970 personnes, dont 990 malades. 990 ÷ 2 970 ≈ 33,3 %. Répondre 99 %, c’est donner la part des malades détectés — l’autre sens du calcul. Répondre 66,7 %, c’est la part des bien portants dans ce même groupe.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P1', 'premiere_specialite_probabilites-conditionnelles-arbres-1ere_P2'] },
  },
  {
    id: 'pc-e3',
    requires: ['phrase-population-reference', 'conditionnelle-sur-effectifs'],
    skill: 'dire',
    title: 'La phrase juste',
    prompt: 'Dans un lycée, 80 % des élèves qui prennent le bus arrivent à l’heure. Quelle phrase dit exactement cela ?',
    options: [
      'Parmi les élèves qui prennent le bus, 8 sur 10 arrivent à l’heure',
      'Parmi les élèves qui arrivent à l’heure, 8 sur 10 prennent le bus',
      '80 % des élèves du lycée arrivent à l’heure',
      '80 % des élèves du lycée prennent le bus',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le groupe de référence est celui des élèves qui prennent le bus : la phrase doit commencer par le nommer. Les trois autres phrases parlent d’autres groupes — ceux qui arrivent à l’heure, ou tous les élèves — et rien dans l’énoncé ne permet de les affirmer.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P2'] },
  },
  {
    id: 'pc-e4',
    requires: ['paradoxe-depistage', 'phrase-population-reference'],
    skill: 'dire',
    title: 'Pourquoi tant d’alertes',
    prompt: 'Un test se trompe sur 2 % des personnes en bonne santé et détecte 99 % des malades. Pourtant, la majorité des tests positifs concernent des personnes en bonne santé. Comment l’expliquer ?',
    options: [
      'Les personnes en bonne santé sont bien plus nombreuses : 2 % d’un très grand groupe dépasse 99 % d’un petit',
      'Le test est mal réglé et devrait être remplacé',
      'Les personnes en bonne santé passent le test plus souvent',
      'Les deux pourcentages, 99 % et 2 %, ne se comparent pas',
    ],
    cols: 1,
    correct: 0,
    explain: 'Sur 100 000 personnes dont 1 000 malades : 99 % de 1 000 font 990 détections justifiées, et 2 % de 99 000 font 1 980 alertes injustifiées. Le test fonctionne exactement comme annoncé — c’est la rareté de la maladie qui produit le renversement.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P2'] },
  },
  {
    id: 'pc-e5',
    requires: ['chaque-poids-sa-branche', 'poids-conditionnels'],
    skill: 'construire',
    title: 'Le poids et sa place',
    prompt: 'Un arbre porte 0,99 au premier niveau sur la branche « en bonne santé », et 0,99 au second niveau sur la branche « test + » partant de « malade ». Que faut-il en conclure ?',
    options: [
      'Ce sont deux nombres égaux qui portent sur deux groupes différents : toute la population pour l’un, les seuls malades pour l’autre',
      'L’arbre est faux : un même poids ne peut pas figurer deux fois',
      'Les deux branches représentent le même événement',
      'Le second 0,99 devrait être 0,01, puisqu’il part de « malade »',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un poids se lit à sa PLACE. Au premier niveau, 0,99 porte sur les 100 000 personnes ; au second, sur les 1 000 malades seulement. Deux poids identiques dans un arbre sont parfaitement légitimes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P3'] },
  },
  {
    id: 'pc-e6',
    requires: ['arbre-controle', 'somme-branches', 'chaque-poids-sa-branche'],
    skill: 'construire',
    title: 'Le contrôle qui compte',
    prompt: 'On te remet un arbre pondéré déjà rempli. Quel contrôle repère à coup sûr un poids mal placé ?',
    options: [
      'Additionner les branches issues de chaque nœud : chaque somme doit valoir 1',
      'Vérifier que tous les poids sont différents les uns des autres',
      'Multiplier tous les poids de l’arbre entre eux',
      'Comparer le nombre de branches du premier et du second niveau',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les branches d’un même nœud couvrent toutes les suites possibles : leur somme vaut 1. Une somme différente signale immédiatement un poids déplacé ou une branche oubliée. Des poids identiques, eux, sont légitimes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P3', 'premiere_specialite_probabilites-conditionnelles-arbres-1ere_P4'] },
  },
  {
    id: 'pc-e7',
    requires: ['produit-chemin', 'arbre-instrument'],
    skill: 'exploiter',
    title: 'Le long d’un chemin',
    prompt: 'Un atelier reçoit 60 % de ses composants du fournisseur 1, qui en livre 2 % de défectueux. Quelle est la probabilité qu’un composant vienne du fournisseur 1 ET soit défectueux ?',
    options: ['1,2 %', '62 %', '2 %', '60 %'],
    cols: 4,
    correct: 0,
    explain: 'Le long du chemin, on multiplie : 0,60 × 0,02 = 0,012, soit 1,2 %. Répondre 62 %, c’est avoir additionné les deux poids ; répondre 2 %, c’est donner le taux du fournisseur seul, qui ne porte que sur ses propres composants.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P4'] },
  },
  {
    id: 'pc-e8',
    requires: ['somme-chemins', 'arbre-instrument', 'produit-chemin'],
    skill: 'exploiter',
    title: 'Rassembler les chemins',
    prompt: 'Deux ateliers expédient les colis : 50 % par le premier, qui en met 5 % en retard, et 50 % par le second, qui en met 25 % en retard. Quelle est la probabilité qu’un colis soit en retard ?',
    options: ['15 %', '2,5 %', '25 %', '13,3 %'],
    cols: 4,
    correct: 0,
    explain: 'Deux chemins mènent au retard : 0,50 × 0,05 = 0,025 et 0,50 × 0,25 = 0,125. On les additionne : 0,15, soit 15 %. Répondre 2,5 %, c’est n’avoir gardé qu’un seul chemin ; 25 %, c’est prendre le taux du second atelier pour l’ensemble.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P4', 'premiere_specialite_probabilites-conditionnelles-arbres-1ere_P5'] },
  },
  {
    id: 'pc-e9',
    requires: ['probabilites-totales', 'methode-probabilites-totales', 'moyenne-nest-pas-la-somme-ponderee'],
    skill: 'totales',
    title: 'Peser, pas moyenner',
    prompt: 'Trois fournisseurs livrent 60 %, 30 % et 10 % des composants, avec 2 %, 5 % et 10 % de défauts. Quelle est la probabilité qu’un composant soit défectueux ?',
    options: ['3,7 %', '5,7 %', '2 %', '10 %'],
    cols: 4,
    correct: 0,
    explain: '0,60 × 0,02 + 0,30 × 0,05 + 0,10 × 0,10 = 0,012 + 0,015 + 0,010 = 0,037, soit 3,7 %. Répondre 5,7 %, c’est avoir fait la moyenne des trois taux — ce qui donnerait le même poids aux trois fournisseurs, alors que le premier en livre 60 %.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P5'] },
  },
  {
    id: 'pc-e10',
    requires: ['probabilites-totales', 'partition', 'mem-partition-puis-somme'],
    skill: 'totales',
    title: 'Quand la formule ne s’applique pas',
    prompt: 'On veut la part d’élèves boursiers d’un lycée en découpant les élèves en « fait du sport » et « fait de la musique ». Peut-on additionner les deux chemins correspondants ?',
    options: [
      'Non : certains élèves font les deux et seraient comptés deux fois, d’autres ni l’un ni l’autre et seraient oubliés',
      'Oui : deux cas suffisent toujours',
      'Oui, à condition que les deux groupes aient le même effectif',
      'Non : il faudrait au moins trois cas',
    ],
    cols: 1,
    correct: 0,
    explain: 'La somme n’est légitime que si chaque élève tombe dans un cas, et dans un seul. Ici les deux cas se chevauchent et ne recouvrent pas tout le lycée. Le nombre de cas, lui, est libre — deux suffisent quand ils partitionnent, comme « malade » et « en bonne santé ».',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-conditionnelles-arbres-1ere_P5'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  calculer: { label: 'Calculer dans le bon univers', module: 2 },
  dire: { label: 'Interpréter et dire juste', module: 2 },
  construire: { label: 'Construire un arbre', module: 3 },
  exploiter: { label: 'Exploiter un arbre', module: 4 },
  totales: { label: 'Les probabilités totales', module: 5 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Maître du dénominateur', test: (m) => !m.calculer },
  { id: 'b2', emoji: '🏅', label: 'Parleur exact', test: (m) => !m.dire },
  { id: 'b3', emoji: '🏅', label: 'Bâtisseur d’arbres', test: (m) => !m.construire },
  { id: 'b4', emoji: '🏅', label: 'Suiveur de chemins', test: (m) => !m.exploiter },
  { id: 'b5', emoji: '🏅', label: 'Découpeur d’univers', test: (m) => !m.totales },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des probabilités totales', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLArbreEtLaFormule() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’arbre et la formule"
      moduleSubtitle="Dix épreuves : un dénominateur, une phrase, un arbre, des chemins, une partition"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître des probabilités totales',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : nommer le groupe de référence avant de
            diviser, et vérifier que les cas se partagent la population avant d’additionner.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🎯', label: 'dénominateur', value: 'l’effectif de la condition' },
        { id: 'r2', emoji: '💬', label: 'la phrase', value: 'commencer par « parmi les… »' },
        { id: 'r3', emoji: '🌳', label: 'un nœud', value: 'ses branches somment à 1' },
        { id: 'r4', emoji: '✖️', label: 'un chemin', value: 'produit des poids' },
        { id: 'r5', emoji: '➕', label: 'les chemins', value: 'somme, si partition' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître des probabilités totales !',
        title: 'Mission accomplie',
        message: 'Tu sais choisir ton dénominateur, dire ce que tu calcules, construire un arbre juste, en suivre les chemins et reconnaître quand la formule s’applique.',
        verbs: ['Calculer', 'Dire', 'Construire', 'Additionner'],
        masterBadgeLabel: 'Maître des probabilités totales',
      }}
    />
  );
}
