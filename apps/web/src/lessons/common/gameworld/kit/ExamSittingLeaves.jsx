/**
 * A list of the exam sitting in a Fit box that is never cut and never scrolls (logic: sheetLeaves.js). While the list fits
 * — at the 12 px floor, down to Fit's smallest scale — it is ONE leaf, exactly as before: no control. When it does not, the
 * box tells it (Fit › onShort): each item is measured, and the items are split into LEAVES at a boundary between two items
 * (as few as the room allows, as even as possible). Every item stays MOUNTED, the others hidden: a box keeps what the
 * student typed when he turns the leaf. Under the box, always on screen, the pager: « السابق », the count « 1 / 2 »,
 * « التالي » (data-xs-leaves = how many, data-xs-leaf-on = the one on screen, each item data-xs-leaf = its leaf).
 *   head     what every leaf shows above its items (the sheet's title, its tip)
 *   items    [{ id, node, className, quiet }] — `quiet`: a key whose line is said once per leaf (sheetLeaves › quietOnLeaves)
 *   tail     what every leaf shows under its items
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Fit from './Fit';
import { splitLeaves, leafIndex, quietOnLeaves, keepLeaf } from './sheetLeaves';

const LEAF = { prev: 'السابق', next: 'التالي', page: 'الصفحة', more: 'تتمّة الأجوبة في الصفحة التالية' };

/** The pager: always visible under a sheet of two leaves or more. */
function LeafPager({ n, on, go }) {
  return (
    <nav className="xs-leafnav" aria-label={LEAF.page} data-xs-leaf-nav>
      <button type="button" className="xs-btn" disabled={on === 0} onClick={() => go(on - 1)} data-xs-leaf-prev>
        <ChevronRight size={17} /> {LEAF.prev}
      </button>
      <span className="xs-leafnav__count">
        {on < n - 1 && <small>{LEAF.more}</small>}
        <b dir="ltr" data-xs-leaf-count>
          {on + 1}
          {'\u00a0/\u00a0'}
          {n}
        </b>
      </span>
      <button
        type="button"
        className={`xs-btn ${on < n - 1 ? 'xs-btn--main' : ''}`}
        disabled={on === n - 1}
        onClick={() => go(on + 1)}
        data-xs-leaf-next
      >
        {LEAF.next} <ChevronLeft size={17} />
      </button>
    </nav>
  );
}

/** The items drawn on their leaves (every item mounted, the others hidden), and the pager when there are two leaves or more. */
export function LeafList({ items, leaves, on, go, head, tail, listClass = '', className, floor, onShort }) {
  const at = leafIndex(leaves, items.length);
  const quiet = quietOnLeaves(
    items.map((it) => it.quiet),
    leaves,
  );
  return (
    <div className="xs-leafcol" data-xs-leaves={leaves.length} data-xs-leaf-on={on}>
      <Fit floor={floor} className={className} onShort={onShort} version={`${leaves.length}:${on}`}>
        {head}
        <ol className={listClass}>
          {items.map((it, i) => (
            <li
              key={it.id}
              className={it.className}
              hidden={at[i] !== on}
              data-xs-leaf={at[i]}
              data-xs-quiet={quiet.has(i) ? '' : undefined}
            >
              {it.node}
            </li>
          ))}
        </ol>
        {tail}
      </Fit>
      {leaves.length > 1 && <LeafPager n={leaves.length} on={on} go={go} />}
    </div>
  );
}

/** A list that splits itself into leaves when its Fit box reaches its smallest scale and is still too tall. */
export default function Leaves({ items, ...rest }) {
  const n = items.length;
  const one = useMemo(() => [Array.from({ length: n }, (_, i) => i)], [n]);
  const [leaves, setLeaves] = useState(null);
  const [on, setOn] = useState(0);
  const heights = useRef({});
  const gap = useRef(0);
  const ids = items.map((it) => it.id).join('|');
  const state = useRef({});
  state.current = { leaves: leaves ?? one, on, ids: items.map((it) => it.id) };
  const onShort = useCallback(
    ({ have, inner }) => {
      const list = inner.querySelector(':scope > ol');
      if (!list) return;
      const lis = [...list.children];
      const { ids: names, leaves: cur, on: was } = state.current;
      const shown = lis.filter((li) => !li.hidden);
      shown.forEach((li) => {
        heights.current[names[lis.indexOf(li)]] = li.getBoundingClientRect().height;
      });
      const listH = list.getBoundingClientRect().height;
      if (shown.length > 1) {
        const sum = shown.reduce((t, li) => t + li.getBoundingClientRect().height, 0);
        gap.current = Math.max(0, (listH - sum) / (shown.length - 1));
      }
      const hs = names.map((id) => heights.current[id] ?? 0);
      const fixed = inner.getBoundingClientRect().height - listH;
      const next = splitLeaves(hs, { room: have * 0.99, fixed, gap: gap.current });
      if (JSON.stringify(next) === JSON.stringify(cur)) return;
      const l = keepLeaf(cur, was, next);
      setLeaves(next);
      setOn(l);
    },
    [ids], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // a split made for other items (never, while a sheet keeps its key) is dropped
  const valid = leaves && leaves.flat().length === n ? leaves : one;
  return <LeafList items={items} leaves={valid} on={valid === one ? 0 : on} go={setOn} onShort={onShort} {...rest} />;
}
