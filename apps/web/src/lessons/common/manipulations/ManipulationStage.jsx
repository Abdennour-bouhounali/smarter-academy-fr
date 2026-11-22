
/**
 * L'AIRE DE MANIPULATION — le centre visuel de la manipulation. Elle réserve
 * une hauteur minimale (les contrôles au-dessus ne fuient pas sous le doigt
 * quand le contenu change de taille), coupe le défilement élastique pendant
 * un geste (`overscroll-contain`) et interdit la sélection de texte : on y
 * porte des objets, on n'y surligne pas des mots.
 *
 * Le contenu reste RTL (la page) ; les blocs numériques à l'intérieur se
 * déclarent LTR eux-mêmes.
 */
export default function ManipulationStage({ children, minHeight = 'min-h-[180px]', className = '', dragging = false, ...rest }) {
  return (
    <div
      data-manipulation-stage
      data-dragging={dragging ? 'true' : undefined}
      className={`relative select-none overscroll-contain rounded-2xl border border-slate-200 bg-white p-4 ${minHeight} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
