<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TaskCrudTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function authenticated_user_can_create_a_task(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/tasks', [
            'title' => 'Complete take-home assignment',
            'description' => 'Finish the task management feature.',
            'status' => 'todo',
            'priority' => 'high',
            'due_date' => '2026-09-20',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.title', 'Complete take-home assignment');

        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'title' => 'Complete take-home assignment',
            'priority' => 'high',
        ]);
    }

    #[Test]
    public function task_creation_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/tasks', []);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'status',
                'priority',
            ]);
    }

    #[Test]
    public function authenticated_user_can_update_a_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        $response = $this->actingAs($user)
            ->putJson("/api/tasks/{$task->id}", [
                'title' => 'Updated task',
                'description' => 'Updated description',
                'status' => 'in_progress',
                'priority' => 'medium',
                'due_date' => '2026-09-25',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated task')
            ->assertJsonPath('data.status', 'in_progress');
    }

    #[Test]
    public function authenticated_user_can_delete_a_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        $this->actingAs($user)
            ->deleteJson("/api/tasks/{$task->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    #[Test]
    public function authenticated_user_can_update_task_status(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create([
            'status' => 'todo',
        ]);

        $this->actingAs($user)
            ->patchJson("/api/tasks/{$task->id}/status", [
                'status' => 'done',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'done');
    }
}
