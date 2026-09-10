<?php

namespace Database\Factories;

use App\Models\StudentReport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentReport>
 */
class StudentReportFactory extends Factory
{
    protected $model = StudentReport::class;

    public function definition(): array
    {
        $lessonCode = 'fractions';
        $moduleNumber = 1;
        $category = 'content_error';

        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_STUDENT]),
            'lesson_code' => $lessonCode,
            'module_number' => $moduleNumber,
            'category' => $category,
            'note' => $this->faker->sentence(),
            'status' => StudentReport::STATUS_NEW,
            'priority' => 'medium',
            'route' => "/courses/college/6e/nombres_calculs/{$lessonCode}",
            // Toujours cohérente avec les colonnes ci-dessus : une usine qui
            // produirait une empreinte arbitraire rendrait tout test
            // d'agrégation faux sans jamais échouer franchement.
            'fingerprint' => StudentReport::fingerprintFor([
                'lesson_code' => $lessonCode,
                'module_number' => $moduleNumber,
                'category' => $category,
            ]),
        ];
    }
}
