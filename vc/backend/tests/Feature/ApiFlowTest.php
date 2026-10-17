<?php

namespace Tests\Feature;

use App\Models\Opportunity;
use App\Models\Signup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiFlowTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $over = []): array
    {
        return array_merge([
            'title' => 'Beach Cleanup',
            'category' => 'Environment',
            'date' => '2026-12-01',
            'start_time' => '09:00',
            'end_time' => '12:30',
            'location' => 'Manila Bay',
            'slots' => 2,
            'description' => 'Pick up trash along the shore.',
            'skills' => 'Teamwork',
            'requirements' => "Closed shoes\nWater bottle",
            'status' => 'draft',
        ], $over);
    }

    public function test_unauthenticated_api_call_is_401_json_even_without_accept_header(): void
    {
        $this->get('/api/me')->assertStatus(401)->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_register_normalises_email_and_blocks_admin_role(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Ana', 'email' => 'Ana@Example.COM', 'password' => 'secret123',
            'password_confirmation' => 'secret123', 'role' => 'volunteer',
        ])->assertCreated()->assertJsonPath('user.email', 'ana@example.com');

        $this->postJson('/api/login', ['email' => 'ANA@example.com', 'password' => 'secret123'])
            ->assertOk()->assertJsonStructure(['token']);

        $this->postJson('/api/register', [
            'name' => 'Evil', 'email' => 'evil@example.com', 'password' => 'secret123',
            'password_confirmation' => 'secret123', 'role' => 'admin',
        ])->assertStatus(422);
    }

    public function test_organization_can_save_a_draft_with_skills_and_requirements(): void
    {
        $org = User::factory()->create(['role' => 'organization']);
        Sanctum::actingAs($org);

        $res = $this->postJson('/api/opportunities', $this->payload())->assertCreated();
        $res->assertJsonPath('status', 'draft')
            ->assertJsonPath('skills', 'Teamwork')
            ->assertJsonPath('hours', 4);
        $this->assertSame("Closed shoes\nWater bottle", Opportunity::first()->requirements);
    }

    public function test_drafts_are_hidden_from_the_public_but_visible_to_owner(): void
    {
        $org = User::factory()->create(['role' => 'organization']);
        $opp = $org->opportunities()->create($this->payload() + ['hours' => 4]);

        $this->getJson('/api/opportunities')->assertJsonPath('total', 0);
        $this->getJson("/api/opportunities/{$opp->id}")->assertNotFound();

        Sanctum::actingAs($org);
        $this->getJson("/api/opportunities/{$opp->id}")->assertOk();
    }

    public function test_org_dashboard_returns_totals(): void
    {
        $org = User::factory()->create(['role' => 'organization']);
        $vol = User::factory()->create(['role' => 'volunteer']);
        $opp = $org->opportunities()->create($this->payload(['status' => 'active']) + ['hours' => 4]);
        Signup::create(['user_id' => $vol->id, 'opportunity_id' => $opp->id]);

        Sanctum::actingAs($org);
        $this->getJson('/api/org/opportunities')->assertOk()->assertJsonPath('totals', [
            'posted' => 1, 'volunteers' => 1, 'hours' => 0, 'pending' => 1,
        ]);
    }

    public function test_signup_full_verify_and_review_flow(): void
    {
        $org = User::factory()->create(['role' => 'organization']);
        $a = User::factory()->create(['role' => 'volunteer']);
        $b = User::factory()->create(['role' => 'volunteer']);
        $opp = $org->opportunities()->create($this->payload(['slots' => 1, 'status' => 'active']) + ['hours' => 4]);

        Sanctum::actingAs($a);
        $signupId = $this->postJson("/api/opportunities/{$opp->id}/signup")->assertCreated()->json('id');
        $this->postJson("/api/opportunities/{$opp->id}/signup")->assertStatus(409);

        Sanctum::actingAs($b);
        $this->postJson("/api/opportunities/{$opp->id}/signup")->assertStatus(409); // full

        // Feedback is locked until hours are verified.
        Sanctum::actingAs($a);
        $this->postJson("/api/opportunities/{$opp->id}/reviews", ['rating' => 5])->assertForbidden();

        Sanctum::actingAs($org);
        $this->postJson("/api/signups/{$signupId}/complete")->assertOk()->assertJsonPath('hours', 4);
        $this->postJson("/api/signups/{$signupId}/complete")->assertOk(); // idempotent
        $this->assertSame(1, $a->notifications()->where('title', 'Volunteer hours verified')->count());

        Sanctum::actingAs($a);
        $this->postJson("/api/opportunities/{$opp->id}/reviews", ['rating' => 5, 'comment' => 'Great'])->assertCreated();
        $this->getJson("/api/opportunities/{$opp->id}/reviews")->assertJsonPath('average', 5);
    }

    public function test_admin_endpoints_require_admin_role(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'organization']));
        $this->getJson('/api/admin/summary')->assertForbidden();

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->getJson('/api/admin/summary')->assertOk()->assertJsonStructure(['users', 'opportunities']);
    }

    public function test_cors_allows_netlify_and_localhost_origins(): void
    {
        foreach (['https://my-site.netlify.app', 'http://localhost:5173'] as $origin) {
            $this->call('OPTIONS', '/api/login', [], [], [], [
                'HTTP_ORIGIN' => $origin,
                'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            ])->assertHeader('Access-Control-Allow-Origin', $origin);
        }
    }
}
