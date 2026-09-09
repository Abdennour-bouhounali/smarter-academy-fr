import React from 'react';
import { ETAPES, etapesProgramme, etapesPreuveConsecutifs, STRATEGIES } from './components/raisonnement4e';

/**
 * Connaissances de la leçon « Raisonnement et résolution de problèmes » (4e)
 * — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     conjecture (M1)
 *          ↓
 *     des essais ne prouvent rien (M1)   ← le manque, créé par le geste
 *          ↓
 *     la preuve par la lettre (M1)       ← ce qui comble le manque
 *          ↓
 *     données utiles / inutiles (M2)
 *          ↓
 *     représenter (M3) → estimer (M3)
 *          ↓
 *     plusieurs stratégies (M4)
 *          ↓
 *     le contre-exemple (M5)             ← l'autre issue, dissymétrique
 *          ↓
 *     vérifier dans l'histoire (M6) → la phrase-réponse (M6)
 *
 * Rien n'y est arbitraire. Le contre-exemple (M5) ne peut pas précéder la
 * conjecture (M1) : c'est ce qu'on cherche POUR une conjecture. La preuve
 * littérale (M1) doit venir tout de suite après le manque, sans quoi le module
 * déclencheur laisse l'élève sur une frustration sans issue.
 *
 * Ce que cette carte NE contient PAS : le programme de calcul, la
 * substitution, la distributivité, la factorisation, le test d'une égalité, la
 * modélisation par une équation, le contrôle du sens. Ce sont les acquis
 * listés dans `priorKnowledge` (5e `fonctions-5e`, 4e `calcul-litteral-4e` et
 * `equations-4e`) et diagnostiqués au module 0. Elle ne contient pas non plus
 * les systèmes, l'équation produit nul, les identités remarquables ni les
 * inéquations : objets de 3e.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/**
 * Le programme mystère sur DEUX nombres, côte à côte : les valeurs
 * intermédiaires diffèrent, la dernière est la même. Les nombres sont CALCULÉS
 * par `etapesProgramme`, jamais écrits — la miniature ne peut donc pas
 * contredire le laboratoire.
 */
const DeuxEssais = () => {
  const a = etapesProgramme(4);
  const b = etapesProgramme(30);
  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-2.5">
      <table className="w-full text-center text-sm tabular-nums">
        <tbody>
          {[a, b].map((essai, i) => (
            <tr key={i}>
              {essai.map((e, j) => (
                <React.Fragment key={e.rang}>
                  {j > 0 && <td className="px-0.5 text-slate-300" aria-hidden="true">→</td>}
                  <td className={j === essai.length - 1
                    ? 'rounded-lg bg-indigo-100 px-1.5 py-1 font-black text-indigo-800'
                    : 'px-1.5 py-1 text-slate-600'}>
                    {e.valeur}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-center text-xs text-slate-500">
        deux départs, deux chemins, une seule arrivée
      </p>
    </div>
  );
};

/** Les trois écritures de la somme de trois consécutifs, calculées. */
const TroisEcritures = () => {
  const e = etapesPreuveConsecutifs(7);
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-2.5">
      <div className="space-y-1 text-center font-mono text-sm">
        <div className="text-slate-600">n + (n+1) + (n+2)</div>
        <div className="text-slate-400" aria-hidden="true">=</div>
        <div className="text-slate-700">{e[1].texte}</div>
        <div className="text-slate-400" aria-hidden="true">=</div>
        <div className="font-black text-purple-700">{e[2].texte}</div>
      </div>
      <p className="mt-1 text-center text-xs text-slate-500">
        toujours trois fois le nombre du milieu
      </p>
    </div>
  );
};

/** Les sept temps, en bandeau. */
const SeptTemps = () => (
  <div className="rounded-xl border border-blue-100 bg-white p-2.5">
    <ol className="flex flex-wrap justify-center gap-1">
      {ETAPES.map((e) => (
        <li key={e.id} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
          {e.rang}. {e.titre}
        </li>
      ))}
    </ol>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — La conjecture, le manque, et ce qui le comble. */
    1: [
      {
        id: 'conjecture',
        type: 'vocabulaire',
        title: 'Une conjecture',
        summary:
          'Une conjecture est une affirmation qu’on croit vraie parce qu’on l’a vérifiée sur des exemples — mais qu’on n’a pas encore démontrée.',
        visual: <DeuxEssais />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Tu as essayé plusieurs nombres et tu as vu la même chose à chaque fois. Cette
              observation mérite d’être écrite : c’est une <strong>conjecture</strong>.
            </p>
            <p className="text-sm text-slate-700">
              Le mot ne dit ni « vrai » ni « faux ». Il dit exactement où on en est : on a
              observé, on n’a pas encore établi.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : tes essais alignés dans le tableau, tous à 6.
            </div>
          </div>
        ),
      },
      {
        id: 'essais-ne-prouvent-pas',
        type: 'regles',
        title: 'Des essais ne prouvent rien',
        summary:
          'Cent essais réussis ne démontrent pas une conjecture : ils montrent seulement qu’on n’a pas encore trouvé de nombre qui la mette en défaut.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Il y a une infinité de nombres. Même en en essayant mille, il en reste une infinité
              qu’on n’a pas testés — et rien ne dit qu’un de ceux-là ne casserait pas tout.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              C’est pour cela que le tableau d’essais affiche toujours « ces essais ne prouvent
              rien », quel que soit leur nombre. Ce n’est pas de la sévérité : c’est exact.
            </div>
            <p className="text-sm text-slate-600">
              Un tableau d’essais sert quand même à quelque chose : il fait <em>naître</em> la
              conjecture, et il peut la faire <em>tomber</em>.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le compteur d’essais qui montait sans que le verdict change.
            </div>
          </div>
        ),
      },
      {
        id: 'preuve-par-la-lettre',
        type: 'methodes',
        title: 'Prouver avec une lettre',
        summary:
          'Remplacer le nombre de départ par une lettre, puis calculer : le résultat obtenu vaut alors pour TOUS les nombres à la fois.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              La lettre ne cache pas ici un nombre à trouver : elle représente{' '}
              <strong>n’importe quel nombre</strong>. Un calcul mené avec elle est donc un calcul
              mené sur tous les nombres en même temps.
            </p>
            <div className="rounded-xl border-2 border-indigo-200 bg-white p-3 text-center">
              <div className="font-mono text-base font-black text-indigo-700">
                2 × (n + 3) − 2 × n = 6
              </div>
              <div className="mt-1 text-xs text-slate-500">
                2n + 6 − 2n : les deux 2n se retirent, il ne reste que 6
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Un essai traite un cas. Une lettre les traite tous. C’est la seule façon de passer
              de « je n’ai pas trouvé de contre-exemple » à « il n’en existe pas ».
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux tuiles 2n qui s’annulent, et les 6 unités qui restent.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Lire l'énoncé pour de bon. */
    2: [
      {
        id: 'donnees-utiles',
        type: 'methodes',
        title: 'Les données utiles',
        summary:
          'Une information n’est utile que si elle sert à répondre à LA question posée. Un énoncé en contient souvent d’autres, qui ne servent à rien.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Le réflexe à casser : croire que si un nombre est écrit, il faut s’en servir. Un
              énoncé raconte une situation ; tous ses détails ne participent pas au calcul.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <p className="font-semibold text-slate-700">Le tri, en deux gestes :</p>
              <ol className="mt-1 space-y-0.5 text-slate-600">
                <li>1. relire la QUESTION, et elle seule ;</li>
                <li>2. pour chaque information, se demander « si je l’enlève, la réponse
                  change-t-elle ? ».</li>
              </ol>
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux cartes que tu as rangées dans le bac de droite.
            </div>
          </div>
        ),
      },
      {
        id: 'sept-temps',
        type: 'concepts',
        title: 'Les sept temps d’une résolution',
        summary:
          'Comprendre, extraire, représenter, choisir, calculer, vérifier, expliquer : le même enchaînement pour tous les problèmes.',
        visual: <SeptTemps />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Ce n’est pas une liste à réciter, c’est un ordre qui évite les impasses. On ne
              choisit pas une stratégie avant d’avoir vu la situation, et on ne calcule pas avant
              d’avoir choisi.
            </p>
            <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-sm">
              {ETAPES.map((e) => (
                <div key={e.id}>
                  <strong className="text-slate-700">{e.rang}. {e.titre}</strong>
                  <span className="ml-1 text-slate-500">{e.question}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Les deux derniers temps sont ceux qu’on saute le plus souvent — et ce sont eux qui
              font la différence entre un nombre et une réponse.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Voir avant de calculer. */
    3: [
      {
        id: 'representer',
        type: 'methodes',
        title: 'Représenter avant de calculer',
        summary:
          'Un schéma en barres ou un tableau transforme un texte en objet qu’on peut regarder : la relation entre les quantités devient visible.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Une phrase comme « un ballon coûte 4 € de plus qu’un filet » est difficile à
              manipuler. La même chose en barres se voit d’un coup : la barre du ballon est celle
              du filet, plus un petit bout de 4 €.
            </p>
            <div className="rounded-xl bg-sky-50 p-2.5 text-sm text-sky-900">
              Le schéma ne remplace pas le calcul : il dit <strong>quel</strong> calcul faire.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les cinq barres égales, plus le morceau de 12 € qui dépasse.
            </div>
          </div>
        ),
      },
      {
        id: 'estimer-avant',
        type: 'methodes',
        title: 'Estimer avant de calculer',
        summary:
          'Avant tout calcul, donner un ordre de grandeur. Si le résultat s’en écarte beaucoup, c’est qu’il y a une erreur quelque part.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              L’estimation ne cherche pas la bonne réponse : elle cherche la zone où elle doit
              tomber. Un filet ne peut pas coûter 74 € puisque le club en achète deux, plus trois
              ballons, pour ce prix-là.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Une estimation faite APRÈS le calcul n’en est plus une : on retrouve toujours son
              propre résultat plausible. Il faut la poser avant.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la fourchette que tu as choisie avant d’avoir le moindre nombre.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Plusieurs chemins valides. */
    4: [
      {
        id: 'plusieurs-strategies',
        type: 'concepts',
        title: 'Plusieurs stratégies, une seule réponse',
        summary:
          'Un problème admet souvent plusieurs méthodes qui aboutissent toutes. La bonne stratégie est celle qui va au bout, pas celle qu’on croit attendue.',
        body: (
          <div className="space-y-3">
            <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-sm">
              {STRATEGIES.map((s) => (
                <div key={s.id}>
                  <strong className="text-slate-700">{s.nom}</strong>
                  <span className="ml-1 text-slate-500">— {s.quand}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-700">
              Deux chemins différents qui arrivent au même nombre, c’est aussi une{' '}
              <strong>vérification</strong> : il serait très surprenant que deux erreurs
              différentes donnent le même résultat.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les essais organisés et l’équation, qui tombaient tous les deux juste.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — L'issue dissymétrique. */
    5: [
      {
        id: 'contre-exemple',
        type: 'regles',
        title: 'Le contre-exemple',
        summary:
          'UN seul cas où l’affirmation est fausse suffit à la réfuter définitivement. Réfuter est facile, prouver est difficile : les deux ne se ressemblent pas.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-purple-200 bg-white p-3 text-sm">
              <div className="text-slate-600">
                pour <strong>réfuter</strong> → un seul cas suffit, et c’est fini
              </div>
              <div className="mt-1 text-slate-600">
                pour <strong>prouver</strong> → aucun nombre de cas ne suffit, il faut la lettre
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Cette dissymétrie surprend, et pourtant elle est logique : « toujours » exige tous
              les cas, « pas toujours » n’en exige qu’un.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Un contre-exemple doit être <strong>vérifié</strong>, pas seulement proposé : on
              refait le calcul dessus, et on montre que l’affirmation tombe.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le premier nombre qui a fait basculer le verdict en « réfutée ».
            </div>
          </div>
        ),
      },
      {
        id: 'mem-prouver-refuter',
        type: 'memoriser',
        title: 'Un seul cas contre, tous les cas pour',
        summary:
          'Réfuter : un contre-exemple. Prouver : une lettre. Jamais l’inverse — et jamais des exemples pour prouver.',
        visual: <TroisEcritures />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              La somme de trois entiers consécutifs vaut{' '}
              <strong>trois fois celui du milieu</strong>. Ce n’est pas une observation : c’est
              une conséquence du calcul, et elle vaut pour tous les entiers d’un coup.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              La même somme n’est en revanche pas toujours paire — et il a suffi d’un entier pour
              le montrer. Deux affirmations sur le même objet, deux issues différentes.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — Finir le travail. */
    6: [
      {
        id: 'verifier-dans-l-histoire',
        type: 'methodes',
        title: 'Vérifier dans l’histoire',
        summary:
          'On remet la valeur trouvée dans l’énoncé de départ et on regarde si tout retombe juste — pas dans la dernière ligne du calcul.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Refaire le dernier calcul ne sert à rien : s’il était faux, il le sera encore. La
              vérification utile revient <strong>au tout début</strong>.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <p className="font-semibold text-slate-700">Sur l’achat du club :</p>
              <ol className="mt-1 space-y-0.5 text-slate-600">
                <li>1. un filet à 12,40 € → un ballon à 16,40 € ;</li>
                <li>2. 3 ballons et 2 filets : 3 × 16,40 + 2 × 12,40 ;</li>
                <li>3. on doit retomber sur les 74 € de l’énoncé.</li>
              </ol>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Avant même ce contrôle, un réflexe : le résultat est-il <em>possible</em> ? Un prix
              négatif, une longueur plus grande que le tout, un nombre de personnes à virgule —
              cela se voit sans aucun calcul.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux lignes du contrôle, toutes les deux au vert.
            </div>
          </div>
        ),
      },
      {
        id: 'phrase-reponse',
        type: 'memoriser',
        title: 'La phrase-réponse',
        summary:
          'Un nombre nu n’est pas une réponse. On écrit une phrase qui reprend la question, donne la valeur et son unité.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-rose-200 bg-white p-3 text-sm">
              <div className="text-slate-400 line-through">12,4</div>
              <div className="mt-1 font-semibold text-rose-800">
                « Un filet coûte 12,40 €. »
              </div>
            </div>
            <p className="text-sm text-slate-700">
              La phrase force trois contrôles d’un coup : de quoi parle-t-on, quelle valeur, quelle
              unité. C’est là qu’on s’aperçoit qu’on a calculé le prix d’un ballon au lieu de
              celui d’un filet.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              Et un résultat qui ne tombe pas rond n’est pas suspect pour autant : 12,40 € est un
              prix parfaitement ordinaire.
            </div>
          </div>
        ),
      },
    ],
  },
};
