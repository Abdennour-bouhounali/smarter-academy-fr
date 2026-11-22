<?php

namespace App\Domain\Compass;

use RuntimeException;

/** Une règle de « بوصلتي » refusée — rendue en JSON `{ success: false, code }` par le contrôleur. */
final class CompassError extends RuntimeException
{
    public function __construct(public readonly string $errorCode, public readonly int $status = 422, public readonly array $extra = [])
    {
        parent::__construct($errorCode);
    }
}
