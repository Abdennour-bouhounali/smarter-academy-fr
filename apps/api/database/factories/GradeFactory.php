<?php

namespace Database\Factories;

use App\Models\Grade;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Grade> */
class GradeFactory extends Factory
{
    protected $model = Grade::class;

    public function definition(): array
    {
        return [
            'code' => '4am',
            'name' => 'السنة الرابعة متوسط',
            'level' => 'moyen',
            'order' => 1,
            'is_active' => true,
        ];
    }
}
