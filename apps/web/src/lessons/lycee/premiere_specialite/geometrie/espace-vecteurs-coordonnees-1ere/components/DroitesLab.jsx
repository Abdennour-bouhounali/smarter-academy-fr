import React from 'react';
import CubeLab from './CubeLab';
import {
  croisementApparent, orientationRecommandee, orientationsQuiLevent,
  orientationsAtteignables, POSITION_LABEL, fr, frVec3,
} from './espaceUtils';

/**
 * DroitesLab — deux droites du cube, et LA ROTATION COMME DROIT.
 *
 * ─── POURQUOI CE COMPOSANT EXISTE ─────────────────────────────────────────
 * La contrainte centrale de la leçon : en perspective, deux arêtes qui ne se
 * rencontrent pas peuvent se croiser SUR LE DESSIN. On ne peut donc pas poser
 * une question de position relative sur une figure figée — ce serait demander
 * à l'élève de croire, ou de deviner.
 *
 * Ce composant rend donc trois choses, et dans cet ordre :
 *  1. la boîte, TOUJOURS tournable, avec les deux droites en couleur ;
 *  2. un AVERTISSEMENT quand, dans l'orientation courante, les deux traits se
 *     croisent alors que les droites ne se rencontrent pas — c'est le mensonge
 *     nommé à l'instant où il a lieu, et non après coup ;
 *  3. un bouton qui amène à une orientation qui LÈVE l'ambiguïté, calculée par
 *     `orientationRecommandee` et dont un test vérifie qu'elle est atteignable
 *     et qu'elle lève vraiment.
 *
 * Le VERDICT (`montrerVerdict`) n'est montré qu'après la réponse de l'élève :
 * l'afficher d'emblée transformerait la question en lecture.
 *
 * ─── JAMAIS GELÉ ──────────────────────────────────────────────────────────
 * Aucun `disabled` propre : le seul verrou transmis est celui d'ANTÉRIORITÉ.
 * Un élève qui vient de répondre doit pouvoir continuer à tourner — c'est même
 * à ce moment-là que la vérification a le plus de valeur.
 */
export default function DroitesLab({
  verdict,
  orientation,
  onOrientation,
  montrerVerdict = false,
  disabled = false,
}) {
  const ment = croisementApparent(verdict, orientation);
  const reco = orientationRecommandee(verdict);
  const nbLevent = orientationsQuiLevent(verdict).length;
  const total = orientationsAtteignables().length;

  return (
    <div className="space-y-3">
      <CubeLab
        orientation={orientation}
        onOrientation={onOrientation}
        droites={[[verdict.d1.a, verdict.d1.b], [verdict.d2.a, verdict.d2.b]]}
        montrer="aucune"
        montrerNombres={false}
        disabled={disabled}
        ariaLabel={
          `La boîte, avec les droites ${verdict.d1.nom} en violet et ${verdict.d2.nom} en vert. `
          + `Glisse sur la figure pour la tourner, ou utilise les flèches du clavier. `
          + (ment
            ? 'Dans cette vue, les deux traits se croisent sur le dessin.'
            : 'Dans cette vue, les deux traits ne se croisent pas sur le dessin.')
        }
      />

      <div className="flex flex-wrap gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-1.5 rounded-full" style={{ background: '#7c3aed' }} aria-hidden="true" />
          <strong className="font-mono">{verdict.d1.nom}</strong>
          <span className="text-slate-500">directeur {frVec3(verdict.d1.dir)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-1.5 rounded-full" style={{ background: '#0f766e' }} aria-hidden="true" />
          <strong className="font-mono">{verdict.d2.nom}</strong>
          <span className="text-slate-500">directeur {frVec3(verdict.d2.dir)}</span>
        </span>
      </div>

      {/* LE MENSONGE, NOMMÉ À L'INSTANT OÙ IL A LIEU. */}
      {ment && verdict.position !== 'secantes' && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-3 text-sm text-amber-900"
          role="status" data-testid="avertissement-croisement">
          <strong>Attention à ce que tu vois.</strong> Sous cet angle, les deux traits se croisent
          sur le dessin. Cela ne prouve pas qu’elles se rencontrent : deux droites peuvent passer
          l’une devant l’autre à distance. <strong>Tourne la boîte</strong> pour t’en assurer —{' '}
          {fr(nbLevent)} des {fr(total)} orientations défont ce croisement.
        </div>
      )}

      {reco && (
        <button
          type="button"
          disabled={disabled}
          className="min-h-[44px] px-4 rounded-lg bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => onOrientation?.(reco)}
        >
          me montrer un angle où l’on voit bien
        </button>
      )}

      {montrerVerdict && (
        <div className="rounded-xl border-2 border-slate-300 bg-white p-3 space-y-1.5"
          data-testid="verdict" aria-live="polite">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[13px]">
            <div className={`rounded-lg border-2 px-2 py-1.5 ${
              verdict.paralleles ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}>
              parallèles : <strong>{verdict.paralleles ? 'oui' : 'non'}</strong>
            </div>
            <div className={`rounded-lg border-2 px-2 py-1.5 ${
              verdict.orthogonales ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}>
              produit des directeurs : <strong className="font-mono">{fr(verdict.produit)}</strong>
            </div>
            <div className={`rounded-lg border-2 px-2 py-1.5 ${
              verdict.secantes ? 'border-sky-400 bg-sky-50 text-sky-900' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}>
              se coupent : <strong>{verdict.secantes ? 'oui' : 'non'}</strong>
            </div>
          </div>
          <p className="text-sm text-slate-700 text-center">
            Position relative : <strong>{POSITION_LABEL[verdict.position]}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
