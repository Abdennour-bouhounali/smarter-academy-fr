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
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les valeurs des
 * modules (ni « ×3 puis +2 », ni l'enclos de 20 m, ni la citerne de 300 L), et
 * chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — remonter sans retourner l'ordre (M1) ;
 *   — croire qu'une étape « ×0 » se défait comme les autres (M1) ;
 *   — appliquer les étapes dans le mauvais ordre en exécutant (M2) ;
 *   — écrire « 3x + 2 » pour « ajouter 2 puis multiplier par 3 » (M3) ;
 *   — valider une écriture sur un seul couple (M4) ;
 *   — croire que « dépendre » veut dire « augmenter ensemble » (M5, M6) ;
 *   — oublier le domaine d'une situation réelle (M6).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 * `badges[].test` est une FONCTION `(misses) => bool`.
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts —
 * P1 (é1, é10), P2 (é2, é3), P3 (é4, é5), P4 (é6, é7), P5 (é8), P6 (é9, é10).
 *
 * PÉRIMÈTRE : aucune épreuve n'emploie la notation f(x), ni les mots
 * « image » et « antécédent », ni « linéaire » ou « affine ». On demande
 * « quelle entrée donne 47 ? », jamais « l'antécédent de 47 ».
 */
const SKILLS = {
  executer: { label: 'Descendre la chaîne', module: 2, emoji: '⬇️' },
  remonter: { label: 'Remonter la chaîne', module: 1, emoji: '⬆️' },
  ecrire: { label: 'Produire la formule', module: 3, emoji: '✏️' },
  modeliser: { label: 'Tableau, dessin, situation', module: 6, emoji: '🧭' },
};

const BADGES = [
  { id: 'b-exec', emoji: '⬇️', label: 'Machiniste', test: (m) => !m.executer },
  { id: 'b-rem', emoji: '⬆️', label: 'Remonte-chaîne', test: (m) => !m.remonter },
  { id: 'b-ecr', emoji: '✏️', label: 'Plume des formules', test: (m) => !m.ecrire },
  { id: 'b-mod', emoji: '🧭', label: 'Modélisateur', test: (m) => !m.modeliser },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des machines', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'f4-e1',
    skill: 'remonter',
    title: 'Le chemin du retour',
    prompt: 'Un programme fait « multiplier par 4, puis ajouter 7 ». Comment le remonte-t-on ?',
    options: [
      'Diviser par 4, puis soustraire 7',
      'Soustraire 7, puis diviser par 4',
      'Multiplier par 4, puis soustraire 7',
      'Ajouter 7, puis diviser par 4',
    ],
    correct: 1,
    cols: 1,
    requires: ['remonter-la-chaine', 'chaine-orientee'],
    explain: 'Deux choses se retournent en même temps : chaque opération devient son contraire, ET l’ordre s’inverse. La dernière étape faite (« + 7 ») est la première à défaire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P1'] },
  },
  {
    id: 'f4-e2',
    skill: 'executer',
    title: 'Descendre la chaîne',
    prompt: 'Programme : « soustraire 3, puis multiplier par 5 ». Que rend-il pour 8 ?',
    options: ['25', '37', '40', '13'],
    correct: 0,
    cols: 4,
    requires: ['meme-chaine-toutes-entrees', 'chaine-orientee'],
    explain: '8 − 3 = 5, puis 5 × 5 = 25. (37 viendrait de multiplier d’abord : 8 × 5 = 40, puis 40 − 3.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P2'] },
  },
  {
    id: 'f4-e3',
    skill: 'executer',
    title: 'Une entrée négative',
    prompt: 'Programme : « multiplier par 3, puis ajouter 6 ». Que rend-il pour −4 ?',
    options: ['−6', '18', '6', '−18'],
    correct: 0,
    cols: 4,
    requires: ['meme-chaine-toutes-entrees'],
    explain: '−4 × 3 = −12, puis −12 + 6 = −6. Un programme traite les nombres négatifs comme les autres : il ne fait pas d’exception.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P2'] },
  },
  {
    id: 'f4-e4',
    skill: 'ecrire',
    title: 'Dire la machine',
    prompt: 'Quelle écriture résume « multiplier par 6, puis soustraire 5 » ?',
    options: ['6x − 5', '6 − 5x', '5x − 6', '6x + 5'],
    correct: 0,
    cols: 4,
    requires: ['formule-qui-resume'],
    explain: 'On multiplie l’entrée par 6, ce qui donne 6x, puis on retranche 5. L’écriture suit l’ordre des étapes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P3'] },
  },
  {
    id: 'f4-e5',
    skill: 'ecrire',
    title: 'L’ordre change tout',
    prompt: 'Quelle écriture résume « ajouter 4, puis multiplier par 2 » ?',
    options: ['2x + 4', '2x + 8', '4x + 2', 'x + 8'],
    correct: 1,
    cols: 4,
    requires: ['formule-qui-resume'],
    explain: 'On ajoute 4 d’abord, donc c’est le résultat de « x + 4 » qu’on multiplie par 2 : le 4 est multiplié lui aussi et devient 8. Contrôle sur 3 : la chaîne donne 14, et 2 × 3 + 8 = 14.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P3'] },
  },
  {
    id: 'f4-e6',
    skill: 'modeliser',
    title: 'La règle du tableau',
    prompt: 'Un tableau donne : 1 → 9, 2 → 13, 3 → 17, 5 → 25. Quelle écriture l’explique ?',
    options: ['9x', '4x + 5', '5x + 4', 'x + 8'],
    correct: 1,
    cols: 4,
    requires: ['du-tableau-a-la-formule'],
    explain: 'Quand l’entrée augmente de 1, la sortie augmente de 4 : le nombre devant l’entrée est donc 4. Pour retomber sur 9 quand l’entrée vaut 1, il faut ajouter 5. Vérification sur les quatre couples, et pas seulement sur le premier.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P4'] },
  },
  {
    id: 'f4-e7',
    skill: 'modeliser',
    title: 'Une candidate à moitié bonne',
    prompt: 'Une écriture donne le bon résultat pour deux couples d’un tableau de quatre, et se trompe sur les deux autres. Que vaut-elle ?',
    options: [
      'Elle est bonne pour la moitié du tableau',
      'Il manque un couple pour trancher',
      'Elle est fausse : une règle doit expliquer TOUS les couples',
      'Elle est bonne, aux arrondis près',
    ],
    correct: 2,
    cols: 1,
    requires: ['du-tableau-a-la-formule'],
    explain: 'Une écriture prétend dire ce que la machine fait pour tout nombre. Un seul couple qui la dément suffit à la réfuter — il n’existe pas de règle « à moitié vraie ».',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P4'] },
  },
  {
    id: 'f4-e8',
    skill: 'modeliser',
    title: 'Le dessin qui descend',
    prompt: 'Les points d’une machine, placés dans un repère, forment une ligne qui DESCEND. Que peut-on dire de son écriture ?',
    options: [
      'Le nombre devant l’entrée est négatif',
      'Ce n’est pas une vraie dépendance',
      'Le nombre qu’on ajoute est négatif',
      'La machine ne fonctionne pas pour les grandes entrées',
    ],
    correct: 0,
    cols: 1,
    requires: ['formule-en-dessin', 'dependance-qui-diminue'],
    explain: 'Quand l’entrée avance d’un pas, la sortie change du nombre placé devant l’entrée. S’il est négatif, la sortie perd à chaque pas et la ligne descend — ce qui reste une dépendance parfaitement ordinaire.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P5'] },
  },
  {
    id: 'f4-e9',
    skill: 'modeliser',
    title: 'Le forfait du photographe',
    prompt: 'Un photographe demande 30 € de déplacement, puis 12 € par portrait. Quelle écriture donne le prix pour x portraits ?',
    options: ['30x + 12', '42x', '12x + 30', '12 + 30'],
    correct: 2,
    cols: 4,
    requires: ['modeliser-une-situation', 'formule-qui-resume'],
    explain: 'Chaque portrait coûte 12 €, donc x portraits coûtent 12x ; le déplacement s’ajoute une seule fois, quel que soit le nombre de portraits. Contrôle : pour 0 portrait, on paie déjà 30 €.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P6'] },
  },
  {
    id: 'f4-e10',
    skill: 'remonter',
    title: 'Combien de portraits ?',
    prompt: 'Même photographe : 30 € de déplacement, puis 12 € par portrait. Une facture s’élève à 102 €. Combien de portraits ont été pris ?',
    options: ['9 portraits', '6 portraits', '8 portraits', '11 portraits'],
    correct: 1,
    cols: 4,
    requires: ['remonter-la-chaine', 'modeliser-une-situation'],
    explain: 'On remonte : 102 − 30 = 72, puis 72 ÷ 12 = 6 portraits. Contrôle en redescendant : 6 × 12 = 72, puis 72 + 30 = 102 €. (9 portraits viendrait de diviser 102 par 12 sans retirer d’abord le déplacement.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_fonctions-4e_P1', '4e_fonctions-4e_P6'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : l’atelier"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="6 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'L’atelier',
        tone: 'amber',
        body: (
          <>
            Dix machines à descendre, à remonter, à résumer et à dessiner. Réponds à tout, puis
            soumets : aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Machines maîtrisées',
        title: 'Mission accomplie',
        message: 'Tu sais descendre une chaîne de calcul, la remonter, la résumer d’un seul trait et la dessiner — et tu sais t’en servir sur une vraie situation.',
        verbs: ['Exécuter', 'Remonter', 'Résumer', 'Modéliser'],
        masterBadgeLabel: 'Maître des machines',
      }}
    />
  );
}
