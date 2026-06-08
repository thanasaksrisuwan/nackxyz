<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Project;

class DashboardTest extends TestCase
{
    public function test_portfolio_page_renders_successfully()
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Portfolio');
    }

    public function test_contact_form_submission_success()
    {
        $response = $this->postJson('/contact', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'Inquiry',
            'message' => 'Hello there!',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Your message has been sent successfully!']);
    }

    public function test_contact_form_submission_honeypot_ignores()
    {
        $response = $this->postJson('/contact', [
            'name' => 'Spam Bot',
            'email' => 'spam@example.com',
            'subject' => 'Buy pills',
            'message' => 'Spam message',
            'honey' => 'i_am_a_bot',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Your message has been sent successfully!']);
    }
}
