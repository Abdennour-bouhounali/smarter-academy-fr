<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The suite reads a small NEUTRAL content tree of its own, never the
        // product's content/ (emptied for the French rebuild, then regenerated
        // lesson by lesson): a test must not change when the bank does.
        $content = base_path('tests/Fixtures/content');
        config([
            'practice.content_path' => $content.'/practice',
            'practice.active_lessons_path' => $content.'/practice/active.json',
            'class_session.content_path' => $content.'/class-tests',
            'compass.index_path' => $content.'/compass/index.generated.json',
        ]);
    }
}
