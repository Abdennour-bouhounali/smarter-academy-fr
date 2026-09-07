import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION. Distracteurs : marge prise pour une case (e5),
 * effectifs additionnés sur un OU sans retirer l'intersection (e8), NON mal
 * complémenté (e9), comparaison d'effectifs bruts entre groupes inégaux (e10),
 * variable ordinale prise pour nominale (e3). Les 10 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'tc-e1', skill: 'variables', requires: ['qualitative-nominale-ordinale', 'serie-statistique'], title: 'Variable qualitative', prompt: 'Laquelle de ces variables est qualitative ?', options: ['Le sport pratiqué', 'La taille en centimètres', 'Le nombre de frères et sœurs', 'La durée d’un trajet'], cols: 2, explain: 'Une variable qualitative prend pour valeurs des modalités (des mots), pas des nombres sur lesquels on calcule.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P1'] } },
  { id: 'tc-e2', skill: 'variables', requires: ['qualitative-nominale-ordinale'], title: 'Nominale', prompt: 'Une variable qualitative NOMINALE est une variable dont les modalités…', options: ['n’ont pas d’ordre naturel', 'sont toujours au nombre de deux', 'sont des nombres', 'peuvent être moyennées'], cols: 2, explain: 'Nominale = sans ordre (couleur des yeux, sport). Ordinale = avec un ordre naturel (niveau, mention).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P2'] } },
  { id: 'tc-e3', skill: 'variables', requires: ['qualitative-nominale-ordinale'], title: 'Ordinale', prompt: 'Laquelle de ces variables est ORDINALE ?', options: ['La mention au bac (passable, AB, B, TB)', 'La ville de naissance', 'La couleur préférée', 'Le prénom'], cols: 2, explain: 'Les mentions se rangent naturellement de la plus faible à la plus forte ; les trois autres n’ont aucun ordre intrinsèque.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P3'] } },
  { id: 'tc-e4', skill: 'construire', requires: ['fichier-donnees'], title: 'Un fichier de données', prompt: 'Dans un fichier de données individuelles, une LIGNE représente…', options: ['un individu, décrit par toutes ses variables', 'une variable, pour tous les individus', 'un effectif', 'une modalité'], cols: 2, explain: 'Une ligne = un individu, une colonne = une variable. C’est ce qui permet ensuite de compter les croisements.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P4'] } },
  { id: 'tc-e5', skill: 'construire', requires: ['tableau-croise', 'mem-case-marge', 'effectifs-marginaux'], title: 'Case ou marge ?', prompt: 'Un tableau croise « sport » et « classe ». Où lit-on le nombre d’élèves de 2de B qui font du judo ?', options: ['Dans la case croisant la ligne judo et la colonne 2de B', 'Dans le total de la ligne judo', 'Dans le total de la colonne 2de B', 'Dans le total général'], cols: 1, explain: 'Une case croise les DEUX caractères ; les marges ne renseignent que sur un seul.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P6', 'seconde_tableaux-croises-2nde_P7'] } },
  { id: 'tc-e6', skill: 'marges', requires: ['effectifs-marginaux', 'effectif'], title: 'Effectif marginal', prompt: 'Une ligne d’un tableau croisé contient 6, 3 et 6. Que vaut son effectif marginal ?', options: ['15', '6', '3', '60'], cols: 4, explain: '6 + 3 + 6 = 15 : l’effectif marginal d’une ligne est la somme de ses cases, toutes colonnes confondues.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P8'] } },
  { id: 'tc-e7', skill: 'marges', requires: ['effectifs-marginaux', 'mem-case-marge', 'effectif'], title: 'La double somme', prompt: 'Dans un tableau croisé correct, la somme des totaux de lignes et la somme des totaux de colonnes…', options: ['sont toutes deux égales à l’effectif total', 'sont en général différentes', 's’additionnent pour donner l’effectif total', 'ne se comparent pas'], cols: 1, explain: 'Chaque individu est compté une fois dans sa ligne et une fois dans sa colonne : les deux sommes valent l’effectif total. C’est une vérification gratuite du comptage.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P8', 'seconde_tableaux-croises-2nde_P7'] } },
  { id: 'tc-e8', skill: 'filtrer', requires: ['filtres-logiques', 'effectif'], title: 'Le OU inclusif', prompt: 'Sur 60 élèves : 20 en 2de B, 19 danseurs, dont 6 en 2de B qui dansent. Combien sont « en 2de B OU danseurs » ?', options: ['33', '39', '6', '45'], cols: 4, explain: '20 + 19 − 6 = 33. Les 6 élèves vérifiant les deux critères seraient comptés deux fois par la simple addition 39.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P10', 'seconde_tableaux-croises-2nde_P5'] } },
  { id: 'tc-e9', skill: 'filtrer', requires: ['filtres-logiques', 'effectif'], title: 'Le NON', prompt: 'Sur 60 élèves, 26 sont en 2de C. Combien ne sont PAS en 2de C ?', options: ['34', '26', '60', '86'], cols: 4, explain: '60 − 26 = 34 : le NON désigne le complémentaire dans la population totale.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P10'] } },
  { id: 'tc-e10', skill: 'interpreter', requires: ['comparer-honnetement', 'effectifs-marginaux', 'effectif'], title: 'Comparer honnêtement', prompt: 'La 2de A (14 élèves) compte 5 danseurs, la 2de C (26 élèves) en compte 8. Que conclure ?', options: [
      'Rapportée à sa classe, la danse est plus fréquente en 2de A : 5 sur 14 dépasse 8 sur 26',
      'La danse est plus populaire en 2de C, puisque 8 > 5',
      'Les deux classes sont équivalentes',
      'On ne peut rien conclure de ce tableau',
    ], cols: 1, explain: '5/14 ≈ 36 % contre 8/26 ≈ 31 %. Comparer des effectifs bruts entre groupes de tailles différentes induit en erreur : il faut rapporter chaque effectif à son groupe.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_tableaux-croises-2nde_P9'] } },
];
const SKILLS = {
  variables: { label: 'Nature des variables', module: 2 },
  construire: { label: 'Construire et lire', module: 1 },
  marges: { label: 'Marges et total', module: 3 },
  filtrer: { label: 'ET, OU, NON', module: 4 },
  interpreter: { label: 'Interpréter', module: 5 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Nominale ou ordinale', test: (m) => !m.variables },
  { id: 'b2', emoji: '🏅', label: 'Une case, une seule', test: (m) => !m.construire },
  { id: 'b3', emoji: '🏅', label: 'Les marges', test: (m) => !m.marges },
  { id: 'b4', emoji: '🏅', label: 'Le OU inclusif', test: (m) => !m.filtrer },
  { id: 'b5', emoji: '🏅', label: 'La comparaison honnête', test: (m) => !m.interpreter },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du club', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLeClub() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le club" moduleSubtitle="Dix épreuves sur les tableaux croisés"
      estimatedTime="10 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Croiser, compter, interpréter', tone: 'amber', body: <p>Dix questions, une seule validation. Réflexe : une case croise deux caractères, une marge un seul, et le OU n’additionne pas bêtement.</p> }}
      registre={[
        { id: 'r1', emoji: '🗂️', label: 'case', value: 'les DEUX caractères' },
        { id: 'r2', emoji: '➡️', label: 'marge', value: 'un SEUL caractère' },
        { id: 'r3', emoji: '∪', label: 'OU', value: 'n(A) + n(B) − n(A et B)' },
        { id: 'r4', emoji: '⚖️', label: 'comparer', value: 'rapporter à son groupe' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Maître du club !', title: 'Mission accomplie', message: 'Tu construis un tableau croisé, tu lis ses marges, tu traduis une phrase en filtre et tu refuses les comparaisons trompeuses.', verbs: ['Croiser', 'Compter', 'Filtrer', 'Interpréter'], masterBadgeLabel: 'Maître du club' }} />
  );
}
