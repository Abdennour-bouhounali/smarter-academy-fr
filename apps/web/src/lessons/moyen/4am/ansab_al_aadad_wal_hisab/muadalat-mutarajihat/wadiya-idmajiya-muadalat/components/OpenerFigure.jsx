import { PoolScene } from './MuadalatFigures';

/**
 * Le dessin de la وضعية finale pour la PAGE D'UNITÉ (« تحدّ ») : le مسبح البلدي
 * déjà dessiné pour la synthèse (PoolScene), cadré dans une vignette au rapport
 * de la photographie du manuel (p. 52). Aucune mesure, aucun prix : il ne donne
 * pas la réponse. PoolScene est `aria-hidden` ; le cadre porte le nom accessible.
 */
export default function OpenerFigure() {
  return (
    <div role="img" aria-label="مسبح بلدي مغطّى" className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-slate-200" style={{ aspectRatio: '16 / 9' }}>
      <PoolScene />
    </div>
  );
}
