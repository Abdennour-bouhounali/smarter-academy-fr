import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import DataTable from '../components/DataTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { TOURNOI, ELEVES } from '../components/tournoiData';
import { makeTable, rowTotal } from '../components/tableUtils';

/**
 * Module 7 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Fichier de DONNÉES : épreuves, compétences, badges, synthèse. Le moteur
 * `BossFinal` impose la forme (silence jusqu'à la validation, puis Boss →
 * Mon profil → Synthèse) et branche l'evidence et la persistance.
 *
 * Les dix épreuves sont écrites EN DERNIER : chaque distracteur encode un
 * piège réellement travaillé dans les modules 1 à 6 —
 *   · glisser d'une ligne (M4)         → « la valeur de la ligne d'à côté »
 *   · glisser d'une colonne (M4)       → « la valeur de la colonne voisine »
 *   · confondre meilleure case et meilleur total (M5)
 *   · additionner deux grandeurs différentes (M6 : 27 + 8 au lieu de 27 × 8)
 *   · croire qu'un nombre a un sens sans ses en-têtes (M2)
 *
 * Couverture des 9 LPs : P1 (e1), P2 (e2), P3 (e3, e4), P4 (e5), P5 (e6),
 * P6 (e7), P7 (e8), P8 (e9), P9 (e10).
 */
const REGISTRE = [
  { id: 'tournoi', emoji: '🏅', label: 'Tournoi', value: '6e B' },
  { id: 'eleves', emoji: '👦', label: 'Élèves', value: '4' },
  { id: 'epreuves', emoji: '🎯', label: 'Épreuves', value: '4' },
  { id: 'total', emoji: '➕', label: 'Décision', value: 'au total' },
];

const SKILLS = {
  interet: { label: "L'intérêt d'un tableau", module: 1 },
  anatomie: { label: 'Lignes, colonnes, en-têtes', module: 2 },
  lire: { label: 'Lire un croisement', module: 4 },
  ranger: { label: 'Ranger et compléter', module: 3 },
  construire: { label: 'Construire un tableau', module: 6 },
  comparer: { label: 'Comparer et décider', module: 5 },
};

const TOTALS = ELEVES.map((_, r) => rowTotal(TOURNOI, r)); // [36, 34, 37, 31]

const CANTINE = makeTable({
  rowHeader: 'Jour',
  colHeaders: ['Entrées', 'Desserts'],
  rowLabels: ['Lundi', 'Mardi', 'Jeudi'],
  values: [[38, 41], [45, 39], [36, 44]],
  unit: null,
});

const LIBRAIRIE = makeTable({
  rowHeader: 'Article',
  colHeaders: ['Quantité', 'Prix à l’unité'],
  rowLabels: ['Cahiers', 'Stylos'],
  values: [[12, 3], [20, 2]],
  unit: null,
});

const EPREUVES = [
  {
    id: 'tb-e1',
    requires: ['tableau-outil'],
    skill: 'interet',
    title: 'Épreuve 1',
    prompt: 'Le professeur a noté les 16 résultats du tournoi dans un paragraphe. Pourquoi les recopier dans un tableau ?',
    options: [
      'Pour que la feuille soit plus jolie',
      'Pour retrouver chaque information d’un seul coup d’œil',
      'Pour que les scores augmentent',
    ],
    cols: 1,
    correct: 1,
    explain: 'Un tableau ne modifie aucun nombre : il les range. Le gain est le temps de lecture — c’est exactement ce que tu as ressenti au module 1.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P1'] },
  },
  {
    id: 'tb-e2',
    requires: ['ligne-colonne', 'entete'],
    skill: 'anatomie',
    title: 'Épreuve 2',
    prompt: 'Dans le tableau du tournoi, que contient la colonne « Relais » ?',
    extra: <DataTable table={TOURNOI} caption="Tournoi de la 6e B" tone="amber" />,
    options: [
      'Les quatre résultats d’un même élève',
      'Les résultats de tous les élèves à cette épreuve',
      'Le total des points du tournoi',
    ],
    cols: 1,
    correct: 1,
    explain: 'Une colonne rassemble une même catégorie pour tout le monde (ici l’épreuve du relais). Ce sont les LIGNES qui suivent un même élève.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P2'] },
  },
  {
    id: 'tb-e3',
    requires: ['lire-un-croisement'],
    skill: 'lire',
    title: 'Épreuve 3',
    prompt: 'Combien Hugo a-t-il marqué en précision ?',
    extra: <DataTable table={TOURNOI} caption="Tournoi de la 6e B" tone="amber" />,
    options: ['5 points', '9 points', '10 points'],
    cols: 3,
    correct: 1,
    explain: 'Ligne Hugo, colonne Précision : 9 points. (5 serait son saut — mauvaise colonne ; 10 la précision d’Inès — mauvaise ligne.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P3'] },
  },
  {
    id: 'tb-e4',
    requires: ['lecture-inverse', 'entete'],
    skill: 'lire',
    title: 'Épreuve 4',
    prompt: 'Qui a marqué 6 points au saut ?',
    extra: <DataTable table={TOURNOI} caption="Tournoi de la 6e B" tone="amber" />,
    options: ELEVES,
    cols: 4,
    correct: 1,
    explain: 'On part de la colonne Saut, on trouve le 6, puis on remonte à son en-tête de ligne : Tom. Lire à l’envers, c’est le même croisement.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P3'] },
  },
  {
    id: 'tb-e5',
    requires: ['position-porte-sens', 'cellule-croisement', 'ligne-colonne'],
    skill: 'ranger',
    title: 'Épreuve 5',
    prompt: 'La cantine a servi 44 desserts le jeudi, mais la case est vide. Où faut-il écrire 44 ?',
    extra: <DataTable table={CANTINE} caption="Repas servis à la cantine" tone="amber" />,
    options: [
      'Ligne « Jeudi », colonne « Desserts »',
      'Ligne « Desserts », colonne « Jeudi »',
      'N’importe où dans la dernière ligne',
    ],
    cols: 1,
    correct: 0,
    explain: 'Ici les jours font les lignes et les plats les colonnes : le 44 va au croisement de la ligne Jeudi et de la colonne Desserts. Inverser les deux, c’est décrire un tableau qui n’existe pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P4'] },
  },
  {
    id: 'tb-e6',
    requires: ['choisir-structure'],
    skill: 'ranger',
    title: 'Épreuve 6',
    prompt: 'On relève la taille de 5 élèves au début et à la fin de l’année. Comment organiser ces 10 mesures ?',
    options: [
      '5 lignes (les élèves) et 2 colonnes (début, fin)',
      '10 lignes, une par mesure',
      '1 seule colonne avec les 10 nombres',
    ],
    cols: 1,
    correct: 0,
    explain: 'Deux familles d’information : les élèves et les moments. L’une fait les lignes, l’autre les colonnes. Une liste de 10 mesures ramènerait le désordre du départ.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P5'] },
  },
  {
    id: 'tb-e7',
    requires: ['entete', 'choisir-structure'],
    skill: 'construire',
    title: 'Épreuve 7',
    prompt: 'Pour un tableau des prix de 4 fruits dans 3 magasins, que doivent dire les en-têtes ?',
    options: [
      'Rien : les nombres suffisent',
      'Le nom des fruits et celui des magasins',
      'Seulement les prix les plus bas',
    ],
    cols: 1,
    correct: 1,
    explain: 'Sans en-têtes, un prix ne dit ni de quel fruit ni de quel magasin il s’agit — le nombre perd tout sens, comme le 15 isolé du module 2.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P6'] },
  },
  {
    id: 'tb-e8',
    requires: ['total-decide', 'comparer-entiers'],
    skill: 'comparer',
    title: 'Épreuve 8',
    prompt: `Tom détient la plus grosse case du tableau (15 au relais). Qui remporte le tournoi au total ?`,
    extra: <DataTable table={TOURNOI} caption="Tournoi de la 6e B" tone="amber" showRowTotals />,
    options: ELEVES,
    cols: 4,
    correct: 2,
    explain: `Inès totalise ${TOTALS[2]} points sans avoir gagné une seule épreuve ; Tom n’en a que ${TOTALS[1]}. La meilleure cellule ne fait pas le meilleur classement — seul le total de la ligne décide.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P7'] },
  },
  {
    id: 'tb-e9',
    requires: ['total-decide', 'position-porte-sens', 'calcul-numerique'],
    skill: 'comparer',
    title: 'Épreuve 9',
    prompt: `On corrige une erreur : le saut d’Hugo passe de 5 à 12 points. Que devient son total ?`,
    extra: <DataTable table={TOURNOI} caption="Tournoi de la 6e B" tone="amber" showRowTotals />,
    options: [`${TOTALS[3]} points`, '38 points', '12 points'],
    cols: 3,
    correct: 1,
    explain: `Hugo avait ${TOTALS[3]} points ; il gagne 7 points de plus (12 au lieu de 5), donc 38. Modifier une seule cellule change le total de toute sa ligne — et parfois le classement.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P8'] },
  },
  {
    id: 'tb-e10',
    requires: ['lire-un-croisement', 'comparer-sens-lecture', 'calcul-numerique'],
    skill: 'construire',
    title: 'Épreuve 10',
    prompt: 'Dernière commande : combien coûtent les cahiers en tout ?',
    extra: <DataTable table={LIBRAIRIE} caption="Commande de la librairie (prix en €)" tone="amber" />,
    options: ['15 €', '36 €', '40 €'],
    cols: 3,
    correct: 1,
    explain: '12 cahiers à 3 € l’unité : 12 × 3 = 36 €. (15 €, c’est 12 + 3 — on additionnerait des cahiers et des euros ; 40 €, c’est la ligne des stylos.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_tableaux_P9'] },
  },
];

const BADGES = [
  { id: 'organisateur', emoji: '🏅', label: 'Organisateur', test: (s) => (s.interet ?? 0) === 0 && (s.anatomie ?? 0) === 0 },
  { id: 'lecteur', emoji: '🏅', label: 'Œil de lynx', test: (s) => (s.lire ?? 0) === 0 },
  { id: 'rangeur', emoji: '🏅', label: 'Roi du rangement', test: (s) => (s.ranger ?? 0) === 0 },
  { id: 'architecte', emoji: '🏅', label: 'Architecte de tableaux', test: (s) => (s.construire ?? 0) === 0 },
  { id: 'juge', emoji: '🏅', label: 'Juge du tournoi', test: (s) => (s.comparer ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Maître des données', test: (s) => Object.values(s).every((v) => v === 0) },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">📋</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Un tableau ne change aucun nombre : il leur donne une place. Et c'est la place — ligne × colonne —
          qui transforme un nombre en information.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700 text-center">Le tournoi, rangé de bout en bout</p>
        <DataTable table={TOURNOI} caption="Tournoi de la 6e B — le tableau complet, totaux compris" tone="emerald" showRowTotals />
        <p className="text-center text-xs text-slate-500">
          Inès l'emporte avec {TOTALS[2]} points sans gagner une seule épreuve.
        </p>
      </div>

      {/* La carte complète REMPLACE les deux bandeaux recopiés à la main
          (« À retenir » et « les pièges à éviter ») : une leçon n'a qu'une
          source de connaissances (docs/architecture/KNOWLEDGE_MAP.md). Les
          pièges y vivent déjà, dans les items qui les portent. */}
      <KnowledgeSnapshot complete variant="complete" />

      <Feedback tone="info">
        Scores, horaires, températures, commandes : dès que deux familles d'information se croisent, le
        tableau est l'outil. Le prochain chapitre lui donnera une image — le graphique.
      </Feedback>
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : le tournoi des 6e"
      moduleSubtitle="Dix épreuves pour dépouiller le tournoi et désigner les vainqueurs."
      estimatedTime="11 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Le tournoi est fini : à toi de dépouiller les résultats.',
        tone: 'amber',
        body: (
          <p>
            Lire un croisement, ranger une donnée, construire une grille, comparer des totaux : tout y passe.
            Réponds à toutes les épreuves, puis valide pour découvrir ta correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des données !',
        title: 'Mission accomplie !',
        message: (
          <>
            Du paragraphe illisible au classement final, tu as rangé, lu, complété, comparé et construit —
            sans jamais te tromper de ligne.
          </>
        ),
        verbs: ['Ranger', 'Lire', 'Comparer', 'Construire'],
        masterBadgeLabel: 'Badge « Maître des données » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
