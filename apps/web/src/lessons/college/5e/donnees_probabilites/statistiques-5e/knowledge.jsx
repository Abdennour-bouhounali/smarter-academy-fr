import React from 'react';
import { ENQUETE, tableau, datasetInit, fr } from './components/statistiques';

/**
 * Connaissances de la leçon « Statistiques » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés. Deux présentations
 * consomment ces données : le tiroir « Ma carte » et l'« À retenir » de fin de
 * module ; la synthèse du test final affiche la carte complète. Aucun module
 * n'écrit son propre résumé (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE, dans l'ordre où la carte se construit — c'est la
 * chaîne du programme, et chaque maillon rend le suivant possible :
 *
 *     donnée / série        (M1)
 *            ↓
 *     effectif              (M2)
 *            ↓
 *     fréquence             (M3) ←── effectif comparé au TOTAL
 *            ↓
 *     représentation        (M4 barres, M5 secteurs)
 *            ↓
 *     moyenne               (M6)
 *            ↓
 *     interprétation        (M7) — ce que la moyenne ne dit pas
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. La fréquence n'apparaît donc pas avant le module
 * 3, le diagramme circulaire pas avant le 5 (il a besoin de la fréquence), et
 * la moyenne pas avant le 6.
 */

/* Le tableau de l'enquête, non interactif — réutilisé par plusieurs items.
   Il vient du MÊME noyau de calcul que le laboratoire : la carte ne peut
   pas afficher d'autres nombres que ceux que l'élève a manipulés. */
const LIGNES = tableau(datasetInit());

const MiniTableau = ({ colonne = 'effectif' }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr>
          <th className="border-2 border-slate-200 bg-slate-50 px-2 py-1.5 text-left font-semibold text-slate-600">
            Livres lus
          </th>
          {LIGNES.map((l) => (
            <th key={l.valeur} className="border-2 border-slate-200 bg-slate-50 px-2 py-1.5 font-mono font-bold text-slate-800">
              {l.valeur}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th className="border-2 border-slate-200 bg-slate-50 px-2 py-1.5 text-left font-semibold text-slate-600">
            {colonne === 'effectif' ? 'Effectif' : 'Fréquence'}
          </th>
          {LIGNES.map((l) => (
            <td key={l.valeur} className="border-2 border-slate-200 px-2 py-1.5 text-center font-mono tabular-nums text-slate-800">
              {colonne === 'effectif' ? l.effectif : `${l.effectif}/12`}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Ce qu'est une donnée, et pourquoi le vrac ne dit rien. Ni
       effectif (M2), ni fréquence (M3), ni graphique (M4). */
    1: [
      {
        id: 'serie-donnees',
        type: 'concepts',
        title: 'Une série de données',
        summary: 'Une question posée à plusieurs personnes produit une série : une réponse par personne, dans le désordre de la récolte.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              On a demandé à <strong>12 élèves</strong> : «&nbsp;{ENQUETE.question}&nbsp;»
              Chacun a donné <strong>une</strong> réponse. Ces 12 réponses forment la{' '}
              <strong>série de données</strong> de l’enquête :
            </p>
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3">
              <div className="font-mono text-sm text-slate-700 text-center leading-relaxed">
                {ENQUETE.bruts.map(([, v]) => v).join(' · ')}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-indigo-100 p-3 text-sm text-slate-700">
              Telle quelle, cette liste ne répond à aucune question. Elle contient pourtant
              <strong> toute</strong> l’information : rien ne sera ajouté par la suite, tout ce
              qu’on va faire, c’est la <strong>ranger</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les douze réponses en vrac.</div>
          </div>
        ),
      },
      {
        id: 'vocab-serie',
        type: 'vocabulaire',
        title: 'Population, individu, caractère',
        summary: 'On interroge une population ; chaque individu donne sa valeur pour le caractère étudié.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ul className="space-y-1.5">
              <li>• La <strong>population</strong> : les 12 élèves interrogés ;</li>
              <li>• un <strong>individu</strong> : un élève, par exemple Noé ;</li>
              <li>• le <strong>caractère</strong> étudié : le nombre de livres lus ;</li>
              <li>• une <strong>valeur</strong> : la réponse d’un individu, par exemple 5.</li>
            </ul>
            <p className="text-slate-500">
              Changer de population change la série — mais la question, elle, reste la même.
            </p>
          </div>
        ),
      },
    ],

    /* M2 — L'effectif. Compter, et rien de plus : la comparaison au total
       est le sujet du module 3. */
    2: [
      {
        id: 'effectif',
        type: 'vocabulaire',
        title: 'L’effectif d’une valeur',
        summary: 'L’effectif d’une valeur, c’est le nombre d’individus qui ont donné cette réponse.',
        visual: <MiniTableau colonne="effectif" />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-violet-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                <strong>4 élèves</strong> ont lu 2 livres. On dit que l’effectif de la valeur{' '}
                <strong className="font-mono">2</strong> est <strong className="font-mono">4</strong>.
              </div>
              <div className="text-xs text-slate-500">
                Attention à ne pas confondre : <strong className="font-mono">2</strong> est la
                valeur (des livres), <strong className="font-mono">4</strong> est l’effectif (des
                élèves). Ce ne sont pas les mêmes objets qu’on compte.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              L’<strong>effectif total</strong> est le nombre d’individus de la population : ici
              <strong className="font-mono"> 12</strong>. C’est aussi la somme de tous les
              effectifs — et cette égalité sert de <strong>contrôle</strong> : si elle tombe
              faux, on a oublié ou compté deux fois quelqu’un.
            </p>
          </div>
        ),
      },
      {
        id: 'tableau-effectifs',
        type: 'methodes',
        title: 'Ranger une série dans un tableau',
        summary: 'Une colonne par valeur rencontrée, une ligne d’effectifs — et la série devient lisible.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="space-y-1 list-decimal list-inside">
              <li>Repérer les <strong>valeurs différentes</strong> de la série ;</li>
              <li>les ranger dans l’ordre croissant ;</li>
              <li>compter, pour chacune, combien d’individus l’ont donnée ;</li>
              <li>vérifier que la somme des effectifs vaut l’effectif total.</li>
            </ol>
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-slate-600">
              Une valeur que <strong>personne</strong> n’a donnée n’a pas de colonne : dans notre
              enquête, aucun élève n’a lu 4 livres, et le tableau ne parle pas de 4.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — La fréquence : l'effectif RAPPORTÉ au total. */
    3: [
      {
        id: 'frequence',
        type: 'concepts',
        title: 'La fréquence',
        summary: 'La fréquence d’une valeur, c’est son effectif divisé par l’effectif total : elle dit quelle PART du groupe a répondu ça, en fraction ou en pourcentage.',
        visual: <MiniTableau colonne="frequence" />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-amber-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                fréquence = effectif ÷ effectif total
              </div>
              <div className="text-xs text-slate-500">
                4 élèves sur 12 ont lu 2 livres : la fréquence est{' '}
                <strong className="font-mono">4/12</strong>. La même part s’écrit aussi en{' '}
                <strong>pourcentage</strong> — 4 ÷ 12 ≈ 0,333, soit{' '}
                <strong className="font-mono">33,3 %</strong>. Un tiers du groupe.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Un effectif seul ne se compare pas d’une enquête à l’autre : 4 élèves sur 12, ce
              n’est pas 4 élèves sur 300. La fréquence, elle, <strong>se compare</strong> —
              c’est exactement ce pour quoi elle existe.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-frequences',
        type: 'memoriser',
        title: '⭐ La somme des fréquences fait toujours 1',
        summary: 'Toutes les parts d’un même tout, mises bout à bout, refont le tout entier.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                Σ effectifs = effectif total &nbsp;·&nbsp; Σ fréquences = 1
              </div>
              <div className="text-sm text-slate-600 font-semibold font-mono">
                1/12 + 3/12 + 4/12 + 3/12 + 1/12 = 12/12 = 1
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              En pourcentages, la somme fait 100 %. Si elle ne tombe pas juste, c’est un
              effectif oublié — jamais un arrondi de plus de 1 %.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — La première représentation : les barres. Elles comparent des
       effectifs, ce qui n'exige que le module 2. */
    4: [
      {
        id: 'diagramme-barres',
        type: 'methodes',
        title: 'Le diagramme en barres',
        summary: 'Une barre par valeur, de hauteur proportionnelle à l’effectif : les comparaisons se voient d’un coup d’œil.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-sky-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                La barre de la valeur <strong className="font-mono">2</strong> est{' '}
                <strong>quatre fois</strong> plus haute que celle de la valeur{' '}
                <strong className="font-mono">5</strong>, parce que 4 élèves contre 1.
              </div>
              <div className="text-xs text-slate-500">
                C’est la <strong>hauteur</strong> qui porte l’information. Elle doit donc partir
                de <strong>zéro</strong> : une échelle qui commence à 3 rendrait un écart minuscule
                spectaculaire, et le graphique mentirait sans écrire un seul chiffre faux.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Les barres répondent à : <em>quelle valeur revient le plus souvent&nbsp;? combien
              d’écart entre celle-ci et celle-là&nbsp;?</em>
            </p>
          </div>
        ),
      },
      {
        id: 'donnees-invariantes',
        type: 'regles',
        title: 'Ranger n’est pas changer',
        summary: 'Trier une série, ou changer de graphique, ne modifie aucun effectif, aucune fréquence, aucune moyenne.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Les 12 réponses restent les 12 mêmes réponses, quel que soit l’ordre dans lequel on
              les écrit. <strong>Trier</strong> sert à voir, pas à transformer.
            </p>
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-slate-600">
              En revanche, <strong>ajouter</strong> ou <strong>supprimer</strong> un individu
              change la population — donc l’effectif total, les fréquences, et la moyenne. Ce
              n’est plus la même enquête.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Les secteurs. Ils ont besoin de la FRÉQUENCE (M3) : c'est
       pourquoi ils ne peuvent pas venir avant. */
    5: [
      {
        id: 'diagramme-circulaire',
        type: 'methodes',
        title: 'Le diagramme circulaire',
        summary: 'Le disque entier représente la population ; chaque secteur reçoit un angle proportionnel à sa fréquence.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                angle = fréquence × 360°
              </div>
              <div className="text-xs text-slate-500">
                4 élèves sur 12, c’est un tiers du groupe : le secteur mesure{' '}
                <strong className="font-mono">4/12 × 360° = 120°</strong>. Le tour complet, 360°,
                joue pour le disque le rôle que l’effectif total joue pour la population.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              C’est une situation de <strong>proportionnalité</strong> : doubler la fréquence
              double l’angle. La somme des angles fait toujours <strong>360°</strong>, comme la
              somme des fréquences fait 1.
            </p>
          </div>
        ),
      },
      {
        id: 'choisir-representation',
        type: 'regles',
        title: 'Choisir le bon graphique',
        summary: 'Les barres comparent des quantités entre elles ; les secteurs montrent des parts d’un tout.',
        body: (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 space-y-1">
                <div className="text-sm font-bold text-sky-800">📊 Barres</div>
                <div className="text-xs text-slate-600">
                  « Quelle valeur revient le plus ? » « Combien d’écart entre les deux ? »
                </div>
              </div>
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 space-y-1">
                <div className="text-sm font-bold text-emerald-800">🥧 Secteurs</div>
                <div className="text-xs text-slate-600">
                  « Quelle part du groupe ? » « Est-ce plus ou moins de la moitié ? »
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Le camembert n’a de sens que si les parts forment un <strong>tout</strong>. Pour
              suivre une évolution dans le temps, aucun des deux ne convient : il faut une courbe.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — La moyenne, construite comme un partage équitable. */
    6: [
      {
        id: 'moyenne',
        type: 'concepts',
        title: 'La moyenne',
        summary: 'La moyenne, c’est ce que chacun aurait si l’on redistribuait tout équitablement.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                25 livres ÷ 12 élèves ≈ {fr(25 / 12)} livre par élève
              </div>
              <div className="text-xs text-slate-500">
                On met tous les livres en tas — il y en a 25 — et on les repartage également entre
                les 12 élèves. Chacun en reçoit environ <strong>2,08</strong>.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              La moyenne <strong>remplace</strong> toutes les valeurs par une seule, sans changer
              le total. C’est un résumé : pratique, et incomplet.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-moyenne',
        type: 'memoriser',
        title: '⭐ Moyenne = somme des valeurs ÷ effectif total',
        summary: 'On additionne tout, on partage par le nombre d’individus.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                moyenne = somme des valeurs ÷ effectif total
              </div>
              <div className="text-sm text-slate-600 font-semibold font-mono">
                (0+1+1+1+2+2+2+2+3+3+3+5) ÷ 12 = 25 ÷ 12 ≈ 2,08
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Le dénominateur est le nombre d’<strong>individus</strong> (12), jamais le nombre de
              valeurs différentes (5).
            </p>
          </div>
        ),
      },
    ],

    /* M7 — L'interprétation. Elle a besoin de TOUT ce qui précède. */
    7: [
      {
        id: 'interpreter',
        type: 'methodes',
        title: 'Interpréter une série',
        summary: 'La moyenne seule ne suffit jamais : il faut la relire avec les données qui l’ont produite.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Deux classes peuvent avoir <strong>exactement la même moyenne</strong> et n’avoir
              rien à voir : dans l’une, tout le monde est proche de la moyenne ; dans l’autre,
              la moitié est à 0 et l’autre au double.
            </p>
            <div className="bg-white rounded-xl border border-rose-100 p-3 space-y-1.5">
              <div className="text-slate-700 font-semibold">Trois questions à se poser :</div>
              <ul className="space-y-1 text-slate-600">
                <li>• La moyenne est-elle une valeur que quelqu’un a réellement donnée ?</li>
                <li>• Les données sont-elles <strong>groupées</strong> autour d’elle, ou étalées ?</li>
                <li>• Une <strong>valeur extrême</strong> tire-t-elle la moyenne à elle seule ?</li>
              </ul>
            </div>
            <p className="text-slate-500">
              Interpréter, c’est répondre <strong>dans le contexte</strong> : « en moyenne 2,08
              livre » se dit « la plupart des élèves ont lu 1, 2 ou 3 livres ».
            </p>
          </div>
        ),
      },
      {
        id: 'mem-interpreter',
        type: 'memoriser',
        title: '⭐ Un résumé ne remplace pas les données',
        summary: 'La moyenne dit le niveau général ; elle ne dit rien de la répartition.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                Je calcule, puis je regarde les données
              </div>
              <div className="text-sm text-slate-600 font-semibold">
                Même moyenne ≠ même série.
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
};
