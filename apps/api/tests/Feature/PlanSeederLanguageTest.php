<?php

namespace Tests\Feature;

use App\Models\Plan;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * CE QUE L'UTILISATEUR LIT EST FRANÇAIS — y compris le nom des formules.
 *
 * Le nom et la description d'une formule sont rendus tels quels dans l'espace
 * du professeur et de l'élève : ils appartiennent au catalogue français, pas
 * au vocabulaire interne (le `slug`, lui, reste un identifiant latin).
 * FRENCH_LANGUAGE_CONTRACT.md.
 */
class PlanSeederLanguageTest extends TestCase
{
    use RefreshDatabase;

    public function test_les_formules_semees_sont_nommees_en_francais(): void
    {
        $this->seed(PlanSeeder::class);

        $plans = Plan::all();
        $this->assertGreaterThan(0, $plans->count());

        foreach ($plans as $plan) {
            foreach (['name' => $plan->name, 'description' => $plan->description] as $field => $text) {
                $this->assertNotNull($text, "{$plan->slug}.{$field} est vide.");
                $this->assertNotSame('', trim((string) $text), "{$plan->slug}.{$field} est vide.");
                $this->assertDoesNotMatchRegularExpression('/\p{Arabic}/u', $text, "{$plan->slug}.{$field} contient de l'arabe : {$text}");
                // Du français : des lettres latines, et le vocabulaire du contrat.
                $this->assertMatchesRegularExpression('/\p{Latin}/u', $text);
                $this->assertDoesNotMatchRegularExpression('/\b(offre|plan|enseignant|groupe)\b/iu', $text, "{$plan->slug}.{$field} n'emploie pas le vocabulaire du contrat : {$text}");
            }
            $this->assertMatchesRegularExpression('/\b(Professeur|Élève)\b/u', $plan->name);
            // Le slug, lui, reste un identifiant latin en minuscules.
            $this->assertMatchesRegularExpression('/^[a-z0-9-]+$/', $plan->slug);
        }
    }

    /** L'euro partout ; un seul prix connu (l'élève, 35 € par an), les autres attendent le propriétaire. */
    public function test_les_formules_semees_sont_en_euros(): void
    {
        $this->seed(PlanSeeder::class);

        foreach (Plan::with('currentVersion.activePrice', 'currentVersion.pricingTiers')->get() as $plan) {
            $this->assertSame('EUR', $plan->currentVersion->activePrice->currency, $plan->slug);
            foreach ($plan->currentVersion->pricingTiers as $tier) {
                $this->assertSame('EUR', $tier->currency, $plan->slug);
                $this->assertSame(PlanSeeder::PRICE_TO_BE_DECIDED_BY_OWNER, $tier->min_students <= 5 ? 0 : $tier->price_per_student_cents);
            }
        }
        $student = Plan::where('slug', 'student-premium')->with('currentVersion.activePrice')->firstOrFail();
        $this->assertSame(3500, $student->currentVersion->activePrice->amount_cents);
        $this->assertSame(config('billing.plans.annual.amount_cents'), $student->currentVersion->activePrice->amount_cents);
    }
}
