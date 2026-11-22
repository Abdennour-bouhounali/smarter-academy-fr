<?php

namespace Tests\Feature;

use App\Models\Plan;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * CE QUE L'UTILISATEUR LIT EST ARABE — y compris le nom des offres.
 *
 * Le nom et la description d'une offre sont rendus tels quels dans l'espace
 * de l'enseignant (« عرضي ») et de l'élève : ils appartiennent au catalogue
 * arabe, pas au vocabulaire interne (le `slug`, lui, reste latin).
 * ARABIC_RTL_CONTRACT.md §2.
 */
class PlanSeederLanguageTest extends TestCase
{
    use RefreshDatabase;

    public function test_les_offres_semees_sont_nommees_en_arabe(): void
    {
        $this->seed(PlanSeeder::class);

        $plans = Plan::all();
        $this->assertGreaterThan(0, $plans->count());

        foreach ($plans as $plan) {
            foreach (['name' => $plan->name, 'description' => $plan->description] as $field => $text) {
                $this->assertNotNull($text, "{$plan->slug}.{$field} est vide.");
                $this->assertMatchesRegularExpression('/\p{Arabic}/u', $text, "{$plan->slug}.{$field} ne contient pas d'arabe : {$text}");
                // Aucun mot français : le catalogue est arabe, sans exception.
                $this->assertDoesNotMatchRegularExpression(
                    '/\b(Enseignant|Élève|Gratuit|classes?|élèves?|leçons?|Jusqu)\b/iu',
                    $text,
                    "{$plan->slug}.{$field} contient du français : {$text}"
                );
            }
            // Le slug, lui, reste un identifiant latin en minuscules.
            $this->assertMatchesRegularExpression('/^[a-z0-9-]+$/', $plan->slug);
        }
    }
}
