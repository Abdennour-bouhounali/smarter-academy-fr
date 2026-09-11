import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  fetchSubscription,
  openBillingPortal,
  cancelSubscription,
  resumeSubscription,
} from './billingService';

/**
 * La gestion d'abonnement, côté client — phase 7.
 *
 * Ce que ce fichier défend, et c'est le point central de la phase :
 *
 *     le navigateur n'envoie AUCUN identifiant, et n'en déduit AUCUN droit
 *
 * Un corps de requête vide n'est pas un oubli : c'est la protection. Tant
 * qu'aucun identifiant n'est transmis, il n'existe rien à falsifier pour
 * désigner l'abonnement d'un autre élève.
 */
describe('subscriptionService (phase 7)', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function respond(status, body) {
    global.fetch.mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    });
  }

  const ACTIVE = {
    accessActive: true,
    subscription: { status: 'active', plan: 'annual', cancelAtPeriodEnd: false },
    canCancel: true,
    canResume: false,
    canManage: true,
  };

  describe('fetchSubscription', () => {
    it("rend l'état de facturation servi par le serveur", async () => {
      respond(200, { success: true, billing: ACTIVE });

      const billing = await fetchSubscription('jeton');

      expect(billing.accessActive).toBe(true);
      expect(billing.subscription.plan).toBe('annual');
    });

    it('ne devine rien quand le serveur ne renvoie pas de billing', async () => {
      respond(200, { success: true });

      expect(await fetchSubscription('jeton')).toBeNull();
    });

    it('propage un refus du serveur au lieu de rendre un état vide', async () => {
      respond(403, { success: false, message: 'Compte suspendu.' });

      await expect(fetchSubscription('jeton')).rejects.toThrow('Compte suspendu.');
    });
  });

  describe('openBillingPortal', () => {
    it("rend l'URL du portail et n'envoie AUCUN identifiant", async () => {
      respond(200, { success: true, portalUrl: 'https://portal.test/s/1' });

      const url = await openBillingPortal('jeton');

      expect(url).toBe('https://portal.test/s/1');

      const [, options] = global.fetch.mock.calls[0];
      // Le corps est vide : rien à falsifier, donc rien à protéger.
      expect(options.body ?? '').toBe('');
    });

    it('refuse une réponse sans URL plutôt que de rediriger vers undefined', async () => {
      respond(200, { success: true });

      await expect(openBillingPortal('jeton')).rejects.toThrow();
    });

    it('propage le message métier du serveur', async () => {
      respond(422, { success: false, message: 'Aucun abonnement à gérer pour ce compte.' });

      await expect(openBillingPortal('jeton')).rejects.toThrow('Aucun abonnement à gérer');
    });
  });

  describe('cancelSubscription / resumeSubscription', () => {
    it("rend l'état RENVOYÉ PAR LE SERVEUR, sans le recalculer", async () => {
      const afterCancel = {
        ...ACTIVE,
        subscription: { ...ACTIVE.subscription, cancelAtPeriodEnd: true },
        canCancel: false,
        canResume: true,
      };
      respond(200, { success: true, billing: afterCancel });

      const billing = await cancelSubscription('jeton');

      // L'accès reste ouvert : c'est le serveur qui le dit, et le client
      // n'a rien à en déduire lui-même.
      expect(billing.accessActive).toBe(true);
      expect(billing.subscription.cancelAtPeriodEnd).toBe(true);
      expect(billing.canResume).toBe(true);
    });

    it("n'envoie aucun identifiant d'abonnement à la résiliation", async () => {
      respond(200, { success: true, billing: ACTIVE });

      await cancelSubscription('jeton');

      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain('/billing/subscription/cancel');
      expect(options.method).toBe('POST');
      expect(options.body ?? '').toBe('');
    });

    it("n'envoie aucun identifiant d'abonnement à la reprise", async () => {
      respond(200, { success: true, billing: ACTIVE });

      await resumeSubscription('jeton');

      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain('/billing/subscription/resume');
      expect(options.body ?? '').toBe('');
    });

    it('propage un refus métier', async () => {
      respond(422, { success: false, message: "Cet abonnement n'est plus actif." });

      await expect(resumeSubscription('jeton')).rejects.toThrow("n'est plus actif");
    });

    it('propage une panne du fournisseur sans inventer un succès', async () => {
      respond(503, { success: false, message: 'Service indisponible.' });

      await expect(cancelSubscription('jeton')).rejects.toThrow('Service indisponible.');
    });
  });

  /**
   * Le contrat de la SOURCE, pas du comportement.
   *
   * Certaines promesses ne se testent pas à l'exécution : « ce module ne
   * contient aucune clé Stripe » se vérifie en lisant le fichier. Un test de
   * comportement passerait même si une clé y était écrite en dur.
   */
  describe('contrat de source', () => {
    const source = readFileSync(
      fileURLToPath(new URL('./billingService.js', import.meta.url)),
      'utf8',
    );

    it("ne contient aucune clé ni identifiant du fournisseur", () => {
      expect(source).not.toMatch(/sk_(test|live)_/);
      expect(source).not.toMatch(/whsec_/);
      expect(source).not.toMatch(/price_1/);
    });

    it("n'appelle jamais Stripe directement", () => {
      expect(source).not.toMatch(/stripe\.com/i);
      expect(source).not.toMatch(/new Stripe\(/);
    });
  });
});
