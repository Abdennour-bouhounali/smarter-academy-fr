import ItemFigure from './ItemFigure';
import { ITEM_THEMES, resolveItemTheme } from './itemThemes';
import { groupingLayout, itemSizeCss, GROUP_SCALE, PILE_SCALE } from './groupingLayout';

/**
 * LA SCÈNE DES GROUPES IDENTIQUES — `a` objets d'un type et `b` d'un autre,
 * répartis en `k` groupes identiques, le reste À PART.
 *
 * C'est l'instrument commun de trois manipulations de l'unité :
 *   • `common-divisors`   les bouquets (90 rouges, 54 blanches, k bouquets)
 *   • `coprime-explorer`  les trousses (17 stylos, 18 cahiers : seul k = 1 marche)
 *   • `fraction-reduction` la recette (84 cuillères, 48 tasses, k parts →
 *                          une part = la fraction réduite)
 *
 * Le dessin EST l'argument : un groupe est un cadre qui contient `qa` objets
 * du premier type et `qb` du second — tous les cadres sont identiques, c'est
 * ce que « متماثلة » veut dire ; ce qui ne rentre dans aucun cadre est dessiné
 * penché, dans ses couleurs, dans un plateau à part — c'est le reste, un nombre d'objets qu'on
 * voit, jamais une décimale. Avant tout choix (`k` nul), la scène montre les
 * deux piles entières : rien n'est réparti d'avance.
 *
 * `theme` choisit les objets (itemThemes.js) ; `words` porte les mots arabes
 * que le type a traduits (group, itemA, itemB, leftover, more) — la scène
 * elle-même ne contient aucun texte. `highlight` désigne un groupe à mettre en
 * évidence (la « part » qu'on lit dans la recette).
 *
 * TAILLE (lisibilité au projecteur, 2026-09-24) : la scène est un conteneur
 * de requête (`container-type: inline-size`) et pose deux variables —
 * `--sa-item` (objets des piles et des cadres) et `--sa-item-left` (objets
 * restés dehors). Chaque objet, chaque cadre (`perRow` objets de large) et
 * chaque espacement se calcule à partir d'elles : les objets grandissent de
 * ×1 (téléphone) à ×2 (projecteur, ×3 pour les piles) avec la largeur de la scène, et les cadres
 * suivent sans jamais rogner un objet. La règle est `itemSizeCss`, testée.
 *
 * CONTRAT DOM (e2e) :
 *   [data-grouping-scene][data-groups=k][data-works]
 *   [data-group-card] × shown  ·  [data-group-leftover]  ·  [data-pile]
 */
export default function GroupingScene({
  a, b, k = null, theme = 'garden', words = {}, highlight = null, maxGroups = 18, ariaLabel, tone = 'emerald', compact = false,
}) {
  const T = ITEM_THEMES[resolveItemTheme(theme)];
  const L = groupingLayout({ a, b, k, maxGroups });
  const okTone = tone === 'emerald' ? 'border-emerald-300 bg-emerald-50/70' : 'border-indigo-300 bg-indigo-50/70';
  // Un objet resté DEHORS garde sa couleur : « 2 rouges et 2 blanches restent »
  // doit se voir — grisé, on ne savait plus lequel était resté (2026-09-30).
  // Il est seulement penché, hors des cadres.
  const item = (kind, t, i, left = false) => (
    <ItemFigure key={`${kind}-${i}`} kind={kind} tone={t} width={left ? 'var(--sa-item-left)' : 'var(--sa-item)'} className={left ? '-rotate-12' : ''} />
  );
  // L'espace entre deux objets suit leur taille : on les compte un à un.
  const gap = 'calc(var(--sa-item) / 8)';
  const itemRow = { gap };
  const rowWidth = `calc(${L.perRow} * (var(--sa-item) + ${gap}))`;
  const sizing = {
    containerType: 'inline-size',
    '--sa-item': itemSizeCss(L.itemWidth, L.k === null ? PILE_SCALE : GROUP_SCALE),
    '--sa-item-left': itemSizeCss(Math.max(L.itemWidth, 16), GROUP_SCALE),
  };

  const pile = (which, count) => (
    <div
      data-pile={which}
      className="flex-1 min-w-[120px] rounded-2xl border-2 border-slate-200 bg-white p-2"
    >
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-extrabold text-slate-700">
        <span>{which === 'a' ? words.itemA : words.itemB}</span>
        <span dir="ltr" className="rounded-full bg-slate-100 px-1.5 font-mono text-slate-800">{count}</span>
      </div>
      <div className="flex flex-wrap items-end" style={itemRow} dir="ltr">
        {Array.from({ length: count }, (_, i) => item(which === 'a' ? T.itemA.kind : T.itemB.kind, which === 'a' ? T.itemA.tone : T.itemB.tone, i))}
      </div>
    </div>
  );

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      data-grouping-scene
      data-groups={L.k ?? undefined}
      data-works={L.works === null ? undefined : L.works ? 'true' : 'false'}
      className="space-y-2"
      style={sizing}
    >
      {L.k === null ? (
        <div className="flex flex-wrap gap-2">
          {pile('a', a)}
          {pile('b', b)}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" dir="ltr">
            {Array.from({ length: L.shown }, (_, g) => {
              const hi = highlight === g;
              return (
                <div
                  key={g}
                  data-group-card
                  data-group-index={g}
                  className={`rounded-xl border-2 p-1.5 transition-colors ${
                    hi ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300' : L.works ? okTone : 'border-dashed border-slate-300 bg-white'
                  } ${compact ? 'min-w-[40px]' : 'min-w-[52px]'}`}
                  style={{ maxWidth: `calc(${rowWidth} + 16px)` }}
                >
                  <div dir="rtl" className="mb-1 flex items-center justify-between gap-1 text-[10px] font-extrabold text-slate-600">
                    <span>{words.group} {g + 1}</span>
                    <span dir="ltr" className="font-mono text-slate-800">{L.qa}+{L.qb}</span>
                  </div>
                  <div className="flex flex-wrap items-end" style={{ ...itemRow, width: rowWidth, maxWidth: '100%' }}>
                    {Array.from({ length: L.qa }, (_, i) => item(T.itemA.kind, T.itemA.tone, i))}
                    {Array.from({ length: L.qb }, (_, i) => item(T.itemB.kind, T.itemB.tone, i))}
                  </div>
                </div>
              );
            })}
            {L.hidden > 0 && (
              <div className="self-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-600" dir="rtl">
                {words.more?.(L.hidden)}
              </div>
            )}
          </div>

          {(L.ra > 0 || L.rb > 0) && (
            <div
              data-group-leftover
              data-leftover-a={L.ra}
              data-leftover-b={L.rb}
              className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-2"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-extrabold text-amber-900">
                <span dir="ltr" className="grid h-6 min-w-[24px] place-items-center rounded-md bg-amber-500 px-1 font-mono text-white">{L.ra + L.rb}</span>
                <span>{words.leftover}</span>
              </div>
              <div className="flex flex-wrap items-end" style={{ gap: 'calc(var(--sa-item-left) / 8)' }} dir="ltr">
                {Array.from({ length: L.ra }, (_, i) => item(T.itemA.kind, T.itemA.tone, `ra${i}`, true))}
                {Array.from({ length: L.rb }, (_, i) => item(T.itemB.kind, T.itemB.tone, `rb${i}`, true))}
              </div>
            </div>
          )}
          {L.works && words.allUsed && (
            <p data-group-all-used className="text-xs font-bold text-emerald-800">{words.allUsed}</p>
          )}
        </>
      )}
    </div>
  );
}
