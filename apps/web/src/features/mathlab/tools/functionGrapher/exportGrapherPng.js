/**
 * Le plan → une image PNG, pour « تصدير صورة » de la coquille.
 *
 * Le SVG de mafs est cloné, ses variables CSS (couleurs de grille, d'axes…)
 * recopiées en style inline à sa racine, un fond blanc ajouté, puis il est
 * rastérisé par un <canvas> à deux fois la taille d'affichage. Les polices
 * d'étiquettes sont celles du système dans l'image (pas de police embarquée) :
 * une limitation acceptée, le tracé lui-même est exact.
 */

const COPIED_VARIABLES = [
  '--mafs-bg', '--mafs-fg', '--mafs-origin-color', '--mafs-line-color', '--grid-line-subdivision-color',
  '--mafs-axis-stroke-width', '--mafs-line-stroke-dash-style',
];

const INLINE_STYLE = `
  text { fill: var(--mafs-fg); font-family: "JetBrains Mono", "Inter", "Cairo", sans-serif; font-size: 12px; }
  .mafs-shadow { paint-order: stroke; stroke-width: 3px; stroke: var(--mafs-bg); stroke-opacity: 0.75; stroke-linejoin: round; }
  .mafs-movable-point-hitbox { fill: transparent; }
  .mafs-movable-point-focus { display: none; }
  .mafs-movable-point-ring { fill: none; stroke: var(--movable-point-color); stroke-width: 2px; }
  .mafs-movable-point-point { fill: var(--movable-point-color); }
`;

/**
 * @param {SVGSVGElement} svg
 * @param {{scale?: number, background?: string}} [options]
 * @returns {Promise<Blob>}
 */
export function exportGrapherPng(svg, { scale = 2, background = '#ffffff' } = {}) {
  return new Promise((resolve, reject) => {
    const rect = svg.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));

    const source = getComputedStyle(svg.parentElement ?? svg);
    for (const name of COPIED_VARIABLES) {
      const value = source.getPropertyValue(name);
      if (value) clone.style.setProperty(name, value.trim());
    }

    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = INLINE_STYLE;
    clone.insertBefore(style, clone.firstChild);

    const viewBox = clone.getAttribute('viewBox')?.split(/[\s,]+/).map(Number) ?? [0, 0, width, height];
    const backdrop = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    backdrop.setAttribute('x', String(viewBox[0]));
    backdrop.setAttribute('y', String(viewBox[1]));
    backdrop.setAttribute('width', String(viewBox[2]));
    backdrop.setAttribute('height', String(viewBox[3]));
    backdrop.setAttribute('fill', background);
    clone.insertBefore(backdrop, style.nextSibling);

    const markup = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const context = canvas.getContext('2d');
        context.fillStyle = background;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error('export'));
        }, 'image/png');
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('export'));
    };
    image.src = url;
  });
}
