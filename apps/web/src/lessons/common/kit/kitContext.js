import { createContext, useContext } from 'react';

/**
 * Le contexte du kit, DANS SON PROPRE FICHIER — et c'est le point important.
 *
 * Il vivait dans ContentModule.jsx, qui exporte aussi un composant. Or un module
 * qui exporte un composant ET autre chose n'est pas éligible au Fast Refresh :
 * à chaque modification à chaud, Vite réexécute le module, `createContext()`
 * fabrique un NOUVEAU contexte, et les consommateurs déjà montés (TapQuestion…)
 * lisent ce nouveau contexte pendant que le Provider fournit encore l'ancien.
 * Résultat : `useKit()` renvoie null et lève « useKit() doit être appelé sous
 * <ContentModule> » — sur une leçon parfaitement correcte, au seul rechargement
 * à chaud. Un fichier sans composant est rafraîchi normalement : le contexte
 * garde son identité.
 */
export const KitContext = createContext(null);

export function useKit() {
  const kit = useContext(KitContext);
  if (!kit) {
    throw new Error('useKit() doit être appelé sous <ContentModule> (lesson kit).');
  }
  return kit;
}
