import { useMemo } from 'react';
import { useTransformContext, vec } from 'mafs';
import { sampleFunction } from './functionSampler.js';

/**
 * UNE courbe dans le plan : les morceaux échantillonnés (functionSampler.js)
 * convertis en pixels par la transformation de vue de mafs, tracés en
 * autant de sous-chemins « M … L … ». Un morceau = un trait continu ; entre
 * deux morceaux, rien — c'est ainsi qu'une asymptote reste une absence.
 */
export default function FunctionCurve({ fn, color, view, width, domain, name }) {
  const { viewTransform } = useTransformContext();

  const d = useMemo(() => {
    const segments = sampleFunction(fn, view, width, { domain });
    let path = '';
    for (const segment of segments) {
      for (let i = 0; i < segment.length; i += 1) {
        const [px, py] = vec.transform(segment[i], viewTransform);
        path += `${i === 0 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)} `;
      }
    }

    return path;
  }, [fn, view, width, domain, viewTransform]);

  if (!d) return null;

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      // En style inline aussi : la feuille de mafs (`.MafsView path { stroke: var(--mafs-fg) }`)
      // l'emporterait sur l'attribut, et toutes les courbes seraient noires.
      style={{ stroke: color }}
      strokeWidth={2.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      data-ml-curve={name}
    />
  );
}
