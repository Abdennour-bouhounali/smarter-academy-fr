import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import ThalesLab from '../components/ThalesLab';
import { FIGURES } from '../components/thalesUtils';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque distracteur
 * encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - croire qu'un « petit triangle dans un grand » suffit (M2) ;
 *   - oublier la condition de parallélisme (M2, M5) ;
 *   - inverser un rapport en écrivant AC/AN (M3) ;
 *   - choisir une paire avec deux inconnues (M4) ;
 *   - inverser le produit en croix, d'où un résultat incohérent (M4, M7) ;
 *   - comparer des différences au lieu de rapports (M5) ;
 *   - invoquer le théorème direct dans une réciproque (M6).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur.
 */
const EPREUVES = [
  {
    id: 'th-e1',
    skill: 'config',
    requires: ['configuration-thales', 'triangle-papillon', 'droites-secantes'],
    title: 'Reconnaître',
    prompt: 'Quelles conditions définissent une configuration de Thalès ?',
    options: [
      'Deux droites sécantes en un même point, coupées par deux droites parallèles',
      'Un petit triangle situé à l’intérieur d’un grand triangle',
      'Deux triangles ayant la même aire',
      'Trois points alignés, sans autre condition',
    ],
    cols: 1,
    explain: 'Il faut les DEUX : un point d’intersection commun, et le parallélisme. Un petit triangle dans un grand ne suffit pas si les côtés ne sont pas parallèles.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P1'] },
  },
  {
    id: 'th-e2',
    skill: 'config',
    requires: ['configuration-thales', 'triangle-papillon', 'droites-secantes'],
    title: 'La condition indispensable',
    prompt: 'Dans une configuration où les droites (MN) et (BC) ne sont PAS parallèles, peut-on appliquer le théorème de Thalès ?',
    options: [
      'Non : le parallélisme est la condition même du théorème',
      'Oui, mais avec des rapports approximatifs',
      'Oui, si les points sont alignés',
      'Oui, à condition que le triangle soit isocèle',
    ],
    cols: 1,
    explain: 'Sans parallélisme, aucun rapport ne se conserve — tu l’as constaté en déplaçant N librement : les trois cases affichaient des nombres différents.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P2'] },
  },
  {
    id: 'th-e3',
    skill: 'rapports',
    requires: ['theoreme-thales'],
    title: 'Écrire les rapports',
    prompt: 'ABC est un triangle, M sur [AB] et N sur [AC], avec (MN) ∥ (BC). Quelle égalité est correcte ?',
    options: [
      '$\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$',
      '$\\frac{AM}{AB} = \\frac{AC}{AN} = \\frac{MN}{BC}$',
      '$\\frac{AM}{MB} = \\frac{AN}{NC} = \\frac{MN}{BC}$',
      '$AM = AN = MN$',
    ],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => [
      'AM/AB = AN/AC = MN/BC',
      'AM/AB = AC/AN = MN/BC',
      'AM/MB = AN/NC = MN/BC',
      'AM = AN = MN',
    ][i],
    cols: 1,
    explain: 'Chaque fraction se lit « petit sur grand », en partant toujours du sommet A. Écrire AC/AN inverse une fraction et rend l’égalité fausse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P3', '3e_thales-3e_P5'] },
  },
  {
    id: 'th-e4',
    skill: 'rapports',
    requires: ['theoreme-thales'],
    title: 'Ce qui se conserve',
    prompt: 'Quand on déplace M sur (AB) en gardant (MN) ∥ (BC), qu’est-ce qui reste constant ?',
    options: [
      'Les trois rapports, qui restent égaux entre eux',
      'La longueur MN',
      'La différence AB − AM',
      'L’aire du triangle AMN',
    ],
    cols: 1,
    explain: 'Toutes les longueurs changent ; ce sont les QUOTIENTS qui restent égaux entre eux. C’est précisément ce que tu as relevé trois fois de suite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P4'] },
  },
  {
    id: 'th-e5',
    skill: 'calculer',
    requires: ['methode-calculer-longueur', 'theoreme-thales'],
    title: 'Choisir la bonne paire',
    prompt: 'On connaît AM = 4, AB = 12 et BC = 18, et on cherche MN. Quelle égalité utiliser ?',
    options: [
      '$\\frac{AM}{AB} = \\frac{MN}{BC}$',
      '$\\frac{AN}{AC} = \\frac{MN}{BC}$',
      '$\\frac{AM}{AB} = \\frac{AN}{AC}$',
      '$\\frac{MN}{AM} = \\frac{BC}{AB}$',
    ],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['AM/AB = MN/BC', 'AN/AC = MN/BC', 'AM/AB = AN/AC', 'MN/AM = BC/AB'][i],
    cols: 1,
    explain: 'Il faut une paire contenant trois longueurs connues et une seule inconnue. AN et AC ne sont pas données : les égalités qui les contiennent ne permettent aucun calcul.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P7'] },
  },
  {
    id: 'th-e6',
    skill: 'calculer',
    requires: ['methode-calculer-longueur', 'theoreme-thales'],
    title: 'Le calcul',
    prompt: 'Avec AM = 4, AB = 12 et BC = 18, combien mesure MN ?',
    options: ['6', '54', '10', '14'],
    cols: 4,
    explain: 'MN = (4 × 18) ÷ 12 = 6. La réponse 54 vient d’un produit en croix inversé : elle donnerait un MN trois fois plus long que BC, ce qui est impossible pour le petit segment.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P6'] },
  },
  {
    id: 'th-e7',
    skill: 'coherence',
    requires: ['mem-controle-rapport'],
    title: 'Un résultat suspect',
    prompt: 'Dans une configuration où AM/AB = 0,25, un élève trouve MN = 40 alors que BC = 16. Que peut-on dire ?',
    options: [
      'C’est faux : avec un rapport de 0,25, MN doit être quatre fois plus court que BC',
      'C’est plausible, il faut refaire le calcul',
      'C’est juste, MN peut dépasser BC',
      'On ne peut rien dire sans connaître AN',
    ],
    cols: 1,
    explain: 'Un rapport inférieur à 1 signifie une réduction : la longueur cherchée est forcément plus petite que sa correspondante. Ce contrôle rattrape le produit en croix inversé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P8'] },
  },
  {
    id: 'th-e8',
    skill: 'reciproque',
    requires: ['reciproque-thales', 'contraposee-thales'],
    title: 'Démontrer un parallélisme',
    prompt: 'A, M, B alignés dans cet ordre et A, N, C aussi. AM = 3, AB = 12, AN = 5, AC = 20. Les droites (MN) et (BC) sont-elles parallèles ?',
    options: [
      'Oui : 3/12 = 0,25 et 5/20 = 0,25, d’après la réciproque du théorème de Thalès',
      'Non : les longueurs sont différentes',
      'Oui : 12 − 3 = 9 et 20 − 5 = 15, les différences sont proportionnelles',
      'On ne peut pas conclure sans mesurer un angle',
    ],
    cols: 1,
    explain: 'On compare les deux rapports : 0,25 et 0,25. Ils sont égaux, et les points sont alignés dans le même ordre : la réciproque permet de conclure au parallélisme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P9'] },
  },
  {
    id: 'th-e9',
    skill: 'reciproque',
    requires: ['reciproque-thales', 'contraposee-thales'],
    title: 'La contraposée',
    prompt: 'AM = 4, AB = 9, AN = 6, AC = 14. On calcule 4/9 ≈ 0,444 et 6/14 ≈ 0,429. Que conclut-on ?',
    options: [
      'Les rapports diffèrent : d’après la contraposée, (MN) et (BC) ne sont pas parallèles',
      'Les rapports sont presque égaux, donc les droites sont parallèles',
      'On ne peut rien conclure quand les rapports sont proches',
      'Il faut appliquer le théorème de Thalès',
    ],
    cols: 1,
    explain: 'En géométrie, « presque égal » n’existe pas : deux rapports différents suffisent à conclure que les droites ne sont PAS parallèles. C’est la contraposée du théorème.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P10'] },
  },
  {
    id: 'th-e10',
    skill: 'rediger',
    requires: ['choisir-enonce'],
    title: 'Khéops',
    prompt: 'Un bâton de 1,5 m projette une ombre de 2 m ; au même instant l’ombre de la pyramide mesure 187,4 m. Quelle est sa hauteur, au dixième ?',
    options: ['140,6 m', '249,9 m', '124,9 m', '281,1 m'],
    cols: 4,
    explain: 'Les rapports hauteur ÷ ombre sont égaux : h = (1,5 × 187,4) ÷ 2 ≈ 140,6 m. La réponse 249,9 m vient d’un produit en croix inversé — elle dépasserait l’ombre, alors que le bâton est plus court que la sienne.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_thales-3e_P12', '3e_thales-3e_P11'] },
  },
];

const SKILLS = {
  config: { label: 'Reconnaître la configuration', module: 2 },
  rapports: { label: 'Écrire les rapports', module: 3 },
  calculer: { label: 'Calculer une longueur', module: 4 },
  coherence: { label: 'Vérifier la cohérence', module: 4 },
  reciproque: { label: 'Réciproque et contraposée', module: 5 },
  rediger: { label: 'Rédiger et résoudre', module: 7 },
};

const BADGES = [
  { id: 'b-config', emoji: '🏅', label: 'Œil pour la configuration', test: (m) => !m.config },
  { id: 'b-rap', emoji: '🏅', label: 'Rapports sans faute', test: (m) => !m.rapports },
  { id: 'b-calc', emoji: '🏅', label: 'Produit en croix maîtrisé', test: (m) => !m.calculer },
  { id: 'b-coh', emoji: '🏅', label: 'Esprit critique', test: (m) => !m.coherence },
  { id: 'b-rec', emoji: '🏅', label: 'Démonstrateur', test: (m) => !m.reciproque },
  { id: 'b-red', emoji: '🏅', label: 'Géomètre de terrain', test: (m) => !m.rediger },
  { id: 'b-parfait', emoji: '💎', label: 'Arpenteur de Khéops', test: (m) => Object.keys(m).length === 0 },
];

/** La synthèse : la configuration figée, rapports affichés. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">Configuration triangle</p>
          <ThalesLab figure={FIGURES.triangle} k={0.4} mode="parallel" disabled
            ariaLabel="Configuration de Thalès avec ses trois rapports égaux" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">Configuration papillon</p>
          <ThalesLab figure={FIGURES.triangle} k={-0.45} mode="parallel" disabled allowPapillon
            ariaLabel="Configuration papillon avec ses trois rapports égaux" />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-sm">
        {[
          { t: 'Théorème', d: 'Parallèles donnés ⇒ les trois rapports sont égaux.' },
          { t: 'Réciproque', d: 'Rapports égaux et même ordre ⇒ droites parallèles.' },
          { t: 'Contrôle', d: 'Rapport < 1 ⇒ la longueur cherchée est plus courte.' },
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
      moduleTitle="🏆 Mission finale : l’arpenteur"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises Thalès"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Arpenteur de Khéops',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune : la configuration est-elle
            valide, et le parallélisme est-il une donnée ou la question ?
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📐', label: 'Configuration', value: 'sécantes + parallèles' },
        { id: 'r2', emoji: '➗', label: 'Rapports', value: 'petit sur grand' },
        { id: 'r3', emoji: '✖️', label: 'Calcul', value: 'produit en croix' },
        { id: 'r4', emoji: '🔁', label: 'Réciproque', value: 'rapports ⇒ parallèles' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Arpenteur de Khéops !',
        title: 'Mission accomplie',
        message: 'Tu sais reconnaître la configuration, écrire les rapports, calculer et démontrer.',
        verbs: ['Reconnaître', 'Écrire', 'Calculer', 'Démontrer'],
        masterBadgeLabel: 'Arpenteur de Khéops',
      }}
    />
  );
}
