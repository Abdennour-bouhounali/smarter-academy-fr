import React from 'react';
import { verifierPatronPrisme, raisonPatron } from './espace5e';

/**
 * PatronPrismeLab — construire le patron d'un prisme droit.
 *
 * L'élève POSE les pièces (les deux bases, les rectangles de la bande) et le
 * composant VÉRIFIE par condition mathématique, jamais par comparaison à une
 * liste de patrons appris (`verifierPatronPrisme`). Conséquence directe :
 * n'importe quel patron correct que l'élève inventerait est accepté, et un
 * patron faux est refusé pour une RAISON exacte, qui nomme l'erreur.
 *
 * L'erreur visée est structurelle : poser les deux bases DU MÊME CÔTÉ de la
 * bande. Au pliage elles se rabattraient au même endroit, et le solide serait
 * ouvert d'un bout. Ici, ce placement est possible — il faut qu'il le soit
 * pour que le refus ait un sens — et il est nommé quand il survient.
 *
 * ─── LE GESTE ─────────────────────────────────────────────────────────
 * Chaque emplacement est un vrai <button> de 44 px : on tape pour poser ou
 * retirer une pièce. Pas de glisser obligatoire, donc rien à réussir au doigt
 * avant de pouvoir réfléchir (§10.1, tap-first).
 *
 * ─── SÉCURITÉ VISUELLE ────────────────────────────────────────────────
 * La grille est dimensionnée depuis le nombre de côtés de la base : elle
 * s'élargit avec le prisme au lieu de compter sur une largeur qui « marche »
 * pour le cas triangulaire.
 */

const CELL = 52;

export default function PatronPrismeLab({
  prisme,
  pieces,                  // [{ id, role: 'base'|'flanc', cote?: 'haut'|'bas', slot }]
  onToggle,
  disabled = false,
  showVerdict = true,
  ariaLabel,
}) {
  const n = prisme.base.length;
  const verdict = verifierPatronPrisme(pieces, prisme);
  const pose = (slot) => pieces.find((p) => p.slot === slot);

  /* Les emplacements : une bande de n flancs, et au-dessus comme au-dessous
     de CHAQUE flanc un emplacement de base. C'est ce qui rend le placement
     « deux bases du même côté » possible — et donc réfutable. */
  const slots = [];
  for (let i = 0; i < n; i += 1) {
    slots.push({ slot: `haut-${i}`, role: 'base', cote: 'haut', col: i, row: 0 });
    slots.push({ slot: `flanc-${i}`, role: 'flanc', col: i, row: 1 });
    slots.push({ slot: `bas-${i}`, role: 'base', cote: 'bas', col: i, row: 2 });
  }

  const etiquette = (role) => (role === 'base' ? `base (${n} côtés)` : 'rectangle');

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 sm:p-3 space-y-3">
      <div className="overflow-x-auto">
        <div
          className="mx-auto grid gap-1"
          style={{
            width: n * (CELL + 4),
            gridTemplateColumns: `repeat(${n}, ${CELL}px)`,
            gridTemplateRows: `repeat(3, ${CELL}px)`,
          }}
          role="group"
          aria-label={ariaLabel || `Patron du ${prisme.nom}`}
        >
          {slots.map((s) => {
            const p = pose(s.slot);
            const rempli = Boolean(p);
            return (
              <button
                key={s.slot}
                type="button"
                disabled={disabled}
                onClick={() => onToggle?.(s)}
                aria-pressed={rempli}
                aria-label={`${etiquette(s.role)}${s.cote ? `, côté ${s.cote}` : ''}${rempli ? ', posée' : ', vide'}`}
                style={{ gridColumn: s.col + 1, gridRow: s.row + 1 }}
                className={`rounded-lg border-2 text-xs font-semibold transition-colors ${
                  rempli
                    ? s.role === 'base'
                      ? 'border-amber-400 bg-amber-100 text-amber-800'
                      : 'border-violet-400 bg-violet-100 text-violet-800'
                    : 'border-dashed border-slate-300 bg-white text-slate-400 hover:border-slate-400'
                } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {rempli ? (s.role === 'base' ? '▲' : '▭') : '+'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border-2 border-amber-400 bg-amber-100" />
          base ({pieces.filter((p) => p.role === 'base').length} / 2)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border-2 border-violet-400 bg-violet-100" />
          rectangle ({pieces.filter((p) => p.role === 'flanc').length} / {n})
        </span>
      </div>

      {showVerdict && (
        <div
          className={`rounded-xl border-2 px-3 py-2 text-center text-sm ${
            verdict.ok
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {verdict.ok
            ? `✓ Ce patron se replie bien en ${prisme.nom}.`
            : raisonPatron(verdict.raison) || 'Continue de poser les pièces.'}
        </div>
      )}
    </div>
  );
}
