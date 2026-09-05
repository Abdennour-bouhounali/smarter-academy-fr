/**
 * scrollToStep — jumps to a StepCard by its `num`, matching the `step-{num}`
 * anchor id every StepCard renders (see LessonUI.jsx). Shared by
 * ModuleLayout's "what's left" popover and by modules auto-scrolling to the
 * step that just unlocked.
 */
export function scrollToStep(num) {
  const el = document.getElementById(`step-${num}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
