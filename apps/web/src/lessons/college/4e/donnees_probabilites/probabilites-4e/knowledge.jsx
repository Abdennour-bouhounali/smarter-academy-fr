import React from 'react';
import {
  SAC, EVENEMENTS_SAC, intersection, reunion, contraire,
  probabilite, fraction, compteNaifReunion,
} from './components/proba4e';

/**
 * Connaissances de la leçon « Probabilités » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     fluctuation (M1)
 *          ↓
 *     stabilisation (M2)
 *
 *     événement contraire (M3) → P(A) + P(non A) = 1 (M3)
 *          ↓
 *     intersection, réunion (M4)
 *          ↓
 *     impossible et certain (M5)  ← les deux bornes, décrites par les issues
 *
 * Les deux chaînes sont indépendantes : l'une porte sur ce qu'on OBSERVE
 * (des fréquences), l'autre sur ce qu'on DÉCRIT (des ensembles d'issues).
 * Elles se rejoignent au module 6, où le modèle prédit ce que l'expérience
 * observe.
 *
 * Ce que cette carte NE contient PAS : l'expérience aléatoire, l'issue,
 * l'événement, l'équiprobabilité, la probabilité comme quotient, l'échelle de
 * 0 à 1. Ce sont les acquis de 5e, listés dans `priorKnowledge` et
 * diagnostiqués au module 0. Elle ne contient pas non plus les arbres
 * pondérés ni la formule P(A∪B) : ce sont des objets de 3e.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/** Une rangée de billes, certaines allumées — le sac en miniature. */
const Billes = ({ retenues, legende }) => {
  const dedans = new Set(retenues);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5">
      <div className="flex flex-wrap justify-center gap-1">
        {SAC.issues.map((b) => (
          <span
            key={b.id}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black"
            style={
              dedans.has(b.id)
                ? { background: b.hex, color: '#fff' }
                : { background: '#f1f5f9', color: '#cbd5e1', border: '2px dashed #cbd5e1' }
            }
          >
            {b.label}
          </span>
        ))}
      </div>
      {legende && <p className="mt-1.5 text-center text-[11px] text-slate-500">{legende}</p>}
    </div>
  );
};

/** Cinq barres qui se resserrent — la stabilisation, en miniature. */
const Resserrement = () => (
  <div className="space-y-2 rounded-xl border border-indigo-100 bg-white p-2.5">
    {[
      { n: '10 tours', ecarts: [-22, 14, -8, 26, 2] },
      { n: '10 000 tours', ecarts: [-1, 0.6, -0.4, 1.2, 0.2] },
    ].map((bloc) => (
      <div key={bloc.n}>
        <p className="mb-1 text-[11px] font-semibold text-slate-500">{bloc.n}</p>
        <div className="relative h-8 rounded bg-slate-50">
          <div className="absolute inset-y-0 left-1/2 w-[2px] bg-slate-900" aria-hidden="true" />
          {bloc.ecarts.map((e, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-indigo-500"
              style={{ left: `calc(50% + ${e * 1.6}px)`, top: `${4 + i * 5}px` }}
            />
          ))}
        </div>
      </div>
    ))}
    <p className="text-center text-[11px] text-slate-400">trait noir = probabilité</p>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Ce que l'élève VIENT DE VOIR : les séries s'éparpillent. */
    1: [
      {
        id: 'fluctuation',
        type: 'concepts',
        title: 'La fluctuation des fréquences',
        summary:
          'Deux séries identiques donnent des fréquences différentes. C’est attendu, ce n’est pas une erreur — et l’écart se mesure.',
        visual: <Resserrement />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Une <strong>fréquence observée</strong> est ce qu’on a obtenu ; une{' '}
              <strong>probabilité</strong> est ce que le modèle annonce. Elles ne coïncident
              presque jamais exactement.
            </p>
            <p className="text-sm text-slate-700">
              Sur peu de lancers, les séries s’éparpillent largement autour de la probabilité.
              C’est la <strong>fluctuation d’échantillonnage</strong>.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Conséquence pratique : un écart entre deux séries ne prouve rien à lui seul. Pour
              juger d’un dé ou d’une roue, il faut beaucoup de lancers.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les cinq barres qui partaient dans tous les sens à 10 tours.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Le second phénomène, celui qui rassure. */
    2: [
      {
        id: 'stabilisation',
        type: 'regles',
        title: 'La stabilisation',
        summary:
          'Plus on répète l’expérience, plus la fréquence observée se rapproche de la probabilité — sans jamais forcément l’atteindre.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-violet-200 bg-white p-3 text-center text-sm">
              <div className="font-mono font-black text-violet-800">
                beaucoup de répétitions → fréquence ≈ probabilité
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Ce n’est pas le nombre de <em>séries</em> qui resserre les résultats, c’est la{' '}
              <strong>taille</strong> de chaque série. Relancer dix fois cinq séries de 10 tours
              ne rapproche de rien.
            </p>
            <p className="text-sm text-slate-700">
              C’est ce qui permet, à l’inverse, d’<strong>estimer</strong> une probabilité qu’on
              ne connaît pas : on répète beaucoup, et la fréquence obtenue en donne une bonne
              approximation.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : l’écart affiché en bas, qui fondait en passant à 10 000 tours.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Le contraire, et sa conséquence immédiate. */
    3: [
      {
        id: 'evenement-contraire',
        type: 'concepts',
        title: 'L’événement contraire',
        summary:
          'Le contraire d’un événement regroupe TOUTES les issues qui ne sont pas dedans — pas seulement celles auxquelles on pense.',
        visual: (
          <Billes
            retenues={contraire(EVENEMENTS_SAC.rouge).issues}
            legende="« pas rouge » : les bleues ET les vertes"
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Un événement est un <strong>ensemble d’issues</strong>. Son contraire est
              l’ensemble de toutes les <strong>autres</strong> issues de l’expérience.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Le piège : le contraire de « rouge » n’est pas « bleue ». Le sac contient aussi des
              vertes, et elles sont dans le contraire.
            </div>
            <p className="text-sm text-slate-600">
              Ensemble, un événement et son contraire couvrent toute l’expérience, et n’ont
              aucune issue en commun.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les billes qui s’allumaient et s’éteignaient en échangeant leurs rôles.
            </div>
          </div>
        ),
      },
      {
        id: 'somme-contraire',
        type: 'formules',
        title: 'P(A) + P(contraire de A) = 1',
        summary: 'Puisque les deux couvrent tout sans se chevaucher, leurs probabilités font 1.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-center">
              <span className="font-mono text-lg font-black text-sky-700">
                P(non A) = 1 − P(A)
              </span>
            </div>
            <p className="text-sm text-slate-700">
              C’est souvent le chemin le plus court : quand un événement est compliqué à
              dénombrer, son contraire ne l’est parfois pas.
            </p>
            <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm text-slate-700">
              <div>P = 0,3 → P(contraire) = 0,7</div>
              <div>P = 1/4 → P(contraire) = 3/4</div>
              <div>P = 1 → P(contraire) = 0</div>
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Les deux opérations sur les ensembles. */
    4: [
      {
        id: 'intersection',
        type: 'concepts',
        title: 'L’intersection : « ET »',
        summary:
          'Les issues qui vérifient les DEUX conditions à la fois. Elle est souvent bien plus petite qu’on ne l’imagine.',
        visual: (
          <Billes
            retenues={intersection(EVENEMENTS_SAC.rouge, EVENEMENTS_SAC.grande).issues}
            legende="« rouge ET grande » : 2 billes sur 8"
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Pour trouver l’intersection, on ne calcule pas : on <strong>regarde</strong> quelles
              issues satisfont les deux conditions en même temps.
            </p>
            <p className="text-sm text-slate-700">
              Ici, sur {SAC.issues.length} billes, {EVENEMENTS_SAC.rouge.issues.length} sont
              rouges et {EVENEMENTS_SAC.grande.issues.length} sont grandes, mais seulement{' '}
              <strong>{intersection(EVENEMENTS_SAC.rouge, EVENEMENTS_SAC.grande).issues.length}</strong>{' '}
              sont les deux — soit{' '}
              {fraction(probabilite(intersection(EVENEMENTS_SAC.rouge, EVENEMENTS_SAC.grande)))}.
            </p>
            <p className="text-sm text-slate-600">
              Quand aucune issue ne vérifie les deux conditions, l’intersection est vide : les
              deux événements ne peuvent pas se produire ensemble.
            </p>
          </div>
        ),
      },
      {
        id: 'reunion',
        type: 'concepts',
        title: 'La réunion : « OU »',
        summary:
          'Les issues qui vérifient AU MOINS UNE des deux conditions. Additionner les deux effectifs compte deux fois celles qui sont dans les deux.',
        visual: (
          <Billes
            retenues={reunion(EVENEMENTS_SAC.rouge, EVENEMENTS_SAC.grande).issues}
            legende="« rouge OU grande » : 6 billes, pas 8"
          />
        ),
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-center text-sm">
              <div className="text-slate-600">
                {EVENEMENTS_SAC.rouge.issues.length} rouges +{' '}
                {EVENEMENTS_SAC.grande.issues.length} grandes ={' '}
                {compteNaifReunion(EVENEMENTS_SAC.rouge, EVENEMENTS_SAC.grande)}…
              </div>
              <div className="mt-1 font-black text-emerald-800">
                …mais seulement{' '}
                {reunion(EVENEMENTS_SAC.rouge, EVENEMENTS_SAC.grande).issues.length} billes
                sont allumées
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Les billes qui appartiennent aux deux ensembles ne comptent qu’<strong>une
              fois</strong> : on les a additionnées deux fois sans le vouloir.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              L’addition ne tombe juste que dans un cas : quand aucune issue n’est commune aux
              deux événements.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux billes cerclées de noir.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-et-ou',
        type: 'memoriser',
        title: 'ET rétrécit, OU élargit',
        summary:
          '« ET » ne garde que ce qui vérifie les deux conditions ; « OU » garde tout ce qui en vérifie au moins une.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Le réflexe : devant un « ou », se demander{' '}
              <strong>« y a-t-il des issues communes ? »</strong> Si oui, on ne les compte
              qu’une fois.
            </p>
            <p className="text-slate-600">
              Et pour vérifier : l’intersection est toujours plus petite que chacun des deux
              événements ; la réunion est toujours plus grande.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — Les deux bornes de l'échelle, décrites. */
    5: [
      {
        id: 'impossible-certain',
        type: 'vocabulaire',
        title: 'Impossible et certain',
        summary:
          'Un événement sans aucune issue est impossible (P = 0) ; un événement qui contient toutes les issues est certain (P = 1).',
        body: (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
                <div className="font-mono text-lg font-black text-slate-700">P = 0</div>
                <div className="mt-1 text-xs text-slate-500">aucune issue · impossible</div>
              </div>
              <div className="rounded-xl border-2 border-emerald-200 bg-white p-3">
                <div className="font-mono text-lg font-black text-emerald-700">P = 1</div>
                <div className="mt-1 text-xs text-slate-500">toutes les issues · certain</div>
              </div>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              <strong>Rare n’est pas impossible.</strong> Un billet gagnant sur 10 000 a une
              probabilité de 1/10 000 : minuscule, mais non nulle.
            </div>
            <p className="text-sm text-slate-600">
              Ces deux événements sont contraires l’un de l’autre — et 0 + 1 = 1.
            </p>
          </div>
        ),
      },
    ],
  },
};
