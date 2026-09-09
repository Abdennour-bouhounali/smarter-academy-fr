import React, { useMemo } from 'react';
import TraceCanvas from './TraceCanvas';
import ProgramView from './ProgramView';
import { executer, makeRepeat, avancer, tourner, lit, estFermee, cadre, nomPolygone, arrondi } from './trace';

/**
 * PolygonLab — le laboratoire du module 5, où la boucle rencontre la géométrie.
 *
 * DEUX RÉGLAGES INDÉPENDANTS, et c'est tout l'enjeu :
 *   n      le nombre de tours de boucle ;
 *   angle  le virage effectué à chaque tour.
 * L'élève peut les régler séparément — et découvre que la figure ne se ferme
 * QUE lorsque angle = 360 ÷ n. Le lien n'est pas énoncé : il est le seul état
 * du système dans lequel le tracé se referme, donc il se trouve en cherchant.
 *
 * ACTION → CHANGE → OBSERVATION → SENS :
 *   ACTION       régler n, régler l'angle ;
 *   CHANGE       le tracé se redessine immédiatement, ouvert ou fermé ;
 *   OBSERVATION  « fermé » n'arrive que sur une valeur d'angle par n ;
 *   SENS         en faisant le tour d'une figure, le stylo fait UN TOUR
 *                COMPLET : 360° répartis en n virages égaux.
 *
 * Expected observation : « quand je monte n, l'angle qui ferme la figure
 * descend — et n × angle fait toujours 360 ».
 * Misconception targeted : croire que l'angle à tourner est l'angle DE la
 * figure (60° pour un triangle équilatéral, alors qu'on tourne de 120°) ; c'est
 * l'erreur classique, ici rendue visible : avec 60°, le tracé donne un hexagone.
 *
 * SÉCURITÉ VISUELLE. Le cadre est calculé sur la figure courante ET sur la
 * figure fermée de même n, de sorte qu'un tracé ouvert (qui s'échappe vers
 * l'extérieur) ne fasse pas rétrécir la figure au point de la rendre illisible.
 */
export default function PolygonLab({
  n,
  angle,
  cote = 55,
  onN = null,
  onAngle = null,
  nMin = 3,
  nMax = 10,
  hauteur = 300,
  montrerVerdict = true,
}) {
  // La boucle EST le programme : n tours, deux instructions dans le corps.
  const programme = useMemo(
    () => [makeRepeat(lit('n'), [avancer(lit('cote')), tourner(lit('angle'))])],
    []
  );
  const env = { n, cote, angle };

  const resultat = useMemo(() => executer(programme, { env: { n, cote, angle } }), [programme, n, cote, angle]);
  const ferme = estFermee(resultat);
  const bonAngle = arrondi(360 / n);

  // Le cadre englobe le tracé courant ET le polygone fermé de même n : le
  // dessin ne saute pas de taille quand l'élève traverse la bonne valeur.
  const c = useMemo(() => {
    const attendu = executer(programme, { env: { n, cote, angle: bonAngle } });
    const a = cadre(resultat);
    const b = cadre(attendu);
    return {
      minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX),
      minY: Math.min(a.minY, b.minY), maxY: Math.max(a.maxY, b.maxY),
      largeur: Math.max(a.maxX, b.maxX) - Math.min(a.minX, b.minX),
      hauteur: Math.max(a.maxY, b.maxY) - Math.min(a.minY, b.minY),
    };
  }, [programme, resultat, n, cote, angle, bonAngle]);

  return (
    <div className="space-y-3">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-3 items-start">
        <TraceCanvas
          resultat={resultat}
          cadreImpose={c}
          hauteur={hauteur}
          titre={`Tracé avec ${n} tours de ${angle}°`}
        />

        <div className="space-y-3">
          <ProgramView programme={programme} env={env} titre="Le programme" compact />

          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-3 space-y-3">
            {onN && (
              <div className="space-y-1">
                <label htmlFor="pl-n" className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-mono font-bold text-violet-800">n</span>
                  <span className="text-xs text-violet-700">tours de boucle</span>
                  <output className="font-mono text-lg font-black tabular-nums text-violet-900">{n}</output>
                </label>
                <input
                  id="pl-n" type="range" min={nMin} max={nMax} step={1} value={n}
                  onChange={(e) => onN(Number(e.target.value))}
                  className="w-full h-11 accent-violet-600 cursor-pointer"
                  aria-label="nombre de tours de boucle"
                />
              </div>
            )}
            {onAngle && (
              <div className="space-y-1">
                <label htmlFor="pl-a" className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-mono font-bold text-violet-800">angle</span>
                  <span className="text-xs text-violet-700">virage par tour</span>
                  <output className="font-mono text-lg font-black tabular-nums text-violet-900">{angle}°</output>
                </label>
                <input
                  id="pl-a" type="range" min={10} max={180} step={1} value={angle}
                  onChange={(e) => onAngle(Number(e.target.value))}
                  className="w-full h-11 accent-violet-600 cursor-pointer"
                  aria-label="angle du virage, en degrés"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {montrerVerdict && (
        <div
          className={`rounded-xl border-2 px-3 py-2.5 text-sm ${
            ferme ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-amber-300 bg-amber-50 text-amber-900'
          }`}
          aria-live="polite"
        >
          {ferme ? (
            <>
              <strong>Fermée.</strong> Le stylo est revenu à son point de départ : c’est un{' '}
              <strong>{nomPolygone(n)}</strong>. Au total, il a tourné de{' '}
              <strong className="font-mono">{n} × {angle}° = {arrondi(n * angle)}°</strong>.
            </>
          ) : (
            <>
              <strong>Ouverte.</strong> Après {n} tours de {angle}°, le stylo a tourné de{' '}
              <strong className="font-mono">{n} × {angle}° = {arrondi(n * angle)}°</strong> — il ne
              revient pas à son point de départ.
            </>
          )}
        </div>
      )}
    </div>
  );
}
