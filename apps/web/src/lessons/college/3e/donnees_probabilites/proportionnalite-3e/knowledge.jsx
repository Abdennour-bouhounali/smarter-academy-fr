import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Proportionnalité » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * où l'élève vient de le rencontrer par le geste, puis il reste sur sa carte.
 *
 * ORDRE. La reconnaissance d'une situation proportionnelle (M1) avant le
 * coefficient (M2), le coefficient avant les quatre chemins (M3), et les
 * chemins avant l'agrandissement (M4) — qui est le cas où l'un d'eux, appliqué
 * aux aires, cesse justement de marcher.
 */

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Reconnaître : multiplier par un même nombre, et l'origine. */
    1: [
      {
        id: 'situation-proportionnelle',
        type: 'concepts',
        title: 'Situation de proportionnalité',
        summary: 'Deux grandeurs sont proportionnelles quand on passe de l’une à l’autre en multipliant toujours par le même nombre.',
        body: (
          <div className="space-y-3">
            <p>Doubler la première grandeur double la seconde ; la tripler la triple. Le passage
            se fait toujours par la <strong>même multiplication</strong>.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
              Une recette pour 4 personnes, refaite pour 8, demande exactement le double de chaque
              ingrédient — pas « un peu plus ».
            </div>
            <p className="text-xs text-slate-500">Attention : « quand l’un augmente, l’autre
            augmente » ne suffit pas. L’âge et la taille augmentent ensemble sans être
            proportionnels.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la recette pour 7 — tu as
            cherché ce qui restait constant d’une colonne à l’autre.</div>
          </div>
        ),
      },
      {
        id: 'droite-par-origine',
        type: 'regles',
        title: 'Une droite qui passe par l’origine',
        summary: 'Représentée graphiquement, une situation proportionnelle donne des points alignés avec l’origine.',
        body: (
          <div className="space-y-2">
            <p>Les points s’alignent, <strong>et</strong> leur droite passe par le point
            <MathText>{' $(0 \\; ; \\; 0)$'}</MathText> : zéro de l’une correspond à zéro de
            l’autre.</p>
            <p className="text-xs text-slate-500">Des points alignés qui ne passent PAS par
            l’origine ne sont pas une situation de proportionnalité — c’est le test le plus rapide
            sur un graphique.</p>
          </div>
        ),
      },
    ],

    /* M2 — Le coefficient : la valeur pour une unité. */
    2: [
      {
        id: 'coefficient-proportionnalite',
        type: 'concepts',
        title: 'Coefficient de proportionnalité',
        summary: 'C’est le rapport « seconde grandeur ÷ première grandeur », identique dans toutes les colonnes : la valeur pour une unité.',
        body: (
          <div className="space-y-3">
            <p>Le <strong>coefficient</strong> est le nombre par lequel on multiplie pour passer
            d’une grandeur à l’autre. On l’obtient en divisant une valeur de la seconde ligne par
            celle qui lui correspond.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
              Il se lit toujours comme une valeur <strong>pour une unité</strong> : des litres par
              kilomètre, des kilomètres par heure, un prix par kilo.
            </div>
            <p className="text-xs text-slate-500">S’il change d’une colonne à l’autre, la situation
            n’est pas proportionnelle.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le nombre caché, le même
            dans chaque colonne du tableau.</div>
          </div>
        ),
      },
    ],

    /* M3 — Les quatre chemins vers une case vide. */
    3: [
      {
        id: 'quatre-chemins',
        type: 'methodes',
        title: 'Quatre chemins vers une case vide',
        summary: 'Passer par l’unité, multiplier une colonne, appliquer le coefficient, ou faire le produit en croix : les quatre donnent le même résultat.',
        body: (
          <div className="space-y-3">
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Par l’unité</strong> : trouver la valeur pour 1, puis multiplier.</li>
              <li><strong>Par un facteur</strong> : multiplier une colonne entière par un même
              nombre (les deux lignes).</li>
              <li><strong>Par le coefficient</strong> : multiplier directement la première
              grandeur.</li>
              <li><strong>Produit en croix</strong> : les produits en diagonale sont égaux.</li>
            </ul>
            <p className="text-xs text-slate-500">Ils concordent toujours — mais seulement dans une
            situation proportionnelle. Choisis celui que les nombres rendent le plus simple.</p>
          </div>
        ),
      },
    ],

    /* M4 — Agrandir : longueurs, aires, volumes. */
    4: [
      {
        id: 'agrandissement-reduction',
        type: 'concepts',
        title: 'Agrandissement et réduction',
        summary: 'Dans un agrandissement de rapport k, toutes les longueurs sont multipliées par k.',
        body: (
          <div className="space-y-2">
            <p>Un agrandissement (ou une réduction) de rapport <MathText>{'$k$'}</MathText>
            multiplie <strong>toutes</strong> les longueurs par le même nombre
            <MathText>{' $k$'}</MathText> : c’est ce qui conserve la forme.</p>
            <p className="text-xs text-slate-500">Si <MathText>{'$k > 1$'}</MathText> la figure
            grandit, si <MathText>{'$k < 1$'}</MathText> elle rétrécit.</p>
          </div>
        ),
      },
      {
        id: 'mem-aires-volumes',
        type: 'memoriser',
        title: '⭐ Longueurs × k, aires × k², volumes × k³',
        summary: 'Les aires et les volumes ne suivent pas le rapport des longueurs : ils suivent son carré et son cube.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="text-base font-black text-rose-700">
              longueurs × <MathText>{'$k$'}</MathText> · aires × <MathText>{'$k^2$'}</MathText> ·
              volumes × <MathText>{'$k^3$'}</MathText>
            </div>
            <p className="text-xs text-rose-700">Doubler les longueurs quadruple l’aire. C’est
            l’erreur la plus fréquente : les aires ne sont PAS proportionnelles aux longueurs.</p>
          </div>
        ),
      },
    ],

    /* M5 — Pourcentages et coefficient multiplicateur. */
    5: [
      {
        id: 'coefficient-multiplicateur',
        type: 'methodes',
        title: 'Le coefficient multiplicateur',
        summary: 'Augmenter de 20 %, c’est multiplier par 1,20 ; diminuer de 20 %, c’est multiplier par 0,80.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                augmenter de <MathText>{'$t$'}</MathText> % → multiplier par
                <MathText>{' $1 + \\dfrac{t}{100}$'}</MathText>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                diminuer de <MathText>{'$t$'}</MathText> % → multiplier par
                <MathText>{' $1 - \\dfrac{t}{100}$'}</MathText>
              </div>
            </div>
            <p className="text-xs text-slate-500">Un coefficient permet d’enchaîner les évolutions
            en multipliant — et de voir qu’une hausse de 20 % suivie d’une baisse de 20 % ne
            ramène pas au prix de départ.</p>
          </div>
        ),
      },
    ],

    /* M6 — En sciences : trois grandeurs quotient. */
    6: [
      {
        id: 'grandeurs-quotient',
        type: 'concepts',
        title: 'Vitesse, masse volumique, échelle',
        summary: 'Ces trois grandeurs sont des coefficients de proportionnalité : une valeur pour une unité.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>vitesse</strong> = distance ÷ durée — des km par heure
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                <strong>masse volumique</strong> = masse ÷ volume — des g par cm³
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>échelle</strong> = longueur sur le plan ÷ longueur réelle
              </div>
            </div>
            <p className="text-xs text-slate-500">Chacune donne une droite passant par l’origine :
            c’est la même mathématique, sous trois noms de sciences.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le labo — tableau,
            graphique et situation racontaient le même nombre.</div>
          </div>
        ),
      },
    ],
  },
};
