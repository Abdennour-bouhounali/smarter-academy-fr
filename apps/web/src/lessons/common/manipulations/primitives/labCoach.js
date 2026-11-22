/**
 * LabCoach — logique PURE de l'onboarding des labos (2026-10-14, prototype sur `rank-exchange`).
 *
 *  - `placeBubble` : où poser la bulle par rapport à l'élément montré (dessous ou dessus, jamais SUR lui, toujours
 *    dans le cadre, la flèche pointant son centre) ;
 *  - `readLearned` / `writeLearned` / `readOff` / `writeOff` : ce que l'élève a déjà appris à faire et s'il a coupé le
 *    guide, en `localStorage` — chaque accès sous try/catch (fenêtre privée, stockage bloqué) : le guide marche sans.
 */

const KEY = (lab) => `sa.labCoach.${lab}`;

/**
 * @param {{x:number,y:number,w:number,h:number}} target  rectangle de l'élément, dans le repère du cadre
 * @param {{w:number,h:number}} box                         taille du cadre
 * @param {{w:number,h:number}} bubble                      taille de la bulle
 * @param {'above'|'below'} [prefer]                       le côté voulu par le labo (une scène où la zone de travail est SOUS l'élément : `above`) ; défaut : le plus de place
 * @param {boolean} [noFlip]                                avec `prefer` : ne jamais retourner la bulle de l'autre côté — elle peut dépasser la bande visible (2026-10-21)
 * @param {{top:number,bottom:number}} [view]               la bande VISIBLE de l'écran, dans le repère du cadre (le cadre est plus
 *   haut que l'écran sur un téléphone) : la bulle y reste, jamais cachée hors écran ; si l'élément est hors de la bande, elle se colle
 *   au bord le plus proche et sa flèche le montre (`edge`). Sans `view` : le comportement d'origine (cadre seul).
 * @returns {{side:'below'|'above', left:number, top:number, arrow:number, edge:boolean}}
 */
export function placeBubble({ target, box, bubble, view = null, prefer = null, noFlip = false, gap = 12, margin = 6 }) {
  const roomBelow = box.h - (target.y + target.h);
  const roomAbove = target.y;
  const cx = target.x + target.w / 2;
  const maxLeft = Math.max(margin, box.w - bubble.w - margin);
  const left = Math.min(maxLeft, Math.max(margin, cx - bubble.w / 2));
  const arrow = Math.min(bubble.w - 18, Math.max(18, cx - left));
  const topOf = (side) => (side === 'below' ? target.y + target.h + gap : Math.max(margin, target.y - gap - bubble.h));
  const preferred = prefer === 'above' || prefer === 'below' ? prefer : (roomBelow >= bubble.h + gap || roomBelow >= roomAbove ? 'below' : 'above');
  const other = preferred === 'below' ? 'above' : 'below';
  // `noFlip` (a lab whose scene sits on the other side of the target): the bubble keeps its preferred side whatever the screen, never covering what lies on the other one
  if (noFlip && (prefer === 'above' || prefer === 'below')) return { side: preferred, left, top: topOf(preferred), arrow, edge: false };
  const fits = (top) => !view || (top >= view.top && top + bubble.h <= view.bottom);
  if (fits(topOf(preferred))) return { side: preferred, left, top: topOf(preferred), arrow, edge: false };
  if (fits(topOf(other))) return { side: other, left, top: topOf(other), arrow, edge: false };
  // hors de la bande visible : coller la bulle au bord, côté de l'élément, sans jamais le couvrir
  if (target.y + target.h / 2 > view.bottom) {
    const top = Math.max(margin, Math.min(view.bottom, target.y - gap) - bubble.h);
    return { side: 'above', left, top, arrow, edge: true };
  }
  if (target.y + target.h / 2 < view.top) {
    const top = Math.min(box.h - bubble.h - margin, Math.max(view.top, target.y + target.h + gap));
    return { side: 'below', left, top, arrow, edge: true };
  }
  return { side: preferred, left, top: topOf(preferred), arrow, edge: false };
}

export function readLearned(lab) {
  try {
    const raw = JSON.parse(globalThis.localStorage?.getItem(`${KEY(lab)}.learned`) ?? '[]');
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
}
export function writeLearned(lab, ids) {
  try { globalThis.localStorage?.setItem(`${KEY(lab)}.learned`, JSON.stringify([...new Set(ids)])); } catch { /* noop */ }
}
export function readOff(lab) {
  try { return globalThis.localStorage?.getItem(`${KEY(lab)}.off`) === '1'; } catch { return false; }
}
export function writeOff(lab, off) {
  try {
    if (off) globalThis.localStorage?.setItem(`${KEY(lab)}.off`, '1');
    else globalThis.localStorage?.removeItem(`${KEY(lab)}.off`);
  } catch { /* noop */ }
}
export function resetCoach(lab) {
  try { globalThis.localStorage?.removeItem(`${KEY(lab)}.learned`); globalThis.localStorage?.removeItem(`${KEY(lab)}.off`); } catch { /* noop */ }
}
