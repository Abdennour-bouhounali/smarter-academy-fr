/** One block of a revision step. The kinds are the whole vocabulary of a revision page (REVISION_PAGE.md §2). */
import MathText from '../../lessons/common/components/MathText';
import GeoFigure from '../../lessons/common/components/GeoFigure';

const SOLUTION = 'Corrigé';

function Line({ line }) {
  if (line.list || line.steps) {
    const List = line.steps ? 'ol' : 'ul';
    return (
      <List>
        {(line.steps ?? line.list).map((item) => (
          <li key={item}>
            <MathText>{item}</MathText>
          </li>
        ))}
      </List>
    );
  }
  if (line.formula) {
    return (
      <p className="rv-formula">
        <MathText>{line.formula}</MathText>
      </p>
    );
  }
  return (
    <p className={line.concl ? 'rv-concl' : undefined}>
      <MathText>{line.concl ?? line.p}</MathText>
    </p>
  );
}

export default function RevisionBlock({ block }) {
  if (block.kind === 'text' || block.kind === 'note') {
    return (
      <p className={block.kind === 'note' ? 'rv-note' : undefined}>
        <MathText>{block.text}</MathText>
      </p>
    );
  }
  if (block.kind === 'figure') return <GeoFigure {...block.figure} />;
  if (block.kind === 'table') {
    return (
      <div className="rv-table">
        <table>
          <thead>
            <tr>
              {block.head.map((cell) => (
                <th key={cell}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.join('|')}>
                {row.map((cell, i) => (
                  <td key={i}>
                    <MathText>{cell}</MathText>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className={`rv-box rv-box--${block.kind}`}>
      {block.kind === 'task' ? (
        <p className="rv-box__head">
          <b>{block.title}</b>
          {block.level && <span>{block.level}</span>}
        </p>
      ) : (
        block.tag && (
          <p className="rv-box__tag">
            <MathText>{block.tag}</MathText>
          </p>
        )
      )}
      {block.body.map((line, i) => (
        <Line key={i} line={line} />
      ))}
      {block.solution && (
        <details>
          <summary>{SOLUTION}</summary>
          <div className="rv-solution">
            {block.solution.map((text) => (
              <p key={text}>
                <MathText>{text}</MathText>
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
