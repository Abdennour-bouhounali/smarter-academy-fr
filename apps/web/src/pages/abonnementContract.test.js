import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Les contrats de la page de gestion d'abonnement — phase 7.
 *
 * Même convention que `checkoutContract.test.js` : le dépôt ne monte pas de
 * composants, donc les invariants critiques sont verrouillés en lisant la
 * source. Ce qui est vérifié ici n'est pas du style — ce sont les règles qui,
 * si elles cassaient, mentiraient à l'élève sur son accès ou lui feraient
 * perdre des jours qu'il a payés :
 *
 *   - la page ne décide jamais elle-même de l'accès ;
 *   - elle ne compare aucune date pour en déduire un droit ;
 *   - résilier n'est jamais un clic unique ;
 *   - l'élève est prévenu qu'il garde ses jours payés ;
 *   - aucun identifiant du fournisseur ne part du navigateur.
 */

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

const page = read('./Abonnement.jsx');
const service = read('../services/billingService.js');

/** Le code sans ses commentaires — on vérifie ce qui est RENDU. */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const code = stripComments(page);

describe('page /abonnement', () => {
  it("n'accorde jamais l'accès elle-même", () => {
    // L'état vient du serveur, jamais d'une écriture locale optimiste.
    expect(code).not.toMatch(/setBilling\(\s*\{[^}]*accessActive:\s*true/);
    expect(code).not.toMatch(/accessActive\s*=\s*true/);
  });

  it("ne déduit l'accès d'aucune comparaison de date", () => {
    // Le piège : `endsAt > Date.now()` semble raisonnable et fait de
    // l'horloge du POSTE l'arbitre de l'accès. Les dates ne servent ici
    // qu'à AFFICHER.
    expect(code).not.toMatch(/Date\.now\(\)\s*[<>]/);
    expect(code).not.toMatch(/new Date\([^)]*\)\s*[<>]/);
  });

  it('lit les autorisations du serveur au lieu de les recalculer', () => {
    // Les trois drapeaux sont calculés côté serveur pour que le bouton et la
    // règle ne puissent pas diverger.
    expect(code).toMatch(/canCancel/);
    expect(code).toMatch(/canResume/);
    expect(code).toMatch(/canManage/);
  });

  it('ne résilie jamais sur un seul clic', () => {
    // Un état de confirmation existe, et le bouton de résiliation l'arme
    // au lieu d'appeler directement le service.
    expect(code).toMatch(/confirmingCancel/);
    expect(code).toMatch(/setConfirmingCancel\(true\)/);
    // L'appel réel n'est atteignable que depuis le bloc de confirmation.
    const confirmIndex = code.indexOf('setConfirmingCancel(true)');
    const cancelCallIndex = code.indexOf("mutate('cancel'");
    expect(confirmIndex).toBeGreaterThan(-1);
    expect(cancelCallIndex).toBeGreaterThan(confirmIndex);
  });

  it("dit à l'élève qu'il garde ses jours déjà payés", () => {
    // Sans cette phrase, résilier ressemble à une coupure immédiate.
    expect(code).toMatch(/reste ouvert/i);
  });

  it('distingue les quatre états par des phrases différentes', () => {
    expect(code).toMatch(/Votre abonnement est actif/);
    expect(code).toMatch(/Votre abonnement prendra fin/);
    expect(code).toMatch(/Votre abonnement est terminé/);
    expect(code).toMatch(/accès gratuit/i);
    expect(code).toMatch(/Accès administrateur actif/);
  });

  it("n'expose aucun identifiant du fournisseur", () => {
    expect(page).not.toMatch(/cus_/);
    expect(page).not.toMatch(/sk_(test|live)_/);
    expect(page).not.toMatch(/price_1/);
    expect(page).not.toMatch(/stripe/i);
  });

  it('utilise le cadre de page partagé', () => {
    // La gouttière de 60px du bureau vient de `.sa-page` : la réécrire à la
    // main produirait une largeur différente des huit autres pages élève.
    expect(code).toMatch(/className="sa-page/);
  });

  it('désarme ses boutons pendant un appel', () => {
    // Sans cela, un double clic envoie deux résiliations.
    expect(code).toMatch(/disabled=\{busy !== null\}/);
  });
});

describe('service de facturation', () => {
  it("n'envoie jamais d'identifiant d'abonnement ou de client", () => {
    const serviceCode = stripComments(service);
    // Les trois mutations de la phase 7 partent sans corps.
    expect(serviceCode).not.toMatch(/body:\s*JSON\.stringify\(\{[^}]*customer/i);
    expect(serviceCode).not.toMatch(/body:\s*JSON\.stringify\(\{[^}]*subscription_id/i);
    expect(serviceCode).not.toMatch(/body:\s*JSON\.stringify\(\{[^}]*user_id/i);
  });
});
