import { useEffect, useState } from 'react';

/**
 * Une requête média suivie en direct : vraie tant qu'elle s'applique, mise à
 * jour quand elle change (rotation, redimensionnement, réglage système).
 * Sans `window` (tests), toujours fausse.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches));

  useEffect(() => {
    const media = typeof window !== 'undefined' ? window.matchMedia?.(query) : null;
    if (!media) return undefined;
    const onChange = (event) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener('change', onChange);

    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * Sous 768 px, les graphiques passent en viewBox ÉTROIT : la même hauteur
 * pour moins de largeur, donc un facteur d'échelle plus grand et des
 * étiquettes lisibles sur un téléphone. Le point de rupture est celui de la
 * mise en page (pupitre dessous).
 */
export function useCompactCharts() {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * L'élève a demandé moins de mouvement (réglage système) : l'animation
 * physique est SAUTÉE, le résultat se pose tout de suite, la statistique ne
 * change pas d'un iota.
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
