<?php

namespace App\Domain\Diagnostic\Contracts;

/**
 * SHARED ENGINE + GRADE-SPECIFIC CONFIGURATION: DiagnosticEngine never
 * hardcodes 6e-specific skills, questions, or lessons — everything it needs
 * comes from an implementation of this contract, resolved by grade id
 * (see DiagnosticEngine::providerFor()). Adding a 5e diagnostic later means
 * writing one new class that implements this interface (see
 * Grades/SixiemeDiagnosticProvider.php for the reference implementation)
 * and registering it — no change to the engine, controller, migrations, or
 * frontend question renderers.
 */
interface GradeDiagnosticProvider
{
    /** The grade id this provider serves, e.g. '6e' — matches packages/core's grade catalogue. */
    public function grade(): string;

    /**
     * The competency graph: every skill this diagnostic can assess.
     *
     * @return array<string, array{
     *   label: string,
     *   tier: int,
     *   importance: 'critical'|'standard',
     *   prerequisites: string[],
     *   lessonId: string,
     *   moduleNumber: int,
     * }> keyed by skill id.
     */
    public function skills(): array;

    /**
     * The question bank. Every question must reference a skill id present
     * in skills(). Content, not code — see the shape documented on
     * SixiemeDiagnosticProvider's QUESTIONS constant.
     *
     * @return array<string, array> keyed by question id.
     */
    public function questions(): array;

    /**
     * Maps a skill id to the exact lesson + module a student should start
     * at if that skill comes back as a gap — the "personalized starting
     * point," not just a lesson index page.
     *
     * @return array{lessonId: string, lessonPath: string, moduleNumber: int, moduleTitle: string}
     */
    public function startingPointFor(string $skillId): array;
}
