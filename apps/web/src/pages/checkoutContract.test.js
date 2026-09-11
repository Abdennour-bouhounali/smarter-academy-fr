import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Les contrats de l'interface d'achat — vérifiés sur la SOURCE.
 *
 * Le dépôt ne monte pas de composants en test (pas de bibliothèque de rendu) ;
 * la convention établie est de verrouiller les propriétés critiques en lisant
 * le code, comme le font déjà `entitlementAvailability.test.js` et
 * `contentAvailability.test.js`.
 *
 * Ce qui est verrouillé ici n'est pas du style, ce sont les invariants qui,
 * s'ils cassaient, ouvriraient un accès non payé ou mentiraient à l'élève :
 *
 *   - la page de retour n'accorde jamais l'accès elle-même ;
 *   - elle ne prétend jamais qu'un paiement a réussi ;
 *   - le bouton d'achat se désarme pendant l'ouverture ;
 *   - aucun secret ni tarif du prestataire ne vit dans le bundle.
 */

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

const retour = read('./AbonnementRetour.jsx');

/**
 * Le code SANS ses commentaires.
 *
 * Nécessaire pour la règle « ne prétend jamais qu'un paiement a réussi » :
 * les commentaires expliquent justement pourquoi cette phrase est proscrite,
 * et les inclure ferait échouer le test sur sa propre justification. On
 * vérifie donc ce qui est RENDU, pas ce qui est expliqué.
 */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const retourCode = stripComments(retour);
const tarifs = read('./Tarifs.jsx');
const card = read('../components/pricing/PricingCard.jsx');

describe('page de retour de paiement', () => {
  it("n'écrit jamais l'accès elle-même", () => {
    // La faute capitale : croire l'URL de retour. `?statut=succes` est dans la
    // barre d'adresse — n'importe qui peut l'ouvrir.
    expect(retour).not.toMatch(/setAccess\(\s*\{[^}]*premiumAccess:\s*true/);
    expect(retour).not.toMatch(/premiumAccess\s*=\s*true/);
    expect(retour).not.toMatch(/localStorage\.setItem\(\s*['"].*premium/i);
  });

  it("ne prétend jamais qu'un paiement a réussi", () => {
    // Au moment où l'élève arrive, le webhook n'est peut-être pas arrivé.
    // Annoncer un succès puis montrer du contenu verrouillé est pire que
    // d'annoncer une attente.
    expect(retourCode).not.toMatch(/Paiement\s+réussi/i);
    expect(retourCode).not.toMatch(/Merci\s+pour\s+votre\s+achat/i);
    expect(retourCode).not.toMatch(/Paiement\s+confirmé/i);
  });

  it("demande l'état au serveur, qui reste l'autorité", () => {
    expect(retour).toContain('fetchClosedContent');
    // L'affichage « actif » est conditionné à la réponse du SERVEUR.
    expect(retour).toMatch(/access\?\.premiumAccess\s*===\s*true/);
  });

  it("borne ses tentatives au lieu de sonder sans fin", () => {
    expect(retour).toContain('RETRY_DELAYS');
    // Une liste finie : passé ces essais, on rend la main à l'élève plutôt
    // que de faire porter un trafic permanent à chaque onglet ouvert.
    expect(retour).toMatch(/RETRY_DELAYS\s*=\s*\[[^\]]+\]/);
    expect(retour).toMatch(/attempt\s*<\s*RETRY_DELAYS\.length/);
  });

  it('nettoie son minuteur au démontage', () => {
    // Sans cela, un minuteur survit à la page et met à jour un composant
    // démonté — l'avertissement classique, et une fuite.
    expect(retour).toContain('clearTimeout');
  });

  it('gère explicitement une annulation', () => {
    expect(retour).toMatch(/statut'\)\s*===\s*'annule'/);
    expect(retour).toMatch(/Paiement annulé/);
    // Et rassure : aucun montant n'a été pris.
    expect(retour).toMatch(/aucun montant n'a été débité/i);
  });
});

describe("bouton d'achat", () => {
  it('se désarme pendant une ouverture de paiement', () => {
    // La première barrière contre le double clic ; la clé d'idempotence
    // serveur est la seconde.
    expect(card).toMatch(/disabled=\{busy\}/);
    expect(card).toContain('aria-busy');
  });

  it("refuse de partir deux fois de suite", () => {
    // La garde dans le gestionnaire : même si le bouton était re-cliqué,
    // l'appel ne part pas.
    expect(tarifs).toMatch(/if\s*\(busy\)\s*return;/);
  });

  it("n'envoie qu'une clé d'offre au serveur", () => {
    expect(tarifs).toMatch(/startCheckout\(token,\s*'annual'\)/);
    // Aucun montant ni tarif ne part du navigateur.
    expect(tarifs).not.toMatch(/price_[a-zA-Z0-9]/);
    expect(tarifs).not.toMatch(/amount_cents:\s*\d/);
  });

  it("montre le refus du serveur tel quel", () => {
    // « Vous êtes déjà abonné » est actionnable ; « une erreur est survenue »
    // ne l'est pas.
    expect(tarifs).toMatch(/setError\(e\?\.message/);
    expect(card).toContain('role="alert"');
  });

  it("propose l'inscription à un visiteur sans compte", () => {
    // Sans compte, il n'y a rien à facturer.
    expect(tarifs).toMatch(/if\s*\(!token\)\s*\{[\s\S]{0,80}navigate\('\/register'\)/);
  });

  it("affiche un état plutôt qu'un bouton pour une offre non configurée", () => {
    expect(card).toContain('unavailable');
    expect(card).toMatch(/Indisponible/);
  });

  it("n'affiche pas de bouton d'achat à un abonné", () => {
    expect(tarifs).toMatch(/onSubscribe=\{isPremium \? undefined : handleSubscribe\}/);
  });
});

describe('aucun secret dans le bundle', () => {
  it.each([
    ['Tarifs.jsx', tarifs],
    ['AbonnementRetour.jsx', retour],
    ['PricingCard.jsx', card],
  ])('%s ne contient ni clé ni tarif du prestataire', (_name, source) => {
    expect(source).not.toMatch(/sk_(test|live)_/);
    expect(source).not.toMatch(/whsec_/);
    expect(source).not.toMatch(/price_[a-zA-Z0-9]{6}/);
  });
});
