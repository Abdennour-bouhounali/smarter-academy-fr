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
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les dimensions des
 * modules. Les contextes changent (boîte de conserve, tente, colis, tuyau) et
 * chaque distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   — conclure d'une seule vue (M1, M3) ;
 *   — croire que la perspective est une photographie (M2) ;
 *   — croire qu'une arête cachée n'appartient pas au solide (M2) ;
 *   — poser les deux bases du même côté de la bande (M4) ;
 *   — prendre le diamètre pour la longueur de la bande (M5) ;
 *   — oublier une base en comptant les pièces d'un patron (M6).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucun volume, aucune sphère,
 * aucune pyramide, aucun cône, aucune section de solide. On lit, on associe,
 * on déplie.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  vues: { label: 'Les trois vues', emoji: '👁️', module: 1 },
  perspective: { label: 'Perspective cavalière', emoji: '📐', module: 2 },
  associer: { label: 'Associer solide et vues', emoji: '🔗', module: 3 },
  prisme: { label: 'Patron du prisme', emoji: '⛺', module: 4 },
  cylindre: { label: 'Patron du cylindre', emoji: '🥫', module: 5 },
  atelier: { label: 'Commander un carton', emoji: '📦', module: 6 },
};

const REGISTRE = [
  { id: 'r-vues', emoji: '👁️', label: 'Trois vues', value: 'de face, de dessus, de côté' },
  { id: 'r-persp', emoji: '📐', label: 'Cavalière', value: 'face avant en vraie grandeur' },
  { id: 'r-patron', emoji: '✂️', label: 'Patron', value: '2 bases + la bande' },
  { id: 'r-bande', emoji: '🔄', label: 'La bande', value: 'longueur = tour de la base' },
];

const BADGES = [
  { id: 'b-vues', emoji: '👁️', label: 'Œil du dessinateur', test: (m) => !m.vues },
  { id: 'b-perspective', emoji: '📐', label: 'Maître de la cavalière', test: (m) => !m.perspective },
  { id: 'b-prisme', emoji: '⛺', label: 'Plieur de prismes', test: (m) => !m.prisme },
  { id: 'b-cylindre', emoji: '🥫', label: 'Rouleur de bandes', test: (m) => !m.cylindre },
  { id: 'b-atelier', emoji: '📦', label: 'Chef d’atelier', test: (m) => !m.atelier },
  { id: 'b-parfait', emoji: '💎', label: 'L’atelier au complet', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 're5-e1',
    skill: 'vues',
    title: 'Une seule photo',
    prompt: 'Une boîte de conserve et une boîte à thé triangulaire sont photographiées de face : les deux images sont des rectangles identiques. Que peut-on en conclure ?',
    options: [
      'Rien : une seule vue ne permet pas de distinguer les deux boîtes',
      'Que les deux boîtes sont le même solide',
      'Que les deux boîtes sont des pavés droits',
      'Que la photo est ratée',
    ],
    cols: 1,
    requires: ['vue'],
    explain: 'Une vue écrase le solide et perd une dimension : deux solides différents peuvent donner exactement la même. Il faut d’autres vues — ici, celle de dessus — pour trancher.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P1'] },
  },
  {
    id: 're5-e2',
    skill: 'vues',
    title: 'La vue qui montre la base',
    prompt: 'Quelle vue montre la forme de la base d’un solide posé à plat ?',
    options: ['La vue de dessus', 'La vue de face', 'La vue de côté', 'Aucune des trois'],
    cols: 2,
    requires: ['vue', 'trois-vues'],
    explain: 'En regardant le solide d’en haut, on voit sa base : c’est la vue de dessus. C’est elle qui sépare un prisme (polygone) d’un cylindre (disque).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P1'] },
  },
  {
    id: 're5-e3',
    skill: 'perspective',
    title: 'Vraie grandeur',
    prompt: 'Sur un dessin en perspective cavalière d’un prisme droit, quelle partie est dessinée en vraie grandeur ?',
    options: [
      'La face avant',
      'Toutes les faces',
      'Les fuyantes',
      'Aucune : tout est déformé',
    ],
    cols: 2,
    requires: ['perspective-cavaliere'],
    explain: 'La convention conserve la face avant en vraie grandeur, et ne raccourcit que ce qui part vers l’arrière. C’est ce qui permet de mesurer une partie du dessin.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P3'] },
  },
  {
    id: 're5-e4',
    skill: 'perspective',
    title: 'Le pointillé',
    prompt: 'Sur une perspective cavalière, que signifie une arête tracée en pointillé ?',
    options: [
      'Elle appartient au solide, mais on ne la verrait pas d’ici',
      'Elle n’appartient pas vraiment au solide',
      'Elle est plus courte que les autres',
      'Elle est en train d’être effacée',
    ],
    cols: 1,
    requires: ['fuyante', 'perspective-cavaliere'],
    explain: 'Le pointillé dit deux choses à la fois : cette arête existe bel et bien, et depuis ce point de vue le solide la cache. Tourner le solide peut la rendre visible.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P3'] },
  },
  {
    id: 're5-e5',
    skill: 'associer',
    title: 'Lire un plan',
    prompt: 'Un plan donne : de face un rectangle, de côté un rectangle, de dessus un carré. De quel solide s’agit-il ?',
    options: [
      'Un prisme droit à base carrée',
      'Un cylindre',
      'Un prisme droit à base triangulaire',
      'Impossible à dire',
    ],
    cols: 2,
    requires: ['associer-vues', 'trois-vues'],
    explain: 'La vue de dessus montre la base : ici un carré. C’est donc un prisme droit à base carrée. Les trois vues suffisent toujours à conclure — c’est leur raison d’être.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P2'] },
  },
  {
    id: 're5-e6',
    skill: 'associer',
    title: 'Le cylindre couché',
    prompt: 'Un tuyau cylindrique est posé debout. Quelle est sa vue de dessus ?',
    options: ['Un disque', 'Un rectangle', 'Un triangle', 'Un losange'],
    cols: 4,
    requires: ['associer-vues', 'trois-vues', 'solide-usuel'],
    explain: 'Debout, on voit sa base d’en haut : c’est un disque. De face et de côté, en revanche, il donnerait un rectangle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P2', '5e_representations-espace-5e_P4'] },
  },
  {
    id: 're5-e7',
    skill: 'prisme',
    title: 'Le carton de la tente',
    prompt: 'Une tente a la forme d’un prisme droit à base triangulaire. De combien de pièces son patron est-il composé ?',
    options: ['5', '4', '6', '3'],
    cols: 4,
    requires: ['patron-prisme'],
    explain: 'Deux bases triangulaires, plus un rectangle par côté du triangle (donc trois) : 2 + 3 = 5 pièces.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P5'] },
  },
  {
    id: 're5-e8',
    skill: 'prisme',
    title: 'Deux bases mal placées',
    prompt: 'Dans un patron de prisme, les deux bases sont dessinées du MÊME côté de la bande. Que se passe-t-il au pliage ?',
    options: [
      'Elles se rabattent au même endroit : une extrémité reste ouverte',
      'Rien, le solide se ferme quand même',
      'Le solide obtenu a deux fois plus de faces',
      'La bande devient trop courte',
    ],
    cols: 1,
    requires: ['deux-bases', 'patron-prisme'],
    explain: 'Chaque base se rabat sur l’extrémité voisine. Du même côté, les deux viennent au même endroit : cette extrémité est doublée, l’autre reste ouverte. Il en faut une de chaque côté.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P5'] },
  },
  {
    id: 're5-e9',
    skill: 'cylindre',
    title: 'La bande de la boîte de conserve',
    prompt: 'Une boîte de conserve a un rayon de 3 cm. Quelle est la longueur de sa bande ? (π ≈ 3,14)',
    options: ['environ 18,8 cm', 'environ 6 cm', 'environ 9,4 cm', 'environ 3 cm'],
    cols: 2,
    requires: ['bande-perimetre', 'patron-cylindre'],
    explain: 'La bande fait le tour du disque : 2 × π × 3 ≈ 18,8 cm. 6 cm serait le diamètre — la traversée, pas le tour ; 9,4 cm n’en serait que la moitié.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P6'] },
  },
  {
    id: 're5-e10',
    skill: 'atelier',
    title: 'Commander le bon carton',
    prompt: 'Quelles grandeurs suffisent pour tracer entièrement le patron d’un cylindre ?',
    options: [
      'Le rayon de la base et la hauteur',
      'La hauteur seule',
      'Le rayon seul',
      'Il faut aussi connaître le poids de la boîte',
    ],
    cols: 1,
    requires: ['dimensions-solide', 'patron-cylindre', 'bande-perimetre'],
    explain: 'Avec le rayon on trace les deux disques et on calcule la longueur de la bande (2 × π × rayon) ; avec la hauteur on obtient la hauteur de cette bande. Ces deux grandeurs suffisent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_representations-espace-5e_P6', '5e_representations-espace-5e_P4'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’atelier"
      moduleSubtitle="Dix épreuves pour prouver que tu lis et déplies l’espace"
      estimatedTime="12 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'L’atelier d’emballage',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, reviens au même réflexe :{' '}
            <strong>quelle représentation répond à cette question — la vue, le dessin, ou le
            patron ?</strong>
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'L’atelier au complet !',
        title: 'Mission accomplie',
        message: 'Tu sais lire les trois vues d’un solide, interpréter une perspective cavalière et déplier un prisme comme un cylindre.',
        verbs: ['Observer', 'Lire', 'Déplier', 'Fabriquer'],
        masterBadgeLabel: 'L’atelier au complet',
      }}
    />
  );
}
