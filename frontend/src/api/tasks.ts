import api from './axios';
import type { Task, TaskPriority, TaskStatus } from '../types/Task';

interface TaskResponse {
  data: Task;
}

interface TasksResponse {
  data: Task[];
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export async function getTasks(
  filters: TaskFilters = {},
): Promise<Task[]> {
  const response = await api.get<TasksResponse>('/tasks', {
    params: filters,
  });

  return response.data.data;
}

export async function createTask(
  task: Omit<Task, 'id' | 'created_at' | 'updated_at'>,
): Promise<Task> {
  const response = await api.post<TaskResponse>('/tasks', task);

  return response.data.data;
}

export async function updateTask(
  id: number,
  task: Omit<Task, 'id' | 'created_at' | 'updated_at'>,
): Promise<Task> {
  const response = await api.put<TaskResponse>(`/tasks/${id}`, task);

  return response.data.data;
}

export async function updateTaskStatus(
  id: number,
  status: TaskStatus,
): Promise<Task> {
  const response = await api.patch<TaskResponse>(
    `/tasks/${id}/status`,
    { status },
  );

  return response.data.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}