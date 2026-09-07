import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniPlane } from './components/knowledgeVisuals';

/**
 * Connaissances de la leçon « Équations de droites » — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. L'ordre d'introduction est strict :
 *   M1  « vecteur directeur » (le mot). Pas de pente, pas d'équation.
 *   M2  les points A + t·u, puis la PENTE — écrite « montée ÷ avancée » et
 *       u_y / u_x. La lettre m n'existe pas encore, ni aucune équation.
 *   M3  det(AM, u) = 0 devient l'ÉQUATION : cartésienne a·x + b·y + c = 0,
 *       puis réduite y = m·x + p. C'est ici qu'apparaissent m et p.
 *   M4  ce que font m et p (pivoter / glisser), le terme « ordonnée à
 *       l'origine », et la droite VERTICALE b = 0 → x = k.
 *   M5  l'appartenance d'un point, et l'alignement lu sur l'équation.
 *   M6  « À retenir » : les trois chemins vers une équation, mis côte à côte,
 *       et la lecture complète d'une cartésienne — c'est ce module qui les
 *       DEMANDE le premier, donc c'est lui qui les pose.
 *   M7  l'atelier : la seule notion neuve y est la modélisation d'une
 *       situation réelle par une droite.
 *
 * Les modules 0 (diagnostic) et 8 (évaluation) n'apportent rien à la carte.
 */

const LINE_COLOR = '#7c3aed';
const PT_COLOR = '#059669';
const A_COLOR = '#0369a1';

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le laboratoire des droites : un point + une direction. Le mot
       « vecteur directeur » est posé ici. Aucune équation, aucune pente. ── */
    1: [
      {
        id: 'droite-point-direction',
        type: 'concepts',
        title: 'Une droite : un point et une direction',
        summary: 'Un point A et un vecteur non nul u suffisent à définir une seule droite.',
        visual: (
          <MiniPlane
            width={210} height={150}
            xMin={-4} xMax={5} yMin={-2} yMax={5}
            showAxes={false}
            points={[{ x: 0, y: 1, label: 'A', color: A_COLOR, labelPos: 'tl' }]}
            arrows={[
              { from: { x: -3, y: -0.5 }, to: { x: 4, y: 3 }, color: LINE_COLOR, dashed: true },
              { from: { x: 0, y: 1 }, to: { x: 2, y: 2 }, color: LINE_COLOR, label: 'u' },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Deux ingrédients suffisent : un <strong>point de passage</strong> A et une
              <strong> direction</strong>, portée par un vecteur non nul u.
            </p>
            <p className="text-sm text-slate-600">
              Si la <strong>direction change</strong>, la droite <strong>pivote autour de A</strong>.
              Si on <strong>déplace A</strong> sans toucher à la direction, la droite
              <strong> glisse parallèlement</strong> à elle-même.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le laboratoire — la droite d'avant restait en pointillés, pour voir ce
              qui change… ou ne change pas.
            </div>
          </div>
        ),
      },
      {
        id: 'droite-vecteur-directeur',
        type: 'concepts',
        title: 'Vecteur directeur',
        summary: 'Tout vecteur non nul colinéaire à u dirige la même droite — il y en a une infinité.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un <strong>vecteur directeur</strong> d'une droite est un vecteur non nul qui donne sa
              direction. Doubler la flèche (2u) ou la retourner (−u) ne change
              <strong> pas la droite</strong> : une droite n'a pas de longueur.
            </p>
            <p className="text-sm text-slate-600">
              Donc <strong>tout vecteur non nul colinéaire à u</strong> est aussi un vecteur
              directeur : il y en a une <strong>infinité</strong>.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-700">
                Si u (1 ; 2) dirige une droite, alors (2 ; 4) = 2u et (−1 ; −2) = −u la dirigent
                aussi. En revanche (2 ; 1) n'est pas colinéaire à (1 ; 2) : c'est une autre direction.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'droite-vocabulaire-directeur',
        type: 'vocabulaire',
        title: 'Vecteur directeur',
        summary: 'Un vecteur non nul qui donne la direction de la droite.',
        body: (
          <p className="text-sm text-slate-600">
            <strong>Vecteur directeur</strong> — un vecteur non nul portant la direction de la
            droite. Jamais unique : tous ses multiples non nuls conviennent.
          </p>
        ),
      },
      {
        id: 'mem-droite-point-direction',
        type: 'memoriser',
        title: '⭐ Une droite = un point + une direction',
        summary: 'Et tout vecteur non nul colinéaire au vecteur directeur convient aussi.',
        body: (
          <p className="text-sm text-slate-700">
            <strong>Une droite = un point + une direction.</strong> Le vecteur directeur n'est jamais
            unique.
          </p>
        ),
      },
    ],

    /* ── M2 — Le marcheur : les points A + t·u, puis la pente. Écrite
       « montée ÷ avancée » et u_y / u_x — PAS de lettre m, PAS d'équation. ── */
    2: [
      {
        id: 'droite-points-parametres',
        type: 'regles',
        title: 'Les points de la droite',
        summary: 'Tous les points de la droite s\'écrivent M = A + t·u, un pour chaque réel t.',
        visual: (
          <MiniPlane
            width={210} height={150}
            xMin={-3} xMax={6} yMin={-2} yMax={4}
            showAxes={false}
            points={[
              { x: -1, y: 0, label: 'A', color: A_COLOR, labelPos: 'bl' },
              { x: 1, y: 1, label: '', color: PT_COLOR },
              { x: 3, y: 2, label: '', color: PT_COLOR },
              { x: 5, y: 3, label: 'M', color: PT_COLOR, labelPos: 'tr' },
            ]}
            arrows={[
              { from: { x: -1, y: 0 }, to: { x: 1, y: 1 }, color: LINE_COLOR, label: 'u' },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              En partant de A et en faisant <strong>t pas de u</strong>, on atteint tous les points de
              la droite — et rien d'autre :
            </p>
            <div className="text-violet-700 font-bold">
              <MathText>{'$M = A + t\\,\\vec{u}$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">
              Chaque pas ajoute <span className="font-mono">u_x</span> à l'abscisse et
              <span className="font-mono"> u_y</span> à l'ordonnée ; en arrière (t &lt; 0), il les
              retire.
            </p>
            <p className="text-sm text-slate-600">
              Avec A (−1 ; 0) et u (2 ; 1) : M = (−1 + 2t ; 0 + t). Pour t = 3, M (5 ; 3).
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le marcheur, et l'escalier montée / avancée qui se répète à l'identique.
            </div>
          </div>
        ),
      },
      {
        id: 'droite-pente',
        type: 'concepts',
        title: 'La pente',
        summary: 'La pente est le rapport montée ÷ avancée — le même entre deux points quelconques de la droite.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Entre deux points de la droite, le rapport de la <strong>montée</strong> à
              l'<strong>avancée</strong> ne change jamais. C'est la <strong>pente</strong> de la
              droite.
            </p>
            <div className="text-violet-700 font-bold">
              pente = <MathText>{'$\\dfrac{\\text{montée}}{\\text{avancée}} = \\dfrac{u_y}{u_x}$'}</MathText>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                A (−1 ; 0) et M (5 ; 3) : montée 3 − 0 = 3, avancée 5 − (−1) = 6, pente 3 ÷ 6 = 0,5 —
                soit u_y / u_x = 1 / 2.
              </p>
            </div>
            <p className="text-sm text-slate-600">
              Une pente <strong>négative</strong> décrit une droite qui descend.
            </p>
          </div>
        ),
      },
      {
        id: 'droite-calculer-pente',
        type: 'methodes',
        title: 'Calculer une pente entre deux points',
        summary: 'On divise la différence des ordonnées par celle des abscisses — dans cet ordre.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Pour P et Q, on forme le vecteur PQ puis on divise sa montée par son avancée :
            </p>
            <div className="text-violet-700 font-bold">
              <MathText>{'$\\text{pente} = \\dfrac{y_Q - y_P}{x_Q - x_P}$'}</MathText>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                P (−2 ; 5) et Q (4 ; −4) : montée −4 − 5 = −9, avancée 4 − (−2) = 6, pente
                −9 ÷ 6 = −1,5.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Ne pas inverser le quotient (ce serait l'avancée ÷ la montée) et ne pas oublier le
              signe.
            </p>
          </div>
        ),
      },
      {
        id: 'droite-pente-vers-directeur',
        type: 'regles',
        title: 'Pente et vecteur directeur',
        summary: 'Une droite de pente donnée est dirigée par (1 ; pente) — et par tous ses multiples.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              La pente se lit sur n'importe quel vecteur directeur, et réciproquement : une droite de
              pente −3 est dirigée par <span className="font-mono">(1 ; −3)</span>, donc aussi par
              <span className="font-mono"> (−2 ; 6)</span> = −2 × (1 ; −3).
            </p>
            <p className="text-xs text-slate-500">
              Attention à l'ordre : (−3 ; 1) échangerait l'avancée et la montée.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-droite-pente',
        type: 'memoriser',
        title: '⭐ Pente = montée ÷ avancée',
        summary: 'La pente vaut u_y / u_x et ne dépend pas des deux points choisis.',
        body: (
          <p className="text-sm text-slate-700">
            <strong>Pente = montée ÷ avancée = u_y / u_x.</strong> Elle est la même partout sur la
            droite.
          </p>
        ),
      },
    ],

    /* ── M3 — De la droite à l'équation. det(AM, u) = 0 s'écrit avec x et y :
       cartésienne d'abord, réduite ensuite. m et p naissent ici. Le terme
       « ordonnée à l'origine » n'est PAS encore employé (il arrive en M4). ── */
    3: [
      {
        id: 'droite-equation-idee',
        type: 'concepts',
        title: 'Équation d\'une droite',
        summary: 'Une relation entre x et y vérifiée par les points de la droite, et par eux seuls.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              M appartient à la droite passant par A et dirigée par u exactement quand
              <MathText>{' $\\overrightarrow{AM}$'}</MathText> et u sont colinéaires, c'est-à-dire
              quand leur déterminant est nul :
            </p>
            <div className="text-violet-700 font-bold">
              <MathText>{'$\\det(\\overrightarrow{AM}, \\vec{u}) = 0$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">
              Écrite avec x et y, cette condition devient une <strong>relation entre x et y</strong>{' '}
              vérifiée par <strong>tous</strong> les points de la droite et par <strong>eux
              seuls</strong> : c'est son <strong>équation</strong>.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le nombre qui s'annulait exactement quand M rejoignait la droite.
            </div>
          </div>
        ),
      },
      {
        id: 'droite-equation-cartesienne',
        type: 'regles',
        title: 'Équation cartésienne',
        summary: 'Toute droite a une équation de la forme a·x + b·y + c = 0, de vecteur directeur (−b ; a).',
        body: (
          <div className="space-y-3">
            <div className="text-violet-700 font-bold">
              <MathText>{'$a\\,x + b\\,y + c = 0$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">
              Les coefficients viennent du vecteur directeur :
              <span className="font-mono"> (a ; b) = (u_y ; −u_x)</span>. Réciproquement, la droite
              d'équation a·x + b·y + c = 0 a pour vecteur directeur
              <span className="font-mono"> (−b ; a)</span> — et non (a ; b).
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                A (1 ; 3), u (1 ; 2) : det(AM, u) = 0 s'écrit 2(x − 1) − (y − 3) = 0, soit après
                développement <strong>2x − y + 1 = 0</strong>.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Attention aux signes en développant : −(y − 3) = −y + 3.
            </p>
          </div>
        ),
      },
      {
        id: 'droite-equation-reduite',
        type: 'regles',
        title: 'Équation réduite',
        summary: 'En isolant y : y = m·x + p, où m est la pente.',
        body: (
          <div className="space-y-3">
            <div className="text-violet-700 font-bold">
              <MathText>{'$y = m\\,x + p$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">
              En isolant y dans l'équation cartésienne, on obtient l'<strong>équation réduite</strong>.
              Le coefficient <strong>m</strong> est la <strong>pente</strong> (u_y / u_x) et
              <strong> p</strong> est l'ordonnée du point où la droite coupe l'axe des ordonnées.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                2x − y + 1 = 0 ⇔ <strong>y = 2x + 1</strong> : pente m = 2, et p = 1.
              </p>
              <p className="text-xs text-slate-700">
                Vérification avec A (1 ; 3) : 2 × 1 + 1 = 3. ✓
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'droite-methode-point-vecteur',
        type: 'methodes',
        title: 'Équation à partir d\'un point et d\'un vecteur directeur',
        summary: 'On lit (a ; b) sur le vecteur, puis on trouve c avec le point.',
        body: (
          <div className="space-y-3">
            <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
              <li>
                Lire les coefficients sur le vecteur : <span className="font-mono">a = u_y</span> et
                <span className="font-mono"> b = −u_x</span>.
              </li>
              <li>Écrire a·x + b·y + c = 0, avec c encore inconnu.</li>
              <li>
                Remplacer x et y par les coordonnées du <strong>point</strong> connu, puis résoudre
                pour c.
              </li>
            </ol>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                B (−2 ; 1), v (3 ; 1) : a = 1, b = −3, donc x − 3y + c = 0. B est dessus :
                (−2) − 3 × 1 + c = 0, donc c = 5.
              </p>
              <p className="text-xs text-slate-700">Équation : <strong>x − 3y + 5 = 0</strong>.</p>
            </div>
          </div>
        ),
      },
      {
        id: 'droite-formules-equations',
        type: 'formules',
        title: 'Les deux écritures d\'une droite',
        summary: 'Cartésienne a·x + b·y + c = 0 ; réduite y = m·x + p.',
        body: (
          <div className="space-y-2">
            <MathText>{'$$a\\,x + b\\,y + c = 0 \\qquad\\text{et}\\qquad y = m\\,x + p$$'}</MathText>
            <p className="text-xs text-slate-500">
              Vecteur directeur de la première : (−b ; a). Dans la seconde, m est la pente.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-droite-deux-ecritures',
        type: 'memoriser',
        title: '⭐ Deux écritures, une droite',
        summary: 'a·x + b·y + c = 0 (directeur (−b ; a)) et y = m·x + p (m = pente).',
        body: (
          <div className="space-y-1">
            <p className="text-sm text-slate-700">
              <strong>a·x + b·y + c = 0</strong> — vecteur directeur <strong>(−b ; a)</strong>.
            </p>
            <p className="text-sm text-slate-700">
              <strong>y = m·x + p</strong> — m est la <strong>pente</strong>.
            </p>
          </div>
        ),
      },
    ],

    /* ── M4 — Le laboratoire des coefficients : rôle de m et de p, le terme
       « ordonnée à l'origine », et la droite verticale que la réduite ne
       sait pas écrire. ── */
    4: [
      {
        id: 'droite-role-m-p',
        type: 'regles',
        title: 'Ce que font m et p',
        summary: 'm fait pivoter la droite autour de (0 ; p) ; p la fait glisser verticalement.',
        visual: (
          <MiniPlane
            width={210} height={150}
            xMin={-3} xMax={4} yMin={-2} yMax={5}
            showAxes={false}
            points={[{ x: 0, y: 1, label: '(0 ; p)', color: PT_COLOR, labelPos: 'tl' }]}
            arrows={[
              { from: { x: -2, y: -1 }, to: { x: 2, y: 3 }, color: LINE_COLOR },
              { from: { x: -2, y: 2.5 }, to: { x: 3, y: 0 }, color: '#94a3b8', dashed: true },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Dans <MathText>{'$y = m\\,x + p$'}</MathText>, chaque coefficient change une seule chose :
            </p>
            <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
              <li>
                <strong>m</strong> fait <strong>pivoter</strong> la droite autour du point (0 ; p).
                C'est la pente : la flèche (1 ; m) est un vecteur directeur. Négatif, la droite
                descend.
              </li>
              <li>
                <strong>p</strong> fait <strong>glisser</strong> la droite verticalement, sans la
                faire tourner : la direction ne change pas.
              </li>
            </ul>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux curseurs, et la droite d'avant restée en pointillés.
            </div>
          </div>
        ),
      },
      {
        id: 'droite-ordonnee-origine',
        type: 'concepts',
        title: 'Ordonnée à l\'origine',
        summary: 'p est l\'ordonnée du point où la droite coupe l\'axe des ordonnées : (0 ; p).',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Dans y = m·x + p, le nombre <strong>p</strong> est l'<strong>ordonnée à
              l'origine</strong> : la droite coupe l'axe des ordonnées au point
              <span className="font-mono"> (0 ; p)</span>.
            </p>
            <p className="text-sm text-slate-600">
              Pour y = −0,5x + 4 : pente −0,5, et la droite passe par (0 ; 4) — le point
              <strong> (0 ; 4)</strong>, pas (4 ; 0).
            </p>
          </div>
        ),
      },
      {
        id: 'droite-verticale',
        type: 'regles',
        title: 'Les droites verticales',
        summary: 'Une droite verticale s\'écrit x = k : elle n\'a pas d\'équation réduite.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Avec <strong>b = 0</strong>, l'équation cartésienne devient a·x + c = 0, soit
              <span className="font-mono"> x = −c/a</span> — une droite <strong>verticale</strong>.
            </p>
            <p className="text-sm text-slate-600">
              Une telle droite <strong>n'a pas d'équation réduite</strong> : aucun m ne convient,
              puisque son vecteur directeur (−b ; a) = (0 ; a) a une avancée nulle. Elle n'a donc
              pas de pente.
            </p>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-xs text-indigo-900">
                L'équation <strong>cartésienne écrit TOUTES les droites</strong> ; l'équation réduite
                en oublie une famille : les verticales.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'droite-lire-equation',
        type: 'methodes',
        title: 'Lire une équation réduite',
        summary: 'Le coefficient de x est la pente ; la constante est l\'ordonnée à l\'origine.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Dans <span className="font-mono">y = −0,5x + 4</span> : m = −0,5 est la
              <strong> pente</strong> (pour 1 vers la droite, 0,5 vers le bas) et p = 4 est
              l'<strong>ordonnée à l'origine</strong>, donc la droite passe par (0 ; 4).
            </p>
            <p className="text-sm text-slate-600">
              Un vecteur directeur s'en déduit : (1 ; −0,5), ou (2 ; −1) — plus commode.
            </p>
          </div>
        ),
      },
      {
        id: 'droite-tracer',
        type: 'methodes',
        title: 'Tracer une droite à partir de son équation',
        summary: 'On place deux points qui vérifient l\'équation, puis on trace.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Il suffit de <strong>deux points</strong>. Le plus simple : partir de (0 ; p), puis
              utiliser la pente — un pas de 1 vers la droite, m vers le haut.
            </p>
            <p className="text-sm text-slate-600">
              Pour y = −2x + 3 : le point (0 ; 3), puis (1 ; 1). La droite qui les joint est la
              bonne.
            </p>
            <p className="text-xs text-slate-500">
              On peut aussi choisir deux valeurs de x et calculer les y correspondants.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-droite-m-p',
        type: 'memoriser',
        title: '⭐ m tourne, p glisse',
        summary: 'm est la pente, p l\'ordonnée à l\'origine ; la verticale x = k n\'a pas de réduite.',
        body: (
          <div className="space-y-1">
            <p className="text-sm text-slate-700">
              <strong>m</strong> = pente (elle fait pivoter) · <strong>p</strong> = ordonnée à
              l'origine (elle fait glisser).
            </p>
            <p className="text-sm text-slate-700">
              La <strong>verticale x = k</strong> n'a pas d'équation réduite.
            </p>
          </div>
        ),
      },
    ],

    /* ── M5 — Ce point est-il sur la droite ? Le test d'appartenance, et
       l'alignement relu à travers l'équation. ── */
    5: [
      {
        id: 'droite-appartenance',
        type: 'regles',
        title: 'Appartenance d\'un point',
        summary: 'M est sur la droite exactement quand ses coordonnées vérifient l\'équation.',
        body: (
          <div className="space-y-3">
            <div className="text-violet-700 font-bold">
              M ∈ d ⇔ les coordonnées de M vérifient l'équation de d
            </div>
            <p className="text-sm text-slate-600">
              Un point <strong>presque</strong> sur la droite n'est pas dessus. À 0,1 unité près,
              l'écart est invisible à l'écran mais parfaitement net dans l'équation : la figure
              suggère, le calcul tranche.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les cinq points suspects — deux d'entre eux à 0,1 près.
            </div>
          </div>
        ),
      },
      {
        id: 'droite-methode-tester-point',
        type: 'methodes',
        title: 'Tester si un point est sur une droite',
        summary: 'On remplace x par l\'abscisse du point et on compare le résultat à son ordonnée.',
        body: (
          <div className="space-y-3">
            <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
              <li>Remplacer x par l'<strong>abscisse</strong> du point dans l'équation.</li>
              <li>Comparer le résultat à son <strong>ordonnée</strong>.</li>
              <li>Égalité → le point est sur la droite ; sinon, il n'y est pas.</li>
            </ol>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                Le point (7 ; 4,5) et la droite y = 0,5x + 1 : 0,5 × 7 + 1 = 4,5, qui est bien
                l'ordonnée du point. Il est dessus — même hors du cadre, sans dessin.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Toujours dans ce sens : on remplace l'abscisse, jamais l'inverse.
            </p>
          </div>
        ),
      },
      {
        id: 'droite-alignement-equation',
        type: 'methodes',
        title: 'Prouver que trois points sont alignés',
        summary: 'On écrit l\'équation de la droite des deux premiers, puis on y teste le troisième.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Trois points sont alignés quand le <strong>troisième est sur la droite des deux
              premiers</strong>.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                A (−3 ; −1), B (1 ; 1), C (5 ; 3). La droite (AB) a pour équation y = 0,5x + 0,5.
              </p>
              <p className="text-xs text-slate-700">
                Pour C : 0,5 × 5 + 0,5 = 3 = y_C. C est sur (AB) : les trois points sont alignés.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              C'est la version « équation » du test det(AB, AC) = 0.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-droite-appartenance',
        type: 'memoriser',
        title: '⭐ Sur la droite ⇔ l\'équation est vérifiée',
        summary: 'On remplace l\'abscisse et on compare à l\'ordonnée.',
        body: (
          <p className="text-sm text-slate-700">
            <strong>M est sur d ⇔ les coordonnées de M vérifient l'équation de d.</strong> « Presque »
            n'existe pas.
          </p>
        ),
      },
    ],

    /* ── M6 — « À retenir » : les trois chemins vers une équation, mis côte à
       côte, plus la lecture complète d'une cartésienne. C'est ce module qui
       les demande le premier ; il les pose donc avant de les demander. ── */
    6: [
      {
        id: 'droite-methode-deux-points',
        type: 'methodes',
        title: 'Équation à partir de deux points',
        summary: 'La pente d\'abord, puis p en utilisant l\'un des deux points.',
        body: (
          <div className="space-y-3">
            <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
              <li>Calculer la <strong>pente</strong> m = (y_Q − y_P) / (x_Q − x_P).</li>
              <li>Écrire y = m·x + p.</li>
              <li>
                Remplacer x et y par les coordonnées de <strong>l'un des deux points</strong> et
                résoudre pour p.
              </li>
            </ol>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                P (−3 ; −1) et Q (2 ; 9) : m = (9 − (−1)) / (2 − (−3)) = 10 / 5 = 2.
              </p>
              <p className="text-xs text-slate-700">
                Avec P : −1 = 2 × (−3) + p, donc p = 5. Équation : <strong>y = 2x + 5</strong>.
              </p>
              <p className="text-xs text-slate-700">Vérification avec Q : 2 × 2 + 5 = 9. ✓</p>
            </div>
          </div>
        ),
      },
      {
        id: 'droite-methode-point-pente',
        type: 'methodes',
        title: 'Équation à partir d\'un point et de la pente',
        summary: 'La pente donne m ; le point donne p.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              La pente est déjà m : il ne reste que p, obtenu en substituant les coordonnées du point.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                B (−1 ; 4), pente −3 : 4 = −3 × (−1) + p, donc p = 1. Équation :
                <strong> y = −3x + 1</strong>.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'droite-lire-cartesienne',
        type: 'methodes',
        title: 'Tout lire sur une équation cartésienne',
        summary: 'De a·x + b·y + c = 0 on tire le vecteur directeur, la pente et l\'ordonnée à l\'origine.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              À partir de <span className="font-mono">3x − 2y + 6 = 0</span> :
            </p>
            <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
              <li>
                <strong>vecteur directeur</strong> (−b ; a) = <span className="font-mono">(2 ; 3)</span> ;
              </li>
              <li>
                <strong>pente</strong> u_y / u_x = 3 / 2 = <span className="font-mono">1,5</span> ;
              </li>
              <li>
                <strong>ordonnée à l'origine</strong> : en faisant x = 0, −2y + 6 = 0 donne y = 3,
                donc le point <span className="font-mono">(0 ; 3)</span>.
              </li>
            </ul>
            <p className="text-sm text-slate-600">
              Autrement dit : 3x − 2y + 6 = 0 ⇔ <strong>y = 1,5x + 3</strong>.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-droite-trois-chemins',
        type: 'memoriser',
        title: '⭐ Trois chemins vers une équation',
        summary: 'Deux points · un point et un vecteur directeur · un point et la pente.',
        body: (
          <div className="space-y-1">
            <p className="text-sm text-slate-700">
              <strong>Deux points</strong> · <strong>un point et un vecteur directeur</strong> ·{' '}
              <strong>un point et la pente</strong>.
            </p>
            <p className="text-sm text-slate-700">
              À chaque fois : <strong>la direction d'abord, puis le point</strong>.
            </p>
          </div>
        ),
      },
    ],

    /* ── M7 — L'atelier : tout y est déjà connu, sauf une chose — traduire une
       situation réelle en droite, puis interroger son équation. ── */
    7: [
      {
        id: 'droite-modeliser',
        type: 'methodes',
        title: 'Utiliser une équation dans un problème',
        summary: 'On traduit la situation en droite, puis on teste ou on calcule sur l\'équation.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Une situation qui progresse <strong>régulièrement</strong> se modélise par une droite :
              on détermine son équation, puis on l'interroge.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                Une rampe part de (0 ; 1) et passe par (4 ; 2), en mètres : pente
                (2 − 1) / (4 − 0) = 0,25 et p = 1, donc y = 0,25x + 1.
              </p>
              <p className="text-xs text-slate-700">
                Un capteur en (10 ; 3,5) est-il sur la rampe ? 0,25 × 10 + 1 = 3,5. Oui, exactement.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
};
