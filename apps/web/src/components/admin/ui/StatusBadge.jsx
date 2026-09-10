import React from 'react';

/**
 * Une pastille d'état.
 *
 * Le texte porte TOUJOURS l'information — la couleur ne fait que la répéter.
 * C'est la même règle que le `Feedback` des leçons (« jamais la couleur
 * seule »), et elle vaut autant pour un daltonien que pour une capture
 * d'écran en noir et blanc dans un ticket.
 */
const TONES = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  free: 'bg-slate-100 text-slate-600 border-slate-200',
  dismissed: 'bg-slate-100 text-slate-600 border-slate-200',
  hidden: 'bg-amber-50 text-amber-700 border-amber-200',
  suspended: 'bg-amber-50 text-amber-700 border-amber-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-slate-200 text-slate-700 border-slate-300',
  disabled: 'bg-rose-50 text-rose-700 border-rose-200',
  expired: 'bg-rose-50 text-rose-700 border-rose-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  duplicate: 'bg-violet-50 text-violet-700 border-violet-200',
  critical: 'bg-rose-100 text-rose-800 border-rose-300',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const STATUS_LABELS = {
  published: 'Publié',
  draft: 'Brouillon',
  hidden: 'Masqué',
  archived: 'Archivé',
  active: 'Actif',
  suspended: 'Suspendu',
  disabled: 'Désactivé',
  new: 'Nouveau',
  in_review: 'En cours',
  resolved: 'Résolu',
  dismissed: 'Rejeté',
  duplicate: 'Doublon',
  free: 'Gratuit',
  expired: 'Expiré',
  cancelled: 'Annulé',
  pending: 'En attente',
  critical: 'Critique',
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

export default function StatusBadge({ status, label }) {
  const tone = TONES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-inter text-xs font-semibold ${tone}`}>
      {label ?? STATUS_LABELS[status] ?? status}
    </span>
  );
}
