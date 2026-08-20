<?php

namespace Database\Seeders;

use App\Models\LearningPoint;
use Illuminate\Database\Seeder;

/**
 * Populates learning_points.diagnostic_skill_id — the advisory, one-way
 * cross-reference from a learning point to the diagnostic skill
 * (SixiemeDiagnosticProvider::SKILLS) that genuinely evaluates the same
 * competency. Deliberately CONSERVATIVE: only links where the skill's label
 * and the learning point's title describe the same competency are included;
 * everything ambiguous stays null (see docs/reports/DIAGNOSTIC_COVERAGE.md
 * for the full analysis, including the mappings that were considered and
 * rejected). Nothing in the diagnostic reads this column — being wrong here
 * can't break anything, but being invented here would poison future
 * analytics, so uncertain means unmapped.
 *
 * Idempotent; safe to re-run after every curriculum import (the importer
 * never touches this column).
 */
class DiagnosticSkillLinkSeeder extends Seeder
{
    /** learning point code => diagnostic skill id */
    private const VERIFIED_LINKS = [
        // Identical wording: "Comprendre la valeur de position de chaque chiffre".
        '6e_nombres-entiers_P3' => 'nombres.valeur-position',
        // "Comparer, ranger et encadrer" <-> "Comparer et ranger des nombres
        // entiers et décimaux" — same competency; the skill explicitly spans
        // both integer and decimal comparison, so both LPs link to it.
        '6e_nombres-entiers_P5' => 'nombres.comparaison-rangement',
        '6e_nombres-decimaux_P5' => 'nombres.comparaison-rangement',
        // "Repérer sur une demi-droite graduée" <-> "Repérer un nombre sur
        // une droite graduée".
        '6e_nombres-entiers_P6' => 'nombres.droite-graduee',
    ];

    public function run(): void
    {
        foreach (self::VERIFIED_LINKS as $code => $skillId) {
            LearningPoint::where('code', $code)->update(['diagnostic_skill_id' => $skillId]);
        }
    }
}
