import { useState } from 'react';
import { ChoiceGrid } from '../../../lessons/common/components/LessonUI';

/**
 * Reuses the shared ChoiceGrid as-is: it never receives the correct answer
 * (no `revealed`/`correctIndex` passed) and doesn't self-validate — it only
 * reports which index was picked. Correctness is decided server-side.
 */
export default function ChoiceQuestion({ question, onChange, disabled }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (index) => {
    setSelected(index);
    onChange({ choiceId: question.choices[index].id });
  };

  return (
    <ChoiceGrid
      options={question.choices.map((c) => c.label)}
      selected={selected}
      onSelect={handleSelect}
      cols={question.choices.length > 3 ? 1 : 2}
      disabled={disabled}
    />
  );
}
