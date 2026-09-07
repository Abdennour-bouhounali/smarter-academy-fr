import React, { useState } from 'react';
import { BRIQUES, SACS, sacTotal } from '../data';

/**
 * TreeBuilder — l'interaction SIGNATURE : l'arbre n'est pas donné, il se
 * construit dans l'ORDRE DE L'EXPÉRIENCE.
 *
 * OBSERVATION ATTENDUE : tant que le premier niveau n'est pas posé, on ne
 * peut rien accrocher — parce qu'une bille ne se tire pas avant qu'un sac
 * ait été choisi. La structure de l'arbre n'est donc pas une convention de
 * dessin : c'est la chronologie de l'expérience.
 *
 * Deux intrus (« on repose la bille », « on compte toutes les billes »)
 * ne correspondent à aucune étape : les refuser oblige à distinguer une
 * ÉTAPE de l'expérience d'une action quelconque. Le refus est expliqué,
 * jamais silencieux.
 */
export default function TreeBuilder({ onComplete = null }) {
  const [placed, setPlaced] = useState([]);       // ids posés, dans l'ordre
  const [message, setMessage] = useState(null);

  const level1 = placed.filter((id) => BRIQUES.find((b) => b.id === id)?.level === 1);
  const level2 = placed.filter((id) => BRIQUES.find((b) => b.id === id)?.level === 2);
  const done = level1.length === 2 && level2.length === 2;

  const place = (brique) => {
    if (placed.includes(brique.id)) return;

    if (brique.level === 0) {
      setMessage({
        tone: 'bad',
        text: `« ${brique.label} » n’est pas une étape de cette expérience : cela ne crée aucun embranchement, donc aucun nœud.`,
      });
      return;
    }
    if (brique.level === 2 && level1.length < 2) {
      setMessage({
        tone: 'warn',
        text: 'On ne peut pas tirer une bille avant d’avoir choisi le sac : commence par poser les deux premières étapes.',
      });
      return;
    }
    const next = [...placed, brique.id];
    setPlaced(next);
    const l1 = next.filter((id) => BRIQUES.find((b) => b.id === id)?.level === 1).length;
    const l2 = next.filter((id) => BRIQUES.find((b) => b.id === id)?.level === 2).length;
    if (l1 === 2 && l2 === 2) {
      setMessage({ tone: 'ok', text: 'L’arbre est complet : deux étapes, quatre issues possibles.' });
      onComplete?.();
    } else {
      setMessage(null);
    }
  };

  const reset = () => { setPlaced([]); setMessage(null); };

  return (
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4 space-y-4">
      {/* Les sacs, avec leurs billes visibles : l'élève peut compter */}
      <div className="grid gap-3 sm:grid-cols-2">
        {['A', 'B'].map((s) => (
          <div key={s} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-bold text-slate-800 mb-2">
              {SACS[s].label} — {sacTotal(s)} billes
            </div>
            <div className="flex flex-wrap gap-1.5" aria-label={`${SACS[s].label} : ${SACS[s].rouges} rouges et ${SACS[s].bleues} bleues`}>
              {Array.from({ length: SACS[s].rouges }, (_, i) => (
                <span key={`r${i}`} className="inline-block w-5 h-5 rounded-full bg-rose-500" />
              ))}
              {Array.from({ length: SACS[s].bleues }, (_, i) => (
                <span key={`b${i}`} className="inline-block w-5 h-5 rounded-full bg-sky-500" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Les briques à poser */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
          Pose les étapes de l’expérience, dans l’ordre
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Étapes disponibles">
          {BRIQUES.map((b) => {
            const used = placed.includes(b.id);
            return (
              <button key={b.id} type="button" onClick={() => place(b)} disabled={used}
                aria-pressed={used}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                  used
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400 active:scale-95'}`}>
                {used ? '✓ ' : ''}{b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* L'arbre en cours de construction */}
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
        {placed.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            L’arbre est vide. Quelle est la <strong>première</strong> chose qui se passe ?
          </p>
        ) : (
          <svg width="100%" viewBox="0 0 560 200" role="img"
            aria-label={`Arbre en construction : ${level1.length} étapes de niveau 1, ${level2.length} de niveau 2`}
            className="select-none overflow-visible">
            <circle cx="30" cy="100" r="6" fill="#475569" />
            <text x="30" y="126" textAnchor="middle" fontSize="11" fill="#64748b">départ</text>

            {level1.map((id, i) => {
              const y = i === 0 ? 55 : 145;
              const b = BRIQUES.find((x) => x.id === id);
              const sac = b.id === 'sac-a' ? 'A' : 'B';
              return (
                <g key={id}>
                  <line x1="30" y1="100" x2="210" y2={y} stroke="#6366f1" strokeWidth="2.5" />
                  <circle cx="210" cy={y} r="5" fill="#4f46e5" />
                  <text x="218" y={y + 4} fontSize="13" fontWeight="700" fill="#3730a3">{SACS[sac].label}</text>
                  {/* le niveau 2 se greffe sur CHAQUE nœud du niveau 1 */}
                  {level2.map((id2, j) => {
                    const y2 = y + (j === 0 ? -28 : 28);
                    const b2 = BRIQUES.find((x) => x.id === id2);
                    const rouge = b2.id === 'bille-r';
                    return (
                      <g key={id2}>
                        <line x1="210" y1={y} x2="400" y2={y2} stroke={rouge ? '#f43f5e' : '#0ea5e9'} strokeWidth="2" />
                        <circle cx="400" cy={y2} r="4" fill={rouge ? '#f43f5e' : '#0ea5e9'} />
                        <text x="410" y={y2 + 4} fontSize="12" fontWeight="600" fill="#334155">
                          {rouge ? 'rouge' : 'bleue'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {message && (
        <div className={`rounded-xl border-2 px-3 py-2 text-sm ${
          message.tone === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : message.tone === 'warn' ? 'border-amber-200 bg-amber-50 text-amber-900'
            : 'border-rose-200 bg-rose-50 text-rose-800'}`} role="status">
          {message.text}
        </div>
      )}

      {placed.length > 0 && !done && (
        <button type="button" onClick={reset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline">
          Recommencer
        </button>
      )}
    </div>
  );
}
