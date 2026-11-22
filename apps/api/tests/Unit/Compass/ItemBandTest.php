<?php

namespace Tests\Unit\Compass;

use App\Domain\Compass\ItemBand;
use PHPUnit\Framework\TestCase;

/** ItemBand = port exact de itemProgress (engine.js) : même fixture, mêmes réponses. */
class ItemBandTest extends TestCase
{
    public function test_it_matches_the_shared_fixture(): void
    {
        $path = dirname(__DIR__, 5).'/packages/core/compass/fixtures/bands.json';
        $fixture = json_decode((string) file_get_contents($path), true);
        $this->assertNotEmpty($fixture['cases']);
        foreach ($fixture['cases'] as $i => $case) {
            $r = ItemBand::of($case['answers']);
            $this->assertSame($case['done'], $r['done'], "cas $i : done");
            $this->assertSame($case['band'], $r['band'], "cas $i : band");
            $this->assertSame($case['nextLevel'], $r['nextLevel'], "cas $i : nextLevel");
        }
    }
}
