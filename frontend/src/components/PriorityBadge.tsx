import type { TaskPriority } from '../types/Task';
import { PRIORITY_LABELS } from '../constants/tasks';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`badge badge-priority-${priority}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
