# Déploiement Smarter Academy par le File Manager Hostinger

Guide écrit pour **ce projet** et pour **une méthode de déploiement sans accès
terminal ni SSH** : hPanel → File Manager (téléversement de fichiers) et
hPanel → phpMyAdmin (exécution de SQL).

Objet du déploiement : le chantier **légal + authentification** — consentement
aux CGU/confidentialité, vérification d'adresse par courriel, et connexion
« Continuer avec Google ».

> **Rien n'a été déployé.** Ce dépôt n'a pas été modifié en production, aucun
> commit n'a été créé. Les archives décrites ici sont construites localement.

---

## 0. Résumé — ce qui est prêt et ce qui vous reste à faire

| | |
|---|---|
| ✅ Archive API prête | `build/deploy/smarter-api-deploy.zip` (11 Mo) |
| ✅ Archive SPA prête | `build/deploy/smarter-web-deploy.zip` (8,4 Mo) |
| ✅ SQL prêt et **testé sur copie de la base** | `docs/deployment/HOSTINGER_AUTH_MIGRATION.sql` |
| ✅ `vendor/` construit sans dépendances de développement | inclus dans l'archive API |
| ⚠ À votre charge | créer la boîte `contact@smarter-academy.fr` et récupérer les réglages SMTP |
| ⚠ À votre charge | créer les identifiants OAuth dans Google Cloud Console |
| ⚠ À votre charge | éditer `public_html/api/.env` |

**Aucun blocage dû à l'absence de terminal.** Le détail est au § 7.

---

## 1. La structure réelle du serveur (constatée, non supposée)

Vérifiée le 2026-09-12 en interrogeant `https://smarter-academy.fr` :

```
public_html/                     ← le SPA (React compilé)
├── index.html                        `/` sert le SPA
├── assets/
├── .htaccess                         renvoie tout vers index.html, SAUF /api
└── api/                         ← LARAVEL, application complète
    ├── .htaccess                     réécrit vers public/  (RewriteRule ^(.*)$ public/$1)
    ├── .env                          ← les secrets vivent ici
    ├── artisan
    ├── composer.json / composer.lock
    ├── app/  bootstrap/  config/  database/  resources/  routes/
    ├── storage/                      ← NE JAMAIS ÉCRASER (§ 4)
    ├── vendor/
    └── public/                       index.php, favicon.ico, robots.txt
```

Preuves relevées :

- `/api/v1/auth/login` en POST répond `422` (validation Laravel) → Laravel traite bien `/api/v1/*`.
- `/api/` affiche la page 404 **de Laravel** → le framework est monté là.
- `/api/vendor/autoload.php`, `/api/composer.json`, `/api/artisan`, `/api/app/...` renvoient `404`
  → les fichiers internes ne sont pas servis par le web. La réécriture `.htaccess` vers `public/`
  est ce qui protège l'application. **Ne pas modifier ce `.htaccess`.**
- `/.env` et `/api/storage/logs/laravel.log` renvoient `403`.

**Cette structure fonctionne. Elle n'est pas modifiée par ce déploiement.**

---

## 2. Ordre des opérations

L'ordre compte. Le code nouveau attend des colonnes qui n'existent pas encore ;
si on le téléverse avant la migration, l'inscription tombe en erreur pendant
l'intervalle.

```
1. SAUVEGARDE (base + dossier api/)      ← non négociable
2. SQL dans phpMyAdmin                    (§ 3)
3. Téléversement de l'API                 (§ 4)
4. Édition du .env                        (§ 5)
5. Téléversement du SPA                   (§ 6)
6. Tests post-déploiement                 (§ 9)
```

Entre l'étape 2 et l'étape 3, le site **continue de fonctionner** : les trois
migrations sont purement additives, l'ancien code ignore simplement les
nouvelles colonnes.

---

## 3. Base de données — phpMyAdmin

### 3.1 Sauvegarder d'abord

hPanel → **Bases de données** → phpMyAdmin → sélectionner la base →
**Exporter** → méthode « Rapide », format SQL → **Exécuter**. Conserver le
fichier : c'est le seul retour arrière possible (§ 10).

### 3.2 Exécuter la migration

phpMyAdmin → base → onglet **SQL** → coller **tout** le contenu de
`docs/deployment/HOSTINGER_AUTH_MIGRATION.sql` → **Exécuter**.

Les trois migrations concernées :

| # | Fichier | Table | Effet | Additif | Destructif |
|---|---|---|---|---|---|
| 1 | `2026_09_18_000001_add_legal_consent_to_users_table` | `users` | + `terms_accepted_version` varchar(32) NULL, + `privacy_policy_accepted_version` varchar(32) NULL, + `legal_consent_at` timestamp NULL | ✅ | ❌ |
| 2 | `2026_09_18_000002_create_user_identities_table` | `user_identities` (nouvelle) | table + FK `user_id`→`users` (ON DELETE CASCADE) + 2 index UNIQUE | ✅ | ❌ |
| 3 | `2026_09_18_000003_make_password_nullable_on_users_table` | `users` | `password` varchar(255) NOT NULL → NULL | ✅ | ❌ |

### 3.3 Pourquoi ce SQL est fiable

Il **n'a pas été écrit à la main**. Procédure suivie :

1. Une base jetable a été créée à partir de la sauvegarde de production
   (`smart-academy-db (2).sql`, 15 comptes, 46 migrations, lot 16).
2. `php artisan migrate --pretend` a produit les instructions exactes.
3. `php artisan migrate` a été réellement exécuté sur cette copie.
4. Le fichier SQL livré a été exécuté sur une **seconde** copie neuve.
5. Les deux schémas résultants ont été comparés : **`diff` vide, identiques**.

Après exécution, sur la copie : 15 comptes intacts, 0 mot de passe perdu,
**11 comptes toujours non vérifiés** (aucune date fabriquée), 0 identité Google,
trois lignes ajoutées dans `migrations`.

### 3.4 Si le SQL est exécuté deux fois

Testé : la seconde exécution **s'arrête à la première instruction** sur
`ERROR 1060 Duplicate column name 'terms_accepted_version'` et **ne modifie
rien** (comptes et lignes de `migrations` inchangés). Une double exécution
accidentelle est donc sans conséquence — il suffit d'ignorer l'erreur.

### 3.5 Le journal des migrations

Le fichier insère aussi trois lignes dans la table `migrations`. Sans elles, un
futur `php artisan migrate` rejouerait ces migrations et échouerait. Le numéro
de lot est **calculé par la requête** (`MAX(batch)+1`) et non codé en dur, pour
rester juste même si la production n'est pas exactement au lot 16.

---

## 4. Téléverser l'API

### 4.1 Ce qu'il faut téléverser

`build/deploy/smarter-api-deploy.zip` contient un dossier `api/` avec :

```
api/app/          api/bootstrap/    api/config/     api/database/
api/public/       api/resources/    api/routes/     api/vendor/
api/artisan       api/composer.json api/composer.lock
api/.htaccess     api/storage/  (arborescence VIDE, voir 4.3)
```

Marche à suivre : File Manager → `public_html/` → **Upload** l'archive →
clic droit → **Extract**. Le dossier `api/` du zip fusionne avec `public_html/api/`
en remplaçant les fichiers de même nom.

> Si vous préférez remplacer dossier par dossier, ceux-ci peuvent être
> **entièrement remplacés** sans risque : `app/`, `bootstrap/` (sauf `cache/`),
> `config/`, `database/`, `public/`, `resources/`, `routes/`, `vendor/`,
> plus `artisan`, `composer.json`, `composer.lock`.

### 4.2 Ce qu'il ne faut **jamais** téléverser

| À exclure | Raison |
|---|---|
| `.env` | Les secrets de production vivent **uniquement** sur le serveur. L'archive n'en contient aucun (vérifié). |
| `.env.hostinger`, `.env.example` | Fichiers de travail locaux ; `.env.hostinger` contient de vraies clés. |
| `tests/`, `phpunit.xml`, `phpunit.local.xml` | Inutiles en production, et exposent la structure interne. |
| `node_modules/`, `.git/`, `.gitignore` d'origine | Sans objet côté serveur. |
| `storage/logs/*.log` | Journaux locaux. |
| `bootstrap/cache/*.php` | **Voir § 7 — c'est le piège le plus dangereux.** |
| `vite.config.js`, `package.json` (côté API) | Reliquats front. |
| Le dump `smart-academy-db (2).sql` | Base complète en clair. |

L'archive livrée a été contrôlée : elle ne contient **aucun** `.env`,
**aucun** fichier de test, **aucun** journal.

### 4.3 Dossiers à **ne pas écraser** — données vivantes

```
public_html/api/storage/          ← NE PAS REMPLACER
├── app/public/     fichiers éventuellement déposés par les utilisateurs
├── framework/      cache, sessions, vues compilées
└── logs/           journaux d'exécution
```

L'archive contient l'arborescence `storage/` **vide**, uniquement pour le cas
d'une installation neuve. En mise à jour, **ne pas extraire par-dessus le
`storage/` existant** — ou, plus simplement, extraire puis vérifier que
`storage/` contient toujours ses sous-dossiers et reste **inscriptible (755)**.

Vérification rapide après extraction : `storage/` et `bootstrap/cache/` doivent
être accessibles en écriture, sinon Laravel renvoie une erreur 500.

---

## 5. Le fichier `.env`

File Manager → `public_html/api/.env` → **Edit**.

Le détail complet, variable par variable, est dans
**`HOSTINGER_AUTH_ENV_CHECKLIST.md`**. En résumé, il faut :

- **ne pas toucher** à `APP_KEY`, `DB_*`, aux variables Stripe, et surtout pas
  à `STRIPE_WEBHOOK_TOLERANCE=300` ;
- **vérifier** `APP_ENV=production`, `APP_DEBUG=false`,
  `APP_URL=https://smarter-academy.fr`, `FRONTEND_URL=https://smarter-academy.fr` ;
- **ajouter** `LEGAL_TERMS_VERSION`, `LEGAL_PRIVACY_VERSION`, les trois
  `GOOGLE_*` et les huit `MAIL_*`.

⚠ `APP_URL` conditionne la **signature** des liens de vérification d'adresse.
Une valeur approximative rend tous ces liens invalides sans message d'erreur
compréhensible.

---

## 6. Téléverser le SPA

`build/deploy/smarter-web-deploy.zip` → extraire dans **`public_html/`**
(à la racine, pas dans un sous-dossier).

Il contient `index.html`, `assets/`, `.htaccess`, `robots.txt`, `sitemap.xml`,
`CV.pdf`, le logo. Le bundle a été compilé avec
`VITE_API_URL=https://smarter-academy.fr/api/v1` (vérifié dans le fichier
compilé).

⚠ **Ne pas supprimer `public_html/api/`** en nettoyant la racine : c'est
l'application Laravel.

⚠ Les noms de fichiers dans `assets/` contiennent une empreinte
(`index-DLZP9aTQ.js`). Les anciens fichiers ne gênent pas, mais peuvent être
supprimés une fois le nouveau site vérifié.

---

## 7. Le problème du cache de configuration — **résolu, mais à connaître**

C'est le point qui aurait pu bloquer un déploiement sans terminal.

Laravel peut figer sa configuration dans `bootstrap/cache/config.php`. Ce
fichier, s'il existe, **prend le pas sur `.env`** : les nouvelles variables
(Google, SMTP, versions légales) seraient tout simplement ignorées, et
`php artisan config:clear` serait indispensable — donc un terminal.

**Constat : ce fichier n'existe pas dans ce projet.** `bootstrap/cache/` ne
contient que `packages.php` et `services.php`, et aucun cache de routes ni
d'événements. La configuration est donc **lue dynamiquement depuis `.env`** à
chaque requête. Modifier `.env` via le File Manager suffit, sans aucune commande.

> **Il n'y a donc pas de blocage.** Mais la règle à retenir : ne jamais créer
> `bootstrap/cache/config.php` sur ce serveur tant qu'il n'y a pas de terminal
> pour le régénérer.

### 7.1 Le vrai piège : `bootstrap/cache/packages.php`

Découvert en testant l'archive : le `packages.php` généré **en local** liste les
paquets de développement (`laravel/pail`, `laravel/pao`). Téléversé tel quel sur
un serveur dont le `vendor/` est construit sans dépendances de développement,
il provoque une **erreur fatale immédiate** :

```
Class "Laravel\Pail\PailServiceProvider" not found
```

→ le site entier tombe en erreur 500.

**L'archive livrée a été purgée de ces fichiers** (`bootstrap/cache/` ne contient
que son `.gitignore`). Laravel les régénère tout seul à la première requête.
**Ne jamais téléverser un `bootstrap/cache/*.php` produit en local.**

### 7.2 Ce que `vendor/` contient

Construit avec `composer install --no-dev --optimize-autoloader` **à partir de
`composer.lock` uniquement** (aucun `composer update`), en ciblant PHP 8.4 —
la version réellement servie en production (`x-powered-by: PHP/8.4.19`), et non
le PHP 8.5 de la machine locale.

- 84 paquets de production, `'dev' => false` dans `vendor/composer/installed.php`
- `laravel/socialite v5.31.0` présent, avec ses dépendances transitives :
  `league/oauth1-client`, `firebase/php-jwt`, `phpseclib/phpseclib`,
  `guzzlehttp/guzzle`, `paragonie/constant_time_encoding`
- aucun paquet de test (`phpunit`, `mockery`, `faker`, `collision`) — seul
  `nunomaduro/termwind` est présent, et c'est bien une dépendance de production
- 55 Mo décompressés, contre 102 Mo pour le `vendor/` de développement

Vérifié : l'application démarre avec ce `vendor/` et expose les quatre nouvelles
routes d'authentification.

---

## 8. Les deux services externes à configurer

### 8.1 SMTP — indispensable

**La vérification d'adresse ne peut pas fonctionner sans SMTP réel.** En
développement, `MAIL_MAILER=log` écrit les courriels dans un fichier ; c'est
aussi le **défaut de Laravel**, donc l'état dans lequel se trouve l'application
si la variable est absente.

À récupérer dans hPanel → **Emails** → *Comptes e-mail* :

| Variable | Où la trouver |
|---|---|
| `MAIL_HOST` | Paramètres de configuration du client mail (Hostinger : `smtp.hostinger.com`) |
| `MAIL_PORT` | `465` (SSL) ou `587` (TLS) |
| `MAIL_ENCRYPTION` | `ssl` pour 465, `tls` pour 587 |
| `MAIL_USERNAME` | l'adresse complète : `contact@smarter-academy.fr` |
| `MAIL_PASSWORD` | le mot de passe défini à la création de la boîte |

Préalable : **créer la boîte `contact@smarter-academy.fr`** si elle n'existe pas
(hPanel → Emails → Créer un compte e-mail).

`MAIL_FROM_ADDRESS=contact@smarter-academy.fr` et `MAIL_FROM_NAME="Smarter Academy"`.

> Aucune valeur n'est inventée dans ce guide : les quatre premières lignes
> viennent du panneau Hostinger, la cinquième est le mot de passe que **vous**
> choisissez.

> L'adresse expéditrice doit appartenir au domaine, sinon les messages partent
> en indésirables ou sont refusés. `contact@smarter-academy.fr` convient.

### 8.2 Google Cloud Console

Console Google Cloud → **APIs & Services** → **Credentials** →
*Create credentials* → **OAuth client ID** → type **Web application**.

**URI de redirection autorisée — exactement cette chaîne :**

```
https://smarter-academy.fr/api/v1/auth/google/callback
```

Vérifiée contre les routes réelles de l'application (`php artisan route:list`).
Aucun caractère en plus, pas de barre oblique finale, `https` obligatoire.
Toute divergence provoque un `redirect_uri_mismatch` côté Google.

À renseigner également :

- **Authorized JavaScript origins** : `https://smarter-academy.fr`
- **Écran de consentement OAuth** : nom de l'application, adresse d'assistance,
  liens vers `https://smarter-academy.fr/cgu` et
  `https://smarter-academy.fr/confidentialite` (les deux pages existent).
- **Portées** : `openid`, `profile`, `email` uniquement. L'application ne
  demande **aucun** accès à Gmail, Drive ou aux contacts.

Puis reporter `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans le `.env`
**du serveur** (§ 5).

#### Garanties de sécurité vérifiées dans le code

- Le **secret client ne quitte jamais le serveur** : l'échange du code contre
  l'identité se fait dans `GoogleAuthController::fetchIdentity()`. Aucune route
  ne l'expose ni ne l'accepte.
- **Aucune variable `VITE_GOOGLE_*`** : le frontend n'utilise qu'une seule
  variable d'environnement, `VITE_API_URL`.
- **Adresse vérifiée exigée** : `email_verified` absent de la réponse Google est
  traité comme **faux**. Une adresse non prouvée est refusée *avant* toute
  recherche de compte.
- **L'identité repose sur le `sub` Google**, jamais sur le courriel (qui peut
  changer ou être réattribué). L'unicité `(provider, provider_user_id)` est
  imposée par la **base**, pas par du code.
- **Rattachement protégé** : un compte n'est créé qu'après consentement
  explicite ; une identité Google ne peut pas appartenir à deux comptes.
- **Aucun jeton Google n'est stocké** — ni accès, ni rafraîchissement.
- **Pas de redirection ouverte** : l'URL de retour vient de `FRONTEND_URL`
  (configuration), jamais de la requête.

---

## 9. Tests après déploiement

À faire dans cet ordre. Les trois premiers ne créent aucune donnée.

1. **Le site répond** — `https://smarter-academy.fr/` affiche l'accueil.
2. **Les nouvelles routes existent** —
   `https://smarter-academy.fr/api/v1/legal/versions` doit renvoyer du JSON avec
   les deux versions. *Avant déploiement, cette URL renvoie `404`* : c'est le
   témoin le plus simple que le nouveau code est bien en place.
3. **Le mode debug est fermé** — `https://smarter-academy.fr/api/v1/inexistant`
   renvoie `{"message": "..."}` **sans** trace d'exécution.
4. **Les pages légales** — `/cgu`, `/confidentialite`, `/mentions-legales`.
5. **Connexion existante** — se connecter avec un compte déjà en base.
   *C'est le test de non-régression le plus important.*
6. **Inscription** — créer un compte de test : la case de consentement doit être
   obligatoire, et un courriel de vérification doit **arriver réellement**.
7. **Vérification d'adresse** — cliquer le lien reçu ; il doit mener à un compte
   vérifié. En cas d'échec, soupçonner `APP_URL` (§ 5).
8. **Google** — « Continuer avec Google » sur un compte Google neuf : écran de
   consentement, puis création. Puis retenter : connexion directe.
9. **Paiement** — vérifier qu'un abonnement existant reste actif et que
   `/abonnement` s'affiche. Le déploiement ne touche pas à Stripe, mais c'est la
   fonction la plus coûteuse en cas de régression.
10. **Console du navigateur** — aucune erreur rouge, aucune requête en échec.

---

## 10. Retour arrière

| Problème | Geste |
|---|---|
| Le site tombe en 500 après téléversement | Supprimer `public_html/api/bootstrap/cache/*.php` (§ 7.1). C'est la cause la plus probable. |
| Erreur de permission | Remettre `storage/` et `bootstrap/cache/` en 755, inscriptibles. |
| Le code pose problème | Ré-extraire la sauvegarde du dossier `api/` faite au § 2. |
| La base pose problème | Réimporter l'export phpMyAdmin du § 3.1, **ou** exécuter le bloc ROLLBACK commenté en fin de `HOSTINGER_AUTH_MIGRATION.sql`. |
| Les courriels ne partent pas | Vérifier `MAIL_MAILER=smtp` (et non `log`) puis les identifiants SMTP. |
| Google refuse la connexion | `redirect_uri_mismatch` → l'URI de la console Google diffère de `GOOGLE_REDIRECT_URI`. |

⚠ **Le rollback SQL n'est sûr que si aucun compte Google n'a encore été créé.**
Le bloc de rollback le rappelle et fournit la requête de contrôle. Repasser
`password` en `NOT NULL` alors qu'un compte Google existe obligerait à lui
inventer un mot de passe.

⚠ **La sauvegarde de la base est le seul vrai filet.** Il n'y a pas de
`php artisan migrate:rollback` sans terminal.

---

## 11. Comptes existants — ce qui ne doit pas être fait

- **Ne pas supprimer les comptes de production.**
- **Ne pas exécuter `smarter:purge-students`** (commande console qui supprime
  tous les comptes élèves ; elle n'est de toute façon pas atteignable sans
  terminal, et ne doit pas l'être).
- **Ne pas fabriquer de `email_verified_at`.** Les comptes créés avant ce
  déploiement n'ont jamais prouvé leur adresse. Sur la copie de test,
  **11 comptes sur 15** sont dans ce cas : ils restent `NULL`, ce qui est la
  vérité. Leur sort se décidera séparément.
- **Ne pas remplir `legal_consent_at` rétroactivement.** Ces élèves n'ont pas
  accepté les documents — l'écran n'existait pas. Une date inventée serait une
  preuve de consentement fabriquée.

Le SQL livré respecte ces quatre règles : il ne contient ni `UPDATE`, ni
`DELETE`, ni `DROP` sur les données existantes.

---

## 12. Verdict

**PRÊT POUR UN DÉPLOIEMENT PAR FILE MANAGER.**

Aucune opération de ce déploiement n'exige un terminal :

- les dépendances PHP sont **pré-construites** dans l'archive (pas de Composer
  sur le serveur) ;
- les migrations sont fournies en **SQL exécutable dans phpMyAdmin**, vérifié
  par comparaison de schéma avec `artisan migrate` ;
- la configuration est **lue dynamiquement** depuis `.env` — aucun
  `config:clear` n'est nécessaire (§ 7) ;
- les caches susceptibles de casser le site ont été **retirés de l'archive**.

Deux conditions préalables restent à votre main, et ne relèvent pas du serveur :
obtenir les **identifiants SMTP** et créer les **identifiants Google OAuth**.
Tant qu'ils manquent, le reste du site fonctionne : sans Google, la route
répond `503` et le bouton est simplement inopérant ; sans SMTP, tout marche
**sauf** l'arrivée réelle des courriels de vérification.
