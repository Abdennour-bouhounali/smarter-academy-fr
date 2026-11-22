# Variables d'environnement — déploiement « légal + authentification »

Ce document liste ce que le fichier `.env` de production doit contenir pour que
le chantier légal/authentification fonctionne.

> **Écrit pour le produit français** (`smarter-academy.fr`, Stripe). Pour la
> plateforme algérienne, le domaine est **`smarter-academy.com`** partout où
> ce document écrit `.fr` (`APP_URL`, `FRONTEND_URL`, `GOOGLE_REDIRECT_URI`,
> lien de vérification) ; le modèle `.env` DZ et ses valeurs sont dans
> `DZ_FIRST_DEPLOYMENT.md`. Les pièges décrits ici (`APP_URL`,
> `MAIL_MAILER=log`) valent à l'identique.

> **Aucune valeur secrète ne figure ici, et aucune ne doit y figurer.**
> Ce fichier est versionné ; `.env` ne l'est pas (`.gitignore`). Les secrets
> se saisissent directement dans le `.env` du serveur, via le File Manager.

Emplacement du fichier sur Hostinger : **`public_html/api/.env`**
(à la racine de l'application Laravel, à côté de `artisan` — pas dans `public/`).

---

## 1. Ce qui existe déjà et NE DOIT PAS être touché

Le site fonctionne aujourd'hui. Les variables suivantes sont déjà correctes en
production : **ne pas les modifier, ne pas les supprimer, ne pas les réécrire.**

| Variable | Pourquoi ne pas y toucher |
|---|---|
| `APP_KEY` | Chiffre les jetons, les sessions **et signe les liens de vérification d'adresse**. La changer invalide instantanément toutes les sessions et tous les liens envoyés. |
| `DB_*` | Connexion à la base de production. |
| `STRIPE_SECRET` / `STRIPE_SECRET_KEY` | Encaissement en service. |
| `STRIPE_WEBHOOK_SECRET` | Vérifie la signature des webhooks. |
| `STRIPE_WEBHOOK_TOLERANCE=300` | **Valeur imposée — ne pas modifier.** |
| `STRIPE_PRICE_ANNUAL`, `BILLING_MODE`, `BILLING_PROVIDER` | Configuration d'abonnement en service. |

> Remarque : le code lit `env('STRIPE_SECRET', env('STRIPE_SECRET_KEY'))`.
> Les deux noms fonctionnent ; garder celui déjà en place.

---

## 2. Variables à VÉRIFIER (probablement déjà présentes)

À contrôler ligne par ligne — leur valeur conditionne le reste.

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://smarter-academy.fr
FRONTEND_URL=https://smarter-academy.fr
```

**`APP_DEBUG=false`** : déjà vérifié côté serveur le 2026-09-12 (une route
inexistante renvoie `{"message": ...}` sans trace d'exécution). Le laisser ainsi.

**`APP_URL` est critique pour ce déploiement.** Les liens de vérification
d'adresse sont construits par `URL::temporarySignedRoute()`, qui part de
`APP_URL`. Une valeur erronée (`http://`, un `www.` en trop, une barre oblique
finale) produit des liens dont la signature ne correspondra pas, et **toute
vérification d'adresse échouera** : l'élève est renvoyé vers
`/verification-email?statut=invalide` (« لم يعد هذا الرابط صالحًا »), comme
pour un lien expiré. La valeur attendue,
vérifiée contre la structure réelle du serveur, produit :

```
https://smarter-academy.fr/api/v1/auth/email/verify/{id}/{hash}?expires=…&signature=…
```

**`FRONTEND_URL`** sert de base à la redirection de retour Google. Elle vient de
la configuration et jamais de la requête — c'est ce qui empêche une redirection
ouverte. Si le fichier contient deux lignes `FRONTEND_URL` (le modèle en a deux),
c'est la **dernière** qui gagne : n'en garder qu'une.

---

## 3. Variables NOUVELLES à ajouter

### 3.1 Documents légaux

```dotenv
LEGAL_TERMS_VERSION=2026-10-04
LEGAL_PRIVACY_VERSION=2026-10-04
```

Ces deux valeurs ont un défaut identique dans `config/legal.php` : si elles sont
absentes du `.env`, l'application fonctionne quand même. Les écrire explicitement
reste préférable — c'est la version que le serveur inscrira dans
`users.terms_accepted_version` au moment où un élève coche la case.

> Règle : toute modification de fond des pages `/cgu` ou `/confidentialite`
> impose une nouvelle date ici. Sinon on modifie ce que les élèves sont réputés
> avoir accepté.

### 3.2 Google — « Continuer avec Google »

```dotenv
GOOGLE_CLIENT_ID=<identifiant client OAuth 2.0, depuis Google Cloud Console>
GOOGLE_CLIENT_SECRET=<secret client OAuth 2.0, depuis Google Cloud Console>
GOOGLE_REDIRECT_URI=https://smarter-academy.fr/api/v1/auth/google/callback
```

- Les trois sont **strictement côté serveur**.
- `GOOGLE_REDIRECT_URI` doit être **identique au caractère près** à l'URI
  autorisée dans la console Google (schéma, hôte, chemin, aucune barre finale).
  Cette URL a été vérifiée contre les routes réelles de l'application.
- Si ces trois variables sont absentes ou vides, l'application ne casse pas :
  `/auth/google/redirect` répond `503` et le reste du site fonctionne
  normalement. **Le bouton Google peut donc être activé après coup.**

### 3.3 Courriel (SMTP)

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_SCHEME=smtps
MAIL_USERNAME=contact@smarter-academy.com
MAIL_PASSWORD=<mot de passe de la boîte>
MAIL_FROM_ADDRESS=contact@smarter-academy.com
MAIL_FROM_NAME="Smarter Academy"
```

- **`MAIL_ENCRYPTION` n'existe plus** : ce Laravel (13) lit `MAIL_SCHEME`
  (`config/mail.php`). Sans lui, le port 465 suffit à choisir `smtps`
  (`MailManager`), mais l'écrire évite toute ambiguïté.
- **`MAIL_FROM_ADDRESS` = `MAIL_USERNAME`** : Hostinger refuse un expéditeur
  qui n'est pas la boîte authentifiée.
- Le mot de passe est celui de la boîte (hPanel › E-mails › la boîte ›
  « Changer le mot de passe » s'il est inconnu). S'il contient `#`, un espace
  ou `"`, l'écrire entre guillemets.
- La configuration n'est jamais mise en cache par le déploiement : une
  modification du `.env` s'applique à la requête suivante.

Voir le § SMTP du guide de déploiement pour ce qu'il faut récupérer chez
l'hébergeur. **Aucune de ces valeurs n'est inventée ici** : elles viennent du
panneau courriel Hostinger.

⚠ **`MAIL_MAILER=log` est le défaut de Laravel** (`config/mail.php` ligne 17).
Si la variable est absente du `.env` de production, **aucun courriel ne part** :
les messages sont écrits dans `storage/logs/laravel.log` et l'élève n'en reçoit
jamais aucun, sans la moindre erreur visible. C'est le piège principal de ce
déploiement.

À l'inverse, des identifiants SMTP **faux** produisent une vraie erreur — elle
est journalisée dans le même fichier, mais n'interrompt plus l'inscription
(réponse `verificationEmailSent: false`, renvoi en `503`, depuis le
2026-10-07). Dans les deux cas, l'élève ne reçoit rien : seul le journal le
dit.

---

## 4. Interdits absolus — côté frontend

Le frontend est un SPA : **tout ce qu'il contient est lisible par n'importe quel
visiteur**. Une variable `VITE_*` n'est pas une configuration privée, c'est du
texte publié.

Ne jamais créer :

```
VITE_GOOGLE_CLIENT_SECRET     ❌
VITE_STRIPE_SECRET            ❌
VITE_MAIL_PASSWORD            ❌
VITE_GOOGLE_CLIENT_ID         ❌ (inutile : le flux part du serveur)
```

Vérifié le 2026-09-12 : le frontend n'utilise **qu'une seule** variable
d'environnement, `VITE_API_URL`. Aucun secret n'y transite.

---

## 5. Contrôle final avant de fermer le fichier

- [ ] `APP_ENV=production` et `APP_DEBUG=false`
- [ ] `APP_URL=https://smarter-academy.fr` (https, sans barre finale)
- [ ] `FRONTEND_URL` présente **une seule fois**
- [ ] `APP_KEY` **inchangée**
- [ ] `STRIPE_WEBHOOK_TOLERANCE=300` **inchangée**
- [ ] `DB_*` inchangées
- [ ] `LEGAL_TERMS_VERSION` / `LEGAL_PRIVACY_VERSION` présentes
- [ ] `MAIL_MAILER=smtp` (surtout pas `log`), `MAIL_SCHEME=smtps`, port 465
- [ ] `MAIL_FROM_ADDRESS=contact@smarter-academy.fr`
- [ ] `GOOGLE_*` présentes, ou volontairement laissées vides pour plus tard
- [ ] aucune variable `VITE_*` secrète
