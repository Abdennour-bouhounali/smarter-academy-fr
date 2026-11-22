/**
 * « Les diviseurs communs » — the divisors of two numbers sorted in three trays: those of the first only, those of both, those of
 * the second only. The greatest of the middle tray wears the crown. Tap a divisor: the two equalities that prove it appear.
 */
import { useEffect, useState } from 'react';
import { Tool, M } from '../kit';
import { divisorsOf, divide } from '../logic';
import { listFr } from '../../gameworld/kit/authoring/numbers';

const proof = (n, d) => {
  const { q, r } = divide(n, d);
  return `${n} = ${d} \\times ${q}${r ? ` + ${r}` : ''}`;
};

export default function Common({ a, b, play }) {
  const [sel, setSel] = useState(null);
  useEffect(() => {
    setSel(null);
  }, [a, b]);
  const A = divisorsOf(a);
  const B = divisorsOf(b);
  const both = A.filter((d) => B.includes(d));
  const g = both.at(-1);
  const zone = (title, list, cls, id) => (
    <div className={`ll-zone ${cls}`} data-ll-zone={id}>
      <h5>{title}</h5>
      <div>
        {list.map((d) => {
          const top = id === 'both' && d === g;
          const shared = id === 'both';
          return (
            <button
              key={d}
              type="button"
              className={`ll-dchip ${sel === d ? 'is-sel' : ''} ${top ? 'is-top' : ''}`}
              onClick={() => {
                setSel(d);
                play(top ? 'crown' : shared ? 'pair' : 'select', d);
              }}
              data-ll-d={d}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
  return (
    <Tool
      id="common"
      tone="good"
      reading={
        sel === null ? (
          <>
            <M>{`\\mathrm{PGCD}(${a}\\,;\\,${b}) = ${g}`}</M>
            <span className="ll-chip ll-chip--good" data-ll-pgcd={g}>
              Diviseurs communs : {listFr(both)} — le plus grand est {g}
            </span>
          </>
        ) : (
          <>
            <M>{proof(a, sel)}</M>
            <M>{proof(b, sel)}</M>
            <span className={`ll-chip ${both.includes(sel) ? 'll-chip--good' : 'll-chip--warm'}`}>
              {both.includes(sel) ? `${sel} divise les deux nombres` : `${sel} ne divise qu’un des deux nombres`}
            </span>
          </>
        )
      }
    >
      <div className="ll-common">
        {zone(
          `Diviseurs de ${a} seulement`,
          A.filter((d) => !both.includes(d)),
          '',
          'a',
        )}
        {zone('Diviseurs communs', both, 'll-zone--both', 'both')}
        {zone(
          `Diviseurs de ${b} seulement`,
          B.filter((d) => !both.includes(d)),
          '',
          'b',
        )}
      </div>
    </Tool>
  );
}
