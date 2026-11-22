import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { vectorColumnLatex } from './vectorFormat.js';

/**
 * LE شعاع EN COLONNE, EN HTML.
 *
 *     ⎛  3 ⎞
 *     ⎝ −2 ⎠
 *
 * Le rendu passe par KaTeX (`\binom`), déjà la seule bibliothèque de notation
 * de la plateforme — `lessons/common/components/MathText.jsx` la documente
 * comme telle. On appelle `InlineMath` directement plutôt que MathText :
 * celui-ci prend une CHAÎNE à découper sur les `$…$`, alors qu'ici le LaTeX
 * est produit par `vectorColumnLatex` et n'a rien à faire analyser.
 *
 * L'isolation `dir="ltr"` est celle de tout le مختبر : une écriture
 * mathématique se lit de gauche à droite même dans une page arabe.
 *
 * Optionnellement précédé de son nom (`u = ⎛3⎞⎝−2⎠`), pour les endroits qui
 * écrivaient « u = (3 ; −2) » d'un seul tenant.
 */
export default function VectorColumn({ vector, decimals = 2, name = null, className = undefined }) {
  const latex = vectorColumnLatex(vector, decimals);
  if (!latex) return <span className={className} dir="ltr">—</span>;

  return (
    <span className={className} dir="ltr" data-ml-vec-column>
      <InlineMath math={name ? `${name} = ${latex}` : latex} />
    </span>
  );
}
