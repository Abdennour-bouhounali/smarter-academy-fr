<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * « الوصول والحدود » — ce que chaque PALIER (free / premium) peut faire d'une
 * fonctionnalité : un instrument du مختبر, le cahier, les travaux enregistrés.
 *
 * UNE ligne par fonctionnalité, les DEUX paliers en colonnes : un palier
 * manquant est donc impossible par construction (AccessTier est clos à deux
 * valeurs). Le vocabulaire des clés est dans le code
 * (App\Domain\Access\Features\FeatureRegistry) ; les VALEURS sont ici, et
 * l'administration les change sans déploiement.
 *
 *   is_enabled        interrupteur global : false ferme la fonctionnalité à
 *                     tout le monde, enseignants compris
 *   *_allowed         le palier peut-il s'en servir ?
 *   *_quota           combien d'unités par période ; NULL = illimité (la
 *                     convention du projet, cf. EntitlementKeys). L'API parle
 *                     `unlimited: true`, jamais d'un « grand nombre »
 *   quota_period      month | lifetime — la fenêtre de consommation
 *
 * Les valeurs INITIALES insérées ci-dessous sont un point de départ, pas des
 * règles (docs/architecture/ACCESS_AND_LIMITS.md §« Valeurs initiales »).
 * Le déploiement ne lance pas de seeder : c'est pourquoi elles vivent dans la
 * migration, qui ne les écrit qu'une fois.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feature_access_policies', function (Blueprint $table) {
            $table->id();
            $table->string('feature_key', 80)->unique();
            $table->boolean('is_enabled')->default(true);
            $table->boolean('free_allowed')->default(true);
            $table->boolean('premium_allowed')->default(true);
            $table->unsignedInteger('free_quota')->nullable();
            $table->unsignedInteger('premium_quota')->nullable();
            $table->string('quota_period', 16)->default('month');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        $now = now();
        $row = fn (string $key, bool $free, bool $premium = true, ?int $freeQuota = null, ?int $premiumQuota = null) => [
            'feature_key' => $key,
            'is_enabled' => true,
            'free_allowed' => $free,
            'premium_allowed' => $premium,
            'free_quota' => $freeQuota,
            'premium_quota' => $premiumQuota,
            'quota_period' => 'month',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        // Les instruments ANCRÉS dans le programme de 4AM restent gratuits ;
        // ceux qui vont AU-DELÀ (suites, coniques, analyse, logique — « hors
        // programme, à un clic », MATH_LAB.md) demandent le palier premium.
        $free = ['whiteboard', 'functionGrapher', 'geometry3d', 'probabilityStats', 'algebra', 'vectors',
            'trigonometry', 'transformations', 'numberLab', 'measurement'];
        $premiumOnly = ['sequences', 'conics', 'analysis', 'logic'];

        $rows = [];
        foreach ($free as $tool) {
            $rows[] = $row("math_lab.tool.{$tool}", true);
        }
        foreach ($premiumOnly as $tool) {
            $rows[] = $row("math_lab.tool.{$tool}", false);
        }
        // Le cahier : ouvert aux deux paliers ; 50 nouvelles notes par mois
        // en gratuit, sans limite en premium.
        $rows[] = $row('notebook', true, true, 50, null);
        // Les travaux enregistrés du مختبر : 10 nouveaux par mois en gratuit,
        // sans limite en premium.
        $rows[] = $row('math_lab.documents', true, true, 10, null);

        DB::table('feature_access_policies')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_access_policies');
    }
};
