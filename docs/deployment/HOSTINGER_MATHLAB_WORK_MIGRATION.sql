-- ============================================================================
-- SMARTER ACADEMY — MIGRATION « أعمالي » (MATH LAB : RÉSUMÉS ET FAVORIS)
-- À exécuter UNE SEULE FOIS dans Hostinger hPanel → phpMyAdmin → onglet SQL
-- ============================================================================
--
-- D'OÙ VIENT CE SQL : `php artisan migrate --pretend` exécuté contre une base
-- au schéma de production. Il reproduit EXACTEMENT la migration Laravel
-- 2026_09_26_000001_add_summary_and_favorite_to_math_lab_documents, pour une
-- base où `php artisan migrate` ne peut pas être lancé faute d'accès terminal.
-- Le pipeline de déploiement n'applique JAMAIS les migrations (voir
-- .github/workflows/deploy.yml § « Laravel post-deployment ») : c'est une
-- politique, pas un oubli.
--
-- POURQUOI C'EST NÉCESSAIRE MAINTENANT
--   La version déployée remplace la liste des documents du Math Lab par
--   l'atelier « أعمالي » : aperçus, tri, recherche, favoris. Le code lit et
--   écrit `summary` et `is_favorite`. TANT QUE CE FICHIER N'EST PAS EXÉCUTÉ,
--   l'enregistrement d'un document du Math Lab échoue en production
--   (colonne inconnue). Les autres espaces — leçons, progression, classes,
--   abonnements — ne sont pas concernés.
--
-- CE QUE LES DEUX COLONNES SONT
--   `summary`     Le RÉSUMÉ qu'un instrument fait de son propre document :
--                 quelques centaines d'octets de JSON (les expressions du
--                 grapheur, le solide de la 3D, l'équation du جبر…). C'est lui
--                 qui permet à une carte de dessiner un aperçu VRAI sans
--                 charger three.js, Excalidraw ni MathLive. Borné par
--                 MathLabDocumentService::MAX_SUMMARY_BYTES. NULL pour les
--                 documents antérieurs, que l'interface sait afficher sans lui
--                 (aperçu de repli).
--   `is_favorite` L'étoile de l'élève. FAUX par défaut.
--   Ni l'une ni l'autre ne touche à `data` (l'état de l'outil, opaque, jusqu'à
--   2 Mo pour une سبّورة).
--
-- GARANTIES : 100 % ADDITIF — deux colonnes ajoutées et un index, sur la seule
-- table `math_lab_documents`. Aucun DROP, aucun DELETE, aucun TRUNCATE, aucun
-- UPDATE de données existantes. `summary` accepte NULL et `is_favorite` a une
-- valeur par défaut : AUCUNE ligne existante n'est invalidée, aucun document
-- d'élève n'est perdu ni modifié.
--
-- PRÉREQUIS : sauvegarde de la base (phpMyAdmin → Exporter → SQL).
-- ORDRE : les trois instructions s'exécutent DANS L'ORDRE (l'index porte sur
-- `is_favorite`, qui doit exister d'abord).
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 1/1 — 2026_09_26_000001_add_summary_and_favorite_to_math_lab_documents   (additif : OUI · destructif : NON)
-- ────────────────────────────────────────────────────────────────────────────
alter table `math_lab_documents` add `summary` json null after `data_bytes`;
alter table `math_lab_documents` add `is_favorite` tinyint(1) not null default '0' after `summary`;
alter table `math_lab_documents` add index `math_lab_documents_favorites_index`(`user_id`, `is_favorite`, `updated_at`);

-- ────────────────────────────────────────────────────────────────────────────
-- JOURNAL DES MIGRATIONS — pour que `php artisan migrate:status` dise la vérité
-- ────────────────────────────────────────────────────────────────────────────
SET @batch := (SELECT COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`);
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_09_26_000001_add_summary_and_favorite_to_math_lab_documents', @batch);

-- ────────────────────────────────────────────────────────────────────────────
-- VÉRIFICATION (lecture seule)
-- ────────────────────────────────────────────────────────────────────────────
SELECT COUNT(*) AS colonnes_ok FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents' AND column_name IN ('summary', 'is_favorite'); -- attendu : 2
SELECT COUNT(*) AS index_ok FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents' AND index_name = 'math_lab_documents_favorites_index'; -- attendu : 3 (une ligne par colonne de l'index)
SELECT COUNT(*) AS documents_intacts FROM `math_lab_documents`; -- attendu : le même nombre qu'AVANT la migration
SELECT COUNT(*) AS resumes_nuls FROM `math_lab_documents` WHERE `summary` IS NULL; -- attendu : tous les documents antérieurs (normal : ils n'ont pas encore de résumé)
SELECT COUNT(*) AS etoiles FROM `math_lab_documents` WHERE `is_favorite` = 1; -- attendu : 0
SELECT `migration`, `batch` FROM `migrations` WHERE `migration` = '2026_09_26_000001_add_summary_and_favorite_to_math_lab_documents'; -- attendu : 1 ligne

-- ────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (seulement si un bloc a échoué à mi-chemin ; sinon restaurer la sauvegarde)
-- ────────────────────────────────────────────────────────────────────────────
-- DELETE FROM `migrations` WHERE `migration` = '2026_09_26_000001_add_summary_and_favorite_to_math_lab_documents';
-- ALTER TABLE `math_lab_documents` DROP INDEX `math_lab_documents_favorites_index`;
-- ALTER TABLE `math_lab_documents` DROP COLUMN `is_favorite`, DROP COLUMN `summary`;
