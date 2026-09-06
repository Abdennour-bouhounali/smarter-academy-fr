import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { RANGE, DRONES, FIGURES, translatePoint, translatePolygon } from '../components/vectorUtils';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque distracteur
 * encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - viser la même arrivée plutôt que le même déplacement (M1) ;
 *   - confondre « sens contraire » et « autre direction » (M2) ;
 *   - croire qu'une translation fait tourner la figure (M3) ;
 *   - croire que déplacer la flèche change le vecteur (M4) ;
 *   - soustraire départ − arrivée (M5) ;
 *   - échanger les deux composantes (M2, M5) ;
 *   - se tromper d'ordre des sommets du parallélogramme (M7).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le test final CONSOLIDE : il peut exiger tout ce que la leçon a enseigné,
 *   et n'introduit rien de neuf. Chaque épreuve déclare donc ce qu'elle
 *   exige, et tous ces ids sont posés par une brique dans les modules 1 à 7.
 *   La synthèse ne recopie plus de définitions : elle rend la carte complète.
 */
const EPREUVES = [
  {
    id: 'tv-e1',
    requires: ['deplacement', 'direction-sens-longueur'],
    skill: 'trajet',
    title: 'Le même trajet',
    prompt: 'Deux drones font le même déplacement mais partent d’endroits différents. Que peut-on dire de leurs points d’arrivée ?',
    options: [
      'Ils sont différents : le déplacement dit de combien bouger, pas où arriver',
      'Ils sont identiques, puisque le déplacement est le même',
      'Ils sont identiques seulement si les drones partent en même temps',
      'On ne peut rien dire sans connaître la longueur du trajet',
    ],
    cols: 1,
    explain: 'L’arrivée dépend du départ ET du déplacement. Deux départs différents avec le même déplacement mènent à deux arrivées différentes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P1'] },
  },
  {
    id: 'tv-e2',
    requires: ['direction-sens-longueur', 'direction-nest-pas-sens', 'deplacement-oppose'],
    skill: 'attributs',
    title: 'Direction ou sens ?',
    prompt: 'Les déplacements (4 ; 3) et (−4 ; −3) : qu’ont-ils en commun, et qu’est-ce qui les distingue ?',
    options: [
      'Même direction et même longueur, mais des sens contraires',
      'Même sens, mais des directions différentes',
      'Rien en commun, ce sont deux déplacements sans rapport',
      'Ils sont identiques',
    ],
    cols: 1,
    explain: 'Ce sont des vecteurs opposés : ils suivent la même droite (même direction) sur la même distance, mais dans des sens contraires. En géométrie, « direction » désigne la droite suivie, pas le côté.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P2'] },
  },
  {
    id: 'tv-e3',
    requires: ['composante', 'composantes-ordonnees', 'vecteurs-egaux'],
    skill: 'attributs',
    title: 'Composantes échangées',
    prompt: 'Les déplacements (2 ; 5) et (5 ; 2) sont-ils égaux ?',
    options: [
      'Non : les composantes ne se correspondent pas, les directions diffèrent',
      'Oui : ce sont les mêmes nombres',
      'Oui, si on part du même point',
      'Non, mais ils ont la même direction',
    ],
    cols: 1,
    explain: 'La première composante commande l’horizontal, la seconde le vertical. Les échanger donne un tout autre déplacement — même si les deux flèches ont la même longueur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P3', '3e_translations-vecteurs-3e_P7'] },
  },
  {
    id: 'tv-e4',
    requires: ['translation-de-vecteur', 'image-point', 'composante'],
    skill: 'image',
    title: 'L’image d’un point',
    prompt: 'Quelle est l’image du point M (−2 ; 5) par la translation de vecteur (3 ; −4) ?',
    options: ['(1 ; 1)', '(−5 ; 9)', '(1 ; 9)', '(5 ; 1)'],
    cols: 4,
    explain: 'On ajoute chaque composante à sa coordonnée : −2 + 3 = 1 et 5 − 4 = 1. L’image est (1 ; 1).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P4'] },
  },
  {
    id: 'tv-e5',
    requires: ['translation', 'image-point'],
    skill: 'image',
    title: 'Ce que conserve une translation',
    prompt: 'On translate un triangle. Que devient-il ?',
    options: [
      'Un triangle superposable : mêmes longueurs, mêmes angles, même orientation',
      'Un triangle de même forme mais plus grand',
      'Un triangle tourné d’un quart de tour',
      'Un triangle dont seuls les angles sont conservés',
    ],
    cols: 1,
    explain: 'Tous les points glissent du même vecteur, donc les écarts entre eux sont inchangés. L’image est superposable à la figure de départ, sans rotation ni agrandissement.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P5'] },
  },
  {
    id: 'tv-e6',
    requires: ['vecteur', 'vecteurs-egaux', 'mem-vecteur-nest-pas-position'],
    skill: 'egaux',
    title: 'La flèche déplacée',
    prompt: 'On dessine la même flèche à un autre endroit de la feuille, sans changer sa longueur ni son inclinaison. Est-ce le même vecteur ?',
    options: [
      'Oui : le point d’application ne fait pas partie du vecteur',
      'Non : un vecteur est attaché à son point de départ',
      'Oui, seulement si on reste dans le même quadrant',
      'Non, sauf si la flèche part de l’origine',
    ],
    cols: 1,
    explain: 'Un vecteur est défini par sa direction, son sens et sa longueur. Deux flèches identiques posées à des endroits différents représentent le même vecteur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P6'] },
  },
  {
    id: 'tv-e7',
    requires: ['coordonnees-vecteur', 'mem-arrivee-moins-depart', 'composante'],
    skill: 'coordonnees',
    title: 'Coordonnées d’un vecteur',
    prompt: 'A est en (−1 ; 4) et B en (3 ; 1). Quelles sont les coordonnées du vecteur qui mène de A à B ?',
    options: ['(4 ; −3)', '(−4 ; 3)', '(2 ; 5)', '(−3 ; 4)'],
    cols: 4,
    explain: 'On calcule arrivée moins départ : 3 − (−1) = 4 et 1 − 4 = −3. D’où (4 ; −3). La réponse (−4 ; 3) inverse le sens de la soustraction.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P9', '3e_translations-vecteurs-3e_P8'] },
  },
  {
    id: 'tv-e8',
    requires: ['coordonnees-vecteur', 'vecteurs-egaux'],
    skill: 'egaux',
    title: 'Deux flèches, un vecteur ?',
    prompt: 'Une flèche va de (0 ; 2) à (4 ; 0). Une autre va de (−3 ; 1) à (1 ; −1). Représentent-elles le même vecteur ?',
    options: [
      'Oui : les deux valent (4 ; −2)',
      'Non : elles ne partent pas du même point',
      'Non : la seconde est plus à gauche',
      'Oui, mais seulement leur direction est commune',
    ],
    cols: 1,
    explain: 'Premier : 4 − 0 = 4 et 0 − 2 = −2. Second : 1 − (−3) = 4 et −1 − 1 = −2. Mêmes coordonnées, donc même vecteur — l’emplacement ne compte pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P7'] },
  },
  {
    id: 'tv-e9',
    requires: ['construire-quatrieme-point', 'parallelogramme-vecteurs', 'coordonnees-vecteur'],
    skill: 'probleme',
    title: 'Fermer un parallélogramme',
    prompt: 'A (0 ; 0), B (3 ; 1) et C (−1 ; 2). Où placer D pour que le déplacement de C vers D soit le même que celui de A vers B ?',
    options: ['(2 ; 3)', '(4 ; 1)', '(−4 ; 1)', '(2 ; 1)'],
    cols: 4,
    explain: 'Le déplacement de A à B vaut (3 ; 1). On l’applique à C : −1 + 3 = 2 et 2 + 1 = 3. D est en (2 ; 3), et ABDC est un parallélogramme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P10'] },
  },
  {
    id: 'tv-e10',
    requires: ['repeter-enchainer', 'composante', 'image-point'],
    skill: 'probleme',
    title: 'Enchaîner deux trajets',
    prompt: 'Un drone part de (1 ; −2), effectue le déplacement (−4 ; 3), puis le déplacement (2 ; 1). Où arrive-t-il ?',
    options: ['(−1 ; 2)', '(−3 ; 1)', '(3 ; 2)', '(−1 ; 4)'],
    cols: 4,
    explain: 'On enchaîne en ajoutant : abscisse 1 − 4 + 2 = −1 ; ordonnée −2 + 3 + 1 = 2. Le drone arrive en (−1 ; 2).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_translations-vecteurs-3e_P10', '3e_translations-vecteurs-3e_P4'] },
  },
];

const SKILLS = {
  trajet: { label: 'Déplacement', module: 1 },
  attributs: { label: 'Direction, sens, longueur', module: 2 },
  image: { label: 'Image par translation', module: 3 },
  egaux: { label: 'Vecteurs égaux', module: 4 },
  coordonnees: { label: 'Coordonnées', module: 5 },
  probleme: { label: 'Résoudre', module: 7 },
};

const BADGES = [
  { id: 'b-trajet', emoji: '🏅', label: 'Pilote attentif', test: (m) => !m.trajet },
  { id: 'b-attr', emoji: '🏅', label: 'Sens et direction', test: (m) => !m.attributs },
  { id: 'b-image', emoji: '🏅', label: 'Maître du glissement', test: (m) => !m.image },
  { id: 'b-egaux', emoji: '🏅', label: 'La flèche voyage', test: (m) => !m.egaux },
  { id: 'b-coord', emoji: '🏅', label: 'Calculateur de vecteurs', test: (m) => !m.coordonnees },
  { id: 'b-prob', emoji: '🏅', label: 'Constructeur', test: (m) => !m.probleme },
  { id: 'b-parfait', emoji: '💎', label: 'Chorégraphe de l’escadrille', test: (m) => Object.keys(m).length === 0 },
];

/** Les erreurs vraiment rencontrées dans la leçon, remises côte à côte. */
const PIEGES = [
  { wrong: 'Viser la même case d’arrivée que le drone modèle.',
    right: 'Reproduire le même déplacement : les arrivées diffèrent si les départs diffèrent.' },
  { wrong: '« Sens contraire » veut dire « autre direction ».',
    right: 'La direction est la droite suivie : un demi-tour la conserve et change le sens.' },
  { wrong: 'Croire qu’une translation fait tourner ou agrandir la figure.',
    right: 'Elle fait glisser : l’image est superposable à la figure de départ.' },
  { wrong: 'Croire que déplacer la flèche change le vecteur.',
    right: 'Seules les deux composantes comptent ; l’endroit n’en fait pas partie.' },
  { wrong: 'Calculer départ − arrivée.',
    right: 'Toujours arrivée − départ, séparément sur chaque coordonnée.' },
  { wrong: 'Échanger les deux composantes : (2 ; 3) pour (3 ; 2).',
    right: 'La première commande l’horizontal, la seconde le vertical.' },
];

/** La synthèse : l'escadrille figée, les pièges, puis la carte complète. */
function Synthese() {
  const V = DRONES.mouvement;
  const image = translatePolygon(FIGURES.drone, V);
  return (
    <div className="space-y-4">
      <CoordPlane
        range={RANGE}
        points={DRONES.positions.map((p, i) => ({
          id: `d${i}`, name: '🚁', x: p.x, y: p.y, color: '#4338ca',
        }))}
        arrows={DRONES.positions.map((p, i) => ({
          id: `a${i}`, from: p, to: translatePoint(p, V), color: '#7c3aed',
        }))}
        polygons={[
          { id: 'src', points: FIGURES.drone, fill: '#c7d2fe', stroke: '#4338ca' },
          { id: 'img', points: image, fill: '#a7f3d0', stroke: '#059669' },
        ]}
        caption={false}
        ariaLabel="Quatre drones effectuant le même déplacement, et une figure translatée"
      />
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
        <p className="font-bold text-rose-800 mb-2">Les pièges déjoués</p>
        <ul className="space-y-1.5 text-sm">
          {PIEGES.map((p) => (
            <li key={p.wrong} className="text-slate-700">
              <span className="text-rose-600">❌ {p.wrong}</span>
              <br />
              <span className="text-emerald-700">✅ {p.right}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Les connaissances elles-mêmes : la carte complète, source unique. */}
      <KnowledgeSnapshot variant="complete" complete />
    </div>
  );
}

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la chorégraphie"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises les vecteurs"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Chorégraphe de l’escadrille',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, demande-toi d’abord :
            de combien se déplace-t-on, horizontalement puis verticalement ?
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '➡️', label: 'Vecteur', value: 'un déplacement' },
        { id: 'r2', emoji: '🧭', label: 'Trois attributs', value: 'direction, sens, longueur' },
        { id: 'r3', emoji: '🔢', label: 'Coordonnées', value: 'arrivée − départ' },
        { id: 'r4', emoji: '🔷', label: 'Égalité', value: 'parallélogramme' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Chorégraphe de l’escadrille !',
        title: 'Mission accomplie',
        message: 'Tu sais décrire, reproduire, calculer et construire avec des vecteurs.',
        verbs: ['Décrire', 'Reproduire', 'Calculer', 'Construire'],
        masterBadgeLabel: 'Chorégraphe de l’escadrille',
      }}
    />
  );
}
