/**
 * « La machine aux quatre phrases » — two numbers go in, four sentences come out: true TOGETHER or false TOGETHER, with the equality that
 * proves it. The lever swaps the two numbers: the classic trap (« 6 est un diviseur de 42 » against « 42 est un diviseur de 6 ») is one pull away.
 */
import { Tool, Txt, useChime } from '../kit';
import { sentences } from '../logic';

export default function Sentences({ a, b, setA, setB, play, report }) {
  const S = sentences(a, b);
  const swap = () => {
    setA(b);
    setB(a);
    report({ key: `${b}:${a}`, swapped: true });
    play('swap');
  };
  useChime(play, S.ok ? 'fit' : 'rest', true, [a, b], { delay: 240 }); // the four sentences fall: true together, or false together
  return (
    <Tool
      id="sentences"
      tone={S.ok ? 'good' : 'warm'}
      reading={
        <>
          <Txt>{S.proof}</Txt>
          <span
            className={`ll-chip ${S.ok ? 'll-chip--good' : 'll-chip--warm'}`}
            data-ll-verdict={S.ok ? 'true' : 'false'}
          >
            {S.ok ? 'Les quatre phrases sont vraies ensemble' : 'Les quatre phrases sont fausses ensemble'}
          </span>
        </>
      }
    >
      <div className="ll-sent">
        <div className="ll-sent__machine">
          <div className="ll-sent__nums">
            <div>
              <b data-ll-sa>{a}</b>
              <span>Premier nombre</span>
            </div>
            <div>
              <b data-ll-sb className="is-second">
                {b}
              </b>
              <span>Deuxième nombre</span>
            </div>
          </div>
          <button type="button" className="ll-btn" onClick={swap} data-ll-swap>
            ⇄ Échange les deux nombres
          </button>
        </div>
        <div className="ll-sent__cards">
          {S.list.map((t, i) => (
            <div
              key={`${i}-${a}-${b}`}
              className={`ll-sent__card ${S.ok ? 'is-ok' : 'is-ko'}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <i>{S.ok ? '✓' : '✗'}</i>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </Tool>
  );
}
