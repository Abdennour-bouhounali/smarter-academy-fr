import i18n from '../../../i18n';
import { activatePlan } from '../../../services/admin/subscriptionService';

/** Traduit dans le catalogue `admin`, hors composant React (voir bulkContentActions). */
const t = (key, options) => i18n.t(key, { ns: 'admin', ...options });

/**
 * « تفعيل عرض » EN LOT — une action par offre, pour la BulkActionBar.
 *
 * Il n'existe pas de route serveur groupée : le lot appelle, élève par élève,
 * la MÊME route que le geste unitaire (`POST /admin/students/{id}/subscriptions`).
 * La validation, le refus et le journal restent donc ceux du serveur, et
 * chaque refus revient nommé avec son motif. Les appels sont SÉQUENTIELS :
 * un lot de 25 ne doit pas ouvrir 25 transactions concurrentes.
 *
 * Le rapport porte `statusById` : chaque ligne prend l'état que le serveur a
 * réellement donné à SON abonnement, jamais un état supposé.
 *
 * @param {{token: string, plans: Array<{id: number, name: string}>, nameOf: (row: object) => string}} options
 */
export function buildPlanBulkActions({ token, plans, nameOf }) {
  return plans.map((plan) => ({
    key: `activate-plan-${plan.id}`,
    label: t('students.bulkActivate', { plan: plan.name }),
    tone: 'default',
    runningLabel: () => t('students.bulkActivateRunning', { plan: plan.name }),
    successLabel: (count) => t('students.bulkActivateSuccess', { count, counted: t('bulk.nounOf.student', { count }), plan: plan.name }),
    confirm: {
      title: (count, c) => t('students.confirmBulkActivateTitle', { plan: plan.name, counted: c }),
      confirmLabel: (count, c) => t('students.confirmBulkActivateAction', { counted: c }),
      message: () => <p>{t('commercial.activatePlanHint')}</p>,
    },
    run: async (rows) => {
      const applied = [];
      const failed = [];
      const statusById = {};
      for (const row of rows) {
        try {
          const result = await activatePlan(token, 'students', row.id, { planId: plan.id });
          applied.push(row.id);
          statusById[row.id] = result.subscription?.status ?? null;
        } catch (caught) {
          failed.push({ id: row.id, title: nameOf(row), message: caught.message });
        }
      }
      return { applied, unchanged: [], failed, statusById };
    },
  }));
}
