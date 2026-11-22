/**
 * La GÉOMÉTRIE d'un enfant dessiné (KidFigure.jsx), pure et testée.
 *
 * Contrat de vérité (root CLAUDE.md, « le dessin se LIT ») : l'enfant est posé dans les coordonnées de la scène par
 * `top` (le sommet du crâne, cheveux compris) et `foot` (le sol, sous les semelles). Quand une scène mesure une taille,
 * `top` est EXACTEMENT la graduation de cette taille et `foot` celle de 0 : le dessin ne triche pas (contrairement
 * aux maquettes où l'enfant flotte au-dessus du zéro de la toise). Toutes les mesures du corps sont en `u`, le
 * centième de la taille dessinée, avec les proportions d'un enfant de 11–13 ans (tête ≈ 1/6,3 de la taille).
 */

/** Teints, cheveux, tenues : des ensembles inventés, assez contrastés pour se distinguer côte à côte. */
export const SKINS = {
  light: { skin: '#F7D4B5', shade: '#E7B48F', blush: '#F6A3AE' },
  wheat: { skin: '#E9B98A', shade: '#CF9562', blush: '#E98B8B' },
  brown: { skin: '#B97A4B', shade: '#99603A', blush: '#C9686A' },
  deep: { skin: '#8A5532', shade: '#6E4126', blush: '#A8504F' },
};
export const HAIRS = { black: '#231815', brown: '#4A2C1A', chestnut: '#6B3A1E', auburn: '#8A3B1C' };
export const OUTFITS = {
  blue: { top: '#3B5BDB', topDark: '#2F4AC0', trim: '#DCE4FF', pants: '#1E2A4A', shoes: '#3B5BDB' },
  pink: { top: '#F06595', topDark: '#D6487A', trim: '#FFE3EC', pants: '#3D6FB6', shoes: '#F06595' },
  green: { top: '#12B886', topDark: '#0B9A6F', trim: '#D3F9EA', pants: '#24364F', shoes: '#0CA678' },
  orange: { top: '#F76707', topDark: '#D9480F', trim: '#FFE8CC', pants: '#2B2F45', shoes: '#F59F00' },
  violet: { top: '#7950F2', topDark: '#6741D9', trim: '#E5DBFF', pants: '#2A2550', shoes: '#7950F2' },
  teal: { top: '#1098AD', topDark: '#0C8599', trim: '#D0F4F9', pants: '#203046', shoes: '#15AABF' },
  red: { top: '#E03131', topDark: '#C92A2A', trim: '#FFE3E3', pants: '#283149', shoes: '#E03131' },
};
/** Garçons : 'short' | 'curly' ; filles : 'hijab' (tenue islamique, demande du propriétaire, 2026-10-14). */
export const HAIR_STYLES = ['short', 'curly', 'hijab'];
/**
 * Les foulards du hijab (2026-10-14, demande du propriétaire : les filles en tenue islamique) : `main` le foulard, `dark` ses
 * plis, `inner` le bandeau (sous-foulard) au front. Couleurs douces, distinctes de la tunique pour que le hijab se lise.
 */
export const SCARVES = {
  rose: { main: '#F7A8C4', dark: '#DE7FA6', inner: '#FFF1F6' },
  lavender: { main: '#B9A7F5', dark: '#9580E6', inner: '#F4F0FF' },
  mint: { main: '#8EDCC2', dark: '#5EBFA0', inner: '#EFFFF8' },
  sky: { main: '#93C5FD', dark: '#6AA6EE', inner: '#EFF6FF' },
  sand: { main: '#E9CFA6', dark: '#CDAE80', inner: '#FFF8EC' },
};

/** La tête agrandie et le tronc descendu d'autant (en centièmes de la taille). */
const HEAD_SCALE = 1.14;
const TORSO_DROP = 8 * (HEAD_SCALE - 1) * 2;

/** Les repères verticaux et horizontaux du corps, dans les coordonnées de la scène. */
export function kidGeometry({ cx, top, foot }) {
  const u = (foot - top) / 100;
  // La tête est un peu plus grande que le réel (≈ 1/5,7 de la taille) : un style « illustré » amical pour 11–13 ans.
  // Son SOMMET reste exactement `top`.
  const hs = HEAD_SCALE;
  const head = { cx, cy: top + 8 * hs * u, rx: 6.9 * hs * u, ry: 8 * hs * u };
  return {
    u,
    cx,
    top,
    foot,
    head,
    hs,
    drop: TORSO_DROP,
    neck: { y: top + (14.6 * hs) * u, h: 3.4 * u, w: 3.6 * u },
    shoulderY: top + (17 + TORSO_DROP) * u,
    hemY: top + (50 + TORSO_DROP) * u,
    waistY: top + (49.4 + TORSO_DROP) * u,
    kneeY: top + 73 * u,
    shoeTop: foot - 5 * u,
    halfWidth: 13.8 * u,
    eyeY: head.cy + 0.6 * hs * u,
    mouthY: head.cy + 3.7 * hs * u,
  };
}

/** La boîte englobante du dessin (cheveux longs et ombre comprises) : pour placer des pilules sans chevauchement. */
export function kidBox({ cx, top, foot }) {
  const g = kidGeometry({ cx, top, foot });
  return { x0: cx - g.halfWidth, x1: cx + g.halfWidth, y0: top, y1: foot, width: 2 * g.halfWidth, height: foot - top };
}

/** Un choix déterministe d'apparence pour l'enfant n° `index` (deux élèves voient la même scène, un test aussi). */
export function kidLook(index = 0) {
  const skins = Object.keys(SKINS);
  const hairs = Object.keys(HAIRS);
  const outfits = Object.keys(OUTFITS);
  return {
    skin: skins[(index * 3 + 1) % skins.length],
    hair: hairs[index % hairs.length],
    outfit: outfits[index % outfits.length],
    hairStyle: HAIR_STYLES[index % HAIR_STYLES.length],
  };
}
