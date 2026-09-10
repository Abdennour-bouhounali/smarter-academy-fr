import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — mission finale.
 *
 * Treize épreuves pour douze learning points : chacun a AU MOINS une épreuve
 * qui lui est propre (`check:lessons` tourne en --strict). Toutes les sorties
 * de programme citées ici ont été exécutées par `pyRun` avant d'être écrites :
 * l'échange raté affiche 2 puis 2, range(1,6) des carrés donne 55, 20 doublé
 * trois fois donne 160.
 */
const code = (src) => (
  <pre className="mt-2 rounded-lg bg-slate-900 px-3 py-2 font-mono text-[15px] leading-relaxed text-slate-100 overflow-x-auto">{src}</pre>
);

const REGISTRE = [
  { id: 'variable', emoji: '📦', label: 'Variable', value: 'nom, valeur, type' },
  { id: 'affect', emoji: '⬅️', label: 'Affectation', value: 'droite → gauche' },
  { id: 'choix', emoji: '🔀', label: 'Condition', value: 'if / else' },
  { id: 'boucle', emoji: '🔁', label: 'Boucles', value: 'for / while' },
  { id: 'lire', emoji: '🔍', label: 'Lire du code', value: 'prévoir, réparer' },
];

const SKILLS = {
  variable: { label: 'Variables et types', module: 1 },
  affect: { label: 'L’affectation', module: 2 },
  choix: { label: 'Séquence et condition', module: 3 },
  boucle: { label: 'Les boucles', module: 4 },
  lire: { label: 'Lire, compléter, réparer', module: 5 },
};

const EPREUVES = [
  {
    id: 'va-e1', skill: 'variable', requires: ['variable-informatique'], title: 'Épreuve 1',
    prompt: 'En informatique, qu’est-ce qu’une variable ?',
    options: [
      'Un emplacement nommé qui garde une valeur, remplaçable à tout moment',
      'Un nombre inconnu qu’il faut trouver',
      'Une lettre qui représente tous les nombres à la fois',
      'Un résultat de calcul définitif',
    ],
    cols: 1, correct: 0,
    explain: 'Une variable informatique est une BOÎTE : elle porte un nom, contient une valeur à un instant donné, et cette valeur peut être remplacée. C’est ce qui la distingue du x des mathématiques, qui désigne une inconnue à déterminer.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P1'] },
  },
  {
    id: 'va-e2', skill: 'variable', requires: ['types-python', 'mem-nom-valeur-type'], title: 'Épreuve 2',
    prompt: 'Quel est le type de la valeur rangée par l’instruction prix = 12.5 ?',
    options: ['Un flottant (float)', 'Un entier (int)', 'Une chaîne (str)', 'Un booléen (bool)'],
    cols: 2, correct: 0,
    explain: '12.5 porte une partie décimale : c’est un flottant. Un entier s’écrit sans point (12), une chaîne entre guillemets ("12.5"), un booléen vaut True ou False.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P2'] },
  },
  {
    id: 'va-e3', skill: 'variable', requires: ['types-python'], title: 'Épreuve 3',
    prompt: 'Parmi ces quatre valeurs, laquelle est une chaîne de caractères ?',
    options: ['"15"', '15', '15.0', 'True'],
    cols: 4, correct: 0,
    explain: 'Les guillemets font la chaîne : "15" est du TEXTE, pas un nombre. On ne peut pas lui ajouter 1 — Python refuserait. 15 est un entier, 15.0 un flottant, True un booléen.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P2'] },
  },
  {
    id: 'va-e4', skill: 'affect', requires: ['affectation', 'regle-ordre-affectation'], title: 'Épreuve 4',
    prompt: 'Que vaut x après ces deux lignes ?',
    extra: code('x = 4\nx = x + 1'),
    options: ['5', '4', 'Rien : l’égalité est impossible', '9'],
    cols: 4, correct: 0,
    explain: 'La droite se calcule D’ABORD avec la valeur actuelle : 4 + 1 = 5. Ce résultat est ensuite rangé dans x, qui perd son ancienne valeur. En mathématiques x = x + 1 n’a pas de solution ; en informatique c’est l’instruction la plus banale qui soit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P3'] },
  },
  {
    id: 'va-e5', skill: 'choix', requires: ['sequence'], title: 'Épreuve 5',
    prompt: 'Que vaut y à la fin de ce programme ?',
    extra: code('x = 2\ny = x * 3\nx = 10'),
    options: ['6', '30', '10', '2'],
    cols: 4, correct: 0,
    explain: 'y a reçu sa valeur à la deuxième ligne, avec le x de ce moment-là : 2 × 3 = 6. Modifier x à la ligne suivante ne recalcule pas y — une affectation fige un résultat, ce n’est pas une formule vivante.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P4'] },
  },
  {
    id: 'va-e6', skill: 'choix', requires: ['conditionnelle', 'regle-cas-limite'], title: 'Épreuve 6',
    prompt: 'Un élève ayant exactement 10 doit être admis. Quelle condition écris-tu ?',
    options: ['if note >= 10:', 'if note > 10:', 'if note = 10:', 'if note != 10:'],
    cols: 2, correct: 0,
    explain: '« Au moins 10 » inclut le 10 : il faut >=. Avec >, l’élève à 10 pile serait recalé — c’est le cas limite, celui qu’on teste en premier. Et = affecte, quand == compare.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P5'] },
  },
  {
    id: 'va-e7', skill: 'boucle', requires: ['boucle-for'], title: 'Épreuve 7',
    prompt: 'Combien de lignes ce programme affiche-t-il ?',
    extra: code('for i in range(1, 5):\n    print(i)'),
    options: ['4', '5', '3', '6'],
    cols: 4, correct: 0,
    explain: 'i prend les valeurs 1, 2, 3, 4 : la borne de gauche est incluse, celle de droite est EXCLUE. Cela fait 5 − 1 = 4 tours. C’est l’erreur de borne la plus fréquente de tout le chapitre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P6'] },
  },
  {
    id: 'va-e8', skill: 'boucle', requires: ['boucle-while', 'regle-condition-arret', 'mem-for-ou-while'], title: 'Épreuve 8',
    prompt: 'On place 100 € à 10 % par an et l’on cherche en combien d’années le capital dépasse 150 €. Quelle boucle convient ?',
    options: [
      'while, car le nombre de tours n’est pas connu d’avance',
      'for, car il y a une multiplication à chaque année',
      'for, car les années sont des entiers',
      'Aucune : un simple calcul suffit',
    ],
    cols: 1, correct: 0,
    explain: 'On ignore combien d’années seront nécessaires avant de les avoir simulées : c’est la signature du while. Le for demande un nombre de tours écrit dans le range, impossible ici. (La réponse est 5 ans.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P7'] },
  },
  {
    id: 'va-e9', skill: 'affect', requires: ['methode-formule-variables'], title: 'Épreuve 9',
    prompt: 'Un rectangle a pour longueur L et largeur l. Quelle ligne calcule correctement son périmètre ?',
    options: ['perimetre = 2 * (L + l)', 'perimetre = 2 * L + l', 'perimetre = L * l', 'perimetre = 2 * L + 2'],
    cols: 2, correct: 0,
    explain: 'Le périmètre vaut 2 × (L + l) : les parenthèses sont indispensables, sans elles seule la longueur serait doublée. L * l donne l’aire. Pour L = 6 et l = 4, la bonne ligne affiche 20.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P8'] },
  },
  {
    id: 'va-e10', skill: 'lire', requires: ['methode-tracer', 'affectation'], title: 'Épreuve 10',
    prompt: 'Ce programme devait échanger les valeurs de x et y. Qu’affiche-t-il réellement ?',
    extra: code('x = 5\ny = 2\nx = y\ny = x\nprint(x)\nprint(y)'),
    options: ['2 puis 2', '2 puis 5', '5 puis 2', '5 puis 5'],
    cols: 4, correct: 0,
    explain: 'La ligne x = y écrase le 5 : x vaut 2, et la valeur 5 a disparu de la mémoire. La ligne suivante recopie ce 2 dans y. L’échange a échoué — il aurait fallu une troisième variable, ou l’astuce des trois additions.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P9'] },
  },
  {
    id: 'va-e11', skill: 'lire', requires: ['methode-tracer', 'boucle-for'], title: 'Épreuve 11',
    prompt: 'Une population de 20 individus double à chaque étape. Qu’affiche ce programme ?',
    extra: code('p = 20\nfor i in range(3):\n    p = p * 2\nprint(p)'),
    options: ['160', '120', '60', '40'],
    cols: 4, correct: 0,
    explain: 'range(3) donne trois tours : 20 → 40 → 80 → 160. On multiplie trois fois par 2, on n’ajoute pas 20 à chaque fois (ce qui donnerait 80) — la croissance est multiplicative.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P10'] },
  },
  {
    id: 'va-e12', skill: 'lire', requires: ['boucle-for', 'sequence'], title: 'Épreuve 12',
    prompt: 'Ce programme calcule 1² + 2² + 3² + 4² + 5². Par quoi remplacer les points ?',
    extra: code('s = 0\nfor i in range(1, 6):\n    s = s + ...\nprint(s)'),
    options: ['i * i', 'i', 's * s', '2 * i'],
    cols: 4, correct: 0,
    explain: 'Chaque tour ajoute le CARRÉ du compteur, donc i * i. Avec i seul on obtiendrait 15 au lieu de 55 ; avec 2 * i on ajouterait le double au lieu du carré. Le programme correct affiche 55.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P11'] },
  },
  {
    id: 'va-e13', skill: 'lire', requires: ['methode-verifier'], title: 'Épreuve 13',
    prompt: 'Un programme doit afficher la somme des entiers de 1 à 10, soit 55. Il affiche 45. Que fais-tu en premier ?',
    options: [
      'Je remarque que 55 − 45 = 10 : le dernier terme manque, la borne du range est trop petite',
      'Je réécris entièrement le programme',
      'Je change la valeur initiale de la somme',
      'Je conclus que 45 est la bonne réponse',
    ],
    cols: 1, correct: 0,
    explain: 'Vérifier, c’est comparer au résultat attendu et faire parler l’ÉCART. Ici il vaut exactement 10, le terme absent : range(1, 10) s’arrête à 9, il fallait range(1, 11). Un seul caractère à corriger, trouvé sans relire tout le code.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_variables-et-instructions-2nde_P12'] },
  },
];

const BADGES = [
  { id: 'b-var', emoji: '📦', label: 'Types sans faute', test: (m) => !m.variable },
  { id: 'b-aff', emoji: '⬅️', label: 'Maître de l’affectation', test: (m) => !m.affect },
  { id: 'b-choix', emoji: '🔀', label: 'Le bon cas limite', test: (m) => !m.choix },
  { id: 'b-boucle', emoji: '🔁', label: 'for ou while', test: (m) => !m.boucle },
  { id: 'b-lire', emoji: '🔍', label: 'Lecteur de code', test: (m) => !m.lire },
  { id: 'b-parfait', emoji: '💎', label: 'Sans faute', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Mission finale : le programme"
      moduleSubtitle="Treize épreuves : types, affectation, condition, boucles, vérification"
      estimatedTime="12 min"
      lessonConfig={LESSON_CONFIG}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
    />
  );
}
