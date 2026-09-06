import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import TriangleLab from '../components/TriangleLab';
import CompassBuilder from '../components/CompassBuilder';
import MidlineLab from '../components/MidlineLab';
import { FIGURES } from '../components/triangleUtils';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque distracteur
 * encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - croire que trois longueurs quelconques font toujours un triangle (M1) ;
 *   - confondre isocèle et équilatéral (M2, M5) ;
 *   - oublier de diviser par 2 les angles à la base (M5) ;
 *   - additionner les angles connus sans les retrancher à 180 (M3, M5) ;
 *   - donner un résultat sans le justifier (M6) ;
 *   - multiplier au lieu de diviser dans la droite des milieux (M7).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur (scripts/validate-lessons.mjs).
 */
const EPREUVES = [
  {
    id: 'tr-e1',
    skill: 'constructible',
    requires: ['inegalite-triangulaire'],
    title: 'Constructible ?',
    prompt: 'Peut-on construire un triangle de côtés 4 cm, 5 cm et 11 cm ?',
    options: [
      'Non : 4 + 5 = 9, c’est moins que 11',
      'Oui, toutes les longueurs sont différentes',
      'Oui, si on l’aplatit un peu',
      'Il faudrait connaître les angles pour le dire',
    ],
    cols: 1,
    explain: 'Inégalité triangulaire : le plus grand côté doit être plus court que la somme des deux autres. Ici 4 + 5 = 9 < 11, les arcs du compas ne se rencontrent jamais.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P5'] },
  },
  {
    id: 'tr-e2',
    skill: 'reconnaitre',
    requires: ['triangles-particuliers'],
    title: 'Le bon nom',
    prompt: 'Dans le triangle ABC, on a AB = 6 cm, AC = 6 cm et BC = 4 cm. Comment s’appelle-t-il, et en quel sommet ?',
    options: ['Isocèle en A', 'Isocèle en B', 'Équilatéral', 'Rectangle en A'],
    cols: 4,
    explain: 'Les deux côtés égaux sont [AB] et [AC] : ils partent tous deux de A, qui est donc le sommet principal. Le triangle est isocèle EN A. Il ne serait équilatéral que si les trois côtés étaient égaux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P1', '3e_triangles-3e_P3'] },
  },
  {
    id: 'tr-e3',
    skill: 'reconnaitre',
    requires: ['triangles-particuliers'],
    title: 'Deux propriétés à la fois',
    prompt: 'Un triangle peut-il être à la fois rectangle et isocèle ?',
    options: [
      'Oui : il a alors un angle droit et deux angles de 45°',
      'Non, les deux propriétés s’excluent',
      'Oui, mais seulement s’il est aussi équilatéral',
      'Non, un triangle rectangle a forcément trois côtés différents',
    ],
    cols: 1,
    explain: 'Les propriétés se cumulent. Un demi-carré coupé en diagonale est rectangle et isocèle : un angle droit, et deux angles de 45°.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P1', '3e_triangles-3e_P2'] },
  },
  {
    id: 'tr-e4',
    skill: 'somme',
    requires: ['somme-des-angles', 'mem-consequences-180'],
    title: 'Le troisième angle',
    prompt: 'Dans un triangle, deux angles mesurent 38° et 74°. Combien mesure le troisième ?',
    options: ['68°', '112°', '46°', '138°'],
    cols: 4,
    explain: '180 − 38 − 74 = 68°. La réponse 112° serait la somme des deux angles connus, pas le troisième.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P4'] },
  },
  {
    id: 'tr-e5',
    skill: 'somme',
    requires: ['somme-des-angles', 'mem-consequences-180'],
    title: 'Dans un rectangle',
    prompt: 'Un triangle rectangle a un angle de 28°. Combien mesure son autre angle aigu ?',
    options: ['62°', '152°', '72°', '28°'],
    cols: 4,
    explain: 'L’angle droit occupe 90°, il reste 90° pour les deux angles aigus : 90 − 28 = 62°.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P4', '3e_triangles-3e_P7'] },
  },
  {
    id: 'tr-e6',
    skill: 'particuliers',
    requires: ['triangles-particuliers', 'mem-consequences-180'],
    title: 'Les angles d’un isocèle',
    prompt: 'ABC est isocèle en A et l’angle en A mesure 30°. Combien mesure l’angle en B ?',
    options: ['75°', '150°', '60°', '30°'],
    cols: 4,
    explain: 'Les angles à la base B et C sont égaux. Il reste 180 − 30 = 150° à partager en deux : 75° chacun. La réponse 150° oublie ce partage.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P2', '3e_triangles-3e_P7'] },
  },
  {
    id: 'tr-e7',
    skill: 'construire',
    requires: ['triangle-determine', 'mediatrice-sommet-isocele'],
    title: 'Où placer le sommet',
    prompt: 'On veut un triangle ABC isocèle en C, avec [AB] déjà tracé. Où doit se trouver C ?',
    options: [
      'Sur la médiatrice de [AB], c’est-à-dire à égale distance de A et de B',
      'Sur le segment [AB] lui-même',
      'N’importe où au-dessus de [AB]',
      'À la même distance de A que la longueur AB',
    ],
    cols: 1,
    explain: 'Isocèle en C signifie CA = CB : C est donc équidistant de A et de B, c’est-à-dire sur la médiatrice de [AB].',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P6', '3e_triangles-3e_P8'] },
  },
  {
    id: 'tr-e8',
    skill: 'justifier',
    requires: ['justifier'],
    title: 'Une copie incomplète',
    prompt: 'Un élève écrit seulement : « ABC est isocèle en A, donc l’angle B mesure 65°. » Que manque-t-il ?',
    options: [
      'Les propriétés invoquées : angles à la base égaux, et somme des angles égale à 180°',
      'Rien, le résultat est juste',
      'La mesure au rapporteur pour vérifier',
      'Le dessin de la figure à l’échelle',
    ],
    cols: 1,
    explain: 'Une démonstration relie la donnée à la conclusion PAR des propriétés nommées. Sans elles, le lecteur ne peut pas vérifier le raisonnement.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P10'] },
  },
  {
    id: 'tr-e9',
    skill: 'milieux',
    requires: ['droite-des-milieux'],
    title: 'La droite des milieux',
    prompt: 'Dans le triangle MNP, R est le milieu de [MN] et S celui de [MP]. Si NP = 12 cm, combien mesure RS ?',
    options: ['6 cm', '24 cm', '12 cm', 'on ne peut pas le savoir'],
    cols: 4,
    explain: 'Le segment joignant les milieux de deux côtés mesure la moitié du troisième : 12 ÷ 2 = 6 cm. La réponse 24 cm multiplie au lieu de diviser.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P9', '3e_triangles-3e_P7'] },
  },
  {
    id: 'tr-e10',
    skill: 'milieux',
    requires: ['droite-des-milieux'],
    title: 'Un problème de charpente',
    prompt: 'Une ferme de charpente a la forme d’un triangle isocèle de base 8 m. On pose une entretoise entre les milieux des deux autres côtés. Quelle est sa longueur, et pourquoi ?',
    options: [
      '4 m, car l’entretoise joint les milieux de deux côtés : elle vaut la moitié de la base',
      '8 m, car elle est parallèle à la base',
      '16 m, car il faut doubler la base',
      'Impossible à dire sans connaître les angles',
    ],
    cols: 1,
    explain: 'C’est exactement la droite des milieux : l’entretoise est parallèle à la base et en vaut la moitié, soit 4 m. Le caractère isocèle ne change rien à ce calcul.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_triangles-3e_P11', '3e_triangles-3e_P9'] },
  },
];

const SKILLS = {
  constructible: { label: 'Inégalité triangulaire', module: 1 },
  reconnaitre: { label: 'Reconnaître un triangle', module: 2 },
  somme: { label: 'Somme des angles', module: 3 },
  particuliers: { label: 'Triangles particuliers', module: 5 },
  construire: { label: 'Construire', module: 4 },
  justifier: { label: 'Justifier', module: 6 },
  milieux: { label: 'Droite des milieux', module: 7 },
};

const BADGES = [
  { id: 'b-const', emoji: '🏅', label: 'Charpentier prudent', test: (m) => !m.constructible },
  { id: 'b-recon', emoji: '🏅', label: 'Nomme sans se tromper', test: (m) => !m.reconnaitre },
  { id: 'b-somme', emoji: '🏅', label: 'Maître des 180°', test: (m) => !m.somme && !m.particuliers },
  { id: 'b-constr', emoji: '🏅', label: 'Constructeur', test: (m) => !m.construire },
  { id: 'b-just', emoji: '🏅', label: 'Rédacteur rigoureux', test: (m) => !m.justifier },
  { id: 'b-mil', emoji: '🏅', label: 'Chasseur de conjectures', test: (m) => !m.milieux },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de la charpente', test: (m) => Object.keys(m).length === 0 },
];

/** La synthèse : les trois gestes de la leçon, figés. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">Le compas décide</p>
          <CompassBuilder sides={{ a: 3, b: 4, c: 8 }}
            ariaLabel="Arcs de rayons 4 et 3 sur une base de 8 : ils ne se rencontrent pas" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">Le nom est calculé</p>
          <TriangleLab points={FIGURES.isocele} draggable={false} showLengths
            ariaLabel="Triangle isocèle en C avec ses longueurs" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-700 text-center">La conjecture tient</p>
        <MidlineLab points={FIGURES.quelconque} disabled
          ariaLabel="Triangle et sa droite des milieux, parallèle et deux fois plus courte" />
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-sm">
        {[
          { t: 'Inégalité triangulaire', d: 'Le plus grand côté reste plus court que la somme des deux autres.' },
          { t: 'Somme des angles', d: 'Toujours 180°, quelle que soit la forme du triangle.' },
          { t: 'Droite des milieux', d: 'Parallèle au troisième côté, et deux fois plus courte.' },
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
      moduleTitle="🏆 Mission finale : la charpente"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises les triangles"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de la charpente',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, demande-toi d’abord
            quelle propriété s’applique — puis calcule.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📏', label: 'Constructible', value: 'grand côté < somme' },
        { id: 'r2', emoji: '📐', label: 'Somme', value: '180°' },
        { id: 'r3', emoji: '🔺', label: 'Isocèle', value: 'angles à la base égaux' },
        { id: 'r4', emoji: '➗', label: 'Milieux', value: 'moitié du 3ᵉ côté' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître de la charpente !',
        title: 'Mission accomplie',
        message: 'Tu sais construire, calculer, conjecturer et justifier dans un triangle.',
        verbs: ['Construire', 'Calculer', 'Conjecturer', 'Justifier'],
        masterBadgeLabel: 'Maître de la charpente',
      }}
    />
  );
}
