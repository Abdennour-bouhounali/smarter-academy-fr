import { useCallback, useEffect, useRef, useState } from 'react';
import { locateAnswer, rowLatex } from './frames.js';

/** Après une bonne réponse, le temps de voir sa désignation confirmée avant la suite. */
const CONFIRM_MS = 900;

/**
 * « تدرّب بنفسك » — l'élève fait lui-même les gestes du déroulé.
 *
 * En mode `practice`, quand le frame affiché porte un exercice (`frame.task`,
 * posé par les constructeurs de frames.js), le tableau devient interactif :
 * l'élève touche les éléments, choisit l'opération ; juste → la désignation
 * s'affiche (comme l'aurait montrée l'outil) puis le déroulé continue tout seul ;
 * faux → un mot, il réessaie ; « أرني » montre sans pénalité.
 *
 * Les exercices réussis sont un état d'INTERFACE : une nouvelle question
 * (`resetKey`) les oublie ; rien n'entre dans le document.
 *
 * @returns {{ board: object, player: object }}  à étaler sur <MathBoard> et <StepPlayer>
 */
export default function useBoardPractice(frames, player, resetKey = null) {
  const [solved, setSolved] = useState(() => new Set());
  const [key, setKey] = useState(resetKey);
  const timer = useRef(null);

  if (key !== resetKey) {
    setKey(resetKey);
    setSolved(new Set());
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const index = player.cursor - 1;
  const frame = index >= 0 ? frames[index] : null;
  const awaiting = player.mode === 'practice' && Boolean(frame?.task) && !solved.has(index);

  // Le résultat de l'opération, que l'élève TAPE lui-même (null si ce n'est pas un nombre).
  const located = awaiting ? locateAnswer(frames, index) : null;
  const answer = located?.latex ?? null;
  // Pour un geste « sur les deux membres », l'élève calcule sur la ligne où
  // l'opération est ÉCRITE (`2x + 3 − 3 = 9 − 3`) : on la lui montre.
  const answerContext = answer && frame?.task?.kind === 'term' && located.at > index + 1
    ? rowLatex(frames[located.at - 1].rows[0] ?? [])
    : null;

  const markSolved = useCallback((advance) => {
    setSolved((current) => new Set(current).add(index));
    if (advance) {
      // L'élève a désigné, choisi l'opération ET calculé : le déroulé saute au
      // frame où SON résultat se pose (les frames intermédiaires ne feraient
      // que montrer ce qu'il vient de faire).
      const hops = Math.max(1, (located?.at ?? index + 1) - index);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => { for (let k = 0; k < hops; k += 1) player.next(); }, CONFIRM_MS);
    }
  }, [index, player, located]);

  return {
    board: { interactive: awaiting, onSolved: () => markSolved(true), answer, answerContext },
    player: { blocked: awaiting, onReveal: () => markSolved(false) },
  };
}
