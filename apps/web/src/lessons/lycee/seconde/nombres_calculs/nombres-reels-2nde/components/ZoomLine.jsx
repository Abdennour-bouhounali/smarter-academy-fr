import React from 'react';
import { formatDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import { bracketAt, landsAt, truncatedDigits, valueOf } from './realsUtils';

/**
 * ZoomLine — le zoom infini (manipulation signature, module 1).
 *
 * Activity: chercher un nombre sur la droite en zoomant ×10 autour de lui,
 *   autant de fois qu'on veut.
 * Mathematical objective: vivre les trois comportements — l'écriture
 *   s'arrête (le point tombe sur une graduation), se répète, ou ne fait ni
 *   l'un ni l'autre — et lire à chaque zoom un encadrement de plus en plus
 *   fin.
 * Student action: toucher « Zoomer ×10 » / « Dézoomer » ; choisir le nombre.
 * Controlled variable: le niveau de zoom k (0..6) et le nombre.
 * Mathematical state: { spec, k } (module). Fenêtre, chiffres, encadrement,
 *   « tombe pile » sont DÉRIVÉS (bracketAt, truncatedDigits, landsAt) des
 *   chiffres exacts, jamais d'un flottant.
 * Visual consequence: la droite se redessine sur [lo ; lo + 10^-k] avec dix
 *   subdivisions ; le point du nombre reste au même endroit relatif ; un
 *   chiffre de plus s'écrit ; le point devient vert s'il est SUR une
 *   graduation.
 * Expected observation: 1,5 tombe au premier zoom ; 1/3 n'y tombe jamais
 *   mais répète « 3 » ; √2 ne tombe jamais et ne répète rien.
 * Misconception targeted: « en zoomant assez, tout nombre tombe sur une
 *   graduation » ; « √2 = 1,41 ».
 * Feedback: la couleur du point, la ligne « encadrement », le message
 *   dérivé du comportement.
 * Scaffolding: `choices` limite les nombres proposés à l'étape.
 *
 * SÉCURITÉ D'AFFICHAGE : les graduations de la fenêtre ont jusqu'à 7
 * décimales ; RealLine borne le nombre d'étiquettes selon la largeur et
 * les chiffres lus sont dans le DOM.
 */
const K_MAX = 6;

export default function ZoomLine({ spec, k, onZoom, choices = [], onChoose, disabled = false }) {
  const { lo, hi } = bracketAt(spec, k);
  const step = 10 ** -(k + 1);
  const landed = landsAt(spec, k);
  const x = valueOf(spec);
  const digitsNow = truncatedDigits(spec, k);
  const digitsPrev = k > 0 ? truncatedDigits(spec, k - 1) : null;
  const newDigit = k > 0 ? digitsNow.slice(-1) : null;
  const fmt = (v) => formatDec(v, { maxDecimals: k + 1 });

  return (
    <div className="space-y-3" role="group" aria-label={`Zoom sur ${spec.label}`}>
      {choices.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Nombre à chercher">
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              aria-pressed={c.id === spec.id}
              aria-label={`Chercher ${c.label}`}
              onClick={() => onChoose?.(c.id)}
              className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono font-extrabold text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                c.id === spec.id ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'
              } disabled:opacity-60`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <div className="flex items-center justify-between px-1 pb-1 text-[11px] font-mono font-bold text-slate-500 uppercase">
          <span>zoom ×10<sup>{k}</sup></span>
          <span>fenêtre : {fmt(lo)} → {fmt(hi)}</span>
        </div>
        <RealLine
          min={lo} max={hi} step={step}
          format={fmt}
          points={[{ id: 'x', value: Math.min(hi, Math.max(lo, x)), label: spec.label, tone: landed ? 'emerald' : 'indigo' }]}
          ariaLabel={`Fenêtre de ${fmt(lo)} à ${fmt(hi)}, ${spec.label} ${landed ? 'sur une graduation' : 'entre deux graduations'}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || k >= K_MAX}
          onClick={() => onZoom?.(k + 1)}
          aria-label="Zoomer fois dix"
          className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-mono text-sm font-bold disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          🔍 Zoomer ×10
        </button>
        <button
          type="button"
          disabled={disabled || k <= 0}
          onClick={() => onZoom?.(k - 1)}
          aria-label="Dézoomer"
          className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-mono text-sm font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Dézoomer
        </button>
        <button
          type="button"
          disabled={disabled || k === 0}
          onClick={() => onZoom?.(0)}
          className="min-h-[44px] px-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500 font-mono text-xs font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          ↺ Recommencer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">chiffres lus</span>
          <span className="text-lg font-extrabold text-slate-800">
            {digitsPrev !== null ? <>{digitsPrev}<span className="text-indigo-600">{newDigit}</span></> : digitsNow}
            {!landed && <span className="text-slate-400">…</span>}
          </span>
        </div>
        <div className={`rounded-xl border px-3 py-2 font-mono ${landed ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-800'}`} role="status">
          <span className="text-[11px] font-bold uppercase block opacity-70">{landed ? 'tombe pile' : 'encadrement'}</span>
          <span className="text-lg font-extrabold">
            {landed ? `${spec.label} = ${fmt(x)}` : `${fmt(lo)} < ${spec.label} < ${fmt(hi)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
