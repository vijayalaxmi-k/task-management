import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Task, TaskPriority, TaskStatus } from '../types/Task';
import { createTask, updateTask } from '../api/tasks';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants/tasks';

interface TaskFormModalProps {
  task: Task | null;
  onClose: () => void;
  onSaved: (task: Task) => void;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
}

interface ApiValidationError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

function buildInitialState(task: Task | null): FormState {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'todo',
    priority: task?.priority ?? 'medium',
    due_date: task?.due_date ? task.due_date.slice(0, 10) : '',
  };
}

export default function TaskFormModal({
  task,
  onClose,
  onSaved,
}: TaskFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(task));
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function fieldError(name: string): string | undefined {
    return errors[name]?.[0];
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError('');
    setSubmitting(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date || null,
    };

    try {
      const saved = task
        ? await updateTask(task.id, payload)
        : await createTask(payload);
      onSaved(saved);
    } catch (err) {
      const response = (err as ApiValidationError).response;
      if (response?.status === 422 && response.data?.errors) {
        setErrors(response.data.errors);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="task-form-title" className="modal-title">
          {task ? 'Edit task' : 'New task'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              ref={titleRef}
              className="input"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              aria-invalid={Boolean(fieldError('title'))}
              aria-describedby={
                fieldError('title') ? 'task-title-error' : undefined
              }
              required
            />
            {fieldError('title') && (
              <p id="task-title-error" className="field-error" role="alert">
                {fieldError('title')}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className="textarea"
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              aria-invalid={Boolean(fieldError('description'))}
            />
            {fieldError('description') && (
              <p className="field-error" role="alert">
                {fieldError('description')}
              </p>
            )}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="select"
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as TaskStatus,
                  })
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="select"
                value={form.priority}
                onChange={(event) =>
                  setForm({
                    ...form,
                    priority: event.target.value as TaskPriority,
                  })
                }
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="task-due-date">Due date</label>
            <input
              id="task-due-date"
              type="date"
              className="input"
              value={form.due_date}
              onChange={(event) =>
                setForm({ ...form, due_date: event.target.value })
              }
              aria-invalid={Boolean(fieldError('due_date'))}
            />
            {fieldError('due_date') && (
              <p className="field-error" role="alert">
                {fieldError('due_date')}
              </p>
            )}
          </div>

          {formError && (
            <p className="alert alert-error" role="alert">
              {formError}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
