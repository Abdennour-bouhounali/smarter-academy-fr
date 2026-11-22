/**
 * LA SIGNATURE DE LA مسألة (module 4, « متحف الولاية ») qu'aucun écran avant elle ne montre DANS SON RÔLE (conseil du 2026-11-11, design L3 §1,
 * verdict L3.1). Lue par content/stories.test.js (les écrans viennent de `logic/storyModellerPlayer › shownValues`) et content/mission.test.js.
 *
 *   x + y = 180 ; 250x + 100y = 33000 → 150x = 15000 → (100 ; 80) ; échangé : 30000 ; partie 2 : 210 visiteurs, 40000 دج → 380/3 et 250/3
 *   (les leurres 126 / 84 et l'ARRONDI 127 / 83) ; partie 3 : 8000 perdus, 100p = 33000 → p = 330 (leurres 180p, 350 = 250 + 100).
 *   - `count` (un total compté) : 180, 210 ; `money` (un total d'argent) : 33000, 40000 — dans AUCUN rôle d'écran ;
 *   - `price` : 250 ; la DIFFÉRENCE des prix d'une histoire « nombre + argent » : 150 (elle écrit « 150x = … », la ligne de la مسألة) ;
 *   - `solution` : 100, 80, 380/3, 250/3 ; `check` (rejeu et produits partiels) : 30000, 25000, 8000, 33000, 39900, 40050 ;
 *   - leurres : 126, 84, 127, 83, 330, 350 ; `structure` : des PERSONNES qui entrent à deux prix (« tickets ») ;
 *   - `eq` : les lignes de la مسألة, nues.
 * La synthèse (`SYNTH`) et le défi de la page d'unité (`UNIT_PAGE`) sont lus dans ../_unit/forbiddenShared.js.
 */
import { SYNTH, UNIT_PAGE } from '../../_unit/forbiddenShared.js';

export const NEVER = ['180', '210', '33000', '40000'];
export const BAD_PRICE = ['250'];
export const BAD_PRICE_DIFF = ['150'];
export const BAD_SOLUTION = ['100', '80', '380/3', '250/3'];
export const BAD_CHECK = ['30000', '25000', '8000', '33000', '39900', '40050'];
export const BAD_DISTRACTOR = ['126', '84', '127', '83', '330', '350'];
export const BAD_EQ = ['x+y=180', '250x+100y=33000', 'y=180-x', '250x+100(180-x)=33000', '150x+18000=33000', '150x=15000', 'x+y=210', '250x+100y=40000',
  '150x=19000', '100p=33000', '180p=33000', '350(x+y)=33000', '100x+250y=33000'];
/** Les nombres que la synthèse et la page d'unité gardent (dans aucun rôle). */
export const SHARED_NEVER = [...SYNTH.never, ...UNIT_PAGE.never].map(String);

export const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-');

/** Les violations pour ce qu'un écran montre (`{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = bare(x.v);
    const abs = v.replace(/^-/, '');
    if (x.role === 'structure') { if (v === 'tickets') bad.push(at(x)); return; }
    if (['line', 'eq'].includes(x.role)) {
      if (BAD_EQ.includes(v)) bad.push(at(x));
      if (/(^|[^0-9])150x/.test(v)) bad.push(`${label}: « 150x » in ${v}`);
      return;
    }
    if (NEVER.includes(abs) || SHARED_NEVER.includes(abs)) bad.push(at(x));
    if (x.role === 'price' && BAD_PRICE.includes(abs)) bad.push(at(x));
    if (x.role === 'priceDiff' && BAD_PRICE_DIFF.includes(abs)) bad.push(at(x));
    if (['solution', 'lineValue'].includes(x.role) && BAD_SOLUTION.includes(v)) bad.push(at(x));
    if (['check', 'lineValue'].includes(x.role) && BAD_CHECK.includes(abs)) bad.push(at(x));
    if (['solution', 'chip', 'story', 'tile', 'decoy', 'check', 'lineValue'].includes(x.role) && BAD_DISTRACTOR.includes(abs)) bad.push(at(x));
  });
  return bad;
}
