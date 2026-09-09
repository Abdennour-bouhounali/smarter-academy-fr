import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs.
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les dimensions des
 * modules (ni le 8 × 6 du patron, ni le 6 × 9 des formules, ni le 3 × 12 du
 * cornet, ni le 3 × 3 × 2,4 de la tente). Chaque distracteur encode une erreur
 * RÉELLEMENT rencontrée :
 *   — prendre l'ARÊTE LATÉRALE pour la hauteur (M2) : épreuve 4 ;
 *   — OUBLIER LE TIERS, sur base carrée puis sur base ronde (M1, M5, M6) :
 *     épreuves 6 et 8 ;
 *   — confondre l'aire de la base et le volume (M5) : épreuve 6 ;
 *   — prendre la hauteur de la pyramide pour celle d'une face (M3) : épreuve 5 ;
 *   — croire que doubler la hauteur quadruple le volume (M6) : épreuve 10.
 *
 * Les six LPs sont couverts : P1 (é1, é2), P2 (é3, é4, é5), P3 (é7), P4 (é6),
 * P5 (é8), P6 (é9, é10).
 *
 * `badges[].test` est une FONCTION `(misses) => bool`.
 *
 * PÉRIMÈTRE : aucune épreuve ne coupe un solide et aucune ne parle de solide
 * rond fermé — ce sont des objets de 3e.
 */
const SKILLS = {
  reconnaitre: { label: 'Reconnaître les solides', module: 2, emoji: '🔺' },
  reperer: { label: 'Base et hauteur', module: 2, emoji: '📐' },
  calculer: { label: 'Calculer un volume', module: 5, emoji: '🧮' },
  resoudre: { label: 'Résoudre un problème', module: 6, emoji: '🧠' },
};

const BADGES = [
  { id: 'b-re', emoji: '🔺', label: 'Solides reconnus', test: (m) => !m.reconnaitre },
  { id: 'b-ba', emoji: '📐', label: 'Hauteur sûre', test: (m) => !m.reperer },
  { id: 'b-ca', emoji: '🧮', label: 'Tiers maîtrisé', test: (m) => !m.calculer },
  { id: 'b-pb', emoji: '🧠', label: 'Problèmes résolus', test: (m) => !m.resoudre },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des volumes', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 're4-e1',
    skill: 'reconnaitre',
    title: 'Le solide pointu',
    prompt: 'Un solide a pour base un carré et quatre faces triangulaires qui se rejoignent en un seul point. Quel est ce solide ?',
    options: ['Une pyramide à base carrée', 'Un prisme droit', 'Un cube', 'Un cylindre'],
    correct: 0,
    cols: 2,
    requires: ['base-et-hauteur'],
    explain: 'Une base polygonale et des faces latérales triangulaires qui convergent vers un sommet unique : c’est la définition d’une pyramide.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P1'] },
  },
  {
    id: 're4-e2',
    skill: 'reconnaitre',
    title: 'Ce que le triangle engendre',
    prompt: 'On fait tourner un triangle rectangle d’un tour complet autour d’un des côtés de son angle droit. Quel solide obtient-on ?',
    options: [
      'Un cône de révolution',
      'Un cylindre de révolution',
      'Une pyramide à base carrée',
      'Un disque plat',
    ],
    correct: 0,
    cols: 2,
    requires: ['cone-de-revolution'],
    explain: 'L’axe devient la hauteur, l’autre côté de l’angle droit balaie le disque de base, et le côté en biais forme la surface arrondie : c’est un cône de révolution. (Un rectangle qui tourne donnerait un cylindre.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P1'] },
  },
  {
    id: 're4-e3',
    skill: 'reperer',
    title: 'Où passe la hauteur ?',
    prompt: 'Dans une pyramide, la hauteur est le segment qui joint le sommet…',
    options: [
      'au plan de la base, en formant avec lui un angle droit',
      'à un coin de la base',
      'au milieu d’un côté de la base',
      'au coin le plus éloigné de la base',
    ],
    correct: 0,
    cols: 1,
    requires: ['base-et-hauteur', 'droites-perpendiculaires'],
    explain: 'La hauteur mesure à quelle altitude se trouve la pointe : elle tombe perpendiculairement sur le plan de la base. Les trois autres réponses décrivent l’arête latérale ou l’apothème.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P2'] },
  },
  {
    id: 're4-e4',
    skill: 'reperer',
    title: 'Le nombre qui trompe',
    prompt: 'Une pyramide a une base carrée de 10 cm de côté. Son arête latérale mesure 13,93 cm et sa hauteur 12 cm. Quelle longueur entre dans le calcul du volume ?',
    options: ['12 cm', '13,93 cm', '10 cm', '25,93 cm'],
    correct: 0,
    cols: 4,
    requires: ['base-et-hauteur', 'hauteur-nest-pas-arete'],
    explain: 'Seule la hauteur intervient : 12 cm. L’arête latérale, 13,93 cm, est plus longue parce qu’elle part en biais vers un coin — l’utiliser gonflerait le volume.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P2'] },
  },
  {
    id: 're4-e5',
    skill: 'reperer',
    title: 'Le patron',
    prompt: 'On veut le patron d’une pyramide de 10 cm de côté et 12 cm de hauteur. Quelle doit être la hauteur de chacun des quatre triangles ?',
    options: ['13 cm', '12 cm', '10 cm', '5 cm'],
    correct: 0,
    cols: 4,
    requires: ['patron-pyramide'],
    explain: 'Le triangle latéral descend jusqu’au MILIEU d’un côté, pas jusqu’au centre : sa hauteur vaut 13 cm ici. Avec 12 cm — la hauteur de la pyramide — le patron resterait ouvert.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P2'] },
  },
  {
    id: 're4-e6',
    skill: 'calculer',
    title: 'Le volume de la pyramide',
    prompt: 'Une pyramide a une base carrée de 5 cm de côté et une hauteur de 12 cm. Quel est son volume ?',
    options: ['100 cm³', '300 cm³', '25 cm³', '60 cm³'],
    correct: 0,
    cols: 4,
    requires: ['volume-pyramide'],
    explain: '5 × 5 = 25 cm² pour la base, puis 25 × 12 = 300, et 300 ÷ 3 = 100 cm³. (300 serait le prisme, le tiers oublié ; 25 est l’aire de la base, pas un volume.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P4'] },
  },
  {
    id: 're4-e7',
    skill: 'reperer',
    title: 'La hauteur d’un cône',
    prompt: 'Dans un cône de révolution, la hauteur va du sommet…',
    options: [
      'au centre du disque de base, à angle droit avec lui',
      'à un point du bord du disque de base',
      'jusqu’au bord de la surface arrondie',
      'au tour du disque de base',
    ],
    correct: 0,
    cols: 1,
    requires: ['cone-de-revolution', 'base-et-hauteur'],
    explain: 'Exactement comme pour la pyramide : du sommet au plan de la base, perpendiculairement. Le segment qui rejoint le bord est le côté en biais du triangle — plus long que la hauteur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P3'] },
  },
  {
    id: 're4-e8',
    skill: 'calculer',
    title: 'Le volume du cône',
    prompt: 'Un cône a un rayon de 4 cm et une hauteur de 6 cm. Quel est son volume, arrondi au cm³ ?',
    options: ['101 cm³', '302 cm³', '50 cm³', '24 cm³'],
    correct: 0,
    cols: 4,
    requires: ['volume-cone', 'arrondi'],
    explain: 'L’aire du disque vaut π × 4 × 4 ≈ 50,3 cm². Puis 50,3 × 6 ≈ 302, et 302 ÷ 3 ≈ 101 cm³. (302 serait le cylindre : le tiers oublié.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P5'] },
  },
  {
    id: 're4-e9',
    skill: 'resoudre',
    title: 'Le silo',
    prompt: 'Un tas de sable a la forme d’un cône de 2 m de rayon et 1,5 m de hauteur. Quel volume de sable, arrondi au dixième de m³ ?',
    options: ['6,3 m³', '18,8 m³', '9,4 m³', '3,0 m³'],
    correct: 0,
    cols: 4,
    requires: ['volume-cone', 'methode-probleme-volume'],
    explain: 'π × 2 × 2 ≈ 12,6 m² pour la base ; 12,6 × 1,5 ≈ 18,8 ; puis ÷ 3 ≈ 6,3 m³. (18,8 m³ serait le cylindre.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P6'] },
  },
  {
    id: 're4-e10',
    skill: 'resoudre',
    title: 'On change une dimension',
    prompt: 'Une pyramide a une base carrée de 4 m de côté et une hauteur de 15 m. On triple sa hauteur sans toucher à la base. Par combien son volume est-il multiplié ?',
    options: ['3', '9', '27', '1'],
    correct: 0,
    cols: 4,
    requires: ['methode-probleme-volume', 'volume-pyramide'],
    explain: 'La hauteur n’apparaît qu’UNE fois dans le calcul : la tripler triple le volume, qui passe de 80 m³ à 240 m³. (Par 9, ce serait si le côté de la base triplait, car il apparaît deux fois.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_representations-espace-4e_P6'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : l’entrepôt"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="8 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'L’entrepôt',
        tone: 'amber',
        body: (
          <>
            Dix situations où il faut reconnaître le solide, trouver sa hauteur et ne pas oublier
            le tiers. Réponds à tout, puis soumets : aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Volumes maîtrisés',
        title: 'Mission accomplie',
        message: 'Tu reconnais une pyramide et un cône, tu sais où passe leur hauteur, et tu calcules leur volume sans jamais oublier le tiers.',
        verbs: ['Reconnaître', 'Repérer', 'Calculer', 'Résoudre'],
        masterBadgeLabel: 'Maître des volumes',
      }}
    />
  );
}
