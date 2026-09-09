import React from 'react';
import {
  programme, trace, inverser, formuleTex, frRat, programmeTexte, SITUATIONS,
} from './components/fonctions4e';

/**
 * Connaissances de la leçon « Fonctions » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     chaîne orientée (M1) ─────────┐
 *          ↓                        │
 *     remonter la chaîne (M1)       │
 *          ↓                        ↓
 *     exécuter sur plusieurs entrées (M2)
 *          ↓
 *     la formule qui résume (M3) ──→ deux chaînes, une formule (M3)
 *          ↓
 *     du tableau à la formule (M4)
 *          ↓
 *     la formule devient un dessin (M5)
 *          ↓
 *     modéliser une situation (M6)
 *
 * Rien ne peut être avancé : on ne résume pas une chaîne qu'on n'a pas
 * descendue, on ne remonte pas un tableau vers une formule dont on ne sait
 * pas ce qu'elle est, et on ne dessine pas ce qu'on ne sait pas calculer.
 *
 * Ce que cette carte NE contient PAS : la dépendance elle-même, « en fonction
 * de », le tableau de valeurs, le couple-point, la lecture d'un graphique et
 * le programme de calcul EXÉCUTÉ — ce sont les acquis de 5e, listés dans
 * `priorKnowledge` et diagnostiqués au module 0. Elle ne contient pas non plus
 * la notation f(x), « image », « antécédent », ni les fonctions linéaires et
 * affines : ce sont des objets de 3e.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/** La chaîne du module 1, descendue puis remontée — dérivée, jamais écrite. */
const CHAINE = programme(['×', 3], ['+', 2]);

/** Une chaîne verticale, avec la valeur qui sort de chaque case. */
const Chaine = ({ prog = CHAINE, x = 4, ton = 'indigo' }) => {
  const t = trace(prog, x);
  const couleurs = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
  return (
    <div className={`space-y-1 rounded-xl border p-2.5 ${couleurs[ton]}`}>
      <div className="flex items-center justify-between text-[13px]">
        <span className="uppercase tracking-wide opacity-60">entrée</span>
        <span className="font-mono font-black">{frRat(t.depart)}</span>
      </div>
      {t.etapes.map((e, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg bg-white/70 px-2 py-1 text-[13px]">
          <span className="font-mono font-bold">{e.op} {frRat(e.val)}</span>
          <span className="font-mono">{frRat(e.apres)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between text-[13px]">
        <span className="uppercase tracking-wide opacity-60">sortie</span>
        <span className="font-mono font-black">{frRat(t.arrivee)}</span>
      </div>
    </div>
  );
};

/** Les deux sens, côte à côte : l'ordre s'est retourné. */
const AllerRetour = () => {
  const inv = inverser(CHAINE);
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-emerald-100 bg-white p-2.5 text-[13px]">
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">on descend</p>
        <p className="font-mono font-bold text-indigo-800">
          {CHAINE.map((e) => `${e.op}${frRat(e.val)}`).join('  puis  ')}
        </p>
      </div>
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">on remonte</p>
        <p className="font-mono font-bold text-emerald-800">
          {inv.map((e) => `${e.op}${frRat(e.val)}`).join('  puis  ')}
        </p>
      </div>
    </div>
  );
};

/** Deux chaînes différentes, une seule formule. */
const MemeFormule = () => {
  const p = programme(['×', 2], ['×', 3]);
  const q = programme(['×', 6]);
  return (
    <div className="space-y-1.5 rounded-xl border border-sky-100 bg-white p-2.5 text-[13px]">
      {[p, q].map((prog, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="font-mono text-slate-600">
            {prog.map((e) => `${e.op}${frRat(e.val)}`).join(' puis ')}
          </span>
          <span className="text-slate-300">→</span>
          <span className="font-mono font-black text-sky-800">{formuleTex(prog).replace(/\\,\s*/g, '')}</span>
        </div>
      ))}
      <p className="pt-1 text-[11px] text-slate-500">Deux machines, une seule écriture.</p>
    </div>
  );
};

/** Un accord partiel n'est pas un accord. */
const AccordPartiel = () => (
  <div className="space-y-1 rounded-xl border border-emerald-100 bg-white p-2.5 font-mono text-[13px]">
    {[
      ['1 → 5', '✓', 'text-emerald-600'],
      ['2 → 8', '✓', 'text-emerald-600'],
      ['5 → 17', '✗', 'text-rose-600'],
      ['10 → 32', '✗', 'text-rose-600'],
    ].map(([couple, marque, ton]) => (
      <div key={couple} className="flex items-center justify-between gap-3">
        <span className="text-slate-600">{couple}</span>
        <span className={`font-black ${ton}`}>{marque}</span>
      </div>
    ))}
    <p className="pt-1 font-sans text-[11px] text-slate-500">2 sur 4 : la candidate est éliminée.</p>
  </div>
);

/** Une dépendance qui DESCEND — la citerne du module 6. */
const QuiDescend = () => {
  const s = SITUATIONS.citerne;
  const xs = [0, 3, 6, 9, 12];
  return (
    <div className="space-y-1 rounded-xl border border-rose-100 bg-white p-2.5 text-[13px]">
      {xs.map((x) => (
        <div key={x} className="flex items-center gap-2">
          <span className="w-12 shrink-0 font-mono text-slate-500">{x} min</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-rose-400" style={{ width: `${(s.valeurNum(x) / 300) * 100}%` }} />
          </div>
          <span className="w-14 shrink-0 text-right font-mono font-bold text-slate-700">
            {s.valeurNum(x)} L
          </span>
        </div>
      ))}
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Ce qu'on vient de FAIRE : descendre une chaîne, puis la remonter.
       Rien n'est encore résumé : la formule appartient au module 3. */
    1: [
      {
        id: 'chaine-orientee',
        type: 'concepts',
        title: 'Un programme de calcul est une chaîne ORIENTÉE',
        summary:
          'Les étapes se suivent dans un ordre, et cet ordre compte. Un nombre y entre, descend case par case, et un seul nombre en sort.',
        visual: <Chaine />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Un programme n’est pas une liste de choses à faire au hasard : c’est une{' '}
              <strong>suite ordonnée</strong>. « {programmeTexte(CHAINE)} » ne donne pas la même
              chose que le contraire.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Avec 4 au départ : {programmeTexte(CHAINE)} donne{' '}
              {frRat(trace(CHAINE, 4).arrivee)}. En inversant l’ordre des deux étapes, on
              trouverait 18. L’ordre n’est donc pas un détail d’écriture.
            </div>
            <p className="text-sm text-slate-700">
              Chaque case travaille sur ce que lui donne la précédente. C’est ce qui permet de
              voir le nombre <strong>descendre</strong>, plutôt que d’attendre un résultat qui
              tombe.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le nombre qui descendait les trois cases, une à une.
            </div>
          </div>
        ),
      },
      {
        id: 'remonter-la-chaine',
        type: 'methodes',
        title: 'Remonter la chaîne',
        summary:
          'Pour retrouver l’entrée à partir de la sortie : l’ORDRE se retourne, ET chaque opération se change en son contraire. Les deux à la fois.',
        visual: <AllerRetour />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-center font-mono text-sm">
              <div className="text-slate-600">
                {CHAINE.map((e) => `${e.op}${frRat(e.val)}`).join(' puis ')}
              </div>
              <div className="my-1 text-slate-300">se remonte par</div>
              <div className="font-black text-emerald-800">
                {inverser(CHAINE).map((e) => `${e.op}${frRat(e.val)}`).join(' puis ')}
              </div>
            </div>
            <p className="text-sm text-slate-700">
              L’erreur du niveau est de ne retourner <em>qu’une</em> des deux choses. Défaire les
              opérations sans retourner l’ordre ne ramène pas au départ, et le nombre obtenu le
              dit tout de suite.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              <strong>Le seul cas impossible :</strong> une étape « × 0 ». Elle envoie toutes les
              entrées sur 0, donc la sortie ne dit plus rien de l’entrée — il n’y a plus rien à
              remonter.
            </div>
            <p className="text-sm text-slate-600">
              Le contrôle est immédiat : on redescend la chaîne avec le nombre trouvé, et on doit
              retomber sur la sortie de départ.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la chaîne qui se retournait quand tu tirais la sortie vers le haut.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — La chaîne ne tient pas à une valeur : c'est ce qui la rend utile. */
    2: [
      {
        id: 'meme-chaine-toutes-entrees',
        type: 'regles',
        title: 'La même chaîne répond à toutes les entrées',
        summary:
          'Un programme ne dépend pas du nombre avec lequel on l’a essayé. Zéro, un négatif, un grand nombre : la chaîne les traite tous de la même façon.',
        visual: <Chaine x={-2} ton="emerald" />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              On n’a pas besoin de refaire le raisonnement à chaque nombre : la chaîne est{' '}
              <strong>une règle</strong>, et une règle vaut pour tout ce qu’on lui donne.
            </p>
            <p className="text-sm text-slate-700">
              C’est pourquoi il vaut la peine d’essayer <strong>0</strong> et des nombres{' '}
              <strong>négatifs</strong> : ils ne cassent rien, et ils révèlent souvent le
              comportement le plus parlant de la machine.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              Une sortie qui ne tombe pas juste s’écrit en <strong>fraction</strong> : c’est la
              valeur exacte, pas une approximation qu’on aurait arrondie.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le tableau qui se remplissait tout seul dès que tu ajoutais un nombre.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — La formule : la machine, dite en une ligne. */
    3: [
      {
        id: 'formule-qui-resume',
        type: 'formules',
        title: 'La formule qui résume la chaîne',
        summary:
          'Toute la machine tient sur une ligne : on écrit ce qu’on fait à l’entrée, dans l’ordre. « Multiplier par 3 puis ajouter 2 » s’écrit 3x + 2.',
        visual: <Chaine />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-center">
              <span className="font-mono text-lg font-black text-sky-700">
                {programmeTexte(CHAINE)} → {formuleTex(CHAINE).replace(/\\,\s*/g, '')}
              </span>
            </div>
            <p className="text-sm text-slate-700">
              La lettre remplace le nombre d’entrée : elle veut dire « <em>n’importe lequel</em> ».
              C’est ce qui fait que la formule dit la machine <strong>en entier</strong>, et pas
              seulement ce qu’elle a fait sur les nombres essayés.
            </p>
            <p className="text-sm text-slate-700">
              Une écriture candidate ne se vérifie donc <strong>jamais sur une seule entrée</strong>.
              Il faut qu’elle donne le même résultat que la chaîne pour toutes.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Attention à l’ordre : « ajouter 2 puis multiplier par 3 » ne s’écrit pas 3x + 2, mais
              3x + 6 — car le 2 est multiplié lui aussi.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la barre d’accord qui refusait de se remplir tant qu’une entrée
              démentait.
            </div>
          </div>
        ),
      },
      {
        id: 'deux-chaines-une-formule',
        type: 'concepts',
        title: 'Deux chaînes différentes, une seule formule',
        summary:
          'La formule décide de ce que fait la machine, pas de la façon dont elle est construite. « ×2 puis ×3 » et « ×6 » sont deux chaînes, et une seule écriture.',
        visual: <MemeFormule />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Comparer deux <strong>tableaux</strong> ne décide que des entrées qu’on a essayées.
              Comparer deux <strong>formules</strong> décide pour toutes les entrées d’un coup :
              c’est ce qui en fait un outil et pas seulement une écriture plus courte.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              Conséquence pratique : deux programmes de calcul peuvent sembler très différents et
              faire exactement la même chose. Pour le savoir, on les résume tous les deux.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux machines qui rendaient toujours le même nombre.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Le chemin retour : d'un tableau vers la règle qui l'explique. */
    4: [
      {
        id: 'du-tableau-a-la-formule',
        type: 'methodes',
        title: 'Retrouver la formule d’un tableau',
        summary:
          'Deux couples suffisent à proposer une écriture ; tous les autres servent à la CONFIRMER. Un accord partiel est une réfutation.',
        visual: <AccordPartiel />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-sm text-slate-700">
              <p className="mb-1.5 font-bold text-emerald-800">La marche à suivre</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Regarder de combien la sortie change quand l’entrée augmente de 1.</li>
                <li>En déduire le nombre devant l’entrée.</li>
                <li>Chercher ce qu’il faut ajouter pour retomber sur un couple connu.</li>
                <li>
                  <strong>Vérifier sur TOUS les autres couples</strong>, sans en sauter un.
                </li>
              </ol>
            </div>
            <p className="text-sm text-slate-700">
              L’étape 4 n’est pas une formalité : c’est elle qui distingue une règle d’une
              coïncidence. Une candidate qui tombe juste deux fois sur quatre n’est pas à moitié
              vraie, elle est <strong>fausse</strong>.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Et parfois, aucune écriture de ce type n’explique le tableau. Le dire est une
              réponse mathématique, pas un échec.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le testeur qui nommait les couples qui te démentaient.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Le troisième visage : le dessin. */
    5: [
      {
        id: 'formule-en-dessin',
        type: 'methodes',
        title: 'De la formule au dessin',
        summary:
          'Chaque couple (entrée ; sortie) devient un point. Les points d’une formule de ce type se rangent sur une même ligne droite.',
        visual: <QuiDescend />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-purple-200 bg-white p-3 text-sm text-slate-700">
              <p className="mb-1.5 font-bold text-purple-800">Trois gestes, dans cet ordre</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Choisir des entrées, et calculer la sortie de chacune.</li>
                <li>Placer chaque couple comme un point : l’entrée en abscisse, la sortie en ordonnée.</li>
                <li>Relier — et lire entre les points ce qu’on n’a pas calculé.</li>
              </ol>
            </div>
            <p className="text-sm text-slate-700">
              L’<strong>échelle</strong> se choisit d’après les nombres qu’on a réellement
              calculés : un repère trop serré écrase le dessin, un repère trop large le réduit à un
              paquet de points au coin.
            </p>
            <p className="text-sm text-slate-700">
              Le dessin n’illustre pas la formule : il en est une autre <strong>lecture</strong>.
              La chaîne, l’écriture et le dessin disent la même dépendance.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le repère qui se refaisait tout seul autour de tes points.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — L'aboutissement : partir du réel, et en ressortir une formule et
       un dessin. Y compris quand la sortie DESCEND. */
    6: [
      {
        id: 'modeliser-une-situation',
        type: 'methodes',
        title: 'Modéliser une situation',
        summary:
          'Nommer les deux grandeurs, dire laquelle commande, écrire la formule, puis la dessiner. Et se demander jusqu’où l’entrée a le droit d’aller.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-rose-200 bg-white p-3 text-sm text-slate-700">
              <p className="mb-1.5 font-bold text-rose-800">Les quatre questions</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Quelles sont les deux grandeurs ?</li>
                <li>Laquelle commande, laquelle suit ?</li>
                <li>Quelle formule fait passer de l’une à l’autre ?</li>
                <li>Quelles valeurs l’entrée peut-elle vraiment prendre ?</li>
              </ol>
            </div>
            <p className="text-sm text-slate-700">
              La quatrième question est la plus oubliée. Une citerne de{' '}
              {SITUATIONS.citerne.valeurNum(0)} L qui perd 25 L par minute est vide à la douzième
              minute : au-delà, la formule continuerait de calculer, mais elle donnerait un volume{' '}
              <strong>négatif</strong> — c’est-à-dire rien du tout.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              Une fois la formule écrite, on peut aussi la <strong>remonter</strong> : « au bout de
              combien de temps la citerne est-elle vide ? » se répond en partant de 0 et en
              remontant la chaîne.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : l’enclos de grillage et la citerne du potager.
            </div>
          </div>
        ),
      },
      {
        id: 'dependance-qui-diminue',
        type: 'concepts',
        title: 'Dépendre, ce n’est pas forcément augmenter ensemble',
        summary:
          'Quand la longueur de l’enclos augmente, sa largeur diminue. C’est encore une dépendance : la sortie est toujours commandée par l’entrée.',
        visual: <QuiDescend />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Une dépendance dit que la sortie est <strong>déterminée</strong> par l’entrée. Elle
              ne dit rien du sens : la sortie peut monter, descendre, ou même rester constante.
            </p>
            <div className="rounded-xl bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200">
              <p className="font-mono font-bold text-rose-800">
                {SITUATIONS.perimetreFixe.nom} : {SITUATIONS.perimetreFixe.formuleTex().replace(/\\,\s*/g, '')}
              </p>
              <p className="mt-1 text-slate-600">
                20 m de grillage, c’est 10 m pour une longueur et une largeur. Plus l’une prend,
                moins il en reste à l’autre.
              </p>
            </div>
            <p className="text-sm text-slate-700">
              Sur le dessin, cela se voit tout de suite : la ligne <strong>descend</strong> au lieu
              de monter. Le nombre devant l’entrée est alors négatif.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les barres bleues de la citerne, qui raccourcissaient minute après
              minute.
            </div>
          </div>
        ),
      },
    ],
  },
};
