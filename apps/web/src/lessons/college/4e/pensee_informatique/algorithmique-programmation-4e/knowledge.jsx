import React from 'react';
import ProgramView4e from './components/ProgramView4e';
import TraceCanvas4e from './components/TraceCanvas4e';
import {
  executer, makeRepeat, makeSi, avancer, tourner, affecter, condition, lit, formule,
} from '../../../../common/turtle/trace4e';

/**
 * Connaissances de la leçon « Algorithmique et programmation » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit l'élève
 * est la réduction cumulative des modules validés. Deux présentations
 * consomment ces données : le tiroir « Ma carte » et l'« À retenir » de fin de
 * module ; la synthèse du test final affiche la carte complète. Aucun module
 * n'écrit son propre résumé (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     l'ÉTAT d'un programme à un instant  (M1)
 *              ↓                    ── sans lui, rien de la suite n'est observable
 *     exécuter PAS À PAS  (M1)
 *              ↓
 *     l'instruction « si… alors… sinon »  (M2)
 *              ↓                    ── une seule branche s'exécute
 *     le CHEMIN dépend de la valeur testée  (M2)
 *              ↓
 *     ÉCRIRE une condition, et la vérifier À SA BORNE  (M3)
 *              ↓
 *     l'AFFECTATION : une variable qu'on écrit  (M4)
 *              ↓
 *     le COMPTEUR : i ← i + 1  (M4)
 *              ↓
 *     modifier un programme sans le réécrire  (M5)
 *              ↓
 *     réparer : le PREMIER écart désigne la faute  (M6)
 *
 * Rien n'y est arbitraire : on ne peut pas comprendre qu'une seule branche
 * s'exécute (M2) sans savoir arrêter le programme au milieu (M1) ; on ne peut
 * pas écrire une condition (M3) sans avoir lu ce qu'un SI fait (M2) ; et le
 * compteur (M4) n'est observable que par le pas-à-pas de M1.
 *
 * CE QUE CETTE CARTE NE CONTIENT PAS. L'instruction paramétrée, la méthode
 * « prévoir puis exécuter », la variable LUE, l'entrée, la formule, la boucle
 * « répéter n fois » et le lien 360 ÷ n : ce sont les acquis de 5e, listés
 * dans `priorKnowledge` et diagnostiqués au module 0. La méthode générale de
 * débogage (`deboguer`) en fait partie aussi — la 4e ne la redécouvre pas,
 * elle l'applique à des pannes qu'un tracé seul ne révèle pas.
 *
 * PÉRIMÈTRE. Aucun item ne parle de boucle « tant que », de condition composée
 * (ET / OU) ni de bloc défini par l'élève : ce sont les matières de la 3e
 * (lesson.config.js, teachingScope.exclude), et le moteur ne sait pas les
 * exprimer.
 */

/* Les figures des items sont CALCULÉES par le moteur, jamais dessinées à la
   main : un item ne peut donc pas illustrer autre chose que ce qu'il énonce. */
const CARRE = [makeRepeat(4, [avancer(60), tourner(90)])];

const CHOIX = [
  makeRepeat(4, [
    makeSi(condition(lit('n'), '>', 4), [avancer(70)], [avancer(35)]),
    tourner(90),
  ]),
];

const SPIRALE = [
  affecter('i', 20),
  makeRepeat(6, [avancer(lit('i')), tourner(90), affecter('i', formule('i', { plus: 20 }))]),
];

/** Deux exécutions du MÊME programme, côte à côte : le choix se voit. */
const DeuxChemins = () => (
  <div className="grid grid-cols-2 gap-2">
    {[3, 7].map((n) => (
      <div key={n} className="space-y-1 rounded-xl border-2 border-sky-200 bg-white p-1.5">
        <TraceCanvas4e
          resultat={executer(CHOIX, { env: { n } })}
          hauteur={110}
          montrerStylo={false}
          montrerDepart={false}
          teinterBranches
          fond="uni"
          titre={`le programme avec n = ${n}`}
        />
        <p className="text-center font-mono text-[11px] font-bold text-sky-800">
          n = {n} → branche « {n > 4 ? 'alors' : 'sinon'} »
        </p>
      </div>
    ))}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'état, et le pas à pas. Tout le reste en dépend. */
    1: [
      {
        id: 'etat-programme',
        type: 'concepts',
        title: 'L’état d’un programme',
        summary:
          'À chaque instant, un programme a une position, une direction et des variables. C’est cet état — et non le dessin fini — qui explique ce qui se passe.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un dessin terminé ne dit pas comment il a été fait. Deux programmes très
              différents peuvent produire exactement la même figure ; pour les distinguer, il
              faut regarder ce qu’ils avaient « dans la tête » en chemin.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { t: 'Position', v: '(60 ; 0)', c: 'text-slate-900' },
                { t: 'Cap', v: '270°', c: 'text-slate-900' },
                { t: 'Variables', v: 'i = 40', c: 'text-purple-800' },
              ].map((x) => (
                <div key={x.t} className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{x.t}</p>
                  <p className={`font-mono text-base font-black tabular-nums ${x.c}`}>{x.v}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-700">
              Ces trois lectures forment l’<strong>état</strong> du programme. Le tracé n’en est
              que la trace : c’est l’état qui avance, et le trait qui suit.
            </p>
          </div>
        ),
      },
      {
        id: 'pas-a-pas',
        type: 'methodes',
        title: 'Exécuter pas à pas',
        summary:
          'On arrête le programme après chaque instruction et on lit son état. C’est la seule façon de voir ce qu’un dessin fini cache — et le seul outil qui rende une variable observable.',
        visual: <ProgramView4e programme={CARRE} titre={null} compact />,
        body: (
          <div className="space-y-3">
            <ol className="list-inside list-decimal space-y-1.5 text-sm text-slate-700">
              <li>Partir du départ : rien n’est encore exécuté.</li>
              <li>Avancer d’<strong>une</strong> instruction, et seulement une.</li>
              <li>Lire la position, le cap et les variables à cet instant.</li>
              <li>Comparer avec ce qu’on avait prévu, puis recommencer.</li>
            </ol>
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/60 p-3 text-sm text-slate-700">
              Attention à ne pas confondre deux nombres : le programme du carré s’<strong>écrit</strong>{' '}
              en 2 instructions, mais il en <strong>exécute</strong> 8. La boucle multiplie
              l’exécution, pas l’écriture.
            </div>
            <p className="text-sm text-slate-500">
              C’est aussi ce qui rend la réparation possible : sans pas-à-pas, un programme faux
              se relit au hasard.
            </p>
          </div>
        ),
      },
    ],

    /* M2 — L'instruction qui choisit. Le cœur du niveau. */
    2: [
      {
        id: 'si-alors-sinon',
        type: 'vocabulaire',
        title: 'SI… ALORS… SINON',
        summary:
          'Un bloc qui contient un test et deux suites d’instructions. Le programme évalue le test, puis exécute UNE des deux branches — jamais les deux.',
        visual: <ProgramView4e programme={CHOIX} env={{ n: 7 }} titre={null} compact />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Jusqu’ici, un programme faisait tout ce qui était écrit, dans l’ordre. Ce bloc
              change cela : <strong>tout est écrit, mais tout n’est pas exécuté</strong>.
            </p>
            <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-sm text-slate-700">
              <div className="font-mono text-xs font-bold text-sky-900">
                SI ⟨test⟩ ALORS [ … ] SINON [ … ]
              </div>
              <p className="mt-1.5">
                Si le test est <strong>vrai</strong>, la branche « alors » s’exécute et l’autre
                est sautée. S’il est <strong>faux</strong>, c’est l’inverse. La branche « sinon »
                peut être vide : le programme ne fait alors simplement rien de plus.
              </p>
            </div>
            <div className="rounded-xl border-2 border-amber-200 bg-white p-3 text-sm text-slate-700">
              <strong className="text-amber-800">L’erreur à ne plus faire :</strong> croire que
              les deux branches s’exécutent l’une après l’autre. Au pas-à-pas, on compte les
              instructions exécutées — il en manque toujours autant que la branche non prise en
              contient.
            </div>
          </div>
        ),
      },
      {
        id: 'chemin-programme',
        type: 'concepts',
        title: 'Le chemin suivi',
        summary:
          'Le chemin d’un programme est la suite des instructions réellement exécutées. Avec un SI, ce chemin dépend de la valeur testée : un même programme a plusieurs chemins possibles.',
        visual: <DeuxChemins />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Les deux figures ci-dessus viennent du <strong>même programme</strong>. Rien n’a
              été réécrit : seule la valeur donnée au départ a changé.
            </p>
            <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-sm text-slate-700">
              Pour prévoir ce que fait un programme, il ne suffit donc plus de le lire de haut en
              bas : il faut <strong>connaître la valeur testée</strong>, puis suivre la branche
              qu’elle désigne.
            </div>
            <p className="text-sm text-slate-500">
              C’est aussi ce qui rend le test d’un programme plus long : un programme à un choix
              a deux chemins, et il faut les essayer tous les deux.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Écrire la condition, et la borne. */
    3: [
      {
        id: 'condition-test',
        type: 'regles',
        title: 'Écrire une condition',
        summary:
          'Une condition compare deux valeurs avec un seul comparateur : <, ⩽, >, ⩾, = ou ≠. Elle n’est ni vraie ni fausse en soi — elle le devient pour une valeur donnée.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-center">
              <span className="font-mono text-base font-black text-slate-800">
                <span className="rounded-md bg-violet-100 px-2 py-0.5 text-violet-800">valeur</span>
                {' '}
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-sky-800">⩾</span>
                {' '}
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-800">50</span>
              </span>
              <p className="mt-1.5 text-xs text-slate-500">
                ce qu’on teste · comment on compare · à quoi on compare
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              {[
                ['valeur = 50', 'vraie pour 50 seulement'],
                ['valeur ≠ 50', 'vraie pour tout sauf 50'],
                ['valeur > 50', 'vraie à partir de 51'],
                ['valeur ⩾ 50', 'vraie à partir de 50'],
              ].map(([c, d]) => (
                <div key={c} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="font-mono font-bold text-slate-800">{c}</span>
                  <span className="ml-2 text-xs text-slate-500">{d}</span>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'valeur-frontiere',
        type: 'memoriser',
        title: '⭐ Tester à la frontière',
        summary:
          'Deux conditions peuvent se comporter pareil sur presque toutes les valeurs et différer sur UNE seule : celle du seuil. C’est là — et seulement là — qu’on les distingue.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-4 text-center">
              <p className="text-base font-black text-rose-800">
                Pour vérifier une condition, essaie <span className="font-mono">le seuil</span>,
                puis <span className="font-mono">juste avant</span> et{' '}
                <span className="font-mono">juste après</span>.
              </p>
              <p className="text-sm font-semibold text-slate-600">
                Trois valeurs suffisent ; une seule ne prouve rien.
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="pb-1 text-left">valeur</th>
                    <th className="pb-1 text-right">valeur &gt; 50</th>
                    <th className="pb-1 text-right">valeur ⩾ 50</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {[[49, 'faux', 'faux'], [50, 'faux', 'vrai'], [51, 'vrai', 'vrai']].map(([v, a, b]) => (
                    <tr key={v} className={`border-t border-slate-100 ${v === 50 ? 'bg-amber-50' : ''}`}>
                      <td className="py-1 text-slate-600">{v}</td>
                      <td className="py-1 text-right font-bold text-slate-800">{a}</td>
                      <td className="py-1 text-right font-bold text-slate-800">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-1.5 text-xs text-slate-500">
                Une seule ligne les sépare — celle du milieu.
              </p>
            </div>
          </div>
        ),
      },
    ],

    /* M4 — L'affectation, et le compteur. */
    4: [
      {
        id: 'affectation',
        type: 'regles',
        title: 'METTRE une valeur dans une variable',
        summary:
          'L’affectation écrit une valeur dans une variable. Ce n’est pas une égalité : à partir de cet instant, la variable ne contient plus ce qu’elle contenait avant.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              En 5e, une variable était seulement <strong>lue</strong> : le programme allait
              chercher sa valeur, sans jamais la changer. Ici, il peut aussi l’<strong>écrire</strong>.
            </p>
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 text-center">
              <span className="font-mono text-lg font-black text-purple-900">i ← 40</span>
              <p className="mt-1 text-sm text-slate-600">
                se lit « i <strong>reçoit</strong> 40 », jamais « i égale 40 ».
              </p>
            </div>
            <div className="rounded-xl border-2 border-amber-200 bg-white p-3 text-sm text-slate-700">
              <strong className="text-amber-800">L’erreur à ne plus faire :</strong> lire{' '}
              <span className="font-mono">i ← i + 1</span> comme une équation, et conclure qu’elle
              est impossible. Ce n’est pas une équation : on calcule d’abord{' '}
              <span className="font-mono">i + 1</span> avec l’<strong>ancienne</strong> valeur,
              puis on range le résultat dans i. Si i valait 40, il vaut ensuite 41.
            </div>
          </div>
        ),
      },
      {
        id: 'compteur',
        type: 'concepts',
        title: 'Une variable qui évolue',
        summary:
          'Placée dans une boucle, une affectation s’applique à chaque tour : la variable change de valeur en cours de route. La même instruction, rencontrée deux fois, ne fait alors plus la même chose.',
        visual: (
          <TraceCanvas4e
            resultat={executer(SPIRALE)}
            hauteur={170}
            montrerStylo={false}
            titre="une spirale : le côté grandit à chaque tour"
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Le programme de cette figure ne contient qu’un seul{' '}
              <span className="font-mono">AVANCER</span>. Pourtant, aucun côté n’a la même
              longueur : à chaque tour, la variable qu’il lit a changé.
            </p>
            <div className="overflow-x-auto rounded-xl border-2 border-purple-200 bg-white p-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-purple-500">
                la valeur de i, tour après tour
              </p>
              <p className="font-mono text-sm font-bold tabular-nums text-purple-900">
                20 → 40 → 60 → 80 → 100 → 120
              </p>
            </div>
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 text-sm text-slate-700">
              C’est ce qui rend un programme <strong>irréductible à sa lecture</strong> : pour
              savoir ce que fait la troisième exécution d’une instruction, il faut savoir ce que
              valaient les variables à ce moment-là. Seul le pas-à-pas le dit.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Modifier plutôt que réécrire. */
    5: [
      {
        id: 'modifier-programme',
        type: 'methodes',
        title: 'Modifier un programme existant',
        summary:
          'On ne réécrit pas un programme pour changer son résultat : on cherche l’instruction — souvent une seule valeur — dont dépend ce qu’on veut changer, et on ne touche qu’à elle.',
        body: (
          <div className="space-y-3">
            <ol className="list-inside list-decimal space-y-1.5 text-sm text-slate-700">
              <li>Dire précisément ce qu’on veut obtenir, et en quoi c’est différent.</li>
              <li>Chercher <strong>de quoi</strong> cette différence dépend : un nombre de tours,
                un angle, une longueur, un seuil.</li>
              <li>Modifier cette valeur-là, et relancer.</li>
              <li>Vérifier que le reste n’a pas bougé.</li>
            </ol>
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-sm text-slate-700">
              Le nombre d’instructions touchées est un bon indicateur : si l’on doit tout
              réécrire, c’est presque toujours qu’on n’a pas trouvé la bonne.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — Réparer : le premier écart, y compris sur une variable. */
    6: [
      {
        id: 'premier-ecart',
        type: 'methodes',
        title: 'Le premier écart désigne la faute',
        summary:
          'On exécute pas à pas le programme cassé à côté de ce qu’on attendait, et on s’arrête au PREMIER pas où les deux diffèrent. L’instruction qui vient de s’exécuter est la coupable ; tout ce qui précède est juste.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              La 5e avait posé la méthode sur des tracés. La 4e y ajoute ce qu’un tracé ne montre
              pas : <strong>l’écart peut d’abord porter sur une variable</strong>, et le dessin ne
              trahir le problème qu’un ou deux pas plus tard.
            </p>
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 text-sm text-slate-700">
              Il faut donc comparer <strong>deux choses</strong> à chaque pas : la position et le
              cap d’un côté, les variables de l’autre. Le premier des deux à diverger est celui
              qui désigne la panne.
            </div>
            <div className="rounded-xl border-2 border-slate-200 bg-white p-3 text-sm text-slate-700">
              <strong>Trois pannes typiques :</strong>
              <ul className="mt-1 list-inside list-disc space-y-1 text-slate-600">
                <li>un <strong>angle</strong> faux — la figure ne se referme pas ;</li>
                <li>un <strong>seuil</strong> faux dans le test — la mauvaise branche est prise, parfois seulement à partir d’un certain tour ;</li>
                <li>un <strong>compteur</strong> qui n’avance pas — la variable reste figée alors que le dessin, lui, continue.</li>
              </ul>
            </div>
          </div>
        ),
      },
    ],
  },
};
