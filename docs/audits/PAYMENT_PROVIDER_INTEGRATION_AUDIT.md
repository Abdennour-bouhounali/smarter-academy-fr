# Phase 5 — Audit d'architecture : intégration d'un fournisseur de paiement

> **⚠️ CE DOCUMENT EST L'AUDIT D'ORIGINE (2026-09-11, avant implémentation).**
>
> La phase 5 a depuis été **implémentée**. Ce fichier est conservé tel quel comme
> trace de la décision ; il n'est plus la description du code.
>
> **Pour l'état réel, voir `docs/reports/PAYMENT_PROVIDER_PHASE5_REPORT.md`.**
>
> Deux écarts entre ce plan et ce qui a été livré, tous deux documentés dans le
> rapport : le REJEU d'administration ne re-traduit pas un corps d'évènement
> (non conservé — minimisation) mais repasse l'abonnement par le synchroniseur ;
> et un drapeau `deleted` a dû être ajouté à l'état neutre après qu'un défaut
> trouvé AU NAVIGATEUR a montré qu'une suppression portant une fin de période
> future laissait l'accès ouvert.

Date : 2026-09-11 · Périmètre : `apps/api` (Laravel 13), `apps/web` (React), `packages/core`

---

## A. Architecture actuelle — ce qui existe vraiment

### A.1 La chaîne d'accès, telle qu'elle est codée

```
Authentification            auth:sanctum
        ↓
Compte actif                middleware account.active + User::hasActiveAccount()
        ↓
ContentAccess               app/Domain/Access/ContentAccess.php      ← le SEUL compositeur
        ↓
EntitlementService          app/Domain/Access/EntitlementService.php ← l'autorité du droit
        ↓
Palier leçon / exercice     AccessTier::effective()
        ↓
Publication                 Lesson/LessonModule/PracticeExercise::isVisibleToStudents()
        ↓
Déverrouillage séquentiel   packages/core/lessonAccess.js
```

L'invariant central est tenu et testé : **droit et publication ne se remplacent
jamais l'un l'autre.**

```
droit valide  + leçon masquée  = REFUS
leçon publiée + aucun droit    = REFUS
```

### A.2 Vérification exécutée

```
DB_DATABASE=smart_academy_test php artisan test \
  --filter='Entitlement|Subscription|ContentTier|ExercisePremium|ContentAccess|PublicationAccess'

→ 133 tests, 302 assertions, 0 échec (52 s)
```

Ce résultat est la ligne de base. Toute phase 5 doit le laisser vert.

### A.3 Le vocabulaire existant

| Table | Statuts | Écrit par |
|---|---|---|
| `subscriptions.status` | `free` · `pending` · `active` · `cancelled` · `expired` | **personne aujourd'hui** |
| `payments.status` | `pending` · `succeeded` · `failed` · `refunded` | **personne aujourd'hui** |
| `entitlements.type` | `subscription` · `admin_override` | synchroniseur / admin |
| `entitlements.status` | `active` · `revoked` | synchroniseur / admin |
| `lessons.tier` | `free` · `premium` (défaut `free`) | admin (`PATCH /content/lesson/{id}/tier`) |
| `practice_exercises.tier` | `free` · `premium` · **`null` = hérite** | admin |

### A.4 Schéma actuel — relevé exact

**`subscriptions`** (`2026_09_13_000007`)
`id` · `user_id` (FK cascade) · `plan` (défaut `free`) · `status` (défaut `free`)
· `started_at` · `ends_at` · `cancelled_at` · `provider` (nullable) ·
`external_reference` (nullable) · timestamps.
Index : `(user_id, status)`, `status`, `ends_at`. **Aucune contrainte d'unicité.**

**`payments`** (`2026_09_13_000008`)
`id` · `user_id` · `subscription_id` (nullOnDelete) · `amount_cents` (entier) ·
`currency` (3) · `status` · `provider` · `external_reference` · `paid_at` ·
timestamps. Index : `(user_id, status)`, `paid_at`. **Aucune contrainte d'unicité.**
Aucune colonne ne peut accueillir une donnée de carte — c'est délibéré et il faut
que cela le reste.

**`entitlements`** (`2026_09_15_000001`)
`id` · `user_id` · `type` · `status` · `starts_at` · `expires_at` · `source` ·
`reference` · `granted_by` · `revoked_at` · `revoked_by` · `reason` · timestamps.
Index : `(user_id, status, type)`, `expires_at`. **`reference` n'est pas unique.**

### A.5 Ce que le fournisseur n'a PAS à refaire

Ces décisions sont déjà prises, codées et testées. Phase 5 s'y branche sans les
rouvrir :

- Le gratuit est une **règle**, pas une ligne. Aucun `entitlements` pour le free,
  aucune requête pour un contenu gratuit, aucune pour un visiteur anonyme.
- Les dates sont **copiées** de l'abonnement vers le droit → un droit expire
  seul, même si aucune synchronisation ne tourne. C'est la barrière de sûreté.
- `payments` n'est **jamais lu** par la couche d'accès. Un paiement réussi
  n'ouvre rien par lui-même — testé (`test_a_successful_payment_never_grants_access_by_itself`).
- La référence d'idempotence `subscription:<id>` s'appuie sur l'**id interne**,
  pas sur `external_reference` : elle survivra telle quelle à l'arrivée du
  fournisseur.
- Le propriétaire d'un droit ne change jamais (`unset($attributes['user_id'])`).
- Une dérogation admin **ne peut pas** être de type `subscription` :
  `EntitlementAdminService` est structurellement limité à `admin_override`.

---

## B. Composants réutilisables sans modification

| Composant | Réutilisé tel quel ? | Note |
|---|---|---|
| `ContentAccess` | ✅ **intact** | le fournisseur ne doit jamais y apparaître |
| `EntitlementService` | ✅ **intact** | ne lira jamais ni `payments` ni le fournisseur |
| `AccessTier` / `AccessDecision` | ✅ **intact** | vocabulaire clos, aucun concept Stripe |
| `SubscriptionEntitlementSynchronizer` | ✅ **intact** | déjà idempotent, déterministe, agnostique |
| `Entitlement` (modèle + scope) | ✅ **intact** | `isValid()` / `validNow()` restent la barrière temporelle |
| `smarter:sync-entitlements` | ✅ **intact** | devient l'outil de **rattrapage de webhook manqué** |
| `GET /content/availability`, `GET /me/access` | ✅ **intact** | l'UI de facturation lira `/me/access` |
| `ActivityLogger` | ⚙️ **additif** | 2–3 constantes d'événement en plus |
| `Subscription` (modèle) | ⚙️ **additif** | `$fillable` + casts pour les nouvelles colonnes |

**Conclusion la plus importante de cet audit : la couche d'accès n'a pas besoin
d'être touchée.** Phase 5 écrit en amont de `subscriptions` et s'arrête là.

---

## C. Écarts réels (et seulement eux)

| # | Écart | Gravité | Justification |
|---|---|---|---|
| C1 | **Aucune dépendance fournisseur.** `composer.lock` ne contient aucun paquet Stripe/Cashier/Paddle. Zéro variable d'environnement, zéro code. | attendu | Table rase : le tracé est libre. |
| C2 | **Personne n'écrit jamais dans `subscriptions`.** Aucun contrôleur, aucune commande, aucun service. | bloquant | C'est LE trou que phase 5 comble. |
| C3 | **Aucune table d'événements de webhook.** | bloquant | L'idempotence exige un support en base. |
| C4 | **Aucune unicité sur `entitlements.reference`.** L'idempotence du synchroniseur repose sur `lockForUpdate()` + une lecture, sans filet en base. | moyen | Deux webhooks concurrents sur le même abonnement pourraient produire deux droits. Le verrou couvre le cas courant ; l'index le rend impossible. |
| C5 | **Aucune unicité sur `subscriptions.external_reference` / `payments.external_reference`.** | moyen | Une double livraison de `subscription.created` créerait deux abonnements locaux. |
| C6 | **`subscriptions` n'a pas de champ client fournisseur** (`provider_customer_id`), ni de `provider_status`, ni de plan/prix fournisseur. | moyen | On ne peut pas relier un webhook à un utilisateur sans lui. |
| C7 | **`statefulApi()` est actif** (`bootstrap/app.php:17`). Une route de webhook posée naïvement dans `routes/api.php` hériterait de la session/CSRF. | **piège** | À traiter explicitement, voir §G.3. |
| C8 | **Aucune infrastructure de tâches.** `app/Jobs` n'existe pas (la table `jobs` oui, `QUEUE_CONNECTION=database`). | faible | Le traitement synchrone suffit au départ. |
| C9 | **`Profil.jsx` n'affiche aucun état d'abonnement réel.** Le bouton « Passer Premium » est inconditionnel — il s'affiche même pour un abonné. `/me/access` n'est consommé **nulle part** dans le frontend. | moyen | Défaut d'UX existant, à corriger en phase 5/6. |
| C10 | **`Tarifs.jsx` est purement statique.** `PricingCard` pointe vers une route interne, sans aucun appel d'encaissement. | attendu | C'est le point d'accroche de la phase 6. |

> **Ce qui n'est PAS un écart** : l'absence d'écriture admin sur `subscriptions`
> est une décision d'architecture (`EntitlementAdminService`), pas un oubli. Elle
> doit survivre à la phase 5.

---

## D. Modifications de base — migrations exactes

Toutes **additives**. Aucune donnée existante n'est touchée : les trois tables
concernées sont vides en production (aucun code ne les écrit).

### D.1 `subscriptions` — relier au fournisseur

```php
// 2026_09_XX_000001_add_provider_fields_to_subscriptions_table.php
Schema::table('subscriptions', function (Blueprint $table) {
    // L'identité du client CHEZ le fournisseur. Nécessaire pour rattacher un
    // webhook à un compte : l'évènement ne porte pas notre user_id.
    $table->string('provider_customer_id')->nullable()->after('provider');

    // Le statut BRUT du fournisseur, conservé tel quel À CÔTÉ du nôtre — jamais
    // à sa place. `status` reste le vocabulaire local qui fait autorité ; cette
    // colonne sert au diagnostic (« pourquoi l'écart ? ») et n'est lue par
    // AUCUNE décision d'accès.
    $table->string('provider_status')->nullable()->after('external_reference');

    // Le plan/tarif du fournisseur. `plan` reste notre vocabulaire.
    $table->string('provider_price_id')->nullable()->after('provider_status');

    // La fin de période courante annoncée par le fournisseur, et l'intention de
    // résiliation. Distincts de `ends_at`/`cancelled_at`, qui restent locaux.
    $table->timestamp('current_period_end')->nullable()->after('ends_at');
    $table->boolean('cancel_at_period_end')->default(false)->after('cancelled_at');

    // L'instant de l'évènement fournisseur qui a produit l'état local courant.
    // C'est ce qui permet d'ignorer un évènement ARRIVÉ EN RETARD (§G.5).
    $table->timestamp('provider_synced_at')->nullable();

    $table->unique(['provider', 'external_reference']); // C5
    $table->index('provider_customer_id');
});
```

> `unique(provider, external_reference)` et non `unique(external_reference)` :
> deux fournisseurs peuvent émettre la même chaîne, et la colonne est nullable —
> MySQL autorise plusieurs NULL, donc les lignes sans fournisseur ne gênent pas.

### D.2 `payments` — idem, minimal

```php
// 2026_09_XX_000002_add_provider_fields_to_payments_table.php
Schema::table('payments', function (Blueprint $table) {
    $table->string('provider_invoice_id')->nullable()->after('external_reference');
    $table->string('failure_code')->nullable()->after('status'); // code court, jamais un message brut
    $table->unique(['provider', 'external_reference']); // C5
});
```

Volontairement **non ajouté** : `provider_customer_id` (déductible via
`subscription`), le PDF de facture, le moyen de paiement, la marque de carte,
les 4 derniers chiffres. Minimisation des données — §11 de la commande.

### D.3 `provider_events` — la table d'idempotence (nouvelle)

```php
// 2026_09_XX_000003_create_provider_events_table.php
Schema::create('provider_events', function (Blueprint $table) {
    $table->id();
    $table->string('provider');               // 'stripe', …
    $table->string('event_id');               // l'identité DU FOURNISSEUR (evt_…)
    $table->string('type');                   // 'customer.subscription.updated'
    $table->string('status')->default('pending'); // pending|processed|failed|ignored

    // L'horloge DU FOURNISSEUR — sert à l'ordre, jamais à l'identité (§8).
    $table->timestamp('occurred_at')->nullable();
    $table->timestamp('received_at');
    $table->timestamp('processed_at')->nullable();

    $table->unsignedSmallInteger('attempts')->default(0);
    $table->string('failure_reason', 500)->nullable();

    // De quoi relier l'évènement à ce qu'il a touché, pour le diagnostic.
    $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
    $table->string('provider_object_id')->nullable();

    // AUCUN payload complet. Une empreinte pour détecter une re-livraison
    // au contenu différent, et rien de plus (minimisation, §11).
    $table->string('payload_hash', 64)->nullable();

    $table->timestamps();

    // LA garantie « traité une seule fois » (§8) — en base, pas en mémoire.
    $table->unique(['provider', 'event_id']);
    $table->index(['status', 'received_at']);
    $table->index('provider_object_id');
});
```

### D.4 `entitlements` — refermer C4

```php
// 2026_09_XX_000004_unique_entitlement_reference.php
Schema::table('entitlements', function (Blueprint $table) {
    // Un abonnement ne peut produire qu'UN droit. L'unicité porte sur
    // (type, reference) et non sur `reference` seule : une dérogation admin a
    // une `reference` nulle, et les NULL multiples restent permis.
    $table->unique(['type', 'reference'], 'entitlements_type_reference_unique');
});
```

**Avant d'appliquer**, vérifier qu'aucun doublon ne préexiste :

```sql
SELECT type, reference, COUNT(*) FROM entitlements
WHERE reference IS NOT NULL GROUP BY type, reference HAVING COUNT(*) > 1;
```

> **Rollback** : les quatre `down()` se limitent à `dropUnique`/`dropColumn` sur
> des colonnes ajoutées et `dropIfExists` sur une table créée par cette phase.
> Aucun `down()` ne touche une donnée antérieure à la phase 5.

---

## E. Frontière du fournisseur

### E.1 Le partage des responsabilités

| Le fournisseur possède | L'application possède |
|---|---|
| Client et moyen de paiement | Identité de l'utilisateur (`users`) |
| Encaissement / checkout | Représentation locale de l'abonnement (`subscriptions`) |
| Cycle de facturation, périodes | Projection en droits (`entitlements`) |
| Factures, tentatives de paiement | Palier du contenu (`lessons.tier`, `practice_exercises.tier`) |
| Relances, échecs de carte | Publication |
| État de résiliation côté fournisseur | **Décision d'accès** |
| Remboursements | Progression, maîtrise, preuves, signalements |

### E.2 Les fichiers à créer (et le mur à ne pas franchir)

```
app/Domain/Billing/                     ← TOUT le code fournisseur vit ici
├── PaymentProvider.php                 (interface : createCheckout, fetchSubscription, verifySignature)
├── ProviderSubscriptionState.php       (DTO neutre : status, périodes, ids — AUCUN type Stripe)
├── ProviderSubscriptionAdapter.php     (DTO neutre → écriture sur Subscription)
├── WebhookEventRecorder.php            (idempotence : la porte unique)
├── Stripe/
│   ├── StripePaymentProvider.php       ← le SEUL fichier qui connaît le SDK
│   └── StripeEventTranslator.php       ← évènement Stripe → ProviderSubscriptionState
└── …
```

**La règle, exécutable :** aucun fichier de `app/Domain/Access/` ne doit jamais
importer quoi que ce soit de `app/Domain/Billing/`. La dépendance va dans un seul
sens. Une garde de test le verrouille (§K.6).

### E.3 Le flux complet

```
Stripe                     (le fournisseur encaisse)
   ↓ webhook signé
StripeEventTranslator      (traduit en DTO neutre — seul point de contact SDK)
   ↓ ProviderSubscriptionState
WebhookEventRecorder       (idempotence : déjà vu ? → on s'arrête)
   ↓
ProviderSubscriptionAdapter (DTO → colonnes de `subscriptions`)
   ↓
SubscriptionEntitlementSynchronizer::sync()   ← INCHANGÉ
   ↓
entitlements (type=subscription)
   ↓
EntitlementService → ContentAccess → l'élève
```

---

## F. Cartographie du cycle de vie

### F.1 État fournisseur → état local

| État Stripe | `subscriptions.status` | Droit produit | Raison |
|---|---|---|---|
| `incomplete` | `pending` | **aucun** | Rien n'est payé. Ouvrir ici serait l'erreur exacte que toute l'architecture évite. |
| `trialing` | `active` | actif jusqu'à `ends_at` | Un essai est un accès accordé et daté. |
| `active` | `active` | actif | Le cas nominal. |
| `past_due` | `active` **jusqu'à `ends_at`** | reste actif jusqu'au terme | Voir F.2 — c'est la règle déduite, pas inventée. |
| `unpaid` | `expired` | révoqué | Le fournisseur a épuisé ses relances. |
| `canceled` (fin de période future) | `cancelled` + `ends_at` | **actif jusqu'à `ends_at`** | Résilier n'est pas se faire rembourser. Déjà codé et testé. |
| `canceled` (immédiat / remboursé) | `expired`, `ends_at = now()` | révoqué | Le temps ferme le droit tout seul. |
| `incomplete_expired` | `expired` | aucun | N'a jamais rien ouvert. |
| objet supprimé chez le fournisseur | `expired` | révoqué | Voir §M.9. |

### F.2 Échec de paiement — la règle, déduite du code existant

**Aucune règle nouvelle n'est inventée ici.** Elle se lit dans ce qui existe :

1. `payments` n'est jamais consulté par la couche d'accès. Un échec de paiement
   ne peut donc, **en lui-même**, rien fermer.
2. Le synchroniseur ne juge que `subscriptions.status`.
3. `cancelled` honore la période déjà payée (`grantsAccess()`).

**Donc : `past_due` → `status` reste `active`, `ends_at` inchangé.** L'accès se
ferme tout seul à la fin de la période payée, par le temps, sans qu'aucune tâche
n'ait besoin de tourner. Si le fournisseur finit par passer à `unpaid` ou
`canceled`, on bascule à `expired` et le droit est révoqué.

Ce n'est pas un délai de grâce inventé : c'est la conséquence directe du principe
« la période payée est due à l'élève », déjà écrit dans le synchroniseur. Aucune
colonne `grace_until` n'est nécessaire.

### F.3 Réactivation

Le fournisseur repasse à `active` (résiliation annulée, ou paiement rattrapé) :
`status` → `active`, `ends_at` ← nouvelle fin de période, `cancelled_at` → null.
Le synchroniseur **met à jour le droit existant** (même `reference`
`subscription:<id>`) — pas de second droit. Déjà couvert par
`test_renewal_updates_the_same_entitlement`.

### F.4 Nouvel abonnement

```
checkout.session.completed → résoudre l'utilisateur (client fournisseur → user_id)
                           → créer/mettre à jour `subscriptions` (active + périodes)
                           → sync() → entitlement → accès premium
```

**L'utilisateur n'est jamais résolu depuis le corps de la requête du client.** Il
l'est depuis `provider_customer_id`, ou depuis le `client_reference_id` posé par
**notre serveur** au moment de créer la session.

---

## G. Architecture des webhooks

### G.1 Existant

**Néant.** Aucune route, aucun contrôleur, aucune vérification de signature,
aucune table d'évènements. Tout est à poser.

### G.2 Les évènements strictement nécessaires

| Évènement | Effet |
|---|---|
| `checkout.session.completed` | rattacher client ↔ user ; créer l'abonnement local |
| `customer.subscription.created` | créer/confirmer l'abonnement local |
| `customer.subscription.updated` | statut, périodes, résiliation programmée |
| `customer.subscription.deleted` | → `expired`, révocation |
| `invoice.paid` | ligne `payments` (succeeded) + prolongation de période |
| `invoice.payment_failed` | ligne `payments` (failed). **N'ouvre ni ne ferme rien** (F.2). |

Tout autre évènement est enregistré `ignored` et non traité. Ne pas s'abonner à
plus large que cette liste.

### G.3 La route — et le piège `statefulApi()` (C7)

```php
// routes/api.php — HORS de tout groupe auth:sanctum / account.active
Route::post('/webhooks/{provider}', [WebhookController::class, 'handle'])
    ->whereIn('provider', ['stripe'])
    ->withoutMiddleware([
        \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ])
    ->middleware('throttle:120,1');
```

Un webhook n'a **ni session, ni utilisateur, ni jeton CSRF**. Son authentification
est **la signature**, et rien d'autre. Il faut aussi lire le corps **brut**
(`$request->getContent()`) : la signature porte sur les octets exacts, et un
corps re-sérialisé depuis un tableau PHP ne la validera pas.

### G.4 Le traitement, dans l'ordre

```
1. Lire le corps BRUT
2. Vérifier la signature       → invalide : 400, rien n'est écrit, log de sécurité
3. INSERT provider_events      → violation d'unicité : déjà vu, répondre 200 et s'arrêter
4. Traduire en DTO neutre
5. Transaction :
     - écrire `subscriptions`
     - SubscriptionEntitlementSynchronizer::sync()
     - marquer l'évènement `processed`
6. 200
```

Ordre volontaire : **l'enregistrement de l'évènement précède le traitement.**
L'insérer après laisserait une fenêtre où une double livraison serait traitée deux
fois. C'est l'insertion elle-même — via la contrainte d'unicité — qui constitue le
verrou, pas un `SELECT` préalable (deux requêtes concurrentes passeraient toutes
les deux un `SELECT`).

### G.5 Désordre et retard

Les évènements n'arrivent pas dans l'ordre. La protection est **`occurred_at`** :

```php
if ($subscription->provider_synced_at?->greaterThan($event->occurredAt)) {
    // Un évènement PLUS ANCIEN que notre état courant : enregistré, non appliqué.
    return $this->markIgnored($event, 'stale');
}
```

Sans cela, un `subscription.updated` retardé pourrait réécrire par-dessus un
`subscription.deleted` déjà appliqué — et rouvrir un accès révoqué.

### G.6 Échec de traitement

`status = failed` + `failure_reason` + `attempts++`, et on répond **500** pour que
le fournisseur réessaie. Une commande de rattrapage rejoue les `failed` :

```
php artisan smarter:replay-provider-events [--provider=stripe] [--since=…]
```

Le filet de dernier recours reste `smarter:sync-entitlements`, qui existe déjà et
dont le docblock prévoyait exactement ce cas (« rattrapage d'un webhook manqué »).

---

## H. Modèle de sécurité

| Menace | Défense | Où |
|---|---|---|
| **Faux webhook** | signature HMAC sur le corps brut + tolérance d'horodatage | `verifySignature()`, avant toute écriture |
| **Rejeu** | `unique(provider, event_id)` | base, pas mémoire |
| **Rejeu avec corps modifié** | `payload_hash` différent sur un `event_id` connu → alerte | `WebhookEventRecorder` |
| **Le client affirme « payé »** | **aucune route** ne prend un état de paiement du client | absence par construction |
| **Le client poste un droit** | aucun `store`/`update`/`destroy` sur `/me/access` — testé (`test_student_cannot_mutate_entitlements`) | déjà en place |
| **Le client poste un id d'abonnement** | l'utilisateur est résolu depuis le client fournisseur, jamais depuis le corps | `ProviderSubscriptionAdapter` |
| **IDOR** | `/me/access` ne lit que `$request->user()`. Les routes fournisseur sont `can:admin`. Aucune route ne prend un `user_id` en paramètre pour la facturation. | déjà en place |
| **Admin fabrique un abonnement** | `EntitlementAdminService` ne sait écrire que `admin_override` | déjà en place |
| **Publication contournée** | `ContentAccess` compose les deux, toujours | déjà testé |
| **Fuite de secret** | `STRIPE_SECRET`/`STRIPE_WEBHOOK_SECRET` en env, jamais en base, jamais renvoyés par une API | `config/services.php` |

### H.1 La règle qui domine tout

> **L'accès premium ne dérive JAMAIS que d'un `entitlement` valide.**
> Ni d'un retour de checkout, ni d'une ligne `payments`, ni d'un
> `provider_customer_id`, ni d'une affirmation du frontend.

Le retour de navigateur après paiement affiche « merci » — il **n'accorde rien**.
L'accès s'ouvre quand le webhook arrive. Si l'UI doit attendre, elle sonde
`/me/access` ; elle ne se l'auto-attribue pas.

---

## I. Frontend — ce qui devra exister

### I.1 Déjà en place (vérifié)

- `/tarifs` routé (`App.jsx:269`), `PricingCard` free/premium, 35 €/an.
- `LessonCard` : leçon verrouillée → carte ambre, badge `Premium`, **lien vers
  `/tarifs`**. Le parcours « élève gratuit → leçon premium → voir les tarifs »
  **fonctionne déjà**.
- `ContentAvailabilityContext` distingue `closed` / `locked` / `premium`, avec
  politique d'ouverture en cas d'échec.
- Le serveur tranche en dernier : `locked` du serveur prime sur `lesson.tier` du
  bundle.

### I.2 À ajouter en phase 5 (petit, sans encaissement)

1. **`Profil.jsx` doit lire l'état réel** (C9). Aujourd'hui « Passer Premium »
   s'affiche même à un abonné. Consommer `access` du contexte :
   - `premiumAccess === false` → « Passer Premium » → `/tarifs`
   - `subscriptionActive === true` → « Abonnement actif jusqu'au {expiresAt} »
   - `adminOverrideActive` seul → « Accès offert », sans détail interne
2. **`/tarifs` conscient de l'état** : un abonné ne doit pas voir « S'abonner »
   sur le plan qu'il possède déjà.

### I.3 Phase 6 seulement

Bouton d'encaissement, redirection fournisseur, page de retour avec sondage de
`/me/access`, portail client, historique de factures.

---

## J. Administration

**Reste en lecture seule.** `AdminSubscriptionController` liste déjà abonnements
et paiements avec `provider` et `reference`.

À ajouter, **en lecture seule** :

- Sur la fiche élève : `provider_status` **à côté de** `status` local, et la date
  du dernier évènement reçu. C'est ce qui répond à « pourquoi l'écart ? ».
- Un écran `provider_events` filtrable (type, statut, date) pour diagnostiquer une
  livraison manquée ou en échec.
- Un bouton **« rejouer cet évènement »** — admin, journalisé, idempotent.
  Rejouer n'est pas fabriquer : il repasse par la même chaîne.

Nouvelles constantes `ActivityLogger` : `SUBSCRIPTION_SYNCED`,
`PROVIDER_EVENT_REPLAYED`.

**Interdit** : créer un abonnement, modifier une date, encaisser, rembourser
depuis l'administration. Le geste commercial existe déjà et porte son nom —
`admin_override`.

---

## K. Matrice de test

### K.1 Abonnement → droit (étendre `SubscriptionSynchronizationTest`)

| Cas | Attendu |
|---|---|
| aucun abonnement | aucun droit, premium refusé |
| `pending` | aucun droit ✅ *(existe)* |
| `active` sans terme | droit sans terme ✅ *(existe)* |
| `active` daté | droit borné ✅ *(existe)* |
| `cancelled` + `ends_at` futur | **accès maintenu** ✅ *(existe)* |
| `cancelled` sans `ends_at` | rien ✅ *(existe)* |
| `expired` | révoqué ✅ *(existe)* |
| réactivation `expired` → `active` | **même** droit ré-ouvert **(nouveau)** |
| `past_due` | accès maintenu jusqu'à `ends_at` **(nouveau, F.2)** |

### K.2 Droits

Abonnement actif · futur · expiré · révoqué · dérogation · abonnement + dérogation
· aucun. — **couvert** par `EntitlementAccessMatrixTest`.

### K.3 Contenu

Leçon gratuite · premium · premium + exercice `free` explicite · premium +
exercice hérité · non publiée + abonnement valide (**refus**) · publiée premium
sans droit. — **couvert** (`ContentTierControlTest`, `ExercisePremiumAccessTest`).

### K.4 Fournisseur (**tout nouveau**)

| Test | Attendu |
|---|---|
| évènement nouveau | abonnement + droit créés |
| **évènement dupliqué** | 200, **un seul** droit, `attempts` non incrémenté |
| rejeu après succès | aucun changement d'état |
| **désordre** (`updated` ancien après `deleted`) | ignoré `stale`, l'accès **reste fermé** |
| signature invalide | 400, **aucune écriture**, aucun `provider_events` |
| corps altéré, signature valable d'un autre corps | 400 |
| traitement en échec | `failed`, 500, rejouable |
| rejeu d'un `failed` | converge vers le même état |
| `invoice.payment_failed` | ligne `payments`, **accès inchangé** |
| fournisseur injoignable | aucune décision d'accès affectée |

### K.5 Sécurité (**nouveau**)

- Faux « paiement réussi » posté par un élève → 404/405 (la route n'existe pas).
- Élève postant un `subscription_id` ou un `provider_customer_id` → aucun effet.
- Élève tentant `POST /me/access` → refusé ✅ *(existe)*.
- Élève A lisant l'abonnement de B → impossible (aucune route).
- URL directe d'une leçon/d'un exercice premium sans droit → refus serveur ✅.
- Webhook avec un `event_id` d'un autre compte → n'affecte que l'abonnement visé.

### K.6 Garde d'architecture (**nouveau, essentiel**)

```php
public function test_access_layer_never_imports_billing(): void
{
    foreach (glob(app_path('Domain/Access/*.php')) as $file) {
        $this->assertStringNotContainsString('Domain\\Billing', file_get_contents($file));
        $this->assertStringNotContainsString('Stripe', file_get_contents($file));
    }
}
```

C'est la version exécutable de la règle « le fournisseur n'entre pas dans la
couche d'accès ». Sans elle, la frontière se perd au troisième correctif urgent.

### K.7 E2E (navigateur)

Élève gratuit → leçon premium → carte verrouillée → clic → `/tarifs`.
Élève avec droit → même leçon → « Commencer ». Perte du droit → contenu
reverrouillé, **progression intacte** ✅ *(déjà testé côté API)*.

---

## L. Sûreté des données

**Aucune migration destructive.** Les quatre migrations sont : trois `ALTER TABLE
ADD COLUMN` et un `CREATE TABLE`.

Garanties :

- `users`, `lessons`, `lesson_modules`, `practice_exercises` : **intouchés**.
- Progression, maîtrise, preuves, tentatives, signalements, learning points :
  **intouchés**. Déjà protégé par `test_losing_access_never_touches_progress`.
- `subscriptions`, `payments`, `entitlements` : aucune ligne supprimée ni
  réécrite. Les colonnes ajoutées sont nullables (ou `default false`).
- Un droit n'est **jamais supprimé**, seulement révoqué — l'histoire reste
  auditable.
- Rétro-compatibilité : le code actuel ignore les nouvelles colonnes et continue
  de fonctionner à l'identique.
- La seule migration susceptible d'échouer sur des données existantes est D.4
  (unicité) : la requête de vérification est fournie, et les tables sont vides.

---

## M. Séquence d'implémentation

Chaque phase se termine sur une suite verte et est livrable seule.

| # | Phase | Contenu | Risque |
|---|---|---|---|
| **5.1** | Socle base | Les 4 migrations (D.1–D.4) + `$fillable`/casts + `ProviderEvent`. Tests de schéma et d'unicité. | très faible |
| **5.2** | Garde d'architecture | K.6 + le test de réactivation et de `past_due` (K.1). **Avant** tout code fournisseur. | nul |
| **5.3** | Frontière neutre | `PaymentProvider`, `ProviderSubscriptionState`, `ProviderSubscriptionAdapter`, `WebhookEventRecorder` — **sans aucun SDK**, testés avec un fournisseur factice. | faible |
| **5.4** | Idempotence | Route webhook + `WebhookController` + vérification de signature abstraite. Toute la matrice K.4 passe **contre un faux fournisseur**. | faible |
| **5.5** | Adaptateur Stripe | `composer require stripe/stripe-php`, `StripePaymentProvider`, `StripeEventTranslator`, env + `config/services.php`. Le seul endroit qui connaît Stripe. | moyen |
| **5.6** | Observabilité admin | Écran `provider_events` en lecture seule, `provider_status` sur la fiche élève, rejeu journalisé, commande de rattrapage. | faible |
| **5.7** | État réel côté élève | C9 : `Profil.jsx` et `/tarifs` lisent `/me/access`. | faible |
| **— 6 —** | **Encaissement** | Session de checkout, retour, sondage, portail client, factures. **Hors périmètre de la phase 5.** | — |

L'ordre a une raison : **l'idempotence et la garde d'architecture sont posées et
testées avant que la première ligne de Stripe n'existe.** Livrer le SDK d'abord,
c'est se retrouver à rétro-ajuster l'idempotence sous la pression d'un webhook en
production.

---

# Récapitulatif

## ✅ DÉJÀ IMPLÉMENTÉ (lu dans le code, 133 tests verts)

- Contrôle FREE/PREMIUM du contenu — `lessons.tier`, `practice_exercises.tier`,
  héritage et exception explicite (`AccessTier::effective`).
- Noyau des droits — `EntitlementService`, `AccessDecision`, `ContentAccess`,
  le gratuit comme règle, l'invariant droit ≠ publication.
- Synchronisation des abonnements — `SubscriptionEntitlementSynchronizer`,
  idempotent par `subscription:<id>`, dates copiées, `cancelled` honoré.
- Administration : consultation, dérogation, révocation, journal ; abonnements et
  paiements en lecture seule ; impossibilité structurelle de fabriquer un
  `type = subscription`.
- Frontend : `/tarifs`, cartes tarifaires, badge Premium, leçon verrouillée →
  `/tarifs`, `ContentAvailabilityContext`.
- `smarter:sync-entitlements`, avec `--dry-run`.

## 🔜 PHASE 5 — INTÉGRATION DU FOURNISSEUR (planifiée, non écrite)

4 migrations additives · `app/Domain/Billing/` derrière une interface neutre ·
route de webhook avec signature · `provider_events` pour l'idempotence en base ·
protection contre le désordre via `occurred_at` · cartographie F.1 · observabilité
admin en lecture seule · état d'abonnement réel dans `Profil.jsx`.
**La couche d'accès n'est pas modifiée.**

## ⏭️ PHASE 6 — ENCAISSEMENT (hors périmètre)

Session de checkout, retour de paiement, portail client, factures, remises,
remboursements.

## ⚠️ Les trois pièges à ne pas manquer

1. **`statefulApi()` est actif** — une route de webhook naïve hériterait de la
   session et du CSRF (C7). Corps brut obligatoire pour la signature.
2. **`entitlements.reference` n'est pas unique** (C4) — l'idempotence ne tient
   aujourd'hui qu'à un `lockForUpdate()`. Sous webhooks concurrents, il faut
   l'index.
3. **`Profil.jsx` n'a jamais lu `/me/access`** (C9) — « Passer Premium » s'affiche
   aux abonnés. Défaut existant, indépendant du paiement.
