import { Check, CircleDot, HelpCircle, X } from 'lucide-react';

/**
 * L'apparence d'une issue (`outcomeTone`, questionHistory.js), partagée par
 * le retour, l'historique et la barre de progression.
 *
 * Une réponse fausse n'est PAS rouge vif : c'est un moment d'apprentissage,
 * pas une alarme. Elle prend un orangé chaud — distinct du vert, distinct du
 * rouge d'erreur système — et porte toujours son icône ✕ et son libellé :
 * la couleur n'est jamais le seul signal.
 */
export const TONE_STYLE = {
  correct: {
    node: 'bg-emerald-100 text-emerald-700 ring-4 ring-slate-50',
    chip: 'bg-emerald-50 text-emerald-800',
    text: 'text-emerald-700',
    rule: 'border-emerald-300',
    segment: 'bg-emerald-500',
    panel: 'bg-emerald-50 border-emerald-500',
    badge: 'bg-emerald-600 text-white',
  },
  partial: {
    node: 'bg-sky-100 text-sky-700 ring-4 ring-slate-50',
    chip: 'bg-sky-50 text-sky-800',
    text: 'text-sky-700',
    rule: 'border-sky-300',
    segment: 'bg-sky-500',
    panel: 'bg-sky-50 border-sky-500',
    badge: 'bg-sky-600 text-white',
  },
  incorrect: {
    node: 'bg-orange-100 text-orange-700 ring-4 ring-slate-50',
    chip: 'bg-orange-50 text-orange-800',
    text: 'text-orange-700',
    rule: 'border-orange-300',
    segment: 'bg-orange-400',
    panel: 'bg-orange-50 border-orange-400',
    badge: 'bg-orange-500 text-white',
  },
  neutral: {
    node: 'bg-slate-200 text-slate-600 ring-4 ring-slate-50',
    chip: 'bg-slate-100 text-slate-700',
    text: 'text-slate-600',
    rule: 'border-slate-300',
    segment: 'bg-slate-400',
    panel: 'bg-slate-50 border-slate-400',
    badge: 'bg-slate-500 text-white',
  },
};

const ICONS = {
  correct: Check, partial: CircleDot, incorrect: X, neutral: HelpCircle,
};

export function ToneIcon({ tone, className = 'h-4 w-4' }) {
  const Icon = ICONS[tone] ?? HelpCircle;

  return <Icon className={className} strokeWidth={2.75} aria-hidden="true" />;
}
