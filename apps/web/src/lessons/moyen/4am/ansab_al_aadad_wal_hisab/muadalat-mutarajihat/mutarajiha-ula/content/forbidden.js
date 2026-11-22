/**
 * LA SIGNATURE DE LA مسألة (module 6, « رصيد رياض ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle MÉCANIQUE des conseils du
 * 2026-11-10 et du 2026-11-11 (verdict « L3 », gap 2 : les interdits sont de la DONNÉE écrite avant toute manche). Lue par
 * content/mission.test.js et ../../_unit/missionStrings.test.js.
 *
 *   La مسألة : crédit 600, باقة 120, 3 par message (= le coefficient de x), plancher 200 ; 600 − 120 − 3x ≥ 200 ; 480 ; −3x ≥ −280 ;
 *   ÷ (−3) (le sens change) ; 280/3 ; 93 messages, 201 restants ; 94 → 198 ; leurres 90 → 210, 95 → 195 ; bruit : 18500, 45.
 *   - dans AUCUN rôle : 480, 280, 280/3, 93, 94, 201, 198, 210, 195, 18500 ;
 *   - `coef` / `divisor` (un coefficient de x, une carte, un multiplicateur) : jamais 3 ni −3 (la carte ÷3 vient toujours avec ÷(−3)) ;
 *   - `probe` / `bound` (un x testé, un nombre fatidique) : jamais 90 ni 95 ;
 *   - `member` / `const` / `chip` / `tile` (ce qu'une barre, une ligne calculée ou une pastille montre) : jamais 600, 120, 200, 45, 90, 95 —
 *     plus strict que nécessaire : avec un x naturel CHAQUE valeur du membre de gauche est à l'écran, les nombres des manches ont été choisis
 *     pour les éviter tous.
 * LA CORRECTION INTERDITE, au sens ÉTROIT (verdict L3.8 a) : les points d'étape, la ورقة زميل et « أستعدّ » ne posent JAMAIS (a) un montant
 * restant « a − bx ≥ c » à traduire, (b) la division d'une inéquation À INCONNUE par un négatif, (c) « la plus grande solution naturelle sous
 * une borne non entière » ; la suite de questions du LABO peut apprendre « diviser par un négatif change le sens » sur SES nombres.
 */
export { TEXT } from '../../_unit/signatures/mutarajiha-ula.js';

export const NEVER = ['480', '280', '280/3', '93', '94', '201', '198', '210', '195', '18500'];
export const BAN_COEF = ['3', '-3'];
export const BAN_PROBE = ['90', '95'];
export const BAN_MEMBER = ['600', '120', '200', '45', '90', '95'];

const norm = (s) => String(s).replace(/\s+/g, '').replace(/−/g, '-');

/** Les violations pour ce qu'un écran du labo montre (`logic › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = norm(x.v);
    if (NEVER.some((n) => v === n || v.includes(n))) bad.push(at(x));
    if ((x.role === 'coef' || x.role === 'divisor') && BAN_COEF.includes(v)) bad.push(at(x));
    if ((x.role === 'probe' || x.role === 'bound') && BAN_PROBE.includes(v)) bad.push(at(x));
    if (['member', 'const', 'chip', 'tile'].includes(x.role) && BAN_MEMBER.includes(v)) bad.push(at(x));
  });
  return bad;
}
