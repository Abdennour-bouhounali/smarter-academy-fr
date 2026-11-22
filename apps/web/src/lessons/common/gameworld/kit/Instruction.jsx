/**
 * What every game world shows the student about WHERE HE IS in the story (owner, 2026-11-19 — for all the games):
 *
 *   Instruction   the instruction of the moment — BIG, on screen until it is done. He may fold it and open it again; a new
 *                 instruction always opens (the world gives it a `key`: its text). `compact`: one line, while the world
 *                 shows something under it that must stay clear (a bridge being built and its equation).
 *   Recall        what matters from the island before (the gap he crossed, the planks that filled it, what he found), on
 *                 the right of the game, so that he connects one island to the next. Four lines at most. `title`:
 *                 the world's own words for it (default: the islands').
 *
 * Both name no world and no lesson: the world's `Hud` passes them its words. Lines may hold `$…$` (they go through `MathText`).
 */
import { useState } from 'react';
import { ChevronDown, ChevronUp, Target } from 'lucide-react';
import MathText from '../../components/MathText';
import { KT } from './text';

export function Instruction({ text, compact = false }) {
  const [folded, setFolded] = useState(false);
  if (!text) return null;
  const label = folded ? KT.instruction.show : KT.instruction.hide;
  return (
    <div
      className={`di-instruction ${folded ? 'is-folded' : ''} ${compact ? 'is-compact' : ''}`}
      data-di-instruction={folded ? 'folded' : 'open'}
    >
      <button
        type="button"
        className="di-instruction__fold"
        onClick={() => setFolded((f) => !f)}
        aria-expanded={!folded}
        aria-label={label}
        title={label}
        data-di-instruction-fold
      >
        <Target size={18} aria-hidden="true" />
        <span>{KT.instruction.label}</span>
        {folded ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronUp size={18} aria-hidden="true" />}
      </button>
      {!folded && (
        <p className="di-objective">
          <MathText>{text}</MathText>
        </p>
      )}
    </div>
  );
}

export function Recall({ lines, title = KT.recall.title }) {
  if (!lines?.length) return null;
  return (
    <aside className="di-recall" data-di-recall={lines.length}>
      <h3>{title}</h3>
      <ul>
        {lines.slice(0, 3).map((line) => (
          <li key={line}>
            <MathText>{line}</MathText>
          </li>
        ))}
      </ul>
    </aside>
  );
}
