import { useEffect, useState } from 'react';

/**
 * Valeur retardée — pour qu'un champ de recherche ne déclenche pas une
 * requête à chaque caractère frappé.
 */
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
