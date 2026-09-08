import React from 'react';
import { valeur } from './rationnels';

/**
 * UnitBar — la barre unité, découpée en `den` parts dont `num` sont remplies.
 *
 * C'est la représentation « longueur » de la fraction, complémentaire de la
 * droite graduée : elle rend visible ce que « couper chaque part en deux »
 * fait — deux fois plus de parts, deux fois plus fines, MÊME longueur remplie.
 * Deux barres empilées suffisent alors à montrer une égalité de fractions sans
 * qu'aucun mot ne soit prononcé.
 *
 * Sécurité visuelle : la barre est une rangée de <div> en flex, sans
 * coordonnée calculée. Les parts se partagent la largeur, quel qu'en soit le
 * nombre ; le libellé vit à côté, dans sa propre cellule. Rien ne peut
 * chevaucher, déborder ou devenir illisible — au pire les parts deviennent
 * fines, ce qui est précisément l'information à lire.
 */
export default function UnitBar({
  num,
  den,
  couleur = 'indigo',      // 'indigo' | 'emerald' | 'amber'
  label = null,            // ReactNode à gauche de la barre
  hauteur = 40,
  onPart = null,           // (k) => void — rend les parts cliquables
  ariaLabel,
}) {
  const TONS = {
    indigo: { plein: 'bg-indigo-500', bord: 'border-indigo-600' },
    emerald: { plein: 'bg-emerald-500', bord: 'border-emerald-600' },
    amber: { plein: 'bg-amber-500', bord: 'border-amber-600' },
  };
  const ton = TONS[couleur] ?? TONS.indigo;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {label !== null && (
        <div className="shrink-0 w-16 sm:w-20 text-right text-sm font-mono font-bold text-slate-700">
          {label}
        </div>
      )}
      <div
        className={`flex-1 flex rounded-lg overflow-hidden border-2 ${ton.bord} bg-white`}
        style={{ height: hauteur }}
        role="img"
        aria-label={ariaLabel || `${num} parts sur ${den}`}
      >
        {Array.from({ length: den }, (_, k) => {
          const plein = k < num;
          const Elem = onPart ? 'button' : 'div';
          return (
            <Elem
              key={k}
              type={onPart ? 'button' : undefined}
              onClick={onPart ? () => onPart(k) : undefined}
              data-part={k}
              aria-label={onPart ? `Part ${k + 1} sur ${den}` : undefined}
              className={[
                'flex-1 min-w-0 transition-colors',
                plein ? ton.plein : 'bg-slate-50',
                k > 0 ? 'border-l border-white/70' : '',
                onPart ? 'cursor-pointer hover:opacity-80' : '',
              ].join(' ')}
            />
          );
        })}
      </div>
      {/* La longueur remplie, en clair — elle NE bouge pas quand on subdivise. */}
      <div className="shrink-0 w-12 text-left text-xs font-mono text-slate-500 tabular-nums">
        {Math.round(valeur({ num, den }) * 100)} %
      </div>
    </div>
  );
}
