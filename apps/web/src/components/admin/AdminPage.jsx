import React from 'react';

/**
 * L'en-tête commun d'un écran d'administration : sur-titre, titre,
 * sous-titre, et une zone d'actions à droite.
 *
 * Reprend le patron d'en-tête des pages élève (Progression.jsx) pour que le
 * panneau reste manifestement le même produit.
 */
export default function AdminPage({ eyebrow, title, subtitle, actions, children }) {
  return (
    <div className="sa-page py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="mb-1 font-mono-jetbrains text-xs font-semibold uppercase tracking-widest text-blue-500">
              {eyebrow}
            </p>
          )}
          <h1 className="font-space text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl font-inter text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {children}
    </div>
  );
}
