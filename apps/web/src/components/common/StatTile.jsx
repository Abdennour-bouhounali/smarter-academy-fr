import React from 'react';

/**
 * Une tuile d'indicateur : une icône, un nombre, une étiquette.
 *
 * Extraite de Progression.jsx et StudentHome.jsx, où elle était dupliquée
 * mot pour mot. Le panneau d'administration en aurait fait une troisième
 * copie — d'où ce fichier, que les trois importent maintenant.
 *
 * `tabular-nums` est délibéré : sans lui, les chiffres changent de largeur et
 * une rangée de compteurs tressaute à chaque rafraîchissement.
 */
export default function StatTile({ icon: Icon, value, label, accent = 'bg-slate-100 text-slate-600', hint }) {
  return (
    <div className="glass-card p-4 sm:p-5 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="font-space font-black text-xl text-slate-900 leading-none tabular-nums">{value}</p>
        <p className="font-inter text-slate-500 text-xs mt-1 leading-tight">{label}</p>
        {hint && <p className="font-inter text-slate-400 text-xs mt-0.5 leading-tight">{hint}</p>}
      </div>
    </div>
  );
}
