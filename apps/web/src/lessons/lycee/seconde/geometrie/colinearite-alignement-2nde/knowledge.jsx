import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniPlane } from './components/knowledgeVisuals';

/**
 * Connaissances de la leçon « Colinéarité et alignement » — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare.
 *   M1  le rail : direction, sens, longueur — le mot « colinéaires ». Aucune
 *       coordonnée n'est encore un critère, aucun déterminant.
 *   M2  l'alignement de trois points, lu sur AB et AC. Toujours sans critère
 *       calculatoire.
 *   M3  v = k·u, coordonnées proportionnelles, produits en croix. La
 *       différence x·y′ − y·x′ apparaît, mais elle n'a pas encore de nom.
 *   M4  ce nombre s'appelle le déterminant : det(u, v) = x·y′ − y·x′, son
 *       aire, son signe, et le critère det = 0.
 *   M5  (ex-M6) les deux usages en géométrie : alignement et parallélisme,
 *       et la coordonnée manquante.
 *
 * Numérotation : le module « À retenir » (ex-05) a été supprimé ;
 * « Alignement et parallélisme » est devenu le module 5 et le test final le
 * module 6. Les modules 0 (diagnostic) et 6 (évaluation) n'apportent rien.
 */

/* Les couleurs des figures reprennent celles des labos : u violet, v émeraude. */
const U_COLOR = '#7c3aed';
const V_COLOR = '#059669';
const P_COLOR = '#e11d48';

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le rail : même direction, quels que soient sens et longueur.
       Le mot « colinéaires » est posé ici, à l'œil, sans aucun critère
       chiffré : le déterminant n'existe pas encore pour l'élève. ── */
    1: [
      {
        id: 'colin-direction',
        type: 'concepts',
        title: 'Vecteurs colinéaires',
        summary: 'Deux vecteurs sont colinéaires quand ils ont la même direction — le même rail.',
        visual: (
          <MiniPlane
            width={210} height={150}
            xMin={-5} xMax={5} yMin={-3} yMax={3}
            showAxes={false}
            arrows={[
              { from: { x: 0, y: 0 }, to: { x: 4, y: 2 }, color: U_COLOR, label: 'u' },
              { from: { x: 0, y: 0 }, to: { x: -4, y: -2 }, color: V_COLOR, label: 'v' },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Deux vecteurs non nuls sont <strong>colinéaires</strong> lorsqu'ils portent la
              <strong> même direction</strong> : posés à la même origine, ils roulent sur
              le <strong>même rail</strong>.
            </p>
            <p className="text-sm text-slate-600">
              Ni la <strong>longueur</strong> ni le <strong>sens</strong> n'entrent dans la direction :
              un demi-tour ne change pas le rail. Ainsi <span className="font-mono">u (2 ; 1)</span> et
              <span className="font-mono"> w (−6 ; −3)</span> sont colinéaires — trois fois plus long,
              à l'envers, mais sur le même rail.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les trois voyants du rail — « direction » allumé, « sens » et
              « longueur » libres de rester éteints.
            </div>
          </div>
        ),
      },
      {
        id: 'colin-vocabulaire-direction-sens',
        type: 'vocabulaire',
        title: 'Direction, sens, longueur',
        summary: 'Trois mots différents : seule la direction décide de la colinéarité.',
        body: (
          <div className="space-y-2 text-sm text-slate-600">
            <p><strong>Direction</strong> — le rail, la droite que suit la flèche.</p>
            <p><strong>Sens</strong> — de quel côté on la parcourt ; deux vecteurs de sens contraires
              gardent la même direction.</p>
            <p><strong>Longueur</strong> — la taille de la flèche ; elle ne change pas le rail.</p>
            <p className="text-slate-500">Colinéaires ne regarde que la <strong>direction</strong>.</p>
          </div>
        ),
      },
      {
        id: 'colin-vecteur-nul',
        type: 'regles',
        title: 'Le vecteur nul',
        summary: 'Le vecteur nul (0 ; 0) n\'a ni direction ni sens.',
        body: (
          <p className="text-sm text-slate-600">
            Le vecteur <span className="font-mono">(0 ; 0)</span> ne dessine aucune flèche : il n'a
            <strong> ni direction ni sens</strong>. Il est mis à part quand on compare deux directions
            — on le retrouvera au module suivant, où il s'avère colinéaire à tout vecteur.
          </p>
        ),
      },
      {
        id: 'mem-colin-rail',
        type: 'memoriser',
        title: '⭐ Colinéaires = même rail',
        summary: 'Même direction, peu importe le sens et la longueur.',
        body: (
          <p className="text-sm text-slate-700">
            <strong>Colinéaires = même direction.</strong> Ni le sens, ni la longueur ne comptent.
          </p>
        ),
      },
    ],

    /* ── M2 — Trois points, une droite : l'alignement se lit sur AB et AC.
       Encore aucun critère calculatoire — c'est le pont géométrique. ── */
    2: [
      {
        id: 'colin-alignement',
        type: 'concepts',
        title: 'Points alignés',
        summary: 'A, B et C sont alignés quand les vecteurs AB et AC sont colinéaires.',
        visual: (
          <MiniPlane
            width={210} height={150}
            xMin={-6} xMax={6} yMin={-3} yMax={4}
            showAxes={false}
            points={[
              { x: -3, y: -1, label: 'A', color: P_COLOR, labelPos: 'bl' },
              { x: 1, y: 1, label: 'B', color: P_COLOR, labelPos: 'br' },
              { x: 5, y: 3, label: 'C', color: P_COLOR, labelPos: 'tr' },
            ]}
            arrows={[
              { from: { x: -3, y: -1 }, to: { x: 5, y: 3 }, color: V_COLOR, dashed: true },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Trois points sont <strong>alignés</strong> quand ils sont sur une même droite. Pour le
              dire avec des vecteurs : on part du même point A et on compare les deux flèches.
            </p>
            <div className="font-bold text-violet-700">
              A, B, C alignés ⇔ <MathText>{'$\\overrightarrow{AB}$'}</MathText> et{' '}
              <MathText>{'$\\overrightarrow{AC}$'}</MathText> colinéaires
            </div>
            <p className="text-sm text-slate-600">
              C peut être <strong>entre A et B</strong>, <strong>au-delà de B</strong>, ou
              <strong> de l'autre côté de A</strong> — là, AC part dans le sens contraire de AB, et
              les points restent alignés. Alignés ne veut dire ni « AB = AC », ni « même longueur »,
              ni « C entre A et B ».
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : C déplacé le long du pointillé — trois positions alignées, des deux côtés.
            </div>
          </div>
        ),
      },
      {
        id: 'colin-oeil-hesite',
        type: 'regles',
        title: 'L\'œil ne prouve pas',
        summary: 'À un carreau près, une figure ne permet pas de conclure : il faut un calcul.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Un point <strong>presque</strong> aligné a l'air aligné. Avec A (−3 ; −1), B (1 ; 1) et
              C (5 ; 4), l'œil hésite — et pourtant C n'est pas sur (AB) : le point aligné serait
              (5 ; 3).
            </p>
            <p className="text-sm text-slate-600">
              Une figure <strong>suggère</strong>, elle ne <strong>prouve</strong> pas. Il faut donc
              décider la colinéarité sur les coordonnées, sans dessin.
            </p>
          </div>
        ),
      },
      {
        id: 'colin-vocabulaire-aligne',
        type: 'vocabulaire',
        title: 'Aligné',
        summary: 'Trois points sont alignés quand ils appartiennent à une même droite.',
        body: (
          <p className="text-sm text-slate-600">
            <strong>Aligné</strong> — sur une même droite. Pour trois points A, B, C, cela se teste
            sur les vecteurs <MathText>{'$\\overrightarrow{AB}$'}</MathText> et{' '}
            <MathText>{'$\\overrightarrow{AC}$'}</MathText>, qui partent du même point.
          </p>
        ),
      },
    ],

    /* ── M3 — v = k·u : coordonnées proportionnelles et produits en croix.
       La différence x·y′ − y·x′ apparaît en fin de module, SANS son nom :
       « déterminant » n'arrive qu'au module 4. ── */
    3: [
      {
        id: 'colin-multiple',
        type: 'regles',
        title: 'Colinéaires ⇔ v = k·u',
        summary: 'v est colinéaire à u exactement quand v est un multiple de u.',
        visual: (
          <MiniPlane
            width={210} height={150}
            xMin={-5} xMax={5} yMin={-3} yMax={3}
            showAxes={false}
            arrows={[
              { from: { x: 0, y: 0 }, to: { x: 4, y: 2 }, color: V_COLOR, label: 'v = 2u' },
              { from: { x: 0, y: 0 }, to: { x: 2, y: 1 }, color: U_COLOR },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Sur le rail, v est un <strong>multiple</strong> de u : il existe un réel k tel que
              <MathText>{' $\\vec{v} = k\\,\\vec{u}$'}</MathText>.
            </p>
            <p className="text-sm text-slate-600">
              Les coordonnées suivent le <strong>même</strong> facteur k : elles sont
              <strong> proportionnelles</strong>.
            </p>
            <div className="font-mono text-sm font-bold text-violet-700">
              x′ = k·x et y′ = k·y
            </div>
            <p className="text-sm text-slate-600">
              k &lt; 0 retourne le sens ; <strong>k = 0</strong> donne le vecteur nul — qui est donc
              colinéaire à tout vecteur.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le curseur k, et le tableau des coordonnées qui suit le dessin.
            </div>
          </div>
        ),
      },
      {
        id: 'colin-produits-croix',
        type: 'methodes',
        title: 'Décider sans dessiner',
        summary: 'Coordonnées proportionnelles : on compare les produits en croix x·y′ et y·x′.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Pour <span className="font-mono">u (x ; y)</span> et <span className="font-mono">v (x′ ; y′)</span>,
              les coordonnées sont proportionnelles quand les <strong>produits en croix</strong> sont
              égaux :
            </p>
            <div className="font-mono text-sm font-bold text-violet-700">
              x·y′ = y·x′
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemples</p>
              <p className="font-mono text-xs text-slate-700">u (2 ; 1), v (6 ; 3) : 2 × 3 = 6 et 1 × 6 = 6 → colinéaires</p>
              <p className="font-mono text-xs text-slate-700">u (2 ; 1), v (4 ; 3) : 2 × 3 = 6 et 1 × 4 = 4 → non colinéaires</p>
              <p className="font-mono text-xs text-slate-700">u (4 ; 0), v (6 ; 0) : 4 × 0 = 0 et 0 × 6 = 0 → colinéaires</p>
            </div>
            <p className="text-sm text-slate-600">
              Aucun risque de diviser par zéro : c'est un test par <strong>produits</strong>, pas par
              quotients. Autrement dit, la <strong>différence</strong> x·y′ − y·x′ est nulle — ce
              nombre a un nom, au module suivant.
            </p>
          </div>
        ),
      },
      {
        id: 'colin-nul-colineaire-tout',
        type: 'regles',
        title: 'Le vecteur nul est colinéaire à tout vecteur',
        summary: 'Avec k = 0, v = 0·u : le vecteur nul est colinéaire à n\'importe quel vecteur.',
        body: (
          <p className="text-sm text-slate-600">
            En prenant <strong>k = 0</strong>, on obtient <span className="font-mono">v (0 ; 0)</span> :
            par convention, le <strong>vecteur nul est colinéaire à tout vecteur</strong>. C'est le seul
            cas où la direction n'existe pas et où l'on convient tout de même de la colinéarité.
          </p>
        ),
      },
      {
        id: 'colin-coordonnee-manquante-prop',
        type: 'methodes',
        title: 'Trouver une coordonnée manquante',
        summary: 'On écrit la proportionnalité et on résout : u (2 ; −3) et v (−6 ; y) donnent y = 9.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              <span className="font-mono">u (2 ; −3)</span> et <span className="font-mono">v (−6 ; y)</span>{' '}
              sont colinéaires. On cherche le facteur k sur la coordonnée connue :
            </p>
            <p className="font-mono text-sm text-slate-700">−6 = 2k, donc k = −3</p>
            <p className="font-mono text-sm text-slate-700">y = k × (−3) = (−3) × (−3) = 9</p>
            <p className="text-sm text-slate-600">
              Vérification par les produits en croix : 2 × 9 = 18 et (−3) × (−6) = 18. ✓
            </p>
          </div>
        ),
      },
      {
        id: 'mem-colin-multiple',
        type: 'memoriser',
        title: '⭐ Colinéaires ⇔ v = k·u',
        summary: 'Les coordonnées de v sont celles de u multipliées par un même nombre.',
        body: (
          <p className="text-sm text-slate-700">
            <strong>Colinéaires ⇔ v = k·u</strong> : un <strong>même</strong> facteur k sur les deux
            coordonnées.
          </p>
        ),
      },
    ],

    /* ── M4 — Le détecteur : le nombre du module 3 reçoit son nom, son aire
       et son signe. C'est ici, et pas avant, que « déterminant » s'écrit. ── */
    4: [
      {
        id: 'colin-determinant',
        type: 'concepts',
        title: 'Déterminant',
        summary: 'det(u, v) = x·y′ − y·x′ : un nombre calculé sur les coordonnées.',
        visual: (
          <MiniPlane
            width={210} height={150}
            xMin={-1} xMax={7} yMin={-1} yMax={4}
            arrows={[
              { from: { x: 0, y: 0 }, to: { x: 3, y: 1 }, color: U_COLOR, label: 'u' },
              { from: { x: 0, y: 0 }, to: { x: 1, y: 2 }, color: V_COLOR, label: 'v' },
              { from: { x: 3, y: 1 }, to: { x: 4, y: 3 }, color: V_COLOR, dashed: true },
              { from: { x: 1, y: 2 }, to: { x: 4, y: 3 }, color: U_COLOR, dashed: true },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Pour <span className="font-mono">u (x ; y)</span> et <span className="font-mono">v (x′ ; y′)</span>,
              le <strong>déterminant</strong> est la différence des produits en croix :
            </p>
            <div className="text-violet-700 font-bold">
              <MathText>{'$\\det(\\vec{u}, \\vec{v}) = x\\,y\' - y\\,x\'$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">
              <strong>|det|</strong> est l'<strong>aire</strong>, en carreaux, du parallélogramme
              construit sur u et v. Le <strong>signe</strong> dit de quel côté du rail se trouve v
              (à gauche de u : positif ; à droite : négatif).
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le parallélogramme déformé jusqu'à devenir plat — l'aire tombe à 0.
            </div>
          </div>
        ),
      },
      {
        id: 'colin-critere-det',
        type: 'regles',
        title: 'Le critère det = 0',
        summary: 'det(u, v) = 0 exactement quand u et v sont colinéaires.',
        body: (
          <div className="space-y-3">
            <div className="text-violet-700 font-bold">
              <MathText>{'$\\det(\\vec{u}, \\vec{v}) = 0 \\iff \\vec{u}$'}</MathText> et{' '}
              <MathText>{'$\\vec{v}$'}</MathText> colinéaires
            </div>
            <p className="text-sm text-slate-600">
              Le parallélogramme est <strong>plat</strong> — aire nulle — exactement quand les deux
              flèches sont sur le même rail. Un calcul remplace le dessin, même quand l'œil hésite.
            </p>
            <p className="text-sm text-slate-600">
              Attention : un déterminant de <strong>±1</strong> n'est pas « presque zéro ». Il n'est
              pas nul, donc les vecteurs ne sont pas colinéaires. <strong>Zéro, ou pas zéro</strong> :
              rien d'autre ne compte.
            </p>
          </div>
        ),
      },
      {
        id: 'colin-calculer-det',
        type: 'methodes',
        title: 'Calculer un déterminant',
        summary: 'On multiplie en croix, puis on soustrait — en surveillant les signes.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Pour <span className="font-mono">u (3 ; 5)</span> et <span className="font-mono">v (2 ; 4)</span> :
            </p>
            <p className="font-mono text-sm font-bold text-slate-800">
              det = 3 × 4 − 5 × 2 = 12 − 10 = 2
            </p>
            <p className="text-sm text-slate-600">
              Non nul : u et v ne sont pas colinéaires (le parallélogramme a une aire de 2 carreaux).
            </p>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Les deux pièges</p>
              <p className="text-xs text-rose-900">
                C'est une <strong>différence</strong>, pas une somme : 12 + 10 = 22 est faux.
              </p>
              <p className="text-xs text-rose-900">
                L'<strong>ordre</strong> compte : on commence par x·y′, puis on retire y·x′.
                10 − 12 = −2 est l'inverse.
              </p>
              <p className="text-xs text-rose-900">
                Le produit de deux négatifs est <strong>positif</strong> : (−2) × (−6) = +12.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'colin-formule-det',
        type: 'formules',
        title: 'Déterminant de deux vecteurs',
        summary: 'det(u, v) = x·y′ − y·x′, nul si et seulement si u et v sont colinéaires.',
        body: (
          <div className="space-y-2">
            <MathText>{'$$\\det(\\vec{u}, \\vec{v}) = \\begin{vmatrix} x & x\' \\\\ y & y\' \\end{vmatrix} = x\\,y\' - y\\,x\'$$'}</MathText>
            <p className="text-xs text-slate-500">
              avec <span className="font-mono">u (x ; y)</span> et <span className="font-mono">v (x′ ; y′)</span>.
            </p>
          </div>
        ),
      },
      {
        id: 'colin-vocabulaire-determinant',
        type: 'vocabulaire',
        title: 'Déterminant',
        summary: 'Le nombre x·y′ − y·x′ associé au couple (u, v).',
        body: (
          <p className="text-sm text-slate-600">
            <strong>Déterminant</strong> — le nombre <span className="font-mono">x·y′ − y·x′</span>{' '}
            associé au couple de vecteurs (u, v). Sa valeur absolue est l'aire du parallélogramme
            construit sur u et v ; sa nullité caractérise la colinéarité.
          </p>
        ),
      },
      {
        id: 'mem-colin-det-zero',
        type: 'memoriser',
        title: '⭐ det = 0 ⇔ colinéaires',
        summary: 'det(u, v) = x·y′ − y·x′ ; nul exactement quand les vecteurs sont colinéaires.',
        body: (
          <div className="space-y-1">
            <p className="text-sm text-slate-700">
              <strong>det(u, v) = x·y′ − y·x′</strong>
            </p>
            <p className="text-sm text-slate-700">
              <strong>det = 0 ⇔ u et v colinéaires.</strong> Zéro, ou pas zéro.
            </p>
          </div>
        ),
      },
    ],

    /* ── M5 (ex-M6) — Les deux usages géométriques : alignement et
       parallélisme, un seul test. Plus la coordonnée manquante, résolue
       cette fois par le déterminant. ── */
    5: [
      {
        id: 'colin-alignement-det',
        type: 'regles',
        title: 'Alignement par le déterminant',
        summary: 'A, B, C alignés ⇔ det(AB, AC) = 0.',
        body: (
          <div className="space-y-3">
            <div className="text-violet-700 font-bold">
              A, B, C alignés ⇔ <MathText>{'$\\det(\\overrightarrow{AB}, \\overrightarrow{AC}) = 0$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">
              C'est le pont du module 2 (alignés ⇔ AB et AC colinéaires) rendu <strong>calculable</strong>
              par le critère du module 4.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exemple</p>
              <p className="text-xs text-slate-700">
                P (−4 ; −2), Q (−1 ; 0), R (5 ; 3) : PQ (3 ; 2) et PR (9 ; 5).
              </p>
              <p className="font-mono text-xs text-slate-700">det(PQ, PR) = 3 × 5 − 2 × 9 = 15 − 18 = −3</p>
              <p className="text-xs text-slate-700">
                Non nul : P, Q, R ne sont <strong>pas</strong> alignés. L'œil hésitait ; le déterminant
                a tranché.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'colin-parallelisme-det',
        type: 'regles',
        title: 'Parallélisme par le déterminant',
        summary: '(AB) ∥ (CD) ⇔ det(AB, CD) = 0.',
        visual: (
          <MiniPlane
            width={210} height={150}
            xMin={-5} xMax={5} yMin={-3} yMax={5}
            showAxes={false}
            points={[
              { x: -4, y: -1, label: 'A', color: P_COLOR, labelPos: 'bl' },
              { x: -1, y: 1, label: 'B', color: P_COLOR, labelPos: 'br' },
              { x: 0, y: 2, label: 'C', color: '#0369a1', labelPos: 'tl' },
              { x: 3, y: 4, label: 'D', color: '#0369a1', labelPos: 'tl' },
            ]}
            arrows={[
              { from: { x: -4, y: -1 }, to: { x: -1, y: 1 }, color: U_COLOR },
              { from: { x: 0, y: 2 }, to: { x: 3, y: 4 }, color: V_COLOR },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <div className="text-violet-700 font-bold">
              (AB) ∥ (CD) ⇔ <MathText>{'$\\det(\\overrightarrow{AB}, \\overrightarrow{CD}) = 0$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">
              Deux droites sont parallèles exactement quand leurs vecteurs AB et CD sont colinéaires.
              CD peut être <strong>plus long</strong>, <strong>plus court</strong> ou de
              <strong> sens contraire</strong> : cela ne change rien.
            </p>
            <p className="text-sm text-slate-600">
              Exemple : AB (4 ; −2) et CD (−6 ; 3) → 4 × 3 − (−2) × (−6) = 12 − 12 = 0, donc
              (AB) ∥ (CD), avec CD = −1,5·AB.
            </p>
          </div>
        ),
      },
      {
        id: 'colin-methode-conclure',
        type: 'methodes',
        title: 'Prouver un alignement ou un parallélisme',
        summary: 'Construire les deux vecteurs, calculer leur déterminant, conclure.',
        body: (
          <div className="space-y-3">
            <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
              <li>
                Choisir les <strong>deux vecteurs</strong> : AB et AC pour un alignement (même point
                de départ), AB et CD pour un parallélisme.
              </li>
              <li>
                Calculer leurs coordonnées : <strong>arrivée moins départ</strong>, par exemple
                <MathText>{' $\\overrightarrow{AB}\\,(x_B - x_A\\,;\\,y_B - y_A)$'}</MathText>.
              </li>
              <li>Calculer le <strong>déterminant</strong> x·y′ − y·x′.</li>
              <li>
                Conclure : <strong>nul</strong> → alignés (ou parallèles) ; <strong>non nul</strong> → ni
                l'un ni l'autre.
              </li>
            </ol>
            <p className="text-xs text-slate-500">
              Une figure ne remplace jamais ce calcul : « presque aligné » n'existe pas.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les cinq niveaux — l'œil, puis les vecteurs, puis le nombre qui tranche.
            </div>
          </div>
        ),
      },
      {
        id: 'colin-coordonnee-manquante-det',
        type: 'methodes',
        title: 'Chercher une coordonnée pour aligner',
        summary: 'On pose det = 0, on obtient une équation, on la résout.',
        body: (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              E (−1 ; 0), F (2 ; 2), G (5 ; y) : pour quelle valeur de y les trois points sont-ils
              alignés ?
            </p>
            <p className="text-sm text-slate-700">
              EF (3 ; 2) et EG (6 ; y − 2). On écrit le critère, puis on résout :
            </p>
            <p className="font-mono text-sm text-slate-700">
              det(EF, EG) = 3 × (y − 2) − 2 × 6 = 0
            </p>
            <p className="font-mono text-sm text-slate-700">3y − 6 − 12 = 0, donc y = 6</p>
            <p className="text-sm text-slate-600">
              Vérification : EG (6 ; 4) = 2·EF. ✓
            </p>
          </div>
        ),
      },
      {
        id: 'colin-vocabulaire-parallele',
        type: 'vocabulaire',
        title: 'Parallèle',
        summary: 'Deux droites sont parallèles quand leurs vecteurs directeurs sont colinéaires.',
        body: (
          <p className="text-sm text-slate-600">
            <strong>Parallèle</strong> — deux droites (AB) et (CD) sont parallèles lorsque les vecteurs
            AB et CD sont <strong>colinéaires</strong>. Alignement et parallélisme sont le
            <strong> même test</strong>, appliqué à AB/AC dans un cas, à AB/CD dans l'autre.
          </p>
        ),
      },
      {
        id: 'mem-colin-deux-usages',
        type: 'memoriser',
        title: '⭐ Un test, deux usages',
        summary: 'Alignés : det(AB, AC) = 0. Parallèles : det(AB, CD) = 0.',
        body: (
          <div className="space-y-1">
            <p className="text-sm text-slate-700">
              <strong>Alignés</strong> : det(AB, AC) = 0.
            </p>
            <p className="text-sm text-slate-700">
              <strong>Parallèles</strong> : det(AB, CD) = 0.
            </p>
          </div>
        ),
      },
    ],
  },
};
