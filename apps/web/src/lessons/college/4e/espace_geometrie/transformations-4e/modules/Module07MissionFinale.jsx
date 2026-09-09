import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les figures des
 * modules (ni le drapeau, ni le triangle, ni le quadrilatère à 16 carreaux),
 * et chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — « la copie a tourné », c'est-à-dire confondre glissement et demi-tour
 *     (M1, M6) ;
 *   — retenir la longueur en oubliant le sens (M2) ;
 *   — croire qu'il faut déplacer tous les points d'une figure (M3) ;
 *   — croire qu'une figure déplacée change de taille ou d'aire (M4) ;
 *   — croire que longueurs et angles conservés PROUVENT une translation, ce
 *     que le demi-tour dément (M4) ;
 *   — relier M N M’ N’ au lieu de M M’ N’ N (M5).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 * `badges[].test` est une FONCTION `(misses) => bool`.
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 5 LPs sont tous couverts —
 * P1 (e1, e2, e10), P2 (e3, e4), P3 (e5, e6), P4 (e8, e9), P5 (e6, e7).
 *
 * DÉCOR : un carrelage, dont chaque motif est la copie glissée du précédent.
 * Aucun des modules n'a utilisé ce contexte.
 */
const SKILLS = {
  reconnaitre: { label: 'Reconnaître le geste', module: 1, emoji: '🔍' },
  construire: { label: 'Construire une image', module: 2, emoji: '📐' },
  conserver: { label: 'Propriétés conservées', module: 4, emoji: '🔒' },
  parallelo: { label: 'Le parallélogramme', module: 5, emoji: '▱' },
};

const BADGES = [
  { id: 'b-rec', emoji: '🔍', label: 'Œil du carreleur', test: (m) => !m.reconnaitre },
  { id: 'b-con', emoji: '📐', label: 'Main sûre', test: (m) => !m.construire },
  { id: 'b-cons', emoji: '🔒', label: 'Gardien des mesures', test: (m) => !m.conserver },
  { id: 'b-par', emoji: '▱', label: 'Maître du quadrilatère', test: (m) => !m.parallelo },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de la translation', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'tr4-e1',
    skill: 'reconnaitre',
    title: 'Le tapis de l’usine',
    prompt: 'Sur un tapis roulant, une caisse avance de 2 m sans jamais pivoter. Quelle transformation décrit ce déplacement ?',
    options: [
      'Une symétrie centrale',
      'Une translation',
      'Une symétrie par rapport à un axe',
      'Aucune : la caisse s’est simplement déplacée',
    ],
    correct: 1,
    cols: 1,
    requires: ['translation', 'trois-caracteres'],
    explain: 'C’est une translation : la caisse glisse, tous ses points font le même trajet, et elle ne pivote pas. Un déplacement de figure EST une transformation.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P1'] },
  },
  {
    id: 'tr4-e2',
    skill: 'reconnaitre',
    title: 'Les traits du dessin',
    prompt: 'Sur un dessin, on relie chaque sommet d’une figure au sommet correspondant de sa copie. Les traits obtenus se coupent tous en un même point. De quelle transformation s’agit-il ?',
    options: [
      'D’une translation',
      'D’une symétrie centrale',
      'On ne peut pas conclure sans mesurer',
      'D’une translation, si les traits ont la même longueur',
    ],
    correct: 1,
    cols: 1,
    requires: ['translation', 'reconnaitre-le-geste'],
    explain: 'Des traits concourants sont la signature de la symétrie centrale, et leur point commun est le centre. Dans une translation, ils restent parallèles et ne se coupent jamais.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P1'] },
  },
  {
    id: 'tr4-e3',
    skill: 'construire',
    title: 'Le carreau suivant',
    prompt: 'Un carreau est posé au point P. Le glissement du carrelage avance de 3 carreaux vers la droite et 2 carreaux vers le bas. Où arrive l’image de P ?',
    options: [
      '3 carreaux à droite et 2 carreaux vers le bas de P',
      '3 carreaux à gauche et 2 carreaux vers le haut de P',
      '2 carreaux à droite et 3 carreaux vers le bas de P',
      '5 carreaux à droite de P',
    ],
    correct: 0,
    cols: 1,
    requires: ['construire-image-point', 'image'],
    explain: 'On refait exactement le même trajet depuis P : 3 à droite, 2 vers le bas. (Aller à gauche et vers le haut, c’est garder la direction et la longueur mais inverser le sens.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P2'] },
  },
  {
    id: 'tr4-e4',
    skill: 'construire',
    title: 'La longueur ne suffit pas',
    prompt: 'On sait seulement que l’image d’un point A se trouve à 6 cm de A. Peut-on la placer ?',
    options: [
      'Oui : il n’y a qu’un seul point à 6 cm de A',
      'Non : il manque la direction et le sens du glissement',
      'Oui, en la plaçant à droite de A',
      'Non : il manque aussi la longueur',
    ],
    correct: 1,
    cols: 1,
    requires: ['trois-caracteres', 'construire-image-point'],
    explain: 'Tous les points d’un cercle de rayon 6 cm autour de A conviendraient. Un glissement se décrit par trois choses : direction, sens ET longueur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P2'] },
  },
  {
    id: 'tr4-e5',
    skill: 'construire',
    title: 'Un pentagone à recopier',
    prompt: 'On veut construire l’image d’un pentagone par une translation. Combien de points suffit-il de construire ?',
    options: ['1', '5', '10', 'Tous les points du contour'],
    correct: 1,
    cols: 4,
    requires: ['construire-image-figure'],
    explain: 'Les 5 sommets suffisent : les côtés étant des segments, il ne reste qu’à relier les images dans le même ordre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P3'] },
  },
  {
    id: 'tr4-e6',
    skill: 'conserver',
    title: 'Le motif du carrelage',
    prompt: 'Un motif triangulaire a un côté de 12 cm et une aire de 30 cm². Après le glissement du carrelage, que valent le côté et l’aire de sa copie ?',
    options: [
      '12 cm et 30 cm²',
      '12 cm, mais l’aire dépend de la distance parcourue',
      'Un côté plus long, et une aire plus grande',
      'On ne peut pas le savoir sans connaître le glissement',
    ],
    correct: 0,
    cols: 1,
    requires: ['invariants-translation', 'construire-image-figure'],
    explain: 'Une translation conserve les longueurs et les aires : la copie est superposable au motif de départ. Seule sa position a changé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P5', '4e_transformations-4e_P3'] },
  },
  {
    id: 'tr4-e7',
    skill: 'conserver',
    title: 'Le piège des mesures',
    prompt: 'Une figure et sa copie ont exactement les mêmes longueurs, les mêmes angles et la même aire. Que peut-on conclure ?',
    options: [
      'C’est une translation',
      'C’est une translation OU une symétrie centrale : ces mesures ne les distinguent pas',
      'C’est une symétrie centrale',
      'La copie est confondue avec la figure de départ',
    ],
    correct: 1,
    cols: 1,
    requires: ['invariants-translation', 'invariants-symetrie', 'reconnaitre-le-geste'],
    explain: 'Les deux transformations conservent exactement les mêmes grandeurs. Pour trancher, il faut regarder les trajets : parallèles pour la translation, concourants pour la symétrie centrale.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P5'] },
  },
  {
    id: 'tr4-e8',
    skill: 'parallelo',
    title: 'Quatre points, un quadrilatère',
    prompt: 'R’ et S’ sont les images de R et S par une même translation, et R, S, R’ ne sont pas alignés. Quel quadrilatère obtient-on ?',
    options: [
      'R S R’ S’ est un parallélogramme',
      'R R’ S’ S est un parallélogramme',
      'R R’ S’ S est un rectangle',
      'On n’obtient aucun quadrilatère particulier',
    ],
    correct: 1,
    cols: 1,
    requires: ['translation-parallelogramme', 'parallelogramme'],
    explain: 'C’est R R’ S’ S, dans cet ordre : [R R’] et [S S’] sont les deux trajets, donc deux côtés opposés parallèles et de même longueur. Relier R à S d’abord traverse la figure et donne un quadrilatère croisé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P4'] },
  },
  {
    id: 'tr4-e9',
    skill: 'parallelo',
    title: 'Le raisonnement inverse',
    prompt: 'Dans un exercice, on lit : « E F F’ E’ est un parallélogramme, dans cet ordre ». Que peut-on en déduire ?',
    options: [
      'Que E et F sont confondus',
      'Que le glissement menant de E à F mène aussi de E’ à F’',
      'Que le glissement menant de E à E’ mène aussi de F à F’',
      'Rien : un parallélogramme ne dit rien d’une translation',
    ],
    correct: 2,
    cols: 1,
    requires: ['translation-parallelogramme', 'diagonale'],
    explain: 'Dans l’ordre E F F’ E’, les côtés opposés sont [E F] et [E’ F’] d’une part, [F F’] et [E E’] d’autre part. Ces deux derniers sont parallèles, de même longueur et de même sens : c’est un même glissement, qui mène E en E’ et F en F’.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P4'] },
  },
  {
    id: 'tr4-e10',
    skill: 'reconnaitre',
    title: 'Le carrelage complet',
    prompt: 'Un carreleur pose un motif, puis chaque motif suivant est obtenu en décalant le précédent de 25 cm vers la droite. Que peut-on dire du dixième motif par rapport au premier ?',
    options: [
      'Il est son image par une translation, et il lui est superposable',
      'Il est son image par une symétrie centrale',
      'Il est plus grand que le premier',
      'Il est son image par une translation, mais il est retourné',
    ],
    correct: 0,
    cols: 1,
    requires: ['translation', 'invariants-translation', 'reconnaitre-le-geste'],
    explain: 'Chaque décalage est une translation, et enchaîner des glissements vers la droite donne encore un glissement vers la droite. Le dixième motif est donc l’image du premier par une translation : même taille, même orientation, superposable — jamais retourné.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_transformations-4e_P1', '4e_transformations-4e_P5'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : le carrelage"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="9 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'Le carrelage',
        tone: 'amber',
        body: (
          <>
            Dix situations d’atelier et de chantier. Réponds à tout, puis soumets :
            aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Translation maîtrisée',
        title: 'Mission accomplie',
        message: 'Tu sais reconnaître une translation à ses trajets, construire l’image d’un point et d’une figure, utiliser ce qu’elle conserve, et retrouver le parallélogramme qu’elle fabrique.',
        verbs: ['Reconnaître', 'Construire', 'Conserver', 'Relier'],
        masterBadgeLabel: 'Maître de la translation',
      }}
    />
  );
}
