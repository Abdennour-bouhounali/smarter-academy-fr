-- ============================================================================
-- SMARTER ACADEMY — RATTRAPAGE COMPLET DU SCHÉMA (UN SEUL FICHIER)
-- À exécuter dans Hostinger hPanel → phpMyAdmin → onglet SQL
-- ============================================================================
--
-- NE PAS MODIFIER À LA MAIN. Fichier ASSEMBLÉ par
-- `python3 scripts/build-hostinger-catchup-sql.py` à partir des modes
-- opératoires relus de docs/deployment/, qui restent la source de vérité.
--
-- CE QU'IL FAIT
--   Il applique, DANS LE BON ORDRE, tout le schéma livré entre le 18 et le
--   27 septembre 2026 : authentification, unité 1, cahier « كرّاسي », tables
--   Math Lab, atelier « أعمالي », enseignants/classes/offres.
--
-- POURQUOI IL EXISTE
--   Les fichiers d'origine s'appliquent à une base qui n'a QU'UNE version de
--   retard. Quand `main` rattrape plusieurs versions d'un coup, il faut savoir
--   lesquels des six fichiers s'appliquent encore — et en rejouer un échoue à
--   mi-chemin sur « column already exists ». Symptômes observés en production
--   le 2026-09-23 : 500 sur /content/availability, /student/study-context,
--   /practice/notes et /math-lab/documents, et « تعذّر الحفظ » dans le Math Lab.
--
-- REJOUABLE — c'est la propriété qui compte ici. CHAQUE instruction est GARDÉE :
-- elle ne s'exécute que si la table, la colonne ou l'index n'est pas déjà là.
-- Donc :
--   • sûr sur une base à jour (il ne fait alors RIEN) ;
--   • sûr sur une base à moitié migrée ;
--   • sûr à relancer après une interruption.
-- Le SQL lui-même n'est pas réécrit : il est copié TEL QUEL des fichiers relus,
-- la garde est le seul ajout.
--
-- GARANTIES : 100 % ADDITIF. Aucun DROP, aucun TRUNCATE, aucun DELETE de
-- données. Les seuls UPDATE sont les deux reprises du cahier, idempotentes et
-- limitées à des colonnes créées à l'instant.
--
-- PRÉREQUIS : sauvegarde de la base (phpMyAdmin → Exporter → SQL).
-- APRÈS : appliquer HOSTINGER_UNIT1_CURRICULUM_DATA.sql (données du curriculum,
-- upserts par code, déjà rejouable), puis vider les caches Laravel.
-- ============================================================================

SET NAMES utf8mb4;

-- Un seul numéro de lot pour tout ce rattrapage.
SET @batch := (SELECT COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`);

-- COMMENT LA GARDE FONCTIONNE
--   Chaque instruction est précédée d'un test. Si l'objet est déjà là, la
--   requête préparée devient un `SELECT 1` inoffensif ; sinon c'est le vrai
--   DDL qui s'exécute. Trois instructions par garde, et AUCUNE procédure
--   stockée : pas de `DELIMITER` à gérer, donc le fichier passe aussi bien dans
--   l'onglet SQL de phpMyAdmin que dans le client en ligne de commande.


-- ==========================================================================
-- Authentification et consentement légal (2026_09_18_*)
-- source : docs/deployment/HOSTINGER_AUTH_MIGRATION.sql
-- ==========================================================================

-- MIGRATION 1/3 — 2026_09_18_000001_add_legal_consent_to_users_table
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'terms_accepted_version') = 0, 'ALTER TABLE `users` ADD `terms_accepted_version` varchar(32) NULL AFTER `grade`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'privacy_policy_accepted_version') = 0, 'ALTER TABLE `users` ADD `privacy_policy_accepted_version` varchar(32) NULL AFTER `terms_accepted_version`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'legal_consent_at') = 0, 'ALTER TABLE `users` ADD `legal_consent_at` timestamp NULL AFTER `privacy_policy_accepted_version`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 2/3 — 2026_09_18_000002_create_user_identities_table
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'user_identities') = 0, 'CREATE TABLE `user_identities` ( `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY, `user_id` bigint unsigned NOT NULL, `provider` varchar(32) NOT NULL, `provider_user_id` varchar(255) NOT NULL, `provider_email` varchar(255) NULL, `created_at` timestamp NULL, `updated_at` timestamp NULL ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_identities' AND constraint_name = 'user_identities_user_id_foreign') = 0, 'ALTER TABLE `user_identities` ADD CONSTRAINT `user_identities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_identities' AND index_name = 'user_identities_provider_provider_user_id_unique') = 0, 'ALTER TABLE `user_identities` ADD UNIQUE `user_identities_provider_provider_user_id_unique` (`provider`, `provider_user_id`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_identities' AND index_name = 'user_identities_user_id_provider_unique') = 0, 'ALTER TABLE `user_identities` ADD UNIQUE `user_identities_user_id_provider_unique` (`user_id`, `provider`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 3/3 — 2026_09_18_000003_make_password_nullable_on_users_table
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'password' AND IS_NULLABLE = 'YES') = 0, 'ALTER TABLE `users` MODIFY `password` varchar(255) NULL', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_18_000001_add_legal_consent_to_users_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_18_000001_add_legal_consent_to_users_table');


-- ==========================================================================
-- Unité 1 du manuel (2026_09_21_*)
-- source : docs/deployment/HOSTINGER_UNIT1_MIGRATION.sql
-- ==========================================================================

-- MIGRATION 1/5 — 2026_09_21_000001_create_units_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'units') = 0, 'create table `units` (`id` bigint unsigned not null auto_increment primary key, `chapter_id` bigint unsigned not null, `code` varchar(255) not null, `title` varchar(255) not null, `subtitle` varchar(255) null, `number` smallint unsigned null, `objectives` json null, `source_topic_codes` json null, `textbook` json null, `order` smallint unsigned not null default ''0'', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'units' AND constraint_name = 'units_chapter_id_foreign') = 0, 'alter table `units` add constraint `units_chapter_id_foreign` foreign key (`chapter_id`) references `chapters` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'units' AND index_name = 'units_chapter_id_code_unique') = 0, 'alter table `units` add unique `units_chapter_id_code_unique`(`chapter_id`, `code`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 2/5 — 2026_09_21_000002_add_unit_and_kind_to_lessons_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'lessons' AND column_name = 'unit_id') = 0, 'alter table `lessons` add `unit_id` bigint unsigned null after `chapter_id`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'lessons' AND constraint_name = 'lessons_unit_id_foreign') = 0, 'alter table `lessons` add constraint `lessons_unit_id_foreign` foreign key (`unit_id`) references `units` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'lessons' AND column_name = 'kind') = 0, 'alter table `lessons` add `kind` varchar(16) not null default ''lesson'' after `code`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'lessons' AND column_name = 'title_source') = 0, 'alter table `lessons` add `title_source` varchar(24) not null default ''official_topic'' after `title`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'lessons' AND column_name = 'textbook_ref') = 0, 'alter table `lessons` add `textbook_ref` json null after `description`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 3/5 — 2026_09_21_000003_create_lesson_prerequisites_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'lesson_prerequisites') = 0, 'create table `lesson_prerequisites` (`id` bigint unsigned not null auto_increment primary key, `lesson_id` bigint unsigned not null, `prerequisite_lesson_id` bigint unsigned not null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'lesson_prerequisites' AND constraint_name = 'lesson_prerequisites_lesson_id_foreign') = 0, 'alter table `lesson_prerequisites` add constraint `lesson_prerequisites_lesson_id_foreign` foreign key (`lesson_id`) references `lessons` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'lesson_prerequisites' AND constraint_name = 'lesson_prerequisites_prerequisite_lesson_id_foreign') = 0, 'alter table `lesson_prerequisites` add constraint `lesson_prerequisites_prerequisite_lesson_id_foreign` foreign key (`prerequisite_lesson_id`) references `lessons` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'lesson_prerequisites' AND index_name = 'lesson_prerequisites_lesson_id_prerequisite_lesson_id_unique') = 0, 'alter table `lesson_prerequisites` add unique `lesson_prerequisites_lesson_id_prerequisite_lesson_id_unique`(`lesson_id`, `prerequisite_lesson_id`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 4/5 — 2026_09_21_000004_create_learning_point_prerequisites_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'learning_point_prerequisites') = 0, 'create table `learning_point_prerequisites` (`id` bigint unsigned not null auto_increment primary key, `learning_point_id` bigint unsigned not null, `prerequisite_learning_point_id` bigint unsigned not null, `required_mastery` decimal(4, 3) not null default ''0.7'', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'learning_point_prerequisites' AND constraint_name = 'lp_prereq_lp_fk') = 0, 'alter table `learning_point_prerequisites` add constraint `lp_prereq_lp_fk` foreign key (`learning_point_id`) references `learning_points` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'learning_point_prerequisites' AND constraint_name = 'lp_prereq_prereq_fk') = 0, 'alter table `learning_point_prerequisites` add constraint `lp_prereq_prereq_fk` foreign key (`prerequisite_learning_point_id`) references `learning_points` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'learning_point_prerequisites' AND index_name = 'lp_prerequisite_unique') = 0, 'alter table `learning_point_prerequisites` add unique `lp_prerequisite_unique`(`learning_point_id`, `prerequisite_learning_point_id`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 5/5 — 2026_09_21_000005_create_lesson_resources_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'lesson_resources') = 0, 'create table `lesson_resources` (`id` bigint unsigned not null auto_increment primary key, `lesson_id` bigint unsigned not null, `code` varchar(255) not null, `kind` varchar(16) not null, `type` varchar(40) null, `title` varchar(255) not null, `description` text null, `module_number` smallint unsigned null, `learning_point_codes` json null, `source_element_ids` json null, `config` json null, `order` smallint unsigned not null default ''0'', `retired_at` timestamp null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'lesson_resources' AND constraint_name = 'lesson_resources_lesson_id_foreign') = 0, 'alter table `lesson_resources` add constraint `lesson_resources_lesson_id_foreign` foreign key (`lesson_id`) references `lessons` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'lesson_resources' AND index_name = 'lesson_resources_lesson_id_code_unique') = 0, 'alter table `lesson_resources` add unique `lesson_resources_lesson_id_code_unique`(`lesson_id`, `code`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'lesson_resources' AND index_name = 'lesson_resources_lesson_id_kind_index') = 0, 'alter table `lesson_resources` add index `lesson_resources_lesson_id_kind_index`(`lesson_id`, `kind`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_21_000001_create_units_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_21_000001_create_units_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_21_000002_add_unit_and_kind_to_lessons_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_21_000002_add_unit_and_kind_to_lessons_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_21_000003_create_lesson_prerequisites_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_21_000003_create_lesson_prerequisites_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_21_000004_create_learning_point_prerequisites_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_21_000004_create_learning_point_prerequisites_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_21_000005_create_lesson_resources_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_21_000005_create_lesson_resources_table');


-- ==========================================================================
-- Cahier « كرّاسي » et tables Math Lab (2026_09_22 → 2026_09_25)
-- source : docs/deployment/HOSTINGER_CAHIER_MATHLAB_MIGRATION.sql
-- ==========================================================================

-- MIGRATION 1/4 — 2026_09_22_000001_add_module_number_to_notebook_notes   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name = 'module_number') = 0, 'alter table `notebook_notes` add `module_number` smallint unsigned null after `learning_point_id`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 2/4 — 2026_09_23_000001_extend_notebook_notes_for_cahier   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name = 'title') = 0, 'alter table `notebook_notes` add `title` varchar(160) null after `user_id`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name = 'note_type') = 0, 'alter table `notebook_notes` add `note_type` varchar(20) not null default ''note'' after `mistake_type`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name = 'is_pinned') = 0, 'alter table `notebook_notes` add `is_pinned` tinyint(1) not null default ''0'' after `note_type`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name = 'archived_at') = 0, 'alter table `notebook_notes` add `archived_at` timestamp null after `completed_at`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name = 'next_review_at') = 0, 'alter table `notebook_notes` add `next_review_at` timestamp null after `archived_at`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name = 'last_reviewed_at') = 0, 'alter table `notebook_notes` add `last_reviewed_at` timestamp null after `next_review_at`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name = 'review_count') = 0, 'alter table `notebook_notes` add `review_count` smallint unsigned not null default ''0'' after `last_reviewed_at`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name = 'content_text') = 0, 'alter table `notebook_notes` add `content_text` text null after `content`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND index_name = 'notebook_notes_user_id_archived_at_index') = 0, 'alter table `notebook_notes` add index `notebook_notes_user_id_archived_at_index`(`user_id`, `archived_at`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND index_name = 'notebook_notes_user_id_next_review_at_index') = 0, 'alter table `notebook_notes` add index `notebook_notes_user_id_next_review_at_index`(`user_id`, `next_review_at`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND index_name = 'notebook_notes_user_id_created_at_index') = 0, 'alter table `notebook_notes` add index `notebook_notes_user_id_created_at_index`(`user_id`, `created_at`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND index_name = 'notebook_notes_user_id_note_type_index') = 0, 'alter table `notebook_notes` add index `notebook_notes_user_id_note_type_index`(`user_id`, `note_type`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 3/4 — 2026_09_24_000001_create_math_lab_documents_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents') = 0, 'create table `math_lab_documents` (`id` bigint unsigned not null auto_increment primary key, `user_id` bigint unsigned not null, `tool` varchar(40) not null, `title` varchar(160) not null, `schema_version` smallint unsigned not null default ''1'', `data` json not null, `data_bytes` int unsigned not null default ''0'', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents' AND constraint_name = 'math_lab_documents_user_id_foreign') = 0, 'alter table `math_lab_documents` add constraint `math_lab_documents_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents' AND index_name = 'math_lab_documents_user_id_tool_updated_at_index') = 0, 'alter table `math_lab_documents` add index `math_lab_documents_user_id_tool_updated_at_index`(`user_id`, `tool`, `updated_at`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 4/4 — 2026_09_25_000001_create_math_lab_files_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'math_lab_files') = 0, 'create table `math_lab_files` (`id` bigint unsigned not null auto_increment primary key, `user_id` bigint unsigned not null, `document_id` bigint unsigned not null, `kind` varchar(16) not null, `original_name` varchar(255) not null, `mime_type` varchar(100) not null, `size` int unsigned not null, `disk_path` varchar(255) not null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'math_lab_files' AND constraint_name = 'math_lab_files_user_id_foreign') = 0, 'alter table `math_lab_files` add constraint `math_lab_files_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'math_lab_files' AND constraint_name = 'math_lab_files_document_id_foreign') = 0, 'alter table `math_lab_files` add constraint `math_lab_files_document_id_foreign` foreign key (`document_id`) references `math_lab_documents` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'math_lab_files' AND index_name = 'math_lab_files_user_id_index') = 0, 'alter table `math_lab_files` add index `math_lab_files_user_id_index`(`user_id`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'math_lab_files' AND index_name = 'math_lab_files_document_id_index') = 0, 'alter table `math_lab_files` add index `math_lab_files_document_id_index`(`document_id`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_22_000001_add_module_number_to_notebook_notes', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_22_000001_add_module_number_to_notebook_notes');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_23_000001_extend_notebook_notes_for_cahier', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_23_000001_extend_notebook_notes_for_cahier');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_24_000001_create_math_lab_documents_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_24_000001_create_math_lab_documents_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_25_000001_create_math_lab_files_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_25_000001_create_math_lab_files_table');

-- 5a. File de révision : jusqu'ici, une note sans `completed_at` s'affichait
UPDATE `notebook_notes` SET `next_review_at` = `created_at` WHERE `completed_at` IS NULL AND `next_review_at` IS NULL;

-- 5b. Type : une note d'exercice portant un type d'erreur EST une erreur.
UPDATE `notebook_notes` SET `note_type` = 'erreur' WHERE `mistake_type` IS NOT NULL AND `note_type` = 'note';


-- ==========================================================================
-- Atelier « أعمالي » (2026_09_26_000001)
-- source : docs/deployment/HOSTINGER_MATHLAB_WORK_MIGRATION.sql
-- ==========================================================================

-- MIGRATION 1/1 — 2026_09_26_000001_add_summary_and_favorite_to_math_lab_documents   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents' AND column_name = 'summary') = 0, 'alter table `math_lab_documents` add `summary` json null after `data_bytes`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents' AND column_name = 'is_favorite') = 0, 'alter table `math_lab_documents` add `is_favorite` tinyint(1) not null default ''0'' after `summary`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents' AND index_name = 'math_lab_documents_favorites_index') = 0, 'alter table `math_lab_documents` add index `math_lab_documents_favorites_index`(`user_id`, `is_favorite`, `updated_at`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000001_add_summary_and_favorite_to_math_lab_documents', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000001_add_summary_and_favorite_to_math_lab_documents');


-- ==========================================================================
-- Enseignants, classes et offres (2026_09_26_* / 2026_09_27_*)
-- source : docs/deployment/HOSTINGER_TEACHER_PLANS_MIGRATION.sql
-- ==========================================================================

-- MIGRATION 1/16 — 2026_09_26_000001_create_plans_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'plans') = 0, 'create table `plans` (`id` bigint unsigned not null auto_increment primary key, `slug` varchar(64) not null, `name` varchar(255) not null, `description` text null, `type` varchar(16) not null, `status` varchar(16) not null default ''draft'', `display_order` smallint unsigned not null default ''0'', `is_public` tinyint(1) not null default ''0'', `is_default` tinyint(1) not null default ''0'', `allows_requests` tinyint(1) not null default ''1'', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plans' AND index_name = 'plans_type_status_index') = 0, 'alter table `plans` add index `plans_type_status_index`(`type`, `status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plans' AND index_name = 'plans_type_is_default_index') = 0, 'alter table `plans` add index `plans_type_is_default_index`(`type`, `is_default`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plans' AND index_name = 'plans_slug_unique') = 0, 'alter table `plans` add unique `plans_slug_unique`(`slug`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 2/16 — 2026_09_26_000002_create_plan_versions_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'plan_versions') = 0, 'create table `plan_versions` (`id` bigint unsigned not null auto_increment primary key, `plan_id` bigint unsigned not null, `version` int unsigned not null, `status` varchar(16) not null default ''draft'', `notes` text null, `created_by` bigint unsigned null, `published_at` timestamp null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_versions' AND constraint_name = 'plan_versions_plan_id_foreign') = 0, 'alter table `plan_versions` add constraint `plan_versions_plan_id_foreign` foreign key (`plan_id`) references `plans` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_versions' AND constraint_name = 'plan_versions_created_by_foreign') = 0, 'alter table `plan_versions` add constraint `plan_versions_created_by_foreign` foreign key (`created_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plan_versions' AND index_name = 'plan_versions_plan_id_version_unique') = 0, 'alter table `plan_versions` add unique `plan_versions_plan_id_version_unique`(`plan_id`, `version`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plan_versions' AND index_name = 'plan_versions_plan_id_status_index') = 0, 'alter table `plan_versions` add index `plan_versions_plan_id_status_index`(`plan_id`, `status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 3/16 — 2026_09_26_000003_create_plan_prices_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'plan_prices') = 0, 'create table `plan_prices` (`id` bigint unsigned not null auto_increment primary key, `plan_version_id` bigint unsigned not null, `currency` char(3) not null default ''DZD'', `amount_cents` bigint unsigned not null default ''0'', `billing_interval` varchar(16) not null default ''year'', `interval_count` smallint unsigned not null default ''1'', `duration_days` int unsigned null, `trial_days` smallint unsigned not null default ''0'', `status` varchar(16) not null default ''active'', `provider_price_id` varchar(255) null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_prices' AND constraint_name = 'plan_prices_plan_version_id_foreign') = 0, 'alter table `plan_prices` add constraint `plan_prices_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plan_prices' AND index_name = 'plan_prices_plan_version_id_status_index') = 0, 'alter table `plan_prices` add index `plan_prices_plan_version_id_status_index`(`plan_version_id`, `status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 4/16 — 2026_09_26_000004_create_plan_entitlements_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'plan_entitlements') = 0, 'create table `plan_entitlements` (`id` bigint unsigned not null auto_increment primary key, `plan_version_id` bigint unsigned not null, `key` varchar(64) not null, `value` json null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_entitlements' AND constraint_name = 'plan_entitlements_plan_version_id_foreign') = 0, 'alter table `plan_entitlements` add constraint `plan_entitlements_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plan_entitlements' AND index_name = 'plan_entitlements_plan_version_id_key_unique') = 0, 'alter table `plan_entitlements` add unique `plan_entitlements_plan_version_id_key_unique`(`plan_version_id`, `key`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 5/16 — 2026_09_26_000005_create_plan_entitlement_overrides_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'plan_entitlement_overrides') = 0, 'create table `plan_entitlement_overrides` (`id` bigint unsigned not null auto_increment primary key, `user_id` bigint unsigned not null, `subscription_id` bigint unsigned null, `key` varchar(64) not null, `value` json null, `reason` varchar(255) null, `starts_at` timestamp null, `ends_at` timestamp null, `created_by` bigint unsigned null, `revoked_at` timestamp null, `revoked_by` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_entitlement_overrides' AND constraint_name = 'plan_entitlement_overrides_user_id_foreign') = 0, 'alter table `plan_entitlement_overrides` add constraint `plan_entitlement_overrides_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_entitlement_overrides' AND constraint_name = 'plan_entitlement_overrides_subscription_id_foreign') = 0, 'alter table `plan_entitlement_overrides` add constraint `plan_entitlement_overrides_subscription_id_foreign` foreign key (`subscription_id`) references `subscriptions` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_entitlement_overrides' AND constraint_name = 'plan_entitlement_overrides_created_by_foreign') = 0, 'alter table `plan_entitlement_overrides` add constraint `plan_entitlement_overrides_created_by_foreign` foreign key (`created_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_entitlement_overrides' AND constraint_name = 'plan_entitlement_overrides_revoked_by_foreign') = 0, 'alter table `plan_entitlement_overrides` add constraint `plan_entitlement_overrides_revoked_by_foreign` foreign key (`revoked_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plan_entitlement_overrides' AND index_name = 'plan_entitlement_overrides_user_id_key_index') = 0, 'alter table `plan_entitlement_overrides` add index `plan_entitlement_overrides_user_id_key_index`(`user_id`, `key`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plan_entitlement_overrides' AND index_name = 'plan_entitlement_overrides_ends_at_index') = 0, 'alter table `plan_entitlement_overrides` add index `plan_entitlement_overrides_ends_at_index`(`ends_at`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 6/16 — 2026_09_26_000006_add_plan_fields_to_subscriptions_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'plan_version_id') = 0, 'alter table `subscriptions` add `plan_version_id` bigint unsigned null after `plan`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND constraint_name = 'subscriptions_plan_version_id_foreign') = 0, 'alter table `subscriptions` add constraint `subscriptions_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'acquisition_source') = 0, 'alter table `subscriptions` add `acquisition_source` varchar(32) null after `plan_version_id`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'granted_by') = 0, 'alter table `subscriptions` add `granted_by` bigint unsigned null after `acquisition_source`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND constraint_name = 'subscriptions_granted_by_foreign') = 0, 'alter table `subscriptions` add constraint `subscriptions_granted_by_foreign` foreign key (`granted_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'activation_note') = 0, 'alter table `subscriptions` add `activation_note` varchar(255) null after `granted_by`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'trial_ends_at') = 0, 'alter table `subscriptions` add `trial_ends_at` timestamp null after `ends_at`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'suspended_at') = 0, 'alter table `subscriptions` add `suspended_at` timestamp null after `cancelled_at`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND index_name = 'subscriptions_plan_version_id_index') = 0, 'alter table `subscriptions` add index `subscriptions_plan_version_id_index`(`plan_version_id`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 7/16 — 2026_09_26_000007_add_plan_version_to_activation_code_batches_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activation_code_batches' AND column_name = 'plan_version_id') = 0, 'alter table `activation_code_batches` add `plan_version_id` bigint unsigned null after `notes`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'activation_code_batches' AND constraint_name = 'activation_code_batches_plan_version_id_foreign') = 0, 'alter table `activation_code_batches` add constraint `activation_code_batches_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activation_code_batches' AND column_name = 'recipient_user_id') = 0, 'alter table `activation_code_batches` add `recipient_user_id` bigint unsigned null after `plan_version_id`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'activation_code_batches' AND constraint_name = 'activation_code_batches_recipient_user_id_foreign') = 0, 'alter table `activation_code_batches` add constraint `activation_code_batches_recipient_user_id_foreign` foreign key (`recipient_user_id`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 8/16 — 2026_09_26_000008_create_subscription_requests_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'subscription_requests') = 0, 'create table `subscription_requests` (`id` bigint unsigned not null auto_increment primary key, `user_id` bigint unsigned not null, `requested_plan_id` bigint unsigned not null, `requested_plan_version_id` bigint unsigned null, `status` varchar(16) not null default ''pending'', `requested_at` timestamp not null, `user_note` varchar(500) null, `reviewed_at` timestamp null, `reviewed_by` bigint unsigned null, `rejection_reason` varchar(255) null, `admin_note` varchar(255) null, `subscription_id` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND constraint_name = 'subscription_requests_user_id_foreign') = 0, 'alter table `subscription_requests` add constraint `subscription_requests_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND constraint_name = 'subscription_requests_requested_plan_id_foreign') = 0, 'alter table `subscription_requests` add constraint `subscription_requests_requested_plan_id_foreign` foreign key (`requested_plan_id`) references `plans` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND constraint_name = 'subscription_requests_requested_plan_version_id_foreign') = 0, 'alter table `subscription_requests` add constraint `subscription_requests_requested_plan_version_id_foreign` foreign key (`requested_plan_version_id`) references `plan_versions` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND constraint_name = 'subscription_requests_reviewed_by_foreign') = 0, 'alter table `subscription_requests` add constraint `subscription_requests_reviewed_by_foreign` foreign key (`reviewed_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND constraint_name = 'subscription_requests_subscription_id_foreign') = 0, 'alter table `subscription_requests` add constraint `subscription_requests_subscription_id_foreign` foreign key (`subscription_id`) references `subscriptions` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND index_name = 'subscription_requests_user_id_status_index') = 0, 'alter table `subscription_requests` add index `subscription_requests_user_id_status_index`(`user_id`, `status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND index_name = 'subscription_requests_status_index') = 0, 'alter table `subscription_requests` add index `subscription_requests_status_index`(`status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 9/16 — 2026_09_26_000009_create_classrooms_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'classrooms') = 0, 'create table `classrooms` (`id` bigint unsigned not null auto_increment primary key, `teacher_id` bigint unsigned not null, `name` varchar(120) not null, `description` varchar(500) null, `grade` varchar(50) not null, `academic_year` varchar(9) null, `status` varchar(16) not null default ''active'', `join_code` varchar(8) not null, `join_code_enabled` tinyint(1) not null default ''1'', `archived_at` timestamp null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classrooms' AND constraint_name = 'classrooms_teacher_id_foreign') = 0, 'alter table `classrooms` add constraint `classrooms_teacher_id_foreign` foreign key (`teacher_id`) references `users` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classrooms' AND index_name = 'classrooms_teacher_id_status_index') = 0, 'alter table `classrooms` add index `classrooms_teacher_id_status_index`(`teacher_id`, `status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classrooms' AND index_name = 'classrooms_grade_index') = 0, 'alter table `classrooms` add index `classrooms_grade_index`(`grade`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classrooms' AND index_name = 'classrooms_join_code_unique') = 0, 'alter table `classrooms` add unique `classrooms_join_code_unique`(`join_code`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 10/16 — 2026_09_26_000010_create_classroom_memberships_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'classroom_memberships') = 0, 'create table `classroom_memberships` (`id` bigint unsigned not null auto_increment primary key, `classroom_id` bigint unsigned not null, `student_id` bigint unsigned not null, `status` varchar(16) not null default ''active'', `joined_at` timestamp null, `left_at` timestamp null, `joined_via` varchar(16) null, `invitation_id` bigint unsigned null, `removed_by` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_memberships' AND constraint_name = 'classroom_memberships_classroom_id_foreign') = 0, 'alter table `classroom_memberships` add constraint `classroom_memberships_classroom_id_foreign` foreign key (`classroom_id`) references `classrooms` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_memberships' AND constraint_name = 'classroom_memberships_student_id_foreign') = 0, 'alter table `classroom_memberships` add constraint `classroom_memberships_student_id_foreign` foreign key (`student_id`) references `users` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_memberships' AND constraint_name = 'classroom_memberships_removed_by_foreign') = 0, 'alter table `classroom_memberships` add constraint `classroom_memberships_removed_by_foreign` foreign key (`removed_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classroom_memberships' AND index_name = 'classroom_memberships_classroom_id_student_id_unique') = 0, 'alter table `classroom_memberships` add unique `classroom_memberships_classroom_id_student_id_unique`(`classroom_id`, `student_id`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classroom_memberships' AND index_name = 'classroom_memberships_student_id_status_index') = 0, 'alter table `classroom_memberships` add index `classroom_memberships_student_id_status_index`(`student_id`, `status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classroom_memberships' AND index_name = 'classroom_memberships_classroom_id_status_index') = 0, 'alter table `classroom_memberships` add index `classroom_memberships_classroom_id_status_index`(`classroom_id`, `status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 11/16 — 2026_09_26_000011_create_classroom_invitations_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'classroom_invitations') = 0, 'create table `classroom_invitations` (`id` bigint unsigned not null auto_increment primary key, `classroom_id` bigint unsigned not null, `invited_by` bigint unsigned null, `email` varchar(255) not null, `token_hash` varchar(64) not null, `token_hint` varchar(4) not null, `status` varchar(16) not null default ''pending'', `expires_at` timestamp null, `accepted_at` timestamp null, `accepted_by` bigint unsigned null, `revoked_at` timestamp null, `revoked_by` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_invitations' AND constraint_name = 'classroom_invitations_classroom_id_foreign') = 0, 'alter table `classroom_invitations` add constraint `classroom_invitations_classroom_id_foreign` foreign key (`classroom_id`) references `classrooms` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_invitations' AND constraint_name = 'classroom_invitations_invited_by_foreign') = 0, 'alter table `classroom_invitations` add constraint `classroom_invitations_invited_by_foreign` foreign key (`invited_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_invitations' AND constraint_name = 'classroom_invitations_accepted_by_foreign') = 0, 'alter table `classroom_invitations` add constraint `classroom_invitations_accepted_by_foreign` foreign key (`accepted_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_invitations' AND constraint_name = 'classroom_invitations_revoked_by_foreign') = 0, 'alter table `classroom_invitations` add constraint `classroom_invitations_revoked_by_foreign` foreign key (`revoked_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classroom_invitations' AND index_name = 'classroom_invitations_classroom_id_status_index') = 0, 'alter table `classroom_invitations` add index `classroom_invitations_classroom_id_status_index`(`classroom_id`, `status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classroom_invitations' AND index_name = 'classroom_invitations_email_index') = 0, 'alter table `classroom_invitations` add index `classroom_invitations_email_index`(`email`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classroom_invitations' AND index_name = 'classroom_invitations_token_hash_unique') = 0, 'alter table `classroom_invitations` add unique `classroom_invitations_token_hash_unique`(`token_hash`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 12/16 — 2026_09_26_000012_create_classroom_lessons_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'classroom_lessons') = 0, 'create table `classroom_lessons` (`id` bigint unsigned not null auto_increment primary key, `classroom_id` bigint unsigned not null, `lesson_id` bigint unsigned not null, `status` varchar(16) not null default ''visible'', `created_by` bigint unsigned null, `updated_by` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_lessons' AND constraint_name = 'classroom_lessons_classroom_id_foreign') = 0, 'alter table `classroom_lessons` add constraint `classroom_lessons_classroom_id_foreign` foreign key (`classroom_id`) references `classrooms` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_lessons' AND constraint_name = 'classroom_lessons_lesson_id_foreign') = 0, 'alter table `classroom_lessons` add constraint `classroom_lessons_lesson_id_foreign` foreign key (`lesson_id`) references `lessons` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_lessons' AND constraint_name = 'classroom_lessons_created_by_foreign') = 0, 'alter table `classroom_lessons` add constraint `classroom_lessons_created_by_foreign` foreign key (`created_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'classroom_lessons' AND constraint_name = 'classroom_lessons_updated_by_foreign') = 0, 'alter table `classroom_lessons` add constraint `classroom_lessons_updated_by_foreign` foreign key (`updated_by`) references `users` (`id`) on delete set null', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classroom_lessons' AND index_name = 'classroom_lessons_classroom_id_lesson_id_unique') = 0, 'alter table `classroom_lessons` add unique `classroom_lessons_classroom_id_lesson_id_unique`(`classroom_id`, `lesson_id`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'classroom_lessons' AND index_name = 'classroom_lessons_lesson_id_status_index') = 0, 'alter table `classroom_lessons` add index `classroom_lessons_lesson_id_status_index`(`lesson_id`, `status`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 13/16 — 2026_09_27_000001_create_plan_pricing_tiers_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'plan_pricing_tiers') = 0, 'create table `plan_pricing_tiers` (`id` bigint unsigned not null auto_increment primary key, `plan_version_id` bigint unsigned not null, `min_students` int unsigned not null, `max_students` int unsigned null, `price_per_student_cents` bigint unsigned not null default ''0'', `currency` char(3) not null default ''DZD'', `sort_order` smallint unsigned not null default ''0'', `is_active` tinyint(1) not null default ''1'', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate ''utf8mb4_unicode_ci''', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_pricing_tiers' AND constraint_name = 'plan_pricing_tiers_plan_version_id_foreign') = 0, 'alter table `plan_pricing_tiers` add constraint `plan_pricing_tiers_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete cascade', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plan_pricing_tiers' AND index_name = 'plan_pricing_tiers_plan_version_id_is_active_index') = 0, 'alter table `plan_pricing_tiers` add index `plan_pricing_tiers_plan_version_id_is_active_index`(`plan_version_id`, `is_active`)', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 14/16 — 2026_09_27_000002_add_student_seats_to_subscriptions_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'student_seat_limit') = 0, 'alter table `subscriptions` add `student_seat_limit` int unsigned null after `plan_version_id`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'seat_unit_price_cents') = 0, 'alter table `subscriptions` add `seat_unit_price_cents` bigint unsigned null after `student_seat_limit`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'seat_total_cents') = 0, 'alter table `subscriptions` add `seat_total_cents` bigint unsigned null after `seat_unit_price_cents`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name = 'seat_currency') = 0, 'alter table `subscriptions` add `seat_currency` char(3) null after `seat_total_cents`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 15/16 — 2026_09_27_000003_add_student_seats_to_subscription_requests_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND column_name = 'requested_student_seats') = 0, 'alter table `subscription_requests` add `requested_student_seats` int unsigned null after `requested_plan_version_id`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND column_name = 'unit_price_cents') = 0, 'alter table `subscription_requests` add `unit_price_cents` bigint unsigned null after `requested_student_seats`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND column_name = 'calculated_total_cents') = 0, 'alter table `subscription_requests` add `calculated_total_cents` bigint unsigned null after `unit_price_cents`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND column_name = 'currency') = 0, 'alter table `subscription_requests` add `currency` char(3) null after `calculated_total_cents`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- MIGRATION 16/16 — 2026_09_27_000004_add_student_seat_limit_to_activation_code_batches_table   (additif : OUI · destructif : NON)
SET @sql := (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activation_code_batches' AND column_name = 'student_seat_limit') = 0, 'alter table `activation_code_batches` add `student_seat_limit` int unsigned null after `plan_version_id`', 'SELECT 1'));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000001_create_plans_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000001_create_plans_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000002_create_plan_versions_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000002_create_plan_versions_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000003_create_plan_prices_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000003_create_plan_prices_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000004_create_plan_entitlements_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000004_create_plan_entitlements_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000005_create_plan_entitlement_overrides_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000005_create_plan_entitlement_overrides_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000006_add_plan_fields_to_subscriptions_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000006_add_plan_fields_to_subscriptions_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000007_add_plan_version_to_activation_code_batches_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000007_add_plan_version_to_activation_code_batches_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000008_create_subscription_requests_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000008_create_subscription_requests_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000009_create_classrooms_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000009_create_classrooms_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000010_create_classroom_memberships_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000010_create_classroom_memberships_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000011_create_classroom_invitations_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000011_create_classroom_invitations_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_26_000012_create_classroom_lessons_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_26_000012_create_classroom_lessons_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_27_000001_create_plan_pricing_tiers_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_27_000001_create_plan_pricing_tiers_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_27_000002_add_student_seats_to_subscriptions_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_27_000002_add_student_seats_to_subscriptions_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_27_000003_add_student_seats_to_subscription_requests_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_27_000003_add_student_seats_to_subscription_requests_table');
INSERT INTO `migrations` (`migration`, `batch`) SELECT '2026_09_27_000004_add_student_seat_limit_to_activation_code_batches_table', @batch FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `migrations` WHERE `migration` = '2026_09_27_000004_add_student_seat_limit_to_activation_code_batches_table');
INSERT INTO `plans` (`slug`, `name`, `description`, `type`, `status`, `display_order`, `is_public`, `is_default`, `allows_requests`, `created_at`, `updated_at`)
SELECT 'teacher-free', 'الأستاذ — مجاني', 'حتى 5 تلاميذ وعدد غير محدود من الأقسام. العرض الافتراضي لكل حساب أستاذ.', 'teacher', 'active', 0, 1, 1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plans` WHERE `slug` = 'teacher-free');
SET @plan := (SELECT `id` FROM `plans` WHERE `slug` = 'teacher-free');
INSERT INTO `plan_versions` (`plan_id`, `version`, `status`, `notes`, `published_at`, `created_at`, `updated_at`)
SELECT @plan, 1, 'current', 'Version initiale (seeder).', NOW(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plan_versions` WHERE `plan_id` = @plan);
SET @v := (SELECT `id` FROM `plan_versions` WHERE `plan_id` = @plan AND `version` = 1);
INSERT INTO `plan_entitlements` (`plan_version_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT @v, seed.k, seed.val, NOW(), NOW() FROM (
  SELECT 'students_total.max' AS k, '5' AS val UNION ALL SELECT 'classrooms.max', 'null' UNION ALL SELECT 'students_per_classroom.max', 'null'
  UNION ALL SELECT 'invitations.active.max', 'null' UNION ALL SELECT 'lessons.visibility', 'true' UNION ALL SELECT 'lessons.bulk_actions', 'false'
  UNION ALL SELECT 'progress.class', 'true' UNION ALL SELECT 'progress.student', 'true' UNION ALL SELECT 'analytics.advanced', 'false'
  UNION ALL SELECT 'reports.export', 'false' UNION ALL SELECT 'students.covered', 'false' UNION ALL SELECT 'content.allowed_grades', '["4am"]'
) AS seed WHERE NOT EXISTS (SELECT 1 FROM `plan_entitlements` WHERE `plan_version_id` = @v);
INSERT INTO `plan_prices` (`plan_version_id`, `currency`, `amount_cents`, `billing_interval`, `interval_count`, `duration_days`, `trial_days`, `status`, `created_at`, `updated_at`)
SELECT @v, 'DZD', 0, 'one_time', 1, NULL, 0, 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plan_prices` WHERE `plan_version_id` = @v);
INSERT INTO `plans` (`slug`, `name`, `description`, `type`, `status`, `display_order`, `is_public`, `is_default`, `allows_requests`, `created_at`, `updated_at`)
SELECT 'teacher-seats', 'الأستاذ — حسب عدد التلاميذ', 'اختر عدد التلاميذ الذين تريد تأطيرهم؛ يقلّ سعر التلميذ الواحد كلّما زاد العدد. الأقسام غير محدودة، ويحصل تلاميذك على المحتوى المدفوع عبر عرضك.', 'teacher', 'active', 1, 1, 0, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plans` WHERE `slug` = 'teacher-seats');
SET @plan := (SELECT `id` FROM `plans` WHERE `slug` = 'teacher-seats');
INSERT INTO `plan_versions` (`plan_id`, `version`, `status`, `notes`, `published_at`, `created_at`, `updated_at`)
SELECT @plan, 1, 'current', 'Version initiale (seeder).', NOW(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plan_versions` WHERE `plan_id` = @plan);
SET @v := (SELECT `id` FROM `plan_versions` WHERE `plan_id` = @plan AND `version` = 1);
INSERT INTO `plan_entitlements` (`plan_version_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT @v, seed.k, seed.val, NOW(), NOW() FROM (
  SELECT 'classrooms.max' AS k, 'null' AS val UNION ALL SELECT 'students_per_classroom.max', 'null' UNION ALL SELECT 'invitations.active.max', 'null'
  UNION ALL SELECT 'lessons.visibility', 'true' UNION ALL SELECT 'lessons.bulk_actions', 'true'
  UNION ALL SELECT 'progress.class', 'true' UNION ALL SELECT 'progress.student', 'true' UNION ALL SELECT 'analytics.advanced', 'true'
  UNION ALL SELECT 'reports.export', 'true' UNION ALL SELECT 'students.covered', 'true' UNION ALL SELECT 'content.allowed_grades', '["4am"]'
) AS seed WHERE NOT EXISTS (SELECT 1 FROM `plan_entitlements` WHERE `plan_version_id` = @v);
INSERT INTO `plan_prices` (`plan_version_id`, `currency`, `amount_cents`, `billing_interval`, `interval_count`, `duration_days`, `trial_days`, `status`, `created_at`, `updated_at`)
SELECT @v, 'DZD', 0, 'year', 1, 365, 0, 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plan_prices` WHERE `plan_version_id` = @v);
INSERT INTO `plan_pricing_tiers` (`plan_version_id`, `min_students`, `max_students`, `price_per_student_cents`, `currency`, `sort_order`, `is_active`, `created_at`, `updated_at`)
SELECT @v, seed.mn, seed.mx, seed.cents, 'DZD', seed.ord, 1, NOW(), NOW() FROM (
  SELECT 1 AS mn, 5 AS mx, 0 AS cents, 0 AS ord UNION ALL SELECT 6, 20, 100000, 1 UNION ALL SELECT 21, 30, 80000, 2
  UNION ALL SELECT 31, 50, 70000, 3 UNION ALL SELECT 51, 100, 60000, 4 UNION ALL SELECT 101, NULL, 50000, 5
) AS seed WHERE NOT EXISTS (SELECT 1 FROM `plan_pricing_tiers` WHERE `plan_version_id` = @v);
INSERT INTO `plans` (`slug`, `name`, `description`, `type`, `status`, `display_order`, `is_public`, `is_default`, `allows_requests`, `created_at`, `updated_at`)
SELECT 'student-premium', 'التلميذ — وصول كامل', 'كل دروس السنة وتمارينها.', 'student', 'active', 0, 1, 0, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plans` WHERE `slug` = 'student-premium');
SET @plan := (SELECT `id` FROM `plans` WHERE `slug` = 'student-premium');
INSERT INTO `plan_versions` (`plan_id`, `version`, `status`, `notes`, `published_at`, `created_at`, `updated_at`)
SELECT @plan, 1, 'current', 'Version initiale (seeder).', NOW(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plan_versions` WHERE `plan_id` = @plan);
SET @v := (SELECT `id` FROM `plan_versions` WHERE `plan_id` = @plan AND `version` = 1);
INSERT INTO `plan_prices` (`plan_version_id`, `currency`, `amount_cents`, `billing_interval`, `interval_count`, `duration_days`, `trial_days`, `status`, `created_at`, `updated_at`)
SELECT @v, 'DZD', 300000, 'year', 1, 365, 0, 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `plan_prices` WHERE `plan_version_id` = @v);


-- ============================================================================
-- VÉRIFICATION (lecture seule) — ce que la base doit contenir APRÈS
-- ============================================================================
SELECT COUNT(*) AS tables_attendues_19 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('user_identities','units','lesson_prerequisites','learning_point_prerequisites','lesson_resources','math_lab_documents','math_lab_files','plans','plan_versions','plan_prices','plan_entitlements','plan_entitlement_overrides','plan_pricing_tiers','subscription_requests','classrooms','classroom_memberships','classroom_invitations','classroom_lessons','migrations'); -- attendu : 19
SELECT COUNT(*) AS colonnes_cahier_9 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name IN ('module_number','title','note_type','is_pinned','archived_at','next_review_at','last_reviewed_at','review_count','content_text'); -- attendu : 9
SELECT COUNT(*) AS colonnes_mathlab_2 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents' AND column_name IN ('summary','is_favorite'); -- attendu : 2
SELECT COUNT(*) AS migrations_enregistrees_26 FROM `migrations` WHERE `migration` LIKE '2026_09_18_%' OR `migration` LIKE '2026_09_21_%' OR `migration` LIKE '2026_09_2[2-7]_%'; -- attendu : 26
SELECT `migration`, `batch` FROM `migrations` WHERE `migration` LIKE '2026_09_%' ORDER BY `migration`;
