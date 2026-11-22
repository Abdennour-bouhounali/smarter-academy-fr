# Phase 6 — Implementation Report

Date : 2026-09-16. Périmètre : système de codes d'activation / droits
d'accès, garde d'intégration continue sur la dérive d'activation, QA du
moteur de leçon sous RTL, et fondation du curriculum 4AM.

Statuts employés : **COMPLETE** / **PARTIAL** / **NOT STARTED** / **BLOCKED**.

---

## 1. Executive Summary

Phase 6 est **COMPLETE** pour son objet principal : un élève achète une carte
en espèces, saisit son code, et obtient un accès premium que le serveur seul
décide. L'administration produit, filtre, exporte et révoque les codes.

La couche d'accès héritée n'a pas été remplacée. Elle a été **étendue par un
type de droit de plus**, ce que sa conception prévoyait explicitement
(`entitlements.type` est une chaîne libre, documentée comme additive).
`ContentAccess` n'a pas été touché, et la conséquence est vérifiée par test :
un code parfaitement valide n'ouvre rien d'une classe dormante ni d'une leçon
masquée.

Deux tâches laissées ouvertes par la reprise précédente sont fermées : la
dérive d'activation est devenue une **porte d'intégration continue**, et le
moteur de leçon a enfin été **rendu et regardé sous RTL**.

Quatre défauts réels ont été trouvés et corrigés en chemin, dont trois que
seule l'observation à l'écran pouvait révéler (§11) et un préexistant qui
empêchait la commande de diagnostic de tourner (§10).

Ce qui n'a pas avancé, et pourquoi : aucune leçon 4AM n'existe. C'est
délibéré — la phase 6 est une phase d'accès, pas de contenu. Le programme
officiel fourni par le propriétaire a été transcrit et structuré (§12), sans
qu'aucun point d'apprentissage ne soit inventé.

---

## 2. Activation Architecture

```
carte achetée en espèces
        ↓
  code saisi par l'élève  ──▶ ActivationCodeRedemptionService
        ↓                            (transaction + verrou + index unique)
  activation_codes.status : available → activated
        ↓
  entitlements(type = activation_code, reference = activation_code:{id})
        ↓
  EntitlementService.decide()          ← l'autorité du DROIT
        ↓
  ContentAccess.assertLessonAvailable() ← compose droit + publication + classe
        ↓
  leçon premium servie
```

**Ce qui n'a pas changé.** `ContentAccess`, `AccessTier`, et la règle de
composition « droit valide + leçon masquée = REFUS ». L'invariant central de
la couche est intact, et un test le vérifie explicitement contre une classe
française dormante.

**Ce qui a changé, et rien de plus** :

| Fichier | Changement |
|---|---|
| `Entitlement.php` | `TYPE_ACTIVATION_CODE` ajouté à `TYPES` |
| `AccessDecision.php` | motif `VIA_ACTIVATION_CODE` |
| `EntitlementService.php` | le type entre dans l'ordre de décision ; `summarize()` expose `activationCodeActive` et rend la fin d'accès la plus LOINTAINE (les droits sont cumulatifs — deux cartes prolongent l'accès, et annoncer la première ferait craindre une coupure qui n'aura pas lieu) |

**Séparation code / droit.** Le code est le TITRE, le droit est l'ACCÈS. Les
séparer permet de révoquer une carte volée sans perdre la trace qu'elle avait
ouvert un accès, et de raisonner sur les droits sans savoir d'où ils viennent.

---

## 3. Database Changes

Deux tables neuves. Aucune migration destructive, aucune table existante
modifiée.

**`activation_code_batches`** — un LOT, ce qui est imprimé d'un coup.
Porte les conditions (`access_days` OU `access_ends_at`, exclusives ;
`redeem_by` pour la date limite de saisie), parce qu'elles appartiennent à
l'impression et non au code : cent cartes vendues à la même occasion ouvrent
le même droit.

**`activation_codes`** — `batch_id`, `code_hash` (unique), `code_hint`,
`status`, `expires_at`, `activated_at/by`, `entitlement_id`,
`revoked_at/by/reason`, `created_by`.

Deux décisions qui méritent d'être dites :

- **`code_hash` et non le code.** HMAC-SHA256 clé depuis `APP_KEY`. HMAC et
  non bcrypt parce qu'un code se VÉRIFIE par recherche indexée (« ce code
  existe-t-il ? ») et non par comparaison avec une ligne déjà trouvée ; un
  hachage salé par ligne obligerait à parcourir toute la table à chaque
  saisie. Les 60 bits d'entropie, non choisis par un humain, rendent sans
  objet la lenteur anti-force-brute de bcrypt.
- **`expired` n'est pas une valeur de `status`.** Il est DÉRIVÉ de
  `expires_at`, comme chez `Entitlement::isValid()`. Une colonne aurait
  produit des codes « disponibles » périmés dès le premier oubli de tâche
  planifiée.

`entitlements` est inchangé. Son index unique `(type, reference)`, posé pour
les abonnements, sert de filet à la double activation sans une ligne de plus.

---

## 4. Code Generation

`ActivationCodeFormat` : alphabet de 32 symboles sans `0/O/1/I` (indiscernables
sur une carte imprimée), 12 symboles tirés par `random_int`, soit **60 bits**
d'entropie — environ 1,15 × 10^18 possibilités. Rendu en `XXXX-XXXX-XXXX`
pour l'impression et la lecture à voix haute.

`ActivationCodeGenerator::generateBatch()` : 1 à 500 codes par lot, en une
transaction, avec retrait en cas de collision d'empreinte. Journalise les
CONDITIONS du lot, jamais ses codes.

**Les codes en clair ne sortent qu'une fois**, dans la réponse de génération.
Aucune route ne peut les relire ; il n'existe volontairement pas d'écran
« réafficher les codes d'un lot », qui n'aurait rien à afficher. Conséquence
assumée et documentée à l'écran : un lot perdu se révoque et se refait.

---

## 5. Code Redemption

`POST /v1/activation-codes/redeem`, derrière `auth:sanctum` +
`account.active` + `email.verified` + limite de débit.

Le code est la SEULE donnée acceptée du client : ni l'élève visé (toujours
`$request->user()`), ni la durée, ni le palier.

**Saisie tolérante, résultat strict.** Minuscules, espaces, tirets absents ou
en trop sont normalisés. L'exigence de saisie exacte est une exigence qu'on
s'impose à soi, pas à l'élève.

**États rendus** (motif clos, transmis à l'interface arabe) :

| Motif | Message élève (ar) |
|---|---|
| `invalid` | هذا الرمز غير صالح. تحقّق من إدخالك. |
| `already_activated` | سبق استعمال هذا الرمز. |
| `expired` | انتهت صلاحية هذا الرمز. |
| `revoked` | لم يعد هذا الرمز صالحًا. اتصل بالبائع الذي سلّمك البطاقة. |
| 429 | عدد المحاولات كبير. انتظر قليلاً ثم أعد المحاولة. |

Un code inconnu et un code mal formé rendent le MÊME motif : les distinguer
dirait à qui tâtonne s'il a trouvé la bonne forme.

---

## 6. Security

| Exigence | Mise en œuvre |
|---|---|
| Validation côté serveur | Toute décision vient de `ContentAccess`/`EntitlementService`. Le frontend affiche, il n'autorise pas. |
| Limite de débit | Limiteur NOMMÉ `activation-redeem` : 5/min par compte, 30/h par IP. Nommé parce qu'il en faut deux, et que deux `throttle:` en ligne partageraient la même clé de cache. |
| Authentification | `auth:sanctum` + `account.active` + `email.verified`. |
| Redemption atomique | Transaction + `lockForUpdate()` + mise à jour CONDITIONNELLE. |
| Course / double activation | Trois niveaux (§ ci-dessous). |
| Piste d'audit | `admin_activity_logs` : génération, révocation, révocation de lot, export. |
| Autorisation | `can:admin` sur toutes les routes d'administration. Vérifié par test sur chacune. |
| Normalisation d'entrée | `ActivationCodeFormat::normalize()`, une seule définition. |
| Réponses sûres | Aucun message ne révèle d'interne ; le code n'apparaît dans aucune réponse (test dédié). |

**La double activation, tenue à trois niveaux** — parce que le premier dépend
du moteur (sous SQLite, `lockForUpdate` ne fait rien) :

1. `lockForUpdate()` sérialise deux saisies simultanées ;
2. la transition est un `UPDATE ... WHERE status = 'available'` : deux saisies
   concurrentes l'exécutent, une seule touche une ligne ;
3. l'index unique `(type, reference)` rend le doublon impossible en base.

Test `test_deux_eleves_sur_le_meme_code_un_seul_droit` : exactement un droit,
un refus `already_activated`, et le premier élève garde le code.

**Ce qui n'est PAS journalisé** : aucun code en clair, nulle part — ni dans
`admin_activity_logs` (où `code`, `codes`, `code_hash` sont désormais dans la
liste de rédaction, en défense en profondeur), ni dans les journaux
applicatifs (un refus n'écrit que l'indice de 4 symboles).

---

## 7. Entitlement Integration

**Aucun second système d'autorisation n'a été créé.** Le droit né d'un code
est une ligne `entitlements` ordinaire : `isValid()` et `scopeValidNow()` sont
type-agnostiques, donc la validité temporelle, la révocation et le cache par
requête fonctionnent sans une ligne de code de plus.

Vérifié par test :

- leçon premium, classe active, sans droit → refus ; avec droit → servie ;
- leçon d'une classe **dormante** → refus, malgré un droit parfaitement valide ;
- leçon **masquée** → refus, malgré un droit valide ;
- l'accès se ferme **tout seul** à l'échéance, sans qu'aucune tâche ne passe ;
- deux cartes empilées prolongent l'accès et annoncent la fin la plus lointaine.

Côté client, `usePremiumStatus` et `ContentAvailabilityContext` restent les
seuls lecteurs. Le contexte expose désormais `refresh()` : sans lui, chaque
carte de leçon aurait gardé son cadenas jusqu'au prochain rechargement, et
l'élève venant de payer aurait cru que son code n'avait rien fait.

---

## 8. Three Free Lessons

**Infrastructure : COMPLETE. Sélection : NOT STARTED** — et ce n'est pas un
oubli, aucune leçon algérienne n'existe.

`packages/core/curriculum/freeLessons.js` porte `FREE_LESSON_IDS`, une liste
**nommée**. « Les trois premières » aurait fait dépendre le modèle commercial
d'un ordre de tri : réordonner un chapitre, insérer une leçon ou renommer un
identifiant aurait rendu payante une leçon annoncée gratuite, sans qu'aucun
code ne change et sans que personne ne s'en aperçoive.

Deux régimes, et la distinction protège l'héritage :

- **classe active** → la liste fait loi : listée = gratuite, absente = payante ;
- **classe dormante** → le palier hérité est laissé INTACT. Les 133 leçons
  françaises ne sont servies à personne ; les retoucher ferait bouger 133
  lignes à chaque import et noierait la vraie dérive que la porte du §10
  cherche à voir.

Le palier voyage jusqu'à la base par la poignée de main existante
(`exportCurriculum.mjs` → `smarter:import-curriculum` → `lessons.tier`), sans
changement d'importateur. `check:dormant-isolation` refuse un identifiant
inexistant ou rattaché à une classe dormante — les deux fautes silencieuses
possibles.

Le contrôle du palier dans l'administration est resté en place côté serveur
(les tests français en dépendent) ; toute divergence est désormais attrapée
par la porte du §10.

---

## 9. Admin Management

Trois écrans, sous les conventions existantes (copie française, `AdminPage`,
`DataTable`, `FilterBar`, `ConfirmDialog`, aucun `window.confirm`).

| Geste | État |
|---|---|
| Générer un lot (1–500) | COMPLETE — codes rendus une fois, CSV construit dans le navigateur |
| Lister, compter par état | COMPLETE — `available`/`activated`/`expired`/`revoked` |
| Filtrer | COMPLETE — état, lot, recherche (indice, élève, lot), dates |
| Détail | COMPLETE — code, lot, droit ouvert, journal |
| Révoquer un code | COMPLETE — motif obligatoire ; cascade sur le droit si activé |
| Révoquer un lot | COMPLETE — n'atteint QUE les codes encore disponibles |
| Exporter | COMPLETE — CSV en flux, métadonnées seules, journalisé |
| Historique / audit | COMPLETE — `admin_activity_logs`, quatre actions |

**La révocation d'un code activé ferme l'accès de l'élève.** C'est le geste
le plus lourd de cet écran ; il avertit nommément avant de le faire. La
révocation de LOT, elle, épargne délibérément les codes déjà activés : fermer
d'un clic l'accès de trente élèves qui ont payé serait trop lourd pour être
groupé.

La navigation d'administration « Abonnements » devient « Accès ». Les écrans
Stripe restent sur le disque, démontés.

---

## 10. CI Activation Drift Gate

**COMPLETE.** Le risque 3 du rapport de reprise (« pas encore une garde
d'intégration continue ») est fermé.

`npm run check:activation-drift`, ajouté à `check:lessons`, vérifie en deux
temps :

1. **l'export reflète-t-il le catalogue ?** Le catalogue est reconstruit en
   mémoire et comparé au fichier `.generated/` — activation par classe ET
   palier par leçon. Une projection, pas l'export complet : comparer titres
   et descriptions ferait échouer la garde sur une faute de frappe corrigée,
   ce qui apprendrait surtout à la contourner.
2. **la base suit-elle l'export ?** Délégué à
   `php artisan smarter:registry-health --gate`, seule autorité sur ce que la
   base contient.

Une source absente est un ÉCHEC en mode porte : une porte qui ne peut pas
vérifier ne s'ouvre pas. Le mode diagnostic (sans `--gate`) garde son
comportement inchangé, sortie 0 comprise.

Le contrôle du **palier** est neuf : la dérive commerciale (« le catalogue
vend, la base offre ») n'était surveillée nulle part.

**Éprouvé, pas supposé** : en injectant une classe active en base seulement,
la porte sort 1 et nomme la classe ; en modifiant le palier d'une leçon, elle
nomme la leçon ; après la poignée de main, elle sort 0. Quatre tests
automatisent la moitié « export périmé ».

**Défaut préexistant corrigé.** `RegistryHealthService::structural()` appelait
`diff()` sur une collection **Eloquent** de chaînes, ce qui lève (`getKey()`
sur une chaîne). Reproduit sur un stash propre de `main` : la commande
échouait dès que l'export du registre de contenu manquait. Sans ce correctif,
la porte n'aurait jamais pu s'ouvrir.

---

## 11. RTL Lesson QA

**COMPLETE.** Le `UNKNOWN — REQUIRES VERIFICATION` du §17 du rapport de
reprise est levé.

`apps/web/src/qa/rtlLessonFixture/` monte les **vrais** composants du moteur —
`LessonIndex`, `ContentModule` (donc `ModuleLayout`), les questions du kit,
`MathText`, `CoordPlane`, `NumberLine`, la carte des connaissances — avec du
texte arabe. Le contenu mathématique est une illustration générique ; rien n'y
relève du programme 4AM.

**Isolement**, vérifié par cinq tests et sur le lot construit :

- hors de `src/lessons/`, donc invisible du glob du registre, de
  `check-routes`, `validate-lessons` et `check-dormant-isolation` ;
- pas de `lesson.config.js` (le fichier s'appelle `fixture.config.js`) ;
- montée derrière `import.meta.env.DEV || VITE_QA_FIXTURES === 'true'`, par un
  `import()` paresseux. Un import statique ne suffisait pas : Rollup gardait
  le module dans le lot d'entrée. **Absente du lot de production**, présente
  avec le drapeau — les deux vérifiés.

**Ce qui a été regardé, et le résultat** :

| Surface | Résultat |
|---|---|
| En-tête et fil d'Ariane de leçon | PASS — arabe, de droite à gauche |
| Mise en page de module | PASS |
| Blocs de contenu, brief, étapes | PASS |
| Mathématiques en ligne et en bloc | PASS — `direction: ltr` + `unicode-bidi: isolate`, 0 imbrication DOM fautive |
| Figures (`CoordPlane`, `NumberLine`) | PASS après correction — 2/2 en LTR, axe des abscisses croissant vers la droite |
| Progression, questions, feedback | PASS |
| Navigation précédent/suivant | PASS |
| Carte des connaissances | PASS après correction — s'ouvre au bord GAUCHE (x = 24…164) |
| Responsive 390 px | PASS — aucun débordement horizontal |
| Erreurs page / console | zéro |

**Trois défauts réels trouvés en regardant**, tous invisibles à un build :

1. **`NumberLine` n'était pas épinglé LTR.** L'algorithme bidi héritait du
   `dir="rtl"` de la page et réordonnait les étiquettes négatives : « -5 »
   s'affichait « 5- ». Mathématiquement faux. Quatre autres figures partagées
   (`RealLine`, `MeasureFillMission`, `SolidTurner`, `ViewsPanel`) avaient le
   même manque, corrigé de même.
2. **Le déclencheur de la carte des connaissances était inatteignable.**
   `start-6` le plaçait au bord droit sous RTL, c'est-à-dire sous la barre
   latérale de l'espace élève : visible, et pourtant tous les clics
   interceptés. La correction précédente avait déplacé le PANNEAU sans son
   déclencheur — la sonde d'alors ne montait pas la coquille élève, donc ne
   pouvait pas le voir.
3. (Le troisième, `RegistryHealthService`, est au §10.)

---

## 12. 4AM Programme Foundation

**Documentée : COMPLETE. Implémentée : NOT STARTED**, délibérément.

`docs/ALGERIA_4AM_CURRICULUM.md` transcrit les quatre domaines et leurs 28
sujets, au mot près, et ajoute : registre terminologique, dépendances
intra-programme, architecture de contenu retenue, et un tableau de
comparaison avec le référentiel technique français.

`packages/core/curriculum/dz/programme_4am_2026_2027.json` porte le même
programme en données. Il n'est encore lu par aucun code.

**Ce qui n'a pas été inventé.** Aucun point d'apprentissage n'a été rédigé.
Les sujets dont le programme énumère lui-même les parties (les quatre
opérations sur les racines, les deux méthodes de résolution de systèmes, les
trois rapports trigonométriques) sont enregistrés tels quels ; tout le reste
porte `À DÉCOMPOSER`. Les questions que le programme fourni ne tranche pas —
notamment la distinction entre `التواتر` et `التكرار النسبي` — portent
`[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`.

**Comparaison au français** : quatre sujets n'ont aucun équivalent au collège
français et seront construits de zéro (rationaliser un dénominateur ;
inéquations et leur représentation ; systèmes de deux équations ; la distance
entre deux points). Le tableau estime l'effort d'ingénierie — il ne décide
d'aucun contenu.

---

## 13. Tests

Tous exécutés, tous verts.

| Commande | Résultat |
|---|---|
| `npm run check:lessons` | **exit 0** — 8 contrôles, dont le nouveau `check:activation-drift` |
| `npm test` | **5188 passés**, 4 ignorés (207 core + 4934 web + 47 scripts) |
| `php artisan test` | **692 passés**, 2587 assertions |
| `npm run build` | **✓ built**, surface de QA absente du lot |
| `php artisan migrate` | 52/52 |

Base de référence : 5172 JS / 641 PHP. Aucune régression ; +16 JS, +51 PHP.

**Tests neufs, par sujet** :

*Saisie (20)* : code valide ouvre l'accès ; saisie tolérante (casse, espaces,
tirets) ; inconnu / mal formé / déjà activé / expiré / révoqué refusés ;
« révoqué » l'emporte sur « expiré » ; deux saisies du même code ; **deux
élèves sur le même code** ; **l'index unique comme filet** ; l'accès se ferme
à l'échéance ; lot à date fixe ; lot sans terme ; deux codes empilés ;
anonyme / suspendu / adresse non vérifiée refusés ; **le code n'apparaît dans
aucune réponse**.

*Administration (22)* : génération et bornes ; **aucun code en clair en
base** ; journal sans les codes ; exclusivité durée/date ; dates passées ;
liste, compteurs, filtre sur l'état dérivé ; recherche par indice et par
élève ; détail et historique ; révocation disponible et **activée avec
cascade** ; motif obligatoire ; double révocation ; révocation de lot
épargnant les activés ; export sans codes ; **élève refusé sur les six
routes** ; anonyme ; administrateur suspendu.

*Sécurité (9)* : limite de débit atteinte ; place laissée à une faute de
frappe ; **un code valide n'ouvre pas une classe dormante** ; leçon payante
avec et sans droit ; leçon masquée ; alphabet sans caractères ambigus ;
200 tirages distincts ; empreinte stable et opaque ; longueurs refusées.

*Frontend* : `classifyStatus(429)`, `resolveLessonTier`, isolement de la
surface de QA (5), dérive d'export (4).

---

## 14. Browser QA

Réellement exécutée : lot de production servi sur `:4173`, API sur `:8000`,
Chromium, `locale: ar-DZ`.

**Élève — `_phase6-activation.mjs` : 15/15.** Connexion, page en RTL, titre
arabe, **champ du code en `direction: ltr`** dans une page RTL, aucun
débordement, code inconnu refusé, champ vide refusé, code valide accepté,
**état d'accès mis à jour sans rechargement**, code déjà utilisé refusé,
second code empilé, **limite de débit atteinte avec son message arabe**,
mobile 390 px sans débordement, zéro erreur page, zéro erreur console.

**Administration + RTL — `_phase6-admin-rtl.mjs` : 30/30.** Connexion admin,
écran atteint, compteurs, **aucun code en clair dans la liste**, lot généré,
avertissement « une seule fois », 5 codes lisibles une fois, exclusivité
durée/date refusée, filtre appliqué et homogène, détail, journal, motif
obligatoire, code révoqué, écran des lots, puis les 13 contrôles du moteur
sous RTL recensés au §11.

**Révocation d'un code activé — `_phase6-revoke-activated.mjs` : 7/7.** Code
activé, droit ouvrant l'accès, **avertissement « FERMERA l'accès » nommant
l'élève**, révocation, droit qui n'ouvre plus, motif conservé, journal
enrichi. Vérifié ensuite côté serveur : `premiumAccess` passe à `false`.

Captures : `/tmp/qa-activation-desktop.png`, `/tmp/qa-activation-mobile.png`,
`/tmp/qa-rtl-lesson.png`, `/tmp/qa-rtl-figures.png`, `/tmp/qa-rtl-mobile.png`,
`/tmp/qa-revoke-activated.png`.

**Défaut d'infrastructure trouvé par cette QA.** `config/cors.php` autorisait
en dur `https://smarter-academy.fr` — le domaine de production **français** —
et aucun domaine algérien. Deux conséquences réelles : le produit algérien ne
pouvait pas appeler son propre serveur sans édition manuelle au déploiement,
et une page servie depuis le domaine français restait autorisée à parler à
l'API algérienne, ce que le master spec §2 interdit. La liste vient désormais
de l'environnement (`CORS_ALLOWED_ORIGINS`).

---

## 15. Files Changed

**Backend, neufs** : `Domain/Access/ActivationCodes/` (format, générateur,
service de saisie, exception), `Domain/Admin/ActivationCodeAdminService.php`,
`Http/Controllers/ActivationCodeController.php`,
`Http/Controllers/Admin/AdminActivationCodeController.php`,
`Models/ActivationCode{,Batch}.php`, 2 migrations, 2 usines, 3 fichiers de
tests.

**Backend, modifiés** : `Entitlement.php`, `AccessDecision.php`,
`EntitlementService.php`, `ActivityLogger.php`, `AppServiceProvider.php`,
`routes/api.php`, `RegistryHealthService.php`, `RegistryHealth.php`,
`config/cors.php`, `.env.example`, `EntitlementFactory.php`.

**Frontend, neufs** : `pages/student/Activation.jsx`,
`pages/admin/activation/` (3 écrans), `services/activationService.js`,
`services/admin/activationCodeService.js`, `i18n/locales/ar/access.json`,
`qa/rtlLessonFixture/` (5 fichiers), 3 scripts de QA navigateur.

**Frontend, modifiés** : `App.jsx`, `ContentAvailabilityContext.jsx`,
`StatusBadge.jsx`, les trois fichiers de navigation, `CommandPalette.jsx`,
`FreePremiumTeaser.jsx`, `LessonCard.jsx`, `StudentNavbar.jsx`, `Profil.jsx`,
`StudentHome.jsx`, `LessonIndex.jsx`, `NumberLine.jsx`, `RealLine.jsx`,
`MeasureFillMission.jsx`, `SolidTurner.jsx`, `ViewsPanel.jsx`,
`KnowledgeMap.jsx`, 2 fichiers de tests.

**Partagé** : `freeLessons.js` (+ test), `coursesData.js`, `index.js`,
`api/errors.js` (+ test).

**Scripts** : `check-activation-drift.mjs` (+ test),
`check-dormant-isolation.mjs`, `package.json`.

**Documentation** : ce rapport, `ALGERIA_4AM_CURRICULUM.md`,
`programme_4am_2026_2027.json`, roadmap et rapport de reprise mis à jour.

---

## 16. Remaining Issues

1. **La carte des connaissances est en français.** Son déclencheur affiche
   « Ma carte », ses catégories « IDÉES », « Vue complète », « Navigation ».
   La phase 4 s'était arrêtée à la coquille ; ce composant vit sous
   `lessons/common/` et n'a pas été traduit. Visible sur les captures.
   À traiter avec le contenu des leçons (phase 8) ou en phase 12.
2. **Le corps des pages élève reste en français.** `StudentHome`,
   `MesCours`, `Progression`, `Explorer` n'appellent pas `useTranslation`.
   Seules les surfaces touchées par cette phase sont en arabe.
3. **MathLive reste du code mort** (zéro importeur). Son comportement RTL
   (curseur, sélection) reste `UNKNOWN — REQUIRES VERIFICATION`.
4. **`phpunit.xml` déclare SQLite** alors qu'une migration exige MySQL.
   Défaut français préexistant ; toute intégration continue doit surcharger
   la connexion.
5. **La porte de dérive exige une base joignable.** C'est voulu, mais cela
   signifie que `check:lessons` ne tourne plus sans base configurée.
   `SKIP_DB_DRIFT_CHECK=1` permet de sauter explicitement ce seul contrôle.
6. **Aucun `smarter:expire-activation-codes`.** Inutile par conception (les
   états périmés sont dérivés), mais une commande de purge des lots anciens
   pourrait devenir utile en exploitation.

---

## 17. Blockers

| # | Blocage | Action requise, côté propriétaire |
|---|---|---|
| B1 | **Découpage du programme 4AM en leçons** | Le programme est fourni et transcrit ; le découpage en leçons et en points d'apprentissage est une décision pédagogique à prendre avant la phase 7. Le document d'accompagnement officiel, la répartition horaire et les attendus de fin de cycle n'ont pas été fournis. |
| B2 | **Projet Google Cloud algérien** | Créer un projet indépendant du français ; renseigner `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, et l'URI autorisée `{APP_URL}/api/v1/auth/google/callback`. **Ne bloque que Google** — l'authentification par mot de passe fonctionne, et les codes d'activation avec elle. |
| B3 | **Infrastructure de production** | Hébergement, base, SMTP, domaine, sauvegardes, analytique. Renseigner `CORS_ALLOWED_ORIGINS` avec le domaine algérien, et lui seul. |
| B4 | ~~Définition des « 3 leçons gratuites »~~ | **RÉSOLU** : liste nommée dans `freeLessons.js`. Reste à la remplir une fois les leçons 4AM écrites. |

**Note sur B2.** Aucun identifiant n'a été inventé, aucun secret de
remplacement n'a été inséré. `GOOGLE_REDIRECT_URI` est lu de la
configuration, jamais de la requête.

---

## 18. Next Phase Plan

**Phase 7 — Fondation du curriculum 4AM.** Gated sur B1.

1. Trancher les frontières de leçons, domaine par domaine, selon la cohérence
   pédagogique et non la commodité d'implémentation.
2. Décomposer chaque sujet en points d'apprentissage — remplacer tous les
   `À DÉCOMPOSER` du §12.
3. Produire la source du catalogue 4AM et l'intégrer à `coursesData.js`
   (niveau `moyen`, classe `4am`, chapitres = les quatre ميادين).
4. Classer chaque point d'apprentissage contre le français, LP par LP — jamais
   par titre de leçon.
5. **Étendre `check-routes.mjs` au niveau `moyen`** : son expression
   régulière ne reconnaît que `college|lycee`, et une leçon 4AM serait vue
   comme sans classe. À faire AVANT le premier montage.
6. Ajouter `4am` à `ACTIVE_GRADE_IDS`, relancer la poignée de main, vérifier
   `npm run check:activation-drift`.
7. Choisir les trois leçons gratuites et les inscrire dans `freeLessons.js` —
   possible seulement après l'étape 1.

**Phase 8 — Les leçons 4AM**, une par une : cartographie → classification
LP-par-LP → architecture → contenu → interaction → carte des connaissances →
exercices → BossFinal → QA. La première leçon remplacera la surface de QA du
§11, qui pourra alors être supprimée.

**Ce qui ne doit pas attendre la phase 7** : rien de bloquant. Les traductions
restantes (§16.1, §16.2) peuvent avancer en parallèle, et la QA navigateur des
codes d'activation est reproductible à tout moment par les trois scripts
livrés.
