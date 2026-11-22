/**
 * LE DICTIONNAIRE des symboles — ce qui reste en caractères latins, et
 * comment on le LIT en arabe.
 *
 * ── Pourquoi il existe ───────────────────────────────────────────────────
 * Toute l'interface est arabe, mais la NOTATION ne l'est pas et ne doit pas
 * l'être : « ∀x ∈ ℝ, x² ≥ 0 » s'écrit ainsi dans le manuel de 4AM comme
 * partout ailleurs, et la retourner ou l'arabiser en ferait une autre
 * chose (ARABIC_RTL_CONTRACT §4 : « RTL layout, LTR mathematics »).
 *
 * Restait un trou : rien ne disait à l'élève COMMENT lire ces signes. Un
 * élève qui rencontre « ⇒ » pour la première fois n'a aucun moyen de savoir
 * qu'on le lit « يستلزم ». Ce fichier comble ce trou — chaque symbole a son
 * nom arabe, sa lecture à voix haute, et un exemple.
 *
 * ── Ce qui reste latin, et pourquoi ──────────────────────────────────────
 * - les CONNECTEURS et les QUANTIFICATEURS (¬ ∧ ∨ ⇒ ⇔ ∀ ∃) : notation
 *   internationale, celle du manuel ;
 * - les ENSEMBLES (ℕ ℤ ℚ ℝ) : idem ;
 * - les VARIABLES (P, Q, A, B, x, n, k) : le manuel de 4AM écrit « n = 2k »,
 *   pas « ع = ٢ك ». Arabiser les variables isolerait l'élève de tout autre
 *   livre de mathématiques qu'il ouvrira ensuite.
 *
 * Ce qui, en revanche, N'A PAS à rester latin et a été corrigé : les
 * abréviations de vérité. `V`/`F` (Vrai/Faux, français) sont devenues
 * `ص`/`خ` (صحيحة/خاطئة) — ce sont des MOTS abrégés, pas de la notation.
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
  // Vérité — les seules « lettres » arabes du tableau, parce que ce sont des mots.
  { id: 'true', symbol: 'ص', group: 'truth', example: null },
  { id: 'false', symbol: 'خ', group: 'truth', example: null },
  { id: 'unknown', symbol: '؟', group: 'truth', example: null },

  // Connecteurs
  { id: 'not', symbol: '¬', group: 'connectors', example: '¬P' },
  { id: 'and', symbol: '∧', group: 'connectors', example: 'P ∧ Q' },
  { id: 'or', symbol: '∨', group: 'connectors', example: 'P ∨ Q' },
  { id: 'implies', symbol: '⇒', group: 'connectors', example: 'x > 3 ⇒ x > 1' },
  { id: 'iff', symbol: '⇔', group: 'connectors', example: 'n زوجي ⇔ 2 | n' },

  // Quantificateurs
  { id: 'forall', symbol: '∀', group: 'quantifiers', example: '∀x ∈ ℝ, x² ≥ 0' },
  { id: 'exists', symbol: '∃', group: 'quantifiers', example: '∃x ∈ ℝ, x² = 4' },

  // Ensembles
  { id: 'in', symbol: '∈', group: 'sets', example: 'x ∈ ℝ' },
  { id: 'subset', symbol: '⊂', group: 'sets', example: 'P ⊂ Q' },
  { id: 'naturals', symbol: 'ℕ', group: 'sets', example: '0, 1, 2, 3, …' },
  { id: 'integers', symbol: 'ℤ', group: 'sets', example: '…, −2, −1, 0, 1, 2, …' },
  { id: 'rationals', symbol: 'ℚ', group: 'sets', example: '1/2 ; −3 ; 0,25' },
  { id: 'reals', symbol: 'ℝ', group: 'sets', example: '√2 ; π ; 1/3' },

  // Variables — la partie que le manuel écrit en latin
  { id: 'P', symbol: 'P', group: 'variables', example: 'P : « x > 3 »' },
  { id: 'Q', symbol: 'Q', group: 'variables', example: 'Q : « x > 1 »' },
  { id: 'x', symbol: 'x', group: 'variables', example: 'x + 2 = 5' },
  { id: 'n', symbol: 'n', group: 'variables', example: 'n = 2k' },
  { id: 'k', symbol: 'k', group: 'variables', example: 'n = 2k' },

  // Relations
  { id: 'divides', symbol: '|', group: 'relations', example: '2 | 6' },
  { id: 'notEqual', symbol: '≠', group: 'relations', example: 'x ≠ 0' },
  { id: 'geq', symbol: '≥', group: 'relations', example: 'x² ≥ 0' },
  { id: 'therefore', symbol: '∴', group: 'relations', example: '∴ n² زوجي' },
]);

/** Les entrées d'un groupe, dans l'ordre de déclaration. */
export const entriesOfGroup = (group) => DICTIONARY.filter((entry) => entry.group === group);

