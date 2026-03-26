<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_landing_page_route_exists(): void
    {
        $response = $this->get('/');

        $this->assertNotEquals(404, $response->status());
    }

    public function test_health_endpoint_route_exists(): void
    {
        $response = $this->getJson('/api/v1/health');

        $this->assertNotEquals(404, $response->status());
    }
}
