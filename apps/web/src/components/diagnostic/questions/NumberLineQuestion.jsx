import { useState } from 'react';
import NumberLine from '../../../lessons/common/components/NumberLine';

/**
 * The diagnostic only ever asks to place a number it explicitly states in
 * the prompt (never "estimate a hidden magnitude"), so revealValue stays
 * true — hiding it here would just make it a memory test, not a
 * place-value/number-sense check.
 */
export default function NumberLineQuestion({ question, onChange, disabled }) {
  const { min, max, step } = question.numberLine;
  const [value, setValue] = useState(min);
  const [touched, setTouched] = useState(false);

  const handleChange = (next) => {
    setValue(next);
    setTouched(true);
    onChange({ value: next });
  };

  return (
    <div className="py-2">
      <NumberLine
        min={min}
        max={max}
        step={step}
        mode="place"
        value={touched ? value : undefined}
        onChange={handleChange}
        revealValue
        disabled={disabled}
        ariaLabel={question.prompt}
      />
      {!touched && (
        <p className="text-center text-xs font-inter text-slate-400 mt-2">
          Touche ou fais glisser sur la ligne pour placer le nombre.
        </p>
      )}
    </div>
  );
}
