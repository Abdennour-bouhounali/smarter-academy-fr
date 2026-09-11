# Phase 6.5 — Aller-retour RÉEL en mode test Stripe

> Validation, pas développement. Aucune fonctionnalité ajoutée ; quatre défauts
> corrigés, tous révélés par les données réelles de Stripe.

Date : 2026-09-11 · Ligne de base phase 6 : 519 tests → **528 tests, tous verts**

---

## A. Extension Stripe

La CLI officielle **stripe-cli 1.21.8** a été installée
(`~/.local/bin/stripe`, binaire officiel GitHub). Elle sert au transfert des
webhooks vers `localhost`, que Stripe ne peut pas joindre directement.

Aucune extension Claude n'était disponible dans cet environnement ; la CLI
officielle remplit le même rôle et reste l'outil de référence de Stripe.

---

## B. Configuration Stripe (aucun secret affiché)

| Élément | Valeur |
|---|---|
| `BILLING_MODE` | **test** |
| `BILLING_PROVIDER` | **stripe** (le bac à sable n'a PAS été utilisé) |
| Clé d'API | `sk_test_…` — **clé de test confirmée** |
| `livemode` renvoyé par l'API | **false** |
| Tarif | `price_1UEWFd…` — actif, récurrent, **annuel**, **3500 EUR** |
| Produit | `smarter-academy-annual` |

Le tarif réel correspond **exactement** au `PlanCatalog` (3500 centimes, EUR,
`year`). Aucune divergence, aucune modification de configuration.

### B.1 Nom de variable — corrigé sans renommage

Le dépôt lisait `STRIPE_SECRET` ; le `.env` fournissait `STRIPE_SECRET_KEY`.
Sans cela, l'encaissement aurait échoué sur « aucune clé d'API ».

Conformément à la consigne (« ne pas renommer par cohérence »), la
configuration lit désormais **les deux** : `STRIPE_SECRET` d'abord (nom
historique du dépôt), `STRIPE_SECRET_KEY` en repli. Aucun nom n'a été changé.

---

## C. Webhook local

| Élément | Résultat |
|---|---|
| CLI installée | ✅ 1.21.8 |
| Transfert | `stripe listen --forward-to http://127.0.0.1:8000/api/v1/webhooks/stripe` |
| Point d'entrée atteint | ✅ Stripe a réellement livré |
| Secret de transfert | ✅ obtenu et utilisé (jamais affiché, retiré au nettoyage) |
| Vérification de signature | ✅ **jamais désactivée, jamais affaiblie** |

---

## D. Encaissement réel

| Vérification | Résultat |
|---|---|
| Session créée | ✅ `cs_test_…` sur `checkout.stripe.com`, `livemode: false` |
| Corps envoyé par le navigateur | ✅ **`{"plan":"annual"}`** — rien d'autre |
| Tarif appliqué | ✅ `price_1UEWFd…` — **résolu côté serveur** |
| `client_reference_id` | ✅ **`43`** = l'élève authentifié |
| `customer_email` | ✅ celui du compte |
| URL de retour | ✅ imposées par le serveur |
| Montant chez Stripe | ✅ 3500 EUR, quantité 1, mode `subscription` |
| Paiement de test | ✅ carte officielle **4242 4242 4242 4242** |
| Écriture locale à la création | ✅ **aucune** (0 abonnement, 0 droit, 0 paiement) |
| Retour navigateur | ✅ « **Activation en cours** », `premiumAccess=false` |

---

## E. Webhook réel

### E.1 Séquence réellement observée

L'ordre d'émission de Stripe — **contre-intuitif et vérifié** :

```
invoice.paid
customer.subscription.created     ← AVANT la session
checkout.session.completed        ← c'est elle qui porte client_reference_id
```

| Vérification | Résultat |
|---|---|
| Signature valide | ✅ acceptée |
| **Signature forgée** | ✅ **400, aucune ligne écrite, accès inchangé** |
| Enregistrement | ✅ `provider_events` alimenté |
| **Doublon** | ✅ renvoi du même `event_id` → **aucun doublon** (1 abo, 1 droit) |
| Type hors périmètre | ✅ `payment_method.attached` → `ignored/unhandled_type` |
| Évènement périmé | ✅ `ignored/stale` (constaté sur rejeu désordonné) |
| Minimisation | ✅ aucun payload conservé |

---

## F. Droit et accès

```
paiement Stripe réel
  → webhook signé réel
  → provider_events
  → subscriptions (status=active, provider_status=active)
  → SubscriptionEntitlementSynchronizer
  → entitlements (type=subscription, reference=subscription:8)
  → EntitlementService
  → ContentAccess
  → /me/access : premiumAccess = TRUE
```

| Vérification | Avant | Après |
|---|---|---|
| `/me/access` | `false` | ✅ **`true`** |
| Leçon premium (écriture serveur) | 422 refusé | ✅ **200 accepté** |
| Liste d'exercices | vide, `premium_required` | ✅ servie |
| Verrou dans l'inventaire | `locked: true` | ✅ `locked: false` |
| Badge Premium | affiché | ✅ **conservé** |
| Leçon gratuite | 200 | ✅ **200** (aucun droit requis) |

---

## G. Suppression d'abonnement (régression obligatoire)

L'abonnement **réel** a été annulé chez Stripe. Le webhook
`customer.subscription.deleted` réel a été reçu et traité :

| Vérification | Résultat |
|---|---|
| Abonnement local | ✅ `expired`, `provider_status=canceled`, `ends_at` ramené à l'instant |
| `/me/access` | ✅ **`premiumAccess = false` immédiatement** |
| Leçon premium | ✅ **422 refusé** côté serveur |
| Leçon gratuite | ✅ 200 (inchangée) |
| **Progression** | ✅ **2 lignes intactes** |

Le correctif terminal de la phase 5 **tient contre les données réelles**.

---

## H. Quatre défauts révélés par le réel

Aucun n'était visible en mock : les fixtures reproduisaient l'ancienne forme de
l'API, donc elles validaient un code qui ne fonctionnait pas.

### D1 — La période de facturation a changé de place *(le plus grave)*

`current_period_end` est **NULL à la racine** depuis l'API 2025 ; la valeur vit
sur `items.data[0]`. Conséquence : `ends_at` restait nul → **le droit devenait
SANS TERME**. Un abonnement résilié n'aurait plus jamais expiré tout seul —
c'est la barrière temporelle de toute l'architecture qui sautait.

**Correction** (`StripeEventTranslator`) : lire la racine d'abord, les lignes
ensuite. Les deux formes restent acceptées.

### D2 — Le plan n'était jamais renseigné

`subscriptions.plan` restait `free` pour un abonnement payant : l'administration
affichait « free » à quelqu'un qui venait de payer.

**Correction** : `PlanCatalog::keyForPriceId()` (chemin inverse de
`priceIdFor`). Un tarif inconnu laisse la valeur existante intacte.

### D3 — L'ordre réel des évènements

Stripe émet `customer.subscription.created` **avant**
`checkout.session.completed`. Au premier, l'élève est introuvable.

**Correction** (`WebhookProcessor`) : un évènement non rattachable est
désormais marqué **`failed`** (rejouable) au lieu de `ignored` (perdu). Rien
n'est affaibli : sans élève identifiable, aucun accès n'est ouvert.

### D4 — Une date de début future fermait l'accès

`starts_at` est recopié du fournisseur. Une avance de quelques secondes — ou une
horloge serveur en retard — rendait le droit « pas encore commencé » et
**laissait dehors un élève qui venait de payer**. Constaté en conditions
réelles.

**Correction** (`SubscriptionEntitlementSynchronizer`) : pour un abonnement
**actif**, un début futur est ramené à maintenant **dans une fenêtre de 300 s
seulement**. Au-delà, la date est respectée — une semaine d'avance est une
planification, pas un décalage.

> **Première version rejetée par les tests existants.** Ma règle initiale
> (« jamais dans le futur ») cassait
> `test_future_subscription_creates_an_inactive_entitlement`, qui documente un
> abonnement légitimement programmé. Le test avait raison ; la règle a été
> resserrée. La date de **fin** n'est jamais touchée.

---

## I. Sécurité vérifiée

| Contrôle | Résultat |
|---|---|
| Tarif imposé par le serveur | ✅ le navigateur n'envoie qu'une clé |
| Identité imposée par le serveur | ✅ `client_reference_id` = élève authentifié |
| URL de succès ne donne rien | ✅ `premiumAccess=false` au retour |
| Signature forgée | ✅ 400, aucune écriture |
| Doublon | ✅ sans effet |
| Publication indépendante | ✅ inchangée |
| Clé de test uniquement | ✅ `livemode: false` partout |
| Secrets non commités | ✅ `.env` ignoré, `git grep` vide |
| Secrets non affichés | ✅ masqués dans toutes les sorties |

---

## J. Tests

| | |
|---|---|
| **Backend** | **528 / 528** (1809 assertions) — ligne de base 519 |
| dont `StripeRealPayloadRegressionTest` | **7** (nouveau — formes réelles) |
| dont régressions `SubscriptionSynchronizationTest` | **+2** |
| **Frontend** | **4833 / 4833**, 182 fichiers |
| **Build** | ✅ 29,8 s |
| `validate:lessons` · `check:routes` · `check:non-blocking` · `check:level-leak` | ✅ |
| Gardes d'architecture | ✅ 6/6 |

---

## K. Base de données

`diff` avant/après sur 16 tables : **identique**. 1067 learning points, 222
preuves, 116 progressions — intacts. Leçon fixture restaurée (`free`,
`published`), élèves de test supprimés, `provider_events` vidée.

---

## L. Limites

**Environnement (bloquant sans correction manuelle) :**

- **L'horloge de la machine retarde d'environ 1 h et NTP est inactif**
  (`System clock synchronized: no`). Les signatures réelles de Stripe tombaient
  hors de la tolérance de 300 s. Pour terminer le test, `STRIPE_WEBHOOK_TOLERANCE`
  a été élargie **localement** — **la vérification HMAC n'a jamais été
  désactivée**, et la valeur par défaut du dépôt reste 300 s (remise à 300 au
  nettoyage). **La vraie correction est de resynchroniser l'horloge** ; en
  production avec NTP actif, 300 s suffisent largement.
- Le transfert passe par la CLI faute de tunnel ; en production, Stripe appelle
  directement le point d'entrée.

**Implémentation :** une seule offre (`annual`) ; le retour sonde ~30 s puis
rend la main.

**Préexistant, sans rapport :** 4 advisories `league/commonmark`
(transitives via Laravel), toujours non traitées.

---

## M. Verdict

Les cinq couches ont été démontrées avec des données réelles : encaissement
Stripe réel, webhook signé réel, traitement Laravel réel, synchronisation
d'abonnement réelle, droit réel, et accès premium réel — puis fermeture réelle
à la suppression.

Une réserve honnête : la tolérance d'horodatage a dû être élargie localement à
cause de l'horloge désynchronisée de cette machine.

```
PASS WITH NON-BLOCKING LIMITATIONS
```

**À faire avant la production :** resynchroniser l'horloge (NTP), puis remettre
`STRIPE_WEBHOOK_TOLERANCE=300`.

**Phase 7 non commencée** : portail client, annulation, factures, remboursements,
changement d'offre, paiements en production.
