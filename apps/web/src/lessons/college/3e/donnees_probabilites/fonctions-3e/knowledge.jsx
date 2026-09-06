import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Fonctions » (3e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * où l'élève vient de le rencontrer par le geste, puis il reste disponible
 * dans la carte. Rien n'est réécrit dans les modules : la brique et la carte
 * montrent le même texte.
 *
 * ORDRE. Un item n'utilise que ce qui est déjà établi au module qui le
 * déclare : le mot « image » avant la notation f(x), la notation avant le
 * tableau, le tableau avant le repère, le repère avant « affine ». Un exemple
 * qui anticiperait le module suivant serait un spoiler, pas une aide.
 */

const affineGraph = (a, b, extra = {}) => (
  <MiniGraph
    width={210} height={150} xMin={-3} xMax={5} yMin={-3} yMax={8}
    functions={[{ fn: (x) => a * x + b, color: '#4f46e5' }]}
    {...extra}
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — La machine : un procédé stable, une règle valable pour tout nombre. */
    1: [
      {
        id: 'fonction-machine',
        type: 'concepts',
        title: 'Fonction',
        summary: 'Une fonction est une machine à nombres : une entrée, une règle, une sortie — et toujours la même sortie pour la même entrée.',
        body: (
          <div className="space-y-3">
            <p>Une <strong>fonction</strong> transforme un nombre en un autre en appliquant
            toujours la <strong>même règle</strong>.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono">
              4 &nbsp;→&nbsp; [ × 3 − 1 ] &nbsp;→&nbsp; 11
            </div>
            <p className="text-xs text-slate-500">La règle vaut pour <strong>tous</strong> les
            nombres, même ceux qu'on n'a jamais essayés : c'est ce qui distingue une fonction
            d'une simple liste de résultats.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la boîte noire — tu as
            deviné sa règle en la nourrissant.</div>
          </div>
        ),
      },
      {
        id: 'entree-sortie',
        type: 'vocabulaire',
        title: 'Entrée et sortie',
        summary: 'Le nombre qu’on donne est l’entrée ; celui qui ressort est la sortie.',
        body: (
          <div className="space-y-2">
            <p>On <strong>entre</strong> un nombre, la machine le transforme, et un nombre
            <strong> sort</strong>.</p>
            <p className="text-xs text-slate-500">Ces deux mots suffisent pour l'instant. Les
            mathématiciens leur donneront bientôt leurs noms savants.</p>
          </div>
        ),
      },
      {
        id: 'mem-une-entree-une-sortie',
        type: 'memoriser',
        title: '⭐ Une entrée, une seule sortie',
        summary: 'La même entrée redonne toujours la même sortie.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1">
            <div className="text-lg font-black text-rose-700">Une entrée → une seule sortie</div>
            <p className="text-xs text-rose-700">Relance la machine autant de fois que tu veux
            avec le même nombre : le résultat ne bougera pas.</p>
          </div>
        ),
      },
    ],

    /* M2 — Les trois mots : image, notation f(x), antécédent. */
    2: [
      {
        id: 'image',
        type: 'vocabulaire',
        title: 'Image',
        summary: 'L’image d’un nombre est ce que la machine renvoie pour ce nombre.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono">
              <span className="text-indigo-800 font-bold">4</span>
              <span className="text-slate-400 mx-2">→ [ × 2 + 1 ] →</span>
              <span className="text-emerald-700 font-bold">9</span>
            </div>
            <p>La machine reçoit 4 et renvoie 9 : on dit que <strong>9 est l’image de 4</strong>.</p>
            <p className="text-xs text-slate-500">Un nombre n’a qu’<strong>une seule</strong> image :
            la machine ne peut pas hésiter.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le sens direct de la
            machine — tu choisis l'entrée, tu lis la sortie.</div>
          </div>
        ),
      },
      {
        id: 'notation-fx',
        type: 'concepts',
        title: 'La notation f(x)',
        summary: 'On appelle f la machine, et f(4) le nombre qu’elle renvoie pour 4.',
        body: (
          <div className="space-y-3">
            <p>Pour ne pas redessiner la machine à chaque fois, on lui donne un nom —
            souvent <strong>f</strong> — et on écrit :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$f(4) = 9$'}</MathText>
            </div>
            <p>Cela se lit : « <strong>l’image de 4 par f est 9</strong> ».</p>
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-900">
              Le nombre <strong>entre parenthèses</strong> est celui qu’on ENTRE. Le nombre
              <strong> après le signe =</strong> est celui qui SORT.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : 4 → f → 9, la même chose
            en une ligne.</div>
          </div>
        ),
      },
      {
        id: 'antecedent',
        type: 'vocabulaire',
        title: 'Antécédent',
        summary: 'Un antécédent d’un nombre est une entrée qui donne ce nombre en sortie.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono">
              <span className="text-indigo-800 font-bold">?</span>
              <span className="text-slate-400 mx-2">→ [ × 2 + 1 ] →</span>
              <span className="text-emerald-700 font-bold">9</span>
            </div>
            <p>On connaît la sortie et on cherche l’entrée : puisque
            <MathText>{' $f(4) = 9$'}</MathText>, <strong>4 est un antécédent de 9</strong>.</p>
            <p className="text-xs text-slate-500">« Un » et non « l’ » : remonter la machine peut
            offrir plusieurs chemins.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le sens inverse — tu visais
            une sortie et tu as cherché l'entrée.</div>
          </div>
        ),
      },
      {
        id: 'mem-image-antecedent',
        type: 'memoriser',
        title: '⭐ Image à droite, antécédent à gauche',
        summary: 'Dans f(4) = 9 : 4 est un antécédent de 9, et 9 est l’image de 4.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="font-mono text-rose-900 text-lg">
              <span className="font-black">4</span>
              <span className="mx-2">→ f →</span>
              <span className="font-black">9</span>
            </div>
            <div className="flex justify-center gap-8 text-xs font-bold text-rose-700">
              <span>antécédent</span><span>image</span>
            </div>
            <p className="text-xs text-rose-700">Un nombre a <strong>une</strong> image ; une image
            peut avoir <strong>plusieurs</strong> antécédents.</p>
          </div>
        ),
      },
    ],

    /* M3 — Le tableau de valeurs : un extrait, pas la fonction. */
    3: [
      {
        id: 'tableau-de-valeurs',
        type: 'concepts',
        title: 'Tableau de valeurs',
        summary: 'Un tableau range quelques antécédents et leurs images : c’est un extrait de la fonction, pas la fonction entière.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
              <table className="w-full text-sm text-center font-mono">
                <tbody>
                  <tr><th scope="row" className="text-left pr-2 font-sans font-semibold text-slate-600">x</th><td className="px-2">0</td><td className="px-2">1</td><td className="px-2">2</td><td className="px-2">3</td></tr>
                  <tr><th scope="row" className="text-left pr-2 font-sans font-semibold text-slate-600">f(x)</th><td className="px-2">−1</td><td className="px-2">2</td><td className="px-2">5</td><td className="px-2">8</td></tr>
                </tbody>
              </table>
            </div>
            <p>En haut les <strong>antécédents</strong>, en bas leurs <strong>images</strong>.
            Chaque colonne est un couple.</p>
            <p className="text-xs text-slate-500">Le tableau s’arrête ; la fonction, non. Pour une
            valeur absente, c’est la <strong>règle</strong> qui répond.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as rempli les colonnes
            une à une, puis on t'a demandé f(10) — hors du tableau.</div>
          </div>
        ),
      },
      {
        id: 'pas-constant',
        type: 'regles',
        title: 'Le pas du tableau',
        summary: 'Quand l’entrée augmente de 1, la sortie change toujours de la même quantité si la fonction est de la forme ax + b.',
        body: (
          <div className="space-y-2">
            <p>De colonne en colonne, la sortie avance ici de <strong>+3</strong> à chaque fois.
            Ce pas est le nombre qui multiplie x dans la règle.</p>
            <p className="text-xs text-slate-500">Si le pas n’est pas constant, la règle n’est pas
            de cette forme-là.</p>
          </div>
        ),
      },
    ],

    /* M4 — Le repère : un point EST un couple (antécédent ; image). */
    4: [
      {
        id: 'representation-graphique',
        type: 'concepts',
        title: 'Représentation graphique',
        summary: 'En plaçant tous les couples (antécédent ; image) comme des points, on dessine la fonction.',
        visual: affineGraph(2, -1, { points: [{ x: 3, y: 5, label: '(3 ; 5)', color: '#e11d48', labelPos: 'tr' }] }),
        body: (
          <div className="space-y-3">
            <p>Chaque colonne du tableau devient un <strong>point</strong> : l’antécédent se lit
            en horizontal, l’image en vertical.</p>
            <p>L’ensemble de ces points est la <strong>représentation graphique</strong> de la
            fonction.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as posé les cinq points
            du tableau — et ils se sont alignés.</div>
          </div>
        ),
      },
      {
        id: 'point-couple',
        type: 'regles',
        title: 'Un point = (antécédent ; image)',
        summary: 'Si le point (3 ; 5) est sur la courbe de f, alors f(3) = 5.',
        body: (
          <div className="space-y-2">
            <p>Un point de la courbe se lit toujours dans cet ordre :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$(3 \\; ; \\; 5)$'}</MathText>
              <span className="text-slate-500 text-xs"> &nbsp;⟺&nbsp; </span>
              <MathText>{'$f(3) = 5$'}</MathText>
            </div>
            <p className="text-xs text-slate-500">L’abscisse est ce qu’on entre, l’ordonnée ce qui
            sort. Lire une image sur un graphique, c’est monter puis lire à gauche.</p>
          </div>
        ),
      },
    ],

    /* M5 — Les deux familles : affine, et son cas particulier linéaire. */
    5: [
      {
        id: 'fonction-affine',
        type: 'concepts',
        title: 'Fonction affine',
        summary: 'Une fonction affine s’écrit f(x) = ax + b ; sa représentation graphique est une droite.',
        visual: affineGraph(2, 3, { points: [{ x: 0, y: 3, label: 'b', color: '#059669', labelPos: 'tl' }] }),
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$f(x) = ax + b$'}</MathText>
            </div>
            <p>Sa courbe est une <strong>droite</strong>. Le nombre <MathText>{'$b$'}</MathText> est
            l’image de 0 : c’est la hauteur à laquelle la droite coupe l’axe vertical.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois repères côte à
            côte — deux droites, une courbe.</div>
          </div>
        ),
      },
      {
        id: 'ordonnee-origine',
        type: 'vocabulaire',
        title: 'Ordonnée à l’origine',
        summary: 'Dans f(x) = ax + b, le nombre b est l’ordonnée à l’origine : la hauteur à laquelle la droite coupe l’axe vertical.',
        body: (
          <div className="space-y-3">
            <p>Le nombre <MathText>{'$b$'}</MathText> est l’image de 0 :
            <MathText>{' $f(0) = b$'}</MathText>. Sur le graphique, c’est la hauteur du point où la
            droite croise l’axe vertical — <strong>à l’origine</strong> des abscisses.</p>
            <p className="text-xs text-slate-500">D’où son nom : l’<strong>ordonnée à
            l’origine</strong>. Le mot « ordonnée » est celui que tu connais : la hauteur d’un
            point.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la droite de g coupait
            l’axe vertical en 3 — c'était son « + 3 ».</div>
          </div>
        ),
      },
      {
        id: 'fonction-lineaire',
        type: 'concepts',
        title: 'Fonction linéaire',
        summary: 'Une fonction linéaire est une fonction affine dont le b vaut 0 : f(x) = ax, et sa droite passe par l’origine.',
        visual: affineGraph(2, 0, { points: [{ x: 0, y: 0, label: 'O', color: '#4f46e5', labelPos: 'bl' }] }),
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$f(x) = ax$'}</MathText>
            </div>
            <p>C’est le cas <MathText>{'$b = 0$'}</MathText> : la droite passe par l’origine.</p>
            <p className="text-xs text-slate-500">Toute fonction linéaire est donc affine —
            l’inverse est faux, comme tout carré est un rectangle.</p>
          </div>
        ),
      },
      {
        id: 'mem-lineaire-est-affine',
        type: 'memoriser',
        title: '⭐ Linéaire ⊂ affine',
        summary: 'Les fonctions linéaires sont les fonctions affines dont la droite passe par l’origine.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1">
            <div className="text-lg font-black text-rose-700">linéaire = affine avec b = 0</div>
            <p className="text-xs text-rose-700">« Linéaire » ne s’oppose pas à « affine » : c’est
            un cas particulier.</p>
          </div>
        ),
      },
    ],

    /* M6 — La méthode : retrouver a, puis b. */
    6: [
      {
        id: 'methode-retrouver-a-b',
        type: 'methodes',
        title: 'Retrouver l’expression d’une fonction affine',
        summary: 'On cherche d’abord a — ce que gagne f quand x avance de 1 — puis b, l’image de 0.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Calculer le <strong>pas</strong> : ce que gagne f quand x avance de 1. C’est
              <MathText>{' $a$'}</MathText>.</li>
              <li>Trouver <MathText>{'$b$'}</MathText> : l’image de 0, ou en remplaçant x et f(x)
              par une colonne connue.</li>
              <li>Vérifier sur une <strong>autre</strong> colonne.</li>
            </ol>
            <p className="text-xs text-slate-500">Sur un graphique : <MathText>{'$b$'}</MathText> se
            lit là où la droite coupe l’axe vertical, et <MathText>{'$a$'}</MathText> se lit sur
            l’escalier « j’avance de 1, je monte de a ».</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l'enquête — tableau,
            tableau sans zéro, puis graphique.</div>
          </div>
        ),
      },
    ],

    /* M7 — Modéliser : la fonction sort du cahier. */
    7: [
      {
        id: 'modeliser',
        type: 'methodes',
        title: 'Modéliser une situation par une fonction',
        summary: 'Choisir ce qui varie (x), écrire la règle qui donne l’autre grandeur, puis lire les questions comme des images ou des antécédents.',
        body: (
          <div className="space-y-3">
            <p>Un taxi à 2 € de prise en charge puis 1,50 € par kilomètre, c’est
            <MathText>{' $f(x) = 1{,}5x + 2$'}</MathText>.</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                « Combien coûte 6 km ? » → une <strong>image</strong> : on calcule f(6).
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                « Quelle distance pour 14 € ? » → un <strong>antécédent</strong> : on cherche x tel
                que f(x) = 14.
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le taxi, puis les deux
            forfaits téléphone qui se croisent.</div>
          </div>
        ),
      },
    ],
  },
};
