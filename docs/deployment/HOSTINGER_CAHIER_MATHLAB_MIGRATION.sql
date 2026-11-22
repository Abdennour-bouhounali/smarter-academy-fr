-- ============================================================================
-- SMARTER ACADEMY — MIGRATION « كرّاسي (CAHIER) + MATH LAB »
-- À exécuter UNE SEULE FOIS dans Hostinger hPanel → phpMyAdmin → onglet SQL
-- ============================================================================
--
-- D'OÙ VIENT CE SQL : `php artisan migrate --pretend` exécuté contre une base
-- au schéma de production (migrations `2026_09_21_*` de l'unité 1 appliquées).
-- Il reproduit EXACTEMENT les quatre migrations Laravel
--   2026_09_22_000001_add_module_number_to_notebook_notes
--   2026_09_23_000001_extend_notebook_notes_for_cahier
--   2026_09_24_000001_create_math_lab_documents_table
--   2026_09_25_000001_create_math_lab_files_table
-- pour une base où `php artisan migrate` ne peut pas être lancé faute d'accès
-- terminal. Le pipeline de déploiement n'applique JAMAIS les migrations (voir
-- .github/workflows/deploy.yml § « Laravel post-deployment ») : c'est une
-- politique, pas un oubli.
--
-- POURQUOI C'EST NÉCESSAIRE MAINTENANT
--   Ces quatre migrations n'avaient pas de fichier SQL relu, contrairement aux
--   migrations de l'unité 1 et des offres enseignants. Sans elles, en
--   production :
--     • les tables `math_lab_documents` et `math_lab_files` N'EXISTENT PAS —
--       `GET /api/v1/math-lab/documents` répond 500 ;
--     • le cahier « كرّاسي » lit des colonnes absentes de `notebook_notes`.
--   Observé en production le 2026-09-23 (500 sur `/math-lab/documents`).
--
-- ORDRE D'EXÉCUTION DES FICHIERS SQL — ce fichier n'est pas le premier :
--   1. HOSTINGER_AUTH_MIGRATION.sql            (2026_09_18_*)
--   2. HOSTINGER_UNIT1_MIGRATION.sql           (2026_09_21_*)  ← prérequis
--   3. HOSTINGER_UNIT1_CURRICULUM_DATA.sql     (données unité 1)
--   4. **CE FICHIER**                          (2026_09_22 → 2026_09_25)
--   5. HOSTINGER_MATHLAB_WORK_MIGRATION.sql    (2026_09_26_000001, atelier)
--   6. HOSTINGER_TEACHER_PLANS_MIGRATION.sql   (2026_09_26_* / 2026_09_27_*)
--   Les blocs de CE fichier s'exécutent eux aussi DANS L'ORDRE :
--   `math_lab_files` référence `math_lab_documents` (clé étrangère).
--
-- GARANTIES : 100 % ADDITIF — deux tables créées, une table étendue
-- (`notebook_notes`). Aucun DROP, aucun DELETE, aucun TRUNCATE. Toutes les
-- colonnes ajoutées acceptent NULL ou ont une valeur par défaut : aucune note
-- existante n'est invalidée. Le seul UPDATE est la REPRISE optionnelle du § 5,
-- clairement isolée et commentée.
--
-- PRÉREQUIS : sauvegarde de la base (phpMyAdmin → Exporter → SQL).
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 1/4 — 2026_09_22_000001_add_module_number_to_notebook_notes   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
alter table `notebook_notes` add `module_number` smallint unsigned null after `learning_point_id`;

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 2/4 — 2026_09_23_000001_extend_notebook_notes_for_cahier   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
alter table `notebook_notes` add `title` varchar(160) null after `user_id`;
alter table `notebook_notes` add `note_type` varchar(20) not null default 'note' after `mistake_type`;
alter table `notebook_notes` add `is_pinned` tinyint(1) not null default '0' after `note_type`;
alter table `notebook_notes` add `archived_at` timestamp null after `completed_at`;
alter table `notebook_notes` add `next_review_at` timestamp null after `archived_at`;
alter table `notebook_notes` add `last_reviewed_at` timestamp null after `next_review_at`;
alter table `notebook_notes` add `review_count` smallint unsigned not null default '0' after `last_reviewed_at`;
alter table `notebook_notes` add `content_text` text null after `content`;
alter table `notebook_notes` add index `notebook_notes_user_id_archived_at_index`(`user_id`, `archived_at`);
alter table `notebook_notes` add index `notebook_notes_user_id_next_review_at_index`(`user_id`, `next_review_at`);
alter table `notebook_notes` add index `notebook_notes_user_id_created_at_index`(`user_id`, `created_at`);
alter table `notebook_notes` add index `notebook_notes_user_id_note_type_index`(`user_id`, `note_type`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 3/4 — 2026_09_24_000001_create_math_lab_documents_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `math_lab_documents` (`id` bigint unsigned not null auto_increment primary key, `user_id` bigint unsigned not null, `tool` varchar(40) not null, `title` varchar(160) not null, `schema_version` smallint unsigned not null default '1', `data` json not null, `data_bytes` int unsigned not null default '0', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `math_lab_documents` add constraint `math_lab_documents_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade;
alter table `math_lab_documents` add index `math_lab_documents_user_id_tool_updated_at_index`(`user_id`, `tool`, `updated_at`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 4/4 — 2026_09_25_000001_create_math_lab_files_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `math_lab_files` (`id` bigint unsigned not null auto_increment primary key, `user_id` bigint unsigned not null, `document_id` bigint unsigned not null, `kind` varchar(16) not null, `original_name` varchar(255) not null, `mime_type` varchar(100) not null, `size` int unsigned not null, `disk_path` varchar(255) not null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `math_lab_files` add constraint `math_lab_files_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade;
alter table `math_lab_files` add constraint `math_lab_files_document_id_foreign` foreign key (`document_id`) references `math_lab_documents` (`id`) on delete cascade;
alter table `math_lab_files` add index `math_lab_files_user_id_index`(`user_id`);
alter table `math_lab_files` add index `math_lab_files_document_id_index`(`document_id`);

-- ────────────────────────────────────────────────────────────────────────────
-- JOURNAL DES MIGRATIONS — pour que `php artisan migrate:status` dise la vérité
-- ────────────────────────────────────────────────────────────────────────────
SET @batch := (SELECT COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_22_000001_add_module_number_to_notebook_notes', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_23_000001_extend_notebook_notes_for_cahier', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_24_000001_create_math_lab_documents_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_25_000001_create_math_lab_files_table', @batch);

-- ============================================================================
-- § 5 — REPRISE DES NOTES EXISTANTES (file de révision et type d'erreur)
-- ============================================================================
-- La migration Laravel 2026_09_23_000001 fait, en PHP et par paquets de 200,
-- une reprise en TROIS parties. Deux d'entre elles sont du SQL exact et sont
-- reproduites ci-dessous. La troisième (`content_text`) ne l'est PAS.
--
-- POURQUOI `content_text` N'EST PAS REPRIS ICI
--   La migration le calcule avec `NotebookNote::plainText()` : retrait des
--   balises HTML PUIS décodage des entités (`&amp;`, `&#160;`…) PUIS
--   normalisation des espaces. MySQL ne sait faire ni le premier ni le
--   deuxième de façon fiable. Écrire un `REPLACE()` approximatif mettrait du
--   HTML à moitié nettoyé dans la colonne de RECHERCHE — pire que la laisser
--   NULL.
--   Conséquence d'une colonne NULL, mesurée dans le code : `content_text` ne
--   sert QUE à l'extrait (`PracticeNotebookController` ligne ~194) et à la
--   recherche (`NotebookService` ligne ~368). Une note ancienne reste donc
--   LISIBLE et intacte ; elle est seulement absente des résultats de recherche
--   jusqu'à sa prochaine modification — `NotebookService` réécrit
--   `content_text` à CHAQUE création et à chaque mise à jour. La reprise est
--   donc AUTO-RÉPARATRICE, et ce fichier ne la fabrique pas mal.
--   Pour une reprise complète et fidèle, la seule voie correcte est PHP :
--   `php artisan migrate` (si un terminal est disponible un jour), ou un
--   script ponctuel réutilisant `NotebookNote::plainText()`.
--
-- Les deux UPDATE ci-dessous sont IDEMPOTENTS et NE TOUCHENT QUE des colonnes
-- créées à l'instant (toutes NULL ou à leur valeur par défaut) : aucune donnée
-- d'élève antérieure n'est écrasée.
-- ────────────────────────────────────────────────────────────────────────────

-- 5a. File de révision : jusqu'ici, une note sans `completed_at` s'affichait
--     « للمراجعة ». Ce sens est CONSERVÉ — ces notes entrent dans la file, à
--     leur date de création (exactement la règle de la migration).
UPDATE `notebook_notes` SET `next_review_at` = `created_at` WHERE `completed_at` IS NULL AND `next_review_at` IS NULL;

-- 5b. Type : une note d'exercice portant un type d'erreur EST une erreur.
UPDATE `notebook_notes` SET `note_type` = 'erreur' WHERE `mistake_type` IS NOT NULL AND `note_type` = 'note';

-- ────────────────────────────────────────────────────────────────────────────
-- VÉRIFICATION (lecture seule)
-- ────────────────────────────────────────────────────────────────────────────
SELECT COUNT(*) AS tables_ok FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('math_lab_documents', 'math_lab_files'); -- attendu : 2
SELECT COUNT(*) AS colonnes_cahier_ok FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name IN ('module_number', 'title', 'note_type', 'is_pinned', 'archived_at', 'next_review_at', 'last_reviewed_at', 'review_count', 'content_text'); -- attendu : 9
SELECT COUNT(*) AS notes_intactes FROM `notebook_notes`; -- attendu : le même nombre qu'AVANT la migration
SELECT COUNT(*) AS en_revision FROM `notebook_notes` WHERE `next_review_at` IS NOT NULL; -- attendu : le nombre de notes sans `completed_at`
SELECT COUNT(*) AS erreurs FROM `notebook_notes` WHERE `note_type` = 'erreur'; -- attendu : le nombre de notes avec `mistake_type`
SELECT COUNT(*) AS documents_mathlab FROM `math_lab_documents`; -- attendu : 0 (table neuve)
SELECT `migration`, `batch` FROM `migrations` WHERE `migration` IN ('2026_09_22_000001_add_module_number_to_notebook_notes', '2026_09_23_000001_extend_notebook_notes_for_cahier', '2026_09_24_000001_create_math_lab_documents_table', '2026_09_25_000001_create_math_lab_files_table') ORDER BY `migration`; -- attendu : 4 lignes

-- ────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (seulement si un bloc a échoué à mi-chemin ; sinon restaurer la sauvegarde)
-- ────────────────────────────────────────────────────────────────────────────
-- DELETE FROM `migrations` WHERE `migration` IN ('2026_09_22_000001_add_module_number_to_notebook_notes', '2026_09_23_000001_extend_notebook_notes_for_cahier', '2026_09_24_000001_create_math_lab_documents_table', '2026_09_25_000001_create_math_lab_files_table');
-- DROP TABLE IF EXISTS `math_lab_files`;
-- DROP TABLE IF EXISTS `math_lab_documents`;
-- ALTER TABLE `notebook_notes` DROP INDEX `notebook_notes_user_id_note_type_index`, DROP INDEX `notebook_notes_user_id_created_at_index`, DROP INDEX `notebook_notes_user_id_next_review_at_index`, DROP INDEX `notebook_notes_user_id_archived_at_index`;
-- ALTER TABLE `notebook_notes` DROP COLUMN `content_text`, DROP COLUMN `review_count`, DROP COLUMN `last_reviewed_at`, DROP COLUMN `next_review_at`, DROP COLUMN `archived_at`, DROP COLUMN `is_pinned`, DROP COLUMN `note_type`, DROP COLUMN `title`;
-- ALTER TABLE `notebook_notes` DROP COLUMN `module_number`;
