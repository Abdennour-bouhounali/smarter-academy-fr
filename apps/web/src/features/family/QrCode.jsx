import qrcode from 'qrcode-generator';

/**
 * Le QR du « رابط الوليّ » (PARENT_SPACE.md §2) — dessiné en SVG par React à
 * partir de la matrice de qrcode-generator (aucun innerHTML, aucune image).
 * Correction d'erreur « M » : il se lit encore imprimé sur une feuille froissée.
 *
 * Ce module tire la bibliothèque (~20 KB) : ses lecteurs le chargent
 * PARESSEUSEMENT (ParentLinkCard dans le profil, ParentCardsDialog de
 * l'enseignant) — jamais le lot d'entrée (BUNDLE_BOUNDARIES.md).
 */
export function qrMatrix(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

/** Les modules sombres d'une ligne, regroupés en segments `M x y h w v 1 h -w z`. */
export function qrPath(matrix) {
  let d = '';
  matrix.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) { x += 1; continue; }
      let w = 1;
      while (x + w < row.length && row[x + w]) w += 1;
      d += `M${x} ${y}h${w}v1h${-w}z`;
      x += w;
    }
  });
  return d;
}

export default function QrCode({ value, size = 160, label }) {
  const matrix = qrMatrix(value);
  const n = matrix.length;
  const quiet = 4;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-quiet} ${-quiet} ${n + quiet * 2} ${n + quiet * 2}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      data-qr
    >
      <rect x={-quiet} y={-quiet} width={n + quiet * 2} height={n + quiet * 2} fill="#fff" />
      <path d={qrPath(matrix)} fill="#0f172a" />
    </svg>
  );
}
