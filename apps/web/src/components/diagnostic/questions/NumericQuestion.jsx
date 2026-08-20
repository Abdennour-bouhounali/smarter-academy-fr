import { useState } from 'react';
import { NumberField } from '../../../lessons/common/components/LessonUI';

/**
 * Free numeric entry. The raw string is sent through unchanged — the
 * backend's AnswerChecker already parses French/English decimal notation
 * (comma or dot), so there's no client-side parsing to duplicate here.
 */
export default function NumericQuestion({ question, onChange, disabled }) {
  const [value, setValue] = useState('');

  const handleChange = (next) => {
    setValue(next);
    onChange(next.trim() === '' ? null : { value: next });
  };

  return (
    // NumberField has no `disabled` prop of its own — during the brief
    // feedback pause after submitting, lock it out visually/functionally
    // with pointer-events instead, rather than leaving it silently editable.
    <div className={`max-w-[220px] mx-auto ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
      <NumberField
        value={value}
        onChange={handleChange}
        ariaLabel={question.prompt}
        placeholder="Ta réponse"
      />
    </div>
  );
}
