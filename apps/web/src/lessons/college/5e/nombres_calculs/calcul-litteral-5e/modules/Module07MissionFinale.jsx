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
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules. Les contextes changent (taxi, cantine, clôture, timbres, gradins) et
 * chaque distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   — coller le coefficient et la valeur, 5n avec n = 3 lu « 53 » (M4) ;
 *   — oublier la partie fixe (M4) ;
 *   — ajouter au lieu de multiplier (M3) ;
 *   — inverser coefficient et constante dans une traduction (M3) ;
 *   — mal placer les parenthèses (M3) ;
 *   — ne distribuer que sur le premier terme (M5).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucune réduction d'expression
 * complexe, aucune factorisation, aucune double distributivité, aucune
 * résolution formelle d'équation. Les seules transformations demandées sont la
 * substitution et le développement par un NOMBRE.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 6 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  lettre: { label: 'Ce qu’est une lettre', emoji: '🔤', module: 2 },
  role: { label: 'Inconnue ou variable', emoji: '🎭', module: 2 },
  traduire: { label: 'Traduire une situation', emoji: '📝', module: 3 },
  substituer: { label: 'Remplacer par un nombre', emoji: '🔁', module: 4 },
  developper: { label: 'Développer', emoji: '📐', module: 5 },
  formule: { label: 'Produire une formule', emoji: '💡', module: 6 },
};

const BADGES = [
  { id: 'b-lettre', emoji: '🔤', label: 'Ami des lettres', test: (m) => !m.lettre },
  { id: 'b-traduire', emoji: '📝', label: 'Traducteur', test: (m) => !m.traduire },
  { id: 'b-substituer', emoji: '🔁', label: 'Roi de la substitution', test: (m) => !m.substituer },
  { id: 'b-developper', emoji: '📐', label: 'Découpeur de rectangles', test: (m) => !m.developper },
  { id: 'b-formule', emoji: '💡', label: 'Inventeur de formules', test: (m) => !m.formule },
  { id: 'b-parfait', emoji: '💎', label: 'La bonne recette', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'cl5-e1',
    skill: 'lettre',
    title: 'Ce que dit la lettre',
    prompt: 'Dans l’expression 7t + 2, que représente la lettre t ?',
    options: [
      'La place d’un nombre, qu’on peut choisir',
      'L’initiale du mot « total »',
      'Un nombre secret, toujours le même',
      'Le résultat du calcul',
    ],
    cols: 1,
    requires: ['calcul-litteral'],
    explain: 'Une lettre marque l’emplacement d’un nombre non fixé. Avec t = 3 l’expression vaut 23, avec t = 10 elle vaut 72 : c’est la même recette dans les deux cas. La lettre n’est pas choisie pour son sens — on aurait pu écrire x ou n.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P1'] },
  },
  {
    id: 'cl5-e2',
    skill: 'role',
    title: 'Quel rôle ?',
    prompt: '« Un taxi facture 4 € de prise en charge puis 2 € par kilomètre. Combien coûte un trajet de k kilomètres ? » — quel est le rôle de k ?',
    options: [
      'Une variable : la formule doit répondre pour toutes les distances',
      'Une inconnue : il n’y a qu’une seule distance possible',
      'Une constante : k ne change jamais',
      'k n’a pas de rôle : c’est une unité de mesure',
    ],
    cols: 1,
    requires: ['inconnue-variable', 'calcul-litteral'],
    explain: 'On ne cherche pas une distance précise : on veut une formule valable pour n’importe quel trajet. La lettre est donc une variable. Si l’on avait demandé « quelle distance pour payer 20 € ? », elle aurait été une inconnue.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P2'] },
  },
  {
    id: 'cl5-e3',
    skill: 'traduire',
    title: 'La course en taxi',
    prompt: 'Ce même taxi : 4 € de prise en charge, puis 2 € par kilomètre. Quelle expression donne le prix pour k kilomètres ?',
    options: ['2k + 4', '4k + 2', '2 + 4 + k', '(2 + 4)k'],
    cols: 4,
    requires: ['ecrire-expression', 'calcul-litteral'],
    explain: 'Les 2 € se répètent à chaque kilomètre : ils multiplient k. Les 4 € ne se paient qu’une fois : ils s’ajoutent. D’où 2k + 4. (4k + 2 ferait payer 4 € par kilomètre, ce que l’énoncé ne dit pas.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P3'] },
  },
  {
    id: 'cl5-e4',
    skill: 'traduire',
    title: 'L’ordre des mots',
    prompt: '« J’ajoute 5 à un nombre, puis je multiplie le tout par 3. » Quelle expression correspond ?',
    options: ['3 × (n + 5)', '3n + 5', 'n + 5 × 3', '3n × 5'],
    cols: 4,
    requires: ['ecrire-expression'],
    explain: 'Les mots « le tout » imposent les parenthèses : on ajoute d’abord, on multiplie ensuite. Avec n = 2, cela donne 3 × 7 = 21, alors que 3n + 5 donnerait 11 : ce ne sont pas les mêmes recettes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P3'] },
  },
  {
    id: 'cl5-e5',
    skill: 'substituer',
    title: 'La cantine',
    prompt: 'Le prix d’un repas est donné par 5n + 12, où n est le nombre de repas supplémentaires. Combien vaut cette expression pour n = 3 ?',
    options: ['27', '53', '15', '20'],
    cols: 4,
    requires: ['substituer', 'calcul-litteral'],
    explain: '5n signifie 5 × n. On remplace : 5 × 3 + 12 = 15 + 12 = 27. (53 vient de coller le 5 et le 3 ; 15 d’oublier le + 12.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P4'] },
  },
  {
    id: 'cl5-e6',
    skill: 'substituer',
    title: 'La valeur zéro',
    prompt: 'Que vaut l’expression 6n + 9 quand n = 0 ?',
    options: ['9', '0', '15', '69'],
    cols: 4,
    requires: ['substituer'],
    explain: '6 × 0 = 0, donc il ne reste que 9. C’est la preuve que le + 9 ne dépend pas du tout de n : c’est la partie fixe de l’expression.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P4'] },
  },
  {
    id: 'cl5-e7',
    skill: 'developper',
    title: 'Le champ clôturé',
    prompt: 'Comment se développe 5 × (n + 3) ?',
    options: ['5n + 15', '5n + 3', '5n × 15', 'n + 15'],
    cols: 4,
    requires: ['distributivite', 'mem-developper'],
    explain: 'Le facteur 5 se pose sur les DEUX morceaux : 5 × n = 5n et 5 × 3 = 15, soit 5n + 15. Vérification avec n = 2 : 5 × 5 = 25, et 5 × 2 + 15 = 25. ✓ (5n + 3 reviendrait à n’avoir multiplié que le premier morceau.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P5'] },
  },
  {
    id: 'cl5-e8',
    skill: 'developper',
    title: 'Le contre-exemple',
    prompt: 'Un élève écrit 2 × (n + 6) = 2n + 6. Comment lui prouver que c’est faux ?',
    options: [
      'Avec n = 1 : à gauche 14, à droite 8 — les deux écritures diffèrent',
      'En lui disant que ce n’est pas la règle apprise',
      'En comptant les termes de chaque côté',
      'On ne peut pas : les deux écritures sont équivalentes',
    ],
    cols: 1,
    requires: ['distributivite', 'substituer'],
    explain: 'Une égalité doit être vraie pour TOUTES les valeurs : il suffit donc d’en trouver UNE qui la met en défaut. Avec n = 1 : 2 × 7 = 14, alors que 2 × 1 + 6 = 8. Le contre-exemple suffit, et on peut toujours en fabriquer un seul.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P5'] },
  },
  {
    id: 'cl5-e9',
    skill: 'formule',
    title: 'Les timbres',
    prompt: 'Une collection compte 12 timbres au départ, et on en ajoute 5 chaque mois. Quelle formule donne le nombre de timbres après m mois ?',
    options: ['5m + 12', '12m + 5', '5 + 12 + m', '17m'],
    cols: 4,
    requires: ['produire-formule', 'ecrire-expression'],
    explain: 'Les 5 timbres se répètent chaque mois : ils multiplient m. Les 12 du départ ne se comptent qu’une fois. D’où 5m + 12. Vérification après 2 mois : 5 × 2 + 12 = 22, et en comptant : 12, puis 17, puis 22. ✓',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P6'] },
  },
  {
    id: 'cl5-e10',
    skill: 'formule',
    title: 'Les gradins',
    prompt: 'Un gradin a 8 places au premier rang, et chaque rang suivant en compte 3 de plus. La formule est 3r + 5, où r est le numéro du rang. Combien de places au rang 40 ?',
    options: ['125', '120', '345', '48'],
    cols: 4,
    requires: ['produire-formule', 'substituer'],
    explain: '3 × 40 + 5 = 120 + 5 = 125. (120 oublie le + 5 ; 345 vient de coller le 3 et le 40.) Contrôle rapide : la formule doit redonner 8 au rang 1, et 3 × 1 + 5 = 8. ✓',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_calcul-litteral-5e_P6', '5e_calcul-litteral-5e_P4'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la bonne recette"
      moduleSubtitle="Dix épreuves pour prouver qu’une lettre ne fait plus peur"
      estimatedTime="6 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'La bonne recette',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, reviens au même réflexe :{' '}
            <strong>qu’est-ce qui se répète, et qu’est-ce qui reste fixe ?</strong>
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🔤', label: 'Une lettre', value: 'la place d’un nombre' },
        { id: 'r2', emoji: '🔁', label: '3n', value: 'veut dire 3 × n' },
        { id: 'r3', emoji: '📐', label: 'k × (a + b)', value: 'k × a + k × b' },
        { id: 'r4', emoji: '💡', label: 'Une formule', value: 'se vérifie sur un cas connu' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'La bonne recette !',
        title: 'Mission accomplie',
        message: 'Tu sais lire, écrire, substituer et développer une expression littérale.',
        verbs: ['Lire', 'Traduire', 'Substituer', 'Développer'],
        masterBadgeLabel: 'La bonne recette',
      }}
    />
  );
}
