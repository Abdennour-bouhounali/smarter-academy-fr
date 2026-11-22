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
            'code' => '3e',
            'name' => 'Troisième',
            'level' => 'college',
            'order' => 1,
            'is_active' => true,
        ];
    }
}
