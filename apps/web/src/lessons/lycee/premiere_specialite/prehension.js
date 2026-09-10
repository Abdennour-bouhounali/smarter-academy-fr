/**
 * LA ZONE DE PRÉHENSION — combien de pixels le doigt a-t-il pour viser un cran.
 *
 * ─── POURQUOI CE FICHIER EXISTE ───────────────────────────────────────────
 * Depuis la règle utilisateur du 2026-09-10, les points et les figures d'un
 * repère se GLISSENT. Or un bouton et un doigt n'ont pas les mêmes exigences :
 * un bouton atteint toujours le cran suivant, quel que soit l'espacement, là
 * où un doigt doit VISER. Sur une leçon précédente, un pas mal choisi laissait
 * une zone de préhension de 4,25 px — inutilisable au doigt, et invisible à
 * tous les tests, parce qu'aucun ne mesurait cette grandeur.
 *
 * Ce module la CALCULE, pour qu'un test puisse l'exiger. Il ne dessine rien et
 * n'est importé que par des tests : il ne change donc aucun rendu.
 *
 * ─── LA GRANDEUR MESURÉE ──────────────────────────────────────────────────
 * `prehensionPx` rend la largeur, EN PIXELS RÉELS SUR UN ÉCRAN DE 375 px, de
 * l'intervalle qu'occupe un cran d'aimantation. C'est le produit de trois
 * facteurs :
 *   pas × unité × échelle
 * où l'ÉCHELLE est le facteur de réduction que subit le SVG pour tenir dans la
 * largeur utile. C'est ce troisième facteur que l'œil oublie : un repère de
 * 388 px de large est comprimé à 0,884 dans un `<main>` de 375 px, et une
 * préhension calculée sans lui est surestimée de 13 %.
 *
 * ─── LE PLANCHER ──────────────────────────────────────────────────────────
 * `PLANCHER_PX` vaut 14 px. C'est la consigne, et elle est cohérente avec les
 * 44 px d'une cible tactile isolée : un cran n'est pas une cible isolée mais
 * une CELLULE dans une bande continue, où l'aimantation rattrape l'erreur de
 * visée tant que le doigt tombe dans la bonne cellule.
 *
 * ─── CE QU'IL NE FAUT PAS LUI DEMANDER ────────────────────────────────────
 * Ce calcul reproduit la géométrie de `CoordPlane` (marges dérivées de la
 * largeur des étiquettes). Il n'en est pas l'implémentation : c'est une
 * MESURE indépendante, et c'est justement ce qui lui permet d'attraper une
 * régression de mise en page. `CoordPlane` n'est jamais modifié par ces
 * leçons — une vingtaine d'autres en dépendent.
 */

/** La largeur utile d'un `<main>` sur un écran de 375 px (16 px de gouttière). */
export const LARGEUR_UTILE = 343;

/** Le plancher de préhension, en pixels réels. */
export const PLANCHER_PX = 14;

/** La marge de base de CoordPlane, avant élargissement par les étiquettes. */
const PAD = 26;

/**
 * La largeur d'un texte de graduation, caractère par caractère — la même
 * approximation que celle dont `CoordPlane` dérive ses marges.
 */
const largeurTexte = (s, taille = 11) => String(s).length * taille * 0.58;

const arrondiPas = (v, pas) => Math.round(v / pas + Number.EPSILON) * pas;

/** L'écriture d'une graduation, virgule française comprise. */
const formatTick = (v) => {
  const r = Math.round(v * 1000) / 1000;
  return String(Number.isInteger(r) ? r : r.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));
};

/**
 * La largeur totale du SVG que produirait `CoordPlane` pour cette
 * configuration, marges comprises.
 */
export function largeurRepere({
  range,
  unit,
  xStep = 1,
  yStep = 1,
  labelEvery = null,
  axisLabels = { x: 'x', y: 'y' },
}) {
  const tickXs = [];
  for (let v = arrondiPas(range.xMin, xStep); v <= range.xMax + 1e-9; v += xStep) {
    if (v >= range.xMin - 1e-9) tickXs.push(Number(v.toFixed(6)));
  }
  const tickYs = [];
  for (let v = arrondiPas(range.yMin, yStep); v <= range.yMax + 1e-9; v += yStep) {
    if (v >= range.yMin - 1e-9) tickYs.push(Number(v.toFixed(6)));
  }
  const everyY = labelEvery ?? (tickYs.length > 13 ? 2 : 1);
  const plusLargeY = tickYs
    .filter((v, i) => v !== 0 && i % everyY === 0)
    .reduce((m, v) => Math.max(m, largeurTexte(formatTick(v))), 0);
  const demiPremierX = tickXs.length ? largeurTexte(formatTick(tickXs[0])) / 2 : 0;
  const demiDernierX = tickXs.length ? largeurTexte(formatTick(tickXs[tickXs.length - 1])) / 2 : 0;
  const nomX = largeurTexte(axisLabels?.x ?? '', 13);
  const nomY = largeurTexte(axisLabels?.y ?? '', 13);

  const gauche = Math.max(PAD, plusLargeY + 12, demiPremierX + 6, nomY / 2 + 6);
  const droite = Math.max(PAD, demiDernierX + 6, nomX + 18);
  return (range.xMax - range.xMin) * unit + gauche + droite;
}

/**
 * Le facteur de réduction subi par le repère pour tenir dans la largeur utile.
 * Jamais supérieur à 1 : un repère étroit n'est pas agrandi.
 */
export const echelleEcran = (cfg, utile = LARGEUR_UTILE) =>
  Math.min(1, utile / largeurRepere(cfg));

/**
 * LA MESURE : la largeur en pixels réels d'un cran d'aimantation.
 *
 * `axe` vaut 'x' (le pas est horizontal, l'unité est `unit`) ou 'y' (le pas est
 * vertical, l'unité est `unitY`, qui vaut `unit` par défaut).
 */
export function prehensionPx(cfg, pas, axe = 'x', utile = LARGEUR_UTILE) {
  const unite = axe === 'y' ? (cfg.unitY ?? cfg.unit) : cfg.unit;
  return pas * unite * echelleEcran(cfg, utile);
}
