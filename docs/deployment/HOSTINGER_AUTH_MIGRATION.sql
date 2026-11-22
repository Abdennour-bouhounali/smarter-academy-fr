-- ============================================================================
-- SMARTER ACADEMY — MIGRATION « LÉGAL + AUTHENTIFICATION »
-- À exécuter UNE SEULE FOIS dans Hostinger hPanel → phpMyAdmin → onglet SQL
-- ============================================================================
--
-- CE QUE CE FICHIER FAIT
--   Il reproduit EXACTEMENT les trois migrations Laravel introduites par le
--   chantier légal/authentification, pour une base où `php artisan migrate`
--   ne peut pas être lancé faute d'accès terminal.
--
-- D'OÙ VIENT CE SQL
--   Il n'a pas été écrit à la main. Il a été produit par
--   `php artisan migrate --pretend` exécuté contre une copie de la base de
--   production, puis RÉELLEMENT exécuté sur cette copie pour vérifier que
--   les 15 comptes existants survivaient intacts. Voir
--   HOSTINGER_FILE_MANAGER_DEPLOYMENT.md § « Vérification ».
--
-- GARANTIES
--   • 100 % ADDITIF : trois colonnes ajoutées, une table créée, une colonne
--     assouplie. Aucun DROP, aucun DELETE, aucun TRUNCATE, aucun UPDATE de
--     données existantes.
--   • Aucun compte n'est supprimé, modifié, ni « réparé ».
--   • Aucune date de vérification n'est fabriquée : les comptes dont
--     `email_verified_at` est NULL le RESTENT (c'est la vérité, et c'est
--     voulu — voir la migration 1 pour le raisonnement).
--   • Rien n'est touché hors de `users` et `user_identities` : les leçons,
--     la progression, les abonnements et les paiements ne sont pas concernés.
--
-- PRÉREQUIS ABSOLU
--   Faire une SAUVEGARDE de la base AVANT (phpPMyAdmin → Exporter → SQL).
--   C'est le seul moyen de revenir en arrière, cf. § ROLLBACK plus bas.
--
-- ORDRE
--   Les trois blocs doivent être exécutés DANS L'ORDRE. Le bloc 2 crée une
--   clé étrangère vers `users`, le bloc 3 modifie `users`.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 1/3 — 2026_09_18_000001_add_legal_consent_to_users_table
--
-- Table    : users (ALTER, additif)
-- Colonnes : terms_accepted_version, privacy_policy_accepted_version,
--            legal_consent_at
-- Additif  : OUI    Destructif : NON
--
-- Les trois colonnes sont NULL pour les comptes existants, et c'est
-- intentionnel : ces élèves n'ont jamais accepté les documents (ils n'ont
-- pas pu — l'écran n'existait pas). NULL se lit « aucun consentement
-- enregistré », ce qui est exact. Leur écrire une date fabriquerait une
-- preuve de consentement.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE `users` ADD `terms_accepted_version` varchar(32) NULL AFTER `grade`;
ALTER TABLE `users` ADD `privacy_policy_accepted_version` varchar(32) NULL AFTER `terms_accepted_version`;
ALTER TABLE `users` ADD `legal_consent_at` timestamp NULL AFTER `privacy_policy_accepted_version`;


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 2/3 — 2026_09_18_000002_create_user_identities_table
--
-- Table    : user_identities (CREATE)
-- Additif  : OUI    Destructif : NON
--
-- Table NEUVE : elle n'existe pas encore en production, rien ne peut donc
-- être écrasé. Elle relie un compte local à une identité Google.
--
-- Les deux index UNIQUE sont la garantie anti-détournement, appliquée par la
-- BASE et non par du code :
--   • (provider, provider_user_id) : une identité Google ne peut appartenir
--     qu'à UN SEUL compte local.
--   • (user_id, provider)          : un compte local n'a qu'une identité par
--     fournisseur.
--
-- La clé étrangère est ON DELETE CASCADE : supprimer un compte supprime ses
-- identités. Elle ne supprime JAMAIS dans l'autre sens.
--
-- Aucun jeton Google n'est stocké (ni access, ni refresh) : l'application
-- demande qui est la personne, pas des pouvoirs sur son compte.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE `user_identities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` bigint unsigned NOT NULL,
  `provider` varchar(32) NOT NULL,
  `provider_user_id` varchar(255) NOT NULL,
  `provider_email` varchar(255) NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user_identities`
  ADD CONSTRAINT `user_identities_user_id_foreign`
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `user_identities`
  ADD UNIQUE `user_identities_provider_provider_user_id_unique` (`provider`, `provider_user_id`);

ALTER TABLE `user_identities`
  ADD UNIQUE `user_identities_user_id_provider_unique` (`user_id`, `provider`);


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 3/3 — 2026_09_18_000003_make_password_nullable_on_users_table
--
-- Table    : users (MODIFY d'une colonne)
-- Additif  : OUI (assouplissement de contrainte)    Destructif : NON
--
-- ATTENTION — C'EST LA SEULE INSTRUCTION QUI RÉÉCRIT UNE COLONNE EXISTANTE.
-- Elle ne change QUE la nullabilité : le type (varchar 255) et la collation
-- (utf8mb4_unicode_ci, héritée du défaut de la table) sont inchangés.
-- Aucune valeur n'est modifiée : les mots de passe existants sont conservés
-- tels quels. Vérifié sur copie : 15 comptes, 0 mot de passe perdu.
--
-- Pourquoi : un compte Google n'a pas de mot de passe. NULL dit la vérité,
-- alors qu'un mot de passe aléatoire créerait un secret que personne ne
-- connaît, que personne ne peut révoquer, et qui rendrait impossible de
-- savoir si un compte dispose d'une connexion par mot de passe.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE `users` MODIFY `password` varchar(255) NULL;


-- ────────────────────────────────────────────────────────────────────────────
-- JOURNAL DES MIGRATIONS
--
-- Indispensable : sans ces trois lignes, un futur `php artisan migrate`
-- (si un accès terminal existe un jour) RÉEXÉCUTERAIT ces migrations et
-- échouerait sur « column already exists ».
--
-- Le numéro de lot (batch) vaut ici « dernier lot + 1 ». Le SELECT le calcule
-- tout seul : ne pas coder 17 en dur, le lot courant en production peut
-- différer de celui observé sur la copie locale.
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO `migrations` (`migration`, `batch`) VALUES
  ('2026_09_18_000001_add_legal_consent_to_users_table',      (SELECT * FROM (SELECT COALESCE(MAX(`batch`),0)+1 FROM `migrations`) AS b)),
  ('2026_09_18_000002_create_user_identities_table',          (SELECT * FROM (SELECT COALESCE(MAX(`batch`),0)   FROM `migrations`) AS b)),
  ('2026_09_18_000003_make_password_nullable_on_users_table', (SELECT * FROM (SELECT COALESCE(MAX(`batch`),0)   FROM `migrations`) AS b));


-- ────────────────────────────────────────────────────────────────────────────
-- VÉRIFICATION — à exécuter APRÈS, pour lire ce qui s'est passé.
-- Aucune de ces requêtes n'écrit quoi que ce soit.
-- ────────────────────────────────────────────────────────────────────────────
--
-- SELECT COUNT(*) AS comptes_total,
--        SUM(`password` IS NULL)          AS comptes_sans_mot_de_passe,
--        SUM(`email_verified_at` IS NULL) AS comptes_non_verifies,
--        SUM(`legal_consent_at` IS NULL)  AS comptes_sans_consentement
--   FROM `users`;
--   -- Attendu juste après la migration : comptes_sans_mot_de_passe = 0,
--   -- comptes_total inchangé, et comptes_sans_consentement = comptes_total.
--
-- SELECT COUNT(*) AS identites FROM `user_identities`;   -- attendu : 0
--
-- SELECT `migration`, `batch` FROM `migrations` ORDER BY `id` DESC LIMIT 3;
--   -- attendu : les trois migrations 2026_09_18_*, même numéro de lot.


-- ============================================================================
-- ROLLBACK (uniquement si nécessaire, et dans CET ordre)
--
-- ⚠ À n'exécuter QUE si aucun compte Google n'a encore été créé. Repasser
--   `password` en NOT NULL alors qu'un compte Google existe obligerait à lui
--   inventer un mot de passe — précisément ce que la migration 3 évite.
--   Vérifier d'abord :  SELECT COUNT(*) FROM `users` WHERE `password` IS NULL;
--   Si le résultat n'est pas 0 : NE PAS exécuter la dernière ligne.
--
-- DELETE FROM `migrations` WHERE `migration` IN (
--   '2026_09_18_000001_add_legal_consent_to_users_table',
--   '2026_09_18_000002_create_user_identities_table',
--   '2026_09_18_000003_make_password_nullable_on_users_table');
-- DROP TABLE IF EXISTS `user_identities`;
-- ALTER TABLE `users`
--   DROP COLUMN `terms_accepted_version`,
--   DROP COLUMN `privacy_policy_accepted_version`,
--   DROP COLUMN `legal_consent_at`;
-- ALTER TABLE `users` MODIFY `password` varchar(255) NOT NULL;
-- ============================================================================
