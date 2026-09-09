import React from 'react';
import { EXPERIENCES, EVENEMENTS_DE, pct } from './components/probabilites';

/**
 * Connaissances de la leçon « Probabilités » (5e) — SOURCE UNIQUE.
 *
 * LA DÉPENDANCE RÉELLE, dans l'ordre où la carte se construit. Elle est la
 * colonne vertébrale de la leçon, et l'INVERSE de l'exposé habituel : le
 * quotient est le DERNIER maillon, pas le premier.
 *
 *     expérience aléatoire   (M1)
 *              ↓
 *     issue                  (M2)
 *              ↓
 *     événement              (M3) ←── décrit PAR les issues qui le réalisent
 *              ↓
 *     équiprobabilité        (M4) ←── une CONDITION, pas une évidence
 *              ↓
 *     fréquence observée     (M5) ←── en répétant, elle se stabilise
 *              ↓
 *     probabilité            (M6) ←── le nombre dont la fréquence s'approchait
 *              ↓
 *     échelle de 0 à 1       (M7)
 *
 * Règle d'or, et elle est ici particulièrement stricte : le mot
 * « probabilité » et le quotient favorables/possibles n'apparaissent NULLE
 * PART avant le module 6. Les modules 1 à 5 parlent de « chance »,
 * de « fréquence » et de « proportion » — ce que l'élève peut observer.
 */

/** Les six faces du dé, non interactives — réutilisées par les items. */
const Faces = ({ surlignees = [] }) => (
  <div className="flex flex-wrap justify-center gap-1.5">
    {[1, 2, 3, 4, 5, 6].map((n) => (
      <div
        key={n}
        className={`w-10 h-10 rounded-lg border-2 grid place-items-center font-mono text-base font-black tabular-nums ${
          surlignees.includes(n)
            ? 'border-amber-400 bg-amber-100 text-amber-900'
            : 'border-slate-200 bg-white text-slate-400'
        }`}
      >
        {n}
      </div>
    ))}
  </div>
);

/** Le sac et ses six billes, telles que l'élève les a vues. */
const Sac = () => (
  <div className="flex flex-wrap justify-center gap-1.5">
    {EXPERIENCES.urne.billes.map((c, i) => (
      <div
        key={i}
        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
        style={{ background: { rouge: '#dc2626', bleu: '#2563eb', vert: '#16a34a' }[c] }}
        aria-label={`bille ${c}`}
      />
    ))}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'expérience aléatoire. Ni issue nommée (M2), ni chance chiffrée. */
    1: [
      {
        id: 'experience-aleatoire',
        type: 'concepts',
        title: 'Une expérience aléatoire',
        summary: 'Une expérience est aléatoire quand on connaît d’avance tout ce qui peut arriver, mais pas ce qui va arriver.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                Avant de lancer le dé, tu sais que tu obtiendras 1, 2, 3, 4, 5 ou 6.
                Tu ne sais pas <strong>lequel</strong>.
              </div>
              <div className="text-xs text-slate-500">
                Ces deux choses sont vraies en même temps — et c’est exactement cela, le hasard.
                Ce n’est pas l’ignorance totale : c’est une <strong>ignorance encadrée</strong>.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              À l’inverse, «&nbsp;lâcher une pomme&nbsp;» n’est pas une expérience aléatoire :
              on sait qu’elle tombera. Et refaire l’expérience peut donner un autre résultat —
              c’est ce qui la distingue d’une mesure.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : ta prédiction écrite avant le premier lancer.</div>
          </div>
        ),
      },
    ],

    /* M2 — Les issues. On les ÉNUMÈRE ; on ne les compare pas encore. */
    2: [
      {
        id: 'issue',
        type: 'vocabulaire',
        title: 'Les issues',
        summary: 'Les issues d’une expérience sont tous ses résultats possibles, listés sans oubli et sans répétition.',
        visual: <Faces surlignees={[1, 2, 3, 4, 5, 6]} />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-violet-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                Le dé a <strong>6 issues</strong> : 1, 2, 3, 4, 5, 6. La pièce en a{' '}
                <strong>2</strong> : Pile, Face.
              </div>
              <div className="text-xs text-slate-500">
                Une bonne liste d’issues respecte deux règles : <strong>aucune oubliée</strong>{' '}
                (tout résultat possible y figure) et <strong>aucune en double</strong> (deux
                issues ne peuvent pas arriver ensemble).
              </div>
            </div>
            <p className="text-sm text-slate-700">
              « Faire un nombre pair » n’est <strong>pas</strong> une issue du dé : c’est une
              description qui en regroupe plusieurs. Une issue est un résultat, pas une catégorie.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — L'événement, DÉCRIT par les issues. Toujours pas de quotient. */
    3: [
      {
        id: 'evenement',
        type: 'concepts',
        title: 'Un événement',
        summary: 'Un événement se décrit par la liste des issues qui le réalisent.',
        visual: <Faces surlignees={EVENEMENTS_DE.pair.realisent} />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-amber-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                L’événement «&nbsp;<strong>obtenir un nombre pair</strong>&nbsp;» est réalisé par
                les issues <strong className="font-mono">2, 4 et 6</strong> — et par elles seules.
              </div>
              <div className="text-xs text-slate-500">
                Dire un événement en français («&nbsp;faire plus de 4&nbsp;») et le dire en issues
                (<span className="font-mono">5 ; 6</span>) sont deux façons de désigner la même
                chose. La seconde est celle avec laquelle on peut travailler.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Deux cas extrêmes existent : un événement qu’<strong>aucune</strong> issue ne
              réalise (« obtenir 7 »), et un événement que <strong>toutes</strong> réalisent
              (« obtenir moins de 7 »).
            </p>
          </div>
        ),
      },
    ],

    /* M4 — L'équiprobabilité, posée comme une CONDITION À VÉRIFIER. */
    4: [
      {
        id: 'equiprobabilite',
        type: 'regles',
        title: 'L’équiprobabilité',
        summary: 'Des issues sont équiprobables quand rien ne favorise l’une plutôt qu’une autre — et cela se vérifie, cela ne se suppose pas.',
        visual: <Sac />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-sky-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                Les <strong>6 billes</strong> du sac sont équiprobables : elles ont la même taille,
                la même texture, et on tire sans regarder.
              </div>
              <div className="text-xs text-slate-500">
                Mais les <strong>3 couleurs</strong> ne le sont pas : il y a 3 billes rouges et
                1 seule verte. Le rouge a trois fois plus de chances de sortir que le vert.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Même dispositif, deux réponses différentes — tout dépend de ce qu’on appelle une
              issue. C’est pourquoi on commence toujours par <strong>lister les issues</strong>,
              puis on se demande si elles sont à égalité.
            </p>
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-sm text-slate-600">
              Un dé pipé, une roue dont un secteur est plus large, une punaise qui retombe plus
              souvent d’un côté : autant de cas où les issues ne sont <strong>pas</strong>
              équiprobables.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — La fréquence OBSERVÉE. Le constat, pas encore le nombre théorique.
       Ni le mot « probabilité », ni le quotient : ils sont au module 6. */
    5: [
      {
        id: 'frequence-observee',
        type: 'concepts',
        title: 'La fréquence observée',
        summary: 'En répétant l’expérience un grand nombre de fois, la fréquence d’une issue se stabilise autour d’un nombre.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                Sur <strong>10 lancers</strong> de dé, le 6 peut sortir 0 fois ou 4 fois : la
                fréquence saute dans tous les sens. Sur <strong>10 000 lancers</strong>, elle est
                toujours tout près de <strong className="font-mono">{pct(1 / 6)}</strong>.
              </div>
              <div className="text-xs text-slate-500">
                Ce n’est pas que le hasard « se corrige » : chaque lancer reste imprévisible.
                C’est que les écarts, rapportés à un nombre de lancers de plus en plus grand,
                pèsent de moins en moins lourd.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Peu de répétitions ne prouvent rien. <strong>Beaucoup</strong> de répétitions font
              apparaître un nombre stable — le même à chaque fois qu’on recommence l’expérience
              en entier.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’écart qui fondait à mesure que tu relançais.</div>
          </div>
        ),
      },
    ],

    /* M6 — LA PROBABILITÉ. Le mot et le quotient arrivent ici, et pas avant :
       ils rendent compte du nombre stable observé au module 5. */
    6: [
      {
        id: 'probabilite',
        type: 'concepts',
        title: 'La probabilité',
        summary: 'La probabilité d’un événement est le nombre dont sa fréquence s’approche quand on répète : elle se calcule sans rien lancer.',
        visual: <Faces surlignees={[6]} />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                Tu as vu la fréquence du 6 se stabiliser vers{' '}
                <strong className="font-mono">{pct(1 / 6)}</strong>. Ce nombre, c’est{' '}
                <strong className="font-mono">1/6</strong> : <strong>une</strong> face favorable
                sur <strong>six</strong> faces possibles.
              </div>
              <div className="text-xs text-slate-500">
                La probabilité ne prédit pas le prochain lancer. Elle mesure la chance — comme un
                mètre mesure une longueur, sans dire où l’on ira.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              La fréquence se <strong>constate</strong> après coup, en lançant ; la probabilité se{' '}
              <strong>calcule</strong> avant, en regardant le dispositif. Les deux se rejoignent
              quand on répète beaucoup.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-probabilite',
        type: 'memoriser',
        title: '⭐ Favorables ÷ Possibles — si les issues sont équiprobables',
        summary: 'On compte les issues qui réalisent l’événement, on divise par le nombre total d’issues.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                nombre d’issues favorables ÷ nombre d’issues possibles
              </div>
              <div className="text-sm text-slate-600 font-semibold font-mono">
                « nombre pair » : 3 faces sur 6 → 3/6 = 1/2 = 50 %
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              La condition n’est pas décorative : sans équiprobabilité, ce quotient est{' '}
              <strong>faux</strong>. Dans le sac, on compte les <strong>billes</strong> (6), jamais
              les couleurs (3).
            </p>
          </div>
        ),
      },
    ],

    /* M7 — L'échelle. Elle range ce qui a été calculé au module 6. */
    7: [
      {
        id: 'echelle-probabilite',
        type: 'regles',
        title: 'L’échelle de 0 à 1',
        summary: 'Toute probabilité est comprise entre 0 (impossible) et 1 (certain).',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-rose-200 bg-white p-3 space-y-2">
              <div className="relative h-8 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 border border-slate-200">
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-bold text-slate-600">
                  <span>0</span>
                  <span>1/2</span>
                  <span>1</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 px-1">
                <span>impossible</span>
                <span>une chance sur deux</span>
                <span>certain</span>
              </div>
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• «&nbsp;Obtenir 7 avec un dé&nbsp;» : <strong className="font-mono">0</strong> — aucune issue ne le réalise ;</li>
              <li>• «&nbsp;Obtenir moins de 7&nbsp;» : <strong className="font-mono">1</strong> — toutes le réalisent ;</li>
              <li>• plus la probabilité est <strong>proche de 1</strong>, plus l’événement est probable.</li>
            </ul>
            <p className="text-sm text-slate-500">
              Une probabilité négative, ou supérieure à 1, est toujours le signe d’une erreur de
              calcul : on ne peut pas avoir plus d’issues favorables que d’issues possibles.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-echelle',
        type: 'memoriser',
        title: '⭐ 0 = impossible, 1 = certain',
        summary: 'Une probabilité ne sort jamais de l’intervalle de 0 à 1.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                0 ≤ probabilité ≤ 1
              </div>
              <div className="text-sm text-slate-600 font-semibold">
                Impossible · Peu probable · Une chance sur deux · Probable · Certain
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
};
