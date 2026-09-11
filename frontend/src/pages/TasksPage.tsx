import { useCallback, useEffect, useState } from 'react';
import type { Task, TaskPriority, TaskStatus } from '../types/Task';
import type { TaskFilters } from '../api/tasks';
import { deleteTask, getTasks, updateTaskStatus } from '../api/tasks';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants/tasks';
import PriorityBadge from '../components/PriorityBadge';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

function formatDueDate(value: string | null): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'done') return false;

  const due = new Date(task.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return due.getTime() < today.getTime();
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(
    null,
  );

  const fetchTasks = useCallback(async (filters: TaskFilters) => {
    setLoading(true);
    setError('');

    try {
      const data = await getTasks(filters);
      setTasks(data);
    } catch {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTasks({
        search: searchInput || undefined,
        status: status || undefined,
        priority: priority || undefined,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput, status, priority, fetchTasks]);

  const hasActiveFilters = Boolean(searchInput || status || priority);

  function handleResetFilters() {
    setSearchInput('');
    setStatus('');
    setPriority('');
  }

  function handleAddTask() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleTaskSaved(task: Task) {
    setTasks((prev) => {
      const exists = prev.some((item) => item.id === task.id);
      return exists
        ? prev.map((item) => (item.id === task.id ? task : item))
        : [task, ...prev];
    });
    setFormOpen(false);
    setEditingTask(null);
  }

  async function handleStatusChange(task: Task, newStatus: TaskStatus) {
    setUpdatingStatusId(task.id);

    try {
      const updated = await updateTaskStatus(task.id, newStatus);
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updated : item)),
      );
    } catch {
      setError('Failed to update task status.');
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingTask) return;

    setDeleteLoading(true);

    try {
      await deleteTask(deletingTask.id);
      setTasks((prev) => prev.filter((item) => item.id !== deletingTask.id));
      setDeletingTask(null);
    } catch {
      setError('Failed to delete task.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const doneCount = tasks.filter((task) => task.status === 'done').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">
            {loading
              ? 'Loading tasks…'
              : `${tasks.length} task${tasks.length === 1 ? '' : 's'} · ${doneCount} completed`}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAddTask}>
          + Add task
        </button>
      </div>

      <div className="filters-bar">
        <div className="field field-search">
          <label htmlFor="task-search" className="sr-only">
            Search tasks
          </label>
          <input
            id="task-search"
            type="search"
            className="input"
            placeholder="Search tasks…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            className="select"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as TaskStatus | '')
            }
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="priority-filter" className="sr-only">
            Filter by priority
          </label>
          <select
            id="priority-filter"
            className="select"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TaskPriority | '')
            }
          >
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button type="button" className="btn btn-ghost" onClick={handleResetFilters}>
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="state-panel">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="state-panel">
          <p className="state-title">
            {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
          </p>
          <p className="state-message">
            {hasActiveFilters
              ? 'Try adjusting or clearing your filters.'
              : 'Get started by creating your first task.'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
            >
              Clear filters
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleAddTask}>
              + Add task
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Priority</th>
                <th scope="col">Due date</th>
                <th scope="col" className="col-actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td data-label="Title">
                    <div className="task-title">{task.title}</div>
                    {task.description && (
                      <div className="task-description">
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td data-label="Status">
                    <select
                      className={`status-select status-select-${task.status}`}
                      aria-label={`Change status for ${task.title}`}
                      value={task.status}
                      disabled={updatingStatusId === task.id}
                      onChange={(event) =>
                        handleStatusChange(
                          task,
                          event.target.value as TaskStatus,
                        )
                      }
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td data-label="Priority">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td data-label="Due date">
                    <span
                      className={
                        isOverdue(task) ? 'due-date due-date-overdue' : 'due-date'
                      }
                    >
                      {formatDueDate(task.due_date)}
                    </span>
                  </td>
                  <td data-label="Actions" className="col-actions">
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger-ghost btn-sm"
                        onClick={() => setDeletingTask(task)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <TaskFormModal
          task={editingTask}
          onClose={() => setFormOpen(false)}
          onSaved={handleTaskSaved}
        />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Delete task"
          message={`Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          loading={deleteLoading}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </div>
  );
}
