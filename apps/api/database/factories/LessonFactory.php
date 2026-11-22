<?php

namespace Database\Factories;

use App\Models\Chapter;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Usine de TEST : une leçon PUBLIÉE et GRATUITE, dans un chapitre neuf.
 *
 * @extends Factory<Lesson>
 */
class LessonFactory extends Factory
{
    protected $model = Lesson::class;

    public function definition(): array
    {
        return [
            'chapter_id' => Chapter::factory(),
            'code' => 'lesson-'.fake()->unique()->lexify('??????'),
            'title' => 'درس تجريبي',
            'status' => 'available',
            'order' => 0,
            'tier' => 'free',
            'publication_status' => Lesson::PUB_PUBLISHED,
        ];
    }

    public function inChapter(Chapter $chapter): static
    {
        return $this->state(['chapter_id' => $chapter->id]);
    }

    public function hidden(): static
    {
        return $this->state(['publication_status' => Lesson::PUB_HIDDEN]);
    }

    public function draft(): static
    {
        return $this->state(['publication_status' => Lesson::PUB_DRAFT]);
    }

    public function premium(): static
    {
        return $this->state(['tier' => 'premium']);
    }
}
