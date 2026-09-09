import React from 'react';

/**
 * Connaissances de la leçon « Calcul littéral » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     termes semblables → réduire (M1, M2)
 *          ↓
 *     distributivité simple, lue sur l'aire (M3)
 *          ↓                    ↘
 *     double distributivité (M4)  factoriser (M5)  ← le chemin INVERSE
 *          ↓                    ↙
 *     tester une égalité (M6)
 *
 * Rien n'y est arbitraire : on ne peut pas développer sans savoir réduire le
 * résultat (M1 avant M3), et factoriser (M5) n'a de sens qu'une fois qu'on a
 * vu ce que développer produit — c'est le même rectangle, lu à l'envers.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées au module
 * qui le déclare.
 *
 * Ce que cette carte NE contient PAS : le sens de la lettre, l'écriture d'une
 * expression à partir d'un motif, la substitution. Ce sont les acquis de 5e,
 * listés dans `priorKnowledge` et diagnostiqués au module 0. Elle ne contient
 * pas non plus la résolution d'équations, qui est la leçon suivante.
 */

/** Deux tuiles, pour illustrer ce qui se regroupe et ce qui ne se regroupe pas. */
const Tuiles = ({ x = 0, unites = 0 }) => (
  <span className="inline-flex flex-wrap items-center gap-1 align-middle">
    {Array.from({ length: x }, (_, i) => (
      <span
        key={`x${i}`}
        className="inline-flex h-7 min-w-[30px] items-center justify-center rounded-lg border-2 border-blue-300 bg-blue-50 text-xs font-bold text-blue-800"
      >
        x
      </span>
    ))}
    {Array.from({ length: unites }, (_, i) => (
      <span
        key={`u${i}`}
        className="inline-flex h-7 min-w-[26px] items-center justify-center rounded border-2 border-slate-300 bg-slate-50 text-xs font-bold text-slate-700"
      >
        1
      </span>
    ))}
  </span>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Ce qui se regroupe, constaté sur les tuiles. Aucun vocabulaire
       encore : le mot « terme semblable » arrive au M2. */
    1: [
      {
        id: 'ce-qui-se-regroupe',
        type: 'concepts',
        title: 'Ce qui se regroupe',
        summary: 'On ne réunit que des objets de même nature : des x avec des x, des unités avec des unités.',
        visual: (
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Tuiles x={3} />
              <span className="font-black text-slate-500">+</span>
              <Tuiles x={2} />
              <span className="font-black text-emerald-600">=</span>
              <Tuiles x={5} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tuiles x={3} />
              <span className="font-black text-slate-500">+</span>
              <Tuiles unites={2} />
              <span className="font-black text-rose-500">≠</span>
              <Tuiles x={5} />
            </div>
          </div>
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Trois tuiles <strong>x</strong> et deux tuiles <strong>x</strong> font cinq tuiles{' '}
              <strong>x</strong> : c’est un simple comptage d’objets identiques.
            </p>
            <p className="text-sm text-slate-700">
              Mais trois tuiles <strong>x</strong> et deux tuiles <strong>unité</strong> ne font
              rien de plus court : ce ne sont pas les mêmes objets. On écrit{' '}
              <strong className="font-mono">3x + 2</strong>, et on s’arrête là — l’expression{' '}
              <em>est déjà</em> sa forme la plus courte.
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : le bouton « Regrouper » qui refusait de réunir un x et une unité.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Le mot, et la méthode. */
    2: [
      {
        id: 'termes-semblables',
        type: 'vocabulaire',
        title: 'Termes semblables',
        summary: 'Deux termes sont semblables quand ils ont la même partie littérale — c’est la condition pour les regrouper.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Dans <strong className="font-mono">5x</strong>, le <strong>5</strong> est le{' '}
              <strong>coefficient</strong> et le <strong>x</strong> la{' '}
              <strong>partie littérale</strong>.
            </p>
            <div className="space-y-1.5 rounded-xl border border-violet-100 bg-white p-3 text-sm">
              <div className="text-slate-700">
                <strong className="text-emerald-700">semblables</strong> : 3x et −7x — même partie
                littérale
              </div>
              <div className="text-slate-700">
                <strong className="text-rose-600">non semblables</strong> : 3x et 3 — l’un a un x,
                l’autre non
              </div>
            </div>
            <p className="text-sm text-slate-600">
              <strong>Réduire</strong> une expression, c’est additionner les coefficients des
              termes semblables. Le signe fait partie du terme : dans 3x − 7x, les coefficients
              sont 3 et −7, et leur somme vaut −4.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-ne-melange-pas',
        type: 'memoriser',
        title: '⭐ 3x + 2 ne fait pas 5x',
        summary: 'On n’additionne que des termes de même partie littérale.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
              <div className="font-mono text-lg font-black text-rose-700 sm:text-xl">
                3x + 2x = 5x
              </div>
              <div className="font-mono text-lg font-black text-rose-700 sm:text-xl">
                3x + 2 reste 3x + 2
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">
              Vérification : pour x = 10, 3x + 2 vaut 32 — pas 50.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — La distributivité simple, lue sur l'aire. */
    3: [
      {
        id: 'distributivite-simple',
        type: 'regles',
        title: 'La distributivité simple',
        summary: 'k(a + b) = ka + kb : le facteur devant la parenthèse multiplie CHAQUE terme, pas seulement le premier.',
        visual: (
          <div className="overflow-hidden rounded-lg border-2 border-slate-400">
            <div className="grid" style={{ gridTemplateColumns: '55% 45%' }}>
              <div className="flex h-16 items-center justify-center border-2 border-white bg-sky-300 font-black text-sky-900">
                3x
              </div>
              <div className="flex h-16 items-center justify-center border-2 border-white bg-emerald-300 font-black text-emerald-900">
                6
              </div>
            </div>
          </div>
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Un rectangle de hauteur 3 et de largeur (x + 2) a une aire qu’on peut calculer de deux
              façons : d’un bloc, <strong className="font-mono">3(x + 2)</strong>, ou morceau par
              morceau, <strong className="font-mono">3x + 6</strong>. C’est la même aire, donc les
              deux écritures sont égales.
            </p>
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50/60 p-3 text-sm text-slate-700">
              <strong className="text-rose-700">L’erreur à éviter :</strong> écrire 3(x + 2) = 3x + 2.
              Le morceau de droite aurait alors une aire de 2 au lieu de 6 — on l’a{' '}
              <strong>oublié en chemin</strong>.
            </div>
            <p className="text-sm text-slate-600">
              Le signe du facteur se distribue aussi : −2(x − 5) = −2x + 10.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — La double distributivité. */
    4: [
      {
        id: 'double-distributivite',
        type: 'regles',
        title: 'La double distributivité',
        summary: '(a + b)(c + d) donne QUATRE produits : chaque terme de la première parenthèse multiplie chaque terme de la seconde.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-center font-mono text-sm text-slate-700">
              (x + 3)(x + 2) = x² + 2x + 3x + 6 = x² + 5x + 6
            </div>
            <p className="text-sm text-slate-700">
              Quand les <strong>deux</strong> dimensions du rectangle sont des sommes, il se découpe
              en <strong>quatre</strong> morceaux — un par produit. Aucun ne doit être oublié.
            </p>
            <p className="text-sm text-slate-600">
              On termine toujours en <strong>réduisant</strong> : les deux morceaux du milieu sont
              des termes semblables (2x et 3x), ils se regroupent en 5x.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — Factoriser, le chemin inverse. */
    5: [
      {
        id: 'factoriser',
        type: 'methodes',
        title: 'Factoriser',
        summary: 'Factoriser, c’est refaire le chemin inverse du développement : retrouver le facteur commun et le sortir.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-amber-200 bg-white p-3 text-center font-mono text-sm text-slate-700">
              6x + 15 = 3 × 2x + 3 × 5 = <strong className="text-amber-700">3(2x + 5)</strong>
            </div>
            <p className="text-sm text-slate-700">
              On cherche le plus grand nombre qui divise <strong>tous</strong> les termes — ici 3 —
              puis on l’écrit devant une parenthèse contenant ce qui reste.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <strong>Vérification immédiate :</strong> redévelopper doit redonner l’expression de
              départ. 3(2x + 5) = 6x + 15 ✓
            </div>
          </div>
        ),
      },
      {
        id: 'mem-developper-factoriser',
        type: 'memoriser',
        title: '⭐ Deux chemins, un seul rectangle',
        summary: 'Développer enlève les parenthèses, factoriser les remet.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
              <div className="font-mono text-base font-black text-rose-700 sm:text-lg">
                3(2x + 5) →<span className="text-xs"> développer </span>→ 6x + 15
              </div>
              <div className="font-mono text-base font-black text-rose-700 sm:text-lg">
                6x + 15 →<span className="text-xs"> factoriser </span>→ 3(2x + 5)
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">
              Chacun vérifie l’autre : si le retour ne retombe pas juste, il y a une erreur.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — Tester une égalité. */
    6: [
      {
        id: 'tester-une-egalite',
        type: 'methodes',
        title: 'Tester une égalité',
        summary: 'Une seule valeur qui ne marche pas suffit à prouver qu’une égalité est fausse — mais aucune valeur ne suffit à prouver qu’elle est vraie.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Pour tester si <strong className="font-mono">3(x + 2) = 3x + 2</strong>, on remplace x
              par un nombre et on calcule <strong>les deux membres séparément</strong>.
            </p>
            <div className="space-y-1 rounded-xl border border-rose-100 bg-white p-3 font-mono text-sm text-slate-700">
              <div>pour x = 4 : 3(4 + 2) = 18</div>
              <div>pour x = 4 : 3 × 4 + 2 = 14</div>
              <div className="font-bold text-rose-600">18 ≠ 14 → l’égalité est FAUSSE</div>
            </div>
            <p className="text-sm text-slate-700">
              Un <strong>contre-exemple</strong> suffit pour démolir une égalité. Mais si elle
              marche pour x = 4, elle pourrait échouer pour x = 7 : seul le{' '}
              <strong>calcul littéral</strong> — développer, réduire — prouve qu’elle est vraie pour
              TOUTE valeur.
            </p>
          </div>
        ),
      },
    ],
  },
};
