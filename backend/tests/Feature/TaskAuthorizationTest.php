<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TaskAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_cannot_view_another_users_task(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $task = Task::factory()->for($owner)->create();

        $this->actingAs($otherUser)
            ->getJson("/api/tasks/{$task->id}")
            ->assertForbidden();
    }

    #[Test]
    public function user_cannot_update_another_users_task(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $task = Task::factory()->for($owner)->create();

        $this->actingAs($otherUser)
            ->putJson("/api/tasks/{$task->id}", [
                'title' => 'Hacked task',
                'description' => null,
                'status' => 'todo',
                'priority' => 'medium',
                'due_date' => null,
            ])
            ->assertForbidden();
    }

    #[Test]
    public function user_cannot_delete_another_users_task(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $task = Task::factory()->for($owner)->create();

        $this->actingAs($otherUser)
            ->deleteJson("/api/tasks/{$task->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
        ]);
    }
}
