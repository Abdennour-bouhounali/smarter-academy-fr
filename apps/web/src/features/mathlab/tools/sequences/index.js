import { TrendingUp } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { SEQUENCES_SCHEMA_VERSION, createSequencesData } from './sequenceState.js';
import { summarizeSequences } from './summarize.js';

/**
 * Le مختبر المتتاليات (Laboratoire des suites et des récurrences) — le
 * huitième instrument du مختبر الرياضيات.
 *
 * L'élève ne lit pas « la suite converge vers 4 » : il pose u₀ = 10, tire le
 * curseur de `a`, et VOIT les termes se resserrer autour de 4 — puis il passe
 * `a` au-delà de 1 et les voit s'enfuir. Il clique « terme suivant » et
 * regarde la règle s'appliquer une fois : uₙ → f(uₙ) → uₙ₊₁. Il ouvre la
 * toile d'araignée et comprend d'un coup d'œil POURQUOI ça converge.
 *
 * ── Les différences d'abord, la convergence ensuite ──────────────────────
 * Les متتاليات ne figurent pas au programme de 4AM. Leur seul ancrage
 * authentique y est « الفروق المتتالية » — les différences successives, LP 2.1,
 * la leçon du PGCD — auquel s'ajoutent les الدوال الخطية والتآلفية (LP 3.7,
 * 3.8) dont la suite arithmétique est la cousine discrète.
 *
 * L'instrument ouvre donc sur une suite ARITHMÉTIQUE (u₀ = 2, r = 3) avec sa
 * colonne de différences déjà affichée : l'élève de 4AM y reconnaît le geste
 * de son manuel. La toile d'araignée, les points fixes, les sommes partielles
 * et l'étude de convergence — qui sont du lycée — existent, complets, mais
 * éteints. C'est la règle déjà tenue par le produit scalaire du مختبر الأشعة
 * (MATH_LAB §5f.10) puis par le cercle trigonométrique (§5g.1) : ce qui
 * dépasse le programme existe, mais ne fait jamais la première page.
 *
 * Toute la mathématique vit dans des modules purs (sequenceMath.js,
 * sequenceExpression.js, sequenceModel.js, sequenceFormat.js, practice.js)
 * testés à part ; le composant ne fait que les appeler. Chargé PARESSEUSEMENT
 * par `load`. Documenté dans docs/architecture/MATH_LAB.md §5h.
 */
export const sequencesTool = defineMathLabTool({
  id: 'sequences',
  slug: 'suites',
  labelKey: 'tools.sequences.name',
  descriptionKey: 'tools.sequences.description',
  newLabelKey: 'tools.sequences.new',
  defaultTitleKey: 'tools.sequences.defaultTitle',
  icon: TrendingUp,
  schemaVersion: SEQUENCES_SCHEMA_VERSION,
  // مخبر الثانوي seulement : les suites ne sont pas au programme du collège
  // (§5h.1) — l'ancrage 4AM (les différences successives) vit au مختبر الأعداد.
  scopes: ['secondaire'],
  createInitialData: createSequencesData,
  summarize: summarizeSequences,
  load: () => import('./SequencesTool.jsx'),
});
