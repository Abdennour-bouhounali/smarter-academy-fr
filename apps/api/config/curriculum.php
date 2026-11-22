<?php

// Paths for the curriculum export handshake between the Node source of truth
// (packages/core/curriculum/coursesData.js) and the Laravel importer. Both are
// env-overridable for deployments whose directory layout differs from the
// monorepo default (apps/api three levels below the repo root).
return [
    // Dormant-grade isolation, server side (docs/ALGERIA_MIGRATION_AUDIT.md
    // §15). The list of active grades is NOT configured here: the single
    // authority is packages/core/curriculum/activeGrades.js, mirrored into
    // `grades.is_active` by `smarter:import-curriculum` (see the migration
    // adding that column). ContentAccess reads the column, so the API gate
    // (a client calling /api/v1/lessons/{lessonCode}/* directly with a known
    // French lesson code) and the frontend catalogue can only disagree when
    // the import is stale — which `smarter:registry-health` reports.
    //
    // 'enforce_active_grades' defaults OFF in the `testing` environment
    // (see phpunit.xml): the inherited French Feature test suite creates
    // its own ad hoc grade fixtures ('seconde', '3e', even placeholders
    // like '01') to test publication/tier/entitlement logic that has
    // nothing to do with grade activation — this gate is an Algeria-only
    // addition on top of that suite, not something those tests were
    // written to account for. Dormant-grade isolation itself has its own
    // dedicated coverage (registry.test.js, check-dormant-isolation.mjs,
    // check-routes.mjs) rather than being implicitly exercised by every
    // unrelated Feature test.
    'enforce_active_grades' => env('CURRICULUM_ENFORCE_ACTIVE_GRADES', true),

    'export_script_path' => env(
        'CURRICULUM_EXPORT_SCRIPT',
        base_path('../../packages/core/curriculum/exportCurriculum.mjs')
    ),
    'export_output_path' => env(
        'CURRICULUM_EXPORT_OUTPUT',
        base_path('../../packages/core/curriculum/.generated/curriculum-export.json')
    ),

    // Second export, même poignée de main : le REGISTRE DE CONTENU (modules
    // de leçon + exercices de pratique). Séparé du catalogue parce que la
    // source est différente — les lesson.config.js et content/practice, pas
    // coursesData.js.
    'registry_export_script_path' => env(
        'CONTENT_REGISTRY_EXPORT_SCRIPT',
        base_path('../../packages/core/curriculum/exportContentRegistry.mjs')
    ),
    'registry_export_output_path' => env(
        'CONTENT_REGISTRY_EXPORT_OUTPUT',
        base_path('../../packages/core/curriculum/.generated/content-registry-export.json')
    ),
];
