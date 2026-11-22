import MathLabel from './MathLabel';

/**
 * WordFraction — une fraction dont le numérateur et le dénominateur sont des MOTS arabes
 * (« طول الضلع المقابل / طول الوتر », unité 10 « حساب المثلثات », أستعدّ 5, معارف 1–2).
 *
 * Le manuel l'imprime comme une fraction ; en KaTeX il faudrait `\text{…}` arabe dans une île LTR,
 * que le contrat RTL interdit (le moteur ne façonne pas l'arabe, et `check-katex` ne le lit pas).
 * Ici : deux lignes de DOM arabe, un trait, en bloc inline — le texte reste sélectionnable,
 * lisible par un lecteur d'écran (« … على … »), et s'aligne dans une phrase.
 *
 *   <WordFraction lhs="$\cos\widehat{B}$" num="طول الضلع المجاور" den="طول الوتر" />
 *
 * `lhs` (facultatif) : ce qui précède « = » (formule `$…$` ou texte) ; num / den : texte (une formule
 * `$…$` y est permise, ex. « $AC$ »).
 */
export default function WordFraction({ lhs, num, den, className = '' }) {
  const frac = (
    <span
      className="inline-flex flex-col items-center align-middle mx-1 leading-tight"
      role="math"
      aria-label={`${plain(num)} على ${plain(den)}`}
    >
      <span className="px-1 pb-0.5 text-[0.95em]"><MathLabel>{num}</MathLabel></span>
      <span aria-hidden="true" className="block w-full border-t-2 border-current" />
      <span className="px-1 pt-0.5 text-[0.95em]"><MathLabel>{den}</MathLabel></span>
    </span>
  );
  if (lhs == null) return <span className={className}>{frac}</span>;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <MathLabel>{lhs}</MathLabel>
      <span aria-hidden="true">=</span>
      {frac}
    </span>
  );
}

const plain = (s) => String(s).replace(/\$/g, '').replace(/\\widehat\{([^}]*)\}/g, '$1').replace(/\\[a-z]+/g, '').trim();
