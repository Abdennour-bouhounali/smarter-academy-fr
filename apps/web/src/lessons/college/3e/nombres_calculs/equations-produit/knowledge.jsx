import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Équations produit nul » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner un sens, puis il reste sur la carte. Rien
 * n'est réécrit dans les modules : la brique et la carte montrent le même
 * texte.
 *
 * ORDRE. Un item n'utilise QUE ce qui est déjà établi au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux :
 *   M1 le constat sur deux nombres  →  M2 équation, solution, ensemble  →
 *   M3 la balance et le premier degré  →  M4 la règle du produit nul et la
 *   méthode des branches  →  M5 vérifier puis interpréter  →  M6 les deux
 *   chemins qui fabriquent un produit.
 * Le mot « équation » n'apparaît donc dans aucun item du module 1, et « produit
 * nul » dans aucun item des modules 1 à 3 : le module 1 ne parle que de deux
 * NOMBRES et de leur produit.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le constat brut, sur deux nombres. Aucun x, aucune équation. */
    1: [
      {
        id: 'produit-nul-constat',
        type: 'concepts',
        title: 'Un produit ne tombe pas à zéro par hasard',
        summary: 'Deux nombres dont le produit vaut 0 : il y a forcément un 0 parmi eux.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1 font-mono text-sm">
              <p>0 × 4 = 0 &nbsp;·&nbsp; 3 × 0 = 0 &nbsp;·&nbsp; 0 × 0 = 0</p>
              <p className="text-slate-400">mais 5 × (−5) = −25, et 0,1 × 0,1 = 0,01</p>
            </div>
            <p>Il suffit qu’<strong>un seul</strong> des deux nombres soit nul — il n’est pas
            nécessaire que les deux le soient.</p>
            <p className="text-xs text-slate-500">Deux nombres opposés donnent 0 par
            <strong> addition</strong>, jamais par multiplication. Et un produit très petit n’est
            pas un produit nul.</p>
            <Souvenir>les deux molettes, et les trois seules façons de faire tomber le produit.</Souvenir>
          </div>
        ),
      },
    ],

    /* M2 — Le vocabulaire de l'égalité à trou. */
    2: [
      {
        id: 'equation',
        type: 'vocabulaire',
        title: 'Équation et inconnue',
        summary: 'Une équation est une égalité qui contient une lettre inconnue.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$3x - 6 = 0$'}</MathText>
            </div>
            <p>Il faut les <strong>deux</strong> : un signe <MathText>{'$=$'}</MathText> (c’est une
            égalité) et une lettre (c’est l’<strong>inconnue</strong>).</p>
            <p className="text-xs text-slate-500"><MathText>{'$3x - 6$'}</MathText> tout seul est une
            expression, sans égalité. <MathText>{'$3 \\times 5 - 6 = 9$'}</MathText> est une égalité
            de nombres, sans inconnue. Ni l’une ni l’autre n’est une équation.</p>
            <Souvenir>les deux colonnes du tableau, une pour chaque côté du signe =.</Souvenir>
          </div>
        ),
      },
      {
        id: 'solution',
        type: 'vocabulaire',
        title: 'Solution',
        summary: 'Une solution est une valeur de l’inconnue qui rend l’égalité vraie.',
        body: (
          <div className="space-y-3">
            <p>Pour <MathText>{'$3x - 6 = 0$'}</MathText>, la valeur{' '}
            <MathText>{'$x = 2$'}</MathText> donne <MathText>{'$3 \\times 2 - 6 = 0$'}</MathText> :
            les deux côtés tombent d’accord, la ligne est verte.</p>
            <p><strong>Résoudre</strong> une équation, c’est trouver <em>toutes</em> ses solutions —
            et seulement celles-là.</p>
            <p className="text-xs text-slate-500">Une valeur qui ne convient pas n’est pas
            « fausse » : elle n’est simplement pas solution.</p>
            <Souvenir>la seule ligne verte du premier tableau.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ensemble-solutions',
        type: 'concepts',
        title: 'L’ensemble des solutions',
        summary: 'Une équation peut avoir une solution, plusieurs, aucune, ou toutes les valeurs.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p><MathText>{'$S = \\{\\,2\\,\\}$'}</MathText> — une seule solution</p>
              <p><MathText>{'$S = \\emptyset$'}</MathText> — aucune solution</p>
            </div>
            <p>On note <MathText>{'$S$'}</MathText> l’ensemble des solutions, entre accolades.{' '}
            <MathText>{'$\\emptyset$'}</MathText> se lit « ensemble vide ».</p>
            <p className="text-xs text-slate-500"><MathText>{'$x + 1 = x + 2$'}</MathText> n’a aucune
            solution : un nombre ne peut pas valoir son successeur.{' '}
            <MathText>{'$2(x + 1) = 2x + 2$'}</MathText> est vraie pour toutes les valeurs : ce sont
            deux écritures de la même expression.</p>
            <Souvenir>le tableau tout rose, et le tableau tout vert.</Souvenir>
          </div>
        ),
      },
    ],

    /* M3 — Transformer sans casser, et le nom du type d'équation résolu. */
    3: [
      {
        id: 'equation-equivalente',
        type: 'regles',
        title: 'Transformer sans changer les solutions',
        summary: 'Ce qu’on fait à un membre, on le fait à l’autre — sinon la balance penche et les solutions changent.',
        body: (
          <div className="space-y-3">
            <p>On garde les mêmes solutions en faisant, <strong>aux deux membres à la fois</strong> :</p>
            <ul className="text-sm space-y-1 pl-4 list-disc">
              <li>ajouter ou retrancher le même nombre, ou la même expression ;</li>
              <li>multiplier ou diviser par un même nombre <strong>non nul</strong>.</li>
            </ul>
            <p className="text-xs text-slate-500">Diviser par 0 n’a aucun sens : c’est la seule
            division interdite. Et « faire passer de l’autre côté » sans rien retrancher fabrique
            une autre équation.</p>
            <Souvenir>le fléau qui penchait dès qu’un seul plateau bougeait.</Souvenir>
          </div>
        ),
      },
      {
        id: 'equation-premier-degre',
        type: 'methodes',
        title: 'Résoudre une équation du premier degré',
        summary: 'Quand l’inconnue n’apparaît qu’à la puissance 1, on l’isole en deux gestes de balance.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p><MathText>{'$5x - 2 = 13$'}</MathText></p>
              <p className="text-xs text-slate-500">+ 2 des deux côtés</p>
              <p><MathText>{'$5x = 15$'}</MathText></p>
              <p className="text-xs text-slate-500">÷ 5 des deux côtés</p>
              <p><MathText>{'$x = 3$'}</MathText></p>
            </div>
            <p>On dit qu’une équation est du <strong>premier degré</strong> quand l’inconnue y
            apparaît seulement multipliée par un nombre — jamais élevée au carré.</p>
            <p className="text-xs text-slate-500">Si une parenthèse enferme l’inconnue, on
            l’ouvre d’abord : <MathText>{'$3(x + 2) = 3x + 6$'}</MathText>.</p>
            <Souvenir>les deux plateaux vidés jusqu’au x tout seul.</Souvenir>
          </div>
        ),
      },
    ],

    /* M4 — La règle, et la méthode qui en découle. */
    4: [
      {
        id: 'regle-produit-nul',
        type: 'memoriser',
        title: '⭐ La règle du produit nul',
        summary: 'A × B = 0 si et seulement si A = 0 ou B = 0.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <MathText className="text-lg">
              {'$A \\times B = 0 \\iff A = 0 \\text{ ou } B = 0$'}
            </MathText>
            <p className="text-xs text-rose-800">
              Le « ou » n’est pas exclusif : les deux peuvent être nuls à la fois. Et il en faut{' '}
              <strong>au moins un</strong> — un produit ne s’annule jamais autrement.
            </p>
            <p className="text-xs text-rose-700">
              A et B ne sont plus des nombres : ce sont des expressions en x.
            </p>
          </div>
        ),
      },
      {
        id: 'methode-branches',
        type: 'methodes',
        title: 'Couper un produit en branches',
        summary: 'Chaque facteur mis à zéro donne une équation du premier degré à résoudre à part.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p><MathText>{'$(x - 3)(2x + 4) = 0$'}</MathText></p>
              <p className="text-xs text-slate-500">deux facteurs, deux branches</p>
              <p><MathText>{'$x - 3 = 0$'}</MathText> ou <MathText>{'$2x + 4 = 0$'}</MathText></p>
              <p><MathText>{'$S = \\{\\,-2\\,;\\,3\\,\\}$'}</MathText></p>
            </div>
            <p>Autant de facteurs, autant de branches. Une branche oubliée, c’est une solution
            perdue.</p>
            <p className="text-xs text-slate-500">Un facteur peut être <MathText>{'$x$'}</MathText>{' '}
            tout seul : dans <MathText>{'$x(x - 4) = 0$'}</MathText>, il s’annule pour{' '}
            <MathText>{'$x = 0$'}</MathText>. C’est la branche qu’on oublie le plus souvent.</p>
            <Souvenir>les deux zéros tamponnés sur la bande du scanner.</Souvenir>
          </div>
        ),
      },
    ],

    /* M5 — Les deux gestes qui suivent la résolution. */
    5: [
      {
        id: 'verifier-solution',
        type: 'methodes',
        title: 'Vérifier une solution',
        summary: 'On remplace la valeur dans l’équation de DÉPART et on calcule les deux membres.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$x = 3 : (3 - 3)(2 \\times 3 + 4) = 0 \\times 10 = 0$'}</MathText>
            </div>
            <p>Vérifier ne demande pas de refaire la résolution : c’est une simple substitution, et
            elle marche même sans savoir résoudre.</p>
            <p className="text-xs text-slate-500">C’est aussi ainsi qu’on prouve qu’une valeur
            n’<strong>est pas</strong> solution — le produit obtenu n’est alors pas nul.</p>
            <Souvenir>la bande de vérification, et l’intrus qui n’est pas passé.</Souvenir>
          </div>
        ),
      },
      {
        id: 'interpreter-solution',
        type: 'regles',
        title: 'Interpréter dans le contexte',
        summary: 'Résoudre et interpréter sont deux étapes : le contexte peut rejeter une solution mathématiquement correcte.',
        body: (
          <div className="space-y-3">
            <p>Une longueur, une durée, un effectif ne peuvent pas être négatifs. Une solution de
            l’équation qui donnerait une telle valeur est écartée — <strong>en le disant</strong>.</p>
            <p className="text-xs text-slate-500">L’équation garde ses deux solutions : c’est un
            fait mathématique. C’est le <em>problème</em>, pas l’équation, qui en refuse une.</p>
            <Souvenir>le rectangle dont un côté aurait mesuré −7 cm.</Souvenir>
          </div>
        ),
      },
    ],

    /* M6 — Fabriquer un produit là où il n'y en avait pas. */
    6: [
      {
        id: 'factoriser-vers-produit',
        type: 'methodes',
        title: 'Factoriser pour obtenir un produit nul',
        summary: 'On ramène tout d’un côté, puis on écrit cette somme sous forme de produit.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p><MathText>{'$x^{2} = 4x$'}</MathText></p>
              <p className="text-xs text-slate-500">tout à gauche</p>
              <p><MathText>{'$x^{2} - 4x = 0$'}</MathText></p>
              <p className="text-xs text-slate-500">x est dans les deux termes : on le met en facteur</p>
              <p><MathText>{'$x(x - 4) = 0$'}</MathText></p>
            </div>
            <p>Écrire une somme sous forme de produit, c’est <strong>factoriser</strong>. C’est le
            seul chemin sûr : diviser par <MathText>{'$x$'}</MathText> supposerait{' '}
            <MathText>{'$x \\neq 0$'}</MathText> et perdrait la solution{' '}
            <MathText>{'$x = 0$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Un facteur commun à tous les termes se met en
            facteur ; il devient l’une des branches.</p>
            <Souvenir>le carré et le rectangle d’aires égales, en x = 4 mais aussi en x = 0.</Souvenir>
          </div>
        ),
      },
      {
        id: 'difference-deux-carres',
        type: 'formules',
        title: 'La différence de deux carrés',
        summary: 'a² − b² = (a − b)(a + b) : le second chemin vers un produit, quand aucun facteur n’est commun.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p><MathText>{'$a^{2} - b^{2} = (a - b)(a + b)$'}</MathText></p>
              <p className="text-xs text-slate-500">
                <MathText>{'$x^{2} - 16 = x^{2} - 4^{2} = (x - 4)(x + 4)$'}</MathText>
              </p>
            </div>
            <p>Il faut une <strong>différence</strong> : une somme de carrés, comme{' '}
            <MathText>{'$x^{2} + 16$'}</MathText>, ne se transforme pas ainsi.</p>
            <p className="text-xs text-slate-500">Devant une expression sans facteur commun, c’est
            la forme à chercher — les deux morceaux doivent être des carrés.</p>
            <Souvenir>l’autre porte de sortie, quand aucun x ne se met en facteur.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-methode-complete',
        type: 'memoriser',
        title: '⭐ La méthode complète',
        summary: 'Ramener à « produit = 0 », annuler chaque facteur, vérifier, interpréter.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5">
            <p className="text-sm font-bold text-rose-900">1. Tout ramener à « produit = 0 »</p>
            <p className="text-sm font-bold text-rose-900">2. Annuler chaque facteur, séparément</p>
            <p className="text-sm font-bold text-rose-900">3. Vérifier en remplaçant dans l’équation de départ</p>
            <p className="text-sm font-bold text-rose-900">4. Interpréter : garder ce qui a un sens</p>
            <p className="text-xs text-rose-700 pt-1">Aucune de ces quatre étapes ne se saute : la
            première fabrique le produit, la dernière rend la réponse au problème.</p>
          </div>
        ),
      },
    ],
  },
};
