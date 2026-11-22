/**
 * PHOTOS DE COPIE — logique pure (prototype BEM, décisions du propriétaire
 * 2026-10-06 ; EXERCISE_CONTRACT.md § « Image answers and teacher validation »).
 *
 * Le navigateur RÉDUIT la photo avant l'envoi (1600 px au plus grand côté,
 * JPEG) : un téléphone produit 4 à 12 Mo, et la plupart des navigateurs
 * décodent ainsi le HEIC d'un iPhone. Le serveur réencode de toute façon
 * (métadonnées EXIF/GPS retirées) — ceci n'est qu'un confort de débit.
 */
export const MAX_IMAGES_PER_STEP = 3;
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

/** Les codes de refus du serveur qui ont leur phrase (sinon : `generic`). */
const IMAGE_ERROR_CODES = Object.freeze(['image_unsupported', 'image_too_large', 'image_limit_reached', 'answer_locked']);

/** Les dimensions ramenées dans un carré de `max` (jamais agrandies). */
export function fitWithin(width, height, max = MAX_SIDE) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

/** La clé i18n d'un refus (`practice.exam.images.errors.<code>`). */
export function imageErrorKey(code) {
  return IMAGE_ERROR_CODES.includes(code) ? code : 'generic';
}

/**
 * Une réponse d'étape PEUT partir quand il y a une saisie valide OU au moins
 * une photo (le propriétaire : « saisie, image, ou les deux »).
 */
export function canSendWithImages({ hasTypedAnswer, imageCount }) {
  return Boolean(hasTypedAnswer) || imageCount > 0;
}

/** Ce que l'étape attend : l'enseignant (`review:pending`) ou la note de l'élève (`self:pending`). */
export function pendingKind(normalized) {
  if (normalized === 'review:pending') return 'review';
  if (normalized === 'self:pending') return 'self';
  return null;
}

/**
 * Réduit un fichier image en JPEG ≤ MAX_SIDE. Si le navigateur ne sait pas le
 * décoder, le fichier part tel quel (le serveur dira `image_unsupported`).
 *
 * @param {File|Blob} file
 * @returns {Promise<Blob>}
 */
export async function prepareAnswerImage(file) {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file;
  let bitmap;
  try {
    // `from-image` : la photo d'un téléphone tenu de travers se redresse.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  return blob ?? file;
}
