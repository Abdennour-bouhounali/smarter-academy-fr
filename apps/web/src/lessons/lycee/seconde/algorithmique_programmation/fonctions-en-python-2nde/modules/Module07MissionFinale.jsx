import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — mission finale.
 *
 * Quinze épreuves pour douze learning points : chacun a AU MOINS une épreuve
 * qui lui est propre (`check:lessons` tourne en --strict). Toutes les sorties
 * citées ont été exécutées par `pyRun` avant d'être écrites : triple(4) = 12,
 * perimetre(6, 4) = 20, et la fonction de l'épreuve 10 renvoie 7 dans les deux
 * sens (c'est l'écart, et c'est le piège).
 */
const code = (src) => (
  <pre className="mt-2 rounded-lg bg-slate-900 px-3 py-2 font-mono text-[15px] leading-relaxed text-slate-100 overflow-x-auto">{src}</pre>
);

const REGISTRE = [
  { id: 'definir', emoji: '🐍', label: 'Définir', value: 'def … return' },
  { id: 'appeler', emoji: '📥', label: 'Appeler', value: 'nom(arguments)' },
  { id: 'portee', emoji: '🔒', label: 'Portée', value: 'local reste local' },
  { id: 'ecrire', emoji: '✍️', label: 'Écrire', value: 'formule → corps' },
  { id: 'relire', emoji: '🔍', label: 'Relire', value: 'lire, modifier' },
  { id: 'hasard', emoji: '🎲', label: 'Simuler', value: 'randint, répéter' },
];

const SKILLS = {
  definir: { label: 'Définir une fonction', module: 1 },
  appeler: { label: 'Appeler, arguments', module: 2 },
  portee: { label: 'La portée', module: 2 },
  ecrire: { label: 'Écrire sa fonction', module: 4 },
  relire: { label: 'Lire, modifier, compléter', module: 5 },
  hasard: { label: 'Hasard et simulation', module: 3 },
};

const EPREUVES = [
  {
    id: 'fp-e1', skill: 'definir', requires: ['fonction-python', 'def-return'], title: 'Épreuve 1',
    prompt: 'Quelle ligne définit correctement une fonction qui reçoit un nombre x ?',
    options: ['def double(x):', 'double(x) =', 'def double(x)', 'function double(x):'],
    cols: 2, correct: 0,
    explain: 'Le mot-clé def, le nom, les paramètres entre parenthèses, et les deux points qui ouvrent le bloc. Oublier « : » est l’erreur la plus fréquente — Python refuse alors d’exécuter le fichier.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P1'] },
  },
  {
    id: 'fp-e2', skill: 'definir', requires: ['def-return', 'mem-entree-sortie'], title: 'Épreuve 2',
    prompt: 'Que renvoie une fonction dont le corps ne contient aucun return ?',
    options: ['None', 'La dernière valeur calculée', '0', 'Une erreur'],
    cols: 4, correct: 0,
    explain: 'Le corps s’exécute normalement, mais rien n’en sort : Python renvoie None. Le calcul a bien eu lieu — il est simplement perdu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P1'] },
  },
  {
    id: 'fp-e3', skill: 'appeler', requires: ['appel-fonction'], title: 'Épreuve 3',
    prompt: 'Qu’affiche ce programme ?',
    extra: code('def triple(x):\n    return 3 * x\n\nprint(triple(4))'),
    options: ['12', '3', '4', 'triple(4)'],
    cols: 4, correct: 0,
    explain: 'L’appel triple(4) exécute le corps avec x valant 4 : 3 × 4 = 12. La valeur renvoyée est ensuite affichée par print.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P4'] },
  },
  {
    id: 'fp-e4', skill: 'appeler', requires: ['appel-fonction', 'fonction-python'], title: 'Épreuve 4',
    prompt: 'Définir une fonction, est-ce que cela exécute son corps ?',
    options: [
      'Non : le corps ne s’exécute qu’à l’appel',
      'Oui, une fois, au moment de la définition',
      'Oui, à chaque ligne du programme',
      'Cela dépend du nombre de paramètres',
    ],
    cols: 1, correct: 0,
    explain: 'La définition range la recette sans la réaliser. Ce sont les parenthèses de l’appel qui déclenchent l’exécution — autant de fois qu’on les écrit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P4'] },
  },
  {
    id: 'fp-e5', skill: 'appeler', requires: ['parametre-argument'], title: 'Épreuve 5',
    prompt: 'Avec def aire(L, l), quel appel calcule l’aire d’un rectangle de 8 sur 3 ?',
    options: ['aire(8, 3)', 'aire(L, l)', 'aire(8 ; 3)', 'aire[8, 3]'],
    cols: 2, correct: 0,
    explain: 'On donne des VALEURS, séparées par une virgule, entre parenthèses. Écrire aire(L, l) supposerait que deux variables L et l existent déjà dans le programme principal.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P2'] },
  },
  {
    id: 'fp-e6', skill: 'appeler', requires: ['regle-ordre-arguments', 'parametre-argument'], title: 'Épreuve 6',
    prompt: 'Avec def remise(prix, taux), quelle est la différence entre remise(200, 10) et remise(10, 200) ?',
    options: [
      'Le premier applique 10 % à 200 €, le second 200 % à 10 € : les résultats diffèrent',
      'Aucune : ce sont les mêmes nombres',
      'Le second provoque une erreur',
      'Le second donne le même résultat, mais plus lentement',
    ],
    cols: 1, correct: 0,
    explain: 'Les arguments sont distribués par leur POSITION : le premier va toujours à prix. Échanger les valeurs change donc complètement le calcul — ici, le prix devient même négatif.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P3'] },
  },
  {
    id: 'fp-e7', skill: 'portee', requires: ['portee-locale', 'mem-locale-reste-locale'], title: 'Épreuve 7',
    prompt: 'Que se passe-t-il à la dernière ligne ?',
    extra: code('def calcul(x):\n    resultat = x * x\n    return resultat\n\nprint(calcul(5))\nprint(resultat)'),
    options: [
      'Erreur : resultat n’existe pas hors de la fonction',
      'Elle affiche 25',
      'Elle affiche 5',
      'Elle affiche None',
    ],
    cols: 1, correct: 0,
    explain: 'resultat est une variable LOCALE : créée à l’appel, effacée à la sortie. La ligne précédente affiche bien 25, mais la valeur n’est accessible que par ce que return a renvoyé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P3'] },
  },
  {
    id: 'fp-e8', skill: 'ecrire', requires: ['methode-traduire-formule'], title: 'Épreuve 8',
    prompt: 'Quel corps calcule correctement le périmètre d’un rectangle, pour def perimetre(L, l) ?',
    options: ['return 2 * (L + l)', 'return 2 * L + l', 'return L * l', 'return 2 * L + 2'],
    cols: 2, correct: 0,
    explain: 'Le périmètre vaut 2 × (L + l) : sans les parenthèses, seule la longueur serait doublée. L * l donne l’aire. Pour L = 6 et l = 4, la bonne réponse affiche 20.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P8'] },
  },
  {
    id: 'fp-e9', skill: 'ecrire', requires: ['regle-return-vs-print'], title: 'Épreuve 9',
    prompt: 'Une fonction utilise print au lieu de return. Que vaut 2 * ttc(50) ?',
    options: [
      'Rien d’exploitable : la fonction renvoie None, le calcul échoue',
      'Le double du prix affiché',
      'Le prix affiché deux fois',
      'La même chose qu’avec return',
    ],
    cols: 1, correct: 0,
    explain: 'print MONTRE une valeur, return la RENVOIE. Sans return, l’appel vaut None et ne peut entrer dans aucun calcul : c’est la distinction la plus utile du chapitre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P8'] },
  },
  {
    id: 'fp-e10', skill: 'relire', requires: ['methode-lire-fonction'], title: 'Épreuve 10',
    prompt: 'Que fait cette fonction ?',
    extra: code('def f(a, b):\n    if a < b:\n        return b - a\n    return a - b'),
    options: [
      'Elle renvoie l’écart entre a et b, toujours positif',
      'Elle renvoie toujours b − a',
      'Elle renvoie le plus grand des deux',
      'Elle renvoie la somme',
    ],
    cols: 1, correct: 0,
    explain: 'Elle retranche toujours le plus petit du plus grand : f(3, 10) et f(10, 3) renvoient tous deux 7. C’est la distance entre les deux nombres, jamais négative.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P5'] },
  },
  {
    id: 'fp-e11', skill: 'relire', requires: ['methode-lire-fonction', 'def-return'], title: 'Épreuve 11',
    prompt: 'Cette fonction doit renvoyer la somme des entiers de 1 à n. Pour n = 10 elle renvoie 45 au lieu de 55. Que corriger ?',
    extra: code('def somme_jusqua(n):\n    s = 0\n    for i in range(1, n):\n        s = s + i\n    return s'),
    options: ['range(1, n + 1)', 'range(0, n)', 'return s + n', 's = 1 au départ'],
    cols: 2, correct: 0,
    explain: '55 − 45 = 10, exactement le terme manquant : la borne de droite de range est exclue, donc n lui-même n’était jamais ajouté. « return s + n » corrigerait ce cas par accident, mais fausserait la logique de la boucle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P6'] },
  },
  {
    id: 'fp-e12', skill: 'hasard', requires: ['randint', 'regle-bornes-randint'], title: 'Épreuve 12',
    prompt: 'Quelle expression simule le lancer d’un dé équilibré à six faces ?',
    options: ['randint(1, 6)', 'randint(1, 7)', 'randint(0, 6)', 'range(1, 6)'],
    cols: 4, correct: 0,
    explain: 'randint inclut ses deux bornes : randint(1, 6) donne bien 1, 2, 3, 4, 5 ou 6. randint(1, 7) ajouterait une septième face, et range ne tire rien au hasard — il énumère.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P9', 'seconde_fonctions-en-python-2nde_P11'] },
  },
  {
    id: 'fp-e13', skill: 'hasard', requires: ['methode-repeter-collecter', 'regle-fluctuation', 'methode-verifier-simulation'], title: 'Épreuve 13',
    prompt: 'Une simulation de 1 000 lancers d’un dé compte les 6. Deux exécutions donnent 168 puis 157. Que conclure ?',
    options: [
      'C’est normal : le résultat fluctue autour de 167, soit 1 000 ÷ 6',
      'Le programme a un bug : il devrait donner le même nombre',
      'Le dé simulé n’est pas équilibré',
      'Il faut choisir la plus grande des deux valeurs',
    ],
    cols: 1, correct: 0,
    explain: 'Deux simulations ne donnent jamais le même compte, et c’est la marque du hasard, pas d’une erreur. Les deux valeurs encadrent la valeur théorique 166,67 — le programme est cohérent avec ce que la probabilité prévoit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P12'] },
  },
  {
    id: 'fp-e14', skill: 'relire', requires: ['methode-traduire-formule', 'def-return'], title: 'Épreuve 14',
    prompt: 'Le corps de cette fonction est à compléter : elle doit renvoyer la moyenne des trois nombres. Quelle ligne écris-tu ?',
    extra: code('def moyenne(a, b, c):\n    return ...'),
    options: ['return (a + b + c) / 3', 'return a + b + c / 3', 'return (a + b + c) / 2', 'return a + b + c'],
    cols: 2, correct: 0,
    explain: 'Les parenthèses sont indispensables : sans elles, seul c serait divisé par 3 et moyenne(10, 12, 14) renverrait 26,67 au lieu de 12. On divise la somme entière par le nombre de valeurs.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P7'] },
  },
  {
    id: 'fp-e15', skill: 'hasard', requires: ['methode-repeter-collecter'], title: 'Épreuve 15',
    prompt: 'On veut constituer une série de 50 lancers de dé pour l’étudier ensuite. Quel programme convient ?',
    extra: code('def de():\n    return randint(1, 6)'),
    options: [
      'serie = [] ; une boucle de 50 tours ; serie.append(de()) à chaque tour',
      'serie = de() répété 50 fois sur la même ligne',
      'serie = [] ; serie.append(de()) une seule fois',
      'print(de()) dans une boucle de 50 tours',
    ],
    cols: 1, correct: 0,
    explain: 'Une liste vide, une boucle qui appelle la fonction, un append à chaque tour : les 50 valeurs sont CONSERVÉES et peuvent ensuite être résumées. Les afficher avec print les montre mais ne les garde pas — on ne pourrait plus en calculer la moyenne.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-en-python-2nde_P10'] },
  },
];

const BADGES = [
  { id: 'b-def', emoji: '🐍', label: 'Définir sans faute', test: (m) => !m.definir },
  { id: 'b-app', emoji: '📥', label: 'Les bons arguments', test: (m) => !m.appeler },
  { id: 'b-por', emoji: '🔒', label: 'Portée maîtrisée', test: (m) => !m.portee },
  { id: 'b-ecr', emoji: '✍️', label: 'Auteur de fonctions', test: (m) => !m.ecrire },
  { id: 'b-rel', emoji: '🔍', label: 'Lecteur de code', test: (m) => !m.relire },
  { id: 'b-has', emoji: '🎲', label: 'Simulateur', test: (m) => !m.hasard },
  { id: 'b-parfait', emoji: '💎', label: 'Sans faute', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Mission finale : la fonction"
      moduleSubtitle="Quinze épreuves : définir, appeler, portée, lire, simuler, vérifier"
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
