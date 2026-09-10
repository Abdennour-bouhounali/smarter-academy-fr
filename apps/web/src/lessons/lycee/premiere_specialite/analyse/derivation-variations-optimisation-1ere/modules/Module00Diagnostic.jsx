import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * le nombre dérivé et sa lecture comme pente (1ère amont), les règles de calcul
 * (1ère amont), le signe d'une fonction et son tableau (2de), le sens de marche
 * d'une courbe et le tableau qui le range (2de).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. AUCUNE question ne porte sur le lien entre le signe de la
 *   dérivée et le sens de marche, sur la façon de remplir un tableau à partir
 *   d'une dérivée, ni sur la recherche du meilleur choix d'un problème — c'est
 *   la matière de la leçon.
 *
 *   AUCUN MOT DE LA LEÇON N'Y FIGURE, pas même dans un `explain` (garde de
 *   forme de components/variationsUtils.test.js). Les prérequis qui portent sur
 *   la plus grande ou la plus petite valeur atteinte sont donc mesurés par leur
 *   SENS — « la plus grande valeur atteinte » — et non par le mot que la 2de
 *   leur donne : le mot lui-même est réintroduit par la leçon au moment où
 *   elle en a besoin.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     dvo-d1  nombre-derive, derive-coefficient-directeur, pente, fonction, notation-fx,
 *             tangente, tangente-courbe, abscisse
 *     dvo-d2  derivees-usuelles, regle-somme-et-reel, methode-choisir-la-regle
 *     dvo-d3  signe-position-courbe, intervalle, intervalle-crochets, ensemble-reels
 *     dvo-d4  tableau-de-signes, methode-construire-tableau, equation-premier-degre,
 *             racine-carree
 *     dvo-d5  variations-sens, variations
 *     dvo-d6  les trois ids de 2de sur la plus grande et la plus petite valeur
 *             atteinte (voir le tableau `requires` de la question)
 */
const SKILLS = {
  derivee: { label: 'Le nombre dérivé', emoji: '📈' },
  calcul: { label: 'Règles de calcul', emoji: '🧮' },
  signe: { label: 'Signe d’une fonction', emoji: '±' },
  sens: { label: 'Sens de marche d’une courbe', emoji: '↗' },
};

const QUESTIONS = [
  {
    id: 'dvo-d1',
    requires: ['nombre-derive', 'derive-coefficient-directeur', 'pente', 'fonction', 'notation-fx', 'tangente', 'tangente-courbe', 'abscisse'],
    skill: 'derivee',
    points: 2,
    prompt: 'Pour une fonction f, que représente le nombre f′(2) sur le dessin de la courbe ?',
    options: [
      'La pente de la tangente à la courbe au point d’abscisse 2',
      'L’ordonnée du point de la courbe d’abscisse 2',
      'L’abscisse du point le plus haut de la courbe',
    ],
    cols: 1,
    correct: 0,
    explain: 'f′(2) est la pente de la tangente au point d’abscisse 2. L’ordonnée de ce point, elle, s’écrit f(2) : au même endroit, deux nombres qui répondent à deux questions différentes.',
  },
  {
    id: 'dvo-d2',
    requires: ['derivees-usuelles', 'regle-somme-et-reel', 'methode-choisir-la-regle'],
    skill: 'calcul',
    points: 2,
    prompt: 'f(x) = x³ − 3x. Quelle est sa dérivée f′(x) ?',
    options: ['3x² − 3', 'x² − 3', '3x² − 3x', '3x²'],
    cols: 2,
    correct: 0,
    explain: 'On dérive terme par terme : (x³)′ = 3x² et (−3x)′ = −3. D’où f′(x) = 3x² − 3.',
  },
  {
    id: 'dvo-d3',
    requires: ['signe-position-courbe', 'intervalle', 'intervalle-crochets', 'ensemble-reels'],
    skill: 'signe',
    points: 2,
    prompt: 'Une fonction g est définie sur ℝ. Sur l’intervalle [0 ; 3], sa courbe passe entièrement AU-DESSUS de l’axe des abscisses. Sur cet intervalle, on dit que g est…',
    options: ['positive', 'négative', 'nulle'],
    cols: 3,
    correct: 0,
    explain: 'Au-dessus de l’axe, les ordonnées sont positives : g(x) > 0 pour tout x de [0 ; 3]. En dessous, g(x) < 0.',
  },
  {
    id: 'dvo-d4',
    requires: ['tableau-de-signes', 'methode-construire-tableau', 'equation-premier-degre', 'racine-carree'],
    skill: 'signe',
    points: 2,
    prompt: 'On veut le signe de g(x) = 2x − 4 sur ℝ. Par quoi commence-t-on ?',
    options: [
      'Par résoudre l’équation 2x − 4 = 0, ce qui découpe ℝ en deux morceaux',
      'Par calculer g(0), g(1) et g(2) et ranger les résultats',
      'Par tracer la courbe de g et la regarder',
    ],
    cols: 1,
    correct: 0,
    explain: '2x − 4 = 0 donne x = 2. Cette valeur découpe ℝ en deux morceaux, et sur chacun le signe ne change plus : c’est ce qui permet de le déterminer avec un seul essai par morceau. Quand l’équation porte sur un carré — x² = 9 par exemple — il faut se souvenir qu’un nombre positif a DEUX racines carrées opposées.',
  },
  {
    id: 'dvo-d5',
    requires: ['variations-sens', 'variations'],
    skill: 'sens',
    points: 2,
    prompt: 'Une fonction h est croissante sur [0 ; 5]. On sait que 1 < 4. Que peut-on affirmer ?',
    options: ['h(1) ⩽ h(4)', 'h(1) ⩾ h(4)', 'h(1) = h(4)'],
    cols: 3,
    correct: 0,
    explain: 'Croissante veut dire « qui conserve l’ordre » : deux abscisses rangées dans un sens ont leurs images rangées dans le même sens.',
  },
  {
    id: 'dvo-d6',
    requires: ['tableau-de-variations', 'maximum-minimum', 'extremum'],
    skill: 'sens',
    points: 2,
    prompt: 'Une fonction k monte de 1 jusqu’à 7, puis redescend de 7 jusqu’à 3. La plus grande valeur qu’elle atteint est…',
    options: ['7', '3', '1', '10'],
    cols: 4,
    correct: 0,
    explain: 'La plus grande valeur ATTEINTE est 7 : c’est une valeur prise par la fonction, pas une abscisse et pas une somme.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Six questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de faire travailler la dérivée, un tour de tes outils : ce qu’est f′(a), comment
            on la calcule, comment on lit le signe d’une fonction, et comment on décrit la marche
            d’une courbe. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
