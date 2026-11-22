# Premier déploiement algérien — `smarter-academy.com`

> Ce document décrit le **BOOTSTRAP**, c'est-à-dire le premier dépôt de
> fichiers sur un compte Hostinger vide. Il ne se fait qu'**une seule fois**.
>
> Les déploiements SUIVANTS sont automatiques : `.github/workflows/deploy.yml`
> part à chaque poussée sur `main`. Ce workflow refuse délibérément de
> s'exécuter tant que le bootstrap n'a pas eu lieu — voir §6.
>
> Ne pas confondre avec `HOSTINGER_FILE_MANAGER_DEPLOYMENT.md`, qui décrit
> une MISE À JOUR du serveur **français** déjà en service.

---

## 0. État constaté (2026-09-16)

Vérifié en interrogeant le domaine, pas supposé :

| | |
|---|---|
| Domaine | `smarter-academy.com` (IP ≠ celle du produit français — master spec §2 ✅) |
| PHP servi | **8.4.19** (relevé après correction ; voir §1) |
| Contenu servi | page « Page par défaut » de Hostinger → **compte vide** |
| `/api/v1/...` | `404` → aucun backend déployé |
| Base de données | `u181216890_smarter_dz_db` créée, **vide** |
| Clé SSH de déploiement | `smarter-academy-dz`, autorisée ✅ |
| Secrets GitHub | les 5 `HOSTINGER_*` posés ✅ |
| Variables GitHub | `PRODUCTION_URL`, `VITE_API_URL` posées ✅ |

---

## 1. PHP 8.4 — non négociable

`composer.json` annonce `php ^8.3`, mais `composer.lock` épingle
`symfony/* 8.1.x`, qui exige `php >=8.4.1`.

Un serveur en 8.3 ne peut **pas** installer ce backend : `composer install`
s'arrête sur 17 conflits. Pire, un `vendor/` construit ailleurs en 8.4 se
copie sans la moindre erreur sur un hôte en 8.3 — et le site répond **500**
après coup, sans rien dans les journaux de déploiement.

hPanel → **Avancé → Configuration PHP → 8.4**.

`deploy.yml` lit désormais l'en-tête `x-powered-by` du domaine avant de
construire `vendor/`, et s'arrête avec ce remède écrit en clair. Si le
domaine ne répond pas (curl exit 28, 2 essais de 30 s), la vérification est
sautée avec un avertissement : un serveur lent ne bloque plus le déploiement
(échec du 2026-10-02 sur les unités 5-8).

---

## 2. Ordre des opérations

L'ordre compte : le SPA qui arrive avant l'API afficherait une interface dont
chaque appel échoue.

```
1. PHP 8.4 dans hPanel                    (§1)
2. Schéma de la base dans phpMyAdmin      (§3)
3. Téléverser l'API      → public_html/api/     (§4)
4. Écrire le .env        → public_html/api/.env (§5)
5. Téléverser le SPA     → public_html/          (§6)
6. Tests                                   (§7)
```

---

## 3. La base de données

`u181216890_smarter_dz_db` est vide. Le dépôt applique le schéma par **SQL
relu dans phpMyAdmin**, jamais par migration automatique : c'est une règle du
projet, pas une commodité (voir `HOSTINGER_FILE_MANAGER_DEPLOYMENT.md` §3).

Le schéma doit exister **avant** que l'API ne réponde, sinon toute route
touchant la base renvoie 500.

> ⚠️ Le mot de passe MySQL communiqué pendant la mise en place doit être
> **changé** : il a transité par un canal de discussion. hPanel → Bases de
> données → Modifier le mot de passe, puis reporter la nouvelle valeur dans
> `.env` (§5).

---

## 4. Téléverser l'API

Archive : **`2-api.zip`**

hPanel → **Gestionnaire de fichiers** → `domains/smarter-academy.com/public_html/`
→ créer le dossier **`api`** → y téléverser l'archive → **Extraire**.

L'archive est produite exactement avec les exclusions du workflow, donc elle
ne contient **ni** `.env`, **ni** `tests/`, **ni** `phpunit.xml`, **ni**
`node_modules/`, **ni** `bootstrap/cache/`, et son `vendor/` est construit en
`--no-dev` (ni PHPUnit, ni Pail, ni Mockery — vérifié).

Ce qu'elle contient et qu'il ne faut pas toucher :

- **`api/.htaccess`** — réécrit tout vers `public/`. C'est CE fichier qui
  empêche le web de servir `.env`, `vendor/`, `app/`. Ne pas le modifier.
- `api/public/.htaccess` — le routage interne de Laravel.

Après extraction, créer les dossiers d'état que l'archive n'emporte pas
(ils appartiennent au serveur) :

```
api/storage/framework/cache/
api/storage/framework/sessions/
api/storage/framework/views/
api/storage/logs/
api/bootstrap/cache/
```

Permissions : `storage/` et `bootstrap/cache/` doivent être **inscriptibles**
(755, ou 775 si le serveur l'exige).

---

## 5. Le fichier `.env`

Fichier : **`3-env-template.txt`** → à enregistrer sous `public_html/api/.env`

Il contient déjà une **`APP_KEY` générée pour l'Algérie** (différente de
celle du produit français : deux clés distinctes, master spec §2).

Six valeurs sont à remplacer, marquées `REMPLACER` :

| Clé | Valeur |
|---|---|
| `DB_PASSWORD` | le mot de passe MySQL (le NOUVEAU, après rotation) |
| `MAIL_HOST` / `MAIL_USERNAME` / `MAIL_PASSWORD` | le SMTP Hostinger |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console |

Points déjà réglés dans le modèle :

- `APP_DEBUG=false` — un `true` ici afficherait la trace complète, secrets
  compris, à n'importe quel visiteur.
- `APP_LOCALE=ar` — les messages rendus par Laravel lui-même (validation,
  réinitialisation) suivent l'interface arabe.
- `SESSION_DOMAIN` / `SANCTUM_STATEFUL_DOMAINS` sur `smarter-academy.com`.
- Stripe n'est pas configuré : l'accès payant algérien passe par les codes
  d'activation (§17/§18). Ne pas poser `BILLING_MODE=live`.

Pour Google, l'URI de redirection à déclarer côté Google Cloud est
exactement :

```
https://smarter-academy.com/api/v1/auth/google/callback
```

**Ce fichier ne doit jamais entrer dans le dépôt.** Le workflow ne l'écrit
pas, ne le remplace pas, et vérifie par empreinte md5 qu'il est identique
avant et après chaque déploiement.

---

## 6. Téléverser le SPA

Archive : **`1-spa-public_html.zip`** → à extraire dans `public_html/`
(à côté de `api/`, pas dedans).

Le lot a été construit avec `VITE_API_URL=https://smarter-academy.com/api/v1`,
valeur **compilée dans le bundle** — vérifié présent, et sans repli
`localhost`.

Il emporte `public_html/.htaccess`, qui renvoie toutes les routes vers
`index.html` **sauf `/api`**. Sans lui, un lien profond (`/courses`,
`/espace/...`) renvoie 404.

Depuis le 2026-09-25 il porte aussi le cache : `index.html` en
`no-cache, must-revalidate`, et `public_html/assets/.htaccess` met les
fichiers hachés en `max-age=31536000, immutable` (l'hébergeur envoyait
`no-store` partout). Détail : `docs/architecture/BUNDLE_BOUNDARIES.md` §8.

---

## 7. Tests après bootstrap

```bash
# Le SPA répond et monte React
curl -s https://smarter-academy.com/ | grep -c 'id="root"'

# Laravel s'exécute réellement (route publique, sans base)
curl -s https://smarter-academy.com/api/v1/legal/versions   # attendu : {"success":true,...}

# Le repli SPA fonctionne sur un lien profond
curl -o /dev/null -w '%{http_code}\n' https://smarter-academy.com/courses   # attendu : 200

# Les internes de Laravel NE sont PAS servis
curl -o /dev/null -w '%{http_code}\n' https://smarter-academy.com/api/.env          # attendu : 403 ou 404
curl -o /dev/null -w '%{http_code}\n' https://smarter-academy.com/api/composer.json # attendu : 403 ou 404
```

L'interface doit s'afficher **en arabe, de droite à gauche**, en police Cairo.

---

## 8. Ensuite : plus jamais à la main

Une fois `api/artisan` et `api/.env` en place, la garde de `deploy.yml` est
satisfaite et **chaque poussée sur `main` déploie**.

Le workflow reste volontairement prudent :

- `rsync` **sans `--delete`** — rien n'est jamais supprimé du serveur ;
- `.env`, `storage/`, `bootstrap/cache/` exclus du transfert ;
- **migrations appliquées automatiquement**, mais JAMAIS sans sauvegarde : le
  dump s'exécute dans son étape à lui, et son échec arrête le déploiement avant
  que le schéma ne soit touché (voir « Le schéma » plus bas) ;
- les caches sont vidés, jamais chauffés (`config:cache` écrirait un
  `config.php` qui prendrait le pas sur `.env`) ;
- il refuse de partir si un domaine `smarter-academy.fr` apparaît dans ses
  variables (master spec §2).


## Unité 1 du manuel (phase 8) — à appliquer sur Hostinger

1. **Schéma** : `docs/deployment/HOSTINGER_UNIT1_MIGRATION.sql` (cinq migrations additives + lignes `migrations`). Sauvegarder, relire, exécuter dans phpMyAdmin.
2. **Données** : `docs/deployment/HOSTINGER_UNIT1_CURRICULUM_DATA.sql`, généré par `php artisan smarter:curriculum-sql --grade=4am --retire-lesson=pgcd` — upserts PAR CODE, rejouables, sans DELETE, sans toucher `publication_status` **ni `tier`** d'une ligne existante (une leçon nouvelle naît `free`). Les nouveaux modules/ressources/exercices naissent `draft`. Depuis le 2026-09-25 le déploiement applique lui-même cette synchronisation (voir « Le curriculum : synchronisé par le pipeline »), ce fichier ne sert plus qu'à une base que le pipeline ne peut pas atteindre.
3. **Pratique** : livrée par le pipeline depuis le 2026-09-25 — voir « Le contenu de pratique : livré et vérifié par le pipeline ». (Avant, cette étape était manuelle et sa liste oubliait `active.json` : voir l'incident ci-dessous.)

## Enseignants, classes et offres configurables — à appliquer sur Hostinger

1. **Schéma + offres initiales** : `docs/deployment/HOSTINGER_TEACHER_PLANS_MIGRATION.sql`
   (douze migrations additives `2026_09_26_*` puis quatre `2026_09_27_*`
   — tarification par sièges —, lignes `migrations`, puis le miroir de
   `PlanSeeder` en upserts rejouables). Sauvegarder, relire, exécuter dans
   phpMyAdmin. Le bloc « VÉRIFICATION » doit rendre 11 tables, 10 + 3 + 4
   colonnes, 16 lignes de migration, 3 offres (dont la grille de 6 paliers de
   `teacher-seats`) et **exactement une** offre enseignant par défaut. Si `artisan` est disponible, l'équivalent est
   `php artisan migrate --force && php artisan db:seed --class=PlanSeeder --force`.
2. **`.env`** : `FRONTEND_URL` doit être l'URL publique du SPA — la
   vérification d'adresse y renvoie. Le lien de classe
   (`/rejoindre/classe/{jeton}`) est composé par le navigateur de
   l'enseignant sur sa propre origine : aucune variable. (Les variables
   `CLASSROOM_INVITATION_*` n'existent plus depuis le 2026-10-01 ; la
   migration `2026_10_01_000002` donne un lien à chaque classe existante.)
   Aucune limite commerciale n'est dans
   `.env` : elles sont dans les offres, modifiables depuis le panneau.
3. **Courriel** : les codes d'activation individuels et la vérification
   d'adresse partent par le pipeline mail existant (`MAIL_*`) — l'élève
   inscrit depuis un lien de classe rejoint au moment où il vérifie son
   adresse. Sans mail fonctionnel, un enseignant peut toujours partager son
   lien de classe ou donner son رمز الانضمام à l'oral,
   et l'administrateur voit le code individuel une fois à l'écran.
   Une panne SMTP ne casse plus l'inscription (depuis le 2026-10-07) : le
   compte est créé, la réponse porte `verificationEmailSent: false` et
   l'écran propose « إعادة إرسال البريد ». La panne n'est donc visible que
   dans `storage/logs/laravel.log` (exception de transport `report()`ée) —
   c'est là qu'il faut regarder si des élèves disent ne rien recevoir. Et
   `MAIL_MAILER=log` n'échoue jamais : il écrit le courriel dans ce même
   journal sans rien envoyer (voir `HOSTINGER_AUTH_ENV_CHECKLIST.md` § 3.3).
4. **Rien à faire pour les élèves existants** : sans classe, ils sont
   « indépendants » et `/content/availability` ne change pas ; leurs codes et
   droits actuels restent valides (colonnes ajoutées nullable).
5. **Après** : ouvrir `/admin/offres` et relire `teacher-free` (5 sièges,
   classes illimitées), la grille de `teacher-seats` (1–5 gratuit, 6–20 →
   1 000 DA, 21–30 → 800 DA, 31–50 → 700 DA, 51–100 → 600 DA, 101+ → 500 DA
   par élève) et `student-premium` — ce sont des valeurs de départ, pas des
   règles : elles se changent en publiant une nouvelle version. Une base
   Les noms et descriptions d'offre sont en ARABE (c'est ce que l'enseignant
   lit) ; une base semée avant cette règle garde ses anciens noms français et
   doit être corrigée depuis `/admin/offres`, offres archivées comprises.
   Une base semée AVANT le modèle par sièges garde son ancien `teacher-free` : publier
   une nouvelle version de cette offre (capacité 5, limites techniques vides)
   et archiver `teacher-basic` / `teacher-pro`. Contrat :
   `docs/architecture/TEACHER_CLASSROOM_ARCHITECTURE.md`.

## Le schéma : appliqué par le pipeline depuis le 2026-09-23

**Ce qui a changé, et pourquoi.** Jusqu'à cette date le workflow n'appliquait
jamais les migrations : le schéma passait par du SQL relu dans phpMyAdmin. Cette
politique a échoué exactement comme elle devait échouer — `main` a rattrapé cinq
versions d'un coup, 26 migrations ne sont jamais passées, et un déploiement
entièrement vert a laissé la production répondre 500 sur
`/content/availability`, `/student/study-context`, `/practice/notes` et
`/math-lab/documents`, avec « تعذّر الحفظ » dans le Math Lab.

Livrer du code sans son schéma n'est pas plus prudent que migrer : c'est le même
risque, pris en silence, et constaté par l'élève au lieu du pipeline.

Le déploiement fait donc maintenant, dans cet ordre :

1. **`smarter:db-backup`** — une sauvegarde complète, dans son étape à elle.
   Elle est la CONDITION PRÉALABLE : si elle échoue, le job s'arrête et le
   schéma n'est pas touché. Il n'y a pas d'option pour la sauter. La commande
   utilise `mysqldump` quand il existe et retombe sinon sur un export écrit avec
   la connexion PDO de Laravel — sur un hébergement mutualisé le binaire n'est
   pas garanti, et il faut qu'une copie existe TOUJOURS. Le fichier est écrit
   dans `api/storage/app/backups/`, hors racine web : il contient toutes les
   données d'élèves. Les dix dernières sont conservées.
2. **`php artisan migrate --force --no-interaction`** — avec l'état des
   migrations affiché avant et après. Si quelque chose reste `Pending` après
   coup, l'étape échoue au lieu de laisser croire que tout est passé.
3. **Vérification des points d'entrée qui dépendent du schéma.** L'ancienne
   sonde n'interrogeait que `/legal/versions`, qui ne touche aucune table
   récente : elle a répondu 200 pendant toute la panne. Les quatre points
   d'entrée ci-dessus sont maintenant sondés ; non authentifiés ils doivent
   répondre 401, et un 5xx fait échouer le déploiement. C'est la signature
   exacte d'une table ou d'une colonne manquante.

## Le contenu de pratique : livré et vérifié par le pipeline (2026-09-25)

L'API lit `content/practice/` **à l'exécution** — `active.json` (quelles
leçons ont la pratique), `index.generated.json` (quels exercices, à quel
niveau), les fichiers d'exercices et `misconceptions.json` — au chemin
`config('practice.*_path')`, par défaut `base_path('../../content/practice')`,
c'est-à-dire la disposition du dépôt (l'API vit dans `apps/api/`). Le
frontend, lui, embarque `active.json` **au build**.

**Incident du 2026-09-25.** Le pipeline ne livrait que `apps/api/`. En
production, le frontend proposait donc la pratique (liste embarquée) pendant
que le serveur n'avait aucune liste : chaque `GET /api/v1/lessons/{code}/
practice/overview` répondait **422** « La pratique n'est pas encore disponible
pour cette leçon » (constaté sur `qasim-adad-tabii`, première leçon de
l'unité). La procédure manuelle ci-dessus oubliait `active.json`, et les deux
lecteurs mettaient en cache une liste VIDE pendant une heure.

Désormais :

1. **« Deploy the practice content »** copie `content/practice/` vers
   `$REMOTE_PATH/api/../../content/practice/` — le même emplacement relatif
   qu'en local, hors de la racine web, sans variable `.env` à régler.
2. **« Verify the practice content »** (après le vidage des caches) lance
   `php artisan smarter:practice-doctor --expect-active=… --expect-index=…`
   avec les empreintes SHA-256 du commit déployé : fichier absent, liste vide,
   leçon active sans exercice, learning point absent de la base, ou copie
   périmée / lue ailleurs (`PRACTICE_CONTENT_PATH`, `PRACTICE_ACTIVE_PATH`)
   **font échouer le déploiement**.
3. Un fichier absent n'est plus mis en cache (`PracticeCapability`,
   `ExerciseRepository`) : dès qu'il arrive, il est lu.
4. Un refus de l'aperçu ou de l'ouverture d'une séance porte un motif clos :
   `code: practice_unavailable` (pas de pratique pour cette leçon, ou le
   serveur ne la voit pas) ou `lesson_unavailable` (palier, publication,
   masquée par l'enseignant) — statut 422 inchangé.

## Le curriculum : synchronisé par le pipeline depuis le 2026-09-25

Après la sauvegarde et les migrations, l'étape **« Synchronise the curriculum
mirror »** de `deploy.yml` aligne la base de production sur le catalogue qui
vient d'être livré, avec les MÊMES commandes qu'en local — il n'y a pas de
seconde synchronisation :

1. Dans la CI (qui a Node) : `exportCurriculum.mjs` et
   `exportContentRegistry.mjs` écrivent les deux exports dans
   `apps/api/database/curriculum-sync/` (ignoré par git), livrés avec l'API.
   Rien sous `api/` n'est servi en HTTP (`api/.htaccess` réécrit tout vers
   `public/`) — l'export du registre porte des clés de réponse.
2. Sur le serveur (sans `proc_open`, d'où `--from-json`) :
   `smarter:import-curriculum`, `smarter:import-content-registry`, puis
   `smarter:prune-retired-learning-points` (sans `--with-history`, refusé hors
   environnement local de toute façon) : il supprime uniquement une leçon que
   le catalogue ne déclare plus ET qu'aucun élève n'a touchée (ni preuve, ni
   progression, ni tentative de test final, ni séance de pratique).
3. `smarter:lesson-inventory --tiers-only` est capturé AVANT et APRÈS : si le
   palier d'une leçon existante a changé, **le déploiement échoue**. Puis
   `smarter:lesson-inventory` imprime les leçons de production (classe, unité,
   statut, publication, palier) dans le journal du job.

### Ce que la synchronisation touche, et ce qu'elle ne touche jamais

```text
touche     titres, descriptions, unités, points d'apprentissage, prérequis, modules, exercices, items
crée       une leçon nouvelle → publiée, tier = free ; un module / exercice nouveau → draft
ne touche  lessons.tier d'une leçon existante, publication_status de quoi que ce soit
supprime   une leçon absente du catalogue ET sans aucune trace d'élève — rien d'autre
archive    une leçon absente du catalogue MAIS porteuse d'historique : gardée, jamais servie
```

Le palier est une décision d'administration (`lessons.tier`, seule source de
vérité ; contrat : `architecture/ADMIN_PANEL_ARCHITECTURE.md` « Le palier du
contenu »). Chaque base porte les siens : la base locale fait foi en
développement, la base de production fait foi en production. Aucun
déploiement ne les réinitialise, et aucun code ne les déduit du catalogue.

### Périmètre actuel de la production (décision de contenu, 2026-09-25)

**Pour l'instant**, la base de production DZ ne contient que les leçons de
l'unité **« الأعداد الطبيعيّة والأعداد النّاطقة »** (`aadad-tabiiya-natiqa`,
ميدان أنساب الأعداد والحساب, 4AM) — les neuf leçons que déclare le catalogue :
`qasim-adad-tabii`, `qawasim-adad-tabii`, `khawass-qawasim`,
`qasim-mushtarak-akbar`, `tayin-pgcd`, `bahth-pgcd`,
`awwaliyan-fima-baynahuma`, `ikhtizal-kasr`, `wadiya-idmajiya-aadad`.

C'est un état de CONTENU, pas une limite d'architecture : il découle de ce que
le catalogue déclare, et aucune ligne de code ne le fige. Les 27 leçons « à
venir » que l'ancien SQL de phase 8 avait créées (une par sujet officiel des
autres ميادين, sans contenu) ne sont plus dans le catalogue ; le premier
déploiement qui porte la synchronisation les retire (aucune trace d'élève
possible sur une leçon sans contenu). Le prototype `pgcd` archivé est retiré
lui aussi s'il ne porte aucun historique, et GARDÉ (archivé, invisible des
élèves) s'il en porte — constaté au premier déploiement : `pgcd` porte un
historique, il est conservé et archivé par la synchronisation. Une unité suivante entrera en production par le chemin
normal : écrite dans le catalogue, livrée, synchronisée — ses leçons naissent
gratuites, l'administrateur décide ensuite.

**Unité 2 (2026-09-30).** L'unité « الحساب على الجذور » (`hisab-judhur`, cinq
leçons : `jidhr-tarbii`, `natiqa-ghayr-natiqa`, `muadalat-x-murabba`,
`amaliyat-judhur`, `tawzif-khawass-judhur`, et la synthèse `wadiya-idmajiya-judhur`) est entrée dans le catalogue ; elle
arrive en production par ce chemin normal au prochain déploiement qui la porte
(synchronisation du curriculum ET import du registre des épreuves). Tant que ce
déploiement n'a pas eu lieu, le périmètre ci-dessus reste celui de la
production.

**Unité 3 (2026-10-01).** L'unité « الحساب الحرفي » (`hisab-harfi` : `nashr-tabsit`,
`mutatabiqat-shahira`, `tahlil-ibara` et la synthèse `wadiya-idmajiya-harfi`, 200 exercices de
pratique) suit le même chemin : synchronisation du curriculum ET import du registre des épreuves au
déploiement qui la porte. Elle est rangée sous « ميدان أنساب الأعداد والحساب » (placement déclaré par
l'unité, décision du propriétaire).

**Unité 4 (2026-10-01).** L'unité « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد »
(`muadalat-mutarajihat` : `muadala-ula`, `jidaa-maadum`, `mutarajiha-ula`, `tarrid-mushkila` et la
synthèse `wadiya-idmajiya-muadalat`, 250 exercices de pratique) suit le même chemin : synchronisation du
curriculum ET import du registre des épreuves au déploiement qui la porte, sous « ميدان أنساب الأعداد
والحساب » (placement déclaré, décision du propriétaire).

**Unité 5 (2026-10-01).** L'unité « جمل معادلتين من الدرجة الأولى بمجهولين » (`jumal-muadalatayn` :
`mafhum-jumla`, `hall-jabri`, `mushkilat-jumla` et la synthèse `wadiya-idmajiya-jumal`, 200 exercices de
pratique, dont des réponses `point` — la ثنائية (x ; y)) suit le même chemin : synchronisation du curriculum ET
import du registre des épreuves. **Le build web demande désormais ~3,2 Go de mémoire** (mesuré) : le script
`build` de `apps/web` fixe `NODE_OPTIONS=--max-old-space-size=4096` (le tas par défaut, ~2,2 Go, échouait en
« heap out of memory ») ; un serveur de build doit disposer d'au moins 4 Go libres.

### Rattraper une base en retard

Les fichiers `docs/deployment/*.sql` restent valides et restent la façon de
réparer une base que le pipeline ne peut pas atteindre. Pour une base qui a
plusieurs versions de retard, `HOSTINGER_CATCHUP_ALL.sql` les réunit en un seul
fichier **rejouable** : chaque instruction est gardée par un test d'existence,
donc il est sûr sur une base à jour (il ne fait rien), à moitié migrée, ou
relancé après une interruption. Il est assemblé par
`python3 scripts/build-hostinger-catchup-sql.py` — jamais édité à la main.

Après lui, appliquer `HOSTINGER_UNIT1_CURRICULUM_DATA.sql` (données du
curriculum, upserts par code) puis vider les caches Laravel.

## كرّاسي, Math Lab et atelier « أعمالي » — à appliquer sur Hostinger

**Obligatoire pour cette version.** Cinq migrations livrées entre le 22 et le
26 septembre n'avaient aucun fichier SQL relu. Sans elles, en production :
`math_lab_documents` et `math_lab_files` **n'existent pas** (500 sur
`GET /api/v1/math-lab/documents`), et le cahier « كرّاسي » lit des colonnes
absentes de `notebook_notes`. Constaté en production le 2026-09-23 : 500 sur
`/math-lab/documents` **et** sur `/student/study-context` (ce dernier vient des
tables `classrooms`, donc du fichier « offres enseignants » ci-dessus).

### Ordre complet des fichiers SQL, du plus ancien au plus récent

Un déploiement qui rattrape plusieurs versions d'un coup doit les exécuter
**dans cet ordre** (chaque fichier suppose les précédents appliqués) :

| # | Fichier | Migrations |
|---|---------|-----------|
| 1 | `HOSTINGER_AUTH_MIGRATION.sql` | `2026_09_18_*` |
| 2 | `HOSTINGER_UNIT1_MIGRATION.sql` | `2026_09_21_*` |
| 3 | `HOSTINGER_UNIT1_CURRICULUM_DATA.sql` | données unité 1 |
| 4 | `HOSTINGER_CAHIER_MATHLAB_MIGRATION.sql` | `2026_09_22` → `2026_09_25` |
| 5 | `HOSTINGER_MATHLAB_WORK_MIGRATION.sql` | `2026_09_26_000001` (atelier) |
| 6 | `HOSTINGER_TEACHER_PLANS_MIGRATION.sql` | `2026_09_26_*` / `2026_09_27_*` |

Pour savoir où en est une base : `SELECT migration FROM migrations ORDER BY
migration;` — tout fichier dont les migrations n'y figurent pas reste à passer.
Si `artisan` est disponible, l'équivalent des six est `php artisan migrate
--force && php artisan db:seed --class=PlanSeeder --force`.

### 4 — `HOSTINGER_CAHIER_MATHLAB_MIGRATION.sql`

Quatre migrations additives : `module_number` sur `notebook_notes`, les huit
colonnes du cahier + quatre index, puis les tables `math_lab_documents` et
`math_lab_files` (cette seconde référence la première — ordre obligatoire).
Le bloc « VÉRIFICATION » doit rendre 2 tables, 9 colonnes, le même nombre de
notes qu'avant, et 4 lignes de migration.

**Reprise des notes** (§ 5 du fichier) : deux UPDATE idempotents remettent les
notes non terminées dans la file de révision et marquent `erreur` celles qui
portent un `mistake_type` — exactement la règle de la migration Laravel. La
troisième partie, `content_text`, **n'est volontairement pas reprise en SQL** :
elle exige un retrait de balises HTML puis un décodage d'entités que MySQL ne
fait pas fidèlement, et un `REPLACE()` approximatif mettrait du HTML à moitié
nettoyé dans la colonne de recherche. Conséquence, mesurée dans le code : une
note ancienne reste lisible et intacte, mais n'apparaît pas dans la recherche
jusqu'à sa prochaine modification — `NotebookService` réécrit `content_text` à
chaque enregistrement, donc la reprise est **auto-réparatrice**.

### 5 — `HOSTINGER_MATHLAB_WORK_MIGRATION.sql`

Le Math Lab remplace sa liste de documents par un atelier (aperçus, tri,
recherche, favoris), et le code lit/écrit deux colonnes nouvelles.

1. **Schéma** : une migration additive `2026_09_26_000001`, deux colonnes + un
   index sur la seule table `math_lab_documents`, puis la ligne `migrations`.
   Le bloc « VÉRIFICATION » doit rendre 2 colonnes, 3 lignes d'index, le même
   nombre de documents qu'avant, et 0 étoile.
2. **Rien à faire pour les documents existants** : `summary` est NULL et
   `is_favorite` faux — l'atelier sait dessiner un aperçu de repli sans résumé,
   et chaque document réenregistré publie le sien. Aucun état d'outil (`data`)
   n'est touché.
3. **Rien dans `.env`** : la borne du résumé est
   `MathLabDocumentService::MAX_SUMMARY_BYTES`, pas une variable.

Les deux fichiers ont été exécutés **tels quels** sur une base au schéma de
production avant d'être livrés, avec des notes couvrant les quatre cas de la
reprise ; `php artisan migrate:status` y voit ensuite les cinq migrations
« Ran ».

Contrats : `docs/architecture/MATH_LAB.md`, `docs/architecture/NOTEBOOK.md`.

## Registrations closed while the platform is under test (2026-11-20)

`apps/api/config/registration.php`, read from the production `.env`:

| Variable | Default | Effect |
|---|---|---|
| `REGISTRATION_OPEN` | `false` | `false`: no account is created by the public sign-up (form or Google); `/register` shows « المنصّة في مرحلة التجربة » and takes a phone number (`POST /waitlist` → table `contacts`, `objectif = waitlist`, read by the admin in « رسائل التواصل », with the usual push). Existing accounts sign in as before. `true` reopens everything. |
| `REGISTRATION_CLASS_LINKS` | `true` | While closed, a STUDENT who arrives by the link of his teacher's class (valid link, class still accepting members) still signs up — the way to let invited students try the platform. `false` closes that too. |

**Since 2026-11-21 the two variables are only the DEFAULT**: the admin opens and closes the sign-up from the card
« التسجيل » of his dashboard (table `platform_settings`, row `registration`, which wins over the `.env`; contract:
`docs/architecture/ADMIN_PANEL_ARCHITECTURE.md` « Ouvrir ou fermer les inscriptions »). Once he has used the switch, changing
`REGISTRATION_OPEN` in the `.env` changes nothing. **One migration to run at deployment**:
`2026_11_21_000001_create_platform_settings_table` (`php artisan migrate --force`); until the admin touches the switch
the behaviour is the one of the `.env` (CLOSED when the variable is absent). Tests: `RegistrationClosedTest`,
`AdminRegistrationSwitchTest` (the API suite runs with registrations open, `phpunit*.xml`); the page:
`node apps/web/e2e/waitlist.mjs`.
