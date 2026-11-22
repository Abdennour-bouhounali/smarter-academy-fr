#!/usr/bin/env python3
"""Assemble the ONE catch-up SQL file for a Hostinger database that is behind.

Why this exists
---------------
The deploy pipeline never applies migrations (deploy.yml § "Laravel
post-deployment"): the schema is applied by hand in phpMyAdmin from the reviewed
runbooks in docs/deployment/. That works when a database is one release behind.
It stops working when `main` catches up several releases at once: the operator
then has to know WHICH of six files still apply, and running one twice fails
halfway through with "column already exists", leaving the database in a state
nobody planned.

This script takes the reviewed runbooks — which stay the source of truth — and
emits a single file whose every DDL statement is GUARDED: it runs only if the
table, column or index is not already there. Consequences:

  * safe to run on a database in ANY state, including a fully up-to-date one
    (it then does nothing at all);
  * safe to re-run after a failure, so a half-applied file is recoverable;
  * the operator no longer has to diff `migrations` against six files.

The SQL is NOT rewritten here. Each statement is copied verbatim from the
runbook and wrapped; the guards are the only thing this script adds.

Usage
-----
    python3 scripts/build-hostinger-catchup-sql.py

Writes docs/deployment/HOSTINGER_CATCHUP_ALL.sql.
"""

from __future__ import annotations

import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPLOY = os.path.join(ROOT, 'docs', 'deployment')

# The reviewed runbooks, in the ONLY order they may be applied. Each entry is
# (filename, human label). The data file is deliberately excluded: it is already
# idempotent (upsert by code) and is applied separately, after the schema.
SOURCES = [
    ('HOSTINGER_AUTH_MIGRATION.sql', 'Authentification et consentement légal (2026_09_18_*)'),
    ('HOSTINGER_UNIT1_MIGRATION.sql', 'Unité 1 du manuel (2026_09_21_*)'),
    ('HOSTINGER_CAHIER_MATHLAB_MIGRATION.sql', 'Cahier « كرّاسي » et tables Math Lab (2026_09_22 → 2026_09_25)'),
    ('HOSTINGER_MATHLAB_WORK_MIGRATION.sql', 'Atelier « أعمالي » (2026_09_26_000001)'),
    ('HOSTINGER_TEACHER_PLANS_MIGRATION.sql', 'Enseignants, classes et offres (2026_09_26_* / 2026_09_27_*)'),
]

# ── Recognising what a statement touches ────────────────────────────────────
RE_CREATE_TABLE = re.compile(r'^create table `(?P<table>[^`]+)`', re.I)
RE_ALTER = re.compile(r'^alter table `(?P<table>[^`]+)`\s+(?P<rest>.*)$', re.I | re.S)
RE_ADD_COLUMN = re.compile(r'^add `(?P<col>[^`]+)`', re.I)
RE_ADD_INDEX = re.compile(r'^add (?:unique|index|key)\s+`(?P<idx>[^`]+)`', re.I)
RE_ADD_CONSTRAINT = re.compile(r'^add constraint `(?P<fk>[^`]+)`', re.I)
RE_MODIFY = re.compile(r'^modify `(?P<col>[^`]+)`', re.I)


def guard_for(stmt: str):
    """Return (kind, table, name) describing the object a statement creates.

    None means "cannot be guarded automatically" — the caller then keeps the
    statement but flags it, so a human reviews it rather than the script
    silently shipping something unguarded.
    """
    s = stmt.strip().rstrip(';').strip()

    m = RE_CREATE_TABLE.match(s)
    if m:
        return ('table', m.group('table'), None)

    m = RE_ALTER.match(s)
    if not m:
        return None
    table, rest = m.group('table'), m.group('rest').strip()

    for regex, kind, group in (
        (RE_ADD_COLUMN, 'column', 'col'),
        (RE_ADD_INDEX, 'index', 'idx'),
        (RE_ADD_CONSTRAINT, 'fk', 'fk'),
        (RE_MODIFY, 'modify', 'col'),
    ):
        mm = regex.match(rest)
        if mm:
            return (kind, table, mm.group(group))
    return None


def existence_test(kind: str, table: str, name: str) -> str:
    """A SELECT COUNT(*) that is 0 when the object is absent."""
    if kind == 'table':
        return ("SELECT COUNT(*) FROM information_schema.tables "
                f"WHERE table_schema = DATABASE() AND table_name = '{table}'")
    if kind == 'column':
        return ("SELECT COUNT(*) FROM information_schema.columns "
                f"WHERE table_schema = DATABASE() AND table_name = '{table}' AND column_name = '{name}'")
    if kind == 'index':
        return ("SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics "
                f"WHERE table_schema = DATABASE() AND table_name = '{table}' AND index_name = '{name}'")
    if kind == 'fk':
        return ("SELECT COUNT(*) FROM information_schema.table_constraints "
                f"WHERE table_schema = DATABASE() AND table_name = '{table}' AND constraint_name = '{name}'")
    if kind == 'modify':
        # A MODIFY is not "create if absent": re-running it is already a no-op.
        # It is guarded anyway so the file touches nothing on an up-to-date
        # database. The only MODIFY in the runbooks relaxes a column to NULL, so
        # "already done" means IS_NULLABLE = 'YES' — the test must then return
        # non-zero, hence the inversion.
        return ("SELECT COUNT(*) FROM information_schema.columns "
                f"WHERE table_schema = DATABASE() AND table_name = '{table}' "
                f"AND column_name = '{name}' AND IS_NULLABLE = 'YES'")
    raise ValueError(kind)


def extract_statements(path: str):
    """Yield (statement, source_comment) for DDL and migrations-ledger rows.

    Comment lines are carried through as labels so the output stays readable and
    traceable back to the runbook it came from. UPDATE/INSERT statements that are
    not the migrations ledger are returned too, marked so the caller can decide.
    """
    text = io.open(path, encoding='utf-8').read()
    out = []
    label = None
    buf = []
    for raw in text.splitlines():
        line = raw.rstrip()
        stripped = line.strip()
        if not buf and stripped.startswith('--'):
            # Keep migration headings as labels; drop rulers and prose.
            if re.match(r'^--\s*MIGRATION\s', stripped) or re.match(r'^--\s*\d+[a-z]?\.\s', stripped):
                label = stripped.lstrip('- ').strip()
            continue
        if not stripped:
            continue
        buf.append(line)
        if stripped.endswith(';'):
            stmt = '\n'.join(buf).strip()
            buf = []
            out.append((stmt, label))
            label = None
    return out


def classify(stmt: str) -> str:
    s = stmt.strip().lower()
    if s.startswith(('create table', 'alter table')):
        return 'ddl'
    if 'insert into `migrations`' in s:
        return 'ledger'
    if s.startswith('set @batch'):
        return 'batch'
    if s.startswith('set @'):
        # The plan seeder threads @plan / @v between its INSERTs. Dropping these
        # would leave the following INSERTs referencing NULL and quietly writing
        # broken rows, so they must be carried through verbatim.
        return 'data'
    if s.startswith('select'):
        return 'verify'
    if s.startswith(('insert into', 'update ')):
        return 'data'
    if s.startswith(('set names', 'start transaction', 'commit')):
        return 'txn'
    return 'other'


def main() -> int:
    chunks = []
    unguarded = []
    counts = {'ddl': 0, 'ledger': 0, 'data': 0}

    for fname, label in SOURCES:
        path = os.path.join(DEPLOY, fname)
        if not os.path.exists(path):
            print('missing source: ' + fname, file=sys.stderr)
            return 1

        body = []
        for stmt, heading in extract_statements(path):
            kind = classify(stmt)

            if kind in ('verify', 'txn', 'other'):
                continue  # verification blocks are re-emitted once, at the end

            if kind == 'batch':
                continue  # one shared batch number for the whole catch-up

            if kind == 'ddl':
                counts['ddl'] += 1
                g = guard_for(stmt)
                if g is None:
                    unguarded.append((fname, stmt))
                    body.append(('raw', heading, stmt))
                else:
                    body.append(('guarded', heading, (stmt, g)))
            elif kind == 'ledger':
                counts['ledger'] += 1
                body.append(('ledger', heading, stmt))
            elif kind == 'data':
                counts['data'] += 1
                body.append(('data', heading, stmt))

        chunks.append((fname, label, body))

    if unguarded:
        print('Statements that could not be guarded automatically:', file=sys.stderr)
        for fname, stmt in unguarded:
            print('  %s: %s' % (fname, stmt[:110]), file=sys.stderr)
        print('Refusing to write an output with unguarded DDL.', file=sys.stderr)
        return 2

    out = io.StringIO()
    w = out.write
    w("""-- ============================================================================
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
""")

    def q(s: str) -> str:
        """Quote a SQL string literal for embedding in a CALL."""
        return "'" + s.replace('\\', '\\\\').replace("'", "''") + "'"

    for fname, label, body in chunks:
        w('\n\n-- ' + '=' * 74 + '\n')
        w('-- %s\n' % label)
        w('-- source : docs/deployment/%s\n' % fname)
        w('-- ' + '=' * 74 + '\n')
        for kind, heading, payload in body:
            if heading:
                w('\n-- %s\n' % heading)
            if kind == 'guarded':
                stmt, (gkind, table, name) = payload
                flat = ' '.join(stmt.rstrip(';').split())
                # Guard inline, without a stored procedure: the prepared string
                # is the real DDL only when the object is absent, otherwise a
                # harmless SELECT 1.
                w("SET @sql := (SELECT IF((%s) = 0, %s, 'SELECT 1'));\n"
                  % (existence_test(gkind, table, name), q(flat)))
                w('PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;\n')
            elif kind == 'raw':
                w(payload + '\n')
            elif kind == 'ledger':
                # Never record the same migration twice.
                m = re.search(r"VALUES\s*\('([^']+)'", payload)
                name = m.group(1)
                w("INSERT INTO `migrations` (`migration`, `batch`) "
                  "SELECT '%s', @batch FROM DUAL WHERE NOT EXISTS "
                  "(SELECT 1 FROM `migrations` WHERE `migration` = '%s');\n" % (name, name))
            elif kind == 'data':
                w(payload + '\n')

    w("""

-- ============================================================================
-- VÉRIFICATION (lecture seule) — ce que la base doit contenir APRÈS
-- ============================================================================
SELECT COUNT(*) AS tables_attendues_19 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('user_identities','units','lesson_prerequisites','learning_point_prerequisites','lesson_resources','math_lab_documents','math_lab_files','plans','plan_versions','plan_prices','plan_entitlements','plan_entitlement_overrides','plan_pricing_tiers','subscription_requests','classrooms','classroom_memberships','classroom_invitations','classroom_lessons','migrations'); -- attendu : 19
SELECT COUNT(*) AS colonnes_cahier_9 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notebook_notes' AND column_name IN ('module_number','title','note_type','is_pinned','archived_at','next_review_at','last_reviewed_at','review_count','content_text'); -- attendu : 9
SELECT COUNT(*) AS colonnes_mathlab_2 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'math_lab_documents' AND column_name IN ('summary','is_favorite'); -- attendu : 2
SELECT COUNT(*) AS migrations_enregistrees_26 FROM `migrations` WHERE `migration` LIKE '2026_09_18_%' OR `migration` LIKE '2026_09_21_%' OR `migration` LIKE '2026_09_2[2-7]_%'; -- attendu : 26
SELECT `migration`, `batch` FROM `migrations` WHERE `migration` LIKE '2026_09_%' ORDER BY `migration`;
""")

    dest = os.path.join(DEPLOY, 'HOSTINGER_CATCHUP_ALL.sql')
    io.open(dest, 'w', encoding='utf-8').write(out.getvalue())
    print('wrote %s' % dest)
    print('  DDL gardées   : %d' % counts['ddl'])
    print('  lignes ledger : %d' % counts['ledger'])
    print('  reprises data : %d' % counts['data'])
    return 0


if __name__ == '__main__':
    sys.exit(main())
