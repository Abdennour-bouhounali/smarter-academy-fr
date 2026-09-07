import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniPlane, RightTriangle, ChaslesArrow } from './components/knowledgeVisuals';

/**
 * Connaissances de la leçon « Vecteurs » — SOURCE UNIQUE de vérité.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. Les coordonnées n'apparaissent qu'à partir du
 * module 3, la somme au module 4, la norme au module 6.
 *
 * Forme d'un item — celle qu'attend KnowledgeMap.jsx :
 *   { id, type: <catégorie de CATEGORIES>, title, summary, visual?, body }
 * `module` et `isNew` sont ajoutés par le réducteur, jamais écrits ici.
 */
export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le robot du dépôt : un déplacement (direction, sens, longueur),
       la même recette d'où que l'on parte. Le mot « vecteur » est donné en
       pied de module. Aucune coordonnée. */
    1: [
      {
        id: 'vecteur-deplacement',
        type: 'concepts',
        title: 'Vecteur',
        summary: 'Un vecteur décrit un déplacement — indépendamment du point de départ.',
        visual: (
          <MiniPlane
            width={210} height={145}
            xMin={0} xMax={6} yMin={0} yMax={4}
            showAxes={false}
            points={[
              { x: 1, y: 1, label: 'A', color: '#0369a1', labelPos: 'bl' },
              { x: 4, y: 3, label: 'B', color: '#7c3aed', labelPos: 'tr' },
            ]}
            arrows={[{ from: { x: 1, y: 1 }, to: { x: 4, y: 3 }, color: '#7c3aed', label: 'AB' }]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Un vecteur est un <strong>déplacement</strong>. Il est défini par trois attributs :</p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-500 shrink-0" />Direction — la droite suivie</li>
              <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-violet-500 shrink-0" />Sens — de quel côté on avance</li>
              <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 shrink-0" />Longueur — la distance parcourue</li>
            </ul>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">Exemple</div>
              <div className="text-sm text-slate-700">La recette du robot : <strong>3 vers la droite et 2 vers le haut</strong>.</div>
              <div className="text-violet-700 font-bold"><MathText>{'$\\overrightarrow{AB}$'}</MathText> <span className="text-xs font-normal text-slate-500">— le vecteur qui mène de A à B</span></div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le robot sur le sol carrelé — la même recette depuis n'importe quelle case.</div>
          </div>
        ),
      },
      {
        id: 'mem-deplacement',
        type: 'memoriser',
        title: '⭐ Un vecteur = un déplacement',
        summary: 'Direction + Sens + Longueur. Indépendant du point de départ.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-xl font-black text-rose-700">Un vecteur = un déplacement</div>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Direction</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Sens</span>
                <span className="bg-violet-100 text-violet-800 text-xs font-bold px-3 py-1 rounded-full">Longueur</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">Peu importe d'où l'on part — le déplacement reste le même.</p>
          </div>
        ),
      },
    ],

    /* M2 — Le même vecteur : représentants, égalité (trois attributs),
       vecteur nul, vecteur opposé. Toujours sans coordonnées. */
    2: [
      {
        id: 'egalite-vecteurs',
        type: 'concepts',
        title: 'Égalité de deux vecteurs',
        summary: 'Deux vecteurs sont égaux s’ils ont même direction, même sens et même longueur — peu importe leur position.',
        visual: (
          <MiniPlane
            width={210} height={145}
            xMin={-1} xMax={6} yMin={-1} yMax={5}
            points={[
              { x: 0, y: 0, label: 'A', color: '#0369a1', labelPos: 'b' },
              { x: 3, y: 2, label: 'B', color: '#0369a1', labelPos: 'tr' },
              { x: 1, y: 2, label: 'C', color: '#059669', labelPos: 'tl' },
              { x: 4, y: 4, label: 'D', color: '#059669', labelPos: 'tr' },
            ]}
            arrows={[
              { from: { x: 0, y: 0 }, to: { x: 3, y: 2 }, color: '#0369a1', label: 'AB' },
              { from: { x: 1, y: 2 }, to: { x: 4, y: 4 }, color: '#059669', label: 'CD' },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Deux vecteurs sont <strong>égaux</strong> quand leurs trois attributs coïncident.</p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <MathText>{'$\\overrightarrow{AB} = \\overrightarrow{CD}$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">⟺ même direction, même sens, même longueur</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Les flèches AB et CD ne partent pas du même point et n'arrivent pas au même point — et pourtant c'est le <strong>même vecteur</strong>.
            </div>
          </div>
        ),
      },
      {
        id: 'vecteur-nul',
        type: 'concepts',
        title: 'Vecteur nul',
        summary: 'Départ et arrivée confondus : le déplacement qui ne déplace rien.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <MathText>{'$$\\overrightarrow{AA} = \\vec{0}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">Quand le départ et l'arrivée sont confondus, la flèche devient un point. Pas de direction ni de sens défini, longueur nulle.</p>
          </div>
        ),
      },
      {
        id: 'regle-vecteur-oppose',
        type: 'regles',
        title: 'Vecteur opposé',
        summary: 'BA = −AB — même direction, même longueur, sens contraire.',
        visual: (
          <MiniPlane
            width={210} height={120}
            xMin={0} xMax={5} yMin={0} yMax={3}
            points={[
              { x: 1, y: 1, label: 'A', color: '#0369a1', labelPos: 'bl' },
              { x: 4, y: 2, label: 'B', color: '#7c3aed', labelPos: 'br' },
            ]}
            arrows={[
              { from: { x: 1, y: 1 }, to: { x: 4, y: 2 }, color: '#7c3aed', label: 'AB' },
              { from: { x: 4, y: 2 }, to: { x: 1, y: 1 }, color: '#be123c', label: 'BA' },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-4 text-center">
              <MathText>{'$$\\overrightarrow{BA} = -\\overrightarrow{AB}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">Le <strong>retour</strong> : même direction et même longueur que l'aller, mais le <strong>sens contraire</strong>. On note <MathText>{'$-\\vec{u}$'}</MathText> l'opposé de <MathText>{'$\\vec{u}$'}</MathText>.</p>
            <div className="bg-orange-50 rounded-lg p-2 text-xs text-orange-800">
              Aller de A à B puis revenir de B à A : le robot est revenu à sa case.
            </div>
          </div>
        ),
      },
      {
        id: 'vocab-representant',
        type: 'vocabulaire',
        title: "Représentant d'un vecteur",
        summary: 'Une flèche concrète qui matérialise le vecteur.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Un vecteur n'a pas d'adresse : une <strong>infinité</strong> de flèches, toutes de même direction, même sens et même longueur, le représentent.</p>
            <div className="bg-violet-50 rounded-lg p-3 text-xs text-violet-800 space-y-1.5">
              <div>Choisis n'importe quel point de départ, trace le déplacement <MathText>{'$\\vec{u}$'}</MathText> : tu obtiens un représentant de <MathText>{'$\\vec{u}$'}</MathText>.</div>
              <div>Si la flèche part de A et arrive en B, ce représentant se note <MathText>{'$\\overrightarrow{AB}$'}</MathText>.</div>
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Deux nombres suffisent : base orthonormée, coordonnées d'un
       vecteur, AB = arrivée − départ, égaux ⟺ mêmes coordonnées. */
    3: [
      {
        id: 'coordonnees-vecteur',
        type: 'concepts',
        title: "Coordonnées d'un vecteur",
        summary: "Dans la base (i, j), deux nombres décrivent entièrement un vecteur.",
        visual: (
          <MiniPlane
            width={210} height={155}
            xMin={-1} xMax={5} yMin={-1} yMax={5}
            points={[
              { x: 1, y: 1, label: 'A', color: '#0369a1', labelPos: 'bl' },
              { x: 4, y: 4, label: 'B', color: '#7c3aed', labelPos: 'tr' },
              { x: 4, y: 1, label: '', color: '#cbd5e1', labelPos: 'br' },
            ]}
            arrows={[
              { from: { x: 1, y: 1 }, to: { x: 4, y: 4 }, color: '#7c3aed', label: 'AB' },
              { from: { x: 1, y: 1 }, to: { x: 4, y: 1 }, color: '#0369a1', dashed: true },
              { from: { x: 4, y: 1 }, to: { x: 4, y: 4 }, color: '#047857', dashed: true },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">L'escalier horizontal−vertical révèle les deux coordonnées :</p>
            <div className="bg-white rounded-xl border border-violet-100 p-3 space-y-1.5">
              <div className="text-blue-700 text-sm"><MathText>{'$\\text{horizontal} : +3$'}</MathText></div>
              <div className="text-emerald-700 text-sm"><MathText>{'$\\text{vertical} : +3$'}</MathText></div>
              <div className="text-violet-700 font-bold mt-1"><MathText>{'$\\overrightarrow{AB} = (3 \\; ; \\; 3)$'}</MathText></div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l'escalier qu'on construisait pour compter les pas horizontaux puis verticaux.</div>
          </div>
        ),
      },
      {
        id: 'regle-coordonnees',
        type: 'regles',
        title: 'Coordonnées de AB = arrivée − départ',
        summary: 'xB − xA pour l\'abscisse, yB − yA pour l\'ordonnée.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-200 p-4 text-center">
              <MathText>{'$$\\overrightarrow{AB} = \\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$$'}</MathText>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 space-y-1.5">
              <div className="text-xs"><MathText>{'$A(2 \\; ; \\; 1)$ et $B(5 \\; ; \\; 4)$'}</MathText></div>
              <div className="space-y-0.5">
                <div className="text-blue-700 text-xs"><MathText>{'$x : 5 - 2 = \\mathbf{3}$'}</MathText></div>
                <div className="text-emerald-700 text-xs"><MathText>{'$y : 4 - 1 = \\mathbf{3}$'}</MathText></div>
                <div className="text-orange-700 font-bold mt-1"><MathText>{'$\\overrightarrow{AB} = (3 \\; ; \\; 3)$'}</MathText></div>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700">
              ⚠️ <strong>Piège :</strong> <MathText>{'$\\overrightarrow{BA} = (2{-}5 \\;; \\; 1{-}4) = (-3\\,;\\,-3)$'}</MathText> — l'ordre des lettres compte !
            </div>
          </div>
        ),
      },
      {
        id: 'regle-egalite-coordonnees',
        type: 'regles',
        title: 'Égaux ⟺ mêmes coordonnées',
        summary: 'Deux vecteurs sont égaux exactement quand leurs deux coordonnées coïncident.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-200 p-4 text-center">
              <MathText>{'$$\\vec{u} = \\vec{v} \\Longleftrightarrow (x \\; ; \\; y) = (x^{\\prime} \\; ; \\; y^{\\prime})$$'}</MathText>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 space-y-1.5">
              <div className="text-xs text-orange-800"><MathText>{'$A(0\\,;\\,0) \\to B(3\\,;\\,2)$ et $C(1\\,;\\,2) \\to D(4\\,;\\,4)$'}</MathText></div>
              <div className="text-xs text-orange-800">
                <MathText>{'$\\overrightarrow{AB} = (3\\,;\\,2)$'}</MathText>
                <span className="mx-2 text-slate-400">et</span>
                <MathText>{'$\\overrightarrow{CD} = (4{-}1\\,;\\,4{-}2) = (3\\,;\\,2) \\checkmark$'}</MathText>
              </div>
              <div className="text-orange-700 font-bold text-xs"><MathText>{'$\\overrightarrow{AB} = \\overrightarrow{CD}$'}</MathText> — sans regarder la figure.</div>
            </div>
          </div>
        ),
      },
      {
        id: 'methode-calcul-coordonnees',
        type: 'methodes',
        title: 'Calculer les coordonnées de AB',
        summary: 'Arrivée − départ, composante par composante.',
        body: (
          <div className="space-y-3">
            <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
              <div className="text-sm font-semibold text-emerald-800">Méthode en 3 étapes :</div>
              <ol className="space-y-1.5 text-sm text-emerald-900">
                <li className="flex gap-2">
                  <span className="font-mono font-bold text-emerald-600 w-5 shrink-0">1.</span>
                  <span>Repérer les coordonnées de <MathText>{'$A$'}</MathText> et de <MathText>{'$B$'}</MathText></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono font-bold text-emerald-600 w-5 shrink-0">2.</span>
                  <span>Soustraire : <MathText>{'$x_B - x_A$'}</MathText></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono font-bold text-emerald-600 w-5 shrink-0">3.</span>
                  <span>Soustraire : <MathText>{'$y_B - y_A$'}</MathText></span>
                </li>
              </ol>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-xs"><MathText>{'$A(-3 \\; ; \\; 2),\\; B(1 \\; ; \\; -1)$'}</MathText></div>
              <div className="text-blue-700 text-xs"><MathText>{'$x : 1 - (-3) = \\mathbf{4}$'}</MathText></div>
              <div className="text-emerald-700 text-xs"><MathText>{'$y : -1 - 2 = \\mathbf{-3}$'}</MathText></div>
              <div className="text-violet-700 font-bold"><MathText>{'$\\overrightarrow{AB} = (4 \\; ; \\; -3)$'}</MathText></div>
            </div>
          </div>
        ),
      },
      {
        id: 'vocab-base-orthonormee',
        type: 'vocabulaire',
        title: 'Base orthonormée',
        summary: 'i et j : perpendiculaires, longueur 1.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 space-y-1.5">
              <div><MathText>{'$\\vec{i} = (1 \\; ; \\; 0)$'}</MathText> — 1 pas à droite</div>
              <div><MathText>{'$\\vec{j} = (0 \\; ; \\; 1)$'}</MathText> — 1 pas vers le haut</div>
            </div>
            <p className="text-sm text-slate-600">Tout vecteur s'exprime dans cette base :</p>
            <div className="text-center">
              <MathText>{'$\\vec{u} = x\\vec{i} + y\\vec{j}$'}</MathText>
            </div>
            <div className="bg-violet-50 rounded-lg p-2 text-xs text-violet-800">
              Orthonormée = orthogonale <MathText>{'$(\\vec{i} \\perp \\vec{j})$'}</MathText> + normée (<MathText>{'$\\vec{i}$'}</MathText> et <MathText>{'$\\vec{j}$'}</MathText> ont pour longueur 1)
            </div>
          </div>
        ),
      },
      {
        id: 'mem-arrivee-moins-depart',
        type: 'memoriser',
        title: '⭐ Coordonnées = arrivée − départ',
        summary: 'Pour AB : xB − xA et yB − yA. Jamais départ − arrivée.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-4 text-center space-y-2">
              <div className="font-black text-rose-700 text-lg">ARRIVÉE − DÉPART</div>
              <MathText>{'$$\\overrightarrow{AB} = (x_B - x_A \\; ; \\; y_B - y_A)$$'}</MathText>
            </div>
            <div className="bg-white rounded-lg border p-3 space-y-1.5">
              <div className="text-xs"><MathText>{'$A(2\\,;\\,1),\\; B(5\\,;\\,4)$'}</MathText></div>
              <div className="text-rose-600 font-bold text-xs">
                <MathText>{'$\\rightarrow (5-2\\;; \\;4-1) = (3\\,;\\,3) \\checkmark$'}</MathText>
              </div>
              <div className="line-through text-rose-300 text-xs">
                <MathText>{'$(2-5\\,;\\,1-4) = (-3\\,;\\,-3) \\times$'}</MathText>
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-800">
              🧠 <MathText>{'$\\overrightarrow{AB}$'}</MathText> part de <MathText>{'$A$'}</MathText> et arrive en <MathText>{'$B$'}</MathText> → les coords de <MathText>{'$B$'}</MathText> en premier.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-oppose',
        type: 'memoriser',
        title: '⭐ Vecteur opposé',
        summary: 'BA = −AB — inverser les lettres change le signe.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-4 text-center">
              <MathText>{'$$\\overrightarrow{BA} = -\\overrightarrow{AB}$$'}</MathText>
            </div>
            <div className="bg-white rounded-lg border p-3 space-y-1.5">
              <div className="text-violet-700"><MathText>{'$\\overrightarrow{AB} = (3 \\; ; \\; 2)$'}</MathText></div>
              <div className="text-rose-700"><MathText>{'$\\overrightarrow{BA} = (-3 \\; ; \\; -2)$'}</MathText></div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-800">🧠 Inverser la flèche = inverser tous les signes.</div>
          </div>
        ),
      },
      {
        id: 'formule-coordonnees',
        type: 'formules',
        title: 'Coordonnées du vecteur AB',
        summary: 'AB = (xB − xA ; yB − yA)',
        body: (
          <div className="space-y-3">
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 text-center">
              <MathText>{'$$\\overrightarrow{AB} = \\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$$'}</MathText>
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Enchaîner les déplacements : somme bout à bout, coordonnées
       qui s'ajoutent, relation de Chasles, u + (−u) = 0. */
    4: [
      {
        id: 'regle-somme',
        type: 'regles',
        title: 'Somme de deux vecteurs',
        summary: '(x ; y) + (x\' ; y\') = (x+x\' ; y+y\')',
        visual: (
          <MiniPlane
            width={210} height={145}
            xMin={-1} xMax={5} yMin={-1} yMax={4}
            points={[
              { x: 0, y: 0, label: 'A', color: '#0f172a', labelPos: 'b' },
              { x: 3, y: 1, label: 'B', color: '#7c3aed', labelPos: 'br' },
              { x: 4, y: 3, label: 'C', color: '#059669', labelPos: 'tr' },
            ]}
            arrows={[
              { from: { x: 0, y: 0 }, to: { x: 3, y: 1 }, color: '#7c3aed', label: 'u' },
              { from: { x: 3, y: 1 }, to: { x: 4, y: 3 }, color: '#059669', label: 'v' },
              { from: { x: 0, y: 0 }, to: { x: 4, y: 3 }, color: '#d97706', label: 'u+v', dashed: true },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Enchaîner deux déplacements = additionner leurs coordonnées.</p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5">
              <div className="text-violet-700"><MathText>{'$\\vec{u} = (3 \\; ; \\; 1)$'}</MathText></div>
              <div className="text-emerald-700"><MathText>{'$\\vec{v} = (1 \\; ; \\; 2)$'}</MathText></div>
              <div className="text-amber-700 font-bold"><MathText>{'$\\vec{u} + \\vec{v} = (4 \\; ; \\; 3)$'}</MathText></div>
            </div>
            <div className="overflow-hidden rounded-xl border border-orange-100 bg-white p-2">
              <ChaslesArrow />
            </div>
            <div className="bg-orange-50 rounded-lg p-2 text-xs text-orange-800">
              <strong>Relation de Chasles :</strong> <MathText>{'$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$'}</MathText>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-700 text-center">
              Aller puis revenir : <MathText>{'$\\vec{u} + (-\\vec{u}) = \\vec{0} = (0 \\; ; \\; 0)$'}</MathText>
            </div>
          </div>
        ),
      },
      {
        id: 'vocab-relation-chasles',
        type: 'vocabulaire',
        title: 'Relation de Chasles',
        summary: 'AB + BC = AC — deux déplacements successifs s\'additionnent.',
        visual: <ChaslesArrow />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-4 text-center">
              <MathText>{'$$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-600"><MathText>{'$A \\to B$'}</MathText> puis <MathText>{'$B \\to C$'}</MathText> = <MathText>{'$A \\to C$'}</MathText> directement.</p>
            <div className="bg-violet-50 rounded-lg p-3 space-y-1.5">
              <div className="text-xs"><MathText>{'$A(0\\,;\\,0),\\; B(2\\,;\\,3),\\; C(5\\,;\\,1)$'}</MathText></div>
              <div className="text-blue-700 text-xs">
                <MathText>{'$\\overrightarrow{AB} = (2\\,;\\,3)$'}</MathText>
                <span className="mx-2 text-slate-400">et</span>
                <MathText>{'$\\overrightarrow{BC} = (3\\,;\\,-2)$'}</MathText>
              </div>
              <div className="text-amber-700 font-bold text-xs">
                <MathText>{'$\\overrightarrow{AB} + \\overrightarrow{BC} = (5\\,;\\,1) = \\overrightarrow{AC} \\checkmark$'}</MathText>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'mem-chasles',
        type: 'memoriser',
        title: '⭐ Relation de Chasles',
        summary: 'AB + BC = AC — la lettre du milieu disparaît.',
        visual: <ChaslesArrow />,
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-4 text-center">
              <MathText>{'$$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$$'}</MathText>
            </div>
            <p className="text-xs text-slate-600">La lettre du milieu (<MathText>{'$B$'}</MathText>) disparaît. Ce qui compte : le départ (<MathText>{'$A$'}</MathText>) et l'arrivée (<MathText>{'$C$'}</MathText>).</p>
            <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-800">
              🧠 Le <MathText>{'$B$'}</MathText> au bout de <MathText>{'$\\overrightarrow{AB}$'}</MathText> et au début de <MathText>{'$\\overrightarrow{BC}$'}</MathText> se « téléscope » et disparaît.
            </div>
          </div>
        ),
      },
      {
        id: 'formule-somme',
        type: 'formules',
        title: 'Somme de vecteurs',
        summary: "(x ; y) + (x' ; y') = (x+x' ; y+y')",
        body: (
          <div className="space-y-3">
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 text-center">
              <MathText>{'$$\\vec{u} + \\vec{v} = (x+x^{\\prime} \\; ; \\; y+y^{\\prime})$$'}</MathText>
            </div>
            <div className="bg-white rounded-lg border p-3 space-y-1">
              <div><MathText>{'$\\vec{u} = (2 \\; ; \\; -1)$'}</MathText></div>
              <div><MathText>{'$\\vec{v} = (3 \\; ; \\; 5)$'}</MathText></div>
              <div className="text-indigo-700 font-bold mt-1"><MathText>{'$\\vec{u} + \\vec{v} = (5 \\; ; \\; 4)$'}</MathText></div>
            </div>
          </div>
        ),
      },
      {
        id: 'formule-chasles',
        type: 'formules',
        title: 'Relation de Chasles',
        summary: 'AB + BC = AC',
        body: (
          <div className="space-y-3">
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 text-center">
              <MathText>{'$$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$$'}</MathText>
            </div>
            <div className="bg-white rounded-lg border p-3 space-y-1">
              <div className="text-xs text-slate-400">Généralisation :</div>
              <div className="text-indigo-700"><MathText>{'$$\\overrightarrow{AB} = \\overrightarrow{AO} + \\overrightarrow{OB}$$'}</MathText></div>
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Étirer, inverser : produit par un réel k, colinéarité. */
    5: [
      {
        id: 'regle-produit-reel',
        type: 'regles',
        title: 'Produit par un réel k',
        summary: 'k · (x ; y) = (kx ; ky) — la flèche s\'étire, s\'inverse, ou s\'annule.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-4 text-center">
              <MathText>{'$$k \\cdot \\vec{u} = k \\cdot (x \\; ; \\; y) = (kx \\; ; \\; ky)$$'}</MathText>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="bg-emerald-50 rounded-lg p-2">
                <div className="font-bold text-emerald-700"><MathText>{'$k = 2$'}</MathText></div>
                <div className="text-emerald-600 text-xs">× 2 la longueur</div>
              </div>
              <div className="bg-rose-50 rounded-lg p-2">
                <div className="font-bold text-rose-700"><MathText>{'$k = -1$'}</MathText></div>
                <div className="text-rose-600 text-xs">sens opposé</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="font-bold text-slate-700"><MathText>{'$k = 0$'}</MathText></div>
                <div className="text-slate-600 text-xs">vecteur nul</div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 space-y-1.5">
              <div className="text-slate-500 text-xs"><MathText>{'$\\vec{u} = (2 \\; ; \\; 1)$'}</MathText></div>
              <div className="text-orange-700"><MathText>{'$3\\vec{u} = (6 \\; ; \\; 3)$'}</MathText></div>
              <div className="text-rose-700"><MathText>{'$-\\vec{u} = (-2 \\; ; \\; -1)$'}</MathText></div>
            </div>
          </div>
        ),
      },
      {
        id: 'regle-colineaire',
        type: 'regles',
        title: 'Vecteurs colinéaires',
        summary: 'v = k · u — l\'un est un multiple scalaire de l\'autre.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-4 text-center">
              <MathText>{'$$\\vec{v} = k \\cdot \\vec{u}$$'}</MathText>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 space-y-1.5">
              <div className="font-semibold text-orange-800 text-xs">Exemple :</div>
              <div><MathText>{'$\\vec{u} = (2 \\; ; \\; 1)$'}</MathText></div>
              <div><MathText>{'$\\vec{v} = (6 \\; ; \\; 3) = 3 \\cdot \\vec{u}$'}</MathText></div>
              <div className="text-orange-700 font-bold">
                <MathText>{'$\\Rightarrow$'}</MathText> colinéaires <MathText>{'$(k = 3)$'}</MathText>
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* M6 — Mesurer un vecteur : norme, distance, milieu. */
    6: [
      {
        id: 'methode-calcul-norme',
        type: 'methodes',
        title: 'Calculer la norme',
        summary: 'Pythagore : ‖u‖ = √(x² + y²)',
        visual: <RightTriangle a={3} b={4} hyp={5} />,
        body: (
          <div className="space-y-3">
            <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
              <div className="text-sm font-semibold text-emerald-800">Méthode :</div>
              <ol className="space-y-1.5 text-sm text-emerald-900">
                <li className="flex gap-2">
                  <span className="font-mono font-bold text-emerald-600 w-5 shrink-0">1.</span>
                  <span>Écrire <MathText>{'$x^2 + y^2$'}</MathText></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono font-bold text-emerald-600 w-5 shrink-0">2.</span>
                  <span>Calculer la somme</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono font-bold text-emerald-600 w-5 shrink-0">3.</span>
                  <span>Prendre la racine carrée <MathText>{'$(\\geq 0)$'}</MathText></span>
                </li>
              </ol>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="text-xs text-slate-500">Exemple : <MathText>{'$\\vec{u} = (3 \\; ; \\; 4)$'}</MathText></div>
              <MathText>{'$$\\|\\vec{u}\\| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$$'}</MathText>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600">La norme est une <strong>longueur</strong> : toujours <MathText>{'$\\geq 0$'}</MathText>.</div>
          </div>
        ),
      },
      {
        id: 'methode-milieu',
        type: 'methodes',
        title: "Calculer le milieu d'un segment",
        summary: "Moyennes : I = ((xA+xB)/2 ; (yA+yB)/2)",
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-4 text-center">
              <MathText>{'$$I = \\left(\\frac{x_A + x_B}{2} \\; ; \\; \\frac{y_A + y_B}{2}\\right)$$'}</MathText>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 space-y-1.5">
              <div className="text-xs"><MathText>{'$A(-5 \\; ; \\; -2),\\; B(3 \\; ; \\; 4)$'}</MathText></div>
              <div className="text-emerald-700 text-xs"><MathText>{'$x : (-5 + 3) / 2 = \\mathbf{-1}$'}</MathText></div>
              <div className="text-emerald-700 text-xs"><MathText>{'$y : (-2 + 4) / 2 = \\mathbf{1}$'}</MathText></div>
              <div className="font-bold text-emerald-800"><MathText>{'$I(-1 \\; ; \\; 1)$'}</MathText></div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600">
              Vérification : <MathText>{'$\\overrightarrow{AI} = \\overrightarrow{IB}$'}</MathText>
            </div>
          </div>
        ),
      },
      {
        id: 'vocab-norme',
        type: 'vocabulaire',
        title: "Norme d'un vecteur",
        summary: "La longueur du vecteur, notée ‖u‖.",
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-4 text-center">
              <MathText>{'$$\\|\\vec{u}\\| = \\sqrt{x^2 + y^2}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-600">La norme mesure la <strong>longueur</strong> du déplacement. Toujours <MathText>{'$\\geq 0$'}</MathText>.</p>
            <div className="text-center">
              <MathText>{'$AB = \\|\\overrightarrow{AB}\\|$'}</MathText>
            </div>
          </div>
        ),
      },
      {
        id: 'formule-norme',
        type: 'formules',
        title: "Norme d'un vecteur",
        summary: '‖u‖ = √(x² + y²)',
        visual: <RightTriangle a={3} b={4} hyp={5} color="#4338ca" />,
        body: (
          <div className="space-y-3">
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 text-center">
              <MathText>{'$$\\|\\vec{u}\\| = \\sqrt{x^2 + y^2}$$'}</MathText>
            </div>
            <div className="bg-white rounded-xl border border-indigo-100 p-4 text-center">
              <MathText>{'$$AB = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2}$$'}</MathText>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 space-y-1">
              <div className="text-slate-400 text-xs"><MathText>{'$\\vec{u} = (3 \\; ; \\; 4)$'}</MathText></div>
              <div className="text-indigo-700"><MathText>{'$\\|\\vec{u}\\| = \\sqrt{9+16} = 5$'}</MathText></div>
            </div>
          </div>
        ),
      },
      {
        id: 'formule-milieu',
        type: 'formules',
        title: "Milieu d'un segment",
        summary: 'I = ((xA+xB)/2 ; (yA+yB)/2)',
        body: (
          <div className="space-y-3">
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 text-center">
              <MathText>{'$$I = \\left(\\frac{x_A + x_B}{2} \\; ; \\; \\frac{y_A + y_B}{2}\\right)$$'}</MathText>
            </div>
            <div className="bg-white rounded-lg border p-3 space-y-1">
              <div className="text-xs"><MathText>{'$A(-2\\,;\\,4),\\; B(6\\,;\\,-2)$'}</MathText></div>
              <div className="text-indigo-700"><MathText>{'$I = \\left(\\frac{-2+6}{2} \\; ; \\; \\frac{4+(-2)}{2}\\right) = (2 \\; ; \\; 1)$'}</MathText></div>
            </div>
          </div>
        ),
      },
    ],

    /* M7 — Problèmes de géométrie : les vecteurs comme outil. Les exemples
       sont ceux de la manipulation (SCENES.problemes, vecteurUtils.js). */
    7: [
      {
        id: 'methode-parallelogramme',
        type: 'methodes',
        title: "Quatrième sommet d'un parallélogramme",
        summary: "ABCD parallélogramme ⟺ AB = DC ⟺ D = A + C − B",
        body: (
          <div className="space-y-3">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <MathText>{'$$ABCD \\text{ parallélogramme} \\Longleftrightarrow \\overrightarrow{AB} = \\overrightarrow{DC}$$'}</MathText>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-xs"><MathText>{'$A(-2\\,;\\,0),\\; B(1\\,;\\,2),\\; C(3\\,;\\,-1) \\Rightarrow D = ?$'}</MathText></div>
              <div className="text-emerald-700 text-xs"><MathText>{'$D = A + C - B$'}</MathText></div>
              <div className="text-emerald-700 text-xs"><MathText>{'$x : -2 + 3 - 1 = \\mathbf{0}$'}</MathText></div>
              <div className="text-emerald-700 text-xs"><MathText>{'$y : 0 + (-1) - 2 = \\mathbf{-3}$'}</MathText></div>
              <div className="font-bold text-emerald-800"><MathText>{'$D(0 \\; ; \\; -3)$'}</MathText></div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700">
              ⚠️ L'ordre des sommets compte : ABCD ⟺ <MathText>{'$\\overrightarrow{AB} = \\overrightarrow{DC}$'}</MathText>, pas <MathText>{'$\\overrightarrow{AB} = \\overrightarrow{CD}$'}</MathText>.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-deplacement-manquant',
        type: 'methodes',
        title: 'Retrouver un déplacement manquant',
        summary: 'u puis v mène du départ à l’arrivée : v = total − u.',
        body: (
          <div className="space-y-3">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <MathText>{'$$\\vec{u} + \\vec{v} = \\overrightarrow{\\text{total}} \\Longrightarrow \\vec{v} = \\overrightarrow{\\text{total}} - \\vec{u}$$'}</MathText>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-xs">Départ <MathText>{'$(-3\\,;\\,1)$'}</MathText>, ordre <MathText>{'$\\vec{u} = (4\\,;\\,3)$'}</MathText>, arrivée <MathText>{'$(3\\,;\\,1)$'}</MathText>.</div>
              <div className="text-amber-700 text-xs">Total (arrivée − départ) : <MathText>{'$(3-(-3)\\,;\\,1-1) = (6\\,;\\,0)$'}</MathText></div>
              <div className="text-emerald-700 text-xs"><MathText>{'$x : 6 - 4 = \\mathbf{2}$'}</MathText></div>
              <div className="text-emerald-700 text-xs"><MathText>{'$y : 0 - 3 = \\mathbf{-3}$'}</MathText></div>
              <div className="font-bold text-emerald-800"><MathText>{'$\\vec{v} = (2 \\; ; \\; -3)$'}</MathText></div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700">
              ⚠️ Arrivée − départ donne le trajet <strong>total</strong>, pas <MathText>{'$\\vec{v}$'}</MathText> : il faut encore retirer <MathText>{'$\\vec{u}$'}</MathText>.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-alignement',
        type: 'methodes',
        title: 'Prouver un alignement',
        summary: 'A, B, C alignés ⟺ AB et AC colinéaires.',
        body: (
          <div className="space-y-3">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <MathText>{'$$A, B, C \\text{ alignés} \\Longleftrightarrow \\overrightarrow{AC} = k \\cdot \\overrightarrow{AB}$$'}</MathText>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-xs"><MathText>{'$A(-4\\,;\\,-3),\\; B(-1\\,;\\,-1),\\; C(5\\,;\\,3)$'}</MathText></div>
              <div className="text-blue-700 text-xs"><MathText>{'$\\overrightarrow{AB} = (3\\,;\\,2)$'}</MathText></div>
              <div className="text-violet-700 text-xs"><MathText>{'$\\overrightarrow{AC} = (9\\,;\\,6) = 3 \\cdot \\overrightarrow{AB}$'}</MathText></div>
              <div className="font-bold text-emerald-800">Colinéaires <MathText>{'$(k = 3)$'}</MathText> ⟹ A, B, C alignés.</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600">Une figure suggère, un calcul prouve.</div>
          </div>
        ),
      },
    ],
  },
};
