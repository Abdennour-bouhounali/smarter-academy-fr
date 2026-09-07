import React from 'react';
import { fmt } from './components/operations';

/**
 * Connaissances de la leçon « Opérations sur les nombres relatifs » (4e) —
 * SOURCE UNIQUE. Chaque module déclare ce qu'il APPORTE à la carte ; la carte
 * que voit l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées au module
 * qui le déclare. La règle des signes n'apparaît qu'au module 2 — après que la
 * table l'a rendue inévitable — la parité au module 3, le quotient au 4, les
 * priorités au 5.
 *
 * Ce que cette carte NE contient PAS : le sens du nombre relatif, l'opposé, la
 * comparaison, l'addition et la soustraction. Ce sont les acquis de 5e, listés
 * dans `priorKnowledge` et diagnostiqués par le module 0.
 */

/** Petit tableau des quatre cas, réutilisé par les items. */
const QuatreCas = () => (
  <div className="grid grid-cols-2 gap-1.5 text-sm">
    {[
      ['+ × +', '+', 'text-indigo-700'],
      ['+ × −', '−', 'text-rose-600'],
      ['− × +', '−', 'text-rose-600'],
      ['− × −', '+', 'text-indigo-700'],
    ].map(([cas, res, c]) => (
      <div key={cas} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
        <span className="font-mono text-slate-600">{cas}</span>
        <span className={`font-black ${c}`}>{res}</span>
      </div>
    ))}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — La régularité de la table. Aucun énoncé de règle : seulement le
       constat que l'écart reste constant, et ce qu'il impose. */
    1: [
      {
        id: 'regularite-table',
        type: 'concepts',
        title: 'La régularité de la table',
        summary: 'Dans une colonne de la table de multiplication, l’écart entre deux cases consécutives est toujours le même.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              En descendant la colonne de <strong>{fmt(-3)}</strong>, chaque case vaut{' '}
              <strong>3 de plus</strong> que la précédente :
            </p>
            <div className="rounded-xl border border-indigo-100 bg-white p-3 font-mono text-sm text-slate-700 space-y-0.5">
              <div>{fmt(-3)} × 2 = {fmt(-6)}</div>
              <div>{fmt(-3)} × 1 = {fmt(-3)}<span className="text-emerald-600 text-xs"> (+3)</span></div>
              <div>{fmt(-3)} × 0 = 0<span className="text-emerald-600 text-xs"> (+3)</span></div>
              <div className="text-indigo-700 font-bold">{fmt(-3)} × {fmt(-1)} = 3<span className="text-emerald-600 text-xs font-normal"> (+3)</span></div>
            </div>
            <p className="text-sm text-slate-700">
              Sous le zéro, la régularité ne s’arrête pas. Elle <strong>impose</strong> la valeur
              suivante : il n’y a pas de choix à faire.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la colonne que tu as prolongée case par case.</div>
          </div>
        ),
      },
    ],

    /* M2 — La règle des signes, énoncée comme la CONSÉQUENCE du module 1. */
    2: [
      {
        id: 'regle-des-signes',
        type: 'regles',
        title: 'La règle des signes',
        summary: 'Deux facteurs de même signe donnent un produit positif ; de signes contraires, un produit négatif.',
        visual: <QuatreCas />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Pour multiplier deux relatifs, on procède en <strong>deux temps</strong> :
            </p>
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>multiplier les <strong>distances à zéro</strong> (les nombres sans leur signe) ;</li>
              <li>décider du <strong>signe</strong> : même signe → positif, signes contraires → négatif.</li>
            </ol>
            <div className="rounded-xl border-2 border-orange-200 bg-white p-3 space-y-1 text-sm">
              <div className="text-slate-700"><strong>{fmt(-4)} × {fmt(-7)}</strong> : 4 × 7 = 28, et deux négatifs → <strong className="text-indigo-700">28</strong></div>
              <div className="text-slate-700"><strong>{fmt(-4)} × 7</strong> : 4 × 7 = 28, signes contraires → <strong className="text-rose-600">{fmt(-28)}</strong></div>
            </div>
            <p className="text-xs text-slate-500">
              Ce n’est pas une convention arbitraire : c’est la seule façon de prolonger la table
              sans casser sa régularité.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — La parité, qui généralise la règle à n facteurs. */
    3: [
      {
        id: 'parite-facteurs',
        type: 'methodes',
        title: 'Compter les facteurs négatifs',
        summary: 'Le signe d’un produit ne dépend que du NOMBRE de facteurs négatifs : pair → positif, impair → négatif.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Avec plusieurs facteurs, inutile d’appliquer la règle deux par deux : il suffit de
              <strong> compter les facteurs négatifs</strong>.
            </p>
            <div className="rounded-xl border border-sky-100 bg-white p-3 space-y-1.5 text-sm">
              <div className="text-slate-700">
                {fmt(-2)} × {fmt(-3)} × {fmt(-5)} → <strong>3 négatifs</strong> (impair) →{' '}
                <strong className="text-rose-600">{fmt(-30)}</strong>
              </div>
              <div className="text-slate-700">
                {fmt(-2)} × {fmt(-3)} × 5 → <strong>2 négatifs</strong> (pair) →{' '}
                <strong className="text-indigo-700">30</strong>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Un seul facteur nul rend tout le produit nul, quel que soit le reste.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-parite',
        type: 'memoriser',
        title: '⭐ Pair → +, impair → −',
        summary: 'Compte les facteurs négatifs : leur parité donne le signe.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                Nombre PAIR de négatifs → produit positif
              </div>
              <div className="text-lg sm:text-xl font-black text-rose-700">
                Nombre IMPAIR → produit négatif
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Le signe se décide avant même de calculer la valeur.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — Le quotient, qui suit la même règle. */
    4: [
      {
        id: 'quotient-relatifs',
        type: 'regles',
        title: 'Diviser deux relatifs',
        summary: 'La division suit exactement la même règle des signes que la multiplication.',
        visual: <QuatreCas />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 space-y-1 text-sm">
              <div className="text-slate-700"><strong>{fmt(-20)} ÷ {fmt(-4)}</strong> : 20 ÷ 4 = 5, deux négatifs → <strong className="text-indigo-700">5</strong></div>
              <div className="text-slate-700"><strong>{fmt(-20)} ÷ 4</strong> : 20 ÷ 4 = 5, signes contraires → <strong className="text-rose-600">{fmt(-5)}</strong></div>
            </div>
            <p className="text-sm text-slate-700">
              Ce n’est pas une coïncidence : diviser, c’est chercher le facteur manquant d’une
              multiplication. Si {fmt(-20)} ÷ {fmt(-4)} valait {fmt(-5)}, alors {fmt(-4)} × {fmt(-5)}
              devrait faire {fmt(-20)} — or la table dit 20.
            </p>
            <p className="text-sm text-slate-600">
              On ne divise jamais par <strong>zéro</strong> : aucun nombre multiplié par 0 ne donne
              autre chose que 0.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — L'ordre des opérations sur les relatifs. */
    5: [
      {
        id: 'priorites-relatifs',
        type: 'regles',
        title: 'L’ordre des opérations',
        summary: 'Dans un enchaînement, × et ÷ se calculent avant + et −, de gauche à droite.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-rose-200 bg-white p-3 space-y-2 text-sm">
              <div className="font-mono text-slate-700">{fmt(-3)} + (+4) × ({fmt(-2)})</div>
              <div className="text-slate-600">
                On calcule d’abord <strong>4 × ({fmt(-2)}) = {fmt(-8)}</strong>,
                puis <strong>{fmt(-3)} + ({fmt(-8)}) = {fmt(-11)}</strong>.
              </div>
              <div className="text-xs text-rose-600">
                De gauche à droite, on trouverait {fmt(-2)} : un autre résultat, et le mauvais.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              L’ordre n’est pas un détail de présentation : il <strong>change la valeur</strong>.
            </p>
          </div>
        ),
      },
      {
        id: 'controle-du-signe',
        type: 'methodes',
        title: 'Contrôler le signe avant de calculer',
        summary: 'Décider du signe attendu avant de poser le calcul permet de repérer une erreur tout de suite.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Avant de calculer <strong>{fmt(-8)} + ({fmt(-3)}) × ({fmt(-4)})</strong>, on peut déjà
              dire que le produit sera <strong>positif</strong> (deux négatifs) et vaudra 12 : le
              résultat sera donc {fmt(-8)} + 12, un nombre positif.
            </p>
            <p className="text-slate-500">
              Un signe inattendu est presque toujours le signe d’une règle oubliée, pas d’un calcul
              raté.
            </p>
          </div>
        ),
      },
    ],
  },
};
