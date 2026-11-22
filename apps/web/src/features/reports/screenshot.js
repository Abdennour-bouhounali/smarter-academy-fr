/**
 * La CAPTURE D'ÉCRAN d'un signalement — logique sans React.
 *
 * Deux origines : la page elle-même (html-to-image, chargé À LA DEMANDE — il
 * ne doit jamais entrer dans le bundle d'entrée, voir BUNDLE_BOUNDARIES.md)
 * ou une image choisie par le relecteur. Dans les deux cas l'image finit dans
 * un <canvas>, où les cadres rouges sont BRÛLÉS avant l'envoi : le serveur
 * reçoit une seule image, la zone fautive déjà marquée.
 */

/** Plafond de largeur à l'export : une capture de page reste lisible, et légère. */
export const MAX_EXPORT_WIDTH = 1600;

/** Attribut posé sur ce qui ne doit pas apparaître dans la capture (la fenêtre de signalement). */
export const IGNORE_ATTRIBUTE = 'data-report-ignore';

/** La couleur des cadres : le rouge se lit sur toutes les pages de la plateforme. */
export const MARK_COLOR = '#e11d48';

/**
 * Capture une RÉGION de l'écran — un rectangle en coordonnées de la fenêtre
 * (clientX / clientY), comme l'outil de capture d'un système d'exploitation.
 * La fenêtre de signalement et l'outil de sélection sont exclus
 * (`data-report-ignore`).
 *
 * La page entière est sérialisée en SVG, puis SEULE la région est dessinée
 * sur un <canvas> à sa taille : une longue leçon ne produit jamais une toile
 * de 20 000 px (au-delà des limites du navigateur).
 */
export async function captureRegion(rect) {
  const { toSvg } = await import('html-to-image');
  const filter = (node) => !(node instanceof Element && node.hasAttribute(IGNORE_ATTRIBUTE));
  const body = document.body;
  const options = { filter, cacheBust: false, width: body.scrollWidth, height: body.scrollHeight };

  let svg;
  try {
    svg = await toSvg(body, options);
  } catch {
    // Les polices externes font parfois échouer l'incrustation : sans elles.
    svg = await toSvg(body, { ...options, skipFonts: true });
  }
  const image = await loadImage(svg);

  // La région, ramenée aux coordonnées du CORPS (le défilement compris).
  const origin = body.getBoundingClientRect();
  const crop = regionInBody(rect, origin);
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(crop.width * ratio));
  canvas.height = Math.max(1, Math.round(crop.height * ratio));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

  return canvas;
}

/** La partie VISIBLE de la page entière (le geste « تصوير الشاشة كاملة »). */
export function capturePage() {
  return captureRegion({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight });
}

/**
 * Un rectangle de la fenêtre → le même rectangle dans le repère du corps de
 * page, dont `origin` est le getBoundingClientRect() (négatif une fois défilé).
 */
export function regionInBody(rect, origin) {
  return {
    x: Math.max(0, rect.x - origin.left),
    y: Math.max(0, rect.y - origin.top),
    width: rect.width,
    height: rect.height,
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('unreadable'));
    image.src = src;
  });
}

/** Charge un fichier image choisi par le relecteur dans un <canvas>. */
export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) {
      reject(new Error('unsupported'));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    image.src = url;
  });
}

/**
 * Un rectangle normalisé (largeur et hauteur positives) à partir de deux
 * coins, dans les coordonnées de l'image.
 */
export function normalizeRect(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

/** Un cadre trop petit est un clic, pas une sélection. */
export function isMeaningfulRect(rect, minSize = 6) {
  return rect.width >= minSize && rect.height >= minSize;
}

/** Dessine les cadres sur un contexte 2D, à l'échelle donnée. */
export function drawMarks(ctx, rects, scale = 1) {
  ctx.save();
  ctx.strokeStyle = MARK_COLOR;
  ctx.lineWidth = Math.max(3, 4 * scale);
  for (const r of rects) {
    ctx.strokeRect(r.x * scale, r.y * scale, r.width * scale, r.height * scale);
  }
  ctx.restore();
}

/**
 * L'image finale : la source réduite à MAX_EXPORT_WIDTH, cadres brûlés.
 * WebP quand le navigateur sait l'encoder, PNG sinon.
 */
export function exportAnnotated(source, rects) {
  const scale = Math.min(1, MAX_EXPORT_WIDTH / source.width);
  const out = document.createElement('canvas');
  out.width = Math.round(source.width * scale);
  out.height = Math.round(source.height * scale);
  const ctx = out.getContext('2d');
  ctx.drawImage(source, 0, 0, out.width, out.height);
  drawMarks(ctx, rects, scale);

  return new Promise((resolve) => {
    out.toBlob((webp) => {
      if (webp && webp.type === 'image/webp') {
        resolve(webp);
        return;
      }
      out.toBlob((png) => resolve(png), 'image/png');
    }, 'image/webp', 0.85);
  });
}
