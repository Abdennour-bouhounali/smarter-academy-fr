import React from 'react';

/**
 * QuantityLab — un tas de jetons que l'élève TRANSFORME de ses mains.
 *
 * L'idée centrale du module 1 : les quatre opérations ne sont pas quatre mots
 * à reconnaître, ce sont quatre GESTES sur une quantité. L'ancienne version
 * racontait une histoire puis demandait de choisir « on en rajoute » dans un
 * QCM : l'élève lisait, il ne faisait rien, et le symbole tombait ensuite.
 *
 * Ici, l'élève agit sur le tas :
 *   - il pose des jetons          → la quantité augmente     → +
 *   - il en retire                → la quantité diminue      → −
 *   - il ajoute un paquet entier  → la quantité saute de n    → ×
 *   - il répartit en parts égales → le tas se range en lignes → ÷
 *
 * Ce qui est mathématiquement observable, et que le module ne dit pas
 * d'avance : les quatre gestes agissent sur la MÊME quantité, et deux d'entre
 * eux (× et ÷) ne sont que des versions groupées des deux autres. La grille
 * de jetons rend cela visible — un paquet de 6, c'est six jetons d'un coup.
 *
 * Le composant ne juge rien : il montre la quantité et l'historique des
 * gestes. C'est le module qui interprète.
 *
 * Accessibilité : chaque geste est un bouton ; le compte vit dans le DOM (pas
 * dans un <text> SVG) et il est annoncé par `role="status"`.
 */
export default function QuantityLab({
  count,
  groups = null,          // quand non nul : la quantité est rangée en `groups` lignes
  highlight = null,       // 'added' | 'removed' — les jetons touchés au dernier geste
  lastDelta = 0,
  unit = 'jeton',
  color = '#6366f1',
  maxRender = 60,
}) {
  const shown = Math.min(count, maxRender);
  const perRow = groups ? Math.ceil(count / groups) : 10;
  const rows = groups ?? Math.ceil(shown / perRow);

  // Les jetons concernés par le dernier geste : les derniers ajoutés, ou une
  // silhouette fantôme pour ceux qui viennent d'être retirés.
  const addedFrom = highlight === 'added' && lastDelta > 0 ? shown - lastDelta : -1;

  return (
    <div className="space-y-2">
      <div
        className="rounded-2xl border-2 border-slate-200 bg-slate-50/70 p-3 overflow-x-auto"
        aria-hidden="true"
      >
        <div className="flex flex-col gap-1 min-w-fit">
          {Array.from({ length: Math.max(rows, 1) }, (_, r) => (
            <div key={r} className={`flex gap-1 ${groups ? 'rounded-lg px-1 py-1 bg-white/70 border border-slate-200' : ''}`}>
              {Array.from({ length: perRow }, (_, c) => {
                const i = r * perRow + c;
                if (i >= shown) return null;
                const isNew = addedFrom >= 0 && i >= addedFrom;
                return (
                  <span
                    key={c}
                    className="inline-block rounded-full transition-all duration-300"
                    style={{
                      width: 14, height: 14,
                      background: isNew ? '#10b981' : color,
                      transform: isNew ? 'scale(1.25)' : 'scale(1)',
                    }}
                  />
                );
              })}
              {/* Les jetons qui viennent d'être retirés restent une seconde en
                  fantôme : on voit CE QUI A DISPARU, pas seulement le reste. */}
              {highlight === 'removed' && r === rows - 1 && lastDelta < 0 &&
                Array.from({ length: Math.min(-lastDelta, 12) }, (_, k) => (
                  <span
                    key={`ghost${k}`}
                    className="inline-block rounded-full border-2 border-dashed border-rose-300"
                    style={{ width: 14, height: 14 }}
                  />
                ))}
            </div>
          ))}
        </div>
        {count > maxRender && (
          <p className="text-[11px] text-slate-400 mt-1 font-mono">… et {count - maxRender} de plus</p>
        )}
      </div>

      <div className="flex items-baseline justify-center gap-2" role="status" aria-live="polite">
        <span className="font-mono font-black text-3xl text-slate-800">{count}</span>
        <span className="text-sm text-slate-500">{unit}{count > 1 ? 's' : ''}</span>
        {groups && (
          <span className="text-sm text-slate-500">
            · rangés en <strong className="text-slate-700">{groups}</strong> parts de{' '}
            <strong className="text-slate-700">{perRow}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
