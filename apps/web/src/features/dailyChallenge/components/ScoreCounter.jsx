import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/**
 * Un score qui MONTE jusqu'à sa valeur — une fois, brièvement (≤ 0,9 s).
 * Avec « réduire les animations », la valeur finale s'affiche d'emblée.
 * Les chiffres restent en LTR et en chasse fixe : un nombre qui grandit ne
 * fait pas trembler la mise en page.
 */
export default function ScoreCounter({ value, className = '', duration = 0.9 }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setShown(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduce, duration]);

  return (
    <span dir="ltr" className={`tabular-nums ${className}`}>
      {/* Le lecteur d'écran lit la valeur finale, pas le décompte. */}
      <span aria-hidden="true">{shown.toLocaleString('fr-FR')}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
