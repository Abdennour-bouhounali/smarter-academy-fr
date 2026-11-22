-- ============================================================================
-- SMARTER ACADEMY — MIGRATION « ENSEIGNANTS, CLASSES, OFFRES PAR SIÈGES »
-- À exécuter UNE SEULE FOIS dans Hostinger hPanel → phpMyAdmin → onglet SQL
-- ============================================================================
--
-- D'OÙ VIENT CE SQL : `php artisan migrate --pretend` exécuté contre une base
-- au schéma de production (toutes les migrations antérieures appliquées, unité 1
-- comprise). Il reproduit EXACTEMENT les douze migrations 2026_09_26_0000{01..12}
-- (enseignants, classes, offres) puis les quatre migrations 2026_09_27_0000{01..04}
-- (tarification par SIÈGES élèves : paliers de prix, capacité achetée).
--
-- GARANTIES : 100 % ADDITIF — onze tables créées, trois tables étendues
-- (`subscriptions`, `activation_code_batches`, `subscription_requests`). Aucun
-- DROP, aucun DELETE, aucun TRUNCATE, aucun UPDATE de données existantes. Toutes
-- les colonnes ajoutées acceptent NULL : les abonnements et les lots de codes
-- existants restent valides tels quels, et l'accès des élèves actuels ne change pas.
--
-- PRÉREQUIS : sauvegarde de la base (phpMyAdmin → Exporter → SQL).
-- ORDRE : les blocs s'exécutent DANS L'ORDRE (2 référence `plans`, 3/4
-- référencent `plan_versions`, 5/6/7/8 référencent `subscriptions`,
-- `plan_versions` et `users`, 10/11/12 référencent `classrooms`).
-- APRÈS : le bloc « OFFRES INITIALES » (miroir de `PlanSeeder`), rejouable.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 1/16 — 2026_09_26_000001_create_plans_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `plans` (`id` bigint unsigned not null auto_increment primary key, `slug` varchar(64) not null, `name` varchar(255) not null, `description` text null, `type` varchar(16) not null, `status` varchar(16) not null default 'draft', `display_order` smallint unsigned not null default '0', `is_public` tinyint(1) not null default '0', `is_default` tinyint(1) not null default '0', `allows_requests` tinyint(1) not null default '1', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `plans` add index `plans_type_status_index`(`type`, `status`);
alter table `plans` add index `plans_type_is_default_index`(`type`, `is_default`);
alter table `plans` add unique `plans_slug_unique`(`slug`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 2/16 — 2026_09_26_000002_create_plan_versions_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `plan_versions` (`id` bigint unsigned not null auto_increment primary key, `plan_id` bigint unsigned not null, `version` int unsigned not null, `status` varchar(16) not null default 'draft', `notes` text null, `created_by` bigint unsigned null, `published_at` timestamp null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `plan_versions` add constraint `plan_versions_plan_id_foreign` foreign key (`plan_id`) references `plans` (`id`) on delete cascade;
alter table `plan_versions` add constraint `plan_versions_created_by_foreign` foreign key (`created_by`) references `users` (`id`) on delete set null;
alter table `plan_versions` add unique `plan_versions_plan_id_version_unique`(`plan_id`, `version`);
alter table `plan_versions` add index `plan_versions_plan_id_status_index`(`plan_id`, `status`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 3/16 — 2026_09_26_000003_create_plan_prices_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `plan_prices` (`id` bigint unsigned not null auto_increment primary key, `plan_version_id` bigint unsigned not null, `currency` char(3) not null default 'DZD', `amount_cents` bigint unsigned not null default '0', `billing_interval` varchar(16) not null default 'year', `interval_count` smallint unsigned not null default '1', `duration_days` int unsigned null, `trial_days` smallint unsigned not null default '0', `status` varchar(16) not null default 'active', `provider_price_id` varchar(255) null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `plan_prices` add constraint `plan_prices_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete cascade;
alter table `plan_prices` add index `plan_prices_plan_version_id_status_index`(`plan_version_id`, `status`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 4/16 — 2026_09_26_000004_create_plan_entitlements_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `plan_entitlements` (`id` bigint unsigned not null auto_increment primary key, `plan_version_id` bigint unsigned not null, `key` varchar(64) not null, `value` json null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `plan_entitlements` add constraint `plan_entitlements_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete cascade;
alter table `plan_entitlements` add unique `plan_entitlements_plan_version_id_key_unique`(`plan_version_id`, `key`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 5/16 — 2026_09_26_000005_create_plan_entitlement_overrides_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `plan_entitlement_overrides` (`id` bigint unsigned not null auto_increment primary key, `user_id` bigint unsigned not null, `subscription_id` bigint unsigned null, `key` varchar(64) not null, `value` json null, `reason` varchar(255) null, `starts_at` timestamp null, `ends_at` timestamp null, `created_by` bigint unsigned null, `revoked_at` timestamp null, `revoked_by` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `plan_entitlement_overrides` add constraint `plan_entitlement_overrides_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade;
alter table `plan_entitlement_overrides` add constraint `plan_entitlement_overrides_subscription_id_foreign` foreign key (`subscription_id`) references `subscriptions` (`id`) on delete set null;
alter table `plan_entitlement_overrides` add constraint `plan_entitlement_overrides_created_by_foreign` foreign key (`created_by`) references `users` (`id`) on delete set null;
alter table `plan_entitlement_overrides` add constraint `plan_entitlement_overrides_revoked_by_foreign` foreign key (`revoked_by`) references `users` (`id`) on delete set null;
alter table `plan_entitlement_overrides` add index `plan_entitlement_overrides_user_id_key_index`(`user_id`, `key`);
alter table `plan_entitlement_overrides` add index `plan_entitlement_overrides_ends_at_index`(`ends_at`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 6/16 — 2026_09_26_000006_add_plan_fields_to_subscriptions_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
alter table `subscriptions` add `plan_version_id` bigint unsigned null after `plan`;
alter table `subscriptions` add constraint `subscriptions_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete set null;
alter table `subscriptions` add `acquisition_source` varchar(32) null after `plan_version_id`;
alter table `subscriptions` add `granted_by` bigint unsigned null after `acquisition_source`;
alter table `subscriptions` add constraint `subscriptions_granted_by_foreign` foreign key (`granted_by`) references `users` (`id`) on delete set null;
alter table `subscriptions` add `activation_note` varchar(255) null after `granted_by`;
alter table `subscriptions` add `trial_ends_at` timestamp null after `ends_at`;
alter table `subscriptions` add `suspended_at` timestamp null after `cancelled_at`;
alter table `subscriptions` add index `subscriptions_plan_version_id_index`(`plan_version_id`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 7/16 — 2026_09_26_000007_add_plan_version_to_activation_code_batches_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
alter table `activation_code_batches` add `plan_version_id` bigint unsigned null after `notes`;
alter table `activation_code_batches` add constraint `activation_code_batches_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete set null;
alter table `activation_code_batches` add `recipient_user_id` bigint unsigned null after `plan_version_id`;
alter table `activation_code_batches` add constraint `activation_code_batches_recipient_user_id_foreign` foreign key (`recipient_user_id`) references `users` (`id`) on delete set null;

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 8/16 — 2026_09_26_000008_create_subscription_requests_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `subscription_requests` (`id` bigint unsigned not null auto_increment primary key, `user_id` bigint unsigned not null, `requested_plan_id` bigint unsigned not null, `requested_plan_version_id` bigint unsigned null, `status` varchar(16) not null default 'pending', `requested_at` timestamp not null, `user_note` varchar(500) null, `reviewed_at` timestamp null, `reviewed_by` bigint unsigned null, `rejection_reason` varchar(255) null, `admin_note` varchar(255) null, `subscription_id` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `subscription_requests` add constraint `subscription_requests_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade;
alter table `subscription_requests` add constraint `subscription_requests_requested_plan_id_foreign` foreign key (`requested_plan_id`) references `plans` (`id`) on delete cascade;
alter table `subscription_requests` add constraint `subscription_requests_requested_plan_version_id_foreign` foreign key (`requested_plan_version_id`) references `plan_versions` (`id`) on delete set null;
alter table `subscription_requests` add constraint `subscription_requests_reviewed_by_foreign` foreign key (`reviewed_by`) references `users` (`id`) on delete set null;
alter table `subscription_requests` add constraint `subscription_requests_subscription_id_foreign` foreign key (`subscription_id`) references `subscriptions` (`id`) on delete set null;
alter table `subscription_requests` add index `subscription_requests_user_id_status_index`(`user_id`, `status`);
alter table `subscription_requests` add index `subscription_requests_status_index`(`status`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 9/16 — 2026_09_26_000009_create_classrooms_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `classrooms` (`id` bigint unsigned not null auto_increment primary key, `teacher_id` bigint unsigned not null, `name` varchar(120) not null, `description` varchar(500) null, `grade` varchar(50) not null, `academic_year` varchar(9) null, `status` varchar(16) not null default 'active', `join_code` varchar(8) not null, `join_code_enabled` tinyint(1) not null default '1', `archived_at` timestamp null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `classrooms` add constraint `classrooms_teacher_id_foreign` foreign key (`teacher_id`) references `users` (`id`) on delete cascade;
alter table `classrooms` add index `classrooms_teacher_id_status_index`(`teacher_id`, `status`);
alter table `classrooms` add index `classrooms_grade_index`(`grade`);
alter table `classrooms` add unique `classrooms_join_code_unique`(`join_code`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 10/16 — 2026_09_26_000010_create_classroom_memberships_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `classroom_memberships` (`id` bigint unsigned not null auto_increment primary key, `classroom_id` bigint unsigned not null, `student_id` bigint unsigned not null, `status` varchar(16) not null default 'active', `joined_at` timestamp null, `left_at` timestamp null, `joined_via` varchar(16) null, `invitation_id` bigint unsigned null, `removed_by` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `classroom_memberships` add constraint `classroom_memberships_classroom_id_foreign` foreign key (`classroom_id`) references `classrooms` (`id`) on delete cascade;
alter table `classroom_memberships` add constraint `classroom_memberships_student_id_foreign` foreign key (`student_id`) references `users` (`id`) on delete cascade;
alter table `classroom_memberships` add constraint `classroom_memberships_removed_by_foreign` foreign key (`removed_by`) references `users` (`id`) on delete set null;
alter table `classroom_memberships` add unique `classroom_memberships_classroom_id_student_id_unique`(`classroom_id`, `student_id`);
alter table `classroom_memberships` add index `classroom_memberships_student_id_status_index`(`student_id`, `status`);
alter table `classroom_memberships` add index `classroom_memberships_classroom_id_status_index`(`classroom_id`, `status`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 11/16 — 2026_09_26_000011_create_classroom_invitations_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `classroom_invitations` (`id` bigint unsigned not null auto_increment primary key, `classroom_id` bigint unsigned not null, `invited_by` bigint unsigned null, `email` varchar(255) not null, `token_hash` varchar(64) not null, `token_hint` varchar(4) not null, `status` varchar(16) not null default 'pending', `expires_at` timestamp null, `accepted_at` timestamp null, `accepted_by` bigint unsigned null, `revoked_at` timestamp null, `revoked_by` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `classroom_invitations` add constraint `classroom_invitations_classroom_id_foreign` foreign key (`classroom_id`) references `classrooms` (`id`) on delete cascade;
alter table `classroom_invitations` add constraint `classroom_invitations_invited_by_foreign` foreign key (`invited_by`) references `users` (`id`) on delete set null;
alter table `classroom_invitations` add constraint `classroom_invitations_accepted_by_foreign` foreign key (`accepted_by`) references `users` (`id`) on delete set null;
alter table `classroom_invitations` add constraint `classroom_invitations_revoked_by_foreign` foreign key (`revoked_by`) references `users` (`id`) on delete set null;
alter table `classroom_invitations` add index `classroom_invitations_classroom_id_status_index`(`classroom_id`, `status`);
alter table `classroom_invitations` add index `classroom_invitations_email_index`(`email`);
alter table `classroom_invitations` add unique `classroom_invitations_token_hash_unique`(`token_hash`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 12/16 — 2026_09_26_000012_create_classroom_lessons_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `classroom_lessons` (`id` bigint unsigned not null auto_increment primary key, `classroom_id` bigint unsigned not null, `lesson_id` bigint unsigned not null, `status` varchar(16) not null default 'visible', `created_by` bigint unsigned null, `updated_by` bigint unsigned null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `classroom_lessons` add constraint `classroom_lessons_classroom_id_foreign` foreign key (`classroom_id`) references `classrooms` (`id`) on delete cascade;
alter table `classroom_lessons` add constraint `classroom_lessons_lesson_id_foreign` foreign key (`lesson_id`) references `lessons` (`id`) on delete cascade;
alter table `classroom_lessons` add constraint `classroom_lessons_created_by_foreign` foreign key (`created_by`) references `users` (`id`) on delete set null;
alter table `classroom_lessons` add constraint `classroom_lessons_updated_by_foreign` foreign key (`updated_by`) references `users` (`id`) on delete set null;
alter table `classroom_lessons` add unique `classroom_lessons_classroom_id_lesson_id_unique`(`classroom_id`, `lesson_id`);
alter table `classroom_lessons` add index `classroom_lessons_lesson_id_status_index`(`lesson_id`, `status`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 13/16 — 2026_09_27_000001_create_plan_pricing_tiers_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
create table `plan_pricing_tiers` (`id` bigint unsigned not null auto_increment primary key, `plan_version_id` bigint unsigned not null, `min_students` int unsigned not null, `max_students` int unsigned null, `price_per_student_cents` bigint unsigned not null default '0', `currency` char(3) not null default 'DZD', `sort_order` smallint unsigned not null default '0', `is_active` tinyint(1) not null default '1', `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci';
alter table `plan_pricing_tiers` add constraint `plan_pricing_tiers_plan_version_id_foreign` foreign key (`plan_version_id`) references `plan_versions` (`id`) on delete cascade;
alter table `plan_pricing_tiers` add index `plan_pricing_tiers_plan_version_id_is_active_index`(`plan_version_id`, `is_active`);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 14/16 — 2026_09_27_000002_add_student_seats_to_subscriptions_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
alter table `subscriptions` add `student_seat_limit` int unsigned null after `plan_version_id`;
alter table `subscriptions` add `seat_unit_price_cents` bigint unsigned null after `student_seat_limit`;
alter table `subscriptions` add `seat_total_cents` bigint unsigned null after `seat_unit_price_cents`;
alter table `subscriptions` add `seat_currency` char(3) null after `seat_total_cents`;

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 15/16 — 2026_09_27_000003_add_student_seats_to_subscription_requests_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
alter table `subscription_requests` add `requested_student_seats` int unsigned null after `requested_plan_version_id`;
alter table `subscription_requests` add `unit_price_cents` bigint unsigned null after `requested_student_seats`;
alter table `subscription_requests` add `calculated_total_cents` bigint unsigned null after `unit_price_cents`;
alter table `subscription_requests` add `currency` char(3) null after `calculated_total_cents`;

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 16/16 — 2026_09_27_000004_add_student_seat_limit_to_activation_code_batches_table   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
alter table `activation_code_batches` add `student_seat_limit` int unsigned null after `plan_version_id`;

-- ────────────────────────────────────────────────────────────────────────────
-- ENREGISTREMENT dans `migrations` : un futur `php artisan migrate` ne doit pas
-- tenter de rejouer ces seize migrations.
-- ────────────────────────────────────────────────────────────────────────────
SET @batch := (SELECT COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000001_create_plans_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000002_create_plan_versions_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000003_create_plan_prices_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000004_create_plan_entitlements_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000005_create_plan_entitlement_overrides_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000006_add_plan_fields_to_subscriptions_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000007_add_plan_version_to_activation_code_batches_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000008_create_subscription_requests_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000009_create_classrooms_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000010_create_classroom_memberships_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000011_create_classroom_invitations_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000012_create_classroom_lessons_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_27_000001_create_plan_pricing_tiers_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_27_000002_add_student_seats_to_subscriptions_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_27_000003_add_student_seats_to_subscription_requests_table', @batch);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_27_000004_add_student_seat_limit_to_activation_code_batches_table', @batch);

-- ============================================================================
-- OFFRES INITIALES — miroir de `database/seeders/PlanSeeder.php`
-- ============================================================================
-- REJOUABLE et NON DESTRUCTIF : chaque offre n'est insérée que si son slug
-- n'existe pas ; sa version 1, ses droits, son prix et sa grille ne sont
-- insérés que si la version n'en a pas encore. Une offre déjà modifiée depuis le
-- panneau d'administration n'est JAMAIS reprise. Aucun abonnement n'est créé :
-- le gratuit est l'offre PAR DÉFAUT (is_default = 1), effective sans ligne.
-- Les montants sont en centimes de dinar et INFORMATIFS : la plateforme
-- n'encaisse rien (ALGERIA_PLATFORM_MASTER_SPEC.md §17/§18).
-- Les `value` sont du JSON : 5, true/false, ["4am"], null = illimité.
-- L'offre enseignant se vend PAR SIÈGES : `students_total.max` est la capacité
-- du gratuit (5) ; les classes sont illimitées (`classrooms.max` = null).

-- ── teacher-free (offre enseignant par défaut : N sièges, classes illimitées) ─
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

-- ── teacher-seats (offre payante PAR SIÈGES : la grille donne le prix par élève) ─
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
-- La grille de DÉPART (centimes par élève). L'administration la change depuis
-- le panneau en publiant une nouvelle version ; les abonnés gardent la leur.
INSERT INTO `plan_pricing_tiers` (`plan_version_id`, `min_students`, `max_students`, `price_per_student_cents`, `currency`, `sort_order`, `is_active`, `created_at`, `updated_at`)
SELECT @v, seed.mn, seed.mx, seed.cents, 'DZD', seed.ord, 1, NOW(), NOW() FROM (
  SELECT 1 AS mn, 5 AS mx, 0 AS cents, 0 AS ord UNION ALL SELECT 6, 20, 100000, 1 UNION ALL SELECT 21, 30, 80000, 2
  UNION ALL SELECT 31, 50, 70000, 3 UNION ALL SELECT 51, 100, 60000, 4 UNION ALL SELECT 101, NULL, 50000, 5
) AS seed WHERE NOT EXISTS (SELECT 1 FROM `plan_pricing_tiers` WHERE `plan_version_id` = @v);

-- ── student-premium (offre élève payante : lots de codes, activation directe) ─
-- Aucun droit : l'accès élève est le palier premium (entitlements), ouvert par
-- le synchroniseur d'abonnement. Le gratuit élève reste une règle, pas une offre.
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

-- ────────────────────────────────────────────────────────────────────────────
-- VÉRIFICATION (lecture seule)
-- ────────────────────────────────────────────────────────────────────────────
SELECT COUNT(*) AS tables_ok FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('plans', 'plan_versions', 'plan_prices', 'plan_entitlements', 'plan_entitlement_overrides', 'plan_pricing_tiers', 'subscription_requests', 'classrooms', 'classroom_memberships', 'classroom_invitations', 'classroom_lessons'); -- attendu : 11
SELECT COUNT(*) AS subscription_columns_ok FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscriptions' AND column_name IN ('plan_version_id', 'acquisition_source', 'granted_by', 'activation_note', 'trial_ends_at', 'suspended_at', 'student_seat_limit', 'seat_unit_price_cents', 'seat_total_cents', 'seat_currency'); -- attendu : 10
SELECT COUNT(*) AS batch_columns_ok FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activation_code_batches' AND column_name IN ('plan_version_id', 'recipient_user_id', 'student_seat_limit'); -- attendu : 3
SELECT COUNT(*) AS request_columns_ok FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'subscription_requests' AND column_name IN ('requested_student_seats', 'unit_price_cents', 'calculated_total_cents', 'currency'); -- attendu : 4
SELECT `migration` FROM `migrations` WHERE `migration` LIKE '2026_09_26_%' OR `migration` LIKE '2026_09_27_%' ORDER BY `migration`; -- attendu : 16 lignes
SELECT p.`slug`, p.`type`, p.`is_default`, v.`version`, v.`status`, COUNT(DISTINCT e.`id`) AS droits, COUNT(DISTINCT t.`id`) AS paliers FROM `plans` p JOIN `plan_versions` v ON v.`plan_id` = p.`id` LEFT JOIN `plan_entitlements` e ON e.`plan_version_id` = v.`id` LEFT JOIN `plan_pricing_tiers` t ON t.`plan_version_id` = v.`id` GROUP BY p.`slug`, p.`type`, p.`is_default`, v.`version`, v.`status` ORDER BY p.`type`, p.`display_order`; -- attendu : 3 lignes (teacher-free 12 droits / 0 palier · teacher-seats 11 / 6 · student-premium 0 / 0)
SELECT COUNT(*) AS default_teacher_plan FROM `plans` WHERE `type` = 'teacher' AND `is_default` = 1 AND `status` = 'active'; -- attendu : 1 (exactement)

-- ────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (seulement si un bloc a échoué à mi-chemin ; sinon restaurer la sauvegarde)
-- ────────────────────────────────────────────────────────────────────────────
-- DELETE FROM `migrations` WHERE `migration` LIKE '2026_09_26_%' OR `migration` LIKE '2026_09_27_%';
-- DROP TABLE IF EXISTS `plan_pricing_tiers`;
-- ALTER TABLE `activation_code_batches` DROP COLUMN `student_seat_limit`;
-- ALTER TABLE `subscription_requests` DROP COLUMN `requested_student_seats`, DROP COLUMN `unit_price_cents`, DROP COLUMN `calculated_total_cents`, DROP COLUMN `currency`;
-- ALTER TABLE `subscriptions` DROP COLUMN `student_seat_limit`, DROP COLUMN `seat_unit_price_cents`, DROP COLUMN `seat_total_cents`, DROP COLUMN `seat_currency`;
-- DROP TABLE IF EXISTS `classroom_lessons`; DROP TABLE IF EXISTS `classroom_invitations`; DROP TABLE IF EXISTS `classroom_memberships`; DROP TABLE IF EXISTS `classrooms`;
-- DROP TABLE IF EXISTS `subscription_requests`;
-- ALTER TABLE `activation_code_batches` DROP FOREIGN KEY `activation_code_batches_recipient_user_id_foreign`, DROP FOREIGN KEY `activation_code_batches_plan_version_id_foreign`; ALTER TABLE `activation_code_batches` DROP COLUMN `recipient_user_id`, DROP COLUMN `plan_version_id`;
-- ALTER TABLE `subscriptions` DROP FOREIGN KEY `subscriptions_granted_by_foreign`, DROP FOREIGN KEY `subscriptions_plan_version_id_foreign`; ALTER TABLE `subscriptions` DROP INDEX `subscriptions_plan_version_id_index`; ALTER TABLE `subscriptions` DROP COLUMN `suspended_at`, DROP COLUMN `trial_ends_at`, DROP COLUMN `activation_note`, DROP COLUMN `granted_by`, DROP COLUMN `acquisition_source`, DROP COLUMN `plan_version_id`;
-- DROP TABLE IF EXISTS `plan_entitlement_overrides`; DROP TABLE IF EXISTS `plan_entitlements`; DROP TABLE IF EXISTS `plan_prices`; DROP TABLE IF EXISTS `plan_versions`; DROP TABLE IF EXISTS `plans`;
