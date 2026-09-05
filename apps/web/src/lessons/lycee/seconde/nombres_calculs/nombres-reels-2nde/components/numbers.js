/**
 * Les nombres de la leçon : chaque « spec » est une écriture EXACTE.
 *  - rational : { p, q } entiers (les chiffres viennent de la division posée) ;
 *  - irrational : une clé de IRRATIONALS (chaîne de décimales).
 * `label` est l'écriture exacte affichée ; `tex` sa version KaTeX.
 */
export const NUMBERS = {
  'un-et-demi': { id: 'un-et-demi', kind: 'rational', p: 3, q: 2, label: '1,5', tex: '1{,}5' },
  'deux-huitiemes': { id: 'deux-huitiemes', kind: 'rational', p: 2, q: 8, label: '2/8', tex: '\\tfrac{2}{8}' },
  'un-tiers': { id: 'un-tiers', kind: 'rational', p: 1, q: 3, label: '1/3', tex: '\\tfrac{1}{3}' },
  'deux-tiers': { id: 'deux-tiers', kind: 'rational', p: 2, q: 3, label: '2/3', tex: '\\tfrac{2}{3}' },
  'vingt-deux-septiemes': { id: 'vingt-deux-septiemes', kind: 'rational', p: 22, q: 7, label: '22/7', tex: '\\tfrac{22}{7}' },
  'trois-quarts': { id: 'trois-quarts', kind: 'rational', p: 3, q: 4, label: '3/4', tex: '\\tfrac{3}{4}' },
  'racine-neuf': { id: 'racine-neuf', kind: 'rational', p: 3, q: 1, label: '√9', tex: '\\sqrt{9}' },
  'moins-sept': { id: 'moins-sept', kind: 'rational', p: -7, q: 1, label: '−7', tex: '-7' },
  'zero-cinq': { id: 'zero-cinq', kind: 'rational', p: 1, q: 2, label: '0,5', tex: '0{,}5' },
  'douze': { id: 'douze', kind: 'rational', p: 12, q: 1, label: '12', tex: '12' },
  'moins-deux-virgule-vingt-cinq': { id: 'moins-deux-virgule-vingt-cinq', kind: 'rational', p: -9, q: 4, label: '−2,25', tex: '-2{,}25' },
  sqrt2: { id: 'sqrt2', kind: 'irrational', label: '√2', tex: '\\sqrt{2}' },
  pi: { id: 'pi', kind: 'irrational', label: 'π', tex: '\\pi' },
  sqrt10: { id: 'sqrt10', kind: 'irrational', label: '√10', tex: '\\sqrt{10}' },
};
