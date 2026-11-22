import { LOCALE } from '../../locale.js';

const DAY = 24 * 60 * 60 * 1000;

/**
 * « آخر نشاط : أمس » — un libellé RELATIF pour les jours proches, une date
 * absolue au-delà d'un mois. `lastVisitedAt` est l'horodatage déjà stocké
 * par la progression de leçon ; rien n'est généré côté client.
 *
 * @param {number} lastVisitedAt  ms epoch (0 = jamais)
 * @param {(key: string, opts?: object) => string} t  traducteur du namespace
 *        `student` (clés `progression.relative.*`)
 * @param {number} [now]
 */
export function formatLastActivity(lastVisitedAt, t, now = Date.now()) {
  if (!lastVisitedAt || lastVisitedAt <= 0) return null;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfThen = new Date(lastVisitedAt);
  startOfThen.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.round((startOfToday - startOfThen) / DAY));

  if (days === 0) return t('progression.relative.today');
  if (days === 1) return t('progression.relative.yesterday');
  if (days < 7) return t('progression.relative.daysAgo', { count: days });
  if (days < 31) return t('progression.relative.weeksAgo', { count: Math.floor(days / 7) });
  try {
    return new Date(lastVisitedAt).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' });
  } catch {
    return new Date(lastVisitedAt).toLocaleDateString();
  }
}
