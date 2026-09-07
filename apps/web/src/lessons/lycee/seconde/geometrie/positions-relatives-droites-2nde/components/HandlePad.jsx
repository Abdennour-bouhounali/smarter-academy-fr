import React from 'react';

/**
 * HandlePad — le chemin TACTILE et CLAVIER des poignées du plan (playbook
 * §10.1 : tap-first, drag-optional). Une puce par poignée (celle qui est
 * choisie devient déplaçable sur le plan) et une croix directionnelle qui
 * l'avance d'une unité. Les bornes viennent du module : un bouton se
 * désactive à la borne au lieu de laisser la poignée sortir du cadre.
 *
 * @param {{ id, name, color? }[]} handles
 * @param {string} activeId
 * @param {(id:string) => void} onActive
 * @param {(dx:number, dy:number) => void} onMove
 * @param {(dx:number, dy:number) => boolean} [canMove]
 */
export default function HandlePad({ handles, activeId, onActive, onMove, canMove = () => true, disabled = false }) {
  const active = handles.find((h) => h.id === activeId);
  const name = active?.name ?? active?.id ?? '';
  const chip = (on, color) => `min-h-[44px] px-3.5 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 ${on ? 'text-white' : 'bg-white text-slate-700 hover:border-slate-400'}`;
  const arrow = 'w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const dirs = [
    { dx: -1, dy: 0, glyph: '←', label: 'vers la gauche' },
    { dx: 1, dy: 0, glyph: '→', label: 'vers la droite' },
    { dx: 0, dy: 1, glyph: '↑', label: 'vers le haut' },
    { dx: 0, dy: -1, glyph: '↓', label: 'vers le bas' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {handles.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Poignée à déplacer">
          {handles.map((h) => {
            const on = h.id === activeId;
            return (
              <button key={h.id} type="button" disabled={disabled} aria-pressed={on} onClick={() => onActive(h.id)}
                className={chip(on)} style={on ? { backgroundColor: h.color ?? '#4f46e5', borderColor: h.color ?? '#4f46e5' } : { borderColor: h.color ?? '#cbd5e1' }}>
                {h.name ?? h.id}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-1.5" role="group" aria-label={`Déplacer ${name} d’une unité`}>
        {dirs.map((d) => (
          <button key={d.glyph} type="button" className={arrow} disabled={disabled || !active || !canMove(d.dx, d.dy)}
            onClick={() => onMove(d.dx, d.dy)} aria-label={`${name} : ${d.label}`}>
            {d.glyph}
          </button>
        ))}
      </div>
    </div>
  );
}
