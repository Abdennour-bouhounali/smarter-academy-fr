import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Arithmétique » — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. L'écriture littérale (2k, pk) n'apparaît qu'au
 * module 2, les critères au module 3, PGCD/PPCM au module 4.
 *
 * Numérotation : le module « À retenir » (ex-05) a été supprimé ;
 * « Démontrer » est devenu le module 5 et le test final le module 6.
 */
export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Les paquets et les restes : division euclidienne, multiple /
       diviseur, et le rôle du reste. Aucune lettre encore. */
    1: [
      {
        id: 'division-euclidienne',
        type: 'concepts',
        title: 'Division euclidienne',
        summary: 'Ranger n en paquets de p : n = p × q + r, avec un reste r strictement plus petit que p.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono font-bold text-slate-800">n = p × q + r &nbsp;&nbsp;(0 ≤ r &lt; p)</div>
              <div className="text-xs text-slate-500">q paquets pleins, r jetons seuls.</div>
            </div>
            <div className="bg-white rounded-xl border border-blue-100 p-3">
              <div className="text-slate-400 text-xs mb-1">Exemple</div>
              <div className="font-mono text-sm text-slate-800">47 = 2 × 23 + 1</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les jetons rangés en paquets, et ceux qui restent seuls.</div>
          </div>
        ),
      },
      {
        id: 'multiple-diviseur',
        type: 'concepts',
        title: 'Multiple et diviseur',
        summary: 'Une seule égalité, deux lectures : dans n = p × q, n est le multiple, p et q les diviseurs.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">91 = 7 × 13</div>
              <div className="text-xs text-slate-500">91 est un <strong>multiple</strong> de 7 et de 13 ;</div>
              <div className="text-xs text-slate-500">7 et 13 sont des <strong>diviseurs</strong> de 91.</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Le grand nombre est le multiple, les petits sont les diviseurs. 0 est multiple de tout entier
              (0 = p × 0).
            </div>
          </div>
        ),
      },
      {
        id: 'regle-reste-decide',
        type: 'regles',
        title: 'Le reste décide',
        summary: 'n est un multiple de p exactement quand le reste de sa division par p vaut 0.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3">
              <div className="font-mono font-bold text-slate-800">n multiple de p &nbsp;⟺&nbsp; r = 0</div>
            </div>
            <p className="text-sm text-slate-600">
              Et les <strong>restes s’additionnent</strong> : en réunissant deux tas, leurs jetons seuls se
              rassemblent. Si leur total fait 0 ou un paquet complet, la somme est encore un multiple de p.
            </p>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              7 et 9 laissent chacun 1 jeton seul (paquets de 2) : les deux forment un paquet de plus, donc 16 est
              pair. Deux impairs font toujours un pair.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-multiple-reste',
        type: 'memoriser',
        title: '⭐ Multiple ⟺ reste nul',
        summary: 'n = pk ⟺ p divise n ⟺ le reste de n par p vaut 0.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="font-mono text-lg font-black text-rose-700">r = 0</div>
              <div className="flex justify-center gap-2 flex-wrap text-xs font-bold">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">n multiple de p</span>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">p diviseur de n</span>
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Pair, impair, et la lettre : 2k / 2k+1, pk, et le passage du
       constat à la preuve. */
    2: [
      {
        id: 'ecriture-litterale-parite',
        type: 'regles',
        title: 'Écrire un pair, un impair, un multiple',
        summary: 'Un pair s’écrit 2k, un impair 2k + 1, un multiple de p s’écrit pk — avec k entier quelconque.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><span className="text-slate-600">n pair</span><MathText>{'$n = 2k$'}</MathText></div>
              <div className="flex justify-between gap-3"><span className="text-slate-600">n impair</span><MathText>{'$n = 2k + 1$'}</MathText></div>
              <div className="flex justify-between gap-3"><span className="text-slate-600">n multiple de p</span><MathText>{'$n = pk$'}</MathText></div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              k est <strong>le nombre de paquets</strong>, pas le nombre lui-même : 47 = 2 × 23 + 1 donne k = 23.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les paquets de 2, et le jeton seul du « + 1 ».</div>
          </div>
        ),
      },
      {
        id: 'lettre-couvre-tout',
        type: 'concepts',
        title: 'La lettre couvre tous les entiers d’un coup',
        summary: 'k pouvant être n’importe quel entier, 2k + 1 représente TOUS les impairs — c’est ce qui permet de démontrer.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>k = 0 → 1</div>
              <div>k = 1 → 3</div>
              <div>k = 500 → 1 001</div>
              <div>k = −3 → −5</div>
            </div>
            <p className="text-sm text-slate-600">
              Des exemples, même nombreux, ne couvrent jamais tous les entiers. Une lettre, si.
            </p>
          </div>
        ),
      },
      {
        id: 'methode-preuve-parite',
        type: 'methodes',
        title: 'Démontrer avec une écriture littérale',
        summary: 'Écrire l’hypothèse avec une lettre, transformer, puis reconnaître la forme qui conclut.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">La somme de deux impairs est paire</div>
              <MathText>{'$(2k + 1) + (2m + 1) = 2k + 2m + 2 = 2(k + m + 1)$'}</MathText>
              <div className="text-xs text-slate-500">k + m + 1 est un entier, donc le résultat est 2 × (un entier) : pair.</div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">Le carré d’un impair est impair</div>
              <MathText>{'$(2k + 1)^{2} = 4k^{2} + 4k + 1 = 2(2k^{2} + 2k) + 1$'}</MathText>
              <div className="text-xs text-slate-500">de la forme 2m + 1 : impair, pour tout k.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              La conclusion vient de la <strong>forme</strong> obtenue : « 2 × un entier » est la définition d’un pair.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-parite-operations',
        type: 'regles',
        title: 'Parité d’une somme, d’un produit',
        summary: 'pair + pair = pair, impair + impair = pair, pair + impair = impair ; n(n + 1) est toujours pair.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1 text-sm font-mono text-slate-800">
              <div>pair + pair = pair</div>
              <div>impair + impair = pair</div>
              <div>pair + impair = impair</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              <MathText>{'$n(n+1)$'}</MathText> est le produit de deux entiers consécutifs : l’un des deux est pair,
              donc le produit l’est toujours. En revanche <MathText>{'$n^{2}$'}</MathText> dépend de la parité de n.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Les critères, démontrés : un critère est un découpage. */
    3: [
      {
        id: 'criteres-divisibilite',
        type: 'regles',
        title: 'Les critères de divisibilité',
        summary: 'Dernier chiffre pour 2, 5, 10 ; deux derniers pour 4 ; somme des chiffres pour 3 et 9.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><span className="font-bold text-slate-800">2, 5, 10</span><span className="text-slate-600">le dernier chiffre</span></div>
              <div className="flex justify-between gap-3"><span className="font-bold text-slate-800">4</span><span className="text-slate-600">les deux derniers chiffres</span></div>
              <div className="flex justify-between gap-3"><span className="font-bold text-slate-800">3 et 9</span><span className="text-slate-600">la somme des chiffres</span></div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Multiple de 9 ⇒ multiple de 3, mais pas l’inverse : 2 346 a pour somme 15, multiple de 3 seulement.
            </div>
          </div>
        ),
      },
      {
        id: 'critere-est-decoupage',
        type: 'concepts',
        title: 'Un critère est un découpage, pas une astuce',
        summary: 'On sépare le nombre en une part toujours multiple, et un reste qui décide seul.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">4 725 = 9 × 523 + 18</div>
              <div className="text-xs text-slate-500">
                Chaque chiffre d apporte d × 10<sup>k</sup> = d × (10<sup>k</sup> − 1) + d, et 9, 99, 999… sont des
                multiples de 9. Il ne reste que la somme des chiffres.
              </div>
            </div>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">n = 100 × k + (deux derniers chiffres)</div>
              <div className="text-xs text-slate-500">100 = 4 × 25 : les centaines n’ont aucune influence sur la divisibilité par 4.</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : 4 725 découpé, et la colonne « multiple de 9 » qui se remplit toute seule.</div>
          </div>
        ),
      },
    ],

    /* M4 — Multiples communs : PPCM et PGCD, chacun né d'une question
       concrète. */
    4: [
      {
        id: 'ppcm',
        type: 'concepts',
        title: 'PPCM — le prochain rendez-vous',
        summary: 'Le plus petit multiple commun de deux nombres : quand deux rythmes se retrouvent.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">PPCM(12 ; 18) = 36</div>
              <div className="text-xs text-slate-500">36 = 12 × 3 = 18 × 2 : le premier instant commun.</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Le produit 12 × 18 = 216 est bien un multiple commun, mais pas le plus petit : les deux nombres
              partagent des facteurs. Quand ils n’en partagent aucun (6 et 35), le produit est le PPCM.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux bus, et les marques qui se superposent.</div>
          </div>
        ),
      },
      {
        id: 'pgcd',
        type: 'concepts',
        title: 'PGCD — le plus grand morceau qui tombe juste',
        summary: 'Le plus grand diviseur commun : le plus grand carreau qui pave sans découpe.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">PGCD(84 ; 126) = 42</div>
              <div className="text-xs text-slate-500">84 = 42 × 2 et 126 = 42 × 3 : la pièce est pavée par 2 × 3 = 6 carreaux.</div>
            </div>
            <p className="text-sm text-slate-600">
              Le côté du carreau doit tomber juste sur les deux dimensions : c’est un <strong>diviseur commun</strong>,
              et « le plus grand possible » en fait le PGCD.
            </p>
          </div>
        ),
      },
      {
        id: 'methode-reconnaitre-ppcm-pgcd',
        type: 'methodes',
        title: 'Reconnaître s’il faut un PPCM ou un PGCD',
        summary: 'Un rendez-vous, un cycle qui se répète → PPCM. Un partage sans reste, un découpage → PGCD.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2">
              <div className="rounded-xl bg-white border border-emerald-200 p-3">
                <div className="text-xs font-bold uppercase text-emerald-600">PPCM</div>
                <div className="text-sm text-slate-700">« Quand se retrouvent-ils ? » — le résultat est plus grand que les deux nombres.</div>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-3">
                <div className="text-xs font-bold uppercase text-emerald-600">PGCD</div>
                <div className="text-sm text-slate-700">« Quel est le plus grand morceau qui tombe juste ? » — le résultat est plus petit que les deux nombres.</div>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Deux clubs se réunissant tous les 8 et 12 jours se retrouvent dans 24 jours (PPCM), pas 96 ni 4.
            </div>
          </div>
        ),
      },
    ],

    /* M5 (ex-M6) — Démontrer : la chaîne complète d'une démonstration
       arithmétique, et ce qu'une preuve n'est pas. */
    5: [
      {
        id: 'methode-demonstration-arithmetique',
        type: 'methodes',
        title: 'La chaîne d’une démonstration arithmétique',
        summary: 'Écrire l’hypothèse avec une lettre, transformer, conclure par la définition.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li><strong>Écrire l’hypothèse</strong> avec une lettre : a = 7k et b = 7k′.</li>
              <li><strong>Transformer</strong> : a + b = 7k + 7k′ = 7(k + k′).</li>
              <li><strong>Vérifier</strong> que le facteur restant est bien un entier.</li>
              <li><strong>Conclure par la définition</strong> : « 7 × un entier, donc multiple de 7 ».</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">Autre exemple : trois entiers consécutifs</div>
              <MathText>{'$n + (n+1) + (n+2) = 3n + 3 = 3(n + 1)$'}</MathText>
              <div className="text-xs text-slate-500">un multiple de 3, quel que soit n.</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les cinq lignes de la preuve, remises dans l’ordre.</div>
          </div>
        ),
      },
      {
        id: 'regle-exemples-pas-preuve',
        type: 'regles',
        title: 'Des exemples ne sont jamais une preuve',
        summary: 'Une conclusion peut être juste alors que la preuve qui la soutient ne l’est pas.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">« n² + n + 1 est toujours impair, car 3, 7, 13, 21 le sont »</div>
              <div className="text-sm text-slate-700">Conclusion juste, preuve invalide.</div>
              <div className="text-xs text-slate-500">
                La vraie preuve : <MathText>{'$n(n+1)$'}</MathText> est pair (deux entiers consécutifs), donc
                <MathText>{'$n(n+1) + 1$'}</MathText> est impair.
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Les exemples peuvent tromper : <MathText>{'$n^{2} + n + 41$'}</MathText> est premier pour n = 0 à 39,
              et composé pour n = 40.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-conclure-par-definition',
        type: 'memoriser',
        title: '⭐ Conclure par la définition',
        summary: 'Faire apparaître « p × un entier », puis le dire.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <MathText>{'$7k + 7k\' = 7(k + k\')$'}</MathText>
              <div className="text-sm font-bold text-rose-700">7 × un entier ⇒ multiple de 7</div>
            </div>
            <p className="text-xs text-slate-500 text-center">La factorisation fait le travail ; la définition conclut.</p>
          </div>
        ),
      },
    ],
  },
};
