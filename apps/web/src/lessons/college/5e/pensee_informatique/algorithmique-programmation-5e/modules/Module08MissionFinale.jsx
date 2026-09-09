import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules. Le carré de 50 devient un triangle de 80, le dodécagone devient un
 * décagone, le rectangle « × 2 » devient un « × 3 ». Chaque distracteur encode
 * une erreur RÉELLEMENT rencontrée dans la leçon :
 *   — croire que changer la variable réécrit le programme (M2) ;
 *   — lire « cote × 2 » comme un nombre figé (M3) ;
 *   — compter les tours au lieu des instructions exécutées (M4) ;
 *   — prendre l'angle du SOMMET au lieu de l'angle du virage (M5) ;
 *   — multiplier au lieu de diviser dans 360 ÷ n (M5) ;
 *   — chercher l'erreur ailleurs qu'au premier écart (M6).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucune condition, aucune boucle
 * « tant que », aucune variable modifiée en cours de programme, aucune boucle
 * imbriquée. La variable est toujours LUE.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les rendrait
 * invisibles au validateur. Les 6 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  lire: { label: 'Lire un programme', emoji: '📜', module: 1 },
  variable: { label: 'Variable et entrée', emoji: '📦', module: 2 },
  formule: { label: 'Formule', emoji: '🧮', module: 3 },
  boucle: { label: 'Boucle', emoji: '🔁', module: 4 },
  figure: { label: 'Tracer une figure', emoji: '⬡', module: 5 },
  debug: { label: 'Déboguer', emoji: '🔧', module: 6 },
};

const BADGES = [
  { id: 'b-lire', emoji: '📜', label: 'Lecteur de programmes', test: (m) => !m.lire },
  { id: 'b-variable', emoji: '📦', label: 'Gardien des variables', test: (m) => !m.variable },
  { id: 'b-formule', emoji: '🧮', label: 'Écrivain de formules', test: (m) => !m.formule },
  { id: 'b-boucle', emoji: '🔁', label: 'Maître des boucles', test: (m) => !m.boucle },
  { id: 'b-figure', emoji: '⬡', label: 'Géomètre du stylo', test: (m) => !m.figure },
  { id: 'b-debug', emoji: '🔧', label: 'Chasseur de bugs', test: (m) => !m.debug },
  { id: 'b-parfait', emoji: '💎', label: 'Programmeur-dessinateur', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'alg5-e1',
    skill: 'lire',
    title: 'Le drapeau',
    prompt:
      'KIWI exécute : AVANCER de 60 · TOURNER de 90° · AVANCER de 20 · TOURNER de 90° · AVANCER de 60. Combien de traits laisse-t-il sur la feuille ?',
    options: ['3', '5', '2', '6'],
    cols: 4,
    requires: ['instruction-parametree', 'prevoir-executer'],
    explain:
      'Seules les instructions AVANCER laissent un trait : il y en a trois. Les TOURNER font pivoter le stylo sur place, sans rien tracer.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P1'] },
  },
  {
    id: 'alg5-e2',
    skill: 'lire',
    title: 'Le même programme, deux fois',
    prompt:
      'On lance deux fois de suite exactement le même programme, sans rien changer. Que peut-on affirmer ?',
    options: [
      'Les deux dessins sont identiques',
      'Le second dessin est plus grand',
      'Le second dessin peut être différent, car le stylo se fatigue',
      'On ne peut rien dire sans exécuter',
    ],
    cols: 1,
    requires: ['prevoir-executer', 'instruction-parametree'],
    explain:
      'Un programme décrit une suite de gestes précise : les mêmes instructions, dans le même ordre, avec les mêmes valeurs, produisent toujours le même tracé. C’est ce qui permet de prévoir le résultat avant de l’exécuter.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P1'] },
  },
  {
    id: 'alg5-e3',
    skill: 'variable',
    title: 'Le triangle paramétré',
    prompt:
      'Un programme trace un triangle avec trois instructions AVANCER de taille. On remplace la valeur de taille par 80. Que se passe-t-il ?',
    options: [
      'Les trois côtés mesurent 80 : le triangle grandit',
      'Seul le premier côté mesure 80',
      'Le programme doit être réécrit avec 80 à trois endroits',
      'Rien ne change tant qu’on ne modifie pas les instructions',
    ],
    cols: 1,
    requires: ['variable-informatique', 'entree-programme'],
    explain:
      'Les trois instructions portent le nom taille : elles vont toutes lire la même valeur. En la changeant une fois, on change les trois côtés — c’est tout l’intérêt d’une variable.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P2'] },
  },
  {
    id: 'alg5-e4',
    skill: 'variable',
    title: 'Entrée et sortie',
    prompt:
      'On donne rayon = 25 à un programme, qui trace alors une figure. Comment appelle-t-on la valeur 25 dans ce programme ?',
    options: [
      'Son entrée : la valeur qu’on lui donne avant qu’il démarre',
      'Sa sortie : ce qu’il produit',
      'Son instruction principale',
      'Sa boucle',
    ],
    cols: 1,
    requires: ['entree-programme', 'variable-informatique'],
    explain:
      'L’entrée est ce qu’on fournit au programme avant l’exécution ; la sortie est ce qu’il produit — ici, la figure tracée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P2'] },
  },
  {
    id: 'alg5-e5',
    skill: 'formule',
    title: 'La bannière',
    prompt:
      'Avec largeur = 30, KIWI rencontre l’instruction « AVANCER de largeur × 3 ». De combien avance-t-il ?',
    options: ['90', '30', '33', '3'],
    cols: 4,
    requires: ['formule-programme', 'variable-informatique'],
    explain:
      'Le programme lit d’abord largeur (30), puis effectue le calcul 30 × 3 = 90. Une formule n’est pas un nombre : c’est une façon de calculer un nombre à partir de l’entrée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P3'] },
  },
  {
    id: 'alg5-e6',
    skill: 'formule',
    title: 'Ce que la formule garantit',
    prompt:
      'Un programme trace un rectangle dont un côté vaut cote et l’autre cote × 3. Que reste-t-il vrai, quelle que soit la valeur de cote ?',
    options: [
      'La longueur est toujours le triple de la largeur',
      'Le rectangle mesure toujours 3 de long',
      'Le rectangle devient un carré si cote vaut 3',
      'Les deux côtés sont toujours égaux',
    ],
    cols: 1,
    requires: ['formule-programme', 'entree-programme'],
    explain:
      'La formule fixe la RELATION entre les deux dimensions, pas leur taille. Quelle que soit l’entrée, le rapport reste 3 — la figure grandit sans jamais changer de forme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P3'] },
  },
  {
    id: 'alg5-e7',
    skill: 'boucle',
    title: 'Compter les gestes',
    prompt:
      'Un programme contient : RÉPÉTER 10 fois [ AVANCER de 25 · TOURNER de 36° ]. Combien d’instructions KIWI exécute-t-il en tout ?',
    options: ['20', '10', '2', '12'],
    cols: 4,
    requires: ['repeter-n-fois'],
    explain:
      'Le bloc contient 2 instructions, répétées 10 fois : 10 × 2 = 20 instructions exécutées. Écrites, il n’y en a que deux — c’est précisément ce que la boucle fait gagner.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P4'] },
  },
  {
    id: 'alg5-e8',
    skill: 'boucle',
    title: 'Écrire à la main',
    prompt:
      'Quel programme écrit à la main donne exactement le même dessin que RÉPÉTER 3 fois [ AVANCER de 40 · TOURNER de 120° ] ?',
    options: [
      'AVANCER 40 · TOURNER 120° · AVANCER 40 · TOURNER 120° · AVANCER 40 · TOURNER 120°',
      'AVANCER 40 · AVANCER 40 · AVANCER 40 · TOURNER 120°',
      'AVANCER 120 · TOURNER 40° · trois fois de suite',
      'AVANCER 40 · TOURNER 120°',
    ],
    cols: 1,
    requires: ['repeter-n-fois'],
    explain:
      'La boucle recopie son bloc entier à chaque tour, dans l’ordre : AVANCER puis TOURNER, trois fois. Grouper les AVANCER ensemble donnerait un tout autre tracé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P4'] },
  },
  {
    id: 'alg5-e9',
    skill: 'figure',
    title: 'Le décagone',
    prompt:
      'Quel programme trace un polygone régulier à 10 côtés de longueur 30 ?',
    options: [
      'RÉPÉTER 10 fois [ AVANCER de 30 · TOURNER de 36° ]',
      'RÉPÉTER 10 fois [ AVANCER de 30 · TOURNER de 144° ]',
      'RÉPÉTER 10 fois [ AVANCER de 30 · TOURNER de 3 600° ]',
      'RÉPÉTER 30 fois [ AVANCER de 10 · TOURNER de 36° ]',
    ],
    cols: 1,
    requires: ['angle-exterieur', 'mem-360-sur-n', 'repeter-n-fois'],
    explain:
      'Il faut 10 tours de boucle et un virage de 360 ÷ 10 = 36°. (144° est l’angle du SOMMET du décagone, celui qu’on voit sur la figure — pas celui du virage ; 3 600 vient d’une multiplication au lieu d’une division.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P5'] },
  },
  {
    id: 'alg5-e10',
    skill: 'debug',
    title: 'L’hexagone raté',
    prompt:
      'Un élève écrit RÉPÉTER 6 fois [ AVANCER de 50 · TOURNER de 120° ] pour tracer un hexagone régulier. La figure ne ressemble pas à un hexagone. Pourquoi ?',
    options: [
      'Il a tourné de 120° au lieu de 360 ÷ 6 = 60° : les six virages totalisent 720°, soit deux tours',
      'Il a mis 6 tours au lieu de 3',
      'La longueur 50 est trop grande pour un hexagone',
      'Il manque une instruction TOURNER à la fin du programme',
    ],
    cols: 1,
    requires: ['deboguer', 'angle-exterieur', 'mem-360-sur-n'],
    explain:
      'Le contrôle : n × angle doit valoir 360. Ici 6 × 120 = 720, soit deux tours complets — le stylo repasse sur ses traces et dessine un triangle. Avec 60°, on obtient bien l’hexagone.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_algorithmique-programmation-5e_P6'] },
  },
];

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="🏆 Mission finale : l’atelier de KIWI"
      moduleSubtitle="Dix épreuves pour devenir Programmeur-dessinateur"
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: 'Défi final',
        title: 'Tout ce que KIWI t’a appris',
        body: (
          <p>
            Dix épreuves : lire un programme, suivre une variable, calculer avec une formule,
            compter les tours d’une boucle, tracer une figure régulière et réparer un programme qui
            bugue. <strong>Aucune correction avant la fin</strong> — réponds à tout, puis valide.
          </p>
        ),
      }}
      skills={SKILLS}
      badges={BADGES}
      epreuves={EPREUVES}
      synthese={<KnowledgeSnapshot complete />}
    />
  );
}
