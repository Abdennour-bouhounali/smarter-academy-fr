<?php

// Paths for the curriculum export handshake between the Node source of truth
// (packages/core/curriculum/coursesData.js) and the Laravel importer. Both are
// env-overridable for deployments whose directory layout differs from the
// monorepo default (apps/api three levels below the repo root).
return [
    'export_script_path' => env(
        'CURRICULUM_EXPORT_SCRIPT',
        base_path('../../packages/core/curriculum/exportCurriculum.mjs')
    ),
    'export_output_path' => env(
        'CURRICULUM_EXPORT_OUTPUT',
        base_path('../../packages/core/curriculum/.generated/curriculum-export.json')
    ),
];
