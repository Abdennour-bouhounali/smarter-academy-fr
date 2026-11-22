import {
  Telescope, Blocks, Ruler, Target, SquarePlus, Parentheses, Superscript, PieChart,
  Binary, Percent, Scale, Divide, Grid3x3, Network, Sigma, Diff,
} from 'lucide-react';
import { MODES } from './numberState.js';

/**
 * LA BARRE du مختبر الأعداد — l'ordre d'affichage, les groupes, les icônes.
 *
 * Seize modes en une rangée de puces nues ne se DÉCOUVRENT pas : l'élève ne
 * voit que les cinq premiers. Ils sont donc rangés en trois familles, dans
 * l'ordre du programme :
 *
 *   العدد            ce qu'EST un nombre   (explorer, place, line, rounding)
 *   الحساب           ce qu'on en FAIT      (operations, order, powers, fractions, decimals, percent, proportion)
 *   الحساب في ℕ      l'ARITHMÉTIQUE        (division, divisibility, factors, primes, gcdLcm)
 *
 * La barre elle-même est `shared/LabSectionNav.jsx` (onglets WAI-ARIA, la
 * description du mode actif sous la barre) ; ce fichier n'en fournit que les
 * DONNÉES. `modeCatalog.test.js` vérifie que chaque mode de `MODES` y figure
 * exactement une fois — un mode ajouté sans place dans la barre serait
 * introuvable.
 */
export const MODE_GROUPS = Object.freeze(['number', 'calculation', 'arithmetic']);

export const MODE_SECTIONS = Object.freeze([
  { id: 'explorer', group: 'number', icon: Telescope },
  { id: 'place', group: 'number', icon: Blocks },
  { id: 'line', group: 'number', icon: Ruler },
  { id: 'rounding', group: 'number', icon: Target },

  { id: 'operations', group: 'calculation', icon: SquarePlus },
  { id: 'order', group: 'calculation', icon: Parentheses },
  { id: 'powers', group: 'calculation', icon: Superscript },
  { id: 'fractions', group: 'calculation', icon: PieChart },
  { id: 'decimals', group: 'calculation', icon: Binary },
  { id: 'percent', group: 'calculation', icon: Percent },
  { id: 'proportion', group: 'calculation', icon: Scale },

  { id: 'division', group: 'arithmetic', icon: Divide },
  { id: 'divisibility', group: 'arithmetic', icon: Sigma },
  { id: 'factors', group: 'arithmetic', icon: Grid3x3 },
  { id: 'primes', group: 'arithmetic', icon: Network },
  { id: 'gcdLcm', group: 'arithmetic', icon: Diff },
].filter((section) => MODES.includes(section.id)));
