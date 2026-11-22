import {
  Lightbulb, BookOpen, Hash, Quote, Star, Link2, Sparkle, ListOrdered,
  OctagonX, TriangleAlert, WandSparkles, SearchCheck, Pin, Target,
} from 'lucide-react';

/**
 * Les TYPES de nœud de la carte progressive et leur habillage. Deux familles :
 *
 *   core   la mathématique de la leçon — ce qu'il faut SAVOIR ;
 *   guide  l'accompagnement — ce à quoi faire ATTENTION, comment VÉRIFIER,
 *          ce qu'il faut RETENIR. Toujours rattaché à la connaissance qu'il
 *          éclaire, jamais à la racine par défaut.
 *
 * Un nœud « guide » se reconnaît sans la couleur : son icône, son libellé de
 * type (i18n map.progressive.kinds.*) et son filet de début (border-s-4) le
 * distinguent. Le moteur ne connaît que ces DONNÉES : aucun composant ne
 * teste « est-ce une erreur fréquente ? ».
 *
 * Couleurs de la famille core : celles des catégories de la carte habituelle
 * (CAT_THEME) — définition ↔ المفاهيم (bleu), مصطلحات ↔ vocabulaire (violet),
 * للحفظ ↔ memoriser (rose) ; les exemples en ambre (les محاور « أوظّف »).
 * Les classes sont écrites EN ENTIER : Tailwind ne voit pas une classe
 * composée à l'exécution.
 */
const core = (Icon, c) => ({ family: 'core', Icon, ...c });
const guide = (Icon, c) => ({ family: 'guide', Icon, ...c });

export const KIND_STYLE = {
  // ── CORE ────────────────────────────────────────────────────────────────
  concept: core(Lightbulb, {
    badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-300', tint: 'bg-indigo-50',
    ring: 'ring-indigo-400', halo: 'border-indigo-300', chip: 'bg-indigo-600',
  }),
  definition: core(BookOpen, {
    badge: 'bg-blue-100 text-blue-700', border: 'border-blue-300', tint: 'bg-blue-50',
    ring: 'ring-blue-400', halo: 'border-blue-300', chip: 'bg-blue-600',
  }),
  example: core(Hash, {
    badge: 'bg-amber-100 text-amber-800', border: 'border-amber-300', tint: 'bg-amber-50',
    ring: 'ring-amber-400', halo: 'border-amber-300', chip: 'bg-amber-600',
  }),
  term: core(Quote, {
    badge: 'bg-violet-100 text-violet-700', border: 'border-violet-300', tint: 'bg-violet-50',
    ring: 'ring-violet-400', halo: 'border-violet-300', chip: 'bg-violet-600',
  }),
  retain: core(Star, {
    badge: 'bg-rose-100 text-rose-700', border: 'border-rose-300', tint: 'bg-rose-50',
    ring: 'ring-rose-400', halo: 'border-rose-300', chip: 'bg-rose-600',
  }),
  idea: core(Sparkle, {
    badge: 'bg-cyan-100 text-cyan-800', border: 'border-cyan-300', tint: 'bg-cyan-50',
    ring: 'ring-cyan-400', halo: 'border-cyan-300', chip: 'bg-cyan-600',
  }),
  relationship: core(Link2, {
    badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-300', tint: 'bg-indigo-50',
    ring: 'ring-indigo-400', halo: 'border-indigo-300', chip: 'bg-indigo-600',
  }),
  method: core(ListOrdered, {
    badge: 'bg-teal-100 text-teal-800', border: 'border-teal-300', tint: 'bg-teal-50',
    ring: 'ring-teal-400', halo: 'border-teal-300', chip: 'bg-teal-600',
  }),

  // ── GUIDE ───────────────────────────────────────────────────────────────
  common_mistake: guide(OctagonX, {
    badge: 'bg-red-100 text-red-700', border: 'border-red-300', tint: 'bg-red-50/70',
    ring: 'ring-red-400', halo: 'border-red-300', chip: 'bg-red-600',
  }),
  warning: guide(TriangleAlert, {
    badge: 'bg-orange-100 text-orange-800', border: 'border-orange-300', tint: 'bg-orange-50/70',
    ring: 'ring-orange-400', halo: 'border-orange-300', chip: 'bg-orange-600',
  }),
  tip: guide(WandSparkles, {
    badge: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-300', tint: 'bg-yellow-50/70',
    ring: 'ring-yellow-400', halo: 'border-yellow-300', chip: 'bg-yellow-600',
  }),
  check: guide(SearchCheck, {
    badge: 'bg-sky-100 text-sky-800', border: 'border-sky-300', tint: 'bg-sky-50/70',
    ring: 'ring-sky-400', halo: 'border-sky-300', chip: 'bg-sky-600',
  }),
  prerequisite: guide(Pin, {
    badge: 'bg-slate-200 text-slate-700', border: 'border-slate-300', tint: 'bg-slate-50',
    ring: 'ring-slate-400', halo: 'border-slate-300', chip: 'bg-slate-600',
  }),
  takeaway: guide(Target, {
    badge: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300', tint: 'bg-emerald-50/70',
    ring: 'ring-emerald-400', halo: 'border-emerald-300', chip: 'bg-emerald-600',
  }),
};

export const kindStyle = (kind) => KIND_STYLE[kind] ?? KIND_STYLE.concept;
