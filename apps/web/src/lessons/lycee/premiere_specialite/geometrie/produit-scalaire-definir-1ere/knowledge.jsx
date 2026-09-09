import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniPlane } from '../../../../common/knowledge';

/**
 * Connaissances de « Produit scalaire : définir et détecter l'orthogonalité »
 * — SOURCE UNIQUE (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique
 * vit ICI et nulle part ailleurs ; les modules la posent par son id, au moment
 * où le geste vient de lui donner du sens.
 *
 * L'ORDRE DES MODULES EST LA LIGNE DU TEMPS. Le module 1 ne pose AUCUNE brique
 * portant le mot « produit scalaire » : il pose ce qu'il a fait CONSTATER —
 * l'ombre signée, et la coïncidence des deux calculs. Le nom vient au module 2.
 */
const U = '#7c3aed';   // le vecteur u, fixe
const V = '#0284c7';   // le vecteur v, mobile
const OMBRE = '#0f766e';
const N = '#e11d48';   // le vecteur normal

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'ombre-signee',
        type: 'concepts',
        title: 'L’ombre d’une flèche sur une autre',
        summary:
          'Le pied de la perpendiculaire abaissée du bout de v sur la droite portée par u découpe une ombre. Cette ombre porte un SIGNE : positive quand elle part dans le sens de u, négative quand elle part à l’opposé.',
        visual: (
          <MiniPlane
            width={220} height={155} xMin={-4} xMax={5} yMin={-2} yMax={5}
            points={[{ x: 0, y: 0, label: 'O', color: '#0f172a', labelPos: 'bl' }]}
            arrows={[
              { from: { x: 0, y: 0 }, to: { x: 4, y: 3 }, color: U },
              { from: { x: 0, y: 0 }, to: { x: -3, y: 4 }, color: V },
            ]}
            segments={[{ from: { x: 0, y: 0 }, to: { x: -3, y: 4 }, color: OMBRE, dashed: true }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              On abaisse une perpendiculaire du bout de la seconde flèche sur la droite qui porte
              la première. Le morceau découpé entre l’origine et ce pied, c’est l’
              <strong>ombre</strong>.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Ombre positive</strong> — elle part dans le même sens que la première flèche
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                <strong>Ombre négative</strong> — elle part à l’opposé
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                <strong>Ombre nulle</strong> — le pied tombe sur l’origine : les deux flèches font
                un angle droit
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Une longueur est toujours positive ; l’ombre, non. C’est ce signe qui rend le nombre
              utilisable — sans lui, on ne saurait pas distinguer un angle aigu d’un angle obtus.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le segment épais qui bascule de l’autre côté de l’origine quand la flèche dépasse l’angle droit.</div>
          </div>
        ),
      },
      {
        id: 'deux-recettes-un-nombre',
        type: 'concepts',
        title: 'Deux recettes, un seul nombre',
        summary:
          'Mesurer une ombre sur la figure et calculer x·x′ + y·y′ sur les coordonnées n’ont rien à voir — et pourtant les deux donnent toujours le même nombre, à n’importe quel angle.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
                <div className="text-xs font-semibold text-teal-800 mb-1">Recette géométrique</div>
                <div className="font-mono text-[15px] text-teal-900">‖u‖ × (ombre signée)</div>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                <div className="text-xs font-semibold text-indigo-800 mb-1">Recette par les coordonnées</div>
                <div className="font-mono text-[15px] text-indigo-900">x · x′ + y · y′</div>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
              <table className="w-full font-mono text-center text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-2 py-1 text-left font-sans text-xs">angle</th><td>0°</td><td>60°</td><td>90°</td><td>120°</td><td>180°</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left font-sans text-xs">les deux</th><td>25</td><td>12,5</td><td><strong>0</strong></td><td>−12,5</td><td>−25</td></tr>
              </tbody></table>
            </div>
            <p>
              Une seule et même quantité, atteinte par deux chemins. Et elle vaut{' '}
              <strong>exactement 0</strong> quand les deux flèches font un angle droit — jamais
              « presque 0 ».
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux afficheurs côte à côte qui bougent ensemble, cran après cran.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'vocab-produit-scalaire',
        type: 'vocabulaire',
        title: 'Le produit scalaire',
        summary:
          'Le nombre obtenu à partir de deux vecteurs s’appelle leur produit scalaire, et se note u·v. C’est un NOMBRE, pas un vecteur.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$\\vec{u} \\cdot \\vec{v} \\quad \\text{se lit « } \\vec{u} \\text{ scalaire } \\vec{v} \\text{ »}$$'}</MathText>
            </div>
            <p>
              « Scalaire » veut dire <strong>nombre</strong> : le résultat n’a ni direction, ni sens,
              ni longueur. Deux flèches entrent, un nombre sort.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le point de u·v n’est pas la multiplication de deux nombres : on ne peut pas écrire
              u·v·w, ni « diviser par v ». C’est une opération à part, qui prend deux vecteurs et
              rend un nombre.
            </div>
          </div>
        ),
      },
      {
        id: 'formule-coordonnees-scalaire',
        type: 'formules',
        title: 'Produit scalaire par les coordonnées',
        summary: 'Dans une base orthonormée, u(x ; y) et v(x′ ; y′) donnent u·v = x·x′ + y·y′.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-center">
              <MathText>{'$$\\vec{u} \\cdot \\vec{v} = x x^{\\prime} + y y^{\\prime}$$'}</MathText>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-white p-3 space-y-1">
              <div className="text-xs text-slate-500">u(3 ; 1) et v(2 ; 4)</div>
              <div className="font-mono text-indigo-800">3 × 2 + 1 × 4 = 6 + 4 = <strong>10</strong></div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              On multiplie les abscisses ENTRE ELLES et les ordonnées ENTRE ELLES, puis on
              ADDITIONNE. Le piège est de croiser : 3 × 4 + 1 × 2 ne veut rien dire ici.
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Cette formule n’est vraie que dans une <strong>base orthonormée</strong> — celle où
              les deux flèches unitaires font un angle droit et mesurent 1.
            </div>
          </div>
        ),
      },
      {
        id: 'formule-normes-angle',
        type: 'formules',
        title: 'Produit scalaire par les normes et l’angle',
        summary: 'u·v = ‖u‖ × ‖v‖ × cos(angle entre les deux) — la formule à employer quand l’énoncé donne des longueurs et un angle.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-center">
              <MathText>{'$$\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\cos(\\widehat{\\vec{u}, \\vec{v}})$$'}</MathText>
            </div>
            <div className="rounded-xl border border-violet-100 bg-white p-3 space-y-1">
              <div className="text-xs text-slate-500">‖u‖ = 4, ‖v‖ = 3, angle de 60°</div>
              <div className="font-mono text-violet-800">4 × 3 × cos(60°) = 12 × 0,5 = <strong>6</strong></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-800">angle aigu<br /><strong>cos &gt; 0</strong></div>
              <div className="rounded-lg bg-slate-50 p-2 text-slate-800">angle droit<br /><strong>cos = 0</strong></div>
              <div className="rounded-lg bg-rose-50 p-2 text-rose-800">angle obtus<br /><strong>cos &lt; 0</strong></div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Oublier le cosinus est l’erreur la plus fréquente : 4 × 3 = 12 n’est le produit
              scalaire que si les deux flèches pointent exactement dans le même sens.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-choisir-la-formule',
        type: 'methodes',
        title: 'Choisir sa formule',
        summary: 'Des coordonnées dans l’énoncé → x·x′ + y·y′. Des longueurs et un angle → ‖u‖‖v‖cos. Jamais les deux en même temps.',
        body: (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
            <li>Lire ce que l’énoncé donne réellement.</li>
            <li>Quatre nombres entre parenthèses ? C’est x·x′ + y·y′.</li>
            <li>Deux longueurs et un angle ? C’est ‖u‖ × ‖v‖ × cos.</li>
            <li>Une figure sans nombres ? Poser un repère, lire les coordonnées, revenir au cas 2.</li>
          </ol>
        ),
      },
    ],
    3: [
      {
        id: 'regle-symetrie-scalaire',
        type: 'regles',
        title: 'Symétrie : u·v = v·u',
        summary: 'L’ordre des deux vecteurs ne change rien au résultat.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-200 bg-white p-4 text-center">
              <MathText>{'$$\\vec{u} \\cdot \\vec{v} = \\vec{v} \\cdot \\vec{u}$$'}</MathText>
            </div>
            <p>
              Cela se lit sur la formule des coordonnées : x·x′ + y·y′ et x′·x + y′·y sont la même
              somme. On peut donc toujours prendre les deux flèches dans l’ordre le plus commode.
            </p>
          </div>
        ),
      },
      {
        id: 'regle-bilinearite',
        type: 'regles',
        title: 'Bilinéarité : le facteur sort, la somme se coupe',
        summary: '(k·u)·v = k·(u·v) et u·(v + w) = u·v + u·w. Le produit scalaire se distribue comme une multiplication.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-center space-y-2">
              <MathText>{'$$(k\\vec{u}) \\cdot \\vec{v} = k(\\vec{u} \\cdot \\vec{v})$$'}</MathText>
              <MathText>{'$$\\vec{u} \\cdot (\\vec{v} + \\vec{w}) = \\vec{u} \\cdot \\vec{v} + \\vec{u} \\cdot \\vec{w}$$'}</MathText>
            </div>
            <div className="rounded-xl border border-sky-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">u(3 ; 2), v(1 ; 4), w(2 ; −1)</div>
              <div className="font-mono">u·v = 11 · u·w = 4 · u·(v + w) = u·(3 ; 3) = <strong>15</strong> = 11 + 4 ✔</div>
              <div className="font-mono">(2u)·v = (6 ; 4)·(1 ; 4) = <strong>22</strong> = 2 × 11 ✔</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le facteur sort UNE fois, pas deux : (2u)·v vaut 2(u·v), pas 4(u·v). C’est (2u)·(2v)
              qui vaudrait 4(u·v).
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la flèche étirée dont le nombre a exactement doublé.</div>
          </div>
        ),
      },
      {
        id: 'regle-carre-scalaire',
        type: 'regles',
        title: 'u·u = ‖u‖²',
        summary: 'Une flèche multipliée par elle-même donne le carré de sa longueur.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-200 bg-white p-4 text-center">
              <MathText>{'$$\\vec{u} \\cdot \\vec{u} = \\|\\vec{u}\\|^2$$'}</MathText>
            </div>
            <p>
              L’angle entre u et lui-même vaut 0°, donc cos vaut 1 : il reste ‖u‖ × ‖u‖. Sur
              u(4 ; 3) : 4 × 4 + 3 × 3 = 25, et ‖u‖ = 5 avec 5² = 25.
            </p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'regle-orthogonalite',
        type: 'regles',
        title: 'Orthogonaux ⟺ produit scalaire nul',
        summary: 'Deux vecteurs non nuls sont orthogonaux exactement quand leur produit scalaire vaut 0. C’est une équivalence, dans les deux sens.',
        visual: (
          <MiniPlane
            width={220} height={150} xMin={-4} xMax={5} yMin={-1} yMax={5}
            points={[{ x: 0, y: 0, label: 'O', color: '#0f172a', labelPos: 'bl' }]}
            arrows={[
              { from: { x: 0, y: 0 }, to: { x: 4, y: 3 }, color: U },
              { from: { x: 0, y: 0 }, to: { x: -3, y: 4 }, color: V },
            ]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <MathText>{'$$\\vec{u} \\perp \\vec{v} \\iff \\vec{u} \\cdot \\vec{v} = 0$$'}</MathText>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">u(4 ; 3) et v(−3 ; 4)</div>
              <div className="font-mono">4 × (−3) + 3 × 4 = −12 + 12 = <strong>0</strong> → orthogonaux</div>
            </div>
            <p>
              C’est ce qui transforme une impression en <strong>démonstration</strong> : un dessin
              où deux traits ont l’air perpendiculaires ne prouve rien, un calcul qui rend 0, si.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le critère exige les deux vecteurs NON NULS : le vecteur nul a un produit scalaire nul
              avec tout le monde, sans faire d’angle avec quoi que ce soit.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux afficheurs qui tombent à 0 pile au sixième cran.</div>
          </div>
        ),
      },
      {
        id: 'mem-nul-donc-droit',
        type: 'memoriser',
        title: '⭐ Produit nul = angle droit',
        summary: 'u·v = 0 ⟺ les deux flèches sont orthogonales (aucune n’étant nulle).',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">u · v = 0 ⟺ u ⊥ v</div>
            <p className="text-xs text-rose-700">le calcul démontre ce que le dessin ne fait que suggérer</p>
          </div>
        ),
      },
      {
        id: 'methode-demontrer-orthogonal',
        type: 'methodes',
        title: 'Démontrer que deux vecteurs sont orthogonaux',
        summary: 'Calculer leurs coordonnées, faire x·x′ + y·y′, conclure sur le résultat — 0 ou non.',
        body: (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
            <li>Écrire les coordonnées des deux vecteurs (arrivée − départ si ce sont des points).</li>
            <li>Calculer x·x′ + y·y′, sans arrondir.</li>
            <li>Si le résultat vaut 0 : conclure qu’ils sont orthogonaux. Sinon : conclure qu’ils ne le sont pas.</li>
            <li>Vérifier au passage qu’aucun des deux n’est le vecteur nul.</li>
          </ol>
        ),
      },
    ],
    5: [
      {
        id: 'vocab-vecteur-normal',
        type: 'vocabulaire',
        title: 'Vecteur normal à une droite',
        summary: 'Un vecteur non nul orthogonal à tout vecteur directeur de la droite. Il n’est pas unique : tous ses multiples conviennent.',
        visual: (
          <MiniPlane
            width={220} height={150} xMin={-2} xMax={6} yMin={-1} yMax={5}
            points={[{ x: 1, y: 2, label: 'A', color: '#0f172a', labelPos: 'bl' }]}
            arrows={[
              { from: { x: 1, y: 2 }, to: { x: 4, y: 1 }, color: V },
              { from: { x: 1, y: 2 }, to: { x: 2, y: 5 }, color: N },
            ]}
            segments={[{ from: { x: -2, y: 3 }, to: { x: 6, y: 1 }, color: '#94a3b8', dashed: true }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Une droite a une infinité de vecteurs directeurs (tous colinéaires entre eux). Elle a
              de même une infinité de vecteurs <strong>normaux</strong> : ceux qui lui sont
              orthogonaux.
            </p>
            <div className="rounded-xl border border-rose-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">directeur w(3 ; −1)</div>
              <div className="font-mono">normal n(1 ; 3) : 1 × 3 + 3 × (−1) = 3 − 3 = <strong>0</strong> ✔</div>
              <div className="text-slate-500">(2 ; 6) et (−1 ; −3) conviennent tout autant</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Le passage du directeur au normal : on échange les deux coordonnées et on change UN
              signe. (x ; y) devient (−y ; x).
            </div>
          </div>
        ),
      },
      {
        id: 'regle-equation-cartesienne',
        type: 'regles',
        title: 'Un normal donne l’équation de la droite',
        summary: 'Si n(a ; b) est normal à la droite, celle-ci a une équation de la forme ax + by + c = 0 — et réciproquement, dans ax + by + c = 0, le couple (a ; b) est un vecteur normal.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
              <MathText>{'$$\\vec{n}(a \\; ; \\; b) \\text{ normal} \\iff ax + by + c = 0$$'}</MathText>
            </div>
            <p>
              La raison : M appartient à la droite exactement quand <strong>AM est orthogonal
              à n</strong>, c’est-à-dire quand n·AM = 0. En développant :
              a(x − x_A) + b(y − y_A) = 0, ce qui est bien de la forme annoncée.
            </p>
            <div className="rounded-xl border border-rose-100 bg-white p-3 space-y-1 text-xs">
              <div className="text-slate-500">A(1 ; 2), normal n(1 ; 3)</div>
              <div className="font-mono">1(x − 1) + 3(y − 2) = 0 → x + 3y − 7 = 0</div>
              <div className="font-mono text-slate-500">vérification en A : 1 + 6 − 7 = 0 ✔</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Dans 2x + 5y − 10 = 0, le vecteur normal est (2 ; 5) et le directeur (−5 ; 2). Les
              confondre est l’erreur classique : ce sont les DEUX premiers coefficients qui donnent
              le normal, dans l’ordre.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la flèche rouge plantée en travers de la droite, qui suffisait à l’écrire.</div>
          </div>
        ),
      },
      {
        id: 'methode-equation-par-le-normal',
        type: 'methodes',
        title: 'Écrire une droite à partir d’un point et d’un normal',
        summary: 'Poser a et b avec les coordonnées du normal, puis calculer c en écrivant que le point appartient à la droite.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Le normal n(a ; b) donne directement les deux premiers coefficients.</li>
              <li>Écrire ax + by + c = 0 avec c encore inconnu.</li>
              <li>Remplacer x et y par les coordonnées du point : on obtient c.</li>
              <li>Vérifier en remettant le point dans l’équation complète : on doit trouver 0.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-xs">
              A(3 ; −1), n(4 ; −1) : 4x − y + c = 0, donc 12 + 1 + c = 0 et c = −13. Réponse :
              <strong className="font-mono"> 4x − y − 13 = 0</strong>. Vérification : 12 + 1 − 13 = 0 ✔
            </div>
          </div>
        ),
      },
      {
        id: 'mem-abc-normal',
        type: 'memoriser',
        title: '⭐ Dans ax + by + c = 0, le normal est (a ; b)',
        summary: 'Les deux premiers coefficients de l’équation SONT les coordonnées d’un vecteur normal.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">ax + by + c = 0 → n(a ; b)</div>
            <p className="text-xs text-rose-700">et le directeur est (−b ; a) — on échange, on change un signe</p>
          </div>
        ),
      },
    ],
  },
};
