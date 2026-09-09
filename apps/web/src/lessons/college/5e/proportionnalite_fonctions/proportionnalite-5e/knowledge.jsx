import React from 'react';

/**
 * Connaissances de la leçon « Proportionnalité » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés. Deux présentations
 * consomment ces données : le tiroir « Ma carte » et l'« À retenir » de fin de
 * module ; la synthèse du test final affiche la carte complète. Aucun module
 * n'écrit son propre résumé (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE, dans l'ordre où la carte se construit :
 *
 *     relation entre grandeurs        (M1)
 *              ↓
 *     coefficient de proportionnalité (M2)
 *              ↓
 *     tableau de proportionnalité     (M3)
 *              ↓
 *        ┌─────┴──────┬───────────────┐
 *     échelle(M4)  pourcentage(M5)  graphique(M6)
 *        └─────┬──────┴───────────────┘
 *              ↓
 *     vitesse moyenne — le coefficient a une unité (M7)
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. Le mot « coefficient » n'apparaît donc pas au
 * module 1, et aucun item ne mentionne le produit en croix (4e) ni les
 * fonctions linéaires (3e).
 */

/** Deux colonnes d'un tableau, non interactif — réutilisé par les items. */
const MiniTable = ({ head, rows, k, ton = 'sky' }) => {
  const TON = {
    sky: 'border-sky-300 bg-sky-50',
    violet: 'border-violet-300 bg-violet-50',
    emerald: 'border-emerald-300 bg-emerald-50',
  };
  return (
    <div className={`rounded-xl border-2 overflow-x-auto ${TON[ton]}`}>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className={i > 0 ? 'border-t border-white/70' : ''}>
              <th scope="row" className="text-left font-semibold text-slate-600 px-3 py-1.5 whitespace-nowrap">
                {r.label}
              </th>
              {r.cells.map((c, j) => (
                <td key={j} className="px-3 py-1.5 font-mono font-bold tabular-nums text-slate-800 text-center">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {k != null && (
        <div className="bg-white/70 px-3 py-1.5 text-xs text-center text-slate-600 border-t border-white">
          {head}
        </div>
      )}
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — la relation entre deux grandeurs, et le test qui la départage.
       Ni le mot « coefficient » (M2), ni tableau (M3), ni graphique (M6). */
    1: [
      {
        id: 'grandeurs-liees',
        type: 'concepts',
        title: 'Deux grandeurs qui varient ensemble',
        summary: 'Dans beaucoup de situations, quand une grandeur change, une autre change avec elle — mais pas toujours de la même façon.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Le sirop et la piscine <strong>montent tous les deux</strong> quand on augmente
              l’entrée. Pourtant, ils ne racontent pas la même histoire :
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-center space-y-0.5">
                <div className="text-xs font-semibold text-slate-500">4 verres → 8 verres</div>
                <div className="font-mono text-base font-black text-emerald-700">0,6 L → 1,2 L</div>
                <div className="text-xs font-bold text-emerald-700">le double</div>
              </div>
              <div className="rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-2 text-center space-y-0.5">
                <div className="text-xs font-semibold text-slate-500">4 entrées → 8 entrées</div>
                <div className="font-mono text-base font-black text-rose-700">28 € → 36 €</div>
                <div className="text-xs font-bold text-rose-700">pas le double</div>
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le doseur — les deux barres montaient, une seule doublait.
            </div>
          </div>
        ),
      },
      {
        id: 'proportionnalite',
        type: 'vocabulaire',
        title: 'Une situation de proportionnalité',
        summary: 'Quand on double l’une, l’autre double ; quand on triple l’une, l’autre triple. C’est cela, être proportionnel.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Le sirop est <strong>proportionnel</strong> au nombre de verres : deux fois plus de
              verres, deux fois plus de sirop. Dix fois plus de verres, dix fois plus de sirop.
            </p>
            <p>
              La dépense à la piscine <strong>ne l’est pas</strong> : la carte se paie une seule
              fois, elle ne double pas avec les entrées.
            </p>
            <p className="text-slate-500">
              « Ça augmente quand j’augmente » ne suffit donc jamais à conclure. Le test, c’est le
              <strong> doublement</strong>.
            </p>
          </div>
        ),
      },
    ],

    /* M2 — le coefficient. Il est DÉCOUVERT comme le rapport constant. */
    2: [
      {
        id: 'coefficient-proportionnalite',
        type: 'regles',
        title: 'Le coefficient de proportionnalité',
        summary: 'Dans une situation proportionnelle, la sortie divisée par l’entrée donne toujours le même nombre : c’est le coefficient.',
        visual: (
          <MiniTable
            ton="violet"
            head="0,6 ÷ 4 = 0,15   ·   0,9 ÷ 6 = 0,15   ·   1,5 ÷ 10 = 0,15"
            k={0.15}
            rows={[
              { label: 'Verres', cells: [4, 6, 10] },
              { label: 'Sirop (L)', cells: ['0,6', '0,9', '1,5'] },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Quelle que soit la colonne, <strong className="font-mono">sortie ÷ entrée</strong>{' '}
              donne <strong className="font-mono">0,15</strong>. Ce nombre ne bouge pas : c’est lui
              qui <em>est</em> la situation — ici, 0,15 L de sirop par verre.
            </p>
            <div className="bg-white rounded-xl border-2 border-violet-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                Il s’utilise <strong>dans les deux sens</strong> :
              </div>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>• de l’entrée vers la sortie : <span className="font-mono">× 0,15</span> ;</li>
                <li>• de la sortie vers l’entrée : <span className="font-mono">÷ 0,15</span>.</li>
              </ul>
            </div>
            <p className="text-sm text-slate-500">
              Une situation qui n’est pas proportionnelle n’a <strong>pas</strong> de coefficient :
              les rapports qu’on calcule ne tombent pas sur le même nombre.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-coefficient',
        type: 'memoriser',
        title: '⭐ Un seul nombre, dans les deux sens',
        summary: 'sortie = entrée × k, et entrée = sortie ÷ k.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                entrée &nbsp;<span className="text-slate-500">— × k →</span>&nbsp; sortie
              </div>
              <div className="text-lg sm:text-xl font-black text-rose-700">
                entrée &nbsp;<span className="text-slate-500">← ÷ k —</span>&nbsp; sortie
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Pour trouver k : prends une colonne complète, et divise la sortie par l’entrée.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — le tableau, et les trois chemins vers la case vide. */
    3: [
      {
        id: 'tableau-proportionnalite',
        type: 'methodes',
        title: 'Compléter un tableau de proportionnalité',
        summary: 'Trois chemins mènent à la case vide, et ils donnent tous le même nombre.',
        visual: (
          <MiniTable
            ton="sky"
            head="4 croissants coûtent 4,80 € ; combien coûtent 10 croissants ?"
            k={1.2}
            rows={[
              { label: 'Croissants', cells: [4, 10] },
              { label: 'Prix (€)', cells: ['4,80', '?'] },
            ]}
          />
        ),
        body: (
          <div className="space-y-3">
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                • <strong>Par l’unité</strong> : 4,80 ÷ 4 = 1,20 € le croissant, puis
                1,20 × 10 = <strong>12 €</strong>.
              </li>
              <li>
                • <strong>Par le facteur</strong> : de 4 à 10, on multiplie par 2,5 ; donc
                4,80 × 2,5 = <strong>12 €</strong>.
              </li>
              <li>
                • <strong>Par le coefficient</strong> : k = 1,20, donc
                10 × 1,20 = <strong>12 €</strong>.
              </li>
            </ul>
            <p className="text-sm text-slate-500">
              Ce sont trois récits du même calcul. On choisit celui dont les nombres sont les plus
              commodes — pas celui qu’on a appris en dernier.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — l'échelle : un coefficient donné, qu'on ne choisit pas. */
    4: [
      {
        id: 'echelle',
        type: 'regles',
        title: 'L’échelle d’une carte',
        summary: 'Une échelle 1/25 000 dit que 1 cm sur la carte représente 25 000 cm en vrai.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                Sur une carte au <strong className="font-mono">1/25 000</strong> :
              </div>
              <div className="text-sm font-mono text-slate-700">
                4 cm × 25 000 = 100 000 cm = 1 000 m = <strong>1 km</strong>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              L’échelle est un <strong>coefficient de proportionnalité</strong> comme un autre —
              sauf qu’il est <em>écrit sur la carte</em> : on ne le cherche pas, on l’applique.
            </p>
            <p className="text-sm text-slate-500">
              Le passage aux mètres ou aux kilomètres est une <strong>conversion</strong>, pas
              l’échelle : d’abord multiplier, ensuite convertir.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — le pourcentage, vu comme un coefficient. */
    5: [
      {
        id: 'pourcentage',
        type: 'regles',
        title: 'Prendre un pourcentage',
        summary: 'Prendre t % d’une quantité, c’est la multiplier par t ÷ 100.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-rose-200 p-3 space-y-1.5">
              <div className="text-sm font-mono text-slate-700">
                30 % de 40 € = 40 × 0,30 = <strong>12 €</strong>
              </div>
              <div className="text-xs text-slate-500">
                « pour cent » veut dire « sur cent » : 30 % = 30 ÷ 100 = 0,30.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Un pourcentage est donc lui aussi un <strong>coefficient</strong> : appliquer 30 %,
              c’est multiplier par 0,30.
            </p>
          </div>
        ),
      },
      {
        id: 'remise',
        type: 'methodes',
        title: 'Enlever un pourcentage',
        summary: 'Une remise de 30 % laisse 70 % du prix : on multiplie par 0,70, pas par 0,30.',
        body: (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-center space-y-0.5">
                <div className="text-xs font-semibold text-slate-500">En deux temps</div>
                <div className="font-mono text-sm font-bold text-slate-800">40 − 12 = 28 €</div>
              </div>
              <div className="rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-2 text-center space-y-0.5">
                <div className="text-xs font-semibold text-slate-500">En une fois</div>
                <div className="font-mono text-sm font-bold text-rose-700">40 × 0,70 = 28 €</div>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              <strong>100 % − 30 % = 70 %</strong> : ce qui reste après la remise. Le prix soldé
              s’obtient d’un seul coup, en multipliant par <strong className="font-mono">0,70</strong>.
            </p>
            <p className="text-sm text-slate-500">
              Multiplier par 0,30 donnerait la <em>réduction</em> (12 €), pas le prix à payer.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — le graphique. C'est la nouveauté de la 5e (hors programme en 6e). */
    6: [
      {
        id: 'graphique-proportionnalite',
        type: 'regles',
        title: 'Reconnaître la proportionnalité sur un graphique',
        summary: 'Les points d’une situation proportionnelle sont alignés — et leur droite passe par l’origine.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Les deux conditions comptent, et la seconde est celle qu’on oublie :
            </p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>• les points sont <strong>alignés</strong> ;</li>
              <li>• la droite passe par l’<strong>origine</strong>, le point (0 ; 0).</li>
            </ul>
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 text-sm text-slate-600">
              Les points de la piscine sont alignés eux aussi — mais leur droite part de 20 € pour
              0 entrée. Elle <strong>ne passe pas par l’origine</strong> : la situation n’est pas
              proportionnelle.
            </div>
            <p className="text-sm text-slate-500">
              C’est logique : 0 verre, c’est 0 L de sirop. Une situation proportionnelle donne
              toujours <strong>0 pour 0</strong>.
            </p>
          </div>
        ),
      },
    ],

    /* M7 — la vitesse : le coefficient porte une unité. */
    7: [
      {
        id: 'vitesse-moyenne',
        type: 'formules',
        title: 'La vitesse moyenne',
        summary: 'La vitesse moyenne est la distance divisée par la durée — un coefficient qui porte une unité.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-amber-200 p-3 space-y-1.5">
              <div className="text-sm font-mono text-slate-700">
                180 km ÷ 3 h = <strong>60 km/h</strong>
              </div>
              <div className="text-xs text-slate-500">
                C’est exactement le calcul « sortie ÷ entrée » du coefficient — appliqué à une
                distance et à une durée.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Il s’emploie dans les deux sens, comme tout coefficient :
              <span className="font-mono"> distance = vitesse × durée</span>, et{' '}
              <span className="font-mono">durée = distance ÷ vitesse</span>.
            </p>
            <p className="text-sm text-slate-500">
              Le mot <strong>moyenne</strong> est important : le car n’a pas roulé à 60 km/h à
              chaque instant. 60 km/h est la vitesse <em>constante</em> qui aurait donné le même
              trajet dans le même temps.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-vitesse',
        type: 'memoriser',
        title: '⭐ Une unité qui dit le calcul',
        summary: '« km/h » se lit « kilomètres par heure », et rappelle la division à faire.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                km / h &nbsp;=&nbsp; kilomètres ÷ heures
              </div>
              <div className="text-sm text-slate-600 font-semibold">
                L’unité du coefficient raconte l’opération.
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Pareil pour le sirop : 0,15 <strong>L par verre</strong>, c’est bien des litres
              divisés par des verres.
            </p>
          </div>
        ),
      },
    ],
  },
};
