<?php

namespace App\Domain\Curriculum\Support;

/**
 * Pure diff between the curriculum source (the JSON export of coursesData.js)
 * and a snapshot of what's already in the database — no Eloquent, no I/O, so
 * the classification logic is unit-testable without a database, same
 * philosophy as Diagnostic\Support\MasteryModel. CurriculumImporter is the
 * only thing that turns this diff into writes.
 */
class CurriculumDiffer
{
    /**
     * Both inputs are keyed by code. Each existing entry is
     * ['title' => string, ...any other compared fields]; each source entry
     * likewise. Retired codes are ones present in $existing but absent from
     * $source — the importer marks them retired_at, never deletes (evidence
     * may reference them).
     *
     * @param  array<string, array<string, mixed>>  $source
     * @param  array<string, array<string, mixed>>  $existing
     * @return array{created: string[], updated: string[], retired: string[], unchanged: string[]}
     */
    public static function diff(array $source, array $existing): array
    {
        $created = [];
        $updated = [];
        $unchanged = [];

        foreach ($source as $code => $sourceEntry) {
            if (! array_key_exists($code, $existing)) {
                $created[] = $code;

                continue;
            }

            if (self::entriesDiffer($sourceEntry, $existing[$code])) {
                $updated[] = $code;
            } else {
                $unchanged[] = $code;
            }
        }

        $retired = array_values(array_diff(array_keys($existing), array_keys($source)));

        return [
            'created' => $created,
            'updated' => $updated,
            'retired' => $retired,
            'unchanged' => $unchanged,
        ];
    }

    /**
     * Compares only the fields the SOURCE defines — extra DB-side fields
     * (id, timestamps, retired_at, diagnostic_skill_id) never count as drift,
     * since the source doesn't own them.
     *
     * @param  array<string, mixed>  $sourceEntry
     * @param  array<string, mixed>  $existingEntry
     */
    private static function entriesDiffer(array $sourceEntry, array $existingEntry): bool
    {
        foreach ($sourceEntry as $field => $value) {
            if (($existingEntry[$field] ?? null) !== $value) {
                return true;
            }
        }

        return false;
    }
}
