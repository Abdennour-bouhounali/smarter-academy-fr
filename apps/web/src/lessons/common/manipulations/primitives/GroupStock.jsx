import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';
import DropZone from './DropZone';
import DraggableObject from './DraggableObject';
import ItemFigure from './ItemFigure';
import { ITEM_THEMES, resolveItemTheme } from './itemThemes';

/**
 * LA RÉSERVE DE GROUPES — le geste « ajouter un groupe » (distribuer).
 *
 * L'élève TIRE un emballage vide (baskets, bibs, bags…) de la réserve jusqu'à
 * la table (`group:add` → zone `table` du type), ou en RAMÈNE un
 * (`group:remove` → zone `stock`) ; − / + font le même geste sans glisser. k
 * monte de 1 en 1, et chaque ajout redistribue tous les objets : le motif
 * ✓ / ✗ se construit sous les yeux (MANIPULATION_DNA §3.1), au lieu d'un rail
 * de nombres où l'on sautait sur la bonne réponse.
 *
 * Utilisé par `common-divisors` (leçons 4, 5) et `coprime-explorer` (leçon 7) :
 * « premiers entre eux » est le cas PGCD = 1 des groupes identiques, et
 * l'élève retrouve le même instrument. Le type garde la logique (addGroup /
 * removeGroup, `logic/commonDivisors`) et les zones ; cette brique ne dessine
 * que la réserve, les boutons et la trace des essais.
 *
 * `tried` : { k: 'common' | 'single' | 'no' } — la TRACE, pas des boutons.
 */
export function GroupWrapper({ theme }) {
  const T = ITEM_THEMES[resolveItemTheme(theme)];
  return (
    <span className="flex items-end gap-0.5 rounded-lg border-2 border-dashed border-emerald-500 bg-white px-1.5 py-1">
      <ItemFigure kind={T.itemA.kind} tone={T.itemA.tone} width={14} />
      <ItemFigure kind={T.itemB.kind} tone={T.itemB.tone} width={14} />
    </span>
  );
}

export default function GroupStock({ drag, theme, words, k, canAdd, onAdd, onRemove, tried = {} }) {
  const { t } = useTranslation('lesson');
  const list = Object.keys(tried).map(Number).sort((x, y) => x - y);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-2" data-group-row>
        <DropZone drag={drag} id="stock" label={words.stock} tone="emerald" minHeight="min-h-[56px]" className="flex items-center gap-2 px-2 py-1" data-group-stock>
          <DraggableObject drag={drag} id="group:add" label={words.add} className="rounded-lg"><GroupWrapper theme={theme} /></DraggableObject>
          <span className="text-xs font-bold text-emerald-900">{words.stock}</span>
        </DropZone>
        <div className="flex items-center gap-1.5" data-group-buttons>
          <button type="button" onClick={onRemove} aria-label={words.remove} disabled={k === null}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <Minus className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="min-w-[5.5rem] text-center text-sm font-bold text-slate-700">
            {t('manipulation.common.onTable')}: <b dir="ltr" data-groups-count className="text-base">{k ?? 0}</b>
          </span>
          <button type="button" onClick={onAdd} aria-label={words.add} disabled={!canAdd} data-group-add
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {list.length > 0 && (
        <div className="flex flex-wrap items-center gap-1" data-groups-tried>
          <span className="text-[11px] font-bold text-slate-600">{t('manipulation.common.groupsTried')}:</span>
          {/* Les nombres se lisent de gauche à droite, 1 → k, comme une réglette. */}
          <span dir="ltr" className="flex flex-wrap gap-1">
            {list.map((n) => {
              const mark = tried[n];
              const cls = mark === 'common' ? 'border-emerald-500 bg-emerald-100 text-emerald-900' : mark === 'single' ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-300 bg-slate-50 text-slate-500';
              const label = t(mark === 'common' ? 'manipulation.common.triedBoth' : mark === 'single' ? 'manipulation.common.triedOne' : 'manipulation.common.triedNone', { k: n });
              return (
                <span key={n} title={label} aria-label={label} data-tried-k={n} data-tried-mark={mark}
                  className={`rounded-md border px-1.5 font-mono text-xs font-bold ${cls}`}>
                  {n}{mark === 'common' ? ' ✓' : ''}
                </span>
              );
            })}
          </span>
        </div>
      )}
    </div>
  );
}
