<?php

namespace App\Domain\Curriculum;

use Exception;

/**
 * Internal control-flow sentinel: thrown inside the import transaction when
 * --dry-run is set, so the transaction aborts (writing nothing) while the
 * computed summary still reaches the caller. Never escapes CurriculumImporter.
 */
class DryRunComplete extends Exception
{
    public function __construct(public readonly array $summary)
    {
        parent::__construct('dry-run complete');
    }
}
