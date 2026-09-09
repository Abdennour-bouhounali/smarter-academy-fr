import React from 'react';
import { eur, pct, coefTexte, coefficientMultiplicateur, ATELIERS } from './components/prop4e';

/**
 * Connaissances de la leçon « Proportionnalité » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     cinq lectures concordantes (M1)
 *          ↓                       ↘
 *     produit en croix (M2)      critère graphique (M5)
 *          ↓
 *     coefficient multiplicateur (M3)
 *          ↓
 *     évolutions successives (M4) → valeur initiale (M4)
 *
 * Le critère graphique dépend de M1 (il faut avoir vu les cinq lectures) mais
 * pas du produit en croix : il est placé en M5 parce qu'il CONCLUT la leçon
 * par une décision, pas parce qu'il en dépendrait.
 *
 * Ce que cette carte NE contient PAS : le coefficient de proportionnalité, le
 * tableau, l'échelle, le pourcentage d'une quantité, la vitesse moyenne. Ce
 * sont les acquis de 5e, listés dans `priorKnowledge` et diagnostiqués au
 * module 0. Elle ne contient pas non plus les fonctions linéaires ni k²/k³ :
 * ce sont des objets de 3e.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/** Les cinq lectures d'une même relation, empilées. */
const CinqLectures = () => {
  const A = ATELIERS.aLaCommande;
  const xs = [2, 4, 6];
  return (
    <div className="space-y-1 rounded-xl border border-indigo-100 bg-white p-2.5 text-[13px]">
      {[
        ['objets', `${xs[1]} affiches`],
        ['table', xs.map((x) => `${x}→${A.apply(x)}`).join('  ')],
        ['rapport', `${A.apply(xs[1])} ÷ ${xs[1]} = ${A.k}`],
        ['coefficient', `× ${A.k}`],
        ['points', 'alignés avec (0 ; 0)'],
      ].map(([nom, valeur]) => (
        <div key={nom} className="flex items-baseline justify-between gap-3">
          <span className="text-[11px] uppercase tracking-wide text-slate-400">{nom}</span>
          <span className="font-mono text-slate-700">{valeur}</span>
        </div>
      ))}
    </div>
  );
};

/** Le tableau à quatre cases et ses deux diagonales. */
const Croix = ({ a = 3, b = 7, c = 5, d = '?' }) => (
  <div className="rounded-xl border border-violet-100 bg-white p-2.5">
    <table className="mx-auto text-center font-mono text-sm">
      <tbody>
        <tr>
          <td className="border border-slate-300 px-3 py-1.5 text-slate-700">{a}</td>
          <td className="border border-slate-300 px-3 py-1.5 text-slate-700">{b}</td>
        </tr>
        <tr>
          <td className="border border-slate-300 px-3 py-1.5 text-slate-700">{c}</td>
          <td className="border border-amber-400 bg-amber-50 px-3 py-1.5 font-bold text-amber-700">{d}</td>
        </tr>
      </tbody>
    </table>
    <p className="mt-1.5 text-center font-mono text-[13px] text-slate-600">
      {a} × {d} = {b} × {c}
    </p>
  </div>
);

/** Deux droites : l'une passe par l'origine, l'autre non. */
const DeuxDroites = () => (
  <div className="rounded-xl border border-purple-100 bg-white p-2">
    <svg viewBox="0 0 150 90" className="w-full" role="img"
         aria-label="Deux droites : l’une passe par l’origine, l’autre coupe l’axe plus haut">
      <line x1="18" y1="76" x2="142" y2="76" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="18" y1="8" x2="18" y2="76" stroke="#94a3b8" strokeWidth="1.5" />
      {/* proportionnelle : part du coin */}
      <line x1="18" y1="76" x2="130" y2="20" stroke="#4338ca" strokeWidth="2.5" />
      {/* non proportionnelle : démarre plus haut */}
      <line x1="18" y1="52" x2="130" y2="14" stroke="#b45309" strokeWidth="2.5" strokeDasharray="5 3" />
      <circle cx="18" cy="76" r="3" fill="#4338ca" />
      <circle cx="18" cy="52" r="3" fill="#b45309" />
    </svg>
    <div className="flex justify-between px-1 text-[11px]">
      <span className="text-indigo-700">— passe par (0 ; 0)</span>
      <span className="text-amber-700">--- démarre plus haut</span>
    </div>
  </div>
);

/** Une évolution vue comme une multiplication. */
const Coefficients = () => (
  <div className="space-y-1 rounded-xl border border-sky-100 bg-white p-2.5 font-mono text-[13px]">
    {[0.2, 0.04, -0.3, -0.45].map((t) => (
      <div key={t} className="flex items-center justify-between gap-3">
        <span className={t > 0 ? 'text-rose-700' : 'text-emerald-700'}>{pct(t)}</span>
        <span className="text-slate-400">→</span>
        <span className="font-bold text-slate-800">{coefTexte(coefficientMultiplicateur(t))}</span>
      </div>
    ))}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Ce qu'on vient de VOIR : cinq lectures qui s'accordent, ou pas.
       Aucune méthode n'est encore donnée. */
    1: [
      {
        id: 'cinq-lectures',
        type: 'concepts',
        title: 'Cinq lectures d’une même relation',
        summary:
          'Objets, table, rapport, coefficient et nuage de points disent la même chose. Quand la situation n’est pas proportionnelle, les cinq cessent d’être d’accord ensemble.',
        visual: <CinqLectures />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Dans une situation proportionnelle, le <strong>rapport</strong> entre les deux
              grandeurs ne change jamais. C’est ce rapport constant qu’on appelle le{' '}
              <strong>coefficient</strong>, et c’est lui qui fait tenir les cinq lectures ensemble.
            </p>
            <p className="text-sm text-slate-700">
              Attention au piège : <strong>« ça monte » ne suffit pas</strong>. Un prix qui
              comprend une part fixe monte aussi, régulièrement — mais le prix d’un seul objet y
              change à chaque commande.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              Chez Cléo, une affiche coûte toujours {eur(ATELIERS.aLaCommande.k)}. Chez Bruno,
              elle coûte {eur(ATELIERS.avecMiseEnRoute.apply(2) / 2)} si on en prend 2, et{' '}
              {eur(ATELIERS.avecMiseEnRoute.apply(10) / 10)} si on en prend 10.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux ateliers d’affiches, et la colonne des rapports.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — L'outil, posé APRÈS qu'on a rencontré le cas où il sert. */
    2: [
      {
        id: 'produit-en-croix',
        type: 'regles',
        title: 'L’égalité des produits en croix',
        summary:
          'Dans un tableau de proportionnalité, les deux produits en diagonale sont égaux. Cette égalité donne la case manquante.',
        visual: <Croix />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-violet-200 bg-white p-3 text-center">
              <span className="font-mono text-lg font-black text-violet-700">a × d = b × c</span>
            </div>
            <p className="text-sm text-slate-700">
              Pour trouver une case vide : on multiplie les deux nombres de la diagonale{' '}
              <strong>complète</strong>, puis on divise par celui qui reste.
            </p>
            <p className="text-sm text-slate-700">
              Elle sert aussi à <strong>vérifier</strong> : si les deux produits diffèrent, le
              tableau n’est pas proportionnel, et y appliquer la croix donnerait un résultat faux.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Quand un passage simple existe — de 2 à 6 on multiplie par 3 —, le calcul de tête va
              plus vite. La croix sert quand aucun raccourci ne tombe juste.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : 3 affiches pour 7 €, et le prix de 5 affiches.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — L'évolution comme multiplication. */
    3: [
      {
        id: 'coefficient-multiplicateur',
        type: 'formules',
        title: 'Le coefficient multiplicateur',
        summary:
          'Augmenter de t %, c’est multiplier par 1 + t/100. Diminuer de t %, c’est multiplier par 1 − t/100.',
        visual: <Coefficients />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-center">
              <div className="font-mono text-base font-black text-sky-700">
                augmenter de 20 % → × 1,2
              </div>
              <div className="font-mono text-base font-black text-sky-700">
                diminuer de 20 % → × 0,8
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Le prix de départ compte pour <strong>1</strong> (soit 100 % de lui-même). On lui
              ajoute — ou on lui retire — la part indiquée par le pourcentage.
            </p>
            <p className="text-sm text-slate-700">
              Un coefficient <strong>plus grand que 1</strong> fait augmenter, un coefficient{' '}
              <strong>entre 0 et 1</strong> fait diminuer. Il n’est <strong>jamais négatif</strong> :
              une quantité qui baisse reste positive.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le nombre encadré qui franchissait 1 quand le prix cessait de monter.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-coefficient',
        type: 'memoriser',
        title: 'Les quatre coefficients à connaître',
        summary: '+10 % → ×1,1 · −10 % → ×0,9 · +25 % → ×1,25 · −50 % → ×0,5',
        body: (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {[[0.1], [-0.1], [0.25], [-0.5]].map(([t]) => (
                <div key={t} className="rounded-lg border border-slate-200 bg-white p-2 text-center">
                  <div className={t > 0 ? 'text-rose-700' : 'text-emerald-700'}>{pct(t)}</div>
                  <div className="font-bold text-slate-800">{coefTexte(coefficientMultiplicateur(t))}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Le réflexe : « 100 % plus ou moins le pourcentage », puis on déplace la virgule.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — Les deux conséquences de M3 : composer, et remonter. */
    4: [
      {
        id: 'evolutions-successives',
        type: 'regles',
        title: 'Deux évolutions à la suite',
        summary:
          'Les coefficients se MULTIPLIENT. C’est pourquoi +20 % puis −20 % ne ramène pas au départ, mais à 96 % de celui-ci.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-center font-mono text-sm">
              <div className="font-black text-emerald-800">1,2 × 0,8 = 0,96</div>
              <div className="mt-1 text-slate-600">soit −4 %, et non 0 %</div>
            </div>
            <p className="text-sm text-slate-700">
              La deuxième évolution porte sur la valeur <strong>déjà modifiée</strong>, pas sur
              celle du départ. Les pourcentages ne s’additionnent donc pas.
            </p>
            <p className="text-sm text-slate-700">
              Conséquence utile : pour annuler une hausse de 25 %, il faut une baisse de{' '}
              <strong>20 %</strong> — celle dont le coefficient 0,8 est l’inverse de 1,25.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le vélo qui refusait de revenir à son prix.
            </div>
          </div>
        ),
      },
      {
        id: 'valeur-initiale',
        type: 'methodes',
        title: 'Retrouver la valeur de départ',
        summary: 'On connaît l’arrivée et le coefficient : on DIVISE par le coefficient.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-center font-mono text-sm">
              <div className="text-slate-600">départ × coefficient = arrivée</div>
              <div className="mt-1 font-black text-emerald-800">départ = arrivée ÷ coefficient</div>
            </div>
            <p className="text-sm text-slate-700">
              Après une remise de 20 %, un article coûte 48 € : ce 48 est le résultat de{' '}
              <strong>× 0,8</strong>. On remonte donc par <strong>48 ÷ 0,8 = 60 €</strong>.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’erreur à éviter : ajouter 20 % à 48 €. Les 20 % avaient été calculés sur le prix
              d’avant, plus élevé — pas sur le prix affiché.
            </div>
            <p className="text-sm text-slate-600">
              Toujours <strong>vérifier</strong> : 60 × 0,8 = 48. Si on ne retombe pas sur
              l’arrivée, le sens du calcul était inversé.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — Le critère qui tranche, à partir du dessin. */
    5: [
      {
        id: 'critere-graphique',
        type: 'methodes',
        title: 'Décider sur un graphique',
        summary:
          'Les points d’une situation proportionnelle sont alignés ET leur droite passe par l’origine. L’alignement seul ne suffit pas.',
        visual: <DeuxDroites />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Une situation à part fixe donne aussi des points parfaitement alignés. Ce qui la
              trahit, c’est l’endroit d’où part sa droite : <strong>au-dessus de zéro</strong>.
            </p>
            <p className="text-sm text-slate-700">
              Le réflexe : chercher ce que vaut la deuxième grandeur quand la première vaut{' '}
              <strong>zéro</strong>. Si ce n’est pas zéro, ce n’est pas proportionnel.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux nuages posés point par point, et le coin de la feuille.
            </div>
          </div>
        ),
      },
    ],
  },
};
