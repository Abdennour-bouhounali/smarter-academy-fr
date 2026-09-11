# Phase 5 — Fondation du fournisseur de paiement : rapport de livraison

> **Aucun encaissement n'est implémenté.** Pas de session de paiement, pas de
> formulaire, pas de portail client, pas d'interface de facturation. Ce qui est
> livré, c'est la **réception** de l'état d'un fournisseur et sa traduction en
> droits d'accès — l'inverse du flux d'argent, qui viendra en phase 6.

Date : 2026-09-11 · Ligne de base : 484 tests → **490 tests, tous verts**

---

## 1. Ce qui a été implémenté

### 1.1 Migrations (4, toutes additives)

| Fichier | Contenu |
|---|---|
| `2026_09_17_000001_add_provider_fields_to_subscriptions_table.php` | `provider_customer_id`, `provider_status`, `provider_price_id`, `current_period_end`, `cancel_at_period_end`, `provider_synced_at` + `unique(provider, external_reference)` + `index(provider_customer_id)` |
| `2026_09_17_000002_add_provider_fields_to_payments_table.php` | `provider_invoice_id`, `failure_code` + `unique(provider, external_reference)` |
| `2026_09_17_000003_create_provider_events_table.php` | table d'idempotence + `unique(provider, event_id)`, `index(status, received_at)`, `index(provider_object_id)` |
| `2026_09_17_000004_unique_entitlement_reference.php` | `unique(type, reference)` sur `entitlements` |

La migration d'unicité **refuse de s'exécuter** si des doublons préexistent, avec
la liste exacte des lignes fautives. Elle n'en fusionne ni n'en supprime aucune :
arbitrer entre deux droits est une décision humaine.

### 1.2 Couche de facturation — `app/Domain/Billing/`

```
PaymentProvider.php                  interface : name / verifySignature / translate
ProviderSubscriptionState.php        DTO neutre — aucun type de SDK
ProviderPaymentState.php             DTO neutre
TranslatedEvent.php                  enveloppe : identité + horodatage + charge utile
ProviderSubscriptionAdapter.php      état fournisseur → `subscriptions` → synchroniseur
WebhookEventRecorder.php             le verrou d'idempotence (INSERT, pas SELECT)
WebhookProcessor.php                 l'ordre de traitement
PaymentProviderRegistry.php          liste blanche des fournisseurs
ProviderEventFormatException.php
Stripe/StripePaymentProvider.php     ← le SEUL fichier qui importe le SDK
Stripe/StripeEventTranslator.php     ← champs Stripe → types neutres
```

### 1.3 Modèles, contrôleurs, routes

- `app/Models/ProviderEvent.php` (nouveau) ; `Subscription` et `Payment` étendus.
- `app/Http/Controllers/ProviderWebhookController.php` (nouveau).
- `app/Http/Controllers/Admin/AdminProviderEventController.php` (nouveau).
- `app/Domain/Admin/ProviderEventAdminService.php` (nouveau).
- `ActivityLogger::PROVIDER_EVENT_REPLAYED` (nouvelle constante).
- Routes : `POST /v1/webhooks/{provider}` (publique, signée) ;
  `GET /v1/admin/provider-events`, `GET …/{id}`, `POST …/{id}/replay`.
- `config/services.php` : bloc `stripe` (secrets d'environnement uniquement).
- `composer require stripe/stripe-php` → `^21.3`.

### 1.4 Frontend

- `apps/web/src/pages/student/Profil.jsx` — consomme enfin l'état d'accès réel.
- `apps/web/src/components/pricing/PricingCard.jsx` — prop `owned`.
- `apps/web/src/pages/Tarifs.jsx` — marque l'offre que l'élève possède déjà.

### 1.5 Ce qui n'a PAS été touché

`ContentAccess`, `EntitlementService`, `AccessTier`, `AccessDecision`,
`SubscriptionEntitlementSynchronizer`, `Entitlement` — **aucune ligne modifiée**.
C'était la promesse de l'audit, et elle est tenue : la couche d'accès ignore
jusqu'à l'existence du fournisseur.

---

## 2. Architecture finale

```
Stripe
   ↓ webhook signé (corps BRUT)
StripePaymentProvider          vérifie la signature — sinon RIEN n'est écrit
   ↓
StripeEventTranslator          champs Stripe → types neutres
   ↓ TranslatedEvent
WebhookEventRecorder           INSERT → violation d'unicité = déjà vu, on s'arrête
   ↓
ProviderSubscriptionAdapter    périmé ? → ignoré. Sinon : statut fournisseur → statut LOCAL
   ↓
subscriptions                  notre vocabulaire, notre autorité
   ↓
SubscriptionEntitlementSynchronizer      ← INCHANGÉ, la porte unique
   ↓
entitlements (type=subscription)
   ↓
EntitlementService → ContentAccess → l'élève
```

L'invariant, tenu par un test qui échoue si on le viole :

```
STRIPE → LOCAL SUBSCRIPTION → ENTITLEMENT → CONTENT ACCESS     ✅
STRIPE → CONTENT ACCESS                                        ❌ impossible
```

### 2.1 Correspondance des états (vérifiée par 19 tests)

| Stripe | local | droit |
|---|---|---|
| `incomplete` | `pending` | aucun |
| `incomplete_expired` | `expired` | aucun |
| `trialing` | `active` | jusqu'à `ends_at` |
| `active` | `active` | actif |
| `past_due` | `active` | **maintenu jusqu'au terme payé** |
| `unpaid` | `expired` | révoqué |
| `active` + `cancel_at_period_end` | `cancelled` | jusqu'à `ends_at` |
| `canceled` (période restante) | `cancelled` | jusqu'à `ends_at` |
| `canceled` / supprimé | `expired` | révoqué **immédiatement** |
| statut inconnu | `pending` | aucun (le défaut ferme) |

**`past_due` — la règle a été vérifiée, pas inventée.** L'audit la déduisait de
deux règles préexistantes : la couche d'accès ne lit jamais `payments`, et
`ends_at` est recopié dans le droit. L'implémentation a **confirmé** cette
cohérence — aucune contradiction n'est apparue. L'élève garde ce qu'il a payé, et
l'accès se ferme tout seul au terme, sans qu'aucune tâche n'ait à passer
(`test_past_due_access_closes_by_itself_at_the_end_of_the_paid_period`).

---

## 3. Sécurité — protections implémentées

| Menace | Protection | Vérifié par |
|---|---|---|
| Faux webhook | signature HMAC sur le corps brut, **avant toute écriture** | `test_an_invalid_signature_writes_absolutely_nothing` |
| Secret absent | `verifySignature` renvoie **faux** — le défaut ferme | `test_a_missing_secret_refuses_every_webhook` |
| Rejeu d'un corps intercepté | tolérance d'horodatage (300 s) | `test_a_valid_but_old_signature_is_refused` |
| Livraison dupliquée | `unique(provider, event_id)` **en base** | `test_the_same_event_delivered_twice_changes_nothing` |
| Corps altéré | la signature ne valide plus | `test_a_modified_body_is_rejected` |
| **Évènement périmé** | `occurred_at` vs `provider_synced_at` | `test_a_stale_event_never_reopens_a_revoked_access` |
| Élève déclare un paiement | **aucune route n'existe** (404/405) | `test_a_student_cannot_declare_a_payment_successful` |
| Élève crée un droit | `/me/access` est en lecture seule | `test_the_access_summary_is_read_only` |
| Élève force un `client_reference_id` | résolution serveur, numérique strict | `test_a_client_reference_is_never_trusted_blindly` |
| IDOR | `/me/access` ne lit que son appelant | `test_the_access_summary_only_ever_describes_its_own_caller` |
| Fuite de référence | aucun identifiant fournisseur côté élève | `test_the_access_summary_never_exposes_provider_references` |
| Admin fabrique un abonnement | structurellement impossible | `test_an_admin_cannot_fabricate_a_subscription_entitlement` |
| Publication contournée | `ContentAccess` compose toujours les deux | `test_publication_still_wins_over_a_valid_subscription` |
| Panne du fournisseur | aucun appel dans le chemin d'autorisation | `test_content_authorization_never_depends_on_the_provider` |
| Fuite de secret | environnement uniquement, jamais en base ni en réponse | revue + `ActivityLogger::REDACTED_KEYS` |

**La règle qui domine :** l'accès premium ne dérive **que** d'un
`entitlement` valide. Ni d'un retour de paiement, ni d'une ligne `payments`, ni
d'un `provider_customer_id`, ni d'une affirmation du frontend.

---

## 4. Tests

| Suite | Résultat |
|---|---|
| **Backend total** | **490 tests / 1652 assertions — 100 % verts** (ligne de base : 484) |
| dont `ProviderWebhookIdempotencyTest` | 16 (faux fournisseur, sans SDK ni réseau) |
| dont `ProviderSubscriptionLifecycleTest` | 19 |
| dont `StripeAdapterTest` | 18 (dont signature HMAC réelle) |
| dont `BillingSecurityTest` | 12 |
| dont `AdminProviderObservabilityTest` | 11 |
| dont `BillingPerformanceTest` | 5 |
| dont `PaymentProviderBoundaryTest` | **4 — la garde d'architecture** |
| **Frontend** | **4807 tests / 180 fichiers — 100 % verts** |
| **Build** | ✅ `vite build` en 27,9 s |
| **`validate:lessons`** | ✅ passe |
| **`check:routes`** | ✅ 132 leçons branchées |
| **`check:non-blocking`** | ✅ |
| **`check:level-leak`** | ✅ |
| **Navigateur E2E** | ✅ **17/17** |

### 4.1 La garde d'architecture

```php
// tests/Feature/PaymentProviderBoundaryTest.php
Domain/Access/*  ne contient jamais : Domain\Billing · Stripe · PaymentProvider
                                     · ProviderEvent · webhook · Payment::
Domain/Billing/* n'écrit jamais :     Entitlement::create / updateOrCreate
use Stripe\      n'existe que dans :  Domain/Billing/Stripe/
```

184 assertions sur l'ensemble des fichiers. Sans elle, la frontière se perd au
troisième correctif urgent.

---

## 5. Base de données — avant / après

Relevé **avant** toute modification, puis **après** implémentation et nettoyage :

| Table | Avant | Après |
|---|---|---|
| `users` | 10 | **10** |
| `lessons` | 133 | **133** |
| `lesson_modules` | 1082 | **1082** |
| `practice_exercises` | 15 | **15** |
| `learning_points` | 1067 | **1067** |
| `learning_evidence` | 222 | **222** |
| `student_lesson_progress` | 116 | **116** |
| `student_learning_point_progress` | 145 | **145** |
| `exercise_attempts` | 21 | **21** |
| `question_attempts` | 102 | **102** |
| `lesson_final_test_attempts` | 15 | **15** |
| `student_reports` | 1 | **1** |
| `subscriptions` · `payments` · `entitlements` | 0 · 0 · 0 | **0 · 0 · 0** |

`diff` sur les deux relevés : **identiques**. Aucune donnée d'apprentissage n'a
été modifiée. La leçon fixture `fonction-affine-2nde` a été remise dans son état
d'origine (`tier=free`, `publication=published`), et l'élève de test supprimé
avec toute sa trace. Le secret de webhook de test a été retiré du `.env`.

---

## 6. Navigateur — E2E (17/17)

Harnais : `apps/web/e2e/_phase5-billing.mjs`, pilotant de **vrais webhooks
signés** contre le serveur de développement.

| Scénario | Résultat |
|---|---|
| **Gratuit** — leçon premium visible, badge `Premium`, lien `/tarifs` | ✅ |
| **Gratuit** — Profil : « Compte gratuit » + « Passer Premium » | ✅ |
| **Gratuit** — Tarifs : offre gratuite marquée « Ton offre actuelle » | ✅ |
| **Abonné** — webhooks acceptés (200) | ✅ |
| **Abonné** — leçon ouverte, **badge Premium conservé** | ✅ |
| **Abonné** — Profil : « Abonnement actif », plus de « Passer Premium » | ✅ |
| **Abonné** — la leçon s'ouvre réellement | ✅ |
| **Expiration** — leçon reverrouillée | ✅ |
| **Mobile 390 px** — profil / tarifs / cours : 0 px de débordement | ✅ |
| **Console** — aucune erreur inattendue | ✅ |

Vérifié en plus, hors harnais (par API) : résiliation programmée (accès maintenu
jusqu'au terme), échec de paiement (accès inchangé), réactivation (**le même**
droit rouvert, pas un second), dérogation admin (accès indépendant de
l'abonnement), publication (fermée **malgré** un droit valide), progression
(intacte après révocation).

---

## 7. Un défaut trouvé au navigateur, et corrigé

Les tests unitaires étaient verts ; c'est la vérification au navigateur qui a
révélé le problème.

**Le symptôme.** Après `customer.subscription.deleted`, l'élève gardait
`premiumAccess=true`.

**La cause.** Un abonnement supprimé transporte souvent encore sa fin de période
d'origine. `localStatusFor()` voyait une date future et concluait « résilié, avec
du temps restant » → `cancelled`, donc accès maintenu. L'abonnement n'existait
plus chez le fournisseur, mais l'accès survivait jusqu'à la fin de la période
initialement payée — potentiellement **un mois**.

**Le correctif.** Un drapeau `deleted` sur `ProviderSubscriptionState`, positionné
par le traducteur, qui rend la suppression **terminale** dans l'adaptateur.
Verrouillé par `test_a_deleted_subscription_closes_immediately_even_with_a_future_period`
et reverifié au navigateur (`premiumAccess` passe à `false` immédiatement).

C'est exactement le genre de défaut qu'une suite verte ne trouve pas : chaque
pièce se comportait comme spécifié, et c'est leur composition sur une donnée
réelle qui était fausse.

---

## 8. Limites actuelles (phase 5) et ce qui relève de la phase 6

### 8.1 Limites assumées

1. **Le rejeu d'administration ne re-traduit pas un corps d'évènement.** Le corps
   n'est pas conservé (minimisation des données). Rejouer repasse l'**abonnement
   local** par le synchroniseur — ce qui satisfait les exigences demandées (part
   de l'évènement existant, ne fabrique rien, idempotent, même chaîne), mais ne
   peut pas réparer un évènement **jamais reçu**. Pour ce cas : redemander la
   livraison au fournisseur, ou `php artisan smarter:sync-entitlements`.
   *C'est un écart conscient par rapport à la lettre du plan d'audit.*
2. **L'état d'accès est lu au montage de l'application.** Un abonnement activé
   pendant que l'élève a la page ouverte n'apparaît qu'au rechargement. Politique
   délibérée (le serveur reste l'autorité et refuse toute écriture non autorisée) ;
   la phase 6 ajoutera un sondage après retour de paiement.
3. **Traitement synchrone.** Pas de file d'attente : un webhook est traité dans sa
   requête. Suffisant au volume actuel ; `app/Jobs` n'existe toujours pas.
4. **Un seul fournisseur enregistré.** Le registre en accepte plusieurs, mais seul
   Stripe est branché.
5. **Aucun appel sortant vers Stripe.** Le SDK ne sert qu'à vérifier des
   signatures. Aucune clé API n'est utilisée pour l'instant.
6. **Advisories `league/commonmark`** (4, sévérité haute) signalées par
   `composer audit` : **préexistantes**, transitives via Laravel, sans rapport avec
   Stripe ni avec cette phase. Non traitées ici — à planifier séparément.

### 8.2 Phase 6 — encaissement (non implémenté)

Session de paiement, redirection, page de retour avec sondage de `/me/access`,
portail client, factures, remises, remboursements. Le `client_reference_id` est
déjà lu par l'adaptateur : la phase 6 n'aura qu'à le **poser** côté serveur.

---

## 9. Critères d'acceptation

| Critère | État |
|---|---|
| champs fournisseur | ✅ |
| stockage des évènements | ✅ |
| idempotence **garantie par la base** | ✅ |
| unicité de `entitlements.reference` | ✅ |
| frontière neutre au fournisseur | ✅ |
| Stripe isolé dans `Domain/Billing/Stripe/` | ✅ |
| Access n'importe jamais Billing | ✅ (garde automatisée) |
| un webhook invalide n'écrit rien | ✅ |
| un doublon est inoffensif | ✅ |
| un évènement périmé ne rouvre rien | ✅ |
| cycle de vie correctement traduit | ✅ |
| les paiements restent informatifs | ✅ |
| les droits restent l'unique autorité | ✅ |
| l'admin ne peut pas fabriquer d'abonnement | ✅ |
| `/me/access` consommé par l'UI élève | ✅ |
| comportement premium/gratuit préexistant intact | ✅ (490 verts) |
| données d'apprentissage intactes | ✅ (diff identique) |
| tous les tests passent | ✅ |
| E2E navigateur | ✅ 17/17 |
| **aucun encaissement implémenté** | ✅ |

---

## ➡️ Prochaine étape

> **PHASE 6 — ENCAISSEMENT (CHECKOUT)**

Non commencée. Aucune partie de l'encaissement n'est implémentée.
