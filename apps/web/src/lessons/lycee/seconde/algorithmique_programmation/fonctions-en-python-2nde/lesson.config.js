/**
 * Fonctions en Python — Seconde, domaine algorithmique_programmation.
 *
 * POSITIONNEMENT VERTICAL
 *   revisé      variables, affectation, conditionnelle et boucles, acquises
 *               dans « Variables et instructions » (leçon jumelle, prérequis).
 *   étendu      la fonction MATHÉMATIQUE de 2de (fonctions-2nde : un x, une
 *               image f(x)) devient une fonction PYTHON : mêmes mots, même
 *               idée d'entrée-sortie, mais un corps qu'on écrit soi-même.
 *   nouveau     le paramètre et l'argument, `return`, la PORTÉE (une variable
 *               locale n'existe pas dehors), randint et la simulation.
 *   formalisé   « répéter une expérience pour observer une fréquence » —
 *               c'est la loi des grands nombres rendue exécutable.
 *   outil       prépare les simulations de probabilités de 1re et de Terminale.
 *
 * Couverture : P1, P4 → M1 · P2, P3 → M2 · P9, P11 → M3 · P8 → M4 ·
 *              P5, P6, P7 → M5 · P10, P12 → M6.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/algorithmique_programmation/fonctions-en-python-2nde';

export const LESSON_CONFIG = {
  id: 'fonctions-en-python-2nde',
  sequentialUnlock: true,
  title: 'Fonctions en Python',
  description: "Écrire, utiliser et comprendre des fonctions simples en Python pour modéliser des calculs et des expériences mathématiques.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'algorithmique_programmation',
  chapterTitle: 'Algorithmique et programmation',
  emoji: '🐍',
  estimatedDurationMin: 86,
  passingScore: 0.7,
  masteryThreshold: 0.8,
  knowledgeMap: true,

  priorKnowledge: ['fonction', 'image', 'notation-fx', 'aire', 'moyenne', 'experience-aleatoire', 'probabilite'],

  knowledgeAudit: {
    ignore: [
      { term: 'frequence', reason: 'Notion de collège réactivée par loi-grands-nombres-2nde ; ici c’est le RÉSULTAT lu d’une simulation, pas un contenu enseigné.' },
      { term: 'aire', reason: 'Formule de 6e ; sert de support à une fonction d’exemple.' },
      { term: 'perimetre', reason: 'Formule de 6e ; sert de support à une fonction d’exemple.' },
      { term: 'moyenne', reason: 'Notion de collège, prérequis diagnostiqué au module 0 ; ici on l’écrit en Python, on ne la définit pas.' },
      { term: 'ordre-de-grandeur', reason: 'Expression courante du collège ; sert à commenter une espérance d’effectif dans un explain du diagnostic.' },
      { term: 'face-solide', reason: 'Le mot « face » désigne ici une face de dé (6e) ; la leçon n’enseigne aucune géométrie dans l’espace.' },
    ],
  },

  teachingScope: {
    include: [
      'Définir une fonction avec def, des paramètres et un return',
      'Appeler une fonction, avec un ou plusieurs arguments',
      'La portée : une variable locale n\'existe pas hors de la fonction',
      'Lire, modifier et compléter une fonction existante',
      'randint, la simulation d\'une expérience aléatoire',
      'Répéter une simulation pour produire une série et la résumer',
    ],
    exclude: [
      'Les arguments nommés et les valeurs par défaut',
      'Les fonctions récursives',
      'Les modules et l\'import (randint est fourni directement)',
      'Les dictionnaires et la lecture de fichiers',
    ],
  },

  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Fonctions mathématiques et programmes : ce qui est déjà acquis.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-machine-a-fabriquer', path: `${LESSON_BASE_PATH}/la-machine-a-fabriquer`, title: 'La machine à fabriquer', desc: 'Une entrée, un corps, une sortie : ta première fonction Python.', stage: 'trigger', teachesLearningPointIds: ['seconde_fonctions-en-python-2nde_P1', 'seconde_fonctions-en-python-2nde_P4'], color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'Fabriquer' },
    { id: '02', number: 2, slug: 'un-ou-plusieurs-arguments', path: `${LESSON_BASE_PATH}/un-ou-plusieurs-arguments`, title: 'Un ou plusieurs arguments', desc: 'L’ordre des arguments compte, et ce qui vit dans la fonction y reste.', stage: 'discovery', teachesLearningPointIds: ['seconde_fonctions-en-python-2nde_P2', 'seconde_fonctions-en-python-2nde_P3'], color: 'indigo', style: 'default', estimatedMin: 12, difficulty: 3, actionText: 'Passer les valeurs' },
    { id: '03', number: 3, slug: 'le-hasard-en-python', path: `${LESSON_BASE_PATH}/le-hasard-en-python`, title: 'Le hasard en Python', desc: 'randint, un dé qui ne pèse rien, et mille lancers en une seconde.', stage: 'discovery', teachesLearningPointIds: ['seconde_fonctions-en-python-2nde_P9', 'seconde_fonctions-en-python-2nde_P11'], color: 'rose', style: 'default', estimatedMin: 12, difficulty: 3, actionText: 'Lancer le dé' },
    { id: '04', number: 4, slug: 'ecrire-sa-fonction', path: `${LESSON_BASE_PATH}/ecrire-sa-fonction`, title: 'Écrire sa fonction', desc: 'De la formule mathématique au corps de la fonction.', stage: 'formalization', teachesLearningPointIds: ['seconde_fonctions-en-python-2nde_P8'], color: 'emerald', style: 'default', estimatedMin: 11, difficulty: 3, actionText: 'Écrire' },
    { id: '05', number: 5, slug: 'lire-modifier-completer', path: `${LESSON_BASE_PATH}/lire-modifier-completer`, title: 'Lire, modifier, compléter', desc: 'Trois fonctions écrites par quelqu’un d’autre.', stage: 'formalization', teachesLearningPointIds: ['seconde_fonctions-en-python-2nde_P5', 'seconde_fonctions-en-python-2nde_P6', 'seconde_fonctions-en-python-2nde_P7'], color: 'amber', style: 'default', estimatedMin: 11, difficulty: 4, actionText: 'Reprendre le code' },
    { id: '06', number: 6, slug: 'mille-experiences', path: `${LESSON_BASE_PATH}/mille-experiences`, title: 'Mille expériences', desc: 'Répéter, collecter une série, la résumer — et vérifier le résultat.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_fonctions-en-python-2nde_P10', 'seconde_fonctions-en-python-2nde_P12'], color: 'cyan', style: 'default', estimatedMin: 10, difficulty: 4, actionText: 'Simuler' },
    { id: '07', number: 7, slug: 'mission-finale-la-fonction', path: `${LESSON_BASE_PATH}/mission-finale-la-fonction`, title: '🏆 Mission finale : la fonction', desc: 'Quinze épreuves : définir, appeler, portée, lire, simuler, vérifier.', stage: 'evaluation', color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Relever le défi' },
  ],
};

export default LESSON_CONFIG;
