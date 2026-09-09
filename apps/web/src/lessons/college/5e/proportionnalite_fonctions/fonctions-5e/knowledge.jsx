import React from 'react';

/**
 * Connaissances de la leçon « Fonctions » (5e) — SOURCE UNIQUE.
 *
 * La carte que voit l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE, dans l'ordre où la carte se construit :
 *
 *     grandeur d'entrée / grandeur qui suit  (M1)
 *              ↓
 *     une entrée → une seule sortie          (M1)
 *              ↓
 *     « en fonction de »                     (M2)
 *              ↓
 *     tableau de valeurs                     (M3) ←── programme de calcul (M3)
 *              ↓
 *     un couple = un point                   (M4)
 *              ↓
 *     lire un graphique                      (M5)
 *
 * PÉRIMÈTRE, absolu : aucun item n'emploie f(x), « image » ou « antécédent ».
 * Ce sont des objets de 3e (`teachingScope.exclude`). La 5e construit
 * l'intuition ; elle ne la formalise pas.
 */

/** Un petit tableau de valeurs, non interactif — réutilisé par les items. */
const MiniTable = ({ head, xs, ys, xLabel, yLabel, ton = 'sky' }) => {
  const TON = {
    sky: 'border-sky-300 bg-sky-50',
    violet: 'border-violet-300 bg-violet-50',
    emerald: 'border-emerald-300 bg-emerald-50',
  };
  return (
    <div className={`rounded-xl border-2 overflow-hidden ${TON[ton]}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <th scope="row" className="text-left font-semibold text-slate-600 px-3 py-1.5 whitespace-nowrap">
                {xLabel}
              </th>
              {xs.map((x) => (
                <td key={x} className="px-3 py-1.5 font-mono font-bold tabular-nums text-slate-800 text-center">
                  {x}
                </td>
              ))}
            </tr>
            <tr className="border-t border-white/70">
              <th scope="row" className="text-left font-semibold text-slate-600 px-3 py-1.5 whitespace-nowrap">
                {yLabel}
              </th>
              {ys.map((y, i) => (
                <td key={xs[i]} className="px-3 py-1.5 font-mono font-bold tabular-nums text-slate-800 text-center">
                  {y}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {head && (
        <div className="bg-white/70 px-3 py-1.5 text-xs text-center text-slate-600 border-t border-white">
          {head}
        </div>
      )}
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — la dépendance elle-même, et son invariant. */
    1: [
      {
        id: 'dependance',
        type: 'concepts',
        title: 'Une grandeur qui dépend d’une autre',
        summary: 'Dans une situation, on règle une grandeur — et d’autres suivent, sans qu’on ait à les régler.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Au four, tu ne règles qu’<strong>une seule chose</strong> : la durée. La couleur, la
              masse et la température, elles, <em>suivent</em>.
            </p>
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 text-center font-semibold">
                durée de cuisson &nbsp;→&nbsp; couleur, masse, température
              </div>
              <div className="text-xs text-slate-500 text-center">
                Une grandeur commande, les autres dépendent d’elle.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Attention : dépendre ne veut pas dire <em>augmenter ensemble</em>. Quand la durée
              monte, la masse <strong>descend</strong> — le pain perd de l’eau. Elle dépend
              pourtant bien de la durée.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : une seule molette, trois grandeurs qui bougent.
            </div>
          </div>
        ),
      },
      {
        id: 'meme-entree-meme-sortie',
        type: 'regles',
        title: 'Une même entrée redonne la même sortie',
        summary: 'Si tu remets exactement le même réglage, tu obtiens exactement le même résultat.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono text-center">
                12 min &nbsp;→&nbsp; toujours le même pain
              </div>
              <div className="text-xs text-slate-500">
                Peu importe combien de fois tu y reviens : à 12 minutes, la couleur, la masse et la
                température reprennent les mêmes valeurs.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              C’est ce qui rend une dépendance <strong>utile</strong> : on peut la noter une fois,
              et s’en servir ensuite pour prévoir.
            </p>
            <p className="text-sm text-slate-500">
              L’inverse n’est pas vrai : une même sortie peut venir de plusieurs entrées
              différentes — on le verra sur un graphique.
            </p>
          </div>
        ),
      },
    ],

    /* M2 — la phrase qui dit la dépendance, et son sens. */
    2: [
      {
        id: 'en-fonction-de',
        type: 'vocabulaire',
        title: 'L’expression « en fonction de »',
        summary: 'On dit « la couleur en fonction de la durée » : d’abord ce qui suit, ensuite ce qui commande.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-violet-200 p-3 space-y-2">
              <div className="text-sm text-slate-700 text-center">
                <strong>la couleur</strong>{' '}
                <span className="text-violet-600 font-semibold">en fonction de</span>{' '}
                <strong>la durée</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-center">
                <div className="rounded-lg bg-violet-50 px-2 py-1.5 text-slate-600">
                  ce qui <strong>suit</strong>
                </div>
                <div className="rounded-lg bg-violet-50 px-2 py-1.5 text-slate-600">
                  ce qui <strong>commande</strong>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              L’ordre des mots porte le sens. « La durée en fonction de la couleur » dirait le
              contraire — et ce n’est pas ce qui se passe dans le four : c’est bien la durée qu’on
              règle.
            </p>
            <p className="text-sm text-slate-500">
              La grandeur qui commande s’appelle la <strong>grandeur d’entrée</strong>.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-en-fonction-de',
        type: 'memoriser',
        title: '⭐ Ce qui suit, en fonction de ce qui commande',
        summary: 'La phrase se lit toujours dans cet ordre.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-base sm:text-lg font-black text-rose-700">
                … <span className="text-slate-500">en fonction de</span> …
              </div>
              <div className="text-sm text-slate-600 font-semibold">
                ce qui dépend &nbsp;·&nbsp; ce qu’on règle
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Test : peux-tu régler la seconde grandeur directement ? Si oui, elle est bien
              l’entrée.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — ranger la dépendance, et la produire. */
    3: [
      {
        id: 'tableau-de-valeurs',
        type: 'methodes',
        title: 'Le tableau de valeurs',
        summary: 'Une ligne pour l’entrée, une ligne pour la sortie : chaque colonne est un couple.',
        visual: (
          <MiniTable
            ton="sky"
            xLabel="Durée (min)"
            yLabel="Température (°C)"
            xs={[0, 5, 10, 15]}
            ys={[20, 40, 60, 80]}
            head="À 10 minutes correspond 60 °C — on lit la colonne."
          />
        ),
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Un tableau de valeurs range une dépendance : la ligne du haut porte la grandeur
              d’entrée, celle du bas ce qui en dépend.
            </p>
            <p>
              Il se lit <strong>par colonne</strong> : on cherche l’entrée sur la première ligne,
              et on descend.
            </p>
            <p className="text-slate-500">
              Un tableau ne montre que quelques valeurs. Pour les autres, il faut la règle — ou le
              graphique.
            </p>
          </div>
        ),
      },
      {
        id: 'programme-de-calcul',
        type: 'methodes',
        title: 'Le programme de calcul',
        summary: 'Une suite d’instructions appliquée au nombre d’entrée : elle engendre tout le tableau.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-sky-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-semibold">
                « Choisis un nombre, multiplie-le par 3, puis ajoute 2. »
              </div>
              <div className="text-xs text-slate-500 font-mono">
                4 → 4 × 3 = 12 → 12 + 2 = <strong>14</strong>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Le programme dit <strong>comment</strong> la sortie se calcule. En l’appliquant à
              plusieurs nombres, on remplit le tableau de valeurs autant qu’on veut.
            </p>
            <p className="text-sm text-slate-500">
              Le nombre choisi au départ est l’entrée ; le nombre obtenu à la fin est ce qui en
              dépend.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — du couple au point. */
    4: [
      {
        id: 'couple-point',
        type: 'regles',
        title: 'Chaque couple devient un point',
        summary: 'La colonne (10 ; 60) du tableau se place au point d’abscisse 10 et d’ordonnée 60.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Pour dessiner une dépendance, on met la grandeur d’<strong>entrée</strong> sur l’axe
              horizontal, et celle qui en <strong>dépend</strong> sur l’axe vertical.
            </p>
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono text-center">
                colonne (10 ; 60) &nbsp;→&nbsp; point (10 ; 60)
              </div>
              <div className="text-xs text-slate-500 text-center">
                10 vers la droite, 60 vers le haut.
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Une fois tous les points placés, leur alignement — ou leur courbe — raconte la
              situation d’un seul coup d’œil.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — lire, et répondre à une vraie question. */
    5: [
      {
        id: 'lire-graphique',
        type: 'methodes',
        title: 'Lire une valeur sur un graphique',
        summary: 'On part de l’axe de l’entrée, on monte jusqu’à la courbe, puis on lit à gauche.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>Repérer la valeur d’entrée sur l’axe horizontal ;</li>
              <li>monter (ou descendre) jusqu’à rencontrer la courbe ;</li>
              <li>lire la valeur correspondante sur l’axe vertical.</li>
            </ol>
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 text-sm text-slate-600">
              Le graphique répond à des questions que le tableau ne couvre pas : entre deux
              mesures, on suit la courbe.
            </div>
          </div>
        ),
      },
      {
        id: 'plusieurs-instants',
        type: 'concepts',
        title: 'Une même sortie, plusieurs entrées',
        summary: 'Une valeur d’entrée n’a qu’une sortie — mais une sortie peut correspondre à plusieurs entrées.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Dans la salle, il fait <strong>22 °C</strong> à deux moments de la journée : une fois
              le matin en montant, une fois le soir en redescendant.
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-center">
                <div className="text-xs font-semibold text-slate-500">Une heure donnée</div>
                <div className="font-bold text-emerald-700">une seule température</div>
              </div>
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-center">
                <div className="text-xs font-semibold text-slate-500">Une température donnée</div>
                <div className="font-bold text-amber-700">parfois plusieurs heures</div>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Les deux sens ne se valent pas : c’est pour cela qu’on précise toujours quelle
              grandeur dépend de laquelle.
            </p>
          </div>
        ),
      },
    ],
  },
};
