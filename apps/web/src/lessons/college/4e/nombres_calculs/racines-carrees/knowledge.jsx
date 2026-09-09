import React from 'react';
import MathText from '../../../../common/components/MathText';
import { carresParfaits } from './components/racines4e';

/**
 * Connaissances de la leçon « Racine carrée » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     certains nombres forment un carré, d'autres non (M1)
 *          ↓
 *     le symbole √, l'opération inverse du carré (M2)
 *          ↓
 *     les carrés parfaits, sus par cœur (M3)
 *          ↓
 *     encadrer ce qui ne tombe pas juste (M4)   ← EXIGE M3
 *          ↓
 *     x² = a et ses deux solutions (M5)
 *          ↓
 *     problèmes d'aire → longueur (M6)
 *
 * Rien n'y est arbitraire : on ne peut pas encadrer √50 (M4) sans connaître
 * les carrés parfaits qui l'entourent (M3), et x² = a (M5) suppose qu'on
 * sache déjà ce que vaut √a.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées au module
 * qui le déclare.
 *
 * CE QUE CETTE CARTE NE CONTIENDRA JAMAIS — la frontière avec la 3e : le
 * produit et le quotient de racines, la simplification a√b, la comparaison
 * par les carrés. Ce sont les items de `racines-carrees-3e`, et les y voir
 * apparaître ici signifierait que la 4e a volé le contenu du niveau suivant.
 */

/** La table des carrés parfaits, réutilisée par les items. */
const TableCarres = ({ max = 144 }) => (
  <div className="grid grid-cols-4 gap-1 sm:grid-cols-7">
    {carresParfaits(max).slice(1).map(({ racine: r, carre: c }) => (
      <div key={r} className="rounded-lg border border-sky-200 bg-white px-1.5 py-1 text-center">
        <div className="font-mono text-xs text-slate-500">{r}²</div>
        <div className="font-mono text-sm font-bold text-sky-700">{c}</div>
      </div>
    ))}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le constat, sans le mot. Aucune notation encore. */
    1: [
      {
        id: 'carre-ou-pas',
        type: 'concepts',
        title: 'Les nombres qui forment un carré',
        summary: 'Certains nombres de carreaux se rangent exactement en carré ; la plupart laissent des carreaux orphelins.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Avec <strong>49</strong> carreaux, on obtient un carré de <strong>7</strong> de côté,
              sans rien qui dépasse. Avec <strong>50</strong>, il reste un carreau tout seul : aucun
              rangement en carré n’est possible.
            </p>
            <p className="text-sm text-slate-700">
              Ranger les carreaux en carré, c’est répondre à une question nouvelle : on connaît
              l’<strong>aire</strong> (le nombre de carreaux) et on cherche le{' '}
              <strong>côté</strong>. C’est le problème <strong>inverse</strong> de celui qu’on sait
              déjà résoudre — jusqu’ici on donnait le côté et on calculait l’aire.
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : les carreaux rouges qui restaient à côté du carré.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Le nom et le symbole, posés comme CONSÉQUENCE du M1. */
    2: [
      {
        id: 'racine-carree',
        type: 'concepts',
        title: 'La racine carrée',
        summary: 'La racine carrée d’un nombre positif a est le nombre positif dont le carré vaut a. On la note √a.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-violet-200 bg-white p-3 text-center">
              <MathText className="text-lg font-bold text-violet-700">
                {'$\\sqrt{49} = 7$'}
              </MathText>
              <p className="mt-1 text-xs text-slate-500">
                parce que <MathText>{'$7 \\times 7 = 49$'}</MathText>
              </p>
            </div>
            <p className="text-sm text-slate-700">
              <MathText>{'$\\sqrt{a}$'}</MathText> est le <strong>côté</strong> d’un carré
              d’aire <strong>a</strong>. C’est l’opération qui <strong>défait</strong> le carré,
              comme la division défait la multiplication.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Deux points à retenir dès maintenant :
              <br />• <MathText>{'$\\sqrt{a}$'}</MathText> est toujours <strong>positif</strong> ;
              <br />• un nombre <strong>négatif</strong> n’a pas de racine carrée : aucun nombre
              multiplié par lui-même ne donne un résultat négatif.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-pas-la-moitie',
        type: 'memoriser',
        title: '⭐ La racine n’est pas la moitié',
        summary: '√36 vaut 6, jamais 18.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
              <MathText className="text-lg font-black text-rose-700 sm:text-xl">
                {'$\\sqrt{36} = 6$'}
              </MathText>
              <div className="text-sm font-bold text-rose-700">et non 18</div>
            </div>
            <p className="text-center text-xs text-slate-500">
              Le test qui tranche : 6 × 6 = 36 ✓, alors que 18 × 18 = 324.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Les carrés parfaits. */
    3: [
      {
        id: 'carres-parfaits-4e',
        type: 'memoriser',
        title: '⭐ Les carrés parfaits',
        summary: 'Les carrés des entiers de 1 à 12 — les connaître par cœur rend tout le reste immédiat.',
        visual: <TableCarres />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Un <strong>carré parfait</strong> est le carré d’un entier. Ce sont exactement les
              nombres de carreaux qui se rangent en carré plein.
            </p>
            <p className="text-sm text-slate-700">
              Les savoir par cœur donne immédiatement la racine :{' '}
              <MathText>{'$\\sqrt{81} = 9$'}</MathText> se lit dans la table, sans calcul. Et
              surtout, cela permettra d’<strong>encadrer</strong> les racines qui ne tombent pas
              juste.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — L'encadrement. Exige les carrés parfaits du M3. */
    4: [
      {
        id: 'encadrer-une-racine',
        type: 'methodes',
        title: 'Encadrer une racine',
        summary: 'On cherche les deux carrés parfaits qui entourent le nombre : leurs racines encadrent la racine cherchée.',
        body: (
          <div className="space-y-3">
            <div className="space-y-1 rounded-xl border-2 border-emerald-200 bg-white p-3 font-mono text-sm text-slate-700">
              <div className="text-slate-500">Encadrer √50 :</div>
              <div>49 &lt; 50 &lt; 64</div>
              <div>7² &lt; 50 &lt; 8²</div>
              <div className="font-bold text-emerald-700">
                <MathText>{'$7 < \\sqrt{50} < 8$'}</MathText>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              La plupart des nombres ne sont pas des carrés parfaits : leur racine n’est{' '}
              <strong>pas un entier</strong>, et souvent pas non plus un nombre décimal. On ne peut
              alors pas l’écrire exactement — mais on peut toujours dire{' '}
              <strong>entre quels entiers</strong> elle se trouve.
            </p>
            <p className="text-sm text-slate-600">
              Le réflexe : chercher le carré parfait juste en dessous et celui juste au-dessus.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — x² = a. */
    5: [
      {
        id: 'x-carre-egale-a',
        type: 'regles',
        title: 'Résoudre x² = a',
        summary: 'Pour a > 0, l’équation x² = a a DEUX solutions : √a et −√a. Pour a < 0, elle n’en a aucune.',
        body: (
          <div className="space-y-3">
            <div className="space-y-1.5 rounded-xl border-2 border-amber-200 bg-white p-3 text-sm text-slate-700">
              <div>
                <MathText>{'$x^2 = 25$'}</MathText> → deux solutions :{' '}
                <strong className="text-amber-700">5 et −5</strong>
              </div>
              <div>
                <MathText>{'$x^2 = 0$'}</MathText> → une seule : <strong>0</strong>
              </div>
              <div>
                <MathText>{'$x^2 = -9$'}</MathText> → <strong className="text-rose-600">aucune
                solution</strong>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Oublier la solution négative est l’erreur la plus fréquente : (−5) × (−5) = 25 tout
              autant que 5 × 5 = 25. Deux nombres opposés ont toujours le même carré.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Attention à ne pas confondre : <MathText>{'$\\sqrt{25}$'}</MathText> désigne UN seul
              nombre, le positif (5) ; c’est l’<strong>équation</strong> x² = 25 qui a deux
              solutions.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — Le retour au concret. */
    6: [
      {
        id: 'racine-dans-un-probleme',
        type: 'methodes',
        title: 'Remonter d’une aire à une longueur',
        summary: 'Dès qu’un problème donne l’aire d’un carré et demande son côté, c’est une racine carrée.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Le signal, dans un énoncé : on connaît une <strong>aire</strong> (en m², cm²…) et on
              cherche une <strong>longueur</strong>. Le calcul remonte alors dans le sens inverse
              de d’habitude.
            </p>
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-sm text-slate-700">
              « Un terrain carré a une aire de 169 m². Quel est son côté ? »
              <br />
              → côté = <MathText>{'$\\sqrt{169} = 13$'}</MathText> m
              <br />
              <span className="text-slate-500">Vérification : 13 × 13 = 169 ✓</span>
            </div>
            <p className="text-sm text-slate-600">
              Deux contrôles à faire : le résultat vérifie-t-il l’énoncé une fois remis au carré, et
              la longueur trouvée a-t-elle une taille plausible ?
            </p>
          </div>
        ),
      },
    ],
  },
};
