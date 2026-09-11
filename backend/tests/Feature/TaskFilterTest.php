<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TaskFilterTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_search_tasks_by_title(): void
    {
        $user = User::factory()->create();

        Task::factory()->for($user)->create([
            'title' => 'Prepare interview project',
        ]);

        Task::factory()->for($user)->create([
            'title' => 'Buy groceries',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tasks?search=interview');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Prepare interview project');
    }

    #[Test]
    public function user_can_search_tasks_by_description(): void
    {
        $user = User::factory()->create();

        Task::factory()->for($user)->create([
            'title' => 'Project',
            'description' => 'Finish Laravel implementation',
        ]);

        Task::factory()->for($user)->create([
            'title' => 'Shopping',
            'description' => 'Buy milk',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tasks?search=Laravel');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    #[Test]
    public function user_can_filter_tasks_by_status(): void
    {
        $user = User::factory()->create();

        Task::factory()->for($user)->create([
            'status' => 'todo',
        ]);

        Task::factory()->for($user)->create([
            'status' => 'done',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tasks?status=done');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'done');
    }

    #[Test]
    public function user_can_filter_tasks_by_priority(): void
    {
        $user = User::factory()->create();

        Task::factory()->for($user)->create([
            'priority' => 'high',
        ]);

        Task::factory()->for($user)->create([
            'priority' => 'low',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tasks?priority=high');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.priority', 'high');
    }

    #[Test]
    public function filters_can_be_combined(): void
    {
        $user = User::factory()->create();

        Task::factory()->for($user)->create([
            'title' => 'Important project',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        Task::factory()->for($user)->create([
            'title' => 'Important project',
            'status' => 'done',
            'priority' => 'high',
        ]);

        Task::factory()->for($user)->create([
            'title' => 'Other task',
            'status' => 'todo',
            'priority' => 'low',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tasks?search=Important&status=todo&priority=high');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Important project');
    }

    #[Test]
    public function user_only_sees_their_own_tasks(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Task::factory()->for($user)->create([
            'title' => 'My task',
        ]);

        Task::factory()->for($otherUser)->create([
            'title' => 'Other users task',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/tasks');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'My task');
    }
}
