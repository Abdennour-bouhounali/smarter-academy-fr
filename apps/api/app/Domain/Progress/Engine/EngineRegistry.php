<?php

namespace App\Domain\Progress\Engine;

use DomainException;

/**
 * version → moteur. La version qui ÉCRIT vient de config('mastery.engine_version') ;
 * un rejeu peut en demander une autre explicitement.
 */
final class EngineRegistry
{
    /** @var array<int, MasteryEngine> */
    private array $instances = [];

    public function current(): MasteryEngine
    {
        return $this->version((int) config('mastery.engine_version', 1));
    }

    public function version(int $version): MasteryEngine
    {
        if (isset($this->instances[$version])) {
            return $this->instances[$version];
        }

        $config = config("mastery.engines.{$version}");
        if (! is_array($config)) {
            throw new DomainException("Version de moteur de maîtrise inconnue : {$version}");
        }

        return $this->instances[$version] = match ($version) {
            1 => new EngineV1($config),
            2 => new EngineV2($config, (int) config('mastery.levels', 5)),
            default => throw new DomainException("Aucune implémentation pour le moteur de maîtrise v{$version}"),
        };
    }

    /** @return int[] */
    public function knownVersions(): array
    {
        return array_map('intval', array_keys(config('mastery.engines', [])));
    }
}
