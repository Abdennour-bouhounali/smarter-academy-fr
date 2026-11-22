import CarpetScene from './CarpetScene';

/**
 * Le dessin du تحدّ de la page d'unité (= la وضعية de la synthèse, p. 28) : la زربية de وادي سوف, la même que la vignette du
 * module 7 (CarpetScene, jamais une seconde copie). Cadre à hauteur fixe car CarpetScene remplit son parent ; AUCUNE cote
 * (les dimensions sont ce que l'élève cherche).
 */
export default function OpenerFigure() {
  return (
    <figure className="mx-auto my-3 w-full max-w-md overflow-hidden rounded-xl border border-amber-200" style={{ aspectRatio: '16 / 9' }} role="img" aria-label="زربية مستطيلة الشكل من وادي سوف موضوعة على أرضية الغرفة">
      <CarpetScene />
    </figure>
  );
}
