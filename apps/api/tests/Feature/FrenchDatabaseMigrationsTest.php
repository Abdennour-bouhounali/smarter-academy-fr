<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * La base française est créée neuve depuis ces migrations (plan §6) : aucune
 * ne doit effacer de données, et les défauts de colonne sont ceux de la France.
 */
class FrenchDatabaseMigrationsTest extends TestCase
{
    use RefreshDatabase;

    /** L'ancienne décision algérienne (effacer tous les signalements) ne tourne jamais ici. */
    public function test_la_migration_des_captures_ne_fait_que_le_schema(): void
    {
        $source = (string) file_get_contents(database_path('migrations/2026_10_05_000002_reset_reports_and_add_screenshot.php'));
        $start = strpos($source, 'function up()');
        $up = substr($source, $start, strpos($source, 'function down()') - $start);

        $this->assertStringContainsString("'screenshot_path'", $up);
        $this->assertStringNotContainsString('DB::', $up);
        $this->assertStringNotContainsString('Storage', $up);
        $this->assertDoesNotMatchRegularExpression('/->(delete|truncate)\(/', $up);
    }

    public function test_une_ligne_de_prix_inseree_sans_devise_est_en_euros(): void
    {
        $planId = DB::table('plans')->insertGetId(['slug' => 'brut', 'name' => 'Brut', 'type' => 'student', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()]);
        $versionId = DB::table('plan_versions')->insertGetId(['plan_id' => $planId, 'version' => 1, 'status' => 'current', 'created_at' => now(), 'updated_at' => now()]);

        DB::table('plan_prices')->insert(['plan_version_id' => $versionId, 'amount_cents' => 3500, 'billing_interval' => 'year', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('plan_pricing_tiers')->insert(['plan_version_id' => $versionId, 'min_students' => 1, 'price_per_student_cents' => 0, 'created_at' => now(), 'updated_at' => now()]);

        $this->assertSame('EUR', DB::table('plan_prices')->value('currency'));
        $this->assertSame('EUR', DB::table('plan_pricing_tiers')->value('currency'));
    }
}
