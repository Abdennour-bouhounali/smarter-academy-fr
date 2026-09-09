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
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend l'enquête des
 * livres. Les contextes changent (sport, cantine, transport, jeu vidéo,
 * météo) et chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — confondre la valeur et l'effectif (M2) ;
 *   — comparer deux effectifs sans regarder les totaux (M3) ;
 *   — lire une hauteur de barre comme une valeur (M4) ;
 *   — croire qu'un axe tronqué est acceptable (M4) ;
 *   — calculer un angle à partir de l'effectif brut (M5) ;
 *   — diviser par le nombre de valeurs différentes (M6) ;
 *   — étendre la moyenne à chaque individu (M7).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 7 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  organiser: { label: 'Organiser', emoji: '🗂️', module: 2 },
  effectif: { label: 'Effectifs', emoji: '🔢', module: 2 },
  frequence: { label: 'Fréquences', emoji: '🍰', module: 3 },
  graphique: { label: 'Représenter', emoji: '📊', module: 5 },
  moyenne: { label: 'Moyenne', emoji: '⚖️', module: 6 },
  interpreter: { label: 'Interpréter', emoji: '🔎', module: 7 },
};

const BADGES = [
  { id: 'b-organiser', emoji: '🗂️', label: 'Enquêteur méthodique', test: (m) => !m.organiser },
  { id: 'b-effectif', emoji: '🔢', label: 'Compteur sûr', test: (m) => !m.effectif },
  { id: 'b-frequence', emoji: '🍰', label: 'Maître des parts', test: (m) => !m.frequence },
  { id: 'b-graphique', emoji: '📊', label: 'Dessinateur de données', test: (m) => !m.graphique },
  { id: 'b-moyenne', emoji: '⚖️', label: 'Partageur équitable', test: (m) => !m.moyenne },
  { id: 'b-interpreter', emoji: '🔎', label: 'Œil critique', test: (m) => !m.interpreter },
  { id: 'b-parfait', emoji: '💎', label: 'Enquête complète', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'stat5-e1',
    skill: 'organiser',
    title: 'Le sondage sport',
    prompt: 'On demande à 20 élèves leur sport préféré et on obtient une liste en désordre. À quoi sert de la ranger dans un tableau ?',
    options: [
      'À rendre les données lisibles, sans rien y ajouter ni retirer',
      'À augmenter le nombre de réponses',
      'À supprimer les réponses rares',
      'À calculer directement la moyenne',
    ],
    cols: 1,
    requires: ['serie-donnees', 'tableau-effectifs'],
    explain: 'Ranger ne crée aucune information : les 20 réponses restent les 20 mêmes. Le tableau les rend seulement lisibles, ce qui permet ensuite de compter sans se tromper.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P1'] },
  },
  {
    id: 'stat5-e2',
    skill: 'effectif',
    title: 'La cantine',
    prompt: 'Dans un tableau des desserts choisis, la colonne « Yaourt » indique 7. Que compte ce nombre 7 ?',
    options: [
      '7 élèves ont choisi un yaourt',
      '7 yaourts par élève',
      'Le yaourt coûte 7 €',
      'Il y a 7 desserts différents',
    ],
    cols: 1,
    requires: ['effectif'],
    explain: 'Un effectif compte toujours des individus : ici, 7 élèves. C’est la confusion valeur/effectif qui piège le plus souvent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P2'] },
  },
  {
    id: 'stat5-e3',
    skill: 'effectif',
    title: 'Le contrôle des totaux',
    prompt: 'Un élève interroge 25 camarades. Les effectifs de son tableau sont 6, 8, 5 et 4. Que peut-il en conclure ?',
    options: [
      'Il a oublié 2 réponses, car 6 + 8 + 5 + 4 = 23',
      'Son tableau est juste',
      'Il a interrogé 23 camarades en réalité',
      'Il doit recalculer la moyenne',
    ],
    cols: 1,
    requires: ['effectif', 'tableau-effectifs'],
    explain: '6 + 8 + 5 + 4 = 23, alors qu’il a interrogé 25 camarades. La somme des effectifs doit valoir l’effectif total : il manque donc 2 réponses.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P2', '5e_statistiques-5e_P1'] },
  },
  {
    id: 'stat5-e4',
    skill: 'frequence',
    title: 'Deux collèges',
    prompt: 'Au collège Nord, 30 élèves sur 200 viennent à vélo. Au collège Sud, 24 sur 120. Où le vélo est-il le plus utilisé ?',
    options: [
      'Au collège Sud (20 % contre 15 %)',
      'Au collège Nord, car 30 > 24',
      'C’est identique',
      'On ne peut pas comparer',
    ],
    cols: 1,
    requires: ['frequence'],
    explain: 'Nord : 30/200 = 15 %. Sud : 24/120 = 20 %. Le collège Sud a moins de cyclistes en nombre, mais une plus grande part de ses élèves.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P3'] },
  },
  {
    id: 'stat5-e5',
    skill: 'frequence',
    title: 'La somme qui cloche',
    prompt: 'Un tableau de fréquences affiche 25 %, 40 %, 20 % et 5 %. Que faut-il en penser ?',
    options: [
      'Il manque 10 % : une catégorie a été oubliée',
      'C’est normal, les fréquences ne font jamais 100 %',
      'Il faut multiplier chaque valeur par 2',
      'La plus grande fréquence est fausse',
    ],
    cols: 1,
    requires: ['frequence', 'mem-frequences'],
    explain: '25 + 40 + 20 + 5 = 90 %. Or les parts d’un même tout font toujours 100 % : il manque 10 %, donc une catégorie ou des individus non comptés.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P3'] },
  },
  {
    id: 'stat5-e6',
    skill: 'graphique',
    title: 'La barre la plus haute',
    prompt: 'Sur un diagramme en barres des notes, la barre située au-dessus de la note 8 est la plus haute. Que cela signifie-t-il ?',
    options: [
      'C’est la note obtenue par le plus grand nombre d’élèves',
      'C’est la meilleure note de la classe',
      'C’est la moyenne de la classe',
      '8 élèves ont eu la meilleure note',
    ],
    cols: 1,
    requires: ['diagramme-barres', 'effectif'],
    explain: 'La hauteur d’une barre est un EFFECTIF : la plus haute désigne la note la plus fréquente, pas la plus grande ni la moyenne.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P4'] },
  },
  {
    id: 'stat5-e7',
    skill: 'graphique',
    title: 'Le graphique du journal',
    prompt: 'Un journal montre deux barres où l’une paraît trois fois plus haute que l’autre, mais l’axe vertical commence à 95. Quel est le problème ?',
    options: [
      'L’axe ne part pas de 0 : l’écart réel est bien plus petit qu’il n’y paraît',
      'Il manque les couleurs',
      'Les barres devraient être triées',
      'Il n’y a aucun problème',
    ],
    cols: 1,
    requires: ['diagramme-barres'],
    explain: 'Aucun chiffre n’est faux, mais couper le bas de l’axe amplifie visuellement les écarts. Un diagramme en barres honnête part toujours de 0.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P4'] },
  },
  {
    id: 'stat5-e8',
    skill: 'graphique',
    title: 'L’angle du secteur',
    prompt: 'Sur 30 joueurs interrogés, 10 préfèrent les jeux de course. Quel angle doit mesurer leur secteur sur le diagramme circulaire ?',
    options: ['120°', '10°', '360°', '30°'],
    cols: 4,
    requires: ['diagramme-circulaire', 'frequence'],
    explain: '10 sur 30, c’est un tiers : 10/30 × 360° = 120°. On applique la FRÉQUENCE au tour complet, jamais l’effectif brut.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P5'] },
  },
  {
    id: 'stat5-e9',
    skill: 'moyenne',
    title: 'La moyenne des trajets',
    prompt: 'Cinq élèves mettent 5, 10, 10, 15 et 10 minutes pour venir au collège. Quelle est la durée moyenne ?',
    options: ['10 minutes', '12,5 minutes', '50 minutes', '3 minutes'],
    cols: 4,
    requires: ['moyenne', 'mem-moyenne'],
    explain: '5 + 10 + 10 + 15 + 10 = 50, et il y a 5 élèves : 50 ÷ 5 = 10 minutes. (12,5 vient d’une division par 4, le nombre de valeurs différentes.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P6'] },
  },
  {
    id: 'stat5-e10',
    skill: 'interpreter',
    title: 'La phrase de trop',
    prompt: 'La température moyenne d’une semaine est de 15 °C. Quelle affirmation est justifiée ?',
    options: [
      'Le total des sept températures divisé par 7 donne 15',
      'Il a fait 15 °C chaque jour de la semaine',
      'Aucun jour n’a dépassé 15 °C',
      'La semaine suivante fera aussi 15 °C',
    ],
    cols: 1,
    requires: ['interpreter', 'moyenne'],
    explain: 'La moyenne dit seulement comment se répartirait le total si tous les jours étaient identiques. Elle n’interdit ni les jours à 5 °C ni ceux à 25 °C, et ne prédit rien de la semaine suivante.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_statistiques-5e_P7', '5e_statistiques-5e_P6'] },
  },
];

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      lessonConfig={LESSON_CONFIG}
      moduleNumber={8}
      moduleTitle="Mission finale : l’enquête complète"
      moduleSubtitle="Dix épreuves, de la question posée à l’interprétation"
      estimatedTime="6 min"
      brief={{
        tag: 'Évaluation',
        title: 'Mène l’enquête jusqu’au bout',
        tone: 'amber',
        body: (
          <p>
            Dix situations nouvelles — sport, cantine, transport, jeux, météo. Aucune ne reprend
            l’enquête des livres : il s’agit de <strong>transférer</strong> ce que tu sais faire.
            Les réponses ne s’affichent qu’à la fin.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🔢', label: 'Effectif', value: 'des individus' },
        { id: 'r2', emoji: '🍰', label: 'Fréquence', value: 'effectif ÷ total' },
        { id: 'r3', emoji: '📐', label: 'Angle', value: 'fréquence × 360°' },
        { id: 'r4', emoji: '⚖️', label: 'Moyenne', value: 'somme ÷ effectif' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Enquête complète !',
        title: 'Mission accomplie',
        message: 'Tu sais organiser des données, les compter, les comparer, les représenter, les résumer — et dire ce qu’elles ne disent pas.',
        verbs: ['Organiser', 'Compter', 'Représenter', 'Interpréter'],
        masterBadgeLabel: 'Enquête complète',
      }}
    />
  );
}
