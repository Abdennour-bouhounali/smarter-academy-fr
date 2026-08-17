<?php

namespace Tests\Feature;

use Tests\TestCase;

class SetupDatabaseRouteRemovedTest extends TestCase
{
    /**
     * The unauthenticated /api/v1/setup-database route (which ran migrate:fresh
     * and created a hardcoded admin account) must never exist again.
     */
    public function test_setup_database_route_no_longer_exists(): void
    {
        $response = $this->get('/api/v1/setup-database');

        $response->assertStatus(404);
    }
}
