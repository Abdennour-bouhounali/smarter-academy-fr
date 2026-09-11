import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fetchPlans, startCheckout } from './billingService';

/**
 * Le service de paiement, côté client.
 *
 * Deux choses sont vérifiées ici, et la seconde est la plus importante :
 *
 *   1. le service fait ce qu'on attend (URL rendue, erreurs typées) ;
 *   2. il n'envoie JAMAIS de prix, de montant ni d'identité.
 *
 * Le second point se teste en lisant ce qui part réellement dans le corps de
 * la requête : c'est plus solide qu'une relecture du code, parce qu'un champ
 * ajouté par mégarde demain le ferait échouer.
 */
describe('billingService', () => {
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

  describe('startCheckout', () => {
    it('rend l’URL de paiement servie par le serveur', async () => {
      respond(201, { success: true, checkoutUrl: 'https://pay.test/s/1', plan: 'annual' });

      const result = await startCheckout('jeton', 'annual');

      expect(result.checkoutUrl).toBe('https://pay.test/s/1');
      expect(result.plan).toBe('annual');
    });

    it('n’envoie QUE la clé d’offre — jamais un prix, un montant ou une identité', async () => {
      respond(201, { success: true, checkoutUrl: 'https://pay.test/s/1', plan: 'annual' });

      await startCheckout('jeton', 'annual');

      const [, options] = global.fetch.mock.calls[0];
      const body = JSON.parse(options.body);

      // Le corps est exactement `{ plan }`. Rien de plus.
      expect(Object.keys(body)).toEqual(['plan']);
      expect(body.plan).toBe('annual');

      // Ces champs ne doivent jamais apparaître : le serveur les ignorerait,
      // mais les envoyer laisserait croire qu'ils comptent.
      for (const forbidden of ['price', 'price_id', 'priceId', 'amount', 'amount_cents', 'currency', 'user_id', 'userId', 'premium']) {
        expect(body).not.toHaveProperty(forbidden);
      }
    });

    it('transporte le jeton d’authentification', async () => {
      respond(201, { success: true, checkoutUrl: 'https://pay.test/s/1' });

      await startCheckout('mon-jeton', 'annual');

      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer mon-jeton');
      expect(options.method).toBe('POST');
    });

    it('remonte le message du serveur quand il refuse (déjà abonné)', async () => {
      respond(422, { success: false, message: 'Vous êtes déjà abonné.' });

      // Le message est fait pour être montré tel quel à l'élève.
      await expect(startCheckout('jeton', 'annual')).rejects.toThrow('Vous êtes déjà abonné.');
    });

    it('remonte une erreur quand le prestataire est en panne', async () => {
      respond(503, { success: false, message: 'Le service de paiement est momentanément indisponible.' });

      await expect(startCheckout('jeton', 'annual')).rejects.toThrow(/indisponible/i);
    });

    it('refuse une réponse sans URL plutôt que de rediriger vers rien', async () => {
      respond(201, { success: true, plan: 'annual' });

      await expect(startCheckout('jeton', 'annual')).rejects.toThrow(/pas répondu correctement/i);
    });

    it('convertit une panne réseau en erreur typée', async () => {
      global.fetch.mockRejectedValue(new TypeError('network'));

      await expect(startCheckout('jeton', 'annual')).rejects.toThrow(/joindre le serveur/i);
    });
  });

  describe('fetchPlans', () => {
    it('rend les offres, l’état et le mode', async () => {
      respond(200, {
        success: true,
        plans: [{ key: 'annual', amountCents: 3500, currency: 'EUR', purchasable: true }],
        status: { canSubscribe: true },
        mode: 'test',
      });

      const result = await fetchPlans('jeton');

      expect(result.plans).toHaveLength(1);
      expect(result.plans[0].key).toBe('annual');
      expect(result.mode).toBe('test');
      expect(result.status.canSubscribe).toBe(true);
    });

    it('ne suppose aucune offre quand le serveur répond vide', async () => {
      respond(200, { success: true });

      const result = await fetchPlans('jeton');

      expect(result.plans).toEqual([]);
      expect(result.mode).toBe('test');
    });
  });

  describe('la frontière', () => {
    const source = readFileSync(
      fileURLToPath(new URL('./billingService.js', import.meta.url)),
      'utf8',
    );

    it('ne contient aucun identifiant de tarif du prestataire', () => {
      // Un `price_...` codé dans le bundle serait un tarif que le navigateur
      // pourrait lire, donc remplacer. Le serveur en est seul détenteur.
      expect(source).not.toMatch(/price_[a-zA-Z0-9]/);
      expect(source).not.toMatch(/sk_(test|live)_/);
      expect(source).not.toMatch(/pk_(test|live)_/);
      expect(source).not.toMatch(/whsec_/);
    });
  });
});
