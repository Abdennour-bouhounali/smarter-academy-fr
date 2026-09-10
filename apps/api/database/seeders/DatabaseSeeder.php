<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Ne crée AUCUNE donnée de démonstration : cette base porte de vrais
     * élèves et une vraie progression. Le seul amorçage nécessaire est
     * l'administrateur initial, et il est idempotent.
     *
     * (Auparavant, ce seeder appelait User::factory()->create(['name' => …]) —
     * or `name` n'est pas une colonne de cette table `users`, qui a
     * first_name/last_name : l'appel échouait.)
     */
    public function run(): void
    {
        $this->call(AdminUserSeeder::class);
    }
}
