# Phase 7 — Le cycle de vie de l'abonnement

> Ce que la phase 6 vendait, la phase 7 le rend **gérable** : voir son
> abonnement, le résilier, revenir sur cette décision, changer de carte.
> Aucun accès n'est ouvert ou fermé par ces gestes — la règle de la phase 5
> tient, et c'est ce que ce document défend.

Date : 2026-09-11 · Ligne de base phase 6.5 : 531 tests → **556 tests, tous verts**

---

## A. Le périmètre, tel que le dépôt le définissait

La phase 7 n'a pas été inventée : elle était écrite en toutes lettres à la fin
des rapports des phases 6 et 6.5 (« portail client, annulation, factures,
remboursements, changement d'offre »). Ce qui a été retenu, et pourquoi :

| Capacité | Décision | Raison |
|---|---|---|
| Page d'abonnement `/abonnement` | **fait** | Il n'existait aucun écran de gestion |
| API d'état de facturation | **fait** | `/me/access` ne portait ni offre, ni dates, ni intention |
| Portail client hébergé | **fait** | Moyens de paiement **et** factures, d'un coup |
| Résiliation en fin de période | **fait** | Le geste le plus demandé après l'achat |
| Reprise après résiliation | **fait** | Sans elle, une résiliation est irréversible |
| Interface de factures locale | **écarté** | Le portail les sert déjà ; les recopier créerait une seconde vérité |
| Changement d'offre | **écarté** | **Une seule offre existe** (`annual`). Bâtir un sélecteur pour un choix unique serait une abstraction spéculative |
| Remboursements, avoirs | **écarté** | Rien ne les appelle ; relèvent d'un geste d'administration |
| Codes promotionnels | **écarté** | Stripe possède le prix ; un moteur local de remise le contredirait |
| Réconciliation comptable | **écarté** | Aucun besoin exprimé ; demande un journal financier qui n'existe pas |
| Stripe en production (`live`) | **hors périmètre** | Explicitement exclu de cette tâche |

---

## B. L'invariant, inchangé

```
élève → SubscriptionManager → FOURNISSEUR → webhook SIGNÉ → adaptateur
                                                → subscriptions → entitlements
                                                → EntitlementService
                                                → ContentAccess
```

Résilier n'écrit **aucun** droit. Reprendre non plus. Le portail non plus.

La conséquence concrète, et c'est le cœur de la phase : **un élève qui résilie
garde son accès jusqu'au terme payé.** Il a payé ces jours-là.

Les deux seuls champs dont dépend l'accès — `status` et `ends_at` — ne sont
jamais écrits par ces gestes. Seuls `cancel_at_period_end` et
`provider_status`, purement **descriptifs**, sont recopiés pour que la page
reflète l'intention sans attendre le webhook.

---

## C. L'appartenance : une absence, pas un contrôle

Aucune des quatre routes ne lit **le moindre identifiant** dans la requête.
Pas d'abonnement, pas de client, pas d'utilisateur, pas de tarif.

L'élève vient du jeton, son abonnement est retrouvé à partir de lui.

> Il n'y a pas de contrôle d'appartenance à oublier, **parce qu'il n'y a rien
> à faire correspondre**.

Vérifié en essayant quand même — quatre tests joignent `user_id`,
`subscription_id`, `external_reference` et `customer_id` d'une victime :
les champs ne sont pas lus, et la victime reste intacte.

---

## D. Ce qui a changé

### Backend

| Fichier | État |
|---|---|
| `Domain/Billing/PortalSession.php` | **nouveau** — DTO neutre (une URL) |
| `Domain/Billing/SubscriptionManager.php` | **nouveau** — état, portail, résiliation, reprise |
| `Domain/Billing/PaymentProvider.php` | **étendu** de 3 méthodes |
| `Domain/Billing/Stripe/StripePaymentProvider.php` | **étendu** — portail, résiliation, reprise |
| `Domain/Billing/Stripe/StripeEventTranslator.php` | `fromApiSubscription()` — **la même** traduction qu'un webhook |
| `Domain/Billing/SandboxPaymentProvider.php` | **étendu** — refuse au lieu de simuler |
| `Http/Controllers/BillingSubscriptionController.php` | **nouveau** |
| `config/billing.php` | URL de retour du portail |
| `routes/api.php` | 4 routes authentifiées |

**Aucune migration.** Le schéma de la phase 5 portait déjà
`cancel_at_period_end`, `provider_customer_id` et `current_period_end`.

### Frontend

| Fichier | État |
|---|---|
| `pages/Abonnement.jsx` | **nouveau** — la page de gestion |
| `services/billingService.js` | **étendu** de 4 appels |
| `App.jsx` | route `/abonnement`, authentifiée |
| `pages/student/Profil.jsx` | « Gérer mon abonnement » pour un abonné |

### Une traduction, pas deux

`fromApiSubscription()` réutilise **exactement** le chemin des webhooks. Lire
une réponse d'API autrement qu'un évènement est précisément la façon dont le
défaut D1 (la période déplacée sur les lignes) avait survécu à toute une suite
de tests verte.

---

## E. Les six états, et leur phrase

| État | Ce que l'élève lit |
|---|---|
| Aucun abonnement | « Vous utilisez actuellement l'accès gratuit » |
| Actif | « Votre abonnement est actif » + renouvellement |
| Résiliation programmée | « Votre abonnement prendra fin » + **accès jusqu'au …** |
| Terminé | « Votre abonnement est terminé » |
| Dérogation admin | « Accès administrateur actif » |
| En attente | aucun accès annoncé |

La page ne **décide** de rien : `accessActive`, `canCancel`, `canResume` et
`canManage` viennent du serveur. Elle ne compare aucune date — un test de
source interdit `Date.now() <` et `new Date(...) <`, parce qu'un tel calcul
ferait de l'horloge du poste l'arbitre de l'accès.

---

## F. Deux défauts trouvés AU NAVIGATEUR

Aucun des deux n'était visible en test : la page rendait, les routes
répondaient, les 4856 tests frontend passaient.

### 1. La page se figeait sur son squelette

`alive.current` n'était mis qu'à **faux**, au démontage. En mode strict, React
monte, démonte puis remonte : le drapeau restait faux pour toujours, toute
réponse était ignorée, et l'élève ne voyait qu'un rectangle gris. Le serveur
répondait pourtant 200.

**Correction** : le drapeau est **remis à vrai au montage**.

### 2. Un jeton absent laissait le squelette en place

`load()` sortait avant `setLoading(false)`. Même symptôme, autre cause.

> Les deux ne se voient qu'en ouvrant la page. C'est exactement ce que la
> phase 6.5 avait déjà démontré à propos des mocks.

---

## G. Sécurité vérifiée

| Contrôle | Résultat |
|---|---|
| Visiteur non connecté (4 routes) | ✅ 401 |
| Compte suspendu (4 routes) | ✅ 403 |
| **Résilier l'abonnement d'autrui** | ✅ refusé, aucun appel sortant |
| **Reprendre l'abonnement d'autrui** | ✅ refusé |
| **Portail d'un autre client** | ✅ `customer_id` jamais lu |
| **Abonné agissant sur autrui** | ✅ agit sur LE SIEN, la victime intacte |
| Identifiants du fournisseur exposés | ✅ aucun (`cus_`, `sub_`, `price_`) |
| Message du fournisseur fuité | ✅ neutralisé (`sk_live…` jamais rendu) |
| Résiliation → droit écrit | ✅ **aucune écriture dans `entitlements`** |
| Panne fournisseur → état local | ✅ inchangé |
| Double clic / rafraîchissement | ✅ idempotent, aucun second appel |
| Signature forgée | ✅ 400, aucun accès |
| Publication indépendante | ✅ inchangée |
| Clé de test uniquement | ✅ `livemode: false` partout |

---

## H. Tests

| | |
|---|---|
| **Backend** | **556 / 556** (1932 assertions) — ligne de base 531 |
| dont `SubscriptionLifecycleApiTest` | **25** (nouveau) |
| dont `StripeRealPayloadRegressionTest` | 7 → **10** (post-audit D3/D4) |
| **Frontend** | **4856 / 4856**, 184 fichiers — ligne de base 4833 |
| dont `subscriptionService.test.js` | **13** (nouveau) |
| dont `abonnementContract.test.js` | **10** (nouveau) |
| **Build** | ✅ 30,8 s |
| `validate:lessons` · `check:routes` · `check:non-blocking` · `check:level-leak` | ✅ |
| Gardes d'architecture | ✅ 6/6 |
| **Navigateur E2E** | ✅ **33 / 33** |

### H.1 L'épreuve du navigateur — contre le VRAI Stripe

Résilier et reprendre ont appelé **l'API Stripe réelle** en mode test
(`livemode: false`), sur un abonnement de test réellement créé :

```
abonnement réel créé            sub_1UEbd0…  status=active
  → webhook SIGNÉ (HMAC)        → accès premium ouvert
  → « Résilier » (confirmation) → Stripe: cancel_at_period_end=true
  → ACCÈS TOUJOURS OUVERT       ← le point de la phase
  → « Continuer »               → Stripe: cancel_at_period_end=false
  → abonnement de nouveau actif
  → webhook de suppression      → accès FERMÉ
```

Le portail a été créé contre l'API réelle (`billing.stripe.com`,
`livemode: false`). Abonnement et client de test **supprimés** ensuite.

La vérification de signature n'a été ni désactivée ni affaiblie : la tolérance
est restée à **300 s** et les webhooks du harnais sont réellement signés.

---

## I. Base de données

`diff` avant/après : **identique**.

| Table | Avant | Après |
|---|---|---|
| lessons · lesson_modules | 133 · 1082 | **identiques** |
| learning_points · learning_evidence | 1067 · 222 | **identiques** |
| student_lesson_progress | 116 | **identique** |
| users | 10 | **10** (élève de test supprimé) |
| subscriptions · entitlements · provider_events · payments | 0 | **0** |

Aucune migration. Aucun état de publication modifié.

---

## J. Limites

**Non bloquantes :**

1. **Une seule offre** (`annual`). Le changement d'offre n'a pas été bâti —
   voir §A.
2. **Les factures vivent chez le fournisseur**, via le portail. Volontaire :
   les recopier créerait une seconde source de vérité.
3. **Le portail dépend du fournisseur.** S'il est indisponible, la page
   affiche un message neutre ; aucun chemin d'accès n'en dépend.
4. **La réconciliation n'existe pas.** Si un webhook est définitivement perdu,
   l'état local reste en arrière jusqu'au suivant.

**Préexistantes, sans rapport :**

5. **L'horloge de la machine retarde d'environ 1 h, NTP inactif**
   (`System clock synchronized: no`). `systemd-timesyncd` est présent mais
   désactivé, et son activation demande un mot de passe root dont je ne
   dispose pas. **Prérequis d'environnement, pas un défaut applicatif** : la
   configuration est restée à 300 s.
6. **4 advisories `league/commonmark`**, transitives via Laravel.

---

## K. Verdict

```
PHASE 7 COMPLETE — READY FOR STAGING
```

**Stripe en production n'a PAS été activé.** `BILLING_MODE=test`, clé
`sk_test_`, `livemode: false` partout.

**Aucun déploiement n'a été effectué.**

**Avant la mise en service :** resynchroniser l'horloge (NTP), puis déployer
en préproduction et y rejouer le cycle complet contre Stripe en mode test.
