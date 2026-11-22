<?php

namespace Database\Factories;

use App\Models\Chapter;
use App\Models\Grade;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Chapter> */
class ChapterFactory extends Factory
{
    protected $model = Chapter::class;

    public function definition(): array
    {
        return [
            'grade_id' => Grade::factory(),
            'code' => 'ansab_'.fake()->unique()->lexify('????'),
            'title' => 'أنشطة عددية',
            'order' => 0,
        ];
    }
}
