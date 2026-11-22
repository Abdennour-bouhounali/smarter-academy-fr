import { useEffect } from 'react';
import { useClassroomMode } from '../../lessons/common/classroom';

/**
 * L'ARRIVÉE sur une nouvelle question — où va le regard, où va le focus.
 *
 * Composant sans rendu, monté DANS la coquille de classe pour lire son état :
 * en وضع القسم, la présentation est cadrée et ne défile pas — on n'y touche
 * ni au défilement ni au focus.
 *
 * `arrival` = `{ type: 'question' | 'exercise', from }`, posé par le lecteur
 * au moment où l'élève appuie sur « السؤال التالي » / « التمرين التالي ».
 * L'effet ne se déclenche que lorsque la clé de la question AFFICHÉE a changé
 * (`from` ≠ `questionKey`) : pour un changement d'exercice, l'exercice suivant
 * se charge de façon asynchrone et l'on attend qu'il soit là.
 *
 *  - Question suivante : sur un écran assez haut, on amène en haut la carte
 *    « السؤال السابق » (son résultat est le contexte), la question courante
 *    juste dessous ; sur un téléphone, la question courante elle-même.
 *  - Exercice suivant : retour en haut de page, sur le titre du nouvel exercice.
 *
 * FOCUS — sur un écran à pointeur fin (souris, clavier), le focus va au champ
 * de réponse : on tape directement. Sur un écran tactile, il va au TITRE de la
 * question (`tabIndex=-1`) : focaliser un champ y ouvrirait le clavier virtuel,
 * qui masquerait la question avant qu'elle soit lue. Le lecteur d'écran, lui,
 * annonce le titre dans les deux cas.
 *
 * `prefers-reduced-motion` : défilement instantané.
 */
export default function QuestionArrival({
  arrival, questionKey, workspaceRef, cardRef, headingRef, titleId, onArrived,
}) {
  const { isClassroomMode } = useClassroomMode();

  useEffect(() => {
    if (!arrival || arrival.from === questionKey) return;
    onArrived();
    if (isClassroomMode) return;

    const media = (q) => typeof window.matchMedia === 'function' && window.matchMedia(q).matches;
    const behavior = media('(prefers-reduced-motion: reduce)') ? 'auto' : 'smooth';

    if (arrival.type === 'exercise') {
      window.scrollTo({ top: 0, behavior });
      document.getElementById(titleId)?.focus({ preventScroll: true });

      return;
    }

    // Sur un écran assez haut, la carte « السؤال السابق » monte en haut et
    // la question courante suit dessous. Sur un téléphone, les deux ne
    // tiennent pas ensemble : on amène la question courante (la précédente
    // reste juste au-dessus, à un geste).
    const roomy = window.innerHeight >= 820 && window.innerWidth >= 640;
    const previous = workspaceRef.current?.querySelector('[data-previous-question]');
    const anchor = roomy && previous ? previous : cardRef.current;
    anchor?.scrollIntoView({ block: 'start', behavior });

    const field = media('(pointer: fine)')
      ? cardRef.current?.querySelector('input:not([disabled]), textarea:not([disabled])')
      : null;
    (field ?? headingRef.current)?.focus({ preventScroll: true });
  }, [arrival, questionKey, isClassroomMode, workspaceRef, cardRef, headingRef, titleId, onArrived]);

  return null;
}
