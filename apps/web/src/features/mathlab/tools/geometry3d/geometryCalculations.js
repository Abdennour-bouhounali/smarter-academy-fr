/**
 * Les CALCULS de la géométrie dans l'espace — mathématiques pures, sans
 * rendu ni interface. Volume, aire totale, apothème du cône, aire d'une
 * face, et les formules (LaTeX) que le panneau affiche à côté des valeurs.
 *
 *   cube      V = a³                A = 6a²
 *   pavé      V = L·l·h             A = 2(Ll + Lh + lh)
 *   sphère    V = 4πr³/3            A = 4πr²
 *   cylindre  V = πr²h              A = 2πr² + 2πrh
 *   cône      V = πr²h/3            A = πr² + πrl   avec l = √(r² + h²)
 *
 * Le rayon, la hauteur et l'apothème ne se confondent jamais : l'apothème
 * est CALCULÉ à partir des deux autres, jamais saisi.
 */

/** L'apothème (génératrice) du cône : l = √(r² + h²). */
export function slantHeight(radius, height) {
  return Math.hypot(radius, height);
}

/** Le volume du solide, en unités cubes. */
export function volumeOf(shape, d) {
  switch (shape) {
    case 'cube': return d.side ** 3;
    case 'cuboid': return d.length * d.width * d.height;
    case 'sphere': return (4 / 3) * Math.PI * d.radius ** 3;
    case 'cylinder': return Math.PI * d.radius ** 2 * d.height;
    case 'cone': return (Math.PI * d.radius ** 2 * d.height) / 3;
    default: return NaN;
  }
}

/** L'aire totale du solide, en unités carrées. */
export function surfaceAreaOf(shape, d) {
  switch (shape) {
    case 'cube': return 6 * d.side ** 2;
    case 'cuboid': return 2 * (d.length * d.width + d.length * d.height + d.width * d.height);
    case 'sphere': return 4 * Math.PI * d.radius ** 2;
    case 'cylinder': return 2 * Math.PI * d.radius ** 2 + 2 * Math.PI * d.radius * d.height;
    case 'cone': return Math.PI * d.radius ** 2 + Math.PI * d.radius * slantHeight(d.radius, d.height);
    default: return NaN;
  }
}

/**
 * Les FACES qu'on peut désigner sur chaque solide, dans l'ordre des groupes
 * de la géométrie three.js (BoxGeometry : +x −x +y −y +z −z ; cylindre et
 * cône : surface latérale, disque du haut, disque du bas ; sphère : une
 * surface). `kind` est la clé de traduction ; l'aire est celle de CETTE face.
 */
export function faceKinds(shape) {
  switch (shape) {
    case 'cube':
    case 'cuboid': return ['face', 'face', 'face', 'face', 'face', 'face'];
    case 'cylinder': return ['lateral', 'topBase', 'bottomBase'];
    case 'cone': return ['lateral', null, 'base'];
    case 'sphere': return ['surface'];
    default: return [];
  }
}

/** L'aire de la face `index` (voir faceKinds), ou NaN si elle n'existe pas. */
export function faceAreaOf(shape, d, index) {
  switch (shape) {
    case 'cube': return index >= 0 && index < 6 ? d.side ** 2 : NaN;
    case 'cuboid':
      if (index === 0 || index === 1) return d.width * d.height;   // ±x : l × h
      if (index === 2 || index === 3) return d.length * d.width;   // ±y (dessus, dessous) : L × l
      if (index === 4 || index === 5) return d.length * d.height;  // ±z : L × h
      return NaN;
    case 'sphere': return index === 0 ? 4 * Math.PI * d.radius ** 2 : NaN;
    case 'cylinder':
      if (index === 0) return 2 * Math.PI * d.radius * d.height;
      if (index === 1 || index === 2) return Math.PI * d.radius ** 2;
      return NaN;
    case 'cone':
      if (index === 0) return Math.PI * d.radius * slantHeight(d.radius, d.height);
      if (index === 2) return Math.PI * d.radius ** 2;
      return NaN;
    default: return NaN;
  }
}

/** Tout ce que le panneau affiche pour un solide : volume, aire, et l'apothème du cône. */
export function measuresOf(shape, d) {
  return {
    volume: volumeOf(shape, d),
    surface: surfaceAreaOf(shape, d),
    slant: shape === 'cone' ? slantHeight(d.radius, d.height) : null,
  };
}

/** Les formules générales, en LaTeX (KaTeX via MathText). */
export const FORMULAS = Object.freeze({
  cube: Object.freeze({ volume: 'V = a^3', surface: 'A = 6a^2' }),
  cuboid: Object.freeze({ volume: 'V = L \\times l \\times h', surface: 'A = 2(Ll + Lh + lh)' }),
  sphere: Object.freeze({ volume: 'V = \\frac{4}{3}\\pi r^3', surface: 'A = 4\\pi r^2' }),
  cylinder: Object.freeze({ volume: 'V = \\pi r^2 h', surface: 'A = 2\\pi r^2 + 2\\pi r h' }),
  cone: Object.freeze({ volume: 'V = \\frac{1}{3}\\pi r^2 h', surface: 'A = \\pi r^2 + \\pi r l', slant: 'l = \\sqrt{r^2 + h^2}' }),
});

/** Un nombre dans une formule LaTeX : virgule décimale (`{,}`), sans zéros inutiles. */
export function latexNumber(value, decimals = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '?';
  const text = String(Number(value.toFixed(decimals)));

  return text.replace('-', '-').replace('.', '{,}');
}

/** Les formules avec les dimensions du solide substituées : V = 4 × 2 × 3, A = 2(4×2 + 4×3 + 2×3)… */
export function substitutedFormulas(shape, d) {
  const n = latexNumber;
  switch (shape) {
    case 'cube': return { volume: `V = ${n(d.side)}^3`, surface: `A = 6 \\times ${n(d.side)}^2` };
    case 'cuboid': return {
      volume: `V = ${n(d.length)} \\times ${n(d.width)} \\times ${n(d.height)}`,
      surface: `A = 2(${n(d.length)} \\times ${n(d.width)} + ${n(d.length)} \\times ${n(d.height)} + ${n(d.width)} \\times ${n(d.height)})`,
    };
    case 'sphere': return { volume: `V = \\frac{4}{3}\\pi \\times ${n(d.radius)}^3`, surface: `A = 4\\pi \\times ${n(d.radius)}^2` };
    case 'cylinder': return {
      volume: `V = \\pi \\times ${n(d.radius)}^2 \\times ${n(d.height)}`,
      surface: `A = 2\\pi \\times ${n(d.radius)}^2 + 2\\pi \\times ${n(d.radius)} \\times ${n(d.height)}`,
    };
    case 'cone': return {
      volume: `V = \\frac{1}{3}\\pi \\times ${n(d.radius)}^2 \\times ${n(d.height)}`,
      surface: `A = \\pi \\times ${n(d.radius)}^2 + \\pi \\times ${n(d.radius)} \\times ${n(slantHeight(d.radius, d.height))}`,
      slant: `l = \\sqrt{${n(d.radius)}^2 + ${n(d.height)}^2}`,
    };
    default: return { volume: '', surface: '' };
  }
}
