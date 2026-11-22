# La librairie — livres papier vendus par la plateforme

> **Faisant autorité pour** : le catalogue public `/books`, la page d'un livre
> (`/books/:slug`), la commande SANS paiement en ligne, le formulaire de
> contact d'un livre, et le suivi administrateur (commandes, livraison,
> encaissements, messages). Établi le 2026-10-17 par l'intégration du site
> autonome du premier livre (« بروتوكول SMART لحل المسائل الرياضية »).
> Le code est la source de vérité ; ce fichier le décrit.
>
> **Status (2026-11-22).** Imported from the Algerian platform (DZ dev 7f4cef1c) on 2026-11-22. True here: the whole
> store described below is in the code and is ON — `/books` in the front end and the books groups of `routes/api.php`,
> with no switch. Not true here: it is an Algerian store by nature (an Arabic book, wilayas and communes, prices in
> dinars, cash on delivery, `smarter-academy.com`). France gets no books store (plan §7, 3): step 1F turns it OFF in
> the front end AND on the server — not yet applied in the code. Do not extend or translate this module.

## 1. Décision d'architecture

La librairie est un **module de la plateforme** (`smarter-academy.com/books`),
pas un site à part (`books.…`). Un compte, une API (Laravel), une base, un
panneau d'administration. Le livre n'est PAS lu en ligne : la page est une
vitrine + une demande de commande.

L'ancien site (React + Express + Postgres) n'est pas repris tel quel : son
contenu (textes, FAQ, chiffres, images, wilayas, champs du formulaire de
contact) est porté ; son backend est remplacé par l'API Laravel.

## 2. Modèle de données (migration `2026_10_17_000001`)

| Table | Rôle |
|---|---|
| `books` | un livre : `slug`, titre, prix (DA, entier), `status` (`draft` \| `published`), `content` JSON (badge, stats, steps, highlights, faq), `gallery` JSON |
| `book_orders` | une commande : client, wilaya/commune, adresse **facultative** (`NULL` depuis le 2026-11-13, migration `2026_11_13_000001`), `quantity`, `unit_price` **figé**, `delivery_mode` (`home` \| `desk` \| `NULL`, migration `2026_11_22_000001`), `delivery_fee` **NULLABLE** (calculé à la commande par le tarif, §2bis ; `NULL` = à fixer à l'appel), `status` |
| `book_order_payments` | un encaissement = UNE ligne (`payment` ou `refund`, montant, méthode, date) |
| `book_order_events` | l'historique d'une commande (création, états, livraison, paiements) |
| `book_messages` | la boîte de réception des formulaires de contact des pages livres |

Règles :
- **Total et état du paiement sont CALCULÉS** (`BookOrder::total()`,
  `paymentStatus()` : `unpaid | partial | paid | overpaid`), jamais stockés.
- Le prix d'une commande est figé : modifier le prix du livre ne réécrit pas
  les commandes reçues.
- États : `pending → confirmed → in_way → delivered`, `→ cancelled` (avant
  l'expédition), `→ returned` (depuis `in_way`/`delivered`). Transitions
  contrôlées par `BookOrder::TRANSITIONS` (422 sinon). Seule une commande
  annulée ou retournée peut être supprimée.
- Un remboursement ne peut dépasser l'encaissé.
- Le frais de livraison est **calculé par le SERVEUR à la commande** (§2bis) et figé sur
  la commande ; l'administrateur peut le corriger (`PATCH /admin/book-orders/{id}`).

## 2bis. Frais de livraison par wilaya (2026-11-22)

Le tarif du transporteur, donné par le propriétaire le 2026-11-22, est dans
`App\Domain\Books\DeliveryFees` : par numéro de wilaya, deux montants en دج —
**à domicile** (`home`) et **au bureau du transporteur / stop-desk** (`desk`). Pour
changer un prix : cette table, et rien d'autre (le web la reçoit par `GET /books/wilayas`).

- **56 wilayas tarifées.** Les wilayas **50 (برج باجي مختار) et 54 (عين قزام) ne sont pas
  dans le tableau du transporteur** : pas de tarif → `delivery: null`, le frais reste `NULL`
  et se fixe à l'appel, comme avant. Décision par défaut, à confirmer par le propriétaire.
- **Un frais par COMMANDE** (un colis), quel que soit le nombre de copies (1–10). Hypothèse
  à confirmer par le propriétaire.
- Le client envoie le MODE (`deliveryMode`), jamais un montant : un `deliveryFee` venu du
  navigateur est ignoré. Sans mode (navigateur gardant l'ancien formulaire en cache) : mode
  et frais `NULL`.
- Le frais est figé sur la commande : modifier le tarif ne réécrit pas les commandes reçues.
- L'administrateur peut changer le mode à l'appel de confirmation (événement
  `delivery_mode` dans l'historique) ; **changer le mode ne recalcule PAS le frais** — il
  corrige le montant à côté.
- La colonne « Annuler » du tableau du transporteur (0 partout) n'est pas reprise.

## 3. API (`/api/v1`)

Public (`BookStoreController`) : `GET /books`, `GET /books/{slug}`,
`GET /books/wilayas`, `POST /books/{slug}/orders` (limiteur nommé `book-orders` : 8 / 10 min / IP),
`POST /books/messages` (`book-messages` : 5 / 10 min / IP). Limiteurs NOMMÉS
(`AppServiceProvider`) : un `throttle:8,10` en ligne partagerait sa clé « domaine|IP »
avec les autres routes publiques et la navigation l'épuiserait. Un livre en brouillon répond 404.
Les deux POST ont un **pot de miel** (champ caché `website`) : rempli → faux
succès, rien d'enregistré. Le téléphone est validé (format algérien) et la
wilaya doit appartenir à `App\Domain\Books\Wilayas`. `GET /books/wilayas` donne pour chaque
wilaya `delivery: { home, desk } | null` ; la commande accepte `deliveryMode` (`home` | `desk`,
facultatif) et répond `deliveryFee` et `total` (§2bis). L'adresse n'est plus
demandée par le formulaire (`address` : `nullable`) ; la commune reste une chaîne
libre côté serveur (le client la choisit dans la liste officielle).

Admin (`can:books` — l'administrateur ET le gestionnaire `book_manager`, §6ter — `/admin/…`) : `books` (liste, création, mise à jour),
`book-orders` (liste filtrable `status|bookId|wilaya|paymentStatus|search`,
`stats`, fiche, `PATCH` livraison (frais, mode)/note, `PATCH …/status`, `POST …/payments`,
`DELETE`), `book-order-payments/{id}` (DELETE), `book-messages` (liste, PATCH
état/note). Gestes journalisés (`ActivityLogger::BOOK_*`). Les formes JSON
sont dans `Domain/Books/BookPresenter.php` (camelCase).
Le même groupe `can:books` porte « حسابي » (`/admin/account*`). Les gestionnaires eux-mêmes
(`/admin/book-managers`, §6ter) restent `can:admin`.

## 4. Frontend

- Public (lots paresseux sous `MainLayout`) : `features/books/` —
  `BooksPage` (catalogue), `BookDetailPage` (présentation, étapes SMART,
  galerie, commande, FAQ, contact), `OrderForm`, `ContactForm`,
  `bookService.js`.
- Chaînes arabes : `features/books/strings.js` (module local, **pas** un
  namespace i18n : rien de la librairie n'entre dans le lot d'entrée).
- Contenu d'une page livre : entièrement tiré de la fiche (`content` JSON,
  éditable dans « الكتب »). Un nouveau livre = une ligne, aucun code.
  `content.socials` = `[{ network: 'youtube'|'facebook', url }]` → section « تابعنا » (avant le
  contact), un bouton par chaîne, nouvel onglet ; un réseau inconnu est ignoré. `smart-protocol` :
  `@SmartMathProtocol` sur YouTube et Facebook (2026-10-20, migration
  `2026_10_20_000001_add_socials_to_smart_protocol_book` — le seeder n'écrase pas une fiche existante).
- Admin : `pages/admin/books/` — `BookOrders` (chiffres + liste),
  `BookOrderDetail` (état, livraison, paiements, historique),
  `BookCatalog` (fiches), `BookMessages`. Routes `/admin/livres/*`, section
  « الكتب » de la barre latérale. Images : `public/images/books/<slug>/`.
- Lien « الكتب » dans la navigation visiteur (`data/navigation.js`).
- **Chargement sans cascade (2026-10-17)** : `features/books/bookCache.js` (importé par `App.jsx`,
  ne dépend que d'`apiClient`) lance `/books` ou `/books/:slug` DANS le `lazy()` de la route — les
  données partent avec le lot de la page, pas après lui. Une carte de la liste précharge la fiche et le
  lot `BookDetailPage` au survol / focus (`prefetchBookPage`). Une réponse reçue est rendue tout de suite
  au retour (`peekBook`, `peekBooks`), gardée 5 min puis redemandée en arrière-plan. Les pages publiques
  lisent `bookCache` ; `bookService.js` garde les écritures (commande, message) et l'admin.
- **Conversion, téléphone d'abord (2026-10-17)** — le lien arrive par WhatsApp : la page d'achat
  est la SEULE surface de la plateforme conçue aussi pour le téléphone (le reste : tablette et
  ordinateur). `BookHero` : sur téléphone l'image compacte d'abord, puis titre, prix « للنسخة »,
  bouton pleine largeur et trois garanties vérifiées (`S.detail.trust` : sans paiement en ligne,
  appel de confirmation, 58 wilayas) — résumé et auteur APRÈS (`order-last`), pour que l'achat
  tienne au-dessus du pli. `StickyOrderBar` (< lg) : prix + « اطلب نسختك » collés en bas dès que
  le bouton du haut sort de la vue, effacés quand le formulaire est à l'écran. Étapes SMART en
  cartes compactes, galerie en carrousel glissé au pouce, espacements resserrés.
- **Page d'atterrissage des publicités Facebook (2026-11-13)** — l'ordre de la page suit les
  questions du visiteur venu d'une pub (téléphone, quelques secondes pour décider) :
  - premier écran (`BookHero`) : livre en GRAND (190 px sur téléphone), badge, **`content.hook`**
    (le PROBLÈME du visiteur, avant le nom du produit ; le titre reste le `h1`), titre, prix,
    **UN seul bouton** « اطلب نسختك / الدفع عند الاستلام » (« اطرح سؤالًا » retiré du premier
    écran), trois garanties (sur téléphone : UNE ligne de mots courts, `S.detail.trustShort`).
    **Peu de texte** (owner, 2026-11-13) : avec une accroche, le titre est `sr-only` sur
    téléphone (la couverture le montre), et `hookSub` REMPLACE le sous-titre et le résumé (qui
    le répétaient) à toutes les tailles ; l'auteur reste dès `md`. Mesuré : le bouton est
    au-dessus du pli à 390×700 (540 px), 1024×768 et 1366×768 (665 px) ;
  - puis : pages INTÉRIEURES (galerie réordonnée, agrandies au toucher — « صفحات حقيقية ») →
    « ماذا ستجد داخل الكتاب؟ » (`stats`) → **« هل هذا الكتاب لك؟ »** (`content.forWho.yes / no`,
    dire aussi pour qui ce n'est PAS) → **« من كتب هذا الكتاب؟ »** (`content.authorBio` : photo ronde
    `author.webp` — recadrée avec la tour Eiffel, migration `2026_11_13_000003` + seeder — et trois
    lignes de références fournies par l'auteur ; jamais de titre inventé) → points forts → étapes SMART terminées par un bouton →
    commande → FAQ → réseaux → contact **replié** (ouvert d'office sur `#contact`) ;
  - clés `hook`, `hookSub`, `forWho` facultatives (une fiche sans elles garde l'ancien premier
    écran), éditables dans « الكتب » ; posées pour `smart-protocol` par la migration
    `2026_11_13_000002` (qui corrige aussi la réponse « كيف أدفع؟ ») et par `BookSeeder` ;
  - jamais d'urgence ou de preuve inventée (compteurs, « stock limité », avis) : la preuve
    sociale attend de VRAIS avis du propriétaire.
- **Meta Pixel (2026-11-13)** — `features/books/metaPixel.js`, ID `29440028942323985`. Chargé
  UNIQUEMENT par `BookDetailPage` / `OrderForm` (lot paresseux de la fiche) : jamais dans l'espace
  élève, l'espace parent ni l'administration (promesse « jardin clos » faite aux parents,
  `PARENT_SPACE.md`) ; ne pas l'importer ailleurs. Événements : `PageView` + `ViewContent` (arrivée
  sur la fiche), `InitiateCheckout` (premier champ touché, une fois), `Lead` (commande envoyée —
  pas `Purchase` : la vente n'est définitive qu'après l'appel et la livraison), valeur en `DZD`.
  AUCUNE donnée personnelle envoyée (ni nom, ni téléphone, ni commune). Rien n'est envoyé depuis
  `localhost`, sauf avec `?pixel=1` (test). La politique de confidentialité (§4) le dit.
  En développement, React.StrictMode rejoue les effets : `PageView` y apparaît deux fois, pas en
  production.
  Domaine vérifié chez Meta par `<meta name="facebook-domain-verification">` dans `apps/web/index.html`
  (HTML statique : le robot de Meta n'exécute pas React ; reprise par les pages de partage du build).
  Vérifié en production le 2026-11-13 : `PageView` et `ViewContent` reçus par le Pixel.
- **Formulaire de commande (refonte du 2026-11-13, après un relevé de 7 pages COD algériennes
  + 2 internationales et un conseil à 5 voix)** — `OrderForm.jsx` :
  - champs : nom → téléphone → wilaya → commune → **mode de livraison** → nombre de copies ; courriel et note repliés
    (« + بريد إلكتروني أو ملاحظة ») ; **plus d'adresse** (« العنوان الدقيق نطلبه منك عند الاتصال ») ;
  - **wilaya** : `SearchSelect.jsx`, numérotée (« 16 الجزائر », arabe seul affiché), cherchée par
    numéro (16, ١٦), par nom (avec/sans « ال », variantes d'écriture) ou en latin ; un nom de
    **commune** la trouve aussi (« بوسعادة » → 28 المسيلة) et remplit les deux champs — un client
    d'une wilaya créée en 2025 retrouve ainsi la sienne ;
  - **commune** : inactive tant qu'aucune wilaya n'est choisie, puis la liste arabe cherchable de
    CETTE wilaya — `data/dzCommunes.json` (1541 communes / 58 wilayas, chargé en lot séparé,
    ≈ 18 Ko gzip), régénéré par `scripts/build-dz-communes.mjs` depuis le découpage officiel ;
    recherche tolérante `dzSearch.js` (réutilise `normalizeSearchText`) ;
  - `SearchSelect` : plein écran rendu dans `<body>` sous 640 px (la barre du site ne le couvre
    pas), menu sous le champ au-delà ; ↑ ↓ Entrée Échap ; le « retour » d'Android FERME la liste
    (entrée d'historique sur la même URL) — une liste qui s'ouvre attend le `history.back()` de
    la précédente ;
  - téléphone : gabarit « xx xx xx xx xx » (jamais un vrai numéro), `type=tel`, chiffres
    arabo-hindis / +213 / 00213 ramenés à « 0XXXXXXXXX » (`orderValidation.js`, même règle que
    `BookStoreController::PHONE`) ;
  - nombre de copies : − / + ET saisie directe (chiffres arabes ou latins), borné à 1–10 ;
  - erreurs : message arabe sous CHAQUE champ (au départ du champ, puis à l'envoi, focus sur le
    premier) ; un 422 du serveur revient sous le champ concerné (`error.fields`) ;
  - brouillon gardé en `sessionStorage` (rechargement, navigateur intégré de WhatsApp), effacé
    après une commande ;
  - **mode de livraison (2026-11-22)** : deux cartes radio côte à côte, « التوصيل إلى المنزل »
    (présélectionnée) et « الاستلام من مكتب التوصيل », chacune avec SON prix dès la wilaya
    choisie (`delivery.js` : `deliveryFeeFor`, `orderTotal` — affichage seul, le serveur
    recalcule) ; « أقلّ تكلفة » seulement si le bureau est vraiment moins cher ; sans wilaya ou
    sans tarif, une phrase sous les cartes ;
  - récapitulatif juste AU-DESSUS du bouton « أرسل الطلب / الدفع عند الاستلام » : prix, frais de
    livraison, **« المجموع عند الاستلام » (frais compris)** ; pour une wilaya sans tarif, « تُحدَّد
    لاحقًا » et « المجموع دون التوصيل » — jamais un total qui tait un frais connu. L'écran de
    succès redit le montant à payer à la réception. La valeur envoyée au Pixel reste celle du
    livre, sans la livraison ;
  - **le bouton bat 3 fois (≈ 3,6 s, `animate-cta-ready`) quand le formulaire DEVIENT complet**,
    jamais sur un formulaire vide ni sous `prefers-reduced-motion` (`motion-safe:`) : le
    « clignotement » demandé par le propriétaire, conforme WCAG 2.2.2 ;
  - garanties : « التوصيل إلى كل ولايات الوطن » (et non « 58 ») ; « تدفع نقدًا عند استلام الكتاب ».
- **Aucun saut de mise en page** : squelettes à la forme des cartes / de la présentation pendant le
  chargement ; l'image de présentation est dans une boîte de hauteur fixe (`h-[420px] lg:h-[540px]`,
  `fetchpriority="high"`). CLS de la fiche mesuré 0,44 avant ce changement.

## 5. Premier livre et mise en service

`php artisan db:seed --class=BookSeeder` crée `smart-protocol` (idempotent,
n'écrase jamais une fiche existante ; aussi appelé par `DatabaseSeeder`).

## 6. Non implémenté / à venir

- Frais de livraison : fait le 2026-11-22 (§2bis). Restent : un tarif pour les wilayas 50 et
  54 ; le recalcul proposé à l'administrateur quand il change le mode ; la FAQ « كيف أدفع؟ »
  de la fiche `smart-protocol` (contenu en base) dit encore « وإخبارك بتكلفة التوصيل ».
- Les 69 wilayas du découpage de 2025 : la liste (`Wilayas.php`, `dzCommunes.json`) reste à
  58 tant que le rattachement officiel des communes aux 11 nouvelles wilayas n'est pas
  vérifié ; la recherche par commune couvre le cas en attendant.
- Mesure complète de l'entonnoir (vue → début → envoi → confirmée → livrée) : le Pixel couvre les
  trois premières étapes ; « confirmée » et « livrée » restent dans l'admin des commandes. API de
  conversions (côté serveur) non faite.
- Paiement en ligne : volontairement absent.
- Stock, export CSV des commandes, notification (e-mail/WhatsApp) à la
  réception d'une commande.

## 6bis. Aperçu de partage (WhatsApp / Facebook / Telegram)

Les robots de partage lisent le HTML sans exécuter React. Le build écrit donc,
pour chaque entrée de `apps/web/src/features/books/shareCards.json`, un fichier
`dist/share/<path>.html` (`share/books.html`, `share/books/smart-protocol.html`) = l'`index.html` du build dont `<title>`, description,
`og:*`, `twitter:*` et `canonical` parlent de CETTE page
(`apps/web/vite-plugin-share-pages.js`, testé par `vite-plugin-share-pages.test.js`), et remplace
le marqueur `# @share-pages` par UNE règle explicite par page
(`RewriteRule ^books/smart-protocol/?$ share/books/smart-protocol.html [L]`, avec ou sans « / » final).
Le plugin ne relit JAMAIS `dist/` comme source (depuis le 2026-10-29) : le modèle est `public/.htaccess`, le résultat
est écrit dans `dist/.htaccess`, et l'`index.html` de base est pris dans le lot du build (`writeBundle`). Un `dist/`
laissé par un autre build — deux builds lancés en même temps dans le même arbre — ne fait plus échouer `npm run build`.
**Aucun dossier ni fichier ne porte le chemin public** : LiteSpeed (Hostinger) redirige tout dossier
existant vers « …/ » AVANT les règles de réécriture et ignore `DirectorySlash` — jusqu'au 2026-10-17,
`dist/books/smart-protocol/index.html` coûtait un 301 avant tout affichage. Le déploiement efface les
restes des anciens builds (`books/`, `books.html` à la racine ; rsync ne supprime rien) et vérifie que
`/books/smart-protocol` répond 200 avec sa page de partage (`deploy.yml`, « Verify the assets and SPA routing »).

**Le premier écran de la fiche est dans le HTML (2026-10-17).** Pour une carte de livre, le
plugin lit le livre à l'API (`VITE_API_URL`, délai 8 s) pendant le build et écrit :
- le composant RÉEL `features/books/BookHero.jsx` rendu par `react-dom/server` (aucune copie à
  maintenir : BookHero doit rester pur — ni hook, ni contexte, ni routeur ; le lien « كل الكتب »
  est une prop `LinkComponent`), dans un calque `#sa-static-shell` posé AU-DESSUS de `#root`
  (avec une barre de navigation réduite) ; l'écran « جارٍ تحميل Smarter Academy » est retiré ;
- `window.__SA_BOOK_SNAPSHOT__` (lu par `bookCache.js` : la fiche React s'affiche sans attendre
  l'API, puis se met à jour — prix compris — si le livre a changé depuis le build) ;
- `<link rel="preload">` de l'image et `<link rel="modulepreload">` du lot `BookDetailPage` et
  de ses imports.
`BookDetailPage` retire le calque (`removeStaticBookShell`) une fois la vraie fiche montée :
jamais d'écran blanc. **« هذا الكتاب غير موجود » n'apparaît que sur un 404** : un échec de la
relecture (réseau, 429, 500, CORS) laisse la fiche déjà affichée (2026-10-20 — sur
`www.smarter-academy.com`, l'appel à `https://smarter-academy.com/api/v1` était bloqué par le CORS
et remplaçait la fiche par ce message). Depuis, `public/.htaccess` redirige (301) tout `www.` vers
le domaine nu : le site n'a qu'un hôte, celui de `VITE_API_URL`. Si l'API ne répond pas au build, la page reste une simple page de partage
(avertissement dans le log du build). Mesuré (téléphone 390×844 et tablette, 1,6 Mbit/s, 4× CPU) :
contenu visible à ≈ 1,0 s au lieu de 4,8 s, sans écran de chargement. **Un nouveau livre** : une entrée dans `shareCards.json`,
sa carte 1200×630 dans `public/og/` (`python3 scripts/og-book-card.py <couverture>.webp "<titre>"
--eyebrow "…" -o apps/web/public/og/<slug>.png` : la VRAIE couverture + le titre ;
`scripts/og-card.py` reste le gabarit texte seul) et une ligne dans
`public/sitemap.xml`. Le premier livre : `og/smart-protocol.png`.
Limite : titre/description de partage sont figés au build — les modifier dans
l'admin ne change pas l'aperçu avant un nouveau build.

## 6ter. Le gestionnaire de la librairie « مسيّر المكتبة » (2026-11-13)

Un rôle de plus dans la colonne libre `users.role` : **`book_manager`** (`User::ROLE_BOOK_MANAGER`).
Il vend les livres et ne fait RIEN d'autre sur la plateforme.

- **Création : par l'administrateur seul**, jamais par une inscription. Page « مسيّرو المكتبة »
  `/admin/livres/gestionnaires` (section « الكتب », visible de l'administrateur seul) :
  nom, prénom, adresse → un compte `book_manager` à l'adresse vérifiée et un mot de passe
  généré, **montré une fois** (copier puis remettre). Une adresse qui a déjà un compte est
  refusée (`reason: email_taken`) — on ne transforme pas un élève ou un enseignant. La même page
  suspend / réactive (suspendre ferme ses sessions) et réédite le mot de passe (sessions fermées).
  API `can:admin` : `GET|POST /admin/book-managers`, `PATCH …/{id}/status` (`active|suspended`),
  `POST …/{id}/password` (`AdminBookManagerController`). Journal : `book_manager.*`, jamais le mot de passe.
- **Ce qu'il ouvre : la porte `books`** (`Gate::define('books')` = admin ou book_manager) —
  `books`, `book-orders`, `book-order-payments`, `book-messages` et son propre compte
  `/admin/account*`. Toute autre route `/admin/*` lui répond 403 (`AdminAuthorizationTest`
  balaie toutes les routes).
- **Frontend :** il se connecte par la page de connexion normale et atterrit sur
  `/admin/livres/commandes`. Le panneau est le même (`AdminLayout`) ; la barre latérale ne
  montre que « الكتب » (الطلبات · الكتب · الرسائل) et « حسابي » (`adminNavSectionsFor(role)` ;
  `roles` sur une section / un lien, absent = administrateur seul). Toute autre adresse
  `/admin/*` le ramène aux commandes (`components/auth/AdminOnlyOutlet.jsx`).

## 6quater. Notifications du tableau de bord sur le téléphone (Web Push, 2026-11-13)

Chaque événement de la plateforme envoie une notification aux appareils des comptes du tableau
de bord qui l'ont activée — même site fermé. Un événement = un **sujet** (`App\Domain\Push\AdminPush::TOPICS`) :

| Sujet | Déclencheur | Public | Écran verrouillé | Ouvre |
|---|---|---|---|---|
| `book_order` | `BookStoreController::order` | admin + « مسيّر المكتبة » | « طلب جديد · BK-… » — wilaya · copies · montant | la commande |
| `book_message` | `BookStoreController::message` | admin + « مسيّر المكتبة » | le sujet du message | `/admin/livres/messages` |
| `new_student` / `new_teacher` | `AuthController::register`, `GoogleAccountLinker` (inscription Google) | admin | « تلميذ جديد » / « أستاذ جديد » + nombre d'inscriptions du jour (Alger) | la fiche |
| `contact_message` | `ContactController::store` | admin | « رسالة جديدة » | `/admin/systeme/messages` |
| `student_report` (بلاغ) | `ReportService::create` | admin | la catégorie (« خطأ رياضي »…) · code de leçon | le signalement |
| `subscription_request` | `SubscriptionRequestService` | admin | l'offre · sièges | `/admin/offres/demandes` |

- Les comptes créés PAR l'administration (classes d'une école, gestionnaires) ne notifient pas.
- Les inscriptions portent le MÊME `tag` : une seule notification, remplacée et recomptée — une
  vague d'inscriptions ne remplit pas l'écran.
- **Écran verrouillé** : jamais le nom, le téléphone, l'adresse ou le texte d'un message (des
  élèves mineurs y figurent) — vérifié par `AdminPushTest`.
- **Envoi après la réponse** (`AdminPush::later()` → `dispatch(...)->afterResponse()`) : une
  inscription, une commande ou un signalement ne dépend jamais de l'envoi ; une panne est absorbée
  et journalisée ; un appareil expiré (404/410) est supprimé.
- **Choix par appareil** : `push_subscriptions.topics` (JSON, `NULL` = tous les sujets du rôle).
  Le panneau « الإشعارات على هاتفك » (`pages/admin/notifications/AdminNotifications.jsx`) montre une
  case par sujet du rôle ; l'administrateur l'a sur l'accueil du tableau de bord, le gestionnaire
  sur « طلبات الكتب ». Il propose aussi « أرسل إشعارًا تجريبيًا », « إيقاف على هذا الجهاز » et
  « أضف إلى الشاشة الرئيسية » (`beforeinstallprompt`, sinon la marche à suivre).
- **`public/sw.js` n'a AUCUN gestionnaire `fetch`** : rien en cache ; il affiche la notification
  et ouvre sa page au toucher. Il n'est enregistré qu'au clic d'un compte du tableau de bord —
  jamais chez un élève. Pas de raccourci dans le manifeste (visible de tout visiteur).
- **API** (porte `books`, chaque compte ne gère que SES appareils et seulement les sujets de son
  rôle — 422 sinon) : `GET /admin/push[?endpoint=]`, `POST|PATCH|DELETE /admin/push/subscriptions`,
  `POST /admin/push/test` (`AdminPushController`). `AdminAuthorizationTest` ouvre `push` au
  gestionnaire.
- **Envoi** : `WebPushSender` (paquet `minishlink/web-push`, `aes128gcm`, VAPID) derrière
  l'interface `PushSender` (remplacée en test).
- **Clés VAPID** : `php artisan books:vapid-keys` → `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `VAPID_SUBJECT` dans le `.env` du SERVEUR (le déploiement ne le livre jamais). Sans clés, la
  fonction est désactivée (le panneau le dit). Changer de clés désabonne tous les appareils.
- **Appareils** : Android + Chrome ; iPhone : iOS 16.4+, depuis le site AJOUTÉ à l'écran d'accueil.
- **Tableau de bord sur téléphone** : la grille des cartes « récentes » (`Dashboard.jsx`) a
  `[&>*]:min-w-0` — sans cela, un titre long élargissait la page de 21 px (décalage RTL invisible).
- Tests : `AdminPushTest` (publics par sujet, choix par appareil, 422 pour un sujet hors rôle,
  textes sans donnée personnelle, comptes suspendus exclus, désabonnement, expirés, sans clés).
  Vérifié le 2026-11-13 : un vrai envoi chiffré et signé reçu par un récepteur local (201).

## 7. Tests

`apps/api/tests/Feature/BookStoreTest.php` (vitrine, prix figé, validation,
pot de miel, états, livraison — frais par wilaya et par mode, frais du client ignoré,
wilaya sans tarif, table de 56 lignes —, paiements, statistiques, interdiction élève) ;
`features/books/delivery.test.js` côté web ;
le balayage `AdminAuthorizationTest` couvre les routes `/admin/book*` et prouve que le
gestionnaire `book_manager` n'ouvre QUE la librairie et son compte ; `BookManagerTest`
(création, adresse prise, suspension, mot de passe réédité) ; côté web
`services/admin/adminServices.test.js` (porte `/admin`, navigation filtrée par rôle).
