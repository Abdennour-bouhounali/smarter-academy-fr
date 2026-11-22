/**
 * Les TEINTES d'une مسألة (`problem.tone`, 2026-10-13) — chaque مسألة a sa couleur : la carte de la
 * question, les pastilles des demandes et la scène interactive la portent ; la carte d'activité
 * (MissionBrief) reçoit la même teinte. Défaut : `amber` (l'ancienne teinte de toutes les مسائل).
 * Les classes sont écrites EN ENTIER : Tailwind ne purge pas ce qu'il ne peut pas lire.
 */
export const PROBLEM_TONES = Object.freeze({
  indigo: {
    box: 'border-indigo-200 bg-indigo-50', title: 'text-indigo-950', rule: 'border-indigo-200', asksTitle: 'text-indigo-800',
    todo: 'border-indigo-400 text-indigo-800', chip: 'bg-indigo-100 text-indigo-900',
    panel: 'border-indigo-200 bg-indigo-50/60', accentText: 'text-indigo-800', fill: 'fill-indigo-500', fillSoft: 'fill-indigo-200', stroke: 'stroke-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700', range: 'accent-indigo-600',
  },
  violet: {
    box: 'border-violet-200 bg-violet-50', title: 'text-violet-950', rule: 'border-violet-200', asksTitle: 'text-violet-800',
    todo: 'border-violet-400 text-violet-800', chip: 'bg-violet-100 text-violet-900',
    panel: 'border-violet-200 bg-violet-50/60', accentText: 'text-violet-800', fill: 'fill-violet-500', fillSoft: 'fill-violet-200', stroke: 'stroke-violet-600', button: 'bg-violet-600 hover:bg-violet-700', range: 'accent-violet-600',
  },
  amber: {
    box: 'border-amber-200 bg-amber-50', title: 'text-amber-950', rule: 'border-amber-200', asksTitle: 'text-amber-800',
    todo: 'border-amber-400 text-amber-800', chip: 'bg-amber-100 text-amber-900',
    panel: 'border-amber-200 bg-amber-50/60', accentText: 'text-amber-800', fill: 'fill-amber-500', fillSoft: 'fill-amber-200', stroke: 'stroke-amber-600', button: 'bg-amber-600 hover:bg-amber-700', range: 'accent-amber-600',
  },
  emerald: {
    box: 'border-emerald-200 bg-emerald-50', title: 'text-emerald-950', rule: 'border-emerald-200', asksTitle: 'text-emerald-800',
    todo: 'border-emerald-400 text-emerald-800', chip: 'bg-emerald-100 text-emerald-900',
    panel: 'border-emerald-200 bg-emerald-50/60', accentText: 'text-emerald-800', fill: 'fill-emerald-500', fillSoft: 'fill-emerald-200', stroke: 'stroke-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700', range: 'accent-emerald-600',
  },
  teal: {
    box: 'border-teal-200 bg-teal-50', title: 'text-teal-950', rule: 'border-teal-200', asksTitle: 'text-teal-800',
    todo: 'border-teal-400 text-teal-800', chip: 'bg-teal-100 text-teal-900',
    panel: 'border-teal-200 bg-teal-50/60', accentText: 'text-teal-800', fill: 'fill-teal-500', fillSoft: 'fill-teal-200', stroke: 'stroke-teal-600', button: 'bg-teal-600 hover:bg-teal-700', range: 'accent-teal-600',
  },
  sky: {
    box: 'border-sky-200 bg-sky-50', title: 'text-sky-950', rule: 'border-sky-200', asksTitle: 'text-sky-800',
    todo: 'border-sky-400 text-sky-800', chip: 'bg-sky-100 text-sky-900',
    panel: 'border-sky-200 bg-sky-50/60', accentText: 'text-sky-800', fill: 'fill-sky-500', fillSoft: 'fill-sky-200', stroke: 'stroke-sky-600', button: 'bg-sky-600 hover:bg-sky-700', range: 'accent-sky-600',
  },
  rose: {
    box: 'border-rose-200 bg-rose-50', title: 'text-rose-950', rule: 'border-rose-200', asksTitle: 'text-rose-800',
    todo: 'border-rose-400 text-rose-800', chip: 'bg-rose-100 text-rose-900',
    panel: 'border-rose-200 bg-rose-50/60', accentText: 'text-rose-800', fill: 'fill-rose-500', fillSoft: 'fill-rose-200', stroke: 'stroke-rose-600', button: 'bg-rose-600 hover:bg-rose-700', range: 'accent-rose-600',
  },
});

export const problemTone = (tone) => PROBLEM_TONES[tone] ?? PROBLEM_TONES.amber;
