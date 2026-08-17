import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

/**
 * InfoSorter — tri des informations utiles / inutiles d'un énoncé.
 *
 * Interaction en deux temps, robuste au tactile : on touche une carte pour
 * la sélectionner, puis on touche le bac de destination. Pas de glisser
 * fragile sur mobile.
 *
 * @param {{id, text, useful}[]} items
 * @param {(id:string)=>void} [onAssign] callback optionnelle à chaque tri
 */
export default function InfoSorter({ items, onSolved, solved }) {
  const [assign, setAssign] = useState({}); // id -> 'utile' | 'inutile'
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);

  const allAssigned = items.every((it) => assign[it.id]);
  const allRight = items.every((it) => assign[it.id] === (it.useful ? 'utile' : 'inutile'));

  const place = (bin) => {
    if (selected === null || solved) return;
    setChecked(false);
    setAssign((a) => ({ ...a, [selected]: bin }));
    setSelected(null);
  };

  const pool = items.filter((it) => !assign[it.id]);
  const utiles = items.filter((it) => assign[it.id] === 'utile');
  const inutiles = items.filter((it) => assign[it.id] === 'inutile');

  const cardTone = (it) => {
    if (!checked) return 'bg-white border-slate-200 text-slate-700 hover:border-blue-400';
    const right = it.useful;
    return right ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800';
  };

  return (
    <div className="space-y-4">
      {/* Réserve de cartes */}
      {pool.length > 0 && (
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            Touche une information, puis un bac
          </div>
          <div className="flex flex-wrap gap-2">
            {pool.map((it) => (
              <motion.button
                key={it.id}
                layout
                type="button"
                onClick={() => setSelected(it.id)}
                aria-pressed={selected === it.id}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left max-w-[260px] transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selected === it.id ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 text-blue-900' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                {it.text}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Bacs de tri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => place('utile')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') place('utile'); }}
          className={`rounded-2xl border-2 border-dashed p-3 min-h-[100px] space-y-1.5 transition-colors ${
            selected !== null ? 'border-emerald-400 bg-emerald-50/50 cursor-pointer' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
            Données utiles
          </div>
          {utiles.map((it) => (
            <motion.button
              key={it.id}
              type="button"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              disabled={solved}
              onClick={(e) => { e.stopPropagation(); if (!solved) setAssign((a) => { const n = { ...a }; delete n[it.id]; return n; }); setChecked(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm transition-colors ${cardTone(it)} ${solved ? '' : 'hover:opacity-80'}`}
            >
              {checked && (it.useful ? <CheckCircle2 className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" /> : <XCircle className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />)}
              {it.text}
            </motion.button>
          ))}
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => place('inutile')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') place('inutile'); }}
          className={`rounded-2xl border-2 border-dashed p-3 min-h-[100px] space-y-1.5 transition-colors ${
            selected !== null ? 'border-slate-400 bg-slate-50 cursor-pointer' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Informations inutiles
          </div>
          {inutiles.map((it) => (
            <motion.button
              key={it.id}
              type="button"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              disabled={solved}
              onClick={(e) => { e.stopPropagation(); if (!solved) setAssign((a) => { const n = { ...a }; delete n[it.id]; return n; }); setChecked(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg border-2 text-sm transition-colors ${cardTone(it)} ${solved ? '' : 'hover:opacity-80'}`}
            >
              {checked && (!it.useful ? <CheckCircle2 className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" /> : <XCircle className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />)}
              {it.text}
            </motion.button>
          ))}
        </div>
      </div>

      {!solved && allAssigned && !checked && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setChecked(true);
              if (allRight) onSolved?.();
            }}
            className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Vérifier mon tri
          </button>
        </div>
      )}

      {checked && !allRight && !solved && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          Certaines cartes sont mal placées (voir les icônes). Touche-les pour les réassigner.
        </p>
      )}
    </div>
  );
}
