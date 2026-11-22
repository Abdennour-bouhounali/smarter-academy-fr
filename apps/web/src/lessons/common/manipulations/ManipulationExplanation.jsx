import { Feedback } from '../components/LessonUI';

/**
 * Le panneau « الشرح » : masqué par défaut, montré à la demande (élève) ou
 * par l'enseignant. Il REDIT ce que l'élève vient de voir — il ne le précède
 * jamais.
 */
export default function ManipulationExplanation({ show, tone = 'info', children }) {
  if (!show) return null;
  return <div data-manipulation-explanation><Feedback tone={tone}>{children}</Feedback></div>;
}
