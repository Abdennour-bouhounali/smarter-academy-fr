import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { PARC, formatCoords } from '../components/reperageUtils';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque distracteur
 * encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - le couple inversé (modules 2 et 4) ;
 *   - le signe oublié pour un point à gauche ou en dessous (modules 1 et 3) ;
 *   - la coordonnée nulle d'un point sur un axe (module 3) ;
 *   - la longueur obtenue en additionnant au lieu de soustraire (module 5) ;
 *   - la longueur oblique traitée comme une longueur d'axe (module 5) ;
 *   - le symétrique dont on change la mauvaise coordonnée (module 7).
 *
 * Couverture : les 10 LPs de la leçon apparaissent dans `assessment`.
 */
const RANGE = PARC.range;

const Figure = ({ points, segments = [], polygons = [], label }) => (
  <div className="flex justify-center my-2">
    <CoordPlane
      range={RANGE}
      points={points}
      segments={segments}
      polygons={polygons}
      caption={false}
      ariaLabel={label}
    />
  </div>
);

const EPREUVES = [
  {
    id: 'rd-e1',
    skill: 'droite',
    title: 'Sur la droite graduée',
    prompt: 'Un banc est à 3 graduations à gauche de l’origine. Quelle est son abscisse ?',
    options: ['−3', '3', '0,3', 'on ne peut pas savoir'],
    cols: 4,
    explain: 'À gauche de l’origine, l’abscisse est négative : −3. La valeur donne la distance, le signe donne le côté.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P1'] },
  },
  {
    id: 'rd-e2',
    skill: 'roles',
    title: 'Le rôle de chaque nombre',
    prompt: 'Dans le couple (−5 ; 2), que désigne le nombre −5 ?',
    options: [
      'L’abscisse : le décalage horizontal, ici vers la gauche',
      'L’ordonnée : le décalage vertical, ici vers le bas',
      'La distance à l’origine',
      'Le numéro du quadrant',
    ],
    cols: 1,
    explain: 'Le premier nombre du couple est toujours l’abscisse. Elle se lit sur l’axe horizontal, et son signe − indique la gauche.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P3'] },
  },
  {
    id: 'rd-e3',
    skill: 'lire',
    title: 'Lire un point',
    prompt: 'Quelles sont les coordonnées du point P ?',
    extra: (
      <Figure
        points={[{ id: 'P', name: 'P', x: -2, y: -4, color: '#e11d48' }]}
        label="Point P situé à deux graduations à gauche et quatre vers le bas"
      />
    ),
    options: ['(−2 ; −4)', '(−4 ; −2)', '(2 ; 4)', '(−2 ; 4)'],
    cols: 4,
    explain: 'P est 2 à gauche (abscisse −2) et 4 en dessous (ordonnée −4) : (−2 ; −4). (−4 ; −2) est le couple inversé, il désigne un autre point.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P5', '3e_reperage-droite-plan-3e_P2'] },
  },
  {
    id: 'rd-e4',
    skill: 'lire',
    title: 'Un point sur un axe',
    prompt: 'Un point est situé sur l’axe vertical, 3 graduations au-dessus de l’origine. Quelles sont ses coordonnées ?',
    options: ['(0 ; 3)', '(3 ; 0)', '(3 ; 3)', 'il n’en a pas'],
    cols: 4,
    explain: 'Sur l’axe vertical, on ne s’est pas décalé horizontalement : l’abscisse vaut 0. D’où (0 ; 3).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P2'] },
  },
  {
    id: 'rd-e5',
    skill: 'placer',
    title: 'Placer un point',
    prompt: 'Où se trouve le point Q (4 ; −1) ?',
    options: [
      'À droite de l’axe vertical et en dessous de l’axe horizontal',
      'À gauche et au-dessus',
      'À droite et au-dessus',
      'Sur l’axe horizontal',
    ],
    cols: 1,
    explain: 'Abscisse positive : à droite. Ordonnée négative : en dessous. Q est donc en bas à droite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P4'] },
  },
  {
    id: 'rd-e6',
    skill: 'deplacer',
    title: 'Un déplacement',
    prompt: 'Un point part de (−1 ; 2). Il avance de 4 vers la droite et descend de 5. Où arrive-t-il ?',
    options: ['(3 ; −3)', '(−5 ; 7)', '(3 ; 7)', '(4 ; −5)'],
    cols: 4,
    explain: 'On ajoute le déplacement à chaque coordonnée séparément : −1 + 4 = 3, et 2 − 5 = −3. D’où (3 ; −3).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P6'] },
  },
  {
    id: 'rd-e7',
    skill: 'longueur',
    title: 'Une longueur horizontale',
    prompt: 'A (−4 ; 1) et B (2 ; 1). Quelle est la longueur AB ?',
    options: ['6', '−6', '2', '−2'],
    cols: 4,
    explain: 'Même ordonnée : le segment est horizontal. AB = |2 − (−4)| = 6. Une longueur est toujours positive.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P7'] },
  },
  {
    id: 'rd-e8',
    skill: 'longueur',
    title: 'La limite de la méthode',
    prompt: 'C (0 ; 0) et D (3 ; 4). Que peut-on affirmer ?',
    options: [
      'On ne peut pas obtenir CD par un simple écart de coordonnées : le segment est oblique',
      'CD = 3 + 4 = 7',
      'CD = 4 − 3 = 1',
      'CD = 3, car on prend l’abscisse',
    ],
    cols: 1,
    explain: 'Les deux coordonnées changent : le segment n’est ni horizontal ni vertical, l’écart d’une seule coordonnée ne suffit pas. Il faudra le théorème de Pythagore.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P7', '3e_reperage-droite-plan-3e_P10'] },
  },
  {
    id: 'rd-e9',
    skill: 'figures',
    title: 'Fermer un rectangle',
    prompt: 'ABCD est un rectangle avec A (−3 ; 2), B (2 ; 2) et C (2 ; −1). Quelles sont les coordonnées de D ?',
    extra: (
      <Figure
        points={[
          { id: 'A', name: 'A', x: -3, y: 2, color: '#0f172a' },
          { id: 'B', name: 'B', x: 2, y: 2, color: '#0f172a' },
          { id: 'C', name: 'C', x: 2, y: -1, color: '#0f172a' },
        ]}
        segments={[
          { id: 'ab', from: { x: -3, y: 2 }, to: { x: 2, y: 2 }, color: '#0f172a' },
          { id: 'bc', from: { x: 2, y: 2 }, to: { x: 2, y: -1 }, color: '#0f172a' },
        ]}
        label="Trois sommets d’un rectangle : A, B et C"
      />
    ),
    options: ['(−3 ; −1)', '(−1 ; −3)', '(3 ; −1)', '(−3 ; 1)'],
    cols: 4,
    explain: 'D est sous A, donc il garde son abscisse (−3) ; il est à la hauteur de C, donc il prend son ordonnée (−1). D (−3 ; −1).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P8', '3e_reperage-droite-plan-3e_P9'] },
  },
  {
    id: 'rd-e10',
    skill: 'figures',
    title: 'Le symétrique',
    prompt: 'Quel est le symétrique de S (3 ; −2) par rapport à l’axe horizontal ?',
    options: ['(3 ; 2)', '(−3 ; −2)', '(−3 ; 2)', '(−2 ; 3)'],
    cols: 4,
    explain: 'Par rapport à l’axe horizontal, l’abscisse ne bouge pas et l’ordonnée change de signe : (3 ; 2). Changer l’abscisse serait la symétrie par rapport à l’axe vertical.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_reperage-droite-plan-3e_P8', '3e_reperage-droite-plan-3e_P10'] },
  },
];

const SKILLS = {
  droite: { label: 'Repérer sur une droite', module: 1 },
  roles: { label: 'Abscisse et ordonnée', module: 2 },
  lire: { label: 'Lire un point', module: 3 },
  placer: { label: 'Placer un point', module: 4 },
  deplacer: { label: 'Se déplacer', module: 4 },
  longueur: { label: 'Longueurs et milieux', module: 5 },
  figures: { label: 'Figures et raisonnement', module: 7 },
};

const BADGES = [
  { id: 'b-droite', emoji: '🏅', label: 'Maître de la droite graduée', test: (m) => !m.droite },
  { id: 'b-roles', emoji: '🏅', label: 'Jamais d’inversion', test: (m) => !m.roles },
  { id: 'b-lire', emoji: '🏅', label: 'Lecteur de cartes', test: (m) => !m.lire },
  { id: 'b-placer', emoji: '🏅', label: 'Poseur de points', test: (m) => !m.placer && !m.deplacer },
  { id: 'b-longueur', emoji: '🏅', label: 'Mesureur sans règle', test: (m) => !m.longueur },
  { id: 'b-figures', emoji: '🏅', label: 'Géomètre du parc', test: (m) => !m.figures },
  {
    id: 'b-parfait', emoji: '💎', label: 'Cartographe du parc',
    test: (m) => Object.keys(m).length === 0,
  },
];

/** La synthèse : le repère du parc, figé, avec ce qu'on y a appris à lire. */
function Synthese() {
  const rect = [{ x: -4, y: 3 }, { x: 3, y: 3 }, { x: 3, y: -2 }, { x: -4, y: -2 }];
  return (
    <div className="space-y-3">
      <CoordPlane
        range={RANGE}
        points={[
          ...PARC.lieux.map((l) => ({ id: l.id, name: l.emoji, x: l.x, y: l.y, color: '#0f172a' })),
          { id: 'M', name: 'M', x: -4, y: 3, color: '#4f46e5' },
        ]}
        polygons={[{ id: 'r', points: rect, fill: '#c7d2fe', stroke: '#4f46e5' }]}
        guides={{ x: -4, y: 3 }}
        caption={false}
        ariaLabel="Le parc complet dans son repère, avec un rectangle et les projections d’un point"
      />
      <div className="grid sm:grid-cols-3 gap-2 text-sm">
        {[
          { t: 'Un couple ordonné', d: `M ${formatCoords({ x: -4, y: 3 })} : l’abscisse d’abord, l’ordonnée ensuite.` },
          { t: 'Deux projections', d: 'Lire un point, c’est le projeter sur chacun des deux axes.' },
          { t: 'Des longueurs lues', d: 'Côté horizontal : 7. Côté vertical : 5. Sans règle.' },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
            <p className="font-semibold text-slate-800">{t}</p>
            <p className="text-xs text-slate-600">{d}</p>
          </div>
        ))}
      </div>
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
      moduleTitle="🏆 Mission finale : la carte du parc"
      moduleSubtitle="Dix épreuves pour prouver qu’aucun point ne t’échappe"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Cartographe du parc',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Prends le temps de te représenter chaque
            point : l’abscisse d’abord, l’ordonnée ensuite.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '⛲', label: 'Origine', value: '(0 ; 0)' },
        { id: 'r2', emoji: '↔️', label: 'Abscisse', value: 'axe horizontal' },
        { id: 'r3', emoji: '↕️', label: 'Ordonnée', value: 'axe vertical' },
        { id: 'r4', emoji: '📏', label: 'Longueur', value: 'écart des coordonnées' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Cartographe du parc !',
        title: 'Mission accomplie',
        message: 'Tu sais repérer, placer, mesurer et démontrer avec des coordonnées.',
        verbs: ['Repérer', 'Placer', 'Mesurer', 'Démontrer'],
        masterBadgeLabel: 'Cartographe du parc',
      }}
    />
  );
}
