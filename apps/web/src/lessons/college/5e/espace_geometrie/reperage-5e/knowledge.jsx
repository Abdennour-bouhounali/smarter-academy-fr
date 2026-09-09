import React from 'react';
import PointPlacer from './components/PointPlacer';
import { DOMAINE, lieuPoint } from './components/reperageUtils';

/**
 * Carte des connaissances — « Repérage sur une droite et dans le plan » (5e).
 *
 * Un item appartient au module qui l'enseigne EN PREMIER (le réducteur
 * déduplique par id, le plus petit module gagne). Les visuels sont les
 * manipulations de la leçon, FIGÉES : l'élève retrouve dans sa carte
 * exactement la figure qu'il a manipulée.
 *
 * ─── LA CHAÎNE DE DÉPENDANCE, QUI DICTE L'ORDRE ───────────────────────
 *   abscisse (rappel 6e/relatifs)
 *        ↓  ne suffit pas à désigner un endroit
 *   deuxième dimension                       ← M1, le manque constaté
 *        ↓  d'où deux axes qui se croisent
 *   repère · axes et origine                 ← M2
 *        ↓  d'où un couple de nombres
 *   coordonnées                              ← M2
 *        ↓  qui découpe le plan
 *   quadrant                                 ← M3
 *        ↓  et dont l'ordre compte
 *   couple ordonné                           ← M4
 *        ↓  avec son cas limite
 *   sur un axe                               ← M5
 *
 * Aucun item n'emploie une notion qu'un module ultérieur introduira.
 */

/** Le repère de la leçon, figé — non interactif. */
const Fige = ({ point, extraPoints = [], ghostSwapped = false, showQuadrantBadge = false }) => (
  <PointPlacer
    point={point}
    extraPoints={extraPoints}
    ghostSwapped={ghostSwapped}
    showQuadrantBadge={showQuadrantBadge}
    disabled
    domaine={DOMAINE}
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'abscisse',
        type: 'vocabulaire',
        title: 'Abscisse',
        summary: 'Le nombre qui repère une position sur une droite graduée, à partir de l’origine.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Sur une droite graduée, l’<strong>abscisse</strong> d’un point est le nombre qui dit
              où il se trouve : à quelle distance de l’origine, et de quel côté.
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• une abscisse <strong>positive</strong> : à droite de l’origine ;</li>
              <li>• une abscisse <strong>négative</strong> : à gauche ;</li>
              <li>• l’abscisse <strong>0</strong> : l’origine elle-même.</li>
            </ul>
            <div className="text-xs text-slate-400 italic">
              📍 Déjà rencontré avec les nombres relatifs : ici, on s’en sert pour repérer.
            </div>
          </div>
        ),
      },
      {
        id: 'deuxieme-dimension',
        type: 'concepts',
        title: 'Un nombre ne suffit pas',
        summary: 'Sur une carte, une seule abscisse désigne toute une colonne de lieux — pas un endroit.',
        visual: <Fige point={lieuPoint('sommet')} extraPoints={[{ id: 'lac', ...lieuPoint('lac'), label: 'Lac', tone: '#dc2626' }]} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Le Sommet et le Lac gelé ont la <strong>même abscisse</strong> (−3). Donner ce seul
              nombre ne dit donc pas de quel lieu on parle : il en désigne <strong>deux</strong>.
            </p>
            <p className="text-sm text-slate-700">
              Pour désigner un endroit sur une carte, il faut un <strong>second nombre</strong> :
              celui qui dit à quelle hauteur on se trouve.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le curseur qui allumait deux lieux à la fois.
            </div>
          </div>
        ),
      },
    ],

    2: [
      {
        id: 'repere',
        type: 'concepts',
        title: 'Repère du plan',
        summary: 'Deux droites graduées qui se croisent : elles permettent de désigner un point du plan par deux nombres.',
        visual: <Fige point={{ x: 0, y: 0 }} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un <strong>repère</strong> du plan, c’est <strong>deux droites graduées</strong> qui
              se coupent : l’une horizontale, l’autre verticale.
            </p>
            <p className="text-sm text-slate-700">
              Avec un seul axe, un nombre désignait une colonne entière. Avec les deux, chaque
              couple de nombres désigne <strong>un seul point</strong>.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le second curseur, qui a réduit le halo à un point unique.
            </div>
          </div>
        ),
      },
      {
        id: 'axes-origine',
        type: 'vocabulaire',
        title: 'Axes et origine',
        summary: 'L’axe des abscisses est horizontal, l’axe des ordonnées vertical ; ils se coupent en O, l’origine.',
        body: (
          <div className="space-y-3">
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• l’<strong>axe des abscisses</strong> : horizontal, souvent noté <em>x</em> ;</li>
              <li>• l’<strong>axe des ordonnées</strong> : vertical, souvent noté <em>y</em> ;</li>
              <li>• l’<strong>origine</strong> <strong>O</strong> : le point où les deux axes se coupent.</li>
            </ul>
            <p className="text-sm text-slate-600">
              L’origine est le point de départ des deux graduations : ses deux nombres valent 0.
            </p>
          </div>
        ),
      },
      {
        id: 'coordonnees',
        type: 'concepts',
        title: 'Coordonnées d’un point',
        summary: 'Le couple (x ; y) : d’abord l’abscisse (horizontale), puis l’ordonnée (verticale).',
        visual: <Fige point={{ x: 4, y: 2 }} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Les <strong>coordonnées</strong> d’un point sont ses deux nombres, écrits entre
              parenthèses et séparés par un point-virgule :
            </p>
            <div className="text-center font-mono text-lg font-black text-violet-700">(4 ; 2)</div>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• le premier, l’<strong>abscisse</strong>, se lit sur l’axe horizontal ;</li>
              <li>• le second, l’<strong>ordonnée</strong>, se lit sur l’axe vertical.</li>
            </ul>
          </div>
        ),
      },
    ],

    3: [
      {
        id: 'quadrant',
        type: 'vocabulaire',
        title: 'Les quatre quadrants',
        summary: 'Les deux axes découpent le plan en quatre régions ; le couple de signes dit laquelle.',
        visual: <Fige point={{ x: -3, y: 3 }} showQuadrantBadge />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Les deux axes partagent le plan en <strong>quatre quadrants</strong>. Les signes des
              deux coordonnées suffisent à savoir lequel :
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• (+ ; +) en haut à droite ;</li>
              <li>• (− ; +) en haut à gauche ;</li>
              <li>• (− ; −) en bas à gauche ;</li>
              <li>• (+ ; −) en bas à droite.</li>
            </ul>
            <p className="text-sm text-slate-600">
              Le signe de l’abscisse commande <strong>la gauche et la droite</strong> ; celui de
              l’ordonnée, <strong>le haut et le bas</strong>. Chacun son rôle.
            </p>
          </div>
        ),
      },
      {
        id: 'lire-un-point',
        type: 'methodes',
        title: 'Lire les coordonnées d’un point',
        summary: 'Descendre sur l’axe horizontal pour l’abscisse, aller sur l’axe vertical pour l’ordonnée.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1 text-sm text-slate-700">
              <li><strong>1.</strong> Depuis le point, suivre la verticale jusqu’à l’axe horizontal : on lit l’<strong>abscisse</strong>.</li>
              <li><strong>2.</strong> Depuis le point, suivre l’horizontale jusqu’à l’axe vertical : on lit l’<strong>ordonnée</strong>.</li>
              <li><strong>3.</strong> Écrire le couple dans cet ordre : (abscisse ; ordonnée).</li>
            </ol>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux pointillés qui partaient du point vers chaque axe.
            </div>
          </div>
        ),
      },
    ],

    4: [
      {
        id: 'ordre-du-couple',
        type: 'regles',
        title: 'L’ordre des deux nombres compte',
        summary: '(−2 ; 3) et (3 ; −2) ne désignent pas le même point — sauf si les deux nombres sont égaux.',
        // (−2 ; 3) et non (−2 ; 5) : 5 sort de la fenêtre du repère, et le
        // fantôme (3 ; −2) doit rester visible pour que la carte montre bien
        // les DEUX points — un schéma ne contredit pas la leçon.
        visual: <Fige point={{ x: -2, y: 3 }} ghostSwapped />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un couple de coordonnées est <strong>ordonné</strong> : échanger les deux nombres
              change le point désigné.
            </p>
            <p className="text-sm text-slate-700">
              L’exception, et elle est logique : quand les deux nombres sont <strong>égaux</strong>,
              l’échange ne déplace rien — le point est sur la diagonale.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le fantôme rose, relié par un pointillé au point que tu venais de placer.
            </div>
          </div>
        ),
      },
      {
        id: 'placer-un-point',
        type: 'methodes',
        title: 'Placer un point à partir de ses coordonnées',
        summary: 'D’abord le déplacement horizontal, ensuite le déplacement vertical, en partant de l’origine.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1 text-sm text-slate-700">
              <li><strong>1.</strong> Partir de l’origine O.</li>
              <li><strong>2.</strong> Se déplacer horizontalement du premier nombre (à droite s’il est positif, à gauche s’il est négatif).</li>
              <li><strong>3.</strong> Se déplacer verticalement du second nombre (vers le haut s’il est positif, vers le bas s’il est négatif).</li>
              <li><strong>4.</strong> Vérifier en relisant le point : on doit retrouver le couple de départ.</li>
            </ol>
          </div>
        ),
      },
      {
        id: 'mem-couple',
        type: 'memoriser',
        title: '⭐ (x ; y) : horizontal d’abord, vertical ensuite',
        summary: 'Le premier nombre se lit toujours sur l’axe horizontal, le second sur l’axe vertical.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-700">
              Dans <strong className="font-mono">(x ; y)</strong>, l’ordre n’est pas une décoration :
              c’est ce qui rend le couple lisible par tout le monde de la même façon.
            </p>
            <p className="text-sm text-slate-600">
              Moyen de retenir : on lit comme on écrit une phrase — <strong>d’abord de gauche à
              droite</strong>, ensuite de bas en haut.
            </p>
          </div>
        ),
      },
    ],

    5: [
      {
        id: 'sur-un-axe',
        type: 'regles',
        title: 'Un point sur un axe n’est dans aucun quadrant',
        summary: 'Si une coordonnée vaut 0, le point est sur un axe — les quadrants ne le contiennent pas.',
        visual: <Fige point={{ x: 0, y: 3 }} showQuadrantBadge />,
        body: (
          <div className="space-y-3">
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• ordonnée nulle, comme (−4 ; 0) : le point est <strong>sur l’axe des abscisses</strong> ;</li>
              <li>• abscisse nulle, comme (0 ; 3) : le point est <strong>sur l’axe des ordonnées</strong> ;</li>
              <li>• les deux nulles, (0 ; 0) : c’est <strong>l’origine</strong>.</li>
            </ul>
            <p className="text-sm text-slate-600">
              Les quadrants sont les régions <em>entre</em> les axes. Un point posé sur une
              frontière n’est dans aucune des quatre régions — il est sur la frontière.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-sur-un-axe',
        type: 'memoriser',
        title: '⭐ Un zéro dans le couple = sur un axe',
        summary: 'Dès qu’une des deux coordonnées vaut 0, le point est sur un axe, pas dans un quadrant.',
        body: (
          <p className="text-sm text-slate-700">
            Zéro veut dire « aucun déplacement dans cette direction » : le point n’a pas quitté
            l’axe de l’autre direction.
          </p>
        ),
      },
    ],

    6: [
      {
        id: 'echelle-graduation',
        type: 'methodes',
        title: 'Lire l’échelle d’un axe',
        summary: 'Avant de lire un point, regarder ce que vaut UNE graduation : ce n’est pas toujours 1.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Compter les graduations ne suffit pas : il faut savoir combien vaut chacune.
            </p>
            <ol className="space-y-1 text-sm text-slate-700">
              <li><strong>1.</strong> Repérer deux nombres écrits sur l’axe.</li>
              <li><strong>2.</strong> Compter les graduations qui les séparent.</li>
              <li><strong>3.</strong> Diviser l’écart des nombres par ce compte : c’est le pas.</li>
            </ol>
            <p className="text-sm text-slate-700">
              Exemple : de 0 à 2 en 4 graduations, chaque graduation vaut <strong>0,5</strong>.
            </p>
          </div>
        ),
      },
    ],
  },
};
