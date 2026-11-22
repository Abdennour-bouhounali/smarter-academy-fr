-- ============================================================================
-- SMARTER ACADEMY — MIGRATION « UNITÉ 1 DU MANUEL » (phase 8)
-- À exécuter UNE SEULE FOIS dans Hostinger hPanel → phpMyAdmin → onglet SQL
-- ============================================================================
--
-- D'OÙ VIENT CE SQL : `php artisan migrate --pretend` exécuté contre une base
-- au schéma de production (toutes les migrations antérieures appliquées).
-- Il reproduit EXACTEMENT les cinq migrations 2026_09_21_00000{1..5}.
--
-- GARANTIES : 100 % ADDITIF — cinq tables/colonnes ajoutées. Aucun DROP, aucun
-- DELETE, aucun TRUNCATE, aucun UPDATE de données existantes. Les colonnes
-- ajoutées à `lessons` ont un défaut ou acceptent NULL : les 28 leçons
-- existantes restent valides telles quelles.
--
-- PRÉREQUIS : sauvegarde de la base (phpMyAdmin → Exporter → SQL).
-- ORDRE : les blocs s'exécutent DANS L'ORDRE (2 référence `units`, 5 et 3
-- référencent `lessons`, 4 référence `learning_points`).
-- APRÈS : appliquer HOSTINGER_UNIT1_CURRICULUM_DATA.sql (le miroir du catalogue).
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 1/5 — 2026_09_21_000001_create_units_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `units` (`id` bigint unsigned not null auto_increment primary key, `chapter_id` bigint unsigned not null, `code` varchar(255) not null, `title` varchar(255) not null, `subtitle` varchar(255) null, `number` smallint unsigned null, `objectives` json null, `source_topic_codes` json null, `textbook` json null, `order` smallint unsigned not null default '0', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `units` add constraint `units_chapter_id_foreign` foreign key (`chapter_id`) references `chapters` (`id`) on delete cascade;
alter table `units` add unique `units_chapter_id_code_unique`(`chapter_id`, `code`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 2/5 — 2026_09_21_000002_add_unit_and_kind_to_lessons_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
alter table `lessons` add `unit_id` bigint unsigned null after `chapter_id`;
alter table `lessons` add constraint `lessons_unit_id_foreign` foreign key (`unit_id`) references `units` (`id`) on delete set null;
alter table `lessons` add `kind` varchar(16) not null default 'lesson' after `code`;
alter table `lessons` add `title_source` varchar(24) not null default 'official_topic' after `title`;
alter table `lessons` add `textbook_ref` json null after `description`;

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 3/5 — 2026_09_21_000003_create_lesson_prerequisites_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `lesson_prerequisites` (`id` bigint unsigned not null auto_increment primary key, `lesson_id` bigint unsigned not null, `prerequisite_lesson_id` bigint unsigned not null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `lesson_prerequisites` add constraint `lesson_prerequisites_lesson_id_foreign` foreign key (`lesson_id`) references `lessons` (`id`) on delete cascade;
alter table `lesson_prerequisites` add constraint `lesson_prerequisites_prerequisite_lesson_id_foreign` foreign key (`prerequisite_lesson_id`) references `lessons` (`id`) on delete cascade;
alter table `lesson_prerequisites` add unique `lesson_prerequisites_lesson_id_prerequisite_lesson_id_unique`(`lesson_id`, `prerequisite_lesson_id`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 4/5 — 2026_09_21_000004_create_learning_point_prerequisites_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `learning_point_prerequisites` (`id` bigint unsigned not null auto_increment primary key, `learning_point_id` bigint unsigned not null, `prerequisite_learning_point_id` bigint unsigned not null, `required_mastery` decimal(4, 3) not null default '0.7', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `learning_point_prerequisites` add constraint `lp_prereq_lp_fk` foreign key (`learning_point_id`) references `learning_points` (`id`) on delete cascade;
alter table `learning_point_prerequisites` add constraint `lp_prereq_prereq_fk` foreign key (`prerequisite_learning_point_id`) references `learning_points` (`id`) on delete cascade;
alter table `learning_point_prerequisites` add unique `lp_prerequisite_unique`(`learning_point_id`, `prerequisite_learning_point_id`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 5/5 — 2026_09_21_000005_create_lesson_resources_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `lesson_resources` (`id` bigint unsigned not null auto_increment primary key, `lesson_id` bigint unsigned not null, `code` varchar(255) not null, `kind` varchar(16) not null, `type` varchar(40) null, `title` varchar(255) not null, `description` text null, `module_number` smallint unsigned null, `learning_point_codes` json null, `source_element_ids` json null, `config` json null, `order` smallint unsigned not null default '0', `retired_at` timestamp null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `lesson_resources` add constraint `lesson_resources_lesson_id_foreign` foreign key (`lesson_id`) references `lessons` (`id`) on delete cascade;
alter table `lesson_resources` add unique `lesson_resources_lesson_id_code_unique`(`lesson_id`, `code`);
alter table `lesson_resources` add index `lesson_resources_lesson_id_kind_index`(`lesson_id`, `kind`);

-- ────────────────────────────────────────────────────────────────────────────
-- ENREGISTREMENT dans `migrations` : un futur `php artisan migrate` ne doit pas
-- les rejouer. Le lot (batch) est le prochain numéro libre, calculé sur place.
-- ────────────────────────────────────────────────────────────────────────────
SET @batch := (SELECT COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_21_000001_create_units_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_21_000002_add_unit_and_kind_to_lessons_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_21_000003_create_lesson_prerequisites_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_21_000004_create_learning_point_prerequisites_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_21_000005_create_lesson_resources_table', @batch);

-- ────────────────────────────────────────────────────────────────────────────
-- VÉRIFICATION (lecture seule)
-- ────────────────────────────────────────────────────────────────────────────
SELECT COUNT(*) AS units_ok FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('units', 'lesson_prerequisites', 'learning_point_prerequisites', 'lesson_resources'); -- attendu : 4
SELECT COUNT(*) AS lesson_columns_ok FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'lessons' AND column_name IN ('unit_id', 'kind', 'title_source', 'textbook_ref'); -- attendu : 4
SELECT `migration` FROM `migrations` WHERE `migration` LIKE '2026_09_21_%' ORDER BY `migration`; -- attendu : 5 lignes

-- ────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (seulement si un bloc a échoué à mi-chemin ; sinon restaurer la sauvegarde)
-- ────────────────────────────────────────────────────────────────────────────
-- DELETE FROM `migrations` WHERE `migration` LIKE '2026_09_21_%';
-- DROP TABLE IF EXISTS `lesson_resources`; DROP TABLE IF EXISTS `learning_point_prerequisites`; DROP TABLE IF EXISTS `lesson_prerequisites`;
-- ALTER TABLE `lessons` DROP FOREIGN KEY `lessons_unit_id_foreign`; ALTER TABLE `lessons` DROP COLUMN `unit_id`, DROP COLUMN `kind`, DROP COLUMN `title_source`, DROP COLUMN `textbook_ref`;
-- DROP TABLE IF EXISTS `units`;
