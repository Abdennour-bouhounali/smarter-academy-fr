import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Fonctions affines » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner son sens, puis il reste disponible dans la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte montrent
 * le même texte, et l'enrichir se fait à un seul endroit.
 *
 * ORDRE. Un item n'utilise que ce qui est déjà établi au module qui le
 * déclare. C'est ce que corrige cette leçon : « coefficient directeur » et
 * « ordonnée à l'origine » y apparaissaient d'abord dans les OPTIONS d'un QCM
 * — dont trois fausses —, c'est-à-dire qu'il fallait deviner le mot pour
 * répondre à la question qui le demandait. Ici :
 *   M1  la part fixe et la part variable, puis la forme ax + b
 *   M2  a, une fois l'escalier exploré         → « coefficient directeur »
 *   M3  b, une fois la droite fait glisser     → « ordonnée à l'origine »
 *   M4  les deux au travail : tableau, lecture graphique, f(0) = b
 *   M5  le rapport Δy/Δx, puis la méthode complète
 *   M6  b comme levier d'une situation réelle
 * Un exemple qui anticiperait le module suivant serait un spoiler visible à
 * l'écran, puisque la brique rend ce texte à sa position.
 *
 * PRÉREQUIS (lesson.config.js `priorKnowledge`) : la notation f(x), l'image,
 * les fonctions linéaires, le tableau de valeurs et la représentation
 * graphique viennent de la leçon « Fonctions » ; le repérage vient de 6e. Rien
 * de tout cela n'est réenseigné ici — le module 0 le diagnostique.
 */

/** Une droite d'expression ax + b dans un repère miniature. */
const line = (a, b, extra = {}) => (
  <MiniGraph
    width={210} height={150} xMin={-3} xMax={5} yMin={-4} yMax={7}
    functions={[{ fn: (x) => a * x + b, color: '#4f46e5' }]}
    {...extra}
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Deux nombres au lieu d'un : la part fixe et la part variable. */
    1: [
      {
        id: 'part-fixe-part-variable',
        type: 'concepts',
        title: 'Part fixe et part variable',
        summary: 'Certains prix se composent de deux morceaux : ce qu’on paie même pour zéro, et ce qui court avec la quantité.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
              <div className="flex justify-between gap-3"><span>Prise en charge (même pour 0 km)</span><span className="font-mono">2,00 €</span></div>
              <div className="flex justify-between gap-3"><span>4 km × 1,50 €</span><span className="font-mono">6,00 €</span></div>
              <div className="flex justify-between gap-3 border-t border-slate-300 pt-1 font-bold"><span>Total</span><span className="font-mono">8,00 €</span></div>
            </div>
            <p>La <strong>part fixe</strong> se paie une seule fois, quelle que soit la
            quantité. La <strong>part variable</strong> se recalcule à chaque fois.</p>
            <p className="text-xs text-slate-500">Le test tient en une question : <strong>que
            paie-t-on pour zéro ?</strong> S’il reste quelque chose, il y a une part fixe — et
            la situation n’est pas proportionnelle.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le compteur du taxi
            affichait déjà 2 € avant d’avoir roulé.</div>
          </div>
        ),
      },
      {
        id: 'fonction-affine',
        type: 'concepts',
        title: 'Fonction affine',
        summary: 'Une fonction affine multiplie par un nombre, puis ajoute un autre : elle a une part variable et une part fixe.',
        visual: line(1.5, 2, { points: [{ x: 0, y: 2, label: '(0 ; 2)', color: '#d97706', labelPos: 'tl' }] }),
        body: (
          <div className="space-y-3">
            <p>Le prix du taxi est une <strong>fonction affine</strong> de la distance : on
            multiplie les kilomètres par 1,50 €, puis on ajoute les 2 € de prise en charge.</p>
            <p className="text-xs text-slate-500">Sa représentation graphique est une
            <strong> droite</strong>, et cette droite ne part pas de zéro : elle démarre à la
            hauteur de la part fixe.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la trace du compteur
            partait de 2 € et grimpait tout droit.</div>
          </div>
        ),
      },
      {
        id: 'forme-ax-b',
        type: 'formules',
        title: 'L’écriture f(x) = ax + b',
        summary: 'Deux lettres pour deux rôles : a multiplie la quantité, b s’ajoute une seule fois.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$f(x) = ax + b$'}</MathText>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <MathText>{'$a$'}</MathText> — la <strong>part variable</strong> : le prix de
                chaque unité (ici 1,50 € par kilomètre).
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <MathText>{'$b$'}</MathText> — la <strong>part fixe</strong> : ce qu’on paie
                même pour zéro (ici 2 €).
              </div>
            </div>
            <p>Le taxi s’écrit donc <MathText>{'$f(x) = 1{,}5x + 2$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Attention à l’ordre : on multiplie
            d’<strong>abord</strong> par <MathText>{'$a$'}</MathText>, on ajoute
            <MathText>{' $b$'}</MathText> ensuite. Jamais <MathText>{'$a \\times (x + b)$'}</MathText>.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : deux réglages sur le
            compteur, deux effets qui ne se marchaient pas dessus.</div>
          </div>
        ),
      },
      {
        id: 'mem-affine-vs-lineaire',
        type: 'memoriser',
        title: '⭐ Doubler la quantité ne double pas le prix',
        summary: 'Dès qu’il y a une part fixe, la situation n’est plus proportionnelle.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="text-lg font-black text-rose-700">2 km → 5 € &nbsp;·&nbsp; 4 km → 8 €</div>
            <p className="text-xs text-rose-700">Les kilomètres doublent (3 € → 6 €), la part
            fixe non (2 € → 2 €). Le total ne double donc pas.</p>
            <p className="text-xs text-rose-700">Une fonction <strong>linéaire</strong> est le
            cas où <MathText>{'$b = 0$'}</MathText> : là seulement, doubler double.</p>
          </div>
        ),
      },
    ],

    /* M2 — a seul : l'inclinaison, nommée après l'escalier. */
    2: [
      {
        id: 'coefficient-directeur',
        type: 'vocabulaire',
        title: 'Coefficient directeur',
        summary: 'Dans f(x) = ax + b, le nombre a est le coefficient directeur : quand x avance de 1, f monte de a.',
        visual: line(2, 2, { points: [{ x: 0, y: 2, color: '#d97706' }, { x: 1, y: 4, label: '+1 → +2', color: '#4f46e5', labelPos: 'tr' }] }),
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$f(x) = ax + b$'}</MathText>
              <span className="text-slate-500 text-xs"> &nbsp;·&nbsp; </span>
              <MathText>{'$a$'}</MathText>
              <span className="text-slate-500 text-xs"> = coefficient directeur</span>
            </div>
            <p>C’est exactement ce que mesure l’<strong>escalier</strong> : j’avance de 1
            vers la droite, je monte de <MathText>{'$a$'}</MathText>.</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-slate-700">
              <li><MathText>{'$a > 0$'}</MathText> : la droite monte — plus <MathText>{'$a$'}</MathText> est grand, plus elle est raide.</li>
              <li><MathText>{'$a < 0$'}</MathText> : la droite descend.</li>
              <li><MathText>{'$a = 0$'}</MathText> : la droite est horizontale, rien ne bouge.</li>
            </ul>
            <p className="text-xs text-slate-500">Il commande l’<strong>inclinaison</strong>, et
            rien d’autre : la hauteur de départ ne le regarde pas.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : trois inclinaisons
            essayées, un seul point resté immobile.</div>
          </div>
        ),
      },
      {
        id: 'role-de-a',
        type: 'regles',
        title: 'Ce que fait a — et ce qu’il ne fait pas',
        summary: 'Changer a fait pivoter la droite autour de son point de départ ; cela ne la fait jamais monter tout entière.',
        body: (
          <div className="space-y-2">
            <p>Quand <MathText>{'$a$'}</MathText> change et que <MathText>{'$b$'}</MathText> ne
            bouge pas, la droite <strong>pivote</strong> — elle tourne autour du point de départ,
            qui reste sur place.</p>
            <p className="text-xs text-slate-500">Faire monter la droite <em>entière</em>, c’est
            le travail de l’autre réglage : celui qui était bloqué.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le point orange n’a pas
            bougé d’un pixel pendant que tu réglais a.</div>
          </div>
        ),
      },
    ],

    /* M3 — b seul : la hauteur de départ, nommée après le glissement. */
    3: [
      {
        id: 'ordonnee-origine',
        type: 'vocabulaire',
        title: 'Ordonnée à l’origine',
        summary: 'Dans f(x) = ax + b, le nombre b est l’ordonnée à l’origine : la hauteur à laquelle la droite coupe l’axe vertical.',
        visual: line(1, 3, { points: [{ x: 0, y: 3, label: 'b = 3', color: '#d97706', labelPos: 'tl' }] }),
        body: (
          <div className="space-y-3">
            <p>En <MathText>{'$x = 0$'}</MathText>, le terme <MathText>{'$ax$'}</MathText> vaut 0
            et il ne reste que <MathText>{'$b$'}</MathText> :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$f(0) = b$'}</MathText>
            </div>
            <p>Sur le graphique, c’est donc la hauteur du point où la droite croise l’axe
            vertical — celui d’abscisse 0, à l’<strong>origine</strong>.</p>
            <p className="text-xs text-slate-500">D’où son nom : l’<strong>ordonnée à
            l’origine</strong>. Le mot « ordonnée » est celui que tu connais déjà : la hauteur
            d’un point.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le point orange qui
            montait et descendait le long de l’axe vertical, sans jamais incliner la droite.</div>
          </div>
        ),
      },
      {
        id: 'role-de-b',
        type: 'regles',
        title: 'Ce que fait b — et ce qu’il ne fait pas',
        summary: 'Changer b fait glisser la droite vers le haut ou vers le bas, sans jamais toucher à son inclinaison.',
        body: (
          <div className="space-y-2">
            <p>Quand <MathText>{'$b$'}</MathText> change et que <MathText>{'$a$'}</MathText> ne
            bouge pas, la droite <strong>se translate verticalement</strong> : elle monte ou
            descend en bloc.</p>
            <p className="text-xs text-slate-500">Elle ne se déplace pas vers la droite, et elle
            ne pivote pas. Deux commandes indépendantes : chacune son métier.</p>
          </div>
        ),
      },
      {
        id: 'droites-paralleles',
        type: 'regles',
        title: 'Même a, droites parallèles',
        summary: 'Deux fonctions affines de même coefficient directeur ont des droites parallèles, quels que soient leurs b.',
        visual: (
          <MiniGraph
            width={210} height={150} xMin={-3} xMax={5} yMin={-4} yMax={7}
            functions={[
              { fn: (x) => x + 3, color: '#4f46e5' },
              { fn: (x) => x - 2, color: '#0891b2', dashed: true },
            ]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p><MathText>{'$f(x) = x + 3$'}</MathText> et <MathText>{'$g(x) = x - 2$'}</MathText>{' '}
            ont la même inclinaison : leurs droites ne se rencontreront jamais.</p>
            <p className="text-xs text-slate-500">Un <MathText>{'$b$'}</MathText> différent ne
            fait que les décaler l’une par rapport à l’autre.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : toutes les positions
            essayées avaient exactement la même pente.</div>
          </div>
        ),
      },
    ],

    /* M4 — les deux au travail : tableau, lecture graphique, raccourci f(0). */
    4: [
      {
        id: 'tableau-affine',
        type: 'methodes',
        title: 'Lire a et b dans un tableau de valeurs',
        summary: 'La colonne x = 0 donne b ; l’écart d’une colonne à la suivante, quand x avance de 1, donne a.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
              <table className="w-full text-sm text-center font-mono">
                <tbody>
                  <tr><th scope="row" className="text-left pr-2 font-sans font-semibold text-slate-600">x</th><td className="px-2">0</td><td className="px-2">1</td><td className="px-2">2</td><td className="px-2">3</td></tr>
                  <tr><th scope="row" className="text-left pr-2 font-sans font-semibold text-slate-600">f(x)</th><td className="px-2 bg-amber-100">3</td><td className="px-2">1,5</td><td className="px-2">0</td><td className="px-2">−1,5</td></tr>
                </tbody>
              </table>
            </div>
            <p>Sous <MathText>{'$x = 0$'}</MathText> on lit <strong>3</strong> : c’est
            <MathText>{' $b$'}</MathText>. D’une colonne à la suivante on descend de
            <strong> 1,5</strong> : c’est <MathText>{' $a$'}</MathText>, ici négatif.</p>
            <p className="text-xs text-slate-500">Ce pas est constant : c’est la signature d’une
            fonction affine. S’il ne l’est pas, la fonction n’est pas affine.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les colonnes remplies
            une à une, et l’écart toujours le même.</div>
          </div>
        ),
      },
      {
        id: 'lire-a-et-b-graphique',
        type: 'methodes',
        title: 'Lire a et b sur un graphique',
        summary: 'D’abord b, là où la droite coupe l’axe vertical ; puis a, en avançant de 1 et en lisant la montée.',
        visual: line(2, -3, { points: [{ x: 0, y: -3, label: 'b', color: '#d97706', labelPos: 'bl' }, { x: 1, y: -1, label: '+2', color: '#4f46e5', labelPos: 'tr' }] }),
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Repérer où la droite <strong>croise l’axe vertical</strong> : cette hauteur est
              <MathText>{' $b$'}</MathText>.</li>
              <li>Depuis ce point, <strong>avancer de 1</strong> vers la droite et lire de combien
              on monte (ou descend) : c’est <MathText>{' $a$'}</MathText>.</li>
              <li>Écrire <MathText>{'$f(x) = ax + b$'}</MathText> avec les deux nombres trouvés.</li>
            </ol>
            <p className="text-xs text-slate-500">Deux lectures, deux endroits différents : le
            nombre lu sur l’axe vertical n’est jamais le coefficient directeur.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la droite muette, sans
            aucune expression affichée.</div>
          </div>
        ),
      },
      {
        id: 'mem-f0-egale-b',
        type: 'memoriser',
        title: '⭐ f(0) = b, toujours',
        summary: 'L’image de 0 par une fonction affine est son ordonnée à l’origine.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1">
            <div className="text-lg font-black text-rose-700">f(0) = a × 0 + b = b</div>
            <p className="text-xs text-rose-700">Le terme en <MathText>{'$x$'}</MathText>{' '}
            disparaît : c’est le raccourci le plus utile de la leçon, dans un tableau comme sur
            un graphique.</p>
          </div>
        ),
      },
    ],

    /* M5 — le rapport, puis la méthode complète. */
    5: [
      {
        id: 'pente-deux-points',
        type: 'formules',
        title: 'Le coefficient à partir de deux points',
        summary: 'Entre deux points d’une droite, a est la montée divisée par l’avancée : a = Δy ÷ Δx.',
        visual: line(2, 1, { points: [{ x: 0, y: 1, color: '#94a3b8' }, { x: 1, y: 3, color: '#059669' }, { x: 3, y: 7, color: '#e11d48' }] }),
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$a = \\dfrac{\\Delta y}{\\Delta x}$'}</MathText>
            </div>
            <p>Le triangle entre deux points de la droite se lit en deux mesures :
            <MathText>{' $\\Delta x$'}</MathText> l’<strong>avancée</strong> horizontale, et
            <MathText>{' $\\Delta y$'}</MathText> la <strong>montée</strong> verticale.
            (La lettre grecque <MathText>{'$\\Delta$'}</MathText> se lit « delta » et veut dire
            « écart ».)</p>
            <p className="text-xs text-slate-500">L’ordre ne se discute pas : la montée
            <strong> divisée par</strong> l’avancée. L’inverse donnerait un autre nombre, et une
            autre droite.</p>
            <p className="text-xs text-slate-500">Peu importe les deux points choisis sur la même
            droite : le rapport ne change pas.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le triangle qui se
            redessinait à chaque déplacement, avec toujours le même rapport.</div>
          </div>
        ),
      },
      {
        id: 'methode-retrouver-a-b',
        type: 'methodes',
        title: 'Retrouver l’expression d’une fonction affine',
        summary: 'On cherche a par le rapport des écarts, puis b en remplaçant x et f(x) par un point connu — et on vérifie sur l’autre point.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Calculer <MathText>{'$a = \\dfrac{\\Delta y}{\\Delta x}$'}</MathText> entre les
              deux points.</li>
              <li>Prendre <strong>un</strong> point connu <MathText>{'$(x \\; ; \\; y)$'}</MathText>{' '}
              et remplacer dans <MathText>{'$y = ax + b$'}</MathText> : il ne reste que
              <MathText>{' $b$'}</MathText> à trouver.</li>
              <li><strong>Vérifier</strong> sur l’autre point.</li>
            </ol>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
              <p className="font-semibold text-slate-700">Exemple : la droite passe par (1 ; 5) et (4 ; 11).</p>
              <p><MathText>{'$a = \\dfrac{11 - 5}{4 - 1} = \\dfrac{6}{3} = 2$'}</MathText></p>
              <p><MathText>{'$5 = 2 \\times 1 + b$'}</MathText> donc <MathText>{'$b = 3$'}</MathText></p>
              <p>Vérification : <MathText>{'$2 \\times 4 + 3 = 11$'}</MathText> ✓</p>
            </div>
            <p className="text-xs text-slate-500">Un piège : l’ordonnée d’un point connu n’est pas
            <MathText>{' $b$'}</MathText>, sauf si son abscisse vaut 0.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’enquête menée sans
            aucun réglage à faire glisser.</div>
          </div>
        ),
      },
    ],

    /* M6 — b comme levier d'une situation réelle. */
    6: [
      {
        id: 'modeliser-tarif',
        type: 'methodes',
        title: 'Modéliser un tarif, et le comparer',
        summary: 'Le prix par unité donne a, la part payée d’avance donne b ; le point où deux droites se croisent dit à partir de quand l’un devient meilleur.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                « 0,25 € la minute, sans rien d’avance » → <MathText>{'$A(x) = 0{,}25x$'}</MathText>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                « 12 € d’abonnement puis 0,10 € la minute » → <MathText>{'$B(x) = 0{,}1x + 12$'}</MathText>
              </div>
            </div>
            <p>Baisser l’abonnement, c’est baisser <MathText>{'$b$'}</MathText> : la droite
            <strong> glisse vers le bas</strong> et croise l’autre <strong>plus tôt</strong>.
            Le prix à la minute, lui, n’a pas bougé.</p>
            <p className="text-xs text-slate-500">Aucun tarif à part fixe n’est meilleur en toutes
            circonstances : c’est l’usage qui décide, et le point de croisement dit où est la
            bascule.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’abonnement négocié
            cran par cran jusqu’à passer devant à 40 minutes.</div>
          </div>
        ),
      },
    ],
  },
};
