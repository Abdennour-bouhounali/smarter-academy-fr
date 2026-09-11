# Phase 6 — Encaissement Stripe : rapport de livraison

> **Mode TEST uniquement.** Aucun paiement réel n'a été effectué, aucune clé de
> production n'est configurée, `BILLING_MODE=test`. Le parcours a été éprouvé au
> navigateur avec un prestataire de bac à sable local — sans réseau, sans euro.

Date : 2026-09-11 · Ligne de base phase 5 : 490 tests → **519 tests, tous verts**

---

## A. Ce qui a été implémenté

### A.1 Configuration (nouveau)

| Fichier | Rôle |
|---|---|
| `config/billing.php` | **LE** catalogue serveur : offres, tarifs, mode, URL de retour |

Les identifiants de tarif Stripe viennent de l'environnement
(`STRIPE_PRICE_ANNUAL`), jamais du code : ils diffèrent entre test et
production, et une valeur écrite en dur finirait par être la mauvaise dans l'un
des deux.

### A.2 Couche de facturation (`app/Domain/Billing/`)

| Fichier | État |
|---|---|
| `PlanCatalog.php` | **nouveau** — l'autorité serveur sur « combien ça coûte » |
| `CheckoutService.php` | **nouveau** — ouvre une session, refuse un double achat |
| `CheckoutSession.php` | **nouveau** — DTO neutre (id + URL) |
| `CheckoutFailedException.php` | **nouveau** |
| `SandboxPaymentProvider.php` | **nouveau** — bac à sable, `local`/`testing` seulement |
| `PaymentProvider.php` | **étendu** d'une méthode : `createCheckoutSession` |
| `Stripe/StripePaymentProvider.php` | **étendu** — implémente l'ouverture de session |

### A.3 HTTP

- `app/Http/Controllers/BillingCheckoutController.php` (nouveau)
- `GET /v1/billing/plans` — offres + état de l'élève + mode
- `POST /v1/billing/checkout` — ouvre une session (`throttle:10,1`)

### A.4 Frontend

| Fichier | État |
|---|---|
| `src/services/billingService.js` | **nouveau** |
| `src/pages/AbonnementRetour.jsx` | **nouveau** — page de retour |
| `src/pages/Tarifs.jsx` | **modifié** — pilote l'achat |
| `src/components/pricing/PricingCard.jsx` | **modifié** — états d'achat |
| `src/App.jsx` | **modifié** — route `/abonnement/retour` |

### A.5 Migrations

**Aucune.** Le schéma de la phase 5 suffisait : `provider_customer_id` existait
déjà et sert à réutiliser le client, `subscriptions.plan` accueille la clé
d'offre. Ajouter une table de « sessions » aurait dupliqué une information que
le prestataire détient déjà.

### A.6 Non modifié

`ContentAccess`, `EntitlementService`, `AccessTier`, `AccessDecision`,
`SubscriptionEntitlementSynchronizer`, `ProviderSubscriptionAdapter`,
`WebhookProcessor`, `WebhookEventRecorder` — **pas une ligne**.

---

## B. Le parcours réel

```
Élève → /tarifs
   ↓ clic « S'abonner » (bouton désarmé pendant l'appel)
POST /v1/billing/checkout   { plan: "annual" }      ← une CLÉ, rien d'autre
   ↓
CheckoutService     l'offre est-elle vendable ? l'élève peut-il acheter ?
   ↓
PlanCatalog         clé interne → price_xxx   (configuration SERVEUR)
   ↓
StripePaymentProvider::createCheckoutSession
                    client_reference_id = id de l'élève AUTHENTIFIÉ
   ↓
Stripe Checkout (page hébergée — aucune carte n'atteint notre domaine)
   ↓ l'élève paie
Stripe crée l'abonnement
   ↓ webhook SIGNÉ
provider_events → WebhookProcessor → ProviderSubscriptionAdapter
   ↓
subscriptions (statut local)
   ↓
SubscriptionEntitlementSynchronizer          ← INCHANGÉ
   ↓
entitlements (type = subscription)
   ↓
EntitlementService → ContentAccess → contenu premium publié
```

Retour navigateur → `/abonnement/retour` → **interroge `/me/access`**.
Cette page n'accorde rien : elle affiche ce que le serveur répond.

---

## C. Sécurité — contrôles vérifiés

| Menace | Défense | Test |
|---|---|---|
| Visiteur non connecté | route authentifiée | `test_a_guest_cannot_open_a_checkout` |
| Compte suspendu | `account.active` | `test_a_suspended_account_cannot_open_a_checkout` |
| **Tarif falsifié** | `price_id` n'est pas un champ lu | `test_a_client_cannot_submit_its_own_price_id` |
| **Montant / devise falsifiés** | jamais transmis au prestataire | `test_a_client_cannot_tamper_with_amount_or_currency` |
| **Achat au nom d'autrui** | l'élève vient du JETON | `test_a_client_cannot_open_a_checkout_for_another_user` |
| Offre inconnue | liste blanche du catalogue | `test_an_unknown_plan_is_refused` |
| Offre retirée / non configurée | refus 422 | 2 tests |
| **Injection de droit** | le checkout n'écrit aucun droit | `test_a_checkout_never_creates_an_entitlement_whatever_the_client_sends` |
| **Injection d'abonnement** | le checkout n'écrit aucun abonnement | idem + garde d'architecture |
| **URL de succès manipulée** | la page interroge le serveur | E2E §5 |
| Double achat | état vérifié avant appel | 2 tests |
| **Double clic** | bouton désarmé + clé d'idempotence | 2 tests |
| Session d'autrui réutilisée | la clé inclut l'id de l'élève | `test_two_students_never_share_an_idempotency_key` |
| Dérogation admin altérée | jamais touchée | `test_a_checkout_never_modifies_an_admin_override` |
| Fuite de message prestataire | message neutre rendu | `test_a_provider_failure_is_reported_without_leaking_its_message` |
| Fuite d'identifiant de tarif | jamais dans la réponse | `test_the_plan_list_never_exposes_provider_price_ids` |
| Fuite de secret côté bundle | test de source | `billingService.test.js` |
| Webhook falsifié | signature (phase 5) | inchangé |

**La règle inchangée :** l'accès premium ne dérive que d'un `entitlement` valide.

---

## D. Tests

| | |
|---|---|
| **Backend** | **519 / 519** (1790 assertions) — ligne de base 490 |
| dont `CheckoutFlowTest` | **27** (nouveau) |
| dont `PaymentProviderBoundaryTest` | **6** (4 → 6 : +checkout) |
| **Frontend** | **4833 / 4833**, 182 fichiers — ligne de base 4807 |
| dont `billingService.test.js` | **10** (nouveau) |
| dont `checkoutContract.test.js` | **16** (nouveau) |
| **Build** | ✅ 29,3 s |
| **`validate:lessons`** | ✅ |
| **`check:routes`** | ✅ 132 leçons |
| **`check:non-blocking`** | ✅ |
| **`check:level-leak`** | ✅ |
| **Navigateur E2E** | ✅ **25 / 25** |

### D.1 Gardes d'architecture (6)

```
Domain/Access/*   ne mentionne jamais : Billing · Stripe · PaymentProvider
                                        · ProviderEvent · webhook · Checkout
                                        · PlanCatalog · Payment::
Domain/Billing/*  n'écrit jamais :      Entitlement::create
CheckoutService   n'écrit jamais :      Subscription::create · Entitlement::create · ->save()
Contrôleur        ne lit jamais :       price_id · amount · currency · user_id
use Stripe\       n'existe que dans :   Domain/Billing/Stripe/
```

---

## E. Base de données

`diff` avant/après sur 16 tables : **identique**.

| Table | Avant | Après |
|---|---|---|
| users · lessons · lesson_modules | 10 · 133 · 1082 | **identiques** |
| learning_points · learning_evidence | 1067 · 222 | **identiques** |
| student_lesson_progress · …_point_progress | 116 · 145 | **identiques** |
| exercise_attempts · question_attempts | 21 · 102 | **identiques** |
| lesson_final_test_attempts · student_reports | 15 · 1 | **identiques** |
| subscriptions · payments · entitlements · provider_events | 0 | **0** |

Aucune migration. Fixture `fonction-affine-2nde` restaurée (`free`/`published`),
élève de test supprimé, secrets de test retirés du `.env`.

---

## F. Stripe

**MODE TEST.** `BILLING_MODE=test`, aucune clé de production, aucun paiement réel.

Ce qui a été vérifié :

- le SDK est bien appelé via `StripeClient::checkout->sessions->create` ;
- sans clé d'API, l'appel **refuse proprement** (`CheckoutFailedException`) au
  lieu de partir sans identité — vérifié en conditions réelles ;
- le parcours navigateur complet a tourné contre `SandboxPaymentProvider`, qui
  n'est enregistré que dans `local`/`testing` et dont **toutes** les signatures
  de webhook sont refusées : il ne peut pas servir de porte dérobée.

Ce qui n'a **pas** été vérifié : un aller-retour contre les serveurs de test de
Stripe (aucune clé `sk_test_` disponible dans cet environnement). Le passage en
test réel demande de renseigner `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` et
`STRIPE_PRICE_ANNUAL`, puis de repasser `BILLING_PROVIDER=stripe`.

---

## G. Limites connues

1. **Pas d'aller-retour Stripe réel.** Voir §F. La configuration est en place ;
   la validation contre l'API de test reste à faire avec une vraie clé.
2. **Une seule offre** (`annual`, 35 €/an). Le catalogue en accepte plusieurs ;
   le modèle commercial existant n'en a qu'une.
3. **Le retour n'attend que ~30 s** (5 tentatives croissantes) puis rend la main
   avec un bouton « Vérifier à nouveau ». Un webhook très retardé demande une
   action manuelle de l'élève — délibéré : sonder sans fin ferait porter un
   trafic permanent à chaque onglet ouvert.
4. **Un abonnement résilié encore actif bloque un rachat** jusqu'à l'échéance.
   Décision assumée (ne pas faire payer deux fois les mêmes jours) ; à rouvrir
   si le commerce veut permettre un réabonnement anticipé.
5. **`pending` ne bloque pas un nouvel achat.** Une session abandonnée ne doit
   pas enfermer l'élève dehors ; l'idempotence couvre les doublons rapprochés.
6. **Advisories `league/commonmark`** (4, hautes) : préexistantes, transitives
   via Laravel, sans rapport avec cette phase. Toujours non traitées.

---

## H. Frontière de phase

```
PHASE 6 CHECKOUT COMPLETE
```

**Non implémenté, et hors périmètre (phase 7+) :**

- paiements en production (bascule `live`)
- déploiement du webhook en production
- portail client / gestion d'abonnement
- interface de factures, avoirs, remboursements
- annulation depuis l'application
- changement d'offre (montée/descente en gamme)
- gestion des moyens de paiement
- codes promotionnels, parrainage
- travaux de réconciliation comptable
- accès livre, établissement, bons d'achat

**Pour passer en test réel Stripe :** renseigner les trois variables
d'environnement, `BILLING_PROVIDER=stripe`, créer le tarif dans le tableau de
bord Stripe en mode test, et déclarer l'URL de webhook.
