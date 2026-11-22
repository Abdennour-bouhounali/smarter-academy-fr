/**
 * LE LEXIQUE des symboles — comment on LIT la notation de l'atelier.
 *
 * ── Pourquoi il existe ───────────────────────────────────────────────────
 * La notation (« ∀x ∈ ℝ, x² ⩾ 0 ») est celle de toutes les mathématiques,
 * mais rien ne disait à l'élève COMMENT la lire. Un élève qui rencontre
 * « ⇒ » pour la première fois n'a aucun moyen de savoir qu'on le lit
 * « implique ». Ce fichier comble ce trou — chaque symbole a son nom, sa
 * lecture à voix haute, et un exemple.
 *
 * ── Ce qu'il contient ────────────────────────────────────────────────────
 * - les CONNECTEURS et les QUANTIFICATEURS (¬ ∧ ∨ ⇒ ⇔ ∀ ∃) ;
 * - les ENSEMBLES (ℕ ℤ ℚ ℝ) ;
 * - les VARIABLES (P, Q, x, n, k) : des lettres qui désignent une
 *   proposition ou un nombre, pas des abréviations de mots ;
 * - les abréviations de vérité V / F d'une table de vérité.
 *
 * Les entrées sont des identifiants ; les libellés vivent dans
 * `mathlab.json` sous `tools.logic.dictionary.entries.<id>`.
 */

/** Les groupes, dans l'ordre où le dictionnaire les présente. */
export const DICTIONARY_GROUPS = Object.freeze(['truth', 'connectors', 'quantifiers', 'sets', 'variables', 'relations']);

/**
 * Une entrée : son symbole (tel qu'il s'écrit), son groupe, et un exemple
 * — l'exemple est de la notation lui aussi, donc rendu en `dir="ltr"`.
 */
export const DICTIONARY = Object.freeze([
  // Vérité — les abréviations d'une table de vérité.
  { id: 'true', symbol: 'V', group: 'truth', example: null },
  { id: 'false', symbol: 'F', group: 'truth', example: null },
  { id: 'unknown', symbol: '?', group: 'truth', example: null },

  // Connecteurs
  { id: 'not', symbol: '¬', group: 'connectors', example: '¬P' },
  { id: 'and', symbol: '∧', group: 'connectors', example: 'P ∧ Q' },
  { id: 'or', symbol: '∨', group: 'connectors', example: 'P ∨ Q' },
  { id: 'implies', symbol: '⇒', group: 'connectors', example: 'x > 3 ⇒ x > 1' },
  { id: 'iff', symbol: '⇔', group: 'connectors', example: 'n pair ⇔ 2 | n' },

  // Quantificateurs
  { id: 'forall', symbol: '∀', group: 'quantifiers', example: '∀x ∈ ℝ, x² ⩾ 0' },
  { id: 'exists', symbol: '∃', group: 'quantifiers', example: '∃x ∈ ℝ, x² = 4' },

  // Ensembles
  { id: 'in', symbol: '∈', group: 'sets', example: 'x ∈ ℝ' },
  { id: 'subset', symbol: '⊂', group: 'sets', example: 'P ⊂ Q' },
  { id: 'naturals', symbol: 'ℕ', group: 'sets', example: '0 ; 1 ; 2 ; 3 ; …' },
  { id: 'integers', symbol: 'ℤ', group: 'sets', example: '… ; −2 ; −1 ; 0 ; 1 ; 2 ; …' },
  { id: 'rationals', symbol: 'ℚ', group: 'sets', example: '1/2 ; −3 ; 0,25' },
  { id: 'reals', symbol: 'ℝ', group: 'sets', example: '√2 ; π ; 1/3' },

  // Variables
  { id: 'P', symbol: 'P', group: 'variables', example: 'P : « x > 3 »' },
  { id: 'Q', symbol: 'Q', group: 'variables', example: 'Q : « x > 1 »' },
  { id: 'x', symbol: 'x', group: 'variables', example: 'x + 2 = 5' },
  { id: 'n', symbol: 'n', group: 'variables', example: 'n = 2k' },
  { id: 'k', symbol: 'k', group: 'variables', example: 'n = 2k' },

  // Relations
  { id: 'divides', symbol: '|', group: 'relations', example: '2 | 6' },
  { id: 'notEqual', symbol: '≠', group: 'relations', example: 'x ≠ 0' },
  { id: 'geq', symbol: '⩾', group: 'relations', example: 'x² ⩾ 0' },
  { id: 'therefore', symbol: '∴', group: 'relations', example: '∴ n² pair' },
]);

/** Les entrées d'un groupe, dans l'ordre de déclaration. */
export const entriesOfGroup = (group) => DICTIONARY.filter((entry) => entry.group === group);

