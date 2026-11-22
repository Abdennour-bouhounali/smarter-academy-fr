import { useEffect, useId } from 'react';
import { useClassroomMode } from './ClassroomContext';

/**
 * Une page PRÉSENTÉE dit à la coquille ce qu'il faut afficher — sans que la
 * coquille sache ce qu'est un module, un exercice ou une manipulation :
 *
 *   useClassroomStage({
 *     title: moduleTitle,          // le titre de la barre d'outils
 *     onPrevious, onNext,          // les gestes السابق / التالي (undefined = pas de bouton)
 *     slot: <chip>,                // commandes ou repères à droite de la barre
 *     priority: 2,                 // plusieurs déclarants : le plus haut gagne
 *   }, enabled);
 *
 * PRIORITÉ : ModuleLayout déclare pour tout module (priorité 1, gestes vers
 * les modules voisins) ; ContentModule, qui connaît ses unités, déclare par
 * dessus (priorité 2). Un moteur sans unités (test final, diagnostic) garde
 * la déclaration de ModuleLayout.
 *
 * Les gestes et le slot doivent être STABLES (useCallback/useMemo) : la
 * déclaration est ré-émise quand ils changent, et une fonction recréée à
 * chaque rendu ferait boucler coquille et page.
 */
export function useClassroomStage({ title, onPrevious, onNext, slot, priority = 1 } = {}, enabled = true) {
  const id = useId();
  const { registerStage, isClassroomMode } = useClassroomMode();
  const active = enabled && isClassroomMode;

  useEffect(() => {
    if (!active) return undefined;
    registerStage(id, { title, onPrevious, onNext, slot, priority });
    return () => registerStage(id, null);
  }, [active, id, registerStage, title, onPrevious, onNext, slot, priority]);
}
