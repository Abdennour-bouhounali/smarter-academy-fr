import React from 'react';
import MathText from '../../../../common/components/MathText';
import { RightTriangle } from '../../../../common/knowledge';

/**
 * Connaissances de « L'espace : vecteurs et coordonnées » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le
 * geste vient de lui donner du sens.
 *
 * L'ORDRE DES MODULES EST LA LIGNE DU TEMPS. Le module 1 ne pose AUCUNE brique
 * qui nomme « coordonnées d'un vecteur de l'espace » ni la formule de la
 * norme : il pose ce qu'il a fait CONSTATER — le trajet en trois étapes, et
 * les deux triangles rectangles. Les noms et les formules viennent aux modules
 * 2 et 3, une fois le geste fait.
 *
 * POURQUOI SI PEU DE VISUELS SVG ICI. La leçon vit dans un cube en
 * perspective : un cube figé de 220 px de large, sans possibilité de le
 * tourner, MENTIRAIT exactement comme la figure que la leçon apprend à se
 * méfier — deux arêtes s'y croiseraient sans se rencontrer, et l'élève ne
 * pourrait rien y faire. Les briques portent donc des tableaux de nombres et
 * des triangles plans, où le dessin ne peut pas contredire le texte, et le
 * cube reste l'affaire du laboratoire, où il tourne.
 */
const P = '#7c3aed';   // le plancher
const H = '#0284c7';   // la hauteur
const D = '#e11d48';   // la diagonale de l'espace

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'trois-deplacements',
        type: 'concepts',
        title: 'Un trajet dans la boîte se compte en trois fois',
        summary:
          'Pour aller d’un coin de la boîte à un autre, on longe les arêtes : d’abord vers la droite, puis vers le haut, puis vers le fond. Trois nombres comptés — et le trajet est entièrement décrit.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Aucun de ces trois trajets ne peut remplacer les deux autres : ils vont dans des
              directions qui n’ont rien à voir. C’est pour cela qu’il en faut <strong>trois</strong>,
              et pas deux comme sur une feuille.
            </p>
            <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
              <table className="w-full text-center text-sm"><tbody>
                <tr className="bg-slate-50">
                  <th className="px-2 py-1 text-left font-semibold">direction</th>
                  <td className="px-2 py-1">vers la droite</td>
                  <td className="px-2 py-1">vers le haut</td>
                  <td className="px-2 py-1">vers le fond</td>
                </tr>
                <tr className="border-t">
                  <th className="px-2 py-1 text-left font-semibold">de A à G</th>
                  <td className="px-2 py-1 font-mono font-bold">1</td>
                  <td className="px-2 py-1 font-mono font-bold">1</td>
                  <td className="px-2 py-1 font-mono font-bold">1</td>
                </tr>
                <tr className="border-t">
                  <th className="px-2 py-1 text-left font-semibold">de A à C</th>
                  <td className="px-2 py-1 font-mono font-bold">1</td>
                  <td className="px-2 py-1 font-mono font-bold">1</td>
                  <td className="px-2 py-1 font-mono font-bold">0</td>
                </tr>
              </tbody></table>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un trajet peut compter <strong>0</strong> dans une direction : de A à C, on ne va pas
              vers le fond du tout. Zéro est un compte, pas une absence de coordonnée.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois segments de couleur qui s’allument l’un après l’autre le long des arêtes.</div>
          </div>
        ),
      },
      {
        id: 'deux-triangles-rectangles',
        type: 'concepts',
        title: 'Deux triangles rectangles, l’un posé sur l’autre',
        summary:
          'La longueur d’un trajet en diagonale ne se lit pas d’un coup : on mesure d’abord la diagonale du plancher, puis on s’en sert comme d’un côté pour le triangle qui monte.',
        visual: <RightTriangle a={1} b={1.41} hyp={1.73} color={D} width={190} height={130} />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border-2 px-3 py-2" style={{ borderColor: P, background: '#f5f3ff' }}>
                <strong>Le triangle du plancher</strong> — ses deux côtés de l’angle droit sont le
                trajet vers la droite et le trajet vers le haut. Son hypoténuse est la diagonale du
                plancher.
              </div>
              <div className="rounded-lg border-2 px-3 py-2" style={{ borderColor: H, background: '#f0f9ff' }}>
                <strong>Le triangle de l’espace</strong> — ses deux côtés de l’angle droit sont
                cette diagonale du plancher et le trajet vers le fond. Son hypoténuse est le trajet
                complet.
              </div>
            </div>
            <p>
              Les deux angles droits ne sont pas une coïncidence de dessin : ils viennent de ce que
              les trois directions de la boîte sont deux à deux en travers l’une de l’autre.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              On ne peut pas sauter le premier triangle. La diagonale du plancher est un
              <strong> côté</strong> du second : sans elle, il n’y a rien à mettre dans le calcul.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le triangle violet à plat, puis le triangle bleu dressé dessus.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'repere-espace',
        type: 'vocabulaire',
        title: 'Le repère de l’espace',
        summary:
          'Un repère de l’espace est fait d’une origine et de trois directions. Un point y est situé par trois nombres, et non plus deux : on ajoute une cote aux deux nombres du plan.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Sur la boîte, on prend le coin A comme <strong>origine</strong> et les trois arêtes
              qui en partent comme directions. Le repère s’écrit alors <MathText>{'$(A ; \\vec{AB}, \\vec{AD}, \\vec{AE})$'}</MathText>.
            </p>
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$M(x \\,;\\, y \\,;\\, z)$$'}</MathText>
            </div>
            <p>
              Les deux premiers nombres portent les noms qu’ils avaient déjà : l’abscisse et
              l’ordonnée. Le troisième s’appelle la <strong>cote</strong>.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le coin A de la boîte, et les trois arêtes qui en partent.</div>
          </div>
        ),
      },
      {
        id: 'coordonnees-vecteur-espace',
        type: 'regles',
        title: 'Les coordonnées d’un vecteur de l’espace',
        summary:
          'Rien de neuf : on soustrait les coordonnées du départ à celles de l’arrivée, sur chacun des trois nombres. La règle du plan s’applique une fois de plus.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$\\vec{AB}\\;(x_B - x_A \\,;\\, y_B - y_A \\,;\\, z_B - z_A)$$'}</MathText>
            </div>
            <p>
              La troisième ligne se calcule exactement comme les deux premières. C’est le même
              geste, appliqué une fois de plus — et c’est pour cela qu’il n’y a rien à réapprendre.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              A(0 ; 0 ; 0) et G(1 ; 1 ; 1) donnent <strong>AG (1 ; 1 ; 1)</strong>.<br />
              B(1 ; 0 ; 0) et H(0 ; 1 ; 1) donnent <strong>BH (−1 ; 1 ; 1)</strong> : le premier
              nombre est négatif, parce qu’on repart vers la gauche.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              L’ordre compte : BH et HB n’ont pas les mêmes coordonnées, elles sont opposées trois
              fois. « Arrivée moins départ », jamais l’inverse.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-arrivee-moins-depart-espace',
        type: 'memoriser',
        title: '⭐ Trois soustractions, pas deux',
        summary: 'Passer du plan à l’espace n’ajoute pas une règle : cela ajoute une ligne.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">arrivée − départ, trois fois</div>
            <p className="text-xs text-rose-700">et un zéro est un résultat, pas une case vide</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'formule-norme-espace',
        type: 'formules',
        title: 'La longueur d’un vecteur de l’espace',
        summary:
          'On additionne les trois carrés, puis on prend la racine. C’est la formule du plan avec un carré de plus — et c’est exactement ce que les deux triangles rectangles calculent.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$\\|\\vec{u}\\| = \\sqrt{x^2 + y^2 + z^2}$$'}</MathText>
            </div>
            <p>
              D’où vient le troisième carré : le premier triangle donne une diagonale de plancher
              dont le carré vaut <MathText>{'$x^2 + y^2$'}</MathText>. Le second triangle ajoute à ce
              carré celui du dernier trajet — d’où <MathText>{'$x^2 + y^2 + z^2$'}</MathText> sous
              la racine.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              Sur la boîte de côté 1 : <strong>AG (1 ; 1 ; 1)</strong> a pour longueur
              √(1 + 1 + 1) = <strong>√3</strong>, et <strong>AC (1 ; 1 ; 0)</strong> a pour longueur
              √(1 + 1 + 0) = <strong>√2</strong>. La diagonale de la boîte est bien plus longue que
              celle d’une de ses faces.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              La racine se prend <strong>à la fin</strong>, sur la somme entière. Écrire
              √(x² + y²) + z revient à mesurer le plancher puis à lui ajouter la hauteur bout à
              bout : cela donne un chemin en équerre, pas une diagonale.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le carré du plancher affiché avant que la racine ne soit prise.</div>
          </div>
        ),
      },
      {
        id: 'methode-calculer-norme-espace',
        type: 'methodes',
        title: 'Calculer une longueur dans l’espace',
        summary:
          'Écrire les trois coordonnées, élever chacune au carré, additionner les trois, prendre la racine — et simplifier quand c’est un carré parfait qui sort.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire le vecteur : arrivée moins départ, sur les trois lignes.</li>
              <li>Élever chacun des trois nombres au carré — un nombre négatif donne un carré positif.</li>
              <li>Additionner les trois carrés : ce total est le carré de la longueur.</li>
              <li>Prendre la racine du total, et la simplifier si l’on peut.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              <strong>BH (−1 ; 1 ; 1)</strong> : les carrés valent 1, 1 et 1 — le signe moins a
              disparu. Leur somme vaut 3, donc ‖BH‖ = <strong>√3</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le total affiché sous la racine avant qu’on ne la prenne.</div>
          </div>
        ),
      },
      {
        id: 'mem-trois-carres',
        type: 'memoriser',
        title: '⭐ Trois carrés sous une seule racine',
        summary: 'La racine ferme la somme entière ; elle ne se prend jamais deux fois.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">√(x² + y² + z²)</div>
            <p className="text-xs text-rose-700">Pythagore appliqué deux fois, écrit une seule fois</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'formule-scalaire-espace',
        type: 'formules',
        title: 'Le produit scalaire dans l’espace',
        summary:
          'Abscisse fois abscisse, ordonnée fois ordonnée, cote fois cote, et l’on additionne les trois. La formule du plan reçoit un terme de plus, rien d’autre.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$\\vec{u} \\cdot \\vec{v} = xx\' + yy\' + zz\'$$'}</MathText>
            </div>
            <p>
              Ce que cela change pour toi : <strong>rien</strong>, sauf un produit à écrire de plus.
              Le résultat reste un nombre unique, positif, négatif ou nul, et il garde toutes les
              propriétés qu’il avait au plan.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              AG (1 ; 1 ; 1) et AB (1 ; 0 ; 0) : 1×1 + 1×0 + 1×0 = <strong>1</strong>.<br />
              AC (1 ; 1 ; 0) et DF (1 ; −1 ; 1) : 1×1 + 1×(−1) + 0×1 = <strong>0</strong>.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              On multiplie les coordonnées <strong>de même rang</strong> : x avec x′, jamais x avec
              y′. Et le troisième produit ne s’oublie pas, même quand il vaut 0.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la troisième colonne du tableau, ajoutée à côté des deux autres.</div>
          </div>
        ),
      },
      {
        id: 'mem-un-terme-de-plus',
        type: 'memoriser',
        title: '⭐ xx′ + yy′ + zz′',
        summary: 'La même somme de produits, avec un troisième terme.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">u · v = xx′ + yy′ + zz′</div>
            <p className="text-xs text-rose-700">même rang avec même rang, et l’on additionne</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'droites-espace-trois-cas',
        type: 'concepts',
        title: 'Deux droites de l’espace : trois cas, et non deux',
        summary:
          'Dans le plan, deux droites sont sécantes ou parallèles. Dans l’espace, un troisième cas apparaît : elles peuvent n’être ni l’un ni l’autre — elles ne se coupent pas et ne sont pas parallèles.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Parallèles</strong> — même direction ; elles ne se rencontrent jamais (ou
                sont confondues).
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>Sécantes</strong> — elles se rencontrent en un point.
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                <strong>Le troisième cas</strong> — directions différentes, et pourtant aucun point
                commun : sur la boîte, une arête du plancher et une arête verticale du fond.
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le dessin ne tranche pas. Deux traits peuvent se croiser sur la feuille alors que les
              droites passent l’une devant l’autre à distance : c’est le prix de la représentation
              plate. Il faut tourner la boîte, ou calculer.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux traits qui se croisent au repos et se séparent dès qu’on tourne.</div>
          </div>
        ),
      },
      {
        id: 'regle-parallelisme-espace',
        type: 'regles',
        title: 'Deux droites sont parallèles quand leurs directions le sont',
        summary:
          'On prend un vecteur directeur de chacune, et l’on regarde si l’un est un multiple de l’autre. Le critère du plan se transporte sans changement à trois coordonnées.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center text-[15px]">
              <MathText>{'$\\vec{u} = k\\,\\vec{v}$'}</MathText> pour un même nombre <MathText>{'$k$'}</MathText>, sur les <strong>trois</strong> coordonnées
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              (AB) a pour directeur AB (1 ; 0 ; 0), et (HG) a pour directeur HG (1 ; 0 ; 0) : les
              deux sont identiques, donc <strong>(AB) et (HG) sont parallèles</strong>.<br />
              (AC) a pour directeur AC (1 ; 1 ; 0), et (DF) a pour directeur DF (1 ; −1 ; 1) : la
              troisième coordonnée passe de 0 à 1, ce qu’aucun multiple ne peut faire — elles ne
              sont <strong>pas</strong> parallèles.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le même nombre k doit convenir aux trois coordonnées à la fois. Deux qui s’accordent
              et une qui refuse suffisent à conclure que non.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-trancher-parallelisme',
        type: 'methodes',
        title: 'Trancher le parallélisme de deux droites',
        summary:
          'Écrire un vecteur directeur de chaque droite, puis chercher le nombre qui transformerait le premier en le second — et vérifier qu’il convient aux trois coordonnées.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Nommer deux points sur chaque droite, et calculer les deux vecteurs.</li>
              <li>Repérer une coordonnée non nulle du premier, et en déduire le k candidat.</li>
              <li>Vérifier ce même k sur les deux autres coordonnées.</li>
              <li>S’il convient partout : parallèles. Sinon : non — et le dessin n’y change rien.</li>
            </ol>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la coordonnée qui refuse le k des deux autres.</div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'regle-orthogonalite-espace',
        type: 'regles',
        title: 'Deux droites orthogonales — même sans se couper',
        summary:
          'Deux droites de l’espace sont orthogonales quand le produit scalaire de leurs vecteurs directeurs est nul. Elles n’ont pas besoin de se rencontrer pour cela.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-amber-200 bg-white p-3 text-center">
              <MathText>{'$$\\vec{u} \\cdot \\vec{v} = 0 \\iff \\text{les deux droites sont orthogonales}$$'}</MathText>
            </div>
            <p>
              C’est <strong>le</strong> fait nouveau de l’espace. Dans le plan, deux droites qui font
              un angle droit se coupent forcément — le mot employé était d’ailleurs
              « perpendiculaires ». Ici, elles peuvent faire un angle droit et rester à distance
              l’une de l’autre pour toujours.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              (AB) de directeur (1 ; 0 ; 0) et (CG) de directeur (0 ; 0 ; 1) : le produit vaut
              1×0 + 0×0 + 0×1 = <strong>0</strong>. Elles sont orthogonales — et pourtant aucun
              point de la boîte ne leur est commun.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un produit nul ne dit <strong>rien</strong> sur le fait qu’elles se coupent. Ce sont
              deux questions séparées, et il faut y répondre séparément.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux arêtes en angle droit qu’aucune rotation ne fait se toucher.</div>
          </div>
        ),
      },
      {
        id: 'mem-nul-ne-veut-pas-dire-secantes',
        type: 'memoriser',
        title: '⭐ Orthogonales n’oblige pas à se couper',
        summary: 'Le produit nul décide de l’angle, jamais de la rencontre.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">produit nul ⇒ angle droit</div>
            <div className="text-base font-bold text-rose-600">mais pas ⇒ point commun</div>
            <p className="text-xs text-rose-700">deux questions, deux réponses</p>
          </div>
        ),
      },
    ],
  },
};
